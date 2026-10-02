# BALANCE — 공유 악의 순차 생산 인수 계획

이번 `shared-mats-production-acceptance-plan` 한 건의 산출은 `result.md`, `evidence.json`, `checks.mjs` 3파일이다. 생산·기존 test·원담당 산출·공용 docs·Git 인덱스를 수정하지 않았다. 총괄 소유 `task.md`도 보존했다. 기준 HEAD는 `96610b6546a31e882962470ea1f2164ce94edca6`이며 원격 동일성은 총괄의 배정 근거다. 이번 팀은 원격 조회·Git쓰기를 수행하지 않았다.

## 수신·읽기·실행·검수 구분

| 단계 | 실제 근거 | 상태 |
|---|---|---|
| 수신 | 총괄 직접 배정 메시지 및 최신 task.md | 수신 완료. 최초 메시지의 정확한 수신 시각은 제공되지 않아 추정하지 않음 |
| Read | task.md 전부, 기존 owner-dispatch 계약, AGENTS, BALANCE 팀 대장, 저장 SSOT, 준비 patch/후보/actual-file14/Terminal12 결과/기존 영구 테스트 | 완료 후 관측 시각 2026-10-02 12:44:10 KST. 과거 원세션 규칙 대신 최신 소유 규칙 적용 |
| 중복 확인 | 원 BALANCE 공식 마지막 턴은 `shared-mats-file` completed, 새 동일 과제 수신 근거 없음. 지정 폴더는 task.md만 존재 | 기존 세션·하위 에이전트·새 채팅 생성0 |
| 실행 | 지정 Node v24.15.0/darwin arm64, `node --check checks.mjs` 및 소유 checks.mjs | 최종 실행 12:46:54.495→12:46:54.647 KST, exit0 |
| 검수 | 소스 SHA·AST·메모리 patch 적용 경계·기존 결과 인수·오류 응답 source fixture | **19 PASS / 0 FAIL**. 기존 actual-file14 및 handler18을 실행·중복 제작하지 않았고 검사 수에 합산하지 않음 |
| 검수 도구 수정 이력 | 분리된 async route를 top-level로 파싱하여 await/return 문맥 검사 1건씩 실패 | 두 실행은 각각18 PASS/1 FAIL. 파서 옵션을 보완해 최종19 PASS. 최초 실패와 stack을 evidence.verificationHistory에 보존. 제품 결함으로 집계하지 않음 |
| docs 검색 | 코드 산출 뒤 docs 전체 관련 키워드 rg 검색 | 최종 실행 당시63매칭/22문서, 전체 출력 SHA·문서 목록은 evidence.docsSearch. 공용 docs 수정은 총괄 생산 인수와 동기화 |

실행 중 Changes는23→39→40→45였다. 이 수에는 타 팀 산출이 포함된다. 최종 문서 완료 뒤 개수·완료 시각은 evidence의 최종 관측을 따른다. 80 미만이며 타 작업을 정리하거나 커밋하지 않았다.

## 준비 patch의 byte·AST 인수

| source ID / 위치 | 현행 source SHA-256 | 기존 후보 SHA-256 | 실제 대조·경계 |
|---|---|---|---|
| `server.cjs` / POST `/api/mats` | `18cf9aa806d5715788f360debbc2a45c2574a76db952f101b524e2ff77fd517d` | `6caf90a73e7eaf313eba46a2808e7c9bceeb591cdccc86b17e33ac6f4a7a58ec` | 기존 helper/sequence 각각1. 준비 patch의 메모리 적용이 후보 byte와 동일. POST write 한 줄만 변경 |
| `node-main.js` / POST `/api/mats` | `01b0c1d51f77f500ee0a59185458bf0294edce12544482d6cf7abce4262c91ce` | `3b56932b93efabb15718394cd9116604aebcf12e60827bef5abd0d32080f218c` | readBody 뒤 helper/sequence 각각1 추가 및 POST write 한 줄 교체. 추가 구역과 POST를 제거하면 원문 전체 byte 동일 |
| 원담당 builder | `75cb158df4a54569603a4a9855369e72a45d7b135ca0bf07d071141e2b19da1b` | 원담당 파일 그대로 | 새 patch·builder 제작0 |
| 동일 sequence/helper | `3dc865c85002dcc58e2986d0bcbb069e47f6663d6c4c4ed5555370d7a1b5684a` | 양쪽 동일 | AST 선언 수·본문 SHA 일치. GET 원문 SHA도 보존 |

준비 패치는 `tools/team-followup-20261002/integration-review/server.cjs.shared-mats.patch`와 `node-main.js.shared-mats.patch`를 그대로 사용한다. patch SHA는 각각 `cb6ab97f899f1683d588e2d8ecf6809fbf40099ac4c1de49769fef742b86c7d1`, `6716d7710b4d835eb3ba5fafd40a67eef9590f12676b7e27d49bbe9bdf489a7b`다. 기존 apply-check status0는 준비 당시 기록이며 이번에는 현행 context의 **메모리 적용·SHA·AST**를 검수했다. 실제 apply0다.

actual-file14는 양쪽 현행 입력 SHA와 일치하고 신규/교체/반복·부분write/rename 주입실패·실제ENOENT·원문손상 RED 근거가 남아 있다. Terminal12 handler18은 현행 node-main source·기존 후보·patch SHA가 모두 일치한다. 두 결과는 서로 다른 검수 층이며 이번 팀의 19검사와 합쳐 실디스크/HTTP 통과 숫자를 만들지 않는다.

## source 계약표

| source ID | 한글명·수치/공식 | 적용 위치·슬롯 | 인수 상태·한계 |
|---|---|---|---|
| MATS-CLAMP | `n=Math.max(0,Math.min(Math.floor(+body.mats||0),Number.MAX_SAFE_INTEGER))`; 범위0~9007199254740991 | 양쪽 POST `/api/mats` | 현행·atomic 후보·오류응답 fixture 원식 유지 |
| MATS-SCHEMA | `{mats:n,ts:Date.now()}` | `_sharedMats.json`; 캐릭터 슬롯과 별도 | helper는2칸 pretty JSON이므로 성공 파일의 공백 byte는 바뀜. 필드·값·정상 응답 JSON은 동일. 실패 bytes 보존은 기존 주입 검사 범위 |
| MATS-GET | 정상 `d.mats||0`, 없음/읽기/JSON 실패는200 `{ok:true,mats:0}` | 양쪽 GET `/api/mats` | GET byte/SHA 불변. 새 보정·복구 정책 없음 |
| MATS-SLOTS | `_` 접두 JSON은 슬롯 목록에서 제외 | `/api/slots` | 기존 필터·캐릭터 `/api/save`/load/DELETE 무변경 |
| MATS-SYNC | `Math.max(_sharedMats,_savedMats)` 비가산 동기화 | 게임 클라이언트의 기존 저장/로드 | 경제식·합산·마이그레이션·shared pool 정책 무변경 |
| ATOMIC-TEMP | 같은 디렉터리 `file+'.tmp-'+pid+'-'+(++atomicSaveSequence)`; `wx`→fd write→close→rename | 동일 helper/sequence 각각1 | 성공 응답은 helper 반환 뒤. foreign temp 충돌은 소유권 획득 전이므로 삭제하지 않음. fsync/전원손실 보장 추가0 |
| MATS-ACK |200 `{ok:true,mats:n}` | rename 성공 뒤 sendJSON | 기존14/18은 콜백/모형 검수이며 실제 wire ACK 아님 |
| MATS-ERROR-CURRENT | node-main 파일·잘못된 JSON 오류는 handler Promise 거부; 성공 ACK0·HTTP 응답 end0 | node-main POST | Terminal12 전체 handler 근거와 이번 분기 재현 일치. 오류 응답 완료·프로세스 생존을 의미하지 않음 |
| MATS-ERROR-FIXTURE | 저장/본문 오류→500 `Content-Type:text/plain`, body `Internal Server Error`, end1 | node-main POST의 소유 메모리 source fixture만 | 현행 server outer catch의 상태/헤더/본문을 재사용하는 미채택 계획. 실제HTTP·소켓 미검수 |

## 기존 영구 테스트의 fd fakeFs 최소 보완 계획

`test/nodeMainMats.test.js`의 현행 fakeFs는 path 기반 writeFileSync만 구현한다. atomic 후보를 적용하면 openSync/closeSync/renameSync/unlinkSync 4개가 필요하다. `process.pid`도 고정 합성값을 제공한다. 기존 테스트는 이번에 수정·실행하지 않았다.

| 보완 항목 | 최소 동작·검수 기준 |
|---|---|
| fd map | `openSync(path,'wx')`는 기존 파일이면 EEXIST, 신규 temp만 만들고 숫자 fd를 반환. 파일 map과 fd map 분리 |
| writeFileSync | 숫자 fd는 열린 fd의 temp에 쓰기. **기존 path 인수 저장도 유지**하여 캐릭터 저장 fixture를 손상시키지 않음 |
| closeSync/renameSync | 닫힌 fd 제거, close 뒤 rename만 허용. rename은 temp를 대상에 교체하고 temp 제거 |
| unlinkSync·소유권 | helper가 소유한 temp만 정리. wx 충돌에서 타 소유 temp 보존. 단발 close 실패와 지속 close 실패를 같은 보장으로 취급하지 않음 |
| 기존 정상 assertion | mats42.9→42, 재조회42, 슬롯 목록 공유 파일 제외, 음수→0 및 기존 호출 구조 유지 |
| 인수 방식 | Terminal12의 검수된 fd map·exclusive/소유 정리 모형을 재사용. 새14/18 하니스 작성 없이 총괄이 기존 영구 fixture만 보완하고 실제 생산 source 회귀에 연결 |

현재 actual-file builder/Terminal12 검사는 **원문+준비 patch→후보**를 전제로 한다. 생산 반영 뒤 같은 검사에 patch를 다시 적용하면 안 된다. 총괄의 생산 검수는 적용된 helper/route 또는 전체 handler를 직접 추출해야 하며 원문 기대값은 과거 근거로 보존한다.

## 최소 오류응답 source fixture

저장 파일 훼손을 막는 atomic 교체와 정상 오류 응답 완료는 다른 계약이다. 이번에는 준비 atomic 후보의 node-main POST 분기만 메모리에서 다음처럼 구성했다. 별도 patch·전체 source 사본은 만들지 않았다. 정확 fragment/SHA는 evidence.errorResponseFixture에 있다.

```js
if (pathname === '/api/mats' && req.method === 'POST') {
  let n;
  try {
    const body = await readBody(req);
    n = Math.max(0, Math.min(Math.floor(+body.mats || 0), Number.MAX_SAFE_INTEGER));
    atomicSaveJSON(fs, MATS_FILE, { mats: n, ts: Date.now() }, process.pid);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    return res.end('Internal Server Error');
  }
  return sendJSON(res, 200, { ok: true, mats: n });
}
```

실제 readBody/sendJSON 원문과 이 branch를 async VM에서 실행했다. atomicSaveJSON 내부는 **호출/예외 대역**이며 fd/fs 작업을 반복 검수하지 않았다. open/write/close/rename 이름의 대역 예외 및 잘못된 JSON에서500/end1·성공200 없음, 정상42.9→42와 `{mats,ts}`/성공 응답 순서 동일을 확인했다. 성공 rename 이벤트는 대역이다. 성공 sendJSON을 try 밖에 두어 응답 transport 오류가 새500 재응답으로 바뀌지 않는 경계도 확인했다. 실제 socket 실패나 사용자 연결의 완료를 검증한 결과가 아니다.

Terminal12 기존18의 오류 assertion은 Promise 거부/end0을 기대한다. 오류응답 계획을 채택하면 해당 기대값을500/end1로 별도 갱신해야 한다. 기존18 PASS를 새 정책 통과로 재사용하면 안 된다. 모든 다른 route의 오류 정책 변경은 이번 계획 범위 밖이다.

## 총괄 순차 인수와 docs 동기화안

| 순서 | 담당 범위·Gate | 정확한 완료 기준 |
|---|---|---|
|1|총괄 파일/함수 소유권·실행 슬롯, 새 입력 SHA와 타팀 diff 확인|복구 checkpoint와 새 변경을 구분. 공유 인덱스·WIP·초안 보존 |
|2|기존 영구 test의 fd fakeFs 최소 보완 및 위 오류응답 정책 인수|정상 fixture를 유지하고 source 통합 뒤 필요한 검사/오류 기대값을 확정. 이번 팀 source fixture는 미적용 |
|3|server.cjs→node-main.js 준비 atomic patch 순차 적용|각 적용 후 helper/sequence1·GET/clamp/schema/slots 및 범위 밖 byte 확인. 기존 patch를 중복 적용하지 않음 |
|4|오류응답 계획을 채택한 경우 node-main POST만 별도 인수|기존18 기대값과 새500/end1 검수 구분. 생산 branch 실제 추출 및 정상 응답·실패 경계 확인 |
|5|code+관련 docs의 범위 한정 checkpoint·정확한 원격 ref 대조|이 팀3산출을 인수하되 공용인덱스 타팀 내용을 섞지 않음. 생산 적용 상태를 실제 적용 결과로 기록 |
|6|QA 지정 독립 runtime Gate|승인된 격리 저장에서 실제 ACK→bytes→종료→재시작→GET, 앱 및 대상OS 검수. source PASS와 구분 |

공용 docs는 이번 소유권 밖이므로 다음 문구를 **실제 생산 적용/검수 시점에** 총괄이 동기화한다. 미적용 계획을 구현 완료로 기록하지 않는다.

| 문서·수정 위치 | 정확한 동기화안 |
|---|---|
| `docs/15 세이브+데이터구조/15 세이브+데이터구조.md` 공유 악의 endpoint 표 및 말미 후보 검수 상태 | atomic 적용 시 `server.cjs/node-main.js POST /api/mats`가 기존 동일 helper를 통해 wx 임시파일→fd write→close→rename으로 저장하며 정상 `{mats,ts}`/clamp/GET/슬롯제외 불변임을 표에 추가. 공백2칸 차이·미검수 runtime/fsync/crash/동시writer/Windows 명시 |
| 같은 문서 전체 node-main handler 후보 회귀 보강 표 | 오류응답 채택 전 Promise 거부/end0 이력 보존. 채택 시 실제 생산 source 검수 근거와500 text/plain/end1을 새 행으로 추가하고 Terminal12 원18 기대값과 분리 |
| `docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md` 공유 악의 실제 파일 후보 인수 | 기존 memory16/actual-file14/handler18과 이번19 소스 계약 검수 구분. 적용 여부·HTTP/앱·지속close/unlink·fsync/crash/Windows/concurrency Gate를 실제 근거대로 갱신 |
| `docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md` §18 및 팀 상태표 | 새 관리팀의 plan 완료와 원 BALANCE 마지막 실제 완료/미전달 상태를 분리. 생산 담당/순서/검수/정확 원격 checkpoint 기록.11팀 전체 종료·동시가동 추정0 |
| `docs/CHANGELOG_SYNC.md` | 실제 생산 인수 때만 공유 POST atomic 교체와 채택한 오류응답 정책을 별도 항목으로 기록. 확정 경제식·보호2_3 문서 변경0 |

지속 close/unlink 실패의 fd/temp 정리, 실제 파일 장애, real HTTP/socket, fsync·전원손실·크래시·동시 writer·Windows·앱·재기동은 미검수다. 이번 결과는 **계획·source 계약 인수 완료 / 생산 적용0 / runtime 완료0**이다. 다음 후속 일감이나 세션을 생성하지 않고 총괄에 이3산출만 인계한다.
