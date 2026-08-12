import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 5A.1 / LOCK-26A] RAGE FOUNDATION HARDENING ═══
// rageMax 감소(rageMaxFlat 장비 해제) 시 current rage clamp invariant만 닫는다. 신규 affix/parry/giantSlam balance 변경 없음.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

// ── 실 _rageMax 추출 (stub deps) ──
function buildRageMax(rageMaxFlat, pRage=0, uRageMax=0){
  const fn=gameHtml.match(/function _rageMax\(\)\{return [^}]*\}/)[0];
  const _eqAffix=id=>id==='rageMaxFlat'?rageMaxFlat:0;
  const _uEq=()=>uRageMax;
  const PASSIVES={pRage};
  return new Function('_eqAffix','_uEq','PASSIVES',fn+';return _rageMax;')(_eqAffix,_uEq,PASSIVES);
}
// ── 소스 clamp 식 그대로: P.rage=Math.min(_rageMax(),P.rage||0) ── (equip 재계산 후)
function afterRecalc(currentRage, rageMaxFlat){
  const _rageMax=buildRageMax(rageMaxFlat);
  const P={rage:currentRage};
  P.rage=Math.min(_rageMax(),P.rage||0);   // 소스와 동일
  return P.rage;
}

// ══════════════════════════════════════════════════════════════
test('§1 배선 — applyStats 재계산 끝에 rage clamp (매프레임 아님)', () => {
  assert.match(gameHtml,/recalcSt\(\);\s*\n\s*P\.rage=Math\.min\(_rageMax\(\),P\.rage\|\|0\);/,'recalcSt 직후 clamp');
  // 매프레임 루프(update/tick)엔 clamp 없어야 — clamp 식은 소스에 1곳만
  assert.equal([...gameHtml.matchAll(/P\.rage=Math\.min\(_rageMax\(\),P\.rage\|\|0\)/g)].length,1,'clamp 배선 1곳(applyStats)만');
});

test('§2 _rageMax formula — rageMaxFlat이 cap에 반영', () => {
  assert.equal(buildRageMax(0)(),100,'base 100');
  assert.equal(buildRageMax(50)(),150,'+rageMaxFlat50 → 150');
  assert.equal(buildRageMax(100)(),200,'+100 → 200');
});

test('§3-A max 증가 → current 유지', () => {
  // max 100, rage 90 → max 150(rageMaxFlat 50 장착) → rage 90 유지
  assert.equal(afterRecalc(90,50),90,'rage 90 ≤ new max 150 → 불변');
});

test('§3-B max 감소 → current clamp', () => {
  // max 150, rage 140 → rageMaxFlat 제거(max 100) → rage 100
  assert.equal(afterRecalc(140,0),100,'rage 140 > new max 100 → 100으로 clamp');
});

test('§3-C 감소 전 current가 이미 새 max 이하 → 불변', () => {
  assert.equal(afterRecalc(80,0),80,'rage 80 ≤ 100 → 불변');
});

test('§3-D rageMaxFlat=0 base parity → 기존 behavior 동일', () => {
  // 기존: rage는 gain 시 min(100,...)로 이미 ≤100. clamp 통과해도 불변.
  for(const r of [0,10,50,100]) assert.equal(afterRecalc(r,0),r,'base(max100) rage '+r+' 불변');
  // invariant: 어떤 (rage,flat)에서도 결과 ≤ max
  for(const flat of [0,20,50]) for(const r of [0,50,120,300]) assert.ok(afterRecalc(r,flat)<=buildRageMax(flat)(),'current≤max 보장');
});

test('§4 giantSlam consume / parry gain regression — 소스 무변경', () => {
  assert.match(gameHtml,/P\.rage=0;/,'giantSlam 전량소비(=0) 유지');
  assert.match(gameHtml,/if\(P\.rage>0\)\{/,'소비는 P.rage>0 게이팅(0이면 스킵=double consume 없음)');
  assert.match(gameHtml,/P\.rage=Math\.min\(_rageMax\(\),P\.rage\+_rageAdd\);/,'parry gain clamp 무변경');
  assert.match(gameHtml,/P\.rage=Math\.min\(_rMax,P\.rage\+10\)/,'피격 gain clamp 무변경');
});

test('§5 rageDmg formula 무변경 (giantSlam rage burst 전용)', () => {
  assert.match(gameHtml,/const _rageDmgAf=1\+\(_eqAffix\('rageDmg'\)\|\|0\);/,'rageDmg 소비뎀 배율 무변경');
  assert.match(gameHtml,/const _rageMul=1\+\(P\.rage\*0\.19\*\(1\+\(PASSIVES\.pRage\|\|0\)\*0\.10\)\*_rageDmgAf\);/,'_rageMul 공식 무변경');
});

test('§6 reset safety — dbRestore=0, stage carry(미변경)', () => {
  assert.match(gameHtml,/P\.rage=0; \/\/ 분노게이지/,'dbRestore rage=0(세션 로드 reset)');
  // stage carry: clamp 추가 외에 stage 경로 P.rage 신규 mutation 없음 — P.rage 대입은 정확히 4곳(dbRestore·parry·hit·giantSlam) + clamp 1곳
  const muts=[...gameHtml.matchAll(/P\.rage=(?!=)/g)].length; // P.rage= (== 제외)
  assert.equal(muts,5,'P.rage 대입 = 4(기존)+1(clamp)만 (stage/death 신규 reset 없음)');
});
