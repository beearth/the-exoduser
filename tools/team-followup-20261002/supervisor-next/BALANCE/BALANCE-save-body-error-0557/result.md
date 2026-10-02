# BALANCE-save-body-error-0557 — 슬롯 저장 request error 응답

현행 POST `/api/save`에 요청 error1회를 보내면 원래 readBody는 거부되지만 **handler도 rejected1·headers/end0**이다. 최소 메모리 save catch 후보는 **500 JSON·headers/end 각1회**로 마감한다. 양쪽 실패 모두 write0·성공ACK0·기존 슬롯 bytes 보존이다. 정상 완성 본문1개에서 슬롯명 sanitize·pretty JSON 저장·직접쓰기 후200 응답은 원본과 후보가 정확히 동일했다.

이번 새 오류 입력1+정상 입력1을 원본/후보에 전달한 source4비교 PASS다. 이전 close-only8/abort4/기존4·14·18·19검사 import·재실행·합산0. productionApplied=false, 공용 readBody 후보 적용0, 실제 HTTP/NW.js 미검수. 앞선 NO-FIX는 공용 후보 인수 보류였으며 이번에 발견한 실패가 없다는 뜻이 아니다.

| 기준/소유 | 기록 |
|---|---|
| 담당 | Codex BALANCE, 기존 확인 chatId `01a0faaf-a06a-79a2-9def-58eb8ad10d65` |
| 지시 Read | 새 TASK 먼저, COMMON/AGENTS/담당표/저장 SSOT 최신 NW.js 표·공유 저장 계약 읽기 후 source 조사. 정확 메시지 수신시각은 미제공(null) |
| cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` |
| 제공 checkpoint | `6c2dadab0b3a81a600e8358f485518cfcb122199`는 TASK의 root 제공 이력. 독립 현재 HEAD 관측 아님 |
| 실제 source Read |2026-10-02 05:59:32.414 UTC /14:59:32.414 KST. node SHA `541ff8e6f57db862ddbb1b148ee37a3a8e0da1e16293bc8343a0bc4144d80daf` |
| 실행 |지정 Node v24.15.0,05:59:32.406→.460 UTC /14:59:32.406→.460 KST. syntax check1회 exit0, 새 fixture1회 exit0 |
| 쓰기 소유 |새 TASK 폴더 checks.mjs/result.md/evidence.json만. TASK·생산·공유docs·기존산출·영구test 쓰기0 |
| 운영 |Git 조회/쓰기0, Changes 미제공(null)·감독 추적.80 checkpoint/100 전 신규산출 중단 계약 유지. 보스 사망 후 맵 리셋 조사/수정0 |

## 실제 source와 합성 의존성

| 대상 | 검수 경계 |
|---|---|
| readBody / sendJSON / sanitizeSlot |현재 node-main의 실제 함수 선언을 AST 추출해 VM 실행. readBody는 수정하지 않음 |
| POST /api/save |실제 분기 전체 실행. await readBody 뒤 sanitize, data 검사, 직접 write,200 ACK. local catch 없음 |
| save catch 후보 |새 메모리 분기 SHA `990b5e8a173a849561d8f6d6fbe325ed7e7df360a53a708b3260df4bb341af24`, 전문은 evidence.source.candidate. 생산/공유 helper 연결0 |
| req/res/fs/clock |EventEmitter 요청·writeHead/end 기록 객체·파일 Map·Date.now=123456. clock은 현재 save가 사용하지 않음. path/Buffer/JSON은 Node 기본 구현 |
| 전체 서버 |import/listen/실제 HTTP/사용자 세이브/앱/게임/빌드0 |

후보는 `let body,slot`을 두고 await readBody·sanitize·data가 있을 때의 기존 직접 write를 try 안에 둔다. catch는 mats와 같은 `sendJSON(res,500,{ok:false,error:'Internal Server Error'})`로 반환한다. `!body.data`의400 `{ok:false,error:'No data'}`와 정상200 `{ok:true,slot}` 응답은 catch 밖이다. 본문은 JSON.parse의 일반 객체이며 후보의 data 검사2회는 source 전문에 보존했다. getter/proxy 객체 동등성은 검수하지 않았다.

## 오류1입력 및 정상1입력 결과

오류 요청은 등록 직후 `error`1회(ECONNRESET, 합성 메시지)를 emit했다. data/end/aborted/close·늦은 이벤트0. 하니스 rejection 관찰자는 상태만 기록하며 생산 route에 catch나 응답을 추가하지 않는다. 각 관찰은16 microtask이고 강제 완료/timeout0이다.

| 오류 항목 | 현행 | 메모리 후보 |
|---|---|---|
| body settle |rejected1 ECONNRESET|rejected1 ECONNRESET|
| handler settle/반환 |rejected1 동일 오류, 정상 반환 없음|fulfilled1, sendJSON 반환 undefined|
| 실패 응답 |headers/end0, status 없음|500 `{ok:false,error:'Internal Server Error'}`, headers/end1|
| 헤더 |없음|Content-Type application/json, Access-Control-Allow-Origin `*`|
| write / 성공ACK |0 /0|0 /0|
| 이전 슬롯 bytes |`{"player":{"lv":7},"game":{"stage":2},"ts":8}` 정확 보존|동일 보존|
| 독립 공유 mats bytes |`{"mats":4567,"ts":99}` 정확 보존|동일 보존|

정상 입력은 `{slot:'영웅/../ A?',data:{player:{lv:9},game:{stage:4},ts:80}}`이며 data→end만 보냈다. 원본/후보 모두 sanitize 결과 `영웅_____A_`, `/synthetic/영웅_____A_.json`에 data만 `JSON.stringify(data,null,2)` UTF-8 직접쓰기1회,200 `{ok:true,slot:'영웅_____A_'}` headers/end1회·성공ACK1회다. body/handler fulfilled1, 반환 undefined. write가 headers 전에 발생하며 write 기록·응답 전체 deepEqual PASS, 독립 공유 mats bytes 보존이다.

readBody listener data/end/error/aborted/close는 각 실행 최종1/1/1/0/0이다. 공용 readBody는 원본 그대로이므로 앞선 후보의 error guard·listener cleanup 효과를 이번 결과로 주장하지 않는다.

## 정본 인계와 남은 Gate

새 fixture 뒤 docs 전체 `readBody|/api/save|sanitizeSlot|No data|Internal Server Error` rg exit0,27매칭/16문서, 출력 SHA `d437a7d1a4c34516fb065c4a4f006545108e18a509f39b6522c1bcb505578832`. 목록은 evidence.docsSearch에 있다. 공유docs 쓰기0이며 root의 순차 통합용 문안은 아래와 같다.

| 정본 위치/항목 | 정확한 인계 문안 |
|---|---|
| 저장 SSOT / NW.js 슬롯 본문 오류 | `현행 node-main POST /api/save는 await readBody의 request error 거부가 handler rejected1로 전달되며 합성 error1입력에서 headers/end0·write0·성공ACK0·기존 슬롯 bytes 보존. 하니스 rejection 관찰과 생산 catch는 구분한다.` |
| 저장 SSOT / 미채택 catch 후보 | `메모리 save 분기의 body read/parse·sanitize·data 검사·직접쓰기 catch 후보는500 JSON {ok:false,error:'Internal Server Error'}·application/json·CORS *·headers/end1.400 No data와200 성공 응답은 catch 밖. productionApplied=false, 공용 readBody 후보 적용0. 정상 슬롯 sanitize/pretty JSON/write 후 ACK 동등성1입력 확인.` |
| BALANCE 대장 / 검수 범위 | `이번 오류1+정상1 원본/후보4비교 PASS. 이전 close-only8/abort4/atomic14·18·19/기존회귀4 재실행·합산0. 최종 API500 정책 채택은 root 소관.` |
| SSOT / 미검수 | `400 No data는 source 유지안이며 이번 실행0. fs 오류·부분write·응답 writeHead/end 오류·이미 종료된 response·실HTTP/IncomingMessage/NW.js/재시작/실파일/Windows/fsync/atomic/cleanup/concurrency는 미검수.` |

현재 오류 반례와 최소 catch 안은 인계 완료이며 API 정책/생산 반영은 root 소관이다. catch 범위에 fs 쓰기가 포함돼도 이번에는 fs 오류를 주입하지 않았다. 응답 전송 예외는 catch 밖이며 실패 응답 자체의 throw도 추가 catch하지 않는다. 하니스의 end1은 실제 wire 수신/프로세스 생존 증거가 아니다.

실제 사용은 파일 Read, 소유 apply_patch, 지정 Node·Acorn·VM·EventEmitter·rg, 최종 Python artifact 검증이다. 외부 API/MCP/skill·새 세션/하위팀·다른 채팅 메시지·삭제/이동/설치0. 후속 업무 자체 생성0.
