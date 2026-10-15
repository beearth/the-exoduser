import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createDefaultRigProject, validateRigProject } from '../engine/fdg/rig-project.js';
import { evaluateRig } from '../engine/fdg/rig.js';
import { RigSceneRuntime } from '../engine/fdg/rig-scene-runtime.js';
import { RigPreview } from '../tools/fdg-studio/rig-preview.js';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';
import { buildTorsoDepthScene, torsoTopology, TORSO_RINGS, TORSO_POLYGONS,
  TORSO_SIDE_EDGES, TORSO_BACK_DEPTH, TORSO_SIDE_COLORS } from '../tools/fdg-studio/build-hell-aberrant-torso.mjs';

// New r7 geometry/mixed-face checks only. No older test module, source pixels, browser or Git operation.
const ROOT = new URL('../', import.meta.url);
const load = relative => {
  const raw = fs.readFileSync(new URL(relative, ROOT));
  return { relative, bytes: raw.length, sha256: crypto.createHash('sha256').update(raw).digest('hex'), data: JSON.parse(raw) };
};
const shipping = load('tools/fdg-studio/fixtures/hell-aberrant-torso-depth.fdg.json');
const standalone = load('tools/fdg-studio/fixtures/hell-aberrant-torso-depth.rig.json');
const baseline = load('tools/fdg-studio/fixtures/hell-aberrant-tail-idle.fdg.json');
const scene = shipping.data, rig = scene.rigScene.resources[0].project;
const prior = baseline.data, oldRig = prior.rigScene.resources[0].project;
const clone = value => structuredClone(value);
const EPS_MODEL = 1e-7;
const near = (actual, expected, epsilon = EPS_MODEL) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
const distance = (a, b) => Math.hypot(...a.map((value, axis) => value - b[axis]));
const xyDistance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const sourcePoint = i => rig.mesh.uvs[i].map((value, axis) => value * rig.provenance.sourceSize[axis]);
const sourceKey = point => point.map(value => Math.round(value * 10000)).join(',');
const triangleArea3D = (vertices, triangle) => {
  const [a, b, c] = triangle.map(i => vertices[i]), u = b.map((value, axis) => value - a[axis]), v = c.map((value, axis) => value - a[axis]);
  return Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]) / 2;
};
const bone = (evaluation, id) => evaluation.bonePositions.find(item => item.id === id).position;
const evalRig = (project, clipId, time, blend = null) => evaluateRig(project, { clipId, time, pose: project.preview.pose, blend });
const maximumVertexDrift = (a, b, indices = a.vertices.map((_vertex, i) => i)) => Math.max(...indices.map(i => distance(a.vertices[i], b.vertices[i])));
const maximumBoneDrift = (a, b) => Math.max(...a.bonePositions.map((item, i) => distance(item.position, b.bonePositions[i].position)));
const tick = (runtime, count) => { for (let i = 0; i < count; i++) assert.equal(runtime.step(FIXED_STEP), 1); };

function mixedFaceRig() {
  // Minimal fresh fixture isolates routing of one unchanged UV face and one explicit authored-color face.
  const project = createDefaultRigProject();
  project.mesh.vertices = [[-.5, 0, 0], [.5, 0, 0], [-.5, 1, 0], [.5, 1, .2]];
  project.mesh.triangles = [[0, 1, 2], [1, 3, 2]];
  project.mesh.weights = project.mesh.vertices.map(() => [{ boneId: 'root', weight: 1 }]);
  project.mesh.uvs = [[0, 0], [1, 0], [0, 1], [1, 1]];
  project.mesh.drawOrder = [0, 1]; project.mesh.faceColors = [null, '#513b28'];
  project.materials[0].texture = clone(oldRig.materials[0].texture);
  project.preview.clipId = null; project.preview.camera = { yaw: 0, pitch: 0, zoom: 1 };
  return project;
}

function mixedFaceScene(project) {
  return { version: 1, resources: [{ id: 'fresh-model', name: 'Fresh mixed-face probe', project }],
    nodes: [{ id: 'fresh-node', name: 'Fresh mixed-face node', resourceId: 'fresh-model', position: [100, 100, 0],
      scale: 40, visible: true, materialId: 'iron', clipId: null, time: 0 }],
    camera: { x: 100, y: 100, follow: false, yaw: 0, pitch: 0 } };
}

function recordingContext() {
  const commands = [], context = { globalAlpha: 1, fillStyle: '#000000' };
  let currentPath = [];
  for (const method of ['setTransform', 'fillRect', 'stroke', 'strokeRect', 'fillText', 'ellipse', 'arc', 'save', 'restore', 'clip', 'transform']) context[method] = () => {};
  context.beginPath = () => { currentPath = []; };
  context.moveTo = (x, y) => currentPath.push([x, y]);
  context.lineTo = (x, y) => currentPath.push([x, y]);
  context.closePath = () => {};
  context.fill = () => commands.push({ type: 'fill', color: context.fillStyle, path: clone(currentPath), alpha: context.globalAlpha });
  context.drawImage = (image, ...args) => commands.push({ type: 'drawImage', source: image.source, args, alpha: context.globalAlpha });
  return { context, commands };
}

const results = [], metrics = { preservedPrefix: {}, faceColors: {}, render: {}, geometry: {}, motion: [], owner: {} };
const check = (name, body) => test(name, async () => {
  try { await body(); results.push({ name, status: 'pass' }); }
  catch (error) { results.push({ name, status: 'fail', message: error.message }); throw error; }
});

check('r7 retains source/front prefix XY, UV, weights, original faces/layers, non-torso Z, 32 bones and the three r6 clips', () => {
  assert.deepEqual(rig, standalone.data);
  assert.deepEqual(scene, JSON.parse(JSON.stringify(buildTorsoDepthScene(prior))), 'Shipping is reproducible from the unchanged r6 source data');
  const vertexCount = oldRig.mesh.vertices.length, faceCount = oldRig.mesh.triangles.length;
  assert.ok(rig.mesh.vertices.length > vertexCount); assert.ok(rig.mesh.triangles.length > faceCount);
  assert.deepEqual(rig.mesh.vertices.slice(0, vertexCount).map(vertex => vertex.slice(0, 2)), oldRig.mesh.vertices.map(vertex => vertex.slice(0, 2)));
  assert.deepEqual(rig.mesh.uvs.slice(0, vertexCount), oldRig.mesh.uvs);
  assert.deepEqual(rig.mesh.weights.slice(0, vertexCount), oldRig.mesh.weights);
  assert.deepEqual(rig.mesh.triangles.slice(0, faceCount), oldRig.mesh.triangles);
  assert.deepEqual(rig.mesh.drawOrder.slice(0, faceCount), oldRig.mesh.drawOrder);
  assert.deepEqual(rig.provenance.regions.slice(0, vertexCount), oldRig.provenance.regions);
  assert.deepEqual(rig.provenance.triangleRegions.slice(0, faceCount), oldRig.provenance.triangleRegions);
  let changedTorsoZ = 0;
  for (let i = 0; i < vertexCount; i++) {
    if (oldRig.provenance.regions[i] !== 'torso') assert.equal(rig.mesh.vertices[i][2], oldRig.mesh.vertices[i][2]);
    else if (rig.mesh.vertices[i][2] !== oldRig.mesh.vertices[i][2]) changedTorsoZ++;
  }
  assert.ok(changedTorsoZ > 0, 'A real front Z change is required; color-only edits cannot satisfy torso depth');
  assert.deepEqual(rig.mesh.faceColors.slice(0, faceCount), Array(faceCount).fill(null), 'Accepted original faces keep original UV/material routing');
  assert.deepEqual(rig.skeleton, oldRig.skeleton); assert.equal(rig.skeleton.bones.length, 32);
  assert.deepEqual(rig.clips, oldRig.clips); assert.equal(rig.clips.length, 3);
  assert.deepEqual(rig.materials, oldRig.materials);
  for (const field of ['source', 'sourceSha256', 'sourceSize', 'sourcePxPerModelUnit', 'originPx', 'sourceImageModified',
    'gameplayApplied', 'nativeCombatUntouched', 'tailContinuity', 'readability', 'idleTransition']) {
    assert.deepEqual(rig.provenance[field], oldRig.provenance[field]);
  }
  assert.equal(rig.provenance.sourceImageModified, false); assert.equal(rig.provenance.gameplayApplied, false);
  const sequence = clone(scene.rigScene.sequence), oldSequence = prior.rigScene.sequence;
  sequence.id = oldSequence.id; sequence.authoredBy = oldSequence.authoredBy;
  assert.deepEqual(sequence, oldSequence, 'r6 timing, atlas scale/offset and native metadata remain exact');
  assert.deepEqual(scene.rigScene.nodes, prior.rigScene.nodes);
  for (const field of ['map', 'characters', 'skills', 'vfx', 'preview']) assert.deepEqual(scene[field], prior[field]);
  assert.deepEqual(scene.rigScene.camera, prior.rigScene.camera);
  const normalized = clone(scene), normalizedRig = normalized.rigScene.resources[0].project;
  normalized.id = prior.id; normalized.name = prior.name; normalized.rigScene.resources[0].name = prior.rigScene.resources[0].name;
  normalizedRig.id = oldRig.id; normalizedRig.name = oldRig.name; normalizedRig.mesh = clone(oldRig.mesh);
  normalizedRig.provenance.regions = clone(oldRig.provenance.regions); normalizedRig.provenance.triangleRegions = clone(oldRig.provenance.triangleRegions);
  delete normalizedRig.provenance.depthAuthoring;
  assert.deepEqual(normalized, prior, 'Only authored depth/side data and explicit scene/resource/rig names and IDs differ');
  metrics.preservedPrefix = { vertices: vertexCount, faces: faceCount, changedTorsoZ,
    addedVertices: rig.mesh.vertices.length - vertexCount, addedFaces: rig.mesh.triangles.length - faceCount,
    bones: 32, unchangedClips: rig.clips.map(clip => clip.id), sourcePngRead: false };
});

check('actual torso curvature and atomic 3D side sections preserve welds/T junctions and explicit inferred-source provenance', () => {
  const d = rig.provenance.depthAuthoring, topology = torsoTopology(oldRig);
  assert.equal(d.authority, 'ENGINE_AUTHORING'); assert.equal(d.revision, 'r7');
  for (const flag of ['sourceRecovered', 'fullBackAuthored', 'sourceTextureChanged', 'limbsChanged', 'nativeCombatApplied']) assert.equal(d[flag], false);
  assert.equal(d.originalVertices, 3864); assert.equal(d.originalTriangles, 4850);
  assert.equal(rig.mesh.vertices.length, 3895); assert.equal(rig.mesh.triangles.length, 4894);
  assert.equal(d.frontVertexIndices.length, 57); assert.equal(new Set(d.frontVertexIndices).size, 57);
  assert.deepEqual(d.ringsSourcePx, TORSO_RINGS); assert.deepEqual(d.roiSourcePx, TORSO_POLYGONS);
  assert.deepEqual(d.sideColors, { chest: '#756871', pelvis: '#665b65' }); assert.deepEqual(d.sideColors, TORSO_SIDE_COLORS);
  assert.deepEqual(d.rearDepthModel, { chest: -.18, pelvis: -.12 }); assert.deepEqual(d.rearDepthModel, TORSO_BACK_DEPTH);
  assert.equal(d.sourceTolerancePx, .0001); assert.equal(d.continuityPasses, 12); assert.equal(d.continuityConstraintCount, 40);
  const actualChanged = oldRig.mesh.vertices.flatMap((vertex, i) => vertex[2] === rig.mesh.vertices[i][2] ? [] : [i]);
  assert.deepEqual(d.frontVertexIndices, actualChanged, 'Declared front indices exactly match actual Z edits');
  const rows = new Map(), parts = {};
  for (let i = 0; i < d.originalVertices; i++) if (rig.provenance.regions[i] === 'torso') {
    const p = sourcePoint(i);
    if (p[1] >= 432 && p[1] <= 736) {
      const yKey = Math.round(p[1] * 10000); if (!rows.has(yKey)) rows.set(yKey, []); rows.get(yKey).push(i);
    }
  }
  for (const part of ['chest', 'pelvis']) {
    const indices = d.frontVertexIndices.filter(i => part === 'chest' ? sourcePoint(i)[1] < 632 : sourcePoint(i)[1] >= 632);
    assert.equal(indices.length, part === 'chest' ? 40 : 17);
    const z = indices.map(i => rig.mesh.vertices[i][2]);
    assert.ok(z.every(value => value > 0)); assert.ok(Math.max(...z) - Math.min(...z) > .1, 'Actual front depth varies instead of one lifted plane');
    parts[part] = { curvedVertices: indices.length, minFrontDepthModel: Math.min(...z), maxFrontDepthModel: Math.max(...z), maximumRowSagittaModel: 0 };
  }
  for (const row of rows.values()) {
    row.sort((a, b) => sourcePoint(a)[0] - sourcePoint(b)[0]);
    const a = row[0], b = row.at(-1), width = sourcePoint(b)[0] - sourcePoint(a)[0]; if (width <= .001) continue;
    for (const middle of row) {
      const t = (sourcePoint(middle)[0] - sourcePoint(a)[0]) / width;
      const sagitta = rig.mesh.vertices[middle][2] - rig.mesh.vertices[a][2] * (1 - t) - rig.mesh.vertices[b][2] * t;
      const part = sourcePoint(middle)[1] < 632 ? 'chest' : 'pelvis';
      parts[part].maximumRowSagittaModel = Math.max(parts[part].maximumRowSagittaModel, sagitta);
    }
  }
  for (const part of Object.values(parts)) assert.ok(part.maximumRowSagittaModel > .1, 'Same-Y cross-section bends away from its rim chord');
  let weldedFrontError = 0, sharedSeamError = 0;
  const groupDepth = key => {
    const group = topology.groups.get(key), indices = group.indices.filter(i => oldRig.provenance.regions[i] === 'torso');
    assert.ok(indices.length); return rig.mesh.vertices[indices[0]][2];
  };
  for (const group of topology.torso) {
    const torso = group.indices.filter(i => oldRig.provenance.regions[i] === 'torso'), z = torso.map(i => rig.mesh.vertices[i][2]);
    weldedFrontError = Math.max(weldedFrontError, Math.max(...z) - Math.min(...z));
    if (group.indices.some(i => oldRig.provenance.regions[i] !== 'torso')) sharedSeamError = Math.max(sharedSeamError, ...z.map(Math.abs));
  }
  const continuityErrors = topology.constraints.map(c => Math.abs(groupDepth(c.middle) - groupDepth(c.a) * (1 - c.t) - groupDepth(c.b) * c.t));
  const maxContinuityError = Math.max(...continuityErrors); assert.equal(topology.constraints.length, 40);
  assert.ok(weldedFrontError <= 1e-10); assert.ok(sharedSeamError <= 1e-10); assert.ok(maxContinuityError <= 1e-10);
  near(maxContinuityError, d.maxContinuityError, 1e-15);
  const boundaryKeys = new Set(topology.boundary.map(edge => [sourceKey(edge.a.point), sourceKey(edge.b.point)].sort().join('|')));
  assert.equal(d.sideSegments.length, 22);
  const declaredEdges = Object.entries(TORSO_SIDE_EDGES).flatMap(([part, edges]) => edges.map(front => ({ part, front })));
  assert.deepEqual(d.sideSegments.map(({ part, front }) => ({ part, front })), declaredEdges);
  const rearIndices = new Set(), sideFaces = new Set(), areas = [];
  for (const segment of d.sideSegments) {
    const [a, b] = segment.front, [ar, br] = segment.rear, [f1, f2] = segment.faces;
    assert.ok(boundaryKeys.has([sourceKey(sourcePoint(a)), sourceKey(sourcePoint(b))].sort().join('|')));
    const pointA = sourcePoint(a), pointB = sourcePoint(b), dx = pointB[0] - pointA[0], dy = pointB[1] - pointA[1], length2 = dx * dx + dy * dy;
    assert.ok(length2 > 0);
    for (const group of topology.torso) {
      const t = ((group.point[0] - pointA[0]) * dx + (group.point[1] - pointA[1]) * dy) / length2;
      const perpendicular = Math.abs((group.point[0] - pointA[0]) * dy - (group.point[1] - pointA[1]) * dx) / Math.sqrt(length2);
      assert.ok(!(t > 1e-8 && t < 1 - 1e-8 && perpendicular <= d.sourceTolerancePx), 'Side front edge is atomic, without an unsplit existing middle point');
    }
    assert.deepEqual(rig.mesh.triangles[f1], [a, br, b]); assert.deepEqual(rig.mesh.triangles[f2], [a, ar, br]);
    for (const [front, rear] of [[a, ar], [b, br]]) {
      assert.ok(front < d.originalVertices && rear >= d.originalVertices);
      assert.deepEqual(rig.mesh.vertices[rear].slice(0, 2), rig.mesh.vertices[front].slice(0, 2));
      assert.equal(rig.mesh.vertices[rear][2], d.rearDepthModel[segment.part]);
      assert.deepEqual(rig.mesh.uvs[rear], rig.mesh.uvs[front]); assert.deepEqual(rig.mesh.weights[rear], rig.mesh.weights[front]);
      assert.equal(rig.provenance.regions[rear], 'torso-authored-side');
      assert.ok(rig.mesh.vertices[front][2] - rig.mesh.vertices[rear][2] >= .12 - EPS_MODEL, 'Real section width is model Z, not paint');
      rearIndices.add(rear);
    }
    for (const face of segment.faces) {
      assert.equal(rig.mesh.faceColors[face], d.sideColors[segment.part]); assert.equal(rig.mesh.drawOrder[face], 0);
      assert.equal(rig.provenance.triangleRegions[face], 'torso-authored-side');
      const area = triangleArea3D(rig.mesh.vertices, rig.mesh.triangles[face]); assert.ok(area > 1e-8); areas.push(area); sideFaces.add(face);
    }
  }
  assert.equal(rearIndices.size, 31); assert.equal(sideFaces.size, 44);
  assert.deepEqual([...rearIndices].sort((a, b) => a - b), Array.from({ length: 31 }, (_, i) => d.originalVertices + i));
  assert.deepEqual([...sideFaces].sort((a, b) => a - b), Array.from({ length: 44 }, (_, i) => d.originalTriangles + i));
  metrics.geometry = { parts, rearVertices: rearIndices.size, coloredSideFaces: sideFaces.size, atomicSegments: d.sideSegments.length,
    minimumSideAreaModelSquared: Math.min(...areas), maximumSideAreaModelSquared: Math.max(...areas),
    weldedFrontErrorModel: weldedFrontError, sharedSeamErrorModel: sharedSeamError, continuityConstraintCount: continuityErrors.length,
    maximumTjunctionDepthErrorModel: maxContinuityError, sourceTolerancePx: d.sourceTolerancePx,
    authority: d.authority, sourceRecovered: false, fullBackAuthored: false };
});

check('faceColors is optional but requires exactly one null or #rrggbb value per triangle without weakening material validation', () => {
  const project = mixedFaceRig(); assert.equal(validateRigProject(project).ok, true);
  const absent = clone(project); delete absent.mesh.faceColors; assert.equal(validateRigProject(absent).ok, true);
  const valid = [null, '#000000', '#FFFFFF', '#abc123'];
  for (const color of valid) { const candidate = clone(project); candidate.mesh.faceColors = [color, color]; assert.equal(validateRigProject(candidate).ok, true); }
  const invalid = [null, {}, 'red', [], [null], [null, '#513b28', null], [null, '#abc'], [null, '#12345678'],
    [null, '513b28'], [null, '#gg3322'], [null, 'rgb(1,2,3)'], [null, 0], [null, false], [null, {}], [null, undefined]];
  for (const faceColors of invalid) {
    const candidate = clone(project); candidate.mesh.faceColors = faceColors;
    assert.equal(validateRigProject(candidate).ok, false, `Invalid faceColors ${JSON.stringify(faceColors)} must reject`);
  }
  const sparse = clone(project); sparse.mesh.faceColors = Array(2); sparse.mesh.faceColors[1] = '#513b28';
  assert.equal(validateRigProject(sparse).ok, false);
  const badMaterial = clone(project); badMaterial.materials[0].color = 'red'; assert.equal(validateRigProject(badMaterial).ok, false);
  metrics.faceColors = { validValueKinds: valid, invalidConfigurationCount: invalid.length + 2, sparseRejected: true, materialColorStillStrict: true };
});

check('actual evaluator returns independent faceColors and preserves null routing and absent-field legacy shape', () => {
  const project = mixedFaceRig(), original = clone(project);
  const evaluated = evaluateRig(project, { clipId: null, time: 0 });
  assert.deepEqual(evaluated.faceColors, [null, '#513b28']); assert.notEqual(evaluated.faceColors, project.mesh.faceColors);
  evaluated.faceColors[0] = '#000000'; evaluated.faceColors[1] = null; evaluated.uvs[0][0] = .5;
  assert.deepEqual(project, original, 'Explicit evaluation copies cannot change authored mesh or UV data');
  const absent = clone(project); delete absent.mesh.faceColors;
  assert.equal(Object.hasOwn(evaluateRig(absent, { clipId: null, time: 0 }), 'faceColors'), false);
  const allNull = clone(project); allNull.mesh.faceColors = [null, null];
  assert.deepEqual(evaluateRig(allNull, { clipId: null, time: 0 }).faceColors, [null, null]);
});

check('RigScene and RigPreview consume the same mixed face as original image plus flat fill, with separate actual draw counters', async () => {
  const project = mixedFaceRig(), texture = project.materials[0].texture;
  const image = { source: `/${texture.src}`, naturalWidth: texture.width, naturalHeight: texture.height };
  const draw = recordingContext(), consumer = new RigSceneRuntime(mixedFaceScene(project), { getImage: () => image });
  try {
    consumer.evaluate(); const count = consumer.drawNode(draw.context, 'fresh-node');
    assert.deepEqual(draw.commands.map(command => command.type), ['drawImage', 'fill']);
    assert.equal(draw.commands[0].source, image.source); assert.deepEqual(draw.commands[0].args, [0, 0, texture.width, texture.height]);
    assert.equal(draw.commands[1].color, '#513b28'); assert.equal(draw.commands[1].path.length, 3);
    const snapshot = consumer.getNodeSnapshot('fresh-node');
    assert.equal(snapshot.textureDraws, 1); assert.equal(snapshot.authoringDraws, 1); assert.equal(count, 2);
    assert.deepEqual(snapshot.faceColors, [null, '#513b28']);
    snapshot.faceColors[1] = '#000000'; assert.equal(consumer.getNodeSnapshot('fresh-node').faceColors[1], '#513b28');
    metrics.render.scene = { textureDraws: 1, authoringDraws: 1, actualOperations: count, source: image.source, flatColor: '#513b28' };
  } finally { consumer.dispose(); }

  const actualDraw = recordingContext(), actualConsumer = new RigSceneRuntime(scene.rigScene, { getImage: () => image });
  try {
    actualConsumer.setView(.5, .25); actualConsumer.evaluate();
    const count = actualConsumer.drawNode(actualDraw.context, 'hell-body-node');
    const snapshot = actualConsumer.getNodeSnapshot('hell-body-node');
    const fills = actualDraw.commands.filter(command => command.type === 'fill');
    const textures = actualDraw.commands.filter(command => command.type === 'drawImage');
    assert.equal(snapshot.authoringDraws, 44); assert.equal(fills.length, 44);
    assert.equal(fills.filter(command => command.color === '#756871').length, 26);
    assert.equal(fills.filter(command => command.color === '#665b65').length, 18);
    assert.ok(textures.length > 0 && textures.length <= 4850); assert.equal(snapshot.textureDraws, textures.length);
    assert.equal(count, textures.length + fills.length);
    for (const command of textures) assert.equal(command.source, image.source);
    metrics.render.shipping = { yawRad: .5, pitchRad: .25, textureDraws: snapshot.textureDraws,
      authoringDraws: snapshot.authoringDraws, chestFlatFills: 26, pelvisFlatFills: 18, actualOperations: count };
  } finally { actualConsumer.dispose(); }

  const globals = new Map(['ResizeObserver', 'devicePixelRatio', 'requestAnimationFrame', 'cancelAnimationFrame'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const previewDraw = recordingContext(), observers = new Set(), frames = new Map(), images = [];
  const ownerWindow = { Image: class {
    constructor() { images.push(this); }
    set src(source) { this.source = source; this.naturalWidth = texture.width; this.naturalHeight = texture.height; queueMicrotask(() => this.onload?.()); }
    removeAttribute() {}
  } };
  let rafId = 0;
  const replacements = { devicePixelRatio: 1,
    ResizeObserver: class { observe() { observers.add(this); } disconnect() { observers.delete(this); } },
    requestAnimationFrame(callback) { const id = ++rafId; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  let preview;
  try {
    const canvas = { width: 320, height: 240, ownerDocument: { defaultView: ownerWindow },
      parentElement: { getBoundingClientRect: () => ({ width: 320, height: 240 }) }, getContext: () => previewDraw.context };
    preview = new RigPreview(canvas, project); preview.showBones = false;
    await Promise.resolve(); await Promise.resolve();
    previewDraw.commands.length = 0; preview.render();
    assert.deepEqual(previewDraw.commands.map(command => command.type), ['drawImage', 'fill']);
    assert.equal(previewDraw.commands[1].color, '#513b28');
    const snapshot = preview.snapshot(); assert.equal(snapshot.textureDraws, 1); assert.equal(snapshot.authoringDraws, 1);
    assert.equal(images.length, 1); assert.equal(frames.size, 0);
    metrics.render.preview = { textureDraws: snapshot.textureDraws, authoringDraws: snapshot.authoringDraws, imageCount: images.length, extraRaf: frames.size };
    preview.dispose(); assert.equal(observers.size, 0); assert.equal(frames.size, 0); assert.equal(preview.textures.size, 0);
  } finally {
    preview?.dispose();
    for (const [key, descriptor] of globals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, listener) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(listener); }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  count() { return [...this.listeners.values()].reduce((total, entries) => total + entries.size, 0); }
}

function ownerSurface() {
  const dimensions = new Map(), atlas = scene.rigScene.sequence.atlas, atlasSource = `/${atlas.src}`;
  for (const definition of [...scene.characters, ...scene.vfx]) if (definition.sprite) {
    const sprite = definition.sprite;
    for (const src of [sprite.src, ...Object.values(sprite.directions ?? {})]) dimensions.set(`/${src}`, [sprite.frameWidth * sprite.columns, sprite.frameHeight * sprite.rows]);
  }
  for (const material of rig.materials) if (material.texture) dimensions.set(`/${material.texture.src}`, [material.texture.width, material.texture.height]);
  dimensions.set(atlasSource, [atlas.frameWidth * atlas.columns, atlas.frameHeight * atlas.rows]);
  const window = new Events(), document = new Events(), canvas = new Events(), frames = new Map(), images = [], observers = new Set();
  const { context } = recordingContext(); context.drawImage = () => {}; context.fill = () => {};
  let rafId = 0;
  Object.assign(window, { devicePixelRatio: 1,
    requestAnimationFrame(callback) { const id = ++rafId; frames.set(id, callback); return id; }, cancelAnimationFrame(id) { frames.delete(id); },
    ResizeObserver: class { observe() { observers.add(this); } disconnect() { observers.delete(this); } },
    Image: class { constructor() { images.push(this); } set src(source) {
      this.source = source; [this.naturalWidth, this.naturalHeight] = dimensions.get(source) ?? [0, 0]; queueMicrotask(() => this.onload?.());
    } removeAttribute() {} },
  });
  document.defaultView = window; const attributes = new Map();
  Object.assign(canvas, { ownerDocument: document, width: 320, height: 240, getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 240 }),
    hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name),
  });
  return { canvas, frames, images, observers, listenerCount: () => window.count() + document.count() + canvas.count() };
}

check('new depth skin preserves limbs, fixed feet, 27 leg caps, tail layers and idle/once/return FX under the actual owner', async () => {
  const originalCount = oldRig.mesh.vertices.length, d = rig.provenance.depthAuthoring;
  const nonTorso = oldRig.provenance.regions.flatMap((region, i) => region === 'torso' ? [] : [i]);
  const anchors = oldRig.provenance.tailContinuity.seamAnchors.map(anchor => {
    const indices = oldRig.mesh.uvs.flatMap((_uv, i) => xyDistance(sourcePoint(i), anchor.sourcePx) < .0002 ? [i] : []);
    return { ...anchor, tail: indices.filter(i => oldRig.provenance.regions[i] === 'tail'), leg: indices.filter(i => oldRig.provenance.regions[i] === anchor.region) };
  });
  assert.equal(anchors.length, 27); for (const anchor of anchors) assert.ok(anchor.tail.length && anchor.leg.length);
  const bind = evalRig(oldRig, 'hell-idle-breath', 0);
  const cases = [
    { phase: 'idle', clipId: 'hell-idle-breath', time: .5 },
    ...[.25, .9, 1.5, 2.75].map(time => ({ phase: 'attack', clipId: 'tail-swipe-once', time })),
    { phase: 'entry-t0', clipId: 'tail-swipe-once', time: 0, blend: { fromClipId: 'hell-idle-breath', fromTime: .5, amount: 0 } },
    { phase: 'return-t0', clipId: 'hell-idle-breath', time: 0, blend: { fromClipId: 'tail-swipe-once', fromTime: 3, amount: 0 } },
    { phase: 'return-middle', clipId: 'hell-idle-breath', time: .175, blend: { fromClipId: 'tail-swipe-once', fromTime: 3, amount: .5 } },
    { phase: 'return-end', clipId: 'hell-idle-breath', time: .35 },
  ];
  for (const sample of cases) {
    const e = evalRig(rig, sample.clipId, sample.time, sample.blend ?? null), before = evalRig(oldRig, sample.clipId, sample.time, sample.blend ?? null);
    const limbDrift = maximumVertexDrift(e, before, nonTorso), boneDrift = maximumBoneDrift(e, before);
    const footDrift = Math.max(...['leftFoot', 'rightFoot'].map(id => distance(bone(e, id), bone(bind, id))));
    assert.ok(limbDrift <= EPS_MODEL); assert.ok(boneDrift <= EPS_MODEL); assert.ok(footDrift <= EPS_MODEL);
    let capClosure = 0, sideXyError = 0;
    for (const anchor of anchors) for (const tail of anchor.tail) for (const leg of anchor.leg) capClosure = Math.max(capClosure, xyDistance(e.vertices[tail], e.vertices[leg]));
    assert.ok(capClosure <= EPS_MODEL);
    for (const segment of d.sideSegments) for (const [front, rear] of [[segment.front[0], segment.rear[0]], [segment.front[1], segment.rear[1]]]) {
      sideXyError = Math.max(sideXyError, xyDistance(e.vertices[front], e.vertices[rear]));
    }
    assert.ok(sideXyError <= EPS_MODEL, 'Copied rear UV/weights keep section endpoints aligned during actual LBS');
    const sideArea = Math.min(...d.sideSegments.flatMap(segment => segment.faces.map(i => triangleArea3D(e.vertices, rig.mesh.triangles[i]))));
    assert.ok(sideArea > 1e-8); assert.ok(e.vertices.every(vertex => vertex.every(Number.isFinite)));
    for (let i = 0; i < oldRig.mesh.triangles.length; i++) if (oldRig.provenance.triangleRegions[i] === 'tail') assert.equal(e.drawOrder[i], -2);
    metrics.motion.push({ ...sample, originalVertexCount: originalCount, limbDriftModel: limbDrift, worldBoneDriftModel: boneDrift,
      footDriftModel: footDrift, capXYClosureModel: capClosure, sideFrontRearXyErrorModel: sideXyError, minimumSideAreaModelSquared: sideArea });
  }
  const env = ownerSurface(), input = clone(scene), runtime = new FDGRuntime(env.canvas, input);
  try {
    await runtime.load(); tick(runtime, 30);
    assert.equal(runtime.getRigSequenceSnapshot().activationId, 0); assert.equal(runtime.getRigNodeSnapshot('hell-body-node').clipId, 'hell-idle-breath');
    const beforeEntry = runtime.getRigNodeSnapshot('hell-body-node'); assert.equal(runtime.replayRigSequence(), true);
    const entry = runtime.getRigNodeSnapshot('hell-body-node'); assert.ok(maximumVertexDrift(entry, beforeEntry) <= EPS_MODEL); assert.ok(maximumBoneDrift(entry, beforeEntry) <= EPS_MODEL);
    tick(runtime, 53); assert.equal(runtime.getRigSequenceSnapshot().eventCount, 0);
    tick(runtime, 1); const fx = runtime.getRigSequenceSnapshot().activeFx[0];
    assert.equal(fx.age, 0); assert.equal(fx.frameIndex, 0); assert.equal(fx.life, 1.5); assert.equal(fx.activationId, 1);
    assert.deepEqual(fx.cell, { sx: 0, sy: 0, sw: 640, sh: 640 });
    tick(runtime, 90); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    tick(runtime, 36); const returned = runtime.getRigNodeSnapshot('hell-body-node'), completed = runtime.getRigSequenceSnapshot();
    assert.equal(returned.clipId, 'hell-idle-breath'); near(returned.transition.duration, .35); assert.equal(returned.transition.elapsed, 0);
    const terminalAttack = evalRig(rig, 'tail-swipe-once', 3); assert.ok(maximumVertexDrift(returned, terminalAttack) <= EPS_MODEL);
    assert.equal(completed.status, 'completed'); assert.equal(completed.eventCount, 1); near(completed.elapsed, 3);
    tick(runtime, 21); assert.equal(runtime.getRigNodeSnapshot('hell-body-node').transition, null);
    const beforeReload = runtime.getRigNodeSnapshot('hell-body-node'), capture = runtime.captureRigScene(), images = env.images.length;
    assert.deepEqual(capture.sequence, input.rigScene.sequence); assert.deepEqual(capture.resources[0].project, rig);
    const reopened = clone(input); reopened.rigScene = JSON.parse(JSON.stringify(capture)); await runtime.setProject(reopened);
    assert.ok(maximumVertexDrift(runtime.getRigNodeSnapshot('hell-body-node'), beforeReload) <= EPS_MODEL);
    assert.equal(runtime.stats.time, 0); assert.equal(runtime.getRigSequenceSnapshot().activationId, 0); assert.equal(runtime.getRigSequenceSnapshot().status, 'ready');
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.equal(env.images.length, images);
    metrics.owner = { idleActivationCount: 0, entryT0Continuity: true, eventSeconds: .9, triggerAge: fx.age, triggerFrame: fx.frameIndex,
      atlasLifeSeconds: fx.life, expiryTicksFromTrigger: 90, returnTicks: 21, completedElapsed: completed.elapsed,
      capturedFaceColors: capture.resources[0].project.mesh.faceColors.length, sameSourceImageCount: images,
      reopenedOwnerClock: runtime.stats.time, reopenedActivation: 0, reopenedFxCount: 0 };
    runtime.start(); assert.equal(env.frames.size, 1); runtime.dispose();
    assert.equal(env.frames.size, 0); assert.equal(env.listenerCount(), 0); assert.equal(env.observers.size, 0);
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
  } finally { runtime.dispose(); }
});

after(() => {
  const evidence = process.env.FDG_TORSO_TEST_EVIDENCE;
  if (!evidence) return;
  fs.mkdirSync(evidence, { recursive: true });
  const artifacts = [shipping, standalone, baseline].map(({ data: _data, ...manifest }) => manifest);
  const receipt = {
    scope: 'new r7 geometry/mixed-face regressions only; no previous suite, source PNG, browser, native game or Git validation',
    artifacts, tests: results, testCount: results.length, passed: results.filter(result => result.status === 'pass').length,
    failed: results.filter(result => result.status === 'fail').length, oldSuitesExecuted: 0, sourceImagesRead: 0,
  };
  fs.writeFileSync(path.join(evidence, 'targeted-torso-depth-receipt.json'), JSON.stringify(receipt, null, 2));
  fs.writeFileSync(path.join(evidence, 'new-tests.json'), JSON.stringify(receipt, null, 2));
  fs.writeFileSync(path.join(evidence, 'targeted-torso-depth-metrics.json'), JSON.stringify({
    scope: 'actual CPU consumer/data observations only, no visual or canonical 3D/production verdict', epsilonModel: EPS_MODEL,
    ...metrics,
  }, null, 2));
});
