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
