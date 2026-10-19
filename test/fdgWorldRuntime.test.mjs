import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime } from '../engine/fdg/runtime.js';
import { createWorldFixture, validateWorldProject } from '../engine/fdg/world-project.js';
import { WorldRuntime } from '../engine/fdg/world-runtime.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);
class Target {
  constructor() { this.listeners = new Map(); this.adds = 0; this.removes = 0; }
  addEventListener(type, handler) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(handler); this.adds++; }
  removeEventListener(type, handler) { if (this.listeners.get(type)?.delete(handler)) this.removes++; }
  emit(type, fields) { const event = { ...fields, preventDefault() {} }; for (const handler of this.listeners.get(type) || []) handler(event); }
  get count() { return [...this.listeners.values()].reduce((n, set) => n + set.size, 0); }
}
class Context {
  setTransform() {} fillRect() {} fillText() {} drawImage() {} beginPath() {} moveTo() {} lineTo() {}
  closePath() {} arc() {} stroke() {} fill() {} setLineDash() {} save() {} restore() {}
  createImageData(width, height) { return { data: new Uint8ClampedArray(width * height * 4) }; }
  putImageData() {}
}
class Canvas extends Target {
  constructor(document) { super(); this.ownerDocument = document; this.width = 128; this.height = 96; this.context = new Context(); this.attributes = new Map(); }
  getContext() { return this.context; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 128, height: 96 }; }
  hasAttribute(key) { return this.attributes.has(key); } setAttribute(key, value) { this.attributes.set(key, value); }
  removeAttribute(key) { this.attributes.delete(key); } focus() {}
}
function surface() {
  const window = new Target(), document = new Target(), observers = [];
  window.devicePixelRatio = 1; window.frames = new Map(); window.requests = 0;
  window.requestAnimationFrame = callback => { const id = ++window.requests; window.frames.set(id, callback); return id; };
  window.cancelAnimationFrame = id => window.frames.delete(id);
  window.ResizeObserver = class { constructor() { this.observed = new Set(); this.disconnects = 0; observers.push(this); } observe(canvas) { this.observed.add(canvas); } disconnect() { this.observed.clear(); this.disconnects++; } };
  document.defaultView = window; document.hidden = false; document.elements = [];
  document.createElement = tag => { assert.equal(tag, 'canvas'); const canvas = new Canvas(document); document.elements.push(canvas); return canvas; };
  const canvas = document.createElement('canvas');
  return { window, document, canvas, observers,
    listeners: () => window.count + document.count + document.elements.reduce((n, element) => n + element.count, 0),
    adds: () => window.adds + document.adds + document.elements.reduce((n, element) => n + element.adds, 0),
    removes: () => window.removes + document.removes + document.elements.reduce((n, element) => n + element.removes, 0) };
}
function base() {
  return { schemaVersion: 1, id: 'world-base', name: 'World runtime fresh fixture',
    map: { width: 200, height: 200, tileSize: 40, tiles: Array(40000).fill(1), start: { x: 100, y: 185 }, exit: { x: 100, y: 20 }, objects: [] },
    characters: [{ id: 'warrior', name: 'Warrior', speed: 156, radius: 15, sprite: { src: 'img/test-unused.png', frameWidth: 1, frameHeight: 1, columns: 1, rows: 1, frames: 1, fps: 24, scale: 1, anchorX: 0.5, anchorY: 1 }, animations: { idle: { row: 0, start: 0, frames: 1, fps: 24, loop: true }, walk: { row: 0, start: 0, frames: 1, fps: 24, loop: true } } }],
    skills: [{ id: 'skill', name: 'Skill', cooldown: 1, cost: 1, range: 100, damage: 1, vfx: 'vfx' }],
    vfx: [{ id: 'vfx', name: 'VFX', kind: 'burst', color: '#AABBCC', count: 1, life: 1, speed: 0, size: 1, spread: 0 }],
    preview: { characterId: 'warrior', skillId: 'skill', vfxId: 'vfx', resourceMax: 100, resourceRegen: 10 } };
}
async function setup(t, mutate = () => {}, saved = null) {
  const world = saved || createWorldFixture(base()); mutate(world);
  const ui = surface(), changes = [], statuses = [];
  let consumer;
  const initial = world.scenes.find(scene => scene.project?.terrainScene)?.project || createWorldFixture(base()).scenes[0].project;
  const owner = new FDGRuntime(ui.canvas, initial, { onStats: () => consumer?.observe() });
  consumer = new WorldRuntime(owner, world, { onChange: (capture, event) => changes.push({ capture, event }), onStatus: result => statuses.push(result) });
  assert.equal(consumer.opened, false);
  t.after(() => { consumer.dispose(); owner.dispose(); });
  await owner.load();
  const opened = await consumer.open({ restore: true });
  return { ...ui, owner, consumer, world, changes, statuses, opened };
}
async function reachAExit(consumer) { let result; for (let i = 0; i < 4; i++) result = await consumer.walk('east'); return result; }
async function enterB(consumer) {
  assert.equal((await reachAExit(consumer)).reason, 'gate-closed');
  assert.equal(consumer.setProgress('fixture_gate_open', true), true);
  assert.equal(consumer.observe().reason, 'latched');
  await consumer.walk('west'); const result = await consumer.walk('east'); assert.equal(result.ok, true); return result;
}

test('gate refusal retains source and unlock requires physical exit/re-entry before A→B→A', async t => {
  const s = await setup(t), { owner, consumer } = s;
  assert.equal(s.opened.ok, true); assert.equal(consumer.world.state.regions.engine_fixture_a.visits, 1);
  assert.equal(consumer.opened, true);
  const source = owner._terrainScene, sourceBuffer = source.image, sourceProjectId = owner.project.id;
  assert.equal((await reachAExit(consumer)).reason, 'gate-closed');
  near(owner.player.x, 4082.4); near(owner.player.y, 7420);
  assert.equal(owner._terrainScene, source); assert.equal(source.image, sourceBuffer); assert.equal(owner.project.id, sourceProjectId);
  assert.equal(consumer.setRegionData('engine_fixture_a', { chestOpen: true, payload: ['keep'] }), true);
  assert.equal(consumer.setProgress('fixture_gate_open', true), true);
  assert.equal(consumer.observe().reason, 'latched'); assert.equal(consumer.world.state.activeAreaKey, 'engine_fixture_a');
  await consumer.walk('west'); near(owner.player.x, 4066.8);
  assert.equal((await consumer.walk('east')).ok, true);
  assert.equal(consumer.world.state.activeAreaKey, 'engine_fixture_b'); near(owner.player.x, 4020); near(owner.player.z, 0);
  assert.equal(owner.project.id, 'engine_fixture_scene_b'); assert.equal(owner.getTerrainSceneSnapshot().camera.yaw, -0.45);
  assert.equal(source.scene, null); assert.equal(source.image, null); assert.equal(source.depth, null); assert.deepEqual(source.meshes, []);
  let back; for (let i = 0; i < 4; i++) back = await consumer.walk('west');
  assert.equal(back.ok, true); assert.equal(consumer.world.state.activeAreaKey, 'engine_fixture_a'); near(owner.player.x, 4020);
  assert.equal(consumer.world.state.regions.engine_fixture_a.visits, 2);
  assert.equal(consumer.world.state.regions.engine_fixture_b.visits, 1);
  assert.deepEqual(consumer.world.state.regions.engine_fixture_a.data, { chestOpen: true, payload: ['keep'] });
  assert.equal(owner.assets.size, 0); assert.equal(consumer.ownedRaf, 0); assert.equal(consumer.ownedListeners, 0); assert.equal(consumer.ownedTimers, 0);
});

test('disabled, unresolved target/arrival and unsupported scene fail before releasing source', async t => {
  for (const [reason, mutate] of [
    ['disabled', w => { w.transitions[0].enabled = false; }],
    ['unresolved-scene', w => { w.scenes[1].project = null; }],
    ['unresolved-scene', w => { w.areas[1].sceneId = null; }],
    ['unresolved-arrival', w => { w.areas[1].entrances[0].position = null; }],
    ['unsupported-scene', w => { delete w.scenes[1].project.terrainScene; }],
  ]) {
    const s = await setup(t, mutate), original = s.owner._terrainScene;
    assert.equal(s.consumer.setProgress('fixture_gate_open', true), true);
    const result = await reachAExit(s.consumer);
    assert.equal(result.reason, reason); assert.equal(result.ok, false);
    assert.equal(s.owner._terrainScene, original); assert.ok(original.image && original.scene);
    assert.equal(s.consumer.world.state.activeAreaKey, 'engine_fixture_a');
    assert.equal(s.consumer.world.state.regions.engine_fixture_b.visits, 0); assert.equal(s.owner.assets.size, 0);
  }
});

test('invalid target arrival is rejected by owner before setProject and world commit', async t => {
  const s = await setup(t, w => { w.areas[1].entrances[0].position = [3781, 7420, 0]; });
  s.consumer.setProgress('fixture_gate_open', true);
  const source = s.owner._terrainScene;
  const result = await reachAExit(s.consumer);
  assert.equal(result.reason, 'entry-failed'); assert.ok(result.detail.includes('bounds'));
  assert.equal(s.owner._terrainScene, source); assert.ok(source.depth);
  assert.equal(s.consumer.world.state.activeAreaKey, 'engine_fixture_a'); near(s.owner.player.x, 4082.4);
});

test('capture, region metadata and saved active actor/camera reopen without incrementing visits', async t => {
  const s = await setup(t, w => { w.metadata = { stageAdopted: false }; w.scenes[1].project.terrainScene.actor.note = { authored: 'keep' }; });
  await enterB(s.consumer); await s.consumer.walk('south'); await s.consumer.walk('south');
  s.owner.setCamera(4040, 7400);
  assert.equal(s.consumer.setRegionData('engine_fixture_b', { explored: true, count: 7, detail: null }), true);
  const captured = s.consumer.capture();
  assert.equal(captured.state.activeAreaKey, 'engine_fixture_b');
  near(captured.state.regions.engine_fixture_b.actorPosition[1], 7451.2);
  assert.equal(captured.state.regions.engine_fixture_b.visits, 1);
  assert.deepEqual(captured.state.regions.engine_fixture_b.camera, { x: 4040, y: 7400, follow: false });
  const saved = JSON.parse(JSON.stringify(captured)); assert.equal(validateWorldProject(saved).ok, true);
  captured.state.regions.engine_fixture_b.data.count = 99;
  assert.equal(s.consumer.capture().state.regions.engine_fixture_b.data.count, 7);
  const reopened = await setup(t, () => {}, saved);
  assert.equal(reopened.opened.restored, true); near(reopened.owner.player.x, 4020); near(reopened.owner.player.y, 7451.2);
  assert.deepEqual(reopened.owner.camera, { x: 4040, y: 7400, follow: false });
  assert.equal(reopened.consumer.world.state.regions.engine_fixture_b.visits, 1);
  assert.deepEqual(reopened.owner.project.terrainScene.actor.note, { authored: 'keep' });
  assert.deepEqual(reopened.consumer.world.metadata, { stageAdopted: false });
});

test('open inside an exit latches it and cannot auto loop until actual movement leaves/re-enters', async t => {
  const s = await setup(t, w => { w.areas[0].exits[0].position = [...w.areas[0].entrances[0].position]; w.progress.fixture_gate_open = true; });
  assert.equal(s.consumer.observe().reason, 'latched'); assert.equal(s.consumer.world.state.activeAreaKey, 'engine_fixture_a');
  await s.consumer.walk('east'); near(s.owner.player.x, 4035.6);
  const result = await s.consumer.walk('west'); assert.equal(result.ok, true);
  assert.equal(s.consumer.world.state.activeAreaKey, 'engine_fixture_b');
});

test('portal height tolerance16 compares actual grounded Z without teleporting actor', async t => {
  const outside = await setup(t, w => { w.areas[0].exits[0].position[2] = 17; w.progress.fixture_gate_open = true; });
  assert.equal((await reachAExit(outside.consumer)).reason, 'outside-exit'); assert.equal(outside.consumer.world.state.activeAreaKey, 'engine_fixture_a');
  const edge = await setup(t, w => { w.areas[0].exits[0].position[2] = 16; w.progress.fixture_gate_open = true; });
  assert.equal((await reachAExit(edge.consumer)).ok, true); assert.equal(edge.consumer.world.state.activeAreaKey, 'engine_fixture_b');
});

test('busy async entry locks observe/open/walk/progress and performs one scene entry', async t => {
  const s = await setup(t), { consumer, owner } = s;
  await reachAExit(consumer); await consumer.walk('west'); consumer.setProgress('fixture_gate_open', true);
  const enter = owner.enterScene.bind(owner); let release, calls = 0;
  owner.enterScene = async (...args) => { calls++; await new Promise(resolve => { release = resolve; }); return enter(...args); };
  const source = owner._terrainScene, pending = consumer.walk('east'); await Promise.resolve();
  assert.equal(consumer.busy, true); assert.ok(consumer.pending); assert.equal(owner._terrainScene, source);
  assert.equal(consumer.observe().reason, 'busy'); assert.equal((await consumer.open()).reason, 'busy'); assert.equal((await consumer.walk('west')).reason, 'busy');
  assert.equal(consumer.setProgress('fixture_gate_open', false), false); assert.equal(consumer.setRegionData('engine_fixture_a', {}), false);
  assert.equal(calls, 1); release(); assert.equal((await pending).ok, true);
  assert.equal(consumer.busy, false); assert.equal(consumer.pending, null); assert.equal(calls, 1); assert.equal(consumer.world.state.activeAreaKey, 'engine_fixture_b');
});

test('late async completion after consumer dispose cannot commit world or invoke callbacks', async t => {
  const s = await setup(t), { consumer, owner } = s;
  await reachAExit(consumer); await consumer.walk('west'); consumer.setProgress('fixture_gate_open', true);
  const enter = owner.enterScene.bind(owner); let release, entered;
  const hasEntered = new Promise(resolve => { entered = resolve; });
  owner.enterScene = async (...args) => { await enter(...args); entered(); await new Promise(resolve => { release = resolve; }); return owner; };
  const pending = consumer.walk('east'); await hasEntered;
  const changes = s.changes.length, statuses = s.statuses.length, before = consumer.world;
  consumer.dispose(); release(); const result = await pending;
  assert.equal(result.reason, 'disposed'); assert.deepEqual(consumer.world, before);
  assert.equal(s.changes.length, changes); assert.equal(s.statuses.length, statuses);
  assert.equal(consumer.busy, false); assert.equal(consumer.pending, null); assert.equal(consumer.owner, null);
  assert.equal(consumer.observe().reason, 'disposed'); assert.equal((await consumer.walk('west')).reason, 'disposed');
});

test('rejected actual input edges keep bounded32 independent event records', async t => {
  const s = await setup(t); await reachAExit(s.consumer);
  for (let i = 0; i < 36; i++) { await s.consumer.walk('west'); assert.equal((await s.consumer.walk('east')).reason, 'gate-closed'); }
  const records = s.consumer.events;
  assert.equal(records.length, 32); assert.ok(records.every(event => event.reason === 'gate-closed'));
  assert.ok(records.every((event, i) => i === 0 || event.sequence === records[i - 1].sequence + 1));
  records[0].reason = 'mutated'; assert.equal(s.consumer.events[0].reason, 'gate-closed');
  assert.equal(s.consumer.setProgress('missing', true), false); assert.equal(s.consumer.setRegionData('missing', {}), false);
  assert.equal(s.consumer.setRegionData('engine_fixture_a', { bad: Infinity }), false);
});

test('world consumer adds no owner listeners/RAF and release follows owner scene entry/dispose', async t => {
  const s = await setup(t), { owner, consumer } = s;
  const adds = s.adds(), count = s.listeners(), first = owner._terrainScene;
  owner.start(); assert.equal(s.window.frames.size, 1);
  await enterB(consumer);
  assert.equal(s.adds(), adds); assert.equal(s.listeners(), count); assert.equal(s.observers.length, 1);
  assert.equal(s.window.frames.size, 0); assert.equal(first.image, null); assert.equal(first.raster, null); assert.equal(first.depth, null);
  const target = owner._terrainScene;
  consumer.dispose(); assert.equal(s.listeners(), count, 'consumer dispose does not dispose shared owner');
  assert.equal(consumer.opened, false);
  owner.dispose(); assert.equal(s.listeners(), 0); assert.equal(s.removes(), s.adds()); assert.equal(s.observers[0].disconnects, 1);
  assert.equal(target.image, null); assert.equal(target.depth, null); assert.equal(s.window.frames.size, 0);
  const requests = s.window.requests; await consumer.open(); consumer.observe(); await consumer.walk('east'); assert.equal(s.window.requests, requests);
});
