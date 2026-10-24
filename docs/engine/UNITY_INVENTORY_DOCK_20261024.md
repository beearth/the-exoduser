# UNITY-UI-DOCK-01 — 인벤토리 연속 외곽과 화면 고정

2026-10-24 PC Codex. 사용자 요구는 기존 UI가 화면에서 떠 있는 인상을 줄이고 화면 가장자리에 닿는 일체감을 만드는 것이다. 기존 `iron/socket/knight` 원본과 로비용 정적 한글 폰트를 재사용한다. 타 게임 고유 아트·신규 이미지 생성은 없다.

소유는 `NativeInventory.cs`, 신규 `NativeInventoryDock.cs/.meta`, 본 문서 및 `UNITY_INVENTORY_20261024.md`의 추가 절이다. NativeHud/NativeLobby/NativeGame/Editor/core 계산/세이브는 이 작업자가 수정하지 않는다.

## 현재 결과 확인과 변경 이유

실제 이전 Player의 `I:/EXODUSER-Storage/qa/unity-inventory-20261024/inventory-player-2026-10-24T10-48-28-959Z/unity-inventory-bag.png`를 검토했다. 외곽12px 여백과3개 독립 Panel·12px 열 사이 틈·Thin 글꼴이 별도 카드3장을 올려둔 인상을 만든다. 원본 socket1024×1024, iron1254×1254, knight688×1024도 직접 확인했다. 별도 품질검토의 alpha 측정상 knight x187..495/y74..919로, 원본 전체 사각형385×560만 확대하면 실제 실루엣 폭은 약169px에 그친다.

| 요소 | 새 구현 |
|---|---|
| 바탕 | 하나의 iron 표면이 화면 좌상단0,0부터 실제 가로·세로 끝까지 이어짐. 외곽12px 여백 제거 |
| 상단 | 공통 제목32px, 조작 안내17px, 닫기 버튼112×42. 제목/안내 영역높이112+구조선7, 열 머리119..194 |
| 내부 |3개의 개별 Panel/카드테두리 삭제. 장착·가방·상세가 같은 바탕을 공유하고10px 금속 rail로만 구획 |
| 하단 | 실제 높이−60부터 화면 끝까지 공통 상태선60px. 교체/이동/정리 메시지와 저장 미연결 안내 유지 |
| 기본 폭 | 논리1920 기준 장착720/가방600/상세600. ultrawide 여분을38%/32%/30%로 나눔 |
| 배율 | min(actualWidth/1920,actualHeight/1080). logicalWidth/Height=actual/scale. 가운데 letterbox 대신 화면0원점에서 전체 화면으로 연속 확장 |
| 종이인형 | 원본654×560 슬롯 좌표, hit96×96·아이콘62×62·socket128×128 유지. 배율max1.02, 열 중앙에 배치 |
| 기사 | 원본 alpha bbox만 UV crop, 원본픽셀/종횡비 유지. 논리높이600, 폭600×309/846≈219.15. cropUV=(187/688,104/1024,309/688,846/1024) |
| 장비 라벨 | 고정18px SemiBold, 96hitRect 내부 y68..96/높이28의 어두운 띠. 원본62×62 아이콘은 y6..68에 표시. padding/margin/contentOffset0, Overflow로 한글의 높은 line metric이 잘리지 않게 함 |
| 가방 | viewport x=열시작+24,y210,w=열폭−48,h=footerTop−232. cell=(viewportWidth−22)/10. 10열/120행과2×2 아이템 수치는 그대로 |
| 가방 이름 | 고정18px로720p에서 물리12px 유지. 높이30/패딩0으로 글자 세로 잘림 방지. 폭 초과 시 말줄임, 선택 상세에는 전체 이름25px 표시. 원본 item.name은 변경하지 않음 |
| 본문/버튼 | 원본 정적 Regular20px·SemiBold18px. title26/32px. Thin variable 기본값 대신 이미 있는 NativeLobbyNotoSansKR-Regular/SemiBold를 재사용 |
| 글자 높이 | label padding/margin/contentOffset0 및 Overflow. 상세 수치/implicit/affix 행 간격은 고정26px 대신 GUIStyle.CalcHeight로 실제 글자 높이를 반영 |
| 장착 능력치 띠 | footerTop−178에서 HP/DEF·MP/ST·Shield현재/최대 표시. 기존 stat 계산을 읽기만 하며 현재자원을 변경하지 않음 |

## 해상도별 설계 좌표

아래는 production의 배치 공식에서 얻는 설계 좌표이며 실제 새 Player PNG 검수 결과를 뜻하지 않는다.

| 실제 화면 | 균등배율 | 장착/가방/상세 물리폭 | 공통 하단 상태선 | 주 본문 / 슬롯·가방 이름 물리글꼴 |
|---|---:|---|---|---|
|1920×1080|1|720 /600 /600|y1020..1080|20 /18|
|1280×720|2/3|480 /400 /400|y680..720|13.33 /12|
|2560×1080|1|963.2 /804.8 /792|y1020..1080|20 /18|

## 입력과 기능 경계

기존 `HandleItem`, `Equip/Unequip`, `Move/Sort`, 모델 계산은 그대로 사용한다. scroll viewport 밖 MouseDown guard를 유지한다. BeginScrollView 내부 MouseUp 좌표를 새 cellSize로 나눠 동일한 `DropAt`에 전달하며, 원본 중심 정렬 round/clamp는 변경하지 않는다. 좌표계의 배율·스크롤 반영은 IMGUI의 동일 matrix/scrollview 영역 안에서 처리한다. 상세의 장착/해제 버튼도 같은 핸들러를 사용한다.

TAB/ESC/시뮬레이션 pause/resume·저장·아이템 수치·어픽스 허용 범위는 무변경이다. 원본 어픽스20개와 정적4종 외 **전투 효과 미이식** 표시는 유지한다. 석궁/무기 등 선택 상세 수치·현재자원 min 계약도 그대로다. 화면 전용 클래스에 개발용 진단 문구나 새 옵션을 추가하지 않는다.

## 근거와 남은 검수

| 단계 | 상태 |
|---|---|
| 변경 전 보존 | `I:/EXODUSER-Storage/qa/unity-ui-dock-20261024/NativeInventory-before.cs`, `UNITY_INVENTORY-before.md` |
| 이전 실제 PNG/원본 아트 | 직접 열어 검토. 위의 분리감·기사 투명 패딩·Thin 문제를 확인 |
| 소스 확인 | docs 전체에서 인벤토리/장비판/소지품/_invGrid/NativeInventory/UI dock 관련 문서를 검색. 웹 기획값은 바꾸지 않고 Native 시각 규격만 별도 기록 |
| 새 실제 검수 | 부모의 SPEC→QUALITY→통합 복구점→Editor/Windows Player·1920/1280/2560 PNG 검수 대기 |
| 입력 위험 | 새 viewport/동적 cellSize에서 좌표 변환·scroll 끝행·드래그 해제·우클릭·닫기 pause/resume을 부모가 다시 확인해야 함. 버튼 위/가방 viewport 밖 release의 기존 동작을 임의 변경하지 않음 |
| 시각 한계 | 새 코드만으로 새 visual PASS를 선언하지 않음. 실제 화면에서 글자 잘림/기사 겹침/아이템 가독성·공유 rail/가장자리 밀착 확인 필요 |

**VISUAL VERDICT: RETOUCH / 새 Player 검수 대기.** 직접 빌드·Player 실행·스테이징·커밋은 하지 않았다.
