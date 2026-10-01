# 실제 격리 로컬 API 저장·종료·재기동 검수

기존 BALANCE의 승인 후속 한 건. 생산 저장 소스는 원격6be3a06b4e8d03768a35f4c57d419f45c8efeb39에 통합됐다. 메모리 sink 회귀의 반복 대신 실제 server.cjs 프로세스와 디스크를 검증한다. 생산 HTML/server/schema 수정권 없음. native Mac 잠금 지속, UI/게임/실행중 서버/사용자 세이브 접근 금지.

먼저 AGENTS·저장 SSOT·server.cjs의 HOST/PORT/EXODUSER_SAVE_DIR/API 계약을 읽고 격리 보장을 확인한다. 새 mkdtemp 경로를 명시적 EXODUSER_SAVE_DIR로 전달하고 HOST=127.0.0.1, 새 빈 포트(3381/3382/3383/3340/3333 제외, OS ephemeral 포트 선확인)를 사용한다. 실제 child PID와 자신의 정확한 실행인수만 관리하고 종료/재기동한다. 원본 경로/환경 기본값으로 절대 실행하지 않는다. 테스트 합성 캐릭터만 쓰며 임시 증거는 보존한다. 격리 계약이 없거나 권한/네트워크 거부가 있으면 실행/우회하지 말고 정확한 원인을 기록한다.

현재 생산 저장 함수를 source fixture에서 추출해 실제 로컬 API로 연결하는 작은 통합 테스트를 작성. 서버 ACK/실제 JSON 디스크 내용/정상 종료/재기동 뒤 /api/load 응답을 구분한다. busy 중 새 상태, 실패 뒤 후속, 캐릭터 문맥변경 폐기 중 실제 계약으로 가능한 경계를 확인한다. 요청을 fixture에서 지연/실패시키면 그 조작 범위와 진짜 서버 부분을 명확히 구분하고 실서버 장애/내구성 보장으로 과장하지 않는다. 서버 종료는 자신이 만든 child에만 정상 SIGTERM 후 종료 이벤트를 기다리고, 실패 시 다른 서버를 종료하지 않는다. 앱 재실행이나 실제 브라우저 종료 보장을 주장하지 않는다.

소유: tools/team-followup-20261001/BALANCE/disk-save-restart-*와 새 격리 출력, 해당 저장 검수 전용 docs. 공용 총괄/CHANGELOG/BALANCE master는 root가 동기화하므로 기존 파일 수정하지 않는다. BUILD가 대형 패키징 중이므로 CPU/FPS/성능 측정 금지, 작은 HTTP/JSON 검수만 수행한다. 실제 UTC/포트/PID/경로·전후 hash·통과·미검수·모든 import 의존성을 기록. Git 쓰기/새 세션/하위에이전트/설치 금지. 한국어 결과 보고.
