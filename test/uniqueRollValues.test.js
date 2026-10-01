import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { UNIQUE_DEFINITIONS } from '../unique-item-project/definitions.js';
import { ROLL_PROPOSALS,lookupRoll,rollValue,toStoredValue,fromStoredValue,describeRoll } from '../unique-item-project/roll-values.mjs';

const document = readFileSync(new URL('../docs/7아이템디자인/유니크_어픽스_리스트.md',import.meta.url),'utf8');
function adjacent(value,direction) {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0,value);
  view.setBigUint64(0,view.getBigUint64(0)+BigInt(direction));
  return view.getFloat64(0);
}

test('22종 정의/제안 비활성 및 명시 D10 구간',()=>{
  assert.equal(ROLL_PROPOSALS.length,22);
  assert.deepEqual(ROLL_PROPOSALS.map(entry=>entry.uniqueId),UNIQUE_DEFINITIONS.map(entry=>entry.uniqueId));
  assert.deepEqual(lookupRoll('UI-10').bands.map(entry=>[entry.min,entry.max]),[[10,13],[14,16],[17,20]]);
  assert(Object.isFrozen(ROLL_PROPOSALS));
});

for (const proposal of ROLL_PROPOSALS) {
  test(`${proposal.uniqueId}: 실제 D행 구간·단위·stat 일치 및 모든 값 JSON 왕복`,()=>{
    const row = document.split('\n').find(line=>line.startsWith(`| **${proposal.effectId}**`));
    assert(row);
    const cell = row.split('|')[3];
    assert(new RegExp(`\\*\\*[^*]*${proposal.min}~${proposal.max}[^*]*\\*\\*`).test(cell));
    assert(row.includes(`\`${proposal.stat}\``));
    const range = band=>band.min===band.max ? `${band.min}` : `${band.min}~${band.max}`;
    assert(cell.includes(`하${range(proposal.bands[0])}/중${range(proposal.bands[1])}/상${range(proposal.bands[2])}`));
    assert.equal(proposal.unit==='frame',cell.includes('저장 정수 f'));
    assert.equal(proposal.unit==='percent',cell.includes('%; 저장'));
    if(proposal.unit==='percent') {
      const storedRange=cell.match(/저장 `([\d.]+)~([\d.]+)`/);
      assert(storedRange);
      assert.equal(Number(storedRange[1]),proposal.min/100);
      assert.equal(Number(storedRange[2]),proposal.max/100);
    }
    assert.equal(proposal.unit==='rage',cell.includes('저장 정수 분노'));
    assert.equal(proposal.unit==='count',/저장 정수 (발|개)/.test(cell));
    assert.equal(lookupRoll(proposal.effectId),proposal);
    assert.equal(proposal.runtimeReady,false);
    assert.equal(proposal.status,'proposal');
    for(let raw=proposal.min;raw<=proposal.max;raw++) {
      const stored = toStoredValue(proposal.uniqueId,raw);
      assert.equal(fromStoredValue(proposal.uniqueId,JSON.parse(JSON.stringify(stored))),raw);
      const result = describeRoll(proposal.uniqueId,raw);
      assert.equal(result.raw,raw);
      assert.equal(result.stored,stored);
      assert.equal(result.exactDisplay.numerator,raw);
      assert.equal(result.exactDisplay.denominator,proposal.unit==='frame'?60:1);
      assert.equal(result.band,proposal.bands.find(band=>raw>=band.min&&raw<=band.max).label);
    }
  });
  test(`${proposal.uniqueId}: 모든 균등선택 경계 직전/동일/직후·RNG1회`,()=>{
    const count=proposal.max-proposal.min+1;
    for(let index=0;index<count;index++) {
      const midpoint=(index+.5)/count;
      let calls=0;
      assert.equal(rollValue(proposal.uniqueId,()=>{calls++;return midpoint;}).raw,proposal.min+index);
      assert.equal(calls,1);
      if(index===0)continue;
      const boundary=index/count;
      for(const [sample,expected] of [[adjacent(boundary,-1),index-1],[boundary,index],[adjacent(boundary,1),index]]) {
        assert.equal(rollValue(proposal.uniqueId,()=>sample).raw,proposal.min+expected);
      }
    }
    assert.equal(rollValue(proposal.uniqueId,()=>0).raw,proposal.min);
    assert.equal(rollValue(proposal.uniqueId,()=>adjacent(1,-1)).raw,proposal.max);
  });
  test(`${proposal.uniqueId}: 잘못된 raw/저장값 거부`,()=>{
    for(const value of [null,'20',NaN,Infinity,-Infinity,proposal.min-.5,proposal.max+1,proposal.min-1]) {
      assert.throws(()=>toStoredValue(proposal.uniqueId,value),RangeError);
      assert.throws(()=>describeRoll(proposal.uniqueId,value),RangeError);
    }
    for(const value of [null,'0.2',NaN,Infinity,-Infinity,toStoredValue(proposal.uniqueId,proposal.min)-.001,toStoredValue(proposal.uniqueId,proposal.max)+.001]) {
      assert.throws(()=>fromStoredValue(proposal.uniqueId,value),RangeError);
    }
    const fractionalStored=proposal.unit==='percent'?(proposal.min+.5)/100:proposal.min+.5;
    assert.throws(()=>fromStoredValue(proposal.uniqueId,fractionalStored),RangeError);
    if(proposal.unit==='percent')assert.throws(()=>fromStoredValue(proposal.uniqueId,proposal.min),RangeError);
  });
}

test('잘못된 ID/RNG는 거부·유효 RNG 정확히1회·ID 오류 시0회',()=>{
  let calls=0;
  for(const id of [null,undefined,{},1,'UI-00','U-D23',' UI-01']) {
    assert.throws(()=>rollValue(id,()=>{calls++;return 0;}),RangeError);
    assert.throws(()=>lookupRoll(id),RangeError);
  }
  assert.equal(calls,0);
  assert.throws(()=>rollValue('UI-01'),TypeError);
  for(const value of [null,'0',NaN,Infinity,-.01,1]) {
    let attempts=0;
    assert.throws(()=>rollValue('UI-01',()=>{attempts++;return value;}),RangeError);
    assert.equal(attempts,1);
  }
});

test('프레임 표시 반올림·손실없는 원값·%와 count/rage 분리',()=>{
  assert.equal(describeRoll('UI-03',20).text,'0.33초');
  assert.deepEqual(describeRoll('UI-03',20).exactDisplay,{numerator:20,denominator:60});
  assert.equal(describeRoll('UI-18',1).text,'1%');
  assert.equal(toStoredValue('UI-18',1),.01);
  assert.equal(describeRoll('UI-16',2).text,'2발');
  assert.equal(describeRoll('UI-17',1).text,'1개');
  assert.equal(describeRoll('UI-21',20).text,'20분노');
});
