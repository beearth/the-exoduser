// Render-only placement in world units. Never changes the native text record.
export const COMBAT_LABEL_LAYOUT_LIMITS = Object.freeze({
  rectangles: 256,
  candidates: 128,
  criticalCoordinatesPerAxis: 16,
  viewportGridPerAxis: 5,
});

const finite = value => typeof value === 'number' && Number.isFinite(value);
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const rectValid = rect => rect && finite(rect.left) && finite(rect.top)
  && finite(rect.right) && finite(rect.bottom)
  && finite(rect.right - rect.left) && finite(rect.bottom - rect.top)
  && rect.right > rect.left && rect.bottom > rect.top;
const overlaps = (a, b, gap) => a.right + gap > b.left
  && a.left - gap < b.right && a.bottom + gap > b.top && a.top - gap < b.bottom;

/**
 * Return the nearest clear position among a bounded set of candidates.
 * Gap separates labels from blockers; the viewport itself needs no extra gap.
 * Bounded-search overflow retains the original anchor and is not a proof that
 * no geometric solution exists. Callers must render that fallback, not drop it.
 */
export function placeCombatLabel(options = {}) {
  const input = options && typeof options === 'object' ? options : {};
  const { anchor, width, height, viewport } = input;
  const gap = input.gap === undefined ? 12 : input.gap;
  const obstacles = input.obstacles === undefined ? [] : input.obstacles;
  const occupied = input.occupied === undefined ? [] : input.occupied;
  const x = finite(anchor?.x) ? anchor.x : null;
  const y = finite(anchor?.y) ? anchor.y : null;
  const halfW = finite(width) && width >= 0 ? width / 2 : null;
  const halfH = finite(height) && height >= 0 ? height / 2 : null;
  const makeRect = (cx, cy) => ({
    left: cx - halfW, top: cy - halfH, right: cx + halfW, bottom: cy + halfH,
  });
  const originalRect = x !== null && y !== null && halfW !== null && halfH !== null
    ? makeRect(x, y) : null;
  const fallback = reason => ({ x, y, rect: originalRect, moved: false, overflow: true, reason });

  if (x === null || y === null || halfW === null || halfH === null
    || !finite(gap) || gap < 0 || !Array.isArray(obstacles) || !Array.isArray(occupied)) {
    return fallback('invalid-input');
  }
  if (width === 0 || height === 0) return fallback('zero-area-label');
  if (!originalRect || !Object.values(originalRect).every(finite)) return fallback('invalid-input');
  if (viewport && finite(viewport.left) && finite(viewport.top)
    && finite(viewport.right) && finite(viewport.bottom)
    && (viewport.left === viewport.right || viewport.top === viewport.bottom)) {
    return fallback('zero-area-viewport');
  }
  if (!rectValid(viewport)) return fallback('invalid-viewport');
  if (obstacles.length + occupied.length > COMBAT_LABEL_LAYOUT_LIMITS.rectangles) {
    return fallback('rectangle-limit');
  }
  const blockers = [...obstacles, ...occupied];
  if (!blockers.every(rectValid)) return fallback('invalid-rectangle');
  if (width > viewport.right - viewport.left || height > viewport.bottom - viewport.top) {
    return fallback('label-exceeds-viewport');
  }

  const left = viewport.left + halfW;
  const right = viewport.right - halfW;
  const top = viewport.top + halfH;
  const bottom = viewport.bottom - halfH;
  const clear = rect => !blockers.some(blocker => overlaps(rect, blocker, gap));
  const inViewport = rect => rect.left >= viewport.left && rect.right <= viewport.right
    && rect.top >= viewport.top && rect.bottom <= viewport.bottom;
  if (inViewport(originalRect) && clear(originalRect)) {
    return { x, y, rect: originalRect, moved: false, overflow: false, reason: 'clear' };
  }

  const clampedX = clamp(x, left, right);
  const clampedY = clamp(y, top, bottom);
  const proposals = new Map();
  const mandatory = new Map();
  const put = (target, cx, cy) => {
    if (!finite(cx) || !finite(cy)) return;
    cx = clamp(cx, left, right);
    cy = clamp(cy, top, bottom);
    const distance = Math.hypot(cx - x, cy - y);
    if (!finite(distance)) return;
    target.set(`${cx},${cy}`, { x: cx, y: cy, distance });
  };
  put(proposals, clampedX, clampedY);
  const xs = new Set([left, right, clampedX]);
  const ys = new Set([top, bottom, clampedY]);
  for (const blocker of blockers) {
    const lx = blocker.left - gap - halfW;
    const rx = blocker.right + gap + halfW;
    const ty = blocker.top - gap - halfH;
    const by = blocker.bottom + gap + halfH;
    if (finite(lx)) xs.add(clamp(lx, left, right));
    if (finite(rx)) xs.add(clamp(rx, left, right));
    if (finite(ty)) ys.add(clamp(ty, top, bottom));
    if (finite(by)) ys.add(clamp(by, top, bottom));
    put(proposals, lx, clampedY); put(proposals, rx, clampedY);
    put(proposals, clampedX, ty); put(proposals, clampedX, by);
    put(proposals, lx, ty); put(proposals, lx, by);
    put(proposals, rx, ty); put(proposals, rx, by);
  }
  const closestCoordinates = (values, origin) => [...values]
    .sort((a, b) => Math.abs(a - origin) - Math.abs(b - origin) || a - b)
    .slice(0, COMBAT_LABEL_LAYOUT_LIMITS.criticalCoordinatesPerAxis);
  for (const cx of closestCoordinates(xs, x)) {
    for (const cy of closestCoordinates(ys, y)) put(proposals, cx, cy);
  }

  // Keep viewport-wide fallback coverage even when nearby blockers are dense.
  const grid = COMBAT_LABEL_LAYOUT_LIMITS.viewportGridPerAxis;
  for (let ix = 0; ix < grid; ix++) {
    for (let iy = 0; iy < grid; iy++) {
      put(mandatory, left + (right - left) * ix / (grid - 1), top + (bottom - top) * iy / (grid - 1));
    }
  }
  put(mandatory, left, clampedY); put(mandatory, right, clampedY);
  put(mandatory, clampedX, top); put(mandatory, clampedX, bottom);
  const compare = (a, b) => a.distance - b.distance || a.x - b.x || a.y - b.y;
  const candidates = new Map(mandatory);
  for (const candidate of [...proposals.values()].sort(compare)) {
    if (candidates.size >= COMBAT_LABEL_LAYOUT_LIMITS.candidates) break;
    candidates.set(`${candidate.x},${candidate.y}`, candidate);
  }
  for (const candidate of [...candidates.values()].sort(compare)) {
    const rect = makeRect(candidate.x, candidate.y);
    if (inViewport(rect) && clear(rect)) {
      return { x: candidate.x, y: candidate.y, rect, moved: candidate.x !== x || candidate.y !== y,
        overflow: false, reason: 'relocated' };
    }
  }
  return fallback('bounded-search-exhausted');
}
