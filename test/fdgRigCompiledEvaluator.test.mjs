import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createDefaultRigProject } from '../engine/fdg/rig-project.js';
import { createDruidThornFanClip } from '../engine/fdg/druid-thorn-pose.js';
import {
  compileRigEvaluator, evaluateRig, RigProjectValidationError, RIG_POSE_QUATERNION_TOLERANCE,
} from '../engine/fdg/rig.js';

const idleId = 'dark-druid-slam-contact-idle-r5';
const slamId = 'dark-druid-native-slam-contact-r5';
const fanId = 'dark-druid-native-thorn-fan-first';
const manual = { spine: { translation: [.03, -.02, .01], rotation: [.07, -.03, .12] } };
function actualRig() {
  const rig = JSON.parse(readFileSync(new URL('../tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json', import.meta.url), 'utf8'));
  rig.clips.push(createDruidThornFanClip(rig));
  return rig;
}
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const near = (actual, expected, epsilon = 1e-12) => {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
};
const nearTree = (actual, expected) => {
  if (typeof expected === 'number') return near(actual, expected);
  if (Array.isArray(expected)) {
    assert.equal(actual.length, expected.length);
    return expected.forEach((value, index) => nearTree(actual[index], value));
  }
  if (expected && typeof expected === 'object') {
    assert.deepEqual(Object.keys(actual), Object.keys(expected));
    return Object.entries(expected).forEach(([key, value]) => nearTree(actual[key], value));
  }
  assert.equal(actual, expected);
};
const freezeTree = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeTree);
    Object.freeze(value);
  }
  return value;
};

// Frozen before-change evaluation hashes: full output, including matrices/UV/texture/localPose.
const goldens = [
  [{ clipId: null, time: -3 }, '5d6493a4856cd93bb0d6479eef09b8c5d035a768ee5a993ad6b3f8449f1423c7'],
  [{ clipId: idleId, time: .491 }, '4ffdc0c781ff37fd6b7099a0f9ea0b606acd86c19c7fc640b439f9e14cb5ccee'],
  [{ clipId: slamId, time: 1.09 }, '7b63b33b13e4cf99f950c199cb01b5dcb1c80d52d9e3780b2499d81677cc0bc7'],
  [{ clipId: slamId, time: 1.16 }, '8d902ac83097853564cf019c1730dd79c73f56ee716cb62c020c3b5b1f99a4cd'],
  [{ clipId: fanId, time: 1.12 }, '77271fb8e8defbed0511bad2661484c940f23496817f101138a4d99c173345b1'],
  [{ clipId: fanId, time: 1.04, pose: manual, blend: { fromClipId: idleId, fromTime: .73, amount: .31 } },
    '35868d1fa0de0ab8d4b381b6042160e9396d24fceedabc12c7dda3a7a113fe7d'],
];

test('compiled and per-call evaluators preserve frozen actual r5 bind/idle/slam/fan math', () => {
  const project = freezeTree(actualRig());
  const compiled = compileRigEvaluator(project);
  assert.ok(Object.isFrozen(compiled));
  for (const [options, expected] of goldens) {
    const output = compiled.evaluate(options);
    assert.deepEqual(output, evaluateRig(project, options));
    assert.equal(digest(output), expected);
    assert.equal(output.vertices.length, 3729);
    assert.equal(output.triangles.length, 4680);
    assert.equal(output.localPose.length, 19);
  }
  for (const clipId of [idleId, slamId, fanId]) {
    for (const time of [-.21, 0, .123456789, 1.073, 2.6, 8]) {
      assert.deepEqual(compiled.evaluate({ clipId, time }), evaluateRig(project, { clipId, time }));
    }
  }
});

test('compiled ownership isolates later project and every returned geometry/pose mutation', () => {
  const project = actualRig(), compiled = compileRigEvaluator(project);
  const options = { clipId: slamId, time: 1.16, pose: manual };
  const expected = compiled.evaluate(options), returned = compiled.evaluate(options);
  project.mesh.vertices[0][0] += 15;
  project.mesh.triangles[0][0] += 1;
  project.mesh.uvs[0][0] = .55;
  project.mesh.drawOrder[0] += 1;
  project.mesh.faceColors[0] = '#123456';
  project.mesh.weights[0][0].weight = .1;
  project.skeleton.bones[0].translation[0] = 50;
  project.clips[0].tracks[0].keys[0].translation[0] = 50;
  project.materials[0].texture.width = 10;
  project.materials[0].texture.src = 'changed.png';
  project.materials[0].color = '#654321';
  project.preview.time = 99;
  returned.vertices[0][0] = 123;
  returned.triangles[0][0] = 123;
  returned.uvs[0][0] = 123;
  returned.drawOrder[0] = 123;
  returned.faceColors[0] = '#abcdef';
  returned.texture.width = 123;
  returned.bonePositions[0].position[0] = 123;
  for (const key of ['bindWorld', 'inverseBindWorld', 'world', 'skin']) returned.boneMatrices[0][key][0] = 123;
  returned.localPose[0].translation[0] = 123;
  returned.localPose[0].rotationQuaternion[0] = 123;
  assert.deepEqual(compiled.evaluate(options), expected);
  assert.throws(() => evaluateRig(project, options), RigProjectValidationError);
  assert.throws(() => compileRigEvaluator(project), RigProjectValidationError);
  assert.throws(() => { compiled.evaluate = () => null; }, TypeError);
  const valid = createDefaultRigProject();
  evaluateRig(valid);
  valid.mesh.vertices[0][0] = NaN;
  assert.throws(() => evaluateRig(valid), RigProjectValidationError); // validation still happens each call
});

test('paused calls are deterministic, return independent arrays and preserve snapshot/options inputs', () => {
  const compiled = compileRigEvaluator(actualRig());
  const source = compiled.evaluate({ clipId: fanId, time: 1.19, pose: manual });
  const options = freezeTree({ clipId: slamId, time: 1.081234567, pose: manual,
    blend: { fromPose: source.localPose, amount: .37 } });
  const before = structuredClone(options), first = compiled.evaluate(options);
  for (let repeat = 0; repeat < 6; repeat++) {
    const value = compiled.evaluate(options);
    assert.deepEqual(value, first);
    assert.notEqual(value.vertices, first.vertices);
    assert.notEqual(value.vertices[0], first.vertices[0]);
    assert.notEqual(value.localPose[0].rotationQuaternion, first.localPose[0].rotationQuaternion);
    assert.notEqual(value.boneMatrices[0].inverseBindWorld, first.boneMatrices[0].inverseBindWorld);
  }
  assert.deepEqual(options, before);
  nearTree(first, evaluateRig(actualRig(), options));
});

function oneBoneRig() {
  const project = createDefaultRigProject();
  project.skeleton = { id: 'skeleton', bones: [{ id: 'root', name: 'root', parent: null, translation: [0, 0, 0], rotation: [0, 0, 0] }] };
  project.mesh = { id: 'mesh', skeletonId: 'skeleton', vertices: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    triangles: [[0, 1, 2]], weights: Array.from({ length: 3 }, () => [{ boneId: 'root', weight: 1 }]) };
  project.materials = [{ id: 'material', name: 'material', meshId: 'mesh', skeletonId: 'skeleton', color: '#123456' }];
  project.clips = [{ id: 'turn', name: 'turn', duration: 2, fps: 24, loop: false,
    tracks: [{ boneId: 'root', keys: [0, 2].map(time => ({ time, translation: [2, 0, 0], rotation: [0, 0, Math.PI / 2] })) }] }];
  project.preview = { materialId: 'material', clipId: null, time: 0, playing: false, pose: {} };
  return project;
}

test('fromPose endpoints, intermediate slerp and in-flight interruption apply source manual exactly once', () => {
  const project = oneBoneRig(), compiled = compileRigEvaluator(project);
  const source = compiled.evaluate({ clipId: null, pose: { root: { translation: [1, 0, 0], rotation: [0, 0, 0] } } });
  const targetPose = { root: { translation: [0, 0, 1], rotation: [0, 0, Math.PI / 2] } };
  const target = compiled.evaluate({ clipId: 'turn', time: .7, pose: targetPose });
  const values = [0, .5, 1].map(amount => {
    const options = { clipId: 'turn', time: .7, pose: targetPose, blend: { fromPose: source.localPose, amount } };
    const value = compiled.evaluate(options);
    assert.deepEqual(value, evaluateRig(project, options));
    return value;
  });
  nearTree(values[0].vertices, source.vertices);
  nearTree(values[1].vertices[0], [1.5, 1, .5]);
  nearTree(values[1].localPose[0].translation, [1.5, 0, .5]);
  nearTree(values[1].localPose[0].rotationQuaternion, [0, 0, Math.SQRT1_2, Math.SQRT1_2]);
  nearTree(values[2].vertices, target.vertices);
  const interruptPose = { root: { translation: [-1, 0, 0], rotation: [0, 0, -Math.PI / 2] } };
  const interrupted = amount => compiled.evaluate({ clipId: null, pose: interruptPose,
    blend: { fromPose: values[1].localPose, amount } });
  nearTree(interrupted(0).vertices, values[1].vertices);
  nearTree(interrupted(.5).vertices[0], [1.25, 0, .25]);
  nearTree(interrupted(1).vertices[0], [-1, -1, 0]);
  // Historical clip variant keeps manual-after-blend semantics instead of interpreting a snapshot.
  nearTree(compiled.evaluate({ clipId: 'turn', pose: targetPose,
    blend: { fromClipId: null, fromTime: 0, amount: 0 } }).vertices[0], [0, 1, 1]);
});

test('snapshot variants require exactly every bounded bone/unit quaternion and reject ambiguous options', () => {
  const project = createDefaultRigProject(), compiled = compileRigEvaluator(project);
  const valid = compiled.evaluate({ clipId: null }).localPose;
  assert.equal(RIG_POSE_QUATERNION_TOLERANCE, 1e-6);
  const options = fromPose => ({ clipId: null, blend: { fromPose, amount: .5 } });
  assert.deepEqual(compiled.evaluate(options([...valid].reverse())), evaluateRig(project, options(valid)));
  const mutated = edit => { const pose = structuredClone(valid); edit(pose); return pose; };
  const invalid = [null, {}, [], valid.slice(1), Array(valid.length),
    mutated(pose => { pose[1].id = pose[0].id; }),
    mutated(pose => { pose[0].id = 'missing'; }),
    mutated(pose => { pose[0] = null; }),
    ...[[0, 0], [0, 0, 10000.001], [NaN, 0, 0], [Infinity, 0, 0], Array(3)].map(translation =>
      mutated(pose => { pose[0].translation = translation; })),
    ...[[0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 2], [0, 0, 0, 1.000002], [NaN, 0, 0, 1],
      [Infinity, 0, 0, 1], Array(4)].map(rotationQuaternion => mutated(pose => { pose[0].rotationQuaternion = rotationQuaternion; }))];
  for (const fromPose of invalid) {
    assert.throws(() => compiled.evaluate(options(fromPose)), RigProjectValidationError);
    assert.throws(() => evaluateRig(project, options(fromPose)), RigProjectValidationError);
  }
  for (const amount of [NaN, Infinity, -1, 1.001, '0.5', undefined]) {
    assert.throws(() => compiled.evaluate({ blend: { fromPose: valid, amount } }), RigProjectValidationError);
  }
  for (const extra of [{ fromClipId: null }, { fromTime: 0 }, { fromClipId: undefined, fromTime: undefined }]) {
    const value = { blend: { fromPose: valid, amount: 0, ...extra } };
    assert.throws(() => compiled.evaluate(value), RigProjectValidationError);
    assert.throws(() => evaluateRig(project, value), RigProjectValidationError);
  }
  for (const value of [null, [], { time: Infinity }, { clipId: 'missing' }, { materialId: 'missing' },
    { pose: { missing: { translation: [0, 0, 0], rotation: [0, 0, 0] } } },
    { pose: { root: { translation: [0, 0, 0], rotation: [0, 0, 1000] } } }]) {
    assert.throws(() => compiled.evaluate(value), RigProjectValidationError);
  }
  const withinTolerance = structuredClone(valid);
  withinTolerance[0].rotationQuaternion = [0, 0, 0, 1.0000005];
  assert.ok(compiled.evaluate(options(withinTolerance)).vertices.every(vertex => vertex.every(Number.isFinite)));
});
