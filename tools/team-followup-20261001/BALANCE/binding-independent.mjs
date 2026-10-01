import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {fromStoredValue} from '../../../unique-item-project/roll-values.js';
import {createD10Consumer} from '../ITEM/d10-consumer.mjs';

export const legacyFixtures=()=>[
  {slot:'armor',rarity:2,name:'기존 갑옷',enh:10,affixes:[],socketCount:0},
  {slot:'armor',rarity:5,name:'기존 유니크',uniqueSpecial:{stat:'_uArmorRage',val:.25,secs:0},_uArmorRage:.25,socketCount:0},
  {slot:'ossuary',rarity:5,unique:true,uniqueSpecial:null,socketCount:0},
  {slot:'armor',rarity:5,uniqueId:'unknown-id',name:'미등록 보존',custom:{raw:20},socketCount:0},
  {slot:'armor',rarity:5,uniqueId:'UI-10',_uSlamEmberRage:20,uniqueSpecial:{stat:'_uSlamEmberRage',val:20},socketCount:0},
  {slot:'armor',rarity:5,uniqueId:'UI-10',name:'binding 누락',socketCount:0}
];

export function saveRoundtrip(file,item,location) {
  const source=readFileSync(new URL(`../../../${file}`,import.meta.url),'utf8');
  const expression=source.match(/inv:(\{bag:INV\.bag,equipped:INV\.equipped,ossCollect:INV\.ossCollect\|\|\{\}\})/)[1];
  const assignments=source.match(/INV\.bag=d\.inv\.bag\|\|\[\];\s*INV\.equipped=d\.inv\.equipped\|\|\{[^;]+;/)[0];
  const context=vm.createContext({input:structuredClone(item)});
  vm.runInContext(`let INV={bag:[],equipped:{armor:null},ossCollect:{}};
    if('${location}'==='bag')INV.bag.push(input);else INV.equipped.armor=input;
    const d=JSON.parse(JSON.stringify({inv:${expression}}));
    INV={};${assignments}
    globalThis.result='${location}'==='bag'?INV.bag[0]:INV.equipped.armor;`,context,{timeout:1000});
  return structuredClone(context.result);
}

export function storageRoundtrip(file,item) {
  const source=readFileSync(new URL(`../../../${file}`,import.meta.url),'utf8');
  const load=source.match(/function _loadSharedStorage\(\)\{[^\n]+/)[0];
  const save=source.match(/function _saveSharedStorage\(arr\)\{[^\n]+/)[0];
  const context=vm.createContext({input:structuredClone(item)});
  vm.runInContext(`const _SHARED_STORAGE_KEY='fixture-only';let persisted;
    const localStorage={setItem:(key,value)=>{persisted=value},getItem:()=>persisted};
    ${load}\n${save}
    _saveSharedStorage([input]);globalThis.result=_loadSharedStorage()[0];`,context,{timeout:1000});
  return structuredClone(context.result);
}

async function withoutImplicitRng(action) {
  const original=Math.random;
  Math.random=()=>{throw Error('명시 RNG 밖 재롤 호출');};
  try{return await action();}finally{Math.random=original;}
}

export async function verifyBinding(api) {
  for(const name of ['create','read','restore'])assert.equal(typeof api[name],'function',`실제 ITEM adapter.${name} 필요`);
  let rngCalls=0;
  const rows=[];
  for(const file of ['game.html','game-easy-test.html'])for(const location of ['bag','equipped','storage']) {
    const base={uniqueId:'UI-10',slot:'armor',rarity:5,name:'새 제안 fixture',enh:7,tier:2,socketCount:0,affixes:[],custom:{preserve:true}};
    const untouched=structuredClone(base);
    const before=rngCalls;
    const created=await withoutImplicitRng(()=>api.create(base,()=>{rngCalls++;return .5;}));
    assert.equal(rngCalls-before,1,'신규 생성 명시 RNG1회');
    for(const [key,value] of Object.entries(untouched))assert.deepEqual(created[key],value,'기존 인스턴스 필드 보존');
    assert.equal(await withoutImplicitRng(()=>api.read(created)),.15,'정수15%는 .15저장');
    const stored=location==='storage'?storageRoundtrip(file,created):saveRoundtrip(file,created,location);
    const beforeRestore=structuredClone(stored);
    const restored=await withoutImplicitRng(()=>api.restore(stored,()=>{rngCalls++;throw Error('로드 재롤 금지');}));
    assert.deepEqual(restored,beforeRestore,'저장후 복원은 전체 인스턴스 불변');
    assert.deepEqual(stored,beforeRestore,'restore 입력 변이 금지');
    assert.equal(rngCalls-before,1);
    const readBefore=structuredClone(restored);
    const value=await withoutImplicitRng(()=>api.read(restored));
    assert.deepEqual(restored,readBefore,'read 입력 변이 금지');
    assert.equal(value,.15);
    assert.equal(fromStoredValue('UI-10',value),15);
    const player={rage:0},equipped={armor:restored};
    const consumer=createD10Consumer({enabled:true,readStoredRoll:api.read});
    const token=consumer.begin(player,equipped,'giantSlam');
    assert(token,'실제 D10 소비자가 저장 binding을 읽어야 함');
    assert.equal(consumer.consume(token,100),true);
    assert.equal(consumer.finish(token,true),15);
    rows.push({file,location,input:untouched,created,restored,storedValue:value,rngCalls:rngCalls-before});
    for(const legacy of legacyFixtures()) {
      const persisted=location==='storage'?storageRoundtrip(file,legacy):saveRoundtrip(file,legacy,location);
      const beforeLegacy=structuredClone(persisted);
      const count=rngCalls;
      const restoredLegacy=await withoutImplicitRng(()=>api.restore(persisted,()=>{rngCalls++;throw Error('legacy 재롤 금지');}));
      assert.deepEqual(restoredLegacy,beforeLegacy);
      assert.deepEqual(persisted,beforeLegacy);
      assert.equal(await withoutImplicitRng(()=>api.read(restoredLegacy)),null,'legacy/missing/unknown는 정상 binding 아님');
      assert.deepEqual(restoredLegacy,beforeLegacy);
      assert.equal(rngCalls,count);
      rows.push({file,location,legacy:beforeLegacy,restored:restoredLegacy,rngCalls:0});
    }
  }
  return {status:'actual_binding_checked',runtimeReady:false,creationRngCalls:rngCalls,rows};
}

export function sourceHashes() {
  return Object.fromEntries(['game.html','game-easy-test.html','unique-item-project/roll-values.js','tools/team-followup-20261001/ITEM/d10-consumer.mjs'].map(file=>[file,createHash('sha256').update(readFileSync(new URL(`../../../${file}`,import.meta.url))).digest('hex')]));
}
