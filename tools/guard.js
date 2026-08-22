#!/usr/bin/env node
/*
 * tools/guard.js — 커밋 전 자동 검증 가드 (game.html 읽기 전용)
 *
 * 6개 검사. 하나라도 실패(CHECK1~5)면 process.exit(1). CHECK6은 경고만.
 * baseline: tools/guard.baseline.json (없으면 현재값으로 생성 후 통과).
 *
 * 설계 주의:
 *  - game.html은 타세션이 상시 편집(라인 실시간 이동) → 모든 영역을 '정규식 패턴'으로
 *    런타임 탐색한다. 라인번호 하드코딩 금지. 루프 경계는 시그니처 상수 + 컬럼0 '}'로 탐지.
 *  - spec 불일치 2건을 안전 반영:
 *      · StageSeeder / CIN_LINES 배열은 현재 game.html에 부재(index.html 소유) → baseline에
 *        null로 기록, present↔absent 전환 또는 해시변경 시에만 실패.
 *      · CHECK5 BOSS_MOVES.idx는 현재 0-57,60(58개, gap 30/58/59) → "0-48 연속" 리터럴은
 *        현재 데이터와 불일치. 대신 (a)중복=항상 실패 (b)baseline 스냅샷 대비 변경=실패
 *        (c)gap은 정보출력. 의도('누락/중복 감지')를 데이터 현실에 맞게 구현.
 */
// package.json "type":"module" → ESM. 파일명은 guard.js 유지.
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import cp from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GAME = path.join(ROOT, 'game.html');
const BASELINE = path.join(__dirname, 'guard.baseline.json');

const LOOP_SIG = 'function loop(timestamp){'; // [CHECK2] 게임루프 시그니처 상수

function sha256(s) { return crypto.createHash('sha256').update(s, 'utf8').digest('hex'); }
function readGame() { return fs.readFileSync(GAME, 'utf8'); }
function loadBaseline() {
  try { return JSON.parse(fs.readFileSync(BASELINE, 'utf8')); } catch (e) { return null; }
}

const fails = [];   // 실패 메시지
const warns = [];   // 경고 메시지
const notes = [];   // 정보 메시지
function fail(check, msg) { fails.push('[' + check + '] ' + msg); }
function note(check, msg) { notes.push('[' + check + '] ' + msg); }

// ─────────────────────────────────────────────────────────────
// 보호영역 매처: 이름 → 매치 문자열(null=부재)
// ─────────────────────────────────────────────────────────────
function matchRegions(text) {
  function firstLine(re) { const m = text.match(re); return m ? m[0] : null; }
  return {
    // ELC 색상 배열 선언 (한 줄)
    ELC:        firstLine(/const ELC=\[[^\]]*\];/),
    // ETYPE_COL 색상 배열 선언 (여러 줄, 첫 "];"까지)
    ETYPE_COL:  (text.match(/const ETYPE_COL=\[[\s\S]*?\];/) || [null])[0],
    // _tseed 타일 시드 함수 (한 줄)
    _tseed:     firstLine(/function _tseed\([^\n]*/),
    // StageSeeder (현재 부재 → null 예상)
    StageSeeder:(text.match(/(?:function|class|const|let|var)\s+StageSeeder\b[^\n]*/) || [null])[0],
    // CIN_LINES 배열 선언 (현재 부재 → null 예상)
    CIN_LINES:  (text.match(/(?:const|let|var)\s+CIN_LINES\s*=\s*\[[\s\S]*?\];/) || [null])[0],
    // 강화확률 공식 (0.99 포함 라인)
    enhanceProb:firstLine(/[^\n]*99\*Math\.pow\(0\.99[^\n]*/),
  };
}

// ─────────────────────────────────────────────────────────────
// CHECK1 — 보호영역 해시
// ─────────────────────────────────────────────────────────────
function check1(text, baseline, nextBaseline) {
  const regions = matchRegions(text);
  const hashes = {};
  for (const k of Object.keys(regions)) {
    hashes[k] = regions[k] === null ? null : sha256(regions[k]);
    if (regions[k] === null) note('CHECK1', k + ' 영역 부재(absent)');
  }
  nextBaseline.regions = hashes; // 통과 시 저장용 (baseline 없을 때만 실제 기록)

  if (!baseline || !baseline.regions) {
    note('CHECK1', 'baseline 없음 → 현재 해시로 생성 (통과)');
    return;
  }
  for (const k of Object.keys(hashes)) {
    const cur = hashes[k], base = baseline.regions[k];
    if (base === undefined) { note('CHECK1', k + ' baseline에 없음 → 신규 등록'); continue; }
    if (cur !== base) {
      const kind = (base === null) ? 'absent→present' : (cur === null ? 'present→absent' : 'hash 변경');
      fail('CHECK1', '보호영역 "' + k + '" ' + kind + ' (base=' + String(base).slice(0,12) + ' cur=' + String(cur).slice(0,12) + ')');
    }
  }
  // baseline 유지 (변경 없을 때 그대로), 실패 시에도 nextBaseline은 안 씀
  nextBaseline.regions = baseline.regions;
}

// ─────────────────────────────────────────────────────────────
// CHECK2 — 게임루프 본문 금지패턴
//   루프 경계: LOOP_SIG 라인 시작 ~ 이후 첫 컬럼0 '}' 라인
//   금지: new / .splice( / .filter( / .forEach( / Date.now(
// ─────────────────────────────────────────────────────────────
function check2(text) {
  const lines = text.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(LOOP_SIG) === 0 || lines[i].trim() === LOOP_SIG) { start = i; break; }
  }
  if (start < 0) { fail('CHECK2', '게임루프 시그니처 미발견: ' + LOOP_SIG); return; }
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].charAt(0) === '}') { end = i; break; } // 컬럼0 '}' = 함수 종료
  }
  if (end < 0) { fail('CHECK2', '게임루프 종료 브레이스(컬럼0 "}") 미발견'); return; }
  note('CHECK2', '게임루프 본문 라인수=' + (end - start + 1) + ' (시그니처+' + (end - start) + ')');

  const banned = [
    { re: /\bnew\b/, name: 'new' },
    { re: /\.splice\(/, name: '.splice(' },
    { re: /\.filter\(/, name: '.filter(' },
    { re: /\.forEach\(/, name: '.forEach(' },
    { re: /Date\.now\(/, name: 'Date.now(' },
  ];
  for (let i = start; i <= end; i++) {
    // 라인주석 제거(오탐 저감) — 문자열 내 '//' 오제거 위험 있으나 루프 본문 한정 수용
    const code = lines[i].replace(/\/\/.*$/, '');
    for (const b of banned) {
      if (b.re.test(code)) {
        fail('CHECK2', '게임루프 라인 ' + (i + 1) + ' 금지패턴 "' + b.name + '": ' + lines[i].trim().slice(0, 80));
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK3 — script 블록 문법 (node --check)
//   외부(src)·importmap·application/json 스킵. module→.mjs, 그 외→.js
// ─────────────────────────────────────────────────────────────
function check3(text) {
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m, idx = 0, checked = 0;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-'));
  try {
    while ((m = re.exec(text))) {
      idx++;
      const attrs = m[1] || '', body = m[2] || '';
      if (/\bsrc\s*=/.test(attrs)) continue;                 // 외부 스크립트
      if (/type\s*=\s*["']?importmap/i.test(attrs)) continue; // importmap(JSON)
      if (/type\s*=\s*["']?application\/json/i.test(attrs)) continue;
      const isModule = /type\s*=\s*["']?module/i.test(attrs);
      if (!body.trim()) continue;
      const ext = isModule ? '.mjs' : '.js';
      const f = path.join(tmpDir, 'script' + idx + ext);
      fs.writeFileSync(f, body);
      checked++;
      try {
        cp.execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
      } catch (e) {
        const out = (e.stderr ? e.stderr.toString() : '') + (e.stdout ? e.stdout.toString() : '');
        fail('CHECK3', 'script#' + idx + (isModule ? '(module)' : '') + ' 문법오류:\n    ' + out.trim().split('\n').slice(0, 3).join('\n    '));
      }
    }
    note('CHECK3', checked + '개 인라인 스크립트 문법검사');
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK4 — 라인수 급감 (baseline 대비 5% 이상 감소면 실패)
// ─────────────────────────────────────────────────────────────
function check4(text, baseline, nextBaseline) {
  const cur = text.split('\n').length;
  nextBaseline.lines = cur;
  if (!baseline || typeof baseline.lines !== 'number') {
    note('CHECK4', 'baseline 없음 → lines=' + cur + ' 기록 (통과)');
    return;
  }
  const base = baseline.lines;
  const drop = (base - cur) / base;
  if (drop >= 0.05) {
    fail('CHECK4', '라인수 급감 ' + (drop * 100).toFixed(1) + '% (baseline=' + base + ' → cur=' + cur + ')');
    nextBaseline.lines = base; // 실패 시 baseline 유지
  } else {
    note('CHECK4', '라인수 ' + base + '→' + cur + ' (' + (cur >= base ? '+' : '') + (cur - base) + ') 통과, baseline 갱신');
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK5 — 보스 콤보(BOSS_MOVES.idx) 무결성
//   중복=실패. baseline 스냅샷 대비 변경=실패. gap=정보.
// ─────────────────────────────────────────────────────────────
function check5(text, baseline, nextBaseline) {
  const block = (text.match(/const BOSS_MOVES=\[[\s\S]*?\];/) || [null])[0];
  if (!block) { fail('CHECK5', 'BOSS_MOVES 배열 미발견'); return; }
  const idxs = [];
  const rx = /idx:\s*(\d+)/g; let mm;
  while ((mm = rx.exec(block))) idxs.push(+mm[1]);
  if (!idxs.length) { fail('CHECK5', 'BOSS_MOVES.idx 항목 0개'); return; }

  // 중복 검사
  const seen = new Set(), dups = new Set();
  for (const v of idxs) { if (seen.has(v)) dups.add(v); seen.add(v); }
  if (dups.size) fail('CHECK5', 'idx 중복: ' + [...dups].sort((a, b) => a - b).join(','));

  const sorted = [...seen].sort((a, b) => a - b);
  const min = sorted[0], max = sorted[sorted.length - 1];
  const gaps = [];
  for (let i = min; i <= max; i++) if (!seen.has(i)) gaps.push(i);
  note('CHECK5', 'idx count=' + sorted.length + ' range=' + min + '~' + max + (gaps.length ? ' gaps=[' + gaps.join(',') + ']' : ' (연속)'));

  nextBaseline.bossIdx = sorted;
  if (!baseline || !Array.isArray(baseline.bossIdx)) {
    note('CHECK5', 'baseline 없음 → idx 스냅샷 기록 (통과)');
    return;
  }
  const a = baseline.bossIdx.join(','), b = sorted.join(',');
  if (a !== b) {
    fail('CHECK5', 'BOSS_MOVES.idx 집합 변경 (baseline≠현재)\n    baseline=' + a + '\n    current =' + b);
    nextBaseline.bossIdx = baseline.bossIdx; // 실패 시 유지
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK6 — 타세션 혼입 경고 (git diff --stat, 경고만)
// ─────────────────────────────────────────────────────────────
function check6() {
  try {
    const out = cp.execSync('git diff --stat -- game.html', { cwd: ROOT }).toString().trim();
    if (out) warns.push('[CHECK6] game.html working-tree 변경 존재 (타세션 WIP 가능):\n    ' + out.split('\n').join('\n    '));
    else note('CHECK6', 'game.html working-tree clean');
  } catch (e) {
    warns.push('[CHECK6] git diff 실행 실패: ' + e.message);
  }
}

// ─────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(GAME)) { console.error('game.html 없음: ' + GAME); process.exit(1); }
  const text = readGame();
  const baseline = loadBaseline();
  const nextBaseline = baseline ? JSON.parse(JSON.stringify(baseline)) : {};

  check1(text, baseline, nextBaseline);
  check2(text);
  check3(text);
  check4(text, baseline, nextBaseline);
  check5(text, baseline, nextBaseline);
  check6();

  // baseline 저장: 실패가 없을 때만 갱신 (실패 시 원본 유지 — 오염 방지)
  if (!fails.length) {
    fs.writeFileSync(BASELINE, JSON.stringify(nextBaseline, null, 2) + '\n');
  }

  console.log('───── guard.js 결과 ─────');
  for (const n of notes) console.log('  ' + n);
  if (warns.length) { console.log('── 경고 ──'); for (const w of warns) console.log('  ' + w); }
  if (fails.length) {
    console.log('── 실패 ──');
    for (const f of fails) console.log('  ✗ ' + f);
    console.log('\n결과: FAIL (' + fails.length + '건) → 커밋 중단');
    process.exit(1);
  }
  console.log('\n결과: PASS (전체 통과)' + (baseline ? '' : ' — baseline 신규 생성됨'));
  process.exit(0);
}

main();
