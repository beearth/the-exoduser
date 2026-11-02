# v22 로컬 검토 페이지 404 복구 — 2026-11-02

사용자에게 전달한 `http://localhost:3333/assets/characters/female-heroes/20261102-v22-lean-blue/models-review.html`이 404로 열리지 않았다. 파일은 `G:/exoduser`에 있었지만 실제 3333 서버는 `G:/exoduser-wt/latest-web`을 사용했다. localhost/IPv4/IPv6 모두 404였고 서로 다른 소스의 index/package 응답으로 실행 경로 불일치를 확인했다.

| 항목 | 확인 결과 |
|---|---|
| 원본 복구 SHA | 0e7682db8cd99d3dfb761eaa7249555ba6ade414 |
| 실행 경로·HEAD | G:/exoduser-wt/latest-web / 94e3a89eddf8339cb24192bf8ad97e4fed09bcf2 |
| 서버 | 기존 Node PID66072·3333 유지, 재시작0 |
| 연결 범위 | 승인된 v22 패키지78파일·836,005,756바이트만 byte검증 후 복사 |
| 보존 | 실행 경로 tracked INDEX/WORK 모두 기존0, HEAD 변경0. 다른 게임 코드·세이브 변경0 |
| HTTP 재검증 | 검토 HTML/CSS/JS·로컬 뷰어·실제 모델 썸네일 GET200 및 원본 byte일치. 모델/걷기/달리기 GLB6개 HEAD200·파일 길이일치 |
| 남은 범위 | 실제 3D 재생과 Unity 품질 검수는 기존 미검증 상태 유지 |

파일별 SHA-256은 기존 모델 감사 기록과 비공개 연결 영수증에 보존했다. 공개 요약은 패키지 `preview-serving.receipt.json`이다. 기존 URL을 다시 사용하면 된다. 이번은 로컬 검토 연결 복구이며 공개 홈페이지 배포나 게임 적용이 아니다.
