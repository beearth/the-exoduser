# UNITY-INVENTORY-01 — 원본 인벤토리 C# 핵심

2026-10-24 PC Codex / `codex/unity-port-20261024`. 소유는 `unity/Assets/Exoduser/Runtime/Core/Inventory*.cs`, `unity/Tools/inventory-oracle/**`, 본 문서다. Godot·웹·저장·보호 Q/E는 무수정. 화면/입력/Simulation adapter/실제 Editor·Player 검수는 부모 통합 단위가 담당한다.

## 원본 데이터 및 범위

| 항목 | 원본 / Native 계약 |
|---|---|
| 권위 소스 | `godot/source_snapshot/game.html`, SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209` |
| 새 시작 표본 | `mkP/defaultItems` seed `0x20261024`, clock1792796400000, 원본505난수/15장비 뒤 가방10개 생성까지887난수 |
| 실제 등급 | 장착15개 rarity0 일반, 가방10개 rarity1 마법·각2어픽스. `mkItem(slot,0,el,1)`의 네 번째 인수는 등급이다. '일반 가방10개'로 설명하거나 어픽스를 지우지 않음 |
| 장착 슬롯 | 원본 SLOT_NAMES 순서17개. belt/ossuary는 시작 null, 나머지15개 채움 |
| 가방 | 10열×120행, BAG_MAX300, 허용 장비2×2. 원본 `_invAutoPlace` 첫 정렬 결과를 seed에 저장 |
| 소유권 | 아이템 객체 참조로 비교. 원본 double ID의 충돌 가능성을 숫자 ID 인덱스로 숨기지 않음 |
| 장착/교체 | 원본 slot 대상, 기존 장비를 새 장비의 가방 좌표로 반환. 귀걸이는 headband→headband2 빈 슬롯 우선 |
| 해제 | 원본 행 우선 첫 빈2×2 영역. 꽉 차면 가방 push를 취소하고 장착·아이템을 보존 |
| 이동/선택 | 가방 참조만 이동, 경계·겹침 거부, 선택은 장착 교체 후에도 같은 객체 유지 |
| 정렬 | 즐겨찾기→쓰레기 여부→등급↓→itemPower↓→itemLv↓→enh↓→원래 순서. 원본 itemPower의 affix unit 가중치를 적용 |
| 입장 범위 | tier0/itemLv0, rarity0/1, enh0, socketCount0/빈crystals/socketQ, 인정 슬롯/13implicit/20affix id. 미지원 레전더리·유니크·소켓·강화·unknown은 거부 |
| 미이식 | 새 mkItem 생성·드랍 반입·전체 어픽스 조건부 전투·소켓/전승·강화·분해·보관함·유골·저장. static equip 가능과 전투 특수효과 재현을 구분 |

원본 호출은 기검참·공격·방어의 일반 루프를 대신하지 않는다. 가방의 원본 어픽스를 데이터/상세에 유지하고, 통합 UI는 **추가 옵션 전투 효과 미이식**을 항목별 표시한다. `TryEquip`은 해당 정적 장비 모델의 허용을 뜻한다.

## 실제 계산 및 자원 보존

`InventoryStats`는 SimulationConfig와 같은 public 필드명을 사용한다. 부모는 이 계산값을 현재 Simulation에 반영하고 `ClampResources` 또는 동일한 네 자원 `min`을 적용한다.

| 항목 | 실제 원본 허용 부분 공식 |
|---|---|
| lvB | floor(playerLevel×0.5), 숨은 STR/DEX/INT/LCK 및 grit에 추가 |
| HP | floor((max(100,300−20×signedDiff)+(stage−1)×6+effectiveSTR×5+장비bonusHp+implicitMaxHP)×(1+maxHPPct+(implicitMaxHPPct+implicitLifeHPPct)/100))+grit |
| ST | floor(100+장비bonusSt)+grit. 원본 recalcSt는 숨은DEX와 장비DEX를 기본100의2배 항에 합산하지 않음 |
| MP | floor(100+effectiveINT×2+장비bonusMp)+grit |
| Shield | floor(100+effectiveINT×5+장비bonusShield+shieldFlat) |
| DEF | 2+shield/armor/boots/gloves/pants의def+defFlat+floor(grit×0.5) |
| 이속 | (2.6+effectiveDEX×.005)×(1+implicitMovSpd/100) |
| HP/ST/MP 회복 | .05+effectiveSTR×.002 / .05+effectiveDEX×.005 / .05+effectiveINT×.005 |
| 공속 | 1+effectiveDEX×.0005+gloves.atkSpd+implicitAtkSpd/100 |
| 기본 공격력 | 15+(stage−1)×2. WeaponAttack/Speed/Range/Arc 별도 |
| 무기 range | rawwRange+bonusRange×4. 무기가 없으면0이며, 실제 기본공격 소비부의 원본 fallback50 및 arc.95는 부모가 적용 |
| 교체 자원 | HP/ST/MP/Shield 모두 min(새 최대값, 교체 전 현재값). 비율 보정·무료 최대 회복 없음 |

| 시작 계산 | HP | ST | MP | Shield | DEF | 이속 | 공속 | 무기ATK |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 실제 seed15장비 | 526 | 240 | 330 | 285 | 100 | 2.7196 | 1.0336 | 18 |

현재 static 계산에 영향을 주는 가방 어픽스는 `shieldFlat`, `maxHPPct`, `defFlat`, `dropRate`다. 나머지 조건부 효과는 보존만 하며 전투 완료를 주장하지 않는다.

| 가방 원본 장비 | 원본2어픽스 |
|---|---|
| 불꽃 석궁 | projDmgPct .08 / pierceDmgKeep .10 |
| 나무 견갑 | shieldFlat120 / reflect .03 |
| 불꽃 망토 | shieldFlat120 / dropRate .08 |
| 녹슨 도끼 | cooldownRed −.02 / darkPen .05 |
| 녹슨 창 | counterAtkDmg .10 / onHitBleed .05 |
| 불꽃 갑옷 | maxHPPct .05 / darkDR .04 |
| 녹슨 해머 | poisonDot5 / slowDmgUp .10 |
| 전기 전투화 | defFlat10 / pickupRadius10 |
| 녹슨 단검 | flatLightDmg7 / onHitPoison .06 |
| 그림자 머리띠 | poisonDmgPct .08 / skDarkPillarDmg .08 |

## 검수 근거

원본 함수와 테이블을 Acorn으로 그대로 추출해 오프라인 VM에서 실행했다. 원본72개 명명된 함수/테이블이 현행 `G:/exoduser/game.html`과 동일하다. export는 raw25개 아이템·27장착/해제 시나리오·4현재자원 결과·9성장/난이도 프로필·6격자 경계·정렬 power를 버전 관리 JSON으로 남긴다. 성장 프로필은 수동배분 STATS0·PASSIVES0·추가 근성0·원본 숨은 lvB 상태이며 전체 스탯 배분/패시브 UI를 뜻하지 않는다.

| 검사 | 결과 / 범위 |
|---|---|
| 최초 RED | `inventory-red-01b.json`: InventoryState 부재, 실제 .NET 컴파일 성공 후1실패 |
| 최초 입장 오류 | GREEN-01: 원본 가방이rarity1+affix2이므로 잘못된 common-only 가정을 거부. raw 아이템을 바꾸지 않고 admission/계산을 수정 |
| 확장 RED | GREEN-03: level2/100의 원본 grit 보너스 누락21실패. 레벨 성장 공식을 보완 |
| Native core | `inventory-green-06-final.json`: 909검사/0실패, pinned .NET8.0.301 컴파일 경고0/오류0 |
| 격리 C# 복구 | `recover.cjs`로 명시10파일만 I: 새 폴더에 source 전/후·복사본 SHA256 대조하고 재컴파일·909/909. Git tracked snapshot/Unity 패키지와 구분 |
| 영수증 위치 | `I:/EXODUSER-Storage/qa/unity-inventory-20261024/core-runs/` |
| 실제 Unity 화면/Player | 부모 통합 검수 대기. C# 원본 대조만으로 GUI·시각·조건부 전투·저장 완료를 선언하지 않음 |

코드 변경 후 docs 전체에서 `인벤토리`, `_invSortBag`, `_refreshEquipmentStats`, `itemPower`, `BAG_MAX`를 검색했다. 공통 인벤 문서와 상위 UNITY_PORT/작업판 갱신은 부모 소유이므로 위 실제 등급/범위/수치를 전달했다.
