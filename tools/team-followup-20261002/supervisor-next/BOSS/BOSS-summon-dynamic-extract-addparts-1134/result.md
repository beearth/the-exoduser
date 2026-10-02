# BOSS — bossSummonWind 실제 case 동적추출 + `ens.push 뒤 addParts throw` 경계 + minimum finally 후보

epoch `capacity-after-8c317a73-1134` · 저장 시 `allowNewOwnedFiles=true`, Changes 68 · 이 epoch 저장 1반복/2파일 한정
실행: Mac Claude Code (BOSS/Claude) · 지정 Node v24.15.0 · `productionApplied=false` · `runtimeAccepted=false`
소유 2파일: `result.md`(이 파일) + `checks.mjs`. 감독 피드백(hb1014 hand-copy → 실제 소스 동적추출) 반영 1건.

> **재실행 없이 인계:** 아래 stdout/SHA/명령/실패·수정 이력은 용량 홀드(이전 epoch, allowNewOwnedFiles=false) 중 `node /dev/stdin`(파일 0)으로 실제 수행한 **원 결과 그대로**다. 용량 해제 후 본 폴더에 저장만 했고 성공 근거를 재실행하지 않았다. `checks.mjs`는 그 실행 스크립트의 ESM 동일본(require→import만 차이).

## 1. 대상·SHA (양판 동적 추출)

| 파일 | case 행 | raw sha256(16) |
|---|---|---|
| game.html | **39445–39461** | `49d14065c36d6db3` |
| game-easy-test.html | **38247–38263** | `49d14065c36d6db3` |

- 양판 case **로직 정규화 동일 = true**, **raw sha256 동일 = true**.
- 이전 세션 fragment anchor `8e2c0a34`(39442–39458)에서 총괄 UI-가드 순차통합으로 주변 행이 +3 이동 → 현재 양판 동일 해시 `49d14065`로 재anchor. 타 세션 변경 되돌림 0.
- 추출 방식: `case'bossSummonWind':{` 라인 탐색 → `}break}`까지 수집 → `break}`만 제거(if 닫는 `}` 유지)해 **실제 body**를 `new Function`으로 실행(hand-copy 아님).

## 2. 실행 명령·환경

```
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /dev/stdin <<'JS' … JS   # 파일 미생성
```
- `Math.random`을 결정론 seed(mulberry32)로 치환해 실제 RNG 시퀀스/인자 재현. spawn/VFX(mkEn·addParts·poolPart·SFX·addTxt)는 STUB(대역). 새 경계: `addParts`가 N번째 호출에서 `TypeError` throw(= 각 iter에서 `ens.push` 직후 호출되므로 "push 뒤 throw").

## 3. 실패 → 수정 이력 (그대로 보존)

- **1차 시도 실패:** body 트림을 `}break}` 전체 제거로 해서 `if(e.st2<=0){`의 **닫는 `}`까지 삭제** → `new Function`에서 `SyntaxError: Unexpected token ')'`. 원 stdout:
  ```
  EXTRACTED lines 39445 .. 39461 sha256 49d14065c36d6db3
  SyntaxError: Unexpected token ')'  at new Function (<anonymous>)
  ```
- **수정:** 트림을 `break}`만 제거로 변경(if 닫는 `}` 유지). 검증: `BODY balanced open/close {: 2 }: 2`. 이후 정상.

## 4. 원 stdout (수정 후, 13/13 PASS, exit 0)

```
C1 real mkEn args[0..2]= [{"sx":579.4,"sy":400,"st":0,"et":3,"el":5,"room":7},{"sx":470,"sy":451.9,"st":0,"et":3,"el":4,"room":7},{"sx":473,"sy":353.3,"st":0,"et":2,"el":1,"room":7}]
C2 ens1= 2 → total= 5 (중복), thrown= {"name":"TypeError","msg":"BAND addParts @call2"}
C3 ens1= 2 ens2delta= 0
  [PASS] C1 정상 소환 mkEn 호출=cnt(3) — tick1 ens=3
  [PASS] C1 tick1 상태 recover/70 — e.s=recover
  [PASS] C1 실제 mkEn 인자 el∈[0..5]·et∈[0,2,3]·room=7
  [PASS] C2 에러 동일성 = TypeError — BAND addParts @call2
  [PASS] C2 tick1 push는 완료(ens=2, 실패 iter의 mob도 push됨) — ens1=2
  [PASS] C2 tick1 상태 bossSummonWind 고착(st2<=0) — e.s=bossSummonWind,st2=0
  [PASS] C2 다음 tick 중복 재소환(ens2delta=cnt=3) — ens2delta=3,total=5
  [PASS] C3 throw 전파 유지(TypeError)
  [PASS] C3 tick1 부분 spawn 유지(ens=2) — ens1=2
  [PASS] C3 tick1 상태 recover/70 안전종료 — e.s=recover
  [PASS] C3 다음 tick 재소환 없음(ens2delta=0) — ens2delta=0
  [PASS] C4 정상 mkEn 인자 트레이스 동일(RNG 동등) — lenA=3 lenB=3
  [PASS] C4 정상 상태 recover/70 동일
== RESULT: 13 PASS / 0 FAIL ==  (EXIT=0)
```
양판 파리티 실행 원 stdout:
```
game.html      39445..39461 49d14065c36d6db3
game-easy-test 38247..38263 49d14065c36d6db3
BODY 로직 동일(정규화): true
RAW sha 동일: true
```
> `checks.mjs`(ESM 동일본)는 위 양판 파리티 + C1~C4를 한 파일로 합쳐 재현 가능하게 구성. (본 저장 시점에는 재실행하지 않음 — 원 stdout 보존.)

## 5. 결함·후보 (실제 body 기준)

- **새 경계 결과(C2):** `addParts`가 `ens.push` **뒤** throw → 실패 iter의 mob까지 **이미 push**되어 tick1 `ens=2` + 상태 `bossSummonWind`/st2=0 **고착** → 다음 tick cnt=3 재소환 → **total 5(중복)**. 에러 동일성 `TypeError` 보존. ※기존 "2nd mkEn throw(ens=1)"보다 심각 — 소환 성공 + VFX 실패만으로도 상태 오염.
- **minimum finally 후보(C3, 실제 body 변환):** `if(e.st2<=0){` 본문을 `try{…}finally{e.s='recover';e.st2=70;}`로. 동일 `TypeError` 전파 유지 + 부분 spawn(2) 유지 + 상태 recover/70 안전종료 → 다음 tick 재소환 0.
- **정상 등가(C4):** 수정본 정상경로 mkEn 인자 트레이스가 현행과 완전 동일(RNG 동등). 수치·수량·재시도 변경 0.

## 6. root 인계·Gate

- **소스 미적용.** 공용 코드 적용/docs 전체 rg 동기화/Git = 원총괄 소유.
- **후보 적용 대상:** game.html:39445–39461 + game-easy-test.html:38247–38263(양판 동일 `49d14065`), `if(e.st2<=0)` 본문 try/finally.
- **소유:** case 로직=BOSS/보스전(AI `_bossScore`=ENEMY 공용). VFX 콜 throw 처리 겹치면 ANIMVFX 협의.
- **필수 Gate(미결, 임의확정 0):** ① `addParts`/`mkEn` 실게임 throw 도달성(환경대역, 미증명). ② **부분 spawn(이미 push된 mob) 유지 vs 롤백 정책** — root 결정, 임의 도입 0. ③ 양판 동기(로직 동일 확인됨).
- 동일 클래스(C1: `bossMineWind`·`bossMeteor`·`eSummon`)는 자가착수 스캔 `self-initiated/BOSS/exception-safety-scan-20261002` 참조.

## 7. 보존·한계

- protected `2_3`·blackBean Q-only·attack-ticket 금지·LOCK 불변. 원자료/production/shared docs/Git/사용자게임 보존. 타 세션(총괄 UI-가드) 변경 되돌림 0.
- STUB 대역 + 결정론 RNG. source/fixture PASS ≠ native/시각/청취/실게임/배포 PASS. `productionApplied=false`, `runtimeAccepted=false`.
- 이 epoch 저장 1반복/2파일 한정 준수(이 폴더 result.md+checks.mjs). 다음 독립 메모리 작업은 허가 없이 진행하되 새 산출 저장은 새 capacity epoch에서.
