#!/usr/bin/env node
// QA-B01-BASELINE-PREFLIGHT — raw 분류기 (read-only, 게임/서버 미실행)
//
// 두 가지를 "분리"해서 판정한다. 혼합하지 않는다.
//   1) diagnosticValid    : 진단 자료로서 구조가 유효한가 (조건 "기록"·버퍼·회수·지표 존재).
//                           구조 검사 성공일 뿐, 고정 조건 비교 자격이 아니다.
//   2) comparisonEligible : 같은 고정 조건 A/B 비교의 한 축으로 쓸 수 있는가.
//                           true / false / unknown 3분류. 미입증은 false 또는 unknown + 구체 사유.
//
// 경계(반드시 유지):
//   - 구조가 유효해도(diagnosticValid=true) 품질 자동변화·최종 옵션 부재·계측 조건(프로파일러/오버헤드)
//     미기록/불일치·대조 입력 미확인이면 comparisonEligible 은 true 가 될 수 없다.
//   - 옵션 스냅샷이 양끝에서 같다는 것만으로 "측정 내내 고정됐다"고 주장하지 않는다(CMP4 별도 요구).
//   - `trusted` 입력은 브라우저 신뢰 이벤트일 뿐 사람의 물리 입력/막타 피해원 증명이 아니다.
//   - fpsCap=0 은 무제한(캡 없음)일 뿐 GPU 완료·표시 FPS·매 루프 draw 를 증명하지 않는다.
//   - 이 도구는 PC329ms·과거 ring97ms 등 성능 문제 "해결"을 주장하지 않는다. 새 측정 release 없음.
//
// 지원 스키마(자동 감지):
//   - combat-timeline  : window.loops + metrics.loopStartIntervals + restored/dropped
//   - normal-first-kill: window.firstKill + probeMeta + metrics.worldInputToStop
//
// 사용:
//   node baseline_raw_validator.mjs [<summary.json> ...] [--mode=diagnostic|comparison] [--json]
//   인수 없으면 기존 실제 raw 2건 검사.
// 종료 코드:
//   --mode=diagnostic (기본): 전부 diagnosticValid 이면 0, 하나라도 구조 실패면 1, 입력/파싱 오류 2.
//   --mode=comparison       : 전부 comparisonEligible==='true' 이면 0, 아니면(false/unknown 포함) 1, 오류 2.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dir, '..', '..', '..');

const DEFAULT_RAWS = [
  'docs/0마스터플랜/mac-resume-20261001/combat-timeline-evidence/summary.json',
  'docs/0마스터플랜/mac-resume-20261001/normal-first-kill-evidence/summary.json',
];

const QUALITY_KEYS = [
  'atmos', 'quality', 'resScale', 'ssaa', 'parts',
  'bloom', 'lighting', 'postfx', 'fog', 'grain', 'torch', 'fpsCap',
];
const REQUIRED_OPT_KEYS = ['quality', 'resScale', 'ssaa', 'fpsCap', 'parts', 'diff', 'atmos'];

const BOUNDARIES = [
  "diagnosticValid=true 는 진단 자료 구조 검사 성공일 뿐 고정 조건 비교 자격이 아니다.",
  "단일 raw CLI는 실제 대응 쌍·연속 옵션 이력을 검증하지 않으므로 comparisonEligible=true 를 출력하지 않는다. 미입증은 unknown/false 이다.",
  "옵션 양끝 동일이나 seed/maxload/expectsha/variant 기록은 대조 검증을 대신하지 않는다. CMP4는 항상 unknown이다.",
  "trusted 입력 = 브라우저 신뢰 이벤트. 사람의 물리 입력/막타 피해원 증명이 아니다.",
  "fpsCap=0 = 캡 없음. GPU 완료·표시 FPS·매 루프 draw 를 증명하지 않는다. drawHz 는 관측된 draw 시작 간격 기반 값이다.",
  "이 분류기는 PC329ms·ring97ms 등 성능 '해결'을 주장하지 않는다. 새 측정 release 없음.",
];

const num = (v) => typeof v === 'number' && Number.isFinite(v);
const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);

function detectSchema(d) {
  if (d && d.window && (num(d.window.loops) || d.metrics?.loopStartIntervals)) return 'combat-timeline';
  if (d && (d.firstKill || d.window?.firstKill != null) && d.probeMeta) return 'normal-first-kill';
  return 'unknown';
}

function optionSnapshots(d, schema) {
  if (schema === 'combat-timeline') return { install: d.options || null, final: d.finalOptions || null, caveat: null };
  if (schema === 'normal-first-kill') return { install: d.environment?.options || null, final: d.laterOptions || null, caveat: d.optionCaveat || null };
  return { install: null, final: null, caveat: null };
}
function conditionSnap(d, schema) {
  if (schema === 'combat-timeline') return d.initial || d.end || null;
  if (schema === 'normal-first-kill') return d.firstKill || null;
  return null;
}

// 대조 비교 메타(고정 조건 입력)가 raw 에 기록돼 있는가
function controlledMeta(d) {
  const env = d.environment || {};
  const c = d.controls || d.plan || {};
  const seed = env.seed ?? c.seed;
  const maxload = env.maxload ?? c.maxload;
  const expectSha = env.expectSha ?? env.gameHtmlSha256 ?? c.expectSha ?? c.gameSHA;
  const variant = env.variant ?? c.variant;
  const present = [seed, maxload, expectSha, variant].filter((v) => v !== undefined && v !== null).length;
  return { seed, maxload, expectSha, variant, present };
}
// 계측 오버헤드 조건(프로파일러 등)이 raw 에 기록돼 있는가 / 켜져 있었는가
function instrumentation(d) {
  const env = d.environment || {};
  const profileBlock = d.profile != null && typeof d.profile === 'object';
  const conflict = env.profiler === false && profileBlock;
  if (profileBlock || env.profiler === true) return {
    state: 'false', detail: conflict ? 'profiler=false와 profile 블록 상충 — off 미입증' : 'CPU profiler on 또는 profile 블록 존재 — 오버헤드',
  };
  if (d.profile != null) return { state: 'unknown', detail: 'profile 블록 오타입 — 계측 상태 미확인' };
  if (env.profiler === false) return { state: 'true', detail: 'CPU profiler=false 명시 기록(실제 실행 이력 입증은 별도). gpuTiming은 독립 항목' };
  return { state: 'unknown', detail: env.profiler === undefined ? 'CPU profiler 상태 미기록 — gpuTiming으로 대체 불가' : 'CPU profiler 오타입 — boolean false/on 기록 아님' };
}

function check(id, label, severity, ok, detail) { return { id, label, severity, ok: !!ok, detail }; }
function gate(id, label, state, detail) { return { id, label, state, detail }; } // state: 'true'|'false'|'unknown'

// ── 구조(진단) 검사 → diagnosticValid ──────────────────────────────
function structuralChecks(d, schema) {
  const checks = [];
  const env = d.environment || {};
  const opt = optionSnapshots(d, schema);
  const snap = conditionSnap(d, schema) || {};

  // A. 조건 기록
  const url = env.url || '';
  checks.push(check('A1-url-webgpu0', '조건기록: URL webgpu=0 (정규 GL)', 'required',
    typeof url === 'string' && /webgpu=0/.test(url), url || '(url 없음)'));
  checks.push(check('A2-canvas-dpr-viewport', '조건기록: canvas/viewport/dpr', 'required',
    Array.isArray(env.canvas) && env.canvas.length === 2 && env.canvas.every(num)
      && num(env.dpr) && Array.isArray(env.viewport) && env.viewport.length === 2,
    `canvas=${JSON.stringify(env.canvas)} dpr=${env.dpr} viewport=${JSON.stringify(env.viewport)}`));
  const missingOpt = REQUIRED_OPT_KEYS.filter((k) => opt.install == null || opt.install[k] === undefined);
  checks.push(check('A3-options-present', '조건기록: 필수 옵션 키', 'required',
    opt.install != null && missingOpt.length === 0,
    opt.install == null ? '옵션 스냅샷 없음' : (missingOpt.length ? `누락: ${missingOpt.join(',')}` : '전부 존재')));
  checks.push(check('A4-fpscap-recorded', '조건기록: fpsCap 값 (0=캡없음; GPU/표시FPS 증명 아님)', 'required',
    opt.install != null && opt.install.fpsCap !== undefined, `fpsCap=${opt.install?.fpsCap}`));
  const hasFocus = snap.focus === true || snap.on === true;
  checks.push(check('A5-focus-not-hidden', '조건기록: 표본 focus=true & hidden!=true', 'required',
    hasFocus && snap.hidden !== true, `focus=${snap.focus} on=${snap.on} hidden=${snap.hidden}`));
  checks.push(check('A6-ua', '조건기록: UA', 'warn',
    typeof env.ua === 'string' && env.ua.length > 0, env.ua ? env.ua.slice(0, 40) + '…' : '없음'));

  // B. 기준 식별
  if (schema === 'normal-first-kill') {
    const w = d.window || {};
    checks.push(check('B1-firstkill-time', '기준: firstKill > 창 시작', 'required',
      num(w.firstKill) && num(w.start) && w.firstKill > w.start, `firstKill=${w.firstKill} start=${w.start}`));
    checks.push(check('B2-kill-recorded', '기준: 첫 처치 기록(막타 피해원 증명 아님)', 'required',
      (d.firstKill?.kills >= 1) && (d.finalKillCount >= 1), `kills=${d.firstKill?.kills} final=${d.finalKillCount}`));
    checks.push(check('B3-gl-true', '기준: 처치 시점 GL 활성', 'required', d.firstKill?.gl === true, `gl=${d.firstKill?.gl}`));
    checks.push(check('B4-window-def', '기준: 창 정의 명시', 'warn',
      typeof w.definition === 'string' && w.definition.length > 10, w.definition ? '있음' : '없음'));
    checks.push(check('B5-input-proof', '기준: 신뢰 입력 이벤트 ≥1 (사람 물리입력 증명 아님)', 'required',
      Array.isArray(d.inputProof) && d.inputProof.some((e) => e.trusted === true),
      `n=${d.inputProof?.length} trusted=${d.inputProof?.some((e) => e.trusted === true)}`));
  } else if (schema === 'combat-timeline') {
    const w = d.window || {};
    const enemies = d.end?.enemies ?? d.initial?.enemies;
    checks.push(check('B1-reason', '기준: 종료 사유', 'required', typeof w.reason === 'string' && w.reason.length > 0, w.reason || '없음'));
    checks.push(check('B2-kills-delta', '기준: 처치 수(initial→end)', 'required',
      num(d.initial?.kills) && num(d.end?.kills), `initial=${d.initial?.kills} end=${d.end?.kills}`));
    checks.push(check('B3-enemy-count', '기준: 전투 적 수(밀집)', 'required', num(enemies), `enemies=${enemies}`));
    checks.push(check('B4-events', '기준: kills/items 이벤트', 'warn',
      Array.isArray(d.events) && d.events.some((e) => e.kind === 'kills'), `events=${d.events?.length}`));
  }

  // C. 포화 / 회수
  let dropped, truncated;
  if (schema === 'normal-first-kill') { dropped = d.probeMeta?.droppedCount; truncated = d.probeMeta?.truncated; }
  else { dropped = d.dropped; truncated = d.truncated; }
  checks.push(check('C1-no-saturation', '포화: 버퍼 미포화(dropped=0,truncated!=true)', 'required',
    (dropped === 0 || dropped === undefined) && truncated !== true, `dropped=${dropped} truncated=${truncated}`));
  if (schema === 'combat-timeline') {
    const r = d.restored || {};
    checks.push(check('C2-restored', '회수: loop/update/draw 복구', 'required',
      r.loop === true && r.update === true && r.draw === true, JSON.stringify(r)));
  } else {
    checks.push(check('C2-restored', '회수: 프로브 정지 & endedAt', 'required',
      d.probeMeta?.stopped === true && num(d.probeMeta?.endedAt), `stopped=${d.probeMeta?.stopped} endedAt=${d.probeMeta?.endedAt}`));
    const miss = d.probeMeta?.missing || [];
    checks.push(check('C3-wrap-missing', '회수: wrap 누락 라벨', 'warn',
      Array.isArray(miss) && miss.length === 0, miss.length ? `미포착: ${miss.join(',')}` : '없음'));
  }

  // D. 생존 / 실제 drawHz
  const durationMs = get(d, 'window.duration') ?? get(d, 'window.durationMs');
  checks.push(check('D1-duration', '생존: 창 지속시간 >0', 'required', num(durationMs) && durationMs > 0, `duration=${durationMs}ms`));
  let drawDt, drawRate;
  if (schema === 'combat-timeline') { drawDt = d.metrics?.drawStartIntervals || d.metrics?.rAFtimestampIntervals; drawRate = get(d, 'window.rateDraw'); }
  else { drawDt = get(d, 'metrics.worldInputToStop.draw_dt') || get(d, 'metrics.wholeObserver.draw_dt'); drawRate = drawDt && num(drawDt.n) && num(durationMs) ? (drawDt.n / (durationMs / 1000)) : null; }
  const hasTail = drawDt && num(drawDt.p95) && num(drawDt.p99) && num(drawDt.max);
  checks.push(check('D2-draw-interval-tail', '생존: draw 간격 p95/p99/max', 'required',
    !!hasTail, drawDt ? `mean=${drawDt.mean?.toFixed?.(1)} p95=${drawDt.p95} p99=${drawDt.p99} max=${drawDt.max}` : '없음'));
  const n = drawDt?.n;
  checks.push(check('D3-drawhz', '생존: 관측 drawHz 산출 & n≥30 (GPU/표시 FPS 아님)', 'required',
    num(drawRate) && drawRate > 0 && num(n) && n >= 30, `drawHz≈${num(drawRate) ? drawRate.toFixed(1) : '?'} n=${n}`));

  return checks;
}

// ── 비교 적격 게이트 → comparisonEligible (true/false/unknown) ──────
function comparisonGates(d, schema, diagnosticValid) {
  const gates = [];
  const opt = optionSnapshots(d, schema);
  const instr = instrumentation(d);
  const cm = controlledMeta(d);

  // 구조가 무효면 비교 자격도 없다
  if (!diagnosticValid) {
    gates.push(gate('CMP0-diagnostic', '선행: 구조(diagnostic) 유효', 'false', 'diagnosticValid=false'));
  } else {
    gates.push(gate('CMP0-diagnostic', '선행: 구조(diagnostic) 유효', 'true', 'diagnosticValid=true'));
  }

  // CMP1 품질 자동변화 없음 (양끝 비교)
  let qDiff = [];
  if (opt.install && opt.final) for (const k of QUALITY_KEYS) if (opt.install[k] !== opt.final[k]) qDiff.push(`${k}:${opt.install[k]}→${opt.final[k]}`);
  if (!opt.final) gates.push(gate('CMP1-quality-stable', '품질: 양끝 불변', 'unknown', '최종 옵션 없음 — 불변 미입증'));
  else if (qDiff.length) gates.push(gate('CMP1-quality-stable', '품질: 양끝 불변', 'false', `자동변화: ${qDiff.join(', ')}`));
  else gates.push(gate('CMP1-quality-stable', '품질: 양끝 불변', 'true', '설치==최종 (단, 내내 고정은 CMP4로 확인)'));

  // CMP2 최종 옵션 스냅샷 존재
  gates.push(gate('CMP2-final-options', '품질: 최종 옵션 스냅샷', opt.final ? 'true' : 'unknown',
    opt.final ? '있음' : '없음 — 고정 미입증'));

  // CMP3 계측 조건(프로파일러/오버헤드) 기록 & OFF
  gates.push(gate('CMP3-instrumentation', '계측: CPU 프로파일러 기록', instr.state, instr.detail));

  // CMP4: 문자열/숫자 메타데이터 존재는 대조 표본과 연속 옵션 이력의 검증이 아니다.
  // 이 CLI는 파일들을 각각 검사할 뿐 실제 A/B 대응 관계를 검사하지 않는다.
  gates.push(gate('CMP4-controlled-meta', '대조: 실제 대응 쌍·연속 조건 검증', 'unknown',
    `메타 기록 ${cm.present}/4. 단일 raw 검사: 실제 대응 쌍·측정 내내 조건 불변 미검증`));

  // 종합: false 하나라도 → false; 아니면 unknown 하나라도 → unknown; 전부 true → true
  let verdict = 'true';
  if (gates.some((g) => g.state === 'false')) verdict = 'false';
  else if (gates.some((g) => g.state === 'unknown')) verdict = 'unknown';
  const reasons = gates.filter((g) => g.state !== 'true').map((g) => `${g.id}:${g.state}(${g.detail})`);
  return { gates, verdict, reasons };
}

function validate(d, schema) {
  const checks = structuralChecks(d, schema);
  const required = checks.filter((c) => c.severity === 'required');
  const reqFail = required.filter((c) => !c.ok);
  const diagnosticValid = reqFail.length === 0;
  const cmp = comparisonGates(d, schema, diagnosticValid);
  return {
    schema,
    diagnosticValid,
    valid: diagnosticValid, // 하위호환 별칭 (진단 전용; 비교 적격 아님)
    validAliasNote: "valid 는 diagnosticValid 의 별칭 — 진단 전용, 비교 적격(comparisonEligible)과 무관",
    comparisonEligible: cmp.verdict,
    comparisonReasons: cmp.reasons,
    counts: { required: required.length, requiredFail: reqFail.length, warnings: checks.filter((c) => c.severity === 'warn' && !c.ok).length },
    structuralChecks: checks,
    comparisonGates: cmp.gates,
    boundaries: BOUNDARIES,
  };
}

function validateFile(p) {
  const abs = resolve(p.startsWith('/') ? p : resolve(REPO, p));
  if (!existsSync(abs)) return { file: p, error: '파일 없음', diagnosticValid: false, comparisonEligible: 'false', _missing: true };
  let d;
  try { d = JSON.parse(readFileSync(abs, 'utf8')); } catch (e) { return { file: p, error: 'JSON 파싱 실패: ' + e.message, diagnosticValid: false, comparisonEligible: 'false' }; }
  const schema = detectSchema(d);
  if (schema === 'unknown') return { file: p, error: '알 수 없는 스키마', diagnosticValid: false, comparisonEligible: 'false', schema };
  const fm = d._fixtureMeta ? { fixtureMeta: d._fixtureMeta } : {};
  return { file: p, ...fm, ...validate(d, schema) };
}

function printReport(r, mode) {
  if (r.error) { console.log(`\n■ ${r.file}\n  ✗ ${r.error}`); return; }
  console.log(`\n■ ${r.file}  [${r.schema}]`);
  if (r.fixtureMeta) console.log(`    ※ 합성 fixture(테스트용): ${r.fixtureMeta.purpose || ''} target=${r.fixtureMeta.targetGate || r.fixtureMeta.targetCheck || ''}`);
  console.log(`    diagnosticValid = ${r.diagnosticValid}   comparisonEligible = ${r.comparisonEligible.toUpperCase()}`);
  const mark = (c) => (c.ok ? '  OK ' : c.severity === 'required' ? 'FAIL ' : 'WARN ');
  console.log('    [구조/진단]');
  for (const c of r.structuralChecks) console.log(`      ${mark(c)}${c.id.padEnd(24)} ${c.label}  — ${c.detail}`);
  console.log('    [비교 적격 게이트]');
  const gm = (g) => (g.state === 'true' ? '  OK ' : g.state === 'false' ? 'FAIL ' : ' ??? ');
  for (const g of r.comparisonGates) console.log(`      ${gm(g)}${g.id.padEnd(24)} ${g.label}  — ${g.detail}`);
  if (r.comparisonEligible !== 'true') console.log(`    → 비교 부적격 사유: ${r.comparisonReasons.join(' | ')}`);
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const modeArg = (args.find((a) => a.startsWith('--mode=')) || '--mode=diagnostic').split('=')[1];
if (!['diagnostic', 'comparison'].includes(modeArg)) { console.error('알 수 없는 --mode: ' + modeArg); process.exit(2); }
const mode = modeArg;
const files = args.filter((a) => !a.startsWith('--'));
const targets = files.length ? files : DEFAULT_RAWS;
const results = targets.map(validateFile);

if (asJson) {
  console.log(JSON.stringify({ at: new Date().toISOString(), mode, boundaries: BOUNDARIES, results }, null, 2));
} else {
  console.log(`QA-B01 baseline raw 분류기 — mode=${mode} (read-only, 게임 미실행)`);
  console.log('경계: ' + BOUNDARIES.join(' / '));
  for (const r of results) printReport(r, mode);
  if (mode === 'diagnostic') {
    const bad = results.filter((r) => !r.diagnosticValid);
    console.log(`\n[diagnostic] ${results.length}건 중 구조유효 ${results.length - bad.length}, 무효 ${bad.length}`);
  } else {
    const elig = results.filter((r) => r.comparisonEligible === 'true');
    const unk = results.filter((r) => r.comparisonEligible === 'unknown');
    console.log(`\n[comparison] ${results.length}건 중 적격 ${elig.length}, unknown ${unk.length}, 부적격 ${results.length - elig.length - unk.length}`);
  }
}

const parseErr = results.some((r) => r._missing || (r.error && /파싱|스키마/.test(r.error)));
let exit;
if (parseErr) exit = 2;
else if (mode === 'comparison') exit = results.every((r) => r.comparisonEligible === 'true') ? 0 : 1;
else exit = results.every((r) => r.diagnosticValid) ? 0 : 1;
process.exit(exit);
