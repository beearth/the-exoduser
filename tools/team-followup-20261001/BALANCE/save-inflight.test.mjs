import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fixture,extract,sha} from './ai-enhance-persistence-harness.mjs';
import {saveNowCandidate,candidateSave} from './save-inflight-candidate.mjs';

const inputs=JSON.parse(fs.readFileSync(new URL('./save-inflight-before.json',import.meta.url),'utf8'));
const rows=[];
const clone=value=>JSON.parse(JSON.stringify(value));
async function setup(input,{route=0,candidate=true,success=true,fail=false}={}){
  const base=fixture(input,{route,success});await base.initial();
  const context=base.context;
  vm.runInContext(input.regions.force,context);
  if(candidate)vm.runInContext(saveNowCandidate+'\n'+candidateSave(input.regions.saves[route]),context);
  let saved=base.state().snapshot;
  const sends=[],waiting=[];
  const send=(data,id)=>{
    const packet=clone(data);sends.push({packet,id,time:base.state().time});
    return new Promise(resolve=>waiting.push(()=>{if(!fail)saved=clone(packet);resolve(!fail);}));
  };
  context.sb={from(){return {update(value){const packet=clone(value.data);return {eq(key,id){return {async select(){const ok=await send(packet,id);return {data:ok?[{id}]:null,error:ok?null:{message:'fixture failure'}};}};}};}};}};
  context.fetch=async(url,options)=>{assert.equal(url,'/api/save');const request=JSON.parse(options.body);const ok=await send(request.data,request.slot);return {ok:true,json:async()=>({ok})};};
  return {...base,sends,waiting,
    async release(){assert(waiting.length);waiting.shift()();await base.advance(0);},
    saved:()=>clone(saved),
    restore(){assert.equal(context.dbRestore(clone(saved)),true);return {enh:context.INV.equipped.weapon.enh,mats:context.G.mats};}};
}

for(const input of inputs)for(const route of [0,3])for(const success of [true,false])for(const candidate of [false,true]){
  test(`${input.file} route${route} ${success?'성공':'실패'} ${candidate?'후보':'원본'} held→500ms→완료`,async()=>{
    const state=await setup(input,{route,candidate,success});state.context.dbSave();assert.equal(state.sends.length,1);
    state.context._doAiEnhance();assert.equal(state.state().mats,0);assert.equal(state.state().enh,success?1:0);
    await state.advance(500);assert.equal(state.sends.length,1);assert.equal(state.sends[0].packet.inv.equipped.weapon.enh,0);
    await state.release();await state.advance(499);assert.equal(state.sends.length,1);
    await state.advance(1);assert.equal(state.sends.length,candidate?2:1);
    if(candidate){assert.equal(state.sends[1].packet.inv.equipped.weapon.enh,success?1:0);await state.release();}
    const restored=state.restore();assert.deepEqual(restored,{enh:candidate&&success?1:0,mats:candidate?0:15000});
    rows.push({file:input.file,route,success,candidate,sends:state.sends.map(entry=>({id:entry.id,time:entry.time,enh:entry.packet.inv.equipped.weapon.enh})),restored});
  });
}

for(const input of inputs){
  test(`${input.file} 중복debounce/pending 요청은 재전송1회`,async()=>{
    const state=await setup(input);state.context.dbSave();state.context._doAiEnhance();state.context.dbSaveNow();state.context.dbSaveNow();
    await state.advance(500);assert(state.context.dbSaveNow.pending);state.context.dbSaveNow();await state.advance(500);
    await state.release();await state.advance(500);assert.equal(state.sends.length,2);await state.release();await state.advance(5000);assert.equal(state.sends.length,2);
  });
  test(`${input.file} 첫실패·재시도실패도 무한반복0`,async()=>{
    for(const route of [0,3]){
    const state=await setup(input,{fail:true,route});state.context.dbSave();state.context._doAiEnhance();await state.advance(500);await state.release();await state.advance(500);
    assert.equal(state.sends.length,2);await state.release();await state.advance(6000);assert.equal(state.sends.length,2);assert.equal(state.context.dbSaveNow.pending,null);
    }
  });
  test(`${input.file} 캐릭터/플레이어/저장override 전환 및 DB미준비 요청폐기`,async()=>{
    for(const field of ['id','idx','player','save','ready'])for(const phase of ['before-timer','pending']){
      const state=await setup(input);state.context.dbSave();state.context._doAiEnhance();if(phase==='pending')await state.advance(500);
      if(field==='id')state.context._charId='other';
      if(field==='idx')state.context._charIdx=1;
      if(field==='player')state.context.P=clone(state.context.P);
      if(field==='save')state.context.dbSave=async()=>{throw Error('stale dispatch');};
      if(field==='ready')state.context._dbReady=false;
      if(phase==='before-timer')await state.advance(500);await state.release();await state.advance(500);assert.equal(state.sends.length,1,field+phase);
    }
  });
  test(`${input.file} force5초계약과 요청없음 불필요재시도0`,async()=>{
    const state=await setup(input);state.context.dbSaveForce();await state.advance(4999);assert.equal(state.sends.length,0);
    await state.advance(1);assert.equal(state.sends.length,1);await state.release();await state.advance(500);assert.equal(state.sends.length,1);
    state.context.dbSaveForce();await state.advance(4499);assert.equal(state.sends.length,1);await state.advance(1);assert.equal(state.sends.length,2);
    await state.release();
  });
  test(`${input.file} force 진행중 계약불변·demo/standalone 동기override`,async()=>{
    const state=await setup(input);state.context.dbSave();await state.advance(5000);state.context.dbSaveForce();assert.equal(state.context._pendingForce,true);
    await state.release();await state.advance(500);assert.equal(state.sends.length,1);assert.equal(state.context._pendingForce,false);
    for(const route of [1,2,4]){
      const demo=await setup(input,{route});demo.context._doAiEnhance();await demo.advance(500);
      assert.equal(demo.state().writes,2);assert.equal(demo.state().snapshot.inv.equipped.weapon.enh,1);assert.equal(demo.sends.length,0);
      assert.equal(candidateSave(input.regions.saves[route])===input.regions.saves[route],route!==4);
    }
  });
  test(`${input.file} no-op 강화/DB미준비는 예약0`,async()=>{
    const state=await setup(input);state.context.G.mats=0;state.context._doAiEnhance();await state.advance(500);assert.equal(state.sends.length,0);
    state.context._dbReady=false;state.context.dbSaveNow();await state.advance(500);assert.equal(state.sends.length,0);
  });
}
test('함수별원문SHA불변·실행결과기록',()=>{
  const diff=fs.readFileSync(new URL('./save-inflight-candidate.diff',import.meta.url),'utf8');
  for(const input of inputs){
    const actual=extract(input.file);const source=fs.readFileSync(new URL('../../../'+input.file,import.meta.url),'utf8');
    actual.hashes.force=sha(JSON.stringify(source.match(/^function dbSaveForce\(\)[\s\S]*?^}/m)[0]));assert.deepEqual(actual.hashes,input.hashes);
    const patch=diff.split('--- a/'+input.file+'\n+++ b/'+input.file+'\n')[1].split('--- a/')[0];
    const lines=source.split('\n'),changes=[...patch.matchAll(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@\n([\s\S]*?)(?=@@|$)/g)];assert.equal(changes.length,4);
    for(const change of changes.reverse()){
      const oldLines=change[5].trimEnd().split('\n').filter(line=>line.startsWith('-')).map(line=>line.slice(1));
      const newLines=change[5].trimEnd().split('\n').filter(line=>line.startsWith('+')).map(line=>line.slice(1));
      assert.deepEqual(lines.slice(Number(change[1])-1,Number(change[1])-1+Number(change[2])),oldLines);
      lines.splice(Number(change[1])-1,Number(change[2]),...newLines);
    }
    let expected=source.replace(input.regions.now,saveNowCandidate);
    for(const save of input.regions.saves)expected=expected.replace(save,candidateSave(save));
    assert.equal(lines.join('\n'),expected,'제출diff 실제후보 함수와 동일한 메모리 적용');
  }
  fs.writeFileSync(new URL('./save-inflight-evidence.json',import.meta.url),JSON.stringify({completedAt:new Date().toISOString(),inputs:inputs.map(({file,hashes})=>({file,hashes})),rows,limits:'가짜시계/DOM/공유sink/실제dispatch시점JSON복제후hold; 실제dbSave/dbRestore/AI호출. 서버/사용자세이브/실게임0'},null,2)+'\n');
});
