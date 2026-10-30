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
