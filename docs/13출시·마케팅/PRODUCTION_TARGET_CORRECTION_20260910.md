# 실제 서비스 배포 대상 정정 — 2026-09-10

사용자가 실제 사용 주소를 the-exoduser.vercel.app으로 확인했다. 앞선 hell-smoky.vercel.app 배포 성공은 **다른 프로젝트에 대한 결과**였으며 사용자 서비스 배포 완료로 보고한 것은 잘못이다.

| 항목 | 확정 내용 |
|---|---|
| 사용자 서비스 | https://the-exoduser.vercel.app |
| Vercel 프로젝트 | fordeargamers/the-exoduser. CLI project inspect로 확인 |
| 잘못된 기존 로컬 연결 | .vercel/project.json이 hell을 가리켜 hell-smoky.vercel.app에만 최신 버전 반영 |
| 로컬 정정 | CLI 프로젝트 연결을 the-exoduser로 변경. 기존 연결 파일은 tmp/vercel-project-hell-before-correction.json 보존 |
| 구버전 증거 | 실제 서비스 index.html에는 character-story-player.js·_afterCharacterCreated 연결이 없음. tmp/the-exoduser-before-index.html·before-game.html 원문 보관 |
| 사용자 증상 | 캐릭터 생성 후 새 영상 대신 구 한글 더빙 인트로. 다른 도메인의 최신 코드 검증으로 사용자 현상을 부정할 수 없음 |
| 수정 범위 | 최신 게임·로비·전사 v22 BGM 영화·네메시아 V3를 실제 the-exoduser 프로젝트에 배포. 게임 선택식 임의 추가 수정 없음 |
| 확인 기준 | CLI READY뿐 아니라 the-exoduser.vercel.app의 game/index/player/MP4 해시와 새 캐릭터 생성 후 영상 재생을 확인 |
| Mac 광선 테스트 | 실제 서비스에서 game.html?webgpu=0&ray=0 / ray=1. 기존 hell 링크로 테스트를 안내한 기록은 대상 정정. 세로 띠 실기 해결 미확정 |

앞선 WEB_RENDERER_REDEPLOY·LATEST_WEB_RELEASE 및 Mac 비교 문서의 hell-smoky 결과는 해당 도메인의 이력으로만 보존한다. 앞으로 사용자 서비스 배포/검증의 기본 대상은 이 문서다.
