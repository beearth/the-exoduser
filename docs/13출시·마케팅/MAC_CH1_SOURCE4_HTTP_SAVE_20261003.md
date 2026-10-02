# Mac CH1 source4 — 실제 HTTP·합성 서버 저장 검수

2026-10-03 KST. job `97bb3ef9-fff2-4761-9841-e5a24a953847`의 기존 고정 앱에서 node-main.js를 표준 Node24 CLI로 실행했다. 신규 독립 HTTP·합성 저장 검수는12/12 PASS이며 NW.js GUI·게임 플레이 검수는0이다. 활성 CH1-1 목표는 미완료다.

| id | 검수 | 실제 결과 |
|---|---|---|
| HTTP01 | GET index.html | 200·342119B·SHA `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` |
| HTTP02 | GET game.html | 200·4028906B·SHA `e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea` |
| HTTP03 | GET game-easy-test.html | 200·3906353B·SHA `68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390` |
| HTTP04 | HEAD index | 200·Content-Length342119·body0B |
| HTTP05 | 선언 lobby audio Range | index:3623의 assets/lobby/11_loop.wav, 206·bytes0-63/5760078·body64B 일치. decode/청취0 |
| HTTP06 | QA파일 생성 전 slots | 200·[] |
| HTTP07 | shared mats read | 200·mats0·디스크 쓰기0 |
| HTTP08 | 격리 QA save POST | 200·실디스크 JSON312B 기록 |
| HTTP09 | 재시작 전 QA load GET | 200·합성 payload exact |
| HTTP10 | QA파일의 normal slots 노출 | 200·[]; underscore 숨김 보존 |
| HTTP11 | own 서버 재시작 후 QA load | 200·payload exact·QA파일 불변 |
| HTTP12 | 재시작 후 normal slots | 200·[]·숨김 QA파일만 존재 |

## 실행·저장 소유

| 항목 | 정확 계약·관측 |
|---|---|
| 포트·서버 | 고정 `127.0.0.1:3386`, 같은 앱 Contents/Resources/app.nw/node-main.js. 새 서버 구현·설정 변경0 |
| 실행 | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`, v24.15.0 직접 CLI2회. NW.js native 프로세스0 |
| own 프로세스 | PID40186/40912; 둘 모두 SIGTERM·exit-15·terminal. 최종 lsof LISTEN없음과 SO_REUSEADDR bind free 관측 |
| SAVE_DIR | job의 고유 user-state/saves 절대경로. 기존 사용자 저장·다른 앱/서버·shared mats 쓰기0 |
| slot | `_qa97bb_http_probe`; 합성 server-only payload. 실제 player dbSave/DEMO localStorage/플레이 저장이 아님 |
| QA파일 | job user-state/saves/_qa97bb_http_probe.json, 312B·SHA `89b35f267db96ac27172610aaca0238d4ce8b057227d71376704fa96ae629d03`; 이 합성 QA파일1개 유지·삭제0·normal slots[] |
| 런타임 로그 | app.nw/oauth-debug.log, 258B·SHA `0ee6a82937d82f12a098fd4a8b402ecfa75745bf4ed7f840f954532d69a26544`; 생성됨을 기록하며 OAuth 요청0 |
| profile | 생성0. 생성 당시8253 regular/5 symlink 및 output manifest는 snapshot이며 현재 추가log1·user-state/saves 생성과 구분 |
| 보존 근거 | 영수증의 source core5(main/easy/index/node-main/package) 및 protected64 exact. 기존 자산값 변경0; 문서 담당의 전파일 해시 재검0 |

## 최초 메타오류와 후속 검수

최초 receipt.json은10개 records가 모두 pass=true이나 종료 뒤 plain bind가 TIME_WAIT로 `OSError: [Errno 48] Address already in use`를 반환해 success=false/stopError를 남겼다. 이 원문은 보존한다. 제품 서버 기동·HTTP10건 실패로 바꾸지 않는다. lsof/ownedPID terminal 및 SO_REUSEADDR 관측 방식만 교정했고 실제 source 변경0, 원10 재실행0이다.

restart-receipt.json은 같은 own 서버의 두 번째 CLI기동에서 저장 재시작 검수2건과 종료 상태를 기록한다. 따라서 독립검수는 최초10+후속2=12이며 CLI 실행2회를 제품2개나 게임6단계 완료로 세지 않는다. 잘못된 `bgm/11_loop.wav` 선택은 실제 요청 전 선언 경로로 교정했으며 잘못된 요청0이다.

| 증거 | bytes·SHA |
|---|---|
| ignored continued-review-20261003/source4-headless-http/receipt.json | 20716B·`7ca73d2ebd63741e7a964ceb82ce6c859aa6b7956e014dde5d92ecf4b475cfaa`; 최초10 PASS와 관측 메타오류 포함 |
| 같은 폴더 restart-receipt.json | 2560B·`c6c4d4911fd04b5fd094729cde54acd9ad9ce17a9f2311874fe2131ef84d9a70`; 추가2 PASS·원10 재실행0 |

이 인수는 실제 HTTP bytes·HEAD/Range·합성 server-only 디스크 저장과 own 서버 재시작에 한정한다. 앱 GUI 기동·DOM·입력·게임 JS 실행·CH1-1 연결 플레이6단계·Audio decode/청취·actual player dbSave·DEMO localStorage·normal 게임 저장·OAuth 서비스 검수는0이다. 새 다운로드·설치·NW native 기동0, 기존 앱·세이브·타인 WIP를 보존한다. 기존 [source4 앱 후보](MAC_CH1_SOURCE4_CANDIDATE_20261002.md)의 native/visual/청취 Gate와 [CH1-1 활성 목표](../0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md)는 미완료 상태를 유지한다.
