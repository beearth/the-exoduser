# BALANCE — 지속 close·unlink 복합 실패 반례 인수

**신규 입력1건, 정책 비교 실행2회에서 반례 재현 PASS**다. 준비 atomic 후보와 미채택500 응답 fragment 모두 이전 mats/독립 슬롯 bytes를 보존하고 성공 ACK0이지만, 메모리 모형의 **열린 fd1개·자기 temp1개가 남았다**. cleanup 성공 판정은 FAIL이며 source fixture 재현 PASS와 구분한다. 생산 및 응답 정책 채택0이다.

## 기존 완료 인수와 신규 정당성

| 근거 | 기존 완료·범위 | 이번 처리 |
|---|---|---|
| actual-file14 | write/rename 주입, 신규/교체/clamp, 실제ENOENT, 원문손상 RED | 결과 읽기 인수. 재실행0/실제 파일 fixture0 |
| 전체 handler18 | 단발 close EIO 뒤 finally의 두 번째 close 성공, unlink 오류 주입 없음 | source/result 대조. 재실행0/중복 전체handler 제작0 |
| 오류응답계획 source19 | atomicSaveJSON 호출/예외 대역; cleanup 내부 미실행 | 결과·fragment SHA 읽기 인수. 재실행0 |
| 신규 입력 | 첫 close와 finally close 모두EIO, 자기 temp unlink EACCES | 기존 세 근거에 없는 결합 입력1건만 수행. open/write/rename 단발·정상clamp·충돌/ENOENT·새 patch0 |

## 입력·실제 source 계약표

| ID / 한글명 | 입력·schema·수치 | 실제 적용 위치·함수 |
|---|---|---|
| MATS-CLOSE2-UNLINK-DENIED-01 / 지속 close·unlink 실패 결합 | target 초기 `{"mats":4567,"ts":99}`; POST `{mats:100}`; 독립 슬롯 `{"player":{"lv":7},"game":{"stage":2},"ts":8}` | 공유 `/api/mats` POST/GET 분기만 실행. 캐릭터 route 미실행 |
| MATS-CLAMP / 공유 악의 정규화 | `Math.max(0,Math.min(Math.floor(+body.mats||0),Number.MAX_SAFE_INTEGER))`, 상한9007199254740991 | 원 POST의 식 그대로. 다른 정상 입력을 반복 검수하지 않음 |
| MATS-SCHEMA / 공유 저장 | `{mats:n,ts:Date.now()}`; fixture clock123456·pid12002 | 실제 helper가 temp에2칸 pretty JSON 기록. clock/pid는 메모리 fixture 대역 |
| ATOMIC-TEMP / 자기 임시파일 | `/synthetic/_sharedMats.json.tmp-12002-1`, fd31 | 실제 `atomicSaveSequence`/`atomicSaveJSON`; `wx`→write 성공→close1 EIO→finally close2 EIO→unlink EACCES |
| MATS-RESPONSE / 실패 응답 | 원 atomic POST=Promise 거부/end0, 미채택 fragment=500 text/plain/end1 | 실제 readBody/sendJSON 및 준비 source fragment. helper 대역0 |

| 실제 source ID | SHA-256 |
|---|---|
| 현행 server.cjs | `18cf9aa806d5715788f360debbc2a45c2574a76db952f101b524e2ff77fd517d` |
| 현행 node-main.js | `01b0c1d51f77f500ee0a59185458bf0294edce12544482d6cf7abce4262c91ce` |
| server에서 추출한 sequence/helper | `3dc865c85002dcc58e2986d0bcbb069e47f6663d6c4c4ed5555370d7a1b5684a` |
| 준비 atomic POST | `513910fe84eeebd09bc9d514babb2e94a8de1bd36c642fd984bd328ee15b360e` |
| 현행 GET | `478234c1293b3ce91701ea507f81f61f66246ff99af21e167bcdb65b72352b4d` |
| 현행 readBody / sendJSON | `c74146a60b861e66a276841997b5e30589f72938edbc099e18662d7e800c74f5` / `c09093657543e7fda7890b8848ac28dd3ae7a2ce903b26b6ed172efdc21e55d6` |
| 기존 미채택500 fragment | `e2cdcde449c72c38bd569f1ada8687186df8d038d6dbfe7b713fba5712464308` |

시작 source는 선행 SHA와 일치했고 생산 적용 뒤 builder를 다시 적용하지 않았다. 기존 후보에서 POST, 현행에서 helper/sequence/GET/readBody/sendJSON을 AST 추출했다. 전체 서버 import/listen0, 새 patch/후보 생성0. 실행 전후14개 읽기 입력 SHA도 동일했다.

## 동일 입력의 정책 비교 결과

| 관측 | 준비 atomic POST 후보 | 기존 미채택500 fragment |
|---|---|---|
| 원 예외 | `EIO: persistent close 1`이 handler Promise로 전파 | fragment catch가 같은 예외 처리; Promise 거부 없음 |
| close 시도 / unlink 시도 / rename |2 /1 /0|2 /1 /0|
| cleanup 예외 | close2 EIO·unlink EACCES가 finally에서 삼켜짐 | 같은 helper·같은 결과 |
| 이전 target / 독립 슬롯 bytes | 정확 보존 / 정확 보존 | 정확 보존 / 정확 보존 |
| 후속 actual GET mats |4567|4567|
| POST 성공 ACK 수 |0|0|
| POST 응답 / end 횟수 | status 없음 /0|500 text/plain `Internal Server Error` /1|
| 남은 fd map | fd31→자기 temp,1개 | 같은 fd31→자기 temp,1개 |
| 남은 temp map | mats100/ts123456 JSON,1개 | 동일 bytes/SHA,1개 |
| cleanup 판정 | **성공 아님** | **성공 아님** |

temp bytes SHA는 `b05714d04480c205502403346634da2fbd36a90bf017af4f5be910d132c2e79b`다. 첫/두 번째 close와 unlink의 시도·예외, fd/temp 전체 map 및 POST/GET raw trace는 evidence.comparisons에 보존했다. POST 성공 ACK0과 후속 GET의200 응답은 별도 기록했다. finally가 예외를 삼켰다는 사실로 cleanup 완료를 표시하지 않는다.

## 수신·실행·보존

| 단계 | 근거 |
|---|---|
| 수신/Read | 총괄 직접 후속 메시지, TASK 전체 및 지정 기존 근거 읽기. 수신의 정확한 시각은 제공되지 않아 추정하지 않음. 실제 Read 완료 뒤 clock 관측은 evidence.received |
| 경로 | root·소유 폴더·TASK의 realpath가 지정 절대경로와 동일, symlink 경계 변경 없음. 시작 소유 폴더는 TASK.md만 존재 |
| 실행 | 지정 Node v24.15.0/darwin arm64, `node --check checks.mjs` 및 소유 checks.mjs exit0. 2026-10-02 13:33:28.067→13:33:28.123 KST |
| 신규 반례수 |1입력·2정책 비교. 기존14/18/19 재실행0이며 수를 합산하지 않음 |
| 산출 | checks.mjs/result.md/evidence.json 3파일만. TASK/기존 후보/공용 docs/생산/원담당 산출 수정0. 실제OS fixture·폴더 생성·파일/폴더 삭제0 |
| 지시 충돌 기록 | 첫 TASK cat과 같은 호출에서 Git HEAD/status 읽기2건을 수행한 것은 TASK의 Git 명령0 규칙 위반. commentary에 공개하고 이후 Git 명령 중단. Git쓰기 명령0이며 이 읽기의 HEAD/Changes를 승인 checkpoint 근거로 사용하지 않음 |

이번 TASK에는 총괄 제공 현재 HEAD/Changes/정확 수신 시각이 없으므로 새 운영 값을 추정하지 않는다. 기존 project-team 기록의 checkpoint는 당시 이력이며 이번의 현재 원격 보존 증거로 사용하지 않는다. Git 인덱스의 전후 byte 동일성은 측정하지 않았다.

## docs 전체 검색·정확한 동기화안

코드 산출 뒤 `rg -n "sharedMats|공유 악의|atomicSaveJSON|/api/mats|fsync|지속.*close|unlink" docs/`를 실행했다. exit0·64매칭·22문서, 전체 출력 SHA `b561991eee4c3df8cb528695753e6e9801e573965c1ad038e6b23ceffd6cc6d2`다. 매칭 목록은 evidence.docsSearch에 있고 별도 로그 파일을 만들지 않았다. 공용 docs·보호2_3 수정0이다.

총괄 인수 시 다음 제한을 **기존 단발 성공 근거를 보존한 채 새 행으로** 추가한다.

| 문서·위치 | 정확한 제한/현재상태 동기화 문구 |
|---|---|
| 저장 SSOT 말미 `공유 악의 전체 node-main handler 후보 회귀 보강` | `2026-10-02 신규 복합 실패 source fixture: 최초 close와 finally close가 모두 EIO, 자기 temp unlink가 EACCES인 입력1건을2정책에서 비교했다. 이전 target/슬롯 bytes 및 GET4567은 보존하고 POST 성공 ACK0이나, 각 메모리 모형에 fd1/temp1이 남았다. 단발 실패의 temp0/fd0을 지속 복합 실패 보장으로 확대하지 않는다.` |
| 같은 표 오류응답 한계 | `준비 atomic POST는 Promise 거부/end0, 미채택500 fragment는500 text/plain/end1이다. 양쪽 cleanup 잔존은 동일하며 응답 처리와 cleanup 성공은 별도 계약이다. 응답 정책 생산 채택0, 실제HTTP/socket/프로세스생존 검수0.` |
| BALANCE 팀 대장 `공유 악의 실제 파일 후보 인수` 뒤 | `기존 actual-file14/handler18/source19 인수와 신규 결합 입력1건·2비교 실행을 분리 기록한다. cleanupSucceeded=false, productionApplied=false, responsePolicyAdopted=false. 실제OS의 close 실패 후 fd 상태·fsync/전원손실/crash/동시writer/Windows/앱재시작은 미검수다.` |
| 총괄 최신 인수 행 | 이3산출의 source 반례 완료와 cleanup·runtime 미완료를 구분. 신규 patch/cleanup 정책 없음, 시작 Git읽기2건 규칙 충돌과 이후 중단도 인수 근거에 남김 |

## 남은 Gate

fs는 메모리 대역이며 **EIO가 fd를 열린 채 남긴다**는 지정 실패 모형이다. 실제 OS close 실패가 항상 같은 fd 상태를 남긴다고 주장하지 않는다. unlink EACCES도 주입이다. actual atomic helper는 실행했으나 실제 파일·socket·HTTP·프로세스 생존·실게임/앱/visual은 실행하지 않았다.

`productionApplied=false`, `responsePolicyAdopted=false`다. **source fixture PASS ≠ runtime/visual PASS**이며 cleanup 성공 보장도 아니다. fsync/전원손실/crash/동시writer/Windows/앱재시작은 미검수다. cleanup 재시도·로깅·백그라운드 정리·새 정책 구현0, 다른 route/경제/HTTP 정책 확장0. 이 한 건의 결과만 총괄에 인계하고 후속 일감·다른 채팅 메시지를 생성하지 않는다.
