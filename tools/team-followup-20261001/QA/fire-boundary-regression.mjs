#!/usr/bin/env node
// QA-FIRE-BOUNDARY-REVIEW — 독립 회귀 (read-only, 게임/서버 미실행)
//
// 목적: 미커밋 fire 후보(root 소유 game.html)의 비동기 워밍업 "fire 예약 게이트"와 64MP 예산을
//       7개 경계로 독립 검증한다. 실제 production game.html 에서 함수를 추출해 돌리므로 재구현이 아니다.
//       game.html·test/*(공용)은 수정하지 않는다. 이 파일은 QA 소유 폴더 전용이다.
//
// 대상 함수(game.html 원문 추출): _warmAsyncTarget, _warmAsyncJob, _queueWarmFireAsync,
//   _texPrewarmSrc, _texPrePump, 상수 _WQ_ASYNC_PATHS/_WQ_ASYNC_FIRE_PATH.
//
// 경계: absent / late / cache / query / context / failure / first-use(+budget-reject)
//
// 사실 근거(측정치, root 산출과 교차확인):
//   fire_burst_radial.webp = 3584×1728 = 6,193,152 px
//   seed 32,204,920 + 3 primary(13,369,344 + 5,308,416 + 4,608,000) + fire = 61,683,832 ≤ 64,000,000 (여유 2,316,168)
//
// 경계(사실 유지): 이 회귀는 예약·예산 로직만 검증한다. GPU 완료·표시 FPS·매 루프 draw·실제 화면·
//   PC329ms·ring97ms 해결을 증명하지 않는다. 새 실측 release 없음.

import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const html = readFileSync(resolve(REPO, 'game.html'), 'utf8');

// game.html 에서 함수 1개를 중괄호 매칭으로 추출
function extractFn(name) {
  const sig = `function ${name}(`;
  const i = html.indexOf(sig);
  if (i < 0) throw new Error(`함수 ${name} 미발견`);
  let depth = 0, started = false;
  for (let k = i; k < html.length; k++) {
    const ch = html[k];
    if (ch === '{') { depth++; started = true; }
    else if (ch === '}') { depth--; if (started && depth === 0) return html.slice(i, k + 1); }
  }
  throw new Error(`함수 ${name} 중괄호 미종료`);
}
// 상수 3줄 추출
function extractConst(name) {
  const re = new RegExp(`const ${name}=[^\\n]*`);
  const m = html.match(re);
  if (!m) throw new Error(`상수 ${name} 미발견`);
  return m[0];
}

const ORIGIN = 'http://qa.local';
const PRIMARY = {
  '/assets/vfx/vfx_magic_burst.png': [3264, 4096],
  '/assets/vfx/boss/vfx_void_black.png': [2304, 2304],
  '/assets/vfx/vfx_peace_shield.png': [2400, 1920],
};
const FIRE = '/assets/vfx/fire_burst_radial.webp';
const FIRE_DIM = [3584, 1728];
const SEED_PX = 32204920; // 원래 시드 목록 합 (root 측정과 교차확인)
const abs = (p) => new URL(p, ORIGIN + '/game.html').href;

class HTMLImageElement {
  constructor(path, w, h) { this.src = abs(path); this.naturalWidth = w; this.naturalHeight = h; this.complete = true; }
}

function mkCtx() {
  const ctx = {
    HTMLImageElement, URL,
    _useGL: true,
    _texBySrc: new Map(),
    _texAdoptBitmap() {},
    createImageBitmap() { return new Promise(() => {}); }, // 디코드는 테스트에 불필요
    fetch() { return new Promise(() => {}); },             // 네트워크는 테스트에 불필요(예약 단계만 검증)
    Promise,
    _texPreJobs: new Map(), _texPreSeen: new Set(), _texPreQ: [], _texPreWait: [],
    _texPreBusy: 0, _texPrePx: 0,
    _TEXHOT_BUDGET_PX: 64e6, _TEXHOT_INFLIGHT: 2, _TEXHOT_QMAX: 4,
    _wqBuf: [], _wqLen: 0,
    location: { href: ORIGIN + '/game.html', origin: ORIGIN },
    performance: { now: () => 0 },
    console,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  const code = [
    extractConst('_WQ_ASYNC_PATHS'),
    extractConst('_WQ_ASYNC_FIRE_PATH'),
    extractFn('_texPrePump'),
    extractFn('_texPrewarmSrc'),
    extractFn('_warmAsyncTarget'),
    extractFn('_warmAsyncJob'),
    extractFn('_queueWarmFireAsync'),
  ].join('\n;');
  vm.runInContext(code, ctx);
  return ctx;
}

// primary 를 "라이브 pending 예약"으로 넣기 (query 경계 = 정상 예약 상태)
function reservePrimaries(ctx, { status = 'pending', context = 'self', dims = true } = {}) {
  for (const [p, d] of Object.entries(PRIMARY)) {
    const a = abs(p);
    ctx._texPreJobs.set(a, { src: a, context: context === 'self' ? ctx._texBySrc : context, status, bmp: null });
    ctx._texPreSeen.add(a);
    if (dims) ctx._texPrePx += d[0] * d[1];
  }
}
function putFireInQueue(ctx) {
  const img = new HTMLImageElement(FIRE, FIRE_DIM[0], FIRE_DIM[1]);
  ctx._wqBuf = [img]; ctx._wqLen = 1; return img;
}
const fireJob = (ctx) => ctx._texPreJobs.get(abs(FIRE));

const results = [];
function boundary(id, desc, fn) {
  try { const verdict = fn(); results.push({ id, desc, pass: true, verdict }); }
  catch (e) { results.push({ id, desc, pass: false, verdict: 'ASSERT 실패: ' + e.message }); }
}

// ── 1. first-use / baseline(정상 present): 시드+3primary+fire = 61,683,832, fire 예약됨 ──
boundary('baseline', 'present: 시드+3primary 뒤 fire 예약, 총합 64MP 이내', () => {
  const ctx = mkCtx();
  ctx._texPrePx = SEED_PX;                 // 시드 예약 반영
  reservePrimaries(ctx);                    // 3 primary 라이브 예약(+px)
  putFireInQueue(ctx);
  ctx._queueWarmFireAsync();
  assert.equal(fireJob(ctx)?.status, 'pending', 'fire 예약 pending');
  assert.equal(ctx._texPrePx, 61683832, '총 px 61,683,832');
  assert.equal(ctx._TEXHOT_BUDGET_PX - ctx._texPrePx, 2316168, '여유 2,316,168');
  assert.equal(ctx._texPreJobs.size, 4, 'job 4개(3 primary + fire)');
  return 'fire 예약 pending, 총 61,683,832 / 여유 2,316,168 — 예산 내 admit';
});

// ── 2. absent: primary 1개가 예약·캐시 없음 → fire 게이트 차단(미예약, lazy로) ──
boundary('absent', 'primary 부재 → fire 미예약(동기 fallback 유지)', () => {
  const ctx = mkCtx();
  // peace_shield 만 빼고 2개 예약
  const paths = Object.entries(PRIMARY);
  for (const [p, d] of paths.slice(0, 2)) { const a = abs(p); ctx._texPreJobs.set(a, { src: a, context: ctx._texBySrc, status: 'pending' }); ctx._texPreSeen.add(a); ctx._texPrePx += d[0] * d[1]; }
  const pxBefore = ctx._texPrePx;
  putFireInQueue(ctx);
  ctx._queueWarmFireAsync();
  assert.equal(fireJob(ctx), undefined, 'fire 미예약');
  assert.equal(ctx._texPrePx, pxBefore, 'px 불변(fire 예산 미소비)');
  return 'fire 미예약 → 부재 primary 예산 보존, fire 는 첫 사용 lazy 경로';
});

// ── 3. late: 수집 순서상 fire 가 primary 보다 먼저 _warmAsyncJob 되어도, 전체 패스 뒤 예약 ──
boundary('late', 'fire 선수집(게이트 차단) → primary 예약 후 deferred 패스에서 예약', () => {
  const ctx = mkCtx();
  const fireImg = putFireInQueue(ctx);
  ctx._warmAsyncJob(fireImg);               // primary 전 → 게이트 차단, 미예약
  assert.equal(fireJob(ctx), undefined, '선수집 시 fire 미예약');
  ctx._texPrePx = SEED_PX; reservePrimaries(ctx);
  ctx._queueWarmFireAsync();                 // 전체 패스에서 재시도
  assert.equal(fireJob(ctx)?.status, 'pending', 'deferred 패스에서 fire 예약');
  return '선수집 시 차단, primary 예약 후 deferred 패스에서 fire 예약 (수집 순서 역전 대응)';
});

// ── 4. cache: primary 가 이미 _texBySrc 업로드됨(job 없음) → fire 예약 허용 ──
boundary('cache', 'primary 캐시(업로드)됨 → fire 예약 허용', () => {
  const ctx = mkCtx();
  for (const p of Object.keys(PRIMARY)) ctx._texBySrc.set(abs(p), { w: 1, h: 1 });
  ctx._texPrePx = SEED_PX;
  putFireInQueue(ctx);
  ctx._queueWarmFireAsync();
  assert.equal(fireJob(ctx)?.status, 'pending', 'fire 예약');
  return 'primary 캐시 충족 → fire 예약 (추가 primary 예약 불필요)';
});

// ── 5. query: primary 가 라이브 pending job(현 컨텍스트) → fire 예약 허용 ──
boundary('query', 'primary 라이브 pending job 질의 → fire 예약 허용', () => {
  const ctx = mkCtx();
  ctx._texPrePx = SEED_PX; reservePrimaries(ctx, { status: 'pending' });
  putFireInQueue(ctx);
  ctx._queueWarmFireAsync();
  assert.equal(fireJob(ctx)?.status, 'pending', 'fire 예약');
  return 'primary 라이브 job(context 일치, status≠stale) → 게이트 통과';
});

// ── 6. context: primary job 이 이전 컨텍스트(복구 전) → fire 차단 ──
boundary('context', 'GL 복구 전 primary job(context 불일치) → fire 차단', () => {
  const ctx = mkCtx();
  const oldCtx = new Map(); // _texBySrc 와 다른 객체
  reservePrimaries(ctx, { context: oldCtx, status: 'pending' });
  putFireInQueue(ctx);
  ctx._queueWarmFireAsync();
  assert.equal(fireJob(ctx), undefined, 'context 불일치 → fire 미예약');
  return 'primary job.context ≠ 현 _texBySrc → 게이트 차단(복구 후 재예약까지 보류)';
});

// ── 7. failure: primary job status='failed'(현 컨텍스트) → fire 예약 허용 + 예산 교차확인 ──
boundary('failure', 'primary 실패(failed) → fire 예약 허용, 예산 내', () => {
  const ctx = mkCtx();
  ctx._texPrePx = SEED_PX; reservePrimaries(ctx, { status: 'failed' }); // 실패 primary px 는 환불되지 않음
  const totalWithFire = ctx._texPrePx + FIRE_DIM[0] * FIRE_DIM[1];
  putFireInQueue(ctx);
  ctx._queueWarmFireAsync();
  assert.equal(fireJob(ctx)?.status, 'pending', '실패 primary 는 fire 양보(게이트 통과)');
  assert.ok(totalWithFire <= 64e6, '실패 primary px 유지해도 fire 예산 내(61,683,832)');
  return '실패 primary 는 stale 아님 → 게이트 통과, px 미환불이나 총합 61,683,832 ≤ 64MP';
});

// ── 8. budget-reject (first-use fallback): 잔여 예산 < fire → fire 미예약, lazy ──
boundary('budget-reject', '잔여 예산 부족 → fire 미예약(첫 사용 동기 fallback)', () => {
  const ctx = mkCtx();
  for (const p of Object.keys(PRIMARY)) ctx._texBySrc.set(abs(p), { w: 1, h: 1 }); // primary 캐시(게이트 통과)
  ctx._texPrePx = 64e6 - 1; // 잔여 1px
  putFireInQueue(ctx);
  ctx._queueWarmFireAsync();
  assert.equal(fireJob(ctx), undefined, '예산 부족 → fire 미예약');
  assert.equal(ctx._texPrePx, 64e6 - 1, 'px 불변');
  return '게이트 통과해도 _texPrePx+px>budget → fire 미예약, 첫 사용 lazy 업로드';
});

// 출력
console.log('QA-FIRE-BOUNDARY-REVIEW 독립 회귀 (read-only, game.html 원문 추출)\n');
console.log('판정표');
console.log('─'.repeat(92));
for (const r of results) {
  console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.id.padEnd(14)} ${r.desc}`);
  console.log(`        └ ${r.verdict}`);
}
console.log('─'.repeat(92));
const fail = results.filter((r) => !r.pass).length;
console.log(`${results.length - fail}/${results.length} 경계 통과`);
console.log('\n경계: 이 회귀는 예약·예산 로직만 검증. GPU/표시FPS/실화면/PC329ms/ring97ms 해결 주장 없음. 새 실측 release 없음.');
process.exit(fail ? 1 : 0);
