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
| 라벨 | 300 18px Hahmlet/나눔명조, 자간 .14em, 왼쪽 36px + .16em, `#c9c7c3`, 그림자 | Hahmlet 300 18px(문자 누락 시 기존 명조 폴백), 글자별 자간2.52px·같은 위치/색. GUI.color 흰색 복원·Linear 글자 보정 |
| 선택 행(10-30 최신 지시) | 웹 후보 d22ce8bd1: 글자 `#f2f0ec`, 배경 없음, 좌13px·16×1 은빛 `rgba(230,227,220,.6)`, 광채 없음 | 같은 배치/색의 1px 헤어라인, 붉은 띠·점 생성 함수 제거. 기존 선택 보간 선택.25초/해제.18초 유지(웹.18초와 미세 시간차) |
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
