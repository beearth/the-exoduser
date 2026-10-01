#!/usr/bin/env node
/*
 * sparse-clock-integration.mjs — 누락/비정상 카운터 반례 RED→GREEN 검수 하니스
 * 소유: ANIMVFX / 터미널 8. 과제 ANIMVFX-20261002-SPARSE-CLOCK-INTEGRATION.
 *
 * root 반례(outputs/team-review-20261001/five-owner-acceptance/counterexamples-before.json):
 *   ANIM-missing-middle-draw-record / ANIM-missing-draw-counter
 *   → 중간/전체 draws 누락 시 dD=null을 '진행 없음(0)'으로 오인 → 오PASS(고주사율 오인증).
 *
 * 이 하니스는:
 *   (RED)  통합 전 버그 로직(classifyBefore, dD=null→draw 미진행 취급)이 반례를 오PASS 하는지 재현.
 *   (GREEN) canonical gate(animvfx_highhz_lifetime_gate.mjs, 통합본)가 REJECT/UNKNOWN 으로 바로잡는지 확인.
 *   + canonical 작은 회귀(핵심 fixture) + (인자로 주면) 실 raw 3종.
 *
 * 사용: node sparse-clock-integration.mjs [gl-revive-valid.json gl-revive-60.json gl-revive-raw.json]
 * exit 0 = 모든 RED 재현 + GREEN 수정 + 회귀 일치, 1 = 불일치.
 * ★ 게임/브라우저/서버/빌드 0. 읽기+Node 작은 검사만. canonical 외 원본·공유·타팀 미접촉.
 */
import fs from 'node:fs';
import { gate as canonicalGate, classifyDecaySparse, extractEpisodesIntervals } from './animvfx_highhz_lifetime_gate.mjs';

const TOL = 1e-6;

// ── 통합 전(버그) 분류: 끝점 미상 dD=null 을 '진행 없음'으로 오인 (root가 보류시킨 patch 로직 재현) ──
function classifyBefore(ep) {
  const decs = (ep.intervals || []).filter(iv => iv.dHf > TOL && !iv.atDeath);
  let updateOnly = 0, drawOnly = 0, both = 0, noCounter = 0;
  for (const iv of decs) {
    const uPos = iv.dU != null && iv.dU > 0, dPos = iv.dD != null && iv.dD > 0;  // null→false(=0처럼 취급, 버그)
    if (uPos && !dPos) updateOnly++;
    else if (dPos && !uPos) drawOnly++;
    else if (uPos && dPos) both++;
    else noCounter++;
  }
  if (decs.length === 0) return 'UNKNOWN';
  if (noCounter > 0) return 'REJECT';
  if (updateOnly > 0 && drawOnly > 0) return 'FAIL';
  if (updateOnly > 0) return 'PASS';           // ← dD=null 구간이 여기로 새서 오PASS
  if (drawOnly > 0) return 'FAIL';
  return 'UNKNOWN';
}

const RAW = {
  'ANIM-missing-middle-draw-record': { records: [
    { id: 1, hf: 3, updates: 10, draws: 0, now: 0, events: ['flash-start-observed'] },
    { id: 1, hf: 2, updates: 11, now: 5 },                     // draws 누락
    { id: 1, hf: 1, updates: 12, draws: 2, now: 10 },
    { id: 1, hf: 0, updates: 13, draws: 3, now: 15, events: ['flash-zero-observed'] }
  ] },
  'ANIM-missing-draw-counter': { records: [
    { id: 1, hf: 3, updates: 10, now: 0, events: ['flash-start-observed'] },
    { id: 1, hf: 2, updates: 11, now: 5 },
    { id: 1, hf: 1, updates: 12, now: 10 },
    { id: 1, hf: 0, updates: 13, now: 15, events: ['flash-zero-observed'] }
  ] }
};

function redGreen() {
  let fail = 0;
  console.log('── 반례 RED(통합 전 버그) → GREEN(canonical 통합본) ──');
  for (const [id, raw] of Object.entries(RAW)) {
    // RED: 버그 분류가 에피소드 구간에서 PASS(오판)로 새는지
    const eps = extractEpisodesIntervals(raw.records);
    const redVerdicts = eps.map(classifyBefore);
    const redPass = redVerdicts.includes('PASS');
    // GREEN: canonical 통합본 overall
    const green = canonicalGate(raw).overall;
    const greenFixed = /REJECT|UNKNOWN/.test(green) && !/PASS\(/.test(green);
    const ok = redPass && greenFixed;
    if (!ok) fail++;
    console.log(`[${ok ? 'OK ' : 'XX '}] ${id}`);
    console.log(`      RED(버그 classifyBefore)=${redVerdicts.join(',')} (오PASS 재현 ${redPass ? '✓' : '✗'})`);
    console.log(`      GREEN(canonical)=${green} (수정 ${greenFixed ? '✓' : '✗'})`);
  }
  // 직접 단위: {dHf:1,dU:1,dD:null}
  const unit = classifyDecaySparse({ intervals: [{ dHf: 1, dU: 1, dD: null, atDeath: false }] }).verdict;
  const unitBefore = classifyBefore({ intervals: [{ dHf: 1, dU: 1, dD: null, atDeath: false }] });
  const unitOk = unitBefore === 'PASS' && unit === 'UNKNOWN';
  if (!unitOk) fail++;
  console.log(`[${unitOk ? 'OK ' : 'XX '}] 단위 {dHf:1,dU:1,dD:null}: before=${unitBefore}(오PASS) → canonical=${unit}(UNKNOWN)`);
  return fail;
}

function regression() {
  let fail = 0;
  console.log('\n── canonical 작은 회귀 ──');
  const rec = (o) => Object.assign({ hf: 0, id: 7, updates: 0, draws: 0, now: 0, events: [], visibility: 'visible', hidden: false, paused: false, gameOn: true, runtimeGate: true }, o);
  // update-only(고주사율 after-update) → PASS, draw-only(240fps) → FAIL
  const up240 = []; { let u = 10, d = 5, now = 0, hf = 6; up240.push(rec({ hf, updates: u, draws: d, now, events: ['flash-start-observed'] })); for (; hf > 0;) { u++; now += 1000 / 60; hf--; up240.push(rec({ phase: 'after-update', hf, updates: u, draws: d, now, events: hf === 0 ? ['flash-zero-observed'] : ['flash-decrease'] })); for (let k = 0; k < 4; k++) { d++; up240.push(rec({ phase: 'after-draw', hf, updates: u, draws: d, now })); } } }
  const dd240 = []; { let u = 10, d = 5, now = 0, hf = 6, t = 0, nd = 0.25; dd240.push(rec({ hf, updates: u, draws: d, now, events: ['flash-start-observed'] })); while (hf > 0) { u++; t++; now += 1000 / 60; while (t >= nd - 1e-9 && hf > 0) { d++; nd += 0.25; hf--; dd240.push(rec({ phase: 'after-draw', hf, updates: u, draws: d, now, events: hf === 0 ? ['flash-zero-observed'] : ['flash-decrease'] })); } } }
  const cases = [
    ['update-only 240fps → PASS(고주사율)', { records: up240 }, /PASS\(고주사율/],
    ['draw-only 240fps → FAIL', { records: dd240 }, /FAIL/]
  ];
  for (const [name, raw, exp] of cases) {
    const r = canonicalGate(raw).overall; const ok = exp.test(r); if (!ok) fail++;
    console.log(`[${ok ? 'OK ' : 'XX '}] ${name} → ${r}`);
  }
  return fail;
}

function realRaws(paths) {
  if (!paths.length) { console.log('\n── 실 raw: 인자 미지정(별도 실행). canonical gate로 분류 가능 ──'); return 0; }
  let fail = 0;
  console.log('\n── 실 raw 3종 (canonical) ──');
  for (const p of paths) {
    let raw; try { raw = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.log(`[XX ] READ-FAIL ${p}: ${e.message}`); fail++; continue; }
    const r = canonicalGate(raw);
    // 실 raw는 완전한 카운터라 REJECT가 아니어야 하고, 고주사율 미측정 UNKNOWN(또는 에피소드0)이어야 한다(오PASS 금지)
    const ok = !/^REJECT/.test(r.overall) && !/PASS\(고주사율/.test(r.overall);
    if (!ok) fail++;
    console.log(`[${ok ? 'OK ' : 'XX '}] ${p.split('/').pop()} → ${r.overall} · 부활=${r.revive.verdict}`);
  }
  return fail;
}

function main() {
  console.log('sparse-clock-integration — 반례 RED→GREEN·회귀·실raw\n');
  let fail = 0;
  fail += redGreen();
  fail += regression();
  fail += realRaws(process.argv.slice(2));
  console.log(`\n${fail === 0 ? 'ALL OK' : fail + ' FAIL'} (exit ${fail === 0 ? 0 : 1})`);
  process.exit(fail === 0 ? 0 : 1);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
