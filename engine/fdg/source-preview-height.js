/** Exact registered native logical hill semantics; mapped height/foot clearance are engine authoring. */
export const SOURCE_PREVIEW_HEIGHT_LIMITS = Object.freeze({ version: 1, tileSize: 40, worldSize: 8000,
  fileBytes: 4194304, maxDepth: 64, maxVisits: 1000000, maxHeight: 1024,
  maxStep: 64, maxSlope: 1, slopeDifferencePx: 1, ellipseIterations: 48 });
export const SOURCE_PREVIEW_HEIGHT_BINDING = Object.freeze({
  rampAt: 'tx<125||tx>135 -> -1; t=(tx-125)/10; half=1.8+(3-1.8)*t; |ty-98|<=half ? t : -1',
  heightAt: 'stage0: r=rampAt(tx,ty); r>=0 -> r*r*(3-2*r)(smoothstep); else d=sqrt(((tx-147)/18)^2+((ty-98)/9)^2); d<0.84 ? 1 : 0',
  bandBlocks: 'stage0: rampAt>=0 -> false; else 0.84<=d<=1.04 -> true(isW)',
});
const PARAMS = Object.freeze({ cx: 147, cy: 98, rx: 18, ry: 9, inner: 0.84, outer: 1.04,
  rampX0: 125, rampX1: 135, rampY: 98, rampHalf0: 1.8, rampHalf1: 3 });
const CLIFF_RULE = '_ch1HillBandBlocks: 0.84<=d<=1.04 && ramp<0 -> isW(stage0)';
const FOOT_POLICY = 'conservative-ellipse-band-contained-ramp';
const RESERVED = new Set(['__proto__', 'prototype', 'constructor']);
const EPS = 1e-7;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const finite = (value, low, high) => typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high;
const text = value => typeof value === 'string' && value.trim().length > 0;
const pair = value => Array.isArray(value) && value.length === 2 && value.every(number => Number.isFinite(number) && typeof number === 'number');
const close = (a, b) => typeof a === 'number' && typeof b === 'number' && Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-12;
const clone = value => JSON.parse(JSON.stringify(value));

function inspectJSON(root) {
  const fail = reason => ({ ok: false, errors: [`sourcePreview height: ${reason}`] });
  try {
    const stack = [{ value: root, depth: 0 }], ancestors = new Set(); let visits = 0;
    while (stack.length) {
      const item = stack.pop(), value = item.value;
      if (item.leave) { ancestors.delete(value); continue; }
      if (++visits > SOURCE_PREVIEW_HEIGHT_LIMITS.maxVisits || item.depth > SOURCE_PREVIEW_HEIGHT_LIMITS.maxDepth) return fail('depth64/visits1000000 exceeded');
      if (value === null || typeof value === 'string' || typeof value === 'boolean' || finite(value, -Number.MAX_VALUE, Number.MAX_VALUE)) continue;
      if (typeof value !== 'object' || (!Array.isArray(value) && !plain(value))) return fail('finite plain JSON required');
      if (ancestors.has(value) || Object.getOwnPropertySymbols(value).length) return fail('cycle/symbol rejected');
      if (Array.isArray(value) && value.length > SOURCE_PREVIEW_HEIGHT_LIMITS.maxVisits - visits) return fail('visits1000000 exceeded');
      const descriptors = Object.getOwnPropertyDescriptors(value), keys = Object.keys(descriptors);
      if (keys.length - (Array.isArray(value) ? 1 : 0) > SOURCE_PREVIEW_HEIGHT_LIMITS.maxVisits - visits) return fail('visits1000000 exceeded');
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
    if (new TextEncoder().encode(JSON.stringify(root)).byteLength > SOURCE_PREVIEW_HEIGHT_LIMITS.fileBytes) return fail('compact UTF-8 exceeds4194304bytes');
    return { ok: true, errors: [] };
  } catch { return fail('JSON inspection failed'); }
}

function evaluateNative(params, tx, ty) {
  let ramp = -1;
  if (tx >= params.rampX0 && tx <= params.rampX1) {
    const t = (tx - params.rampX0) / (params.rampX1 - params.rampX0);
    const half = params.rampHalf0 + (params.rampHalf1 - params.rampHalf0) * t;
    if (Math.abs(ty - params.rampY) <= half) ramp = t;
  }
  const d = Math.sqrt(((tx - params.cx) / params.rx) ** 2 + ((ty - params.cy) / params.ry) ** 2);
  return { logicalHeight: ramp >= 0 ? ramp * ramp * (3 - 2 * ramp) : d < params.inner ? 1 : 0,
    ramp, bandBlocks: ramp >= 0 ? false : d >= params.inner && d <= params.outer };
}

/** Strings are authority identifiers only, never interpreted as JavaScript or a general expression. */
export function validateSourcePreviewHeight(contract, { jsonValidated = false } = {}) {
  if (!jsonValidated) { const inspected = inspectJSON(contract); if (!inspected.ok) return { ...inspected, pending: [] }; }
  const errors = [], pending = [], check = (condition, reason) => { if (!condition) errors.push(`sourcePreview height: ${reason}`); return condition; };
  if (!check(plain(contract), 'explicit heightPreview object required')) return { ok: false, errors, pending };
  check(contract.version === 1 && contract.kind === 'exact-native-hill-preview' && contract.sourcePhysicalZClaim === false,
    'version1/exact-native-hill-preview/physical source claim false required');
  const snapshot = contract.sourceExecutionSnapshot, data = snapshot?.executionData, logical = data?.logicalHeight, params = logical?.nativeParams;
  check(plain(snapshot) && text(snapshot.completionId) && text(snapshot.control) && text(snapshot.kind) && plain(data), 'explicit original v4 envelope/snapshot required; baseRef is never loaded');
  const nativeValid = check(plain(logical) && text(logical.source) && text(logical.units) && plain(params)
    && Object.entries(PARAMS).every(([key, value]) => params[key] === value), 'exact11 native hill/ramp parameters and source units/reference required');
  const evaluator = logical?.exactEvaluator;
  const evaluatorValid = plain(evaluator) && Object.entries(SOURCE_PREVIEW_HEIGHT_BINDING).every(([key, value]) => evaluator[key] === value);
  if (!check(evaluatorValid, 'exact registered3 source evaluator strings required; no expression interpretation'))
    pending.push({ field: 'sourceExecutionData.executionData.logicalHeight.exactEvaluator', reason: 'This evaluator is not the registered native hill semantic binding.', classification: 'ENGINE_IMPLEMENTATION' });
  const band = data?.boundaryColliders?.hillCliffBand;
  check(plain(band) && band.rule === CLIFF_RULE && band.blockedTileCount === 166 && text(band.source)
    && Array.isArray(band.sampleTiles) && band.sampleTiles.every(point => pair(point) && point.every(value => Number.isSafeInteger(value) && value >= 0 && value < 200)),
  'exact source cliff rule/166 tile metadata required; no merged collider array is manufactured');
  check(logical?.summitTileCount === 340 && logical?.cliffBandBlockedTileCount === 166, 'source summit340/cliff166 metadata required');
  const samples = logical?.samples;
  if (check(Array.isArray(samples) && samples.length >= 1 && samples.length <= 64, '1..64 explicit source sample records required') && nativeValid && evaluatorValid) {
    for (const sample of samples) {
      if (!check(plain(sample) && text(sample.label) && pair(sample.tile) && sample.tile.every(value => Number.isSafeInteger(value) && value >= 0 && value < 200)
        && pair(sample.px) && sample.px.every((value, index) => value === (sample.tile[index] + 0.5) * 40)
        && finite(sample.height, 0, 1) && (sample.ramp === -1 || finite(sample.ramp, 0, 1)) && typeof sample.bandBlocks === 'boolean', 'sample labels are cell indices and px are centers/T40')) continue;
      const exact = evaluateNative(params, sample.px[0] / 40, sample.px[1] / 40);
      check(close(sample.height, exact.logicalHeight) && close(sample.ramp, exact.ramp) && sample.bandBlocks === exact.bandBlocks, 'source sample must match exact continuous px/T40 native evaluator');
    }
  }
  const mapping = contract.heightMapping;
  check(plain(mapping) && mapping.kind === 'engine-authored-linear' && text(mapping.authoredBy)
    && finite(mapping.scalePx, Number.MIN_VALUE, 1024) && finite(mapping.offsetPx, 0, 1024) && mapping.scalePx + mapping.offsetPx <= 1024,
  'explicit separate engine-authored scale/offset with mapped range<=1024 required');
  const movement = contract.movement;
  check(plain(movement) && finite(movement.maxStep, 1, 64) && finite(movement.maxSlope, 0, 1)
    && movement.cliffFootPolicy === FOOT_POLICY && text(movement.authoredBy), 'explicit engine maxStep1..64/maxSlope0..1/conservative foot policy/authoredBy required');
  const derived = contract.engineDerived;
  check(plain(derived) && derived.slopeKind === 'engine-mapped-finite-difference' && derived.slopeDifferencePx === 1
    && derived.slopeCoordinates === 'world-px-central-clamped' && derived.sourceSlopeClaim === false,
  'slope must be labeled engine-derived finite difference1px, never a native source slope');
  return { ok: errors.length === 0, errors, pending };
}

export function createSourcePreviewHeight(sourceExecutionData, heightMapping, movement) {
  const result = { ok: false, errors: [], pending: [], heightPreview: null };
  const inspected = inspectJSON({ sourceExecutionData, heightMapping, movement });
  if (!inspected.ok) { result.errors.push(...inspected.errors); return result; }
  const contract = { version: 1, kind: 'exact-native-hill-preview', sourceExecutionSnapshot: clone(sourceExecutionData),
    heightMapping: clone(heightMapping), movement: clone(movement), sourcePhysicalZClaim: false,
    engineDerived: { slopeKind: 'engine-mapped-finite-difference', slopeDifferencePx: 1, slopeCoordinates: 'world-px-central-clamped', sourceSlopeClaim: false } };
  const validation = validateSourcePreviewHeight(contract, { jsonValidated: true });
  result.errors.push(...validation.errors); result.pending.push(...validation.pending);
  if (validation.ok) { result.ok = true; result.heightPreview = contract; }
  return result;
}

/** Exact point height; finite difference slope belongs to the mapped engine preview only. */
export function evaluateSourcePreviewHeight(contract, x, y, { validated = false } = {}) {
  if ((!validated && !validateSourcePreviewHeight(contract).ok) || !finite(x, 0, 8000) || !finite(y, 0, 8000))
    return { ok: false, logicalHeight: null, engineFootZ: null, slope: null, ramp: null, bandBlocks: null, sourcePhysicalZClaim: false };
  const params = contract.sourceExecutionSnapshot.executionData.logicalHeight.nativeParams, mapping = contract.heightMapping;
  const exact = evaluateNative(params, x / 40, y / 40);
  const left = Math.max(0, x - 1), right = Math.min(8000, x + 1), top = Math.max(0, y - 1), bottom = Math.min(8000, y + 1);
  const dx = (evaluateNative(params, right / 40, y / 40).logicalHeight - evaluateNative(params, left / 40, y / 40).logicalHeight) * mapping.scalePx / (right - left);
  const dy = (evaluateNative(params, x / 40, bottom / 40).logicalHeight - evaluateNative(params, x / 40, top / 40).logicalHeight) * mapping.scalePx / (bottom - top);
  return { ok: true, ...exact, engineFootZ: mapping.offsetPx + exact.logicalHeight * mapping.scalePx,
    slope: Math.hypot(dx, dy), slopeKind: 'engine-mapped-finite-difference', slopeDifferencePx: 1, surfaceId: 'native-ch1-hill-logical', sourcePhysicalZClaim: false };
}

function distanceOutsideEllipse(x, y, rx, ry) {
  x = Math.abs(x); y = Math.abs(y);
  if ((x / rx) ** 2 + (y / ry) ** 2 <= 1) return 0;
  const rx2 = rx * rx, ry2 = ry * ry, measure = lambda => (rx * x / (lambda + rx2)) ** 2 + (ry * y / (lambda + ry2)) ** 2;
  let low = 0, high = Math.max(rx2, ry2, rx * x, ry * y);
  while (measure(high) > 1) high *= 2;
  for (let i = 0; i < 48; i++) { const mid = (low + high) / 2; if (measure(mid) > 1) low = mid; else high = mid; }
  return Math.hypot(x - rx2 * x / (high + rx2), y - ry2 * y / (high + ry2));
}
function distanceInsideEllipse(x, y, rx, ry) {
  x = Math.abs(x); y = Math.abs(y);
  if (ry > rx) return distanceInsideEllipse(y, x, ry, rx);
  if (rx === ry) return Math.max(0, rx - Math.hypot(x, y));
  const rx2 = rx * rx, ry2 = ry * ry;
  if (y <= EPS) {
    const px = Math.min(rx, rx2 * x / (rx2 - ry2));
    return Math.hypot(px - x, ry * Math.sqrt(Math.max(0, 1 - (px / rx) ** 2)));
  }
  let low = -ry2, high = 0;
  for (let i = 0; i < 48; i++) {
    const mid = (low + high) / 2, measure = (rx * x / (mid + rx2)) ** 2 + (ry * y / (mid + ry2)) ** 2;
    if (measure > 1) low = mid; else high = mid;
  }
  return Math.hypot(rx2 * x / (high + rx2) - x, ry2 * y / (high + ry2) - y);
}

/** Engine conservative circle clearance; native point bandBlocks stays a distinct exact predicate. */
export function sourcePreviewCliffBlocks(contract, x, y, radius, { validated = false } = {}) {
  if ((!validated && !validateSourcePreviewHeight(contract).ok) || ![x, y].every(value => finite(value, 0, 8000)) || !finite(radius, 1, 19))
    return { ok: false, blocked: true, reason: 'invalid-height-foot-query' };
  const p = contract.sourceExecutionSnapshot.executionData.logicalHeight.nativeParams;
  const dx = x - p.cx * 40, dy = y - p.cy * 40, outerX = p.rx * p.outer * 40, outerY = p.ry * p.outer * 40;
  if (Math.abs(dx) > outerX + radius || Math.abs(dy) > outerY + radius || distanceOutsideEllipse(dx, dy, outerX, outerY) > radius + EPS)
    return { ok: true, blocked: false, reason: 'outside-cliff' };
  const innerX = p.rx * p.inner * 40, innerY = p.ry * p.inner * 40;
  if ((dx / innerX) ** 2 + (dy / innerY) ** 2 < 1 && distanceInsideEllipse(dx, dy, innerX, innerY) > radius + EPS)
    return { ok: true, blocked: false, reason: 'inside-summit' };
  const tx = x / 40, ty = y / 40, tileRadius = radius / 40;
  const halfSlope = (p.rampHalf1 - p.rampHalf0) / (p.rampX1 - p.rampX0), half = p.rampHalf0 + halfSlope * (tx - p.rampX0);
  const containedRamp = tx - tileRadius >= p.rampX0 - EPS && tx + tileRadius <= p.rampX1 + EPS
    && Math.abs(ty - p.rampY) + tileRadius * Math.hypot(1, halfSlope) <= half + EPS;
  return { ok: true, blocked: !containedRamp, reason: containedRamp ? 'contained-native-ramp' : 'source-cliff-band', footPolicy: FOOT_POLICY };
}
