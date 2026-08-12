#!/usr/bin/env node
// ═══ [Phase 4B-5B] Regression Guard ═══
// full-suite의 known baseline 실패(test/_baseline_failures.txt)와 현재 실패를 기계 비교.
// NEW_ONLY(=현재만 실패, baseline엔 없음) > 0 이면 exit 1 (신규 회귀). 기존 실패는 고치지 않음.
// 사용: node tools/regression-guard.mjs [runs]   (기본 3회 union으로 flaky 완화)
//   baseline 재생성: node tools/regression-guard.mjs --update
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const BASELINE = new URL('../test/_baseline_failures.txt', import.meta.url);
const RUNS = Number(process.argv.find(a => /^\d+$/.test(a)) || 3);
const UPDATE = process.argv.includes('--update');

function failUnion(runs) {
  const set = new Set();
  for (let i = 0; i < runs; i++) {
    let out = '';
    try {
      out = execSync('node --test --test-reporter=tap', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 });
    } catch (e) { out = (e.stdout || '') + ''; }   // node --test exits non-zero when tests fail
    for (const line of out.split('\n')) {
      const m = line.match(/^not ok \d+ - (.+?)\s*$/);
      if (m) set.add(m[1]);
    }
  }
  return [...set].sort();
}

const current = failUnion(RUNS);

if (UPDATE) {
  writeFileSync(BASELINE, current.join('\n') + '\n');
  console.log(`[guard] baseline updated: ${current.length} known failures (${RUNS} runs union)`);
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error('[guard] FAIL: baseline snapshot 없음 (test/_baseline_failures.txt). --update 로 생성.');
  process.exit(2);
}
const baseline = readFileSync(BASELINE, 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
const baseSet = new Set(baseline), curSet = new Set(current);
const NEW_ONLY = current.filter(x => !baseSet.has(x));
const BASELINE_ONLY = baseline.filter(x => !curSet.has(x));

console.log(`BASELINE_COUNT = ${baseline.length}`);
console.log(`CURRENT_COUNT  = ${current.length}  (${RUNS} runs union)`);
console.log(`BASELINE_ONLY  = ${BASELINE_ONLY.length}${BASELINE_ONLY.length ? ' (사전실패 소멸 — 경고만): ' + BASELINE_ONLY.join(' | ') : ''}`);
console.log(`NEW_ONLY       = ${NEW_ONLY.length}${NEW_ONLY.length ? ': ' + NEW_ONLY.join(' | ') : ''}`);
if (NEW_ONLY.length > 0) {
  console.error('[guard] FAIL: 신규 회귀 감지 (NEW_ONLY > 0).');
  process.exit(1);
}
console.log('[guard] PASS: NEW_ONLY = 0 (신규 회귀 없음).');
