# QA 연속 후속 — bootstrap descriptor rollback 실패 한 경계

## 시작·소유 경계

- 실제 cwd: `/Users/fordeargamers/Projects/exoduser-migration-20261001`.
- 먼저 읽을 COMMON: `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md`.
- 이 TASK: `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/QA/TASK.md`. 기존 Claude QA 세션에서 수행한다. 확인된 sessionId/수신 시각만 기록하고 추정하지 않는다.
- 쓰기 소유는 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/QA/result.md`, `evidence.json` 두 파일. 아래 신규 NodeVM 경계의 실제 검증이 필요할 때 같은 폴더 `checks.mjs` 한 파일만 추가한다. COMMON/TASK는 읽기 전용이다.
- 다른 담당과 공유 중이다. 생산·API 원본·기존test/완료산출/이전TASK·공유docs·Git/index·사용자 저장·타인WIP 변경/되돌리기0. **소유 밖 파일/폴더 쓰기·삭제·이동·cleanup·오경로 삭제복구0**을 재강조한다. 잘못된 경로를 발견하면 그대로 보고한다.
- 실제 브라우저/CUA/evaluate·CSP 주입·UI·서버·게임·빌드·설치·새session/하위팀/다른팀 메시지0. 실브라우저/게임 QA 슬롯은 release되지 않았다. source 검증 완료를 슬롯 release로 해석하지 않는다.
- 총괄 제공 기준 commit `7e69495046323b3120578f67635c20feb48b2a4f`와 실제 source SHA를 구분한다. Git 명령0이므로 독립 현재 HEAD 확인을 선언하지 않는다.

## 정본·완료 근거

`AGENTS.md`, 현재 총괄 담당표, `docs/7아이템디자인/ITEM_TEAM_MASTER.md` 검토 bootstrap/host 계약과 `docs/12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md` QA 제한을 먼저 읽는다. 실제 대상은 `tools/team-followup-20261001/ITEM/browser-bootstrap-api.js`의 `installD10Review`, descriptor `same`, `restore`, catch/finally와 controller다. 기존 `claude-native-6/QA/result.md`·`evidence.json`·checks source 및 provider QA 관측 계약은 읽기만 한다.

기존6 descriptor 그룹은 fresh/data/accessor 복원·다른 value 교체·close 멱등·정상 rollback을 이미 검수했다. 이전6/16검사를 반복/합산하거나 이전 writer를 실행하지 않는다. 기존 API·host·reviewPort source 수정0이다.

## 신규 한 계약: 복원 불가능할 때의 보존·실패 보고

기존6의 정상 rollback과 구분하여 **rollback 실패**를 핵심 새 입력으로 삼는다. 기존 nonconfigurable property의 선행 거부와 같은 port value의 descriptor flag 변경은 이 계약의 최소 음성 대조로 좁게 확인한다. 여러 bootstrap 기능을 독립적으로 새로 만드는 과제가 아니다.

| 경계 | 실제 source에서 관찰할 내용 |
|---|---|
| 원 nonconfigurable property | `original.configurable===false`의 거부가 factory/RNG/host 교체 전에 일어나는지. 원 descriptor6필드 및 value/get/set 참조 보존, 생성 호출0 |
| 설치 뒤 descriptor 변경 | value가 같은 포트여도 writable/enumerable/configurable 중 필요한 flag가 달라지면 `same`/소유권이 어떻게 판정되는지. 이전 CE-FOR의 다른 value 입력을 반복하지 않는다. 외부 변경을 원값으로 덮어쓰지 않는 결과를 확인 |
| rollback 실패 | 늦은 설치 실패 뒤 실제 catch의 restore가 실패하는 최소 합성 host. 필요한 경우 명시적인 제한 Proxy trap으로 delete/defineProperty 실패만 주입한다. 실제 descriptor 관측 API·설치/rollback 본문은 원문이며 trap은 대역임을 표시한다 |
| 오류/후속 상태 | `AggregateError` 발생 가능 경로라면 errors의 원 설치 실패와 rollback 실패를 분리 기록. descriptor가 이미 외부 변경되어 restore를 건너뛴 경로와 혼동하지 않는다. pending/active/installation 소유권의 외부 관찰 가능한 후속 호출 결과를 최소한으로 확인 |

합성 host에만 설치/변경한다. 실제 window/index host의 property를 쓰거나 삭제하지 않는다. 임의 Proxy 보안/완전한 realm 감사로 확대하지 않는다. 각 관찰은 harness realm의 실제 `Object.getOwnPropertyDescriptor`로 value/get/set/writable/enumerable/configurable을 비교하고 getter 실행/의존 호출 수를 구분한다. 실패 뒤 원 property 복원을 보장할 수 없으면 `UNKNOWN` 또는 실제 잔존 상태를 보고하며 PASS로 정리하지 않는다.

NodeVM에는 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`를 사용한다. 기존 VM module 방법을 읽고 필요한 Node flag·source SHA·합성 의존을 evidence에 기록한다. 필요한 신규 검사만 만들며 API patch가 필요하면 메모리 후보로만 비교하고 원본 source 실패/정상 대조를 구분한다. 생산 채택0이다.

## 보고·한계·다음 Gate

코드/fixture 뒤 docs 전체 `browser-bootstrap-api|_d10PersistenceReviewPort|nonconfigurable|descriptor|rollback|AggregateError|foreign-preserved` rg 검색 후 ITEM/QA canonical에 넣을 정확한 문안을 result에 인계한다. 공유docs·보호2_3 수정0. evidence는 taskId/Claude/확인 sessionId·UTC/KST·실제 Read·명령/exit·소유3파일 이내·source SHA·대역/실제·실패 원인을 기록하며 thinking/인증/개인 user 원문0이다.

한국어로 기존6과 다른 새 경계·최소 검증·복원 실패 한계·생산 미적용/실브라우저 미검수를 보고한다. 다음 Gate는 총괄의 source 계약 인수와 명시적인 QA 단독 슬롯 release이며 이번 담당이 해제하거나 실행하지 않는다. 완료 이후 같은 검사 반복·자동 범위 확대0이다.
