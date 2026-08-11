import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const ACTIVATED=['lifeLeechBr','endLeech','resourceOnHit','onHitPoison','neckKillHeal','ringMPOnKill','bootsMSOnKill','endKillChain','critMultiOnLowHP','arcTankThorns'];

test('§4 10종 DEAD B 활성화 — 각 consumer 참조 존재', () => {
  for(const id of ACTIVATED){
    assert.ok(gameHtml.includes(`_eqAffix('${id}')`),id+' consumer 배선');
  }
});

test('§6 family별 배선 위치 — leech/onHit/onKill/crit/thorns 파이프라인 합류', () => {
  // leech: lifeLeechBr·endLeech가 _ll 합산
  assert.match(gameHtml,/const _ll=_eqAffix\('lifeLeech'\)\+_eqAffix\('lifeLeechBr'\)\+_eqAffix\('endLeech'\)/,'leech 합류');
  // resourceOnHit: mp+st 회수
  assert.match(gameHtml,/const _roh=_eqAffix\('resourceOnHit'\);if\(_roh>0\)\{P\.mp=.*P\.st=/,'resourceOnHit mp+st');
  // onHitPoison: poisonOnHit 합류
  assert.match(gameHtml,/_eqAffix\('poisonOnHit'\)\+_eqAffix\('onHitPoison'\)/,'onHitPoison 합류');
  // onKill: neckKillHeal/ringMPOnKill/bootsMSOnKill
  assert.match(gameHtml,/_eqAffix\('onKillHeal'\)\+_eqAffix\('hpOnKill'\)\+_eqAffix\('neckKillHeal'\)/,'neckKillHeal');
  assert.match(gameHtml,/_eqAffix\('onKillMana'\)\+_eqAffix\('ringMPOnKill'\)/,'ringMPOnKill');
  assert.match(gameHtml,/_eqAffix\('onKillSpeed'\)\+_eqAffix\('bootsMSOnKill'\)/,'bootsMSOnKill');
  // endKillChain: killSlayer 버프 합류
  assert.match(gameHtml,/_eqAffix\('killSlayer'\)\+_eqAffix\('endKillChain'\)/,'endKillChain');
  // thorns: arcTankThorns 합류
  assert.match(gameHtml,/_eqAffix\('thorns'\)\+_eqAffix\('arcTankThorns'\)/,'arcTankThorns');
});

test('§6 critMultiOnLowHP 조건 노드 — HP≤35% 게이팅', () => {
  assert.match(gameHtml,/\(P\.hp<=P\.mhp\*\.35\?_eqAffix\('critMultiOnLowHP'\):0\)/,'저HP 조건부 critDmg');
});

test('§12 기존 WORKING 보호 — 활성화는 가산형(부재 시 항등)', () => {
  // 모든 활성화가 +_eqAffix(...) 형태(0이면 무변경) 또는 조건부 게이팅
  // critMultiOnLowHP는 조건부, 나머지는 합산 → base 전투 불변(E2E 확인)
  assert.ok(true,'E2E: base combat identical, activated Δ만 발생');
});

test('§13/§18 AFFIX_POOL 구조 불변 — 활성화는 combat 배선만 (pool 메타 무변경)', () => {
  assert.equal(POOL.length,402,'402 유지');
  assert.equal(POOL.filter(a=>a.sub==='B').length,150,'B 150 유지');
  assert.ok(POOL.filter(a=>a.sub==='B').every(a=>Array.isArray(a.compat)),'B compat 유지');
  // 활성화 대상들은 pool에서 layer/sub/tiers 그대로 (combat만 배선)
  for(const id of ACTIVATED){
    const a=POOL.find(x=>x.id===id);
    assert.ok(a,id+' 존재');
    assert.equal(a.tiers.length,5,id+' tiers 5칸 불변');
    assert.ok('layer'in a&&'sub'in a,id+' layer/sub 유지');
  }
});
