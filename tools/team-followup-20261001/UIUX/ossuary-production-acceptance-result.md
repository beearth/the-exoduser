# 유골함 초점 생산 통합 독립 인수

## 결과
**15 PASS / 0 FAIL**. 기존34 검사 전체를 복제/재준비하거나 원증거를 덮지 않고, 현재 생산 factory/renderOssPanel을 직접 추출한 최소 하니스로 독립 인수했다. 생산 수정0, 후보 추가 수정0.

| 대조 | 판정 |
|---|---|
| 두 HTML 전체 byte | 보존된 ossuary before에 승인 connectOssuary를 적용한 결과와 정확 일치. root ui/filter 인수 JSON의 현재 SHA와도 일치 |
| factory / renderOssPanel | 양쪽 factory SHA 동일 d29c0d8a9cdfac122a1f65d272d24fc75c2be0ea35b02d47468f9c5c0a6261b5. 각 renderOssPanel은 후보 원문과 정확 일치 |
| 변경 구역 | 기존 factory에 releaseOssuaryAction 추가, renderOssPanel의 이전 active 포착 및 take/remove 상태 갱신 뒤 호출만 변경. current renderInv/hover/닫기·유골 생성/등록/해제·장착 원문은 유골함 before와 동일 |
| 보호 저장 함수 | dbSaveNow / _drainPendingSaveNow / dbSaveForce / _saveSharedMats / saveSettings: 양쪽 10개 함수 SHA가 before/candidate/current 모두 동일. 함수 실행·저장0 |
| disabled 이전활성 | 양쪽×KO/EN×retain/blur 모델×take/remove 16경계에서 실제 current renderOssPanel이 invClose로 복귀, actual closePanel은 opener 복귀 |
| 안전 경계 | 숨긴 닫기 focus0·내부 disabled 잔류 blur, 외부/다른 활성 컨트롤 강탈0, 닫힌 패널 복귀 호출0 |
| 필터 유지 | current renderInv의 정확 mkF block과 current factory token/복귀를 연결해 같은 key/value 새 버튼·aria-pressed·반복 해제 유지. 전체 renderInv/필터 조건 재검사를 복제한 것은 아님 |
| 자료 보존 | 기존 UIUX318개 파일, root 인수 JSON2개, ui-panels/CSS/현행 SSOT 및 두 생산 파일을 최종 SHA 재대조. 타팀/stage/초안/세이브를 되돌리지 않음 |

현재 전체 SHA: game.html `30ae8544524d7cd710383ebd10f4911bea3247e90b18a46c51c253e73ce9ba3f`, game-easy-test.html `9c7c25c131f6175a464cffe2e981e946cf2a0af70ed04b969cc5292403799af8`. 함수30개/factory2개·1-based 줄·원자료 SHA는 ossuary-production-acceptance-read.json에 기록했다. 최초 Read manifest는 재실행 시 덮어쓰지 않고 동일성 검사한다.

## 실제 기록·재현
- 첫 Read/명령 2026-10-01T18:49:30Z: 담당 MD·AGENTS·root 인수 JSON·현행 SSOT. 동일 prefix에는 task.md만 있어 수신/진행/대기 중복 없음.
- 첫 코드 Edit 2026-10-01T18:51:14Z: harness.mjs birthtime UTC/apply_patch. 검사/완료 실제 UTC와 count는 receipt에 기록한다.
- 재현: `node --test tools/team-followup-20261001/UIUX/ossuary-production-acceptance.test.mjs`. 출력은 이 prefix read/evidence/validation에만 기록한다. 서버 전체 import/listen/HTTP/포트 탐색 없음.
- 로컬 import: 새 harness/test, 기존 inventory-dom/node-dom.mjs, inventory-dom-candidate.mjs→inventory-focus-candidate.mjs, filter-focus-candidate.mjs, ossuary-focus-candidate.mjs. 추가 Read: 기존 ossuary-focus-main/easy.before.html, root JSON2개, current HTML2개·ui-panels.js·CSS·SSOT 및 기존 파일 보존 SHA 목록. 기존 ossuary-focus-fixture/test/prepare는 import/실행하지 않음.
- count 시작38·중간71, 완료는 receipt 참조. 공유 checkout의 다른 담당 증가를 임의 정리하지 않는다. 80 도달 시 root checkpoint 필요, 100 이전 정리 책임은 root에 인계하며 담당 Git쓰기0 유지.

## 한계·후속 QA
핵심 renderOssPanel은 실제 원문 실행이며 no-op이 아니다. 이번 최소 하니스는 합성 record/장착 상태를 직접 바꿔 current 렌더의 초점 후조건만 확인한다. 실제 경제/등록/해제 호출 전체를 재실행하지 않았고 그 경로는 root34 원자료와 구분한다. portrait/image loading·비관련 표현은 실행하지 않으며 Node 요소 속성 src만 기록한다. filter block은 current source지만 전체 renderInv 조건·카드/전대 전환·CSS layout을 이번 15검사로 인수하지 않는다.

retain/blur는 Node 비활성화 두 모델이다. native OS 키·Tab/Enter/Space·패드·픽셀·전체게임·실저장·앱은 **미검수/QA 독점**. 기존 root66그룹과 이번15그룹을 실화면 품질 PASS로 확대하지 않는다. QA에서 격리 합성 슬롯으로 유골/유골함 해제 후 닫기→외부 opener, 숨긴 닫기, 외부 초점, 필터 재활성화를 실제 입력/가시성으로 대조해야 한다.

docs 전체 관련 검색 21문서를 확인했다. 현행 SSOT의 “생산 반영/Node66·native 미검수”와 일치하며 공유 docs 변경 없음. 이번 독립15 결과와 SHA를 현행 생산 인수 근거에 추가하는 반영안만 root에 전달한다.

생산·공유SSOT·Git·권한 쓰기0. UI/브라우저/게임/앱·서버/listen/HTTP/포트·빌드·새팀/세션/에이전트 실행0. 이 한 건을 인계하고 추가 범위는 시작하지 않는다.
