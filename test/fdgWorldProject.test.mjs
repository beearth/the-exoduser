import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_VERSION, WORLD_LIMITS, validateWorldProject, createWorldFixture, WorldProjectStore, WorldProjectValidationError } from '../engine/fdg/world-project.js';

function base() {
  return { schemaVersion: 1, id: 'base', name: 'Base test project',
    map: { width: 200, height: 200, tileSize: 40, tiles: Array(40000).fill(1), start: { x: 100, y: 185 }, exit: { x: 100, y: 20 }, objects: [] },
    characters: [{ id: 'warrior', name: 'Warrior', speed: 156, radius: 15, sprite: { src: 'img/test-unused.png', frameWidth: 1, frameHeight: 1, columns: 1, rows: 1, frames: 1, fps: 24, scale: 1, anchorX: 0.5, anchorY: 1 }, animations: { idle: { row: 0, start: 0, frames: 1, fps: 24, loop: true }, walk: { row: 0, start: 0, frames: 1, fps: 24, loop: true } } }],
    skills: [{ id: 'skill', name: 'Skill', cooldown: 1, cost: 1, range: 100, damage: 1, vfx: 'vfx' }],
    vfx: [{ id: 'vfx', name: 'VFX', kind: 'burst', color: '#AABBCC', count: 1, life: 1, speed: 0, size: 1, spread: 0 }],
    preview: { characterId: 'warrior', skillId: 'skill', vfxId: 'vfx', resourceMax: 100, resourceRegen: 10 } };
}
function pendingWorld() {
  return { worldVersion: 1, id: 'pending', name: 'Pending world', scope: 'MAP_PILOT',
    scenes: [{ id: 'pending-scene', name: 'Pending scene', project: null, sourceRef: 'future/file.fdg.json' }],
    areas: [{ areaKey: 'authored-area-key', name: 'Authored area', stageRef: 'CH1 / production description', sceneId: 'pending-scene', entrances: [{ id: 'entry', position: null, camera: null }], exits: [] }],
    transitions: [], progress: {}, state: { activeAreaKey: 'authored-area-key', regions: { 'authored-area-key': { visits: 0, data: {} } } } };
}

test('fixture reuses isolated terrain scenes and exact gate/portal coordinates', () => {
  const project = base(), before = structuredClone(project), world = createWorldFixture(project);
  assert.deepEqual(validateWorldProject(world), { ok: true, errors: [] });
  assert.deepEqual(project, before);
  assert.equal(WORLD_VERSION, 1); assert.equal(world.scope, 'ENGINE_FIXTURE');
  assert.equal(world.scenes.length, 2); assert.equal(world.areas.length, 2);
  assert.deepEqual(world.areas[0].entrances[0].position, [4020, 7420, 0]);
  assert.deepEqual(world.areas[0].exits[0].position, [4082.4, 7420, 0]);
  assert.deepEqual(world.areas[1].exits[0].position, [3957.6, 7420, 0]);
  assert.equal(world.areas[0].exits[0].radius, 12);
  assert.equal(world.progress.fixture_gate_open, false);
  assert.equal(world.scenes[0].project.terrainScene.camera.yaw, 0.45);
  assert.equal(world.scenes[1].project.terrainScene.camera.yaw, -0.45);
  world.scenes[1].project.terrainScene.nodes[0].position[0] = 0;
  assert.equal(world.scenes[0].project.terrainScene.nodes[0].position[0], 3920);
  assert.equal(project.terrainScene, undefined);
});

test('pending null scenes/arrivals and descriptive stageRef are structural authored data', () => {
  const world = pendingWorld(); world.metadata = { adopted: false, note: null };
  assert.equal(validateWorldProject(world).ok, true);
  world.areas[0].sceneId = null; world.scenes = [];
  assert.equal(validateWorldProject(world).ok, true);
  const store = new WorldProjectStore(world);
  assert.equal(store.project.areas[0].areaKey, 'authored-area-key');
  assert.equal(store.project.areas[0].stageRef, 'CH1 / production description');
  assert.deepEqual(store.project.metadata, { adopted: false, note: null });
});

test('malformed values, ranges and reserved ids reject without data mutation', () => {
  const cases = [null, [], undefined];
  for (const mutate of [
    w => { w.worldVersion = 2; }, w => { w.scope = 'PRODUCTION'; },
    w => { w.id = 'constructor'; }, w => { w.id = 'x'.repeat(121); },
    w => { w.areas[0].entrances[0].position = [0, 0, 1025]; },
    w => { w.areas[0].entrances[0].camera = { x: Infinity, y: 0, follow: false }; },
    w => { w.areas[0].entrances[0].camera = { x: 0, y: 0, follow: null }; },
    w => { w.progress.bad = 1; }, w => { w.state.regions['authored-area-key'].visits = -1; },
    w => { w.state.regions['authored-area-key'].actorPosition = [0, 8001, 0]; },
    w => { delete w.state.regions['authored-area-key'].data; },
    w => { w.scenes[0].project = { schemaVersion: 1 }; },
  ]) { const world = pendingWorld(); mutate(world); cases.push(world); }
  for (const value of cases) {
    const result = validateWorldProject(value);
    assert.equal(result.ok, false); assert.ok(result.errors.length > 0);
  }
  const world = createWorldFixture(base());
  for (const radius of [7.9, 160.1, NaN]) {
    world.areas[0].exits[0].radius = radius;
    assert.equal(validateWorldProject(world).ok, false);
  }
});

test('strong scene/area/portal/transition/gate and region references cannot alias stage descriptions', () => {
  const original = createWorldFixture(base());
  for (const mutate of [
    w => { w.areas[0].sceneId = 'missing'; },
    w => { w.transitions[0].to.areaKey = 'ENGINE_FIXTURE/B'; },
    w => { w.transitions[0].to.entranceId = 'missing'; },
    w => { w.transitions[0].from.exitId = 'missing'; },
    w => { w.transitions[0].gateKey = 'unknown'; },
    w => { w.areas[0].exits[0].transitionId = 'b_to_a'; },
    w => { w.state.activeAreaKey = 'ENGINE_FIXTURE/A'; },
    w => { w.state.regions['ENGINE_FIXTURE/A'] = { visits: 0, data: {} }; },
    w => { w.scenes.push(structuredClone(w.scenes[0])); },
    w => { w.areas.push(structuredClone(w.areas[0])); },
    w => { w.transitions.push(structuredClone(w.transitions[0])); },
    w => { w.areas[0].entrances.push(structuredClone(w.areas[0].entrances[0])); },
  ]) { const world = structuredClone(original); mutate(world); assert.equal(validateWorldProject(world).ok, false); }
});

test('JSON safety rejects getters, cycles, sparse arrays and unsafe metadata keys', () => {
  for (const mutate of [
    w => { w.metadata = w; }, w => { w.metadata = () => {}; },
    w => { w.metadata = new Date(); }, w => { w.metadata = NaN; },
    w => { w.metadata = [undefined]; }, w => { w.metadata = Array(2); },
    w => { w.metadata = JSON.parse('{"__proto__":1}'); },
    w => { w.metadata = []; w.metadata.extra = 1; },
  ]) { const world = pendingWorld(); mutate(world); assert.equal(validateWorldProject(world).ok, false); }
  let read = false; const world = pendingWorld();
  Object.defineProperty(world, 'metadata', { enumerable: true, get() { read = true; return 1; } });
  assert.equal(validateWorldProject(world).ok, false); assert.equal(read, false);
});

test('collection limits and UTF8 eightMiB budget are enforced for pending authoring', () => {
  assert.equal(WORLD_LIMITS.fileBytes, 8388608); assert.equal(WORLD_LIMITS.history, 80);
  const world = pendingWorld();
  world.scenes = Array.from({ length: 8 }, (_, i) => ({ id: `scene-${i}`, name: 'Pending', project: null }));
  world.areas[0].sceneId = 'scene-0';
  world.progress = Object.fromEntries(Array.from({ length: 32 }, (_, i) => [`gate-${i}`, false]));
  world.areas[0].entrances = Array.from({ length: 16 }, (_, i) => ({ id: `entry-${i}`, position: null, camera: null }));
  assert.equal(validateWorldProject(world).ok, true);
  world.scenes.push({ id: 'scene-8', name: 'Pending', project: null }); assert.equal(validateWorldProject(world).ok, false); world.scenes.pop();
  world.progress.extra = false; assert.equal(validateWorldProject(world).ok, false); delete world.progress.extra;
  world.areas[0].entrances.push({ id: 'extra', position: null, camera: null }); assert.equal(validateWorldProject(world).ok, false); world.areas[0].entrances.pop();
  world.metadata = '한'.repeat(Math.floor(WORLD_LIMITS.fileBytes / 3) + 1);
  assert.ok(validateWorldProject(world).errors.some(error => error.includes('8388608')));
});

test('world store transactions, clone isolation and bounded80 undo preserve authored metadata', () => {
  const world = pendingWorld(), store = new WorldProjectStore(world), events = [];
  const off = store.signals.on('changed', event => events.push(event));
  const copy = store.project; copy.name = 'Not applied'; assert.equal(store.project.name, world.name);
  assert.equal(store.change('No change', () => {}), false);
  for (let i = 1; i <= 85; i++) assert.equal(store.change(`data ${i}`, next => { next.state.regions['authored-area-key'].data = { value: i }; }), true);
  assert.equal(store.canUndo, true);
  for (let i = 0; i < 80; i++) assert.equal(store.undo(), true);
  assert.equal(store.undo(), false); assert.equal(store.project.state.regions['authored-area-key'].data.value, 5);
  for (let i = 0; i < 80; i++) assert.equal(store.redo(), true);
  assert.equal(store.redo(), false); assert.equal(store.project.state.regions['authored-area-key'].data.value, 85);
  const before = store.project;
  assert.throws(() => store.change('Bad', next => { next.state.activeAreaKey = 'missing'; }), WorldProjectValidationError);
  assert.deepEqual(store.project, before);
  assert.equal(store.undo(), true);
  assert.equal(store.change('Branch', next => { next.name = 'Branch'; }), true); assert.equal(store.canRedo, false);
  events[0].project.name = 'Event mutation'; assert.equal(store.project.name, 'Branch');
  off(); const count = events.length; store.change('Silent', next => { next.name = 'Silent'; }); assert.equal(events.length, count);
  store.dispose();
});
