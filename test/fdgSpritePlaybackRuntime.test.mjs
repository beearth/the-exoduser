import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(callback); }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  count() { return [...this.listeners.values()].reduce((sum, callbacks) => sum + callbacks.size, 0); }
}

function fixture() {
  const window = new Events(), document = new Events(), canvas = new Events();
  const calls = [], images = [], frames = new Map(), context = { globalAlpha: 1 };
  for (const name of ['setTransform', 'fillRect', 'beginPath', 'moveTo', 'lineTo', 'stroke', 'strokeRect', 'fillText', 'ellipse', 'fill', 'arc']) context[name] = () => {};
  context.drawImage = (...args) => calls.push({ src: args[0].source, cell: args.slice(1, 5), alpha: context.globalAlpha });
  let nextFrame = 0;
  Object.assign(window, {
    devicePixelRatio: 1,
    requestAnimationFrame(callback) { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    Image: class {
      constructor() { images.push(this); }
      set src(source) {
        this.source = source;
        this.naturalWidth = source.endsWith('/impact.png') ? 3840 : 16;
        this.naturalHeight = source.endsWith('/impact.png') ? 2560 : 16;
        queueMicrotask(() => this.onload?.());
      }
    },
  });
  document.defaultView = window;
  const attributes = new Map();
  Object.assign(canvas, {
    width: 320, height: 240, ownerDocument: document, getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 240 }),
    hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name),
  });
  return { canvas, window, document, calls, images, frames };
}

function project() {
  const sprite = { src: 'playback/impact.png', frameWidth: 640, frameHeight: 640, columns: 6, rows: 4, frames: 24, fps: 16, scale: .25, anchorX: .5, anchorY: .5 };
  const effect = { name: 'Synthetic sheet', kind: 'burst', color: '#ff4616', speed: 0, size: 160, spread: 0, sprite };
  return {
    schemaVersion: 1, id: 'new-sprite-playback-observation', name: 'Fresh synthetic playback fixture',
    map: { width: 200, height: 200, tileSize: 40, tiles: Array(40000).fill(1), start: { x: 10, y: 10 }, exit: { x: 10, y: 2 }, objects: [] },
    characters: [{ id: 'actor', name: 'Synthetic actor', speed: 156, radius: 12,
      sprite: { src: 'playback/actor.png', frameWidth: 16, frameHeight: 16, columns: 1, rows: 1, frames: 1, fps: 6, scale: 1, anchorX: .5, anchorY: 1 },
      animations: { idle: { row: 0, start: 0, frames: 1, fps: 6, loop: true } } }],
    skills: [{ id: 'demo', name: 'Synthetic demo', cooldown: 2, cost: 0, range: 160, damage: 0, vfx: 'impact' }],
    vfx: [
      { ...effect, id: 'impact', count: 7, life: 1.5 },
      { ...effect, id: 'long', count: 1, life: 2.25, sprite: { ...sprite, loop: true } },
      { id: 'primitive', name: 'No sheet', kind: 'burst', color: '#112233', count: 3, life: .5, speed: 0, size: 2, spread: 0 },
    ],
    preview: { characterId: 'actor', skillId: 'demo', vfxId: 'impact', resourceMax: 100, resourceRegen: 10 },
  };
}

const tick = (runtime, count) => { for (let i = 0; i < count; i++) assert.equal(runtime.step(FIXED_STEP), 1); };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} must equal ${expected}`);
const owner = (runtime, env) => ({
  stats: runtime.stats, animationTime: runtime._animationTime, accumulator: runtime._accumulator,
  particles: runtime.particles.active.map(index => {
    const p = runtime.particles.pool[index]; return { index, age: p.age, life: p.life, x: p.x, y: p.y };
  }),
  images: env.images.length, rafs: env.frames.size,
  listeners: env.canvas.count() + env.window.count() + env.document.count(),
});

test('active sheet snapshot matches the real draw cell/alpha and separates count from frames without consuming time', async () => {
  const env = fixture(), runtime = new FDGRuntime(env.canvas, project());
  try {
    await runtime.load(); runtime.pause();
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    assert.equal(runtime.triggerVfx('impact'), 7);
    assert.equal(runtime.particles.count, 7);
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), [{
      definitionId: 'impact', particleIndex: 0, src: 'playback/impact.png', age: 0, life: 1.5,
      frameIndex: 0, cell: { sx: 0, sy: 0, sw: 640, sh: 640 }, frames: 24, fps: 16, alpha: 1, loop: false, finished: false,
    }]);
    tick(runtime, 4);
    const baseline = owner(runtime, env), snapshot = runtime.getVfxPlaybackSnapshot();
    assert.equal(snapshot.length, 1, 'Only one of seven particles owns a sprite');
    assert.equal(snapshot[0].frameIndex, 1); assert.deepEqual(snapshot[0].cell, { sx: 640, sy: 0, sw: 640, sh: 640 });
    near(snapshot[0].age, 4 / 60); near(snapshot[0].alpha, 1 - 4 / 60 / 1.5);
    const again = runtime.getVfxPlaybackSnapshot();
    assert.notEqual(snapshot, again); assert.notEqual(snapshot[0], again[0]); assert.notEqual(snapshot[0].cell, again[0].cell);
    snapshot[0].age = 900; snapshot[0].cell.sx = -100; snapshot.push({});
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), again);
    assert.deepEqual(owner(runtime, env), baseline, 'Observation changes no clock, resource, particle, image, RAF, or listener');
    tick(runtime, 20); env.calls.length = 0; runtime.renderOnce();
    const row = runtime.getVfxPlaybackSnapshot()[0];
    assert.equal(row.frameIndex, 6); assert.deepEqual(row.cell, { sx: 0, sy: 640, sw: 640, sh: 640 });
    const draws = env.calls.filter(call => call.src === '/playback/impact.png');
    assert.equal(draws.length, 1); assert.deepEqual(draws[0].cell, [row.cell.sx, row.cell.sy, row.cell.sw, row.cell.sh]);
    near(draws[0].alpha, row.alpha);
  } finally { runtime.dispose(); }
});

test('sheet playback retains definition/instance identity and clamps the final cell with the current nonloop rule', async () => {
  const env = fixture(), runtime = new FDGRuntime(env.canvas, project());
  try {
    await runtime.load(); runtime.pause();
    runtime.triggerVfx('long'); tick(runtime, 30); runtime.triggerVfx('impact');
    const multiple = runtime.getVfxPlaybackSnapshot();
    assert.equal(multiple.length, 2);
    assert.deepEqual(multiple.map(p => p.definitionId), ['long', 'impact']);
    assert.notEqual(multiple[0].particleIndex, multiple[1].particleIndex);
    assert.equal(multiple[0].frameIndex, 8); assert.equal(multiple[1].frameIndex, 0);
    near(multiple[0].age, .5); assert.equal(multiple[1].age, 0);
    tick(runtime, 70);
    const held = runtime.getVfxPlaybackSnapshot().find(p => p.definitionId === 'long');
    assert.equal(held.frameIndex, 23); assert.equal(held.finished, true); assert.equal(held.loop, false);
    assert.deepEqual(held.cell, { sx: 3200, sy: 1920, sw: 640, sh: 640 });
    near(held.alpha, 1 - held.age / held.life);
    tick(runtime, 35);
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), [], 'Expired effects expose no previous pool record');
  } finally { runtime.dispose(); }
});

test('primitive-only returns no sheets; project replacement and dispose clear all previous playback', async () => {
  const env = fixture(), original = project(), runtime = new FDGRuntime(env.canvas, original);
  try {
    await runtime.load(); runtime.pause(); runtime.triggerVfx('primitive');
    assert.equal(runtime.particles.count, 3); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    runtime.triggerVfx('impact'); const old = runtime.getVfxPlaybackSnapshot(); assert.equal(old.length, 1);
    await runtime.setProject(structuredClone(original));
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.equal(runtime.particles.count, 0);
    assert.equal(old[0].definitionId, 'impact', 'Earlier snapshot remains an independent observation');
    runtime.triggerVfx('long'); assert.equal(runtime.getVfxPlaybackSnapshot()[0].definitionId, 'long');
    runtime.dispose();
    const before = owner(runtime, env);
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    assert.deepEqual(owner(runtime, env), before);
    assert.equal(env.frames.size, 0); assert.equal(runtime.assets.size, 0);
    assert.equal(env.canvas.count() + env.window.count() + env.document.count(), 0);
  } finally { runtime.dispose(); }
});

test('observing playback does not bypass the existing source-preview emission block', async () => {
  const env = fixture(), runtime = new FDGRuntime(env.canvas, project());
  try {
    await runtime.load(); runtime.pause();
    // Guard-only sentinel: no source consumer, production scene, or PNG is re-examined.
    runtime._sourcePreview = {};
    assert.equal(runtime.triggerVfx('impact'), 0);
    assert.deepEqual(runtime.triggerSkill('demo'), { ok: false, reason: 'source-preview-physical-pending' });
    const before = owner(runtime, env);
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    assert.deepEqual(owner(runtime, env), before);
  } finally { runtime._sourcePreview = null; runtime.dispose(); }
});
