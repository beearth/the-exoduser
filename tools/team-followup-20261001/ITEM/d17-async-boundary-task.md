# D17 비동기 경계 후보 수정 — 기존 ITEM 세션 전용

기준 원격 f965a15b65fa99729ca0c6ea1f9aeeabde7d9706. 기존 session 01a0f6e6-1fbe-7df0-8d02-a9c2d9df3750에서 한 번만 실행한다. 사용자 초안·진행/대기 지시·이전 후보/검사/증거는 보존한다.

확인된 결함: d17-lifecycle-roll-candidate.mjs의 wrapBoundary는 Promise pending 중 current()가 출처를 재등록하고, 늦은 finally(clear)가 후속 상태를 지울 수 있다. 이를 재현하고 ITEM 소유 새 d17-async-boundary-candidate.mjs 및 회귀 파일에서 수정한다. 기존 파일을 덮어쓰지 않는다.

- 겹치는 A/B 경계의 역순 resolve/reject, pending 중 생성/시전/등록, explicit clear 및 player/character/zones 교체 뒤 늦은 완료를 검수한다.
- 원함수 this/인수/반환값·예외·호출 횟수는 보존한다. 원 게임 동작 전체를 지연하지 않는다. pending 중 검토 효과·등록을 막는 등 가장 좁은 설계를 선택한다. Promise identity·thenable 부작용 등 보존 범위와 제한을 명확히 적고 검수한다.
- 기본 비활성/reviewOnly opt-in/runtimeReady=false. D17 저장 계약은 미채택. 생산 HTML/드롭/밸런스 변경0. 이전 28검사도 새 후보 대상으로 유지 회귀하되 이전 증거를 수정하지 않는다.
- 새 prefix 내 task/receipt/candidate/check/evidence/result와 ITEM_TEAM_MASTER 본인 추가 구역만 소유한다. 공용 총괄/CHANGELOG/Git 쓰기/새 세션/하위 에이전트/서버/게임/빌드 금지.
- 실제 Read/Edit/명령·실패 반례·수정 후 결과·관련 docs 검색·남은 게이트를 한국어로 기록한다. 원래 후보의 재현 실패와 새 후보 PASS를 분리한다. root가 독립 검수/백업한다.
