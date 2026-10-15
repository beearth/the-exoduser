import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRigProject } from '../engine/fdg/rig-project.js';
import { evaluateRig } from '../engine/fdg/rig.js';
import { createRigScene } from '../engine/fdg/rig-scene-project.js';
import { RigSceneRuntime } from '../engine/fdg/rig-scene-runtime.js';
import { rigTextureAffine, drawRigTextureTriangle, sortRigFaces } from '../engine/fdg/rig-texture.js';
import { RigPreview } from '../tools/fdg-studio/rig-preview.js';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const transformPoint = ([a, b, c, d, e, f], [x, y]) => [a * x + c * y + e, b * x + d * y + f];
function rig(src = 'texture-fixture.png') {
  return {
    rigVersion: 1, id: 'synthetic_texture_rig', name: 'Synthetic UV/LBS fixture',
    skeleton: { id: 'skeleton', bones: [
      { id: 'root', name: 'Root', parent: null, translation: [0, 0, 0], rotation: [0, 0, 0] },
      { id: 'tail', name: 'Tail', parent: 'root', translation: [.5, 0, 0], rotation: [0, 0, 0] },
    ] },
    mesh: { id: 'mesh', skeletonId: 'skeleton', vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]],
      triangles: [[0, 1, 2], [1, 3, 2]], uvs: [[0, 1], [1, 1], [0, 0], [1, 0]], drawOrder: [1, 0],
      weights: ['root', 'tail', 'root', 'tail'].map(boneId => [{ boneId, weight: 1 }]) },
    materials: [{ id: 'skin', name: 'Skin', meshId: 'mesh', skeletonId: 'skeleton', color: '#c97851',
      texture: { src, width: 832, height: 1248, metadata: { scope: 'synthetic-only' } } }],
    clips: [{ id: 'sweep', name: 'Synthetic sweep', duration: 2, fps: 24, loop: false, tracks: [{ boneId: 'tail',
      keys: [0, 1, 2].map((time, index) => ({ time, translation: [0, 0, 0], rotation: [0, index === 1 ? .6 : 0, index === 1 ? .8 : 0] })) }] }],
    preview: { materialId: 'skin', clipId: 'sweep', time: 0, playing: false, pose: {}, camera: { yaw: 0, pitch: 0, zoom: 1 } },
  };
}

function context() {
  const calls = [], stack = [], ctx = { calls, matrix: [2, 0, 0, 2, 0, 0], globalAlpha: 1 };
  for (const name of ['beginPath', 'moveTo', 'lineTo', 'closePath', 'clip', 'fill', 'stroke', 'fillRect', 'strokeRect', 'fillText', 'arc', 'ellipse']) ctx[name] = (...args) => calls.push({ name, args });
  ctx.save = () => { stack.push([...ctx.matrix]); calls.push({ name: 'save' }); };
  ctx.restore = () => { ctx.matrix = stack.pop(); calls.push({ name: 'restore' }); };
  ctx.setTransform = (...matrix) => { ctx.matrix = matrix; calls.push({ name: 'setTransform', args: matrix }); };
  ctx.transform = (...right) => {
    const [a, b, c, d, e, f] = ctx.matrix, [g, h, i, j, k, l] = right;
    ctx.matrix = [a * g + c * h, b * g + d * h, a * i + c * j, b * i + d * j, a * k + c * l + e, b * k + d * l + f];
    calls.push({ name: 'transform', args: right });
  };
  ctx.drawImage = (...args) => calls.push({ name: 'drawImage', args, matrix: [...ctx.matrix] });
  return ctx;
}

test('UV affine maps all three original source pixels, including skew and mirror, without degenerate results', () => {
  const source = [[40, 90], [640, 90], [40, 900]], target = [[10, 20], [270, 45], [40, 330]];
  for (const points of [target, target.map(([x, y]) => [-x, y])]) {
    const affine = rigTextureAffine(source, points); assert.ok(affine);
    source.forEach((point, index) => transformPoint(affine, point).forEach((value, axis) => near(value, points[index][axis])));
  }
  assert.equal(rigTextureAffine([[0, 0], [1, 1], [2, 2]], target), null);
  assert.equal(rigTextureAffine(source, [[0, 0], [0, 0], [0, 0]]), null);
  assert.equal(rigTextureAffine([[NaN, 0], [1, 0], [0, 1]], target), null);
});

test('triangle draw clips the silhouette, composes owner DPR, draws the original image and restores Canvas state', () => {
  const ctx = context(), image = { naturalWidth: 832, naturalHeight: 1248 }, texture = { src: 'fixture.png', width: 832, height: 1248 };
  const uvs = [[.1, .2], [.8, .2], [.1, .9]], projected = [{ x: 30, y: 40 }, { x: 140, y: 35 }, { x: 45, y: 200 }];
  assert.equal(drawRigTextureTriangle(ctx, image, { texture, uvs, triangle: [0, 1, 2], projected }), 1);
  assert.deepEqual(ctx.calls.map(call => call.name), ['save', 'beginPath', 'moveTo', 'lineTo', 'lineTo', 'closePath', 'clip', 'transform', 'drawImage', 'restore']);
  const draw = ctx.calls.find(call => call.name === 'drawImage');
  assert.deepEqual(draw.args, [image, 0, 0, 832, 1248]);
  uvs.forEach(([u, v], index) => transformPoint(draw.matrix, [u * 832, v * 1248]).forEach((value, axis) => near(value, [projected[index].x, projected[index].y][axis] * 2)));
  assert.deepEqual(ctx.matrix, [2, 0, 0, 2, 0, 0]);
  ctx.calls.length = 0;
  assert.equal(drawRigTextureTriangle(ctx, { naturalWidth: 831, naturalHeight: 1248 }, { texture, uvs, triangle: [0, 1, 2], projected }), 0);
  assert.equal(drawRigTextureTriangle(ctx, image, { texture, uvs: [[0, 0], [0, 0], [0, 0]], triangle: [0, 1, 2], projected }), 0);
  assert.equal(ctx.calls.length, 0);
  ctx.drawImage = () => { throw new Error('Canvas draw failed'); };
  assert.equal(drawRigTextureTriangle(ctx, image, { texture, uvs, triangle: [0, 1, 2], projected }), 0);
  assert.equal(ctx.calls.at(-1).name, 'restore'); assert.deepEqual(ctx.matrix, [2, 0, 0, 2, 0, 0]);
});

test('authored triangle layers override depth only between layers and preserve stable depth sorting within a layer', () => {
  const triangles = [[0, 1, 2], [3, 4, 5], [0, 1, 2]], projected = [0, 0, 0, 5, 5, 5].map(z => ({ x: 0, y: 0, z }));
  assert.deepEqual(sortRigFaces(triangles, projected).map(face => face.index), [0, 2, 1]);
  assert.deepEqual(sortRigFaces(triangles, projected, [1, -1, 1]).map(face => face.index), [1, 0, 2]);
});

test('optional UV/texture contract retains mandatory color and rejects incomplete, remote and mismatched authoring data', () => {
  const original = rig(); assert.equal(validateRigProject(original).ok, true);
  const mutations = [
    p => { delete p.mesh.uvs; }, p => p.mesh.uvs.pop(), p => { p.mesh.uvs[0] = [1.01, 0]; },
    p => { p.mesh.uvs[0] = [NaN, 0]; }, p => { p.mesh.uvs[0] = [0]; },
    p => { p.mesh.drawOrder = [0]; }, p => { p.mesh.drawOrder[0] = .5; }, p => { p.mesh.drawOrder[0] = 8193; },
    p => { delete p.materials[0].color; }, p => { p.materials[0].texture.width = 0; }, p => { p.materials[0].texture.height = 4097; },
    ...['https://example.com/a.png', '//example.com/a.png', 'data:image/png,x', '../a.png', 'a/%2e%2e/b.png', 'a\\b.png'].map(src => p => { p.materials[0].texture.src = src; }),
    p => p.materials.push({ ...structuredClone(p.materials[0]), id: 'badsize', texture: { ...p.materials[0].texture, width: 833 } }),
  ];
  for (const mutate of mutations) { const candidate = structuredClone(original); mutate(candidate); assert.equal(validateRigProject(candidate).ok, false); }
  const plain = rig(); delete plain.materials[0].texture; delete plain.mesh.uvs; delete plain.mesh.drawOrder;
  assert.equal(validateRigProject(plain).ok, true, 'Existing color material contract remains supported');
});

test('actual LBS deforms the tail in XYZ while UVs/source identity and independently copied texture metadata remain unchanged', () => {
  const project = rig(), original = structuredClone(project), bind = evaluateRig(project, { time: 0 }), sweep = evaluateRig(project, { time: 1 });
  assert.deepEqual(bind.vertices, project.mesh.vertices); assert.deepEqual(sweep.vertices[0], bind.vertices[0]);
  assert.ok(Math.abs(sweep.vertices[1][2]) > .1); assert.notDeepEqual(sweep.vertices[1], bind.vertices[1]);
  assert.deepEqual(sweep.uvs, project.mesh.uvs); assert.deepEqual(sweep.texture, project.materials[0].texture);
  sweep.uvs[0][0] = .8; sweep.drawOrder[0] = -2; sweep.texture.metadata.scope = 'mutated';
  assert.deepEqual(project, original); assert.deepEqual(evaluateRig(project, { time: 1 }).texture, original.materials[0].texture);
  assert.deepEqual(evaluateRig(project, { time: 2 }).vertices, bind.vertices, 'Recovery returns the authored bind geometry');
});

test('RigSceneRuntime uses owner image, same triangle helper and owner time with exact-size validation', () => {
  const project = rig(), scene = createRigScene(project, { position: [420, 420, 0] }); scene.camera.yaw = 0; scene.camera.pitch = 0;
  const image = { naturalWidth: 832, naturalHeight: 1248 }, ctx = context();
  const runtime = new RigSceneRuntime(scene, { worldToScreen: () => ({ x: 150, y: 150 }), getImage: () => image });
  assert.deepEqual(runtime.requiredSources(), ['texture-fixture.png']);
  assert.equal(runtime.validateReady(new Map([['texture-fixture.png', { image }]])).ok, true);
  assert.equal(runtime.validateReady(new Map([['texture-fixture.png', { image: { ...image, naturalHeight: 1247 } }]])).ok, false);
  runtime.evaluate(); assert.equal(runtime.drawNode(ctx, scene.nodes[0].id, { width: 320, height: 240 }), 2);
  assert.equal(ctx.calls.filter(call => call.name === 'drawImage').length, 2); assert.equal(ctx.calls.filter(call => call.name === 'fill').length, 0);
  const before = runtime.getNodeSnapshot(scene.nodes[0].id); runtime.update(1); const after = runtime.getNodeSnapshot(scene.nodes[0].id);
  assert.equal(after.time, 1); assert.notDeepEqual(after.vertices[1], before.vertices[1]); assert.deepEqual(after.uvs, before.uvs);
  assert.equal(runtime.snapshot().ownedRaf, 0); assert.equal(runtime.snapshot().ownedListeners, 0);
  const captured = runtime.capture(); assert.deepEqual(captured.resources[0].project, project);
  runtime.dispose(); assert.deepEqual(runtime.requiredSources(), []); assert.equal(runtime.drawNode(ctx, scene.nodes[0].id), 0);
});

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(callback); }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  count() { return [...this.listeners.values()].reduce((sum, entries) => sum + entries.size, 0); }
}
function environment(autoLoad = false) {
  const images = [], rafs = new Map(), ctx = context(), window = new Events(), document = new Events(), canvas = new Events(); let rafId = 0, observers = 0;
  const requestAnimationFrame = callback => { const id = ++rafId; rafs.set(id, callback); return id; }, cancelAnimationFrame = id => rafs.delete(id);
  window.Image = class {
    constructor() { images.push(this); this.naturalWidth = 0; this.naturalHeight = 0; }
    set src(value) { this.source = value; if (autoLoad) queueMicrotask(() => { this.naturalWidth = value.includes('actor') ? 16 : 832; this.naturalHeight = value.includes('actor') ? 16 : 1248; this.onload?.(); }); }
    decode() { return this.decodePromise || Promise.resolve(); }
    removeAttribute() { this.removed = true; }
  };
  Object.assign(window, { requestAnimationFrame, cancelAnimationFrame, devicePixelRatio: 1 }); document.defaultView = window;
  const attributes = new Map(), rect = { left: 0, top: 0, width: 320, height: 240 };
  Object.assign(canvas, { width: 320, height: 240, ownerDocument: document, parentElement: { getBoundingClientRect: () => rect }, getContext: () => ctx,
    getBoundingClientRect: () => rect, hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name) });
  const ResizeObserver = class { observe() { observers++; } disconnect() { observers--; } };
  const resolve = async (index, width = 832, height = 1248) => { const image = images[index]; image.naturalWidth = width; image.naturalHeight = height; await image.onload?.(); };
  return { canvas, window, document, images, rafs, ctx, resolve, globals: { requestAnimationFrame, cancelAnimationFrame, ResizeObserver, devicePixelRatio: 1 }, observers: () => observers };
}
async function withGlobals(env, callback) {
  const previous = Object.fromEntries(Object.keys(env.globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(env.globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  try { await callback(); } finally { for (const [key, descriptor] of Object.entries(previous)) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key]; }
}

test('RigPreview caches decoded exact-size textures, reports failures, guards project replacement races and disposes without another clock', async () => {
  const env = environment(); await withGlobals(env, async () => {
    const preview = new RigPreview(env.canvas, rig());
    assert.equal(preview.snapshot().showBones, true); preview.setSelection({ vertexIndex: 1, boneId: 'tail' });
    assert.ok(env.ctx.calls.some(call => call.name === 'arc' && call.args[2] === 5), 'Visible overlay draws the selected vertex marker');
    env.ctx.calls.length = 0; preview.showBones = false; preview.render();
    assert.equal(env.ctx.calls.filter(call => call.name === 'arc').length, 0, 'Hidden overlay draws neither bone points nor selected vertex dot');
    assert.equal(preview.snapshot().showBones, false); assert.equal(Object.hasOwn(preview.project.preview, 'showBones'), false);
    assert.equal(preview.snapshot().textures[0].status, 'loading'); assert.equal(env.images.length, 1); assert.equal(env.rafs.size, 0);
    let decode; env.images[0].decodePromise = new Promise(resolve => { decode = resolve; });
    const pending = env.resolve(0); preview.setProject(rig('replacement.png')); const frames = preview.frames; decode(); await pending;
    assert.equal(preview.snapshot().textures.length, 1); assert.equal(preview.snapshot().textures[0].src, 'replacement.png');
    assert.equal(preview.snapshot().textures[0].status, 'loading'); assert.equal(preview.frames, frames);
    await env.resolve(1); assert.equal(preview.snapshot().textures[0].status, 'ready'); assert.equal(preview.snapshot().textureDraws, 2);
    const next = rig('replacement.png'); next.preview.time = 1; preview.setProject(next);
    assert.equal(env.images.length, 2, 'Ready src cache survives a compatible project edit'); assert.ok(Math.abs(preview.result.vertices[1][2]) > .1);
    preview.setProject(rig('wrong-size.png')); await env.resolve(2, 832, 1247);
    assert.equal(preview.snapshot().textures[0].status, 'error'); assert.match(preview.snapshot().textures[0].error, /832×1248/); assert.equal(preview.textureDraws, 0);
    preview.setProject(rig('wrong-size.png')); await env.resolve(3); assert.equal(preview.snapshot().textures[0].status, 'ready');
    preview.setProject(rig('pending-disposal.png')); const stale = env.images[4].onload;
    preview.dispose(); env.images[4].naturalWidth = 832; env.images[4].naturalHeight = 1248; await stale();
    assert.deepEqual(preview.snapshot().textures, []); assert.equal(preview.snapshot().textureDraws, 0); assert.equal(env.observers(), 0); assert.equal(env.rafs.size, 0);
    assert.equal(preview.state, 'disposed'); assert.equal(env.canvas.count() + env.window.count() + env.document.count(), 0);
  });
});

test('FDGRuntime registers rig textures in its existing asset owner and releases removed texture sources while preserving the owner clock', async () => {
  const env = environment(true), scene = createRigScene(rig(), { position: [420, 420, 0] }); scene.camera.yaw = 0; scene.camera.pitch = 0;
  const project = { schemaVersion: 1, id: 'rig-texture-owner-fixture', name: 'Synthetic owner',
    map: { width: 200, height: 200, tileSize: 40, tiles: Array(40000).fill(1), start: { x: 10, y: 10 }, exit: { x: 10, y: 2 }, objects: [] },
    characters: [{ id: 'actor', name: 'Actor', speed: 156, radius: 12, sprite: { src: 'actor.png', frameWidth: 16, frameHeight: 16, columns: 1, rows: 1, frames: 1, fps: 6, scale: 1, anchorX: .5, anchorY: 1 }, animations: { idle: { row: 0, start: 0, frames: 1, fps: 6, loop: true } } }],
    skills: [], vfx: [], preview: { characterId: 'actor', resourceMax: 100, resourceRegen: 10 }, rigScene: scene };
  const runtime = new FDGRuntime(env.canvas, project);
  try {
    await runtime.load(); runtime.pause(); assert.equal(runtime.assets.get('texture-fixture.png').status, 'ready');
    assert.equal(runtime.getRigNodeSnapshot(scene.nodes[0].id).texture.src, 'texture-fixture.png');
    assert.equal(runtime.getRigNodeSnapshot(scene.nodes[0].id).textureDraws, 2); assert.equal(env.images.length, 2);
    assert.equal(runtime.getRigNodeSnapshot(scene.nodes[0].id).time, 0); runtime.renderOnce(); assert.equal(runtime.getRigNodeSnapshot(scene.nodes[0].id).time, 0);
    runtime.step(FIXED_STEP); near(runtime.getRigNodeSnapshot(scene.nodes[0].id).time, FIXED_STEP);
    const without = structuredClone(project); delete without.rigScene; await runtime.setProject(without);
    assert.equal(runtime.assets.has('texture-fixture.png'), false); assert.equal(runtime.assets.get('actor.png').status, 'ready'); assert.equal(env.images.length, 2);
    assert.equal(env.rafs.size, 0);
  } finally { runtime.dispose(); }
  assert.equal(runtime.assets.size, 0); assert.equal(env.rafs.size, 0); assert.equal(env.canvas.count() + env.window.count() + env.document.count(), 0);
});
