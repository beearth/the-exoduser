# Unity UI 화면 도킹·일체감 — 2026-10-24

> 2026-10-24 정정: 아래는 이전 후보의 제작·검수 이력이다. 전체폭 도킹은 최신 사용자 중앙 HUD·양측 인벤토리 방향으로 교체 중이며 전체 디자인 인수는 미완료다. [현행 설계](UNITY_UI_COMPOSITION_20261024.md).


사용자 최신 지시: “우리 UI도 저렇게 화면에 딱 달라붙게 일체감을 줘야하는데 너무 붕 떠있어 동시작업해바”. 첨부 PoE2 화면은 가장자리 도킹·연속된 프레임·하나로 묶인 자원과 슬롯의 참고다. 고유 아트를 복사하지 않고 EXODUSER의 기존 아트와 기능을 사용한다.

| 담당 / 소유 | 변경 범위 |
|---|---|
| HUD | NativeHud.cs 및 고유 도킹 layout helper. 하단의 투명 여백·구슬 잘림·중앙 집중을 교정하고 화면 양끝과 바닥의 연속 받침을 구성 |
| 인벤토리 | NativeInventory.cs 및 고유 helper. 외곽 여백·3개 독립 테두리를 공유 shell/rail/header/footer로 연결. 실제 표시 rect와 입력 rect를 함께 유지 |
| 통합 | NativeGame.cs OnGUI의 공중 개발 라벨/조작 힌트 제거. 상태 영역을 화면 우상단에 부착. 검수·빌드·변경 통합·복구 담당 |
| 독립 검토 | 첨부 화면·기존 실제 Player PNG·아트 alpha bounds 대조 후 spec 검토, 그 다음 코드품질 검토. 실제 최종 렌더를 따로 확인 |

## 통합 오버레이

| 요소 | 이전 1920×1080 좌표 / 동작 | 현재 |
|---|---|---|
| 상태판 | x1590/y35/w290/h120 | x1604/y0/w316/h124. 우측·상단 여백0. 실제 x=Screen.width/min(Screen.width/1920,Screen.height/1080)−316이며 HUD와 같은 균등 배율로 초광폭에서도 글자 왜곡 방지 |
| 상태 제목 | x1610/y45/w260/h32 | x1624/y12/w276/h32 |
| 레벨·경험치 | x1610/y80/w260/h30 | x1624/y47/w276/h30 |
| 처치·악의 | x1610/y110/w260/h30 | x1624/y77/w276/h30 |
| 개발 라벨 | 좌상단 EXODUSER / UNITY 및 이식 검증판 | 월드 오버레이에서 제거 |
| 조작 힌트 | x630/y818/w790/h35로 월드에 떠 있음 | 기존 월드 라벨 제거, HUD 도킹 내 조작 안내 담당과 조율 |
| 수치·입력·저장 | 기존 Simulation/HUD/InventoryState | 변경 없음. 세이브/계정/미구현 효과와 연결하지 않음 |

2026-10-26 후속 표현: 위 표의 위치·크기는 유지하고 우상단 상시 정보판의 검정 배경과 테두리만 약한 좌→우 배경으로 교체했다. 글꼴·여백의 현재 수치는 [Unity 우측 상단 상태 표시 보정](UNITY_MAC_STATUS_BLEND_20261026.md)을 따른다. 표는 당시 도킹 이력이다.

## 검수 경계

1920×1080,1280×720,2560×1080의 실제 Player 렌더와 기존 HUD GPU 자원·아이콘, 인벤토리 선택/장착/해제/정리/이동/자원 clamp/pause-resume 검수를 진행한다. 자동 fixture는 사람의 직접 OS 입력·전체 게임/전체 UI 인수와 구분한다. 부모는 입력/전투 상태를 수정하지 않는다.

실제 통합 검수와 실행 반영을 완료했으며 아래에 이번 도킹 범위의 근거를 기록한다. Godot/웹 원본·사용자 세이브·공유 G: main/INDEX·열린 사용자 Editor/앱은 보존한다. 검수·백업·빌드는 I:/EXODUSER-Storage/qa/unity-ui-dock-20261024 아래에 보관한다.

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


## 2026-10-31 안전 영역 후속

현행 UI는 논리1920×1080을 중앙16:9 안전 영역에 균등 fit한다. 초광폭 여분으로 구슬·받침·상태판·인벤 열을 확장하지 않는다. 위 과거 전체폭 좌표/검수는 이력이며 현행 위치식은 origin+logical×min(W/1920,H/1080)이다. 16:10에는 위아래80px(2560×1600), 32:9에는 좌우960px(3840×1080) 순검정. 5개 해상도·파일명 W×H·글자 검사/실제 입력·검수 상태는 [현행 안전 영역 계약](UNITY_UI_ULTRAWIDE_20261031.md)을 따른다.
