import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].find(match=>match[1].includes('async function _goLobby'))[1];


test('early demo offline fallback can render before the rest of the lobby script finishes',async()=>{
  const elements=new Map();
  function element(){
    return {children:[],style:{},hidden:true,classList:{add(){},remove(){},contains(){return false;}},
      replaceChildren(...children){this.children=children;},appendChild(child){this.children.push(child);},
      addEventListener(){},querySelector(){return null;}};
  }
  const ctx=vm.createContext({
    document:{createElement:element,querySelector(){return null;}},
    $:id=>id==='_langPop'?null:(elements.has(id)?elements.get(id):(elements.set(id,element()),elements.get(id))),
    _LOBBY_BUILD:'demo',_testMode:false,_cinPreview:false,_qp:new URLSearchParams(),
    location:{hostname:'127.0.0.1'},sb:null,currentUser:null,_characterLoadSeq:0,
    _developerSlots:false,_localSlots:[],_selectedSlot:null,_selectedSlotName:null,
    _LOBBY_VER_LABEL:{},_LOBBY_VER_LIMITS:{},_LOBBY_VER:'qa',_emberIv:null,
    _TL:value=>value,localStorage:{getItem(){return null;}},
  });
  for(const name of ['showLoading','stopWorldIntro','stopCinBgm','stopMediaVideo','startBGM',
    'clearInterval','hideLoading','_preloadLoadingImgs','_demoSyncActiveSave',
    '_updateCharDisplay','_addLobbyCardControl','_bindLobbyListNavigation'])ctx[name]=()=>{};
  const chunks=[
    ['async function _goLobby(', '// ═══ 오프라인 모드 진입'],
    ['function _enterOffline(){', '// ═══ Init'],
    ['async function loadLocalCharacters(){', '// 슬롯 스크롤 상태'],
    ['function _renderSlotList(){', 'function _selectSlot(s){'],
  ].map(([from,to])=>{const start=script.indexOf(from);assert.ok(start>=0,from);const end=script.indexOf(to,start);assert.ok(end>start,to);return {start,code:script.slice(start,end)};});
  const state=script.match(/let _slotScrollIdx=0;[^\n]*/);assert.ok(state);
  chunks.push({start:state.index,code:state[0]});
  const init=script.indexOf('(async()=>{',script.indexOf('// ═══ Init'));
  const end=script.indexOf('})();',init);assert.ok(init>=0&&end>init);
  chunks.push({start:init,code:script.slice(init,end+5).replace('if(!sb){_enterOffline();return}','if(!sb){globalThis.earlyLobby=_enterOffline();return}')});
  const parts=chunks.sort((a,b)=>a.start-b.start).map(chunk=>chunk.code);
  vm.runInContext(parts.join('\n'),ctx);
  assert.ok(ctx.earlyLobby,'the actual startup fallback must execute');
  await ctx.earlyLobby;
  assert.equal(vm.runInContext('_slotScrollIdx',ctx),0);
  assert.equal(elements.get('lobby').style.display,'flex');
  assert.equal(elements.get('charList').children.length,2,'viewport and create card render');
  assert.equal(ctx._localSlots.length,0);
});