# BALANCE-SAVE-WRITE-FAILURE

기존 BALANCE 세션 다음 독립 작업. AGENTS/팀 MD/기존 저장 SSOT 및 disk-save-restart-result를 읽고 중복 진행·대기/초안 보존. 이전 EPERM 통합 검수는 미완료 상태를 유지한다.

server.cjs POST /api/save는 기존 slot.json에 writeFileSync로 직접 덮어쓴다. 저장 안정성 백로그에서 쓰기 도중 실패하면 기존 경제/캐릭터 저장이 손상될 수 있는 경계를 소스 수준에서 재현하고 최소 원자적 교체 후보를 제출한다. 원 코드 추출과 실패 주입 fs 대역으로 기존 파일 일부 기록 뒤 오류를 재현한다. 새 후보는 동일 디렉터리 임시 파일 쓰기/교체 실패/성공/임시 파일 정리 분기를 검증하고 실패 시 이전 파일을 보존한다. 이 fixture는 실제 디스크·프로세스 크래시 내구성 또는 fsync PASS가 아니다. 반환 JSON/슬롯명/저장 스키마 호환을 유지한다. 실제 결함·후보 한계를 분리한다.

소유: tools/team-followup-20261001/BALANCE/save-write-failure-*와 BALANCE 팀 MD 본인 추가 구역. server.cjs와 production HTML 및 다른팀 파일은 읽기만, 패치는 새 소유 파일로 만든다. BUILD도 server.cjs를 읽기만 하므로 서로 다른 후보를 덮지 않는다. fs 대역 메모리 fixture만 사용하고 실제 사용자 파일/세이브 접근0. 네트워크/서버 listen/API/포트 재시도/바인딩 우회/브라우저/빌드0. 기존 EPERM을 우회하여 미실행 통합검수를 수행하지 않는다. QA 단독 실UI 슬롯 유지. 권한변경/Git/새팀·세션·에이전트0. 수신·Read·수정·회귀·제한을 한국어 receipt/result로 기록한다.
