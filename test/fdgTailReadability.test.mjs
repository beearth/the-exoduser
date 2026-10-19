import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { evaluateRig } from '../engine/fdg/rig.js';

// New r5 authored-data checks only. No browser, PNG decoding, native game, or earlier suite is invoked.
const ROOT = new URL('../', import.meta.url);
const load = relative => {
  const raw = fs.readFileSync(new URL(relative, ROOT));
  return { relative, bytes: raw.length, sha256: crypto.createHash('sha256').update(raw).digest('hex'), data: JSON.parse(raw) };
};
const shipping = load('tools/fdg-studio/fixtures/hell-aberrant-tail-readability.fdg.json');
const standalone = load('tools/fdg-studio/fixtures/hell-aberrant-tail-readability.rig.json');
const baseline = load('tools/fdg-studio/fixtures/hell-aberrant-tail-sequence.fdg.json');
const scene = shipping.data, prior = baseline.data;
const rig = scene.rigScene.resources[0].project, oldRig = prior.rigScene.resources[0].project;
const sequence = scene.rigScene.sequence, ppm = rig.provenance.sourcePxPerModelUnit, nodeScale = scene.rigScene.nodes[0].scale;
const EPS_MODEL = 1e-7;
const KEY_TIMES = [0, .2, .45, .6, .65, .72, .78, .84, .9, .98, 1.08, 1.25, 1.4, 1.6, 1.8, 2.4, 3];
const SAMPLE_TIMES = [...new Set([...KEY_TIMES, .775, .99, .875, .925, .95,
  ...Array.from({ length: 7 }, (_, i) => .65 + i / 24)].filter(t => t <= 3).map(t => Math.round(t * 1e9) / 1e9))].sort((a, b) => a - b);
const sub = (a, b) => a.map((value, axis) => value - b[axis]);
const distance = (a, b) => Math.hypot(...sub(a, b));
const xyDistance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
const turn = (a, b, c) => {
  const u = sub(b, a), v = sub(c, b);
  return Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]);
};
const bone = (evaluation, id) => evaluation.bonePositions.find(item => item.id === id).position;
const PROBE_SOURCE_PX = [[304, 1120], [317.9961, 1120], [160, 1056], [224, 1088]];
const sourcePx = index => rig.mesh.uvs[index].map((value, axis) => value * rig.provenance.sourceSize[axis]);
const probes = PROBE_SOURCE_PX.map(point => {
  const index = rig.mesh.uvs.findIndex((_uv, i) => rig.provenance.regions[i] === 'tail'
    && rig.mesh.weights[i].every(weight => /^tail\d+$/.test(weight.boneId)) && xyDistance(sourcePx(i), point) < .0002);
  assert.ok(index >= 0, `Actual tail-only UV probe ${point} must exist`);
  return { index, sourcePx: point, weights: structuredClone(rig.mesh.weights[index]) };
});
const anchors = rig.provenance.tailContinuity.seamAnchors.map(anchor => {
  const indices = rig.mesh.uvs.flatMap((_uv, i) => xyDistance(sourcePx(i), anchor.sourcePx) < .0002 ? [i] : []);
  return { ...anchor, tail: indices.filter(i => rig.provenance.regions[i] === 'tail'), leg: indices.filter(i => rig.provenance.regions[i] === anchor.region) };
});
const legVertices = rig.provenance.regions.flatMap((region, index) => ['leftLeg', 'rightLeg'].includes(region) ? [index] : []);
const evaluated = new Map(SAMPLE_TIMES.map(time => [time, evaluateRig(rig, { clipId: 'tail-swipe-once', time, pose: {}, blend: null })]));
const bind = evaluated.get(0), bindPivot = bone(bind, 'tail9');
const bindRelative = probes.map(probe => sub(bind.vertices[probe.index], bindPivot));
const bend = e => turn(bone(e, 'tail9'), bone(e, 'tail12'), bone(e, 'tail15'));
const meshBend = e => turn(e.vertices[probes[2].index], e.vertices[probes[3].index], e.vertices[probes[0].index]);
const metrics = SAMPLE_TIMES.map(time => {
  const e = evaluated.get(time), pivot = bone(e, 'tail9');
  let capClosure = 0;
  for (const anchor of anchors) for (const tail of anchor.tail) for (const leg of anchor.leg) capClosure = Math.max(capClosure, xyDistance(e.vertices[tail], e.vertices[leg]));
  return { time,
    tipRelative: probes.slice(0, 2).map((probe, i) => {
      const xyModel = sub(e.vertices[probe.index], pivot).slice(0, 2);
      return { index: probe.index, xyModel, bindResidualSourcePx: xyDistance(xyModel, bindRelative[i]) * ppm };
    }),
    boneBendDeltaRad: wrap(bend(e) - bend(bind)), meshBendDeltaRad: wrap(meshBend(e) - meshBend(bind)),
    footDriftModel: Math.max(...['leftFoot', 'rightFoot'].map(id => distance(bone(e, id), bone(bind, id)))),
    legVertexDriftModel: Math.max(...legVertices.map(i => distance(e.vertices[i], bind.vertices[i]))),
    capXYClosureModel: capClosure, pivotDriftModel: xyDistance(pivot, bindPivot),
    allVertexReturnDriftModel: Math.max(...e.vertices.map((vertex, i) => distance(vertex, bind.vertices[i]))),
    allBoneReturnDriftModel: Math.max(...e.bonePositions.map((item, i) => distance(item.position, bind.bonePositions[i].position))),
  };
});
const at = time => metrics.find(metric => metric.time === time);
const arcMetrics = probes.slice(0, 2).map((probe, i) => {
  const release = metrics.filter(metric => metric.time >= .65 && metric.time <= .9);
  let arc = 0, angle = 0;
  for (let j = 1; j < release.length; j++) {
    const a = release[j - 1].tipRelative[i].xyModel, b = release[j].tipRelative[i].xyModel;
    arc += xyDistance(a, b); angle += wrap(Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0]));
  }
  const chord = xyDistance(at(.65).tipRelative[i].xyModel, at(.9).tipRelative[i].xyModel);
  return { index: probe.index, chordSourcePx: chord * ppm, sampledArcSourcePx: arc * ppm, signedAngleRad: angle, chordAtSceneScalePx: chord * nodeScale };
});

const results = [];
const check = (name, body) => test(name, () => {
  try { body(); results.push({ name, status: 'pass' }); }
  catch (error) { results.push({ name, status: 'fail', message: error.message }); throw error; }
});

check('r5 standalone and inline shipping agree; only authored tracks, declared metadata and the two approved FX settings differ', () => {
  assert.equal(shipping.bytes, 820009); assert.equal(shipping.sha256, '3037c97333c9b0c2e6c8406ad7d363838289fc6edb58bfd2f2202b5d9c2a1530');
  assert.equal(standalone.bytes, 713092); assert.equal(standalone.sha256, '9d86cda846192512f32149a0ffa6a8c4ece1805b70fdb1873932caf7c67b39d3');
  assert.deepEqual(rig, standalone.data); assert.equal(rig.id, 'hell-aberrant-tail-swipe-readability-r5');
  assert.equal(sequence.atlas.scale, .16); assert.deepEqual(sequence.offset, [-145, -84]);
  assert.equal(sequence.startTime, .9); assert.equal(sequence.atlas.frames / sequence.atlas.fps, 1.5);
  assert.deepEqual([sequence.atlas.frameWidth, sequence.atlas.frameHeight, sequence.atlas.columns, sequence.atlas.rows, sequence.atlas.frames, sequence.atlas.fps], [640, 640, 6, 4, 24, 16]);
  assert.equal(sequence.nativeTimeConversion, false); assert.equal(sequence.nativeCombatApplied, false);
  const normalized = structuredClone(scene), nRig = normalized.rigScene.resources[0].project;
  normalized.id = prior.id; normalized.name = prior.name;
  normalized.rigScene.resources[0].name = prior.rigScene.resources[0].name;
  nRig.id = oldRig.id; nRig.name = oldRig.name; nRig.preview.clipId = oldRig.preview.clipId;
  for (let i = 0; i < nRig.clips.length; i++) nRig.clips[i].tracks = structuredClone(oldRig.clips[i].tracks);
  nRig.provenance.distalPivotCompensation = structuredClone(oldRig.provenance.distalPivotCompensation);
  delete nRig.provenance.readability;
  normalized.rigScene.sequence.id = prior.rigScene.sequence.id;
  normalized.rigScene.sequence.authoredBy = prior.rigScene.sequence.authoredBy;
  normalized.rigScene.sequence.atlas.scale = prior.rigScene.sequence.atlas.scale;
  normalized.rigScene.sequence.offset[0] = prior.rigScene.sequence.offset[0];
  assert.deepEqual(normalized, prior, 'No map, source, mesh, weights, skeleton, materials, native metadata or unapproved FX/settings drift');
  assert.equal(rig.clips.length, 2); assert.deepEqual(rig.clips[0].tracks, rig.clips[1].tracks);
  for (const clip of rig.clips) {
    assert.equal(clip.duration, 3); assert.equal(clip.fps, 24); assert.equal(clip.tracks.length, 20);
    assert.equal(clip.loop, clip.id === 'tail-swipe-loop');
    for (const track of clip.tracks) {
      if (/^tail[0-8]$/.test(track.boneId)) assert.deepEqual(track, oldRig.clips.find(c => c.id === clip.id).tracks.find(t => t.boneId === track.boneId));
      else assert.deepEqual(track.keys.map(key => key.time), KEY_TIMES);
    }
  }
});

check('actual free-tip release exceeds 150 source px and 1 rad with relative chain/mesh bend and distinct body-to-tip timing', () => {
  assert.equal(ppm, 300); assert.equal(nodeScale, 80);
  for (const arc of arcMetrics) {
    assert.ok(arc.chordSourcePx >= 150, `Actual tip ${arc.index} chord must be >=150 source-equivalent px`);
    assert.ok(arc.chordAtSceneScalePx >= 40); assert.ok(arc.signedAngleRad <= -1);
    assert.ok(arc.sampledArcSourcePx >= arc.chordSourcePx);
  }
  assert.ok(at(.65).boneBendDeltaRad >= .20); assert.ok(at(.9).boneBendDeltaRad <= -.15);
  assert.ok(at(.65).meshBendDeltaRad >= .08); assert.ok(at(.9).meshBendDeltaRad <= -.04, 'Actual LBS surface bends; rigid curl rotation alone cannot pass');
  const once = rig.clips.find(clip => clip.id === 'tail-swipe-once');
  const minimumTime = id => once.tracks.find(track => track.boneId === id).keys.reduce((a, b) => b.rotation[2] < a.rotation[2] ? b : a).time;
  assert.deepEqual(['spine', 'leftArm', 'leftForearm'].map(minimumTime), [.84, .9, .98]);
  assert.equal(minimumTime('tail10'), .9); assert.equal(minimumTime('tail15'), .98);
  assert.ok(minimumTime('tail15') > minimumTime('tail10'), 'Resampled keys retain a delayed tip, not an invented .014-spaced minimum for every bone');
});

check('stronger tracks preserve fixed feet, all 27 leg cut-caps and key-baked pivot with bounded sampled intermediate drift', () => {
  assert.equal(anchors.length, 27); assert.ok(legVertices.length > 0);
  for (const anchor of anchors) {
    assert.ok(anchor.tail.length > 0 && anchor.leg.length > 0, `Actual tail/leg same-UV pair missing at ${anchor.sourcePx}`);
  }
  for (const metric of metrics) {
    assert.ok(metric.footDriftModel <= EPS_MODEL); assert.ok(metric.legVertexDriftModel <= EPS_MODEL);
    assert.ok(metric.capXYClosureModel <= EPS_MODEL);
    if (KEY_TIMES.includes(metric.time)) assert.ok(metric.pivotDriftModel <= EPS_MODEL);
    else assert.ok(metric.pivotDriftModel * ppm <= 4, 'Intermediate sample is bounded, without claiming a continuous runtime pivot constraint');
  }
});

check('recovery reduces actual tip residual to one quarter and returns all authored vertices/world bones at 1.8s and 3s', () => {
  for (let i = 0; i < 2; i++) assert.ok(at(1.4).tipRelative[i].bindResidualSourcePx <= .25 * at(.9).tipRelative[i].bindResidualSourcePx);
  assert.ok(Math.abs(at(1.4).boneBendDeltaRad) < Math.abs(at(.9).boneBendDeltaRad));
  assert.ok(Math.abs(at(1.4).meshBendDeltaRad) < Math.abs(at(.9).meshBendDeltaRad));
  for (const time of [1.8, 3]) {
    assert.ok(at(time).allVertexReturnDriftModel <= EPS_MODEL); assert.ok(at(time).allBoneReturnDriftModel <= EPS_MODEL);
    assert.ok(Math.abs(at(time).boneBendDeltaRad) <= EPS_MODEL); assert.ok(Math.abs(at(time).meshBendDeltaRad) <= EPS_MODEL);
  }
});

after(() => {
  const evidence = process.env.FDG_READABILITY_TEST_EVIDENCE;
  if (!evidence) return;
  fs.mkdirSync(evidence, { recursive: true });
  const artifacts = [shipping, standalone, baseline].map(({ data: _data, ...manifest }) => manifest);
  fs.writeFileSync(path.join(evidence, 'targeted-tail-readability-receipt.json'), JSON.stringify({
    scope: 'new r5 authored data only; no earlier suite, PNG, native game, browser or Git verification',
    artifacts, tests: results, testCount: 4, passed: results.filter(result => result.status === 'pass').length,
    failed: results.filter(result => result.status === 'fail').length, oldSuitesExecuted: 0, sourceImagesRead: 0,
    sourcePxPerModelUnit: ppm, nodeScale, sampleCount: SAMPLE_TIMES.length, equalityExceptions: [
      'scene id/name', 'resource name and rig id/name', 'body4/tail9..15 clip tracks',
      'rig preview clipId=once', 'readability/distalPivotCompensation authoring metadata',
      'sequence id/authoredBy', 'sequence atlas.scale=.16', 'sequence offset[0]=-145',
    ],
  }, null, 2));
  fs.writeFileSync(path.join(evidence, 'targeted-tail-readability-metrics.json'), JSON.stringify({
    scope: 'actual new r5 LBS samples; data regression, not visual or production verdict',
    sceneSha256: shipping.sha256, rigSha256: standalone.sha256, probes, sampleTimes: SAMPLE_TIMES,
    coordinates: 'model hierarchy-world; source-equivalent XY px=model units*300; node-scale px=model units*80; camera projection excluded',
    arcMetrics, capAnchorCount: anchors.length, legVertexCount: legVertices.length,
    boneBend: 'signed turn tail9->tail12->tail15 minus bind',
    meshBend: 'actual LBS signed turn source[160,1056]->[224,1088]->[304,1120] minus bind', metrics,
    epsilonModel: EPS_MODEL, intermediatePivotSampleLimitSourcePx: 4,
  }, null, 2));
});
