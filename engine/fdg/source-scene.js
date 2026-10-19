/** Pure source-ground contract. No project, renderer, asset loader or game imports. */
export const SOURCE_SCENE_VERSION = 1;
export const SOURCE_SCENE_EXECUTION_CONTRACT = 'fdg-source-scene-v1';
export const SOURCE_SCENE_LIMITS = Object.freeze({
  width: 200, height: 200, tileSize: 40, worldSize: 8000, cells: 40000,
  colliders: 512, imageLayers: 128, exceptions: 32, fileBytes: 4194304,
  maxDepth: 64, maxVisits: 1000000, maxHeight: 1024, maxStep: 64, maxSlope: 1,
  minColliderSize: 0.000001,
});
const RESERVED = new Set(['__proto__', 'prototype', 'constructor']);
const EPS = 1e-7;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const finite = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const text = value => typeof value === 'string' && value.trim().length > 0;
const id = value => text(value) && value.length <= 120 && !/[\x00-\x1f\x7f]/.test(value) && !RESERVED.has(value);
const pair = (value, check) => Array.isArray(value) && value.length === 2 && value.every(check);
const localAsset = value => text(value) && value.length <= 512 && /\.(png|jpe?g|webp)$/i.test(value)
  && !/[\\:%?#\x00-\x1f\x7f]/.test(value) && !value.startsWith('/')
  && value.split('/').every(part => part !== '' && part !== '.' && part !== '..');

function jsonError(root) {
  const stack = [{ value: root, path: 'sourceScene', depth: 0 }], ancestors = new Set();
  let visits = 0;
  while (stack.length) {
    const item = stack.pop(), value = item.value;
    if (item.leave) { ancestors.delete(value); continue; }
    if (++visits > SOURCE_SCENE_LIMITS.maxVisits || item.depth > SOURCE_SCENE_LIMITS.maxDepth) return `${item.path}: JSON inspection limit exceeded`;
    if (value === null || typeof value === 'string' || typeof value === 'boolean') continue;
    if (typeof value === 'number' && Number.isFinite(value)) continue;
    if (typeof value !== 'object' || (!Array.isArray(value) && !plain(value))) return `${item.path}: finite plain JSON data required`;
    if (ancestors.has(value)) return `${item.path}: cyclic JSON rejected`;
    if (Object.getOwnPropertySymbols(value).length) return `${item.path}: symbol keys rejected`;
    if (Array.isArray(value) && value.length > SOURCE_SCENE_LIMITS.maxVisits - visits) return `${item.path}: JSON inspection limit exceeded`;
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Object.keys(descriptors);
    if (keys.length - (Array.isArray(value) ? 1 : 0) > SOURCE_SCENE_LIMITS.maxVisits - visits) return `${item.path}: JSON inspection limit exceeded`;
    ancestors.add(value); stack.push({ ...item, leave: true });
    let entries = 0;
    for (const key of keys) {
      if (Array.isArray(value) && key === 'length') continue;
      const descriptor = descriptors[key];
      if (RESERVED.has(key) || !Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) return `${item.path}.${key}: safe JSON data property required`;
      if (Array.isArray(value)) {
        const index = Number(key);
        if (!Number.isSafeInteger(index) || index < 0 || index >= value.length || String(index) !== key) return `${item.path}.${key}: array index required`;
        entries++;
      }
      stack.push({ value: descriptor.value, path: `${item.path}.${key}`, depth: item.depth + 1 });
    }
    if (Array.isArray(value) && entries !== value.length) return `${item.path}: sparse array rejected`;
  }
  try {
    if (new TextEncoder().encode(JSON.stringify(root)).byteLength > SOURCE_SCENE_LIMITS.fileBytes) return 'sourceScene: compact UTF-8 JSON exceeds 4194304 bytes';
  } catch { return 'sourceScene: JSON serialization failed'; }
  return null;
}

function checkPrimitive(value, path, errors, allowBand = true) {
  const check = (condition, reason) => { if (!condition) errors.push(`${path}: ${reason}`); };
  if (!plain(value)) { check(false, 'collider object required'); return; }
  check(id(value.id), '1..120 non-reserved collider id required');
  check(pair(value.center, coordinate => finite(coordinate, 0, 8000)), 'world-px center [x,y] required');
  if (value.kind === 'circle') check(finite(value.radius, SOURCE_SCENE_LIMITS.minColliderSize, 8000), 'radius must be 0.000001..8000px');
  else if (['ellipse', 'box', 'ellipse-band'].includes(value.kind)) {
    check(finite(value.yaw, -Math.PI, Math.PI), 'explicit yaw in radians required');
    if (value.kind === 'box') check(pair(value.size, coordinate => finite(coordinate, SOURCE_SCENE_LIMITS.minColliderSize, 8000)), 'size [width,depth] must be 0.000001..8000 world px');
    else check(pair(value.radii, coordinate => finite(coordinate, SOURCE_SCENE_LIMITS.minColliderSize, 8000)), 'radii [rx,ry] must be 0.000001..8000 world px');
    if (value.kind === 'ellipse-band') {
      check(allowBand, 'nested ellipse-band exception unsupported');
      check(finite(value.innerRatio, 0, 2) && finite(value.outerRatio, SOURCE_SCENE_LIMITS.minColliderSize, 2)
        && value.outerRatio > value.innerRatio, 'explicit 0<=innerRatio<outerRatio<=2, outerRatio>=0.000001 required');
      if (value.exceptions !== undefined) {
        check(Array.isArray(value.exceptions) && value.exceptions.length <= SOURCE_SCENE_LIMITS.exceptions, 'exceptions must be an array of at most32 source primitives');
        if (Array.isArray(value.exceptions)) for (let i = 0; i < value.exceptions.length; i++) checkPrimitive(value.exceptions[i], `${path}.exceptions[${i}]`, errors, false);
      }
    }
  } else check(false, 'circle/ellipse/box/ellipse-band supported');
}

/** Collider-only schema wrapper; existing physical scene validation and geometry stay unchanged. */
export function validateSourceColliders(primitives, { jsonValidated = false } = {}) {
  const errors = [];
  if (!jsonValidated) {
    try { const unsafe = jsonError(primitives); if (unsafe) return { ok: false, errors: [unsafe] }; }
    catch { return { ok: false, errors: ['sourceColliders: JSON inspection failed'] }; }
  }
  if (!Array.isArray(primitives) || primitives.length > SOURCE_SCENE_LIMITS.colliders)
    return { ok: false, errors: ['sourceColliders: explicit array0..512 required'] };
  const ids = new Set();
  for (const [index, primitive] of primitives.entries()) {
    checkPrimitive(primitive, `sourceColliders[${index}]`, errors);
    if (ids.has(primitive?.id)) errors.push('sourceColliders: duplicate top-level id');
    ids.add(primitive?.id);
  }
  return { ok: errors.length === 0, errors };
}

/** World-XY circle query only. Radius0 is a center check; caller owns nav, height and movement sweep. */
export function querySourceColliderCircle(primitives, x, y, radius, { validated = false } = {}) {
  const failed = reason => ({ ok: false, blocked: true, colliderId: null, reason });
  if (!validated && !validateSourceColliders(primitives).ok) return failed('invalid-colliders');
  if (!finite(x, 0, 8000) || !finite(y, 0, 8000) || !finite(radius, 0, 19)) return failed('invalid-collision-query');
  try {
    for (const primitive of primitives) {
      // Circle geometry is rotation-invariant; unknown circle yaw metadata must never poison Math.cos.
      const normalized = primitive.kind === 'circle' ? { ...primitive, yaw: 0 }
        : primitive.kind === 'ellipse-band' && primitive.exceptions
          ? { ...primitive, exceptions: primitive.exceptions.map(value => value.kind === 'circle' ? { ...value, yaw: 0 } : value) }
          : primitive;
      if (primitiveIntersects(normalized, x, y, radius))
        return { ok: true, blocked: true, colliderId: primitive.id, reason: `collider:${primitive.id}` };
    }
    return { ok: true, blocked: false, colliderId: null, reason: null };
  } catch { return failed('invalid-colliders'); }
}

export function validateSourceScene(scene) {
  const errors = [];
  try {
    const unsafe = jsonError(scene);
    if (unsafe) return { ok: false, errors: [unsafe] };
  } catch { return { ok: false, errors: ['sourceScene: JSON inspection failed'] }; }
  if (!plain(scene)) return { ok: false, errors: ['sourceScene: object required'] };
  const check = (condition, reason) => { if (!condition) errors.push(`sourceScene.${reason}`); };
  check(scene.schemaVersion === 1 && scene.stage === 0, 'schemaVersion/stage: 1/0 required');
  const g = scene.grid;
  check(plain(g) && g.width === 200 && g.height === 200 && g.tileSize === 40, 'grid: 200×200/T40 required');
  check(plain(scene.nav) && scene.nav.scope === 'polygon-plus-source-colliders' && Array.isArray(scene.nav.tiles)
    && scene.nav.tiles.length === 40000 && scene.nav.tiles.every(value => value === 0 || value === 1), 'nav: exact40000 source 0/1 cells required');
  const h = scene.height, mapping = h?.heightMapping;
  check(plain(h) && h.interpolation === 'bilinear-cell-centers' && text(h.source) && Array.isArray(h.logicalSamples)
    && h.logicalSamples.length === 40000 && h.logicalSamples.every(value => finite(value, 0, 1)), 'height: exact logical samples0..1×40000/source/interpolation required');
  check(plain(mapping) && mapping.kind === 'engine-authored-linear' && text(mapping.authoredBy)
    && finite(mapping.scalePx, Number.MIN_VALUE, 1024) && finite(mapping.offsetPx, 0, 1024)
    && mapping.scalePx + mapping.offsetPx <= 1024, 'height.heightMapping: explicit engine-authored scale/offset required, physical range<=1024');
  const settings = scene.settings;
  check(plain(settings) && finite(settings.maxStep, 1, 64) && finite(settings.maxSlope, 0, 1), 'settings: explicit maxStep1..64px/maxSlope0..1 required');
  check(plain(scene.camera) && finite(scene.camera.x, 0, 8000) && finite(scene.camera.y, 0, 8000)
    && typeof scene.camera.follow === 'boolean', 'camera: explicit world XY/follow required');
  check(Array.isArray(scene.colliders) && scene.colliders.length <= 512, 'colliders: 0..512 source primitives required');
  const colliderIds = new Set();
  if (Array.isArray(scene.colliders)) for (let i = 0; i < scene.colliders.length; i++) {
    const collider = scene.colliders[i];
    checkPrimitive(collider, `sourceScene.colliders[${i}]`, errors);
    check(!colliderIds.has(collider?.id), 'colliders.id: duplicate id'); colliderIds.add(collider?.id);
  }
  check(Array.isArray(scene.imageLayers) && scene.imageLayers.length <= 128, 'imageLayers: 0..128 approved image layers required');
  const layerIds = new Set();
  if (Array.isArray(scene.imageLayers)) for (let i = 0; i < scene.imageLayers.length; i++) {
    const layer = scene.imageLayers[i], prefix = `imageLayers[${i}]`;
    check(plain(layer) && id(layer.id) && !layerIds.has(layer.id) && localAsset(layer.src), `${prefix}: unique id/local image src required`);
    layerIds.add(layer?.id);
    const sourceRect = layer?.sourceRect, worldRect = layer?.worldRect;
    check(Array.isArray(sourceRect) && sourceRect.length === 4 && finite(sourceRect[0], 0, Number.MAX_SAFE_INTEGER)
      && finite(sourceRect[1], 0, Number.MAX_SAFE_INTEGER) && finite(sourceRect[2], Number.MIN_VALUE, Number.MAX_SAFE_INTEGER)
      && finite(sourceRect[3], Number.MIN_VALUE, Number.MAX_SAFE_INTEGER), `${prefix}.sourceRect: explicit positive crop required`);
    check(Array.isArray(worldRect) && worldRect.length === 4 && finite(worldRect[0], 0, 8192) && finite(worldRect[1], 0, 8192)
      && finite(worldRect[2], Number.MIN_VALUE, 8192) && finite(worldRect[3], Number.MIN_VALUE, 8192)
      && worldRect[0] + worldRect[2] <= 8192 && worldRect[1] + worldRect[3] <= 8192, `${prefix}.worldRect: explicit positive world rect within8192 required`);
    check(finite(layer?.opacity, 0, 1) && ['ground', 'world', 'front'].includes(layer?.layer)
      && finite(layer?.depthY, 0, 8192), `${prefix}: explicit opacity/layer/depthY required`);
  }
  const actor = scene.actor, sourceStart = actor?.sourceStart;
  check(plain(actor) && Array.isArray(actor.position) && actor.position.length === 3
    && finite(actor.position[0], 0, 8000) && finite(actor.position[1], 0, 8000) && finite(actor.position[2], 0, 1024), 'actor.position: finite world XYZ required');
  check(plain(actor?.startAuthority) && text(actor.startAuthority.symbol) && text(actor.startAuthority.source), 'actor.startAuthority: exact source symbol/reference required');
  check(plain(sourceStart) && pair(sourceStart.rawTile, value => Number.isSafeInteger(value) && value >= 0 && value < 200)
    && pair(sourceStart.centerTile, value => finite(value, 0, 200)) && pair(sourceStart.worldPx, value => finite(value, 0, 8000))
    && sourceStart.rawTile.every((value, i) => sourceStart.centerTile[i] === value + 0.5 && sourceStart.worldPx[i] === sourceStart.centerTile[i] * 40),
  'actor.sourceStart: raw/center/world source tuples must agree');
  if (!errors.length) {
    const [x, y, z] = actor.position, ground = sampleSourceHeight(scene, x, y, { validated: true });
    check(Math.abs(ground.height - z) <= EPS, 'actor.position: Z must match engine-mapped source ground');
    check(!positionBlocked(scene, x, y, 0), 'actor.position: center must be on source nav and outside source colliders');
  }
  return { ok: errors.length === 0, errors };
}

export function sampleSourceHeight(scene, x, y, { validated = false } = {}) {
  if ((!validated && !validateSourceScene(scene).ok) || !finite(x, 0, 8000) || !finite(y, 0, 8000))
    return { height: NaN, logicalHeight: NaN, surfaceId: null, slope: Infinity };
  const rawX = x / 40 - 0.5, rawY = y / 40 - 0.5;
  const gx = Math.max(0, Math.min(199, rawX)), gy = Math.max(0, Math.min(199, rawY));
  const x0 = Math.floor(gx), y0 = Math.floor(gy), x1 = Math.min(199, x0 + 1), y1 = Math.min(199, y0 + 1), fx = gx - x0, fy = gy - y0;
  const samples = scene.height.logicalSamples;
  const a = samples[y0 * 200 + x0], b = samples[y0 * 200 + x1], c = samples[y1 * 200 + x0], d = samples[y1 * 200 + x1];
  const logicalHeight = (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  const mapping = scene.height.heightMapping;
  const dx = rawX < 0 || rawX > 199 ? 0 : ((b - a) * (1 - fy) + (d - c) * fy) / 40;
  const dy = rawY < 0 || rawY > 199 ? 0 : ((c - a) * (1 - fx) + (d - b) * fx) / 40;
  return { height: mapping.offsetPx + logicalHeight * mapping.scalePx, logicalHeight, surfaceId: 'source-ground', slope: Math.hypot(dx, dy) * mapping.scalePx };
}

function localPoint(collider, x, y) {
  const dx = x - collider.center[0], dy = y - collider.center[1], c = Math.cos(collider.yaw || 0), s = Math.sin(collider.yaw || 0);
  return [dx * c + dy * s, -dx * s + dy * c];
}

function distanceOutsideEllipse(x, y, rx, ry) {
  x = Math.abs(x); y = Math.abs(y);
  if ((x / rx) ** 2 + (y / ry) ** 2 <= 1) return 0;
  const rx2 = rx * rx, ry2 = ry * ry;
  const measure = lambda => (rx * x / (lambda + rx2)) ** 2 + (ry * y / (lambda + ry2)) ** 2;
  let low = 0, high = Math.max(rx2, ry2, rx * x, ry * y);
  while (measure(high) > 1) high *= 2;
  for (let i = 0; i < 48; i++) {
    const mid = (low + high) / 2;
    if (measure(mid) > 1) low = mid; else high = mid;
  }
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
    const mid = (low + high) / 2;
    const measure = (rx * x / (mid + rx2)) ** 2 + (ry * y / (mid + ry2)) ** 2;
    if (measure > 1) low = mid; else high = mid;
  }
  return Math.hypot(rx2 * x / (high + rx2) - x, ry2 * y / (high + ry2) - y);
}

function ellipseContainsCircle(x, y, rx, ry, radius) {
  if ((x / rx) ** 2 + (y / ry) ** 2 > 1 + EPS) return false;
  return distanceInsideEllipse(x, y, rx, ry) + EPS >= radius;
}

function circleContained(collider, x, y, radius) {
  const [lx, ly] = localPoint(collider, x, y);
  if (collider.kind === 'circle') return Math.hypot(lx, ly) + radius <= collider.radius + EPS;
  if (collider.kind === 'box') return Math.abs(lx) + radius <= collider.size[0] / 2 + EPS && Math.abs(ly) + radius <= collider.size[1] / 2 + EPS;
  if (collider.kind === 'ellipse') return ellipseContainsCircle(lx, ly, ...collider.radii, radius);
  return false;
}

function primitiveIntersects(collider, x, y, radius) {
  const [lx, ly] = localPoint(collider, x, y);
  if (collider.kind === 'circle') return Math.hypot(lx, ly) <= collider.radius + radius + EPS;
  if (collider.kind === 'box') return Math.hypot(Math.max(0, Math.abs(lx) - collider.size[0] / 2), Math.max(0, Math.abs(ly) - collider.size[1] / 2)) <= radius + EPS;
  if (collider.kind === 'ellipse') {
    if (Math.abs(lx) > collider.radii[0] + radius || Math.abs(ly) > collider.radii[1] + radius) return false;
    return distanceOutsideEllipse(lx, ly, ...collider.radii) <= radius + EPS;
  }
  const outer = collider.radii.map(value => value * collider.outerRatio);
  if (Math.abs(lx) > outer[0] + radius || Math.abs(ly) > outer[1] + radius) return false;
  if (distanceOutsideEllipse(lx, ly, ...outer) > radius + EPS) return false;
  if ((collider.exceptions || []).some(exception => circleContained(exception, x, y, radius))) return false;
  if (collider.innerRatio > 0) {
    const inner = collider.radii.map(value => value * collider.innerRatio);
    if (ellipseContainsCircle(lx, ly, ...inner, radius) && distanceInsideEllipse(lx, ly, ...inner) > radius + EPS) return false;
  }
  return true;
}

function positionBlocked(scene, x, y, radius) {
  if (x >= 8000 || y >= 8000 || x - radius < 0 || y - radius < 0 || x + radius > 8000 || y + radius > 8000) return 'bounds';
  const minX = Math.max(0, Math.floor((x - radius) / 40)), maxX = Math.min(199, Math.floor((x + radius) / 40));
  const minY = Math.max(0, Math.floor((y - radius) / 40)), maxY = Math.min(199, Math.floor((y + radius) / 40));
  for (let ty = minY; ty <= maxY; ty++) for (let tx = minX; tx <= maxX; tx++) {
    if (scene.nav.tiles[ty * 200 + tx] === 1) continue;
    const dx = x - Math.max(tx * 40, Math.min((tx + 1) * 40, x)), dy = y - Math.max(ty * 40, Math.min((ty + 1) * 40, y));
    if (dx * dx + dy * dy <= radius * radius + EPS) return 'nav';
  }
  for (const collider of scene.colliders) if (primitiveIntersects(collider, x, y, radius)) return `collider:${collider.id}`;
  return null;
}

/** Swept full-circle XY query; authored maxStep/maxSlope gate the mapped ground. */
export function canMoveSourceScene(scene, from, to, radius, { validated = false } = {}) {
  const fail = (reason, ground = {}) => ({ ok: false, reason, ...ground });
  if (!validated && !validateSourceScene(scene).ok) return fail('invalid-scene');
  if (!plain(from) || !plain(to) || !finite(from.x, 0, 8000) || !finite(from.y, 0, 8000) || !finite(from.z, 0, 1024)
    || !finite(to.x, 0, 8000) || !finite(to.y, 0, 8000) || (to.z !== undefined && !finite(to.z, 0, 1024)) || !finite(radius, 1, 19)) return fail('invalid-position');
  const initial = sampleSourceHeight(scene, from.x, from.y, { validated: true });
  const blocked = positionBlocked(scene, from.x, from.y, radius);
  if (blocked) return fail(blocked, initial);
  if (Math.abs(initial.height - from.z) > EPS) return fail('ground-contact', initial);
  const dx = to.x - from.x, dy = to.y - from.y;
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / Math.min(10, radius)));
  let ground = initial;
  for (let step = 1; step <= steps; step++) {
    const x = from.x + dx * step / steps, y = from.y + dy * step / steps;
    const next = sampleSourceHeight(scene, x, y, { validated: true });
    const reason = positionBlocked(scene, x, y, radius);
    if (reason) return fail(reason, next);
    if (next.slope > scene.settings.maxSlope + EPS) return fail('slope', next);
    if (Math.abs(next.height - ground.height) > scene.settings.maxStep + EPS) return fail('step', next);
    ground = next;
  }
  return { ok: true, reason: null, ...ground };
}
