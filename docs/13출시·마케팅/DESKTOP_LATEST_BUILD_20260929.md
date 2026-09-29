# 2026-09-29 바탕화면 최신 테스트 빌드

사용자가 직접 나중에 시험하기 위해 바탕화면에 실행 가능한 최신 빌드를 요청했다. 기존 개발·퍼블리셔 출력과 분리하여 현재 작업 트리의 소스를 복사했다.

| 항목 | 바탕화면 테스트 사본 계약 |
|---|---|
| 소스 기준 | 2026-09-29 09:44:41 한국 시간에 스냅샷 완료. `cf2f8411dd10afdb9a3a6b4a491e446e2a80958e` + 당시 미커밋 변경 포함 |
| 준비 폴더 | `G:/exoduser/output/applications/desktop-test-20260929-0940/EXODUSER_최신빌드_20260929/` |
| 바탕화면 대상 | `C:/Users/심도진/Desktop/EXODUSER_최신빌드_20260929/` |
| 바탕화면 복사 상태 | 2026-09-29 09:49:27 한국 시간에 복사·전체 파일 검증 완료. 10:00:01에 전체화면 시작 설정 적용·변경 파일 검증 완료 |
| 실행 | 폴더 안 `START_EXODUSER.cmd` 또는 `EXODUSER.exe` |
| 런타임 | NW.js 0.111.2 normal / Windows x64. 기존 검증된 엔진을 독립 복사 |
| 코덱 | `vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll`; SHA-256 `be2504fbca75c5e3282a79481b5188167b43292cb378ec093ae8ca203ef30500` |
| 진입점 / 서버 | `http://localhost:3341/index.html?demo=1` / 사본의 `node-main.js`, 포트 3341 |
| 초기 창 | 전체화면 시작, `fullscreen:true`. 창 모드 기본 크기는 1600×900. F11 또는 설정의 전체화면 버튼으로 전환 |
| FPS 설정 | 게임의 기존 설정 그대로 복사. FPS 상한을 이번 패키징에서 강제하지 않음 |
| Chromium 프로필 | `userdata-desktop-20260929` |
| 서버 저장 폴더 | `%APPDATA%/EXODUSER-DESKTOP-20260929/saves` |
| 공개 데모 진행·설정 | 전용 Chromium 프로필의 localStorage. 진행을 유지하려면 프로필 폴더 보존 |
| 개인 데이터 | 기존 사용자 프로필·세이브·OAuth 로그·토큰 미포함 |
| 구성 | 소스 6,121개 + 런타임 475개 + 생성 메타데이터·실행 안내 4개 = 6,600개 파일 |
| 전체 크기 | 전체화면 설정·안내 갱신 후 7,322,975,929바이트 |
| 선택적 누락 | 기존 빌더가 허용하는 원본 미존재 항목 `credits.html`, `output/imagegen/forge-tabs-v3` |
| 빌드 이력 | 폴더 안 `BUILD_INFO.txt`; 전체 SHA-256은 준비 폴더 상위의 `build-manifest.json` |

## 검증 기록

| 검사 | 결과 |
|---|---|
| 준비본 파일 | 6,600개 전체 크기·SHA-256 일치 |
| 아키텍처·미디어 | EXODUSER.exe PE x64 헤더와 H.264/AAC 코덱 SHA-256 확인 |
| 소스 변화 | 복사 전후 입력 SHA-256 비교, 스냅샷 종료 전 선택된 전체 소스 재검사 |
| 로딩 회귀 | `resourceLoading.test.js`, `mapStartupReady.test.js`, `renderSettingsRestore.test.js`: 47/47 통과 |
| 실제 내장 서버 | 사본 `node-main.js`를 포트 3341 및 작업 폴더 안 임시 APPDATA로 실행한 뒤 검증. 종료한 프로세스는 이번 검사를 위해 생성한 자식 프로세스 하나뿐 |
| 정적 의존성 | 로비·게임·쉬운 테스트 진입점, three-runtime.js·GLTFLoader.js·three.min.js HTTP 200 및 응답 SHA-256 일치 |
| 최신 맵·영상 | CH1 production_finish chunk_0_0.png 및 bg_scene1_loop.mp4: HTTP 206 범위 응답과 원본 바이트 일치 |
| 저장 API | 빈 슬롯·초기 악의 확인 후 임시 경로에서 저장/불러오기·악의 저장 왕복 통과 |
| 바탕화면 사본 | 최초 복사 6,600개 크기·SHA-256 일치. 전체화면 후속 변경 3개 파일도 갱신 manifest와 크기·SHA-256 일치 |
| 전체화면 후속 변경 | package.nw/package.json의 window.fullscreen을 false→true로 변경. README_KO.txt·BUILD_INFO.txt 안내도 동기화. 준비본·바탕화면 사본 동일 설정 확인 |
| 백업 | 변경 전 3개 파일을 tmp/desktop-test-20260929/fullscreen-stage/before/에 보존 |
| 플레이 성능 | 이 새 사본의 NW.js 화면 플레이·FPS 실측은 미실행. 사용자가 이후 직접 시험할 빌드이며, 프레임 드랍 해결을 검증한 것으로 보고하지 않음 |

빌드 준비와 검증 스크립트는 `tmp/desktop-test-20260929/`에 있다. 일반 `build-nwjs.mjs`를 실행하지 않았으므로 공유 `dist/`, 일반 `out/EXODUSER-win64/`, 기존 퍼블리셔 사본은 이번 작업 대상이 아니다. 바탕화면 복사는 새 대상 폴더만 생성하며 기존 파일을 덮어쓰거나 삭제하지 않는다.

최초 바탕화면 복사에서는 게임 원본·Git 인덱스·커밋·외부 전달 파일·이메일·예약 전달 자동화를 변경하지 않았다.

최초 바탕화면 복사 이후 사용자 "시작하면 전체화면으로 시작하게해 exe" 지시에 따라 위 설정을 바꿨다. 기존 일반 소스 package.json은 이미 fullscreen:true이며, 10시 퍼블리셔 전달 예약에도 최종 패키지가 fullscreen:true를 유지하도록 명시했다. 이 후속 변경에서 전체화면 NW 창을 새로 실행하여 화면을 확인하지는 않았으며, 디스크 실행 설정과 변경 파일 해시를 검증했다.
