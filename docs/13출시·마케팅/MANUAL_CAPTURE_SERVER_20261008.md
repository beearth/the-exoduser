# 수동 데모 영상 회수 서버 — 2026-10-08

IAB의 `Download WebM` 다운로드 이벤트와 영상 `downloadMedia`가 시간초과되어, 기존 촬영 스튜디오의 3338 자동 POST 저장 기능을 사용하기 위한 로컬 수신 서버를 추가했다. 게임·스튜디오·기존 3333 서버 파일과 실행 상태는 변경하지 않는다.

| 항목 | 정확한 계약 |
|---|---|
| 새 파일 | `tools/marketing_capture_server_20261008.cjs` |
| 바인딩 | `127.0.0.1:3338`만 사용 |
| 페이지 | `http://127.0.0.1:3338/tools/marketing_capture_studio_20261008.html` |
| GET/HEAD | 기존 `http://127.0.0.1:3333`으로 프록시. 기존 `server.cjs`의 정적 파일·게임 API 응답을 유지 |
| 상태 확인 | `GET /__health`는 수신 서버 자체의 JSON. 기존 게임 서버 가용성이나 촬영 성공을 증명하지 않음 |
| 허용 쓰기 | `POST /__recording?name=demo_manual_<13자리 timestamp>.webm` 또는 `.json`만 허용. 다른 POST/PUT/PATCH/DELETE는 405이며 3333으로 전달하지 않음 |
| 안전 파일명 | 정규식 `^demo_manual_[0-9]{13}\.(webm|json)$`; 단일 `name` 인자만 허용. 경로·다른 확장자·staged 이름은 거부 |
| 최대 크기 | 요청별 `200 × 1024 × 1024 = 209,715,200 bytes` / 200 MiB. Content-Length와 실제 수신 바이트 둘 다 검사 |
| 본문 확인 | WebM은 EBML 시작 4바이트 `1a45dfa3`, JSON은 JSON.parse 확인. 실제 영상 디코드·프레임·청취 검수를 대체하지 않음 |
| 저장 | `/Users/fordeargamers/the-exoduser/output/marketing_video_20261008/natural-retake/` |
| 기존 파일 보존 | `wx` 배타적 생성, 권한 0600. 같은 파일명은 409로 거부하고 덮어쓰지 않음 |
| 성공 응답 | HTTP 201 JSON `{ok:true,name,bytes,path}`. WebM과 JSON은 별개 요청이며 둘 다 존재·크기를 확인 |
| 로컬 요청 | Host는 `127.0.0.1:3338`, Origin이 있을 때도 `http://127.0.0.1:3338`만 허용. 외부 바인딩·CORS 허용 없음 |

## 실행과 회수

마케팅 worktree에서 아래 명령을 실행한다. 기존 3333 서버를 재시작하거나 교체하지 않는다. 3338이 사용 중이면 충돌 오류로 중단하며 기존 프로세스를 종료하지 않는다.

```sh
cd /Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser
/Users/fordeargamers/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tools/marketing_capture_server_20261008.cjs
```

새 3338 탭에서 `Boot actual demo · manual` → 실제 오디오 활성 → `Record manual demo`를 사용한다. 녹화 종료 후 기존 스튜디오가 WebM·감사 JSON을 순차 POST하며 두 응답이 성공하면 `Server save: {"ok":true,...}`가 표시된다. 저장되는 감사 JSON은 이 성공 표시를 붙이기 전에 직렬화되므로 JSON 내부에 `serverSave`가 없을 수 있다. 실제 파일 쌍을 확인한다. 촬영 후 `Release all inputs`와 일시정지는 운영자가 수행한다.

저장격리는 기존 [촬영 스튜디오](INGAME_CAPTURE_STUDIO_20261008.md)의 새 슬롯·Storage prefix·API 읽기 대체·쓰기 차단·save guard를 그대로 사용한다. 수신 서버도 게임 API 쓰기를 전달하지 않는다. GET/HEAD API 프록시 자체는 일반 읽기 응답이므로 저장격리 없이 게임 페이지를 직접 열어 촬영하지 않는다. Canvas 합성에는 HTML HUD·메뉴가 포함되지 않으며 Steam 바이너리 동일성도 미검증이다.

## 검증과 문서 동기화

코드 작성 전후 docs/ 전체에서 `3338|__recording|capture server|capture studio|manual capture|수동 촬영|수동촬영|자연 플레이|자연플레이`를 검색한다. 기존 촬영 문서·manifest의 3338 결과는 당시 이력으로 보존하고, 이번 전용 수신 서버의 값·파일 회수·격리 계약은 이 문서에 기록한다. 게임 시스템·수치 변경은 없다.

문법 검증: 지정 bundled Node의 `--check` 통과. 리스너를 열지 않는 모의 요청에서 health 값, 게임 API POST 거부, 경로·staged 이름 거부, 200 MiB 초과 거부, 외부 Host/Origin 거부를 확인했다. 이 검증은 upstream 요청·파일 쓰기를 하지 않았다. 이번 구현 작업자는 3338 서버를 실행하지 않으며 기존 3333에 요청하지 않는다. 실제 실행·`GET /__health` 확인·WebM/JSON 저장 검수는 총괄이 이어서 수행한다.
