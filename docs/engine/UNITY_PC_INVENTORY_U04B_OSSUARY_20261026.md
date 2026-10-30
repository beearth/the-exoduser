# Unity 고유 유골함 자동 장착 + 인벤토리 "유골함" 페이지 (PC-U04b, 2026-10-26)

기준 웹: `game.html` `_grantOssuaryIfNeeded` 45882~45893, `mkItem` 유골함 분기 16155~16166, `renderOssPanel`, CSS `#invOssuaryPanel`/`#invOssAncestor`(`ui-refinement.css`). 웹 캡처 `_out/pc-u04b/web_inv_ossuary.png`, 레이아웃 덤프 `web_ossuary_layout.json`.
브랜치 `claude/unity-pc-inventory-u04-20261026`, 베이스 `5146c0f7a`. 커밋은 맥북 총괄이 검수 후 한다(이 작업은 커밋 안 함).

## 1. 데이터

| 항목 | 값 |
|---|---|
| 아이템 | `전대의 유골함` slot ossuary, rarity 5, tier 0, el 0, eDef 60, bonusMp 150, ancPow .25, affixes `[ancHP tier3 .9]`, `_implicitStat _iAncPow` 10, reqLv 0, socketCount 0, anc iron_warlord, unique true |
| 지급 시점 | 웹: 첫 프레임 `_grantOssuaryIfNeeded` → `applyStats`. Unity: 시드 `equipped[15]`에 포함(oracle이 원본 함수를 그대로 실행해 추출) |
| 자원 | 현재 MP는 지급 전 값 그대로, 최대 MP만 +150 (원본 clamp 정책). `SourceStarterFixture` 미변경 |
| 플레이어 스탯 영향 | `bonusMp` 150만. eDef·ancPow·ancHP·_iAncPow는 스탯에 들어가지 않음(원본 oracle 대조로 확인) |
| 전투력 | 1611 → 1656 (mmp x0.3 = +45), 기대와 일치 |

| 변경 파일 | 요지 |
|---|---|
| `Tools/inventory-oracle/export.cjs` | 가방 10개(887 draw) 뒤 `_grantOssuaryIfNeeded` 실행. `LEGENDARY_SPECIAL`/`UNIQUE_SPECIAL` 표 추출 추가(mkItem rarity5 롤 경로), `_rarName` stub. RNG 경계 505/887 검사 유지, 유골함 draw 수는 `ossuaryGrantDraws`로 별도 기록(930 총). unequip-ossuary 케이스에 `deferred` 표식 |
| `Tools/inventory-oracle/Program.cs` | 15 장착 + 가방 10 검사 유지(유골함 제외 15), 유골함 16번째 검사, `deferred` 케이스 처리, 유골함 거부 검사 4개 추가 |
| `Tools/inventory-oracle/{oracle,inventory-seed}.json`, `Resources/Data/inventory_seed.json`, `inventory_empty_slots.json` | 재추출(시드 바이트 동일 복사), 빈 슬롯 `[8,15]` → `[8]` |
| `Core/InventoryState.cs`, `InventoryData.cs` | `Admitted`가 원본 고정 유골함만 허용(rarity 5, tier 0, ancHP tier 3 단일, `_iAncPow`). 가방 항목·`TryEquip`·`TryUnequip`의 유골함은 거부(해제/재장착 미구현). `AffixUnit` ancHP = pct. 데이터 필드 `anc`/`unique`/`ancPow` 추가 |
| `Tools/stat-parity/*` | 웹 세이브 2개의 실제 유골함을 `equipped[15]`에 넣고 `ossuaryBonusMp` 별도 가산 제거 |

## 2. UI

| 항목 | 내용 |
|---|---|
| 하위 탭 | "장비"/"유골함" 클릭 전환(활성=붉은 배경). 전환 시 선택 해제(웹 `_invChangeCategory`). "유물"/"보관함"은 표시만 |
| 창 | 유골함 페이지는 창이 x518 w1390으로 좁아지고 상단 탭·머리줄·하위 탭이 같은 비율로 이동. 배경에 sigil(620px, center -150px) |
| 왼쪽 | 가방 머리 "가방 (0/300)"(유골함 범주 0개), 정렬/최대, 접힌 필터, 37px 10열 그리드(120행 스크롤바), "유골함 정보" 상자 |
| 가운데 | "선대의 유골 콜렉션" + "수집 0 / 4", 제단 링, 가운데 유골함 노드(urn), 두개골/팔/몸통/다리 노드(미수집), "철갑 전대 [유골 수집 중]", 안내 상자, 힌트, 버튼 2개 |
| 오른쪽 | "소환 전대 1 / 1", 초상, ANCESTOR · 01 / 철갑 전대 / 유골 수집 중 / 0 / 4 / 안내문 |
| 캡처 진입 | 명령줄 `--unity-inventory-page ossuary`가 있으면 창을 열 때 유골함 페이지(없으면 장비). 유골함 페이지에서는 Tab/Esc만 동작 |
| 아트 | `Resources/Art/ui/inventory/ossuary/` 10장. 모두 웹 원본에서 `Tools/inventory-ossuary-bake/bake.py`로 1회 구움(CSS filter/gradient/drop-shadow 적용, 생성 이미지 0). 소스: altar_hf_v2, socket_hf_v2(기존 socket.png와 바이트 동일), ossuary_phys, bone_*.png, iron_warlord_portrait, blackiron/sigil |
| 공용 수정 | `RotateAroundPivot`은 스케일/오프셋과 그룹 안에서 피벗이 틀려(1920x1080이 아닌 창, 스크롤 영역) 선과 마름모가 어긋남. 선은 로컬 행렬 회전, 마름모는 텍스처로 교체 |

## 3. 검사 결과

| 검사 | 결과 |
|---|---|
| inventory-oracle (`u04b-01`) | 892 checks / 0 failures. 이전 909에서 감소: unequip-ossuary 24개(원본 해제 결과 비교, 유골함 해제 미구현이므로 `deferred`로 "Unity가 거부하고 상태 불변" 2개로 대체) 제거, 새 검사 7개 추가. 다른 검사는 삭제/약화 없음 |
| stat-parity | 2/2 MATCH (HP/MP/ST/Shield, 유골함 별도 가산 없음) |
| inventory-navigation | 34/34 PASS |
| Win64 빌드 | receipt passed:true, errors 0 |
| 스모크 | 장비 페이지 1회, 유골함 페이지 1회. `initialEquipped` 15→16(유골함), `maxHp` 526(변화 없음), 나머지 필드 동일. 최대 MP는 스모크 receipt에 필드가 없어 stat-parity/oracle(`PlayerMaxMana` 480)로 확인. 필드 추가 패치는 `_out/pc-u04b/nativegame.patch`(미적용, 적용 가능성만 `git apply --check`) |

## 4. 남은 차이

| 번호 | 차이 |
|---|---|
| O-1 | 전투력 등 수치 차이는 무작위 롤(웹 세이브와 Unity 시드 아이템이 다름) |
| O-2 | 가방 그리드 칸 질감: 웹은 칸마다 iron 질감 + 큼직한 마름모, Unity는 단색 그라디언트 + 마름모 윤곽 |
| O-3 | 정렬 버튼 화살표는 선으로 근사(웹은 ↕ 글리프) |
| O-4 | 제단 노드 테두리 고광택 부분이 웹보다 약간 어두움(밝은 8% 평균 110 vs 93) |
| O-5 | 창 밖 배경은 웹 캡처가 어두운 별도 장면이라 비교 불가(Unity는 실제 게임 장면 + 덮개) |
| O-6 | 폰트: Noto Serif KR이 없어 웹과 같은 Nanum Myeongjo 사용(웹 JSON도 Nanum 보고), 굵기는 합성 볼드 |

## 5. 미구현

| 항목 | 비고 |
|---|---|
| 유골함 해제/재장착, "유골함 해제" 버튼 동작 | 버튼은 웹 모양만, 동작 없음. 원본 해제 결과(oracle `deferred`)는 구현 시 다시 대조해야 함 |
| 뼈 부위 수집(INV.ossCollect), 호버 정보, 선택 유골 해제, 우클릭 해제 | 시작 상태 "미수집"만 |
| 전대 소환, 전대 위력/ancHP 계산 | 전투 반영 없음 |
| 가방의 유골함 범주 아이템 | 가방 개수 0 고정 |
| "유물", "보관함" 하위 탭 내용 | 표시만 |

2026-10-30 PC 현행 시각 자산·은빛 팔레트·Linear 글자 보정은 [Unity UI 원화 반영](UNITY_UI_ASSETS_20261030.md)을 따른다. 기능·저장·미이식 범위와 위 검수 이력은 유지하며, 현재 원화의 실제 Player 결과는 해당 문서의 정확 후보 영수증으로 구분한다.
