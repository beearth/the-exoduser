import test from 'node:test';
import assert from 'node:assert/strict';
import { SourcePreviewRuntime } from '../engine/fdg/source-preview-runtime.js';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';
import { buildSourcePreview } from '../engine/fdg/source-preview.js';

// Synthetic authority/decoded-image fixtures. No real scene, source path or PNG is read.
const sourcePath = index => `fdg-source/ch1-1/source-${index}.png`;
const size = index => [64, index === 3 ? 400 : 32];

function previewFixture() {
  const tiles = Array(40_000).fill(1);
  const approved9 = Array.from({ length: 9 }, (_, i) => ({ relative: `qa/source-${i}.png`,
    canonicalAbsolutePath: `/synthetic-source/qa/source-${i}.png`, exists: true }));
  const observations = approved9.map((asset, i) => ({ canonicalAbsolutePath: asset.canonicalAbsolutePath,
    src: sourcePath(i), status: 'ready', intrinsicWidth: size(i)[0], intrinsicHeight: size(i)[1], observedBy: 'runtime-image-decode' }));
  const visualPlacements = Array.from({ length: 85 }, (_, i) => ({ file: approved9[i % 9].relative,
    x: 100, y: i === 84 ? 207 : 184 + i % 3, scale: i === 0 ? .75 : 1,
    opacity: i === 0 ? .6 : 1, brightness: i === 0 ? 1.08 : 1, saturation: i === 0 ? .8 : 1 }));
  const start = { rawTile: [100, 185], centerTile: [100.5, 185.5], worldPx: [4020, 7420] };
  const result = buildSourcePreview({ stage: 0, gridSize: [200, 200], tileSize: 40, tiles, start,
    approved9, visualPlacements, sourceSnapshot: { syntheticAuthority: true }, manifestSnapshot: { syntheticAuthority: true } }, observations, {
    previewLayout: { anchorConvention: 'bottom-center', pixelsPerSourcePixel: 1, authoredBy: 'QA explicit layout' },
    resourceBindings: Object.fromEntries(observations.map(observation => [observation.canonicalAbsolutePath, observation.src])),
    startAuthority: { kind: 'design-start', stage: 0, tileSizePx: 40, centerTile: [100.5, 185.5], worldPx: [4020, 7420],
      source: 'CH1_WORLD_MAP_ORDER / 맵구성_1장.md:3', approvedBy: 'ROOT', runtimeSymbol: 'UNKNOWN' },
    camera: { x: 4020, y: 7420, follow: true, unknownCamera: 'preserve' },
  });
  assert.equal(result.ok, true, result.errors.join('\n'));
  const scene = structuredClone(result.sourcePreview);
  scene.actor.unknownActorMetadata = { keep: true };
  scene.provenance.unknown = ['preserve', { value: 7 }];
  return scene;
}

function projectFixture(label = 'live', preview = null) {
  return {
    schemaVersion: 1, id: `qa-${label}`, name: 'QA preview project',
    map: { width: 200, height: 200, tileSize: 40, tiles: preview ? [...preview.nav.tiles] : Array(40_000).fill(1),
      start: { x: 100, y: 185 }, exit: { x: 100, y: 5 }, objects: [], unknownCollision: { preserve: true } },
    characters: [{ id: 'actor', name: 'QA native actor', speed: 156, radius: 12,
      sprite: { src: `qa/${label}-actor.png`, frameWidth: 16, frameHeight: 16, columns: 2, rows: 1, frames: 2,
        fps: 24, scale: 1, anchorX: .5, anchorY: .9 },
      animations: { idle: { row: 0, frames: 1, fps: 24, loop: true }, walk: { row: 0, start: 1, frames: 1, fps: 24, loop: true } } }],
    skills: [{ id: 'skill', name: 'QA skill', cooldown: 1, cost: 1, range: 100, damage: 1, vfx: 'effect' }],
    vfx: [{ id: 'effect', name: 'QA effect', kind: 'burst', color: '#abcdef', count: 1, life: 1, speed: 1, size: 1, spread: 1,
      sprite: { src: `qa/${label}-vfx.png`, frameWidth: 8, frameHeight: 8, columns: 2, rows: 1, frames: 2,
        fps: 24, scale: 1, anchorX: .5, anchorY: .5 } }],
    preview: { characterId: 'actor', skillId: 'skill', vfxId: 'effect', resourceMax: 100, resourceRegen: 1 },
    unknownGameplay: { preserve: true }, ...(preview ? { sourcePreview: preview } : {}),
  };
}

function decodedAssets() {
  return new Map(Array.from({ length: 9 }, (_, i) => {
    const [naturalWidth, naturalHeight] = size(i);
    return [sourcePath(i), { status: 'ready', image: { path: sourcePath(i), naturalWidth, naturalHeight } }];
  }));
}

function drawingContext() {
  const calls = [], stack = [], context = { globalAlpha: 1, filter: 'none' };
  for (const method of ['setTransform', 'beginPath', 'rect', 'clip', 'fillRect', 'strokeRect', 'fillText',
    'moveTo', 'lineTo', 'ellipse', 'arc', 'stroke', 'fill']) context[method] = (...args) => calls.push({ method, args });
  context.save = () => stack.push({ alpha: context.globalAlpha, filter: context.filter });
  context.restore = () => { const previous = stack.pop(); context.globalAlpha = previous.alpha; context.filter = previous.filter; };
  context.drawImage = (image, ...args) => calls.push({ method: 'drawImage', path: image.path, args, alpha: context.globalAlpha, filter: context.filter });
  return { context, calls };
}

function events() {
  const listeners = new Map();
  return {
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    dispatch(type, values = {}) {
      const event = { preventDefault() {}, ctrlKey: false, altKey: false, metaKey: false, ...values };
      for (const callback of listeners.get(type) || []) callback(event);
    },
    count: () => [...listeners.values()].reduce((sum, entries) => sum + entries.size, 0),
  };
}

function environment(plans = {}) {
  const drawn = drawingContext(), requests = [], deferred = new Map(), raf = new Map();
  let frameId = 0;
  class FakeImage {
    constructor() { this.naturalWidth = 0; this.naturalHeight = 0; }
    set src(value) {
      this.path = value.replace(/^\//, ''); requests.push(this.path);
      const match = /^fdg-source\/ch1-1\/source-(\d)\.png$/.exec(this.path), defaults = match ? size(Number(match[1])) : [64, 32];
      const plan = plans[this.path] || {}, load = () => {
        if (plan.fail) { this.onerror?.(new Error('QA decode failure')); return; }
        this.naturalWidth = plan.width ?? defaults[0]; this.naturalHeight = plan.height ?? defaults[1]; this.onload?.();
      };
      if (plan.defer) deferred.set(this.path, load); else queueMicrotask(load);
    }
    removeAttribute() {}
  }
  const windowEvents = events(), documentEvents = events(), canvasEvents = events(), attributes = new Map();
  const window = { ...windowEvents, Image: FakeImage, devicePixelRatio: 1,
    requestAnimationFrame(callback) { const id = ++frameId; raf.set(id, callback); return id; },
    cancelAnimationFrame(id) { raf.delete(id); } };
  const document = { ...documentEvents, defaultView: window, hidden: false };
  const canvas = { ...canvasEvents, ownerDocument: document, width: 400, height: 300,
    getContext: () => drawn.context, getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 300 }),
    hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name), focus() {} };
  return { ...drawn, canvas, requests, raf,
    listeners: () => windowEvents.count() + documentEvents.count() + canvasEvents.count(),
    frame(timestamp) { const entry = raf.entries().next().value; assert.ok(entry, 'Owner RAF must be scheduled'); raf.delete(entry[0]); entry[1](timestamp); },
    complete(path) { const load = deferred.get(path); deferred.delete(path); load?.(); },
  };
}

async function liveOwner(t, plans) {
  const env = environment(plans), reported = [], runtime = new FDGRuntime(env.canvas, projectFixture(), { onError: error => reported.push(error.message) });
  t.after(() => runtime.dispose()); await runtime.load(); return { env, runtime, reported };
}

test('Preview validates and clones native metadata, deduplicates nine full images, and exposes unknown physical height honestly', () => {
  const scene = previewFixture(), consumer = new SourcePreviewRuntime(scene, projectFixture().map), assets = decodedAssets();
  assert.equal(consumer.requiredSources().size, 9); assert.equal(consumer.validateReady(assets).ok, true);
  consumer.requiredSources().clear(); assert.equal(consumer.requiredSources().size, 9);
  scene.imageLayers[0].native.brightness = -1; scene.provenance.unknown[1].value = -1;
  const captured = consumer.capture({ x: 4020, y: 7420 });
  assert.equal(captured.imageLayers[0].brightness, 1.08); assert.equal(captured.imageLayers[0].native.brightness, 1.08);
  assert.equal(captured.provenance.unknown[1].value, 7);
  assert.equal(captured.imageLayers[84].depthY, 8300); assert.equal(captured.grid.height * captured.grid.tileSize, 8000);
  const snapshot = consumer.snapshot({ x: 4020, y: 7420 });
  assert.deepEqual(snapshot.position, [4020, 7420]); assert.equal(snapshot.height, null);
  assert.equal(snapshot.mode, 'UNADOPTED_VISUAL_PREVIEW'); assert.equal(snapshot.adoption, 'UNADOPTED');
  assert.equal(snapshot.navScope, 'polygon-only'); assert.equal(snapshot.imageLayers, 85);
  assert.deepEqual(snapshot.sourcePending, ['collision', 'cliff', 'logicalHeight']);
  assert.equal(Object.hasOwn(snapshot, 'logicalHeight'), false); assert.equal(Object.hasOwn(captured.actor, 'z'), false);
  assets.get(sourcePath(0)).image.naturalWidth = 65;
  assert.equal(consumer.validateReady(assets).ok, false, 'Stale observed dimensions must not silently crop a newly sized full image');
  assert.throws(() => new SourcePreviewRuntime(previewFixture(), { width: 200, height: 200, tileSize: 32 }), /native grid/);
  consumer.dispose(); assert.equal(consumer.scene, null); assert.equal(consumer.requiredSources().size, 0);
});

test('Preview draws source filters and native world-Y order, clips foot8300 without moving geometry, and restores state on failure', () => {
  const scene = previewFixture(), consumer = new SourcePreviewRuntime(scene), assets = decodedAssets(), { context, calls } = drawingContext();
  const owner = { assets, camera: { x: 4020, y: 7420 }, width: 400, height: 300, player: { x: 4020, y: 7420 } };
  context.globalAlpha = .7; context.filter = 'sepia(.2)';
  const drawActor = () => { assert.equal(context.globalAlpha, .7); assert.equal(context.filter, 'sepia(.2)'); calls.push({ method: 'native-actor' }); };
  const counts = consumer.draw(context, owner, { drawActor });
  assert.equal(counts.drawCalls, 84); assert.equal(counts.visibleObjects, 84); assert.equal(counts.imageMissing, 0);
  const renderOrder = calls.filter(call => call.method === 'drawImage' || call.method === 'native-actor');
  assert.equal(renderOrder.filter(call => call.method === 'native-actor').length, 1);
  const actorIndex = renderOrder.findIndex(call => call.method === 'native-actor');
  const before = scene.imageLayers.filter(layer => layer.depthY <= owner.player.y);
  assert.equal(actorIndex, before.length);
  const first = renderOrder[0];
  assert.equal(first.filter, 'brightness(1.08) saturate(0.8)'); assert.ok(Math.abs(first.alpha - .42) < 1e-12);
  assert.deepEqual(first.args, [0, 0, 64, 32, 176, 86, 48, 24]);
  assert.equal(context.globalAlpha, .7); assert.equal(context.filter, 'sepia(.2)');
  calls.length = 0; owner.camera.y = 7850;
  consumer.draw(context, owner, { drawActor });
  const outside = calls.find(call => call.method === 'drawImage' && call.args[5] === 200 && call.args[7] === 400);
  assert.ok(outside, 'Original foot8300 full image intersects the viewport ending at world8000');
  assert.deepEqual(outside.args, [0, 0, 64, 400, 168, 200, 64, 400]);
  assert.ok(calls.some(call => call.method === 'rect' && call.args[2] === 400 && call.args[3] === 300));
  context.drawImage = () => { throw new Error('QA Canvas failure'); }; owner.camera.y = 7420;
  assert.throws(() => consumer.draw(context, owner, { drawActor }), /Canvas failure/);
  assert.equal(context.globalAlpha, .7); assert.equal(context.filter, 'sepia(.2)'); consumer.dispose();
});

test('Polygon-only movement and capture preserve unknown source authority without synthesizing Z or collider data', () => {
  const scene = previewFixture(); scene.nav.tiles[185 * 200 + 102] = 0;
  const consumer = new SourcePreviewRuntime(scene), player = { x: 4020, y: 7420, radius: 12 };
  assert.equal(consumer.move(player, 4060, 7420), true);
  assert.equal(consumer.blockedReason, null);
  const before = structuredClone(player); assert.equal(consumer.move(player, 4100, 7420), false); assert.deepEqual(player, before);
  assert.equal(Object.hasOwn(player, 'z'), false);
  const captured = consumer.capture(player, { x: 4100, y: 7300, follow: false });
  assert.deepEqual(captured.actor.position, [4060, 7420]); assert.deepEqual(captured.actor.sourceStart, scene.actor.sourceStart);
  assert.deepEqual(captured.status, scene.status); assert.deepEqual(captured.provenance, scene.provenance);
  assert.equal(captured.camera.unknownCamera, 'preserve'); assert.equal(Object.hasOwn(captured, 'colliders'), false);
  assert.throws(() => consumer.capture({ x: 8000, y: 7420 }), /world XY/);
  captured.nav.tiles[0] = 0; assert.equal(consumer.capture(player).nav.tiles[0], 1);
  consumer.dispose(); assert.equal(consumer.move(player, 4050, 7420), false); assert.equal(consumer.capture(player), null);
  assert.equal(consumer.snapshot(player), null); assert.equal(consumer.draw(null, null).drawCalls, 0);
});

test('Preview preparation failures preserve the live project, actor, camera and errors while retiring all new decoded records', async t => {
  const { env, runtime, reported } = await liveOwner(t, { [sourcePath(0)]: { fail: true } });
  runtime.setCamera(4100, 7300);
  const before = { project: runtime.project, actor: structuredClone(runtime.player), camera: structuredClone(runtime.camera), assets: [...runtime.assets] };
  const candidate = projectFixture('preview', previewFixture());
  await assert.rejects(runtime.prepareSourcePreview(candidate), /observed full source size/);
  assert.strictEqual(runtime.project, before.project); assert.deepEqual(runtime.player, before.actor); assert.deepEqual(runtime.camera, before.camera);
  assert.deepEqual([...runtime.assets], before.assets); assert.equal(runtime._pendingAssets.size, 0);
  assert.equal(runtime.stats.assetErrors, 0); assert.deepEqual(reported, []); assert.equal(runtime.sourcePreviewReady, false);
  assert.equal(env.requests.filter(path => /^fdg-source\/ch1-1\//.test(path)).length, 9, 'All85 source records share exactly nine preload paths');
});

test('Prepared85-layer preview installs native actor rendering with exact source-size gate and no physical scene claim', async t => {
  const { env, runtime } = await liveOwner(t);
  const candidate = projectFixture('preview', previewFixture()), prepared = await runtime.prepareSourcePreview(candidate);
  assert.equal(prepared.sources, 11); assert.equal(runtime.sourcePreviewReady, false, 'Preparation alone cannot install');
  await runtime.setProject(candidate); prepared.release();
  assert.equal(runtime.sourcePreviewReady, true); assert.equal(runtime.sourceSceneReady, false);
  assert.deepEqual([runtime.player.x, runtime.player.y], [4020, 7420]); assert.equal(Object.hasOwn(runtime.player, 'z'), false);
  env.calls.length = 0; runtime.renderOnce();
  const images = env.calls.filter(call => call.method === 'drawImage');
  assert.equal(images.filter(call => call.path === 'qa/preview-actor.png').length, 1);
  assert.equal(runtime.stats.visibleObjects, 84); assert.equal(runtime.stats.drawCalls, 87);
  assert.equal(runtime.stats.visibleTiles, 0); assert.equal(env.calls.filter(call => call.method === 'fillRect').length, 1);
  assert.equal(env.calls.filter(call => call.method === 'strokeRect').length, 0);
  assert.equal(runtime.getSourcePreviewSnapshot().imageLayers, 85); assert.equal(runtime.getSourcePreviewSnapshot().height, null);
  assert.equal(env.requests.filter(path => /^fdg-source\/ch1-1\//.test(path)).length, 9, 'Installation reuses prepared images');
  assert.equal(runtime.stats.assetErrors, 0);
});

test('Owner60Hz WASD, paused10px movement, pause/step and JSON reopen retain XY/PENDING while skill and World actions remain blocked', async t => {
  const env = environment(), project = projectFixture('input', previewFixture()), runtime = new FDGRuntime(env.canvas, project);
  t.after(() => runtime.dispose()); await runtime.load();
  runtime.start(); env.canvas.dispatch('keydown', { code: 'KeyD' }); env.frame(0); env.frame(1000 / 60);
  assert.ok(Math.abs(runtime.player.x - 4022.6) < 1e-9); assert.equal(runtime.stats.updateSteps, 1);
  assert.equal(runtime.moveSourcePreview(10, 0), false, 'Public small movement is a paused control');
  env.canvas.dispatch('keydown', { code: 'Space', repeat: false });
  env.canvas.dispatch('pointerdown', { clientX: 200, clientY: 150, button: 0 });
  assert.equal(runtime.triggerSkill().reason, 'source-preview-physical-pending'); assert.equal(runtime.triggerVfx(), 0);
  assert.equal(runtime.stats.casts, 0); assert.equal(runtime.particles.count, 0);
  runtime.pause(); const x = runtime.player.x, time = runtime.stats.time;
  assert.equal(env.raf.size, 0); assert.equal(runtime.step(FIXED_STEP), 1); assert.equal(runtime.player.x, x);
  assert.ok(Math.abs(runtime.stats.time - time - FIXED_STEP) < 1e-12);
  assert.equal(runtime.moveSourcePreview(10, 0), true); assert.equal(runtime.moveSourcePreview(10.1, 0), false);
  runtime.setCamera(4100, 7300);
  const saved = runtime.captureSceneState();
  assert.equal(saved.actorPosition.length, 2); assert.equal(saved.height, null); assert.equal(saved.project.sourcePreview.actor.position.length, 2);
  assert.deepEqual(saved.project.sourcePreview.status, project.sourcePreview.status);
  assert.deepEqual(saved.project.sourcePreview.imageLayers, project.sourcePreview.imageLayers);
  assert.deepEqual(saved.project.unknownGameplay, project.unknownGameplay);
  assert.deepEqual(saved.project.map.unknownCollision, project.map.unknownCollision);
  const reopenedEnv = environment(), reopened = new FDGRuntime(reopenedEnv.canvas, JSON.parse(JSON.stringify(saved.project)));
  t.after(() => reopened.dispose()); await reopened.load();
  assert.deepEqual([reopened.player.x, reopened.player.y], saved.actorPosition); assert.equal(Object.hasOwn(reopened.player, 'z'), false);
  assert.deepEqual(reopened.camera, saved.camera); assert.equal(reopened.getSourcePreviewSnapshot().adoption, 'UNADOPTED');
  await assert.rejects(runtime.enterScene(projectFixture('ordinary'), { arrival: [4020, 7420, 0] }), /World transitions/);
  assert.strictEqual(runtime.project, project);
});

test('Superseded preview preparation cannot replace a newer scene; replacement/dispose retire consumers without owning extra RAF or images', async t => {
  const { env, runtime, reported } = await liveOwner(t, { [sourcePath(0)]: { defer: true } });
  const pending = runtime.prepareSourcePreview(projectFixture('race', previewFixture())), rejected = assert.rejects(pending, /superseded/);
  const replacement = projectFixture('newer'); await runtime.setProject(replacement); await rejected;
  assert.strictEqual(runtime.project, replacement); assert.equal(runtime.stats.assetErrors, 0); assert.deepEqual(reported, []);
  env.complete(sourcePath(0)); await Promise.resolve(); assert.strictEqual(runtime.project, replacement);
  const previewEnv = environment(), preview = new FDGRuntime(previewEnv.canvas, projectFixture('dispose', previewFixture()));
  t.after(() => preview.dispose()); await preview.load();
  const consumer = preview._sourcePreview, sourceRecord = preview.assets.get(sourcePath(1));
  assert.equal(preview.getSourcePreviewSnapshot().ownedRaf, 0); assert.equal(previewEnv.raf.size, 0);
  await preview.setProject(projectFixture('normal'));
  assert.equal(consumer.disposed, true); assert.equal(consumer.scene, null); assert.equal(consumer.requiredSources().size, 0);
  assert.equal(sourceRecord.image, null); assert.equal(preview.sourcePreviewReady, false);
  await preview.setProject(projectFixture('final', previewFixture())); const final = preview._sourcePreview;
  preview.dispose(); preview.dispose();
  assert.equal(final.disposed, true); assert.equal(final.scene, null); assert.equal(preview.assets.size, 0);
  assert.equal(previewEnv.listeners(), 0); assert.equal(previewEnv.raf.size, 0); assert.equal(preview.getSourcePreviewSnapshot(), null);
});

test('Missing or changed full-source dimensions block start/step and render a loading notice without tile or actor substitutes', async t => {
  const env = environment({ [sourcePath(3)]: { width: 63 } });
  const runtime = new FDGRuntime(env.canvas, projectFixture('blocked', previewFixture()));
  t.after(() => runtime.dispose());
  assert.throws(() => runtime.start(), /필수 이미지/); assert.equal(runtime.step(FIXED_STEP), 0);
  await runtime.load(); assert.equal(runtime.sourcePreviewReady, false);
  assert.throws(() => runtime.start(), /필수 이미지/); assert.equal(runtime.step(FIXED_STEP), 0);
  env.calls.length = 0; runtime.renderOnce();
  assert.equal(env.calls.filter(call => call.method === 'drawImage').length, 0);
  assert.equal(env.calls.filter(call => call.method === 'fillRect').length, 1);
  assert.equal(env.calls.filter(call => call.method === 'strokeRect' || call.method === 'arc').length, 0);
  assert.equal(runtime.getSourcePreviewSnapshot().height, null);
});
