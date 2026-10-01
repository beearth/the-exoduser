import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {immediateDrainCandidate,candidateSave} from './immediate-drain-candidate.mjs';
import {saveNowCandidate} from './immediate-drain-prior-before.mjs';

const inputs=JSON.parse(fs.readFileSync(new URL('./immediate-drain-before.json',import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
const evidence=[];
function fixture(input,{route=0,immediate=true}={}){
  let time=100000,nextTimer=0;const timers=new Map(),sends=[],persisted=new Map(),events=[];
  const copy=value=>JSON.parse(JSON.stringify(value));
  function dispatch(packet,id){
    const snapshot=copy(packet);let release;
    const promise=new Promise(resolve=>{release=resolve;});
    sends.push({snapshot,id,time,release,acked:false,persisted:false});events.push({type:'dispatch',index:sends.length-1,time});return promise;
  }
  class ClockDate extends Date{constructor(...args){super(...(args.length?args:[time]));}static now(){return time;}}
  const context=vm.createContext({Date:ClockDate,P:{lv:1,skills:{},sp:0},G:{mats:100000},INV:{bag:[],equipped:{weapon:{enh:0}}},
    window:{},_dbReady:true,_saving:false,_pendingForce:false,_saveDebounce:null,_lastSaveTime:time,_charId:'A',_charIdx:0,
    _serverOk:true,_SLOT:'A',_LS_KEY:'web',_DEMO_LS_KEY:'demo',_D5K:'demo500',IS_ELECTRON:true,
    STATS:{},PASSIVES:{},_grit:0,QSLOTS:[],BAG_MAX:300,CRYSTAL_BAG:[],CRYSTAL_DUST:0,UPGRADES:{},POT_LV:{},SKILL_SLOTS:[],ULT_SLOT:null,
    _sanitizeCoreState(){},_passiveQueueItems:()=>[],_saveSharedMats(value){events.push({type:'shared-sink',value,time});},_flushSharedStorage(){},
    console:{error(){},warn(){}},
    setTimeout(callback,delay){const id=++nextTimer;timers.set(id,{callback,at:time+delay});return id;},clearTimeout:id=>timers.delete(id),
    localStorage:{setItem(key,value){persisted.set(key,JSON.parse(value));events.push({type:'local-sink',key,time});}},
    sb:{from(){return {update(value){const packet=copy(value.data);return {eq(key,id){return {async select(){const ok=await dispatch(packet,id);return {data:ok?[{id}]:null,error:ok?null:{message:'failure fixture'}};}};}};}};}},
    async fetch(url,options){assert.equal(url,'/api/save');const request=JSON.parse(options.body);const ok=await dispatch(request.data,request.slot);return {ok:true,json:async()=>({ok})};}
  });
  vm.runInContext((immediate?immediateDrainCandidate:saveNowCandidate)+'\n'+input.regions.force+'\n'+candidateSave(input.regions.saves[route]),context);
  const flush=async()=>{for(let turn=0;turn<20;turn++)await Promise.resolve();};
  return {context,timers,sends,persisted,events,time:()=>time,
    async advance(duration){const target=time+duration;while(true){const due=[...timers.entries()].filter(([,entry])=>entry.at<=target).sort((first,second)=>first[1].at-second[1].at)[0];if(!due)break;time=due[1].at;timers.delete(due[0]);due[1].callback();await flush();}time=target;await flush();},
    persist(index){const send=sends[index];assert(send);persisted.set(send.id,copy(send.snapshot));send.persisted=true;events.push({type:'memory-persist',index,time});},
    async ack(index,ok=true){const send=sends[index];assert(send&&!send.acked);send.acked=true;events.push({type:'ack',index,ok,time});send.release(ok);await flush();},
    mutate(enh){context.INV.equipped.weapon.enh=enh;context.G.mats=100000-enh*100;},
    async complete(index,ok=true){if(ok)this.persist(index);await this.ack(index,ok);}};
}

for(const input of inputs)for(const route of [0,3]){
  test(`${input.file} route${route} R1 원후보추가500ms→즉시후보 dispatch/ack 분리`,async()=>{
    for(const immediate of [false,true]){
      const state=fixture(input,{route,immediate});state.context.dbSave();state.mutate(1);state.context.dbSaveNow();await state.advance(500);
      assert.equal(state.sends.length,1);assert.equal(state.sends[0].snapshot.inv.equipped.weapon.enh,0);
      state.persist(0);await state.ack(0);
      assert.equal(state.sends.length,immediate?2:1);assert.equal(state.persisted.get('A').inv.equipped.weapon.enh,0);
      if(immediate){assert.equal(state.sends[1].time,100500);assert.equal(state.sends[1].acked,false);assert.equal(state.sends[1].persisted,false);}
      await state.advance(300);assert.equal(state.sends.length,immediate?2:1);
      if(!immediate)await state.advance(200);
      assert.equal(state.sends.length,2);assert.equal(state.sends[1].snapshot.inv.equipped.weapon.enh,1);
      state.persist(1);assert.equal(state.sends[1].acked,false);await state.ack(1);
      assert.equal(state.persisted.get('A').inv.equipped.weapon.enh,1);
      evidence.push({file:input.file,route,immediate,dispatchTimes:state.sends.map(send=>send.time),events:state.events,realServerPersistence:false});
    }
  });
  test(`${input.file} route${route} 2회busy·A/B교대·신규일반500ms 보존`,async()=>{
    const state=fixture(input,{route});state.context.dbSave();state.mutate(1);state.context.dbSaveNow();await state.advance(500);await state.complete(0);
    assert.equal(state.sends.length,2);state.mutate(2);state.context.dbSaveNow();await state.advance(499);assert.equal(state.context.dbSaveNow.pending,null);
    await state.advance(1);assert(state.context.dbSaveNow.pending);await state.complete(1);assert.equal(state.sends.length,3);assert.equal(state.sends[2].snapshot.inv.equipped.weapon.enh,2);
    await state.complete(2);await state.advance(5000);assert.equal(state.sends.length,3);
    state.context._charId='B';state.context._charIdx=1;state.context.P={lv:1,skills:{},sp:0};
    if(route===3){state.context._SLOT='B';vm.runInContext(candidateSave(input.regions.saves[route]),state.context);}
    state.mutate(3);state.context.dbSave();
    state.mutate(4);state.context.dbSaveNow();await state.advance(500);await state.complete(3);assert.equal(state.sends.length,5);
    assert.equal(state.sends[4].id,'B');assert.equal(state.sends[4].snapshot.inv.equipped.weapon.enh,4);await state.complete(4);
  });
  test(`${input.file} route${route} 성공/실패+pendingForce·중복drain·자체무한반복0`,async()=>{
    for(const ok of [true,false]){
    const state=fixture(input,{route});state.context._lastSaveTime=90000;state.context.dbSave();state.mutate(1);state.context.dbSaveNow();state.context.dbSaveNow();
    await state.advance(500);state.context._pendingForce=true;await state.complete(0,ok);
    assert.equal(state.sends.length,2);assert.equal(state.context._pendingForce,false);assert.equal(state.context._saving,true);
    state.context._drainPendingSaveNow();state.context._drainPendingSaveNow();assert.equal(state.sends.length,2);
    await state.complete(1,ok);await state.advance(10000);assert.equal(state.sends.length,2);assert.equal(state.context._saving,false);assert.equal(state.context.dbSaveNow.pending,null);
    }
  });
}
for(const input of inputs){
  test(`${input.file} identity/DB미준비 폐기·force5초·후속debounce 보존`,async()=>{
    for(const field of ['id','idx','player','save','ready']){
      const state=fixture(input);state.context.dbSave();state.mutate(1);state.context.dbSaveNow();await state.advance(500);
      if(field==='id')state.context._charId='B';if(field==='idx')state.context._charIdx=1;if(field==='player')state.context.P={...state.context.P};
      if(field==='save')state.context.dbSave=()=>{throw Error('stale dispatch');};if(field==='ready')state.context._dbReady=false;
      await state.complete(0);assert.equal(state.sends.length,1,field);assert.equal(state.context.dbSaveNow.pending,null);
    }
    const force=fixture(input);force.context.dbSaveForce();await force.advance(4999);assert.equal(force.sends.length,0);await force.advance(1);assert.equal(force.sends.length,1);await force.complete(0);
    const ordinary=fixture(input);ordinary.context.dbSaveNow();await ordinary.advance(499);assert.equal(ordinary.sends.length,0);await ordinary.advance(1);assert.equal(ordinary.sends.length,1);await ordinary.complete(0);
    const pending=fixture(input);pending.context.dbSave();pending.context.dbSaveNow();await pending.advance(500);pending.context.dbSaveNow();
    await pending.complete(0);assert.equal(pending.sends.length,2);assert.equal(pending.timers.size,1);await pending.advance(500);await pending.complete(1);assert.equal(pending.sends.length,3);await pending.complete(2);
  });
  test(`${input.file} 동기override·순수재귀소비경계`,async()=>{
    for(const route of [1,2,4]){const state=fixture(input,{route});state.mutate(1);state.context.dbSaveNow();await state.advance(500);assert.equal(state.sends.length,0);assert.equal(state.persisted.size,1);}
    const state=fixture(input);let calls=0;
    state.context.dbSave=()=>{calls++;state.context._drainPendingSaveNow();};
    state.context.dbSaveNow.pending={charId:'A',charIdx:0,player:state.context.P,save:state.context.dbSave};
    state.context._drainPendingSaveNow();assert.equal(calls,1);assert.equal(state.context.dbSaveNow.pending,null);
  });
}
test('원후보/소스SHA불변·결과기록',()=>{
  assert.deepEqual(fs.readFileSync(new URL('./save-inflight-candidate.mjs',import.meta.url)),fs.readFileSync(new URL('./immediate-drain-prior-before.mjs',import.meta.url)));
  const diff=fs.readFileSync(new URL('./immediate-drain-candidate.diff',import.meta.url),'utf8');
  for(const input of inputs){
    const source=fs.readFileSync(new URL('../../../'+input.file,import.meta.url),'utf8');assert(source.includes(input.regions.now));assert(source.includes(input.regions.force));for(const save of input.regions.saves)assert(source.includes(save));
    const patch=diff.split('--- a/'+input.file+'\n+++ b/'+input.file+'\n')[1].split('--- a/')[0];
    const lines=source.split('\n'),changes=[...patch.matchAll(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@\n([\s\S]*?)(?=@@|$)/g)];assert.equal(changes.length,4);
    for(const change of changes.reverse()){
      const oldLines=change[5].trimEnd().split('\n').filter(line=>line.startsWith('-')).map(line=>line.slice(1));
      const newLines=change[5].trimEnd().split('\n').filter(line=>line.startsWith('+')).map(line=>line.slice(1));
      assert.deepEqual(lines.slice(Number(change[1])-1,Number(change[1])-1+Number(change[2])),oldLines);lines.splice(Number(change[1])-1,Number(change[2]),...newLines);
    }
    let expected=source.replace(input.regions.now,immediateDrainCandidate);for(const save of input.regions.saves)expected=expected.replace(save,candidateSave(save));assert.equal(lines.join('\n'),expected);
  }
  fs.writeFileSync(new URL('./immediate-drain-evidence.json',import.meta.url),JSON.stringify({completedAt:new Date().toISOString(),sources:inputs.map(({file,hashes,regions})=>({file,hashes,rawSha256:{now:sha(regions.now),force:sha(regions.force),saves:regions.saves.map(sha)}})),priorSha256:sha(fs.readFileSync(new URL('./immediate-drain-prior-before.mjs',import.meta.url))),rows:evidence,limits:'독립메모리DOM/시계/sink; 요청snapshot·ACK·메모리persist독립. 실제서버/브라우저/unload보장0'},null,2)+'\n');
});
