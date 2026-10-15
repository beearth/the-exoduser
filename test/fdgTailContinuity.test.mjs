import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateRig } from '../engine/fdg/rig.js';
import { validateRigProject } from '../engine/fdg/rig-project.js';

const fixture = JSON.parse(fs.readFileSync(new URL('../tools/fdg-studio/fixtures/hell-aberrant-motion.rig.json', import.meta.url), 'utf8'));
const { mesh, provenance } = fixture;
const px = index => mesh.uvs[index].map((value, axis) => Math.round(value * [832, 1248][axis] * 10000) / 10000);
const near = (a, b, epsilon = .0002) => a.every((value, axis) => Math.abs(value - b[axis]) < epsilon);
const indicesAt = point => mesh.uvs.flatMap((_, index) => near(px(index), point) ? [index] : []);
const pose = time => evaluateRig(fixture, { time, clipId: 'tail-swipe-once' });
const phases = [.65, .9, 1.4];
const xyGapPx = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) * 300;

test('visible lower curl and tip keep one tail skin rather than axe or torso fragments', () => {
  for (const point of [[304, 1120], [317.9961, 1120]]) {
    const indices = indicesAt(point);
    assert.ok(indices.length, `source probe ${point} remains present`);
    for (const index of indices) {
      assert.equal(provenance.regions[index], 'tail');
      assert.ok(mesh.weights[index].every(value => value.boneId.startsWith('tail')), 'free tip must not be attached to an occluder');
    }
  }
  const lower = mesh.uvs.flatMap((_, index) => {
    const [x, y] = px(index);
    return x < 400 && y >= 1120 ? [index] : [];
  });
  assert.ok(lower.length > 30);
  assert.ok(lower.every(index => provenance.regions[index] === 'tail'));
});

test('explicit leg cut caps have coincident motion while original leg skin stays fixed', () => {
  const cutCaps = [[568, 1057.998], [576, 1052.9961], [576, 1040], [672, 1040],
    [352, 982.9961], [352, 976], [368, 976], [432, 1040]];
  const bind = pose(0);
  for (const time of phases) {
    const current = pose(time);
    for (const point of cutCaps) {
      const indices = indicesAt(point);
      const tail = indices.find(index => provenance.regions[index] === 'tail');
      const leg = indices.find(index => ['leftLeg', 'rightLeg'].includes(provenance.regions[index]));
      assert.notEqual(tail, undefined, `tail cap ${point}`);
      assert.notEqual(leg, undefined, `leg cap ${point}`);
      assert.ok(xyGapPx(current.vertices[tail], current.vertices[leg]) < 1e-6);
    }
    for (let index = 0; index < mesh.vertices.length; index++) {
      const region = provenance.regions[index];
      if (!['leftLeg', 'rightLeg'].includes(region)) continue;
      assert.ok(near(current.vertices[index], bind.vertices[index], 1e-12));
      const side = region === 'leftLeg' ? 'left' : 'right', y = px(index)[1];
      assert.deepEqual(mesh.weights[index], [{ boneId: `${side}${y > 1000 ? 'Foot' : y > 845 ? 'Knee' : 'Thigh'}`, weight: 1 }]);
    }
  }
  assert.ok(provenance.tailContinuity.seamAnchors.length > 0);
  assert.ok(provenance.tailContinuity.seamAnchors.every(value => ['leftLeg', 'rightLeg'].includes(value.region)));
});

test('local endpoint correction preserves actual middle-to-tip bend and recovery', () => {
  const nearestTail = point => mesh.uvs.reduce((best, _, index) => {
    if (provenance.regions[index] !== 'tail' || !mesh.weights[index].every(value => value.boneId.startsWith('tail'))) return best;
    const d = Math.hypot(px(index)[0] - point[0], px(index)[1] - point[1]);
    return !best || d < best.d ? { index, d } : best;
  }, null).index;
  const selected = [[271, 977], [183, 1052], [318, 1141]].map(nearestTail);
  const bend = evaluation => {
    const [a, b, c] = selected.map(index => evaluation.vertices[index]);
    const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
    return Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]);
  };
  const bind = pose(0), sweep = pose(.9), recovered = pose(1.8);
  assert.ok(Math.abs(bend(sweep) - bend(bind)) > .03, 'relative bend cannot be replaced by whole-image rotation');
  assert.ok(selected.every(index => near(recovered.vertices[index], bind.vertices[index], 1e-12)));
  const proximal = nearestTail([747, 842]);
  assert.ok(xyGapPx(sweep.vertices[proximal], bind.vertices[proximal]) > 10, 'proximal tail still actually sweeps');
  const bindPivot = bind.bonePositions.find(value => value.id === 'tail9').position;
  for (const time of phases) {
    const pivot = pose(time).bonePositions.find(value => value.id === 'tail9').position;
    assert.ok(xyGapPx(pivot, bindPivot) < 1e-6, 'baked distal pivot remains behind the static left leg at authored keys');
  }
});

test('retouch keeps strict UV/skin limits, source-only surface and original authored clip timing', () => {
  assert.deepEqual(validateRigProject(fixture), { ok: true, errors: [] });
  assert.ok(mesh.vertices.length <= 4096 && mesh.triangles.length <= 8192);
  assert.ok(Buffer.byteLength(JSON.stringify(fixture)) < 2 * 1024 * 1024);
  assert.equal(fixture.skeleton.bones.length, 32);
  assert.equal(provenance.sourceImageModified, false);
  assert.equal(provenance.sourceSha256, 'aaeee0c6f5d2e9fdf82d52b2bd17982df5f91863fbe5572e005cf74389377370');
  assert.equal(provenance.tailContinuity.hiddenTextureCreated, false);
  assert.equal(provenance.tailContinuity.geometryBridgeCreated, false);
  assert.match(provenance.sourceGap, /No hidden surface reconstruction/);
  for (let index = 0; index < mesh.triangles.length; index++) {
    if (provenance.triangleRegions[index] === 'tail') assert.equal(mesh.drawOrder[index], -2);
  }
  for (let index = 0; index < mesh.vertices.length; index++) {
    const region = provenance.regions[index];
    if (!['leftArm', 'rightArm'].includes(region)) continue;
    const lower = region === 'leftArm' ? 'leftForearm' : 'rightForearm';
    const t = Math.max(0, Math.min(1, (px(index)[1] - (region === 'leftArm' ? 600 : 522)) / 130));
    const expected = t < .001 ? [{ boneId: region, weight: 1 }] : t > .999 ? [{ boneId: lower, weight: 1 }]
      : [{ boneId: region, weight: 1 - t }, { boneId: lower, weight: t }];
    assert.deepEqual(mesh.weights[index].map(value => value.boneId), expected.map(value => value.boneId));
    assert.ok(mesh.weights[index].every((value, at) => Math.abs(value.weight - expected[at].weight) < 1e-12), 'arm skin remains unchanged; tail is drawn behind it');
  }
  for (const clip of fixture.clips) {
    assert.equal(clip.duration, 3);
    assert.equal(clip.fps, 24);
    assert.equal(clip.tracks.filter(track => track.boneId.startsWith('tail')).length, 16);
    assert.equal(clip.tracks.some(track => /Thigh|Knee|Foot|pelvis/.test(track.boneId)), false);
    for (const track of clip.tracks.filter(value => value.boneId.startsWith('tail'))) {
      const index = Number(track.boneId.slice(4));
      for (const [keyIndex, amplitude, decay] of [[2, .065, 7], [3, -.10, 6]]) {
        const parent = index === 9 ? Array.from({ length: 9 }, (_, i) => amplitude * Math.exp(-i / decay)).reduce((a, b) => a + b, 0) : 0;
        assert.equal(track.keys[keyIndex].rotation[2], amplitude * Math.exp(-index / decay) - parent);
      }
    }
  }
});
