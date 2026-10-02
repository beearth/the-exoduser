# 필터된 가방 카드 Y 장착 identity — 2026-10-02 source 인수

현재 인벤토리의 필터된 카드에서 Y를 누르면 원래 가방 인덱스에 대응하는 현재 카드에 우클릭을 전달한다. 이전에는 `_jfIdx`(가방 인덱스)를 `_xi`(필터된 카드 목록)의 순번으로 사용해 다른 장비를 장착하거나 마지막 카드를 장착하지 못했다. 이번 생산 변경은 양판 각2접점/114B이며 item·INV·저장 schema/장착 경제/픽업 정책을 추가 변경하지 않는다.

## 현행 계약

| 항목 | 실제 적용/보존 계약 |
|---|---|
| 카드 identity | `renderInv`의 실제 가방 카드 생성에서 `div.dataset.inventoryBagIndex=String(i)` 추가. DOM 속성 `data-inventory-bag-index`; `i`는 원래 `INV.bag` 인덱스 |
| Y resolver | `const _card=[..._xi].find(card=>card.dataset.inventoryBagIndex===String(_jfIdx));if(_card)_card.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))` |
| 선택 출처 | 기존 `_invHover`/`INV.selected` 경로에서 얻는 `_jfIdx`를 유지한다. 현재 목록에 같은 인덱스의 카드가 없으면 dispatch0. 모든 stale-object/가방 변이 lifecycle을 해결했다는 뜻은 아니다 |
| 필터 재현 | 가방 `[X,A,B]`의 armor 목록 `[A,B]`에서 A는 bagIndex1/visibleOrdinal0, B는 bagIndex2/visibleOrdinal1. A hover/선택은 A, 마지막 보이는 B는 B를 장착한다. 숨겨진 X 선택은 장착 전달0 |
| 교체 장비 | 기존 장비 객체는 가방으로 반환된다. 파괴되지 않으며 새 장비와 가방의 중복 소유가 없다 |
| 강화/악의 fixture | `fromEnh=3`의 `xferCost(3)=1500`; `G.mats 10000→8500`, 기존 enh3→0, `_enhRefund 7→6`, 선택 장비 enh0→3. 이번에 비용식/환수식 변경0 |
| 결정 fixture | 같은 결정 객체1개가 기존 장비에서 선택 장비로 전승되며 `CRYSTAL_BAG` 증가0. 전체 결정 전승 정책/초과 결정 반환 정책 변경0 |
| 거절 fixture | 악의1499 또는 `reqLv=11`/`P.lv=10`이면 기존 장비 유지·차감0·성공 장착음/장착 lesson/추가 save0. 기존 `_invBagRightClick`은 거절 뒤에도 `applyStats`와 부분 `renderInv`를 호출한다 |
| prefix/패드 | actual global keydown의 Ctrl prefix 거절 보존. GPB 소스 변경0; 물리 패드 동적 검수는 UNKNOWN |
| main/easy | 일반 boots 빈 슬롯 픽업은 main에서 가방, easy에서 자동장착하는 기존 차이 유지. main의 `_equipSlot`/earring 경로와 easy의 `item.slot` 경로를 통합하지 않는다 |
| 적용 위치 | main KeyY12772/카드48712·dataset48713; easy KeyY12168/카드47288·dataset47289. 각 카드+45B/KeyY+69B=114B |
| 원문 보존 | source receipt의 whole inverse/두 접점 밖 bytes/EOL 동일. 원팀 raw2와 영구 acceptance test는 보존. DOM dataset은 save schema에 직렬화되는 새 필드가 아니다 |

## 인수 수치와 경계

| 자료 | 판정 | 정확한 분모/경계 |
|---|---|---|
| actual baseline | 24그룹=14PASS/10identityFAIL | 수정 전 실제 소스. 최종 결과와 합산하지 않는다 |
| actual final | 24/24 PASS, fail0 | 양판9시나리오씩18 + 정상 old-source 대조6. 이6은24에 포함되며 별도 추가 PASS가 아니다. source 실행30회는 동일 그룹/대조 계산의 실행 수로 새 그룹 수가 아니다 |
| 정상 대조6 | 모두 동일 | 양판 비필터 A/B의 상태·이벤트·detail·RNG 4건 + 빈 boots 픽업 차이2건. 정확 inverse의 기존 실제 소스와 대조 |
| 구문 검사 | inlineJS12/importmapJSON2 PASS | source 적용 후1회. HTML script/network import 실행0; 플레이 인수가 아니다 |
| 초기 하니스 이력 | 실제 게임 소스 실행0 | 최초 `baseline.json`은 keydown 진단 listener anchor 오추출로 `Unexpected token true`가 난 준비 기록. 제품 FAIL/PASS로 사용하지 않으며 원자료 보존 |
| 실행된 실제 원문 | global keydown 전체; pickup/equip/right-click/grid/cost helpers 전체 | `renderInv`는 실제 filter/card 가방 loop 부분 wrapper, R은 selection block 부분 wrapper. 전체 renderer/update 실행이 아니다 |
| 대역/UNKNOWN | DOM/MouseEvent transport·detail/focus·stat/audio/save/lesson/display 대역 | 실제 레이아웃/full renderer/실게임/native/물리 키보드·패드/전투/drop 생성/real storage·빌드 인수 미완료 |

이번 fixture 파일 쓰기0·기존 팀/기존 root 검사 재실행0은 source 담당 최종 영수증의 실행 범위다. docs 담당은 기존 증거를 읽고 문서만 동기화했으며 검사 실행0이다. 앱 `c927dd333`의 기존 빌드 snapshot에는 이번 ITEM 변경이 들어 있지 않으므로 그 앱의 native/시각 관측으로 이번 변경을 수락하지 않는다.

## docs 전체 검색과 역사 보존

source 실제 적용 후 docs 전체 관련 검색1회: 115매칭/33문서. 인벤토리 main/키보드 SSOT 두 곳에 현재 identity 계약을 보충하고 기존 prefix bytes/EOL을 그대로 보존했다. 해당 문서의 55/66/독립15 등 과거 초점 검수, 원팀 D13 부분 검수, 예전 환수/고유 아이템·저장/SFX 이력은 이번24그룹으로 덮어쓰거나 더하지 않는다. 다른 미술/layout/결정 필터/펫 Y/튜토리얼/경제·저장 계약은 이번2접점과 직접 충돌하지 않아 유지했다. root 소유 milestone/supervisor/CHANGELOG에는 최종 facts를 인계한다. 보호 `2_3` 수정0.

115개 각 매칭의 분류와 33문서별 이유는 ignored `inventory-filtered-equip-docs-backup/.../docs-search-classification.json`에 기록했다. 이 검색에서 소유 정본 두 곳 밖에 추가 교정이 필요한 현행 필터 Y 설명은0이다. 새로운 가방 변이/장착 기능/초점 정책 기획을 추가하지 않았다.

## 고정 증거

최종 source 영수증: `tmp/mac-migration-runtime/continued-review-20261002/inventory-filtered-equip-acceptance/receipt.json`. 아래는 해당 인수 시점 핀이며 향후 다른 승인 변경의 최신 전체 소스 SHA를 뜻하지 않는다.

| 증거 | SHA-256 |
|---|---|
| source receipt | `a989e216254717a5d7339806aa33352e83fd70f209f5dfc95cb64405eee26b31` |
| main 인수 시점 source | `ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613` |
| easy 인수 시점 source | `8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129` |
| source-patch.json | `d38441e0f09571942967ca155a82926f00210848675ee70911b07cf418862620` |
| actual-baseline.json | `3e8bec839f3eb931d239d2e8fbfa730853261ac8f4f7a64de58db5ed2fc744d3` |
| final.json | `aeec3a5141ade970bbdfac0f044f97f5739787f3af56616c6f0a6bed966a4d44` |
| syntax.json | `a5a2371f41abb61109366dea11d210ae450adad3200e3aa90bb85c4e058b6472` |
| `test/inventoryFilteredEquipIdentityAcceptance.test.cjs` | `7c7fab6f8c9a21f1fc9cb0a9a382c87eb70515c4810999ecc25d29d8a1dd8f80` |

현재 본문 계약은 [인벤토리 정본](2_7%20인벤토리+장비시스템.md)과 [키보드 초점 정본](INVENTORY_KEYBOARD_FOCUS_20261002.md)을 함께 따른다.
