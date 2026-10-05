'use strict';

// Acceptance evidence belongs outside the checkout. This test opens only an
// isolated, headless editor context and never starts a server, game, or build.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const { loadImage } = require('canvas');

const REPO = path.resolve(__dirname, '..');
const OUTPUT = '/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/final-acceptance';
const SCENE = 'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json';
const LAYOUT = 'assets/map/hell_rift/interspace_20261005/layout.js';
const ART = 'assets/map/hell_rift/interspace_20261005/hell-rift-painterly-v2.png';
const ABYSS = 'assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png';
const BASE = 'http://127.0.0.1:3387/';
const CACHE = 'exoduser:map-scene:v1';
const NAV_SHA = '52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb';
const RESULT_NAV_SHA = 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179';
const RESULT_WALKABLE = 1192, RESULT_ROUTE_VISITED = 1185;
const RESULT_SCENE_SHA = 'f5068d742ddd6da3e1c78fb7178317df228e936bab0edc6237dec40bfd0bb5ac';
const ART_SHA = 'a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4';
const ABYSS_SHA = 'ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const plain = value => JSON.parse(JSON.stringify(value));
const file = name => path.join(REPO, name);
const report = {
  runAt: new Date().toISOString(), source: SCENE, baseURL: BASE,
  tests: [], evidence: [], layerPixels: [], cameras: [],
  pageErrors: [], consoleErrors: [], failedRequests: [], badResponses: [],
  verdict: 'PENDING', visualVerdict: 'NOT_ASSESSED',
  limitation: 'Technical acceptance does not establish visual approval, native gameplay, NPC dialogue, sound acceptance, or production adoption.'
};
let browser;

async function check(name, run) {
  const value = await run();
  report.tests.push({ name, pass: true, ...(value === undefined ? {} : { evidence: value }) });
  console.log('PASS ' + name);
  return value;
}

function loadCore() {
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(fs.readFileSync(file('tools/map-scene-core.js'), 'utf8'), context, { filename: 'map-scene-core.js' });
  return context.module.exports;
}

function pixelDiff(a, b) {
  const x = PNG.sync.read(a), y = PNG.sync.read(b);
  assert.equal(x.width, y.width); assert.equal(x.height, y.height);
  let changed = 0, maximumChannelDelta = 0;
  for (let i = 0; i < x.data.length; i += 4) {
    let different = false;
    for (let c = 0; c < 4; c++) {
      const d = Math.abs(x.data[i + c] - y.data[i + c]);
      maximumChannelDelta = Math.max(maximumChannelDelta, d);
      if (d) different = true;
    }
    if (different) changed++;
  }
  return { changed, total: x.width * x.height, maximumChannelDelta };
}

function watch(page, label) {
  page.on('pageerror', error => report.pageErrors.push({ page: label, message: error.message }));
  page.on('console', message => {
    if (message.type() === 'error') report.consoleErrors.push({ page: label, message: message.text() });
  });
  page.on('requestfailed', request => report.failedRequests.push({ page: label, url: request.url(), failure: request.failure() }));
  page.on('response', response => {
    if (response.status() >= 400) report.badResponses.push({ page: label, status: response.status(), url: response.url() });
  });
}

async function seed(context, cached) {
  await context.addInitScript(({ key, value }) => {
    // The browser context is disposable; seed once per origin, before editor JS.
    if (window.top !== window || location.origin !== 'http://127.0.0.1:3387') return;
    if (!sessionStorage.getItem('hell-rift-acceptance-seeded')) {
      localStorage.setItem(key, value);
      sessionStorage.setItem('hell-rift-acceptance-seeded', 'yes');
    }
    window.acceptanceStorageWrites = [];
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      window.acceptanceStorageWrites.push(k);
      return set.call(this, k, v);
    };
  }, { key: CACHE, value: JSON.stringify(cached) });
}

async function settled(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  });
}

async function ready(page) {
  await page.waitForFunction(() => window.EXODUSER_SCENE_EDITOR?.ready && !document.getElementById('scene-workspace').inert, null, { timeout: 30000 });
  await settled(page);
}

async function snapshot(page) {
  return page.evaluate(() => window.EXODUSER_SCENE_EDITOR.snapshot());
}

async function canvasPixels(page) {
  const encoded = await page.locator('#scene-canvas').evaluate(canvas => canvas.toDataURL('image/png').split(',')[1]);
  return Buffer.from(encoded, 'base64');
}

async function assertAutomaticView(page, point, project, span) {
  const size = await page.locator('#scene-stage').evaluate(stage => {
    const bounds = stage.getBoundingClientRect(); return { width: bounds.width, height: bounds.height };
  });
  const view = await page.evaluate(() => window.EXODUSER_SCENE_EDITOR.view());
  const expectedZoom = Math.min(size.width / span.width, size.height / span.height);
  assert.ok(Math.abs(view.zoom - expectedZoom) < 1e-9, 'Automatic camera zoom differs from its stage extent');
  const halfX = size.width / view.zoom / 2, halfY = size.height / view.zoom / 2;
  const maxX = project.world.cols * project.world.tileSize, maxY = project.world.rows * project.world.tileSize;
  const clamp = (value, half, maximum) => half * 2 >= maximum ? maximum / 2 : Math.max(half, Math.min(maximum - half, value));
  assert.ok(Math.abs(view.x - clamp(point.x, halfX, maxX)) < 1e-6, 'Camera x does not clamp to world bounds');
  assert.ok(Math.abs(view.y - clamp(point.y, halfY, maxY)) < 1e-6, 'Camera y does not clamp to world bounds');
  const bounds = { left: view.x - halfX, right: view.x + halfX, top: view.y - halfY, bottom: view.y + halfY };
  assert.ok(bounds.left >= -1e-6 && bounds.right <= maxX + 1e-6 && bounds.top >= -1e-6 && bounds.bottom <= maxY + 1e-6, 'Automatic camera exposes space outside the world');
  return { view, stage: size, bounds };
}

async function capture(page, name, full = false) {
  const out = path.join(OUTPUT, name);
  const buffer = full ? await page.screenshot({ path: out }) : await page.locator('#scene-canvas').screenshot({ path: out });
  report.evidence.push(out);
  // CSS screenshots may move a fractional element clip by one display pixel.
  // Compare the actual render target for exact Undo/mask checks.
  return full ? buffer : canvasPixels(page);
}

async function download(page, selector, name) {
  const wait = page.waitForEvent('download', { timeout: 30000 });
  await page.locator(selector).click();
  const item = await wait;
  const target = path.join(OUTPUT, name);
  await item.saveAs(target);
  assert.equal(await item.failure(), null);
  report.evidence.push(target);
  return { target, suggestedFilename: item.suggestedFilename() };
}

async function main() {
  fs.mkdirSync(OUTPUT, { recursive: true });
  const K = loadCore();
  const sourceBytes = fs.readFileSync(file(SCENE));
  const project = plain(K.validate(JSON.parse(sourceBytes)));
  const layoutContext = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(file(LAYOUT), 'utf8'), layoutContext, { filename: LAYOUT });
  const original = plain(layoutContext.window.HELL_RIFT_INTERSPACE);
  const raw = original.variants.interspace;
  const grid = plain(K.decode(raw.tileRLE, raw.w * raw.h));
  const protectedBefore = Object.fromEntries([ART, ABYSS, LAYOUT, 'tools/map-scene-core.js', 'tools/map-scene-editor.js'].map(name => [name, sha(fs.readFileSync(file(name)))]));
  report.sourceSHA256 = sha(sourceBytes);
  assert.equal(report.sourceSHA256, RESULT_SCENE_SHA, 'Result differs from the owner-announced final scene pin');
  report.protectedBefore = protectedBefore;

  await check('Scene v1 contract and detached JSON round trip', () => {
    assert.deepEqual(plain(K.validate(plain(project))), project);
    const normalized = plain(K.validate(project)); normalized.name = 'detached clone';
    assert.notEqual(normalized.name, project.name);
    assert.deepEqual(project.world, { cols: 200, rows: 200, tileSize: 40 });
    const feather = project.layers.flatMap(layer => layer.objects).filter(object => object.maskFeather > 0);
    assert.ok(feather.length > 0, 'Result must exercise soft masks, rather than only declaring support');
    return { layers: project.layers.length, objects: project.layers.reduce((sum, layer) => sum + layer.objects.length, 0), softMasks: feather.length };
  });

  await check('Original art/layout navigation stays intact while result navigation matches reviewed metadata', () => {
    assert.equal(sha(fs.readFileSync(file(ART))), ART_SHA);
    assert.equal(sha(fs.readFileSync(file(ABYSS))), ABYSS_SHA);
    assert.equal(original.source.path, ART); assert.equal(original.source.sha256, ART_SHA); assert.equal(original.source.originalUnedited, true);
    assert.equal(sha(Buffer.from(grid)), NAV_SHA); assert.equal(raw.navSha256, NAV_SHA);
    assert.equal(grid.filter(Boolean).length, 4107);
    assert.equal(project.sourcePins.originalNav, NAV_SHA);
    assert.equal(project.sourcePins.nav, RESULT_NAV_SHA);
    assert.equal(project.sourcePins.walkableCount, RESULT_WALKABLE);
    assert.equal(sha(Buffer.from(project.walkable)), project.sourcePins.nav);
    assert.equal(project.walkable.filter(Boolean).length, project.sourcePins.walkableCount);
    assert.notEqual(project.sourcePins.nav, project.sourcePins.originalNav);
    assert.deepEqual(project.start, { x: 4020, y: 7740 }); assert.deepEqual(project.exit, { x: 4020, y: 1740 });
    assert.ok(project.assets.some(asset => asset.src === ART), 'Painting must remain an actual scene source');
    assert.equal(K.canWalk(project, 4100, 4100), false, 'Central abyss must remain blocked');
    return { artSHA256: ART_SHA, abyssSHA256: ABYSS_SHA, originalNavSHA256: NAV_SHA, originalWalkable: 4107, resultNavSHA256: RESULT_NAV_SHA, resultWalkable: RESULT_WALKABLE, start: project.start, exit: project.exit };
  });

  await check('Radius-aware route and original camera positions survive composition', () => {
    const route = plain(K.route(project));
    assert.equal(route.pass, true); assert.equal(route.visited, RESULT_ROUTE_VISITED);
    assert.equal(project.navigationReview.basis, 'painted-eastern-ledge');
    assert.equal(project.navigationReview.halfWidthTiles, 2.75);
    assert.equal(project.navigationReview.centreline.length, 34);
    for (const [x, y] of project.navigationReview.centreline) assert.equal(K.canWalk(project, x * raw.T, y * raw.T), true, 'Reviewed centreline cannot support a radius-12 actor');
    const expected = original.cameraAnchors.map(([x, y]) => ({ x: (x + .5) * raw.T, y: (y + .5) * raw.T }));
    for (const point of expected) assert.ok(project.cameras.some(camera => camera.x === point.x && camera.y === point.y), 'Original camera anchor missing: ' + JSON.stringify(point));
    return route;
  });

  await check('Soft mask limits and required mask are enforced atomically', () => {
    const target = project.layers.flatMap(layer => layer.objects).find(object => object.mask);
    assert.ok(target);
    const change = value => {
      const candidate = plain(project);
      candidate.layers.flatMap(layer => layer.objects).find(object => object.id === target.id).maskFeather = value;
      return candidate;
    };
    assert.equal(plain(K.validate(change(0))).layers.flatMap(layer => layer.objects).find(object => object.id === target.id).maskFeather, 0);
    assert.equal(plain(K.validate(change(160))).layers.flatMap(layer => layer.objects).find(object => object.id === target.id).maskFeather, 160);
    const history = new K.History(project), before = JSON.stringify(history.project);
    for (const value of [-1, 160.01, '12', null]) {
      assert.throws(() => history.import(change(value)));
      assert.equal(JSON.stringify(history.project), before);
      assert.equal(history.undoStack.length, 0); assert.equal(history.redoStack.length, 0);
    }
    const missing = change(1); delete missing.layers.flatMap(layer => layer.objects).find(object => object.id === target.id).mask;
    assert.throws(() => history.import(missing)); assert.equal(JSON.stringify(history.project), before);
  });

  await check('Every scene image exists with exact pixel dimensions and crop bounds', async () => {
    const assets = [];
    for (const asset of project.assets) {
      assert.ok(!asset.src.startsWith('data:'), 'Saved result should reuse versioned source files');
      const bytes = fs.readFileSync(file(asset.src)), image = await loadImage(bytes);
      assert.equal(image.width, asset.width, asset.id + ' source width'); assert.equal(image.height, asset.height, asset.id + ' source height');
      assert.ok(asset.crop.x + asset.crop.w <= image.width && asset.crop.y + asset.crop.h <= image.height);
      assets.push({ id: asset.id, src: asset.src, width: image.width, height: image.height, sha256: sha(bytes) });
    }
    report.assetPins = assets;
    return assets;
  });

  const httpScene = await fetch(new URL(SCENE, BASE));
  await check('Local server returns the exact committed-source JSON bytes', async () => {
    assert.equal(httpScene.status, 200);
    assert.equal(sha(Buffer.from(await httpScene.arrayBuffer())), sha(sourceBytes));
  });

  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  report.browser = await browser.version();
  const context = await browser.newContext({ viewport: { width: 1680, height: 1050 }, deviceScaleFactor: 1, acceptDownloads: true });
  const stale = plain(project); stale.name = 'QA_RECOVERY_SENTINEL_DO_NOT_REPLACE_QUERY';
  await seed(context, stale);
  const page = await context.newPage(); watch(page, 'scene-query');
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(new URL('editor.html?scene=' + encodeURIComponent(SCENE), BASE).href);
  await ready(page);

  await check('Explicit scene query loads its actual JSON instead of the recovery scene', async () => {
    assert.deepEqual(await snapshot(page), project);
    assert.ok(requests.some(url => new URL(url).pathname.endsWith('/' + SCENE)), 'Scene JSON was never requested');
    assert.equal(await page.locator('#scene-name').textContent(), project.name);
    await page.waitForTimeout(650);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), CACHE), JSON.stringify(stale));
    assert.deepEqual(await page.evaluate(() => window.acceptanceStorageWrites), []);
    assert.equal(await page.locator('#gameFrame').getAttribute('src'), null);
    assert.ok(!requests.some(url => /\/api\/slots|\/game(?:-easy-test)?\.html/.test(url)), 'Editor initiated a game or save-slot request');
    return { requested: SCENE, recoveryPreserved: true, initialStorageWrites: [] };
  });

  await check('Ordinary editor entry still restores an existing local recovery project', async () => {
    const restoreContext = await browser.newContext({ viewport: { width: 1500, height: 960 } });
    try {
      await seed(restoreContext, stale);
      const restorePage = await restoreContext.newPage(); watch(restorePage, 'recovery-entry');
      await restorePage.goto(new URL('editor.html', BASE).href); await ready(restorePage);
      assert.deepEqual(await snapshot(restorePage), stale);
      assert.equal(await restorePage.locator('#gameFrame').getAttribute('src'), null);
    } finally { await restoreContext.close(); }
  });

  await capture(page, 'editor-result-overview.png', true);
  const overview = await capture(page, 'canvas-overview.png');
  await check('Actual route control reports the pinned navigable route', async () => {
    await page.locator('#scene-check').click();
    assert.match(await page.locator('#scene-toast').textContent(), /PASS/);
    assert.ok((await page.locator('#scene-toast').textContent()).includes(String(RESULT_ROUTE_VISITED)));
  });

  await check('Visible composition layers alter rendered pixels and Undo restores pixels', async () => {
    let altered = 0;
    for (const layer of project.layers.filter(layer => layer.visible && layer.objects.length)) {
      await page.getByRole('button', { name: layer.name + ' 가시성', exact: true }).click(); await settled(page);
      const hidden = await canvasPixels(page);
      const difference = pixelDiff(overview, hidden);
      report.layerPixels.push({ id: layer.id, name: layer.name, objects: layer.objects.length, ...difference });
      if (difference.changed) altered++;
      assert.equal((await snapshot(page)).layers.find(item => item.id === layer.id).visible, false);
      await page.locator('#scene-undo').click(); await settled(page);
      assert.deepEqual(await snapshot(page), project);
      const restored = await capture(page, 'undo-' + layer.id.replace(/[^A-Za-z0-9_-]/g, '_') + '.png');
      assert.equal(pixelDiff(overview, restored).changed, 0, 'Undo did not restore rendered pixels for ' + layer.id);
    }
    assert.ok(altered >= 2, 'Only one visible layer contributes pixels; layered composition is not demonstrated');
    return report.layerPixels;
  });

  await check('Soft mask renderer changes actual edge pixels versus hard clipping', async () => {
    const hard = plain(project);
    for (const object of hard.layers.flatMap(layer => layer.objects)) if (object.maskFeather > 0) object.maskFeather = 0;
    await page.evaluate(candidate => window.EXODUSER_SCENE_EDITOR.importProject(candidate), hard); await settled(page);
    const hardBuffer = await capture(page, 'canvas-hard-mask-control.png');
    const difference = pixelDiff(overview, hardBuffer);
    assert.ok(difference.changed > 20, 'Soft mask settings did not affect actual pixels');
    await page.locator('#scene-undo').click(); await settled(page);
    assert.deepEqual(await snapshot(page), project);
    assert.equal(pixelDiff(overview, await canvasPixels(page)).changed, 0);
    return difference;
  });

  await check('Malformed file import keeps the current scene and Undo history intact', async () => {
    const bad = plain(project); bad.walkable.pop();
    const badFile = path.join(OUTPUT, 'malformed-control.scene.json'); fs.writeFileSync(badFile, JSON.stringify(bad));
    const canUndo = await page.locator('#scene-undo').isEnabled(), canRedo = await page.locator('#scene-redo').isEnabled();
    await page.locator('#scene-project-file').setInputFiles(badFile);
    await page.waitForFunction(() => !document.getElementById('scene-workspace').inert && document.getElementById('scene-toast').textContent.startsWith('현재 씬 유지'));
    assert.deepEqual(await snapshot(page), project);
    assert.equal(await page.locator('#scene-undo').isEnabled(), canUndo); assert.equal(await page.locator('#scene-redo').isEnabled(), canRedo);
  });

  await check('Project download and actual file-input round trip preserve all scene data', async () => {
    const saved = await download(page, '#scene-save', 'roundtrip.scene.json');
    assert.deepEqual(JSON.parse(fs.readFileSync(saved.target, 'utf8')), project);
    assert.deepEqual(plain(K.validate(JSON.parse(fs.readFileSync(saved.target, 'utf8')))), project);
    await page.locator('#scene-project-file').setInputFiles(saved.target);
    await page.waitForFunction(() => !document.getElementById('scene-workspace').inert && document.getElementById('scene-toast').textContent === '씬 불러오기 완료');
    await settled(page); assert.deepEqual(await snapshot(page), project);
    assert.equal(pixelDiff(overview, await canvasPixels(page)).changed, 0);
    return { suggestedFilename: saved.suggestedFilename, bytes: fs.statSync(saved.target).size };
  });

  await check('PNG export decodes as a nonblank 2048px full-scene composition', async () => {
    const saved = await download(page, '#scene-png', 'hell-rift-editor-export.png');
    const bytes = fs.readFileSync(saved.target), png = PNG.sync.read(bytes);
    const maximum = Math.max(project.world.cols, project.world.rows) * project.world.tileSize;
    assert.equal(png.width, Math.round(project.world.cols * project.world.tileSize * 2048 / maximum));
    assert.equal(png.height, Math.round(project.world.rows * project.world.tileSize * 2048 / maximum));
    let nonBackground = 0, transparent = 0; const colors = new Set();
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i] !== 13 || png.data[i + 1] !== 21 || png.data[i + 2] !== 16) nonBackground++;
      if (png.data[i + 3] !== 255) transparent++;
      if (i % 64 === 0) colors.add((png.data[i] << 16) | (png.data[i + 1] << 8) | png.data[i + 2]);
    }
    assert.ok(nonBackground > png.width * png.height / 10); assert.ok(colors.size > 1000); assert.equal(transparent, 0);
    return { width: png.width, height: png.height, bytes: bytes.length, sha256: sha(bytes), nonBackground, sampledColors: colors.size };
  });

  await check('Original camera metadata remains exact while actual camera views clamp inside world bounds', async () => {
    const hashes = new Set();
    for (let i = 0; i < project.cameras.length; i++) {
      const camera = project.cameras[i];
      await page.locator('#scene-cameras button').nth(i).click(); await settled(page);
      const actual = await assertAutomaticView(page, camera, project, { width: 1800, height: 1100 }), view = actual.view;
      const buffer = await capture(page, 'camera-' + String(i).padStart(2, '0') + '.png');
      const digest = sha(PNG.sync.read(buffer).data); hashes.add(digest);
      report.cameras.push({ id: camera.id, name: camera.name, anchor: { x: camera.x, y: camera.y }, x: view.x, y: view.y, zoom: view.zoom, viewportBounds: actual.bounds, pixelSHA256: digest });
    }
    assert.ok(hashes.size >= 8, 'Camera controls did not produce distinct spatial views');
    await page.locator('#scene-fit').click(); await settled(page);
    assert.deepEqual(await snapshot(page), project);
    return report.cameras;
  });

  await check('Walking entry and real keyboard movement keep the automatic camera within the world', async () => {
    await page.waitForFunction(() => window.MapSceneActor?.snapshot().loaded);
    assert.deepEqual(await page.evaluate(() => window.MapSceneActor.snapshot().errors), []);
    await page.locator('#scene-play').click(); await settled(page);
    const before = await page.evaluate(() => window.EXODUSER_SCENE_EDITOR.player());
    assert.deepEqual(before, project.start);
    const initial = await assertAutomaticView(page, before, project, { width: 1600, height: 1000 });
    await capture(page, 'walking-entry-clamped.png');
    await page.locator('#scene-canvas').focus(); await page.keyboard.down('w');
    await page.waitForTimeout(250);
    const walking = await page.evaluate(() => ({ player: window.EXODUSER_SCENE_EDITOR.player(), actor: window.MapSceneActor.snapshot() }));
    await page.keyboard.up('w'); await settled(page);
    assert.ok(walking.player.y < before.y - 20, 'Actual northward keyboard movement did not advance');
    assert.equal(K.canWalk(project, walking.player.x, walking.player.y), true);
    assert.equal(walking.actor.moving, true); assert.equal(walking.actor.heading, 'north');
    assert.ok(walking.actor.frame >= 2 && walking.actor.frame <= 9);
    const moved = await assertAutomaticView(page, walking.player, project, { width: 1600, height: 1000 });
    await capture(page, 'walking-north-clamped.png');
    await page.keyboard.press('Escape'); await settled(page);
    assert.equal(await page.evaluate(() => window.EXODUSER_SCENE_EDITOR.player()), null);
    assert.deepEqual(await snapshot(page), project);
    await page.locator('#scene-fit').click(); await settled(page);
    return { initial, moved, actor: walking.actor, distance: Math.hypot(walking.player.x - before.x, walking.player.y - before.y) };
  });

  await check('Browser errors, missing images, game requests and legacy storage writes remain zero', async () => {
    await page.waitForTimeout(650);
    assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.consoleErrors, []);
    assert.deepEqual(report.failedRequests, []); assert.deepEqual(report.badResponses, []);
    const writes = await page.evaluate(() => window.acceptanceStorageWrites);
    assert.ok(writes.every(key => key === CACHE));
    assert.ok(await page.locator('.scene-asset img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)));
    assert.ok(!requests.some(url => /\/api\/slots|\/game(?:-easy-test)?\.html/.test(url)));
    return { allowedRecoveryWrites: writes.length, storageKeys: [...new Set(writes)] };
  });

  await check('Acceptance run leaves the scene, original painting, navigation source and renderer unchanged', () => {
    for (const [name, hash] of Object.entries(protectedBefore)) assert.equal(sha(fs.readFileSync(file(name))), hash, 'Concurrent source changed during test: ' + name);
    assert.equal(sha(fs.readFileSync(file(SCENE))), sha(sourceBytes));
    report.protectedAfter = Object.fromEntries(Object.keys(protectedBefore).map(name => [name, sha(fs.readFileSync(file(name)))]));
  });

  await context.close(); await browser.close(); browser = null;
  report.verdict = 'PASS';
}

main().catch(error => {
  report.verdict = 'FAIL'; report.failure = { message: error.message, stack: error.stack };
  console.error(error.stack);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  fs.mkdirSync(OUTPUT, { recursive: true });
  const result = path.join(OUTPUT, 'acceptance-report.json');
  fs.writeFileSync(result, JSON.stringify(report, null, 2));
  console.log(report.verdict + ' ' + report.tests.length + ' checks; ' + result);
});
