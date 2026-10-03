# 본편 Steam 재심사 수정·검수 대장

2026-10-02 사용자 직접 지시. 본편 AppID **4749590**, DepotID **4749591**만 제출한다. 데모 AppID 5337590은 수정·재제출하지 않는다. 공개 출시·가격 변경·GitHub push/PR은 금지한다. 기존 Mac 작업 재개 정책과 별개로 이번 PC 본편 패키징 작업을 명시 승인받았다.

현행 업로드 후보는 공통 S/M/L 제목판 수정이 포함된 `EXODUSER-full-20261002-194300`이다. 아래 `130000`, `191200` 표시 행은 이전 산출물의 검수 이력이며 새 산출물에서 재실행한 증거로 간주하지 않는다. 이전 파일·프로필·저장·검수 자료는 보존했다.

| 항목 | 현재 계약 |
|---|---|
| 소스 | 패키지 실제 기반/로컬 HEAD는 `aacc7b02bef9d5cd7db6ea5d6466d7b8e4c11a3c` + 보존한 로컬 변경/본편 분리 패치. 최종 조회·fetch한 GitHub main은 `f5199925d8324c61473c5873a965a2429dcd7f7e`. 그 사이 3커밋/13경로는 웹 배포 도구·문서이며 NW 빌드 입력/실제 package.nw/Steam 포함 목록과 교집합 모두 0, 로컬 staged·unstaged·untracked와 충돌 0. 출하 런타임·빌드 입력에 영향 없음. manifest의 실제 aacc sourceCommit은 보존하며 f519에서 직접 빌드했다고 표기하지 않음. 공유 체크아웃 pull/merge·GitHub push 없음 |
| 기존 변경 보존 | `tmp/steam-main-resubmit-20261002/before/`: 77개 파일·작업/스테이징 binary diff·공용 index·SHA-256 목록. 원본 인덱스 유지, 원격 push 없음 |
| 본편 target | `full`, App 4749590/Depot 4749591, port 3350, APPDATA `EXODUSER-HELL-FULL/saves`, profile `./userdata-full` |
| 데모 target 계약 | `demo`, App 5337590/Depot 5337591, port 3351, APPDATA `EXODUSER-HELL-DEMO/saves`, profile `./userdata-demo`. 이번에 데모 산출/업로드는 하지 않음. Depot 5337591은 업로드 전 별도 Steamworks 검증 필요 |
| 웹 기본 | `build-target.js`는 NW manifest target 또는 `demo` 기본값. 기존 공개 웹은 데모 유지. 패키지 사본은 `window.EXODUSER_BUILD_TARGET='full';` 또는 demo를 명시 |
| 로비 | `_LOBBY_BUILD=window.EXODUSER_BUILD_TARGET\|\|'demo'`. full은 기존 본편 OFFICIAL·전체 장·캐릭터 생성·오프라인 서버 저장 경로 사용 |
| 게임 | `_DEMO_MODE=(window.EXODUSER_BUILD_TARGET\|\|'demo')==='demo'`. stage=0 종료, Lv100 상한, 데모 합체/어픽스 제한은 demo에만 적용. 본편 기존 7장/35스테이지 경로 사용 |
| 빌드 | `build-nwjs.mjs --target=full --build-id=YYYYMMDD-HHMMSS --runtime=검증폴더`. target/ID 필수, 이미 존재하는 staging/output 거부. `dist-release-full-ID`, `out/EXODUSER-full-ID` 고유 출력 |
| 런타임 | NW.js 0.111.2 normal Windows x64 캐시의 476파일 SHA-256을 공식 `https://dl.nwjs.io/v0.111.2/SHASUMS256.txt`와 대조. 검증 사본 `tmp/steam-main-resubmit-20261002/verified-runtime`; 별도 AAC/H.264 코덱의 기존 고정 해시 유지 |
| 서버 | `release-config.json` 우선, source 직접 NW 실행은 package.exoduser 설정. 포트·저장 namespace 전달. 개발 `server.cjs` 3333 계약 유지 |
| 업로드 도구 | `prepare-release-steam-upload.mjs`로 통합. 기존 두 도구도 명시 root/out/app-id/depot-id 필요. target·manifest·entrypoint·EXE·파일 hash·민감 경로·missing/unrecorded 파일 검사. demo=1을 본편 조건으로 요구하던 계약 제거 |
| 산출 증거 | 출력 `release-artifact-manifest.json`의 source HEAD+dirty 목록·전체 파일 크기/SHA-256. 업로드 시 정확한 artifact 검증 |
| Steam 반영 | 우선 setlive 빈 값으로 업로드, 새 BuildID 확인 후 본편 브랜치 반영·Steam 설치본 검수, 그 뒤 본편 재심사 요청 |
| 테스트 | 소스·target·실제 EXE 아티팩트·언어 지역 표기 총 9개 PASS / skipped 0. inline JS 구문 검사·`git diff --check` PASS |
| 현행 Windows 산출물 | `out/EXODUSER-full-20261002-194300/EXODUSER.exe`, builtAt 2026-10-02 19:42:01.887 KST, 공식 normal NW.js 0.111.2. 이전191200은 QA1002 저장→로비 Quit 확인으로 정상 종료, root PID30916/포트3350 없음 확인 후 새 root PID41312 실행. HTML/target/config/CSS/JS 6개 응답 SHA가 새 패키지·manifest와 일치 (`tmp/steam-main-resubmit-20261002/title-sizes/package-http-194300.json`). 기존 산출물 보존 |
| 현행 업로드 준비 | `output/steam_full_resubmit_20261002_194300/app_build_4749590.vdf` 및 Depot 4749591 VDF 생성. 6,833파일·8,681,244,249bytes 전부 아티팩트 SHA-256·크기와 대조, 민감 경로0, setlive 빈 값. 기존 안전한 SteamCMD 인증으로 19:43:47 App4749590(flags0x2)/Depot4749591 preview 시작 → 19:44:02 성공/exit0. `tmp/steam-main-resubmit-20261002/title-sizes/steamcmd-preview-194300-safe.log` 참조. 실제 업로드·새 BuildID 생성은 미실행. 이전191200 preview 19:26 KST 성공은 별도 이력 |
| 130000 프로그램적 검수 이력 | 실제 NW 내장 HTTP 서버의 HTML/target/config와 디스크 SHA 일치. 별도 headless Chrome `?test=1&slot=STEAM_FULL_QA`에서 `_DEMO_MODE=false`, Lv1, 7장/35스테이지 초기화, 강제 `nextStage()` 0→1, 실제 dbSave 서버 저장(stage1), 페이지 reload 복원(stage1). 정상 플레이·EXE 재실행 검수가 아님 |
| 130000 11/16/33 fallback 이력 | 프로그램적 `initStage` 호출로 세 맵 모두 200×200 필드 생성·G.map 존재 확인. 이 순간 적 0마리여서 해당 세 맵의 적 HP/전투 검증으로 확대 해석하지 않음. 전체 자연 진행 미검증 |
| 130000 실제 Windows 화면·마우스 검수 이력 | OFFICIAL / All Chapters · No Level Cap, 일반 Enter 및 캐릭터 생성 확인. Español (España)·Português (Brasil)를 실제 선택해 로비/게임 UI 반영 확인. 새 QA1002 생성, 전사 H.264 영상 및 Brazil 자막, 스토리 이미지·대사, CH1-1 진입, 마우스 공격·자원 차감·피격·사망·부활 확인. 전체 정상 전투/처치·자연 다음 스테이지 검수와 구분 |
| 130000 실제 종료·재실행 저장 검수 이력 | 마우스로 SP → Stats 상단 Settings → Game/System → Character Selection (Lobby) 이동하여 저장. QA1002 GET `ts=1790922814013`, Lv1/HP593/stage0 확인. 로비 Quit Game 확인창으로 정상 종료, 해당 패키지 프로세스가 사라짐 확인 후 같은 EXE 재실행. Brazil 언어·QA1002 슬롯 유지, 일반 Enter로 Lv1/HP593/stage0 게임 복원 확인. 사용자 dads 및 프로그램적 STEAM_FULL_QA 슬롯 보존 |
| 130000 오류 검수 이력 / 공통 미검증 | 프로그램적 실행 pageerror 0·로컬 HTTP 404 0. 외부 Google Fonts ACCESS_DENIED와 화면 이동 때 intro.mp4 ABORTED는 별도 headless 환경 결과. 실제 Windows 영상·주요 스토리 이미지·맵·HUD 표시 확인. 두 EXE의 JavaScript 콘솔 전체 오류 및 모든 에셋·전체 자연 진행은 미검증 |
| 현재 실제 차단점 | 초기 Computer Use 앱 권한 차단은 해소. 현재 Windows 입력 도구의 `press_key`가 trusted Escape 이벤트를 `key="Escape", code="", keyCode=27`로 보냄. 동일 공식 NW.js 0.111.2의 독립 `tmp/.../key-probe` 가시 진단으로 확인. 게임은 `e.code` 기준이므로 도구의 WASD·ESC 입력으로 정상 이동/스테이지 진행을 검증할 수 없음. 실제 물리 키보드 반응 확인 요청을 전달했으며 게임 결함으로 단정하지 않음. 근거 `native-key-probe.png/.txt`; 진단 앱은 정상 종료 |
| 130000 Steam 인증·파일 감사 이력 | 기존 안전한 SteamCMD 인증으로 App4749590/Depot4749591 preview 성공. 2026-10-02 15:33 KST 재해시: 포함 6,833파일/8,681,237,886bytes 전부 SHA-256·크기 일치, shipped 변경/누락/extra/private/symlink 0. QA 프로필·저장791파일 및 로그25파일 제외. `tmp/steam-main-resubmit-20261002/final-artifact-audit.json` 참조. 새191200 감사는 현행 업로드 준비 행 참조 |
| 현재 Steam | 실제 Steamworks 본편은 default 및 review-20260916 모두 기존 BuildID 25482996. 새 BuildID 없음, 브랜치 변경 없음, 설치본 검수/재심사 미접수. 데모 및 가격/출시 상태 변경 없음 |
| 194300 공통 제목판 수정 | 사용자 스킬 제목 스크린샷의 `HABILIDADES DE COMBATE` 넘침을 고치기 위해 S360/M520/L680px 세 폭을 도입. 설정·스킬·대장간·성장 제목의 실제 폰트 폭에 96px 여유를 더해 선택하며 패널 너비에 제한하고 최소16px·줄바꿈을 적용. 기사는 일반360px/중간280px로 고정, 금속판만 기존 button.webp의 9-slice로 늘림. 높이650px 이하에서는 기사 장식을 숨기고 제목판 유지. CSS/JS 캐시 `20261002-title-sizes`. 기존 부모 DOM·성장 AP 영역·인벤토리 통합 창고는 보존. 실제 storagePanel DOM은 없으며 selector는 CSS 호환 범위 |
| 194300 제목 레이아웃 검수 | 실제 두 HTML 변형×29언어×5크기×5제목 selector의 격리 렌더 fixture 1,450/1,450 PASS. 이전580건 넘침→0, JS오류0, 제목 리프 유지, 최소16px, viewport/scroll 넘침0. storagePanel 290건은 CSS-only fixture. 실제 번역 선택 S1,374/M76/L0. 별도 합성 긴 제목 주입 fixture30/30에서 L 자동선택·줄바꿈·범위 PASS이며 실제 번역/정상 게임플레이/Windows EXE 검수와 구분. 근거 `tmp/steam-main-resubmit-20261002/title-sizes/README.md`, `before.json`, `after.json`, `stress.json`. 새 패키지 대상 테스트9/9 PASS(skipped0), CSS SHA `af8ca3ffb45959f2632f25229afd89c8074570a1213ab3867ccd0699e12c2a50`, ui-panels.js SHA `c686558326944657abb2ab8fb7c5292f34cbccbab50d571ed1b93664e0eeb9f3`가 source/fixture/패키지/HTTP/manifest와 일치 |
| 191200 설정 제목 후속 수정·실행 검수 | 긴 Brazil 제목이 고정 140px 명패를 벗어나는 CSS 결함을 수정. 원본 기사 아트·명패와 글자 기하를 함께 맞추고 세 HTML CSS 캐시를 `20261002-settings-title-fit`로 갱신. 실제 게임 CSS 격리 화면 5크기×ptbr/es/de/ko=20/20 경계·가로 넘침 검사 PASS. 새 Windows EXE에서 일반 마우스 경로로 로비→QA1002→게임→설정 진입, CONFIGURAÇÕES가 명패 안에 표시되고 본문·하단 닫기 표시를 확인. 실제 설정 언어 선택으로 Español (España)의 AJUSTES도 확인. 증거 `tmp/steam-main-resubmit-20261002/settings-title/native-ptbr-191200.png/.json`, `native-es-191200.png/.json`. CSS SHA `6965b926e75d5ff51b15098b7dd23aa1553c9106ca3be565cdd4f50637c6ee35`가 소스·새패키지·manifest·업로드 감사·HTTP 모두 일치. 새 패키지 대상 테스트9 PASS/skipped0. 정상 이동·처치·자연 다음 스테이지·새 EXE 종료/재실행은 이번 후속 수정에서 재검수하지 않음 |
| 남은 필수 단계 | 실제 키보드 정상 이동·전투/다음 스테이지 검수 → 본편 업로드/새 BuildID·브랜치 대조 → Steam 설치본 검수 → 영문 노트와 본편 재심사 접수. 전체 자연 진행을 확인하지 못하면 명시. URL: `https://partner.steamgames.com/apps/builds/4749590`, `https://partner.steamgames.com/apps/landing/4749590` |

이 대장은 2026-09-23 웹/Steam 데모 고정 문서 중 **Steam 본편 패키지 계약**을 대체한다. 이전 실행/업로드 측정 기록은 당시 증거로 보존한다. ready:false인 맵의 field fallback 및 실제 HP 숫자는 런타임에서 판단하며 주석만으로 차단하지 않는다.
