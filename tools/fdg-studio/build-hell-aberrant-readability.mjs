import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateRig } from '../../engine/fdg/rig.js';
import { validateRigProject } from '../../engine/fdg/rig-project.js';

export const READABILITY_TIMES = [0, .2, .45, .6, .65, .72, .78, .84, .9, .98, 1.08, 1.25, 1.4, 1.6, 1.8, 2.4, 3];
const keys = values => READABILITY_TIMES.map((time, i) => ({ time, translation: [0, 0, 0], rotation: [0, 0, values[i]] }));
const sample = (points, time) => {
  let right = points.findIndex(([t]) => t >= time);
  if (right <= 0) return points[right < 0 ? points.length - 1 : 0][1];
  const [a, av] = points[right - 1], [b, bv] = points[right];
  return av + (bv - av) * (time - a) / (b - a);
};

export function buildTailReadabilityScene(baseline) {
  const scene = structuredClone(baseline), rig = scene.rigScene.resources[0].project;
  const original = structuredClone(rig), once = rig.clips.find(clip => clip.id === 'tail-swipe-once');
  const tracks = new Map(once.tracks.map(track => [track.boneId, structuredClone(track)]));
  // The chest leads, then the upper arm, forearm and distal tail follow. Feet and pelvis remain authored bind pose.
  const body = {
    spine: [0, .025, .08, .1, .1, .075, .015, -.12, -.1, -.07, -.04, .025, .03, .01, 0, 0, 0],
    head: [0, -.015, -.045, -.06, -.055, -.025, .015, .05, .04, .025, .015, -.01, -.005, 0, 0, 0, 0],
    leftArm: [0, .005, .045, .09, .11, .11, .075, -.025, -.08, -.065, -.025, .025, .015, 0, 0, 0, 0],
    leftForearm: [0, 0, .035, .09, .115, .12, .12, .025, -.06, -.07, -.02, .035, .015, 0, 0, 0, 0],
  };
  for (const [boneId, values] of Object.entries(body)) tracks.set(boneId, { boneId, keys: keys(values) });

  // Keep the r3 seam pivot position. Replace its cancelled world rotation with an authored wind-up/release.
  // This is baked into ordinary keys, never a runtime constraint or native attack timing conversion.
  const pivot = original.skeleton.bones.find(bone => bone.id === 'tail9');
  const bindPosition = evaluateRig(original, { clipId: null, time: 0, pose: {} }).bonePositions.find(bone => bone.id === 'tail9').position;
  const worldAngles = [0, .035, .2, .32, .36, .36, .3, -.1, -.5, -.58, -.38, .18, .1, -.035, 0, 0, 0];
  const pivotKeys = READABILITY_TIMES.map((time, i) => {
    const result = evaluateRig(original, { clipId: 'tail-swipe-once', time, pose: {} });
    const matrix = result.boneMatrices.find(bone => bone.id === 'tail8').world;
    const angle = Math.atan2(matrix[1], matrix[0]), dx = bindPosition[0] - matrix[12], dy = bindPosition[1] - matrix[13];
    return { time, translation: [Math.cos(angle) * dx + Math.sin(angle) * dy - pivot.translation[0], -Math.sin(angle) * dx + Math.cos(angle) * dy - pivot.translation[1], 0], rotation: [0, 0, worldAngles[i] - angle] };
  });
  tracks.set('tail9', { boneId: 'tail9', keys: pivotKeys });

  for (let i = 10; i <= 15; i++) {
    const delay = (i - 10) * .014, prepare = .075 + (i - 10) * .006, release = -.10 - (i - 10) * .009;
    const wave = [[0, 0], [.2, 0], [.45 + delay, prepare * .45], [.65 + delay, prepare], [.78 + delay, prepare], [.9 + delay, release], [1.08 + delay, release * .5], [1.25 + delay, prepare * .7], [1.48 + delay, -prepare * .2], [1.8, 0], [2.4, 0], [3, 0]];
    tracks.set(`tail${i}`, { boneId: `tail${i}`, keys: keys(READABILITY_TIMES.map(time => sample(wave, time))) });
  }
  for (const clip of rig.clips) clip.tracks = [...tracks.values()].map(track => structuredClone(track));
  rig.id = 'hell-aberrant-tail-swipe-readability-r5';
  rig.name = '지옥기형 · 꼬리치기 강약 제작';
  rig.preview.clipId = 'tail-swipe-once'; rig.preview.time = 0; rig.preview.playing = false;
  rig.provenance.readability = { authority: 'ENGINE_AUTHORING', revision: 'r5', keyTimes: READABILITY_TIMES, tail9PivotPositionPreserved: true, tail9WorldAnglesRad: worldAngles, distalDelayPerBoneSeconds: .014, bodyLeadOrder: ['spine', 'head', 'leftArm', 'leftForearm', 'tail9', 'tail10..15'], meshWeightsSkeletonChanged: false, nativeCombatApplied: false };
  rig.provenance.distalPivotCompensation = { ...rig.provenance.distalPivotCompensation, keyTimes: READABILITY_TIMES, formula: 'localT=R(-parentWorldZ)*(bindPivotWorldXY-parentWorldXY)-bindLocalT; localZ=authoredTail9WorldZ-parentWorldZ', preservedRelativeBend: 'authored tail9 world wind-up/release plus delayed tail10..15 local bend; world pivot position retained' };
  scene.id = 'hell-aberrant-tail-readability-scene-r5';
  scene.name = '지옥기형 · 꼬리치기 강약 제작';
  scene.rigScene.resources[0].name = rig.name;
  scene.rigScene.sequence.id = 'hell-aberrant-tail-readability-impact-r5';
  scene.rigScene.sequence.authoredBy = 'FDG visible tail-swipe readability r5';
  scene.rigScene.sequence.atlas.scale = .16;
  scene.rigScene.sequence.offset = [-145, -84];
  const validation = validateRigProject(rig);
  if (!validation.ok) throw Error(JSON.stringify(validation.errors));
  return scene;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const out = process.env.FDG_READABILITY_OUTPUT || path.join(repo, 'tmp/hell-aberrant-readability-r5');
  const baseline = JSON.parse(await fs.readFile(path.join(repo, 'tools/fdg-studio/fixtures/hell-aberrant-tail-sequence.fdg.json'), 'utf8'));
  const scene = buildTailReadabilityScene(baseline), bodyOnly = structuredClone(scene);
  delete bodyOnly.rigScene.sequence;
  await fs.mkdir(out, { recursive: true });
  for (const [name, value] of [['hell-aberrant-tail-readability.fdg.json', scene], ['hell-aberrant-tail-readability.rig.json', scene.rigScene.resources[0].project], ['body-only-readability.fdg.json', bodyOnly]]) await fs.writeFile(path.join(out, name), JSON.stringify(value));
  console.log(JSON.stringify({ output: out, tracks: scene.rigScene.resources[0].project.clips[1].tracks.length, keyTimes: READABILITY_TIMES.length, sourceImagesRead: 0, meshWeightsSkeletonChanged: false }));
}
