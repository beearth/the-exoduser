# ITEM — occupied belt 교체와 D13 현재 장착 조회

**미연결 관측→검토 reader 접점 비교 완료: 단일 occupied 교체 chain, 새5검증그룹 PASS.** 생산 _uEq를 수정하지 않고 기존 미채택 own-data inspect를 현재 INV.equipped.belt 조회에 연결했다. 4플래그false/생산0이며 효과 활성·신규 생성·저장 schema 채택이 아니다.

## 실제 source와 대역

| 추출/읽기 원문 | SHA-256 |
|---|---|
| game.html:15571 / equipItem | 32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6 |
| game.html:15806 / _uEq | 4cc4a751997836db9d65382b937941e9971c1678cd4320337ccd2aa3aa7b3242 |
| tools/team-followup-20261002/codex-half/ITEM/checks.mjs:35 / own-data inspect fragment | 1f57a46a53205498fc6277c063befef4e8613d24e96277eb1f82a7a58ac22b6b |
| unique-item-project/roll-values.js:46 / fromStoredValue | 5e521cc77fabffb833bd99fa98d2e978da460b98f6f6dbfbf07c30d4ee823bfc |

실제 game.html 읽기 UTC 2026-10-02T05:45:48.012Z, SHA 2e45ee0e9ad909b378bf1a7b864818ce442a4c3e17b12360b42e363dc7d0bd94; 종료 2026-10-02T05:45:48.091Z에 같은 SHA. 기준 f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c는 감독 제공 원격 관측이며 Git 독립조회0이다. 이전7e694950/6c77 입력과 구분한다.

actual equipItem 전체함수와 _uEq 전체함수를 VM에서 실행했다. 기존 codex-half 검수기의 const owns부터 inspect 종료까지 **reader 선언만 원문 추출**하여 실행했고 이전 runner/fixtures/write 코드를 import/실행하지 않았다. definitions.js/roll-values.js pure data 모듈만 import하여 기존 lookupItemProposal/fromStoredValue를 사용했다. 새 queryEquippedD13()는 inspect(INV.equipped.belt) 한 줄의 메모리 접점이다. cache·직접 stat 필드·합산·생성 API 없음.

대역은 P.lv100·belt-only 슬롯 순회·동일1×1 크기·equipSlot identity·recalc/audio/notify/lesson/save counter다. old는 enh0/crystals[]이고 두 신규 장비도 같아 강화비용/결정전승은 실행하지 않았다. 실제 equipItem의 old 반환·그리드 이전·bag filter·장착·후처리·save 호출은 원문 실행이다. 합성 UI13 binding값0.30은 기존 정수20~40%/fraction0.20~0.40 계약의 한 대표값이며 실제 드롭/신뢰된 생산 생성 증거가 아니다.

## 한 chain의 전후 비교

| 호출 시점 | 현재 belt | 원문 _uEq(_uTrapOffshoot) | 후보 inspect 분류/값 | 가방 순서 |
|---|---|---|---|---|
| initial query | old | 0 | legacy / null | d13,ordinary |
| equipItem(d13) 내부 dbSaveForce 대역 시점 | d13 | 0 | valid / 0.30 | ordinary,old |
| equipItem(ordinary) 내부 dbSaveForce 대역 시점 | ordinary | 0 | legacy / null | old,d13 |

두 원함수 반환값 모두 undefined. 같은 chain을 원문/후보 각1회 실행(총 실제equip4회), 원문0→0→0와 후보null→0.30→null을 비교했다. 상태/가방 순서/아이템 identity/그리드 이전이 동일하고 old 및 교체된 d13가 각각 동일 객체로 가방에 돌아왔다. bound.uniqueRoll 참조와 중첩 descriptor는 그대로이며 direct _uTrapOffshoot 저장0이다.

두 run의 recalc→equipSfx→notify→lesson→save 호출 순서는 같고 각 recalc/equipSfx/lesson/save2회, RNG0이다. 후보 fromStoredValue는 현재 d13에서1회만 호출됐다. reader 생성/수리/재롤0이며 ordinary로 교체된 뒤 이전 d13값을 반환하지 않는다. query 시점 현재 장비 읽기 검수이며 cast/hit/kill snapshot 시점 선택이 아니다. getter fixture/legacy schema matrix/JSON roundtrip/empty-slot 검사는 재실행하지 않았다.

- production direct-stat reader remains disconnected across occupied chain
- current binding adapter follows old -> UI13 -> ordinary at actual save callsite
- same actual equip return/state/grid/old-item identity as original
- recalc/audio/lesson/save call order preserved and RNG zero
- nested binding untouched; current query does not generate/cache/duplicate stats

## docs canonical 인계

코드 작성 후 docs 전체 관련 rg: 674행/106파일. 공유docs 쓰기0이며 아래 문안을 원총괄에 인계한다.

| 정본 | 정확한 추가 문안 |
|---|---|
| ITEM_TEAM_MASTER D13 | “ITEM-equipped-reader-0543: actual equipItem의 occupied belt old→합성UI-13→ordinary 단일 교체 chain을 원문/후보 각1회 비교했다. 기존 own-data inspect와 fromStoredValue로 현재 INV.equipped.belt를 조회하면 legacy/null→valid/0.30→legacy/null이며 원문 _uEq는 직접stat 미공급으로0→0→0이다. 새5그룹 PASS, 기존검사 반복0·생산0·4플래그false.” |
| 저장 SSOT binding 검토 | “D13 장착 조회 후보는 query 시점 현재 belt만 기존 own-data inspect로 읽는다. 장착 교체 후 이전 binding값 cache/snapshot 없음, 생성/누락보충/재롤/직접stat 중복저장0. occupied 교체의 old 반환·가방/그리드/반환값·save대역 순서는 원문과 동일. schema미채택·실저장미검수이며 cast/hit/kill snapshot 결정과 별개다.” |

## 범위·다음 Gate

UTC 2026-10-02T05:45:48.012Z→2026-10-02T05:45:48.091Z; KST evidence 기록. 20 읽기경로 시작/종료 SHA 동일. 이전 공급3입력/5그룹·own-data12+JSON1·callback32·caller22·parent 조사 반복/합산0. 독립 새검수5그룹만 보고한다. checks/result/evidence3파일 소유이며 TASK·기존 산출/타인WIP 보존, Git/UI/실게임/서버/실저장/빌드/삭제/메시지/새세션0.

source VM PASS는 강화/결정/실제 stat 재계산·효과·DB·브라우저·성능·시각·제품 PASS가 아니다. schemaAdopted=false, enabled=false, runtimeReady=false, productionApplied=false. 데이터 공급·생산 reader 인수와 lifecycle/child factory/cap/겹침/clear/롤snapshot 시점 Gate는 여전히 원총괄/감독 결정 대상이며 새 정책을 확정하지 않았다.
