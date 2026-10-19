import assert from 'node:assert/strict';
import test from 'node:test';
import { createDefaultProject } from '../engine/fdg/catalog.js';
import { analyzeProject, applyRecommendation } from '../engine/fdg/optimization.js';
import { ProjectStore } from '../engine/fdg/project.js';

const MIB = 1024 * 1024;
const sheet = (src = 'shared.png', columns = 4, rows = 6) => ({ src, frameWidth: 16, frameHeight: 8, columns, rows, frames: 24, fps: 24 });
const character = sprite => ({ id: 'hero', name: 'Hero', sprite, animations: {
  idle: { row: 0, start: 0, frames: 24, fps: 24 },
  walk: { row: 0, start: 0, frames: 24, fps: 24 },
  attack: { row: 0, start: 0, frames: 24, fps: 24 },
} });
const effect = (id = 'fire', count = 32, sprite) => ({ id, name: id, count, life: .7, speed: 120, size: 8, sprite });
const hasIssue = (report, code) => report.issues.some(issue => issue.code === code);
const empty = () => ({ characters: [], vfx: [], characterDrafts: [], map: { objects: [] } });

test('Empty authoring data returns the complete finite report without requiring geometry', () => {
  const project = empty(), before = structuredClone(project), report = analyzeProject(project);
  assert.deepEqual(report, {
    settings: { concurrentBursts: 4, particleBudget: 80, textureBudgetMiB: 128, maxTextureDimension: 4096 },
    assets: [], memory: { runtimeBytes: 0, referenceBytes: 0, unknownRuntimeAssets: [] },
    effects: [], issues: [], recommendations: [], characterTargets: { frames: 24, fps: 24 },
  });
  assert.deepEqual(project, before);
  assert.deepEqual(analyzeProject({}), report);
});

test('Normalized sprite, directions and map paths share one runtime allocation and retain owners', () => {
  const sprite = { ...sheet('/shared.png'), directions: { south: 'shared.png', east: '/east.png', west: 'east.png' } };
  const project = { ...empty(), characters: [character(sprite)], vfx: [effect('same', 10, sheet('shared.png'))], map: {
    groundSrc: '/shared.png', objects: [{ id: 'tree', src: 'east.png' }, { id: 'tree2', src: '/east.png' }],
  } };
  const before = structuredClone(project), report = analyzeProject(project);
  assert.equal(report.assets.length, 2);
  assert.equal(report.memory.runtimeBytes, 2 * 64 * 48 * 4);
  assert.deepEqual(report.memory.unknownRuntimeAssets, []);
  const shared = report.assets.find(asset => asset.src === 'shared.png');
  assert.equal(shared.dimensionSource, 'declared');
  assert.equal(shared.owners.length, 4, 'src + south + VFX + ground identify all users');
  assert.ok(shared.owners.includes('map.groundSrc'));
  assert.ok(report.assets.find(asset => asset.src === 'east.png').owners.includes('map.objects[tree2].src'));
  assert.deepEqual(project, before);
});

test('Decoded normalized dimensions replace declarations and warn on actual layout mismatch', () => {
  const project = { ...empty(), characters: [character(sheet('/hero.png'))] };
  const images = { '/hero.png': { width: 128, height: 96 } }, before = structuredClone(images);
  const report = analyzeProject(project, { images }), asset = report.assets[0];
  assert.deepEqual([asset.width, asset.height, asset.rgbaBytes, asset.dimensionSource], [128, 96, 49_152, 'decoded']);
  assert.equal(report.memory.runtimeBytes, 49_152);
  assert.ok(hasIssue(report, 'decoded-declared-mismatch'));
  assert.ok(asset.issues.some(issue => issue.code === 'decoded-declared-mismatch'));
  assert.deepEqual(images, before);
});

test('Unknown map images remain null estimates and are listed once rather than declared zero bytes', () => {
  const project = { ...empty(), map: { groundSrc: 'ground.png', objects: [{ src: '/tree.png' }, { src: 'tree.png' }] } };
  const report = analyzeProject(project);
  assert.deepEqual(report.memory, { runtimeBytes: 0, referenceBytes: 0, unknownRuntimeAssets: ['ground.png', 'tree.png'] });
  assert.equal(report.assets.length, 2);
  assert.ok(report.assets.every(asset => asset.width === null && asset.height === null && asset.rgbaBytes === null && asset.dimensionSource === 'unknown'));
  assert.equal(report.issues.filter(issue => issue.code === 'unknown-image-dimensions').length, 2);
  const decoded = analyzeProject(project, { images: { 'ground.png': { width: 32, height: 16 }, 'tree.png': { width: 12, height: 24 } } });
  assert.deepEqual(decoded.memory.unknownRuntimeAssets, []);
  assert.equal(decoded.memory.runtimeBytes, (32 * 16 + 12 * 24) * 4);
});

test('Reference clips and stills use a separate memory scope and runtime use wins a shared path', () => {
  const project = { ...empty(), characters: [character(sheet('shared.png'))], characterDrafts: [
    { id: 'draft', clip: sheet('/shared.png'), referenceSrc: 'original.png' },
    { id: 'draft2', clip: sheet('reference.png'), referenceSrc: '/original.png' },
  ] };
  const report = analyzeProject(project, { images: { 'original.png': { width: 100, height: 50 } } });
  assert.equal(report.assets.length, 3);
  assert.equal(report.assets.find(asset => asset.src === 'shared.png').scope, 'runtime');
  assert.equal(report.assets.find(asset => asset.src === 'shared.png').owners.length, 2);
  assert.equal(report.memory.runtimeBytes, 64 * 48 * 4);
  assert.equal(report.memory.referenceBytes, 64 * 48 * 4 + 100 * 50 * 4);
  assert.deepEqual(report.memory.unknownRuntimeAssets, []);
});

test('Undecoded reference originals report unknown without contaminating runtime unknown paths', () => {
  const report = analyzeProject({ ...empty(), characterDrafts: [{ id: 'draft', clip: sheet('clip.png'), referenceSrc: 'original.png' }] });
  assert.equal(report.memory.referenceBytes, 64 * 48 * 4);
  assert.deepEqual(report.memory.unknownRuntimeAssets, []);
  assert.equal(report.assets.find(asset => asset.src === 'original.png').dimensionSource, 'unknown');
  assert.ok(report.issues.some(issue => issue.code === 'unknown-image-dimensions' && issue.message.includes('reference')));
});

test('Runtime and reference budgets are evaluated separately even when combined bytes exceed the budget', () => {
  const project = { ...empty(), map: { groundSrc: 'runtime.png', objects: [] }, characterDrafts: [{
    id: 'draft', clip: sheet('ref.png'), referenceSrc: 'ref.png',
  }] };
  const images = { 'runtime.png': { width: 128, height: 128 }, 'ref.png': { width: 128, height: 128 } };
  const under = analyzeProject(project, { images, textureBudgetMiB: .08 });
  assert.equal(under.memory.runtimeBytes + under.memory.referenceBytes, .125 * MIB);
  assert.equal(hasIssue(under, 'runtime-memory-budget'), false);
  assert.equal(hasIssue(under, 'reference-memory-budget'), false);
  const over = analyzeProject(project, { images, textureBudgetMiB: .05 });
  assert.ok(hasIssue(over, 'runtime-memory-budget'));
  assert.ok(hasIssue(over, 'reference-memory-budget'));
  assert.equal(over.assets.filter(asset => asset.issues.some(issue => issue.code === 'asset-memory-budget')).length, 2);
});

test('Sheet dimension target is configurable and exact boundaries do not warn', () => {
  const project = { ...empty(), map: { groundSrc: 'wide.png', objects: [] } }, images = { 'wide.png': { width: 4096, height: 1 } };
  assert.equal(hasIssue(analyzeProject(project, { images }), 'texture-dimension-budget'), false);
  assert.equal(hasIssue(analyzeProject(project, { images, maxTextureDimension: 2048 }), 'texture-dimension-budget'), true);
  assert.equal(hasIssue(analyzeProject(project, { images, maxTextureDimension: 8192 }), 'texture-dimension-budget'), false);
});

test('Conflicting declarations use the largest estimate until decode and expose the conflict', () => {
  const project = { ...empty(), characters: [character(sheet('shared.png', 2, 12))], vfx: [effect('fx', 10, sheet('/shared.png', 8, 6))] };
  const report = analyzeProject(project);
  assert.equal(report.assets.length, 1);
  assert.equal(report.memory.runtimeBytes, 128 * 48 * 4);
  assert.ok(hasIssue(report, 'declared-dimension-conflict'));
  const decoded = analyzeProject(project, { images: { 'shared.png': { width: 32, height: 96 } } });
  assert.equal(decoded.memory.runtimeBytes, 32 * 96 * 4);
  assert.ok(hasIssue(decoded, 'decoded-declared-mismatch'));
});

test('Invalid settings fall back individually and never leak NaN or Infinity into the report', () => {
  const report = analyzeProject(empty(), { concurrentBursts: 0, particleBudget: NaN, textureBudgetMiB: Infinity, maxTextureDimension: '8192' });
  assert.deepEqual(report.settings, { concurrentBursts: 4, particleBudget: 80, textureBudgetMiB: 128, maxTextureDimension: 4096 });
  assert.equal(report.issues.filter(issue => issue.code === 'invalid-setting' && issue.severity === 'error').length, 4);
  for (const options of [null, [], 12, 'settings']) assert.ok(hasIssue(analyzeProject(empty(), options), 'invalid-settings'));
  for (const value of [-1, .5, Number.MAX_SAFE_INTEGER + 1, true]) {
    assert.equal(analyzeProject(empty(), { concurrentBursts: value }).settings.concurrentBursts, 4);
  }
  assert.equal(analyzeProject(empty(), { textureBudgetMiB: .25 }).settings.textureBudgetMiB, .25);
});

test('Malformed decode metadata falls back to a sheet declaration and unsafe bytes remain unknown', () => {
  const project = { ...empty(), characters: [character(sheet('hero.png'))], map: { groundSrc: 'too-big.png', objects: [] } };
  for (const images of [{ 'hero.png': { width: 0, height: 48 } }, { 'hero.png': { width: '64', height: 48 } }, { 'hero.png': null }]) {
    const report = analyzeProject(project, { images });
    assert.equal(report.assets[0].dimensionSource, 'declared');
    assert.ok(hasIssue(report, 'invalid-image-dimensions'));
  }
  const report = analyzeProject(project, { images: { 'too-big.png': { width: Number.MAX_SAFE_INTEGER, height: 2 } } });
  assert.deepEqual(report.memory.unknownRuntimeAssets, ['too-big.png']);
  assert.ok(hasIssue(report, 'invalid-image-dimensions'));
  assert.ok(hasIssue(analyzeProject(project, { images: [] }), 'invalid-images'));
});

test('Conflicting normalized decoded keys are diagnosed and do not double-count an asset', () => {
  const report = analyzeProject({ ...empty(), map: { groundSrc: 'ground.png', objects: [] } }, { images: {
    '/ground.png': { width: 32, height: 16 }, 'ground.png': { width: 64, height: 32 },
  } });
  assert.equal(report.assets.length, 1);
  assert.equal(report.memory.runtimeBytes, 32 * 16 * 4);
  assert.ok(hasIssue(report, 'decoded-dimension-conflict'));
});

test('Malformed projects and resource entries return actionable diagnostics without throwing', () => {
  for (const project of [null, [], false, 'bad']) assert.ok(hasIssue(analyzeProject(project), 'invalid-project'));
  const project = { characters: [null, 4, { id: 'bad', sprite: {}, animations: { idle: null } }], characterDrafts: [false, {}], vfx: [null, {}, { id: 'bad', count: '20' }], map: { objects: [null, {}] } };
  const report = analyzeProject(project);
  assert.ok(hasIssue(report, 'invalid-character'));
  assert.ok(hasIssue(report, 'invalid-character-draft'));
  assert.ok(hasIssue(report, 'invalid-vfx'));
  assert.ok(hasIssue(report, 'invalid-vfx-count'));
  assert.ok(hasIssue(report, 'invalid-map-object'));
  assert.ok(hasIssue(report, 'invalid-asset-path'));
  assert.ok(report.effects.every(item => item.count === null && item.concurrentParticles === null && item.recommendedCount === null));
  assert.equal(report.recommendations.length, 0);
  assert.ok(hasIssue(analyzeProject({ characters: {}, vfx: false, characterDrafts: null, map: [] }), 'invalid-resource-group'));
  assert.ok(hasIssue(analyzeProject({ map: { objects: {} } }), 'invalid-map-objects'));
});

test('Unsafe asset paths are diagnosed and excluded while root-relative local paths normalize', () => {
  const objects = ['../escape.png', 'https://host/test.png', '//host/test.png', 'bad%20.png', 'bad\\path.png', 'test.png?key=1', '/valid.png'].map(src => ({ src }));
  const report = analyzeProject({ ...empty(), map: { objects } });
  assert.deepEqual(report.assets.map(asset => asset.src), ['valid.png']);
  assert.equal(report.issues.filter(issue => issue.code === 'invalid-asset-path').length, 6);
});

test('Particle recommendations use the simultaneous diagnostic and never increase counts', () => {
  const project = { ...empty(), vfx: [effect('high', 48), effect('boundary', 20), effect('low', 8), effect('single', 1)] }, before = structuredClone(project);
  const report = analyzeProject(project);
  assert.deepEqual(report.effects.map(({ count, concurrentParticles, recommendedCount, overBudget }) => ({ count, concurrentParticles, recommendedCount, overBudget })), [
    { count: 48, concurrentParticles: 192, recommendedCount: 20, overBudget: true },
    { count: 20, concurrentParticles: 80, recommendedCount: 20, overBudget: false },
    { count: 8, concurrentParticles: 32, recommendedCount: 8, overBudget: false },
    { count: 1, concurrentParticles: 4, recommendedCount: 1, overBudget: false },
  ]);
  assert.deepEqual(report.recommendations.map(({ vfxId, from, to, path }) => ({ vfxId, from, to, path })), [{ vfxId: 'high', from: 48, to: 20, path: 'count' }]);
  assert.deepEqual(project, before);
  const custom = analyzeProject(project, { concurrentBursts: 3, particleBudget: 80 });
  assert.equal(custom.effects[0].recommendedCount, 26, 'Fractional per-burst allowance rounds down');
});

test('An impossible minimum particle budget warns while clamping the suggestion to one', () => {
  const report = analyzeProject({ ...empty(), vfx: [effect('large', 5), effect('one', 1)] }, { concurrentBursts: 4, particleBudget: 2 });
  assert.ok(hasIssue(report, 'particle-budget-unreachable'));
  assert.ok(report.effects.every(item => item.overBudget && item.recommendedCount === 1));
  assert.equal(report.recommendations.length, 1);
  assert.equal(report.recommendations[0].to, 1);
});

test('Duplicate VFX IDs retain diagnostics but cannot generate ambiguous mutations', () => {
  const project = { ...empty(), vfx: [effect('same', 40), effect('same', 80)] }, report = analyzeProject(project);
  assert.equal(report.effects.length, 2);
  assert.ok(hasIssue(report, 'duplicate-vfx-id'));
  assert.deepEqual(report.recommendations, []);
  const before = structuredClone(project);
  assert.equal(applyRecommendation(project, { vfxId: 'same', from: 40, to: 20, path: 'count' }), false);
  assert.deepEqual(project, before);
});

test('Extreme safe counts do not return an unsafe simultaneous-particle estimate', () => {
  const report = analyzeProject({ ...empty(), vfx: [effect('huge', Number.MAX_SAFE_INTEGER)] });
  assert.equal(report.effects[0].concurrentParticles, null);
  assert.equal(report.effects[0].overBudget, true);
  assert.equal(report.recommendations[0].to, 20);
  assert.ok(hasIssue(report, 'particle-estimate-overflow'));
});

test('Playable 24-frame and 24FPS warnings remain distinct from 24-frame reference motion', () => {
  const old = character({ ...sheet('old.png', 21, 1), frames: 21, fps: 12 });
  old.animations = { idle: { row: 0, frames: 2, fps: 12 }, walk: { row: 0, start: 2, frames: 8, fps: 24 } };
  const project = { ...empty(), characters: [old], characterDrafts: [{ id: 'draft', clip: sheet('reference.png'), referenceSrc: 'original.png' }] };
  const before = structuredClone(project), report = analyzeProject(project);
  assert.deepEqual(report.characterTargets, { frames: 24, fps: 24 });
  assert.equal(report.issues.filter(issue => issue.code === 'character-frame-target').length, 2);
  assert.equal(report.issues.filter(issue => issue.code === 'character-fps-target').length, 2);
  assert.ok(hasIssue(report, 'character-sheet-frames'));
  assert.ok(report.issues.some(issue => issue.code === 'missing-playable-animation' && issue.message.includes('attack')));
  assert.equal(hasIssue(report, 'draft-frame-target'), false);
  assert.equal(report.assets.find(asset => asset.src === 'reference.png').scope, 'reference');
  assert.deepEqual(project, before);
});

test('A 24-frame multirow playable animation is accepted and an out-of-range clip is diagnosed', () => {
  const good = character({ ...sheet('hero.png', 6, 8), frames: 48 });
  for (const animation of Object.values(good.animations)) Object.assign(animation, { row: 4, start: 0 });
  const report = analyzeProject({ ...empty(), characters: [good] });
  assert.equal(hasIssue(report, 'animation-frame-range'), false);
  assert.equal(hasIssue(report, 'character-frame-target'), false);
  assert.equal(hasIssue(report, 'character-fps-target'), false);
  assert.equal(hasIssue(report, 'character-sheet-frames'), false);
  good.animations.attack.start = 1;
  assert.ok(hasIssue(analyzeProject({ ...empty(), characters: [good] }), 'animation-frame-range'));
});

test('Default catalog estimates actual declared sheet layouts without promoting three references to playable', () => {
  const project = createDefaultProject(), before = structuredClone(project), report = analyzeProject(project);
  assert.equal(report.assets.length, 26, 'Sixteen directional sheets + three VFX + ground + three reference clips/stills');
  assert.equal(report.assets.filter(asset => asset.scope === 'runtime').length, 20);
  assert.equal(report.assets.filter(asset => asset.scope === 'reference').length, 6);
  assert.equal(report.memory.referenceBytes, 3 * 4608 * 1728 * 4);
  assert.deepEqual(report.memory.unknownRuntimeAssets, ['assets/map/ch1/ground_dark_soil.png']);
  assert.equal(report.assets.filter(asset => asset.scope === 'reference' && asset.dimensionSource === 'unknown').length, 3);
  assert.equal(report.assets.filter(asset => asset.issues.some(issue => issue.code === 'texture-dimension-budget')).length, 3);
  assert.deepEqual(report.recommendations.map(({ vfxId, from, to }) => ({ vfxId, from, to })), [
    { vfxId: 'land_fire', from: 32, to: 20 }, { vfxId: 'magic_burst', from: 48, to: 20 },
  ]);
  assert.equal(report.issues.filter(issue => issue.code === 'character-frame-target').length, 6);
  assert.deepEqual(project, before);
});

test('Analysis reports have no mutable aliases to project data or later analysis results', () => {
  const project = createDefaultProject(), before = structuredClone(project), first = analyzeProject(project), second = analyzeProject(project);
  first.assets[0].owners.push('fake');
  first.assets[0].issues.push({ code: 'fake', severity: 'error', message: 'fake' });
  first.settings.particleBudget = 1;
  first.characterTargets.frames = 1;
  first.recommendations[0].to = 1;
  assert.deepEqual(project, before);
  assert.deepEqual(analyzeProject(project), second);
});

test('Applying a fresh recommendation changes only its existing decorative count', () => {
  const project = createDefaultProject(), before = structuredClone(project), recommendation = analyzeProject(project).recommendations[0];
  assert.equal(applyRecommendation(project, recommendation), true);
  const expected = structuredClone(before);
  expected.vfx.find(vfx => vfx.id === recommendation.vfxId).count = recommendation.to;
  assert.deepEqual(project, expected, 'Sprite, life, character frames/FPS, skills and every unrelated value remain identical');
  assert.equal(applyRecommendation(project, recommendation), false, 'Already applied recommendations are stale');
  assert.deepEqual(project, expected);
});

test('Stale, missing, malformed, equal and increasing recommendations never mutate a project', () => {
  const project = createDefaultProject(), before = structuredClone(project), base = { vfxId: 'land_fire', from: 32, to: 20, path: 'count' };
  const invalid = [null, [], false, {}, { ...base, vfxId: 'missing' }, { ...base, from: 31 }, { ...base, path: 'life' },
    { ...base, to: 32 }, { ...base, to: 33 }, { ...base, to: 0 }, { ...base, to: -1 }, { ...base, to: 1.5 },
    { ...base, to: '20' }, { ...base, to: NaN }, { ...base, to: Infinity }, { ...base, from: '32' }];
  for (const recommendation of invalid) {
    assert.equal(applyRecommendation(project, recommendation), false);
    assert.deepEqual(project, before);
  }
  for (const malformed of [null, [], {}, { vfx: {} }, { vfx: [null] }]) assert.equal(applyRecommendation(malformed, base), false);
});

test('Frozen counts and accessors are rejected without invoking a setter or partial mutation', () => {
  const recommendation = { vfxId: 'fx', from: 32, to: 20, path: 'count' };
  const frozen = { vfx: [Object.freeze({ id: 'fx', count: 32 })] };
  assert.equal(applyRecommendation(frozen, recommendation), false);
  let setterCalls = 0;
  const accessor = { id: 'fx', get count() { return 32; }, set count(value) { setterCalls += 1; } };
  assert.equal(applyRecommendation({ vfx: [accessor] }, recommendation), false);
  assert.equal(setterCalls, 0);
  assert.equal(accessor.count, 32);
});

test('A caller transaction supplies exactly one undo/redo step and stale proposals supply none', () => {
  const project = createDefaultProject(), store = new ProjectStore(project), recommendation = analyzeProject(store.project).recommendations[0];
  store.change('VFX 제작 입자 예산', next => assert.equal(applyRecommendation(next, recommendation), true));
  assert.equal(store.project.vfx[0].count, 20);
  assert.equal(store.canUndo, true);
  assert.equal(store.undo(), true);
  assert.deepEqual(store.project, project);
  assert.equal(store.canUndo, false);
  assert.equal(store.redo(), true);
  const after = store.project;
  store.change('오래된 제안', next => assert.equal(applyRecommendation(next, recommendation), false));
  assert.deepEqual(store.project, after);
  assert.equal(store.undo(), true);
  assert.deepEqual(store.project, project);
  assert.equal(store.canUndo, false, 'No second history entry is created by the rejected stale proposal');
  store.dispose();
});
