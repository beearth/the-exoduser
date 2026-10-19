import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { evaluateRig } from '../engine/fdg/rig.js';
import { RigSceneRuntime } from '../engine/fdg/rig-scene-runtime.js';
import { validateRigScene } from '../engine/fdg/rig-scene-project.js';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';
import { buildTailIdleScene, IDLE_TIMES, IDLE_BREATH, IDLE_SWAY, IDLE_CLIP_ID,
  ATTACK_ENTRY_SECONDS, IDLE_RETURN_SECONDS } from '../tools/fdg-studio/build-hell-aberrant-idle.mjs';

// Only new r6 authored motion and consumer changes. Earlier test modules and source pixels are never loaded.
const ROOT = new URL('../', import.meta.url);
const load = relative => {
  const raw = fs.readFileSync(new URL(relative, ROOT));
  return { relative, bytes: raw.length, sha256: crypto.createHash('sha256').update(raw).digest('hex'), data: JSON.parse(raw) };
};
const shipping = load('tools/fdg-studio/fixtures/hell-aberrant-tail-idle.fdg.json');
const standalone = load('tools/fdg-studio/fixtures/hell-aberrant-tail-idle.rig.json');
const baseline = load('tools/fdg-studio/fixtures/hell-aberrant-tail-readability.fdg.json');
const scene = shipping.data, rig = scene.rigScene.resources[0].project;
const prior = baseline.data, oldRig = prior.rigScene.resources[0].project;
const nodeId = 'hell-body-node', attackId = 'tail-swipe-once', idleId = 'hell-idle-breath';
const EPS_MODEL = 1e-7, ppm = rig.provenance.sourcePxPerModelUnit;
const clone = value => structuredClone(value);
const near = (actual, expected, epsilon = 1e-8) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
const distance = (a, b) => Math.hypot(...a.map((value, axis) => value - b[axis]));
const xyDistance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const bone = (e, id) => e.bonePositions.find(item => item.id === id).position;
const maximumVertexDrift = (a, b) => Math.max(...a.vertices.map((vertex, i) => distance(vertex, b.vertices[i])));
const maximumBoneDrift = (a, b) => Math.max(...a.bonePositions.map((item, i) => distance(item.position, b.bonePositions[i].position)));
const samePose = (a, b) => {
  assert.ok(maximumVertexDrift(a, b) <= EPS_MODEL, 'Actual LBS vertices remain continuous');
  assert.ok(maximumBoneDrift(a, b) <= EPS_MODEL, 'Actual hierarchy-world bones remain continuous');
};
const evaluate = (clipId, time, blend = null) => evaluateRig(rig, { clipId, time, pose: rig.preview.pose, blend });
const idleBind = evaluate(idleId, 0);
const sourcePx = i => rig.mesh.uvs[i].map((value, axis) => value * rig.provenance.sourceSize[axis]);
const capAnchors = rig.provenance.tailContinuity.seamAnchors.map(anchor => {
  const indices = rig.mesh.uvs.flatMap((_uv, i) => xyDistance(sourcePx(i), anchor.sourcePx) < .0002 ? [i] : []);
  return { sourcePx: anchor.sourcePx, region: anchor.region,
    tail: indices.filter(i => rig.provenance.regions[i] === 'tail'),
    leg: indices.filter(i => rig.provenance.regions[i] === anchor.region) };
});
const legVertices = rig.provenance.regions.flatMap((region, i) => ['leftLeg', 'rightLeg'].includes(region) ? [i] : []);
const supportMetric = evaluation => {
  let capClosure = 0;
  for (const anchor of capAnchors) for (const tail of anchor.tail) for (const leg of anchor.leg) {
    capClosure = Math.max(capClosure, xyDistance(evaluation.vertices[tail], evaluation.vertices[leg]));
  }
  return { footDriftModel: Math.max(...['leftFoot', 'rightFoot'].map(id => distance(bone(evaluation, id), bone(idleBind, id)))),
    legVertexDriftModel: Math.max(...legVertices.map(i => distance(evaluation.vertices[i], idleBind.vertices[i]))),
    capClosureModel: capClosure };
};
const fixedSupport = evaluation => {
  const metric = supportMetric(evaluation);
  for (const value of Object.values(metric)) assert.ok(value <= EPS_MODEL, 'Feet, actual leg surfaces and same-UV cut-caps stay fixed/closed');
  return metric;
};
const tick = (runtime, count) => { for (let i = 0; i < count; i++) assert.equal(runtime.step(FIXED_STEP), 1); };
const consumerTick = (consumer, count) => { for (let i = 0; i < count; i++) assert.equal(consumer.update(FIXED_STEP), true); };

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(callback); }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  count() { return [...this.listeners.values()].reduce((sum, callbacks) => sum + callbacks.size, 0); }
}

function surface() {
  // Image sizes come from authored metadata; no source PNG is read or decoded by this test.
  const dimensions = new Map();
  for (const definition of [...scene.characters, ...scene.vfx]) if (definition.sprite) {
    const sprite = definition.sprite, size = [sprite.frameWidth * sprite.columns, sprite.frameHeight * sprite.rows];
    for (const src of [sprite.src, ...Object.values(sprite.directions ?? {})]) dimensions.set(`/${src}`, size);
  }
  for (const material of rig.materials) if (material.texture) dimensions.set(`/${material.texture.src}`, [material.texture.width, material.texture.height]);
  const atlas = scene.rigScene.sequence.atlas, atlasSrc = `/${atlas.src}`;
  dimensions.set(atlasSrc, [atlas.frameWidth * atlas.columns, atlas.frameHeight * atlas.rows]);
  const window = new Events(), document = new Events(), canvas = new Events();
  const calls = [], images = [], frames = new Map(), observers = new Set(), context = { globalAlpha: 1 };
  for (const method of ['setTransform', 'fillRect', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'stroke', 'strokeRect',
    'fillText', 'ellipse', 'fill', 'arc', 'save', 'restore', 'clip', 'transform']) context[method] = () => {};
  context.drawImage = (...args) => {
    if (args[0].source === atlasSrc) calls.push({ source: args[0].source, cell: args.slice(1, 5), destination: args.slice(5), alpha: context.globalAlpha });
  };
  let rafId = 0;
  Object.assign(window, { devicePixelRatio: 1,
    requestAnimationFrame(callback) { const id = ++rafId; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    ResizeObserver: class { observe() { observers.add(this); } disconnect() { observers.delete(this); } },
    Image: class {
      constructor() { images.push(this); }
      set src(source) {
        this.source = source;
        [this.naturalWidth, this.naturalHeight] = dimensions.get(source) ?? [0, 0];
        queueMicrotask(() => this.onload?.());
      }
      removeAttribute() {}
    },
  });
  document.defaultView = window;
  const attributes = new Map();
  Object.assign(canvas, { ownerDocument: document, width: 320, height: 240, getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 240 }),
    hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name),
  });
  return { window, document, canvas, calls, images, frames, observers, atlasSrc,
    listenerCount: () => window.count() + document.count() + canvas.count(),
    fire(timestamp) { const next = frames.entries().next().value; assert.ok(next); frames.delete(next[0]); next[1](timestamp); },
  };
}

const results = [], metrics = { idle: [], transitions: [], owner: {}, capture: {} };
const check = (name, body) => test(name, async () => {
  try { await body(); results.push({ name, status: 'pass' }); }
  catch (error) { results.push({ name, status: 'fail', message: error.message }); throw error; }
});

check('r6 adds genuine closed breathing idle and strict optional settings while preserving r5 attack, supports and behind-leg layers', () => {
  assert.deepEqual(rig, standalone.data); assert.deepEqual(scene, JSON.parse(JSON.stringify(buildTailIdleScene(prior))));
  assert.equal(scene.id, 'hell-aberrant-tail-idle-scene-r6'); assert.equal(rig.id, 'hell-aberrant-tail-idle-transition-r6');
  assert.equal(IDLE_CLIP_ID, idleId); assert.equal(ATTACK_ENTRY_SECONDS, .25); assert.equal(IDLE_RETURN_SECONDS, .35);
  assert.deepEqual(IDLE_TIMES, [0, .25, .5, .75, 1, 1.25, 1.5, 1.75, 2]);
  assert.deepEqual(IDLE_BREATH, [0, .146447, .5, .853553, 1, .853553, .5, .146447, 0]);
  assert.deepEqual(IDLE_SWAY, [0, .707107, 1, .707107, 0, -.707107, -1, -.707107, 0]);
  assert.equal(rig.clips.length, 3); assert.deepEqual(rig.clips.slice(0, 2), oldRig.clips, 'Both accepted r5 attack clips remain exact');
  assert.deepEqual(rig.mesh, oldRig.mesh); assert.deepEqual(rig.skeleton, oldRig.skeleton); assert.deepEqual(rig.materials, oldRig.materials);
  const normalized = clone(scene), normalizedRig = normalized.rigScene.resources[0].project;
  normalized.id = prior.id; normalized.name = prior.name; normalized.rigScene.resources[0].name = prior.rigScene.resources[0].name;
  normalizedRig.id = oldRig.id; normalizedRig.name = oldRig.name; normalizedRig.clips.pop();
  normalizedRig.preview = clone(oldRig.preview); delete normalizedRig.provenance.idleTransition;
  normalized.rigScene.nodes[0] = clone(prior.rigScene.nodes[0]); normalized.rigScene.sequence = clone(prior.rigScene.sequence);
  assert.deepEqual(normalized, prior, 'No map/native/source/geometry/settings drift outside explicit r6 authoring');
  const idle = rig.clips.find(clip => clip.id === idleId);
  assert.equal(idle.loop, true); assert.equal(idle.duration, 2); assert.equal(idle.fps, 24);
  assert.deepEqual(idle.tracks.map(track => track.boneId), ['spine', 'head', 'leftArm', 'leftForearm', 'rightArm', 'rightForearm']);
  for (const track of idle.tracks) {
    assert.deepEqual(track.keys.map(key => key.time), IDLE_TIMES);
    assert.deepEqual(track.keys[0].translation, track.keys.at(-1).translation);
    assert.deepEqual(track.keys[0].rotation, track.keys.at(-1).rotation);
  }
  assert.equal(capAnchors.length, 27);
  for (const anchor of capAnchors) assert.ok(anchor.tail.length && anchor.leg.length, 'Real same-UV tail/leg cap pair exists');
  const tailLayers = [], legLayers = [];
  for (let i = 0; i < rig.mesh.triangles.length; i++) {
    const region = rig.provenance.regions[rig.mesh.triangles[i][0]];
    if (region === 'tail') tailLayers.push(rig.mesh.drawOrder[i]);
    if (['leftLeg', 'rightLeg'].includes(region)) legLayers.push(rig.mesh.drawOrder[i]);
  }
  assert.ok(Math.max(...tailLayers) < Math.min(...legLayers), 'Authored tail surface remains behind both legs');
  for (const time of [...IDLE_TIMES, .125, .875, 1.875, 2 - 1e-6]) {
    const e = evaluate(idleId, time);
    metrics.idle.push({ time, allVertexDriftModel: maximumVertexDrift(e, idleBind), ...fixedSupport(e) });
  }
  const breathing = evaluate(idleId, 1), swaying = evaluate(idleId, .5);
  assert.ok(bone(breathing, 'spine')[1] - bone(idleBind, 'spine')[1] >= .03, 'Actual hierarchy breath lifts the upper body');
  assert.ok(maximumVertexDrift(breathing, idleBind) * ppm > 1, 'Real textured LBS surface moves, not an idle alias');
  assert.ok(bone(swaying, 'spine')[0] - bone(idleBind, 'spine')[0] >= .024);
  samePose(evaluate(idleId, .37), evaluate(idleId, 2.37));
  const nonloop = clone(rig); nonloop.clips.find(clip => clip.id === idleId).loop = false;
  samePose(idleBind, evaluateRig(nonloop, { clipId: idleId, time: 2 }));
  metrics.loopSeamDriftModel = maximumVertexDrift(evaluate(idleId, 2 - 1e-6), idleBind);
  assert.ok(metrics.loopSeamDriftModel < 1e-5, 'Near-end loop surface approaches start; duration modulo alone cannot pass');
  assert.equal(validateRigScene(scene.rigScene).ok, true);
  const invalid = [
    s => { s.nodes[0].returnTo = null; }, s => { s.nodes[0].returnTo = []; },
    s => { s.nodes[0].returnTo.clipId = 'missing'; }, s => { s.nodes[0].returnTo.clipId = attackId; },
    s => { s.nodes[0].returnTo.transitionSeconds = -.01; }, s => { s.nodes[0].returnTo.transitionSeconds = 10.01; },
    s => { s.nodes[0].returnTo.transitionSeconds = '0.35'; }, s => { s.sequence.autoStart = 0; },
    s => { s.sequence.autoStart = 'false'; }, s => { s.sequence.entryTransitionSeconds = -.01; },
    s => { s.sequence.entryTransitionSeconds = 10.01; }, s => { s.sequence.entryTransitionSeconds = '0.25'; },
  ];
  for (const mutate of invalid) { const candidate = clone(scene.rigScene); mutate(candidate); assert.equal(validateRigScene(candidate).ok, false); }
  for (const duration of [0, 10]) {
    const boundary = clone(scene.rigScene); boundary.nodes[0].returnTo.transitionSeconds = duration; boundary.sequence.entryTransitionSeconds = duration;
    assert.equal(validateRigScene(boundary).ok, true);
  }
  metrics.invalidConfigurationCount = invalid.length;
});

check('actual consumer retains t0 pose, bounded fixed supports, .25 entry and .35 automatic return without sequence disarm', () => {
  const consumer = new RigSceneRuntime(scene.rigScene);
  try {
    consumerTick(consumer, 30); const before = consumer.getNodeSnapshot(nodeId);
    assert.equal(before.clipId, idleId); near(before.time, .5); assert.equal(consumer.getSequenceSnapshot().activationId, 0);
    assert.equal(consumer.replaySequence(), true); const entry = consumer.getNodeSnapshot(nodeId);
    samePose(entry, before); fixedSupport(entry);
    assert.equal(entry.clipId, attackId); assert.equal(entry.time, 0); near(entry.transition.duration, .25); near(entry.transition.fromTime, .5);
    const armedEntry = consumer.getSequenceSnapshot();
    assert.equal(consumer.replaySequence(), false); assert.equal(consumer.setClip(nodeId, idleId, .35), false);
    assert.deepEqual(consumer.getSequenceSnapshot(), armedEntry);
    assert.deepEqual(consumer.getNodeSnapshot(nodeId), entry, 'Rejecting an interrupt does not capture a partial blended pose');
    consumerTick(consumer, 7); const middle = consumer.getNodeSnapshot(nodeId);
    samePose(middle, evaluate(attackId, middle.time, { fromClipId: idleId, fromTime: middle.transition.fromTime, amount: middle.transition.elapsed / .25 }));
    metrics.transitions.push({ phase: 'entry-middle', time: middle.time, fromTime: middle.transition.fromTime, amount: middle.transition.elapsed / .25, ...fixedSupport(middle) });
    consumerTick(consumer, 8); const entered = consumer.getNodeSnapshot(nodeId);
    assert.equal(entered.transition, null); near(entered.time, .25); samePose(entered, evaluate(attackId, .25));
    consumerTick(consumer, 165); const returned = consumer.getNodeSnapshot(nodeId), completed = consumer.getSequenceSnapshot();
    assert.equal(completed.status, 'completed'); assert.equal(completed.activationId, 1); assert.equal(completed.eventCount, 1); near(completed.elapsed, 3);
    assert.equal(returned.clipId, idleId); assert.equal(returned.time, 0); near(returned.transition.duration, .35);
    assert.equal(returned.transition.fromClipId, attackId); near(returned.transition.fromTime, 3);
    samePose(returned, evaluate(attackId, 3)); fixedSupport(returned);
    const event = consumer.takeSequenceEvent(); assert.equal(event.activationId, 1); assert.equal(event.definition.sprite.src, scene.rigScene.sequence.atlas.src);
    assert.equal(consumer.takeSequenceEvent(), null, 'Automatic return retains and consumes pending event exactly once');
    const armedReturn = consumer.getSequenceSnapshot();
    assert.equal(consumer.replaySequence(), false); assert.equal(consumer.setClip(nodeId, attackId), false);
    assert.deepEqual(consumer.getSequenceSnapshot(), armedReturn); assert.deepEqual(consumer.getNodeSnapshot(nodeId), returned);
    consumerTick(consumer, 10); const returning = consumer.getNodeSnapshot(nodeId);
    samePose(returning, evaluate(idleId, returning.time, { fromClipId: attackId, fromTime: returning.transition.fromTime, amount: returning.transition.elapsed / .35 }));
    metrics.transitions.push({ phase: 'return-middle', time: returning.time, fromTime: returning.transition.fromTime, amount: returning.transition.elapsed / .35, ...fixedSupport(returning) });
    consumerTick(consumer, 11); const idle = consumer.getNodeSnapshot(nodeId);
    assert.equal(idle.transition, null); near(idle.time, .35); samePose(idle, evaluate(idleId, .35)); fixedSupport(idle);
    consumerTick(consumer, 120); samePose(consumer.getNodeSnapshot(nodeId), idle);
    assert.equal(consumer.getSequenceSnapshot().eventCount, 1); near(consumer.getSequenceSnapshot().elapsed, 3);
    const state = consumer.snapshot(); assert.equal(state.ownedRaf, 0); assert.equal(state.ownedListeners, 0);
    metrics.transitions.push({ phase: 'return-complete', attackElapsed: consumer.getSequenceSnapshot().elapsed, idleTime: consumer.getNodeSnapshot(nodeId).time, ...fixedSupport(idle) });
  } finally { consumer.dispose(); }
});

check('public owner keeps Play idle, emits attack .900 once on the actual atlas and preserves live FX through an idle crossfade', async () => {
  const env = surface(), runtime = new FDGRuntime(env.canvas, clone(scene));
  try {
    await runtime.load(); runtime.pause(); const imageCount = env.images.length, listeners = env.listenerCount();
    tick(runtime, 30); runtime.start(); assert.equal(env.frames.size, 1); env.fire(0); env.fire(1000 / 60); runtime.pause();
    assert.equal(runtime.getRigNodeSnapshot(nodeId).clipId, idleId); assert.equal(runtime.getRigSequenceSnapshot().status, 'ready');
    assert.equal(runtime.getRigSequenceSnapshot().activationId, 0); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    const activationClock = runtime.stats.time; assert.equal(runtime.replayRigSequence(), true);
    tick(runtime, 53); assert.equal(runtime.getRigSequenceSnapshot().eventCount, 0); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    tick(runtime, 1); const state = runtime.getRigSequenceSnapshot(), fx = state.activeFx[0];
    near(runtime.stats.time - activationClock, .9); near(state.elapsed, .9);
    assert.equal(state.activationId, 1); assert.equal(state.eventCount, 1); assert.equal(state.emittedCount, 1);
    assert.equal(fx.age, 0); assert.equal(fx.frameIndex, 0); assert.equal(fx.life, 1.5); assert.equal(fx.loop, false);
    assert.equal(fx.sequenceId, scene.rigScene.sequence.id); assert.deepEqual(fx.cell, { sx: 0, sy: 0, sw: 640, sh: 640 });
    env.calls.length = 0; runtime.renderOnce(); assert.equal(env.calls.length, 1);
    assert.deepEqual(env.calls[0].cell, [0, 0, 640, 640]); near(env.calls[0].destination[2], 102.4); near(env.calls[0].destination[3], 102.4);
    const paused = runtime.getRigSequenceSnapshot(); runtime.renderOnce(); assert.deepEqual(runtime.getRigSequenceSnapshot(), paused);
    tick(runtime, 24); const alive = runtime.getRigSequenceSnapshot().activeFx[0]; near(alive.age, .4); assert.equal(alive.frameIndex, 6);
    const instance = runtime.particles.pool[alive.particleIndex]; assert.ok(instance.active);
    assert.equal(runtime.setRigClip(nodeId, idleId, .35), true);
    assert.deepEqual(runtime.getRigSequenceSnapshot().activeFx[0], alive, 'Public clip transition does not clear the existing instance');
    assert.equal(runtime.getRigSequenceSnapshot().status, 'stopped');
    tick(runtime, 10); const fading = runtime.getRigSequenceSnapshot().activeFx[0];
    assert.equal(fading.particleIndex, alive.particleIndex); assert.equal(fading.activationId, alive.activationId); near(fading.age, .4 + 10 / 60);
    assert.equal(runtime.particles.pool[fading.particleIndex], instance); assert.equal(runtime.particles.count, 1);
    const beforeRejected = runtime.getRigSequenceSnapshot(), transitionBeforeRejected = runtime.getRigNodeSnapshot(nodeId);
    assert.equal(runtime.replayRigSequence(), false); assert.equal(runtime.setRigClip(nodeId, attackId), false);
    assert.deepEqual(runtime.getRigSequenceSnapshot(), beforeRejected); assert.deepEqual(runtime.getRigNodeSnapshot(nodeId), transitionBeforeRejected);
    assert.equal(beforeRejected.eventCount, 1); assert.equal(beforeRejected.emittedCount, 1);
    tick(runtime, 11); assert.equal(runtime.getRigNodeSnapshot(nodeId).transition, null);
    tick(runtime, 44); assert.equal(runtime.getRigSequenceSnapshot().atlasFrame, 23); near(runtime.getRigSequenceSnapshot().atlasAge, 89 / 60);
    tick(runtime, 1); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.equal(runtime.getRigSequenceSnapshot().atlasFrame, null);
    assert.equal(runtime.getRigSequenceSnapshot().eventCount, 1);
    assert.equal(runtime.replayRigSequence(), true); tick(runtime, 180);
    const automatic = runtime.getRigSequenceSnapshot(), node = runtime.getRigNodeSnapshot(nodeId);
    assert.equal(automatic.status, 'completed'); assert.equal(automatic.activationId, 2); assert.equal(automatic.eventCount, 1); near(automatic.elapsed, 3);
    assert.equal(node.clipId, idleId); assert.ok(node.transition); assert.deepEqual(automatic.activeFx, []);
    tick(runtime, 21); runtime.start(); env.fire(2000); env.fire(2000 + 1000 / 60); runtime.pause();
    assert.equal(runtime.getRigSequenceSnapshot().activationId, 2, 'Ordinary Play after completion keeps idle; only explicit Replay attacks');
    assert.equal(runtime.getRigSequenceSnapshot().status, 'completed'); near(runtime.getRigSequenceSnapshot().elapsed, 3);
    assert.equal(env.images.length, imageCount); assert.equal(env.listenerCount(), listeners); assert.equal(env.frames.size, 0);
    metrics.owner = { idleAutoActivations: 0, triggerRelativeOwnerSeconds: .9, triggerAge: fx.age, triggerFrame: fx.frameIndex,
      atlasLife: fx.life, destinationPx: 102.4, liveFxParticleIndex: alive.particleIndex, liveFxAgeAfterTransition: fading.age,
      expiryOwnerTicksFromTrigger: 90, explicitActivationCount: 2, completedAttackElapsed: automatic.elapsed, imageCount };
  } finally { runtime.dispose(); }
});

check('mid-transition capture preserves authored settings/pose while reload resets owner and FX without stale events, and dispose releases resources', async () => {
  const env = surface(), input = clone(scene), runtime = new FDGRuntime(env.canvas, input);
  try {
    await runtime.load(); tick(runtime, 30); assert.equal(runtime.replayRigSequence(), true); tick(runtime, 54);
    assert.equal(runtime.setRigClip(nodeId, idleId, .35), true); tick(runtime, 10); runtime.pause();
    const before = runtime.getRigNodeSnapshot(nodeId), saved = runtime.captureRigScene(), images = env.images.length;
    assert.ok(runtime.getRigSequenceSnapshot().atlasActive); assert.ok(before.transition);
    assert.deepEqual(saved.sequence, input.rigScene.sequence); assert.deepEqual(saved.nodes[0].returnTo, { clipId: idleId, transitionSeconds: .35 });
    assert.deepEqual(saved.nodes[0].transition, before.transition); near(saved.nodes[0].time, before.time);
    for (const transient of ['activationId', 'eventCount', 'emittedCount', 'activeFx', 'status']) assert.equal(Object.hasOwn(saved.sequence, transient), false);
    const reopened = clone(input); reopened.rigScene = JSON.parse(JSON.stringify(saved)); await runtime.setProject(reopened);
    const restored = runtime.getRigNodeSnapshot(nodeId), state = runtime.getRigSequenceSnapshot();
    samePose(restored, before); assert.deepEqual(restored.transition, before.transition); assert.deepEqual(restored.returnTo, before.returnTo);
    assert.equal(runtime.stats.time, 0); assert.equal(runtime.state, 'paused'); assert.equal(state.status, 'ready');
    assert.equal(state.activationId, 0); assert.equal(state.eventCount, 0); assert.equal(state.emittedCount, 0); assert.equal(state.elapsed, 0);
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.equal(env.images.length, images, 'Same source ready cache is reused');
    tick(runtime, 11); assert.equal(runtime.getRigNodeSnapshot(nodeId).transition, null);
    tick(runtime, 120); assert.equal(runtime.getRigSequenceSnapshot().activationId, 0); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    runtime.start(); assert.equal(env.frames.size, 1); assert.equal(runtime.getRigSequenceSnapshot().status, 'ready');
    assert.deepEqual(runtime.captureRigScene().sequence, saved.sequence);
    runtime.pause(); assert.equal(runtime.replayRigSequence(), true); tick(runtime, 53);
    assert.equal(runtime.getRigSequenceSnapshot().eventCount, 0); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    tick(runtime, 1); const fresh = runtime.getRigSequenceSnapshot();
    assert.equal(fresh.activationId, 1); assert.equal(fresh.eventCount, 1); assert.equal(fresh.activeFx.length, 1); assert.equal(fresh.activeFx[0].age, 0);
    metrics.capture = { savedClipId: before.clipId, savedTime: before.time, savedTransition: before.transition,
      savedFxAge: 10 / 60, restoredVertexDriftModel: maximumVertexDrift(restored, before), restoredBoneDriftModel: maximumBoneDrift(restored, before),
      reopenedOwnerClock: state.elapsed, reopenedActivation: state.activationId, reopenedFxCount: state.activeFx.length,
      postReloadIdleTicksWithoutEvent: 131, freshExplicitActivation: fresh.activationId, freshTriggerAge: fresh.activeFx[0].age,
      imagesBefore: images, imagesAfter: env.images.length };
    runtime.dispose(); assert.equal(env.frames.size, 0); assert.equal(env.listenerCount(), 0); assert.equal(env.observers.size, 0);
    assert.equal(runtime.assets.size, 0); assert.equal(runtime.particles.count, 0); assert.equal(runtime._pendingAssets.size, 0);
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.equal(runtime.getRigSequenceSnapshot().status, 'unavailable');
    assert.equal(runtime.step(FIXED_STEP), 0); assert.equal(runtime.replayRigSequence(), false);
  } finally { runtime.dispose(); }
});

after(() => {
  const evidence = process.env.FDG_IDLE_TEST_EVIDENCE;
  if (!evidence) return;
  fs.mkdirSync(evidence, { recursive: true });
  const artifacts = [shipping, standalone, baseline].map(({ data: _data, ...manifest }) => manifest);
  fs.writeFileSync(path.join(evidence, 'targeted-tail-idle-transition-receipt.json'), JSON.stringify({
    scope: 'new r6 authored idle/clip-return/owner FX/capture contract only; no previous suite, browser, PNG or Git validation',
    artifacts, tests: results, testCount: 4, passed: results.filter(item => item.status === 'pass').length,
    failed: results.filter(item => item.status === 'fail').length, oldSuitesExecuted: 0, sourceImagesRead: 0,
    idleId, idleDurationSeconds: 2, idleFps: 24, idleTracks: 6, keysPerIdleTrack: 9, capAnchorCount: capAnchors.length,
    entrySeconds: .25, returnSeconds: .35, eventSeconds: .9, fxLifeSeconds: 1.5, autoStart: false,
  }, null, 2));
  fs.writeFileSync(path.join(evidence, 'targeted-tail-idle-transition-metrics.json'), JSON.stringify({
    scope: 'actual new r6 CPU LBS/consumer/owner samples, data regression only; no visual or native production verdict',
    sourcePxPerModelUnit: ppm, nodeScale: scene.rigScene.nodes[0].scale, epsilonModel: EPS_MODEL,
    coordinates: 'hierarchy-world model units; source-equivalent px=model*300; owner60Hz, all time values demo seconds',
    ...metrics,
  }, null, 2));
});
