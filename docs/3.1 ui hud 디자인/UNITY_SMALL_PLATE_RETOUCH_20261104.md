# 01:45 UI RETOUCH — 작은 원화 판과 로비 간격

최신 계약은 [UI 후보 새 실행 정정](UNITY_UI_CANDIDATE_20261104.md)을 따른다. 아래 최초 구현의 자동 크기 분기/칩 범위는 역사 기록이며 05:50 판정으로 대체됐다. 현재 20개 가시 축소본을 추가했고 실제 새 Unity/Player 검수는 공용 실행기 2FAIL 수정 대기다.


## G0 · G1

- 기준: origin/unity/main489af88e5 병합(a39ba3e8c2). 디자인총괄 `G:/exoduser/tmp/design-review/20261104_eaf_ui_judgement/JUDGEMENT.md`의1~5항.
- 직접 연 원본: 판정용1920 설정 게임 탭·이름창 캡처, btn_plaque_20261029/입장 인장/panel_frame/inventory plate 원화. 작은 버튼의 가시가 글자 위로 들어오고 이름창만 가는 사각 테인 것을 확인했다.
- 목표: 큰 원화 버튼/프레임·밝기1.0은 보존하며 작은 판만 가시 없는 가족으로 분기한다. PC는 컴파일·소스/자산 검사까지만, Mac 동일 패키지에서1920/3840·1x/3x로 최종 판정한다.
- 제작법: 기존 원화의 실제 픽셀을 기계적으로 재구성/축소. 작은 판은 inventory/plate의 리벳 테두리에 btn_plaque의 어두운 내부 원화 면을 넣고 Lanczos3으로150×32/300×64를 만든다. 입장 가능/불가 인장은416×156/832×312로 사전 축소한다. 코드로 면·음각·세로명암·점/그레인을 그리지 않는다. 원본 PNG는 보존한다.

| 항목 | 설계 |
|---|---|
| 작은 판 | 05:50 정정: 설정 조작 요소가 명시한 곳만 btn_chip_1x/2x. 높이/너비 자동 전환은 폐기. 나머지는 기본 가시 원화와 표시 크기에 맞춘 btn_thorn_* 1x/2x 사전 축소본 |
| 글자 | 면 안쪽6px Rect로 제한, 폰트가 클 때 그 범위에 맞춰 축소. 키 칩의 보조 바인딩 ×칸22px를 별도로 확보 |
| 입장 | 원본 인장 전체 구성/문구 유지,1x/2x 사전 축소판 선택. 원화 밝기1.0, 호버는 기존 안쪽 붉은 빛만 |
| 0명 슬롯 |421/515의 두 빈 카드와 초상 자리 헤어라인을 흐리게 그려 레일 연속성 유지. 새 캐릭터 카드는609 유지 |
| 이름창 | 기존 이름창 면에서 사각 테만 제외한 내부 원화 UV를 사용하고 panel_frame 가족 테를 같은440×335에 추가. 입력/버튼/문구/포커스 유지 |
| 2명 간격 | 이름 칸과직업/×를 분리. 직업 오른쪽1764,×왼쪽1788(24px 간격). 개수 오른쪽1814,카드끝1828(14px 여백) |
| 호버 증거 | QA Repaint에서 입장 Rect 안에 들어간 OnGUI 포인터를 실제 hover 조건으로 처리하고 좌표/inside/빛 표시를 영수증에 기록. OS 물리 마우스 조작으로 주장하지 않음 |

합격선: 작은 판 끝장식의 글자 침범0·글자 면 안쪽6px·축소 잔점/계단0·빈 레일 구멍0·이름창 프레임 가족 일치·직업/× 및 개수 여백. 생성/삭제/일시정지 원화와 큰 버튼 디자인 손실0. 실제 화면 PASS는 Mac 전까지 보류한다.

## 구현·PC 확인

- 6종 파생 PNG와meta, 재생성 도구 unity/Tools/death-ui-tests/build-prescaled-art.cjs.1x/2x는 각 표시밀도용 실행자산이며 백업/별도 프로젝트가 아니다. sourcePNG 원본 변경0. SourceTextureImporter의 기존 btn_*/lobby_enter_* 규칙으로OFF/Bilinear,21종의 import일관성을 유지한다.
- 설정 DrawButton/키 DrawKey·DrawKeyPlain/Reset은 PlateLabel로 안쪽6px Rect와 실제 폰트 CalcSize를 맞춘다. 키 탭의 기존 글리프 아틀라스는 안쪽6px 클립 안에서 유지한다. 키 Alt 삭제칸22px를 글자 폭에서 빼고 바인딩 칸 폭에도 추가했다.
- 이름창은 기존 name_panel 바깥12px만 제외한 원화 내부 UV+FrameOnly(panel,45), 같은 입력/버튼/문구/포커스 유지. 로비 이름은152px 폭에 최대20→최소14로 맞추고 직업/삭제 영역과 분리했다.
- 배치/자산 검사1차RED(작은판 정책 부재), 수정 후PASS. importer50항PASS, run.cjs 구문PASS. C# 재질프로브의 작은판1x/2x 분기도 갱신했으며 이번 PC에서 별도 C# 실행은 하지 않았다.
- 최종 PC DLL참조 컴파일1회 Player Core126/Runtime273, Editor Core126/Runtime273/Editor60,5어셈블리 오류0. Unity import/Player/빌드/게임 캡처0. 원화와 이전 실제 캡처를 직접 보았지만 수정본 실제 장면 판정은 Mac 대기다.

## Mac 촬영 목록 (동일 SHA,1920×1080·3840×1080)

각 해상도마다 로비0명·2명 기본, 입장 실제hover, 생성 가능/잠금, 이름 입력, 삭제 확인, 일시정지, 설정4탭을 찍는다. 전체1x와 입장 인장/칩 SPACE·L-SHIFT·전체화면F11/이름창 모서리/로비 직업×·개수 영역3x를 같은크기로 나란히 둔다.

~~~zsh
PLAYER="<동일 SHA Mac Player/Contents/MacOS 실행파일>"
ROOT="$PWD/_out/ui-retouch-current"
for w in 1920 3840; do
  for spec in lobby:0:normal lobby:2:normal lobby:2:hover character-create:2:normal character-create:2:disabled character-name:2:normal character-delete:2:normal pause:2:normal settings:2:normal; do
    IFS=: read -r screen count state <<< "$spec"
    out="$ROOT/$w/$screen-$count-$state"; mkdir -p "$out"
    "$PLAYER" -mute-audio -screen-fullscreen 0 -screen-width "$w" -screen-height 1080 \
      --unity-death-ui-smoke -ui-screen "$screen" -ui-characters "$count" -ui-state "$state" \
      --unity-qa-sandbox "$out/qa-save" -output "$out" -logFile "$out/player.log"
  done
done
~~~

Mac 공용 숨김 GPU 실행 경로에 이 인자를 전달한다. 호버는 ReviewState 값만으로 통과시키지 않는다. lobby hover 영수증에서 entryPointerInside/entryHoverVisible=true와 entryPointer가 entryRect 안에 있음을 확인한다. 기본컷과 입장 크롭을 직접 나란히 보며 붉은 빛이 보이는지 판정한다. pointerScope는 OnGUI 제어 포인터이며 OS 손조작이 아니다.

원화17개 런타임 영수증은 loaded=true/mipCount=1. SilverUiImportCheck.Run은현재21종 재임포트 전/1회/2회 meta 불변을 확인한다. 배치/톤·가독성·축소잔점/계단은 화면만으로 판정한다. 새 번역 문구 추가0, Core/사망 흐름 변경0. 펫 말풍선 구현은 후속이다.

## 11-04 04:05 승계

작은판임계값48/160·6px·파생6원화·빈슬롯/간격계약을재검사PASS했다. 이름창은A등급Panel(iron:true)로바꾸되같은panel_frame 원화/edge45를유지한다. 입장호버QA는실제마우스이동/OnGUI좌표주입대신-ui-entry-state hover로EntryFocus공통그림경로를직접선택한다. entryPointerInside는자연입력관측값이고강제호버는entryHoverForced로구분한다. 전체후속은[후보계약](UNITY_UI_CANDIDATE_20261104.md).

## 05:00 후보 실물 증거
e3b3bc977의1920/3840 각설정4탭·로비0/2·생성/이름/삭제·입장hover를확보(전체50장)했다. 게임/조작탭의F11·SPACE·L-SHIFT칩을1x에서열어글자와원화장식겹침이없는것을확인했다. 17원화/축소본의mipCount1을실제receipt로확인했다. 이번 런타임변경0, 자연입력/디자인총괄판정별도. [근거](UNITY_UI_CANDIDATE_20261104.md).

## 05:40 5번 결정 반영
디자인총괄 JUDGEMENT.md의 삭제 확인 칩은 의도된 변경·설정과 같은 가족이라는 결정을 따른다. 높이48/너비160 compact 규칙과6px 여백, 칩/타이머/보스 판 원화를 유지했다. 이름 판 배경만18px 안으로 넣고 원래 가시 frame 경계는 유지한다. 촬영에는 --remodel3d -force-d3d11을 반드시 포함한다. [실행 계약](UNITY_UI_CANDIDATE_20261104.md).

## 05:40 인수 한계
작은 칩 가족을 유지한540fdcde20의1920 25장을 같은3D/d3d11 조건으로 확보했다. 입장hover 제품PASS와 그 뒤 공용 로그읽기 실패를 구분한다. 두번째 같은 종료 결함으로 STOP/3840미실행, 새 전체50장 완료 아님. [실행 결과](UNITY_UI_CANDIDATE_20261104.md).
