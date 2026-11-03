# 01:45 UI RETOUCH — 작은 원화 판과 로비 간격

## G0 · G1

- 기준: origin/unity/main489af88e5 병합(a39ba3e8c2). 디자인총괄 `G:/exoduser/tmp/design-review/20261104_eaf_ui_judgement/JUDGEMENT.md`의1~5항.
- 직접 연 원본: 판정용1920 설정 게임 탭·이름창 캡처, btn_plaque_20261029/입장 인장/panel_frame/inventory plate 원화. 작은 버튼의 가시가 글자 위로 들어오고 이름창만 가는 사각 테인 것을 확인했다.
- 목표: 큰 원화 버튼/프레임·밝기1.0은 보존하며 작은 판만 가시 없는 가족으로 분기한다. PC는 컴파일·소스/자산 검사까지만, Mac 동일 패키지에서1920/3840·1x/3x로 최종 판정한다.
- 제작법: 기존 원화의 실제 픽셀을 기계적으로 재구성/축소. 작은 판은 inventory/plate의 리벳 테두리에 btn_plaque의 어두운 내부 원화 면을 넣고 Lanczos3으로150×32/300×64를 만든다. 입장 가능/불가 인장은416×156/832×312로 사전 축소한다. 코드로 면·음각·세로명암·점/그레인을 그리지 않는다. 원본 PNG는 보존한다.

| 항목 | 설계 |
|---|---|
| 작은 판 | height<48 또는 width<160에서 btn_chip_1x/2x. 가시가 없는 원화9-slice, 실제 사각 안에 그림. 큰 원화와 기존장식은 유지 |
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
