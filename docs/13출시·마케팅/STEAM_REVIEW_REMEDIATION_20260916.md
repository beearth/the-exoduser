# EXODUSER: HELL LORD — Steam 반려 수정·재검수 준비

> **후속 결과:** 영어 설정 카드의 기존 번역 연결2줄을 추가 수정·재패키징했고, 실제 Steam **Build25341487 / Depot4749591 / Manifest6619142697949151359** 업로드를 완료했다. 비공개 브랜치 생성·접근 비밀번호 설정과 Steam 설치본 검증은 사용자 조작/Windows 연결 대기이며 미완료다. default25202408과 상점 미게시 상태 유지. 최신 근거·범위는 [Steam 설치 검증 후속 보고서](STEAM_INSTALL_REVIEW_20260916.md)를 따른다. 아래 D/E/F의 미업로드 설명은 앞선 로컬 대응 시점의 기록이다.

AppID **4749590**, 반려 BuildID **25202408**. 작업일 2026-09-16(KST).

## A. 필수 반려 상태

| 항목 | 실제 결과 | 남은 범위 |
|---|---|---|
| 언어 전환 | **해결(직접 EXE 검증)**. 저장 순서·URL 우선순위·시작 안내·열린 펫 대사 수정. 관련 자동 검사 69개 통과 | Steam 클라이언트로 새 업로드 빌드를 설치하는 검증은 미실시. 아래 번역 범위 제한과 구분 |
| 상점 언어 정합성 | 실제 Steamworks Basic Info 조회: 변경 전 31개 인터페이스·31개 자막, 전체 음성 0. **한국어 인터페이스·한국어 자막만 남겨 저장하고 새로고침 확인** | 게시 미실행. 공개 상점 반영 완료라고 주장하지 않음 |
| Captions available | 비언어적 소리 설명 접근성 캡션 미구현. **해당 체크 해제·저장·새로고침 확인** | 게시 미실행. 일반 대사 자막/대화/음성은 보존 |

`output/steam_review_20260916/store-before.json`, `store-after.json`: 실제 DOM 체크 상태 증거. 61개 체크 변경(비KO 인터페이스 30, 비KO 자막 30, Captions 1). 싱글 플레이어·Remote Play Together 등 다른 항목은 보존했다. 번역 기능을 제거해서 해결한 것이 아니라 **전환 결함 수정 후 새 한국어 고정 콘텐츠 때문에 불완전한 언어를 분류**한 결과다.

## B. 원인·수정·검사

### 실행 환경과 기존 검수 빌드

| 항목 | 확인값 |
|---|---|
| 실행 환경 | NW.js 0.111.2, Windows x64, normal flavor. Electron 아님 |
| 기존 Steam 빌드 | `E:/steam/steamapps/appmanifest_4749590.acf`: BuildID 25202408, depot manifest 5604079566035910679 |
| 기존 설치본 | `E:/steam/steamapps/common/EXODUSER HELL LORD/package.nw` |
| 실제 SteamPipe 작업 폴더 | `G:/exoduser-steam/scripts/app_build_4749590.vdf`, `depot_build_4749591.vdf` |
| 실제 SteamPipe 콘텐츠 경로 | `G:/exoduser-steam/content/windows`. 저장소 `steam/`의 과거 G:/hell 경로를 배포 경로로 사용하지 않음 |
| 이전 소스와의 관계 | `STEAM_LATEST_DEPLOY_20260909.md`는 당시 미완료 현지화 작업을 검수 빌드에서 제외했다고 기록. 현재 소스에는 이후 현지화·신규 튜토리얼·영상 변경이 추가됨. 이전 빌드를 현재 HEAD와 동일하다고 간주하지 않음 |
| 이전 결함 재현 | 설치본의 실제 초기화 코드를 VM에서 실행: hellLang=fr, 설정 없음 → OPT.lang=ko. 수정본 동일 입력 → fr. 기존 설치 EXE 전체 플로우 재현은 미실시 |

### 수정 파일

| 파일 | 원인 / 핵심 변경 |
|---|---|
| `game.html` 초기 설정 | 현재 소스의 설정 마이그레이션이 `hellLang` 복원 전에 saveSettings를 호출해 최신 로비 선택을 이전 OPT.lang으로 덮어썼음. `_settingsMigrated`로 저장을 복원 뒤로 이동. 손상 JSON 원문 보존 |
| `index.html` setUserLanguage | URL `?lang=`이 명시적 메뉴 선택보다 계속 우선했음. 사용자가 선택하면 URL의 lang만 제거하고 hellLang 즉시 적용. 다른 쿼리 보존 |
| `game.html` 시작 4컷 | EN 이외를 KO로 강제하던 분기를 기존 `_L` 조회로 연결. 열린 안내도 `_applyLang`에서 즉시 갱신. 선택 언어 대사 리프 1개 표시, 미등록 키만 영어 폴백 |
| `game.html` 펫 대사 | 실제 패키지 화면에서 이전 언어로 남은 말풍선 확인. 원문 sourceTxt 보존·현재 및 대기 응답 재번역. 타이머·SFX 재시작 없음. `test/petLanguageRefresh.test.js`에서 실패 재현 후 수정 확인 |
| `localization/ui-source.json` | 원본 레지스트리의 악의기둥 5초/5s 오기를 기존 런타임·기존 번역의 10초/10s에 동기화. 전투 수치 변경 아님 |
| `test/localizationHandoff.test.js` | 가짜 무동작 saveSettings 대신 실제 함수·저장소로 회귀 재현. 기존 설정·첫 실행·손상 설정·진행 보존 검사 |
| `test/lobbyLanguageSelection.test.js`, `test/introGuideLocalization.test.js` | URL 선택 및 열린 안내의 기존 번역 조회 회귀 검사 |
| `test/introFourCuts.test.js` | 새로 사용되는 기존 `_L` 의존성을 테스트 환경에 제공 |
| `tools/audit-steam-review-localization.mjs` | 실제 코드 리터럴 번역 참조 감사. 누락 개수는 전체 품질 보증 지표가 아님 |
| `tools/verify-steam-review-package.py`, `tools/steam-review-probe.js` | 실제 EXE·격리 프로필·임시 QA 주입·화면 캡처. 종료 시 manifest/server 바이트 복원 |
| `tools/steam-review-evidence.mjs` | 설치본 초기화 재현, 소스/패키지 해시, 상점 변경 범위 증거 |
| `tools/summarize-steam-review.mjs` | 최종 실기 29개 행·복원 값·펫 표시·파일 일치·QA 제거를 실제 결과에서 검증하고 summary 생성 |

### 실제 부족한 번역 범위

| 화면 / 콘텐츠 | 확인한 제한 |
|---|---|
| 로비·핵심 메뉴·인벤토리·스킬·성장 | 29개 선택·기존 카탈로그 존재. 전체 원어민 감수나 전 콘텐츠 완성을 의미하지 않음 |
| 전투·자원·시스템 실습 | `parry-lesson.js`, `resource-practice.js`, `system-lesson.js`의 한국어 고정 문구가 번역 조회를 우회. 영어에도 남음 |
| 설정의 캐릭터 카드 | 당시 renderSettings의 직접 ch.name/ch.desc 출력 누락. 현행 소스는 game.html·game-easy-test.html 모두 이름·설명을 기존 _T에 연결(2026-09-29 easy-test 보완), KO/EN 실화면·두 HTML EN→KO 회귀 확인. 해당 소스 수정이 Steam 패키지에 반영되었다는 뜻은 아님 |
| 캐릭터 선택 | 일본어 등에서 제목·버튼은 번역되지만 전사 소개·플레이스타일·하단 직업명은 새 한국어 문구가 남음. 실제 character-ja.png 확인 |
| 시작 4컷 | 기존 번역은 전환됨. 새 제목·일부 대사·힌트는 영어 폴백. 프랑스어 화면에도 영어와 프랑스어 혼합 확인 |
| 캐릭터 생성 이야기 영상 | `warrior_story_v22_bgm.mp4`, 약96.4초, 영어 음성·영상에 박힌 한국어 자막22큐. 다른 언어 선택이 이 자막을 교체하지 않음 |
| 세계관 영상 | 영어 음성에 대응하는 실제 시간 지정 자막29언어×32큐 존재. 단순 스토리 텍스트로 자막을 인정한 것이 아님 |
| 네메시아 컷신 | 실제 보이스 대사18큐에 대응하는 번역 구조 존재. 구 PRO 21대사 번역 파일은 현재 생성 영상의 고정 자막을 대체하지 않음 |
| 전체 음성 | 특정 언어의 일부 음성이 있다는 이유로 전체 음성을 인정하지 않음. 모든 언어 미체크 |

등록 UI 원본은 779키. 정적 감사의 리터럴 참조1672개 중 영어45개, 나머지 비KO27언어 각23개의 정확 키가 해결되지 않음(일부 호출은 영어 인수 폴백 존재). 이 수치는 한국어 고정 실습 전체를 포함하지 않아 ‘번역 완료율’로 사용하지 않는다. 카탈로그와 27개 lang 파일을 삭제하지 않았다.

### 검사와 제한

- 관련 Node 검사 **69 통과 / 실패0**: 언어 복원·카탈로그·별칭·자막 타이밍·패키징 계약·시작 안내·초기화 순서 보호·펫 대사 갱신·영상 제어. `output/steam_review_20260916/tests-final.log`.
- 별도 기존 `localizedGrowthSearch.test.js`는 환경에 Playwright Chromium 바이너리가 없어 실행 차단. 통과로 집계하지 않았다.
- 빌드 경고: 소스에 없는 `credits.html`, `output/imagegen/forge-tabs-v3/` 건너뜀. 현지화 리소스 누락은 아님. 대장간 구형 v3 아이콘 경로에는 기존 onerror 생성 아이콘 폴백이 있음. 이번 전투·아트 범위 밖 파일을 새로 만들지 않음.
- 패키지 EXE 검증의 초기 시도는 개발 서버 충돌 또는 시네마틱이 메뉴를 가린 캡처 때문에 무효 처리. `runtime-attempt-*.json`의 실패와 이전 캡처를 성공 증거로 사용하지 않는다.
- 현재 최종 실기 결과는 아래 D의 증거를 따른다. 검수팀의 Steam 오버레이 실기를 실행했다고 주장하지 않는다.

## C. 언어별 지원표

`부분 I` = 핵심 UI 번역은 있으나 한국어 고정 실습/캐릭터 설명/새 안내의 폴백 존재. 사망 화면 실기에서도 일부 펫 대사가 한국어로 남음.
`부분 S` = 세계관·네메시아 대사 번역은 있으나 현재 생성 영상의 한국어 고정 자막을 교체할 수 없음.
상점 권장값 순서는 **인터페이스 / 자막 / 전체 음성**. 체크는 현재 저장된 편집값이며 미게시다.

| 언어 (내부 코드) | 인터페이스 | 자막 | 전체 음성 | 패키지 실기 검증 | 상점 체크 권장값 |
|---|---|---|---|---|---|
| 한국어 ko | 원문 | 실제 음성 대응 자막 있음 | 전체 없음 | D 참조 | 예 / 예 / 아니오 |
| 영어 en | 부분 I | 부분 S | 일부 영어 음성, 전체 아님 | D 참조 | 아니오 / 아니오 / 아니오 |
| 중국어 간체 zh | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 중국어 번체 zht | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 일본어 ja | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 스페인어 es | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 스페인어 중남미 → es | 공통 es, 지역 감수 없음 | 부분 S | 없음 | es 공통 코드, 지역 별도 미검증 | 아니오 / 아니오 / 아니오 |
| 프랑스어 fr | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 독일어 de | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 러시아어 ru | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 포르투갈어 브라질 ptbr | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 포르투갈어 포르투갈 → ptbr | 공통 ptbr, 지역 감수 없음 | 부분 S | 없음 | ptbr 공통 코드, 지역 별도 미검증 | 아니오 / 아니오 / 아니오 |
| 이탈리아어 it | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 베트남어 vi | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 태국어 th | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 인도네시아어 id | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 터키어 tr | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 폴란드어 pl | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 체코어 cs | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 헝가리어 hu | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 불가리아어 bg | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 그리스어 el | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 핀란드어 fi | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 스웨덴어 sv | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 덴마크어 da | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 노르웨이어 no | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 네덜란드어 nl | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 루마니아어 ro | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 우크라이나어 uk | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |
| 아랍어 ar | 부분 I, RTL | 부분 S | 없음 | D 참조, 전체 RTL 가독성 보증 아님 | 아니오 / 아니오 / 아니오 |
| 말레이어 ms | 부분 I | 부분 S | 없음 | D 참조 | 아니오 / 아니오 / 아니오 |

## D. 배포 산출물·실기 증거

- 배포 디렉터리: **`G:/exoduser/out/EXODUSER-win64` 전체**. 실행: 그 폴더의 **`EXODUSER.exe`**. EXE만 복사하면 안 된다.
- 최종 산출물: 7,813개 파일, 6,403,117,835바이트(약6.4GB). `package-files.json`에 파일 경로·크기와 EXE SHA-256 기록.
- 로컬 직접 실행 시 포트3333의 개발 서버를 먼저 종료해야 패키지 내 서버를 사용한다. 이번 검증은 동시 개발 작업을 방해하지 않도록 QA 포트3346에서 패키지 game.html의 SHA-256을 대조했다.
- 기존 Steam용 빌드 명령: `& 'C:/nvm4w/nodejs/node.exe' build-nwjs.mjs`. `output/steam_review_20260916/build.log`.
- 이전 로컬 산출물은 `out/EXODUSER-win64-before-steam-review-20260916`에 보존했다.
- 소스 상태: 작업 시작 HEAD `0e04a8935`; 동시 사용자 커밋을 보존. 정확한 빌드 파일 SHA-256과 당시 HEAD/작업 상태는 `package-evidence.json`에 기록. 실제 수정 커밋은 Git에서 이 문서와 함께 확인 가능하다.
- 최종 검증 후 다른 전투 작업이 game.html·별도 문서에 추가 스테이징됨. 임시 Git 인덱스와 검증된 패키지 game.html로 **이번 수정만 커밋**하며 다른 작업의 파일·스테이징을 보존한다. 산출물은 검증한 스냅샷 기준이며 이후 전투 변경을 포함하지 않는다. evidence의 matchesCommitted로 커밋/패키지를 대조하고 작업 폴더 차이는 별도로 기록한다.
- Steam 업로드 **미실행**. 새 BuildID **없음**. 기존 BuildID 25202408을 새 산출물의 ID로 쓰지 않는다.
- QA는 실제 NW.js EXE에 임시 검증 스크립트를 주입했다. 사용자 APPDATA/설정/세이브 대신 `output/steam_review_20260916/profiles/`의 격리 프로필 사용. 다른 개발 서버와의 충돌을 피하기 위해 검증 중에만 포트3346 사용. 종료 시 manifest·node-main.js를 바이트 단위 복원하고 주입 파일 제거. 출하 설정은3333.

실기 증거는 `runtime.json`, `manifest-restored.json`, `verification-summary.json`과 PNG 캡처다.

| 영역 | 실행한 검증 / 실제 결과 |
|---|---|
| 로비·캐릭터 선택 | 29개 locale의 실제 선택 이벤트, 표시 문구·4개 선택창 값·저장값 기록 및 각각 PNG. 캐릭터 선택도 실제 패널을 열어 캡처. 제목·버튼 전환과 소개의 한국어 잔류를 구분 |
| 신규 설정 | hellcave_settings가 없는 격리 프로필에서 로비 fr → 실제 게임 OPT.lang=fr, 저장값fr |
| 기존 설정 | 게임에서 ko 저장 → 로비 ja 선택 → 재진입 OPT.lang=ja, 저장값ja. 시스템 언어 힌트 koreana로도 사용자 선택 보존 |
| 설정·인벤토리·스킬·성장 | 29개 locale의 실제 패널 DOM 텍스트·PNG. 설정 제목·버튼·탭, 아이템명·스킬 설명이 변경됨. 현재 펫 말풍선도 선택 언어 번역과 일치 |
| 시작 안내 | 29개 locale의 열린 첫 컷에서 제목·설명·버튼 기록 및 PNG. 프랑스어 설명과 영어 폴백이 섞이는 실제 제한도 확인 |
| 사망·재시작 화면 | 격리 테스트 캐릭터의 기존 `_fallenResolve` 경로를 호출해 실제 사망 UI를 렌더. 29개 locale의 제목·재시작 버튼 캡처. 같은 사망창에서 숨은 설정 핸들러로 바꾼 테스트이므로 사망 원인 통계의 이전 언어 캐시·미번역 펫 대사는 별도 제한이며 전체 화면 번역 PASS가 아님 |
| 화면 품질 | KO/EN/JA/FR/DE/TH/AR 대표 캡처를 시각 확인. 대표 글리프가 네모로 표시되지는 않음. 1280×720 설정·인벤토리 내부 가로 스크롤, 긴 독일어 성장 노드 문구 줄바꿈/겹침, 한국어 배지·소개 등 혼합 문구 관측. 모든 해상도·문구의 가독성 PASS를 선언하지 않음 |
| 저장 안전성 | 모든 EXE 실행은 별도 APPDATA/Chromium 프로필. 기존 사용자 세이브를 삭제·마이그레이션하지 않음. 단위 검사에서 진행 sentinel·손상 설정 원문 보존 확인. 전체 진행 회귀 플레이를 완료했다는 뜻은 아님 |
| 포함 리소스 | 27개 lang JS + 현지화 폴더 및 런타임 등153개 파일의 소스/패키지 SHA-256 일치. KO·EN 인라인 데이터 포함, 언어 리소스 누락 없음 |

| 추가 영역 | 실제 완료 결과 |
|---|---|
| 종료·재실행 | **29/29 내부 언어** 각각 선택→저장→EXE 종료→새 EXE 실행→선택값·hellLang·로비 표시 문구 확인. 불일치0. `relaunch-<code>.png`, runtime.restartMatrix |
| 아이템 상세·HUD | **29/29**에서 실제 장착 슬롯 mouseover 핸들러로 상세를 열고 텍스트·PNG 기록, 이어 메뉴를 닫고 HUD 캡처. 아이템명·수치 설명은 전환되지만 프랑스어 상세의 무기종류 `검` 같은 미번역도 확인 |
| 관측 오류 | 전수 실행의 미처리 JS 오류0, 마지막 게임 페이지 performance에서 HTTP400 이상 리소스0. 관측 범위 밖 모든 경로의 무오류를 보증하지 않음 |
| 최종 초기화 보호 | 전수 실행 후 시작 안내 let 초기화 전 호출의 국소 보호를 추가. 언어 저장·번역 데이터·화면 렌더 로직은 동일. 재패키징 후 4언어 대표 재검증을 별도 `runtime-smoke.json`에 기록. 전수 실행 당시 해시는 `package-evidence-full-run.json`, 최종 해시는 `package-evidence.json` |
| 최종 재패키징 실행 | **ko/en/fr/ja 4개 선택·메뉴·사망 화면 재검증 완료**, 신규 fr·기존 설정 ja·EXE 재실행 ja 확인. 미처리 오류0. 최종 manifest/node-main.js 바이트 복원, QA 스크립트 제거, 포트3333·기존 user-data-dir 확인 |

위 표의 29개 내부 언어에 대한 패키지 검증은 **전환·저장·표시의 확인**이며, 비KO 번역 완성·모든 자막·전체 음성·모든 해상도 레이아웃의 PASS가 아니다.

## E. Steam 재검수 Notes 영문 초안

아래는 현재 확인된 수정과 상점 **저장** 상태만 담은 초안이다. 아직 새 빌드를 업로드하거나 상점 변경을 게시하지 않았으므로, 바로 제출하지 말고 F 완료 후 대상 BuildID를 확인한다.

> We corrected language persistence during settings migration and the language selector's handling of a URL language override. Selecting a language now updates the current locale and saves the choice. The opening control guide also uses the existing translation lookup and refreshes when the language changes.
>
> We tested the Windows NW.js executable with isolated profiles. All 29 selectable locales changed the main menu text and retained the selected language after terminating and relaunching the executable. We also checked first-entry French and switching from existing Korean settings to Japanese. This verifies switching and persistence, not complete translation coverage for all selectable languages. Steam client launch and overlay behavior have not been re-tested with a new uploaded build.
>
> After adding a small startup initialization guard and rebuilding, we repeated the packaged executable checks in Korean, English, French and Japanese, including first-entry French, existing-settings Japanese and Japanese after an executable restart.
>
> At the sign-in screen, use the language dropdown. During gameplay, open Settings with Esc and use the Language dropdown. The choice applies immediately; there is no separate Apply button and no restart is required. The sign-in labels, Settings title, menu tabs, inventory and skill descriptions provide visible places to inspect the change. Some recently added tutorials and the character-story video's embedded Korean subtitles are not fully localized, so we are not claiming complete support for the other selectable languages.
>
> We have saved the Steamworks Supported Languages settings with Korean interface and Korean subtitles enabled, and all Full Audio boxes disabled. The existing additional language selections and translation resources remain in the application, but are classified as incomplete.
>
> The game has dialogue subtitles but does not implement accessibility captions describing non-speech sounds. We have unchecked and saved “Captions available” in the Steamworks store editor. These store changes have not yet been published. No new Steam build has been uploaded as part of this local remediation.

검증한 내부 locale: ko, en, zh, zht, ja, es, fr, de, ru, ptbr, it, vi, th, id, tr, pl, cs, hu, bg, el, fi, sv, da, no, nl, ro, uk, ar, ms. 코드와 Steam 언어 항목의 대응은 C를 따른다.

## F. 남은 수동 작업 / 별도 권고

Steamworks에서 사용자가 할 작업:

1. 상점 편집 저장값(한국어 UI·자막만, 전체 음성0, Captions 해제)을 검토하고 **게시**. 다른 기존 미게시 변경도 함께 확인한다.
2. 검증 산출물 전체를 실제 SteamPipe 콘텐츠 경로에 배치하고 비공개 검증 빌드 업로드. 반환된 **실제 새 BuildID** 기록 후 Steam 설치본으로 실행 확인.
3. 위 Notes의 미게시·미업로드 문장을 실제 완료 사실로 갱신하고 재검수 요청. 이 작업에서는 기본 브랜치 교체·Set Live·재심사 제출·출시 실행을 하지 않았다.

별도 권고는 이번 필수 반려의 완료 조건과 분리한다:

| 권고 | 조사 결과 / 남은 작업 |
|---|---|
| Steam 오버레이 일시정지 | 실제 활성 콜백 연동 없음. `window.steamworks` 언어 조회만으로 오버레이 상태를 알 수 없음. 새 SDK 연동·Steam 실기 QA 별도. 브라우저 blur를 Steam 검증으로 보고하지 않음 |
| 컨트롤러 분리 | 기존 연결 해제 핸들러는 입력 초기화·토스트. 일시정지 소유권·튜토리얼 모달·기존 pause 상태 보존과 실제 장치 테스트가 필요해 별도 작업. 자동 재개 추가하지 않음 |
| Developer’s Recommended Configuration | 현재 Steamworks Steam Input 페이지에서 기본 컨트롤러 구성이 **선택된 항목 없음**임을 확인. `steam-input.txt`. 실제 장치 구성 작성·테스트 후 Steam에서 선택·게시 필요. 로컬 파일을 만들거나 게시 완료라고 주장하지 않음 |

Valve 재검수 전까지 심사 통과를 확정하지 않는다.


## 2026-09-21 시스템 안내 영어 보완

system-lesson.js의 7단계·버튼·상태·접근성 문구를 기존 _L에 연결했다. 열린 안내는 다음 표시 tick에서 현재 언어로 갱신하며 단계 체크·건너뛰기·DOM 자식을 보존한다. t(ko,en,values), steps getter, lastStatus(id/skipped), 언어를 포함한 bindingSignature를 사용한다. 신규 KO·EN 원본 34개는 번역 수집기가 검색하며 타 언어 미등록 키는 영어 폴백이다. 전체 영어/29언어 지원 완료나 Steam 배포 완료를 뜻하지 않는다. [구현·원문 표·남은 작업](../16번역·로컬라이제이션/STEAM_LANGUAGE_RESUME_20260921.md).


## 2026-09-21 전투·자원 실습 영어 보완

전투 92개·자원 78개 KO/EN 항목을 t→_L로 연결했다. 전투 12단계·자원 11개 구현 단계의 표시 및 일시정지 중 언어 전환 회귀가 통과했다. labels 등은 현재 언어 getter, 고정 리프는 localizedNodes 콜백으로 갱신한다. 언어 변경 시 일시적 사슬/자원 피드백 문구만 비우며 단계·체크·수치·판정·저장은 유지한다. 이전 한국어 고정 실습 제한은 로컬 소스에서 보완됐으나 기존 Steam 설치본/영상/다른 UI/타 언어 전체 완성을 의미하지 않는다. [원본 170행·구현·검증](../16번역·로컬라이제이션/TUTORIAL_ENGLISH_20260921.md).


## 2026-09-22 영어 캐릭터·배지·HUD 후속

| 대상 | 현재 구현 |
|---|---|
| 캐릭터 | 신규 소개·직업·특성19개 영어 등록 |
| 배지 | 3종 이름·조건·모음·알림 영어, 언어 전환 시 획득/알림 타이머 보존 |
| HUD | _applyLang에서 리프4개 및 플레이어 상태 aria-label 즉시 갱신. 일시정지에서도 적용 |
| 악의기둥 | 기존27언어 원본 JSON에는 5초가 남아 있었음. ui-needed와 실제 번역을10초로 고쳐 strict 빌드 복구 |
| 검증 | 번역 빌드와 관련14개 검사 PASS. 캐릭터 영상/타 언어 신규 실습은 후속 |

상세: docs/16번역·로컬라이제이션/ENGLISH_CHARACTER_BADGE_HUD_20260922.md
