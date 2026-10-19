/** Explicit ENGINE_AUTHORING only; no native geometry, opacity, collider, or physical Z claim. */
export const SOURCE_PREVIEW_APPEARANCE_LIMITS = Object.freeze({ version: 1, fileBytes: 4194304,
  maxDepth: 64, maxVisits: 1000000, hillSegments: 128, rampSegments: 32, maxProfiles: 96,
  worldSize: 8000, slopeDifferencePx: 1 });
/** Explicit authoring initializer; validators never fill missing input values. */
export const SOURCE_PREVIEW_TERRAIN_CUTAWAY_DEFAULTS = Object.freeze({
  kind: 'projected-height-region', authority: 'ENGINE_AUTHORING', foregroundOpacity: 0.1,
  featherPx: 24, depthPolicy: 'after-region-max-projected-depth', sourcePhysicalZClaim: false,
});
const RESERVED = new Set(['__proto__', 'prototype', 'constructor']);
const PARAMS = { cx: 147, cy: 98, rx: 18, ry: 9, inner: 0.84, outer: 1.04,
  rampX0: 125, rampX1: 135, rampY: 98, rampHalf0: 1.8, rampHalf1: 3 };
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const finite = (value, low = -Infinity, high = Infinity) => typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high;
const text = value => typeof value === 'string' && value.trim().length > 0;
const clone = value => JSON.parse(JSON.stringify(value));

function inspectJSON(root) {
  const fail = reason => ({ ok: false, errors: [`sourcePreview appearance JSON: ${reason}`], pending: [] });
  try {
    const stack = [{ value: root, depth: 0 }], ancestors = new Set(); let visits = 0;
    while (stack.length) {
      const item = stack.pop(), value = item.value;
      if (item.leave) { ancestors.delete(value); continue; }
      if (++visits > SOURCE_PREVIEW_APPEARANCE_LIMITS.maxVisits || item.depth > SOURCE_PREVIEW_APPEARANCE_LIMITS.maxDepth) return fail('depth64/visits1000000 exceeded');
      if (value === null || typeof value === 'string' || typeof value === 'boolean' || finite(value)) continue;
      if (typeof value !== 'object' || (!Array.isArray(value) && !plain(value))) return fail('finite plain JSON required');
      if (ancestors.has(value) || Object.getOwnPropertySymbols(value).length) return fail('cycle/symbol rejected');
      if (Array.isArray(value) && value.length > SOURCE_PREVIEW_APPEARANCE_LIMITS.maxVisits - visits) return fail('visits1000000 exceeded');
      const descriptors = Object.getOwnPropertyDescriptors(value), keys = Object.keys(descriptors);
      if (keys.length - (Array.isArray(value) ? 1 : 0) > SOURCE_PREVIEW_APPEARANCE_LIMITS.maxVisits - visits) return fail('visits1000000 exceeded');
      ancestors.add(value); stack.push({ value, leave: true }); let count = 0;
      for (const key of keys) {
        if (Array.isArray(value) && key === 'length') continue;
        const descriptor = descriptors[key];
        if (RESERVED.has(key) || !Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) return fail('reserved/accessor/non-enumerable rejected');
        if (Array.isArray(value)) {
          const index = Number(key);
          if (String(index) !== key || !Number.isSafeInteger(index) || index < 0 || index >= value.length) return fail('dense array indices required');
          count++;
        }
        stack.push({ value: descriptor.value, depth: item.depth + 1 });
      }
      if (Array.isArray(value) && count !== value.length) return fail('sparse array rejected');
    }
    if (new TextEncoder().encode(JSON.stringify(root)).byteLength > SOURCE_PREVIEW_APPEARANCE_LIMITS.fileBytes) return fail('compact UTF-8 exceeds4194304bytes');
    return { ok: true, errors: [], pending: [] };
  } catch { return fail('inspection/serialization failed'); }
}

export function validateSourcePreviewAppearance(contract, { jsonValidated = false } = {}) {
  if (!jsonValidated) { const inspected = inspectJSON(contract); if (!inspected.ok) return inspected; }
  const errors = [], check = (condition, reason) => { if (!condition) errors.push(`sourcePreview appearance: ${reason}`); return condition; };
  if (!check(plain(contract), 'explicit appearancePreview object required')) return { ok: false, errors, pending: [] };
  check(contract.version === 1 && contract.kind === 'engine-authored-readability' && text(contract.authoredBy)
    && contract.sourcePhysicalZClaim === false, 'version1/engine-authored-readability/authoredBy/physical source claim false required');
  const cut = contract.actorCutaway;
  check(plain(cut) && cut.kind === 'projected-ellipse' && finite(cut.innerOpacity, 0, 1) && finite(cut.outerOpacity, 0, 1)
    && cut.innerOpacity <= cut.outerOpacity && finite(cut.featherPx, Number.MIN_VALUE, 64), 'explicit ellipse opacity0..1 ordered inner/outer and feather>0..64 required');
  const light = contract.terrainLighting;
  check(plain(light) && light.kind === 'engine-authored-directional' && Array.isArray(light.lightDirection) && light.lightDirection.length === 3
    && light.lightDirection.every(value => finite(value, -1, 1)) && light.lightDirection[2] > 0
    && finite(light.ambient, 0, 2) && finite(light.contrast, 0, 2) && finite(light.minBrightness, Number.MIN_VALUE, 1)
    && finite(light.maxBrightness, 1, 2)
    && light.ambient + light.contrast * light.lightDirection[2] / Math.hypot(...light.lightDirection) > 0,
  'explicit positive-Z direction, positive flat baseline, and brightness bounds including1 required');
  const wall = contract.frontWalls;
  check(plain(wall) && wall.kind === 'source-height-derived-south' && wall.hillSegments === 128 && wall.rampSegments === 32
    && finite(wall.opacity, 0, 1) && finite(wall.brightness, Number.MIN_VALUE, 2) && finite(wall.probePx, Number.MIN_VALUE, 1),
  'explicit south profile128/32/opacity/brightness/probe>0..1 world-px required');
  if (Object.hasOwn(contract, 'terrainCutaway')) {
    const terrain=contract.terrainCutaway;
    check(plain(terrain) && terrain.kind==='projected-height-region' && terrain.authority==='ENGINE_AUTHORING'
      && finite(terrain.foregroundOpacity,0,1) && finite(terrain.featherPx,Number.MIN_VALUE,64)
      && terrain.depthPolicy==='after-region-max-projected-depth' && text(terrain.authoredBy)
      && terrain.sourcePhysicalZClaim===false,
    'terrainCutaway requires explicit ENGINE_AUTHORING/projected-height-region/opacity0..1/feather>0..64px/after-region-max-projected-depth/authoredBy/physical source claim false');
  }
  return { ok: errors.length === 0, errors, pending: [] };
}

/** Unknown authoring keys survive; missing values never receive appearance defaults. */
export function createSourcePreviewAppearance(appearancePreview) {
  const validation = validateSourcePreviewAppearance(appearancePreview);
  return { ...validation, appearancePreview: validation.ok ? clone(appearancePreview) : null };
}

const rect = value => Array.isArray(value) && value.length === 4 && value.every(item => finite(item, -131072, 131072))
  && value[2] > 0 && value[3] > 0;

/** Owner supplies actual projected sprite bounds; intersection says nothing about native opaque pixels. */
export function sourcePreviewActorCutaway(contract, layerBounds, actorBounds, { validated = false } = {}) {
  if ((!validated && !validateSourcePreviewAppearance(contract).ok) || !rect(layerBounds) || !rect(actorBounds))
    return { ok: false, intersects: false, ellipse: null, nativeOpaqueClaim: false };
  const intersects = layerBounds[0] < actorBounds[0] + actorBounds[2] && actorBounds[0] < layerBounds[0] + layerBounds[2]
    && layerBounds[1] < actorBounds[1] + actorBounds[3] && actorBounds[1] < layerBounds[1] + layerBounds[3];
  const cut = contract.actorCutaway;
  return { ok: true, intersects, ellipse: intersects ? { x: actorBounds[0] + actorBounds[2] / 2,
    y: actorBounds[1] + actorBounds[3] / 2, radiusX: actorBounds[2] / 2, radiusY: actorBounds[3] / 2 } : null,
    innerOpacity: cut.innerOpacity, outerOpacity: cut.outerOpacity, featherPx: cut.featherPx,
    boundsRole: 'runtime-projected-sprite-bounds', nativeOpaqueClaim: false };
}

function samplePoint(sample, x, y) {
  const value = sample(x, y);
  if (!plain(value) || value.ok !== true || !finite(value.engineFootZ, 0, 1024)) throw new Error('valid mapped-height callback required');
  return value;
}

/** Central1px normal and lighting are engine render derivatives, never native lighting or physical normals. */
export function sampleSourcePreviewDirectionalBrightness(sample, x, y, contract, { validated = false } = {}) {
  const failed = { ok: false, brightness: null, normal: null, sourceLightingClaim: false };
  if ((!validated && !validateSourcePreviewAppearance(contract).ok) || typeof sample !== 'function'
    || !finite(x, 0, 8000) || !finite(y, 0, 8000)) return failed;
  try {
    const left = Math.max(0, x - 1), right = Math.min(8000, x + 1), top = Math.max(0, y - 1), bottom = Math.min(8000, y + 1);
    const dx = (samplePoint(sample, right, y).engineFootZ - samplePoint(sample, left, y).engineFootZ) / (right - left);
    const dy = (samplePoint(sample, x, bottom).engineFootZ - samplePoint(sample, x, top).engineFootZ) / (bottom - top);
    const length = Math.hypot(dx, dy, 1), normal = [-dx / length, -dy / length, 1 / length];
    const light = contract.terrainLighting, magnitude = Math.hypot(...light.lightDirection);
    const dot = normal.reduce((sum, value, index) => sum + value * light.lightDirection[index] / magnitude, 0);
    const raw = light.ambient + light.contrast * Math.max(0, dot);
    const baseline = light.ambient + light.contrast * light.lightDirection[2] / magnitude;
    const brightness = Math.max(light.minBrightness, Math.min(light.maxBrightness, raw / baseline));
    return { ok: true, brightness, normal, sourceLightingClaim: false, slopeDifferencePx: 1,
      coordinates: 'world-px-central-clamped', normalization: 'engine-render-flat-normal-equals1' };
  } catch { return failed; }
}

/** Profiles are engine render seams from registered source heights. Nothing is merged into nav or native geometry. */
export function createSourcePreviewFrontWallProfiles(params, sample, contract, { validated = false } = {}) {
  const result = { ok: false, errors: [], profiles: [], sourcePhysicalZClaim: false };
  if ((!validated && (!validateSourcePreviewAppearance(contract).ok || !plain(params)
    || !Object.entries(PARAMS).every(([key, value]) => params[key] === value))) || typeof sample !== 'function') {
    result.errors.push('sourcePreview appearance: exact native params/explicit authoring/height callback required'); return result;
  }
  const wall = contract.frontWalls, profiles = [];
  const endpoint = (x, y, nx, ny) => {
    const inside = samplePoint(sample, x - nx * wall.probePx, y - ny * wall.probePx);
    const outside = samplePoint(sample, x + nx * wall.probePx, y + ny * wall.probePx);
    return { top: [x, y, inside.engineFootZ], bottom: [x, y, outside.engineFootZ], inside, outside };
  };
  const append = (id, edge, first, last, normal) => {
    if (Math.max(first.top[2] - first.bottom[2], last.top[2] - last.bottom[2]) <= 1e-7
      || first.top[2] < first.bottom[2] - 1e-7 || last.top[2] < last.bottom[2] - 1e-7) return;
    if (edge === 'hill-inner-south' && [first.inside, first.outside, last.inside, last.outside].some(value => !finite(value.ramp) || value.ramp >= 0)) return;
    profiles.push({ id, edge, top: [first.top, last.top], bottom: [first.bottom, last.bottom], normal: [...normal, 0],
      depthY: (first.bottom[1] - first.bottom[2] + last.bottom[1] - last.bottom[2]) / 2,
      depthRole: 'projected-bottom-midpoint', role: 'engine-source-height-derived-render-wall', sourcePhysicalZClaim: false });
  };
  try {
    const rx = params.rx * params.inner * 40, ry = params.ry * params.inner * 40, cx = params.cx * 40, cy = params.cy * 40;
    const point = angle => {
      const nx = Math.cos(angle) / rx, ny = Math.sin(angle) / ry, length = Math.hypot(nx, ny);
      return endpoint(cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry, nx / length, ny / length);
    };
    for (let i = 0; i < wall.hillSegments / 2; i++) {
      const a = i * 2 * Math.PI / wall.hillSegments, b = (i + 1) * 2 * Math.PI / wall.hillSegments, mid = (a + b) / 2;
      const nx = Math.cos(mid) / rx, ny = Math.sin(mid) / ry, length = Math.hypot(nx, ny);
      append(`hill-south-${i}`, 'hill-inner-south', point(a), point(b), [nx / length, ny / length]);
    }
    const slope = (params.rampHalf1 - params.rampHalf0) / (params.rampX1 - params.rampX0), length = Math.hypot(slope, 1);
    const normal = [-slope / length, 1 / length];
    const pointOnRamp = t => endpoint((params.rampX0 + (params.rampX1 - params.rampX0) * t) * 40,
      (params.rampY + params.rampHalf0 + (params.rampHalf1 - params.rampHalf0) * t) * 40, ...normal);
    for (let i = 0; i < wall.rampSegments; i++) append(`ramp-south-${i}`, 'ramp-south', pointOnRamp(i / wall.rampSegments), pointOnRamp((i + 1) / wall.rampSegments), normal);
  } catch { result.errors.push('sourcePreview appearance: callback did not provide valid engine-mapped heights'); return result; }
  result.ok = true; result.profiles = profiles;
  result.engineDerived = { hillSegments: 128, rampSegments: 32, maxProfiles: 96, probePx: wall.probePx,
    probeRole: 'engine-render-world-px-boundary-tolerance', depthRole: 'projected-bottom-midpoint', sourceGeometryClaim: false };
  return result;
}
