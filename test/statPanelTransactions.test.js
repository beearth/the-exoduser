import test from 'node:test';
import assert from 'node:assert/strict';
import '../stat-panel-ui.js';

const ui = globalThis.ExoduserStatsPanel;
test('stat allocations conserve SP, enforce caps and reject partial bulk purchases', () => {
  assert.deepEqual(ui.statChange(490, 500, 10, 10), {value:500, points:0});
  assert.equal(ui.statChange(495, 500, 10, 10), null);
  assert.equal(ui.statChange(0, 500, 8, 10), null);
  assert.equal(ui.statChange(0, 500, 8, -1), null);
  assert.deepEqual(ui.statChange(900, Infinity, 10, 10), {value:910, points:0});
  assert.deepEqual(ui.statChange(910, Infinity, 0, -10), {value:900, points:10});
});
test('passive rank transitions charge and refund the exact tier cost', () => {
  for (let rank=0;rank<10;rank++) {
    const bought=ui.passiveChange(rank,10,23,1);
    assert.equal(bought.value,rank+1);
    assert.deepEqual(ui.passiveChange(bought.value,10,bought.points,-1),{value:rank,points:23});
  }
  assert.equal(ui.passiveChange(3,10,1,1),null);
  assert.deepEqual(ui.passiveChange(3,10,2,1),{value:4,points:0});
  assert.equal(ui.passiveChange(10,10,100,1),null);
  assert.equal(ui.passiveChange(0,10,0,-1),null);
  assert.deepEqual(ui.passiveChange(10,20,5,1),{value:11,points:0});
});
test('full respec returns all spent SP including legacy VIT and grit, and tiered AP', () => {
  assert.deepEqual(ui.refundTotals({str:20,dex:10,int:0,lck:0,vit:4},{pAtk:10,pMagic:4,pGuard:0},7),{sp:41,ap:28});
  assert.deepEqual(ui.refundTotals({str:0},{pAtk:0},0),{sp:0,ap:0});
});
test('invalid transaction sizes cannot alter point balances', () => {
  for(const n of [0,NaN,Infinity,0.5]) assert.equal(ui.statChange(1,500,10,n),null);
  for(const n of [0,2,-2,NaN]) assert.equal(ui.passiveChange(1,10,10,n),null);
});
