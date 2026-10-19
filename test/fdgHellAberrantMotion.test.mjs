import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { validateRigProject, RIG_LIMITS } from '../engine/fdg/rig-project.js';
import { evaluateRig } from '../engine/fdg/rig.js';
import { sortRigFaces } from '../engine/fdg/rig-texture.js';
import { createRigScene } from '../engine/fdg/rig-scene-project.js';
import { RigSceneRuntime } from '../engine/fdg/rig-scene-runtime.js';

const project = JSON.parse(await fs.readFile(new URL('../tools/fdg-studio/fixtures/hell-aberrant-motion.rig.json', import.meta.url), 'utf8'));
const at = (time, clipId = 'tail-swipe-loop') => evaluateRig(project, { time, clipId });
const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
const indices = region => project.provenance.regions.flatMap((value, i) => value === region ? [i] : []);
const nearest = (region, point) => indices(region).reduce((best, i) => {
  const uv = project.mesh.uvs[i], d = Math.hypot(uv[0] * 832 - point[0], uv[1] * 1248 - point[1]);
  return d < best.d ? { i, d } : best;
}, { i: -1, d: Infinity }).i;
const maxMovement = (a, b, ids) => Math.max(...ids.map(i => distance(a.vertices[i], b.vertices[i])));

test('approved-source mesh retains strict finite UV triangles and bounded authoring data', () => {
  assert.deepEqual(validateRigProject(project), { ok: true, errors: [] });
  assert.ok(project.mesh.vertices.length <= RIG_LIMITS.vertices);
  assert.ok(project.mesh.triangles.length <= RIG_LIMITS.triangles);
  assert.ok(Buffer.byteLength(JSON.stringify(project)) <= RIG_LIMITS.fileBytes);
  for (const triangle of project.mesh.triangles) {
    const [a, b, c] = triangle.map(i => project.mesh.uvs[i]);
    assert.ok(Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) > 1e-10, 'UV face must map a real source surface');
  }
  assert.equal(project.provenance.sourceImageModified, false);
  assert.equal(project.provenance.gameplayApplied, false);
  assert.equal(project.provenance.authority, 'ENGINE_AUTHORING');
});

test('body anticipation and sweep differ while all leg vertices keep their support', () => {
  const bind = at(0), prepare = at(.65), sweep = at(.9), recover = at(1.8);
  for (const region of ['torso', 'head', 'leftArm', 'axe']) {
    assert.ok(maxMovement(bind, prepare, indices(region)) > .02, `${region} preparation must move`);
    assert.ok(maxMovement(prepare, sweep, indices(region)) > .03, `${region} phases must differ`);
  }
  for (const pose of [prepare, sweep, at(1.4), recover]) {
    assert.ok(maxMovement(bind, pose, [...indices('leftLeg'), ...indices('rightLeg')]) < 1e-10, 'feet and legs must not slide with the body');
  }
  assert.ok(maxMovement(bind, recover, project.mesh.vertices.map((_, i) => i)) < 1e-10, 'recovery must return all visible surfaces to bind');
});

test('tail middle and tip deform relative to each other instead of rotating one image', () => {
  const base = nearest('tail', [638, 724]), middle = nearest('tail', [747, 842]), tip = nearest('tail', [318, 1141]);
  assert.ok(base >= 0 && middle >= 0 && tip >= 0 && new Set([base, middle, tip]).size === 3);
  const bind = at(0), prepare = at(.65), sweep = at(.9);
  const bendAngle = pose => {
    const a = pose.vertices[base].map((v, i) => v - pose.vertices[middle][i]);
    const b = pose.vertices[tip].map((v, i) => v - pose.vertices[middle][i]);
    return Math.acos(Math.max(-1, Math.min(1, a.reduce((sum, v, i) => sum + v * b[i], 0) / Math.hypot(...a) / Math.hypot(...b))));
  };
  for (const pose of [prepare, sweep]) {
    assert.ok(distance(bind.vertices[middle], pose.vertices[middle]) > .025, 'visible tail middle must move');
    assert.ok(distance(bind.vertices[tip], pose.vertices[tip]) > .04, 'visible tail tip must move');
    assert.ok(Math.abs(bendAngle(bind) - bendAngle(pose)) > .03, 'tail shape must change internally, which whole-image translation, rotation or uniform scale cannot do');
  }
  assert.ok(indices('tail').some(i => project.mesh.weights[i].length === 2), 'tail joint interpolation needs real two-bone weights');
  assert.deepEqual(prepare.uvs, bind.uvs, 'skinning moves geometry, never the approved source UVs');
});

test('24 FPS samples produce distinct articulated poses and loop closure has no drift', () => {
  const tip = nearest('tail', [318, 1141]), chest = nearest('torso', [440, 510]);
  const samples = new Set(Array.from({ length: 24 }, (_, frame) => {
    const pose = at(frame / 24);
    return [...pose.vertices[tip], ...pose.vertices[chest]].map(v => v.toFixed(7)).join(',');
  }));
  assert.equal(samples.size, 24, '24 sample poses must not duplicate a still frame');
  for (const time of [3, 6, 9]) assert.deepEqual(at(time).vertices, at(0).vertices);
  assert.deepEqual(at(3, 'tail-swipe-once').vertices, at(30, 'tail-swipe-once').vertices, 'one-shot endpoint must hold');
  assert.deepEqual(at(2.99).vertices, at(0).vertices, 'the rest segment must close continuously');
});

test('tail surfaces stay behind legs regardless of projected depth and copy on JSON reopen', () => {
  const bind = at(0), projected = bind.vertices.map(([x, y, z]) => ({ x, y, z: -z * 10000 }));
  const faces = sortRigFaces(bind.triangles, projected, bind.drawOrder);
  const firstLeg = faces.findIndex(({ index }) => /Leg$/.test(project.provenance.triangleRegions[index]));
  const lastTail = faces.findLastIndex(({ index }) => project.provenance.triangleRegions[index] === 'tail');
  assert.ok(lastTail >= 0 && firstLeg > lastTail, 'authored tail layer must precede the leg layers');
  const reopened = JSON.parse(JSON.stringify(project));
  for (const time of [0, .65, .9, 1.4, 1.8]) assert.deepEqual(evaluateRig(reopened, { time }).vertices, at(time).vertices);
  reopened.mesh.uvs[0][0] = .5;
  assert.notEqual(reopened.mesh.uvs[0][0], project.mesh.uvs[0][0], 'reopened data must be independent');
});

test('the existing scene consumer carries this authored rig through clock and transitions', () => {
  const scene = createRigScene(project, { position: [4020, 7380, 0], resourceId: 'hell-body', nodeId: 'hell-body-node' });
  const consumer = new RigSceneRuntime(scene);
  assert.deepEqual(consumer.requiredSources(), [project.materials[0].texture.src]);
  consumer.update(.65); consumer.evaluate();
  const prepared = consumer.getNodeSnapshot('hell-body-node');
  assert.ok(prepared.vertices.some((vertex, i) => distance(vertex, at(0).vertices[i]) > .02));
  assert.equal(consumer.setClip('hell-body-node', 'tail-swipe-once', .25), true);
  consumer.update(.1); consumer.evaluate();
  assert.ok(consumer.getNodeSnapshot('hell-body-node').transition);
  consumer.update(.15); consumer.evaluate();
  assert.equal(consumer.getNodeSnapshot('hell-body-node').transition, null);
  consumer.update(4); consumer.evaluate();
  assert.equal(consumer.getNodeSnapshot('hell-body-node').time, 3);
  assert.equal(consumer.snapshot().ownedRaf, 0);
  consumer.dispose(); assert.deepEqual(consumer.requiredSources(), []);
});
