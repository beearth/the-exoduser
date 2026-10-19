import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { loadDruidSlamNativeBridge } from '../engine/fdg/dark-druid-slam-bridge.js';

const evidence = '/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-slam-contact-r5';
const rigPath = new URL('../tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json', import.meta.url);
const rigBytes = await readFile(rigPath);
const rig = JSON.parse(rigBytes);
const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const bridgeSource = await readFile(new URL('../engine/fdg/dark-druid-slam-bridge.js', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const plain = value => JSON.parse(JSON.stringify(value));
const flush = () => new Promise(resolve => setImmediate(resolve));
const explicitRigUrl = '../../tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json?v=slam-contact-r5-b';
const defaultRigPath = '/tools/fdg-studio/fixtures/dark-druid-boss-slam-r3.rig.json';
const selectedClip = 'dark-druid-native-slam-contact-r5';
const metrics = {
  scope: 'selected r5 loader, renderer snapshot and opt-in hook only; no browser, native boot, PNG read or old-suite execution',
  inputs: {
    rig: { id: rig.id, bytes: rigBytes.byteLength, sha256: digest(rigBytes) },
    bridgeSha256: digest(bridgeSource), gameSha256: digest(game),
  },
};

async function saveMetrics() {
  await mkdir(evidence, { recursive: true });
  await writeFile(`${evidence}/targeted-slam-contact-bridge-metrics.json`, JSON.stringify(metrics, null, 2) + '\n');
}

function makeCanvasContext() {
  return {
    draws: 0, fills: 0, composites: [],
    save() {}, restore() {}, setTransform() {}, transform() {},
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {},
    translate() {}, scale() {},
    getTransform: () => ({ a: .5, b: 0, c: 0, d: .5, e: 0, f: 0 }),
    drawImage(...args) { this.draws++; this.composites.push({ operation: this.globalCompositeOperation, alpha: this.globalAlpha, args }); },
    fill() { this.fills++; },
  };
}

test('selected r5 loader waits for the original image, installs native wrappers, and reports the actually rasterized clip/time', async t => {
  const saved = Object.fromEntries(['fetch', 'Image', 'location'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  t.after(async () => {
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
    await saveMetrics();
  });
  const requests = [], images = [];
  let responseRig = rig;
  globalThis.location = { origin: 'http://127.0.0.1:3333' };
  globalThis.fetch = async url => {
    requests.push(String(url));
    if (url.pathname.endsWith(defaultRigPath)) return { ok: false, status: 404 };
    assert.equal(url.pathname, '/Users/fordeargamers/the-exoduser/tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json');
    assert.equal(url.search, '?v=slam-contact-r5-b');
    return { ok: true, status: 200, json: async () => structuredClone(responseRig) };
  };
  globalThis.Image = class {
    naturalWidth = 0; naturalHeight = 0;
    set src(value) { this.source = value; images.push(this); }
    ready(width = 355, height = 541) { this.naturalWidth = width; this.naturalHeight = height; this.onload(); }
    fail() { this.onerror(); }
  };
  async function waitImage(count) {
    for (let i = 0; i < 10 && images.length < count; i++) await flush();
    assert.equal(images.length, count);
    return images[count - 1];
  }
  const actorState = { ib: true, alive: true, s: 'idle', st2: 0, facing: 0, x: 2580, y: 2420, r: 44, hp: 21017, _weaponAng: -.75 };
  const actorWrites = [];
  const actor = new Proxy(actorState, {
    set(target, key, value) {
      assert.equal(key, '_nameTopOff', `bridge wrote native actor field ${String(key)}`);
      actorWrites.push(String(key)); target[key] = value; return true;
    },
  });
  const starts = [], fallbacks = [], tells = [], canvas = { width: 0, height: 0 }, rasterContext = makeCanvasContext();
  canvas.getContext = kind => { assert.equal(kind, '2d'); return rasterContext; };
  let canvasCount = 0;
  const originalStart = function (value, move, extra) {
    assert.equal(this, scope); assert.equal(value, actor);
    starts.push({ move: plain(move), extra });
    // Emulate the existing authority before the observer samples it.
    actorState.s = 'bossSlamWind'; actorState.st2 = 26; actorState._weaponAng = -1.2;
    return 'native-start-result';
  };
  const originalDraw = function (...args) { assert.equal(this, scope); fallbacks.push(args); return 'native-sheet-result'; };
  const scope = { _bossStartPattern: originalStart, _drawDruidBoss: originalDraw, _btScaleMul: .5, _BOSS_GLOW: false };
  const options = {
    scope, rigUrl: explicitRigUrl, clipId: selectedClip, getStage: () => 0,
    drawTell: (context, value) => tells.push({ context, actor: value }),
    canvasFactory: () => { canvasCount++; return canvas; },
  };
  const pending = loadDruidSlamNativeBridge(options);
  const image = await waitImage(1);
  assert.equal(image.source, 'http://127.0.0.1:3333/assets/sprites/boss/boss_dark_druid_f0.png');
  assert.equal(image.naturalWidth, 0);
  assert.equal(scope._bossStartPattern, originalStart);
  assert.equal(scope._drawDruidBoss, originalDraw);
  image.ready();
  const bridge = await pending;
  t.after(() => bridge.uninstall());
  assert.notEqual(scope._bossStartPattern, originalStart);
  assert.notEqual(scope._drawDruidBoss, originalDraw);
  assert.equal(bridge.getRenderSnapshot(actor), null);
  assert.equal(scope._bossStartPattern(actor, { id: 'slam' }, 14), 'native-start-result');
  assert.deepEqual(starts, [{ move: { id: 'slam' }, extra: 14 }]);
  assert.deepEqual(bridge.getSnapshot(actor), { phase: 'wind', progress: 0, time: 0, windFrames: 26, facing: 0 });
  const mainContext = makeCanvasContext(), spec = { dw: 9.3, dh: 14.1, glow: '#ffffff' };
  const nativeFields = () => plain(Object.fromEntries(Object.entries(actorState).filter(([key]) => key !== '_nameTopOff')));
  const windBefore = nativeFields();
  assert.equal(scope._drawDruidBoss(mainContext, actor, .8, 0, spec), true);
  assert.deepEqual(nativeFields(), windBefore);
  assert.equal(bridge.getRenderSnapshot(actor).time, 0);
  assert.equal(canvas._glVer, 1);
  actorState.s = 'bossSlam'; actorState.st2 = 8;
  scope._drawDruidBoss(mainContext, actor, .8, 0, spec);
  assert.equal(bridge.getRenderSnapshot(actor).time, 1);
  assert.equal(canvas._glVer, 2);
  const strikeRasterDraws = rasterContext.draws;
  scope._drawDruidBoss(mainContext, actor, .8, 0, spec);
  assert.equal(canvas._glVer, 2);
  assert.equal(rasterContext.draws, strikeRasterDraws);
  actorState.s = 'recover'; actorState.st2 = 40; actorState._weaponAng = 0;
  const contactBefore = nativeFields();
  scope._drawDruidBoss(mainContext, actor, .8, 0, spec);
  assert.deepEqual(nativeFields(), contactBefore);
  const rendered = bridge.getRenderSnapshot(actor);
  assert.equal(canvas._glVer, 3);
  assert.equal(rendered.rigId, 'dark-druid-slam-contact-r5');
  assert.equal(rendered.clipId, selectedClip);
  assert.equal(rendered.time, 1.16);
  assert.equal(rendered.facing, 1);
  assert.ok(Object.values(rendered.bounds).every(Number.isFinite));
  assert.ok(rendered.bounds.width > 0 && rendered.bounds.height > 0);
  rendered.bounds.left = 999999; rendered.time = 999;
  const stable = bridge.getRenderSnapshot(actor);
  assert.notEqual(stable.bounds.left, 999999); assert.equal(stable.time, 1.16);
  assert.equal(bridge.getRenderSnapshot({}), null);
  const pausedDraws = rasterContext.draws;
  scope._drawDruidBoss(mainContext, actor, .8, 0, spec);
  assert.equal(rasterContext.draws, pausedDraws);
  assert.equal(canvas._glVer, 3);
  assert.equal(canvasCount, 1);
  assert.ok(rasterContext.draws > 0);
  assert.deepEqual(mainContext.composites.slice(-3).map(({ operation, alpha }) => ({ operation, alpha })), [
    { operation: 'source-over', alpha: .8 }, { operation: 'lighter', alpha: .8 * .42 }, { operation: 'lighter', alpha: .8 * .42 },
  ]);
  actorState.facing = Math.PI;
  scope._drawDruidBoss(mainContext, actor, .8, 0, spec);
  assert.equal(bridge.getRenderSnapshot(actor).facing, -1);
  assert.equal(canvas._glVer, 4);
  actorState.s = 'idle';
  assert.equal(scope._drawDruidBoss(mainContext, actor, .8, 0, spec), 'native-sheet-result');
  assert.equal(bridge.getRenderSnapshot(actor), null);
  assert.equal(fallbacks.length, 1);
  assert.equal(canvas.width, 0); assert.equal(canvas.height, 0);
  bridge.uninstall();
  assert.equal(scope._bossStartPattern, originalStart); assert.equal(scope._drawDruidBoss, originalDraw);
  assert.ok(actorWrites.every(key => key === '_nameTopOff'));

  const rejected = loadDruidSlamNativeBridge({ ...options, clipId: 'missing-contact-clip' });
  (await waitImage(2)).ready();
  await assert.rejects(rejected, /Selected slam clip and ready original texture/);
  assert.equal(scope._bossStartPattern, originalStart); assert.equal(scope._drawDruidBoss, originalDraw);
  const wrongDimensions = loadDruidSlamNativeBridge(options);
  (await waitImage(3)).ready(354, 541);
  await assert.rejects(wrongDimensions, /Selected slam clip and ready original texture/);
  const failedImage = loadDruidSlamNativeBridge(options);
  (await waitImage(4)).fail();
  await assert.rejects(failedImage, /Original Druid texture could not load/);
  assert.equal(scope._bossStartPattern, originalStart); assert.equal(scope._drawDruidBoss, originalDraw);
  // Exercise the preserved default clip boundary with a new synthetic clone,
  // without opening or rerunning the frozen r3 fixture/suite.
  responseRig = structuredClone(rig);
  responseRig.clips.find(clip => clip.id === selectedClip).id = 'dark-druid-native-slam-r3';
  responseRig.provenance.bossSlam.clipId = 'dark-druid-native-slam-r3';
  const defaultCanvas = { width: 0, height: 0, getContext: () => makeCanvasContext() };
  const defaultOptions = { ...options, canvasFactory: () => defaultCanvas };
  delete defaultOptions.clipId;
  const defaultPending = loadDruidSlamNativeBridge(defaultOptions);
  (await waitImage(5)).ready();
  const defaultBridge = await defaultPending;
  scope._bossStartPattern(actor, { id: 'slam' }, 0);
  scope._drawDruidBoss(mainContext, actor, .8, 0, spec);
  assert.equal(defaultBridge.getRenderSnapshot(actor).clipId, 'dark-druid-native-slam-r3');
  assert.equal(Object.hasOwn(defaultCanvas, '_glVer'), false);
  actorState.s = 'bossSlam'; actorState.st2 = 8;
  scope._drawDruidBoss(mainContext, actor, .8, 0, spec);
  assert.equal(Object.hasOwn(defaultCanvas, '_glVer'), false);
  defaultBridge.uninstall();
  assert.equal(scope._bossStartPattern, originalStart); assert.equal(scope._drawDruidBoss, originalDraw);
  await assert.rejects(loadDruidSlamNativeBridge({ scope, getStage: () => 0 }), /Druid slam rig HTTP 404/);
  const defaultRequest = new URL(requests.at(-1));
  assert.equal(defaultRequest.pathname, '/Users/fordeargamers/the-exoduser' + defaultRigPath);
  assert.equal(defaultRequest.search, '?v=boss-slam-r3-final');
  assert.equal(images.length, 5);
  metrics.loader = {
    explicitRequest: requests[0], defaultRequest: requests.at(-1), originalImageUrl: image.source,
    imageDimensionGate: [355, 541], render: stable, ownerCanvasCount: canvasCount,
    nativeStartCount: starts.length, nativeFallbackCount: fallbacks.length,
    nativeActorWrites: [...new Set(actorWrites)], tellCount: tells.length,
    pausedSamePoseRasterRewrites: 0, r5FreshRasterVersions: [1, 2, 3, 4], pausedStrikeVersion: 2,
    defaultR3VersionFieldAbsentAfterTwoDistinctPoses: true, defaultR3BoundaryInput: 'new r5 clone with default clip id; frozen r3 files unread',
    rejectedMissingClip: true, rejectedWrongImageSize: true, rejectedImageError: true,
  };
});

test('actual game opt-in hook admits r5 only in isolated QA and preserves the r3 default call without native combat writes', async t => {
  t.after(saveMetrics);
  const scriptStart = game.indexOf('const _fdgSlamRevision=new URL(location.href)');
  assert.ok(scriptStart > 0);
  const scriptEnd = game.indexOf('</script>', scriptStart);
  assert.ok(scriptEnd > scriptStart);
  const hook = game.slice(scriptStart, scriptEnd);
  assert.equal((hook.match(/import\(/g) || []).length, 1);
  const executable = hook.replace('import(', '__import(');
  const cases = [];
  for (const [revision, active, expectedCalls] of [['r5', false, 0], ['r5', true, 1], ['r3', false, 1], ['r3', true, 1], ['r5-other', true, 0], ['', true, 0]]) {
    const imports = [], loads = [], warnings = [], nativeCalls = [];
    const actor = { hp: 21017, s: 'bossSlam', st2: 1, facing: .37, _weaponAng: .9, x: 2580, y: 2420 };
    const before = structuredClone(actor);
    const marker = { testBridge: true };
    const originalStart = () => nativeCalls.push('start');
    const originalDraw = () => nativeCalls.push('draw');
    const sandbox = {
      URL, location: { href: `http://127.0.0.1:3333/game.html?fdgDruidSlam=${revision}` },
      G: { stage: 3 }, actor, _isDruidFinale: () => false,
      _drawDruidFinaleTell: () => nativeCalls.push('tell'),
      _bossStartPattern: originalStart, _drawDruidBoss: originalDraw,
      _FDGDruidQaStorage: { active },
      console: { warn: (...args) => warnings.push(args) },
      __import: async moduleUrl => {
        imports.push(moduleUrl);
        return { loadDruidSlamNativeBridge: async options => { loads.push(options); return marker; } };
      },
    };
    sandbox.window = sandbox;
    vm.runInNewContext(executable, sandbox, { timeout: 1000, filename: 'actual-game-slam-module-hook.js' });
    await flush();
    assert.equal(imports.length, expectedCalls); assert.equal(loads.length, expectedCalls);
    assert.deepEqual(nativeCalls, []); assert.deepEqual(actor, before); assert.deepEqual(warnings, []);
    assert.equal(sandbox._bossStartPattern, originalStart); assert.equal(sandbox._drawDruidBoss, originalDraw);
    if (expectedCalls) {
      const options = loads[0];
      assert.equal(options.scope.window, options.scope);
      assert.equal(options.scope._bossStartPattern, originalStart); assert.equal(options.getStage(), 3);
      assert.equal(options.isFinale(actor), false);
      assert.equal(typeof options.drawTell, 'function');
      assert.equal(sandbox._FDGDruidSlamBridge, marker);
      if (revision === 'r5') {
        assert.equal(imports[0], './engine/fdg/dark-druid-slam-bridge.js?v=slam-contact-r5-cache2');
        assert.equal(options.rigUrl, explicitRigUrl); assert.equal(options.clipId, selectedClip);
      } else {
        assert.equal(imports[0], './engine/fdg/dark-druid-slam-bridge.js?v=boss-slam-r3-final');
        assert.equal(Object.hasOwn(options, 'rigUrl'), false); assert.equal(Object.hasOwn(options, 'clipId'), false);
      }
    } else assert.equal(Object.hasOwn(sandbox, '_FDGDruidSlamBridge'), false);
    cases.push({ revision, active, imports: [...imports], nativeCalls: 0, weaponAngleUnchanged: actor._weaponAng === before._weaponAng });
  }
  metrics.gameHook = { sha256: digest(hook), cases, dynamicImportSubstitution: 'only import( to injected __import( for VM', nativeCombatWrites: 0 };
});

test('r5 cache2 raster revision feeds actual WebGPU texture invalidation with the final-B rig and contact pose', async t => {
  const saved = Object.fromEntries(['fetch', 'Image', 'location'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  t.after(async () => {
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
    await saveMetrics();
  });
  assert.equal(digest(rigBytes), 'c20106dc2d691413ee642e8f4517e9d0313f263b076fb8a96e493ecf041da660');
  assert.equal(rig.id, 'dark-druid-slam-contact-r5');
  const requests = [], images = [];
  globalThis.location = { origin: 'http://127.0.0.1:3333' };
  globalThis.fetch = async url => {
    requests.push(String(url));
    assert.ok(url.pathname.endsWith('/tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json'));
    assert.equal(url.search, '?v=slam-contact-r5-b');
    return { ok: true, json: async () => structuredClone(rig) };
  };
  globalThis.Image = class {
    naturalWidth = 355; naturalHeight = 541;
    set src(value) { images.push(value); queueMicrotask(() => this.onload()); }
  };

  // Extract the real WebGPU cache consumer, not a reimplementation of its key.
  const cacheStart = game.indexOf('const _tc=new WeakMap();');
  const cacheEnd = game.indexOf('// ═══ DEFERRED COMMAND RECORDING', cacheStart);
  assert.ok(cacheStart > 0 && cacheEnd > cacheStart);
  const cacheSource = game.slice(cacheStart, cacheEnd);
  const uploads = [], textures = [];
  const gpuScope = {
    _getTex: null, _glMaxTex: 4096, whiteBG: { white: true },
    GPUTextureUsage: { TEXTURE_BINDING: 1, COPY_DST: 2, RENDER_ATTACHMENT: 4 },
    mkBG: texture => ({ texture }),
    GPU: {
      createTexture: descriptor => { const texture = { id: textures.length + 1, descriptor }; textures.push(texture); return texture; },
      queue: { copyExternalImageToTexture: ({ source, flipY }, { texture }, dimensions) => {
        assert.equal(flipY, false);
        texture.uploadedRevision = source._glVer || 0;
        texture.uploadedPoseSerial = source.poseSerial;
        uploads.push({ textureId: texture.id, revision: texture.uploadedRevision, poseSerial: texture.uploadedPoseSerial, dimensions: [...dimensions] });
      } },
    },
  };
  vm.runInNewContext(cacheSource, gpuScope, { timeout: 1000, filename: 'actual-native-webgpu-getTex.js' });
  assert.equal(typeof gpuScope._getTex, 'function');
  const raster = { width: 0, height: 0, poseSerial: 0 };
  const rasterContext = makeCanvasContext();
  rasterContext.setTransform = () => { raster.poseSerial++; };
  raster.getContext = () => rasterContext;
  const actor = { ib: true, alive: true, s: 'idle', st2: 0, facing: 0, x: 2580, y: 2420, r: 44, hp: 21017, _weaponAng: -.7 };
  let starts = 0;
  const start = (value, move) => {
    assert.equal(value, actor); assert.equal(move.id, 'slam'); starts++;
    value.s = 'bossSlamWind'; value.st2 = 26; value._weaponAng = -1.2;
    return 'native-authority-result';
  };
  const draw = () => 'native-fallback';
  const imports = [], warnings = [];
  const sandbox = {
    URL, location: { href: 'http://127.0.0.1:3333/game.html?fdgDruidSlam=r5' },
    _FDGDruidQaStorage: { active: true }, G: { stage: 0 },
    _bossStartPattern: start, _drawDruidBoss: draw, _btScaleMul: .5,
    _isDruidFinale: () => false, _drawDruidFinaleTell() {},
    document: { createElement: tag => { assert.equal(tag, 'canvas'); return raster; } },
    console: { warn: (...args) => warnings.push(args) },
    __import: async url => { imports.push(url); return { loadDruidSlamNativeBridge }; },
  };
  sandbox.window = sandbox;
  const hookStart = game.indexOf('const _fdgSlamRevision=new URL(location.href)');
  const hook = game.slice(hookStart, game.indexOf('</script>', hookStart));
  vm.runInNewContext(hook.replace('import(', '__import('), sandbox, { timeout: 1000, filename: 'actual-r5-cache2-module-hook.js' });
  for (let i = 0; i < 10 && !sandbox._FDGDruidSlamBridge; i++) await flush();
  const bridge = sandbox._FDGDruidSlamBridge;
  assert.ok(bridge); t.after(() => bridge.uninstall());
  assert.deepEqual(imports, ['./engine/fdg/dark-druid-slam-bridge.js?v=slam-contact-r5-cache2']);
  assert.deepEqual(images, ['http://127.0.0.1:3333/assets/sprites/boss/boss_dark_druid_f0.png']);
  assert.deepEqual(warnings, []);
  assert.equal(sandbox._bossStartPattern(actor, { id: 'slam' }), 'native-authority-result');
  const main = makeCanvasContext();
  main.drawImage = canvas => {
    assert.equal(canvas, raster);
    const bg = gpuScope._getTex(canvas);
    assert.equal(bg.texture.uploadedRevision, canvas._glVer);
    assert.equal(bg.texture.uploadedPoseSerial, canvas.poseSerial);
  };
  const nativeBefore = () => plain(Object.fromEntries(Object.entries(actor).filter(([key]) => key !== '_nameTopOff')));
  const spec = { dw: 9.3, dh: 14.1 };
  const observed = [];
  function paint() {
    const before = nativeBefore(); sandbox._drawDruidBoss(main, actor, .8, 0, spec);
    assert.deepEqual(nativeBefore(), before);
    const snapshot = bridge.getRenderSnapshot(actor);
    assert.equal(snapshot.rigId, rig.id); assert.equal(snapshot.clipId, selectedClip);
    observed.push(plain(snapshot)); return snapshot;
  }
  assert.equal(paint().rasterRevision, 1); assert.equal(uploads.length, 1);
  actor.s = 'bossSlam'; actor.st2 = 8;
  assert.equal(paint().rasterRevision, 2); assert.equal(uploads.length, 2);
  assert.equal(paint().rasterRevision, 2); assert.equal(uploads.length, 2);
  actor.s = 'recover'; actor.st2 = 40; actor._weaponAng = 0;
  const contact = paint();
  assert.equal(contact.time, 1.16); assert.equal(contact.rasterRevision, 3); assert.equal(uploads.length, 3);
  const untouched = bridge.getRenderSnapshot(actor);
  contact.rasterRevision = 999; contact.bounds.top = 999;
  assert.deepEqual(bridge.getRenderSnapshot(actor), untouched);
  assert.equal(paint().rasterRevision, 3); assert.equal(uploads.length, 3);
  assert.deepEqual(uploads.map(item => item.revision), [1, 2, 3]);
  assert.deepEqual(uploads.map(item => item.poseSerial), [1, 2, 3]);
  assert.equal(starts, 1);
  bridge.uninstall();
  assert.equal(raster.width, 0); assert.equal(raster.height, 0);
  assert.equal(sandbox._bossStartPattern, start); assert.equal(sandbox._drawDruidBoss, draw);
  metrics.finalCache2 = {
    cacheSourceSha256: digest(cacheSource), hookSha256: digest(hook), requests, imports,
    selectedRigId: rig.id, selectedClipId: selectedClip, observed, uploads,
    pausedReuploads: 0, clonedReadOnlyRevision: true, nativeStartCount: starts,
    nativeCombatFieldsChangedByDraw: 0, fixtureStatus: 'final candidate-b; technical consumer only',
    oldGroupsRerun: 0, pngRead: 0, browserOrNativeBoot: 0,
  };
});
