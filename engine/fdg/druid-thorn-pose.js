export const DRUID_THORN_FAN_CLIP_ID = 'dark-druid-native-thorn-fan-first';
export const DRUID_THORN_FAN_MARKERS = Object.freeze({
  windStart: 0, releaseStart: 1, releaseEnd: 1.12, followEnd: 1.3, recoverEnd: 1.6,
});
export const DRUID_THORN_RECOVER_FRAMES = 20;
const TIMES = Object.freeze([0, .55, 1, 1.12, 1.3, 1.6]);
const clamp = value => Math.max(0, Math.min(1, value));

/** Bind-relative offsets only. Existing mesh, weights, bones and source clips stay owned by the rig. */
export function createDruidThornFanClip(rig) {
  const bones = new Map((rig?.skeleton?.bones || []).map(bone => [bone.id, bone]));
  const definitions = [
    ['pelvis', [0, .012, .025, -.035, -.008, 0], [[0, 0, 0], [-.008, -.008, 0], [-.015, -.015, 0], [.018, -.012, 0], [.006, 0, 0], [0, 0, 0]]],
    ['spine', [0, .015, .035, -.045, -.01, 0], [[0, 0, 0], [-.006, .006, 0], [-.014, .012, 0], [.035, -.014, 0], [.008, 0, 0], [0, 0, 0]]],
    ['chest', [0, .015, .025, -.025, -.005, 0]],
    ['leftUpperArm', [0, -.28, -.5, .62, .16, 0]],
    ['leftForearm', [0, .08, .1, .2, -.08, 0]],
    ['leftHand', [0, .05, .1, -.55, -.12, 0]],
    ['rightUpperArm', [0, -.04, -.12, .3, .06, 0]],
    ['rightForearm', [0, -.08, -.2, .25, .04, 0]],
    ['coatLeft', [0, .01, .025, -.015, -.09, 0]],
    ['coatRight', [0, -.008, -.02, .012, .075, 0]],
    ['coatFront', [0, .005, .012, -.006, -.045, 0]],
    ['coatBack', [0, -.008, -.018, .01, .06, 0]],
  ];
  if (definitions.some(([id]) => !bones.has(id)) || bones.get('staff')?.parent !== 'leftHand') {
    throw new TypeError('Existing Druid arm/coat bones and child hand/staff are required.');
  }
  return {
    id: DRUID_THORN_FAN_CLIP_ID, name: '다크드루이드 · 가시 부채 준비·발사·회복',
    duration: DRUID_THORN_FAN_MARKERS.recoverEnd, fps: 24, loop: false,
    tracks: definitions.map(([boneId, rotations, translations]) => ({
      boneId, keys: TIMES.map((time, index) => ({
        time, translation: translations ? [...translations[index]] : [0, 0, 0], rotation: [0, 0, rotations[index]],
      })),
    })),
  };
}

/** Native timer reader. No independent clock, projectile emission or actor writes. */
export function createDruidThornFanObserver() {
  const traces = new WeakMap();
  const cancel = actor => { if (actor && typeof actor === 'object') traces.delete(actor); };
  return {
    cancel,
    begin(actor, windFrames = actor?.st2) {
      if (!actor || typeof actor !== 'object' || actor.s !== 'bossFanWind'
        || !Number.isFinite(windFrames) || windFrames <= 0) return false;
      traces.set(actor, { windFrames, released: false }); return true;
    },
    sample(actor) {
      const trace = actor && typeof actor === 'object' && traces.get(actor);
      if (!trace) return null;
      if (actor.alive === false || actor.stunned > 0 || actor._hitStun > 0 || !Number.isFinite(actor.st2)) {
        cancel(actor); return null;
      }
      let phase, progress, time;
      if (actor.s === 'bossFanWind' && !trace.released) {
        phase = 'wind'; progress = clamp(1 - actor.st2 / trace.windFrames);
        time = DRUID_THORN_FAN_MARKERS.windStart + progress * DRUID_THORN_FAN_MARKERS.releaseStart;
      } else if (actor.s === 'recover') {
        trace.released = true;
        // Fan emits on the native transition to recover/45; the next boss update clamps to20.
        progress = clamp(1 - Math.min(actor.st2, DRUID_THORN_RECOVER_FRAMES) / DRUID_THORN_RECOVER_FRAMES);
        time = DRUID_THORN_FAN_MARKERS.releaseStart
          + progress * (DRUID_THORN_FAN_MARKERS.recoverEnd - DRUID_THORN_FAN_MARKERS.releaseStart);
        phase = time <= DRUID_THORN_FAN_MARKERS.releaseEnd ? 'release'
          : time <= DRUID_THORN_FAN_MARKERS.followEnd ? 'follow' : 'recover';
      } else { cancel(actor); return null; }
      return { phase, progress, time, windFrames: trace.windFrames,
        facing: Number.isFinite(actor.facing) ? actor.facing : 0, clipId: DRUID_THORN_FAN_CLIP_ID };
    },
  };
}
