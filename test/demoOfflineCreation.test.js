import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {parse} from 'acorn';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const functions=new Map();
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
  for(const node of parse(match[1],{ecmaVersion:'latest'}).body){
    if(node.type==='FunctionDeclaration')functions.set(node.id.name,match[1].slice(node.start,node.end));
  }
}
function setup(build='demo'){
  const storage=new Map(),nodes=new Map(),requests=[],created=[];
  const ctx=vm.createContext({console,_LOBBY_BUILD:build,_characterLoadSeq:0,_testMode:false,
    _pendingVisualIdx:0,CHAR_VISUALS:[{}],_DEMO_SLOT_PREFIX:'hellsave_demo_',
    _DEMO_ACTIVE_KEY:'hellsave_demo_active',
    $:id=>{if(!nodes.has(id))nodes.set(id,{value:id==='charName'?'배포검수':'',style:{},classList:{add(){},remove(){}},focus(){}});return nodes.get(id);},
    _lobbyLang:()=>'ko',_TL:s=>s,setStatus(){},_goLobby(){},
    _afterCharacterCreated:async name=>created.push(name),
    localStorage:{get length(){return storage.size;},key:i=>Array.from(storage.keys())[i]??null,getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
    fetch:async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>({ok:!url.startsWith('/api/load/')})};}
  });
  for(const name of ['_enterOffline','doCreateChar','_showCreateFailure','_demoSlotRead','_demoSlotIndices','_demoFirstFreeSlot','_demoSyncActiveSave','_demoActivateSlot','_lobbyDemoCharacterName']){if(functions.has(name))vm.runInContext(functions.get(name),ctx);}
  ctx._enterOffline();
  return {ctx,storage,requests,created,start:()=>nodes.get('createBtn').onclick()};
}
test('demo entry button saves a character in an activatable browser slot even with a working embedded API',async()=>{
  const s=setup();await s.start();
  assert.equal(s.ctx._demoActivateSlot('배포검수'),true,'new demo character must be available to the game entry gate');
  assert.equal(s.storage.get('hellsave_demo_active'),'0');
  assert.equal(JSON.parse(s.storage.get('hellsave_demo_0')).name,'배포검수');
  assert.equal(s.requests.length,0,'demo creation must not write to the full-game server saves');
  assert.deepEqual(s.created,['배포검수']);
});
test('demo entry button preserves an existing slot and rejects duplicate names',async()=>{
  const s=setup();const saved=JSON.stringify({name:'배포검수',player:{lv:12},charIdx:0});
  s.storage.set('hellsave_demo_0',saved);await s.start();
  assert.equal(s.storage.get('hellsave_demo_0'),saved);
  assert.equal(s.storage.size,1);assert.equal(s.created.length,0);assert.equal(s.requests.length,0);
});
test('full offline entry continues using the embedded save API',async()=>{
  const s=setup('full');await s.start();
  assert.deepEqual(s.requests.map(r=>r.url),['/api/load/'+encodeURIComponent('배포검수'),'/api/save']);
  assert.equal(JSON.parse(s.requests[1].options.body).slot,'배포검수');
  assert.equal(s.storage.size,0);assert.deepEqual(s.created,['배포검수']);
});

for(const route of ["button","direct"])test("demo "+route+" creates beyond five and preserves all prior slots",async()=>{
 const s=setup();for(let i=0;i<100;i++)s.storage.set("hellsave_demo_"+i,JSON.stringify({name:"prior"+i}));const original=Array.from(s.storage);
 await (route==="button"?s.start():s.ctx.doCreateChar("배포검수",0));
 for(const [key,value]of original)assert.equal(s.storage.get(key),value);
 assert.equal(JSON.parse(s.storage.get("hellsave_demo_100")||"null")?.name,"배포검수");assert.equal(s.ctx._demoActivateSlot("배포검수"),true);assert.equal(s.storage.get("hellsave_demo_active"),"100");
});
test("demo handles sparse high indices and reuses a gap without touching another key",async()=>{
 const s=setup();s.storage.set("hellsave_demo_0",JSON.stringify({name:"prior"}));s.storage.set("hellsave_demo_1000",JSON.stringify({name:"high",player:{lv:99}}));s.storage.set("hellsave_demo_aux","sentinel");
 await s.start();assert.equal(JSON.parse(s.storage.get("hellsave_demo_1")).name,"배포검수");assert.equal(s.ctx._demoActivateSlot("high"),true);assert.equal(s.storage.get("hellsave_demo_active"),"1000");assert.equal(s.storage.get("hellsave_demo_aux"),"sentinel");
});

test('a high slot saves and reloads gameplay without changing other characters',()=>{
 const s=setup(),other=JSON.stringify({name:'other',player:{lv:4}});s.storage.set('hellsave_demo_0',other);s.storage.set('hellsave_demo_1000',JSON.stringify({name:'high',charIdx:0,player:{lv:99}}));
 assert.equal(s.ctx._demoActivateSlot('high'),true);s.storage.set('hellsave_demo',JSON.stringify({player:{lv:100},game:{stage:7}}));s.ctx._demoSyncActiveSave();
 assert.equal(JSON.parse(s.storage.get('hellsave_demo_1000')).player.lv,100);assert.equal(s.storage.get('hellsave_demo_0'),other);assert.equal(s.storage.has('hellsave_demo_active'),false);
});
test('legacy autosave migrates to a sixth slot without overwriting the first five',()=>{
 const s=setup();for(let i=0;i<5;i++)s.storage.set('hellsave_demo_'+i,JSON.stringify({name:'old'+i}));
 s.storage.set('hellsave_demo',JSON.stringify({player:{lv:46},game:{stage:12}}));s.ctx._demoSyncActiveSave();
 assert.equal(JSON.parse(s.storage.get('hellsave_demo_5')).player.lv,46);for(let i=0;i<5;i++)assert.equal(JSON.parse(s.storage.get('hellsave_demo_'+i)).name,'old'+i);
});
test('invalid slot bytes and non-slot keys are preserved while a free index is found',async()=>{
 const s=setup();s.storage.set('hellsave_demo_0','{invalid');s.storage.set('hellsave_demo_0001','sentinel');await s.start();
 assert.equal(s.storage.get('hellsave_demo_0'),'{invalid');assert.equal(s.storage.get('hellsave_demo_0001'),'sentinel');assert.equal(JSON.parse(s.storage.get('hellsave_demo_1')).name,'배포검수');
});
