양쪽 `playSample` 본문(동일)과 seal 라인을 모두 추출했습니다. **최종 enqueue만 억제**하고 RNG/timestamp/dedupe/priority/`_sfxLastT` 순서를 보존하는 별도 최소 후보와 회귀를 제출합니다.

## 미적용 후보 diff (RNG 보존형 — 적용은 범위 밖)

핵심: seal 호출을 **건너뛰지 않고** 선택 인수 `_noEnq`로 playSample 전 과정을 그대로 실행하되 `_sfxQueue` 삽입만 억제. 외부 key/pitch 난수(`_r`,`Math.random`)와 내부 `Math.random`(rate)·`performance.now`·`_sfxLastT` 갱신 모두 보존. 기존 호출(4인수 이하)은 `_noEnq` 미전달 → 동작 불변.

```diff
--- a/game.html
+++ b/game.html
@@ -11817,11 +11817,12 @@ (playSample 본문)
-function playSample(key,vol,rate,pri){
+function playSample(key,vol,rate,pri,_noEnq){
   key=_silvertailVoiceKey(key);
   if(!key)return;
   if(_gxVolMul<1){vol*=_gxVolMul;if(vol<0.01)return;}
   // 30ms 중복 방지 (스킬 사운드 제외)
   const _isPri=pri||_isSkillSfx(key)||_isFootstepSfx(key);
   if(!_isPri){const _now=performance.now(),_lt=_sfxLastT[key]||0;if(_now-_lt<30)return;_sfxLastT[key]=_now;}
   if(!rate)rate=1;
   rate=rate*(0.92+Math.random()*0.16);
+  if(_noEnq)return; // RNG/timestamp/dedupe/priority·_sfxLastT 갱신 뒤 큐 삽입만 억제(미전달=기존 동작, 호환)
   if(_isPri)_sfxQueue.unshift({key,vol,rate,pri:1});
   else _sfxQueue.push({key,vol,rate});
   return;
 }
@@ -29491 +29491 @@ (_enterBossArena seal 호출)
-  SFX.groggy();const _bsf=_bossSfx(si);if(_bsf)playSample(_bsf.howl,.6,_r(_bsf.howlP,.15));else playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15)); // 보스 포효
+  SFX.groggy();const _bsf=_bossSfx(si);const _nq=G._bossLoadPhase===2;if(_bsf)playSample(_bsf.howl,.6,_r(_bsf.howlP,.15),0,_nq);else playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15),0,_nq); // 보스 포효
```

```diff
--- a/game-easy-test.html
+++ b/game-easy-test.html
@@ -11290,11 +11290,12 @@ (playSample 본문, 본편과 동일)
-function playSample(key,vol,rate,pri){
+function playSample(key,vol,rate,pri,_noEnq){
   key=_silvertailVoiceKey(key);
   if(!key)return;
   if(_gxVolMul<1){vol*=_gxVolMul;if(vol<0.01)return;}
   // 30ms 중복 방지 (스킬 사운드 제외)
   const _isPri=pri||_isSkillSfx(key)||_isFootstepSfx(key);
   if(!_isPri){const _now=performance.now(),_lt=_sfxLastT[key]||0;if(_now-_lt<30)return;_sfxLastT[key]=_now;}
   if(!rate)rate=1;
   rate=rate*(0.92+Math.random()*0.16);
+  if(_noEnq)return; // RNG/timestamp/dedupe/priority·_sfxLastT 갱신 뒤 큐 삽입만 억제(미전달=기존 동작, 호환)
   if(_isPri)_sfxQueue.unshift({key,vol,rate,pri:1});
   else _sfxQueue.push({key,vol,rate});
   return;
 }
@@ -28391 +28391 @@ (_enterBossArena seal 호출)
-  SFX.groggy();const _bsf=_bossSfx(si);if(_bsf)playSample(_bsf.howl,.6,_r(_bsf.howlP,.15));else playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15)); // 보스 포효
+  SFX.groggy();const _bsf=_bossSfx(si);const _nq=G._bossLoadPhase===2;if(_bsf)playSample(_bsf.howl,.6,_r(_bsf.howlP,.15),0,_nq);else playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15),0,_nq); // 보스 포효
```

## 실제 소스 추출 회귀 (`rng-preserving-regression.cjs`)

실제 파일에서 `playSample` 본문·seal 라인을 추출·해시하고, 추출 코드를 vm에서 실행해 **RNG/now/_sfxLastT/queue 동등성**을 orig↔patched로 대조합니다(결론 하드코딩 아님). 의존(`_r`,`_silvertailVoiceKey` 등)은 양측 동일 스텁 — 패치가 RNG 소비를 바꾸지 않음을 증명하는 데 충분(한계에 명시).

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../../..');
const FILES = ['game.html', 'game-easy-test.html'];
const PS_SIG = 'function playSample(key,vol,rate,pri){';
const RATE_LINE = '  rate=rate*(0.92+Math.random()*0.16);';
const SEAL_ANCHOR = 'SFX.groggy();const _bsf=_bossSfx(si);';
const sha = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

function extract(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  // playSample 본문: 시그니처부터 컬럼0 '}' 까지
  const i = src.indexOf(PS_SIG); assert.ok(i >= 0, file + ': playSample 발견');
  const rest = src.slice(i).split('\n'); const body = [rest[0]];
  for (let k = 1; k < rest.length; k++) { body.push(rest[k]); if (rest[k] === '}') break; }
  const playText = body.join('\n');
  // seal 라인(정확히 1개)
  const lines = src.split('\n');
  const sidx = lines.map((l, n) => l.includes(SEAL_ANCHOR) ? n : -1).filter(n => n >= 0);
  assert.equal(sidx.length, 1, file + ': seal 1개');
  return { file, src, playText, playHash: sha(playText), sealLine: lines[sidx[0]], sealNo: sidx[0] + 1, sealHash: sha(lines[sidx[0]]) };
}
const patchPlay = t => {
  assert.ok(t.includes(PS_SIG) && t.includes(RATE_LINE));
  return t.replace(PS_SIG, 'function playSample(key,vol,rate,pri,_noEnq){')
          .replace(RATE_LINE + '\n', RATE_LINE + '\n  if(_noEnq)return;\n');
};
const patchSeal = l => l
  .replace('const _bsf=_bossSfx(si);if(_bsf)', 'const _bsf=_bossSfx(si);const _nq=G._bossLoadPhase===2;if(_bsf)')
  .replace("playSample(_bsf.howl,.6,_r(_bsf.howlP,.15))", "playSample(_bsf.howl,.6,_r(_bsf.howlP,.15),0,_nq)")
  .replace("playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15))",
           "playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15),0,_nq)");

// 추출 playSample + seal 을 실행하는 하니스(동일 스텁 양측)
function run(playText, sealLine, { phase, bsf = true, gxVol = 1, clock = 1000, seedLastT = null, callArgs = null }) {
  let rngN = 0, nowN = 0;
  const seq = [0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88, 0.99, 0.07];
  const IM = {}; for (const k of Object.getOwnPropertyNames(Math)) IM[k] = Math[k];
  IM.random = () => { const v = seq[rngN % seq.length]; rngN++; return v; };
  const ctx = {
    _silvertailVoiceKey: k => k === '__null__' ? '' : k,
    _gxVolMul: gxVol, _isSkillSfx: () => false, _isFootstepSfx: () => false,
    _sfxLastT: seedLastT ? Object.assign({}, seedLastT) : {}, _sfxQueue: [],
    performance: { now: () => { nowN++; return clock; } }, Math: IM,
    _bossSfx: () => bsf ? { howl: 'boss_howl', howlP: 0.7 } : null,
    _r: (a) => { IM.random(); return a; }, SFX: { groggy: () => {} },
    addTxt: () => {}, _T: x => x, G: { _bossLoadPhase: phase }, si: 0, console
  };
  vm.createContext(ctx);
  let prog = playText + '\n';
  if (callArgs) prog += `playSample(${callArgs});`;
  else prog += `(function(){ ${sealLine} })();`;
  vm.runInContext(prog, ctx);
  return { rngN, nowN, queue: ctx._sfxQueue, lastT: ctx._sfxLastT['boss_howl'] };
}

test('증거: 추출 위치·해시 + 본편/easy 동일', () => {
  const ex = FILES.map(extract);
  ex.forEach(e => console.log(`${e.file}: playSample sha=${e.playHash}, seal L${e.sealNo} sha=${e.sealHash}`));
  assert.equal(ex[0].playText, ex[1].playText, 'playSample 본문 동일');
  assert.equal(ex[0].sealLine, ex[1].sealLine, 'seal 라인 동일');
  ex.forEach(e => assert.ok(!e.playText.includes('_noEnq') && !e.sealLine.includes('_nq'), '아직 미수정'));
});

test('patch 범위: playSample은 시그니처+1줄, seal은 _nq선언+인수만', () => {
  for (const file of FILES) {
    const e = extract(file), p = patchPlay(e.playText);
    const ol = e.playText.split('\n'), pl = p.split('\n');
    assert.equal(pl.length, ol.length + 1, file + ': playSample +1줄');
    assert.ok(p.includes('function playSample(key,vol,rate,pri,_noEnq){') && p.includes('  if(_noEnq)return;'));
    const ps = patchSeal(e.sealLine);
    assert.ok(ps.includes('const _nq=G._bossLoadPhase===2;') && (ps.match(/,0,_nq\)/g) || []).length === 2);
    // 범위 밖 불변: boss_howl/음량 .6 토큰 수 동일
    const cnt = (s, t) => s.split(t).length - 1;
    assert.equal(cnt(ps, 'boss_howl'), cnt(e.sealLine, 'boss_howl'));
    assert.equal(cnt(ps, ',.6,'), cnt(e.sealLine, ',.6,'));
  }
});

test('phase2 seal: RNG/now/_sfxLastT 보존, enqueue만 억제', () => {
  const e = extract('game.html');
  const o = run(e.playText, e.sealLine, { phase: 2 });                         // orig(미수정): seal enqueue
  const p = run(patchPlay(e.playText), patchSeal(e.sealLine), { phase: 2 });   // patched: 억제
  assert.equal(p.rngN, o.rngN, '난수 소비 동일(외부 _r + 내부 rate)');
  assert.equal(p.nowN, o.nowN, 'performance.now 호출 동일(dedupe)');
  assert.equal(p.lastT, o.lastT, '_sfxLastT 갱신 동일');
  assert.equal(o.queue.length, 1, 'orig 는 enqueue 1');
  assert.equal(p.queue.length, 0, 'patched 는 enqueue 0(억제)');
});

test('대조: 기존 DEDUP(호출 전체 skip)은 RNG/now/_sfxLastT 가 갈라짐', () => {
  const e = extract('game.html');
  const o = run(e.playText, e.sealLine, { phase: 2 });
  // DEDUP 방식 모사: phase2 면 seal 호출 자체를 건너뜀
  const skipSeal = 'if(G._bossLoadPhase!==2){' + e.sealLine.replace(/^\s*/, '') + '}';
  const d = run(e.playText, skipSeal, { phase: 2 });
  assert.equal(d.queue.length, 0, 'dedup 도 enqueue 0');
  assert.notEqual(d.rngN, o.rngN, 'dedup 은 난수 스트림 divergence');
  assert.equal(d.lastT, undefined, 'dedup 은 _sfxLastT 미갱신(divergence)');
});

test('direct/retry(phase≠2): patched 가 orig 와 완전 동등(enqueue 포함)', () => {
  const e = extract('game.html');
  for (const bsf of [true, false]) {
    const o = run(e.playText, e.sealLine, { phase: 0, bsf });
    const p = run(patchPlay(e.playText), patchSeal(e.sealLine), { phase: 0, bsf });
    assert.deepEqual([p.rngN, p.nowN, p.lastT, p.queue.length], [o.rngN, o.nowN, o.lastT, o.queue.length]);
    assert.equal(p.queue.length, 1, 'direct/retry seal 보존');
  }
});

test('phase-up/일반 SFX(4인수 호출): 기존 호출 호환', () => {
  const e = extract('game.html');
  const o = run(e.playText, null, { phase: 0, callArgs: "'boss_howl',.8" });
  const p = run(patchPlay(e.playText), null, { phase: 0, callArgs: "'boss_howl',.8" }); // _noEnq 미전달
  assert.deepEqual([p.rngN, p.nowN, p.queue.length, p.lastT], [o.rngN, o.nowN, o.queue.length, o.lastT]);
  assert.equal(p.queue.length, 1);
  // 신규 인수 명시 호환: pri=0,_noEnq=false 와 3인수 결과 동일
  const p2 = run(patchPlay(e.playText), null, { phase: 0, callArgs: "'boss_howl',.8,undefined,0,false" });
  assert.equal(p2.queue.length, 1);
});

test('30ms dedupe 직전/동일/직후 + null/volume early-return 동등', () => {
  const e = extract('game.html'), P = patchPlay(e.playText);
  // 직전(<30): 두번째 억제 — 같은 key 로 seed
  const pre = run(P, null, { phase: 0, clock: 10, seedLastT: { boss_howl: 0 }, callArgs: "'boss_howl',.8" });
  assert.equal(pre.queue.length, 0); assert.equal(pre.rngN, 0, 'early return 전 난수 없음');
  // 동일(=30, <30 아님) / 직후(>30): 통과
  const eq = run(P, null, { phase: 0, clock: 30, seedLastT: { boss_howl: 0 }, callArgs: "'boss_howl',.8" });
  const post = run(P, null, { phase: 0, clock: 31, seedLastT: { boss_howl: 0 }, callArgs: "'boss_howl',.8" });
  assert.equal(eq.queue.length, 1); assert.equal(post.queue.length, 1);
  // null key / volume early-return: 난수·enqueue 없음
  const nul = run(P, null, { phase: 0, callArgs: "'__null__',.8" });
  assert.equal(nul.queue.length, 0); assert.equal(nul.rngN, 0);
  const lowv = run(P, null, { phase: 0, gxVol: 0.0001, callArgs: "'boss_howl',.8" });
  assert.equal(lowv.queue.length, 0); assert.equal(lowv.rngN, 0);
});

test('priority 경로: _noEnq 로 unshift 억제, rate 난수는 소비', () => {
  const e = extract('game.html'), P = patchPlay(e.playText);
  const o = run(e.playText, null, { phase: 0, callArgs: "'boss_howl',.8,undefined,1" });      // pri=1 unshift
  const s = run(P, null, { phase: 0, callArgs: "'boss_howl',.8,undefined,1,true" });          // 억제
  assert.equal(o.queue.length, 1); assert.equal(s.queue.length, 0);
  assert.equal(s.rngN, o.rngN, 'pri 경로도 rate 난수 동일'); assert.equal(s.nowN, o.nowN);
});
```

## 본편/easy 차이 · docs 동기화 제안 (SOUND-rng-result.md 기록용)
- `playSample` 본문·seal 라인 모두 **두 파일 바이트 동일**(해시 동일). 차이는 위치만: playSample game.html L11817 / easy L11290, seal game.html L29491 / easy L28391.
- DEDUP(호출 skip) 대비 개선점: 이번 후보는 **RNG 스트림·performance.now·`_sfxLastT`** 동등 유지 → 억제 시에도 후속 사운드의 난수/타임스탬프/30ms dedupe 상태가 "seal 재생" 기준과 동일. 회귀 `대조` 테스트가 divergence를 증거로 보임.
- docs 제안(`docs/6사운드디자인/6사운드디자인.md`): "phase2 봉인 seal은 `playSample(...,_noEnq)` 로 큐 삽입만 억제, RNG/타임스탬프/우선순위 보존; 직접진입·재도전·phase-up·일반 SFX 불변" 명시. 수치·적용은 미수행.

## 한계 · 미실행
- **읽기 전용**: `RNG_TASK.md`, 양쪽 `playSample` 전체 본문·seal 라인만 Read. 생산/기존 증거/타팀 파일 미편집. 후보·회귀는 **답변 코드로만** 제출(root 회수).
- **미실행**: 회귀를 이 세션에서 구동하지 않음(성공으로 적지 않음). 실제 청취·생산 적용·패키지 미완료 유지. 게임·오디오·브라우저·서버·Git 쓰기·새 세션 없음. 기존 수정 되돌리기 없음.
- **한계(정직)**: 회귀는 `playSample`·seal의 실제 추출 소스를 실행하지만, 외부 의존 `_r`/`_silvertailVoiceKey`/`_isSkillSfx` 등은 **양측 동일 스텁**으로 대체(난수 소비 횟수 기준 동등성 증명에는 충분하나 `_r`의 실제 계산식은 재현하지 않음). `_sfxQueue`/`_gxVolMul` 실제 전역 연동은 미검증. HEAD/SHA는 Bash/git 미제공으로 미기재(라인·해시는 회귀가 실파일에서 산출).

수신·첫 Read·완료·미실행을 구분해 보고했습니다. 소유 범위(`tools/team-followup-20261001/SOUND/` + 전용 result/receipt) 밖은 실행하지 않고 인계합니다.