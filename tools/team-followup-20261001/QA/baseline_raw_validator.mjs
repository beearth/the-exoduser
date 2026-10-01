#!/usr/bin/env node
// QA-B01-BASELINE-PREFLIGHT — raw 유효성 검증기 (read-only, 게임/서버 미실행)
//
// 목적: 첫 처치/밀집 전투 성능 기준점 raw(summary.json)가 "유효한 기준점"으로 쓸 수
//       있는지 구조·조건 고정·포화/회수·생존/실제 drawHz·품질 자동변화 항목으로 판정한다.
//       새 실측을 수행하지 않고 기존 raw만 검사한다(QA-task 소유 범위).
//
// 지원 스키마(자동 감지):
//   - combat-timeline : window.loops + metrics.loopStartIntervals + restored/dropped
//                       (밀집/생존 기준, 자연사까지 이어지는 전투)
//   - normal-first-kill: window.firstKill + firstKill + probeMeta + metrics.worldInputToStop
//                       (첫 처치 기준, 수동 입력→첫 kill 창)
//
// 사용:
//   node baseline_raw_validator.mjs <summary.json> [<summary.json> ...]
//   node baseline_raw_validator.mjs            # 인수 없으면 기본 실제 raw 2건 검증
//   --json   결과를 JSON으로 출력
//
// 종료 코드: 전부 유효 0, 하나라도 required 실패 1, 파싱/입력 오류 2.
// "유효"는 구조·조건 기록이 기준점 자격을 갖춘다는 뜻이며, 성능 개선/완료를 뜻하지 않는다.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dir, '..', '..', '..');

// 기본으로 검증할 기존 실제 raw (저장소 상대 경로)
const DEFAULT_RAWS = [
  'docs/0마스터플랜/mac-resume-20261001/combat-timeline-evidence/summary.json',
  'docs/0마스터플랜/mac-resume-20261001/normal-first-kill-evidence/summary.json',
];

// 품질에 영향을 주는 옵션 키 — 두 스냅샷 간 달라지면 "품질 자동변화" 후보
const QUALITY_KEYS = [
  'atmos', 'quality', 'resScale', 'ssaa', 'parts',
  'bloom', 'lighting', 'postfx', 'fog', 'grain', 'torch', 'fpsCap',
];
// 조건 고정으로 raw가 반드시 담아야 하는 옵션 키
const REQUIRED_OPT_KEYS = ['quality', 'resScale', 'ssaa', 'fpsCap', 'parts', 'diff', 'atmos'];

const num = (v) => typeof v === 'number' && Number.isFinite(v);
const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);

function detectSchema(d) {
  if (d && d.window && (num(d.window.loops) || d.metrics?.loopStartIntervals)) return 'combat-timeline';
  if (d && (d.firstKill || d.window?.firstKill != null) && d.probeMeta) return 'normal-first-kill';
  return 'unknown';
}

// 옵션 스냅샷 묶기 (스키마별 위치가 다름)
function optionSnapshots(d, schema) {
  if (schema === 'combat-timeline') {
    return { install: d.options || null, final: d.finalOptions || null, caveat: null };
  }
  if (schema === 'normal-first-kill') {
    return { install: d.environment?.options || null, final: d.laterOptions || null, caveat: d.optionCaveat || null };
  }
  return { install: null, final: null, caveat: null };
}

// 조건 스냅샷 (focus/hidden/gl 등을 담은 대표 지점)
function conditionSnap(d, schema) {
  if (schema === 'combat-timeline') return d.initial || d.end || null;
  if (schema === 'normal-first-kill') return d.firstKill || null;
  return null;
}

function check(id, label, severity, ok, detail) {
  return { id, label, severity, ok: !!ok, detail };
}

function validate(d, schema) {
  const checks = [];
  const env = d.environment || {};
  const opt = optionSnapshots(d, schema);
  const snap = conditionSnap(d, schema) || {};

  // ── A. 조건 고정 ──────────────────────────────────────────────
  const url = env.url || '';
  checks.push(check('A1-url-webgpu0', '조건: URL에 webgpu=0 (정규 GL 경로)', 'required',
    typeof url === 'string' && /webgpu=0/.test(url), url || '(url 없음)'));
  checks.push(check('A2-canvas-dpr-viewport', '조건: canvas/viewport/dpr 기록', 'required',
    Array.isArray(env.canvas) && env.canvas.length === 2 && env.canvas.every(num)
      && num(env.dpr) && Array.isArray(env.viewport) && env.viewport.length === 2,
    `canvas=${JSON.stringify(env.canvas)} dpr=${env.dpr} viewport=${JSON.stringify(env.viewport)}`));
  const missingOpt = REQUIRED_OPT_KEYS.filter((k) => opt.install == null || opt.install[k] === undefined);
  checks.push(check('A3-options-present', '조건: 필수 옵션 키 기록', 'required',
    opt.install != null && missingOpt.length === 0,
    opt.install == null ? '옵션 스냅샷 없음' : (missingOpt.length ? `누락: ${missingOpt.join(',')}` : '전부 존재')));
  const fpsCap = opt.install?.fpsCap;
  checks.push(check('A4-fpscap-0', '조건: fpsCap=0 (무제한 → draw 간격=프레임 간격)', 'required',
    fpsCap === 0, `fpsCap=${fpsCap}`));
  const hasFocus = snap.focus === true || snap.on === true;
  checks.push(check('A5-focus-not-hidden', '조건: 표본 지점 focus=true & hidden=false', 'required',
    hasFocus && snap.hidden !== true, `focus=${snap.focus} on=${snap.on} hidden=${snap.hidden}`));
  checks.push(check('A6-ua', '조건: UA(브라우저/OS) 기록', 'warn',
    typeof env.ua === 'string' && env.ua.length > 0, env.ua ? env.ua.slice(0, 48) + '…' : '없음'));

  // ── B. 첫 처치 / 밀집 기준 ────────────────────────────────────
  if (schema === 'normal-first-kill') {
    const w = d.window || {};
    const fkAt = w.firstKill, start = w.start;
    checks.push(check('B1-firstkill-time', '기준: firstKill 시각 > 창 시작', 'required',
      num(fkAt) && num(start) && fkAt > start, `firstKill=${fkAt} start=${start}`));
    checks.push(check('B2-kill-recorded', '기준: 첫 처치 1회 이상 기록', 'required',
      (d.firstKill?.kills >= 1) && (d.finalKillCount >= 1), `kills=${d.firstKill?.kills} final=${d.finalKillCount}`));
    checks.push(check('B3-gl-true', '기준: 처치 시점 GL 활성', 'required',
      d.firstKill?.gl === true, `gl=${d.firstKill?.gl}`));
    checks.push(check('B4-window-def', '기준: 창 정의(definition) 명시', 'warn',
      typeof w.definition === 'string' && w.definition.length > 10, w.definition ? '있음' : '없음'));
    checks.push(check('B5-input-proof', '기준: 입력 증거(inputProof) ≥1', 'required',
      Array.isArray(d.inputProof) && d.inputProof.length >= 1
        && d.inputProof.some((e) => e.trusted === true),
      `n=${d.inputProof?.length} trusted=${d.inputProof?.some((e) => e.trusted === true)}`));
  } else if (schema === 'combat-timeline') {
    const w = d.window || {};
    const enemies = d.end?.enemies ?? d.initial?.enemies;
    checks.push(check('B1-reason', '기준: 종료 사유(reason) 기록', 'required',
      typeof w.reason === 'string' && w.reason.length > 0, w.reason || '없음'));
    checks.push(check('B2-kills-delta', '기준: 처치 수 기록(initial→end)', 'required',
      num(d.initial?.kills) && num(d.end?.kills), `initial=${d.initial?.kills} end=${d.end?.kills}`));
    checks.push(check('B3-enemy-count', '기준: 전투 적 수 기록(밀집 판정용)', 'required',
      num(enemies), `enemies=${enemies}`));
    checks.push(check('B4-events', '기준: kills/items 이벤트 타임라인', 'warn',
      Array.isArray(d.events) && d.events.some((e) => e.kind === 'kills'),
      `events=${d.events?.length}`));
  }

  // ── C. 포화 / 회수 ────────────────────────────────────────────
  // C1 프로브 버퍼 포화 금지 (dropped/truncated=0)
  let dropped, truncated;
  if (schema === 'normal-first-kill') { dropped = d.probeMeta?.droppedCount; truncated = d.probeMeta?.truncated; }
  else { dropped = d.dropped; truncated = d.truncated; }
  checks.push(check('C1-no-saturation', '포화: 레코드 버퍼 미포화(dropped=0, truncated=false)', 'required',
    (dropped === 0 || dropped === undefined) && truncated !== true,
    `dropped=${dropped} truncated=${truncated}`));
  // C2 계측 회수(원본 함수 복구/프로브 정지)
  if (schema === 'combat-timeline') {
    const r = d.restored || {};
    checks.push(check('C2-restored', '회수: loop/update/draw 원본 함수 복구', 'required',
      r.loop === true && r.update === true && r.draw === true,
      JSON.stringify(r)));
  } else {
    checks.push(check('C2-restored', '회수: 프로브 정지(stopped=true) 및 endedAt 기록', 'required',
      d.probeMeta?.stopped === true && num(d.probeMeta?.endedAt),
      `stopped=${d.probeMeta?.stopped} endedAt=${d.probeMeta?.endedAt}`));
  }
  // C3 프로브 wrap 누락(missing)은 일부 라벨 미포착 → 경고
  if (schema === 'normal-first-kill') {
    const miss = d.probeMeta?.missing || [];
    checks.push(check('C3-wrap-missing', '회수: 프로브 wrap 누락 라벨', 'warn',
      Array.isArray(miss) && miss.length === 0,
      miss.length ? `미포착: ${miss.join(',')}` : '없음'));
  }

  // ── D. 생존 / 실제 drawHz ─────────────────────────────────────
  // D1 창 지속시간(>0)
  const durationMs = get(d, 'window.duration') ?? get(d, 'window.durationMs');
  checks.push(check('D1-duration', '생존: 측정 창 지속시간 기록(>0)', 'required',
    num(durationMs) && durationMs > 0, `duration=${durationMs}ms`));
  // D2 draw 간격 분포(mean/p95/p99/max) — 실제 drawHz를 평균만이 아니라 꼬리까지 담았는가
  let drawDt, drawRate;
  if (schema === 'combat-timeline') {
    drawDt = d.metrics?.drawStartIntervals || d.metrics?.rAFtimestampIntervals;
    drawRate = get(d, 'window.rateDraw');
  } else {
    drawDt = get(d, 'metrics.worldInputToStop.draw_dt') || get(d, 'metrics.wholeObserver.draw_dt');
    drawRate = drawDt && num(drawDt.n) && num(durationMs) ? (drawDt.n / (durationMs / 1000)) : null;
  }
  const hasTail = drawDt && num(drawDt.p95) && num(drawDt.p99) && num(drawDt.max);
  checks.push(check('D2-draw-interval-tail', '생존: draw 간격 분포(p95/p99/max) 기록', 'required',
    !!hasTail, drawDt ? `mean=${drawDt.mean?.toFixed?.(1)} p95=${drawDt.p95} p99=${drawDt.p99} max=${drawDt.max}` : '간격 분포 없음'));
  // D3 실제 drawHz 산출 가능 + 표본 수 충분(간격 n≥30)
  const n = drawDt?.n;
  checks.push(check('D3-drawhz', '생존: 실제 drawHz 산출 가능 & 표본 n≥30', 'required',
    num(drawRate) && drawRate > 0 && num(n) && n >= 30,
    `drawHz≈${num(drawRate) ? drawRate.toFixed(1) : '?'} n=${n}`));

  // ── E. 품질 자동변화 판정 ─────────────────────────────────────
  // 설치 시점과 이후/최종 옵션을 비교해 품질 영향 키의 변화를 탐지한다.
  // 변화가 있으면: 명시(caveat) 또는 install≠final 기록이 있어야 유효(경고 아님 — 기준 오염 가능).
  let qDiff = [];
  if (opt.install && opt.final) {
    for (const k of QUALITY_KEYS) {
      if (opt.install[k] !== opt.final[k]) qDiff.push(`${k}:${opt.install[k]}→${opt.final[k]}`);
    }
  }
  const changeDocumented = (typeof opt.caveat === 'string' && opt.caveat.length > 0)
    || (schema === 'combat-timeline' && !!d.finalOptions);
  if (qDiff.length === 0) {
    checks.push(check('E1-quality-stable', '품질: 자동변화 없음(설치=최종)', 'warn', true,
      opt.final ? '변화 없음' : '비교 대상(최종 옵션) 없음'));
  } else {
    checks.push(check('E1-quality-change-documented', `품질: 자동변화 탐지 → 문서화 여부`, 'required',
      changeDocumented, `변화=[${qDiff.join(', ')}] / 문서화=${changeDocumented}`));
    checks.push(check('E2-quality-change-flag', '품질: 자동변화로 기준 비교 주의 필요', 'warn', false,
      `이 raw는 품질이 ${qDiff.join(', ')} 로 바뀌었다. 같은 조건 A/B 비교에 단독 사용 금지`));
  }

  const required = checks.filter((c) => c.severity === 'required');
  const reqFail = required.filter((c) => !c.ok);
  const warns = checks.filter((c) => c.severity === 'warn' && !c.ok);
  return {
    schema,
    valid: reqFail.length === 0,
    qualityAutoChange: qDiff,
    counts: { required: required.length, requiredFail: reqFail.length, warnings: warns.length },
    checks,
  };
}

function validateFile(p) {
  const abs = resolve(p.startsWith('/') ? p : resolve(REPO, p));
  if (!existsSync(abs)) return { file: p, error: '파일 없음', valid: false };
  let d;
  try { d = JSON.parse(readFileSync(abs, 'utf8')); }
  catch (e) { return { file: p, error: 'JSON 파싱 실패: ' + e.message, valid: false }; }
  const schema = detectSchema(d);
  if (schema === 'unknown') return { file: p, error: '알 수 없는 스키마(기준점 raw 아님)', valid: false, schema };
  return { file: p, ...validate(d, schema) };
}

function printReport(r) {
  const mark = (c) => (c.ok ? '  OK ' : c.severity === 'required' ? 'FAIL ' : 'WARN ');
  if (r.error) { console.log(`\n■ ${r.file}\n  ✗ ${r.error}`); return; }
  console.log(`\n■ ${r.file}  [${r.schema}]  →  ${r.valid ? 'VALID' : 'INVALID'}`);
  for (const c of r.checks) console.log(`    ${mark(c)}${c.id.padEnd(30)} ${c.label}\n         └ ${c.detail}`);
  if (r.qualityAutoChange?.length) console.log(`    ! 품질 자동변화: ${r.qualityAutoChange.join(', ')}`);
  console.log(`    = required ${r.counts.required - r.counts.requiredFail}/${r.counts.required} pass, 경고 ${r.counts.warnings}`);
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const files = args.filter((a) => !a.startsWith('--'));
const targets = files.length ? files : DEFAULT_RAWS;
const results = targets.map(validateFile);

if (asJson) {
  console.log(JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
} else {
  console.log('QA-B01 baseline raw 유효성 검증기 — read-only (게임 미실행)');
  for (const r of results) printReport(r);
  const bad = results.filter((r) => !r.valid);
  console.log(`\n총 ${results.length}건 중 유효 ${results.length - bad.length}, 무효 ${bad.length}`);
}

process.exit(results.some((r) => r.error && r.file && !existsSync(resolve(REPO, r.file))) ? 2
  : results.every((r) => r.valid) ? 0 : 1);
