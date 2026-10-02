# ITEM — 강화 이전 비용 부족과 D13 binding 보존

**NO-FIX. 실제 원문 강화 이전 게이트의 부족/충족 두 입력에서 새5그룹 PASS.** 원 equipItem/xferCost/_malCost/등급 helper를 실행했으며 비용을 대입한 가짜 helper는 사용하지 않았다. 생산 수정0·schemaAdopted/enabled/runtimeReady/productionApplied=false를 유지한다.

## 현재 입력·원문

읽기 UTC 2026-10-02T06:00:38.830Z; 종료 2026-10-02T06:00:38.948Z. game.html SHA dc711864876610a83c67a659d4f162551191b56ba11d74e1cb81f03df935368e → dc711864876610a83c67a659d4f162551191b56ba11d74e1cb81f03df935368e. 전체 소스 동일=true. 총괄 checkpoint6c2dadab0b3a81a600e8358f485518cfcb122199는 제공 이력으로만 보존하며 Git/현재HEAD 독립조회0. 과거 reader 검수 pin을 현재 소스로 복사하지 않았다.

| 실행한 원문/상수 | 현재 행·SHA-256 |
|---|---|
| game.html / equipItem | 15571 / 32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6 |
| game.html / xferCost | 26888 / 1c088c19e3a29c81dc2b1aa6a838794f311f3cb4e87892dd4d1b8a2c8ea726f2 |
| game.html / _malCost | 26868 / b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f |
| game.html / _itemEconomyRarity | 26973 / 13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509 |
| game.html / enhColor | 26892 / 8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc |
| game.html / _MALICE_COST_MUL | 26867 / 2d535f228e808606c6281d2ac3010f394af4c9eeafa0704321518b297c53a9a8 |
| tools/team-followup-20261002/codex-half/ITEM/checks.mjs / own-data inspect only | 35 / 1f57a46a53205498fc6277c063befef4e8613d24e96277eb1f82a7a58ac22b6b |

기존 장착은 합성 UI-13/belt/번지는 뿌리의 띠, binding fraction0.30, enh1/rarity5, crystals[], _enhRefund7, grid0/0이다. 새 장비는 ordinary belt/enh0/_enhRefund11/crystals[]/grid5/6/reqLv0, P.lv100으로 레벨 제한을 통과한다. 이전 occupied enh0 chain과 다른 **강화 게이트 한 경계**이며 결정 전승은 제외했다.

## 공식과 두 입력 결과

| 항목 | 원 코드·SSOT | 이번 값/결과 |
|---|---|---|
| 이전 비용 | xferCost(n)=_malCost(ceil(n×1000)); _MALICE_COST_MUL=0.5, _malCost(v)=양수 max(1,ceil(v×0.5)), 비양수0 | actual xferCost(1)=500. 입력 G.mats499와500만 사용 |
| 경제 등급 | _itemEconomyRarity(r)=0이상 정수 min(r,4), 나머지0 | old rarity5→4, 배율[.5,.7,1,1.3,1.8]의1.8 |
| 환수 기록 | floor(Σ(i=0..enh−1) ceil(max(1,ceil((1+i×.15)×1.5))×배율)×.5) | enh1: ceil(2×1.8)=4, floor(4×.5)=2. 실제 강화지출의50%로 재정의하지 않음 |
| 부족499 | warning notify→return | mats499, old enh1/refund7, next enh0/refund11, 장착old/가방next·grid·참조 모두 불변 |
| 충족500 | 차감→next.enh=1→old._enhRefund=2→old.enh=0→강화 notify/addTxt→교체 | mats0, next장착, 동일old 가방반환·grid5/6. next 환수11은 원문대로 유지 |
| binding query | 기존 own-data inspect→fromStoredValue, 매 조회 현재 belt | 부족: valid/.30→valid/.30; 충족: valid/.30→legacy/null. old binding참조·descriptor 불변, 새 장비에binding/uniqueId/directstat 주입0 |
| 반환/후처리 | 원함수 반환 undefined | 부족 recalc/SFX/lesson/save/addTxt0(경고notify1은 발생). 충족 notify→addTxt→recalc→SFX→notify→lesson→save, 각 후처리1. 양쪽 RNG0 |

새5그룹: actual xferCost/_malCost matches 1-enhancement cost500; rarity5 uses existing tier4; cost-1 rejects atomically preserving mats/items/binding/grid/inventory identity; exact cost transfers only original enhancement/refund and moves same old item to bag; current query remains valid on refusal and switches to legacy only on accepted equip; refusal only warns; success source postprocessing order; RNG/save guards preserved. 이전 occupied5·own-data12/JSON·공급·callback·parent/lifecycle 검사 반복/합산0.

## 실행 범위와 한계

actual equipItem 전체와 xferCost/_malCost/rarity/enhColor 원문을 VM 실행했고 inline 환수 누적식도 원문 그대로 실행했다. 기존 own-data reader는 이전 checks의 선언부만 추출했으며 runner/fixture/import 실행0. definitions/roll-values pure data만 import; generation/rollValue/repair API 호출0. query는 현재값 읽기이고 cache/합산/cast snapshot 없음.

합성 의존은 _equipSlot/크기1×1, 레벨·좌표, notify/addTxt/recalc/SFX/lesson/save 관찰기다. real recalc·음향·DB·경제 플레이는 실행하지 않았다. 초고강화/환수overflow/슬롯/결정/레벨실패/세이브 migration은 새 검사 범위 밖이다. 보스전 사망/맵 reset 조사0, childfactory/cap/겹침/clear/snapshot 정책변경0.

## canonical docs 인계

검수기 작성 뒤 docs 전체 지정 rg 151행/52파일. 공유docs 쓰기0, 정확한 추가 문안은 다음과 같다.

| 정본 | 추가 문안 |
|---|---|
| 인벤토리 장착 자동전승 § | “ITEM-enhancement-gate-binding-0557: actual equipItem/xferCost/_malCost의 1강 이전비500 경계에서 악의499는 경고notify만 실행하고 장착/가방/그리드/강화/환수/binding참조를 보존한다. 악의500은0으로 차감, 새enh1/oldenh0 및 rarity5→경제4 레거시환수2 기록 뒤 기존 후처리를1회 수행한다. 새5그룹 source PASS/NO-FIX, 결정전승·실경제·실저장미검수.” |
| ITEM_TEAM_MASTER/저장 binding | “현재장착 own-data 조회 후보는 강화 비용부족으로 거절된 교체에서 기존D13 fraction0.30을 유지하고, 충족 교체 후 ordinary의legacy/null을 읽는다. 생성/보충/재롤/캐시/직접stat중복저장0, old binding참조 불변. schemaAdopted/enabled/runtimeReady/productionApplied=false.” |

소유 산출3파일만 작성. 시작/종료 읽기17경로 중17개 SHA 동일; 공유 변경은 관측값으로 구분한다. source VM PASS는 제품/실HTTP/GPU/시각/청취/DB PASS가 아니다. 새로운 작업이나 정책결정을 자체 시작하지 않고 감독 인수를 기다린다.
