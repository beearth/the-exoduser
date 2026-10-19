import { validateWorldProject, WorldProjectValidationError, WORLD_LIMITS } from './world-project.js?v=0.8.2';
import { validateProject } from './project.js';
import { getWaypointStatus, waypointInRange } from './world-waypoints.js?v=0.8.2';

const clone = value => structuredClone(value);

/** World transition state only. The existing FDGRuntime owns input, time and rendering. */
export class WorldRuntime {
  constructor(owner, world, { onChange, onStatus } = {}) {
    const result = validateWorldProject(world);
    if (!result.ok) throw new WorldProjectValidationError(result.errors);
    if (!owner || typeof owner.enterScene !== 'function' || typeof owner.captureSceneState !== 'function') throw new TypeError('WorldRuntime requires FDGRuntime scene entry/capture APIs');
    this.owner = owner;
    this._world = clone(world);
    this.onChange = onChange; this.onStatus = onStatus;
    this._busy = false; this._pending = null; this._disposed = false; this._opened = false;
    this._generation = 0; this._inside = new Map(); this._events = []; this._sequence = 0;
    this.latestResult = { ok: false, reason: 'not-open', areaKey: world.state.activeAreaKey };
  }
  get world() { return clone(this._world); }
  get busy() { return this._busy; }
  get pending() { return this._pending; }
  get disposed() { return this._disposed; }
  get opened() { return this._opened && !this._disposed; }
  get events() { return clone(this._events); }
  get ownedRaf() { return 0; }
  get ownedListeners() { return 0; }
  get ownedTimers() { return 0; }

  /** Bounded HUD/map data. Never clones scene projects, region data or authored metadata. */
  getViewState() {
    const w = this._world;
    const copyPosition = p => p === null ? null : [...p];
    return { worldVersion: w.worldVersion, id: w.id, name: w.name, scope: w.scope,
      progress: { ...w.progress }, state: { activeAreaKey: w.state.activeAreaKey,
        regions: Object.fromEntries(Object.entries(w.state.regions).map(([key, region]) => [key, { visits: region.visits }])),
        waypoints: Object.fromEntries(Object.entries(w.state.waypoints || {}).map(([key, state]) => [key, { discovered: state.discovered, active: state.active }])) },
      areas: w.areas.map(area => ({ areaKey: area.areaKey, name: area.name, stageRef: area.stageRef, sceneId: area.sceneId,
        entrances: area.entrances.map(entry => ({ id: entry.id, position: copyPosition(entry.position), camera: entry.camera === null ? null : { x: entry.camera.x, y: entry.camera.y, follow: entry.camera.follow } })),
        exits: area.exits.map(exit => ({ id: exit.id, position: copyPosition(exit.position), radius: exit.radius, transitionId: exit.transitionId })) })),
      transitions: w.transitions.map(edge => ({ id: edge.id, from: { areaKey: edge.from.areaKey, exitId: edge.from.exitId }, to: { areaKey: edge.to.areaKey, entranceId: edge.to.entranceId }, gateKey: edge.gateKey, enabled: edge.enabled })),
      waypoints: (w.waypoints || []).map(point => ({ id: point.id, name: point.name, areaKey: point.areaKey, position: [...point.position],
        discoveryRadius: point.discoveryRadius, activationRadius: point.activationRadius, arrivalId: point.arrivalId, travelGateKeys: [...point.travelGateKeys] })),
      latestResult: clone(this.latestResult), opened: this.opened, busy: this.busy, disposed: this.disposed };
  }

  _result(reason, extra = {}) { return { ok: reason === null, reason, areaKey: this._world.state.activeAreaKey, ...extra }; }
  _publish(result, type, changed = false) {
    if (this._disposed) return result;
    this.latestResult = clone(result);
    const event = { sequence: ++this._sequence, type, ...clone(result) };
    this._events.push(event);
    if (this._events.length > WORLD_LIMITS.events) this._events.shift();
    if (changed) this.onChange?.(clone(this._world), clone(event));
    if (!this._disposed) this.onStatus?.(clone(result));
    return result;
  }
  _area(key = this._world.state.activeAreaKey, world = this._world) { return world.areas.find(area => area.areaKey === key); }
  _insideExit(exit) {
    const player = this.owner.player;
    if (!exit.position || !player || !Number.isFinite(player.x) || !Number.isFinite(player.y)) return false;
    return (player.x - exit.position[0]) ** 2 + (player.y - exit.position[1]) ** 2 <= exit.radius ** 2 + 1e-9
      && Math.abs((player.z ?? 0) - exit.position[2]) <= WORLD_LIMITS.portalHeightTolerance + 1e-9;
  }
  _latch() {
    this._inside.clear();
    for (const exit of this._area()?.exits || []) this._inside.set(exit.id, this._insideExit(exit));
  }
  _prepare(world, area, entrance, restore) {
    const scene = world.scenes.find(value => value.id === area?.sceneId);
    if (!scene?.project) return { error: 'unresolved-scene' };
    // Image/rig preload and recovery is a later consumer. This first slice is CPU terrain only.
    if (!scene.project.terrainScene || scene.project.rigScene !== undefined) return { error: 'unsupported-scene' };
    const validation = validateProject(scene.project, { geometry: false });
    if (!validation.ok) return { error: 'invalid-scene', detail: validation.errors.join('\n') };
    const region = world.state.regions[area.areaKey];
    const arrival = restore && region?.actorPosition ? region.actorPosition : entrance?.position;
    if (!arrival) return { error: 'unresolved-arrival' };
    const camera = restore && region?.actorPosition && region.camera ? region.camera : entrance?.camera;
    if (!(restore && region?.actorPosition) && region?.visits === Number.MAX_SAFE_INTEGER) return { error: 'visit-limit' };
    return { project: clone(scene.project), arrival: clone(arrival), camera: camera === null || camera === undefined ? undefined : clone(camera), restored: Boolean(restore && region?.actorPosition) };
  }
  _saveArea(world, area, capture) {
    if (!capture?.project || !Array.isArray(capture.actorPosition) || !capture.camera) throw new TypeError('Owner captureSceneState returned an incomplete snapshot');
    const scene = world.scenes.find(value => value.id === area.sceneId);
    if (!scene) throw new TypeError('Active area has no resolved source scene');
    scene.project = clone(capture.project);
    const region = world.state.regions[area.areaKey] ||= { visits: 0, data: {} };
    region.actorPosition = clone(capture.actorPosition); region.camera = clone(capture.camera);
  }
  _run(action) {
    if (this._disposed) return Promise.resolve(this._result('disposed'));
    if (this._busy) return Promise.resolve(this._result('busy'));
    this._busy = true;
    const generation = ++this._generation;
    const task = Promise.resolve().then(() => action(generation));
    const settled = task.catch(error => {
      if (this._disposed || generation !== this._generation) return this._result('disposed');
      return this._publish(this._result('entry-failed', { detail: error instanceof Error ? error.message : String(error) }), 'rejected');
    }).finally(() => {
      if (this._pending === settled) { this._pending = null; this._busy = false; }
    });
    this._pending = settled;
    return settled;
  }

  open({ restore = true } = {}) {
    if (this._disposed) return Promise.resolve(this._result('disposed'));
    if (this._busy) return Promise.resolve(this._result('busy'));
    const area = this._area(), prepared = this._prepare(this._world, area, area.entrances[0], restore);
    if (prepared.error) return Promise.resolve(this._publish(this._result(prepared.error, prepared.detail ? { detail: prepared.detail } : {}), 'rejected'));
    return this._run(async generation => {
      if (this._disposed || generation !== this._generation) return this._result('disposed');
      this.owner.pause();
      await this.owner.enterScene(prepared.project, { arrival: prepared.arrival, camera: prepared.camera });
      if (this._disposed || generation !== this._generation) return this._result('disposed');
      const next = clone(this._world), nextArea = this._area(area.areaKey, next);
      this._saveArea(next, nextArea, this.owner.captureSceneState());
      if (!prepared.restored) next.state.regions[area.areaKey].visits++;
      this._world = next; this._opened = true; this._latch();
      return this._publish(this._result(null, { restored: prepared.restored }), 'open', true);
    });
  }

  /** Edge detection is synchronous; actual entry returns the shared pending Promise. */
  observe() {
    if (this._disposed) return this._result('disposed');
    if (this._busy) return this._result('busy');
    if (!this._opened) return this._result('not-open');
    this.discover();
    if (this._disposed) return this._result('disposed');
    if (this._busy) return this._result('busy');
    const area = this._area();
    let edge = null, insideAny = false;
    for (const exit of area.exits) {
      const inside = this._insideExit(exit), wasInside = this._inside.get(exit.id) ?? false;
      this._inside.set(exit.id, inside); insideAny ||= inside;
      if (inside && !wasInside && !edge) edge = exit;
    }
    if (!edge) return this._result(insideAny ? 'latched' : 'outside-exit');
    const transition = this._world.transitions.find(value => value.id === edge.transitionId);
    const extra = { transitionId: transition.id, fromAreaKey: area.areaKey, toAreaKey: transition.to.areaKey };
    if (!transition.enabled) return this._publish(this._result('disabled', extra), 'rejected');
    if (transition.gateKey !== null && !this._world.progress[transition.gateKey]) return this._publish(this._result('gate-closed', extra), 'rejected');
    const targetArea = this._area(transition.to.areaKey), entrance = targetArea.entrances.find(value => value.id === transition.to.entranceId);
    const prepared = this._prepare(this._world, targetArea, entrance, false);
    if (prepared.error) return this._publish(this._result(prepared.error, { ...extra, ...(prepared.detail ? { detail: prepared.detail } : {}) }), 'rejected');
    return this._enterPrepared(targetArea, prepared, extra, 'transition');
  }

  _enterPrepared(targetArea, prepared, extra, type) {
    const sourceAreaKey = this._world.state.activeAreaKey;
    return this._run(async generation => {
      if (this._disposed || generation !== this._generation) return this._result('disposed');
      this.owner.pause();
      const next = clone(this._world);
      this._saveArea(next, this._area(sourceAreaKey, next), this.owner.captureSceneState());
      await this.owner.enterScene(prepared.project, { arrival: prepared.arrival, camera: prepared.camera });
      if (this._disposed || generation !== this._generation) return this._result('disposed');
      next.state.activeAreaKey = targetArea.areaKey;
      const nextTarget = this._area(targetArea.areaKey, next);
      this._saveArea(next, nextTarget, this.owner.captureSceneState());
      next.state.regions[targetArea.areaKey].visits++;
      this._world = next; this._latch();
      return this._publish(this._result(null, extra), type, true);
    });
  }

  waypointStatus(id) {
    return getWaypointStatus(this._world, id, { areaKey: this._world.state.activeAreaKey,
      position: this.owner ? [this.owner.player.x, this.owner.player.y, this.owner.player.z ?? 0] : null,
      busy: this._busy, disposed: this._disposed, opened: this._opened });
  }
  discover(id) {
    if (this._disposed) return this._result('disposed');
    if (this._busy) return this._result('busy');
    if (!this._opened) return this._result('not-open');
    const definitions = this._world.waypoints || [];
    if (id !== undefined && !definitions.some(point => point.id === id)) return this._result('unknown-waypoint');
    const actor = [this.owner.player.x, this.owner.player.y, this.owner.player.z ?? 0];
    const discovered = definitions.filter(point => (id === undefined || id === point.id)
      && !this._world.state.waypoints?.[point.id]?.discovered
      && waypointInRange(point, actor, this._world.state.activeAreaKey, point.discoveryRadius));
    if (!discovered.length) return this._result('outside-waypoint', { waypointIds: [] });
    this._world = this.capture(); this._world.state.waypoints ||= {};
    for (const point of discovered) {
      const state = this._world.state.waypoints[point.id] ||= { discovered: false, active: false };
      state.discovered = true;
    }
    return this._publish(this._result(null, { waypointIds: discovered.map(point => point.id) }), 'waypoint-discovered', true);
  }
  activateWaypoint(id) {
    if (this._disposed) return this._result('disposed');
    if (this._busy) return this._result('busy');
    if (!this._opened) return this._result('not-open');
    this.discover(id);
    if (this._disposed) return this._result('disposed');
    const status = this.waypointStatus(id);
    if (!status.canActivate) return this._publish(this._result(status.activationReason, { waypointId: id }), 'rejected');
    this._world = this.capture(); this._world.state.waypoints[id].active = true;
    return this._publish(this._result(null, { waypointId: id }), 'waypoint-activated', true);
  }
  travelWaypoint(id) {
    if (this._disposed) return Promise.resolve(this._result('disposed'));
    if (this._busy) return Promise.resolve(this._result('busy'));
    const status = this.waypointStatus(id);
    const extra = { waypointId: id, fromAreaKey: this._world.state.activeAreaKey, toAreaKey: status.areaKey, route: status.route };
    if (!status.canTravel) return Promise.resolve(this._publish(this._result(status.travelReason, extra), 'rejected'));
    const point = this._world.waypoints.find(value => value.id === id), targetArea = this._area(point.areaKey);
    const entrance = targetArea.entrances.find(value => value.id === point.arrivalId);
    const prepared = this._prepare(this._world, targetArea, entrance, false);
    if (prepared.error) return Promise.resolve(this._publish(this._result(prepared.error, { ...extra, ...(prepared.detail ? { detail: prepared.detail } : {}) }), 'rejected'));
    return this._enterPrepared(targetArea, prepared, extra, 'waypoint-travel');
  }

  capture() {
    const next = clone(this._world);
    if (!this._disposed && this._opened && !this._busy) this._saveArea(next, this._area(undefined, next), this.owner.captureSceneState());
    return next;
  }
  setProgress(key, value) {
    if (this._disposed || this._busy || typeof value !== 'boolean' || !Object.hasOwn(this._world.progress, key) || this._world.progress[key] === value) return false;
    this._world = this.capture(); this._world.progress[key] = value;
    this._publish(this._result(null, { key, value }), 'progress', true); return true;
  }
  setRegionData(areaKey, data) {
    if (this._disposed || this._busy || !this._area(areaKey)) return false;
    const next = this.capture(), region = next.state.regions[areaKey] ||= { visits: 0, data: {} };
    try { region.data = clone(data); } catch { return false; }
    if (!validateWorldProject(next).ok || JSON.stringify(next) === JSON.stringify(this._world)) return false;
    this._world = next; this._publish(this._result(null, { regionAreaKey: areaKey }), 'region', true); return true;
  }
  async walk(direction) {
    if (this._disposed) return this._result('disposed');
    if (this._busy) return this._result('busy');
    if (!this._opened) return this._result('not-open');
    const sequence = this._sequence;
    if (typeof this.owner.walkTerrain !== 'function' || !this.owner.walkTerrain(direction)) return this._result('invalid-direction');
    // Owner onStats may already have started a transition while walkTerrain rendered.
    if (this._pending) return await this._pending;
    return this._sequence !== sequence ? clone(this.latestResult) : await this.observe();
  }
  dispose() {
    if (this._disposed) return;
    this._disposed = true; this._opened = false; this._generation++;
    this._busy = false; this._pending = null; this._inside.clear();
    this.owner = null;
    this.onChange = null; this.onStatus = null;
  }
}
