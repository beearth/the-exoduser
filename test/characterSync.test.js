import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const deleteBody = html.match(/_showDelConfirm\(ch.name,async\(\)=>\{([\s\S]*?)\n        \}\);/)[1];
for (const mode of ['deleted', 'zero rows', 'denied']) {
  test(`online deletion validates the affected character: ${mode}`, async () => {
    const filters = [];
    let reloads = 0;
    const response = { data: mode === 'deleted' ? [{ id: 'hero' }] : [], error: mode === 'denied' ? { message: 'denied' } : null };
    const builder = { eq(key, value) { filters.push([key, value]); return this; }, select() { return Promise.resolve(response); }, then(resolve, reject) { return Promise.resolve(response).then(resolve, reject); } };
    const ctx = vm.createContext({ sb: { from: () => ({ delete: () => builder }) }, ch: { id: 'hero' }, currentUser: { id: 'owner' },
      _characterLoadSeq: 0, _TL: s => s, setStatus() {}, loadCharacters: async () => { reloads++; } });
    const run = vm.runInContext(`(async()=>{${deleteBody}})`, ctx);
    if (mode === 'deleted') { await run(); assert.equal(reloads, 1); }
    else await assert.rejects(run);
    assert.deepEqual(filters, [['id', 'hero'], ['user_id', 'owner']]);
  });
}
const loadCode = html.slice(html.indexOf('async function loadCharacters(){'), html.indexOf('function _renderOnlineSlots(){'));
function element() {
  return { style: {}, dataset: {}, children: [], querySelector() { return null; }, setAttribute() {}, focus() {}, prepend(child) { this.children.unshift(child); }, classList: { add() {} }, addEventListener() {},
    appendChild(child) { this.children.push(child); }, replaceChildren(...nodes) { this.children = nodes; } };
}
function lobby(query) {
  const els = Object.fromEntries(['charList', 'enterGameBtn', 'status', 'lobbyStatus'].map(id => [id, element()]));
  const ctx = vm.createContext({
    $: id => els[id], document: { createElement: element }, currentUser: { id: 'owner' },
    _characterLoadSeq: 0, _selectedSlot: 'old', _selectedSlotName: 'old', _TL: s => s,
    _updateCharDisplay() {}, _swapLobbyBg() {}, _renderOnlineSlots() {}, openVisualSelect() {},
    sb: { from: () => ({ select: () => ({ eq: () => ({ order: query }) }) }) },
  });
  vm.runInContext(loadCode + '\n_onlineChars=[{id:"old"}];', ctx);
  return { ctx, els };
}

test('empty server list clears the cached character and disables entry', async () => {
  const { ctx, els } = lobby(async () => ({ data: [], error: null }));
  await ctx.loadCharacters();
  assert.equal(vm.runInContext('_onlineChars.length', ctx), 0);
  assert.equal(els.enterGameBtn.disabled, true);
});

test('late pre-delete response cannot restore a deleted character', async () => {
  const pending = [];
  const { ctx } = lobby(() => new Promise(resolve => pending.push(resolve)));
  const first = ctx.loadCharacters();
  const second = ctx.loadCharacters();
  pending[1]({ data: [], error: null }); await second;
  pending[0]({ data: [{ id: 'deleted' }], error: null }); await first;
  assert.equal(vm.runInContext('_onlineChars.length', ctx), 0);
});

test('failed list fetch removes stale selection and reports the error', async () => {
  const { ctx, els } = lobby(async () => { throw new Error('network unavailable'); });
  await ctx.loadCharacters();
  assert.equal(vm.runInContext('_onlineChars.length', ctx), 0);
  assert.equal(els.enterGameBtn.disabled, true);
  assert.match(els.charList.children[0].textContent, /network unavailable/);
});

test('delete failures are visible in the lobby even when the creation modal is closed', () => {
  const { ctx, els } = lobby(async () => ({ data: [] }));
  vm.runInContext(html.match(/function setStatus\(m,err\)\{[^\n]+/)[0], ctx);
  ctx.setStatus('Deletion failed', true);
  assert.equal(els.lobbyStatus.textContent, 'Deletion failed');
  assert.match(els.lobbyStatus.className, /error/);
});

test('delete confirmation waits for the request and prevents duplicate submission', async () => {
  const els = Object.fromEntries(['delConfirmModal', 'delConfirmMsg', 'delConfirmYes', 'delConfirmNo'].map(id => [id, element()]));
  let finish, calls = 0;
  const errors = [];
  const ctx = vm.createContext({ $: id => els[id], document: { activeElement: null, querySelector: () => null }, _TL: s => s, setStatus: (...args) => errors.push(args) });
  const code = html.slice(html.indexOf('let _delConfirmCb=null;'), html.indexOf('// ── 가상 키보드'));
  vm.runInContext(code, ctx);
  ctx._showDelConfirm('test', () => { calls++; return new Promise((resolve, reject) => { finish = reject; }); });
  const click = els.delConfirmYes.onclick();
  assert.equal(els.delConfirmYes.disabled, true);
  assert.equal(els.delConfirmNo.disabled, true);
  assert.equal(els.delConfirmModal.style.display, 'flex');
  await els.delConfirmYes.onclick();
  assert.equal(calls, 1);
  finish(new Error('server unavailable')); await click;
  assert.match(errors.at(-1)[0], /server unavailable/);
  assert.equal(els.delConfirmYes.disabled, false);
});

test('new status starts at the top but identical messages preserve reading position',()=>{
 const {ctx,els}=lobby(async()=>({data:[]}));
 vm.runInContext(html.match(/function setStatus\(m,err\)\{[^\n]+/)[0],ctx);
 ctx.setStatus('Old message',true);
 for(const id of ['status','lobbyStatus'])els[id].scrollTop=200;
 ctx.setStatus('New message',true);
 for(const id of ['status','lobbyStatus'])assert.equal(els[id].scrollTop,0);
 for(const id of ['status','lobbyStatus'])els[id].scrollTop=100;
 ctx.setStatus('New message',true);
 for(const id of ['status','lobbyStatus'])assert.equal(els[id].scrollTop,100);
});

test('localized status follows language and cannot overwrite a later server error',()=>{
 const {ctx,els}=lobby(async()=>({data:[]}));let lang='ko';ctx._lobbyLang=()=>lang;ctx.document.getElementById=id=>els[id];
 vm.runInContext(html.match(/function setStatus\(m,err\)\{[^\n]+/)[0]+'\n'+html.match(/function _refreshStatusLanguage\(\)\{[^\n]+/)[0],ctx);
 ctx.setStatus({ko:'종료 실패',en:'Quit failed'},true);assert.equal(els.lobbyStatus.textContent,'종료 실패');
 lang='en';ctx._refreshStatusLanguage();assert.equal(els.lobbyStatus.textContent,'Quit failed');assert.match(els.lobbyStatus.className,/error/);
 lang='ko';ctx._refreshStatusLanguage();assert.equal(els.lobbyStatus.textContent,'종료 실패');
 ctx.setStatus('Server error details',true);lang='en';ctx._refreshStatusLanguage();assert.equal(els.lobbyStatus.textContent,'Server error details');
 ctx.setStatus('');ctx._refreshStatusLanguage();assert.equal(els.lobbyStatus.textContent,'');
});

test('initial status language refresh does not need the later DOM helper',()=>{
 const ctx=vm.createContext({document:{getElementById:()=>({})}});
 vm.runInContext(html.match(/function _refreshStatusLanguage\(\)\{[^\n]+/)[0],ctx);assert.doesNotThrow(()=>ctx._refreshStatusLanguage());
});
