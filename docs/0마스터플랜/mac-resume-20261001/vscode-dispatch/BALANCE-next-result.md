# BALANCE-FIREBALL-HOOK-CANDIDATE

## 수신·착수·완료 구분

- 2026-10-01T11:45:16Z: 기존 세션의 NEXT_TASK 수신. 배정 ID `01a0f6e6-5303-7392-81ba-94c42e349ffc`는 문서 근거이며 런타임 모델/ID 독립 확인은 하지 않았다.
- 실제 착수: NEXT_TASK·직전 BALANCE-result·팀 MD·ITEM SSOT를 읽고 소유 폴더에 다음 후보/진행 영수증이 없는 것을 확인했다. 기존 완료 감사와 별도 작업이며 새 세션을 만들지 않았다.
- 완료: 독립 계약 어댑터와 새 회귀 13 PASS / 0 FAIL / 0 SKIP. 이전 8PASS2SKIP 감사는 재실행하지 않았다. **생산 효과 구현 완료가 아닌 연결 전 계약 후보 완료**다.

## 산출·명시 계약

| 파일/계약 | 결과 |
|---|---|
| `tools/team-followup-20261001/BALANCE/fireball-contract.mjs` | `createFireballContract` 독립 연결 어댑터. 브라우저·서버·저장·생산 import 없음 |
| `FIREBALL_TIERS` | 4/7/11/16/22% 고정·동결. 두 HTML 실제 데이터와 대조하는 새 테스트 포함 |
| `eligible(event)` | 허용 피해원·유효 적중 판단을 명시 boolean 콜백으로 주입. 자동 기본값 없음 |
| `probability(event, tiers)` | 장착/중첩 판단 콜백. 유한 [0,1] 외 거부, 임의 캡/롤 방식 없음. 초과 합산 확률은 미지원 계약으로 오류 처리하며 생산 수치를 보정하지 않음 |
| `random()` | 명시 난수 공급자, [0,1) 외 거부. `sample < chance` 후보 경계. 미장착0·부적격·생성탄은 난수를 소비하지 않음 |
| `emit(event, provenance)` | 피해·원소·속도·수명·자원·대상 선택은 전적으로 통합 담당 콜백 책임. 어댑터는 피해/자원을 계산하거나 차감하지 않음 |
| 재귀 후보 | 동기 재진입 차단 + 생성탄에 동결 `{noProc:true,procOrigin:'onHitFireball'}` 전달. 임의 procOrigin이 있는 이벤트도 차단하는 보수적 교차 프록 후보이며 확정 생산 규칙 아님 |
| 중복 후보 | 동일 이벤트 객체 WeakSet 1회 처리. 실패 난수/콜백 예외/부적격도 소비 처리하여 재시도 재추첨 없음; 다음 독립 객체 적중은 처리 가능 |
| 반환 의미 | `emission-requested`는 emit 호출 종료만 뜻함. 실제 탄 생성·피해 발생·화면 표시 성공이 아님 |

## 새 회귀 판정

| 검증 | 판정 |
|---|---|
| 실제 두 HTML의 다섯 확률 일치 | PASS 1 |
| 각 다섯 확률의 0/직전/동일/상한 결정적 경계 | PASS 5 |
| 성공/실패 적중 재전달의 재추첨·중복 방지 | PASS 1 |
| 생성탄·다른 프록의 RNG/emit 이전 차단 | PASS 1 |
| 동기 재진입과 이후 생성탄 재적중 | PASS 1 |
| 주입 피해원·DOT·0피해·무적 거부 fixture | PASS 1, 게임의 확정 허용 정책으로 해석 금지 |
| 미장착0 및 명시 강제 .44 fixture | PASS 1, 정상 중첩 승인 아님 |
| 누락 계약·잘못된 값의 실패 폐쇄 | PASS 1 |
| emit 예외 후 동일 적중 차단·독립 적중 계속 처리 | PASS 1 |

명령 `node --test tools/team-followup-20261001/BALANCE/fireball-contract.test.mjs` exit0, 원자료 `tools/team-followup-20261001/BALANCE/next-tests.txt`. `node --check tools/team-followup-20261001/BALANCE/fireball-contract.mjs` exit0. docs 전체 `rg -n 'onHitFireball|fireOnHit|procOrigin|noProc' docs/` exit0, 검색 원자료 `tools/team-followup-20261001/BALANCE/next-doc-keywords.txt`.

## 연결 절차 후보·남은 게이트

1. 총괄/ITEM/SKILL이 피해원, 유효 적중 시점, 막타/방어막/회피, 확률 집계·중첩 정책을 확정한다. `fireOnHit`의 화상 .3이나 자원 값을 화구 피해로 전용하지 않는다.
2. 확정된 직접 적중마다 **새 불변 이벤트 객체를 1개 생성하고 재전달에도 같은 객체를 유지**한다. 복제 객체는 WeakSet 중복 방지 범위 밖이다. 풀 이벤트 객체를 재사용하면 영구 중복으로 거절되므로 어댑터 이벤트는 풀링하지 않는다. 다중 대상 공격은 대상별 유효 적중 객체인지 정책 확정 필요.
3. 실제 피해 처리 뒤 통합 담당이 어댑터를 호출하고, emit에서 기존 탄 풀을 사용하되 provenance 두 필드를 반드시 기록한다. 충돌→hurtE→후속 훅 이벤트까지 해당 메타를 전달한다. 신규 보통 탄의 풀 재사용 때 잔존 메타를 초기화한다.
4. 현재 차단은 **같은 어댑터 인스턴스의 동기 재진입**과 전달된 메타에 한정된다. 비동기 경로에서 메타를 잃거나 다른 프록 어댑터가 메타를 무시하면 보호되지 않는다. 생산 충돌·교차 프록 회귀, 이벤트 복제/풀 계약 검사와 실제 게임·패키지 검수가 필수다.

피해·자원·원소·투사체·교차 프록 정책은 여전히 미결정이다. 이 독립 테스트는 실제 hurtE 연결이나 생산 재귀 안전 증명이 아니다. 공유 docs 정정 후보: BALANCE 대장에 ‘독립 계약 후보13PASS, 생산 MISSING_HOOK 유지’를 추가하고 ITEM 구현 상태도 미연결로 유지한다. 소유권 제한으로 공유 문서를 직접 수정하지 않았다.

생산파일·공용 test·타팀 파일 편집0. 게임/서버/브라우저/청취/이미지/인코딩/빌드/새세션/PC/Git조작0. 총괄이 계약 확정·실제 연결 소유권·원격 체크포인트를 인수해야 한다. 다음 승인 없이 소유권 밖 생산 연결을 하지 않는다.
