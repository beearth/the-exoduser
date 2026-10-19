import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProject } from '../../engine/fdg/project.js';

export const IDLE_TIMES = [0, .25, .5, .75, 1, 1.25, 1.5, 1.75, 2];
export const IDLE_BREATH = [0, .146447, .5, .853553, 1, .853553, .5, .146447, 0];
export const IDLE_SWAY = [0, .707107, 1, .707107, 0, -.707107, -1, -.707107, 0];
export const IDLE_CLIP_ID = 'hell-idle-breath';
export const ATTACK_ENTRY_SECONDS = .25;
export const IDLE_RETURN_SECONDS = .35;

export function buildTailIdleScene(baseline) {
  const scene = structuredClone(baseline), rig = scene.rigScene.resources[0].project;
  const tracks = ['spine', 'head', 'leftArm', 'leftForearm', 'rightArm', 'rightForearm'].map(boneId => ({
    boneId,
    keys: IDLE_TIMES.map((time, i) => {
      const breath = IDLE_BREATH[i], sway = IDLE_SWAY[i];
      const translation = boneId === 'spine' ? [.025 * sway, .032 * breath, 0] : [0, 0, 0];
      const z = { spine: .010 * sway, head: -.012 * sway, leftArm: .018 * breath,
        leftForearm: .012 * breath, rightArm: -.015 * breath, rightForearm: -.010 * breath }[boneId];
      return { time, translation, rotation: [0, 0, z] };
    }),
  }));
  rig.clips.push({ id: IDLE_CLIP_ID, name: '대기 · 호흡과 상체 무게 이동', duration: 2, fps: 24, loop: true, tracks });
  rig.id = 'hell-aberrant-tail-idle-transition-r6';
  rig.name = '지옥기형 · 대기와 꼬리치기 전환';
  rig.preview.clipId = IDLE_CLIP_ID; rig.preview.time = 0; rig.preview.playing = false;
  rig.provenance.idleTransition = { authority: 'ENGINE_AUTHORING', revision: 'r6', idleClipId: IDLE_CLIP_ID,
    idleDurationSeconds: 2, idleFps: 24, keyTimes: IDLE_TIMES, breath: IDLE_BREATH, sway: IDLE_SWAY,
    entryTransitionSeconds: ATTACK_ENTRY_SECONDS, returnTransitionSeconds: IDLE_RETURN_SECONDS,
    originalAttackClipsChanged: false, meshWeightsSkeletonChanged: false, nativeCombatApplied: false };
  scene.id = 'hell-aberrant-tail-idle-scene-r6'; scene.name = rig.name;
  scene.rigScene.resources[0].name = rig.name;
  const node = scene.rigScene.nodes[0];
  node.clipId = IDLE_CLIP_ID; node.time = 0; node.transition = null;
  node.returnTo = { clipId: IDLE_CLIP_ID, transitionSeconds: IDLE_RETURN_SECONDS };
  Object.assign(scene.rigScene.sequence, { id: 'hell-aberrant-tail-idle-impact-r6', authoredBy: 'FDG idle/attack transitions r6',
    autoStart: false, entryTransitionSeconds: ATTACK_ENTRY_SECONDS });
  const validation = validateProject(scene, { geometry: false });
  if (!validation.ok) throw new Error(JSON.stringify(validation.errors));
  return scene;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const out = process.env.FDG_IDLE_OUTPUT || path.join(repo, 'tmp/hell-aberrant-idle-r6');
  const baseline = JSON.parse(await fs.readFile(path.join(repo, 'tools/fdg-studio/fixtures/hell-aberrant-tail-readability.fdg.json'), 'utf8'));
  const scene = buildTailIdleScene(baseline), bodyOnly = structuredClone(scene);
  delete bodyOnly.rigScene.sequence;
  await fs.mkdir(out, { recursive: true });
  for (const [name, value] of [['hell-aberrant-tail-idle.fdg.json', scene], ['hell-aberrant-tail-idle.rig.json', scene.rigScene.resources[0].project], ['body-only-idle.fdg.json', bodyOnly]]) {
    await fs.writeFile(path.join(out, name), JSON.stringify(value));
  }
  console.log(JSON.stringify({ output: out, clips: scene.rigScene.resources[0].project.clips.length, idleTracks: 6, idleKeysPerTrack: 9, sourceImagesRead: 0 }));
}
