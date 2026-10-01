#!/usr/bin/env node
// QA-B01 — 의도적 누락/오염 fixture 생성 + 검증기 reject 확인 (read-only)
//
// 실제 raw(combat-timeline, normal-first-kill summary.json)에서 "기준점 자격"에 필수인
// 구역을 하나씩 의도적으로 제거/오염한 fixture를 만들고, baseline_raw_validator가
// 각 fixture를 INVALID로 reject하며 겨냥한 check가 실제로 FAIL하는지 자동 확인한다.
// 새 측정을 하지 않으며, 생성 fixture는 이 폴더(QA 소유) fixtures/ 에만 쓴다.

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

// 각 fixture: {name, base, expectFailId, mutate(d)}  — expectFailId는 겨냥한 required check
const SPECS = [
  { name: 'ct-missing-environment', base: 'combat-timeline', expectFailId: 'A1-url-webgpu0',
    mutate: (d) => { delete d.environment; } },
  { name: 'ct-missing-options', base: 'combat-timeline', expectFailId: 'A3-options-present',
    mutate: (d) => { delete d.options; } },
  { name: 'ct-fpscap-nonzero', base: 'combat-timeline', expectFailId: 'A4-fpscap-0',
    mutate: (d) => { d.options.fpsCap = 240; } },
  { name: 'ct-saturated-buffer', base: 'combat-timeline', expectFailId: 'C1-no-saturation',
    mutate: (d) => { d.dropped = 812; d.truncated = true; } },
  { name: 'ct-not-restored', base: 'combat-timeline', expectFailId: 'C2-restored',
    mutate: (d) => { d.restored = { draw: true, loop: false, update: true }; } },
  { name: 'ct-missing-draw-tail', base: 'combat-timeline', expectFailId: 'D2-draw-interval-tail',
    mutate: (d) => { delete d.metrics.drawStartIntervals; delete d.metrics.rAFtimestampIntervals; } },
  { name: 'ct-quality-change-undocumented', base: 'combat-timeline', expectFailId: 'E1-quality-change-documented',
    // finalOptions에서 품질 변화를 주되 문서화 플래그(finalOptions 존재)를 없애 "미문서화"로 만든다
    mutate: (d) => { const f = clone(d.options); f.atmos = 2; f.quality = 'low'; d.__final = f;
      // validator는 combat-timeline에서 finalOptions 존재 자체를 문서화로 본다.
      // 미문서화를 재현하려면 설치≠최종이면서 finalOptions 키가 없어야 하므로 캐비엇 경로가 없는 상태를 만든다.
      // → options 자체를 설치본으로 두고 finalOptions를 넣되 strip 플래그로 문서화 제거는 불가하므로
      //   normal-first-kill 쪽에서 caveat 제거로 검증한다. 여기서는 placeholder.
    } },
  { name: 'fk-missing-firstkill-time', base: 'normal-first-kill', expectFailId: 'B1-firstkill-time',
    mutate: (d) => { delete d.window.firstKill; } },
  { name: 'fk-no-kill', base: 'normal-first-kill', expectFailId: 'B2-kill-recorded',
    mutate: (d) => { d.firstKill.kills = 0; d.finalKillCount = 0; } },
  { name: 'fk-no-input-proof', base: 'normal-first-kill', expectFailId: 'B5-input-proof',
    mutate: (d) => { d.inputProof = []; } },
  { name: 'fk-saturated', base: 'normal-first-kill', expectFailId: 'C1-no-saturation',
    mutate: (d) => { d.probeMeta.droppedCount = 1200; d.probeMeta.truncated = true; } },
  { name: 'fk-not-stopped', base: 'normal-first-kill', expectFailId: 'C2-restored',
    mutate: (d) => { d.probeMeta.stopped = false; } },
  { name: 'fk-quality-change-undocumented', base: 'normal-first-kill', expectFailId: 'E1-quality-change-documented',
    // atmos 1→2 변화는 실제로 있는데 optionCaveat를 지워 "미문서화"로 만든다
    mutate: (d) => { delete d.optionCaveat; } },
];

// combat-timeline의 미문서화 품질변화는 구조상 finalOptions 존재=문서화라서 별도 처리:
// options≠finalOptions인데 finalOptions를 빈 비교불가로 두는 대신, 설치본에 변화를 주고
// finalOptions를 설치본과 같게 두면 변화가 안 잡힌다. 따라서 ct 품질 미문서화는 스킵하고
// normal-first-kill(fk-quality-change-undocumented)로 대표한다.
const EFFECTIVE = SPECS.filter((s) => s.name !== 'ct-quality-change-undocumented');

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const bases = {};
for (const k of Object.keys(REAL)) bases[k] = load(REAL[k]);

const report = [];
let allPass = true;
for (const spec of EFFECTIVE) {
  const d = clone(bases[spec.base]);
  spec.mutate(d);
  const fp = resolve(OUT, spec.name + '.json');
  writeFileSync(fp, JSON.stringify(d, null, 2));
  // 검증기 실행 (--json)
  let out, rejected = false, targetFailed = false, err = null;
  try {
    out = execFileSync('node', [VALIDATOR, fp, '--json'], { encoding: 'utf8' });
  } catch (e) { out = e.stdout || ''; } // exit 1은 정상(무효)이므로 stdout 사용
  try {
    const parsed = JSON.parse(out);
    const r = parsed.results[0];
    rejected = r.valid === false;
    const fc = (r.checks || []).find((c) => c.id === spec.expectFailId);
    targetFailed = fc && fc.ok === false && fc.severity === 'required';
    if (!fc) err = `겨냥한 check(${spec.expectFailId}) 없음`;
  } catch (e) { err = '검증기 출력 파싱 실패: ' + e.message; }
  const ok = rejected && targetFailed && !err;
  if (!ok) allPass = false;
  report.push({ fixture: spec.name, base: spec.base, expectFailId: spec.expectFailId, rejected, targetFailed, err, pass: ok });
}

console.log('QA-B01 reject-fixture 확인 (read-only, 게임 미실행)\n');
for (const r of report) {
  console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.fixture.padEnd(34)} reject=${r.rejected} 겨냥check(${r.expectFailId})=FAIL:${r.targetFailed}${r.err ? ' ⚠ ' + r.err : ''}`);
}
console.log(`\n${report.filter((r) => r.pass).length}/${report.length} fixture 정상 reject`);

// 대조: 실제 raw는 그대로 통과(회귀 가드)
let realOk = true;
try { execFileSync('node', [VALIDATOR], { encoding: 'utf8' }); } catch { realOk = false; }
console.log(`대조: 실제 raw 2건 VALID 유지 = ${realOk}`);

process.exit(allPass && realOk ? 0 : 1);
