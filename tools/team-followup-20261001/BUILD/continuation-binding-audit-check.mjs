import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createD10ProposalInstance,inspectD10Binding} from '../ITEM/binding-d10.mjs';
import {createNewIdentifiedD10Instance,restoreD10Instance} from '../ITEM/binding-ports.mjs';
import {createSaveHarness,extract} from '../ITEM/binding-save-harness.mjs';
const root=new URL('../../../',import.meta.url);
const rows=[],counterexamples=[],hashes=[];
const startedAt=new Date().toISOString();
const clone=value=>JSON.parse(JSON.stringify(value));
function check(name,action){try{action();rows.push({name,status:'PASS'});}catch(error){rows.push({name,status:'FAIL',error:error.stack});}}
function finding(id,details){counterexamples.push({id,...details});}
const good=createD10ProposalInstance({newItem:{slot:'armor',id:99,name:'fixture'},rng:()=>.5});
check('port converts preexisting missing-binding identity with RNG',()=>{
  const existing={id:1,slot:'armor',uniqueId:'UI-10',name:'already-saved',history:{loaded:true}};
  let rng=0;
  assert.equal(inspectD10Binding(existing).status,'missing');
  const output=createNewIdentifiedD10Instance(existing,()=>{rng++;return .5;});
  assert.equal(inspectD10Binding(output).status,'valid');assert.equal(rng,1);assert.equal(output.id,existing.id);
  finding('C1',{contract:'new-only identity boundary',observed:'existing missing UI-10 upgraded by create port with same id and one RNG',risk:'caller must prove fresh creation; current API has no freshness proof',scope:'not proof restore calls create'});
});
check('serialization injects legacy fields after guard',()=>{
  const input={slot:'armor',toJSON(){return {slot:'armor',id:2,unique:true,uniqueSpecial:{legacy:1},_uSlamEmberRage:20};}};
  let calls=0;const output=createD10ProposalInstance({newItem:input,rng:()=>{calls++;return .5;}});
  assert.equal(output.unique,true);assert.deepEqual(output.uniqueSpecial,{legacy:1});assert.equal(calls,1);
  finding('C2',{contract:'creation rejects legacy fields before RNG',observed:'toJSON output is not revalidated; legacy unique fields survive alongside valid D10 binding',scope:'non-plain creator input, not plain parsed-save exploit'});
});
check('inherited schema accepted then lost across JSON',()=>{
  const binding=Object.create({...good.uniqueRoll});const item={...good,uniqueRoll:binding};
  assert.equal(inspectD10Binding(item).status,'valid');assert.equal(inspectD10Binding(clone(item)).status,'invalid');
  finding('C3',{contract:'valid schema must persist equivalently',observed:'required binding fields may be inherited/nonserialized; valid becomes invalid after JSON',scope:'exotic runtime objects; plain saved JSON unaffected'});
});
check('own nonenumerable binding accepted then disappears',()=>{
  const item={...good};Object.defineProperty(item,'uniqueRoll',{value:good.uniqueRoll,enumerable:false});
  assert.equal(inspectD10Binding(item).status,'valid');assert.equal(inspectD10Binding(clone(item)).status,'missing');
  finding('C4',{contract:'own property is not sufficient JSON schema validation',observed:'nonenumerable uniqueRoll is valid before save but missing after save'});
});
check('throwing accessor escapes inspect instead of invalid result',()=>{
  const item={...good};Object.defineProperty(item,'uniqueRoll',{get(){throw Error('accessor sentinel');}});
  assert.throws(()=>inspectD10Binding(item),/accessor sentinel/);
  finding('C5',{contract:'invalid object inspection returns result, not uncaught exception',observed:'uniqueRoll accessor throw outside try; consumer fail-closed depends on caller catch',scope:'exotic object; JSON cannot encode getter'});
});
check('inspect can call external RNG accessor',()=>{
  let calls=0;const item={...good,uniqueRoll:{...good.uniqueRoll}};
  Object.defineProperty(item.uniqueRoll,'storedValue',{enumerable:true,get(){calls++;return .15;}});
  assert.equal(inspectD10Binding(item).status,'valid');assert.ok(calls>1);
  finding('C6',{contract:'read/load no implicit RNG and single deterministic stored read',observed:'storedValue accessor is read repeatedly ('+calls+'); it may invoke external RNG',scope:'not a production Math.random call in binding module'});
});
check('inherited UI10 creation identity accepted by port',()=>{
  const item=Object.assign(Object.create({uniqueId:'UI-10'}),{slot:'armor',id:3});
  const output=createNewIdentifiedD10Instance(item,()=>.5);assert.equal(output.uniqueId,'UI-10');
  finding('C7',{contract:'explicit creation identity should be own enumerable data',observed:'port accepts inherited uniqueId; destructuring masks identity origin'});
});
check('plain restore never creates or alters missing/invalid/legacy',()=>{
  for(const item of [{slot:'armor',id:1},{slot:'armor',id:2,uniqueId:'UI-10'},{...good,uniqueRoll:{...good.uniqueRoll,version:99}}]){
    const before=clone(item);assert.equal(restoreD10Instance(item),item);assert.deepEqual(item,before);
  }
});
for(const file of ['game.html','game-easy-test.html']){
  const source=fs.readFileSync(new URL(file,root),'utf8');
  hashes.push({file,sha256:crypto.createHash('sha256').update(source).digest('hex'),dbSave:crypto.createHash('sha256').update(extract(source,'dbSave')).digest('hex'),dbRestore:crypto.createHash('sha256').update(extract(source,'dbRestore')).digest('hex')});
  for(const location of ['bag','equipped','storage']){
    try{
      const harness=createSaveHarness(source);
      const items=[{slot:'armor',id:7,name:'legacy',uniqueSpecial:{x:.375},extra:{preserve:[1,2]}},{slot:'armor',id:8,uniqueId:'UI-10',name:'missing'},{...clone(good),id:9,uniqueRoll:{...good.uniqueRoll,version:99,extra:'opaque'}}].map(item=>({...item,socketCount:0,crystals:[],affixes:[]}));
      if(location==='bag')harness.context.INV.bag=clone(items);
      else if(location==='equipped')harness.context.INV.equipped={armor:clone(items[0]),gloves:clone(items[1]),boots:clone(items[2])};
      else harness.store(items);
      await harness.context.dbSave();assert.equal(harness.context.dbRestore(clone(harness.saved())),true);
      const restored=location==='bag'?harness.context.INV.bag:location==='equipped'?[harness.context.INV.equipped.armor,harness.context.INV.equipped.gloves,harness.context.INV.equipped.boots]:harness.context.STORAGE[0];
      assert.deepEqual(clone(restored),items);assert.equal(harness.rng(),0);assert.deepEqual(harness.errors,[]);
      rows.push({name:file+' '+location+' opaque legacy/missing/unknown schema preserve',status:'PASS'});
    }catch(error){rows.push({name:file+' '+location,status:'FAIL',error:error.stack});}
  }
  check(file+' source compatibility: missing socket schema invokes existing restore RNG',()=>{
    const harness=createSaveHarness(source);
    const saved={inv:{bag:[clone(good)],equipped:{}},player:{},game:{}};
    assert.throws(()=>harness.context.dbRestore(saved),/unexpected RNG/);assert.equal(harness.rng(),1);
    finding('C8-'+file,{contract:'load RNG scope and legacy preservation',observed:'dbRestore _fixCr invokes RNG when socketCount missing, before binding read',scope:'existing crystal migration, not D10 roll reroll; zero-RNG whole-restore claim requires canonical socket fields'});
  });
}
for(const file of ['tools/team-followup-20261001/ITEM/binding-d10.mjs','tools/team-followup-20261001/ITEM/binding-ports.mjs','tools/team-followup-20261001/ITEM/binding-save-harness.mjs','unique-item-project/definitions.js','unique-item-project/roll-values.js','tools/team-followup-20261001/ART/wa24-delta-probe.cjs','tools/team-followup-20261001/SKILL/ice-cancel-probe.safe.js','tools/team-followup-20261001/ENEMY/et3-probe.fixed.js'])hashes.push({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(new URL(file,root))).digest('hex')});
const result={startedAt,completedAt:new Date().toISOString(),kind:'independent-contract-counterexamples-and-current-source-VM',rows,counterexamples,hashes,pass:rows.filter(row=>row.status==='PASS').length,fail:rows.filter(row=>row.status==='FAIL').length,limits:['counterexample PASS confirms issue reproduction, not contract acceptance','db dependencies use actual functions plus memory/noop harness; no real user save','no production integration, browser, socket or NW execution']};
fs.writeFileSync(new URL('./continuation-binding-audit-evidence.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({pass:result.pass,fail:result.fail,counterexamples:counterexamples.length}));process.exitCode=result.fail?1:0;
