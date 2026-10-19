import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultProject } from '../engine/fdg/catalog.js';
import { LIMITS, ProjectStore, validateProject } from '../engine/fdg/project.js';
import { createDefaultRigProject, RIG_LIMITS } from '../engine/fdg/rig-project.js';
import { createRigScene, validateRigScene, RIG_SCENE_LIMITS, RIG_SCENE_VERSION } from '../engine/fdg/rig-scene-project.js';

const copy = value => structuredClone(value);
const scene = () => createRigScene(createDefaultRigProject(), { position: [4020, 7460, 0] });
const project = () => ({ ...createDefaultProject(), rigScene: scene() });
const emptyScene = () => ({ version: 1, resources: [], nodes: [], camera: { x: 0, y: 0, follow: false, yaw: -.65, pitch: .32 } });
const expectInvalid = (value, pattern) => {
  const result = validateRigScene(value);
  assert.equal(result.ok, false);
  assert.ok(result.errors.length);
  if (pattern) assert.match(result.errors.join('\n'), pattern);
};

test('factory deep-copies the supplied authored rig and its manual pose without generating a new mesh', () => {
  const rig = createDefaultRigProject();
  rig.preview.materialId = 'ember'; rig.preview.clipId = null; rig.preview.time = 1.25;
  rig.preview.pose.spine = { translation: [0, .2, 0], rotation: [.1, 0, 0] };
  const position = [50, 80, -4];
  const result = createRigScene(rig, { position, resourceId: 'source', nodeId: 'consumer', name: '독립 시험체' });
  assert.equal(result.version, RIG_SCENE_VERSION);
  assert.equal(validateRigScene(result).ok, true);
  assert.deepEqual(result.resources[0], { id: 'source', name: rig.name, project: rig });
  assert.deepEqual(result.nodes[0], { id: 'consumer', name: '독립 시험체', resourceId: 'source', position, scale: 48, visible: true, materialId: 'ember', clipId: null, time: 1.25 });
  assert.deepEqual(result.camera, { x: 50, y: 80, follow: false, yaw: -.65, pitch: .32 });
  assert.equal(Object.hasOwn(result.nodes[0], 'transition'), false);
  result.resources[0].project.mesh.vertices[0][0] = 9;
  result.resources[0].project.preview.pose.spine.translation[1] = 9;
  result.nodes[0].position[0] = 9;
  assert.equal(rig.mesh.vertices[0][0], -.5);
  assert.equal(rig.preview.pose.spine.translation[1], .2);
  assert.equal(position[0], 50);
});

test('factory defaults use stable IDs and independent calls have no shared mutable state', () => {
  const rig = createDefaultRigProject(), first = createRigScene(rig), second = createRigScene(rig);
  assert.equal(first.resources[0].id, 'rig_probe');
  assert.equal(first.nodes[0].id, 'rig_node_probe');
  assert.deepEqual(first.nodes[0].position, [0, 0, 0]);
  first.resources[0].project.clips[0].tracks[0].keys[0].rotation[2] = 0;
  assert.equal(second.resources[0].project.clips[0].tracks[0].keys[0].rotation[2], -.35);
});

test('empty render-only scene and projects with no rigScene remain valid', () => {
  assert.deepEqual(validateRigScene(emptyScene()), { ok: true, errors: [] });
  const legacy = createDefaultProject();
  assert.equal(Object.hasOwn(legacy, 'rigScene'), false);
  assert.equal(validateProject(legacy, { geometry: false }).ok, true);
  legacy.rigScene = emptyScene();
  assert.equal(validateProject(legacy, { geometry: false }).ok, true);
});

test('malformed scene containers return diagnostic errors rather than throwing', () => {
  for (const value of [null, false, 1, [], {}, { ...emptyScene(), resources: {} }, { ...emptyScene(), nodes: null }, { ...emptyScene(), camera: [] }]) {
    assert.doesNotThrow(() => expectInvalid(value));
  }
});

test('scene versions are exact and stale versions cannot be imported', () => {
  for (const version of [0, 2, '1']) expectInvalid({ ...emptyScene(), version }, /version/);
  const candidate = project(); candidate.rigScene.version = 2;
  assert.equal(validateProject(candidate, { geometry: false }).ok, false);
});

test('resource and node IDs are unique within their groups and may share IDs across groups', () => {
  const candidate = scene();
  candidate.resources[0].id = 'toString'; candidate.nodes[0].id = 'toString'; candidate.nodes[0].resourceId = 'toString';
  assert.equal(validateRigScene(candidate).ok, true);
  const duplicateResource = copy(candidate); duplicateResource.resources.push(copy(candidate.resources[0]));
  expectInvalid(duplicateResource, /resources\[1\]\.id.*중복/);
  const duplicateNode = copy(candidate); duplicateNode.nodes.push(copy(candidate.nodes[0]));
  expectInvalid(duplicateNode, /nodes\[1\]\.id.*중복/);
});

test('IDs reject reserved keys, controls, whitespace and lengths above 120 while names reject controls', () => {
  for (const id of ['__proto__', 'prototype', 'constructor', 'bad\nkey', 'bad\x7fkey', ' ', '', 'x'.repeat(121)]) {
    const candidate = scene(); candidate.nodes[0].id = id;
    expectInvalid(candidate, /nodes\[0\]\.id/);
    candidate.nodes[0].id = 'valid'; candidate.resources[0].id = id;
    expectInvalid(candidate, /resources\[0\]\.id/);
  }
  const candidate = scene(); candidate.nodes[0].id = 'x'.repeat(120); candidate.nodes[0].name = '한'.repeat(120);
  assert.equal(validateRigScene(candidate).ok, true);
  candidate.resources[0].name = 'bad\tname'; expectInvalid(candidate, /resources\[0\]\.name/);
});

test('resource and node limits accept 8/32 and reject 9/33', () => {
  const candidate = scene(), resource = candidate.resources[0], node = candidate.nodes[0];
  candidate.resources = Array.from({ length: RIG_SCENE_LIMITS.resources }, (_, index) => ({ ...copy(resource), id: `rig_${index}` }));
  candidate.nodes = Array.from({ length: RIG_SCENE_LIMITS.nodes }, (_, index) => ({ ...copy(node), id: `node_${index}`, resourceId: `rig_${index % 8}` }));
  assert.equal(validateRigScene(candidate).ok, true);
  const resources = copy(candidate); resources.resources.push({ ...copy(resource), id: 'overflow' });
  expectInvalid(resources, /resources.*0~8/);
  const nodes = copy(candidate); nodes.nodes.push({ ...copy(candidate.nodes[0]), id: 'overflow' });
  expectInvalid(nodes, /nodes.*0~32/);
});

test('embedded rigs are validated for actual bone hierarchy and material compatibility', () => {
  const cycle = scene(); cycle.resources[0].project.skeleton.bones[0].parent = 'head';
  expectInvalid(cycle, /resources\[0\]\.project.*순환/);
  const material = scene(); material.resources[0].project.materials[0].meshId = 'other_mesh';
  expectInvalid(material, /resources\[0\]\.project.*meshId/);
});

test('embedded rig file limit remains 2MiB independently of the general project limit', () => {
  const candidate = scene(); candidate.resources[0].project.notes = 'x'.repeat(RIG_LIMITS.fileBytes);
  expectInvalid(candidate, /2MiB/);
});

test('nodes require an existing validated resource and its own compatible material and clip', () => {
  for (const [key, value] of [['resourceId', 'missing'], ['materialId', 'missing'], ['clipId', 'missing']]) {
    const candidate = scene(); candidate.nodes[0][key] = value; expectInvalid(candidate, new RegExp(key));
  }
  const candidate = scene();
  const other = copy(candidate.resources[0]); other.id = 'other'; other.project.materials[0].id = 'other_iron'; other.project.preview.materialId = 'other_iron';
  other.project.clips[0].id = 'other_sway'; other.project.preview.clipId = 'other_sway'; candidate.resources.push(other);
  candidate.nodes[0].resourceId = 'other'; expectInvalid(candidate, /materialId|clipId/);
  candidate.nodes[0].materialId = 'other_iron'; candidate.nodes[0].clipId = 'other_sway';
  assert.equal(validateRigScene(candidate).ok, true);
});

test('bind-pose null clip is valid but omitted or malformed clip IDs are rejected', () => {
  const candidate = scene(); candidate.nodes[0].clipId = null;
  assert.equal(validateRigScene(candidate).ok, true);
  for (const clipId of ['', 0, false]) { candidate.nodes[0].clipId = clipId; expectInvalid(candidate, /clipId/); }
  delete candidate.nodes[0].clipId; expectInvalid(candidate);
});

test('node position is world pixels with inclusive XY 0..8000 and signed Z bounds', () => {
  const candidate = scene(); candidate.nodes[0].position = [0, 8000, -8000];
  assert.equal(validateRigScene(candidate).ok, true);
  candidate.nodes[0].position = [8000, 0, 8000]; assert.equal(validateRigScene(candidate).ok, true);
  for (const position of [[-1, 0, 0], [0, 8000.01, 0], [0, 0, -8000.01], [0, 0], [0, 0, 0, 0], { x: 0, y: 0, z: 0 }, [0, NaN, 0]]) {
    candidate.nodes[0].position = position; expectInvalid(candidate);
  }
});

test('node scale, visibility and nonnegative time use finite numeric contracts', () => {
  const candidate = scene();
  for (const scale of [1, 128]) { candidate.nodes[0].scale = scale; assert.equal(validateRigScene(candidate).ok, true); }
  for (const [key, value] of [['scale', .999], ['scale', 128.01], ['visible', 0], ['time', -.01], ['time', Infinity], ['scale', '48']]) {
    const bad = scene(); bad.nodes[0][key] = value; expectInvalid(bad);
  }
  candidate.nodes[0].time = Number.MAX_VALUE; candidate.nodes[0].visible = false;
  assert.equal(validateRigScene(candidate).ok, true);
});

test('camera persists bounded world coordinates, follow state and view angles', () => {
  const candidate = scene(); candidate.camera = { x: 0, y: 8000, follow: true, yaw: -Math.PI, pitch: Math.PI / 3 };
  assert.equal(validateRigScene(candidate).ok, true);
  for (const [key, value] of [['x', -.01], ['y', 8000.01], ['follow', 'false'], ['yaw', Math.PI + .01], ['pitch', -Math.PI / 3 - .01]]) {
    const bad = scene(); bad.camera[key] = value; expectInvalid(bad, new RegExp(`camera.${key}`));
  }
});

test('transitions can be absent, null, clip-to-clip or bind-to-clip and retain endpoint time', () => {
  const candidate = scene(); assert.equal(validateRigScene(candidate).ok, true);
  candidate.nodes[0].transition = null; assert.equal(validateRigScene(candidate).ok, true);
  for (const fromClipId of [null, 'bow']) {
    candidate.nodes[0].transition = { fromClipId, fromTime: .8, duration: 10, elapsed: 10 };
    assert.equal(validateRigScene(candidate).ok, true);
  }
  candidate.nodes[0].clipId = null;
  assert.equal(validateRigScene(candidate).ok, true);
});

test('transition source clip is checked against the node resource rather than another rig', () => {
  const candidate = scene();
  candidate.nodes[0].transition = { fromClipId: 'missing', fromTime: 0, duration: .25, elapsed: .125 };
  expectInvalid(candidate, /transition.fromClipId/);
  candidate.nodes[0].transition.fromClipId = '__proto__'; expectInvalid(candidate, /transition.fromClipId/);
});

test('transition times reject malformed values, nonpositive duration and elapsed beyond duration', () => {
  for (const [key, value] of [['fromTime', -.1], ['duration', 0], ['duration', -.1], ['duration', 10.001], ['duration', Infinity], ['elapsed', -.1], ['elapsed', .251]]) {
    const candidate = scene(); candidate.nodes[0].transition = { fromClipId: 'sway', fromTime: 0, duration: .25, elapsed: .125 };
    candidate.nodes[0].transition[key] = value; expectInvalid(candidate);
  }
  const candidate = scene(); candidate.nodes[0].transition = []; expectInvalid(candidate, /transition/);
});

test('JSON validation rejects unsupported extensions without executing accessors or toJSON', () => {
  let calls = 0;
  const accessor = scene(); Object.defineProperty(accessor, 'extension', { enumerable: true, get() { calls += 1; return {}; } });
  expectInvalid(accessor, /JSON/); assert.equal(calls, 0);
  const callback = scene(); callback.extension = { toJSON() { calls += 1; return {}; } };
  expectInvalid(callback, /JSON/); assert.equal(calls, 0);
  for (const extension of [undefined, 1n, () => {}, new Date(), Symbol('bad')]) {
    const candidate = scene(); candidate.extension = extension; expectInvalid(candidate, /JSON/);
  }
});

test('cyclic and sparse scene data are rejected while shared JSON data is accepted', () => {
  const cycle = scene(); cycle.extension = cycle; expectInvalid(cycle, /JSON/);
  const sparse = scene(); sparse.nodes = new Array(1); expectInvalid(sparse, /JSON/);
  const shared = scene(); const metadata = { author: 'FDG' }; shared.first = metadata; shared.second = metadata;
  assert.equal(validateRigScene(shared).ok, true);
});

test('factory rejects invalid rigs and placement options without changing the source rig', () => {
  const rig = createDefaultRigProject(), before = copy(rig);
  for (const options of [{ position: [-1, 0, 0] }, { position: null }, { resourceId: 'constructor' }, { nodeId: '' }, { name: 'bad\nname' }]) {
    assert.throws(() => createRigScene(rig, options), TypeError);
    assert.deepEqual(rig, before);
  }
  const invalid = copy(rig); invalid.rigVersion = 2;
  assert.throws(() => createRigScene(invalid), TypeError);
});

test('optional scene validation leaves tile geometry, route, gameplay values and existing warnings intact', () => {
  const original = createDefaultProject(), before = copy(original), baseline = validateProject(original);
  original.rigScene = scene(); const integrated = validateProject(original);
  assert.equal(integrated.ok, true);
  assert.deepEqual(integrated.route, baseline.route);
  assert.deepEqual(integrated.warnings, baseline.warnings);
  for (const key of ['map', 'characters', 'characterDrafts', 'skills', 'vfx', 'preview']) assert.deepEqual(original[key], before[key]);
});

test('whole-project compact UTF-8 budget includes unknown gameplay metadata and embedded rigs', () => {
  const candidate = project(); candidate.extension = '';
  const baseBytes = new TextEncoder().encode(JSON.stringify(candidate)).byteLength;
  candidate.extension = 'x'.repeat(LIMITS.fileBytes - baseBytes);
  assert.equal(new TextEncoder().encode(JSON.stringify(candidate)).byteLength, LIMITS.fileBytes);
  assert.equal(validateProject(candidate, { geometry: false }).ok, true);
  candidate.extension += 'x';
  const result = validateProject(candidate, { geometry: false });
  assert.equal(result.ok, false); assert.match(result.errors.join('\n'), /4MiB/);
});

test('UTF-8 byte guard counts multibyte metadata rather than JavaScript string length', () => {
  const candidate = project(); candidate.combatMetadata = { note: '가'.repeat(Math.floor(LIMITS.fileBytes / 2)) };
  assert.ok(JSON.stringify(candidate).length < LIMITS.fileBytes);
  const result = validateProject(candidate, { geometry: false });
  assert.equal(result.ok, false); assert.match(result.errors.join('\n'), /4MiB/);
});

test('project-level unknown JSON metadata cannot use hooks, cycles or undefined to bypass preservation', () => {
  let calls = 0;
  const callback = project(); callback.combatMetadata = { toJSON() { calls += 1; return {}; } };
  assert.equal(validateProject(callback, { geometry: false }).ok, false); assert.equal(calls, 0);
  const cycle = project(); cycle.combatMetadata = cycle;
  assert.equal(validateProject(cycle, { geometry: false }).ok, false);
  const undefinedValue = project(); undefinedValue.combatMetadata = undefined;
  assert.equal(validateProject(undefinedValue, { geometry: false }).ok, false);
});

test('ProjectStore JSON save/reopen preserves camera, transition, manual pose and unknown collision/combat metadata', () => {
  const candidate = project();
  candidate.combatMetadata = { damageFormula: 'production remains authoritative', attackLimit: null };
  candidate.map.collisionMetadata = { authored: [{ x: 200, y: 240, shape: 'retained-only' }], outerMass: 'LOCK' };
  candidate.rigScene.nodes[0].collisionMetadata = { applied: false, future: 'uninterpreted' };
  candidate.rigScene.nodes[0].time = .4;
  candidate.rigScene.nodes[0].transition = { fromClipId: 'bow', fromTime: .9, duration: .25, elapsed: .125 };
  candidate.rigScene.camera = { x: 3999, y: 7400, follow: true, yaw: .8, pitch: -.3 };
  candidate.rigScene.resources[0].project.preview.pose.head = { translation: [.2, .1, -.1], rotation: [0, .2, 0] };
  const first = new ProjectStore(candidate), reopened = new ProjectStore(JSON.parse(JSON.stringify(first.project)));
  assert.deepEqual(reopened.project, candidate);
  first.dispose(); reopened.dispose();
});

test('node, material and shared manual pose edits are one validated transaction with undo/redo', () => {
  const store = new ProjectStore(project()), original = store.project;
  store.change('리그 장면 편집', next => {
    next.rigScene.nodes[0].position = [100, 200, 50]; next.rigScene.nodes[0].materialId = 'ember';
    next.rigScene.nodes[0].time = .7;
    next.rigScene.resources[0].project.preview.pose.spine = { translation: [0, .1, 0], rotation: [0, 0, .2] };
  });
  const edited = store.project;
  assert.equal(store.canUndo, true); assert.equal(store.undo(), true); assert.deepEqual(store.project, original);
  assert.equal(store.redo(), true); assert.deepEqual(store.project, edited);
  assert.deepEqual(edited.map, original.map); assert.deepEqual(edited.skills, original.skills);
  store.dispose();
});

test('invalid rigScene edits and imports preserve state, redo history and change events', () => {
  const store = new ProjectStore(project()); let events = 0;
  store.signals.on('changed', () => { events += 1; });
  store.change('이동', next => { next.rigScene.nodes[0].position[0] = 500; });
  const edited = store.project; store.undo(); const before = store.project, eventCount = events;
  assert.equal(store.canRedo, true);
  assert.throws(() => store.change('잘못된 참조', next => { next.rigScene.resources = []; }), /resourceId/);
  const broken = copy(before); broken.rigScene.nodes[0].transition = { fromClipId: 'missing', fromTime: 0, duration: .25, elapsed: 0 };
  assert.throws(() => store.replace(broken), /fromClipId/);
  const oversized = copy(before); oversized.extension = 'x'.repeat(LIMITS.fileBytes);
  assert.throws(() => store.replace(oversized), /4MiB/);
  assert.deepEqual(store.project, before); assert.equal(events, eventCount); assert.equal(store.canRedo, true);
  store.redo(); assert.deepEqual(store.project, edited); store.dispose();
});

test('snapshots and changed-event data cannot mutate stored inline rig resources', () => {
  const source = project(), store = new ProjectStore(source);
  source.rigScene.resources[0].project.mesh.vertices[0][0] = 100;
  const snapshot = store.project; snapshot.rigScene.nodes[0].position[0] = 100;
  store.signals.on('changed', event => { event.project.rigScene.resources[0].project.mesh.weights[0][0].weight = .5; });
  store.change('시각 숨김', next => { next.rigScene.nodes[0].visible = false; });
  const saved = store.project;
  assert.equal(saved.rigScene.resources[0].project.mesh.vertices[0][0], -.5);
  assert.equal(saved.rigScene.nodes[0].position[0], 4020);
  assert.equal(saved.rigScene.resources[0].project.mesh.weights[0][0].weight, 1);
  store.dispose();
});
