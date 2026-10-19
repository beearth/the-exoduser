import test from 'node:test';
import assert from 'node:assert/strict';
import { fitWorldMap, terrainFootprints, cameraGroundFootprint, worldGraph } from '../engine/fdg/world-map.js';
import { createTerrainScene } from '../engine/fdg/terrain-scene.js';
import { TerrainSceneRuntime } from '../engine/fdg/terrain-runtime.js';
import { createWorldFixture } from '../engine/fdg/world-project.js';
import { createDefaultProject } from '../engine/fdg/catalog.js';

const near = (actual, expected, epsilon = 1e-8) => {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
};
const nearPoint = (actual, expected) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, index) => near(value, expected[index]));
};
const terrain = () => createTerrainScene({ start: { x: 100, y: 185 }, tileSize: 40 });

test('non-square bounds fit one XY scale with symmetric letterboxing in either viewport orientation', () => {
  const bounds = { x: 100, y: 200, width: 480, depth: 600 }, before = structuredClone(bounds);
  const portrait = fitWorldMap(bounds, 300, 200, 20);
  near(portrait.scale, 4 / 15);
  nearPoint(portrait.project([100, 200]), [86, 20]);
  nearPoint(portrait.project([580, 800]), [214, 180]);
  nearPoint(portrait.project([340, 500]), [150, 100]);
  near(portrait.left, 300 - 214);
  near(portrait.top, 200 - 180);
  near(portrait.project([200, 200])[0] - portrait.left, portrait.project([100, 300])[1] - portrait.top);
  assert.deepEqual(bounds, before);

  const landscape = fitWorldMap({ x: 780, y: 920, width: 800, depth: 200 }, 200, 300, 10);
  near(landscape.scale, 0.225);
  nearPoint(landscape.project([780, 920]), [10, 127.5]);
  nearPoint(landscape.project([1580, 1120]), [190, 172.5]);
  nearPoint(landscape.project([1180, 1020]), [100, 150]);
});

test('terrain footprints use real resource dimensions and node yaw while preserving XY winding, order and source data', () => {
  const scene = terrain(), stairs = scene.nodes.find(node => node.resourceId === 'stairs');
  stairs.yaw = Math.PI / 2;
  stairs.position[2] = 40;
  scene.nodes.reverse();
  const before = structuredClone(scene), footprints = terrainFootprints(scene);
  assert.deepEqual(footprints.map(value => value.id), scene.nodes.map(value => value.id));
  const footprint = footprints.find(value => value.id === stairs.id);
  [[4048, 7212], [4048, 7308], [3792, 7308], [3792, 7212]].forEach((point, index) => nearPoint(footprint.points[index], point));
  assert.equal(footprint.color, '#8796A1');
  assert.equal(footprint.walkable, true);
  assert.equal(footprints.find(value => value.id === 'pillar-node').walkable, false);
  assert.deepEqual(scene, before);
  footprint.points[0][0] += 100;
  footprint.color = '#000000';
  assert.deepEqual(scene, before);
  nearPoint(terrainFootprints(scene).find(value => value.id === stairs.id).points[0], [4048, 7212]);
});

test('camera ground footprint intersects the renderer Z0 plane at every viewport corner and follows camera translation', () => {
  const corners = [[0, 0], [685, 0], [685, 400], [0, 400]];
  for (const camera of [
    { yaw: 0, pitch: Math.PI / 6, zoom: 1 },
    { yaw: 0.45, pitch: 0.35, zoom: 0.25 },
    { yaw: -1.2, pitch: 1.1, zoom: 2 },
  ]) {
    const scene = terrain(); scene.camera = { ...camera };
    const renderer = new TerrainSceneRuntime(scene);
    const owner = { camera: { x: 4020, y: 7420 }, width: 685, height: 400 };
    const before = structuredClone({ camera: owner.camera, terrainCamera: camera });
    const points = cameraGroundFootprint(owner.camera, camera, owner.width, owner.height);
    if (camera.yaw === 0) {
      [[3677.5, 7020], [4362.5, 7020], [4362.5, 7820], [3677.5, 7820]].forEach((point, index) => nearPoint(points[index], point));
    }
    points.forEach((point, index) => {
      const projected = renderer.project(point[0], point[1], 0, owner);
      nearPoint([projected.x, projected.y], corners[index]);
      const inverse = renderer.unprojectGround(...corners[index], owner);
      nearPoint(point, [inverse.x, inverse.y]);
    });
    const movedOwner = { ...owner, camera: { x: 4145, y: 7340 } };
    cameraGroundFootprint(movedOwner.camera, camera, owner.width, owner.height).forEach((point, index) => {
      nearPoint([point[0] - points[index][0], point[1] - points[index][1]], [125, -80]);
      const projected = renderer.project(point[0], point[1], 0, movedOwner);
      nearPoint([projected.x, projected.y], corners[index]);
    });
    assert.deepEqual({ camera: owner.camera, terrainCamera: camera }, before);
    renderer.dispose();
  }
});

test('world graph consumes only registered directed transitions and gate state, independently of editor selection', () => {
  const world = createWorldFixture(createDefaultProject());
  world.areas.reverse();
  world.transitions.find(edge => edge.id === 'b_to_a').enabled = false;
  const before = structuredClone(world);
  let editorSelection = 'engine_fixture_b';
  const closed = worldGraph(world);
  assert.deepEqual(closed.nodes.map(node => node.areaKey), world.areas.map(area => area.areaKey));
  assert.deepEqual(closed.nodes.filter(node => node.active).map(node => node.areaKey), ['engine_fixture_a']);
  assert.equal(closed.nodes.find(node => node.areaKey === editorSelection).active, false);
  assert.equal(closed.edges.length, world.transitions.length);
  for (const edge of closed.edges) {
    const authored = world.transitions.find(value => value.id === edge.id);
    assert.equal(edge.from, authored.from.areaKey);
    assert.equal(edge.to, authored.to.areaKey);
    assert.equal(edge.gateKey, authored.gateKey);
    assert.equal(edge.enabled, authored.enabled);
    assert.equal(edge.open, false);
  }
  assert.deepEqual(world, before);
  editorSelection = 'engine_fixture_a';
  assert.deepEqual(worldGraph(world), closed);
  world.progress.fixture_gate_open = true;
  const opened = worldGraph(world);
  assert.equal(opened.edges.find(edge => edge.id === 'a_to_b').open, true);
  assert.equal(opened.edges.find(edge => edge.id === 'b_to_a').open, false);
  world.transitions.find(edge => edge.id === 'b_to_a').enabled = true;
  world.state.activeAreaKey = 'engine_fixture_b';
  const activeB = worldGraph(world);
  assert.equal(activeB.edges.find(edge => edge.id === 'b_to_a').open, true);
  assert.deepEqual(activeB.nodes.filter(node => node.active).map(node => node.areaKey), ['engine_fixture_b']);
  assert.equal(activeB.nodes.find(node => node.areaKey === editorSelection).active, false);
});
