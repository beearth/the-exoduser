import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {extract,fixture,sha} from './ai-enhance-persistence-harness.mjs';

const inputs=JSON.parse(fs.readFileSync(new URL('./ai-enhance-persistence-before.json',import.meta.url),'utf8'));
for(const input of inputs)assert.deepEqual(extract(input.file).hashes,input.hashes);
const unloadSources=JSON.parse(fs.readFileSync(new URL('./ai-enhance-persistence-unload-before.json',import.meta.url),'utf8'));
for(const input of inputs)input.unload=unloadSources.find(entry=>entry.file===input.file).code;
const syncSources=JSON.parse(fs.readFileSync(new URL('./ai-enhance-persistence-sync-before.json',import.meta.url),'utf8'));
for(const input of inputs)input.sync=syncSources.find(entry=>entry.file===input.file).code;
const evidence=[];
for(const input of inputs)for(const route of [0,1,2,3,4])for(const success of [true,false]){
  test(`${input.file} route${route} ${success?'success':'failure'} before→after 실제 저장/복원`,async()=>{
    for(const candidate of [false,true]){
      const state=fixture(input,{route,candidate,success});await state.initial();state.context._doAiEnhance();
      assert.equal(state.state().mats,0);assert.equal(state.state().enh,success?1:0);
      const actionEvents=state.events.filter(event=>!['shared','snapshot'].includes(event.type));
      assert.equal(actionEvents.filter(event=>event.type==='stats').length,1);
      assert.equal(actionEvents.filter(event=>event.type==='render').length,1);
      assert.equal(state.state().rng,success?121:1);
      state.context.closePanel('forge');state.context.closeAllPanels();assert.equal(state.state().writes,1);
      await state.advance(499);assert.equal(state.state().writes,1);
      await state.advance(1);assert.equal(state.state().writes,candidate?2:1);
      const persisted=state.restore();
      const expectedEnh=candidate&&success?1:0;
      const expectedMats=candidate&&![1,2].includes(route)?0:15000;
      assert.equal(persisted.enh,expectedEnh);assert.equal(persisted.mats,expectedMats);
      evidence.push({file:input.file,route,success,candidate,restored:persisted,writes:state.state().writes,shared:state.state().shared});
    }
  });
}
for(const input of inputs){
  test(`${input.file} debounce중복·미시도·취소·기존효과불변`,async()=>{
    for(const mats of [0,14999]){
      const state=fixture(input,{candidate:true,mats});await state.initial();state.context._doAiEnhance();await state.advance(500);
      assert.equal(state.state().writes,1);assert.equal(state.state().rng,0);
    }
    const duplicate=fixture(input,{candidate:true,success:false,mats:30000});await duplicate.initial();duplicate.context._doAiEnhance();
    await duplicate.advance(250);duplicate.context._doAiEnhance();await duplicate.advance(499);assert.equal(duplicate.state().writes,1);
    await duplicate.advance(1);assert.equal(duplicate.state().writes,2);assert.equal(duplicate.state().snapshot.inv.equipped.weapon.enh,0);assert.equal(duplicate.state().shared,0);
    const ignored=fixture(input,{candidate:true});await ignored.initial();ignored.context.G._aiEnhSlot=null;ignored.context._doAiEnhance();await ignored.advance(500);assert.equal(ignored.state().writes,1);
    const achieved=fixture(input,{candidate:true});await achieved.initial();achieved.context.G._aiTarget=1;achieved.context.INV.equipped.weapon.enh=1;
    assert.throws(()=>achieved.context._doAiEnhance(),/toLocaleString/);await achieved.advance(500);assert.equal(achieved.state().writes,1);
    const cancelled=fixture(input,{candidate:true});await cancelled.initial();cancelled.context.closePanel('forge');await cancelled.advance(500);assert.equal(cancelled.state().writes,1);
    const original=fixture(input),candidate=fixture(input,{candidate:true});await original.initial();await candidate.initial();original.context._doAiEnhance();candidate.context._doAiEnhance();
    assert.deepEqual(candidate.events,original.events);assert.equal(candidate.state().rng,original.state().rng);assert.equal(candidate.state().mats,original.state().mats);
  });
  test(`${input.file} autosave·db미준비·로컬폴백·499ms취약창`,async()=>{
    const autosave=fixture(input);await autosave.initial();autosave.context._doAiEnhance();await autosave.advance(29999);assert.equal(autosave.state().writes,1);await autosave.advance(1);assert.equal(autosave.state().writes,2);assert.equal(autosave.restore().enh,1);
    const off=fixture(input,{on:false});await off.initial();off.context._doAiEnhance();await off.advance(30000);assert.equal(off.state().writes,1);
    const early=fixture(input,{candidate:true});await early.initial();early.context._doAiEnhance();await early.advance(499);assert.deepEqual(early.restore(),{enh:0,mats:15000});
    const unavailable=fixture(input,{candidate:true});await unavailable.initial();unavailable.context._dbReady=false;unavailable.context._doAiEnhance();await unavailable.advance(500);assert.equal(unavailable.state().writes,1);
    for(const transport of ['fallback','fail']){const state=fixture(input,{route:3,candidate:true,transport});await state.initial();state.context._doAiEnhance();await state.advance(500);assert.deepEqual(state.restore(),{enh:1,mats:0});}
  });
  test(`${input.file} 정상beforeunload 저장시도·진행중저장 guard 한계`,async()=>{
    for(const candidate of [false,true])for(const route of [0,2,3,4]){
      const state=fixture(input,{candidate,route});await state.initial();state.context._doAiEnhance();await state.advance(499);await state.unload();
      assert.equal(state.state().writes,2);assert.equal(state.restore().enh,1);
    }
    const busy=fixture(input,{candidate:true});await busy.initial();busy.context._doAiEnhance();busy.context._saving=true;await busy.advance(500);
    assert.equal(busy.state().writes,1);assert.deepEqual(busy.restore(),{enh:0,mats:15000});
  });
  test(`${input.file} 실제루프 악의분리동기화후 성공장비만 소실·후보는 보존`,async()=>{
    for(const candidate of [false,true]){
      const state=fixture(input,{candidate});await state.initial();state.context._doAiEnhance();state.syncFrame();
      assert.equal(state.state().shared,0);await state.advance(500);
      assert.deepEqual(state.restore(),{enh:candidate?1:0,mats:0});
      evidence.push({file:input.file,frameSync:true,candidate,restored:state.restore()});
    }
  });
}
test('소유구역 입력SHA 불변 및 실행근거',()=>{
  for(const input of inputs)assert.deepEqual(extract(input.file).hashes,input.hashes);
  for(const entry of unloadSources){const source=fs.readFileSync(new URL('../../../'+entry.file,import.meta.url),'utf8');assert.equal(sha(source.match(/^window.addEventListener\('beforeunload',[\s\S]*?^\}\);/m)[0]),entry.sha256);}
  for(const entry of syncSources){const source=fs.readFileSync(new URL('../../../'+entry.file,import.meta.url),'utf8');assert.equal(sha(source.match(/^function _matsDirty.*$/m)[0]+'\n'+source.match(/^  if\(G.mats!==_matsPrev\).*$/m)[0]),entry.sha256);}
  const patch=fs.readFileSync(new URL('./ai-enhance-persistence-candidate.diff',import.meta.url),'utf8');assert.equal(patch.match(/^\+  if\(res.used>0\)dbSaveNow\(\);$/gm).length,2);
  fs.writeFileSync(new URL('./ai-enhance-persistence-evidence.json',import.meta.url),JSON.stringify({completedAt:new Date().toISOString(),regions:inputs.map(({file,hashes})=>({file,hashes})),rows:evidence,limits:'fake DOM/clock/sink; 실제 전체dbSave/dbRestore 함수; demo500의 별도 생산 복원 override는 장비 복원하지 않으므로 공용dbRestore 비교와 구별'},null,2)+'\n');
});
