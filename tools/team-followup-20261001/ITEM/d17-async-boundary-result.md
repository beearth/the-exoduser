# D17 비동기 경계 결함 수정 인계

기존 후보의 실패2건을 분리 재현했고 새 후보30검사 + 이전28검사 새 후보 대상 회귀 = **58검사 PASS**. 검사 UTC 2026-10-01T17:29:46.383Z/17:29:46.486Z. 이전 zone/source/lifecycle19파일 SHA 전후 동일. 사용자 초안/기존 증거 덮어쓰기0. 생산 HTML/아이템/드롭/경제/Git/게임/브라우저/서버/빌드/인코딩/새세션 실행·수정0.

최종 보존 재검사 UTC 2026-10-01T17:30:52.926Z/17:30:53.672Z:58검사 재통과, 이전19파일 SHA 및 회귀 import-only 대조 PASS. 완료 UTC 2026-10-01T17:30:53Z(실제 date 명령). evidence.finalVerification에 최종 출력 기록.

## 실패 재현과 좁은 수정

| 기존 결함 | 실제 fixture 관측 | 새 후보 |
|---|---|---|
| pending 중 current()가 신규 출처 등록 | 원 activateSpikeTrap→원 fireBlackStar 종료 뒤 x100→0 (효과0 기대 위반) | 원함수만 직접 실행, 등록·저장롤 읽기·검토 이동0 |
| A pending/B 완료 뒤 provenance 생성, 늦은 A finally(clear) | 새 장판 종료 시 x100 유지 (새 상태가 삭제됨) | 완료는 자기 pending token만 삭제, 전역 clear 호출 없음 |

`d17-async-boundary-candidate.mjs`는 기존 lifecycle/저장롤 검증/원소스 adapter를 재사용하는 얇은 차단 계층이다. 기존 코드를 덮거나 복제 재구현하지 않았다. createD17LifecycleReview/createD17LifecycleCalls API 이름과 호출 계약을 유지해 import 경로만 변경 가능한 독립 후보다. 자동 설치0, 기본 enabled=false/reviewOnly opt-in, proposal/runtimeReady=false, D17 저장 스키마 미채택 유지.

경계 진입은 private Set에 고유 token을 먼저 넣고 기존 provenance를 clear한다. 동기 원함수는 즉시1회 실행한다. 원함수가 반환한 Promise/thenable이 완료될 때 **자기 token만 삭제**한다. A/B 정순·역순 resolve/reject 어떤 조합에서도 하나라도 진행중이면 검토 생성등록/시전이동은 차단된다. 생성/시전의 원 게임 동작·MP/쿨/VFX 등은 지연하거나 막지 않는다.

explicit clear는 출처만 폐기하며 진행중 token을 취소하지 않는다. player/character/zones 교체 뒤에도 이전 비동기 작업이 실제 정착할 때까지 검토 효과0. 모든 token 해제 뒤 새 출처만 등록 가능하며, 완료 callback에 clear가 없어 후속 상태를 지우지 않는다. pending 중 생성된 객체는 자동 승격/재등록하지 않는다.

## 보존 범위·한계

- 원함수 this/인수/호출1, 일반 동기 반환 객체 identity, 동기 예외 객체 identity, 비동기 최종 값·reject reason 보존을 검사했다. native Promise **identity는 다름**, await 가능한 관찰 Promise를 반환한다. 기존 lifecycle wrapper도 Promise identity를 보존하지 않았다.
- 반환 object/function의 then getter를 동기1회 읽어 비동기 여부를 구분한다. callable then은 microtask에 원 receiver로1회 호출하며 Promise 표준 정착으로 첫 resolve/reject만 반영한다. getter throw는 동기 예외, then 호출 throw는 reject. 원래 객체를 아무 관찰 없이 반환하는 것과는 getter 부작용/추가 microtask/Promise subclass·species가 달라질 수 있다. 임의 thenable 부작용을 완전히 보존한다는 주장은 하지 않는다.
- 비함수 then을 가진 객체는 원 identity 반환. getter/then은 trusted caller 범위이며 Proxy·악성 재진입·교체된 Promise/queueMicrotask 보안 격리 없음. 진행중 never-settle 경계가 있으면 검토 효과는 계속 차단된다. clear로 임의 해제하지 않고 원 게임은 계속 실행한다.
- game 내부 상태 변경을 직렬화/취소/rollback하지 않는다. 늦은 원함수 자체가 P/G를 바꾸는 문제는 본 후보가 해결하지 않는다. 제안 아이템 저장롤 공급/clear 생산 호출부/실전 중첩 피해/브라우저 MIME 인수는 여전히 root/UIUX 게이트다.

## 실제 source·검사·재현

new check는 현재 fireBlackStar/activateSpikeTrap 전체 원문을 추출하여 작은 VM fixture에서 실행한다. SFX/시각 외부 의존만 대역. 이전28회귀는 기존 check 원문에서 candidate import 경로 한 곳만 바꾼 새 check-regression 파일이다. 실제 reset/load/캐릭터 AST 경계 fixture와8함수 SHA를 그대로 생성하며 생산 전체 HTML 실행0/사용자 세이브 접근0.

evidence.json에 기존 FAIL2건, 새 PASS30항목, 이전28 PASS 및 source SHA,19개 이전파일 보존 manifest를 기록했다. 원 HTML SHA c868284af349c996d42087e93eba47a10614d73cb8f55f4db5ae01dde89da31a. 함수별 SHA 재대조 후 root 독립 인수/백업 대상이다. 원격 기준 f965a15...은 배정 근거만 기록하며 Git 조회/쓰기/원격 인수 성공을 주장하지 않는다.

실행 명령:

```
node tools/team-followup-20261001/ITEM/d17-async-boundary-check.mjs
node tools/team-followup-20261001/ITEM/d17-async-boundary-check-regression.mjs
```

변경 파일: 새 prefix receipt/candidate/check/check-regression/evidence/result 6개 및 ITEM_TEAM_MASTER 본인 추가 구역. 전이 의존: 기존 lifecycle-roll-candidate→definitions.js/roll-values.js/source-adapter-callsite→source-adapter-candidate→zone-selection-candidate. 검사 의존은 binding-save-harness extract/acorn 및 Node fs/vm/assert/crypto. 이전 후보·증거 수정0.

docs 전체 U-D17/_uBlackZoneGather/uniqueRoll 검색과 담당 TOP8/D절 확인. 팀 문서에는 새 수정 상태만 추가하고 이전 인수/초안은 보존했다. 공용 총괄/CHANGELOG 수정0. 600px/정수1~3·최근접/tie 검토정책·좌표 외 상태 계약 변경0, 생산활성/G5 PASS 아님.
