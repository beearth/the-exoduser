# UIUX-20261002-INVENTORY-FOCUS — root 인계

## 완료 범위와 중복 확인

**미적용 후보 완료. 신규21 PASS / 기존9 PASS, 실화면·레이아웃·패드 UNKNOWN.** 사용자 Chrome 입력/리로드/닫기/계측0. 생산·공유 docs·타팀·Git·queue·설치·서버·빌드·새세션·에이전트 작업0. 소유 `inventory-focus-*`만 작성했다.

AGENTS 및 UI 개선대장 UI-04는 상세/비교·키보드/패드·작은 화면 검수 대기다. UI_COMPOSITION의 최초 탭 초기화·가방 필터·현행 표시·9월29일 정렬/닫기 버튼 완료절과 인벤토리 SSOT의 전체화면/좌우비교/종료 계약을 먼저 대조했다. 기존 정렬·닫기 native button, Enter/Space/Tab 예외는 이미 해결됐으므로 다시 구현하지 않는다. 현행 ui-panels.js는 탭·휠 미리보기·액션 레일 초점 스크롤만 처리하며 이번 소멸 아이템 초점 복귀와 다르다. 동일 소유 prefix에는 task.md만 있었고 중복 후보/결과는 없었다.

## 입증한 결함 한 건

아이템 상세 진입 후 선택 아이템이 없어졌을 때 `_invRenderDetail(idx,source)`가 `if(!it)return;`으로 종료한다. 새 아이템이나 오류 안내를 표시하지 않고 이전 상세·비교 클래스·액션을 남긴다. 장착 선택 복원도 `if(INV.equipped[_eqS])...;return;`으로 빈 슬롯을 건너뛴다. 키보드 초점이 이전 액션에 남을 수 있다. 이번 결함은 **소멸/빈 선택 상세의 잔류와 초점 회수 누락**이며 모든 인벤토리 오류를 해결했다는 주장이 아니다.

최소 재현: DOM 대역 invRight에 이전 아이템·비교 상태, invActionBtns에 초점 있는 이전 버튼 1개를 놓고 INV.bag=[]/equipped={}/store=[]로 실제 디스크 함수 전체를 추출해 `_invRenderDetail(0,'bag'|'eq'|'st')` 호출. 양쪽 원식 6경로에서 상세/액션1/이전초점 잔류를 확인했다. 후보에서는 이전 상세 참조 null·비교 클래스 제거·액션0·닫기 초점으로 전환한다. `inventory-focus-reproduction.json`에 원식/후보12행이 있다. 정상 렌더를 거친 뒤 제거하는 통합 브라우저 재현 대신 최소 전제 DOM을 사용한 **함수 오류 경로 재현**이다.

본편 함수 기준: `game.html:47790` 상세, `game.html:47970` 선택 복원, `game.html:48381` 렌더, `game.html:42580` 닫기. 쉬운판 `game-easy-test.html:46384` 상세/`game-easy-test.html:46462` 선택 복원. 실제 최신 줄 위치는 패치 문맥과 source-hashes를 우선한다. 본편의 좌우 comparison과 쉬운판의 기존 세로 comparison 차이는 보존했다.

## 코드·호출부 연결 후보

| 파일 | 역할 |
|---|---|
| inventory-focus-candidate.mjs | DOM만 다루는 초점 수명주기·미적용 source 연결 변환 |
| inventory-focus-main.patch | 본편 실제 문맥 기준 미적용 unified patch |
| inventory-focus-easy.patch | 쉬운판 실제 문맥 기준 미적용 unified patch |
| inventory-focus.test.mjs | 실제 함수 추출 + 작은 DOM 대역 회귀21건 |
| inventory-focus-artifacts.mjs | 현재 디스크 Read→문맥 연결→두 patch·SHA 재생성 |

빈 상세 반환을 `missing()`으로 연결하고 장착 선택 복원은 실제 상세 함수가 빈 아이템을 처리하게 한다. missing은 새 KO/EN 리프 status 안내를 만들고 **replaceChildren**으로 해당 상세/액션만 비운다. 부모 textContent/innerHTML 신규 전체교체0. 기존 부모 교체 코드·렌더러를 이번 범위에서 전면 개편하지 않는다. 소켓/장착/분해/필터/저장/전투 공식은 변경하지 않는다.

가방·장착 슬롯의 기존 DIV에 tabIndex0/role button/번역된 아이템 aria-label을 연결한다. 기존 mouse onclick/drag/contextmenu는 그대로다. Enter는 keydown 1회, Space는 keyup 1회 활성화하고 반복·수정키·자식 이벤트를 제한한다. Tab은 preventDefault하지 않는다. 현재 전역 키 입력 예외에 **해당 새 trigger만** 추가하여 키보드 상세 입력이 Space 쓰레기/Tab 닫기로 새어 나가지 않게 한다. 실제 정상 선택/렌더/상세 함수를 호출하며 가방은 현재 indexOf(item), 장착은 같은 identity 확인으로 낡은 인덱스/다른 아이템 선택을 피한다. 키보드 활성화에서는 마우스 분해 선택·드래그를 호출하지 않는다.

정상 상세/비교는 invRight에 programmatic focus(tabIndex−1). 소멸 시 연결되고 활성인 원 anchor로 복귀, 재렌더로 삭제됐으면 invClose로 복귀한다. 무관한 마우스 빈 조회는 초점 강탈0. 패널 닫기는 열기 직전 외부 opener로 돌아가고 삭제된 opener면 숨긴 패널 액션을 blur한다. closeAllPanels의 선택적 초점 보존 인수는 열기 내부 전환에만 사용하여 이미 열린 패널을 다시 열 때 opener를 잃지 않게 했다. **자동 modal trap이나 패드 내비게이션 변경은 없다.**

## 검사와 한계

`node --test tools/team-followup-20261001/UIUX/inventory-focus.test.mjs` — 21 PASS / 0 FAIL.

`node --test test/uiPanelInitialization.test.js test/crystalPickerNavigation.test.js` — 기존9 PASS / 0 FAIL.

`node tools/team-followup-20261001/UIUX/inventory-focus-artifacts.mjs` — source 추정 없이 실제 두 HTML 문맥으로 패치 재생성. 생산 파일 쓰기0. 문맥이 다르거나 중복 적용이면 거부한다.

양쪽 후보 classic inline script 각4개, 총8개 구문 PASS(실행0). 첫 검수 명령은 importmap JSON을 JS로 잘못 분류해 SyntaxError였고, importmap 제외 후 통과했다. 생산 코드 오류나 수정으로 보고하지 않는다. UTC2026-10-01T15:31:42Z 최종 Read에서 소스3개 SHA가15:30:13 기준과 불변이었다.

정상 단일/비교는 실제 `_invRenderDetail` 양쪽을 실행하여 원식 대비 생성 노드 수·비교 호출 수·비교 클래스·액션 문자열 보존을 대조했다. 카드 필드/비교 데이터 계산은 대역을 주입했으므로 모든 스탯 계산 정확성 검수는 아니다. bag/eq/st 빈 조회6, 장착 소멸 복원2, 연결 문맥/구문2, 정상 렌더4, 실제 open/close/closeAll 재열기2, 키 계약/삭제 anchor/초점 강탈/닫기 재열기/KO·EN5 =21건.

기존 테스트9건은 변경하지 않은 생산 소스 기준이다. Tab 검사는 이벤트 비차단 및 호출부 예외만 검증하며 브라우저 실제 순회 순서는 미검수. native keyboard default·스크린리더·레이아웃·패드 PASS로 확대하지 않는다. 신규 status 번역은 _L 리프에만 사용하며 기존 라벨을 삭제하지 않는다.

## 원소스 SHA와 docs 반영안

UTC2026-10-01T15:30:13.122Z 디스크 Read 기준:

| 원소스 | SHA256 |
|---|---|
| game.html | 21235538c9766a28b04dcf529aed9883a8aa11bdbfef8e9e2ce35d5cc927c5cf |
| game-easy-test.html | 4c408f1e7b57210900ddfa8a0646502f91b6a0bbc798a24338eb159cb613d874 |
| ui-panels.js | b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5 |

docs 전체 UI-04/_invRenderDetail/inv-side-compare/초점/키보드 검색 결과는 `inventory-focus-doc-matches.txt`. 공유 docs 직접 수정0. root 승인 적용 후 다음 표를 SSOT/구성 문서/작업대장에 반영하도록 제안한다. 지금 구현 완료 상태로 올리지 않는다.

| 반영 문서 | 제안 내용 |
|---|---|
| UI_UX_IMPROVEMENT_PROJECT_20260930 UI-04 | 빈 선택 상세 잔류 오류의 미적용 후보21검사·기존9검사. 실화면/패드 대기, UI-04 전체 대기 유지 |
| UI_COMPOSITION_20260925 | 가방/장착 상세 keyboard trigger, 오류 리프·초점 fallback·닫기 opener 복귀 계약. 기존 정렬·닫기 버튼 완료와 구분 |
| 인벤토리 SSOT | 소멸 아이템 상세/비교·액션 제거, 연결 anchor→invClose, 외부 opener 복귀. 기존 수치/장착/분해/필터/저장 계약 불변 |

## root 후속 게이트

승인된 QA 복사본에서만 두 patch 검토·적용 후 본편/easy KO·EN, 기본 데스크톱/1324×982/1280×800/390×844의 상세·비교 진입, Tab 실제 순서/닫기/재열기, 선택 소멸 및 삭제 anchor, 포커스 윤곽/가시성/스크롤을 검수한다. CSS focus-visible와 키 안내가 이번 키보드 의미에 맞는지도 실제 화면에서 확인한다. 실제 패드·저장·장착·분해 실행 검수는 별도 승인 단계다. 현재 사용자 Chrome을 건드리지 않고 이번 한 건으로 root 인계한다.
