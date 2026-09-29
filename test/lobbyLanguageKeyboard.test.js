import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const keyStart = source.indexOf('function _langPopKeydown(');
const popupKeys = source.slice(keyStart, source.indexOf("document.addEventListener('pointerdown'", keyStart));
const bindingStart = source.indexOf('// 마우스로 select 클릭 시에도 커스텀 팝업 사용');
const bindings = source.slice(bindingStart, source.indexOf('let _loginGpIdx', bindingStart));

function event(key, extra = {}) {
  return { key, repeat: false, isComposing: false, keyCode: 0, prevented: 0, stopped: 0,
    preventDefault() { this.prevented++; }, stopPropagation() { this.stopped++; }, ...extra };
}

function menu() {
  const calls = { commits: [], closes: 0, highlights: 0 };
  const pop = { children: Array.from({ length: 4 }, (_, i) => ({ click() { calls.commits.push(i); } })) };
  const ctx = vm.createContext({
    _langPopOpen: true, _langPopSel: { options: pop.children }, _langPopIdx: 1,
    $: () => pop,
    _closeLangPop() { calls.closes++; ctx._langPopOpen = false; },
    _hlLangPop() { calls.highlights++; },
  });
  vm.runInContext(popupKeys, ctx);
  return { ctx, calls };
}

for (const key of ['Enter', ' ']) {
  test('language popup accepts a fresh ' + JSON.stringify(key) + ' confirmation', () => {
    const { ctx, calls } = menu(), e = event(key);
    ctx._langPopKeydown(e);
    assert.deepEqual(calls.commits, [1]);
    assert.equal(e.prevented, 1);
    assert.equal(e.stopped, 1);
  });
  test('held ' + JSON.stringify(key) + ' does not confirm a language', () => {
    const { ctx, calls } = menu(), e = event(key, { repeat: true });
    ctx._langPopKeydown(e);
    assert.deepEqual(calls.commits, []);
    assert.equal(ctx._langPopOpen, true);
    assert.equal(e.prevented, 1);
    assert.equal(e.stopped, 1);
  });
}

for (const flag of [{ isComposing: true }, { keyCode: 229 }]) {
  for (const key of ['Enter', ' ', 'Escape', 'ArrowDown']) {
    test('language popup ignores IME ' + JSON.stringify(flag) + ' ' + JSON.stringify(key), () => {
      const { ctx, calls } = menu(), e = event(key, flag);
      ctx._langPopKeydown(e);
      assert.deepEqual(calls, { commits: [], closes: 0, highlights: 0 });
      assert.equal(ctx._langPopIdx, 1);
      assert.equal(e.prevented, 0);
      assert.equal(e.stopped, 0);
    });
  }
}

test('a closed language popup ignores late keyboard events', () => {
  const { ctx, calls } = menu();
  ctx._langPopOpen = false;
  for (const key of ['Enter', 'Tab', 'ArrowDown']) ctx._langPopKeydown(event(key));
  assert.deepEqual(calls, { commits: [], closes: 0, highlights: 0 });
  assert.equal(ctx._langPopIdx, 1);
});

test('missing language select cannot be confirmed or navigated', () => {
  const { ctx, calls } = menu();
  ctx._langPopSel = null;
  for (const key of ['Enter', 'ArrowDown']) assert.doesNotThrow(() => ctx._langPopKeydown(event(key)));
  assert.deepEqual(calls, { commits: [], closes: 0, highlights: 0 });
});

test('held Escape leaves the language popup open until a fresh cancellation', () => {
  const { ctx, calls } = menu(), held = event('Escape', { repeat: true });
  ctx._langPopKeydown(held);
  assert.equal(calls.closes, 0);
  assert.equal(held.prevented, 1);
  assert.equal(held.stopped, 1);
  ctx._langPopKeydown(event('Escape'));
  assert.equal(calls.closes, 1);
});

test('Tab closes the popup while retaining native focus traversal', () => {
  const { ctx, calls } = menu(), e = event('Tab');
  ctx._langPopKeydown(e);
  assert.equal(calls.closes, 1);
  assert.equal(e.prevented, 0);
  assert.equal(e.stopped, 1);
});

test('arrow auto-repeat still navigates without committing', () => {
  const { ctx, calls } = menu();
  ctx._langPopKeydown(event('ArrowDown'));
  ctx._langPopKeydown(event('ArrowDown', { repeat: true }));
  assert.equal(ctx._langPopIdx, 3);
  assert.equal(calls.highlights, 2);
  assert.deepEqual(calls.commits, []);
});

test('Home End and arrow boundaries keep language navigation in range', () => {
  const { ctx, calls } = menu();
  for (const key of ['Home', 'ArrowUp']) ctx._langPopKeydown(event(key));
  assert.equal(ctx._langPopIdx, 0);
  for (const key of ['End', 'ArrowDown']) ctx._langPopKeydown(event(key));
  assert.equal(ctx._langPopIdx, 3);
  assert.deepEqual(calls.commits, []);
});

function selectors() {
  const nodes = Object.fromEntries(['loginLangSelect', 'langSelect', 'cinLang', 'lobbyLangSelect'].map(id => [id, {
    handlers: {}, setAttribute() {}, addEventListener(type, fn) { this.handlers[type] = fn; },
  }]));
  const opened = [];
  const ctx = vm.createContext({ $: id => nodes[id], _langPopOpen: false,
    _openLangPop(select) { opened.push(select); }, _closeLangPop() {} });
  vm.runInContext(bindings, ctx);
  return { nodes, opened };
}

for (const id of ['loginLangSelect', 'langSelect', 'cinLang', 'lobbyLangSelect']) {
  test(id + ' opens on fresh keys and ignores held opening keys', () => {
    const { nodes, opened } = selectors();
    for (const key of ['Enter', ' ', 'ArrowUp', 'ArrowDown']) {
      const before = opened.length;
      nodes[id].handlers.keydown(event(key));
      assert.equal(opened.length, before + 1);
      assert.equal(opened.at(-1), nodes[id]);
      const held = event(key, { repeat: true });
      nodes[id].handlers.keydown(held);
      assert.equal(opened.length, before + 1);
      assert.equal(held.prevented, 1);
      assert.equal(held.stopped, 1);
    }
  });
}

for (const flag of [{ isComposing: true }, { keyCode: 229 }]) {
  test('all language selectors ignore IME opening keys ' + JSON.stringify(flag), () => {
    const { nodes, opened } = selectors();
    for (const select of Object.values(nodes)) select.handlers.keydown(event('Enter', flag));
    assert.equal(opened.length, 0);
  });
}
