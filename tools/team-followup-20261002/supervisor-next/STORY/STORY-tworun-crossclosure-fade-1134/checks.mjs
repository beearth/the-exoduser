// STORY-tworun-crossclosure-fade-1134 — 실제 2-run cross-closure stale fade 검증 (hb1014 단일-closure 정정)
//
// 감독 피드백: 단일 closure 합성 A→B→A 및 수동 _fadeTimers.clear()는 실제 monotonic CIN_LINES/two-run
// 검증이 아니다. 이번은 원문 showImg/hideAll 블록을 2회 인스턴스화(두 closure)하되 동일 공유 DOM과
// 공유 가상 clock을 연결하고, 종료→새 run 후 run1의 stale 800ms fade 타이머가 run2의 현재 이미지를
// 숨기는지 검증한다. 후보는 수동 timer-clear 대신 원문 teardown lifecycle에 연결되는 generation-token
// (_GEN) 자동 guard다 — teardown/새 run이 gen 을 올리면 이전 run 타이머는 스스로 skip.
// 실브라우저/cinematic 영상/audio 실행 0. productionApplied=false, runtimeAccepted=false.
// 이전 hb1014 9-assertion 재실행 0 (별건, 본 파일은 신규 two-run 검증).
//
// Node=/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node

import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const idxPath = ROOT + '/index.html';
const idxText = fs.readFileSync(idxPath, 'utf8');
const idxLines = idxText.split('\n');

// ── 원문 블록 추출 (2236-2251: cImgs/_prevImg/showImg/hideAll) + 마커 단언 ──
const block = idxLines.slice(2236 - 1, 2251).join('\n');
if (!/const cImgs=\[/.test(block) || !/const showImg=\(idx\)=>\{/.test(block) || !/const hideAll=\(\)=>\{/.test(block))
  throw new Error('showImg/hideAll 블록 마커 불일치 — 추출 경계 변동, 억지 PASS 금지');
const DEFECT = "else if(i===_prevImg){el.style.zIndex=3;setTimeout(()=>{el.classList.remove('show');const im2=el.querySelector('img');if(im2)im2.style.animation=''},800);}";
if (!block.includes(DEFECT)) throw new Error('defect 문자열(2246) 미발견 — 중단');

// ── 후보: generation-token 자동 guard (수동 clear 없음). _cinGen 은 _GEN.v (공유 주입) ──
const FIX = "else if(i===_prevImg){el.style.zIndex=3;const _g=_GEN.v;const _pi=i;setTimeout(()=>{if(_g!==_GEN.v)return;if(_pi===_prevImg)return;el.classList.remove('show');const im2=el.querySelector('img');if(im2)im2.style.animation=''},800);}";
const candidateBlock = block.replace(DEFECT, FIX);
if (candidateBlock === block) throw new Error('후보 transform 실패');

// ── 공유 DOM 대역 + 공유 가상 clock ──
function makeShared() {
  let now = 0, seq = 0, firedAfterGen = 0;
  const timers = new Map();
  const setTimeoutV = (fn, ms) => { const id = ++seq; timers.set(id, { fn, due: now + ms, cancelled: false }); return id; };
  const clearTimeoutV = (id) => { const t = timers.get(id); if (t) t.cancelled = true; };
  const advance = (ms) => {
    const target = now + ms;
    const pending = [...timers.entries()].filter(([, t]) => !t.cancelled && t.due <= target).sort((a, b) => a[1].due - b[1].due);
    for (const [id, t] of pending) { now = t.due; t.fn(); timers.delete(id); }
    now = target;
  };
  const els = {};
  const mk = (name) => { const c = new Set(); return { _name: name, _cls: c, style: {}, _img: { style: {} }, classList: { add: x => c.add(x), remove: x => c.delete(x), contains: x => c.has(x) }, querySelector() { return this._img; } }; };
  const $ = (name) => (els[name] ||= mk(name));
  return { setTimeoutV, clearTimeoutV, advance, $, els };
}

// 블록을 공유 env 에서 인스턴스화 → 독립 closure (own _prevImg/cImgs=공유 DOM)
function instantiate(blockText, env, GEN) {
  const wrapped = `(function($, setTimeout, clearTimeout, _GEN){\n${blockText}\nreturn {showImg, hideAll, getPrev:()=>_prevImg};\n})`;
  const ctx = {}; vm.createContext(ctx);
  const factory = vm.runInContext(wrapped, ctx, { filename: 'showImg-block' });
  return factory(env.$, env.setTimeoutV, env.clearTimeoutV, GEN);
}
const show = (env, name) => env.els['cinImg' + name]?.classList.contains('show') ?? false;
// _goCinematic:2722 재진입 teardown 모사: 공유 DOM 의 show 제거 (타이머는 건드리지 않음 — 원문 그대로)
const teardownResetShow = (env) => { for (let i = 1; i <= 19; i++) env.$('cinImg' + i).classList.remove('show'); };

let pass = 0, fail = 0;
const check = (n, got, want) => { const ok = Object.is(got, want); console.log(`${ok ? 'PASS' : 'FAIL'} | ${n} | got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); ok ? pass++ : fail++; };

console.log('== 원문 추출 근거 ==');
console.log('index.html whole SHA256 :', sha(idxText));
console.log('block(2236-2251) SHA256 :', sha(block));

// ── 시나리오 1: 현재식, 2-run cross-closure. run1(A→B) → teardown → run2(A) → advance 800 ──
console.log('\n== S1 현재식 2-run: run1 showImg(0),showImg(1) → teardown(show reset, 타이머 미clear) → run2 showImg(0) → +800 ==');
{
  const env = makeShared();
  const run1 = instantiate(block, env, { v: 0 });
  run1.showImg(0); run1.showImg(1);          // run1: A(0) 에 800ms fade 타이머 예약(공유 DOM el0)
  teardownResetShow(env);                      // 재진입 teardown: show 리셋(원문은 타이머 미clear)
  const run2 = instantiate(block, env, { v: 0 }); // 새 closure(새 _prevImg)
  run2.showImg(0);                             // run2: A(0) 를 현재 컷으로 표시
  env.advance(800);                            // run1 의 stale 타이머 fire
  console.log('  run2 현재 컷 el0 has show =', show(env, 1));
  check('현재식: run1 stale fade 가 run2 현재 컷 el0 을 숨김(cross-run defect)', show(env, 1), false);
}

// ── 시나리오 2: 후보(gen token), 동일 2-run. teardown 시 _GEN.v++ (원문 teardown 에 gen bump 연결 모사) ──
console.log('\n== S2 후보 2-run: run1 → teardown(_GEN.v++) → run2 → +800 ==');
{
  const env = makeShared();
  const GEN = { v: 1 };
  const run1 = instantiate(candidateBlock, env, GEN);
  run1.showImg(0); run1.showImg(1);          // A-timer 가 _g=1 캡처
  teardownResetShow(env); GEN.v++;             // teardown: gen 1→2 (finishCin/_goCinematic 가 bump 하는 지점)
  const run2 = instantiate(candidateBlock, env, GEN);
  run2.showImg(0);                             // gen2 에서 A 표시
  env.advance(800);                            // run1 A-timer: _g(1)!==_GEN.v(2) → skip
  console.log('  run2 현재 컷 el0 has show =', show(env, 1));
  check('후보: cross-run stale 가 gen token 으로 자동 skip, run2 현재 컷 유지', show(env, 1), true);
}

// ── 시나리오 3(control): 후보, 단일 run 정상 A→B fade 보존 ──
console.log('\n== S3 control 후보 단일 run: showImg(0),showImg(1) → +800 (정상 fade) ==');
{
  const env = makeShared();
  const GEN = { v: 5 };
  const run = instantiate(candidateBlock, env, GEN);
  run.showImg(0); run.showImg(1); env.advance(800); // gen 불변, _pi(0)!==_prevImg(1) → el0 제거
  check('후보 control: el0 정상 fade out(보존)', show(env, 1), false);
  check('후보 control: el1 현재 컷 유지(보존)', show(env, 2), true);
}

// ── 시나리오 4(control): 현재식, 단일 run 정상 A→B fade (defect 아님 확인) ──
console.log('\n== S4 control 현재식 단일 run: showImg(0),showImg(1) → +800 ==');
{
  const env = makeShared();
  const run = instantiate(block, env, { v: 0 });
  run.showImg(0); run.showImg(1); env.advance(800);
  check('현재식 control: el0 정상 fade out', show(env, 1), false);
  check('현재식 control: el1 현재 컷 유지', show(env, 2), true);
}

console.log(`\n== ${pass} PASS / ${fail} FAIL ==`);
console.log('원문 showImg/hideAll=추출 verbatim(2회 인스턴스화=두 closure, 공유 DOM/clock). 후보=gen-token 자동 guard(수동 timer-clear 없음).');
console.log('teardown gen bump 는 원문 finishCin/skipToGate/_goCinematic 진입점에 연결하는 설계(모사). 실제 소스는 현재 fade 타이머 레지스트리 0.');
console.log('도달성 Gate: 현행 v13 영화 경로는 showImg(showLine) 미호출 → 보존 코드 latent, 제품 노출 UNKNOWN. productionApplied=false/runtimeAccepted=false.');
process.exit(fail ? 1 : 0);
