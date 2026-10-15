import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime } from '../engine/fdg/runtime.js';

// Authored numeric QA inputs, never production source/nav/assets or a fallback scene.
function projectFixture(label = 'live', { source = true, layers } = {}) {
  const tiles = Array(40_000).fill(1);
  const project = {
    schemaVersion: 1, id: `qa-${label}`, name: `QA ${label}`,
    map: {
      id: `qa-map-${label}`, name: 'QA native grid', width: 200, height: 200,
      tileSize: 40, tiles, start: { x: 100, y: 185 }, exit: { x: 100, y: 5 },
      objects: [], unknownCollisionAuthority: { untouched: true },
    },
    characters: [{
      id: 'qa_actor', name: 'QA actor', speed: 156, radius: 12,
      sprite: {
        src: `qa/${label}-actor.png`, frameWidth: 16, frameHeight: 16,
        columns: 2, rows: 1, frames: 2, fps: 24, scale: 1, anchorX: .5, anchorY: .9,
      },
      animations: {
        idle: { row: 0, start: 0, frames: 1, fps: 24, loop: true },
        walk: { row: 0, start: 1, frames: 1, fps: 24, loop: true },
      },
    }],
    skills: [{ id: 'qa_skill', name: 'QA skill', cooldown: 1, cost: 1, range: 100, damage: 1, vfx: 'qa_vfx' }],
    vfx: [{ id: 'qa_vfx', name: 'QA effect', kind: 'burst', color: '#abcdef', count: 1, life: 1, speed: 1, size: 1, spread: 1 }],
    preview: { characterId: 'qa_actor', skillId: 'qa_skill', vfxId: 'qa_vfx', resourceMax: 100, resourceRegen: 1 },
    unknownGameplay: { damageAuthority: 'production remains external', nested: [1, { kept: true }] },
  };
  if (source) project.sourceScene = {
    schemaVersion: 1, stage: 0, grid: { width: 200, height: 200, tileSize: 40 },
    nav: { tiles: [...tiles], scope: 'polygon-plus-source-colliders' }, colliders: [],
    height: {
      logicalSamples: Array.from({ length: 40_000 }, (_, i) => .25 + (i % 200) * .001),
      source: 'explicit synthetic QA samples', interpolation: 'bilinear-cell-centers',
      heightMapping: { kind: 'engine-authored-linear', scalePx: 64, offsetPx: 10, authoredBy: 'QA fixture' },
    },
    actor: {
      position: [4020, 7420, 32.4],
      startAuthority: { symbol: 'QA_START', source: 'QA authored source contract' },
      sourceStart: { rawTile: [100, 185], centerTile: [100.5, 185.5], worldPx: [4020, 7420] },
      unknownActorAuthority: { preserve: true },
    },
    camera: { x: 4020, y: 7420, follow: true, unknownCamera: 'preserve' },
    settings: { maxStep: 12, maxSlope: .6 },
    imageLayers: layers || [imageLayer(`${label}-ground`, `qa/${label}-ground.png`, 'ground', 7520)],
    provenance: { scope: 'synthetic unit integration', runtimeApproved: false, unknown: ['keep', { value: 7 }] },
  };
  return project;
}

function imageLayer(id, src, layer, depthY) {
  return { id, src, layer, depthY, sourceRect: [0, 0, 16, 16], worldRect: [3920, 7320, 200, 200], opacity: 1 };
}

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    get listenerCount() { return [...listeners.values()].reduce((sum, entries) => sum + entries.size, 0); },
  };
}

function harness(plans = {}) {
  const calls = [], images = [], requests = [], states = [];
  const context = { globalAlpha: 1, globalCompositeOperation: 'source-over' };
  for (const method of ['setTransform', 'beginPath', 'rect', 'clip', 'moveTo', 'lineTo',
    'fillRect', 'strokeRect', 'fillText', 'stroke', 'fill', 'ellipse', 'arc']) {
    context[method] = (...args) => calls.push({ method, args });
  }
  context.save = () => states.push({ globalAlpha: context.globalAlpha, globalCompositeOperation: context.globalCompositeOperation });
  context.restore = () => Object.assign(context, states.pop());
  context.drawImage = (image, ...args) => calls.push({ method: 'drawImage', path: image.path, args, alpha: context.globalAlpha });
  class FakeImage {
    constructor() { this.naturalWidth = 0; this.naturalHeight = 0; this.onload = null; this.onerror = null; images.push(this); }
    set src(value) {
      this.path = value.replace(/^\//, ''); requests.push(this.path);
      const plan = plans[this.path] || {};
      queueMicrotask(() => {
        if (plan.fail === 'decode') { this.onerror?.(new Error('QA invalid encoded image')); return; }
        this.naturalWidth = plan.fail === 'empty' ? 0 : (plan.width ?? 64);
        this.naturalHeight = plan.fail === 'empty' ? 0 : (plan.height ?? 64);
        this.onload?.();
      });
    }
    removeAttribute(name) { if (name === 'src') this.removed = true; }
  }
  const window = { ...eventTarget(), Image: FakeImage, devicePixelRatio: 1 };
  const document = { ...eventTarget(), defaultView: window, hidden: false };
  const attributes = new Map();
  const canvas = {
    ...eventTarget(), ownerDocument: document, width: 400, height: 300,
    getContext: type => type === '2d' ? context : null,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 300 }),
    hasAttribute: name => attributes.has(name),
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name), focus() {},
  };
  // Spread getters evaluate once. Count the actual listener collections through
  // dedicated targets retained below instead of copying their numeric readings.
  const canvasEvents = eventTarget(), windowEvents = eventTarget(), documentEvents = eventTarget();
  for (const [target, events] of [[canvas, canvasEvents], [window, windowEvents], [document, documentEvents]]) {
    target.addEventListener = events.addEventListener;
    target.removeEventListener = events.removeEventListener;
  }
  return { canvas, context, calls, images, requests, plans,
    listenerCount: () => canvasEvents.listenerCount + windowEvents.listenerCount + documentEvents.listenerCount,
  };
}

async function liveRuntime(t, plans = {}) {
  const environment = harness(plans), reported = [], project = projectFixture();
  const runtime = new FDGRuntime(environment.canvas, project, { onError: (error, metadata) => reported.push({ message: error.message, ...metadata }) });
  t.after(() => runtime.dispose());
  await runtime.load();
  assert.equal(runtime.sourceSceneReady, true, 'QA live source images must be decoded before candidate preparation');
  return { runtime, environment, reported, project };
}

function assertLiveUnchanged(runtime, before, candidatePaths, reported) {
  assert.strictEqual(runtime.project, before.project);
  assert.strictEqual(runtime._sourceScene, before.consumer);
  assert.deepEqual(runtime.player, before.actor);
  assert.deepEqual(runtime.camera, before.camera);
  assert.deepEqual(runtime.stats.errors, before.errors);
  assert.equal(runtime.sourceSceneReady, true);
  assert.equal(before.consumer.disposed, false);
  assert.deepEqual([...runtime.assets.keys()].sort(), before.assets);
  for (const path of candidatePaths) assert.equal(runtime.assets.has(path), false, `Rejected candidate record must retire: ${path}`);
  for (const [path, record] of before.records) assert.strictEqual(runtime.assets.get(path), record);
  assert.equal(reported.length, 0, 'Candidate failure must not report a live runtime asset error');
  assert.equal(runtime._pendingAssets.size, 0);
}

function liveCheckpoint(runtime) {
  return {
    project: runtime.project, consumer: runtime._sourceScene,
    actor: structuredClone(runtime.player), camera: structuredClone(runtime.camera),
    errors: runtime.stats.errors, assets: [...runtime.assets.keys()].sort(), records: [...runtime.assets],
  };
}

test('Source preparation decode failure retires new records without replacing the live scene or contaminating errors', async t => {
  const { runtime, environment, reported } = await liveRuntime(t, { 'qa/candidate-ground.png': { fail: 'decode' } });
  runtime.moveSource(5, 0); runtime.setCamera(4100, 7300);
  const before = liveCheckpoint(runtime), candidate = projectFixture('candidate');
  await assert.rejects(runtime.prepareSourceScene(candidate), /ready decoded image/);
  assertLiveUnchanged(runtime, before, ['qa/candidate-ground.png', 'qa/candidate-actor.png'], reported);
  assert.equal(environment.requests.filter(path => path === 'qa/candidate-ground.png').length, 1);
});

test('Source preparation checks actual crop bounds and empty decoded dimensions before installation', async t => {
  const { runtime, environment, reported } = await liveRuntime(t, {
    'qa/crop-ground.png': { width: 8, height: 16 },
    'qa/empty-ground.png': { fail: 'empty' },
  });
  const before = liveCheckpoint(runtime);
  for (const [label, error] of [['crop', /sourceRect exceeds/], ['empty', /ready decoded image/]]) {
    await assert.rejects(runtime.prepareSourceScene(projectFixture(label)), error);
    assertLiveUnchanged(runtime, before, [`qa/${label}-ground.png`, `qa/${label}-actor.png`], reported);
  }
  assert.equal(environment.requests.filter(path => path.endsWith('-ground.png')).length, 3);
});

test('Successful source preparation installs supported movement and roundtrips physical Z, camera and unknown authority', async t => {
  const { runtime } = await liveRuntime(t);
  const candidate = projectFixture('accepted'), candidateBefore = structuredClone(candidate), previous = runtime._sourceScene;
  const prepared = await runtime.prepareSourceScene(candidate);
  assert.deepEqual(candidate, candidateBefore, 'Preparation may not rewrite authored inputs');
  assert.equal(prepared.ok, true); assert.equal(prepared.sources, 2);
  assert.equal(runtime.project.id, 'qa-live', 'Preparation alone does not install');
  await runtime.setProject(candidate);
  prepared.release();
  assert.equal(previous.disposed, true);
  assert.equal(runtime.sourceSceneReady, true);
  assert.equal(runtime.assets.get('qa/accepted-ground.png').status, 'ready', 'Release retains newly active assets');
  assert.equal(runtime.moveSource(10, 0), true);
  assert.equal(runtime.player.x, 4030); assert.equal(runtime.player.y, 7420);
  assert.ok(Math.abs(runtime.player.z - 32.416) < 1e-9, 'Mapped height changes with the original logical sample gradient');
  assert.deepEqual([runtime.camera.x, runtime.camera.y], [4030, 7420]);
  const supportedPosition = structuredClone(runtime.player);
  assert.equal(runtime.moveSource(10.01, 0), false);
  assert.equal(runtime.moveSource(NaN, 0), false);
  assert.deepEqual(runtime.player, supportedPosition);
  runtime.setCamera(4100, 7300);
  const saved = runtime.captureSceneState();
  assert.deepEqual(saved.actorPosition, [4030, 7420, runtime.player.z]);
  assert.deepEqual(saved.project.sourceScene.actor.sourceStart, candidate.sourceScene.actor.sourceStart);
  assert.deepEqual(saved.project.sourceScene.provenance, candidate.sourceScene.provenance);
  assert.deepEqual(saved.project.unknownGameplay, candidate.unknownGameplay);
  assert.deepEqual(saved.project.map.unknownCollisionAuthority, candidate.map.unknownCollisionAuthority);
  assert.equal(saved.project.sourceScene.camera.unknownCamera, 'preserve');
  assert.deepEqual(saved.project.sourceScene.height, candidate.sourceScene.height);
  assert.deepEqual(saved.project.sourceScene.nav, candidate.sourceScene.nav);
  const decoded = JSON.parse(JSON.stringify(saved.project)), environment = harness();
  const reopened = new FDGRuntime(environment.canvas, decoded);
  t.after(() => reopened.dispose());
  await reopened.load();
  assert.equal(reopened.sourceSceneReady, true);
  assert.deepEqual([reopened.player.x, reopened.player.y, reopened.player.z], saved.actorPosition);
  assert.deepEqual(reopened.camera, saved.camera);
  assert.equal(reopened.getSourceSceneSnapshot().heightMapping.scalePx, 64);
  saved.project.sourceScene.provenance.unknown[1].value = -1;
  assert.equal(runtime.captureSourceScene().provenance.unknown[1].value, 7, 'Capture is isolated from the live consumer');
});

test('Source rendering sums native actor and image draw calls while keeping world-Y ordering and painted XY', async t => {
  const layers = [
    imageLayer('ground', 'qa/render-ground.png', 'ground', 7520),
    imageLayer('after', 'qa/render-after.png', 'world', 7430),
    imageLayer('before', 'qa/render-before.png', 'world', 7410),
    imageLayer('front', 'qa/render-front.png', 'front', 7520),
  ];
  const environment = harness(), runtime = new FDGRuntime(environment.canvas, projectFixture('render', { layers }));
  t.after(() => runtime.dispose()); await runtime.load();
  environment.calls.length = 0; runtime.renderOnce();
  const drawn = environment.calls.filter(call => call.method === 'drawImage');
  assert.deepEqual(drawn.map(call => call.path), ['qa/render-ground.png', 'qa/render-before.png', 'qa/render-actor.png', 'qa/render-after.png', 'qa/render-front.png']);
  assert.equal(drawn.filter(call => call.path === 'qa/render-actor.png').length, 1);
  assert.deepEqual(drawn[0].args, [0, 0, 16, 16, 100, 50, 200, 200]);
  assert.equal(runtime.stats.drawCalls, 7, 'Clear + four approved image draws + native actor shadow/sprite all remain counted');
  assert.equal(runtime.stats.visibleObjects, 4);
  assert.equal(runtime.stats.visibleTiles, 0, 'Source consumer does not substitute tile geometry');
  assert.equal(environment.calls.filter(call => call.method === 'fillRect').length, 1, 'Only the owner clear is painted as a rectangle');
  assert.equal(environment.calls.filter(call => call.method === 'strokeRect').length, 0, 'No tile markers or box actor fallback');
  assert.equal(runtime.stats.assetErrors, 0);
});

test('Scene replacement retires decoded source records and dispose releases the new source consumer and listeners', async t => {
  const { runtime, environment } = await liveRuntime(t);
  const first = runtime._sourceScene, oldGround = runtime.assets.get('qa/live-ground.png');
  await runtime.setProject(projectFixture('ordinary', { source: false }));
  assert.equal(first.disposed, true); assert.equal(first.scene, null);
  assert.equal(first.requiredSources().size, 0);
  assert.equal(runtime.assets.has('qa/live-ground.png'), false); assert.equal(oldGround.image, null);
  assert.equal(runtime.sourceSceneReady, false); assert.equal(runtime.getSourceSceneSnapshot(), null);
  const prepared = await runtime.prepareSourceScene(projectFixture('last'));
  await runtime.setProject(projectFixture('last')); prepared.release();
  const last = runtime._sourceScene;
  assert.equal(runtime.sourceSceneReady, true);
  assert.ok(environment.listenerCount() > 0);
  runtime.dispose(); runtime.dispose();
  assert.equal(last.disposed, true); assert.equal(last.scene, null);
  assert.equal(last.requiredSources().size, 0);
  assert.equal(runtime.assets.size, 0); assert.equal(runtime._pendingAssets.size, 0);
  assert.equal(runtime.sourceSceneReady, false); assert.equal(runtime.getSourceSceneSnapshot(), null);
  assert.equal(runtime.captureSourceScene(), null); assert.equal(runtime.moveSource(1, 0), false);
  assert.equal(environment.listenerCount(), 0);
  assert.equal(runtime.state, 'disposed');
});
