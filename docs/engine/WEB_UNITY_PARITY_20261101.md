# 웹·Unity 현행 화면 정렬 조사 — 2026-11-01

## 범위와 기준

웹은 H5의 2.5D 전투·UI 흐름을, Unity는 별도 3D 게임을 유지한다. 이번 단위는 웹 실행 경로와 최신 승인 화면 자료의 연결을 확인했다. 전투·저장·맵·Unity 소스, 사용자 실행본, 공개 배포는 변경하지 않았다. 웹 소스 기준은 `origin/main` `108980fb5fafc7bebe2c16ae6f0d420e80d6a36f`, Unity 비교 기준은 `origin/unity/main` `f60d89b5cea8d35599c91c85c20bcdd6d2e593aa`다.

| 대상 | 실제 확인 | 판정 |
|---|---|---|
| 웹 최신 소스 | `I:/exoduser-wt/codex-design`의 위 main 기준 `index.html` SHA-256 `71a0eb4fd642ff829533e5afb787cffd76574006389a02a1dcf1de79963592b4`; `game.html` 및 `loading-art.js/css` 포함 | 승인 로고와 35장 로딩 참조가 이미 연결됨 |
| 기존 로컬 웹 | `http://127.0.0.1:3333/index.html` 응답 SHA-256 `17b76e074c4b0df9fdc5e9550b721148ff32b27a7a6b7d9c1072f9a2c8557c88`, 353,509바이트. `G:/exoduser/index.html`과 byte 동일. `game.html`도 양쪽 4,209,609바이트. Node PID 40532는 `server.cjs` 실행 중 | G:의 오래된 작업본을 서빙하며 새 로고·35장 로딩 캐시 참조 없음. 실행 중 서버는 보존 |
| 승인 로고 | `img/logo_exoduser_solid.png` Git blob `af6501bd78ebd8d3e5c5fde3c10e12b07d01b492`, SHA-256 `167e8465a0aec6fa5e8cd90131f203a86a27dccca2aa913a317cffe93c7d413d`. 승인 커밋 `7dc96cd`와 현행 main의 blob 동일. `index.html` 10곳, `game.html` 1곳 참조 | 누락 아님. G: 작업본에는 이 파일이 없음 |
| 로딩·타이틀 | 현행 `index.html`이 `loading-art.js/css?v=20261031-final35` 참조. [35장 로딩 정본](../1전체그래픽세팅/LOADING_ULTRAWIDE_20261031.md)의 웹 반영·패키지 검수 인수. 현행 타이틀은 붉은 태양 배경·승인 로고·메뉴 | 웹 소스 반영 확인. 전체 자연 플레이·Unity 적용과 별개 |
| NW.js 전체/데모 | `package.json`의 현재 버전 0.7.9. `node-main.js`는 target별 `release-config.json`과 자체 포트 3350/3351을 사용하고 `nw-boot.html`에서 해당 서버의 `index.html`로 이동. `build-nwjs.mjs`는 로딩 JS/CSS를 포함 | 이 조사에서 새 패키지 생성·사용자 설치본 교체 없음. 3333과 별도 실행 경로 |
| 공개 웹 | `https://the-exoduser.vercel.app/index.html` 조회는 HTTP 402. 과거 [웹 배포 문서](../13출시·마케팅/LATEST_WEB_RELEASE_20260910.md)의 2026-09-23 시점 배포 기록은 현행 공개 페이지의 소스 증거가 아님 | 공개 버전 확인·갱신 미완료 |
| Unity | Unity main의 `title_logo.png` blob `8fb6f41b4549ce0baffb37dc9664c0e240d3ab71`, `loading_logo.png` blob `fa70eec989a79cec36a0d1ef38994d3d202b5505`는 웹 승인 PNG와 byte가 다름 | 별도 렌더링·가공 에셋이다. 동일 화면/최신 35장 적용으로 판정하지 않음 |

## 격리 검수

기존 3333 서버와 사용자 세이브를 건드리지 않고 I: 소스의 `server.cjs`를 포트 3448, 별도 `EXODUSER_SAVE_DIR`로 잠시 실행한 뒤 종료했다. `index.html`, `game.html`, 승인 PNG, 로딩 JS/CSS, `img/lording/wide/manifest.json`은 모두 HTTP 200이었다. 무창·무음 Chromium 1600×900에서 기존 3333은 회색 구 타이틀, I: 소스는 붉은 태양·흑철 승인 로고·메뉴로 나타났다. 기존/최신 화면은 각각 `I:/EXODUSER-Storage/design/web-unity-parity-20261101/stale-title-1600x900.png`와 `current-title-1600x900.png`, HTTP·DOM 기록은 같은 폴더의 `title-receipt.json`이다. 이 1개 해상도 캡처는 전체 UI·로딩35장·자연 플레이의 시각 판정이 아니다.

## 게임 계약 비교와 적용 상태

| 계약 | 웹 main 108980fb | Unity main f60d89b | 이번 반영 |
|---|---|---|---|
| 게임 내용·맵 | `index.html`→`game.html`의 데모 진입과 CH1 본편 코드·웹 아트/로딩35장 | 별도 3D 런타임과 CH1 이식. [Unity 이식 보드](UNITY_PORT_MASTER_20261026.md)는 전체 웹 게임의 이식 완료를 주장하지 않음 | 웹 원본 게임 내용 변경0. Unity 후보를 main에 역이식하지 않음 |
| 입력·전투 | `game.html`의 키·스킬·Q/E 판정이 원본 계약 | Unity 입력과 전투는 별도 Core/Player 소비. 이 조사에서 동일 입력·자연 전투 재현을 측정하지 않음 | 키·패링·피해·자원 수치 변경0, 기능 동등 판정 보류 |
| 수치·아이템 | 웹 `game.html`과 해당 시스템 docs가 기준 | Unity 단계별 일부 이식. 웹 전체 콘텐츠/수치 채택 여부는 기능별 인수 대상 | 새 밸런스·경제·아이템 이식0 |
| 저장·플랫폼 | 브라우저 demo 기본, `server.cjs`의 `EXODUSER_SAVE_DIR`와 NW.js target별 namespace가 실행 경로에 따라 다름 | Unity Player의 별도 저장 경로·세이브 호환 검수 필요 | 사용자 저장 데이터 이관·쓰기0. 격리 검수의 빈 저장 폴더만 사용 |

## 정적 웹 산출물 준비 상태

`vercel.json`은 `node tools/build-web.mjs`→`web-dist`를 공식 빌드로 지정한다. `selectWebRuntimeFiles`로 최신 작업본을 사전 계산한 결과는 **3,134파일·4,829,417,882바이트**다. 승인 로고, `loading-art.js/css`, `img/lording/wide/`의 manifest 포함 106파일(이미지 105장)이 선택됐다. 전체 선택 경로·크기와 핵심 6파일 SHA-256은 `I:/EXODUSER-Storage/design/web-unity-parity-20261101/web-selection-manifest.json`에 기록했다. 이 JSON은 **복사 전 선택 목록**이며 `web-dist`나 실제 배포 artifact가 아니다. 웹 원본은 원격 main에서 재현 가능하다.

실행 중인 PC Unity Player PID 42820과 작업 지시의 대형 빌드 금지 경계 때문에 4.83GB 전체 복사는 시작하지 않았다. `tools/build-web.mjs`는 기존 출력 폴더를 덮어쓰지 않으며, exFAT 작업본은 hardlink가 지원되지 않아 전체 파일 복사가 필요하다. 현재 선택 목록은 [Vercel 업로드 검사](../../tools/check-vercel-output.mjs)의 4,000,000,000바이트 상한을 **829,417,882바이트 초과**하고 `video/world_intro_v22b_steam.mp4` 102,204,634바이트가 단일 파일 100,000,000바이트 상한도 넘는다. NFC 중복 10파일을 모두 제거하더라도 절감 상한은 32,669,676바이트이므로 총량 초과는 해소되지 않는다. 이 상태에서 4.83GB를 복사해도 공식 배포 검사를 통과할 수 없다. 사용 중인 WAV와 인트로 영상을 임의로 빼거나 재인코딩하지 않았다. 런타임 참조·청취·영상 동등성을 지키는 별도 최적화와 검수 후 고유 출력 경로에서 공식 빌드·해시·HTTP 검증을 해야 배포 가능 산출물로 승격한다. 현재 3333 서버·DEMO/EA 패키지·Vercel 프로젝트 설정은 그대로다.

`.github/workflows/deploy.yml`은 main의 `docs/**`·`**/*.md`만 변경한 push를 무시한다. 2026-10-02 [배포 복구 기록](../13출시·마케팅/WEB_DEPLOYMENT_REPAIR_20261002.md)에 따르면 기존 Git 기본 연결은 해제했고 `the-exoduser`의 Actions 경로가 정본이다. 이번 문서 반영은 실제 웹 배포를 시작하지 않는다. 공개 서비스 HTTP 402와 계정/프로젝트 재개는 별도 hosting owner의 확인 대상이다.

## 다음 반영 경계

### 배포 선택기 후보 — main 미반영

`codex/h5-web-delivery-20261101`은 웹의 옛 프롤로그 PNG15장과 CH1 제작 베이스/백업 PNG3장만 배포 선택에서 제외한다. 실제 코드/JSON/CSS 참조를 대조하고 신규 정확 참조가 생기면 포함하도록 보호했다. **3,134개·4,829,417,882바이트 → 3,116개·4,692,963,299바이트**이며 제외18개·136,454,583바이트, 추가0이다. 승인 로고·로딩 105장+manifest·현행 컷신/맵 청크·음악77·sfx346·언어27을 유지한다. 경로별 결과는 `I:/EXODUSER-Storage/design/web-unity-parity-20261101/candidate-selection-manifest.json`, 상세 근거는 [배포 복구 문서](../13출시·마케팅/WEB_DEPLOYMENT_REPAIR_20261002.md)를 따른다. 4GB 총량과 100MB 단일 영상 검사는 아직 실패한다. 실제 `web-dist`·HTTP·배포와 사용자 3333은 변경되지 않았다.

웹 소스 자체에는 이번 범위의 로고/로딩 누락이 없으므로 중복 수정하지 않는다. 사용자가 실제로 여는 웹을 최신화하려면 **해당 실행 경로**를 최신 main에서 안전하게 다시 만들고 동일 바이너리/정적 산출물의 화면·저장 격리·배포 해시를 검수해야 한다. G: 사용자 서버 자동 재시작, DEMO/EA 사본 덮어쓰기, Steam·공개 웹 배포, Unity 후보를 웹에 일괄 이식하는 작업은 이번 조사에서 수행하지 않았다. Unity의 별도 로딩·HUD 후보는 해당 owner의 인수/1x/Player 검수 뒤 비교한다.


## 2026-11-01 JSON 아트 의존성 후보 마감 — main 미반영

기존 담당의 `tools/web-runtime-manifest.mjs`·`test/webDeployment.test.js` 미마감 변경을 보존·검토한 뒤, CTO가 누락된 manifest 제작원본 차단 검증만 보완했다. 새 작업본·작성 프로세스는 만들지 않았으며 원본 게임·음악·영상·그림 byte는 변경하지 않았다. 기준 원격 후보는 `273c662c0233ecb47064bb309fad667cb8285ea9`, 공통 main은 `2285643604486c5bfd9615ef7deb318c84845931`이다.

| 항목 | 후보의 정확한 동작·검증 범위 |
|---|---|
| 로딩 의존성 | 선택된 `img/lording/wide/manifest.json`의 원본35장과 확장판105개를 필수로 포함한다. `img/lording/`의 broad prefix만으로 선택된 비선언21파일은 제외하며, 새 정확 코드 참조가 있으면 포함한다. 실제 소비의 rd6는 PNG이며 구 WEBP는 현재 manifest·소비 목록에 없다. |
| 전체 화면 의존성 | `assets/fullscreen-wide/20261031/manifest.json`에 선언된 source와 outputs를 읽는다. 원본64종·확장판128개를 유지한다. 해당 등록 이미지가 실제 사용되므로 숫자를 맞추기 위해 제외하지 않는다. |
| 누락·모호성 | 잘못된 JSON, 존재하지 않는 manifest 자원, 배포에서 제외되는 제작 원본을 manifest가 요구하면 실패한다. NFC/NFD 경로 동치는 유지한다. |
| 선택 목록 전후 | 이전 후보 3,116파일·4,692,963,299B → 이번 후보 3,095파일·4,629,181,769B. 제외21개·63,781,530B, 추가0이다. main 기준 기존1차 절감을 합치면 39개·200,236,113B 감소다. |
| 검사 | 기존 실제 코드의 제작원본 차단 누락을 RED(exit1,10/11)로 재현 후 최소수정하여 Node 검사11/11·exit0. 전체 선택 목록에 index/game·승인 불투명 로고·로딩 JS/CSS·두 manifest 존재를 대조했다. |
| 남은 배포 제한 | 총량은 프로젝트 사전 예산4,000,000,000B보다629,181,769B 크다. `world_intro_v22b_steam.mp4`102,204,634B의 개별100MB 초과도 남는다. 상한을 완화하지 않았다. |
| 실제 전달 경계 | 복사 전 선택·정적 검증 결과다. 실제 web-dist, HTTP 검수, Actions/Vercel 업로드·공개 서비스 갱신은 아직 완료되지 않았다. user Player·기존3333 서버·G: 사용자 작업본·Unity 공통은 변경하지 않았다. |

경로별 JSON과 RED/GREEN 원문은 `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/web-json-closure-selection.json`, `web-json-closure-root-red.log`, `web-json-closure-root-green.log`에 보존한다.

## 2026-11-01 구 타이틀 필수 경로 차단 수정 — 후보 검수, main 미반영

| 항목 | 변경과 실제 검증 범위 |
|---|---|
| 확인된 장애 | Actions #1402(41194496954)·#1403(41198389177)는 `tools/build-web.mjs`가 현재 소비되지 않는 `video/title_motion_20261028.mp4`를 필수로 요구해 Build에서 실패하고 Deploy를 건너뛰었다. |
| 최소 수정 | 고정 핵심 진입·스크립트·Three 의존성 8경로의 필수 검사는 유지한다. 선택된 HTML/JS/CSS/MJS의 정적 `video/…mp4`·`video/…webm` 참조를 필수로 검사한다. 쿼리·fragment는 제거하고 NFC/NFD를 동일하게 대조한다. 동적 template prefix는 기존 선택기가 담당하며 미해석 경로를 고정 파일로 오판하지 않는다. |
| 현행 영상 | `index.html`의 `video/fdg_intro.mp4`·`video/world_intro_v22b_steam.mp4`, `character-story-player.js`의 `video/warrior_story_v23_clean.mp4`가 현재 정적 소비 영상이다. 옛 타이틀 파일은 참조가 없으면 필수가 아니며 새 참조가 생기면 다시 필수다. |
| 회귀 | 작은 임시 Git fixture에서 실제 build 스크립트를 실행했다. 옛 영상이 없는 정상 빌드 성공, 핵심 entry 누락 실패, 현행 세 영상 각각의 누락 실패를 검증했다. 기존 11검사를 유지해 총14/14·exit0. 최초 RED는12/14·exit1이며 실제 stale 오류를 재현했다. |
| 실제 선택 검증 | 원본 전체 복사 없이 현행 선택3,095파일에 같은 사전 검증을 적용해 exit0. 선택 파일/미디어 byte 변화0. 검사 harness의 최초 모듈 상대경로 오류와 command-local safe.directory 미지정은 harness만 정정했으며 전역 설정 변경0이다. |
| 전달 경계 | 같은 private 후보에 code/test/docs만 정상 보존한다. main·workflow·공개 배포·G: 사용자 작업본 변경0. 4,629,181,769B 총량의629,181,769B 초과, 월드 인트로102,204,634B의100MB 초과 및 공개402는 별도 해결·검수 대상이며 이 수정으로 배포 완료라 하지 않는다. |

RED/GREEN 및 현재 목록 검증 원문: `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/web-stale-assert-{red,green,current-selection}.log`. 원본 영상·음악·그림의 byte와 게임 내용은 바꾸지 않았다.

## 2026-11-01 승인 웹 파생 미디어 연결 — 원본 URL·실제 MIME 보존 후보

사용자는 원본을 보존한 웹 전용 파생본 제작과 최신 웹 commit/push/배포를 승인했다. 이번 코드는 파생 미디어를 기존 정적 배포 경로에 연결하며 게임 HTML·JS 내용, 원본 미디어, Unity 및 사용자 실행본은 수정하지 않는다. 실제 대형 artifact·브라우저·공개 배포 판정은 별도 인수한다.

| 항목 | 배포 계약·검증 범위 |
|---|---|
| 입력 schema | `assets/web-derived/20261101/manifest.json`의 `version:1`, `assets[]`를 사용한다. 각 행 필수값은 `source_path`, `source_git_blob`(Git SHA-1), `source_sha256`, `source_bytes`, `derivative_path`, `sha256`, `bytes`, `mime`다. 파생 경로는 동일 `assets/web-derived/20261101/` 안에만 둔다. |
| 허용 변환 | WAV→FLAC(`audio/flac`), PNG→WebP(`image/webp`), MP4→MP4(`video/mp4`)만 허용한다. 원본·파생의 실제 size/SHA-256, 원본 Git blob, 파생 확장자/MIME와 파일 magic을 대조한다. 이 검사는 PCM/RGBA/ICC·영상 시각 동등성이나 브라우저 decode 검수를 대신하지 않는다. |
| 원래 URL | `build-web.mjs`는 선택된 원본 대신 `_web_derived/<원래 NFC 경로 SHA256>.<실제 파생 확장자>`에 한 번만 staging한다. `prepare-vercel-output.mjs`가 Build Output API `overrides[실파일].path`에 원래 URL, `contentType`에 실제 MIME을 명시한다. PNG/WAV 파일명에 다른 포맷 byte를 저장하지 않는다. |
| 동적·JSON 의존성 | 기존 selector로 먼저 원본 소비 목록을 확정한 후 정확 source mapping만 치환한다. 기존 로딩35·wide105/전체화면64·wide128·언어·동적 음원 선택 계약은 유지한다. `assets/web-derived/`는 broad-prefix/직접 정적 선택에서 제외해 원본·파생을 이중 export하지 않는다. |
| Unicode 동일 byte | 원본 NFC/NFD logical 행은 원본 blob/SHA/bytes·파생 canonical 경로/SHA/bytes/MIME가 모두 같을 때만 하나의 물리 alias로 묶는다. 모든 실제 tracked source/derivative spelling의 byte도 대조한다. `source_aliases`에 원문 경로들을 남기고 `logicalDerived`와 물리 `derived` 수를 분리한다. 다른 byte·다른 변환·중복 동일 행은 실패한다. |
| 안전·용량 | 경로 이탈·backslash/colon/percent/query/fragment/control·symlink file·미추적/누락/미선택 source·변조·기존 URL override 충돌·원본과파생 동시 staging은 실패한다. 최초 출력 생성 전에 파일15,000개(config 포함), 개별100,000,000B, 합계4,000,000,000B를 검사한다. staging size 변화 및 prepare에서 실제 파생 hash도 다시 검사한다. 상한 완화0. |
| artifact 근거 | build의 `__web-derived-output.json`에는 원본/파생 hash·bytes·실제 staging path·원래 URL·MIME·Unicode aliases를 기록한다. prepare가 config 적용 후 이를 `.vercel/output/web-derived-output.json`으로 옮겨 정적 공개 파일에서 제외한다. 원본 저장소 byte는 그대로다. |
| 의미 있는 회귀 | 작은 실제 build→prepare fixture, 실제 MIME/원래 URL, 기존 Unicode 보존, 누락·SHA/Git blob·size·magic·위험경로·상한·변조·충돌을 검증한다. Mac과 같은 NFC/NFD 2논리→1물리는 기존 거절 RED 후 동일 byte 조건으로 GREEN, 다른 파생 byte는 거절한다. 기존14 + upload5 + 신규10 =29검사 대상이다. |
| 미검증 경계 | Mac 보고 73logical/72physical 파생본의 전체 입력 hash·실산출물과 공개 HTTP/MIME/Range·WebP/FLAC/MP4 decode·실제 게임 화면은 이 소형 fixture와 별도로 root/Mac이 인수한다. raw web-dist 서버는 overrides를 적용하지 않으므로 배포 URL 재현 증거로 사용하지 않는다. main push·production workflow·공개 배포는 이 코드 작성 단위에서 수행하지 않는다. |

URL와 MIME 지정은 [Vercel Build Output API 공식 configuration](https://vercel.com/docs/build-output-api/configuration)의 `overrides.path`·`contentType` 계약을 따른다. 별도 proxy/streaming 함수를 추가하지 않으며 실제 Range 지원은 배포/override-aware preview의 HTTP 응답으로 확인해야 한다. 원문 회귀는 `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/web-derived-link-*.log`, Unicode 실제 조건 RED는 `web-derived-unicode-alias-red.log`에 보존한다.

## 2026-11-01 exFAT EISDIR staging 실패 한정 복구

| 항목 | 정확한 동작·검증 범위 |
|---|---|
| 실제 장애 | 후보 `5df3c4b8216f8d4ee92e56e0cecfd12cc2f54c4e`의 전체 artifact 생성 중 I:의 `GLTFLoader.js`(96,550B)가 일반 파일임에도 hardlink에서 `EISDIR`로 중단했다. 권한 거부 또는 실제 디렉터리라고 단정하지 않는다. 기존 partial output은 삭제하거나 재사용하지 않는다. |
| 복사 조건 | `stageWebRuntimeFile`로 I/O를 분리했다. source를 lstat로 일반 non-symlink 파일인지 확인하고 link 실패 직후 다시 확인한다. `EXDEV`·`ENOTSUP`·`EISDIR`만 목적지가 없을 때 `COPYFILE_EXCL`로 복사한다. 디렉터리·symlink·이미 있는 파일은 덮어쓰지 않는다. |
| 권한·중복 | `EACCES`·`EPERM`은 복사로 전환하지 않고 원문 오류로 중단한다. `EEXIST`는 양쪽 일반 파일의 양수 inode와 dev가 같아 실제 동일 hardlink일 때만 허용한다. inode0만 같다는 이유로 동일 파일로 판정하지 않는다. 전역 권한·파일시스템 설정 변경0. |
| 기존 gate | source/derivative hash·blob·size, 선택 목록·MIME·Unicode·업로드 상한 검사는 유지한다. 복사 후 실제 size 및 전체 staging byte 합계 검사도 유지한다. CLI는 직접 실행 때만 빌드하고, 테스트에서 helper import는 artifact를 만들지 않는다. |
| 작은 회귀 | 기존 동작으로 실제 일반 파일 mock-link `EISDIR`를 RED로 재현했다(신규7개 중2PASS/5FAIL). 수정 후 일반 파일의 크기·SHA 보존, 실제 directory·mock lstat symlink 거절, 권한 오류, 기존 목적지 보존, 실패 중 source 유형 변경, 실제 동일 hardlink를 검증해 신규7/7 및 기존29 포함36/36·exit0이다. |
| 실제 I: 확인 | 새 고유 소형 fixture에서 기본 Node I/O의 method=`copy`, source/destination 각각4,200B·SHA-256 `e6286da8fb5b7aea3223a0877935f0dbfe622c5010d5ce05b0ab0bc53ff991b3` 일치, source byte 변화0을 확인했다. 이 검사는 전체 약3.95GB artifact 완료·HTTP·브라우저 검수가 아니다. |
| 반영 경계 | code1·test1·관련 docs2만 기존 후보 위에 정상 commit/push한다. 원본/파생 미디어·game/index·main·공개 배포·이전 partial artifact·G: 사용자 작업본을 변경하지 않는다. 전체 새 고유 output 및 Mac 1x/decode/HTTP 검수는 root/Mac 후속 인수 대상이다. |

근거: `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/web-eisdir-stage-red.log`, `web-eisdir-stage-green.log`, `web-eisdir-real-fixture.json`.


## 2026-11-01 승인 불투명 로고·최신 웹 배포 전 실제 검수 인수

| 항목 | 실제 확인 | 경계 |
|---|---|---|
| 승인 불투명 로고 | 원본·web main·unity/main·새 웹 산출 PNG SHA-256 `167e8465a0aec6fa5e8cd90131f203a86a27dccca2aa913a317cffe93c7d413d` 동일 | PC Unity 설치본 교체와 별개 |
| 소스 | Mac 실제 검수 `5df3c4b8216f8d4ee92e56e0cecfd12cc2f54c4e`, Windows exFAT 복사 수정 `89d70f3d7b82b25f188e98e1501bdcf9ed21d746` | 후속 수정은 빌드 복사 도구·테스트·docs뿐이며 게임·미디어·manifest byte diff 0 |
| 실제 산출물 | 두 OS 모두 정적 3,088파일 / 3,945,183,602B / 최대 94,795,327B | 생성 중 sidecar를 포함한 값 3,945,236,692B와 구분 |
| 파생 매핑 | 73논리 행 → 72정규화 자원(WebP54/FLAC17/MP4 1), 원본과 파생 SHA·원본 Gitblob·크기 검증 | 원본 Git byte 보존·NFC/NFD 동일 byte alias만 병합 |
| HTTP 소비 | 원래 URL 73개 HEAD·정확 MIME·Range206/416·전체 GET SHA 일치 | Vercel Build Output overrides를 반영한 격리 loopback QA; 공개 사이트 검증 아님 |
| Chrome 소비 | WebP54 decode, FLAC17 decode, MP4 113.701초/1920x1080 및 5·45·90초 seek | 무음 검수·청음 및 자연 전투 검수 아님 |
| 화면 비율 | 1920x1080·2560x1080·3840x1080 인트로/로딩 캡처 및 담당 1x 확인, 로딩 35종x3비율=105 decode | root는 실제 명령·영수증·imageView5 기록 인수; root 직접 픽셀뷰 0 |
| 산출물 동일성 | config SHA `a155ecb736faf23f4d0ee94c323d46ccdd9387119ac0e5a26967d04901f264b4`, 파생 영수증 SHA `e4c4479998da14f6370dabc60e3e2e9cae660837433c366195ad5ccd809ca380` Mac/Windows 일치 | hosted Vercel build·실제 배포 URL은 후속 확인 |
| 공개 상태 | 배포 전 두 도메인 HTTP402 DEPLOYMENT_DISABLED | 원인 계정/플랜 확정 없음·요금/보안 변경 없음 |

검수 산출: Mac `_out/web-runtime-qa-20261101/REPORT.md`와 같은 폴더의 HTTP·브라우저·로딩 검수 영수증 및 캡처. root 근거는 `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/web-real-artifact-root-audit.json`/`web-derived-real-inputs-root-audit.json`. 최신 승인 지시에 따라 정상 main 반영과 기존 GitHub Actions 배포를 이어가며 공개 URL·실제 로고 바이트 확인 전 배포 완료로 표시하지 않는다.


### 공개 배포 실행 #1404 — 2026-11-01 19:34 KST

`082521de3955726df006d22ad284e57b103cebe1` 정상 main push 뒤 기존 GitHub Actions [#1404](https://github.com/beearth/the-exoduser/actions/runs/41297655242)가 실제 실행됐다. 원격 Vercel build·Unicode 경로 준비·파일별/전체 업로드 검사는 모두 성공했고 Linux 산출도 3,088파일 / 3,945,183,602B로 Windows·Mac 검수와 일치했다. 마지막 `Deploy to Vercel` 단계는 2026-11-01T10:34:06Z에 **팀 미결제 잔액으로 계정 재활성화가 필요하다**는 CLI 원문으로 exit1 거절됐다. 공개 서비스 최신화 완료가 아니다.

Vercel 계정 관리자의 결제 문제 해소가 선행한다. 에이전트는 결제·요금제·카드·보안 설정을 변경하지 않았다. 이 외부 조건이 바뀌기 전 같은 배포를 무한 재시도하지 않는다. 원문 로그/영수증: root diagnostics `web-ci-1404-job.log`, `web-ci-1404-job-receipt.json`. PC Unity Desktop 갱신은 별도 기존 owner의 c336 frozen 입력·Win64 build·same-app 검수·바로가기 readback 단위로 진행 중이다.

## 2026-11-02 CH1 보행 아틀라스 후보 정렬

`unity/main` `18b99a70768cfe235e1474aefe9fe4fbf6439258`의 walk JSON 1개와 방향 PNG 8개를 웹 후보의 같은 `img/` 경로에 Git blob 동일하게 반영했다. 기존 웹 코드의 Canvas/WebGL은 이동 중인 해당 39종의 방향·idx 셀을 `floor(_walkDist/128)%4` 순서로 소비한다. 메타의 17종 `sampleIndicesByMob=[0,1,2,3]`은 원본 6프레임에서 저장할 4프레임을 고른 제작 기록이고, 다른 22종은 전역 `[0,1,3,5]`를 유지한다. 같은 커밋의 Unity 미러 PNG 8개와 blob이 일치한다.

9개 파일의 원천 blob·PNG 디코드·39종 배치·다른 22종 픽셀 불변을 검증했다. 선택 목록은 3,095파일·4,629,181,769B에서 파일 수 그대로 4,631,135,335B(+1,953,566B)다. 이 결과는 정적 후보이며 실제 1x 자연 이동, artifact/HTTP, 사용자 서버·Unity Player, 공개 웹의 개선이나 배포를 증명하지 않는다. 원본 프레임 폴더·게임 코드·저장·사용자 실행본은 변경하지 않았다.

## 2026-11-02 정적 직접 참조 브리지 선택 누락 교정 후보

후보 `70c76d36fd1c3a8ff76090ae175e759e18cd027f`의 실제 브라우저 검수에서 `game.html`이 직접 요청하는 `web3d/bridge-map.js?v=20261031-r3`가 정적 출력에 없어 HTTP 404였다. 원인은 선택기의 런타임 리터럴 경로 허용 목록에 `web3d/`가 없었던 것이다. 기존 담당의 9개 걷기 자원 인수 완료 뒤 같은 기존 체크아웃에서 CTO가 해당 선택기·회귀·관련 문서만 한정 수정했다. 다른 제작 원본이나 폴더 전체를 포함하지 않는다.

| 항목 | 현재 검증 범위 |
|---|---|
| 선택 규칙 | 실제 참조한 `web3d/` 리터럴을 고정점 탐색에 포함. 선택된 스크립트의 기존 assets/img 등 참조도 계속 탐색 |
| 실제 후보 선택 차이 | 3,095 → 3,096개. 추가는 `web3d/bridge-map.js` 1개·6,479바이트, 제외된 기존 파일 0개 |
| 원본 선택 용량 | 4,631,135,335 → 4,631,141,814바이트. 이는 파생본 적용 전 원본 선택 용량이며 실제 정적 업로드 용량과 다름 |
| 회귀 | 직접 참조 스크립트 포함·그 스크립트의 실제 자원 포함·미참조 같은 폴더 스크립트 제외를 먼저 실패 재현 후 수정. 웹 배포·파생본·파일 스테이징 30개 검사 통과 |
| 보존 | 걷기 PNG 8개와 JSON, 게임 HTML/JS·설정·세이브·기존 배포 제한·외부 guard baseline 바이트 유지 |
| 남은 검수 | 새 후보 정적 산출의 실제 브리지 URL 200/SHA와 브라우저 대표 실행은 아직 미검증. 이전 70c76 산출의 404를 새 후보 PASS로 대체하지 않음 |
| 별도 문제 | 로비 `_slotScrollIdx` 초기화 전 접근 3건 원인 미확정, QA 조건부 `engine/fdg/druid-encounter-qa.js` 누락은 별도. 이번에 전체 engine 폴더를 추가하지 않음 |
| 전달 | 같은 후보 브랜치에 정상 commit/push 후 새 정확 소스를 Mac에서 검수. 웹 main·공개 배포·Windows 실행본 변경 없음 |


## 2026-11-02 상대 모듈 의존성 선택 교정 후보 — 업로드 예산 HOLD

실제 fa519424 정적 패키지에서 필수 브리지 URL/실행과 Canvas 대표 걷기는 통과했지만, opt-in 3D 경로의 `import('./web3d/presentation.mjs?v=20261031-main2')`가 HTTP404였다. 원인은 루트 리터럴만 읽던 선택기가 `./` 문서 상대 경로와 모듈별 `./`, `../` import를 해석하지 못한 것이다. 게임 분기·Canvas 기본 경로·3D 활성화 조건·원본 미디어는 변경하지 않는다.

| 항목 | 현재 계약·검수 범위 |
|---|---|
| 문서 상대 경로 | 기존 런타임 assets/img 등 허용 루트의 `./` 접두 경로도 선택. `./web3d/native-ground-effects.js` 같은 실제 script URL 포함 |
| 모듈 의존성 | 리터럴 dynamic import, 정적 import/부작용 import, export-from의 상대 경로를 **각 importing 파일 디렉터리 기준** POSIX 정규화. query/fragment 제거·NFC 대조·실제 tracked 정확 파일만 포함. 순환 참조는 기존 scanned 고정점으로 종료 |
| 선택 경계 | bare package·외부 URL·저장소 밖 상대 경로를 파일 선택으로 해석하지 않음. 미참조 같은 폴더 파일과 제작 원본 제외 유지. 전체 web3d/engine 폴더를 일괄 포함하지 않음 |
| RED/GREEN | 기존 코드에서 신규 2개 회귀가 실제 누락으로 실패(13 PASS/2 FAIL). 수정 후 웹 배포·파생본·staging 32/32 PASS. transitive 상대 모듈·side-effect·export-from·순환/정확선택·범위 밖 제외를 검증 |
| 실제 선택 | 3,096 → 3,242개, 추가 146개/59,335,835B·제외 0개. 원본 선택 4,631,141,814 → 4,690,477,649B. 추가 파일은 JSON/PNG/WebP/GLB 및 실제 모듈과 그 전이 자원이며 원문·목록은 selection-delta.json |
| 예산 HOLD | 이전 fa 최종 static 3,947,143,647B에 새 원본 추가량을 더한 **예상** static 4,006,479,482B로 4,000,000,000B 한도를 6,479,482B 초과. 새 실제 패키지 완성 수치가 아님. sidecar/alias 및 파생 계획은 새 실제 산출로 재확인. 상한 완화·필수 자원 임의 삭제·원본 재인코딩 없음 |
| 다음 검수 | 기승인 원본 보존 웹 전용 파생 방식으로 새 PNG의 무손실 WebP RGBA/ICC 동등성을 Mac에서 계측. 충분한 절감 증명 및 정확 manifest 연결 후에만 새 공식 artifact/실브라우저 모듈 의존성·대표 Canvas를 검사 |
| 별도 실패 | 로비 `_slotScrollIdx`는 fa 단독 실행에서는 미재현·이전 70c 오류 3건은 유지. 선택형 3D 전체 품질·게임 API·자연 전투·Windows 배송·공개 배포 PASS 아님 |

원문: `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/web-module-closure-20261102/`의 red.log, green.log, selection-delta.json, docs-search-before.txt. 코드1·회귀1·관련 docs3만 같은 private 후보에서 정상 commit/push하며 main·Unity common·사용자 서버/저장·외부 guard baseline은 보존한다.
