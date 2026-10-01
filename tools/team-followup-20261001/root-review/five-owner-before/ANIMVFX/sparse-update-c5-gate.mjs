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
import { normalize, HIGH_REFRESH_MIN_HZ, PHYS_HZ, gate as priorGate, judgeRevive } from './animvfx_highhz_lifetime_gate.mjs';

const TOL = 1e-6;
function num(x) { return (typeof x === 'number' && isFinite(x)) ? x : null; }
const hasEv = (r, name) => Array.isArray(r.events) && r.events.includes(name);

// ── 에피소드 + 구간(interval) 추출 ────────────────────────────────────────
export function extractEpisodesIntervals(records) {
  const open = {}; const episodes = [];
  for (let i = 0; i < records.length; i++) {
    const r = records[i]; if (r.id == null) continue;
    const id = r.id, hf = num(r.hf);
    const u = num(r.updates), d = num(r.draws), n = num(r.now);
    const isStart = hasEv(r, 'flash-start-observed') || (open[id] == null && hf != null && hf > 0);
    if (isStart && open[id] == null) {
      open[id] = { id, etype: r.etype, peakHf: hf, startU: u, startD: d, startN: n,
        minHf: hf, endU: null, endD: null, endN: null, reachedZero: false, zeroKind: null,
        // death-observed는 flash-start-observed와 같은 레코드에 실릴 수 있음(사망 시 hf=6 세팅).
        // 시작 레코드에서 사망을 포착해야 종료의 bulk 리셋(50884 draw경로 hf=0)을 감쇠로 오인하지 않는다.
        sawDeath: hasEv(r, 'death-observed'), sawPause: false, sawHidden: false, pauseDecay: false,
        clockBreak: false, clockMissing: false, samples: 1, intervals: [],
        prevHf: hf, prevU: u, prevD: d, prevN: n, prevPhase: r.phase };
      continue;
    }
    const ep = open[id]; if (!ep) continue;
    ep.samples++;
    if (hasEv(r, 'death-observed')) ep.sawDeath = true;
    if (r.paused === true || r.runtimeGate === false || r.gameOn === false) ep.sawPause = true;
    if (r.hidden === true || (r.visibility && r.visibility !== 'visible')) ep.sawHidden = true;
    if (u != null && ep.prevU != null && u < ep.prevU) ep.clockBreak = true;
    if (d != null && ep.prevD != null && d < ep.prevD) ep.clockBreak = true;
    if (n != null && ep.prevN != null && n < ep.prevN) ep.clockBreak = true;
    if (u == null || n == null) ep.clockMissing = true;

    // 구간 기록(이전 표본 대비)
    if (hf != null && ep.prevHf != null) {
      const dHf = ep.prevHf - hf;         // 감소는 양수
      const dU = (u != null && ep.prevU != null) ? (u - ep.prevU) : null;
      const dD = (d != null && ep.prevD != null) ? (d - ep.prevD) : null;
      // 사망 리셋(50884 draw경로 hf=0)은 감쇠가 아니다. 사망을 본 에피소드의 '0으로 끝나는' 구간은
      // 크기와 무관하게 리셋으로 제외(사망 전 점진 감소 구간은 그대로 증거로 남긴다).
      const atDeath = hasEv(r, 'death-observed') || (ep.sawDeath && hf === 0);
      if (dHf > TOL) ep.intervals.push({ dHf, dU, dD, atDeath, from: ep.prevPhase, to: r.phase });
      if ((r.paused === true || r.gameOn === false) && dHf > TOL) ep.pauseDecay = true;
    }
    if (hf != null && hf < ep.minHf) ep.minHf = hf;

    if (hf === 0 || hasEv(r, 'flash-zero-observed')) {
      ep.reachedZero = true; ep.endU = u; ep.endD = d; ep.endN = n; ep.minHf = 0;
      ep.zeroKind = ep.sawDeath ? 'death-reset' : 'natural-decay';
      episodes.push(ep); open[id] = null; continue;
    }
    ep.prevHf = hf ?? ep.prevHf; ep.prevU = u ?? ep.prevU; ep.prevD = d ?? ep.prevD; ep.prevN = n ?? ep.prevN; ep.prevPhase = r.phase;
  }
  for (const id in open) if (open[id]) episodes.push(open[id]);
  return episodes;
}

// ── 신규 C5: 구간 증거 기반 구동원 판별 ────────────────────────────────────
export function classifyDecaySparse(ep) {
  const decs = ep.intervals.filter(iv => iv.dHf > TOL && !iv.atDeath);
  let updateOnly = 0, drawOnly = 0, bothAdvance = 0, noCounter = 0;
  for (const iv of decs) {
    const uPos = iv.dU != null && iv.dU > 0, dPos = iv.dD != null && iv.dD > 0;
    if (uPos && !dPos) updateOnly++;
    else if (dPos && !uPos) drawOnly++;
    else if (uPos && dPos) bothAdvance++;
    else noCounter++;   // dU==0 && dD==0 이지만 hf 감소 → 불가능
  }
  let verdict, note;
  if (decs.length === 0) { verdict = 'UNKNOWN'; note = '감소 구간 없음(사망리셋 제외) — 측정 불가'; }
  else if (noCounter > 0) { verdict = 'REJECT'; note = `무카운터 감소 ${noCounter}건 — update/draw 모두 미진행인데 hf 감소(trace 결함)`; }
  else if (updateOnly > 0 && drawOnly > 0) { verdict = 'FAIL'; note = `모순: update-only ${updateOnly} + draw-only ${drawOnly} 동시 — 단일 구동원 아님`; }
  else if (updateOnly > 0) { verdict = 'PASS'; note = `update 구동(주사율 독립): draw 없이 감소한 구간 ${updateOnly}건(sp<1이어도 성립). 둘다진행 ${bothAdvance}`; }
  else if (drawOnly > 0) { verdict = 'FAIL'; note = `draw 구동 회귀: update 없이 감소한 구간 ${drawOnly}건(고주사율 수명 단축)`; }
  else { verdict = 'UNKNOWN'; note = `둘다진행 ${bothAdvance}건만 — 드문/불완전 표본으로 구동원 분리 불가(총량 단순 일치로 PASS 금지)`; }
  return { verdict, note, counts: { updateOnly, drawOnly, bothAdvance, noCounter, decrementIntervals: decs.length } };
}

// ── 신규 C5로 에피소드 판정(나머지 계약은 선행과 동일 취지) ──────────────────
export function judgeEpisodeV2(ep) {
  const flags = [];
  const clock = (ep.clockBreak) ? 'REJECT' : (ep.clockMissing ? 'REJECT' : 'PASS');
  if (clock === 'REJECT') flags.push('시계 역행/결측');
  const pause = ep.pauseDecay ? 'REJECT' : (ep.sawPause ? 'UNKNOWN' : 'PASS');
  if (ep.pauseDecay) flags.push('정지 중 감쇠');
  const background = ep.sawHidden ? 'REJECT' : 'PASS';
  if (ep.sawHidden) flags.push('배경/비가시 — 벽시계 무효');

  const decrements = (ep.peakHf != null && ep.minHf != null) ? (ep.peakHf - ep.minHf) : null;
  const sampleCount = (ep.samples >= 3 && decrements != null && decrements > TOL) ? 'PASS' : 'UNKNOWN';
  if (sampleCount === 'UNKNOWN') flags.push('표본 부족');

  const c5 = classifyDecaySparse(ep);
  if (c5.verdict === 'FAIL') flags.push('C5: ' + c5.note);
  if (c5.verdict === 'REJECT') flags.push('C5: ' + c5.note);

  const lifetimeEnd = ep.reachedZero ? 'PASS' : (sampleCount === 'UNKNOWN' ? 'UNKNOWN' : 'FAIL');
  if (lifetimeEnd === 'FAIL') flags.push('미종료');

  // C7 고주사율: 감소 구간의 활성 drawHz로 판단하되, 신규 C5가 PASS여도 고주사율 표본 없으면 UNKNOWN
  const dMs = (ep.endN != null && ep.startN != null) ? (ep.endN - ep.startN) : null;
  const dD = (ep.endD != null && ep.startD != null) ? (ep.endD - ep.startD) : null;
  const drawHz = (dMs && dMs > 0 && dD) ? (dD / (dMs / 1000)) : null;
  let highRefresh, hrNote;
  if (sampleCount === 'UNKNOWN' || c5.verdict === 'UNKNOWN') { highRefresh = 'UNKNOWN'; hrNote = '감쇠모델/표본 불확정'; }
  else if (drawHz == null) { highRefresh = 'UNKNOWN'; hrNote = 'drawHz 산출 불가'; }
  else if (drawHz >= HIGH_REFRESH_MIN_HZ) { highRefresh = (c5.verdict === 'PASS') ? 'PASS' : (c5.verdict === 'FAIL' ? 'FAIL' : 'UNKNOWN'); hrNote = `drawHz≈${drawHz.toFixed(1)}(고주사율)`; }
  else { highRefresh = 'UNKNOWN'; hrNote = `drawHz≈${drawHz.toFixed(1)}<${HIGH_REFRESH_MIN_HZ} — 실제 고주사율 미측정(감쇠모델=${c5.verdict})`; }

  return { id: ep.id, etype: ep.etype, peakHf: ep.peakHf, minHf: ep.minHf, decrements,
    zeroKind: ep.zeroKind, drawHz: drawHz == null ? null : +drawHz.toFixed(1),
    verdict: { sampleCount, clock, pause, background, decayModel: c5.verdict, lifetimeEnd, highRefresh },
    c5, hrNote, flags };
}

export function gateV2(rawIn) {
  const raw = normalize(rawIn);
  const records = Array.isArray(raw.records) ? raw.records : [];
  const episodes = extractEpisodesIntervals(records).map(judgeEpisodeV2);
  const revive = judgeRevive(rawIn, records);
  const anyReject = episodes.some(e => Object.values(e.verdict).includes('REJECT'));
  const anyFail = episodes.some(e => Object.values(e.verdict).includes('FAIL')) || /FAIL/.test(revive.verdict);
  const decay = episodes.map(e => e.verdict.decayModel);
  const hr = episodes.map(e => e.verdict.highRefresh);
  let overall;
  if (anyReject) overall = 'REJECT';
  else if (anyFail) overall = 'FAIL';
  else if (episodes.length === 0) overall = 'UNKNOWN(에피소드 없음)';
  else if (hr.includes('PASS')) overall = 'PASS(고주사율 실수명 인증 포함)';
  else overall = 'UNKNOWN(고주사율 미측정 — 구간증거 기반 감쇠모델만)';
  const decaySummary = decay.length && decay.every(s => s === 'PASS') ? 'PASS(전 에피소드 update 구동=주사율 독립)'
    : (decay.includes('FAIL') ? 'FAIL(draw 구동/모순)' : (decay.includes('REJECT') ? 'REJECT' : 'UNKNOWN/MIXED'));
  return { gate: 'sparse-update-c5', episodeCount: episodes.length, episodes, revive,
    decayModelSummary: decaySummary, highRefreshActual: hr.includes('PASS') ? 'MEASURED' : 'NOT-MEASURED(실제 >=90Hz 표본 없음)', overall };
}

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
