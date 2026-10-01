# NW.js 공유 상태 재현 준비 — 아직 실행하지 않음

QA 종료 후 root가 별도 실행 게이트에서만 수행한다. 새 다운로드/설치가 필요하면 이번 준비를 근거로 자동 진행하지 않는다. 이 하니스는 HTTP 서버를 만들지 않고 상태 전환을 모사한다. NW.js 객체 공유는 실제 앱에서 검사하되 실제 bind 실패 인수는 별도다.

## 공식 근거 / 적용 버전

- https://docs.nwjs.io/References/Manifest%20Format/ : node-main은 첫 DOM 창 로드 이전 Node context에서 실행된다는 문서.
- https://docs.nwjs.io/For%20Users/Advanced/JavaScript%20Contexts%20in%20NW.js/ : 기본 separate context에서 require/node-main의 Node context 공유 및 별도 context 생성 조건 설명. Node 객체 접근 근거이지 현재 바이너리에서 동일 process 관측 증거는 아님.
- https://docs.nwjs.io/References/Changes%20to%20Node/ : process.versions.nw/chromium 및 node-main 사용 시 process.mainModule 설명.
- https://docs.nwjs.io/ : 문서 범위0.13 이상. 이번 조회일2026-10-01. 목표 빌더0.111.2 Windows x64/normal. 문서는 버전 고정0.111.2 스냅샷이 아니므로 실행 시 실제 버전을 기록하고0.111.2 인수와 다른 버전 진단을 구분한다.

## 설치 조회 결과

읽기 find: /Applications, ~/Applications, node_modules (깊이4), ~/Library/Caches, out, vendor (깊이5)에서 nwjs.app/nw/nw.exe 조회. 실행 바이너리 경로를 발견하지 못했다. vendor/nwjs-ffmpeg는 코덱 디렉터리일 뿐 NW.js 설치 증거가 아니다. 검색 범위 밖 설치 부재까지 단정하지 않는다. 버전 명령 실행도 하지 않았다.

## root 실행 지시 (현재 실행 금지)

1. QA 측정 종료 확인. 읽기 조회로 기존 NW.js 실행 파일을 식별하고 승인된 실행 위치/버전을 기록한다. 설치 경로 미확인이면 중단하고 root 게이트로 남긴다.
2. context-probe 아래 고유 run-ID 디렉터리에 package.json/probe-node.cjs/probe.html을 복사한다. 빌드·압축 불필요. 각 시나리오 별 디렉터리/고유 manifest name/절대 Chromium user-data-dir를 지정해 기존 앱 single-instance·프로필과 분리한다. 기존 security flags를 새로 넣거나 완화하지 않는다.
3. 해당 run 디렉터리를 기존 실행 파일의 패키지 인수로 넘긴다. Mac 확인 예: `EXODUSER_CONTEXT_CASE=ready-before "$NW_BIN" "$RUN_DIR"` (NW_BIN/RUN_DIR는 root가 확인한 절대 경로). Windows는 기존 실행 환경에서 같은 환경변수와 격리 경로를 사용한다. 명령은 예시이며 이번 세션에서 실행하지 않았다.
4. ready-before / ready-after / error-before / error-after / pending / missing을 한 앱씩 실행한다. 창은 root가 정상 닫으며 다른 프로세스를 kill하지 않는다. 각 화면·probe-log.ndjson·실행 파일 SHA·manifest SHA·시각·실제 versions를 보존한다. 한 실행의 공유 상태나 로그가 다음 실행에 섞이지 않아야 한다.
5. STRICT identity: node-main이 만든 함수가 전달받은 페이지 require(process)를 node-main의 캡처 객체와 `===`로 비교한다. pid/문자열 일치만으로 같은 객체 PASS하지 않는다. 함수를 호출할 공유 상태 자체가 없으면 FAIL_CONTEXT_MISSING으로 차단한다.

| 시나리오 | 기대 |
|---|---|
| ready-before | process identity true, 첫 snapshot ready, PASS_SCENARIO |
| ready-after | 초기pending→페이지 attach→모의100ms 후ready, PASS_SCENARIO |
| error-before | 첫 snapshot failed/EACCES, PASS_SCENARIO, blocked true |
| error-after | 초기pending→모의100ms 후failed/EADDRINUSE, PASS_SCENARIO, blocked true |
| pending | 2초 후 FAIL_PENDING_TIMEOUT, blocked true. 실패 검출이 예상 결과; 정상 진입 PASS가 아님 |
| missing | strict identity true지만 entry 없음, PASS_MISSING_FAIL_CLOSED |

모든 경우 실제 navigations=0. ready도 실제 게임 주소를 열지 않고 wouldNavigate만 기록한다. 오류 상태는 실제 OS EADDRINUSE/EACCES 재현이 아니다. 공유 context가 없으면 화면/콘솔만 남을 수 있으며 node-main 로그에 페이지 결과가 없다는 점도 실패 증거다. 2초 timeout은 진단만이며 생산 pending 정책을 바꾸지 않는다. 조용한 무한pending을 완료로 세지 않는다.

실제로 공유되어도 failure-entry 전체 인수는 아니다. 실제 bind 실패, 성공 콜백 순서, 프로필 격리, package 응답 신원/원격 진입은 다른 게이트다. mixed context/new_instance 조건은 이번 manifest에 추가하지 않으며 현재 생산 조건에서 먼저 검수한다. 실환경 결과란은 root가 별도 기록한다.
