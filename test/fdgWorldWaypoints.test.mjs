import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorldFixture, validateWorldProject, WorldProjectStore } from '../engine/fdg/world-project.js';
import { attachFixtureWaypoints, WAYPOINT_LIMITS, findWaypointRoute, getWaypointStatus, waypointInRange } from '../engine/fdg/world-waypoints.js';

function base() {
  return { schemaVersion: 1, id: 'base', name: 'Waypoint fixture', map: { width: 200, height: 200, tileSize: 40, tiles: Array(40000).fill(1), start: { x: 100, y: 185 }, exit: { x: 100, y: 20 }, objects: [] },
    characters: [{ id: 'warrior', name: 'Warrior', speed: 156, radius: 15, sprite: { src: 'img/unused.png', frameWidth: 1, frameHeight: 1, columns: 1, rows: 1, frames: 1, fps: 24, scale: 1, anchorX: 0.5, anchorY: 1 }, animations: { idle: { row: 0, frames: 1, fps: 24, loop: true }, walk: { row: 0, frames: 1, fps: 24, loop: true } } }],
    skills: [{ id: 'skill', name: 'Skill', cooldown: 1, cost: 1, range: 100, damage: 1, vfx: 'vfx' }], vfx: [{ id: 'vfx', name: 'VFX', kind: 'burst', color: '#AABBCC', count: 1, life: 1, speed: 0, size: 1, spread: 0 }], preview: { characterId: 'warrior', skillId: 'skill', vfxId: 'vfx', resourceMax: 100, resourceRegen: 10 } };
}
const fixture = createWorldFixture(base());
const fresh = () => structuredClone(fixture);
const a = 'engine_fixture_wp_a', b = 'engine_fixture_wp_b';

test('optional waypoints preserve old saves; fixture attachment is isolated and preserves authored definitions', () => {
  const old = fresh(); delete old.waypoints; delete old.state.waypoints;
  assert.equal(validateWorldProject(old).ok, true);
  const before = structuredClone(old), attached = attachFixtureWaypoints(old);
  assert.deepEqual(old, before); assert.equal(validateWorldProject(attached).ok, true);
  assert.deepEqual(attached.waypoints.map(point => point.position), [[3988.8, 7466.8, 0], [4051.2, 7466.8, 0]]);
  assert.deepEqual(attached.waypoints.map(point => [point.discoveryRadius, point.activationRadius, point.arrivalId]), [[24, 16, 'arrival'], [24, 16, 'arrival']]);
  assert.deepEqual(attached.waypoints[1].travelGateKeys, ['fixture_gate_open']);
  attached.waypoints[0].name = 'Authored'; attached.waypoints[0].metadata = { keep: true };
  attached.state.waypoints[a] = { discovered: true, active: true, note: 'retain' };
  const retained = attachFixtureWaypoints(attached); assert.deepEqual(retained, attached);
  retained.waypoints[0].metadata.keep = false; assert.equal(attached.waypoints[0].metadata.keep, true);
  const empty = fresh(); empty.waypoints = []; empty.state.waypoints = {};
  assert.deepEqual(attachFixtureWaypoints(empty).waypoints, []);
});

test('waypoint radius/position/strong references and active implies discovered are enforced', () => {
  for (const mutate of [
    w => { w.waypoints = null; }, w => { w.waypoints[0].id = 'constructor'; },
    w => { w.waypoints.push(structuredClone(w.waypoints[0])); }, w => { w.waypoints[0].areaKey = 'ENGINE_FIXTURE/A'; },
    w => { w.waypoints[0].arrivalId = 'missing'; }, w => { w.waypoints[0].position[2] = 1025; },
    w => { w.waypoints[0].discoveryRadius = 7.9; }, w => { w.waypoints[0].activationRadius = 25; },
    w => { w.waypoints[0].discoveryRadius = 161; }, w => { w.waypoints[0].position[0] = NaN; },
    w => { w.waypoints[0].travelGateKeys = ['missing']; }, w => { w.waypoints[1].travelGateKeys.push('fixture_gate_open'); },
    w => { w.state.waypoints[a] = { discovered: false, active: true }; }, w => { w.state.waypoints[a].discovered = 1; },
    w => { w.state.waypoints.missing = { discovered: false, active: false }; }, w => { w.state.waypoints = null; },
  ]) { const world = fresh(); mutate(world); assert.equal(validateWorldProject(world).ok, false); }
  const world = fresh(); world.waypoints = Array.from({ length: 64 }, (_, i) => ({ ...structuredClone(world.waypoints[0]), id: `point-${i}` })); world.state.waypoints = {};
  assert.equal(WAYPOINT_LIMITS.waypoints, 64); assert.equal(validateWorldProject(world).ok, true);
  world.waypoints.push({ ...structuredClone(world.waypoints[0]), id: 'point-64' }); assert.equal(validateWorldProject(world).ok, false);
});

test('waypoint state/unknown metadata survives independent store save and failed edit', () => {
  const world = fresh(); world.waypoints[0].metadata = { authored: 'keep' }; world.state.waypoints[a].memo = ['keep'];
  const store = new WorldProjectStore(world);
  assert.equal(store.change('Activate', next => { next.state.waypoints[a].discovered = true; next.state.waypoints[a].active = true; }), true);
  const saved = JSON.parse(JSON.stringify(store.project)); assert.equal(validateWorldProject(saved).ok, true);
  assert.deepEqual(saved.waypoints[0].metadata, { authored: 'keep' }); assert.deepEqual(saved.state.waypoints[a].memo, ['keep']);
  const before = store.project;
  assert.throws(() => store.change('Invalid', next => { next.state.waypoints[a].discovered = false; })); assert.deepEqual(store.project, before);
  store.dispose();
});

test('directed route search honors gate AND/enabled and cannot invent reverse or absent routes', () => {
  const world = fresh(), A = 'engine_fixture_a', B = 'engine_fixture_b';
  assert.equal(findWaypointRoute(world, A, B).reason, 'gate-closed');
  assert.deepEqual(findWaypointRoute(world, B, A), { ok: true, reason: null, route: ['b_to_a'] });
  world.progress.fixture_gate_open = true; assert.deepEqual(findWaypointRoute(world, A, B).route, ['a_to_b']);
  world.transitions[0].enabled = false; assert.equal(findWaypointRoute(world, A, B).reason, 'disabled-route');
  world.transitions = [world.transitions[1]]; assert.equal(findWaypointRoute(world, A, B).reason, 'no-route');
  assert.deepEqual(findWaypointRoute(world, A, A), { ok: true, reason: null, route: [] });
  assert.equal(findWaypointRoute(world, A, 'missing').reason, 'no-route');
});

test('waypoint ranges use same area, XY circle and actual Z tolerance16', () => {
  const point = fixture.waypoints[0], [x, y] = point.position;
  assert.equal(waypointInRange(point, [x + 24, y, 16], point.areaKey, 24), true);
  assert.equal(waypointInRange(point, [x + 24.001, y, 0], point.areaKey, 24), false);
  assert.equal(waypointInRange(point, [x, y, 16.001], point.areaKey, 24), false);
  assert.equal(waypointInRange(point, [x, y, 0], 'engine_fixture_b', 24), false);
  assert.equal(waypointInRange(point, [NaN, y, 0], point.areaKey, 24), false);
});

test('pure status separates discovery/activation/travel and does not change inputs', () => {
  const world = fresh(), point = world.waypoints[0], before = structuredClone(world);
  assert.equal(getWaypointStatus(world, a, { position: point.position }).activationReason, 'undiscovered');
  assert.deepEqual(world, before);
  world.state.waypoints[a].discovered = true;
  assert.equal(getWaypointStatus(world, a, { position: point.position }).canActivate, true);
  assert.equal(getWaypointStatus(world, a, { position: [4020, 7420, 0] }).activationReason, 'out-of-range');
  assert.equal(getWaypointStatus(world, a, { areaKey: 'engine_fixture_b', position: point.position }).activationReason, 'wrong-area');
  assert.equal(getWaypointStatus(world, a).travelReason, 'inactive');
  world.state.waypoints[a].active = true; assert.equal(getWaypointStatus(world, a).canTravel, true);
  assert.equal(getWaypointStatus(world, a, { busy: true }).travelReason, 'busy');
  assert.equal(getWaypointStatus(world, a, { disposed: true }).activationReason, 'disposed');
  assert.equal(getWaypointStatus(world, a, { opened: false }).travelReason, 'not-open');
  assert.equal(getWaypointStatus(world, 'missing').travelReason, 'unknown-waypoint');
});

test('travel target gates AND plus every directed boss-route gate remain mandatory', () => {
  const world = fresh(); world.state.waypoints[b] = { discovered: true, active: true }; world.progress.fixture_gate_open = true;
  world.progress.boss_clear = false; world.waypoints[1].travelGateKeys.push('boss_clear');
  assert.equal(getWaypointStatus(world, b).travelReason, 'gate-closed');
  world.progress.boss_clear = true; assert.equal(getWaypointStatus(world, b).canTravel, true);
  world.areas.push({ areaKey: 'boss_room', name: 'Boss', stageRef: 'FIXTURE/BOSS', sceneId: 'scene_b', entrances: [{ id: 'arrival', position: [4020, 7420, 0], camera: null }], exits: [] });
  world.transitions.push({ id: 'b_to_boss', from: { areaKey: 'engine_fixture_b', exitId: 'boss_exit' }, to: { areaKey: 'boss_room', entranceId: 'arrival' }, gateKey: 'boss_clear', enabled: true });
  world.waypoints.push({ ...structuredClone(world.waypoints[0]), id: 'boss_wp', areaKey: 'boss_room' }); world.state.waypoints.boss_wp = { discovered: true, active: true };
  world.progress.boss_clear = false; assert.equal(getWaypointStatus(world, 'boss_wp').travelReason, 'gate-closed');
  world.progress.boss_clear = true; assert.deepEqual(getWaypointStatus(world, 'boss_wp').route, ['a_to_b', 'b_to_boss']);
  world.transitions[2].enabled = false; assert.equal(getWaypointStatus(world, 'boss_wp').travelReason, 'disabled-route');
});

test('pending route scenes/arrivals and unsupported consumer types cannot be skipped by active waypoint', () => {
  const world = fresh(); world.state.waypoints[b] = { discovered: true, active: true }; world.progress.fixture_gate_open = true;
  world.scenes[1].project = null; assert.equal(getWaypointStatus(world, b).travelReason, 'unresolved-scene');
  world.scenes[1].project = structuredClone(fixture.scenes[1].project); world.areas[1].entrances[0].position = null;
  assert.equal(getWaypointStatus(world, b).travelReason, 'unresolved-arrival');
  world.areas[1].entrances[0].position = [4020, 7420, 0]; delete world.scenes[1].project.terrainScene;
  assert.equal(getWaypointStatus(world, b).travelReason, 'unsupported-scene');
});
