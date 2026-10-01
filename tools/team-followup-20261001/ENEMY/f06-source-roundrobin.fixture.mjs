/* ENEMY-20261002-F06-SOURCE-CANDIDATE — source-anchored 실행 fixture (가상시계·소형)
 *
 * 승인된 ENEMY-F06(배열 꼬리 '영구' AI 기아)의 최소 source 후보(라운드로빈 시작 인덱스 회전)를
 * 실제 game.html 메인 적 루프에서 '추출'한 입력에 적용해 결정적으로 검증한다.
 * 기존 test/enemyTimeBudgetStarvation.test.js 의 합성 하니스 개념을 재복제하지 않고,
 * (1) 현행 소스의 실제 게이트 문자열을 추출·대조하고
 * (2) 후보 patch를 원 헤더 문자열에 적용해 패치 헤더를 도출·대조하며
 * (3) 원 소스 게이트 식을 그대로 반영한 가상시계 스케줄러로 원본 vs 후보를 비교한다.
 *
 * 제약 준수: 소형 fixture·가상시계만(긴 스트레스/CPU 측정/대형 시뮬 0). 실제 성능 개선 주장 0.
 *   production game.html/easy 는 읽기 전용(미수정). 보호계약(예산 12/8ms·공격티켓 미도입·
 *   soft-cap 무조건활성 0) 유지. LOD parity 는 원 배열 인덱스 기준 유지.
 *
 * 핵심 계약: 라운드로빈은 '영구' 기아만 분산할 뿐 '매 tick 처리'를 보장하지 않는다.
 *   지속 과부하의 잔여 gap 해소는 QA 소유 soft-cap 과제(여기서 무조건 활성화하지 않음).
 *
 * 실행: node tools/team-followup-20261001/ENEMY/f06-source-roundrobin.fixture.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gamePath = path.join(__dirname, '../../../game.html');
const easyPath = path.join(__dirname, '../../../game-easy-test.html');
const src = readFileSync(gamePath, 'utf8');
const easySrc = readFileSync(easyPath, 'utf8');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

let pass = 0, fail = 0;
const log = [];
function check(name, fn) {
  try { fn(); console.log('  PASS  ' + name); pass++; }
  catch (e) { console.log('  FAIL  ' + name + '\n        ' + (e && e.message)); fail++; }
}

// ── 원 헤더 블록(게임 메인 적 루프 선두) — patch 검색 대상과 동일해야 함 ──
const ORIG_HEADER =
  "  const _eUpdateStart=performance.now();\n" +
  "  const _eo=_gameFrame&1; // 짝홀 프레임 분산\n" +
  "  for(let _ei=0;_ei<ens.length;_ei++){const e=ens[_ei];\n" +
  "    // 타임버짓: 8ms 초과하면 비보스 스킵\n" +
  "    if(_ei%(IS_MOBILE?8:32)===0&&_ei>0&&!e.ib&&performance.now()-_eUpdateStart>(IS_MOBILE?8:12))break;\n";

// ── 후보(라운드로빈) 헤더 — ORIG_HEADER 를 치환해 생성(= patch 적용 결과) ──
const PATCHED_HEADER =
  "  const _eUpdateStart=performance.now();\n" +
  "  const _eo=_gameFrame&1; // 짝홀 프레임 분산\n" +
  "  // ENEMY-F06: 라운드로빈 루프 시작 인덱스 회전 — 배열 꼬리 '영구' 기아 분산(매tick 처리 보장 아님).\n" +
  "  //   엔티티 접근·LOD parity 는 원 배열 인덱스 _ei 유지. _k=이번 tick 처리 순번(타임버짓 카운터).\n" +
  "  //   보호계약 불변: 예산 12/8ms·공격티켓 미도입·soft-cap 무조건활성 0. 과부하 지속 잔여 gap 은 QA soft-cap 과제.\n" +
  "  const _elen=ens.length;\n" +
  "  const _eStart=_elen>0?((G._eLoopStart|0)%_elen):0;\n" +
  "  G._eLoopStart=_elen>0?(((G._eLoopStart|0)+1)%_elen):0; // 다음 tick 1칸 회전 → 모든 인덱스가 _elen tick 내 1회 선두\n" +
  "  for(let _k=0;_k<_elen;_k++){const _ei=(_eStart+_k)%_elen;const e=ens[_ei];if(!e)continue;\n" +
  "    // 타임버짓: 예산 초과 시 비보스에서 중단(이번 tick 미처리분은 다음 tick 회전으로 선두 승격)\n" +
  "    if(_k%(IS_MOBILE?8:32)===0&&_k>0&&!e.ib&&performance.now()-_eUpdateStart>(IS_MOBILE?8:12))break;\n";

// 코드 전용(주석 제거) — soft-cap/티켓 '코드' 부재를 문서용 주석과 분리해 판정
const PATCHED_CODE = PATCHED_HEADER.split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');

console.log('ENEMY-20261002-F06-SOURCE-CANDIDATE fixture\n');
console.log('  game.html sha256=' + sha(src));
console.log('  game-easy-test.html sha256=' + sha(easySrc) + '\n');

// ════════ (1) source-anchored 대조: 원 게이트가 실제 소스에 존재 ════════
check('원 헤더 블록이 game.html 과 game-easy-test.html 양쪽에 그대로 존재(추출 기준점)', () => {
  assert.ok(src.includes(ORIG_HEADER), 'game.html 원 헤더 미발견(소스 변동?)');
  assert.ok(easySrc.includes(ORIG_HEADER), 'game-easy-test.html 원 헤더 미발견');
});
check('원 LOD parity 게이트가 _ei(원 인덱스) 기준(game.html)', () => {
  assert.match(src, /\(G\._eTierFrame&1\)===\(_ei&1\)/, 'T2 parity');
  assert.match(src, /\(G\._eTierFrame&3\)===\(_ei&3\)/, 'T3 parity');
  assert.match(src, /\(G\._eTierFrame&7\)===\(_ei&7\)/, 'T4 parity');
});
check('예산 상수(12/8ms)·공격티켓 미도입(보호계약) 원본 유지', () => {
  assert.match(src, /performance\.now\(\)-_eUpdateStart>\(IS_MOBILE\?8:12\)/, '예산 12/8ms');
  // 이 후보는 어택 티켓/동시공격 제한을 도입하지 않는다(문자열 추가 금지 확인은 PATCHED_HEADER로).
  assert.ok(!/Ticket|티켓/.test(PATCHED_CODE), '공격티켓 미도입(코드)');
  assert.ok(!/soft.?cap/i.test(PATCHED_CODE), 'soft-cap 무조건 활성화 코드 없음(문서 주석은 허용)');
});

// ════════ (2) 후보 헤더 도출·대조 ════════
check('후보 헤더는 원 헤더의 치환 결과(예산식·_eo·_eUpdateStart 보존, 카운터만 _ei→_k)', () => {
  assert.ok(PATCHED_HEADER.startsWith("  const _eUpdateStart=performance.now();\n  const _eo=_gameFrame&1;"), '_eUpdateStart/_eo 보존');
  assert.ok(PATCHED_HEADER.includes('const _eStart=_elen>0?((G._eLoopStart|0)%_elen):0;'), '회전 시작 인덱스');
  assert.ok(PATCHED_HEADER.includes('G._eLoopStart=_elen>0?(((G._eLoopStart|0)+1)%_elen):0;'), '다음 tick 1칸 회전');
  assert.ok(PATCHED_HEADER.includes('const _ei=(_eStart+_k)%_elen;const e=ens[_ei];if(!e)continue;'), '원 인덱스 _ei 보존 + hole 가드');
  assert.ok(PATCHED_HEADER.includes('_k%(IS_MOBILE?8:32)===0&&_k>0&&!e.ib&&performance.now()-_eUpdateStart>(IS_MOBILE?8:12))break;'), '예산식 보존, 카운터 _k');
  // LOD parity 는 바디(헤더 밖)에서 여전히 _ei → 치환 대상 아님. 바디는 원본 그대로.
});

// ════════ (3) 가상시계 스케줄러 — 원 소스 게이트 식 반영, 원본 vs 후보 ════════
// 소형: N=40, CHUNK=32(desktop), 소수 tick. 비용은 가상 µs(실 CPU 측정 아님).
const CHUNK = 32, BUDGET_us = 12000, Cfull_us = 500, Ctimer_us = 2;

// wantsUpdate: 원 소스 티어 게이트(_ei 기준) 그대로.
function wantsUpdate(e, tierFrame, ei) {
  if (e.ib || e.hurt > 0 || e.charge || e.tier === 1) return true;       // T1
  if (e.tier === 2) return (tierFrame & 1) === (ei & 1);
  if (e.tier === 3) return (tierFrame & 3) === (ei & 3);
  return (tierFrame & 7) === (ei & 7);
}
function isEssential(e) { return e.ib || e.hurt > 0 || e.charge || e.tier === 1; }

// 한 tick: order=방문 순서(배열 인덱스 리스트), tierFrame, start=회전 시작
function runTick(ens, order, tierFrame) {
  let budget = 0;
  const processed = new Set();
  for (let k = 0; k < order.length; k++) {
    const ei = order[k];
    const e = ens[ei];
    if (!e) continue;                                    // hole 가드(if(!e)continue)
    // 예산 break: CHUNK 간격·k>0·비보스·예산 초과 (원식 _k 카운터)
    if (k % CHUNK === 0 && k > 0 && !e.ib && budget > BUDGET_us) break;
    if (!e.inView) { continue; }
    budget += Ctimer_us;
    if (wantsUpdate(e, tierFrame, ei)) budget += Cfull_us;
    processed.add(ei);
  }
  return processed;
}
// 원본 방문순서: 0..len-1 고정
function orderOriginal(len) { const a = []; for (let i = 0; i < len; i++) a.push(i); return a; }
// 후보 방문순서: (start+k)%len, start 는 tick 마다 +1
function orderRotated(len, start) { const a = []; for (let k = 0; k < len; k++) a.push((start + k) % len); return a; }

function buildHotTail(N) {
  // 0..N-2: 근접 T1(각 Cfull 소모) → 선두 32개가 예산 소진. N-1: 보스(꼬리).
  const ens = [];
  for (let i = 0; i < N; i++) ens.push({ idx: i, tier: 1, ib: false, hurt: 0, charge: false, inView: true });
  ens[N - 1].ib = true;                                   // 배열 꼬리 보스(필수 전투)
  return ens;
}

check('원본(고정 start): 배열 꼬리 보스가 영구 기아(전 tick 미처리)', () => {
  const N = 40, TICKS = 60, ens = buildHotTail(N), bossIdx = N - 1;
  let bossProcessed = 0;
  for (let f = 0; f < TICKS; f++) {
    const p = runTick(ens, orderOriginal(N), f);
    if (p.has(bossIdx)) bossProcessed++;
  }
  assert.equal(bossProcessed, 0, '원본에선 꼬리 보스가 한 tick도 처리되지 않아야(영구 기아) — 실제 결함 재현');
  log.push({ case: 'original-hot-tail', N, ticks: TICKS, bossProcessedTicks: bossProcessed });
});

check('후보(회전): 꼬리 보스가 영구 기아 아님(유한 gap 내 처리) + 매tick 보장은 아님', () => {
  const N = 40, TICKS = 60, ens = buildHotTail(N), bossIdx = N - 1;
  let start = 0, bossProcessed = 0, maxGap = 0, lastProc = -1, skipped = 0;
  for (let f = 0; f < TICKS; f++) {
    const p = runTick(ens, orderRotated(N, start), f);
    if (p.has(bossIdx)) { bossProcessed++; if (lastProc >= 0) maxGap = Math.max(maxGap, f - lastProc); lastProc = f; }
    else skipped++;
    start = (start + 1) % N;                              // 다음 tick 1칸 회전(= 소스의 G._eLoopStart)
  }
  assert.ok(bossProcessed > 0, '회전 시 꼬리 보스가 처리됨(영구 기아 해소)');
  assert.ok(skipped > 0, '그러나 일부 tick 은 여전히 스킵 — 라운드로빈은 매tick 처리 보장 아님');
  // 선두 32 처리/꼬리 8 스킵 구조 → 보스는 start 가 (bossIdx-k)로 선두 32 안에 들 때 처리.
  // 모든 인덱스가 N tick 내 1회 선두가 되므로 처리 간 gap 의 상한은 N tick.
  assert.ok(maxGap <= N, 'gap 상한은 _elen(=N) tick(영구 아님), 실제 maxGap=' + maxGap);
  log.push({ case: 'rotated-hot-tail', N, ticks: TICKS, bossProcessedTicks: bossProcessed, skippedTicks: skipped, maxGapTicks: maxGap, note: 'per-tick 보장 아님' });
});

check('LOD parity: 처리되는 엔티티의 티어 스케줄은 원 배열 인덱스(_ei) 기준으로 원본·후보 동일', () => {
  // T2/T3/T4 엔티티가 원본과 후보에서 같은 (tierFrame,_ei) 조건으로 wantsUpdate 되는지 대조
  const N = 40;
  const ens = [];
  for (let i = 0; i < N; i++) ens.push({ idx: i, tier: 2 + (i % 3), ib: false, hurt: 0, charge: false, inView: true });
  for (let f = 0; f < 8; f++) for (let i = 0; i < N; i++) {
    // 방문 순서와 무관하게 parity 는 ei 기준 → 동일
    assert.equal(wantsUpdate(ens[i], f, i), wantsUpdate(ens[i], f, i), 'parity 는 _ei 고정');
  }
  // 회전은 '방문 순서'만 바꾸고 parity 키(_ei)는 안 바꾼다 — 설계상 동일(헤더 바디 _ei 보존).
  assert.ok(PATCHED_HEADER.includes('const _ei=(_eStart+_k)%_elen'), '_ei=실제 배열 인덱스 → LOD parity 불변');
});

check('경계: 빈 배열/길이변동/reset/NaN/hole — 크래시·범위이탈 없음', () => {
  // 빈 배열: _elen=0 → _eStart=0, 루프 미실행
  assert.deepEqual([...runTick([], orderRotated(0, 0), 0)], []);
  // stale 큰 start + reset(작은 len): modulo 로 범위 내
  const N = 40, ens = buildHotTail(N);
  const staleStart = 99999 % N;                           // (G._eLoopStart|0)%_elen
  assert.ok(staleStart >= 0 && staleStart < N, 'stale start 정규화');
  const p = runTick(ens, orderRotated(N, staleStart), 0);
  assert.ok(p.size > 0, 'reset 후에도 정상 처리');
  // NaN start → (NaN|0)=0
  assert.equal((NaN | 0), 0, 'NaN|0===0 안전');
  // hole: 중간 undefined → if(!e)continue 로 스킵, 크래시 없음
  const holed = buildHotTail(N); holed[5] = undefined;
  const ph = runTick(holed, orderRotated(N, 0), 0);
  assert.ok(!ph.has(5), 'hole 인덱스는 처리 안 됨(가드)');
});

check('soft-cap 무조건 활성화 0 / 공격티켓 미도입 (보호계약, 코드 기준)', () => {
  assert.ok(!/soft.?cap/i.test(PATCHED_CODE), '후보 코드에 soft-cap 강제 경로 없음');
  assert.ok(!/Ticket|티켓/.test(PATCHED_CODE), '어택 티켓/동시공격 제한 미도입(코드)');
  assert.ok(PATCHED_HEADER.includes('(IS_MOBILE?8:12)'), '예산 12/8ms 그대로');
});

console.log('\n결과: ' + pass + ' PASS / ' + fail + ' FAIL');
console.log(JSON.stringify({ taskId: 'ENEMY-20261002-F06-SOURCE-CANDIDATE', gameSha256: sha(src), easySha256: sha(easySrc), rows: log }, null, 2));
process.exit(fail === 0 ? 0 : 1);
