# NW.js 슬롯 저장 오류 응답 소스 인수 — 2026-10-02

POST `/api/save`에서 요청 본문 읽기·JSON 해석·슬롯 처리·직접 파일 쓰기가 실패하면 기존 handler는 거부되며 실패 응답을 보내지 않았다. 저장 분기의 처리만 try/catch로 감싸 기존 mats 선례와 같은500 JSON을 시도한다. 정상200 및 `No data`400의 전송은 catch 밖에 유지하여 응답 전송 오류를500으로 재시도하지 않는다.

| 인수 항목 | 값 / 경계 |
|---|---|
| 실제 checkout | `/Users/fordeargamers/Projects/exoduser-migration-20261001` |
| root 제공 시작 HEAD | `4f7c6cbcbbfe7f2df1bd7e3083d8c9a2755c12bd` |
| 생산 적용 / source 인수 | true / save catch·실패 전송 시도 계약만 |
| native HTTP / 앱 / 실제 storage 인수 | 모두 false |
| 소스 영수증 | `tmp/mac-migration-runtime/continued-review-20261002/save-body-error-backup/receipt.json` |
| 영수증 SHA-256 | `c6e907a82876162eb06007cef854a1963380e5419965edfd4e70f666487c2e75` |
| 새 검수 파일 | `test/saveBodyErrorResponse.test.cjs` |
| 검수 SHA-256 | `6fb7e42c191a4d413a24a2cdf4269eb6b37c05a5ab47e561e52f63506475315f` |
| 문서 담당 실행 | source/test 원문·TAP/영수증·SHA 읽기 및 docs 검색/동기화; 새·기존 test 실행0 |

## 변경 접점·정상 계약 보존

| 파일 / 위치 | 원문 → 현재 |
|---|---|
| `node-main.js` POST save 선언 | 현재125줄; 변경 첫 줄126 |
| 변경 접점 |275→422바이트(+147),1곳; 접점 밖 전체 bytes 동일 |
| 이전 source SHA | `541ff8e6f57db862ddbb1b148ee37a3a8e0da1e16293bc8343a0bc4144d80daf` |
| 현재 source SHA | `09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3` |
| 현재 save branch SHA | `b39c1bd98fc52c76d5554b13cd1445d4896c2d00143d904bf355fdff5d619d39` |
| 역사 AST control SHA | `5780001a5c5db67aa226d9a21141a4486aefead828acf17bd7ceecb91d204818`; 실제 prepatch route SHA와 동일 |
| 공통 helper | sanitizeSlot49, sendJSON52, readBody56; 원문 변경0 |

현재 변경 구역:
```js
let body, slot;
try {
  body = await readBody(req);
  slot = sanitizeSlot(body.slot || 'default');
  if (body.data) fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(body.data, null, 2), 'utf8');
} catch (error) {
  return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });
}
if (!body.data) return sendJSON(res, 400, { ok: false, error: 'No data' });
return sendJSON(res, 200, { ok: true, slot });
```

| 정상 계약 | 현재 값 / 순서 |
|---|---|
| slot 기본값 | `body.slot||'default'` |
| sanitize | `String(name)` → 허용 외 문자 underscore → `slice(0,50)`; 영문·숫자·가~힣·underscore·hyphen 허용 |
| 파일명 / 내용 | `SAVE_DIR/slot+'.json'`, body.data만 `JSON.stringify(body.data,null,2)` |
| 인코딩 / 끝개행 | utf8 / 추가0 |
| 성공 순서 | 직접 `fs.writeFileSync` 반환 →200 `{ok:true,slot}`; 성공 sendJSON catch 밖 |
| 공통 헤더 | `Content-Type:application/json`, `Access-Control-Allow-Origin:*` |
| 변경 외 | slot/schema·mats·game/easy·공통 readBody·개발 server·atomic/cleanup·경제수치 변경0 |

`SAVE_DIR`의 APPDATA 또는 homedir 분기와 `EXODUSER-HELL/saves` 경로는 기존 코드 그대로다. live 저장 경로를 실행하거나 사용자 파일을 읽고 쓴 인수가 아니다. 변경된 try의 `body.data`와 catch 밖 No-data 검사로 일반 JSON data를 두 번 확인하는 구현을 유지하며, getter/proxy 객체의 일반적인 동등성 보장으로 확대하지 않는다.

## 실패별 응답·쓰기·전달 구분

| id / 입력·접점 | 현재 NW.js `node-main.js` 계약 | 검수·한계 |
|---|---|---|
| POST `/api/save` / catch 범위 | `await readBody`·JSON 해석·`sanitizeSlot`·truthy `body.data` 검사·직접 write를 catch; 실패는500 JSON `{ok:false,error:'Internal Server Error'}` | 응답 가능한 대역에서 writeHead/end 각1; 내부 code/path/message를 응답에 넣지 않음 |
| malformed JSON / request error / null body / sanitize 실패 | 위500; 쓰기0·성공200 ACK0 | 실제 소스·합성 요청/응답/메모리 파일 경계. JSON 본문 null은500, `{data:null}`은400 |
| JSON 해석·body 접근·sanitizeSlot 성공 + !body.data |400 JSON `{ok:false,error:'No data'}`, 쓰기0 | data missing/null/false/0/빈 문자열5입력, 이전 정규화 trace 동등 |
| 정상 저장 | `sanitizeSlot(body.slot||'default')`; data만 `JSON.stringify(body.data,null,2)` UTF-8 직접쓰기 완료 뒤200 `{ok:true,slot}` | 정상3입력의 slot/pretty bytes/write-before200·응답 전체 trace 동등; 저장 bytes에 끝개행 추가0 |
| 파일쓰기 예외 | 쓰기 시도1 뒤500, 성공200 ACK0; rollback 추가0 | 변경 전 메모리 오류는 이전 슬롯 유지, 부분 변경 뒤 오류는11문자 prefix 잔존. 실제 OS 부분쓰기 안전성 UNKNOWN |
| 400/200 응답 전송 | catch 밖; writeHead/end throw는 같은 Error로 거부,500 재시도0 | head1/end0 또는1 대역; 정상200 전송 throw는 이미 쓰기 시도1 |
| catch의500 전송 / 닫힌 response |500 전송 throw도 한 번의 시도 뒤 거부. closed 대역은 head1/end1이지만 delivered0 | 실제 wire 전달·response error event·프로세스 생존 UNKNOWN |
| 공통 `readBody` | data/end/error 구현 그대로 | aborted/close-only/timeout/리스너 cleanup 정책 변경0, 이번 실행0 |
| 개발 서버·저장 정책 | `server.cjs` outer500 및 atomicSaveJSON 경계 불변; NW.js 직접 write 유지 | 공용 atomic 후보·crash/fsync/동시 writer/실앱·실디스크 인수0 |

변경 전 node-main의 malformed JSON은 readBody의 end 콜백에서 reject이고, 파일쓰기 throw도 save handler rejection/응답0이었다. 기존 parse400 또는 fs500이 있었다고 기록하지 않는다. 이번에 승인한 범위 B는 read/parse·sanitize·data 검사·write 실패의500 신규 마감 시도다. 공통 readBody를 바꾸거나 abort 후보를 채택한 변경은 아니다.

### 실제 관측과 한계

| case | write | 열린 응답 대역 | 보존 / 한계 |
|---|---:|---|---|
| 즉시 request error |0|500 head1/end1|기존 메모리 슬롯·독립 mats bytes 보존 |
| 부분 body 뒤 request error |0|500 head1/end1|부분 data를 저장하지 않음 |
| malformed JSON `{` + end |0|500 head1/end1|정상 JSON No data400과 구분 |
| JSON 본문 null |0|500 head1/end1|body.slot 접근의 shape 실패 |
| JSON slot `{toString:1}` |0|500 head1/end1|실제 sanitize가 throw하는 JSON shape |
| write EIO, 변경 전 주입 |시도1|500 head1/end1,200 ACK0|주입 위치 때문에 이전 메모리 슬롯 보존 |
| write EIO, 부분 변경 뒤 주입 |시도1|500 head1/end1,200 ACK0|11문자 prefix 잔존, rollback0; 실OS 부분쓰기 UNKNOWN |
| closed response double |0|500 head1/end1 시도|destroyed/writableEnded true, delivered0 |
|500 writeHead throw|0|head1/end0 뒤 rejection|전송 Error 동일 객체·추가 시도0 |
|500 end throw|0|head1/end1 뒤 rejection|전송 Error 동일 객체·추가 시도0 |
|200/400 head/end throw|200의 시도1 /400의0|원 status head1/end0 또는1 뒤 rejection|동일 Error·500 재시도0, 역사 control과 trace 동등 |

header/end 횟수와 `delivered`는 대역의 기록이다. 실제 IncomingMessage·ServerResponse·wire 수신·response error event·프로세스 생존을 관측한 증거가 아니다. 실패 응답의 일반 메시지는 내부 code/path/message를 포함하지 않는다. body 오류 쓰기0와 일부 쓰기 이후 실패를 분리하며, 모든 파일쓰기 실패에서 이전 파일이 보존된다고 주장하지 않는다.

## actual-source 검사와 모형 경계

검사는 Acorn으로 현재 디스크의 유일한 POST save if와 실제 `readBody`·`sendJSON`·`sanitizeSlot`을 추출하고 선택 분기를 async VM 함수로 감싼다. node-main 모듈을 import하거나 최상위 dlog/mkdir/http.createServer/listen을 실행하지 않는다.

| 의존성 / 변형 | 실제 실행 경계 |
|---|---|
| req | native EventEmitter, data/end/error emit; 실제 IncomingMessage 아님 |
| Buffer/path/JSON | Node 기본 구현; 정상 UTF-8 body를 byte11에서 나눠 concat/parse |
| fs | 메모리 Map의 writeFileSync; 변경 전·11문자 부분 변경 후 EIO 주입 |
| res | writeHead/end/status/bytes/전달 기록, closed 및 동기 head/end throw |
| handler 관찰 | 반환 Promise를 하니스가 외부에서 관찰; 생산 catch를 주입하거나 강제 settle하지 않음 |
| 역사 control | 현재 AST assignment를 const로 복원하고 actual No-data/write/ACK 원문을 이전 순서로 재구성; SHA가 실제 prepatch branch와 정확히 동일 |
| 실행 범위 밖 | 전체 handler/module/server·HTTP/socket·앱·실파일·실게임·재시작 |

새 normal metadata8개는 정상3입력과 No data5입력이다.

| 정상 /400 입력 | 결과 |
|---|---|
| `slot:'영웅/../ A?'` + player/game/ts | sanitized `영웅_____A_`, pretty UTF-8 data 직접쓰기1→200 |
| slot 없음 + Unicode `한글 😀` data | `default`, split UTF-8 concat 후 원본 bytes·trace 동등 |
| `slot:'한글'+'A'.repeat(60)` | sanitize 후50자로 잘린 파일명, 원본 bytes·trace 동등 |
| `{}`, `{data:null}`, `{data:false}`, `{data:0}`, `{data:''}` | 쓰기0 /400 No data, 원본 bytes·trace 동등 |

3정상+5 No-data trace는 actual prepatch baseline과 현재 AST 메모리 control 모두 동등하다. 공유 mats 파일은 별도 메모리 bytes로 유지한다. 이 비교는 실제 디스크 성공 저장 또는 서버 ACK→종료→재기동 검수와 다르다.

## 검수 수치와 역사 범위

| 새 actual-source 테스트 그룹 | 그룹 수 | 최종 |
|---|---:|---|
| 즉시 error /부분 error /malformed JSON /null shape /sanitize 실패 |5|PASS |
| write EIO 변경 전·부분 변경 두 위치 |1|PASS |
| 정상3입력 전체 trace |1|PASS |
| No data5입력 전체 trace |1|PASS |
| 역사 control request/parse/null/write 거부 |1|PASS |
| closed response 전송 시도·delivered0 |1|PASS |
|500 전송 head/end throw |1|PASS |
|200/400 전송 head/end throw |1|PASS |
| **합계** |**12**|**12 PASS /0 FAIL**, exit0 |

각 그룹 내부 관측·8개의 정상/400 trace는12개에 포함되며 별도 테스트로 더하지 않는다. 생산 전 동일한 새12그룹은4 PASS/8 FAIL의 역사 baseline이고 최종 실패 수와 합산하지 않는다. baseline 이후 fixture 수정0이다. 구문 검사는 `node --check node-main.js` 1회 exit0이며 모듈 실행0이다.

최종 TAP SHA는 `ecda2de373af568841f931d57dcfa576445def8f4c7ef6e7b5edcf07ff31103c`다. metadata 파싱은 TAP의 backslash/hash 진단 이스케이프만1회 해석했고 raw TAP는 원문으로 보존한다.

전문팀 `BALANCE-save-body-error-0557`의 오류1+정상1·원본/후보4비교 및 `productionApplied=false`는 제출 당시 메모리 후보 이력이다. 새 root source12와 구분하며 기존4·mats14/18/19·공용 abort/close-only·SOUND/BUILD/boss/storm 검사를 import·재실행·합산하지 않았다. 원자료와 기존 판정을 변경하지 않았다.

## docs 전체 검색·정본 보존

| 검색 | 시점 / 행·파일 | 원문 보존 |
|---|---|---|
| docs 담당 broad | 초기2519행 /465파일 /1346180바이트 | raw 전문·SHA·exact 경로 |
| docs 담당 targeted | 초기51행 /27파일 /17389바이트 | raw 전문·SHA·exact 경로 |
| docs 담당 final union | 최종 source 후2534행 /465파일 /1349502바이트 | raw 전문·SHA; 초기 union 대비 신규 매칭파일0 |
| source 담당 exact IDs | 최종 source 후29행 /16문서 /10342바이트 | raw 전문·행별분류, receipt 연결 |

문서 담당 검색은 readBody·/api/save·保存·JSON/400·500·write·aborted/error·sanitizeSlot·No data·Internal Server Error·req.on·abort·closed response를 docs 전체에서 head/truncation 없이 저장했다.

| 시스템 분류 | 동기화 / 보존 |
|---|---|
| 저장 SSOT + API 연결 가이드 | 현재 NW.js save 오류표를 신규 append; 원문 prefix·개행100% 보존 |
| API 가이드 §4 / server.cjs | 개발 API 참조 그대로; 기존 outer500·atomicSaveJSON 정책을 NW.js 직접쓰기와 분리 |
| BALANCE/BUILD master의 mats500 및 source/app pins | 날짜 있는 이전 완료 source/패키지 검수 이력 보존; 이번 save source12와 혼합0 |
| 공용 readBody abort/close 및 atomic 후보 | 미채택·미검수 역사 보존; source12로 완료 처리0 |
| 실제 디스크 restart EPERM | 서버/API 실행0 차단 이력·미완료 Gate 유지 |
| QA HTTP 차단·맵/미디어 abort·그외 write/error 수치 | 현재 save catch의 영향 없음; 이전 native/visual/성능 판정 유지 |
| root CHANGELOG/CONTINUOUS-INTEGRATION·supervisor·보호2_3 | 문서 담당 수정0 |

기존 정본2개에 현재 NW.js save 오류표가 없어 날짜 없는 현행행 교정 예외를 사용하지 않는다. 원문은 그대로 append하고 전용 보고서만 새로 생성한다. 신규 보고서 EOF 개행1, 후행공백0이다.

정확 소유:
- `docs/15 세이브+데이터구조/15 세이브+데이터구조.md`
- `docs/API연결_가이드.md`
- `docs/15 세이브+데이터구조/SAVE_BODY_ERROR_RESPONSE_20261002.md`

백업·검색 분류·최종 source/test/docs SHA·prefix 증거는 `tmp/mac-migration-runtime/continued-review-20261002/save-body-error-docs-backup/2026-10-02T07:57:32.690Z-244eab27-34a9-41fb-a9e2-93ca9594a8bc/completion.json`에 기록한다.

## 남은 Gate

| 항목 | 판정 |
|---|---|
| request aborted/close-only/timeout/late event/리스너 cleanup | 정책 변경0, 이번 실행0, UNKNOWN |
| 실제 HTTP·wire·native 앱·closed response 전달·프로세스 생존 | 미검수 |
| 실제 성공 저장/부분 실패·Windows·atomic/fsync/crash/concurrency | 미검수 |
| 서버 시작·사용자 저장·실게임/UI·EPERM 우회·빌드/설치/삭제 | 실행0 |
| 현재 source를 기존 설치 앱에 반영 | 재빌드0; 역사 앱 pin을 새 관측으로 기록하지 않음 |

이번 source PASS는 실제 HTTP 성공 응답·사용자 저장 안전성·실앱 완료를 대체하지 않는다.
