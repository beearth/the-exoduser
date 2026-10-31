# UNITY-HUD-DOCK-01 — 화면 가장자리와 연결되는 하단 HUD

> 2026-10-31 최신: 사이드 판·미니맵·상태·알림·실습은 실제 화면 끝, 무대·제목·모달·구슬/스킬바는 중앙. 다섯 창64px 메달 제목·성장 본문181px 확대·스킬16표시·원본 전체 로딩 규격은 [초광폭 현행 SSOT](UNITY_UI_ULTRAWIDE_20261031.md)의 첫 절을 따른다. 아래 이전 수치/검수는 이력이며 새 Player 검수 대기.

> 2026-10-24 정정: 아래는 이전 후보의 제작·검수 이력이다. 전체폭 도킹은 최신 사용자 중앙 HUD·양측 인벤토리 방향으로 교체 중이며 전체 디자인 인수는 미완료다. [현행 설계](UNITY_UI_COMPOSITION_20261024.md).


사용자 최신 방향은 첨부 장르 레퍼런스처럼 화면 아래와 양끝에 붙은 일체감이다. PoE 고유 그림을 복사하거나 새 아트를 생성하지 않고 기존 EXODUSER 구슬·중앙 바의 실제 픽셀을 다시 배치한다. HP/MP/ST 값·입력·기검참 아이콘·구슬 shader·갱신/전환 시계는 변경하지 않는다.

## 원인과 실루엣 확인

기존 실제 Windows HUD PNG `unity-hud-20261024/hud-player-2026-10-24T08-06-28-068Z/unity-hud-full.png`와 원본 아트 3개를 직접 봤다. 기존 `center±441` 앵커 때문에 1920폭에서 HP의 주 실루엣은 x401.63에 시작했고, frame bottom은1109.6으로29.6px가 화면 아래에서 잘렸다. 중앙 바 PNG의 투명 여백까지 배치에 포함해 주 실루엣 바닥과 화면 사이에 약10.2px 월드 틈이 있었다. 단순히 전체 HUD를 내리는 방법으로는 양끝 여백과 구슬 잘림을 함께 해결할 수 없다.

| 원본 | 크기 | alpha≥32 최대 연결 성분 (원본 top-left px) |
|---|---|---|
| ui_globe_hp / ui_globe_mp | 465×469 | x9/y4/w452/h465 |
| ui_bar_only | 2460×546 | x154/y84/w2163/h378 |

작은 고립 export 점은 앵커 계산에서 제외하며, 원본 PNG 바이트는 수정하지 않는다. 분석 결과는 I: QA `asset-boundaries.json`, 기존 실제 배치 식을 평가한 실패 영수증은 `layout-baseline-red.json`이다.

## 현재 배치

모든 아래 값은 기존 부모 `NativeGame`의 균등 HUD 좌표계다. 물리 배율은 `min(viewportW/1920,viewportH/1080)`이며, 초광폭에서는 하단 받침의 실제 가로 길이와 양끝 앵커만 넓어진다.

| 항목 | 현재 값 |
|---|---|
| 공통 받침 | x0, yH−44, widthW, height44. 화면 양끝까지 연속 |
| 받침 아트 | 기존 bar의 어두운 금속 strip `(520,350,640,17)`, 위 cast edge `(520,155,640,17)`, 아래 edge `(520,420,640,15)`를 원본 UV로 재사용 |
| 반복 | 가로210px 단위 반복. skull/슬롯/키 라벨을 전체 폭으로 늘이지 않으며 마지막 조각은 UV를 폭 비율로 잘라 맞춤 |
| 받침 틴트 | body .7, top edge .8, lower edge .48의 RGB 동일 배율. 중앙 bar의 기존 정상 밝기 .8 유지 |
| 위/아래 edge | 위7px, 아래5px. 독립 상자들을 나열하지 않고 하나의 낮은 금속 받침으로 연결 |
| 구슬 스케일 | 기존 .9 유지: frame236.7×236.7, liquid157.5×157.5 |
| 왼쪽 frame | x=`−236.7×9/465`, y=`H−236.7`. 주 실루엣 왼쪽0/바닥H |
| 오른쪽 frame | x=`W−236.7×461/465`, y=`H−236.7`. 주 실루엣 오른쪽W/바닥H |
| liquid와 frame | 기존 frame 대비 liquid offset(48,44)×.9 유지. 쉴드/눈/수치도 기존 liquid 기준 |
| 중앙 bar | 기존738×163.8, x=(W−738)/2, y=`H−3−163.8×462/546`. 주 실루엣 bottom=H−3으로 받침 안에 놓임 |
| 기검참 슬롯 | 기존 bar-local x392/y70/w37/h45×.9와 내부3px×.9 여백 유지 |

## 검증과 경계

새 `NativeHudDockLayout` 생산 코드를 .NET8에서 Rect 경계 double과 함께 직접 컴파일해 3개 해상도의 물리 가장자리/바닥/중앙/전체 폭 받침/슬롯 포함/최소 클릭폭/좌우 원형 크기 제약 36개를 확인했다. 코드를 그대로 복제한 계산기는 아니며 실제 레이아웃 helper를 호출한다. 원본 배치의 가장자리·하단 실패를 먼저 확인했다. 이 검증은 실제 Unity 그림/색·GPU·입력 검수를 대신하지 않는다.

| viewport | 배율 | 좌/우 주 실루엣 | 구슬 바닥 | 중앙 바 유효 바닥 | 받침 높이 | LMB 폭 |
|---|---|---|---|---|---|---|
| 1920×1080 | 1 | 0 / 1920 | 1080 | 1077 | 44 | 33.3 |
| 1280×720 | 2/3 | 0 / 1280 | 720 | 718 | 29.333 | 22.2 |
| 2560×1080 | 1 | 0 / 2560 | 1080 | 1077 | 44 | 33.3 |

설치 Unity assemblies 정적 compile은 오류0이며 기존 inventory 직렬화 필드 경고11개가 남는다. 직접 build/Player/Editor 실행·commit·stage는 하지 않았다. 부모의 후속 실제 3해상도 HUD·인벤토리 합성 검수와 기존 자원 readback은 아래 완료 기록을 따른다. 새 실제 화면을 확보하기 전 작업자 판정은 RETOUCH였으며 후속 이번도킹 시각 판정은 아래와 같다. tooltip·실제 클릭·모든 배율 인수는 별도다.

작업 자료·원본 HEAD 복구 사본·도구·영수증은 `I:/EXODUSER-Storage/qa/unity-ui-dock-20261024`에 있다. Godot/원본 게임/세이브/기존 런타임 에셋/타 팀 WIP를 변경하지 않았다. 부모는 별도 소유 `NativeGame`에서 공중 중앙 안내문을 정리한다.

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


2026-10-25: K skill UI, 13 slot inspection and live Ki Slash HUD state: [current scope and verification](UNITY_MAC_SKILL_UI_20261025.md). Other skill executors remain unavailable.


## 2026-10-31 안전 영역 후속

현행 UI는 논리1920×1080을 중앙16:9 안전 영역에 균등 fit한다. 초광폭 여분으로 구슬·받침·상태판·인벤 열을 확장하지 않는다. 위 과거 전체폭 좌표/검수는 이력이며 현행 위치식은 origin+logical×min(W/1920,H/1080)이다. 16:10에는 위아래80px(2560×1600), 32:9에는 좌우960px(3840×1080) 순검정. 5개 해상도·파일명 W×H·글자 검사/실제 입력·검수 상태는 [현행 안전 영역 계약](UNITY_UI_ULTRAWIDE_20261031.md)을 따른다.
