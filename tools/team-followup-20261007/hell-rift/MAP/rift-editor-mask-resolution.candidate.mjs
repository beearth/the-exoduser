/* MAP rift editor source-native mask resolution — CH1-RIFT-EDITOR-MASK-RESOLUTION-20261007-MAP-CANDIDATE
 *
 * Isolated candidate ESM for the 2D Canvas mask path only. Does NOT modify map-scene-editor.js / public /
 * editor / main / root gate / other raw / scene / nav / original PNG. Changes NO geometry / scene / nav /
 * global UV / screen placement / cache identity semantics. Owns ONLY its Canvas2D buffer; the borrowed image
 * and its source pixels are never mutated/copied/regenerated.
 *
 * Problem (source:line): tools/map-scene-editor.js maskedPicture():39 builds the mask buffer at
 *   `ratio = 1024 / Math.max(o.width, o.height)` (:43) — a 1024px-of-WORLD intermediate. For a masked object
 *   drawn at world 8000², the 1920² abyss source (hell-rift-abyss-v3.png, SHA ace0c853…) and the 1254²
 *   clean-plate (clean-plate-v1.png, SHA aa64cb7b…) are RESAMPLED down into ≤1024px, adding blur ON TOP of the
 *   separate Three plate 1254²→8000² upscale. This path sizes the buffer to the source crop's NATIVE pixels
 *   instead, so the source is drawn 1:1 (no forced 1024 downsample). The Three plate upscale is a separate concern.
 *
 * Caps (grounded, not invented): source image max 8192px — map-scene-editor.js:31 (im.naturalWidth>8192 reject);
 *   core asset width/height ∈[1,8192] — map-scene-core.js:61. The legacy 1024 is a MEMORY buffer cap
 *   (map-scene-editor.js:37 "eight 1024px buffers"), not a source-resolution SSOT. No new SSOT number is minted here.
 */
export const LEGACY_WORLD_BUFFER_MAX = 1024;     // map-scene-editor.js:43 (world-scaled intermediate)
export const SOURCE_IMAGE_MAX = 8192;            // map-scene-editor.js:31 / map-scene-core.js:61
const finite = (n) => typeof n === 'number' && Number.isFinite(n);

/* Legacy buffer dimensions, for comparison only (what maskedPicture:43 produces). */
export function legacyMaskDimensions(object) {
  if (!finite(object?.width) || !finite(object?.height) || object.width <= 0 || object.height <= 0) throw new Error('객체 크기 오류');
  const ratio = LEGACY_WORLD_BUFFER_MAX / Math.max(object.width, object.height);
  return { width: Math.max(1, Math.round(object.width * ratio)), height: Math.max(1, Math.round(object.height * ratio)) };
}

/* Source-native buffer dimensions = the crop's native pixel size, clamped to the documented 8192 cap. Fail-closed. */
export function sourceNativeMaskDimensions(object, asset, { maxDim = SOURCE_IMAGE_MAX } = {}) {
  if (!object || !Array.isArray(object.mask) || object.mask.length < 3 || object.mask.length > 256) throw new Error('마스크 없음/범위 오류');
  for (const v of object.mask) { if (!Array.isArray(v) || v.length !== 2 || !finite(v[0]) || !finite(v[1]) || v[0] < 0 || v[0] > 1 || v[1] < 0 || v[1] > 1) throw new Error('마스크 점 오류'); }
  if (!finite(object.width) || !finite(object.height) || object.width <= 0 || object.height <= 0) throw new Error('객체 크기 오류(0/NaN)');
  if (!asset || !asset.crop) throw new Error('에셋/crop 없음');
  if (!finite(maxDim) || maxDim <= 0 || maxDim > SOURCE_IMAGE_MAX) throw new Error('maxDim 범위 오류');
  const { x, y, w, h } = asset.crop;
  for (const [n, v] of [['width', asset.width], ['height', asset.height], ['crop.x', x], ['crop.y', y], ['crop.w', w], ['crop.h', h]]) if (!finite(v)) throw new Error(n + ' 비유한(NaN)');
  if (asset.width < 1 || asset.width > SOURCE_IMAGE_MAX || asset.height < 1 || asset.height > SOURCE_IMAGE_MAX) throw new Error('원본 크기 범위 오류');
  if (x < 0 || y < 0 || w < 1 || h < 1 || x + w > asset.width || y + h > asset.height) throw new Error('crop 범위/음수 오류');
  const width = Math.round(w), height = Math.round(h);
  if (width < 1 || height < 1 || width > maxDim || height > maxDim) throw new Error('native 버퍼 크기 fail-closed(0/매우 큰 값): ' + width + 'x' + height);
  return { width, height };
}

export function maskCacheKey(object, asset, native) {
  return JSON.stringify(['source-native-mask-v1', asset.src, asset.crop, object.width, object.height, object.mask, object.maskFeather ?? 0, native.width, native.height]);
}

/* Prepare the source-native mask buffer. createCanvas(w,h) is injected (document.createElement('canvas') in
 * browser) so the dimension/boundary logic is headless-testable. Returns an OWNED buffer + one-shot dispose. */
export function prepareSourceNativeMask({ object, asset, image, createCanvas, maxDim = SOURCE_IMAGE_MAX } = {}) {
  if (typeof createCanvas !== 'function') throw new Error('createCanvas 주입 필요 (owned buffer factory)');
  if (!image || !finite(image.naturalWidth) || !finite(image.naturalHeight)) throw new Error('borrowed image 없음/크기 오류');
  if (image.naturalWidth !== asset?.width || image.naturalHeight !== asset?.height) throw new Error('image 원본 크기와 asset 불일치');
  const native = sourceNativeMaskDimensions(object, asset, { maxDim });   // fail-closed validation
  const { x, y, w, h } = asset.crop;
  const canvas = createCanvas(native.width, native.height);
  if (!canvas || canvas.width !== native.width || canvas.height !== native.height) throw new Error('owned canvas 생성 실패');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2d context 없음');
  ctx.clearRect(0, 0, native.width, native.height);        // outside = alpha 0 by default
  ctx.save();
  ctx.beginPath();
  object.mask.forEach(([u, v], i) => { const px = u * native.width, py = v * native.height; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
  ctx.closePath();
  ctx.clip();                                              // hard clip; feathered alpha is a documented extension needing a real canvas
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, x, y, w, h, 0, 0, native.width, native.height);   // source crop 1:1 into native buffer (no forced 1024)
  ctx.restore();
  let released = false;
  return Object.freeze({
    canvas, width: native.width, height: native.height, cacheKey: maskCacheKey(object, asset, native),
    featherApplied: false, featherPixelPathNeedsRealCanvas: (object.maskFeather ?? 0) > 0,
    dispose() { if (released) return false; released = true; try { canvas.width = 0; canvas.height = 0; } catch { /* once */ } return true; }  // owned buffer only; borrowed image untouched
  });
}

export const RIFT_EDITOR_MASK_RESOLUTION = Object.freeze({
  completionId: 'CH1-RIFT-EDITOR-MASK-RESOLUTION-20261007-MAP-CANDIDATE',
  target: 'tools/map-scene-editor.js maskedPicture():39-67 (2D mask path); replaces forced 1024-of-world buffer (:43) with source-native crop dimensions',
  caps: { sourceImageMax: SOURCE_IMAGE_MAX, legacyWorldBufferMax: LEGACY_WORLD_BUFFER_MAX, note: 'legacy 1024 is a memory cap (:37), not a resolution SSOT' },
  invariants: 'geometry/scene/nav/global-UV/screen placement unchanged; cache key includes native dims (no stale-buffer pollution); owned Canvas2D only; borrowed image/pixels unchanged; outside alpha 0; negative crop fail-closed; one-shot dispose; no RAF/timer; no original-PNG copy/generation',
  mutates: 'none — read-only candidate; actual Canvas/GUI render + visual A/B are root-owned gates (PENDING)'
});
