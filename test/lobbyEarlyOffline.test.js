import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].find(match=>match[1].includes('async function _goLobby'))[1];

for(const legacy of [false,true])test('early demo offline startup initializes real save sync with '+(legacy?'a legacy save':'empty storage'),async()=>{
  const elements=new Map(),warnings=[];
  const oldSave={ts:1793567000000,player:{lv:46},game:{stage:12,kills:1795}};
  const storage=new Map(legacy?[['hellsave_demo',JSON.stringify(oldSave)]]:[]);
  function element(){
    return {children:[],style:{},hidden:true,classList:{add(){},remove(){},contains(){return false;}},
      replaceChildren(...children){this.children=children;},appendChild(child){this.children.push(child);},
      addEventListener(){},querySelector(){return element();}};
  }
  const ctx=vm.createContext({
    console:{warn(...args){warnings.push(args.map(String).join(' '));}},
    document:{createElement:element,querySelector(){return null;}},
    $:id=>id==='_langPop'?null:(elements.has(id)?elements.get(id):(elements.set(id,element()),elements.get(id))),
    _LOBBY_BUILD:'demo',_testMode:false,_cinPreview:false,_qp:new URLSearchParams(),
    location:{hostname:'127.0.0.1'},sb:null,currentUser:null,_characterLoadSeq:0,
    _developerSlots:false,_localSlots:[],_selectedSlot:null,_selectedSlotName:null,
    _LOBBY_VER_LABEL:{},_LOBBY_VER_LIMITS:{},_LOBBY_VER:'qa',_emberIv:null,
    CHAR_VISUALS:[{bust:'fixture.png'}],escHtml:value=>value,_formatLobbyStageProgress:()=> 'QA stage',
    _lobbyDemoCharacterName:()=> 'QA전사',_TL:value=>value,
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)},
  });
  for(const name of ['showLoading','stopWorldIntro','stopCinBgm','stopMediaVideo','startBGM',
    'clearInterval','hideLoading','_preloadLoadingImgs','_updateCharDisplay','_addLobbyCardControl','_bindLobbyListNavigation'])ctx[name]=()=>{};
  const chunks=['async function _goLobby(', 'function _enterOffline(){',
    'async function loadLocalCharacters(){', 'function _renderSlotList(){'].map(from=>{
      const start=script.indexOf(from);assert.ok(start>=0,from);
      const end=script.indexOf('\n}\n',start);assert.ok(end>start,from+' closing boundary');
      return {start,code:script.slice(start,end+2)};
    });
  const demo=script.indexOf('const _DEMO_SLOT_PREFIX='),demoEnd=script.indexOf('async function loadLocalCharacters(){',demo);
  assert.ok(demo>=0&&demoEnd>demo);chunks.push({start:demo,code:script.slice(demo,demoEnd)});
  const state=script.match(/let _slotScrollIdx=0;[^\n]*/);assert.ok(state);chunks.push({start:state.index,code:state[0]});
  const init=script.indexOf('(async()=>{',script.indexOf('// ═══ Init'));
  const end=script.indexOf('})();',init);assert.ok(init>=0&&end>init);
  chunks.push({start:init,code:script.slice(init,end+5).replace('if(!sb){_enterOffline();return}','if(!sb){globalThis.earlyLobby=_enterOffline();return}')});
  vm.runInContext(chunks.sort((a,b)=>a.start-b.start).map(chunk=>chunk.code).join('\n'),ctx);
  assert.ok(ctx.earlyLobby,'the actual startup fallback must execute');
  await ctx.earlyLobby;
  assert.deepEqual(warnings,[],'the real save sync helper must not access an uninitialized state');
  assert.equal(vm.runInContext('_slotScrollIdx',ctx),0);
  assert.equal(elements.get('lobby').style.display,'flex');
  assert.equal(elements.get('charList').children.length,2);
  assert.equal(ctx._localSlots.length,legacy?1:0);
  if(legacy){
    assert.deepEqual(JSON.parse(storage.get('hellsave_demo_0')),{...oldSave,name:'QA전사',charIdx:0});
    assert.equal(storage.has('hellsave_demo'),false,'existing migration rules still transfer all progress');
  }else assert.equal(storage.size,0,'empty startup must not write a save');
});