import test from 'node:test';
import assert from 'node:assert/strict';
import {createD10Consumer} from '../ITEM/d10-consumer.mjs';
import {runD10Scenario} from './d10-item-adapter.mjs';
import {verifyCandidate,runOriginal,SOURCE_FILES} from './d10-independent.mjs';

test('실제 ITEM 후보148입력 및 두 연속시전 독립 비교',async()=>{
  const result=await verifyCandidate(runD10Scenario);
  assert.equal(result.rows.length,150);
});

test('실제 함수 동기 재진입: 원피해/쿨/자원/래치 동일·외부1회 환급',()=>{
  for(const file of SOURCE_FILES) {
    const scenario={file,rage:100,stored:.2,item:{uniqueId:'UI-10',slot:'armor'},latch:true,reentrant:true};
    const original=runOriginal(scenario);
    const candidate=runD10Scenario(scenario);
    assert.equal(original.hits.length,2);
    assert.deepEqual(candidate,{...original,rage:20});
  }
});

test('실제 함수 비활성/부정 저장롤은 원결과 동일',()=>{
  for(const file of SOURCE_FILES)for(const stored of [undefined,20,'0.2',.155,NaN,Infinity,.09,.21]) {
    const scenario={file,rage:150,stored,item:{uniqueId:'UI-10',slot:'armor'},latch:false};
    assert.deepEqual(runD10Scenario(scenario),runOriginal(scenario));
  }
  for(const file of SOURCE_FILES) {
    const scenario={file,rage:150,stored:.2,item:{uniqueId:'UI-10',slot:'armor'},latch:true,disabled:true};
    assert.deepEqual(runD10Scenario(scenario),runOriginal(scenario));
  }
});

function fixture() {
  const player={rage:0,_rageFullLatch:true};
  const equipped={armor:{uniqueId:'UI-10',slot:'armor',stored:.2}};
  const consumer=createD10Consumer({enabled:true,readStoredRoll:item=>item.stored});
  return {player,equipped,consumer};
}

test('실제 token 중복consume/finish·위조·재진입·실패 후 재개',()=>{
  const {player,equipped,consumer}=fixture();
  const token=consumer.begin(player,equipped,'giantSlam');
  assert(token);
  assert.equal(consumer.begin(player,equipped,'giantSlam'),null);
  assert.equal(consumer.consume({},100),false);
  assert.equal(consumer.finish({},true),0);
  assert.equal(consumer.consume(token,99.5),false);
  assert.equal(consumer.consume(token,100),true);
  assert.equal(consumer.consume(token,150),false);
  assert.equal(consumer.finish(token,true),20);
  player.rage=0;
  assert.equal(consumer.finish(token,true),0);
  assert.equal(player.rage,0);
  assert.equal(player._rageFullLatch,true);
  const failed=consumer.begin(player,equipped,'giantSlam');
  assert.equal(consumer.consume(failed,150),true);
  assert.equal(consumer.finish(failed,false),0);
  assert(consumer.begin(player,equipped,'giantSlam'));
});

test('실제 token 장착교체/다른분노생성/미소모는 추가 환급 없음',()=>{
  for(const mode of ['equipment','rage','no-consume']) {
    const {player,equipped,consumer}=fixture();
    const token=consumer.begin(player,equipped,'giantSlam');
    if(mode!=='no-consume')consumer.consume(token,150);
    if(mode==='equipment')equipped.armor={...equipped.armor};
    if(mode==='rage')player.rage=5;
    assert.equal(consumer.finish(token,true),0);
    assert.equal(player.rage,mode==='rage'?5:0);
  }
});
