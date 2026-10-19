import assert from 'node:assert/strict';
import test from 'node:test';
import { createDefaultRigProject, validateRigProject, RigProjectStore, RIG_LIMITS } from '../engine/fdg/rig-project.js';

function invalid(mutate, pattern) {
  const project = createDefaultRigProject(); mutate(project);
  const result = validateRigProject(project);
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), pattern);
  return project;
}
const addBone = (project, id) => project.skeleton.bones.push({ id, name: id, parent: 'root', translation: [0, 0, 0], rotation: [0, 0, 0] });
const changedName = (store, name) => store.change(`이름 ${name}`, project => { project.name = name; });

test('Default rig is an actual closed 3D probe with authored ring weights and two compatible materials', () => {
  const project = createDefaultRigProject(), before = structuredClone(project);
  assert.deepEqual(validateRigProject(project), { ok: true, errors: [] });
  assert.equal(project.rigVersion, 1);
  assert.deepEqual(project.skeleton.bones.map(({ id, parent, translation }) => ({ id, parent, translation })), [
    { id: 'root', parent: null, translation: [0, 0, 0] },
    { id: 'spine', parent: 'root', translation: [0, 1, 0] },
    { id: 'head', parent: 'spine', translation: [0, 1, 0] },
  ]);
  assert.equal(project.mesh.vertices.length, 16);
  assert.equal(project.mesh.triangles.length, 28);
  for (const [ring, [y, width, depth]] of [[0, .5, .4], [1, .55, .4], [2, .45, .35], [3, .35, .3]].entries()) {
    assert.deepEqual(project.mesh.vertices.slice(ring * 4, ring * 4 + 4), [[-width, y, -depth], [width, y, -depth], [width, y, depth], [-width, y, depth]]);
  }
  const ringWeights = [[{ boneId: 'root', weight: 1 }], [{ boneId: 'root', weight: .4 }, { boneId: 'spine', weight: .6 }],
    [{ boneId: 'spine', weight: .6 }, { boneId: 'head', weight: .4 }], [{ boneId: 'head', weight: 1 }]];
  project.mesh.weights.forEach((weights, index) => assert.deepEqual(weights, ringWeights[Math.floor(index / 4)]));
  assert.deepEqual(project.materials.map(({ id, color }) => ({ id, color })), [{ id: 'iron', color: '#91abbf' }, { id: 'ember', color: '#cb6646' }]);
  const edges = new Map(); let signedVolume = 0;
  for (const triangle of project.mesh.triangles) {
    const [a, b, c] = triangle.map(index => project.mesh.vertices[index]);
    const cross = [b[1] * c[2] - b[2] * c[1], b[2] * c[0] - b[0] * c[2], b[0] * c[1] - b[1] * c[0]];
    signedVolume += a.reduce((sum, value, axis) => sum + value * cross[axis], 0) / 6;
    for (let index = 0; index < 3; index += 1) {
      const key = [triangle[index], triangle[(index + 1) % 3]].sort((x, y) => x - y).join(':');
      edges.set(key, (edges.get(key) || 0) + 1);
    }
  }
  assert.ok(signedVolume > 0, 'Outward winding encloses positive volume rather than a flat sprite');
  assert.ok([...edges.values()].every(count => count === 2), 'Every edge has two incident faces, including top and bottom');
  assert.deepEqual(project, before, 'Validation leaves authored data intact');
});

test('Factories isolate bones, vertices, weight influences, keys, materials and preview state', () => {
  const first = createDefaultRigProject(), fresh = createDefaultRigProject();
  first.skeleton.bones[0].translation[0] = 42;
  first.mesh.vertices[0][2] = 42;
  first.mesh.weights[4][0].weight = .8;
  first.clips[0].tracks[0].keys[0].rotation[2] = 42;
  first.materials[0].color = '#000000';
  first.preview.camera.zoom = 2;
  assert.deepEqual(createDefaultRigProject(), fresh);
  assert.equal(first.mesh.weights[5][0].weight, .4, 'Preset influences are separate objects per vertex');
});

test('Default clips retain independent timing and bind-relative translations/rotations', () => {
  const project = createDefaultRigProject(), [sway, bow] = project.clips;
  assert.deepEqual([sway.id, sway.duration, sway.fps, sway.loop], ['sway', 2, 24, true]);
  assert.deepEqual(sway.tracks[0].keys.map(({ time, rotation }) => [time, rotation[2]]), [[0, -.35], [1, .35], [2, -.35]]);
  assert.deepEqual([bow.id, bow.duration, bow.fps, bow.loop], ['bow', 1.5, 30, false]);
  assert.deepEqual(bow.tracks.map(track => track.keys.map(({ time, rotation }) => [time, rotation[0]])), [
    [[0, 0], [.75, .55], [1.5, 0]], [[0, 0], [.75, .2], [1.5, 0]],
  ]);
  assert.ok(project.clips.every(clip => clip.tracks.every(track => track.keys.every(key => key.translation.every(value => value === 0)))));
  assert.deepEqual(project.preview, { materialId: 'iron', clipId: 'sway', time: 0, playing: false, pose: {}, camera: { yaw: -.65, pitch: .32, zoom: 1 } });
});

test('Malformed top-level data and stale rig versions return errors rather than throwing', () => {
  for (const project of [null, [], false, 1, 'rig', {}]) {
    const report = validateRigProject(project);
    assert.equal(report.ok, false);
    assert.ok(Array.isArray(report.errors) && report.errors.length > 0);
  }
  for (const rigVersion of [0, 2, '1', undefined]) invalid(project => { project.rigVersion = rigVersion; }, /rigVersion/);
});

test('Names, IDs and dictionary reservation rules reject empty, oversized or unsafe entries', () => {
  for (const name of ['', '  ', 'x'.repeat(121), 'bad\nname', false]) invalid(project => { project.name = name; }, /name/);
  for (const id of ['__proto__', 'prototype', 'constructor', '', 'x'.repeat(121)]) invalid(project => { project.skeleton.bones[0].id = id; }, /id/);
  const project = createDefaultRigProject(); project.name = '우리 게임 · 리그';
  assert.equal(validateRigProject(project).ok, true);
});

test('IDs must be unique within bones, materials and clips', () => {
  invalid(project => { project.skeleton.bones[1].id = 'root'; }, /중복 ID/);
  invalid(project => { project.materials[1].id = 'iron'; }, /중복 ID/);
  invalid(project => { project.clips[1].id = 'sway'; }, /중복 ID/);
});

test('Out-of-order bones and multiple independent roots are valid acyclic forests', () => {
  const project = createDefaultRigProject(); project.skeleton.bones.reverse();
  project.skeleton.bones.push({ id: 'other_root', name: '다른 루트', parent: null, translation: [2, 0, 0], rotation: [0, 0, 0] });
  assert.equal(validateRigProject(project).ok, true);
});

test('Self parents, longer cycles and dangling parent IDs are rejected', () => {
  invalid(project => { project.skeleton.bones[1].parent = 'spine'; }, /자기 자신|순환/);
  invalid(project => { project.skeleton.bones[0].parent = 'head'; }, /순환/);
  for (const parent of ['missing', undefined, 0, {}]) invalid(project => { project.skeleton.bones[0].parent = parent; }, /parent/);
});

test('Bind, key and manual transforms require finite three-component bounded vectors', () => {
  const malformed = [[0, 0], [0, 0, 0, 0], [NaN, 0, 0], [Infinity, 0, 0], ['0', 0, 0], null, [10001, 0, 0]];
  for (const translation of malformed) invalid(project => { project.skeleton.bones[0].translation = translation; }, /translation/);
  invalid(project => { project.clips[0].tracks[0].keys[0].rotation = [0, 0, RIG_LIMITS.rotation + .1]; }, /rotation/);
  invalid(project => { project.preview.pose.spine = { translation: [0, 0, 0], rotation: [0, NaN, 0] }; }, /rotation/);
  const project = createDefaultRigProject();
  project.skeleton.bones[0].translation = [-10000, 10000, 0];
  project.skeleton.bones[0].rotation = [-RIG_LIMITS.rotation, RIG_LIMITS.rotation, 0];
  assert.equal(validateRigProject(project).ok, true, 'Inclusive authoring bounds are accepted');
});

test('Mesh and every material must bind the same existing skeleton and mesh IDs', () => {
  invalid(project => { project.mesh.skeletonId = 'other'; }, /mesh.skeletonId/);
  invalid(project => { project.materials[0].skeletonId = 'other'; }, /materials\[0\].skeletonId/);
  invalid(project => { project.materials[1].meshId = 'other'; }, /materials\[1\].meshId/);
});

test('Vertex, triangle and corresponding weight arrays reject empty or oversized structures', () => {
  invalid(project => { project.mesh.vertices = []; }, /mesh.vertices/);
  invalid(project => { project.mesh.vertices = Array.from({ length: 4097 }, () => [0, 0, 0]); }, /mesh.vertices.*4096/);
  invalid(project => { project.mesh.triangles = []; }, /mesh.triangles/);
  invalid(project => { project.mesh.triangles = Array.from({ length: 8193 }, () => [0, 1, 2]); }, /mesh.triangles.*8192/);
  invalid(project => { project.mesh.weights.pop(); }, /각 vertex/);
});

test('Triangle topology rejects repeated, fractional, negative and out-of-range vertex indices', () => {
  for (const triangle of [[0, 0, 1], [0, 1, 16], [-1, 1, 2], [0, .5, 2], [0, '1', 2], [0, 1], null]) {
    invalid(project => { project.mesh.triangles[0] = triangle; }, /mesh.triangles\[0\]/);
  }
});

test('Weights require one to four nonzero influences and do not duplicate bone IDs', () => {
  invalid(project => { project.mesh.weights[0] = []; }, /mesh.weights\[0\].*1~4/);
  invalid(project => { project.mesh.weights[0] = Array.from({ length: 5 }, () => ({ boneId: 'root', weight: .2 })); }, /mesh.weights\[0\].*1~4/);
  invalid(project => { project.mesh.weights[0] = [{ boneId: 'root', weight: .5 }, { boneId: 'root', weight: .5 }]; }, /가중치를 중복/);
  invalid(project => { project.mesh.weights[0] = [{ boneId: 'missing', weight: 1 }]; }, /boneId/);
  const project = createDefaultRigProject(); addBone(project, 'aux');
  project.mesh.weights[0] = ['root', 'spine', 'head', 'aux'].map(boneId => ({ boneId, weight: .25 }));
  assert.equal(validateRigProject(project).ok, true);
});

test('Invalid or nonfinite weight values and nonunit totals are rejected', () => {
  for (const weight of [0, -1, 1.01, NaN, Infinity, '1', undefined]) invalid(project => { project.mesh.weights[0][0].weight = weight; }, /weight/);
  invalid(project => { project.mesh.weights[4][0].weight = .5; }, /가중치 합/);
});

test('Weight sum tolerance accepts small authoring roundoff without changing stored weights', () => {
  const project = createDefaultRigProject(); project.mesh.weights[4][0].weight = .3999995;
  const before = structuredClone(project);
  assert.equal(validateRigProject(project).ok, true);
  assert.deepEqual(project, before);
  invalid(project => { project.mesh.weights[4][0].weight = .399998; }, /가중치 합/);
});

test('Materials require full RGB hex colors and retain user-selected compatible variants', () => {
  for (const color of ['#fff', '#ffffffff', 'red', '#gg0000', 0]) invalid(project => { project.materials[0].color = color; }, /color/);
  const project = createDefaultRigProject(); project.materials[0].color = '#ABCDEF'; project.preview.materialId = 'ember';
  assert.equal(validateRigProject(project).ok, true);
});

test('Clip durations and FPS are finite with independent variable rates rather than a 24-key constraint', () => {
  for (const duration of [0, -1, Infinity, NaN, '2']) invalid(project => { project.clips[0].duration = duration; }, /duration/);
  for (const fps of [0, .999, 120.1, NaN, Infinity, '24']) invalid(project => { project.clips[0].fps = fps; }, /fps/);
  const project = createDefaultRigProject(); project.clips[0].fps = 31.25; project.clips[1].fps = 120;
  assert.equal(validateRigProject(project).ok, true);
  assert.equal(project.clips[0].tracks[0].keys.length, 3, 'Three motion keys need not be padded to 24 frames');
});

test('Tracks target existing bones once per clip and require explicit translation and rotation keys', () => {
  invalid(project => { project.clips[0].tracks[0].boneId = 'missing'; }, /boneId/);
  invalid(project => { project.clips[0].tracks.push(structuredClone(project.clips[0].tracks[0])); }, /track을 중복/);
  invalid(project => { delete project.clips[0].tracks[0].keys[0].translation; }, /translation/);
  invalid(project => { delete project.clips[0].tracks[0].keys[0].rotation; }, /rotation/);
});

test('Key time must start at zero, be strictly ascending and stay inside duration', () => {
  invalid(project => { project.clips[0].tracks[0].keys[0].time = .1; }, /첫 key/);
  for (const time of [-1, 0, 2, 2.1, NaN, Infinity, '1']) invalid(project => { project.clips[0].tracks[0].keys[1].time = time; }, /time/);
  invalid(project => { project.clips[0].tracks[0].keys.reverse(); }, /첫 key|증가/);
});

test('Loop tracks end at duration while nonloop clips can hold their last earlier key', () => {
  invalid(project => { project.clips[0].tracks[0].keys.at(-1).time = 1.9; }, /마지막 key.*duration/);
  const project = createDefaultRigProject();
  project.clips[1].tracks.forEach(track => { track.keys.at(-1).time = 1.25; });
  assert.equal(validateRigProject(project).ok, true);
  invalid(project => { project.clips[0].loop = 1; }, /loop/);
});

test('Keys enforce bounds of two through 256 and accept dense nonuniform authored timing', () => {
  invalid(project => { project.clips[0].tracks[0].keys.length = 1; }, /keys.*2~256/);
  invalid(project => { project.clips[0].tracks[0].keys = Array.from({ length: 257 }, (_, i) => ({ time: i / 128, translation: [0, 0, 0], rotation: [0, 0, 0] })); }, /keys.*2~256/);
  const project = createDefaultRigProject();
  project.clips[0].tracks[0].keys = Array.from({ length: 256 }, (_, i) => ({ time: (i / 255) ** 2 * 2, translation: [0, 0, 0], rotation: [0, 0, 0] }));
  assert.equal(validateRigProject(project).ok, true);
});

test('Bone, material, clip and track resource limits reject excess without a large traversal', () => {
  invalid(project => { project.skeleton.bones = Array.from({ length: 65 }, (_, i) => ({ id: `bone_${i}`, name: '본', parent: null, translation: [0, 0, 0], rotation: [0, 0, 0] })); }, /skeleton.bones.*64/);
  invalid(project => { project.materials = Array.from({ length: 65 }, (_, i) => ({ ...project.materials[0], id: `material_${i}` })); }, /materials.*64/);
  invalid(project => { project.clips = Array.from({ length: 33 }, (_, i) => ({ ...project.clips[0], id: `clip_${i}` })); }, /clips.*32/);
  invalid(project => { project.clips[0].tracks = Array.from({ length: 65 }, () => structuredClone(project.clips[0].tracks[0])); }, /tracks.*64/);
  const project = createDefaultRigProject();
  for (let i = 3; i < 64; i += 1) addBone(project, `bone_${i}`);
  project.clips[0].tracks = project.skeleton.bones.map(bone => ({ boneId: bone.id, keys: [
    { time: 0, translation: [0, 0, 0], rotation: [0, 0, 0] },
    { time: 2, translation: [0, 0, 0], rotation: [0, 0, 0] },
  ] }));
  assert.equal(validateRigProject(project).ok, true, '64 existing bones with 64 distinct tracks fit the small authoring contract');
});

test('Preview supports explicit bind pose and rejects dangling selected resources', () => {
  const project = createDefaultRigProject(); project.preview.clipId = null;
  assert.equal(validateRigProject(project).ok, true);
  invalid(project => { project.preview.materialId = 'missing'; }, /preview.materialId/);
  invalid(project => { project.preview.clipId = 'missing'; }, /preview.clipId/);
  invalid(project => { delete project.preview.clipId; }, /preview.clipId/);
  invalid(project => { project.preview.playing = 'false'; }, /preview.playing/);
  for (const time of [-1, NaN, Infinity, '0']) invalid(project => { project.preview.time = time; }, /preview.time/);
});

test('Manual pose offsets target existing bones and are optional per bone, never shorthand transforms', () => {
  const project = createDefaultRigProject();
  project.preview.pose.head = { translation: [0, .2, 0], rotation: [.1, 0, 0] };
  assert.equal(validateRigProject(project).ok, true);
  invalid(project => { project.preview.pose.missing = { translation: [0, 0, 0], rotation: [0, 0, 0] }; }, /기존 bone ID/);
  invalid(project => { project.preview.pose = []; }, /preview.pose/);
  invalid(project => { project.preview.pose.head = [0, 0, 0]; }, /translation\/rotation 객체/);
  invalid(project => { project.preview.pose.head = { rotation: [0, 0, 0] }; }, /translation/);
});

test('Optional camera bounds preserve saved yaw/pitch/zoom and reject malformed or extreme values', () => {
  const project = createDefaultRigProject(); delete project.preview.camera;
  assert.equal(validateRigProject(project).ok, true);
  project.preview.camera = { yaw: Math.PI, pitch: -Math.PI / 3, zoom: .5 };
  assert.equal(validateRigProject(project).ok, true);
  for (const [field, value] of [['yaw', Math.PI + .01], ['pitch', Math.PI / 3 + .01], ['zoom', .49], ['zoom', 2.01], ['yaw', NaN]]) {
    invalid(project => { project.preview.camera[field] = value; }, new RegExp(`camera.${field}`));
  }
  invalid(project => { project.preview.camera = null; }, /preview.camera/);
});

test('UTF-8 file limit uses actual byte count including multibyte authoring notes', () => {
  const project = createDefaultRigProject(); project.notes = '가'.repeat(Math.floor(RIG_LIMITS.fileBytes / 3));
  assert.ok(JSON.stringify(project).length < RIG_LIMITS.fileBytes, 'Character length alone would miss this oversized UTF-8 project');
  assert.equal(validateRigProject(project).ok, false);
  assert.match(validateRigProject(project).errors.join('\n'), /UTF-8 JSON.*2MiB/);
  project.notes = '가'.repeat(2000);
  assert.equal(validateRigProject(project).ok, true);
});

test('Cyclic and non-JSON extension values are rejected before cloning or export can lose them', () => {
  let toJsonCalls = 0;
  for (const value of [undefined, () => {}, Symbol('x'), 1n, new Date(), new Map(), Infinity, { toJSON() { toJsonCalls += 1; return 0; } }]) {
    const project = createDefaultRigProject(); project.extra = value;
    const report = validateRigProject(project);
    assert.equal(report.ok, false);
    assert.match(report.errors.join('\n'), /JSON/);
  }
  assert.equal(toJsonCalls, 0, 'Validation must reject function data before the JSON serializer can execute it');
  const project = createDefaultRigProject(); project.extra = project;
  const report = validateRigProject(project);
  assert.equal(report.ok, false);
  assert.match(report.errors.join('\n'), /JSON/);
  assert.throws(() => new RigProjectStore(project), TypeError);
});

test('Malformed nested records and sparse arrays return errors without throwing', () => {
  for (const [field, value] of [['skeleton', null], ['mesh', []], ['materials', {}], ['clips', false], ['preview', null]]) {
    invalid(project => { project[field] = value; }, new RegExp(field));
  }
  invalid(project => { project.skeleton.bones[0] = null; }, /bones/);
  invalid(project => { project.mesh.weights[0] = [null]; }, /boneId\/weight/);
  invalid(project => { project.clips[0].tracks[0].keys[0] = null; }, /key 객체/);
  invalid(project => { project.mesh.vertices[0] = new Array(3); }, /JSON/);
});

test('Store construction and snapshots isolate the full hierarchy, weights and animation data', () => {
  const project = createDefaultRigProject(), original = structuredClone(project), store = new RigProjectStore(project);
  project.skeleton.bones[0].translation[0] = 4;
  const snapshot = store.project;
  snapshot.mesh.weights[4][0].weight = .1; snapshot.clips[0].tracks[0].keys[0].rotation[2] = 4;
  snapshot.preview.pose.root = { translation: [1, 0, 0], rotation: [0, 0, 0] };
  assert.deepEqual(store.project, original);
  assert.equal(store.canUndo, false);
  assert.equal(store.canRedo, false);
  store.dispose();
});

test('A validated grouped edit produces exactly one undo/redo step', () => {
  const original = createDefaultRigProject(), store = new RigProjectStore(original), events = [];
  store.signals.on('changed', event => events.push(event));
  assert.equal(store.change('본과 가중치 편집', project => {
    addBone(project, 'aux');
    project.mesh.weights[0] = [{ boneId: 'root', weight: .5 }, { boneId: 'aux', weight: .5 }];
    project.preview.pose.aux = { translation: [.1, 0, 0], rotation: [0, 0, .1] };
  }), true);
  const edited = store.project;
  assert.equal(edited.skeleton.bones.length, 4);
  assert.equal(events.length, 1);
  assert.equal(store.undo(), true);
  assert.deepEqual(store.project, original);
  assert.equal(store.undo(), false);
  assert.equal(store.redo(), true);
  assert.deepEqual(store.project, edited);
  assert.deepEqual(events.map(event => event.label), ['본과 가중치 편집', '본과 가중치 편집 취소', '본과 가중치 편집 다시 실행']);
  store.dispose();
});

test('Invalid edits, stale imports and throwing mutations preserve state, redo and emitted history', () => {
  const store = new RigProjectStore(createDefaultRigProject()); let events = 0;
  store.signals.on('changed', () => { events += 1; });
  changedName(store, '편집'); store.undo();
  const before = store.project;
  assert.equal(store.canRedo, true);
  assert.throws(() => store.change('오류', project => { project.mesh.weights[4][0].weight = .9; }), /가중치 합/);
  const stale = structuredClone(before); stale.rigVersion = 0;
  assert.throws(() => store.replace(stale), /rigVersion/);
  assert.throws(() => store.change('중단', project => { project.name = '버려진 편집'; throw new Error('cancelled'); }), /cancelled/);
  assert.deepEqual(store.project, before);
  assert.equal(store.canUndo, false);
  assert.equal(store.canRedo, true);
  assert.equal(events, 2, 'Only the preceding successful edit and undo emitted events');
  assert.equal(store.redo(), true);
  assert.equal(store.project.name, '편집');
  store.dispose();
});

test('No-op change and replace create no history and retain an existing redo branch', () => {
  const store = new RigProjectStore(createDefaultRigProject()); changedName(store, 'edited'); store.undo();
  let events = 0; store.signals.on('changed', () => { events += 1; });
  assert.equal(store.change('동일 값', project => { project.name = project.name; }), false);
  assert.equal(store.replace(store.project), false);
  assert.equal(events, 0);
  assert.equal(store.canUndo, false);
  assert.equal(store.canRedo, true);
  store.dispose();
});

test('A successful edit after undo invalidates only the obsolete redo branch', () => {
  const store = new RigProjectStore(createDefaultRigProject()); changedName(store, 'first'); changedName(store, 'second'); store.undo();
  assert.equal(store.canRedo, true);
  changedName(store, 'branch');
  assert.equal(store.canRedo, false);
  assert.equal(store.redo(), false);
  assert.equal(store.undo(), true);
  assert.equal(store.project.name, 'first');
  store.dispose();
});

test('History keeps the most recent 80 edits and restores retained snapshots in order', () => {
  const store = new RigProjectStore(createDefaultRigProject());
  for (let index = 1; index <= 85; index += 1) changedName(store, `name${index}`);
  for (let index = 0; index < 80; index += 1) assert.equal(store.undo(), true);
  assert.equal(store.project.name, 'name5');
  assert.equal(store.undo(), false);
  for (let index = 0; index < 80; index += 1) assert.equal(store.redo(), true);
  assert.equal(store.project.name, 'name85');
  assert.equal(store.redo(), false);
  store.dispose();
});

test('Changed snapshots cannot mutate the store and unsubscribe/dispose release listeners', () => {
  const store = new RigProjectStore(createDefaultRigProject()); let calls = 0;
  const unsubscribe = store.signals.on('changed', event => { calls += 1; event.project.mesh.vertices[0][0] = 999; });
  changedName(store, 'one');
  assert.equal(store.project.mesh.vertices[0][0], -.5);
  unsubscribe(); changedName(store, 'two');
  assert.equal(calls, 1);
  store.signals.on('changed', () => { calls += 1; });
  store.dispose(); changedName(store, 'three');
  assert.equal(calls, 1);
});

test('JSON export/reopen preserves bone edits, skin weights, material, clip rate and manual pose', () => {
  const project = createDefaultRigProject();
  project.skeleton.bones[1].name = '척추 사용자 편집'; project.skeleton.bones[1].translation[0] = .2;
  project.mesh.weights[4] = [{ boneId: 'root', weight: .25 }, { boneId: 'spine', weight: .75 }];
  project.materials[1].color = '#c08040'; project.clips[1].fps = 60;
  project.preview = { materialId: 'ember', clipId: 'bow', time: .4, playing: false,
    pose: { head: { translation: [0, .1, 0], rotation: [.15, 0, 0] } }, camera: { yaw: .2, pitch: .1, zoom: 1.5 } };
  const imported = JSON.parse(JSON.stringify(project)), store = new RigProjectStore(imported);
  assert.deepEqual(store.project, project);
  assert.deepEqual(validateRigProject(store.project), { ok: true, errors: [] });
  store.dispose();
});
