// STORY-cinematic-stale-fade-timer-hb1014 — 컷 전환 800ms remove(show) 타이머가 현재 컷을 숨기는 경계
//
// index.html playCinematic 내부 showImg(2238-2250)/hideAll(2251)을 원문에서 추출(라인 슬라이스 + 마커 단언)하여
// 명시적 DOM 대역 + 가상 clock으로 실행한다. 실브라우저/cinematic 영상/오디오 실행 0.
// defect: line 2246의 else-if 분기가 setTimeout(()=>el.classList.remove('show'),800)을 등록하되
//         fire 시점에 el이 다시 현재 컷이 되었는지 확인하지 않는다 → 빠른 B→A(동일 run) 또는
//         완료/재진입(교차 run) 후 현재 컷이 숨겨질 수 있다.
// 후보: (1) intra-run 시퀀스 guard(_pi!==_prevImg: el이 다시 현재이면 removal skip),
//        (2) lifetime guard(_fadeTimers 추적 + hideAll에서 clearTimeout) — 완료/재진입 stale 차단.
// 정상 A→B fade control 보존. productionApplied=false, runtimeAccepted=false.
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

// ── 원문 추출 (2236-2251: cImgs 선언 + _prevImg + showImg + hideAll) + 마커 단언 ──
const block = idxLines.slice(2236 - 1, 2251).join('\n');
if (!/const cImgs=\[/.test(block) || !/const showImg=\(idx\)=>\{/.test(block) || !/const hideAll=\(\)=>\{/.test(block))
  throw new Error('showImg/hideAll 블록 마커 불일치 — 추출 경계 변동, 억지 PASS 금지');
const line2246 = idxLines[2246 - 1];
if (!/else if\(i===_prevImg\)\{el\.style\.zIndex=3;setTimeout\(\(\)=>\{el\.classList\.remove\('show'\)/.test(line2246))
  throw new Error('defect 라인 2246 마커 불일치 — 중단');

// ── 가상 clock + 명시적 DOM 대역 ──
function makeEnv() {
  let now = 0, seq = 0, firedAfter = 0; // firedAfter: hideAll 이후 실제 fire 된 non-cancelled 타이머 누적(삭제와 무관한 독립 counter)
  const timers = new Map(); // id -> {fn, due, cancelled}
  let hideAllAt = Infinity;
  const setTimeoutV = (fn, ms) => { const id = ++seq; timers.set(id, { fn, due: now + ms, cancelled: false }); return id; };
  const clearTimeoutV = (id) => { const t = timers.get(id); if (t) t.cancelled = true; };
  const advance = (ms) => {
    const target = now + ms;
    const pending = [...timers.entries()].filter(([, t]) => !t.cancelled && t.due <= target).sort((a, b) => a[1].due - b[1].due);
    for (const [id, t] of pending) { now = t.due; if (t.due >= hideAllAt) firedAfter++; t.fn(); timers.delete(id); }
    now = target;
  };
  const markHideAll = () => { hideAllAt = now; };
  const firedAfterHideAllCount = () => firedAfter;
  // DOM 대역
  const mkEl = (name) => ({ _name: name, _cls: new Set(), style: {}, _img: { style: {} },
    classList: { add(c){this._set.add(c);}, remove(c){this._set.delete(c);}, contains(c){return this._set.has(c);} },
    querySelector() { return this._img; } });
  // classList는 el._cls를 참조하도록 바인딩
  const bind = el => { el.classList._set = el._cls; return el; };
  const elsByName = {};
  const $ = (name) => { if (!elsByName[name]) elsByName[name] = bind(mkEl(name)); return elsByName[name]; };
  return { setTimeoutV, clearTimeoutV, advance, markHideAll, firedAfterHideAllCount, $, elsByName };
}

// 원문/후보 블록을 주어진 env에서 인스턴스화 (showImg/hideAll/cImgs/_prevImg 노출)
function instantiate(blockText, env) {
  const wrapped = `(function($, setTimeout, clearTimeout){\n${blockText}\nreturn {showImg, hideAll, cImgs, getPrev:()=>_prevImg};\n})`;
  const ctx = {}; vm.createContext(ctx);
  const factory = vm.runInContext(wrapped, ctx, { filename: 'showImg-block' });
  return factory(env.$, env.setTimeoutV, env.clearTimeoutV);
}

// ── 후보 블록: 원문 블록에 최소 guard 2개 적용 (명시적 transform) ──
function makeCandidateBlock(src) {
  let out = src;
  // (2) lifetime: _prevImg 선언 뒤에 _fadeTimers 추가
  out = out.replace('let _prevImg=-1;', 'let _prevImg=-1;const _fadeTimers=new Set();');
  // (1)+(2): defect 라인 2246 교체 — _pi capture + 현재컷 guard + timer-id 추적
  const DEFECT = "else if(i===_prevImg){el.style.zIndex=3;setTimeout(()=>{el.classList.remove('show');const im2=el.querySelector('img');if(im2)im2.style.animation=''},800);}";
  const FIX = "else if(i===_prevImg){el.style.zIndex=3;const _pi=i;const _tid=setTimeout(()=>{_fadeTimers.delete(_tid);if(_pi!==_prevImg){el.classList.remove('show');const im2=el.querySelector('img');if(im2)im2.style.animation=''}},800);_fadeTimers.add(_tid);}";
  if (!out.includes(DEFECT)) throw new Error('후보 transform: defect 문자열 미발견 — 중단');
  out = out.replace(DEFECT, FIX);
  // hideAll: 대기 타이머 clear (lifetime)
  const HIDEALL = "const hideAll=()=>{cImgs.forEach(el=>{el.classList.remove('show');el.style.zIndex=3});_prevImg=-1;};";
  const HIDEALL_FIX = "const hideAll=()=>{_fadeTimers.forEach(id=>clearTimeout(id));_fadeTimers.clear();cImgs.forEach(el=>{el.classList.remove('show');el.style.zIndex=3});_prevImg=-1;};";
  if (!out.includes(HIDEALL)) throw new Error('후보 transform: hideAll 문자열 미발견 — 중단');
  out = out.replace(HIDEALL, HIDEALL_FIX);
  return out;
}

const candidateBlock = makeCandidateBlock(block);

console.log('== 원문 추출 근거 ==');
console.log('index.html whole SHA256 :', sha(idxText));
console.log('block(2236-2251) SHA256 :', sha(block));
console.log('defect line 2246 SHA256 :', sha(line2246));

let pass = 0, fail = 0;
const check = (n, got, want) => { const ok = Object.is(got, want); console.log(`${ok ? 'PASS' : 'FAIL'} | ${n} | got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); ok ? pass++ : fail++; };
const hasShow = (api, name) => api.__env.elsByName['cinImg' + name]?.classList.contains('show') ?? false;

function run(blockText, label) {
  const env = makeEnv();
  const api = instantiate(blockText, env);
  api.__env = env;
  // cImgs[i] 는 $('cinImg'+(i+1)) 이므로 idx i → 이름 (i+1)
  return { env, api, show: (i) => api.showImg(i), hide: () => { env.markHideAll(); api.hideAll(); }, adv: (ms) => env.advance(ms),
    curHasShow: (i) => env.elsByName['cinImg' + (i + 1)]?.classList.contains('show') ?? false,
    firedAfterHide: () => env.firedAfterHideAllCount() };
}

console.log('\n== S1: 빠른 B→A (동일 run, 800ms 내) — idx 0→1→0 후 advance 800 ==');
{
  const cur = run(block, 'current');
  cur.show(0); cur.show(1); cur.show(0); cur.adv(800);
  console.log('  현재식 el0(현재 컷) has show =', cur.curHasShow(0));
  check('현재식 S1: 현재 컷 el0 이 stale 타이머로 숨겨짐(defect)', cur.curHasShow(0), false);

  const cand = run(candidateBlock, 'candidate');
  cand.show(0); cand.show(1); cand.show(0); cand.adv(800);
  console.log('  후보식 el0(현재 컷) has show =', cand.curHasShow(0));
  check('후보식 S1: 현재 컷 el0 유지(guard)', cand.curHasShow(0), true);
  check('후보식 S1: el1(비현재) 은 정상 fade out', cand.curHasShow(1), false);
}

console.log('\n== S2(control): 정상 A→B fade — idx 0→1 후 advance 800 ==');
{
  const cur = run(block, 'current');
  cur.show(0); cur.show(1); cur.adv(800);
  check('현재식 S2: el0 정상 fade out', cur.curHasShow(0), false);
  check('현재식 S2: el1 현재 컷 유지', cur.curHasShow(1), true);

  const cand = run(candidateBlock, 'candidate');
  cand.show(0); cand.show(1); cand.adv(800);
  check('후보식 S2: el0 정상 fade out(보존)', cand.curHasShow(0), false);
  check('후보식 S2: el1 현재 컷 유지(보존)', cand.curHasShow(1), true);
}

console.log('\n== S3(lifetime): 완료/재진입 전 hideAll — idx 0→1, hideAll(), advance 800 ==');
{
  const cur = run(block, 'current');
  cur.show(0); cur.show(1); cur.hide(); cur.adv(800);
  console.log('  현재식 hideAll 이후 fire 된 stale 타이머 수 =', cur.firedAfterHide());
  check('현재식 S3: stale 타이머가 hideAll 이후에도 fire(미정리)', cur.firedAfterHide() > 0, true);

  const cand = run(candidateBlock, 'candidate');
  cand.show(0); cand.show(1); cand.hide(); cand.adv(800);
  console.log('  후보식 hideAll 이후 fire 된 stale 타이머 수 =', cand.firedAfterHide());
  check('후보식 S3: hideAll 이 대기 타이머 정리(0 fire)', cand.firedAfterHide(), 0);
}

console.log(`\n== ${pass} PASS / ${fail} FAIL ==`);
console.log('원문 showImg/hideAll=추출 verbatim. 후보=명시적 최소 transform(2246 guard + _fadeTimers clear). DOM/clock=명시적 대역, 실브라우저/영상 미실행.');
console.log('교차-run(재진입) 주의: _goCinematic:2722 는 show 만 리셋하고 이전 run 의 800ms 타이머를 clear 하지 않음(id 미추적) → 교차-run stale 는 공유 레지스트리/teardown clear 통합 필요(root).');
console.log('productionApplied=false · runtimeAccepted=false · 실브라우저/native/청취/GPU/배포 PASS 아님');
process.exit(fail ? 1 : 0);
