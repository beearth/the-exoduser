# BUILD 실패 포트 진입 차단 후보

기존 세션 유지. 지정 독립 후보만 작성했다. **19/19 모의 검사 PASS, 생산 미반영, NW.js 실환경 차단 보장 아님.** 완료 후 다음 지시를 기다린다.

## 현재 경로·착수 근거

| 근거 위치 | 현재 순서·영향 |
|---|---|
| `package.json:6` / `package.json:7` | main이 `http://localhost:3333/index.html?demo=1`이고 node-main은 `node-main.js`. main 자체에 소유 서버 준비 조건이 없음 |
| `node-main.js:65` / 파일 끝 listen | createServer 후 loopback3333 바인딩. 성공 시 dlog만 기록. 이전 error 후보도 HTTP close/exitCode만 있고 main 진입을 제어하지 않음 |
| `build-nwjs.mjs:96` / `build-nwjs.mjs:122` | 통합 복사본 main3333→3347, node-main PORT3333→3347 및 저장 경로 치환. 브라우저는 서버 소유권 검증 없이 HTTP main으로 향함 |
| `index.html:2639` / `index.html:2737` | showLoading/hideLoading 및 로비 진입은 HTML 로드 뒤의 UI 흐름. 이미 다른 서버에서 받은 index라면 이 단계만으로 bind 실패를 차단할 수 없음 |

2026-10-01T11:05:52Z 지시서·package.json 및 진입 검색을 읽고 receipt에 실제 착수를 기록했다. 이후 빌더 FILES/manifest 치환 구역과 index 로딩 진입을 직접 읽었다. 모두 exit0. 실제 NW.js의 node-main/창 초기화 순서는 관측하지 않았다. 위는 코드 경로 분석이며 타 서버 화면 표시의 실환경 재현이 아니다.

## 독립 후보

모든 산출은 `tools/team-followup-20261001/BUILD/failure-entry/`에 있다.

| 파일 | 변경 후보 |
|---|---|
| `package-entry-state.cjs` | pending/ready/failed 공유 상태 및 이벤트. ready는 최초 pending에서만 허용; failed 후 늦은 ready 금지 |
| `package-entry.html` | 패키지 내부 로컬 진입. 상태 연결 부재/오류/실패는 HTTP 탐색0. 본인 node-main listen 성공 상태에서만 기존 `index.html?demo=1`로1회 진입. pending에서는 기다리며 재시도/타이머/포트 탐색 없음 |
| `node-main.js.diff` | process에 해당 실행의 상태 객체 등록; error→failed와 이전 close 계약; listen 성공→ready. 이전 후보를 대체하는 누적 hunk이며 두 후보를 중복 적용하지 않음 |
| `build-nwjs.mjs.diff` | FILES에 로컬 진입2파일 추가. 기존 통합 포트/프로필 치환을 마친 뒤 **출력 manifest만** main을 `package-entry.html`로 교체 |

원본 package.json main은 보존한다. 이를 먼저 로컬 main으로 바꾸면 현재 빌더의 localhost3333 사전조건이 깨지므로 이번 후보는 출력 manifest에서만 main을 변경한다. 두 신규 파일은 총괄이 검토 후 실제 패키지 입력 위치에 인수해야 하며 현재 독립 폴더에 있는 것만으로 빌드가 적용되는 것은 아니다. 이 후보 상태에서는 빌드를 실행하지 않는다.

개발3340은 그대로 두고 패키지3333/통합3347만 허용한다. 저장 코드·경로·사용자 데이터는 그대로다. 원격 HTTP 탐색은 성공 확인 뒤에만 수행하도록 설계했다. 권한 설정·강제 종료·자동 포트 변경·재시도·새 게임 기능은 추가하지 않았다. 메시지는 고정 리프 p 노드에만 기록한다.

## 실행·원자료

- `node tools/team-followup-20261001/BUILD/failure-entry/check.cjs` → exit0, **19 PASS / 0 FAIL**. 현재 소스의 hunk 유일성2건, node-main 전체 구문1건, 서버 성공/EADDRINUSE/EACCES/code없는 오류4건, 두 포트의 페이지/서버 선후·실패·늦은ready8건, 공유 상태 부재/Node 불가/3340 거부/pagehide 정리4건.
- listener 모형은 실패 뒤 성공 콜백도 의도적으로 호출해 진입이 열리지 않는지 검사했다. 실제 socket/HTTP handler/세이브 작업을 실행하지 않는다.
- `node --check .../package-entry-state.cjs` → exit0.
- `evidence.json`에 입력 package.json/node-main/build/index SHA-256, UTC 시각, 개별 결과와 한계를 보존했다. SHA는 현재 디스크 입력이며 실제 패키지 SHA가 아니다.
- `rg -n 'node-main|INT-002|3347|로딩.*진입' docs/` → exit0, 105행; `docs-search.txt`에 원자료 보존. 공용 docs 수정은 하지 않았다. 총괄 기록 후보: INT-002에 “출력 manifest 로컬 main+소유 listen 상태 연동은 독립19/19; 생산·실환경 미인수”를 추가한다.

## 남은 게이트·주의

1. 실제 NW.js node-main과 로컬 페이지에서 `require('node:process')`가 **동일 process 객체**를 공유하는지 필수 확인. 모의는 이를 주입했다. 공유가 안 되면 fail-closed로 게임이 계속 차단되므로 현재 후보를 안정적인 완성 구현으로 간주하지 않는다.
2. Node 접근 가능성·초기화 순서·동일 실행 상태의 수명·이전 상태 잔류·초기화 예외를 실제 패키지에서 검수해야 한다. 준비 이벤트가 영원히 오지 않으면 pending이 유지되며 timeout/재시도 정책은 이번 범위에 추가하지 않았다.
3. 실제3333/3347 충돌에서 기존 서버 보존, 실패 페이지 유지, HTTP 탐색0, 정상 성공 시 정확한 패키지 응답SHA·포트·프로필·저장 격리를 확인해야 한다. 현재 NW.js 프로세스 종료/창 종료는 보장하지 않는다.
4. ready 이후 HTTP로 탐색한 다음 발생한 서버 오류·중간 종료·포트 소유권 교체를 되돌려 차단하지는 못한다. 이 후보는 **최초 bind 실패 진입** 범위만 다룬다. 전체 수명 보호나 HTTP 응답 신원 인증 완료가 아니다.

실제 게임/소켓/서버/빌드/인코딩/Git 명령0. 사용자 세이브 접근0. 기존 BUILD 산출·포트 오류 후보·생산 코드·공용 docs 변경0. 최소 diff는 줄번호 없는 후보 hunk이며 Git 적용 가능한 완성 patch로 보고하지 않는다. 총괄이 인수·생산 적용·문서 동기화 및 별도 실환경 검수를 결정한다. 다음 독립 작업을 임의로 시작하지 않는다.
