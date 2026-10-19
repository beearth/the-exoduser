const MIN_ZOOM = .3;
const MAX_ZOOM = .8;
const EPSILON = 1e-7;

const finite = value => typeof value === 'number' && Number.isFinite(value);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rect = value => value && ['left', 'top', 'right', 'bottom'].every(key => finite(value[key]))
  && value.left <= value.right && value.top <= value.bottom;
const copyRect = value => ({left:value.left, top:value.top, right:value.right, bottom:value.bottom});

function rejected(reason) {
  return {ok:false, reason, x:null, y:null, zoom:null, targetZoom:null, bounds:null, safeRect:null, contained:false};
}

function mapInterval(start, end, halfView) {
  // Preserve the native camera's centered small-map behavior.
  if (end - start <= halfView * 2) return [(start + end) / 2, (start + end) / 2];
  return [start + halfView, end - halfView];
}

function axisFrame(desired, low, high, mapRange) {
  const fitLow = mapRange ? Math.max(low, mapRange[0]) : low;
  const fitHigh = mapRange ? Math.min(high, mapRange[1]) : high;
  if (fitLow <= fitHigh + EPSILON) return {value:clamp(desired, fitLow, Math.max(fitLow, fitHigh)), feasible:true};
  return {value:mapRange ? clamp(desired, ...mapRange) : desired, feasible:false};
}

/**
 * Render-only camera fit. Bounds/mapBounds use world px; viewport/safeRect use
 * logical screen px. dt uses native _dtSp frame-step units, not seconds.
 * Missing or invalid geometry fails explicitly; no actor/projectile is moved.
 */
export function fitDruidCombatFrame({bounds, viewport, safeRect, previous, dt, mapBounds} = {}) {
  if (!Array.isArray(bounds) || !bounds.length || !bounds.every(rect)) return rejected('invalid-bounds');
  if (!viewport || !finite(viewport.width) || !finite(viewport.height)
    || viewport.width <= 0 || viewport.height <= 0) return rejected('invalid-viewport');
  if (!rect(safeRect) || safeRect.left < 0 || safeRect.top < 0
    || safeRect.right > viewport.width || safeRect.bottom > viewport.height
    || safeRect.left === safeRect.right || safeRect.top === safeRect.bottom) return rejected('invalid-safe-rect');
  if (!finite(dt) || dt < 0) return rejected('invalid-dt');
  if (previous !== undefined && (!previous || !finite(previous.x) || !finite(previous.y)
    || !finite(previous.zoom) || previous.zoom <= 0)) return rejected('invalid-previous');
  if (mapBounds !== undefined && (!rect(mapBounds) || mapBounds.left === mapBounds.right
    || mapBounds.top === mapBounds.bottom)) return rejected('invalid-map-bounds');

  const union = {
    left:Math.min(...bounds.map(value => value.left)),
    top:Math.min(...bounds.map(value => value.top)),
    right:Math.max(...bounds.map(value => value.right)),
    bottom:Math.max(...bounds.map(value => value.bottom)),
  };
  const worldWidth = union.right - union.left, worldHeight = union.bottom - union.top;
  if (!finite(worldWidth) || !finite(worldHeight)) return rejected('invalid-bounds');
  const safeWidth = safeRect.right - safeRect.left, safeHeight = safeRect.bottom - safeRect.top;
  const availableZoom = Math.min(MAX_ZOOM, worldWidth ? safeWidth / worldWidth : MAX_ZOOM,
    worldHeight ? safeHeight / worldHeight : MAX_ZOOM);
  const targetZoom = clamp(availableZoom, MIN_ZOOM, MAX_ZOOM);
  const zoom = previous && previous.zoom < targetZoom
    ? clamp(previous.zoom + (targetZoom - previous.zoom) * (1 - Math.pow(.94, dt)), MIN_ZOOM, MAX_ZOOM)
    : targetZoom;
  const halfX = viewport.width / 2, halfY = viewport.height / 2;
  const idealX = union.left + worldWidth / 2 - (safeRect.left + safeWidth / 2 - halfX) / zoom;
  const idealY = union.top + worldHeight / 2 - (safeRect.top + safeHeight / 2 - halfY) / zoom;
  const follow = 1 - Math.pow(.92, dt);
  const desiredX = previous ? previous.x + (idealX - previous.x) * follow : idealX;
  const desiredY = previous ? previous.y + (idealY - previous.y) * follow : idealY;
  const xRange = mapBounds ? mapInterval(mapBounds.left, mapBounds.right, halfX / zoom) : null;
  const yRange = mapBounds ? mapInterval(mapBounds.top, mapBounds.bottom, halfY / zoom) : null;
  const x = axisFrame(desiredX, union.right - (safeRect.right - halfX) / zoom,
    union.left - (safeRect.left - halfX) / zoom, xRange);
  const y = axisFrame(desiredY, union.bottom - (safeRect.bottom - halfY) / zoom,
    union.top - (safeRect.top - halfY) / zoom, yRange);
  if (!finite(x.value) || !finite(y.value) || !finite(zoom)) return rejected('invalid-frame-geometry');
  const projected = {
    left:(union.left - x.value) * zoom + halfX,
    right:(union.right - x.value) * zoom + halfX,
    top:(union.top - y.value) * zoom + halfY,
    bottom:(union.bottom - y.value) * zoom + halfY,
  };
  if (!Object.values(projected).every(finite)) return rejected('invalid-frame-geometry');
  const contained = projected.left >= safeRect.left - EPSILON && projected.right <= safeRect.right + EPSILON
    && projected.top >= safeRect.top - EPSILON && projected.bottom <= safeRect.bottom + EPSILON;
  return {
    ok:true, x:x.value, y:y.value, zoom, targetZoom, bounds:union, safeRect:copyRect(safeRect), contained,
    reason:contained ? null : availableZoom < MIN_ZOOM - EPSILON ? 'bounds-exceed-safe-viewport'
      : !x.feasible || !y.feasible ? 'map-bounds-conflict' : 'bounds-not-contained',
  };
}
