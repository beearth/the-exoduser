#!/usr/bin/env node
/*
 * ANIM-HIGHHZ-LIFETIME-GATE — 고주사율(>=90Hz)·무표본·수명종료 계약 게이트 (게임 실행 없이)
 * 소유: ANIMVFX / 터미널 8. 경로: tools/team-followup-20261001/ANIMVFX/animvfx_highhz_lifetime_gate.mjs
 * 선행: animvfx_gl_probe.js(관측기) · animvfx_gl_validator.mjs(4상태 분류) 의 다음 한 건.
 *
 * 목적: 피격 플래시 수명이 "주사율 독립(고정스텝 update 구동)"으로 종료되는지,
 *       고주사율에서 1/4로 줄지 않는지를 raw로 판정하되, 근거가 부족하면 PASS로 승격하지 않는다.
 *
 * 핵심 계약(각 플래시 에피소드별):
 *   C1 표본수(sampleCount)   — peak→zero 구간 표본 부족 시 UNKNOWN(판정 불가).
 *   C2 시계무결(clock)        — now/updates/draws 결측·역행 시 REJECT.
 *   C3 일시정지(pause)        — paused/runtimeGate=false 구간 감쇠는 금지. 감쇠 발견 시 REJECT. 전구간 정지=UNKNOWN.
 *   C4 배경(background)        — hidden/비가시 구간은 벽시계 수명 무효 → updateTicks로만 측정, 벽시계 REJECT 표기.
 *   C5 감쇠모델(decayModel)    — update-tick 구동(주사율 독립) vs draw-frame 구동(주사율 의존 회귀) 판별.
 *   C6 수명종료(lifetimeEnd)   — hf가 0에 도달·유지(자연감쇠 0 또는 사망리셋 0). 미종료/재점화 시 FAIL.
 *   C7 고주사율(highRefresh)   — 에피소드 drawHz>=90 표본에서만 실수명 인증. 없으면 UNKNOWN(실제 고주사율 미실측).
 *   C8 부활/구울(revive)       — 동일객체 부활 첫 draw hf0(revive-observed/first-draw-after-revive) / 새 구울 분리.
 *   부정회귀(negative)         — 각 실패를 겨냥한 fixture를 반드시 FAIL/REJECT/UNKNOWN으로 잡는다.
 *
 * 판정 어휘: PASS / FAIL / REJECT / UNKNOWN.
 *   - PASS    = 계약 충족을 실제 근거로 확인.
 *   - FAIL    = 계약 위반을 실제 근거로 확인(회귀).
 *   - REJECT  = 입력이 계약 검증에 부적격(시계손상·정지오염 등).
 *   - UNKNOWN = 근거 부족(표본0·고주사율 미실측). 절대 PASS로 승격 금지.
 *
 * 사용: node animvfx_highhz_lifetime_gate.mjs [raw.json ...]   (인자 없으면 내장 fixture 자가검사)
 * exit 0 = 모든 입력/fixture가 기대대로(모순·미탐 없음), 1 = 불일치.
 *
 * ★ 브라우저/게임/서버 실행 0. 읽기+Node 작은 검사만. game.html 등 공용/타팀 파일 미접촉.
 */
import fs from 'node:fs';

export const HIGH_REFRESH_MIN_HZ = 90;   // 이 미만은 "고주사율" 아님 — 고주사율 수명 PASS 금지(UNKNOWN).
export const PHYS_HZ = 60;               // 고정스텝 update. hf=6 → 6틱 ≈ 100ms(주사율 독립 기대).
const TICK_TOL = 1;                      // update-tick 허용 오차(±1)
const EXPECT_MS = 1000 * 6 / PHYS_HZ;    // 100ms
const MS_TOL = 40;                       // 실수명 허용 오차

function num(x) { return (typeof x === 'number' && isFinite(x)) ? x : null; }

// raw 스키마 정규화(records 또는 report.records)
export function normalize(raw) {
  if (Array.isArray(raw?.records)) return raw;
  if (Array.isArray(raw?.report?.records)) {
    const rep = raw.report;
    return { ...raw, records: rep.records, draws: rep.draws ?? raw.draws, updates: rep.updates ?? raw.updates, _reportWrapped: true };
  }
  return { ...raw, records: Array.isArray(raw?.records) ? raw.records : [] };
}

const hasEv = (r, name) => Array.isArray(r.events) && r.events.includes(name);

// ── 플래시 에피소드 추출: id별로 flash-start(hf 상승) → flash-zero(hf=0) ─────────
export function extractEpisodes(records) {
  const open = {};        // id -> 진행중 에피소드
  const episodes = [];
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (r.id == null) continue;
    const id = r.id, hf = num(r.hf);
    const start = hasEv(r, 'flash-start-observed') || (open[id] == null && hf != null && hf > 0);
    if (start && (open[id] == null)) {
      open[id] = { id, etype: r.etype, startIdx: i, peakHf: hf ?? null,
        startUpdates: num(r.updates), startDraws: num(r.draws), startNow: num(r.now),
        minHf: hf ?? null, minIdx: i, minUpdates: num(r.updates), minDraws: num(r.draws), minNow: num(r.now),
        decreaseEvents: 0, sawPauseDuring: false, sawHiddenDuring: false,
        sawDeath: false, sawReviveReset: false, clockBreak: false, pauseDecay: false, reachedZero: false,
        zeroKind: null, lastHf: hf ?? null, lastUpdates: num(r.updates), lastDraws: num(r.draws), lastNow: num(r.now),
        samples: 1 };
    }
    const ep = open[id];
    if (!ep) continue;
    ep.samples++;
    if (hasEv(r, 'flash-decrease')) ep.decreaseEvents++;
    if (r.paused === true || r.runtimeGate === false || r.gameOn === false) ep.sawPauseDuring = true;
    if (r.hidden === true || (r.visibility && r.visibility !== 'visible')) ep.sawHiddenDuring = true;
    if (hasEv(r, 'death-observed') || r.alive === false) ep.sawDeath = ep.sawDeath || hasEv(r, 'death-observed');

    // 시계 역행 검사(결측은 집계에서 별도 처리)
    const u = num(r.updates), d = num(r.draws), n = num(r.now);
    if (u != null && ep.lastUpdates != null && u < ep.lastUpdates) ep.clockBreak = true;
    if (d != null && ep.lastDraws != null && d < ep.lastDraws) ep.clockBreak = true;
    if (n != null && ep.lastNow != null && n < ep.lastNow) ep.clockBreak = true;
    if (u == null || n == null) ep.clockMissing = true;

    // 정지 중 감쇠(계약 위반): paused 상태인데 hf가 더 줄었다
    if ((r.paused === true || r.gameOn === false) && hf != null && ep.lastHf != null && hf < ep.lastHf) ep.pauseDecay = true;

    if (hf != null && (ep.minHf == null || hf < ep.minHf) && hf > 0) {
      ep.minHf = hf; ep.minIdx = i; ep.minUpdates = u; ep.minDraws = d; ep.minNow = n;
    }
    // 종료: hf==0
    if (hf === 0 || hasEv(r, 'flash-zero-observed')) {
      ep.reachedZero = true;
      ep.endUpdates = u; ep.endDraws = d; ep.endNow = n;
      ep.zeroKind = (ep.sawDeath && (num(r.updates) != null)) ? 'death-reset' : 'natural-decay';
      ep.minHf = 0; ep.minUpdates = u; ep.minDraws = d; ep.minNow = n;
      episodes.push(ep); open[id] = null; continue;
    }
    ep.lastHf = hf ?? ep.lastHf; ep.lastUpdates = u ?? ep.lastUpdates; ep.lastDraws = d ?? ep.lastDraws; ep.lastNow = n ?? ep.lastNow;
  }
  // 종료 못한 에피소드(미종료 후보)
  for (const id in open) if (open[id]) { const ep = open[id]; ep.reachedZero = false; episodes.push(ep); }
  return episodes;
}

// ── 에피소드 단위 계약 판정 ────────────────────────────────────────────────
export function judgeEpisode(ep) {
  const flags = [];
  const verdict = {};
  // C2 시계무결
  if (ep.clockBreak) { verdict.clock = 'REJECT'; flags.push('시계 역행(updates/draws/now 감소)'); }
  else if (ep.clockMissing) { verdict.clock = 'REJECT'; flags.push('시계 결측(updates/now null)'); }
  else verdict.clock = 'PASS';

  // C3 일시정지
  if (ep.pauseDecay) { verdict.pause = 'REJECT'; flags.push('정지 중 hf 감쇠(update 멈춰야 함)'); }
  else if (ep.sawPauseDuring) { verdict.pause = 'UNKNOWN'; flags.push('정지 구간 포함 — 수명 측정 제외 필요'); }
  else verdict.pause = 'PASS';

  // C4 배경
  if (ep.sawHiddenDuring) { verdict.background = 'REJECT'; flags.push('배경/비가시 구간 포함 — 벽시계 수명 무효(updateTick만 유효)'); }
  else verdict.background = 'PASS';

  // 측정값
  const peak = ep.peakHf;
  const decrements = (peak != null && ep.minHf != null) ? (peak - ep.minHf) : null;
  const dU = (num(ep.endUpdates ?? ep.minUpdates) != null && ep.startUpdates != null) ? (num(ep.endUpdates ?? ep.minUpdates) - ep.startUpdates) : null;
  const dD = (num(ep.endDraws ?? ep.minDraws) != null && ep.startDraws != null) ? (num(ep.endDraws ?? ep.minDraws) - ep.startDraws) : null;
  const dMs = (num(ep.endNow ?? ep.minNow) != null && ep.startNow != null) ? (num(ep.endNow ?? ep.minNow) - ep.startNow) : null;

  // C1 표본수 — peak→0(또는 min) 사이 감소 근거가 최소 2표본·1decrement 이상
  if (ep.samples < 3 || decrements == null || decrements < 1) { verdict.sampleCount = 'UNKNOWN'; flags.push('표본 부족(수명 판정 불가)'); }
  else verdict.sampleCount = 'PASS';

  // C5 감쇠모델 — update-tick 구동 vs draw-frame 구동
  let decayModel = 'UNKNOWN', decayNote = '';
  if (decrements != null && dU != null && dD != null && decrements >= 1) {
    // 감쇠가 update-tick을 따르는가 draw-frame을 따르는가 — 감소수와 일치하는 쪽이 구동원.
    // (저주사율: draw<감소, 고주사율: draw>감소. 어느 쪽이든 '일치 여부'로 판별하면 둘 다 맞음.)
    const updateMatch = Math.abs(dU - decrements) <= TICK_TOL;
    const drawMatch = Math.abs(dD - decrements) <= TICK_TOL;
    if (updateMatch && !drawMatch) { decayModel = 'PASS'; decayNote = `update-tick 구동(주사율 독립): ${decrements}감소≈${dU}updateTick, draw는 ${dD}프레임`; }
    else if (drawMatch && !updateMatch) { decayModel = 'FAIL'; decayNote = `draw-frame 구동(주사율 의존 회귀): ${decrements}감소≈${dD}draw, update ${dU}틱`; flags.push('감쇠가 draw 구동 — 고주사율에서 수명 단축 회귀'); }
    else if (updateMatch && drawMatch) { decayModel = 'UNKNOWN'; decayNote = `update≈draw 레이트(구분 불가): ${decrements}감소, dU=${dU} dD=${dD}. 고주사율/저주사율 분리 표본 필요`; }
    else { decayModel = 'UNKNOWN'; decayNote = `불명확: ${decrements}감소, dU=${dU} dD=${dD}`; }
  } else { decayNote = '감쇠 표본 부족'; }
  verdict.decayModel = decayModel;

  // C6 수명종료
  if (ep.reachedZero) { verdict.lifetimeEnd = 'PASS'; }
  else { verdict.lifetimeEnd = (verdict.sampleCount === 'UNKNOWN') ? 'UNKNOWN' : 'FAIL'; if (verdict.lifetimeEnd === 'FAIL') flags.push('hf가 0으로 종료되지 않음(미종료)'); }

  // C7 고주사율 인증 — 에피소드 활성 drawHz
  const drawHz = (dMs && dMs > 0 && dD) ? (dD / (dMs / 1000)) : null;
  let highRefresh, hrNote;
  if (verdict.sampleCount === 'UNKNOWN') { highRefresh = 'UNKNOWN'; hrNote = '표본 부족'; }
  else if (drawHz == null) { highRefresh = 'UNKNOWN'; hrNote = 'drawHz 산출 불가'; }
  else if (drawHz >= HIGH_REFRESH_MIN_HZ) {
    // 고주사율 표본 — 실수명 인증
    const okMs = (dMs != null && Math.abs(dMs - EXPECT_MS * (decrements / 6)) <= MS_TOL);
    highRefresh = (decayModel === 'PASS' && okMs) ? 'PASS' : (decayModel === 'FAIL' ? 'FAIL' : 'UNKNOWN');
    hrNote = `drawHz≈${drawHz.toFixed(1)}(고주사율) 실수명 ${dMs?.toFixed(1)}ms`;
  } else {
    highRefresh = 'UNKNOWN';
    hrNote = `drawHz≈${drawHz.toFixed(1)}<${HIGH_REFRESH_MIN_HZ} — 실제 고주사율 미실측(수명 PASS 승격 금지). 감쇠모델=${decayModel}`;
  }
  verdict.highRefresh = highRefresh;

  return {
    id: ep.id, etype: ep.etype, peakHf: peak, minHf: ep.minHf, decrements,
    updateTicks: dU, drawFrames: dD, realMs: dMs == null ? null : +dMs.toFixed(1),
    drawHz: drawHz == null ? null : +drawHz.toFixed(1), zeroKind: ep.zeroKind, reachedZero: ep.reachedZero,
    sawDeath: ep.sawDeath, sawPause: ep.sawPauseDuring, sawHidden: ep.sawHiddenDuring,
    verdict, decayNote, hrNote, flags
  };
}

// ── 부활/구울 분리 (event-stream + killed/revived 요약) ────────────────────
export function judgeRevive(rawIn, records) {
  const reviveEv = records.filter(r => hasEv(r, 'revive-observed') || hasEv(r, 'same-object-revive'));
  const firstDrawAfterRevive = records.filter(r => hasEv(r, 'first-draw-after-revive'));
  const ghoulEv = records.filter(r => hasEv(r, 'new-object-ghoul-candidate'));
  // 동일객체 부활 첫 draw hf0 확인
  const residualAfterRevive = firstDrawAfterRevive.filter(r => num(r.hf) !== 0);
  // 요약 스키마
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

  // 집계: 최악 등급 승격 금지 규칙(UNKNOWN은 PASS로 올리지 않음)
  const anyFail = episodes.some(e => Object.values(e.verdict).includes('FAIL')) || /FAIL/.test(revive.verdict);
  const anyReject = episodes.some(e => Object.values(e.verdict).includes('REJECT'));
  const hrStates = episodes.map(e => e.verdict.highRefresh);
  const decayStates = episodes.map(e => e.verdict.decayModel);

  let overall;
  if (anyReject) overall = 'REJECT';
  else if (anyFail) overall = 'FAIL';
  else if (episodes.length === 0) overall = 'UNKNOWN(에피소드 없음)';
  else if (hrStates.includes('PASS')) overall = 'PASS(고주사율 실수명 인증 포함)';
  else overall = 'UNKNOWN(고주사율 미실측 — 감쇠모델만 확인)';

  const decaySummary = decayStates.every(s => s === 'PASS') && decayStates.length
    ? 'PASS(전 에피소드 update-tick 구동=주사율 독립)'
    : (decayStates.includes('FAIL') ? 'FAIL(draw 구동 회귀)' : 'MIXED/UNKNOWN');

  return {
    gate: 'ANIM-HIGHHZ-LIFETIME-GATE', version: 1,
    highRefreshMinHz: HIGH_REFRESH_MIN_HZ, physHz: PHYS_HZ, expectMs: EXPECT_MS,
    episodeCount: episodes.length, episodes, revive,
    decayModelSummary: decaySummary,
    highRefreshActual: hrStates.includes('PASS') ? 'MEASURED' : 'NOT-MEASURED(실제 >=90Hz 표본 없음)',
    overall
  };
}

// ── 부정회귀 fixtures (각 실패를 겨냥) ───────────────────────────────────────
function rec(o) {
  return Object.assign({ phase: 'after-update', now: 0, id: 1, etype: 4, hf: 0, alive: true,
    updates: 0, draws: 0, glMode: 1, events: [], visibility: 'visible', hidden: false,
    paused: false, gameOn: true, runtimeGate: true, useGL: true, contextLost: false }, o);
}
// update-tick 구동 감쇠(주사율 독립): hf가 update 틱마다 1 감소. draw는 drawHz 비율로 누적.
//   저주사율(draw<update): dD<감소. 고주사율(draw>update): dD>감소. 어느 쪽이든 dU≈감소.
function episodeUpdateDriven(drawHz, startNow, baseU, baseD) {
  const out = []; const updMs = 1000 / PHYS_HZ; const drawsPerTick = drawHz / PHYS_HZ;
  let u = baseU, d = baseD, now = startNow;
  out.push(rec({ id: 7, hf: 6, updates: u, draws: d, now, events: ['flash-start-observed'] }));
  for (let hf = 5; hf >= 0; hf--) {
    u += 1; now += updMs; d = baseD + Math.round((u - baseU) * drawsPerTick);
    out.push(rec({ id: 7, hf, updates: u, draws: d, now, events: hf === 0 ? ['flash-zero-observed'] : ['flash-decrease'] }));
  }
  return out;
}
// draw-frame 구동(회귀): hf가 draw 프레임마다 1 감소. update는 drawHz 대비 비율로 누적.
//   고주사율에서 dD≈감소, dU는 적음 → 수명이 draw 수에 묶여 고주사율에서 단축.
function episodeDrawDriven(drawHz, startNow) {
  const out = []; const drawMs = 1000 / drawHz; const updatesPerDraw = PHYS_HZ / drawHz;
  let u = 100, d = 50, now = startNow;
  out.push(rec({ id: 7, hf: 6, updates: u, draws: d, now, events: ['flash-start-observed'] }));
  for (let hf = 5; hf >= 0; hf--) {
    d += 1; now += drawMs; u = 100 + Math.round((d - 50) * updatesPerDraw);
    out.push(rec({ id: 7, hf, updates: u, draws: d, now, events: hf === 0 ? ['flash-zero-observed'] : ['flash-decrease'] }));
  }
  return out;
}

function fixtures() {
  return [
    { name: '정상(update-tick 구동, 저주사율 30Hz) → 고주사율 UNKNOWN·감쇠 PASS',
      expectOverall: /UNKNOWN\(고주사율 미실측/, expectDecay: /PASS/,
      raw: { records: episodeUpdateDriven(30, 1000, 10, 5) } },
    { name: '정상(update-tick 구동, 고주사율 240Hz) → 고주사율 PASS',
      expectOverall: /PASS\(고주사율/, expectDecay: /PASS/,
      raw: { records: episodeUpdateDriven(240, 1000, 10, 5) } },
    { name: '회귀(draw-frame 구동, 240Hz) → FAIL',
      expectOverall: /FAIL/, expectDecay: /FAIL/,
      raw: { records: episodeDrawDriven(240, 1000) } },
    { name: '무표본(flash-start만, 감쇠 없음) → UNKNOWN',
      expectOverall: /UNKNOWN/, expectDecay: /UNKNOWN|MIXED/,
      raw: { records: [rec({ id: 7, hf: 6, updates: 1, draws: 1, now: 0, events: ['flash-start-observed'] })] } },
    { name: '시계역행(updates 감소) → REJECT',
      expectOverall: /REJECT/, expectDecay: /./,
      raw: { records: [rec({ id: 7, hf: 6, updates: 10, draws: 5, now: 100, events: ['flash-start-observed'] }),
        rec({ id: 7, hf: 5, updates: 9, draws: 5, now: 99, events: ['flash-decrease'] }),
        rec({ id: 7, hf: 0, updates: 8, draws: 5, now: 98, events: ['flash-zero-observed'] })] } },
    { name: '시계결측(now null) → REJECT',
      expectOverall: /REJECT/, expectDecay: /./,
      raw: { records: [rec({ id: 7, hf: 6, updates: 1, draws: 1, now: null, events: ['flash-start-observed'] }),
        rec({ id: 7, hf: 5, updates: 2, draws: 1, now: null, events: ['flash-decrease'] }),
        rec({ id: 7, hf: 0, updates: 3, draws: 1, now: null, events: ['flash-zero-observed'] })] } },
    { name: '정지 중 감쇠(paused=true인데 hf 감소) → REJECT',
      expectOverall: /REJECT/, expectDecay: /./,
      raw: { records: [rec({ id: 7, hf: 6, updates: 1, draws: 1, now: 0, events: ['flash-start-observed'] }),
        rec({ id: 7, hf: 5, updates: 1, draws: 2, now: 20, paused: true, runtimeGate: false, events: ['flash-decrease'] }),
        rec({ id: 7, hf: 0, updates: 1, draws: 8, now: 120, paused: true, runtimeGate: false, events: ['flash-zero-observed'] })] } },
    { name: '배경(hidden=true) 포함 → REJECT(벽시계 무효)',
      expectOverall: /REJECT/, expectDecay: /./,
      raw: { records: episodeUpdateDriven(240, 1000, 10, 5).map((r, i) => i > 0 && i < 3 ? { ...r, hidden: true, visibility: 'hidden' } : r) } },
    { name: '미종료(hf가 0에 도달 안 함) → FAIL',
      expectOverall: /FAIL/, expectDecay: /./,
      raw: { records: [rec({ id: 7, hf: 6, updates: 1, draws: 1, now: 0, events: ['flash-start-observed'] }),
        rec({ id: 7, hf: 5, updates: 2, draws: 1, now: 16, events: ['flash-decrease'] }),
        rec({ id: 7, hf: 4, updates: 3, draws: 2, now: 33, events: ['flash-decrease'] })] } },
    { name: '부활 잔상(first-draw-after-revive hf≠0) → revive FAIL',
      expectOverall: /FAIL/, expectDecay: /./,
      raw: { records: [...episodeUpdateDriven(240, 1000, 10, 5),
        rec({ id: 7, hf: 3, updates: 200, draws: 90, now: 2000, alive: true, events: ['first-draw-after-revive'] })] } },
    { name: '새 구울(동일객체 부활 아님) → 분리(부활 NO_VERDICT, 구울 집계)',
      expectOverall: /PASS|UNKNOWN/, expectDecay: /PASS/,
      raw: { records: [...episodeUpdateDriven(240, 1000, 10, 5),
        rec({ id: 999, etype: 101, hf: 0, updates: 210, draws: 95, now: 2100, events: ['new-object-ghoul-candidate'] })] } }
  ];
}

function fmt(v) { return v == null ? '·' : v; }
function printResult(label, r) {
  console.log(`\n=== ${label} ===`);
  console.log(`전체=${r.overall} | 감쇠모델=${r.decayModelSummary} | 고주사율실측=${r.highRefreshActual} | 에피소드=${r.episodeCount}`);
  for (const e of r.episodes) {
    console.log(`  id${e.id}(et${e.etype}) peak${fmt(e.peakHf)}→${fmt(e.minHf)} dU=${fmt(e.updateTicks)} dD=${fmt(e.drawFrames)} ${fmt(e.realMs)}ms drawHz=${fmt(e.drawHz)} zero=${fmt(e.zeroKind)}`);
    console.log(`     계약: sample=${e.verdict.sampleCount} clock=${e.verdict.clock} pause=${e.verdict.pause} bg=${e.verdict.background} decay=${e.verdict.decayModel} end=${e.verdict.lifetimeEnd} hiHz=${e.verdict.highRefresh}`);
    if (e.decayNote) console.log(`     ${e.decayNote}`);
    if (e.hrNote) console.log(`     ${e.hrNote}`);
    if (e.flags.length) console.log(`     ⚠ ${e.flags.join(' | ')}`);
  }
  console.log(`  부활/구울: ${r.revive.verdict} · 동일객체=${r.revive.sameObjectRevive} 구울=${r.revive.newGhoul} · ${r.revive.newGhoulNote}`);
}

function main() {
  const args = process.argv.slice(2);
  let fail = 0;
  if (args.length) {
    for (const p of args) {
      let raw; try { raw = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.error(`READ-FAIL ${p}: ${e.message}`); fail++; continue; }
      printResult(p, gate(raw));
    }
    console.log('\n(실파일 모드: 분류 출력. exit는 판정 성격이 아니라 읽기 성공 기준)');
  } else {
    console.log('ANIM-HIGHHZ-LIFETIME-GATE — 내장 부정회귀 fixture 자가검사\n');
    for (const f of fixtures()) {
      const r = gate(f.raw);
      const okO = f.expectOverall.test(r.overall);
      const okD = f.expectDecay.test(r.decayModelSummary);
      const ok = okO && okD;
      if (!ok) fail++;
      console.log(`[${ok ? 'OK ' : 'XX '}] ${f.name}`);
      console.log(`      overall=${r.overall} (기대 ${f.expectOverall})`);
      console.log(`      decay=${r.decayModelSummary} (기대 ${f.expectDecay}) · 고주사율실측=${r.highRefreshActual} · 부활=${r.revive.verdict}`);
    }
  }
  console.log(`\n${fail === 0 ? 'ALL OK' : fail + ' FAIL'} (exit ${fail === 0 ? 0 : 1})`);
  process.exit(fail === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
