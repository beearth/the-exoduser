import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createD10ProposalInstance,inspectD10Binding} from '../ITEM/binding-d10.mjs';
import {createNewIdentifiedD10Instance,restoreD10Instance,readD10Binding} from '../ITEM/binding-ports.mjs';
const fresh=()=>({slot:'armor',name:'new proposal',affixes:[],socketCount:0});
const good=()=>createD10ProposalInstance({newItem:fresh(),rng:()=>.5});

test('creation never invokes serialization hooks, getters or RNG for exotic inputs',()=>{
  let calls=0;const trap=()=>{calls++;throw Error('must not execute');};
  const getter=fresh();Object.defineProperty(getter,'slot',{enumerable:true,get:trap});
  const cycle=fresh();cycle.cycle=cycle;
  for(const input of [{...fresh(),toJSON:trap},{...fresh(),nested:{toJSON:trap}},getter,cycle,new Date(),{...fresh(),data:NaN}]){
    assert.throws(()=>createD10ProposalInstance({newItem:input,rng:trap}),TypeError);
  }
  assert.equal(calls,0);
});
test('inherited or nonenumerable binding fields cannot disappear after successful validation',()=>{
  const item=good();
  for(const field of Object.keys(item.uniqueRoll)){
    const binding={...item.uniqueRoll};Object.defineProperty(binding,field,{value:binding[field],enumerable:false});
    assert.equal(inspectD10Binding({...item,uniqueRoll:binding}).status,'invalid');
  }
  assert.equal(inspectD10Binding({...item,uniqueRoll:Object.create(item.uniqueRoll)}).status,'invalid');
  for(const key of ['uniqueId','slot','uniqueRoll']){
    const hidden={...item};Object.defineProperty(hidden,key,{value:item[key],enumerable:false});
    assert.equal(inspectD10Binding(hidden).status,'invalid');
  }
});
test('inspection rejects accessors without invoking their bodies or throwing',()=>{
  let calls=0;const trap=()=>{calls++;throw Error('reader side effect');};
  for(const key of ['uniqueId','slot','uniqueRoll']){
    const item=good();Object.defineProperty(item,key,{enumerable:true,get:trap});
    assert.equal(inspectD10Binding(item).status,'invalid');
  }
  for(const key of Object.keys(good().uniqueRoll)){
    const item=good();Object.defineProperty(item.uniqueRoll,key,{enumerable:true,get:trap});
    assert.equal(inspectD10Binding(item).status,'invalid');
  }
  assert.equal(calls,0);
});
test('creation port rejects inherited identity and identity accessors before RNG',()=>{
  let calls=0;const rng=()=>{calls++;return .5;};
  const inherited=Object.assign(Object.create({uniqueId:'UI-10'}),fresh());
  const accessor=fresh();Object.defineProperty(accessor,'uniqueId',{enumerable:true,get(){calls++;return 'UI-10';}});
  for(const base of [inherited,accessor])assert.throws(()=>createNewIdentifiedD10Instance(base,rng),TypeError);
  assert.equal(calls,0);
});
test('serialization hooks cannot change a validated identity or stored binding',()=>{
  const item=good();
  assert.equal(inspectD10Binding({...item,toJSON(){return {};}}).status,'invalid');
  assert.equal(inspectD10Binding({...item,uniqueRoll:{...item.uniqueRoll,toJSON(){return {};}}}).status,'invalid');
});
test('plain creation retains JSON data, detached nesting and one RNG call',()=>{
  let calls=0;const source={...fresh(),extra:{data:[true,null,1.25,'text']}};
  const item=createD10ProposalInstance({newItem:source,rng:()=>{calls++;return .5;}});
  const loaded=JSON.parse(JSON.stringify(item));
  assert.equal(inspectD10Binding(loaded).storedValue,.15);assert.equal(calls,1);
  assert.deepEqual(item.extra,source.extra);item.extra.data[0]=false;assert.equal(source.extra.data[0],true);
});
test('missing stored binding stays missing under restore/read; creation remains explicit',()=>{
  const saved={...fresh(),id:12,uniqueId:'UI-10'};
  assert.equal(restoreD10Instance(saved),saved);
  assert.equal(readD10Binding(saved).kind,'missing');assert.equal(Object.hasOwn(saved,'uniqueRoll'),false);
});
test('JSON records loaded in another realm retain valid and missing classifications',()=>{
  const valid=vm.runInNewContext('JSON.parse(source)',{source:JSON.stringify(good())});
  assert.equal(inspectD10Binding(valid).storedValue,.15);
  const missing=vm.runInNewContext('({slot:"armor",uniqueId:"UI-10"})');
  assert.equal(inspectD10Binding(missing).status,'missing');
  const created=createD10ProposalInstance({newItem:vm.runInNewContext('({slot:"armor",affixes:[]})'),rng:()=>.5});
  assert.equal(inspectD10Binding(created).storedValue,.15);
});
