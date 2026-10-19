import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';
import { RigSceneRuntime, RigSceneValidationError } from '../engine/fdg/rig-scene-runtime.js';
import { createDefaultRigProject } from '../engine/fdg/rig-project.js';
import { evaluateRig } from '../engine/fdg/rig.js';
import { validateRigScene } from '../engine/fdg/rig-scene-project.js';

const copy = value => structuredClone(value);
const near = (actual, expected, epsilon = 1e-7) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
const nearVertices = (actual, expected) => { assert.equal(actual.length, expected.length); actual.forEach((vertex, i) => vertex.forEach((value, axis) => near(value, expected[i][axis]))); };

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, handler) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(handler); }
  removeEventListener(type, handler) { this.listeners.get(type)?.delete(handler); }
  dispatch(type, event = {}) { for (const handler of this.listeners.get(type) || []) handler({ preventDefault() {}, ...event }); }
  count() { return [...this.listeners.values()].reduce((sum, handlers) => sum + handlers.size, 0); }
}

function surface() {
  const calls = [], context = { globalAlpha: 1 };
  for (const method of ['setTransform', 'fillRect', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'stroke', 'strokeRect', 'fillText', 'ellipse', 'fill', 'arc', 'drawImage']) {
    context[method] = (...args) => calls.push({ method, args, color: context.fillStyle });
  }
  const window = new Events(), document = new Events(), canvas = new Events(), frames = new Map(), observers = new Set(), attributes = new Map();
  let id = 0, images = 0;
  Object.assign(window, {
    devicePixelRatio: 1,
    requestAnimationFrame(callback) { const next = ++id; frames.set(next, callback); return next; },
    cancelAnimationFrame(key) { frames.delete(key); },
    ResizeObserver: class { observe() { observers.add(this); } disconnect() { observers.delete(this); } },
    Image: class { set src(source) { images++; this.source = source; this.naturalWidth = 16; this.naturalHeight = 16; queueMicrotask(() => this.onload?.()); } },
  });
  document.defaultView = window;
  Object.assign(canvas, { ownerDocument: document, width: 320, height: 240,
    getContext: () => context, getBoundingClientRect: () => ({ width: 320, height: 240, left: 0, top: 0 }),
    hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name), focus() {},
  });
  return { canvas, window, document, context, calls, frames, observers, get imageLoads() { return images; },
    listenerCount: () => canvas.count() + window.count() + document.count(),
    fire(timestamp) { const next = frames.entries().next().value; assert.ok(next, 'owner RAF is scheduled'); frames.delete(next[0]); next[1](timestamp); },
  };
}

function scene(overrides = {}) {
  return { version: 1, resources: [{ id: 'model', name: '리그 시험 리소스', project: createDefaultRigProject() }],
    nodes: [{ id: 'instance', name: '시험 인스턴스', resourceId: 'model', position: [420, 500, 10], scale: 40, visible: true, materialId: 'iron', clipId: null, time: 0 }],
    camera: { x: 420, y: 500, follow: false, yaw: 0, pitch: 0 }, ...overrides };
}

function project(rigScene = scene()) {
  // Synthetic test coordinates only: no production map is authored or changed.
  return { schemaVersion: 1, id: 'rig-consumer-test', name: 'Rig scene consumer fixture',
    map: { width: 30, height: 30, tileSize: 40, tiles: Array(900).fill(1), start: { x: 10, y: 12 }, exit: { x: 10, y: 2 }, objects: [] },
    characters: [{ id: 'player', name: 'Test player', radius: 12, speed: 160 }], skills: [], vfx: [], preview: {},
    ...(rigScene === undefined ? {} : { rigScene }) };
}

function runtimeFor(rigScene = scene()) { const ui = surface(), runtime = new FDGRuntime(ui.canvas, project(rigScene)); return { ui, runtime }; }
const ticks = (runtime, count) => { for (let index = 0; index < count; index++) runtime.step(FIXED_STEP); };

test('real XYZ skin and foot anchor consume the owner camera, height and view angles', () => {
  const { runtime, ui } = runtimeFor();
  const snapshot = runtime.getRigNodeSnapshot('instance');
  assert.deepEqual(snapshot.anchor, { x: 160, y: 120 }); assert.equal(snapshot.depth, 500);
  nearVertices(snapshot.vertices, scene().resources[0].project.mesh.vertices);
  assert.deepEqual(snapshot.screenVertices[0], { x: 140, y: 110, z: -16 });
  near(snapshot.screenVertices[12].x, 146); near(snapshot.screenVertices[12].y, -10);
  assert.equal(runtime.setRigView(Math.PI / 2, Math.PI / 6), true);
  const rotated = runtime.getRigNodeSnapshot('instance'), point = rotated.vertices[12];
  near(rotated.screenVertices[12].x, 160 + point[2] * 40);
  near(rotated.screenVertices[12].y, 110 - (Math.cos(Math.PI / 6) * point[1] + Math.sin(Math.PI / 6) * point[0]) * 40);
  assert.ok(ui.calls.some(call => call.method === 'closePath'));
  assert.equal(ui.imageLoads, 0); assert.equal(ui.frames.size, 0); assert.equal(ui.observers.size, 1);
  runtime.dispose();
});

test('paused rendering evaluates resource manual pose with actual weighted XYZ deformation', async () => {
  const config = scene(); config.resources[0].project.preview.pose = { spine: { translation: [.5, 0, 0], rotation: [Math.PI / 6, 0, 0] } };
  const { runtime } = runtimeFor(config); runtime.pause();
  const before = runtime.getRigNodeSnapshot('instance'), oracle = evaluateRig(config.resources[0].project, { clipId: null, time: 0 });
  nearVertices(before.vertices, oracle.vertices); near(before.vertices[5][0] - config.resources[0].project.mesh.vertices[5][0], .3);
  assert.ok(Math.abs(before.vertices[12][2] - config.resources[0].project.mesh.vertices[12][2]) > .2);
  runtime.renderOnce(); assert.equal(runtime.getRigNodeSnapshot('instance').time, 0);
  const next = copy(runtime.project); next.rigScene.resources[0].project.preview.pose.spine.translation[0] = 1;
  await runtime.setProject(next);
  near(runtime.getRigNodeSnapshot('instance').vertices[5][0] - config.resources[0].project.mesh.vertices[5][0], .6);
  assert.equal(runtime.state, 'paused'); runtime.dispose();
});

test('rig time uses only owner fixed updates and remains equal at 30, 60 and 120 RAF FPS', () => {
  for (const fps of [30, 60, 120]) {
    const config = scene(); config.nodes[0].clipId = 'sway'; const { runtime, ui } = runtimeFor(config);
    runtime.start(); assert.equal(ui.frames.size, 1); runtime.start(); assert.equal(ui.frames.size, 1);
    ui.fire(0); for (let index = 1; index <= fps; index++) ui.fire(index * 1000 / fps);
    near(runtime.getRigNodeSnapshot('instance').time, 1); assert.equal(runtime.stats.updateSteps, 60);
    assert.deepEqual(runtime.getRigSceneSnapshot().ownedRaf, 0); assert.equal(ui.frames.size, 1); runtime.dispose();
  }
});

test('pause and render freeze rig time, a single manual owner step advances one tick, hitch stays bounded', () => {
  const { runtime, ui } = runtimeFor(); runtime.setRigClip('instance', 'sway', 0); runtime.start(); ui.fire(0); ui.fire(1000);
  near(runtime.getRigNodeSnapshot('instance').time, .1); assert.equal(runtime.stats.droppedSteps, 54);
  runtime.pause(); const time = runtime.getRigNodeSnapshot('instance').time;
  assert.equal(ui.frames.size, 0); runtime.renderOnce(); runtime.renderOnce(); near(runtime.getRigNodeSnapshot('instance').time, time);
  assert.equal(runtime.step(FIXED_STEP), 1); near(runtime.getRigNodeSnapshot('instance').time, time + FIXED_STEP);
  runtime.resume(); assert.equal(ui.frames.size, 1); ui.fire(9000); near(runtime.getRigNodeSnapshot('instance').time, time + FIXED_STEP);
  runtime.dispose();
});

test('crossfade samples both advancing clips and ends after exactly fifteen owner ticks', () => {
  const config = scene(), { runtime } = runtimeFor(config); runtime.setRigClip('instance', 'sway', 0); runtime.seekRig('instance', .5);
  runtime.setRigClip('instance', 'bow'); ticks(runtime, 6);
  const halfway = runtime.getRigNodeSnapshot('instance'); near(halfway.time, .1); near(halfway.transition.fromTime, .6); near(halfway.transition.elapsed, .1);
  nearVertices(halfway.vertices, evaluateRig(config.resources[0].project, { clipId: 'bow', time: .1, blend: { fromClipId: 'sway', fromTime: .6, amount: .4 } }).vertices);
  ticks(runtime, 9); const end = runtime.getRigNodeSnapshot('instance'); assert.equal(end.transition, null); near(end.time, .25);
  nearVertices(end.vertices, evaluateRig(config.resources[0].project, { clipId: 'bow', time: .25 }).vertices);
  runtime.setRigClip('instance', null, 0); assert.equal(runtime.getRigNodeSnapshot('instance').transition, null);
  nearVertices(runtime.getRigNodeSnapshot('instance').vertices, config.resources[0].project.mesh.vertices); runtime.dispose();
});

test('material swap keeps clip, time, transition and geometry while changing Canvas colors', () => {
  const { runtime, ui } = runtimeFor(); runtime.setRigClip('instance', 'sway'); ticks(runtime, 6);
  ui.calls.length = 0; runtime.renderOnce();
  const before = runtime.getRigNodeSnapshot('instance'); const colors = ui.calls.filter(call => call.method === 'fill').map(call => call.color);
  ui.calls.length = 0; assert.equal(runtime.setRigMaterial('instance', 'ember'), true); const after = runtime.getRigNodeSnapshot('instance');
  nearVertices(after.vertices, before.vertices); assert.equal(after.time, before.time); assert.equal(after.clipId, before.clipId); assert.deepEqual(after.transition, before.transition);
  assert.notDeepEqual(ui.calls.filter(call => call.method === 'fill').map(call => call.color), colors.slice(-ui.calls.filter(call => call.method === 'fill').length));
  runtime.dispose();
});

test('triangle draws count fill/stroke operations and cull projected bounds without claiming GPU calls', () => {
  const config = scene(), ui = surface(); const consumer = new RigSceneRuntime(config); consumer.evaluate();
  assert.equal(consumer.drawNode(ui.context, 'instance'), 56);
  assert.equal(ui.calls.filter(call => call.method === 'fill').length, 28);
  assert.equal(ui.calls.filter(call => call.method === 'stroke').length, 28);
  ui.calls.length = 0; assert.equal(consumer.drawNode(ui.context, 'instance', { width: 320, height: 240 }), 0);
  assert.equal(ui.calls.length, 0); assert.equal(consumer.snapshot().activeNodes, 1); consumer.dispose();
});

test('capture/reopen preserves a paused mid-transition pose, camera and unknown metadata', () => {
  const config = scene(); config.annotation = { owner: 'fixture' }; config.camera.bookmark = 'safe'; config.resources[0].source = { note: 'existing rig' }; config.nodes[0].editor = { selection: true };
  const { runtime } = runtimeFor(config); runtime.setRigClip('instance', 'sway', 0); runtime.seekRig('instance', .5); runtime.setRigClip('instance', 'bow'); ticks(runtime, 7); runtime.pause();
  runtime.setCamera(0, 9000); runtime.setRigView(.3, .2);
  const before = runtime.getRigNodeSnapshot('instance'), captured = runtime.captureRigScene();
  assert.equal(validateRigScene(captured).ok, true); assert.deepEqual(captured.annotation, config.annotation); assert.deepEqual(captured.nodes[0].editor, { selection: true });
  assert.deepEqual(captured.resources[0].source, { note: 'existing rig' }); assert.equal(captured.camera.bookmark, 'safe');
  assert.equal(captured.camera.x, 160); assert.equal(captured.camera.y, 1080); assert.equal(captured.camera.follow, false); assert.equal(captured.camera.yaw, .3);
  assert.deepEqual(captured.nodes[0].transition, before.transition);
  const reopened = runtimeFor(captured); assert.equal(reopened.runtime.state, 'ready');
  const after = reopened.runtime.getRigNodeSnapshot('instance'); nearVertices(after.vertices, before.vertices); assert.deepEqual(after.screenVertices, before.screenVertices);
  captured.nodes[0].position[0] = 1; captured.resources[0].project.mesh.vertices[0][0] = 90;
  assert.equal(runtime.captureRigScene().nodes[0].position[0], 420);
  runtime.dispose(); reopened.runtime.dispose();
});

test('world-Y sort keeps object→rig→player ties and existing back/VFX/front layers', () => {
  const config = scene(); config.nodes.push({ ...copy(config.nodes[0]), id: 'near', position: [420, 540, 100] });
  const source = project(config); source.map.objects = [
    { id: 'back', x: 10, y: 12, layer: 'back' }, { id: 'tie', x: 10, y: 12, layer: 'world' },
    { id: 'world-near', x: 10, y: 13, layer: 'world' }, { id: 'front', x: 10, y: 12, layer: 'front' },
  ];
  const ui = surface(), runtime = new FDGRuntime(ui.canvas, source), order = [];
  runtime._drawMap = () => {}; runtime._drawObject = object => order.push(object.id); runtime._drawCharacter = () => order.push('player'); runtime._drawParticles = () => order.push('vfx');
  runtime._rigScene.drawNode = (_context, id) => { order.push(`rig:${id}`); return 2; };
  runtime.renderOnce(); assert.deepEqual(order, ['back', 'tie', 'rig:instance', 'player', 'world-near', 'rig:near', 'vfx', 'front']);
  assert.equal(runtime.stats.drawCalls, 5); runtime.dispose();
});

test('scene replacement, node deletion and disposal release retired nodes/resources without extra owners', async () => {
  const { runtime, ui } = runtimeFor(), original = runtime._rigScene, listeners = ui.listenerCount(); runtime.start();
  const next = copy(runtime.project); next.rigScene.nodes = []; await runtime.setProject(next);
  assert.equal(original.snapshot().disposed, true); assert.equal(original.snapshot().resourceCount, 0); assert.equal(original._scene, null); assert.equal(original._worldToScreen, null);
  assert.equal(runtime.getRigNodeSnapshot('instance'), null); assert.equal(runtime.getRigSceneSnapshot().activeNodes, 0);
  assert.equal(ui.listenerCount(), listeners); assert.equal(ui.frames.size, 1); assert.equal(ui.observers.size, 1);
  const removed = runtime._rigScene, noScene = copy(runtime.project); delete noScene.rigScene; await runtime.setProject(noScene);
  assert.equal(removed.snapshot().disposed, true); assert.equal(runtime.captureRigScene(), undefined); assert.equal(runtime.getRigSceneSnapshot().resourceCount, 0);
  runtime.dispose(); runtime.dispose(); const time = runtime.stats.time, frame = runtime.stats.frame;
  assert.equal(runtime.step(1), 0); assert.equal(runtime.setRigClip('instance', 'sway'), false); assert.equal(runtime.getRigNodeSnapshot('instance'), null);
  assert.equal(runtime.getRigSceneSnapshot().disposed, true); assert.equal(ui.frames.size, 0); assert.equal(ui.listenerCount(), 0); assert.equal(ui.observers.size, 0);
  assert.equal(runtime.stats.time, time); assert.equal(runtime.stats.frame, frame); assert.equal(ui.imageLoads, 0);
});

test('snapshot arrays are independent and invisible nodes retain their clock without drawing', () => {
  const config = scene(); config.nodes[0].visible = false; config.nodes[0].clipId = 'bow'; const { runtime } = runtimeFor(config);
  const first = runtime.getRigNodeSnapshot('instance'); first.vertices[0][0] = 999; first.screenVertices[0].x = 999; first.position[0] = 999;
  ticks(runtime, 6); const snapshot = runtime.getRigSceneSnapshot(); assert.equal(snapshot.activeNodes, 0); assert.equal(snapshot.nodes.length, 1); near(snapshot.nodes[0].time, .1);
  assert.equal(snapshot.nodes[0].position[0], 420); assert.notEqual(snapshot.nodes[0].vertices[0][0], 999); assert.notEqual(snapshot.nodes[0].screenVertices[0].x, 999);
  assert.equal(runtime._rigScene.drawNode({}, 'instance'), 0); runtime.dispose();
});

test('seek normalizes loop/non-loop and cancels fade; malformed controls are atomic and disposed consumer inert', () => {
  const consumer = new RigSceneRuntime(scene()); assert.equal(consumer.setClip('instance', 'sway', 0), true); assert.equal(consumer.seek('instance', 2.5), true); near(consumer.getNodeSnapshot('instance').time, .5);
  consumer.setClip('instance', 'bow'); consumer.seek('instance', 10); assert.equal(consumer.getNodeSnapshot('instance').time, 1.5); assert.equal(consumer.getNodeSnapshot('instance').transition, null);
  const before = consumer.capture();
  for (const duration of [NaN, Infinity, -1, 11]) assert.equal(consumer.setClip('instance', 'sway', duration), false);
  for (const clipId of ['missing', undefined, 1]) assert.equal(consumer.setClip('instance', clipId), false);
  assert.equal(consumer.setMaterial('instance', 'missing'), false); assert.equal(consumer.seek('instance', -1), false); assert.equal(consumer.setView(4, 0), false); assert.equal(consumer.setView(0, Infinity), false);
  assert.deepEqual(consumer.capture(), before); consumer.dispose(); assert.equal(consumer.update(1), false); assert.equal(consumer.setClip('instance', null), false); assert.equal(consumer.seek('instance', 1), false); assert.equal(consumer.capture(), undefined);
  assert.deepEqual(consumer.snapshot(), { nodes: [], activeNodes: 0, resourceCount: 0, ownedRaf: 0, ownedListeners: 0, disposed: true });
  const invalid = scene(); invalid.nodes[0].resourceId = 'missing'; assert.throws(() => new RigSceneRuntime(invalid), RigSceneValidationError);
});

test('rig placements remain visual and add no collision to the existing player path', () => {
  const { runtime, ui } = runtimeFor(); runtime.start(); ui.canvas.dispatch('keydown', { code: 'KeyD' });
  ticks(runtime, 60); near(runtime.player.x, 580); near(runtime.player.y, 500);
  assert.deepEqual(runtime.getRigNodeSnapshot('instance').position, [420, 500, 10]); runtime.dispose();
});
