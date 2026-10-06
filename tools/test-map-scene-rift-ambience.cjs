'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const scenePath = path.join(root, 'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json');
const candidatePath = path.join(__dirname, 'team-followup-20261005/hell-rift/ANIMVFX/rift-ambience.mjs');
const apiPromise = import(pathToFileURL(path.join(__dirname, 'map-scene-rift-ambience.mjs')).href);
const candidatePromise = import(pathToFileURL(candidatePath).href);
const core = vm.createContext({ module: { exports: {} } });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'map-scene-core.js'), 'utf8'), core, { filename: 'map-scene-core.js' });
const K = core.module.exports;
const clone = v => JSON.parse(JSON.stringify(v));
const makeScene = () => JSON.parse(fs.readFileSync(scenePath, 'utf8'));
const navHash = p => crypto.createHash('sha256').update(Buffer.from(p.walkable)).digest('hex');
const rawHash = () => crypto.createHash('sha256').update(fs.readFileSync(candidatePath)).digest('hex');
const walk = (p, x, y, radius) => K.canWalk(p, x, y, radius);

class Context {
  constructor() {
    this.globalAlpha = .7; this.fillStyle = 'original'; this.globalCompositeOperation = 'multiply'; this.shadowBlur = 12;
    this.paths = []; this.clips = []; this.fills = []; this.stack = []; this.transforms = [];
    this.stateBefore = this.state(); this.path = [];
  }
  state() { return { globalAlpha: this.globalAlpha, fillStyle: this.fillStyle, globalCompositeOperation: this.globalCompositeOperation, shadowBlur: this.shadowBlur }; }
  save() { this.stack.push(this.state()); }
  restore() { assert.ok(this.stack.length); Object.assign(this, this.stack.pop()); }
  beginPath() { this.path = []; }
  moveTo(x, y) { this.path.push(['moveTo', x, y]); }
  lineTo(x, y) { this.path.push(['lineTo', x, y]); }
  closePath() { this.path.push(['closePath']); }
  rect(x, y, w, h) { this.path.push(['rect', x, y, w, h]); }
  clip(rule) { this.clips.push({ path: clone(this.path), rule }); }
  arc(x, y, rx) { this.path.push(['arc', x, y, rx]); }
  ellipse(x, y, rx, ry) { this.path.push(['ellipse', x, y, rx, ry]); }
  fill() {
    this.fills.push({ path: clone(this.path), alpha: this.globalAlpha, style: this.fillStyle, composite: this.globalCompositeOperation });
    if (this.throwOnFill) throw new Error('canvas failure');
  }
  createRadialGradient(x, y, inner, ox, oy, radius) {
    return { x, y, inner, ox, oy, radius, addColorStop() {} };
  }
  translate(...v) { this.transforms.push(['translate', ...v]); }
  scale(...v) { this.transforms.push(['scale', ...v]); }
  rotate(...v) { this.transforms.push(['rotate', ...v]); }
  setTransform(...v) { this.transforms.push(['setTransform', ...v]); }
}
function drawn(ctx) { return ctx.fills.map(v => v.path[0]); }
function assertRestored(ctx) { assert.equal(ctx.stack.length, 0); assert.deepEqual(ctx.state(), ctx.stateBefore); }

test('only the saved isolated rift contract activates; incomplete/generic scenes stay quiet', async () => {
  const api = await apiPromise, p = makeScene();
  assert.equal(api.supportsRiftAmbience(p), true);
  assert.ok(api.createRiftAmbience(p, walk));
  for (const malformed of [null, {}, { ...p, productionStatus: 'CH1' }, { ...p, layers: [] }, { ...p, world: { cols: 200, rows: 200, tileSize: 32 } }, { ...p, sourcePins: {} }]) {
    assert.equal(api.supportsRiftAmbience(malformed), false);
    assert.equal(api.createRiftAmbience(malformed, walk), null);
  }
  const wrongSource = makeScene(); wrongSource.assets.find(a => a.id === 'rift-depth').src = 'other.png';
  assert.equal(api.createRiftAmbience(wrongSource, walk), null);
  const noMask = makeScene(); delete noMask.layers[3].objects[0].mask;
  assert.equal(api.createRiftAmbience(noMask, walk), null);
  const invalidNav = makeScene(); invalidNav.walkable[0] = 2;
  assert.equal(api.createRiftAmbience(invalidNav, walk), null);
  const invalidObject = makeScene(); invalidObject.layers[4].objects[0].mask = null;
  assert.equal(api.createRiftAmbience(invalidObject, walk), null);
  assert.equal(api.createRiftAmbience(p, () => { throw new Error('invalid callback'); }), null);
  assert.equal(api.createRiftAmbience(p, null), null);
});

test('passes draw in world coordinates without projecting viewport/DPR a second time', async () => {
  const api = await apiPromise, raw = (await candidatePromise).default, p = makeScene();
  const ambience = api.createRiftAmbience(p, walk), ctx = new Context();
  for (const band of ['back', 'ground', 'front']) assert.ok(ambience.draw(ctx, band, 3000).drawn > 0);
  assert.deepEqual(ctx.transforms, []);
  const sourcePoints = raw.field('front', 3000), actualFront = new Context();
  ambience.draw(actualFront, 'front', 3000);
  for (const [, x, y] of drawn(actualFront)) assert.ok(sourcePoints.some(v => v.x === x && v.y === y));
  assertRestored(ctx); assertRestored(actualFront);
});

test('back uses the actual transformed abyss polygon and ignores source-image parallax', async () => {
  const api = await apiPromise, p = makeScene(), o = p.layers[3].objects[0];
  o.x = 4000; o.y = 4000; o.pivotX = .5; o.pivotY = .5; o.rotation = 90; o.flipX = true;
  const ambience = api.createRiftAmbience(p, walk), ctx = new Context();
  assert.ok(ambience.draw(ctx, 'back', 3000).drawn > 0);
  const poly = ctx.clips.find(c => c.path[0]?.[0] === 'moveTo');
  assert.ok(poly); assert.ok(Math.abs(poly.path[0][1] - 5560) < 1e-7); assert.ok(Math.abs(poly.path[0][2] - 3880) < 1e-7);
  assert.equal(poly.path.filter(v => v[0] === 'lineTo').length, o.mask.length - 1);
  for (const [, x, y] of drawn(ctx)) assert.equal(K.hit(o, x, y), true);
  const other = new Context(); o.sourceParallax = 1;
  ambience.draw(other, 'back', 3000); assert.deepEqual(drawn(other), drawn(ctx));
  p.layers[3].visible = false;
  const hidden = new Context(); assert.equal(ambience.draw(hidden, 'back', 3000).drawn, 0); assert.equal(hidden.clips.length, 0);
  p.layers[3].visible = true; o.opacity = 0;
  assert.equal(ambience.draw(new Context(), 'back', 3000).drawn, 0);
  assertRestored(ctx);
});

test('ground anchors are radius-12 walkable tile centres and ellipses clip to the real 1192 cells', async () => {
  const api = await apiPromise, p = makeScene(); let calls = 0;
  const ambience = api.createRiftAmbience(p, (scene, x, y, radius) => { calls++; assert.equal(radius, 12); return walk(scene, x, y, radius); });
  const snap = ambience.snapshot();
  assert.equal(snap.navCount, 1192); assert.equal(snap.validCentres, 1192); assert.equal(snap.groundAnchors.length, 22);
  for (const a of snap.groundAnchors) {
    assert.equal(a.x % 40, 20); assert.equal(a.y % 40, 20); assert.equal(K.canWalk(p, a.x, a.y, 12), true);
  }
  const ctx = new Context(); const stats = ambience.draw(ctx, 'ground', 3000);
  assert.ok(stats.drawn > 0);
  for (const [, x, y] of drawn(ctx)) assert.equal(K.canWalk(p, x, y, 12), true);
  const footprint = ctx.clips.find(c => c.path.length > 1 && c.path.every(v => v[0] === 'rect'));
  assert.ok(footprint);
  const covered = new Set();
  for (const [, x, y, w, h] of footprint.path) {
    assert.equal(h, 40);
    for (let xx = x; xx < x + w; xx += 40) { const i = y / 40 * 200 + xx / 40; assert.equal(p.walkable[i], 1); covered.add(i); }
  }
  assert.equal(covered.size, 1192); assert.ok(calls >= 1192);
  assertRestored(ctx);
});

test('nearest mapping is cached; replacement nav invalidates/rebuilds without retaining old footprints', async () => {
  const api = await apiPromise, p = makeScene(), originalNav = p.walkable;
  const ambience = api.createRiftAmbience(p, walk), first = ambience.snapshot();
  assert.equal(first.nearestComparisons, 22 * 1192); assert.equal(first.cacheBuilds, 1);
  for (let i = 0; i < 60; i++) ambience.draw(new Context(), 'ground', i * 33);
  const steady = ambience.snapshot();
  assert.equal(steady.nearestComparisons, first.nearestComparisons); assert.equal(steady.cacheBuilds, 1);
  assert.ok(steady.canWalkChecks - first.canWalkChecks <= 60 * 22);
  p.walkable = new Array(40000).fill(0);
  const empty = new Context(); assert.equal(ambience.draw(empty, 'ground', 3000).drawn, 0); assert.equal(empty.clips.length, 0);
  const disabled = ambience.snapshot(); assert.equal(disabled.active, false); assert.equal(disabled.navCount, 0); assert.deepEqual(disabled.groundAnchors, []); assert.equal(disabled.cacheBuilds, 2);
  p.walkable = [...originalNav];
  assert.ok(ambience.draw(new Context(), 'ground', 3000).drawn > 0);
  const restored = ambience.snapshot(); assert.equal(restored.active, true); assert.equal(restored.navCount, 1192); assert.equal(restored.cacheBuilds, 3);
});

test('temporary malformed geometry disables quietly and recovers when restored without rescanning nav', async () => {
  const api = await apiPromise, p = makeScene(), ambience = api.createRiftAmbience(p, walk);
  const o = p.layers[3].objects[0]; o.rotation = Number.NaN;
  const ctx = new Context(); assert.equal(ambience.draw(ctx, 'back', 3000).drawn, 0); assert.equal(ctx.clips.length, 0);
  assert.equal(ambience.snapshot().active, false); assert.equal(ambience.snapshot().reason, 'unsupported-scene');
  o.rotation = 0;
  assert.ok(ambience.draw(new Context(), 'back', 3000).drawn > 0);
  assert.equal(ambience.snapshot().active, true); assert.equal(ambience.snapshot().cacheBuilds, 1);
});

test('native Path2D caches the actual footprint once and rebuilds only for a replacement nav', async t => {
  const api = await apiPromise, oldPath = global.Path2D; let builds = 0;
  class CachedPath { constructor() { builds++; this.rectangles = []; } rect(...r) { this.rectangles.push(r); } }
  global.Path2D = CachedPath;
  t.after(() => { if (oldPath === undefined) delete global.Path2D; else global.Path2D = oldPath; });
  const p = makeScene(), ambience = api.createRiftAmbience(p, walk);
  for (let i = 0; i < 3; i++) {
    const ctx = new Context(); ambience.draw(ctx, 'ground', 3000);
    const footprint = ctx.clips.find(c => c.rule instanceof CachedPath); assert.ok(footprint);
    assert.equal(footprint.rule.rectangles.length, 155);
    assert.equal(footprint.rule.rectangles.reduce((sum, r) => sum + r[2] * r[3] / 1600, 0), 1192);
  }
  assert.equal(builds, 1); p.walkable = [...p.walkable]; ambience.draw(new Context(), 'ground', 3000); assert.equal(builds, 2);
});

test('ground and front enforce actor body/foot exclusion even with hidden foot/front layers', async () => {
  const api = await apiPromise, raw = (await candidatePromise).default, p = makeScene();
  p.layers.find(l => l.id === 'foot').visible = false; p.layers.find(l => l.id === 'front').visible = false;
  const ambience = api.createRiftAmbience(p, walk), a = ambience.snapshot().groundAnchors[0];
  for (const [band, player] of [['ground', a], ['front', raw.field('front', 3000)[0]]]) {
    const ctx = new Context(); ambience.draw(ctx, band, 3000, { player });
    const exclusion = ctx.clips.find(c => c.rule === 'evenodd'); assert.ok(exclusion);
    assert.deepEqual(exclusion.path[1], ['rect', player.x - 40, player.y - 96, 80, 120]);
    for (const v of drawn(ctx)) {
      const [, x, y, rx, ry = rx] = v;
      assert.ok(x + rx < player.x - 40 || x - rx > player.x + 40 || y + ry < player.y - 96 || y - ry > player.y + 24);
    }
    assert.ok(ambience.snapshot().bands[band].culled > 0); assertRestored(ctx);
  }
});

test('alpha/composite are bounded and context restores after success and canvas exceptions', async () => {
  const api = await apiPromise, p = makeScene(), ambience = api.createRiftAmbience(p, walk);
  for (const band of ['back', 'ground', 'front']) {
    const ctx = new Context(), stats = ambience.draw(ctx, band, 3000);
    const cap = band === 'back' ? .12 : .10; assert.ok(stats.peak <= cap);
    for (const fill of ctx.fills) { assert.ok(fill.alpha <= .7 * cap + 1e-12); assert.equal(fill.composite, 'source-over'); }
    assertRestored(ctx);
  }
  const broken = new Context(); broken.throwOnFill = true;
  assert.throws(() => ambience.draw(broken, 'ground', 3000), /canvas failure/); assertRestored(broken);
  assert.equal(ambience.draw({}, 'ground', 3000).drawn, 0);
  assert.equal(ambience.draw(null, 'front', 3000).drawn, 0);
  assert.equal(ambience.draw(new Context(), 'unknown', 3000).drawn, 0);
});

test('scene, exact nav hash, original route and immutable raw remain unchanged', async () => {
  const api = await apiPromise, p = makeScene();
  const before = JSON.stringify(p), hash = navHash(p), raw = rawHash(), route = clone(K.route(p));
  assert.equal(hash, 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179');
  assert.equal(route.pass, true); assert.equal(route.visited, 1185);
  const ambience = api.createRiftAmbience(p, walk);
  for (const time of [0, 3000, 9000, 30000, Number.NaN]) for (const band of ['back', 'ground', 'front']) ambience.draw(new Context(), band, time, { player: p.start });
  const snap = ambience.snapshot(); snap.groundAnchors[0].x = -1; snap.exclusion.halfWidth = 0;
  assert.notEqual(ambience.snapshot().groundAnchors[0].x, -1); assert.equal(ambience.snapshot().exclusion.halfWidth, 40);
  assert.equal(JSON.stringify(p), before); assert.equal(navHash(p), hash); assert.equal(rawHash(), raw); assert.deepEqual(clone(K.route(p)), route);
});
