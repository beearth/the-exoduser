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

전투력 항: STATS(str/dex/int/lck 합 x2)와 PASSIVES(합 x15)는 Unity에 아직 없어 0(코드 주석 명시). `baseDef`는 `PlayerPhysicalDefense`(장비 def 포함)를 그대로 사용(원문의 중복 가산 동일).

## 검증

- 빌드 receipt `passed:true, errors:0` (Unity 6000.4.8f1, Win64).
- `--unity-inventory-smoke` 캡처 4장 `_out/pc-unity-win/caps/inventory-u04/` (default/equipment/swap/bag), 스모크 JSON 동작 필드 기존과 동일.
- 비교 이미지 `_out/pc-unity-win/cmp/inventory_u04.jpg` (왼쪽 웹, 오른쪽 Unity), 1x 크롭 3장 `cmp/inventory_u04_crop_equip.jpg`, `_crop_bag.jpg`, `_crop_right.jpg`.

## 남은 차이

| 번호 | 차이 | 원인/비고 |
|---|---|---|
| R-1 | 전투력 1905(144/714/1047) vs 웹 1692(200/408/1084) | 시드 아이템이 웹 세이브와 다름(가방 위력 1748 vs 1714, 팔찌 "악마의" vs "생명의" 등). 공식은 원문 그대로이므로 같은 아이템이면 같아져야 함. 방어는 baseDef 중복 가산 항 확인 필요 |
| R-2 | 가방 아이템 순서/구성이 웹과 다름 | 같은 시드 문제. Unity 가방은 위력순 정렬 결과 |
| R-3 | 가방 머리 막대 질감이 웹보다 어둡고 매끈함 | 웹은 iron 나뭇결이 더 보임. 타일 스케일/투명도 미세 조정 여지 |
| R-4 | 정렬 버튼 화살표 모양, 최대 상자 테두리 | 웹은 단일 양방향 화살표 글리프, Unity는 선 두 개로 근사 |
| R-5 | 가방 칸 중앙 마름모가 웹보다 흐림 | 알파 .10 → 웹은 더 진함 |
| R-6 | 슬롯 아이콘 선명도 | 웹 아이콘 소스가 더 선명, 슬롯 안쪽 회색 면 톤 미세 차이 |
| R-7 | 아이템 테두리 둥근 모서리 | 모서리 3px 근사(RoundBox) |
| R-8 | 오른쪽 패널 글로우·그라디언트 톤 | 웹 값이 잘려(truncated) 근사값 사용 |
| R-9 | 열 때 첫 가방 아이템이 자동 선택됨 | `InventoryNavigation.Open`(Codex 키보드 내비 설계). 웹은 선택 없음이라 오른쪽 패널이 기본 상태 대신 상세로 열림 — 총괄 판단 필요 |
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
