# Unity UI 원화 복구 — 23:05 디자인총괄 합격표 (2026-11-03)

작업 브랜치 codex/unity-ui-plate-20261103. 23:05가22:55/21:25/20:20의 단색 판 지시보다 우선한다. 단색·음각·세로 명암 판은 폐기했다. 원화 PNG 바이트는 바꾸지 않고 기존 Resources 원화를 다시 그린다.

## 다섯 합격 항목의 구현

| # | 복구/계약 | 검수 |
|---|---|---|
|1 입장|Art/ui/silver_hell/lobby_enter_btn_silver_20261029 또는 lobby_enter_disabled를 Rect(1428,702,416,156)에 표시. 원화 ENTER 글자가 있으므로 입장/ENTER를 덧그리지 않음. 클릭/호버 소리 유지|캐릭터0명 불가·2명 가능, normal/hover/selected/disabled|
|2 ActionPlate|주요 btn_primary_composed, 일반 btn_plaque_20261029를 원래 Slice(box.x-outset, box.y, width+2×outset,height), sourceX174/sourceY0/edge/edgeY0/center=true로9-slice. 기본edge40/outset14. 일시정지의 primary도 주요 원화로 전달|모든 상태 GUI.color=white, 밝기1.0. .78/.74/1.18 배율 및 코드 판 없음|
|3 슬롯|카드(1428,421+n×94,390,84)에 ActionPlate 없음. 선택 붉은 바탕(194,26,16)α.1·왼쪽2px. 가는 α.13 헤어라인·56×56 초상 칸/원본 전사 초상. 새 캐릭터 칸은 얇은 테와40×40 +칸|0명/2명, 선택 카드·초상·이름·삭제 버튼 가독성|
|4 생성 창|visual_cancel/create/disabled를180×44 Rect에 직접 표시. name_cancel/create도 기존 이름창 버튼 Rect에 표시. KO 문구가 원화에 있으므로 추가 텍스트 없음|생성 가능/잠금, 이름창, 삭제확인|
|5 레일|panel_frame_20261029를 Rect(1368,8,544,1064)에 source150/150, edge75/75, center=false로 그려 모서리/테두리만 복구. 기존 그림자·배경·로고 보존|1920/3840 실제 오른쪽 레일·모서리·ENTER와 충돌0|

상태별 원화 밝기와 알파 틴트는1.0이다. 원화 자체의 투명 영역/각인/문구를 보존한다. 원화에 구워진 ENTER/KO 문구는 원본 그대로이며 번역 문자를 겹쳐 쓰지 않는다. 호버/선택은 안쪽에 클립한 guide_button_glow만 α.18×selection로 표시한다. 바깥 새 판/새 프레임/새 질감은 생성하지 않는다.

## 기본 스킨과 사용자 원화의 분리
NativeUiChrome은 GUI.skin의 button/box/label/window/toggle/textField/textArea에서 기억한 텍스처만 제거한다. 사용자 지정 GUIStyle 배경은 보존한다. Editor HiDPI 배열도 기본 스킨 원소만 제거하고 원화 원소를 보존한다. 이전처럼 모든 GUIStyle 배경을 null로 지워 원화를 잃게 하지 않는다.

## 밉맵/필터 (PNG 원본 변경0)
다음11종 .png.meta의 enableMipMap=0, filterMode=1(Bilinear, Trilinear 아님):
btn_primary_composed, btn_plaque_20261029, guide_button_glow, lobby_enter_btn_silver_20261029, lobby_enter_disabled, visual_create, visual_cancel, visual_disabled, name_create, name_cancel, panel_frame_20261029.
GUID·sRGB·기존 원화/크기·압축의 나머지 설정은 유지한다. Mac 영수증에서 각 Resources 텍스처 loaded=true/mipCount=1을 확인한다.

## Mac 촬영
--unity-death-ui-smoke -ui-screen <lobby|character-create|character-name|character-delete|pause|settings|quit|lobby-quit>
-ui-state <normal|hover|selected|disabled> -ui-characters <0|2>
+ -output/--unity-qa-sandbox 절대 경로, -screen-width/-screen-height, -mute-audio.
상태는 제어된 시각 검수용 표시이며 물리 입력 테스트가 아니다. disabled의 로비는 불가 원화, 생성 창은 잠긴 직업 원화다. selected/2명은 두 번째 캐릭터 선택. 설정은4탭을 모두 촬영한다. 파일명/JSON에 화면·상태·인원·실제 해상도가 들어간다.
생성·이름 창은 열기만 하고 새 캐릭터 생성하지 않는다. 삭제 확인도 기존 smoke 삭제 차단 유지. settings/roster/combat IO0, 전후 로스터 불변 검사.

## 비교판과 판정
- 실제로 연 기준: G:/exoduser/tmp/design-review/20261028_lobby_aaa/00_current_lobby_1920.png. 원화8종 점검판: I:/EXODUSER-Storage/codex-takeover/death-screen/review-current/original-assets.png (게임 실행 화면 아님).
- unity/Tools/lobby-art-review/compare.cjs는 실제 PNG4개(--reference/--web/--regression/--restored)를 받아1x 전체·동일 크기 레일1x·레일3x HTML 비교판을 만든다. 과거1920 원본은3840으로 확대하지 않고 자연 크기로 남긴다. 실제 높이가 다르면 오류, 누락 화면을 가짜 캡처로 대체하지 않음.
- Mac1920×1080·3840×1080에서10-28 웹/현재 웹/385e76ce1 퇴보/복구본을 나란히. 기본·호버·선택·비활성,0/2명, 생성·이름·삭제·일시정지 창 포함. 합격선은 디자인된 요소가 하나도 사라지지 않음.
- PC는 Player 실행 금지/컴파일까지만. 실제 복구 캡처/완성 비교판/시각 합격은 Mac 대기. 이전13/13/13 고정색/1px 코드 판 합격은 원화 복구 기준이 아니므로 폐기한다.

## 최신 공통 병합 인계

- 원화 복구7cdce2032dcc42c07749a23c91d3ddcbec5121f3에 origin/unity/main 4d336665a4e617a2097b92c8e3551deccbf4645d를 정상 병합했다. SilverCharacter 충돌은 TrackQaNameButton(create)를 보존하면서 visual_cancel/create/disabled 원화를 유지했다. CharacterPresentation의 이름 버튼 검수 추적, NativeLobby/TitleMenu의 스토리·겹침 수정은 상대 변경 그대로다.
- ENTER·밝기1.0 원화9-slice·슬롯 카드·생성/이름 원화·레일 테두리와11종 밉맵OFF를 보존했다. CHANGELOG는 줄바꿈을 맞춰3-way 병합하고21:25/23:05 원화 이력과 최신 공통 기록을 모두 보존했다.
- 병합 소스 PC DLL 참조 Roslyn 컴파일1회: Player Core126/Runtime264, Editor Core126/Runtime264/Editor59,5어셈블리 오류0. 소스 계약 확인PASS. Unity 에디터/Player/빌드/게임 캡처0, 실제 Mac 시각 판정은 대기. CTO가 자기 브랜치를 fast-forward로 통합한다.
