// Shared atlas timing/cropping for the editor and the game's existing timeline.
// This module owns no clock, image loader, draw context, or frame duplication.
const clips = new WeakSet();

function positiveSafeInteger(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive safe integer`);
  }
  return value;
}

function requireClip(clip) {
  if (!clips.has(clip)) {
    throw new TypeError('clip must be created by createAtlasClip');
  }
}

/** Create an immutable row-major clip; unused atlas cells are not frames. */
export function createAtlasClip({ columns, rows, frameCount, fps, loop = false }) {
  positiveSafeInteger(columns, 'columns');
  positiveSafeInteger(rows, 'rows');
  positiveSafeInteger(frameCount, 'frameCount');
  const capacity = columns * rows;
  if (!Number.isSafeInteger(capacity) || frameCount > capacity) {
    throw new RangeError('frameCount must fit a safe-integer atlas capacity');
  }
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new RangeError('fps must be finite and greater than zero');
  }
  if (typeof loop !== 'boolean') {
    throw new TypeError('loop must be a boolean');
  }
  const clip = Object.freeze({
    columns, rows, frameCount, fps, loop,
    durationSeconds: frameCount / fps,
  });
  clips.add(clip);
  return clip;
}

/** Sample elapsed game/editor seconds without advancing or retaining a clock. */
export function sampleAtlasClip(clip, elapsedSeconds) {
  requireClip(clip);
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
    throw new RangeError('elapsedSeconds must be finite and nonnegative');
  }
  const last = clip.frameCount - 1;
  if (!clip.loop && elapsedSeconds >= clip.durationSeconds) {
    return { frame: last, nextFrame: last, mix: 0, ended: true };
  }
  // Reduce time first so finite elapsed/fps cannot overflow when looping.
  // An infinite duration is possible for a valid extremely small finite fps;
  // no representable finite elapsed time can complete that clip.
  const time = clip.loop && Number.isFinite(clip.durationSeconds)
    ? elapsedSeconds % clip.durationSeconds : elapsedSeconds;
  const position = time * clip.fps;
  const phase = clip.loop ? position % clip.frameCount : position;
  const frame = Math.min(last, Math.floor(phase));
  return {
    frame,
    nextFrame: frame < last ? frame + 1 : (clip.loop ? 0 : last),
    mix: phase >= clip.frameCount ? 0 : phase - frame,
    ended: false,
  };
}

/** Validate intrinsic image capacity and return one inset source rectangle. */
export function getAtlasFrameRect(image, clip, frame, inset = 1) {
  requireClip(clip);
  if (!image || (typeof image !== 'object' && typeof image !== 'function')) {
    throw new TypeError('image must expose intrinsic pixel dimensions');
  }
  const hasNaturalSize = 'naturalWidth' in image || 'naturalHeight' in image;
  const width = positiveSafeInteger(
    hasNaturalSize ? image.naturalWidth : image.width, 'image width',
  );
  const height = positiveSafeInteger(
    hasNaturalSize ? image.naturalHeight : image.height, 'image height',
  );
  if (width % clip.columns !== 0 || height % clip.rows !== 0) {
    throw new RangeError('intrinsic image dimensions must divide the atlas grid');
  }
  if (!Number.isSafeInteger(frame) || frame < 0 || frame >= clip.frameCount) {
    throw new RangeError('frame must be a valid zero-based clip frame');
  }
  const cellWidth = width / clip.columns;
  const cellHeight = height / clip.rows;
  if (!Number.isFinite(inset) || inset < 0
      || inset >= cellWidth / 2 || inset >= cellHeight / 2) {
    throw new RangeError('inset must be finite, nonnegative and leave a positive cell');
  }
  return {
    sx: (frame % clip.columns) * cellWidth + inset,
    sy: Math.floor(frame / clip.columns) * cellHeight + inset,
    sw: cellWidth - 2 * inset,
    sh: cellHeight - 2 * inset,
  };
}
