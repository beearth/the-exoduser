# 렌더러 비교 버전 웹 재배포 — 2026-09-10

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
| 게임 변경 | 이 배포 보정은 설정·스테이징만 변경. 렌더러/맵/전투 코드는 fc623f6 그대로 |
| 실기 상태 | 배포 성공 여부와 별개로 Mac Chrome/Safari 동일 장면 세로 띠·이동·전투·FPS 비교는 PENDING |

Vercel 설정 근거: [Build 설정](https://vercel.com/docs/builds/configure-a-build), [vercel.json](https://vercel.com/docs/project-configuration/vercel-json). 실제 배포 완료/원문 해시/브라우저 시작 로그는 후속 확인 후 기록한다.
