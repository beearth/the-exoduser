# 통합·빌드팀 운영 대장

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
