const clips = new WeakSet();
function data(object, key) {
  const d = object && Object.getOwnPropertyDescriptor(object, key);
  if (!d || !Object.hasOwn(d, 'value')) throw new TypeError(`spriteClip.${key}: expected own data`);
  return d.value;
}

/** Project-local atlas metadata; directional clips use one row, linear clips scan the grid. */
export function normalizeSpriteAtlas(input, frameCount) {
  const sourcePath = data(input, 'sourcePath'), columns = data(input, 'columns');
  const rows = data(input, 'rows'), layout = data(input, 'layout');
  const framesPerRow = data(input, 'framesPerRow'), directionRow = data(input, 'directionRow');
  if (typeof sourcePath !== 'string' || sourcePath !== sourcePath.trim() || sourcePath.length > 1000 ||
      !sourcePath.startsWith('assets/') || /[\\?#%:\x00-\x1f\x7f]/.test(sourcePath) ||
      sourcePath.split('/').some(segment => !segment || segment === '.' || segment === '..') ||
      !Number.isSafeInteger(frameCount) || frameCount < 1 ||
      !Number.isSafeInteger(columns) || columns < 1 || !Number.isSafeInteger(rows) || rows < 1 ||
      !Number.isSafeInteger(columns * rows) || !['directional', 'linear'].includes(layout) ||
      !Number.isSafeInteger(framesPerRow) || framesPerRow < 1 || framesPerRow > columns ||
      !Number.isSafeInteger(directionRow) || directionRow < 0 || directionRow >= rows ||
      (layout === 'directional' ? frameCount > framesPerRow :
        framesPerRow !== columns || directionRow !== 0 || frameCount > columns * rows)) {
    throw new TypeError('Invalid sprite atlas path, layout, frame capacity or direction row');
  }
  return Object.freeze({sourcePath, columns, rows, layout, framesPerRow, directionRow});
}

/** A single-shot, step-sampled atlas clip. The caller owns its clock and sheet. */
export function createSpriteClip(input) {
  const name = data(input, 'name'), frameCount = data(input, 'frameCount');
  const durationSeconds = data(input, 'durationSeconds'), source = data(input, 'keys');
  if (typeof name !== 'string' || !name.trim() || name.length > 200 ||
      !Number.isSafeInteger(frameCount) || frameCount < 1 ||
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
  const atlasDescriptor = Object.getOwnPropertyDescriptor(input, 'atlas');
  const atlas = atlasDescriptor ? normalizeSpriteAtlas(data(input, 'atlas'), frameCount) : null;
  const clip = Object.freeze({format:'exoduser-sprite-clip', version:1, name, frameCount, durationSeconds,
    keys:Object.freeze(keys), ...(atlas ? {atlas} : {})});
  clips.add(clip); return clip;
}

/** Integer source crop, validated against the loaded image's actual dimensions. */
export function spriteClipCell(clip, frame, width, height, directionRow) {
  if (!clips.has(clip) || !clip.atlas) throw new TypeError('Expected a created clip with atlas metadata');
  if (directionRow === undefined) directionRow = clip.atlas.directionRow;
  if (!Number.isSafeInteger(frame) || frame < 0 || frame >= clip.frameCount ||
      !Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      width < clip.atlas.columns || height < clip.atlas.rows ||
      !Number.isSafeInteger(directionRow) || directionRow < 0 || directionRow >= clip.atlas.rows ||
      (clip.atlas.layout === 'linear' && directionRow !== 0)) {
    throw new TypeError('Sprite frame or loaded image is outside the atlas capacity');
  }
  const {columns, rows, layout} = clip.atlas;
  const column = layout === 'linear' ? frame % columns : frame;
  const row = layout === 'linear' ? Math.floor(frame / columns) : directionRow;
  const x = Math.floor(column * width / columns), y = Math.floor(row * height / rows);
  return Object.freeze({x, y, width:Math.floor((column + 1) * width / columns) - x,
    height:Math.floor((row + 1) * height / rows) - y, column, row});
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
