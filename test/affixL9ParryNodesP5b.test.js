import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 5B / LOCK-27] L9 RAGE — PARRY BEHAVIOR NODES BATCH 1 ═══
// afterParryShield 구현(shieldOnKill 선례). onParryBurst=DUPLICATE(parryExplosion). recentParryDmg=HOLD_SEMANTIC(duration 근거 없음).
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const by=id=>POOL.find(a=>a.id===id);

// ── afterParryShield 실 블록 추출 실행 ──
function applyParryShield(shield, mshield, affixVal){
  const blk=gameHtml.match(/\{const _apS=_eqAffix\('afterParryShield'\);if\(_apS>0\)\{P\.shield=Math\.min\(P\.mshield,P\.shield\+_apS\);[^\n]*\}\}/)[0];
  const P={shield, mshield, x:0, y:0, hp:1000, mhp:1000, rage:50};
  const _eqAffix=id=>id==='afterParryShield'?affixVal:0;
  new Function('P','_eqAffix','_T','addTxt',blk)(P,_eqAffix,s=>s,()=>{});
  return P;
}

// ══════════════════════════════════════════════════════════════
test('§1 3종 원본 def 확인', () => {
  const ob=by('onParryBurst'), aps=by('afterParryShield'), rpd=by('recentParryDmg');
  assert.deepEqual([ob.layer,ob.sub,ob.unit,ob.slots[0]],[9,'B','pct','shield']);
  assert.deepEqual([aps.layer,aps.sub,aps.unit],[9,'B','val']);
  assert.deepEqual(aps.tiers,[10,18,28,40,60]);
  assert.deepEqual([rpd.layer,rpd.sub,rpd.unit],[9,'A','pct']);
});

test('§2 onParryBurst = DUPLICATE (parryExplosion과 동일 parry-burst mechanic) → 미구현', () => {
  // parryExplosion = 이미 WORKING 보장 parry AoE burst
  assert.match(gameHtml,/if\(_eqAffix\('parryExplosion'\)>0\)\{const _peD=~~\(meleeRef\(\)\*statStr\(\)\*_eqAffix\('parryExplosion'\)\)/,'parryExplosion 보장 burst 존재');
  // onParryBurst는 신규 consumer 미생성(DUPLICATE) — _eqAffix('onParryBurst') 소비 0
  assert.equal([...gameHtml.matchAll(/_eqAffix\('onParryBurst'\)/g)].length,0,'onParryBurst consumer 미생성(DUPLICATE)');
});

test('§3 recentParryDmg = HOLD_SEMANTIC (duration 근거 없음) → 미구현', () => {
  assert.equal([...gameHtml.matchAll(/_eqAffix\('recentParryDmg'\)/g)].length,0,'recentParryDmg consumer 미생성(HOLD)');
  // 자체 데이터에 duration 필드 없음(tiers=pct only)
  assert.deepEqual(by('recentParryDmg').tiers,[.12,.20,.32,.46,.65]);
  // _killBuff는 killSlayer 전용(공유 시 충돌) — recentParryDmg가 이를 건드리지 않음
  assert.ok(!/recentParryDmg[\s\S]{0,80}_killBuff|_killBuff[\s\S]{0,80}recentParryDmg/.test(gameHtml),'killSlayer buff와 미충돌');
});

test('§4 afterParryShield 배선(소스 앵커) — shieldOnKill 선례', () => {
  assert.match(gameHtml,/const _apS=_eqAffix\('afterParryShield'\);if\(_apS>0\)\{P\.shield=Math\.min\(P\.mshield,P\.shield\+_apS\);/,'parry 시 shield flat 회복(cap mshield)');
  assert.match(gameHtml,/const _okSh=_eqAffix\('shieldOnKill'\);if\(_okSh>0\)P\.shield=Math\.min\(P\.mshield,P\.shield\+_okSh\)/,'shieldOnKill 선례 무변경');
});

test('§5 afterParryShield E2E — A~E, cap/HP/rage', () => {
  // A. shield 0, val 60
  let P=applyParryShield(0,200,60);
  assert.equal(P.shield,60,'A: 0→60');assert.equal(P.hp,1000,'HP 불변');assert.equal(P.rage,50,'rage 불변');
  // B. partial 100 → 160
  assert.equal(applyParryShield(100,200,60).shield,160,'B: 100→160');
  // C. cap 직전 180 → min(200,240)=200 (초과 없음)
  assert.equal(applyParryShield(180,200,60).shield,200,'C: cap clamp 200(초과 없음)');
  // D. affix0 → 불변
  assert.equal(applyParryShield(100,200,0).shield,100,'D: affix0 불변');
  // E. 연속 parry (0→60→120)
  let s=0;s=applyParryShield(s,200,60).shield;s=applyParryShield(s,200,60).shield;
  assert.equal(s,120,'E: 연속 2회 스택 0→60→120');
});

test('§6 afterParryShield — RNG 없음(unit=val), parry당 1회', () => {
  const blk=gameHtml.match(/\{const _apS=_eqAffix\('afterParryShield'\);if\(_apS>0\)\{[^\n]*\}\}/)[0];
  assert.ok(!/random/.test(blk),'Math.random 미추가(deterministic)');
  // parryExplosion과 같은 doParry 블록(단일 parry event당 1회) — addTxt 각 1회
  assert.equal([...gameHtml.matchAll(/🛡패링실드\+/g)].length,1,'afterParryShield 배선 1곳(doParry)');
});

test('§7 Rage foundation regression (무변경)', () => {
  assert.match(gameHtml,/P\.rage=Math\.min\(_rageMax\(\),P\.rage\+_rageAdd\);/,'parry rage gain');
  assert.match(gameHtml,/P\.rage=Math\.min\(_rMax,P\.rage\+10\)/,'hit rage gain');
  assert.match(gameHtml,/P\.rage=Math\.min\(_rageMax\(\),P\.rage\|\|0\);/,'equip rage clamp(5A.1)');
  assert.match(gameHtml,/const _rageMul=1\+\(P\.rage\*0\.19/,'rageDmg/rageMul 무변경');
  // afterParryShield는 P.rage 미접촉
  const blk=gameHtml.match(/\{const _apS=_eqAffix\('afterParryShield'\);[^\n]*\}\}/)[0];
  assert.ok(!/rage/.test(blk),'afterParryShield는 P.rage 직접 mutation 없음');
});

test('§8 WORKING L9 보호 — parryBonus/parryExplosion/rageMaxFlat/rageDmg', () => {
  assert.match(gameHtml,/_eqAffix\('parryBonus'\)/);
  assert.match(gameHtml,/_eqAffix\('parryExplosion'\)>0/);
  assert.match(gameHtml,/_eqAffix\('rageMaxFlat'\)/);
  assert.match(gameHtml,/const _rageDmgAf=1\+\(_eqAffix\('rageDmg'\)/);
  // afterParryShield는 신규 ID 아님(기존 affix 배선) — POOL 410 불변
  assert.equal(POOL.length,410);assert.equal(POOL.filter(a=>a.sub==='B').length,158);
});
