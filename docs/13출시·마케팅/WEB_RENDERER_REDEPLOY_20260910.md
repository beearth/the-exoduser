# 렌더러 비교 버전 웹 재배포 — 2026-09-10

> **대상 정정:** hell-smoky는 다른 프로젝트였다. 실제 사용자 서비스는 **the-exoduser.vercel.app**. 아래 검증은 hell의 이력으로 보존하며 [대상 정정](PRODUCTION_TARGET_CORRECTION_20260910.md)을 우선한다.

사용자 지시: 렌더러 비교 수정 후 “배포다시해봐”. 대상은 기존 `.vercel/project.json`의 hell 프로젝트, 실제 Production 도메인 `hell-smoky.vercel.app`.

| 항목 | 내용 |
|---|---|
| 렌더러 커밋 | `fc623f6a1807cf35b08088f01859c6bd254465d8`, main에 정상 fast-forward 푸시. 미커밋 작업 제외 |
| 배포 전 원문 | Production game.html을 직접 다운로드. Mac+navigator.gpu 자동 선택 OR 조건 존재, 새 policy 표식 없음. `captures/renderer_optin_20260910/production-before.html` |
| 첫 자동 배포 | 동일 저장소가 hell/the-exoduser/hell-build에 연결됨. hell은 대기열, the-exoduser 빌드는 ENOSPC 실패. 로그: 출력9310MB, .git pack7280MB, node_modules651MB |
| 원인 | 루트 전체를 정적 결과로 처리하면서 제작 중간 영상·소스·백업을 다시 복사. 단순 렌더러 변경과 별개의 배포 공간 문제 |
| 웹 빌드 | `tools/build-web.mjs`, Node 내장 모듈만 사용. `vercel.json`: framework=null, buildCommand=`node tools/build-web.mjs`, installCommand=`echo Static web build uses Node built-ins only`, outputDirectory=`web-dist` |
| 포함 규칙 | `build-nwjs.mjs`의 FILES·DIRS 런타임 목록 재사용, root lang_*.js/atlas_* 추가. Git 추적 파일만 포함. Node/NW 부트스트랩·전체 output/cinematic·백업·tools·의존성·Git 이력 미포함 |
| 에셋 유지 | assets/img/sprites/bgm/sfx/video/localization 및 필요한 output/imagegen 경로. BGM WAV도 실제 선택지에 있으므로 보존. 동적 경로 누락 방지를 위해 런타임 에셋 디렉터리 전체 포함 |
| 제작 파일 제외 | /_unity_preview/, /_p11_candidates/ 및 zip/blend/psd/kra 확장자. output 전체를 제외하는 방식은 아이템/로고 에셋을 누락시키므로 사용하지 않음 |
| 디스크 | 같은 볼륨에서는 hard link로 스테이징 복사 공간 절감. EXDEV/EPERM/EACCES/ENOTSUP이면 파일 복사. 기존 출력 디렉터리는 삭제하지 않고 실패. 새 workspace 하위 경로만 허용 |
| .vercelignore | web-dist/ 추가, 다음 CLI 소스 업로드에 생성 출력이 다시 포함되는 것 방지 |
| 사전 검증 | 실제 추적 에셋5566개 스테이징 성공, 약5.40GB. fc623f6 커밋의 index/game 기존 로컬 직접 참조84개 누락0. runtimePackaging 테스트2 PASS. 미커밋 character-story-player 참조는 배포 대상 커밋에 없으므로 구분 |
| 게임 변경 | 이 배포 보정은 설정·스테이징만 변경. bb67f07에는 동시 작업에서 커밋한 화염 영역 광원 제한14842392e·시네마틱v21 d63bf222b도 선행 커밋으로 포함됨. 렌더러 선택식은 fc623f6 유지 |
| 실기 상태 | 배포 성공 여부와 별개로 Mac Chrome/Safari 동일 장면 세로 띠·이동·전투·FPS 비교는 PENDING |

Vercel 설정 근거: [Build 설정](https://vercel.com/docs/builds/configure-a-build), [vercel.json](https://vercel.com/docs/project-configuration/vercel-json). 실제 배포 결과는 아래 기록한다.

## 후속 빌드 수정

`bb67f07`의 hell 배포 `8JDNnkkZ577bYzMZedsHofJ48etn`은 `.vercelignore`가 먼저 제거한 `bgm/2장_벌레굴/hell2_insect.mp3`를 git 추적 목록에서 다시 복사하려다 ENOENT로 실패했다. 추적 파일 중 `existsSync(resolve(root,p))`로 실제 소스가 존재하는 것만 선택하도록 수정했다. 필수 runtime 파일5종 검증은 유지한다. 기존 출력/원본을 삭제하지 않는다.

| 후속 검증 | 결과 |
|---|---|
| 실제 오류 재현 fixture | 독립 임시 Git 저장소에서 추적된 BGM만 배포 제외 상태로 만든 뒤 실제 build-web 실행. 누락 BGM 건너뜀·필수5파일 출력 PASS. `tmp/verify_web_missing_source_20260910.py` |
| 전체 스테이징 | 현재 로컬 추적 파일5568개, 5,481,735,443바이트 성공. 동시 작업 파일을 포함한 빌드 도구 검증이며 아래 고정 production 배포물과 구분 |
| 문법 | Node --check tools/build-web.mjs PASS |

## 독립 prebuilt 배포물

| 항목 | 값 |
|---|---|
| 고정 소스 | bb67f07c20f1590f0740bee7d6d7d2628615386b |
| 스테이징 | tmp/web-production-bb67f07-20260910/.vercel/output/static |
| 포함 | .vercelignore 규칙까지 적용한5519파일, 5,282,796,361바이트. 모든 파일을 고정 Git blob과 해시 대조. 현재 미커밋 변경·후속 커밋 배제 |
| 게임 SHA256 | bc0bb736edf66bff08a231ca749861df77493cac1e4be0bc639deb731de9780a |
| 인덱스 SHA256 | cd6fedcedd27caa346559db8ad7ff5736e439987d25dfa70fb15a080f64068a4 |
| 라우트 | Build Output API version3, /→/index.html, 파일 경로 그대로 서비스. 전체 nosniff, game/index HTML no-cache/no-store/must-revalidate |
| 배포 방식 | 로그인된 Vercel CLI deploy --prebuilt --prod --yes, hell 프로젝트에 직접 업로드. sourceCommit 메타데이터 기록. 기존 실패 GitHub workflow34442083088 취소 |
| 재현 증거 | captures/renderer_optin_20260910/prebuilt-manifest.json |

## Production 결과

| 항목 | 확인 결과 |
|---|---|
| 완료 | 2026-09-10 15:23:47 KST, Vercel READY. CLI 정상 종료 및 https://hell-smoky.vercel.app alias 연결 확인 |
| 배포 ID | dpl_95FTUns7y3nzYwFFCnxX2767e4yr |
| 배포 URL | https://hell-11cyl1npt-fordeargamers.vercel.app |
| 소스 메타데이터 | CLI가 외부 작업 디렉터리의 Git HEAD c492b0d를 자동 표시하지만 실제 정적 파일은 위 bb67f07 고정 Git blob과 전수 대조한 결과. 별도 sourceCommit=bb67f07 전체 해시 지정 |
| 공개 원문 | production-after.html/game 및 production-index-after.html/index의 SHA256이 위 두 기대값과 정확히 일치. Mac 자동 WebGPU OR 제거·url-opt-in 정책 로그 포함 |
| 타이틀 영상 | /video/title_motion_hd.mp4 HTTP200, video/mp4, 7,612,715바이트, Accept-Ranges: bytes |
| 실제 시작 로그 | 공개 주소에서 Windows Chrome153, 기본·webgpu=0 모두 _useGL=true/_useGPU=false, GL.VERSION=WebGL 2.0 (OpenGL ES 3.0 Chromium), policy=url-opt-in-20260910, pageerror0. AMD RX9070XT D3D11. `captures/renderer_optin_20260910/production-boot-report.json` |
| 중복 작업 | GitHub workflow34442083088 취소. 34443175618은 이미 종료됨. 대기 Vercel hell-build/FMeU1zZbb 및 the-exoduser/9saHApU4A 취소. 이전 the-exoduser/AowsyR49S는 자체 완료되어 추가 취소하지 않음 |
| Mac 상태 | Chrome/Safari 실기 비교 PENDING. 배포 성공을 세로 띠 해결로 판정하지 않음 |
