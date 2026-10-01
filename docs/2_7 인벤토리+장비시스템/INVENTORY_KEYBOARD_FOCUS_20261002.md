# 인벤토리 키보드 상세·소멸 초점 현행 SSOT

2026-10-02 UI-04 승인 생산 반영. 기본 시스템·필터·아이템 수치는 `2_7 인벤토리+장비시스템.md`, UI 구성은 `../3.1 ui hud 디자인/UI_COMPOSITION_20260925.md`를 따른다. 본 문서는 기존 마우스 hover 계약에 추가된 키보드 소유 상세·소멸 복귀의 현행 예외를 정의한다. 기본 문서의 혼합 CRLF/LF와 기존 내용은 byte 보존한다.

| id / 위치 | 본편·easy 공통 현행 계약 |
|---|---|
| _inventoryFocus | game.html/game-easy-test.html inline factory. 등록 item→현재 카드 Map, 카드→resolver WeakMap, keyboard item·anchor·외부 opener 보존 |
| 가방/장착 카드 | 기존 DIV에 tabIndex=0·role=button·data-inventory-detail-trigger=1·_T(item.name)의 aria-label 부여. 카드 resolve는 동일 item 생존을 확인하고 가방 index는 활성화 순간 다시 계산 |
| Enter / NumpadEnter | 카드 자체 keydown만 preventDefault, repeat는 활성화하지 않음. ctrl/meta/alt 입력 제외 |
| Space / Tab | Space keydown은 held 상태, keyup은 한 번만 상세 진입, blur는 held 취소. Tab은 preventDefault하지 않으며 전역 게임 keydown은 카드 네이티브 조작을 가로채지 않음 |
| _invRenderDetail 빈 bag/eq/st | 이전 _detailItem/_detailSource와 비교 클래스·행동·떠 있는 비교 제거. 상세 자식 replaceChildren와 KO “선택한 아이템이 없습니다.” / EN “Selected item is unavailable.” role=status 리프 사용. 상세/행동 또는 anchor 소유일 때 현재 카드→invClose 복귀, 외부 초점은 강탈하지 않음 |
| _invClearHover | keyboard item이 live resolver와 일치하고 현재 카드가 연결·가시이며 상세/행동에 초점이 있으면 상세 유지. 그 외 기존 선택 버튼 복원·preview 종료·visibility hidden 유지 |
| renderInv 재구성 | beforeRender는 실제 등록 카드의 item identity 또는 keyboard item과 active/owned를 보존하고 Map을 초기화. afterRender는 재등록된 현재 카드로 초점 복귀; 없거나 숨긴 대상은 invClose. 삭제 뒤 resolver=null이어도 삭제 전 identity를 잃지 않음 |
| CSS important 경계 | inline hidden/computed visible은 다를 수 있음. item이 현재 등록 Map에 없으면 같은 상세 active/computed visible을 근거로 복귀를 생략하지 않음. CSS 자체는 변경하지 않음 |
| 열기/닫기 | openPanel/togglePanel에서 invPanel 열기 전 외부 opener 포착. 중간 closeAllPanels는 opener 보존, 실제 closePanel/closeAllPanels는 연결·가시 opener로 복귀. 삭제/숨김 opener는 focus하지 않고 필요 시 내부 잔류 blur |
| 보호 | 저장 함수·INV 직렬화·장착/해제/분해 설계·필터·보호 전투·RNG·레이아웃/원화/CSS 변경 없음. production 이벤트의 기존 게임 데이터 액션은 그대로 유지하며 독립 host에서만 차단 |

## 구현·검수 단계

| 단계 | 증거 / 판정 |
|---|---|
| 승인 native 후보 | root outputs/team-review-20261002/mac-app/uiux-native-matrix.json: 양쪽×KO/EN×CSS off/on 8조합, 카드 상세→행동→hover 유지→재렌더 현재 카드→삭제 invClose→외부 opener. 독립 추출 renderer이며 전체 게임/레이아웃/패드 검수 아님 |
| 생산 적용 | 두 HTML 인벤토리 함수/이벤트 구역만 승인 card-removal-focus combined 후보와 정확 byte 일치로 반영 |
| 생산 회귀 | production-integration.test.mjs 23 PASS, 실제 반영 HTML factory·함수 재추출, before 반례 유지. CSS on은 visibility important 최소 Node 대역 |
| 보존 회귀 | 이전 후보21/18/12/18=69 PASS, before HTML 전용 fixture로 원 RED 유지. 인접 uiPanelInitialization/crystalPickerNavigation 9 PASS |
| 전체 inline 구문 | 각 HTML classic4는 vm.Script, module2는 node --input-type=module --check, importmap1은 JSON.parse. 실행/네트워크 import 없이 검사 |
| 남은 게이트 | 생산 전체게임·OS 키 이동·실화면/CSS 레이아웃·긴 비교·필터·유골함·저장 실전 부작용·물리 패드 UNKNOWN. UI-04 전체 완료가 아님 |

재현 명령과 byte 보존·SHA·의존성 목록은 `tools/team-followup-20261001/UIUX/production-integration-result.md` 및 전용 receipt/before/dependencies 기록을 따른다. Git checkpoint와 생산 실전 검수는 root 담당이다.
