import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { installDruidSlamNativeBridge } from '../engine/fdg/dark-druid-slam-bridge.js';
import { evaluateRig } from '../engine/fdg/rig.js';

const rig = JSON.parse(readFileSync(new URL('../tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json', import.meta.url)));
const idleId = 'dark-druid-slam-contact-idle-r5', slamId = 'dark-druid-native-slam-contact-r5';
const spec = { dw: 9.3, dh: 14.1, glow: '#ffffff' };
const localPose = (id, time) => evaluateRig(rig, { clipId: id, time }).localPose;
const closePose = (actual, expected) => {
  assert.equal(actual.length, expected.length);
  for (let i = 0; i < actual.length; i++) {
    assert.equal(actual[i].id, expected[i].id);
    for (const field of ['translation', 'rotationQuaternion']) {
      for (let axis = 0; axis < actual[i][field].length; axis++) {
        assert.ok(Math.abs(actual[i][field][axis] - expected[i][field][axis]) < 1e-10, `${actual[i].id}.${field}[${axis}]`);
      }
    }
  }
};

function context() {
  return {
    draws: 0, scaleValue: .325, globalAlpha: 1, globalCompositeOperation: 'source-over',
    save() {}, restore() {}, setTransform() {}, transform() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {},
    translate() {}, scale() {}, fill() {}, ellipse() {},
    getTransform() { return { a: this.scaleValue, b: 0, c: 0, d: this.scaleValue, e: 0, f: 0 }; },
    drawImage() { this.draws++; },
  };
}

function harness(t, { smooth = true } = {}) {
  let seconds = .37, starts = 0;
  const state = { ib: true, alive: true, hp: 21017, s: 'idle', st2: 0, x: 2580, y: 2180, r: 44, facing: 0, _bossPhase: 0 };
  const actor = new Proxy(state, { set(target, key, value) {
    assert.equal(key, '_nameTopOff', `bridge must not write native ${String(key)}`); target[key] = value; return true;
  } });
  const rasterContext = context(), canvas = { width: 0, height: 0, getContext: () => rasterContext };
  const output = context(), fallbacks = [];
  const scope = { _btScaleMul: .5, _BOSS_GLOW: false,
    _bossStartPattern(value, move) {
      assert.equal(value, actor); starts++;
      state.s = move.id === 'fan' ? 'bossFanWind' : 'bossSlamWind'; state.st2 = move.id === 'fan' ? 18 : 26;
      return 'native';
    },
    _drawDruidBoss(...args) { fallbacks.push(args); return 'legacy'; },
  };
  const originalStart = scope._bossStartPattern, originalDraw = scope._drawDruidBoss;
  const bridge = installDruidSlamNativeBridge({ scope, rig, image: { naturalWidth: 355, naturalHeight: 541 },
    getStage: () => 0, clipId: slamId, idleClipId: idleId, thornVolley: true, getAnimationTime: () => seconds,
    smoothMotion: smooth, canvasFactory: () => canvas });
  t.after(() => bridge.uninstall());
  return { state, actor, scope, bridge, canvas, rasterContext, output, fallbacks, originalStart, originalDraw,
    draw: () => scope._drawDruidBoss(output, actor, .8, 0, spec),
    clock: value => { seconds = value; }, starts: () => starts };
}

test('opt-in idle consumes continuous native seconds while authored FPS24 and default sampling remain intact', t => {
  const smooth = harness(t), original = harness(t, { smooth: false });
  for (const h of [smooth, original]) { h.clock(.02); h.draw(); }
  assert.equal(smooth.bridge.getRenderSnapshot(smooth.actor).time, .02);
  assert.equal(original.bridge.getRenderSnapshot(original.actor).time, 0);
  const smoothRevision = smooth.canvas._glVer, originalRevision = original.canvas._glVer;
  for (const h of [smooth, original]) { h.clock(.03); h.draw(); }
  assert.equal(smooth.canvas._glVer, smoothRevision + 1);
  assert.equal(original.canvas._glVer, originalRevision);
  assert.equal(smooth.bridge.getRenderSnapshot(smooth.actor).motion.authoredFps, 24);
  assert.equal(rig.clips.find(clip => clip.id === idleId).fps, 24);
  smooth.clock(2.013); smooth.draw(); assert.ok(Math.abs(smooth.bridge.getRenderSnapshot(smooth.actor).time - .013) < 1e-12);
  closePose(smooth.bridge.getDisplayedPose(smooth.actor), localPose(idleId, .013));
});

test('attack entry starts at the actual displayed pose and is exact by wind quarter and native contact', t => {
  const h = harness(t); h.draw(); const idle = h.bridge.getDisplayedPose(h.actor);
  assert.equal(h.scope._bossStartPattern(h.actor, { id: 'slam' }), 'native'); h.draw();
  closePose(h.bridge.getDisplayedPose(h.actor), idle);
  assert.equal(h.bridge.getRenderSnapshot(h.actor).motion.blendAmount, 0);
  h.state.st2 = 22.75; h.clock(.42); h.draw();
  assert.equal(h.bridge.getRenderSnapshot(h.actor).motion.blendAmount, .5);
  h.state.st2 = 19.5; h.clock(.48); h.draw();
  closePose(h.bridge.getDisplayedPose(h.actor), localPose(slamId, .25));
  assert.equal(h.bridge.getRenderSnapshot(h.actor).motion.transition, null);
  h.state.s = 'bossSlam'; h.state.st2 = 8; h.clock(.8); h.draw();
  h.state.s = 'recover'; h.state.st2 = 40; h.clock(.94); h.draw();
  assert.equal(h.bridge.getRenderSnapshot(h.actor).time, 1.16);
  closePose(h.bridge.getDisplayedPose(h.actor), localPose(slamId, 1.16));
  assert.equal(h.starts(), 1);
});

test('recovery returns from the last displayed bones without jumping to the global idle phase', t => {
  const h = harness(t); h.draw(); h.scope._bossStartPattern(h.actor, { id: 'slam' }); h.draw();
  h.state.s = 'bossSlam'; h.state.st2 = 1; h.clock(.9); h.draw();
  h.state.s = 'recover'; h.state.st2 = 1; h.clock(1.2); h.draw();
  const recover = h.bridge.getDisplayedPose(h.actor);
  h.state.s = 'idle'; h.state.st2 = 0; h.draw();
  closePose(h.bridge.getDisplayedPose(h.actor), recover);
  assert.equal(h.bridge.getRenderSnapshot(h.actor).motion.transition, 'return');
  h.clock(1.26); h.draw(); assert.ok(Math.abs(h.bridge.getRenderSnapshot(h.actor).motion.blendAmount - .5) < 1e-12);
  h.clock(1.320001); h.draw();
  closePose(h.bridge.getDisplayedPose(h.actor), localPose(idleId, 1.320001));
  assert.equal(h.bridge.getRenderSnapshot(h.actor).motion.transition, null);
});

test('interrupting a transition or restarting a clip continues from the actually blended pose', t => {
  const h = harness(t); h.draw(); h.scope._bossStartPattern(h.actor, { id: 'fan' }); h.draw();
  h.state.st2 = 15.75; h.clock(.41); h.draw();
  const displayed = h.bridge.getDisplayedPose(h.actor);
  h.scope._bossStartPattern(h.actor, { id: 'slam' }); h.draw();
  closePose(h.bridge.getDisplayedPose(h.actor), displayed);
  h.state.st2 = 22.75; h.clock(.46); h.draw();
  const inFlight = h.bridge.getDisplayedPose(h.actor);
  h.scope._bossStartPattern(h.actor, { id: 'slam' }); h.draw();
  closePose(h.bridge.getDisplayedPose(h.actor), inFlight);
  assert.equal(h.starts(), 3);
});

test('paused bones reuse their raster through camera changes within one resolution bucket', t => {
  const h = harness(t); h.clock(.625); h.draw();
  const before = h.bridge.getRenderSnapshot(h.actor), draws = h.rasterContext.draws;
  assert.equal(before.motion.rasterScale, .75);
  for (const scale of [.326, .330, .345]) { h.output.scaleValue = scale; h.draw(); }
  assert.equal(h.canvas._glVer, before.rasterRevision); assert.equal(h.rasterContext.draws, draws);
  h.output.scaleValue = .376; h.draw();
  assert.equal(h.canvas._glVer, before.rasterRevision + 1);
  assert.equal(h.bridge.getRenderSnapshot(h.actor).motion.rasterScale, .875);
  const pose = h.bridge.getDisplayedPose(h.actor); pose[0].translation[0] = 100;
  assert.notEqual(h.bridge.getDisplayedPose(h.actor)[0].translation[0], 100);
});

test('native interruption and invalid idle clocks clear smoothing state and retain original fallback', t => {
  const h = harness(t); h.draw(); h.scope._bossStartPattern(h.actor, { id: 'slam' }); h.draw();
  h.state.s = 'eWalk'; assert.equal(h.draw(), 'legacy'); assert.equal(h.bridge.getDisplayedPose(h.actor), null);
  h.state.s = 'idle'; h.clock(-1); assert.equal(h.draw(), 'legacy');
  h.clock(.5); h.draw(); closePose(h.bridge.getDisplayedPose(h.actor), localPose(idleId, .5));
  h.clock(.1); h.draw(); closePose(h.bridge.getDisplayedPose(h.actor), localPose(idleId, .1));
  h.bridge.uninstall(); assert.equal(h.scope._bossStartPattern, h.originalStart); assert.equal(h.scope._drawDruidBoss, h.originalDraw);
  assert.equal(h.bridge.getDisplayedPose(h.actor), null);
  assert.equal(h.canvas.width, 0); assert.equal(h.canvas.height, 0);
});

test('near-vertical facing noise keeps the displayed side until a real direction crosses the dead zone', t => {
  const h = harness(t); h.draw(); assert.equal(h.bridge.getRenderSnapshot(h.actor).facing, 1);
  h.state.facing = Math.PI / 2 + .0001; h.draw();
  assert.equal(h.bridge.getRenderSnapshot(h.actor).facing, 1);
  h.state.facing = Math.acos(-.11); h.draw();
  assert.equal(h.bridge.getRenderSnapshot(h.actor).facing, -1);
  h.state.facing = Math.acos(.01); h.draw();
  assert.equal(h.bridge.getRenderSnapshot(h.actor).facing, -1);
  h.state.facing = Math.acos(.11); h.draw();
  assert.equal(h.bridge.getRenderSnapshot(h.actor).facing, 1);
  assert.equal(h.state.facing, Math.acos(.11));
});
