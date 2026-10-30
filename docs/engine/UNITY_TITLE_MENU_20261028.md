# 타이틀 메뉴 이식 (웹 index.html phase 2 → Unity NativeLobby) — 2026-10-28

브랜치 `claude/unity-pc-title-menu-20261028` (intro-skip `65e14f1bb`의 `LobbyKeys` 위에서). 웹 기준 = origin/main `index.html` 494~511(CSS)·4560~4810(`_buildTitleMenu`·`_selectTitleItem`·`_activateTitleItem`·`splashKey`). 디자인 = 디자인총괄 시안(2026-10-27), 사용자 승인 [승인-디자인-5].

## 값 대조 (웹 CSS → Unity `NativeLobby.TitleMenu.cs`, 1920×1080 무대)

| 요소 | 웹 | Unity |
|---|---|---|
| 영상 | `title_motion_20261028.mp4`, 무음 반복, cover, `dx = min(0, max(w−dw, (w−dw)×.62))`, 세로 가운데 | 같은 파일(StreamingAssets/Lobby), 같은 cover 식, `loop` |
| 영상 실패 | `title_bg_20261028.jpg` 정지화 | 같음 |
| 베일 | 4겹: 방사 46%×78% @24% 56% (.62→.38@55%→0), 선형 90° (.55→.18@38%→0@55%), 선형 0° (.7→0@26%), 방사 120%×100% @50% (투명@62%→검정 .55) | 192×108로 굽은 한 장(`BakeTitleVeil`), 같은 식·같은 합성 순서 |
| 로고 | `logo_exoduser.png` (96, 96) 폭 520, 그림자 | 같은 파일·위치·폭, 그림자는 검정 .5 복제(+10px)로 근사(번짐 26px은 IMGUI에 없음) |
| 메뉴 목록 | (116, 436) 폭 380, 위 1px `rgba(230,227,220,.1)`, 행 48px, 행 아래 1px | 같음 |
| 라벨 | 300 18px Hahmlet/나눔명조, 자간 .14em, 왼쪽 36px + .16em, `#c9c7c3`, 그림자 | 나눔명조 Regular 18px, 글자별 배치(자간 2.52px), 같은 위치·색, 검정 그림자 겹침 |
| 선택 행 | 글자 `#f2f0ec`, 배경 90° `rgba(194,26,16,.48)→.16@55%→0`, 점 7px `#ff6a50` + 광채 | 같은 색·띠(`BakeSelBand`)·점(`BakeDot`), 선택 전환 .25초(띠)/.18초(색) |
| 빌드 줄 | 우 36·하 26, Cinzel 600 11px/1.7, 자간 .28em, `rgba(230,227,221,.6)`, `OFFICIAL/EARLY ACCESS/DEMO · v버전` + `FOR DEAR GAMERS` | 같음(Cinzel 가변 폰트, 라벨·버전은 `BuildFlavor`/`release_web`) |
| 페이드인 | 1초 | 1초 |

## 항목 규칙 (웹 `_buildTitleMenu`)

| 항목 | 조건 | 동작 |
|---|---|---|
| 게임 시작 | 항상 | 입장 효과음 + 다음 화면(Title 페이지) |
| 인트로 다시 보기 | 항상 | `ReplayIntro()` (웹 `skip(); _goCinematic()`) |
| STEAM 위시리스트 추가 | 데모·BIC 빌드 (`BuildFlavor.Kind.Demo/Bic`) | 스토어 페이지 열기 |
| 게임 종료 | PC 플레이어(WebGL 제외) — 웹은 NW.js/Electron일 때 | `Application.Quit()` |

한국어 외 언어: 웹은 이 라벨들의 번역 키가 없어 한국어로 남는다. Unity는 기존 `K(ko, en)` 규칙(한국어 아니면 영어)을 따라 `START GAME / REPLAY INTRO / ADD TO STEAM WISHLIST / QUIT GAME`.

## 입력

위·아래·W·S 이동(순환), Enter·키패드 Enter·Space·패드 A 실행, 패드 방향/스틱(`Vertical` 축) 이동, 마우스 호버 선택·행 클릭 실행. 그 외 키와 메뉴 밖 클릭은 무시(웹 `splashKey`, "타이틀 메뉴 화면에서는 아무 데나 눌러 넘어가지 않는다"). 영상 재생 중에도 즉시 실행.

## 검증

| 검사 | 결과 |
|---|---|
| 무창 키 주입(`--unity-intro-keys-smoke`) | 행 3개(전체판: 시작·다시 보기·종료), 선택 0→Down 1→Up 0→S 1→W 0→W(순환) 2→Down(순환) 0, A·Escape·Tab 무시, Enter → Title 페이지, 이후 문 영상·월드 인트로 키는 intro 대조표와 같음. USER_SAVE 변경 0, 에디터 컴파일 오류 0 |
| 1x 나란히 캡처(웹 ↔ Unity) | **보류**: 메뉴는 IMGUI라 무창 배치모드 RenderTexture에 Repaint가 없어 찍히지 않음. 개발툴 숨은 데스크톱 실행기 대기 |
| 시각 판정 | 위 캡처 뒤 |


## 2026-10-30 PC 첫인상 원화 반영 후보

위표는10-28당시의검수이력이다. 현재후보는라벨을Hahmlet300 TTF로연결하고,첫화면은눈알로고+인장락업으로교체한다. ENTER는옛문영상없이현행canonical세계관영상으로직결한다. 1920/3840실제Player와웹비교는진행중이다. [현행수치·출처·결과](UNITY_UI_ASSETS_20261030.md). Mac/source동기화·최종시각완료·바탕화면반영은각각별도다.

## 2026-10-30 사용자 최우선 수정 — 타이틀 메뉴

메뉴 글자가 거의 보이지 않던 원인은 GUI.color에 남은 구분선 알파0.1이며, 각 글자 직전에 Color.white 복원·Linear 글자 채널 보정을 적용한다. 로고 그림자 뒤 복원도 유지한다. Hahmlet300·18px·자간2.52px·(116,436)·380×48 배치는 그대로다. 선택은 붉은 배경/발광점 대신 (행왼쪽+13,중심y−0.5)의16×1px 은빛 #e6e3dc/알파0.6 헤어라인과 밝은 문자 #f2f0ec만 사용한다. 웹 index.html도 같은 규칙의 별도 제작 후보를 만든다. 웹 현행 §17-2에 따라 인장 ENTER는 옛 intro.mp4를 건너뛰고 canonical WorldMovie로 직결하며 오래된 문 영상 단계로 되돌리지 않는다. 최신 실제 빌드·1920/1x·M1·바탕화면 결과는 I:/EXODUSER-Storage/demo-art/unity-ui/title-priority-2026-10-30T01-19-03-079Z/REPORT.md에 기록한다. 코드 생성만으로 완료로 세지 않는다.
