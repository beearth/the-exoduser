import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const loader = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .find(m => m[1].includes('// Supabase CDN'))[1];
const localBranch = html.match(/const _isLocal=.*\r?\nif\((.*)\)\{/)[1];
const bootPrefix = html.slice(html.indexOf('async function startGameFromDB(){'),
  html.indexOf('  // 2) 기본 초기화')) + '\n}';

function sdkContext(search, hostname = 'localhost') {
  const scripts = [];
  const ctx = vm.createContext({
    URLSearchParams, location: { search, hostname, protocol: 'http:' },
    document: { createElement: () => ({}), head: { appendChild: s => scripts.push(s) } },
  });
  ctx.window = ctx;
  vm.runInContext(loader, ctx);
  return { ctx, scripts };
}

test('localhost Google character uses cloud, while guests and explicit tests stay local', () => {
  for (const [search, expected] of [['?char=account-character&slot=hero', false], ['', true], ['?test=1', true], ['?test=1&char=account-character', true]]) {
    assert.equal(vm.runInNewContext(localBranch, {
      _isLocal: true, _charId: new URLSearchParams(search).get('char'),
      URLSearchParams, window: { location: { search } },
    }), expected, search);
  }
});

test('localhost cloud character requests SDK; guest/test do not need CDN', () => {
  assert.equal(sdkContext('?char=account-character').scripts.length, 1);
  assert.equal(sdkContext('').scripts.length, 0);
  assert.equal(sdkContext('?test=1&char=account-character').scripts.length, 0);
});

test('cloud boot waits for delayed SDK before checking the session', async () => {
  const { ctx, scripts } = sdkContext('?char=account-character');
  let authCalls = 0;
  Object.assign(ctx, {
    sb: null, _charId: 'account-character', _BOOTH_MODE: false,
    SUPABASE_URL: 'test-url', SUPABASE_KEY: 'public-test-key',
    showBootLoading() {}, setBootLoading() {}, _T: s => s,
    dbLoad: async () => ({}),
  });
  vm.runInContext(bootPrefix, ctx);
  const pending = ctx.startGameFromDB();
  await Promise.resolve();
  assert.equal(authCalls, 0);
  assert.equal(ctx.location.href, undefined, 'must not redirect while SDK is loading');
  ctx.supabase = { createClient: () => ({ auth: { getSession: async () => {
    authCalls++;
    return { data: { session: { user: { id: 'test-user' } } } };
  } } }) };
  scripts[0].onload();
  await pending;
  assert.equal(authCalls, 1);
});

test('SDK failure resolves readiness without falling back to a local character', async () => {
  const { ctx, scripts } = sdkContext('?char=account-character');
  assert.equal(scripts.length, 1);
  scripts[0].onerror();
  assert.equal(await ctx._supabaseReady, false);
});

test('failed cloud load stops boot before player initialization and autosave', async () => {
  const messages = [];
  let initialized = false;
  const ctx = vm.createContext({
    window: { _supabaseReady: Promise.resolve(true), location: {} },
    sb: { auth: { getSession: async () => ({ data: { session: {} } }) } },
    _charId: 'account-character', _BOOTH_MODE: false,
    _T: s => s, showBootLoading() {}, setBootLoading: (pct, msg) => messages.push(msg),
    dbLoad: async () => null,
    mkP() { initialized = true; throw new Error('must not initialize'); },
  });
  // Include the first initialization statement so the test exercises the abort boundary.
  const prefix = html.slice(html.indexOf('async function startGameFromDB(){'), html.indexOf('  INV.bag=[];', html.indexOf('async function startGameFromDB(){')));
  vm.runInContext(prefix + '\n}', ctx);
  await ctx.startGameFromDB();
  assert.equal(initialized, false);
  assert.ok(messages.some(s => s.includes('저장 데이터')));
});

const timersCode = html.slice(html.indexOf('function doAutoSave(){'), html.indexOf('// ─── [S01d]'));
for (const key of ['_D5K', '_DEMO_LS_KEY']) {
  test(`demo save ${key} records success only after localStorage accepts the write`, async () => {
    const end = html.indexOf(`localStorage.setItem(${key},JSON.stringify(sd));`);
    const start = html.lastIndexOf('dbSave=async function(){', end);
    const body = html.slice(start, html.indexOf('\n  };', end) + 5);
    let reject = true;
    const ctx = vm.createContext({
      P: { skills: {} }, INV: { bag: [], equipped: {} }, G: {},
      STATS: {}, PASSIVES: {}, QSLOTS: [], BAG_MAX: 300, UPGRADES: {}, POT_LV: {},
      SKILL_SLOTS: [], ULT_SLOT: null, _charIdx: 0,
      _D5K: 'demo500', _DEMO_LS_KEY: 'demo0', _lastSaveTime: 0,
      localStorage: { setItem() { if (reject) throw new Error('storage full'); } },
      console: { warn() {} },
    });
    vm.runInContext(body, ctx);
    await ctx.dbSave();
    assert.equal(ctx._lastSaveTime, 0);
    reject = false;
    await ctx.dbSave();
    assert.ok(ctx._lastSaveTime > 0);
  });
}

test('autosave does not mark failed or skipped writes as successful saves', () => {
  let calls = 0;
  const ctx = vm.createContext({ Date: { now: () => 30000 }, _lastSaveTime: 0,
    G: { on: true }, _dbReady: true, dbSave: () => calls++,
  });
  vm.runInContext(timersCode, ctx);
  ctx.doAutoSave();
  assert.equal(calls, 1);
  assert.equal(ctx._lastSaveTime, 0);
});

test('debounced save clears its timer so a following forced save can be scheduled', () => {
  const callbacks = new Map();
  let id = 0;
  const ctx = vm.createContext({ Date: { now: () => 30000 }, _lastSaveTime: 29000,
    _dbReady: true, _saving: false, dbSave() {},
    setTimeout: fn => { callbacks.set(++id, fn); return id; }, clearTimeout: id => callbacks.delete(id),
  });
  vm.runInContext(timersCode, ctx);
  ctx.dbSaveNow();
  const callback = callbacks.get(1); callbacks.delete(1); callback();
  ctx.dbSaveForce();
  assert.equal(callbacks.size, 1);
  assert.equal(ctx._lastSaveTime, 29000);
});

test('30-second autosave sends live progress to the selected cloud character and retries after failure', async () => {
  const writes = [];
  let tick, delay, fail = true;
  const ctx = vm.createContext({
    _charId: 'account-character', _dbReady: true, _saving: false,
    _lastSaveTime: 0, _autoSaveTimer: null, IS_ELECTRON: false,
    P: { lv: 12, exp: 345, skills: { spikeTrap: 2 } },
    G: { on: true, stage: 2, kills: 70, mats: 100 },
    INV: { bag: [{ id: 'kept-item' }], equipped: {} },
    STATS: {}, PASSIVES: {}, _grit: 0, QSLOTS: [], BAG_MAX: 300,
    CRYSTAL_BAG: [], CRYSTAL_DUST: 0, UPGRADES: {}, POT_LV: {},
    SKILL_SLOTS: ['spikeTrap'], ULT_SLOT: null, _charIdx: 1,
    _sanitizeCoreState() {}, _saveSharedMats() {}, _flushSharedStorage() {},
    console: { error() {} },
    setInterval(fn, ms) { tick = fn; delay = ms; return 1; }, clearInterval() {},
    sb: { from(table) { return { update(payload) { return { async eq(column, id) {
      writes.push({ table, payload, column, id });
      return { error: fail ? { message: 'temporary network failure' } : null };
    } }; } }; } },
  });
  const saveCode = html.slice(html.indexOf('async function dbSave(){'), html.indexOf('// ═══ Load game state from DB'));
  vm.runInContext(saveCode + '\n' + timersCode, ctx);
  ctx.startAutoSave();
  assert.equal(delay, 30000);
  tick(); await new Promise(setImmediate);
  assert.equal(ctx._saving, false);
  assert.equal(ctx._lastSaveTime, 0, 'network failure is not a successful save');
  fail = false;
  ctx.P.lv = 13;
  tick(); await new Promise(setImmediate);
  assert.equal(writes.length, 2);
  const { table, payload, column, id } = writes[1];
  assert.equal(table, 'characters');
  assert.equal(column, 'id');
  assert.equal(id, 'account-character');
  assert.equal(payload.data.player.lv, 13);
  assert.equal(payload.data.player.exp, 345);
  assert.equal(payload.data.inv.bag[0].id, 'kept-item');
  assert.equal(payload.data.skills.spikeTrap, 2);
  assert.equal(payload.data.game.stage, 2);
  assert.ok(ctx._lastSaveTime > 0);
});
