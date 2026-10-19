/** Pure authored waypoint validation and directed gate-path queries; no runtime ownership. */
import { isWalkableCircle } from './runtime.js?v=0.7';
import { sampleTerrain, canMoveTerrain } from './terrain-scene.js';

export const WAYPOINT_LIMITS = Object.freeze({ waypoints: 64, minRadius: 8, maxRadius: 160, heightTolerance: 16, gateKeys: 32 });
const reserved = new Set(['__proto__', 'constructor', 'prototype']);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const id = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 120 && !/[\x00-\x1f\x7f]/.test(value) && !reserved.has(value);
const finite = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const xyz = value => Array.isArray(value) && value.length === 3 && finite(value[0], 0, 8000) && finite(value[1], 0, 8000) && finite(value[2], 0, 1024);
const areas = world => Array.isArray(world?.areas) ? world.areas : [];
const points = world => Array.isArray(world?.waypoints) ? world.waypoints : [];

export function validateWorldWaypoints(world) {
  const errors = [], check = (condition, message) => { if (!condition) errors.push(message); };
  const definitions = points(world), ids = new Set();
  if (world?.waypoints !== undefined) check(Array.isArray(world.waypoints) && definitions.length <= 64, 'waypoints: array of 0..64 required');
  definitions.forEach((point, index) => {
    const path = `waypoints[${index}]`;
    if (!plain(point)) { errors.push(`${path}: object required`); return; }
    check(id(point.id) && !ids.has(point.id), `${path}.id: unique valid id required`); ids.add(point.id);
    check(typeof point.name === 'string' && point.name.trim().length > 0, `${path}.name: nonempty string required`);
    const area = areas(world).find(value => value?.areaKey === point.areaKey);
    check(id(point.areaKey) && Boolean(area), `${path}.areaKey: existing area required`);
    check(xyz(point.position), `${path}.position: finite world XYZ required`);
    check(finite(point.discoveryRadius, 8, 160), `${path}.discoveryRadius: 8..160 required`);
    check(finite(point.activationRadius, 8, 160) && point.activationRadius <= point.discoveryRadius, `${path}.activationRadius: 8..discoveryRadius required`);
    check(id(point.arrivalId) && Array.isArray(area?.entrances) && area.entrances.some(entry => entry?.id === point.arrivalId), `${path}.arrivalId: existing area entrance required`);
    check(Array.isArray(point.travelGateKeys) && point.travelGateKeys.length <= 32, `${path}.travelGateKeys: 0..32 keys required`);
    if (Array.isArray(point.travelGateKeys)) {
      const unique = new Set();
      for (const key of point.travelGateKeys) {
        check(id(key) && plain(world.progress) && Object.hasOwn(world.progress, key) && !unique.has(key), `${path}.travelGateKeys: unique existing progress keys required`); unique.add(key);
      }
    }
  });
  const states = world?.state?.waypoints;
  if (states !== undefined) {
    check(plain(states), 'state.waypoints: object required');
    if (plain(states)) for (const [key, value] of Object.entries(states)) {
      check(ids.has(key), `state.waypoints.${key}: existing waypoint required`);
      check(plain(value) && typeof value.discovered === 'boolean' && typeof value.active === 'boolean'
        && (!value.active || value.discovered), `state.waypoints.${key}: boolean discovered/active; active requires discovered`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function attachFixtureWaypoints(world) {
  const next = structuredClone(world);
  if (next.waypoints !== undefined || next.scope !== 'ENGINE_FIXTURE') return next;
  next.waypoints = ['a', 'b'].map(letter => {
    const areaKey = `engine_fixture_${letter}`, area = next.areas.find(value => value.areaKey === areaKey);
    const map = next.scenes.find(scene => scene.id === area?.sceneId)?.project?.map;
    if (!map?.start || !Number.isFinite(map.tileSize) || !area.entrances.some(entry => entry.id === 'arrival')) throw new TypeError('Fixture waypoints require A/B maps and arrival entrances');
    const cx = (map.start.x + 0.5) * map.tileSize, cy = (map.start.y + 0.5) * map.tileSize;
    return { id: `engine_fixture_wp_${letter}`, name: `엔진 시험 웨이포인트 ${letter.toUpperCase()}`, areaKey,
      position: [cx + (letter === 'a' ? -31.2 : 31.2), cy + 46.8, 0], discoveryRadius: 24,
      activationRadius: 16, arrivalId: 'arrival', travelGateKeys: letter === 'b' ? ['fixture_gate_open'] : [] };
  });
  next.state.waypoints ||= {};
  for (const point of next.waypoints) next.state.waypoints[point.id] ||= { discovered: false, active: false };
  return next;
}

function search(world, from, to, allowed) {
  if (!areas(world).some(area => area?.areaKey === from) || !areas(world).some(area => area?.areaKey === to)) return null;
  const queue = [{ area: from, route: [] }], visited = new Set([from]);
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index]; if (current.area === to) return current.route;
    for (const edge of world.transitions || []) if (edge.from.areaKey === current.area && allowed(edge) && !visited.has(edge.to.areaKey)) {
      visited.add(edge.to.areaKey); queue.push({ area: edge.to.areaKey, route: [...current.route, edge.id] });
    }
  }
  return null;
}
export function findWaypointRoute(world, fromAreaKey, toAreaKey) {
  const gateOpen = edge => edge.gateKey === null || world.progress?.[edge.gateKey] === true;
  const route = search(world, fromAreaKey, toAreaKey, edge => edge.enabled === true && gateOpen(edge));
  if (route !== null) return { ok: true, reason: null, route };
  const enabled = search(world, fromAreaKey, toAreaKey, edge => edge.enabled === true);
  if (enabled !== null) return { ok: false, reason: 'gate-closed', route: [] };
  return { ok: false, reason: search(world, fromAreaKey, toAreaKey, () => true) === null ? 'no-route' : 'disabled-route', route: [] };
}
export function waypointInRange(point, actorPosition, areaKey, radius) {
  return point?.areaKey === areaKey && Array.isArray(actorPosition) && actorPosition.length === 3 && actorPosition.every(Number.isFinite)
    && (actorPosition[0] - point.position[0]) ** 2 + (actorPosition[1] - point.position[1]) ** 2 <= radius ** 2 + 1e-9
    && Math.abs(actorPosition[2] - point.position[2]) <= 16 + 1e-9;
}
function arrivalReason(world, areaKey, arrivalId) {
  const area = areas(world).find(value => value.areaKey === areaKey);
  const scene = world.scenes.find(value => value.id === area?.sceneId);
  if (!scene?.project) return 'unresolved-scene';
  if (!scene.project.terrainScene || scene.project.rigScene !== undefined) return 'unsupported-scene';
  const arrival = area.entrances.find(value => value.id === arrivalId)?.position;
  if (!arrival) return 'unresolved-arrival';
  const project = scene.project, character = project.characters.find(value => value.id === project.preview.characterId);
  if (!isWalkableCircle(project.map, arrival[0], arrival[1], character.radius)) return 'arrival-blocked';
  // Entry snaps saved Z to the sampled surface before checking radius support.
  // World validation has already checked the scene; no project clone/validation per HUD query.
  const ground = sampleTerrain(project.terrainScene, arrival[0], arrival[1], { validated: true });
  const point = { x: arrival[0], y: arrival[1], z: ground.height };
  if (!canMoveTerrain(project.terrainScene, point, point, character.radius, { validated: true }).ok) return 'arrival-blocked';
  return null;
}
export function getWaypointStatus(world, waypointId, { areaKey = world.state.activeAreaKey, position = null, busy = false, disposed = false, opened = true } = {}) {
  const point = points(world).find(value => value.id === waypointId), state = world.state.waypoints?.[waypointId];
  const status = { id: waypointId, exists: Boolean(point), discovered: state?.discovered === true, active: state?.active === true,
    areaKey: point?.areaKey ?? null, withinDiscovery: false, withinActivation: false,
    canActivate: false, activationReason: null, canTravel: false, travelReason: null, route: [] };
  const unavailable = disposed ? 'disposed' : busy ? 'busy' : !opened ? 'not-open' : !point ? 'unknown-waypoint' : null;
  if (unavailable) { status.activationReason = unavailable; status.travelReason = unavailable; return status; }
  status.withinDiscovery = waypointInRange(point, position, areaKey, point.discoveryRadius);
  status.withinActivation = waypointInRange(point, position, areaKey, point.activationRadius);
  status.activationReason = !status.discovered ? 'undiscovered' : status.active ? 'already-active'
    : point.areaKey !== areaKey ? 'wrong-area' : !status.withinActivation ? 'out-of-range' : null;
  status.canActivate = status.activationReason === null;
  status.travelReason = !status.discovered ? 'undiscovered' : !status.active ? 'inactive'
    : !point.travelGateKeys.every(key => world.progress[key] === true) ? 'gate-closed' : null;
  if (status.travelReason === null) {
    const route = findWaypointRoute(world, areaKey, point.areaKey);
    status.travelReason = route.reason; status.route = route.route;
    if (status.travelReason === null) {
      // Each declared portal on the permitted route must resolve; pending boss regions cannot be skipped.
      for (const edgeId of route.route) {
        const edge = world.transitions.find(value => value.id === edgeId);
        status.travelReason = arrivalReason(world, edge.to.areaKey, edge.to.entranceId);
        if (status.travelReason) break;
      }
      status.travelReason ||= arrivalReason(world, point.areaKey, point.arrivalId);
    }
  }
  status.canTravel = status.travelReason === null;
  return status;
}
