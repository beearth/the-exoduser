# BUILD 추가 source drift 및 패키지 실행 계획1판

추가 변화3파일을 byte로 분류했다. 기존 앱에 새 카드 수명 guard와 NW.js mats 실패 응답이 빠져 있다. planReady=true; rebuildExecuted=false, runtimeAccepted=false, visualAccepted=false, productionApplied=false.

실제 checkout: /Users/fordeargamers/Projects/exoduser-migration-20261001
관측: 2026-10-02T05:28:35.185Z–2026-10-02T05:28:35.320Z UTC. 제공 생산 commit 7e69495046323b3120578f67635c20feb48b2a4f, TASK checkpoint cd675f24는 총괄 제공값; Git/현재 HEAD/Changes/원격 조회0. 현재16역할(총괄1+전문15, Claude8/Codex8); 새 세션/하위팀0.

## 실제 추가 변화와 역사적 관계

| ID | 파일 | 현행 bytes / SHA256 | archive bytes / SHA256 | 추가 변화 / 줄 | 기존 예상 관계 |
|---|---|---|---|---|---|
| ACC-01 | game.html | 4025346 / 6c77ec6f571f4de9cb199a2ac425eb3f0450205bcf6f1d883ac8d13135ac4b43 | 4024167 / c868284af349c996d42087e93eba47a10614d73cb8f55f4db5ae01dde89da31a | renderSkillPanel / _skClick; line 46747; +44 bytes; archive 미반영 | 선행 당시: 필터 초점 복귀·유골 행동 비활성화 초점 회수2종이 기존 앱에 미포함 |
| ACC-02 | game-easy-test.html | 3902471 / c40ea16180305a3d0043d1c9dfa9091096820e589e537a893d5d28fff56528d0 | 3901292 / 11b4e97b15903b9699b296362bdd068ffed6d3a1a505d9f6eeec5482b7c085ca | renderSkillPanel / _skClick; line 45348; +44 bytes; archive 미반영 | 선행 당시: 위 초점2종이 기존 앱에 미포함; 기본 본편/easy 차이 보존 |
| ACC-04 | node-main.js | 10282 / 541ff8e6f57db862ddbb1b148ee37a3a8e0da1e16293bc8343a0bc4144d80daf | 10261 / f0f922cf4e62dd9f30282ebd37b6ef0c258f2864416e89ab125a6631fd8654c1 | http.createServer async handler; line 159; +129 bytes; archive 미반영 | 선행 당시: PORT3333→3383, SAVE_DIR→기존 job/user-state/saves 두 치환만 |

ACC ID는 실제 sealed manifest에서 읽었다. 기존 앱 입력 commit6be3a06b4e8d03768a35f4c57d419f45c8efeb39, job08cac1ce-21fb-4874-b4df-c136df5ac269는 과거 생성 신원이다. archive3 SHA는 과거 pin과 동일하며 원문 보존했다. 현행 source3는 DRIFT_CLASSIFIED_ARCHIVE_NOT_UPDATED로 분류한다. old manifest의 PIN_MATCHES_PRIOR_EVIDENCE를 현재 상태로 사용하지 않는다.

### ACC-01 game.html

전 fragment SHA 12db2d0c03d06535588cd775a82244a47a69aa9110945b798f52b03d2b0cea01; 후 d5880aa085a760ededbe85341a3bdf014112809dc8dc18b506f9db9686dcccd6. renderSkillPanel / _skClick에서 if(!d.isConnected||!grid.contains(d))return;만 추가. 카드가 연결되어 현재 grid에 소속될 때 기존 학습/강화가 실행된다. guard 제거 메모리 재구성 전체 SHA가 선행 source pin과 일치; 새 함수 실행0.

### ACC-02 game-easy-test.html

전 fragment SHA 12db2d0c03d06535588cd775a82244a47a69aa9110945b798f52b03d2b0cea01; 후 d5880aa085a760ededbe85341a3bdf014112809dc8dc18b506f9db9686dcccd6. renderSkillPanel / _skClick에서 if(!d.isConnected||!grid.contains(d))return;만 추가. 카드가 연결되어 현재 grid에 소속될 때 기존 학습/강화가 실행된다. guard 제거 메모리 재구성 전체 SHA가 선행 source pin과 일치; 새 함수 실행0.

### ACC-04 node-main.js

전 fragment SHA 8110eb2cdc652912365ed41fcf956e70b43c67e676a38d4ce9121f49d13e95f5; 후 a94c6e36ede0971f4003d18a1e65216ffc2d0d27855dd232c2c766241e656fa6. 실제 before backup SHA 01b0c1d51f77f500ee0a59185458bf0294edce12544482d6cf7abce4262c91ce와 선행 source pin 일치. route 외 byte 동일=true; clamp·직접write·성공 응답 byte 보존=true, 성공 응답 catch 밖. body읽기/JSON해석/clamp/write 예외만 500 JSON {ok:false,error:'Internal Server Error'}로 끝낸다. atomic/durability 보강0.

| 재사용 ID | 파일 | 선행 관계 | 이번 측정 |
|---|---|---|---|
| ACC-03 | server.cjs | 선행 당시: server.cjs는 기존 앱 입력에 없고 앱 서버는 node-main.js. 개발 INM/Range 인수를 앱 품질로 전달하지 않음 | source/archive 재읽기0; 현재 일치 미선언 |
| ACC-05 | ui-panels.js | 선행 당시: source/archive byte 동일 | source/archive 재읽기0; 현재 일치 미선언 |
| ACC-06 | package.json | 선행 당시:3383 main/node-remote·고유job 프로필·product_string 파생. name/version/window·나머지 Chromium args 보존, private/type/scripts/devDependencies/dependencies 생략 | source/archive 재읽기0; 현재 일치 미선언 |
| ACC-07 | index.html | 선행 당시: source/archive byte 동일 | source/archive 재읽기0; 현재 일치 미선언 |

## 최소 신규 byte 검증

8 PASS / 0 FAIL: ACC신원1, archive 보존3, 추가delta3, 읽은 입력 전후 안정1. 실제 diff exit1은 차이 있음의 정상 코드다. HTML before는 memory 재구성, node before는 실제 backup; 모든 diff/fragment/pin은 evidence.json에 담았다. 선행22 재실행0, 새 기능검사0, 전체7918/8258 스캔0. 원본 handler/게임/packager import·실행0. 신규 checks는 byte 검증용이며 실앱 인수와 구분한다. 참조 파일 전체 SHA와 입력 전후 보존은 evidence.references/stability에 있다.

## 실행 계획1판

1. 총괄이 현재 source/docs와 승인된 후보 범위를 확정한다. 생산 기준7e694950·TASK checkpoint cd675f24는 제공값이며 현재 HEAD/원격 관측으로 사용하지 않는다.

2. core7 및 필수 스크립트·정적/동적 참조 assets/img/audio/lib/locale 입력을 새 allowlist로 확정한다. 시스템 SSOT·LOCK·보호2_3·Q전용 blackBean·저장 호환을 확인한다. docs는 복구 입력에 포함하며 앱 포함 여부는 명시한다. 이전7918/8258 숫자를 현재 전수검증으로 재사용하지 않는다.

3. 총괄이 scoped source+docs+필수 asset 복구 commit과 원격 ref의 full SHA/조회시각을 대조하고, 현재 입력별 bytes/SHA 및 승인 checkpoint에 결속한 새 manifest를 만든다. 실행 직전 byte pin 재대조, 다른 팀 변경 발견시 중단한다.

4. 실행 승인 후 새 UUID를 배정하고 기존08cac1ce와 다른 존재하지 않는 outputs job 경로를 선택한다. 정수1024..65535 중3333/3340/기존3383 및 점유포트를 제외해 실제 점유 확인 뒤 배정한다. 새 job/user-state/profile와 saves 절대경로를 분리하고 사용자 저장은 읽거나 복사하지 않는다. profile 공백/따옴표/control/DEL 경계 검증, package main/node-remote와 node-main PORT/SAVE_DIR 일치 검증.

5. 로컬 NW.js0.111.2 osx-arm64와 기존 library4.17.10 입력을 새 SHA로 확인한다. 다운로드/설치 차단; cache 부족시 실행 Gate 유지. 필수 런타임 에셋/재현 입력은 제외해 숫자를 줄이지 않는다. 기존packager를 읽고 정확 파생계약과 output 보호를 확인하며 옛config/plan은 덮어쓰지 않는다.

6. QA와 총괄의 단독 빌드 슬롯 승인을 확보한다. 그때만 새 config와 고유 job에서 빌드한다. 생성 후 archive 각 입력 SHA와 core7의 expected derivation/exclusion을 확인하고 새 guard/500 응답 포함을 기록한다. 실 source pin 변동·누락시 미인수.

7. 생성 후 실제 앱 로비→캐릭터/게임→설정·키보드/패드 초점→본편/easy 카드 수명을 확인한다. 저장 ACK→실제 디스크→종료→동일 job 재실행→GET/load·설정 지속성 순서로 검수한다. HTTP500 JSON/CORS와 성공200을 실제 wire에서 구분한다.

8. 영상/음향/코덱·Range/HEAD·앱 내장 서버를 실제 앱에서 검수하고 별도 runtime/visual 증거를 남긴다. 절대 profile/save 경로의 이동/배포 계약·서명은 별도 검수한다. 이후 총괄이 새 결과·docs·복구 원격 checkpoint를 기록한다.

새 jobId/port/currentRemoteCheckpoint는 null, 아직 배정·관측하지 않았다. 다음 Gate: 총괄의 최신 정확 입력 pin·원격 checkpoint 확인 및 빌드 단독 실행 승인.

## docs 검색과 정본 인계

checks 작성 뒤 docs 전체에서 acceptanceManifest|ACC-04|nodeMainMats|공유 악의|카드|08cac1ce|INTEGRATION_BUILD_TEAM_MASTER를 rg 검색: 835행/146문서, exit0, 원문 SHA fdab5a67490f6ec5d05115cfb4a281c24d930b7e007175ba4645215de39dcf9a. 목록은 evidence.docsSearch. 공유docs·보호2_3 수정0.

| 정본 대상 | 추가할 정확 문안 |
|---|---|
| INTEGRATION_BUILD_TEAM_MASTER.md | BUILD continuous/BUILD는 ACC-01/02/04의 현행 source3와 기존 archive3 byte를 새로 관측했다. 본편/easy renderSkillPanel._skClick의 if(!d.isConnected\|\|!grid.contains(d))return; 1곳씩과 node-main POST /api/mats의 HTTP500 JSON 보강은 기존08cac1ce 앱에 미포함이다. ACC-01/02의 이전 초점2종 누락 및 ACC-04의 PORT3333→3383/job SAVE_DIR 파생은 이전 검수 관계와 분리한다. ACC-03/05/06/07은 선행 evidence 재사용이며 현재 재측정0. old manifest PIN_MATCHES_PRIOR_EVIDENCE는 역사적 상태다. 계획1판 planReady=true, rebuildExecuted/runtimeAccepted/visualAccepted=false. source/byte 분류는 앱 품질 인수가 아니다. |
| 저장 SSOT | ACC-04의 현행 SHA는 이번 evidence.rows에서 인용한다. 실패500 JSON {ok:false,error:'Internal Server Error'} 추가; 정상200 {ok:true,mats:n}, Math.max(0,Math.min(Math.floor(+body.mats\|\|0),Number.MAX_SAFE_INTEGER)) 의미 및 직접 writeFileSync({mats:n,ts:Date.now()}) 유지. 성공 응답은 catch 밖이다. 실제 route 바깥 byte 동일. 원자쓰기·내구성·실HTTP·앱 저장 재실행 인수로 확대하지 않는다. |
| UI UX SSOT | 본편/easy _skClick 첫 문장의 카드 연결·현재 grid 소속 guard만 선행 source 대비 추가됐다. before는 guard 제거 메모리 재구성과 sealed 전체 source SHA 일치로 입증했고 실제 guard/callback fragment SHA·line은 continuous/BUILD evidence 참조. 두 archive에는 guard가 없다. 실 UI/키보드/패드·시각 인수 미실행. |

총괄이 표의 실제 SHA/줄 번호와 source drift 상태를 정본에 순차 반영한다. 옛 manifest/보고서/앱은 수정하지 않는다. 코드+docs 커밋/원격 체크포인트는 이 과제에서 금지돼 총괄 소유다. source/byte PASS는 runtime/visual PASS가 아니다. 실제 저장→종료→재실행·HTTP·코덱·영상/음향·서명/배포는 미검수다.

산출은 result.md, evidence.json, checks.mjs 3파일만이다. 스킬/API/MCP 별도 호출0; 실제 함수도구 exec_command/clock만 사용했다. 자동 다음 작업·타 채팅 메시지0.

검수 완료 후 Changes 수는 Git 조회 금지로 UNKNOWN이다. 총괄은 실제 Changes80부터 체크포인트를 시작하고100 전에 마쳐야 한다. 본 담당은 새 과제 없이 종료한다. checks.mjs는 이번 산출 writer를 포함해 기존 result/evidence가 있으면 재실행을 거부한다; 이전 검사 반복용 명령으로 사용하지 않는다.
