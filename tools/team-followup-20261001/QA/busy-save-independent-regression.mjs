#!/usr/bin/env node
/* ============================================================================
 * QA-busy-save-independent — BALANCE save-inflight 후보 독립 반례 시도 (read-only)
 *   실행: node tools/team-followup-20261001/QA/busy-save-independent-regression.mjs
 *
 * 대상(미적용): BALANCE/save-inflight-candidate.mjs
 *   - dbSaveNow: request 스냅샷{charId,charIdx,P,save} 캡처. 디바운스 발화 시 컨텍스트
 *     불일치면 abort, _saving 중이면 dbSaveNow.pending=request 로 보류.
 *   - _drainPendingSaveNow(): 모든 _saving=false 직후 호출 → pending 을 현재 컨텍스트와
 *     대조 후 dbSaveNow() 재호출(재디바운스).
 *
 * 목적: pending/drain·캐릭터 전환·실패/force 경쟁에서 "잘못된 저장/요청유실" 반례를
 *   1개 이상 시도한다. 기존 29테스트 복제 아님. 후보 함수를 "원문 추출"하고 dbSave 는
 *   "요청시점 직렬화 + 완료 분리"가 가능한 fake sink 로 대체한다. 실제 사용자 세이브 0.
 *
 * 경계: 성능/완전해결 주장 없음. 후보는 미적용. 발견한 반례는 최소 재현으로 남긴다.
 * ========================================================================= */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { saveNowCandidate } from '../../../tools/team-followup-20261001/BALANCE/save-inflight-candidate.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../');
const html = readFileSync(path.join(REPO, 'game.html'), 'utf8');

let pass = 0, fail = 0; const fails = [], notes = [], repros = [];
const check = (n, f) => { try { f(); pass++; console.log('  ✓ ' + n); } catch (e) { fail++; const m = e && e.message || e; fails.push(n + ' :: ' + m); console.log('  ✗ ' + n + '\n      ' + m); } };
const note = (m) => notes.push(m);
const repro = (m) => repros.push(m);

// ── 정적 검사: 모든 _saving=false 사이트가 후보 diff에서 drain 되는가 ──
check('S1 게임 _saving=false 사이트 전부 _drainPendingSaveNow 대상(diff 누락 없음)', () => {
  const diff = readFileSync(path.join(REPO, 'tools/team-followup-20261001/BALANCE/save-inflight-candidate.diff'), 'utf8');
  const total = (html.match(/_saving=false;/g) || []).length;        // 선언 1 + 토글 3
  const decl = (html.match(/let _saving=false;/g) || []).length;     // 선언 1
  const toggles = total - decl;                                      // 실제 토글
  const drainAdds = (diff.match(/_saving=false;_drainPendingSaveNow\(\);/g) || []).length; // game+easy 합
  note(`게임 _saving=false 토글 ${toggles}곳, diff 내 drain 삽입(game+easy) ${drainAdds}곳`);
  assert.equal(toggles, 3, '게임 토글 정확히 3곳');
  assert.ok(drainAdds >= toggles, 'diff가 모든 토글에 drain 삽입(game+easy 합산)');
});

/* ── fake sink 하니스: 후보 함수 원문 + 요청시점 직렬화 + 완료 분리 ── */
function makeCtx(opts = {}) {
  const timers = []; let _now = 0, seq = 1;
  const sink = { transmits: [], dropped: 0, hold: false, inflight: null };
  const ctx = {
    _dbReady: true, _saving: false, _saveDebounce: null, _lastSaveTime: 0, _pendingForce: false,
    _charId: opts.charId || 'A', _charIdx: opts.charIdx ?? 0, P: opts.P || { id: 'PA' }, G: { mats: 1000 },
    Date: { now: () => _now },
    setTimeout: (fn, ms) => { const id = seq++; timers.push({ id, at: _now + (ms || 0), fn }); return id; },
    clearTimeout: (id) => { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); },
    console,
  };
  // fake dbSave: 요청시점에 charId/charIdx/P 를 "직렬화"(캡처)하고, 완료를 분리(hold)
  ctx.dbSave = function dbSave() {
    if (!ctx._dbReady || ctx._saving) { sink.dropped++; return; }
    ctx._saving = true;
    const rec = { at: _now, charId: ctx._charId, charIdx: ctx._charIdx, pRef: ctx.P, mats: ctx.G.mats };
    if (sink.hold) { sink.inflight = rec; return; }     // 완료 분리: release 때 확정
    sink.transmits.push(rec); ctx.__finish();
  };
  ctx.__finish = function () {
    // 패치된 finally 미러: _saving=false; _drainPendingSaveNow(); force 처리
    ctx._saving = false; ctx._drainPendingSaveNow();
    if (ctx._pendingForce) { ctx._pendingForce = false; if (ctx.Date.now() - ctx._lastSaveTime >= 5000) ctx.dbSave(); }
    ctx._lastSaveTime = _now;
  };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(saveNowCandidate, ctx);              // 후보 원문: dbSaveNow + _drainPendingSaveNow
  const advance = (ms) => { const end = _now + ms; while (true) { const due = timers.filter((t) => t.at <= end).sort((a, b) => a.at - b.at)[0]; if (!due) break; timers.splice(timers.indexOf(due), 1); _now = due.at; due.fn(); } _now = end; };
  const releaseInflight = () => { if (sink.inflight) { sink.transmits.push(sink.inflight); const r = sink.inflight; sink.inflight = null; sink.hold = false; ctx.__finish(); return r; } }; // 차단 저장 완료 후 후속 저장은 정상 진행
  return { ctx, sink, advance, releaseInflight, now: () => _now };
}

/* ── C1 설계 목적 동작: busy 중 dbSaveNow → pending → 완료 시 drain → 재디바운스 후 저장 ── */
check('C1 busy-defer 보완: _saving 중 발화 → pending 보류 → 완료 drain → 저장됨', () => {
  const h = makeCtx();
  h.sink.hold = true; h.ctx.dbSave();            // 외부 저장 in-flight (_saving=true, 미확정)
  assert.equal(h.ctx._saving, true);
  h.ctx.dbSaveNow(); h.advance(500);             // 디바운스 발화 → busy → pending 보류
  assert.equal(h.ctx.dbSaveNow.pending != null, true, 'pending 보류됨');
  assert.equal(h.sink.transmits.length, 0, '아직 저장 전(in-flight만)');
  h.releaseInflight();                           // in-flight 완료 → drain → dbSaveNow() 재디바운스
  assert.equal(h.ctx.dbSaveNow.pending, null, 'drain 이 pending 소비');
  h.advance(500);                                // 재디바운스 발화 → 저장
  assert.equal(h.sink.transmits.length, 2, '최초 in-flight 1 + 보류분 1 = 2 저장');
});

/* ── C2 [반례 시도] drain 은 즉시 저장이 아니라 재디바운스 → 완료 후 500ms 내 종료 시 유실 ── */
check('C2 반례: drain 후 500ms 이전 종료 → 보류분 유실 (재디바운스 때문)', () => {
  const h = makeCtx();
  h.sink.hold = true; h.ctx.dbSave();
  h.ctx.dbSaveNow(); h.advance(500);             // pending 보류
  h.releaseInflight();                           // 완료 → drain → 재디바운스(아직 미저장)
  h.advance(300);                                // 300ms 뒤 창닫기(타이머 미실행)
  assert.equal(h.sink.transmits.length, 1, 'in-flight 1만 저장, 보류분은 미저장');
  repro('drain 이 dbSave() 즉시 호출이 아니라 dbSaveNow() 재디바운스(+500ms) → in-flight 완료 직후 500ms 내 종료 시 busy-보류분 유실. 최소재현: hold dbSave→dbSaveNow→500ms→release→300ms→close ⇒ transmits=1(보류분 없음). 원본(drain 없음)은 항상 유실이므로 회귀는 아니나 "완전 배수"는 아님.');
});

/* ── C3 캐릭터 전환: pending 이 전환 후 drain 에서 abort → 잘못된(다른 캐릭) 저장 없음 ── */
check('C3 캐릭터 전환: busy 중 pending 뒤 char 전환 → drain abort, 他캐릭 저장 안 함', () => {
  const h = makeCtx({ charId: 'A', charIdx: 0 });
  h.sink.hold = true; h.ctx.dbSave();            // char A in-flight
  h.ctx.dbSaveNow(); h.advance(500);             // pending(A) 보류
  // 캐릭터 전환: charId/charIdx/P 모두 교체 (게임의 P=mkP()·_charId 갱신 반영)
  h.ctx._charId = 'B'; h.ctx._charIdx = 1; h.ctx.P = { id: 'PB' };
  h.releaseInflight();                           // 완료 → drain: pending(A) vs 현재(B) 불일치 → abort
  assert.equal(h.ctx.dbSaveNow.pending, null, 'pending 소비(abort)');
  h.advance(1000);
  // 저장은 in-flight(A) 1건뿐. B 행에 A의 보류분을 쓰거나, A 데이터를 B로 쓰는 일 없음
  assert.equal(h.sink.transmits.length, 1, 'in-flight 1건만; 전환 후 재디바운스 저장 없음');
  assert.equal(h.sink.transmits[0].charId, 'A', '저장된 것은 in-flight 당시 A');
  note('캐릭터 전환 시 drain abort 는 안전(잘못된 캐릭 저장 방지). 단 A의 busy-보류 변경은 전환 경로가 별도로 저장하지 않으면 유실 — 이는 전환 경로 책임(후보가 악화시키지 않음).');
});

/* ── C4 캐릭터 전환이 "재디바운스 500ms 창"에서 발생 → 재디바운스도 abort(잘못된 저장 없음) ── */
check('C4 재디바운스 창 중 전환: 재무장된 저장도 컨텍스트 불일치로 abort', () => {
  const h = makeCtx({ charId: 'A', charIdx: 0 });
  h.sink.hold = true; h.ctx.dbSave();
  h.ctx.dbSaveNow(); h.advance(500);
  h.releaseInflight();                           // drain → 재디바운스(A 컨텍스트)
  h.ctx._charId = 'B'; h.ctx.P = { id: 'PB' };   // 재디바운스 발화 전 전환
  h.advance(500);                                // 재디바운스 발화 → request(A)!==현재(B) → abort
  assert.equal(h.sink.transmits.length, 1, '전환 후 재디바운스 저장 없음(잘못된 저장 0)');
  assert.equal(h.sink.transmits.some((t) => t.charId === 'B'), false, 'B 행에 A 보류분 기록 없음');
});

/* ── C5 실패/force 경쟁: 완료 epilogue 에서 drain + _pendingForce 동시 → 유실 없음(중복 저장 가능) ── */
check('C5 force 경쟁: busy 중 pending + _pendingForce → 완료 시 유실 없음(중복 저장 허용)', () => {
  const h = makeCtx();
  h.sink.hold = true; h.ctx.dbSave();
  h.ctx.dbSaveNow(); h.advance(500);             // pending 보류
  h.ctx._pendingForce = true; h.ctx._lastSaveTime = -10000; // 5초 경과 상태로 force 즉시조건
  h.releaseInflight();                           // __finish: drain(재디바운스) + force 즉시 dbSave
  // force 경로가 즉시 저장(≥5000) → 보류분 포함 현재상태 저장됨
  assert.ok(h.sink.transmits.length >= 2, 'force 즉시 저장으로 보류분 유실 없음');
  h.advance(500);                                // 재디바운스도 발화 → 중복 저장 가능
  assert.ok(h.sink.transmits.length >= 2, '유실 없음(중복 저장은 무해)');
  note('실패/force 경쟁: drain(재디바운스)과 _pendingForce(≥5s 즉시 dbSave)가 같은 완료 epilogue에서 모두 동작 → 데이터 유실 없음. 동일 상태 중복 저장이 발생할 수 있으나 무해(과저장).');
});

/* ── C6 컨텍스트 체크 민감도: charIdx 변경만으로도 abort (전환 감지) ── */
check('C6 charIdx 변경만으로도 drain abort (컨텍스트 체크 유효)', () => {
  const h = makeCtx({ charId: 'A', charIdx: 0 });
  h.sink.hold = true; h.ctx.dbSave();
  h.ctx.dbSaveNow(); h.advance(500);
  h.ctx._charIdx = 1;                            // 같은 charId, charIdx만 변경
  h.releaseInflight();
  assert.equal(h.ctx.dbSaveNow.pending, null);
  h.advance(500);
  assert.equal(h.sink.transmits.length, 1, 'charIdx 불일치로 재저장 안 함');
});

console.log('\nBUSY-SAVE 독립 반례 시도: ' + pass + ' PASS / ' + fail + ' FAIL');
if (repros.length) { console.log('발견 반례(최소 재현):'); repros.forEach((r) => console.log('  ! ' + r)); }
if (notes.length) { console.log('검수 범위·한계:'); notes.forEach((n) => console.log('  - ' + n)); }
if (fail) { console.error('실패:\n - ' + fails.join('\n - ')); process.exit(1); }
process.exit(0);
