#!/usr/bin/env node
/* ============================================================================
 * QA-20261002-PERSISTENCE-REVIEW — 소형 독립 회귀 (read-only)
 *   실행: node tools/team-followup-20261001/QA/persistence-review-regression.mjs
 *
 * root 적용분: 양쪽 _doAiEnhance 의 `const res=aiEnhance(...)` 직후
 *   `if(res.used>0)dbSaveNow();`  (game.html L26922 / easy L25797)
 * 를 실제 공용 소스·SSOT와 독립 검수한다. BALANCE 기존 29검사를 복제하지 않고,
 * current callback(실제 aiEnhance + dbSaveNow/dbSaveForce)을 "원문 추출"하고
 * dbSave 는 "hold 가능한 전송 sink"로 대체해 저장진행중/창닫기를 결정적으로 재현한다.
 *
 * 사용자 세이브 미사용 — 메모리/소유 임시객체만. 게임/성능/빌드 미실행.
 * 경계(사실 유지): 500ms 이전 종료·기존 _saving 유실은 "해결"이라 하지 않는다.
 * 원본(저장 트리거 없음) 대비 "악화 여부"만 비교한다. busy 재시도는 BALANCE 과제.
 * ========================================================================= */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../');
const html = readFileSync(path.join(REPO, 'game.html'), 'utf8');
const easy = readFileSync(path.join(REPO, 'game-easy-test.html'), 'utf8');
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

function extractFn(src, name) {
  const sig = 'function ' + name + '(';
  const i = src.indexOf(sig); if (i < 0) throw new Error(name + ' 미발견');
  let d = 0, started = false;
  for (let k = i; k < src.length; k++) { const c = src[k]; if (c === '{') { d++; started = true; } else if (c === '}') { d--; if (started && d === 0) return src.slice(i, k + 1); } }
  throw new Error(name + ' 미종료');
}
// 적용된 호출부(2줄) 추출 — current callback
function extractCallSite(src) {
  const m = src.match(/const res=aiEnhance\(_aiItem,target,budget\);\n\s*if\(res\.used>0\)dbSaveNow\(\);/);
  return m ? m[0] : null;
}

let pass = 0, fail = 0; const fails = [], notes = [];
const check = (n, f) => { try { f(); pass++; console.log('  ✓ ' + n); } catch (e) { fail++; const m = e && e.message || e; fails.push(n + ' :: ' + m); console.log('  ✗ ' + n + '\n      ' + m); } };
const note = (m) => notes.push(m);

// ── 함수별 before/SHA 고정 (root 순차 수정용) ──
const FN = ['enhRate', '_malCost', 'enhCostRaw', 'enhCost', '_itemEconomyRarity', 'aiEnhance', 'dbSaveNow', 'dbSaveForce'];
const gameSrc = {}, easySrc = {};
for (const f of FN) { gameSrc[f] = extractFn(html, f); easySrc[f] = extractFn(easy, f); }
console.log('함수별 SHA-256(앞16) — game / easy:');
for (const f of FN) console.log('  ' + f.padEnd(20) + ' ' + sha(gameSrc[f]) + ' / ' + sha(easySrc[f]));

const callG = extractCallSite(html), callE = extractCallSite(easy);
console.log('호출부 current callback SHA — game ' + (callG ? sha(callG) : 'none') + ' / easy ' + (callE ? sha(callE) : 'none'));

check('P1 적용 확인: 양쪽 _doAiEnhance 에 if(res.used>0)dbSaveNow() 존재(current=patched)', () => {
  assert.ok(callG && callE, '양쪽 호출부 존재');
  assert.equal(callG, callE, '양쪽 호출부 동일');
});
check('P2 관련 함수 양쪽 동일(한 검수로 커버)', () => {
  for (const f of FN) assert.equal(gameSrc[f], easySrc[f], f + ' 양쪽 동일');
});

/* ── 실행 하니스: 실제 함수 + hold 가능 sink + 가짜 클럭 ── */
function makeCtx(mats, rng) {
  const timers = []; let _now = 0, seq = 1;
  const sink = { transmits: [], dropped: 0, hold: false, inflight: false };
  const ctx = {
    G: { mats }, Math: Object.assign(Object.create(Math), { random: rng }),
    _dbReady: true, _saving: false, _saveDebounce: null, _lastSaveTime: 0, _pendingForce: false,
    _MALICE_COST_MUL: 0.5,
    Date: { now: () => _now },
    setTimeout: (fn, ms) => { const id = seq++; timers.push({ id, at: _now + (ms || 0), fn }); return id; },
    clearTimeout: (id) => { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); },
    // 공유 악의 저장 모델
    _sharedMats: null, _saveSharedMats(v) { ctx._sharedMats = v; },
    __item: null, // 현재 강화 대상(공유악의+enh 스냅샷용)
    // hold 가능한 전송 sink (실제 dbSave 가드 미러: _saving 이면 no-op)
    dbSave() {
      if (!ctx._dbReady || ctx._saving) { sink.dropped++; return; }
      ctx._saving = true;
      ctx._saveSharedMats(ctx.G.mats);                       // 공유악의 persist (실제 dbSave L3527)
      sink.transmits.push({ at: _now, mats: ctx.G.mats, enh: ctx.__item ? ctx.__item.enh : null });
      if (sink.hold) { sink.inflight = true; return; }        // 전송 보류(in-flight)
      ctx.__complete();
    },
    __complete() {
      ctx._lastSaveTime = _now; ctx._saving = false; sink.inflight = false;
      if (ctx._pendingForce) { ctx._pendingForce = false; if (_now - ctx._lastSaveTime >= 5000) ctx.dbSave(); }
    },
  };
  ctx.window = ctx; vm.createContext(ctx);
  // 실제 함수 주입(원문)
  vm.runInContext(['enhRate', '_malCost', 'enhCostRaw', 'enhCost', '_itemEconomyRarity', 'aiEnhance', 'dbSaveNow', 'dbSaveForce'].map((f) => extractFn(html, f)).join('\n'), ctx);
  // current callback(실제 2줄과 동일 결정)
  vm.runInContext('function _persist(res){ if(res.used>0)dbSaveNow(); }', ctx);
  const advance = (ms) => { const end = _now + ms; while (true) { const due = timers.filter((t) => t.at <= end).sort((a, b) => a.at - b.at)[0]; if (!due) break; timers.splice(timers.indexOf(due), 1); _now = due.at; due.fn(); } _now = end; };
  return { ctx, sink, advance, release: () => { if (sink.inflight) ctx.__complete(); }, holdNext: () => { sink.hold = true; }, now: () => _now };
}
// 결정적 rng: 항상 성공(<rate) → 목표 즉시 달성 / 항상 실패(>=rate) → 소진
const RNG_OK = () => 0, RNG_FAIL = () => 0.9999;

function enhance(h, item, target, budget) { const res = h.ctx.aiEnhance(item, target, budget); h.ctx.__item = item; h.ctx._persist(res); return res; }

check('P3 성공(used>0) → 500ms 후 저장 1회·공유악의+enh persist', () => {
  const h = makeCtx(10_000_000, RNG_OK);
  const item = { enh: 0, rarity: 2 }; const res = enhance(h, item, 1, 5_000_000);
  assert.ok(res.used > 0 && res.ok); assert.equal(h.sink.transmits.length, 0, '디바운스 전 미전송');
  h.advance(500);
  assert.equal(h.sink.transmits.length, 1, '500ms 후 1회 전송');
  assert.equal(h.sink.transmits[0].enh, item.enh); assert.equal(h.ctx._sharedMats, h.ctx.G.mats, '공유악의 persist');
});

check('P4 실패(ok:false, used>0) → 저장 트리거됨(mats/enh 변동 반영)', () => {
  const h = makeCtx(60_000, RNG_FAIL);           // 소량 예산 → 전부 실패 소진
  const item = { enh: 0, rarity: 0 }; const res = enhance(h, item, 5, 60_000);
  assert.equal(res.ok, false); assert.ok(res.used > 0);
  h.advance(500); assert.equal(h.sink.transmits.length, 1, '실패라도 소비 있으면 저장');
});

check('P5 무시도(used=0/undefined) → 저장 없음', () => {
  // (a) 이미 목표 달성 → 조기 return(used undefined)
  const h1 = makeCtx(10_000_000, RNG_OK); const r1 = enhance(h1, { enh: 5, rarity: 0 }, 5, 1_000_000);
  assert.equal(r1.used, undefined); h1.advance(1000); assert.equal(h1.sink.transmits.length, 0);
  // (b) 악의 부족 조기 return
  const h2 = makeCtx(10, RNG_OK); const r2 = enhance(h2, { enh: 0, rarity: 0 }, 1, 1_000_000);
  assert.equal(r2.used, undefined); h2.advance(1000); assert.equal(h2.sink.transmits.length, 0);
});

check('P6 중복 500ms(2회 연속) → 디바운스 병합 → 전송 1회', () => {
  const h = makeCtx(10_000_000, RNG_OK);
  const it = { enh: 0, rarity: 1 };
  enhance(h, it, 1, 1_000_000); h.advance(200); enhance(h, it, 2, 1_000_000); // 200ms 내 재강화
  h.advance(500);
  assert.equal(h.sink.transmits.length, 1, '병합되어 1회만 전송');
});

check('P7 창닫기(500ms 이전 종료) → 디바운스 미발화 → 저장 안 됨 [해결 아님]', () => {
  const h = makeCtx(10_000_000, RNG_OK);
  const it = { enh: 0, rarity: 0 }; enhance(h, it, 1, 1_000_000);
  h.advance(300); // 300ms 시점에 창닫기(이후 타이머 미실행)
  assert.equal(h.sink.transmits.length, 0, '500ms 전 종료 → 미전송');
  note('창닫기(500ms 이전): 디바운스 미발화로 저장 안 됨 — 이 변경으로 "해결"되지 않음(손실 창만 ≤autosave10s → 500ms로 축소).');
});

check('P8 저장진행중(_saving) → 디바운스 dbSave no-op 드롭 [해결 아님, dbSaveNow는 _pendingForce 미설정]', () => {
  const h = makeCtx(10_000_000, RNG_OK);
  h.holdNext();                      // 다음 dbSave 는 in-flight 로 보류
  h.ctx.dbSave();                    // 외부 저장 시작(전송1, _saving=true 유지)
  assert.equal(h.sink.transmits.length, 1); assert.equal(h.ctx._saving, true);
  const it = { enh: 0, rarity: 0 }; enhance(h, it, 1, 1_000_000); // 강화 → dbSaveNow 500ms
  h.advance(500);
  assert.equal(h.sink.dropped, 1, '_saving 중이라 디바운스 dbSave 드롭');
  assert.equal(h.sink.transmits.length, 1, '강화분은 이 시점 미전송');
  assert.equal(h.ctx._pendingForce, false, 'dbSaveNow 경로는 _pendingForce 미설정 → 자동 재시도 없음');
  note('저장진행중: dbSaveNow 경로는 _saving 중 dbSave가 no-op이고 _pendingForce를 세우지 않아 강화분이 이 사이클에 유실될 수 있음 — 기존 한계로 "해결"이라 하지 않음. (busy 재시도는 BALANCE 과제)');
});

check('P9 공유 _saveDebounce: dbSaveForce 대기 중 dbSaveNow → force 취소·500ms dbSave 대체(데이터는 저장, 손실 아님)', () => {
  const h = makeCtx(10_000_000, RNG_OK);
  h.ctx._lastSaveTime = 0; // now=0, <5000 → dbSaveForce 는 _saveDebounce 에 재시도 예약
  h.ctx.dbSaveForce();
  assert.ok(h.ctx._saveDebounce != null, 'force 재시도가 _saveDebounce 점유');
  const it = { enh: 0, rarity: 0 }; enhance(h, it, 1, 1_000_000); // dbSaveNow 가 _saveDebounce 교체
  h.advance(500);
  assert.equal(h.sink.transmits.length, 1, '500ms dbSave 로 데이터 저장(손실 없음)');
  note('5저장분기: dbSaveNow/dbSaveForce가 _saveDebounce를 공유. 강화 시 대기 중 force가 취소되고 500ms 일반 dbSave로 대체됨 — 데이터는 더 빨리 저장되나 force 의미는 소실(원본 대비 persist 악화 아님).');
});

check('P10 원본 대비 악화 없음: 원본(저장 트리거 없음)은 500ms 시점 미전송, current는 전송', () => {
  // 원본 모델: 강화 후 저장 트리거 없음 → autosave(≤10s)/beforeunload 의존
  const ho = makeCtx(10_000_000, RNG_OK); const io = { enh: 0, rarity: 0 };
  ho.ctx.aiEnhance(io, 1, 1_000_000); /* 저장 트리거 없음 */ ho.advance(500);
  assert.equal(ho.sink.transmits.length, 0, '원본: 500ms 시점 미전송(autosave 대기)');
  const hc = makeCtx(10_000_000, RNG_OK); const ic = { enh: 0, rarity: 0 };
  enhance(hc, ic, 1, 1_000_000); hc.advance(500);
  assert.equal(hc.sink.transmits.length, 1, 'current: 500ms 시점 전송 → 손실 창 축소');
  note('원본 대비: current는 used>0에서 500ms 디바운스 저장을 추가 → 손실 창을 autosave(≤10s)에서 500ms로 축소. 새 손실/중복/과저장 경로는 추가되지 않음(무시도는 저장 안 함).');
});

console.log('\nPERSISTENCE 독립 회귀: ' + pass + ' PASS / ' + fail + ' FAIL');
if (notes.length) { console.log('검수 한계·주의:'); notes.forEach((n) => console.log('  - ' + n)); }
if (fail) { console.error('실패:\n - ' + fails.join('\n - ')); process.exit(1); }
process.exit(0);
