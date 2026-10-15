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
const ownQuery = '?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgPerspective=first&fdgScene=ruined-forest-first&fdgMapPack=first';
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
  assert.fail('Unterminated native map-pack consumer');
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
  vm.runInNewContext(names.map(source).join('\n').replace(/\bimport\(/g, '_import('), context);
  return context;
}
function isolated(search = ownQuery, hash = '', origin = 'http://127.0.0.1:3333') {
  const calls = { reads: [], writes: [], network: [], imports: [] };
  const location = { href: origin + '/game.html' + search + hash, search, hash };
  const window = { location,
    localStorage: { getItem(key) { calls.reads.push(key); assert.equal(key, 'fdg.qa.dark-druid.encounter.r4'); return null; },
      setItem(...args) { calls.writes.push(args); assert.fail('Map-pack play must not persist state'); } } };
  const context = { window, URL, URLSearchParams, location,
    fetch(...args) { calls.network.push(args); assert.fail('Map-pack play must not call a save API'); } };
  vm.runInNewContext(storageSource, context);
  return { context, window, calls };
}
function gate(context) {
  const start = game.indexOf('const _fdgProjectiveTextureGate='), end = game.indexOf('const _MQ=', start);
  assert.ok(start >= 0 && end > start);
  return plain(vm.runInNewContext(game.slice(start, end)
    + '\n({perspective:_fdgProjectiveTextureGate,forest:_FDG_RUINED_FOREST_FIRST,pack:_FDG_NATIVE_MAP_PACK_FIRST});', context));
}
function fixture({ hash = '', packActive = true } = {}) {
  const { context, window, calls } = isolated(ownQuery, hash), events = [], spawned = [];
  const { doc } = fakeDocument('<section id="fdgRuinedForestPanel">');
  const fail = label => () => assert.fail(`Map-pack scene reached ${label}`);
  const dirs = Object.fromEntries(atlasMeta.directions.map(dir => [dir, { ready: true }]));
  Object.assign(context, { _FDG_RUINED_FOREST_FIRST: true, _FDG_NATIVE_MAP_PACK_FIRST: packActive,
    _fdgNativeMapPackBundle: null, _fdgNativeMapPackLoad: null, _bossTestReq: 0, TOTAL_STAGES: 35, T: 40,
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
      assert.equal(context.G.map[Math.floor(y / 40)][Math.floor(x / 40)], 0);
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
      append(...children) { this.children.push(...children); if (this.tagName === 'SELECT' && !this.value) this.value = this.children[0]?.value || ''; },
      appendChild(child) { this.append(child); return child; }, replaceChildren(...children) { this.children = []; this.append(...children); },
      addEventListener(type, fn) { this.listeners[type] = fn; },
      emit(type, extra = {}) { assert.ok(this.listeners[type], `Missing ${this.id} ${type} handler`); return this.listeners[type]({ target: this, preventDefault() {}, ...extra }); },
      getContext(type) { assert.equal(type, '2d'); return canvasContext; },
      getBoundingClientRect() { return { left: 0, top: 0, width: this.width || 960, height: this.height || 720 }; },
      setAttribute(name, value) { this[name] = value; }, getAttribute(name) { return this[name]; }, removeAttribute(name) { delete this[name]; },
      remove() { this.removed = true; },
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

function editedPack() {
  const original = mapPack.createNativeMapPack(baseline);
  const object = original.objects.find(o => o.instanceId === 'prop-035');
  assert.ok(object, 'The editor default must identify a real baseline instance');
  const edit = { instanceId: object.instanceId, x: object.x + 1.25, y: object.y - .25, name: '폐허 숲길 · 편집 왕복' };
  return { original, object, edit, pack: studio.applyMapPackPlacement(original, baseline, edit) };
}

test('map-pack decode requires the exact isolated gate and invalid boot leaves the native world untouched', async () => {
  for (const [search, origin, expected] of [[ownQuery, undefined, true],
    [ownQuery.replace('&fdgMapPack=first', ''), undefined, false],
    [ownQuery.replace('fdgMapPack=first', 'fdgMapPack=other'), undefined, false],
    [ownQuery.replace('fdgScene=ruined-forest-first', 'fdgScene=other'), undefined, false],
    [ownQuery.replace('fdgPerspective=first', 'fdgPerspective=other'), undefined, false],
    [ownQuery.replace('fdgDruidQa=r4', 'fdgDruidQa=r3'), undefined, false],
    [ownQuery + '&stage=0', undefined, false], [ownQuery, 'https://example.com', false]]) {
    const state = isolated(search, '#untrusted-json', origin), result = gate(state.context);
    assert.equal(result.pack, expected);
    if (expected) assert.deepEqual(result, { perspective: true, forest: true, pack: true });
    assert.equal(state.calls.writes.length, 0); assert.equal(state.calls.network.length, 0);
  }
  const { context, calls, events } = bootFixture({ hash: '#fdg-pack=' + encodeURIComponent('{invalid JSON') });
  context.MAP_OBJS = [{ type: 'existing-world-prop', x: 400, y: 800 }];
  context.ens = [{ alive: true, hp: 93, x: 500, y: 900 }]; context.G.map = [[0, 1]];
  const player = context.P, world = plain({ P: context.P, G: context.G, objects: context.MAP_OBJS, enemies: context.ens });
  const nativeMkP = context.mkP; let actorRestarts = 0;
  context.mkP = () => { actorRestarts++; return nativeMkP(); };
  await assert.rejects(context._startDruidQaChar());
  assert.strictEqual(context.P, player); assert.equal(actorRestarts, 0);
  assert.deepEqual(plain({ P: context.P, G: context.G, objects: context.MAP_OBJS, enemies: context.ens }), world);
  assert.equal(context._fdgNativeMapPackBundle, null); assert.equal(context.OPT.diff, 0);
  assert.ok(!events.some(e => ['atlas', 'scene-ui', 'map-cache', 'recalc', 'stats'].includes(e)));
  const alerts = context.document.body.children.filter(node => node.id === 'fdgNativeMapPackError');
  assert.equal(alerts.length, 1); assert.equal(alerts[0].role, 'alert'); assert.match(alerts[0].textContent, /맵팩을 불러올 수 없습니다/);
  await assert.rejects(context._prepareNativeMapPack(forest));
  assert.equal(calls.imports.filter(path => path.includes('native-map-pack')).length, 1, 'A rejected shared load must stay rejected');
  assert.equal(context.document.body.children.length, 1, 'Cached rejection must not append duplicate errors');
  assert.equal(calls.writes.length, 0); assert.equal(calls.network.length, 0);
});

test('decoded pack reaches native template and enemy factories while basic forest and default stage branches remain protected', async () => {
  const { pack, edit } = editedPack(), hash = mapPack.encodeNativeMapPackFragment(pack, baseline);
  const { context, calls, spawned } = fixture({ hash });
  evalFunctions(context, ['_loadRuinedForestNativeScene']);
  await context._loadRuinedForestNativeScene();
  const bundle = context._fdgNativeMapPackBundle;
  assert.ok(bundle); assert.deepEqual(plain(bundle.pack), pack); assert.equal(context.OPT.diff, 5);
  const templates = [], nativeGenerator = context.genFromTemplate;
  context.genFromTemplate = (template, stage) => { templates.push({ template, stage }); return nativeGenerator(template, stage); };
  const playerBefore = plain(context.P); context.initStage(0);
  assert.equal(templates.length, 1); assert.strictEqual(templates[0].template, bundle.template); assert.equal(templates[0].stage, 0);
  const object = context.MAP_OBJS.find(o => o._fdgInstanceId === edit.instanceId);
  assert.ok(object); assert.equal(object.x, edit.x * context.T); assert.equal(object.y, edit.y * context.T);
  assert.equal(context.G.mapType, 'fdg_ruined_forest'); assert.equal(context.G.bossAlive, false);
  assert.equal(spawned.length, bundle.scene.enemies.length);
  for (const [i, { e, args, combat }] of spawned.entries()) {
    const spawn = bundle.scene.enemies[i];
    assert.deepEqual(args.slice(0, 4), [(spawn.x + .5) * context.T, (spawn.y + .5) * context.T, 0, spawn.etype]);
    assert.equal(e._mob8Skin, spawn.skin);
    for (const [key, value] of Object.entries(combat)) assert.equal(e[key], value);
  }
  for (const key of ['lv', 'hp', 'mhp', 'baseAtk', 'baseDef', 'speed', 'skills']) assert.deepEqual(plain(context.P[key]), playerBefore[key]);
  const installed = [];
  context.VW = 1280; context.VH = 720; context._ssaa = 2; context._fdgNativePerspective = null; context.console = console;
  const load = context._import;
  context._import = path => path.includes('native-perspective-qa')
    ? Promise.resolve({ installNativePerspectiveQa(options) { installed.push(options); return { active: false }; } }) : load(path);
  const start = game.lastIndexOf('<script type="module">'), end = game.indexOf('</script>', start);
  vm.runInNewContext(game.slice(start + '<script type="module">'.length, end).replace(/\bimport\(/g, '_import('), context);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(installed.length, 1); assert.deepEqual(installed[0].initialCamera, bundle.scene.camera);
  assert.equal(calls.imports.filter(path => path.includes('native-map-pack')).length, 1, 'Native boot and camera share one decoded pack');
  const basic = fixture({ hash: '#invalid-but-outside-pack-gate', packActive: false });
  evalFunctions(basic.context, ['_loadRuinedForestNativeScene']); await basic.context._loadRuinedForestNativeScene(); basic.context.initStage(0);
  assert.equal(basic.context._fdgNativeMapPackBundle, null); assert.equal(basic.calls.imports.length, 1);
  assert.equal(basic.context.MAP_OBJS.length, baseline.template.objs.length);
  assert.equal(basic.context.P.x, (baseline.scene.start.x + .5) * basic.context.T);
  const normal = fixture().context; normal._FDG_RUINED_FOREST_FIRST = false; normal._FDG_NATIVE_MAP_PACK_FIRST = false; normal._bossTestReq = -1;
  const init = source('initStage'), boundary = init.indexOf('  const st=G.rooms.find'); assert.ok(boundary > 0);
  vm.runInNewContext(init.slice(0, boundary) + '\nreturn G.mapType;}', normal);
  for (const fixed of [{ marker: 'native-stage-LOCK' }, null]) {
    const nativeCalls = []; normal._getFixedMapForStage = stage => { nativeCalls.push(['lookup', stage]); return fixed; };
    normal.genFromTemplate = (template, stage) => nativeCalls.push(['template', template, stage]); normal.genGauntlet = stage => nativeCalls.push(['fallback', stage]);
    assert.equal(normal.initStage(0), fixed ? 'fixed' : 'gauntlet');
    assert.deepEqual(nativeCalls, [['lookup', 0], fixed ? ['template', fixed, 0] : ['fallback', 0]]);
  }
  const hostile = plain(pack); hostile.enemies[0].hp = 1; hostile.enemies[0].atk = 9999;
  assert.equal(mapPack.validateNativeMapPack(hostile, baseline).ok, false, 'Authoring JSON must not become combat-stat authority');
});

test('read-only map-pack snapshot reports actual runtime object positions and detaches its receipt from mutable callers', async () => {
  const { pack, edit } = editedPack(), state = fixture({ hash: mapPack.encodeNativeMapPackFragment(pack, baseline) });
  evalFunctions(state.context, ['_loadRuinedForestNativeScene']); await state.context._loadRuinedForestNativeScene(); state.context.initStage(0);
  const api = state.window._FDGNativeMapPack; assert.ok(Object.isFrozen(api)); assert.deepEqual(Object.keys(api), ['snapshot']);
  const first = api.snapshot(), applied = first.appliedObjects.find(o => o.instanceId === edit.instanceId);
  assert.equal(applied.x, edit.x * state.context.T); assert.equal(applied.y, edit.y * state.context.T); assert.equal(first.name, pack.name);
  const live = state.context.MAP_OBJS.find(o => o._fdgInstanceId === edit.instanceId);
  live.x += 19; live.y -= 7;
  const next = api.snapshot().appliedObjects.find(o => o.instanceId === edit.instanceId);
  assert.equal(next.x, live.x); assert.equal(next.y, live.y);
  assert.notEqual(next.x, applied.x, 'Snapshot must read MAP_OBJS rather than static compiler positions');
  first.appliedObjects[0].x = -999; first.changedObjects.length = 0;
  assert.equal(api.snapshot().changedObjects.length, 1);
  assert.deepEqual(plain(state.context._fdgNativeMapPackBundle.pack), pack, 'Read-only inspection must not mutate the authored pack');
  assert.deepEqual(plain(state.context._fdgRuinedForestSnapshot().mapPack), plain(api.snapshot()));
  assert.equal(state.calls.writes.length, 0); assert.equal(state.calls.network.length, 0);
});

test('editor X/Y listeners validate, export JSON, and create a public game fragment that native play consumes without invalid-edit fallback', async () => {
  const html = await readFile(new URL('../tools/fdg-studio/map-pack.html', import.meta.url), 'utf8');
  const { doc, nodes } = fakeDocument(html), editor = studio.installMapPackStudio({ document: doc, baseline });
  const original = editor.snapshot(), object = original.objects.find(o => o.instanceId === nodes.get('pack-object').value);
  assert.ok(object); assert.equal(object.instanceId, 'prop-035');
  const x = object.x + 1.25, y = object.y - .25;
  nodes.get('pack-x').value = String(x); nodes.get('pack-y').value = String(y); nodes.get('pack-name').value = '좌표 입력 왕복';
  nodes.get('pack-placement').emit('submit'); assert.equal(nodes.get('pack-status').dataset.error, 'false');
  const edited = editor.snapshot(); assert.equal(edited.objects.find(o => o.instanceId === object.instanceId).x, x);
  assert.equal(original.objects.find(o => o.instanceId === object.instanceId).x, object.x, 'Editor edits an independent pack');
  nodes.get('pack-export').emit('click');
  const exported = nodes.get('pack-json').value, exportedPack = studio.readMapPackJson(exported, baseline);
  assert.deepEqual(exportedPack, edited); assert.equal(exportedPack.objects.find(o => o.instanceId === object.instanceId).y, y);
  let prevented = false; nodes.get('pack-play').emit('click', { preventDefault() { prevented = true; } }); assert.equal(prevented, false);
  const url = new URL(nodes.get('pack-play').href, 'http://127.0.0.1:3333/tools/fdg-studio/map-pack.html');
  assert.equal(url.pathname, '/game.html'); assert.equal(url.search, ownQuery);
  const decoded = mapPack.decodeNativeMapPackFragment(url.hash, baseline); assert.deepEqual(decoded.pack, exportedPack);
  const state = fixture({ hash: url.hash }); evalFunctions(state.context, ['_loadRuinedForestNativeScene']);
  await state.context._loadRuinedForestNativeScene(); state.context.initStage(0);
  const applied = state.context.MAP_OBJS.find(o => o._fdgInstanceId === object.instanceId);
  assert.equal(applied.x, x * state.context.T); assert.equal(applied.y, y * state.context.T);
  const validHref = nodes.get('pack-play').href, validPack = editor.snapshot();
  nodes.get('pack-x').value = ''; nodes.get('pack-play').emit('click', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(nodes.get('pack-status').dataset.error, 'true');
  assert.equal(nodes.get('pack-play').href, validHref); assert.deepEqual(editor.snapshot(), validPack);
  nodes.get('pack-json').value = '{invalid JSON'; nodes.get('pack-import').emit('click');
  assert.equal(nodes.get('pack-status').dataset.error, 'true'); assert.deepEqual(editor.snapshot(), validPack);
  const oversized = '한'.repeat(mapPack.MAX_MAP_PACK_BYTES); nodes.get('pack-json').value = oversized; nodes.get('pack-import').emit('click');
  assert.equal(nodes.get('pack-status').dataset.error, 'true'); assert.deepEqual(editor.snapshot(), validPack);
  nodes.get('pack-reset').emit('click'); assert.deepEqual(editor.snapshot(), original);
  nodes.get('pack-json').value = exported; nodes.get('pack-import').emit('click'); assert.deepEqual(editor.snapshot(), exportedPack);
  assert.equal(nodes.get('pack-status').dataset.error, 'false');
});

test('map-pack public pause button toggles native pause and resume after the existing start button is hidden', async () => {
  const { pack } = editedPack(), state = fixture({ hash: mapPack.encodeNativeMapPackFragment(pack, baseline) });
  const { context, window } = state, imports = context._import, timers = [];
  const originalTimers = { setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval };
  globalThis.setInterval = (fn, ms) => { timers.push({ fn, ms, cleared: false }); return timers.length; };
  globalThis.clearInterval = id => { timers[id - 1].cleared = true; };
  context._import = path => path.includes('ruined-forest-scene')
    ? Promise.resolve({ ...forest, installRuinedForestSceneUi: options => forest.installRuinedForestSceneUi({ ...options, document: context.document }) })
    : imports(path);
  try {
    evalFunctions(context, ['_loadRuinedForestNativeScene']); await context._loadRuinedForestNativeScene(); context.initStage(0);
    context.G.on = true; window._btFramePause = true;
    const panel = context.document.getElementById('fdgRuinedForestPanel'), pause = context.document.getElementById('fdgNativeMapPackPause');
    const play = panel.children.find(node => node.tagName === 'BUTTON' && node.textContent === '플레이 시작');
    assert.ok(play && pause); assert.equal(pause.type, 'button'); assert.equal(pause.textContent, '재생 / 일시정지');
    assert.equal(pause.style.cssText, play.style.cssText, 'Pause/resume must use the existing scene button styling');
    assert.equal(context._fdgRuinedForestSnapshot().running, false);
    play.emit('click'); assert.equal(window._btFramePause, false); assert.equal(context._fdgRuinedForestSnapshot().running, true);
    assert.equal(play.hidden, true, 'The public toggle must remain usable after the original start button disappears');
    const world = plain({ player: context.P, game: context.G, enemies: context.ens, objects: context.MAP_OBJS });
    pause.emit('click'); assert.equal(window._btFramePause, true); assert.equal(context._fdgRuinedForestSnapshot().running, false);
    assert.equal(pause.textContent, '플레이 재개');
    assert.deepEqual(plain({ player: context.P, game: context.G, enemies: context.ens, objects: context.MAP_OBJS }), world,
      'Public pause must set the existing native pause switch without rewriting actor or combat state');
    assert.equal(timers.length, 1); assert.equal(timers[0].ms, 200); timers[0].fn();
    assert.match(context.document.getElementById('fdgRuinedForestStatus').textContent, /시작 준비/);
    pause.emit('click'); assert.equal(window._btFramePause, false); assert.equal(context._fdgRuinedForestSnapshot().running, true);
    assert.equal(pause.textContent, '플레이 일시정지');
    assert.deepEqual(plain({ player: context.P, game: context.G, enemies: context.ens, objects: context.MAP_OBJS }), world,
      'Public resume must reuse the same native world and actors');
    timers[0].fn(); assert.match(context.document.getElementById('fdgRuinedForestStatus').textContent, /교전 진행/);
    const basic = fixture({ hash: '#outside-pack-gate', packActive: false });
    evalFunctions(basic.context, ['_loadRuinedForestNativeScene']); await basic.context._loadRuinedForestNativeScene();
    assert.equal(basic.context.document.getElementById('fdgNativeMapPackPause'), null);
    assert.equal(state.calls.writes.length, 0); assert.equal(state.calls.network.length, 0);
  } finally {
    context._fdgRuinedForestUi?.uninstall(); Object.assign(globalThis, originalTimers);
  }
  assert.equal(timers[0].cleared, true);
});
