# BALANCE-ATOMIC-FILE

기존 BALANCE 세션의 다음 한 건. 기준8e4ed4e446329c863ed4d2d556d386c37f3ae310, server SHA6a7c1083ac10b105cca3624c8fd0e919d14a59b32774612ff0a00cb881be8538. root가 atomicSaveJSON을 생산에 반영, 합본40 소스검사/백업 완료. 동일 과제 진행/대기와 기존 초안 확인 후 중복 실행하지 않는다.

실제 production atomicSaveJSON과 sequence 선언만 AST로 추출하여 소유 전용 tools/team-followup-20261001/BALANCE/atomic-file-fixtures/<고유실행ID>/ 안의 합성 JSON 슬롯으로 작은 실제 파일 I/O 검수를 수행한다. 서버 파일 전체 import/실행 금지. 신규/기존 교체/반복 저장과 쓰기·rename 실패 시 이전 bytes 보존, 임시파일 정리를 확인한다. 실패 주입은 특정 fs 메서드 대역으로 명시하되 나머지는 실제 소유 디렉터리의 fs를 써 실제 파일 bytes를 대조한다. 플랫폼에서 안전하게 재현 가능한 오류만 다루며 전원손실/크래시/fsync/Windows PASS로 확대하지 않는다. 런타임 환경·함수SHA·생성파일목록·실제/주입 오류를 분리한다. 파일 충돌 시 기존것을 지우거나 덮지 않고 고유 디렉터리로 한정한다.

이것은 이전 EPERM HTTP/서버 작업의 재시도·대체 실행이 아니다. 그 미완료 gate는 유지하고 listen/포트/네트워크/API/실서버/앱/사용자세이브는 접근하지 않는다. 파일 I/O 자체가 거절되면 다른 도구/권한 경로로 우회하지 않고 그 단계를 기록한다. 다른 담당과 checkout 공유: 소유 atomic-file-*와 전용 fixtures, 팀MD 본인구역만. server/HTML/공유docs 읽기전용, 타팀 변경·stage·초안·기존 자료 복구/삭제0. 합성 검수 파일 원자료는 남기고, helper 자체의 소유 temp 정리만 허용한다. Git쓰기/빌드/권한변경/새팀·세션·에이전트0. 한국어 수신/Read/Edit/실행/제한을 구분한다.
