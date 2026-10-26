# PC-A25 인벤토리 마우스 오버 미리보기 · 장착 비교 · 아이템 상세 — 2026-10-26

기준: 웹 `game.html` `_invRenderDetail` 49539~ · `_invCardFields` 49732~ · `_invBuildCompare` 49876~ · `_invClearHover`/`_invRestoreSelectedActions` · `inventory-space.css` `#invRight.inv-side-compare`, `.inv-compare-*` · `ui-panels.js` 193~ (휠). 베이스 `3b99012ea`, Unity 6000.6.7f1. 웹 상태 5종은 직접 캡처(포트 3410, 격리 save).

## 1. 파일

| 구분 | 경로 | 내용 |
|---|---|---|
| 수정(전면) | `unity/Assets/Exoduser/Runtime/NativeInventoryComparison.cs` | 옛 "장비 비교 / 선택 장비 상세" 패널을 웹 미리보기·비교 패널로 교체 |
| 수정 | `NativeInventoryDock.cs` | 호버 추적(`BeginDockEvent`/`NoteHover`), 호버 > 선택 우선순위, 휠 스크롤, 하단 액션 줄(장착/해제/분해) |
| 수정 | `NativeInventory.cs` | `SetOpen`에서 캡처 인자 적용 |
| 신규 | `unity/Assets/Exoduser/Resources/Data/item_card_defs_web.json` | 무기 7·활 3 종류표(atkMul/spdMul), 어픽스 설명 265 — 정의만 |
| 신규 | `unity/Tools/inventory-compare-web/` | `cap_cmp_web.cjs`(웹 5상태 캡처·덤프), `build_item_defs.cjs`, `mk_cmp.py` |

## 2. 호버 vs 선택 우선순위 (웹 확인 결과)

| 웹 | Unity |
|---|---|
| 가방 칸 `onmouseenter` → `_invRenderDetail(i,'bag',true)`(미리보기), 장비 칸 `onmouseenter` → `(slot,'eq',true)` | 포인터가 칸 위에 있으면 그 아이템이 패널에 표시 |
| 미리보기 중에는 선택 상세를 덮어씀. 포인터가 칸을 떠나면 `_invClearHover` → `_invRestoreSelectedActions`가 **선택된 아이템 상세**(없으면 "현재 전투 구성")를 다시 그림 | `panelItem = hoverItem ?? State.Selected`. 키보드 선택(R-9)과 클릭 선택 모두 `State.Selected`라 같은 규칙. 포인터가 계속 칸 위에 있으면 방향키로 선택을 바꿔도 호버가 유지되는 것도 웹과 같음 |
| 클릭 상세(`preview=false`)는 "휠: 상세 스크롤" 안내 줄이 없음 | 동일 |

## 3. 표시 규칙

| 상황 | 웹 | Unity |
|---|---|---|
| 가방 아이템 + 같은 부위 장착품 있음(`inv-side-compare`) | 머리 `장착 아이템 비교` + `CP: ±N`, 카드 2장(현재 장착 / 가방 아이템), `수치 차이 전체 보기` 접힘 | 동일. 접힘을 열면 증감 목록(CP, 필드 증감, DPS, 속성, 어픽스 증감/추가/제거, 암묵) |
| 장착 칸 / 장착품이 없는 가방 아이템 | 휠 안내 + 단일 `.item-detail` (출처 칩 `장착 중`) | 동일 |
| 카드 내용 | 이름·희귀도 바·종류·ATK/DPS/DEF/SPD…·암묵 `◆`·어픽스 상자·투구 속성 행 | 동일 순서·색(웹 `_invCardFields` 필드표 그대로). 이모지 대신 STR/DEX/INT/LCK 글자, 속성 이모지는 색 원 |
| 휠 | 미리보기가 떠 있으면 칸 위 휠이 격자 대신 카드 내용을 스크롤 | 동일(`detailScroll`, 키보드 PageUp/Down·`C` 기존 동작 유지) |
| 하단 줄 | 가방: `장착`·`분해 (악의+N)`, 장착 칸: `해제`, 쓰레기 지정 버튼은 남은 폭 가운데 | 동일. `장착`/`해제`는 실제 동작(Equip/Unequip), 레벨 부족이면 `Lv.N 필요` |

## 4. 계산 근거

| 값 | 웹 | Unity |
|---|---|---|
| CP 증감 | `_inventoryEquipCP(item,slot)` − `calcCP()` (가상 장착) | 대상 슬롯에 임시 장착 후 `CalculateStats(level)` + `InventoryCombatPower.Calculate`(= calcCP 49489 이식) 합 − 현재 합, 즉시 복원 |
| DPS | `_itemDps` 49733: `atk·atkMul·60/(33/(spdMul·statDex()))` | 같은 식. `statDex()`(27996)는 `CalculateStats().AttackSpeedMultiplier` |
| 필드 증감 | `cmpKeys` 38개, `\|diff\|>0.0001`, 정수면 그대로·소수면 3자리, `wStCost`·`shieldWt`·`potCd`는 낮을수록 좋음 | 같은 목록·규칙 |
| 어픽스 값 | `_affixDetailValStr`/`_affixValStr`(pct/prob → `%`, dps `/s`, tick 초, atk `ATK×N%`, hp `N%HP`) | 같음 |

## 5. 정의 공용화 보고

- 어픽스 이름 417개·종류(prefix/suffix)·단위는 `forge_web.json`(`affixes`/`affixUnits`)에 이미 있고 웹 `AFFIX_NAMES_KO`와 **417/417 일치**를 확인해 복제하지 않고 그대로 읽는다.
- 어픽스 설명(`_AFFIX_DESC` 265)과 무기/활 종류표는 `forge_web.json`에 없어 `item_card_defs_web.json`에 새로 추출했다.
- 권고: 어픽스 정의(이름·종류·단위·설명)를 `affix_defs_web.json` 한 곳으로 빼 대장간·인벤토리가 함께 쓰기. 지금은 인벤토리가 `forge_web.json` 전체를 한 번 파싱해 쓰는 구조(대장간 파일 의존).

## 6. 검증

| 검사 | 결과 |
|---|---|
| inventory-navigation | 35/35 |
| inventory-oracle | 892 / 0 |
| stat-parity | 2/2 MATCH |
| Win64 빌드 (6000.6.7f1) | errors 0, 이번 파일의 경고 0 (기존 `NativeCharacterPresentationPlayback.cs` UAC1001 1건만 남음, 이번 변경과 무관) |
| 캡처 `--unity-inventory-smoke` + `--unity-inventory-hover bag 8` / `equip 0` / `bag 9`, `--unity-inventory-select bag 8`, `--unity-inventory-hover bag 8 --unity-inventory-detail-scroll 10000` | 5회, 종료 코드 전부 0(스모크는 JSON 생성 뒤 창을 정상 종료) |

비교 이미지 `E:/exoduser-wt/_out/pc-a25/cmp/`: `a25_cmp_*.jpg`(전체), `a25_crop_*.jpg`(패널 1x 크롭) 5상태.

## 7. 미이식 · 남은 차이

| 항목 | 내용 |
|---|---|
| 유물 슬롯 줄 | 장착 아이템의 `유물 슬롯 (n)`·`[등급] ◇ 빈 슬롯` 줄은 Unity에 유물 상태가 없어 그리지 않음 |
| 전설/유니크 특수 상자 | 시드 아이템에 없음 → 문구 정의 없이 그리지 않음 |
| 분해 (악의+N) | 분해값 표가 없어 `분해 (악의+미이식)` 모양만 |
| 강화 이전 안내 | `⚒ 장착 시 +N 자동 이전` 줄(강화 상태 없음) |
| 잠금/쓰레기 태그 | 출처 줄 옆 자물쇠/휴지통 글리프 미구현 |
| 후보 카드 그림자 | 웹 `.item-detail` 큰 그림자 생략 |
| 스크롤 | 5번째 상태(휠 끝)는 웹 샘플과 같이 내용이 한 화면에 들어가 스크롤 0 — 동작은 구현했으나 이 샘플로는 시각 차이가 안 보임 |
| 글꼴 | 나눔명조/Noto 대체, Noto Serif KR 이름은 나눔명조로 |
