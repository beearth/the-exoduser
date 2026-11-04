# 2026-09-28 누적 게시와 미전송 원본 LFS 이전

| 항목 | 실행 계약 |
|---|---|
| 브랜치 | `codex/steam-languages-20260909`; 기존 GitHub Actions `deploy.yml`의 workflow_dispatch로 프로덕션 게시 |
| 사전 검사 | 누적 변경 관련 Node 검사322개 PASS, 게임 guard6개 PASS. 실제 새로고침 후 로그인·데모 로비 진입, 독립 배경 영상 및 전대 스프라이트 재생 확인 |
| GitHub 거절 원인 | 미전송 이력의 `assets/map/ch1/production_finish/CH1_1_PRODUCTION_MASTER.png` 일반 Git blob4개가 100MiB 초과. 크기141147057 / 120916553 / 118010699 / 117676998바이트. 최종117083377바이트 원본은 이미 LFS 포인터 |
| 이전 범위 | 원격 브랜치의 실제 SHA를 제외 경계로 삼아 미전송 커밋의 해당 경로만 Git LFS로 이전. 이미 공개된 커밋과 다른 에셋 경로는 유지 |
| 원본 보존 | 수정 전 로컬 `backup/publish-before-lfs-20260928` 참조 및 `tmp/publish-20260928/lfs-object-map.csv`의 OLD-SHA,NEW-SHA 대응표 보존. PNG 픽셀·바이트 변경 없이 저장 방식만 이전 |
| 작업 격리 | 별도 `tmp/publish-20260928/lfs-publish.git` 저장소에서 이전. 사용자의 진행 중인 작업 파일을 checkout/reset/stash하지 않음 |
| 게시 검증 | 최종 트리 동일성 및 현재 원격 SHA의 조상 관계를 확인한 뒤 일반 fast-forward push. 강제 푸시 없음. CI 성공·공개 정적 파일 해시 일치를 별도로 확인 |
| 웹 구성 | 제작용 MASTER와 outer/skin source 폴더는 웹 staging 제외; 게임 chunks·layout·composition 유지. 루트 CSS/JS 참조 누락 검사 포함 |
| 실행 증거 | `tmp/publish-20260928/result.json`, `tests-final.log`, 배포 후 `deploy.log`. 이 문서의 실행 계약만으로 원격 푸시나 배포 성공을 선언하지 않음 |

