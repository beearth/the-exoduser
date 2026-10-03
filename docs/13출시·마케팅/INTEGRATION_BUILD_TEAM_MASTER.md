# 통합·빌드팀 운영 대장

## BUILD MEDIA-RANGE 독립 후보 인계
실제 server.cjs suffix `bytes=-500`, size10000이 원분기0-500/501바이트로 잘못 계산됨을 서버없이 추출VM 대역으로 재현했다. 최소 후보는9500-9999/500바이트, 단일bytes/큰숫자/이상입력과 기존GET 캐시/압축/HEAD Range무시 등23검사 PASS. 원본SHA `339fad6ab51cba92f6ca7a386c8aeb251f68cdb58cdfa55c109f57b1758a42ad`, 생산서버 수정0. HEAD wire/If-Range/미디어 실제원인 인수는 별도다. 후보/원결과/제약은 `tools/team-followup-20261001/BUILD/media-range-result.md` 참조. 서버/listen/포트/API/UI/Git 실행0, root 통합 대기.

## 2026-10-02 최신 통합 Mac 앱 생성 인계
BUILD가 root의 17:09:31.515Z 원격 일치 증거와 로컬 HEAD `6be3a06b4e8d03768a35f4c57d419f45c8efeb39`의 정확7918입력을 대조했다. 직접 원격조회는 DNS 실패이며 root 제공 증거와 구분했다. QA 완료 snapshot/새실측없음 승인 뒤 17:14:19.752Z~17:15:36.564Z 새 job `08cac1ce-21fb-4874-b4df-c136df5ac269`에서 arm64 앱1개 생성. 출력 `outputs/mac-package-ready/mac-packager-08cac1ce-21fb-4874-b4df-c136df5ac269/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app`, loopback3383·고유 profile/save, 기존 두앱 핵심14파일 전후SHA 동일. 앱실행0·runtime/설정/저장/재실행/미디어/서명/배포 미인수. 입력·산출 목록/핵심SHA/한계는 `tools/team-followup-20261001/BUILD/integrated-mac-build-result.md` 및 전용 JSON을 따른다. 소스 원격백업과 로컬앱 생성은 별도다.

작성/갱신: 2026-10-01 KST. 총괄 작업 [PM-002](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md), [팀 시작 규칙](../0마스터플랜/TEAM_START_COMMANDS_20261001.md), [PC 패키징 계약](PC_PACKAGING_20260910.md)을 따른다.

## 책임과 경계

2026-10-01 사용자 추가 지시: **게임 빌드 안전 최우선, GitHub 백업 상시 유지.** [백업 규칙](BUILD_BACKUP_POLICY_20261001.md)에 따라 빌드 입력의 원격 ref·SHA와 기존 정상 실행본 보존 위치를 확인한 뒤 새 출력에서 빌드·검수한다. 아직 원격에 보존되지 않은 입력을 백업 완료로 표시하지 않는다.

총괄 인계: 01:06 KST WIP 복구 스냅샷 `codex/backup-20261001-010620` / `113043e3aaeff4bffd0010ac25946de68c4b5061`은 GitHub 원격 SHA 확인 완료. 실제 빌드 직전 입력이 이 스냅샷 이후 변경됐다면 추가 체크포인트가 필요하다. 기존 정상 패키지는 유지한다.

| 역할 | 담당 범위 | 인수·검수 기준 |
|---|---|---|
| 변경 범위·공통 계약 | Git HEAD·미커밋 변경, 공용 함수·저장 계약, 팀 간 충돌 기록 | 다른 팀 diff를 되돌리거나 일괄 커밋하지 않음 |
| 에셋·의존성·패키징 | 코드·이미지·음향·vendor 포함, NW.js 0.111.2 Windows x64 | `build-nwjs.mjs`의 실제 복사 목록·누락 경고·출력 파일 확인 |
| 실제 패키지 실행 검수 | 로비→캐릭터 선택→게임→설정→저장→재실행 | 검수 전용 프로필과 저장 공간, 실제 EXE·화면·데이터 근거 기록 |

## PM-002 진행 기록

| 항목 | 현재 근거와 상태 |
|---|---|
| 시작 소스 | 최초 조회 `main` HEAD `280a83218`; 조사 중 HEAD가 `b76ff88067f88699c9faaac7b215a3887b80dc52`까지 변경됨. 여러 팀의 `game.html`, `game-easy-test.html`, UI·맵·문서 등 변경이 계속 유입 중. 빌드 전후 범위를 별도 기록할 것 |
| 기존 실행 후보 | `out/EXODUSER-win64/package.nw`와 `out/EXODUSER-latest-20260929-215218/package.nw` 확인. 전자는 2026-09-29 오전 파일, 후자는 별도 3341 포트 사본. 현재 실행 프로세스·사용자 실제 선택 경로는 아직 미확정 |
| 삭제·덮어쓰기 위험 | 기본 빌드가 `dist/`와 `out/EXODUSER-win64/`를 지우고, 잠긴 출력은 `package.nw`를 교체함. `./userdata`와 기존 배포본 보존이 우선 |
| 안전한 로컬 빌드 | `build-nwjs.mjs --integration-id=YYYYMMDD-HHMMSS`를 추가. 신설 `dist-integration-ID/`와 `out/EXODUSER-integration-ID/`만 사용하며 이미 있는 경로는 거부. 패키지 복사본은 3347 포트·고유 Chromium 프로필·고유 APPDATA 저장 폴더를 사용. 기본 빌드 계약은 유지 |
| 포트 충돌 발견 | 3333은 기존 PID 31424가 점유. 일반 패키지 EXE 화면은 기존 서버를 표시할 수 있으므로 검수용 복사본은 3347 응답 파일의 패키지 해시 일치를 먼저 확인 |
| 소스·기존본 차이 | 기존 일반 패키지의 `game.html`·`game-easy-test.html`·`index.html`·`ui-refinement.css` SHA-256이 현재 소스와 다름. 기존 패키지는 현행 `game.html`에서 참조하는 `ch1-forest-sway.js`·`ch1-face-life.js`가 없음 |
| 선택적 소스 누락 | `credits.html`, `output/imagegen/forge-tabs-v3`는 소스 자체에 없음. 현 빌더는 누락 경고 후 계속 진행하며, 현재 핵심 게임 참조 여부를 따로 확인 |
| 소스·산출물 증거 | `tools/integration-build-record.mjs`를 신설. 빌드 전후 HEAD·Git 상태·diff·주요 파일 SHA-256·복사 입력 파일의 크기/수정시각 목록 해시와 완성 `package.nw` 트리·자산 분류·EXE·코덱 SHA-256을 남김 |
| QA·성능 조율 | 사용자 답변으로 PM-001 프레임 실측 진행 중 확인. 복사·NW.js 빌드 시작 보류. 2026-10-01 00:36 KST의 `20261001-003700-before.json`은 빌드 시작 증거가 아닌 사전 점검 스냅샷이며, 실측 종료 후 새 ID로 빌드 직전/직후 다시 기록 |
| 구현 단계 | 독립 출력 옵션 구문 검사 완료. 패키지 생성·실행 검수와 해시 기록은 진행 중 |

## 산출물 기록 양식

| 대상/버전 | 실행 경로 | 소스 HEAD·추가 변경(빌드 전후) | 생성 시각 KST | SHA-256 | 실제 검수 | 업로드·배포 | 미해결 |
|---|---|---|---|---|---|---|---|
| PM-002 로컬 통합 | 생성 후 기입 | 생성 후 기입 | 생성 후 기입 | 생성 후 기입 | 로비·선택·게임·설정·저장/재실행 | 범위 밖 | 생성 후 기입 |

## 공통 계약·인계

| ID / 위치 | 확인된 영향 | 담당·처리 |
|---|---|---|
| INT-001 `game.html` 64–65행 → `ch1-forest-sway.js`, `ch1-face-life.js` | 기존 일반 `package.nw`에는 두 스크립트가 없어 현행 CH1 생동감 코드를 검수할 수 없음 | 맵팀 변경은 보존. 통합 빌드 `FILES` 포함과 실제 산출물 존재·로드 확인 |
| INT-002 `package.json` 진입점/프로필 ↔ `node-main.js` 포트·`SAVE_DIR` | 3333 개발 서버가 이미 점유하여 새 EXE가 다른 콘텐츠를 표시할 수 있고, 기본 서버 저장은 기존 사용자 데이터와 공유 | 통합 빌드의 **복사본만** 3347·고유 프로필·고유 저장 폴더로 격리. 실제 3347 응답 SHA로 검증 |
| INT-003 공용 `game.html`·`game-easy-test.html`·UI·맵 작업 | 동시 편집으로 HEAD와 미커밋 상태가 조사 중 여러 차례 변경됨. 단일 커밋 표기는 부정확 | 각 팀 변경은 편집하지 않음. 빌드 직전·직후 스냅샷과 산출물 트리 SHA를 총괄에 전달 |
| INT-004 `assets/unique-items/`, CH1 제작 파일 | 이전 일반 패키지에서 현재 소스의 자산 파일 42개가 없음. 신규 원화 26개·CH1 충돌 이미지 8개·바닥 1개·제작 소스 7개. 현재 HTML 정적 참조 결손은 INT-001의 두 스크립트 | 신규 자산은 실제 통합 빌드의 `assets/` 복사와 개수/해시 확인. 아이템 구현 완료로 확대 해석하지 않음 |

## 인계 원칙

공용 코드 충돌은 파일 전체가 아닌 함수·데이터·호출 지점과 영향 범위를 적어 담당 팀과 총괄에 전달한다. 테스트 PASS, 실제 패키지 화면, 저장 복원, 외부 전달은 각각 별도 단계로 기록한다. 단일 HEAD만으로 미커밋 변경을 포함한 산출물을 설명하지 않는다.


### 2026-10-01 Mac UI03 병행 후속 인수

기존 70f84406 세션에서 FILES·script/link·UI 캐시 상호 비교·입력SHA·Windows 패키지/3340 개발 격리 정적 도구 후보를 제출했다. 실제 읽기·산출 완료이며 코드 적용/게임 실행/패키지/실측 완료가 아니다. 원문 후보 및 정정은 [팀 산출](../0마스터플랜/mac-resume-20261001/ui03-evidence/BUILD-팀검토.md), 실제 수신/착수/다음 게이트는 [11팀 인수표](../0마스터플랜/mac-resume-20261001/11팀-UI03-병행후속.md)를 따른다.


### 2026-10-01 MAP020 병행 후보 실행 인수

실제정적도구25PASS2WARN0FAIL. 수정후입력SHA재수집. Windows패키지미실행. 기존CLI는읽기검토,지원에이전트와root가실제파일작성/실행했다. [실행근거·제약·다음게이트](../0마스터플랜/mac-resume-20261001/11팀-MAP020-실행검수.md). 이전UI03후보미실행상태는당시이력이다.


### 2026-10-01 R 입력·GL·11팀 신규 후속 인수

새 build-assets.py로 assets/unique-items44 + assets/map/ch1 907 + ch1-* FILES6 =957파일, 2,078,759,459바이트 SHA를 읽었다. LFS 포인터3개로 exit1/3FAIL을 보존한다. 제작 원본2개(CH1_1_PRODUCTION_MASTER.png, outer90_sources/outer90_patch.png)·출처zip1개(outer76_81-provenance.zip)이며 직접 참조 조사상 런타임 필수 누락 근거는 찾지 못했다. 실제 패키지 생성/로드/화면은 미검수이며 무영향을 단정하지 않는다. [관측 원자료·진단 범위·한계](../0마스터플랜/mac-resume-20261001/R-입력과-GL-후속검수.md)

### 2026-10-02 Mac preflight 인수와 packager 후보

root가 read-only preflight28검사를 재실행해 통과했다. 최신 확인 원격98aedab7·명시 ref·조회시각을 넣은 실제 입력 검사는 복구/입력/고유출력 통과, MAC_RUNTIME_MISSING으로 BLOCKED다. 기존 build-nwjs는 win/x64 고정. 설치 nw-builder의 osx/실제arch·로컬runtime·고유출력·세이브 제외·다운로드 차단을 실제 packager 인자까지 연결하는 후보를 기존 BUILD에 배정해 Read/Edit 확인했다. 실제 .app 생성/실행/다운로드0, 전체에셋/서명/코덱/저장패키지 검수 미완료. [인수 기록](../0마스터플랜/mac-resume-20261001/vscode-dispatch/FOUR-SUBMISSIONS-HELLRAY-20261002.md).


### 2026-10-02 Mac arm64 첫 실제 패키지 준비

공식 NW.js0.111.2 arm64 runtime SHA를 재사용한다. ae230e74 원격에 보존된 입력 중 제작용 LFS 포인터/ZIP 정확7경로만 제외한7918개 allowlist를 검수했다. 원본은 유지한다. 유한 맵/투사체524참조와 직접 script/style139 검수, 임의 동적 외부 호출 전체는 UNKNOWN이다. 고유 job59376baf-37c9-4c20-a42f-af67b8d9221a, loopback3381, job내 profile/save 경로 파생. 사용자3340게임/세이브 보존. mac-packager34검사 및 정식plan은 실행과 별도 기록한다. 해당 출력만 .gitignore에 추가하고 필수 에셋 원본은 숨기지 않는다. 다음 단계는 actual execute 및 앱/격리저장 검수이며 이 준비 기록은 완료 선언이 아니다. 상세 outputs/team-review-20261002/mac-app/build-config.json, build-plan.json 및 BUILD/package-input-resolution-result.md.

### 2026-10-02 Mac 프로필 인자 실물 결함 수정

첫 .app 생성 후 NSAlert 대기/3381 미개방이 발생했다. 생성 manifest의 무공백 절대 user-data-dir에서 literal double quote만 제거하고 기존 본인 테스트 프로세스 종료 후 네이티브 로비·profile 생성·서버 listen을 확인했다. 경고 본문 자체는 UNKNOWN. packager는 같은 경로를 무인용 토큰으로 생성하고 공백/단·쌍따옴표/제어문자/DEL 경로를 명시 거부한다. 원 보안 args·서명·quarantine·사용자 세이브 변경0. root 43회귀 PASS. 상세 실물 검수와 남은 항목은 MAC-APP-RUNTIME-20261002.md 및 outputs/team-review-20261002/mac-app/의 기록을 따른다. 이 시점은 실행 시작 해결이며 출시·게임 전체 인수 선언이 아니다.

후속 실물 빌드: 원격179813c2 수정 빌더로 abf57f41 고유앱/3382 생성·7918입력 및 출력SHA검사 완료. 아직 새앱 실행 전. 첫 앱의 게임 도입 장면 확인 뒤 Mac 잠금이 발생해 설정/저장/재실행은 사용자 잠금 해제 대기다. 소스백업/생성/실제런타임인수를 구분한다.


### 2026-10-02 캐릭터 미디어 진단 완료 정정

공식 기존 BUILD turn의 실제 완료는 2026-10-01T16:49:38Z다. 16:48:30Z의 interrupted는 중간 조회 이력이며 현재 작업 중단으로 유지하지 않는다. scene/idle/성공 비교영상2개의 원본·7918입력 manifest·두 생성앱 SHA 일치와 헤더 차이를 인수했다. root는 4파일×2앱/manifest 증거의 일관성을 대조했다. 실제 media.error 소유 요소·decode 지원·HEAD/Range 응답은 미확정이고 앱 실행/저장/재실행은 잠금으로 미완료다. 새 미디어 변환·앱 빌드/실행은 이번 소스 통합 중 수행하지 않았다. 결과: tools/team-followup-20261001/BUILD/mac-character-media-result.md.


### 2026-10-02 최신 앱 Root 전수 파일 검증

08cac1ce 앱의 8,258개 항목·일반파일 7,043,792,984바이트를 17:16:44.333–17:16:49.284Z에 독립 검증했다. 입력·핵심 파일·공식 주 실행파일 SHA 일치, 모든 링크가 앱 내부다. Root 원격 조회 17:14:40.072Z는 소스 6be3a06b와 정확히 일치한다. BUILD 직접 조회 DNS 실패와 구분한다. 앱은 실행하지 않았으며 로비·저장·재실행·미디어·서명·배포 인수는 미완료, 로컬 앱의 GitHub 업로드는 없다. 근거: `outputs/team-review-20261002/post-integration/app-verification.txt` 및 전체 manifest.


### 2026-10-02 서버 합본 생산 반영 인수

BUILD suffix 처리와 BALANCE 임시파일 교체 후보를 root가 server.cjs에 순차 적용했다. 원소스339fad6a→합본6a7c1083, 실제 생산 Range23+저장13+전체handler4=40그룹 PASS. 기존 실패 RED/원본과 담당20파일 SHA 보존. 저장 스키마/반환 JSON/GET 캐시·gzip 계약 유지. 실제 디스크·크래시·fsync·HTTP·영상 원인·앱 재실행은 미검수, 기존 EPERM 우회0. 상세: [서버 통합 인수](../0마스터플랜/mac-resume-20261001/vscode-dispatch/SERVER-INTEGRATION-20261002.md). 앞선 미적용 후보 기록은 제출 당시 이력이다.


### 2026-10-02 조건부 Range 및 실제 합성 파일 I/O 인수
root가 정확단일INM304 우선·If-Range 전체응답 후보를 server.cjs에 반영했다. 현재 조건부31+이전소스40+전용 합성 실제파일7=78그룹 PASS, 완료 owner24파일 보존. INM weak/list/wildcard·IMS·ETag 강도·HEAD wire·실HTTP·미디어·앱 재실행은 미검수다. 파일 검수의 write/rename EIO는 주입, ENOENT/EEXIST는 실제OS이며 크래시/fsync/Windows 검수와 다르다. 기존 EPERM을 우회하지 않았다. [인수](../0마스터플랜/mac-resume-20261001/vscode-dispatch/CONDITIONAL-ATOMIC-INTEGRATION-20261002.md).

### 2026-10-02 INM weak/list/wildcard 생산 인수

matchesIfNoneMatch helper와 조건식1곳만 반영했다. exact 후보 byte 일치 및 현재 생산 INM40+조건부Range31+저장13=84그룹 PASS. If-Range 전부 전체응답·HTML정책·gzip·HEAD·atomicSaveJSON/저장경계 유지. RFC9110 §13.1.2의 약한 비교·별표·목록을 따르되 malformed전체무시/빈member32개 정책을 기록했다. validator강도·실HTTP·HEAD wire는 미검수, 서버 재시작0. UIUX 후보34는 반영 전 통과이며 별도 순차 통합한다. docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FOUR-CANDIDATE-ACCEPTANCE-20261002.md 참조.

2026-10-02 BUILD 후속 완료: 승인 후보와 현행 server.cjs byte 일치, 실제 정적 분기 추출 독립13 PASS를 root가 하니스·증거로 검토했다. root84와 구분하며 추가 생산 수정0, 실제 HTTP/UI 미검수. 근거 production-inm-acceptance-result.md 및 build-owner-final.json.

### 2026-10-02 NW.js 공유 악의 POST 오류 응답 생산 보강

| 대상 / Gate | 현재 상태·근거 |
|---|---|
| `node-main.js` POST `/api/mats` | 요청 본문 읽기·JSON 해석·clamp·직접 파일 쓰기 예외를 HTTP500 JSON `{ok:false,error:'Internal Server Error'}`로 끝낸다. `Content-Type:application/json`·CORS `*`, 정상 쓰기 완료 후 기존 HTTP200 `{ok:true,mats:n}` 유지. 성공 응답 전송은 catch 밖에 두며 다른 route·서버·저장 정책 변경0 |
| 최소 회귀 | `test/nodeMainMats.test.js`의 실제 전체 handler VM에서 정상 저장/조회/슬롯분리/음수 clamp, malformed JSON, stream rejection, 실제 absent-parent ENOENT 총4검사. 원본1PASS/3FAIL → 완료4PASS/0FAIL, headers/end 각1회. Node v24.15.0 구문 검사 PASS. 기존14/18/19·BUILD22 재실행0 |
| 보존 / source ID | 원본 node-main SHA `01b0c1d51f77f500ee0a59185458bf0294edce12544482d6cf7abce4262c91ce` → 완료 `541ff8e6f57db862ddbb1b148ee37a3a8e0da1e16293bc8343a0bc4144d80daf`. 원본4파일·RED/GREEN 로그는 `tmp/mac-migration-runtime/continued-review-20261002/node-main-backup/`에 보존. scoped commit/원격 checkpoint는 총괄이 별도 수행 |
| 기존 앱 / manifest | codex-half/BUILD의 ACC-04 source pin은 수정 전 SHA이며 현재 source가 달라졌다. 선행 manifest의 `PIN_MATCHES_PRIOR_EVIDENCE`는 그 검수 당시 이력이다. 기존08cac1ce 앱 archive node-main SHA `f0f922cf4e62dd9f30282ebd37b6ef0c258f2864416e89ab125a6631fd8654c1`에 이번 오류 응답 보강은 반영되지 않았다. 기존 앱·manifest 원문을 수정하거나 재빌드하지 않았다 |
| 미검수 | 성공 저장은 메모리 fs, 실제 OS 검수는 ENOENT 파일 열기 실패만이다. 실제 HTTP/socket·NW.js 앱·저장→종료→재시작·Windows·fsync/crash/concurrency·서명/배포 미검수. 원자쓰기 후보·cleanup 정책 채택0, 새 서버/게임/빌드/삭제0 |

응답 계약의 상세 정본은 [저장 SSOT의 최신 보강](../15%20세이브+데이터구조/15%20세이브+데이터구조.md#2026-10-02-nwjs-공유-악의-post-실패-응답-생산-보강)이다. 개발 `server.cjs`는 기존 text/plain 500을 유지하므로 NW.js JSON 응답과 wire 형식이 같다고 기록하지 않는다. source 회귀 PASS를 실앱/패키지 품질 인수로 집계하지 않는다.

### 2026-10-02 Mac helper 출력 payload SHA 보존 검증

Mac 패키저 `tools/team-followup-20261001/BUILD/mac-packager/packager.mjs`의 `verifyOutput` helper 검증 접점 1곳에 원 runtime pin과 rename 출력 payload SHA-256 대조를 적용했다. 전문팀 GPU helper 1바이트 반례의 미적용 후보 기록은 제출 당시 이력이다. 이번 인수는 패키저 소스 경계이며 실제 앱 재빌드·실행·Mach-O·서명 인수는 수행하지 않았다.

| 대상 / 계약 | 현재 소스와 검수 범위 |
|---|---|
| helper 4종 | suffix `''`, `' (Alerts)'`, `' (GPU)'`, `' (Renderer)'`. 원 `nwjs Helper{suffix}` 실행 파일의 `proposal.runtimeFiles` pin을 `proposal.args.app.name+' Helper'+suffix`로 이름이 바뀐 출력 실행 payload와 비교. Chromium 경로는 `proposal.args.releaseInfo.components.chromium`을 사용. Plugin 추가 0 |
| 순서 / 오류 | 출력 helper를 기존처럼 1회 읽어 length>0 검사 → 원 경로 pin 존재와 `/^[a-f0-9]{64}$/` 검사 → payload SHA 일치 → 기존 `CFBundleExecutable` rename 검사. pin 누락/무효는 `MAC_HELPER_PIN_MISSING_OR_INVALID`, 불일치는 `MAC_HELPER_SHA_MISMATCH:nwjs Helper{suffix}`. 빈 payload·plist 오류 계약 유지 |
| 보존 | 본체 원 pin SHA/실행명 plist, 파생 package/server, 입력 SHA loop, `safeAncestors/readFile`, plan/execute 원문 동일. 정상 fixture의 return·전체 파일 읽기/descriptor trace는 옛 verifier와 동일. `inputs=[]`로 packaged-input loop 동적검수 0; 보존은 접점 밖 byte 동일 근거 |
| 새 검수 | 실제 소스 5함수 추출+설치 plist parser+메모리 fs/payload: baseline 30개 17 PASS·13 FAIL → 반영본 30/30 PASS. 네 helper 각각 1바이트 변형·누락 pin·무효 pin·빈 payload·잘못된 실행명 plist, 정상/경로/descriptor 경계 포함. 모듈 구문 검사 1회 PASS. 기존 전문팀·대형 전수·게임 검수 재실행 0 |
| source ID / 영수증 | packager `1975f899fe62559b96674a811604fb24cee873cd1e1b6da170814a1ffa0e7f0c` → `289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65`; old fragment 125 → 666 bytes, +541 bytes, 접점 밖 원문 동일. `tmp/mac-migration-runtime/continued-review-20261002/build-helper-backup/receipt.json` SHA `11d5519d2992a099e7df7d3478e6fecfcf1b16385e12dd7a63c0429859483f46` |
| 한계 / 후속 Gate | pin 일치는 opaque 비 Mach-O payload도 인수한다. 실 runtime/app 재관측·파일 생성·앱 실행·서명·배포 0. 기존 close 실패는 close 1시도/descriptor 1잔류 대역으로 그대로 전달하며 모두 닫힘을 보장하지 않는다. 소스+docs 원격 checkpoint는 총괄 별도; 새 빌드와 native QA는 별도 |

정확한 helper 경로·pin 기준·30개 검사 분류와 미검수 항목은 [Mac helper payload 무결성 인수](MAC_HELPER_PAYLOAD_INTEGRITY_20261002.md)를 따른다. 과거 앱 생성·8,258항목 및 7,918입력 검수·historical runtime pin은 해당 시점 증거로 보존하며 이번에 다시 관측한 실물 검수로 집계하지 않는다.

## 2026-10-02 확정3수정 포함 최신 실제 Mac 후보

생성 당시 실제앱 b3f52d84-90e5-4eca-ac38-bc2a874a0f43은 source checkpoint7ccb72c0의SOUND/ITEM/캐릭터입장취소 세 수정을모두포함한다. fresh execute1·내부verify1 exit0, main ce171131…/easy8c7d8208…/index1dd28cab… 실앱사본동일·7918입력/340runtime exact·8253regular+5symlink/7043802009B. 고유port3385·절대profile/save·bundleID를확인했고현재user-state미생성. 기존c927 dd333 snapshot·user23·기존앱/세이브보존, download/install/서명/기동0. 실제native·CH1-1 연결6단계/화면/청취/저장인수는미완료이며Mac잠금해제질문은이미남겨두었다. 소스freeze는사본확인후해제하며팀별독립후속작업과감독종료복구는계속한다.

[새 실제 후보·정확SHA·기동/검수Gate](MAC_CH1_LATEST3_CANDIDATE_20261002.md)는 당시 앱 기준이다. 이전c927/runtime/partialfixture보고서는그시점snapshot으로보존하며source/모델PASS를제품/nativePASS로확대하지않는다. 관련docs전체rg1회47행/15문서분류를근거로현재Master/build/runtime정본·root기록과새보고서를동기화했다.


### 2026-10-02 최신 source4 Mac 후보 생성

97bb3ef9-fff2-4761-9841-e5a24a953847 앱은 codeca7e0bb0/원격backup e764ed33의 네sourcefix를포함한다. main e462f234…/easy68fa8e17…/index1dd28cab… 원문·stage·실앱동일, inputs7918/비파생7916/runtime334+메타6 exact. freshplan1/execute1 exit0/내부verify1/readinventory1, 별도verifier/재빌드0. regular8253+symlink5/7043803133B, 고유port3386/profile-save. 기존앱·user23·원자료·cache보존. 최종receipt743842ae…/20421B, configcdf9ba83…/3428980B. sourcefreeze는사본생성완료로해제한다. 생성 당시 실제앱기동/6단계플레이/visual/청취/영속save는0이었다. 후속source4 정상입장·실습·필드부분관측은별도보고이며연결6단계목표는미완료다. [source4 생성 당시 후보 계약](MAC_CH1_SOURCE4_CANDIDATE_20261002.md). 함께보존한BOSS철회/BALANCEGPnav원자료2는제품적용0이며readiness dee37149… exact2다. 감독단일오더전담/총괄생산·검수·Git 역할을유지한다.


## 2026-10-03 source6 최신 물리 시험 앱 생성

공식 새 job `3dd1813f-7e53-4987-acb4-03df340810a5`/port3387에 production source6(main4028973B/1e4591ca…·easy3906420B/17f490d5…·index342119B/1dd28cab…)를 고정했다. freshplan1→actualexecute1/내부verify1 exit0, 실제 source3 원문·stage·app exact, main/helper4 실행비트·arm64·plist 확인. regular8253+symlink5/7043803267B, 신규profile/save는 고유job 절대경로이며 user-state 미생성. 새download/install/sign/GUI기동/서버기동0, 기존97bb core5/own악의save31B·config/cache/사용자게임-save 보존. final receipt2842B/SHA297e8d1a254da30e5032dcf58648474c5c7cb5d734caf1a4585d22ec86f4852b는 ignored ch1-source6-build 경로에 있다.

패키지생성은 native6 완료가 아니다. Mac 잠금/기존해제질문 대기이며 정상전투·획득/장착·게이트·보스사망/부활·기존필드와열린보스방보존·재도전·실청취·player-save재시작·전체8카메라 미검수. 고정 source4 정상필드 부분관측을 새앱 검수로 확대0. 양판 스냅샷을 확보해 포장용 source freeze 해제. 실제 source와 runtime계약/정확fullSHA는 `docs/13출시·마케팅/MAC_CH1_SOURCE6_CANDIDATE_20261003.md`를 따른다.

## 2026-10-03 source8 최신 Mac 물리 포장·정상 도입 기동

| 현재 결과 | 정확 범위 | 인수 경계 |
|---|---|---|
| 새 source8 앱 | source/원격 `2e3edc320fa38562c0d65b52cdec825b63981a40`, job `96bf549c-5f0e-445b-84b4-a2a461a0747b` /3388. main4029496/easy3906763/index342119 원문·stage·app3 exact | default execute1/internal verify1, 입력7918/runtime340, regular8253+link5/7043804133B. PACKAGED_NOT_RUNTIME_ACCEPTED; extra7918 SHA0/재빌드0/download·install·sign0 |
| 보존·격리 | source4/source6 core/config/ownMats 포함15 pin exact, source6 ownMats33B 유지. 새 고유 절대profile/save/bundleID·loopback3388 | 19:00 물리검증과19:03:42 정상 Quit 뒤 새 user-state 부재; launch후 격리 상태 생성과 시점 분리. 포장 freeze 해제; source변경0 |
| 실제 native 부분 | source6 첫 Quit 뒤 getAX 관측 시 새 Renderer6276/3387 로비 재관측(내부 재기동 이유·인과 미확정), 두 번째 정상 Quit 후 old88947 gone·3387 noListener·protected15 exact. source8 exact앱 정상기동1, Renderer7154/3388 LISTEN·GETslots ok empty, 정상 entry/audio title/anykey→월드인트로(root 전달) | 실제 청취0/보스방·사망·부활·재도전·장착·player저장재실행·8카메라0; native6/제품완료0 |

source6 부활버튼 입력 반영 미확인과 coordinate noWindowsAvailable의 원인은 UNKNOWN이며 정적 버튼 결함으로 확정하지 않는다. 메뉴 열림은 실제 확인됐고 옛18:25 Maclocked 관측과 현재 원인을 구분한다. 기존 unlock 질문 재질문0. source7 기존17/17·source8 기존22/22 검수근거 재사용/이번재실행0; 원자료·구보고서·과거앱 관측을 새제품 건수로 합산0. [정확full64·파생node/package·실물/초기native 증거](MAC_CH1_SOURCE8_CANDIDATE_20261003.md).

- Claude3 기존 실제작업 확인과 idle4 원총괄 구체목표 확정을 구분하며, 정식 과제 전달과 actualsource 확인을 따로 기록한다.
- idle4의 기존 BOSS summon finally70f /ENEMY+ANIM 표시전용 wind timer·helper /MAP 로드실패1회 재시도는 메모리후보·production 미적용/신규file credit0이다.
- ART localhuman·기존3 deny 목적hold·우회0/역할18 유지. root예약 docs6만 소비: root제공 actual71→예상77/rootremaining0/worst85 basis, 소비중복0. 기존5 backup/EOL·prefix byte보존 append, WIP67·Git/index·GUI·shared STATE/LOG 쓰기0; 소스+docs 원격확인은 root 별도.

## 2026-10-03 source8 후속 정상 캐릭터·전사 이야기 부분 관측

root의 후속 실제 입력에서 월드 인트로 자연종료→DEMO 환영/입장→정상 전사 선택→이름 `맥검수8` 생성 UI→전사 이야기의 실제 자막·영상 재생을 관측했다. 개별 char-preview AX의 `미디어를 재생할 수 없습니다.`와 전사 story 영상의 실제 재생을 구분하며 전체 codec 불가로 확대하지 않는다. `02-warrior-story.png`는 589090B/SHA `6d2922a79c7a12256d94c7e853805ed21e22e1a50b133431358ddeaaf206604a`이며 ignored `tmp/mac-migration-runtime/continued-review-20261003/source8-native-play/`에 있다.

이야기 다음 버튼50이 자연 전환 중 사라져 stale 오류1이 발생했고 root가 새 AX를 취득해 정정했다. 게임 코드 오류 확정0이며 이야기 A 단축키1 뒤 AX 변화0, 그 이후 입장은 아직 인수하지 않았다. 실제 음향 청취0/보스방·사망·부활·재도전·장착·player 저장재실행·8카메라0/연결6단계 미완을 유지한다. 포장 상태 **PACKAGED_NOT_RUNTIME_ACCEPTED**와 [정확 물리·부분 native 보고](MAC_CH1_SOURCE8_CANDIDATE_20261003.md)를 유지하며 이 후속 관측은 문서 담당의 새 GUI 검사가 아니다. root예약6 범위·71→77예상/rootremaining0/worst85 basis는 변하지 않는다.


## 2026-10-03 source15 최신 Mac 패키지 — 실제 플레이 미인수

최신 제작본은 job `a1488887-2fbf-48e0-b006-7b28b4c19976` / 격리3391 / source `050a227600116f13d8cd4443ef342ea270e321c4`다. 이전 dated source4/source8/source11 앱·지문·부분 native 기록은 당시의 보존 이력이며, 최신 **포장** pointer는 [source15 정확 계약](MAC_CH1_SOURCE15_CANDIDATE_20261003.md)이다. 최근 실제 플레이 관측은 source11/3390 보고에 남아 있다.

| 항목 | 이번 실제 결과 |
|---|---|
| 제작 | UTC2026-10-02T23:08:05.173Z, 신규 plan1/execute1, PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 입력/런타임 | 기존7918 selector와 공식 cached0.111.2 arm64/runtime340 재사용; 새 source15 main/Easy·index의 source=stage=app3 exact |
| 실물 | 비파생7916/파생 node-main·package/실행파일+helper4 검증; 후속 물리 영수증19113B·SHA bb51f0e1cad3e7755dd0916fb6848a601ab7c94ae4b9c7394c017062b5cad180 |
| 제작 보존 | ignored 사본에서 시작 output 삭제·실패 job 삭제만 제거·빈 고유소유 output 검사; 공유 builder 불변/삭제0 |
| Native | Maclocked AX 읽기 UTC23:10:05/input0·새 앱 기동0·새 profile/save 미생성. source11 앱/save 보존, 보스방·사망·부활·재도전 등 연결 검수 미완 |
| 문서/Git | docs전체554행/47문서 검색·날짜별 역사 보존, own6만 동기화/타인67와 감독 STATE/LOG4 보존; 완료 own6만 원격 checkpoint |

source15 생산 장비 해제 검증48/48은 기존 실제 코드 결과이며 이번 제작 때 재실행0이다. 최신 패키지 생성과 전문7팀의 새 코드 조사 착수를 게임 연결 완료로 계산하지 않는다. Mac 잠금 질문은 기존 질문을 유지한다.

## 2026-10-03 source16 현행 Mac 패키지 — 실물 확인, 플레이 미인수

현행 포장본은 장비 원자적 자원 갱신을 포함한 source `8883c59cb18e4c1bd3ad5cb83911fbe07242df12`, job `00072ed5-e133-4c61-9c39-59dd6271c0d5`, 격리 포트3392다. 앞선 날짜별 source15/3391·source11/3390 기록은 해당 버전의 보존 이력이다. 현행 생산 코드와 포장본은 이 시점 source16이며, source17 천공쇄기 메모리 후보는 포함하지 않는다.

| 항목 | 실제 확인 |
|---|---|
| 제작 | UTC2026-10-02T23:49:39.066Z, execute1·내부 plan1, 별도 plan/재빌드0. PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 사본 | 입력7918 중 비파생 payload7916의 새 stage/app 각1회 SHA·경로 검수 PASS. main/Easy/index 원본=stage=app3 exact |
| 파생·실행 | node-main·package 파생2 exact, node-main 전체 역치환으로 원본 복원. arm64 MachO 실행 파일5 SHA·0755·plist ID exact. 기존 공식 cached NW.js0.111.2/arm64/runtime340 재사용 |
| 증거 | physical-receipt.json 21238B·SHA c6787f69c3caee2730a29258e344fa39098baf92f08d022427881ad006690f97; 옛7918 inventory·옛검사·추가 build/API 재실행0 |
| 보존 | 고유 owner UUID/dev-ino 유지·cleanup/delete0. source11/15 기존 앱 존재·plist ID 확인. 사용자 이전59376baf/08cac1ce 앱은 정확 경로 미확보로 보존 확인 UNKNOWN, 변경0 |
| 실제 플레이 | source15 정상 새전사→CH1 LV1/지역0/32→보스방 이전 일반 필드0처치 사망은 별도 부분 이력. 이후 Maclocked 관측으로 부활 입력0. 새 source16 앱 기동/GUI/native0·새 profile/save 미생성 |
| 남은 인수 | 새 앱의 전투·획득·장착·4지역 정화·보스방 개방·보스 사망/부활/재도전·실저장·시각/청취는 미완. 장비 actual-source47/47은 이미 완료한 코드 검증이며 이 패키지 검수에서 재실행0 |
| 문서·Git | 관련 docs 전체440행/46경로 검색, 날짜별 역사와 관리자STATE/LOG4 보존. 완료한 root docs6만 scoped checkpoint·원격 정확SHA 대조, 보호 타인67 보존 |

[현행 포장본 상세 계약](MAC_CH1_SOURCE16_CANDIDATE_20261003.md).

## 2026-10-03 source17 현행 Mac 패키지와 정상 부활 부분 관찰

현행 생산 code source17(천공쇄기 필드 타격 수정)의 체크포인트는 `84e122699c0bbfcf5a3e7a84eff0d87bb9369b45`다. 새 패키지는 이후 메일 기록을 포함한 입력 Git `411c049db8b97ba0eafbe5e81cda4306b1325461`, job `7aa83459-0b98-44c1-a7d5-35903d9acbee`, 포트3393이다. source16/3392와 source15/3391 패키지는 이전 버전으로 보존한다. 과거 Maclocked 관측은 이력이며 최신 source15 정상 부활 입력은 실제로 동작했다.

| 항목 | 실제 근거·완료 경계 |
|---|---|
| 새 제작 | UTC2026-10-03T00:19:06.104Z; root execute1·내부 plan1·별도 plan0, PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 입력·사본 | selector7918/runtime340 재사용·main/Easy핀2 갱신. 새 stage/app 비파생7916 각1회 SHA·커버리지 일치, source3=stage3=app3 exact |
| 실행 계약 | 파생bootstrap2 exact·node-main 전체역치환 원본복원, arm64 MachO 실행5 SHA·실행권한·bundle plist exact; 새 owner UUID/dev-ino 유지 |
| 실물 영수증 | physical-receipt.json 22233B / SHA256 `dd0c95f0d3b97192be783f97201b66e1fbaca345c3675cf4923235ac35ff529f`; 새 패키지 실물 확인이며 실제 플레이 PASS가 아님 |
| 코드 검증 | source17 actual-source20/20·fixture0 및 JS12/JSON2는 앞선84e1226 코드 검증. 이번 패키지에서 반복 실행0. source16 장비47/47·source15 해제48 검사를 새 플레이 증거로 계산0 |
| 정상 부활 부분 | 별도 own source15/3391에서 사망 버튼 “다시 일어서라”로 정상 일반필드 부활. 실제 화면 HP565/565·MP394/394·SP226/226·LV1·EXP0/15·지역0/32·SW물13M, 이후 Settings 일시정지. 난이도 표시는 일반(5) |
| 관찰 한계 | source15 living pixel timer00:00·AX stale00:18은 구분하고 pixels 우선. 보스방 이전 일반 사망/부활이므로 보스 사망 맵·몹 보존 회귀 검증이 아님. screenshot 저장 fs미정의1은 캡처·UI 성공 후 발생, 기존 버퍼 import 복구로 보존 |
| 새 앱 인수 | source17 앱 GUI기동/native/시각/청취0, 신규 profile/save 미생성. 같은 source17의 전투→획득→장착→4지역→보스 사망/부활→재도전·실저장·청취는 아직 미완 |
| 보존·동기화 | 기존source11/15/16 앱 존재·plist ID 유지·사용자 앱/세이브 변경0. 과거 사용자59376baf/08cac1ce 정확 앱 경로는 UNKNOWN. docs 전체 1470행/179경로 검색 후 현행 root6만 추가, 보호67/관리자4/기존 WIP 보존 |

[현행 source17 포장본 계약](MAC_CH1_SOURCE17_CANDIDATE_20261003.md).

### source17 포장 기록 이후 실제 정상 기동 관찰

2026-10-03 KST 새3393 source17 앱을 정상 실행해 `index.html?demo=1` 타이틀과 “아무 키나 눌러 계속”, 입장 버튼·한국어 선택 표시를 실제 화면/AX로 확인했다. 위 표의 GUI0·profile 미생성은 포장 검수 시점의 역사다. 새 관찰은 정상 타이틀 기동만 인수하며 CH1 전투·보스·저장·청취 완료가 아니다. 증거는 `tmp/mac-migration-runtime/continued-review-20261003/source17-native-play/startup-receipt.json` 및 `01-normal-startup.png`다. 사용자 기존 앱/세이브 조작0.

### 2026-10-03 source17 정상 CH1 전투·드롭·장착 부분 검수

동일 source17/3393 별도 앱에서 정상 데모 로비→신규 전사 `맥검수열일곱`→캐릭터 이야기→안내/실습→CH1 필드를 실제 입력으로 진행했다. 이 관찰이 위 정상 타이틀 기동만 인수한 기록 이후의 최신 상태다. 생산 코드 변경0·외부 게임 상태 주입0이며 일반 난이도5를 유지했다.

| 실제 항목 | 관찰값·완료 경계 |
|---|---|
| 정상 전투 | 첫 시도는0처치 투사체 사망. 정상 부활 이후 처치0→4→15→18, LV1→2, EXP3/20, 최대콤보14 관찰. 남서 물 진입과0/53→18/53 처치 표시를 확인했으나 지역 클리어는 미완 |
| 드롭 획득 | 실제 R 입력 뒤 `일반 낡은 망토 획득!` toast, 가방10→12. 일반필드 두 번째 사망과 정상 “다시 일어서라” 이후 LV2·EXP3/20·악의13066·가방12·장비 보존 관찰 |
| 정상 장착 | 실제 획득 망토 DEF20/ST33/HP44/회피쿨다운−11.23%를 장착. 이전 망토 DEF21/ST44/HP17/회피쿨다운−7.28%는 가방으로 교체되며 총12개 유지 |
| 장비 자원 부분 | 장착 후 pixels HP543/575로 현재HP543 유지·MP468/468·SP291/291로 새상한 clamp. source16의 실게임 단일 조건 부분 증거이며 장비 전체 회귀 PASS가 아님 |
| 비교 표시 문제 | 장착 전 CP1841·미리보기−20, 실제장착 CP1834(−7), 역비교+19. 미리보기와 실제 차이가 불일치하므로 비교 UX 인수 미완·Codex UIUX에 소유 후속 인계. 새 수치 설계/수정은 아직0 |
| AX와 pixels | 장착 직후 field AX에는 HP543/543·SP302/302·CP1841이 남았지만 pixels는 HP543/575·SP291/291·CP1834. 이 구간은 pixels를 실제 관찰 기준으로 사용하며 stale AX 값을 현행 게임값으로 기록하지 않음 |
| 실패·남은 검수 |18처치 이후 중독/화상/투사체로 일반필드 사망. 보스방 이전 일반사망이며 보스전 사망 맵/문/몹 보존을 입증하지 않음. 동일후보4지역 클리어→보스방 개방→보스 사망/부활→재도전, 실제 저장 재로드·청취·시연 완주는 아직 미완 |
| 보존·증거 | 사용자 기존 게임/세이브 조작0·새 후보 Settings 일시정지. 04-normal-combat-west.png는 이름과 달리 첫 일반필드 사망 증거이며 전투 PASS로 계산0. 코드/기존검사 반복0. 근거 normal-play-receipt.json 5434B / SHA256 `dcbc2be6cf93ef57af5f328fcd74a9f42ed2710c1d5acc59bf467d986eaa91f0` 및 source17-native-play/02~12 PNG |
| 문서 범위 | docs 전체 관련검색 496행/116경로. 생산값 변경0이므로 과거 이력/확정 수식은 보존하고 현행 native 인수6문서에 이 관찰만 추가. 보호67와 관리자 STATE/LOG4를 편집하지 않음 |

검사 보고서와 부분 플레이 관찰을 게임 완성 건수로 계산하지 않는다. CH1-1 끊김 없는 시연 목표는 계속 진행 중이다.


## 2026-10-03 source19 Mac 격리 검수 앱 — 포장 확인 / 실제 플레이 미인수

source18 투사체 kbMult 초기화와 source19 실제 장착 CP 미리보기·정렬 수정을 함께 담은 새 Mac 실행본이다. 코드/문서 원격 보존 source commit은 9dabfedeb5e095525d5d4c9c3f3c122b7ecab79b; 과거 source17/3393의 실제 LV2·18처치·망토장착 부분 검수와 별개의 후보다.

| 항목 | 실제 포장 검수 결과 / 남은 경계 |
|---|---|
| 앱 | /Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-9cc552c5-3e13-41d6-886a-bc941952b474/package/EXODUSER-9cc552c5-3e13-41d6-886a-bc941952b474.app |
| 고유 식별 | job 9cc552c5-3e13-41d6-886a-bc941952b474 / bundle com.exoduser.mac.9cc552c5-3e13-41d6-886a-bc941952b474 / port3394. 기존 source11/3390·source15/3391·source16/3392·source17/3393 앱 및 profile/save 존재와 앱 plist ID만 읽어 대조, 사용자 내용 읽기/변경0 |
| 코드3 | game.html: 4031343B / SHA256 83b8db65f0f9abdf4f227c44101d7f6e6fe4cb573891af4ba5fc3896a00be11c<br>game-easy-test.html: 3908622B / SHA256 bb9c147435d39ef07bd8eae56fb7c667138e03a3a0c93cb7a7c95435e128a735<br>index.html: 342119B / SHA256 1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 |
| 정확 복사 | 입력7918 중 파생 package.json/node-main.js 2개 제외7916파일, stage와 앱에서 각 SHA256 전수 대조1회. 한 사본 6645483913B. source→stage→app의 코드3은 byte-exact |
| 파생 서버 | 원본 node-main.js에서 PORT3333→3394·SAVE_DIR→새 고유 job/user-state/saves만 변경. 전체 역변환은 원본과 정확히 일치. 기존 server/PC/사용자 세이브 조작0 |
| 파생 실행 설정 | main=http://127.0.0.1:3394/index.html?demo=1, node-remote는3394 loopback2개, profile는 고유 job/user-state/profile. 원본 package.json 변경0. 앱만 product_string에 고유 ID 추가 |
| 런타임 | 기존 NW.js0.111.2 arm64/Chromium148.0.7778.97/내장Node26.0.0 재사용. 실제 main+helper4 실행파일의 runtime SHA·실행모드·Mach-O arm64·plist executable/ID5개 검증. 설치/다운로드0 |
| 저장/실행 | 2026-10-03 01:46 UTC source19 고유 앱을 최초 정상 기동하고 demo 타이틀 화면·AX와 전용 서버 HTTP200을 확인. GUI 키/클릭·캐릭터 생성·저장/재개·게임 전체 native 인수0. 최초 포장 당시 profile/saves 미생성 기록은 당시 이력 |
| source 회귀 | source19 CP14/14 PASS·원본 source18 0/14 PASS, 양판12JS+2JSON 문법 PASS. 실제 함수를 isolated VM에서 사용했고 DOM/오디오/저장 I/O는 fixture. source18의8검사는 당시 원격 checkpoint 근거로 보존·이번에 반복0 |
| 불변/미완료 | 보호67·관리자 STATE/LOG4·source17 paused 검수게임/세이브 보존. Mac 잠금해제 답변 대기. source19 정상 시작→전투/획득/장착→4지역/보스문 개방→보스사망/부활→재도전·저장 재개·시각·청취는 미완 |
| 실제 의미 | 장비 교체 예상 CP가 최종 HP/MP/ST·강화이전·결정전승·비용/레벨 거절을 반영하도록 수정한 코드가 새 실행본에 들어갔음을 확인. 실게임의 동일 망토−20 대 실제−7 오차가 source19 화면에서도 해소됐다는 주장은 아직0 |
| 근거 | tmp/mac-migration-runtime/continued-review-20261003/ch1-source19-build/{preflight.json,execute-result.json,physical-receipt.json}. physical receipt 22968B / SHA256 4bd34c823ac31917f5244e3a52f0bdd752ebbefc73c6eb6eed6956ec6800f8f1. 새 입력7918/런타임340 검증은 기존 no-cleanup adapter 실행1회, 실패 새job 삭제0 |

원래 사용자 앱 UUID59376baf/08cac1ce의 정확 경로는 과거 인수 자료에 없어 이번 보존 대조는 UNKNOWN이다. 해당 앱/프로필/세이브를 찾아 추측하거나 조작하지 않았다. 포장만 완료한 후보를 CH1-1 게임 시연 완료로 계산하지 않는다.


## 2026-10-03 source19 실제 기동 — 타이틀·전용 서버 확인

| 항목 | 이번 실제 관측 / 남은 검수 |
|---|---|
| 고유 앱·서버 | 기존 검수 package job9cc552c5-3e13-41d6-886a-bc941952b474 / bundle com.exoduser.mac.9cc552c5-3e13-41d6-886a-bc941952b474 / port3394. 공식 cua.getApp(exact app path)으로 최초 background 기동, 설치·새 빌드·원본 실행 설정 변경0 |
| 실제 화면 | 127.0.0.1:3394/index.html?demo=1, HELL: EXODUSER의 타이틀 이미지와 ‘아무 키나 눌러 계속’ 표시를 AX+2704×1696 JPEG에서 확인. 앱 기동 성공이며 게임 진입·전투·CP 수정 화면 검증은 아님 |
| HTTP | index.html?demo=1·game.html·game-easy-test.html·/api/slots 모두200. 본편4031343B/83b8db65f0f9abdf4f227c44101d7f6e6fe4cb573891af4ba5fc3896a00be11c, Easy3908622B/bb9c147435d39ef07bd8eae56fb7c667138e03a3a0c93cb7a7c95435e128a735, index342119B/1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7. 두 게임 HTTP 응답은 현재 source와 byte-exact |
| 슬롯 API 경계 | /api/slots는 {"ok":true,"slots":[]} 반환. 새 고유 서버의 빈 파일 슬롯이며 demo localStorage 저장 성공/실패 또는 기존 사용자 슬롯 초기화 근거로 사용0 |
| 입력·보존 | GUI 키·클릭 입력0, 캐릭터 생성0, Mac 잠금해제 확인0. 타이틀 screenshot을 잠금해제 증거로 간주0. source17 검수게임/기존 앱·세이브 조작0 |
| 미완 GATE | 정상 새 캐릭터 시작→전투·획득·장착→4지역/보스문 개방→보스전 사망·부활→재도전·저장 재개/CP 실제 화면/청취는 미완. source17 부분 플레이와 source19 타이틀만을 합산해 같은후보 전체 인수로 계산0 |
| 근거 | tmp/mac-migration-runtime/continued-review-20261003/source19-native-play/{01-title-ax.txt,01-title.jpg,startup-receipt.json}. JPEG SHA2567d8c821254a88118f955e3e00ec8bad8000fdc9c14b1a4888d644ab62773958f, AX SHA2566b8af2c9fd3cd3cede6bbf8118bbd4ae4a53e09566b98e8b22345ce9f74fc042. HTTP 실제 관측01:46:25 UTC |
| 이번 고유 user-state metadata | source19 전용 profile·saves 디렉터리 생성 확인. 디렉터리 존재만 조회했고 내부 사용자/세이브 내용 변경0. 슬롯0은 위 신규 서버 관측 |


## 2026-10-03 source20 Mac 실행본 — 포장·정상 타이틀 기동

| 항목 | 현행 상태 |
|---|---|
| 후보 | job 63a5fffc-613c-4e30-a7c7-5ead3506e3b9 / port3395 / source commit 7d8b6b0236cdb504d90924dab4b30f9401dbb0ed. source20 뇌전창+source19 CP+source18 넉백 수정 포함. 기존 앱/세이브 보존 |
| 확인 | frozen7918/런타임340 실행1회, payload7916 stage/app 정확 복사, bootstrap2·arm64실행파일5 확인. 새 앱 실제 타이틀·전용HTTP4개200, 응답source3 byte-exact |
| 남은 검수 | 입력 잠금해제 확인 대기; 새캐릭터·전투/획득·4지역/보스문·보스사망/부활·재도전·CP화면·저장/청취 미완. 기존검사 반복0·GUI입력0·사용자게임/세이브조작0 |

자세한 앱·저장경로·코드 SHA·physical/native 영수증은 [source20 후보 계약](MAC_CH1_SOURCE20_CANDIDATE_20261003.md)를 따른다. source19와 source17 관측은 각각 당시 이력으로 보존한다.


## 2026-10-03 source21 Mac 실행본 — 포장·정상 타이틀 기동

| 항목 | 현행 상태 |
|---|---|
| 후보 | job b4a3cf03-34d2-45ea-b2a7-a08bf94ca7d2 / port3396 / source commit 97d5079b513bebce747899c734dadafd607af95e. source21 미개봉상자+source20 뇌전창+source19 CP+source18 넉백 수정 포함. 기존 앱/세이브 보존 |
| 확인 | frozen7918/런타임340 실행1회, payload7916 stage/app 정확 복사, bootstrap2·arm64실행파일5 확인. 새 앱 실제 타이틀·전용HTTP4개200, 응답source3 byte-exact |
| 남은 검수 | 입력 잠금해제 확인 대기; 새캐릭터·전투/획득·4지역/보스문·보스사망/부활·재도전·CP화면·저장/청취 미완. 기존검사 반복0·GUI입력0·사용자게임/세이브조작0 |

자세한 앱·저장경로·코드 SHA·physical/native 영수증은 [source21 후보 계약](MAC_CH1_SOURCE21_CANDIDATE_20261003.md)를 따른다. source19와 source17 관측은 각각 당시 이력으로 보존한다.


## 2026-10-03 source22 Mac 실행본 — 포장·타이틀·HTTP 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job 9170d8a4-2ede-48d8-a758-20fc5e8b3193 / port3397 / 코드 checkpoint 9cab599f1f297133577b42e45ca001c34c255f96. source22 펫 조작 안내·fade 보존 포함 |
| 확인 | 입력7918/런타임340 execute1회, payload7916 stage/app SHA exact, bootstrap2·arm64 실행파일5. 새 앱 타이틀 AX/JPEG2704×1696·HTTP4개200·정적 응답source3 exact |
| 미완 | GUI입력0·캐릭터0·잠금해제 답변 대기. 동일 후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/보스 사망·부활/재도전·저장/청취 인수 미완 |
| 보존 | 기존7검수 앱·사용자게임/세이브 입력0. 보호67·관리자4 보존. 기존 source 검사 반복0 |

상세 경로·SHA·인수 경계는 [source22 Mac 후보](MAC_CH1_SOURCE22_CANDIDATE_20261003.md)를 따른다. 이전 source21/3396 및 source17 부분 플레이는 당시 이력으로 보존한다.


## 2026-10-03 source23 Mac 실행본 — 전조 수정 포함·타이틀 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job f70852a9-594f-4de4-9313-bd28af78f80e / port3398 / 코드 checkpoint 216035ab68a86f673f63560112d6b683f1695104. 보스 jump300px/fan실발사각 및 이전 source22 수정 포함 |
| 확인 | 입력7918/기존runtime340 execute1회. payload7916 stage/app각SHA exact, 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·전용HTTP4개200·응답source3 exact |
| 미완 | GUI입력0·새캐릭터0·잠금해제 새답변 대기. 동일후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/사망·부활/재도전·저장/청취/전투화면 인수 미완 |
| 보존 | source22/3397 등 기존8검수 앱·사용자게임/세이브 입력0, 보호67/관리자4보존. 실제 기존 source검사 반복0 |

정확한 앱·저장경로·SHA·인수 경계는 [source23 Mac 후보](MAC_CH1_SOURCE23_CANDIDATE_20261003.md)를 따른다. 이전 source22 타이틀과 source17 부분 플레이는 당시 이력이다.


## 2026-10-03 source24 Mac 실행본 — 현재 스테이지 콤보 수정 포함·타이틀 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job ecc7b214-401e-4dfe-b310-090d30a03e50 / port3399 / 코드 checkpoint 9f9adc11ed36330cca8fc750ab94300a6f084054. 현재 스테이지 최대콤보를 클리어 점수·배지·통계에 사용하고 캐릭터 저장 최고 기록 보존 |
| 확인 | 입력7918/기존runtime340 execute1회. payload7916 stage/app각SHA exact(복사당6645489253B), 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·전용HTTP4개200·정적응답source3 exact |
| 미완 | GUI입력0·새캐릭터0·잠금해제 새답변 대기. 동일후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/사망·부활/재도전·저장/청취/전투화면 인수 미완 |
| 보존 | source23/3398 포함 기존9검수 앱의 존재/Info.plist ID와 profile/save 메타만 대조. 사용자 게임·세이브 입력0, 보호67/관리자4보존. 원래 사용자 앱59376baf/08cac1ce의 정확경로는 미확인. 기존 source검사 반복0 |

정확한 앱·프로필·저장경로·SHA·인수 경계는 [source24 Mac 후보](MAC_CH1_SOURCE24_CANDIDATE_20261003.md)를 따른다. source23 타이틀 및 source17 부분 플레이는 당시 이력이며 이번 같은후보 플레이 완료 증거로 합산하지 않는다.
