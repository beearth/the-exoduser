import { validateProject, Signals } from './project.js';
import { createTerrainScene } from './terrain-scene.js';
import { attachFixtureWaypoints, validateWorldWaypoints } from './world-waypoints.js?v=0.8.2';

export const WORLD_VERSION = 1;
export const WORLD_LIMITS = Object.freeze({ scenes: 8, areas: 16, transitions: 32,
  entrances: 16, exits: 16, progress: 32, idLength: 120, fileBytes: 8 * 1024 * 1024,
  history: 80, worldSize: 8000, maxHeight: 1024, minPortalRadius: 8,
  maxPortalRadius: 160, portalHeightTolerance: 16, events: 32, waypoints: 64 });
const reserved = new Set(['__proto__', 'prototype', 'constructor']);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const validId = value => typeof value === 'string' && value.trim().length > 0
  && value.length <= 120 && !/[\x00-\x1f\x7f]/.test(value) && !reserved.has(value);
const finite = (value, low, high) => typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high;
const position = value => Array.isArray(value) && value.length === 3
  && finite(value[0], 0, 8000) && finite(value[1], 0, 8000) && finite(value[2], 0, 1024);
const camera = value => plain(value) && finite(value.x, 0, 8000) && finite(value.y, 0, 8000) && typeof value.follow === 'boolean';

function jsonError(root) {
  const pending = [{ value: root, path: 'world', depth: 0 }], ancestors = new Set();
  let count = 0;
  while (pending.length) {
    const item = pending.pop(), value = item.value;
    if (item.leave) { ancestors.delete(value); continue; }
    if (++count > 1000000 || item.depth > 64) return `${item.path}: JSON inspection limit exceeded`;
    if (value === null || typeof value === 'string' || typeof value === 'boolean') continue;
    if (typeof value === 'number' && Number.isFinite(value)) continue;
    if (typeof value !== 'object' || (!Array.isArray(value) && !plain(value))) return `${item.path}: finite plain JSON data required`;
    if (ancestors.has(value)) return `${item.path}: cyclic data rejected`;
    if (Object.getOwnPropertySymbols(value).length) return `${item.path}: symbol keys rejected`;
    ancestors.add(value); pending.push({ ...item, leave: true });
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
      if (Array.isArray(value) && key === 'length') continue;
      if (reserved.has(key)) return `${item.path}.${key}: reserved key`;
      if (!Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) return `${item.path}.${key}: JSON data properties required`;
      if (Array.isArray(value) && (String(Number(key)) !== key || !Number.isInteger(Number(key)) || Number(key) < 0 || Number(key) >= value.length)) return `${item.path}.${key}: array index required`;
      pending.push({ value: descriptor.value, path: `${item.path}.${key}`, depth: item.depth + 1 });
    }
    if (Array.isArray(value)) for (let i = 0; i < value.length; i++) if (!Object.hasOwn(value, i)) return `${item.path}[${i}]: sparse array rejected`;
  }
  return null;
}

export function validateWorldProject(world) {
  const errors = [], error = jsonError(world);
  if (error) return { ok: false, errors: [error] };
  if (!plain(world)) return { ok: false, errors: ['world: object required'] };
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const text = (value, path) => check(typeof value === 'string' && value.trim().length > 0, `${path}: nonempty string required`);
  check(world.worldVersion === WORLD_VERSION, 'worldVersion: must be 1');
  check(validId(world.id), 'id: non-reserved 1..120 character id required'); text(world.name, 'name');
  check(['ENGINE_FIXTURE', 'MAP_PILOT'].includes(world.scope), 'scope: ENGINE_FIXTURE or MAP_PILOT required');
  const list = (value, path, max, min = 0) => {
    check(Array.isArray(value) && value.length >= min && value.length <= max, `${path}: ${min}..${max} entries required`);
    return Array.isArray(value) ? value : [];
  };
  const sceneIds = new Set(), sceneList = list(world.scenes, 'scenes', 8);
  sceneList.forEach((scene, i) => {
    const path = `scenes[${i}]`;
    if (!plain(scene)) { errors.push(`${path}: object required`); return; }
    check(validId(scene.id) && !sceneIds.has(scene.id), `${path}.id: unique valid id required`); sceneIds.add(scene.id);
    text(scene.name, `${path}.name`);
    if (scene.project !== null) {
      const result = validateProject(scene.project, { geometry: false });
      errors.push(...result.errors.map(message => `${path}.project: ${message}`));
    }
    if (Object.hasOwn(scene, 'sourceRef')) text(scene.sourceRef, `${path}.sourceRef`);
  });
  const areaMap = new Map(), areaList = list(world.areas, 'areas', 16, 1);
  areaList.forEach((area, i) => {
    const path = `areas[${i}]`;
    if (!plain(area)) { errors.push(`${path}: object required`); return; }
    check(validId(area.areaKey) && !areaMap.has(area.areaKey), `${path}.areaKey: unique valid id required`); areaMap.set(area.areaKey, area);
    text(area.name, `${path}.name`); text(area.stageRef, `${path}.stageRef`);
    check(area.sceneId === null || (validId(area.sceneId) && sceneIds.has(area.sceneId)), `${path}.sceneId: existing scene id or null required`);
    const entranceIds = new Set();
    list(area.entrances, `${path}.entrances`, 16).forEach((entry, n) => {
      const p = `${path}.entrances[${n}]`;
      if (!plain(entry)) { errors.push(`${p}: object required`); return; }
      check(validId(entry.id) && !entranceIds.has(entry.id), `${p}.id: unique valid id required`); entranceIds.add(entry.id);
      check(entry.position === null || position(entry.position), `${p}.position: world XYZ or null required`);
      check(entry.camera === null || camera(entry.camera), `${p}.camera: x/y/follow or null required`);
    });
    const exitIds = new Set();
    list(area.exits, `${path}.exits`, 16).forEach((entry, n) => {
      const p = `${path}.exits[${n}]`;
      if (!plain(entry)) { errors.push(`${p}: object required`); return; }
      check(validId(entry.id) && !exitIds.has(entry.id), `${p}.id: unique valid id required`); exitIds.add(entry.id);
      check(entry.position === null || position(entry.position), `${p}.position: world XYZ or null required`);
      check(finite(entry.radius, 8, 160), `${p}.radius: 8..160 required`);
      check(validId(entry.transitionId), `${p}.transitionId: valid id required`);
    });
  });
  const progress = world.progress;
  check(plain(progress) && Object.keys(progress).length <= 32, 'progress: object with <=32 keys required');
  if (plain(progress)) for (const [key, value] of Object.entries(progress)) check(validId(key) && typeof value === 'boolean', `progress.${key}: valid key and boolean required`);
  const transitionIds = new Set(), transitionMap = new Map();
  list(world.transitions, 'transitions', 32).forEach((transition, i) => {
    const path = `transitions[${i}]`;
    if (!plain(transition)) { errors.push(`${path}: object required`); return; }
    check(validId(transition.id) && !transitionIds.has(transition.id), `${path}.id: unique valid id required`);
    transitionIds.add(transition.id); transitionMap.set(transition.id, transition);
    const from = transition.from, to = transition.to;
    const fromArea = plain(from) && areaMap.get(from.areaKey), toArea = plain(to) && areaMap.get(to.areaKey);
    const exit = Array.isArray(fromArea?.exits) && fromArea.exits.find(value => value?.id === from?.exitId);
    const entrance = Array.isArray(toArea?.entrances) && toArea.entrances.find(value => value?.id === to?.entranceId);
    check(Boolean(exit) && validId(from?.areaKey) && validId(from?.exitId), `${path}.from: existing area/exit required`);
    check(Boolean(entrance) && validId(to?.areaKey) && validId(to?.entranceId), `${path}.to: existing area/entrance required`);
    check(!exit || exit.transitionId === transition.id, `${path}.from: exit must point to this transition`);
    check(transition.gateKey === null || (validId(transition.gateKey) && plain(progress) && Object.hasOwn(progress, transition.gateKey)), `${path}.gateKey: existing progress key or null required`);
    check(typeof transition.enabled === 'boolean', `${path}.enabled: boolean required`);
  });
  for (const area of areaList) for (const exit of Array.isArray(area?.exits) ? area.exits : []) {
    const transition = transitionMap.get(exit?.transitionId);
    check(Boolean(transition) && transition.from?.areaKey === area.areaKey && transition.from?.exitId === exit.id, `areas.${area.areaKey}.exits.${exit?.id}: matching transition required`);
  }
  const state = world.state;
  if (!plain(state)) errors.push('state: object required');
  else {
    check(validId(state.activeAreaKey) && areaMap.has(state.activeAreaKey), 'state.activeAreaKey: existing area required');
    check(plain(state.regions), 'state.regions: object required');
    if (plain(state.regions)) for (const [key, region] of Object.entries(state.regions)) {
      check(areaMap.has(key), `state.regions.${key}: existing area required`);
      if (!plain(region)) { errors.push(`state.regions.${key}: object required`); continue; }
      check(Number.isSafeInteger(region.visits) && region.visits >= 0, `state.regions.${key}.visits: nonnegative safe integer required`);
      check(Object.hasOwn(region, 'data'), `state.regions.${key}.data: JSON value required`);
      if (Object.hasOwn(region, 'actorPosition')) check(position(region.actorPosition), `state.regions.${key}.actorPosition: world XYZ required`);
      if (Object.hasOwn(region, 'camera')) check(camera(region.camera), `state.regions.${key}.camera: x/y/follow required`);
    }
  }
  errors.push(...validateWorldWaypoints(world).errors);
  if (errors.length === 0) {
    const bytes = new TextEncoder().encode(JSON.stringify(world)).byteLength;
    check(bytes <= WORLD_LIMITS.fileBytes, `world: compact UTF-8 JSON exceeds ${WORLD_LIMITS.fileBytes} bytes`);
  }
  return { ok: errors.length === 0, errors };
}

export class WorldProjectValidationError extends Error {
  constructor(errors) { super(errors.join('\n')); this.name = 'WorldProjectValidationError'; this.errors = [...errors]; }
}
function assertWorld(world) {
  const result = validateWorldProject(world);
  if (!result.ok) throw new WorldProjectValidationError(result.errors);
}

export function createWorldFixture(baseFDGProject) {
  const result = validateProject(baseFDGProject, { geometry: false });
  if (!result.ok) throw new WorldProjectValidationError(result.errors);
  const a = structuredClone(baseFDGProject); delete a.rigScene;
  a.terrainScene = a.terrainScene ? structuredClone(a.terrainScene) : createTerrainScene(a.map);
  a.terrainScene.camera.zoom = 0.7;
  const b = structuredClone(a);
  a.id = 'engine_fixture_scene_a'; a.name = '엔진 지역전환 시험 A';
  b.id = 'engine_fixture_scene_b'; b.name = '엔진 지역전환 시험 B';
  b.terrainScene.camera.yaw = -0.45;
  const platform = b.terrainScene.resources.find(resource => resource.id === 'platform');
  if (platform) platform.color = '#A58CBA';
  const cx = (a.map.start.x + 0.5) * a.map.tileSize, cy = (a.map.start.y + 0.5) * a.map.tileSize;
  const entry = () => ({ id: 'arrival', position: [cx, cy, 0], camera: null });
  const world = {
    worldVersion: 1, id: 'engine_fixture_world', name: 'FDG 엔진 지역전환 시험', scope: 'ENGINE_FIXTURE',
    scenes: [{ id: 'scene_a', name: '시험 A', project: a }, { id: 'scene_b', name: '시험 B', project: b }],
    areas: [
      { areaKey: 'engine_fixture_a', name: '엔진 시험 지역 A', stageRef: 'ENGINE_FIXTURE/A', sceneId: 'scene_a', entrances: [entry()], exits: [{ id: 'to_b', position: [cx + 62.4, cy, 0], radius: 12, transitionId: 'a_to_b' }] },
      { areaKey: 'engine_fixture_b', name: '엔진 시험 지역 B', stageRef: 'ENGINE_FIXTURE/B', sceneId: 'scene_b', entrances: [entry()], exits: [{ id: 'to_a', position: [cx - 62.4, cy, 0], radius: 12, transitionId: 'b_to_a' }] },
    ],
    transitions: [
      { id: 'a_to_b', from: { areaKey: 'engine_fixture_a', exitId: 'to_b' }, to: { areaKey: 'engine_fixture_b', entranceId: 'arrival' }, gateKey: 'fixture_gate_open', enabled: true },
      { id: 'b_to_a', from: { areaKey: 'engine_fixture_b', exitId: 'to_a' }, to: { areaKey: 'engine_fixture_a', entranceId: 'arrival' }, gateKey: null, enabled: true },
    ],
    progress: { fixture_gate_open: false },
    state: { activeAreaKey: 'engine_fixture_a', regions: { engine_fixture_a: { visits: 0, data: {} }, engine_fixture_b: { visits: 0, data: {} } } },
  };
  const withWaypoints = attachFixtureWaypoints(world);
  assertWorld(withWaypoints); return withWaypoints;
}

export class WorldProjectStore {
  #project; #past = []; #future = [];
  signals = new Signals();
  constructor(project) { assertWorld(project); this.#project = structuredClone(project); }
  get project() { return structuredClone(this.#project); }
  get canUndo() { return this.#past.length > 0; }
  get canRedo() { return this.#future.length > 0; }
  change(label, mutate) { const next = this.project; mutate(next); return this.replace(next, label); }
  replace(project, label = '지역 프로젝트 불러오기') {
    assertWorld(project);
    if (JSON.stringify(project) === JSON.stringify(this.#project)) return false;
    this.#past.push({ project: this.#project, label });
    if (this.#past.length > 80) this.#past.shift();
    this.#project = structuredClone(project); this.#future = [];
    this.signals.emit('changed', { project: this.project, label }); return true;
  }
  undo() {
    if (!this.canUndo) return false;
    const item = this.#past.pop(); this.#future.push({ project: this.#project, label: item.label }); this.#project = item.project;
    this.signals.emit('changed', { project: this.project, label: `${item.label} 취소` }); return true;
  }
  redo() {
    if (!this.canRedo) return false;
    const item = this.#future.pop(); this.#past.push({ project: this.#project, label: item.label }); this.#project = item.project;
    this.signals.emit('changed', { project: this.project, label: `${item.label} 다시 실행` }); return true;
  }
  dispose() { this.signals.clear(); }
}
