import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {extract,fixture,sha} from './ai-enhance-persistence-harness.mjs';

const before=JSON.parse(fs.readFileSync(new URL('./unload-save-boundary-before.json',import.meta.url),'utf8'));
const rows=[];
async function setup(input,{route=0,success=true,fallback=false,busy=false,storageFails=false}={}){
  const base=fixture(input,{route,success});await base.initial();await base.advance(0);
  const writes=new Map(),calls=[];let handler=null,ack=0,serverPersist=0;
  const context=base.context;
  context.window.addEventListener=(type,callback)=>{assert.equal(type,'beforeunload');handler=callback;};
  context.localStorage={setItem(key,value){if(storageFails)throw Error('quota fixture');writes.set(key,value);}};
  Object.assign(context,{_SHARED_MATS_KEY:'shared-fixture',_matsSavedVal:15000,_isLocalServer:true,_sharedStorageDirty:false});
  context.fetch=(url,options)=>{calls.push({kind:'fetch-invoked',url,options:JSON.parse(JSON.stringify(options))});return new Promise(()=>{});};
  context.sb={from(table){return {update(data){const packet=JSON.parse(JSON.stringify(data));return {eq(key,id){return {select(fields){calls.push({kind:'sdk-select-invoked',table,key,id,fields,packet});return new Promise(()=>{});}};}};}};}};
  vm.runInContext(input.shared+'\n'+input.unload,context);
  context._serverOk=fallback?false:null;
  return {...base,writes,calls,
    unload(){assert(handler);return handler();},
    setBusy(){context._saving=busy;},
    boundary:()=>({ack,serverPersist,wireDelivery:'not-observed',clientCalls:calls.length,synchronousWrites:[...writes.keys()]})};
}
for(const input of before.games)for(const route of [0,1,2,3,4])for(const success of [true,false]){
  test(`${input.file} route${route} ${success?'성공':'실패'} AI→499ms→unload 즉시경계`,async()=>{
    const state=await setup(input,{route,success});state.context._doAiEnhance();await state.advance(499);
    assert.equal(state.state().mats,0);assert.equal(state.state().enh,success?1:0);
    const lastSave=state.context._lastSaveTime;const returned=state.unload();assert.equal(returned,undefined);
    assert.equal(state.boundary().ack,0);assert.equal(state.boundary().serverPersist,0);
    if([0,3].includes(route)){
      assert.equal(state.calls.length,2);assert.equal(state.writes.get('shared-fixture'),'0');
      assert.equal(state.context._lastSaveTime,lastSave);assert.equal(state.state().snapshot.inv.equipped.weapon.enh,0);
      if(route===3){const request=state.calls.find(call=>call.url==='/api/save');assert(request);assert.equal(JSON.parse(request.options.body).data.inv.equipped.weapon.enh,success?1:0);assert.equal(request.options.keepalive,undefined);}
      else assert.equal(state.calls.find(call=>call.kind==='sdk-select-invoked').packet.data.inv.equipped.weapon.enh,success?1:0);
    }else{
      const key=route===1?'demo500':route===2?'demo':'web';const saved=JSON.parse(state.writes.get(key));
      assert.equal(saved.inv.equipped.weapon.enh,success?1:0);assert.equal(saved.game.mats,0);
      assert.equal(state.context._lastSaveTime,state.state().time);
      assert.equal(state.writes.has('shared-fixture'),route===4);assert.equal(state.calls.length,route===4?1:0);
    }
    rows.push({file:input.file,route,success,time:state.state().time,returned:'undefined',...state.boundary(),calls:state.calls.map(call=>({kind:call.kind,url:call.url,keepalive:call.options?.keepalive??null}))});
  });
}
for(const input of before.games){
  test(`${input.file} 로컬 기확인실패 동기폴백·storage예외·미준비·진행중`,async()=>{
    const fallback=await setup(input,{route:3,fallback:true});fallback.context._doAiEnhance();await fallback.advance(499);fallback.unload();
    assert.equal(JSON.parse(fallback.writes.get('hellsave_fixture')).inv.equipped.weapon.enh,1);
    assert.equal(fallback.calls.filter(call=>call.url==='/api/save').length,0);
    for(const route of [0,3,4]){const busy=await setup(input,{route,busy:true});busy.context._doAiEnhance();await busy.advance(499);busy.setBusy();busy.unload();assert.equal(busy.calls.length,0);assert.equal(busy.writes.size,0);}
    const unavailable=await setup(input);unavailable.context._dbReady=false;unavailable.unload();assert.equal(unavailable.calls.length,0);
    const denied=await setup(input,{route:4,storageFails:true});denied.context._doAiEnhance();await denied.advance(499);denied.unload();assert.equal(denied.writes.size,0);assert.equal(denied.context._lastSaveTime,100000);
  });
}
for(const server of before.servers){
  test(`${server.file} 실제 서버분기: body완료→write-return→ACK구분`,async()=>{
    const events=[];let finishBody;
    const body=new Promise(resolve=>{finishBody=resolve;});
    const run=new Function('readBody','sanitizeSlot','fs','path','SAVE_DIR','sendJSON','req','res','return (async()=>{const pathname="/api/save";'+server.code+'})();');
    const args=[()=>body,slot=>slot,{writeFileSync(path,data){events.push({stage:'server-write-return',path,data});}},{join:(...parts)=>parts.join('/')},'memory',()=>{events.push({stage:'server-ack-generated'});},{method:'POST'},{}];
    const pending=run(...args);assert.equal(events.length,0);
    finishBody({slot:'fixture',data:{inv:{equipped:{weapon:{enh:1}}}}});await pending;
    assert.deepEqual(events.map(event=>event.stage),['server-write-return','server-ack-generated']);
    const failed=[...args];failed[0]=async()=>({slot:'fixture',data:{}});failed[2]={writeFileSync(){throw Error('write fixture');}};
    const count=events.length;await assert.rejects(run(...failed),/write fixture/);assert.equal(events.length,count);
    rows.push({server:server.file,deliveredRequestScenarioOnly:true,events:events.map(event=>event.stage),actualDiskWritten:false,clientAckObserved:false});
  });
}
test('함수SHA불변·실행기록',()=>{
  for(const input of before.games){const actual=extract(input.file);for(const [key,value] of Object.entries(actual.hashes))assert.equal(value,input.hashes[key]);const source=fs.readFileSync(new URL('../../../'+input.file,import.meta.url),'utf8');assert(source.includes(input.unload));for(const line of input.shared.split('\n'))assert(source.includes(line));}
  for(const server of before.servers){const source=fs.readFileSync(new URL('../../../'+server.file,import.meta.url),'utf8');assert(source.includes(server.code));assert.equal(sha(server.code),server.sha256);}
  fs.writeFileSync(new URL('./unload-save-boundary-evidence.json',import.meta.url),JSON.stringify({completedAt:new Date().toISOString(),hashes:before.games.map(({file,hashes})=>({file,hashes})),servers:before.servers.map(({file,sha256})=>({file,sha256})),rows,limits:'unload 콜백 호출만; 네트워크promise 미완료 고정/ack0/자동서버persist0. 별도서버분기검사는 전달된요청가정+메모리fs이며 실제디스크/브라우저미검수'},null,2)+'\n');
});
