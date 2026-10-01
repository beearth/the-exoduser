# SKILL — UI03 병행 후속 원문

> 읽기 전용 분석/후보 코드. 총괄의 별도 적용·검사 전에는 실행/채택 완료가 아니다. 후속 정정이 앞선 문구보다 우선한다.

## 2026-10-01T06:09:46.624Z

UI03 후속 건으로, 직전 정적 16검사에서 **미검증으로 남긴 "조준 중 리젠 / 외부 자원 변동 / 취소 후 유령클릭"** 경계만 신규로 다루는 독립 Node 검수 하니스 후보를 완성했습니다. 기존 16개(폭산탄·감사·확정경계 단발)와 겹치지 않는 새 프레임 시나리오로 한정했고, 실제 함수를 소스에서 추출해 연결합니다.

## 설계 근거 (실제 함수/상태/필드 연결)
- **아이스스톰 리젠 블록**(`game.html 34862–34870`, easy `33941±`): 매 프레임 `P._isStk<_isMax`일 때 `P._isRech-=sp` 후 `<=0`이면 스택+1. → 확정 블록보다 **앞서** 실행되므로 "조준 중 리젠 직후 같은 프레임 설치"가 실재.
- **아이스스톰 확정 블록**(`34872–34902`): `if(P._isAiming){...}` 전체를 슬라이스(취소 `MBjust[2]/K['Escape']` 우선, 성공 `MBjust[0]` 시 `_isStk>0`→`P.mp>=40`→중복 순 재검, `P.mp=Math.max(0,P.mp-40)`·zone push·`_isStk--`).
- **fireBoneWall**(`43512–43530`): 진입 즉시 `P._bwAiming=false` **선처리** 후 `_bwStk>0`→`mats>=_malCost(12)` 재검. → iceStorm과 달리 **자원 부족으로 설치 실패해도 조준이 해제**되는 비대칭이 핵심 신규 경계.

리젠 블록을 실제로 추출해 프레임 순서(리젠→확정)를 재현하고, 외부 변동은 프레임 사이 `P.mp/_isStk/G.mats` 직접 변이로 모델링합니다.

## 산출 코드 (후보 — 디스크 미기록)

```javascript
// test/skillAimRegenCancelGate.test.js  [UI03 후속 / SKILL 소유 후보]
// 신규 경계 전용: 조준 중 자동 리젠 · 외부 자원 변동 · 취소 후 유령클릭.
// 기존 skillStackConfirmGate(단발 확정 16검사)와 중복 금지 — 다중 프레임/외부변이만.
// 실제 소스에서 (1) 아이스스톰 리젠 블록 (2) 아이스스톰 확정 블록 (3) fireBoneWall 추출·실행.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const noop = () => {};

for (const file of ['game.html', 'game-easy-test.html']) {
  const source = readFileSync(new URL('../' + file, import.meta.url), 'utf8');

  // ── 준비: 앵커 추출 (배너/들여쓰기 의존 — 못 찾으면 소리내어 실패) ──
  const regenStart = source.indexOf('// ═══ 아이스스톰 — 2스택 충전');
  const regenEnd   = source.indexOf('// ═══ 아이스스톰 — 조준 모드', regenStart);
  const confStart  = source.search(/^  if\(P\._isAiming\)\{\r?$/m);
  const confEnd    = source.indexOf('// ═══ 독가스탄', confStart);
  const boneStart  = source.indexOf('function fireBoneWall(tx,ty){');
  const boneEnd    = source.indexOf('// ═══ 폭산탄', boneStart);
  assert.ok(regenStart >= 0 && regenEnd > regenStart, `${file}: 아이스스톰 리젠 배너 앵커`);
  assert.ok(confStart  >= 0 && confEnd  > confStart,  `${file}: 아이스스톰 확정 블록 앵커`);
  assert.ok(boneStart  >= 0 && boneEnd  > boneStart,  `${file}: fireBoneWall 앵커`);
  const regenSrc = source.slice(regenStart, regenEnd);
  const confSrc  = source.slice(confStart, confEnd);
  const boneSrc  = source.slice(boneStart, boneEnd);

  // 아이스스톰 한 프레임 = 리젠(P,sp) → 확정(click/cancel). 외부변이는 호출 전 P/G 직접 수정.
  function iceFrame(P, G, {click = false, cancel = false, sp = 0} = {}) {
    new Function('P', 'sp', regenSrc)(P, sp);                         // 리젠 블록 (확정보다 선행)
    const a = {P, G, mouse: {x: 0, y: 0}, VW: 0, VH: 0, dst: Math.hypot,
      MBjust: [click, false, cancel], K: {}, showPH: noop, _T: x => x,
      EL: {I: 1}, SFX: {magic: noop}, playSample: noop, addTxt: noop, shake: noop};
    new Function(...Object.keys(a), confSrc)(...Object.values(a));    // 확정/취소 블록
    return {mp: P.mp, stk: P._isStk, zones: (G._fireZones || []).length, aim: P._isAiming};
  }
  function newIce(over = {}) {               // 관찰 대상 초기상태
    const P = {x: 0, y: 0, mp: 40, skills: {iceStorm: 1}, _isStk: 1, _isRech: 1500, _isAiming: true, ...over};
    const G = {cam: {x: 0, y: 0}, _fireZones: []};
    return {P, G};
  }
  function fireBone(P, G) {                   // fireBoneWall 실체 호출
    const a = {P, G, _malCost: n => Math.ceil(n * .5), showPH: noop, _T: x => x,
      _addSkProf: noop, meleeRef: () => 1, statStr: () => 1, pAtkMul: () => 1, _skMul: () => 1,
      EL: {D: 1}, SFX: {magic: noop}, playSample: noop, _r: () => 1, shake: noop, addTxt: noop};
    new Function(...Object.keys(a), boneSrc + ';return fireBoneWall;')(...Object.values(a))(0, 0);
    return {walls: (G._boneWalls || []).length, mats: G.mats, stk: P._bwStk, mp: P.mp, aim: P._bwAiming};
  }

  // ── IceN1: 조준 중 MP39 거부 → 외부 리젠(MP40) 후 재클릭 성공 (거부→성공 전환) ──
  test(`${file}: [N1] 조준 중 MP 외부회복으로 거부→설치 성공`, () => {
    const {P, G} = newIce({mp: 39});
    assert.deepEqual(iceFrame(P, G, {click: true}), {mp: 39, stk: 1, zones: 0, aim: true}); // 거부·조준유지·무차감
    P.mp = 40;                                                                              // 외부 MP 리젠
    assert.deepEqual(iceFrame(P, G, {click: true}), {mp: 0, stk: 0, zones: 1, aim: false}); // 성공·정확차감
  });

  // ── IceN2: 조준 중 자동 스택 리젠(단일 프레임 regen→confirm) 후 즉시 설치 ──
  test(`${file}: [N2] 조준 중 스택 리젠 직후 같은 프레임 설치`, () => {
    const {P, G} = newIce({_isStk: 0, _isRech: 10});        // 스택0, 리젠 임박
    const r = iceFrame(P, G, {click: true, sp: 20});        // sp20 → _isRech 10-20<=0 → stk 0→1 → 확정 성공
    assert.deepEqual(r, {mp: 0, stk: 0, zones: 1, aim: false});
  });

  // ── IceN3: 조준 중 외부 스택 소진(합체 등) 후 클릭 → 조준 종료·무차감 ──
  test(`${file}: [N3] 조준 중 외부 스택0 → 클릭 시 조준종료·무차감`, () => {
    const {P, G} = newIce();
    P._isStk = 0;                                           // 외부 소모
    assert.deepEqual(iceFrame(P, G, {click: true}), {mp: 40, stk: 0, zones: 0, aim: false});
  });

  // ── IceN4: 취소(Esc/우클릭) 후 유령 좌클릭이 자원을 건드리지 않음 ──
  test(`${file}: [N4] 취소 후 유령클릭 무차감 (확정블록 미진입)`, () => {
    const {P, G} = newIce();
    assert.deepEqual(iceFrame(P, G, {cancel: true}), {mp: 40, stk: 1, zones: 0, aim: false}); // 취소 우선
    assert.deepEqual(iceFrame(P, G, {click: true}),  {mp: 40, stk: 1, zones: 0, aim: false}); // aim=false라 블록 미진입
  });

  // ── IceN5: 조준 중 MP 외부 드레인(0) → 클릭 거부·조준 유지(재클릭 가능) ──
  test(`${file}: [N5] 조준 중 MP0 드레인 → 거부·조준유지`, () => {
    const {P, G} = newIce();
    P.mp = 0;                                               // 외부 드레인
    assert.deepEqual(iceFrame(P, G, {click: true}), {mp: 0, stk: 1, zones: 0, aim: true});
    // 주: 확정블록은 진입 즉시 MBjust[0]=false 소비 → 프레임당 1회만 평가(연타 무효).
  });

  // ── BoneN1: 조준(패드) 중 외부 악의 부족 → 확정 실패해도 조준 해제 (iceStorm과 비대칭) ──
  test(`${file}: [BN1] fireBoneWall 자원부족 실패 시에도 _bwAiming 해제`, () => {
    const P = {mp: 0, x: 0, y: 0, skills: {boneWall: 1}, _bwStk: 1, _bwAiming: true};
    assert.deepEqual(fireBone(P, {mats: 5}), {walls: 0, mats: 5, stk: 1, mp: 0, aim: false});
  });

  // ── BoneN2: 조준 중 외부 스택 소진 → 확정 실패·조준 해제·무차감 ──
  test(`${file}: [BN2] fireBoneWall 스택0 실패 시 조준 해제·무차감`, () => {
    const P = {mp: 0, x: 0, y: 0, skills: {boneWall: 1}, _bwStk: 0, _bwAiming: true};
    assert.deepEqual(fireBone(P, {mats: 6}), {walls: 0, mats: 6, stk: 0, mp: 0, aim: false});
  });

  // ── BoneN3: 조준 중 실비 충족 → 성공·정확차감·조준 해제·MP 무접촉 ──
  test(`${file}: [BN3] fireBoneWall 성공 시 악의6+스택1 차감·MP불변·조준해제`, () => {
    const P = {mp: 0, x: 0, y: 0, skills: {boneWall: 1}, _bwStk: 1, _bwAiming: true};
    assert.deepEqual(fireBone(P, {mats: 6}), {walls: 1, mats: 0, stk: 0, mp: 0, aim: false});
  });
}
```

## 준비 / 관찰 / 정리 절차
- **준비**: 파일당 `readFileSync` 1회(읽기 전용) → 배너·정규식 앵커로 리젠/확정/`fireBoneWall` 소스 슬라이스. 앵커 미발견 시 `assert.ok`로 즉시 실패(무음 통과 방지 — 직전 보고 #7 취약성 대응).
- **관찰**: 각 시나리오는 신규 `P/G`를 만들고, 외부 변동은 프레임 사이 `P.mp/_isStk/G.mats` 직접 변이로 재현. 반환 스냅샷(`mp/stk/zones/aim` · `walls/mats/stk/mp/aim`)을 `deepEqual`로 확정·취소 기대값과 대조.
- **정리**: 상태는 테스트 로컬에만 존재, 프레임마다 `MBjust`·인자 새로 생성, 디스크·게임 상태 무변경. 별도 teardown 불필요.

## 미실행 제약 (명시)
- 본 답변은 **후보 코드 산출**까지이며, 파일로 저장하지 않았고 **테스트를 실행하지 않았습니다**.
- 본편/쉬운판 공용 HTML·CSS·수치·세이브 **무수정**(UI03 HTML/CSS는 총괄 단일 편집 유지), 게임 인스턴스 **미실행**, 새 팀/PC접속/보안·신뢰 설정 **변경 없음**.
- 사용 도구는 읽기(Read/Glob/Grep)뿐. 실제 채택·실행·커밋은 총괄의 편집권·QA 종료·순차 배정 후 진행해야 합니다.

검토 및 후보 코드 산출 완료. 총괄의 순차 실행 배정을 대기하며 종료합니다.

## 2026-10-01T06:10:48.475Z

실제 소스로 하니스 앵커 3개를 대조하겠습니다.

## 2026-10-01T06:11:39.917Z

실제 소스 대조 완료. 하니스가 추출/참조하는 3개 구역 전부 라이브 `game.html`과 일치하며, **후보 정정 불필요**입니다.

## 앵커·delimiter 대조 결과
| 하니스 앵커 | 코드 방식 | 라이브 위치 | 판정 |
|---|---|---|---|
| 리젠 시작 `// ═══ 아이스스톰 — 2스택 충전` | `indexOf` | **34861** | ✓ 일치 |
| 리젠 끝 = 확정 시작 `// ═══ 아이스스톰 — 조준 모드` | `indexOf` | **34871** | ✓ 일치 (리젠 slice=34861–34870) |
| 확정 시작 `^  if\(P\._isAiming\)\{$` | `search`(첫 매치) | **34872** | ✓ (아래 주의 참고) |
| 확정 끝 `// ═══ 독가스탄` | `indexOf(…, confStart)` | **34903** | ✓ 일치 (확정 slice=34872–34902) |
| `function fireBoneWall(tx,ty){` | `indexOf` | **43512** | ✓ 함수명 정확 |
| fireBoneWall 끝 `// ═══ 폭산탄` | `indexOf(…, boneStart)` | **43550**(`폭산탄 발동`) | ✓ boneStart 이후 첫 매치, 본체(43512–43530) 뒤 |

**주의(정정 아님)**: `  if(P._isAiming){`는 두 곳(**34872** 확정블록, **53526** 렌더블록)에 존재합니다. 후보는 전역 스캔이 아니라 `source.search(...)`로 **첫 매치(34872)**만 잡으므로 의도대로 확정블록을 집습니다 — 기존 `skillStackConfirmGate`와 동일 방식이라 안전. `// ═══ 폭산탄`도 boneStart(43512) 이전의 34547/34585가 아닌 **이후 첫 매치 43550**이 잡혀 정확합니다.

## 자원 필드 대조 (라이브 재확인)
- 아이스스톰: `P._isStk`·`P._isRech`·`P.mp`·`P._isAiming`·`G._fireZones`·`MBjust[0/2]`·`K['Escape']` — 확정블록(34872–34902) 실사용과 일치. 성공 꼬리 `if(P._isStk<_isMx2&&!P._isRech)P._isRech=1500`도 `_isRech` 초기화(newIce=1500, IceN2=10→리젠 후 1500)와 충돌 없음.
- 해골무덤: `P._bwStk`·`P._bwAiming`·`G.mats`·`G._boneWalls`·`_malCost(12)` 일치. `fireBoneWall`은 진입 즉시 `P._bwAiming=false` 선처리(43514) 후 `_bwStk>0`(43515)→`mats<_malCost(12)`(43516) 재검 — **MP 무접촉** 확인. → BN1/BN2(실패에도 조준 해제)·BN3(악의6+스택1 차감·MP불변) 기대값 유효.

## 결론
함수명(`fireBoneWall`), 끝 delimiter(`// ═══ 독가스탄` / `// ═══ 폭산탄` / `// ═══ 아이스스톰 — 조준 모드`), 자원 필드(`_isStk/_isRech/mp/_isAiming`·`_bwStk/_bwAiming/mats`·`G._fireZones/_boneWalls`) 모두 라이브 소스와 정확히 대응 — **직전 제출 후보 코드 수정 없음**. easy판은 미대조(총괄 단일 편집 구역 침범 회피), 다만 `assert.ok(앵커 >= 0)` 가드가 easy판에서 배너/들여쓰기가 다를 경우 무음 통과 없이 즉시 실패시키므로 안전망은 유지됩니다.

이번 턴은 Read/Grep 읽기 전용 대조만 수행했고, 파일·테스트 실행·공용코드 수정은 없습니다. 대조 완료로 종료합니다.
