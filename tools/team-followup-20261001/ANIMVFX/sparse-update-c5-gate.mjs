#!/usr/bin/env node
/*
 * sparse-update-c5-gate.mjs — C5(감쇠 구동원) 드문표본·sp감쇠 경계 최소수정 + 부정회귀
 * 소유: ANIMVFX / 터미널 8. 기존 세션 1d2a7253의 후속 한 건(ANIM-C5-SPARSE-UPDATE-EDGE).
 * 선행: animvfx_highhz_lifetime_gate.mjs 의 C5는 에피소드 전체의 "감소량(decrements)"을
 *       update/draw 카운터 총 증가분과 단순 비교해 구동원을 판정한다.
 *
 * ── 발견한 누락(실제 원식 기준) ─────────────────────────────────────────────
 * 실제 감쇠원식: game.html:33148  if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp);
 *   → 감쇠는 "update 틱당 sp"이며 sp는 슬로모/히트스톱에서 1이 아니다(분수·0 가능).
 * 선행 C5는 "감소량 ≈ dU" 또는 "감소량 ≈ dD"의 단순 일치로 구동원을 정한다. 이 때문에:
 *   (가) 오FAIL: 슬로모(sp=0.5) update 구동 감쇠는 12틱에 6 감소 → dU=12, dD=6. 선행 C5는
 *        |dU-6|≠0, |dD-6|=0 으로 draw 구동(FAIL)로 오판한다. 실제로는 정상 update 구동.
 *   (나) 오PASS: draw 경로 복귀 회귀가 draw당 2 감소(step2)이고 표본이 드물면(30fps, 틱2/draw)
 *        6 감소에 dU=6, dD=3 → 선행 C5는 |dU-6|=0 으로 update 구동(PASS)로 오판한다.
 *        실제로는 draw 구동 회귀(고주사율에서 수명 단축).
 *   공통 원인: 틱 사이에 여러 update/여러 draw가 섞인 드문 표본에서 "총량 단순 일치"는 구동원을
 *             증명하지 못한다. 감소를 특정 틱에 못 박을 수 없기 때문이다.
 *
 * ── 최소 수정(구동원 판별을 구간 증거로) ───────────────────────────────────
 * 연속 표본 사이 감소구간을 분류한다(사망리셋 구간 제외):
 *   update-only 감소: dHf>0 && dU>0 && dD==0  → draw 없이 hf가 줄었다 = update 구동 증거
 *   draw-only   감소: dHf>0 && dD>0 && dU==0  → update 없이 hf가 줄었다 = draw 구동 증거(회귀)
 *   둘다진행   감소: dHf>0 && dU>0 && dD>0   → 구동원 분리 불가(증거 아님)
 *   무카운터   감소: dHf>0 && dU==0 && dD==0 → trace 결함(불가능) → REJECT
 * 판정:
 *   update-only만 존재               → PASS(update 구동, 주사율 독립). sp<1이어도 성립(dHf≠dU 무관).
 *   draw-only만 존재                 → FAIL(draw 구동 회귀)
 *   둘 다 존재                        → FAIL(모순/비일관)
 *   둘다진행만 또는 감소구간 없음     → UNKNOWN(불완전/드문 표본 — 구동원 분리 불가)
 * → 총량 단순 일치로는 PASS를 주지 않는다. 불완전 trace는 UNKNOWN. 실제 고주사율은 여전히 미측정.
 *
 * ★ 읽기+Node 작은 검사만. game.html/easy/index/server/공유마스터/타팀/원GL프로브/생산VFX 무수정.
 *   선행 게이트(animvfx_highhz_lifetime_gate.mjs)는 import만(수정 0). 데모로 선행 오판을 함께 보인다.
 *
 * 사용: node sparse-update-c5-gate.mjs            (sparse-update-* 부정회귀 자가검사 + 선행 오판 데모)
 *       node sparse-update-c5-gate.mjs raw.json   (실 raw에 신규 C5 적용)
 * exit 0 = 모든 fixture 기대 일치 + 데모가 선행 오판을 실제로 드러냄, 1 = 불일치.
 */
import fs from 'node:fs';
// 2026-10-02 SPARSE-CLOCK-INTEGRATION 이후: 이 파일의 C5 로직은 canonical gate에 통합됐다.
//  - gateV2/classifyDecaySparse/extractEpisodesIntervals는 canonical(animvfx_highhz_lifetime_gate.mjs)로 위임
//    → 버그 사본 중복 제거(root 지적: 끝점 미상 dD=null 오PASS는 canonical에서 하드닝됨).
//  - old-wrong 대조(priorGate)는 고정 before 사본(sparse-clock-gate-before.mjs, magnitude C5)을 읽는다.
import { normalize, HIGH_REFRESH_MIN_HZ, PHYS_HZ, judgeRevive, classifyDecaySparse, extractEpisodesIntervals, gate as gateV2 } from './animvfx_highhz_lifetime_gate.mjs';
import { gate as priorGate } from './sparse-clock-gate-before.mjs';
export { classifyDecaySparse, extractEpisodesIntervals, gateV2 };

const TOL = 1e-6;
function num(x) { return (typeof x === 'number' && isFinite(x)) ? x : null; }
const hasEv = (r, name) => Array.isArray(r.events) && r.events.includes(name);

// ── 실제 원식 trace 생성기 ─────────────────────────────────────────────────
function rec(o) {
  return Object.assign({ phase: 'after-update', now: 0, id: 7, etype: 4, hf: 0, alive: true,
    updates: 0, draws: 0, glMode: 1, events: [], visibility: 'visible', hidden: false,
    paused: false, gameOn: true, runtimeGate: true, useGL: true, contextLost: false }, o);
}
// 실제 원식(update 구동, hf-=sp): 고정스텝 60Hz update, draw는 drawHz. 표본 위상 선택.
//  samplePhases 에 'after-update' 포함 시 draw 없이 감소한 update-only 구간이 보인다.
function traceUpdateDriven({ sp = 1, drawHz = 30, peak = 6, startNow = 1000, phases = ['after-update', 'after-draw'] }) {
  const out = []; const updMs = 1000 / PHYS_HZ; const drawEveryTicks = PHYS_HZ / drawHz; // 저주사율>1, 고주사율<1
  let u = 10, d = 5, now = startNow, hf = peak, nextDrawAtTick = drawEveryTicks, tick = 0;
  out.push(rec({ hf, updates: u, draws: d, now, events: ['flash-start-observed'] }));
  while (hf > TOL) {
    // 한 update 틱
    u += 1; tick += 1; now += updMs; hf = Math.max(0, hf - sp);
    if (phases.includes('after-update')) out.push(rec({ phase: 'after-update', hf: round4(hf), updates: u, draws: d, now, events: hf <= TOL ? ['flash-zero-observed'] : ['flash-decrease'] }));
    // 이 틱 동안 발생한 draw들
    while (tick >= nextDrawAtTick - TOL) { d += 1; nextDrawAtTick += drawEveryTicks; if (phases.includes('after-draw')) out.push(rec({ phase: 'after-draw', hf: round4(hf), updates: u, draws: d, now, events: [] })); }
  }
  return out;
}
// draw 경로 복귀 회귀(draw당 step 감소), 표본 after-draw만(드문 표본). update는 흐르되 감쇠는 draw에 묶임.
function traceDrawDriven({ step = 1, drawHz = 30, peak = 6, startNow = 1000 }) {
  const out = []; const updMs = 1000 / PHYS_HZ; const ticksPerDraw = PHYS_HZ / drawHz;
  let u = 10, d = 5, now = startNow, hf = peak, tick = 0, nextDrawAtTick = ticksPerDraw;
  out.push(rec({ hf, updates: u, draws: d, now, events: ['flash-start-observed'] }));
  while (hf > TOL) {
    u += 1; tick += 1; now += updMs;
    while (tick >= nextDrawAtTick - TOL && hf > TOL) {
      d += 1; nextDrawAtTick += ticksPerDraw; hf = Math.max(0, hf - step);
      out.push(rec({ phase: 'after-draw', hf: round4(hf), updates: u, draws: d, now, events: hf <= TOL ? ['flash-zero-observed'] : ['flash-decrease'] }));
    }
  }
  return out;
}
function round4(x) { return Math.round(x * 1e4) / 1e4; }

// ── sparse-update-* 부정회귀 fixtures ──────────────────────────────────────
function fixtures() {
  return [
    { name: 'sparse-update-updateonly-proof: 정상 update 구동(sp=1,30fps,after-update 포함)',
      expect: /PASS/, raw: { records: traceUpdateDriven({ sp: 1, drawHz: 30 }) } },
    { name: 'sparse-update-slowmo-sp0.5: 슬로모 update 구동 → PASS(선행은 오FAIL)',
      expect: /PASS/, raw: { records: traceUpdateDriven({ sp: 0.5, drawHz: 30 }) } },
    { name: 'sparse-update-highrefresh-updateonly: 240fps update 구동(after-update 포함) → PASS',
      expect: /PASS/, raw: { records: traceUpdateDriven({ sp: 1, drawHz: 240 }) } },
    { name: 'sparse-update-drawstep2-falsepass: draw 구동 step2, 30fps after-draw만 → UNKNOWN(선행은 오PASS; 신규는 둘다진행만이라 분리불가=UNKNOWN)',
      expect: /UNKNOWN/, raw: { records: traceDrawDriven({ step: 2, drawHz: 30 }) } },
    { name: 'sparse-update-drawdriven-highrefresh: draw 구동 240fps after-draw만 → FAIL(draw-only 구간 증명)',
      expect: /FAIL/, raw: { records: traceDrawDriven({ step: 1, drawHz: 240 }) } },
    { name: 'sparse-update-afterdraw-only-updatedriven: update 구동이나 after-draw만(둘다진행) → UNKNOWN',
      expect: /UNKNOWN/, raw: { records: traceUpdateDriven({ sp: 1, drawHz: 30, phases: ['after-draw'] }) } },
    { name: 'sparse-update-nocounter: hf 감소하는데 update/draw 미진행 → REJECT',
      expect: /REJECT/, raw: { records: [rec({ hf: 6, updates: 10, draws: 5, now: 0, events: ['flash-start-observed'] }),
        rec({ phase: 'after-draw', hf: 3, updates: 10, draws: 5, now: 20, events: ['flash-decrease'] }),
        rec({ phase: 'after-draw', hf: 0, updates: 10, draws: 5, now: 40, events: ['flash-zero-observed'] })] } },
    { name: 'sparse-update-conflict: update-only + draw-only 동시 → FAIL(모순)',
      expect: /FAIL/, raw: { records: [rec({ hf: 6, updates: 10, draws: 5, now: 0, events: ['flash-start-observed'] }),
        rec({ phase: 'after-update', hf: 5, updates: 11, draws: 5, now: 16, events: ['flash-decrease'] }),   // update-only
        rec({ phase: 'after-draw', hf: 4, updates: 11, draws: 6, now: 20, events: ['flash-decrease'] }),     // draw-only
        rec({ phase: 'after-draw', hf: 0, updates: 11, draws: 7, now: 120, events: ['flash-zero-observed'] })] } }
  ];
}

function main() {
  const args = process.argv.slice(2);
  let fail = 0;
  if (args.length) {
    for (const p of args) {
      let raw; try { raw = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.error(`READ-FAIL ${p}: ${e.message}`); fail++; continue; }
      const r = gateV2(raw);
      console.log(`\n=== ${p} ===`);
      console.log(`전체=${r.overall} | 감쇠모델=${r.decayModelSummary} | 고주사율실측=${r.highRefreshActual} | 에피소드=${r.episodeCount}`);
      for (const e of r.episodes) console.log(`  id${e.id} peak${e.peakHf}→${e.minHf} drawHz=${e.drawHz} zero=${e.zeroKind} decay=${e.verdict.decayModel} hiHz=${e.verdict.highRefresh} [uOnly=${e.c5.counts.updateOnly} dOnly=${e.c5.counts.drawOnly} both=${e.c5.counts.bothAdvance}] ${e.c5.note}`);
      console.log(`  부활/구울: ${r.revive.verdict} 동일객체=${r.revive.sameObjectRevive} 구울=${r.revive.newGhoul}`);
    }
    process.exit(fail ? 1 : 0);
  }
  console.log('sparse-update-* 부정회귀 자가검사 (신규 C5)\n');
  for (const f of fixtures()) {
    const r = gateV2(f.raw);
    const field = /REJECT/.test(f.expect.source) ? r.episodes[0]?.verdict.decayModel
      : (r.episodes.find(e => e.verdict.decayModel !== 'UNKNOWN')?.verdict.decayModel || r.episodes[0]?.verdict.decayModel || 'UNKNOWN');
    const probe = r.decayModelSummary;
    const ok = f.expect.test(probe) || f.expect.test(field || '');
    if (!ok) fail++;
    console.log(`[${ok ? 'OK ' : 'XX '}] ${f.name}`);
    console.log(`      감쇠모델=${probe} · 에피소드C5=${r.episodes.map(e => e.verdict.decayModel).join(',')} · overall=${r.overall}`);
  }

  // ── 선행 게이트 오판 데모(실제로 틀리는지 확인) ──
  console.log('\n── 선행 게이트(animvfx_highhz_lifetime_gate) 오판 데모 ──');
  const demos = [
    { name: '슬로모 sp=0.5 (실제 update 구동)', raw: { records: traceUpdateDriven({ sp: 0.5, drawHz: 30 }) }, oldWrong: 'FAIL', newRight: 'PASS' },
    { name: 'draw step2 + 30fps 드문표본 (실제 draw 구동 회귀)', raw: { records: traceDrawDriven({ step: 2, drawHz: 30 }) }, oldWrong: 'PASS', newRight: 'UNKNOWN' }
  ];
  let demoFail = 0;
  for (const dm of demos) {
    const oldR = priorGate(dm.raw).decayModelSummary;
    const newR = gateV2(dm.raw).decayModelSummary;
    const oldShows = new RegExp(dm.oldWrong).test(oldR);
    const newShows = new RegExp(dm.newRight).test(newR);
    const ok = oldShows && newShows;
    if (!ok) demoFail++;
    console.log(`[${ok ? 'OK ' : 'XX '}] ${dm.name}: 선행=${oldR} (오판 ${dm.oldWrong} ${oldShows ? '재현✓' : '미재현✗'}) → 신규=${newR} (${dm.newRight} ${newShows ? '✓' : '✗'})`);
  }
  if (demoFail) fail += demoFail;
  console.log(`\n${fail === 0 ? 'ALL OK' : fail + ' FAIL'} (exit ${fail === 0 ? 0 : 1})`);
  process.exit(fail === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
