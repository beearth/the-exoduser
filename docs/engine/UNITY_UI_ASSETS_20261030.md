# Unity UI 원화 반영 — 2026-10-30

## 범위와 현재 상태

사용자 인계 문서 `I:/EXODUSER-Storage/codex-takeover/unity-ui-assets-brief.md`의 기존 원화 반영 작업이다. 신규 원화 생성·비용 0. Unity 기준 c122746b9858a2ccb50d97dccf276140c155383f, 웹 기준3c645fa2170abdde1fd4f2cc6cea7850a383ed5f. 작업 브랜치 codex/pc-unity-ui-assets-20261030.

이 문서의 초기 상태는 **제작 후보·실제 Player 비교 진행 중**이다. 컴파일과 파일 반입으로 디자인 완료를 뜻하지 않는다.

| 구역 | 현재 구현 계약 | 적용 파일 |
|---|---|---|
| 인장 | 원본 2560×1440을 웹의 1200:700 부모 프레임 안 16:9 상자(1851.4286×1041.4286, x34.2857/y19.2857)에 fit. 로고 좌23.86%·위26.2%·폭57.3%, ENTER x50%·y88%, Cinzel400 21px·자간.55em | NativeLobby.SilverHell.cs |
| 인장 시간 | 인장.2초 뒤2.6초 등장·1.035→1 축소,2.8초부터7초 불투명도1↔.82. 로고1.1초 뒤1.8초, ENTER2.4초 뒤1.4초·3.8초부터4.2초1↔.72 | 같은 파일 |
| 인트로 | Title에서 옛 intro.mp4를 준비·재생하지 않음. EnterGate는WorldIntro 직결, 기존 canonical WorldMovie·자막·5초hold 유지 | Core/LobbyFlow.cs, NativeLobby.cs |
| 로비 | 우측560폭 감쇠 위에 목록·로고·기존 은빛 ENTER 원화, 점선 빈칸·큰 홍보 블록 제거 | NativeLobby.SilverLobby.cs, NativeLobby.Characters.cs |
| 캐릭터 선택 | ≥1100폭에서 전면 기존 무대·우측380폭 정보/특성/직업·중복 초상 제거. 작은 화면은 기존 반응형 경로 | NativeLobby.SilverCharacter.cs |
| 안내 판 | 폭min(720,화면폭−96), 안쪽padding34/52/40. 원본9-slice150→75px·outset24 | NativeLobby.StartupPresentation.cs, NativeSilverHellUi |
| 안내 버튼 | 원본3-slice174→40px·outset14,168×46, Hahmlet 400 16px·자간 .24em | 같은 파일 |
| 서체 | 기존 OFL Hahmlet 300/400 TTF, 제목 메뉴도 300 사용. Cinzel은 원본 가변 글꼴을 400/600으로 고정한 파생본을 사용. 해당 리소스 누락 시 기존 글꼴 폴백 | Art/fonts, NativeLobby.TitleMenu.cs |

## 반입 원본

| 웹 원본 | Unity Resources 상대경로 | 처리 |
|---|---|---|
| img/ui/silver_hell/gate_sigil_20261028.jpg | Art/ui/silver_hell/gate_sigil_20261028.jpg | 동일 바이트 |
| img/logo_exoduser.png | Art/lobby/logo_exoduser.png·title_logo.png·brand_logo.png | 동일 눈알 로고, 이전두곳갱신 |
| assets/lobby/lobby_enter_btn_silver_20261029.png | Art/ui/silver_hell/lobby_enter_btn_silver_20261029.png | 동일 바이트; 비활성은CSS grayscale1·brightness.5 파생 |
| img/ui/silver_hell/panel_frame_20261029.png | Art/ui/silver_hell/panel_frame_20261029.png | 동일 바이트·9-slice |
| img/ui/silver_hell/btn_plaque_20261029.png | Art/ui/silver_hell/btn_plaque_20261029.png | 동일 바이트·3-slice |
| fonts/hahmlet/Hahmlet-{300,400}-ko.ttf, OFL.txt | Art/fonts/Hahmlet-{300,400}-ko.ttf, Hahmlet-OFL.txt | 동일 바이트·상업사용 허용문 동봉 |
| cin-enter-engraved.css의120×9 SVG | Art/ui/silver_hell/gate_enter_line.png | 원본SVG 래스터, 새디자인0 |
| charselect-silver-hell.css의120×80 SVG2개 | Art/ui/silver_hell/panel_corner_{0,1}.png | 원본SVG 래스터, 새디자인0 |

## 전수 대조와 검수

`unity/Tools/ui-assets/audit.cjs <I: 출력>`는index/game과 직접 연결CSS/JS, UNIQUE_ART27종의원본/툴팁54개,14컷아웃 등131개를 대조한다. 직접참조/동적참조·동일바이트·파생이미지·현재화면에서의실제사용을 구분한다. 로그인 전용·현행CSS에서숨긴이전ENTER·이전CSS토큰은Unity미구현화면과구분한다. 전체목록은 I:/EXODUSER-Storage/demo-art/unity-ui/UI_원화_전수대조.md·JSON이다. 동일 바이트 보유가 실제 화면 사용 증거는 아니다.

| 검사 | 근거·현재 결과 |
|---|---|
| 새 흐름 회귀 | 실제Core를Mono로실행, 수정전실패→수정후6검사통과 |
| 전체 로비 오라클 | tests/sigil-full.json·log,64검사·불일치0 |
| Runtime 독립 컴파일 | compile/수정후-결과.json,오류0. Unity빌드증거와구분 |
| Unity6000.6.7f1 Win64 빌드 | 8ad682f4,candidate-build.json,resultSucceeded/errors0 |
| 실제 UI Player 캡처 | --unity-ui-assets-capture,전용격리output·sandbox에서만. 실제렌더·API이며OS입력검수아님 |
| 최종1x·M1·원격·통합·바로가기 | 현재진행중, 완료영수증없음 |

산출물·백업·로그는 I:/EXODUSER-Storage/demo-art/unity-ui/. 실제검수후 REPORT.md와이문서를갱신한다. 세이브·사용자G원본·다른담당WIP·공용렌더설정은보존한다. unity/main병합과바탕화면갱신은공통규칙의Unity통합담당이영수증검수후진행한다.


## 첫 실제 비교와 재작업

후보 `222e0f737`의 빌드 `8ad682f4`는 Succeeded/errors0. 실제 Player `54375762`는 8검사 통과·D3D11/RX9070XT·사용자 화면 창0·잔여0·USER_SAVE0이다. 후보1의 실제 화면에서 인장 부모 프레임 크기, 로고 축소 시 거친 윤곽, 남은 금색 안내·선대 이름, 캐릭터 선택 버튼 원화 불일치를 확인했다. 최종 디자인 제출은 보류하고 해당 항목을 수정한다.

- 인장 기준은 `cin-hell-frame`의 1200:700 부모와 그 안 16:9 이미지 상자를 함께 따른다. 문서의 비율 설명만으로 1920폭을 사용했던 차이를 실제 CSS 측정으로 보정했다.
- 원화 축소는 mipmap·trilinear를 사용한다. 원본 RGB/알파 바이트는 바꾸지 않는다.
- 캐릭터 선택 버튼은 최신 웹 실제 부품의 글자 제외 180×44 투명 래스터를 사용한다. 새 도형·원화 제작이 아니다. 특성 아이콘도 현재 `_TRAIT_SVG`를 그대로 래스터한다.
- 안내의 본문·제목은 웹 토큰의 Nanum Myeongjo, 버튼은 Hahmlet 400이다. 은빛 색값을 맞추고 버튼 글자를 중앙에 배치한다.
- 웹 캡처에서 외부 Google 폰트가 차단된 것을 확인해 동일 원본 로컬 TTF를 연결한 뒤 비교한다. 원래의 배치·크기·색 CSS는 그대로다.
- 웹 안내 캡처 `896675c1`의 감시 결과는 USER_SAVE changed2로 실패했다. 변경 파일은 Player.log와 Player-prev.log이고 같은 구간 별도 Unity 창 시작이 관측됐다. 이미지 생성/페이지 오류와 실행 안전 판정을 분리하며, 이를 USER_SAVE0으로 덮어쓰지 않는다.


## 5직업 원화·기존 문구 전수 보완

- 웹 `assets/charselect` 참조도 전수 대조에 포함해 현재 목록은 131개, 동일 바이트 보유는 47개다. 파생 이미지와 현재 화면에 쓰지 않는 이전 CSS 자산은 별도로 표시한다. 이 수치가 131개 전부의 실제 화면 검수 완료를 뜻하지 않는다.
- 잠긴 헬거너·변성술사·창법사의 기존 `poster_idle_*.jpg`, `portrait_*.jpg`, `idle_*.mp4` 총 9개를 동일 바이트로 반입했다. 영상은 H.264 High(profile100)이며 무음 반복한다. 직업 잠금·게임플레이·3D 모델은 변경하지 않는다.
- 현재 웹 `CHAR_VISUALS`의 직업명·설명·특성을 그대로 사용한다. 기존 지원 29언어 표에 없던 기존 웹 키 9개를 261행 추가했다. 새 문구 창작은 없다. 웹에 번역이 없는 키는 웹과 동일하게 한국어로 폴백한다. 기존 번역은 보존했다. 번역 완성도 PASS를 주장하지 않는다.
- 서체가 문자를 지원하지 않으면 기존 동봉 Hahmlet·Noto Serif·CJK·Thai·Arabic 서체로 폴백한다. 문자를 지우거나 새 시스템 폰트를 설치하지 않는다. QA는 실제 동봉 글꼴의 누락 글리프와 5직업의 정적 원화·영상 디코드를 확인한다. Arabic 조판·물리 입력·전체 언어 시각 품질과 별개다.
- 캐릭터 입장·다른 화면·게임 진입 때 미리보기 영상을 닫아 숨은 디코더가 남지 않게 했다.


## 실제 Player 명암 원인 수정·이름 입력창 (후보4 이후)

| 항목 | 실제 근거 | 수정 계약 |
|---|---|---|
| 글자 명암 | candidate3-caps/색공간_진단.json 및 Unity_색공간_진단.png: Linear, GUI/color/contentColor=흰색, enabled=true. 0.5 회색 텍스처128, 같은 글자55 | IMGUI 글자 색에만 Color.gamma 적용. GUI.color·이미지·게임 조명은 그대로. 후보4 보정 글자 최대128 확인 |
| 로고 축소 | 공통 SourceTextureImporter가 개별meta의 mipmap을 다시0으로 만듦 | silver_hell UI와 눈 로고3경로만 mipmap·Trilinear. 원화RGB/알파 바이트 불변, 다른월드텍스처 규칙 불변 |
| 로비 진행 | 기존 전사/기기저장 설명은 현행 웹의 Lv./장/층과 다름 | combat-save-v1을 읽기만 해 캐시. 기본 Lv.1/stage0, 손상 읽기 실패는 —. 현재 웹 lobby-stage-info의 시작층0/4/10/14/21/26/32, 끝34. 실제 선택 영상은 전체1920×1080 cover |
| 이름 입력 | 웹 create-modal-inner 실측440×335, padding48/40, input358×54 | 현재 CSS+원화에서 텍스트를 뺀 name_panel/input/cancel/create PNG4개. 기존2~8자·중복·잠금 검증 유지 |
| 안내 | 정본 폰트 연결 후 panel720×488.92, inner614, progress16·제목37·hint17 | padding34/52/40+border1, skip178.72×46/next168×46. 글자 기준선 보정10/6px, 원본 버튼 알파의 blur5(웹 shadow10px)·rgba194/26/16/.45, focus brightness1.18. 기본글자223/214/194, 초점242/237/226 |
| 언어 | 최신 index _LOBBY_* + lobby_i18n + localization-data 합성 순서 | sync-labels.cjs가 기존 키60개×29언어를 원문 그대로 반입. 웹에 없는 번역은 영어→한국어 순서 동일 |

후보4 빌드102fc76c Succeeded/errors0, Player136dcc69 실제21검사 PASS·D3D11/RX9070XT·사용자창0·잔여0·USER_SAVE0. 비교 compare-candidate4/1x_로비.png·특성.png·안내.png·이름.png를 직접 검수해 글자/로고 핵심 결함 해소를 확인했다. 그 뒤 타이틀의 이전 구분선 GUI.color 알파.1이 글자에 곱해지는 원인을 수정하고, 이름창 제목·안내 기준선/자간·초점 그림자를 추가 마감했다. 이 후속은 다음 정확 빌드에서 재검수하며 후보4 결과를 소급하지 않는다.

웹 타이틀 초기 두 비교 캡처는 실제 타이틀 미노출로 비교 증거에서 제외했다. 클릭 전파를 통한 상태전환 대신 검수 전용 응답에 원본 nextPhase 호출 훅만 노출해 같은 원본의 정지 원화/메뉴를 캡처했다(browser3b5f1855). 제품 웹 파일 수정0, OS입력/NW.js 검수로 세지 않는다.

확대 범위26폴더는 DESIGN_REVIEW_APPLY.md에 승인/거절/미판정/참고·결과 자료로 분류했다. pending_grid.png의4후보는 반입하지 않는다. 지뢰·그 밖의 공통 창/HUD 승인 원화의 후속 대조는 계속 진행 중이며, 전체 브리프 완료가 아니다.


## 공통 창 후속 대조용 기존 캡처 확장

기존 --unity-ui-finish-capture의 -ui-phase art에 HUD·인벤토리·스킬·능력치·대장간·설정의 실제 기존 열기 함수를 추가했다. 1920×1080/1600×900 정지 화면을 격리 sandbox에서만 저장한다. 같은 시점 유니크27종 원화 로딩 수를 기록한다. 이는 비교용 관측이며 플레이·세이브·새 아트 채택 PASS가 아니다. 기존 settings/hud/pause 검수 경로는 유지한다. 웹 공통 창 캡처41da3855는 실제6화면·pageerror0이며 네트워크 유휴 대기 대신 DOM 로드와 실제 진입 상태를 사용했다. 결과는 웹_공통창보드.png 및 개별1920 원본에 보존한다.


## 공통 창·유니크·지뢰 현행 원화 후보7

| 대상 | 현재 계약·변경 | 근거 |
|---|---|---|
| 공통 창 | 실제 후보6에서 옛 금색 확인. 현행 웹 고정 판·설정·대장간·능력치·스킬3D를 재추출. 원본 프레임을 유지하며 신규 그림0 | 빌드12107b3c·Player75260380, candidate6_공통창보드.png → 재추출/ |
| 팔레트 | 기존 승인 변환과 같은 HSL 18~65°·S≥.08, 어두운 적갈색 S<.4/L<.25. S>.6 등급/원소색 보존. Y=.2126R+.7152G+.0722B, Y≥180이면(Y+3,Y,Y−6), 그 밖(Y−2,Y+1,Y+1), 0~255 반올림 | ui-assets/팔레트변환_20261030.json의484개 리터럴·19파일. 게임 데이터·3D·VFX 팔레트 불변 |
| 글자 | 같은 Linear IMGUI 글자 보정만 공통 UI에 적용, GUI 텍스처/조명 불변. 실제 버튼·필드 입력 경로 유지 | NativeSilverHellUi.Label/Button/TextField |
| 스킬 배치 | 현행13슬롯/111구슬 DOM 좌표, 슬롯 중심y221·70px, 제단393/295.64/1134/671.36, 정보판74/316.64·제목28·본문16/28, 버튼40h, 닫기y998 | skill_defs_web.json·재추출/스킬_현행배치.json. 스킬·비용·상태 규칙은 기존Core 유지 |
| 공통 표면 | iron/socket 현행 바이트, plate/rail은 이전 픽셀 동일로 출처 확인 후 현행 WebP 무손실 디코드. 320/480 타일 유지. 봉안함은 기존 레시피에 현행 은빛 색·원본을 사용 | ui-assets/원화출처.json |
| 유니크 | uniqueArt가 있으면 동일 웹 투명 컷아웃27종을 일반 슬롯 원화보다 먼저 사용. 누락은 기존 일반 원화 폴백 | 수정전0/27 재현. 실제 IconTexture 우선 반환·장착창 검사 예정 |
| 지뢰 | 기존 ward sheet 왼쪽, 추적/드루이드 지름2R·무장전.46/후.78~.96, 회전.00035rad/ms. 일반탄112px·life/ml<.35 임박, .76/.84+.18맥동·53px 황색링 | 웹 DRUID_POISON_PROJECTILES 10-29 계약, sourcePNG 동일 SHA. 이동·피해·패링 Core 불변 |
| 선택 이름 | 중앙x680, 이름36/.16em·y993.6/54h, 직업11/3.52px·y974.2/15.4h | 현행 선택 로비 CSS, 기능·슬롯 쓰기 불변 |
| 검수 확장 | 실제4개 지뢰 렌더/폴백0·Core틱/HP 불변, 실제 유니크27개 우선 반환·부화면3개. 강제 상태 정지 장면은 자연 전투와 구분 | -ui-phase art·격리 sandbox 전용, 실패 시 종료2 |

후보7은 독립 컴파일 오류0이며 실제 빌드·변경 장면·M1은 다음 영수증을 기다린다. 후보5의21검사·1740문자/누락0·인장32:9 양옆 RGB0·실제 대기 영상 연속 변화는 candidate5-추가계측.json에 보존한다. source7390365는 공통 창 관측만 추가한 기준이며, 후보7의 새 UI 원화 판정으로 소급하지 않는다.

### HUD 후속 수정

| 항목 | 현행 계약 |
|---|---|
| 미니맵 틀 | origin/main `img/mm_frame_ring_20261028.png` 동일 바이트, 기존 166×166의 0.85배·(8,8)·불투명도0.94·밝기1.05 |
| 지도·마커 | CSS #mm의 130×130 원형 clip. 비정방 지도는 원본 캔버스 높이 mapH+8을 표시 높이130에 맞춤. 전사 원본 초상14px, 기존 검정·흰 원·방향 삼각형. 현재 생성 가능한 전사 기준이며 실버테일 원본도 보유 |
| 구슬 | 웹 sRGB 상수를 Linear 프로젝트의 셰이더 출력 직전에 GammaToLinearSpace로 변환. 알파·수위·배치·Core 자원값 불변. ReadPixels 검사도 원본 sRGB 기준으로 통일 |
| 검수 | art fixture에서 실제 키 릴리즈 관측을 호출해 입력 fence로 창이 비활성 표시되는 오류 수정. 실제 GPU HP 색 원본 대비 최대오차3/255 검사 추가 |

위 후속은 후보8 빌드·실제 화면·M1 확인 전이다. 이전 후보7 수치와 혼용하지 않는다.

유물 부화면의 정적판도 현행 웹에서 기존 static 숨김 CSS로 다시 추출했다(1836×858, sha256 098b5c227460a0f7d1bfec62cce9feea4cdcb14db4c69dec69987f6e18d2835e). 구형 금색 제목·문양을 현행 은빛 제목·눈 문양으로 교체하며 미이식 유물·소켓석 데이터는 유지한다. 전수대조 도구는 ui_·ui_refs·ui_icons SVG 및 원화출처 동적 경로까지 조사한다.

후보8 cc144c33 빌드 오류0. 실제 Player 7d0236ff는 HP 원본 색 최대오차3.97/255로2검사 FAIL(1920/1600), 나머지 유니크27/27·지뢰4/폴백0 통과·창0·잔여0. 원인은 GammaToLinearSpace의 어두운 채널 근사이므로 SourceLinear를 IEC sRGB 분기(≤.04045는/12.92, 그 밖((v+.055)/1.055)^2.4)로 수정한다. 허용오차3/255는 유지한다. 임박 지뢰 링은 기존 공유 additive 셰이더가 sprite vertex tint를 사용하지 않아 흰색이었던 원인을 확인, 해당 링 텍스처에만 원본 #ffd84a를 기록한다. 공유 셰이더·다른 VFX는 불변. 다음 정확 후보에서 재검수하며 후보8 실패를 보존한다.

후보9 288598f7 빌드 오류0·b500aac4 공통6검사 PASS·HP색오차0.25/255·유니크27/27·지뢰4/폴백0, 첫인상33a4c0d3 21검사 PASS. 1x에서 추가 발견한 결함을 수정한다: 전체 Art/ui·skill_icons 고해상도 원화203개 메타의 mipmap/Trilinear와 CPU 파생 knightLit mipchain을 사용해 축소 반짝임을 줄인다. 원본 바이트·월드/적 원화 필터는 보존. 대장간 정적판의 제목은 이미 원문이 포함되므로 Native 중복 덧쓰기를 제거하고, 악의 텍스트만 숨겨 실제 수치를1회 표시한다. 스킬 해금 경고는 learned && slv≥SkillLevelLock(playerLv) && slv<20일 때 Lv(lock×50)로 표시하고, 라틴 문자는 기존 Cinzel400을 사용한다. Core 강화 수식·비용은 불변.

8b0945a4d의 대장간 수치 분리 추출에는 로딩 화면이 잘못 저장돼 채택하지 않았다. 자기 빌드10은 실제 Unity 진입 전 대기 상태에서 취소했고 다른 실행은 보존했다. 후속 추출은 G.on=true·intro=false·#forge.panel.on·(470,12,980,1056)를 확인하고 제목1회·악의 텍스트0인 원본 판을 직접 검수했다. 잘못된 캡처는 재추출/실패_대장간_로딩중.png로 보존하며 정상 판 SHA256 cd6a18367657c3848349903033e15f16ae8166f8a93440c2280f60e69f7d7187를 사용한다.

## 2026-10-30 사용자 최우선 수정 — 타이틀 메뉴

메뉴 글자가 거의 보이지 않던 원인은 GUI.color에 남은 구분선 알파0.1이며, 각 글자 직전에 Color.white 복원·Linear 글자 채널 보정을 적용한다. 로고 그림자 뒤 복원도 유지한다. Hahmlet300·18px·자간2.52px·(116,436)·380×48 배치는 그대로다. 선택은 붉은 배경/발광점 대신 (행왼쪽+13,중심y−0.5)의16×1px 은빛 #e6e3dc/알파0.6 헤어라인과 밝은 문자 #f2f0ec만 사용한다. 웹 index.html도 같은 규칙의 별도 제작 후보를 만든다. 웹 현행 §17-2에 따라 인장 ENTER는 옛 intro.mp4를 건너뛰고 canonical WorldMovie로 직결하며 오래된 문 영상 단계로 되돌리지 않는다. 최신 실제 빌드·1920/1x·M1·바탕화면 결과는 I:/EXODUSER-Storage/demo-art/unity-ui/title-priority-2026-10-30T01-19-03-079Z/REPORT.md에 기록한다. 코드 생성만으로 완료로 세지 않는다.

### 최우선 타이틀 실제 마감 근거

| 항목 | 정확 후보·결과 |
|---|---|
| 제품 입력 | 7eacb120b016008b219a039588ce396dc5f917e8, Unity tree a3e6ed33bfd313c5b8fa78103fea14ee1cbdadd3 |
| 빌드 | 510c4322,6000.6.7f1 Win64 x64,Succeeded/errors0 |
| 첫인상 | 790d5292,21/21,일반판3행·5직업·안내4단계·인장1920/3840 |
| 전체M1 | 53970f75,23/23·32프레임,실제 NativeGame/API·가속 Simulation.Tick이며 OS손조작 아님 |
| 키·첫 흐름 | 8211c6e7,Up/Down/W/S 순환·기타키무시·Enter→인장→WorldIntro·Escape5초→Lobby. 자연 영상 끝까지 시청과 별개 |
| 실행 안전 | 세 Player 모두D3D11 RX9070XT·정상종료0·사용자창0·잔여0·USER_SAVE0 |
| Runtime SHA256 | 3b3c61e4f9e45ab5108295437e4f60e20bb2d128bc9ed721f7c17bd344724742 |
| Core SHA256 | b3f0374290192fee3d81339641f7d4e5e1014bd47c7201548a40d8316cf228ce |
| 웹 비교 | d22ce8bd1 제작 후보에 동일 은빛 수정만 적용. 일반판 빌드타깃을 맞춘1920 원본+1x,레이아웃/원화 변경 없는 QA 타이틀 노출 훅. 페이지 오류0 |
| 직접 판정 | 메뉴 글자 매몰·붉은 띠/점 핵심 결함 해소. 같은 크기 구도/행/서체/색의 큰 차이0, 글리프 래스터/70ms 선택시간 등 미세 차이는 남음. 전체게임/실시간3D무대는 RETOUCH 유지 |

근거 폴더: I:/EXODUSER-Storage/demo-art/unity-ui/title-priority-2026-10-30T01-19-03-079Z/. 타이틀 title_lobby_compare_title_1920.png·title_lobby_compare_menu_1x.png를 직접 확인했다. H5 코드 후보는 main 게시와 구분하며 정상 공통 소스·일반 바로가기 최종 readback은 같은 폴더의 전달 영수증으로 확인한다.


## UI 2단계 로비·캐릭터 선택 UI 후보

| 요소 | 구현 계약 |
|---|---|
| 공통 판 | 기존 panel_frame150px→기본75px/outset24, 캐릭터 정보판28px/outset8. 원본9-slice·철판 iron_480 알파.14 합성, 실제 원화 누락은 기존 어두운 배경 폴백 |
| 로비 입장 | (1428,722)400×76, Hahmlet300 22px·자간3.08 중앙. 같은 원화 주 버튼, 선택 없음은 흑철/명도.52·글자Dim·입장 비활성 |
| 캐릭터 판 | 기존380폭 정보·플레이 방식 위치/내용 유지, SVG에서 나온 대각선 모서리 대신 같은 원본 금속 프레임 사용 |
| 캐릭터 행동 | 기존 취소/생성180×44 히트 영역 보존. 각 판 x+8/폭−16,3-slice 원화. 생성만 진홍, 잠긴 직업은 흑철/명도.45·생성 비활성 |
| 상태 | 실제 호버·눌림 명도는 공통ActionPlate(.78~1.18/.74). 모든 기존 슬롯/이름/삭제/입장 규칙 보존 |
| 소유권 | 3D 무대·모델·Animator 수정0. 현재 기존 장면을 보존하고 UI 판만 변경 |

이 절은 후보 사양이며 실제 빌드·1x·M1 전 미검증이다. 공통 판 안쪽 철판 질감은 튜토리얼에도 적용되므로 같은 정확 빌드에서 재확인한다.


## UI 2단계 튜토리얼 후보

| 요소 | 현재 계약 |
|---|---|
| 서체 | Hahmlet300,없으면 기존Nanum Myeongjo. 대사/제목/본문/키 가짜Bold 제거·Normal, 기존 반응형 크기·자간·행높이 유지 |
| 보조 행동 | 건너뛰기 한국어178.72×46/그 밖168×46, 기존 흑철 원화 |
| 주 행동 | 다음/시작192×52, 오른쪽 정렬 x=53+본문폭−192, 기존 진홍 금속 원화. 이전168×46보다 넓고6px 높음, 기존 하단40px 중34px 여백 확보 |
| 버튼 글자 | Hahmlet300 16px·자간3.84px·중앙. 초점/호버는 기존 광채·명도1.18, 눌림.74 |
| 진행 | 기존4단계·실제행동·키/패드·클릭·길게건너뛰기 보존. 홀드 진척 색은 은빛(.72,.74,.74)/알파.20,판불투명도와 연동 |
| 판 | 기존720폭/화면−96·9-slice150→75/outset24·철판질감.14 유지, 새 원화0 |

제품 기능과 시각 완료는 별도다. 이 절은 실제4단계1920 Player·1x·M1 전 미검증이다.

UI 2단계 안내 캡처 정정: 기존.2초 대기는 실제250ms 단계 전환 방지에 걸려 캡처 파일4장이 네 실제 단계를 보장하지 않았다. 현재.3초 대기+GuideStep0/1/2/3·Curtain 검사를 추가해 총26검사로 확장했다. Core/실제 입력 타이밍 변경0. 긴 키 안내의 ` / `만 폭 초과 시 줄바꿈한다. 수정 전 재현·수정 후 Core 검사와 정확 Player 결과는 UNITY_UI_PHASE2_20261030.md 최신 절을 따른다.


## UI 2단계 설정 창 후보

| 요소 | 현행 계약 |
|---|---|
| 서체 | 한국어/영어 Hahmlet300,없으면 기존 Nanum Myeongjo/동봉폰트. 일본어 및 지역별 CJK/Thai/Arabic 등 기존 폴백 유지 |
| 행동 버튼 | 기존 실제 히트 영역·좌표·높이 유지, 원화 판은x+8/폭−16·3-slice174→40·outset14, 장식이 인접 버튼을 넘지 않게 구성 |
| 버튼 글자 | 기존16px 가짜Bold→14px Normal Hahmlet300, 가운데·뼈색. 현재 BtnW 계산은 기존16px 기준이어서 글자 여유를 보존 |
| 초점 | 이전 금색240/186/102·(.94,.73,.4)→은빛230/227/220·Bright(242/240/236). 실제 초점·선택 상태와 포커스 테 위치 보존 |
| 상태 | 선택/호버 명도1.18·기본.78·눌림.74, 옵션 값·체크·슬라이더·선택목록 및 저장 콜백 변경0 |
| 창·구획 | 기존 window_base 금속 원화·4탭·본문 스크롤·고정 닫기·키 설정 구획 유지 |

실제1920/1600의4탭·스크롤·팝업·KO/EN/JA/DE·설정 값 왕복·일시정지 경로 확인 전 미검증이다.


### 설정 후보2 — 작은 부품·키 설정 후속

후보26d6785d4·빌드 Succeeded/errors0·실제508f6f84는 1920/1600 4탭·스크롤·팝업·EN/JA/DE 총18장, 실제 옵션값80→78(1씩2회)·격리 저장 saved/loaded/same 모두True였다. 기존 로그의 'two Left steps of 5'는 오래된 설명이며 실제정의 step1과 일치하는 감소량2가 맞다. 판정은 키 설정의 옛 금색·이모지와 좁은 보조 버튼 장식 때문에 RETOUCH다.

| 항목 | 후보2 계약 |
|---|---|
| 일반 설정 버튼 | 원본3-slice edge22/outset4, 기존 히트 영역·16px Normal Hahmlet300. 본문·버튼 여백 보존 |
| 키 목록 | Hahmlet300·기존 지역 폴백, Linear 글자 보정. 기존 승인 팔레트 변환을 NativeKeyBindList 한 파일의45리터럴에만 적용, 선택 대기의 밝은 글자도 은빛 |
| 키/탭/초기화 | 같은 원본 금속 판, 키 edge12/outset0, 두 입력모드 탭 edge22/outset2, 초기화 edge22/outset4. 비어 있는 보조 키는 알파.38 |
| 이모지 | 번역 조회 뒤 표시문자에서⌨/🎮만 제거. 저장 키·번역 원문·글리프 마스터는 보존, 패드 미이식 상태를 숨기지 않음 |
| 공통 기본 | ActionPlate 기본edge40/outset14 불변, 기존 메인/입장/생성/안내 판의 배치 변화0 |

키 입력/충돌/보조 삭제/F5/마우스120ms 캡처·저장 정책 변경0. 실제 새 Player·1x·M1 전 미완료.


### 설정 스크롤·긴 번역 재현과 수정

후보32e8362ee·빌드83603058·실제a793d629에서 좁은 금속 부품/키 목록 은빛/이모지 제거는 확인했다. 추가 keys199908a8은 대기·패드·정지 유지7/7이지만, 조작 탭 끝 캡처가 비어 있었다. 원인은 DrawItem이 높이0인 K.Keys 앵커의 yMax만 보고 자식 목록을 전부 cull한 것이다. 실제1600 PNG 본문 밝은픽셀 검사는0/최소500으로FAIL을 재현했다. K.Keys의 하단 판정에 실제 keyList.ContentHeight를 포함한다.

독일어의 프리셋4개는 단일행 누적으로818px를 넘어 캐릭터 카드에 가려졌다. 버튼 폭을818px로 제한하고 다음 버튼이 열을 넘으면52px 아래 줄로 보낸다. 그만큼 후속 게임 옵션·구분선·리셋/종료 행도 함께 이동하며 본문 스크롤/고정 닫기는 유지한다. 그래픽 프리셋도 오른쪽882~1700px 안에서 같은52px 줄바꿈을 사용하고 뒤 옵션/진단 구역을 이동한다. 긴 슬라이더 수치는 실제15px Bold 폭+8을 기준으로 최소112~행폭34%를 예약해 손잡이/값 겹침을 제거한다.

캡처는 실제 스크롤 후 키 목록 사각형 갱신, EN/JA/DE 각각 프리셋4개가 왼쪽818px 안, shake step1×2, NativeSettingsStore/프리셋 왕복을 실패 조건에 포함한다. 검사 원문이 말하던 '5씩'을 실제1씩으로 정정했다. 입력·옵션 값·저장 형식·게임 로직 변경0. 다음 정확 빌드/직접1x/실제 검사/M1 전 미완료.
