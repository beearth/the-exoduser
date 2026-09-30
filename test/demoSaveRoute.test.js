import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('demo lobby uses the browser save path even when an account session exists', async () => {
  const elements = new Map();
  const el = id => {
    if(id==='_langPop')return null;
    if (!elements.has(id)) elements.set(id, { style: {}, classList: { add() {} }, innerHTML: '', textContent: '' });
    return elements.get(id);
  };
  let localLoads = 0, onlineLoads = 0;
  const ctx = vm.createContext({
    _LOBBY_BUILD: 'demo', _LOBBY_VER_LABEL: { demo: 'DEMO' }, _LOBBY_VER_LIMITS: {}, _LOBBY_VER: 'test',
    _characterLoadSeq: 0, _testMode: false, $: el, document: { querySelector: () => el('container') },
    stopWorldIntro() {}, stopCinBgm() {}, stopMediaVideo() {}, startBGM() {},
    clearInterval() {}, _emberIv: null, hideLoading() {}, _preloadLoadingImgs() {},
    async loadLocalCharacters() { localLoads++; }, async showLobby() { onlineLoads++; },
  });
  const code = html.slice(html.indexOf('async function _goLobby('), html.indexOf('// ═══ 오프라인 모드 진입'));
  vm.runInContext(code, ctx);
  await ctx._goLobby();
  assert.equal(localLoads, 1);
  assert.equal(onlineLoads, 0);
  assert.equal(el('lobbyMode').textContent, 'OFFLINE');
});

test('demo entry URL never labels the browser-only save as a cloud character', () => {
  let destination = '';
  let activated = '';
  const ctx = vm.createContext({
    _LOBBY_BUILD: 'demo', _testMode: false, _selectedSlotName: 'account-character',
    _TL: s => s, showLoading() {}, Image: class { set src(value) {} },
    _demoActivateSlot: name => { activated = name; return true; },
    setTimeout: fn => fn(), window: { location: { set href(value) { destination = value; } } },
  });
  const code = html.slice(html.indexOf('function showCharGate('), html.indexOf('// ═══ 펫 말풍선 시스템'));
  vm.runInContext(code, ctx);
  ctx.showCharGate('account-uuid');
  assert.equal(activated, 'account-uuid');
  assert.equal(destination, 'game.html?test=1&slot=demo&demo=1');
});

function loadingLobby(offline){
 const nodes=new Map(),pending=[];let hidden=0,preloads=0,visible=false;
 const make=()=>({style:{},children:[],classList:{add(){}},replaceChildren(...children){this.children=children}});const el=id=>{if(id==='_langPop')return null;if(!nodes.has(id))nodes.set(id,make());return nodes.get(id)};
 const ctx=vm.createContext({_LOBBY_BUILD:'full',_LOBBY_VER_LABEL:{},_LOBBY_VER_LIMITS:{},_LOBBY_VER:'test',_testMode:offline,_characterLoadSeq:0,currentUser:{id:'owner',email:'test'},$:el,document:{querySelector:()=>el('container'),createElement:make},
 _TL:s=>s,stopWorldIntro(){},stopCinBgm(){},stopMediaVideo(){},startBGM(){},clearInterval(){},_emberIv:null,showLoading(){visible=true},hideLoading(){hidden++;visible=false},_preloadLoadingImgs(){preloads++},
 loadLocalCharacters:()=>load(),loadCharacters:()=>load()});
 function load(){ctx._characterLoadSeq++;return new Promise(resolve=>pending.push(resolve))}
 vm.runInContext(html.slice(html.indexOf('async function _goLobby('),html.indexOf('// ═══ 오프라인 모드 진입'))+html.slice(html.indexOf('async function showLobby('),html.indexOf('async function loadCharacters(){')),ctx);
 return{ctx,el,pending,state:()=>({hidden,preloads,visible})};
}
for(const offline of [true,false]){
 test((offline?'local':'online')+' old lobby completion keeps the newer loading screen',async()=>{
  const s=loadingLobby(offline),first=s.ctx._goLobby();const second=s.ctx._goLobby();s.ctx.showLoading();s.pending[0]();await first;assert.deepEqual(s.state(),{hidden:0,preloads:0,visible:true});
  s.pending[1]();await second;assert.equal(s.state().visible,false);assert.equal(s.state().preloads,1);assert.ok(s.state().hidden>0);
 });
 test((offline?'local':'online')+' hidden lobby completion cannot close another loading screen',async()=>{
  const s=loadingLobby(offline),first=s.ctx._goLobby();s.ctx._characterLoadSeq++;s.el('lobby').style.display='none';s.ctx.showLoading();s.pending[0]();await first;assert.deepEqual(s.state(),{hidden:0,preloads:0,visible:true});
 });
 test((offline?'local':'online')+' current lobby completion closes its loading screen normally',async()=>{
  const s=loadingLobby(offline),first=s.ctx._goLobby();s.ctx.showLoading();s.pending[0]();await first;assert.equal(s.state().visible,false);assert.equal(s.state().preloads,1);assert.ok(s.state().hidden>0);
 });
}
