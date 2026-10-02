// STORY-hold-listener-reentry-1212 — 홀드-스킵 입력 리스너의 재진입 중복 수명 (실제 teardown wiring)
//
// 1150에서 확인: _cinDone 모듈 스코프(index.html:2155) + 홀드 블록의 document keydown/keyup(_chk/_chu)·
// _GP.on('cinHold')가 공유 teardown stopWorldIntro(2159)에서 정리되지 않아, 재진입(_goCinematic→
// stopWorldIntro→playCinematic)마다 리스너가 중복 누적된다.
// 이 검증기는 원문 stopWorldIntro(2159-2165)와 홀드 등록 슬라이스(2519-2541)를 verbatim 추출해 실행하고,
// 정리는 **실제 (patched) stopWorldIntro() 호출**로 일어난다 — fixture 가 직접 removeEventListener/cleanup 을
// 호출해 PASS 를 만들지 않는다. 5000ms 등 수치/대사 불변. latent showImg 이전 검사 반복 0.
// productionApplied=false, runtimeAccepted=false. 실브라우저/native/청취 미검수.
//
// Node=/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node

import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const idxText = fs.readFileSync(ROOT + '/index.html', 'utf8');
const L = idxText.split('\n');

// ── 원문 verbatim 추출 + 마커 단언 ──
const swiSrc = L.slice(2159 - 1, 2165).join('\n'); // function stopWorldIntro(){ ... }
if (!/^function stopWorldIntro\(\)\{/.test(swiSrc) || !/_cinKeyCleanup\(\);_cinKeyCleanup=null;/.test(swiSrc))
  throw new Error('stopWorldIntro 마커 불일치 — 추출 경계 변동, 억지 PASS 금지');
const regSrc = L.slice(2519 - 1, 2541).join('\n'); // let _cinHoldKey... ~ _GP.on('cinHold',...)
if (!/document\.addEventListener\('keydown',function _chk/.test(regSrc) || !/document\.addEventListener\('keyup',function _chu/.test(regSrc) || !/_GP\.on\('cinHold'/.test(regSrc) || !/const _CIN_HOLD_DUR=5000;/.test(regSrc))
  throw new Error('홀드 등록 슬라이스 마커 불일치 — 중단');

// ── PATCH (명시적 transform, 원소스 미변경) ──
// (1) stopWorldIntro 에 _cinHoldCleanup 자동 호출 1줄 추가(공유 teardown 1곳)
const swiPatched = swiSrc.replace(
  'if(_cinKeyCleanup){_cinKeyCleanup();_cinKeyCleanup=null;}',
  'if(_cinKeyCleanup){_cinKeyCleanup();_cinKeyCleanup=null;}\n  if(_cinHoldCleanup){_cinHoldCleanup();_cinHoldCleanup=null;}'
);
if (swiPatched === swiSrc) throw new Error('swi patch 실패');
// (2) 홀드 등록 패치: named function EXPRESSION 의 이름(_chk/_chu)은 외부에서 참조 불가 →
//     리스너를 const(_holdKeydown/_holdKeyup)로 바인딩하고 _cinHoldCleanup 이 그 ref 로 제거.
//     (S2 ReferenceError 로 드러난 실제 결함: naive removeEventListener('keydown',_chk) 는 throw.)
let regPatched = regSrc
  .replace(/document\.addEventListener\('keydown',function _chk\(e\)\{([\s\S]*?)\n\s*\}\);/,
    "const _holdKeydown=function _chk(e){$1\n};document.addEventListener('keydown',_holdKeydown);")
  .replace(/document\.addEventListener\('keyup',function _chu\(e\)\{([\s\S]*?)\n\s*\}\);/,
    "const _holdKeyup=function _chu(e){$1\n};document.addEventListener('keyup',_holdKeyup);");
if (!regPatched.includes('const _holdKeydown=') || !regPatched.includes('const _holdKeyup='))
  throw new Error('홀드 리스너 const 바인딩 transform 실패');
regPatched += "\n_cinHoldCleanup=()=>{document.removeEventListener('keydown',_holdKeydown);document.removeEventListener('keyup',_holdKeyup);_GP.off('cinHold');};";

console.log('== 원문 추출 근거 ==');
console.log('index.html whole SHA256    :', sha(idxText));
console.log('stopWorldIntro(2159-2165)  :', sha(swiSrc));
console.log('holdReg(2519-2541)         :', sha(regSrc));

// ── stand-in 환경 (리스너/핸들러 추적) ──
function makeCtx(swiText, regText) {
  const docL = { keydown: new Set(), keyup: new Set() };
  const gpOff = [];
  const document = {
    addEventListener(t, fn) { (docL[t] ||= new Set()).add(fn); },
    removeEventListener(t, fn) { docL[t]?.delete(fn); },
  };
  const _GP = { on(name, fn, act) { /* 등록만 */ }, off(name) { gpOff.push(name); } };
  const $ = () => ({ pause() {}, currentTime: 0, muted: false, volume: 0, classList: { remove() {} }, style: {} });
  const sandbox = {
    document, _GP, $, console: { log() {} },
    _cinKeyCleanup: null, _cinHoldCleanup: null, _worldIntroSubtitles: null, _worldIntroPlayer: null, _cinDone: false,
    stopMediaVideo() {}, performance: { now: () => 0 },
    _docL: docL, _gpOff: gpOff,
  };
  vm.createContext(sandbox);
  // 실제 teardown 함수(추출/patch)와 등록기를 context 안에 정의
  vm.runInContext(swiText + '\nfunction __registerHold(){\n' + regText + '\n}\n', sandbox, { filename: 'extracted' });
  return sandbox;
}
const keydownN = ctx => ctx._docL.keydown.size;
const keyupN = ctx => ctx._docL.keyup.size;

let pass = 0, fail = 0;
const check = (n, got, want) => { const ok = Object.is(got, want); console.log(`${ok ? 'PASS' : 'FAIL'} | ${n} | got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); ok ? pass++ : fail++; };
const call = (ctx, fn) => vm.runInContext(fn + '()', ctx);

console.log('\n== S1 현재식(unpatched) 재진입: run1 등록 → 실제 stopWorldIntro() → run2 등록 ==');
{
  const ctx = makeCtx(swiSrc, regSrc);
  call(ctx, '__registerHold');          // run1
  call(ctx, 'stopWorldIntro');           // 실제 teardown(미정리)
  call(ctx, '__registerHold');          // run2 (재진입)
  console.log('  keydown 리스너 수 =', keydownN(ctx), ', keyup =', keyupN(ctx));
  check('현재식: 재진입 후 keydown 리스너 2개(중복 defect, 실제 teardown 경유)', keydownN(ctx), 2);
  check('현재식: 재진입 후 keyup 리스너 2개(중복)', keyupN(ctx), 2);
  check('현재식: 실제 stopWorldIntro 가 _GP.off(cinHold) 미호출', ctx._gpOff.filter(x => x === 'cinHold').length, 0);
}

console.log('\n== S2 후보(patched) 재진입: run1 → 실제 patched stopWorldIntro() → run2 ==');
{
  const ctx = makeCtx(swiPatched, regPatched);
  call(ctx, '__registerHold');          // run1 + _cinHoldCleanup 설정
  call(ctx, 'stopWorldIntro');           // 실제 patched teardown → _cinHoldCleanup() 자동 호출
  call(ctx, '__registerHold');          // run2
  console.log('  keydown 리스너 수 =', keydownN(ctx), ', keyup =', keyupN(ctx), ', gpOff(cinHold)=', ctx._gpOff.filter(x => x === 'cinHold').length);
  check('후보: 재진입 후 keydown 리스너 1개(중복 해소)', keydownN(ctx), 1);
  check('후보: 재진입 후 keyup 리스너 1개', keyupN(ctx), 1);
  check('후보: 실제 teardown 이 _GP.off(cinHold) 자동 호출', ctx._gpOff.filter(x => x === 'cinHold').length, 1);
}

console.log('\n== S3 control: 후보 단일 run — 등록 중 활성 → teardown 후 0 (정상 hold 보존) ==');
{
  const ctx = makeCtx(swiPatched, regPatched);
  call(ctx, '__registerHold');
  check('control: run 중 keydown 리스너 1개(홀드 활성)', keydownN(ctx), 1);
  call(ctx, 'stopWorldIntro');
  check('control: teardown 후 keydown 0(정상 정리)', keydownN(ctx), 0);
  check('control: teardown 후 keyup 0', keyupN(ctx), 0);
}

console.log('\n== S4 control: 현재식 단일 run teardown 후 잔존(미정리 확인) ==');
{
  const ctx = makeCtx(swiSrc, regSrc);
  call(ctx, '__registerHold');
  call(ctx, 'stopWorldIntro');
  check('현재식: 단일 run teardown 후에도 keydown 1개 잔존(미정리)', keydownN(ctx), 1);
}

console.log(`\n== ${pass} PASS / ${fail} FAIL ==`);
console.log('원문 stopWorldIntro/홀드등록=추출 verbatim. 정리는 실제 (patched) stopWorldIntro() 호출로 발생(fixture 직접 cleanup 아님).');
console.log('_CIN_HOLD_DUR=5000·대사·게이지 동작 불변. 실브라우저 리스너 누적 체감/native/청취 미검수(UNKNOWN). productionApplied=false.');
process.exit(fail ? 1 : 0);
