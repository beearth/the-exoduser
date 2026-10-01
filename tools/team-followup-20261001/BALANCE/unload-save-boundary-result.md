# unload 저장 경계 규명 — BALANCE

## 수신·실제 작업
- 수신/첫Read/receipt 선기록 2026-10-01T16:27:26Z. AGENTS, 담당경제대장·저장SSOT·전용task와 현행 양쪽 unload/AI/dbSaveNow/5개 dbSave/공유악의/로컬load 우선순위, server.cjs/node-main.js POST 저장분기를 읽었다. 동일prefix는task만 존재, 중복완료없음.
- 첫 코드 Edit/검사명령 16:28:50Z. 최종 검사 16:29:16Z: `node --test tools/team-followup-20261001/BALANCE/unload-save-boundary.test.mjs` **25PASS / 0FAIL**. 게임/브라우저/서버프로세스/빌드 실행0.
- 원함수 before.json 보존·검사전후원문 대조. 기존하니스는 읽기 import만 했으며, 기존의 async unload 완료헬퍼 대신 원listener를 등록하고 **callback을 동기 호출만** 했다. 반환값 undefined 확인. network Promise는 resolve/reject하지 않았다.

## 499ms 정상 창닫기: 원문 기반 판정
AI는 used>0일 때500ms timer를 예약한다. 499ms에서 실제 beforeunload listener는 `_dbReady&&P`이면 dbSave를 **호출만** 하고 반환한다. 이벤트취소/await/Promise 반환에 의한 저장완료대기는 없다. 따라서 정상 창닫기를 곧 ACK완료라 부를 수 없다.

| 실제 저장분기 | unload callback 반환까지 동기 실행되는 내용 | 네트워크/영속화 판정 |
|---|---|---|
| 기본DB | sanitize, 공유악의 localStorage.setItem, 공유서버 POST 호출, Supabase update/eq/select API 호출 | 아이템 DB ACK/서버반영 미확인. 직접호출부에는 keepalive 설정없음. 실제 SDK 내부전송은 이 검사에서 실행/검증하지 않음 |
| demo500 | 전체 sd JSON을 hellsave_demo500 setItem, _lastSaveTime 갱신 | 동기 sink에 최신아이템/소비자원 기록. 실제 demo500의 별도선택복원은 장비복원하지 않는 기존한계 |
| demo | 전체 sd JSON을 hellsave_demo setItem, _lastSaveTime 갱신 | 최신아이템/소비자원 동기저장식 존재. shared악의 max복원 계약은 별도이며 여기서 해결하지 않음 |
| local, _serverOk가false가아님 | 공유악의 setItem/POST 호출, /api/save fetch 호출 | HTTP response/JSON await 이전에서 반환. fullitem 동기폴백은 아직없음. wire delivery/ACK/서버파일 변경 미확인 |
| local, 이미 _serverOk===false | 공유악의 setItem/POST 호출, hellsave_SLOT 전체JSON setItem | 현재 분기의 동기폴백 fullitem 기록. /api/save 새호출0 |
| standalone | 공유악의 setItem/POST 호출 후 hellsave_web 전체JSON setItem | fullitem 동기sink 기록. 공유서버 POST는 미완료여도 callback 동기저장은 먼저 수행됨 |

성공과 실패RNG 각각 같은경계를검사했다. 실패도15000을소비했으므로 정상원문을실행하면 소비후snapshot을 구성한다. 기본DB/로컬의 _saving guard가true면 unload dbSave도 조기return하여 최신 shared/fullitem 시도조차0인 경계도 확인했다. DB미준비는 listener 자체가 저장호출0. localStorage 예외 주입은 저장성공으로 세지 않았다.

메모리 setItem 반환은 **해당 호출이 동기완료하는 구조**의 증거다. 실제 브라우저 storage quota/권한/종료/OS강제종료에서 지속성을 보장한다는 뜻은 아니다. async 네트워크는 client API 호출만 포착했고 promise를끝내지않아 모델 ACK0/모델서버persist0이다. 이0을 사용자의 실제서버 손실 관측값으로 해석하면 안 된다. 실제 wire delivery/ACK/persist는 UNKNOWN이다. 기존snapshot과전송payload 최신아이템을분리했다.

## dispatch / ACK / 서버 write 경계
1. 클라이언트 `fetch()` 호출 또는 SDK `.select()` 호출: 전송 의도/API진입이다. 이 fixture는 실제 socket으로 전송하지 않으므로 wire dispatch 완료가 아니다.
2. 로컬서버 `await readBody(req)`: data/end로 전체JSON이 수신돼야 다음 단계에 진입한다. body미완료 fixture에서는 write/ACK0.
3. 서버 저장분기 `fs.writeFileSync(...)` 반환 → `sendJSON(...ok:true)` 순서: 실제 원분기를 memory fs에서 실행해 순서를 확인했다. write예외면 성공ACK생성0. 이 검사는 **별도 전달완료 가정의 서버단계**이며 unload Promise를 임의완료시킨 결과가 아니다.
4. 클라이언트 await fetch→await res.json→j.ok에서 _lastSaveTime 갱신: 서버ACK와 클라이언트관측이 모두 필요하다. 서버write 후 응답을 관측못하는 경우도 개념상 구분하며 actual wire 검수는없다.
5. writeFileSync 반환은 서버코드의 파일쓰기완료경계지만 저장분기에서 fsync/원자적임시파일교체를 확인하지 못했다. 전원손실내구성/공유악의+아이템 트랜잭션 보장으로 확대하지 않는다. 이번 memory fs는 실제디스크를쓰지않았다.

## 기존 경로·patch 필요 여부
- 실행되는 unload 경로에 sendBeacon 호출은 없다. 주석의 navigator.sendBeacon 언급을 구현으로 세지 않는다. 직접작성된 /api/save와 /api/mats fetch에는 keepalive 옵션이 없다. 기본DB는 외부 @supabase/supabase-js@2 CDN SDK를 쓰므로 호출소스만으로 SDK 내부 unload 전송옵션을 확정하지 않는다. 편집기/과거백업의 별도 beforeunload는 현재게임저장 계약으로 채택하지 않았다.
- 기존 동기클라이언트경로는 demo/demo500/standalone setItem, local의 **기확인실패 폴백**, 공유악의 setItem이다. 서버 writeFileSync는 요청수신 이후 서버단계이며 브라우저 unload를 동기로 만드는 경로가 아니다.
- goToLobby는 `await dbSave()` 후 location.href를 변경하는 별도명시적 내비게이션이다. OS/탭닫기의 beforeunload와 동일하지 않으며 _saving guard 등 기존조기return도 있어 절대보장이라고 부르지 않는다.
- **이번에는 production patch 필요를 확정하지 않고 경계 검증기만 제출한다.** 현재원문에 best-effort 비동기창닫기위험은 있으나 사용자정상닫기의실제전송실패/서버누락을 측정하지 않았다. fake ACK로 성공을 조작하거나 전달불확실성만으로 새실전버그를단정하지 않는다.

최소 후보 적용가능성(미구현/미적용):
| 후보 | 범위/조건 | 제한 |
|---|---|---|
| 로컬 /api/save에 keepalive 옵션 | 기존JSON endpoint/payload형식은그대로. 별도unload용 제한된전송에서만 검토 | payload크기·동시진행요청·브라우저지원·실제종료/서버증거필요. ACK/쓰기보장0. 일반dbSave 전체에 임의확산금지 |
| 로컬 sendBeacon | 서버readBody는JSON본문을읽으므로JSON body구성이계약후보 | queue접수와persist는별개. 중복·순서·shared악의별도전송·응답없음·지원/권한검수필요. Supabase인증/업데이트를단순beacon으로대체하지않음 |
| unload fullitem 동기localStorage 추가 | 기존동기폴백재사용으로클라이언트기록은가능 | local load는 서버save가존재하면 로컬을무시하는 _foundSave 우선순위. 새동기사본만넣어도실제로복원되지않을수있어 단독patch 불충분. scope/전환/버전/재조정계약필요 |
| 명시적창닫기 이전 저장ACK확인 | 앱이닫기흐름을제어하는별도계약이있을때검토 | 현재beforeunload에await를더한다고보장되지않음. 앱빌드/실브라우저검수는root소유 |

## SHA·인계
| 읽은 원구역 | SHA-256 |
|---|---|
| 양쪽 beforeunload 원문 | 460b6d53ef4012dd0260b53cca298881818c889fcea4c0c1d1135add278867e7 |
| game 5개 save 배열 JSON문자열 | 4c937159632dec648ef1045b8d939a78b787d1495c7cc9e34ae4b510aa4fb229 |
| easy 5개 save 배열 JSON문자열 | 9d182bc1c772674169bff5fff948b2b0ad3579c95481ec1075ab7e8a32f25185 |
| 양쪽 shared 저장함수 결합원문 | cfa24593355c623a9fac40ecc7dcf4d17e8e050f4f0805af4de874eab9b5e332 |
| server.cjs POST 원분기 | c5cb7c8da3ac61f846bf23b7d8b365d4fba8fea655da0dcb203ccbd93723e190 |
| node-main.js POST 원분기 | 7284183e49865ccd3d278013e30fb3ca5060aa4d691444ef5de5cf19e398eb14 |
| before.json 전체 | eb044aae3e7a8c389a57dcdf289a9d4c894be3e077e6130c8372c1a4124c9c83 |

검증기 SHA-256: `01c4a1dd71545f48e35d79db4cfcfb17854d42753a706d328743e8f9c3dedef0`.
결과·receipt 완료 UTC: 2026-10-01T16:30:32Z.
원문·함수SHA검사전후불변. tests.txt/evidence.json에 실제출력·20개클라이언트분기+2개서버단계 기록 보존. docs 전체검색 unload-save-boundary-doc-search.txt. docs 제안: 정상창닫기저장표에 동기클라이언트기록/네트워크API호출/ACK/서버write 경계를 별도표시하고 beforeunload의best-effort를 완료저장으로쓰지않는다. 공유docs수정0.
root가 현재Mac빌드와부하중복없이 실제사용분기/전송종료/서버ACK·파일검수 근거를확보한뒤 patch채택 여부판단. save-inflight 후보는 미통합 current원문을읽었으며 root QA경쟁검수와별개작업이다. 생산/공유test/이전산출/타팀/Git/queue/새세션/에이전트쓰기0. tab1573846373 입력/리로드/닫기/계측0. 새게임/브라우저/서버/설치/대형빌드실행0. 이한건후root인계만.
