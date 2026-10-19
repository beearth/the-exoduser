import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { evaluateRig } from '../engine/fdg/rig.js';
import { validateRigProject } from '../engine/fdg/rig-project.js';
import { installDruidSlamNativeBridge } from '../engine/fdg/dark-druid-slam-bridge.js';
import { createDruidThornFanClip, createDruidThornFanObserver,
  DRUID_THORN_FAN_CLIP_ID, DRUID_THORN_FAN_MARKERS } from '../engine/fdg/druid-thorn-pose.js';

const rig = JSON.parse(await readFile(new URL('../tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json', import.meta.url), 'utf8'));
const slamId = 'dark-druid-native-slam-contact-r5';
const nativeSource = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const near = (a, b, tolerance = 1e-12) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const maxDelta = (a, b) => Math.max(...a.flatMap((value, index) => value.map((component, axis) => Math.abs(component - b[index][axis]))));
const actor = (extra = {}) => ({ ib: true, alive: true, _bossPhase: 0, s: 'idle', st2: 0, facing: 0, x: 50, y: 80, r: 44, hp: 300, ...extra });

test('sparse fan clip reuses the original rig; hands/child staff move while boots and arm lengths remain fixed', () => {
  const sourceBefore = JSON.stringify(rig), clip = createDruidThornFanClip(rig);
  const combined = { ...rig, clips: [...rig.clips, clip] };
  assert.equal(validateRigProject(combined).ok, true);
  assert.equal(clip.id, DRUID_THORN_FAN_CLIP_ID);
  assert.deepEqual([clip.duration, clip.fps, clip.loop, clip.tracks.length], [1.6, 24, false, 12]);
  for (const track of clip.tracks) {
    assert.deepEqual(track.keys.map(key => key.time), [0, .55, 1, 1.12, 1.3, 1.6]);
    assert.ok(!['root', 'head', 'staff', 'leftBoot', 'rightBoot'].includes(track.boneId));
    assert.deepEqual(track.keys[0].translation, [0, 0, 0]);
    assert.deepEqual(track.keys.at(-1).rotation, [0, 0, 0]);
  }
  assert.equal(rig.skeleton.bones.find(bone => bone.id === 'staff').parent, 'leftHand');
  const bind = evaluateRig(rig, { clipId: null, time: 0 });
  const bootVertices = rig.mesh.weights.flatMap((weights, index) => weights.every(weight => ['leftBoot', 'rightBoot'].includes(weight.boneId)) ? [index] : []);
  assert.ok(bootVertices.length > 0);
  let maxSurfaceMotion = 0;
  for (const time of [0, .275, .55, .775, 1, 1.06, 1.12, 1.21, 1.3, 1.45, 1.6]) {
    const posed = evaluateRig(combined, { clipId: clip.id, time });
    for (const index of bootVertices) assert.deepEqual(posed.vertices[index], bind.vertices[index]);
    const matrices = new Map(posed.boneMatrices.map(bone => [bone.id, bone]));
    assert.deepEqual(matrices.get('staff').world, matrices.get('leftHand').world);
    const positions = new Map(posed.bonePositions.map(bone => [bone.id, bone.position]));
    for (const [parent, child] of [['leftUpperArm', 'leftForearm'], ['leftForearm', 'leftHand'], ['rightUpperArm', 'rightForearm'], ['rightForearm', 'rightHand']]) {
      const distance = Math.hypot(...positions.get(child).map((value, axis) => value - positions.get(parent)[axis]));
      near(distance, Math.hypot(...rig.skeleton.bones.find(bone => bone.id === child).translation));
    }
    maxSurfaceMotion = Math.max(maxSurfaceMotion, maxDelta(posed.vertices, bind.vertices));
    assert.deepEqual(posed.uvs, rig.mesh.uvs);
    assert.deepEqual(posed.triangles, rig.mesh.triangles);
  }
  assert.ok(maxSurfaceMotion > .1);
  assert.equal(maxDelta(evaluateRig(combined, { clipId: clip.id, time: 1.6 }).vertices, bind.vertices), 0);
  assert.equal(JSON.stringify(rig), sourceBefore);
  assert.throws(() => createDruidThornFanClip({ skeleton: { bones: [] } }), TypeError);
});

test('fan observer reads the actual native wind→recover45→clamp20 timer, pauses and interruptions without actor writes', () => {
  const start = nativeSource.indexOf("case'bossFanWind':");
  const end = nativeSource.indexOf("case'bossChargeWind':", start);
  assert.ok(start >= 0 && end > start);
  const block = nativeSource.slice(start, end);
  const clampBody = nativeSource.match(/if\(e\.ib&&e\.st2>20\)e\.st2=20;/)?.[0];
  assert.ok(clampBody);
  let emitted = 0;
  const ctx = vm.createContext({ _isNormalDruidBoss: () => true, _FDG_DRUID_THORN_FIRST: true,
    G: { stage: 0 }, P: { x: 100, y: 80 }, EL: { P: 0 }, _spawnBossProjectile: () => { emitted += 1; },
    SFX: { magic() {} }, addParts() {} });
  const nativeFan = vm.runInContext(`(e)=>{switch(e.s){${block}}}`, ctx);
  const nativeClamp = vm.runInContext(`(e)=>{${clampBody}}`, ctx);
  const observer = createDruidThornFanObserver(), e = actor({ s: 'bossFanWind', st2: 26, atk: 10, el: 3, col: '#553366' });
  assert.equal(observer.begin(e), true);
  const before = structuredClone(e);
  assert.deepEqual(observer.sample(e), observer.sample(e));
  assert.deepEqual(e, before);
  e.st2 = 13; near(observer.sample(e).time, .5);
  e.st2 = 0; near(observer.sample(e).time, 1);
  nativeFan(e);
  assert.equal(emitted, 12);
  assert.deepEqual([e.s, e.st2], ['recover', 45]);
  const emittedState = structuredClone(e), release = observer.sample(e);
  assert.deepEqual([release.phase, release.time, release.windFrames], ['release', 1, 26]);
  assert.deepEqual(e, emittedState);
  nativeClamp(e); assert.equal(e.st2, 20); near(observer.sample(e).time, 1);
  e.st2 = 16; near(observer.sample(e).time, DRUID_THORN_FAN_MARKERS.releaseEnd);
  e.st2 = 10; near(observer.sample(e).time, DRUID_THORN_FAN_MARKERS.followEnd);
  e.st2 = 0; near(observer.sample(e).time, DRUID_THORN_FAN_MARKERS.recoverEnd);
  e.s = 'idle'; assert.equal(observer.sample(e), null);
  for (const interruption of [{ alive: false }, { stunned: 1 }, { _hitStun: 1 }, { st2: NaN }, { s: 'bossCharge' }]) {
    const interrupted = actor({ s: 'bossFanWind', st2: 22 });
    observer.begin(interrupted); Object.assign(interrupted, interruption);
    const snapshot = structuredClone(interrupted);
    assert.equal(observer.sample(interrupted), null); assert.deepEqual(interrupted, snapshot);
  }
  const backwards = actor({ s: 'bossFanWind', st2: 8 });
  observer.begin(backwards); backwards.s = 'recover'; backwards.st2 = 45; observer.sample(backwards);
  backwards.s = 'bossFanWind'; assert.equal(observer.sample(backwards), null);
  assert.equal(observer.begin(actor({ s: 'bossFanWind', st2: 0 })), false);
});

function harness({ optIn = true, stage = 0, finale = false } = {}) {
  let nativeStarts = 0, fallbackDraws = 0, canvasCount = 0, rasterDraws = 0;
  const rasterContext = { save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {},
    clip() {}, transform() {}, setTransform() {}, fill() {}, drawImage() { rasterDraws += 1; } };
  const canvas = { width: 0, height: 0, getContext: () => rasterContext };
  const mainDraws = [];
  const context = { save() {}, restore() {}, translate() {}, scale() {}, getTransform: () => ({ a: 1, b: 0, c: 0, d: 1 }),
    drawImage(image) { mainDraws.push({ image, revision: image._glVer, composite: this.globalCompositeOperation, alpha: this.globalAlpha }); } };
  const originalStart = function(e, move) { nativeStarts += 1; e.s = move.id === 'fan' ? 'bossFanWind' : 'bossSlamWind'; e.st2 = 22; return 73; };
  const originalDraw = () => { fallbackDraws += 1; return 'native-sprite'; };
  const scope = { _bossStartPattern: originalStart, _drawDruidBoss: originalDraw };
  const bridge = installDruidSlamNativeBridge({ scope, rig, image: { naturalWidth: 355, naturalHeight: 541 },
    getStage: () => stage, isFinale: () => finale, clipId: slamId, thornVolley: optIn,
    canvasFactory: () => { canvasCount += 1; return canvas; } });
  const draw = e => scope._drawDruidBoss(context, e, .8, 0, { dw: 9.3, dh: 14.1 });
  return { scope, bridge, draw, canvas, mainDraws, originalStart, originalDraw,
    stats: () => ({ nativeStarts, fallbackDraws, canvasCount, rasterDraws }) };
}

test('opt-in bridge limits fan to NORMAL0/1, preserves slam, and invalidates both clip/time raster keys with GPU revisions', () => {
  const sourceBefore = JSON.stringify(rig), h = harness(), e = actor();
  assert.equal(h.scope._bossStartPattern(e, { id: 'fan' }), 73);
  assert.equal(h.stats().nativeStarts, 1);
  const nativeAuthority = structuredClone(e);
  assert.equal(h.draw(e), true);
  const first = h.bridge.getRenderSnapshot(e);
  assert.deepEqual([first.rigId, first.clipId, first.time, first.rasterRevision], [rig.id, DRUID_THORN_FAN_CLIP_ID, 0, 1]);
  assert.deepEqual(Object.fromEntries(Object.entries(e).filter(([key]) => key !== '_nameTopOff')), nativeAuthority);
  const firstRasterDraws = h.stats().rasterDraws;
  h.draw(e);
  assert.equal(h.bridge.getRenderSnapshot(e).rasterRevision, 1);
  assert.equal(h.stats().rasterDraws, firstRasterDraws);
  e.st2 = 11; h.draw(e);
  assert.equal(h.bridge.getRenderSnapshot(e).rasterRevision, 2);
  // Equal pose time0 with a different clip must repaint the same owner canvas.
  h.scope._bossStartPattern(e, { id: 'slam' }); h.draw(e);
  const slam = h.bridge.getRenderSnapshot(e);
  assert.deepEqual([slam.clipId, slam.time, slam.rasterRevision], [slamId, 0, 3]);
  e.s = 'bossSlam'; e.st2 = 0; h.draw(e); near(h.bridge.getSnapshot(e).time, 1.16);
  e.s = 'recover'; e.st2 = 40; h.draw(e); near(h.bridge.getSnapshot(e).time, 1.16);
  e.st2 = 0; h.draw(e); near(h.bridge.getSnapshot(e).time, 2.6);
  assert.equal(h.stats().canvasCount, 1);
  assert.deepEqual(h.mainDraws.slice(0, 3).map(value => [value.composite, value.alpha]), [['source-over', .8], ['lighter', .8 * .42], ['lighter', .8 * .42]]);
  for (const configuration of [{ optIn: false }, { optIn: 'true' }, { stage: 1 }, { finale: true }]) {
    const fallback = harness(configuration), other = actor();
    fallback.scope._bossStartPattern(other, { id: 'fan' });
    assert.equal(fallback.draw(other), 'native-sprite'); assert.equal(fallback.bridge.getRenderSnapshot(other), null);
    fallback.bridge.uninstall();
  }
  for (const phase of [0, 1, 2]) {
    const other = actor({ _bossPhase: phase }); h.scope._bossStartPattern(other, { id: 'fan' });
    assert.equal(h.draw(other), phase <= 1 ? true : 'native-sprite');
  }
  const nonBoss = actor({ ib: false }); h.scope._bossStartPattern(nonBoss, { id: 'fan' });
  assert.equal(h.draw(nonBoss), 'native-sprite');
  e.s = 'idle'; assert.equal(h.draw(e), 'native-sprite');
  h.bridge.uninstall();
  assert.equal(h.scope._bossStartPattern, h.originalStart); assert.equal(h.scope._drawDruidBoss, h.originalDraw);
  assert.deepEqual([h.canvas.width, h.canvas.height], [0, 0]);
  assert.equal(JSON.stringify(rig), sourceBefore);
});
