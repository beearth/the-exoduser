양쪽 소스를 추출했습니다. **현재 game.html:29491 과 game-easy-test.html:28391 의 seal howl 라인은 바이트 동일**하며 둘 다 `_bossLoadPhase!==2` 가드가 없습니다(중복 미수정). 최소 미적용 patch와 실제 소스 추출 회귀를 제출합니다.

## 미적용 patch (양쪽, unified diff — 적용은 범위 밖)

`SFX.groggy()`와 `addTxt('봉인됨!')`은 가드 밖에 유지(groggy·봉인 텍스트 전 경로 보존), **seal howl playSample만** phase2에서 억제. 보스 상태/음량(.6)/리소스/전투/저장 수치 무변경.

```diff
--- a/game.html
+++ b/game.html
@@ -29490,3 +29490,3 @@
   G.shake=8*OPT.shake/100;
-  SFX.groggy();const _bsf=_bossSfx(si);if(_bsf)playSample(_bsf.howl,.6,_r(_bsf.howlP,.15));else playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15)); // 보스 포효
+  SFX.groggy();if(G._bossLoadPhase!==2){const _bsf=_bossSfx(si);if(_bsf)playSample(_bsf.howl,.6,_r(_bsf.howlP,.15));else playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15));} // 보스 포효
   addTxt(P.x,P.y-50,'\u26A0 '+_T('봉인됨!'),_sCol,70);
```

```diff
--- a/game-easy-test.html
+++ b/game-easy-test.html
@@ -28390,3 +28390,3 @@
   G.shake=8*OPT.shake/100;
-  SFX.groggy();const _bsf=_bossSfx(si);if(_bsf)playSample(_bsf.howl,.6,_r(_bsf.howlP,.15));else playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15)); // 보스 포효
+  SFX.groggy();if(G._bossLoadPhase!==2){const _bsf=_bossSfx(si);if(_bsf)playSample(_bsf.howl,.6,_r(_bsf.howlP,.15));else playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15));} // 보스 포효
   addTxt(P.x,P.y-50,'\u26A0 '+_T('봉인됨!'),_sCol,70);
```

## 실제 소스 추출 회귀 (`dedup-source-regression.cjs`)

mock에 결론을 넣지 않고 **실제 파일에서 seal 라인을 추출·해시·실행**하여 수정 전/후를 검증합니다.

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '../../..'); // tools/team-followup-20261001/SOUND → repo root
const FILES = ['game.html', 'game-easy-test.html'];
const SEAL_ANCHOR = 'SFX.groggy();const _bsf=_bossSfx(si);';
const ENTER_SIG = 'function _enterBossArena(retry=false){';
const ENTRANCE_HINT = "playSample(_bsf?_bsf.howl:'boss_howl',1.0,";          // phase4 입장 포효
const PHASEUP_HINT = "playSample(Math.random()<.5?'boss_howl':'boss_howl1',.8,"; // 교전 phase-up 포효(setTimeout)
const sha = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

function extract(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const lines = src.split('\n');
  const idxs = lines.map((l, i) => l.includes(SEAL_ANCHOR) ? i : -1).filter(i => i >= 0);
  assert.equal(idxs.length, 1, file + ': seal 라인은 정확히 1개여야 함');
  const idx = idxs[0];
  return { file, src, lines, idx, line: lines[idx], lineNo: idx + 1, hash: sha(lines[idx]) };
}
function guard(line) {               // patch 와 동일한 변환
  assert.ok(line.includes(SEAL_ANCHOR) && line.includes('; // 보스 포효'));
  return line
    .replace(SEAL_ANCHOR, 'SFX.groggy();if(G._bossLoadPhase!==2){const _bsf=_bossSfx(si);')
    .replace('; // 보스 포효', ';} // 보스 포효');
}
// 추출한 "실제 seal 문장"을 그대로 실행하는 하니스(동작 하드코딩 아님)
function runSeal(lineBody, { phase, bsf }) {
  let howls = 0, groggy = 0; const keys = new Set(['boss_howl', 'boss_howl1']);
  const G = { _bossLoadPhase: phase };
  const SFX = { groggy: () => groggy++ };
  const _bossSfx = () => bsf ? { howl: 'boss_howl', howlP: .7 } : null;
  const _r = (a) => a; const playSample = (k) => { if (keys.has(k)) howls++; };
  const body = lineBody.trim();
  new Function('G', 'SFX', '_bossSfx', '_r', 'playSample', 'si', body)(G, SFX, _bossSfx, _r, playSample, 0);
  return { howls, groggy };
}

test('증거: seal 라인 추출·위치·해시 + 미수정(가드 없음) + 본편/easy 동일', () => {
  const ex = FILES.map(extract);
  for (const e of ex) {
    console.log(`${e.file}:${e.lineNo} sha256=${e.hash}`);
    assert.ok(!e.line.includes('_bossLoadPhase!==2'), e.file + ': 아직 가드 없음(미수정)');
  }
  assert.equal(ex[0].line, ex[1].line, '현재 두 파일 seal 라인은 바이트 동일');
  assert.equal(ex[0].hash, ex[1].hash, 'seal 라인 해시 동일');
});

test('수정 전: 모든 경로에서 seal howl 1회(phase2 포함 = 중복 기여)', () => {
  const { line } = extract('game.html');
  for (const bsf of [true, false]) {
    assert.equal(runSeal(line, { phase: 2, bsf }).howls, 1, 'phase2 boss-door seal 발생(중복원인)');
    assert.equal(runSeal(line, { phase: 0, bsf }).howls, 1, 'direct(phase0) seal 1');
    assert.equal(runSeal(line, { phase: 0, bsf }).howls, 1, 'retry(phase0) seal 1'); // 재도전은 phase 0
  }
});

test('수정 후: phase2만 억제(0), direct/retry 보존(1), groggy 항상 보존', () => {
  for (const file of FILES) {
    const { line } = extract(file);
    const g = guard(line);
    assert.ok(g.includes('if(G._bossLoadPhase!==2){') && g.trim().endsWith(';} // 보스 포효'), file + ': 가드 형태');
    for (const bsf of [true, false]) {
      assert.equal(runSeal(g, { phase: 2, bsf }).howls, 0, file + ' phase2 seal 억제');
      assert.equal(runSeal(g, { phase: 0, bsf }).howls, 1, file + ' direct 보존');
      assert.equal(runSeal(g, { phase: 0, bsf }).howls, 1, file + ' retry 보존');
      assert.equal(runSeal(g, { phase: 2, bsf }).groggy, 1, file + ' groggy 보존');
    }
  }
});

test('범위 한정: pre/post 소스 차이는 seal 1줄뿐, entrance/phase-up/봉인텍스트/음량 보존', () => {
  for (const file of FILES) {
    const e = extract(file);
    const post = e.lines.slice(); post[e.idx] = guard(e.line);
    const diffs = post.map((l, i) => l !== e.lines[i] ? i : -1).filter(i => i >= 0);
    assert.deepEqual(diffs, [e.idx], file + ': 정확히 seal 1줄만 변경');
    const postSrc = post.join('\n');
    assert.ok(postSrc.includes(ENTRANCE_HINT), file + ': phase4 입장 포효 보존');   // 별도 라인 불변
    assert.ok(postSrc.includes(PHASEUP_HINT), file + ': phase-up 포효 보존');        // 별도 라인 불변
    assert.ok(postSrc.includes(ENTER_SIG), file + ': _enterBossArena 시그니처 불변');
    assert.ok(post[e.idx].includes("'\\u26A0 '") === false); // (텍스트는 다음 줄)
    // 범위 밖 sfx/음량 무변경: boss_howl 총 개수와 ".6" 음량 리터럴 개수 동일
    const cnt = (s, t) => s.split(t).length - 1;
    assert.equal(cnt(postSrc, 'boss_howl'), cnt(e.src, 'boss_howl'), file + ': boss_howl 토큰 수 불변');
    assert.equal(cnt(postSrc, '_bossSfx('), cnt(e.src, '_bossSfx('), file + ': _bossSfx 호출 수 불변');
    assert.ok(post[e.idx].includes(',.6,') && post[e.idx].includes("'봉인됨!'") === false); // 음량 .6 유지(봉인텍스트는 다음 줄)
  }
});

test('본편/easy 차이: 라인 내용 동일, 함수 위치만 상이', () => {
  const a = extract('game.html'), b = extract('game-easy-test.html');
  assert.equal(a.line, b.line);
  console.log(`enter/seal 위치 — game.html seal L${a.lineNo}, easy seal L${b.lineNo}`);
  assert.notEqual(a.lineNo, b.lineNo); // 위치는 다름(내용 동일)
});
```

## 본편/easy 차이 · docs 동기화 제안 (SOUND-dedup-result.md 기록용)
- **seal 라인 내용**: 두 파일 **바이트 동일**(동일 해시) — 이 hunk는 양쪽에 같은 변환. 차이는 **위치만**(game.html seal L29491 / `_enterBossArena` L29428, easy seal L28391 / L28330).
- **보존 대상**: 입장 포효(phase4, `playSample(...,1.0,...)`), 교전 phase-up(`setTimeout ... ,.8,`)은 **별도 라인**이라 hunk 무관 — 회귀에서 불변 확인.
- **docs 동기화**: `docs/6사운드디자인/6사운드디자인.md` 보스 포효 항목에 "보스문 정상=phase4 입장 포효 1회, 봉인 포효(seal)는 phase2에서 중복 억제; 재도전·직행·phase-up 각 1회 보존" 명시 제안. 적용·수치 변경은 미수행.

## 미실행 / 범위
- **읽기 전용**: `DEDUP_TASK.md`, 양쪽 소스 seal/enter 라인만 Read. game/easy/공용 파일 미편집, patch·회귀는 **답변 코드로만 제출**(root 회수).
- **미실행**: 회귀 테스트를 이 세션에서 구동하지 않음(성공으로 적지 않음). 실제 청취·생산 적용·패키지 인수 **미완료 유지**. 게임·오디오·브라우저·서버·대형빌드·Git 쓰기·새 세션 없음.
- HEAD/SHA는 이 세션에서 직접 조회 불가(Bash/git 미제공)로 **미기재**. 라인 위치·해시는 회귀가 실제 파일에서 산출하도록 구성.

수신·Read 착수·완료·미실행을 구분해 보고했습니다. 소유 범위(`tools/team-followup-20261001/SOUND/` + 전용 result/receipt) 밖은 실행하지 않고 인계합니다.