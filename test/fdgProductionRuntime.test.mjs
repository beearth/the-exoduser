import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime, FIXED_STEP, isWalkableCircle } from '../engine/fdg/runtime.js';

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  count() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}

function environment(imageResults = []) {
  const window = new Events(), document = new Events(), canvas = new Events();
  const frames = new Map(), images = [], sources = [], errors = [];
  let frameId = 0, observerDisconnected = false;
  const context = { globalAlpha: 1 };
  for (const name of ['setTransform', 'fillRect', 'beginPath', 'moveTo', 'lineTo', 'stroke', 'strokeRect',
    'fillText', 'ellipse', 'fill', 'arc', 'drawImage', 'save', 'restore', 'closePath', 'clip']) context[name] = () => {};
  Object.assign(window, {
    devicePixelRatio: 1,
    requestAnimationFrame(fn) { const id = ++frameId; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    ResizeObserver: class { observe() {} disconnect() { observerDisconnected = true; } },
    Image: class {
      constructor() { images.push(this); }
      set src(src) {
        this.source = src; sources.push(src);
        const result = imageResults[images.length - 1] || {};
        this.naturalWidth = 16; this.naturalHeight = 16;
        this.savedLoad = this.onload; this.savedError = this.onerror;
        this.finish = () => result.error ? this.onerror?.() : this.onload?.();
        if (!result.defer) queueMicrotask(this.finish);
      }
      removeAttribute(name) { if (name === 'src') this.removed = true; }
    },
  });
  document.defaultView = window;
  const attributes = new Map();
  Object.assign(canvas, {
    width: 320, height: 240, ownerDocument: document,
    getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 240 }),
    hasAttribute: name => attributes.has(name),
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
  });
  return { canvas, window, document, images, sources, errors, frames, attributes,
    get observerDisconnected() { return observerDisconnected; },
    runtime(project) { return new FDGRuntime(canvas, project, { onError: error => errors.push(error) }); } };
}

function mapProject({ wall = null, start = { x: 10, y: 10 } } = {}) {
  const width = 200, height = 200;
  const tiles = Array.from({ length: width * height }, (_, i) => {
    const x = i % width, y = Math.floor(i / width);
    return x === 0 || y === 0 || x === width - 1 || y === height - 1 ? 0 : 1;
  });
  if (wall) tiles[wall.y * width + wall.x] = wall.tile;
  return {
    schemaVersion: 1, id: 'fdg-production-map-test', name: 'Fresh plain-map fixture',
    map: { width, height, tileSize: 40, tiles, start, exit: { x: 10, y: 2 }, objects: [] },
    characters: [{ id: 'actor', name: 'Synthetic actor', speed: 156, radius: 12,
      sprite: { src: 'production/actor.png', frameWidth: 16, frameHeight: 16, columns: 1, rows: 1, frames: 1, fps: 6, scale: 1, anchorX: .5, anchorY: 1 },
      animations: { idle: { row: 0, start: 0, frames: 1, fps: 6, loop: true }, walk: { row: 0, start: 0, frames: 1, fps: 6, loop: true } } }],
    skills: [{ id: 'sample', name: 'Synthetic skill', cooldown: 2, cost: 15, range: 100, damage: 0, vfx: 'sample_fx' }],
    vfx: [{ id: 'sample_fx', name: 'Synthetic particles', kind: 'burst', color: '#112233', count: 2, life: 2, speed: 10, size: 2, spread: 0 }],
    preview: { characterId: 'actor', skillId: 'sample', vfxId: 'sample_fx', resourceMax: 100, resourceRegen: 10 },
  };
}

const near = (value, expected) => assert.ok(Math.abs(value - expected) < 1e-8, `${value} must equal ${expected}`);
const ownerState = runtime => ({
  time: runtime.stats.time, updateSteps: runtime.stats.updateSteps, frame: runtime.stats.frame,
  droppedSteps: runtime.stats.droppedSteps, droppedTime: runtime.stats.droppedTime,
  skill: runtime.skills.getState('sample'), casts: runtime.skills.castCount,
  input: runtime.moveInputDirection, accumulator: runtime._accumulator, animationTime: runtime._animationTime,
  particles: runtime.particles.active.map(index => ({ ...runtime.particles.pool[index] })),
});

test('plain map held direction advances in owner ticks, hits a wall, and null releases it', async () => {
  const env = environment(), project = mapProject({ start: { x: 8, y: 8 }, wall: { x: 9, y: 8, tile: 0 } });
  const runtime = env.runtime(project);
  try {
    await runtime.load();
    assert.equal(runtime.setMoveInput('east'), false);
    runtime.start();
    assert.equal(runtime.setMoveInput('east'), true);
    assert.deepEqual([runtime.player.x, runtime.player.y], [340, 340], 'Input setter does not teleport');
    for (let i = 0; i < 6; i++) assert.equal(runtime.step(FIXED_STEP), 1);
    near(runtime.player.x, 347.8); near(runtime.player.y, 340); near(runtime.stats.time, .1);
    assert.equal(runtime.stats.updateSteps, 6);
    assert.equal(isWalkableCircle(project.map, runtime.player.x, runtime.player.y, runtime.player.radius), true);
    near(runtime.camera.x, runtime.player.x); near(runtime.camera.y, runtime.player.y);
    assert.equal(runtime.setMoveInput(null), true);
    const stopped = runtime.player.x;
    runtime.step(FIXED_STEP);
    near(runtime.player.x, stopped); assert.equal(runtime.moveInputDirection, null);
    runtime.setInputEnabled(false);
    assert.equal(runtime.setMoveInput('west'), false);
  } finally { runtime.dispose(); }
});

test('paused walkMap walks from the current actor, follows camera, and preserves owner time/resources', async () => {
  const env = environment(), runtime = env.runtime(mapProject());
  try {
    await runtime.load();
    assert.equal(runtime.walkMap('north'), false, 'ready is not paused');
    runtime.start();
    assert.equal(runtime.walkMap('north'), false, 'running is rejected');
    assert.equal(runtime.triggerSkill('sample', { x: 450, y: 420 }).ok, true);
    runtime.step(FIXED_STEP); runtime.pause();
    const owner = ownerState(runtime), before = { ...runtime.player };
    assert.equal(runtime.walkMap('north'), true);
    near(runtime.player.x, before.x); near(runtime.player.y, before.y - 10);
    assert.equal(runtime.player.direction, 'north');
    near(runtime.camera.x, runtime.player.x); near(runtime.camera.y, runtime.player.y);
    assert.deepEqual(ownerState(runtime), owner);
    assert.equal(runtime.state, 'paused'); assert.equal(env.frames.size, 0);
    runtime.setCamera(1000, 1000);
    const camera = { ...runtime.camera }, current = { ...runtime.player };
    assert.equal(runtime.walkMap('west', { distance: 5 }), true);
    near(runtime.player.x, current.x - 5); near(runtime.player.y, current.y);
    assert.deepEqual(runtime.camera, camera, 'Manual camera is preserved');
    assert.deepEqual(ownerState(runtime), owner);
    for (const distance of [0, -1, 10.01, Infinity, NaN, '10']) {
      const player = { ...runtime.player };
      assert.equal(runtime.walkMap('east', { distance }), false);
      assert.deepEqual(runtime.player, player);
    }
    for (const direction of ['north-east', 'constructor', null, {}, 42]) assert.equal(runtime.walkMap(direction), false);
    runtime.stop(); assert.equal(runtime.walkMap('east'), false, 'stopped is not paused');
  } finally { runtime.dispose(); }
  assert.equal(runtime.walkMap('east'), false, 'disposed is rejected');
});

test('paused walkMap rejects every scene consumer and blocked circular feet without consuming state', async () => {
  for (const tile of [0, 2, 3]) {
    const env = environment(), runtime = env.runtime(mapProject({ start: { x: 8, y: 8 }, wall: { x: 9, y: 8, tile } }));
    try {
      await runtime.load(); runtime.pause();
      const before = { ...runtime.player }, owner = ownerState(runtime), camera = { ...runtime.camera };
      assert.equal(runtime.walkMap('east'), false, `tile${tile} blocks a 12px foot`);
      assert.deepEqual(runtime.player, before); assert.deepEqual(runtime.camera, camera); assert.deepEqual(ownerState(runtime), owner);
      assert.equal(runtime.walkMap('east', { distance: 8 }), true, 'Foot can touch the wall without crossing');
      const touching = { ...runtime.player };
      assert.equal(runtime.walkMap('east', { distance: 1 }), false);
      assert.deepEqual(runtime.player, touching);
      // Guard-only sentinels: no existing source/terrain/rig consumer, source data, or PNG is run.
      for (const field of ['_sourcePreview', '_sourceScene', '_terrainScene', '_rigScene']) {
        runtime[field] = {};
        assert.equal(runtime.walkMap('west'), false, `${field} owns its separate movement contract`);
        assert.deepEqual(runtime.player, touching);
        runtime[field] = null;
      }
    } finally { runtime.dispose(); }
  }
});

test('failed Image retries once on same-src setProject, ready cache stays shared, and load does not retry', async () => {
  const env = environment([{ error: true }, {}]), project = mapProject(), runtime = env.runtime(project);
  try {
    await runtime.load();
    assert.equal(env.images.length, 1); assert.equal(runtime.assets.get('production/actor.png').status, 'error');
    assert.equal(runtime.stats.assetErrors, 1);
    await runtime.load(); assert.equal(env.images.length, 1, 'No implicit retry loop');
    await runtime.setProject(structuredClone(project));
    assert.equal(env.images.length, 2); assert.deepEqual(env.sources, ['/production/actor.png', '/production/actor.png']);
    assert.equal(runtime.assets.get('production/actor.png').status, 'ready');
    assert.equal(runtime.stats.assetErrors, 0); assert.equal(runtime.state, 'paused');
    const record = runtime.assets.get('production/actor.png');
    await runtime.setProject(structuredClone(project));
    assert.equal(env.images.length, 2); assert.equal(runtime.assets.get('production/actor.png'), record);
  } finally { runtime.dispose(); }
});

test('pending same-src project replacement shares loading; dispose cancels assets and ignores stale callbacks', async () => {
  const env = environment([{ defer: true }]), project = mapProject(), runtime = env.runtime(project);
  const initial = runtime.load(), replacement = runtime.setProject(structuredClone(project));
  assert.equal(env.images.length, 1); assert.equal(runtime.assets.get('production/actor.png').status, 'loading');
  env.images[0].finish();
  await Promise.all([initial, replacement]);
  assert.equal(runtime.assets.get('production/actor.png').status, 'ready'); assert.equal(runtime.stats.assetErrors, 0);
  runtime.dispose();

  const pendingEnv = environment([{ defer: true }]), pending = pendingEnv.runtime(mapProject());
  const load = pending.load(), image = pendingEnv.images[0];
  pending.start(); assert.equal(pendingEnv.frames.size, 1);
  pending.dispose(); pending.dispose();
  image.savedLoad(); image.savedError();
  await load;
  assert.equal(pending.state, 'disposed'); assert.equal(pending.assets.size, 0); assert.equal(pending._pendingAssets.size, 0);
  assert.equal(pendingEnv.frames.size, 0); assert.equal(image.removed, true); assert.equal(image.onload, null); assert.equal(image.onerror, null);
  assert.equal(pendingEnv.canvas.count() + pendingEnv.window.count() + pendingEnv.document.count(), 0);
  assert.equal(pendingEnv.observerDisconnected, true); assert.equal(pendingEnv.attributes.has('tabindex'), false);
  assert.equal(pendingEnv.errors.length, 0); assert.equal(pending.walkMap('east'), false);
});
