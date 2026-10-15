import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime, ParticleSystem, SkillSystem, animationFrame, isWalkableCircle,
  FIXED_STEP, MAX_FRAME_DELTA, MAX_SUBSTEPS, MAX_PARTICLES } from '../engine/fdg/runtime.js';
import { FrameProfiler } from '../engine/fdg/profiler.js';

class FakeEvents {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(callback);
  }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  dispatch(type, data = {}) {
    const event = { preventDefault() { this.defaultPrevented = true; }, ...data };
    for (const callback of this.listeners.get(type) || []) callback(event);
    return event;
  }
  count() { return [...this.listeners.values()].reduce((sum, callbacks) => sum + callbacks.size, 0); }
}

function fixture({ width = 320, height = 240, images = {}, devicePixelRatio = 1 } = {}) {
  const calls = [];
  const context = { globalAlpha: 1 };
  for (const name of ['setTransform', 'fillRect', 'beginPath', 'moveTo', 'lineTo', 'stroke',
    'strokeRect', 'fillText', 'ellipse', 'fill', 'arc', 'drawImage']) {
    context[name] = (...args) => { calls.push({ name, args }); };
  }
  const window = new FakeEvents();
  const pendingFrames = new Map();
  const pendingImages = new Map();
  const sources = [];
  let nextFrame = 0;
  Object.assign(window, {
    devicePixelRatio,
    requestAnimationFrame(callback) { const id = ++nextFrame; pendingFrames.set(id, callback); return id; },
    cancelAnimationFrame(id) { pendingFrames.delete(id); },
    Image: class {
      set src(source) {
        sources.push(source);
        this.source = source;
        const result = images[source] || { width: 336, height: 16 };
        this.naturalWidth = result.width || 0;
        this.naturalHeight = result.height || 0;
        const finish = () => { if (result.error) this.onerror?.(); else this.onload?.(); };
        if (result.defer) pendingImages.set(source, finish);
        else queueMicrotask(finish);
      }
    },
  });
  const document = new FakeEvents();
  document.defaultView = window;
  const canvas = new FakeEvents();
  const attributes = new Map();
  Object.assign(canvas, {
    width, height, ownerDocument: document,
    getContext: () => context,
    getBoundingClientRect: () => ({ left: 10, top: 20, width, height }),
    hasAttribute: name => attributes.has(name),
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
    focus() { this.focused = true; },
  });
  return { canvas, window, document, context, calls, sources, pendingFrames, pendingImages,
    fireFrame(timestamp) {
      const entry = pendingFrames.entries().next().value;
      assert.ok(entry, 'A scheduled animation frame exists.');
      pendingFrames.delete(entry[0]);
      entry[1](timestamp);
    } };
}

function project(overrides = {}) {
  const width = 30, height = 30;
  const tiles = Array.from({ length: width * height }, (_, index) => {
    const x = index % width, y = Math.floor(index / width);
    return x === 0 || x === width - 1 || y === 0 || y === height - 1 ? 0 : 1;
  });
  return {
    schemaVersion: 1, id: 'test', name: 'Runtime fixture',
    map: { width, height, tileSize: 40, tiles, start: { x: 10, y: 20 }, exit: { x: 10, y: 2 }, objects: [] },
    characters: [{ id: 'warrior', name: '전사', speed: 160, radius: 12,
      sprite: { src: '/test/warrior.png', frameWidth: 16, frameHeight: 16, columns: 21, rows: 1, frames: 21, fps: 8, scale: 2, anchorX: 0.5, anchorY: 1 },
      animations: { idle: { row: 0, start: 0, frames: 2, fps: 6, loop: true }, walk: { row: 0, start: 2, frames: 8, fps: 12, loop: true }, attack: { row: 0, start: 10, frames: 8, fps: 12, loop: false } } }],
    skills: [{ id: 'slam', name: '미리보기 강타', cooldown: 1.5, cost: 40, range: 120, damage: 20, vfx: 'burst' }],
    vfx: [{ id: 'burst', name: '입자 폭발', kind: 'burst', color: '#ff8822', count: 12, life: 1, speed: 80, size: 4, spread: Math.PI * 2 }],
    preview: { characterId: 'warrior', skillId: 'slam', vfxId: 'burst', resourceMax: 100, resourceRegen: 10 },
    ...overrides,
  };
}

const near = (actual, expected, epsilon = 1e-7) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} should equal ${expected}`);
const advance = (runtime, seconds, fps = 60) => { for (let i = 0; i < seconds * fps; i += 1) runtime.step(1 / fps); };

test('atlas animation honors column start, wrapping rows, FPS, and final non-looping frame', () => {
  const sprite = { columns: 4, rows: 3, frames: 10, frameWidth: 16, frameHeight: 32, fps: 8 };
  assert.deepEqual(animationFrame(sprite, { row: 0, start: 2, frames: 6, fps: 10 }, 0.3), {
    index: 5, column: 1, row: 1, sx: 16, sy: 32, sw: 16, sh: 32, finished: false,
  });
  assert.equal(animationFrame(sprite, { row: 1, frames: 3, fps: 10, loop: false }, 5).index, 6);
  assert.equal(animationFrame(sprite, { row: 1, frames: 3, fps: 10, loop: false }, 5).finished, true);
  assert.equal(animationFrame(sprite, { frames: 2, fps: 10 }, 0.2).index, 0);
  assert.equal(animationFrame(sprite, { frames: 2 }, 0, 2).row, 2);
});

test('cooldown and resource accounting use seconds and refuse spending on failed casts', () => {
  const system = new SkillSystem(project().skills, { resourceMax: 100, resourceRegen: 10 });
  const cast = system.cast('slam', { x: 10, y: 20 }, { x: 1000, y: 20 });
  assert.equal(cast.ok, true);
  near(cast.target.x, 130);
  near(system.resource, 60);
  assert.equal(system.cast('slam').reason, 'cooldown');
  near(system.resource, 60);
  for (let i = 0; i < 90; i += 1) system.update(FIXED_STEP);
  near(system.resource, 75);
  assert.equal(system.getState('slam').cooldown, 0);
  assert.equal(system.cast('slam').ok, true);
  near(system.resource, 35);
  system.update(1.5);
  system.cast('slam');
  system.update(1.5);
  assert.equal(system.cast('slam').reason, 'resource');
  near(system.resource, 25);
  system.update(100);
  near(system.resource, 100);
  assert.equal(system.cast('missing').reason, 'unknown-skill');
});

test('particle hard budget, expiry, movement, and pool object reuse survive repeated bursts', () => {
  const particles = new ParticleSystem({ budget: 5000, random: () => 0.5 });
  const firstRecord = particles.pool[0];
  assert.equal(particles.budget, MAX_PARTICLES);
  const vfx = { ...project().vfx[0], kind: 'projectile', count: 2048, speed: 100, life: 1, spread: 0 };
  assert.equal(particles.emit(vfx, { x: 10, y: 20 }, { angle: 0 }), 1024);
  assert.equal(particles.count, 1024);
  assert.equal(particles.dropped, 1024);
  particles.update(0.5);
  near(firstRecord.x, 60);
  particles.update(0.5);
  assert.equal(particles.count, 0);
  assert.equal(particles.free.length, 1024);
  particles.emit({ ...vfx, count: 1 }, { x: 30, y: 40 }, { angle: 0 });
  assert.equal(particles.pool[0], firstRecord);
  assert.equal(firstRecord.x, 30);
  particles.clear();
  assert.equal(particles.count, 0);
  assert.equal(particles.free.length, 1024);
  assert.equal(particles.emit({ ...vfx, life: 0 }), 0);
});

test('tile collision checks circle corners, tangent boundaries, and all blocked tile kinds', () => {
  const map = { width: 3, height: 3, tileSize: 40, tiles: [1, 1, 1, 1, 0, 1, 1, 2, 3] };
  assert.equal(isWalkableCircle(map, 28, 60, 12), true);
  assert.equal(isWalkableCircle(map, 29, 60, 12), false);
  assert.equal(isWalkableCircle(map, 32, 32, 10), true, 'Rounded corner stays outside wall.');
  assert.equal(isWalkableCircle(map, 34, 34, 10), false, 'Circle reaches the wall corner.');
  assert.equal(isWalkableCircle(map, 10, 20, 12), false);
  assert.equal(isWalkableCircle(map, 60, 100, 5), false);
  assert.equal(isWalkableCircle(map, 100, 100, 5), false);
});

test('movement distance and diagonal speed match at 30, 60, and 120 rendering FPS', () => {
  const distances = [];
  for (const fps of [30, 60, 120]) {
    const surface = fixture();
    const runtime = new FDGRuntime(surface.canvas, project());
    runtime.start();
    const origin = { ...runtime.player };
    surface.canvas.dispatch('keydown', { code: 'KeyW' });
    surface.canvas.dispatch('keydown', { code: 'KeyD' });
    advance(runtime, 1, fps);
    distances.push(Math.hypot(runtime.player.x - origin.x, runtime.player.y - origin.y));
    near(runtime.stats.time, 1);
    runtime.dispose();
  }
  for (const distance of distances) near(distance, 160);
});

test('high speed movement cannot tunnel across a blocked tile wall', () => {
  const definition = project();
  definition.characters[0].speed = 6000;
  for (let y = 0; y < definition.map.height; y += 1) definition.map.tiles[y * definition.map.width + 12] = 0;
  const surface = fixture();
  const runtime = new FDGRuntime(surface.canvas, definition);
  runtime.start();
  surface.canvas.dispatch('keydown', { code: 'KeyD' });
  advance(runtime, 0.5);
  assert.ok(runtime.player.x + runtime.player.radius <= 12 * 40);
  assert.ok(runtime.player.x > 420);
  runtime.dispose();
});

test('hitches clamp time, cap substeps, count discarded work, and retain no update backlog', () => {
  const surface = fixture();
  const runtime = new FDGRuntime(surface.canvas, project());
  assert.equal(MAX_FRAME_DELTA, 0.25);
  assert.equal(runtime.step(1), MAX_SUBSTEPS);
  near(runtime.stats.time, 0.1);
  near(runtime.stats.droppedTime, 0.9);
  assert.equal(runtime.stats.droppedSteps, 54);
  assert.equal(runtime.step(0), 0);
  assert.equal(runtime.step(FIXED_STEP), 1);
  runtime.dispose();
});

test('rAF stats preserve raw hitch milliseconds before fixed-step clamps and reset the first gap', async () => {
  const surface = fixture();
  const runtime = new FDGRuntime(surface.canvas, project());
  assert.equal(runtime.stats.frameDeltaMs, 0);
  runtime.start();
  surface.fireFrame(100);
  assert.equal(runtime.stats.frame, 1);
  assert.equal(runtime.stats.frameDeltaMs, 0);
  surface.fireFrame(1100);
  assert.equal(runtime.stats.frameDeltaMs, 1000);
  assert.equal(runtime.stats.updateSteps, 6);
  assert.equal(runtime.stats.droppedSteps, 54);
  near(runtime.stats.time, 0.1);
  runtime.pause();
  assert.equal(runtime.stats.frameDeltaMs, 0);
  runtime.resume();
  surface.fireFrame(10_000);
  assert.equal(runtime.stats.frameDeltaMs, 0, 'Paused time is excluded.');
  surface.fireFrame(10_020);
  assert.equal(runtime.stats.frameDeltaMs, 20);
  surface.window.dispatch('blur');
  surface.fireFrame(20_000);
  assert.equal(runtime.stats.frameDeltaMs, 0, 'Blur restarts the timing origin.');
  await runtime.setProject(project());
  assert.equal(runtime.stats.frameDeltaMs, 0);
  surface.fireFrame(30_000);
  assert.equal(runtime.stats.frameDeltaMs, 0, 'Project replacement restarts the timing origin.');
  runtime.dispose();
});

test('profiler excludes manual step/render stats, pause, first resume, and disposed runtime', () => {
  const surface = fixture();
  const profiler = new FrameProfiler({ warmupFrames: 0 });
  const accepted = [];
  const runtime = new FDGRuntime(surface.canvas, project(), {
    onStats: stats => { if (profiler.sample(stats)) accepted.push(stats.frame); },
  });
  runtime.start();
  profiler.start('live', runtime.stats);
  surface.fireFrame(0);
  surface.fireFrame(20);
  assert.deepEqual(accepted, [2]);
  runtime.renderOnce(); runtime.step(1); runtime.renderOnce();
  assert.equal(runtime.stats.frame, 2);
  assert.deepEqual(accepted, [2], 'Manual APIs do not invent another rAF frame.');
  surface.fireFrame(40);
  assert.equal(profiler.snapshot().metrics.droppedSteps, 0, 'Running manual-step drops are outside a new rAF measurement.');
  runtime.pause(); runtime.step(1); runtime.renderOnce();
  runtime.resume();
  surface.fireFrame(1000);
  surface.fireFrame(1020);
  assert.deepEqual(accepted, [2, 3, 5]);
  assert.equal(profiler.snapshot().metrics.droppedSteps, 0, 'Paused manual steps are not measured.');
  runtime.dispose();
  assert.equal(profiler.sample(runtime.stats), false);
  assert.equal(profiler.stop().sampleCount, 3);
});

test('focused-canvas input, blur, pause/resume, and disposal clean all event and rAF state', () => {
  const surface = fixture();
  const runtime = new FDGRuntime(surface.canvas, project());
  runtime.start(); runtime.start();
  assert.equal(surface.pendingFrames.size, 1, 'start is idempotent.');
  surface.fireFrame(0);
  surface.document.dispatch('keydown', { code: 'KeyD' });
  surface.fireFrame(1000 / 60);
  const initialX = runtime.player.x;
  surface.canvas.dispatch('keydown', { code: 'KeyD' });
  surface.fireFrame(2000 / 60);
  assert.ok(runtime.player.x > initialX);
  surface.canvas.dispatch('blur');
  const blurredX = runtime.player.x;
  surface.fireFrame(3000 / 60);
  near(runtime.player.x, blurredX);
  surface.canvas.dispatch('keydown', { code: 'KeyD' });
  runtime.pause();
  assert.equal(surface.pendingFrames.size, 0);
  runtime.resume();
  surface.fireFrame(5000);
  surface.fireFrame(5000 + 1000 / 60);
  near(runtime.player.x, blurredX);
  assert.equal(runtime.stats.droppedSteps, 0, 'Paused time never enters the accumulator.');
  runtime.setInputEnabled(false);
  surface.canvas.dispatch('keydown', { code: 'Space' });
  assert.equal(runtime.stats.casts, 0);
  runtime.dispose(); runtime.dispose();
  assert.equal(surface.pendingFrames.size, 0);
  assert.equal(surface.canvas.count(), 0);
  assert.equal(surface.window.count(), 0);
  assert.equal(surface.document.count(), 0);
  assert.equal(surface.canvas.hasAttribute('tabindex'), false);
  assert.equal(runtime.state, 'disposed');
  assert.equal(runtime.step(1), 0);
});

test('keyboard space rejects repeats and pointer casts use camera-correct world coordinates', () => {
  const surface = fixture();
  const runtime = new FDGRuntime(surface.canvas, project());
  runtime.start();
  surface.canvas.dispatch('keydown', { code: 'Space', repeat: true });
  assert.equal(runtime.stats.casts, 0);
  surface.canvas.dispatch('pointerdown', { button: 0, clientX: 10 + 160 + 80, clientY: 20 + 120 });
  assert.equal(surface.canvas.focused, true);
  assert.equal(runtime.lastCast.ok, true);
  near(runtime.lastCast.target.x, runtime.player.x + 80);
  near(runtime.lastCast.target.y, runtime.player.y);
  assert.equal(runtime.stats.particleCount, 12);
  advance(runtime, 1.5);
  surface.canvas.dispatch('keydown', { code: 'Space', repeat: false });
  assert.equal(runtime.stats.casts, 2);
  runtime.dispose();
});

test('loading caches all character directions and object images; failure stays visible and reported', async () => {
  const errors = [];
  const definition = project();
  definition.characters[0].sprite.directions = { south: '/test/warrior.png', east: '/test/east.png' };
  definition.map.objects = [{ id: 'tree', name: '나무', x: 11, y: 20, src: '/test/missing.png', scale: 1, layer: 'front', collision: false }];
  const surface = fixture({ images: { '/test/missing.png': { error: true } }, devicePixelRatio: 3 });
  const runtime = new FDGRuntime(surface.canvas, definition, { onError: (error, metadata) => errors.push([error.message, metadata.source]) });
  await runtime.load();
  assert.deepEqual(new Set(surface.sources), new Set(['/test/warrior.png', '/test/east.png', '/test/missing.png']));
  assert.equal(runtime.stats.assetErrors, 1);
  assert.equal(errors[0][1], '/test/missing.png');
  assert.ok(surface.calls.some(call => call.name === 'fillText' && call.args[0].includes('에셋 오류')));
  assert.equal(surface.canvas.width, 640, 'DPR is capped at 2.');
  runtime.setDirection('east');
  runtime.setAnimation('walk');
  advance(runtime, 0.25);
  runtime.renderOnce();
  const draws = surface.calls.filter(call => call.name === 'drawImage');
  assert.equal(draws.at(-1).args[1], 5 * 16, 'walk column start 2 + elapsed frame 3.');
  await runtime.setProject(definition);
  assert.equal(surface.sources.length, 3, 'Set project reuses assets.');
  assert.equal(runtime.stats.assetErrors, 1, 'Cached load errors are still visible after reset.');
  runtime.dispose();
});

test('viewport tile and object culling avoids full-map draws and screen transforms invert', async () => {
  const definition = project();
  definition.map.width = 200; definition.map.height = 200;
  definition.map.tiles = Array(40000).fill(1);
  definition.map.objects = [
    { id: 'near', x: 10, y: 20, src: '/test/prop.png', scale: 1, layer: 'world' },
    { id: 'far', x: 190, y: 190, src: '/test/prop.png', scale: 1, layer: 'front' },
  ];
  const surface = fixture({ images: { '/test/prop.png': { width: 32, height: 64 } } });
  const runtime = new FDGRuntime(surface.canvas, definition);
  await runtime.load();
  assert.ok(runtime.stats.visibleTiles <= 9 * 7);
  assert.equal(runtime.stats.visibleObjects, 1);
  runtime.setCamera(2000, 3000);
  const screen = runtime.worldToScreen(2050, 3090);
  const world = runtime.screenToWorld(screen.x, screen.y);
  near(world.x, 2050); near(world.y, 3090);
  assert.equal(runtime.stats.visibleObjects, 0);
  runtime.followCharacter();
  assert.equal(runtime.stats.visibleObjects, 1);
  runtime.dispose();
});

test('scene replacement retires ready/error images and cancels stale callbacks without current errors', async () => {
  const errors = [];
  const oldProject = project();
  oldProject.map.objects = [
    { id: 'ready', x: 10, y: 20, src: '/test/retired-ready.png', layer: 'world' },
    { id: 'error', x: 10, y: 20, src: '/test/retired-error.png', layer: 'world' },
  ];
  const surface = fixture({ images: { '/test/retired-error.png': { error: true }, '/test/pending.png': { error: true, defer: true } } });
  const runtime = new FDGRuntime(surface.canvas, oldProject, { onError: (error, metadata) => errors.push(metadata.source) });
  await runtime.load();
  assert.equal(runtime.assets.size, 3);
  const pendingProject = project();
  pendingProject.map.objects = [{ id: 'pending', x: 10, y: 20, src: '/test/pending.png', layer: 'world' }];
  const pendingLoad = runtime.setProject(pendingProject);
  assert.equal(runtime.assets.has('/test/retired-ready.png'), false);
  assert.equal(runtime.assets.has('/test/retired-error.png'), false);
  const currentProject = project();
  await runtime.setProject(currentProject);
  await pendingLoad;
  assert.equal(runtime.assets.size, 1);
  assert.equal(runtime.assets.has('/test/warrior.png'), true, 'Common images stay cached.');
  assert.equal(surface.sources.filter(src => src === '/test/warrior.png').length, 1);
  surface.pendingImages.get('/test/pending.png')();
  assert.equal(runtime.stats.assetErrors, 0);
  assert.deepEqual(errors, ['/test/retired-error.png'], 'Retired pending asset does not report an error into the next scene.');
  runtime.dispose();
});

test('relative assets resolve from server root and declared unseen atlas frames are validated on load', async () => {
  const definition = project();
  definition.characters[0].sprite.src = 'img/warrior.png';
  const surface = fixture({ images: { '/img/warrior.png': { width: 32, height: 16 } } });
  const runtime = new FDGRuntime(surface.canvas, definition);
  await runtime.load();
  assert.deepEqual(surface.sources, ['/img/warrior.png']);
  assert.equal(runtime.stats.assetErrors, 1, 'First idle cell fits, but the declared full atlas does not.');
  assert.equal(surface.calls.some(call => call.name === 'drawImage'), false);
  runtime.dispose();
  const absoluteSurface = fixture();
  const absoluteRuntime = new FDGRuntime(absoluteSurface.canvas, definition, { assetBase: 'https://preview.local/' });
  await absoluteRuntime.load();
  assert.deepEqual(absoluteSurface.sources, ['https://preview.local/img/warrior.png']);
  absoluteRuntime.dispose();
});

test('ring/projectile sprites can traverse multi-row atlases; invalid frames use visible fallback', async () => {
  const definition = project();
  definition.vfx.push({ id: 'sheet', kind: 'ring', color: '#aaffff', count: 1, life: 2, speed: 100, size: 10, spread: 0,
    sprite: { src: '/test/sheet.png', frameWidth: 32, frameHeight: 32, columns: 4, rows: 2, frames: 8, fps: 8, scale: 1, anchorX: 0.5, anchorY: 0.5 } });
  const surface = fixture({ images: { '/test/sheet.png': { width: 128, height: 64 } } });
  const runtime = new FDGRuntime(surface.canvas, definition);
  await runtime.load();
  runtime.triggerVfx('sheet');
  advance(runtime, 0.625);
  runtime.renderOnce();
  const draw = surface.calls.filter(call => call.name === 'drawImage').at(-1);
  assert.equal(draw.args[1], 32); assert.equal(draw.args[2], 32);
  definition.vfx.at(-1).sprite.frameWidth = 128;
  runtime.renderOnce();
  assert.equal(runtime.stats.assetErrors, 1);
  assert.ok(surface.calls.some(call => call.name === 'arc'), 'Invalid atlas remains visible as a procedural ring.');
  runtime.dispose();
});

test('one VFX emission renders one sheet and count minus one primitives without duplicate sheet overdraw', async () => {
  const sprite = { src: '/test/sheet.png', frameWidth: 32, frameHeight: 32, columns: 4, rows: 2, frames: 8, fps: 8, scale: 1, anchorX: 0.5, anchorY: 0.5 };
  const effect = { id: 'sheet-burst', kind: 'burst', color: '#aaffff', count: 48, life: 1, speed: 100, size: 4, spread: Math.PI * 2, sprite };
  const particles = new ParticleSystem({ random: () => 0 });
  particles.emit(effect, { x: 100, y: 200 }, { angle: 0 });
  assert.equal(particles.active.filter(index => particles.pool[index].sprite).length, 1);
  particles.update(0.25);
  near(particles.pool[0].x, 100); near(particles.pool[0].y, 200);
  assert.ok(particles.pool[1].x !== 100, 'Remaining primitive particles still move.');
  particles.clear();
  particles.emit({ ...effect, kind: 'projectile' }, { x: 100, y: 200 }, { angle: 0 });
  particles.update(0.25);
  const projectileSheet = particles.pool[particles.active[0]];
  near(projectileSheet.x, 125); near(projectileSheet.y, 200);
  const definition = project();
  definition.vfx.push(effect);
  const surface = fixture({ images: { '/test/sheet.png': { width: 128, height: 64 } } });
  const runtime = new FDGRuntime(surface.canvas, definition);
  await runtime.load();
  runtime.triggerVfx('sheet-burst');
  surface.calls.length = 0;
  runtime.renderOnce();
  assert.equal(runtime.stats.particleCount, 48);
  assert.equal(surface.calls.filter(call => call.name === 'drawImage' && call.args[0].source === '/test/sheet.png').length, 1);
  assert.equal(surface.calls.filter(call => call.name === 'arc').length, 47);
  runtime.dispose();
});
