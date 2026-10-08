const clips = new WeakSet();
function data(object, key) {
  const d = object && Object.getOwnPropertyDescriptor(object, key);
  if (!d || !Object.hasOwn(d, 'value')) throw new TypeError(`spriteClip.${key}: expected own data`);
  return d.value;
}

/** A single-shot, step-sampled atlas clip. The caller owns its clock and sheet. */
export function createSpriteClip(input) {
  const name = data(input, 'name'), frameCount = data(input, 'frameCount');
  const durationSeconds = data(input, 'durationSeconds'), source = data(input, 'keys');
  if (typeof name !== 'string' || !name.trim() || name.length > 200 ||
      !Number.isSafeInteger(frameCount) || frameCount < 1 || frameCount > 256 ||
      !Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 3600 ||
      !Array.isArray(source) || source.length < 1 || source.length > 4096) {
    throw new TypeError('Invalid sprite clip name, frameCount, duration or keys');
  }
  let previous = -1;
  const keys = [];
  for (let i = 0; i < source.length; i++) {
    const key = data(source, i), time = data(key, 'time'), frame = data(key, 'frame');
    if (!Number.isFinite(time) || time < 0 || time > durationSeconds || time <= previous ||
        (i === 0 && time !== 0) || !Number.isSafeInteger(frame) || frame < 0 || frame >= frameCount) {
      throw new TypeError('Sprite keys require first time 0, increasing times and in-range frames');
    }
    previous = time; keys.push(Object.freeze({time, frame}));
  }
  const clip = Object.freeze({format:'exoduser-sprite-clip', version:1, name, frameCount, durationSeconds, keys:Object.freeze(keys)});
  clips.add(clip); return clip;
}

export function sampleSpriteClip(clip, time) {
  if (!clips.has(clip) || !Number.isFinite(time)) throw new TypeError('Expected a created sprite clip and finite time');
  const t = Math.max(0, Math.min(clip.durationSeconds, time));
  let low = 0, high = clip.keys.length;
  while (low + 1 < high) {
    const mid = (low + high) >>> 1;
    if (clip.keys[mid].time <= t) low = mid; else high = mid;
  }
  return clip.keys[low].frame;
}
