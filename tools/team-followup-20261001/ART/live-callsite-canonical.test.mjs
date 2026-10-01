/* live-callsite-canonical — 관측기 실제 호출부(line-index) ↔ canonical finalcrop 시간축 일치 검증.
 * (Node, 브라우저/게임 실행 없음)
 *
 * 목적: wa24-observer 의 수정된 line-index 샘플이 root canonical `wa24-finalcrop.mjs`
 *       (= owner-integration predictFinalCrop/correctedSampler) 와 같은 시간축·경과를 내는지,
 *       지연시작(드리프트) 상황에서 seq-time 축(RED)과 달라지는지 증명한다.
 *       눈·발·자막 픽셀 가독성은 canonical 과 동일하게 UNKNOWN 유지.
 *
 * 실행: node tools/team-followup-20261001/ART/live-callsite-canonical.test.mjs
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { predictFinalCrop, correctedSampler } from './wa24-finalcrop.mjs';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const { createWa24Observer } = require(path.join(here, 'wa24-observer.cjs'));
const { legacySampler } = require(path.join(here, 'wa24-delta-probe.cjs'));

let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.error('  FAIL', m); } }

const LINES = [
  { id: 'wa23', t: 68200, dur: 5400, img: 'warintro/cin_remember.jpg', fade: { in: 1 } },
  { id: 'wa24', t: 73600, dur: 2400, img: 'warintro/cin_fallhell_custom.jpg',
    fade: { in: 400 }, cam: { zs: 1.08, ze: 1.04, ease: 'out' }, vfx: { vig: .5, shake: 1 } },
  { id: 'wa25', t: 76000, dur: 2900, img: null, fade: { in: 400 } }
];

// 지연시작(드리프트): 엔진이 wa24 를 wall 75400 에 시작, 현재 76100 (el=700, 재생중).
const STATE = { lineIdx: 1, lineStartMs: 75400, now: 76100 };

// 관측기를 검수 correctedSampler 주입으로 구동하는 최소 env
function miniEnv() {
  const frames = new Map(); let nid = 1; let clock = 0; const host = {};
  const g = {
    PROLOGUE_LINES: { ko: LINES }, _cutsceneState: 'INTRO_CUTSCENE',
    _ease: { out: (t) => 1 - (1 - t) * (1 - t), linear: (t) => t, in: (t) => t * t },
    _cutShake: (amp, now) => ({ x: (Math.sin(now * 0.047) * amp * 2) | 0, y: (Math.cos(now * 0.053) * amp * 2) | 0 }),
    _cutsceneStartMs: 0, _cutLineIdx: undefined, _cutLineStartMs: undefined
  };
  const env = {
    readGlobal: (n) => g[n], now: () => clock, getLines: () => LINES, sampler: correctedSampler,
    scheduleFrame: (cb) => { const id = nid++; frames.set(id, cb); return id; },
    cancelFrame: (id) => frames.delete(id),
    scheduleTimeout: () => 0, cancelTimeout: () => {}, host, log: () => {}, warn: () => {}
  };
  env._drive = (idx, st, now) => { g._cutLineIdx = idx; g._cutLineStartMs = st; clock = now; const [id, cb] = frames.entries().next().value || []; if (id !== undefined) { frames.delete(id); cb(); } };
  return env;
}

console.log('\n[1] canonical finalcrop 시간축 (line-index)');
const canon = predictFinalCrop({ fullW: 1920, fullH: 1080, lines: LINES, ...STATE });
ok(canon.timeBase === 'line-index', `canonical timeBase=line-index (got ${canon.timeBase})`);
ok(canon.active === 'wa24', `canonical active=wa24 (got ${canon.active})`);
ok(canon.lineElapsed === 700, `canonical lineElapsed=700 (now-lineStartMs) (got ${canon.lineElapsed})`);
ok(canon.eyeVerdict === 'UNKNOWN' && canon.footVerdict === 'UNKNOWN' && canon.subtitleVerdict === 'UNKNOWN', '눈/발/자막 UNKNOWN 유지');

console.log('\n[2] 관측기 line-index 샘플이 canonical 과 일치');
const env = miniEnv();
const obs = createWa24Observer(env).start();
env._drive(STATE.lineIdx, STATE.lineStartMs, STATE.now);
const r = obs.snapshot();
const s = r.samples[r.samples.length - 1];
ok(r.timeBase === 'line-index', `관측기 timeBase=line-index (got ${r.timeBase})`);
ok(r.boundaryCaptured.wa24 === true, '관측기 wa24 포착');
ok(s && s.id === 'wa24' && s.el === 700, `관측기 wa24 el=700 (got ${s && s.el})`);
ok(s.el === canon.lineElapsed, `★관측기 el == canonical lineElapsed (${s.el}=${canon.lineElapsed})`);
ok(s.el === Math.round(correctedSampler({ lines: LINES, ...STATE }).lineElapsed), '관측기 el == correctedSampler lineElapsed');
obs.cleanup();

console.log('\n[3] RED 참조 — seq-time 축이면 같은 now 에서 wa25 오독');
const legacy = legacySampler({ lines: LINES, cutsceneStartMs: 0, now: STATE.now });
ok(legacy.active === 'wa25', `seq-time 축 active=wa25 (got ${legacy.active})`);
ok(legacy.active !== canon.active, `★canonical(wa24) ≠ seq-time(wa25) — 호출부 수정이 canonical 과 정합됨`);

console.log(`\n=== 결과: ${pass} PASS / ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
