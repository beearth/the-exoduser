import { layoutReadings } from './layout-candidate.mjs';

export function createCoordinates(frame) {
  const { width, height, cameraX, cameraY, shakeX, shakeY, zoom, ssaa, backingWidth, backingHeight, cssWidth, cssHeight, cssLeft, cssTop, dpr } = frame;
  if (![width, height, cameraX, cameraY, shakeX, shakeY, zoom, ssaa, backingWidth, backingHeight, cssWidth, cssHeight, cssLeft, cssTop, dpr].every(Number.isFinite) || [width, height, zoom, ssaa, backingWidth, backingHeight, cssWidth, cssHeight, dpr].some(value => value <= 0)) throw new TypeError('UNKNOWN coordinate input');
  const translateX = Math.round(width / 2 - cameraX + shakeX);
  const translateY = Math.round(height / 2 - cameraY + shakeY);
  const worldToLogical = point => ({ x: width / 2 + zoom * (point.x + translateX - width / 2), y: height / 2 + zoom * (point.y + translateY - height / 2) });
  const logicalToWorld = point => ({ x: (point.x - width / 2) / zoom + width / 2 - translateX, y: (point.y - height / 2) / zoom + height / 2 - translateY });
  const logicalToBacking = point => ({ x: point.x * ssaa, y: point.y * ssaa });
  const backingToLogical = point => ({ x: point.x / ssaa, y: point.y / ssaa });
  const backingToCSS = point => ({ x: cssLeft + point.x * cssWidth / backingWidth, y: cssTop + point.y * cssHeight / backingHeight });
  const cssToBacking = point => ({ x: (point.x - cssLeft) * backingWidth / cssWidth, y: (point.y - cssTop) * backingHeight / cssHeight });
  const worldBoxToLogical = box => ({ ...worldToLogical(box), w: box.w * zoom, h: box.h * zoom });
  return { worldToLogical, logicalToWorld, logicalToBacking, backingToLogical, backingToCSS, cssToBacking, worldBoxToLogical, logicalDeltaToWorld: delta => ({ x: delta.x / zoom, y: delta.y / zoom }), cssGapToLogical: gap => gap * Math.max(backingWidth / cssWidth, backingHeight / cssHeight) / ssaa, viewport: { x: 0, y: 0, w: backingWidth / ssaa, h: backingHeight / ssaa }, dprMetadata: dpr };
}

export function chargeBox(x, y, radius, measuredWidth) {
  if (![x, y, radius, measuredWidth].every(Number.isFinite) || radius < 0 || measuredWidth < 0) throw new TypeError('UNKNOWN charge metrics');
  return { x: x - (measuredWidth + 14) / 2 - 0.75, y: y - radius - 25 - 10 - 0.75, w: measuredWidth + 15.5, h: 21.5 };
}

export function numberGlyphBoxes(num, x, y, scale, numberWidth = 48, numberHeight = 56) {
  if (![x, y, scale, numberWidth, numberHeight].every(Number.isFinite) || scale < 0 || numberWidth <= 0 || numberHeight <= 0) throw new TypeError('UNKNOWN number metrics');
  const text = typeof num === 'number' ? String(~~num) : num;
  if (typeof text !== 'string') throw new TypeError('UNKNOWN number string');
  const actualScale = scale || 1;
  const glyphWidth = ~~(numberWidth * actualScale);
  const glyphHeight = ~~(numberHeight * actualScale);
  const gap = ~~((numberWidth - 30) * actualScale);
  const origin = x - text.length * gap / 2;
  const boxes = [];
  for (let index = 0; index < text.length; index++) {
    const digit = text.charCodeAt(index) - 48;
    if (digit < 0 || digit > 9) continue;
    if (glyphWidth > 0 && glyphHeight > 0) boxes.push({ x: ~~(origin + index * gap), y: ~~y, w: glyphWidth, h: glyphHeight });
  }
  return boxes;
}

export function unionBoxes(boxes) {
  if (!boxes.length) return null;
  const left = Math.min(...boxes.map(box => box.x));
  const top = Math.min(...boxes.map(box => box.y));
  return { x: left, y: top, w: Math.max(...boxes.map(box => box.x + box.w)) - left, h: Math.max(...boxes.map(box => box.y + box.h)) - top };
}

export function damageState(text) {
  if (![text.x, text.y, text.life, text.ml, text.sz].every(Number.isFinite) || text.ml <= 0 || text.life <= 0) throw new TypeError('UNKNOWN damage state');
  const raw = text.life / text.ml;
  const age = 1 - raw;
  const size = text.sz || 22;
  const alpha = raw > 0.2 ? 1 : raw * 5;
  const progress = Math.min(1, age * 5);
  const bounce = progress < 1 ? 1 + 0.5 * (1 - progress) * (1 - progress) * Math.cos(progress * Math.PI * 2) : 1;
  const shake = size >= 36 && age < 0.3 ? Math.sin(age * 80) * (1 - age * 3.3) * 3 : 0;
  const scale = size / 48 * bounce;
  return { alpha, scale, x: text.x + shake, y: text.y - 56 * scale / 2 };
}

export function planReadings(readings, frame, obstacles = [], gapCSS = 4) {
  const coordinates = createCoordinates(frame);
  const logical = readings.map(reading => ({ ...reading, ...coordinates.worldBoxToLogical(reading.box) }));
  const planned = layoutReadings(logical, coordinates.viewport, obstacles, coordinates.cssGapToLogical(gapCSS));
  return planned.map(reading => ({ ...reading, worldDelta: coordinates.logicalDeltaToWorld({ x: 0, y: reading.deltaY }) }));
}

export function paintReadings(context, readings, planned) {
  const byId = new Map(planned.map(reading => [reading.id, reading]));
  const ordered = [...readings].sort((first, second) => Number(first.kind === 'charge') - Number(second.kind === 'charge'));
  for (const reading of ordered) {
    const placement = byId.get(reading.id);
    if (!placement) throw new TypeError('UNKNOWN placement');
    context.save();
    try {
      context.translate(placement.worldDelta.x, placement.worldDelta.y);
      reading.paint(context);
    } finally {
      context.restore();
    }
  }
}
