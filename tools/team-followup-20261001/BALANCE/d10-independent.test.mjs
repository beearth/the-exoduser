import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runOriginal,scenarios,expectedRefund,verifyCandidate,sourceEvidence} from './d10-independent.mjs';

test('D10 실제 SSOT 조건/상한/단위·원함수 입력소모/피해·실패 게이트',()=>{
  const document=readFileSync(new URL('../../../docs/7아이템디자인/유니크_어픽스_리스트.md',import.meta.url),'utf8');
  const row=document.split('\n').find(line=>line.startsWith('| **U-D10**'));
  for(const contract of ['분노 100 이상','10~20%','하10~13/중14~16/상17~20','잔여 최대 `30`','P.rage=0','420f','래치를 재발동시키지'])assert(row.includes(contract));
  for(const scenario of scenarios()) {
    const result=runOriginal(scenario);
    assert.equal(result.rage,scenario.failed?scenario.rage:0);
    assert.equal(result.latch,scenario.latch);
    assert.equal(result.fullEvents,0);
    assert.equal(result.mats,scenario.failed?0:90);
    assert.equal(result.hits.length,scenario.failed?0:1);
    if(!scenario.failed)assert.equal(result.hits[0][3],Math.trunc(5*(1+scenario.rage*.19)));
    if(scenario.fusion)assert.equal(result.cooldown,420);
  }
  console.log(JSON.stringify({sourceHashes:sourceEvidence(),scenarios:scenarios().length}));
});

test('독립 oracle 명시 경계·비장착·잘못된 저장값',()=>{
  for(const scenario of scenarios()) {
    const refund=expectedRefund(scenario);
    assert(refund>=0&&refund<=30);
    if(scenario.rage<100||scenario.failed)assert.equal(refund,0);
  }
  const fixture={rage:100,item:{uniqueId:'UI-10',slot:'armor'}};
  assert.equal(expectedRefund({...fixture,stored:.1}),10);
  assert.equal(expectedRefund({...fixture,rage:150,stored:.2}),30);
  assert.equal(expectedRefund({...fixture,rage:1000,stored:.2}),30);
  assert.equal(expectedRefund({...fixture,rage:100.5,stored:.1}),10.05);
  assert.throws(()=>expectedRefund({...fixture,stored:20}),RangeError);
});

test('부정 변이: 미소모 원함수·99환급·피해변경·충만생성 모두 검출',async()=>{
  const mutants=[
    scenario=>runOriginal(scenario),
    scenario=>({...runOriginal(scenario),rage:scenario.failed?scenario.rage:Math.min(30,scenario.rage*scenario.stored)}),
    scenario=>({...runOriginal(scenario),rage:expectedRefund(scenario),hits:[[0,0,0,999]]}),
    scenario=>({...runOriginal(scenario),rage:expectedRefund(scenario),fullEvents:1})
  ];
  for(const mutant of mutants)await assert.rejects(()=>verifyCandidate(mutant));
});
