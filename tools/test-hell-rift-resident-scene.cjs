'use strict';

// Pure/data and source-image checks only: no scene output, server, browser, game,
// user save, generated image or production-map write is part of this test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');
const { PNG } = require('pngjs');
const coreContext = { module: { exports: {} }, JSON };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'map-scene-core.js'), 'utf8'), coreContext, { filename: 'map-scene-core.js' });
const K = coreContext.module.exports;
const B = require('./build-hell-rift-resident-scene.cjs');
const REPO = path.resolve(__dirname, '..');
const C = B.CONTRACT;
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const file = name => path.join(REPO, name);
const protectedPaths = [C.originalScene, C.painting.src, C.abyss.src, C.cleanPlate.src, C.atlas.src];
const before = Object.fromEntries(protectedPaths.map(name => [name, sha(fs.readFileSync(file(name)))]));
const original = JSON.parse(fs.readFileSync(file(C.originalScene), 'utf8'));
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
freeze(original);
const candidate = B.build(original);
let passed = 0;
const check = (name, fn) => { fn(); passed++; console.log('PASS ' + name); };
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const world = (object, u, v) => {
  const angle = object.rotation * Math.PI / 180;
  const x = (u - object.pivotX) * object.width * (object.flipX ? -1 : 1);
  const y = (v - object.pivotY) * object.height;
  return { x: object.x + x * Math.cos(angle) - y * Math.sin(angle), y: object.y + x * Math.sin(angle) + y * Math.cos(angle) };
};
const objects = scene => new Map(scene.layers.flatMap(layer => layer.objects).map(object => [object.id, object]));

check('Actual original/new PNG decoding, dimensions and exact SHA pins', () => {
  const verified = B.verifySources();
  assert.deepEqual(verified.original, original);
  assert.equal(verified.images.length, 4);
  for (const image of verified.images) assert.equal(image.sha256, before[image.src]);
  assert.equal(before[C.originalScene], C.originalSceneSha256);
});

check('Atlas alpha > 8 gives four exact independent resident bboxes', () => {
  const image = PNG.sync.read(fs.readFileSync(file(C.atlas.src)));
  const regions = [[0, 0], [627, 0], [0, 627], [627, 627]];
  for (let n = 0; n < C.residents.length; n++) {
    const [x0, y0] = regions[n]; let left = 1254, top = 1254, right = -1, bottom = -1, visible = 0;
    for (let y = y0; y < y0 + 627; y++) for (let x = x0; x < x0 + 627; x++) {
      if (image.data[(y * 1254 + x) * 4 + 3] <= C.alphaThreshold) continue;
      left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); visible++;
    }
    assert.ok(visible > 1000, 'Missing body pixels: ' + C.residents[n].key);
    assert.deepEqual({ x: left, y: top, w: right - left + 1, h: bottom - top + 1 }, C.residents[n].crop);
  }
  assert.equal(image.data[3], 0, 'Atlas exterior must remain transparent');
});

check('Nine painting/foreground crops rescale source only; abyss stays original', () => {
  assert.equal(candidate.assets.length, 14);
  for (const asset of original.assets) {
    const next = candidate.assets.find(a => a.id === asset.id);
    if (asset.id === 'rift-depth') { assert.deepEqual(next, asset); continue; }
    assert.ok(C.paintingAssetIds.includes(asset.id));
    assert.equal(next.src, C.cleanPlate.src); assert.equal(next.width, 1254); assert.equal(next.height, 1254);
    for (const key of ['x', 'y', 'w', 'h']) assert.equal(next.crop[key], asset.crop[key] * C.sourceRatio);
    assert.deepEqual(Object.fromEntries(Object.entries(next).filter(([key]) => !['src', 'width', 'height', 'crop'].includes(key))), Object.fromEntries(Object.entries(asset).filter(([key]) => !['src', 'width', 'height', 'crop'].includes(key))));
  }
});

check('Original six layers, ten geometries and normalized masks stay exact', () => {
  assert.equal(candidate.layers.length, 6);
  const nextObjects = objects(candidate);
  for (const layer of original.layers) {
    const next = candidate.layers.find(item => item.id === layer.id);
    assert.deepEqual(Object.fromEntries(Object.entries(next).filter(([key]) => key !== 'objects')), Object.fromEntries(Object.entries(layer).filter(([key]) => key !== 'objects')));
    for (const object of layer.objects) assert.deepEqual(nextObjects.get(object.id), object);
    if (layer.id !== 'foot') assert.deepEqual(next.objects, layer.objects);
  }
  assert.equal(candidate.layers.find(layer => layer.id === 'foot').sort, 'foot');
  assert.equal(candidate.layers.find(layer => layer.id === 'foot').objects.length, 7);
});

check('Scaled bitmap source coordinates and every normalized mask point keep world positions', () => {
  const nextObjects = objects(candidate);
  for (const object of original.layers.flatMap(layer => layer.objects)) {
    const next = nextObjects.get(object.id);
    const asset = original.assets.find(a => a.id === object.assetId);
    const newAsset = candidate.assets.find(a => a.id === object.assetId);
    for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1], [.27, .63], ...(object.mask || [])]) {
      const ratio = object.assetId === 'rift-depth' ? 1 : C.sourceRatio;
      const newU = ((asset.crop.x + u * asset.crop.w) * ratio - newAsset.crop.x) / newAsset.crop.w;
      const newV = ((asset.crop.y + v * asset.crop.h) * ratio - newAsset.crop.y) / newAsset.crop.h;
      const a = world(object, u, v), b = world(next, newU, newV);
      near(a.x, b.x); near(a.y, b.y);
    }
  }
});

check('Four resident anchors, alpha-cropped widths, body heights and foot pivots are exact', () => {
  const nextObjects = objects(candidate);
  for (const resident of C.residents) {
    const id = 'resident-' + resident.key;
    const asset = candidate.assets.find(a => a.id === id), object = nextObjects.get('obj-' + id);
    assert.deepEqual(asset.crop, resident.crop); assert.equal(asset.src, C.atlas.src);
    assert.equal(asset.width, 1254); assert.equal(asset.height, 1254);
    const height = resident.key === 'berin' ? 80 * 352 / 578 : 80;
    assert.equal(object.height, height); assert.equal(object.width, height * resident.crop.w / resident.crop.h);
    assert.deepEqual({ x: object.x, y: object.y, pivotX: object.pivotX, pivotY: object.pivotY, rotation: object.rotation, flipX: object.flipX, opacity: object.opacity }, { x: resident.x, y: resident.y, pivotX: .5, pivotY: 1, rotation: 0, flipX: false, opacity: 1 });
    assert.equal(object.mask, undefined); assert.equal(object.sourceParallax, undefined);
    assert.deepEqual(world(object, .5, 1), { x: resident.x, y: resident.y });
    assert.equal(K.canWalk(candidate, resident.x, resident.y, 12), true);
  }
  // Haran moved to the safe left edge of the same route. The whole visible-body
  // rectangle is separated from south-root's full polygon by the x-axis alone.
  const haran = nextObjects.get('obj-resident-haran'), root = nextObjects.get('obj-south-root');
  assert.equal(haran.x, 4660); assert.equal(haran.y, 6660);
  const body = { x0: haran.x - haran.width / 2, x1: haran.x + haran.width / 2, y0: haran.y - haran.height, y1: haran.y };
  const polygon = root.mask.map(([u, v]) => world(root, u, v));
  const left = Math.min(...polygon.map(point => point.x));
  assert.equal(left, 4720); near(left - body.x1, 35.778546712802765);
  assert.ok(body.x1 < left); assert.equal(K.hit(root, haran.x, haran.y), false);
  const approach = { x: 4660, y: 6700 };
  assert.equal(K.canWalk(candidate, approach.x, approach.y, 12), true);
  assert.equal(K.hit(root, approach.x, approach.y), false);
  assert.equal(Math.hypot(approach.x - haran.x, approach.y - haran.y), 40);
  assert.equal(left - (approach.x + 40), 20, 'Approach actor body x+40 must clear the whole mask');
  for (let y = haran.y; y <= approach.y; y += 4) assert.equal(K.canWalk(candidate, haran.x, y, 12), true);
  // The formerly proposed western point avoided the drawing but left the nav.
  assert.equal(K.canWalk(candidate, 4700, 6460, 12), false);
  assert.equal(K.canWalk(candidate, 4660, 6500, 12), false);
  for (const [key, x, y] of [['berin', 6020, 5580], ['nessa', 6300, 5020], ['dorik', 5220, 2500]]) {
    const object = nextObjects.get('obj-resident-' + key); assert.equal(object.x, x); assert.equal(object.y, y);
  }
});

check('Nav1192, radius12 BFS1185 and start/exit/cameras/navigation review remain original', () => {
  for (const key of ['world', 'walkable', 'start', 'exit', 'cameras', 'navigationReview']) assert.deepEqual(candidate[key], original[key]);
  assert.equal(candidate.walkable.filter(Boolean).length, 1192);
  assert.equal(sha(Buffer.from(candidate.walkable)), C.navSha256);
  assert.deepEqual(K.route(candidate), K.route(original));
  assert.equal(K.route(candidate).pass, true); assert.equal(K.route(candidate).visited, 1185);
});

check('All four anchors are radius12-reachable from the original start', () => {
  const { cols, rows, tileSize } = candidate.world;
  const start = Math.floor(candidate.start.y / tileSize) * cols + Math.floor(candidate.start.x / tileSize);
  const seen = new Set([start]), queue = [start];
  for (let index = 0; index < queue.length; index++) {
    const id = queue[index], x = id % cols, y = Math.floor(id / cols);
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const xx = x + dx, yy = y + dy, next = yy * cols + xx;
      if (xx < 0 || yy < 0 || xx >= cols || yy >= rows || seen.has(next) || !K.canWalk(candidate, (xx + .5) * tileSize, (yy + .5) * tileSize, 12)) continue;
      seen.add(next); queue.push(next);
    }
  }
  for (const resident of C.residents) assert.ok(seen.has(Math.floor(resident.y / tileSize) * cols + Math.floor(resident.x / tileSize)), 'Unreachable resident: ' + resident.key);
});

check('New provenance is explicit, not adopted, and old lineage pins are intact', () => {
  assert.equal(candidate.name, '지옥의 틈 · 독립 주민 레이어 후보');
  assert.equal(candidate.productionStatus, 'ISOLATED_EDITOR_RESULT_NOT_ADOPTED');
  for (const [key, value] of Object.entries(original.sourcePins)) assert.equal(candidate.sourcePins[key], value);
  assert.equal(candidate.sourcePins.cleanPlate, C.cleanPlate.sha256); assert.equal(candidate.sourcePins.residentAtlas, C.atlas.sha256);
  assert.deepEqual(candidate.residentLayerReview, { kind: 'independent-resident-preview-v1', cleanPlate: C.cleanPlate, atlas: C.atlas, originalPaintingSha256: C.painting.sha256, bodyScale: 'standing80-seated-source-proportion', notAdopted: true });
  assert.match(candidate.notes, /원본 픽셀의 정확 추출이 아니다/);
});

check('Pure deterministic build accepts frozen input and creates no shared references', () => {
  assert.equal(sha(JSON.stringify(original)), C.originalSceneSha256);
  assert.deepEqual(B.build(original), candidate);
  const copy = B.build(original); copy.world.cols = 201; copy.assets[0].crop.x = 123; copy.layers[0].objects[0].x = 900; copy.sourcePins.painting = 'changed';
  assert.equal(sha(JSON.stringify(original)), C.originalSceneSha256);
  assert.equal(candidate.world.cols, 200); assert.equal(candidate.layers[0].objects[0].x, original.layers[0].objects[0].x);
  assert.ok(Object.isFrozen(C.residents[0].crop));
});

check('Exported build performs no filesystem reads or writes', () => {
  const operations = ['readFileSync', 'writeFileSync', 'openSync', 'mkdirSync', 'unlinkSync'];
  const saved = new Map(operations.map(key => [key, fs[key]]));
  try {
    for (const key of operations) fs[key] = () => { throw new Error('Unexpected build I/O: ' + key); };
    assert.deepEqual(B.build(original), candidate);
  } finally { for (const [key, fn] of saved) fs[key] = fn; }
});

check('v1 JSON round trip preserves fractional crops, residents, masks and provenance', () => {
  assert.deepEqual(K.validate(JSON.parse(JSON.stringify(candidate))), candidate);
  assert.equal(candidate.version, 1); assert.equal(candidate.schemaVersion, undefined);
  assert.ok(candidate.assets.some(a => !Number.isInteger(a.crop.x) || !Number.isInteger(a.crop.w)));
});

check('Bad original pin/altered nav/edited geometry and rebuilding the candidate are rejected', () => {
  for (const mutate of [p => { p.sourcePins.painting = '0'.repeat(64); }, p => { p.sourcePins.nav = '0'.repeat(64); }, p => { p.walkable[0] = 1 - p.walkable[0]; }, p => { p.layers[0].objects[0].x += 1; }]) {
    const bad = K.clone(original); mutate(bad); const beforeBad = JSON.stringify(bad);
    assert.throws(() => B.build(bad), /pin mismatch/); assert.equal(JSON.stringify(bad), beforeBad);
  }
  assert.throws(() => B.build(candidate), /pin mismatch/);
  const badImage = Buffer.from(fs.readFileSync(file(C.atlas.src))); badImage[badImage.length - 1] ^= 1;
  assert.throws(() => B.verifyPngBytes(badImage, C.atlas), /pin mismatch/);
  assert.throws(() => B.verifyPngBytes(fs.readFileSync(file(C.atlas.src)), { ...C.atlas, width: 1920 }), /dimensions mismatch/);
});

check('CLI requires explicit output and refuses overwrite/path escape without creating files', () => {
  const builder = file('tools/build-hell-rift-resident-scene.cjs');
  for (const args of [[], ['--output'], ['--output', C.originalScene], ['--output', file(C.originalScene)], ['--output', '../escape.scene.json'], ['--output', 'tools/forbidden.scene.json']]) {
    const result = spawnSync(process.execPath, [builder, ...args], { cwd: REPO, encoding: 'utf8' });
    assert.equal(result.status, 1); assert.ok(result.stderr.length); assert.equal(result.stdout, '');
  }
});

check('CLI uses exclusive creation and rejects a destination appearing after preflight', () => {
  const write = fs.writeFileSync; let attempted = false;
  try {
    fs.writeFileSync = (destination, bytes, options) => {
      attempted = true; assert.equal(options.flag, 'wx');
      assert.equal(path.extname(destination), '.json'); assert.equal(JSON.parse(bytes).residentLayerReview.notAdopted, true);
      const error = new Error('Simulated destination already exists after preflight'); error.code = 'EEXIST'; throw error;
    };
    assert.throws(() => B.runCLI(['--output', 'assets/map/hell_rift/resident_layers_20261006/overwrite-race-control.scene.json']), error => error.code === 'EEXIST');
    assert.equal(attempted, true);
  } finally { fs.writeFileSync = write; }
});

async function integrationChecks() {
  const [R, A, D] = await Promise.all([
    import(pathToFileURL(file('tools/map-scene-rift-residents.mjs')).href),
    import(pathToFileURL(file('tools/map-scene-rift-ambience.mjs')).href),
    import(pathToFileURL(file('tools/map-scene-rift-dialogue.mjs')).href)
  ]);
  const rawPath = file('tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json');
  const rawBytes = fs.readFileSync(rawPath), raw = JSON.parse(rawBytes.toString('utf8'));
  const rawPin = 'be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc';
  const walk = (p, x, y, radius) => K.canWalk(p, x, y, radius);
  const ids = ['rift-rest-haran', 'rift-gift-berin', 'rift-request-nessa', 'rift-prepare-dorik'];
  const candidateBytes = JSON.stringify(candidate);

  check('New candidate activates actual resident, ambience and dialogue adapters', () => {
    assert.deepEqual(R.residentPaintingProfile(candidate), { src: C.cleanPlate.src, size: 1254, worldPerSourcePixel: 8000 / 1254 });
    assert.equal(A.supportsRiftAmbience(candidate), true);
    assert.equal(D.supportsRiftDialogueScene(candidate), true);
    assert.ok(A.createRiftAmbience(candidate, walk));
    assert.equal(sha(rawBytes), rawPin);
    const anchors = R.residentDialogueAnchors(candidate), controller = D.createRiftDialogue(candidate, raw, walk, anchors);
    assert.ok(controller); assert.equal(controller.snapshot().scope, 'editor-session-only');
    for (let i = 0; i < 4; i++) {
      const resident = C.residents[i], body = objects(candidate).get('obj-resident-' + resident.key), anchor = anchors[i];
      assert.equal(anchor.npcId, ids[i]);
      assert.equal(anchor.x, resident.x); assert.equal(anchor.y, resident.y);
      assert.equal(anchor.visualX, body.x); assert.equal(anchor.visualY, body.y); assert.equal(anchor.labelHeight, body.height);
      if (resident.key === 'haran') assert.deepEqual(anchor.approach, { x: 4660, y: 6700 });
      assert.equal(controller.nearest(anchor.approach).npcId, ids[i]);
      const opened = controller.open(ids[i], anchor.approach);
      assert.equal(opened.isOpen, true); assert.equal(opened.view.npcId, ids[i]);
      controller.close('resident-source-check');
    }
    assert.equal(controller.snapshot().closeReason, 'resident-source-check');
    assert.deepEqual(controller.snapshot().trialRecords, []);
  });

  check('Unknown pin/crop/body identity/pivot or hidden crop/foot layers disable consumers', () => {
    const changes = [
      p => { p.sourcePins.cleanPlate = '0'.repeat(64); },
      p => { p.sourcePins.residentAtlas = '0'.repeat(64); },
      p => { p.residentLayerReview.atlas.sha256 = '0'.repeat(64); },
      p => { p.residentLayerReview.notAdopted = false; },
      p => { p.assets.find(a => a.id === 'west-0').crop.w += 1; },
      p => { p.assets.find(a => a.id === 'resident-berin').crop.x += 1; },
      p => { p.layers.find(l => l.id === 'foot').objects.find(o => o.id === 'obj-resident-haran').id = 'unknown-body'; },
      p => { p.layers.find(l => l.id === 'foot').objects.find(o => o.id === 'obj-resident-haran').pivotY = .5; },
      p => { p.layers.find(l => l.id === 'foot').objects.find(o => o.id === 'obj-resident-haran').height *= 2; },
      p => { p.layers.find(l => l.id === 'foot').objects.find(o => o.id === 'obj-resident-haran').opacity = 0; },
      p => { p.layers.find(l => l.id === 'west').visible = false; },
      p => { p.layers.find(l => l.id === 'foot').visible = false; }
    ];
    const goodAnchors = R.residentDialogueAnchors(candidate);
    for (const mutate of changes) {
      const bad = K.clone(candidate); mutate(bad);
      assert.equal(R.residentPaintingProfile(bad), null);
      assert.equal(R.residentDialogueAnchors(bad), null);
      assert.equal(A.supportsRiftAmbience(bad), false);
      assert.equal(A.createRiftAmbience(bad, walk), null);
      assert.equal(D.supportsRiftDialogueScene(bad), false);
      assert.equal(D.createRiftDialogue(bad, raw, walk, goodAnchors), null);
    }
  });

  check('Original baked scene still activates ambience/dialogue without resident profile', () => {
    assert.equal(R.residentPaintingProfile(original), null); assert.equal(R.residentDialogueAnchors(original), null);
    assert.equal(A.supportsRiftAmbience(original), true); assert.equal(D.supportsRiftDialogueScene(original), true);
    const oldPositions = [[4780, 6460], [6020, 5580], [6300, 5020], [5220, 2500]];
    const anchors = oldPositions.map(([x, y], i) => ({ npcId: ids[i], x, y }));
    assert.ok(D.createRiftDialogue(original, raw, walk, anchors));
  });

  check('Adapter/dialogue integration leaves scene, raw STORY and all source files unchanged', () => {
    assert.equal(JSON.stringify(candidate), candidateBytes);
    assert.equal(sha(fs.readFileSync(rawPath)), rawPin);
    for (const [name, pin] of Object.entries(before)) assert.equal(sha(fs.readFileSync(file(name))), pin, 'Source changed: ' + name);
  });
  console.log(JSON.stringify({ pass: true, checks: passed, originalSceneSha256: before[C.originalScene], cleanPlateSha256: C.cleanPlate.sha256, residentAtlasSha256: C.atlas.sha256, walkable: 1192, routeVisited: 1185, sceneWritten: false, visualVerdict: 'NOT_ASSESSED' }, null, 2));
}
integrationChecks().catch(error => { console.error(error.stack); process.exitCode = 1; });
