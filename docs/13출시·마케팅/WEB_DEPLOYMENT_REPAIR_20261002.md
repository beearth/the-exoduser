# 웹 자동 배포 실패 복구 — 2026-10-02

| 항목 | 현행 계약 / 검증 근거 |
|---|---|
| 작업 범위 | Vercel `fordeargamers/the-exoduser`의 웹 패키징·GitHub Actions 배포만 수정. 기준 GitHub main `aacc7b02bef9d5cd7db6ea5d6466d7b8e4c11a3c`. 공유 PC의 미완료 변경·Steam/NW 빌드·세이브는 반영하지 않음 |
| 격리 작업본 | `G:/exoduser-web-repair-20261002`; 공유 `G:/exoduser`의 HEAD·브랜치·인덱스·작업 파일을 변경하지 않음 |
| 확인된 실패 | `f50232c`의 Vercel 로그가 `Downloading 6267 deployment files...`에서 끝나고 45분 제한 초과. 테스트/게임 코드 실행이 실패 원인이라는 근거는 없음. 하위 전송 정체 원인은 확정하지 않음 |
| 기존 과대 산출물 | 해당 커밋의 기존 웹 선택 규칙: 6,264개, 7,093,185,953바이트. 전체 Git 저장소 크기와 배포 산출물 크기를 구분함 |
| 웹 선택 | `selectWebRuntimeFiles()`가 공통 FILES의 루트 진입 파일과 실제 HTML/JS/CSS의 에셋 리터럴·동적 접두사를 재귀 추적. 언어/루트 아틀라스, 계산되는 sfx/sprites/localization, Three/vendor/3d 상대 의존성 유지. 단순 디렉터리 전체 복사를 대체 |
| 제외 | 참조 없는 이전 음악·영상, 맵 master PNG와 `*_sources`, `_unity_preview`, `_p11_candidates`, `_grok_qa`, `assets/video-bases`, `assets/video-tests`, zip/blend/psd/kra 제작 원본. 실제 선택 가능한 WAV는 재인코딩 없이 보존 |
| 활성 타이틀 필수 파일 | `video/title_motion_hd_20260929.mp4`; 참조되지 않는 이전 `video/title_motion_hd.mp4`를 필수 검사로 강제하지 않음 |
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
| 정리 검증 | 범위 이탈 전 취소 금지, READY 보존·여러 배치의 대기열 비우기, 인증 오류 비밀값 비노출의 회귀3개. 실제 원격 정리 결과는 완료 후 기록 |

API 근거: [배포 목록](https://vercel.com/docs/rest-api/deployments/list-deployments), [진행 중 배포 취소](https://vercel.com/docs/rest-api/deployments/cancel-a-deployment).
