import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';
import { createDefaultRigProject } from '../engine/fdg/rig-project.js';
import { validateRigScene } from '../engine/fdg/rig-scene-project.js';

const IMPACT = 'assets/vfx/fieldboss/boss_fire_impact_24_20261010.png';
const copy = value => structuredClone(value);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
const tick = (runtime, count) => { for (let i = 0; i < count; i++) assert.equal(runtime.step(FIXED_STEP), 1); };

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(callback); }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  count() { return [...this.listeners.values()].reduce((sum, callbacks) => sum + callbacks.size, 0); }
}

function surface({ atlasWidth = 3840, atlasHeight = 2560, failImage = false } = {}) {
  const window = new Events(), document = new Events(), canvas = new Events(), calls = [], images = [], frames = new Map(), observers = new Set();
  const context = { globalAlpha: 1 };
  for (const method of ['setTransform', 'fillRect', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'stroke', 'strokeRect', 'fillText', 'ellipse', 'fill', 'arc']) context[method] = () => {};
  context.drawImage = (...args) => calls.push({ source: args[0].source, cell: args.slice(1, 5), destination: args.slice(5), alpha: context.globalAlpha });
  let rafId = 0;
  Object.assign(window, {
    devicePixelRatio: 1,
    requestAnimationFrame(callback) { const id = ++rafId; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    ResizeObserver: class { observe() { observers.add(this); } disconnect() { observers.delete(this); } },
    Image: class {
      constructor() { images.push(this); }
      set src(source) { this.source = source; this.naturalWidth = atlasWidth; this.naturalHeight = atlasHeight; queueMicrotask(() => failImage ? this.onerror?.() : this.onload?.()); }
      removeAttribute() {}
    },
  });
  document.defaultView = window;
  const attributes = new Map();
  Object.assign(canvas, { ownerDocument: document, width: 320, height: 240, getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 240 }),
    hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name),
  });
  return { window, document, canvas, calls, images, frames, observers,
    listenerCount: () => window.count() + document.count() + canvas.count(),
    fire(timestamp) { const next = frames.entries().next().value; assert.ok(next); frames.delete(next[0]); next[1](timestamp); },
  };
}

function project() {
  // Fresh synthetic rig math fixture: approved r3 geometry/weights/clip/source PNG are never changed or retested.
  const rig = createDefaultRigProject(), once = copy(rig.clips.find(clip => clip.id === 'bow'));
  Object.assign(once, { id: 'sequence-test-once', name: 'Synthetic once', duration: 3, fps: 24 });
  rig.clips.push(once);
  return { schemaVersion: 1, id: 'new-rig-sequence-contract', name: 'New sequence owner-clock fixture',
    map: { width: 200, height: 200, tileSize: 40, tiles: Array(40000).fill(1), start: { x: 10, y: 12 }, exit: { x: 10, y: 2 }, objects: [] },
    characters: [{ id: 'actor', name: 'Synthetic actor', radius: 12, speed: 160 }], skills: [], vfx: [], preview: {},
    rigScene: { version: 1, resources: [{ id: 'model', name: 'Synthetic model', project: rig }],
      nodes: [{ id: 'body', name: 'Synthetic body', resourceId: 'model', position: [420, 500, 10], scale: 40, visible: true, materialId: 'iron', clipId: null, time: 1.25 }],
      camera: { x: 420, y: 500, follow: false, yaw: 0, pitch: 0 },
      sequence: { id: 'authoring-sequence', nodeId: 'body', clipId: once.id, startTime: .9,
        atlas: { src: IMPACT, frameWidth: 640, frameHeight: 640, columns: 6, rows: 4, frames: 24, fps: 16, scale: .25, anchorX: .5, anchorY: .5 }, offset: [-72, 0],
        provenance: { authority: 'ENGINE_AUTHORING', atlasAuthority: 'ENGINE_FIXTURE', gameplayApplied: false,
          sourceNative: { cooldown: 110, phase2Life: 200, recover: 30, rec: 50, window: [.15, .85], unit: 'game-frames' } } },
    } };
}

test('single authored event validates nonloop binding, strict atlas/seconds and retains native provenance without mutation', () => {
  const config = project().rigScene, before = copy(config);
  assert.equal(validateRigScene(config).ok, true); assert.deepEqual(config, before);
  const invalid = [
    s => { s.sequence = null; }, s => { s.sequence.nodeId = 'missing'; }, s => { s.sequence.clipId = 'sway'; },
    s => { s.sequence.startTime = 0; }, s => { s.sequence.startTime = 3.001; }, s => { s.sequence.startTime = '0.9'; },
    s => { s.sequence.offset = [0]; }, s => { s.sequence.offset[1] = 8001; },
    s => { s.sequence.atlas.src = '../outside.png'; }, s => { s.sequence.atlas.frameWidth = 640.5; },
    s => { s.sequence.atlas.columns = 257; }, s => { s.sequence.atlas.frames = 25; },
    s => { s.sequence.atlas.fps = 0; }, s => { s.sequence.atlas.scale = .09; },
    s => { s.sequence.atlas.anchorY = 1.1; }, s => { s.sequence.atlas.loop = true; }, s => { s.sequence.atlas.directions = {}; },
  ];
  for (const mutate of invalid) { const candidate = copy(config); mutate(candidate); assert.equal(validateRigScene(candidate).ok, false); }
  const prior = copy(config); delete prior.sequence; assert.equal(validateRigScene(prior).ok, true, 'Legacy scene remains valid');
});

test('actual owner .900 crossing emits once at age/frame zero and uses the real atlas draw crop/placement', async () => {
  const env = surface(), runtime = new FDGRuntime(env.canvas, project());
  try {
    await runtime.load(); runtime.pause();
    assert.equal(env.images.length, 1); assert.equal(runtime.getRigNodeSnapshot('body').time, 1.25, 'Authored saved pose is displayed before activation');
    assert.equal(runtime.getRigSequenceSnapshot().status, 'ready'); assert.equal(runtime.getRigSequenceSnapshot().elapsed, 0);
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); tick(runtime, 53);
    near(runtime.stats.time, 53 / 60); assert.equal(runtime.getRigSequenceSnapshot().eventCount, 0); assert.equal(runtime.particles.count, 0);
    tick(runtime, 1); const state = runtime.getRigSequenceSnapshot(), fx = state.activeFx[0];
    near(runtime.stats.time, .9); near(runtime.getRigNodeSnapshot('body').time, .9);
    assert.equal(state.activationId, 1); assert.equal(state.eventCount, 1); assert.equal(state.emittedCount, 1);
    assert.equal(runtime.particles.count, 1); assert.equal(fx.age, 0); assert.equal(fx.life, 1.5); assert.equal(fx.frameIndex, 0);
    assert.equal(fx.sequenceId, 'authoring-sequence'); assert.equal(fx.activationId, 1); assert.equal(fx.loop, false);
    assert.deepEqual(fx.cell, { sx: 0, sy: 0, sw: 640, sh: 640 });
    env.calls.length = 0; runtime.renderOnce();
    assert.deepEqual(env.calls, [{ source: `/${IMPACT}`, cell: [0, 0, 640, 640], destination: [8, 40, 160, 160], alpha: 1 }]);
    tick(runtime, 24); env.calls.length = 0; runtime.renderOnce();
    const next = runtime.getRigSequenceSnapshot().activeFx[0];
    near(next.age, .4); assert.equal(next.frameIndex, 6); assert.deepEqual(next.cell, { sx: 0, sy: 640, sw: 640, sh: 640 });
    assert.deepEqual(env.calls[0].cell, [0, 640, 640, 640]); near(env.calls[0].alpha, next.alpha);
    tick(runtime, 186); assert.equal(runtime.getRigSequenceSnapshot().status, 'completed'); assert.equal(runtime.getRigSequenceSnapshot().eventCount, 1);
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.equal(env.images.length, 1); assert.equal(env.frames.size, 0);
  } finally { runtime.dispose(); }
});

test('pause/render/snapshot freeze both clocks; owner step and resume use one existing RAF and reach final cell before exact expiry', async () => {
  const env = surface(), runtime = new FDGRuntime(env.canvas, project());
  try {
    await runtime.load(); runtime.start(); env.fire(0);
    for (let i = 1; i <= 54; i++) env.fire(i * 1000 / 60);
    runtime.pause(); const before = runtime.getRigSequenceSnapshot(), clock = runtime.stats.time, listeners = env.listenerCount();
    runtime.renderOnce(); runtime.renderOnce(); assert.deepEqual(runtime.getRigSequenceSnapshot(), before); near(runtime.stats.time, clock);
    const mutable = runtime.getRigSequenceSnapshot(); mutable.activeFx[0].cell.sx = -100; mutable.elapsed = -1;
    assert.deepEqual(runtime.getRigSequenceSnapshot(), before, 'Explicit snapshots are independent');
    assert.equal(env.frames.size, 0); assert.equal(env.listenerCount(), listeners); assert.equal(env.images.length, 1);
    tick(runtime, 87); assert.equal(runtime.getRigSequenceSnapshot().atlasFrame, 23); near(runtime.getRigSequenceSnapshot().atlasAge, 1.45);
    runtime.resume(); assert.equal(env.frames.size, 1); env.fire(10000); near(runtime.getRigSequenceSnapshot().atlasAge, 1.45);
    runtime.pause(); tick(runtime, 2); assert.equal(runtime.getRigSequenceSnapshot().atlasActive, true);
    tick(runtime, 1); assert.equal(runtime.getRigSequenceSnapshot().atlasActive, false, '90 ticks from trigger removes only this 1.5s instance');
    assert.equal(runtime.getRigSequenceSnapshot().eventCount, 1); assert.equal(env.listenerCount(), listeners);
  } finally { runtime.dispose(); }
});

test('explicit replay creates a new activation while prior FX survives; body stop holds pose and FX expires independently', async () => {
  const env = surface(), runtime = new FDGRuntime(env.canvas, project());
  try {
    await runtime.load(); tick(runtime, 54); tick(runtime, 30);
    const old = runtime.getRigSequenceSnapshot().activeFx[0], clock = runtime.stats.time;
    assert.equal(runtime.replayRigSequence(), true); near(runtime.stats.time, clock);
    assert.equal(runtime.getRigSequenceSnapshot().activationId, 2); assert.equal(runtime.getRigSequenceSnapshot().eventCount, 0);
    assert.equal(runtime.getRigNodeSnapshot('body').time, 0); assert.deepEqual(runtime.getRigSequenceSnapshot().activeFx[0], old);
    tick(runtime, 54); const effects = runtime.getRigSequenceSnapshot().activeFx;
    assert.equal(effects.length, 2); assert.deepEqual(effects.map(fx => fx.activationId), [1, 2]); near(effects[0].age, 1.4); assert.equal(effects[1].age, 0);
    tick(runtime, 6); assert.deepEqual(runtime.getRigSequenceSnapshot().activeFx.map(fx => fx.activationId), [2]);
    assert.equal(runtime.stopRigSequence(), true); const bodyTime = runtime.getRigNodeSnapshot('body').time;
    tick(runtime, 84); near(runtime.getRigNodeSnapshot('body').time, bodyTime);
    assert.equal(runtime.getRigSequenceSnapshot().status, 'stopped'); assert.equal(runtime.getRigSequenceSnapshot().eventCount, 1);
    assert.deepEqual(runtime.getRigSequenceSnapshot().activeFx, []); assert.equal(env.images.length, 1);
  } finally { runtime.dispose(); }
});

test('clip/seek disarm future crossings without removing existing FX; material and view preserve the activation', async () => {
  const env = surface(), runtime = new FDGRuntime(env.canvas, project());
  try {
    await runtime.load(); tick(runtime, 20); runtime.seekRig('body', 1);
    assert.equal(runtime.getRigSequenceSnapshot().status, 'stopped'); tick(runtime, 60); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    runtime.replayRigSequence(); runtime.setRigMaterial('body', 'ember'); runtime.setRigView(.2, .1); tick(runtime, 54);
    assert.equal(runtime.getRigSequenceSnapshot().eventCount, 1); const fx = runtime.getRigSequenceSnapshot().activeFx[0];
    assert.equal(runtime.setRigClip('body', null, 0), true); assert.equal(runtime.getRigSequenceSnapshot().status, 'stopped');
    assert.deepEqual(runtime.getRigSequenceSnapshot().activeFx[0], fx);
    tick(runtime, 90); assert.deepEqual(runtime.getRigSequenceSnapshot().activeFx, []);
    assert.equal(runtime.setRigClip('missing', null), false); assert.equal(runtime.seekRig('body', NaN), false);
  } finally { runtime.dispose(); }
});

test('capture retains authored settings/native units and saved pose; reload is ready at clock0 with no FX or stale crossing', async () => {
  const env = surface(), input = project(), runtime = new FDGRuntime(env.canvas, input);
  try {
    await runtime.load(); tick(runtime, 60); runtime.pause();
    const saved = runtime.captureRigScene(), poseTime = runtime.getRigNodeSnapshot('body').time;
    assert.deepEqual(saved.sequence, input.rigScene.sequence); near(saved.nodes[0].time, poseTime);
    assert.equal(saved.nodes[0].clipId, 'sequence-test-once'); assert.equal(Object.hasOwn(saved.sequence, 'activationId'), false);
    assert.deepEqual(saved.sequence.provenance.sourceNative, { cooldown: 110, phase2Life: 200, recover: 30, rec: 50, window: [.15, .85], unit: 'game-frames' });
    const reopened = { ...copy(input), rigScene: JSON.parse(JSON.stringify(saved)) }; await runtime.setProject(reopened);
    assert.equal(runtime.state, 'paused'); assert.equal(runtime.stats.time, 0); near(runtime.getRigNodeSnapshot('body').time, poseTime);
    assert.equal(runtime.getRigSequenceSnapshot().status, 'ready'); assert.equal(runtime.getRigSequenceSnapshot().activationId, 0);
    assert.equal(runtime.getRigSequenceSnapshot().eventCount, 0); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    runtime.renderOnce(); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.equal(env.images.length, 1, 'Ready atlas cache is shared on reload');
    tick(runtime, 53); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); tick(runtime, 1); assert.equal(runtime.getVfxPlaybackSnapshot()[0].age, 0);
    const removed = copy(reopened); delete removed.rigScene; await runtime.setProject(removed);
    assert.equal(runtime.getRigSequenceSnapshot().status, 'unavailable'); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.equal(runtime.assets.size, 0);
    assert.equal(runtime.replayRigSequence(), false); assert.equal(runtime.stopRigSequence(), false);
  } finally { runtime.dispose(); }
});

test('missing or mismatched atlas rejects activation and never draws a primitive substitute', async () => {
  for (const options of [{ failImage: true }, { atlasWidth: 3839 }]) {
    const env = surface(options), runtime = new FDGRuntime(env.canvas, project());
    try {
      assert.equal(runtime.step(FIXED_STEP), 0); await runtime.load();
      assert.equal(runtime.getRigSequenceSnapshot().assetReady, false); assert.equal(runtime.replayRigSequence(), false);
      assert.throws(() => runtime.start(), /아틀라스/); assert.equal(runtime.step(FIXED_STEP), 0);
      assert.equal(runtime.stats.time, 0); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.equal(env.calls.length, 0);
    } finally { runtime.dispose(); }
  }
});

test('read-only source consumers cannot activate sequence; dispose cancels owner resources and all previous FX', async () => {
  const env = surface(), runtime = new FDGRuntime(env.canvas, project());
  try {
    await runtime.load();
    for (const key of ['_sourcePreview', '_sourceScene', '_terrainScene']) {
      runtime[key] = {}; assert.equal(runtime.replayRigSequence(), false); assert.equal(runtime.stopRigSequence(), false);
      assert.equal(runtime.getRigSequenceSnapshot().status, 'unavailable'); runtime[key] = null;
    }
    runtime.start(); assert.equal(env.frames.size, 1); tick(runtime, 54); assert.equal(runtime.getRigSequenceSnapshot().atlasActive, true);
    runtime.dispose(); assert.equal(env.frames.size, 0); assert.equal(env.listenerCount(), 0); assert.equal(env.observers.size, 0);
    assert.equal(runtime.assets.size, 0); assert.equal(runtime.particles.count, 0); assert.equal(runtime._pendingAssets.size, 0);
    assert.equal(runtime.getRigSequenceSnapshot().status, 'unavailable'); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    assert.equal(runtime.step(FIXED_STEP), 0); assert.equal(runtime.replayRigSequence(), false); assert.equal(runtime.stopRigSequence(), false);
  } finally { runtime.dispose(); }
});
