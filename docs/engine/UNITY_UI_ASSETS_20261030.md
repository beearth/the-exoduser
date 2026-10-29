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

`unity/Tools/ui-assets/audit.cjs <I: 출력>`는index/game과 직접 연결CSS/JS, UNIQUE_ART27종의원본/툴팁54개,14컷아웃 등111개를 대조한다. 직접참조/동적참조·동일바이트·파생이미지·현재화면에서의실제사용을 구분한다. 로그인 전용·현행CSS에서숨긴이전ENTER·이전CSS토큰은Unity미구현화면과구분한다. 전체목록은 I:/EXODUSER-Storage/demo-art/unity-ui/UI_원화_전수대조.md·JSON이다. 동일 바이트 보유가 실제 화면 사용 증거는 아니다.

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
