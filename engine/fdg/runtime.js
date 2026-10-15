/** FDG's independent Canvas2D preview runtime. Time is seconds, world units are pixels. */
import { RigSceneRuntime, RIG_SCENE_TRANSITION_SECONDS } from './rig-scene-runtime.js?v=perspective-r1-c';
import { TerrainSceneRuntime } from './terrain-runtime.js';
import { isLocalAsset, LIMITS, validateProject } from './project.js?v=perspective-r1';
import { SourceSceneRuntime } from './source-scene-runtime.js?v=0.10.0';
import { SourcePreviewRuntime } from './source-preview-runtime.js?v=0.17.1';
import { createWorldProjection } from './world-camera.js?v=perspective-r1';
import { drawRigTextureTriangle } from './rig-texture.js?v=torso-depth-r7';

export const FIXED_STEP = 1 / 60;
export const MAX_FRAME_DELTA = 0.25;
export const MAX_SUBSTEPS = 6;
export const MAX_PARTICLES = 1024;
export const ASSET_TIMEOUT_MS = 8000;
export const MAX_PIXEL_RATIO = 2;
const EPSILON = 1e-9;
const TAU = Math.PI * 2;
const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);
const MOVE_DIRECTIONS = Object.freeze({ west: [-1, 0], north: [0, -1], south: [0, 1], east: [1, 0] });
const TILE_COLORS = ['#111218', '#273134', '#3b2831', '#26384a'];
const number = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const positive = (value, fallback = 0) => Math.max(0, number(value, fallback));
const now = () => globalThis.performance?.now?.() ?? Date.now();

// Screen clipping is used only to bound the ground tiles queried by the authored camera.
function clipViewportPolygon(points, width, height) {
  let polygon = points;
  for (const [axis, boundary, sign] of [['x', 0, 1], ['x', width, -1], ['y', 0, 1], ['y', height, -1]]) {
    const output = [];
    if (!polygon.length) break;
    let previous = polygon.at(-1), previousInside = sign * (previous[axis] - boundary) >= 0;
    for (const current of polygon) {
      const inside = sign * (current[axis] - boundary) >= 0;
      if (inside !== previousInside) {
        const t = (boundary - previous[axis]) / (current[axis] - previous[axis]);
        output.push({ x: previous.x + (current.x - previous.x) * t, y: previous.y + (current.y - previous.y) * t });
      }
      if (inside) output.push(current);
      previous = current; previousInside = inside;
    }
    polygon = output;
  }
  return polygon;
}

/** start is a column offset; frames may continue onto the following atlas row. */
export function animationFrame(sprite = {}, animation = {}, seconds = 0, rowOverride) {
  const columns = Math.max(1, Math.floor(number(sprite.columns, 1)));
  const rows = Math.max(1, Math.floor(number(sprite.rows, 1)));
  const total = clamp(Math.floor(number(sprite.frames, columns * rows)), 1, columns * rows);
  const row = clamp(Math.floor(number(rowOverride, number(animation.row, 0))), 0, rows - 1);
  const start = clamp(Math.floor(number(animation.start, 0)), 0, columns - 1);
  const first = Math.min(total - 1, row * columns + start);
  const frames = clamp(Math.floor(number(animation.frames, total - first)), 1, total - first);
  const tick = Math.floor(positive(seconds) * positive(animation.fps, positive(sprite.fps, 8)) + EPSILON);
  const local = animation.loop === false ? Math.min(frames - 1, tick) : tick % frames;
  const index = first + local;
  const frameWidth = Math.max(1, number(sprite.frameWidth, 1));
  const frameHeight = Math.max(1, number(sprite.frameHeight, 1));
  return { index, column: index % columns, row: Math.floor(index / columns),
    sx: index % columns * frameWidth, sy: Math.floor(index / columns) * frameHeight,
    sw: frameWidth, sh: frameHeight, finished: animation.loop === false && tick >= frames };
}

/** Reusable particle records, including ring segments and straight projectiles. */
export class ParticleSystem {
  constructor({ budget = MAX_PARTICLES, random = Math.random } = {}) {
    this.budget = clamp(Math.floor(number(budget, MAX_PARTICLES)), 1, MAX_PARTICLES);
    this.random = random;
    this.pool = Array.from({ length: this.budget }, (_, index) => ({ index, active: false }));
    this.active = [];
    this.free = Array.from({ length: this.budget }, (_, index) => this.budget - index - 1);
    this.dropped = 0;
  }

  get count() { return this.active.length; }

  emit(definition, position = { x: 0, y: 0 }, { target, angle, sequenceId = null, activationId = null } = {}) {
    if (!definition || positive(definition.life) === 0) return 0;
    const requested = Math.floor(positive(definition.count));
    const count = Math.min(requested, this.free.length);
    this.dropped += requested - count;
    const kind = ['burst', 'ring', 'projectile'].includes(definition.kind) ? definition.kind : 'burst';
    const x = number(position.x), y = number(position.y);
    const aim = number(angle, target ? Math.atan2(target.y - y, target.x - x) : -Math.PI / 2);
    const spread = clamp(positive(definition.spread, TAU), 0, TAU);
    for (let i = 0; i < count; i += 1) {
      const p = this.pool[this.free.pop()];
      p.active = true;
      p.kind = kind;
      p.x = x; p.y = y;
      p.age = 0;
      p.life = definition.life;
      p.size = positive(definition.size, 4);
      p.speed = positive(definition.speed);
      p.sprite = i === 0 ? definition.sprite || null : null;
      p.angle = kind === 'ring' ? TAU * i / Math.max(1, count)
        : p.sprite && kind === 'projectile' ? aim : aim + (this.random() - 0.5) * spread;
      p.arc = count === 1 ? TAU : TAU / count * 0.9;
      const stationary = kind === 'ring' || p.sprite && kind === 'burst';
      p.vx = stationary ? 0 : Math.cos(p.angle) * p.speed;
      p.vy = stationary ? 0 : Math.sin(p.angle) * p.speed;
      p.color = definition.color || '#f4bd78';
      p.vfxId = definition.id;
      p.sequenceId = sequenceId; p.activationId = activationId;
      this.active.push(p.index);
    }
    return count;
  }

  update(seconds) {
    const dt = positive(seconds);
    for (let i = this.active.length - 1; i >= 0; i -= 1) {
      const p = this.pool[this.active[i]];
      p.age += dt;
      if (p.age + EPSILON >= p.life) {
        p.active = false;
        p.sprite = null;
        p.sequenceId = null; p.activationId = null;
        this.free.push(p.index);
        this.active[i] = this.active[this.active.length - 1];
        this.active.pop();
      } else {
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
    }
  }

  clear() {
    for (const index of this.active) {
      this.pool[index].active = false;
      this.pool[index].sprite = null;
      this.pool[index].sequenceId = null; this.pool[index].activationId = null;
      this.free.push(index);
    }
    this.active.length = 0;
    this.dropped = 0;
  }
}

/** Preview resource and cooldown accounting; no enemy scheduling or attack tickets. */
export class SkillSystem {
  constructor(skills = [], { resourceMax = 100, resourceRegen = 10, onCast } = {}) {
    this.definitions = new Map(skills.map(skill => [skill.id, skill]));
    this.cooldowns = new Map(skills.map(skill => [skill.id, 0]));
    this.resourceMax = positive(resourceMax);
    this.resourceRegen = positive(resourceRegen);
    this.resource = this.resourceMax;
    this.onCast = onCast;
    this.castCount = 0;
  }

  update(seconds) {
    const dt = positive(seconds);
    this.resource = Math.min(this.resourceMax, this.resource + this.resourceRegen * dt);
    for (const [id, remaining] of this.cooldowns) {
      const next = remaining - dt;
      this.cooldowns.set(id, next <= EPSILON ? 0 : next);
    }
  }

  getState(id) {
    const skill = this.definitions.get(id);
    const cooldown = this.cooldowns.get(id) ?? 0;
    return { id, resource: this.resource, resourceMax: this.resourceMax, cooldown,
      cooldownRemaining: cooldown, ready: Boolean(skill) && cooldown <= EPSILON && this.resource + EPSILON >= positive(skill.cost) };
  }

  cast(id, origin = { x: 0, y: 0 }, target = origin) {
    const skill = this.definitions.get(id);
    if (!skill) return { ok: false, reason: 'unknown-skill', skillId: id };
    if ((this.cooldowns.get(id) ?? 0) > EPSILON) return { ok: false, reason: 'cooldown', skillId: id };
    const cost = positive(skill.cost);
    if (this.resource + EPSILON < cost) return { ok: false, reason: 'resource', skillId: id };
    const from = { x: number(origin.x), y: number(origin.y) };
    let dx = number(target?.x, from.x) - from.x;
    let dy = number(target?.y, from.y) - from.y;
    const distance = Math.hypot(dx, dy);
    const range = positive(skill.range);
    if (distance > range && distance > 0) { dx *= range / distance; dy *= range / distance; }
    const result = { ok: true, skillId: id, skill, origin: from,
      target: { x: from.x + dx, y: from.y + dy }, damage: positive(skill.damage) };
    this.resource = Math.max(0, this.resource - cost);
    this.cooldowns.set(id, positive(skill.cooldown));
    this.castCount += 1;
    this.onCast?.(result);
    return result;
  }
}

/** Only tile 1 is traversable. Circle/rectangle tests preserve the character radius. */
export function isWalkableCircle(map, x, y, radius = 0) {
  const size = number(map?.tileSize, 40);
  const width = Math.floor(number(map?.width)), height = Math.floor(number(map?.height));
  const r = positive(radius);
  if (!map?.tiles || size <= 0 || x - r < 0 || y - r < 0 || x + r > width * size || y + r > height * size) return false;
  if (r === 0) return map.tiles[Math.floor(y / size) * width + Math.floor(x / size)] === 1;
  const left = Math.max(0, Math.floor((x - r) / size));
  const right = Math.min(width - 1, Math.floor((x + r - EPSILON) / size));
  const top = Math.max(0, Math.floor((y - r) / size));
  const bottom = Math.min(height - 1, Math.floor((y + r - EPSILON) / size));
  for (let ty = top; ty <= bottom; ty += 1) {
    for (let tx = left; tx <= right; tx += 1) {
      if (map.tiles[ty * width + tx] === 1) continue;
      const dx = x - clamp(x, tx * size, (tx + 1) * size);
      const dy = y - clamp(y, ty * size, (ty + 1) * size);
      if (dx * dx + dy * dy < r * r - EPSILON) return false;
    }
  }
  return true;
}

function movementDirection(dx, dy) {
  if (dy < 0) return dx < 0 ? 'north-west' : dx > 0 ? 'north-east' : 'north';
  if (dy > 0) return dx < 0 ? 'south-west' : dx > 0 ? 'south-east' : 'south';
  return dx < 0 ? 'west' : 'east';
}

function directionSource(sprite, direction) {
  const directions = sprite?.directions;
  return directions?.[direction] || directions?.[direction.replaceAll('-', '')]
    || directions?.[direction.replaceAll('-', '_')] || sprite?.src;
}

export class FDGRuntime {
  constructor(canvas, project, { onStats, onError, assetBase = '/' } = {}) {
    if (!canvas?.getContext) throw new TypeError('FDGRuntime requires a canvas.');
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    if (!this.context) throw new Error('Canvas2D is unavailable.');
    this.onStats = onStats;
    this.onError = onError;
    this.assetBase = assetBase;
    this.window = canvas.ownerDocument?.defaultView ?? globalThis.window;
    this.assets = new Map();
    this._pendingAssets = new Set();
    this._listeners = [];
    this._keys = new Set();
    this._moveInputDirection = null;
    this._particles = new ParticleSystem();
    this._state = 'ready';
    this._inputEnabled = true;
    this._camera = { x: 0, y: 0, follow: true };
    this._player = { x: 0, y: 0, radius: 12, direction: 'south', animation: 'idle' };
    this._animationTime = 0;
    this._rowOverride = undefined;
    this._forcedAnimation = null;
    this._accumulator = 0;
    this._lastTimestamp = null;
    this._raf = null;
    this._loadVersion = 0;
    this._errors = [];
    this._sceneExits = [];
    this._metrics = { fps: 0, frameDeltaMs: 0, updateMs: 0, renderMs: 0, updateSteps: 0, droppedSteps: 0,
      droppedTime: 0, frame: 0, time: 0, drawCalls: 0, visibleTiles: 0, visibleObjects: 0 };
    this._hadTabIndex = canvas.hasAttribute?.('tabindex') ?? false;
    if (!this._hadTabIndex) canvas.setAttribute?.('tabindex', '0');
    this._applyProject(project);
    this._bindInput();
    this.resize();
  }

  get project() { return this._project; }
  get player() { return this._player; }
  get camera() { return this._camera; }
  get particles() { return this._particles; }
  /** Explicit observation of active sheet playback; never advances or renders the owner. */
  getVfxPlaybackSnapshot() {
    const snapshot = [];
    if (this.state === 'disposed') return snapshot;
    for (const index of this._particles.active) {
      const particle = this._particles.pool[index], sprite = particle?.sprite;
      if (!particle?.active || !sprite) continue;
      const frame = animationFrame(sprite, { loop: false }, particle.age);
      const columns = Math.max(1, Math.floor(number(sprite.columns, 1)));
      const rows = Math.max(1, Math.floor(number(sprite.rows, 1)));
      snapshot.push({
        definitionId: particle.vfxId, particleIndex: particle.index, src: sprite.src,
        age: particle.age, life: particle.life, frameIndex: frame.index,
        cell: { sx: frame.sx, sy: frame.sy, sw: frame.sw, sh: frame.sh },
        frames: clamp(Math.floor(number(sprite.frames, columns * rows)), 1, columns * rows),
        fps: positive(sprite.fps, 8), alpha: Math.max(0, 1 - particle.age / particle.life),
        loop: false, finished: frame.finished,
        ...(particle.sequenceId === null || particle.sequenceId === undefined ? {} : { sequenceId: particle.sequenceId, activationId: particle.activationId }),
      });
    }
    return snapshot;
  }
  get skills() { return this._skills; }
  get state() { return this._state; }
  get moveInputDirection() { return this._moveInputDirection; }
  /** Accessible held movement; consumed only by the existing owner clock. */
  setMoveInput(direction) {
    if (direction === null) { this.clearInput(); return this.state !== 'disposed'; }
    if (typeof direction !== 'string' || !Object.hasOwn(MOVE_DIRECTIONS, direction) || !this._inputEnabled || this.state !== 'running') return false;
    this._keys.clear();
    this._moveInputDirection = direction;
    return true;
  }
  /** Paused map authoring: one collision-checked step, without advancing owner time. */
  walkMap(direction, { distance = 10 } = {}) {
    if (this.state !== 'paused' || this._sourcePreview || this._sourceScene || this._terrainScene || this._rigScene ||
      typeof direction !== 'string' || !Object.hasOwn(MOVE_DIRECTIONS, direction) ||
      !Number.isFinite(distance) || distance <= 0 || distance > 10) return false;
    const map = this.project.map, actor = this.player;
    const [dx, dy] = MOVE_DIRECTIONS[direction];
    const x = actor.x + dx * distance, y = actor.y + dy * distance;
    if (!isWalkableCircle(map, actor.x, actor.y, actor.radius) || !isWalkableCircle(map, x, y, actor.radius)) return false;
    actor.x = x; actor.y = y; actor.direction = direction;
    if (this.camera.follow) { this.camera.x = x; this.camera.y = y; this._clampCamera(); }
    this.renderOnce();
    return true;
  }
  get sourceSceneReady() { return !!this._sourceScene && this._sourceImagesReady === true; }
  get sourcePreviewReady() { return !!this._sourcePreview && this._sourcePreviewImagesReady === true; }
  getSourcePreviewSnapshot() { return this._sourcePreview?.snapshot(this.player, this.camera) || null; }
  captureSourcePreview() { return this._sourcePreview?.capture(this.player, this.camera) || null; }
  moveSourcePreview(dx, dy) {
    if (!this.sourcePreviewReady || this.state === 'running' || !Number.isFinite(dx) || !Number.isFinite(dy) ||
      Math.hypot(dx, dy) > this.project.map.tileSize / 4) return false;
    const moved = this._sourcePreview.move(this.player, this.player.x + dx, this.player.y + dy);
    if (moved && this.camera.follow) { this.camera.x = this.player.x; this.camera.y = this.player.y - (this._sourcePreview?.scene.heightPreview ? this.player.z : 0); this._clampCamera(); }
    this.renderOnce(); return moved;
  }
  getSourceSceneSnapshot() { return this._sourceScene?.snapshot(this.player) || null; }
  captureSourceScene() { return this._sourceScene?.capture(this.player, this.camera) || null; }
  moveSource(dx, dy) {
    if (!this._sourceScene || !this.sourceSceneReady || !Number.isFinite(dx) || !Number.isFinite(dy) || Math.hypot(dx, dy) > this.project.map.tileSize / 4) return false;
    const moved = this._sourceScene.move(this.player, this.player.x + dx, this.player.y + dy);
    if (moved && this.camera.follow) { this.camera.x = this.player.x; this.camera.y = this.player.y - (this._sourcePreview?.scene.heightPreview ? this.player.z : 0); this._clampCamera(); }
    this.renderOnce(); return moved;
  }
  get stats() {
    return Object.freeze({ ...this._metrics, state: this._state, characterId: this.characterId,
      skillId: this.skillId, vfxId: this.vfxId, particleCount: this._particles.count,
      particles: this._particles.count, particleBudget: this._particles.budget,
      particlesDropped: this._particles.dropped, resource: this._skills.resource,
      resourceMax: this._skills.resourceMax, cooldownRemaining: this._skills.getState(this.skillId).cooldown,
      casts: this._skills.castCount, assetErrors: this._errors.length, errors: [...this._errors],
      ...(this._viewCamera ? { viewCamera: structuredClone(this._viewCamera), projection: this._viewCamera.projection,
        groundTileCandidates: this._groundTileCandidates || 0, groundTextureDraws: this._groundTextureDraws || 0 } : {}) });
  }

  _applyProject(project) {
    if (!project?.map) throw new TypeError('A validated FDG project with a map is required.');
    if (project.sourceScene !== undefined || project.sourcePreview !== undefined) {
      const result = validateProject(project, { geometry: false });
      if (!result.ok) throw new TypeError(result.errors.join('\n'));
    }
    const viewCamera = project.viewCamera && !project.sourceScene && !project.sourcePreview && !project.terrainScene
      ? structuredClone(project.viewCamera) : null;
    if (viewCamera) createWorldProjection(viewCamera, { x: 0, y: 0 }, { width: 1, height: 1 });
    const rigScene = project.rigScene === undefined ? null : new RigSceneRuntime(project.rigScene, {
      worldToScreen: (x, y) => this.worldToScreen(x, y),
      getImage: src => this.assets.get(src)?.image ?? null,
      getProjection: () => this._getWorldProjection(),
      getViewport: () => ({ width: this.width || 1, height: this.height || 1 }),
    });
    const terrainScene = project.terrainScene === undefined ? null : new TerrainSceneRuntime(project.terrainScene);
    const sourceScene = project.sourceScene === undefined ? null : new SourceSceneRuntime(project.sourceScene, project.map);
    const sourcePreview = project.sourcePreview === undefined ? null : new SourcePreviewRuntime(project.sourcePreview, project.map);
    this._rigScene?.dispose();
    this._rigScene = rigScene;
    this._terrainScene?.dispose();
    this._terrainScene = terrainScene;
    this._sourceScene?.dispose();
    this._sourceScene = sourceScene;
    this._sourceImagesReady = false;
    this._sourcePreview?.dispose();
    this._sourcePreview = sourcePreview;
    this._sourcePreviewImagesReady = false;
    this._project = project;
    this._viewCamera = viewCamera; this._worldProjection = null; this._worldProjectionKey = null;
    if (viewCamera) delete this._player.z;
    this._sceneExits = [];
    this.characterId = project.preview?.characterId || project.characters?.[0]?.id;
    this.skillId = project.preview?.skillId || project.skills?.[0]?.id;
    this.vfxId = project.preview?.vfxId || project.vfx?.[0]?.id;
    this._characters = new Map((project.characters || []).map(entry => [entry.id, entry]));
    this._vfx = new Map((project.vfx || []).map(entry => [entry.id, entry]));
    this._invalidSprites = new WeakMap();
    this._skills = new SkillSystem(project.skills || [], project.preview || {});
    this._particles.clear();
    this._animationTime = 0;
    this._forcedAnimation = null;
    this._rowOverride = undefined;
    this._camera.follow = true;
    this.clearInput();
    this._objects = { back: [], world: [], front: [] };
    for (const object of project.map.objects || []) this._objects[object.layer || 'world']?.push(object);
    this._objects.world.sort((a, b) => a.y - b.y);
    this._metrics.time = 0; this._metrics.updateSteps = 0; this._metrics.droppedSteps = 0;
    this._metrics.droppedTime = 0; this._metrics.frameDeltaMs = 0;
    this._accumulator = 0;
    this._lastTimestamp = null;
    this._activeSources = this._collectSources();
    this._retireAssets(this._activeSources);
    this._spawn();
    if (project.rigScene) {
      Object.assign(this._camera, { x: project.rigScene.camera.x, y: project.rigScene.camera.y, follow: project.rigScene.camera.follow });
      this._clampCamera();
    }
  }

  _collectSources() {
    if (this._terrainScene) return new Set();
    const sources = new Set();
    for (const definition of [...this._characters.values(), ...this._vfx.values()]) {
      if (definition.sprite?.src) sources.add(definition.sprite.src);
      for (const src of Object.values(definition.sprite?.directions || {})) sources.add(src);
    }
    for (const object of this.project.map.objects || []) if (object.src) sources.add(object.src);
    if (this._viewCamera && this.project.map.groundSrc) sources.add(this.project.map.groundSrc);
    for (const src of this._rigScene?.requiredSources() || []) sources.add(src);
    for (const src of this._sourceScene?.requiredSources() || []) sources.add(src);
    for (const src of this._sourcePreview?.requiredSources() || []) sources.add(src);
    return sources;
  }

  /** Prepare UNADOPTED visual images without changing the live project or pending physical authority. */
  async prepareSourcePreview(project) {
    if (this.state === 'disposed') throw new Error('The FDG runtime is disposed.');
    const result = validateProject(project, { geometry: false });
    if (!result.ok || !project.sourcePreview) throw new TypeError(result.errors.join('\n') || 'sourcePreview required.');
    const preview = new SourcePreviewRuntime(project.sourcePreview, project.map), version = this._loadVersion;
    const sources = preview.requiredSources(), temporary = new Map();
    const release = () => { for (const [src, record] of temporary) if (!this._activeSources.has(src) && this.assets.get(src) === record) { this.assets.delete(src); record.cancel?.(); record.image = null; } };
    for (const definition of [...project.characters, ...project.vfx]) {
      if (definition.sprite?.src) sources.add(definition.sprite.src);
      for (const src of Object.values(definition.sprite?.directions || {})) sources.add(src);
    }
    try {
      const pending = [];
      for (const src of sources) {
        const existed = this.assets.has(src), promise = this._loadAsset(src, { reportErrors: false });
        if (!existed) temporary.set(src, this.assets.get(src));
        pending.push(promise);
      }
      await Promise.all(pending);
      if (this.state === 'disposed' || this._loadVersion !== version) throw new Error('Source preview preparation was superseded.');
      const ready = preview.validateReady(this.assets);
      if (!ready.ok) throw new Error(ready.errors.join('\n'));
      for (const definition of [...project.characters, ...project.vfx]) if (definition.sprite) {
        const sprite = definition.sprite, width = Math.min(sprite.frames, sprite.columns) * sprite.frameWidth;
        const height = Math.ceil(sprite.frames / sprite.columns) * sprite.frameHeight;
        for (const src of new Set([sprite.src, ...Object.values(sprite.directions || {})])) {
          const record = this.assets.get(src), image = record?.image;
          if (record?.status !== 'ready' || !Number.isSafeInteger(image?.naturalWidth) || !Number.isSafeInteger(image?.naturalHeight) ||
            image.naturalWidth < width || image.naturalHeight < height) {
            throw new Error(`Required preview sprite atlas is not decoded or too small: ${src}`);
          }
        }
      }
      return { ok: true, sources: sources.size, release };
    } catch (error) { release(); throw error; }
    finally { preview.dispose(); }
  }

  /** Observe explicitly bound approved images; never infer source placement or install a scene. */
  async observeSourceImages(bindings, approvedCanonicalPaths) {
    if (this.state === 'disposed') throw new Error('The FDG runtime is disposed.');
    const exactLocalPath = value => isLocalAsset(value) && !value.startsWith('/') && !value.split('/').some(part => !part);
    const canonicalPath = value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') &&
      isLocalAsset(value) && !value.slice(1).split('/').some(part => !part);
    if (!Array.isArray(approvedCanonicalPaths) && !(approvedCanonicalPaths instanceof Set)) {
      throw new TypeError('Approved canonical image paths must be an explicit Array or Set.');
    }
    const approvedEntries = [...approvedCanonicalPaths];
    if (approvedEntries.length < 1 || approvedEntries.length > LIMITS.resources || !approvedEntries.every(canonicalPath)) {
      throw new TypeError(`Approved canonical image paths require 1..${LIMITS.resources} exact absolute paths.`);
    }
    const approved = new Set(approvedEntries);
    if (!bindings || typeof bindings !== 'object' || Array.isArray(bindings) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(bindings)) || Object.getOwnPropertySymbols(bindings).length) {
      throw new TypeError('Source image bindings require an explicit plain object.');
    }
    const descriptors = Object.entries(Object.getOwnPropertyDescriptors(bindings));
    if (descriptors.length < 1 || descriptors.length > LIMITS.resources) {
      throw new TypeError(`Source image bindings require 1..${LIMITS.resources} approved entries.`);
    }
    const entries = descriptors.map(([canonicalAbsolutePath, descriptor]) => {
      if (!canonicalPath(canonicalAbsolutePath) || !approved.has(canonicalAbsolutePath) ||
        !descriptor.enumerable || !Object.hasOwn(descriptor, 'value') || !exactLocalPath(descriptor.value)) {
        throw new TypeError('Each source image binding must pair an approved canonical path with an exact local image path.');
      }
      return [canonicalAbsolutePath, descriptor.value];
    });
    const version = this._loadVersion, temporary = new Map();
    const release = () => {
      for (const [src, record] of temporary) {
        if (!this._activeSources.has(src) && this.assets.get(src) === record) {
          this.assets.delete(src); record.cancel?.(); record.image = null;
        }
      }
    };
    try {
      const pending = [];
      for (const src of new Set(entries.map(([, value]) => value))) {
        const existed = this.assets.has(src), promise = this._loadAsset(src, { reportErrors: false });
        if (!existed) temporary.set(src, this.assets.get(src));
        pending.push(promise);
      }
      await Promise.all(pending);
      if (this.state === 'disposed' || this._loadVersion !== version) throw new Error('Source image observation was superseded.');
      const observations = entries.map(([canonicalAbsolutePath, src]) => {
        const record = this.assets.get(src), image = record?.image;
        if (record?.status !== 'ready' || !Number.isSafeInteger(image?.naturalWidth) || image.naturalWidth <= 0 ||
          !Number.isSafeInteger(image?.naturalHeight) || image.naturalHeight <= 0) {
          throw new Error(`Source image is not decoded with valid intrinsic dimensions: ${src}`);
        }
        return { canonicalAbsolutePath, src, status: 'ready', intrinsicWidth: image.naturalWidth,
          intrinsicHeight: image.naturalHeight, observedBy: 'runtime-image-decode' };
      });
      return { observations, release };
    } catch (error) {
      release(); throw error;
    }
  }

  /** Decode candidate assets before replacing the live scene or editor store. */
  async prepareSourceScene(project) {
    if (this.state === 'disposed') throw new Error('The FDG runtime is disposed.');
    const result = validateProject(project, { geometry: false });
    if (!result.ok || !project.sourceScene) throw new TypeError(result.errors.join('\n') || 'sourceScene required.');
    const scene = new SourceSceneRuntime(project.sourceScene, project.map), version = this._loadVersion;
    const sources = scene.requiredSources(), temporary = new Map();
    const release = () => { for (const [src, record] of temporary) if (!this._activeSources.has(src) && this.assets.get(src) === record) { this.assets.delete(src); record.cancel?.(); record.image = null; } };
    for (const definition of [...project.characters, ...project.vfx]) {
      if (definition.sprite?.src) sources.add(definition.sprite.src);
      for (const src of Object.values(definition.sprite?.directions || {})) sources.add(src);
    }
    try {
      const pending = [];
      for (const src of sources) {
        const existed = this.assets.has(src), promise = this._loadAsset(src, { reportErrors: false });
        if (!existed) temporary.set(src, this.assets.get(src));
        pending.push(promise);
      }
      await Promise.all(pending);
      if (this.state === 'disposed' || this._loadVersion !== version) throw new Error('Source preparation was superseded.');
      const ready = scene.validateReady(this.assets);
      if (!ready.ok) throw new Error(ready.errors.join('\n'));
      for (const src of sources) {
        const record = this.assets.get(src);
        if (record?.status !== 'ready' || !(record.image?.naturalWidth > 0) || !(record.image?.naturalHeight > 0)) throw new Error(`Required source sprite is not decoded: ${src}`);
      }
      for (const definition of [...project.characters, ...project.vfx]) if (definition.sprite) {
        const sprite = definition.sprite;
        const width = Math.min(sprite.frames, sprite.columns) * sprite.frameWidth;
        const height = Math.ceil(sprite.frames / sprite.columns) * sprite.frameHeight;
        for (const src of new Set([sprite.src, ...Object.values(sprite.directions || {})])) {
          const image = this.assets.get(src)?.image;
          if (image.naturalWidth < width || image.naturalHeight < height) throw new Error(`Required sprite atlas is too small: ${src}`);
        }
      }
      return { ok: true, sources: sources.size, release };
    } catch (error) {
      release();
      throw error;
    } finally { scene.dispose(); }
  }

  _retireAssets(sources) {
    for (const [src, record] of this.assets) {
      // Retry a failed active source only on project replacement, never in load/render.
      if (sources.has(src) && record.status !== 'error') continue;
      this.assets.delete(src);
      record.cancel?.();
      record.image = null;
    }
  }

  _spawn() {
    const map = this.project.map;
    const character = this._characters.get(this.characterId);
    const radius = positive(character?.radius, 12);
    if (this._sourcePreview) {
      const [x, y] = this._sourcePreview.scene.actor.position;
      Object.assign(this._player, { x, y, radius, direction: 'south', animation: 'idle' });
      delete this._player.z;
      if (!this._sourcePreview.move(this._player, x, y)) throw new TypeError('Source preview actor must fit the current nav, cliff and connected object foot gates.');
      Object.assign(this._camera, this._sourcePreview.scene.camera); this._clampCamera();
      return;
    }
    if (this._sourceScene) {
      const [x, y, z] = this._sourceScene.scene.actor.position;
      Object.assign(this._player, { x, y, z, radius, direction: 'south', animation: 'idle' });
      if (!this._sourceScene.move(this._player, x, y)) throw new TypeError('Source actor has no valid support.');
      Object.assign(this._camera, this._sourceScene.scene.camera);
      this._clampCamera();
      return;
    }
    const tileSize = map.tileSize;
    let x = (number(map.start?.x) + 0.5) * tileSize;
    let y = (number(map.start?.y) + 0.5) * tileSize;
    if (!isWalkableCircle(map, x, y, radius)) {
      let best = Infinity;
      let candidate;
      for (let ty = 0; ty < map.height; ty += 1) for (let tx = 0; tx < map.width; tx += 1) {
        if (map.tiles[ty * map.width + tx] !== 1) continue;
        const px = (tx + 0.5) * tileSize, py = (ty + 0.5) * tileSize;
        const distance = (px - x) ** 2 + (py - y) ** 2;
        if (distance < best && isWalkableCircle(map, px, py, radius)) { best = distance; candidate = { x: px, y: py }; }
      }
      if (candidate) { x = candidate.x; y = candidate.y; }
      else this._reportError(new Error('No walkable spawn fits the character radius.'), 'spawn');
    }
    Object.assign(this._player, { x, y, radius, direction: 'south', animation: 'idle' });
    if (this._terrainScene) {
      const position = this._terrainScene.scene.actor?.position || [x,y,0];
      this._player.x=position[0]; this._player.y=position[1];
      if (!isWalkableCircle(map,position[0],position[1],radius)) this._reportError(new Error('Height scene actor does not fit the map floor.'), 'terrain-spawn');
      const ground = this._terrainScene.ground(this.player.x,this.player.y);
      this._player.z = ground.height;
      this._terrainScene.surfaceId = ground.surfaceId;
      if (!this._terrainScene.move(this.player,this.player.x,this.player.y)) this._reportError(new Error(`Height scene actor has no valid support: ${this._terrainScene.blockedReason}`), 'terrain-spawn');
      const bounds = this._terrainScene.scene.bounds;
      this._camera.follow = false;
      this._camera.x = bounds.x + bounds.width/2; this._camera.y = bounds.y + bounds.depth/2;
      this._clampCamera();
      return;
    }
    delete this._player.z;
    this._camera.x = x; this._camera.y = y;
    this._clampCamera();
  }

  async load() {
    if (this.state === 'disposed') return this;
    const version = ++this._loadVersion;
    await Promise.all([...this._activeSources].map(src => this._loadAsset(src)));
    if (version === this._loadVersion && this.state !== 'disposed') {
      for (const definition of [...this._characters.values(), ...this._vfx.values()]) this._validateSprite(definition.sprite);
      if (this._rigScene) {
        const ready = this._rigScene.validateReady(this.assets);
        if (!ready.ok) for (const error of ready.errors) this._reportError(new Error(error), 'rig-texture-images');
      }
      if (this._sourceScene) {
        const ready = this._sourceScene.validateReady(this.assets);
        this._sourceImagesReady = ready.ok && this._errors.length === 0;
        if (!ready.ok) for (const error of ready.errors) this._reportError(new Error(error), 'source-images');
      }
      if (this._sourcePreview) {
        const ready = this._sourcePreview.validateReady(this.assets);
        this._sourcePreviewImagesReady = ready.ok && this._errors.length === 0;
        if (!ready.ok) for (const error of ready.errors) this._reportError(new Error(error), 'source-preview-images');
      }
      this.renderOnce();
    }
    return this;
  }

  async setProject(project) {
    if (this.state === 'disposed') throw new Error('The FDG runtime is disposed.');
    this._loadVersion += 1;
    this._errors.length = 0;
    this._applyProject(project);
    this.pause();
    return this.load();
  }

  captureSceneState() {
    const project = structuredClone(this.project);
    if (this._terrainScene) project.terrainScene = this.captureTerrainScene();
    if (this._rigScene) project.rigScene = this.captureRigScene();
    if (this._sourceScene) project.sourceScene = this._sourceScene.capture(this.player, this.camera);
    if (this._sourcePreview) {
      project.sourcePreview = this._sourcePreview.capture(this.player, this.camera);
      return { project, actorPosition: [this.player.x, this.player.y], height: null, camera: { ...this.camera } };
    }
    return { project, actorPosition: [this.player.x,this.player.y,this.player.z || 0], camera: { ...this.camera },
      ...(this._viewCamera ? { viewCamera: structuredClone(this._viewCamera) } : {}) };
  }

  async enterScene(project, { arrival, camera = null } = {}) {
    if (this.state === 'disposed') throw new Error('The FDG runtime is disposed.');
    if (this._sourcePreview || project?.sourcePreview) throw new Error('UNADOPTED source preview does not support World transitions.');
    if (!Array.isArray(arrival) || arrival.length !== 3 || !arrival.every(Number.isFinite)
      || arrival[0] < 0 || arrival[0] > 8000 || arrival[1] < 0 || arrival[1] > 8000 || arrival[2] < 0 || arrival[2] > 1024) throw new TypeError('Scene arrival requires finite world XYZ.');
    if (camera !== null && (!camera || !Number.isFinite(camera.x) || !Number.isFinite(camera.y)
      || camera.x < 0 || camera.x > 8000 || camera.y < 0 || camera.y > 8000 || typeof camera.follow !== 'boolean')) throw new TypeError('Scene camera requires world XY and follow.');
    const next = structuredClone(project);
    if (next.sourceScene) { next.sourceScene.actor.position = [...arrival]; if (camera) next.sourceScene.camera = { ...camera }; }
    else if (next.terrainScene) { next.terrainScene.actor ||= {}; next.terrainScene.actor.position = [...arrival]; }
    else if (arrival[2] !== 0) throw new TypeError('This scene has no height support.');
    const result = validateProject(next, { geometry: false });
    if (!result.ok) throw new TypeError(result.errors.join('\n'));
    const character = next.characters.find(value => value.id === next.preview.characterId);
    if (!isWalkableCircle(next.map,arrival[0],arrival[1],character.radius)) throw new TypeError('Scene arrival does not fit the map floor.');
    this.pause();
    await this.setProject(next);
    if (this.state === 'disposed') return this;
    if (!this._terrainScene && !this._sourceScene) { this._player.x = arrival[0]; this._player.y = arrival[1]; }
    if (camera) { Object.assign(this._camera,camera); this._clampCamera(); }
    this.pause(); this.renderOnce();
    return this;
  }

  setSceneExits(exits = []) {
    if (!Array.isArray(exits) || exits.length > 16) throw new TypeError('Scene exit markers require at most 16 entries.');
    this._sceneExits = exits.filter(exit => exit.position !== null).map(exit => {
      if (!Array.isArray(exit.position) || exit.position.length !== 3 || !exit.position.every(Number.isFinite)
        || !Number.isFinite(exit.radius) || exit.radius < 8 || exit.radius > 160 || typeof exit.id !== 'string') throw new TypeError('Invalid scene exit marker.');
      return { id: exit.id, position: [...exit.position], radius: exit.radius, open: exit.open !== false };
    });
    this.renderOnce();
  }

  _loadAsset(src, { reportErrors = true } = {}) {
    const existing = this.assets.get(src);
    if (existing) {
      if (reportErrors && existing.error && this.state !== 'disposed') this._reportError(existing.error, src);
      return existing.promise;
    }
    const record = { src, image: null, status: 'loading', error: null, promise: null, cancel: null };
    this.assets.set(src, record);
    record.promise = new Promise(resolve => {
      const ImageClass = this.window?.Image || globalThis.Image;
      if (!ImageClass) {
        record.status = 'error'; record.error = new Error(`Image loading is unavailable: ${src}`);
        if (reportErrors) this._reportError(record.error, src); resolve(record); return;
      }
      const image = new ImageClass();
      let timer;
      let settled = false;
      const finish = error => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        image.onload = null; image.onerror = null;
        this._pendingAssets.delete(cancel);
        record.status = error ? 'error' : 'ready';
        record.error = error || null;
        record.image = error ? null : image;
        record.cancel = null;
        if (reportErrors && error && this.state !== 'disposed' && this.assets.get(src) === record && this._activeSources.has(src)) this._reportError(error, src);
        resolve(record);
      };
      const cancel = () => { finish(new Error(`Asset load cancelled: ${src}`)); image.removeAttribute?.('src'); };
      record.cancel = cancel;
      this._pendingAssets.add(cancel);
      image.onload = () => finish(image.naturalWidth > 0 && image.naturalHeight > 0 ? null : new Error(`Empty sprite: ${src}`));
      image.onerror = () => finish(new Error(`Could not load sprite: ${src}`));
      timer = setTimeout(() => finish(new Error(`Sprite load timed out after ${ASSET_TIMEOUT_MS}ms: ${src}`)), ASSET_TIMEOUT_MS);
      try {
        image.src = this.assetBase === '/' ? `/${src.replace(/^\/+/, '')}`
          : new URL(src.replace(/^\/+/, ''), this.assetBase.endsWith('/') ? this.assetBase : `${this.assetBase}/`).href;
      } catch (error) { finish(error); }
    });
    return record.promise;
  }

  _validateSprite(sprite) {
    if (!sprite) return;
    const columns = Math.max(1, Math.floor(number(sprite.columns, 1)));
    const total = Math.max(1, Math.floor(number(sprite.frames, columns * number(sprite.rows, 1))));
    const requiredWidth = Math.min(total, columns) * sprite.frameWidth;
    const requiredHeight = Math.ceil(total / columns) * sprite.frameHeight;
    for (const src of new Set([sprite.src, ...Object.values(sprite.directions || {})])) {
      const image = this.assets.get(src)?.image;
      if (!image || image.naturalWidth >= requiredWidth && image.naturalHeight >= requiredHeight) continue;
      if (!this._invalidSprites.has(sprite)) this._invalidSprites.set(sprite, new Set());
      this._invalidSprites.get(sprite).add(src);
      this._reportError(new Error(`Sprite atlas is smaller than its declared frames (${requiredWidth}×${requiredHeight}): ${src}`), src);
    }
  }

  _reportError(error, source) {
    const message = error instanceof Error ? error.message : String(error);
    if (!this._errors.some(entry => entry.source === source && entry.message === message)) {
      this._errors.push({ source, message });
      this.onError?.(error, { source });
    }
  }

  _listen(target, type, handler, options) {
    if (!target?.addEventListener) return;
    target.addEventListener(type, handler, options);
    this._listeners.push(() => target.removeEventListener(type, handler, options));
  }

  _bindInput() {
    this._listen(this.canvas, 'keydown', event => {
      if (!this._inputEnabled || this.state !== 'running' || event.ctrlKey || event.altKey || event.metaKey) return;
      if (MOVE_KEYS.has(event.code)) { this._moveInputDirection = null; this._keys.add(event.code); event.preventDefault(); }
      if (event.code === 'Space') { event.preventDefault(); if (!event.repeat && !this._terrainScene && !this._sourcePreview && (!this._viewCamera || this._pointerTarget !== null)) this.triggerSkill(undefined, this._pointerTarget); }
    });
    this._listen(this.canvas, 'keyup', event => {
      this._keys.delete(event.code);
      if (this._inputEnabled && (MOVE_KEYS.has(event.code) || event.code === 'Space')) event.preventDefault();
    });
    this._listen(this.canvas, 'blur', () => this.clearInput());
    this._listen(this.window, 'blur', () => { this.clearInput(); this._lastTimestamp = null; this._accumulator = 0; });
    this._listen(this.canvas.ownerDocument, 'visibilitychange', () => {
      if (this.canvas.ownerDocument.hidden) { this.clearInput(); this._lastTimestamp = null; this._accumulator = 0; }
    });
    const pointer = event => {
      const rect = this.canvas.getBoundingClientRect?.() || { left: 0, top: 0, width: this.width, height: this.height };
      const x = (event.clientX - rect.left) * this.width / Math.max(1, rect.width);
      const y = (event.clientY - rect.top) * this.height / Math.max(1, rect.height);
      const target = this.screenToWorld(x, y);
      this._pointerTarget = target;
    };
    this._listen(this.canvas, 'pointermove', pointer);
    this._listen(this.canvas, 'pointerdown', event => {
      if (!this._inputEnabled || (event.button !== undefined && event.button !== 0)) return;
      this.canvas.focus?.({ preventScroll: true });
      pointer(event);
      if (this.state === 'running' && !this._terrainScene && !this._sourcePreview && (!this._viewCamera || this._pointerTarget)) { event.preventDefault(); this.triggerSkill(undefined, this._pointerTarget); }
    });
    this._listen(this.window, 'resize', () => this.resize());
    const ResizeObserverClass = this.window?.ResizeObserver || globalThis.ResizeObserver;
    if (ResizeObserverClass) {
      this._resizeObserver = new ResizeObserverClass(() => this.resize());
      this._resizeObserver.observe(this.canvas);
    }
  }

  clearInput() { this._keys.clear(); this._moveInputDirection = null; this._pointerTarget = undefined; }
  setInputEnabled(enabled) { this._inputEnabled = Boolean(enabled); if (!enabled) this.clearInput(); return this; }

  setCharacter(id) {
    if (!this._characters.has(id)) return false;
    const sourceConsumer = this._sourcePreview || this._sourceScene;
    if (sourceConsumer) {
      const radius = positive(this._characters.get(id).radius, 12), oldRadius = this._player.radius;
      this._player.radius = radius;
      if (!sourceConsumer.move(this.player, this.player.x, this.player.y)) { this._player.radius = oldRadius; return false; }
    }
    this.characterId = id;
    this._player.radius = positive(this._characters.get(id).radius, 12);
    this._animationTime = 0;
    this._forcedAnimation = null;
    this._rowOverride = undefined;
    if (!isWalkableCircle(this.project.map, this.player.x, this.player.y, this.player.radius)) this._spawn();
    this.renderOnce();
    return true;
  }

  setSkill(id) { if (!this._skills.definitions.has(id)) return false; this.skillId = id; this.renderOnce(); return true; }

  setDirection(direction) {
    if (typeof direction === 'number') this._rowOverride = Math.max(0, Math.floor(direction));
    else if (typeof direction === 'string') { this._player.direction = direction; this._rowOverride = undefined; }
    else return false;
    this.renderOnce();
    return true;
  }

  setAnimation(name) {
    if (!this._characters.get(this.characterId)?.animations?.[name]) return false;
    this._forcedAnimation = name;
    this._player.animation = name;
    this._animationTime = 0;
    this.renderOnce();
    return true;
  }

  triggerSkill(id = this.skillId, target) {
    if (this.state === 'disposed') return { ok: false, reason: 'disposed' };
    if (this._sourcePreview) return { ok: false, reason: 'source-preview-physical-pending' };
    const skill = this._skills.definitions.get(id);
    const angle = this._facingAngle();
    const destination = target || { x: this.player.x + Math.cos(angle) * positive(skill?.range), y: this.player.y + Math.sin(angle) * positive(skill?.range) };
    const result = this._skills.cast(id, this.player, destination);
    this.lastCast = result;
    if (result.ok) {
      const vfx = this._vfx.get(result.skill.vfx);
      if (vfx) this._particles.emit(vfx, vfx.kind === 'projectile' ? result.origin : result.target, { target: result.target, angle: Math.atan2(result.target.y - result.origin.y, result.target.x - result.origin.x) });
      if (this._characters.get(this.characterId)?.animations?.attack) this.setAnimation('attack');
    }
    this.renderOnce();
    return result;
  }

  triggerVfx(id = this.vfxId, position = this.player) {
    if (this.state === 'disposed') return 0;
    if (this._sourcePreview) return 0;
    const definition = this._vfx.get(id);
    if (!definition) return 0;
    this.vfxId = id;
    const count = this._particles.emit(definition, position, { angle: this._facingAngle() });
    this.renderOnce();
    return count;
  }

  _facingAngle() {
    const angles = { east: 0, 'south-east': Math.PI / 4, south: Math.PI / 2, 'south-west': Math.PI * 3 / 4,
      west: Math.PI, 'north-west': -Math.PI * 3 / 4, north: -Math.PI / 2, 'north-east': -Math.PI / 4 };
    return angles[this.player.direction.replaceAll('_', '-')] ?? Math.PI / 2;
  }

  resize() {
    if (this.state === 'disposed') return;
    const rect = this.canvas.getBoundingClientRect?.();
    this.width = Math.max(1, number(rect?.width, number(this.canvas.clientWidth, number(this.canvas.width, 800))));
    this.height = Math.max(1, number(rect?.height, number(this.canvas.clientHeight, number(this.canvas.height, 600))));
    this.pixelRatio = clamp(number(this.window?.devicePixelRatio, 1), 1, MAX_PIXEL_RATIO);
    const backingWidth = Math.round(this.width * this.pixelRatio), backingHeight = Math.round(this.height * this.pixelRatio);
    if (this.canvas.width !== backingWidth) this.canvas.width = backingWidth;
    if (this.canvas.height !== backingHeight) this.canvas.height = backingHeight;
    this._clampCamera();
    this.renderOnce();
  }

  setCamera(x, y) { this._camera.follow = false; this._camera.x = number(x); this._camera.y = number(y); this._clampCamera(); this.renderOnce(); return this; }
  followCharacter() { if (this._terrainScene) { this.renderOnce(); return this; } this._camera.follow = true; this._camera.x = this.player.x; this._camera.y = this.player.y - (this._sourcePreview?.scene.heightPreview ? this.player.z : 0); this._clampCamera(); this.renderOnce(); return this; }
  getRigNodeSnapshot(id) { return this._rigScene?.getNodeSnapshot(id) ?? null; }
  getRigSceneSnapshot() { return this._rigScene?.snapshot() ?? { nodes: [], activeNodes: 0, resourceCount: 0, ownedRaf: 0, ownedListeners: 0, disposed: this.state === 'disposed' }; }
  captureRigScene() { return this._rigScene?.capture(this.camera); }
  _rigSequenceAllowed() { return this.state !== 'disposed' && !this._sourcePreview && !this._sourceScene && !this._terrainScene && Boolean(this._rigScene?._sequence); }
  _activateReadyRigSequence() {
    if (!this._rigSequenceAllowed() || this._rigScene._sequenceState.status !== 'ready' || this._rigScene._sequence.autoStart === false) return false;
    return this._rigScene.sequenceImageReady(this.assets) && this._rigScene.replaySequence();
  }
  replayRigSequence() {
    if (!this._rigSequenceAllowed() || !this._rigScene.sequenceImageReady(this.assets)) return false;
    const changed = this._rigScene.replaySequence();
    if (changed) this.renderOnce(); return changed;
  }
  stopRigSequence() {
    if (!this._rigSequenceAllowed()) return false;
    const changed = this._rigScene.stopSequence();
    if (changed) this.renderOnce(); return changed;
  }
  getRigSequenceSnapshot() {
    const sequence = this._rigSequenceAllowed() ? this._rigScene.getSequenceSnapshot()
      : { id: null, status: 'unavailable', activationId: 0, eventCount: 0, emittedCount: 0, elapsed: 0, eventTime: null, atlasLife: null };
    const activeFx = sequence.id === null ? [] : this.getVfxPlaybackSnapshot().filter(effect => effect.sequenceId === sequence.id);
    const latest = activeFx.find(effect => effect.activationId === sequence.activationId) ?? activeFx.at(-1);
    return { ...sequence, assetReady: this._rigSequenceAllowed() && this._rigScene.sequenceImageReady(this.assets),
      atlasActive: activeFx.length > 0, atlasAge: latest?.age ?? null, atlasFrame: latest?.frameIndex ?? null, activeFx };
  }
  captureTerrainScene() { return this._terrainScene?.capture(this.player); }
  getTerrainSceneSnapshot() { return this._terrainScene?.snapshot(this.player) ?? null; }
  walkTerrain(direction) {
    if (!this._terrainScene || this.state === 'disposed') return false;
    const codes = { north:'ArrowUp',south:'ArrowDown',west:'ArrowLeft',east:'ArrowRight' };
    if (!codes[direction]) return false;
    this.pause(); this._keys.add(codes[direction]);
    this.step(.1); this.clearInput(); this.renderOnce(); return true;
  }
  setRigClip(nodeId, clipId, transitionSeconds = RIG_SCENE_TRANSITION_SECONDS) {
    const changed = this._rigScene?.setClip(nodeId, clipId, transitionSeconds) ?? false;
    if (changed) this.renderOnce(); return changed;
  }
  setRigMaterial(nodeId, materialId) {
    const changed = this._rigScene?.setMaterial(nodeId, materialId) ?? false;
    if (changed) this.renderOnce(); return changed;
  }
  seekRig(nodeId, time) {
    const changed = this._rigScene?.seek(nodeId, time) ?? false;
    if (changed) this.renderOnce(); return changed;
  }
  setRigView(yaw, pitch) {
    const changed = this._rigScene?.setView(yaw, pitch) ?? false;
    if (changed) this.renderOnce(); return changed;
  }
  _getWorldProjection() {
    if (!this._viewCamera) return null;
    const settings = this._viewCamera, width = Math.max(1, this.width || 1), height = Math.max(1, this.height || 1);
    const key = [settings.projection, settings.yaw, settings.pitch, settings.zoom, settings.distance, settings.near, this.camera.x, this.camera.y, width, height];
    if (!this._worldProjectionKey || key.some((value, index) => value !== this._worldProjectionKey[index])) {
      this._worldProjection = createWorldProjection(settings, this.camera, { width, height }); this._worldProjectionKey = key;
    }
    return this._worldProjection;
  }
  worldToScreen(x, y, z = 0) { return this._getWorldProjection()?.project(x, y, z) ?? (this._terrainScene ? this._terrainScene.project(x,y,0,this) : { x: x - this.camera.x + this.width / 2, y: y - this.camera.y + this.height / 2 }); }
  screenToWorld(x, y) { const projection = this._getWorldProjection(); return projection ? projection.unprojectGround(x, y) : this._terrainScene ? this._terrainScene.unprojectGround(x,y,this) : { x: x + this.camera.x - this.width / 2, y: y + this.camera.y - this.height / 2 }; }

  _projectWorldPolygon(points) {
    const projection = this._getWorldProjection();
    return projection.clipPolygon(points.map(({x,y,z=0,...attributes}) => ({ ...projection.toCamera(x,y,z), ...attributes })))
      .map(vertex => ({ ...vertex, ...projection.projectCamera(vertex) })).filter(vertex => vertex.visible);
  }
  _worldPath(points) {
    const projected = this._projectWorldPolygon(points);
    if (projected.length < 3) return false;
    const context = this.context; context.beginPath(); context.moveTo(projected[0].x, projected[0].y);
    for (const point of projected.slice(1)) context.lineTo(point.x, point.y);
    context.closePath(); return true;
  }

  _clampCamera() {
    if (!this.width || !this.height) return;
    const map = this.project.map;
    const worldWidth = map.width * map.tileSize, worldHeight = map.height * map.tileSize;
    if (this._viewCamera) { this._camera.x = clamp(this.camera.x, 0, worldWidth); this._camera.y = clamp(this.camera.y, 0, worldHeight); return; }
    this._camera.x = worldWidth <= this.width ? worldWidth / 2 : clamp(this.camera.x, this.width / 2, worldWidth - this.width / 2);
    this._camera.y = worldHeight <= this.height ? worldHeight / 2 : clamp(this.camera.y, this.height / 2, worldHeight - this.height / 2);
  }

  _update(dt) {
    this._activateReadyRigSequence();
    this._rigScene?.update(dt);
    this._skills.update(dt);
    this._particles.update(dt);
    // Age old FX first. A crossing on this exact owner tick starts the new atlas at age/frame 0.
    const sequenceEvent = this._rigScene?.takeSequenceEvent();
    if (sequenceEvent && this._rigSequenceAllowed()) {
      const count = this._particles.emit(sequenceEvent.definition, sequenceEvent.position,
        { sequenceId: sequenceEvent.sequenceId, activationId: sequenceEvent.activationId });
      this._rigScene.recordSequenceEmission(count);
    }
    const held = this._inputEnabled && this.state === 'running' ? MOVE_DIRECTIONS[this._moveInputDirection] : null;
    const horizontal = held?.[0] ?? Number(this._keys.has('KeyD') || this._keys.has('ArrowRight')) - Number(this._keys.has('KeyA') || this._keys.has('ArrowLeft'));
    const vertical = held?.[1] ?? Number(this._keys.has('KeyS') || this._keys.has('ArrowDown')) - Number(this._keys.has('KeyW') || this._keys.has('ArrowUp'));
    const character = this._characters.get(this.characterId);
    if (horizontal || vertical) {
      const speed = positive(character?.speed, 160) * dt / Math.hypot(horizontal, vertical);
      const dx = horizontal * speed, dy = vertical * speed;
      const segments = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / Math.max(1, this.project.map.tileSize / 4)));
      for (let i = 0; i < segments; i += 1) {
        if (isWalkableCircle(this.project.map, this.player.x + dx / segments, this.player.y, this.player.radius)) {
          if (this._sourcePreview) { if (dx) this._sourcePreview.move(this.player,this.player.x+dx/segments,this.player.y); }
          else if (this._sourceScene) { if (dx) this._sourceScene.move(this.player,this.player.x+dx/segments,this.player.y); }
          else if (this._terrainScene) { if (dx) this._terrainScene.move(this.player,this.player.x+dx/segments,this.player.y); }
          else this.player.x += dx / segments;
        }
        if (isWalkableCircle(this.project.map, this.player.x, this.player.y + dy / segments, this.player.radius)) {
          if (this._sourcePreview) { if (dy) this._sourcePreview.move(this.player,this.player.x,this.player.y+dy/segments); }
          else if (this._sourceScene) { if (dy) this._sourceScene.move(this.player,this.player.x,this.player.y+dy/segments); }
          else if (this._terrainScene) { if (dy) this._terrainScene.move(this.player,this.player.x,this.player.y+dy/segments); }
          else this.player.y += dy / segments;
        }
      }
      this._player.direction = movementDirection(horizontal, vertical);
    }
    const animation = this._forcedAnimation || (horizontal || vertical ? 'walk' : 'idle');
    if (animation !== this.player.animation) { this._player.animation = animation; this._animationTime = 0; }
    this._animationTime += dt;
    const definition = character?.animations?.[this.player.animation];
    if (this._forcedAnimation && definition?.loop === false && animationFrame(character.sprite, definition, this._animationTime, this._rowOverride).finished) this._forcedAnimation = null;
    if (this.camera.follow) { this._camera.x = this.player.x; this._camera.y = this.player.y - (this._sourcePreview?.scene.heightPreview ? this.player.z : 0); this._clampCamera(); }
    this._metrics.time += dt;
    this._metrics.updateSteps += 1;
  }

  /** Advance simulated time manually (also used by rAF). Calling while paused is allowed. */
  step(seconds) {
    if (this.state === 'disposed') return 0;
    if (this._sourcePreview && !this._sourcePreviewImagesReady) return 0;
    if (this._rigSequenceAllowed() && this._rigScene._sequenceState.status === 'ready' && !this._rigScene.sequenceImageReady(this.assets)) return 0;
    const start = now();
    const requested = positive(seconds);
    const dt = Math.min(MAX_FRAME_DELTA, requested);
    if (requested > dt) {
      const discarded = requested - dt;
      this._metrics.droppedTime += discarded;
      this._metrics.droppedSteps += Math.floor(discarded / FIXED_STEP + EPSILON);
    }
    this._accumulator += dt;
    let steps = 0;
    while (this._accumulator + EPSILON >= FIXED_STEP && steps < MAX_SUBSTEPS) {
      this._update(FIXED_STEP);
      this._accumulator = Math.max(0, this._accumulator - FIXED_STEP);
      steps += 1;
    }
    if (this._accumulator + EPSILON >= FIXED_STEP) {
      const skipped = Math.floor(this._accumulator / FIXED_STEP + EPSILON);
      this._metrics.droppedSteps += skipped;
      this._metrics.droppedTime += skipped * FIXED_STEP;
      this._accumulator = Math.max(0, this._accumulator - skipped * FIXED_STEP);
    }
    this._metrics.updateMs = now() - start;
    return steps;
  }

  start() {
    if (this.state === 'disposed') return this;
    if (this.state === 'running') return this;
    if (this._sourceScene && !this._sourceImagesReady) throw new Error('원본 장면의 필수 이미지 디코드가 완료되지 않았습니다.');
    if (this._sourcePreview && !this._sourcePreviewImagesReady) throw new Error('원본 시각 preview의 필수 이미지 디코드가 완료되지 않았습니다.');
    if (this._rigSequenceAllowed() && this._rigScene._sequenceState.status === 'ready' && !this._rigScene.sequenceImageReady(this.assets)) throw new Error('리그 시퀀스의 실제 아틀라스 이미지 디코드가 완료되지 않았습니다.');
    this._activateReadyRigSequence();
    this._state = 'running';
    this._lastTimestamp = null;
    this._metrics.frameDeltaMs = 0;
    this._accumulator = 0;
    this._scheduleFrame();
    this.renderOnce();
    return this;
  }
  resume() { return this.start(); }
  pause() { if (this.state !== 'disposed') { this._state = 'paused'; this._cancelFrame(); this.clearInput(); this._accumulator = 0; this.renderOnce(); } return this; }
  stop() { if (this.state !== 'disposed') { this._state = 'stopped'; this._cancelFrame(); this.clearInput(); this._accumulator = 0; this.renderOnce(); } return this; }

  _scheduleFrame() {
    const request = this.window?.requestAnimationFrame?.bind(this.window) || globalThis.requestAnimationFrame;
    if (!request || this._raf !== null || this.state !== 'running') return;
    this._raf = request(timestamp => {
      this._raf = null;
      if (this.state !== 'running') return;
      this._metrics.frameDeltaMs = this._lastTimestamp === null ? 0 : Math.max(0, timestamp - this._lastTimestamp);
      if (this._lastTimestamp !== null) {
        const delta = Math.max(0, (timestamp - this._lastTimestamp) / 1000);
        this.step(delta);
        if (delta > 0) { const fps = 1 / delta; this._metrics.fps = this._metrics.fps ? this._metrics.fps * 0.9 + fps * 0.1 : fps; }
      }
      this._lastTimestamp = timestamp;
      this._metrics.frame += 1;
      this.renderOnce();
      this._scheduleFrame();
    });
  }

  _cancelFrame() {
    const cancel = this.window?.cancelAnimationFrame?.bind(this.window) || globalThis.cancelAnimationFrame;
    if (this._raf !== null) cancel?.(this._raf);
    this._raf = null;
    this._lastTimestamp = null;
    this._metrics.frameDeltaMs = 0;
  }

  dispose() {
    if (this.state === 'disposed') return;
    this.stop();
    this._state = 'disposed';
    this._loadVersion += 1;
    for (const remove of this._listeners) remove();
    this._listeners.length = 0;
    this._resizeObserver?.disconnect();
    for (const cancel of [...this._pendingAssets]) cancel();
    this._pendingAssets.clear();
    this._particles.clear();
    this._rigScene?.dispose();
    this._terrainScene?.dispose();
    this._terrainScene = null;
    this._sourceScene?.dispose();
    this._sourceScene = null; this._sourceImagesReady = false;
    this._sourcePreview?.dispose();
    this._sourcePreview = null; this._sourcePreviewImagesReady = false;
    this._worldProjection=null;this._worldProjectionKey=null;this._viewCamera=null;
    this._sceneExits = [];
    this.assets.clear();
    this.clearInput();
    if (!this._hadTabIndex) this.canvas.removeAttribute?.('tabindex');
    this.onStats = null;
    this.onError = null;
  }

  _drawSprite(sprite, animation, elapsed, x, y, src = sprite?.src, rowOverride, alpha = 1, viewScale = 1) {
    const image = this.assets.get(src)?.image;
    if (!image || !sprite || this._invalidSprites.get(sprite)?.has(src)) return false;
    const frame = animationFrame(sprite, animation, elapsed, rowOverride);
    if (frame.sx + frame.sw > image.naturalWidth || frame.sy + frame.sh > image.naturalHeight) {
      this._reportError(new Error(`Sprite atlas frame exceeds image bounds: ${src}`), src);
      return false;
    }
    const scale = positive(sprite.scale, 1) * viewScale;
    const width = frame.sw * scale, height = frame.sh * scale;
    const context = this.context;
    const oldAlpha = context.globalAlpha;
    context.globalAlpha = alpha;
    context.drawImage(image, frame.sx, frame.sy, frame.sw, frame.sh,
      x - width * number(sprite.anchorX, 0.5), y - height * number(sprite.anchorY, 1), width, height);
    context.globalAlpha = oldAlpha;
    this._metrics.drawCalls += 1;
    return true;
  }

  _drawPerspectiveMap() {
    const context = this.context, map = this.project.map, size = map.tileSize, projection = this._getWorldProjection();
    const domain = this._projectWorldPolygon([{x:0,y:0},{x:map.width*size,y:0},{x:map.width*size,y:map.height*size},{x:0,y:map.height*size}]);
    const visible = clipViewportPolygon(domain, this.width, this.height).map(point => projection.unprojectGround(point.x, point.y)).filter(Boolean);
    this._groundTileCandidates = 0; this._groundTextureDraws = 0;
    if (!visible.length) return;
    const minX = clamp(Math.floor(Math.min(...visible.map(p=>p.x))/size)-1,0,map.width-1);
    const maxX = clamp(Math.floor(Math.max(...visible.map(p=>p.x))/size)+1,0,map.width-1);
    const minY = clamp(Math.floor(Math.min(...visible.map(p=>p.y))/size)-1,0,map.height-1);
    const maxY = clamp(Math.floor(Math.max(...visible.map(p=>p.y))/size)+1,0,map.height-1);
    const record = this.assets.get(map.groundSrc), image = record?.status === 'ready' ? record.image : null;
    const texture = image && Number.isSafeInteger(image.naturalWidth) && image.naturalWidth > 0 && Number.isSafeInteger(image.naturalHeight) && image.naturalHeight > 0
      ? { src: map.groundSrc, width: image.naturalWidth, height: image.naturalHeight } : null;
    const cuts = (low,high,period) => { const points=[low]; for(let value=(Math.floor(low/period)+1)*period;value<high;value+=period)points.push(value);points.push(high);return points; };
    for(let ty=minY;ty<=maxY;ty++)for(let tx=minX;tx<=maxX;tx++) {
      this._groundTileCandidates++;
      const x=tx*size,y=ty*size;
      const corners=[{x,y},{x:x+size,y},{x:x+size,y:y+size},{x,y:y+size}], polygon=this._projectWorldPolygon(corners);
      if(polygon.length<3 || !clipViewportPolygon(polygon,this.width,this.height).length)continue;
      this._metrics.visibleTiles++;
      if(texture && map.tiles[ty*map.width+tx]===1) {
        const xs=cuts(x,x+size,texture.width),ys=cuts(y,y+size,texture.height);
        for(let iy=0;iy<ys.length-1;iy++)for(let ix=0;ix<xs.length-1;ix++) {
          const x0=xs[ix],x1=xs[ix+1],y0=ys[iy],y1=ys[iy+1],ox=Math.floor(x0/texture.width)*texture.width,oy=Math.floor(y0/texture.height)*texture.height;
          const points=this._projectWorldPolygon([{x:x0,y:y0,u:(x0-ox)/texture.width,v:(y0-oy)/texture.height},
            {x:x1,y:y0,u:(x1-ox)/texture.width,v:(y0-oy)/texture.height},{x:x1,y:y1,u:(x1-ox)/texture.width,v:(y1-oy)/texture.height},
            {x:x0,y:y1,u:(x0-ox)/texture.width,v:(y1-oy)/texture.height}]);
          for(let index=1;index<points.length-1;index++) {
            const triangle=[points[0],points[index],points[index+1]],calls=drawRigTextureTriangle(context,image,
              {texture,uvs:triangle.map(p=>[p.u,p.v]),triangle:[0,1,2],projected:triangle});
            this._metrics.drawCalls+=calls;this._groundTextureDraws+=calls;
          }
        }
      } else {
        context.fillStyle=TILE_COLORS[map.tiles[ty*map.width+tx]]||TILE_COLORS[0];
        if(this._worldPath(corners)){context.fill();this._metrics.drawCalls++;}
      }
    }
  }

  _drawMap() {
    if (this._viewCamera) { this._drawPerspectiveMap(); return; }
    const context = this.context, map = this.project.map, size = map.tileSize;
    const left = this.camera.x - this.width / 2, top = this.camera.y - this.height / 2;
    const minX = Math.max(0, Math.floor(left / size)), maxX = Math.min(map.width - 1, Math.floor((left + this.width) / size));
    const minY = Math.max(0, Math.floor(top / size)), maxY = Math.min(map.height - 1, Math.floor((top + this.height) / size));
    for (let ty = minY; ty <= maxY; ty += 1) for (let tx = minX; tx <= maxX; tx += 1) {
      context.fillStyle = TILE_COLORS[map.tiles[ty * map.width + tx]] || TILE_COLORS[0];
      context.fillRect(tx * size - left, ty * size - top, size, size);
      this._metrics.drawCalls += 1;
      this._metrics.visibleTiles += 1;
    }
    context.strokeStyle = '#ffffff0a'; context.lineWidth = 1;
    context.beginPath();
    for (let tx = minX; tx <= maxX + 1; tx += 1) { context.moveTo(tx * size - left, minY * size - top); context.lineTo(tx * size - left, (maxY + 1) * size - top); }
    for (let ty = minY; ty <= maxY + 1; ty += 1) { context.moveTo(minX * size - left, ty * size - top); context.lineTo((maxX + 1) * size - left, ty * size - top); }
    context.stroke(); this._metrics.drawCalls += 1;
  }

  _drawMapMarkers() {
    const context = this.context, map = this.project.map, size = map.tileSize;
    for (const [point, color, label] of [[map.start, '#76c3b0', 'START'], [map.exit, '#dfbb79', 'EXIT']]) {
      if (!point) continue;
      const position = this.worldToScreen((point.x + 0.5) * size, (point.y + 0.5) * size);
      if(this._viewCamera) {
        if(!position.visible)continue;
        const x=(point.x+.5)*size,y=(point.y+.5)*size,r=size*.3,scale=position.scale;
        if(position.x < -size*scale || position.y < -size*scale || position.x > this.width+size*scale || position.y>this.height+size*scale)continue;
        context.strokeStyle=color;context.lineWidth=2*scale;
        if(this._worldPath([{x:x-r,y:y-r},{x:x+r,y:y-r},{x:x+r,y:y+r},{x:x-r,y:y+r}]))context.stroke();
        context.fillStyle=color;context.font=`${10*scale}px sans-serif`;context.textAlign='center';context.fillText(label,position.x,position.y-size*.4*scale);
        this._metrics.drawCalls+=2;continue;
      }
      if (position.x < -size || position.y < -size || position.x > this.width + size || position.y > this.height + size) continue;
      context.strokeStyle = color; context.lineWidth = 2; context.strokeRect(position.x - size * 0.3, position.y - size * 0.3, size * 0.6, size * 0.6);
      context.fillStyle = color; context.font = '10px sans-serif'; context.textAlign = 'center'; context.fillText(label, position.x, position.y - size * 0.4);
      this._metrics.drawCalls += 2;
    }
  }

  _drawObject(object) {
    const position = this.worldToScreen((object.x + 0.5) * this.project.map.tileSize, (object.y + 0.5) * this.project.map.tileSize);
    if(this._viewCamera && !position.visible)return;
    const image = this.assets.get(object.src)?.image;
    const scale = positive(object.scale, 1) * (this._viewCamera ? position.scale : 1);
    const width = image ? image.naturalWidth * scale : this.project.map.tileSize;
    const height = image ? image.naturalHeight * scale : this.project.map.tileSize;
    if (position.x + width / 2 < 0 || position.x - width / 2 > this.width || position.y < 0 || position.y - height > this.height) return;
    if (image) this.context.drawImage(image, position.x - width / 2, position.y - height, width, height);
    else {
      this.context.strokeStyle = '#ef70c9'; this.context.lineWidth = 2;
      this.context.strokeRect(position.x - width / 2, position.y - height, width, height);
      this.context.fillStyle = '#ef70c9'; this.context.font = '12px sans-serif'; this.context.textAlign = 'center';
      this.context.fillText('?', position.x, position.y - height / 2);
    }
    this._metrics.visibleObjects += 1;
    this._metrics.drawCalls += 1;
  }

  _drawCharacter() {
    const position = this.worldToScreen(this.player.x, this.player.y, this._viewCamera ? number(this.player.z) : 0);
    const context = this.context, character = this._characters.get(this.characterId);
    if(this._viewCamera && !position.visible)return;
    if(this._viewCamera) {
      const sprite=character?.sprite,scale=position.scale,extent=Math.max(200,positive(sprite?.frameWidth)*positive(sprite?.scale,1),positive(sprite?.frameHeight)*positive(sprite?.scale,1))*scale;
      if(position.x < -extent || position.y < -extent || position.x > this.width+extent || position.y > this.height+extent)return;
      context.fillStyle='#00000066';
      const points=Array.from({length:24},(_,i)=>({x:this.player.x+Math.cos(i*TAU/24)*this.player.radius,y:this.player.y+Math.sin(i*TAU/24)*this.player.radius,z:0}));
      if(this._worldPath(points)){context.fill();this._metrics.drawCalls++;}
      if(!this._drawSprite(sprite,character?.animations?.[this.player.animation]||{},this._animationTime,position.x,position.y,
        directionSource(sprite,this.player.direction),this._rowOverride,1,scale)) {
        // Preserve the existing missing-sprite diagnostic, scaled by the same camera.
        context.save();try{context.translate(position.x,position.y);context.scale(scale,scale);
          context.fillStyle='#b5d9d4';context.strokeStyle='#ed70cb';context.lineWidth=2;
          context.beginPath();context.arc(0,-this.player.radius,this.player.radius,0,TAU);context.fill();context.stroke();
          context.fillStyle='#172b32';context.font='bold 14px sans-serif';context.textAlign='center';context.fillText('?',0,-this.player.radius+5);this._metrics.drawCalls+=3;
        }finally{context.restore();}
      }
      return;
    }
    if (position.x < -200 || position.y < -200 || position.x > this.width + 200 || position.y > this.height + 200) return;
    context.fillStyle = '#00000066'; context.beginPath(); context.ellipse(position.x, position.y, this.player.radius, this.player.radius * 0.5, 0, 0, TAU); context.fill();
    this._metrics.drawCalls += 1;
    if (!this._drawSprite(character?.sprite, character?.animations?.[this.player.animation] || {}, this._animationTime, position.x, position.y,
      directionSource(character?.sprite, this.player.direction), this._rowOverride)) {
      context.fillStyle = '#b5d9d4'; context.strokeStyle = '#ed70cb'; context.lineWidth = 2;
      context.beginPath(); context.arc(position.x, position.y - this.player.radius, this.player.radius, 0, TAU); context.fill(); context.stroke();
      context.fillStyle = '#172b32'; context.font = 'bold 14px sans-serif'; context.textAlign = 'center'; context.fillText('?', position.x, position.y - this.player.radius + 5);
      this._metrics.drawCalls += 3;
    }
  }

  _drawParticles() {
    const context = this.context;
    for (const index of this._particles.active) {
      const p = this._particles.pool[index];
      const position = this.worldToScreen(p.x, p.y);
      if(this._viewCamera && !position.visible)continue;
      const radius = p.kind === 'ring' ? p.size + p.speed * p.age : p.size;
      const spriteExtent = p.sprite ? Math.max(p.sprite.frameWidth, p.sprite.frameHeight) * positive(p.sprite.scale, 1) : 0;
      const scale=this._viewCamera ? position.scale : 1;
      const extent = Math.max(radius, spriteExtent)*scale;
      if (position.x < -extent || position.y < -extent || position.x > this.width + extent || position.y > this.height + extent) continue;
      const alpha = Math.max(0, 1 - p.age / p.life);
      if (this._drawSprite(p.sprite, { loop: false }, p.age, position.x, position.y, p.sprite?.src, undefined, alpha, scale)) continue;
      if (p.sequenceId !== null && p.sequenceId !== undefined) continue; // An authored atlas never becomes a primitive substitute.
      context.globalAlpha = alpha; context.fillStyle = p.color; context.strokeStyle = p.color;
      if(this._viewCamera) {
        if(p.kind==='ring') {
          const points=Array.from({length:33},(_,i)=>{const angle=p.angle+p.arc*i/32;return this.worldToScreen(p.x+Math.cos(angle)*radius,p.y+Math.sin(angle)*radius);});
          context.lineWidth=Math.max(1,p.size*.25*scale);context.beginPath();let begun=false;
          for(const point of points){if(!point.visible){begun=false;continue;}if(begun)context.lineTo(point.x,point.y);else{context.moveTo(point.x,point.y);begun=true;}}
          context.stroke();
        } else if(p.kind==='projectile') {
          const projection=this._getWorldProjection(),clipped=projection.clipPolygon([
            projection.toCamera(p.x-Math.cos(p.angle)*p.size*3,p.y-Math.sin(p.angle)*p.size*3),projection.toCamera(p.x,p.y)]);
          const points=clipped.map(point=>projection.projectCamera(point));context.lineWidth=Math.max(1,p.size*scale);context.beginPath();
          if(points.length){context.moveTo(points[0].x,points[0].y);for(const point of points.slice(1))context.lineTo(point.x,point.y);context.stroke();}
        } else {context.beginPath();context.arc(position.x,position.y,Math.max(.5,p.size*alpha*scale),0,TAU);context.fill();}
        this._metrics.drawCalls++;continue;
      }
      context.beginPath();
      if (p.kind === 'ring') {
        context.lineWidth = Math.max(1, p.size * 0.25);
        context.arc(position.x, position.y, radius, p.angle, p.angle + p.arc); context.stroke();
      } else if (p.kind === 'projectile') {
        context.lineWidth = Math.max(1, p.size);
        context.moveTo(position.x - Math.cos(p.angle) * p.size * 3, position.y - Math.sin(p.angle) * p.size * 3);
        context.lineTo(position.x, position.y); context.stroke();
      } else { context.arc(position.x, position.y, Math.max(0.5, p.size * alpha), 0, TAU); context.fill(); }
      this._metrics.drawCalls += 1;
    }
    context.globalAlpha = 1;
  }

  _drawSceneExits() {
    const context = this.context, sceneCamera = this._terrainScene?.scene.camera;
    for (const exit of this._sceneExits) {
      const point = this._terrainScene ? this._terrainScene.project(...exit.position, this) : this.worldToScreen(...exit.position);
      if(this._viewCamera) {
        if(!point.visible)continue;
        const radius=exit.radius*point.scale;
        if(point.x < -radius || point.x>this.width+radius || point.y < -radius || point.y>this.height+radius)continue;
        context.strokeStyle=exit.open?'#76c3b0':'#dfbb79';context.fillStyle=context.strokeStyle;context.lineWidth=2*point.scale;
        const vertices=Array.from({length:32},(_,i)=>({x:exit.position[0]+Math.cos(i*TAU/32)*exit.radius,y:exit.position[1]+Math.sin(i*TAU/32)*exit.radius,z:exit.position[2]}));
        if(this._worldPath(vertices))context.stroke();
        context.font=`${11*point.scale}px sans-serif`;context.textAlign='center';context.fillText(exit.open?'출구':'잠긴 출구',point.x,point.y-radius-7*point.scale);
        this._metrics.drawCalls+=2;continue;
      }
      const radius = exit.radius * (sceneCamera?.zoom || 1);
      if (point.x < -radius || point.x > this.width + radius || point.y < -radius || point.y > this.height + radius) continue;
      context.strokeStyle = exit.open ? '#76c3b0' : '#dfbb79'; context.fillStyle = context.strokeStyle;
      context.lineWidth = 2; context.beginPath();
      context.ellipse(point.x, point.y, radius, radius * (sceneCamera ? Math.sin(sceneCamera.pitch) : 1), 0, 0, TAU);
      context.stroke(); context.font = '11px sans-serif'; context.textAlign = 'center';
      context.fillText(exit.open ? '출구' : '잠긴 출구', point.x, point.y - radius - 7);
      this._metrics.drawCalls += 2;
    }
    context.textAlign = 'left';
  }

  renderOnce() {
    if (this.state === 'disposed' || !this.width || !this.height) return;
    const start = now(), context = this.context;
    this._metrics.drawCalls = 0; this._metrics.visibleTiles = 0; this._metrics.visibleObjects = 0;
    context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    context.globalAlpha = 1; context.globalCompositeOperation = 'source-over'; context.imageSmoothingEnabled = false;
    context.fillStyle = '#0b0e12'; context.fillRect(0, 0, this.width, this.height); this._metrics.drawCalls += 1;
    if (this._sourcePreview) {
      if (this._sourcePreviewImagesReady) {
        const sprite=this._characters.get(this.characterId)?.sprite,scale=positive(sprite?.scale,1);
        const actorFrame=sprite?{width:sprite.frameWidth*scale,height:sprite.frameHeight*scale,
          anchorX:number(sprite.anchorX,.5),anchorY:number(sprite.anchorY,1)}:null;
        const result = this._sourcePreview.draw(context, this, { drawActor: () => this._drawCharacter(), actorFrame });
        this._metrics.drawCalls += result.drawCalls; this._metrics.visibleObjects = result.visibleObjects;
      } else {
        context.fillStyle = '#bfccd8'; context.font = '13px sans-serif'; context.fillText('UNADOPTED preview · 필수 이미지 디코드 대기', 16, 28);
        this._metrics.drawCalls++;
      }
    } else if (this._sourceScene) {
      if (this._sourceImagesReady) {
        const result = this._sourceScene.draw(context, this, { drawActor: () => this._drawCharacter() });
        this._metrics.drawCalls += result.drawCalls; this._metrics.visibleObjects = result.visibleObjects;
        this._drawParticles();
      } else {
        context.fillStyle = '#bfccd8'; context.font = '13px sans-serif'; context.fillText('원본 장면 · 필수 이미지 디코드 대기', 16, 28);
        this._metrics.drawCalls++;
      }
    } else if (this._terrainScene) {
      this._metrics.drawCalls += this._terrainScene.draw(context,this);
      this._metrics.visibleObjects = this._terrainScene.meshes.length;
    } else {
    this._drawMap();
    for (const object of this._objects.back) this._drawObject(object);
    this._drawMapMarkers();
    this._rigScene?.evaluate();
    const rigs = this._rigScene?.getDrawEntries() || [];
    if (rigs.length || this._viewCamera) {
      const entries = this._objects.world.map(object => ({ depth: this._viewCamera
        ? this.worldToScreen((object.x+.5)*this.project.map.tileSize,(object.y+.5)*this.project.map.tileSize).depth
        : (object.y + 0.5) * this.project.map.tileSize, order: 0, object }));
      for (const rig of rigs) entries.push({ depth: rig.depth, order: 1, rigId: rig.id });
      entries.push({ depth: this._viewCamera ? this.worldToScreen(this.player.x,this.player.y,number(this.player.z)).depth : this.player.y, order: 2, player: true });
      entries.sort((a, b) => a.depth - b.depth || a.order - b.order);
      for (const entry of entries) {
        if (entry.object) this._drawObject(entry.object);
        else if (entry.player) this._drawCharacter();
        else this._metrics.drawCalls += this._rigScene.drawNode(context, entry.rigId, { width: this.width, height: this.height });
      }
    } else {
      let split = 0;
      while (split < this._objects.world.length && (this._objects.world[split].y + 0.5) * this.project.map.tileSize <= this.player.y) this._drawObject(this._objects.world[split++]);
      this._drawCharacter();
      while (split < this._objects.world.length) this._drawObject(this._objects.world[split++]);
    }
    this._drawParticles();
    for (const object of this._objects.front) this._drawObject(object);
    }
    if (!this._sourcePreview) this._drawSceneExits();
    if (this._errors.length) {
      context.fillStyle = '#f1a3d8'; context.font = '12px sans-serif'; context.textAlign = 'left';
      context.fillText(`에셋 오류 ${this._errors.length}개 · ${this._sourcePreview ? 'UNADOPTED preview 중지' : '대체 표시 사용'}`, 12, this.height - 12);
      this._metrics.drawCalls += 1;
    }
    this._metrics.renderMs = now() - start;
    this.onStats?.(this.stats);
  }
}
