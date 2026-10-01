import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {parse} from 'acorn';
import {createD10ProposalInstance,inspectD10Binding,copyPlainItem,readStoredRoll} from '../ITEM/binding-d10.mjs';
import {createNewIdentifiedD10Instance,restoreD10Instance,readD10Binding,createD10ValidationPorts} from '../ITEM/binding-ports.mjs';
import {createSaveHarness,extract} from '../ITEM/binding-save-harness.mjs';
const root=new URL('../../../',import.meta.url),rows=[],observations=[],sources=[];
const startedAt=new Date().toISOString();
function hash(value){return crypto.createHash('sha256').update(value).digest('hex');}
const inputPaths=['tools/team-followup-20261001/ITEM/binding-d10.mjs','tools/team-followup-20261001/ITEM/binding-ports.mjs','tools/team-followup-20261001/ITEM/binding-save-harness.mjs','game.html','game-easy-test.html'];
for(const file of inputPaths)sources.push({file,sha256:hash(fs.readFileSync(new URL(file,root)))});
function check(name,action){try{action();rows.push({name,status:'PASS'});}catch(error){rows.push({name,status:'FAIL',error:error.stack});}}
const clone=value=>JSON.parse(JSON.stringify(value));
const good=createD10ProposalInstance({newItem:{slot:'armor',id:99,affixes:[],socketCount:0,crystals:[]},rng:()=>.5});
check('C2 toJSON rejected before hook/RNG',()=>{
  let hooks=0,rng=0;const input={slot:'armor',toJSON(){hooks++;return {slot:'armor',unique:true,uniqueSpecial:{legacy:1}};}};
  assert.throws(()=>createD10ProposalInstance({newItem:input,rng:()=>{rng++;return .5;}}),TypeError);assert.equal(hooks,0);assert.equal(rng,0);
});
check('C3 inherited schema fails closed',()=>{
  const item={...good,uniqueRoll:Object.create({...good.uniqueRoll})};assert.equal(inspectD10Binding(item).status,'invalid');assert.equal(readD10Binding(item).stored,null);
});
check('C4 nonenumerable own binding fails closed',()=>{
  const item={...good};Object.defineProperty(item,'uniqueRoll',{value:good.uniqueRoll,enumerable:false});assert.equal(inspectD10Binding(item).status,'invalid');
});
check('C5 throwing binding getter never runs',()=>{
  let gets=0;const item={...good};Object.defineProperty(item,'uniqueRoll',{enumerable:true,get(){gets++;throw Error('sentinel');}});assert.equal(inspectD10Binding(item).status,'invalid');assert.equal(gets,0);
});
check('C6 stored getter never runs',()=>{
  let gets=0;const item={...good,uniqueRoll:{...good.uniqueRoll}};Object.defineProperty(item.uniqueRoll,'storedValue',{enumerable:true,get(){gets++;return .15;}});assert.equal(inspectD10Binding(item).status,'invalid');assert.equal(gets,0);
});
check('C7 inherited identity rejected before RNG',()=>{
  let rng=0;const item=Object.assign(Object.create({uniqueId:'UI-10'}),{slot:'armor'});assert.throws(()=>createNewIdentifiedD10Instance(item,()=>{rng++;return .5;}),TypeError);assert.equal(rng,0);
});
check('all required own data descriptors checked',()=>{
  for(const key of ['version','effectId','stat','unit','storedValue']){
    const item={...good,uniqueRoll:{...good.uniqueRoll}};Object.defineProperty(item.uniqueRoll,key,{value:item.uniqueRoll[key],enumerable:false});assert.equal(inspectD10Binding(item).status,'invalid');
  }
  for(const key of ['slot','uniqueId']){
    const item={...good};Object.defineProperty(item,key,{enumerable:true,get(){throw Error('must not execute');}});assert.equal(inspectD10Binding(item).status,'invalid');
  }
});
check('recursive creation refuses sparse/cycles/hooks and preserves null records',()=>{
  for(const value of [{slot:'armor',extra:{toJSON(){throw Error('never');}}},{slot:'armor',extra:new Date()},{slot:'armor',values:Array(2)}, {slot:'armor',values:[undefined]}])assert.throws(()=>copyPlainItem(value),TypeError);
  const cyclic={slot:'armor'};cyclic.self=cyclic;assert.throws(()=>copyPlainItem(cyclic),TypeError);
  const plain=Object.assign(Object.create(null),{slot:'armor',extra:{a:null}});assert.deepEqual(copyPlainItem(plain),{slot:'armor',extra:{a:null}});
});
check('C1 caller-only creation; actual read/restore never supplies missing roll',()=>{
  const missing={slot:'armor',id:1,uniqueId:'UI-10'};const before=clone(missing);let rng=0;
  assert.equal(inspectD10Binding(missing).status,'missing');assert.equal(readD10Binding(missing).kind,'missing');assert.equal(restoreD10Instance(missing),missing);assert.equal(createD10ValidationPorts().read(missing),null);assert.deepEqual(missing,before);
  const created=createNewIdentifiedD10Instance(missing,()=>{rng++;return .5;});assert.equal(rng,1);assert.equal(created.id,1);
  observations.push({id:'C1',classification:'explicit creation caller contract, not proof of history',readRestoreMutation:false,explicitCreateRng:rng});
});
function calls(node,result=[]){
  if(!node||typeof node!=='object')return result;
  if(node.type==='CallExpression'&&node.callee.type==='Identifier')result.push(node.callee.name);
  for(const value of Object.values(node)){
    if(Array.isArray(value)){for(const child of value)calls(child,result);}
    else if(value&&typeof value==='object')calls(value,result);
  }
  return result;
}
check('AST read/restore paths contain no creation or rollValue',()=>{
  for(const [file,names] of [['tools/team-followup-20261001/ITEM/binding-d10.mjs',['inspectD10Binding','readStoredRoll']],['tools/team-followup-20261001/ITEM/binding-ports.mjs',['readD10Binding','restoreD10Instance']]]){
    const ast=parse(fs.readFileSync(new URL(file,root),'utf8'),{ecmaVersion:'latest',sourceType:'module'});
    for(const name of names){const fn=ast.body.map(node=>node.declaration).find(node=>node?.id?.name===name);assert.ok(fn);const found=calls(fn);assert.ok(!found.some(call=>['createD10ProposalInstance','createNewIdentifiedD10Instance','rollValue'].includes(call)));observations.push({function:name,calls:found});}
  }
});
check('conditional new boundary: nested serialization hook still permitted by inspector',()=>{
  let hooks=0;const item={slot:'armor',uniqueId:'UI-10',extra:{toJSON(){hooks++;item.uniqueRoll.storedValue=.2;return 'changed';}},uniqueRoll:{...good.uniqueRoll}};
  assert.equal(inspectD10Binding(item).status,'valid');const before=inspectD10Binding(item).storedValue;const serialized=clone(item);assert.equal(hooks,1);assert.equal(serialized.uniqueRoll.storedValue,.2);assert.equal(before,.15);
  observations.push({id:'N1',input:'plain top-level item; nested extra.toJSON mutates parent uniqueRoll from .15 to .2 during JSON',result:{before,after:serialized.uniqueRoll.storedValue,hooks},classification:'exotic external runtime object only; creator rejects this object; JSON parsed loads cannot carry hook',recommendation:'scope valid to required schema, or enforce deep plain-data at persistence boundary; not a production save exploit claim'});
});
for(const file of ['game.html','game-easy-test.html']){
  const source=fs.readFileSync(new URL(file,root),'utf8');
  for(const location of ['bag','equipped','storage']){
    try{
      const items=[clone(good),{slot:'armor',uniqueId:'UI-10',id:1,affixes:[],socketCount:0,crystals:[]},{slot:'armor',id:2,uniqueSpecial:{legacy:.375},affixes:[],socketCount:0,crystals:[]}];
      const harness=createSaveHarness(source);
      if(location==='bag')harness.context.INV.bag=clone(items);else if(location==='equipped')harness.context.INV.equipped={armor:clone(items[0]),gloves:clone(items[1]),boots:clone(items[2])};else harness.store(items);
      await harness.context.dbSave();assert.equal(harness.context.dbRestore(clone(harness.saved())),true);
      const restored=location==='bag'?harness.context.INV.bag:location==='equipped'?[harness.context.INV.equipped.armor,harness.context.INV.equipped.gloves,harness.context.INV.equipped.boots]:harness.context.STORAGE[0];
      assert.deepEqual(clone(restored),items);
      if(location==='storage')observations.push({id:'N2',file,input:'actual _loadSharedStorage JSON.parse inside save VM; canonical own enumerable data',sameObjectPrototype:Object.getPrototypeOf(restored[0])===Object.prototype,validBefore:inspectD10Binding(items[0]).status,validAfter:inspectD10Binding(restored[0]).status,missingAfter:inspectD10Binding(restored[1]).status,outerJsonCloneStatus:inspectD10Binding(clone(restored[0])).status,reason:inspectD10Binding(restored[0]).reason,classification:'cross-realm prototype identity rejects JSON record; actual browser/NW untested'});
      assert.equal(inspectD10Binding(restored[1]).status,'missing');assert.equal(harness.rng(),0);assert.deepEqual(harness.errors,[]);
      rows.push({name:file+' '+location+' preserve good/missing/legacy without D10 reroll',status:'PASS'});
    }catch(error){rows.push({name:file+' '+location,status:'FAIL',error:error.stack});}
  }
  check(file+' C8 existing socket migration RNG distinguished',()=>{
    const harness=createSaveHarness(source);const item={...clone(good)};delete item.socketCount;
    assert.throws(()=>harness.context.dbRestore({inv:{bag:[item],equipped:{}},player:{},game:{}}),/unexpected RNG/);assert.equal(harness.rng(),1);
    observations.push({id:'C8',file,classification:'existing _fixCr socket RNG, not D10 roll generation'});
  });
  check(file+' actual save/restore source no D10 creation calls',()=>{
    for(const name of ['dbSave','dbRestore']){const body=extract(source,name);assert.ok(!/\b(createD10ProposalInstance|createNewIdentifiedD10Instance|rollValue)\s*\(/.test(body));}
  });
}
check('inputs unchanged during audit',()=>{for(const item of sources)assert.equal(hash(fs.readFileSync(new URL(item.file,root))),item.sha256);});
const result={startedAt,completedAt:new Date().toISOString(),kind:'hardened-real-import-and-current-source-VM',sources,rows,observations,pass:rows.filter(row=>row.status==='PASS').length,fail:rows.filter(row=>row.status==='FAIL').length,limits:['N1 is exotic runtime input; creation already refuses it','actual save functions with memory/noop harness, not browser or account','module support remains Node-only candidate; no activation']};
fs.writeFileSync(new URL('./continuation-binding-hardened-evidence.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({pass:result.pass,fail:result.fail}));process.exitCode=result.fail?1:0;
