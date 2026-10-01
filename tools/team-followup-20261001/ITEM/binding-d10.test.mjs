import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createD10ProposalInstance,inspectD10Binding,readStoredRoll,createBoundD10Consumer,D10_BINDING_SCHEMA} from './binding-d10.mjs';
import {lookupItemProposal} from '../../../unique-item-project/definitions.js';
import {lookupRoll} from '../../../unique-item-project/roll-values.js';
import {describeD10Tooltip} from '../../../unique-item-project/d10-tooltip.js';
import {createSaveHarness,extract} from './binding-save-harness.mjs';
import {readD10Binding,createD10ValidationPorts} from './binding-ports.mjs';
import {createStoredD10TooltipConsumer} from '../UIUX/binding-tooltip.mjs';
import {verifyBinding} from '../BALANCE/binding-independent.mjs';

const root=new URL('../../../',import.meta.url),clone=value=>JSON.parse(JSON.stringify(value));
const fresh={id:101,slot:'armor',name:'새 제안 흉갑 fixture',rarity:5,affixes:[{id:'saved',tier:1,value:.125}],def:15.375,socketCount:1,crystals:[null],uniqueSpecial:null};
const evidence=[],sources=[];
for(let raw=10;raw<=20;raw++)test(`new instance integer roll ${raw}, one RNG; inspect/read/JSON/tooltip no RNG`,()=>{
  let calls=0;const before=clone(fresh);
  const item=createD10ProposalInstance({newItem:fresh,rng:()=>{calls++;return (raw-10+.5)/11;}});
  assert.equal(calls,1);assert.deepEqual(fresh,before);assert.equal(item.uniqueId,'UI-10');
  assert.equal(item.uniqueRoll.storedValue,raw/100);
  for(let repeat=0;repeat<5;repeat++){
    const restored=clone(item),binding=inspectD10Binding(restored);
    assert.equal(binding.status,'valid');assert.equal(binding.raw,raw);assert.deepEqual(restored,item);
    assert.equal(readStoredRoll(restored,lookupItemProposal(restored),lookupRoll('UI-10')),raw/100);
    assert.equal(describeD10Tooltip(binding.raw,'ko').stored,raw/100);
  }
  assert.equal(calls,1);
  evidence.push({raw,stored:item.uniqueRoll.storedValue,creationRngCalls:calls,loadReadRngCalls:0});
});
test('invalid new inputs never invoke RNG or mutate existing legacy',()=>{
  let calls=0;const rng=()=>{calls++;return .5;};
  for(const newItem of [null,[],{slot:'weapon'},{...fresh,uniqueId:'UNKNOWN'},{...fresh,uniqueId:'UI-10'},{...fresh,uniqueId:''},{...fresh,uniqueRoll:null},{...fresh,_uSlamEmberRage:20},{...fresh,unique:true},{...fresh,uniqueSpecial:{value:.2}}]){
    const before=clone(newItem);assert.throws(()=>createD10ProposalInstance({newItem,rng}),TypeError);assert.deepEqual(newItem,before);
  }
  assert.equal(calls,0);
  for(const sample of [NaN,Infinity,-.1,1,'0.5']){
    let invalidCalls=0;assert.throws(()=>createD10ProposalInstance({newItem:fresh,rng:()=>{invalidCalls++;return sample;}}),RangeError);assert.equal(invalidCalls,1);
  }
});
test('legacy/missing/invalid remain untouched and never become valid effects',()=>{
  const good=createD10ProposalInstance({newItem:fresh,rng:()=>.5});
  const cases=[{...fresh,uniqueSpecial:{value:.2}},{slot:'ossuary',unique:true,uniqueSpecial:null},{...fresh,uniqueId:'UNKNOWN'}, {...fresh,uniqueId:'UI-10'},{...good,uniqueRoll:null},
    ...[0,2,'1'].map(version=>({...good,uniqueRoll:{...good.uniqueRoll,version}})),
    ...[10,20,'0.2',.155,.09,.21,NaN,Infinity].map(storedValue=>({...good,uniqueRoll:{...good.uniqueRoll,storedValue}})),
    ...[{effectId:'U-D11'},{stat:'wrong'},{unit:'percent'}].map(patch=>({...good,uniqueRoll:{...good.uniqueRoll,...patch}}))];
  for(const item of cases){
    const before=structuredClone(item);assert.notEqual(inspectD10Binding(item).status,'valid');
    assert.equal(readStoredRoll(item,lookupItemProposal(item),lookupRoll('UI-10')),null);assert.deepEqual(item,before);
    const player={rage:100};assert.equal(createBoundD10Consumer({enabled:true}).begin(player,{armor:item}),null);assert.equal(player.rage,100);
  }
});
test('real D10 consumer reads the loaded binding, opt-in only, no reroll',()=>{
  let calls=0;const item=clone(createD10ProposalInstance({newItem:fresh,rng:()=>{calls++;return .999;}})),player={rage:100};
  assert.equal(createBoundD10Consumer().begin(player,{armor:item}),null);
  const consumer=createBoundD10Consumer({enabled:true}),token=consumer.begin(player,{armor:item});assert.ok(token);
  player.rage=0;assert.equal(consumer.consume(token,100),true);assert.equal(consumer.finish(token,true),20);assert.equal(consumer.finish(token,true),0);assert.equal(calls,1);
  assert.equal(D10_BINDING_SCHEMA.runtimeReady,false);
});
test('new RNG endpoints are single-call and fresh mutable snapshots are detached',()=>{
  for(const [sample,expected] of [[0,.1],[1-Number.EPSILON,.2]]){
    let calls=0;const item=createD10ProposalInstance({newItem:fresh,rng:()=>{calls++;return sample;}});
    assert.equal(calls,1);assert.equal(item.uniqueRoll.storedValue,expected);
    item.affixes[0].value=9;assert.equal(fresh.affixes[0].value,.125);
  }
});
for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(new URL(file,root),'utf8');
  sources.push({file,dbSaveSha256:crypto.createHash('sha256').update(extract(html,'dbSave')).digest('hex'),dbRestoreSha256:crypto.createHash('sha256').update(extract(html,'dbRestore')).digest('hex')});
  for(const path of ['bag','equipped','storage'])test(`${file} real save/restore ${path} retains new binding and legacy without RNG`,async()=>{
    let calls=0;const item=createD10ProposalInstance({newItem:fresh,rng:()=>{calls++;return .5;}});
    const legacy={...clone(fresh),id:102,name:'구형 슬롯 유니크',uniqueSpecial:{value:.375}};
    const harnessState=createSaveHarness(html);
    if(path==='bag')harnessState.context.INV.bag=[item,legacy];
    else if(path==='equipped')harnessState.context.INV.equipped={armor:item,gloves:legacy};
    else harnessState.store([item,legacy]);
    const pick=()=>clone(path==='bag'?harnessState.context.INV.bag:path==='equipped'?[harnessState.context.INV.equipped.armor,harnessState.context.INV.equipped.gloves]:harnessState.context.STORAGE[0]);
    for(let repeat=0;repeat<3;repeat++){
      await harnessState.context.dbSave();assert.deepEqual(harnessState.errors,[]);assert.ok(harnessState.saved());assert.deepEqual(harnessState.saved().storage,{});
      const json=clone(harnessState.saved());assert.equal(harnessState.context.dbRestore(json),true);
      assert.deepEqual(pick(),[item,legacy]);assert.equal(inspectD10Binding(pick()[0]).status,'valid');assert.equal(inspectD10Binding(pick()[1]).status,'legacy');
    }
    assert.equal(harnessState.rng(),0);assert.equal(calls,1);
    evidence.push({file,path,saveRestoreCycles:3,creationRngCalls:1,restoreRngCalls:0,legacyUnchanged:true});
  });
}
test('source evidence is emitted for root/UIUX/BALANCE; no production enable',()=>{
  fs.writeFileSync(new URL('./binding-evidence.json',import.meta.url),JSON.stringify({schema:D10_BINDING_SCHEMA,sources,comparisons:evidence,
    dependencies:['unique-item-project/definitions.js','unique-item-project/roll-values.js','unique-item-project/d10-tooltip.js','tools/team-followup-20261001/ITEM/d10-consumer.mjs','tools/team-followup-20261001/UIUX/binding-tooltip.mjs','tools/team-followup-20261001/BALANCE/binding-independent.mjs'].map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(new URL(path,root))).digest('hex')})),productionModified:false},null,2)+'\n');
});
test('actual UIUX readBinding port consumes loaded proposal and rejects fallbacks',()=>{
  const describe=createStoredD10TooltipConsumer(readD10Binding);
  const item=createD10ProposalInstance({newItem:fresh,rng:()=>.5});
  assert.equal(describe(clone(item)).kind,'proposal');assert.equal(describe(item).tooltip.stored,.15);assert.equal(describe(item).active,false);
  assert.equal(describe(fresh).kind,'legacy');assert.equal(describe({...fresh,uniqueId:'UI-10'}).kind,'missing');
  assert.equal(describe({...item,uniqueRoll:{...item.uniqueRoll,version:2}}).kind,'invalid');
});
test('actual BALANCE independent verifier consumes explicit new create/read/restore ports',async()=>{
  const result=await verifyBinding(createD10ValidationPorts());
  fs.writeFileSync(new URL('./binding-independent-evidence.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
});
