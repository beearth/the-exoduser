# 웹 공통 게임 UI·UX — 2026-10-31

실버 헬 승인 패키지·Hahmlet·2026-10-29 원화 부품을 유지한다. 변경 파일은 web-uiux.css, web-uiux.js, game.html의 _showNextDiffPop 내부 _ndKey, 회귀 검수 test/webUiux.test.mjs다. game.html 연결·패키징은 UI 총괄이 함께 반영한다. 맵·캐릭터·몬스터·전투 판정·세이브 형식·사운드 원본 변경은 없다.

| 현재 차이 | 반영 | 계약 |
|---|---|---|
| 32:9 미니맵·상태 정보가 화면 양끝으로 벌어짐 | HUD 가장자리 요소와 패널 내용에 중앙 16:9 안전 영역 | 폭=min(100vw,100dvh×16/9), 좌우 여백=(100vw−폭)/2. 월드 캔버스·전면 어둠은 전체 화면 유지 |
| 펫 자막·실습/시스템 안내가 안전 영역 밖에 남음 | 기존 원화와 원래 좌우·실습창 피하기 계산 보존 | 20px 기본 펫 앵커에 gutter 추가, parryLesson은 zoom 분모 보정, systemLesson은 gutter+18px(좁은 화면10px). 펫 글자 Hahmlet400 |
| 인벤토리·스킬 창이 초광폭 전체로 늘어남 | 기존 창 자체 폭과 좌우 패딩 제한 | 3840×1080에서 중앙 영역 x960~2880. 인벤토리 내용 x996~2868, 설정 x972~2868. 기존 설정 zoom에는 안내 배율 분모 유지 |
| 상단 공통 메뉴가 클릭 전용 div | 기존 노드·onclick 보존, role=button·tabIndex=0 | Tab/Shift+Tab 순환, Enter/Space 한 번 활성. 동적 재생성 메뉴·대장간 fg-tab/fg-i·슬롯팝업 sk-pop-tab/sk-opt·기존 패드 분류의 property onclick과 위임형 sf-orb에도 적용. locked/dis/aria-disabled 제외 |
| 패널 밖으로 Tab 이동·닫은 뒤 초점 유실 | 가장 위의 열린 모달 안에서 Tab 순환 및 단계별 초점 복귀 | gcModal·유물 주머니·스킬 팝업·초기 안내·난이도·클리어·사망·데모 종료·성장 안내 포함. 키 재지정 대기는 기존 입력 담당 우선. 확인창 첫 초점은 gcCancel, 확인·취소 버튼의 Enter/Space repeat만 차단. gc-box 등장 애니메이션의 opacity0 때문에 처음 비었던 컨트롤은 animationend에서 재시도 |
| 사망·데모 종료·레벨업에서 ESC가 설정을 엶 | 기존 버튼 동작으로 연결 | death→toLobbyBtn, demoEnd→demoEndLobby, lvUpScreen→lvUpClose. 난이도 선택·다음 구역 진행을 임의 실행하지 않음. 기존 _panelBack는 유지. nextDiff capture는 초점이 ndBack/ndGo이면 native 버튼 행동에 맡기며 IME 및 Enter/Space/ESC repeat를 차단 |
| title 도움말의 브라우저 지연·키보드 미표시 | 기존 번역된 title을 즉시 도움말로 표시 | pointerover/focusin에서 즉시 표시. 표시 중 title을 비워 지연 중복을 막고 종료 때 원문 복원. 새 번역값이 들어온 경우 덮어쓰지 않음. 승인 hell_gothic/iron.png 재질 사용. 기존 아이템·스킬 상세 미리보기는 해당 UI 소유 유지 |
| 보스 이름판 뒤에 구역 타이머가 겹침 | 보스 표시 중에만 타이머를 이름판 아래로 이동 | body:has(#bossBar.on)에서 top=상단 inset+128px×ui-scale. 보스가 없으면 기존 앵커 유지. 보스 이름 Hahmlet300, HP 최대값만 위 여백4px·줄높이1.2 |
| 장문 알림이 화면 밖으로 넘침 | notif/ph 중앙 배치에 안전 폭 제한 | max-width=안전 폭−48px, white-space:normal, overflow-wrap:anywhere |
| 합성 굵기·평면 행동 버튼 | 제목300, 탭·본문 제어·버튼400 및 기존 원화 버튼판 재사용 | font-family=--sh-font. 패널 하위 명시 산세리프와 HUD·알림·종료·안내 텍스트도 해당 UI 루트 안에서만 정합. 실습/시스템 안내 본문400·제목300, 키캡과 기존 Cinzel 숫자/캡션 보존. 기존 quiet-tier의 높은 특이도·font shorthand를 화면 범위 안에서 덮음 |
| 확인 버튼의 좌우 순서 불일치 | 확인창 취소 왼쪽·확인 오른쪽 | gc-cancel order0, gc-ok order1. 기존 onclick·제작·저장 판정은 유지 |

| 기존 승인 원화 | 연결·표시 |
|---|---|
| img/ui/silver_hell/btn_plaque_20261029.png 1024×198 | 공통 닫기·스킬 행동·설정 시스템 행동 버튼. 3-slice 0 174 fill, 폭28px(작은 스킬22px), 최소 높이40px. 이미지 실패 시 원문·기존 행동이 남음 |
| img/ui/silver_hell/panel_frame_20261029.png 1024×768 | 소형 확인창만 재사용. slice150, 표시52px, outset18px. 큰 공통 창은 기존 승인 blackiron 프레임 유지 |

검수: 신규 행동 테스트16/16 및 설정 제어·인벤토리 초기화·UI 배율 기존 관련분 합계48/48, node --check 성공. 실제 game.html?test=1&demo&bosstest=3에서 G.stage=3·부트 레이어 종료 후 1920×1080·3840×1080 공통5창 좌표를 확인했다. 1680×1050 설정/스킬도 별도 확인했다. 캡처의 테스트 도구 _btPanel만 숨겼으며 자연 플레이 검수와 구분한다.

근거: I:/EXODUSER-Storage/design/web-uiux-20261031/game-ui/의 final-*.png, final-geometry.json, tests.txt. final 접두사가 없는 초기 캡처는 부트/컷씬에 가렸으므로 채택 근거에서 제외한다. docs 전체 관련 키워드 검색899행은 docs-keyword-search.txt로 보존했다. 초기 skillBarGamepadDisplay 3건은 지정 Chrome 채널 부재로 실행 실패했다. 최종에는 테스트 실행기를 설치된 Playwright Chromium·headless·mute로 정합하여 같은 3건 모두 통과했다. 실제 게임패드·NW.js 실기·전체 언어 장문·청취 검수는 별도다.

최종 전체 통합: 신규 로비9개·공통16개 및 관련 기존분·패드HUD를 포함해 347/347, project-check 103/103. 최종 캐시 CSS=20261031-final5, JS=20261031-final4. 33화면×1920/3840=66장, 유효 텍스트 범위에서 겹침0. 검수 상태 직접 표시·bosstest 도구 숨김은 자연플레이 증거와 구분한다.
