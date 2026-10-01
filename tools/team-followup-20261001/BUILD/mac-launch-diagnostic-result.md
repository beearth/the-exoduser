# Mac 시작 읽기 진단 — 원인 미확정, root 수정 후보 인계

## 실제 근거
수신/첫 Read: 2026-10-01T16:35:40Z. 동일 prefix 완료 중복 없음. task·AGENTS·BUILD 팀 MD·백업정책·execute-result·launch-hang-sample·실제 packaged manifest/server/plist·vendor osx 코드를 읽었다. 검증 명령 `node mac-launch-diagnostic-check.mjs`는 16:36:45.061Z~16:36:45.076Z, 작은 순수 문자열/문법10검사 PASS. 앱/프로세스 실행·종료·샘플 재수집0.

- root execute 결과: 97db3f1a9cf6c91ea7dbd50e16d6e61d60c996a9 기준 `.app` 실제 생성, 런타임 인수 아님. 해당 경로의 실제 파일을 검사했다.
- 기존 sample 시각 2026-10-02 01:35:08.492 +0900, PID8841 main-thread 1712표본이 NSAlert runModal 아래 modal event loop에 있다. **native alert 대기 확인**이며 경고 본문과 caller는 ???이므로 원인 확정 불가. CUA Invalid app/timeout은 task 제공 관측이며 BUILD가 재조작하지 않았다.
- 실제 package의 `chromium-args`는 `--user-data-dir="/Users/.../user-state/profile"` 형태로 JSON decode 후에도 double quote 문자가 포함된다. 경로에는 공백 없음. user-state 부모/profile/save 디렉터리 모두 현재 없음. 이 상태는 경로 해석/생성 오류 후보지만 단독 인과 증명 아님.
- 실제 `node-main.js` 존재, port3381·127.0.0.1 listen·고유 SAVE_DIR 일치. mkdir(SAVE_DIR,{recursive:true})가 있으므로 **부모 미생성만으로 node-main 저장 mkdir 실패를 단정할 수 없다**. 첫 dlog는 SAVE_DIR 생성 전에 있으나 oauth-debug.log 없음. node-main 진입 전 중단 가능성은 있으나 log write가 catch로 삼켜져 부재만으로 실행 여부 확정 불가.
- main plist CFBundleExecutable과 실제 main binary 일치. Helper4개 Alerts/GPU/Renderer/default의 plist executable·실제 이름 모두 일치. vendor osx는 v0.111.0 이상 Plugin helper 제외하며 현재4개와 일치. vendor catch가 오류를 로그만 남기는 위험은 있지만 현재 관측된 이름 누락 없음. 모드/해시/ID 상세는 evidence에 기록했다. 코드서명/OS 보안 인수는 하지 않았다.

## 공식 문서와 미확인
[NW.js Manifest](https://docs.nwjs.io/References/Manifest%20Format/)는 chromium-args를 공백 구분 문자열로 설명하고 node-main은 첫 DOM 창 로드 전 Node context에서 실행된다고 명시한다. [Command Line Options](https://docs.nwjs.io/References/Command%20Line%20Options/)는 user-data-dir을 데이터/캐시 경로로 정의한다. 이는 **double quote가 실제111 파서에서 제거되는지 또는 NSAlert를 일으키는지의 증거는 아니다**. NW_PRE_ARGS가 앞에 붙는 환경 경계도 있으나 현재 프로세스 환경을 추출하지 않았다.
공식 nwjs/nw.js raw nw111/main 소스 URL 조회는 cache miss, docs의 /en/latest URL은404였다. 이후 정식 docs URL은 검색 결과로 확인했다. 111 정확 파서/NSAlert 메시지 매핑은 UNKNOWN으로 남긴다. 신규 네트워크 요청은 이 공식 문서/소스 읽기만이며 다운로드·설치0.

## 안전한 최소 후보(root 전용 적용)
1. **보안 flags는 그대로** 두고 이 무공백 절대 profile 경로에만 manifest의 literal double quote를 제거하는 순수 후보 `mac-launch-diagnostic-candidate.mjs`를 인계한다. 공백/quote/상대경로/중복flag 입력은 거부한다. JSON 파일 자체의 정상 문자열 escaping과 argument literal quote는 구분한다. 현재앱/생산/공용 packager를 BUILD가 고치지 않았다.
2. root가 승인된 **새 고유 job**에서 user-state/profile 및 saves 부모를 소유 검증 후 준비하도록 후보화한다. 기존 profile/세이브 재사용·권한변경·quarantine 제거0. double quote 제거와 mkdir을 동시에 바꿔 성공하더라도 개별 원인은 확정하지 말고 두 요인을 구분한 검증 기록을 남긴다.
3. root가 native alert 본문/원래 stderr/log를 안전하게 확보해 경고 원인을 먼저 확인한다. 프로세스 종료·재실행·UI 입력은 root 담당. 보안 경고라면 우회하지 않고 해당 승인 절차에서 멈춘다.

## 검증 조건·한계
후보10검사 PASS는 문자열/parse/존재 검사뿐이며 NW.js parser·서버3381 응답·실제 profile 생성 성공을 대신하지 않는다. root의 다음 실검증 조건: 새 앱 manifest SHA 기록 → native alert 본문 대조 → 고유 profile 경로 실제 생성 → node-main startup 로그/3381 정확 콘텐츠 → 사용자 기존3333/3340/profile/save 보존 → 최종 앱 인수. 본 진단에서 소켓 연결/게임/API/사용자 세이브 읽기0.
첫 실험 명령 중 plist default import는 export shape 오류, 이어서 Helpers 전체를 app으로 취급한 명령은 app_mode_loader에서 ENOTDIR였다. 둘 다 읽기 검사 오류이며 helper 실패 증거 아님. 최종 검사는 namespace import 및 `.app` 필터로4개만 검사하여 해결했다. source SHA/실제 명령 결과는 전용 evidence/log에 기록했다.
공유 docs 반영안: native alert 대기와 CUA 조회 실패를 원인과 분리하고 profile literal quoting/부모 준비/정식 실행 인수 게이트를 추가한다. 공유 docs 쓰기0. 새세션·하위에이전트·Git·앱/생산 수정·사용자 브라우저·세이브·보안변경0. 결과 제출 뒤 멈추고 root 통합을 기다린다.
