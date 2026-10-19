/** Pure terrain geometry and height queries. XY are world pixels; Z is height. */
export const TERRAIN_SCENE_VERSION = 1;
export const TERRAIN_SCENE_LIMITS = Object.freeze({
  resources: 16, nodes: 32, idLength: 120, worldSize: 8000,
  minSize: 1, maxSize: 1600, maxHeight: 512, maxActorHeight: 1024,
  maxSteps: 32, minStep: 1, maxStep: 64, maxSlope: 1,
  minPitch: 0.35, maxPitch: 1.1, minZoom: 0.25, maxZoom: 2,
  minDistance: 600, maxDistance: 6000, defaultDistance: 1400,
  minNear: 8, maxNear: 128, defaultNear: 32,
});
export const TERRAIN_GROUND_COLOR = '#273134';

const EPSILON = 1e-9;
const RESERVED_IDS = new Set(['__proto__', 'prototype', 'constructor']);
const plain = value => value !== null && typeof value === 'object'
  && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const finite = (value, min, max) => typeof value === 'number'
  && Number.isFinite(value) && value >= min && value <= max;
const vector = (value, ranges) => Array.isArray(value) && value.length === ranges.length
  && ranges.every(([min, max], i) => finite(value[i], min, max));
const id = value => typeof value === 'string' && value.length >= 1
  && value.length <= TERRAIN_SCENE_LIMITS.idLength && value.trim().length > 0
  && !RESERVED_IDS.has(value);
const name = value => typeof value === 'string' && value.trim().length > 0;

/** Reject non-JSON values, accessors, cycles and dangerous object keys before field reads. */
function inspectJson(root) {
  const pending = [{ value: root, path: 'terrainScene', depth: 0, leave: false }];
  const ancestors = new Set();
  let visited = 0;
  while (pending.length) {
    const item = pending.pop();
    if (item.leave) { ancestors.delete(item.value); continue; }
    if (++visited > 200000 || item.depth > 64) return `${item.path}: JSON size/depth exceeds safe inspection limit`;
    const value = item.value;
    if (value === null || typeof value === 'string' || typeof value === 'boolean') continue;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return `${item.path}: number must be finite`;
      continue;
    }
    if (typeof value !== 'object' || (!Array.isArray(value) && !plain(value))) return `${item.path}: plain JSON data required`;
    if (ancestors.has(value)) return `${item.path}: cyclic JSON data is not allowed`;
    ancestors.add(value);
    pending.push({ ...item, leave: true });
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Object.getOwnPropertySymbols(value).length) return `${item.path}: symbol keys are not JSON data`;
    for (const key of Object.keys(descriptors)) {
      if (Array.isArray(value) && key === 'length') continue;
      if (RESERVED_IDS.has(key)) return `${item.path}.${key}: reserved key`;
      const descriptor = descriptors[key];
      if (!('value' in descriptor) || !descriptor.enumerable) return `${item.path}.${key}: JSON data property required`;
      pending.push({ value: descriptor.value, path: `${item.path}.${key}`, depth: item.depth + 1, leave: false });
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) if (!Object.hasOwn(value, i)) return `${item.path}[${i}]: sparse arrays are not JSON data`;
    }
  }
  return null;
}

export function validateTerrainScene(scene) {
  const errors = [];
  const jsonError = inspectJson(scene);
  if (jsonError) return { ok: false, errors: [jsonError] };
  if (!plain(scene)) return { ok: false, errors: ['terrainScene: object required'] };
  const check = (condition, message) => { if (!condition) errors.push(message); };
  check(scene.version === TERRAIN_SCENE_VERSION, 'version: must be 1');
  const b = scene.bounds;
  if (!plain(b)) errors.push('bounds: object required');
  else {
    check(finite(b.x, 0, 8000) && finite(b.y, 0, 8000), 'bounds: x/y must be finite within 0..8000');
    check(finite(b.width, 1, 1600) && finite(b.depth, 1, 1600), 'bounds: width/depth must be within 1..1600');
    check(Number.isFinite(b.x + b.width) && Number.isFinite(b.y + b.depth)
      && b.x + b.width <= 8000 && b.y + b.depth <= 8000, 'bounds: rectangle must fit world 0..8000');
  }
  const resources = Array.isArray(scene.resources) ? scene.resources : [];
  check(Array.isArray(scene.resources) && resources.length >= 1 && resources.length <= 16, 'resources: 1..16 required');
  const resourcesById = new Map();
  resources.forEach((resource, i) => {
    const path = `resources[${i}]`;
    if (!plain(resource)) { errors.push(`${path}: object required`); return; }
    check(id(resource.id), `${path}.id: 1..120 non-reserved characters required`);
    check(!resourcesById.has(resource.id), `${path}.id: duplicate resource id`);
    resourcesById.set(resource.id, resource);
    check(name(resource.name), `${path}.name: nonempty string required`);
    check(['box', 'ramp', 'stairs'].includes(resource.kind), `${path}.kind: box/ramp/stairs required`);
    check(vector(resource.size, [[1, 1600], [1, 1600], [0, 512]]), `${path}.size: [width 1..1600, depth 1..1600, height 0..512] required`);
    if (resource.kind === 'stairs') check(Number.isInteger(resource.steps) && resource.steps >= 1 && resource.steps <= 32, `${path}.steps: integer 1..32 required`);
    else check(!Object.hasOwn(resource, 'steps'), `${path}.steps: only stairs have steps`);
    check(typeof resource.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(resource.color), `${path}.color: #RRGGBB required`);
    check(typeof resource.walkable === 'boolean', `${path}.walkable: boolean required`);
  });
  const nodes = Array.isArray(scene.nodes) ? scene.nodes : [];
  check(Array.isArray(scene.nodes) && nodes.length >= 1 && nodes.length <= 32, 'nodes: 1..32 required');
  const nodeIds = new Set();
  nodes.forEach((node, i) => {
    const path = `nodes[${i}]`;
    if (!plain(node)) { errors.push(`${path}: object required`); return; }
    check(id(node.id) && node.id !== 'ground', `${path}.id: unique 1..120 non-reserved id required (ground is reserved)`);
    check(!nodeIds.has(node.id), `${path}.id: duplicate node id`);
    nodeIds.add(node.id);
    check(name(node.name), `${path}.name: nonempty string required`);
    check(id(node.resourceId) && resourcesById.has(node.resourceId), `${path}.resourceId: existing resource required`);
    check(vector(node.position, [[0, 8000], [0, 8000], [0, 512]]), `${path}.position: [x/y 0..8000, z 0..512] required`);
    check(finite(node.yaw, -Math.PI, Math.PI), `${path}.yaw: radians within -PI..PI required`);
  });
  const c = scene.camera;
  if (!plain(c)) errors.push('camera: object required');
  else {
    check(finite(c.yaw, -Math.PI, Math.PI), 'camera.yaw: radians within -PI..PI required');
    check(finite(c.pitch, 0.35, 1.1), 'camera.pitch: radians within .35..1.1 required');
    check(finite(c.zoom, 0.25, 2), 'camera.zoom: .25..2 required');
    if (Object.hasOwn(c, 'projection')) {
      check(['perspective', 'orthographic'].includes(c.projection), 'camera.projection: perspective/orthographic required');
      if (Object.hasOwn(c, 'distance')) check(finite(c.distance, 600, 6000), 'camera.distance: 600..6000 required');
      if (Object.hasOwn(c, 'near')) check(finite(c.near, 8, 128), 'camera.near: 8..128 required');
    } else {
      check(!Object.hasOwn(c, 'distance') && !Object.hasOwn(c, 'near'), 'camera.distance/near: explicit projection required');
    }
  }
  const settings = scene.settings;
  if (!plain(settings)) errors.push('settings: object required');
  else {
    check(finite(settings.maxStep, 1, 64), 'settings.maxStep: 1..64 required');
    check(finite(settings.maxSlope, 0, 1), 'settings.maxSlope: 0..1 required');
  }
  if (Object.hasOwn(scene, 'actor')) {
    check(plain(scene.actor) && vector(scene.actor.position, [[0, 8000], [0, 8000], [0, 1024]]), 'actor.position: [x/y 0..8000, z 0..1024] required');
    if (plain(b) && plain(scene.actor) && Array.isArray(scene.actor.position)) {
      const [x, y] = scene.actor.position;
      check(x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.depth, 'actor.position: center must be inside bounds');
    }
  }
  return { ok: errors.length === 0, errors };
}

export class TerrainSceneValidationError extends Error {
  constructor(errors) {
    super(`Invalid terrain scene: ${errors.join('; ')}`);
    this.name = 'TerrainSceneValidationError';
    this.errors = [...errors];
  }
}

function assertScene(scene, options) {
  if (options?.validated === true) return;
  const result = validateTerrainScene(scene);
  if (!result.ok) throw new TerrainSceneValidationError(result.errors);
}

function resolveScene(scene) {
  const resources = new Map(scene.resources.map(resource => [resource.id, resource]));
  return scene.nodes.map(node => ({ node, resource: resources.get(node.resourceId), c: Math.cos(node.yaw), s: Math.sin(node.yaw) }));
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function worldPoint(entry, x, y, z) {
  const { node, c, s } = entry;
  return [node.position[0] + c * x - s * y, node.position[1] + s * x + c * y, node.position[2] + z];
}

const BOX_FACES = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
function appendBox(entry, vertices, faces, width, depth, height, centerY = 0) {
  const x = width / 2, y0 = centerY - depth / 2, y1 = centerY + depth / 2;
  const offset = vertices.length;
  vertices.push(...[[-x, y0, 0], [x, y0, 0], [x, y1, 0], [-x, y1, 0], [-x, y0, height], [x, y0, height], [x, y1, height], [-x, y1, height]].map(p => worldPoint(entry, ...p)));
  faces.push(...BOX_FACES.map(face => face.map(i => i + offset)));
}

/** Each mesh owns fresh vertices and triangular faces. The implicit floor is first. */
export function buildTerrainMeshes(scene, options = {}) {
  assertScene(scene, options);
  const b = scene.bounds;
  const meshes = [{ nodeId: 'ground', color: TERRAIN_GROUND_COLOR,
    vertices: [[b.x, b.y, 0], [b.x + b.width, b.y, 0], [b.x + b.width, b.y + b.depth, 0], [b.x, b.y + b.depth, 0]],
    faces: [[0, 1, 2], [0, 2, 3]] }];
  for (const entry of resolveScene(scene)) {
    const { resource, node } = entry;
    const [width, depth, height] = resource.size;
    const vertices = [], faces = [];
    if (height === 0) {
      vertices.push(...[[-width / 2, -depth / 2, 0], [width / 2, -depth / 2, 0], [width / 2, depth / 2, 0], [-width / 2, depth / 2, 0]].map(p => worldPoint(entry, ...p)));
      faces.push([0, 1, 2], [0, 2, 3]);
    } else if (resource.kind === 'ramp') {
      const x = width / 2, y = depth / 2;
      vertices.push(...[[-x, -y, 0], [x, -y, 0], [x, y, 0], [-x, y, 0], [x, y, height], [-x, y, height]].map(p => worldPoint(entry, ...p)));
      faces.push([0, 2, 1], [0, 3, 2], [0, 1, 4], [0, 4, 5], [3, 5, 4], [3, 4, 2], [1, 2, 4], [0, 5, 3]);
    } else if (resource.kind === 'stairs') {
      const tread = depth / resource.steps;
      for (let i = 0; i < resource.steps; i++) appendBox(entry, vertices, faces, width, tread, height * (i + 1) / resource.steps, -depth / 2 + tread * (i + 0.5));
    } else appendBox(entry, vertices, faces, width, depth, height);
    meshes.push({ nodeId: node.id, color: resource.color, vertices, faces });
  }
  return meshes;
}

function contains(bounds, x, y, radius = 0) {
  return x - radius >= bounds.x - EPSILON && y - radius >= bounds.y - EPSILON
    && x + radius <= bounds.x + bounds.width + EPSILON && y + radius <= bounds.y + bounds.depth + EPSILON;
}
function localPoint(entry, x, y) {
  const dx = x - entry.node.position[0], dy = y - entry.node.position[1];
  return [entry.c * dx + entry.s * dy, -entry.s * dx + entry.c * dy];
}
function sampleResolved(scene, entries, x, y) {
  if (!contains(scene.bounds, x, y)) return { height: 0, surfaceId: null, slope: 0 };
  let result = { height: 0, surfaceId: 'ground', slope: 0 };
  for (const entry of entries) {
    const { node, resource } = entry;
    if (!resource.walkable) continue;
    const [lx, ly] = localPoint(entry, x, y);
    const [width, depth, height] = resource.size;
    if (Math.abs(lx) > width / 2 + EPSILON || Math.abs(ly) > depth / 2 + EPSILON) continue;
    const progress = clamp(ly / depth + 0.5, 0, 1);
    let top = height, slope = 0;
    if (resource.kind === 'ramp') { top *= progress; slope = height / depth; }
    else if (resource.kind === 'stairs') top *= Math.min(resource.steps, Math.floor(progress * resource.steps + EPSILON) + 1) / resource.steps;
    top += node.position[2];
    if (top >= result.height - EPSILON) result = { height: top, surfaceId: node.id, slope };
  }
  return result;
}

export function sampleTerrain(scene, x, y, options = {}) {
  assertScene(scene, options);
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError('Terrain sample x/y must be finite');
  return sampleResolved(scene, resolveScene(scene), x, y);
}

function position(value) {
  const p = Array.isArray(value) ? { x: value[0], y: value[1], z: value[2] } : value;
  if (!p || typeof p !== 'object' || !Number.isFinite(p.x) || !Number.isFinite(p.y)
    || (p.z !== undefined && !Number.isFinite(p.z)) || (Array.isArray(value) && ![2, 3].includes(value.length))) return null;
  return p;
}
function overlapsBlocker(entry, x, y, radius) {
  const [lx, ly] = localPoint(entry, x, y);
  const [width, depth] = entry.resource.size;
  const dx = lx - clamp(lx, -width / 2, width / 2);
  const dy = ly - clamp(ly, -depth / 2, depth / 2);
  // Tangency is contact. This is a target-disk query, not a swept segment test.
  return dx * dx + dy * dy <= radius * radius + EPSILON;
}

/** Reject vertical steps, unsupported disks and rotated solid footprints. No clock ownership. */
export function canMoveTerrain(scene, from, to, radius, options = {}) {
  assertScene(scene, options);
  const a = position(from), b = position(to);
  if (!a || !b || !finite(radius, 0, 8000)) return { ok: false, height: 0, surfaceId: null, reason: 'invalid-position' };
  const entries = resolveScene(scene);
  const target = sampleResolved(scene, entries, b.x, b.y);
  const result = reason => ({ ok: reason === null, height: target.height, surfaceId: target.surfaceId, reason });
  if (!contains(scene.bounds, a.x, a.y, radius) || !contains(scene.bounds, b.x, b.y, radius)) return result('bounds');
  if (entries.some(entry => !entry.resource.walkable && overlapsBlocker(entry, b.x, b.y, radius))) return result('blocked');
  if (target.slope > scene.settings.maxSlope + EPSILON) return result('slope');
  const fromHeight = a.z ?? sampleResolved(scene, entries, a.x, a.y).height;
  if (Math.abs(target.height - fromHeight) > scene.settings.maxStep + EPSILON) return result('step');
  const heights = [target.height, ...[[radius, 0], [-radius, 0], [0, radius], [0, -radius]].map(([dx, dy]) => sampleResolved(scene, entries, b.x + dx, b.y + dy).height)];
  if (Math.max(...heights) - Math.min(...heights) > scene.settings.maxStep + EPSILON) return result('support');
  return result(null);
}

/** Isolated technical fixture around an existing start; the input map is untouched. */
export function createTerrainScene(map) {
  if (!plain(map) || !plain(map.start) || !finite(map.tileSize, 1, 8000)
    || !Number.isInteger(map.start.x) || !Number.isInteger(map.start.y)) throw new TypeError('Terrain template requires map.start tile coordinates and finite tileSize');
  const cx = (map.start.x + 0.5) * map.tileSize, cy = (map.start.y + 0.5) * map.tileSize;
  const scene = {
    version: 1,
    bounds: { x: clamp(cx - 240, 0, 7520), y: clamp(cy - 400, 0, 7400), width: 480, depth: 600 },
    resources: [
      { id: 'stairs', name: '계단', kind: 'stairs', size: [96, 256, 64], steps: 8, color: '#8796A1', walkable: true },
      { id: 'ramp', name: '경사로', kind: 'ramp', size: [96, 256, 64], color: '#8DAA95', walkable: true },
      { id: 'platform', name: '연결 플랫폼', kind: 'box', size: [320, 96, 64], color: '#A7A391', walkable: true },
      { id: 'pillar', name: '충돌 기둥', kind: 'box', size: [40, 40, 100], color: '#A97568', walkable: false },
    ],
    nodes: [
      { id: 'stairs-node', name: '계단 인스턴스', resourceId: 'stairs', position: [cx - 100, cy - 160, 0], yaw: Math.PI },
      { id: 'ramp-node', name: '경사로 인스턴스', resourceId: 'ramp', position: [cx + 100, cy - 160, 0], yaw: Math.PI },
      { id: 'platform-node', name: '연결 플랫폼 인스턴스', resourceId: 'platform', position: [cx, cy - 336, 0], yaw: 0 },
      { id: 'pillar-node', name: '충돌 기둥 인스턴스', resourceId: 'pillar', position: [cx + 170, cy + 40, 0], yaw: 0.25 },
    ],
    camera: { yaw: 0.45, pitch: 0.7, zoom: 1, projection: 'perspective', distance: 1400, near: 32 },
    settings: { maxStep: 12, maxSlope: 0.6 },
    actor: { position: [cx, cy, 0] },
  };
  assertScene(scene);
  if (!contains(scene.bounds, cx, cy, 15)) throw new RangeError('Terrain template spawn radius 15 does not fit clamped bounds');
  if (buildTerrainMeshes(scene, { validated: true }).some(mesh => mesh.vertices.some(([x, y]) => !finite(x, 0, 8000) || !finite(y, 0, 8000)))) throw new RangeError('Terrain template geometry does not fit world 0..8000');
  return scene;
}
