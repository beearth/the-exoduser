/*
 * rift-contract-checks.mjs — QA candidate (ROOT-CLAUDE8-EXISTING-ROLE-ASSIGNMENT-20261006, QA role)
 *
 * Reproduces the published Hell Rift editor-result contract (scene1192 / nav·radius12) and the
 * CH1-1 boundary / occlusion / save-influence conditions by comparing against the ACTUAL
 * core / actor / editor source — not a reimplementation. The real `map-scene-core.js` and the
 * interspace `layout.js` are loaded in a vm sandbox and exercised; the browser-only
 * `map-scene-actor.js` / `map-scene-editor.js` are checked as source text (they depend on
 * document/location/Image and are never executed here).
 *
 * Evidence boundary (per CH1_1_A_GRADE_PRODUCTION_20261005.md §2):
 *   This is a SOURCE check. It is NOT a real-screen capture, NOT a native app observation,
 *   NOT an audio listen, and it performs NO user save / UI / game execution. A green run is a
 *   candidate contract reproduction only — it is NOT production acceptance of an A-grade map
 *   or of the 6-stage play/boss acceptance.
 *
 * Owned output: this one file. It reads source + data and prints a report; it writes nothing,
 * touches no shared docs / git / app / save / other-team WIP, and installs/authenticates nothing.
 *
 * Run:  node tools/team-followup-20261005/hell-rift/QA/rift-contract-checks.mjs
 * Exit: 0 when every check passes, 1 otherwise.
 *
 * Reference docs (read first):
 *   docs/4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md  (§1 경계, §3/§11 QA 소유)
 *   docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md          (§3 JSON 계약, §4 radius12/5점, §5 nav)
 *   docs/4.1맵디자인+설정/HELL_RIFT_EDITOR_RESULT_20261006.md   (1192/1185 nav 재검수, 34점 centreline)
 */

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
// .../tools/team-followup-20261005/hell-rift/QA -> repo root is four levels up.
const ROOT = resolve(HERE, '..', '..', '..', '..');
const at = (...p) => resolve(ROOT, ...p);
const rel = p => relative(ROOT, p);

const SRC = {
  core: 'tools/map-scene-core.js',
  actor: 'tools/map-scene-actor.js',
  editor: 'tools/map-scene-editor.js',
  layout: 'assets/map/hell_rift/interspace_20261005/layout.js',
  scene: 'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json',
  painting: 'assets/map/hell_rift/interspace_20261005/hell-rift-painterly-v2.png',
  abyss: 'assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png',
};

// ---- tiny assertion harness (grouped, no deps) ------------------------------
const results = [];
let group = '';
const section = name => { group = name; };
function check(name, fn) {
  try {
    const detail = fn();
    results.push({ group, name, ok: true, detail: detail == null ? '' : String(detail) });
  } catch (e) {
    results.push({ group, name, ok: false, detail: e && e.message ? e.message : String(e) });
  }
}
const eq = (actual, expected, label) => {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: expected ${e}, got ${a}`);
  return a;
};
const ok = (cond, label) => { if (!cond) throw new Error(label); return 'ok'; };
const sha256 = buf => createHash('sha256').update(buf).digest('hex');
const readText = key => readFileSync(at(SRC[key]), 'utf8');

// ---- load the REAL core + layout in a sandbox (as the builder does) ---------
function loadCore() {
  const ctx = createContext({ window: {}, module: { exports: {} }, console });
  runInContext(readText('core'), ctx, { filename: SRC.core });
  const api = ctx.MapSceneCore || ctx.module.exports;
  if (!api || typeof api.validate !== 'function') throw new Error('MapSceneCore를 로드하지 못했습니다');
  return api;
}
function loadLayout() {
  const ctx = createContext({ window: {} });
  runInContext(readText('layout'), ctx, { filename: SRC.layout });
  const src = ctx.window.HELL_RIFT_INTERSPACE;
  if (!src || !src.variants || !src.variants.interspace) throw new Error('HELL_RIFT_INTERSPACE layout을 로드하지 못했습니다');
  return src;
}

const K = loadCore();
const layout = loadLayout();
const variant = layout.variants.interspace;
const raw = JSON.parse(readText('scene'));
const scene = K.validate(raw); // throws if the published scene breaks the v1 contract
const layerById = id => scene.layers.find(l => l.id === id);
const sum = arr => arr.reduce((a, b) => a + b, 0);

// =============================================================================
// 1. SCENE / NAV — scene1192, nav SHA, radius12 BFS 1185  (source: core.route)
// =============================================================================
section('SCENE/NAV (scene1192 · nav · radius12)');

check('scene validates against the real core v1 contract', () =>
  eq([scene.format, scene.version], ['exoduser-map-scene', 1], 'format/version'));

check('walkable grid = cols*rows and strictly 0/1', () => {
  eq(scene.walkable.length, scene.world.cols * scene.world.rows, 'walkable length');
  return ok(scene.walkable.every(v => v === 0 || v === 1), 'walkable has non-0/1 cells');
});

check('walkable count = 1192 and equals sourcePins.walkableCount', () => {
  const count = sum(scene.walkable);
  eq(count, 1192, 'walkable count');
  return eq(count, scene.sourcePins.walkableCount, 'sourcePins.walkableCount');
});

check('recomputed nav SHA256 matches sourcePins.nav (a4508aa6…)', () => {
  const nav = sha256(Buffer.from(scene.walkable));
  eq(nav, 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179', 'nav SHA256');
  return eq(nav, scene.sourcePins.nav, 'sourcePins.nav');
});

check('core.canWalk default radius = 12 (5-point: centre + 4 corners)', () => {
  // canWalk(p, x, y, radius = 12): the default is the 3rd declared param.
  eq(K.canWalk.length, 3, 'canWalk arity');
  const src = readText('core');
  ok(/canWalk\(p,\s*x,\s*y,\s*radius\s*=\s*12\)/.test(src), 'core canWalk default radius !== 12');
  ok(/\[0,\s*0\],\s*\[-radius,\s*-radius\],\s*\[radius,\s*-radius\],\s*\[-radius,\s*radius\],\s*\[radius,\s*radius\]/.test(src),
    'core canWalk is not the centre+4-corner 5-point sample');
  return 'radius12 / 5-point';
});

check('core.route (radius12 4-dir BFS) passes with visited = 1185', () => {
  const r = K.route(scene);
  ok(r.pass, `route not connected: ${r.reason}`);
  return eq(r.visited, 1185, 'route visited');
});

check('navigationReview = painted-eastern-ledge, 34-point centreline, halfWidth 2.75', () => {
  eq(scene.navigationReview.basis, 'painted-eastern-ledge', 'basis');
  eq(scene.navigationReview.halfWidthTiles, 2.75, 'halfWidthTiles');
  eq(scene.navigationReview.centreline.length, 34, 'centreline point count');
  eq(scene.navigationReview.centreline[0], [100.5, 193.5], 'centreline start');
  return eq(scene.navigationReview.centreline[33], [100.5, 43.5], 'centreline end');
});

// =============================================================================
// 2. WORLD / START / EXIT — derived from the untouched interspace layout
// =============================================================================
section('WORLD/START/EXIT');

check('world = 200×200 tiles / T40 / 8000×8000 world px', () => {
  eq([scene.world.cols, scene.world.rows, scene.world.tileSize], [200, 200, 40], 'world');
  return `${scene.world.cols * scene.world.tileSize}×${scene.world.rows * scene.world.tileSize} px`;
});

check('start=(4020,7740) exit=(4020,1740) derive from layout tiles (+.5)*40', () => {
  const t = scene.world.tileSize;
  eq(scene.start, { x: (variant.start.x + 0.5) * t, y: (variant.start.y + 0.5) * t }, 'start vs layout');
  eq(scene.exit, { x: (variant.exit.x + 0.5) * t, y: (variant.exit.y + 0.5) * t }, 'exit vs layout');
  eq(scene.start, { x: 4020, y: 7740 }, 'start literal');
  return eq(scene.exit, { x: 4020, y: 1740 }, 'exit literal');
});

check('8 cameras match the layout cameraAnchors count', () => {
  eq(scene.cameras.length, 8, 'camera count');
  return eq(scene.cameras.length, layout.cameraAnchors.length, 'cameras vs layout anchors');
});

// =============================================================================
// 3. COMPOSITION — 10 assets / 10 objects / 6 layers, parallax, abyss
// =============================================================================
section('COMPOSITION (10/10/6)');

check('10 assets · 10 objects · 6 layers', () => {
  eq(scene.assets.length, 10, 'asset count');
  eq(scene.layers.length, 6, 'layer count');
  return eq(sum(scene.layers.map(l => l.objects.length)), 10, 'object count');
});

check('layer order + per-layer object counts', () => {
  eq(scene.layers.map(l => l.id), ['west', 'east', 'centre', 'abyss', 'foot', 'front'], 'layer ids');
  return eq(scene.layers.map(l => l.objects.length), [2, 2, 2, 1, 3, 0], 'objects per layer');
});

check('every layer.parallax = 1 (abyss depth lives on sourceParallax, not layer)', () =>
  ok(scene.layers.every(l => l.parallax === 1), 'a layer parallax !== 1'));

check('front layer reserved empty for later foreground work', () =>
  eq(layerById('front').objects.length, 0, 'front objects'));

// =============================================================================
// 4. OCCLUSION / 가림 — foot sort, foot masks, abyss soft fixed mask
// =============================================================================
section('OCCLUSION (가림)');

check('only the foot layer uses sort=foot (y-merged depth); others flat', () => {
  eq(layerById('foot').sort, 'foot', 'foot sort');
  return ok(scene.layers.filter(l => l.id !== 'foot').every(l => l.sort === 'flat'), 'a non-foot layer is not flat');
});

check('3 foot foreground objects each carry a clipping mask polygon (≥3 pts)', () => {
  const objs = layerById('foot').objects;
  eq(objs.length, 3, 'foot object count');
  return ok(objs.every(o => Array.isArray(o.mask) && o.mask.length >= 3), 'a foot object lacks a mask polygon');
});

check('abyss object: opacity .38, sourceParallax .965, maskFeather 120, fixed mask', () => {
  const o = layerById('abyss').objects[0];
  eq(o.opacity, 0.38, 'abyss opacity');
  eq(o.sourceParallax, 0.965, 'abyss sourceParallax');
  eq(o.maskFeather, 120, 'abyss maskFeather');
  return ok(Array.isArray(o.mask) && o.mask.length >= 3, 'abyss has no fixed mask polygon');
});

check('core enforces mask dependency for maskFeather & sourceParallax', () => {
  const src = readText('core');
  ok(/maskFeather[\s\S]{0,80}?if\s*\(!o\.mask\)\s*throw/.test(src), 'maskFeather does not require mask');
  return ok(/sourceParallax[\s\S]{0,120}?if\s*\(!o\.mask\)\s*throw/.test(src), 'sourceParallax does not require mask');
});

// =============================================================================
// 5. BOUNDARY / 경계 — world-edge enforcement in the real core.canWalk
// =============================================================================
section('BOUNDARY (경계)');

check('core.canWalk rejects coordinates outside the world box', () => {
  ok(K.canWalk(scene, -1, 4000) === false, 'negative x accepted');
  ok(K.canWalk(scene, 4000, -1) === false, 'negative y accepted');
  const edge = scene.world.cols * scene.world.tileSize;
  ok(K.canWalk(scene, edge + 5, 4000) === false, 'x beyond world accepted');
  return ok(K.canWalk(scene, 4000, edge + 5) === false, 'y beyond world accepted');
});

check('start & exit are inside the walkable corridor (route preconditions hold)', () => {
  ok(K.canWalk(scene, scene.start.x, scene.start.y), 'start blocked');
  return ok(K.canWalk(scene, scene.exit.x, scene.exit.y), 'exit blocked');
});

check('world-edge tiles stay non-walkable (corridor never touches the border)', () => {
  const { cols, rows } = scene.world, w = scene.walkable;
  let edgeOnes = 0;
  for (let x = 0; x < cols; x++) { edgeOnes += w[x] + w[(rows - 1) * cols + x]; }
  for (let y = 0; y < rows; y++) { edgeOnes += w[y * cols] + w[y * cols + cols - 1]; }
  return eq(edgeOnes, 0, 'walkable cells on the world border');
});

// =============================================================================
// 6. SAVE INFLUENCE / 세이브 영향 — editor isolation, no game/save-slot bridge
// =============================================================================
section('SAVE-INFLUENCE (세이브 영향)');

check('scene is flagged ISOLATED_EDITOR_RESULT_NOT_ADOPTED (no runtime bridge)', () =>
  eq(scene.productionStatus, 'ISOLATED_EDITOR_RESULT_NOT_ADOPTED', 'productionStatus'));

check('editor source declares no game/save-slot bridge', () => {
  const src = readText('editor');
  return ok(/No game\/save-slot bridge/i.test(src), 'editor header bridge note missing');
});

check('editor persists only exoduser:map-scene:v1 (single recovery key, no game slot write)', () => {
  const src = readText('editor');
  ok(/CACHE_KEY\s*=\s*'exoduser:map-scene:v1'/.test(src), 'recovery key changed');
  const sets = [...src.matchAll(/localStorage\.setItem\(([^,]+),/g)].map(m => m[1].trim());
  ok(sets.length > 0, 'no localStorage.setItem found');
  return ok(sets.every(k => k === 'CACHE_KEY'), `localStorage.setItem targets beyond CACHE_KEY: ${sets.join(', ')}`);
});

check('scene-mode editor blocks the game iframe (gameFrame.src never set)', () => {
  const src = readText('editor');
  return ok(!/gameFrame\.src\s*=/.test(src), 'editor sets gameFrame.src');
});

check('core carries no save/slot/localStorage reference (pure scene math)', () => {
  const src = readText('core');
  return ok(!/localStorage|save-slot|saveSlot|exoduser:save|\bslot\b/i.test(src), 'core touches save/slot state');
});

// =============================================================================
// 7. SOURCE PINS — pinned art/nav match the untouched on-disk source
// =============================================================================
section('SOURCE-PINS');

check('painting pin matches hell-rift-painterly-v2.png on disk', () =>
  eq(sha256(readFileSync(at(SRC.painting))), scene.sourcePins.painting, 'painting SHA256'));

check('abyss pin matches hell-rift-abyss-v3.png on disk', () =>
  eq(sha256(readFileSync(at(SRC.abyss))), scene.sourcePins.abyss, 'abyss SHA256'));

check('originalNav pin = interspace layout.navSha256 = 52bd8396… (base preset 4107 untouched)', () => {
  eq(scene.sourcePins.originalNav, variant.navSha256, 'originalNav vs layout');
  return eq(scene.sourcePins.originalNav, '52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb', 'originalNav literal');
});

check('result nav differs from original nav (edit lives only in the result scene)', () =>
  ok(scene.sourcePins.nav !== scene.sourcePins.originalNav, 'result nav equals original nav'));

// =============================================================================
// 8. ACTOR SOURCE — browser-only warrior; constants checked as text (not run)
// =============================================================================
section('ACTOR-SOURCE (source compare only)');

check('actor returns early in tiles workspace (image-scene only)', () => {
  const src = readText('actor');
  return ok(/workspace'\)\s*===\s*'tiles'\)\s*return/.test(src), 'actor missing tiles-mode early return');
});

check('actor sprite geometry constants: CELL48 / BODY80 / SRCBODY29 / FOOT43', () => {
  const src = readText('actor');
  ok(/CELL\s*=\s*48/.test(src), 'CELL');
  ok(/BODY_HEIGHT\s*=\s*80/.test(src), 'BODY_HEIGHT');
  ok(/SOURCE_BODY_HEIGHT\s*=\s*29/.test(src), 'SOURCE_BODY_HEIGHT');
  ok(/SOURCE_FOOT\s*=\s*43/.test(src), 'SOURCE_FOOT');
  return ok(/SCALE\s*=\s*BODY_HEIGHT\s*\/\s*SOURCE_BODY_HEIGHT/.test(src), 'SCALE = 80/29');
});

check('actor timing/centers fixed: WALK110 / IDLE850 / 8-dir centers', () => {
  const src = readText('actor');
  ok(/WALK_MS\s*=\s*110/.test(src), 'WALK_MS');
  ok(/IDLE_MS\s*=\s*850/.test(src), 'IDLE_MS');
  return ok(/CENTERS\s*=\s*\[22\.5,\s*22\.5,\s*22,\s*25\.5,\s*25,\s*23\.5,\s*23\.5,\s*21\.5\]/.test(src), 'CENTERS vector');
});

// ---- report -----------------------------------------------------------------
const pass = results.filter(r => r.ok).length;
const fail = results.length - pass;
let currentGroup = '';
const line = '─'.repeat(72);
console.log(line);
console.log('Hell Rift QA — rift-contract-checks (CH1-A-QA-20261006, SOURCE check)');
console.log(`root: ${ROOT}`);
console.log(`scene: ${rel(at(SRC.scene))}`);
console.log(line);
for (const r of results) {
  if (r.group !== currentGroup) { currentGroup = r.group; console.log(`\n▸ ${currentGroup}`); }
  const tag = r.ok ? 'PASS' : 'FAIL';
  console.log(`  [${tag}] ${r.name}${r.detail ? `  — ${r.detail}` : ''}`);
}
console.log(`\n${line}`);
console.log(`TOTAL ${results.length}  PASS ${pass}  FAIL ${fail}`);
console.log('Scope: source reproduction only — NOT a screen/native/audio acceptance,');
console.log('and NOT production adoption of an A-grade map or the 6-stage play gate.');
console.log(line);
process.exit(fail ? 1 : 0);
