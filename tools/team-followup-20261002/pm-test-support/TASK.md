# Terminal 12 — 총괄 검수 보조 배정

사용자가 2026-10-02 이 기존 빈 Codex 세션의 정체를 확인하고 작업을 배정하라고 지시했다. 세션 ID는 `01a0f734-acfd-7a13-be34-bb25aa35f9fd`이며 등록된 11팀의 대체 세션이나 새 제작팀이 아니다.

## 이번 한 건

공유 악의 저장의 준비된 atomic 후보를 대상으로 **실제 node-main 전체 요청 핸들러를 사용하는 회귀 검사**를 준비한다. 기존 `test/nodeMainMats.test.js`는 경로 기반 writeFileSync만 가진 fakeFs라 새 descriptor/rename 계약을 검사하지 못한다. 원본 테스트를 보존하고, 검수 보조의 별도 소유 경로에서 이 빈틈을 채운다.

| 항목 | 범위 |
|---|---|
| 작업 위치 | `/Users/fordeargamers/Projects/exoduser-migration-20261001` |
| 소유 파일 | `tools/team-followup-20261002/pm-test-support/` 아래 TASK.md를 제외한 새 테스트·결과·receipt와 `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PM-TEST-SUPPORT-20261002.md`만 |
| 읽기 입력 | AGENTS.md, 총괄 마스터·연속 진행·백업 정책, 저장 SSOT, `test/nodeMainMats.test.js`, 현행 `node-main.js`, `server.cjs`, `tools/team-followup-20261002/integration-review/node-main.js.shared-mats.patch`와 후보, BALANCE 후보·기존 검사 |
| 독립 경계 | 다른 지원 담당은 mortar 검토와 shared-mats 14그룹 독립 인수를 수행 중이다. 그 검사를 재작성하지 말고 전체 node-main handler의 descriptor/rename 흐름과 실패 뒤 응답 경계를 검사한다 |
| 생산 수정 | 0. game.html·game-easy-test.html·server.cjs·node-main.js·기존 test 파일·타 팀 폴더·총괄 대장·팀 상태 JSON 수정 금지 |
| 실행 | Node 전체 경로 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`; 작은 VM·합성 파일 검사만. HTTP 서버·게임·패키징·브라우저·에셋·인코딩·설치 0 |

1. 한국어로 수신 사실을 기록하고 원본 HEAD와 Changes 개수, 소유 입력 SHA를 확인한다. 수신·Read·실행·완료 시점을 구분해 receipt.json에 남긴다.
2. 준비된 후보가 현재 소스에서 해당 patch만 적용한 결과와 byte 단위로 같은지 검증한다. 후보를 VM에 넣고 HTTP createServer를 가로채 기존 handler 자체를 실행한다. 실제 atomic helper를 stub으로 대체하지 않는다.
3. fakeFs에 fd 기반 open/write/close/rename/unlink와 exclusive 생성·descriptor 수명 검사를 넣는다. `process.pid`도 명시한다. 정상 mats 값 절삭·음수·상한·재조회·슬롯 분리와 temp 정리·고유 이름·최종 파일 교체 후 ACK를 검사한다.
4. open/write/close/rename 실패를 각각 주입해 기존 shared-mats bytes와 슬롯 bytes 보존·성공 ACK 0·소유 temp 정리 여부를 확인한다. 원래 handler의 예외 처리 한계는 사실대로 기록하며 crash/fsync/concurrency/Windows 검수 완료를 주장하지 않는다.
5. 별도 소유 검사 파일과 JSON 결과·짧은 결과 MD를 작성한다. 관련 docs 키워드를 검색하고 소유 보고서에 현재 후보 미적용·검수 한계·생산 인수 조건을 테이블로 기록한다. 보조 작업에서 생산 채택하지 않는다.
6. 본인 파일만 생성·수정한다. 다른 에이전트가 함께 작업 중이므로 기존 편집을 되돌리거나 덮어쓰지 않는다. git add/commit/push와 공용 인덱스 조작은 총괄이 수행한다. 완료 후 결과 경로와 검사 수·실패·남은 한계를 한국어로 보고한다.
