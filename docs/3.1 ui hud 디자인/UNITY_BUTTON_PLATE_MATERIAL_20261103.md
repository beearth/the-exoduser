# Unity UI 원화 복구 — 23:05 디자인총괄 합격표 (2026-11-03)

작업 브랜치 codex/unity-ui-plate-20261103. 23:05가22:55/21:25/20:20의 단색 판 지시보다 우선한다. 단색·음각·세로 명암 판은 폐기했다. 원화 PNG 바이트는 바꾸지 않고 기존 Resources 원화를 다시 그린다.

## 다섯 합격 항목의 구현

| # | 복구/계약 | 검수 |
|---|---|---|
|1 입장|원본 lobby_enter_btn_silver_20261029/disabled의 사전축소 lobby_enter_ready_1x/2x·lobby_enter_disabled_1x/2x를 Rect(1428,702,416,156)에 표시(11-04 01:45). 원화 ENTER 글자가 있으므로 입장/ENTER를 덧그리지 않음. 클릭/호버 소리 유지|캐릭터0명 불가·2명 가능, normal/hover/selected/disabled|
|2 ActionPlate|height<48 또는 width<160은 btn_chip_1x/2x(리벳 원화 테·어두운 원화 면), 글자6px 안쪽. 나머지는 주요 btn_primary_composed, 일반 btn_plaque_20261029를 원래 Slice(box.x-outset, box.y, width+2×outset,height), sourceX174/sourceY0/edge/edgeY0/center=true로9-slice. 기본edge40/outset14. 일시정지의 primary도 주요 원화로 전달|모든 상태 GUI.color=white, 밝기1.0. .78/.74/1.18 배율 및 코드 판 없음|
|3 슬롯|카드(1428,421+n×94,390,84)에 ActionPlate 없음. 선택 붉은 바탕(194,26,16)α.1·왼쪽2px. 가는 α.13 헤어라인·56×56 초상 칸/원본 전사 초상. 빈 슬롯2개도 가는 카드/초상 테 유지. 직업/×24px 분리·개수 오른쪽14px. 새 캐릭터 칸은 얇은 테와40×40 +칸|0명/2명, 선택 카드·초상·이름·삭제 버튼 가독성|
|4 생성 창|visual_cancel/create/disabled를180×44 Rect에 직접 표시. name_cancel/create도 기존 이름창 버튼 Rect에 표시. 이름창은 원화 안쪽 면+panel_frame 가족 테(edge45). KO 문구가 원화에 있으므로 추가 텍스트 없음|생성 가능/잠금, 이름창, 삭제확인|
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

## 11-04 01:00 importer 강제 밉맵 수정

- 원인: SourceTextureImporter 버전3의 광범위 /ui/ 분기가 meta의 밉맵OFF/Bilinear를 임포트 시 true/Trilinear로 덮어썼다. meta만 고친7cd/eaf의11종 설정으로는 런타임을 보장하지 못했다.
- 정책 정본은 SourceTextureImporter.OriginalUiNoMipmaps이다. silver_hell 하위 btn_*, lobby_enter_*, visual_*, name_*, panel_frame*, panel_corner*, guide_button_glow에만 밉맵OFF/Bilinear를 적용한다(현재15종). 다른 UI·skill_icons·player/enemy·a2·TitleSignboard 분기는 그대로다. 버전4로 올려 이전 캐시의 규칙도 갱신한다.
- 기존11종 meta는OFF/1 그대로다. name_input/name_panel/panel_corner_0/panel_corner_1의4 meta를OFF/1로 맞췄다. PNG/밝기1.0/원화9-slice/슬롯/레일 구현 변경0.
- PC: 실제 importer 분기/대입 의미를 실행하는 importer.test.cjs38검사PASS, DLL 참조 컴파일1회 Core126/Runtime264/Editor60의5어셈블리 오류0. Unity import/Player/빌드0. 문구 착수분2e5a64b927과 별도 브랜치 codex/unity-ui-mipmap-20261104로 분리.
- Mac: SilverUiImportCheck.Run은15종을2회 강제 재임포트해 Texture2D.mipmapCount==1, importer OFF/Bilinear, 임포트 전/1회/2회 meta 완전일치를 silver-ui-import.json에 기록한다. 같은 SHA Player의 기존 --unity-death-ui-smoke로 실제 Resources11종 mipCount=1도 확인한다. 실제 Mac import/런타임/시각 증거는 아직 대기다.

~~~zsh
"$UNITY" -batchmode -nographics -quit -projectPath "$PROJECT/unity" -executeMethod SilverUiImportCheck.Run -output "$OUT" -logFile "$OUT/import.log"
git status --porcelain -- unity/Assets/Exoduser/Resources/Art/ui/silver_hell
~~~

## 11-04 01:45 작은 판/인장 축소/로비 RETOUCH

- 최신 origin/unity/main489af88e5를 a39ba3e8c2로 병합, docs의 Codex 구현 기록과 스토리총괄 RETOUCH 기록 양쪽 보존.
- ActionPlate는 height<48 또는 width<160에서 가시 없는 작은 원화만 쓴다. 원본 inventory plate의 리벳 테를 보존하고 btn_plaque의 어두운 내부 면을 기계적으로 옮긴 뒤 Lanczos3으로150×32/300×64 축소했다. 코드 판·명암/음각·점/그레인 생성0. 큰 판 원화/밝기1.0은 유지. 설정 버튼·키 칩은6px 안쪽에 글자를 맞추고, 보조키 삭제22px는 별도 확보한다.
- 입장 인장 가능/불가 원본 전체를416×156/832×312로 사전축소. 원본 PNG 변경0. 신규6종도 SourceTextureImporter의 기존 원화 예외에 자동 포함되어OFF/Bilinear(현재21종).
- 로비 빈 슬롯2개의 카드/초상 헤어라인, 이름창 원화 panel_frame 가족 테, 직업/삭제24px·개수14px 여백을 복구했다. 실제 포인터 hover는 기존 guide_button_glow를 인장 안쪽에만alpha.18로 표시한다.
- --unity-death-ui-smoke의 lobby hover는 실제 Repaint 좌표 변환→Rect.Contains→EntryFocus 그림 경로를 지나며 entryPointerInside/entryHoverVisible과 좌표를 기록한다. OS 마우스를 움직인 증거는 아니다. 상세 Mac 캡처목록은 [01:45 작업표](UNITY_SMALL_PLATE_RETOUCH_20261104.md).
- PC 배치/자산 계약PASS·importer50항PASS·DLL참조 컴파일1회5어셈블리 오류0. Player/에디터 임포트/게임 캡처0. 실제1920/3840의 잔점/계단·6px/가독성/hover는 Mac 미검증이다.

## 11-04 02:00 button_iron meta 정합 / 검증 중단

- CharacterSelect/UI/button_iron은 lowercase /ui/ 분기가 아닌 기본 Art 분기에서 mipmap=false/Bilinear를 지정한다. importer 버전/규칙은 유지하고 meta filterMode만2(Trilinear)→1(Bilinear)로 맞췄다. PNG/GUID/밝기/원화9-slice 불변. 기존 임포트 후 값과 일치시키는 수정이며 선명도/축소 샘플링은 Mac 디자인 판정에 남긴다. DefaultTexturePlatform의8192/무압축·Clamp 설정도 기존 규칙과 일치한다. root의 구형4096 필드는 그대로 보존했다.
- SilverUiImportCheck는 기존21원화+button_iron 총22종의 임포트 전/1회/2회 meta 완전일치, loaded mip1, OFF/Bilinear를 검사한다. 실제 Unity 실행 증거는 아직 없다.
- PC 검증 중단: importer.test.cjs의 추가 확장 코드에서 SyntaxError가 2회 연속 발생해 사용자 중단 규칙을 적용했다. 확장분은 직전52항PASS 상태로 되돌렸고 재실행하지 않았다. 이번 최종 소스의 PC 컴파일/Unity import/Player는 실행하지 않았다. 이전 컴파일 결과를 이번 근거로 사용하지 않는다. 재개 후 컴파일과 Mac22종 재임포트·실제 화면 검수가 필요하다.

## 11-04 01:40 실제시각 — 중단 원인 해결

- 최신 origin/unity/main c4b388903c54cab88d0fcddec9df5ef51eea9d48을 f60d55c1e3로 병합. CHANGELOG 양쪽 기록 보존.
- 01:40 실제시각 재개: 추가 확장 코드를 만드는 String.replace의 replacement 문자열에서 달러+작은따옴표($')가 suffix 삽입으로 해석돼 RegExp 리터럴과 중복 조각을 깨뜨렸다. 4cba2a857에는 직전52항 복원본만 들어 있었으며 구문이 깨진 확장분은 미커밋이었다. 이번에는 생성 치환 없이 직접 패치로 YAML scalar/DefaultTexturePlatform 비교를 작성했다. 기존52항 중button_iron의1검사를10개 속성검사로 보강해61항이며 유용한 기존검사를 삭제하지 않았다.
- 수정 뒤 importer 테스트1회61PASS/0FAIL. 병합최종소스 DLL참조 Roslyn 컴파일1회:Player Core126/Runtime273,Editor Core126/Runtime273/Editor60,5어셈블리 exit0/오류0. Unity 에디터/import/Player/빌드/캡처0. 이 참조컴파일은 실제 Unity 임포트/플랫폼 빌드 판정이 아니다. Mac22종2회재임포트 meta불변/mip1 및 같은SHA 화면/폰트/RTL/선명도 판정은 대기다.
- 앞 절의 컴파일미실행/검증중단은4cba 당시 이력이다. 이번 재개로PC 검증 중단을 해소했다. importer 규칙·meta·PNG·원화 디자인 신규변경0.
- 이번 범위:기존 검사 안정화, 근거는 이전 오류줄과 현재 importer/meta, 직접패치→1회테스트→1회컴파일. 또 실패하면 즉시중단·오류원문REPORT가 재개절 조건이었다.

## 11-04 04:05 후보 후속

기존원화ENTER·밝기1.0·9-slice·작은칩·슬롯·생성원화·레일을보존한다. A면은일시정지/이름/삭제를Panel(iron:true)로통일,철은3x낱점검토뒤2px blur파생을14%합성한다. 이름본문명조,미사용lobby_panel로드제거(파일유지). EntryFocus의자연Rect.Contains결과와같은그리기경로에-ui-entry-state normal/hover를제공한다. 이전OnGUI마우스좌표주입은폐기했다. 영수증entryHoverForced/entryState는제어표본을명시한다. 후보고정빌드/1920·3840목록과실행결과위치는[04:05 계약](UNITY_UI_CANDIDATE_20261104.md).

## 05:00 후보 실물 증거
e3b3bc977 단일실행본의1920/3840 원본50장및1x/3x비교를확보했다. A3면로드/철14%·원화밉맵1·밝기1.0·강제입장호버빛을제품receipt와실물로확인. 자연포인터/Mac/디자인총괄합격은별도다. [고정경로·수량·관측](UNITY_UI_CANDIDATE_20261104.md).
