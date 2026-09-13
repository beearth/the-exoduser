# Vercel 업로드 실패 대응 — 2026-09-13

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
