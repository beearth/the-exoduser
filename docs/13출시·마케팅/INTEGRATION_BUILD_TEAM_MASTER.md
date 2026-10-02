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

현재 실제앱 b3f52d84-90e5-4eca-ac38-bc2a874a0f43은 source checkpoint7ccb72c0의SOUND/ITEM/캐릭터입장취소 세 수정을모두포함한다. fresh execute1·내부verify1 exit0, main ce171131…/easy8c7d8208…/index1dd28cab… 실앱사본동일·7918입력/340runtime exact·8253regular+5symlink/7043802009B. 고유port3385·절대profile/save·bundleID를확인했고현재user-state미생성. 기존c927 dd333 snapshot·user23·기존앱/세이브보존, download/install/서명/기동0. 실제native·CH1-1 연결6단계/화면/청취/저장인수는미완료이며Mac잠금해제질문은이미남겨두었다. 소스freeze는사본확인후해제하며팀별독립후속작업과감독종료복구는계속한다.

[새 실제 후보·정확SHA·기동/검수Gate](MAC_CH1_LATEST3_CANDIDATE_20261002.md)가현행앱기준이다. 이전c927/runtime/partialfixture보고서는그시점snapshot으로보존하며source/모델PASS를제품/nativePASS로확대하지않는다. 관련docs전체rg1회47행/15문서분류를근거로현재Master/build/runtime정본·root기록과새보고서를동기화했다.


### 2026-10-02 최신 source4 Mac 후보 생성

97bb3ef9-fff2-4761-9841-e5a24a953847 앱은 codeca7e0bb0/원격backup e764ed33의 네sourcefix를포함한다. main e462f234…/easy68fa8e17…/index1dd28cab… 원문·stage·실앱동일, inputs7918/비파생7916/runtime334+메타6 exact. freshplan1/execute1 exit0/내부verify1/readinventory1, 별도verifier/재빌드0. regular8253+symlink5/7043803133B, 고유port3386/profile-save. 기존앱·user23·원자료·cache보존. 최종receipt743842ae…/20421B, configcdf9ba83…/3428980B. sourcefreeze는사본생성완료로해제한다. 실제앱기동/6단계플레이/visual/청취/영속save는0으로활성목표는미완료다. [현재후보정확계약](MAC_CH1_SOURCE4_CANDIDATE_20261002.md). 함께보존한BOSS철회/BALANCEGPnav원자료2는제품적용0이며readiness dee37149… exact2다. 감독단일오더전담/총괄생산·검수·Git 역할을유지한다.
