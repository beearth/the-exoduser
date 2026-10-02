# BUILD packaged-source-delta 인수 결과 — 2026-10-02

현행 소스의 필터 재렌더링 초점 복귀와 유골함 행동 비활성화 초점 회수는 기존 `08cac1ce` Mac 앱에 없다. `node-main.js`와 `package.json`은 현행 소스에서 지정 격리 규칙을 적용한 결과와 일치한다. 이 차이는 새 앱 입력 갱신의 근거이며 이번 과제는 **소스 차이 인수 완료 / 재빌드·실앱 인수 대기**다.

## 수신·소유권·검수 근거

| 항목 | 실제 근거와 한계 |
|---|---|
| 실행 위치 | `/Users/fordeargamers/Projects/exoduser-migration-20261001` |
| 최신 배정 | 총괄 소유 `tools/team-followup-20261002/project-teams/BUILD_TEAM/task.md`를 전체 읽었다. 2026-10-02 사용자 확인 뒤 새 관리 채팅의 독립 소유 산출 한 건 배정이 과거 원세션 전용 규칙을 대체한다 |
| 수신/첫 Read | 총괄 공식 인수표의 현재 작업 턴 시작 `2026-10-02T03:43:32Z`·실제 task cat exit0 확인. 새 관리 채팅 `01a0faaf-9dd5-7c91-ab09-ee0bcff343b0`, 턴 `01a0fab5-c8a6-7113-95d5-39fa109bfc7e`. 명령별 시각은 제공되지 않아 임의 생성하지 않았고 직후 clock `03:43:54Z`는 기록 시각으로 구분 |
| 원담당 중복 확인 | 공식 `read_thread` 최신1턴은 `production-inm-acceptance` completed, 수신 `2026-10-01T18:49:25Z` / 완료 `18:51:03Z`. 이번 과제 신규 수신·진행 증거 없음. `notLoaded` 자체를 종료 근거로 쓰지 않음. 원세션 `01a0f6e6-2e4c-7322-92d7-3aa309857856`, 제목 `BUILD-task.md 실행하기` |
| 현행 HEAD | 본검사 전후 `96610b6546a31e882962470ea1f2164ce94edca6` → 공유 작업 중 최종 `31454dfa49c90bac77351273fc32f0c1eb937928`. 두 HEAD의 비교 대상7 Git blob은 동일. 브랜치 `codex/mac-environment-20261001`. 과거5b8e6ba9/680f22c5로 고정하지 않음 |
| 원격 복구 | 초기 직접조회96610b65 뒤 HEAD 변경을 확인하여 `2026-10-02T03:51:33.386Z–03:51:33.839Z` 재조회 exit0. 정확 `refs/heads/codex/mac-environment-20261001` SHA31454dfa가 현재 HEAD와 일치. 총괄 제공96610b65는 시작 복구 이력. 새 산출3파일의 원격 체크포인트는 아직 없음 |
| 실행 | 지정 Node v24.15.0 전체 경로. checks 구문 검사 exit0, 핵심 비교 `2026-10-02T03:46:10.395Z–03:46:10.828Z` exit0, **22 PASS / 0 FAIL**. 공식 수신/원격 관측 메타데이터 보충 뒤 최신 HEAD에서 같은22검사를 읽기 전용으로 재확인하며 시각은 finalization.latestSourceCheck에 기록한다. 검사 수를44개로 합산하지 않는다. 소스7·앱6개의 작은 파일만 읽었고 대형 에셋·런타임 전수해시/복사/빌드0 |
| 보존 | 생산 핵심7·기존 앱 핵심6·task·사용자 `runtime-acquire-config-draft.json` 전후 SHA 동일. 본검사 짧은 구간에서는 공용 인덱스도 동일했으나 최종 인수까지의 공유 작업 중 인덱스 SHA 변화 관측; 원인/담당 UNKNOWN으로 별도 기록하며 되돌리지 않음. 세이브/프로필 내용 접근0. 백업 한글22항목·사용자 초안 보존 |

기존 앱은 `outputs/mac-package-ready/mac-packager-08cac1ce-21fb-4874-b4df-c136df5ac269/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app/Contents/Resources/app.nw`다. 생성 입력 SHA는 `6be3a06b4e8d03768a35f4c57d419f45c8efeb39`, 기존 allowlist 7,918개다. 이번에는 과거 config/result **메타데이터**를 읽었으며 앱 전체 파일을 새로 검증하지 않았다. 이전 생성 결과의 `runtimeAccepted=false`와 이후 앱 진입/영상/일시정지 관측 이력을 구분한다. 설정·격리 저장→재실행 등 전체 인수는 남아 있다.

## 핵심 입력 계약표

SHA는 앞12자리로 표시하고 전체 SHA/경로/크기/HEAD blob 대조는 `evidence.json.files`에 기록한다. source7개는 모두 현재 원격 일치 HEAD의 실제 Git blob과 동일하다.

| source ID / 한글명 | 적용 위치 | source bytes / SHA | 앱 bytes / SHA | 변환·기능·판정 | 검수·한계 |
|---|---|---|---|---|---|
| PKG-01 / 본편 HTML | `game.html`: `_inventoryFocus`, `renderOssPanel`, `renderInv` | 4,025,302 / `30ae8544524d` | 4,024,167 / `c868284af349` | 필터 key/value identity 보존·새 버튼 초점 복귀, 비활성 유골 해제 행동→`invClose`/내부 잔류 blur가 앱에 없음 | diff -U0 7hunk, +20/-2줄, +1,135바이트. UI 실조작 검사0 |
| PKG-02 / 쉬운판 HTML | `game-easy-test.html`: 본편과 동일한 세 구역 | 3,902,427 / `9c7c25c131f6` | 3,901,292 / `11b4e97b1590` | 위 후속 초점 두 기능이 앱에 없음 | diff -U0 7hunk, +20/-2줄, +1,135바이트. 기본 본편/easy 차이를 통일하지 않음 |
| PKG-03 / 개발 서버 | `server.cjs` | 16,335 / `18cf9aa806d5` | 없음 | 기존 앱 allowlist에 없음. 앱 진입 서버는 `node-main.js` | 예상된 비포함. 개발 서버의 INM/Range/atomicSaveJSON 생산 인수를 재빌드만으로 앱에 전달할 수 없음 |
| PKG-04 / 앱 내장 서버 | `node-main.js` | 10,153 / `01b0c1d51f77` | 10,261 / `f0f922cf4e62` | `PORT3333→3383`, `SAVE_DIR→job/user-state/saves` 두 치환만. 파생 전체 SHA 일치 | 나머지 byte 동일, HTTP/실저장 검수0 |
| PKG-05 / 패널 스크립트 | `ui-panels.js` | 11,883 / `b22c4a311416` | 11,883 / `b22c4a311416` | 원본 복사, byte 동일 | 이전 입력 manifest와 앱 SHA도 동일 |
| PKG-06 / 패키지 설정 | `package.json` | 2,040 / `58d101ca053f` | 1,054 / `f76006616e9c` | 아래 파생 JSON 규칙과 구조적으로 정확 일치 | raw SHA 불일치는 정상 파생. 런타임 의존성 전체 완전성은 미검수 |
| PKG-07 / 로비 | `index.html` | 342,046 / `38f4e0e97ed6` | 342,046 / `38f4e0e97ed6` | 원본 복사, byte 동일 | 이전 입력 manifest와 앱 SHA도 동일 |

### 파생식·슬롯·경로

| ID / 한글명 | 현행 source → 기존 앱의 정확 규칙 | 적용 위치 / 보호 계약 |
|---|---|---|
| DERIVE-01 / 포트 | `const PORT = 3333;` → `const PORT = 3383;` | source는 수정0. 기존 앱 port3383이며 신규 빌드 포트는 아직 지정하지 않음 |
| DERIVE-02 / 서버 저장 슬롯 | `path.join(APPDATA,'EXODUSER-HELL','saves')` → 기존 job의 절대 `user-state/saves` | 저장 스키마·슬롯명 변경0, 사용자 저장 접근0 |
| DERIVE-03 / 로비·허용 원점 | `main=http://127.0.0.1:3383/index.html?demo=1`, `node-remote=[http://127.0.0.1:3383,http://localhost:3383]` | 데모 진입 유지, `node-main=node-main.js` |
| DERIVE-04 / Chromium 프로필 | 기존 chromium-args의 단일 `--user-data-dir=...` 토큰만 job의 절대 `user-state/profile`로 교체 | 보안/그래픽 옵션의 나머지 문자열 보존. 무공백·따옴표/제어문자 없는 경로 제약 유지 |
| DERIVE-05 / 제품·필드 | `product_string=EXODUSER-<UUID>` 추가. `name/version/window` 보존. source의 `private/type/scripts/devDependencies/dependencies`는 파생 manifest 필드 집합에 포함하지 않음 | 실제 packager `derivedPackage`와 앱 JSON 일치. 이 생략을 앱의 기능 누락으로 계산하지 않음 |

두 HTML diff에서 확인한 기능은 현행 `INVENTORY_KEYBOARD_FOCUS_20261002.md`의 필터·유골함 초점 계약과 일치한다. 경제·RNG·보호 전투·저장 공식·원화·CSS의 신규 수정은 없다. 기존 기능 회귀 66/15와 이번 **22개의 입력/변환/보존 검사**는 다른 검사이며 합산해 새 런타임 PASS로 표시하지 않는다.

## 다음 정확한 재빌드 입력 계약 — 실행하지 않은 Gate

| Gate ID | 필요한 입력·수치·공식 | 현재 상태 / 다음 담당 |
|---|---|---|
| RB-01 / source 고정 | 최종 관측 source HEAD31454dfa와 위7개 SHA를 기준으로 후보 작성. 시작96610b65는 검사 이력. 빌드 직전 HEAD 또는 입력이 바뀌면 실제값 재핀 | 핵심7개를 새 HEAD blob과 재대조해 모두 동일. 이번 산출을 포함한 최종 체크포인트는 총괄 담당 |
| RB-02 / 원격 input manifest | 새 `inputs=[{path,sha256}]`와 `backup.inputs` 정확 일치. 실제 입력의 Git blob/복구 SHA, exact remote ref SHA·조회 시각 대조 | 기존7918은 **6be3a06b 당시 목록**. 현행 전체 입력/동적 의존성 재검증0. 과거 config의 실행승인을 그대로 재사용하지 않음 |
| RB-03 / 필요한 HTML 갱신 | 새 후보 inputs/backup.inputs의 본편은 `30ae8544524d7cd710383ebd10f4911bea3247e90b18a46c51c253e73ce9ba3f`, easy는 `9c7c25c131f6175a464cffe2e981e946cf2a0af70ed04b969cc5292403799af8`로 갱신 | 다른 입력이 모두 동일하다는 전수 판정은 하지 않음. server.cjs의 앱 포팅은 별도 소유권/원후보/회귀 인수 과제 |
| RB-04 / 공식 로컬 runtime | NW.js **0.111.2 normal osx arm64**, 고정 nw-builder4.17.10/library SHA 및 로컬 runtime340항목·release JSON SHA 재대조 | 이전 metadata의 release SHA `f5b3855b14e24f99ed9bf271a5896cbfe6b8e0fd14a8cef66609221ecef3a626`. 이번 runtime 재해시/다운로드/설치0 |
| RB-05 / 고유 job·격리 | 새 UUID, 이미 존재하지 않는 job/stage/package, 별도 절대 profile/save. port 정수1024–65535,3333/3340 제외, 실제 점유 확인. 기존 앱3383·두 이전 앱·사용자 데이터 보존 | 새 UUID/port/config 생성0. profile 경로의 공백·단/쌍따옴표·제어문자·DEL 거부 계약 유지 |
| RB-06 / 실행 슬롯 | QA 실제 측정과 대형 복사/빌드/인코딩은 단일 부하 슬롯. root가 빌드 가능한 release를 별도 기록 | 최신 총괄 문서의 QA 유일UI 슬롯 release는 QA 권한이며 BUILD 실행승인이 아니다. 이번 BUILD 서버/HTTP/UI/게임/측정/빌드0 |
| RB-07 / 생성 인수 | 정확 plan/execute 입력·공식runtime·복사 후SHA·고유 산출 manifest 확인. 소스 원격백업과 로컬앱 생성/원격앱 업로드 구분 | 이번 새앱 생성0. 이전 앱 전체전수검증 기록을 현행 앱으로 재명명하지 않음 |
| RB-08 / 실제 앱 품질 | 로비→캐릭터 선택→게임→설정, 필터/유골 해제 실제 초점, 격리 저장 ACK→디스크→종료→재실행→GET/진행 복원, HTTP/HEAD/Range/영상·오디오, 서명·절대경로 이동·배포 | 아직 실제 인수 미완료. source22 PASS·생성·영상 일부 진입이 이 Gate를 대신하지 않음 |

## docs 검색·총괄 동기화안

checks 코드 작성 뒤 `rg -n -e 'packaged-source-delta|INTEGRATION_BUILD_TEAM_MASTER|mac-packager|_inventoryFocus|releaseOssuaryAction|inventoryFilterKey|If-None-Match|atomicSaveJSON|runtime-acquire-config-draft' docs/`를 실행했다. 첫 실행 **45행/27문서**, 검색 원문 SHA와 파일 목록은 evidence에 보존했다. 기존 UI SSOT와 생산 계약이 일치하므로 수치/공식 정정은 필요하지 않다. 이번 상태·계약의 문서 인수는 아래 정확 추가안으로 총괄에 전달한다. 공용 docs 및 보호2_3 문서는 수정0이다.

| 총괄 동기화 대상 | 정확한 추가 내용 |
|---|---|
| `docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md` | “packaged-source-delta: 시작source96610b65의 core7/앱6 SHA·Git blob 대조22 PASS, 최종31454dfa/원격 일치 및 core7 blob 동일. 기존08cac1ce에는 필터·유골 행동 초점 후속 누락. node-main 두 격리치환/package 파생은 일치. server.cjs는 앱 비포함. 새7918입력 확정/빌드/실앱저장 인수는 미완료.”와 본 result/evidence 링크 |
| `docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md` §18 / 팀 활용표 | 새 BUILD_TEAM 관리 채팅의 이번 수신/Read/실행/검수 완료, 원세션 기존completed와 별도. exactHEAD31454dfa·시작96610b65 이력·본인3산출·새빌드0·다음RB Gates. 총괄의 실제 최종 commit/remote SHA를 이후 기록 |
| `docs/13출시·마케팅/PC_PACKAGING_20260910.md` | Windows0.111.2/x64/3333/3347 기존 표를 유지하면서 Mac 후속 인수의 osx/arm64·고유job 파생·raw SHA와 기능 차이 구분 및 RB-01~08 참조를 별도 추가. 포트3383은 기존앱 값이며 새 고정포트로 정의하지 않음 |
| `docs/2_7 인벤토리+장비시스템/INVENTORY_KEYBOARD_FOCUS_20261002.md` | 현행 기능 설계 변경0. 필요 시 패키지 상태만 “source 인수와 기존08cac1ce 앱 포함 여부는 별도; 해당 후속2기능 미포함, 실앱 검수 대기”로 추가 |

## 산출·누적 변경·남은 범위

새 산출은 `checks.mjs`, `evidence.json`, 본 `result.md` **3개**다. task.md는 총괄 원본을 보존한다. checks는 Git/파일/문서 읽기만 수행하고 `--write-evidence`일 때 자기 evidence를 신규 생성한다. 서버/packager 코드를 import하거나 게임 함수를 실행하지 않는다.

Changes 첫 인수23→검사 시작/중간38→첫 최종 검토55→공유 체크포인트 후50은 공유 체크아웃의 다른 담당 산출을 포함한다. 첫 최종 산출 검토는8 PASS/2 FAIL: 파일명 표기 누락은 본 표에 보충했고, 공용 인덱스 변화는 원인/담당 미확정 관측으로 분리했다. 두 번째는9 PASS/1 FAIL: 오래된 HEAD와 최종 HEAD 동일성 조건이 실패하여 새HEAD31454dfa/정확원격 및 core7 blob을 다시 읽고 갱신했다. 이를 생산 결함이나 본인 Git쓰기의 증거로 바꾸지 않는다. 원 실패와 마지막 수·완료 시각·최종 SHA/구문/소유 파일 목록은 `evidence.json.artifactReviewInitial`/`finalization`에 기록한다.80개 미만이어도 다음 원격 체크포인트는 총괄이 본인 code+본 문서3개를 순차 인수하며, BUILD는 Git쓰기0이다.

**발견:** 앱 미포함 HTML 기능2종(양판 공통). **추가 생산 결함:** 이번 입력/파생/보존 범위에서0. **한계:** 앱 전체/현재전체입력/런타임전수/서버·UI·저장·미디어·성능·서명·배포 미검수. 새로운 후속 실행은 생성하지 않고 총괄 인수에 맡긴다.
