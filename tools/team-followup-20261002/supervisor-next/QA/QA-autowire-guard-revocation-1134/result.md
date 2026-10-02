# QA-autowire-guard-revocation-1134 (결과)

감독 수정 피드백 이행 결과를 **capacity epoch `capacity-after-8c317a73-1134`**(allowNewOwnedFiles=true, Changes=68)에서 저장한다. 본 산출은 직전 자율연속 1건에서 **이미 수행·검증한 메모리 작업의 저장분**이며, 성공 근거를 **재실행하지 않고** 원 stdout/명령/SHA/수정이력을 그대로 인계한다. 소유 2파일(`result.md`+`checks.mjs`)만 생성, 이번 epoch 1반복 한정.

## 1. 새 경계 (이전과 구분)

이전 `QA-cached-port-function-revocation-hb1014`의 후보는 fixture에서 **수동 `lifetime.revoke()`**를 불렀다 → 감독 지적: "actual bootstrap uninstall/catch wiring을 검수했다고 볼 수 없음."

이번 한 건: 실제 `browser-bootstrap-api.js`에 **자동 guard-revocation 패치를 연결**하고, **fixture에서 revoke 직접호출 없이** 실제 두 caller(정상 `uninstall()` / 설치실패 rollback `catch`)만으로 포획 함수(`savedCreate`) **postcall 생성=0** 과 **foreign descriptor 보존**을 검수. 이전 5/6/8 검사는 반복하지 않음.

## 2. 패치 방식 (실제 파일 미수정 — 문자열 메모리 패치)

- 실제 `browser-bootstrap-api.js` 원문 SHA `dcea3ff9722dde2fd200ecf1fb55f6d742f70631918fa7276c089e5e775ae9eb`를 읽어 **문자열로 3곳 패치**(앵커 각 1회 일치 assert), `vm.SourceTextModule`로 실행. **실제 소스 파일은 수정하지 않았다.** 패치본(메모리) SHA `1e25acf9505dc7c59b5b364827c0c96245520a40494a0ccdf933c0d41bd95aa9`.
- 패치 내용(최소):
  1. 설치값 `installed.value`를 raw `port` → **lifetime 토큰(`revoked`)에 묶인 `_guardedPort`**(4개 메서드 createReview/readItem/restoreItem/serializeItem를 `_guard`로 감쌈).
  2. `uninstall()` 3분기(already-uninstalled/foreign-preserved/restored) 모두 `revoked=true` 자동 설정.
  3. `catch`(설치실패 rollback) 진입 시 `revoked=true` 자동 설정.
- 결과: 외부가 `const savedCreate = window._d10PersistenceReviewPort.createReview`로 **함수를 캐시**해도, 실제 uninstall/rollback이 `revoked`를 세워 이후 호출이 throw → 생성 0. 원 `port`·foreign descriptor는 파괴/삭제하지 않음(foreign preservation). 새 API/데이터 schema 0.
- **productionApplied=false / runtimeAccepted=false.** 공용 코드 적용/docs 전체 rg 동기화/Git는 원총괄(root) 소유.

## 3. 실행 명령·원 stdout (재실행 금지 — 원본 그대로 인계)

Node: `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`
명령(직전 자율 epoch, scratchpad 실행 — repo 변경 0):
```
node --experimental-vm-modules qa-autowire-guard.mjs
RUN_START=2026-10-02T11:29:51Z  EXIT=0  RUN_END=2026-10-02T11:29:51Z
```
원 stdout(그대로):
```json
{
  "realSha": "dcea3ff9722dde2fd200ecf1fb55f6d742f70631918fa7276c089e5e775ae9eb",
  "patchedSha": "1e25acf9505dc7c59b5b364827c0c96245520a40494a0ccdf933c0d41bd95aa9",
  "patchAnchors": { "wrap": 1, "uninstall": 1, "catch": 1 },
  "node": "v24.15.0",
  "checks": [
    { "id": "PATCH-CONTROL", "ok": true,
      "obs": "handle=UI-10 direct=UI-10 saved=UI-10 activation=true" },
    { "id": "PATCH-NORMAL", "ok": true,
      "obs": "owned=true close=restored absent=true postThrew=true(포트 수명 종료 · 포획 함수 호출 금지) postcall mkItem=0 rng=0" },
    { "id": "PATCH-ROLLBACK", "ok": true,
      "obs": "AggregateError=true delHits=1 residual=true postThrew=true(포트 수명 종료 · 포획 함수 호출 금지) postcall mkItem=0 rng=0" },
    { "id": "PATCH-FOREIGN", "ok": true,
      "obs": "close=foreign-preserved foreignPreserved=true savedThrew=true" },
    { "id": "REGRESS-UNPATCHED", "ok": true, "defectPersists": true,
      "obs": "현행 postcall uid=UI-10 postcall mkItem=1 (누수 지속=true)" }
  ],
  "allPass": true
}
```

## 4. 검사별 판정

| id | 판정 | 의미 |
|---|---|---|
| **PATCH-CONTROL** | PASS | 패치해도 owned 정상 동작: handle.create ≡ direct ≡ 포획 saved = UI-10, activation(enabled=false/runtimeReady=false/status=proposal) 보존 |
| **PATCH-NORMAL** | PASS | **실제 `handle.uninstall()`**(restored, descriptor absent) 후 포획 `savedCreate` throw, **postcall mkItem=0 rng=0** (fixture revoke 직접호출 0) |
| **PATCH-ROLLBACK** | PASS | **실제 설치실패 rollback**(AggregateError, delete 실패로 guardedPort 잔존) 후 포획 함수 throw, **postcall 0** — catch 자동 revoke |
| **PATCH-FOREIGN** | PASS | foreign-preserved 분기: 교체 descriptor(`FOREIGN-OWNER`) **보존** + 포획 함수 무력화 동시 성립 |
| **REGRESS-UNPATCHED** | PASS(delta) | 현행 미패치 동일 시나리오는 여전히 생성(postcall mkItem=1) → 누수 지속 확인(수정 전/후 대비) |

전체 exit 0, allPass=true. 각 defect/후보는 postcall 카운터(mkItem/rng)로 "실제 생성 여부"를 증명했고, 패치 경로에서 그 값이 0임을 실제 두 caller로 확인했다. storage는 proposal createReview 경로에 없어 0 by design.

## 5. 수정 이력 (실패·수정 그대로 인계)

- 최초 하니스에 placeholder `.replace(... arguments2)` 데드 블록이 있어 ReferenceError 위험 → 실행 전 Edit로 제거 후 정상 실행. (성공 run은 제거 후 버전 = 저장된 `checks.mjs`, SHA `135176af75cc8d87f44751331b913788dd420c904f3bc7513e751e307cadf5a3`.)
- 저장된 `checks.mjs`는 scratchpad 실행본과 byte-identical(동일 SHA) 확인.

## 6. source/Gate 소유·한계

| 항목 | 값 |
|---|---|
| 실제 소스 SHA | api `dcea3ff9…`, integration `9d2536fef5608d18dda3a6e557e24b48d5c262f9566f3c0cd37a52d8e4058491`, mk-item `5476174988858bd50b700cd48b1aa681cf7c002719a0e54248c199473e1cc0a8` |
| 패치본(메모리) SHA | `1e25acf9…` (실제 파일 미반영) |
| 저장 checks.mjs SHA | `135176af…` |
| Gate | **source fixture Gate 한정.** native/시각/청취/실게임/실브라우저/실 host 미검수 |
| 대역/합성 | 대역=rollback delete 실패 Proxy(deleteProperty=false); 합성=mkItem random·rng `()=>0.5`(생성 로직은 실제). 실제=api 원문+실제 factory+createReview binding+getOwnPropertyDescriptor |

## 7. docs 동기화 인계 (root 소유 — 공유docs 쓰기 0)

canonical(`ITEM_TEAM_MASTER.md`/`QA_PERFORMANCE_TEAM_MASTER.md`)에 반영할 정확 문안(직전 hb1014 result §5의 포획-함수 defect에 이어):

> 2026-10-02 QA: 포획 함수 누수의 **실제-wiring 수정 검증**. api `installed.value`를 lifetime 토큰에 묶인 guarded port로 바꾸고 `uninstall()` 3분기 + `catch` rollback에 `revoked=true` 자동 연결 시, 외부가 캐시한 `window._d10PersistenceReviewPort.createReview`도 실제 uninstall/rollback 후 호출 시 throw(postcall mkItem/rng=0). foreign-preserved에서 교체 descriptor 보존 + 포획 함수 무력화 양립. 미패치 현행은 누수 지속(대비 확인). 최소 patch=설치값 wrap + 2곳 revoke 연결, 새 API/schema 0, **productionApplied=false**. source api `dcea3ff9…`, Gate=source fixture(native/시각/실게임 미검수).

> protected `2_3`·blackBean(Q-only magic)·attacktickets·LOCK/TBD·확정수치 보존(수정 0). 반영·Git·생산 적용은 root 순차.

## 8. 경계·다음

- production/shared docs/Git/index/타팀 WIP/사용자게임·save/삭제·이동·cleanup·권한·설치·결제·게시·새채팅·팀·resume 조작 **0**. 실제 소스 파일 미수정. 개인 Git 조회 0(용량은 감독 STATE에서 읽음).
- 이번 epoch 저장 1반복/2파일 한정 준수. 다음 독립 업무는 허가를 다시 묻지 않고 메모리로 진행하며, **새 capacity epoch에서** 추가 저장한다.
- 진짜 blocker 없음(no-fix 아님). 후보 생산 채택/최소 patch 실제 적용은 root/감독 판단.
