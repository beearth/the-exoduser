import test from 'node:test';
import assert from 'node:assert/strict';
import { SourceSceneRuntime } from '../engine/fdg/source-scene-runtime.js';

const clone = value => structuredClone(value);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const imageLayer = (id, layer = 'ground', changes = {}) => ({
  id, src: `assets/source-runtime-qa/${id}.png`, sourceRect: [0, 0, 16, 16],
  worldRect: [3920, 7320, 200, 200], opacity: 1, layer, depthY: 7520, ...changes,
});
function authoredScene(imageLayers = []) {
  return {
    schemaVersion: 1, stage: 0,
    grid: { width: 200, height: 200, tileSize: 40 },
    nav: { tiles: Array(40000).fill(1), scope: 'polygon-plus-source-colliders' },
    colliders: [],
    height: {
      logicalSamples: Array(40000).fill(.25), source: 'Explicit numeric QA source',
      interpolation: 'bilinear-cell-centers',
      heightMapping: { kind: 'engine-authored-linear', scalePx: 64, offsetPx: 10, authoredBy: 'Explicit QA author' },
    },
    actor: {
      position: [4020, 7420, 26],
      startAuthority: { symbol: 'qa_start', source: 'Explicit QA start authority' },
      sourceStart: { rawTile: [100, 185], centerTile: [100.5, 185.5], worldPx: [4020, 7420] },
      authoredNote: { preserve: 'actor metadata' },
    },
    camera: { x: 4020, y: 7420, follow: true, authoredNote: 'camera metadata' },
    settings: { maxStep: 12, maxSlope: .6 },
    imageLayers,
    provenance: { kind: 'numeric-runtime-test-only', gameplayApplied: false, nested: { keep: [1, 'unaltered'] } },
  };
}
const player = (changes = {}) => ({ x: 4020, y: 7420, z: 26, radius: 15, ...changes });
const decoded = id => ({ id, naturalWidth: 32, naturalHeight: 32 });
function surface(layers) {
  const assets = new Map(layers.map(layer => [layer.src, { status: 'ready', image: decoded(layer.id) }]));
  const context = {
    globalAlpha: .8, stack: [], events: [],
    save() { this.stack.push(this.globalAlpha); },
    restore() { this.globalAlpha = this.stack.pop(); },
    beginPath() {}, rect() {}, clip() {},
    drawImage(...args) { this.events.push({ kind: 'image', id: args[0].id, args, alpha: this.globalAlpha }); },
  };
  const owner = { assets, camera: { x: 4020, y: 7420, follow: true }, width: 400, height: 300, player: player() };
  return { context, owner };
}

test('constructor validates the source schema and native map while isolating the authored source data', () => {
  const scene = authoredScene([imageLayer('ground')]);
  const consumer = new SourceSceneRuntime(scene, { width: 200, height: 200, tileSize: 40 });
  scene.nav.tiles[185 * 200 + 100] = 0;
  scene.imageLayers[0].src = 'assets/changed.png';
  assert.deepEqual([...consumer.requiredSources()], ['assets/source-runtime-qa/ground.png']);
  assert.equal(consumer.move(player(), 4020, 7420), true);
  const paths = consumer.requiredSources(); paths.clear();
  assert.equal(consumer.requiredSources().size, 1);
  assert.throws(() => new SourceSceneRuntime({}), TypeError);
  assert.throws(() => new SourceSceneRuntime(authoredScene(), { width: 200, height: 200, tileSize: 32 }), /native/);
  consumer.dispose();
});

test('ground exposes logical samples separately from the explicitly authored physical height mapping', () => {
  const consumer = new SourceSceneRuntime(authoredScene());
  const ground = consumer.ground(4020, 7420);
  near(ground.logicalHeight, .25); near(ground.height, 26);
  assert.equal(ground.surfaceId, 'source-ground');
  const second = authoredScene();
  second.height.heightMapping.scalePx = 80; second.height.heightMapping.offsetPx = 20;
  second.actor.position[2] = 40;
  const remapped = new SourceSceneRuntime(second);
  near(remapped.ground(4020, 7420).logicalHeight, .25);
  near(remapped.ground(4020, 7420).height, 40);
  assert.equal(consumer.snapshot(player()).ownedRaf, 0);
  consumer.dispose(); remapped.dispose();
});

test('source nav movement updates grounded XYZ and a rejected target leaves the player unchanged', () => {
  const scene = authoredScene(); scene.nav.tiles[185 * 200 + 102] = 0;
  const consumer = new SourceSceneRuntime(scene), actor = player();
  assert.equal(consumer.move(actor, 4060, 7420), true);
  assert.deepEqual([actor.x, actor.y, actor.z], [4060, 7420, 26]);
  near(consumer.logicalHeight, .25);
  const before = clone(actor);
  assert.equal(consumer.move(actor, 4100, 7420), false);
  assert.deepEqual(actor, before);
  assert.ok(typeof consumer.blockedReason === 'string' && consumer.blockedReason.length > 0);
  assert.equal(consumer.snapshot(actor).position[2], 26);
  const staleHeight = player({ z: 0 });
  assert.equal(consumer.move(staleHeight, 4060, 7420), false);
  assert.equal(consumer.blockedReason, 'ground-contact');
  assert.equal(staleHeight.z, 0);
  consumer.dispose();
});

test('all required source layers must decode and fit their crop even outside the current viewport', () => {
  const layers = [imageLayer('ground'), imageLayer('same-crop', 'world', { src: 'assets/source-runtime-qa/ground.png' }),
    imageLayer('offscreen', 'front', { worldRect: [0, 0, 100, 100] })];
  const consumer = new SourceSceneRuntime(authoredScene(layers));
  const { owner } = surface(layers);
  assert.equal(consumer.requiredSources().size, 2);
  assert.deepEqual(consumer.validateReady(owner.assets), { ok: true, errors: [] });
  for (const record of [undefined, { status: 'loading', image: decoded('pending') },
    { status: 'error', image: null }, { status: 'ready', image: { naturalWidth: 0, naturalHeight: 32 } },
    { status: 'ready', image: { naturalWidth: 15, naturalHeight: 32 } }]) {
    if (record === undefined) owner.assets.delete(layers[2].src);
    else owner.assets.set(layers[2].src, record);
    const result = consumer.validateReady(owner.assets);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(error => error.includes(layers[2].src)));
  }
  consumer.dispose();
});

test('approved ground/world/front images interleave the native actor by world Y without applying physical Z to painted XY', () => {
  const layers = [imageLayer('ground'), imageLayer('after', 'world', { depthY: 7450 }),
    imageLayer('before', 'world', { depthY: 7400 }), imageLayer('tie', 'world', { depthY: 7420 }), imageLayer('front', 'front')];
  const consumer = new SourceSceneRuntime(authoredScene(layers));
  const { context, owner } = surface(layers);
  const drawActor = (ctx, current) => { ctx.events.push({ kind: 'actor', y: current.player.y }); return 999; };
  const result = consumer.draw(context, owner, { drawActor });
  assert.deepEqual(result, { drawCalls: 5, visibleObjects: 5, imageMissing: 0 });
  assert.deepEqual(context.events.map(event => event.id || event.kind), ['ground', 'before', 'tie', 'actor', 'after', 'front']);
  const rectangles = context.events.filter(event => event.kind === 'image').map(event => event.args.slice(1));
  context.events.length = 0; owner.player.z = 1024;
  consumer.draw(context, owner, { drawActor });
  assert.deepEqual(context.events.filter(event => event.kind === 'image').map(event => event.args.slice(1)), rectangles);
  assert.deepEqual(rectangles[0], [0, 0, 16, 16, 100, 50, 200, 200]);
  assert.equal(context.globalAlpha, .8);
  assert.equal(context.stack.length, 0);
  assert.deepEqual(consumer.capture(player()).imageLayers.map(layer => layer.id), layers.map(layer => layer.id));
  consumer.dispose();
});

test('viewport culling and visible missing images produce bounded statistics without drawing replacement geometry', () => {
  const layers = [imageLayer('ground', 'ground', { opacity: .5 }),
    imageLayer('missing', 'world', { depthY: 7400 }), imageLayer('outside', 'front', { worldRect: [0, 0, 100, 100] })];
  const consumer = new SourceSceneRuntime(authoredScene(layers));
  const { context, owner } = surface(layers);
  owner.assets.delete(layers[1].src); owner.assets.delete(layers[2].src);
  let actorCalls = 0;
  const counts = consumer.draw(context, owner, { drawActor: () => { actorCalls++; } });
  assert.deepEqual(counts, { drawCalls: 1, visibleObjects: 1, imageMissing: 1 });
  assert.equal(context.events.length, 1); assert.equal(context.events[0].id, 'ground');
  assert.equal(context.events[0].alpha, .4); assert.equal(context.globalAlpha, .8);
  assert.equal(actorCalls, 1);
  const snapshot = consumer.snapshot(owner.player);
  assert.equal(snapshot.imageMissing, 1); assert.equal(snapshot.ownedImages, 0);
  snapshot.heightMapping.scalePx = 1;
  assert.equal(consumer.snapshot(owner.player).heightMapping.scalePx, 64);
  consumer.dispose();
});

test('capture preserves unknown source metadata and only updates live actor position and camera fields', () => {
  const scene = authoredScene([imageLayer('ground')]), before = clone(scene);
  const consumer = new SourceSceneRuntime(scene);
  const saved = consumer.capture(player({ x: 4060 }), { x: 4060, y: 7400, follow: false });
  assert.deepEqual(saved.actor.position, [4060, 7420, 26]);
  assert.deepEqual(saved.actor.sourceStart, scene.actor.sourceStart);
  assert.deepEqual(saved.actor.authoredNote, scene.actor.authoredNote);
  assert.deepEqual(saved.camera, { x: 4060, y: 7400, follow: false, authoredNote: 'camera metadata' });
  assert.deepEqual(saved.provenance, scene.provenance);
  saved.nav.tiles[0] = 0; saved.provenance.nested.keep[0] = 999; saved.imageLayers[0].src = 'assets/changed.png';
  assert.deepEqual(consumer.capture(player()), before);
  assert.deepEqual(scene, before);
  assert.throws(() => consumer.capture(player({ z: NaN })), TypeError);
  assert.throws(() => consumer.capture(player(), { x: 4020, y: 7420, follow: 'yes' }), TypeError);
  consumer.dispose();
});

test('dispose releases source references and remains inert without altering owner assets or scheduling work', () => {
  const layers = [imageLayer('ground')], consumer = new SourceSceneRuntime(authoredScene(layers));
  const { context, owner } = surface(layers), record = owner.assets.get(layers[0].src);
  consumer.draw(context, owner);
  const oldDraws = context.events.length;
  consumer.dispose(); consumer.dispose();
  assert.equal(consumer.scene, null);
  assert.equal(consumer.disposed, true);
  assert.equal(consumer.requiredSources().size, 0);
  assert.equal(consumer.validateReady(owner.assets).ok, false);
  assert.equal(consumer.move(owner.player, 4060, 7420), false);
  assert.equal(consumer.capture(owner.player, owner.camera), undefined);
  assert.equal(consumer.snapshot(owner.player), null);
  assert.throws(() => consumer.ground(4020, 7420), /disposed/);
  assert.deepEqual(consumer.draw(context, owner, { drawActor: () => assert.fail('disposed actor callback') }),
    { drawCalls: 0, visibleObjects: 0, imageMissing: 0 });
  assert.equal(context.events.length, oldDraws);
  assert.equal(owner.assets.get(layers[0].src), record);
});
