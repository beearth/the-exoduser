# 2026-09-09 Steam 최신 작업본 배포

사용자 지시: “다 최신배포해”. 현재 `G:\exoduser` 작업본 전체를 Windows 기본 빌드 갱신 대상으로 승인했다. 기존 미커밋 작업을 포함하며 원본 작업을 되돌리지 않는다.

| 항목 | 확인 / 상태 |
|---|---|
| 소스 | `G:\exoduser`, 타이틀 상하 채움 커밋 `c7b54a3f` 포함 |
| 설치본 | `E:\steam\steamapps\common\EXODUSER HELL LORD`, 설치 manifest BuildID `24922778`, 2026-08-25 index.html |
| 배포 작업공간 | `G:\exoduser-steam`, App `4749590`, Windows Depot `4749591`, `content/windows` |
| 진단 한계 | 디스크 설치본이 구형이라는 사실만으로 사용자가 본 실행 화면까지 구형이라고 판단할 수 없음. 개발 서버와 패키지 서버가 모두 3333을 사용하므로 실제 실행 서버를 분리해 검증해야 함 |
| 빌드 누락 재현 | `test/runtimePackaging.test.js`: index.html이 참조하는 루트 JS/CSS 6개가 `build-nwjs.mjs`의 FILES에서 누락됨 |
| 패키징 보완 | 아래 6개 JS/CSS, 투사체 아틀라스/프리팹 목록, output의 실제 런타임 아트를 포함. FILES 복사 전 dirname 디렉터리 생성 |
| output 아트 | FILES: `output/imagegen/exoduser-hell-lord-logo-api-v1.png`, `enter-gothic-api-v1.png`(같은 폴더), `output/fdg_reference_1280x720.png`, `output/imagegen/forge-icon-sheet-v1.png`, `forge-icon-sheet-v3.png`(같은 폴더). DIRS: `output/imagegen/item-skins`, `forge-tabs-v3`, `forge-tabs-v4`(같은 폴더). v3는 원본 없는 레거시 폴백 경로로 복사 시 경고·스킵; 현행 6개 대장간 탭은 v4 사용 |
| 추가 누락 에셋 | `proj_atlas.png`, `prefabs/registry.json`을 FILES에 포함. 패키지 단독 시작 시 발생한 404 수정 |
| API 차이 보완 | `node-main.js`에 GET/POST `/api/mats` 추가. 개발 서버와 같은 정수 clamp로 `%APPDATA%/EXODUSER-HELL/saves/_sharedMats.json`에 보관. `/api/slots`는 `_` 접두 JSON을 제외 |
| 검증 격리 | 실제 배포 node-main.js의 포트 상수만 QA 로더에서 3349로 치환. APPDATA도 임시 테스트 폴더로 분리하여 개발 서버·사용자 세이브 접근 방지. 핸들러·미디어·페이지는 배포 패키지 그대로 |
| 배포 상태 | Steam 업로드 및 default 적용 완료. BuildID `25202408`, Windows Depot `4749591` manifest `5604079566035910679`. 사용자가 최종 확인창을 처리한 뒤 Steamworks 기본 브랜치와 공개 기록에서 확인. 이전 default `24922778`. Steamworks 표시 2026-09-08 23:52, 한국 시각 2026-09-09 15:52 |
| NW.js 음성 원인 | 기본 NW.js 0.111.2에서 v13 영상은 4초 이상 재생·error=null이나 AAC 디코딩 바이트=0·WebAudio peak=0. Chrome 검증만으로는 놓치는 실제 엔진 차이 |
| 코덱 수정 | 공식 NW.js 문서가 안내하는 nwjs-ffmpeg-prebuilt 0.111.2 Windows x64. `vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll`, SHA-256 `be2504fbca75c5e3282a79481b5188167b43292cb378ec093ae8ca203ef30500`. builder 시작 시 체크섬 검사, 패키징 마지막에 OUT/ffmpeg.dll 복사 |
| 음성 실측 | 동일 NW.js/Chromium 엔진 DLL 바이트 일치 확인. 교체 후 4.009842초 재생, AAC 65,491바이트 디코딩, WebAudio peak 0.34091514348983765, error=null. `output/steam_20260909/nw_media_probe.json` |
| 게임 smoke | 독립 QA 세이브에서 `?test=1&testchar=1` 신규 테스트 캐릭터 진입, stage asset requests 248, save API 정상, pageerror/console error/404/requestfailed 모두 0 |
| 후속 번역 작업 | 향후 의존성 누락 방지를 위해 `localization-runtime.js`, `localization-data.js`, `localization.css`, `localization/`를 builder에 등록. 별도 번역 작업의 미완료 변경은 이번 검증 패키지에서 제외. 재인증 대기 중 작업본 회귀는 40개 중 39개 PASS, 번역 커버리지 13,534개 누락으로 해당 후속 변경의 배포를 보류 |
| 업로드 차이 | SteamPipe 기준 파일 797개 추가(1.18 GB), 34개 변경(16.21 MB), 10개 제거(3.01 MB). 업로드 직전 기존 검증 패키지 5,850개 SHA-256 재대조 불일치 0 |
| 인증 유지 | `G:/exoduser-steam/builder/config/config.vdf`를 보존하고 다음 실행도 `+login shsia`만 사용. 암호·인증코드를 배포 명령에 넣지 않음. 계정 비밀번호 변경/세션 철회 등에 의한 서버 측 인증 만료까지 보장할 수는 없음 |
| 패키지 목록 | SteamPipe 제외 규칙 적용 후 5,850개 파일·5,944,762,551바이트. 파일별 SHA-256은 `output/steam_20260909/package_manifest.json`에 기록 |
| 단위 회귀 | 패키징·공유 악의·Range·인트로 player/subtitles/handoff 28개 PASS. 단위 테스트는 작업본의 후속 29언어도 포함하며 위 실제 패키지 브라우저 검증은 빌드 시점의 28언어 기준 |
| 검증 패키지 기준 | 전체 빌드 시점의 index.html/game.html/stat-panel-ui.js와 에셋을 고정하고, 이후 발견한 패키지 누락·node-main.js API/Range·ffmpeg.dll만 보완. 배포 도중 시작된 별도 번역 WIP는 이 검증 패키지에 아직 포함하지 않음 |
| 영상 탐색 | node-main.js가 Range를 무시해 78.041667초 컷 이동 실패 재현. 단일 `bytes=start-end`, `bytes=start-`, `bytes=-suffix`를 206/Content-Range로 응답하고 잘못된 구간은 416 처리. HEAD는 본문 없음, 연결 종료 시 스트림 해제. 일반 응답 Content-Length/Accept-Ranges, HTML no-cache/no-store 적용 |
| 인트로 회귀 | `tmp/verify_shipped_intro_20260909.py` PASS: 문→본편 BGM pause/seek 0, 100% VO/22% BGM, 정지·재개·믹스·컷 넘김·28언어 마지막 큐·로고·자연 종료·재진입·ESC 종료. pageerror 0. `output/steam_20260909/` 캡처에서 아이보리 명조 자막 직접 확인 |
| 로그인 진단 | 최초 cached login Access Denied → 사용자 비밀번호/모바일 Steam Guard 재인증 → 15:23 저장된 인증만으로 로그인 및 SteamPipe preview PASS. 뒤이은 실제 upload도 cached credentials 사용. 비밀번호/Guard 코드는 스크립트·문서·저장소에 보관하지 않음 |

| 파일 | 적용 기능 |
|---|---|
| `lobby-stage-info.js` | 로비 진행 정보 |
| `world-intro-player.js` | 세계관 v13 재생·음성/BGM 연속 재생·믹스 |
| `world-intro-subtitles-data.js` | 28언어 × 32큐 선택 자막 |
| `world-intro-subtitles.js` | 자막 트랙·언어·표시 제어 |
| `cin-enter-engraved.css` | 지옥문 입장 스타일 |
| `cin-logo-art.js` | 지옥문 로고 아트 |

검증 순서: 누락 검사 RED → FILES 보완 GREEN → 최신 작업본 패키징 → 개발 서버와 분리된 패키지 서버의 로비·게임·세이브 읽기·인트로 재생/자막/오디오 확인 → SteamPipe preview → upload → 기본 빌드 적용 확인. 기존 세이브·계정 데이터는 배포 대상이 아니다.
