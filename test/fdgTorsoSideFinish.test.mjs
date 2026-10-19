import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { evaluateRig } from '../engine/fdg/rig.js';
import { RigSceneRuntime } from '../engine/fdg/rig-scene-runtime.js';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';
import { buildTorsoSideFinishScene, SIDE_FINISH_RINGS, SIDE_FINISH_TONES } from '../tools/fdg-studio/build-hell-aberrant-torso-side-finish.mjs';

// Only new r8 rear-depth/face-tone data is checked; earlier test modules and source pixels are never read.
const ROOT = new URL('../', import.meta.url);
const load = relative => {
  const raw = fs.readFileSync(new URL(relative, ROOT));
  return { relative, bytes: raw.length, sha256: crypto.createHash('sha256').update(raw).digest('hex'), data: JSON.parse(raw) };
};
const shipping = load('tools/fdg-studio/fixtures/hell-aberrant-torso-side-finish.fdg.json');
const standalone = load('tools/fdg-studio/fixtures/hell-aberrant-torso-side-finish.rig.json');
const baseline = load('tools/fdg-studio/fixtures/hell-aberrant-torso-depth.fdg.json');
const scene = shipping.data, rig = scene.rigScene.resources[0].project;
const prior = baseline.data, oldRig = prior.rigScene.resources[0].project;
const finish = rig.provenance.sideFinish, depth = oldRig.provenance.depthAuthoring;
const clone = value => structuredClone(value), EPS_MODEL = 1e-7;
const near = (a, b, epsilon = 1e-12) => assert.ok(Math.abs(a - b) <= epsilon, `${a} != ${b}`);
const distance = (a, b) => Math.hypot(...a.map((value, axis) => value - b[axis]));
const xyDistance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const sourceY = index => 1140 - oldRig.mesh.vertices[index][1] * 300;
const bone = (e, id) => e.bonePositions.find(item => item.id === id).position;
const evalRig = (project, clipId, time, blend = null) => evaluateRig(project, { clipId, time, pose: project.preview.pose, blend });
const vertexDrift = (a, b, count = a.vertices.length) => Math.max(...a.vertices.slice(0, count).map((vertex, i) => distance(vertex, b.vertices[i])));
const boneDrift = (a, b) => Math.max(...a.bonePositions.map((item, i) => distance(item.position, b.bonePositions[i].position)));
const area3D = (vertices, triangle) => {
  const [a, b, c] = triangle.map(index => vertices[index]), u = b.map((value, axis) => value - a[axis]), v = c.map((value, axis) => value - a[axis]);
  return Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]) / 2;
};
const EXPECTED_RINGS = {
  chest: [[432, .68], [464, .88], [512, 1], [560, 1], [592, .90], [624, .72]],
  pelvis: [[640, .72], [656, .92], [688, 1], [704, .90], [720, .68]],
};
const EXPECTED_TONES = { chest: { front: [40, 34, 37], rear: [29, 26, 29] }, pelvis: { front: [34, 30, 33], rear: [25, 23, 26] } };
// Independent interpolation from locked knots. No private builder helper is imported or evaluated.
const expectedFactor = (part, y) => {
  const knots = EXPECTED_RINGS[part];
  if (y <= knots[0][0]) return knots[0][1];
  for (let i = 1; i < knots.length; i++) if (y <= knots[i][0]) {
    const [ay, av] = knots[i - 1], [by, bv] = knots[i], t = (y - ay) / (by - ay);
    return av * (1 - t) + bv * t;
  }
  return knots.at(-1)[1];
};
const colorHex = rgb => `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`;
const rgb = color => color.slice(1).match(/../g).map(value => parseInt(value, 16));
const weightedRgb = color => rgb(color).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
const results = [], metrics = { delta: {}, taper: {}, tones: {}, phases: [], render: [], capture: {} };
const check = (name, body) => test(name, async () => {
  try { await body(); results.push({ name, status: 'pass' }); }
  catch (error) { results.push({ name, status: 'fail', message: error.message }); throw error; }
});

check('r8 allows only 31 rear Z/44 side tones and declared identity/provenance changes while preserving all r7 source/front contracts', () => {
  assert.equal(shipping.bytes, 867875); assert.equal(shipping.sha256, '49ee20af6ea78db697440c8bedcd5fa760f5df898d0aeda2ec9b98890c1ace03');
  assert.equal(standalone.bytes, 760840); assert.equal(standalone.sha256, 'b6be4301ae9ebccf363b175325714dd0b2ac95c194cc024881dc373e5eb34b8c');
  assert.deepEqual(rig, standalone.data); assert.deepEqual(scene, JSON.parse(JSON.stringify(buildTorsoSideFinishScene(prior))));
  assert.equal(rig.mesh.vertices.length, 3895); assert.equal(rig.mesh.triangles.length, 4894);
  assert.deepEqual(rig.mesh.vertices.slice(0, 3864), oldRig.mesh.vertices.slice(0, 3864), 'All existing front XYZ remains exact, including r7 torso curvature');
  assert.deepEqual(rig.mesh.vertices.map(vertex => vertex.slice(0, 2)), oldRig.mesh.vertices.map(vertex => vertex.slice(0, 2)));
  for (const key of ['uvs', 'weights', 'triangles', 'drawOrder']) assert.deepEqual(rig.mesh[key], oldRig.mesh[key]);
  assert.deepEqual(rig.mesh.faceColors.slice(0, 4850), oldRig.mesh.faceColors.slice(0, 4850));
  assert.deepEqual(rig.skeleton, oldRig.skeleton); assert.equal(rig.skeleton.bones.length, 32);
  assert.deepEqual(rig.clips, oldRig.clips); assert.equal(rig.clips.length, 3); assert.deepEqual(rig.materials, oldRig.materials);
  assert.deepEqual(rig.provenance.depthAuthoring, depth, 'r7 metadata remains historical; current values live in sideFinish');
  assert.deepEqual(scene.rigScene.sequence, prior.rigScene.sequence); assert.deepEqual(scene.rigScene.nodes, prior.rigScene.nodes);
  const rearIndices = [...new Set(depth.sideSegments.flatMap(segment => segment.rear))].sort((a, b) => a - b);
  const faces = [...new Set(depth.sideSegments.flatMap(segment => segment.faces))].sort((a, b) => a - b);
  assert.equal(rearIndices.length, 31); assert.equal(faces.length, 44);
  assert.deepEqual(finish.rearVertices.map(item => item.index).sort((a, b) => a - b), rearIndices);
  assert.deepEqual(finish.faceTones.map(item => item.index).sort((a, b) => a - b), faces);
  const changed = rig.mesh.vertices.flatMap((vertex, i) => vertex[2] === oldRig.mesh.vertices[i][2] ? [] : [i]);
  assert.equal(changed.length, 24); assert.ok(changed.every(index => rearIndices.includes(index)));
  const changedColors = rig.mesh.faceColors.flatMap((color, i) => color === oldRig.mesh.faceColors[i] ? [] : [i]);
  assert.deepEqual(changedColors, faces);
  const normalized = clone(scene), nRig = normalized.rigScene.resources[0].project;
  normalized.id = prior.id; normalized.name = prior.name; normalized.rigScene.resources[0].name = prior.rigScene.resources[0].name;
  nRig.id = oldRig.id; nRig.name = oldRig.name;
  for (const index of rearIndices) nRig.mesh.vertices[index][2] = oldRig.mesh.vertices[index][2];
  for (const index of faces) nRig.mesh.faceColors[index] = oldRig.mesh.faceColors[index];
  delete nRig.provenance.sideFinish;
  assert.deepEqual(normalized, prior, 'No other geometry, weights, source, map, clips, material, camera, FX or native metadata drift');
  metrics.delta = { originalFrontVerticesExact: 3864, vertices: 3895, triangles: 4894, rearVertices: 31,
    changedRearZ: changed.length, unchangedPlateauRearZ: 31 - changed.length, changedSideTones: faces.length,
    unchangedBones: 32, unchangedClips: 3, geometrySourceRecovered: false };
});

check('actual rear positions follow continuous Y taper while all 44 faces use locked, individually darker front/rear role tones', () => {
  assert.equal(finish.authority, 'ENGINE_AUTHORING'); assert.equal(finish.revision, 'r8'); assert.equal(finish.inputRevision, 'r7');
  for (const flag of ['sourceRecovered', 'frontSurfaceChanged', 'textureChanged', 'rendererChanged', 'nativeCombatApplied']) assert.equal(finish[flag], false);
  assert.equal(finish.sideFacesRemoved, 0); assert.equal(finish.toneFactorFormula, '.9 + .1 * interpolatedDepthFactor');
  assert.deepEqual(SIDE_FINISH_RINGS, EXPECTED_RINGS); assert.deepEqual(finish.ringsSourceY, EXPECTED_RINGS);
  assert.deepEqual(SIDE_FINISH_TONES, EXPECTED_TONES); assert.deepEqual(finish.paletteRGB, EXPECTED_TONES);
  const taperRows = [], ranges = {}, duplicateY = new Map();
  for (const row of finish.rearVertices) {
    const factor = expectedFactor(row.part, sourceY(row.index));
    near(row.sourceY, sourceY(row.index), 1e-10); assert.equal(row.originalZ, oldRig.mesh.vertices[row.index][2]);
    near(row.factor, factor); near(row.z, row.originalZ * factor); near(rig.mesh.vertices[row.index][2], row.z);
    assert.ok(factor >= .68 && factor <= 1); assert.ok(row.z < 0 && Math.abs(row.z) >= .0816 - 1e-12);
    const key = `${row.part}:${Math.round(row.sourceY * 10000)}`;
    if (duplicateY.has(key)) near(row.z, duplicateY.get(key)); else duplicateY.set(key, row.z);
    taperRows.push({ index: row.index, part: row.part, sourceY: row.sourceY, factor: row.factor, actualZModel: row.z });
  }
  for (const part of ['chest', 'pelvis']) {
    const values = taperRows.filter(row => row.part === part).map(row => row.actualZModel);
    ranges[part] = { minimumZModel: Math.min(...values), maximumZModel: Math.max(...values) };
    near(ranges[part].minimumZModel, part === 'chest' ? -.18 : -.12);
    near(ranges[part].maximumZModel, part === 'chest' ? -.1224 : -.0816);
    for (const [y, factor] of EXPECTED_RINGS[part]) {
      near(expectedFactor(part, y), factor); near(expectedFactor(part, y - 1e-6), factor, 2e-8); near(expectedFactor(part, y + 1e-6), factor, 2e-8);
    }
  }
  assert.equal(finish.rearVertices.filter(row => row.factor === 1).length, 7, 'Locked plateau preserves seven rear vertices');
  // Exercise the public builder at each knot with a disposable numeric input; original files/UV/assets stay untouched.
  const boundarySamples = [];
  for (const part of ['chest', 'pelvis']) for (const [y, factor] of EXPECTED_RINGS[part]) {
    const probe = clone(prior), index = finish.rearVertices.find(row => row.part === part).index;
    probe.rigScene.resources[0].project.mesh.vertices[index][1] = (1140 - y) / 300;
    const built = buildTorsoSideFinishScene(probe).rigScene.resources[0].project.provenance.sideFinish.rearVertices.find(row => row.index === index);
    near(built.factor, factor); near(built.z, built.originalZ * factor);
    boundarySamples.push({ part, sourceY: y, expectedFactor: factor, builderFactor: built.factor });
  }
  const toneRows = [], colors = new Set();
  for (const segment of depth.sideSegments) {
    const y = segment.front.reduce((sum, index) => sum + sourceY(index), 0) / 2, toneFactor = .9 + .1 * expectedFactor(segment.part, y);
    const pair = [];
    for (let roleIndex = 0; roleIndex < 2; roleIndex++) {
      const index = segment.faces[roleIndex], role = roleIndex === 0 ? 'front' : 'rear';
      const expected = colorHex(EXPECTED_TONES[segment.part][role].map(channel => Math.round(channel * toneFactor)));
      const row = finish.faceTones.find(item => item.index === index), actual = rig.mesh.faceColors[index];
      assert.equal(row.part, segment.part); assert.equal(row.role, role); near(row.sourceY, y, 1e-10); near(row.toneFactor, toneFactor);
      assert.equal(row.color, expected); assert.equal(actual, expected); assert.match(actual, /^#[0-9a-f]{6}$/);
      const ratio = weightedRgb(actual) / weightedRgb(oldRig.mesh.faceColors[index]);
      assert.ok(ratio < .4, 'Each face is darker than its own previous authored side tone, not only a global average');
      colors.add(actual); pair.push(actual); toneRows.push({ index, part: segment.part, role, color: actual, weightedRgbRatioToR7: ratio });
    }
    assert.ok(weightedRgb(pair[0]) > weightedRgb(pair[1]), 'Front-adjacent role stays brighter than its matching rear role');
  }
  assert.equal(colors.size, 10);
  metrics.taper = { ranges, rearRows: taperRows, independentKnotSamples: boundarySamples, plateauVertices: 7 };
  metrics.tones = { uniqueHexColors: [...colors], faceCount: toneRows.length, maximumWeightedRgbRatioToR7: Math.max(...toneRows.map(row => row.weightedRgbRatioToR7)),
    metric: '0.2126R+0.7152G+0.0722B on encoded 8-bit RGB; authored-tone comparison, not source/PBR photometry', faceRows: toneRows };
});

check('nine new r8 motion phases retain original LBS/front endpoints and positive 3D side area; actual small-angle render uses every darker side face', () => {
  const bind = evalRig(oldRig, 'hell-idle-breath', 0), ppm = oldRig.provenance.sourcePxPerModelUnit;
  const sourcePoint = i => oldRig.mesh.uvs[i].map((value, axis) => value * oldRig.provenance.sourceSize[axis]);
  const caps = oldRig.provenance.tailContinuity.seamAnchors.map(anchor => {
    const indices = oldRig.mesh.uvs.flatMap((_uv, i) => xyDistance(sourcePoint(i), anchor.sourcePx) < .0002 ? [i] : []);
    return { tail: indices.filter(i => oldRig.provenance.regions[i] === 'tail'), leg: indices.filter(i => oldRig.provenance.regions[i] === anchor.region) };
  });
  assert.equal(caps.length, 27); for (const cap of caps) assert.ok(cap.tail.length && cap.leg.length);
  const phases = [
    { phase: 'idle', clipId: 'hell-idle-breath', time: .5 },
    ...[.25, .9, 1.5, 2.75].map(time => ({ phase: 'attack', clipId: 'tail-swipe-once', time })),
    { phase: 'entry-t0', clipId: 'tail-swipe-once', time: 0, blend: { fromClipId: 'hell-idle-breath', fromTime: .5, amount: 0 } },
    { phase: 'return-t0', clipId: 'hell-idle-breath', time: 0, blend: { fromClipId: 'tail-swipe-once', fromTime: 3, amount: 0 } },
    { phase: 'return-middle', clipId: 'hell-idle-breath', time: .175, blend: { fromClipId: 'tail-swipe-once', fromTime: 3, amount: .5 } },
    { phase: 'return-end', clipId: 'hell-idle-breath', time: .35 },
  ];
  for (const phase of phases) {
    const e = evalRig(rig, phase.clipId, phase.time, phase.blend ?? null), old = evalRig(oldRig, phase.clipId, phase.time, phase.blend ?? null);
    assert.deepEqual(e.vertices.slice(0, 3864), old.vertices.slice(0, 3864)); assert.deepEqual(e.bonePositions, old.bonePositions);
    let xyError = 0, depthSpan = Infinity, capClosure = 0;
    for (const segment of depth.sideSegments) for (let i = 0; i < 2; i++) {
      const front = segment.front[i], rear = segment.rear[i];
      assert.deepEqual(e.vertices[front], old.vertices[front]);
      xyError = Math.max(xyError, xyDistance(e.vertices[front], e.vertices[rear]));
      depthSpan = Math.min(depthSpan, e.vertices[front][2] - e.vertices[rear][2]);
    }
    for (const cap of caps) for (const tail of cap.tail) for (const leg of cap.leg) capClosure = Math.max(capClosure, xyDistance(e.vertices[tail], e.vertices[leg]));
    const footDrift = Math.max(...['leftFoot', 'rightFoot'].map(id => distance(bone(e, id), bone(bind, id))));
    const areas = depth.sideSegments.flatMap(segment => segment.faces.map(index => area3D(e.vertices, rig.mesh.triangles[index])));
    assert.ok(xyError <= EPS_MODEL); assert.ok(capClosure <= EPS_MODEL); assert.ok(footDrift <= EPS_MODEL);
    assert.ok(depthSpan >= .0816 - EPS_MODEL); assert.ok(Math.min(...areas) > 1e-8);
    for (let i = 0; i < oldRig.mesh.triangles.length; i++) if (oldRig.provenance.triangleRegions[i] === 'tail') assert.equal(e.drawOrder[i], -2);
    metrics.phases.push({ ...phase, originalFrontLbsDriftModel: vertexDrift(e, old, 3864), boneDriftModel: boneDrift(e, old),
      footDriftModel: footDrift, capXYClosureModel: capClosure, frontRearModelXYError: xyError,
      minimumSectionZSpanModel: depthSpan, minimumSectionZSpanSourceEquivalentPx: depthSpan * ppm,
      minimumSideAreaModelSquared: Math.min(...areas), maximumSideAreaModelSquared: Math.max(...areas) });
  }
  const commands = [], context = { globalAlpha: 1, fillStyle: '#000000' };
  for (const method of ['save', 'restore', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'clip', 'transform']) context[method] = () => {};
  context.drawImage = () => commands.push({ type: 'texture' }); context.fill = () => commands.push({ type: 'flat', color: context.fillStyle });
  const texture = rig.materials[0].texture, image = { naturalWidth: texture.width, naturalHeight: texture.height };
  const consumer = new RigSceneRuntime(scene.rigScene, { getImage: () => image });
  try {
    for (const yaw of [-22, 22]) {
      consumer.setView(yaw * Math.PI / 180, 6 * Math.PI / 180); consumer.evaluate(); commands.length = 0;
      const count = consumer.drawNode(context, 'hell-body-node'), snapshot = consumer.getNodeSnapshot('hell-body-node');
      const colors = commands.filter(command => command.type === 'flat').map(command => command.color);
      assert.equal(snapshot.textureDraws, 4850); assert.equal(snapshot.authoringDraws, 44); assert.equal(count, 4894);
      assert.deepEqual(colors.sort(), finish.faceTones.map(item => item.color).sort(), 'All 44 current face tones reach actual plain fills');
      metrics.render.push({ yawDegrees: yaw, pitchDegrees: 6, textureDraws: snapshot.textureDraws, authoringDraws: snapshot.authoringDraws, actualOperations: count });
    }
  } finally { consumer.dispose(); }
});

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(callback); }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  count() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}
function surface() {
  const dimensions = new Map();
  for (const definition of [...scene.characters, ...scene.vfx]) if (definition.sprite) {
    const sprite = definition.sprite;
    for (const src of [sprite.src, ...Object.values(sprite.directions ?? {})]) dimensions.set(`/${src}`, [sprite.frameWidth * sprite.columns, sprite.frameHeight * sprite.rows]);
  }
  for (const material of rig.materials) if (material.texture) dimensions.set(`/${material.texture.src}`, [material.texture.width, material.texture.height]);
  const atlas = scene.rigScene.sequence.atlas; dimensions.set(`/${atlas.src}`, [atlas.frameWidth * atlas.columns, atlas.frameHeight * atlas.rows]);
  const window = new Events(), document = new Events(), canvas = new Events(), frames = new Map(), observers = new Set(), images = [];
  const context = { globalAlpha: 1 };
  for (const method of ['setTransform', 'fillRect', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'stroke', 'strokeRect', 'fillText', 'ellipse',
    'fill', 'arc', 'save', 'restore', 'clip', 'transform', 'drawImage']) context[method] = () => {};
  let rafId = 0;
  Object.assign(window, { devicePixelRatio: 1,
    requestAnimationFrame(callback) { const id = ++rafId; frames.set(id, callback); return id; }, cancelAnimationFrame(id) { frames.delete(id); },
    ResizeObserver: class { observe() { observers.add(this); } disconnect() { observers.delete(this); } },
    Image: class { constructor() { images.push(this); } set src(src) {
      [this.naturalWidth, this.naturalHeight] = dimensions.get(src) ?? [0, 0]; queueMicrotask(() => this.onload?.());
    } removeAttribute() {} },
  });
  document.defaultView = window; const attributes = new Map();
  Object.assign(canvas, { ownerDocument: document, width: 320, height: 240, getContext: () => context,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 240 }),
    hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name),
  });
  return { canvas, frames, observers, images, listenerCount: () => window.count() + document.count() + canvas.count() };
}
const tick = (runtime, count) => { for (let i = 0; i < count; i++) assert.equal(runtime.step(FIXED_STEP), 1); };

check('own r8 capture/JSON reload retains finished geometry, face tones, pose and settings while runtime clocks/FX reset', async () => {
  const env = surface(), input = clone(scene), runtime = new FDGRuntime(env.canvas, input);
  try {
    await runtime.load(); tick(runtime, 30); assert.equal(runtime.replayRigSequence(), true); tick(runtime, 60); runtime.pause();
    const before = runtime.getRigNodeSnapshot('hell-body-node'), liveFx = runtime.getRigSequenceSnapshot().activeFx;
    assert.equal(liveFx.length, 1); near(liveFx[0].age, .1); const saved = runtime.captureRigScene();
    assert.deepEqual(saved.resources[0].project, rig); assert.deepEqual(saved.sequence, input.rigScene.sequence);
    assert.deepEqual(saved.nodes[0].returnTo, input.rigScene.nodes[0].returnTo); assert.equal(saved.nodes[0].clipId, before.clipId); near(saved.nodes[0].time, before.time);
    const reopened = clone(input); reopened.rigScene = JSON.parse(JSON.stringify(saved));
    assert.deepEqual(reopened.rigScene, saved); const imageCount = env.images.length; await runtime.setProject(reopened);
    const restored = runtime.getRigNodeSnapshot('hell-body-node'), state = runtime.getRigSequenceSnapshot();
    assert.deepEqual(restored.vertices, before.vertices); assert.deepEqual(restored.faceColors, before.faceColors); assert.deepEqual(restored.bonePositions, before.bonePositions);
    assert.equal(runtime.stats.time, 0); assert.equal(state.status, 'ready'); assert.equal(state.activationId, 0); assert.equal(state.eventCount, 0);
    assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []); assert.equal(env.images.length, imageCount);
    tick(runtime, 1); assert.equal(runtime.getRigSequenceSnapshot().eventCount, 0); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
    assert.deepEqual(runtime.captureRigScene().resources[0].project, rig); assert.deepEqual(runtime.captureRigScene().sequence, saved.sequence);
    metrics.capture = { savedClipId: before.clipId, savedTimeSeconds: before.time, savedActiveFxAgeSeconds: liveFx[0].age,
      restoredVertexDriftModel: vertexDrift(restored, before), restoredBoneDriftModel: boneDrift(restored, before),
      retainedRearVertices: finish.rearVertices.length, retainedSideTones: finish.faceTones.length,
      initialReopenedClockSeconds: 0, initialReopenedActivation: 0, initialReopenedFxCount: 0, noStaleEventAfterTick: true,
      imagesBefore: imageCount, imagesAfter: env.images.length, scope: 'in-memory public consumer capture and JSON reload; browser/server save proof excluded' };
    runtime.start(); assert.equal(env.frames.size, 1); runtime.dispose();
    assert.equal(env.frames.size, 0); assert.equal(env.listenerCount(), 0); assert.equal(env.observers.size, 0); assert.deepEqual(runtime.getVfxPlaybackSnapshot(), []);
  } finally { runtime.dispose(); }
});

after(() => {
  const evidence = process.env.FDG_SIDE_FINISH_TEST_EVIDENCE; if (!evidence) return;
  fs.mkdirSync(evidence, { recursive: true });
  const artifacts = [shipping, standalone, baseline].map(({ data: _data, ...manifest }) => manifest);
  fs.writeFileSync(path.join(evidence, 'new-tests.json'), JSON.stringify({
    scope: 'new r8 rear Z/side-tone regression only; no old suite, PNG/source pixel, browser, old proof or Git validation',
    artifacts, tests: results, testCount: 4, passed: results.filter(item => item.status === 'pass').length,
    failed: results.filter(item => item.status === 'fail').length, oldSuitesExecuted: 0, sourceImagesRead: 0,
  }, null, 2));
  fs.writeFileSync(path.join(evidence, 'targeted-torso-side-finish-metrics.json'), JSON.stringify({
    scope: 'CPU data observations; inferred authored shape/tone, no source-recovery, visual, photometric, winding/self-intersection or production verdict',
    epsilonModel: EPS_MODEL, xyClosureCoordinates: 'hierarchy-world model XY, not projected screen XY', ...metrics,
  }, null, 2));
});
