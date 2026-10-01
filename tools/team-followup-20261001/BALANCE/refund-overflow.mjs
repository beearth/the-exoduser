import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = new URL('../../../', import.meta.url);
const evidence = [];
const patches = [];
for (const file of ['game.html', 'game-easy-test.html']) {
  const source = readFileSync(new URL(file, root), 'utf8');
  function between(start, end) {
    const startIndex = source.indexOf(start);
    const endIndex = source.indexOf(end, startIndex + start.length);
    assert(startIndex >= 0 && endIndex > startIndex);
    return source.slice(startIndex, endIndex);
  }
  const salvage = between('function _itemEconomyRarity(', 'function useQuickslot(');
  const equip = between('function equipItem(', '// ═══ 결정 자동 전승');
  const recordLine = equip.split('\n').find(line => line.includes('old._enhRefund=~~'));
  assert(recordLine);
  const transfer = recordLine.trim() + '\nold.enh=0;';
  assert(equip.includes('old.enh=0;'));
  const correctedSalvage = salvage.replace('enhRefund=~~(totalCost*0.5)', 'enhRefund=Math.floor(totalCost*0.5)');
  const correctedTransfer = transfer.replace('old._enhRefund=~~(_tc*0.5)', 'old._enhRefund=Math.floor(_tc*0.5)');
  assert.notEqual(correctedSalvage, salvage);
  assert.notEqual(correctedTransfer, transfer);
  const context = vm.createContext({});
  vm.runInContext(`${salvage}
    globalThis.original=salvageVal;
    ${correctedSalvage.replace('function salvageVal(', 'function candidateSalvageVal(')}
    globalThis.candidate=candidateSalvageVal;
    globalThis.originalTransfer=(old,fromE)=>{${transfer}};
    globalThis.candidateTransfer=(old,fromE)=>{${correctedTransfer}};`, context, {timeout:1000});
  function evaluate(kind, item) {
    assert(Number.isInteger(item.enh) && item.enh >= 0 && item.enh <= 300000);
    context.input = structuredClone(item);
    return vm.runInContext(`${kind}(input)`, context, {timeout:1000});
  }
  const rows = [];
  for (let rarity = 0; rarity <= 5; rarity++) {
    const multiplier = [.5,.7,1,1.3,1.8][Math.min(rarity,4)];
    const base = [1000,2000,10000,20000,50000][Math.min(rarity,4)];
    let total = 0;
    let boundary = null;
    for (let enhancement = 1; enhancement <= 300000; enhancement++) {
      const index = enhancement-1;
      total += Math.ceil(Math.max(1, Math.ceil((1+index*.15)*1.5))*multiplier);
      if (Math.floor(total*.5) > 2147483647) { boundary = enhancement; break; }
    }
    const levels = new Set([0,1,10,100,1000,200000]);
    if (boundary !== null) {levels.add(boundary-1); levels.add(boundary);}
    for (const enh of levels) {
      let sum = 0;
      for (let index = 0; index < enh; index++) sum += Math.ceil(Math.max(1,Math.ceil((1+index*.15)*1.5))*multiplier);
      const refund = Math.floor(sum*.5);
      const item = {rarity,enh,tier:3};
      const original = evaluate('original',item);
      const candidate = evaluate('candidate',item);
      assert.equal(candidate,base+refund+6);
      if (refund <= 2147483647) assert.equal(candidate,original);
      else assert.notEqual(candidate,original);
      context.old = structuredClone(item);
      context.fromE = enh;
      vm.runInContext('candidateTransfer(old,fromE)',context,{timeout:1000});
      const persisted = JSON.parse(JSON.stringify(context.old));
      assert.equal(persisted.enh,0);
      assert.equal(persisted._enhRefund,refund);
      assert.equal(evaluate('candidate',persisted),candidate);
      context.old = structuredClone(item);
      vm.runInContext('originalTransfer(old,fromE)',context,{timeout:1000});
      assert.equal(context.old._enhRefund,refund|0);
      rows.push({rarity,enh,refund,original,candidate,originalRecord:context.old._enhRefund,roundTripRecord:persisted._enhRefund});
    }
    for (const record of [-244589796,0,15,4050377500]) {
      const item = JSON.parse(JSON.stringify({rarity,enh:0,tier:2,_enhRefund:record}));
      assert.equal(evaluate('candidate',item),base+Math.max(0,record)+4);
      assert.equal(evaluate('original',item),evaluate('candidate',item));
      assert.equal(item._enhRefund,record);
    }
    assert.notEqual(boundary,null);
    rows.push({rarity,firstSigned32Overflow:boundary,searchLimit:300000});
  }
  const red = evaluate('original',{rarity:4,enh:200000,tier:0});
  const green = evaluate('candidate',{rarity:4,enh:200000,tier:0});
  assert.equal(red,-244539796);
  assert.equal(green,4050427500);
  evidence.push({file,sha256:createHash('sha256').update(source).digest('hex'),red,green,rows});
  const lines = source.split('\n');
  patches.push(`--- a/${file}\n+++ b/${file}`);
  for (const [before,after] of [
    ['enhRefund=~~(totalCost*0.5);','enhRefund=Math.floor(totalCost*0.5);'],
    ['old._enhRefund=~~(_tc*0.5);','old._enhRefund=Math.floor(_tc*0.5);']
  ]) {
    const index = lines.findIndex(line=>line.includes(before));
    assert(index>0);
    assert.equal(lines.filter(line=>line.includes(before)).length,1);
    patches.push(`@@ -${index},3 +${index},3 @@\n ${lines[index-1]}\n-${lines[index]}\n+${lines[index].replace(before,after)}\n ${lines[index+1]}`);
  }
}
console.log(process.argv.includes('--diff') ? patches.join('\n') : JSON.stringify({verdict:'후보 원식 회귀 PASS',scope:'salvageVal 및 equipItem 기록 블록+old.enh=0 추출; 전체 equipItem/실제 저장은 미실행',evidence},null,2));
