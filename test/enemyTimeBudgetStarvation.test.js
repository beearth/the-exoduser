import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// ENEMY-F06 결정적 하니스 — 메인 적 루프 타임버짓 break(game.html:32855)로 인한
// 배열 꼬리 인덱스 AI 기아를 재현·계측한다. (공용 update/render/loop는 QA 소유 → 여기선 계측만)
//
// 충실 복제 대상 (실제 소스에서 발췌한 게이팅):
//   break:  if(_ei%(IS_MOBILE?8:32)===0 && _ei>0 && !e.ib && now-start > (IS_MOBILE?8:12))  break
//   T1 <150px(_ed2<22500): updateE 매프레임
//   T2 <350px(_ed2<122500): (tierFrame&1)===(_ei&1) 일 때만 updateE
//   T3 <700px(_ed2<490000): (tierFrame&3)===(_ei&3) 일 때만 updateE
//   T4 그 외: (tierFrame&7)===(_ei&7) 일 때만 (원거리+alerted면 ffMove만, 아니면 updateE)
//   off-view(!_eInView): updateE 스킵 + continue (timers도 실행 못함 — break 대상엔 도달조차 안 함)

const src = await readFile(new URL('../game.html', import.meta.url), 'utf8');

// ── 실제 소스에 게이팅이 그대로 있는지 확인(하니스 충실성 보증) ──
test('하니스 게이팅이 실제 소스와 일치(충실성)', () => {
  assert.match(src, /_ei%\(IS_MOBILE\?8:32\)===0&&_ei>0&&!e\.ib&&performance\.now\(\)-_eUpdateStart>\(IS_MOBILE\?8:12\)\)break/,
    '타임버짓 break 시그니처');
  assert.match(src, /_ed2<22500/, 'T1 임계');
  assert.match(src, /_ed2<122500/, 'T2 임계');
  assert.match(src, /_ed2<490000/, 'T3 임계');
  assert.match(src, /\(G\._eTierFrame&1\)===\(_ei&1\)/, 'T2 스케줄');
  assert.match(src, /\(G\._eTierFrame&3\)===\(_ei&3\)/, 'T3 스케줄');
  assert.match(src, /\(G\._eTierFrame&7\)===\(_ei&7\)/, 'T4 스케줄');
});

// ── 결정적 PRNG (시드 고정) ──
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

// ── 티어 분류 (실제 임계값) ──
function tierOf(d2){ if(d2<22500)return 1; if(d2<122500)return 2; if(d2<490000)return 3; return 4; }

// ── 시뮬레이션 (실제 루프 구조 복제) ──
function simulate({N, frames, Cfull_us, Ctimer_us, BUDGET_us, seed, nearFrac, inViewPx}){
  const rnd=mulberry32(seed);
  const inView2=inViewPx*inViewPx;
  // 적 생성: nearFrac 비율은 근접(<150px), 나머지는 0~1200px 분포. 스폰순서=배열인덱스(거리와 무상관)
  const E=[];
  for(let i=0;i<N;i++){
    let dist;
    if(rnd()<nearFrac) dist=rnd()*150;             // 근접 T1
    else dist=150+rnd()*1050;                        // 150~1200px 혼합
    const d2=dist*dist;
    E.push({idx:i, d2, tier:tierOf(d2), inView:d2<inView2, alerted:true, ranged:(i%2===0),
      lastProc:-1, lastUpd:-1, maxGapProc:0, maxGapUpd:0});
  }
  let framesBroken=0, sumBrokeAt=0, minBrokeAt=N;
  for(let f=0; f<frames; f++){
    let budget=0; let brokeAt=N;
    for(let ei=0; ei<N; ei++){
      const e=E[ei];
      // 타임버짓 break (비보스, ei%32===0, ei>0)
      if(ei%32===0 && ei>0 && budget>BUDGET_us){ brokeAt=ei; break; }
      // off-view면 updateE 스킵하고 continue (timers 미실행). 단 budget엔 거의 기여 안 함
      if(!e.inView){ e.lastProc=f; continue; } // 화면밖은 저비용 처리(스킵). 기아 대상 아님
      budget += Ctimer_us; // 항상 실행 타이머
      let ranUpd=false;
      if(e.tier===1){ budget+=Cfull_us; ranUpd=true; }
      else if(e.tier===2){ if((f&1)===(ei&1)){ budget+=Cfull_us; ranUpd=true; } }
      else if(e.tier===3){ if((f&3)===(ei&3)){ budget+=Cfull_us; ranUpd=true; } }
      else { if((f&7)===(ei&7)){ if(!(e.alerted&&e.ranged)){ budget+=Cfull_us; ranUpd=true; } } }
      // 이 적은 이번 프레임 처리됨(timers 실행). ranUpd면 updateE도 실행
      if(e.lastProc>=0) e.maxGapProc=Math.max(e.maxGapProc, f-e.lastProc);
      e.lastProc=f;
      if(ranUpd){ if(e.lastUpd>=0) e.maxGapUpd=Math.max(e.maxGapUpd, f-e.lastUpd); e.lastUpd=f; }
    }
    // brokeAt..N-1 은 이번 프레임 전혀 처리 안 됨(timers·state 미갱신) → 기아 누적
    if(brokeAt<N){ framesBroken++; sumBrokeAt+=brokeAt; minBrokeAt=Math.min(minBrokeAt,brokeAt); }
  }
  // 최종 기아 갭 마감(마지막 처리~끝). 한 번도 처리 안 된 적(lastProc=-1)=완전 동결 → gap=frames
  for(const e of E){ if(e.inView){ if(e.lastProc>=0) e.maxGapProc=Math.max(e.maxGapProc, (frames-1)-e.lastProc); else e.maxGapProc=frames; } }
  // 지표
  const inViewE=E.filter(e=>e.inView);
  const t1=inViewE.filter(e=>e.tier===1);
  const worstNearGap=t1.length?Math.max(...t1.map(e=>e.maxGapProc)):0;
  const worstNearIdx=t1.length?t1.reduce((a,b)=>b.maxGapProc>a.maxGapProc?b:a).idx:-1;
  const maxProcGap=inViewE.length?Math.max(...inViewE.map(e=>e.maxGapProc)):0;
  const intermittentNear=t1.filter(e=>e.maxGapProc>1&&e.maxGapProc<frames).length; // 간헐 기아(컷오프 진동)
  const frozenNear=t1.filter(e=>e.maxGapProc>=frames).length;                       // 완전 동결(컷오프 이후 상주)
  const starvedNear=intermittentNear+frozenNear;
  return {
    N, Cfull_us, framesBrokenPct:+(framesBroken/frames*100).toFixed(1),
    avgBrokeAt: framesBroken?Math.round(sumBrokeAt/framesBroken):null, minBrokeAt: framesBroken?minBrokeAt:null,
    t1Count:t1.length, starvedNearCount:starvedNear, intermittentNear, frozenNear,
    worstNearGapFrames:worstNearGap, worstNearGapMs:+(worstNearGap/60*1000).toFixed(1), worstNearIdx,
    maxProcGapFrames:maxProcGap, maxProcGapMs:+(maxProcGap/60*1000).toFixed(1),
  };
}

test('타임버짓 기아 재현·계측 (고정 조건 스윕)', () => {
  const base={frames:480, Ctimer_us:2, BUDGET_us:12000, seed:12345, nearFrac:0.5, inViewPx:1200};
  console.log('\n[ENEMY-F06] 타임버짓 AI 기아 계측 — 고정 조건: budget=12ms, Ctimer=2µs, frames=480, inView=1200px, nearFrac=0.5, seed=12345');
  console.log('  updateE 비용(Cfull)과 적 수(N)를 고정 스윕. worstNearGap=근접(T1)인데 정지한 최대 프레임수(=명백한 결함 지표).');
  const rows=[];
  for(const N of [100,200,400]){
    for(const Cfull of [40,80,120]){
      const r=simulate({...base, N, Cfull_us:Cfull});
      rows.push(r);
      console.log(`  N=${String(N).padStart(3)} Cfull=${String(Cfull).padStart(3)}µs | break=${String(r.framesBrokenPct).padStart(5)}% avgIdx=${r.avgBrokeAt} | 근접기아 간헐${r.intermittentNear}/완전동결${r.frozenNear} (총${r.starvedNearCount}/${r.t1Count}) worstGap=${r.worstNearGapFrames}f@idx${r.worstNearIdx} | maxGap=${r.maxProcGapFrames}f(${r.maxProcGapMs}ms)`);
    }
  }
  // 재현 판정: 충분한 부하(N=400, Cfull=80µs 이상)에서 근접 적이 여러 프레임 정지하는 기아가 발생해야 함
  const heavy=simulate({...base, N:400, Cfull_us:80});
  assert.ok(heavy.framesBrokenPct>0, '부하 시 타임버짓 break가 발생해야 함(기아 조건)');
  assert.ok(heavy.starvedNearCount>0, '근접(T1) 적이 배열 꼬리에서 기아(>1프레임 정지)해야 함 — 결함 재현');
  assert.ok(heavy.worstNearGapFrames>=2, `근접 적 최대 정지가 2프레임 이상이어야 함(실제 ${heavy.worstNearGapFrames}f)`);
  console.log(`\n  ⇒ 재현 확인: N=400·Cfull=80µs에서 근접 적 기아 간헐 ${heavy.intermittentNear} + 완전동결 ${heavy.frozenNear} = ${heavy.starvedNearCount}/${heavy.t1Count}, 최대 정지 ${heavy.worstNearGapFrames}프레임(${heavy.worstNearGapMs}ms, @배열idx${heavy.worstNearIdx}).`);
  console.log('  핵심: 근접(마땅히 매프레임 갱신) 적이 "배열 꼬리 인덱스"라는 이유만으로 정지/동결 — 거리 무관, 스폰순서 편향.');
});
