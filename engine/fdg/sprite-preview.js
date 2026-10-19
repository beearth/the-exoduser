/** Editor geometry in logical canvas pixels. Authored scale and source pixels stay unchanged. */
export function fitSpritePreview({ cell, image, viewport, anchor = { x: .5, y: 1 }, focus = { x: .5, y: .5 }, zoom = 1, padding = 16, maxScale = 4 }) {
  const finite = value => Number.isFinite(value);
  if (!cell || !image || !viewport ||
      ![cell.sx, cell.sy, cell.sw, cell.sh, image.width, image.height, viewport.x, viewport.y, viewport.width, viewport.height, padding, maxScale, zoom, anchor.x, anchor.y, focus.x, focus.y].every(finite) ||
      cell.sx < 0 || cell.sy < 0 || cell.sw <= 0 || cell.sh <= 0 || image.width <= 0 || image.height <= 0 ||
      cell.sx + cell.sw > image.width || cell.sy + cell.sh > image.height || padding < 0 ||
      viewport.width <= padding * 2 || viewport.height <= padding * 2 || maxScale <= 0 || zoom < 1 ||
      [anchor.x, anchor.y, focus.x, focus.y].some(value => value < 0 || value > 1)) {
    throw new RangeError('Invalid sprite preview bounds');
  }
  const fitScale = Math.min(maxScale, (viewport.width - padding * 2) / cell.sw, (viewport.height - padding * 2) / cell.sh);
  const scale = fitScale * zoom, width = cell.sw * scale, height = cell.sh * scale;
  const center = { x: viewport.x + viewport.width / 2, y: viewport.y + viewport.height / 2 };
  const x = center.x - focus.x * width, y = center.y - focus.y * height;
  return { x, y, width, height, scale, fitScale, center, anchor: { x: x + anchor.x * width, y: y + anchor.y * height } };
}

/** Up to 24 selectable cells per page, preserving the full clip's absolute frame indexes. */
export function spriteThumbnailPage({ frames, index, width, top, size = 48, gap = 10, rowGap = 14 }) {
  if (!Number.isInteger(frames) || frames < 1 || frames > 256 || !Number.isInteger(index) || index < 0 || index >= frames ||
      ![width, top, size, gap, rowGap].every(Number.isFinite) || width <= 0 || size <= 0 || gap < 0 || rowGap < 0) {
    throw new RangeError('Invalid sprite thumbnail page');
  }
  const start = Math.floor(index / 24) * 24, count = Math.min(24, frames - start), columns = Math.min(12, count);
  const left = (width - (columns * size + (columns - 1) * gap)) / 2;
  return { start, end: start + count - 1, cells: Array.from({ length: count }, (_, offset) => ({
    index: start + offset, x: left + (offset % 12) * (size + gap), y: top + Math.floor(offset / 12) * (size + rowGap), width: size, height: size,
  })) };
}
