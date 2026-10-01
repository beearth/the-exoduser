import test from 'node:test';
import assert from 'node:assert/strict';
import * as adapter from './binding-item-adapter.mjs';
import {verifyBinding,saveRoundtrip,storageRoundtrip} from './binding-independent.mjs';
import {createD10ProposalInstance,inspectD10Binding,createBoundD10Consumer} from '../ITEM/binding-d10.mjs';

test('BALANCE 실제 ITEM adapter 직접실행42행·생성RNG6/로드0',async()=>{
  const result=await verifyBinding(adapter);
  assert.equal(result.rows.length,42);
  assert.equal(result.creationRngCalls,6);
  assert.equal(result.rows.filter(row=>row.legacy).length,36);
  for(const row of result.rows)assert.equal(row.rngCalls,row.legacy?0:1);
});

function fresh() {
  return adapter.create({uniqueId:'UI-10',slot:'armor',rarity:5,name:'제안검수'},()=>.5);
}

test('schema/version/unit/stat/effect/value 부정입력은 실제저장왕복 뒤 정상roll 오인0',()=>{
  const changes=[
    item=>{item.uniqueRoll=null;},
    item=>{item.uniqueRoll=[];},
    item=>{delete item.uniqueRoll;},
    item=>{delete item.uniqueRoll.version;},
    item=>{item.uniqueRoll.version=2;},
    item=>{item.uniqueRoll.version='1';},
    item=>{item.uniqueRoll.unit='percent';},
    item=>{item.uniqueRoll.effectId='U-D11';},
    item=>{item.uniqueRoll.stat='_uArmorRage';},
    item=>{item.uniqueRoll.storedValue=15;},
    item=>{item.uniqueRoll.storedValue=.155;},
    item=>{item.uniqueRoll.storedValue='0.15';},
    item=>{item.uniqueRoll.storedValue=null;},
    item=>{item.uniqueId='unknown-id';},
    item=>{item.slot='helmet';}
  ];
  for(const file of ['game.html','game-easy-test.html'])for(const location of ['bag','equipped','storage'])for(const change of changes) {
    const item=fresh();change(item);
    const saved=location==='storage'?storageRoundtrip(file,item):saveRoundtrip(file,item,location);
    const snapshot=structuredClone(saved);
    assert.equal(adapter.restore(saved),saved,'restore 명시 no-op 동일 객체');
    assert.equal(adapter.read(saved),null);
    assert.notEqual(inspectD10Binding(saved).status,'valid');
    const consumer=createBoundD10Consumer({enabled:true});
    assert.equal(consumer.begin({rage:100},{armor:saved},'giantSlam'),null);
    assert.deepEqual(saved,snapshot);
  }
});

test('신규생성 input 보존·core/ports 중복생성 거부·RNG추가0',()=>{
  const base={slot:'armor',rarity:5,affixes:[],uniqueSpecial:null};
  const before=structuredClone(base);
  let calls=0;
  const created=createD10ProposalInstance({newItem:base,rng:()=>{calls++;return .5;}});
  assert.deepEqual(base,before);
  assert.equal(calls,1);
  const snapshot=structuredClone(created);
  const failRng=()=>{calls++;throw Error('중복시 RNG호출 금지');};
  assert.throws(()=>createD10ProposalInstance({newItem:created,rng:failRng}),TypeError);
  assert.throws(()=>adapter.create(created,failRng),TypeError);
  assert.deepEqual(created,snapshot);
  assert.equal(calls,1);
});

test('restore/read 재롤0 및 실제 bound consumer 비활성/활성 소비 차등',()=>{
  const created=fresh();
  const loaded=JSON.parse(JSON.stringify(created));
  const before=structuredClone(loaded);
  assert.equal(adapter.restore(loaded,()=>{throw Error('로드 재롤');}),loaded);
  for(let iteration=0;iteration<3;iteration++)assert.equal(adapter.read(loaded),.15);
  assert.deepEqual(loaded,before);
  const player={rage:0},equipped={armor:loaded};
  assert.equal(createBoundD10Consumer().begin(player,equipped,'giantSlam'),null);
  const active=createBoundD10Consumer({enabled:true});
  const token=active.begin(player,equipped,'giantSlam');
  assert(token);
  assert.equal(active.consume(token,100),true);
  assert.equal(active.finish(token,true),15);
  assert.deepEqual(loaded,before);
});
