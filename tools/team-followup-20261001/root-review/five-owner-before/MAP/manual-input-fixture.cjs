/* ============================================================================
 * manual-input-observer.js mock fixture (상태쓰기0 · 호출연결 검수)
 *   node tools/team-followup-20261001/MAP/manual-input-fixture.cjs
 * 검증:
 *   F1 상태쓰기0: 관측 중 K/P/G.map 미변경(관측기는 읽기만)
 *   F2 리스너/인터벌 정리: stop() 후 리스너 0, interval 정리
 *   F3 PASSIVE: 모든 관측 리스너가 passive:true(비캡처)로 등록
 *   F4 포커스손실 경계: blur → leg를 focus-lost로 종료, focusEvents 기록
 *   F5 전방벽 원식 읽기: 표본에 네이티브 isW 결과(gameWallAhead) 반영
 *   F6 abort 정리: _abort.abort() → 관측 중단 + 리스너/인터벌 정리
 *   F7 evidence gate 연결: 출력→judge() 투입, 미매핑/미방문8뷰 → PASS 아님(UNKNOWN)
 * 실게임/서버/브라우저 미기동. 관측기는 읽기전용, fixture가 가짜 입력을 구동.
 * ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const GATE = require('./m5-evidence-gate.cjs');
const OBS_SRC = fs.readFileSync(path.join(__dirname, 'manual-input-observer.js'), 'utf8');

let PASS = 0, FAIL = 0; const log = [];
function check(name, cond, detail) {
  if (cond) { PASS++; console.log('  PASS ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
  log.push({ name, ok: !!cond, detail: cond ? undefined : detail });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 이벤트 타겟 스텁(리스너 추적) ───────────────────────────────────────────
function makeTarget() {
  const set = new Set();
  return {
    hidden: false,
    addEventListener(type, fn, o) { set.add({ type, fn, o }); },
    removeEventListener(type, fn) { for (const l of set) if (l.type === type && l.fn === fn) set.delete(l); },
    dispatch(type) { for (const l of [...set]) if (l.type === type) l.fn({ type }); },
    _set: set,
    activeCount() { return set.size; },
    listOpts() { return [...set].map((l) => l.o); },
  };
}

// ── 가짜 게임 전역 설치 ─────────────────────────────────────────────────────
function makeMap() { const m = []; for (let y = 0; y < 200; y++) { const r = []; for (let x = 0; x < 200; x++) r.push(1); m.push(r); } m[153][166] = 0; return m; }
function installGlobals() {
  global.T = 40;
  global.G = { stage: 0, paused: false, mw: 200, mh: 200, cam: { x: 0, y: 0 }, map: makeMap() };
  global.P = { x: 6660, y: 6140, hp: 400 };
  global.K = {};
  // 네이티브 충돌 원식: 남측 y>=6300 벽. (관측기가 이 함수를 "읽기"로 호출)
  global.isW = (px, py /*, skipBone */) => (py >= 6300);
  const doc = makeTarget();
  const winT = makeTarget();
  global.document = doc;
  // 관측기 root=globalThis → globalThis.addEventListener/blur 경로 제공
  global.addEventListener = (t, f, o) => winT.addEventListener(t, f, o);
  global.removeEventListener = (t, f, o) => winT.removeEventListener(t, f, o);
  global.__winTarget = winT; global.__docTarget = doc;
  delete global.KeyboardEvent; delete global.BINDS;
  return { doc, winT };
}
function freshObserver() {
  try { delete global._m5manualApi; delete global._m5manualStart; delete global._m5manualCtl; delete global._m5manual; } catch (e) {}
  (0, eval)(OBS_SRC);
  const api = global._m5manualApi;
  if (!api || typeof api.start !== 'function') throw new Error('관측기 API 노출 실패');
  return api;
}

(async () => {
  const realSI = setInterval, realCI = clearInterval;

  // ── F1 상태쓰기0 (물리 없음: P/K/map 변동 없어야 함) ───────────────────────
  console.log('\n[F1] 상태쓰기0');
  {
    const t = installGlobals();
    const Pbefore = JSON.stringify(global.P);
    const mapBefore = JSON.stringify(global.G.map);
    const api = freshObserver();
    const ctl = api.start({ sampleMs: 20 });
    global.K.KeyS = true;          // 사용자가 S를 누름(관측 대상)
    await sleep(120);              // 물리 없음 → P 불변
    const kKeysDuring = Object.keys(global.K).sort().join(',');
    const res = ctl.stop();
    check('F1a P 좌표 미변경(관측기 쓰기 0)', JSON.stringify(global.P) === Pbefore, global.P.x + ',' + global.P.y);
    check('F1b G.map 미변경', JSON.stringify(global.G.map) === mapBefore);
    check('F1c K 미오염(사용자가 넣은 KeyS만)', kKeysDuring === 'KeyS' && global.K.KeyS === true, kKeysDuring);
    check('F1d mapUnchanged 보고', res.mapUnchanged === true && res.mapSig.before === res.mapSig.after);
    check('F1e 관측 표본 수집됨', res.legs.length >= 1 && res.legs[0].samples.length >= 1, 'legs=' + res.legs.length);
  }

  // ── F2/F3 리스너·인터벌 정리 + passive ──────────────────────────────────────
  console.log('\n[F2/F3] 정리 + passive');
  {
    const t = installGlobals();
    let live = new Set();
    global.setInterval = (fn, ms) => { const id = realSI(fn, ms); live.add(id); return id; };
    global.clearInterval = (id) => { live.delete(id); return realCI(id); };
    const api = freshObserver();
    const ctl = api.start({ sampleMs: 20 });
    const docActive = t.doc.activeCount(), winActive = t.winT.activeCount();
    const opts = [].concat(t.doc.listOpts(), t.winT.listOpts());
    global.K.KeyS = true; await sleep(60);
    ctl.stop();
    global.setInterval = realSI; global.clearInterval = realCI;
    check('F3a 리스너 등록됨(관측 중)', docActive >= 3 && winActive >= 1, 'doc=' + docActive + ' win=' + winActive);
    check('F3b 모든 리스너 passive:true', opts.length > 0 && opts.every((o) => o && o.passive === true), JSON.stringify(opts));
    check('F3c 비캡처(capture 미설정/false)', opts.every((o) => !o || o.capture === false || o.capture === undefined));
    check('F2a stop 후 document 리스너 0', t.doc.activeCount() === 0, 'remain=' + t.doc.activeCount());
    check('F2b stop 후 window 리스너 0', t.winT.activeCount() === 0, 'remain=' + t.winT.activeCount());
    check('F2c stop 후 interval 정리', live.size === 0, 'live=' + live.size);
  }

  // ── F4 포커스손실 경계 ──────────────────────────────────────────────────────
  console.log('\n[F4] 포커스손실 경계');
  {
    const t = installGlobals();
    const api = freshObserver();
    const ctl = api.start({ sampleMs: 20 });
    global.K.KeyS = true; await sleep(60);
    t.winT.dispatch('blur');       // 사용자가 포커스를 잃음
    await sleep(40);
    const res = ctl.stop();
    check('F4a focusEvents에 blur 기록', res.focusEvents.some((e) => e.type === 'blur'), JSON.stringify(res.focusEvents));
    check('F4b leg가 focus-lost로 종료', res.legs.some((l) => l.stopReason === 'focus-lost'), JSON.stringify(res.legs.map((l) => l.stopReason)));
  }

  // ── F5 전방벽 원식(네이티브 isW) 읽기 — 물리로 벽까지 이동 ───────────────────
  console.log('\n[F5] 전방벽 원식 읽기');
  {
    const t = installGlobals();
    // 물리: K.KeyS 눌림 동안 남으로 8px/20ms, 남측벽 6300 clamp (관측기와 무관, fixture 구동)
    const phys = realSI(() => { if (global.K.KeyS) global.P.y = Math.min(global.P.y + 8, 6300); }, 20);
    const api = freshObserver();
    const ctl = api.start({ sampleMs: 20 });
    global.K.KeyS = true;
    await sleep(600);              // 6140→6300 도달, 전방(y+20)>=6300 → 벽
    const res = ctl.stop();
    realCI(phys);
    const flat = res.legs.flatMap((l) => l.samples);
    check('F5a gameWallAhead(원식) true 표본 존재', flat.some((s) => s.gameWallAhead === true), 'maxY=' + Math.max(...flat.map((s) => s.y)));
    check('F5b 원식 값이 isW와 일치', flat.every((s) => s.gameWallAhead === (s.y + 20 >= 6300)), 'mismatch');
    check('F5c 현재좌표 전진 관측(실이동 표본)', Math.max(...flat.map((s) => s.y)) > 6250);
    check('F5d held=true 관측', flat.every((s) => s.held === true));
    // F7에서 재사용
    global.__F5result = res;
  }

  // ── F6 abort 정리 ───────────────────────────────────────────────────────────
  console.log('\n[F6] abort 정리');
  {
    const t = installGlobals();
    let live = new Set();
    global.setInterval = (fn, ms) => { const id = realSI(fn, ms); live.add(id); return id; };
    global.clearInterval = (id) => { live.delete(id); return realCI(id); };
    const api = freshObserver();
    const ctl = api.start({ sampleMs: 20 });
    global.K.KeyS = true; await sleep(40);
    ctl._abort.abort();
    await sleep(60);               // 다음 tick에서 external-abort로 stop
    global.setInterval = realSI; global.clearInterval = realCI;
    check('F6a abort 후 관측 중단', ctl.isRunning() === false);
    check('F6b abort 후 리스너 0', t.doc.activeCount() === 0 && t.winT.activeCount() === 0);
    check('F6c abort 후 interval 정리', live.size === 0, 'live=' + live.size);
    const r = ctl.getResult();
    check('F6d stopReason=external-abort', r && r.stopReason === 'external-abort', r && r.stopReason);
  }

  // ── F7 evidence gate 연결 ───────────────────────────────────────────────────
  console.log('\n[F7] evidence gate 연결');
  {
    const api = freshObserver(); // API만 필요(toGateBundle)
    const res = global.__F5result;
    // 미매핑 + 뷰 없음 → 경계 미방문(UNKNOWN), 8뷰 UNKNOWN → PASS 금지
    const bundle = api.toGateBundle(res, {}); // boundaryMap/views 없음
    const r = GATE.judge(bundle);
    check('F7a 미매핑 관측 → verdict≠PASS', r.verdict !== 'PASS', r.verdict);
    check('F7b 4경계 모두 UNKNOWN(미방문)', Object.values(r.boundaries).every((b) => b.grade === 'UNKNOWN'), JSON.stringify(Object.keys(r.boundaries).map((k) => k + ':' + r.boundaries[k].grade)));
    check('F7c 8뷰 미완 차단', (r.passForbiddenReason || []).some((x) => x.indexOf('8뷰') === 0));
    check('F7d 좌표계약 평가(네이티브 isW): 접근=비벽 PASS', r.coords.approach.grade === 'PASS', JSON.stringify(r.coords.approach));
    // boundaryMap으로 관측 leg를 A_enter_south에 매핑하면 gate가 실제 등급 산출(여전히 8뷰 UNKNOWN→PASS 금지)
    const firstLeg = res.legs.find((l) => l.dir === 'S');
    const bundle2 = api.toGateBundle(res, { boundaryMap: { [firstLeg.name]: 'A_enter_south' } });
    const r2 = GATE.judge(bundle2);
    check('F7e 매핑 시 A_enter_south 등급 산출(미UNKNOWN)', r2.boundaries.A_enter_south.grade !== 'UNKNOWN', JSON.stringify(r2.boundaries.A_enter_south));
    check('F7f 그래도 8뷰 없어 PASS 금지', r2.verdict !== 'PASS', r2.verdict);
  }

  console.log('\n==== 결과: ' + PASS + ' PASS / ' + FAIL + ' FAIL ====');
  console.log('MANUAL_FIXTURE_JSON ' + JSON.stringify({ pass: PASS, fail: FAIL, results: log }));
  process.exit(FAIL ? 1 : 0);
})();
