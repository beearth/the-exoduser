import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const tutorial = await readFile(new URL('../tutorial-badges.js', import.meta.url), 'utf8');
const parry = await readFile(new URL('../parry-lesson.js', import.meta.url), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

// Extract only the real changed function; the native game bootstrap is never run.
function balanced(source, brace) {
  assert.equal(source[brace], '{');
  let depth = 0, quote = '', comment = '';
  for (let i = brace; i < source.length; i++) {
    const c = source[i], n = source[i + 1];
    if (comment === 'line') { if (c === '\n') comment = ''; continue; }
    if (comment === 'block') { if (c === '*' && n === '/') { comment = ''; i++; } continue; }
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
    if (c === '/' && n === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && n === '*') { comment = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return source.slice(brace, i + 1);
  }
  assert.fail('unterminated source function');
}

function named(name) {
  const match = new RegExp(`(?:async\\s+)?function ${name}\\([^)]*\\)\\s*\\{`).exec(game);
  assert.ok(match, name);
  return match[0].slice(0, -1) + balanced(game, match.index + match[0].length - 1);
}

function context(active = true, seed = {}) {
  const persistent = new Map(Object.entries(seed));
  const memory = new Map();
  const lsCalls = [], fetchCalls = [], notes = [], timers = [];
  const storage = {
    getItem(key) { lsCalls.push(['getItem', key]); if (active) throw Error('USER STORAGE READ'); return persistent.get(key) ?? null; },
    setItem(key, value) { lsCalls.push(['setItem', key, String(value)]); if (active) throw Error('USER STORAGE WRITE'); persistent.set(key, String(value)); },
    removeItem(key) { lsCalls.push(['removeItem', key]); if (active) throw Error('USER STORAGE REMOVE'); persistent.delete(key); },
  };
  const fetch = (url, options) => {
    fetchCalls.push([url, options]);
    if (active) throw Error('USER API');
    return Promise.resolve({ ok: true, json: async () => ({ ok: true, mats: 23 }) });
  };
  const elements = new Map();
  const element = () => ({ style: { setProperty() {} }, children: [], append(...items) { this.children.push(...items); },
    setAttribute() {}, addEventListener() {}, focus() {}, remove() {} });
  const $ = id => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); };
  const sandbox = {
    URL, URLSearchParams, localStorage: storage, fetch,
    location: new URL('http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4'),
    document: { readyState: 'loading', addEventListener() {}, createElement: element, createElementNS: element, body: element() },
    $, _L: (ko) => ko, _T: text => text,
    setTimeout: (fn, ms) => { timers.push(['timeout', ms]); return timers.length; }, clearTimeout() {},
    setInterval: (fn, ms) => { timers.push(['interval', ms]); return timers.length; }, clearInterval() {},
    BINDS: { parry: 'KeyQ' }, BINDS2: { parry: '' }, OPT: { lang: 'ko', atmos: 2 },
    syncSettingsUI() {}, renderSettings() {},
    _SHARED_STORAGE_KEY: 'hellcave_sharedStorage', _SHARED_MATS_KEY: 'hellcave_sharedMats',
    _matsSavedVal: -1, _isLocalServer: true, STORAGE: { 1: [{ id: 'old-floor' }] }, STORAGE_MAX: 2,
  };
  sandbox.window = sandbox;
  sandbox._FDGDruidQaStorage = { active,
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: key => memory.delete(key), note: (event, detail = null) => notes.push({ event, detail }),
  };
  vm.createContext(sandbox);
  return { sandbox, persistent, memory, lsCalls, fetchCalls, notes, timers, storage, fetch, elements };
}

function install(state, names) { vm.runInContext(names.map(named).join('\n'), state.sandbox); }
function isolated(state) {
  assert.deepEqual(state.lsCalls, [], 'no original localStorage call, including caught exceptions');
  assert.deepEqual(state.fetchCalls, [], 'no original fetch call, including caught exceptions');
  assert.equal(state.sandbox.localStorage, state.storage);
  assert.equal(state.sandbox.fetch, state.fetch);
}

test('actual shared storage, migration and mats consumers use RAM before original storage/API', async () => {
  const names = ['_loadSharedStorage', '_saveSharedStorage', '_loadSharedMats', '_saveSharedMats',
    '_saveSharedMatsToServer', '_loadSharedMatsFromServer', '_getStore'];
  const qa = context(); install(qa, names);
  qa.sandbox._saveSharedStorage([{ id: 'qa-only' }]);
  assert.deepEqual(plain(qa.sandbox._loadSharedStorage()), [{ id: 'qa-only' }]);
  assert.deepEqual(plain(qa.sandbox._getStore()), [{ id: 'qa-only' }, { id: 'old-floor' }]);
  assert.deepEqual(plain(qa.sandbox.STORAGE[1]), []);
  qa.sandbox._saveSharedMats(12.8);
  assert.equal(qa.sandbox._loadSharedMats(), 12);
  qa.sandbox._saveSharedMats(-4);
  assert.equal(qa.sandbox._loadSharedMats(), 0);
  qa.sandbox._saveSharedMatsToServer(100);
  assert.equal(await qa.sandbox._loadSharedMatsFromServer(), 0);
  assert.ok(qa.notes.some(n => n.event === 'mats-server-skip'));
  isolated(qa);

  const normal = context(false, { hellcave_sharedStorage: '[{"id":"user"}]', hellcave_sharedMats: '17' });
  install(normal, names);
  assert.deepEqual(plain(normal.sandbox._loadSharedStorage()), [{ id: 'user' }]);
  normal.sandbox._saveSharedStorage([{ id: 'native-save' }]);
  assert.equal(normal.persistent.get('hellcave_sharedStorage'), '[{"id":"native-save"}]');
  assert.equal(normal.sandbox._loadSharedMats(), 17);
  normal.sandbox._saveSharedMats(19.9);
  assert.equal(normal.persistent.get('hellcave_sharedMats'), '19');
  assert.equal(normal.fetchCalls.at(-1)[0], '/api/mats');
  assert.equal(normal.fetchCalls.at(-1)[1].method, 'POST');
  assert.deepEqual(JSON.parse(normal.fetchCalls.at(-1)[1].body), { mats: 19 });
  assert.equal(await normal.sandbox._loadSharedMatsFromServer(), 23);
  assert.equal(normal.persistent.get('hellcave_sharedMats'), '23');
  assert.equal(normal.memory.size, 0, 'default consumer must retain native persistent behavior');
});

test('actual settings/presets and each initial hint expression select QA memory or default storage', () => {
  const qa = context(); install(qa, ['saveSettings', '_savePreset', '_loadPreset']);
  qa.sandbox.saveSettings(); qa.sandbox._savePreset(1);
  qa.sandbox.BINDS.parry = 'changed';
  qa.sandbox._loadPreset(1);
  assert.equal(qa.sandbox.BINDS.parry, 'KeyQ');
  assert.equal(JSON.parse(qa.memory.get('hellcave_settings')).binds.parry, 'KeyQ');
  assert.equal(qa.memory.get('hellLang'), 'ko');
  isolated(qa);

  const normal = context(false); install(normal, ['saveSettings', '_savePreset', '_loadPreset']);
  normal.sandbox.saveSettings(); normal.sandbox._savePreset(1);
  normal.sandbox.BINDS.parry = 'changed'; normal.sandbox._loadPreset(1);
  assert.equal(normal.sandbox.BINDS.parry, 'KeyQ');
  assert.ok(normal.persistent.has('hellcave_settings'));
  assert.ok(normal.persistent.has('hellcave_preset_1'));
  assert.equal(normal.memory.size, 0);

  for (const key of ['_charIdx', 'inputMode', 'gpKeyMap', 'hellcave_settings', 'hellLang', 'hellcave_screen', 'dcprof']) {
    const literal = `(window._FDGDruidQaStorage.active?window._FDGDruidQaStorage.getItem('${key}'):localStorage.getItem('${key}'))`;
    assert.ok(game.includes(literal), `initial hint branch must exist: ${key}`);
    qa.memory.set(key, `qa-${key}`);
    assert.equal(vm.runInContext(literal, qa.sandbox), `qa-${key}`);
    normal.persistent.set(key, `user-${key}`);
    assert.equal(vm.runInContext(literal, normal.sandbox), `user-${key}`);
  }
  isolated(qa);
});

test('three real dbSave bodies, autosave, reset/delete and navigation return before user consumers', async () => {
  const qa = context();
  const definitions = [...game.matchAll(/(?:async function dbSave\(\)|dbSave=async function\(\))\s*\{/g)]
    .map(m => balanced(game, m.index + m[0].length - 1))
    .filter(body => /^\{\s*if\(window\._FDGDruidQaStorage\.active\)/.test(body));
  assert.equal(definitions.length, 3, 'original, local server and web overrides are covered');
  for (const body of definitions) await vm.runInContext(`(async function()${body})()`, qa.sandbox);
  install(qa, ['startAutoSave', 'goToLobby', '_startTestChar']);
  qa.sandbox.startAutoSave();
  assert.deepEqual(qa.timers, []);
  const before = qa.sandbox.location.href;
  await qa.sandbox.goToLobby();
  assert.equal(qa.sandbox.location.href, before);
  let baselineCalls = 0;
  qa.sandbox._startDruidQaChar = async () => { baselineCalls++; return 'isolated-baseline'; };
  assert.equal(await qa.sandbox._startTestChar(), 'isolated-baseline');
  assert.equal(baselineCalls, 1);
  const resetHeader = /if\(\$\('resetYes'\)\)\$\('resetYes'\)\.onclick=async\(\)=>\{/;
  const reset = resetHeader.exec(game); assert.ok(reset);
  await vm.runInContext(`(async function()${balanced(game, reset.index + reset[0].length - 1)})()`, qa.sandbox);
  assert.equal(qa.elements.get('resetConfirm').style.display, 'none');
  assert.equal(qa.sandbox.location.href, before);
  assert.equal(qa.notes.filter(n => n.event === 'character-save-skip').length, 3);
  assert.ok(qa.notes.some(n => n.event === 'autosave-timer-skip'));
  assert.ok(qa.notes.some(n => n.event === 'user-save-reset-skip'));
  isolated(qa);

  const normal = context(false); install(normal, ['startAutoSave']);
  normal.sandbox._autoSaveTimer = null; normal.sandbox.doAutoSave = () => {};
  normal.sandbox.startAutoSave();
  assert.deepEqual(normal.timers, [['interval', 30000]], 'default autosave cadence stays native');
});

test('tutorial init/complete and parry dismissed/reset/skip use memory with original storage untouched', () => {
  const qa = context();
  vm.runInContext(tutorial, qa.sandbox);
  const badge = qa.sandbox._tutorialBadges;
  badge.init();
  assert.equal(badge.complete('combat', Array(11).fill(true)), true);
  assert.equal(badge.complete('combat', Array(11).fill(true)), false);
  assert.equal(typeof JSON.parse(qa.memory.get(badge.storageKey)).combat, 'string');
  vm.runInContext(parry, qa.sandbox);
  const lesson = qa.sandbox._parryLesson;
  const key = lesson.skipKey();
  qa.memory.set(key, '1'); assert.equal(lesson.dismissed(), true);
  lesson.resetForNewCharacter();
  assert.equal(qa.memory.has(key), false);
  assert.equal(lesson.dismissed(), false);
  let finishes = 0; lesson.finish = () => { finishes++; };
  lesson.skipAll();
  assert.equal(finishes, 1);
  assert.equal(qa.memory.get(key), '1');
  assert.equal(lesson.dismissed(), true);
  isolated(qa);
});

test('standalone tutorial/parry without helper keep default persistent reads, writes and removal', () => {
  const normal = context(false); delete normal.sandbox._FDGDruidQaStorage;
  vm.runInContext(tutorial, normal.sandbox);
  const badge = normal.sandbox._tutorialBadges;
  badge.init();
  assert.equal(badge.complete('combat', Array(11).fill(true)), true);
  assert.ok(normal.persistent.has(badge.storageKey));
  vm.runInContext(parry, normal.sandbox);
  const lesson = normal.sandbox._parryLesson, key = lesson.skipKey();
  normal.persistent.set(key, '1'); assert.equal(lesson.dismissed(), true);
  lesson.resetForNewCharacter(); assert.equal(normal.persistent.has(key), false);
  lesson.finish = () => {}; lesson.skipAll();
  assert.equal(normal.persistent.get(key), '1');
  assert.equal(normal.memory.size, 0);
  assert.equal(normal.sandbox.localStorage, normal.storage);
  assert.equal(normal.sandbox.fetch, normal.fetch);
});

test('r4-retry invokes the isolated baseline once and returns before default restore or user persistence', async () => {
  const qa = context();
  let baselineCalls = 0, baselineCompleted = false, defaultBodyCalls = 0;
  qa.sandbox._startDruidQaChar = async () => {
    baselineCalls++;
    await Promise.resolve();
    baselineCompleted = true;
  };
  for (const id of ['death', 'victory']) {
    qa.sandbox.$(id).classList = { remove() { defaultBodyCalls++; } };
  }
  qa.sandbox._drReset = () => { defaultBodyCalls++; };
  qa.sandbox._retryDruidFinale = () => { defaultBodyCalls++; return false; };
  const retryHeader = /\$\('retryBtn'\)\.onclick=async\(\)=>\{/;
  const retry = retryHeader.exec(game); assert.ok(retry);
  const before = qa.sandbox.location.href;
  await vm.runInContext(`(async function()${balanced(game, retry.index + retry[0].length - 1)})()`, qa.sandbox);
  assert.equal(baselineCalls, 1);
  assert.equal(baselineCompleted, true, 'the public Retry must await the isolated baseline');
  assert.equal(defaultBodyCalls, 0, 'normal arena restore and experience-loss body must be bypassed');
  assert.equal(qa.elements.get('death').style.opacity, '0');
  assert.equal(qa.elements.get('death').style.pointerEvents, 'none');
  assert.equal(qa.sandbox.location.href, before);
  assert.deepEqual(qa.notes, [{ event: 'native-qa-retry', detail: null }]);
  assert.match(named('_startDruidQaChar'), /G\.paused=false;G\.stageCleared=false;G\._deathSpawned=false;/,
    'the isolated baseline explicitly clears paused/cleared/death state');
  isolated(qa);
});

test('r4 own-schema difficulty loader preserves current indices while inactive legacy migration remains native', async () => {
  const helper = await readFile(new URL('../engine/fdg/druid-qa-storage.js', import.meta.url), 'utf8');
  const ownKey = 'fdg.qa.dark-druid.encounter.r4';
  const header = '// 게임 시작 시 자동 불러오기\ntry{';
  const startup = game.indexOf(header);assert.ok(startup>=0,'actual startup settings try');
  const body = balanced(game,startup+header.length-1);
  const loader = `try${body}catch(e){throw e}`;
  const cases = [], nativeCases = [];
  function boot(seed, active) {
    const state = context(false,seed);
    if(!active)state.sandbox.location=new URL('http://127.0.0.1:3333/game.html');
    state.sandbox.BGM={setVol(){}};state.sandbox.applyUIScale=()=>{};
    state.sandbox._xbowEquipped=false;
    vm.runInContext(helper,state.sandbox);
    assert.equal(state.sandbox._FDGDruidQaStorage.active,active);
    install(state,['saveSettings']);
    vm.runInContext(loader,state.sandbox);
    return state;
  }
  for(const diff of [0,5,10]) {
    const own={schemaVersion:1,settings:{opt:{diff,lang:'ko',fdgDruidQaControls:{scale:.5,distance:340,pattern:'slam',phase:0}},charIdx:0,inputMode:'kbm'}};
    const serialized=JSON.stringify(own),state=boot({[ownKey]:serialized},true);
    const api=state.sandbox._FDGDruidQaStorage;
    assert.equal(state.sandbox.OPT.diff,diff,'schema1 stores current indices, even without legacy marker');
    assert.equal(state.sandbox.OPT.diffV2,undefined,'QA must not run the legacy migration');
    assert.equal(JSON.parse(api.getItem('hellcave_settings')).opt.diff,diff,'automatic save remains in QA RAM');
    assert.deepEqual(plain(api.ownSettings),own.settings,'the durable payload is not silently migrated');
    assert.equal(state.persistent.get(ownKey),serialized);
    assert.deepEqual(state.lsCalls,[['getItem',ownKey]],'one own read; no original user settings read/write or startup persistence');
    assert.deepEqual(state.fetchCalls,[]);assert.deepEqual(plain(api.receipt().writes),[]);assert.equal(api.receipt().successfulWrites,0);
    assert.equal(api.receipt().ownSettingsRestored,true);
    cases.push({schemaVersion:1,inputDiff:diff,outputDiff:state.sandbox.OPT.diff,legacyMarkerAbsent:true,ramDiff:JSON.parse(api.getItem('hellcave_settings')).opt.diff,ownPersistentBytesUnchanged:true,ownReads:1,userStorageCalls:0,persistentWrites:0,apiCalls:0});
  }
  for(const [name,opt,expected] of [['legacy-zero',{diff:0},5],['current-marked-five',{diff:5,diffV2:1},5]]) {
    const state=boot({hellcave_settings:JSON.stringify({opt})},false);
    assert.equal(state.sandbox.OPT.diff,expected);assert.equal(state.sandbox.OPT.diffV2,1);
    const saved=JSON.parse(state.persistent.get('hellcave_settings'));
    assert.equal(saved.opt.diff,expected);assert.equal(saved.opt.diffV2,1);
    assert.deepEqual(state.lsCalls.map(call=>call.slice(0,2)),[['getItem','hellcave_settings'],['setItem','hellcave_settings'],['setItem','hellLang']],'inactive native read and save stay original');
    assert.deepEqual(state.fetchCalls,[]);assert.equal(state.sandbox._FDGDruidQaStorage.receipt().reads.length,0);
    nativeCases.push({name,inputDiff:opt.diff,outputDiff:expected,diffV2:1,nativePersistentBehaviorPreserved:true,apiCalls:0});
  }
  const metrics={helperSHA256:createHash('sha256').update(helper).digest('hex'),startupBodySHA256:createHash('sha256').update(body).digest('hex'),gameSHA256:createHash('sha256').update(game).digest('hex'),cases,nativeCases,actualHelperAndStartupConsumed:true,existingSuccessfulGroupsRerun:0,oldSuiteRuns:0,browserActions:0,nativeBoots:0,sourcePNGReads:0,gitActions:0};
  if(process.env.FDG_DRUID_QA_DIFFICULTY_METRICS)await writeFile(process.env.FDG_DRUID_QA_DIFFICULTY_METRICS,JSON.stringify(metrics,null,2)+'\n');
});
