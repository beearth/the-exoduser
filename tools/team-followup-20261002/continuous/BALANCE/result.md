# BALANCE — NW.js POST 중간 stream 실패 경계

부분 본문 뒤 `aborted`→`close`가 생긴 합성 요청에서 **현행 readBody와 POST handler는 각16 microtask 관찰 동안 pending·응답0**이었다. 같은 사건의 늦은 `error`에서 비로소500 JSON을1회 마감했다. 미채택 메모리 readBody 후보는 abort에서1회 거부/마감하고 늦은 close/error/end에도 추가 응답·쓰기가 없었다. 정상 완료 요청1개의 저장 bytes·clamp·200 응답은 동일했다.

신규 중단 입력1건+최소 정상 대조 입력1건을 원본/후보에서 각각 실행했다. **새 source fixture4회 비교 PASS**이며 기존 root4회귀·actual-file14·handler18·source19·close2/unlink 반례를 재실행·합산하지 않았다. 새 readBody 후보의 생산 적용0, 실HTTP/runtime/visual 인수0이다.

## 제공 기준·수신·실제 실행

| 구분 | 출처와 실제 상태 |
|---|---|
| 제공자/채팅 | Codex BALANCE, `01a0faaf-a06a-79a2-9def-58eb8ad10d65`. 현재 담당표 BALANCE 행에서 ID 확인. 그 행의 prepared_not_sent는 배정 작성 당시 snapshot이며 이 채팅의 직접 메시지 수신·TASK Read와 구분 |
| 총괄 제공 생산 기준 | `7e69495046323b3120578f67635c20feb48b2a4f`; TASK checkpoint `cd675f24`. 이번 배정 메시지·COMMON·담당표의 제공값이고 현재 HEAD 독립 관측이 아님. Git 명령0 |
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001`; root/소유 폴더 realpath 일치. 기본 chat 기록 cwd의 main을 사용하지 않음 |
| 실제 Read | COMMON/TASK 전체, AGENTS, 담당표, 저장 SSOT 최신 POST 보강, BALANCE/BUILD 대장, completion.json/RED/GREEN 로그, 현행 node-main/영구test 및 codex-half 결과/근거. 정확 메시지 수신 timestamp는 제공되지 않아 추정하지 않음 |
| 이전 완료 인수 | root 로그 RED1PASS/3FAIL→GREEN4PASS/0FAIL 및 source 완료 SHA 확인. 기존 NW.js500 JSON 생산 반영은 완료된 baseline. 이전 text/plain 응답 fragment/atomic/cleanup 후보는 과거 미채택 근거 |
| 실행 시각 |2026-10-02 05:28:26.139→05:28:26.182 UTC /14:28:26.139→14:28:26.182 KST. 지정 Node v24.15.0 darwin arm64, `node --check checks.mjs` 및 소유 checks.mjs exit0 |
| 읽기 오류 | 초기 추정 로그명 red.txt/green.txt 읽기 exit1. 실제 목록의 node-test-red.txt/node-test-green.txt로 다시 읽어 완료. 파일 생성/삭제/이동0 |
| 산출 소유 | continuous/BALANCE/checks.mjs, result.md, evidence.json 3파일만. COMMON/TASK·기존 산출·공유 docs·생산·영구test 쓰기0 |

Changes/현재 HEAD는 이번 TASK 계약에 따라 Git 조회하지 않았다. 최신 Changes 값이 제공되지 않아 새 수치를 추정하지 않으며 타인 WIP를 정리하지 않았다.

## 실제 source 및 대역 경계

| source ID / 이름 | SHA-256 | 실제/대역 구분 |
|---|---|---|
| node-main.js / 현행 NW.js 서버 | `541ff8e6f57db862ddbb1b148ee37a3a8e0da1e16293bc8343a0bc4144d80daf` | completion.json의 완료 source와 동일. 전체 서버 import0 |
| readBody(req) / 본문 읽기 | `c74146a60b861e66a276841997b5e30589f72938edbc099e18662d7e800c74f5` | AST로 실제 함수 추출. data/end/error만 등록하고 aborted/close 처리 없음 |
| POST /api/mats / 현행 저장·실패 마감 | `d591b787d1851f4234fb3a28890d0bfeb0571a6d64ef2ac57edb52affcab2b12` | 실제 source. try의 readBody/JSON/clamp/직접write 오류는500 JSON, 성공 sendJSON은 catch 밖 |
| sendJSON / 응답 | `c09093657543e7fda7890b8848ac28dd3ae7a2ce903b26b6ed172efdc21e55d6` | 실제 source. transport res.writeHead/end는 호출 기록 대역 |
| GET /api/mats / 후속 확인 | `478234c1293b3ce91701ea507f81f61f66246ff99af21e167bcdb65b72352b4d` | 실제 source, fs는 메모리 Map |
| 미채택 readBody 후보 | `10815cca14a032cbe933284980081d49eb00e9db0608fdc3c50c5b309a5fd619` | 소유 checks/evidence 내부 함수. 생산·새 patch·다른 route 연결0 |
| 시계/요청/파일/응답 | clock123456, EventEmitter req, Map fs, 응답 기록객체 | 실제 IncomingMessage/socket/OS 저장이 아님. 읽기 Promise를 반환 그대로 보존한 계측 wrapper는 settle 상태만 관찰 |

## 한 요청의 사건과 원본→후보 결과

ID `NWJS-MATS-MIDSTREAM-01`: target 초기 `{"mats":4567,"ts":99}`, 독립 슬롯 `{"player":{"lv":7},"game":{"stage":2},"ts":8}`. 일부 bytes `{"mats":100` 뒤 **aborted→close→늦은 error(ECONNRESET)→늦은 end**를 하나의 요청 사건으로 보존했다. 단계마다16번 `await Promise.resolve()`만 관찰했으며 timeout·가짜 완료를 주입하지 않았다.

| 단계·계약 | 현행 source | 미채택 메모리 후보 |
|---|---|---|
| partial data→aborted, error/end 전 | body/handler pending, settle0, headers/end0 | body rejected1(ECONNABORTED), handler fulfilled1,500 JSON headers/end1 |
| close 뒤, 늦은 error 전 |16 microtask 동안 pending·응답0 유지 |기존500 JSON1회 그대로, 추가 마감0 |
| 늦은 error | body rejected1(ECONNRESET)→handler catch가500 JSON1회 | settled error guard가 수신; 추가 settle/응답0, emitThrow0 |
| 늦은 end | 기존 end listener가 partial JSON을 파싱하지만 이미 거부된 Promise 유지. 추가 응답0 | end listener 제거로 처리 없음. 추가 응답0 |
| 최종 body/handler settle | 각각1회 | 각각1회 |
| POST 실패 응답 |500 `{ok:false,error:'Internal Server Error'}`, application/json·CORS `*`, headers/end 각1 | 동일 JSON·헤더·횟수 |
| POST 성공 ACK / 파일 쓰기 |0 /0|0 /0|
| 이전 target/독립 슬롯 bytes | 정확 보존 / 정확 보존 | 정확 보존 / 정확 보존 |
| 후속 GET | mats4567 | mats4567 |
| 완료 후 리스너(data/end/error/aborted/close) |1/1/1/0/0|0/0/1/0/0|

최초 aborted/close 시점의 pending과 늦은 error 이후500 완료는 다른 단계다. 이후500이 나온 사실로 최초 abort/close가 즉시 처리됐다고 기록하지 않는다. raw event 순서·각16 microtask snapshot·리스너 count·예외·Promise 상태·headers/end/write trace는 evidence.failureComparisons에 있다.

## 최소 정상 대조와 후보 수명

정상 대조 입력은 완성 `{mats:42.9}`1개다. 원본/후보 모두 **42로 clamp**, `{"mats":42,"ts":123456}` UTF-8 직접쓰기1회,200 `{ok:true,mats:42}`·application/json·CORS `*`, headers/end 각1회, GET42·독립 슬롯 bytes 보존이다. write byte와 응답 전체가 동일했다. 정상 완료 뒤 close/늦은 error/end에서도 추가 저장/응답0·emitThrow0을 확인했다. 기존4회귀 전체를 반복한 결과가 아니다.

후보는 `settled` guard와 finish를 두고 body 성공/실패 때 data/end/aborted/close를 제거하며 chunks 배열을 비운다. `aborted`는 ECONNABORTED, body end 이전 `close`는 ERR_STREAM_PREMATURE_CLOSE로 거부하도록 메모리에서만 준비했다. **이번 aborted→close 사건은 close-only 실패 후보의 독립 실행 검증이 아니다.** standalone close-only와 실제 Node lifecycle은 다음 Gate로 남긴다.

늦은 EventEmitter error가 unhandled throw가 되지 않도록 settled onError1개는 요청객체 수명 동안 유지한다. 이 guard의 추가 settle0은 확인했지만 전체 listener0·요청 객체 GC/실제 해제 시점은 보장하지 않는다. 이 보존 정책과 실제 IncomingMessage의 종료 순서는 총괄의 생산 인수 판단 항목이다. 실제 readBody는 다른 저장 route도 공유하므로 해당 호출부 영향은 별도 검수 Gate이며 이번 fixture는 mats만 실행했다.

## docs 검색·정확한 canonical 인계 문안

코드 산출 뒤 docs 전체 `readBody|/api/mats|sharedMats|aborted|stream|한번|오류 응답` rg 검색 exit0. 실행 당시125매칭/59문서, 전체 출력 SHA `340c5033ec12280e67749b8f248f6692b00194e6c14bede0acf65d048c48554f`. 목록/개수/SHA는 evidence.docsSearch에 보존하고 별도 로그/복사 파일은 만들지 않았다. 공용 docs/보호2_3 수정0이다.

| canonical 위치 | 인수 시 추가할 정확한 현재상태·제한 |
|---|---|
| 저장 SSOT 최신 `NW.js 공유 악의 POST 실패 응답 생산 보강`의 readBody/stream 행 | `현행 readBody는 data/end/error를 처리하며 aborted/close는 등록하지 않는다. 일부 본문→aborted→close의 EventEmitter 입력1건에서 error/end 전16 microtask 관찰 동안 body/handler가 pending·응답0이었다. 늦은 error 뒤는 기존500 JSON·headers/end1, write0·이전 bytes/GET4567 보존이다. 실제 socket abort 또는 시간 기반 timeout 검수가 아니다.` |
| 같은 표 후보/수명 행 | `소유 메모리 readBody 후보는 aborted에서 body reject1·기존 POST500 JSON1회, 늦은 close/error/end에서 추가 응답/쓰기0. 정상42.9→42·compact {mats,ts}/200 응답 동일. settle 뒤 data/end/aborted/close 제거, settled error guard1 유지. candidateApplied=false; close-only 독립검사·실제 요청수명·다른 readBody 호출부 영향 미검수.` |
| BALANCE 팀 대장 최신 실패응답 생산 보강 | `기존4/14/18/19/close2-unlink 인수와 신규 interrupted input1+minimal normal control1의 원본/후보 비교4회를 분리한다. 기존 JSON500 생산 baseline은 유지하며 readBody stream 후보는 미적용. atomic/cleanup/성공ACK 정책 변경0.` |
| BUILD 대장 최신 오류응답/앱 Gate | `현재 node-main source541ff8e6의 중간 aborted/close source pending 제한과 미채택 readBody 후보를 별도 기록. 기존 앱에 후보가 들어갔다고 표시하지 않으며 새 빌드·실HTTP/NW.js/재시작 검수0.` |

## 완료·남은 Gate

이번 source 반례·미채택 후보·정상 동등성 검수는 완료했다. 생산·기존 test·공유 docs·기존 산출·Git·서버·HTTP/socket·실게임·UI·빌드·설치·삭제·이동·fs cleanup 변경0이다. 실제 변경·checkpoint·docs 동기화와 다음 후속은 총괄이 순차 인수한다.

pending 관찰은 제한된 microtask 구간이며 무한대기 시간이나 실제 네트워크 장애 빈도를 측정한 결과가 아니다. response 대역의 end1은 실제 wire 완료/사용자 수신/프로세스 생존 증거가 아니다. 실제 Node abort/close/error 순서·close-only 독립 경계·error guard 수명·공유 readBody 호출부·실HTTP/NW.js 앱은 미검수다. 직접 write가 유지되므로 파일 쓰기 도중 이전 JSON 보존·partial-write durability·OS fd/temp 누수·atomic/fsync/crash/concurrency/Windows 보장으로 확대하지 않는다.

실제 사용 도구는 파일 읽기·소유 apply_patch·지정 Node/Acorn/VM·rg·UTC clock이며 외부 API/MCP/skill/서버 호출은 없다. 필요 없는 연결·생성·설치로 범위를 넓히지 않았다. 소유3파일만 인계하고 같은 검사를 반복하거나 다음 일감을 생성하지 않는다.
