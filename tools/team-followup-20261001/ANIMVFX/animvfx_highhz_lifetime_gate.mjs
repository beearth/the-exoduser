#!/usr/bin/env node
/*
 * ANIM-HIGHHZ-LIFETIME-GATE (canonical) — 고주사율(>=90Hz)·무표본·수명종료 계약 게이트 (게임 실행 없이)
 * 소유: ANIMVFX / 터미널 8. 경로: tools/team-followup-20261001/ANIMVFX/animvfx_highhz_lifetime_gate.mjs
 * 선행: animvfx_gl_probe.js(관측기) · animvfx_gl_validator.mjs(4상태 분류).
 *
 * ── 통합 이력 ───────────────────────────────────────────────────────────────
 * 2026-10-02 ANIMVFX-20261002-SPARSE-CLOCK-INTEGRATION:
 *   C5(감쇠 구동원)를 "총 감소량 vs 카운터 총증가분 단순 일치"(magnitude)에서
 *   "구간 증거(update-only / draw-only)" 방식으로 통합하고 누락/비정상/역행 카운터 계약을 보강.
 *   통합 전(magnitude) 사본은 sparse-clock-gate-before.mjs 에 동결 보존.
 *   반례 RED→GREEN: ANIM-missing-middle-draw-record / ANIM-missing-draw-counter
 *     (중간/전체 draws 누락 시 dD=null을 '진행 없음(0)'으로 오인 → 오PASS·고주사율 오인증) 수정.
 *   계약: dU/dD는 두 유효 끝점에서 "정확히 0"을 관측했을 때만 '진행 없음'. null/NaN/누락 끝점은
 *         indeterminate → PASS 승격 금지(UNKNOWN). 실제 draw 구동(update 없이 감소) 증거만 FAIL.
 *
 * 핵심 계약(각 플래시 에피소드별):
 *   C1 표본수(sampleCount)   — peak→zero 구간 표본 부족 시 UNKNOWN.
 *   C2 시계무결(clock)        — updates/draws/now 결측·NaN·비정수·음수·역행, 가짜 zero event 시 REJECT.
 *   C3 일시정지(pause)        — paused/runtimeGate=false 중 감쇠는 금지(REJECT). 정지 구간 포함=UNKNOWN.
 *   C4 배경(background)        — hidden/비가시 구간 포함 시 벽시계 수명 무효 → REJECT.
 *   C5 감쇠모델(decayModel)    — 구간 증거: update-only 감소=update 구동(주사율 독립, sp<1 성립),
 *                                draw-only 감소=draw 구동 회귀, 둘다진행/끝점미상만=UNKNOWN, 무카운터=REJECT.
 *   C6 수명종료(lifetimeEnd)   — hf가 실제 0 도달·유지(자연감쇠/사망리셋). 미종료 FAIL. (event만으론 종료 불인정)
 *   C7 고주사율(highRefresh)   — 에피소드 drawHz>=90 표본에서만 실수명 인증. 없으면 UNKNOWN(실제 >=90Hz 미실측).
 *   C8 부활/구울(revive)       — 동일객체 부활 첫 draw hf0 / 새 구울 분리.
 *
 * 판정 어휘: PASS(근거로 충족) / FAIL(회귀 확인) / REJECT(입력 부적격) / UNKNOWN(근거 부족 — PASS 승격 금지).
 *
 * 사용: node animvfx_highhz_lifetime_gate.mjs [raw.json ...]   (인자 없으면 내장 fixture 자가검사)
 * ★ 브라우저/게임/서버 실행 0. 읽기+Node 작은 검사만. game.html 등 공용/타팀/원GL프로브/생산VFX 미접촉.
 */
import fs from 'node:fs';

export const HIGH_REFRESH_MIN_HZ = 90;   // 이 미만은 "고주사율" 아님 — 고주사율 수명 PASS 금지(UNKNOWN).
export const PHYS_HZ = 60;               // 고정스텝 update. hf=6 → 6틱 ≈ 100ms(주사율 독립 기대).
const EXPECT_MS = 1000 * 6 / PHYS_HZ;    // 100ms
const MS_TOL = 45;                       // 실수명 허용 오차
const TOL = 1e-6;

function num(x) { return (typeof x === 'number' && isFinite(x)) ? x : null; }
// 카운터(updates/draws): 유한 정수·비음수여야 유효
function validCounter(x) { return typeof x === 'number' && isFinite(x) && Number.isInteger(x) && x >= 0; }
const hasEv = (r, name) => Array.isArray(r.events) && r.events.includes(name);

// raw 스키마 정규화(records 또는 report.records)
export function normalize(raw) {
  if (Array.isArray(raw?.records)) return raw;
  if (Array.isArray(raw?.report?.records)) {
    const rep = raw.report;
    return { ...raw, records: rep.records, draws: rep.draws ?? raw.draws, updates: rep.updates ?? raw.updates, _reportWrapped: true };
  }
  return { ...raw, records: Array.isArray(raw?.records) ? raw.records : [] };
}

// ── 에피소드 + 감소 구간 추출 (카운터 무결성 계약 포함) ─────────────────────
export function extractEpisodes(records) {
  const open = {}; const episodes = [];
  for (let i = 0; i < records.length; i++) {
    const r = records[i]; if (r.id == null) continue;
    const id = r.id, hf = num(r.hf);
    const uRaw = r.updates, dRaw = r.draws, nRaw = r.now;
    const u = num(uRaw), d = num(dRaw), n = num(nRaw);
    const uMissing = (uRaw == null || Number.isNaN(uRaw));
    const dMissing = (dRaw == null || Number.isNaN(dRaw));
    const nMissing = (nRaw == null || Number.isNaN(nRaw));
    const isStart = hasEv(r, 'flash-start-observed') || (open[id] == null && hf != null && hf > 0);

    if (isStart && open[id] == null) {
      const ep = { id, etype: r.etype, peakHf: hf, startU: u, startD: d, startN: n,
        minHf: hf, endU: null, endD: null, endN: null, reachedZero: false, zeroKind: null,
        // death/pause/hidden은 시작 record에서도 포착(초기 비정상을 정상으로 보충하지 않음)
        sawDeath: hasEv(r, 'death-observed'),
        sawPause: (r.paused === true || r.runtimeGate === false || r.gameOn === false),
        sawHidden: (r.hidden === true || (r.visibility && r.visibility !== 'visible')),
        pauseDecay: false, clockBreak: false, clockMissing: false, fakeZero: false, nonInteger: false,
        samples: 1, intervals: [], prevHf: hf, prevU: u, prevD: d, prevN: n };
      if (uMissing || dMissing || nMissing || hf == null) ep.clockMissing = true;
      if (!uMissing && !validCounter(uRaw)) ep.nonInteger = true;
      if (!dMissing && !validCounter(dRaw)) ep.nonInteger = true;
      open[id] = ep; continue;
    }
    const ep = open[id]; if (!ep) continue;
    ep.samples++;
    if (hasEv(r, 'death-observed')) ep.sawDeath = true;
    if (r.paused === true || r.runtimeGate === false || r.gameOn === false) ep.sawPause = true;
    if (r.hidden === true || (r.visibility && r.visibility !== 'visible')) ep.sawHidden = true;

    // 카운터 무결성: 결측/NaN, 비정수/음수, 역행
    if (uMissing || dMissing || nMissing) ep.clockMissing = true;
    if (!uMissing && !validCounter(uRaw)) ep.nonInteger = true;
    if (!dMissing && !validCounter(dRaw)) ep.nonInteger = true;
    if (u != null && ep.prevU != null && u < ep.prevU) ep.clockBreak = true;
    if (d != null && ep.prevD != null && d < ep.prevD) ep.clockBreak = true;
    if (n != null && ep.prevN != null && n < ep.prevN) ep.clockBreak = true;
    // 가짜 zero event: zero라는데 hf가 0이 아님
    if (hasEv(r, 'flash-zero-observed') && hf != null && hf > TOL) ep.fakeZero = true;

    // 감소 구간: dU/dD는 두 끝점이 모두 유효 숫자일 때만 수치. 아니면 null(미상) — 0으로 간주 금지.
    if (hf != null && ep.prevHf != null) {
      const dHf = ep.prevHf - hf;
      const dU = (u != null && ep.prevU != null) ? (u - ep.prevU) : null;
      const dD = (d != null && ep.prevD != null) ? (d - ep.prevD) : null;
      const atDeath = hasEv(r, 'death-observed') || (ep.sawDeath && hf === 0);
      if (dHf > TOL) ep.intervals.push({ dHf, dU, dD, atDeath });
      if ((r.paused === true || r.gameOn === false) && dHf > TOL) ep.pauseDecay = true;
    }
    if (hf != null && hf < ep.minHf) ep.minHf = hf;

    // 종료는 실제 hf===0만 신뢰(가짜 zero event는 fakeZero로 REJECT, 종료로 인정하지 않음)
    if (hf === 0) {
      ep.reachedZero = true; ep.endU = u; ep.endD = d; ep.endN = n; ep.minHf = 0;
      ep.zeroKind = ep.sawDeath ? 'death-reset' : 'natural-decay';
      episodes.push(ep); open[id] = null; continue;
    }
    ep.prevHf = hf ?? ep.prevHf; ep.prevU = u ?? ep.prevU; ep.prevD = d ?? ep.prevD; ep.prevN = n ?? ep.prevN;
  }
  for (const id in open) if (open[id]) episodes.push(open[id]);
  return episodes;
}
export const extractEpisodesIntervals = extractEpisodes;  // 하위호환 별칭

// ── C5: 구간 증거 기반 감쇠 구동원 판별 (하드닝) ───────────────────────────
export function classifyDecaySparse(ep) {
  const decs = (ep.intervals || []).filter(iv => iv.dHf > TOL && !iv.atDeath);
  let updateOnly = 0, drawOnly = 0, both = 0, noCounter = 0, indeterminate = 0;
  for (const iv of decs) {
    const uKnown = (typeof iv.dU === 'number' && isFinite(iv.dU));
    const dKnown = (typeof iv.dD === 'number' && isFinite(iv.dD));
    if (!uKnown || !dKnown) { indeterminate++; continue; }   // 끝점 미상 → 0으로 보지 않음(핵심 수정)
    const uPos = iv.dU > 0, dPos = iv.dD > 0;
    if (uPos && !dPos) updateOnly++;
    else if (dPos && !uPos) drawOnly++;
    else if (uPos && dPos) both++;
    else noCounter++;   // dU===0 && dD===0 인데 hf 감소 → 불가능
  }
  let verdict, note;
  if (decs.length === 0) { verdict = 'UNKNOWN'; note = '감소 구간 없음(사망리셋 제외)'; }
  else if (noCounter > 0) { verdict = 'REJECT'; note = `무카운터 감소 ${noCounter}건(update/draw 모두 미진행인데 hf 감소)`; }
  else if (updateOnly > 0 && drawOnly > 0) { verdict = 'FAIL'; note = `모순: update-only ${updateOnly}+draw-only ${drawOnly}`; }
  else if (drawOnly > 0) { verdict = 'FAIL'; note = `draw 구동 회귀: update 없이 감소 ${drawOnly}건(고주사율 수명 단축)`; }
  else if (indeterminate > 0) { verdict = 'UNKNOWN'; note = `끝점 미상(누락/NaN) 구간 ${indeterminate}건 — 진행여부 판정 불가(0으로 보지 않음)`; }
  else if (updateOnly > 0) { verdict = 'PASS'; note = `update 구동(주사율 독립): draw 없이 감소 ${updateOnly}건(sp<1 성립), 둘다진행 ${both}`; }
  else { verdict = 'UNKNOWN'; note = `둘다진행 ${both}건만 — 드문/불완전 표본 분리 불가(총량 단순 일치 PASS 금지)`; }
  return { verdict, note, counts: { updateOnly, drawOnly, bothAdvance: both, noCounter, indeterminate, decrementIntervals: decs.length } };
}

// ── 에피소드 단위 계약 판정 ────────────────────────────────────────────────
export function judgeEpisode(ep) {
  const flags = [];
  const verdict = {};
  // C2 시계무결 (updates/draws/now 결측·NaN·비정수·음수·역행·가짜 zero)
  if (ep.clockBreak) { verdict.clock = 'REJECT'; flags.push('시계 역행(updates/draws/now 감소)'); }
  else if (ep.clockMissing) { verdict.clock = 'REJECT'; flags.push('시계 결측(updates/draws/now null·NaN)'); }
  else if (ep.nonInteger) { verdict.clock = 'REJECT'; flags.push('카운터 비정수/음수(updates·draws)'); }
  else if (ep.fakeZero) { verdict.clock = 'REJECT'; flags.push('가짜 zero event(hf≠0인데 flash-zero-observed)'); }
  else verdict.clock = 'PASS';

  // C3 일시정지
  if (ep.pauseDecay) { verdict.pause = 'REJECT'; flags.push('정지 중 hf 감쇠(update 멈춰야 함)'); }
  else if (ep.sawPause) { verdict.pause = 'UNKNOWN'; flags.push('정지 구간 포함 — 수명 측정 제외 필요'); }
  else verdict.pause = 'PASS';

  // C4 배경
  if (ep.sawHidden) { verdict.background = 'REJECT'; flags.push('배경/비가시 구간 포함 — 벽시계 수명 무효'); }
  else verdict.background = 'PASS';

  // 측정값(C7용). 끝점 미상이면 null → UNKNOWN.
  const peak = ep.peakHf;
  const decrements = (peak != null && ep.minHf != null) ? (peak - ep.minHf) : null;
  const dU = (num(ep.endU) != null && ep.startU != null) ? (num(ep.endU) - ep.startU) : null;
  const dD = (num(ep.endD) != null && ep.startD != null) ? (num(ep.endD) - ep.startD) : null;
  const dMs = (num(ep.endN) != null && ep.startN != null) ? (num(ep.endN) - ep.startN) : null;

  // C1 표본수
  if (ep.samples < 3 || decrements == null || decrements <= TOL) { verdict.sampleCount = 'UNKNOWN'; flags.push('표본 부족(수명 판정 불가)'); }
  else verdict.sampleCount = 'PASS';

  // C5 감쇠모델 — 구간 증거
  const c5 = classifyDecaySparse(ep);
  verdict.decayModel = c5.verdict;
  if (c5.verdict === 'FAIL') flags.push('C5 ' + c5.note);
  if (c5.verdict === 'REJECT') flags.push('C5 ' + c5.note);

  // C6 수명종료 (실제 hf===0 도달만)
  if (ep.reachedZero) verdict.lifetimeEnd = 'PASS';
  else { verdict.lifetimeEnd = (verdict.sampleCount === 'UNKNOWN') ? 'UNKNOWN' : 'FAIL'; if (verdict.lifetimeEnd === 'FAIL') flags.push('hf가 0으로 종료되지 않음(미종료)'); }

  // C7 고주사율 인증 — 에피소드 활성 drawHz. 끝점 미상·저주사율·감쇠 미확정이면 UNKNOWN.
  const drawHz = (dMs && dMs > 0 && dD != null && dD > 0) ? (dD / (dMs / 1000)) : null;
  let highRefresh, hrNote;
  if (verdict.clock === 'REJECT') { highRefresh = 'UNKNOWN'; hrNote = '시계 부적격'; }
  else if (verdict.sampleCount === 'UNKNOWN' || c5.verdict === 'UNKNOWN') { highRefresh = 'UNKNOWN'; hrNote = '감쇠모델/표본 불확정'; }
  else if (drawHz == null) { highRefresh = 'UNKNOWN'; hrNote = 'drawHz 산출 불가(끝점 미상)'; }
  else if (drawHz >= HIGH_REFRESH_MIN_HZ) {
    const okMs = (dMs != null && decrements != null && Math.abs(dMs - EXPECT_MS * (decrements / 6)) <= MS_TOL);
    highRefresh = (c5.verdict === 'PASS' && okMs) ? 'PASS' : (c5.verdict === 'FAIL' ? 'FAIL' : 'UNKNOWN');
    hrNote = `drawHz≈${drawHz.toFixed(1)}(고주사율) 실수명 ${dMs?.toFixed(1)}ms`;
  } else {
    highRefresh = 'UNKNOWN';
    hrNote = `drawHz≈${drawHz.toFixed(1)}<${HIGH_REFRESH_MIN_HZ} — 실제 고주사율 미실측(수명 PASS 승격 금지). 감쇠모델=${c5.verdict}`;
  }
  verdict.highRefresh = highRefresh;

  return {
    id: ep.id, etype: ep.etype, peakHf: peak, minHf: ep.minHf, decrements,
    updateTicks: dU, drawFrames: dD, realMs: dMs == null ? null : +dMs.toFixed(1),
    drawHz: drawHz == null ? null : +drawHz.toFixed(1), zeroKind: ep.zeroKind, reachedZero: ep.reachedZero,
    sawDeath: ep.sawDeath, sawPause: ep.sawPause, sawHidden: ep.sawHidden,
    verdict, c5, decayNote: c5.note, hrNote, flags
  };
}

// ── 부활/구울 분리 (event-stream + killed/revived 요약) ────────────────────
export function judgeRevive(rawIn, records) {
  const reviveEv = records.filter(r => hasEv(r, 'revive-observed') || hasEv(r, 'same-object-revive'));
  const firstDrawAfterRevive = records.filter(r => hasEv(r, 'first-draw-after-revive'));
  const ghoulEv = records.filter(r => hasEv(r, 'new-object-ghoul-candidate'));
  const residualAfterRevive = firstDrawAfterRevive.filter(r => num(r.hf) !== 0);
  let summary = null;
  if (Array.isArray(rawIn?.revived)) {
    const sameObj = rawIn.revived.filter(x => x && x.ghoul === false);
    const ghoul = rawIn.revived.filter(x => x && x.ghoul === true);
    summary = { sameObjectRevive: sameObj.length, newGhoul: ghoul.length,
      sameObjFirstHf0: sameObj.every(x => x.hf === 0), sameObjGlMode1: sameObj.every(x => x.mode === 1) };
  }
  const flags = [];
  let verdict;
  const haveRevive = reviveEv.length > 0 || firstDrawAfterRevive.length > 0 || (summary && summary.sameObjectRevive > 0);
  if (!haveRevive) verdict = 'NO_VERDICT(동일객체 부활 표본 없음)';
  else if (residualAfterRevive.length > 0) { verdict = 'FAIL(부활 첫 draw hf≠0 잔상)'; flags.push('부활 첫 draw 잔상'); }
  else if (summary && summary.sameObjectRevive > 0 && !(summary.sameObjFirstHf0 && summary.sameObjGlMode1)) { verdict = 'FAIL(요약상 부활 hf≠0/비GL)'; flags.push('요약 부활 비정상'); }
  else verdict = 'PASS(동일객체 부활 첫 draw hf0)';
  const newGhoulCount = ghoulEv.length || (summary ? summary.newGhoul : 0);
  return { verdict, sameObjectRevive: reviveEv.length || (summary ? summary.sameObjectRevive : 0),
    firstDrawAfterRevive: firstDrawAfterRevive.length, newGhoul: newGhoulCount,
    newGhoulNote: newGhoulCount ? `새 구울 ${newGhoulCount}건 — 동일객체 부활 판정 제외(별도 시각 인수)` : '새 구울 표본 없음',
    summary, flags };
}

// ── 전체 게이트 ────────────────────────────────────────────────────────────
export function gate(rawIn) {
  const raw = normalize(rawIn);
  const records = Array.isArray(raw.records) ? raw.records : [];
  const episodes = extractEpisodes(records).map(judgeEpisode);
  const revive = judgeRevive(rawIn, records);

  const anyReject = episodes.some(e => Object.values(e.verdict).includes('REJECT'));
  const anyFail = episodes.some(e => Object.values(e.verdict).includes('FAIL')) || /FAIL/.test(revive.verdict);
  const hrStates = episodes.map(e => e.verdict.highRefresh);
  const decayStates = episodes.map(e => e.verdict.decayModel);

  let overall;
  if (anyReject) overall = 'REJECT';
  else if (anyFail) overall = 'FAIL';
  else if (episodes.length === 0) overall = 'UNKNOWN(에피소드 없음)';
  else if (hrStates.includes('PASS')) overall = 'PASS(고주사율 실수명 인증 포함)';
  else overall = 'UNKNOWN(고주사율 미실측 — 구간증거 기반 감쇠모델만)';

  const decaySummary = decayStates.length && decayStates.every(s => s === 'PASS')
    ? 'PASS(전 에피소드 update 구동=주사율 독립)'
    : (decayStates.includes('FAIL') ? 'FAIL(draw 구동/모순)' : (decayStates.includes('REJECT') ? 'REJECT' : 'UNKNOWN/MIXED'));

  return {
    gate: 'ANIM-HIGHHZ-LIFETIME-GATE', version: 2,
    highRefreshMinHz: HIGH_REFRESH_MIN_HZ, physHz: PHYS_HZ, expectMs: EXPECT_MS,
    episodeCount: episodes.length, episodes, revive,
    decayModelSummary: decaySummary,
    highRefreshActual: hrStates.includes('PASS') ? 'MEASURED' : 'NOT-MEASURED(실제 >=90Hz 표본 없음)',
    overall
  };
}

// ── 테스트용 trace 생성기 (실제 원식 반영) ─────────────────────────────────
function rec(o) {
  return Object.assign({ phase: 'after-update', now: 0, id: 7, etype: 4, hf: 0, alive: true,
    updates: 0, draws: 0, glMode: 1, events: [], visibility: 'visible', hidden: false,
    paused: false, gameOn: true, runtimeGate: true, useGL: true, contextLost: false }, o);
}
// update 구동(hf-=sp/틱). after-update 포함 시 draw 없이 감소한 update-only 구간이 생긴다.
function traceUpdateDriven({ sp = 1, drawHz = 30, peak = 6, startNow = 1000, phases = ['after-update', 'after-draw'] }) {
  const out = []; const updMs = 1000 / PHYS_HZ; const de = PHYS_HZ / drawHz;
  let u = 10, d = 5, now = startNow, hf = peak, nd = de, t = 0;
  out.push(rec({ hf, updates: u, draws: d, now, events: ['flash-start-observed'] }));
  while (hf > TOL) {
    u += 1; t += 1; now += updMs; hf = Math.max(0, hf - sp);
    if (phases.includes('after-update')) out.push(rec({ phase: 'after-update', hf: r4(hf), updates: u, draws: d, now, events: hf <= TOL ? ['flash-zero-observed'] : ['flash-decrease'] }));
    while (t >= nd - TOL) { d += 1; nd += de; if (phases.includes('after-draw')) out.push(rec({ phase: 'after-draw', hf: r4(hf), updates: u, draws: d, now, events: [] })); }
  }
  return out;
}
// draw 구동 회귀(hf-=step/draw). after-draw만. 고주사율이면 update 없이 감소한 draw-only 구간 발생.
function traceDrawDriven({ step = 1, drawHz = 30, peak = 6, startNow = 1000 }) {
  const out = []; const updMs = 1000 / PHYS_HZ; const tp = PHYS_HZ / drawHz;
  let u = 10, d = 5, now = startNow, hf = peak, t = 0, nd = tp;
  out.push(rec({ hf, updates: u, draws: d, now, events: ['flash-start-observed'] }));
  while (hf > TOL) {
    u += 1; t += 1; now += updMs;
    while (t >= nd - TOL && hf > TOL) { d += 1; nd += tp; hf = Math.max(0, hf - step); out.push(rec({ phase: 'after-draw', hf: r4(hf), updates: u, draws: d, now, events: hf <= TOL ? ['flash-zero-observed'] : ['flash-decrease'] })); }
  }
  return out;
}
function r4(x) { return Math.round(x * 1e4) / 1e4; }

// 반례(root 제공 counterexamples-before.json): draws 누락
const RAW_MISSING_MIDDLE_DRAW = { records: [
  { id: 1, hf: 3, updates: 10, draws: 0, now: 0, events: ['flash-start-observed'] },
  { id: 1, hf: 2, updates: 11, now: 5 },                     // draws 누락
  { id: 1, hf: 1, updates: 12, draws: 2, now: 10 },
  { id: 1, hf: 0, updates: 13, draws: 3, now: 15, events: ['flash-zero-observed'] }
] };
const RAW_MISSING_DRAW_COUNTER = { records: [
  { id: 1, hf: 3, updates: 10, now: 0, events: ['flash-start-observed'] },
  { id: 1, hf: 2, updates: 11, now: 5 },
  { id: 1, hf: 1, updates: 12, now: 10 },
  { id: 1, hf: 0, updates: 13, now: 15, events: ['flash-zero-observed'] }
] };

function fixtures() {
  return [
    { name: 'updateonly-proof (sp1,30fps,after-update)', expectOverall: /UNKNOWN\(고주사율/, expectDecay: /PASS/, raw: { records: traceUpdateDriven({ sp: 1, drawHz: 30 }) } },
    { name: 'slowmo-sp0.5 (update 구동)', expectOverall: /UNKNOWN\(고주사율/, expectDecay: /PASS/, raw: { records: traceUpdateDriven({ sp: 0.5, drawHz: 30 }) } },
    { name: 'highrefresh-updateonly (240fps)', expectOverall: /PASS\(고주사율/, expectDecay: /PASS/, raw: { records: traceUpdateDriven({ sp: 1, drawHz: 240 }) } },
    { name: 'drawstep2 30fps after-draw만 → UNKNOWN(총량일치 오PASS 방지)', expectOverall: /UNKNOWN/, expectDecay: /UNKNOWN/, raw: { records: traceDrawDriven({ step: 2, drawHz: 30 }) } },
    { name: 'drawdriven 240fps → FAIL(draw-only 증명)', expectOverall: /FAIL/, expectDecay: /FAIL/, raw: { records: traceDrawDriven({ step: 1, drawHz: 240 }) } },
    { name: 'afterdraw-only-updatedriven → UNKNOWN(둘다진행)', expectOverall: /UNKNOWN/, expectDecay: /UNKNOWN/, raw: { records: traceUpdateDriven({ sp: 1, drawHz: 30, phases: ['after-draw'] }) } },
    { name: '[반례] missing-middle-draw → REJECT(draws 누락)', expectOverall: /REJECT/, expectDecay: /./, raw: RAW_MISSING_MIDDLE_DRAW },
    { name: '[반례] missing-draw-counter → REJECT', expectOverall: /REJECT/, expectDecay: /./, raw: RAW_MISSING_DRAW_COUNTER },
    { name: 'nocounter(감소하는데 카운터 무진행) → REJECT', expectOverall: /REJECT/, expectDecay: /./,
      raw: { records: [rec({ hf: 6, updates: 10, draws: 5, now: 0, events: ['flash-start-observed'] }),
        rec({ phase: 'after-draw', hf: 3, updates: 10, draws: 5, now: 20, events: ['flash-decrease'] }),
        rec({ phase: 'after-draw', hf: 0, updates: 10, draws: 5, now: 40, events: ['flash-zero-observed'] })] } },
    { name: 'conflict(update-only+draw-only) → FAIL', expectOverall: /FAIL/, expectDecay: /FAIL/,
      raw: { records: [rec({ hf: 6, updates: 10, draws: 5, now: 0, events: ['flash-start-observed'] }),
        rec({ phase: 'after-update', hf: 5, updates: 11, draws: 5, now: 16, events: ['flash-decrease'] }),
        rec({ phase: 'after-draw', hf: 4, updates: 11, draws: 6, now: 20, events: ['flash-decrease'] }),
        rec({ phase: 'after-draw', hf: 0, updates: 11, draws: 7, now: 120, events: ['flash-zero-observed'] })] } },
    { name: '시계역행(updates 감소) → REJECT', expectOverall: /REJECT/, expectDecay: /./,
      raw: { records: [rec({ hf: 6, updates: 10, draws: 5, now: 100, events: ['flash-start-observed'] }),
        rec({ hf: 5, updates: 9, draws: 5, now: 99, events: ['flash-decrease'] }),
        rec({ hf: 0, updates: 8, draws: 5, now: 98, events: ['flash-zero-observed'] })] } },
    { name: '비정수 카운터(draws 소수) → REJECT', expectOverall: /REJECT/, expectDecay: /./,
      raw: { records: [rec({ hf: 6, updates: 10, draws: 5, now: 0, events: ['flash-start-observed'] }),
        rec({ phase: 'after-update', hf: 5, updates: 11, draws: 5.5, now: 16, events: ['flash-decrease'] }),
        rec({ hf: 0, updates: 12, draws: 6, now: 120, events: ['flash-zero-observed'] })] } },
    { name: '가짜 zero event(hf≠0인데 flash-zero) → REJECT', expectOverall: /REJECT/, expectDecay: /./,
      raw: { records: [rec({ hf: 6, updates: 10, draws: 5, now: 0, events: ['flash-start-observed'] }),
        rec({ phase: 'after-update', hf: 3, updates: 13, draws: 5, now: 50, events: ['flash-zero-observed'] })] } },
    { name: '정지 중 감쇠 → REJECT', expectOverall: /REJECT/, expectDecay: /./,
      raw: { records: [rec({ hf: 6, updates: 1, draws: 1, now: 0, events: ['flash-start-observed'] }),
        rec({ hf: 5, updates: 1, draws: 2, now: 20, paused: true, runtimeGate: false, events: ['flash-decrease'] }),
        rec({ hf: 0, updates: 1, draws: 8, now: 120, paused: true, runtimeGate: false, events: ['flash-zero-observed'] })] } },
    { name: '배경(hidden) 포함 → REJECT', expectOverall: /REJECT/, expectDecay: /./,
      raw: { records: traceUpdateDriven({ sp: 1, drawHz: 240 }).map((r, i) => i > 0 && i < 3 ? { ...r, hidden: true, visibility: 'hidden' } : r) } },
    { name: '미종료(hf 0 미도달) → FAIL', expectOverall: /FAIL/, expectDecay: /./,
      raw: { records: [rec({ hf: 6, updates: 1, draws: 1, now: 0, events: ['flash-start-observed'] }),
        rec({ phase: 'after-update', hf: 5, updates: 2, draws: 1, now: 16, events: ['flash-decrease'] }),
        rec({ phase: 'after-update', hf: 4, updates: 3, draws: 2, now: 33, events: ['flash-decrease'] })] } },
    { name: '부활 잔상(first-draw hf≠0) → FAIL', expectOverall: /FAIL/, expectDecay: /./,
      raw: { records: [...traceUpdateDriven({ sp: 1, drawHz: 240 }), rec({ hf: 3, updates: 200, draws: 90, now: 2000, alive: true, events: ['first-draw-after-revive'] })] } },
    { name: '새 구울(동일객체 아님) → 분리', expectOverall: /PASS|UNKNOWN/, expectDecay: /PASS/,
      raw: { records: [...traceUpdateDriven({ sp: 1, drawHz: 240 }), rec({ id: 999, etype: 101, hf: 0, updates: 210, draws: 95, now: 2100, events: ['new-object-ghoul-candidate'] })] } }
  ];
}

function fmt(v) { return v == null ? '·' : v; }
function printResult(label, r) {
  console.log(`\n=== ${label} ===`);
  console.log(`전체=${r.overall} | 감쇠모델=${r.decayModelSummary} | 고주사율실측=${r.highRefreshActual} | 에피소드=${r.episodeCount}`);
  for (const e of r.episodes) {
    console.log(`  id${e.id} peak${fmt(e.peakHf)}→${fmt(e.minHf)} dU=${fmt(e.updateTicks)} dD=${fmt(e.drawFrames)} ${fmt(e.realMs)}ms drawHz=${fmt(e.drawHz)} zero=${fmt(e.zeroKind)}`);
    console.log(`     계약: sample=${e.verdict.sampleCount} clock=${e.verdict.clock} pause=${e.verdict.pause} bg=${e.verdict.background} decay=${e.verdict.decayModel} end=${e.verdict.lifetimeEnd} hiHz=${e.verdict.highRefresh} [uOnly=${e.c5.counts.updateOnly} dOnly=${e.c5.counts.drawOnly} both=${e.c5.counts.bothAdvance} indet=${e.c5.counts.indeterminate}]`);
    if (e.flags.length) console.log(`     ⚠ ${e.flags.join(' | ')}`);
  }
  console.log(`  부활/구울: ${r.revive.verdict} · 동일객체=${r.revive.sameObjectRevive} 구울=${r.revive.newGhoul}`);
}

function main() {
  const args = process.argv.slice(2);
  let fail = 0;
  if (args.length) {
    for (const p of args) {
      let raw; try { raw = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.error(`READ-FAIL ${p}: ${e.message}`); fail++; continue; }
      printResult(p, gate(raw));
    }
    console.log('\n(실파일 모드: 분류 출력)');
  } else {
    console.log('ANIM-HIGHHZ-LIFETIME-GATE (canonical v2) — 내장 fixture 자가검사\n');
    for (const f of fixtures()) {
      const r = gate(f.raw);
      const okO = f.expectOverall.test(r.overall);
      const okD = f.expectDecay.test(r.decayModelSummary);
      const ok = okO && okD;
      if (!ok) fail++;
      console.log(`[${ok ? 'OK ' : 'XX '}] ${f.name}`);
      console.log(`      overall=${r.overall} (기대 ${f.expectOverall}) · decay=${r.decayModelSummary} · 부활=${r.revive.verdict}`);
    }
  }
  console.log(`\n${fail === 0 ? 'ALL OK' : fail + ' FAIL'} (exit ${fail === 0 ? 0 : 1})`);
  process.exit(fail === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
