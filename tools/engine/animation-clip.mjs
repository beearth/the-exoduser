/**
 * EXODUSER keyframe data and transform playback. No renderer, clock or storage.
 * sampleClip()/seek() return {time, tracks:[{target, property, value:[x,y,z]}]}.
 * Rotation values are radians, interpolated directly without angle wrapping.
 */

const FORMAT = 'exoduser-animation-clip';
const PROPERTIES = new Set(['position', 'rotation', 'scale']);
const INTERPOLATIONS = new Set(['linear', 'smooth', 'step']);
const normalizedClips = new WeakSet();

function fail(path, message) {
  throw new TypeError(`${path}: ${message}`);
}

function record(value, path) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail(path, 'expected a plain object');
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail(path, 'expected a plain object');
  }
  return value;
}

// JSON fields must be data, not inherited values or accessor callbacks.
function field(value, key, path, optional = false) {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor) {
    if (optional) return undefined;
    fail(path, 'missing value');
  }
  if (!Object.hasOwn(descriptor, 'value')) fail(path, 'expected a data value');
  return descriptor.value;
}

function finite(value, path) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(path, 'expected a finite number');
  }
  return value;
}

function nonempty(value, path, maximum = Infinity) {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum) {
    fail(path, `expected a nonempty string${maximum === Infinity ? '' : ` of at most ${maximum} characters`}`);
  }
  return value;
}

function vector(value, path, positive = false) {
  if (!Array.isArray(value) || value.length !== 3) fail(path, 'expected [x, y, z]');
  const result = [];
  for (let component = 0; component < 3; component++) {
    const number = finite(field(value, component, `${path}[${component}]`), `${path}[${component}]`);
    if (positive && number <= 0) fail(`${path}[${component}]`, 'scale must be positive');
    result.push(number);
  }
  return Object.freeze(result);
}

/** Validate and copy raw JSON into a deeply frozen, reusable clip. */
export function normalizeClip(raw) {
  if (raw !== null && typeof raw === 'object' && normalizedClips.has(raw)) return raw;
  record(raw, 'clip');
  if (field(raw, 'format', 'clip.format') !== FORMAT) fail('clip.format', `expected ${FORMAT}`);
  if (field(raw, 'version', 'clip.version') !== 1) fail('clip.version', 'expected 1');
  const name = nonempty(field(raw, 'name', 'clip.name'), 'clip.name');
  const durationSeconds = finite(field(raw, 'durationSeconds', 'clip.durationSeconds'), 'clip.durationSeconds');
  if (durationSeconds < 0.01 || durationSeconds > 600) fail('clip.durationSeconds', 'expected 0.01..600');
  const sourceTracks = field(raw, 'tracks', 'clip.tracks');
  if (!Array.isArray(sourceTracks) || sourceTracks.length > 256) fail('clip.tracks', 'expected an array of at most 256 tracks');
  const tracks = [];
  const channels = new Map();
  let totalKeys = 0;
  for (let index = 0; index < sourceTracks.length; index++) {
    const path = `clip.tracks[${index}]`;
    const source = record(field(sourceTracks, index, path), path);
    const target = nonempty(field(source, 'target', `${path}.target`), `${path}.target`, 200);
    const property = field(source, 'property', `${path}.property`);
    if (!PROPERTIES.has(property)) fail(`${path}.property`, 'expected position, rotation or scale');
    const requestedInterpolation = field(source, 'interpolation', `${path}.interpolation`, true);
    const interpolation = requestedInterpolation === undefined ? 'linear' : requestedInterpolation;
    if (!INTERPOLATIONS.has(interpolation)) fail(`${path}.interpolation`, 'expected linear, smooth or step');
    let targetChannels = channels.get(target);
    if (!targetChannels) channels.set(target, targetChannels = new Set());
    if (targetChannels.has(property)) fail(path, 'duplicate target and property');
    targetChannels.add(property);
    const sourceKeys = field(source, 'keys', `${path}.keys`);
    if (!Array.isArray(sourceKeys) || sourceKeys.length < 1 || sourceKeys.length > 4096) {
      fail(`${path}.keys`, 'expected 1..4096 keys');
    }
    totalKeys += sourceKeys.length;
    if (totalKeys > 20000) fail('clip.tracks', 'total key count exceeds 20000');
    const keys = [];
    let previousTime = -1;
    for (let keyIndex = 0; keyIndex < sourceKeys.length; keyIndex++) {
      const keyPath = `${path}.keys[${keyIndex}]`;
      const sourceKey = record(field(sourceKeys, keyIndex, keyPath), keyPath);
      const time = finite(field(sourceKey, 'time', `${keyPath}.time`), `${keyPath}.time`);
      if (time < 0 || time > durationSeconds || time <= previousTime) {
        fail(`${keyPath}.time`, 'expected strictly increasing times in 0..durationSeconds');
      }
      const value = vector(field(sourceKey, 'value', `${keyPath}.value`), `${keyPath}.value`, property === 'scale');
      keys.push(Object.freeze({time, value}));
      previousTime = time;
    }
    tracks.push(Object.freeze({target, property, interpolation, keys: Object.freeze(keys)}));
  }
  const clip = Object.freeze({format: FORMAT, version: 1, name, durationSeconds, tracks: Object.freeze(tracks)});
  normalizedClips.add(clip);
  return clip;
}

function interpolate(a, b, fraction) {
  if (fraction <= 0 || a === b) return a;
  if (fraction >= 1) return b;
  const difference = b - a;
  // Opposite extreme finite values may have an infinite difference.
  const value = Number.isFinite(difference)
    ? a + difference * fraction
    : a * (1 - fraction) + b * fraction;
  return Math.min(Math.max(value, Math.min(a, b)), Math.max(a, b));
}

function sampleTrack(track, time) {
  const keys = track.keys;
  if (time <= keys[0].time) return keys[0].value;
  if (time >= keys[keys.length - 1].time) return keys[keys.length - 1].value;
  let left = 0;
  let right = keys.length - 1;
  while (right - left > 1) {
    const middle = (left + right) >>> 1;
    if (keys[middle].time <= time) left = middle;
    else right = middle;
  }
  const before = keys[left];
  const after = keys[right];
  if (track.interpolation === 'step' || time === before.time) return before.value;
  let fraction = (time - before.time) / (after.time - before.time);
  if (track.interpolation === 'smooth') fraction = fraction * fraction * (3 - 2 * fraction);
  return Object.freeze(before.value.map((value, axis) => interpolate(value, after.value[axis], fraction)));
}

/** Pure, clamped sampling. Repeated seeks never accumulate transform deltas. */
export function sampleClip(rawClip, time) {
  const clip = normalizeClip(rawClip);
  finite(time, 'time');
  const clampedTime = Math.min(clip.durationSeconds, Math.max(0, time));
  const tracks = clip.tracks.map(track => Object.freeze({
    target: track.target,
    property: track.property,
    value: sampleTrack(track, clampedTime),
  }));
  return Object.freeze({time: clampedTime, tracks: Object.freeze(tracks)});
}

function readChannel(channel, path) {
  return Object.freeze([
    finite(channel.x, `${path}.x`),
    finite(channel.y, `${path}.y`),
    finite(channel.z, `${path}.z`),
  ]);
}

/**
 * Bind existing THREE-like transforms without writing until seek()/restore().
 * snapshot() exposes original values and playback metadata, never live objects.
 * Setters must synchronously apply x/y/z; failures trigger best-effort rollback.
 */
export function bindClip(rawClip, resolveTarget) {
  const clip = normalizeClip(rawClip);
  if (typeof resolveTarget !== 'function') fail('resolveTarget', 'expected a function');
  const resolvedNames = new Map();
  const resolvedChannels = new Map();
  let bindings = [];
  for (const track of clip.tracks) {
    let target;
    if (resolvedNames.has(track.target)) target = resolvedNames.get(track.target);
    else {
      target = resolveTarget(track.target);
      if (target === null || typeof target !== 'object') fail(track.target, 'target did not resolve to an object');
      resolvedNames.set(track.target, target);
    }
    let properties = resolvedChannels.get(target);
    if (!properties) resolvedChannels.set(target, properties = new Set());
    if (properties.has(track.property)) fail(track.target, `ambiguous alias for ${track.property}`);
    properties.add(track.property);
    const channel = target[track.property];
    if (channel === null || typeof channel !== 'object') fail(`${track.target}.${track.property}`, 'missing transform');
    const setter = channel.set;
    if (typeof setter !== 'function') fail(`${track.target}.${track.property}.set`, 'expected a function');
    const original = readChannel(channel, `${track.target}.${track.property}`);
    bindings.push({target, channel, setter, original, name: track.target, property: track.property});
  }
  // All resolution and capture have completed; no transform has been written.
  resolvedNames.clear();
  resolvedChannels.clear();
  const originals = Object.freeze(bindings.map(binding => Object.freeze({
    target: binding.name,
    property: binding.property,
    original: binding.original,
  })));
  let disposed = false;
  let applying = false;
  let applied = false;
  let lastTime = null;

  function assertIdle() {
    if (applying) throw new Error('Animation clip operation is reentrant');
  }

  function applyValues(values) {
    assertIdle();
    applying = true;
    const before = [];
    let attempted = 0;
    try {
      // Reject replaced channels and capture every rollback value before writes.
      for (const binding of bindings) {
        if (binding.target[binding.property] !== binding.channel || binding.channel.set !== binding.setter) {
          throw new Error(`Animation target changed: ${binding.name}.${binding.property}`);
        }
        before.push(readChannel(binding.channel, `${binding.name}.${binding.property}`));
      }
      for (let index = 0; index < bindings.length; index++) {
        const binding = bindings[index];
        attempted = index + 1;
        binding.setter.call(binding.channel, ...values[index]);
      }
    } catch (error) {
      const errors = [error];
      for (let index = attempted - 1; index >= 0; index--) {
        try {
          bindings[index].setter.call(bindings[index].channel, ...before[index]);
        } catch (rollbackError) {
          errors.push(rollbackError);
        }
      }
      if (errors.length > 1) throw new AggregateError(errors, 'Animation write and rollback failed');
      throw error;
    } finally {
      applying = false;
    }
  }

  function seek(time) {
    if (disposed) throw new Error('Animation clip binding is disposed');
    assertIdle();
    const sample = sampleClip(clip, time);
    applyValues(sample.tracks.map(track => track.value));
    lastTime = sample.time;
    applied = true;
    return sample;
  }

  function restore() {
    assertIdle();
    if (disposed) return false;
    applyValues(bindings.map(binding => binding.original));
    lastTime = null;
    applied = false;
    return true;
  }

  function dispose() {
    assertIdle();
    if (disposed) return false;
    disposed = true;
    try {
      applyValues(bindings.map(binding => binding.original));
      lastTime = null;
      applied = false;
      return true;
    } finally {
      // Release target references even if an external setter prevents restore.
      bindings = [];
    }
  }

  function snapshot() {
    return Object.freeze({
      name: clip.name,
      durationSeconds: clip.durationSeconds,
      trackCount: clip.tracks.length,
      time: lastTime,
      applied,
      disposed,
      tracks: originals,
    });
  }

  return Object.freeze({seek, restore, dispose, snapshot});
}
