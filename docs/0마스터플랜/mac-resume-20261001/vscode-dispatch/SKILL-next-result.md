# Mac SKILL — SKILL-ICE-CANCEL-EDGE 결과

작업 ID: `SKILL-ICE-CANCEL-EDGE` · 제목: iceStorm 취소·리젠 경계 자원 정합성 관측 보강
세션 `203377cc-64c4-47ea-af27-95b66ae829fa` 연속 · HEAD `30a204a7aa348a88b90bdc922862c610a7da938f` · 2026-10-01 · 터미널 6

## 수신·착수·완료 구분

- **수신**: `NEXT_TASK.md`(SKILL-ICE-CANCEL-EDGE) 확인. `SKILL-next-result/receipt` 부재·`R-입력-작업대장` SKILL 행은 관측기 본문만 기록 → 중복/진행중 아님, 신규 착수.
- **첫 Read / 명령 착수**: `R-입력-작업대장.md`, `3팀-후속검토.md`(SKILL 잔여게이트 "실입력·**리젠 경계** 미실시"), `SKILL03_설치확정_자원검수_20261001.md`(다음 승인검수 "조준 시작 이후 자원 변경 재검사"), `game.html:35052-35061`(리젠 세만틱) 대조. → 리젠·취소 자원 정합성을 선택.
- **완료**: 관측기 보강 + 부정회귀 테스트 작성·실행. 구문 PASS, 자가검사 **66/66 PASS**(exit0). game.html/easy/총괄MD/공용 test/타팀 파일 **무수정**, 게임/서버/브라우저/Git 조작 **0**.

## 선택한 미검수 경계

`취소·중복정리·예외·재설치·자원반환` 중 **자원반환(리젠·환급)·취소** 경계. 기존 산출(T1~T7)은 설치/지연발동/잔류소모·재설치·0표본·양성대조를 덮었으나, **(1) 적법 스택 리젠 완료와 부적법 스택 환급(중복)을 구분하는 근거**와 **(2) 취소 프레임의 자원 불변 검사**가 비어 있었다. 이는 `3팀-후속검토`와 `SKILL03` 잔여게이트가 명시한 지점이다.

## 리젠·취소 세만틱 (game.html 읽기 근거)

- 리젠 블록 `game.html:35052-35061`: `P._isStk<_isMax`일 때 `P._isRech-=sp`, `_isRech<=0`이면 `P._isStk=min(_isMax,_isStk+1)`·`_isRech=(_isStk<_isMax?1500:0)`. ⇒ **적법 스택 획득 = 리젠 완료 프레임뿐**(dStk=+1 ∧ 직전 rech>0 ∧ 한 번에 1씩).
- 취소 분기 `game.html:35069`(`if(MBjust[2]||K['Escape']){P._isAiming=false; …}`): 자원 무변(조준 플래그만). 단 리젠 블록(35052-61)이 조준/확정 블록(35063-90)보다 앞서 매 프레임 독립 실행 → 취소 프레임이 적법 리젠 완료와 겹칠 수 있음(부작용 아님).
- 설치 비용 `:35082 P.mp=max(0,P.mp-40)`, `:35083 _fireZones.push(type:'iceStorm',maxT:600)`, `:35090 P._isStk--` (앞선 SKILL-03 근거와 동일 함수, 타 세션 편집으로 줄 이동).

## 보강 내용 (patch 요약 — 소유 파일 `ice-cancel-probe.safe.js`)

| 구분 | 신호 | 정의 | verdict 영향 |
|---|---|---|---|
| 적법 리젠(정상) | `legitRecharge` / `RECHARGE_TICK` | `dStk===+1 ∧ prev.rech>0` | 플래그 아님, `counts.rechargeTicks`만 증가 |
| 부적법 스택 증가 | `STK_REFUND?` | `dStk>0 ∧ ¬legitRecharge` (dStk>1 포함) | SUSPECT |
| 취소 관측 | `isCancel` | `prev.aim ∧ ¬cur.aim ∧ ¬설치` | 그 자체는 중립, `counts.cancel`만 증가 |
| 취소 부작용 | `CANCEL_SIDE_EFFECT?` | 취소 프레임에 설치/스택감소/부적법 스택증가 혼입 | SUSPECT |

`dump().counts`에 `rechargeTicks/stkRefund/cancel/cancelSideEffect` 추가, `recharges/refunds/cancels` 프레임 셀렉터 추가. `verdict()` 누수 집합에 `stkRefund`·`cancelSideEffect` 포함, PASS 사유에 취소/리젠 관측수 명시. 헤더에 게이트 **G8** 문서화.

## 부정회귀 판정표 (mock 자가검사)

| 테스트 | 시나리오 | 기대 | 결과 |
|---|---|---|---|
| T8 | dStk=+1, prev.rech>0 | legitRecharge, 플래그0, PASS | PASS |
| T9 | dStk=+1, prev.rech=0 | STK_REFUND?, SUSPECT | PASS |
| T9b | 한 프레임 dStk=+2 (prev.rech>0) | STK_REFUND?(1회1스택 위반), SUSPECT | PASS |
| T10 | 취소, 자원 무변 | cancel1, 부작용0, PASS | PASS |
| T11 | 취소 ∧ 적법 리젠 완료 동시 | 부작용0·환급0, 오탐 없이 PASS | PASS |
| T12 | 취소 프레임에 스택 감소 | CANCEL_SIDE_EFFECT?+잔류소모, SUSPECT | PASS |

T11이 핵심 **오탐 방지** 회귀: 매 프레임 독립 실행되는 리젠 완료가 취소와 겹쳐도 부작용으로 오판하지 않음을 고정.

## 검증 (명령·exit)

```
node --check tools/team-followup-20261001/SKILL/ice-cancel-probe.safe.js  → SYNTAX OK (exit0)
node tools/team-followup-20261001/SKILL/ice-cancel-probe.selftest.mjs     → 66 PASS / 0 FAIL (exit0)
```
(기존 T1~T7 38 assertion + 신규 T8~T12·T9b 28 assertion = 66)

## docs/SSOT 대조

- `rg`로 iceStorm 리젠·스택 수치 확인: SSOT `2_1 스킬관리+합체시스템.md:407` = **MP40 / 2스택(Lv10→3) / 25초(1500f)/1충전 / 10초(600f) 지속**. 관측기 상수·판정 로직과 일치 → **docs 수치 정정 불필요**.
- **발견한 불일치(핸드오프, game.html 미수정)**: 코드 블록 주석 `game.html:35052`는 "15초/1충전"이라 적혀 있으나 실제 `_isRech=1500`(60fps 기준 25초)이며 SSOT 문서는 "25초/1500f"로 코드와 일치. game.html 인라인 주석만 stale. 총괄/소유팀이 game.html 주석을 "25초"로 정정 권고(본 팀은 game.html 수정 금지라 미반영).

## 남은 잔여게이트 (인계)

- **실브라우저 입력·리젠 중 확정·취소 실측**: 미실시. QA 종료 인계 후 `IceCancelProbe.install()`→입력순서 명세로 실게임에서 `dump()/verdict()` 수집. 양성대조 포착 필수.
- **예외 경계(미착수 후보)**: tick의 `readRaw()`가 throw하면 rAF 루프가 조용히 죽고 리스너가 누수될 수 있음(현재 기본 readRaw는 try/catch로 null 반환하나 주입형 readRaw는 미보호). dispose의 `removeEventListener` 개별 try 미적용. 다음 SKILL 한 건 후보로 인계.
- 무기공격 라우트 2차확인·패드·합체 holyIce 자동 존은 기존 범위 밖 유지.
