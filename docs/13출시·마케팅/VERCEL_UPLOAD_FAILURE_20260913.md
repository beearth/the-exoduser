# Vercel 업로드 실패 대응 — 2026-09-13

## 2026-09-28 누적 변경 게시 준비

| 항목 | 현행 계약 |
|---|---|
| 대형 제작 원본 | `assets/map/ch1/production_finish/CH1_1_PRODUCTION_MASTER.png`, 117,083,377바이트. GitHub 일반 Git 파일 한도를 초과하여 `.gitattributes`에서 이 파일 1개만 Git LFS로 저장. 원본 픽셀·파일 바이트는 변경하지 않음 |
| 웹 제외 | `tools/web-runtime-manifest.mjs`의 `isMapAuthoringSource()`를 `tools/build-web.mjs`에서 사용. CH1 제작 MASTER PNG 및 같은 production_finish 하위 `outer숫자_sources/`, `skin숫자_sources/` 디렉터리를 정적 출력에서 제외 |
| 실제 런타임 | `chunk_x_y.png`, `layout.js`, `composition.json`, `retouch-layers.json`은 유지. 게임이 요청하는 청크·레이아웃 경로를 제거하거나 변경하지 않음 |
| UI 파일 누락 보완 | `build-nwjs.mjs`의 공통 FILES 목록에 `lobby-ancestor-art.css`, `growth-tree-detail.css`, `growth-tree-fixed-background.css`, `growth-tree-information.css` 추가. 웹 빌드도 이 목록을 재사용하므로 기존 HTML이 참조하던 네 스타일이 정적 출력에 포함됨 |
| 원본 복원 | 맵 재제작 작업에는 Git LFS 원본이 필요. 새 체크아웃에서 해당 원본 작업 전 `git lfs pull --include="assets/map/ch1/production_finish/CH1_1_PRODUCTION_MASTER.png"` 수행. 웹 빌드는 이 원본을 사용하지 않음 |
| 검사 | `test/vercelUpload.test.js`: MASTER·제작소스 제외, 런타임 청크·레이아웃 유지, 로비/게임이 참조하는 루트 스타일시트의 FILES 포함 검사 추가. 실제 정적 출력의 15,000개/100,000,000바이트 기존 제한 검사는 유지 |
| 게시 범위 | 현재 작업 브랜치의 누적 코드·런타임 에셋·제작 원본·관련 docs. 커밋/푸시/배포 결과는 실제 실행 후 별도 기록 |
| 로컬 최종 빌드 | 2026-09-28 `tmp/publish-20260928/web-2`: 파일6,152개, 합계6,770,082,160바이트, 최대91,967,847바이트. 파일수/개별크기 검사 통과, index.html/game.html의 정적 참조 누락0. 회귀291/291·게임가드·staged docs 게이트 통과 |

| 구분 | 확인 사항 |
|---|---|
| 실패한 실행 | Deploy and Build #1077, run34742542943, commit37435ea |
| 성공 단계 | GitHub checkout, Vercel 인증·프로젝트 연결, production 환경 로드, 웹 빌드 |
| 실패 단계 | vercel deploy --prebuilt --prod --archive=tgz; 약5GB 전송 중 3.8GB 표시 뒤 fetch failed, exit1 |
| 확정 범위 | 배포 파일 전송 실패. 로그만으로 네트워크 단절·전송 제한 등 하위 원인을 단정할 수 없음 |
| 별도 경고 | Node20 액션 런타임 경고와 post-checkout 정리 시 잘못된 서브모듈 경고는 업로드 실패 뒤 출력됐으며 직접 실패 원인 아님 |

## 변경

- `.github/workflows/deploy.yml`: `--archive=tgz`를 제거하고 개별 파일 업로드로 변경. `--prebuilt --prod --logs` 유지/사용. 기존 tgz도 최신 CLI에서 이미 분할 압축이므로 단일 거대 파일을 분할하는 수정이라고 설명하지 않는다.
- 압축 업로드는 Vercel의 파일별 캐시 최적화를 사용하지 못한다. 개별 업로드로 기존 파일 재사용이 가능하도록 한다. 게임 에셋을 삭제하거나 URL을 외부 저장소로 교체하지 않는다.
- CLI는 실패 로그에서 사용한59.16.0으로 고정하여 업로드 방식 외의 버전 변동을 줄인다. setup-node로 Node22를 명시한다.
- `tools/check-vercel-output.mjs`: 실제 `.vercel/output/static`을 재귀 검사. 핵심4개 파일(index.html/game.html/parry-lesson.js/resource-practice.js) 누락, 파일수+config1개>15000, 개별 파일100,000,000바이트 초과 시 업로드 전에 명시적으로 실패한다. 100MB는 보수적 로컬 사전검사이며 전체 전송량 제한 판정을 대신하지 않는다. 배포 플랜이나 용량 과금을 변경하지 않는다.
- 무조건 재시도하거나 기존 실패 실행을 재실행하는 변경이 아니다. 새 커밋으로 수정된 workflow를 실행해야 한다.

## 검증 및 남은 확인

| 검증 | 결과 |
|---|---|
| 검사·워크플로 테스트 | node --test test/vercelUpload.test.js: 3PASS |
| 최신 웹 스테이징 | tmp/release-web-upload-fix-20260913 생성 성공; tracked 경로5584개, 경로별 합산5,576,398,731바이트 |
| Mac 실제 파일 검사 | NFC/NFD 동일 경로 합쳐5497개, 4,376,723,306바이트. Linux는 별도 경로일 수 있으므로 CI에서 다시 실제 출력 검사 |
| 가장 큰 파일 | video/warrior_story_v22_bgm.mp4, 87,255,213바이트. 사전검사 통과 |
| 에셋 변경 | 없음. build-web.mjs 포함 규칙도 변경 없음 |
| 원격 배포 | 수정 커밋 푸시·새 workflow 실행 후 검증 필요. 로컬 테스트 통과를 Vercel 배포 성공으로 취급하지 않음 |

공식 근거: [CLI deploy의 Archive 설명](https://vercel.com/docs/cli/deploy), [tgz의 분할 압축 기본 동작](https://vercel.com/changelog/split-tgz-is-now-the-default-cli-archive-deployment-behavior), [파일 수와 업로드 제한](https://vercel.com/docs/limits).
