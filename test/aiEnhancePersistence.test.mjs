import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {extract,fixture} from '../tools/team-followup-20261001/BALANCE/ai-enhance-persistence-harness.mjs';

const owner=new URL('../tools/team-followup-20261001/BALANCE/',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,owner),'utf8'));
const before=read('ai-enhance-persistence-before.json');
const sync=read('ai-enhance-persistence-sync-before.json');
const unload=read('ai-enhance-persistence-unload-before.json');
const call='  const res=aiEnhance(_aiItem,target,budget);';
const connect=input=>({...input,sync:sync.find(x=>x.file===input.file).code,unload:unload.find(x=>x.file===input.file).code});

for(const old of before){
  const baseline=connect(old),current=connect(extract(old.file));
  test(`${old.file}: production callback contains exactly the reviewed save change`,()=>{
    assert.equal(current.regions.click,old.regions.click.replace(call,call+'\n  if(res.used>0)dbSaveNow();'));
    for(const [key,value] of Object.entries(old.regions))if(key!=='click')assert.deepEqual(current.regions[key],value,key);
  });
  for(const route of [0,1,2,3,4])for(const success of [true,false]){
    test(`${old.file}: current route ${route} ${success?'success':'failure'} closes and persists after 500ms`,async()=>{
      const state=fixture(current,{route,success});await state.initial();state.context._doAiEnhance();
      state.context.closePanel('forge');state.context.closeAllPanels();await state.advance(499);
      assert.equal(state.state().writes,1);await state.advance(1);assert.equal(state.state().writes,2);
      assert.equal(state.state().snapshot.inv.equipped.weapon.enh,success?1:0);
      assert.deepEqual(state.restore(),{enh:success?1:0,mats:[1,2].includes(route)?15000:0});
      // demo routes intentionally retain their existing shared-resource restore semantics.
      // This is the common restore function, not demo500's separate selected-field loader.
    });
  }
  test(`${old.file}: original loses upgraded item after resource sync, current retains it`,async()=>{
    for(const [input,expected] of [[baseline,0],[current,1]]){
      const s=fixture(input);await s.initial();s.context._doAiEnhance();s.syncFrame();await s.advance(500);
      assert.deepEqual(s.restore(),{enh:expected,mats:0});
    }
  });
  test(`${old.file}: no attempt does not schedule a save`,async()=>{
    for(const mats of [0,14999]){const s=fixture(current,{mats});await s.initial();s.context._doAiEnhance();await s.advance(500);assert.equal(s.state().writes,1);assert.equal(s.state().rng,0);}
    const s=fixture(current);await s.initial();s.context.G._aiEnhSlot=null;s.context._doAiEnhance();await s.advance(500);assert.equal(s.state().writes,1);
  });
  test(`${old.file}: duplicate attempts share trailing debounce without changing RNG or effects`,async()=>{
    const s=fixture(current,{mats:30000,success:false});await s.initial();s.context._doAiEnhance();await s.advance(250);s.context._doAiEnhance();await s.advance(499);assert.equal(s.state().writes,1);await s.advance(1);assert.equal(s.state().writes,2);assert.equal(s.restore().mats,0);
    const a=fixture(baseline),b=fixture(current);await a.initial();await b.initial();a.context._doAiEnhance();b.context._doAiEnhance();assert.deepEqual(b.events,a.events);assert.equal(b.state().rng,a.state().rng);
  });
  test(`${old.file}: existing early-exit and busy-save limitations are unchanged`,async()=>{
    for(const input of [baseline,current]){
      const early=fixture(input);await early.initial();early.context._doAiEnhance();await early.advance(499);assert.equal(early.restore().enh,0);
      const busy=fixture(input);await busy.initial();busy.context._saving=true;busy.context._doAiEnhance();await busy.advance(500);assert.equal(busy.state().writes,1);assert.equal(busy.restore().enh,0);
      const unavailable=fixture(input);await unavailable.initial();unavailable.context._dbReady=false;unavailable.context._doAiEnhance();await unavailable.advance(500);assert.equal(unavailable.state().writes,1);
    }
  });
  test(`${old.file}: local fallback and explicit unload still use existing save paths`,async()=>{
    for(const transport of ['fallback','fail']){const s=fixture(current,{route:3,transport});await s.initial();s.context._doAiEnhance();await s.advance(500);assert.deepEqual(s.restore(),{enh:1,mats:0});}
    const s=fixture(current);await s.initial();s.context._doAiEnhance();await s.advance(499);await s.unload();assert.equal(s.restore().enh,1);
  });
}
