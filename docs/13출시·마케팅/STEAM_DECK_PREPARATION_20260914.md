# Steam Deck 준비 — 2026-09-14

사용자 승인: 현재 패드 지원을 바탕으로 Steam Deck 준비를 진행한다. **사용자는 Steam Deck 기기가 없다.** 이번 결과는 PC에서 만든 Proton 시험용 패키지이며, Deck 구동·FPS·Verified/Playable 판정이 아니다.

## 패키지

| 항목 | 현재 값 / 계약 |
|---|---|
| 도구 | `tools/steamdeck-package.mjs` |
| 실행 | `& 'C:/nvm4w/nodejs/node.exe' tools/steamdeck-package.mjs [새 출력 폴더]` |
| 기본 출력 | `out/EXODUSER-steamdeck-test-20260914-r2` |
| 실행 파일 | 위 폴더의 `EXODUSER.exe`; 전체 폴더를 함께 이동 |
| 대상 | 기존 NW.js 0.111.2 Windows x64 실행 엔진을 Proton으로 시험 |
| 실행 엔진 입력 | `out/EXODUSER-win64`; 실행 관련 파일 및 `locales`·`Dictionaries`만 복사 |
| 게임 소스 | 현재 작업 폴더의 `build-nwjs.mjs` FILES/DIRS 목록과 루트 `lang_*.js`·`atlas_*`; 새 미추적 에셋도 포함 |
| 복사 | 하드링크가 아닌 독립 복사. 원본 게임·일반 Windows 빌드·사용자 세이브를 수정하지 않음 |
| 보호 | 기존 출력 폴더 재사용·덮어쓰기 거부, 작업 폴더 외 출력 거부, 입력 심볼릭 링크 거부 |
| 제외 | 브라우저 userdata·Git·node_modules·backup(s) 폴더 및 `.bak`, `.bak.*`, `.old`, `.tmp`, `.log`, `.zip`, `.blend`, `.psd`, `.kra`, `.pyc` |
| 선택적 누락 | 기존 PC 패키징과 동일하게 없는 `credits.html` 및 DIRS 경로를 manifest에 기록. 다른 FILES 누락은 실패 |
| 코덱 | `vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll`; SHA-256 `be2504fbca75c5e3282a79481b5188167b43292cb378ec093ae8ca203ef30500` 검증 |
| 진입점 | `http://localhost:3333/deck-start.html` → `deck-bootstrap.js` → `index.html` |
| 창 | 1280×800 요청, 전체화면, 최소 1280×720. 전체화면 실제 크기는 실행 디스플레이에 따름 |
| 설정 저장 | `userdata-deck` 브라우저 프로필, origin별 `hellcave_settings` |
| 세이브 | 기존 `node-main.js`의 `%APPDATA%/EXODUSER-HELL/saves`; Deck에서는 Proton prefix 내부 |
| 검증 파일 | 패키지의 `package-manifest.json`, `STEAM_DECK_README.txt` |
| 최종 파일/크기 | 7,739파일 / 6,323,467,998 bytes (약6.32GB). 런타임477·소스7256·생성/안내6파일 |
| 배포 상태 | 로컬 시험 파일 준비. Steam 업로드·Linux 네이티브 빌드·Proton 실행 없음 |

## 첫 실행 설정

`hellcave_settings` 키가 **없을 때만** 아래 값을 저장한다. 기존 설정은 손상된 JSON까지 원문 그대로 보존하고 게임의 기존 복구 흐름에 맡긴다. `hellLang`·키 바인딩·진행 세이브를 변경하지 않는다.

| 항목 | 값 |
|---|---|
| FPS 제한 | `fpsCap=60` — 성능 보장 수치가 아닌 시험 상한 |
| 렌더 해상도 | `resScale=100`, `ssaa=1` |
| FPS 표시 | `showFps=true` |
| 그래픽 | 기존 `_GFX_PRESETS[2]` 중간 효과 설정과 일치 |
| 켜짐 | `trail`, `slash`, `postfx`, `deathFx`, `lighting`, `torch`, `fog` |
| 꺼짐 | `bloom`, `ambPart`, `grain` |
| 파티클 | `parts=20` |
| 난이도 마이그레이션 | `diffV2=1`. 새 설정이 구버전으로 오인되어 기본 `diff=5`에 +5가 붙는 것을 방지. `diff` 자체는 설정하지 않음 |
| 기타 옵션 | 기존 기본값 유지. GPU 자동 감지는 실행되지만 저장된 설정은 덮어쓰지 않는 기존 계약 사용 |

## 작은 화면의 패드 키캡

게임 소스 대신 **패키지 안의** `game.html`, `game-easy-test.html`에 `deck-handheld.css` 링크를 추가한다. 복사 manifest 해시는 이 파생 HTML의 실제 바이트를 기록한다.

| 항목 | 변경 전 | Deck 시험 패키지 |
|---|---|---|
| 조건 | 기존 공통 스타일 | 화면 폭 1366px 이하 |
| 대상 | `#skKeyBar > div` | 동일 리프 키캡 |
| 레이아웃 글꼴 | 8px | Arial/sans-serif 15px, `!important` |
| 1280×800 실효 글꼴 크기 | 약 4.8px | 약 9px (HUD 배율 약 0.60 적용) |
| 키캡 폭·높이 | 37×18px | 유지, `LT+A` 등 조합 라벨 폭 검사 |
| 1920×1080 | 기존 8px 레이아웃 글꼴 | 유지 |
| 입력·스킬·HUD 이미지 | 기존 | 변경 없음 |

이는 CSS 글꼴 크기와 슬롯 내 수용 검사다. 실제 글리프 높이·시인성·전체 UI에 대한 Valve 인증 통과로 해석하지 않는다. 튜토리얼에는 아직 WASD 등 키보드 안내가 남아 있어 패드 안내 전환 작업이 필요하다.

## 이미지·메모리 조사

| 근거 | 결과 / 해석 |
|---|---|
| 에셋 헤더 조사 | 디렉터리 및 루트 아틀라스 7,247파일, 5,809,601,754 bytes. 이미지 4,849개, 이미지 파일 합계 약 2.20GiB |
| 8192×8192 제작 원본 | RGBA 한 장당 256MiB 추정. 상위 5개 MASTER 파일은 이번 게임 진입의 이미지 로드 목록에서 관측되지 않음 |
| CH1 방향별 걷기 | 8192×1280 아틀라스 8장 로드 관측. RGBA 기준 장당 40MiB, 합계 320MiB 추정 |
| 파일 크기와 픽셀 크기 | 예: east 아틀라스 파일 1,972,388 bytes → RGBA 추정 41,943,040 bytes. PNG 압축률만 높여도 이 픽셀 추정량은 줄지 않음 |
| 신규 Image 로드 관측 | URL 쿼리 제거 후 548경로, 픽셀×4 합계 약 2,103.8MiB |
| 추정의 한계 | 브라우저 실제 RSS·GPU VRAM 상주량이 아님. 해제/업로드/캐시 중복·다른 캔버스·영상 메모리를 포함한 실측이 필요 |
| 기타 용량 | 조사 범위 WAV 45개 1,752,035,868 bytes, MP4 34개 670,524,976 bytes. 설치 크기는 이미지뿐 아니라 음성·영상·제작 자료의 영향도 큼 |
| 깨진 후보 | `assets/vfx/boss/gen/lava_v3.png` 헤더 식별 실패. 이번 실행에서 요청 실패는 관측되지 않음. 생성 중간 산출물인지 후속 확인 필요 |
| 보존 | 이미지 일괄 축소·재압축·아틀라스 좌표 변경 없음. 맵 텍스처 수명 및 기존 성능 LOCK 영역 변경 없음 |

우선순위: (1) 작은 화면의 글씨·패드 안내, (2) 장/스킬별 필요 이미지 지연 로드와 아틀라스 메모리 조사, (3) 실제 Deck의 군집 전투 CPU/GPU 프레임 시간, (4) 배포에 불필요한 제작 파일 및 음원 용량. 최대 병목은 Deck 실측 전 확정하지 않는다.

## 검증과 남은 작업

| 확인 | 범위 |
|---|---|
| 자동 검사 | 패키지·설정 보존·난이도 마이그레이션·작은 키캡·기존 런타임 의존성 8건 PASS |
| PC 실행 | Windows Chrome / AMD Radeon RX 9070 XT / WebGL2 / 1280×800. Deck 성능 추정에 사용하지 않음 |
| 내장 서버 | 패키지 `node-main.js`를 QA에서 포트만 3341/3342로 바꾸고 임시 APPDATA로 실행. 일반 서버3333·개인 세이브 유지 |
| 저장 | 격리된 테스트 슬롯 저장·불러오기 |
| 로비 | 실제 패키지 초기 진입·첫 설정 저장·타이틀 영상 메타데이터/시간 진행 |
| 게임 | 패키지 test 캐릭터 진입, 설정 유지, 기본 난이도5, 모의 표준 Gamepad API의 실제 polling |
| 패드 | 13개 키캡 표시·스틱 이동·D-pad 인벤토리 열기, 인벤토리1280×800 경계 |
| 최종 런타임 | 위 항목 PASS, 페이지 오류0·관측한 로컬 HTTP 오류0. 새 테스트 게임 부팅 약8.05초 (해당 PC/캐시 조건) |
| 파일 검증 | PE x64 헤더, EXE·NW DLL·코덱·두 게임 HTML·내장 서버·불꽃칼날 에셋 SHA-256 7개 PASS. 개인 브라우저 프로필 미포함 |
| 증거 | `output/steamdeck_20260914/asset-audit.json`, 원본 `runtime-audit.json`, `r2/runtime-audit.json`, 화면 PNG |
| 미검증 | 실제 NW.exe 창 실행, Steam Input 장치, SteamOS/Proton, Deck FPS·VRAM·배터리·오디오 코덱·절전 복귀·모든 메뉴의 패드 완주 |

기기 확보 후 폴더 전체를 복사하고, Steam 데스크톱 모드에서 EXE를 비 Steam 게임으로 등록한다. 호환성에서 Proton을 선택하고 시작 폴더를 패키지 폴더로 지정한다. Gaming Mode에서 전투·모든 메뉴·저장·영상/소리·절전 복귀를 확인한다. 정확한 OS/Proton 버전을 기록한다.

공식 기준: [Steamworks 호환성 검토](https://partner.steamgames.com/doc/steamhardware/compat). 1280×800 권장, 화면 글자 높이 최소9px/권장12px, 기본 설정의 플레이 가능한 프레임 및 패드 전 과정 조작·적절한 버튼 안내가 요구된다. 공식 등급은 별도 Valve 검토 결과이며 자동 획득이 아니다.
