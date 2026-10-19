import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultRigProject, validateRigProject } from '../engine/fdg/rig-project.js';
import { evaluateRig, rigQuaternionFromEuler, rigQuaternionSlerp, RigProjectValidationError } from '../engine/fdg/rig.js';

const vec = (x = 0, y = 0, z = 0) => [x, y, z];
const near = (actual, expected, epsilon = 1e-9) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} should equal ${expected}`);
const nearVec = (actual, expected) => actual.forEach((value, axis) => near(value, expected[axis]));
const bone = (id, parent = null, translation = vec(), rotation = vec()) => ({ id, name: id, parent, translation, rotation });
const key = (time, translation = vec(), rotation = vec()) => ({ time, translation, rotation });
const clip = (id = 'move', keys = [key(0), key(2)], changes = {}) => ({ id, name: id, duration: 2, fps: 24, loop: false, tracks: [{ boneId: 'root', keys }], ...changes });

function fixture(changes = {}) {
  const project = createDefaultRigProject();
  Object.assign(project, { skeleton: { id: 'skeleton', bones: [bone('root'), bone('child', 'root', vec(1))] },
    mesh: { id: 'mesh', skeletonId: 'skeleton', vertices: [vec(2), vec(0, 1, 1), vec(0, 0, 1)],
      triangles: [[0, 1, 2]], weights: Array.from({ length: 3 }, () => [{ boneId: 'child', weight: 1 }]) },
    materials: [{ id: 'material', name: 'Original color', meshId: 'mesh', skeletonId: 'skeleton', color: '#123456' }],
    clips: [clip()], preview: { materialId: 'material', clipId: 'move', time: 0, playing: false, pose: {} }, ...changes });
  assert.deepEqual(validateRigProject(project), { ok: true, errors: [] });
  return project;
}

test('bind-relative LBS preserves mesh coordinates under rotated, translated and unordered bind bones', () => {
  const project = fixture();
  project.skeleton.bones = [bone('child', 'root', vec(2, -1, 3), vec(0.7, -0.2, 0.1)),
    bone('root', null, vec(1, 2, 3), vec(0.3, 0.5, 0.2))];
  project.mesh.weights = project.mesh.vertices.map(() => [{ boneId: 'root', weight: 0.4 }, { boneId: 'child', weight: 0.6 }]);
  const result = evaluateRig(project, { clipId: null });
  result.vertices.forEach((vertex, index) => nearVec(vertex, project.mesh.vertices[index]));
  for (const entry of result.boneMatrices) entry.skin.forEach((value, index) => near(value, index % 5 === 0 ? 1 : 0));
  assert.equal(result.meshId, 'mesh'); assert.equal(result.skeletonId, 'skeleton');
  assert.equal(result.materialId, 'material'); assert.equal(result.color, '#123456');
});

test('parent local translation and rotation move descendants and weighted vertices in actual XYZ', () => {
  const project = fixture();
  const moved = evaluateRig(project, { clipId: null, pose: { root: { translation: vec(2, 3, 4), rotation: vec() } } });
  nearVec(moved.bonePositions.find(value => value.id === 'child').position, vec(3, 3, 4));
  nearVec(moved.vertices[0], vec(4, 3, 4));
  const rotated = evaluateRig(project, { clipId: null, pose: { root: { translation: vec(), rotation: vec(0, 0, Math.PI / 2) } } });
  nearVec(rotated.bonePositions.find(value => value.id === 'child').position, vec(0, 1));
  nearVec(rotated.vertices[0], vec(0, 2));
  const depth = evaluateRig(project, { clipId: null, pose: { root: { translation: vec(), rotation: vec(Math.PI / 2) } } });
  nearVec(depth.vertices[1], vec(0, -1, 1));
});

test('proportional two-bone skin weights deform geometry and normalize permitted rounding', () => {
  const project = fixture();
  project.mesh.weights[0] = [{ boneId: 'root', weight: 0.25 }, { boneId: 'child', weight: 0.75 }];
  const result = evaluateRig(project, { clipId: null, pose: { child: { translation: vec(4), rotation: vec() } } });
  nearVec(result.vertices[0], vec(5));
  project.mesh.weights[0] = [{ boneId: 'root', weight: 0.2500001 }, { boneId: 'child', weight: 0.7500001 }];
  nearVec(evaluateRig(project, { clipId: null }).vertices[0], project.mesh.vertices[0]);
});

test('Euler XYZ and bind-clip-manual quaternion order are explicit', () => {
  const project = fixture();
  project.mesh.vertices[0] = vec(1);
  project.mesh.weights[0] = [{ boneId: 'root', weight: 1 }];
  project.skeleton.bones[0].rotation = vec(Math.PI / 2);
  project.clips[0].tracks[0].keys = [key(0, vec(), vec(0, Math.PI / 2)), key(2, vec(), vec(0, Math.PI / 2))];
  const result = evaluateRig(project, { pose: { root: { translation: vec(), rotation: vec(0, 0, Math.PI / 2) } } });
  nearVec(result.vertices[0], vec(0, 0, 1));
  const xyz = rigQuaternionFromEuler(vec(Math.PI / 2, Math.PI / 2));
  nearVec(xyz.slice(0, 3), [0.5, 0.5, 0.5]); near(xyz[3], 0.5);
});

test('clip rotations cross the shortest arc while variable FPS does not quantize continuous time', () => {
  const project = fixture();
  project.mesh.vertices[0] = vec(1); project.mesh.weights[0] = [{ boneId: 'root', weight: 1 }];
  project.clips[0].tracks[0].keys = [key(0, vec(), vec(0, 0, 170 * Math.PI / 180)), key(2, vec(), vec(0, 0, -170 * Math.PI / 180))];
  nearVec(evaluateRig(project, { time: 1 }).vertices[0], vec(-1));
  project.clips[0].tracks[0].keys = [key(0), key(2, vec(4))];
  project.clips[0].fps = 7;
  nearVec(evaluateRig(project, { time: 0.253 }).vertices[0], vec(1.506));
  project.clips[0].fps = 120;
  nearVec(evaluateRig(project, { time: 0.253 }).vertices[0], vec(1.506));
  const sameRotation = rigQuaternionFromEuler(vec(0, 0, 0.5));
  const antipodal = rigQuaternionSlerp(sameRotation, sameRotation.map(value => -value), 0.5);
  sameRotation.forEach((value, index) => near(antipodal[index], value));
});

test('clip transitions evaluate both source times, blend endpoints and midpoint, then apply manual pose', () => {
  const project = fixture();
  project.mesh.vertices[0] = vec(1); project.mesh.weights[0] = [{ boneId: 'root', weight: 1 }];
  project.clips.push(clip('turn', [key(0, vec(2), vec(0, 0, Math.PI / 2)), key(2, vec(2), vec(0, 0, Math.PI / 2))]));
  const pose = { root: { translation: vec(0, 0, 2), rotation: vec() } };
  const evaluate = amount => evaluateRig(project, { clipId: 'turn', time: 0.8, pose, blend: { fromClipId: 'move', fromTime: 1.1, amount } });
  nearVec(evaluate(0).vertices[0], vec(1, 0, 2));
  nearVec(evaluate(1).vertices[0], vec(2, 1, 2));
  nearVec(evaluate(0.5).vertices[0], vec(1 + Math.SQRT1_2, Math.SQRT1_2, 2));
  nearVec(evaluateRig(project, { clipId: 'turn', time: 1, pose, blend: { fromClipId: null, fromTime: 0, amount: 0 } }).vertices[0], vec(1, 0, 2));
  project.clips[0].tracks[0].keys = [key(0), key(2, vec(4))];
  project.clips[1].tracks[0].keys = [key(0, vec(4)), key(2, vec(8))];
  nearVec(evaluateRig(project, { clipId: 'turn', time: 1.5, blend: { fromClipId: 'move', fromTime: 0.5, amount: 0.5 } }).vertices[0], vec(5));
});

test('loop wraps exact duration and negative time; non-loop clamps time and holds an early last key', () => {
  const project = fixture();
  project.clips[0] = clip('move', [key(0), key(2, vec(4))], { loop: true });
  nearVec(evaluateRig(project, { time: 2 }).vertices[0], vec(2));
  nearVec(evaluateRig(project, { time: 2.5 }).vertices[0], vec(3));
  nearVec(evaluateRig(project, { time: -0.5 }).vertices[0], vec(5));
  project.clips[0] = clip('move', [key(0), key(1, vec(4))]);
  const last = evaluateRig(project, { time: 100 });
  assert.equal(last.time, 2); nearVec(last.vertices[0], vec(6));
  nearVec(evaluateRig(project, { time: 1.5 }).vertices[0], vec(6));
  const first = evaluateRig(project, { time: -5 });
  assert.equal(first.time, 0); nearVec(first.vertices[0], vec(2));
});

test('results are isolated new arrays and bind edits recompute inverse transforms without stale state', () => {
  const project = fixture(), original = structuredClone(project);
  const result = evaluateRig(project, { clipId: null });
  result.vertices[0][0] = 999; result.triangles[0][0] = 2;
  result.bonePositions[0].position[0] = 999; result.localPose[0].translation[0] = 999;
  result.localPose[0].rotationQuaternion[0] = 999;
  for (const field of ['bindWorld', 'inverseBindWorld', 'world', 'skin']) result.boneMatrices[0][field][0] = 999;
  assert.deepEqual(project, original);
  nearVec(evaluateRig(project, { clipId: null }).vertices[0], vec(2));
  project.skeleton.bones[0].translation = vec(7, 8, 9);
  project.skeleton.bones[0].rotation = vec(0.4, 0.5, 0.6);
  const changed = evaluateRig(project, { clipId: null });
  changed.vertices.forEach((vertex, index) => nearVec(vertex, project.mesh.vertices[index]));
  nearVec(changed.bonePositions[0].position, vec(7, 8, 9));
});

test('finite extreme loop duration and time remain finite without modulo addition overflow', () => {
  const project = fixture();
  project.clips[0] = clip('move', [key(0), key(Number.MAX_VALUE, vec(4))], { duration: Number.MAX_VALUE, loop: true });
  const result = evaluateRig(project, { time: Number.MAX_VALUE / 2 });
  assert.equal(result.time, Number.MAX_VALUE / 2);
  nearVec(result.vertices[0], vec(4));
  nearVec(evaluateRig(project, { time: Number.MAX_VALUE }).vertices[0], vec(2));
  for (const vertex of result.vertices) assert.equal(vertex.every(Number.isFinite), true);
});

test('valid bone IDs matching Object prototype methods do not become inherited manual pose', () => {
  const project = fixture();
  project.skeleton.bones[1].id = 'toString';
  for (const weights of project.mesh.weights) weights[0].boneId = 'toString';
  assert.equal(validateRigProject(project).ok, true);
  nearVec(evaluateRig(project, { clipId: null }).vertices[0], vec(2));
  nearVec(evaluateRig(project, { clipId: null, pose: { toString: { translation: vec(4), rotation: vec() } } }).vertices[0], vec(6));
});

test('malformed project, options, quaternions and overflowing manual pose are rejected with copied errors', () => {
  const project = fixture();
  const broken = structuredClone(project); broken.mesh.vertices[0][0] = NaN;
  assert.throws(() => evaluateRig(broken), error => error instanceof RigProjectValidationError && error.errors.length > 0);
  for (const options of [null, [], { time: Infinity }, { time: NaN }, { materialId: 'missing' }, { clipId: 'missing' },
    { pose: null }, { pose: { absent: { translation: vec(), rotation: vec() } } },
    { pose: { root: { translation: vec(NaN), rotation: vec() } } },
    { pose: { root: { translation: vec(1e308), rotation: vec() } } },
    { blend: { fromClipId: 'move', fromTime: 0, amount: -0.1 } },
    { blend: { fromClipId: 'move', fromTime: Infinity, amount: 0.5 } },
    { blend: { fromClipId: 'missing', fromTime: 0, amount: 0.5 } }]) assert.throws(() => evaluateRig(project, options), RigProjectValidationError);
  assert.throws(() => rigQuaternionFromEuler(vec(Infinity)), RigProjectValidationError);
  assert.throws(() => rigQuaternionSlerp([0, 0, 0, 0], [0, 0, 0, 1], 0.5), RigProjectValidationError);
  const errors = ['input']; const error = new RigProjectValidationError(errors); errors[0] = 'changed';
  assert.deepEqual(error.errors, ['input']);
});
