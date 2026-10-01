# D13 callback 경계 수정 인계

- 실제 수정 전 후보 import로 clear/배열교체 callbacks=2/expected1 두 반례 재현(18:40:38.412Z).
- callback마다 epoch/배열 identity 재확인, drain 중 pass 재진입 차단, 무효 종료 시 신규 출처를 지우지 않고 이전 pending만 폐기했다.
- 새 회귀13 + 기존 인접19 = **32 PASS / 0 FAIL**. 실제 full hurtE/장판 루프 fixture 재사용. 원 피해/RNG/동기 반환/기본 비활성 보존.
- clear/교체 뒤 신규 등록 보존, callback 예외 FIFO, 전환+예외 stale 차단을 검수했다. 기존 원증거 덮어쓰기0; root before 재사용. 함수별 SHA와 후보 before/after는 evidence 참조.

## 재검사
`node tools/team-followup-20261001/ITEM/d13-callback-boundary-check.mjs`
`node tools/team-followup-20261001/ITEM/d13-deferred-contract-check.mjs`

`--red-current`는 수정 전 역사적 재현 명령이다. 수정 후 기본 검사는 고정 before 반례와 current를 대조한다.

## 남은 게이트
- 생산 적용0, root 독립 인수 대기. 자식 수치/cap/중첩/저장 계약 미결 유지.
- 동기 경계만 검수. clear 없는 배열 내부 변경/일시 A→B→A/비동기 pass/악의적 getter 완전 관측 계약은 아니다. 취소 큐의 시전 토큰 환불 정책 추가0.
- 공유 docs 쓰기0. root에 ITEM 팀 MD의 결함 수정·32검사·미적용 상태 갱신 제안.
- 변경 개수43→57→83: **80개 체크포인트 게이트 도달, root 체크포인트 필요**. Git쓰기 금지로 자체 커밋/타팀 정리0.
- 최종18:43:45Z 조회37개. 공유 상태 감소 원인 미확정이며 자체 Git쓰기0. 83개 당시 체크포인트 필요와 최종 관측을 구분한다.
- 기존 초안 보존. 서버/HTTP/게임/UI/빌드/사용자 세이브/새세션 접근0. 실제 시각과 명령은 receipt/evidence 참조.
