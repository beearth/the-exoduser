import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TERRAIN_SCENE_VERSION, TERRAIN_SCENE_LIMITS, TERRAIN_GROUND_COLOR,
  TerrainSceneValidationError, validateTerrainScene, createTerrainScene,
  buildTerrainMeshes, sampleTerrain, canMoveTerrain,
} from '../engine/fdg/terrain-scene.js';

const clone = value => JSON.parse(JSON.stringify(value));
const near = (actual, expected, epsilon = 1e-8) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
function fixture(kind = 'box', size = [100, 100, 20], extra = {}) {
  return {
    version: 1, bounds: { x: 100, y: 100, width: 400, depth: 400 },
    resources: [{ id: 'surface', name: 'Surface', kind, size, ...(kind === 'stairs' ? { steps: 4 } : {}), color: '#AABBCC', walkable: true, ...extra }],
    nodes: [{ id: 'surface-node', name: 'Surface instance', resourceId: 'surface', position: [300, 300, 0], yaw: 0 }],
    camera: { yaw: 0.45, pitch: 0.7, zoom: 1 }, settings: { maxStep: 12, maxSlope: 0.6 },
    actor: { position: [200, 200, 0] },
  };
}

test('scene limits, corrected template and input map isolation', () => {
  const map = { width: 200, height: 200, tileSize: 40, start: { x: 100, y: 185 } };
  const before = clone(map), scene = createTerrainScene(map);
  assert.deepEqual(map, before);
  assert.equal(TERRAIN_SCENE_VERSION, 1);
  assert.equal(TERRAIN_SCENE_LIMITS.resources, 16);
  assert.equal(TERRAIN_SCENE_LIMITS.nodes, 32);
  assert.deepEqual(validateTerrainScene(scene), { ok: true, errors: [] });
  assert.deepEqual(scene.bounds, { x: 3780, y: 7020, width: 480, depth: 600 });
  assert.deepEqual(scene.actor.position, [4020, 7420, 0]);
  assert.deepEqual(scene.resources[0].size, [96, 256, 64]);
  assert.equal(scene.resources[0].steps, 8);
  assert.deepEqual(scene.nodes[0].position, [3920, 7260, 0]);
  assert.deepEqual(scene.nodes[2].position, [4020, 7084, 0]);
  const another = createTerrainScene(map);
  scene.nodes[0].position[0] = 0;
  assert.equal(another.nodes[0].position[0], 3920);
});

test('malformed JSON, nonfinite values, missing fields and limits reject safely', () => {
  const invalid = [null, [], undefined];
  const change = mutate => { const value = fixture(); mutate(value); invalid.push(value); };
  change(s => { s.version = 2; });
  change(s => { s.bounds = null; });
  change(s => { s.bounds.x = 7900; });
  change(s => { s.bounds.width = 0; });
  change(s => { s.resources = []; });
  change(s => { s.nodes = []; });
  change(s => { s.resources[0].size[2] = 513; });
  change(s => { s.resources[0].walkable = null; });
  change(s => { s.resources[0].kind = 'sphere'; });
  change(s => { s.resources[0].color = '#fff'; });
  change(s => { s.resources[0].steps = 3; });
  change(s => { s.nodes[0].position[0] = Infinity; });
  change(s => { s.nodes[0].yaw = Math.PI + 0.01; });
  change(s => { s.camera.zoom = 0.24; });
  change(s => { s.camera.pitch = 1.11; });
  change(s => { s.settings.maxStep = 0; });
  change(s => { s.settings.maxSlope = NaN; });
  change(s => { s.actor = null; });
  change(s => { s.actor.position[2] = 1025; });
  change(s => { s.actor.position[0] = 99; });
  change(s => { s.metadata = () => {}; });
  change(s => { s.metadata = new Date(); });
  change(s => { s.metadata = s; });
  for (const value of invalid) {
    const result = validateTerrainScene(value);
    assert.equal(result.ok, false);
    assert.ok(result.errors.length > 0);
  }
  let getterCalled = false;
  const accessor = fixture();
  Object.defineProperty(accessor, 'metadata', { enumerable: true, get() { getterCalled = true; return 1; } });
  assert.equal(validateTerrainScene(accessor).ok, false);
  assert.equal(getterCalled, false);
  const sparse = fixture(); sparse.metadata = Array(2);
  assert.equal(validateTerrainScene(sparse).ok, false);
});

test('resource references, duplicate/reserved ids and stairs steps are validated', () => {
  for (const mutate of [
    s => { s.nodes[0].resourceId = 'missing'; },
    s => { s.resources.push(clone(s.resources[0])); },
    s => { s.nodes.push(clone(s.nodes[0])); },
    s => { s.nodes[0].id = 'ground'; },
    s => { s.resources[0].id = 'constructor'; },
    s => { s.nodes[0].id = 'x'.repeat(121); },
    s => { s.resources[0].steps = 0; },
    s => { s.resources[0].steps = 33; },
    s => { s.resources[0].steps = 1.5; },
  ]) {
    const scene = fixture('stairs'); mutate(scene);
    assert.equal(validateTerrainScene(scene).ok, false);
  }
  const key = fixture(); key.metadata = JSON.parse('{"__proto__":1}');
  assert.equal(validateTerrainScene(key).ok, false);
  const tooMany = fixture();
  tooMany.nodes = Array.from({ length: 33 }, (_, i) => ({ ...clone(tooMany.nodes[0]), id: `node-${i}` }));
  assert.equal(validateTerrainScene(tooMany).ok, false);
  const meta = fixture(); meta.metadata = { note: 'preserved', optional: null };
  assert.equal(validateTerrainScene(meta).ok, true);
});

test('safe query defaults reject invalid scenes and trusted options preserve valid results', () => {
  const bad = fixture(); bad.resources[0].size[0] = -1;
  for (const query of [() => buildTerrainMeshes(bad), () => sampleTerrain(bad, 200, 200), () => canMoveTerrain(bad, [200, 200], [201, 200], 15)]) assert.throws(query, TerrainSceneValidationError);
  const scene = fixture('ramp');
  assert.deepEqual(buildTerrainMeshes(scene, { validated: true }), buildTerrainMeshes(scene));
  assert.deepEqual(sampleTerrain(scene, 300, 300, { validated: true }), sampleTerrain(scene, 300, 300));
  assert.deepEqual(canMoveTerrain(scene, [200, 200], [201, 200], 15, { validated: true }), canMoveTerrain(scene, [200, 200], [201, 200], 15));
  assert.throws(() => sampleTerrain(scene, NaN, 200), TypeError);
});

test('ground and highest walkable surface are sampled without mutating scene', () => {
  const scene = fixture();
  scene.resources.push({ id: 'upper', name: 'Upper', kind: 'box', size: [50, 50, 15], color: '#ABCDEF', walkable: true });
  scene.nodes.push({ id: 'upper-node', name: 'Upper instance', resourceId: 'upper', position: [300, 300, 10], yaw: 0 });
  const before = clone(scene);
  assert.deepEqual(sampleTerrain(scene, 200, 200), { height: 0, surfaceId: 'ground', slope: 0 });
  assert.deepEqual(sampleTerrain(scene, 99, 200), { height: 0, surfaceId: null, slope: 0 });
  assert.deepEqual(sampleTerrain(scene, 300, 300), { height: 25, surfaceId: 'upper-node', slope: 0 });
  scene.resources[1].walkable = false;
  assert.deepEqual(sampleTerrain(scene, 300, 300), { height: 20, surfaceId: 'surface-node', slope: 0 });
  scene.resources[1].walkable = true;
  assert.deepEqual(scene, before);
});

test('ramp height follows rotated local +Y and reports geometric slope', () => {
  const scene = fixture('ramp', [80, 200, 40]);
  scene.nodes[0].position[2] = 5;
  scene.nodes[0].yaw = Math.PI / 2;
  near(sampleTerrain(scene, 380, 300).height, 9);
  near(sampleTerrain(scene, 300, 300).height, 25);
  near(sampleTerrain(scene, 220, 300).height, 41);
  near(sampleTerrain(scene, 220, 300).slope, 0.2);
  assert.equal(sampleTerrain(scene, 300, 350).surfaceId, 'ground');
});

test('stairs discrete top heights and zero-height plane are actual geometry', () => {
  const scene = fixture('stairs', [80, 128, 32]);
  for (const [y, height] of [[236, 8], [251, 8], [269, 16], [301, 24], [349, 32], [364, 32]]) near(sampleTerrain(scene, 300, y).height, height);
  scene.resources[0].size[2] = 0;
  scene.nodes[0].position[2] = 7;
  assert.deepEqual(sampleTerrain(scene, 300, 300), { height: 7, surfaceId: 'surface-node', slope: 0 });
  const mesh = buildTerrainMeshes(scene)[1];
  assert.equal(mesh.vertices.length, 4);
  assert.equal(mesh.faces.length, 2);
  assert.ok(mesh.vertices.every(v => v[2] === 7));
});

test('meshes contain triangular XYZ geometry, correct yaw/base height and fresh output', () => {
  const scene = fixture('ramp', [80, 200, 40]);
  scene.nodes[0].position[2] = 5; scene.nodes[0].yaw = Math.PI / 2;
  const meshes = buildTerrainMeshes(scene), floor = meshes[0], ramp = meshes[1];
  assert.equal(floor.nodeId, 'ground'); assert.equal(floor.color, TERRAIN_GROUND_COLOR);
  assert.equal(floor.vertices.length, 4); assert.equal(floor.faces.length, 2);
  assert.equal(ramp.vertices.length, 6); assert.equal(ramp.faces.length, 8);
  near(ramp.vertices[0][0], 400); near(ramp.vertices[0][1], 260); near(ramp.vertices[0][2], 5);
  near(ramp.vertices[4][0], 200); near(ramp.vertices[4][1], 340); near(ramp.vertices[4][2], 45);
  assert.ok(meshes.every(m => m.faces.every(f => f.length === 3 && f.every(i => Number.isInteger(i) && i >= 0 && i < m.vertices.length))));
  const before = clone(scene); ramp.vertices[0][2] = 999; ramp.faces[0][0] = 999;
  assert.deepEqual(scene, before);
  assert.notEqual(buildTerrainMeshes(scene)[1].vertices[0][2], 999);
  const stairs = buildTerrainMeshes(fixture('stairs', [96, 256, 64], { steps: 8 }))[1];
  assert.equal(stairs.vertices.length, 64); assert.equal(stairs.faces.length, 96);
  assert.equal(Math.max(...stairs.vertices.map(v => v[2])), 64);
  const box = buildTerrainMeshes(fixture())[1];
  assert.equal(box.vertices.length, 8); assert.equal(box.faces.length, 12);
});

test('circle bounds include radius; malformed movement inputs produce finite failure data', () => {
  const scene = fixture();
  assert.equal(canMoveTerrain(scene, [115, 200], [115, 201], 15).ok, true);
  assert.equal(canMoveTerrain(scene, [115, 200], [114.9, 201], 15).reason, 'bounds');
  assert.equal(canMoveTerrain(scene, [114.9, 200], [115, 201], 15).reason, 'bounds');
  for (const [from, to, radius] of [[[NaN, 200], [200, 200], 15], [[200, 200], [200, 200, Infinity], 15], [[200, 200], [200, 200], -1], [[200, 200], [200, 200], NaN], [null, [200, 200], 15]]) {
    assert.deepEqual(canMoveTerrain(scene, from, to, radius), { ok: false, height: 0, surfaceId: null, reason: 'invalid-position' });
  }
});

test('nonwalkable rotated OBB tests the target disk including corner contact', () => {
  const scene = fixture('box', [100, 20, 100], { walkable: false });
  scene.nodes[0].yaw = Math.PI / 4;
  const world = (x, y) => [300 + (x - y) / Math.sqrt(2), 300 + (x + y) / Math.sqrt(2)];
  assert.equal(canMoveTerrain(scene, [200, 200], world(0, 24), 15).reason, 'blocked');
  assert.equal(canMoveTerrain(scene, [200, 200], world(0, 26), 15).ok, true);
  assert.equal(canMoveTerrain(scene, [200, 200], world(0, 25), 15).reason, 'blocked');
  assert.equal(canMoveTerrain(scene, [200, 200], world(0, 0), 0).reason, 'blocked');
  assert.equal(canMoveTerrain(scene, [200, 200], world(60, 20), 15).reason, 'blocked');
  assert.equal(canMoveTerrain(scene, [200, 200], world(61, 21), 15).ok, true);
});

test('step ascent/descent uses actual target top and supplied or sampled source height', () => {
  const scene = fixture('box', [100, 100, 20]);
  assert.equal(canMoveTerrain(scene, [240, 300], [260, 300], 0).reason, 'step');
  assert.equal(canMoveTerrain(scene, { x: 260, y: 300, z: 20 }, { x: 240, y: 300, z: 999 }, 0).reason, 'step');
  assert.equal(canMoveTerrain(scene, [260, 300], [240, 300], 0).reason, 'step');
  scene.settings.maxStep = 20;
  assert.equal(canMoveTerrain(scene, [240, 300], [260, 300, 999], 0).height, 20);
  assert.equal(canMoveTerrain(scene, [240, 300], [260, 300, 999], 0).ok, true);
});

test('excess slope and unsupported ledges have distinct reasons', () => {
  const ramp = fixture('ramp', [100, 100, 80]);
  assert.equal(canMoveTerrain(ramp, [300, 270, 16], [300, 271], 0).reason, 'slope');
  ramp.settings.maxSlope = 0.8;
  assert.equal(canMoveTerrain(ramp, [300, 270, 16], [300, 271], 0).ok, true);
  const ledge = fixture('box', [100, 100, 20]);
  const result = canMoveTerrain(ledge, [280, 300, 20], [260, 300], 15);
  assert.equal(result.reason, 'support');
  assert.equal(result.height, 20);
  assert.equal(canMoveTerrain(ledge, [280, 300, 20], [280, 301], 15).ok, true);
  const stairs = fixture('stairs', [96, 56, 32], { steps: 4 });
  assert.equal(canMoveTerrain(stairs, [300, 299, 16], [300, 300], 15).reason, 'support');
});

test('radius 15 walks corrected stairs incrementally through every rise and onto platform', () => {
  for (const tileY of [185, 193]) {
    const scene = createTerrainScene({ tileSize: 40, start: { x: 100, y: tileY } });
    const [cx, cy] = scene.actor.position;
    let actor = [cx - 100, cy, 0];
    const levels = new Set([0]);
    for (let y = cy - 1; y >= cy - 336; y--) {
      const result = canMoveTerrain(scene, actor, [actor[0], y], 15, { validated: true });
      assert.equal(result.ok, true, `tileY ${tileY}, y ${y}: ${result.reason}`);
      levels.add(result.height); actor = [actor[0], y, result.height];
    }
    assert.deepEqual([...levels].sort((a, b) => a - b), [0, 8, 16, 24, 32, 40, 48, 56, 64]);
    assert.equal(actor[2], 64);
    assert.equal(sampleTerrain(scene, actor[0], actor[1]).surfaceId, 'platform-node');
    assert.equal(canMoveTerrain(scene, scene.actor.position, [cx, cy - 1], 15).ok, true);
  }
});

test('radius 15 climbs ramp continuously and reaches shared platform', () => {
  const scene = createTerrainScene({ tileSize: 40, start: { x: 100, y: 185 } });
  const [cx, cy] = scene.actor.position;
  let actor = [cx + 100, cy, 0], greatestDelta = 0;
  for (let y = cy - 1; y >= cy - 336; y--) {
    const result = canMoveTerrain(scene, actor, [actor[0], y], 15, { validated: true });
    assert.equal(result.ok, true, `y ${y}: ${result.reason}`);
    greatestDelta = Math.max(greatestDelta, Math.abs(result.height - actor[2]));
    actor = [actor[0], y, result.height];
  }
  near(greatestDelta, 0.25);
  assert.equal(actor[2], 64);
});

test('factory explicitly rejects out-of-world relative layouts without editing map', () => {
  for (const start of [{ x: 0, y: 185 }, { x: 199, y: 185 }, { x: 100, y: 0 }, { x: 100, y: 199 }]) {
    const map = { tileSize: 40, start }, before = clone(map);
    assert.throws(() => createTerrainScene(map), error => error instanceof TerrainSceneValidationError || error instanceof RangeError);
    assert.deepEqual(map, before);
  }
  assert.throws(() => createTerrainScene({ start: { x: 100, y: 185 }, tileSize: NaN }), TypeError);
});
