# BUILD 후속 — 포트 충돌 처리의 독립 후보

기존 BUILD 세션 01a0f6e6-2e4c-7322-92d7-3aa309857856 한 곳에서만 진행한다. 총괄이 recovery-contract 소스와 보고를 읽고 26/26을 직접 재실행했다. 이는 누락 관측 포함 정적/모의 인수이며 실제 패키지 검수가 아니다.

기존 INT-002 복구 백로그에서 확인된 EADDRINUSE 리스너 부재 한 건을 처리한다. 쓰기 소유는 tools/team-followup-20261001/BUILD/port-error/와 이 폴더 BUILD-port-error-result.md/BUILD-port-error-receipt.json만이다. 기존 BUILD 산출은 인수되었으니 수정하지 않는다. server.cjs/node-main.js/game.html/공용docs/Git은 총괄 소유다.

두 서버의 독립 사본 또는 최소 diff 후보를 작성한다. 바인딩 실패 때 요청한 host/port·error.code를 식별 가능한 로그로 남기고 해당 서버만 안전 종료하는 계약을 제안·검증한다. 다른 프로세스 종료, 포트 재시도/자동 변경, 기존 서버 콘텐츠를 성공으로 오인, 세이브 변경 금지. 정상 listen·EADDRINUSE·EACCES/기타오류를 EventEmitter 모의로 검사한다. 실제 socket/게임/패키지/인코딩/대형검사 실행 금지. 라이브 종료 검수는 별도 대기 게이트로 표시한다. 새 세션·에이전트 금지.

한국어 receipt를 먼저 남기고 소스 읽기·후보 작업을 시작한다. 완료 시 관련 docs 키워드 검색, 최소 hunk·검사 exit·생산 미반영·남은 실검수 한계를 result로 인계한다. 사용자에게 사소한 확인을 반복하지 않는다.
