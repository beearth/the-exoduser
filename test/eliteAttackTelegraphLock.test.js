import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const start=html.indexOf('function _tickEliteAttackLock(');
const end=html.indexOf('// 엘리트 출현확률',start);
const helpers=start>=0&&end>start?html.slice(start,end):'';

test('elite heavy-attack telegraphs cannot overlap and lock expires on schedule',()=>{
  assert.ok(helpers,'shared elite attack lock helpers must exist');
  const scope={enemy:{modT:{}}};
  vm.runInNewContext(helpers+';globalThis.first=_claimEliteAttack(enemy,60);globalThis.blocked=_claimEliteAttack(enemy,45);_tickEliteAttackLock(enemy,59);globalThis.stillBlocked=_claimEliteAttack(enemy,45);_tickEliteAttackLock(enemy,1);globalThis.ready=_claimEliteAttack(enemy,45)',scope);
  assert.equal(scope.first,true);
  assert.equal(scope.blocked,false);
  assert.equal(scope.stillBlocked,false);
  assert.equal(scope.ready,true);
});

test('all elite area and ranged attacks claim the shared warning window',()=>{
  const combat=html.slice(html.indexOf('// M19 낙뢰:'),html.indexOf('// M23 영혼포식:'));
  for(const [id,frames] of [['M19',54],['M30',54],['M31',45],['M32',126]]){
    assert.ok(combat.includes(`e.mods.includes('${id}')`)&&combat.includes(`_claimEliteAttack(e,${frames})`),`${id} must reserve its warning window`);
  }
});

test('started lightning warning is not gated by current range',()=>{
  const combat=html.slice(html.indexOf('// M19 낙뢰:'),html.indexOf('// M23 영혼포식:'));
  const at=combat.indexOf("if(e.mods.includes('M31')");
  const end=combat.indexOf('// M32 지옥 포격',at);
  const block=combat.slice(at,end);
  assert.ok(block.startsWith("if(e.mods.includes('M31')){if(e._eliteBoltWarn>0)"),
    'an already-visible bolt warning must continue counting down outside 850px');
});
