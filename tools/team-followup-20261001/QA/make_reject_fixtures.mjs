#!/usr/bin/env node
// QA-B01 — fixture 생성 + 분류/CLI 계약 확인 (read-only, 게임 미실행)
//
// 구조 실패와 비교 미입증 fixture를 분리한다. 모든 fixture 에는 `_fixtureMeta`(합성 표식)를 넣어
// 실제 원자료처럼 꾸미지 않는다. 실제 raw 는 수정하지 않는다.
//
//  [그룹1] 구조(diagnostic) reject — 구조가 깨져 diagnosticValid=false (겨냥 구조검사 FAIL)
//  [그룹2] 비교 부적격 — 구조는 유효(diagnosticValid=true)하나 comparisonEligible != true
//          (품질 자동변화·최종옵션 부재·프로파일러 오버헤드·대조메타 미확인)
//  [그룹3] 완전한 메타(합성) — 실제 대응 쌍 검증 부재로 comparisonEligible=unknown
//
// CLI 계약도 함께 확인한다:
//   - diagnostic 모드: 그룹1 exit1, 그룹2·3(구조 유효) exit0
//   - comparison 모드: 그룹2·3 exit1(true 아님)
//   - 실제 raw 회귀: diagnostic exit0, comparison exit1(아직 어느 것도 적격 아님)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dir, '..', '..', '..');
const OUT = resolve(__dir, 'fixtures');
const VALIDATOR = resolve(__dir, 'baseline_raw_validator.mjs');

const REAL = {
  'combat-timeline': 'docs/0마스터플랜/mac-resume-20261001/combat-timeline-evidence/summary.json',
  'normal-first-kill': 'docs/0마스터플랜/mac-resume-20261001/normal-first-kill-evidence/summary.json',
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const load = (p) => JSON.parse(readFileSync(resolve(REPO, p), 'utf8'));

// 그룹1: 구조 reject (expect diagnosticValid=false, 겨냥 구조검사 FAIL)
const DIAG = [
  { name: 'diag-ct-missing-environment', base: 'combat-timeline', target: 'A1-url-webgpu0', mutate: (d) => { delete d.environment; } },
  { name: 'diag-ct-missing-options', base: 'combat-timeline', target: 'A3-options-present', mutate: (d) => { delete d.options; } },
  { name: 'diag-ct-no-fpscap-key', base: 'combat-timeline', target: 'A4-fpscap-recorded', mutate: (d) => { delete d.options.fpsCap; } },
  { name: 'diag-ct-saturated-buffer', base: 'combat-timeline', target: 'C1-no-saturation', mutate: (d) => { d.dropped = 812; d.truncated = true; } },
  { name: 'diag-ct-not-restored', base: 'combat-timeline', target: 'C2-restored', mutate: (d) => { d.restored = { draw: true, loop: false, update: true }; } },
  { name: 'diag-ct-missing-draw-tail', base: 'combat-timeline', target: 'D2-draw-interval-tail', mutate: (d) => { delete d.metrics.drawStartIntervals; delete d.metrics.rAFtimestampIntervals; } },
  { name: 'diag-fk-missing-firstkill-time', base: 'normal-first-kill', target: 'B1-firstkill-time', mutate: (d) => { delete d.window.firstKill; } },
  { name: 'diag-fk-no-kill', base: 'normal-first-kill', target: 'B2-kill-recorded', mutate: (d) => { d.firstKill.kills = 0; d.finalKillCount = 0; } },
  { name: 'diag-fk-no-input-proof', base: 'normal-first-kill', target: 'B5-input-proof', mutate: (d) => { d.inputProof = []; } },
  { name: 'diag-fk-saturated', base: 'normal-first-kill', target: 'C1-no-saturation', mutate: (d) => { d.probeMeta.droppedCount = 1200; d.probeMeta.truncated = true; } },
  { name: 'diag-fk-not-stopped', base: 'normal-first-kill', target: 'C2-restored', mutate: (d) => { d.probeMeta.stopped = false; } },
];

// 그룹2: 비교 부적격 (expect diagnosticValid=true, comparisonEligible=false|unknown, 겨냥 게이트 state)
const CMP_BAD = [
  { name: 'cmp-quality-change', base: 'combat-timeline', targetGate: 'CMP1-quality-stable', expect: 'false',
    purpose: '측정 중 품질 자동변화 → 진단 보존, 비교 부적격',
    mutate: (d) => { d.finalOptions = clone(d.options); d.finalOptions.atmos = 2; d.finalOptions.quality = 'low'; } },
  { name: 'cmp-missing-final-options', base: 'combat-timeline', targetGate: 'CMP2-final-options', expect: 'unknown',
    purpose: '최종 옵션 스냅샷 부재 → 품질 고정 미입증(unknown)',
    mutate: (d) => { delete d.finalOptions; } },
  { name: 'cmp-profiler-on', base: 'combat-timeline', targetGate: 'CMP3-instrumentation', expect: 'false',
    purpose: '프로파일러/계측 오버헤드 → 비교 부적격',
    mutate: (d) => { d.environment.profiler = true; } },
  { name: 'cmp-no-controlled-meta', base: 'combat-timeline', targetGate: 'CMP4-controlled-meta', expect: 'unknown',
    purpose: '대조 입력(seed/maxload/expectsha/variant) 미기록 → 내내 고정 미확인(unknown)',
    mutate: (d) => { /* 변형 없음: 대조메타 없는 상태 자체가 unknown */ } },
  { name: 'cmp-fk-atmos-change', base: 'normal-first-kill', targetGate: 'CMP1-quality-stable', expect: 'false',
    purpose: '실제 atmos1→2 자료 유형 — 진단 보존하되 비교 부적격(문서화 여부 무관)',
    mutate: (d) => { delete d.optionCaveat; /* caveat 유무와 무관하게 CMP1=false 임을 확인 */ } },
];

// 그룹3: 메타를 모두 넣어도 실제 대조 검증은 불가 (실제 측정 아님)
const CMP_METADATA = [
  { name: 'cmp-eligible-synth', base: 'combat-timeline', targetGate: 'CMP4-controlled-meta', expect: 'unknown',
    purpose: '합성 — 메타를 모두 기록해도 대응 쌍·연속 조건 미검증. 비교 unknown 계약(실측 아님)',
    mutate: (d) => {
      d.finalOptions = clone(d.options);           // 양끝 동일(품질 불변)
      d.environment.profiler = false;              // 계측 조건 기록·off
      d.environment.gpuTiming = d.environment.gpuTiming ?? false;
      d.environment.seed = 20261001;               // 대조 입력(합성값)
      d.environment.maxload = 60;
      d.environment.expectSha = 'SYNTHETIC-NOT-A-REAL-SHA';
      d.environment.variant = 'synthetic-after';
    } },
];

const REVIEW2 = [
  { name: 'review2-two-metadata', targetGate: 'CMP4-controlled-meta', expect: 'unknown', gateState: 'unknown', mutate: d => { d.environment.profiler=false; d.environment.seed=1; d.environment.variant='arbitrary'; } },
  { name: 'review2-gpu-off-only', targetGate: 'CMP3-instrumentation', expect: 'unknown', gateState: 'unknown', mutate: d => { delete d.environment.profiler; d.environment.gpuTiming=false; d.environment.seed=1; d.environment.variant='arbitrary'; } },
  ...['false','true',0,null].map((v,i) => ({name:'review2-profiler-wrong-type-'+i, targetGate:'CMP3-instrumentation',expect:'unknown',gateState:'unknown', mutate:d=>{d.environment.profiler=v;}})),
  { name:'review2-profiler-off-explicit', targetGate:'CMP3-instrumentation', expect:'unknown',gateState:'true', mutate:d=>{d.environment.profiler=false;delete d.environment.gpuTiming;} },
  { name:'review2-profiler-missing',targetGate:'CMP3-instrumentation',expect:'unknown',gateState:'unknown',mutate:d=>{delete d.environment.profiler;delete d.environment.gpuTiming;delete d.profile;} },
  { name:'review2-profiler-conflict',targetGate:'CMP3-instrumentation',expect:'false',gateState:'false',mutate:d=>{d.environment.profiler=false;d.profile={nodes:[],samples:[]};} },
  { name:'review2-profile-wrong-type',targetGate:'CMP3-instrumentation',expect:'unknown',gateState:'unknown',mutate:d=>{d.environment.profiler=false;d.profile='off';} },
].map(s=>({...s,base:'combat-timeline',purpose:'총괄 재검토2 회귀: '+s.name}));

function fixtureMeta(spec, group) {
  return {
    synthetic: true,
    group,
    base: spec.base,
    purpose: spec.purpose || `구조검사 ${spec.target} 겨냥`,
    target: spec.target || spec.targetGate,
    expect: spec.expect,
    note: '테스트용 합성 입력 — 실제 측정 raw 아님. 원자료처럼 사용 금지.',
    release: 'none',
    generatedAt: new Date().toISOString(),
  };
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const bases = {};
for (const k of Object.keys(REAL)) bases[k] = load(REAL[k]);

function write(spec, group) {
  const d = clone(bases[spec.base]);
  spec.mutate(d);
  d._fixtureMeta = fixtureMeta(spec, group);
  const fp = resolve(OUT, spec.name + '.json');
  writeFileSync(fp, JSON.stringify(d, null, 2));
  return fp;
}
function runJson(fp) {
  let out;
  try { out = execFileSync(process.execPath, [VALIDATOR, fp, '--json'], { encoding: 'utf8' }); }
  catch (e) { out = e.stdout || ''; } // exit!=0 정상
  return JSON.parse(out).results[0];
}
function runExit(fileArgs, mode) {
  try { execFileSync(process.execPath, [VALIDATOR, ...fileArgs, `--mode=${mode}`], { stdio: 'ignore' }); return 0; }
  catch (e) { return e.status ?? 99; }
}

const rep = [];
let allPass = true;
const rec = (ok, line) => { if (!ok) allPass = false; rep.push({ ok, line }); };

// 그룹1
console.log('QA-B01 fixture 분류/CLI 계약 확인 (read-only, 게임 미실행)\n');
console.log('[그룹1] 구조(diagnostic) reject');
const diagFiles = [];
for (const s of DIAG) {
  const fp = write(s, 'diagnostic-reject'); diagFiles.push(fp);
  const r = runJson(fp);
  const fc = (r.structuralChecks || []).find((c) => c.id === s.target);
  const ok = r.diagnosticValid === false && fc && fc.ok === false && fc.severity === 'required' && r.comparisonEligible === 'false';
  rec(ok, `  ${ok ? 'PASS' : 'FAIL'} ${s.name.padEnd(32)} diagValid=${r.diagnosticValid} cmp=${r.comparisonEligible} 겨냥(${s.target})FAIL=${fc && !fc.ok}`);
}

console.log('\n[그룹2] 비교 부적격(구조는 유효)');
const cmpBadFiles = [];
for (const s of CMP_BAD) {
  const fp = write(s, 'comparison-ineligible'); cmpBadFiles.push(fp);
  const r = runJson(fp);
  const g = (r.comparisonGates || []).find((x) => x.id === s.targetGate);
  const ok = r.diagnosticValid === true && r.comparisonEligible === s.expect && g && g.state === s.expect;
  rec(ok, `  ${ok ? 'PASS' : 'FAIL'} ${s.name.padEnd(32)} diagValid=${r.diagnosticValid} cmp=${r.comparisonEligible}(기대 ${s.expect}) 게이트(${s.targetGate})=${g && g.state}`);
}

console.log('\n[그룹3] 완전한 메타(합성)도 비교 미입증');
const cmpMetadataFiles = [];
for (const s of CMP_METADATA) {
  const fp = write(s, 'comparison-unverified'); cmpMetadataFiles.push(fp);
  const r = runJson(fp);
  const ok = r.diagnosticValid === true && r.comparisonEligible === 'unknown';
  rec(ok, `  ${ok ? 'PASS' : 'FAIL'} ${s.name.padEnd(32)} diagValid=${r.diagnosticValid} cmp=${r.comparisonEligible}(기대 unknown)`);
}

console.log('\n[총괄 재검토2]');
for (const s of REVIEW2) {
  const fp = write(s, 'review2-regression');
  const r = runJson(fp);
  const g = r.comparisonGates.find(x => x.id === s.targetGate);
  const ok = r.diagnosticValid === true && r.comparisonEligible === s.expect && g?.state === s.gateState
    && runExit([fp], 'diagnostic') === 0 && runExit([fp], 'comparison') === 1;
  rec(ok, `  ${ok ? 'PASS' : 'FAIL'} ${s.name} cmp=${r.comparisonEligible} gate=${g?.state} CLI diagnostic0/comparison1`);
}

console.log('\n[CLI 계약]');
{
  const badMode = runExit([], 'comparision');
  rec(badMode === 2, `  ${badMode === 2 ? 'PASS' : 'FAIL'} 잘못된 모드 → exit ${badMode} (기대 2)`);
  const e1 = runExit(diagFiles, 'diagnostic');
  rec(e1 === 1, `  ${e1 === 1 ? 'PASS' : 'FAIL'} diagnostic 모드·그룹1 → exit ${e1} (기대 1)`);
  const e2 = runExit([...cmpBadFiles, ...cmpMetadataFiles], 'diagnostic');
  rec(e2 === 0, `  ${e2 === 0 ? 'PASS' : 'FAIL'} diagnostic 모드·그룹2+3(구조유효) → exit ${e2} (기대 0)`);
  const e3 = runExit(cmpBadFiles, 'comparison');
  rec(e3 === 1, `  ${e3 === 1 ? 'PASS' : 'FAIL'} comparison 모드·그룹2 → exit ${e3} (기대 1)`);
  const e4 = runExit(cmpMetadataFiles, 'comparison');
  rec(e4 === 1, `  ${e4 === 1 ? 'PASS' : 'FAIL'} comparison 모드·그룹3 → exit ${e4} (기대 1)`);
}

console.log('\n[실제 raw 회귀]');
{
  const d = runExit([], 'diagnostic');   // 기본 raw 2건
  rec(d === 0, `  ${d === 0 ? 'PASS' : 'FAIL'} 실제 raw diagnostic → exit ${d} (기대 0)`);
  const c = runExit([], 'comparison');
  rec(c === 1, `  ${c === 1 ? 'PASS' : 'FAIL'} 실제 raw comparison → exit ${c} (기대 1; 아직 어느 것도 적격 아님)`);
}

console.log('\n' + rep.map((r) => r.line).join('\n'));
console.log(`\n${rep.filter((r) => r.ok).length}/${rep.length} 계약 통과`);
process.exit(allPass ? 0 : 1);
