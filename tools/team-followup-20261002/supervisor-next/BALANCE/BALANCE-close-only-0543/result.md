# BALANCE-close-only-0543 — close-only와 공용 readBody 호출부

새 close-only 경계 검증 완료. 현행 source는 두 저장 호출부에서 본문/handler pending·응답0이었다. 같은 미채택 후보는 `/api/mats`에서500 JSON1회를 마감하지만 **`/api/save`는 catch가 없어 handler rejected·응답0**이다. 따라서 공용 후보를 그대로 생산 적용하는 것은 **NO-FIX/인수 보류**로 판정한다. 후보의 본문 거부만으로 모든 저장 호출부의 실패 응답을 보장할 수 없다.

새 부분 본문 입력1개와 완성 본문 정상 대조1개를 두 실제 호출부·원본/후보에 전달한 source 비교8회다. 이전4/14/18/19·aborted→close4비교를 재실행하거나 합산하지 않았다. candidateApplied=false, runtimeVerified=false. 생산/공유docs/기존test/기존산출/Git/서버/게임/빌드/삭제 변경0이며 새 소유3산출만 작성했다.

## 실제 기준과 소유

| 항목 | 실제 기록 |
|---|---|
| 담당/채팅 | Codex BALANCE / `01a0faaf-a06a-79a2-9def-58eb8ad10d65`; 기존 확인된 담당 ID, 새 세션 생성0 |
| TASK | 감독 메시지의 TASK를 먼저 읽음. TASK/COMMON/AGENTS/현재 담당표/저장 SSOT 최신 NW.js 실패응답 표/BALANCE 대장/실제 node-main 호출부/이전 후보 source 읽기 완료. 정확 수신시각은 제공되지 않아 null |
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001`; 소유 폴더 realpath 일치 |
| 제공 원격 기준 | `f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c`,2026-10-02T05:42 전후 총괄 제공값(TASK). 현재 HEAD 독립 관측이 아님. 이전7e694950 등은 역사 입력 |
| 실제 실행 | 지정 Node v24.15.0,05:45:22.264→05:45:22.332 UTC /14:45:22 KST. node --check exit0 및 새 checks 실행 exit0, 각각1회 |
| Changes | 감독 추적 소유. 최신 count 제공 없음(null), Git 재조회0. 80 checkpoint/100 전 새산출 중단 계약 유지 |
| 쓰기 소유 | 이 TASK 폴더의 checks.mjs/evidence.json/result.md만. TASK/공용 문서/타인WIP/기존 산출 보존 |

## source와 의존 대역

| ID / 적용 위치 | source SHA-256 또는 실제 계약 |
|---|---|
| node-main.js | `541ff8e6f57db862ddbb1b148ee37a3a8e0da1e16293bc8343a0bc4144d80daf`; 실제 읽기 시각/SHA를 evidence.source에 기록, TASK 제공 node SHA와 일치 |
| readBody(req) | `c74146a60b861e66a276841997b5e30589f72938edbc099e18662d7e800c74f5`; data/end/error 등록, aborted/close 처리0 |
| POST /api/mats | `d591b787d1851f4234fb3a28890d0bfeb0571a6d64ef2ac57edb52affcab2b12`; await readBody가 try/catch 안, 실패500 JSON |
| POST /api/save | `5780001a5c5db67aa226d9a21141a4486aefead828acf17bd7ceecb91d204818`; await readBody와 직접쓰기/ACK에 local catch 없음 |
| 공유 호출부 수 | 실제 AST CallExpression readBody 호출2개, 원문126행 save/162행 mats. `/api/slots` GET은 readBody 미사용. OAuth는 별도 본문 코드, 이번 실행0 |
| 후보 readBody | `10815cca14a032cbe933284980081d49eb00e9db0608fdc3c50c5b309a5fd619`; 이전 evidence의 동일 함수 텍스트만 읽고 SHA 대조. 이전 fixture import/실행0, 후보 수정0 |
| 부속 실제 source | sendJSON·sanitizeSlot·각 POST 전체 분기를 AST 추출·VM 실행. 전체 서버 import/listen0 |
| 대역 | EventEmitter 요청, 응답 writeHead/end 기록 객체, 파일 Map, Date.now=123456. path/Buffer/JSON은 지정 Node 기본 구현. 사용자/OS 저장0 |

## 단일 close-only 사건

부분 입력 bytes는 `{"mats":51.8,"slot":"hero","data":`이다. 초기 공유 파일 `{"mats":4567,"ts":99}`, hero 슬롯 `{"player":{"lv":7},"game":{"stage":2},"ts":8}`. 사건은 **data→close**, aborted/error/end 발생0. 같은 입력과 초기 상태를 각 source 비교에서 새 메모리 요청에 전달한다.

| 분기 | body / handler 최종 상태 | headers/end | 파일 쓰기 / 성공 ACK | 기존 공유/슬롯 bytes |
|---|---|---|---|---|
| 현행 mats | pending0 / pending0 |0/0|0/0|둘 다 정확 보존 |
| 후보 mats | rejected1(ERR_STREAM_PREMATURE_CLOSE) / fulfilled1 |500 JSON1/1|0/0|둘 다 정확 보존 |
| 현행 save | pending0 / pending0 |0/0|0/0|둘 다 정확 보존 |
| 후보 save | rejected1(ERR_STREAM_PREMATURE_CLOSE) / rejected1(동일 오류) |0/0|0/0|둘 다 정확 보존 |

pending은 close 후16 microtask 관찰값이다. timeout·강제 Promise 완료·늦은 error를 주입하지 않았다. mats 실패 응답은 `{ok:false,error:'Internal Server Error'}`, Content-Type application/json, CORS `*`다. save 후보 거부는 하니스의 관찰 then rejection 콜백으로 기록했다. 이 콜백은 생산 route에 catch/응답을 추가하지 않으며, 실제 프로세스 crash 또는 Node unhandled rejection 정책을 검수한 것이 아니다.

## end→close 정상 대조

완성 입력은 `{mats:51.8,slot:'hero',data:{player:{lv:8},game:{stage:3},ts:77}}`. 사건은 **data→end→close**, aborted/error 발생0이다.

| 호출부 | 원본과 후보의 동일한 결과 |
|---|---|
| mats |51로 clamp, compact `{"mats":51,"ts":123456}` UTF-8 직접쓰기1,200 `{ok:true,mats:51}` headers/end1, hero 슬롯 기존 bytes 보존 |
| save | sanitizeSlot('hero')→hero, data만 JSON.stringify(data,null,2)로 UTF-8 직접쓰기1,200 `{ok:true,slot:'hero'}` headers/end1, 공유 mats 기존 bytes 보존 |
| settle |각 source body/handler fulfilled1. end 뒤 응답과 close 뒤 응답 정확 동일, 추가 write/ACK0 |
| 응답 헤더 |application/json·Access-Control-Allow-Origin `*` 원본/후보 동일 |

각 route의 write 기록(bytes·encoding·경로)과 응답 전체를 원본/후보 deepEqual로 확인했다. 이전 정상42.9 입력과 오류 회귀를 반복한 검사가 아니다.

## flags·listener 수명과 남은 Gate

| 항목 | 관측/제한 |
|---|---|
| 실패 flags | complete=false/readableEnded=false/aborted=false; close 전 fixture가 destroyed=true로 설정 |
| 정상 flags | data 시 complete=false/readableEnded=false, end 직전 둘 다 true; close 전 destroyed=true, aborted=false 유지 |
| source의 flags 읽기 |원본과 후보 모두 complete/readableEnded를 읽지 않음. fixture의 합성 값이며 실제 IncomingMessage의 발생순서 증거가 아님 |
| 최종 listener data/end/error/aborted/close |현행1/1/1/0/0, 후보0/0/1/0/0. 성공/실패 모두 후보는 관련 body listener를 제거하고 settled error guard1을 유지 |
| error guard |이번은 error를 내보내지 않아 잔존 count만 확인. 이전 late-error 검사를 재실행하지 않음. 요청 객체 실제 해제/GC/zero-listener를 보장하지 않음 |
| 생산 인수 Gate |공용 readBody 후보 인수 시 save 호출부의 실패 전달·catch 정책을 먼저 판단. 이번은 catch 후보 추가/응답 정책 변경0. 실제 Node lifecycle·socket/HTTP·NW.js 검수는 별도 |

이미 끝난 response 경계, 모든 route 회귀, 앱/실게임/빌드·실파일·fsync/atomic/cleanup/durability/concurrency는 범위 밖이다. Map bytes 보존은 본문 실패로 write0인 경계만 증명한다. source PASS를 사용자 HTTP 수신·제품/시각/저장 품질 PASS로 확대하지 않는다.

## docs 정본 인계

새 fixture 작성·실행 뒤 docs 전체 `readBody|/api/mats|/api/save|ERR_STREAM_PREMATURE_CLOSE|readableEnded|aborted` rg exit0.44매칭/23문서, 출력 SHA `b9b2d608445e29c08ecb7c06aba1b23019a985929ce7dddefdfaf41a4757095b`. 전체 문서 목록은 evidence.docsSearch에 보존했다. 공용 docs 쓰기0, 정본 통합은 원총괄 소유다.

| 정본 위치/항목 | 추가할 정확한 현재상태 문안 |
|---|---|
| 저장 SSOT 최신 NW.js 실패응답 표 / readBody close-only | `현행 readBody는 data/end/error만 등록한다. 부분 body→close-only(별도 aborted/error/end 없음)에서 body/handler가16 microtask 관찰 동안 pending·응답0. 후보는 ERR_STREAM_PREMATURE_CLOSE로1회 거부하며 mats catch가500 JSON headers/end1, write0·기존 공유/슬롯 bytes 보존. candidateApplied=false, 실제 IncomingMessage/HTTP/NW.js 미검수.` |
| 같은 SSOT / 슬롯 저장 공유 호출부 | `node-main POST /api/save는 readBody를 await하지만 local catch가 없다. 같은 후보의 close-only 거부가 handler rejected1로 전달되고 headers/end0·write0·성공ACK0. mats의500 마감 결과를 슬롯 저장 전체로 확대하지 않는다. 공용 후보 생산 인수 전 호출부 실패 전달 정책 검수 Gate.` |
| 같은 SSOT / 정상·수명 | `완성 body end→close에서 mats51.8→51 compact {mats,ts}, save hero의 data pretty JSON, 각각직접쓰기1·200 ACK1은 원본/후보 동일. 후보 listener data/end/aborted/close0, settled error guard1 유지. complete/readableEnded는 합성 flags이고 source는 읽지 않음.` |
| BALANCE 대장 / 신규 검수 | `close-only 실패 입력1+end→close 정상 입력1을 실제 저장 호출부2·원본/동일 후보2에서8회 비교. 이전4/14/18/19/중간abort4 재실행·합산0. source PASS, 공용 후보 인수는 save catch Gate 때문에 NO-FIX/미적용.` |

실제 사용은 functions.exec의 파일 읽기/지정 Node·Acorn·VM·EventEmitter/rg와 소유 apply_patch이다. 새 외부 API/MCP/skill 호출0. 실과제는 source 경계 검수라 별도 생성/연결 스킬을 적용하지 않았다. 소유3산출을 제출하고 다음 작업은 자체 생성하지 않는다.
