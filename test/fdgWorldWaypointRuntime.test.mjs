import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime } from '../engine/fdg/runtime.js';
import { createWorldFixture, validateWorldProject } from '../engine/fdg/world-project.js';
import { WorldRuntime } from '../engine/fdg/world-runtime.js';

const A = 'engine_fixture_wp_a', B = 'engine_fixture_wp_b';
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);
class Target {
  constructor() { this.listeners = new Map(); this.adds = 0; this.removes = 0; }
  addEventListener(type, handler) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(handler); this.adds++; }
  removeEventListener(type, handler) { if (this.listeners.get(type)?.delete(handler)) this.removes++; }
  get count() { return [...this.listeners.values()].reduce((n, set) => n + set.size, 0); }
}
class Context {
  setTransform() {} fillRect() {} fillText() {} strokeText() {} drawImage() {} beginPath() {} moveTo() {} lineTo() {}
  closePath() {} arc() {} ellipse() {} stroke() {} fill() {} setLineDash() {} save() {} restore() {}
  createImageData(width, height) { return { data: new Uint8ClampedArray(width * height * 4) }; } putImageData() {}
}
class Canvas extends Target {
  constructor(document) { super(); this.ownerDocument = document; this.width = 128; this.height = 96; this.context = new Context(); this.attributes = new Map(); }
  getContext() { return this.context; } getBoundingClientRect() { return { left: 0, top: 0, width: 128, height: 96 }; }
  hasAttribute(key) { return this.attributes.has(key); } setAttribute(key, value) { this.attributes.set(key, value); }
  removeAttribute(key) { this.attributes.delete(key); } focus() {}
}
function fakeSurface() {
  const window = new Target(), document = new Target(), observers = [];
  window.devicePixelRatio = 1; window.frames = new Map(); window.requests = 0;
  window.requestAnimationFrame = callback => { const id = ++window.requests; window.frames.set(id, callback); return id; };
  window.cancelAnimationFrame = id => window.frames.delete(id);
  window.ResizeObserver = class { constructor() { this.disconnects = 0; observers.push(this); } observe() {} disconnect() { this.disconnects++; } };
  document.defaultView = window; document.elements = [];
  document.createElement = () => { const canvas = new Canvas(document); document.elements.push(canvas); return canvas; };
  const canvas = document.createElement('canvas');
  return { canvas, window, observers, listenerCount: () => window.count + document.count + document.elements.reduce((n, e) => n + e.count, 0), adds: () => window.adds + document.adds + document.elements.reduce((n, e) => n + e.adds, 0) };
}
function base() {
  return { schemaVersion: 1, id: 'base', name: 'Fresh waypoint runtime', map: { width: 200, height: 200, tileSize: 40, tiles: Array(40000).fill(1), start: { x: 100, y: 185 }, exit: { x: 100, y: 20 }, objects: [] },
    characters: [{ id: 'warrior', name: 'Warrior', speed: 156, radius: 15, sprite: { src: 'img/unused.png', frameWidth: 1, frameHeight: 1, columns: 1, rows: 1, frames: 1, fps: 24, scale: 1, anchorX: 0.5, anchorY: 1 }, animations: { idle: { row: 0, frames: 1, fps: 24, loop: true }, walk: { row: 0, frames: 1, fps: 24, loop: true } } }],
    skills: [{ id: 'skill', name: 'Skill', cooldown: 1, cost: 1, range: 100, damage: 1, vfx: 'vfx' }], vfx: [{ id: 'vfx', name: 'VFX', kind: 'burst', color: '#AABBCC', count: 1, life: 1, speed: 0, size: 1, spread: 0 }], preview: { characterId: 'warrior', skillId: 'skill', vfxId: 'vfx', resourceMax: 100, resourceRegen: 10 } };
}
async function setup(t, saved, mutate = () => {}) {
  const world = saved || createWorldFixture(base()); mutate(world);
  const surface = fakeSurface(), changes = [], statuses = []; let consumer;
  const initial = world.scenes.find(scene => scene.project)?.project;
  const owner = new FDGRuntime(surface.canvas, initial, { onStats: () => consumer?.observe() });
  consumer = new WorldRuntime(owner, world, { onChange: (captured, event) => changes.push({ captured, event }), onStatus: status => statuses.push(status) });
  t.after(() => { consumer.dispose(); owner.dispose(); });
  await owner.load(); assert.equal((await consumer.open()).ok, true);
  return { ...surface, owner, consumer, changes, statuses };
}
async function steps(consumer, direction, count) { let result; for (let i = 0; i < count; i++) result = await consumer.walk(direction); return result; }
async function activateA(s) {
  await steps(s.consumer, 'west', 2); await steps(s.consumer, 'south', 3);
  near(s.owner.player.x, 3988.8); near(s.owner.player.y, 7466.8);
  assert.equal(s.consumer.activateWaypoint(A).ok, true);
}
async function activateBoth(s) {
  await activateA(s); await steps(s.consumer, 'north', 3); await steps(s.consumer, 'east', 2);
  assert.equal((await steps(s.consumer, 'east', 4)).reason, 'gate-closed');
  await s.consumer.walk('west'); s.consumer.setProgress('fixture_gate_open', true); assert.equal((await s.consumer.walk('east')).ok, true);
  await steps(s.consumer, 'east', 2); await steps(s.consumer, 'south', 3);
  near(s.owner.player.x, 4051.2); near(s.owner.player.y, 7466.8);
  assert.equal(s.consumer.activateWaypoint(B).ok, true);
}

test('actual one-step movement discovers at radius24 and activation needs actual radius16', async t => {
  const s = await setup(t);
  assert.equal(s.consumer.waypointStatus(A).discovered, false);
  assert.equal(s.consumer.activateWaypoint(A).reason, 'undiscovered');
  await steps(s.consumer, 'west', 2); await s.consumer.walk('south');
  assert.equal(s.consumer.waypointStatus(A).discovered, false);
  await s.consumer.walk('south');
  const status = s.consumer.waypointStatus(A);
  assert.equal(status.discovered, true); assert.equal(status.active, false); assert.equal(status.canActivate, true);
  near(s.owner.player.x, 3988.8); near(s.owner.player.y, 7451.2); near(s.owner.player.z, 0);
  await s.consumer.walk('north'); assert.equal(s.consumer.activateWaypoint(A).reason, 'out-of-range');
  await steps(s.consumer, 'south', 2); assert.equal(s.consumer.activateWaypoint(A).ok, true);
  assert.equal(s.consumer.waypointStatus(A).active, true);
  assert.equal(s.consumer.activateWaypoint(A).reason, 'already-active');
  assert.equal(s.consumer.waypointStatus(B).discovered, false);
  assert.ok(s.consumer.events.some(event => event.type === 'waypoint-discovered'));
});

test('physically activated A/B travel obeys declared directed gate and reuses scene release', async t => {
  const s = await setup(t); await activateBoth(s);
  s.consumer.setRegionData('engine_fixture_b', { collected: true });
  const sourceB = s.owner._terrainScene;
  assert.equal((await s.consumer.travelWaypoint(A)).ok, true);
  assert.equal(s.consumer.world.state.activeAreaKey, 'engine_fixture_a'); near(s.owner.player.x, 4020); near(s.owner.player.y, 7420);
  assert.equal(sourceB.image, null); assert.equal(sourceB.depth, null); assert.equal(sourceB.scene, null);
  s.consumer.setProgress('fixture_gate_open', false);
  const sourceA = s.owner._terrainScene, visits = s.consumer.world.state.regions.engine_fixture_b.visits;
  assert.equal((await s.consumer.travelWaypoint(B)).reason, 'gate-closed');
  assert.equal(s.owner._terrainScene, sourceA); assert.ok(sourceA.depth); assert.equal(s.consumer.world.state.regions.engine_fixture_b.visits, visits);
  s.consumer.setProgress('fixture_gate_open', true); assert.equal((await s.consumer.travelWaypoint(B)).ok, true);
  assert.equal(s.consumer.world.state.activeAreaKey, 'engine_fixture_b'); near(s.owner.player.x, 4020);
  assert.equal(sourceA.image, null); assert.deepEqual(s.consumer.world.state.regions.engine_fixture_b.data, { collected: true });
  assert.equal(s.consumer.world.state.waypoints[A].active, true); assert.equal(s.consumer.world.state.waypoints[B].active, true);
});

test('discovery on same observed exit edge commits before source capture/transition', async t => {
  const s = await setup(t, null, world => {
    world.progress.fixture_gate_open = true;
    world.waypoints[0].position = [...world.areas[0].exits[0].position];
    world.waypoints[0].discoveryRadius = 8; world.waypoints[0].activationRadius = 8;
  });
  await steps(s.consumer, 'east', 3); assert.equal(s.consumer.world.state.waypoints[A].discovered, false);
  await s.consumer.walk('east');
  assert.equal(s.consumer.world.state.activeAreaKey, 'engine_fixture_b'); assert.equal(s.consumer.world.state.waypoints[A].discovered, true);
  const discovered = s.changes.find(change => change.event.type === 'waypoint-discovered');
  const transition = s.changes.find(change => change.event.type === 'transition');
  assert.ok(discovered.event.sequence < transition.event.sequence);
  assert.equal(transition.captured.state.waypoints[A].discovered, true);
});

test('legitimately saved active waypoint still cannot enter pending scene/arrival', async t => {
  const original = await setup(t); await activateBoth(original); await original.consumer.travelWaypoint(A);
  const saved = original.consumer.capture();
  for (const [reason, mutate] of [
    ['unresolved-scene', w => { w.scenes[1].project = null; }],
    ['unresolved-arrival', w => { w.areas[1].entrances[0].position = null; }],
  ]) {
    const data = structuredClone(saved); mutate(data); assert.equal(validateWorldProject(data).ok, true);
    const s = await setup(t, data), source = s.owner._terrainScene, visits = s.consumer.world.state.regions.engine_fixture_b.visits;
    assert.equal((await s.consumer.travelWaypoint(B)).reason, reason);
    assert.equal(s.owner._terrainScene, source); assert.ok(source.image);
    assert.equal(s.consumer.world.state.activeAreaKey, 'engine_fixture_a'); assert.equal(s.consumer.world.state.regions.engine_fixture_b.visits, visits);
  }
});

test('save/reopen preserves activation flags and waypoint metadata with actual actor state', async t => {
  const s = await setup(t, null, world => { world.waypoints[0].note = { authored: true }; world.state.waypoints[A].memo = ['keep']; });
  await activateA(s);
  const saved = JSON.parse(JSON.stringify(s.consumer.capture()));
  const reopened = await setup(t, saved);
  near(reopened.owner.player.x, 3988.8); near(reopened.owner.player.y, 7466.8);
  assert.equal(reopened.consumer.waypointStatus(A).active, true); assert.equal(reopened.consumer.waypointStatus(A).discovered, true);
  assert.deepEqual(reopened.consumer.world.waypoints[0].note, { authored: true }); assert.deepEqual(reopened.consumer.world.state.waypoints[A].memo, ['keep']);
  assert.equal(reopened.consumer.world.state.regions.engine_fixture_a.visits, 1);
});

test('compact view excludes project/region/unknown data and never clones whole world', async t => {
  const s = await setup(t, null, world => { world.metadata = { secret: 'omit' }; world.areas[0].metadata = { secret: 'omit' }; world.state.regions.engine_fixture_a.data = { large: Array(30000).fill('omit') }; });
  const structured = globalThis.structuredClone;
  const cloned = [];
  globalThis.structuredClone = value => {
    assert.notEqual(value, s.consumer._world);
    assert.ok(!value?.map?.tiles && !value?.state?.regions, 'no full scene/world cloned');
    cloned.push(value); return structured(value);
  };
  let view;
  try { view = s.consumer.getViewState(); } finally { globalThis.structuredClone = structured; }
  assert.ok(cloned.length <= 1); assert.equal(view.scenes, undefined); assert.equal(view.metadata, undefined);
  assert.equal(view.areas[0].metadata, undefined); assert.equal(view.state.regions.engine_fixture_a.data, undefined);
  assert.ok(JSON.stringify(view).length < 5000);
  view.areas[0].entrances[0].position[0] = 0; view.progress.fixture_gate_open = true; view.waypoints[1].travelGateKeys.push('wrong');
  assert.equal(s.consumer.world.areas[0].entrances[0].position[0], 4020);
  assert.equal(s.consumer.world.progress.fixture_gate_open, false); assert.deepEqual(s.consumer.world.waypoints[1].travelGateKeys, ['fixture_gate_open']);
});

test('waypoint travel async lock/dispose protects callbacks and adds no RAF/listeners', async t => {
  const s = await setup(t); await activateBoth(s);
  const adds = s.adds(), listeners = s.listenerCount(), enter = s.owner.enterScene.bind(s.owner); let release, entered;
  const started = new Promise(resolve => { entered = resolve; });
  s.owner.enterScene = async (...args) => { await enter(...args); entered(); await new Promise(resolve => { release = resolve; }); return s.owner; };
  const pending = s.consumer.travelWaypoint(A); await started;
  assert.equal(s.consumer.busy, true); assert.equal(s.consumer.waypointStatus(B).travelReason, 'busy');
  assert.equal(s.consumer.activateWaypoint(B).reason, 'busy'); assert.equal((await s.consumer.travelWaypoint(B)).reason, 'busy');
  const changes = s.changes.length, state = s.consumer.world;
  s.consumer.dispose(); release(); assert.equal((await pending).reason, 'disposed');
  assert.equal(s.changes.length, changes); assert.deepEqual(s.consumer.world, state);
  assert.equal(s.consumer.waypointStatus(A).travelReason, 'disposed'); assert.equal(s.consumer.discover().reason, 'disposed');
  assert.equal(s.adds(), adds); assert.equal(s.listenerCount(), listeners); assert.equal(s.observers.length, 1);
  assert.equal(s.consumer.ownedRaf, 0); assert.equal(s.consumer.ownedListeners, 0); assert.equal(s.consumer.ownedTimers, 0);
  assert.equal(s.window.frames.size, 0); assert.equal(s.owner.assets.size, 0);
});
