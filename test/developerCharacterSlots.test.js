import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const localCode = html.slice(html.indexOf('async function loadLocalCharacters(){'), html.indexOf('function _selectSlot(s){'));
function element() {
  return { children: [], style: {}, hidden: true, events: {}, className: '',
    set innerHTML(value) { this.markup = value; this.children = []; },
    get innerHTML() { return this.markup || ''; },
    appendChild(child) { this.children.push(child); },
    replaceChildren(...children) { this.children = children; },
    addEventListener(type, fn) { this.events[type] = fn; },
    querySelector() { return element(); },
  };
}
function lobby({ build = 'full', count = 5, development = false } = {}) {
  const els = Object.fromEntries(['charList', 'developerSaveNotice'].map(id => [id, element()]));
  let opened = 0;
  const slots = Array.from({ length: count }, (_, i) => ({ name: `character-${i}`, lv: 10, stage: 0, charIdx: 0 }));
  const ctx = vm.createContext({
    _LOBBY_BUILD: build, _testMode: true, _developerSlots: false, _localSlots: [],
    _selectedSlot: null, _selectedSlotName: null, _TL: s => s, escHtml: s => s,
    _formatLobbyStageProgress: () => '1층', CHAR_VISUALS: [{ name: '전사' }],
    _updateCharDisplay() {}, _selectSlot() {}, openVisualSelect() { opened++; },
    $: id => els[id], document: { createElement: element }, localStorage: { getItem: () => null },
    fetch: async () => ({ ok: true, json: async () => ({ ok: true, slots, development }) }),
  });
  vm.runInContext(localCode, ctx);
  return { ctx, els, opened: () => opened };
}

test('development server permits new characters beyond five without removing existing slots', async () => {
  const { ctx, els, opened } = lobby({ count: 100, development: true });
  await ctx.loadLocalCharacters();
  assert.equal(ctx._localSlots.length, 100);
  const create = els.charList.children.find(e => e.className === 'char-item-new');
  assert.equal(typeof create.events.click, 'function');
  create.events.click();
  assert.equal(opened(), 1);
  assert.equal(els.developerSaveNotice.hidden, false);
});

test('public offline mode keeps its five-slot limit without a development marker', async () => {
  const { ctx, els } = lobby();
  await ctx.loadLocalCharacters();
  const create = els.charList.children.find(e => e.className === 'char-item-new');
  assert.equal(create.events.click, undefined);
  assert.equal(els.developerSaveNotice.hidden, true);
});

test('demo remains a single fixed character even on a development server', async () => {
  const { ctx, els } = lobby({ build: 'demo', development: true, count: 100 });
  await ctx.loadLocalCharacters();
  assert.equal(els.charList.children.length, 1);
  assert.match(els.charList.children[0].innerHTML, /DEMO CHARACTER/);
  assert.equal(els.developerSaveNotice.hidden, true);
});

test('a failed list request clears development privileges and the notice', async () => {
  const { ctx, els } = lobby({ development: true });
  await ctx.loadLocalCharacters();
  assert.equal(ctx._developerSlots, true);
  ctx.fetch = async () => { throw new Error('offline'); };
  await ctx.loadLocalCharacters();
  assert.equal(ctx._developerSlots, false);
  assert.equal(els.developerSaveNotice.hidden, true);
});

for (const [file, expected] of [['server.cjs', true], ['node-main.js', undefined]]) {
  test(`${file} identifies its own save scope without shipping development privileges`, async () => {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    const start = source.indexOf("if (pathname === '/api/slots'");
    const end = source.indexOf("if (pathname === '/api/save'", start);
    let result;
    const ctx = vm.createContext({ pathname: '/api/slots', req: { method: 'GET' }, res: {},
      SAVE_DIR: 'isolated', path, fs: { readdirSync: () => [] },
      sendJSON(_res, status, data) { assert.equal(status, 200); result = data; },
    });
    await vm.runInContext(`(async()=>{${source.slice(start, end)}})()`, ctx);
    assert.equal(result.development, expected);
    assert.equal(result.slots.length, 0);
  });
}
