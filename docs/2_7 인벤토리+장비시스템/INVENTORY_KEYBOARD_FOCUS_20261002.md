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


## 2026-10-02 필터 버튼 재생성 초점 반영

본편/easy의 mkF 버튼은 key/value dataset을 가진다. beforeRender는 실제 활성 필터 identity도 저장하고 afterRender는 동일한 새 네이티브 버튼으로 복귀한다. 결과0/선택카드 제외/필터 해제도 동일하다. 숨김·비활성·누락이면 invClose, 패널이 닫혔거나 외부 초점이면 강탈하지 않는다. 필터 조건/데이터·유골함 탭·CSS는 그대로다.

생산 전체가 filter-focus 후보와 byte 일치한다. 현재 source/composition 기반32 + 인접23=55그룹 PASS와 전체 inline 구문 확인. 이전 production-integration byte 일치 표는 이전 반영 이력이다. 현재 재현은 root-review/filter-integration.mjs --production 및 filter-adjacent.mjs를 사용한다. 기존32 RED와 owner19파일 보존. 실제 OS 버튼 입력/패드/유골함 세부 renderOssPanel·레이아웃은 미검수. [상세 인수](../0마스터플랜/mac-resume-20261001/vscode-dispatch/FILTER-INTEGRATION-20261002.md).

### 2026-10-02 유골함 행동 비활성화 초점 생산 반영

양쪽 HTML의 focus factory에 releaseOssuaryAction을 추가하고 renderOssPanel 시작의 활성요소 포착 및 take/remove 갱신 뒤 호출만 반영했다. 선택 유골·유골함 해제로 활성 행동이 disabled가 되면 invClose로 이동하고, 숨긴 닫기로 복귀할 수 없으면 내부 disabled 잔류만 blur한다. 외부/다른 활성 컨트롤 초점은 강탈하지 않는다. 저장·유골 생성/등록/해제·장착·경제·RNG·CSS/ui-panels 원문은 보존했다.

현재 생산 실제 함수/조합 검수34+기존filter32=66그룹 PASS, 전체 inline12개/importmap2 구문 통과. 유골함34는 renderOssPanel 원문을 실행했고 filter32의 renderOssPanel 대역 한계를 분리한다. 실제 키보드·패드·픽셀·전체게임·실저장은 미검수로 UI-04 전체 완료가 아니다. 과거 filter-only exact-byte 표는 이력이며 현재는 connectOssuary(connectFilter(original))와 정확 일치. root-review/four-candidate-acceptance.mjs ui --production 및 four-filter-adjacent.mjs --production으로 재현한다.

2026-10-02 독립 후속 인수 완료: UIUX 현행 factory/renderOssPanel과 승인 후보 byte 일치, 보호 저장10함수 SHA 동일, 담당 독립15 PASS를 root가 하니스·원자료로 검토했다. 기존 root34+32와 구분하며 생산 추가 수정0·native/패드/레이아웃 미검수다. BUILD 후속13도 완료했고 네 Codex 팀 모두 현재 배정의 실제 Read·완료를 확인했다. 다른7팀은 전달0/Read0 보류다. GitHub 601a0574 체크포인트 SHA를 재확인했으며 이 최종 기록의 원격 확인은 다음 checkpoint로 수행한다.


## 2026-10-02 필터 카드 Y 장착 identity 보충

| 경로 | 현행 계약 |
|---|---|
| 가방 카드 생성 | 양판 실제 가방 인덱스 `i`를 `dataset.inventoryBagIndex`의 문자열로 보관한다(`data-inventory-bag-index`) |
| global `KeyY` | `_jfIdx`는 가방 인덱스다. 현재 `_xi` 카드 목록에서 같은 dataset 값을 찾은 경우에만 우클릭 이벤트를 전달한다. 필터된 visible 순번과 가방 인덱스를 혼용하지 않으며 숨겨진 selection/대응 카드 누락은 전달0 |
| 보존 범위 | 기존 hover/selection, Enter/Space, 초점 복구, Ctrl prefix 거절, GPB 경로·장착/경제/저장 정책은 변경하지 않았다. 전체 초점/물리 입력 수락을 뜻하지 않는다 |

최종 source24/24(18시나리오+정상대조6), 별도 baseline14PASS/10FAIL 및 구문JS12/JSON2 1회 PASS는 이번 Y 경로의 인수다. 위55/66/독립15는 각 이전 초점 인수 이력으로 더하지 않는다. `renderInv`는 실제 가방 카드 loop 부분, R은 selection 부분이며 DOM/MouseEvent·detail/focus·stat/SFX/save/lesson은 대역이다. 전체 renderer/실게임/native/패드/실저장은 UNKNOWN. [장착 identity 인수 보고서](INVENTORY_FILTERED_EQUIP_IDENTITY_20261002.md).
