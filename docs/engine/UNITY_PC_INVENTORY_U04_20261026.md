# Unity 인벤토리 U-04 웹 이식 (PC, 2026-10-26)

기준: 웹 `#invPanel` 장비 페이지(1920x1080), 원자료 `_out/pc-unity-win/web_inv/inventory_layout.json`. 명세 `_out/pc-unity-win/INV_PORT_SPEC.md`.
브랜치 `claude/unity-pc-inventory-u04-20261026`. 개선·재디자인 없이 웹 배치 그대로 IMGUI로 다시 그렸다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `Runtime/NativeInventoryDock.cs` | 그리기 전체 교체. 1920x1080 설계 공간(가운데 정렬 스케일), 창/탭/머리줄/장비 패널/가방/오른쪽 패널/하단 줄 |
| `Runtime/NativeInventoryWebLayout.cs` (신규) | 그라디언트·원광·9-slice 테두리·벡터 선·텍스트 스타일·플레이트 버튼 도우미 |
| `Runtime/Core/InventoryCombatPower.cs` (신규) | 웹 `calcCP`(game.html 49489~49511) 원문 이식 |
| `Runtime/NativeInventory.Keyboard.cs` | `RevealSelection` 칸 크기 52.2→56, 보이는 높이 386→672 (새 그리드에 맞춤) |
| `Runtime/NativeGame.cs` | 스모크에 선택 없는 기본 상태 캡처 `unity-inventory-default.png` 추가 |
| `Resources/Art/ui/inventory/` | `plate`(웹 button.webp), `rail`(웹 frame.webp), `window_frame`(웹 blackiron/frame.png 1024 축소), `iron_320`/`iron_480`(웹 iron.png 타일 크기별 축소본) |

`iron.png`·`knight.png`는 웹 원본과 바이트 동일 확인(교체 불필요).

## 이식한 항목

| 영역 | 상태 |
|---|---|
| 화면 덮개, 창(iron 320 타일 + 그라디언트 + blackiron 프레임 60px) | 이식 |
| 상단 탭 5개 (설정/인벤토리 활성/대장간/스킬/능력치) | 이식, 표시 전용 |
| 머리줄: 전투력, 전투력 값, 공격/방어/추가 분해 3값(벡터 아이콘), 악의, 닫기 | 이식 (닫기 동작 유지) |
| 하위 탭 4개 (장비 활성, 유골함/유물/보관함) | 이식, 표시 전용 |
| 장비 패널: 장착 중, 기사, 슬롯 16칸 웹 배치·웹 캡션, 하단 현황 3칸 | 이식 (우클릭 해제, 선택 테두리 유지) |
| 가방 패널: 머리 막대, 개수/300, 정렬 버튼, 최대, 접힌 필터 줄 | 이식 (정렬 동작 유지) |
| 가방 그리드 56px x 10열 x 12행 보임, 스크롤, 2x2 아이템(위력 배지, 희귀도 점/테두리/이름) | 이식 (드래그 이동, 우클릭 장착 유지) |
| 오른쪽 패널 기본 상태(수치 4상자 + 장착 목록 8행) | 이식 |
| 아이템 선택 시 오른쪽 패널 | 기존 `DrawDetails`(상세/비교) 그대로, 패널 안에 배치 |
| 하단 줄 + "전체 쓰레기 지정 (N개)" | 이식. 웹 `invJunkSelBtn` 규칙: N=쓰레기·즐겨찾기 아님 개수, 0이면 숨김, 클릭 시 즐겨찾기 아닌 가방 아이템 전부 `junk=true` |
| 키보드 도움말·상태 메시지 줄 | 화면에서 제거(키보드 동작은 유지) |

전투력 항: STATS(str/dex/int/lck 합 x2)와 PASSIVES(합 x15)는 Unity에 아직 없어 0(코드 주석 명시). `baseDef`는 장비 def를 포함하지 않는다(game.html 27923 `P.baseDef=2`, 27944 `+= crystal def + defFlat + grit*.5`). 그래서 `PlayerPhysicalDefense - (장착 중 shield/armor/boots/gloves/pants def 합)`을 쓴다(초안은 장비 def를 두 번 더해 방어 714가 나왔음, 수정함).

## 검증

- 빌드 receipt `passed:true, errors:0` (Unity 6000.4.8f1, Win64).
- `--unity-inventory-smoke` 캡처 4장 `_out/pc-unity-win/caps/inventory-u04/` (default/equipment/swap/bag), 스모크 JSON 동작 필드 기존과 동일.
- 비교 이미지 `_out/pc-unity-win/cmp/inventory_u04.jpg` (왼쪽 웹, 오른쪽 Unity), 1x 크롭 3장 `cmp/inventory_u04_crop_equip.jpg`, `_crop_bag.jpg`, `_crop_right.jpg`.

## 남은 차이

| 번호 | 차이 | 원인/비고 |
|---|---|---|
| R-1 | 전투력 1611(144/420/1047) vs 웹 1692(200/408/1084) | 시드 아이템이 웹 세이브와 다름(가방 위력 1748 vs 1714, 팔찌 "악마의" vs "생명의" 등, 공격 144 vs 200도 같은 이유). baseDef 수정 후 방어 714→420으로 웹 408에 근접 |
| R-2 | 가방 아이템 순서/구성이 웹과 다름 | 같은 시드 문제. Unity 가방은 위력순 정렬 결과 |
| R-3 | 가방 머리 막대 질감이 웹보다 어둡고 매끈함 | 웹은 iron 나뭇결이 더 보임. 타일 스케일/투명도 미세 조정 여지 |
| R-4 | 정렬 버튼 화살표 모양, 최대 상자 테두리 | 웹은 단일 양방향 화살표 글리프, Unity는 선 두 개로 근사 |
| R-5 | 가방 칸 중앙 마름모가 웹보다 흐림 | 알파 .10 → 웹은 더 진함 |
| R-6 | 슬롯 아이콘 선명도 | 웹 아이콘 소스가 더 선명, 슬롯 안쪽 회색 면 톤 미세 차이 |
| R-7 | 아이템 테두리 둥근 모서리 | 모서리 3px 근사(RoundBox) |
| R-8 | 오른쪽 패널 글로우·그라디언트 톤 | 웹 값이 잘려(truncated) 근사값 사용 |
| R-9 | ~~열 때 첫 가방 아이템이 자동 선택됨~~ **해결(PC-U04-INTEG)** | 웹 `openPanel`이 열 때 `INV.selected=null`(game.html:44052). `InventoryNavigation.Open()`을 선택 없음으로 바꿨고, 키보드 첫 입력이 그리드 첫 칸을 선택한다 |
| R-10 | 쓰레기 지정된 아이템의 표시 | 웹 표현 미확인, Unity는 표시 없음(정렬 순서에만 반영) |

## 미이식

| 항목 | 상태 |
|---|---|
| 유골함/유물/보관함 탭 내용 | 표시만, 클릭 무반응 |
| 상단 탭(설정/대장간/스킬/능력치) 전환 | 표시만 |
| 아이템 필터 펼침 | 접힌 줄만 |
| STATS / PASSIVES 전투력 항 | 0 |
| 유물 홈 수치 | 0 / 0 고정 |
| 악의 수치 | 웹 캡처값 1000 고정 표기 (Unity 재화 연동 없음) |
| 마우스 오버 비교 미리보기(웹 `inv-hover-preview`) | 없음 |

## PC-U04-INTEG (2026-10-26)

전체총괄 배정(사용자 확정 "UI는 일단 그대로 이식"). Codex의 양측 도킹 배치(UNITY_UI_COMPOSITION_20261024)는 웹 배치로 대체한다.

| 항목 | 결과 |
|---|---|
| merge | 최신 `origin/codex/unity-mac-20261024`(f357dc3a4)와 `claude/unity-pc-stat-parity-20261026`(1c270003a)를 merge(rebase 아님). 충돌 0 |
| R-9 | `Core/InventoryNavigation.cs` `Open()` = `Select(null)`, 가방 pane, fence. 검사 `Tools/inventory-navigation` 갱신(열 때 null, 첫 Right에 그리드 첫 칸) |
| .NET | inventory-navigation 34/34, inventory-oracle 909/0, stat-parity 2/2 |
| Windows 빌드 | Unity 6000.4.8f1 Win64 `passed:true, errors:0` |
| 스모크 | `--unity-inventory-smoke` 1회. 동작 필드는 이전과 같고 `resumed`만 false→true(`NativeGame.cs` Running 조건의 포커스 상태, 선택 상태와 무관, 원인 미확인). 스모크 뒤 메뉴 대기로 프로세스가 스스로 끝나지 않아 240초에 종료 |
| 비교 | `unity_pc_win_refs/inventory_integ.jpg`(왼쪽 웹, 오른쪽 Unity, 수치 차이=무작위 롤). 1x 크롭 3장은 `E:/exoduser-wt/_out/pc-u04-integ/cmp/` |
| 판정 | 열자마자 오른쪽 패널이 웹과 같은 기본 상태, 가방 선택 표시 없음. 창·탭·슬롯 틀은 같은 게임으로 보임 |

INTEG 뒤 남은 미세 차이(이번 범위 밖, 수치·아이템 배치는 무작위 롤이라 제외):

| 번호 | 차이 |
|---|---|
| R-11 | 기사 그림이 웹보다 어둡고 채도가 낮다. 웹 발밑 타원 글로우가 없다 |
| R-12 | 가방 아이템 이름 줄 색: 웹 초록 계열, Unity 회색 |
| R-13 | 가방 오른쪽에 Unity만 세로 스크롤바가 보인다 |
| R-14 | 오른쪽 패널 설명문 줄바꿈(웹 두 줄, Unity 한 줄), "장착 목록" 아래 구분선이 Unity에서 희미함 |
| R-15 | 머리줄 전투력 숫자·아이콘이 웹보다 작다, 하단 현황 줄 간격 미세 차이 |

## PC-U04c 미세 차이 마감 (2026-10-26, 분모 A08)

웹 수치는 격리 서버에 headless로 붙어 계산 스타일로 확보했다(프로브 `E:/exoduser-wt/_out/pc-u04c/probe/`).

| 번호 | 웹 근거 | Unity 변경 | 판정 |
|---|---|---|---|
| R-11 기사 | `img.inv-eq-sil` filter `brightness(1.65) contrast(1.02) drop-shadow(#000 0 8px 12px)`, 발밑 `#invEqGrid::before` 204×26 타원 `radial-gradient(rgba(176,142,96,.19),transparent 70%)` | `NativeInventory.BakeKnight()`로 필터·그림자를 한 번 구워 그림(실패 시 원본 폴백), 타원 글로우 동일 수치 | 일치 |
| R-12 희귀도 색 | `RARITY_C` game.html:14350, 이름색 50315 (`RARITY_C+'88'`, 유니크 `#d9b8ffdd`), 점 50318. 인라인 3px 왼쪽 테두리는 2169-2171 `!important` 1px 규칙에 덮여 실제로 안 보임. 프레임은 `.iskin.rN` 891-896 | 6색 표, 이름 알파 .533, 희귀도별 프레임·글로우, 점 1px `#090909` 테두리, 이름 서체 나눔명조 | 색값 일치. 이름이 1x에서 아주 조금 가늘게 보임(서체 렌더링) |
| R-13 스크롤바 | `#invGrid` `overflow-y:auto`(552), ui-refinement.css:460 `scrollbar-width:thin; scrollbar-color:#7c6f58 #121113`, 10px 거터. 그리드가 항상 넘쳐 웹도 스크롤바가 보인다(기존 웹 캡처는 headless `--hide-scrollbars`라 안 보였음) | 트랙 10px·썸 6px·화살표를 같은 수치로, 넘칠 때만 그림. 휠·썸 드래그 유지 | 일치 |
| R-14 오른쪽 패널 | 설명 `<p>` 12px, 줄높이 20.4, 폭 360 → "확인합니/다." 두 줄. 구분선 `1px solid #69563a` y465 | 같은 위치에 두 줄로 끊음(IMGUI 폭 측정 차이 때문에 이 문장만 하드 브레이크), 구분선·자간 웹 값 | 일치 |
| R-15 머리줄·하단 | `#cpVal` 21px/600 + `text-shadow 0 0 8px rgba(255,200,0,.3)`, 분해 아이콘 12×12 SVG | 글로우 추가, 아이콘 웹 path 선 그리기, 하단 3칸 구분선 x·알파·y 웹 값 | 대체로 일치(아이콘 안티앨리어싱 없음) |

- `resumed` false→true: `NativeGame.cs` `Running=gameFocused&&inventoryWasRunning&&!menu&&Hp>0`. 코드 변화가 아니라 스모크 창 포커스 상태에 따른 값이다. 의도된 변화가 아니며 판정에 쓰지 않는다.
- 빌드: Win64 6000.4.8f1 `passed:true, errors:0`(수정 1회 + 아이콘 선 보정 1회, 2회 빌드). 스모크 1회: 동작 필드 전부 true.
- 비교: `unity_pc_win_refs/inventory_u04c.jpg`, 1x 크롭 4장 `E:/exoduser-wt/_out/pc-u04c/cmp/`.
- 남은 미세 차이: "장착 중" 라벨 약간 아래, 가방 전투력 배지 배경·위치, 오른쪽 패널 나머지 텍스트 1~2px 아래, 작은 라벨 일부가 아직 Noto Sans(웹은 나눔명조).

2026-10-30 PC 현행 시각 자산·은빛 팔레트·Linear 글자 보정은 [Unity UI 원화 반영](UNITY_UI_ASSETS_20261030.md)을 따른다. 기능·저장·미이식 범위와 위 검수 이력은 유지하며, 현재 원화의 실제 Player 결과는 해당 문서의 정확 후보 영수증으로 구분한다.
