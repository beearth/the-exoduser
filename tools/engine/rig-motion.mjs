import {normalizeClip, bindClip} from './animation-clip.mjs?v=20261009-v1';

const preparedMotions = new WeakSet();
const scaledClips = new WeakMap();
function data(object, key) {
  const descriptor = object && Object.getOwnPropertyDescriptor(object, key);
  if (!descriptor || !Object.hasOwn(descriptor, 'value')) throw new TypeError(`motion.${key}: expected data`);
  return descriptor.value;
}

/** Explicit display input; time is supplied by the caller, never advanced here. */
export function prepareRigMotion(input, {height, rootTarget, artworkOnly = false}) {
  if (input === undefined || input === null) return null;
  if (typeof input !== 'object' || Array.isArray(input)) throw new TypeError('motion: expected an object');
  const clip = normalizeClip(data(input, 'clip'));
  const authoredHeight = data(input, 'authoredHeight'), time = data(input, 'time');
  if (!Number.isFinite(height) || height <= 0 || !Number.isFinite(authoredHeight) || authoredHeight <= 0 || authoredHeight > 20 || !Number.isFinite(time)) {
    throw new TypeError('motion: finite time and authoredHeight in (0,20] required');
  }
  if (artworkOnly && clip.tracks.some(track => track.target !== rootTarget || track.property !== 'position')) {
    throw new TypeError('Borrowed artwork permits whole-object position tracks only');
  }
  const ratio = height / authoredHeight;
  if (!Number.isFinite(ratio)) throw new TypeError('motion: height ratio must be finite');
  let versions = scaledClips.get(clip);
  if (!versions) scaledClips.set(clip, versions = new Map());
  let scaled = versions.get(ratio);
  if (!scaled) {
    scaled = normalizeClip({...clip, tracks: clip.tracks.map(track => track.property !== 'position' ? track : {
      ...track, keys: track.keys.map(key => ({time: key.time, value: key.value.map(value => value * ratio)})),
    })});
    if (versions.size >= 8) versions.delete(versions.keys().next().value);
    versions.set(ratio, scaled);
  }
  const motion = Object.freeze({clip: scaled, sourceClip: clip, authoredHeight, height, ratio, time});
  preparedMotions.add(motion);
  return motion;
}

/** Restore before the base pose; apply after it and before publishing matrices. */
export function createRigMotion(resolveTarget) {
  if (typeof resolveTarget !== 'function') throw new TypeError('resolveTarget must be a function');
  let player = null, selected = null, last = null, disposed = false;
  function check(motion) {
    if (disposed) throw new Error('Rig motion is disposed');
    if (motion !== null && !preparedMotions.has(motion)) throw new TypeError('Expected a prepared rig motion');
  }
  function beforePose(motion) {
    check(motion); last = null;
    if (player && selected !== motion?.clip) {
      const previous = player; player = null; selected = null; previous.dispose();
    } else player?.restore();
  }
  function afterPose(motion) {
    check(motion);
    if (!motion) return;
    if (!player) {player = bindClip(motion.clip, resolveTarget); selected = motion.clip;}
    else if (selected !== motion.clip) throw new Error('beforePose must precede clip changes');
    const result = player.seek(motion.time);
    last = Object.freeze({name: motion.sourceClip.name, time: result.time, durationSeconds: motion.sourceClip.durationSeconds,
      authoredHeight: motion.authoredHeight, height: motion.height, positionScale: motion.ratio, trackCount: motion.clip.tracks.length});
  }
  function snapshot() {return last;}
  function dispose() {
    if (disposed) return false;
    disposed = true; last = null; selected = null;
    const previous = player; player = null; resolveTarget = null; previous?.dispose(); return true;
  }
  return Object.freeze({beforePose, afterPose, snapshot, dispose});
}
