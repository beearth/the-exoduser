import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';
import { TerrainSceneRuntime } from '../engine/fdg/terrain-runtime.js';
import { createTerrainScene, validateTerrainScene } from '../engine/fdg/terrain-scene.js';
import { validateProject } from '../engine/fdg/project.js';

const clone = value => structuredClone(value);
const near = (actual, expected, epsilon = 1e-7) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);

class FakeTarget {
  constructor() { this.listeners = new Map(); this.adds = 0; this.removes = 0; }
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler); this.adds++;
  }
  removeEventListener(type, handler) {
    if (this.listeners.get(type)?.delete(handler)) this.removes++;
  }
  emit(type, fields = {}) {
    const event = { ...fields, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    for (const handler of this.listeners.get(type) || []) handler(event);
    return event;
  }
  get activeListeners() { return [...this.listeners.values()].reduce((count, handlers) => count + handlers.size, 0); }
}

class FakeContext {
  constructor() { this.draws = 0; this.lastImage = null; }
  setTransform() {}
  fillRect() {}
  fillText() {}
  drawImage() { this.draws++; }
  createImageData(width, height) { return { width, height, data: new Uint8ClampedArray(width * height * 4) }; }
  putImageData(image) { this.lastImage = image; }
}

class FakeCanvas extends FakeTarget {
  constructor(document, width = 128, height = 96) {
    super(); this.ownerDocument = document; this.width = width; this.height = height;
    this.clientWidth = width; this.clientHeight = height;
    this.context = new FakeContext(); this.attributes = new Map();
  }
  getContext(type) { assert.equal(type, '2d'); return this.context; }
  getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight }; }
  hasAttribute(key) { return this.attributes.has(key); }
  setAttribute(key, value) { this.attributes.set(key, value); }
  removeAttribute(key) { this.attributes.delete(key); }
  focus() { this.ownerDocument.activeElement = this; }
}

function fakeSurface() {
  const window = new FakeTarget(), document = new FakeTarget();
  window.devicePixelRatio = 1; window.frames = new Map(); window.requests = 0; window.cancels = 0;
  window.requestAnimationFrame = callback => { const id = ++window.requests; window.frames.set(id, callback); return id; };
  window.cancelAnimationFrame = id => { if (window.frames.delete(id)) window.cancels++; };
  window.fire = timestamp => {
    const next = window.frames.entries().next();
    if (next.done) return false;
    const [id, callback] = next.value; window.frames.delete(id); callback(timestamp); return true;
  };
  const observers = [];
  window.ResizeObserver = class {
    constructor(callback) { this.callback = callback; this.observed = new Set(); this.disconnects = 0; observers.push(this); }
    observe(target) { this.observed.add(target); }
    disconnect() { this.observed.clear(); this.disconnects++; }
  };
  document.defaultView = window; document.hidden = false; document.elements = [];
  document.createElement = tag => {
    assert.equal(tag, 'canvas'); const canvas = new FakeCanvas(document);
    document.elements.push(canvas); return canvas;
  };
  const canvas = document.createElement('canvas');
  return { canvas, window, document, observers,
    activeListeners: () => window.activeListeners + document.activeListeners + document.elements.reduce((count, element) => count + element.activeListeners, 0),
    adds: () => window.adds + document.adds + document.elements.reduce((count, element) => count + element.adds, 0),
    removes: () => window.removes + document.removes + document.elements.reduce((count, element) => count + element.removes, 0),
  };
}

function authoredProject() {
  const map = { width: 200, height: 200, tileSize: 40, tiles: Array(40000).fill(1),
    start: { x: 100, y: 185 }, exit: { x: 100, y: 20 }, objects: [] };
  return {
    schemaVersion: 1, id: 'height-consumer-fixture', name: 'New height consumer fixture', map,
    characters: [{ id: 'warrior', name: 'Warrior', speed: 156, radius: 15,
      sprite: { src: 'img/fixture-unused.png', frameWidth: 1, frameHeight: 1, columns: 1, rows: 1, frames: 1, fps: 24, scale: 1, anchorX: 0.5, anchorY: 1 },
      animations: { idle: { row: 0, start: 0, frames: 1, fps: 24, loop: true }, walk: { row: 0, start: 0, frames: 1, fps: 24, loop: true } } }],
    skills: [{ id: 'fixture-skill', name: 'Fixture skill', cooldown: 1, cost: 1, range: 100, damage: 1, vfx: 'fixture-vfx' }],
    vfx: [{ id: 'fixture-vfx', name: 'Fixture VFX', kind: 'burst', color: '#AABBCC', count: 1, life: 1, speed: 0, size: 1, spread: 0 }],
    preview: { characterId: 'warrior', skillId: 'fixture-skill', vfxId: 'fixture-vfx', resourceMax: 100, resourceRegen: 10 },
    terrainScene: createTerrainScene(map),
  };
}

async function owner(t, project = authoredProject()) {
  const surface = fakeSurface(), errors = [];
  const runtime = new FDGRuntime(surface.canvas, project, { onError: (error, source) => errors.push({ message: error.message, source }) });
  t.after(() => runtime.dispose());
  await runtime.load();
  assert.equal(runtime.stats.assetErrors, 0);
  assert.equal(errors.length, 0);
  assert.equal(runtime.assets.size, 0, 'height preview does not load synthetic sprite paths');
  return { ...surface, runtime, errors };
}

function keyboardSteps(surface, code, count) {
  const event = surface.canvas.emit('keydown', { code });
  assert.equal(event.defaultPrevented, true);
  for (let i = 0; i < count; i++) assert.equal(surface.runtime.step(FIXED_STEP), 1);
  surface.canvas.emit('keyup', { code });
}

test('optional FDG terrain validates actor radius bounds, blockers and unsupported ledges', () => {
  const plain = authoredProject(); delete plain.terrainScene;
  assert.equal(validateProject(plain, { geometry: false }).ok, true);
  assert.equal(validateProject(authoredProject(), { geometry: false }).ok, true);
  for (const [reason, mutate] of [
    ['bounds', s => { s.actor.position = [s.bounds.x + 10, 7420, 0]; }],
    ['blocked', s => { s.actor.position = [...s.nodes.find(n => n.resourceId === 'pillar').position]; }],
    ['support', s => { s.actor.position = [3870, 7084, 0]; }],
  ]) {
    const project = authoredProject(); mutate(project.terrainScene);
    assert.equal(validateTerrainScene(project.terrainScene).ok, true, `${reason}: scene structure remains valid`);
    const result = validateProject(project, { geometry: false });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(message => message.includes('terrainScene.actor') && message.includes(`(${reason})`)), result.errors.join('\n'));
  }
});

test('runtime canvas keyboard moves radius15 Warrior up stairs from 0 to64 and blocks platform cliff', async t => {
  const surface = await owner(t), runtime = surface.runtime;
  runtime.start(); keyboardSteps(surface, 'ArrowLeft', 36);
  near(runtime.player.x, 3926.4); near(runtime.player.y, 7420); near(runtime.player.z, 0);
  surface.canvas.emit('keydown', { code: 'ArrowUp' });
  const heights = new Set([0]);
  for (let i = 0; i < 132; i++) { runtime.step(FIXED_STEP); heights.add(runtime.player.z); }
  surface.canvas.emit('keyup', { code: 'ArrowUp' });
  near(runtime.player.x, 3926.4); near(runtime.player.y, 7076.8); near(runtime.player.z, 64);
  assert.deepEqual([...heights].sort((a, b) => a - b), [0, 8, 16, 24, 32, 40, 48, 56, 64]);
  assert.equal(runtime.getTerrainSceneSnapshot().surfaceId, 'platform-node');
  keyboardSteps(surface, 'ArrowLeft', 40);
  assert.equal(runtime.getTerrainSceneSnapshot().blockedReason, 'support');
  assert.ok(runtime.player.x >= 3875 && runtime.player.x <= 3878);
  near(runtime.player.y, 7076.8); near(runtime.player.z, 64);
  runtime.pause();
});

test('runtime canvas keyboard climbs ramp to same platform using actual per-step terrain heights', async t => {
  const surface = await owner(t), runtime = surface.runtime;
  runtime.start(); keyboardSteps(surface, 'KeyD', 36);
  near(runtime.player.x, 4113.6);
  surface.canvas.emit('keydown', { code: 'KeyW' });
  let prior = 0, largestRise = 0;
  for (let i = 0; i < 132; i++) {
    assert.equal(runtime.step(FIXED_STEP), 1);
    largestRise = Math.max(largestRise, runtime.player.z - prior); prior = runtime.player.z;
  }
  surface.canvas.emit('keyup', { code: 'KeyW' });
  near(runtime.player.x, 4113.6); near(runtime.player.y, 7076.8); near(runtime.player.z, 64);
  near(largestRise, 156 / 60 * 0.25);
  assert.equal(runtime.getTerrainSceneSnapshot().surfaceId, 'platform-node');
  runtime.pause();
});

test('ground keyboard movement stops at rotated pillar while retaining ground height', async t => {
  const surface = await owner(t), runtime = surface.runtime;
  runtime.start(); keyboardSteps(surface, 'ArrowDown', 12);
  near(runtime.player.y, 7451.2);
  keyboardSteps(surface, 'ArrowRight', 100);
  assert.equal(runtime.getTerrainSceneSnapshot().blockedReason, 'blocked');
  assert.ok(runtime.player.x > 4140 && runtime.player.x < 4190);
  const stoppedX = runtime.player.x;
  keyboardSteps(surface, 'ArrowRight', 12);
  near(runtime.player.x, stoppedX); near(runtime.player.y, 7451.2); near(runtime.player.z, 0);
  runtime.pause();
});

test('one-step control uses owner six60Hz updates and 15.6px movement with no consumer RAF', async t => {
  const surface = await owner(t), runtime = surface.runtime;
  runtime.pause();
  const before = runtime.stats;
  assert.equal(runtime.walkTerrain('west'), true);
  near(runtime.player.x, 4020 - 15.6); near(runtime.player.y, 7420); near(runtime.player.z, 0);
  near(runtime.stats.time - before.time, 0.1);
  assert.equal(runtime.stats.updateSteps - before.updateSteps, 6);
  assert.equal(runtime.state, 'paused'); assert.equal(surface.window.requests, 0);
  const time = runtime.stats.time;
  runtime.step(FIXED_STEP);
  near(runtime.stats.time - time, FIXED_STEP);
  near(runtime.player.x, 4020 - 15.6, 1e-6);
  const snap = runtime.getTerrainSceneSnapshot();
  assert.equal(snap.ownedRaf, 0); assert.equal(snap.ownedListeners, 0);
  assert.equal(runtime.walkTerrain('invalid'), false);
});

test('running60Hz frame, pause, render and manual step share a single runtime clock', async t => {
  const surface = await owner(t), runtime = surface.runtime;
  runtime.start(); assert.equal(surface.window.frames.size, 1);
  surface.window.fire(1000);
  assert.equal(runtime.stats.time, 0); assert.equal(runtime.stats.frameDeltaMs, 0);
  surface.window.fire(1000 + 1000 / 60);
  near(runtime.stats.time, FIXED_STEP); assert.equal(runtime.stats.updateSteps, 1);
  assert.equal(surface.window.frames.size, 1);
  runtime.pause();
  const paused = runtime.stats;
  assert.equal(surface.window.frames.size, 0); assert.equal(surface.window.fire(2000), false);
  runtime.renderOnce(); runtime.renderOnce();
  assert.equal(runtime.stats.time, paused.time); assert.equal(runtime.stats.frame, paused.frame);
  assert.equal(runtime.step(FIXED_STEP), 1);
  near(runtime.stats.time, FIXED_STEP * 2);
  assert.equal(runtime.stats.updateSteps, 2);
  assert.equal(surface.window.frames.size, 0);
});

test('capture preserves actor metadata and reload grounds serialized actor at actual surface', async t => {
  const project = authoredProject();
  project.terrainScene.actor.role = 'height-qa';
  project.terrainScene.actor.authored = { note: 'keep this', values: [1, 2], optional: null };
  const original = clone(project), surface = await owner(t, project), runtime = surface.runtime;
  for (let i = 0; i < 6; i++) runtime.walkTerrain('west');
  for (let i = 0; i < 22; i++) runtime.walkTerrain('north');
  near(runtime.player.x, 3926.4); near(runtime.player.y, 7076.8); near(runtime.player.z, 64);
  const captured = runtime.captureTerrainScene();
  assert.equal(captured.actor.role, 'height-qa');
  assert.deepEqual(captured.actor.authored, project.terrainScene.actor.authored);
  assert.deepEqual(project, original, 'transient movement never writes authored input');
  const saved = JSON.parse(JSON.stringify({ ...project, terrainScene: captured }));
  assert.equal(validateProject(saved, { geometry: false }).ok, true);
  captured.actor.authored.values[0] = 99;
  assert.equal(runtime.captureTerrainScene().actor.authored.values[0], 1);
  saved.terrainScene.actor.position[2] = 700;
  const savedBefore = clone(saved), reopened = await owner(t, saved);
  near(reopened.runtime.player.x, 3926.4); near(reopened.runtime.player.y, 7076.8); near(reopened.runtime.player.z, 64);
  const reopenedCapture = reopened.runtime.captureTerrainScene();
  near(reopenedCapture.actor.position[2], 64);
  assert.deepEqual(reopenedCapture.actor.authored, original.terrainScene.actor.authored);
  assert.equal(reopenedCapture.actor.role, 'height-qa');
  assert.deepEqual(saved, savedBefore, 'grounding does not replace serialized metadata or input Z');
});

test('terrain worldToScreen and ground screenToWorld are inverse at camera limits', async t => {
  for (const camera of [{ yaw: 0.45, pitch: 0.7, zoom: 1 }, { yaw: -Math.PI, pitch: 0.35, zoom: 0.25 }, { yaw: Math.PI, pitch: 1.1, zoom: 2 }]) {
    const project = authoredProject(); project.terrainScene.camera = camera;
    const { runtime } = await owner(t, project);
    runtime.setCamera(4080, 7300);
    for (const [x, y] of [[4020, 7420], [3926.4, 7076.8], [4260, 7020], [4080, 7300]]) {
      const screen = runtime.worldToScreen(x, y);
      const restored = runtime.screenToWorld(screen.x, screen.y);
      near(restored.x, x); near(restored.y, y);
      assert.ok(Number.isFinite(screen.depth));
    }
  }
});

test('intersecting CPU triangle depths choose near pixel independent of draw order', () => {
  const consumer = new TerrainSceneRuntime(authoredProject().terrainScene);
  const width = 6, height = 6;
  const reset = () => {
    consumer.image = { data: new Uint8ClampedArray(width * height * 4) };
    for (let i = 3; i < consumer.image.data.length; i += 4) consumer.image.data[i] = 255;
    consumer.depth = new Float32Array(width * height); consumer.depth.fill(-Infinity);
  };
  const triangleA = [{ x: 0, y: 0, depth: 8 }, { x: 6, y: 0, depth: 0 }, { x: 0, y: 6, depth: 0 }];
  const triangleB = [{ x: 0, y: 0, depth: 3 }, { x: 6, y: 0, depth: 3 }, { x: 0, y: 6, depth: 3 }];
  const draw = (triangle, color) => consumer.triangle(...triangle, color, width, height);
  reset(); draw(triangleA, [220, 30, 10]); draw(triangleB, [10, 40, 230]);
  const first = new Uint8ClampedArray(consumer.image.data);
  const pixel = (data, x, y) => [...data.slice((y * width + x) * 4, (y * width + x) * 4 + 4)];
  assert.deepEqual(pixel(first, 1, 1), [220, 30, 10, 255], 'A depth4 is nearer than B depth3');
  assert.deepEqual(pixel(first, 3, 1), [10, 40, 230, 255], 'B depth3 is nearer than A depth1.333');
  reset(); draw(triangleB, [10, 40, 230]); draw(triangleA, [220, 30, 10]);
  assert.deepEqual(consumer.image.data, first);
  consumer.dispose();
});

test('scene replacement and dispose release consumer state without new RAF or listeners', async t => {
  const surface = await owner(t), runtime = surface.runtime;
  const listenerCount = surface.activeListeners(), adds = surface.adds();
  const first = runtime._terrainScene;
  assert.ok(first.image && first.depth && first.raster, 'CPU buffers exist after render');
  assert.equal(surface.observers.length, 1);
  runtime.start();
  assert.equal(surface.window.frames.size, 1);
  const replacement = authoredProject(); replacement.terrainScene.camera.yaw = -0.2;
  await runtime.setProject(replacement);
  assert.equal(runtime.state, 'paused', 'project replacement waits for explicit owner playback');
  assert.equal(surface.window.frames.size, 0);
  runtime.start();
  assert.equal(surface.window.frames.size, 1);
  assert.equal(surface.activeListeners(), listenerCount); assert.equal(surface.adds(), adds);
  assert.equal(surface.observers.length, 1);
  assert.deepEqual(first.meshes, []); assert.equal(first.scene, null); assert.equal(first.image, null);
  assert.equal(first.raster, null); assert.equal(first.depth, null);
  const second = runtime._terrainScene;
  const snapshot = runtime.getTerrainSceneSnapshot();
  assert.equal(snapshot.ownedRaf, 0); assert.equal(snapshot.ownedListeners, 0); assert.equal(snapshot.depthTest, true);
  runtime.dispose();
  assert.equal(surface.window.frames.size, 0); assert.equal(surface.activeListeners(), 0);
  assert.equal(surface.removes(), surface.adds()); assert.equal(surface.observers[0].disconnects, 1);
  assert.equal(surface.observers[0].observed.size, 0);
  assert.equal(second.scene, null); assert.equal(second.image, null); assert.equal(second.depth, null); assert.equal(second.raster, null);
  assert.equal(runtime.getTerrainSceneSnapshot(), null); assert.equal(runtime.captureTerrainScene(), undefined);
  const ended = runtime.stats, requests = surface.window.requests;
  assert.equal(runtime.step(FIXED_STEP), 0); assert.equal(runtime.walkTerrain('north'), false);
  runtime.start(); runtime.resume(); runtime.renderOnce(); runtime.dispose();
  assert.equal(runtime.stats.time, ended.time); assert.equal(runtime.stats.frame, ended.frame);
  assert.equal(surface.window.requests, requests); assert.equal(surface.activeListeners(), 0);
});
