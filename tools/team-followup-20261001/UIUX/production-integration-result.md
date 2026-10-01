# UIUX 생산 반영 인계 / HTML 소유권 반환

## 적용 결과
승인된 card-removal-focus 합본을 game.html·game-easy-test.html의 인벤토리 함수/이벤트 구역에 반영했다. 두 파일은 before 소스에 승인 connectRemoval을 적용한 결과와 **전체 byte 일치**한다. 원본 전체 HTML을 production-integration-fixtures에 먼저 보존했다. 저장·장착/해제/분해 함수·레이아웃·CSS·데이터 수치·RNG·전투는 변경하지 않았다. _inventoryFocus factory, 빈 상세 정리, 카드 bind, hover 소유 상세 유지, renderInv token/복귀, invPanel 생명주기 및 해당 카드 전역 keydown 예외만 승인대로 적용했다.

root 복구 HEAD는 35ddea9d41ecf776e4ddf781566d3ff5dad53017와 일치했다. 시작 시 양쪽 HTML clean·공유 index diff 없음. 기존 전체 WIP/미추적 항목은 456개였고 임의 정리하지 않았다. root의 원격 대조 완료를 인수했으며 이 작업에서는 원격 조회/백업/Git 쓰기를 수행하지 않았다. 기존 후보·검사·증거·공유 CSS·참조 PNG·root native 자료 256개 SHA를 인계 직전 재대조한다.

작업 중 공유 HEAD가 375aa9e4944fe7fa54fb0404493045e6a3a1d982로 변경됐고 index SHA도 변화를 관측했다. 담당 Git 쓰기는 0이며 변경 원인은 이 작업에서 확정하지 않았다. 최종 cached name 목록은 빈 상태였다. 승인 생산 byte·원파일256개 SHA는 이 변화 뒤에도 다시 일치 확인했다. 타 작업을 되돌리거나 index를 수정하지 않았다. 최종 전체 변경 수473개는 기존 공용 누적을 포함하므로 root가 별도 관리한다.

| 실제 기록 | UTC / 근거 |
|---|---|
| 수신 | 사용자 승인 메시지 UTC 미제공, 첫 Read 이전 수신 |
| 첫 Read/명령 | 2026-10-01T16:54:58Z / 담당 MD |
| 첫 코드 Edit | 2026-10-01T16:56:10Z / prepare.mjs birthtime UTC |
| 생산 Edit 확인 | 2026-10-01T16:56:18Z / 양쪽 승인 byte 일치 확인 |
| 최종 검사/완료 | 전용 receipt/final-hashes의 실제 UTC |

## 검사
| 검사 | 결과 / 경계 |
|---|---|
| 생산 추출 신규 | 23 PASS. 실제 적용 HTML에서 factory와 호출 함수를 재추출, 정상/빈 bag·eq·st·카드 소멸·재렌더·hover·Enter/Space/Tab 계약·수정키/반복·장착 카드 소멸·실제 openPanel/togglePanel/closeAllPanels/closePanel 복귀 검사 |
| 원 before 회귀 | inventory-focus21 + inventory-dom18 + native-focus12 + card-removal-focus18 = 69 PASS. 원검사 파일/기존 RED 기대값 byte 보존 |
| 인접 현행 | uiPanelInitialization3 + crystalPickerNavigation6 = 9 PASS |
| 총계 | **101 PASS / 0 FAIL**. CSS on은 Node visibility important 최소 대역이며 실제 CSS 렌더링 검수 아님 |
| 모든 inline 구문 | 각 HTML classic4(vm.Script) + module2(node --input-type=module --check) + importmap1(JSON.parse). 구문만 검사, import·게임 실행 없음 |
| root 기존 native | outputs/team-review-20261002/mac-app/uiux-native-matrix.json 양쪽×KO/EN×CSS off/on 8조합 인수. 독립 native 추출 renderer의 증거이며 생산 전체게임 인수와 구분 |
| 보존·차이 | 승인 전체 byte 대조, 기존256개 SHA, 저장/장착/해제/분해 함수 원문 동일, git diff --check 통과 |

생산 적용 전 원 before HTML은 전용 fixture에 보존했다. 기존 검사를 production-integration-legacy.test.mjs로 실행하면 HTML Read만 해당 fixture로 전환하며, 증거 출력도 전용 fixture 경로로만 전환한다. inventory-dom 검사의 오래된 전체 SHA는 AI 저장 한 줄 이전 기준이므로 **그 suite만** 읽기 대역에서 sourceHashes를 승인 before fixture SHA로 재기반한다. 함수 19개 원문/SHA의 동일성을 준비 단계에 먼저 강제했고 원 provenance 파일 및 함수 RED/GREEN 기대값은 변경하지 않았다. 다른 suite의 provenance/byte 보존 검사는 원파일 그대로 읽는다. 이전 검사 파일을 직접 실행하는 대신 아래 before 전용 wrapper로 재현해야 한다.

## 재실행·의존성
```
node --test tools/team-followup-20261001/UIUX/production-integration.test.mjs
UIUX_LEGACY_SUITE=inventory-focus node --test tools/team-followup-20261001/UIUX/production-integration-legacy.test.mjs
UIUX_LEGACY_SUITE=inventory-dom node --test tools/team-followup-20261001/UIUX/production-integration-legacy.test.mjs
UIUX_LEGACY_SUITE=native-focus node --test tools/team-followup-20261001/UIUX/production-integration-legacy.test.mjs
UIUX_LEGACY_SUITE=card-removal-focus node --test tools/team-followup-20261001/UIUX/production-integration-legacy.test.mjs
node --test test/uiPanelInitialization.test.js test/crystalPickerNavigation.test.js
```
prepare.mjs는 적용 전 한 번만 사용했고 중복 생성은 거부한다. 새 before를 덮어쓰거나 원 후보 generator를 생산에 재적용하지 않는다. 새 도구의 로컬 import와 Read fixture 목록은 production-integration-dependencies.json에 분리 기록한다. 전용 변경 목록/최종 SHA는 production-integration-final-hashes.json 참조.

## docs·남은 게이트
docs 전체 관련 검색을 production-integration-doc-matches.txt에 남겼다. UI_UX_IMPROVEMENT_PROJECT_20260930의 UI-04는 부분 완료로 갱신하고 UI_COMPOSITION에 현행 함수/입력/복귀 계약을 기록했다. 인벤토리의 현행 세부 SSOT는 INVENTORY_KEYBOARD_FOCUS_20261002.md를 추가해 두 UIUX 문서에서 참조한다. 기존 기본 인벤토리 문서는 혼합 CRLF/LF를 포함하므로 byte 보존하여 불필요한 전체 정규화를 피했다. 과거 “당시 생산 미반영” 이력과 현재 적용 상태를 구분했다. 공용 총괄 문서·CHANGELOG는 수정하지 않았다.

Mac 잠금 상태에서 UI 도구·브라우저·게임·서버·빌드·인코딩은 실행하지 않았다. 생산 전체게임에서 OS 실제 입력/닫기 복귀·긴 상세/비교·필터/유골함·CSS 레이아웃·저장 실전 부작용·물리 패드·투자용 빌드 전체 품질은 **UNKNOWN / root 후속 게이트**다. 후보 native8조합 또는 Node101검사를 전체 UI-04 시각/패드 PASS로 주장하지 않는다.

**두 HTML 인벤토리 단독 소유권을 root에 반환한다.** 인계 후 추가 HTML 편집 및 다음 범위 착수 없음. Git add/commit/push·원격 checkpoint와 생산 실전 검수는 root 담당이다.
