# UIUX-20261002-INVENTORY-DOM — 한 건 인계

## 판정

기존 후보의 **키보드 상세 초점 수명주기와 renderInv/hover 종료 연결 누락**을 실제 함수 연결에서 재현하고 파생 후보로 보강했다. 신규 연결 회귀18 PASS / 기존 inventory-focus21 PASS / 기존 공통9 PASS. **브라우저 native DOM·실화면·패드 판정은 UNKNOWN**이며 root 인수 게이트로 남긴다. 생산·원 inventory-focus·공유 docs·타팀 쓰기0, 사용자 Chrome 입력/리로드/닫기/계측0, 게임/서버/설치/빌드/Git/queue/새세션/에이전트0.

UI-04 대기·인벤토리 상세/비교/종료 SSOT·UI_COMPOSITION 초기화/필터/기존 정렬닫기 완료·AGENTS DOM 리프/부모 보존 계약을 먼저 읽었다. 기존21 fixture를 새로 구현하지 않고 기존 후보 factory/호출 변환을 **읽기 전용 import**했다. 이번 소유 prefix에는 지시서만 있었으므로 중복 구현은 없었다.

## 실제 연결 RED→GREEN

실제 전체 `renderInv`, `_invRenderDetail`, `_invPlaceDetail`, `_invPlacement`/Changed, `_invCategoryMatches`, `_invRestoreSelectedActions`, `_invClearHover`, `closePanel`을 디스크에서 추출했다. 본편은 `_invRenderEmptyDetail`도 포함한다. 호스트 데이터는 두 게임·원 후보/파생 후보의 **함수 묶음**뿐이며 전체 게임을 로드하거나 실행하지 않는다.

| 입력/실제 호출 | 원 inventory-focus | 파생 후보 |
|---|---|---|
| renderInv→생성 카드 Enter→실제 재구성→카드 mouseleave | 이전 anchor가 실제 제거됨. 상세에 초점 후 `_invClearHover`가 inline visibility=hidden 기록 | 키보드가 소유한 연결 아이템 상세/행동 초점이면 hover 종료의 복원·숨김을 건너뜀 |
| 상세에서 행동 버튼 초점→실제 renderInv | 행동 버튼이 제거되며 Node 연결 대역의 초점 BODY로 유실 | 같은 item identity의 새로 연결된 카드로 복귀 |
| 행동 버튼 초점→fixture bag=[]→실제 renderInv | 초점 BODY 유실 | invClose로 복귀, 비교 클래스 제거 |
| 장착 상세→fixture equipped={}→실제 renderInv | 기존 생명주기와 동일 제거 위험 | invClose 복귀 |
| 재렌더 전 bag 소멸→실제 hover 종료 | 낡은 resolver/anchor 상태 위험 | 현재 resolver를 재확인하여 숨긴 상세에 초점 남기지 않고 invClose 복귀 |

KO/EN×본편/easy의 원후보/파생 대조를 `inventory-dom-evidence.json`에 기록했다. 재현의 RED는 올바른 기대(가시 상세/연결 카드)에 대한 원후보 실패이고, 테스트 자체는 그 원결함을 명시적으로 검출한 후 파생 GREEN을 대조한다.

**중요 CSS 한계:** production `inventory-space.css:115`에는 장비 탭 invRight의 `visibility:visible!important`가 있다. 따라서 원 `_invClearHover`의 inline hidden만으로 실제 장비 화면이 숨겨졌다고 단정하지 않는다. 이번 확정 재현은 소스의 숨김 선언과 **실제 renderInv가 행동 버튼/anchor를 제거했을 때 연결 대역의 초점 유실**이다. 실제 computed visibility·OS 초점·다른 탭·production CSS 조합은 root가 검수한다. 독립 host는 생산 CSS를 복제하거나 새 레이아웃을 제안하지 않는다.

## 최소 호출부 수정

`inventory-dom-candidate.mjs`는 원 factory를 문자열 문맥 대조로 파생한다. 원 파일은 수정하지 않는다. 파생된 동작:

- bind마다 item identity→현재 카드와 WeakMap resolver를 연결. renderInv 시작에서 소유 초점을 기록하고 옛 카드 목록을 비움.
- 실제 renderInv의 일반 종료 및 본편 crystal 조기 종료에서 afterRender. 제거된 행동 초점만 같은 item의 현재 카드→invClose 순으로 복구. 무관한 초점은 강탈하지 않음.
- 실제 `_invClearHover` 첫 줄에 keepsDetail guard. 가시·연결·현재 resolver·열린 패널·키보드 상세/행동 소유를 모두 만족할 때만 기존 숨김을 건너뜀. 마우스-only 종료는 기존 동작 유지.
- focus 적격성에 실제 computed visibility/display 확인을 추가하여 숨긴 노드를 대상으로 삼지 않음. 닫기/열기 opener·Space keyup/Enter keydown 1회·수정키/반복 차단·Tab 비차단은 원 후보에서 보존.

새 부모 textContent/innerHTML 전체교체0. 새 액션/장착/분해/저장/수치/전투/필터 설계0. 실제 기존 renderInv 내부 DOM 교체는 원식을 그대로 실행한 것이며 이번에 전면 개편하지 않았다. 해제/삭제 테스트는 fixture 배열 변화 후 실제 렌더를 호출하며 실제 장착·분해·세이브 함수를 실행하지 않는다.

| 산출물 | 사용 방법 |
|---|---|
| inventory-dom-main-minimal.patch / easy-minimal.patch | **원 inventory-focus 연결 후보 위에만** 적용하는 추가 delta. 생산 원본에 단독 적용하지 않음 |
| inventory-dom-main-combined.patch / easy-combined.patch | 현재 생산 bytes→원 후보+이번 delta의 미적용 합본. root가 승인된 인벤토리 구역만 순차 인수할 때 참고 |
| inventory-dom/source-data.mjs | 실제 원 함수의 추출본, 원소스 SHA·함수별 1-based 줄번호·SHA 포함 |
| inventory-dom/harness.mjs | 같은 함수 묶음을 Node 연결 대역 또는 실제 browser document에서 실행하는 독립 host |
| inventory-dom/host.html | root용 DOM-only host. 생성해 두었고 **열지 않았다** |

## 재실행·기존 검사 보존

`node tools/team-followup-20261001/UIUX/inventory-dom-generate.mjs`

`node --test tools/team-followup-20261001/UIUX/inventory-dom.test.mjs` — 18 PASS. 전체 실제 renderInv 연결, KO/EN, 원후보/파생, 제거된 anchor/행동·숨긴 카드·삭제·해제·opener·키 계약. 이 실행은 Node DOM 연결 대역이지 native DOM 실행이 아니다.

`node --test tools/team-followup-20261001/UIUX/inventory-dom-existing.test.mjs` — 기존21 PASS. 기존 테스트를 import하며 기존 after-hook의 reproduction.json 출력만 새 소유 `inventory-dom-existing-reproduction.json`으로 리다이렉트했다. 원 후보/검사/증거 bytes 수정0이며 원 파일 SHA 전수 대조로 보존을 확인했다.

`node --test test/uiPanelInitialization.test.js test/crystalPickerNavigation.test.js` — 기존9 PASS. shared test 편집0. 합본 후보 classic inline 각4개 구문 검사도 generator에서 실행했다. 게임 스크립트 실행0.

초기 host 연결의 중복 helper 추출·invFilter 누락·Node adapter insertBefore 누락을 수정하고 최종18건을 재실행했다. 이는 host 구성 오류이며 생산 결함으로 귀속하지 않는다. source 함수 자체를 대역 함수로 바꿔 통과시키지 않았다. 계산/카드 스킨/저장/다른 패널은 fixture 의존성으로 제한하며 해당 시스템 PASS를 주장하지 않는다.

## 원본 SHA·기록

`inventory-dom-provenance.json`은 원 inventory-focus-* 파일 전부의 SHA, 현재 game/easy SHA와 실제 함수별 줄번호·SHA를 기록한다. 원 후보 생성기의 파일 쓰기를 호출하지 않았다. 현재 root가 순차 수정 중인 두 HTML은 직전 inventory-focus 생성 당시 SHA와 다르므로 옛 patch를 현재 바이트라고 주장하지 않는다. 이번 generator가 실제 현행을 읽어 새 patch를 만들었다.15:58:06Z 검사에서는 원 파일 전수/생산 SHA 불변이었다.

**최종 재대조 중 변경 관측:** 원 `inventory-focus-reproduction.json`의 checkedAt이15:59:16.354Z로 갱신되어 SHA가 `54b6239c325434a981d1df0fa86c5eb33b2e60a897868954072b391180e2f8e4`→`9e356e20dbc586879e97546f1b8681e0717ea75c1dc2cdc990d291b924bb56bf`가 됐다. 작성 주체는 미확정이며 이번 readonly import 실행의 출력은15:56:15.811Z에 새 소유 경로로 리다이렉트됐음을 대조했다.16:00:31.339Z 실제 최종 바이트 재대조에서 **checkedAt 제외 payload 완전동일**, 원 코드/patch/그 밖의 원 파일과 생산2개 SHA 불변을 확인했다. 원 증거를 되돌리거나 덮어쓰지 않았다. 상세 before/after는 `inventory-dom-original-drift.json` 및 `inventory-dom-final-check.json`. 회귀는 이 증거 시각 변화를 숨기지 않고 코드/patch bytes와 증거 payload를 분리해 대조한다.

| 현행 Read 원소스 | SHA256 |
|---|---|
| game.html | f7212ac287665f831975c47523783967374db4c1219b898e57bca5f97cfa1649 |
| game-easy-test.html | 34ffa8ae1ff4a4509e695f921eef53e0a236aff63184459d13a915f37434bd04 |

docs 전체 UI-04/_invClearHover/invRight/DOM 조작/초점/키보드 검색은 `inventory-dom-doc-matches.txt`. 공유 docs는 수정하지 않았으며 root 적용 후 UI-04에 ‘미적용 연결 후보18/기존21/공통9·native DOM 대기’를 기록하고, 인벤토리/구성 SSOT에 keyboard 소유 hover 종료 예외·동일 identity 현재 카드→닫기 복귀 계약을 반영할 것을 제안한다. UI-04 전체 완료로 올리지 않는다.

## root native DOM·실화면 게이트

root만 기존 승인 환경에서 `inventory-dom/host.html`을 열어 소스/후보/KO·EN을 선택한다. 여기에는 게임/이미지/API/저장/새 서버가 없다. actual renderInv 카드에서 **직접 Tab/Enter/Space**로 상세에 진입한 뒤 hover 종료·재구성·fixture 소멸 버튼을 사용한다. 세 fixture 버튼은 pointer mousedown 초점 변경을 막아 대상 초점 상태를 보존한다. 필요하면 host 전용 `inventoryDomHarness`의 hover/rerender/remove/current를 사용한다. 실제 Tab 순회, Space keyup 중복·수정키, 현재 카드 또는 invClose, 닫기 opener, computed hidden 초점 금지를 기록한다.

그 다음 승인된 production CSS/패널 QA에서 크기별 초점 가시성·hover 진입/종료·긴 비교/스크롤·장비/유골함 탭 및 실제 패드를 별도로 확인해야 한다. host 성공은 전체 게임/production 레이아웃/실물 패드 PASS가 아니다. 담당은 추가 범위나 실게임 검수를 시작하지 않고 한 건을 root에 인계한다.
