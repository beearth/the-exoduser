# QA-ch1-1-observer-gate-1212 (결과)

CH1-1 실제 플레이 마일스톤의 QA 행 — **6단계 실제 플레이의 첫 관측/진행 blocker를 찾을 수 있는 현재 bootstrap/observer 실제 wiring 후보 1건**을 제출한다. capacity epoch `capacity-after-6a39b828-1212`(allowNewOwnedFiles=true, Changes=60)에서 **이미 수행·검증한 메모리 작업의 저장분**이며, 성공 근거를 **재실행하지 않고** 원 stdout/SHA 그대로 인계한다. 소유 2파일(`result.md`+`checks.mjs`), 이번 epoch 1반복 한정.

`productionApplied=false / runtimeAccepted=false.` 실게임·빌드·브라우저·사용자 save 조작 0(root 단일 슬롯 보류). API source fixture를 플레이 증거로 대체하지 않았고, actual `runtimeReady=false`를 성공으로 표시하지 않았다.

## 0. 목표 문서 SHA 불일치 (보고 필수 — root 확인)

- 전달 "정확 SHA256": `889fb16f97416a582818d6a93e49421e8eb704c11806ab50279fec9dc41b5a09`
- 디스크 실제(`docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md`): `713aa80c994688820d2eb18ca43377018312ea975f9134968faaefbe77eee7ee`
- **불일치.** 공유 docs라 수정 0, 디스크 실제본을 읽어 QA 6단계·인수 기준을 적용. 제공 SHA stale 또는 그 사이 문서 변경 여부는 **root 소유 확인**.

## 1. 첫 관측 blocker (6단계 1단계)

실제 `browser-bootstrap-api.js`가 host에 설치하는 **유일한 bootstrap 포트** `_d10PersistenceReviewPort`는 `enabled=false / runtimeReady=false / status='proposal'` — **라이브 플레이 관측자가 아니라 제안(proposal) 포트**다. 따라서 6단계의 **1단계(로비→CH1-1 시작)조차 이 포트로는 실제 플레이를 관측할 수 없다.** 이것이 source 수준에서 확인되는 첫 관측 blocker다.

- activation(enabled/runtimeReady) flip은 **런타임 소유** — QA가 바꾸지 않는다(SSOT/계약 보존).
- 실제 생산 callsite `persistence-integration-port.js:31-33`도 `window._d10PersistenceReviewPort`를 직접 읽지만, 그 포트가 proposal인 한 "진행 관측"이 아니라 제안 createReview일 뿐이다.

## 2. 후보 — observer-gate (메모리 후보, 생산 미적용)

실제 bootstrap handle/port 표면을 받아 **`runtimeReady===true`일 때만 `observable`**로 승격하고, 아니면 `observable=false·playEvidence=false·BLOCKED`(첫 blocker 사유)로 보고한다. 핵심: 어떤 경우에도 proposal/ fixture 결과를 **플레이 증거로 승격하지 않는다.**

- `OBS-ACTUAL`: 실제 설치 포트 → `observable=false, playEvidence=false, blocker="runtimeReady=false · proposal 포트 — 라이브 플레이 관측자 아님", firstBlockedStage="1 로비→CH1-1 시작"`.
- `OBS-CONTROL`: `runtimeReady=true` **계약 shape**(실제 플레이 아님, 명시) → `observable=true`지만 `playEvidence=false`(실제 증거는 root 단일 슬롯에서만).
- `OBS-ANTI-FIXTURE`: `createReview`가 실제 UI-10 instance를 만들어도 `observable/playEvidence=false` 유지 → fixture 생성을 진행 증거로 치환 안 함.

이 게이트가 있으면, root가 runtimeReady 런타임 포트+단일 슬롯을 열었을 때 **동일 게이트**로 6단계 전이를 구독해 첫 실제 진행 blocker를 잡을 수 있고, 그 전까지는 모든 결과가 BLOCKED/비증거로 정직하게 묶인다.

## 3. 실행 명령·원 stdout (재실행 금지 — 원본 그대로)

Node: `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`
명령(직전 자율 작업, scratchpad 실행 — repo 변경 0):
```
node --experimental-vm-modules qa-observer-gate.mjs
RUN_START=2026-10-02T12:08:58Z  EXIT=0  RUN_END=2026-10-02T12:08:58Z
```
원 stdout(그대로):
```json
{
  "apiSha": "dcea3ff9722dde2fd200ecf1fb55f6d742f70631918fa7276c089e5e775ae9eb",
  "integSha": "9d2536fef5608d18dda3a6e557e24b48d5c262f9566f3c0cd37a52d8e4058491",
  "mkSha": "5476174988858bd50b700cd48b1aa681cf7c002719a0e54248c199473e1cc0a8",
  "node": "v24.15.0",
  "firstObservationBlocker": "설치된 유일 bootstrap 포트 _d10PersistenceReviewPort 가 runtimeReady=false/enabled=false/status=proposal — 6단계 1단계도 이 포트로 관측 불가(라이브 observer 아님)",
  "candidate": "observer-gate: runtimeReady===true 전까지 observable=false·playEvidence=false·BLOCKED. 실제 플레이 증거는 root 단일 슬롯에서만. activation(enabled/runtimeReady) flip 은 런타임 소유 — QA 변경 0",
  "dependencies": "BUILD 로컬 후보 + 총괄 source 통합(runtimeReady 런타임 포트), MAP/BOSS 경로, QA 단일 실행 슬롯",
  "checks": [
    { "id": "OBS-ACTUAL", "band": "실제 설치 포트 관측 판정", "ok": true,
      "obs": "observable=false playEvidence=false blocker=\"runtimeReady=false · proposal 포트 — 라이브 플레이 관측자 아님\" firstBlockedStage=\"1 로비→CH1-1 시작\" flags={\"enabled\":false,\"runtimeReady\":false,\"status\":\"proposal\"}" },
    { "id": "OBS-CONTROL", "band": "runtimeReady 계약 shape 대조", "ok": true,
      "obs": "observable=true playEvidence=false note=\"관측 가능 계약 충족 — 실제 플레이 증거는 root 단일 슬롯에서만\" flags={\"enabled\":true,\"runtimeReady\":true,\"status\":\"runtime\"} (계약 shape일 뿐 실제 플레이 아님)" },
    { "id": "OBS-ANTI-FIXTURE", "band": "fixture 생성 ≠ 플레이 증거 분리", "ok": true,
      "obs": "createReview 생성=UI-10 → 그러나 observable=false playEvidence=false (fixture 생성을 진행 증거로 치환 안 함)" }
  ],
  "allPass": true
}
```

## 4. 소스/SHA·Gate

| 항목 | 값 |
|---|---|
| 실제 소스 SHA | api `dcea3ff9…`, integration `9d2536fe…`, mk-item `5476…` (실제 파일 미수정) |
| 저장 checks.mjs SHA | `e93d19ba43a284d8473806debd052620e21972a3a21fc7fba15384a7ec92054f` (scratchpad 실행본과 byte-identical) |
| 대역/합성 | 대역/합성 없음(관측 판정은 실제 포트 flags). 실제=api 원문 VM + 실제 factory + createReview binding + getOwnPropertyDescriptor |
| Gate | **source Gate 한정.** 로컬 빌드/연결된 실제 플레이/화면·청취/§23 visual 미인수 |

## 5. 6단계 인수 현황 (이번 산출 범위)

| 단계 | 현재 판단 |
|---|---|
| 1 로비→CH1-1 | **BLOCKED(첫 관측 blocker)** — proposal 포트 runtimeReady=false, 라이브 observer 없음 |
| 2 전투/획득/장착 | 미인수 — 1단계 관측 선행 필요(의존: SKILL/ITEM/UIUX caller + QA 슬롯) |
| 3 보스 게이트 | 미인수 — MAP/BOSS 경로 의존 |
| 4 보스 사망/중단 | 미인수 — BOSS 상태 보존 접점 의존 |
| 5 부활 필드 복귀 | 미인수 — `CH1-1_BOSS_RESPAWN_PROGRESS` SSOT 계약 의존 |
| 6 재도전·반환/저장 | 미인수 — 기존 격리 저장 확인 여부 명시 필요, 사용자 save 변경 0 |

## 6. 의존성·다음 독립 한 건

- **의존:** BUILD 로컬 후보 + 총괄 source 통합(runtimeReady 런타임 포트), MAP/BOSS 경로, **QA 단일 실행 슬롯**. 실게임/빌드/브라우저/세이브는 root 격리 후보+단일 슬롯까지 보류.
- **다음 독립 한 건(메모리 진행):** runtimeReady 런타임 포트가 열렸을 때 observer-gate가 6단계 전이를 구독하는 **정상 대조 harness**(스테이지 enum·전이 순서·중단 사유 기록)를 메모리로 준비하고, **이번 2파일 예산 소진 뒤 새 capacity epoch에서** 저장한다.
- **경계:** production/shared docs/Git/타팀WIP/사용자게임·save/삭제/권한/설치/게시/새세션 조작 0. 실제 소스 파일 미수정. 보호 `2_3`·blackBean(Q-only magic)·attack ticket 금지·맵 full-guide/LOCK 보존. 제품 완료로 보고하지 않음.
