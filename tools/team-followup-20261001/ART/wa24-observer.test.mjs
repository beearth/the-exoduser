/* wa24-observer v3 정적 검증 (Node, 브라우저/게임 실행 없음).
 * [D5 LIVE-CALLSITE] 관측기 시간축을 line-index(_cutLineIdx+_cutLineStartMs)로 구동한다.
 *
 * 케이스:
 *   1) 정상표본   → verdict PASS, within_pm2 true, timeBase line-index
 *   2) 0표본      → verdict INCOMPLETE, within_pm2 false
 *   3) 재설치     → 기존 dispose, installSeq 증가, 누수 0
 *   4) 취소       → cleanup 멱등, rAF·timeout·namespace 전부 정리
 *   5) ★RED→GREEN 지연시작 — 엔진이 wa24 를 늦게 시작해도 line-index 는 wa24, seq-time 은 wa25 오독
 *   6) PRO/비PRO  — 비PRO(INTRO) 활성목록엔 wa24 없음 → 미확정(INCOMPLETE)
 *   7) 누락/역행  — lineIdx/시각 누락 또는 역행 → 샘플 보류(미확정), 크래시 없음
 *   8) 주입 샘플러 — 검수 correctedSampler 주입 시 관측기 샘플이 그 출력과 일치
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
const delta = require(path.join(here, 'wa24-delta-probe.cjs'));
const { correctedSampler, legacySampler } = delta;

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; console.log('  PASS', msg); } else { fail++; console.error('  FAIL', msg); } }

// EXPECT 와 일치하는 PRO 라인 [wa23(0), wa24(1), wa25(2)]
function freshLines() {
  return { ko: [
    { id: 'wa23', t: 68200, dur: 5400, img: 'warintro/cin_remember.jpg', fade: { in: 1 } },
    { id: 'wa24', t: 73600, dur: 2400, img: 'warintro/cin_fallhell_custom.jpg',
      fade: { in: 400 }, cam: { zs: 1.08, ze: 1.04, ease: 'out' }, vfx: { vig: .5, shake: 1 } },
    { id: 'wa25', t: 76000, dur: 2900, img: null, fade: { in: 400 } }
  ] };
}

// 제어 가능한 line-index mock env
function makeEnv(opts = {}) {
  const frames = new Map(); const timers = new Map();
  let nextId = 1; let clock = 0;
  const host = {};
  const PL = opts.lines !== undefined ? opts.lines : freshLines();
  const globals = {
    PROLOGUE_LINES: PL,
    _ease: { out: (t) => 1 - Math.pow(1 - t, 3), linear: (t) => t, in: (t) => t * t },
    _cutShake: opts.shake || ((amp, now) => ({ x: (Math.sin(now * 0.047) * amp * 2) | 0, y: (Math.cos(now * 0.053) * amp * 2) | 0 })),
    _cutsceneState: opts.state || 'NONE',
    _cutsceneStartMs: opts.startMs !== undefined ? opts.startMs : 0,
    _cutLineIdx: undefined,
    _cutLineStartMs: undefined
  };
  const activeLines = opts.activeLines || (PL && PL.ko);
  const env = {
    readGlobal: (n) => globals[n],
    now: () => clock,
    getLines: () => activeLines,
    scheduleFrame: (cb) => { const id = nextId++; frames.set(id, cb); return id; },
    cancelFrame: (id) => { frames.delete(id); },
    scheduleTimeout: (cb, ms) => { const id = nextId++; timers.set(id, { cb, at: clock + ms }); return id; },
    cancelTimeout: (id) => { timers.delete(id); },
    host,
    log: () => {}, warn: () => {}
  };
  if (opts.sampler) env.sampler = opts.sampler;
  env._set = (k, v) => { globals[k] = v; };
  env._liveFrames = () => frames.size;
  env._liveTimers = () => timers.size;
  env._host = host;
  env._globals = globals;
  // line-index step: 활성 라인/라인시작/현재시각 세팅 후 프레임 1개 플러시
  env._step = (lineIdx, lineStartMs, now) => {
    globals._cutLineIdx = lineIdx; globals._cutLineStartMs = lineStartMs; clock = now;
    const [id, cb] = frames.entries().next().value || [];
    if (id === undefined) return false;
    frames.delete(id); cb(); return true;
  };
  env._flushFrame = () => {
    const [id, cb] = frames.entries().next().value || [];
    if (id === undefined) return false;
    frames.delete(id); cb(); return true;
  };
  return env;
}

const T23 = 0, T24 = 6000, T25 = 9000; // 임의 wall-clock 라인 시작

console.log('\n[1] 정상표본 — PASS 기대 (line-index)');
{
  const env = makeEnv({ state: 'INTRO_CUTSCENE' });
  const obs = createWa24Observer(env).start();
  ok(env._liveFrames() === 1 && env._liveTimers() === 1, '설치 후 rAF·timeout 각 1');
  env._step(0, T23, T23 + 200);                 // wa23
  env._step(1, T24, T24 + 0);                   // wa24 el0
  env._step(1, T24, T24 + 400);                 // wa24 el400
  env._step(1, T24, T24 + 1000);                // wa24
  env._step(1, T24, T24 + 1600);                // wa24
  env._step(1, T24, T24 + 2000);                // wa24
  env._step(2, T25, T25 + 400);                 // wa25 el400 → done
  const r = obs.result || obs.snapshot();
  ok(r.verdict === 'PASS', `verdict=PASS (got ${r.verdict}, reasons=${JSON.stringify(r.verdictReasons)})`);
  ok(r.timeBase === 'line-index', `timeBase=line-index (got ${r.timeBase})`);
  ok(r.modelCheck.ok === true, 'modelCheck.ok=true');
  ok(r.boundaryCaptured.wa24 === true, 'wa24 경계 포착');
  ok(r.shake_wa24.n >= 5, `wa24 표본 n>=5 (n=${r.shake_wa24.n})`);
  ok(r.shake_wa24.within_pm2 === true, 'within_pm2=true (±2 이내)');
  ok(r.shake_wa24.xmin >= -2 && r.shake_wa24.xmax <= 2, `shake x∈[${r.shake_wa24.xmin},${r.shake_wa24.xmax}] ⊂[-2,2]`);
  ok(obs.stopped === true, 'done 도달 후 자동 종료');
  ok(env._liveFrames() === 0 && env._liveTimers() === 0, '자동 종료 시 누수 0');
  ok(env._host.__wa24obs === undefined, '자동 종료 시 namespace 제거');
}

console.log('\n[2] 0표본 — INCOMPLETE 기대');
{
  const env = makeEnv({ state: 'INTRO_CUTSCENE' });
  const obs = createWa24Observer(env).start();
  env._step(0, T23, T23 + 200);                 // wa23
  env._step(2, T25, T25 + 100);                 // wa25 (el100 <400 → done 아님)
  const r = obs.cleanup();
  ok(r.shake_wa24.n === 0, `wa24 표본 n=0 (got ${r.shake_wa24.n})`);
  ok(r.shake_wa24.within_pm2 === false, 'within_pm2=false (표본0은 통과 아님)');
  ok(r.verdict === 'INCOMPLETE', `verdict=INCOMPLETE (got ${r.verdict})`);
  ok(r.verdictReasons.includes('wa24_표본0'), 'reasons 에 wa24_표본0');
}

console.log('\n[3] 재설치 — dispose + installSeq');
{
  const env = makeEnv({ state: 'INTRO_CUTSCENE' });
  const a = createWa24Observer(env).start();
  const seqA = a.installSeq;
  const b = createWa24Observer(env).start();
  ok(a.stopped === true, 'A 자동 cleanup → stopped');
  ok(env._host.__wa24obs === b, 'namespace 가 B');
  ok(b.installSeq === seqA + 1, `installSeq 증가 (${seqA}→${b.installSeq})`);
  ok(env._liveFrames() === 1 && env._liveTimers() === 1, '누수 없이 B 것만');
  b.cleanup();
  ok(env._liveFrames() === 0 && env._liveTimers() === 0, 'B 정리 후 0');
}

console.log('\n[4] 취소 — 멱등 + 전체 정리');
{
  const env = makeEnv({ state: 'INTRO_CUTSCENE' });
  const obs = createWa24Observer(env).start();
  env._step(0, T23, T23 + 200); env._step(1, T24, T24 + 400);
  ok(env._liveFrames() === 1 && env._liveTimers() === 1, '진행 중 rAF·timeout 각 1');
  const r1 = obs.cleanup();
  ok(obs.stopped === true, 'cleanup 후 stopped');
  ok(env._liveFrames() === 0, 'rAF 취소');
  ok(env._liveTimers() === 0, 'safety timeout 취소');
  ok(env._host.__wa24obs === undefined, 'namespace 제거');
  const r2 = obs.cleanup();
  ok(r2 === r1, '2차 cleanup 멱등(동일 캐시)');
  env._flushFrame();
  ok(env._liveFrames() === 0, '종료 후 재예약 없음');
}

console.log('\n[5] ★RED→GREEN 지연시작 — line-index=wa24, seq-time=wa25 오독');
{
  // 엔진이 누적 드리프트로 wa24 를 wall 75400 에 시작(지연). lineIdx=1(wa24), 현재 76100(el=700, 재생중).
  const lines = freshLines().ko;
  const env = makeEnv({ state: 'INTRO_CUTSCENE', startMs: 0 });
  const obs = createWa24Observer(env).start();
  env._step(1, 75400, 76100);                   // wa24 el700
  const r = obs.snapshot();
  ok(r.boundaryCaptured.wa24 === true, '★GREEN: line-index 로 wa24 포착');
  ok(!r.marks['enter_wa25'], 'wa25 로 오독하지 않음');
  // RED 참조: seq-time(_cutsceneStartMs+t) 축이면 같은 now 에서 wa25 를 고름
  const legacy = legacySampler({ lines, cutsceneStartMs: 0, now: 76100 });
  ok(legacy.active === 'wa25', `★RED: seq-time 축은 wa25 오독 (got ${legacy.active})`);
  ok(legacy.active !== 'wa24' && r.boundaryCaptured.wa24, '★두 축 불일치 → 수정 효과 증명');
  obs.cleanup();
}

console.log('\n[6] PRO/비PRO — 비PRO 활성목록엔 wa24 없음 → 미확정');
{
  const intro = [{ id: 'nem01', dur: 3000, cam: { zs: 1.08, ze: 1.04, ease: 'out' }, vfx: {}, fade: { in: 500 } },
                 { id: 'nem02', dur: 3000, fade: { in: 1 } }];
  const env = makeEnv({ state: 'INTRO_CUTSCENE', activeLines: intro });
  const obs = createWa24Observer(env).start();
  env._step(0, 0, 200); env._step(1, 3000, 3200);
  const r = obs.cleanup();
  ok(r.boundaryCaptured.wa24 === false, '비PRO: wa24 미포착');
  ok(r.shake_wa24.n === 0 && r.verdict === 'INCOMPLETE', '비PRO: 표본0 → 미확정(INCOMPLETE)');
}

console.log('\n[7] 누락/역행 — 샘플 보류, 크래시 없음');
{
  // 누락: lineIdx undefined
  const env = makeEnv({ state: 'INTRO_CUTSCENE' });
  const obs = createWa24Observer(env).start();
  env._set2 = env._set; // noop
  // lineIdx 를 세팅하지 않고(undefined) 프레임 플러시
  env._globals._cutLineIdx = undefined; env._globals._cutLineStartMs = undefined;
  let threw = false; try { env._flushFrame(); } catch (e) { threw = true; }
  ok(!threw, '누락 상태에서 크래시 없음');
  const r1 = obs.snapshot();
  ok(r1.shake_wa24.n === 0, '누락 → 샘플 없음');
  // 역행: wa24 정상 후 lineStartMs 감소
  env._step(1, 6000, 6400);                     // wa24 el400 (정상)
  env._step(1, 3000, 3200);                     // lineStartMs 역행 → reverse 기록
  const r2 = obs.cleanup();
  ok(r2.marks.reverse_seen === 1, '역행 감지 기록(reverse_seen)');
  ok(r2.boundaryCaptured.wa24 === true, '정상 구간 wa24 는 포착됨');
}

console.log('\n[8] 주입 correctedSampler — 관측기 샘플이 검수 샘플러 출력과 일치');
{
  const lines = freshLines().ko;
  const env = makeEnv({ state: 'INTRO_CUTSCENE', sampler: correctedSampler });
  const obs = createWa24Observer(env).start();
  const now = T24 + 1200, lineStartMs = T24;
  env._step(1, lineStartMs, now);               // wa24 el1200
  const r = obs.snapshot();
  const expect = correctedSampler({ lines, lineIdx: 1, lineStartMs, now });
  const s = r.samples[r.samples.length - 1];
  ok(s && s.id === 'wa24', '주입 경로로 wa24 샘플 기록');
  ok(s.el === Math.round(expect.lineElapsed), `lineElapsed 일치 (${s.el}=${Math.round(expect.lineElapsed)})`);
  ok(s.zoom === +(+expect.zoom).toFixed(4), `zoom 일치 (${s.zoom}=${expect.zoom})`);
  ok(s.fade === +(+expect.fadeAlpha).toFixed(4), `fadeAlpha 일치 (${s.fade}=${expect.fadeAlpha})`);
  ok(expect.base === 'line-index(_cutLineIdx+_cutLineStartMs)', '검수 샘플러 base=line-index');
  obs.cleanup();
}

console.log('\n[보조] shake ±2 초과 → FAIL / 모델 드리프트 → FAIL');
{
  const envOver = makeEnv({ state: 'INTRO_CUTSCENE', shake: (amp) => ({ x: amp * 5, y: 0 }) });
  const over = createWa24Observer(envOver).start();
  envOver._step(1, T24, T24 + 0); envOver._step(1, T24, T24 + 800); envOver._step(1, T24, T24 + 1600);
  envOver._step(2, T25, T25 + 400);
  const ro = over.result || over.snapshot();
  ok(ro.shake_wa24.within_pm2 === false, 'shake>2 → within_pm2=false');
  ok(ro.verdict === 'FAIL', `shake 초과 → FAIL (got ${ro.verdict})`);

  const badLines = freshLines(); badLines.ko[1].t = 99999; // 모델 대조용 t 변경
  const envDrift = makeEnv({ state: 'INTRO_CUTSCENE', lines: badLines });
  const drift = createWa24Observer(envDrift).start();
  envDrift._step(1, T24, T24 + 0); envDrift._step(1, T24, T24 + 800); envDrift._step(2, T25, T25 + 400);
  const rd = drift.cleanup();
  ok(rd.modelCheck.ok === false, '모델 드리프트 → modelCheck.ok=false');
  ok(rd.verdict === 'FAIL', `드리프트 → FAIL (got ${rd.verdict})`);
}

console.log(`\n=== 결과: ${pass} PASS / ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
