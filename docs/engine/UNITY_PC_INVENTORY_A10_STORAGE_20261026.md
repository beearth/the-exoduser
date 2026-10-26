# PC-A10 인벤토리 "보관함" 하위 탭 (`#invStorageCol`) Unity 이식 — 2026-10-26

기준: 웹 `game.html` `renderInvStorage` 48555~ · `ui-panels.js` 165-185(보관함 페이지에서 가방 영역을 `#invCenter`로 이동) · `ui-refinement.css`. 베이스 `cc39eb672`(A14 대장간 merge 포함). 원칙: UI는 웹 그대로, **정의=웹 / 상태=Unity에서 읽고 없으면 "미이식"**.

## 1. 파일

| 구분 | 경로 | 내용 |
|---|---|---|
| 신규 | `unity/Assets/Exoduser/Runtime/NativeInventoryStorage.cs` | 보관함 페이지(왼쪽 가방 열 + 보관 목록, 오른쪽 지옥창고 열) |
| 수정 | `NativeInventoryDock.cs` | 하위 탭 4개 모두 활성, 가방 격자 뷰포트를 필드화(`GridX/Y/ViewW/ViewH`: 장비 페이지 780,294,588x672 / 보관함 213,283,572x529), 보관함 페이지 연결 + 하단 "전체 쓰레기 지정" 줄 |
| 수정 | `NativeInventoryOssuary.cs` | `--unity-inventory-page storage` 인식, 열 때 보관 목록 스크롤 초기화 |
| 신규 art | `Resources/Art/ui/inventory/storage/slot_*.png` (17) | 웹 `_slotGlyph` 슬롯 아이콘(흰색 선, 보관 목록 아이콘) — 웹 SVG 렌더 |
| 신규 도구 | `unity/Tools/inventory-storage-web/` | `cap_storage_web.cjs`(캡처·DOM 덤프·글리프), `mk_cmp.py` |

생성 이미지 없음.

## 2. 웹 구조(추출)

| 항목 | 값 |
|---|---|
| 창 | 장비 페이지와 같은 전체 폭·본문 802 (유골함·유물 페이지의 858과 다름), 하단 `전체 쓰레기 지정 (n개)` 줄 유지 |
| 왼쪽 `#invCenter` | x43 y183 w912 h800 (6px 레일). 머리 (59,197,880x34) `가방 (n/300)` · 정렬 · 최대, 필터 줄 (59,239,880x32), 가방 격자 (213,283,572x529, 10열 56px 칸, 스크롤), 보관 섹션 (59,820,880x147) |
| 보관 섹션 | `▼ 보관 (가방 N개)` + 30px 행(슬롯 아이콘 14px, 희귀도색 이름 12px, 오른쪽 `보관`), 스크롤(내용 30·N, 보임 112) |
| 오른쪽 `#invStorageCol` | x965 y183 w912 h800. 토글 바 (983,199,876x37) `지옥창고 ▼`, `지옥창고 — n/200` 줄(y244), 격자 6열 140px 칸(피치 146, y274~). 웹은 보관 아이템 + min(200−n, 12)개 빈 칸을 그림 |

## 3. 상태 표

| 항목 | 웹 | Unity |
|---|---|---|
| 가방 (n/300), 격자·아이템·정렬·선택 | 가방 상태 | Unity `InventoryState.Bag` (장비 페이지와 같은 그리기 재사용) |
| 보관 (가방 N개) 목록 | 가방 아이템 | Unity 가방 아이템 (아이콘=슬롯, 색=희귀도) |
| 지옥창고 개수 | `0/200` | `미이식/200` |
| 지옥창고 칸 | 보관 아이템 + 빈 칸 12 | 빈 칸 12개만 (창고 개념 없음) |

미이식(모양만): 보관/빼기 클릭, 창고 확장, 층 이동, 지옥창고 접기 토글.

## 4. 검증

| 검사 | 결과 |
|---|---|
| inventory-navigation | 35/35 |
| inventory-oracle | 892 / 0 |
| stat-parity | 2/2 MATCH |
| Win64 빌드 (A14 merge 트리 첫 전체 빌드) | errors 0 |
| 보관함 스모크 `--unity-inventory-smoke --unity-inventory-page storage` | 1회 완료 |
| 대장간 캡처 `--unity-forge-capture` | 1회: 6탭 전환·강화 칩·스크롤 PASS, 사진 12장 생성. 실패 1건 = "NativeGame has no forge field (A14 patch not applied)" — NativeGame 연결 patch가 이 트리에 아직 없어서 예상된 결과 |

비교: `E:/exoduser-wt/_out/pc-a10/cmp/` — `a10_cmp.jpg`, 1x 크롭 `a10_crop_{left,right,head}.jpg`.

## 5. 남은 차이

| 항목 | 내용 |
|---|---|
| 가방 내용 | 웹 시작 캐릭터와 Unity 시드 아이템이 다름(무작위 롤) |
| 필터 줄 | 웹 `details`는 접힘 상태 그대로(펼침은 장비 페이지와 같이 미이식) |
| 글꼴 | 나눔명조/NotoSansKR 대체 |
