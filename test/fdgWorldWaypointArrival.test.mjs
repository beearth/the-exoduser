import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime, isWalkableCircle } from '../engine/fdg/runtime.js?v=0.7';
import { createWorldFixture, validateWorldProject } from '../engine/fdg/world-project.js?v=0.8.2';
import { WorldRuntime } from '../engine/fdg/world-runtime.js?v=0.8.2';
import { sampleTerrain, canMoveTerrain } from '../engine/fdg/terrain-scene.js';

const B = 'engine_fixture_wp_b';
class Target {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, handler) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(handler); }
  removeEventListener(type, handler) { this.listeners.get(type)?.delete(handler); }
}
class Context {
  setTransform() {} fillRect() {} fillText() {} strokeText() {} drawImage() {} beginPath() {} moveTo() {} lineTo() {}
  closePath() {} arc() {} ellipse() {} stroke() {} fill() {} setLineDash() {} save() {} restore() {}
  createImageData(width, height) { return { data: new Uint8ClampedArray(width * height * 4) }; } putImageData() {}
}
class Canvas extends Target {
  constructor(document) { super(); this.ownerDocument = document; this.width = 96; this.height = 72; this.context = new Context(); this.attributes = new Map(); }
  getContext() { return this.context; } getBoundingClientRect() { return { left: 0, top: 0, width: 96, height: 72 }; }
  hasAttribute(key) { return this.attributes.has(key); } setAttribute(key, value) { this.attributes.set(key, value); }
  removeAttribute(key) { this.attributes.delete(key); } focus() {}
}
function surface() {
  const window = new Target(), document = new Target();
  window.devicePixelRatio = 1; window.frames = new Map(); let sequence = 0;
  window.requestAnimationFrame = callback => { window.frames.set(++sequence, callback); return sequence; };
  window.cancelAnimationFrame = id => window.frames.delete(id);
  window.ResizeObserver = class { observe() {} disconnect() {} };
  document.defaultView = window; document.createElement = () => new Canvas(document);
  return { window, canvas: document.createElement('canvas') };
}
function base() {
  return { schemaVersion: 1, id: 'arrival-base', name: 'Fresh arrival preflight',
    map: { width: 200, height: 200, tileSize: 40, tiles: Array(40000).fill(1), start: { x: 100, y: 185 }, exit: { x: 100, y: 20 }, objects: [] },
    characters: [{ id: 'warrior', name: 'Warrior', speed: 156, radius: 15,
      sprite: { src: 'img/unused.png', frameWidth: 1, frameHeight: 1, columns: 1, rows: 1, frames: 1, fps: 24, scale: 1, anchorX: 0.5, anchorY: 1 },
      animations: { idle: { row: 0, frames: 1, fps: 24, loop: true }, walk: { row: 0, frames: 1, fps: 24, loop: true } } }],
    skills: [{ id: 'skill', name: 'Skill', cooldown: 1, cost: 1, range: 100, damage: 1, vfx: 'vfx' }],
    vfx: [{ id: 'vfx', name: 'VFX', kind: 'burst', color: '#AABBCC', count: 1, life: 1, speed: 0, size: 1, spread: 0 }],
    preview: { characterId: 'warrior', skillId: 'skill', vfxId: 'vfx', resourceMax: 100, resourceRegen: 10 } };
}
async function setup(t, edit = () => {}) {
  const world = createWorldFixture(base());
  world.progress.fixture_gate_open = true;
  // A saved active destination is valid data; this unit tests arrival safety, not discovery movement.
  world.state.waypoints[B] = { discovered: true, active: true };
  edit(world);
  assert.equal(validateWorldProject(world).ok, true);
  const { canvas, window } = surface(), owner = new FDGRuntime(canvas, world.scenes[0].project);
  const consumer = new WorldRuntime(owner, world);
  t.after(() => { consumer.dispose(); owner.dispose(); });
  await owner.load(); assert.equal((await consumer.open()).ok, true);
  return { owner, consumer, window, target: world.scenes[1].project };
}
async function rejectWithoutEntry(s) {
  const world = s.consumer.world, source = s.owner._terrainScene, project = s.owner.project;
  const actor = { ...s.owner.player }, calls = { pause: 0, capture: 0, entry: 0 };
  for (const [method, key] of [['pause', 'pause'], ['captureSceneState', 'capture'], ['enterScene', 'entry']]) {
    const original = s.owner[method].bind(s.owner);
    s.owner[method] = (...args) => { calls[key]++; return original(...args); };
  }
  s.owner.resume(); const raf = [...s.window.frames.keys()];
  const clone = globalThis.structuredClone;
  let status;
  try {
    globalThis.structuredClone = () => { throw new Error('A steady waypoint status must not clone any project/world'); };
    status = s.consumer.waypointStatus(B);
  } finally { globalThis.structuredClone = clone; }
  assert.equal(status.canTravel, false); assert.equal(status.travelReason, 'arrival-blocked');
  assert.equal((await s.consumer.travelWaypoint(B)).reason, 'arrival-blocked');
  assert.deepEqual(calls, { pause: 0, capture: 0, entry: 0 });
  assert.deepEqual(s.consumer.world, world); assert.deepEqual(s.owner.player, actor);
  assert.equal(s.owner.project, project); assert.equal(s.owner._terrainScene, source); assert.ok(source.image);
  assert.equal(s.owner.state, 'running'); assert.deepEqual([...s.window.frames.keys()], raf);
  assert.equal(s.consumer.busy, false); assert.equal(s.consumer.pending, null);
}

test('arrival floor radius failure blocks status/travel before source pause, capture, entry or state/visits commit', async t => {
  const s = await setup(t, world => {
    world.areas[1].entrances[0].position = [4030, 7420, 0];
    world.scenes[1].project.map.tiles[185 * 200 + 101] = 0;
  });
  assert.equal(isWalkableCircle(s.target.map, 4030, 7420, 0), true, 'center remains on tile1');
  assert.equal(isWalkableCircle(s.target.map, 4030, 7420, 15), false, 'radius overlaps adjacent blocked tile');
  await rejectWithoutEntry(s);
});

test('terrain bounds, pillar, cliff support and slope reject pre-entry; existing64px platform keeps entry grounding', async t => {
  const cases = [
    { reason: 'bounds', position: [3785, 7420, 0] },
    { reason: 'blocked', position: [4190, 7460, 0] },
    { reason: 'support', position: [3877, 7228, 0] },
    { reason: 'slope', position: [4120, 7260, 0], edit: project => { project.terrainScene.settings.maxSlope = 0.2; } },
  ];
  for (const item of cases) {
    const s = await setup(t, world => { world.areas[1].entrances[0].position = item.position; item.edit?.(world.scenes[1].project); });
    const ground = sampleTerrain(s.target.terrainScene, ...item.position.slice(0, 2), { validated: true });
    const point = { x: item.position[0], y: item.position[1], z: ground.height };
    assert.equal(canMoveTerrain(s.target.terrainScene, point, point, 15, { validated: true }).reason, item.reason);
    await rejectWithoutEntry(s);
  }
  const safe = await setup(t, world => { world.areas[1].entrances[0].position = [4020, 7084, 0]; });
  assert.equal(safe.consumer.waypointStatus(B).canTravel, true, 'saved Z0 snaps to supported platform64');
  assert.equal((await safe.consumer.travelWaypoint(B)).ok, true);
  assert.deepEqual([safe.owner.player.x, safe.owner.player.y, safe.owner.player.z], [4020, 7084, 64]);
  assert.equal(safe.consumer.world.state.regions.engine_fixture_b.visits, 1);
  assert.equal(safe.target.terrainScene.resources.find(resource => resource.id === 'platform').size[2], 64);
});
