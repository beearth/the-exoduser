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
    _DEMO_ACTIVE_KEY:'hellsave_demo_active',_DEMO_SLOT_MAX:5,
    $:id=>{if(!nodes.has(id))nodes.set(id,{value:id==='charName'?'배포검수':'',style:{},classList:{add(){},remove(){}},focus(){}});return nodes.get(id);},
    _TL:s=>s,setStatus(){},_goLobby(){},
    _afterCharacterCreated:async name=>created.push(name),
    localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
    fetch:async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>({ok:!url.startsWith('/api/load/')})};}
  });
  for(const name of ['_enterOffline','_showCreateFailure','_demoSlotRead','_demoSyncActiveSave','_demoActivateSlot'])vm.runInContext(functions.get(name),ctx);
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
