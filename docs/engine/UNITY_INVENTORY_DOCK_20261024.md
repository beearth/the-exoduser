# UNITY-UI-DOCK-01 — 인벤토리 연속 외곽과 화면 고정

> 2026-10-24 정정: 아래는 이전 후보의 제작·검수 이력이다. 전체폭 도킹은 최신 사용자 중앙 HUD·양측 인벤토리 방향으로 교체 중이며 전체 디자인 인수는 미완료다. [현행 설계](UNITY_UI_COMPOSITION_20261024.md).


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
| 새 실제 검수 | SPEC/QUALITY PASS 뒤 실제3해상도PNG·기존동작 fixture PASS. 아래 통합검수완료 기록 참조 |
| 입력 위험 | 새 viewport/동적 cellSize에서 좌표 변환·scroll 끝행·드래그 해제·우클릭·닫기 pause/resume을 부모가 다시 확인해야 함. 버튼 위/가방 viewport 밖 release의 기존 동작을 임의 변경하지 않음 |
| 시각 한계 | 새 코드만으로 새 visual PASS를 선언하지 않음. 실제 화면에서 글자 잘림/기사 겹침/아이템 가독성·공유 rail/가장자리 밀착 확인 필요 |

구현자 인계 당시 VISUAL RETOUCH는 아래 부모 실제시각검수의 이번도킹 PASS로 갱신한다. 직접 빌드·Player 실행·스테이징·커밋은 하지 않았다.

## 실제 통합 검수 완료 — 화면 도킹 범위

| 항목 | 실제 근거 / 경계 |
|---|---|
| 빌드 입력 | local270d4da469d2f90b3daad3811b2d7e7ab38ec10b / remote5bba72053f0fdcf567913486f1d9b69b1a0fffdf, 동일tree d0ca74ced914feae2e807d8d1296615704bbb196. I:격리 캐시 프로젝트로489파일414,868,255B를 복사 전후/대상SHA256 대조 |
| 실제 빌드 | build-2026-10-24T12-17-56-439Z, Unity6000.4.8f1 Succeeded/오류0/1,427,063,521B. Development 연결 없는 일반 빌드 |
| 실제 화면 | 1920×1080·1280×720·2560×1080 각각 HUD full/partial/empty 및 인벤 equipment/swap/bag. 실제 PNG18장 헤더에서 요청 해상도 일치 확인. suite.json:6런PASS, HUD각6검사/인벤각10검사. OS직접입력 검수가 아님 |
| 기능 보존 | GPU 원형clip·HP/MP/ST·숫자·기검참 아이콘, 동일 장착/해제/이동/정리 핸들러·중앙/끝 drag clamp·자원min·pause/resume 확인. 테스트용 API 호출과 실제 mouse/key 입력은 구분 |
| 독립 검토 | review/spec-implementation.md, quality-implementation.md 각PASS. 최종 실제PNG7장 직접 시각검토: review/visual-implementation.md. 이번도킹 VISUAL VERDICT: PASS, 추가차단P1/P2없음 |
| 실패 기록 | 최초 hud-1920x1080-2026-10-24T12-19-08-746Z는 QA런처 windowsHide=true→HWND0/검정PNG/아이콘FAIL. 생산코드는변경하지않고 QA런처 windowsHide=false만수정, 새12:19:54런부터 정상. 실패본은 I:에보존 |
| 실행 반영 | E:/EXODUSER-Unity-Play/EXODUSER-Unity.exe. 기존 자기 검수Player26072만정상종료, 이전152파일이 I:이전빌드와동일함을확인후 새152파일복사·전SHA대조. LIVE.json기록. 기존사용자Editor34780/세이브/Godot/웹/공유INDEX보존 |
| 재생 경계 | 이번변경은NativeGame.OnGUI의 HUD배치와NativeHud/NativeInventory. Awake/Update/FixedUpdate/SetInventory/ResetRun 및인벤9메서드총14개는이전과동일, NativeLobby/NativeLobbyVideo/Core는무변경. 기존INTRO-PASS.json은당시5526→33cb완주기록이며새NativeGame전체SHA동일주장으로확대하지않음 |
| 남은 범위 | 실제OS hover/클릭/스크롤/드래그·게임패드·전체해상도/현지화·HUD작은MP/ST/max글자·전체UI/전체게임인수는별도. 이번도킹PASS가전체UI/인트로재완주PASS는아님 |

모든 상대 검수 경로는 I:/EXODUSER-Storage/qa/unity-ui-dock-20261024 기준이다. 최종 로컬/원격tree·복구bundle·기존공유상태는 SAVED.json에 기록한다.


2026-10-25 후속: 양측 도킹에 선택/착용 장비 비교와 상세 탭, 별도 일시정지·설정 화면 연결. 현재 구현과 실제 통합 검수는 [장비 비교·설정](UNITY_MAC_INVENTORY_SETTINGS_20261025.md)을 따른다. 전체 비교·전체 설정 이식 완료라는 뜻은 아니다.


## 2026-10-31 안전 영역 후속

현행 UI는 논리1920×1080을 중앙16:9 안전 영역에 균등 fit한다. 초광폭 여분으로 구슬·받침·상태판·인벤 열을 확장하지 않는다. 위 과거 전체폭 좌표/검수는 이력이며 현행 위치식은 origin+logical×min(W/1920,H/1080)이다. 16:10에는 위아래80px(2560×1600), 32:9에는 좌우960px(3840×1080) 순검정. 5개 해상도·파일명 W×H·글자 검사/실제 입력·검수 상태는 [현행 안전 영역 계약](UNITY_UI_ULTRAWIDE_20261031.md)을 따른다.
