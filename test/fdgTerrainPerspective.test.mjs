import test from 'node:test';
import assert from 'node:assert/strict';
import { createTerrainScene, validateTerrainScene } from '../engine/fdg/terrain-scene.js';
import { TerrainSceneRuntime } from '../engine/fdg/terrain-runtime.js';
import { TerrainScenePanel } from '../tools/fdg-studio/terrain-scene-panel.js';

const map = () => ({ tileSize: 40, start: { x: 100, y: 185 } });
const near = (actual, expected, epsilon = 1e-7) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
function owner(width = 80, height = 60) {
  const created = [];
  const document = { createElement(tag) {
    assert.equal(tag, 'canvas');
    const context = { createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {} };
    const canvas = { width: 0, height: 0, getContext: () => context };
    created.push(canvas); return canvas;
  } };
  return { width, height, camera: { x: 4020, y: 7420 }, player: { x: 4020, y: 7420, z: 0, radius: 15 },
    canvas: { ownerDocument: document }, created, context: { draws: 0, drawImage() { this.draws++; } } };
}

test('optional terrain camera preserves legacy orthographic projection and rejects ambiguous or unsafe fields', () => {
  const scene = createTerrainScene(map());
  assert.deepEqual(scene.camera, { yaw: .45, pitch: .7, zoom: 1, projection: 'perspective', distance: 1400, near: 32 });
  delete scene.camera.projection; delete scene.camera.distance; delete scene.camera.near;
  scene.camera.note = { legacy: true };
  const before = structuredClone(scene), runtime = new TerrainSceneRuntime(scene), surface = owner();
  const [x, y, z] = [4100, 7300, 64], dx = x - surface.camera.x, dy = y - surface.camera.y;
  const rx = dx * Math.cos(.45) - dy * Math.sin(.45), ry = dx * Math.sin(.45) + dy * Math.cos(.45);
  const projected = runtime.project(x, y, z, surface);
  near(projected.x, surface.width / 2 + rx);
  near(projected.y, surface.height / 2 + ry * Math.sin(.7) - z * Math.cos(.7));
  near(projected.depth, ry * Math.cos(.7) + z * Math.sin(.7));
  assert.deepEqual(runtime.capture(surface.player).camera, before.camera);
  assert.deepEqual(scene, before);
  for (const camera of [
    { ...scene.camera, distance: 1400 }, { ...scene.camera, near: 32 },
    { ...scene.camera, projection: 'invalid' }, { ...scene.camera, projection: 'perspective', distance: 599 },
    { ...scene.camera, projection: 'perspective', near: 129 }, { ...scene.camera, projection: 'orthographic', near: NaN },
  ]) assert.equal(validateTerrainScene({ ...scene, camera }).ok, false);
  scene.camera.projection = 'perspective';
  assert.equal(validateTerrainScene(scene).ok, true, 'explicit projection permits documented distance/near defaults');
  runtime.dispose();
});

test('perspective ground inverse and camera edits preserve world XY while near/horizon queries fail safely', () => {
  const scene = createTerrainScene(map()), runtime = new TerrainSceneRuntime(scene), surface = owner(480, 320);
  for (const camera of [
    { yaw: .45, pitch: .7, zoom: 1, distance: 1400, near: 32 },
    { yaw: -Math.PI, pitch: .35, zoom: .25, distance: 600, near: 128 },
    { yaw: Math.PI, pitch: 1.1, zoom: 2, distance: 6000, near: 8 },
  ]) {
    Object.assign(runtime.scene.camera, camera);
    surface.camera = { x: 4080, y: 7300 };
    for (const [x, y] of [[4020, 7420], [3926.4, 7076.8], [4260, 7020], [4080, 7300]]) {
      const point = runtime.project(x, y, 0, surface);
      assert.equal(point.visible, true);
      const restored = runtime.unprojectGround(point.x, point.y, surface);
      near(restored.x, x); near(restored.y, y); near(restored.z, 0);
    }
  }
  Object.assign(runtime.scene.camera, { yaw: 0, pitch: .7, zoom: 1, distance: 600, near: 32 });
  assert.equal(runtime.project(4080, 9000, 0, surface).visible, false);
  assert.equal(runtime.unprojectGround(240, -100000, surface), null);
  const nearPoint = runtime.project(4080, surface.camera.y + (600 - 32) / Math.cos(.7), 0, surface);
  assert.equal(nearPoint.visible, true);
  const restored = runtime.unprojectGround(nearPoint.x, nearPoint.y, surface);
  assert.ok(restored); near(restored.y, surface.camera.y + (600 - 32) / Math.cos(.7));
  runtime.dispose();
});

test('near-plane faces clip before fan triangulation, cull fully hidden faces and retain the 900px raster cap', () => {
  const scene = createTerrainScene(map()); Object.assign(scene.camera, { yaw: 0, pitch: .7, distance: 600, near: 32 });
  const runtime = new TerrainSceneRuntime(scene), surface = owner(1800, 1200);
  const toWorld = ([x, y, depth]) => [surface.camera.x + x,
    surface.camera.y + y * Math.sin(.7) + depth * Math.cos(.7), -y * Math.cos(.7) + depth * Math.sin(.7)];
  runtime.meshes = [{ nodeId: 'near-crossing', color: '#FF0000',
    vertices: [[-2, -2, 550], [2, -2, 580], [0, 2, 550]].map(toWorld), faces: [[0, 1, 2]] }];
  runtime.actorMeshes = () => [];
  const submitted = [], triangle = runtime.triangle.bind(runtime);
  runtime.triangle = (...args) => { submitted.push(args.slice(0, 3)); triangle(...args); };
  runtime.draw(surface.context, surface);
  assert.equal(runtime.nearClippedFaces, 1); assert.equal(runtime.nearCulledFaces, 0);
  assert.equal(runtime.triangles, 2); assert.equal(submitted.length, 2);
  assert.equal(runtime.raster.width, 900); assert.equal(runtime.raster.height, 600);
  assert.ok(submitted.flat().every(p => [p.x, p.y, p.depth].every(Number.isFinite) && p.depth <= 1 / 32 + 1e-12));
  assert.ok([...runtime.depth].some(Number.isFinite), 'clipped face contributes actual pixels');
  const firstRaster = runtime.raster, firstImage = runtime.image, firstDepth = runtime.depth;
  runtime.draw(surface.context, surface);
  assert.equal(runtime.raster, firstRaster); assert.equal(runtime.image, firstImage); assert.equal(runtime.depth, firstDepth);
  runtime.meshes[0].vertices = [[-1e8, -1e8, 650], [1e8, -1e8, 650], [0, 1e8, 650]].map(toWorld);
  runtime.draw(surface.context, surface);
  assert.equal(runtime.triangles, 0); assert.equal(runtime.nearCulledFaces, 1);
  assert.ok([...runtime.depth].every(value => value === -Infinity));
  assert.equal(surface.created.length, 1); assert.equal(surface.context.draws, 3);
  const snapshot = runtime.snapshot(surface.player);
  assert.equal(snapshot.actorGeometry, 'test-body/test-head boxes'); assert.equal(snapshot.gameCharacterModel, false);
  assert.equal(snapshot.ownedRaf, 0); assert.equal(snapshot.ownedListeners, 0);
  runtime.dispose(); assert.equal(runtime.raster, null); assert.equal(runtime.depth, null); assert.equal(runtime.worldProjection, null);
});

test('reciprocal perspective depth resolves intersecting pixels independently of submission order', () => {
  const runtime = new TerrainSceneRuntime(createTerrainScene(map())), width = 6, height = 6;
  const reset = () => {
    runtime.image = { data: new Uint8ClampedArray(width * height * 4) };
    runtime.depth = new Float32Array(width * height); runtime.depth.fill(-Infinity);
  };
  const faceA = [{ x: 0, y: 0, depth: 1 / 100 }, { x: 6, y: 0, depth: 1 / 1000 }, { x: 0, y: 6, depth: 1 / 1000 }];
  const faceB = [{ x: 0, y: 0, depth: 1 / 500 }, { x: 6, y: 0, depth: 1 / 500 }, { x: 0, y: 6, depth: 1 / 500 }];
  const draw = (face, color) => runtime.triangle(...face, color, width, height);
  const pixel = (x, y) => [...runtime.image.data.slice((y * width + x) * 4, (y * width + x) * 4 + 3)];
  reset(); draw(faceA, [220, 30, 10]); draw(faceB, [10, 40, 230]);
  assert.deepEqual(pixel(3, 1), [220, 30, 10], '1/d interpolation yields d400; linear d850 would incorrectly choose B');
  near(runtime.depth[1 * width + 3], 1 / 400, 1e-9);
  assert.deepEqual(pixel(4, 1), [10, 40, 230]);
  const forward = new Uint8ClampedArray(runtime.image.data);
  reset(); draw(faceB, [10, 40, 230]); draw(faceA, [220, 30, 10]);
  assert.deepEqual(runtime.image.data, forward);
  runtime.triangle({ x: NaN, y: 0, depth: 0 }, faceA[1], faceA[2], [0, 0, 0], width, height);
  assert.deepEqual(runtime.image.data, forward);
  runtime.dispose();
});

test('terrain panel explicitly authors projection fields and template selection removes competing viewCamera authority', t => {
  const previousDocument = globalThis.document, nodes = new Map();
  globalThis.document = { getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, { listeners: new Map(), addEventListener(type, fn) { this.listeners.set(type, fn); }, removeEventListener(type) { this.listeners.delete(type); } });
    return nodes.get(id);
  } };
  t.after(() => { globalThis.document = previousDocument; });
  let project = { map: map(), viewCamera: { projection: 'perspective' } };
  const panel = new TerrainScenePanel({ getProject: () => project, getRuntime: () => null,
    getSelection: () => ({ group: 'terrainNodes', id: project.terrainScene?.nodes[0].id }), isRunning: () => false, isReady: () => true,
    change: (label, mutate) => { const next = structuredClone(project); mutate(next); project = next; return true; },
    select() {}, status: message => assert.fail(message), resetPreview() {} });
  nodes.get('terrain-create').listeners.get('click')();
  assert.equal(Object.hasOwn(project, 'viewCamera'), false);
  delete project.terrainScene.camera.projection; delete project.terrainScene.camera.distance; delete project.terrainScene.camera.near;
  const before = structuredClone(project), fields = new Map();
  panel.inspector({}, (form, label, value, options) => fields.set(label, { value, options }), () => {});
  assert.equal(fields.get('카메라 투영').value, 'orthographic'); assert.deepEqual(project, before);
  fields.get('카메라 투영').options.onChange('perspective');
  assert.deepEqual(project.terrainScene.camera, { yaw: .45, pitch: .7, zoom: 1, projection: 'perspective', distance: 1400, near: 32 });
  assert.equal(validateTerrainScene(project.terrainScene).ok, true);
  panel.dispose(); assert.ok([...nodes.values()].every(node => node.listeners.size === 0));
});
