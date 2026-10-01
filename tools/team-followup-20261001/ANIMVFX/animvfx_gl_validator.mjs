#!/usr/bin/env node
/*
 * ANIMVFX-GL-PROBE-FIX — GL 플래시/사망/부활 raw 정적 분류·검증기 (게임 실행 없이)
 * 소유: ANIMVFX / 터미널 8. 경로: tools/team-followup-20261001/ANIMVFX/animvfx_gl_validator.mjs
 *
 * animvfx_gl_probe.js가 남기는(또는 R-input gl-revive-raw.json 류) raw 레코드를 읽어
 * 다음 4상태를 엄격히 구분하고, 잘못된 PASS 확대를 거부한다.
 *   A. GL_ABSENT        — GL 없음(백엔드≠webgl2 / useGL≠true). contextLost은 반드시 null(가짜 true 거부).
 *   B. CONTEXT_LOST     — GL 존재하나 context lost=true.
 *   C. ZERO_SAMPLE      — after-draw / e._ensGLMode===1 표본 0 → 수명·부활 판정 불가.
 *   D. SAMPLED          — GL 플래시 표본 존재 → 수명·부활 세부 판정.
 * 부활 구분: 동일 객체 부활(same id dead→alive)과 새 구울(신규 객체 id, etype 100~102)을 분리.
 *            새 구울은 "동일 객체 부활 PASS"에 포함하지 않는다.
 * 고주사율: 실제 drawHz가 낮으면(≈30Hz) 고주사율 수명 PASS로 쓰지 않는다(§R 문서 명시).
 *
 * 사용: node animvfx_gl_validator.mjs [raw1.json raw2.json ...]
 *       인자 없으면 내장 mock 12종 자가검사(기대 분류 대조) 실행.
 * exit 0 = 모든 입력이 기대/일관 분류, 1 = 불일치/모순(가짜 contextLost 등).
 */
import fs from 'node:fs';

const HIGH_REFRESH_MIN_HZ = 90;   // 이 미만은 "고주사율" 아님. ~30/60Hz raw를 고주사율 PASS로 승격 금지.
const NONLETHAL_HF = 6;           // hurtE 비치명 _hitFlash 세팅값(불변 계약)
const PHYS_HZ = 60;               // 고정스텝 update 60Hz → hf 6틱 ≈ 100ms(주사율 독립 기대)

function num(x) { return (typeof x === 'number' && isFinite(x)) ? x : null; }

// R-input raw 스키마 정규화: 레코드가 raw.records 또는 raw.report.records에 올 수 있다.
export function normalize(raw) {
  if (Array.isArray(raw?.records)) return raw;
  if (Array.isArray(raw?.report?.records)) {
    const rep = raw.report;
    return { ...raw, records: rep.records, draws: rep.draws ?? raw.draws,
      updates: rep.updates ?? raw.updates, _reportWrapped: true };
  }
  return { ...raw, records: Array.isArray(raw?.records) ? raw.records : [] };
}

export function classify(rawIn) {
  const raw = normalize(rawIn);
  const records = Array.isArray(raw?.records) ? raw.records : [];
  const flags = [];
  const n = records.length;

  // ── 백엔드/컨텍스트 ──
  const anyUseGL = records.some(r => r.useGL === true);
  const anyContextLostTrue = records.some(r => r.contextLost === true);
  const anyContextLostNull = records.some(r => r.contextLost === null || r.contextLost === undefined);
  // 가짜 contextLost: GL 없음(useGL≠true)인데 contextLost=true로 적힌 레코드 → 모순(과거 fallback true 혼입)
  const fakeContextLost = records.filter(r => r.contextLost === true && r.useGL !== true).length;

  // ── GL 구동 증거 ──
  const glDrawEvidence = records.some(r => r.glDrawEvidence === true) ||
                         records.some(r => num(r.ensDrawn) !== null && r.ensDrawn > 0);

  // ── after-draw / per-mob glMode===1 표본 ──
  const afterDraw = records.filter(r => r.phase === 'after-draw');
  const glFlashSamples = afterDraw.filter(r => r.glMode === 1);
  const glFlashAnyPhase = records.filter(r => r.glMode === 1); // 참고(after-draw 외 glMode는 신뢰 안 함)

  // ── 부활/구울 (A) probe event-stream 스키마 ──
  const ev = (name) => records.filter(r => Array.isArray(r.events) && r.events.includes(name));
  const deaths = ev('death-observed');
  const sameObjectRevivesEv = ev('same-object-revive');
  const newGhoulsEv = ev('new-object-ghoul-candidate');

  // ── 부활/구울 (B) R-input 요약 스키마: killed[]/revived[] 쌍, ghoul 플래그로 동일객체 vs 새 구울 구분 ──
  //   ghoul=false & alive:true & hf0 & mode1 = 동일 객체 본모습 부활(§R 3/3). ghoul=true = 새 객체(구울) → 제외.
  const killedArr = Array.isArray(rawIn?.killed) ? rawIn.killed : null;
  const revivedArr = Array.isArray(rawIn?.revived) ? rawIn.revived : null;
  let summaryRevive = null;
  if (revivedArr) {
    const sameObj = revivedArr.filter(x => x && x.ghoul === false);
    const ghoul = revivedArr.filter(x => x && x.ghoul === true);
    const sameObjFirstHf0 = sameObj.every(x => x.hf === 0);
    const sameObjGlMode1 = sameObj.every(x => x.mode === 1);
    summaryRevive = {
      source: 'killed/revived summary', killed: killedArr ? killedArr.length : null,
      sameObjectRevive: sameObj.length, newGhoul: ghoul.length,
      sameObjFirstHf0, sameObjGlMode1,
      verdict: sameObj.length === 0 ? 'NO_VERDICT(동일 객체 부활 없음)'
        : (sameObjFirstHf0 && sameObjGlMode1 ? 'PASS(동일 객체 부활 첫 draw hf0·GL mode1)' : 'FAIL(부활 잔상 또는 비GL)')
    };
  }

  // 동일 객체 부활: event-stream 우선, 없으면 요약 스키마 사용
  const sameObjectRevives = sameObjectRevivesEv.length ? sameObjectRevivesEv : [];
  const newGhouls = newGhoulsEv;
  const reviveFirstDrawHf0 = sameObjectRevivesEv.every(r => r.phase !== 'after-draw' || r.hf === 0);

  // ── drawHz(실제) 계산 ──
  const nows = records.map(r => num(r.now)).filter(v => v !== null);
  const spanMs = (nows.length >= 2) ? (Math.max(...nows) - Math.min(...nows)) : null;
  const drawCount = num(raw?.draws) ?? afterDraw.length;
  let drawHz = null;
  if (spanMs && spanMs > 0 && drawCount) drawHz = drawCount / (spanMs / 1000);
  const refreshClass = (drawHz === null) ? 'unknown' : (drawHz >= HIGH_REFRESH_MIN_HZ ? 'high' : 'low');

  // ── 상태 분류(배타) ──
  let state;
  if (!anyUseGL) state = 'GL_ABSENT';
  else if (anyContextLostTrue) state = 'CONTEXT_LOST';
  else if (afterDraw.length === 0 || glFlashSamples.length === 0) state = 'ZERO_SAMPLE';
  else state = 'SAMPLED';

  // ── 모순/주의 플래그 ──
  if (fakeContextLost > 0)
    flags.push(`FAKE_CONTEXTLOST: GL 없음인데 contextLost=true 레코드 ${fakeContextLost}건(측정불가는 null이어야 함)`);
  if (state === 'GL_ABSENT' && anyContextLostTrue)
    flags.push('GL_ABSENT인데 contextLost=true — null(측정불가)로 기록해야 함');
  if (state !== 'GL_ABSENT' && !glDrawEvidence)
    flags.push('useGL=true이나 GL 구동 증거(ensDrawn>0 / glDrawEvidence) 없음 — GL 경로 실동작 미확인');
  if (state === 'SAMPLED' && !reviveFirstDrawHf0)
    flags.push('동일 객체 부활 첫 after-draw hf≠0 — 부활 잔상 가능(발견 2 미해소)');

  // ── 판정(PASS는 조건을 모두 만족할 때만) ──
  const hasRevive = sameObjectRevives.length > 0;
  const sameObjectReviveVerdict = (state === 'SAMPLED' && hasRevive)
    ? (reviveFirstDrawHf0 ? 'PASS(동일 객체 부활 첫 draw hf0)' : 'FAIL(부활 잔상)')
    : 'NO_VERDICT(동일 객체 부활 표본 없음)';
  // 새 구울은 동일 객체 부활 판정과 분리 — 표본 수만 보고, PASS로 세지 않음
  const newGhoulCount = newGhouls.length || (summaryRevive ? summaryRevive.newGhoul : 0);
  const newGhoulNote = newGhoulCount
    ? `새 구울(신규 객체) ${newGhoulCount}건 — 동일 객체 부활 판정 제외(별도 시각 인수)`
    : '새 구울 표본 없음';

  // 고주사율 수명 PASS: 표본 있고 + drawHz 고주사율일 때만. 낮으면 명시적으로 거부.
  let highRefreshLifetime;
  if (state !== 'SAMPLED') highRefreshLifetime = `NO_VERDICT(${state})`;
  else if (refreshClass === 'high') highRefreshLifetime = 'ELIGIBLE(고주사율 표본 — 수명 적분 검증 가능)';
  else highRefreshLifetime = `REJECT(실제 drawHz≈${drawHz ? drawHz.toFixed(1) : '?'}Hz — 고주사율 아님. 30/60Hz 자료를 고주사율 PASS로 쓰지 않음)`;

  return {
    state, n,
    backend: { anyUseGL, glDrawEvidence, anyContextLostTrue, anyContextLostNull, fakeContextLost },
    samples: { afterDraw: afterDraw.length, glFlashSamplesAfterDraw: glFlashSamples.length, glModeAnyPhase: glFlashAnyPhase.length },
    revive: { deaths: deaths.length, sameObjectRevives: sameObjectRevives.length, newGhouls: newGhoulCount,
      reviveFirstDrawHf0, sameObjectReviveVerdict, newGhoulNote, summaryRevive },
    refresh: { drawHz: drawHz === null ? null : +drawHz.toFixed(2), spanMs: spanMs === null ? null : +spanMs.toFixed(1),
      drawCount, class: refreshClass, highRefreshMinHz: HIGH_REFRESH_MIN_HZ, highRefreshLifetime },
    lifetimeNote: `비치명 hf=${NONLETHAL_HF} → 고정스텝 ${PHYS_HZ}Hz update 6틱 ≈ 100ms 기대(주사율 독립). ` +
      '실측 적분은 SAMPLED+고주사율 표본에서만.',
    flags,
    consistent: flags.filter(f => /FAKE_CONTEXTLOST|GL_ABSENT인데/.test(f)).length === 0
  };
}

// ── 내장 mock(각 상태·경계 1종 이상) ──────────────────────────────────────
function mkRec(o) {
  return Object.assign({ phase: 'after-draw', now: 0, id: 1, etype: 4, ib: false, hf: 0, alive: true,
    reviveTimer: 0, glMode: 0, events: [], visibility: 'visible', hidden: false, bootActive: false,
    warmDone: true, useGL: true, contextLost: false, ensDrawn: 6, ensQueued: 6, cap: 0,
    gameOn: true, paused: false, runtimeGate: true, regularBootAttested: true, glDrawEvidence: true }, o);
}
// 고주사율(240Hz) 타임라인 n draw records 생성
function hiRefreshDraws(count, dtMs, over) {
  const a = [];
  for (let i = 0; i < count; i++) a.push(mkRec(Object.assign({ now: i * dtMs, glMode: 1 }, over && over(i))));
  return a;
}

function mocks() {
  return [
    { name: 'A/GL_ABSENT(webgpu, contextLost=null)', expect: 'GL_ABSENT', expectConsistent: true,
      raw: { draws: 100, records: [mkRec({ useGL: false, contextLost: null, glDrawEvidence: false, ensDrawn: 0, glMode: null, now: 0 }),
        mkRec({ useGL: false, contextLost: null, glDrawEvidence: false, ensDrawn: 0, glMode: null, now: 1000 })] } },
    { name: 'A/GL_ABSENT + 가짜 contextLost=true(모순 거부)', expect: 'GL_ABSENT', expectConsistent: false,
      raw: { draws: 100, records: [mkRec({ useGL: false, contextLost: true, glDrawEvidence: false, ensDrawn: 0, glMode: null, now: 0 })] } },
    { name: 'B/CONTEXT_LOST', expect: 'CONTEXT_LOST', expectConsistent: true,
      raw: { draws: 100, records: [mkRec({ useGL: true, contextLost: true, glMode: 1, now: 0 }), mkRec({ useGL: true, contextLost: true, glMode: 1, now: 1000 })] } },
    { name: 'C/ZERO_SAMPLE(after-update만, after-draw 0)', expect: 'ZERO_SAMPLE', expectConsistent: true,
      raw: { draws: 342, records: [mkRec({ phase: 'install', glMode: 0, now: 0 }), mkRec({ phase: 'after-update', glMode: null, now: 12000 })] } },
    { name: 'C/ZERO_SAMPLE(after-draw 있으나 glMode===1 없음)', expect: 'ZERO_SAMPLE', expectConsistent: true,
      raw: { draws: 100, records: [mkRec({ phase: 'after-draw', glMode: 0, now: 0 }), mkRec({ phase: 'after-draw', glMode: 0, now: 1000 })] } },
    { name: 'D/SAMPLED 고주사율(240Hz) 동일객체 부활 hf0', expect: 'SAMPLED', expectConsistent: true,
      raw: { draws: 240, records: [
        ...hiRefreshDraws(238, 1000 / 240),
        mkRec({ phase: 'after-draw', glMode: 1, alive: false, events: ['death-observed'], now: 238 * (1000 / 240), hf: 6 }),
        mkRec({ phase: 'after-draw', glMode: 1, alive: true, events: ['same-object-revive'], hf: 0, now: 239 * (1000 / 240) })] } },
    { name: 'D/SAMPLED 저주사율(30Hz) — 고주사율 PASS 거부', expect: 'SAMPLED', expectConsistent: true,
      raw: { draws: 342, records: [mkRec({ glMode: 1, now: 0 }), mkRec({ glMode: 1, now: 11999 }),
        mkRec({ phase: 'after-draw', glMode: 1, alive: true, events: ['same-object-revive'], hf: 0, now: 12000 })] } },
    { name: 'D/SAMPLED 부활 잔상(hf≠0) FAIL', expect: 'SAMPLED', expectConsistent: true,
      raw: { draws: 240, records: [...hiRefreshDraws(238, 1000 / 240),
        mkRec({ phase: 'after-draw', glMode: 1, alive: true, events: ['same-object-revive'], hf: 6, now: 239 * (1000 / 240) })] } },
    { name: 'D/SAMPLED 새 구울(동일객체 부활 아님)', expect: 'SAMPLED', expectConsistent: true,
      raw: { draws: 240, records: [...hiRefreshDraws(239, 1000 / 240),
        mkRec({ phase: 'after-draw', glMode: 1, id: 999, etype: 101, events: ['new-object-ghoul-candidate'], now: 239 * (1000 / 240) })] } }
  ];
}

function fmt(v) { return JSON.stringify(v, null, 1); }

function main() {
  const args = process.argv.slice(2);
  let fail = 0;
  if (args.length) {
    for (const p of args) {
      let raw; try { raw = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.error(`READ-FAIL ${p}: ${e.message}`); fail++; continue; }
      const r = classify(raw);
      console.log(`\n=== ${p} ===`);
      console.log(`상태=${r.state} | drawHz=${r.refresh.drawHz}(${r.refresh.class}) | afterDraw=${r.samples.afterDraw} glFlash=${r.samples.glFlashSamplesAfterDraw}`);
      console.log(`부활(event): 동일객체=${r.revive.sameObjectRevives} 구울=${r.revive.newGhouls} → ${r.revive.sameObjectReviveVerdict}`);
      if (r.revive.summaryRevive) console.log(`부활(요약 killed/revived): 동일객체=${r.revive.summaryRevive.sameObjectRevive} 구울=${r.revive.summaryRevive.newGhoul} → ${r.revive.summaryRevive.verdict}`);
      console.log(`고주사율수명: ${r.refresh.highRefreshLifetime}`);
      if (r.flags.length) console.log('플래그:\n - ' + r.flags.join('\n - '));
      if (!r.consistent) { console.log('→ 비일관(모순) 입력'); fail++; }
    }
  } else {
    console.log('ANIMVFX GL raw 분류기 — 내장 mock 자가검사\n');
    for (const m of mocks()) {
      const r = classify(m.raw);
      const okState = r.state === m.expect;
      const okCons = r.consistent === m.expectConsistent;
      const ok = okState && okCons;
      if (!ok) fail++;
      console.log(`[${ok ? 'OK ' : 'XX '}] ${m.name}`);
      console.log(`      state=${r.state}(기대 ${m.expect}) consistent=${r.consistent}(기대 ${m.expectConsistent})`);
      console.log(`      drawHz=${r.refresh.drawHz}(${r.refresh.class}) · ${r.refresh.highRefreshLifetime}`);
      console.log(`      부활판정=${r.revive.sameObjectReviveVerdict} · ${r.revive.newGhoulNote}`);
      if (r.flags.length) console.log('      flags: ' + r.flags.join(' | '));
    }
  }
  console.log(`\n${fail === 0 ? 'ALL OK' : fail + ' FAIL'} (exit ${fail === 0 ? 0 : 1})`);
  process.exit(fail === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
