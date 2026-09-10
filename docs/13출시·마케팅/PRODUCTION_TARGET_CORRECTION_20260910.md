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

## 실제 서비스 검증 완료

| 항목 | 결과 |
|---|---|
| 배포 | eceb91b03 소스, dpl_MijoJjdFDntHsKqdazaS4cZYAUaf READY, the-exoduser.vercel.app alias 확인. 소스 main 푸시 완료 |
| 공개 파일 | game.html·index.html·character-story-player.js·warrior_story_v22_bgm.mp4 SHA256 모두 고정 배포물과 일치 |
| 생성 UI | 실제 서비스 Windows Chrome에서 대검전사 생성 클릭 후 v22 재생,1920×1080,paused=false,muted=false |
| 후속 인트로 | Esc 홀드 후 동일 슬롯으로 game 진입, _cutSeq=INTRO, charIdx=0, 구 intro_voice.mp3 재생 호출0 |
| 렌더러·오류 | 실제 WebGL2 컨텍스트, _useGL=true/_useGPU=false, pageerror0. Mac 실기 증거는 아님 |
| 데이터 격리 | 브라우저 API 응답 fixture로만 저장 처리, 실제 계정/캐릭터에 쓰기 없음 |
| 증거 | captures/renderer_optin_20260910/the-exoduser-production-verification.json 및 the-exoduser-creation-v22.png·the-exoduser-nemesis.png |
| 검사 보정 | 첫 검사는 게임 전체 load 이벤트15초 제한으로 실패. DOMContentLoaded 후 실제 INTRO 상태를 기다리도록 변경하여 전체 흐름 PASS |
