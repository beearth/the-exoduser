import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import * as forest from '../engine/fdg/ruined-forest-scene.js';
import * as mapPack from '../engine/fdg/native-map-pack.js';
import * as studio from '../tools/fdg-studio/map-pack-studio.js';

const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const storageSource = await readFile(new URL('../engine/fdg/druid-qa-storage.js', import.meta.url), 'utf8');
const atlasMeta = JSON.parse(await readFile(new URL('../img/atlas_ch1_8dir.json', import.meta.url), 'utf8'));
const baseline = { scene: forest.RUINED_FOREST_SCENE, template: forest.createRuinedForestTemplate() };
const ownQuery = '?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgPerspective=first&fdgScene=ruined-forest-first&fdgMapPack=first&fdgEncounter=placement-first';
const plain = value => JSON.parse(JSON.stringify(value));

// Execute selected native consumers, leaving the full game's bootstrap and save APIs out of the VM.
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
  assert.fail('Unterminated native encounter consumer');
}
function source(name) {
  let start = game.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Missing encounter consumer ${name}`);
  if (game.slice(start - 6, start) === 'async ') start -= 6;
  const result = game.slice(start, bodyEnd(start));
  new vm.Script(`(${result})`);
  return result;
}
function evalFunctions(context, names) {
  vm.runInNewContext(names.map(source).join('\n').replace(/\bimport\(/g, '_import('), context);
  return context;
}
function isolated(search = ownQuery, hash = '', origin = 'http://127.0.0.1:3333') {
  const calls = { reads: [], writes: [], network: [], imports: [] };
  const location = { href: origin + '/game.html' + search + hash, search, hash };
  const window = { location,
    localStorage: { getItem(key) { calls.reads.push(key); assert.equal(key, 'fdg.qa.dark-druid.encounter.r4'); return null; },
      setItem(...args) { calls.writes.push(args); assert.fail('Encounter play must not persist state'); } } };
  const context = { window, URL, URLSearchParams, location,
    fetch(...args) { calls.network.push(args); assert.fail('Encounter play must not call a save API'); } };
  vm.runInNewContext(storageSource, context);
  return { context, window, calls };
}
function gate(context) {
  const start = game.indexOf('const _fdgProjectiveTextureGate='), end = game.indexOf('const _MQ=', start);
  assert.ok(start >= 0 && end > start);
  return plain(vm.runInNewContext(game.slice(start, end)
    + '\n({perspective:_fdgProjectiveTextureGate,forest:_FDG_RUINED_FOREST_FIRST,pack:_FDG_NATIVE_MAP_PACK_FIRST,encounter:_FDG_NATIVE_ENCOUNTER_PLACEMENT_FIRST});', context));
}
function fixture({ hash = '', packActive = true, encounterActive = true, search = ownQuery } = {}) {
  const { context, window, calls } = isolated(search, hash), events = [], spawned = [];
  const { doc } = fakeDocument('<section id="fdgRuinedForestPanel">');
  const fail = label => () => assert.fail(`Encounter scene reached ${label}`);
  const dirs = Object.fromEntries(atlasMeta.directions.map(dir => [dir, { ready: true }]));
  Object.assign(context, { _FDG_RUINED_FOREST_FIRST: true, _FDG_NATIVE_MAP_PACK_FIRST: packActive, _FDG_NATIVE_ENCOUNTER_PLACEMENT_FIRST: encounterActive,
    _fdgNativeMapPackBundle: null, _fdgNativeMapPackLoad: null, _fdgNativeEncounterSpawns: null, _bossTestReq: 0, TOTAL_STAGES: 35, T: 40,
    structuredClone, document: doc,
    G: { stage: 0, cam: { x: 0, y: 0 }, on: false, paused: false }, ens: [], projs: [], pProjs: [], worldItems: [], MAP_OBJS: [],
    _MAP_COMPOSE: [{ path: { paint: true }, plate: 'production-stage-plate' }], _skinSeqIdx: 0,
    _fdgRuinedForestModule: forest, _fdgRuinedForestUi: null, _fdgRuinedForestCompleted: false,
    _ch8Atlas: { 1: { meta: atlasMeta, walkMeta: atlasMeta, dirs, walkDirs: dirs } }, EL: { P: 'native-physical' },
    _eSpCache: new Map(), _impacts: [], _vfxAnims: [], _fireExps: [], _eyeObjs: [],
    _eyeInited: false, _shDirty: false, _mmDirty: 0, _colObjsSrc: {}, _colObjsN: 1, _bgInitQueue: [], _bgInitDone: false, _bgInitIdx: 0,
    OPT: { diff: 0 }, _fpsCur: 60, DIFF_MUL: [.45, .55, .65, .76, .88, 1, 1.12, 1.25, 1.4, 1.58, 1.78],
    _prof: { u: 0, d: 0 }, _useGPU: false, _useGL: true, performance: { now: () => 0 },
    _cacheExitCenter() { events.push('exit-cache'); }, _load8DirAtlas(n) { assert.equal(n, 1); events.push('atlas'); },
    buildMapCache() { events.push('map-cache'); }, initTorchLights() { events.push('torches'); }, updateHUD(force) { assert.equal(force, true); events.push('hud'); },
    _getFixedMapForStage: fail('production fixed-map/LOCK lookup'), genGauntlet: fail('fallback map generator'),
    _startDruidQaChar: fail('unexpected native restart callback'),
    _enterBossArena: fail('boss arena generator'), _recycleProj: fail('unexpected projectile pool'), _recyclePProj: fail('unexpected player projectile pool'),
    setTimeout: fail('atlas wait or delayed save'),
    async _import(path) {
      calls.imports.push(path);
      // Browser modules share a realm; normalize only the VM-created baseline at this harness boundary.
      if (path.includes('native-map-pack.js')) return { ...mapPack,
        decodeNativeMapPackFragment: (hash, inputBaseline) => mapPack.decodeNativeMapPackFragment(hash, plain(inputBaseline)) };
      assert.match(path, /ruined-forest-scene\.js\?v=/);
      return { ...forest, installRuinedForestSceneUi(options) { events.push('scene-ui'); return { options, uninstall() { events.push('ui-remove'); } }; } };
    },
    mkEn(...args) {
      const [x, y, stage, etype, boss, el, room] = args;
      for (const [px, py] of [[x, y], [x - 10, y - 10], [x - 10, y + 10], [x + 10, y - 10], [x + 10, y + 10]]) {
        assert.equal(context.G.map[Math.floor(py / 40)]?.[Math.floor(px / 40)], 0, 'Native mkEn center/canMv radius10 must remain on floor');
      }
      assert.equal(stage, 0); assert.equal(boss, false); assert.equal(el, 'native-physical'); assert.equal(room, -1);
      const combat = { hp: 71 + etype, mhp: 71 + etype, atk: 9, speed: 2.2, ai: 'native-ai', _atkWindup: 13, _shotCharge: 7 };
      const e = new Proxy({ x, y, etype, alive: true, s: 'idle', ...combat }, { set(target, key, value) {
        assert.ok(!Object.hasOwn(combat, key), `Pack attempted to overwrite native combat field ${String(key)}`);
        return Reflect.set(target, key, value);
      } });
      spawned.push({ args, e, combat }); return e;
    }
  });
  evalFunctions(context, ['mkP', 'genFromTemplate', '_initRuinedForestNativeScene', '_fdgRuinedForestSnapshot',
    '_fdgNativeMapPackSnapshot', '_prepareNativeMapPack', 'initStage']);
  context.P = context.mkP();
  return { context, window, calls, events, spawned };
}

function fakeDocument(html) {
  const nodes = new Map(), paint = [];
  const canvasContext = new Proxy({ measureText: text => ({ width: String(text).length * 8 }) }, {
    get(target, key) { return key in target ? target[key] : (...args) => paint.push([key, ...args]); }
  });
  function element(tag) {
    return { tagName: tag.toUpperCase(), style: {}, children: [], listeners: {}, dataset: {}, value: '', text: '',
      classList: { add() {}, remove() {}, toggle() {} },
      append(...children) { for (const child of children) { child.parentNode = this; this.children.push(child); }
        if (this.tagName === 'SELECT' && !this.value) this.value = this.children[0]?.value || ''; },
      appendChild(child) { this.append(child); return child; }, replaceChildren(...children) { this.children = []; this.append(...children); },
      addEventListener(type, fn) { this.listeners[type] = fn; },
      emit(type, extra = {}) { assert.ok(this.listeners[type], `Missing ${this.id} ${type} handler`); return this.listeners[type]({ target: this, preventDefault() {}, ...extra }); },
      getContext(type) { assert.equal(type, '2d'); return canvasContext; },
      getBoundingClientRect() { return { left: 0, top: 0, width: this.width || 960, height: this.height || 720 }; },
      setAttribute(name, value) { this[name] = value; }, getAttribute(name) { return this[name]; }, removeAttribute(name) { delete this[name]; },
      get firstChild() { return this.children[0] || null; },
      remove() { this.removed = true; if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.parentNode = null; },
      set id(value) { this._id = value; nodes.set(value, this); }, get id() { return this._id; },
      get valueAsNumber() { return this.value === '' ? NaN : Number(this.value); },
      set textContent(value) { assert.equal(this.children.length, 0, 'Editor text replacement must target a leaf node'); this.text = String(value); },
      get textContent() { return this.text; }
    };
  }
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*\bid="([^"]+)"[^>]*)>/gi)) {
    const node = element(match[1]); node.id = match[3];
    for (const attr of match[2].matchAll(/([\w-]+)="([^"]*)"/g)) {
      if (attr[1] === 'width' || attr[1] === 'height') node[attr[1]] = Number(attr[2]);
      else if (attr[1] !== 'id') node[attr[1]] = attr[2];
    }
  }
  const doc = { createElement: element, body: element('body'), getElementById: id => nodes.get(id) || null,
    querySelector(selector) { assert.ok(selector.startsWith('#'), `Unexpected editor selector ${selector}`); return nodes.get(selector.slice(1)) || null; },
    querySelectorAll(selector) { return selector === 'input' ? [...nodes.values()].filter(n => n.tagName === 'INPUT') : []; }
  };
  return { doc, nodes, paint };
}

function bootFixture(options) {
  const fixtureState = fixture(options), { context, events } = fixtureState;
  const node = { style: { transition: '', removeProperty() {} }, classList: { add() {}, remove() {} }, offsetWidth: 0 };
  Object.assign(context, { $: () => node, INV: { equipped: {} },
    defaultItems: () => [{ slot: 'weapon', id: 'native-starter' }],
    recalcSt() { events.push('recalc'); }, applyStats() { events.push('stats'); },
    _drReset() { events.push('druid-reset'); }, _deathDlgStop() {},
    showBootLoading() {}, setBootLoading() {}, hideBootLoading() {}, updateQS() {}, updateSkSlot() {}
  });
  evalFunctions(context, ['_loadRuinedForestNativeScene', '_startDruidQaChar']);
  return fixtureState;
}

function editedEncounter() {
  const original = mapPack.createNativeEncounterMapPack(baseline);
  const pack = structuredClone(original), first = pack.enemies[0];
  // Choose a quarter-tile edit against the unchanged authored floor, independently
  // of the validator; the consumer oracle later inspects the native factory args.
  const cells = [];
  for (let i = 0; i < baseline.template.tileRLE.length; i += 2) {
    cells.push(...Array(baseline.template.tileRLE[i + 1]).fill(baseline.template.tileRLE[i]));
  }
  const candidate = [1.25, -1.25, .25, -.25].flatMap(dx => [.25, -.25].map(dy => ({ x: first.x + dx, y: first.y + dy })))
    .find(p => [[0, 0], [-.25, -.25], [-.25, .25], [.25, -.25], [.25, .25]].every(([dx, dy]) => {
      const x = Math.floor(p.x + .5 + dx), y = Math.floor(p.y + .5 + dy);
      return x >= 0 && y >= 0 && x < pack.map.mw && y < pack.map.mh && cells[y * pack.map.mw + x] === 1;
    }));
  assert.ok(candidate, 'Baseline must have a nearby floor candidate for the public encounter edit');
  Object.assign(first, candidate);
  pack.name = '초기 적 배치 왕복';
  return { original, pack, edit: { instanceId: first.instanceId, ...candidate } };
}

async function boot(state) {
  evalFunctions(state.context, ['_loadRuinedForestNativeScene']);
  await state.context._loadRuinedForestNativeScene();
  state.context.initStage(0);
  return state;
}

test('encounter gate rejects v2 and invalid authoring before native actor or world initialization', async () => {
  for (const [search, origin, expected] of [[ownQuery, undefined, true],
    [ownQuery.replace('&fdgEncounter=placement-first', ''), undefined, false],
    [ownQuery.replace('fdgEncounter=placement-first', 'fdgEncounter=other'), undefined, false],
    [ownQuery.replace('&fdgMapPack=first', ''), undefined, false],
    [ownQuery.replace('fdgPerspective=first', 'fdgPerspective=other'), undefined, false],
    [ownQuery.replace('fdgScene=ruined-forest-first', 'fdgScene=other'), undefined, false],
    [ownQuery.replace('fdgDruidQa=r4', 'fdgDruidQa=r3'), undefined, false],
    [ownQuery + '&stage=0', undefined, false], [ownQuery, 'https://example.com', false]]) {
    const state = isolated(search, '#fdg-pack=untrusted', origin);
    assert.equal(gate(state.context).encounter, expected);
    assert.equal(state.calls.writes.length, 0); assert.equal(state.calls.network.length, 0);
  }
  const { pack } = editedEncounter(), hostile = structuredClone(pack), wall = structuredClone(pack);
  hostile.enemies[0].hp = 9999;
  wall.enemies[0].x = 0; wall.enemies[0].y = 0;
  for (const [input, encounterActive] of [[pack, false], [hostile, true], [wall, true]]) {
    const hash = '#fdg-pack=' + encodeURIComponent(JSON.stringify(input));
    const state = bootFixture({ hash, encounterActive }), { context, calls, events } = state;
    context.MAP_OBJS = [{ type: 'existing-prop', x: 400, y: 800 }];
    context.ens = [{ alive: true, hp: 93, x: 500, y: 900 }]; context.G.map = [[0, 1]];
    const player = context.P, world = plain({ P: player, G: context.G, objects: context.MAP_OBJS, enemies: context.ens });
    const nativeMkP = context.mkP; let actorsRestarted = 0;
    context.mkP = () => { actorsRestarted++; return nativeMkP(); };
    await assert.rejects(context._startDruidQaChar());
    assert.strictEqual(context.P, player); assert.equal(actorsRestarted, 0);
    assert.deepEqual(plain({ P: context.P, G: context.G, objects: context.MAP_OBJS, enemies: context.ens }), world);
    assert.equal(context._fdgNativeMapPackBundle, null); assert.equal(context.OPT.diff, 0);
    assert.ok(!events.some(e => ['atlas', 'scene-ui', 'map-cache', 'recalc', 'stats'].includes(e)));
    assert.equal(state.spawned.length, 0); assert.equal(context._fdgNativeEncounterSpawns, null);
    const errors = context.document.body.children.filter(node => node.id === 'fdgNativeMapPackError');
    assert.equal(errors.length, 1); assert.equal(errors[0].role, 'alert');
    assert.match(errors[0].textContent, /맵팩을 불러올 수 없습니다/);
    assert.equal(calls.writes.length, 0); assert.equal(calls.network.length, 0);
  }
});

test('v2 coordinates reach native mkEn while spawn receipt and live actor inspection keep distinct owners', async () => {
  const { pack, edit } = editedEncounter();
  const state = fixture({ hash: mapPack.encodeNativeMapPackFragment(pack, baseline) }), { context, calls, spawned } = state;
  const playerBefore = plain(context.P), templates = [], generator = context.genFromTemplate;
  context.genFromTemplate = (template, stage) => { templates.push({ template, stage }); return generator(template, stage); };
  await boot(state);
  assert.equal(templates.length, 1); assert.strictEqual(templates[0].template, context._fdgNativeMapPackBundle.template);
  assert.equal(context.G.mapType, 'fdg_ruined_forest'); assert.equal(context.G.bossAlive, false);
  assert.equal(context.OPT.diff, 5); assert.equal(context.DIFF_MUL[context.OPT.diff], 1);
  assert.equal(spawned.length, pack.enemies.length);
  for (const [i, { e, args, combat }] of spawned.entries()) {
    const authored = pack.enemies[i];
    assert.strictEqual(context.ens[i], e, 'Native scene must retain the exact actor returned by mkEn');
    assert.deepEqual(args, [(authored.x + .5) * context.T, (authored.y + .5) * context.T, 0, authored.etype, false, 'native-physical', -1]);
    assert.equal(e._fdgInstanceId, authored.instanceId); assert.equal(e._mob8Skin, authored.skin);
    for (const [key, value] of Object.entries(combat)) assert.equal(e[key], value);
  }
  for (const key of ['lv', 'hp', 'mhp', 'baseAtk', 'baseDef', 'speed', 'skills']) assert.deepEqual(plain(context.P[key]), playerBefore[key]);
  const api = state.window._FDGNativeMapPack;
  assert.ok(Object.isFrozen(api)); assert.deepEqual(Object.keys(api), ['snapshot']);
  const receipt = api.snapshot(), initial = plain(receipt.spawnedEnemies.find(e => e.instanceId === edit.instanceId));
  assert.deepEqual(plain(initial), { instanceId: edit.instanceId, etype: pack.enemies[0].etype, skin: pack.enemies[0].skin,
    authored: { x: edit.x, y: edit.y }, world: { x: (edit.x + .5) * context.T, y: (edit.y + .5) * context.T } });
  assert.equal(receipt.changedEnemies.length, 1);
  assert.equal(receipt.changedEnemies[0].instanceId, edit.instanceId);
  const live = context.ens.find(e => e._fdgInstanceId === edit.instanceId);
  live.x += 19; live.y -= 7; // Harness emulates a later native AI movement, not an authoring overwrite.
  const later = api.snapshot(), actual = later.appliedEnemies.find(e => e.instanceId === edit.instanceId);
  assert.equal(actual.x, live.x); assert.equal(actual.y, live.y); assert.equal(actual.hp, live.hp);
  assert.deepEqual(plain(later.spawnedEnemies.find(e => e.instanceId === edit.instanceId)), plain(initial));
  receipt.spawnedEnemies[0].world.x = -999; receipt.appliedEnemies[0].x = -999; receipt.changedEnemies.length = 0;
  assert.deepEqual(plain(api.snapshot().spawnedEnemies.find(e => e.instanceId === edit.instanceId)), plain(initial));
  assert.equal(api.snapshot().changedEnemies.length, 1);
  assert.deepEqual(plain(context._fdgNativeMapPackBundle.pack), pack);
  assert.equal(calls.writes.length, 0); assert.equal(calls.network.length, 0);
});

test('v1 without encounter opt-in and ordinary native stage selection retain their factory contracts', async () => {
  const v1 = mapPack.createNativeMapPack(baseline), search = ownQuery.replace('&fdgEncounter=placement-first', '');
  const state = await boot(fixture({ hash: mapPack.encodeNativeMapPackFragment(v1, baseline), search, encounterActive: false }));
  assert.equal(state.context._fdgNativeMapPackBundle.pack.version, 1);
  for (const [i, { args, e, combat }] of state.spawned.entries()) {
    const original = baseline.scene.enemies[i];
    assert.deepEqual(args.slice(0, 4), [(original.x + .5) * 40, (original.y + .5) * 40, 0, original.etype]);
    assert.equal(e._fdgInstanceId, undefined);
    for (const [key, value] of Object.entries(combat)) assert.equal(e[key], value);
  }
  const basic = await boot(fixture({ hash: '#not-a-pack', packActive: false, encounterActive: false }));
  assert.equal(basic.context._fdgNativeMapPackBundle, null); assert.equal(basic.calls.imports.length, 1);
  assert.equal(basic.context.MAP_OBJS.length, baseline.template.objs.length);
  const normal = fixture().context;
  normal._FDG_RUINED_FOREST_FIRST = false; normal._FDG_NATIVE_MAP_PACK_FIRST = false;
  normal._FDG_NATIVE_ENCOUNTER_PLACEMENT_FIRST = false; normal._bossTestReq = -1;
  const init = source('initStage'), boundary = init.indexOf('  const st=G.rooms.find'); assert.ok(boundary > 0);
  vm.runInNewContext(init.slice(0, boundary) + '\nreturn G.mapType;}', normal);
  for (const fixed of [{ marker: 'native-stage-LOCK' }, null]) {
    const nativeCalls = []; normal._getFixedMapForStage = stage => { nativeCalls.push(['lookup', stage]); return fixed; };
    normal.genFromTemplate = (template, stage) => nativeCalls.push(['template', template, stage]);
    normal.genGauntlet = stage => nativeCalls.push(['fallback', stage]);
    assert.equal(normal.initStage(0), fixed ? 'fixed' : 'gauntlet');
    assert.deepEqual(nativeCalls, [['lookup', 0], fixed ? ['template', fixed, 0] : ['fallback', 0]]);
  }
  for (const item of [state, basic]) { assert.equal(item.calls.writes.length, 0); assert.equal(item.calls.network.length, 0); }
});

test('public enemy placement exports, resets, reimports and plays the same v2 while invalid drafts preserve valid authoring', async () => {
  const html = await readFile(new URL('../tools/fdg-studio/map-pack.html', import.meta.url), 'utf8');
  const { doc, nodes } = fakeDocument(html), editor = studio.installMapPackStudio({ document: doc, baseline });
  const initial = editor.snapshot(); assert.equal(initial.version, 1);
  const prop = initial.objects.find(o => o.instanceId === nodes.get('pack-object').value);
  nodes.get('pack-x').value = String(prop.x + 1); nodes.get('pack-y').value = String(prop.y);
  nodes.get('pack-placement').emit('submit'); assert.equal(nodes.get('pack-status').dataset.error, 'false');
  const propDraft = editor.snapshot(); assert.notDeepEqual(propDraft.objects, initial.objects);
  nodes.get('pack-kind').value = 'enemy'; nodes.get('pack-kind').emit('change');
  const upgraded = editor.snapshot(); assert.equal(upgraded.version, 2);
  assert.deepEqual(upgraded.objects, propDraft.objects, 'Explicit v2 upgrade must preserve the current edited prop draft');
  const { edit } = editedEncounter();
  nodes.get('pack-object').value = edit.instanceId; nodes.get('pack-object').emit('change');
  nodes.get('pack-x').value = String(edit.x); nodes.get('pack-y').value = String(edit.y);
  nodes.get('pack-name').value = '공개 적 배치 JSON 왕복';
  nodes.get('pack-placement').emit('submit'); assert.equal(nodes.get('pack-status').dataset.error, 'false');
  const edited = editor.snapshot(); assert.equal(edited.enemies[0].x, edit.x); assert.equal(edited.enemies[0].y, edit.y);
  assert.deepEqual(edited.objects, propDraft.objects, 'Editing an enemy must preserve previously authored props');
  nodes.get('pack-export').emit('click'); const exported = nodes.get('pack-json').value;
  assert.deepEqual(studio.readMapPackJson(exported, baseline), edited);
  nodes.get('pack-reset').emit('click');
  assert.equal(editor.snapshot().version, 1); assert.equal(nodes.get('pack-kind').value, 'prop');
  assert.equal(nodes.get('pack-object').value, 'prop-035'); assert.equal(nodes.get('pack-json').value, exported);
  nodes.get('pack-import').emit('click'); assert.deepEqual(editor.snapshot(), edited);
  assert.equal(nodes.get('pack-status').dataset.error, 'false');
  let prevented = false;
  nodes.get('pack-play').emit('click', { preventDefault() { prevented = true; } }); assert.equal(prevented, false);
  const url = new URL(nodes.get('pack-play').href, 'http://127.0.0.1:3333/tools/fdg-studio/map-pack.html');
  assert.equal(url.pathname, '/game.html'); assert.equal(url.search, ownQuery);
  const state = await boot(fixture({ hash: url.hash, search: url.search }));
  assert.deepEqual(plain(state.context._fdgNativeMapPackBundle.pack), edited);
  assert.equal(state.spawned[0].args[0], (edit.x + .5) * 40); assert.equal(state.spawned[0].args[1], (edit.y + .5) * 40);
  const appliedProp = state.context.MAP_OBJS.find(o => o._fdgInstanceId === prop.instanceId);
  assert.equal(appliedProp.x, (prop.x + 1) * 40); assert.equal(appliedProp.y, prop.y * 40);
  const valid = editor.snapshot(), href = nodes.get('pack-play').href;
  for (const invalid of ['{invalid JSON', JSON.stringify({ ...valid, enemies: valid.enemies.map((e, i) => i ? e : { ...e, hp: 9999 }) }),
    JSON.stringify({ ...valid, enemies: valid.enemies.map((e, i) => i ? e : { ...e, x: 0, y: 0 }) })]) {
    nodes.get('pack-json').value = invalid; nodes.get('pack-import').emit('click');
    assert.equal(nodes.get('pack-status').dataset.error, 'true');
    assert.deepEqual(editor.snapshot(), valid); assert.equal(nodes.get('pack-play').href, href);
  }
  nodes.get('pack-kind').value = 'enemy'; nodes.get('pack-kind').emit('change');
  nodes.get('pack-x').value = ''; prevented = false;
  nodes.get('pack-play').emit('click', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(nodes.get('pack-status').dataset.error, 'true');
  assert.deepEqual(editor.snapshot(), valid); assert.equal(nodes.get('pack-play').href, href);
  assert.equal(state.calls.writes.length, 0); assert.equal(state.calls.network.length, 0);
});
