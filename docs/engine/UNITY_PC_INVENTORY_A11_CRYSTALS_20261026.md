# PC-A11 인벤토리 "유물" 하위 탭 (`#invCrystalsPanel`) Unity 이식 — 2026-10-26

기준: 웹 `G:/exoduser/game.html` `renderInvCrystals` 15409~, `inventory-gems*.css`, `ui-panels.js` 165-185. 베이스 `5178c0a09`. 원칙: UI는 웹 그대로, **정의=웹에서 추출 / 상태=Unity에서 읽고 없으면 "미이식"**(작은 카운터는 "–").

## 1. 파일

| 구분 | 경로 | 내용 |
|---|---|---|
| 신규 | `unity/Assets/Exoduser/Runtime/NativeInventoryCrystals.cs` | 유물 페이지 그리기·스크롤·분류 버튼 (`NativeInventory` partial) |
| 수정 | `NativeInventoryDock.cs` | 하위 탭 "유물" 활성(`i<3`), 유물 페이지도 본문 높이 858, 페이지 그리기 연결 |
| 수정 | `NativeInventoryOssuary.cs` | `--unity-inventory-page crystals` 인식, 페이지 열 때 스크롤·분류 초기화 |
| 수정 | `NativeInventory.cs`, `NativeInventory.Keyboard.cs` | 장비 외 페이지는 열 때 선택 해제·방향키 비활성(유골함과 동일) |
| 신규 | `unity/Assets/Exoduser/Resources/Art/ui/inventory/crystals/` | `crystals_base.png`(웹 창 정지, 1836x858), `card_item.png` / `card_empty.png`(장비 카드 틀, 소켓 5개 포함), `portrait.png`(웹 기사 초상), `ossuary_skin.png`(웹 `ossuary_phys.png` 바이트 그대로) |
| 신규 | `unity/Tools/inventory-crystals-web/` | `cap_crystals_web.cjs`(캡처·DOM 덤프·정지 이미지), `mk_cmp.py` |

생성 이미지 없음 — 전부 웹 화면 요소 캡처(상태 글자·컨트롤을 숨긴 렌더)이거나 웹 원본 파일.

## 2. 웹 구조(추출)

| 항목 | 값 |
|---|---|
| 창 | 장비 페이지와 같은 전체 폭. 본문 `.inv-wrap` x42 y182 w1836 h858 (장비 페이지 802 → 858) |
| 머리 | `유물함` 제목, 오른쪽 `보유 N / 9999` 칩 (1765.8,204.5,90.3,28.5) |
| 왼쪽(885폭) | `보유 유물` + 분류 버튼 4개(전체/공격/방어/자원, y294.1 h30 w217.5), 유물 격자(y336.1 h253.8), `소켓석` 상자(y601.9 h253.8), 상세 상자(y867.7 h119.3, "유물을 선택하세요" 기본 문구) |
| 오른쪽(885폭) | `장비 부위` + `장착 f / t` 칩 + 안내문, 장비 목록(990,325.4,866x661.6, 내부 높이 1012 → 스크롤) |
| 장비 목록 | 5열(x 995 + 170.8·c) × 6행(y 329.4 + 167.82·r) 카드 162.8², 기사 초상(1165.8,497.2,504.4x834.1)이 열 2~4·행 2~6을 차지, 17개 부위 |
| 부위 → 칸 | 망토(0,0) 귀걸이1(1,0) 왕관(2,0) 귀걸이2(3,0) 유골함(4,0) / 갑옷(0,1) 목걸이(4,1) / 무기(0,2) 보조무기(4,2) / 장갑(0,3) 석궁(4,3) / 반지1(0,4) 반지2(4,4) / 부츠(0,5) 벨트(1,5) 바지(3,5) 팔찌(4,5) |
| 카드 | 이름 11px(상단 중앙), 아이템 아이콘(158.8², 밝기 .62·채도 .85 × 스킨 1.15), 소켓 5개(중앙 54.3 + 모서리 47.6, 항상 5자리, 막힌 홈 그림), 빈 칸은 불투명도 .35 + "—" |
| 바닥 | 안내문, 오른쪽 `유물 가루 N` |

## 3. 동작 / 상태 표

| 항목 | 웹 | Unity |
|---|---|---|
| 하위 탭 전환 | 장비/유골함/유물/보관함 | 유물 탭 연결(보관함은 A10 대기: 표시 전용) |
| 분류 버튼 | 전체/공격/방어/자원 필터 | 선택 표시 전환(목록이 비어 결과 변화 없음) |
| 장비 목록 스크롤 | 휠·스크롤바 드래그 | 구현(휠 ×35, 스크롤바 드래그), 목록 영역 밖은 클립 |
| 장비 카드 | 장착 아이템·부위 이름 | Unity `InventoryState.Equipped`에서 읽음. 아이콘은 Unity 아이템 아이콘, 봉안함은 웹 스킨 |
| 장착 f / t | 소켓 채움 수 | Unity 장착 아이템의 소켓 수(`SocketCounts`) = 0 / 0 |
| 소켓 5개 | 홈 수 밖은 막힌 홈 | Unity 아이템은 소켓 없음 → 5자리 모두 막힌 홈 |
| 보유 유물 N / 9999 | 유물 수 | 보유 – / 9999 |
| 유물 격자 안내 | "아직 보유한 유물이 없습니다." | 미이식 |
| 소켓석 보유·안내 | 개수·문구 | 보유 – / 미이식 |
| 유물 가루 | 수량 | 유물 가루 – |
| 상세 상자 | 선택 유물 상세 | 기본 문구("유물을 선택하세요…")만 — 선택할 유물 없음 |

미이식(모양만): 유물 장착/분리/합성, 유물 드래그, 소켓석 선택·홈 개방/승급, 유물 상세, 대장간 연결 문구.

## 4. 검증

| 검사 | 결과 |
|---|---|
| inventory-navigation | 35/35 |
| inventory-oracle | 892 checks / 0 failures |
| stat-parity | 2/2 MATCH |
| Win64 빌드 | errors 0 |
| 스모크 (`--unity-inventory-smoke --unity-inventory-page crystals`) | 1회, `inventory-smoke.json` 완료·`unity-inventory-default.png` 유물 페이지 |

비교: `E:/exoduser-wt/_out/pc-a11/cmp/` — `a11_cmp.jpg`, 1x 크롭 `a11_crop_{left,equip,head}.jpg`.

## 5. 남은 차이

| 항목 | 내용 |
|---|---|
| 장비 | 웹 시작 캐릭터와 Unity 시드 장비가 다름(수치 차이=무작위 롤 포함) |
| 글꼴 | Noto Serif KR → 나눔명조 대체 |
| 스크롤 | 웹은 끝 위치 캡처 있음(`web_cr_scrolled.png`), Unity는 스크롤 입력 구현했으나 캡처는 기본 위치만 |
| 호버/선택 효과 | 카드·소켓 호버, 호환 홈 강조는 유물이 없어 그리지 않음 |
