/* wa24-observer v2 정적 검증 (Node, 브라우저/게임 실행 없음).
 * mock env 로 4개 요구 케이스 + verdict 로직 보조 케이스를 돌린다:
 *   1) 정상표본   → verdict PASS, within_pm2 true
 *   2) 0표본      → verdict INCOMPLETE, within_pm2 false  (★원 후보 ART.js:70 오탐 재발 방지)
 *   3) 재설치     → 기존 인스턴스 dispose, installSeq 증가, 타이머 누수 0
 *   4) 취소       → cleanup 멱등, rAF·timeout·namespace 전부 정리
 *   (보조) shake ±2 초과 → FAIL / 모델 드리프트 → FAIL
 *
 * 실행: node tools/team-followup-20261001/ART/wa24-observer.test.mjs
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const { createWa24Observer } = require(path.join(here, 'wa24-observer.cjs'));

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  PASS', msg); } else { fail++; console.error('  FAIL', msg); } }

// --- EXPECT 와 정확히 일치하는 정상 PROLOGUE_LINES (modelOk=true 유도) ---
function freshLines() {
  return { ko: [
    { id: 'wa23', t: 68200, dur: 5400, img: 'warintro/cin_remember.jpg', fade: { in: 1 } },
    { id: 'wa24', t: 73600, dur: 2400, img: 'warintro/cin_fallhell_custom.jpg',
      fade: { in: 400 }, cam: { zs: 1.08, ze: 1.04, ease: 'out' }, vfx: { vig: .5, shake: 1 } },
    { id: 'wa25', t: 76000, dur: 2900, img: null, fade: { in: 400 } }
  ] };
}

// --- 제어 가능한 mock env ---
function makeEnv(opts = {}) {
  const frames = new Map(); const timers = new Map();
  let nextId = 1; let clock = 0;
  const host = {};
  const globals = {
    PROLOGUE_LINES: opts.lines !== undefined ? opts.lines : freshLines(),
    _ease: { out: (t) => 1 - Math.pow(1 - t, 3) }, // easeOutCubic (t∈[0,1] → [0,1])
    _cutShake: opts.shake || ((amp, now) => ({ x: amp * Math.sin(now / 13) * 1.5, y: amp * Math.cos(now / 17) * 1.2 })),
    _cutsceneState: opts.state || 'NONE',
    _cutsceneStartMs: opts.startMs !== undefined ? opts.startMs : 0
  };
  const env = {
    readGlobal: (n) => globals[n],
    now: () => clock,
    scheduleFrame: (cb) => { const id = nextId++; frames.set(id, cb); return id; },
    cancelFrame: (id) => { frames.delete(id); },
    scheduleTimeout: (cb, ms) => { const id = nextId++; timers.set(id, { cb, at: clock + ms }); return id; },
    cancelTimeout: (id) => { timers.delete(id); },
    host,
    log: () => {}, warn: () => {}
  };
  // 테스트 제어기
  env._set = (k, v) => { globals[k] = v; };
  env._at = (t) => { clock = t; };               // 시계 설정
  env._flushFrame = () => {                       // 대기 중 프레임 콜백 1개 실행 (관측기는 매 tick 1개만 재예약)
    const [id, cb] = frames.entries().next().value || [];
    if (id === undefined) return false;
    frames.delete(id); cb(); return true;
  };
  env._liveFrames = () => frames.size;
  env._liveTimers = () => timers.size;
  env._host = host;
  return env;
}

// elapsed 열을 따라가며 시계 설정 → 프레임 플러시.
function drive(env, elapsedSeq) {
  for (const e of elapsedSeq) { env._at(e); env._flushFrame(); }
}

console.log('\n[1] 정상표본 — PASS 기대');
{
  const env = makeEnv({ state: 'INTRO_CUTSCENE', startMs: 0 });
  const obs = createWa24Observer(env).start();
  ok(env._liveFrames() === 1, '설치 후 rAF 1개 예약');
  ok(env._liveTimers() === 1, '설치 후 safety timeout 1개 예약');
  // wa23 → wa24 (여러 표본) → wa25(done)
  drive(env, [68200, 70000, 73600, 74000, 74600, 75200, 75700, 76000, 76200, 76400]);
  const r = obs.result || obs.snapshot();
  ok(r.verdict === 'PASS', `verdict=PASS (got ${r.verdict}, reasons=${JSON.stringify(r.verdictReasons)})`);
  ok(r.modelCheck.ok === true, 'modelCheck.ok=true');
  ok(r.boundaryCaptured.wa24 === true, 'wa24 경계 포착');
  ok(r.shake_wa24.n > 0, `wa24 표본 n>0 (n=${r.shake_wa24.n})`);
  ok(r.shake_wa24.within_pm2 === true, 'within_pm2=true (±2 이내)');
  ok(r.shake_wa24.xmin >= -2 && r.shake_wa24.xmax <= 2, `shake x∈[${r.shake_wa24.xmin?.toFixed(2)},${r.shake_wa24.xmax?.toFixed(2)}] ⊂[-2,2]`);
  ok(obs.stopped === true, 'done 도달 후 자동 종료');
  ok(env._liveFrames() === 0 && env._liveTimers() === 0, '자동 종료 시 프레임·타이머 0 (누수 없음)');
  ok(env._host.__wa24obs === undefined, '자동 종료 시 namespace 제거');
}

console.log('\n[2] 0표본 — INCOMPLETE 기대 (★ART.js:70 오탐 방지)');
{
  const env = makeEnv({ state: 'INTRO_CUTSCENE', startMs: 0 });
  const obs = createWa24Observer(env).start();
  // wa24 구간을 건너뛰고 wa23 과 wa25 만 표본 → wa24 표본 0
  drive(env, [68200, 70000, 72000, 76200]);
  const r = obs.cleanup(); // 수동 종료
  ok(r.shake_wa24.n === 0, `wa24 표본 n=0 (got ${r.shake_wa24.n})`);
  ok(r.shake_wa24.within_pm2 === false, '★within_pm2=false (표본0은 통과로 보고하지 않음)');
  ok(r.verdict !== 'PASS', `★verdict!==PASS (got ${r.verdict})`);
  ok(r.verdict === 'INCOMPLETE', `verdict=INCOMPLETE (got ${r.verdict})`);
  ok(r.verdictReasons.includes('wa24_표본0'), 'reasons 에 wa24_표본0 명시');
  ok(r.shake_wa24.xmin === null && r.shake_wa24.xmax === null, 'Infinity 잔재 대신 null 로 정리');
  // 원 후보 공식(표본0)의 오탐을 명시적으로 재현해 대비 증명
  const legacy = (9 >= -2) && (-9 <= 2) && (9 >= -2) && (-9 <= 2); // ART.js:70 초기값 그대로
  ok(legacy === true, '(참고) 원 후보 공식은 표본0에서 true → 본 수정이 이를 false 로 교정');
}

console.log('\n[3] 재설치 — 기존 인스턴스 dispose + installSeq 증가');
{
  const env = makeEnv({ state: 'INTRO_CUTSCENE', startMs: 0 });
  const a = createWa24Observer(env).start();
  const seqA = a.installSeq;
  ok(env._liveTimers() === 1, 'A 설치 후 타이머 1');
  const b = createWa24Observer(env).start(); // 같은 host 에 재설치
  ok(a.stopped === true, 'A 가 자동으로 cleanup 되어 stopped');
  ok(env._host.__wa24obs === b, 'namespace 가 B 를 가리킴');
  ok(b.installSeq === seqA + 1, `installSeq 증가 (A=${seqA} → B=${b.installSeq})`);
  ok(env._liveFrames() === 1 && env._liveTimers() === 1, 'A 핸들 해제되어 B 것만 남음 (누수 없음)');
  b.cleanup();
  ok(env._liveFrames() === 0 && env._liveTimers() === 0, 'B 정리 후 전부 0');
}

console.log('\n[4] 취소 — cleanup 멱등 + 전체 정리');
{
  const env = makeEnv({ state: 'INTRO_CUTSCENE', startMs: 0 });
  const obs = createWa24Observer(env).start();
  drive(env, [68200, 73600, 74000]); // 일부만 재생
  ok(env._liveFrames() === 1 && env._liveTimers() === 1, '진행 중 rAF·timeout 각 1');
  const r1 = obs.cleanup();
  ok(obs.stopped === true, 'cleanup 후 stopped');
  ok(env._liveFrames() === 0, 'rAF 취소됨');
  ok(env._liveTimers() === 0, 'safety timeout 취소됨 (★ART.js:79 누수 수정)');
  ok(env._host.__wa24obs === undefined, 'namespace 제거됨 (★ART.js:75 누수 수정)');
  const r2 = obs.cleanup(); // 멱등
  ok(r2 === r1, '두 번째 cleanup 은 동일 캐시 결과 반환 (멱등, 재취소 안전)');
  // 종료 후 프레임 콜백이 남아 되살아나지 않는지
  const before = env._liveFrames();
  env._flushFrame();
  ok(env._liveFrames() === before, '종료 후 잔여 프레임 재예약 없음');
}

console.log('\n[보조] shake ±2 초과 → FAIL / 모델 드리프트 → FAIL');
{
  // shake 과대
  const envOver = makeEnv({ state: 'INTRO_CUTSCENE', startMs: 0, shake: (amp) => ({ x: amp * 5, y: 0 }) });
  const over = createWa24Observer(envOver).start();
  drive(envOver, [73600, 74000, 74600, 75200, 76000, 76200, 76400]);
  const ro = over.result || over.snapshot();
  ok(ro.shake_wa24.within_pm2 === false, 'shake>2 → within_pm2=false');
  ok(ro.verdict === 'FAIL', `shake 초과 → verdict=FAIL (got ${ro.verdict})`);

  // 모델 드리프트 (wa24.t 변경)
  const badLines = freshLines(); badLines.ko[1].t = 99999;
  const envDrift = makeEnv({ state: 'INTRO_CUTSCENE', startMs: 0, lines: badLines });
  const drift = createWa24Observer(envDrift).start();
  drive(envDrift, [73600, 74000, 76000, 76200, 76400]);
  const rd = drift.cleanup();
  ok(rd.modelCheck.ok === false, '드리프트 → modelCheck.ok=false');
  ok(rd.verdict === 'FAIL', `드리프트 → verdict=FAIL (got ${rd.verdict})`);
}

console.log(`\n=== 결과: ${pass} PASS / ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
