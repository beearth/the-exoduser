> **2026-10-02 본편 패키지 계약 갱신:** 아래의 데모 고정/기존 포트/업로드 기록은 당시 판본의 이력이다. 현행 Steam 본편은 명시 full target·3350 포트·별도 저장/프로필로 빌드하며, 웹/데모 기본값과 데모 제한은 보존한다. 정확한 수치·구현·검수 단계는 `docs/13출시·마케팅/STEAM_FULL_RESUBMISSION_20261002.md`를 따른다.

# PC 패키징 기준 (2026-09-10)

## 2026-09-27 보석함 스타일 패키징 보완

| 항목 | 반영 |
|---|---|
| `build-nwjs.mjs` / `FILES` | 기존 `inventory-gems.css` 다음에 `inventory-gems-finish.css` 추가 |
| 사유 | `game.html`에서 참조하는 보석함 최종 스타일이 브라우저에만 존재하고 NW.js 복사 목록에서 누락된 문제 수정 |
| 검증 | 디스크 game.html 링크·FILES 목록·CSS 존재 확인. 실제 NW.js 빌드·CLI 패키징 테스트는 터미널 오류로 미실행 |

현재 프로젝트의 PC 패키징은 아래 실제 설정을 기준으로 한다.

> **2026-09-14 Steam Deck 시험본:** 별도 `tools/steamdeck-package.mjs`가 기존 Windows 실행 엔진과 현재 게임 데이터를 `out/EXODUSER-steamdeck-test-20260914-r2`에 독립 복사한다. 1280×800·중간 효과·60FPS 상한 및 작은 키캡 보정을 적용하며, 실제 Deck/Proton은 기기 부재로 미검증이다. 기존 일반 빌드 진입점·설정은 유지한다. [패키지·설정·검증 계약](STEAM_DECK_PREPARATION_20260914.md).

| 항목 | 현재 값 | 근거 파일 |
|---|---|---|
| 런타임 | NW.js 0.111.2, normal | `build-nwjs.mjs` |
| 빌드 도구 | nw-builder ^4.17.10 | `package.json` |
| 대상 | Windows x64 | `build-nwjs.mjs` |
| 게임 진입점 | `http://localhost:3333/index.html?demo=1` | `package.json`; Steam/NW.js 공개 데모 고정 |
| 내장 서버 | `node-main.js`, 포트 3333 | `package.json`, `node-main.js` |
| 빌드 실행 | `& "C:\nvm4w\nodejs\node.exe" build-nwjs.mjs` | `build-nwjs.mjs` |
| 스테이징 | `G:\exoduser\dist\` | `build-nwjs.mjs` |
| 출력 | `G:\exoduser\out\EXODUSER-win64\` | `build-nwjs.mjs` |
| 미디어 코덱 | `vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll`을 출력에 복사 | `build-nwjs.mjs` |
| 레벨업 연출 | `level-up-vfx.js`를 FILES에 포함 | `game.html`, `build-nwjs.mjs` |
| 2026-09-12 튜토리얼 | `parry-lesson.js/css`, `resource-practice.js`, `system-lesson.js/css`, `tutorial-badges.js/css`를 FILES에 포함 | 전투1단 → 자원2단 → 시스템 안내 및 배지. 자원 실습은 기본 자동 연결 |
| 추가 진입 파일 | `game-easy-test.html`, `game-guide.html` 포함. 기본 진입점은 기존 `index.html` 유지 | `build-nwjs.mjs` |
| 튜토리얼 아트 | `assets/ui/tutorial/`는 기존 assets 전체 복사에 포함 | `build-nwjs.mjs` |

### 2026-10-01 PM-002 로컬 통합 빌드 경로

| 항목 | 값 / 동작 | 적용 위치 |
|---|---|---|
| 별도 빌드 실행 | `C:\nvm4w\nodejs\node.exe build-nwjs.mjs --integration-id=YYYYMMDD-HHMMSS` | `build-nwjs.mjs` 인수 |
| 별도 스테이징 | `dist-integration-ID/` | 신설 경로만 허용, 이미 존재하면 중단 |
| 별도 출력 | `out/EXODUSER-integration-ID/` | 신설 경로만 허용, 기존 배포본·`userdata` 보존 |
| 검수 서버 | 패키지 복사본의 `node-main.js`만 3347 포트, `package.json`의 진입점·원격 허용 주소도 3347 | 현재 3333 개발 서버와 충돌 방지 |
| 검수 저장 | `./userdata-integration-ID`, `%APPDATA%/EXODUSER-INTEGRATION-ID/saves` | 데모 localStorage·설정과 서버 슬롯/재료를 기존 사용자 데이터와 분리 |
| 소스/산출물 기록 | `tools/integration-build-record.mjs before ID` → 빌드 → `after ID` | 전후 HEAD·Git 변경·주요 소스 SHA-256·복사 입력의 파일 크기/수정시각 목록 해시, 실제 `package.nw` 파일 트리·자산 분류별 파일 수/용량과 EXE·코덱 SHA-256을 `out/integration-records/`에 저장. `assets`·`img`·`sprites`·`bgm`·`sfx`·`video`·`localization`이 비면 실패 |
| 누락 파일 처리 | 별도 통합 빌드에서 `credits.html`과 `output/imagegen/forge-tabs-v3/`만 선택적; 나머지 명시된 `FILES`·`DIRS` 및 `node-main.js` 누락 시 실패 | 기존 기본 빌드의 경고 후 진행 동작은 유지 |
| 기본 실행 | 인수 없는 기존 `dist/`·`out/EXODUSER-win64/` | 기존 삭제/잠금 시 `package.nw` 교체 동작 유지. PM-002에는 사용 금지 |

로컬 통합 빌드는 `main` 커밋과 별도로 빌드 시점의 미커밋 파일을 포함한다. 산출물 표기에는 빌드 전후 변경 상태와 실제 파일 해시를 함께 기록한다. 검수 실행에서는 출력 폴더를 작업 디렉터리로 고정하고 별도 프로필·서버 저장 공간을 사용하여 기존 사용자 데이터를 보존한다. 결과 기록은 [통합·빌드팀 대장](INTEGRATION_BUILD_TEAM_MASTER.md)을 따른다.
| 웹·Steam 공개 데모 범위 | Lv.1 시작, Lv.100 상한, 1-1(`stage=0`) 클리어 후 종료 | 웹 기본 로비·`game.html` 직접 진입·`package.json` 모두 데모 고정 |

구형 패키징 경로·전용 설정·프록시 안내는 작업 지침, 기획 문서 및 과거 문서 사본에서 제거했다. 게임 코드와 빌드 결과물은 이번 문서 정리에서 변경하지 않았다.
GPU Compute 예제는 향후 설계이며 현재 패키지에서 구현·실측된 성능으로 해석하지 않는다.

Word 기획서 9개(원본 3개와 사본 6개), 문서 생성 스크립트 3개도 같은 기준으로 정리했다. Word 패키지 검증 3종 PASS, 문서 생성 스크립트 구문 검증 PASS.

2026-09-11 전달: 최신 통합본을 EXODUSER USB의 `I:/EXODUSER/EXODUSER.exe`로 제공한다. 루트 게임 실행 바로가기·상대경로 CMD 포함. 실제 NW.js 실행·영상 오디오·게임 진입과 전체7775파일 복사 검증은 [USB·웹 배포 기록](USB_WEB_RELEASE_20260910.md)을 따른다.

2026-09-12 최초 데이터 전달: `/Users/fordeargamers/EXODUSER-20260912-update/package.nw/`에 런타임 데이터 7,134개 파일(4,605,783,485 bytes)을 복사했다. 일반/자원/시스템 튜토리얼과 배지 검사 및 패키징 의존성 검사 통과. 기본 게임과 쉬운 테스트본을 함께 포함한다. `credits.html`, `output/imagegen/forge-tabs-v3`는 원본에 없어 기존 빌더의 선택적 누락 규칙을 적용했다. 이 최초 폴더에는 Windows 실행 엔진이 없었다. 이후 사용자가 NO NAME USB로 복사했으며 7,134개 파일의 존재·크기 및 상위 전달 파일을 확인했다.

2026-09-12 풀버전 보완: 사용자가 공식 `nwjs-v0.111.2-win-x64.zip`을 다운로드했다. ZIP CRC 검사 후 normal Windows x64 런타임을 추출하고 `nw.exe`를 `EXODUSER.exe`로 변경했다. `ffmpeg.dll`은 기존 검증된 AAC/H.264 코덱으로 교체했다.

| 항목 | 결과 |
|---|---|
| 로컬 완성본 | `/Users/fordeargamers/EXODUSER-20260912-full/` — 기존 게임 스냅샷과 실행 엔진 포함 |
| USB 추가분 | `/Users/fordeargamers/EXODUSER-실행파일추가/`의 내용 전체를 USB 기존 `EXODUSER-20260912-update/` 안에 합침. 게임 데이터 재복사 불필요 |
| 실행 | `EXODUSER.exe` 또는 작업 폴더를 고정하는 `START-EXODUSER.cmd` |
| 검증 | 게임 7,134개 및 런타임 manifest 478개 SHA-256 일치, PE x64 헤더, package.json 진입점·내장 서버, 코덱 SHA-256 통과 |
| 한계 | Windows 실제 실행은 맥에서 미검증. USB 실행 파일 추가 복사는 사용자 진행 대기 |

후속 확인: USB 게임·런타임 manifest 7,612개 파일 존재·크기 검사 통과. 이후 `20260912-movement1`(WASD 첫 실습, 전체 실습 이동 허용)을 로컬 full/update에 반영하고 게임 manifest를 갱신했다. `/Users/fordeargamers/EXODUSER-이동패치/`의 5개 파일을 USB 기존 `package.nw/` **안에** 대치해야 이 후속 수정이 적용된다. 이 이동 패치는 USB·GitHub에 아직 반영되지 않았다.

## 2026-09-29 퍼블리셔 검토용 독립 사본

스마일게이트·카카오에 전달할 검토 사본은 [제출 자료 및 검수 기록](PUBLISHER_REVIEW_20260929.md)을 따른다. 기존 공개 패키지의 3333 계약을 변경하지 않고 복사본에서 포트·프로필·저장 경로를 분리했다.

| 항목 | 검토 사본 |
|---|---|
| 실행 엔진 | NW.js 0.111.2 normal, Windows x64 및 기존 검증된 H.264/AAC 코덱 |
| 진입점 / 서버 | `http://localhost:3337/index.html?demo=1` / 복사본 `node-main.js`, 포트 3337 |
| Chromium 프로필 | `userdata-publisher-20260929` |
| 서버 저장 폴더 | `%APPDATA%/EXODUSER-PUBLISHER-20260929/saves` |
| 공개 데모 진행 저장 | `hellsave_demo` localStorage. 프로필 폴더를 보존해야 진행 유지 |
| 플레이 범위 | 대검전사 Lv.1 시작, Lv.100 상한, CH1-1 클리어 후 데모 종료 |
| 출력 | `output/applications/publisher-20260929/EXODUSER_DEMO_WIN64_20260929/` |
| 전달 ZIP | `02_EXODUSER_DEMO_WIN64_20260929.zip`, 6,737,897,304바이트, 6,589파일 |
| 압축 해제 크기 | 7,219,729,579바이트 |
| 기획서 | 최신 로컬 한국어 PDF 17페이지. 일반 조작 소개 대신 기동게이지·패링 연계와 스피디한 전투 리듬 설명. 탄막 패링·사슬기동·전격이동 설명과 신캐릭터 원화·제작 상태 및 개발자 소개 포함. Drive 사본 갱신은 별도 |
| 검수 | 실제 NW 타이틀·로비·데모 진입·저장 복원, 별도 Chrome에서 전달 파일의 이동·공격·인벤토리·저장 검수, 전체 원본 SHA256 및 ZIP CRC 통과 |
| 미완료 검수 | 보스까지 긴 플레이·모든 스킬·전체 기기 사양 QA. 기존 문자열 순서 테스트 1건은 실패 상태로 기록 |

개인 프로필·세이브·검수 코드·제작용 중간 원화와 영상 입력을 ZIP에서 제외했다. 신규 캐릭터가 모두 플레이 가능한 구현 완료본이라고 표시하지 않는다. Drive 업로드와 권한·메일 발송 상태는 위 제출 기록에서 확인한다.

## 2026-09-29 바탕화면 최신 테스트 사본

사용자 직접 시험용 최신 소스 사본은 [바탕화면 빌드·검증 기록](DESKTOP_LATEST_BUILD_20260929.md)을 따른다. 이 사본의 내장 서버는 3341이며 사용자 후속 지시에 따라 전체화면(`fullscreen:true`)으로 시작한다. 창 모드 기본 크기는 1600×900이고 전용 프로필 `userdata-desktop-20260929`와 서버 저장 폴더 `%APPDATA%/EXODUSER-DESKTOP-20260929/saves`를 사용한다. 일반 3333·퍼블리셔 3337 계약과 구분되는 테스트 사본이다.

2026-09-29 오전 10시 후속 퍼블리셔 전달본도 EXODUSER.exe 시작 설정을 `window.fullscreen:true`로 고정한다. 기존 퍼블리셔 패키징 헬퍼의 창 모드 덮어쓰기를 새 사본에서는 true로 바꿔 생성하며, 실제 외부 전달 완료 여부는 [최신 빌드 전달 기록](PUBLISHER_LATEST_BUILD_DELIVERY_20260929.md)을 따른다.
