import { isLocalAsset } from './project.js';

// Already-normalized, approved source images only. This module owns no image loader,
// input, clock, scene lifecycle, or production height/nav interpretation.
const MAX_LAYERS = 128;
const WORLD_EDGE = 8192;
const RESERVED_IDS = new Set(['__proto__', 'prototype', 'constructor']);
const finiteRect = value => Array.isArray(value) && value.length === 4 &&
  [0, 1, 2, 3].every(index => Number.isFinite(value[index]));

export function validateSourceImageLayers(layers) {
  const errors = [];
  if (!Array.isArray(layers) || layers.length > MAX_LAYERS) {
    return { ok: false, errors: [`layers: an array of 0..${MAX_LAYERS} entries is required`] };
  }
  const ids = new Set();
  for (let index = 0; index < layers.length; index++) {
    const layer = layers[index], path = `layers[${index}]`;
    if (!layer || typeof layer !== 'object' || Array.isArray(layer)) {
      errors.push(`${path}: an image layer object is required`);
      continue;
    }
    if (typeof layer.id !== 'string' || !layer.id.trim() || layer.id.length > 120 ||
        /[\x00-\x1f\x7f]/.test(layer.id) || RESERVED_IDS.has(layer.id)) {
      errors.push(`${path}.id: 1..120 control-free, non-reserved characters are required`);
    } else {
      if (ids.has(layer.id)) errors.push(`${path}.id: duplicate layer id`);
      ids.add(layer.id);
    }
    if (!isLocalAsset(layer.src)) errors.push(`${path}.src: an exact local image path is required`);
    for (const field of ['sourceRect', 'worldRect']) {
      const rect = layer[field];
      if (!finiteRect(rect)) {
        errors.push(`${path}.${field}: four finite numbers are required`);
        continue;
      }
      const [x, y, width, height] = rect;
      if (x < 0 || y < 0 || width <= 0 || height <= 0 ||
          !Number.isFinite(x + width) || !Number.isFinite(y + height)) {
        errors.push(`${path}.${field}: nonnegative XY and positive finite extents are required`);
      } else if (field === 'worldRect' && (x + width > WORLD_EDGE || y + height > WORLD_EDGE)) {
        errors.push(`${path}.worldRect: the rectangle must fit world 0..${WORLD_EDGE}`);
      }
    }
    if (!Number.isFinite(layer.opacity) || layer.opacity < 0 || layer.opacity > 1) {
      errors.push(`${path}.opacity: a finite number within 0..1 is required`);
    }
  }
  return { ok: errors.length === 0, errors };
}

function assertLayers(layers) {
  const result = validateSourceImageLayers(layers);
  if (!result.ok) throw new TypeError(result.errors.join('\n'));
}

export function collectSourceImagePaths(layers) {
  assertLayers(layers);
  // Preserve the exact source path: no URI rewriting or source data mutation.
  return new Set(layers.map(layer => layer.src));
}

function imageFailure(layer, record) {
  if (record?.status !== 'ready') return 'a ready decoded image is required';
  const image = record.image;
  if (!image || !Number.isFinite(image.naturalWidth) || image.naturalWidth <= 0 ||
      !Number.isFinite(image.naturalHeight) || image.naturalHeight <= 0) {
    return 'positive decoded naturalWidth/naturalHeight are required';
  }
  const [x, y, width, height] = layer.sourceRect;
  if (x + width > image.naturalWidth || y + height > image.naturalHeight) {
    return 'sourceRect exceeds the decoded image';
  }
  return null;
}

export function validateReadySourceImages(layers, assetsMap) {
  const result = validateSourceImageLayers(layers);
  if (!result.ok) return result;
  if (!(assetsMap instanceof Map)) return { ok: false, errors: ['assetsMap: a Map of image records is required'] };
  const errors = [];
  for (let index = 0; index < layers.length; index++) {
    const layer = layers[index], failure = imageFailure(layer, assetsMap.get(layer.src));
    if (failure) errors.push(`layers[${index}].src (${layer.src}): ${failure}`);
  }
  return { ok: errors.length === 0, errors };
}

export function drawSourceImageLayers(context, layers, owner, { layersValidated = false } = {}) {
  if (!layersValidated) assertLayers(layers);
  if (!owner || !(owner.assets instanceof Map) || !owner.camera ||
      ![owner.camera.x, owner.camera.y, owner.width, owner.height].every(Number.isFinite) ||
      owner.width < 0 || owner.height < 0) {
    throw new TypeError('Image layer drawing requires owner assets, finite camera XY, and nonnegative CSS dimensions.');
  }
  if (!context || ['save', 'restore', 'beginPath', 'rect', 'clip', 'drawImage'].some(key => typeof context[key] !== 'function')) {
    throw new TypeError('Image layer drawing requires a Canvas2D context.');
  }
  const counts = { drawCalls: 0, drawn: 0, missing: 0 };
  if (!owner.width || !owner.height || !layers.length) return counts;
  const left = owner.camera.x - owner.width / 2, top = owner.camera.y - owner.height / 2;
  const alpha = context.globalAlpha;
  context.save();
  try {
    context.beginPath(); context.rect(0, 0, owner.width, owner.height); context.clip();
    for (const layer of layers) {
      const [worldX, worldY, width, height] = layer.worldRect;
      const x = worldX - left, y = worldY - top;
      if (layer.opacity === 0 || x + width <= 0 || y + height <= 0 || x >= owner.width || y >= owner.height) continue;
      const record = owner.assets.get(layer.src);
      if (imageFailure(layer, record)) { counts.missing++; continue; }
      context.globalAlpha = alpha * layer.opacity;
      context.drawImage(record.image, ...layer.sourceRect, x, y, width, height);
      counts.drawCalls++; counts.drawn++;
    }
  } finally {
    context.restore();
    context.globalAlpha = alpha;
  }
  return counts;
}
