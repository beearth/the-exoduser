/* ENEMY-TYPE3-PROBE-FIX — 모의 검증 하니스 (Node, 브라우저/게임 미실행)
 *
 * et3-probe.fixed.js 의 5개 교정이 실제로 동작하는지 결정적 모의로 확인한다.
 * 게임 로직은 game.html HEAD 30a204a7 의 자연 탄막 경로를 축약 재현한다:
 *   case'idle': projT-=sp; if(projT<=0 && d<range){ projT=projCd; _projChargeT=60 }   (38966~38976)
 *   _tickProjCharge: _projChargeT-=sp; if(<=0) _fireChargedProj(e)                     (18890~18893)
 *   _fireChargedProj: spawnProj({_commit:true}) 1발 + _cancelProjCharge               (18860~18889)
 *
 * 주입 호스트(makeTestHost)로 lexical G/P/ens/projs/ETYPE_RANGE/_gameFrame 와 함수 전역
 * 바인딩을 모사한다. 내부 발사 호출부는 game.html 처럼 '전역명(=레지스트리)'을 해석하도록
 * fnReg._fireChargedProj(e) 로 호출해 프로브 wrapper 가 가로채게 한다.
 *
 * 실행: node tools/team-followup-20261001/ENEMY/et3-probe.mock.test.mjs
 */
import assert from 'assert';
// 프로브는 type:module 환경에서 ESM 로 로드되며 IIFE 가 globalThis 에 팩토리를 등록한다.
await import('./enemy-support-probe.js');
const createProbe = globalThis.__createET3Probe;
const makeBrowserHost = globalThis.__makeET3BrowserHost;
const OWN = '__et3probe';
assert.strictEqual(typeof createProbe, 'function', '프로브 로드 실패: __createET3Probe 미등록');

let passCount = 0, failCount = 0;
function check(name, fn) {
  try { fn(); console.log('  PASS  ' + name); passCount++; }
  catch (e) { console.log('  FAIL  ' + name + '\n        ' + (e && e.message)); failCount++; }
}

// ── 모의 게임 월드 ──
function makeWorld(opts) {
  opts = opts || {};
  const scope = {
    G: { on: true, paused: false, stage: 0 },
    P: { x: 0, y: 0, r: 12, iframes: 0 },
    ens: [],
    projs: [],
    ETYPE_RANGE: [], // index 3 = 200
    _gameFrame: 0
  };
  scope.ETYPE_RANGE[3] = 200;
  const fnReg = {};
  const rafQueue = [];

  // orig _fireChargedProj: 커밋(projs push) + 차징 해제. commit=false 면 커밋 실패 모사.
  fnReg._fireChargedProj = function (e) {
    if (opts.commit !== false) scope.projs.push({ from: e, el: e.el, _commit: true });
    e._projChargeT = 0; e._projChargeBean = null;   // _cancelProjCharge 축약
    e._fired = (e._fired || 0) + 1;
  };
  fnReg._spawnBossProjectile = function (/*e, shot*/) { /* 에지 경로: 기본 미사용 */ };

  const host = {
    getG: () => scope.G, getP: () => scope.P, getEns: () => scope.ens,
    getProjs: () => scope.projs, getRange: () => scope.ETYPE_RANGE,
    getTick: () => scope._gameFrame,
    getFn: (n) => (typeof fnReg[n] === 'function' ? fnReg[n] : null),
    setFn: (n, fn) => { fnReg[n] = fn; },
    raf: (cb) => { rafQueue.push(cb); return rafQueue.length; },
    caf: () => { rafQueue.length = 0; }
  };

  function mkEt3(extra) {
    return Object.assign({
      alive: true, etype: 3, ib: false, _isRare: false, _isDecoy: false,
      s: 'idle', x: 220, y: 0, r: 10, el: 0,            // d=220 (사거리 200 밖에서 시작)
      projT: 30, projCd: 240, _projChargeT: 0, st2: 0, _frozen: 0, stunned: 0
    }, extra || {});
  }

  // 1 physics tick 전진 (sp=1): idle 차징 개시 → _tickProjCharge → 발사
  function stepTick() {
    scope._gameFrame++;
    const sp = 1;
    for (const e of scope.ens) {
      if (!e.alive) continue;
      const d = Math.hypot(scope.P.x - e.x, scope.P.y - e.y);
      // _tickProjCharge 먼저(게임 순서: 37337 이 switch 38915 보다 앞)
      if (e._projChargeT > 0) { e._projChargeT -= sp; if (e._projChargeT <= 0) fnReg._fireChargedProj(e); }
      // case'idle' 차징 개시
      if (e.s === 'idle' && e._projChargeT <= 0 && !e._fired && e.projCd < 9000) {
        e.projT -= sp;
        const R = scope.ETYPE_RANGE[e.etype] || 700;
        if (e.projT <= 0 && d < R) { e.projT = e.projCd; e._projChargeBean = 'normal'; e._projChargeT = 60; }
      }
    }
  }
  // rAF 큐에 쌓인 콜백을 n회 실행(프로브 sample). rafTimes>1 = 고주사율 모사.
  function pumpRaf(rafTimes) {
    for (let i = 0; i < (rafTimes || 1); i++) {
      const cbs = rafQueue.splice(0, rafQueue.length);
      for (const cb of cbs) cb();
    }
  }
  return { scope, fnReg, host, mkEt3, stepTick, pumpRaf };
}

console.log('ENEMY-TYPE3-PROBE-FIX 모의 검증\n');

// ── F1: 브라우저 호스트는 Node 에서 베어 G 가 없어 null — 원본 root.G 가 왜 undefined였는지 증명 ──
check('F1 lexical: makeBrowserHost().getG() == null (window.G 미노출 재현)', () => {
  const bh = makeBrowserHost();
  assert.strictEqual(bh.getG(), null, 'Node/비노출 환경에서 베어 G 접근은 null 이어야');
  assert.strictEqual(bh.getP(), null);
  assert.strictEqual(bh.getProjs(), null);
});

// ── 시나리오 A: 실제 발사 ──
check('A 실제 발사: idle→차징→커밋 PASS, chargeStart 포착(F2), commit 확인(F3), sim-tick(F4)', () => {
  const w = makeWorld();
  const probe = createProbe(w.host);
  w.scope.ens.push(w.mkEt3({ x: 150 }));   // 사거리 200 안
  probe.install();
  let fired = false;
  for (let i = 0; i < 400 && !fired; i++) {
    w.stepTick();
    w.pumpRaf(1);
    if (w.scope.ens[0]._fired) fired = true;
  }
  const r = probe.stop();
  assert.strictEqual(r.verdict, 'PASS', 'verdict=' + r.verdict + ' reasons=' + JSON.stringify(r.reasons));
  assert.ok(r.firstFire && r.firstFire.committed === true, 'committed 이어야');
  assert.ok(r.firstFire.projsDelta >= 1, 'projs 증가 확인');
  assert.ok(r.chargeStart && typeof r.chargeStart.tick === 'number', 'F2: 차징 개시 포착(projT 리셋에도)');
  assert.strictEqual(r.tickSource, '_gameFrame', 'F4: tick 소스=_gameFrame');
  assert.ok(r.firstFire.tickSinceChargeStart >= 55 && r.firstFire.tickSinceChargeStart <= 70,
    'F4: 차징→발사 간격 sim-tick ≈60, got ' + r.firstFire.tickSinceChargeStart);
});

// ── F3 보강: _fireChargedProj 호출됐으나 커밋 실패(projs 미증가) → PASS 아님 ──
check('F3 커밋실패: 호출만 있고 projs 미증가 → FAIL_PATH (호출만으로 PASS 금지)', () => {
  const w = makeWorld({ commit: false });
  const probe = createProbe(w.host);
  w.scope.ens.push(w.mkEt3({ x: 150 }));
  probe.install();
  for (let i = 0; i < 400; i++) { w.stepTick(); w.pumpRaf(1); if (w.scope.ens[0]._fired) break; }
  const r = probe.stop();
  assert.strictEqual(r.verdict, 'FAIL_PATH', 'verdict=' + r.verdict);
  assert.ok(!r.firstFire, 'firstFire 확정되면 안 됨');
  assert.ok(r.pendingFire, 'pendingFire(커밋 미확인) 기록되어야');
});

// ── F4 dedup: 고주사율(1 tick당 rAF 2회)이어도 residency 는 sim-tick 단위로만 증가 ──
check('F4 dedup: rAF 2×/tick 에도 inRangeTicks ≤ 경과 sim-tick', () => {
  const w = makeWorld();
  const probe = createProbe(w.host);
  w.scope.ens.push(w.mkEt3({ x: 150, projCd: 9999, projT: 9999 })); // 발사 안 하게(projCd≥9000)
  probe.install();
  const N = 50;
  for (let i = 0; i < N; i++) { w.stepTick(); w.pumpRaf(2); }  // tick당 rAF 2회
  const r = probe.stop();
  assert.ok(r.residency.inRangeTicks <= N, 'rAF 수가 아닌 sim-tick 로 집계: inRange=' + r.residency.inRangeTicks + ' ≤ ' + N);
  assert.ok(r.residency.inRangeTicks >= N - 2, 'tick 당 1회 근접 집계: ' + r.residency.inRangeTicks);
  assert.ok(r.residency.aliveTicks <= N, 'alive 도 sim-tick: ' + r.residency.aliveTicks);
});

// ── 시나리오 B: 무발사(사거리 체류하나 차징 미발동) → FAIL_NO_FIRE ──
check('B 무발사: 장기 사거리 체류·생존·발사0 → FAIL_NO_FIRE', () => {
  const w = makeWorld();
  const probe = createProbe(w.host);
  w.scope.ens.push(w.mkEt3({ x: 150, projCd: 9999, projT: 9999 })); // 차징 자체가 시작 안 함
  probe.install();
  for (let i = 0; i < 470; i++) { w.stepTick(); w.pumpRaf(1); }     // budget 450 초과 체류
  const r = probe.stop();
  assert.strictEqual(r.verdict, 'FAIL_NO_FIRE', 'verdict=' + r.verdict + ' residency=' + JSON.stringify(r.residency));
  assert.ok(r.residency.inRangeTicks >= 120 && r.residency.aliveTicks >= r.budgetTicks, '체류/생존 조건');
});

// ── 시나리오 C: 대상 교체 금지 — 포착 대상 사망 시 혼합 없이 종료 ──
check('C 대상교체: 포착 etype3 사망 → targetLost INCONCLUSIVE, 2번째 개체와 혼합 안 함', () => {
  const w = makeWorld();
  const probe = createProbe(w.host);
  const e1 = w.mkEt3({ x: 150, projCd: 9999, projT: 9999 });
  w.scope.ens.push(e1);
  probe.install();
  for (let i = 0; i < 30; i++) { w.stepTick(); w.pumpRaf(1); }
  const inRangeBefore = probe.inRangeTicks;
  e1.alive = false;                                   // 포착 대상 사망
  const e2 = w.mkEt3({ x: 150, projCd: 9999, projT: 9999 });
  w.scope.ens.push(e2);                               // 새 etype3 등장
  for (let i = 0; i < 60; i++) { w.stepTick(); w.pumpRaf(1); }
  const r = probe.stop();
  assert.strictEqual(r.targetLost, true, 'targetLost 여야');
  assert.strictEqual(r.verdict, 'INCONCLUSIVE', 'verdict=' + r.verdict);
  assert.ok(r.residency.inRangeTicks <= inRangeBefore + 2,
    '사망 후 새 개체 residency 혼합 금지: ' + r.residency.inRangeTicks + ' vs before ' + inRangeBefore);
});

// ── F5: 복원/소유권 ──
check('F5 복원: stop 후 _fireChargedProj/_spawnBossProjectile 가 원함수로 복원', () => {
  const w = makeWorld();
  const orig1 = w.fnReg._fireChargedProj, orig2 = w.fnReg._spawnBossProjectile;
  const probe = createProbe(w.host);
  probe.install();
  assert.notStrictEqual(w.fnReg._fireChargedProj, orig1, '설치 후엔 wrapper');
  assert.ok(w.fnReg._fireChargedProj[OWN], '소유 태그 존재');
  probe.stop();
  assert.strictEqual(w.fnReg._fireChargedProj, orig1, '복원되어 원함수');
  assert.strictEqual(w.fnReg._spawnBossProjectile, orig2, '복원되어 원함수');
});

check('F5 재설치: 중복 install 후 stop 해도 wrapper-as-original 저장 안 됨(원함수 복원)', () => {
  const w = makeWorld();
  const orig1 = w.fnReg._fireChargedProj;
  const probe = createProbe(w.host);
  probe.install();
  const wrap1 = w.fnReg._fireChargedProj;
  probe.install();                                    // 중복 설치
  assert.ok(w.fnReg._fireChargedProj[OWN], '여전히 wrapper');
  assert.strictEqual(w.fnReg._fireChargedProj[OWN].orig, orig1,
    '중복 설치해도 orig 는 원함수(wrapper-as-original 금지), got=' + (w.fnReg._fireChargedProj[OWN].orig === wrap1 ? 'wrap1' : 'other'));
  probe.stop();
  assert.strictEqual(w.fnReg._fireChargedProj, orig1, 'stop 후 원함수 복원');
});

check('F5 소유권: 외부가 바인딩을 바꿔치면 stop 이 덮어쓰지 않음', () => {
  const w = makeWorld();
  const probe = createProbe(w.host);
  probe.install();
  const foreign = function () {};                     // 타 소비자가 교체
  w.fnReg._fireChargedProj = foreign;
  probe.stop();
  assert.strictEqual(w.fnReg._fireChargedProj, foreign, '소유 불일치 시 복원하지 않아야');
});

console.log('\n결과: ' + passCount + ' PASS / ' + failCount + ' FAIL');
process.exit(failCount === 0 ? 0 : 1);
