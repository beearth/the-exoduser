import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const start=html.indexOf('const ELITE_TIERS=[');
const end=html.indexOf('// ═══ 팩 리더 오라 시스템 ═══',start);
const source=start>=0&&end>start?html.slice(start,end):'';

function roll(tier,hell){
  const scope={SI_TO_HELL:[hell,hell,hell,hell,hell,hell,hell],Math:Object.create(Math)};
  scope.Math.random=()=>0.37;
  vm.runInNewContext(source+`;globalThis.result=rollMods(${tier},0)`,scope);
  return scope.result;
}

test('elite tiers receive the documented number of distinct modifiers',()=>{
  for(const [tier,count] of [[1,1],[2,2],[3,3]]){
    const mods=roll(tier,4);
    assert.equal(mods.length,count,`tier ${tier} should have ${count} modifiers`);
    assert.equal(new Set(mods).size,count,'a monster cannot roll the same modifier twice');
  }
});

test('champions gain two special attacks when at least two are unlocked',()=>{
  const mods=roll(3,4);
  assert.equal(mods.filter(id=>['M29','M30','M31','M32'].includes(id)).length,2,
    'champions should combine two unlocked attacks with one general modifier');
});
