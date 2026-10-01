import test from 'node:test';
import assert from 'node:assert/strict';
import {legacyFixtures,saveRoundtrip,storageRoundtrip,verifyBinding} from './binding-independent.mjs';

test('실제 저장표현/복원대입·공유창고 함수: legacy 전체객체 왕복 보존',()=>{
  for(const file of ['game.html','game-easy-test.html'])for(const item of legacyFixtures()) {
    assert.deepEqual(saveRoundtrip(file,item,'bag'),item);
    assert.deepEqual(saveRoundtrip(file,item,'equipped'),item);
    assert.deepEqual(storageRoundtrip(file,item),item);
  }
});

test('검증기는 누락 API·생성 재롤0·암묵 RNG 반례를 검출',async()=>{
  await assert.rejects(()=>verifyBinding({}),/실제 ITEM/);
  await assert.rejects(()=>verifyBinding({create:item=>item,read:()=>null,restore:item=>item}),/RNG1회/);
  await assert.rejects(()=>verifyBinding({create:()=>Math.random(),read:()=>null,restore:item=>item}),/명시 RNG 밖/);
});
