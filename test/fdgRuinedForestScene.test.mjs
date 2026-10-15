import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import * as forest from '../engine/fdg/ruined-forest-scene.js';
import { createWorldProjection } from '../engine/fdg/world-camera.js';
import { installNativePerspectiveQa } from '../engine/fdg/native-perspective-qa.js';

const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const storageSource = await readFile(new URL('../engine/fdg/druid-qa-storage.js', import.meta.url), 'utf8');
const idle = JSON.parse(await readFile(new URL('../img/atlas_ch1_8dir.json', import.meta.url), 'utf8'));
const walk = JSON.parse(await readFile(new URL('../img/atlas_ch1_8dir_walk.json', import.meta.url), 'utf8'));
const scene = forest.RUINED_FOREST_SCENE;
const ownQuery = '?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgPerspective=first&fdgScene=ruined-forest-first';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const plain = value => JSON.parse(JSON.stringify(value));

// Parse changed consumers without evaluating the game's bootstrap or any live save API.
function bodyEnd(start) {
  const brace = game.indexOf('{', start);
  let depth = 0, quote = '', comment = '';
  for (let i = brace; i < game.length; i++) {
    const c = game[i], n = game[i + 1];
    if (comment === 'line') { if (c === '\n') comment = ''; continue; }
    if (comment === 'block') { if (c === '*' && n === '/') { comment = ''; i++; } continue; }
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
    if (c === '/' && n === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && n === '*') { comment = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return i + 1;
  }
  assert.fail('Unterminated native consumer');
}
function source(name) {
  let start = game.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Missing consumer ${name}`);
  if (game.slice(start - 6, start) === 'async ') start -= 6;
  const result = game.slice(start, bodyEnd(start));
  new vm.Script(`(${result})`);
  return result;
}
function evalFunctions(context, names) {
  vm.runInNewContext(names.map(source).join('\n'), context);
  return context;
}
function isolatedStorage(search = ownQuery, origin = 'http://127.0.0.1:3333') {
  const calls = { reads: [], writes: [], network: [] };
  const window = { location: { href: origin + '/game.html' + search },
    localStorage: { getItem(key) { calls.reads.push(key); assert.equal(key, 'fdg.qa.dark-druid.encounter.r4'); return null; },
      setItem(...args) { calls.writes.push(args); assert.fail('Scene must not persist settings or actor state'); } } };
  const context = { window, URL, URLSearchParams, location: { search },
    fetch(...args) { calls.network.push(args); assert.fail('Scene must not call a save/network API'); } };
  vm.runInNewContext(storageSource, context);
  return { context, window, calls, storage: window._FDGDruidQaStorage };
}
function gate(context) {
  const start = game.indexOf('const _fdgProjectiveTextureGate='), end = game.indexOf('\n', game.indexOf('if(_FDG_RUINED_FOREST_FIRST){window._btGod=', start));
  assert.ok(start >= 0 && end > start);
  return vm.runInNewContext(game.slice(start, end) + '\n_FDG_RUINED_FOREST_FIRST;', context);
}
function fakeDocument() {
  const nodes = new Map();
  function element(tag) {
    return { tag, style: { removeProperty(key) { delete this[key]; } }, children: [], listeners: {},
      classList: { add() {}, remove() {} }, append(...children) { this.children.push(...children); },
      addEventListener(type, fn) { this.listeners[type] = fn; }, emit(type) { return this.listeners[type](); },
      remove() { this.removed = true; }, set id(value) { this._id = value; nodes.set(value, this); }, get id() { return this._id; },
      set textContent(value) { assert.equal(this.children.length, 0, 'Only leaf nodes may replace text'); this.text = value; } };
  }
  const doc = { createElement: element, body: element('body') };
  return { doc, nodes, element };
}
function withTimers(callback) {
  const original = { setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval };
  const timers = [];
  globalThis.setInterval = (fn, ms) => { timers.push({ fn, ms, cleared: false }); return timers.length; };
  globalThis.clearInterval = id => { timers[id - 1].cleared = true; };
  return Promise.resolve().then(() => callback(timers)).finally(() => Object.assign(globalThis, original));
}
function stageFixture() {
  const { context, window, calls, storage } = isolatedStorage();
  const events = [], spawned = [];
  const fail = label => () => assert.fail(`Independent scene reached ${label}`);
  const atlas = { meta: idle, walkMeta: walk,
    dirs: Object.fromEntries(idle.directions.map(dir => [dir, { ready: true }])),
    walkDirs: Object.fromEntries(idle.directions.map(dir => [dir, { ready: true }])) };
  Object.assign(context, { _FDG_RUINED_FOREST_FIRST: true, _bossTestReq: 0, TOTAL_STAGES: 35, T: 40,
    G: { stage: 0, cam: { x: 0, y: 0 }, on: false, paused: false }, ens: [], projs: [], pProjs: [], worldItems: [], MAP_OBJS: [],
    _MAP_COMPOSE: [{ path: { paint: true }, plate: 'production-stage-plate' }], _skinSeqIdx: 0,
    _fdgRuinedForestModule: forest, _fdgRuinedForestUi: null, _fdgRuinedForestCompleted: false,
    _ch8Atlas: { 1: atlas }, EL: { P: 'native-physical' }, _eSpCache: new Map(), _impacts: [], _vfxAnims: [], _fireExps: [], _eyeObjs: [],
    _eyeInited: false, _shDirty: false, _mmDirty: 0, _colObjsSrc: {}, _colObjsN: 1, _bgInitQueue: [], _bgInitDone: false, _bgInitIdx: 0,
    _cacheExitCenter() { events.push('exit-cache'); }, _load8DirAtlas(n) { assert.equal(n, 1); events.push('atlas'); },
    buildMapCache() { events.push('map-cache'); }, initTorchLights() { events.push('torches'); }, updateHUD(force) { assert.equal(force, true); events.push('hud'); },
    _getFixedMapForStage: fail('production fixed-map/LOCK lookup'), genGauntlet: fail('fallback map generator'),
    _enterBossArena: fail('boss arena generator'), _recycleProj: fail('unexpected projectile pool'), _recyclePProj: fail('unexpected player projectile pool'),
    mkEn(...args) {
      const [x, y, stage, etype, boss, el, room] = args;
      assert.equal(context.G.map[Math.floor(y / 40)][Math.floor(x / 40)], 0, 'Native spawn needs actual floor');
      assert.equal(stage, 0); assert.equal(boss, false); assert.equal(el, 'native-physical'); assert.equal(room, -1);
      const baseline = { hp: 71 + etype, mhp: 71 + etype, atk: 9, speed: 2.2, ai: 'native-ai', _atkWindup: 13, _shotCharge: 7 };
      const e = { x, y, etype, alive: true, s: 'idle', ...baseline };
      const guarded = new Proxy(e, { set(target, key, value) {
        assert.ok(!Object.hasOwn(baseline, key), `Scene attempted to override native combat field ${String(key)}`);
        return Reflect.set(target, key, value);
      } });
      spawned.push({ args, e: guarded, baseline }); return guarded;
    }
  });
  evalFunctions(context, ['mkP', 'genFromTemplate', '_initRuinedForestNativeScene', '_fdgRuinedForestSnapshot', 'initStage']);
  context.P = context.mkP();
  return { context, window, calls, storage, events, spawned };
}

test('authored RLE is complete, wall bounded, and has one floor component joining all regions and four spawns', () => {
  const template = forest.createRuinedForestTemplate(), copy = forest.createRuinedForestTemplate();
  assert.deepEqual(template, copy, 'Map geometry and prop layout must be deterministic');
  assert.equal(template._fdgIndependentScene, 'ruined-forest-first'); assert.equal(template._testbed, true);
  assert.equal(template.mw, 72); assert.equal(template.mh, 84);
  const cells = [];
  for (let i = 0; i < template.tileRLE.length; i += 2) {
    const value = template.tileRLE[i], count = template.tileRLE[i + 1];
    assert.ok([1, 2].includes(value)); assert.ok(Number.isInteger(count) && count > 0);
    cells.push(...Array(count).fill(value));
  }
  assert.equal(cells.length, template.mw * template.mh, 'Every authored tile must have exactly one RLE value');
  const tile = (x, y) => cells[y * template.mw + x];
  for (let x = 0; x < template.mw; x++) { assert.equal(tile(x, 0), 2); assert.equal(tile(x, template.mh - 1), 2); }
  for (let y = 0; y < template.mh; y++) { assert.equal(tile(0, y), 2); assert.equal(tile(template.mw - 1, y), 2); }
  assert.ok(scene.start.y > scene.height / 2 && scene.exit.y < scene.height / 2, 'Start 6 o’clock and exit 12 o’clock');
  const initial = scene.start.y * template.mw + scene.start.x, queue = [initial], seen = new Set(queue);
  for (let at = 0; at < queue.length; at++) {
    const index = queue[at], x = index % template.mw, y = Math.floor(index / template.mw);
    assert.equal(tile(x, y), 1);
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      const next = ny * template.mw + nx;
      if (nx >= 0 && ny >= 0 && nx < template.mw && ny < template.mh && tile(nx, ny) === 1 && !seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  assert.equal(seen.size, cells.filter(value => value === 1).length, 'No disconnected floor islands');
  for (const p of [scene.exit, ...scene.regions.map(r => ({ x: r.cx, y: r.cy })), ...scene.enemies]) assert.ok(seen.has(p.y * template.mw + p.x));
  assert.equal(template.objs.length, 38); assert.ok(template.objs.every(o => o.noCol === 1));
  const small = template.objs.filter(o => o.id === 'm_c1sbone');
  for (const [i, a] of small.entries()) for (const b of small.slice(i + 1)) assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= 5);
  assert.deepEqual(template.corridors, []); assert.deepEqual(template.spawnHoles, []);
});

test('four selected native models have matching idle and four-cell walk metadata in all eight directions', () => {
  assert.deepEqual(idle.directions, ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']);
  assert.equal(idle.cell, 256); assert.equal(walk.cell, 256); assert.equal(idle.cols, 8); assert.equal(idle.rows, 5);
  assert.equal(walk.frames, 4); assert.equal(walk.framesPerMob, 4); assert.deepEqual(walk.sampleIndices, [0, 1, 3, 5]);
  assert.deepEqual(scene.enemies.map(e => e.etype), [0, 0, 1, 1]);
  assert.deepEqual(scene.enemies.map(e => e.skin), ['rot_knight', 'skull_brute', 'bone_archer', 'etype1_archer']);
  for (const e of scene.enemies) {
    assert.deepEqual(idle.mobs[e.skin], walk.mobs[e.skin]);
    const m = idle.mobs[e.skin]; assert.equal(m.idx, m.row * idle.cols + m.col);
    assert.ok(m.idx >= 0 && m.idx < idle.total && m.col < idle.cols && m.row < idle.rows);
  }
  // Alpha/cell-edge artwork QA is separately owned; this verifies only the consumed atlas metadata.
});

test('independent scene requires exact isolated query and resets boss-test God, pause, and speed switches', () => {
  for (const [search, origin, expected] of [[ownQuery, undefined, true],
    [ownQuery.replace('fdgScene=ruined-forest-first', 'fdgScene=other'), undefined, false],
    [ownQuery.replace('fdgPerspective=first', 'fdgPerspective=second'), undefined, false],
    [ownQuery.replace('fdgDruidQa=r4', 'fdgDruidQa=r3'), undefined, false],
    [ownQuery + '&stage=0', undefined, false], [ownQuery, 'https://example.com', false]]) {
    const { context, window, calls } = isolatedStorage(search, origin);
    Object.assign(window, { _btGod: true, _btActive: true, _btBoss: {}, _btPaused: true, _btSpeedMul: .25 });
    assert.equal(gate(context), expected);
    assert.equal(window._btGod, !expected); assert.equal(window._btActive, !expected);
    assert.equal(window._btPaused, !expected); assert.equal(window._btSpeedMul, expected ? 1 : .25);
    assert.equal(calls.writes.length, 0); assert.equal(calls.network.length, 0);
  }
  const btStart = game.indexOf('const _btParam=new URLSearchParams(location.search).get(\'bosstest\');');
  const btEnd = game.indexOf('const _btSi=', btStart);
  assert.ok(btStart > 0 && btEnd > btStart);
  assert.equal(vm.runInNewContext(`(function(){${game.slice(btStart, btEnd)}return 'legacy-boss-test';})()`, {
    location: { search: ownQuery }, URLSearchParams, _FDG_RUINED_FOREST_FIRST: true
  }), undefined, 'Legacy bosstest setup must stop before granting boss-test overrides');
});

test('native initStage consumes the independent template and native mkEn without stage LOCK, boss generation, or combat-stat overrides', () => {
  const { context, events, spawned, calls, storage } = stageFixture();
  context.P.hp = 123; // A damaged fixture detects any unintended initialization heal.
  const playerBefore = plain(context.P);
  context.initStage(0);
  assert.equal(context.G.mapType, 'fdg_ruined_forest'); assert.equal(context.G.mw, 72); assert.equal(context.G.mh, 84);
  assert.equal(context.G.bossAlive, false); assert.equal(context.G.bossGateOpen, true); assert.equal(context.G._bossArena, false);
  assert.deepEqual(plain(context.G.spawnHoles), []); assert.deepEqual(plain(context.G.exits), []);
  assert.equal(context.G._pathImgTerrain, false); assert.equal(context.G._mapPaint, false); assert.equal(context.G._plateSrc, null);
  assert.equal(context.P.x, (scene.start.x + .5) * 40); assert.equal(context.P.y, (scene.start.y + .5) * 40);
  for (const key of ['lv', 'hp', 'mhp', 'baseAtk', 'baseDef', 'speed', 'skills']) assert.deepEqual(plain(context.P[key]), playerBefore[key]);
  assert.equal(context.P.iframes, 0); assert.equal(spawned.length, 4); assert.equal(context.ens.length, 4);
  for (const [i, { e, baseline }] of spawned.entries()) {
    assert.equal(e._mob8Skin, scene.enemies[i].skin); assert.equal(e._mob8Col, idle.mobs[e._mob8Skin].col); assert.equal(e._mob8Row, idle.mobs[e._mob8Skin].row);
    for (const [key, value] of Object.entries(baseline)) assert.equal(e[key], value);
  }
  assert.equal(context.MAP_OBJS.length, 38); assert.equal(context.MAP_OBJS.filter(o => o._fdgUpright).length, 14);
  assert.deepEqual([0, 2, 4, 5].map(index => context.MAP_OBJS[index].x / 40), [4, 7, 5, 6]);
  assert.equal(context.MAP_OBJS[0].y, 69 * 40);
  const tree = context.MAP_OBJS.find(o => o.type === 'm_c1tree');
  assert.equal(tree.x, 8 * 40); assert.equal(tree.y, 45 * 40); assert.equal(tree.scale, .3);
  assert.deepEqual(events, ['atlas', 'exit-cache', 'map-cache', 'torches', 'hud']);
  assert.equal(calls.writes.length, 0); assert.equal(calls.network.length, 0); assert.equal(storage.receipt().successfulWrites, 0);
});

test('default fixed-map branch remains reachable and independent scene excludes production hills, paints, and field-special ticks', () => {
  const init = source('initStage'), branchEnd = init.indexOf('  const st=G.rooms.find');
  assert.ok(branchEnd > 0);
  const prefix = init.slice(0, branchEnd) + '\nreturn G.mapType;}';
  const run = fixed => {
    const { context } = stageFixture(); context._FDG_RUINED_FOREST_FIRST = false; context._bossTestReq = -1;
    const calls = []; context._getFixedMapForStage = si => { calls.push(['fixed', si]); return fixed; };
    context.genFromTemplate = (map, si) => calls.push(['template', map, si]); context.genGauntlet = si => calls.push(['fallback', si]);
    vm.runInNewContext(prefix, context); const result = context.initStage(0);
    assert.equal(result, fixed ? 'fixed' : 'gauntlet'); assert.deepEqual(calls[0], ['fixed', 0]);
    assert.equal(calls[1][0], fixed ? 'template' : 'fallback');
  };
  run({ rooms: [] }); run(null);
  const guards = ['_isVistaMap', '_isPlateMap', '_isMapPaint', '_ch1StartOuterEnabled', '_ch1HillBandBlocks', '_ch1HillHeightAt', '_drawCh1Hill', '_fbTick', '_wmTick', '_fdTick'];
  const own = evalFunctions({ _FDG_RUINED_FOREST_FIRST: true }, guards);
  for (const name of guards) assert.equal(own[name](147 * 40, 98 * 40), name === '_ch1HillHeightAt' ? 0 : name.startsWith('_draw') || name.endsWith('Tick') ? undefined : false);
  const legacy = evalFunctions({ _FDG_RUINED_FOREST_FIRST: false, G: { stage: 0, _plateSrc: 'production' },
    _MAP_COMPOSE: [{ plate: 'production', vista: true, path: { paint: true } }], location: {},
    _CH1_START_OUTER: { stage: 0 }, _CH1_START_OUTER_QUERY_ENABLED: true, T: 40,
    _CH1_HILL: { cx: 147, cy: 98, rx: 18, ry: 9, inner: .84, outer: 1.04, rampX0: 125, rampX1: 135, rampY: 98, rampHalf0: 1.8, rampHalf1: 3 } },
  ['_isVistaMap', '_isPlateMap', '_isMapPaint', '_ch1StartOuterEnabled', '_ch1HillRampAt', '_ch1HillHeightAt']);
  for (const name of ['_isVistaMap', '_isPlateMap', '_isMapPaint', '_ch1StartOuterEnabled']) assert.equal(legacy[name](), true);
  assert.equal(legacy._ch1HillHeightAt(147 * 40, 98 * 40), 1);
  const templateSource = source('genFromTemplate'), independentEnd = templateSource.indexOf('  // ── 5. 보스방 처리');
  const probe = templateSource.slice(0, independentEnd) + '\nreturn "legacy-continuation";}';
  const { context } = stageFixture(); vm.runInNewContext(probe, context);
  assert.equal(context.genFromTemplate({ ...forest.createRuinedForestTemplate(), _fdgIndependentScene: 'other' }, 0), 'legacy-continuation');
  context._FDG_RUINED_FOREST_FIRST = false;
  assert.equal(context.genFromTemplate(forest.createRuinedForestTemplate(), 0), 'legacy-continuation');
});

test('native scene boot prepares Lv1 NORMAL in memory, starts only through its public button, and skips save APIs', async () => {
  await withTimers(async timers => {
    const { context, window, storage, calls } = stageFixture(), { doc, nodes, element } = fakeDocument();
    const uiForest = { ...forest, installRuinedForestSceneUi: options => forest.installRuinedForestSceneUi({ ...options, document: doc }) };
    const nativeBootCalls = [];
    Object.assign(context, { OPT: { diff: 0 }, DIFF_MUL: [.45, .55, .65, .76, .88, 1, 1.12, 1.25, 1.4, 1.58, 1.78],
      _import: async path => { assert.match(path, /ruined-forest-scene\.js\?v=/); return uiForest; }, performance: { now: () => 0 },
      _fdgRuinedForestSnapshot: () => ({ completed: false, dead: false, running: !window._btFramePause, alive: 4, hp: context.P.hp, fps: 60 }),
      $: id => { if (!nodes.has(id)) { const e = element('div'); e.id = id; } return nodes.get(id); }, INV: { equipped: {} },
      defaultItems: () => [{ slot: 'weapon', id: 'native-starter' }], recalcSt: () => nativeBootCalls.push('recalc'), applyStats: () => nativeBootCalls.push('stats'),
      _drReset() {}, _deathDlgStop() {}, showBootLoading() {}, setBootLoading() {}, hideBootLoading() {}, updateQS() {}, updateSkSlot() {},
      initStage(si) { assert.equal(si, 0); assert.equal(context.P.lv, 1); nativeBootCalls.push('stage'); },
      fetch: context.fetch, setTimeout() { assert.fail('Loaded existing atlas should not need a wait or delayed save'); }
    });
    // Execute the native boot and loader, redirecting only import/DOM dependencies.
    vm.runInNewContext(source('_loadRuinedForestNativeScene').replace(/\bimport\(/g, '_import(') + '\n' + source('_startDruidQaChar'), context);
    await context._startDruidQaChar();
    assert.equal(context.OPT.diff, 5); assert.equal(context.DIFF_MUL[context.OPT.diff], 1); assert.equal(context.P.lv, 1);
    assert.equal(window._btFramePause, true); assert.equal(context.G.on, true); assert.equal(context.G.paused, false);
    assert.equal(context._charName, '폐허 숲길'); assert.deepEqual(nativeBootCalls, ['recalc', 'stats', 'stage']);
    const panel = nodes.get('fdgRuinedForestPanel'), play = panel.children.find(n => n.text === '플레이 시작'), retry = panel.children.find(n => n.text === '처음부터 다시');
    assert.ok(play && retry); assert.equal(timers.length, 1); assert.equal(timers[0].ms, 200);
    timers[0].fn(); assert.match(nodes.get('fdgRuinedForestStatus').text, /시작 준비/);
    play.emit('click'); assert.equal(window._btFramePause, false); assert.equal(play.hidden, true);
    timers[0].fn(); assert.match(nodes.get('fdgRuinedForestStatus').text, /교전 진행/);
    await retry.emit('click'); assert.equal(window._btFramePause, true); assert.equal(retry.disabled, false); assert.equal(play.hidden, false);
    assert.equal(timers[0].cleared, true); context._fdgRuinedForestUi.uninstall(); assert.equal(timers[1].cleared, true);
    evalFunctions(context, ['dbSave', 'startAutoSave']); await context.dbSave(); context.startAutoSave();
    assert.deepEqual(calls.reads, ['fdg.qa.dark-druid.encounter.r4']); assert.equal(calls.writes.length, 0); assert.equal(calls.network.length, 0);
    const receipt = storage.receipt(); assert.equal(receipt.successfulWrites, 0); assert.deepEqual(plain(receipt.writes), []);
    assert.equal(receipt.memoryOperations.setItem, 0); assert.ok(receipt.notes.some(n => n.event === 'character-save-skip'));
    assert.ok(receipt.notes.some(n => n.event === 'autosave-timer-skip'));
  });
});

test('actual exit completion needs living player, no living or reviving enemy, and native distance below 65', () => {
  const { context, storage } = stageFixture(); evalFunctions(context, ['checkRooms']);
  context.P.x = (scene.exit.x + .5) * 40; context.P.y = (scene.exit.y + .5) * 40;
  const enemies = Array.from({ length: 4 }, () => ({ alive: false, _reviveTimer: 0 })); context.ens = enemies;
  const check = expected => { context.checkRooms(); assert.equal(context._fdgRuinedForestCompleted, expected); };
  enemies[0].alive = true; check(false); enemies[0].alive = false; enemies[2]._reviveTimer = 1; check(false); enemies[2]._reviveTimer = 0;
  context.P.hp = 0; check(false); context.P.hp = 1;
  context.P.x += 65; check(false); context.P.x -= .01; check(true); check(true);
  assert.equal(storage.receipt().notes.filter(n => n.event === 'forest-scene-exit-reached').length, 1, 'Completion event is emitted once');
  const second = stageFixture().context; evalFunctions(second, ['checkRooms']); second.ens = enemies; second.checkRooms();
  assert.equal(second._fdgRuinedForestCompleted, false, 'Dead enemies at the start cannot grant exit completion');
});

test('scene camera options reach native consumer while upright props and general enemies keep balanced roles and player flush precedes ground shots', async () => {
  const moduleStart = game.lastIndexOf('<script type="module">'), moduleEnd = game.indexOf('</script>', moduleStart);
  const loader = game.slice(moduleStart + '<script type="module">'.length, moduleEnd).replace(/\bimport\(/g, '_import(');
  const installed = [], imports = [], { context, window, storage } = stageFixture();
  Object.assign(context, { VW: 1280, VH: 720, _ssaa: 2, _fdgNativePerspective: null, console,
    _import: async path => { imports.push(path); return path.includes('ruined-forest') ? forest : { installNativePerspectiveQa(options) { installed.push(options); return { active: false }; } }; } });
  vm.runInNewContext(loader, context); await new Promise(resolve => setImmediate(resolve));
  assert.equal(imports.length, 2); assert.equal(installed.length, 1);
  const options = installed[0]; assert.equal(options.deferBillboards, true); assert.equal(options.sceneName, '폐허 숲길');
  assert.deepEqual(options.initialCamera, scene.camera); context.G.mw = 72; context.G.mh = 84; context.G.cam = { x: 1420, y: 2740 }; context.G._camZoom = 1;
  await withTimers(async timers => {
    const { doc } = fakeDocument(); const qa = installNativePerspectiveQa({ ...options, document: doc });
    const snapshot = qa.snapshot(); for (const [key, value] of Object.entries(scene.camera)) assert.equal(snapshot.settings[key], value);
    const view = options.getView(), p = createWorldProjection(snapshot.effectiveCamera, view.center, view.viewport), target = { x: 1420, y: 2500 };
    const screen = p.project(target.x, target.y), pointer = qa.inversePointer(screen.x, screen.y);
    near(pointer.world.x, target.x); near(pointer.world.y, target.y);
    const raw = { save() {}, restore() {}, setTransform() {}, projectiveTextureProjection: true, drawProjectedTriangle() {} };
    qa.begin(raw, { x: 0, y: 0 }); qa.end(); assert.equal(qa.snapshot().render.deferBillboards, true); qa.uninstall(); assert.equal(timers[0].cleared, true);
  });
  const hooks = [], controller = { active: true, pushBillboard(...args) { hooks.push(['push', ...args]); }, popBillboard() { hooks.push(['pop']); }, flushBillboards() { hooks.push(['flush']); } };
  const propOpen = game.indexOf('if(mo._fdgUpright&&_fdgNativePerspective?.active)_fdgNativePerspective.pushBillboard(mo.x,mo.y);');
  const propClose = game.indexOf('if(mo._fdgUpright&&_fdgNativePerspective?.active)_fdgNativePerspective.popBillboard();', propOpen);
  assert.ok(propOpen > 0 && propClose > propOpen); assert.ok(game.slice(propOpen, propClose).includes('drawImage('));
  for (const upright of [false, true]) {
    vm.runInNewContext(game.slice(propOpen, game.indexOf('\n', propOpen)) + '\n' + game.slice(propClose, game.indexOf('\n', propClose)), { mo: { x: 720, y: 1000, _fdgUpright: upright }, _fdgNativePerspective: controller });
  }
  assert.deepEqual(hooks, [['push', 720, 1000], ['pop']]);
  const generalStart = game.indexOf('일반 적 렌더링 (8dir 단일 경로)'), bodyPush = game.indexOf('_nativePerspective?.pushBillboard(e.x,e.y);', generalStart), bodyPop = game.indexOf('if(!e.ib)_nativePerspective?.popBillboard();', bodyPush);
  assert.ok(generalStart > 0 && bodyPush > generalStart && bodyPop > bodyPush); assert.ok(game.slice(bodyPush, bodyPop).includes('drawImage('));
  vm.runInNewContext(game.slice(bodyPush, game.indexOf('\n', bodyPush)) + '\n' + game.slice(bodyPop, game.indexOf('\n', bodyPop)), { _nativePerspective: controller, e: { x: 800, y: 1300, ib: false } });
  assert.deepEqual(hooks.slice(-2), [['push', 800, 1300], ['pop']]);
  const playerPush = game.indexOf('pushBillboard(P.x,P.y)'), playerFlush = game.indexOf('if(_fdgNativePerspective?.active){_fdgNativePerspective.popBillboard();_fdgNativePerspective.flushBillboards();}', playerPush);
  assert.ok(playerPush > 0 && playerFlush > playerPush);
  vm.runInNewContext(game.slice(playerFlush, game.indexOf('\n', playerFlush)), { _fdgNativePerspective: controller });
  assert.deepEqual(hooks.slice(-2), [['pop'], ['flush']]);
  const independentShot = game.indexOf('const _sceneBillboard=_FDG_RUINED_FOREST_FIRST&&_fdgNativePerspective?.active&&!p.trap&&!p.mine&&!p.iceZone&&!p.blizzard;');
  assert.ok(independentShot > propClose && independentShot < playerPush, 'Only independent flying shots receive world anchors');
  assert.ok(source('_syncDruidFinaleMouse').includes('const target=_fdgNativePerspective.inversePointer(mouse._screenX,mouse._screenY);'), 'Native inverse pointer consumer remains present');
  assert.ok(source('_drawDruidBoss').includes('_fdgNativePerspective.withGround('), 'Existing danger tell remains a ground command');
  assert.equal(storage.receipt().successfulWrites, 0); assert.equal(window._FDGDruidQaStorage.receipt().memoryOperations.setItem, 0);
});
