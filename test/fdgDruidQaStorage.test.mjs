import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const helperUrl = new URL('../engine/fdg/druid-qa-storage.js', import.meta.url);
const ownKey = 'fdg.qa.dark-druid.encounter.r4';
const activeUrl = 'http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4';
const plain = value => JSON.parse(JSON.stringify(value));

async function boot(url = activeUrl, ownBytes = null) {
  const source = await readFile(helperUrl, 'utf8');
  const userBytes = new Map([
    ['hellcave_sharedMats', '{"untouched":41}'],
    ['hellcave_sharedStorage', '{"untouched":42}'],
    ['hellcave_save', '{"untouched":43}'],
  ]);
  if (ownBytes !== null) userBytes.set(ownKey, ownBytes);
  const originalBytes = new Map(userBytes);
  const calls = [];
  let storagePropertyReads = 0;
  const storage = {
    getItem(key) {
      calls.push(['getItem', key]);
      assert.equal(key, ownKey, 'the helper must not read a user key');
      return userBytes.get(key) ?? null;
    },
    setItem(key, value) {
      calls.push(['setItem', key, value]);
      assert.equal(key, ownKey, 'the helper must not write a user key');
      userBytes.set(key, String(value));
    },
    removeItem(key) {
      calls.push(['removeItem', key]);
      assert.fail(`persistent removal is forbidden: ${key}`);
    },
  };
  const fetch = function originalFetch() { assert.fail('the storage helper must not call fetch'); };
  const sandbox = { URL, URLSearchParams, location: new URL(url), fetch };
  const getStorage = () => { storagePropertyReads++; return storage; };
  Object.defineProperty(sandbox, 'localStorage', { configurable: true, enumerable: true, get: getStorage });
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox, { filename: helperUrl.pathname });
  return {
    api: sandbox._FDGDruidQaStorage, calls, userBytes, originalBytes,
    sandbox, storage, fetch, getStorage,
    storagePropertyReads: () => storagePropertyReads,
  };
}

function assertGlobalsPreserved(state) {
  assert.equal(Object.getOwnPropertyDescriptor(state.sandbox, 'localStorage').get, state.getStorage);
  assert.equal(state.sandbox.localStorage, state.storage);
  assert.equal(state.sandbox.fetch, state.fetch);
}

function assertUserBytesPreserved(state) {
  for (const [key, bytes] of state.originalBytes) {
    if (key !== ownKey) assert.equal(state.userBytes.get(key), bytes, key);
  }
}

test('inactive/default, foreign and conflicting routes make zero storage accesses', async () => {
  const denied = [
    'http://127.0.0.1:3333/game.html',
    activeUrl.replace('/game.html?', '/tools/fdg-studio/index.html?'),
    activeUrl.replace('/game.html?', '/other/game.html?'),
    activeUrl.replace('127.0.0.1', 'example.com'),
    activeUrl.replace(':3333/', ':3334/'),
    activeUrl.replace('test=1', 'test=0'),
    activeUrl.replace('testchar=1', 'testchar=0'),
    activeUrl.replace('bosstest=0', 'bosstest=1'),
    activeUrl.replace('&fdgDruidQa=r4', ''),
    activeUrl.replace('fdgDruidQa=r4', 'fdgDruidQa=r3'),
    ...['editor', 'demo', 'bic', 'char', 'booth', 'mapqa', 'projectilelab', 'dropPreview', 'stage']
      .map(key => `${activeUrl}&${key}=`),
  ];
  for (const url of denied) {
    const state = await boot(url);
    assert.equal(state.api.active, false, url);
    assert.equal(state.storagePropertyReads(), 0, url);
    assert.deepEqual(state.calls, [], url);
    assertUserBytesPreserved(state);
    assertGlobalsPreserved(state);
  }
});

test('both approved hosts activate; get/set/remove stay in RAM and preserve globals', async () => {
  for (const host of ['127.0.0.1', 'localhost']) {
    const state = await boot(activeUrl.replace('127.0.0.1', host));
    const api = state.api;
    assert.equal(api.active, true);
    assert.equal(api.key, ownKey);
    assert.deepEqual(state.calls, [['getItem', ownKey]]);
    assert.equal(api.getItem('hellcave_sharedMats'), '0', 'QA RAM starts empty and must not read the user value');
    api.setItem('hellcave_sharedMats', 123);
    assert.equal(api.getItem('hellcave_sharedMats'), '123');
    api.removeItem('hellcave_sharedMats');
    assert.equal(api.getItem('hellcave_sharedMats'), null);
    assert.deepEqual(state.calls, [['getItem', ownKey]]);
    assert.deepEqual(plain(api.receipt()).memoryOperations, { getItem: 3, setItem: 1, removeItem: 1 });
    assertUserBytesPreserved(state);
    assertGlobalsPreserved(state);
  }
});

test('manual settings Save and reopen use only the own key; snapshots are isolated', async () => {
  const settings = {
    binds: { Q: 'guard' }, binds2: { E: 'bash' }, opt: { volume: 0.5 },
    charIdx: 0, inputMode: 'kbm', gpKeyMap: { 0: 'attack' },
    language: 'ko', screen: { fullscreen: false }, presets: { selected: 'qa' },
  };
  const expected = plain(settings);
  const state = await boot();
  assert.equal(state.api.saveOwn(settings), true);
  settings.opt.volume = 1;
  const exposed = state.api.ownSettings;
  exposed.opt.volume = 0;
  assert.deepEqual(plain(state.api.ownSettings), expected);
  const serialized = state.userBytes.get(ownKey);
  assert.deepEqual(JSON.parse(serialized), { schemaVersion: 1, settings: expected });
  assert.deepEqual(state.calls.map(call => call.slice(0, 2)), [['getItem', ownKey], ['setItem', ownKey]]);
  assert.equal(state.api.saveOwn({ ...expected, actors: [{ x: 1 }] }), false);
  assert.equal(state.api.saveOwn({ P: {}, G: {}, INV: [], mats: {} }), false);
  assert.equal(state.api.saveOwn({ inputMode: 'keyboard' }), false);
  assert.equal(state.api.saveOwn({ charIdx: 2 }), false);
  assert.equal(state.api.saveOwn({ opt: { volume: Infinity } }), false);
  assert.equal(state.userBytes.get(ownKey), serialized);
  assert.equal(state.calls.length, 2, 'rejected payloads must not touch persistence');
  const receipt = plain(state.api.receipt());
  assert.deepEqual(receipt.reads, [ownKey]);
  assert.deepEqual(receipt.writes, [ownKey]);
  assert.equal(receipt.successfulWrites, 1);
  assertUserBytesPreserved(state);
  assertGlobalsPreserved(state);

  const reopened = await boot(activeUrl, serialized);
  assert.equal(reopened.api.receipt().ownSettingsRestored, true);
  assert.deepEqual(plain(reopened.api.ownSettings), expected);
  assert.deepEqual(reopened.calls, [['getItem', ownKey]]);
  assertUserBytesPreserved(reopened);
  assertGlobalsPreserved(reopened);
});

test('malformed or non-settings own JSON is defensive and never rewrites stored bytes', async () => {
  const malformed = [
    '{broken',
    JSON.stringify({ schemaVersion: 0, settings: { charIdx: 0 } }),
    JSON.stringify({ schemaVersion: 1, settings: null }),
    JSON.stringify({ schemaVersion: 1, settings: { actors: [] } }),
    JSON.stringify({ schemaVersion: 1, settings: { charIdx: 0 }, P: {} }),
  ];
  for (const bytes of malformed) {
    const state = await boot(activeUrl, bytes);
    assert.equal(state.api.active, true);
    assert.equal(state.api.receipt().ownSettingsRestored, false);
    assert.deepEqual(plain(state.api.ownSettings), {});
    assert.deepEqual(state.calls, [['getItem', ownKey]]);
    assert.equal(state.userBytes.get(ownKey), bytes);
    assertUserBytesPreserved(state);
    assertGlobalsPreserved(state);
  }
});

test('receipt notes are bounded in memory and do not save settings or user state', async () => {
  const state = await boot();
  for (let i = 0; i < 131; i++) state.api.note('qa-observation', { index: i });
  const receipt = plain(state.api.receipt());
  assert.equal(receipt.notesLimit, 128);
  assert.equal(receipt.notesTotal, 131);
  assert.equal(receipt.notes.length, 128);
  assert.deepEqual(receipt.notes[0], { event: 'qa-observation', detail: { index: 3 } });
  assert.deepEqual(receipt.notes.at(-1), { event: 'qa-observation', detail: { index: 130 } });
  assert.deepEqual(state.calls, [['getItem', ownKey]]);
  assert.equal(state.userBytes.has(ownKey), false);
  assertUserBytesPreserved(state);
  assertGlobalsPreserved(state);
});
