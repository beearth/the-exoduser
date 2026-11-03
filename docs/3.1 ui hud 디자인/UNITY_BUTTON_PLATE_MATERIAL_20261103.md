# Unity 버튼 판 재질 — 19:10 Mac 두 번째 FAIL 후 방법 변경 (2026-11-03)

브랜치 codex/unity-death-screen-20261103. Unity 전용. 1ea269a72의 Mac 결과는 smoke/UI 동작 PASS였지만 버튼 회색 바탕은12/12 FAIL이었다. 이전 RGBAHalf/linear 보정·CPU 색 범위 검사는 GPU 결과를 증명하지 못했으며 해당 제작법을 폐기했다.

## 현재 계약

| 항목 | 구현/값 |
|---|---|
| 기본 스킨 제거 | NativeUiAudit의 Label/Button/Box 그리기 경계에서 NativeUiChrome.ClearBackgrounds. normal/hover/active/focused/onNormal/onHover/onActive/onFocused 8상태 background=null. Editor의 8상태 scaledBackgrounds도 빈 배열. Player에는 이 HiDPI API가 노출되지 않음 |
| 텍스트/입력 보존 | 기존 font/fontSize/textColor/padding/정렬/키보드·마우스 핸들러 유지. style 배경만 제거 |
| 판 바탕 | Texture2D.blackTexture의 불투명 검정. 기존 (22,20,19)→(9,8,8) 그라데이션, displayColor/RGBAHalf, 바탕·프레임 linear 변환 제거. 판에 부모 RGB 틴트는 받지 않고 알파만 유지 |
| 금빛 선 | 일반 (104,92,70), 주요 (140,123,90), 선택 시 (198,112,74)로50% 이동. 디자인 두께=1/GUI.matrix.m00, 물리 화면1px. 기존 Round(scale) 제거(1.5배에서도1px) |
| 음각 | 바깥 절단선 검정 α.96, 위 모서리 (64,57,48) α.55, 아래 검정 α.5. 3px 안쪽 홈(높이30 미만 생략), 주요 높이40 이상 두 번째 금선 α.35 |
| 선택/호버 | 내부 가장자리 (150,26,12) α.24, 글자 뒤 폭50%·높이42% 타원 (120,22,10) α.20. 주요 버튼 아래 불씨는 선택 강도의40%. 바깥 ButtonFocus 붉은 번짐 제거 |
| 로비 슬롯 | 390×84 공통 ActionPlate. 빨간 단색 채움/2px 빨간 띠 없음. 선택/호버 이름 (240,227,206), 일반 (223,214,194). 공통 스킨 제거와 검정 판 적용 |
| 글자 | 기존 Hahmlet 명조 및 지역 명조/Cinzel 대체 유지. 일시정지/종료 뼈색 (223,214,194), 선택 (240,227,206), 삭제 확인 (222,150,128) |
| 진단 예외 | QA의 NativeUiChrome.DrawStockProbe만 원래 GUI.skin.button 복사본을 직접 그림. 기본값OFF, --unity-death-ui-smoke + --unity-death-ui-skin-probe -ui-screen lobby에서만 촬영 중 활성 |

공통 런타임 GUI.Button/GUI.Box는 NativeUiAudit 경계에 모여 있다. 진단 전용 stock control과 기존 별도 UI 소리 촬영 도구의 안내 상자는 제품 버튼 경로가 아니다. 로비 입장 버튼은 원래도 GUIStyle.none이므로, 회색의 원인을 스킨이라고 단정하지 않는다. 아래 동일 프레임버퍼 측정으로 확정한다.

## 동일 좌표 스킨/커스텀 판 진단

--unity-death-ui-smoke --unity-death-ui-skin-probe -ui-screen lobby -output <절대 QA 출력> --unity-qa-sandbox <절대 QA 저장격리> + 해상도 인자.

1. 최초 그리기 전에 기본 스킨 버튼8상태 텍스처 이름을 보존한다.
2. 같은 ActionPlate 사각형 위에 기본 스킨만 그린 ui_skin_control과, 기본 스킨이 없는 ui_skinless를 같은 프레임버퍼에서 PNG로 저장한다. 진단 control의 GUI.color/backgroundColor는 white, 실제 입력은 처리하지 않는다.
3. 1920 기준 (1500,735)/(1500,775)를 RightMatrix로 현재 해상도 좌표로 변환해 두 결과의 RGB를 JSON skinProbes 및 DEATH_UI_SKIN_PROBE 로그에 기록한다. 플랫폼/GPU/색 공간/stock 상태 이름/제거 상태 수도 기록한다.
4. 커스텀 판의 두 측정점 채널 중 하나라도40 초과면 fixture FAIL이다. 기존 회색 범위와 기본 스킨의 일치 여부·어느 레이어가 원인인지는 측정/실제 이미지로 판정한다. DEATH_UI_SKIN_REMOVED는 Button/Box/Label과 스타일 이름·제거 상태 수를 남긴다.

Windows/Mac 같은 인자로 실행 가능하다. **PC는 컴파일까지만 허용되어 Windows GPU 측정은 미실행**이며 Mac 새 후보도 미검증이다. 두 플랫폼 원인 증명 완료라고 보고하지 않는다.

## 직접 UI 촬영/저장

- --unity-death-ui-smoke -ui-screen pause|settings|quit|character-delete|lobby|lobby-quit (값 하나씩). settings는4탭. 요청 Player 해상도를 그대로 사용한다.
- 삭제 확인은 인메모리 캐릭터만 사용하며 해당 플래그에서는 ConfirmCharacterDelete가 즉시 false다. 실제 삭제0, 저장소0.
- DEATH_UI_SAVE_BINDING 및 JSON의 settings/roster/combat=disabled. 실제 dialog/page/로스터 전후·선택 불변을 기록한다.
- 기존 smoke에 일반 세이브 바인딩 로그가 없었던 이유는 파일 IO 비활성이다. 개인 세이브를 연결해 진단하지 않는다.

## 검증/재검수

- unity/Tools/death-ui-tests/run.cjs --output <상대 또는 절대 출력> [--unity-data <Editor/Data 또는 Unity.app/Contents>].
- Mac Unity Hub 설치 경로와 .NET SDK 자동 탐색. 필요하면 --dotnet <exe> --csc <csc.dll> --refs <ref 폴더>로 명시. net8.0 경로/버전을 실행 전제로 고정하지 않는다.
- 회귀는 실제 ClearState/ClearBackgrounds 함수를 Player/Editor 조건으로 추출 컴파일해8상태/Editor HiDPI 제거와 텍스트·padding 보존, 반복 안전성, 그리기 경계 연결을 검사한다. 이전 색 전송 수식 검사는 제거했다.
- PC DLL 참조 컴파일·CPU 검사는 실제 GPU/시각 PASS가 아니다. Mac 1920×1080·3840×1080의6개 UI/설정4탭, 1x·3x 및 BG3/웹 정본 나란히 판정은 대기다.

## 인트로 홀드 게이지 (유지)
Cinzel-400 SPACE/ESC 두 줄11px·자간 .08em, 사이14px 금선(189,169,122), 폭46 초과 시7px까지 축소. 패드16px, HOLD TO SKIP 9px·자간 .14em. 홀드3초·링 모양 유지. 18:40/19:10 Mac 재검수에서 이 수정은 PASS 범위이며 이번에 바꾸지 않았다.
