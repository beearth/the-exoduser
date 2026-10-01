# BUILD 포트 오류 후속 결과

배정된 기존 세션에서 수행했다. 세션 ID는 지시서의 `01a0f6e6-2e4c-7322-92d7-3aa309857856`이며 별도 런타임 대조는 하지 않았다. 새 세션/에이전트 생성0. 생산 미반영 후보 검사 완료, 실환경 종료 검수는 대기다.

## 수신·실제 착수

receipt를 먼저 작성하고 `tail -9 server.cjs`, `tail -9 node-main.js`, PORT/HOST/createServer/error 리스너 검색을 실제 수행했다(exit0). 2026-10-01T10:52:33Z에 소스 읽기를 마쳤다. 두 서버에 error 리스너가 없고 개발은 별도 server 변수, 패키지는 createServer→listen 체인인 것을 확인한 뒤 독립 후보를 작성했다.

## 최소 후보 계약

| 대상 | 최소 변경 | 검증·한계 |
|---|---|---|
| `server.cjs.diff` | listen 직전 error 리스너; host/port/error.code 로그; exitCode=1; 해당 server.close | 정상 listen 보존; 미지정 HOST는 `<unspecified>`로 표시. 기본 host/port 변경 없음 |
| `node-main.js.diff` | createServer 결과를 server로 분리; 같은 오류 계약; console.error와 기존 dlog 병행 | 고정 loopback 보존; 3347은 통합 사본의 검증 값이며 생산 기본3333 변경 없음 |
| 반복 error | serverFailed 플래그로 최초1회만 처리 | 로그/close 중복 방지. 재시도·자동 포트 변경 없음 |
| close 콜백 | bind 실패의 ERR_SERVER_NOT_RUNNING을 받아 종료 처리 | 모의 확인. 다른 프로세스·서버를 종료하지 않음 |

경로는 `tools/team-followup-20261001/BUILD/port-error/`다. 두 `.diff`는 줄번호 없는 최소 hunk 후보이며 Git 적용 가능한 패치라고 주장하지 않는다. `check.cjs`는 현재 소스에서 각 hunk의 기존 구역이 정확히1회 있는지 확인하고 메모리 치환 후 전체 구문을 검사한다. 실제 실행은 listen/error 꼬리 구역과 EventEmitter만이다. HTTP 처리기·세이브·실제 socket은 실행하지 않는다.

**안전 종료의 범위:** 해당 HTTP 서버 close 및 실패 exitCode 설정이다. process.exit/kill을 사용하지 않아 NW.js GUI나 기타 event loop의 강제 종료를 보장하지 않는다. 다른 작업을 훼손하지 않는 최소 후보이며, NW.js 창이 기존 포트 콘텐츠를 표시할 수 있는 문제를 이 후보만으로 해결했다고 선언하지 않는다. 별도 진입 차단/실패 화면 정책은 총괄 결정·실검수 게이트다. listen 성공 로그는 모의 실패에서0회였다.

## 검사 근거

- `node tools/team-followup-20261001/BUILD/port-error/check.cjs` → exit0, **13 PASS / 0 FAIL**.
- 양쪽 전체 후보 구문2건, 정상/EADDRINUSE/EACCES/EIO/code없는UNKNOWN 각5건, 개발 미지정HOST1건. 오류당 로그·close1회/exitCode1, 성공로그0, listen1회 및 handler 선등록을 검사했다.
- 원자료 `evidence.json`: UTC 실행 시각2026-10-01T10:53:08Z 이전, 소스 SHA-256·개별 결과·한계. 입력 소스 SHA는 현재 디스크 기준이며 패키지 SHA가 아니다.
- `rg -n 'EADDRINUSE|EXODUSER_SAVE_DIR|INT-002|3347' docs/` → exit0, 38행. 검색 원자료 `docs-search.txt`. 기존 INT-002/통합3347 계약은 유지한다. 공유 대장 보충 후보: “리스너/오류 로그/HTTP close는 독립 후보13/13; 생산 미반영, NW.js 실패 진입 차단과 실환경 종료 별도 대기”. 공유 docs는 수정하지 않았다.

## 인계·미실행

실제 게임/브라우저/소켓/서버/패키지/빌드/인코딩/Git 명령0회. 세이브 읽기·쓰기0회. 이전 BUILD 산출·공용 코드·공용 docs 변경0. 이번 후보는 총괄의 검토·순차 적용·생산 회귀·관련 SSOT 기록 전까지 구현 완료가 아니다.

남은 게이트: 실제 EADDRINUSE/EACCES에서 동일 서버만 종료되는지, 기존 서버가 보존되는지, NW.js가 기존 서버 화면을 성공으로 오인하지 않도록 진입을 차단하는지, 정상 package3347/개발3340 동작 및 패키지 SHA를 총괄이 별도 검수한다. 해당 소유권 밖 작업은 실행하지 않고 인계한다.
