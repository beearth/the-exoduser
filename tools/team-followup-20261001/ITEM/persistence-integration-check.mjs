import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {extract,createSaveHarness} from './binding-save-harness.mjs';
import {createD10PersistenceIntegration,persistenceReviewCallsite} from './persistence-integration-port.mjs';
import {inspectD10Binding} from './binding-d10.mjs';
import {lookupItemProposal} from '../../../unique-item-project/definitions.js';
import {lookupRoll} from '../../../unique-item-project/roll-values.js';

const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const clone=value=>JSON.parse(JSON.stringify(value));
const sources=[],scenarios=[];
const request={proposalOnly:true,uniqueId:'UI-10',tier:1,element:0,baseRarity:2};
const patch=fs.readFileSync('tools/team-followup-20261001/ITEM/persistence-integration-minimal.patch','utf8');
const sections=patch.split('--- a/').slice(1);
assert.equal(sections.length,2);
for(const section of sections){
  const lines=section.trimEnd().split('\n');
  const file=lines[0],html=fs.readFileSync(file,'utf8');
  const inserted=lines.filter(line=>line.startsWith('+')&&!line.startsWith('+++')).map(line=>line.slice(1)).join('\n');
  assert.equal(inserted,persistenceReviewCallsite+'\n');
  const modified=html.replace('function defaultItems(){',inserted+'\nfunction defaultItems(){');
  assert.notEqual(modified,html);
  assert.equal(extract(modified,'_createD10ProposalForPersistenceReview'),extract(inserted,'_createD10ProposalForPersistenceReview'));
  assert.equal(extract(modified,'dbSave'),extract(html,'dbSave'));
  assert.equal(extract(modified,'dbRestore'),extract(html,'dbRestore'));
}
for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(file,'utf8');
  const constants=['RARITY_MUL','SLOT_NAMES','SLOT_EMOJI','AFFIX_POOL','_AFSLOT','IMPLICIT_TABLE','LEGENDARY_SPECIAL','UNIQUE_SPECIAL'];
  const mkSource=extract(html,'mkItem');
  let baseRng=0,d10Rng=0,created=null;
  const math=Object.create(Math);math.random=()=>{baseRng++;return .5;};
  class FixtureDate extends Date{static now(){return 100000;}}
  const context=vm.createContext({Math:math,Date:FixtureDate,P:{lv:20},EL:{P:0,F:1,I:2,D:3,L:4,H:5},
    _DEMO_MODE:false,_DEMO_AFFIX_BANNED:new Set(),window:{},performance:{now:()=>1000}});
  vm.runInContext([...constants.map(name=>extract(html,name,true)),extract(html,'rollAffixes'),mkSource,persistenceReviewCallsite].join('\n'),context);
  const port=createD10PersistenceIntegration({mkItem:(...args)=>{created=context.mkItem(...args);return created;},rng:()=>{d10Rng++;return .5;}});
  context.window._d10PersistenceReviewPort=port;
  const call=req=>context._createD10ProposalForPersistenceReview(req);
  for(const bad of [null,{...request,proposalOnly:false},{...request,uniqueId:'UI-21'},{...request,baseRarity:5},{...request,tier:-1}]){
    const prior=baseRng;assert.throws(()=>call(bad));assert.equal(baseRng,prior);assert.equal(d10Rng,0);
  }
  const item=call(request),base=clone(created);
  assert.equal(d10Rng,1);assert(baseRng>1);assert.equal(item.uniqueRoll.storedValue,.15);
  const {uniqueId,uniqueRoll,...rest}=item;
  assert.deepEqual(rest,base);assert(base.affixes.length>0);assert(base.socketCount>0);
  assert.equal(port.enabled,false);assert.equal(port.runtimeReady,false);
  assert.equal(port.consumer.begin({rage:100},{armor:item}),null);
  const legacy={...clone(base),rarity:5,name:'구형 슬롯 유니크',uniqueSpecial:{ko:'fixture',stat:'_uArmorRage',val:.25},_uArmorRage:.25};
  const ossuary=clone(context.mkItem('ossuary',0,0,0));
  const missing={...clone(item)};delete missing.uniqueRoll;
  const invalid={...clone(item),uniqueRoll:{...item.uniqueRoll,version:2}};
  const unknown={...clone(item),uniqueId:'UNKNOWN'};
  const fixtures=[item,base,legacy,ossuary,missing,invalid,unknown];
  for(const route of ['bag','equipped','storage'])for(const fixture of fixtures){
    const harness=createSaveHarness(html);
    if(route==='bag')harness.context.INV.bag=[clone(fixture)];
    else if(route==='equipped')harness.context.INV.equipped={armor:clone(fixture)};
    else harness.store([fixture]);
    const pick=()=>route==='bag'?harness.context.INV.bag[0]:route==='equipped'?harness.context.INV.equipped.armor:harness.context.STORAGE[0][0];
    for(let cycle=0;cycle<2;cycle++){
      await harness.context.dbSave();assert.deepEqual(harness.errors,[]);
      const data=clone(harness.saved());assert.equal(harness.context.dbRestore(data),true);
      const restored=pick();assert.equal(port.restoreItem(restored),restored);
      assert.deepEqual(clone(restored),clone(fixture));
      assert.deepEqual(port.serializeItem(restored),clone(fixture));
      assert.equal(port.readItem(restored).kind,inspectD10Binding(fixture).status==='valid'?'proposal':inspectD10Binding(fixture).status);
      assert.deepEqual(context._readD10ProposalForPersistenceReview(restored),port.readItem(restored));
      assert.equal(port.readStoredRoll(restored,lookupItemProposal(restored),lookupRoll('UI-10')),inspectD10Binding(fixture).status==='valid'?.15:null);
      assert.equal(port.consumer.begin({rage:100},{armor:restored}),null);
    }
    assert.equal(harness.rng(),0);assert.equal(d10Rng,1);
    scenarios.push({file,route,kind:inspectD10Binding(fixture).status,cycles:2,creationD10Rng:1,restoreRng:0,preserved:true});
  }
  let hooks=0;const malicious={...clone(item),metadata:{}};
  Object.defineProperty(malicious.metadata,'toJSON',{enumerable:true,value:()=>{hooks++;return{};}});
  assert.throws(()=>port.serializeItem(malicious));assert.equal(hooks,0);
  delete context.window._d10PersistenceReviewPort;
  assert.throws(()=>call(request));assert.equal(d10Rng,1);
  assert.equal(context._readD10ProposalForPersistenceReview(item),null);
  sources.push({file,sha256:hash(html),mkItem:hash(mkSource),dbSave:hash(extract(html,'dbSave')),dbRestore:hash(extract(html,'dbRestore')),
    baseGenerationRngObserved:baseRng,d10Rng:1});
  assert.equal(hash(fs.readFileSync(file,'utf8')),hash(html));
}
for(const sample of [0,1-Number.EPSILON]){
  let calls=0;
  const port=createD10PersistenceIntegration({mkItem:()=>({slot:'armor',name:'양끝 fixture',affixes:[],socketCount:1,crystals:[null]}),rng:()=>{calls++;return sample;}});
  assert.equal(port.createReview(request).uniqueRoll.storedValue,sample===0?.1:.2);assert.equal(calls,1);
}
process.stdout.write(JSON.stringify({checkedAt:new Date().toISOString(),sources,scenarios,patchSha256:hash(patch),
  dependencies:['binding-ports.mjs','binding-d10.mjs','d10-consumer.mjs','binding-save-harness.mjs'].map(file=>({file,sha256:hash(fs.readFileSync('tools/team-followup-20261001/ITEM/'+file,'utf8'))})),
  result:'PASS',saveScenarios:scenarios.length,saveRestoreCycles:scenarios.length*2,
  actualFunctions:['mkItem','rollAffixes','dbSave','dbRestore','_saveSharedStorage','_loadSharedStorage','_persistSharedStorage'],
  gates:'proposalOnly=true explicit request; definition disabled; runtimeReady=false; default consumer disabled; no drop or load creation hooks',
  limits:['original mkItem RNG distinct from exactly-one D10 RNG','canonical sockets/affixes fixtures only; old migration RNG unchanged','missing browser bridge/bootstrap is an adoption blocker','no user save/network/browser/production writes']},null,2)+'\n');
