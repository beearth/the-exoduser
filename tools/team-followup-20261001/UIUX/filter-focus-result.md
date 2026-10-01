# UIUX-FILTER-FOCUS 한 건 인계

## 수신·소유·근거
- 기존 UIUX 세션. 소유 prefix에는 task.md만 있었으며 같은 과제 진행/대기 결과나 초안이 없어 중복 착수하지 않았다. 기존 제출 전체는 읽기 전용이다.
- 첫 실제 Read/명령: 2026-10-01T17:54:24Z. 첫 코드 Edit: 2026-10-01T17:56:08Z(candidate.mjs birthtime UTC). 검사·완료 UTC는 receipt 참조.
- AGENTS DOM 보존 규칙, UI-04, 인벤토리 현행/기본 SSOT, production-integration-result, 기존 카드 제거 후보/검사를 읽었다. 총괄의 생산 인수/후속 기록도 읽었으며 생산 쓰기 권한을 재사용하지 않았다.
- 양쪽 전체 before HTML과 실제 ui-panels.js composition 원문을 새 소유 파일로 보존했다. 원소스 21함수·factory SHA/1-based 줄, 기존 자료285개 SHA는 filter-focus-before.json에 남겼다. 추가 유골함 함수6개의 Read-only SHA는 filter-focus-ossuary-source.json에 별도 기록했다.

## 확인된 결함 한 건
실제 renderInv는 invFilters의 기존 버튼을 제거하고 mkF로 다시 생성한다. 실제 onclick은 invFilter[key]를 변경하고 renderInv를 호출한다. 네이티브 필터 버튼에 있던 초점이 제거 시 BODY가 되지만, 기존 _inventoryFocus.beforeRender/afterRender는 카드·상세·행동 소유권만 보존하여 필터 버튼을 복구하지 않는다.

선택한 시험 검을 Enter/Space로 연 뒤 실제 슬롯/희귀도/속성 필터 버튼을 활성화해 선택 카드가 빠지거나 결과가 0개가 되는 경로에서 재현했다. 가짜 필터 조건이나 가짜 renderInv로 대체하지 않았다. fixture의 click은 실제 생성 버튼 onclick을 직접 호출하고, 카드 필터 조건과 순서는 추출 생산 renderInv 원문이다.

| 경로 | 실제 카드 수 | 원식 | 후보 |
|---|---|---|---|
| 장비 탭 → 유골 slot | 0 | 제거된 필터 버튼 → BODY | 같은 key/value의 새 필터 버튼 |
| rarity=1 | 1(시험 갑옷), 선택 검 제외 | BODY | 새 rarity 필터 버튼 |
| rarity=4 | 0 | BODY | 새 rarity 필터 버튼 |
| el=1 | 0 | BODY | 새 속성 필터 버튼 |
| 필터 재활성화 | 해제 후 장비2개 복귀 | 원결함 범위 | aria-pressed=false인 같은 새 버튼에 복귀 |

양쪽 ×KO/EN ×CSS off/on 최소 모델 ×필터4경로의 **32개 반례**를 원식 RED(BODY) → 후보 GREEN(동일 필터)으로 보존했다. 카드 삭제 회귀를 반복해서 새 결함으로 계산하지 않았다.

## 미적용 최소 후보
filter-focus-main.patch / filter-focus-easy.patch. mkF 생성 버튼에 key/value dataset 두 개만 부여하고, beforeRender token에 활성 필터 identity를 담아 afterRender에서 같은 새 네이티브 버튼으로 복귀한다. 재생성 버튼이 숨김/비활성/소멸이면 invClose를 사용한다. 외부 초점 상태의 programmatic click은 초점을 강탈하지 않는다. 기존 필터 값·act 계산·onclick·렌더 조건·카드 소멸/상세 복귀는 그대로 유지한다. CSS·레이아웃·부모 textContent/innerHTML 전체교체를 추가하지 않았다. 원 renderer의 기존 DOM 처리는 before 그대로다.

생산 두 HTML, ui-panels.js, 공유 인벤토리 SSOT, 총괄 docs, 기존 후보·증거는 **수정0**. 저장·경제·아이템 payload·RNG·전투 변경0. candidate.mjs와 prepare/fixture/test 및 소유 prefix의 patch/Read 근거/결과만 작성했다.

## 조사한 무수정 경계
실제 ui-panels.js inventory/tabBar/selected/translate와 실제 HTML _invChangeCategory→renderInv→_invClearHover를 연결해 ArrowRight 유골함 진입/ArrowLeft 장비 복귀를 조사했다. 탭 버튼은 renderInv가 제거하지 않아 현재 Node 경로에서는 초점 유지, category/filter 초기화, 대상 aria-hidden, invRight 이동, bonePart 가방1개/장비2개 재등록을 확인했다. 복귀 뒤 새 카드 Space 상세·hover·행동 재렌더·닫기 opener도 확인했다. 이 분기에는 수정하지 않았다.

**renderOssPanel/전대 수집 서브렌더는 fixture에서 기존 no-op 대역**이다. 실제 함수는 읽고 SHA를 남겼지만 유골함 중앙 버튼·골격 노드·전대 전환·수집/해제·미리보기 전체를 실행한 것은 아니다. 따라서 이들 동작의 결함 없음이나 native PASS를 주장하지 않는다. 실제 유골함/패드 게이트는 남아 있다.

## 검사와 재실행
`node --test tools/team-followup-20261001/UIUX/filter-focus.test.mjs`: **26 PASS / 0 FAIL**. 새 candidate/fixture 문법 검사 통과. 원식 RED 기대값과 후보 GREEN, 실제 필터 이벤트/결과0/선택 제외/필터 해제, 실제 탭 이벤트·category 렌더, 외부 초점 강탈0, 숨긴 새 필터 fallback, 생산/기존285개 byte 보존을 포함한다.

CSS on은 visibility:visible!important만 모델링했다. Tab은 카드 preventDefault 미호출 계약, Enter/Space는 카드 실제 핸들러 계약이며 네이티브 필터 버튼의 OS 키 활성화나 실제 CSS 로딩/레이아웃을 실행하지 않았다. Node DOM 합성은 화면/패드 PASS가 아니다. ui-panels event를 재구성한 것이 아니라 정확 원문을 추출했고 DOM addEventListener/click/before 연결만 대역에서 제공했다. renderOssPanel/storage/crystals 및 비관련 스탯·아이콘 보조 함수는 대역이다.

prepare는 before/초안 중복 생성 시 거부한다. 재검사는 보존된 before를 사용한다. root의 생산 소스가 이후 바뀌면 SHA 보존 검사는 실패하며 이 실패를 기대값 수정으로 숨기지 않는다. 새 로컬 import·fixture·Read 의존 파일 목록은 filter-focus-dependencies.json에 제공한다.

## docs 반영안·다음 실 UI 게이트
docs 전체 UI-04/필터/category/유골함/키보드/초점 검색을 filter-focus-doc-matches.txt에 남겼다. 공유 문서는 수정하지 않았다. 승인 반영 시 UI-04와 INVENTORY_KEYBOARD_FOCUS_20261002에 “필터 버튼 재생성 key/value token 복귀, 결과0도 동일 버튼, 숨김/누락이면 invClose”를 추가하고 생산 적용 여부와 native 미검수 상태를 분리할 것을 제안한다.

QA/root 전용 런타임에서 다음을 확인한다(담당은 실행하지 않음):
1. 양쪽 ×KO/EN ×CSS off/on에서 Tab으로 필터를 찾아 Enter/Space로 실제 활성화한다. 선택 카드가 필터에서 빠져도 새 동일 필터에 focus-visible/aria-pressed가 유지되는지 확인한다. 원식은 BODY 반례, 후보는 동일 필터를 비교한다.
2. 슬롯/희귀도/속성 결과0 →같은 버튼 재활성화로 해제→카드 목록 복귀·Tab 진행을 확인한다. 실제 CSS inline/computed visibility를 분리하고 숨긴 상세로 이동하지 않는지 확인한다.
3. 유골함 탭→전대/중앙 유골함/골격 노드→장비 복귀 후 새 카드의 Enter/Space/Tab/hover/재렌더/닫기 opener를 확인한다. 수집/해제·저장/경제 변경을 수행하지 않는 읽기 검수로 제한한다.

브라우저·게임·앱·사용자 세이브·서버/listen·빌드·권한·Git 쓰기·queue·새 팀/세션/에이전트 실행0. 이 한 건의 미적용 후보를 인계하고 다음 범위는 시작하지 않는다.
