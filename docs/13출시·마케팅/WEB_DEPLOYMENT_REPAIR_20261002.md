# 웹 자동 배포 실패 복구 — 2026-10-02

## 2026-11-01 배포 선택기 후속 후보 — 제작 원본 18파일만 제외

`codex/h5-web-delivery-20261101`의 `tools/web-runtime-manifest.mjs` 후보는 현재 웹 진입 HTML·JS·CSS·선택된 JSON에서 실제 소비가 확인되지 않은 프롤로그 구판 `assets/cutscene/prologue/_old_20260727/` 15PNG(99,072,910바이트), SOUTH 수정 전 제작 베이스 `assets/map/ch1/baked_spike/south_visual_pass/CH1_SOUTH_BASE.png`(31,877,268바이트), 맵 백업 `assets/map/ch1/boss_room_bg_old.png`(2,754,665바이트)와 `assets/map/ch1/ground_dark_soil_backup.png`(2,749,740바이트)만 정적 선택에서 뺀다. [프롤로그 원본](../cinematic/PROLOGUE_PROMPTS_GPT.md)은 `_old_20260727/`를 구판 백업으로, [SOUTH 제작 기록](../4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md)은 `CH1_SOUTH_BASE.png`를 build base로 분류한다. 실제 `game.html`은 SOUTH `chunk_*.png`를 참조한다. 원본 파일 byte·게임 코드·음악·영상은 바꾸지 않는다. 향후 이 네 범주의 파일을 정확한 런타임 경로로 직접 참조하면 선택기가 다시 포함한다.

선택 목록 계산은 **3,134파일·4,829,417,882바이트 → 3,116파일·4,692,963,299바이트**, 18파일·136,454,583바이트 절감, 새 선택 파일0이다. 로고, 로딩 35장×3비율=105이미지와 manifest, 프롤로그 현행 p01.jpg·CH1 실행 chunk, 음악77·sfx346·언어27은 보존됐다. 경로별 전후 목록은 `I:/EXODUSER-Storage/design/web-unity-parity-20261101/candidate-selection-manifest.json`; 작은 정상/정확 참조 회귀는 `test/webDeployment.test.js` 7/7 PASS. 이는 **후보 선택 계산**이며 4.8GB 실복사·배포·실게임 검수는 아니다.

남은 차단: 총량이 프로젝트 사전 예산 4,000,000,000바이트를 **692,963,299바이트 초과**하고 `video/world_intro_v22b_steam.mp4` 102,204,634바이트가 개별100,000,000바이트 검사도 넘는다. `ffprobe` 헤더는 H.264 1920×1080+AAC, 113.701초·7,191,115bps로 확인했고 원본 SHA-256은 `3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f`이다. 현재 영상·음원 재인코딩, 필수 파일 삭제, 임의 상한 변경은 하지 않는다. 별도 단위에서 실제 사용 자원을 더 증명하거나 동일 스트림 보존 remux/배포 경로를 검증해야 하며, 이 후보를 main에 넣어도 즉시 정상 배포할 수 있다는 뜻은 아니다.

## 2026-10-27 킬루가문 영상 교체 배포의 용량 검사 복구

- 교체 영상이 포함된 `main/0a81912b2e4e86e326538afd7f91626ea1729671`의 [Deploy and Build 실행](https://github.com/beearth/the-exoduser/actions/runs/40450295727)은 정적 업로드 합계 4,003,685,155바이트로 프로젝트 사전 예산 4,000,000,000바이트를 초과해 실패했다. 영상 파일의 게임 로컬 적용과 GitHub main 반영은 이 실패와 구분한다.
- `tools/web-runtime-manifest.mjs`의 동적 CH1 경로 선택에서 웹 실행에 쓰지 않는 제작 원본 3개만 제외한다: `assets/map/ch1/rottenwood_field_rootworld_master_v2.png`, `assets/map/ch1/rottenwood_poison_master_higgsfield_v2_wide.png`, `assets/map/ch1/rottenwood_poison_tree_detail_v3_source.png`. 원본 파일 자체는 삭제하거나 이동하지 않는다. CH1 실행 청크 선택은 유지한다.
- 로컬 선택 목록은 2,825개/4,036,367,600바이트에서 2,822개/3,977,014,362바이트로 감소했다(59,353,238바이트). `test/webDeployment.test.js`는 세 제작 원본 제외와 실행 청크 유지를 검증하며 관련 6개 검사가 통과했다. 이 수치는 로컬 선택 목록이며 Vercel 최종 반영 여부는 새 Actions 실행과 공개 URL로 따로 확인한다.
- 용량 수정은 `13c3629e3d590aca38b4d935494de06e5e8e7980`으로 main에 반영했다. 다른 작업의 후속 main 푸시가 앞선 실행을 취소했으나, 수정 커밋을 포함한 `48b804d34475f78a7c2a06173045fd7beec52c65`의 [Deploy and Build 실행](https://github.com/beearth/the-exoduser/actions/runs/40451606853)은 정적 용량 검사와 Vercel 업로드를 포함해 성공했다.
- 2026-10-27 공개 주소 `https://the-exoduser.vercel.app`: `index.html`이 새 버전 `20261027-killu-bloodtears-v3`를 참조하고 `character-story-player.js`가 해당 영상 쿼리를 사용함을 확인했다. 공개 MP4는 HTTP 200, 94,795,327바이트이며 전체 다운로드 SHA-256 `8b8248424b63d808dc225576fda44e39d459709963f97923ffaa38a51dba28ab`가 승인 후보와 일치한다. 브라우저에서 전체 96.4초 재생을 끝까지 시청하는 검수는 별도다. Steam 배포와 Windows 플레이어 빌드는 이 웹 배포에 포함되지 않는다.

| 항목 | 현행 계약 / 검증 근거 |
|---|---|
| 작업 범위 | Vercel `fordeargamers/the-exoduser`의 웹 패키징·GitHub Actions 배포만 수정. 기준 GitHub main `aacc7b02bef9d5cd7db6ea5d6466d7b8e4c11a3c`. 공유 PC의 미완료 변경·Steam/NW 빌드·세이브는 반영하지 않음 |
| 격리 작업본 | `G:/exoduser-web-repair-20261002`; 공유 `G:/exoduser`의 HEAD·브랜치·인덱스·작업 파일을 변경하지 않음 |
| 확인된 실패 | `f50232c`의 Vercel 로그가 `Downloading 6267 deployment files...`에서 끝나고 45분 제한 초과. 테스트/게임 코드 실행이 실패 원인이라는 근거는 없음. 하위 전송 정체 원인은 확정하지 않음 |
| 기존 과대 산출물 | 해당 커밋의 기존 웹 선택 규칙: 6,264개, 7,093,185,953바이트. 전체 Git 저장소 크기와 배포 산출물 크기를 구분함 |
| 웹 선택 | `selectWebRuntimeFiles()`가 공통 FILES의 루트 진입 파일과 실제 HTML/JS/CSS의 에셋 리터럴·동적 접두사를 재귀 추적. 언어/루트 아틀라스, 계산되는 sfx/sprites/localization, Three/vendor/3d 상대 의존성 유지. 단순 디렉터리 전체 복사를 대체 |
| 제외 | 참조 없는 이전 음악·영상, 맵 master PNG와 `*_sources`, `_unity_preview`, `_p11_candidates`, `_grok_qa`, `assets/video-bases`, `assets/video-tests`, zip/blend/psd/kra 제작 원본. 실제 선택 가능한 WAV는 재인코딩 없이 보존 |
| 당시 활성 타이틀 필수 파일(2026-10-02 이력) | 당시 `video/title_motion_hd_20260929.mp4` 소비 기준. 현행 필수 영상 검사는 아래 2026-11-01 절의 실제 정적 참조를 따른다. |
| Unicode 업로드 | `prepare-vercel-output.mjs`가 파생 `.vercel/output/static`의 동일 NFC/NFD 중복 바이트를 확인하고 합침. 한글 파일만 SHA256 기반 ASCII `_unicode/` 경로로 이동하고 Build Output API `overrides.path`로 원래 NFC 공개 URL 유지. 소스 파일은 변경하지 않음. 충돌 바이트가 다르면 변환 전에 실패 |
| 사전 검사 | 핵심 index/game/parry-lesson/resource-practice 존재, 파일+config 최대15,000개, 개별100,000,000바이트, 합계4,000,000,000바이트. 합계는 이 프로젝트의 보수적 전송 예산이며 Vercel 공식 전체 산출물 한도로 설명하지 않음 |
| 자동 배포 | GitHub Actions 한 경로로 유지. main 코드 push/수동 실행만 웹 배포; docs/test/Markdown만 바뀐 push는 제외. production 동시 실행1개, 새 실행 시 이전 실행 취소, 작업 제한30분. 태그 Electron 작업은 기존 계약 유지 |
| 대상 고정 | workflow에 기존 `VERCEL_PROJECT_ID`/`VERCEL_ORG_ID`를 명시하고 named project inspect 후 pull/build 수행. `VERCEL_TOKEN`은 기존 GitHub secret만 사용. 프로젝트 식별자는 인증 토큰이 아님 |
| 로컬 검증 | 신규 회귀5개 및 기존 vercelUpload5개, 합계10PASS. 정적 생성2,767개/5,017,081,173바이트 → 동일 Unicode 중복78개 제거·한글 공개 URL78개 alias → 2,689개/3,836,514,601바이트. 전체·개별·파일수 검사 PASS |
| 원격 완료 기준 | scoped commit의 원격 ref 일치, 새 Actions 성공, 새 Vercel READY 및 production alias 반영, 실제 공개 로비/게임·한글 음악 요청 확인 후 완료 판정. 로컬 PASS를 배포 성공으로 대신하지 않음 |

원본/기존 배포 기록: [Vercel 업로드 실패 대응](VERCEL_UPLOAD_FAILURE_20260913.md), [공개 서비스 대상](PRODUCTION_TARGET_CORRECTION_20260910.md).

## 실제 프로덕션 반영과 중복 경로 정리

| 항목 | 2026-10-02 확인 |
|---|---|
| 반영 소스 | `e1960cca9e58995ba078bd3078778e79b1474be0`; 원격 main 읽기 대조 완료. 수정 전 원격 `codex/backup-web-before-repair-20261002`는 `aacc7b02bef9d5cd7db6ea5d6466d7b8e4c11a3c` |
| Actions | [Deploy and Build #1127](https://github.com/beearth/the-exoduser/actions/runs/36971982818)의 웹 작업 SUCCESS; 태그용 Electron 작업 SKIPPED |
| Vercel | `Df1mk3NHdPtz1A4dYVM3XscKsTwQ`, READY, Production, main/e1960cc, Deploy Logs 49초. 대기 시간과 실제 배포 시간을 구분 |
| 공개 반영 | `https://the-exoduser.vercel.app`의 index/game SHA256이 로컬 검수 산출물과 일치. 한글 lobby/intro 음성/선택 WAV, 활성 타이틀·warrior 영상, CH1 chunk의 HTTP200 확인 |
| 중복 원인 | 동일 GitHub 저장소가 `hell`, `hell-build`, `the-exoduser`의 기본 Git 배포 및 Actions에 연결되어 있음. e196 push에서도 별도 hell 빌드 생성·대기열 점유를 실측 |
| 재발 방지 | 세 프로젝트의 기본 Git 연결을 해제하고 canonical `the-exoduser`의 Actions만 사용. 기존 프로젝트/배포는 보존. Mac 작업 브랜치의 중복 배포 생성도 차단 |
| 잔여 대기열 | `hell`/`hell-build`의 이미 생성된 QUEUED/BUILDING/INITIALIZING만 취소. READY/ERROR/CANCELED와 canonical 프로젝트는 대상에서 제외 |
| 수동 정리 도구 | `cleanup-vercel-duplicates.yml`은 workflow_dispatch/main 전용, 기존 GitHub secret으로 FDG team과 두 legacy 이름만 조회. 공식 GET `/v7/deployments`, PATCH `/v12/deployments/{id}/cancel`; 각 상태를 100개씩 조회·취소 후 빈 목록을 확인. 최대20회/상태, 작업10분. 다른 프로젝트 응답·인증 오류·취소 미확인은 즉시 중단; 토큰/응답 본문은 출력하지 않음 |
| 정리 검증 | 범위 이탈 전 취소 금지, READY 보존·여러 배치의 대기열 비우기, 인증 오류 비밀값 비노출의 회귀3개 PASS. [수동 정리 #1](https://github.com/beearth/the-exoduser/actions/runs/36974004565) SUCCESS; 소스 `136cb24215a86db62ed10ef1a05ef485ede5fb97`. 추가 취소 hell87개 + hell-build89개 = 176개. 이후 FDG 전체 Building/Queued 필터에 No Results 표시 확인 |
| 실제 브라우저 | 새 배포 전용 origin `the-exoduser-b1qoj5bly-fordeargamers.vercel.app`에서 정상 UI로 데모 입장 → 격리 테스트 캐릭터 생성 → 전사 영상 → game.html 진입 → 초기 대사·조작 안내 → CH1-1 맵·플레이어·펫·HP497/497·튜토리얼 표시 확인. 실제 계정/원래 공개 origin 세이브는 사용하지 않음. 플레이 상태 주입·fixture 없이 정상 클릭/Enter 입력; 캡처된 error/warn 로그0. 전체 전투·자연 진행·모든 언어 전수 검수는 미수행 |
| 결과 증거 | Codex 시각 자료 경로의 `vercel-repair-production-ready.jpg`, `vercel-repair-active-queues-zero.jpg`, `vercel-repair-game-start.jpg`. 원본 PC 체크아웃은 별도 검수와 Steam 작업을 위해 계속 보존 |

API 근거: [배포 목록](https://vercel.com/docs/rest-api/deployments/list-deployments), [진행 중 배포 취소](https://vercel.com/docs/rest-api/deployments/cancel-a-deployment).

수동 정리 도구를 추가한 commit은 `[skip ci]`로 이미 검증된 프로덕션을 다시 만들지 않았으며, 별도 workflow_dispatch의 자체 범위 회귀3개와 실제 원격 정리를 실행했다. 이 동작은 이후 main 코드 push의 자동 배포를 비활성화하지 않는다. [GitHub의 push/PR 건너뛰기 범위](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs).


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


## 2026-11-02 빠른 오프라인 로비 슬롯 초기화 순서 교정 후보

| 항목 | 구현·검수 범위 |
|---|---|
| 실제 재현 | `sb`가 없는 초기 진입은 Init IIFE → `_enterOffline` → `_goLobby` → `loadLocalCharacters` → `_renderSlotList`를 호출. demo 목록 경로는 await 이전에 완료될 수 있어 뒤에 있던 `let _slotScrollIdx=0`의 TDZ에 도달. 실제 HTML의 Init·4개 함수·선언을 원래 순서로 VM 실행해 `Cannot access ... before initialization` RED 재현 |
| 최소 수정 | `_slotScrollIdx` 선언·초기값 0을 기존 공용 `_localSlots` 옆으로 이동해 Init 이전에 초기화. let scope·스크롤 clamp·VIEW 2·개발자 무제한/일반 5칸·목록 API·캐릭터 선택·세이브 key/쓰기 규칙 불변 |
| 회귀 | 신규 실제 조기 진입 회귀와 기존 developerCharacterSlots/demoSaveRoute 총42/42 PASS. 기존 함수 추출 fixture는 이동한 실제 선언도 함께 읽도록 보완. 새 dependency 설치 없이 Node VM으로 실행 |
| 현재 경계 | 재현된 빠른 demo fallback의 소스/VM 오류 교정. 이전70c 브라우저 오류3건 전체와 동일한 trigger임은 아직 단정하지 않음. 새 정확 후보의 격리 실제 브라우저/시네마틱→오프라인·로비→게임 왕복은 후속 검수 |
| 보존·배포 | 원본/파생 미디어·game.html·Unity·슬롯/저장 내용·기존 서버/사용자 profile 변경0. private 후보 정상 commit/push만; 웹 main·공개 배포·Windows 실행본 변경 없음 |

원문 RED/GREEN·수정 전 HTML: `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/web-module-closure-20261102/lobby-early-init/`. 최초 acorn 패키지 해석 실패는 회귀 실행환경 오류로 구분했고, 새 설치 없이 실제 함수/초기 호출 구간을 읽는 방식으로 전환해 제품 TDZ를 별도로 재현했다.


## 2026-11-02 최종 웹 후보 자산 선택 통합 — 실브라우저 최종 검수 대기

| 항목 | 현재 확인과 검수 경계 |
|---|---|
| 정확 입력 | H5 79c081480b151664994924d64abc35f3a70eeb1a의 모듈 선택·로비 초기화 수정 위에 Mac private 350034aa7f99e91fd43fa5bf3b72cf325005f55f의 새 WebP 22개·manifest·재현 도구2·계약 문서만 선택 이식. Unity 전체/기존 Mac CHANGELOG 본문은 반입하지 않음 |
| 원본 보존 | 새22행의 H5 실제 원본 size/SHA-256/Git blob 전수 일치. 파생 파일22개 SHA/size 일치. 기존73 logical 매핑의 순서·내용 변경0 → 총95 logical/94 physical. 원본 PNG·기존 파생본·game/Unity 변경0 |
| 선행 Mac 검수 | dae940f 코드와 위 자산을 명시한 복합 입력에서 PNG23개 전체RGBA·치수·색 공간·ICC 동등 확인/22매핑/7,070,875B 절감. 공식 build/prepare/check 최종3,235파일3,999,408,607B·상한 여유591,393B. 최대94,795,327B/상한 변경0 |
| 실소비 | 복합 입력의 요청13 scripts+22mapped이미지 URL 200·MIME·전체GET SHA 확인. Chrome pageerror0/대표Canvas0·3frame 자동검사 통과. 자연 전투·3D 아트 품질·실제 손입력/전체1x 시각PASS로 확대하지 않음 |
| 선행 패키지 지문 | static manifest SHA 2b1986d5e12f1522ef0f8e14fa55079765384431e8089ccbe34f9407d7d8f2dd / config SHA 148c7f6eb86c0a937d9425e2aa3badeec133b148ac4d5000aa1e7f325c70f4b8. index가 다른 최종 통합 후보에는 이 전체 지문을 재사용하지 않음 |
| 최종 후보 gate | 79c의 로비 조기오프라인 초기화 수정은 선행 dae 복합검수에 없었음. 정상commit/privatepush 후 정확 통합 HEAD의 공식새정적산출·최소Canvas/모듈·로비fallback 실제브라우저·저장/종료를 같은 기존Mac 담당이 검수해야 함 |
| 실제 전달 | 웹main416ea4·Unitycommon18b·WindowsDesktopd8·공개402 상태는 별개. 후보/source/HTTP를 공개배포·Windows전달 완료로 보고하지 않음 |

원문: root `web-final-asset-intake-20261102/intake.json` 및 Mac `_out/web-module-closure-20261102/FINAL_RECEIPT.json`. 코드/manifest/파생 파일이 늘면 좁은 용량 여유를 다시 계산한다. 사용자 저장·기존3333/3448 서버·외부guard baseline은 보존한다.


## 2026-11-02 초기 진입 순서 전체 교정 — 실제 저장 helper 회귀

| 항목 | 확인·변경·검수 경계 |
|---|---|
| 추가로 입증한 결함 | `_slotScrollIdx`만 먼저 초기화해도 조기 demo fallback의 실제 `_demoSyncActiveSave`는 뒤쪽 const `_DEMO_ACTIVE_KEY`를 읽어 catch 경고를 내고 첫 로비의 기존 저장 동기화를 건너뛸 수 있음. 앞선 축소 회귀가 이 helper를 stub한 한계를 보존 |
| 방법 전환 | 선언을 하나씩 옮기는 보완 대신 기존 Init async IIFE 전체를 같은 script의 상태·저장 helper·UI 정의가 끝난 맨 뒤로 이동. Init 본문은 byte 그대로이며 타이머/재시도/새 저장 writer·저장공식·캐릭터 제한을 추가하지 않음 |
| 실제 회귀 | 실제 Init·오프라인/로비/목록/렌더 함수와 demo save helper를 원래 소스 순서로 실행. 빈 저장·기존 단일 demo 저장 2경우에서 초기화 전 접근 경고 RED 재현 → 위치 교정 후 경고0/로비 렌더/초기 스크롤0 PASS |
| 저장 보존 | 테스트의 메모리 Map에서만 기존 lv46/stage12/kills1795 전체 진행을 hellsave_demo → hellsave_demo_0에 기존 규칙대로 이전해 검증. 빈 시작의 save쓰기0. 사용자 실제 저장 파일/profile에는 접근·변경하지 않음. 키·5칸·개발자 정책·마이그레이션 함수 본문 불변 |
| 전체 검사 | 웹 배포/파생본/staging 및 로비·저장 회귀 총75/75 PASS. 실제 브라우저 최종 후보 검수는 별도 gate |
| 선행 후보 한계 | ab924449 및 선행 dae 복합 패키지 검수는 이 새 Init 순서 변경을 포함하지 않음. 모듈/용량/대표 Canvas의 기존 근거는 범위 내 보존하되 최종 새 HEAD의 로비/저장 동기화 실제 브라우저 PASS로 재사용하지 않음 |
| 자산·상한 | PNG/WebP·95매핑·game.html/Unity/WIP/서버 불변. HTML 설명 주석 포함83B 증가의 예측만으로 한도 PASS 주장하지 않고 다음 정확 artifact의 plan/최종 bytes를 실측 |

원문 RED/GREEN·수정 전 HTML/테스트는 root recovery `web-final-asset-intake-20261102/startup-order/`에 보존. 기존 scope의 74/42 PASS를 새 저장 helper까지 검증한 것으로 소급하지 않는다. 정상 후보 commit/push 후 같은 Mac 담당의 최종 실브라우저 인수를 거쳐야 하며 main·공개 배포·Windows 전달은 별개다.


## 2026-11-02 06:20 KST 단일 후보 6008 실제 웹 시작·테스트 저장 검수 인수

| 항목 | 실제 결과와 한계 |
|---|---|
| 입력·공식 산출 | source 6008f3d87d6fd77986ae0eba2dd9409e723f733e, selected3242/고유3343경로 Git blob 차이0. 공식 build/prepare/check 각1회. static3235파일/3999408690B, 4GB 여유591310B, 최대94795327B. 95논리/94물리 파생행 및 기존73행 유지 |
| 실제 Chrome 시작 | ab baseline의 _DEMO_ACTIVE_KEY 초기화 전 경고1회 재현. 새6008의 빈 저장·허구 legacy 초기화와 타이틀→시네마틱 스킵→데모→로비에서 pageerror/저장 TDZ 경고0. 빈 저장 쓰기0 |
| 허구 저장 범위 | 독립 QA localStorage의 Lv46/stage12/kills1795/ts 값이 기존 규칙으로 slot0에 동일 이관, 원키 제거·카드표시·선택 후 게임용 저장 활성화 확인. 실제 사용자 데이터 이관·자연 플레이 검수 아님 |
| 시각·도구 한계 | 담당자가 실제1920 원본 빈/이관 로비2장을 직접 확인. root는 raw와 imageView 기록 인수만/원본 직접픽셀뷰0. 게임 스프라이트는 기존 VFX 가림 INCONCLUSIVE 유지. 최초 화면 fixture 순서 timeout은 올바른 UI 순서로 전환; 입장 클릭 검사는 AudioContext 자동재생 경고1로 exit1, 저장 payloadExact=true/pageerror0와 분리. 오디오 경고를 지우거나 전체PASS로 합산하지 않음 |
| 보존·전달 | 일반 저장11항목/current Preferences2 SHA 불변, 자기 Chrome 종료·port53619 닫힘. 제품 Mac checkout350034 및 외부 WIP 보존. H5 main416/Unity18b/Windows D8 불변, public402 미납 및 Windows external writer 잠금으로 새 공개/Windows 전달0 |
| 증거 | Mac _out/web-startup-order-final-qa-20261102/{REPORT.md,FINAL_RECEIPT.json,input-audit.json,static-full-manifest.json,browser-startup-results.json,browser-ui-results.json,browser-activation-results.json,ordinary-before.json,ordinary-after.json}; static manifest aggregate(items) SHA1a33914ca392a975fd0c35f93b6cd3f812d1f02c5e28d26f0b7bcff1cfb75531/config148c7f6eb86c0a937d9425e2aa3badeec133b148ac4d5000aa1e7f325c70f4b8 |


## 2026-11-02 사슴 보스 남서 걷기 원본 웹 동기화 후보

| 항목 | 이번 정확 소스·검증 경계 |
|---|---|
| 인수 | Unity source-only후보 6d5e084665b22ed70b9a115d4f8062b395ff7889(parent18b99a70768cfe235e1474aefe9fe4fbf6439258)의 img 원본6장과 south_west atlas1장만 이 H5 후보에 인수. 게임 JS/Init/저장/파생95행/선택기/Unity 제품 변경0 |
| 원천 | 과거84dee8862e4debdf8af749cbbeb40dd6ab783ff4의 blender/sprites/boss_ch1_stag.zip blob0f9878b4b07368724bc4507a909c4a1855e8decc. 다른7방향42장 및 남서정지 byte동일, 누락남서 running6장 원본 그대로 복구. 새생성·미러·정지복사0 |
| 패킹 | idx22/col6/row2, cell256, source[0,1,3,5] 유지. img/atlas_ch1_8dir_walk_south_west.png의 x6144,6400,6656,6912/topY512 네셀만 복구. SHA c10aceee1b05d77997a5dacaa48ac7a420084b8981ab4f7c3486c1e50bab1132, Unity 후보mirror와byte동일. source6장의SHA/경로는 별도 intake.json에 보존 |
| 원본 보존 검사 | 인수담당의 rawRGBA 전수검증 changedBytes72811/changedPixels18457/outsideChangedBytes0/hiddenRGBChangedBytes0, 다른7방향·metadata/17override 불변. 등록1248셀 중 유효1232→1236/빈16→12. 남은 grotesque_quadruped남서/plague_censer동/blind_swordsman서 12셀·skinless_hound미등록32셀은 그대로 |
| 공식 선택·용량 | 기존선택3242→3242/추가삭제0. 본편 game.html의 동적 atlas경로가 이 남서 PNG를 소비, 제작 원본6장은 공식정적선택에서 제외. 기존최종6008 actualstatic3999408690B에서 PNG17409B증가만 반영한 예상3999426099B/예상여유573901B; 새 공식artifact/build/prepare/check가 아니라 delta 예상이다. 전체한도PASS로 승격0 |
| 검수·전달 경계 | 원본/후보byte·source검증만, 이 H5 후보 실제Chrome 남서루프·정지반전/새공식artifact는 미검수. 기존17종 CanvasQA·6008 시작/허구saveQA는 해당sourcebyte불변범위로만 보존. Mac 새실앱QA 진행과 별도이며 H5main416/공개402/WindowsD8 미변경 |
| 증거 | I:/EXODUSER-Storage/mobility-hud/20261101/_out/stag-southwest-source-repair-20261102/delivery-receipt.json 및 root recovery/web-stag-southwest-sync-20261102/intake.json. 다음 기존Mac 담당이 정확최종H5후보 공식패키지/atlas URL SHA/MIME·실제남서0→1→2→3→0 최소browser1x를 별도검수. VFX가림의 기존west재시도3차로 대체0 |


### 2026-11-02 07:31KST 실제 검수·전달 인수 (앞선 후보·대기 상태의 후속)

| 항목 | 실제 결과와 한계 |
|---|---|
| Unity | 최종 common6ad8b809c47f508f5d79362cff91f82934082afe. 정확5f7f5a3e QA 앱 ARM64 오류0·같은 앱 Metal M1 23/23·1920 실창14장/남서0→1→2→3→0·정지/반전 범위 VISUAL PASS. 최초3f13 GUI는 --remodel3d 누락·숨김walk 좌표 과검사로 FAIL, 수정한 새 앱으로 재검수했다. 자연보스AI·OS입력·전체몬스터 PASS는 아니다. |
| Mac 파일 전달 | /Users/fordeargamers/Applications/EXODUSER.app 백업·expectedold3SHA CAS·strict/deep 검사·211파일 전체manifest 동일로 설치. Runtime fe357d404126e686bfa896e87962eab6852d6ba352ffbf5ddeda01190ad1c860. QA Runtime15828c…와 byte가 다르며 일반 제품 프로필은 실행하지 않았다. 옛 Preferences2FAIL·최초828B백업 누락은 해결로 소급하지 않는다. |
| H5 정확 후보 | 0a4f1dabacba878dc47429049a98c9640f773c5b의 공식 build/prepare/check 실제 PASS. 최종static3235파일/3999426099B/한도여유573901B/max94795327B. 이전6008과 전체파일 비교 시 남서atlas 하나만 +17409B. manifest SHA34019e499b31be814acbc3a8f0646534b38e4f86c77bbb07a965ebb1c31b3538, config148c7f6eb86c0a937d9425e2aa3badeec133b148ac4d5000aa1e7f325c70f4b8. 위 예상치는 이제 이 정확후보의 실산출로 확인됐다. |
| H5 실제 화면 | source→artifact→HTTP200/image/png/2373359B/SHA c10aceee1b05d77997a5dacaa48ac7a420084b8981ab4f7c3486c1e50bab1132 동일. 본편 일반 적 Canvas에 skin22 주입한 실제1920 Chrome에서 남서5프레임·idle body만·북동반전 7/7, pageerror0/warning0. 담당 원본1x 접촉시트 VISUAL PASS 한정. 자연AI·전체3D·API 성공·공개배포 판정은 아니다. 의도차단 외부요청과 static /api/mats405 별도 보존. |
| 보존·종료 | 일반11항목/current QA Preferences2 byte/SHA 동일, 설치앱3SHA·MacHEAD6ad·외부WIP 동일. 자기Chrome·53620 서버 정상종료/포트닫힘. root는 원본뷰 기록·raw를 인수하고 별도300×130 손실JPEG 0/3 미리보기만 직접 확인. |
| 남은 원본·전달 | 기존 blender/sprites/ Git 변경6건/7스냅샷·97경로·유일stag ZIP 감사에서 남은3방향 원본 미발견. 다른보관소 전체부재나 실제 누락frame수는 미확정. 빈12셀 보존/가짜·미러대체0. WindowsD8에는 앞선17종 및 사슴 걷기복구 미반영, receiver 작성잠금으로 배송0. H5main416/공개402 미납차단은 그대로. |
| 원문 | Mac _out/web-stag-southwest-qa-20261102/{REPORT.md,FINAL_RECEIPT.json,browser-stag-results.json,static-full-manifest.json,ordinary-before.json,ordinary-after.json}; root recovery/web-stag-southwest-sync-20261102/; 기존 mobility _out/remaining-walk-archive-catalog-20261102/receipt.json. |


## 2026-11-02 최신 main·Tripo 상자 웹 전달 후보 선택 인수

| 항목 | 소스·검수 범위 |
|---|---|
| 정확 인수 | 기존 H5 후보631ad4806cb5b6f7504cb242b0dfaf0a13eb955f 위에 원격main2148d32f2efee255124907391a15c06f8f4ef623의 최신 웹표현·타이틀여백·Tripo상자·release0.7.11과 관련docs/tests38경로를 선택 이식. Git wholemerge가 아니라 검토한 source port이며 Unity·Steam 실행/배포 없음 |
| 기존 후보 보존 | Init IIFE말미 이동·조기오프라인 실제저장helper/스크롤선언, web 상대module closure/95논리94물리 무손실매핑, blood_swarm·16종 및 사슴남서atlas 원문 유지. CHANGELOG의두독립추가기록충돌은양쪽본문모두보존 |
| 원화·상자 | runtime GLB2679056B/19452tri/SHA2df52668134854e83cab7edc2fc304162aead1e79f0ce24c8033566209937828. 기존동일경로5684980B를대체하고chest3d.mjs만추가. 생성master70MB/제작blend·예전GLB는출고에서추가하지않음. 상자단위runtime delta−3006335B는제작담당측정이며통합최종값은다음공식산출필수 |
| 게임·화면 | 제작담당의기존본편fixture 실제R→열림110도·장비3/악의+7·재입력보상0/일시정지·item제거복귀·GLB차단native폴백 근거를인수. root는실1920닫힘·열림원본JPEG2개직접확인. 자연보스처치/전체전투·밀집성능/통합후browser검수로확대하지않음. 원본재질·장식 VISUAL RETOUCH유지 |
| guard·보존 | 외부tools/guard.baseline.json WORK SHA baf66bf767443f3c0f9a38e748b624e6d69e0ba9ba1afb97a1566997c52eaaab를미stage·미수정. upstream guard diff는line count66226→66095뿐이라이번선택이식에서제외. 기존G사용자INDEX·WIP/3333/save·현재3448프로세스보존/자동재시작0 |
| 다음 gate | 자기exactsource+관련docs정상candidatecommit/push·remoteSHA후정확HEAD의공식build/prepare/check·최종4GB/100MB·필수chestmodule/GLB/MIME/GETSHA/실개봉·fallback/로비초기화·save격리 검수. source만으로실artifact/publicPASS0·원본무근거삭제/상한완화0 |
| 실제 전달 | 공개Vercel402미납은별도. 같은조건mainpush로CI재실패유발/결제플랜보안변경0. 3448은새source를제공할수있지만기존열린창이자동최신이라고하지않고새통합후QA로재확인. Unity 상자 이식/PC설치완료아님 |

원문: I:/EXODUSER-Storage/tripo-chest-game/20261102/{REPORT.md,packaging-delta.json,git-receipt.json,chest-opening.mp4}; root recovery/tripo-chest-intake-20261102의정확prepared/before manifest·선택목록·회귀로그. MAP PRODUCTION REPORT: STAGE=기존보상상자/표현인수; MASTER/OUTER/LARGE/MEDIUM/PLAYABLE/landmark geometry는source승인범위보존,GROUND=기존상자anchor/그림자, CAMERA=원제작1920/3840·root1920닫힘열림2장한정, TECH=새통합후실패/예산/실browser별도, FILES=자기선택38+H5closeoutdocs, VISUAL VERDICT=상자RETOUCH/전체맵기존판정유지, NEXT=정확새artifact·기본/선택3D·상자개봉실검수.

- 통합 회귀: 원 담당 main2148의 `draw`와 현재 후보가 동일함을 원문 대조했다. 기존 보호 검사는 `active`→`isShowing(item)` 한 조건만 기준으로 정규화하며 500개 이상의 기존 전투/저장/AI 함수와 나머지 draw 원문 비교를 유지한다. 전체 draw 제외는 하지 않는다. 잘못된 전역 active 조건과 다른 draw 수정의 두 음성 fixture는 각각 실제 FAIL, 실제 후보의 보호4검사는 PASS. Git 소유권 조회 오류와 실제 조건 변경 실패를 별도 로그에 보존했다.
- 사용자 후속 전리품 분산 수정은 기존 MCP/API 담당 진행 중이다. 현재 상자 개봉 인수는 중간 단계이며 최종 분산 SHA/공식 산출·브라우저 확인 전 전체 웹 전달 완료로 판단하지 않는다.

- 현재 중간 통합본의 공식 선택·파생 plan: selected3245, sidecar 포함3239파일, 3,996,523,003B(4GB 여유3,476,997B), 최대94,795,327B, 기존95논리/94물리 매핑 유지. 실제 배포 artifact를 생성한 수치가 아니며 전리품 후속 반영 시 다시 계산한다. 통합 회귀94/94 PASS.

### 후속 최종 인수 — 전리품 외곽 분산

| 항목 | 실제 반영·검수 경계 |
|---|---|
| 소스 | 원 담당 main `fbfff89fe23de7d862a4c8291115ee91ce1f50f5`의 정확6경로를 중간 후보856b52에 선택 반영. guard 줄수 파일 제외·기존 외부 WORK 원문 보존. `game.html` SHA256 `b98c88eb13d8e68b5d12bb6b264697391259c8df6e10e026980a2ffec0c59be0`로 원 담당과 동일 |
| 동작 | 반지름150px 기본 분산·64px 간격 및 벽/경로 검사·순차 포물선·착지 전 R 탭/홀드 수거 대기. 극단적 협소 지형은 간격 완화/보상 유실 방지 폴백이며 모든 지형64px 보장은 아님 |
| 검수 | 원 담당 동일 소스 실제R300ms→5개·중심150px/최소간격83.948704px·1920/3840·연속147프레임. root는1920원본 직접뷰와 REPORT/원격/소스 인수. 주입 상자/단계별 일시정지이며 자연 보스 처치/전체맵 PASS 아님. 분산 scopedPASS, 상자 원본 조형/재질RETOUCH 유지 |
| 보호 | 통합97/97 PASS. 보호검사는 검토한 상자 비행/수거 hunk만 정규화하며 나머지 update/draw·500개 이상 기존 함수 원문 대조를 유지. 보상 개수 변경·비행 중 수거 우회 음성 fixture가 실제FAIL하는 것도 확인 |
| 예산 | 공식 plan selected3245·sidecar포함3239파일·3996525412B/4GB여유3474588B/최대94795327B·95논리94물리 유지. 실제 static artifact/동일 브라우저 합본 QA는 아직미실행 |
| 전달 | 기존 로컬3448의 새 HTTP 요청은 변경된 디스크를 읽지만 기존 열린 창 자동최신화/실브라우저 검수로 간주하지 않음. 후보만 정상push, main/public/Unity/Windows실행본 전달은 이번없음. public402·Mac ground 실검수 진행중 경계 유지 |

### 상자64px·동적 몸통 충돌 후속 인수

| 항목 | 반영·검수 및 미확인 범위 |
|---|---|
| 소스 | main d60ed26의 상자 feature767762137502787c1056ecda224f598436c62b88에서 정확8경로만 선택 반영. 동시 C2묶음19경로·guard 기준선은 별도 미인수/보존. 기존 웹 시작순서·모듈closure·95논리94물리·walk/stag복구 유지 |
| 크기/충돌 | CSS160→64(60%축소),44×24worldpx 몸통+actor반경. 닫힘/열림 충돌·이전좌표 선분·생성겹침 바깥탈출·전리품 자기상자만 제외. 정적지형·Q/E 수치·보상/RNG/저장 불변. 정확 수치/제한은 Tripo상자 현행계약 |
| 원본 인수 | 원 담당 실제WASD 좌우약37px 정지·상단우회/실제R4개·150px/최소110.76184px·열림안전위치재검수·제거복귀. root1920닫힘/열림 원본2장 직접뷰. 주입상자·단계별정지 scopedPASS, 자연보스처치·전체맵/아트PASS 아님. 원본재질RETOUCH 유지 |
| 자동 | 통합119/119 PASS(기존웹/로비/저장/파생/선택기+상자+이동회피전리품). canMv보호실패를 보존 뒤 검토한 함수2개/이전좌표 연결만 고정정규화. 기존 update/draw전체제외0·500개 이상 원문보호유지. 벽검사제거·선분연결삭제·보호이속변경 음성fixture3개 실제FAIL 확인 |
| 출고계획 | 공식선택3245 동일, runtime2파일+1314B. 이전공식plan3996525412에 더한 예상3996526726B/4GB예상여유3473274B. fullplan/공식artifact/실브라우저합본은 새로실행하지 않음. C2묶음 포함수치가 아님 |
| 전달 | 이 단위는 root H5후보 정상commit/push 및 로컬HTTP원문대조까지. public402/Unity/Windows설치·바로가기 미반영, Dota실행중 root새GPU/build/encoding0. 기존Mac독립ground진단과겹치지않는후속 정확artifactQA 필요 |


## 2026-11-02 C2 close·상자 합본 출고 후보

| 항목 | 현재 후보의 정확 범위 |
|---|---|
| 소스 인수 | 923deedfc55017fa4d44dc24843d2b035b583700 위에 title 최종 e9b4d965b5ac4fd25df52d930ab9146fe21268f2의 close 원화·3개 영상·표시/QA/관련 문서만 선택 반영. 중간 c6 tall/93 clarity의 미사용 영상은 인수하지 않음. unrelated main web3d/맵/game 변경·wholemerge0 |
| 보존 | index의 Init 말미 배치/earlyslot 상태·기존 상자64px/44×24충돌·보상/AI/저장·walk/stag 복구 유지. game.html은923과 byte동일. A master PNG/WebP 및 제작 raw 파일은 삭제·재인코딩하지 않음 |
| 파생 매핑 오류 | 새 C2가 A를 소비하지 않으므로 A/master-7680x2160.png 매핑1행만 비활성화. 기존95논리94물리→94논리93물리, 나머지94행 순서/identity byte동일. 원본/파생 파일은 그대로 보존. 미선택 원본의 매핑이 남으면 공식plan이실패하는 RED를 먼저 확인 |
| 예산 원인·수정 | close 영상3종을 그대로 반입하면 약4013715790B(sidecar조정전)로상한초과. 현재런타임참조0인 assets/3d/raw/vinebound의GLB2개+README 총17167315B가 무조건포함되는선택오류를수정. raw를초기전체포함에서만제외하고 명시URL/동적prefix 실제참조는기존closure로유지. root 원본파일/필요한canonical모델/상자GLB는보존 |
| 공식 소스 plan | 선택3243·sidecar포함3237파일·3996547694B·4GB여유3452306B·최대94795327B·94논리93물리. 실제모든활성파생source/blob/hash/MIME를검증한plan이며 대형static복사·prepare/check·합본browser 완료가아님 |
| 회귀 | raw전체포장 RED15/16→정확선택GREEN·A미선택매핑RED→1행해제GREEN. 합본130/130:타이틀/파생/closure/로비실제helper/상자/이동/보상·AI·저장소스보호 PASS. source-only검사는 실제합본화면PASS가아님 |
| 실제 이미지·경계 | 원담당 title-close-20261102/REPORT.md·19관련검사/합성픽셀3/111project·1920/2560/3840자체실화면범위인수, root새1920메뉴원본직접뷰. 32:9달상단크롭과원생성해상도한계보존. Unity/물리모니터/NW/public·전체맵/자연전투는미검수 |
| 후속 | 기존Macground진단이자원/EditorPlayer/FIFO/profile을반환한뒤 동일Macowner에최종정확후보의공식artifact/최소합본검수. 사용자Dota/OBS·서버3333/3448·save/WIP보존. 공개402미납조건에서mainpush로CI재실패유발0 |

근거: I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/title-c2-close-integration-20261102/ (raw-reference-proof.json, raw-selection-red.log, orphan-red.log, integration-green.log, official-plan.json).


## 2026-11-02 후속 — C2 달 위치 복원까지 포함한 최종 소스 후보

앞 절의 C2 close 출고표는29ee2b04 단계 기록이다. 현재는 별도moon 구현0877808df92391a02dd83fbf930fcb334278f489의15경로만 추가선택했다. 원격23ece257의 무관map/web3d/game 변경은 반입하지 않았다.

| 항목 | 현재 인수·검증 |
|---|---|
| 표시 | 달/광배를 원화4K기준(-60,+268)px,가상중심(1180,309)/반경79로이동·원달구름복원·정지plate·10초alpha.01~.03맥동. 영상3판byte동일/MP4재인코딩0. 같은16/21/32:9 cover에서달전체와발밑보존은원담당실화면범위로인수 |
| 실제근거 | title-moon-20261102/REPORT.md·qa-receipt/16회귀·1920/2560/3840각약10초·원본1x/오류폴백범위,root1920최종원본직접뷰. 이근거는새합본artifact/browser·물리모니터/NW/Unity/publicPASS가아님 |
| 회귀·보호 | 추가2회귀는미구현api.moon/moonPulse에서RED→소스선택이식후GREEN. 기존상자/로비/저장/보상/AI/이동·파생/closure와합본132/132PASS. game.html은923과byte동일·비활성A원본/파생·raw보관파일삭제0·94활성매핑원문유지 |
| 공식현재plan | 선택3245·sidecar포함3239파일·3998567832B·4GB여유1432168B·최대94795327B·94논리93물리. 실제identity검증계획이며static복사/buildpreparecheck·새합본Chrome미실행. 추가자산전공식예산재계산필수/상한완화0 |
| 전달경계 | 같은private후보에정상commit/nonforcepush/remoteSHA확인. source候補와local3448디스크반영은원격main/public/Unity/Windows실행본동기화완료가아님. Macground검수자원반환후정확이후후보를실artifactQA대상으로사용 |

근거: title-c2-close-integration-20261102/moon-followup/{red.log,green.log,official-plan.json,receipt.json}.


## 2026-11-02 후속 — 달 제작 원본의 웹 출고 분리

| 항목 | 현재 정확 계약 |
|---|---|
| 원인 | C2의동적폴더prefix가달복원제작입력 moon-cloud-restoration.png까지선택했다. 실제title-signboard.js는완성still.webp·moon-static.webp만소비하고이PNG는builder/manifest.moonRelocation의출처기록이다. 화면/정지/오류폴백의요청경로가아님을대조 |
| 변경 | 선택기한줄로해당정확경로만제작원본으로취급. 실제실행JS/HTML/CSS에리터럴참조가추가되면기존exact-reference예외로다시출고. 임의동명전체파일/원화/영상삭제0·상한완화0 |
| 보존 | sourcePNG1598544B/SHA3ea9c938cccbd677b203e49c638bbd1bf0f9437340bd54ecec103e1027674b8d·완성still/moonplate·영상3판·game/index/titleJS·94활성매핑·외부guard원문불변 |
| RED→GREEN | 실제C2선택과소형동적prefixfixture2검사에서미참조제작원본출고FAIL을재현. 제외후리터럴명시참조/완성plate·still포함을양성대조. 합본133/133 PASS. 기존불변game/상자/보상·AI·저장/로비/이동보호검사포함 |
| 공식sourceplan | 3244선택·sidecar포함3238파일·3996969288B/4GB여유3030712B/max94795327B/94논리93물리. 직전794d공식3998567832B에서정확1598544B감소. identity/MIME전수검증한plan이며실static복사/preparecheck·합본browser/공개배포완료아님 |
| 검수경계 | runtime표현/재생/입력코드와완성아트byte불변. 기존producer/루트이미지검수는원범위로유지하되새합본artifactQA는Mac기존ground자원반환전미착수. 제작PNG/기존사용자파일·세이브보존 |

근거: I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/title-authoring-closure-20261102/{red.log,green.log,official-plan.json,receipt.json}.

## 2026-11-02 21시 인수 — ea24 정확 합본의 실제 산출물·브라우저 검수

이 절이 이전의 ea24 `실artifact/browser 미착수` 상태보다 우선한다. 검수 runtime은 `ea24a3bfb6d2d381f520eb81ac1978d8bfde9bab`이며 이후 문서 마감은 제품 코드·자산 변경이 아니다. main/public/Unity/Windows Desktop 최신화와 구분한다.

| 항목 | 실제 결과와 검수 경계 |
|---|---|
| 입력·공식 산출 | 필수3346경로 Gitblob mismatch0, selected3244,94논리93물리. 공식 build→prepare→check 각1회 exit0. stage는 sidecar포함3238파일3996969288B, prepare가69482B sidecar를 상위 검수 receipt로 이동한 최종static은 **3237파일3996899806B / 4GB여유3100194B / 최대94795327B**. 수동 파일 보충·상한 완화0 |
| 산출 identity | config SHA256 `1a8bab831dc2e583724b2a5b6a6790d30467fb37c4dcf5ff3180fc87d87614b2`; derived receipt `64825b7c9bbf1e2c7dd80ef29ffcbe56902655a3a4ec7d56ec85782cc4c75a80`. sourceplan과 실제prepare 후 파일수/byte를 혼동하지 않음 |
| HTTP·실행 | 새 loopback artifact의 GLB/chestmodule/titleJS/C2영상3/still/moon/cloud/fall 11URL fullGET200·MIME·전체SHA 일치. 같은 산출물의 격리 headless Chrome DPR1에서 실제 namespace/영상·moon/cloud/flow 증가, 숨김 정지·destroy·motion-reduce/영상오류/plate오류 폴백 확인 |
| 상자·전리품 기능 | 1920×1080의64CSSpx/44×24worldpx 몸통. 닫힘·열림 WASD 정지/우회·겹침 탈출·상자 제거 후 통행, GLB차단의 실제2D draw 확인. 별도 같은artifact fixture에서 R160ms 홀드→장비3개, 순차 분출134샘플·비행중 미수거·착지후 수거·추가보상0·pause/resume 확인. game/chest 최종검사 각각9건 통과. 보상수량/RNG/게임수치를 새로 정의한 것이 아님 |
| 시작·걷기 | 타이틀→시네마틱→데모→빈 offline 로비 earlyInit 경로, pageerror0. 대표 서쪽 걷기0/3의 실제 drawImage 셀256px 확인. 일반본편 skin 주입·상태제어이며 자연AI전투/85걷기전체/OS 손입력 검수가 아님 |
| 실패 보존·fixture | 연습모드의 worldItems 교체/R제한, intro 이전 G.on 대기, skip overlay, 프레임 사이 zero-duration R 입력 실패를 원인별 분리 후 실제 UI순서/프레임을 넘는 홀드로 교정. 제품 코드 변경0. 최종 navigation/closed/fallback/walk와 open-flight-pickup은 분리 fixture이므로 한 번의 연속 자연 플레이 PASS로 확대하지 않음. 과거 실패 JSON은 남지만 일부 중간 PNG는 최종 재촬영으로 덮여 과거 실패 이미지 byte 전체 보존 증거는 없음 |
| 16:9 원본 인수 | root가1920×1080·3840×2160 타이틀 및1920×1080 상자 닫힘/열림 원본4PNG를 파일SHA·IHDR 대조 후 직접 열었다. **3840×2160은16:9이며32:9 증거가 아니다.** 달 전체·발 지지·로고/메뉴 분리는 해당16:9 원범위로 확인 |
| 실제 와이드 추가 검수 | 같은 artifact만 재사용해2560×1080·3840×1080/DPR1/일치하는 canvas·CSS·PNG 치수, 모션 증가·가로넘침0·pageerror0을 별도 확인. 신규 build0·전체suite 반복0. 양발·달은 보이지만 전체그림 center-cover로2560×1280 y=-100 /3840×1920 y=-420을 그리므로 캐릭터 확대와 상하 배경 크롭이 생김. **기술 PASS / 와이드 구도 RETOUCH**. stage의 기존 cover 수치는 임의 변경하지 않았고 DESIGNLOCK 캐릭터 보존·배경 확장 목표의 품질 공백으로 남김 |
| 아트 판정 | **상자 금속·목재가 실제64px 화면에서 너무 어두워 RETOUCH**. 기능 PASS로 금속 조형/재질 완성이나 전체맵 PASS를 선언하지 않음. 조명/노출/IBL 원인 추정은 실제 같은-camera A/B 전 확정하지 않음 |
| 저장·무음·종료 | ordinary11/currentPrefs2 raw사전백업·사후13개동일, installed5/WIP25/공유HEAD·branch·INDEX·WORK/원본7014metadata 불변. 자기출력 후단 gain0·analyser peak0·direct video unmuted0(실OS loopback 청음 아님). 자기 Chrome·loopback 서버 정상종료·PID/listen잔여0, 사용자 Chrome 보존. 이전 소형 proof sender도 /done 정상close와 실제PID/listen0을 확인 |
| 배포 경계 | 일반userprofile/Unity/NW/실모니터/자연보스처치·전체맵/한타FPS·1%low·public/API 완주 PASS가 아니다. `/api/mats`405는 정적 fixture 제한, Supabase/외부font 요청차단은 의도된 격리. public402 조건에서 mainpush/재배포 반복0, Windows/바로가기 전달0 |

근거: Mac `_out/web-chest-final-qa-20261102/{FINAL_RECEIPT.json,REPORT.md,browser-ea24-game-final-result.json,browser-ea24-chest-input-result.json,wide-aspect-qa.json,static-full-manifest-ea24.json}` 및 root `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/web-ea24-final-intake-20261102/`. 원본 화면·해시·보존·정상 종료를 인수한 범위만 판정하며 기능 통합과 아트 재작업을 분리한다.

추가 root 원본 인수: `title-C2-2560x1080-wide-original.png` 3770249B/SHA256 `3269a2153d20674d78356f75bafdef0a9b4cd472c47eb44aa7871bc5b647368f`, `title-C2-3840x1080-wide-original.png` 5073289B/SHA256 `9c76fc071d302bf734bc053b12539e6fd3ddb509abf02e57e4e9004281981cd3`. root가 수신 byte·IHDR를 대조하고 두 전체 원본을 직접 열어 위 구도 RETOUCH를 확인했다. UI 화면맞춤 미리보기는 물리 모니터1:1 검수로 주장하지 않는다.


## 2026-11-02 21:45 — 상자 반사 환경의 검수용 후보 반입

| 항목 | 정확 범위·현재 검증 |
|---|---|
| 출처/범위 | 원 담당 private450a6bfa2d2a027728280039267d63f8a29dca0d에서 chest3d.mjs 한 개와 신규 CPU회귀 한 개만 선택 반입. 기존 루트2f37의 exactea24 검수/문서·게임/타이틀·95→94활성매핑·걷기/사슴 복구를 보존. wholebranch/main merge·공개 배포·제품아트 채택 아님 |
| 모듈 | 기존5632B/SHA90ea0ef8f285ef507d1b3d8b994fb07cc8b21c5969c9d06ff403f14f9d5f9eac → 후보9256B(+3624)/SHAa16f2f94fe26d4c63ff997701fa6415db6402c65879c9c03a05d16cc2e567da9. 반사128×64 선형RGBA/.65, 같은모델 환경off/on, 실패·dispose해제 경로. 숫자/공식/팔레트·캐시 한계는 TRIPO_CHEST_GAME_20261102.md 새후보표가 정본 |
| 보호 | GLB2679056B/19452tri·PBR입력/노출1.25/원광원·64CSS/44×24body/열기·R분출/수거·보상RNG/save/AI/game/index/title·파생94논리93물리 byte불변. 외부guard/WIP/사용자PC앱조작0 |
| 검증 | 루트 원본에서 신규6회귀 기능부재 RED→정확모듈반입후 신규6+기존12=18 PASS. 실제Three자원 이벤트+주입 renderer/loader의 CPU검사이며 실제PMREM/GPU/시각/비용은 미검증. baseline/candidate 같은64px 닫힘/열림과 실제fallback·dispose를 같은Mac 격리앱에서 다음 검수 |
| 출고 예산 | 추가런타임 파일0·모듈+3624B. 이전ea24 actualstatic3996899806B 기준 예상3996903430B/4GB예상여유3096570B, sidecar포함 sourceplan예상3996972912B/예상여유3027088B. 아직 새공식plan/artifact가 아닌 차이 계산이다. 공식새build→prepare→check/wholemanifest·HTTP SHA는 후보정상commitpush 뒤 같은Mac에서 확인 |
| 판정 | **미채택·GPU시각 미검증 / 기존 상자재질 RETOUCH**. 원인 가설(금속반사환경부재)은 A/B 전 미확정. 이전ea24의 기능한정PASS/와이드구도RETOUCH와 별도. 같은핵심시각2FAIL이면수치미세반복 대신방법전환 |

근거: I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/chest-material-450a6bfa-intake-20261102/{candidate.patch,red-root.log,green-root.log,producer-REPORT.md}.

추가 루트 통합 검사: 상자·패키징·웹선택/무손실파생·staging·C2·시작/슬롯/저장/타이틀 이동의 관련15개 테스트파일 **112/112 PASS**. 이 수치는 이전합본133개 전체 재실행 결과가 아니며 GPU/자연전투 검수로 올리지 않는다.


### 21:45 후보의 최종 수명 수정 인수

원 담당 최종 `6a41b6229fd09d05c7568e4720c4a29d54855739`가 초기450 후보를 대체한다. teardown 때 `root.clear()`와 modelRoot/root/lid/light/shadow/foot/camera 참조 비우기만 추가했다. 부모 root에 남은 model을 새 assert로 RED 재현한 뒤 최종모듈에서18/18 PASS. 반사색·광원·환경생성·표시/판정 수치는 초기450과 동일이며 시각 검수는 아직 없다. 초기450 및 루트4a8609의 source검사/원격 이력은 최종GPU 검수로 바꿔 표시하지 않는다.

| 항목 | 최종 후보값 |
|---|---|
| runtime | chest3d.mjs9307B,기존5632B대비+3675B/초기후보대비+51B; SHA256 `4cfa51bafddd65e8fb6a1009eb63f5d10c2e3367052a9d32d8a97a2b95fdc442` |
| 예산 | 이전ea24 actualstatic3996899806+3675=**예상3996903481B/여유3096519B**, sidecar포함 **예상3996972963B/여유3027037B**. 새공식plan/artifact 미실행이며 Mac 실제값으로 대조해야함 |
| 전달 상태 | 초기4a용Mac작업문은 **native전송전 최종수정으로 보류**했다. 최종정확commit/privatepush/remote후 같은Mac에게정정된전체문 단회전달. 중복QA·과거수락재전송아님 |


## 2026-11-02 22:15 — 9d 상자 반사 후보의 실제 GPU 검수 마감

| 항목 | 실제 인수와 판정 |
|---|---|
| 소스/패키지 | runtime9d269179f4dccaf6fd48d6e2d93277181dc8b630/원담당6a41b622. 입력3349/mismatch0/selected3244·94논리93물리,공식build→prepare→check각1회 exit0. stage3238/3996972963B에서69482B sidecar이동 후 실제static3237/3996903481B·4GB여유3096519B/max94795327B. 이전예상값을실산출로인수했다 |
| 실제 경로 | 단일loopback의원본ea24/후보9d분리. module2/GLB2 fullGET200·MIME·SHA 및actualloadedmoduleSHA일치. actual AppleM5Pro/ANGLEMetal/Three r160/WebGL2/DPR1,1920×1080·3840×1080의64CSSpx 같은camera/pose fixture. 자연OS입력/보스처치/전체맵검수 아님 |
| A/B 한계 | 최초render전API setter로env-off freshA확인. 원본baseline과A는camera/PBR/exposure동일하지만배경particle차가있어전체pixel동일주장0. A→A2의닫힘·열림64px crop은각changedpixel0. B뒤A2는PMREM캐시보유이므로freshA비용으로세지않음 |
| 실측 비용 | 닫힘warm각116표본(첫10제외): GPUmean/p95 A0.383/0.515ms→B0.484/0.622ms,CPUmean/p95 A0.218/0.400→B0.203/0.400ms. 실제EXT_disjoint_timer_query_webgl2/disjointfalse·순차클럭/프로브오버헤드한계. 첫B CPU15.400ms/GPU0.914ms. texture4→7/geometry5→13/program3→7. 전체FPS/1%low·VRAM/heapbytes 인증이 아님 |
| 실제수명/폴백 | GLB차단→native2D/R보상·actualcontextlost,실GLB1800ms지연후dispose/late모델해제,첫actualrender호출의제어된Scene예외→catch/release. main dispose멱등·RAF정지/readyactivefalse·scenechildren0,고유dispose texture5/material5/geometry13각1회,expectedcontextlost확인. 자발적인GPU드라이버고장검사는 아님 |
| 잔여카운터 | main해제후JSrenderer.info texture1/program2/geometry0을그대로보존. source/PMREM해제이벤트·actualGLcontextloss·pageclose가근거이며모든카운터0·즉시VRAM회수·GC검수로가장0 |
| root실물 판정 | root는SHA/IHDR검증한4개의scale1 A/B strip과1920후보닫힘·열림전체원본2장을직접열었다. **RETOUCH/재질가독gate미달·반사환경방법미채택**: 일부모서리차이만미미하고금속/목재/잠금쇠·열린내측이여전히어두운회녹색덩어리다. 추가자원/밝기숫자로아트PASS를주지않음 |
| 보존/종료 | ordinary11/currentPrefs2 raw사전backup과사후13동일/installed5·WIP25·공유HEADbranchINDEXWORK·globalGitconfig·원본7014metadata 및이전ea24입력/출력10477metadata동일. 자기최종gain0/peak0/directvideo0,ownChrome잔여0·서버52927/61290 정상close뒤ps/listen0,사용자Chrome보존. 최초828B누락/옛Prefs2FAIL소급해소0 |
| 실패 근거 한계 | 초기prototype계측미연결·pause메뉴가림을교정한rawJSON/log/메뉴witness1장을보존. 담당이중복무효PNG등8723172논리B를삭제했으므로실패이미지byte전체보존은아님. 제품compile/GPU실패로오인하거나삭제로FAIL을숨기지않음 |
| 다음 | 새빛/환경강도/노출미세반복0. 기존원담당에source-only 국소알베도/금속·목재부위명암분리 한개방법후보를이어배정. 실패반사기본경로OFF·추가PMREM없음·수명안전보존·원텍스처/GLB/UV/형상/64px/게임수치불변을검증하고sameMac실1x전미채택. 새유료/생성/PCGPU0. 이문서마감으로새제품효과개선을주장하지않음 |

근거: root `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/chest-material-450a6bfa-intake-20261102/proof-final-9d2691/{FINAL_RECEIPT.json,REPORT.md,manifest.received.json,receiver-receipt.json,root-review.json}`. 원본6뷰·scale1배치의bbox/SHA는manifest와receipt에있다. runtime9d와이후docs-onlycheckpoint/공개·Windows·일반앱설치를구분한다.


## 2026-11-02 22:35 — 국소 재질7d와 최종 원본영상94e의 검수 후보 통합

이 절이 이전2546의 타이틀 선택동기화 대기와6a/9d 반사 후보 상태보다 우선한다. **private 검수용 소스 통합이며 새 GPU/브라우저 PASS·main/public/Unity/Windows설치 완료가 아니다.** 이전9d 실GPU기술PASS/재질RETOUCH 결과는 해당source의이력으로보존한다.

| 항목 | 정확 통합 계약·현재 증거 |
|---|---|
| 원천 | 기존상자owner7d7929a050305e6531a1a67fe83403e870087e0d의module/test와관련계약,최종title94e3a89eddf8339cb24192bf8ad97e4fed09bcf2의필수자산/module/test/tools만선택이식. wholemain/branchmerge0·사용자G원본/WIP수정0 |
| 재질 | chest3d.mjs10554B/SHA b1011604ad33361f7b0834b5fc324f1f507b987da2b1db0689d553fa0894f89d. 6a/9d 대비+1247B. 반사DataTexture/PMREM생성제거·scene.environment null,금속B smoothstep(.12,.55) 기반 선형RGB 국소 gain mix((2.4,1.65,1.05),(5,5.3,5.8)),RGB=1-exp(-RGB*gain). onBeforeCompile/uniform API·cache·해제·오류수치 전부 TRIPO_CHEST_GAME_20261102.md 최신후보표가정본 |
| 영상 | final-main 제공loop와byte동일 video/title_motion_C2_final_20261102.mp46192566B/SHA869895a608475b694d68718ad5af809e0dc8f6fd65204f04adf7db4f011827c3/2036×1016/24fps206frames8.583008초/무음. 신규생성·재인코딩·업스케일0. 원영상인물/달/구름 그대로+기존폭포2개만. 달plate/맥동/구름보강·합성정지판 소비0. 기존파일은 보존/현재소비와분리 |
| 타이틀 흐름 | 2036:1016 중앙cover·전해상도동일원본,모션감소/저사양은동영상의준비된프레임정지·폭포0. cold진입load,영상오류black+메뉴사용가능/media-error,폭포mask오류flowError는보강만중단. 이정확사용자final-as-is계약을과거달합성판정/일반배경확장요구로덮지않음. 현행상세숫자·좌표는스플래시문서최상단 |
| index 보호 | reviewed title 캐시변경·_titleArt정지판연결제거·phase2 titleLoop정지판draw제거의3hunk만. 나머지index전체byte는2546과동일하여완료한Init끝/earlyslot/savehelper교정을보존. game.html은923/2546과byte동일·상자충돌/보상RNG/AI/진행저장변경0 |
| 회귀 | 새재질·최종영상계약 RED13/PASS5→필수정확source반입후GREEN73. 관련16파일합본 **117/117 PASS**;별도보호회귀가슬롯초기값/legacy저장키/비타이틀helper변이3건을실제거절. 최초새GPU셰이더compile/캐시/색/입력/브라우저미검증 |
| 출고 | 공식selector3242,무손실94논리93물리. **sourceplan3236files3974718398B/4GB여유25281602B/max94795327B**(sidecar포함). 실제static복사/prepare/check아님. 기존3 close영상미선택·final영상1개선택. 기존C2보존자산/파생identity·원본은삭제0. 새공식artifact·wholemanifest/HTTP·decode/ActualGL은다음동일Mac검수 |
| 품질/전달 | 새국소재질은한방법한후보·未채택/실物미검증,기존재질RETOUCH. 직접목재/철테/잠금쇠·내측64px OFF/ON/A2와PMREM0/추가texture0/반복program수/GL·fallback·dispose검증필수. 최종타이틀은producer자체기록/原本직접뷰까지,새합본1920/2560/3840실브라우저검수로대체하지않음. public402/Windows미배송경계유지 |

근거: I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/chest-local-material-final-title-20261102/{source-candidate.patch,index-title-only.patch,red-combined.log,green-combined.log,integration-protection.log,official-source-plan.json,producer-material-REPORT.md}. 새코드·필수자산·docs정상commit/privatepush/remote후기존Mac同exact입력→공식buildpreparecheck→實shader/64px A/B·title3화면비루프/정지·오류·offline초기화·무음/保存/正常終了로이어간다.

## 2026-11-02 23:53 — 정확07081a 공식 산출·실GPU·원본1x 검수 인수

이 절은 22:35의 소스 검수 대기를 마감한다. 검수 runtime은 **07081a0cc5ba56f73b94ae1c445818946abdef1f**로 고정하며 뒤따르는 문서 전용 커밋을 새 runtime으로 재라벨하지 않는다. **상자 재질 가독성과 최종 제공 영상 타이틀의 한정 시각 PASS**, 최초 렌더 비용은 미해결·별도 확인 중이다. 전체 채택·공개·일반 앱/Windows 전달 완료가 아니다.

| 항목 | 실제 검수·한계 |
|---|---|
| 정확 입력 | 같은 기존 Mac UI/보호 checkout에서 APFS COW·변경18개 atomic 새 inode. 필수3355경로 Gitblob mismatch0/selected3242/무손실94논리93물리. game/Init끝/earlyslot/save·보상RNG/AI·기존원본불변 |
| 실제 공식 산출 | build→prepare→check 각1회 exit0. stage3236files3974718398B; prepare가69482B sidecar를상위receipt로이동. 실제static **3235files3974648916B/4GB여유25351084B/max94795327B**. sourceplan만으로PASS라한것아님/수동보충0 |
| config/receipt | config1a8bab831dc2e583724b2a5b6a6790d30467fb37c4dcf5ff3180fc87d87614b2 / 파생receipt64825b7c9bbf1e2c7dd80ef29ffcbe56902655a3a4ec7d56ec85782cc4c75a80. 8필수URL fullGET200/MIME/전체SHA·실loadedmodulebody일치 |
| 실GPU·재질 | Apple M5 Pro/ANGLE Metal/WebGL2/Three160,DPR1. 실제64CSS·1920×1080/3840×1080 닫힘/네이티브R160ms완전열림 baseline/OFF/ON/A2. root scale1strip4+1920전체2직접뷰: ON에서갈색목재결/차가운철테·잠금쇠/열린내측구분개선,OFF/A2복귀·실루엣/접지/전리품가독보존. **VISUAL VERDICT: PASS(이재질범위)**,모델전체AAA/자연전투품질PASS아님 |
| 자원·warm | environment null/새PMREM·추가texture0. baseline/A/B/A2 textures4/geometry5/program3. 실draw40회uniform전환에서program/자원/version/cache누적증가0. warm각첫10제외 A116표본 CPUmean/p95 .178/.400ms·GPU .382/.511ms, B117표본 .145/.300ms·.391/.451ms,A2 137표본 .158/.300ms·.386/.514ms. 개별overlay계측이며전체FPS/1%low/VRAM인증0 |
| 최초 비용 HOLD | 첫Scene.onBeforeRender→onAfterRender CPU baseline30.4ms/새A271.2ms. compile/submission/JIT/cache상태가다른1회관측이므로shader단독인과·전체게임멈춤확정0. 수치를숨기거나warm으로상쇄하지않음. 같은Mac에서최대4개의순서교차freshbrowser계측/실render·GLcompile/link·longtask분리후최소후속결정. 현제품값변경0 |
| 실패·수명 | GLB실패native2D/R보상·lateGLB폐기·idempotentdispose/RAF정지·scene비움/owncontextlost·이번후보texturegeometryprogram0 확인. 최초invalidGLSL probe는진단배열초기화오류로false/원문보존;그case만교정후실compileCalls2/문법오류1→제품onShaderError throw/catch/release/nativeR PASS. 원false를소급PASS로덮지않음 |
| 최종 영상 타이틀 | 제공영상6192566B/SHA869895a608475b694d68718ad5af809e0dc8f6fd65204f04adf7db4f011827c3 그대로+폭포2개뿐. 실제1920/2560/3840×1080각10.8993/10.8978/10.8979초 loopwrap·달/부츠/메뉴/가로넘침0. root세화면원본직접뷰 **PASS(현final-as-isbrief)**. 3840달상단약11.91px/부츠하단981.34px;옛배경확장brief검수와별도 |
| 픽셀·정책·입장 | 같은decodedcanvas3840 t1/1.1·t3/3.1의4프레임에서폭포support밖변경0px/haircape/body/sky/rock기저영상동일. farbridge coreY494~514 maskalpha0(경계493/515 blurfeather한계). OS/localreduce·lowtier·atmos0·coldreduce같은영상정지,videoerrorblack+메뉴/fallerror영상유지·보강OFF·hidden/destroy PASS. 실제title→cinematic skip→demo→빈offline→허구QA생성game입장·pageerror0/earlyInit TDZ0. 자연전투/liveAPI인증0 |
| 보존·종료 | ordinary11/currentPrefs2 현재13형태byte·installed5/WIP25/공유HEADbranchINDEXstatus·원본7014/기존9d7034·ea2410477metadata差0. 자기gain0/peak0/Direct0. 自Chrome잔여0/loopback55371:61660 정상SIGTERM·PIDlisten0,사용자Chrome49060보존. 최초828B누락·옛PrefsFAIL소급해소0 |
| root 원본 인수 | 19files16431165B fullSHA일치·PNG12 IHDR대조. root원본/무변형scale1배치10장직접뷰. 비교순서1920baseline/A/B/A2·3840A/B/A2. 소형증거수신은Windows제품배송과별도. 실패·현재비교원본삭제0. root기록저장64000B제한거절후native가이어진운영오류는영수증에보존·단회수락/재전송0 |
| 미완료 | cold비용인과·자연전투/전체맵·physicalmonitor/OS손입력/NW/Unity/전체FPS·main/public/Windows/일반앱배포별도. public402기존계정미납원인·같은CI실패반복0. 9d반사RETOUCH는이력유지/새local방식과구분 |

근거: root I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/chest-local-material-final-title-20261102/proof-final-07081a/{REPORT.md,FINAL_RECEIPT.json,official-artifact-commands.json,performance-resource-summary.json,preservation-and-return.json,manifest.received.json,receiver-receipt.json,root-review.json}; Mac _out/web-local-material-final-title-07081a-qa-20261102. 이번은실산출과동일candidate의원본검수이며source117회귀와구분한다. 문서만마감하므로runtime/suite/영상재생성0.

## 2026-11-03 01:00 — 최초 렌더 4case 진단 마감과 준비 단계 후속

직전 절의 최초 비용 진단 대기를 마감한다. 동일 runtime **07081a0cc5ba56f73b94ae1c445818946abdef1f**의 제품·산출물 byte는 바꾸지 않았고, 기존 271.2ms 관측과 원시 실패 자료도 보존했다.

| 항목 | 최종 인수·다음 범위 |
|---|---|
| 교차 순서 4case | 새 자기 browser A: baseline→후보ON 첫 renderer.render entry→return 24.1/24.6ms, 다른 새 browser B: 후보ON→baseline24.1/25.5ms. 각각Metal/Three160/동일64CSS·camera·world·pause/4texture5geometry3program. 추가 동기GL조회·cache삭제·제품 변경0,case4초과0 |
| 271.2ms 해석 | 예전firstStart 뒤진단getExtension/getParameter/getSupportedExtensions와 매compileShader 뒤 추가COMPILE_STATUS 조회가포함됐다. 동기대기를혼입시킬수있는구체경로확인. 이번cache조건에서는271.2가재현안됐으나,추가조회만의단독원인·완전coldcache·후보성능완치확정0. 초기invalidprobe진단TypeError와정상case271.2를혼동하지않음 |
| 남은 공통 비용 | 기존r160 getProgramInfoLog3회합16.4~17.6ms가주대기관측위치. shadercallback과compile/link호출자체는clockresolution아래~.1ms이며절대0아님. GLBloadAsync20.5~27.6ms/첫textureupload호출CPU1.1~1.2ms별도. rAFgap40.9~43ms는overlay간격/전체FPS아님. 58/56ms LongTask는첫visible진입보다약44ms앞에끝나첫draw원인으로귀속0 |
| 진단·보존 마감 | turn01a19cc0 2026-11-02T15:08:13Z completed/14분20초. 자기Chrome A/B 정상close잔여0,자기server56820/62001 정상SIGTERM 뒤PID/listen0. ordinary13/raw6files·installed5/WIP25/공유HEADbranchINDEXstatus/원본7014·frozen07081/9d/ea24metadata/기존19증거SHA불변. 첫828B누락·옛PrefsFAIL소급해소0 |
| 다음 최소 source 단위 | 기존상자owner의같은7d privatebranch에서해당상자shader준비만최초visible보다앞으로옮기는취소가능준비후보를TDD로구현중. 현재r160 public compile/compileAsync/KHR/isReady/getUniforms 실제원문검토. 단순await compileAsync 뒤disposed검사만으로내부폴링·dispose경합안전PASS0;준비중dispose/late/error/중복해제/타이머RAF·unhandled rejection을RED→GREEN으로증명. KHR없으면기존안전경로·debug shader오류폴백보존 |
| 미검증·전달 | 새준비후보는아직소스구현중/원격·GPU·firstvisible개선미인수. 새제품코드·이문서의성능완료선언0. source완료뒤root정확module차분과관련docs만선택→정상checkpoint→같은Macfreshartifact/실첫사용·수명·오류·보존검수. 타이틀/재질gain/노출/크기/게임수치·보상RNG·저장·원GLB/texture불변,PC usergame·타Unity보호/새GPU0. main/public/Windows·일반앱전달과별도 |

근거: Mac _out/web-local-material-final-title-07081a-qa-20261102/{cold-render-REPORT.md,cold-render-receipt.json,cold-render-analysis.json,cold-render-raw.json,cold-preservation-return.json,proof-transfer-closeout.json}. root recovery/heartbeat-1553-cold-complete-raw.json은실제생성명령·결과·종료원문을보존한다. 원본 재촬영·85걷기/타이틀 전체 suite·build 반복은 하지 않았다.

root 정확파일 인수: cold-profile-closeout/cold-render-REPORT.md 8871B/SHA c75d865ab84cca34e029bdf39d40ba0bd7c5427af52decc8d2c610fd90e1fad9. Mac receipt48408B/SHA a6b46af388a28193ae38db0557a9fbcf1820b86043a37c07259857d5f824407d는metadata와요청필드원문인수이며root전체파일복사완료로주장하지않는다.

## 2026-11-03 01:16 — 취소 가능한 상자 준비6299의 합본 소스 후보

이번은 새소스 후보 통합이며 기존07081a 실GPU·1x PASS와 별도다. root baseline577ecaac2d152b36437e8a58ff2917a0da8c4fda 위에 원담당 **6299db9aa7763453b06208305b2dacc9587b0d2a**의 module/test만 정확 인수했다. 원 담당 branch 전체·구형 index/game·다른 문서를 통째로 병합하지 않았다.

| 항목 | 계약·검증·미검증 |
|---|---|
| 정확 모듈 | chest3d.mjs13681B/SHA e0fe0899ac70bc9f1ed834d919c63f358c7819344a559e5966d146b4032975ed,기존10554B대비+3127B. 새helper모듈/자산/texture0. 기존 localalbedo/mask/gain/cacheid/빛/노출1.25/fov40/64CSS/몸통44×24/R·보상RNG/AI/save 불변 |
| 준비 순서 | Three/GLB·기존재질/그림자뒤 prepareChestRenderer(renderer,scene,camera,{signal}) 완료후ready=true. KHR지원때publiccompile1회·yield전material.currentProgram 고유Set캡처→기존isReady(KHR완료)→고유getUniforms(onFirstUse diagnostics)1회. 추가COMPILE_STATUS/진단getProgramInfoLog0/debug오류검사끄기0 |
| 수명·상한 | CHEST_PREPARE_POLL_MS=10ms/CHEST_PREPARE_TIMEOUT_MS=5000ms 경과제한. 동기GL선점·harddeadline보장0. privateAbortController를release전에abort·timer/RAF/listener/참조해제·이미queuedcallback/취소재진입재예약0. KHR없음unsupported·기존안전firstdraw. 준비결과ready/unsupported/cancelled/실패reject, snapshot.preparation status/pollMs/timeoutMs 관측 |
| 실패·게임 보호 | 준비중native2D/상호작용 유지·ready/active/isShowing false·중복load0. compile/poll/getUniforms/해제program/contextlost/timeout/falseyreject는failed/2Dfallback·1회해제/ownRAF정지. 늦은GLB는disposed/failed 모두폐기,dispose가resolve/rejectcontinuation보다우선하면ready/failed부활0. actualR보상1회는다음실GPU검수 |
| 소스 회귀 | root새계약 **18FAIL/10PASS RED**(기존module)→정확module반영후45GREEN. 관련16파일 **137/137 PASS**,타이틀/Init끝·earlyslot/legacy저장키·출고closure·보호음성회귀 포함. 원담당40CPU와구분;실GPU/성능검수로대체0 |
| 공식 SOURCE plan | selected3242/94논리93물리,sidecar포함3236files **3974721525B/4GB여유25278475B/max94795327B**. prepared예상3235files3974652043B/여유25347957B,69482B sidecar 이동전제. 아직새actualbuild/prepare/check·모듈HTTP·GPU아님/기준완화0 |
| 동등성 | gameSHA02c8a60ca1d01dbc589cb0131db91dc420a5151278118c897aa1b621930ba06f/index/titleJS/finalMP4/GLB·vendor·94매핑 byte불변. 이전07081a색·시각PASS는이새준비후보의동등성검증을소급대체하지않음 |
| 다음 실제 gate | 코드+docs정상privatecommitpush/remote뒤동일기존Mac exactCOW입력/全Gitblob→fresh공식artifact→baseline07081a 대비같은materialON/64CSS/camera의firstvisible와준비메인스레드/rAF/longtask/GLB→ready→3D전체시간교차A/B. 단순히stall을준비구간으로옮겨개선이라고하지않음. native2D/Rpending보상1회·KHR미지원·실shader오류/prepare中dispose/contextloss/timeout/lateGLB·원본같은색/그림자·자원4/5/3/무음保存/종료검수. 최종영상3비율10초/85walk전체반복0 |
| 한계·전달 | source후보/未GPU·未채택. userDota/타Unity보호·PCGPU/Player/build/encoding/서버/대형LAN0. 공개402·main/public/Unity/일반앱/Windows설치별도. 원본/WIP/기존13save/외부guard보호 |

근거: root recovery/chest-local-material-final-title-20261102/cancellable-prepare-intake/{producer-REPORT.md,producer-git-receipt.json,candidate.patch,red-root.log,green-root.log,integration-root.log,official-source-plan.json}; 원담당 I:/EXODUSER-Storage/tripo-chest-game/20261103/cancellable-shader-prepare. 기존root冷진단4case와새준비후보GPU gate를분리한다. source/code·test정확차분과관련8docs만정상commit하며main/CI재실패유발0.


## 2026-11-03 02:00 — 617807 실검수 마감: 수명 통과·성능 재작업

검수 runtime은 **61780714409fffe1fd954277a3d3bf92f4757c89**, 비교 baseline은07081a 실제산출물/local-albedo ON이다. 기존색·GLB·game·타이틀·94매핑 byte를 보존했다. **전체 성능 RETOUCH / 미채택**이며 첫 그리기 구간 단축만으로 전체 표시 개선이나 공개 전달을 선언하지 않는다.

| 실검수 항목 | 결과·범위 |
|---|---|
| 입력 절차 이탈 | 최초3347/4교체는 비ASCII Git경로인용으로 한국어문서6개가 빠진 상태였다. build뒤 NUL구분으로 교정·최종3353/mismatch0/추가6새inode. 최초manifest/journal 보존, 처음부터 전수docs gate를 충족했다고 하지 않음. 런타임입력은 정확했고 문서교정은 산출물에 영향없음. 같은build 반복0 |
| 공식 산출 | fresh build→prepare→check 각1회 exit0(개별명령로그 인수로 확정). 실제3235files3974652043B/4GB여유25347957B/max94795327B. sidecar69482B는상위receipt, config1a8bab831dc2e583724b2a5b6a6790d30467fb37c4dcf5ff3180fc87d87614b2/derivedreceipt64825b7c9bbf1e2c7dd80ef29ffcbe56902655a3a4ec7d56ec85782cc4c75a80. 07081대비module만+3127B, 나머지3234파일 전체SHA동일·수동보충0. module/GLB baseline+candidate4URL fullGET200/MIME/SHA·실modulebody일치 |
| 실제GPU·시각 | M5 Pro/ANGLE Metal/WebGL2/Three160/KHR지원·64CSS/DPR1·1920/3840×1080 닫힘/실R160ms완전열림. producer원본4strip+대표fullview에서목재/철테/잠금쇠/내측/접지·전리품회귀없음한정PASS. 정상실GLSL6개길이/SHA전부동일·textures4/geometry5/program3. 배경/입자/전리품이서로다른시각이라합성RGBA차0을주장하지않음. root원본직접판정은별도인수기록 |
| 준비·수명 | 실제compile1회→isReady false/true→program3개getUniforms각1회후ready. 준비중native2D·실R보상1회/중복0·body중심차단, 취소/저장callback사후호출·owncontextlost·실GLB지연resolve·unsupported·제품5000ms실timeout5015.3ms·실invalidGLSL→failed/release/native2D/R 등10체크PASS. 제어isReady·확장미지원·GLSL주입과자발오류를구분. late-reject별도변형/WASD전체/자연전투미반복 |
| 종료·보존 | own60284/62309정상SIGTERMexit0후PID/listen없음·자기Chrome잔여0/userChrome49060보존. ordinary13/raw6·installed5/WIP25/sharedHEADbranchINDEXstatus/globalconfig·원본7014/기존07081input/artifact7041·9d7034·ea2410477metadata·19증거SHA동일. 자기gain0/peak0/direct0,사용자Dota/OBS/master변경0. 첫828B누락/옛PrefsFAIL소급해소0 |

| browser·순서 | case | 첫visible render CPU ms | prepare compile ms | 준비→uniforms ms | GLB→첫3D제출 ms | fixture→첫3D제출 ms | 인접rAF최대gap ms |
|---|---|---:|---:|---:|---:|---:|---:|
| A/1 |07081 ON|26.9|0|0|59.8|134.8|44.0|
| A/2 |617 ON|4.8|2.9|16.2|44.9|76.6|21.9|
| B/1 |617 ON|4.7|2.7|15.9|63.8|148.9|21.5|
| B/2 |07081 ON|23.8|0|0|61.8|98.4|40.0|

첫순서끼리후보의GLB→제출+4.0ms/fixture→제출+14.1ms,두번째순서끼리-16.9/-21.8ms로혼재한다. fixture 직전 mark→첫 관측 rAF callback 경과65.2/68.8ms(설치 시각 아님)·LongTask57/58ms가남았고 인접rAF만으로이를숨기지않았다. 네case의cache·순서변동으로제품인과/전체지연합격을확정하지않음. 첫3D제출은CSSvisible render복귀proxy이며OS/compositor표시시각이아니다. warm10CPU mean/p95 A-baseline .220/.400,candidate .340/.400;B-candidate .270/.400,baseline .370/.500ms는개별overlay표본이다. 전체FPS/1%low/VRAM/physicalmonitor 인증0. 과거271.2ms/이전4case24.1~25.5는그대로보존하고새측정으로재라벨하지않는다.

현재root인수근거: recovery/heartbeat-1655-mac-qa-raw.json 및 chest-local-material-final-title-20261102/prepare-617807-final-root-intake. 원본·최종REPORT/receipt를별도인수하고다음최소한건은남은최초초기화구간원인검토로한정한다. 동일4case재실행·미세poll/색/노출값탐색으로성능PASS를만들지않는다. main/public·Windows/Desktop/일반앱·Unity전달은없다.

root 추가 인수: 최종 REPORT11948B/SHA5a27f13443f54377f4749375040c42fa89df02f3a754f4a76e982a028359b3de 및 FINAL_RECEIPT85683B/SHA656518842a6b8dda68c5da8f10520c493de0267e4201b411279b279d2146a209 포함16파일9162403B 전수SHA일치·PNG6 IHDR일치. root 비교strip4+1920open/3840closed 원본2를 직접 보아 목재·철테·내측·접지의 눈에 띄는 회귀 없음으로 한정 시각PASS. 성능RETOUCH/미채택 유지. 서로 다른시각 합성RGBA차이를 0으로 덮지 않았다. 소형sender61185/62555는새READY뒤만시작·/done200 정상종료요청,최종PID/listen종료인수는별도영수증. 후속은같은기존sourceowner의57/58ms초기화·observer시작점 읽기분석 한 건뿐이며제품변경/새GPU재측정0.

## 2026-11-03 09:13 — 617807 초기 구간 읽기 감사 원문 인수

기존 읽기 감사의 REPORT.md 14,211B와 receipt.json 14,619B를 root가 정확히 인수하고 재결합·디스크 readback SHA를 대조했다. 이번 문서 정정은 새 측정이나 제품 개선이 아니다. 검수 runtime617807과 기존 네 case·271.2ms 원문을 보존하며 **전체 성능 RETOUCH / 미채택**을 유지한다. 앞선 단계의 후속 읽기 분석 대기는 이 원문 인수로 마감한다.

| 항목 | 확정한 범위와 해석 제한 |
|---|---|
| 시계·mark | raw에 performance.timeOrigin이 없어 페이지 간 UTC/절대시각 교차 비교 불가. F는 fixture 삽입 직전, L/D는 loader wrapper 진입/Promise 해소 관측, E/S는 renderer.render 진입/CPU 반환이다. 삽입 완료·GPU 완료·실제 presentation 시각이 아니다 |
| 초기 LongTask | A1 11661.7→11718.7ms(57.0), B1 11477.3→11535.3ms(58.0)는 각각 getContext 시작11720.5/11537.0보다1.8/1.7ms 먼저 끝난다. 해당 getContext나 이후1×1 texture upload로 귀속 불가. constructor 진입 mark도 없어 context 이전 constructor 부분/공유 초기화 원인은 미확정 |
| 첫 rAF callback | F→첫 관측 callback은 A1 65.2/A2 25.6/B1 68.8/B2 30.4ms다. observer 설치 시각이나 callback 두 개의 간격이 아니다. rAF 인자 timestamp 대신 callback 중 performance.now()를 기록했고 초기 전체 frame gap은 복원 불가 |
| ready·native2D proxy | native2DPossibleWaitProxyMs=min(readyObserved,E)-F. baseline은 E(107.9/74.6ms), candidate는 중첩 microtask sample(71.3/130.1ms)을 선택해 endpoint가 다르다. 실제 ready 대입·active/isShowing 전환·native2D 마지막 draw 지속시간 비교에 사용하지 않는다. B1 sample→E14.1ms도 준비 CPU/2D 종료로 합치지 않는다 |
| analyzer 경계 | maxRafGapWhollyAfterGlbStartThroughFirst3D는 start>=L/start<=S만 선택하고 end<=S를 검사하지 않는다. 기존 이름·값을 전체 구간 최대 task나 정확한 구간 내부 gap으로 확대하지 않는다. analyzer/summary 원본 수정·새 실행0 |
| 유지하는 실제 관측 | E→S baseline26.9/23.8ms·candidate4.8/4.7ms와 F→S134.8/98.4ms·76.6/148.9ms는 기존 네 case의 CPU 호출/elapsed 관측이다. 전체 표시 지연 개선의 통계·인과·완전 cold cache·FPS/1%low/VRAM/physical monitor PASS가 아니다 |
| 보존·다음 | 기존 입력8개 SHA와 캡처 정밀도의 metadata 동일. 원 capture가 JS Number를 거쳐 ns 정밀도가 반올림돼 원본 ns 완전 동일 주장은 하지 않는다. 읽기 원문 두 파일의 이번 before/after size·SHA·mtime/inode는 동일. 새 Chrome/GPU/build/server·측정 case0. 다음 계측이 필요하면 별도 한정 후속에서 같은 clock/phase mark·최대1case만 검토하며 이번 인수가 실행 허가는 아니다 |

원문 SHA: REPORT.md `04543a75ae5a1c72dc0f5692663dec166867e59a1a04fe4c040feb47315a9683`; receipt.json `b884639803e88db8572cde2a89abacfdd0601dc008cd143a6afee919af835e00`. root 보존·검산 근거: recovery/web-617-initial-audit-exact-intake-20261103-0004/{REPORT.md,receipt.json,root-receipt.json}. 코드·자산·94파생매핑·실제 산출물은 바꾸지 않았고 main/public/Windows/Desktop 전달도 없다.
