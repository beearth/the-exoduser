import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// ENEMY-F06 결정적 하니스 — 메인 적 루프 타임버짓 break(game.html:32855)로 인한
// 배열 꼬리 인덱스 AI 기아를 재현·계측한다. (공용 update/render/loop는 QA 소유 → 여기선 계측만)
//
// physics tick vs render frame:
//   update()(적 루프 포함)는 loop()의 while(_acc>=PHYS_STEP)에서 physics tick당 1회 실행(PHYS_STEP=1000/60=16.667ms).
//   draw()는 render frame당 1회(별도). 타임버짓 break는 tick마다 _eUpdateStart로 리셋.
//   ⇒ 기아 정지시간 = 연속 스킵 tick 수 × 16.667ms(게임시간). 렌더는 계속 → 적은 "보이지만 AI 정지".
//
// 충실 복제 게이팅(실제 소스):
//   break:  if(_ei%32===0 && _ei>0 && !e.ib && now-start > 12ms) break   ← 인덱스≥break점 전부 미처리(timers 포함)
//   T1 <150px(_ed2<22500) 또는 ib/hurt/charge-commit: updateE 매tick
//   T2 <350px(_ed2<122500): (tierFrame&1)===(_ei&1) / T3 <700px: &3 / T4: &7
//   상태 타이머 감소 블록(32880: stunned/_hitStun/_pImmune/reviveIframes)은 break '이후' → 기아 적은 타이머도 정지.

const src = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const PHYS_STEP = 1000/60; // 16.667ms

test('하니스 게이팅이 실제 소스와 일치(충실성)', () => {
  assert.match(src, /_ei%\(IS_MOBILE\?8:32\)===0&&_ei>0&&!e\.ib&&performance\.now\(\)-_eUpdateStart>\(IS_MOBILE\?8:12\)\)break/, '타임버짓 break 시그니처');
  assert.match(src, /const PHYS_STEP=1000\/60;/, 'PHYS_STEP=1000/60');
  assert.match(src, /while\(_acc>=PHYS_STEP\)\{[\s\S]{0,60}?update\(\);/, 'update()는 physics tick 루프 내');
  assert.match(src, /_ed2<22500/, 'T1 임계'); assert.match(src, /_ed2<122500/, 'T2 임계'); assert.match(src, /_ed2<490000/, 'T3 임계');
  assert.match(src, /\(G\._eTierFrame&1\)===\(_ei&1\)/, 'T2 스케줄');
  // 상태 타이머 블록이 break(32855) '이후'(32880 부근)에 있음: break 라인이 타이머 라인보다 앞
  const iBreak=src.indexOf("!e.ib&&performance.now()-_eUpdateStart");
  const iTimer=src.indexOf("if(e.stunned>0)e.stunned-=sp;");
  assert.ok(iBreak>0 && iTimer>iBreak, '상태 타이머 감소가 break 이후에 위치(기아 시 타이머도 정지)');
});

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function tierOf(d2){ if(d2<22500)return 1; if(d2<122500)return 2; if(d2<490000)return 3; return 4; }

// 적 생성: 스폰순서=배열인덱스(거리 무상관). tailEssentials=꼬리에 보스/피격/대시 주입 여부
function buildEnemies({N, seed, nearFrac, inViewPx, injectTail}){
  const rnd=mulberry32(seed); const inView2=inViewPx*inViewPx; const E=[];
  for(let i=0;i<N;i++){
    let dist = rnd()<nearFrac ? rnd()*150 : 150+rnd()*1050;
    const d2=dist*dist;
    E.push({idx:i, d2, tier:tierOf(d2), ib:false, hurt:0, charge:false, alerted:true, ranged:(i%2===0),
      lastProc:-1, lastUpd:-1, maxGapProc:0, timerSkips:0});
  }
  if(injectTail){ // 배열 꼬리(마지막 5%)에 보스1·피격2·대시2 주입 — 꼬리 기아 취약성 검사
    const tail=N-1;
    if(E[tail])      { E[tail].ib=true;  E[tail].d2=0; E[tail].tier=1; }        // 보스 꼬리
    if(E[tail-1])    { E[tail-1].hurt=8; E[tail-1].d2=300*300; E[tail-1].tier=2; } // 피격(원래 T2지만 hurt→T1)
    if(E[tail-2])    { E[tail-2].hurt=8; E[tail-2].d2=500*500; E[tail-2].tier=3; }
    if(E[tail-3])    { E[tail-3].charge=true; E[tail-3].d2=600*600; E[tail-3].tier=3; } // 돌진 커밋
    if(E[tail-4])    { E[tail-4].charge=true; E[tail-4].d2=900*900; E[tail-4].tier=4; }
  }
  for(const e of E) e.inView = e.ib||e.hurt>0||e.charge||e.d2<inView2;
  return E;
}

const isEssential = (e)=> e.ib || e.hurt>0 || e.charge || e.tier===1; // 필수 전투 갱신 대상
const wantsUpdate = (e,f)=>{ // 이번 tick에 updateE를 호출하려 하는가(티어 스케줄)
  if(e.ib||e.hurt>0||e.charge||e.tier===1) return true;
  if(e.tier===2) return (f&1)===(e.idx&1);
  if(e.tier===3) return (f&3)===(e.idx&3);
  return (f&7)===(e.idx&7) && !(e.alerted&&e.ranged); // T4: 원거리+alerted는 ffMove만(저비용)
};

// 하드캡(현재 코드) 시뮬: break로 꼬리 절단
function simHardCap({E, ticks, Cfull_us, Ctimer_us, BUDGET_us}){
  const N=E.length;
  let ticksBroken=0, sumBrokeAt=0, sumFrameCost=0, maxFrameCost=0;
  for(let f=0; f<ticks; f++){
    let budget=0, brokeAt=N;
    for(let ei=0; ei<N; ei++){
      const e=E[ei];
      if(ei%32===0 && ei>0 && !e.ib && budget>BUDGET_us){ brokeAt=ei; break; }
      if(!e.inView){ e.lastProc=f; continue; }
      budget += Ctimer_us; // 상태 타이머(항상 실행 — 단, break 이후 적은 도달 못함)
      if(wantsUpdate(e,f)) budget += Cfull_us;
      if(e.lastProc>=0) e.maxGapProc=Math.max(e.maxGapProc, f-e.lastProc);
      e.lastProc=f;
    }
    // brokeAt..N-1: 미처리(timers·state 갱신 못함)
    for(let ei=brokeAt; ei<N; ei++){ if(E[ei].inView) E[ei].timerSkips++; }
    if(brokeAt<N){ ticksBroken++; sumBrokeAt+=brokeAt; }
    sumFrameCost+=budget; if(budget>maxFrameCost)maxFrameCost=budget;
  }
  for(const e of E){ if(e.inView){ if(e.lastProc>=0) e.maxGapProc=Math.max(e.maxGapProc,(ticks-1)-e.lastProc); else e.maxGapProc=ticks; } }
  const inV=E.filter(e=>e.inView);
  const ess=inV.filter(isEssential);
  const essStarved=ess.filter(e=>e.maxGapProc>1);
  return {
    ticksBrokenPct:+(ticksBroken/ticks*100).toFixed(1),
    avgBrokeAt: ticksBroken?Math.round(sumBrokeAt/ticksBroken):null,
    maxFrameCost_us:+maxFrameCost.toFixed(0), avgFrameCost_us:+(sumFrameCost/ticks).toFixed(0),
    essCount:ess.length, essStarvedCount:essStarved.length,
    essStarvedBreakdown: {
      boss: essStarved.filter(e=>e.ib).length,
      hurt: essStarved.filter(e=>e.hurt>0).length,
      charge: essStarved.filter(e=>e.charge).length,
      near: essStarved.filter(e=>e.tier===1&&!e.ib&&!e.hurt&&!e.charge).length,
    },
    worstEssGapTicks: ess.length?Math.max(...ess.map(e=>e.maxGapProc)):0,
    worstEssGapMs: ess.length?+(Math.max(...ess.map(e=>e.maxGapProc))*PHYS_STEP).toFixed(0):0,
    timerStarvedInView: inV.filter(e=>e.timerSkips>0).length,
  };
}

// 소프트캡(QA 후보 A 변형) 시뮬: 예산 초과해도 필수 전투 적은 생략하지 않음. 비필수만 스킵.
function simSoftCap({E, ticks, Cfull_us, Ctimer_us, BUDGET_us}){
  const N=E.length;
  let sumFrameCost=0, maxFrameCost=0, overBudgetTicks=0;
  for(const e of E){ e.lastProc=-1; e.maxGapProc=0; e.timerSkips=0; }
  for(let f=0; f<ticks; f++){
    let budget=0;
    for(let ei=0; ei<N; ei++){
      const e=E[ei];
      if(!e.inView){ e.lastProc=f; continue; }
      const over = budget>BUDGET_us;
      if(over && !isEssential(e)){ e.timerSkips++; continue; } // 예산 초과+비필수 → 스킵
      budget += Ctimer_us;
      if(wantsUpdate(e,f)) budget += Cfull_us; // 필수는 초과해도 실행(soft cap)
      if(e.lastProc>=0) e.maxGapProc=Math.max(e.maxGapProc, f-e.lastProc);
      e.lastProc=f;
    }
    sumFrameCost+=budget; if(budget>maxFrameCost)maxFrameCost=budget;
    if(budget>BUDGET_us)overBudgetTicks++;
  }
  for(const e of E){ if(e.inView){ if(e.lastProc>=0) e.maxGapProc=Math.max(e.maxGapProc,(ticks-1)-e.lastProc); else e.maxGapProc=ticks; } }
  const inV=E.filter(e=>e.inView); const ess=inV.filter(isEssential);
  return {
    maxFrameCost_us:+maxFrameCost.toFixed(0), avgFrameCost_us:+(sumFrameCost/ticks).toFixed(0),
    overBudgetTicksPct:+(overBudgetTicks/ticks*100).toFixed(1),
    essStarvedCount: ess.filter(e=>e.maxGapProc>1).length,
    worstEssGapTicks: ess.length?Math.max(...ess.map(e=>e.maxGapProc)):0,
  };
}

// ══════════════════════════════════════════════════════════════════════
test('[조건 A] QA 실측 조건 — 현재 CH1에선 기아 미발생(잠재 결함)', () => {
  // QA 실측(2026-10-01): 적 48~124, 근접 최대 31, updateE 약 11~12µs, tick 총 1.1~1.9ms, 12ms break 없음.
  console.log('\n[ENEMY-F06 / 조건 A] QA 실측 조건(적 48~124·근접≤31·updateE≈11.5µs·budget 12ms) — physics tick 기준');
  const base={ticks:480, seed:12345, nearFrac:0.25, inViewPx:1200, Ctimer_us:1, BUDGET_us:12000};
  let anyBreak=false, anyStarve=false;
  for(const N of [48,86,124]){
    // 근접 최대 31로 제한: nearFrac를 N에 맞춰 31/N 근사
    const E=buildEnemies({N, seed:base.seed, nearFrac:Math.min(0.99,31/N), inViewPx:base.inViewPx});
    const r=simHardCap({E, ticks:base.ticks, Cfull_us:11.5, Ctimer_us:base.Ctimer_us, BUDGET_us:base.BUDGET_us});
    console.log(`  N=${String(N).padStart(3)} | tick총비용 avg=${r.avgFrameCost_us}µs max=${r.maxFrameCost_us}µs | break=${r.ticksBrokenPct}% | 필수기아=${r.essStarvedCount} 타이머기아=${r.timerStarvedInView}`);
    if(r.ticksBrokenPct>0)anyBreak=true; if(r.essStarvedCount>0)anyStarve=true;
  }
  console.log('  ⇒ QA 실측 대역에선 tick 총비용이 12ms 예산을 크게 밑돌아 break=0·기아=0. F06은 현재 미발생 "잠재 결함".');
  assert.equal(anyBreak, false, 'QA 실측 조건에선 break가 없어야 함(현재 안전)');
  assert.equal(anyStarve, false, 'QA 실측 조건에선 기아가 없어야 함');
});

test('[조건 B] 합성 스트레스 — 배열 꼬리 기아 재현 + 엔티티 클래스 누락', () => {
  console.log('\n[ENEMY-F06 / 조건 B] 합성 스트레스(N=400·updateE 80~120µs·nearFrac 0.5) — 실측과 명확 분리. 꼬리에 보스/피격/대시 주입.');
  for(const Cfull of [80,120]){
    const E=buildEnemies({N:400, seed:12345, nearFrac:0.5, inViewPx:1200, injectTail:true});
    const r=simHardCap({E, ticks:480, Cfull_us:Cfull, Ctimer_us:2, BUDGET_us:12000});
    console.log(`  Cfull=${Cfull}µs | break=${r.ticksBrokenPct}% avgIdx=${r.avgBrokeAt} maxCost=${r.maxFrameCost_us}µs`);
    console.log(`    필수기아 ${r.essStarvedCount}/${r.essCount} [보스${r.essStarvedBreakdown.boss}·피격${r.essStarvedBreakdown.hurt}·대시${r.essStarvedBreakdown.charge}·근접${r.essStarvedBreakdown.near}] worstGap=${r.worstEssGapTicks}tick(${r.worstEssGapMs}ms) | 타이머/상태해제 정지 ${r.timerStarvedInView}마리`);
  }
  // 재현 판정(Cfull=80µs)
  const E=buildEnemies({N:400, seed:12345, nearFrac:0.5, inViewPx:1200, injectTail:true});
  const r=simHardCap({E, ticks:480, Cfull_us:80, Ctimer_us:2, BUDGET_us:12000});
  assert.ok(r.ticksBrokenPct>0, '합성 부하에서 break 발생');
  assert.ok(r.essStarvedBreakdown.boss>=1, '배열 꼬리 보스가 기아(break의 !e.ib는 자기 인덱스 트리거만 막음, 앞선 break 이후엔 보스도 미처리)');
  assert.ok(r.essStarvedBreakdown.hurt>=1||r.essStarvedBreakdown.charge>=1, '꼬리 피격/대시 커밋 적도 기아');
  assert.ok(r.timerStarvedInView>0, 'break 이후 적은 상태 타이머(스턴/DOT/부활)도 정지');
  console.log(`  ⇒ 재현: 꼬리 보스·피격·대시·근접 적 및 타이머/상태해제 누락 확인. worst 정지 ${r.worstEssGapMs}ms(게임시간).`);
});

test('[조건 C] 후보 A soft-cap vs 하드캡 수치 비교 — 소프트캡은 성능 보장 아님', () => {
  console.log('\n[ENEMY-F06 / 조건 C] QA 후보 A(soft-cap: 필수 전투 갱신 미생략) vs 현재 하드캡 — 동일 부하 비교');
  const mk=()=>buildEnemies({N:400, seed:12345, nearFrac:0.5, inViewPx:1200, injectTail:true});
  const Cfull=80, Ctimer=2, BUDGET=12000, ticks=480;
  const hard=simHardCap({E:mk(), ticks, Cfull_us:Cfull, Ctimer_us:Ctimer, BUDGET_us:BUDGET});
  const soft=simSoftCap({E:mk(), ticks, Cfull_us:Cfull, Ctimer_us:Ctimer, BUDGET_us:BUDGET});
  console.log(`  하드캡(현행): 필수기아=${hard.essStarvedCount} worstGap=${hard.worstEssGapTicks}tick | frame총비용 avg=${hard.avgFrameCost_us}µs max=${hard.maxFrameCost_us}µs(≈예산상한)`);
  console.log(`  soft-cap(A) : 필수기아=${soft.essStarvedCount} worstGap=${soft.worstEssGapTicks}tick | frame총비용 avg=${soft.avgFrameCost_us}µs max=${soft.maxFrameCost_us}µs, 예산초과 tick=${soft.overBudgetTicksPct}%`);
  console.log('  ⇒ soft-cap은 필수 전투 기아를 없애지만(=0) frame 총비용이 12ms 예산을 초과할 수 있음(soft cap). 성능 개선 보장 아님 — 정확성↔프레임예산 trade-off를 QA가 실측 µs로 판단.');
  // 소프트캡은 필수 기아 제거
  assert.equal(soft.essStarvedCount, 0, 'soft-cap은 필수 전투 적 기아를 없앰');
  // 그러나 frame 비용이 예산을 초과할 수 있음(성능 보장 아님)
  assert.ok(soft.maxFrameCost_us > BUDGET, `soft-cap frame 최대비용이 예산(12ms)을 초과(실제 ${soft.maxFrameCost_us}µs) — hard cap 대비 프레임 시간 악화 가능`);
});
