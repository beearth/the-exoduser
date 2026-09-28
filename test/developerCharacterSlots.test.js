import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const localCode = html.slice(html.indexOf('async function loadLocalCharacters(){'), html.indexOf('function _selectSlot(s){'));
function element() {
  return { children: [], style: {}, hidden: true, events: {}, className: '', classList: {add(){},remove(){},toggle(){}},
    set innerHTML(value) { this.markup = value; this.children = []; },
    get innerHTML() { return this.markup || ''; },
    appendChild(child) { this.children.push(child); },
    replaceChildren(...children) { this.children = children; },
    addEventListener(type, fn) { this.events[type] = fn; },
    querySelector() { return element(); },
  };
}
function lobby({ build = 'full', count = 5, development = false, demoSave = null } = {}) {
  const els = Object.fromEntries(['charList', 'developerSaveNotice'].map(id => [id, element()]));
  let opened = 0, displayed = null;
  const slots = Array.from({ length: count }, (_, i) => ({ name: `character-${i}`, lv: 10, stage: 0, charIdx: 0 }));
  const ctx = vm.createContext({
    _LOBBY_BUILD: build, _testMode: true, _developerSlots: false, _localSlots: [],
    _characterLoadSeq: 0, _selectedSlot: null, _selectedSlotName: null, _lobbyLang: () => 'ko', _TL: s => s, escHtml: s => s,
    _formatLobbyStageProgress: () => '1층', CHAR_VISUALS: [{ name: '전사' }],
    _updateCharDisplay(slot) { displayed=slot||null; }, _selectSlot() {}, _addLobbyCardControl() {}, _bindLobbyListNavigation() {}, openVisualSelect() { opened++; },
    $: id => els[id], document: { createElement: element }, localStorage: { getItem: key => key === 'hellsave_demo' ? demoSave : null },
    fetch: async () => ({ ok: true, json: async () => ({ ok: true, slots, development }) }),
  });
  const ancestorCode=['_lobbyAncestorName','_lobbyAncestorCaption'].map(name=>html.match(new RegExp('function '+name+'[^\\n]+'))[0]).join('\n');
  vm.runInContext(ancestorCode+'\n'+localCode, ctx);
  return { ctx, els, opened: () => opened, displayed: () => displayed };
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
  assert.match(els.charList.children[0].innerHTML, /묘왕 바르칸/);
  assert.equal(els.developerSaveNotice.hidden, true);
});

test('demo lobby shows the level and progress from its autosave', async () => {
  const demoSave = JSON.stringify({ ts: 1790522600000, player: { lv: 46 }, game: { stage: 0, kills: 1795 } });
  const { ctx, els } = lobby({ build: 'demo', demoSave });
  await ctx.loadLocalCharacters();
  assert.equal(els.charList.children.length, 1);
  assert.match(els.charList.children[0].innerHTML, /Lv\.46/);
  assert.match(els.charList.children[0].innerHTML, /1,795/);
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

for(const fallback of [false,true])test('demo selection remains displayed after '+(fallback?'storage fallback':'server list')+' completes',async()=>{
 const {ctx,displayed}=lobby({build:'demo'});if(fallback)ctx.fetch=async()=>{throw new Error('offline')};
 await ctx.loadLocalCharacters();assert.equal(ctx._selectedSlot,'demo');assert.equal(ctx._selectedSlotName,'demo');assert.equal(displayed()?.name,'DEMO CHARACTER');assert.equal(displayed()?.charIdx,0);
});
test('full offline list leaves entry unselected after loading',async()=>{
 const {ctx,displayed}=lobby({build:'full'});ctx._selectedSlot='stale';ctx._selectedSlotName='stale';ctx._updateCharDisplay({name:'stale'});
 await ctx.loadLocalCharacters();assert.equal(ctx._selectedSlot,null);assert.equal(ctx._selectedSlotName,null);assert.equal(displayed(),null);
});

test('local wheel listener cannot replace an online list after switching modes',async()=>{
 const {ctx,els}=lobby({count:3});await ctx.loadLocalCharacters();
 ctx._onlineChars=Array.from({length:3},(_,i)=>({id:'online-'+i,name:'online-'+i,data:{}}));ctx._onlineScrollIdx=0;
 vm.runInContext(html.slice(html.indexOf('function _renderOnlineSlots(){'),html.indexOf('// ── 캐릭터 외형 목록')),ctx);ctx._renderOnlineSlots();
 const vp=els.charList.children.find(e=>e.className==='char-scroll-vp');const event={deltaY:120,preventDefault(){this.prevented=true}};
 vp.events.wheel(event);if(els.charList.events.wheel)els.charList.events.wheel(event);
 const visible=els.charList.children.find(e=>e.className==='char-scroll-vp').children[0].children;
 assert.ok(visible.every(e=>e.innerHTML.includes('online-')));assert.equal(ctx._onlineScrollIdx,1);assert.equal(vm.runInContext('_slotScrollIdx',ctx),0);
});
test('local wheel is attached only to the current viewport and keeps boundary scrolling free',async()=>{
 const {ctx,els}=lobby({count:3});await ctx.loadLocalCharacters();
 assert.equal(els.charList.events.wheel,undefined);
 const wheel=()=>els.charList.children.find(e=>e.className==='char-scroll-vp').events.wheel;
 let prevented=0;wheel()({deltaY:120,preventDefault(){prevented++}});assert.equal(vm.runInContext('_slotScrollIdx',ctx),1);assert.equal(prevented,1);
 wheel()({deltaY:120,preventDefault(){prevented++}});assert.equal(prevented,1);wheel()({deltaY:-120,preventDefault(){prevented++}});assert.equal(vm.runInContext('_slotScrollIdx',ctx),0);assert.equal(prevented,2);
});

for(const oldResult of ['success','fetch failure','JSON failure'])test('an older local '+oldResult+' cannot overwrite a newer list',async()=>{
 const {ctx,els}=lobby();const pending=[];ctx.fetch=()=>new Promise((resolve,reject)=>pending.push({resolve,reject}));
 const first=ctx.loadLocalCharacters(),second=ctx.loadLocalCharacters();
 pending[1].resolve({ok:true,json:async()=>({ok:true,development:true,slots:[{name:'latest',lv:12}]})});await second;
 ctx._selectedSlot='latest';ctx._selectedSlotName='latest';ctx._updateCharDisplay({name:'latest'});
 if(oldResult==='success')pending[0].resolve({ok:true,json:async()=>({ok:true,development:false,slots:[{name:'old',lv:1}]})});
 else if(oldResult==='fetch failure')pending[0].reject(new Error('old network error'));
 else pending[0].resolve({ok:true,json:async()=>{throw new Error('old JSON error')}});
 await first;assert.equal(ctx._localSlots[0]?.name,'latest');assert.equal(ctx._developerSlots,true);assert.equal(els.developerSaveNotice.hidden,false);
 const visible=els.charList.children.find(e=>e.className==='char-scroll-vp').children[0].children;assert.ok(visible[0].innerHTML.includes('latest'));assert.equal(ctx._selectedSlot,'latest');
});
test('response order is checked after JSON parsing completes',async()=>{
 const {ctx}=lobby();let resolveJSON;ctx.fetch=async()=>({ok:true,json:()=>new Promise(resolve=>{resolveJSON=resolve})});const first=ctx.loadLocalCharacters();
 await new Promise(resolve=>setImmediate(resolve));ctx.fetch=async()=>({ok:true,json:async()=>({ok:true,slots:[{name:'latest'}]})});await ctx.loadLocalCharacters();
 resolveJSON({ok:true,slots:[{name:'old'}]});await first;assert.equal(ctx._localSlots[0].name,'latest');
});

for(const direction of ['local to online','online to local'])for(const outcome of ['success','failure'])test(direction+' ignores an old '+outcome+' response',async()=>{
 const {ctx,els}=lobby({count:2});ctx.currentUser={id:'owner'};ctx._swapLobbyBg=()=>{};
 vm.runInContext(html.slice(html.indexOf('async function loadCharacters(){'),html.indexOf('function _addLobbyCardControl('))+html.slice(html.indexOf('function _renderOnlineSlots(){'),html.indexOf('// ── 캐릭터 외형 목록')),ctx);
 let finishLocal,finishOnline;ctx.fetch=()=>new Promise((resolve,reject)=>{finishLocal={resolve,reject}});
 ctx.sb={from:()=>({select:()=>({eq:()=>({order:()=>new Promise(resolve=>{finishOnline=resolve})})})})};
 const first=direction==='local to online'?ctx.loadLocalCharacters():ctx.loadCharacters();const second=direction==='local to online'?ctx.loadCharacters():ctx.loadLocalCharacters();
 const online=()=>finishOnline({data:[{id:'online',name:'online',data:{}}]});const local=()=>finishLocal.resolve({ok:true,json:async()=>({ok:true,slots:[{name:'local'}],development:true})});
 if(direction==='local to online')online();else local();await second;
 const latest=direction==='local to online'?'online':'local';ctx._selectedSlot=latest;ctx._selectedSlotName=latest;const before=els.charList.children;
 if(direction==='local to online'){if(outcome==='success')local();else finishLocal.reject(new Error('old local failure'))}
 else finishOnline(outcome==='success'?{data:[{id:'old',name:'old',data:{}}]}:{error:{message:'old online failure'}});await first;
 assert.equal(els.charList.children,before);assert.equal(ctx._selectedSlot,latest);assert.equal(ctx._developerSlots,direction==='online to local');assert.equal(els.developerSaveNotice.hidden,direction==='local to online');
});

for(const screen of ['_goLogin','_goCinematic'])for(const mode of ['local','online'])for(const outcome of ['success','failure'])test(screen+' discards a pending '+mode+' '+outcome,async()=>{
 const {ctx,els,displayed}=lobby({build:mode==='local'?'demo':'full'});
 ctx.$=id=>id==='_langPop'?null:(els[id]||(els[id]=element()));ctx.document.querySelector=()=>element();ctx.window={};ctx._cinPreview=false;ctx._emberIv=null;ctx.currentUser={id:'owner'};
 for(const name of ['clearInterval','stopWorldIntro','stopCinBgm','stopMediaVideo','startBGM','hideLoading','_clearVidTimers','stopLobbyBgm','playCinematic','_swapLobbyBg'])ctx[name]=()=>{};
 ctx._renderOnlineSlots=()=>els.charList.replaceChildren(element());
 vm.runInContext(html.slice(html.indexOf('function _goLogin('),html.indexOf('async function _goLobby('))+html.slice(html.indexOf('async function loadCharacters(){'),html.indexOf('function _addLobbyCardControl(')),ctx);
 let finish;ctx.fetch=()=>new Promise((resolve,reject)=>finish={resolve,reject});ctx.sb={from:()=>({select:()=>({eq:()=>({order:()=>new Promise(resolve=>finish=resolve)})})})};
 const pending=mode==='local'?ctx.loadLocalCharacters():ctx.loadCharacters();ctx[screen]();const before=els.charList.children;
 if(mode==='local'){if(outcome==='success')finish.resolve({ok:true,json:async()=>({ok:true,slots:[]})});else finish.reject(Error('old failure'))}
 else finish(outcome==='success'?{data:[{id:'old',name:'old',data:{}}]}:{error:{message:'old failure'}});await pending;
 assert.equal(els.charList.children,before);assert.equal(displayed(),null);assert.equal(ctx._selectedSlot,null);assert.equal(els.lobby.style.display,'none');
});

for(const screen of ['_goLogin','_goCinematic'])test(screen+' clears the selected character and unloads its video',()=>{
 const {ctx,els}=lobby();ctx.$=id=>id==='_langPop'?null:(els[id]||(els[id]=element()));ctx.document.querySelector=()=>element();ctx.window={};ctx._cinPreview=false;ctx._emberIv=null;
 for(const name of ['clearInterval','stopWorldIntro','stopCinBgm','stopMediaVideo','startBGM','hideLoading','_clearVidTimers','stopLobbyBgm','playCinematic','_swapLobbyBg'])ctx[name]=()=>{};
 const preview=ctx.$('lobbyCharPreview');Object.assign(preview,{paused:true,getAttribute(key){return this[key]},removeAttribute(key){delete this[key]},pause(){this.paused=true},play(){this.paused=false;return Promise.resolve()},load(){}});
 const still=ctx.$('lobbyCharKeyart');still.removeAttribute=key=>{delete still[key]};ctx.CHAR_VISUALS=[{job:'전사',idleVid:'warrior.mp4',poster:'warrior.jpg'}];
 vm.runInContext(html.slice(html.indexOf('function _goLogin('),html.indexOf('async function _goLobby('))+html.slice(html.indexOf('function _updateCharDisplay(s){'),html.indexOf('// 로비 배경 preload')),ctx);
 ctx._selectedSlot='chosen';ctx._selectedSlotName='chosen';ctx._updateCharDisplay({name:'chosen',charIdx:0});
 // Seed leftover media explicitly; selection may use the shared lobby artwork.
 preview.src='warrior.mp4';preview.poster='warrior.jpg';preview.paused=false;
 ctx[screen]();assert.equal(preview.paused,true);assert.equal(preview.src,undefined);assert.equal(preview.poster,undefined);assert.equal(ctx._selectedCharDisplay,null);assert.equal(ctx._selectedSlot,null);assert.equal(ctx._selectedSlotName,null);assert.equal(els.enterGameBtn.disabled,true);
});
