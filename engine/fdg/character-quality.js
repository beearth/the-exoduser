/** Pure pixel inspection for authored character drafts; this never approves the art. */
export const QUALITY_TARGET = Object.freeze({ frames: 24, fps: 24 });
export const MAX_CHARACTER_PIXELS = 16_000_000;
export const MAX_CHARACTER_FRAMES = 256;
const MAX_FPS = 120;
const EPSILON = 1e-9;
const RGBA_CHANNELS = 4;
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const LUMA = Object.freeze([0.2126, 0.7152, 0.0722]);

function integer(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) throw new RangeError(`${name} must be a positive safe integer.`);
  return value;
}

function validateClip(clip) {
  if (!clip || typeof clip !== 'object' || Array.isArray(clip)) throw new TypeError('A character clip object is required.');
  const frameWidth = integer(clip.frameWidth, 'clip.frameWidth');
  const frameHeight = integer(clip.frameHeight, 'clip.frameHeight');
  const columns = integer(clip.columns, 'clip.columns');
  const rows = integer(clip.rows, 'clip.rows');
  const frames = integer(clip.frames, 'clip.frames');
  if (columns * rows > MAX_CHARACTER_FRAMES || frames > columns * rows) throw new RangeError(`clip.frames must fit its grid, whose capacity is at most ${MAX_CHARACTER_FRAMES}.`);
  if (!Number.isFinite(clip.fps) || clip.fps <= 0 || clip.fps > MAX_FPS) throw new RangeError(`clip.fps must be greater than 0 and at most ${MAX_FPS}.`);
  const width = frameWidth * columns, height = frameHeight * rows;
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height)
    || !Number.isSafeInteger(width * height) || width * height > MAX_CHARACTER_PIXELS) {
    throw new RangeError(`The declared clip atlas must be at most ${MAX_CHARACTER_PIXELS} pixels.`);
  }
  return { frameWidth, frameHeight, columns, rows, frames, fps: clip.fps, width, height };
}

function rectangle(clip, index) {
  return { sx: index % clip.columns * clip.frameWidth, sy: Math.floor(index / clip.columns) * clip.frameHeight,
    sw: clip.frameWidth, sh: clip.frameHeight };
}

/** Return a zero-based source cell. Invalid indexes are rejected, never silently wrapped. */
export function draftFrame(clip, index) {
  const checked = validateClip(clip);
  if (!Number.isSafeInteger(index) || index < 0 || index >= checked.frames) throw new RangeError('Frame index is outside the declared clip.');
  return rectangle(checked, index);
}

/** 24FPS by default; non-looping timing keeps frame 23 visible after one second. */
export function frameIndex(seconds, { frames = QUALITY_TARGET.frames, fps = QUALITY_TARGET.fps, loop = false } = {}) {
  integer(frames, 'frames');
  if (frames > MAX_CHARACTER_FRAMES) throw new RangeError(`frames must be at most ${MAX_CHARACTER_FRAMES}.`);
  if (!Number.isFinite(fps) || fps <= 0 || fps > MAX_FPS) throw new RangeError(`fps must be greater than 0 and at most ${MAX_FPS}.`);
  if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('seconds must be finite and non-negative.');
  if (typeof loop !== 'boolean') throw new TypeError('loop must be boolean.');
  if (!loop) return seconds >= frames / fps ? frames - 1 : Math.min(frames - 1, Math.floor(seconds * fps + EPSILON));
  // Reduce first to keep products of very large finite seconds within safe arithmetic.
  const tick = Math.floor(seconds % (frames / fps) * fps + EPSILON);
  return tick % frames;
}

function validatePixels(image, clip) {
  if (!image || typeof image !== 'object') throw new TypeError('RGBA pixel data is required.');
  const width = integer(image.width, 'image.width'), height = integer(image.height, 'image.height');
  const area = width * height;
  if (!Number.isSafeInteger(area) || area > MAX_CHARACTER_PIXELS) throw new RangeError(`RGBA image must be at most ${MAX_CHARACTER_PIXELS} pixels.`);
  if (width !== clip.width || height !== clip.height) throw new RangeError('RGBA image dimensions do not match the declared clip atlas.');
  if (!(image.data instanceof Uint8Array) && !(image.data instanceof Uint8ClampedArray)) throw new TypeError('RGBA data must be a Uint8Array or Uint8ClampedArray.');
  if (typeof SharedArrayBuffer !== 'undefined' && image.data.buffer instanceof SharedArrayBuffer) throw new TypeError('Shared RGBA buffers are not deterministic inspection input.');
  if (image.data.length !== area * RGBA_CHANNELS) throw new RangeError('RGBA data length must equal width × height × 4.');
  return { data: image.data, width, height, area };
}

function luminance(data, offset) {
  return (data[offset] * LUMA[0] + data[offset + 1] * LUMA[1] + data[offset + 2] * LUMA[2]) / 255 * data[offset + 3] / 255;
}

function inspectFrame(image, clip, index) {
  const rect = rectangle(clip, index), area = rect.sw * rect.sh;
  const { data, width } = image;
  let hash = FNV_OFFSET;
  let opaquePixels = 0, transparentPixels = 0, partialAlphaPixels = 0, alphaTotal = 0;
  let minX = rect.sw, minY = rect.sh, maxX = -1, maxY = -1;
  let lumaTotal = 0, borderAlphaPixels = 0;
  for (let y = 0; y < rect.sh; y += 1) {
    let offset = ((rect.sy + y) * width + rect.sx) * RGBA_CHANNELS;
    for (let x = 0; x < rect.sw; x += 1, offset += RGBA_CHANNELS) {
      for (let channel = 0; channel < RGBA_CHANNELS; channel += 1) hash = Math.imul(hash ^ data[offset + channel], FNV_PRIME) >>> 0;
      const alpha = data[offset + 3];
      alphaTotal += alpha;
      if (alpha === 255) opaquePixels += 1;
      else if (alpha === 0) transparentPixels += 1;
      else partialAlphaPixels += 1;
      if (alpha > 0) {
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        if (x === 0 || y === 0 || x === rect.sw - 1 || y === rect.sh - 1) borderAlphaPixels += 1;
      }
      lumaTotal += luminance(data, offset);
    }
  }
  const empty = maxX < 0;
  const hasTransparency = transparentPixels + partialAlphaPixels > 0;
  const touchesBorder = borderAlphaPixels > 0;
  return { index, rect, hash: hash.toString(16).padStart(8, '0'), empty, hasTransparency,
    visiblePixels: area - transparentPixels, opaquePixels, transparentPixels, partialAlphaPixels,
    alphaBounds: empty ? null : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
    touchesBorder, cropBorder: hasTransparency && touchesBorder, borderAlphaPixels,
    normalizedLuminance: lumaTotal / area, normalizedAlpha: alphaTotal / (area * 255),
    duplicateOf: null };
}

function sameFrame(image, left, right) {
  const { data, width } = image;
  for (let y = 0; y < left.sh; y += 1) {
    let a = ((left.sy + y) * width + left.sx) * RGBA_CHANNELS;
    let b = ((right.sy + y) * width + right.sx) * RGBA_CHANNELS;
    for (let byte = 0; byte < left.sw * RGBA_CHANNELS; byte += 1) if (data[a + byte] !== data[b + byte]) return false;
  }
  return true;
}

function difference(image, perFrame, from, to) {
  const left = perFrame[from].rect, right = perFrame[to].rect;
  const { data, width } = image, area = left.sw * left.sh;
  let changedPixels = 0, absoluteRgba = 0, absoluteLuma = 0, absoluteAlpha = 0;
  for (let y = 0; y < left.sh; y += 1) {
    let a = ((left.sy + y) * width + left.sx) * RGBA_CHANNELS;
    let b = ((right.sy + y) * width + right.sx) * RGBA_CHANNELS;
    for (let x = 0; x < left.sw; x += 1, a += RGBA_CHANNELS, b += RGBA_CHANNELS) {
      let changed = false;
      for (let channel = 0; channel < RGBA_CHANNELS; channel += 1) {
        const delta = Math.abs(data[a + channel] - data[b + channel]);
        absoluteRgba += delta;
        if (delta) changed = true;
      }
      if (changed) changedPixels += 1;
      absoluteLuma += Math.abs(luminance(data, a) - luminance(data, b));
      absoluteAlpha += Math.abs(data[a + 3] - data[b + 3]);
    }
  }
  return { from, to, changedPixels, changingPixels: changedPixels / area, exact: changedPixels === 0,
    normalizedRgbaDifference: absoluteRgba / (area * RGBA_CHANNELS * 255),
    luminanceDifference: absoluteLuma / area, alphaDifference: absoluteAlpha / (area * 255) };
}

/** Read raw RGBA facts. Hash matches are confirmed byte-for-byte before grouping. */
export function inspectCharacterPixels(image, clip) {
  const checked = validateClip(clip), pixels = validatePixels(image, checked);
  const perFrame = Array.from({ length: checked.frames }, (_, index) => inspectFrame(pixels, checked, index));
  const hashBuckets = new Map(), groups = [];
  for (const frame of perFrame) {
    const bucket = hashBuckets.get(frame.hash) || [];
    let group = bucket.find(candidate => sameFrame(pixels, perFrame[candidate.indices[0]].rect, frame.rect));
    if (group) { group.indices.push(frame.index); frame.duplicateOf = group.indices[0]; }
    else {
      group = { hash: frame.hash, indices: [frame.index] };
      bucket.push(group); groups.push(group); hashBuckets.set(frame.hash, bucket);
    }
  }
  const duplicateGroups = groups.filter(group => group.indices.length > 1);
  const emptyFrames = perFrame.filter(frame => frame.empty).map(frame => frame.index);
  const cropBorderFrames = perFrame.filter(frame => frame.cropBorder).map(frame => frame.index);
  const opaqueFrames = perFrame.filter(frame => !frame.hasTransparency).map(frame => frame.index);
  const errors = [], warnings = [];
  if (checked.frames !== QUALITY_TARGET.frames) errors.push({ code: 'frame-target', message: `Declared ${checked.frames} frames; the quality target is ${QUALITY_TARGET.frames}.` });
  if (checked.fps !== QUALITY_TARGET.fps) errors.push({ code: 'fps-target', message: `Declared ${checked.fps}FPS; the quality target is ${QUALITY_TARGET.fps}FPS.` });
  if (emptyFrames.length) errors.push({ code: 'empty-frames', message: 'Some cells have no visible alpha pixels.', frames: emptyFrames });
  if (duplicateGroups.length) warnings.push({ code: 'duplicate-frames', message: `${groups.length} exact distinct RGBA frames across ${checked.frames} declared cells.`, frames: duplicateGroups.flatMap(group => group.indices) });
  if (cropBorderFrames.length) warnings.push({ code: 'alpha-border', message: 'Visible alpha touches a cell border; inspect possible cropping.', frames: cropBorderFrames });
  if (opaqueFrames.length) warnings.push({ code: 'opaque-background', message: 'Opaque RGB/video background has no transparent pixels; background and crop quality need visual review.', frames: opaqueFrames });
  const adjacent = Array.from({ length: checked.frames - 1 }, (_, index) => difference(pixels, perFrame, index, index + 1));
  const loop = difference(pixels, perFrame, checked.frames - 1, 0);
  return {
    technical: { status: errors.length ? 'fail' : warnings.length ? 'review' : 'pass', errors, warnings },
    subjectiveStatus: 'unreviewed', declaredFrames: checked.frames, distinctFrameCount: groups.length,
    duplicateGroups, perFrame, adjacent, loop,
    target: { ...QUALITY_TARGET, declaredFramesMet: checked.frames === QUALITY_TARGET.frames,
      fpsMet: checked.fps === QUALITY_TARGET.fps, distinctFramesMet: groups.length >= QUALITY_TARGET.frames },
    summary: { width: pixels.width, height: pixels.height, pixels: pixels.area, fps: checked.fps,
      duration: checked.frames / checked.fps, emptyFrames, cropBorderFrames, opaqueFrames,
      hasTransparency: perFrame.some(frame => frame.hasTransparency),
      adjacentChangedPixels: adjacent.reduce((sum, delta) => sum + delta.changedPixels, 0),
      meanAdjacentChangingPixels: adjacent.length ? adjacent.reduce((sum, delta) => sum + delta.changingPixels, 0) / adjacent.length : 0 },
  };
}
