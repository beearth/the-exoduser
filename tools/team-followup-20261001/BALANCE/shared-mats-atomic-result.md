# BALANCE 공유 악의 원자 교체 — 미적용 후보

수신/첫 Read UTC 2026-10-01T18:24:24Z. AGENTS/팀 MD/저장 SSOT의 공유 악의 표 및 양쪽 실제 GET/POST를 읽었다. 동일 prefix task만 존재하여 중복 없음; 기존 초안·타팀 변경 보존. 첫 코드 Edit UTC 18:25:14Z. 최종 회귀·문법검사 UTC 18:25:30Z exit0. 완료/root 인계 UTC 18:25:35Z.

## 원문 RED → 후보 16 PASS

server.cjs와 node-main.js의 실제 GET/POST 분기를 AST로 추출하고 원문을 vm에서 실행했다. 이전 `{mats:4567,ts:99}`, POST mats100, fs 대역이 8문자 기록 뒤 EIO를 던지는 입력에서 양쪽 원문 파일은 `{"mats":`로 손상되고 실제 원 GET은 `{ok:true,mats:0}`을 반환했다. 후보를 실제 실행한 동일 입력에서는 이전 bytes가 그대로 남고 GET은 `{ok:true,mats:4567}`이다. 입력/원결과/후보결과는 전용 evidence에 기록했다. 사용자 저장 사고를 확인한 것은 아니며 합성 실패 주입이다.

| 각 파일의 8검사 | 결과 |
|---|---|
| 원문 부분쓰기 뒤 GET0 | 손상 반례 재현 |
| 후보 write EIO / rename EIO | 이전 bytes 보존·성공 ACK 반환 없음·소유 temp 정리 |
| 신규 / 기존 정상 저장 | `{mats,ts}`와 `{ok:true,mats}` ACK 유지 |
| clamp 10입력 | 원문 floor/0/MAX_SAFE_INTEGER와 JSON schema 동일 |
| GET 없음/손상 | 기존 200 `{ok:true,mats:0}` 그대로 |
| 슬롯 목록 원식 | `_` 접두 공유 파일 제외 그대로 |

## 최소 후보·적용 경계

`shared-mats-atomic-integration.patch`는 **미적용**이다. server는 이미 검증된 생산 atomicSaveJSON을 재사용하여 POST의 write 한 줄만 교체한다. node-main은 server에서 추출한 동등 sequence/helper를 추가하고 공유 POST의 write 한 줄만 교체한다. 캐릭터 `/api/save`, GET, 경제 수치·경합/합산/동기화 정책은 바꾸지 않는다. 실행 가능한 전용 candidate builder와 test는 이 helper/실제 route를 사용한다.

원문 compact JSON 대신 helper의 2칸 pretty JSON을 쓰므로 성공 파일의 공백 bytes는 달라진다. 파싱한 `{mats,ts}` schema와 값/반환 JSON은 동일하며 실패 시 이전 파일 bytes는 정확히 보존한다. clamp 식은 `Math.max(0, Math.min(Math.floor(+body.mats || 0), Number.MAX_SAFE_INTEGER))` 그대로다. 고정 clock ts123456은 fixture이며 생산 Date.now 변경 없음.

성공 응답은 rename 성공 뒤만 실행된다. 예외는 기존 실패 경계로 전파한다. server outer catch는 500 text 응답이며 node-main에는 이 분기를 감싸는 동일 catch가 없어 async rejection 경계다. 이번 후보는 이를 새로 보장하거나 변경하지 않았다. 실제 HTTP 응답·프로세스 생존은 검수하지 않았고 메모리 콜백 성공 JSON을 네트워크 ACK로 과장하지 않는다. helper의 unlink/close 자체가 계속 실패하면 temp/descriptor 정리는 보장할 수 없다; 이전 실패 후보 결과의 한계를 유지한다.

## 고정 SHA-256

| 입력/산출 | SHA-256 |
|---|---|
| server.cjs 전후 동일 | 441bacbd8a5e0f7ae883e5c9a0a2e0368bf5190f50d2cb0246b89a4e6771bb6d |
| node-main.js 전후 동일 | 01b0c1d51f77f500ee0a59185458bf0294edce12544482d6cf7abce4262c91ce |
| sequence+helper 추출 | 3dc865c85002dcc58e2986d0bcbb069e47f6663d6c4c4ed5555370d7a1b5684a |
| 후보 builder | 75cb158df4a54569603a4a9855369e72a45d7b135ca0bf07d071141e2b19da1b |
| 최종 검사 | 17ffaff899167d8ed312a1ad9b8571369915110ef346f4609bde6fc3f4fb5d5b |

GET/POST 개별 SHA는 `shared-mats-atomic-evidence.json`에 기록했다. 최종 검수 명령: `node tools/team-followup-20261001/BALANCE/shared-mats-atomic-test.mjs` 및 두 mjs node --check. 설치된 acorn과 node:fs/vm/assert/strict/crypto 및 전용 candidate import만 사용했다. 전체 서버 import/실행0.

합성 메모리 fs만 사용했으며 실제 OS 오류를 재현한 검사가 아니다. EIO는 주입 오류다. 실제 디스크/HTTP/fsync/크래시/Windows/동시 프로세스 저장은 미검수, 이전 EPERM 통합 gate 미완료 유지. 서버/포트/네트워크/앱/브라우저/사용자 세이브/게임/빌드/Git/권한변경/새 세션/에이전트0. docs 전체 검색은 `shared-mats-atomic-doc-search.txt`에 보존했다. 공용 docs 직접수정0; root 통합 시 SSOT에 공유 POST 원자교체 적용 상태와 미검수 한계를 기록하도록 제안한다. 이번 한 건 후 root에 인계한다.
