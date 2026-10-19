import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  DRUID_SLAM_MARKERS, createDruidSlamPhaseObserver, installDruidSlamNativeBridge,
} from '../engine/fdg/dark-druid-slam-bridge.js';
import { evaluateRig } from '../engine/fdg/rig.js';

const evidenceDir = process.env.FDG_DRUID_SLAM_TEST_EVIDENCE;
const metrics = {};
const clone = value => structuredClone(value);
const close = (actual, expected, tolerance = 1e-12) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const actor = (windFrames = 26) => ({
  ib: true, alive: true, s: 'bossSlamWind', st2: windFrames,
  stunned: 0, _hitStun: 0, facing: .73, x: 180, y: 240, r: 40,
  hp: 700, _weaponAng: -1.2, _nameTopOff: -120,
});
const immutableCall = (value, action) => {
  const before = clone(value), result = action();
  assert.deepEqual(value, before, 'phase observation must not write the native actor');
  return result;
};
const fixtureUrl = new URL('../tools/fdg-studio/fixtures/dark-druid-boss-slam-r3.rig.json', import.meta.url);
const loadFixture = async () => JSON.parse(await readFile(fixtureUrl, 'utf8'));

test('native slam phase sampling follows actual wind/8-frame strike/20-frame recovery without advancing an actor', () => {
  const observer = createDruidSlamPhaseObserver();
  assert.deepEqual(DRUID_SLAM_MARKERS, { windStart: 0, windEnd: 1, strikeEnd: 1.16, recoverEnd: 2.6 });
  const traces = [];
  // Native phase0..4 telegraphs, plus the supported14-frame extraDelay.
  for (const base of [26, 22, 17, 14, 8]) {
    for (const delay of [0, 14]) {
      const windFrames = base + delay, value = actor(windFrames), samples = [];
      assert.equal(immutableCall(value, () => observer.begin(value, windFrames)), true);
      const middle = Math.floor(windFrames / 2), middleProgress = (windFrames - middle) / windFrames;
      for (const [st2, progress, time] of [[windFrames, 0, 0], [middle, middleProgress, middleProgress], [0, 1, 1]]) {
        value.st2 = st2;
        const sample = immutableCall(value, () => observer.sample(value));
        assert.equal(sample.phase, 'wind'); close(sample.progress, progress); close(sample.time, time);
        assert.equal(sample.windFrames, windFrames); assert.equal(sample.facing, .73);
        for (let paused = 0; paused < 5; paused++) assert.deepEqual(immutableCall(value, () => observer.sample(value)), sample);
        samples.push(sample);
      }
      value.s = 'bossSlam';
      for (const [st2, progress, time] of [[8, 0, 1], [4, .5, 1.08], [0, 1, 1.16]]) {
        value.st2 = st2;
        const sample = immutableCall(value, () => observer.sample(value));
        assert.equal(sample.phase, 'strike'); close(sample.progress, progress); close(sample.time, time);
        assert.equal(sample.windFrames, windFrames); assert.equal(sample.facing, .73); samples.push(sample);
      }
      value.s = 'recover';
      for (const [st2, progress, time] of [[40, 0, 1.16], [20, 0, 1.16], [10, .5, 1.88], [0, 1, 2.6]]) {
        value.st2 = st2;
        const sample = immutableCall(value, () => observer.sample(value));
        assert.equal(sample.phase, 'recover'); close(sample.progress, progress); close(sample.time, time);
        assert.equal(sample.windFrames, windFrames); samples.push(sample);
      }
      traces.push({ base, extraDelay: delay, windFrames, samples });
    }
  }
  const custom = createDruidSlamPhaseObserver({ windStart: .2, windEnd: 2, strikeEnd: 2.5, recoverEnd: 5 });
  const value = actor(12); custom.begin(value, 12); value.st2 = 6;
  close(custom.sample(value).time, 1.1);
  metrics.phaseSampling = { markers: clone(DRUID_SLAM_MARKERS), nativeWindFrames: [26, 22, 17, 14, 8], extraDelayFrames: 14,
    strikeFrames: 8, recoverFrameCap: 20, nativeInitialRecoverFrames: 40, pausedRepeats: 5, traces, nativeActorWrites: 0 };
});

test('native observer rejects malformed markers and cancels interrupted or stale per-actor traces', () => {
  for (const markers of [
    {}, { windStart: -1, windEnd: 1, strikeEnd: 2, recoverEnd: 3 },
    { windStart: 0, windEnd: 0, strikeEnd: 2, recoverEnd: 3 },
    { windStart: 0, windEnd: 2, strikeEnd: 1, recoverEnd: 3 },
    { windStart: 0, windEnd: 1, strikeEnd: Infinity, recoverEnd: 3 },
    { windStart: 0, windEnd: 1, strikeEnd: 2, recoverEnd: NaN },
  ]) assert.throws(() => createDruidSlamPhaseObserver(markers), TypeError);
  const observer = createDruidSlamPhaseObserver();
  for (const invalid of [null, {}, { s: 'idle' }, { s: 'bossSlam' }, { s: 'recover' }]) {
    assert.equal(observer.begin(invalid, 26), false); assert.equal(observer.sample(invalid), null);
  }
  for (const invalid of [0, -1, NaN, Infinity]) assert.equal(observer.begin(actor(), invalid), false);
  const first = actor(26), second = actor(8);
  observer.begin(first, 26); observer.begin(second, 8); first.st2 = 13; second.st2 = 0;
  assert.equal(observer.sample(first).progress, .5); assert.equal(observer.sample(second).progress, 1);
  immutableCall(first, () => observer.cancel(first)); assert.equal(observer.sample(first), null);
  assert.equal(observer.sample(second).windFrames, 8, 'cancel must be per actor');
  const interruptions = [
    { alive: false }, { stunned: 1 }, { _hitStun: 1 }, { s: 'idle' }, { s: 'bossSweep' }, { st2: NaN },
  ];
  for (const patch of interruptions) {
    const value = actor(); observer.begin(value, 26); Object.assign(value, patch);
    assert.equal(immutableCall(value, () => observer.sample(value)), null);
    Object.assign(value, actor()); assert.equal(observer.sample(value), null, 'an interruption must not retain an activation');
  }
  const premature = actor(); observer.begin(premature, 26); premature.s = 'recover'; premature.st2 = 20;
  assert.equal(immutableCall(premature, () => observer.sample(premature)), null);
  premature.s = 'bossSlam'; premature.st2 = 8; assert.equal(observer.sample(premature), null);
  const rewound = actor(); observer.begin(rewound, 26); rewound.s = 'bossSlam'; rewound.st2 = 8;
  assert.equal(observer.sample(rewound).phase, 'strike'); rewound.s = 'bossSlamWind';
  assert.equal(observer.sample(rewound), null, 'a wind state after observed strike is a different pattern');
  const limits = actor(); observer.begin(limits, 26); limits.st2 = 100; limits.facing = NaN;
  assert.deepEqual(observer.sample(limits), { phase: 'wind', progress: 0, time: 0, windFrames: 26, facing: 0 });
  limits.st2 = -1; assert.equal(observer.sample(limits).time, 1);
  observer.cancel(null); observer.cancel(0);
  metrics.cancellation = { invalidMarkerCases: 6, invalidBeginActorCases: 5, invalidWindCases: 4,
    interruptionCases: interruptions.length, recoverRequiresObservedStrike: true, tracesPerActor: true, nativeActorWrites: 0 };
});

function canvasRecorder() {
  const draws = [], transforms = [], stack = [];
  const context = {
    globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000000',
    displayTransform: { a: 1, b: 0, c: 0, d: 1 },
    getTransform() { return this.displayTransform; },
    save() { stack.push({ globalAlpha: this.globalAlpha, globalCompositeOperation: this.globalCompositeOperation, fillStyle: this.fillStyle }); },
    restore() { assert.ok(stack.length); Object.assign(this, stack.pop()); },
    translate(...values) { assert.ok(values.every(Number.isFinite)); transforms.push({ method: 'translate', values }); },
    scale(...values) { assert.ok(values.every(Number.isFinite)); transforms.push({ method: 'scale', values }); },
    transform(...values) { assert.ok(values.every(Number.isFinite)); transforms.push({ method: 'transform', values }); },
    setTransform(...values) { assert.ok(values.every(Number.isFinite)); transforms.push({ method: 'setTransform', values }); },
    beginPath() {}, moveTo(...values) { assert.ok(values.every(Number.isFinite)); },
    lineTo(...values) { assert.ok(values.every(Number.isFinite)); }, closePath() {}, clip() {},
    ellipse(...values) { assert.ok(values.every(Number.isFinite)); },
    fill() { draws.push({ kind: 'fill', color: this.fillStyle, composite: this.globalCompositeOperation, alpha: this.globalAlpha }); },
    drawImage(...args) { draws.push({ kind: 'image', args, composite: this.globalCompositeOperation, alpha: this.globalAlpha }); },
  };
  return { context, draws, transforms, stack };
}

test('native start/draw wrappers consume the approved rig through real Canvas helpers and preserve fallback/ownership', async () => {
  const rig = await loadFixture(), beforeRig = clone(rig);
  const image = { naturalWidth: 355, naturalHeight: 541 };
  const calls = [], owner = { owner: true };
  let stage = 0, finale = false;
  const sourceStart = function (value, move, distance, phase, extraDelay) {
    calls.push({ kind: 'start', receiver: this, args: [move, distance, phase, extraDelay] });
    value.s = move.id === 'slam' ? 'bossSlamWind' : 'bossSweepWind';
    value.st2 = [26, 22, 17, 14, 8][phase] + extraDelay;
    return 'native-start-result';
  };
  const sourceDraw = function (...args) { calls.push({ kind: 'fallback', receiver: this, args }); return 'native-draw-result'; };
  const scope = { _bossStartPattern: sourceStart, _drawDruidBoss: sourceDraw, _btScaleMul: 2, _BOSS_GLOW: true };
  const scopeKeys = Object.keys(scope);
  const rasterCapture = canvasRecorder(), rasterSizes = [];
  let factoryCalls = 0, rasterWidth = 0, rasterHeight = 0;
  const rasterCanvas = {
    get width() { return rasterWidth; }, set width(value) { rasterWidth = value; rasterSizes.push(['width', value]); },
    get height() { return rasterHeight; }, set height(value) { rasterHeight = value; rasterSizes.push(['height', value]); },
    getContext(type) { assert.equal(type, '2d'); return rasterCapture.context; },
  };
  const canvasFactory = () => { factoryCalls++; return rasterCanvas; };
  const bridge = installDruidSlamNativeBridge({ scope, rig, image, getStage: () => stage, isFinale: () => finale,
    drawTell(context, value) { calls.push({ kind: 'tell', context, value }); },
    canvasFactory,
  });
  assert.deepEqual(Object.keys(scope), scopeKeys);
  const start = scope._bossStartPattern, draw = scope._drawDruidBoss, value = actor();
  value.s = 'idle'; value.st2 = 0;
  const beforeStart = clone(value), move = { id: 'slam' };
  assert.equal(start.call(owner, value, move, 170, 2, 14), 'native-start-result');
  assert.deepEqual(value, { ...beforeStart, s: 'bossSlamWind', st2: 31 });
  assert.deepEqual(calls[0], { kind: 'start', receiver: owner, args: [move, 170, 2, 14] });
  assert.equal(bridge.getSnapshot(value).windFrames, 31, 'observer must begin after original native start sets st2');
  const spec = { dw: 3.8, dh: 5.8, glow: '#998877' }, alpha = .7, tdY = 3;
  const capture = canvasRecorder(), beforeDraw = clone(value);
  assert.equal(draw.call(owner, capture.context, value, alpha, tdY, spec), true);
  assert.deepEqual(value, { ...beforeDraw, _nameTopOff: tdY - 6 - value.r * spec.dh * .86 / 2 - 10 });
  assert.equal(calls.filter(item => item.kind === 'fallback').length, 0);
  assert.equal(calls.filter(item => item.kind === 'tell').length, 1);
  assert.equal(calls[1].context, capture.context); assert.equal(calls[1].value, value);
  assert.equal(capture.stack.length, 0); assert.equal(capture.context.globalAlpha, 1);
  assert.equal(capture.context.globalCompositeOperation, 'source-over');
  assert.deepEqual(capture.transforms.slice(0, 2), [
    { method: 'translate', values: [value.x, value.y + tdY - 6] }, { method: 'scale', values: [.5, .5] },
  ]);
  const textureDraws = rasterCapture.draws.filter(item => item.kind === 'image');
  assert.ok(textureDraws.length > 0, 'bridge must call actual triangle UV image rendering');
  for (const item of textureDraws) assert.deepEqual(item.args, [image, 0, 0, 355, 541]);
  for (const item of textureDraws) { assert.equal(item.composite, 'source-over'); assert.equal(item.alpha, 1); }
  const mainDraws = capture.draws.filter(item => item.kind === 'image');
  assert.equal(mainDraws.length, 3);
  assert.deepEqual(mainDraws.map(item => [item.composite, item.alpha]), [
    ['source-over', alpha], ['lighter', alpha * .42], ['lighter', alpha * .42],
  ]);
  for (const item of mainDraws) {
    assert.equal(item.args[0], rasterCanvas); assert.equal(item.args.length, 5);
    assert.ok(item.args.slice(1).every(Number.isFinite)); assert.ok(item.args[3] > 0 && item.args[4] > 0);
  }
  assert.equal(factoryCalls, 1); assert.ok(rasterCanvas.width > 0 && rasterCanvas.height > 0);
  const firstRasterDrawCount = rasterCapture.draws.length, firstRasterTransformCount = rasterCapture.transforms.length;
  const firstRasterSizeWrites = rasterSizes.length;
  const firstTransform = rasterCapture.transforms.find(item => item.method === 'transform').values;
  const paused = canvasRecorder(); draw.call(owner, paused.context, value, alpha, tdY, spec);
  assert.deepEqual(paused.transforms, capture.transforms, 'pause must use the same phase pose');
  assert.deepEqual(paused.draws, capture.draws);
  assert.equal(rasterCapture.draws.length, firstRasterDrawCount, 'same paused pose must not rewrite its raster');
  assert.equal(rasterCapture.transforms.length, firstRasterTransformCount); assert.equal(rasterSizes.length, firstRasterSizeWrites);
  const rasterChanges = [];
  for (const [key, mutate] of [
    ['phase-time', () => { value.st2 = 15; }], ['facing', () => { value.facing = Math.PI; }],
    ['actor-size', () => { value.r += 2; }], ['owner-scale', () => { scope._btScaleMul = 1; }],
    ['display-transform-scale', context => { context.displayTransform = { a: 1.5, b: 0, c: 0, d: 1.5 }; }],
  ]) {
    const changed = canvasRecorder(), beforeCount = rasterCapture.draws.length;
    mutate(changed.context); draw.call(owner, changed.context, value, alpha, tdY, spec);
    assert.ok(rasterCapture.draws.length > beforeCount, `${key} must invalidate the raster`);
    assert.equal(changed.draws.filter(item => item.kind === 'image').length, 3);
    rasterChanges.push({ key, addedRasterDraws: rasterCapture.draws.length - beforeCount });
  }
  value.r = 40; scope._btScaleMul = 2;
  const mirror = actor(); mirror.facing = Math.PI; start.call(owner, mirror, move, 170, 0, 0);
  const mirrorStart = rasterCapture.transforms.length;
  const mirrored = canvasRecorder(); draw.call(owner, mirrored.context, mirror, alpha, tdY, spec);
  const mirrorTransform = rasterCapture.transforms.slice(mirrorStart).find(item => item.method === 'transform').values;
  close(mirrorTransform[0], -firstTransform[0]); close(mirrorTransform[2], -firstTransform[2]); close(mirrorTransform[4], -firstTransform[4]);
  close(mirrorTransform[1], firstTransform[1]); close(mirrorTransform[3], firstTransform[3]); close(mirrorTransform[5], firstTransform[5]);
  for (const mode of ['other-stage', 'finale', 'non-boss', 'other-move', 'interrupted']) {
    const fallbackActor = actor();
    stage = mode === 'other-stage' ? 1 : 3; finale = mode === 'finale';
    if (mode === 'non-boss') fallbackActor.ib = false;
    start.call(owner, fallbackActor, { id: mode === 'other-move' ? 'sweep' : 'slam' }, 170, 0, 0);
    if (mode === 'interrupted') fallbackActor._hitStun = 1;
    const fallbackCapture = canvasRecorder(), before = clone(fallbackActor);
    assert.equal(draw.call(owner, fallbackCapture.context, fallbackActor, alpha, tdY, spec), 'native-draw-result');
    assert.deepEqual(fallbackActor, before); assert.equal(fallbackCapture.draws.length, 0);
    const last = calls.at(-1); assert.equal(last.kind, 'fallback'); assert.equal(last.receiver, owner);
    assert.deepEqual(last.args, [fallbackCapture.context, fallbackActor, alpha, tdY, spec]);
  }
  assert.equal(factoryCalls, 1, 'all renders must share one owner Canvas');
  bridge.uninstall(); assert.equal(scope._bossStartPattern, sourceStart); assert.equal(scope._drawDruidBoss, sourceDraw);
  assert.equal(rasterCanvas.width, 0); assert.equal(rasterCanvas.height, 0);
  bridge.uninstall(); assert.equal(scope._drawDruidBoss, sourceDraw);
  stage = 0; finale = false;
  const replaced = installDruidSlamNativeBridge({ scope, rig, image, getStage: () => stage, canvasFactory });
  const otherStart = () => 'other-start', otherDraw = () => 'other-draw';
  scope._bossStartPattern = otherStart; scope._drawDruidBoss = otherDraw; replaced.uninstall();
  assert.equal(scope._bossStartPattern, otherStart); assert.equal(scope._drawDruidBoss, otherDraw);
  assert.deepEqual(rig, beforeRig, 'the bridge must not change the rig fixture');
  assert.throws(() => installDruidSlamNativeBridge({ scope, rig, image: { naturalWidth: 354, naturalHeight: 541 }, getStage: () => 0 }), TypeError);
  metrics.bridge = { originalStartFirst: true, actorChangesByBridgeStart: 0, rendererAllowedActorField: '_nameTopOff',
    sourceImage: [355, 541], firstRasterTextureDraws: textureDraws.length, mainSourceOverDraws: 1, mainLighterDraws: 2,
    mainImageDrawsPerRender: 3, pausedRasterRewrites: 0, rasterInvalidations: rasterChanges, ownerCanvases: factoryCalls,
    uninstallCanvasSize: [rasterCanvas.width, rasterCanvas.height], fallbackCases: 5, originalReceiverAndArgumentsPreserved: true,
    ownWrapperRestored: true, laterWrapperPreserved: true, mirroredFrontOnly: true, nativeLiveBattleExecuted: false };
});

test('the new slam clip moves the rigid hand-owned prop downward while keeping independent head articulation and fixed boots', async () => {
  const rig = await loadFixture(), clipId = 'dark-druid-native-slam-r3';
  const scene = JSON.parse(await readFile(new URL('../tools/fdg-studio/fixtures/dark-druid-boss-slam-r3.fdg.json', import.meta.url), 'utf8'));
  assert.deepEqual(scene.rigScene.resources[0].project, rig);
  assert.equal(scene.rigScene.sequence, undefined); assert.equal(scene.provenance.bodyAuthoring.fx, 0);
  assert.deepEqual([rig.mesh.vertices.length, rig.mesh.triangles.length, rig.skeleton.bones.length, rig.materials.length, rig.clips.length], [3729, 4680, 19, 1, 2]);
  assert.equal(rig.provenance.sourceGapCount, 1);
  assert.equal((rig.provenance.sourceGap.match(/SOURCE_GAP/g) ?? []).length, 1);
  assert.equal(rig.provenance.hiddenSurfaceAuthoring.sourceRecovered, false);
  assert.equal(rig.provenance.hiddenSurfaceAuthoring.sourceTextureGenerated, false);
  const clip = rig.clips.find(item => item.id === clipId);
  assert.equal(clip.duration, 2.6); assert.equal(clip.fps, 24); assert.equal(clip.loop, false);
  assert.deepEqual(rig.provenance.bossSlam.phaseMarkers, DRUID_SLAM_MARKERS);
  assert.equal(rig.provenance.bossSlam.headStaffCommonSkinCompensation, false);
  const staffBone = rig.skeleton.bones.find(item => item.id === 'staff');
  assert.equal(staffBone.parent, 'leftHand'); assert.deepEqual(staffBone.translation, [0, 0, 0]);
  assert.deepEqual(staffBone.rotation, [0, 0, 0]);
  assert.equal(rig.skeleton.bones.find(item => item.id === 'head').parent, 'neck');
  for (const id of ['leftUpperArm', 'leftForearm', 'leftHand']) {
    const track = clip.tracks.find(item => item.boneId === id);
    for (const key of track.keys) assert.deepEqual(key.translation, [0, 0, 0], 'the baked arm rotates its source-length links');
  }
  for (const item of rig.clips) {
    assert.equal(item.tracks.some(track => ['staff', 'leftBoot', 'rightBoot'].includes(track.boneId)), false);
    const headTrack = item.tracks.find(track => track.boneId === 'head');
    for (const key of headTrack.keys) assert.deepEqual(key.translation, [0, 0, 0], 'head translation must not compensate the staff skin matrix');
  }
  const regions = rig.provenance.regions, triangleRegions = rig.provenance.triangleRegions;
  const staffVertices = regions.flatMap((part, index) => part === 'staff' || part === 'leftHand' ? [index] : []);
  const bootVertices = regions.flatMap((part, index) => part === 'leftBoot' || part === 'rightBoot' ? [index] : []);
  assert.ok(staffVertices.length > 0); assert.ok(bootVertices.length > 0);
  for (const index of staffVertices) assert.deepEqual(rig.mesh.weights[index], [{ boneId: 'staff', weight: 1 }]);
  const rigidSleeves = { leftUpperSleeve: 'leftUpperArm', leftForeSleeve: 'leftForearm' };
  const sleeveVertices = {};
  for (const [part, boneId] of Object.entries(rigidSleeves)) {
    const indices = regions.flatMap((region, index) => region === part ? [index] : []);
    assert.ok(indices.length > 0); sleeveVertices[part] = indices.length;
    for (const index of indices) assert.deepEqual(rig.mesh.weights[index], [{ boneId, weight: 1 }]);
  }
  for (const index of regions.flatMap((part, i) => part === 'head' ? [i] : [])) {
    assert.ok(rig.mesh.weights[index].every(weight => ['head', 'neck'].includes(weight.boneId)));
  }
  const staffEdges = new Map();
  rig.mesh.triangles.forEach((triangle, index) => {
    if (!['staff', 'leftHand'].includes(triangleRegions[index])) return;
    for (let edge = 0; edge < 3; edge++) {
      const [a, b] = [triangle[edge], triangle[(edge + 1) % 3]].sort((a, b) => a - b);
      const length = Math.hypot(...rig.mesh.vertices[a].map((value, axis) => value - rig.mesh.vertices[b][axis]));
      if (length * rig.provenance.sourcePxPerModelUnit >= 1) staffEdges.set(`${a}:${b}`, { a, b, length });
    }
  });
  assert.ok(staffEdges.size > 0);
  const units = rig.provenance.sourcePxPerModelUnit, [ox, oy] = rig.provenance.originPx;
  const transform = (matrix, point) => [0, 1, 2].map(row => matrix[row] * point[0] + matrix[row + 4] * point[1]
    + matrix[row + 8] * point[2] + matrix[row + 12]);
  const probe = (matrix, [x, y]) => {
    const point = transform(matrix, [(x - ox) / units, (oy - y) / units, .035]);
    return [point[0] * units + ox, oy - point[1] * units];
  };
  const samples = [];
  let maxBootDrift = 0, maxHandStaffDrift = 0, maxStaffEdgeFactorError = 0, maxArmLengthError = 0;
  const expectedArmLengths = [Math.hypot(36, 46), Math.hypot(45, 9)];
  for (const time of [0, .15, .45, .75, 1, 1.06, 1.12, 1.16, 1.26, 1.42, 1.65, 1.95, 2.3, 2.6]) {
    const pose = evaluateRig(rig, { clipId, time });
    assert.ok(pose.vertices.every(point => point.length === 3 && point.every(Number.isFinite)));
    const position = id => pose.bonePositions.find(item => item.id === id).position;
    const armLengths = [['leftUpperArm', 'leftForearm'], ['leftForearm', 'leftHand']].map(([a, b]) =>
      Math.hypot(...position(a).map((value, axis) => value - position(b)[axis])) * units);
    armLengths.forEach((length, index) => {
      maxArmLengthError = Math.max(maxArmLengthError, Math.abs(length - expectedArmLengths[index]));
      close(length, expectedArmLengths[index], 1e-7);
    });
    const bone = id => pose.boneMatrices.find(item => item.id === id).skin;
    const drift = Math.max(...bone('staff').map((value, index) => Math.abs(value - bone('leftHand')[index])));
    maxHandStaffDrift = Math.max(maxHandStaffDrift, drift); assert.ok(drift <= 1e-7);
    for (const index of bootVertices) maxBootDrift = Math.max(maxBootDrift,
      Math.hypot(...pose.vertices[index].map((value, axis) => value - rig.mesh.vertices[index][axis])));
    for (const { a, b, length } of staffEdges.values()) {
      const factor = Math.hypot(...pose.vertices[a].map((value, axis) => value - pose.vertices[b][axis])) / length;
      maxStaffEdgeFactorError = Math.max(maxStaffEdgeFactorError, Math.abs(factor - 1)); assert.ok(Math.abs(factor - 1) <= 1e-7);
    }
    const headStaffDifference = Math.max(...bone('head').map((value, index) => Math.abs(value - bone('staff')[index])));
    samples.push({ time, tipSourcePx: probe(bone('staff'), [75, 82]), handSourcePx: probe(bone('staff'), [77, 242]),
      bodySourcePx: probe(bone('spine'), [224, 224]), armLengthsSourcePx: armLengths, headStaffSkinDifference: headStaffDifference });
  }
  assert.ok(maxBootDrift <= 1e-7); assert.ok(maxHandStaffDrift <= 1e-7); assert.ok(maxStaffEdgeFactorError <= 1e-7);
  const prep = samples.find(item => item.time === 1), strike = samples.find(item => item.time === 1.16), end = samples.at(-1);
  const tipDelta = strike.tipSourcePx.map((value, axis) => value - prep.tipSourcePx[axis]);
  assert.ok(tipDelta[0] > 0 && tipDelta[1] > 0, 'the strike must move forward and downward from the preparation');
  assert.ok(strike.tipSourcePx[0] >= 400 && strike.tipSourcePx[1] >= 470, 'the accepted strike must reach the authored forward ground region');
  assert.ok(strike.headStaffSkinDifference > .01, 'head and staff must remain separate articulated surfaces');
  close(end.tipSourcePx[0], 75, 1e-7); close(end.tipSourcePx[1], 82, 1e-7);
  const returned = evaluateRig(rig, { clipId, time: 2.6 });
  const returnDrift = Math.max(...returned.vertices.map((point, index) => Math.hypot(...point.map((value, axis) => value - rig.mesh.vertices[index][axis]))));
  assert.ok(returnDrift <= 1e-7);
  metrics.newMotion = { clipId, phaseMarkers: clone(DRUID_SLAM_MARKERS), sampleTimes: samples.map(item => item.time), samples,
    staffRigidEdges: staffEdges.size, staffVertices: staffVertices.length, bootVertices: bootVertices.length,
    rigidSleeveVertices: sleeveVertices, counts: { vertices: 3729, triangles: 4680, bones: 19, materials: 1, clips: 2 },
    ownInlineRigExact: true, sourceGapCount: 1, inferredSockets: 3, groundTipGateSourcePx: { xMinimum: 400, yMinimum: 470 },
    maxBootDriftModel: maxBootDrift, maxHandStaffSkinDrift: maxHandStaffDrift, maxStaffEdgeFactorError,
    expectedArmLengthsSourcePx: expectedArmLengths, maxArmLengthErrorSourcePx: maxArmLengthError, bakedArmTranslationsZero: true,
    prepToStrikeTipDeltaSourcePx: tipDelta, finalReturnDriftModel: returnDrift,
    headStaffCommonSkinCompensation: false, fullBackReconstructionClaim: false, visualVerdict: 'NOT_OBSERVED' };
});

test.after(async () => {
  if (!evidenceDir) return;
  await mkdir(evidenceDir, { recursive: true });
  const bytes = await readFile(fixtureUrl);
  metrics.shipping = { fixture: fileURLToPath(fixtureUrl), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
  await writeFile(`${evidenceDir}/targeted-dark-druid-native-slam-metrics.json`, `${JSON.stringify(metrics, null, 2)}\n`);
});
