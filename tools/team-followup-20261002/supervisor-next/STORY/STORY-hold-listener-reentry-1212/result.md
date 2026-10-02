# STORY-hold-listener-reentry-1212 — 홀드-스킵 입력 리스너의 재진입 중복 수명 (실제 wiring patch)

담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`, provider Claude Code) · 한국어 · CH1-1 playable 마일스톤 STORY 행(승인 소개·재도전 lifecycle wiring).
소유 = 이 폴더 `result.md`·`checks.mjs` **2파일만**(epoch `capacity-after-6a39b828-1212`, 역할당 1저장/2파일). production·공유docs·기존test·Git(조회 포함)·실게임/세이브/서버/빌드·audio·이미지·삭제/이동/타인WIP 0. `productionApplied=false`, `runtimeAccepted=false`.

## 0. 메타·epoch·시각·SHA

| 항목 | 값 |
|---|---|
| capacity epoch | `capacity-after-6a39b828-1212`, `allowNewOwnedFiles=true`(root raw23+목표 checkpoint `6a39b828dda2332e482888609a81a05dfa2c1458` 후 Changes 60) |
| 저장 한정 | 역할당 1반복/최대 2파일 |
| checks 실행 1차 UTC | 2026-10-02T12:22:13Z → **exit 1**(S2 ReferenceError, 실제 patch 결함 노출 — §3) |
| checks 실행 2차 UTC(수정 후) | 2026-10-02T12:23:13Z → **exit 0, 10 PASS / 0 FAIL** |
| index.html whole SHA256 | `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8` |
| stopWorldIntro(2159-2165) SHA256 | `bb380f6563c358066c499a27af0798380b6d32a93902595856acf90cd809c7cd` |
| holdReg(2519-2541) SHA256 | `62b00be2e53a080ebb04baf6e615e21ec05583344810590523647afc5279ca7c` |
| checks.mjs SHA256(최종) | `cd9b92a62f527fdb8c2670d01d27fe5f9c68b479b21ca28213c73c0983264448` |

## 1. 결함 (current-product, input-lifetime)

`playCinematic`의 홀드-스킵 블록이 run마다 `document` keydown(`_chk`,2523)/keyup(`_chu`,2527)와 `_GP.on('cinHold')`(2535)를 등록한다. 정리는 오직 핸들러가 `_cinDone===true`로 **다시 fire될 때 자기 제거**에만 의존하고, **공유 teardown `stopWorldIntro`(2159)는 이 리스너를 제거하지 않는다**(`_cinKeyCleanup`만 정리, 2162). `_cinDone`은 모듈 스코프(2155)라 재진입(`_goCinematic` 2715 `_cinDone=false`)에서 이전 run 리스너가 활성 유지 → **재진입 1회당 keydown/keyup 리스너 중복 누적**. 현행 v13 인트로에서 홀드 스킵이 실제 동작하므로 latent 아님(재진입은 로비 `replayCinBtn` 2735/`onclick=_goCinematic` 2718로 도달).
→ 마일스톤 STORY 인수 기준 "시작/중단/재진입에서 기존 cue가 **중복되지 않는** 실제 연결"의 위반.

## 2. 검증 (checks.mjs, 10 PASS / 0 FAIL) — 실제 teardown 경유

원문 `stopWorldIntro`(2159-2165)와 홀드 등록 슬라이스(2519-2541)를 **verbatim 추출**해 stand-in(document/_GP 리스너 추적)에서 실행. 정리는 **실제 (patched) `stopWorldIntro()` 호출**로 발생(fixture가 직접 removeEventListener/cleanup 호출하지 않음).

| 시나리오 | 결과 |
|---|---|
| **S1 현재식 재진입** run1→실제 stopWorldIntro()→run2 | keydown/keyup 리스너 **각 2개(중복 defect, 실제 teardown 경유)**, `_GP.off(cinHold)` 미호출 |
| **S2 후보 재진입** run1→실제 patched stopWorldIntro()→run2 | keydown/keyup **각 1개(중복 해소)**, `_GP.off(cinHold)` 1회 자동 호출 |
| **S3 control 후보 단일 run** | run 중 리스너 1개(홀드 활성) → teardown 후 0(정상 정리) |
| **S4 control 현재식 단일 run** | teardown 후 keydown 1개 **잔존(미정리 확인)** |

## 3. 하니스가 드러낸 실제 patch 결함 (숨기지 않음)

1차 실행 exit 1, **S2 `ReferenceError: _chk is not defined`**. 원인: `_chk`/`_chu`는 `addEventListener('keydown',function _chk(e){…})`의 **named function EXPRESSION**이라 이름이 **자기 body 안에서만** 유효하고 외부 스코프에서 참조 불가. 따라서 naive 패치 `document.removeEventListener('keydown',_chk)`는 **실제 코드에서도 throw**한다(1150에서 제안했던 naive 형태의 실제 결함). → 패치를 **리스너를 const(`_holdKeydown`/`_holdKeyup`)로 바인딩** 후 그 ref로 제거하도록 정정, 2차 10 PASS.

## 4. 실제 wiring patch 후보 (정정판, productionApplied=false — root 적용)

공유 teardown `stopWorldIntro` 1곳에 자동 연결(finishCin 2344·skipToGate 2582·_goCinematic 2711·기타 2683/2742가 모두 호출). 원소스 미변경.

(a) **모듈 스코프(2158 인근):** `let _cinHoldCleanup=null;`
(b) **`stopWorldIntro` 내 2162 다음:** `if(_cinHoldCleanup){_cinHoldCleanup();_cinHoldCleanup=null;}`
(c) **홀드 블록(2523/2527):** 리스너를 const 바인딩(named 함수 body·자기 제거 그대로 유지):
```
const _holdKeydown=function _chk(e){ …원문 body… };
document.addEventListener('keydown',_holdKeydown);
const _holdKeyup=function _chu(e){ …원문 body… };
document.addEventListener('keyup',_holdKeyup);
```
(d) **cinHold 등록 직후(2541 뒤):**
```
_cinHoldCleanup=()=>{document.removeEventListener('keydown',_holdKeydown);document.removeEventListener('keyup',_holdKeyup);_GP.off('cinHold');};
```
- `_goCinematic`은 `stopWorldIntro`(2711)를 `playCinematic`(2735) **이전**에 호출 → run1 리스너가 run2 등록 전 제거 → 중복 해소.
- **불변:** `_CIN_HOLD_DUR=5000`·800/600ms·대사·게이지 동작·character text·서사 0 변경. protected2_3·Q-only magic·attack ticket 무관.

## 5. Gate·인계·다음

- **Gate 구분:** source 정적/대역 검증만. 실브라우저 리스너 누적 체감·중복 입력·native/시각/청취는 **미검수(UNKNOWN)**. 경로 자체는 현행 제품 활성(latent 아님).
- **docs/root 인계:** `SPACE_HOLD_SKIP_20260914.md`에 홀드 계약은 있으나 **finish/skip/re-entry 리스너 teardown 수명은 미기재** → root가 "(c)/(d) 리스너 const 바인딩 + stopWorldIntro 정리" 수명 계약을 신규 기록(전체 rg 동기화). 공용 `index.html` 반영·Git은 원총괄/root 소유. 의존성: BOSS/QA 실제 재진입 경로.
- **1134 two-run gen-token 후보와 관계:** 그 건은 `showImg` 페이드(latent, v13 미호출)용. 본 건은 홀드 입력 리스너(현행 활성)용 — 별개 접점. full-lifecycle 제품 수정 완료 아님(검수 Gate 유지).
- **다음(자율):** 이 epoch 저장 1건 소진. 다음 독립 건(예: 네메시스 INTRO→기상 연출 전환 cue 연결 수명)은 허가 대기 없이 **메모리로 진행**, 새 capacity epoch에서 추가 저장. 제품 완료로 보고하지 않음. SHA 불일치(마일스톤 문서 실제 `713aa80c…`≠제공 `889fb16f…`, root 편집 중)는 역사값으로 기록·되돌리지 않음.
