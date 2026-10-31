# 웹 공통 게임 UI·UX — 2026-10-31

실버 헬 승인 패키지·Hahmlet·2026-10-29 원화 부품을 유지한다. 변경 파일은 web-uiux.css, web-uiux.js, game.html의 _showNextDiffPop 내부 _ndKey, 회귀 검수 test/webUiux.test.mjs다. game.html 연결·패키징은 UI 총괄이 함께 반영한다. 맵·캐릭터·몬스터·전투 판정·세이브 형식·사운드 원본 변경은 없다.

| 현재 차이 | 반영 | 계약 |
|---|---|---|
| 32:9 가장자리 HUD가 중앙으로 밀림 | 2026-10-31 사용자 정정: 미니맵·자원·레벨/처치는 실제 화면 가장자리 | mmWrap=왼쪽 inset+safe-area+8px×ui-scale, mmLvl=오른쪽 inset+safe-area+10px×ui-scale, hudCorner=왼쪽 inset+safe-area+16px×ui-scale. HP·MP 구슬/스킬바 묶음과 모달만 중앙 16:9 유지 |
| 펫·실습/시스템 안내가 중앙으로 밀리거나 구슬을 덮음 | 펫과 안내는 실제 화면 끝, 상태판·하단 HUD 공간 예약 | 펫20px; 고양이는 parryLesson/systemLesson/keyGuide가 열리면 왼쪽20px. 실습 right=clamp(18px,5.185185dvh,56px)/guide-scale, 시스템18px(좁은 화면10px), 키 안내10px. Hahmlet400 유지 |
| 인벤토리 등 공통 전체 창이 초광폭 전체로 늘어남 | 기존 창 자체 폭과 좌우 패딩 제한(현행 스킬 창 예외는 아래 통합 계약) | 3840×1080에서 중앙 영역 x960~2880. 인벤토리 내용 x996~2868, 설정 x972~2868. 기존 설정 zoom에는 안내 배율 분모 유지 |
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

최종 전체 통합: 신규 로비9개·공통16개 및 관련 기존분·패드HUD를 포함해 347/347, project-check 103/103. 당시 캐시 CSS=20261031-final5, JS=20261031-final4. 33화면×1920/3840=66장, 유효 텍스트 범위에서 겹침0. 검수 상태 직접 표시·bosstest 도구 숨김은 자연플레이 증거와 구분한다.


## 2026-10-31 화면 끝 배치 정정 — sidepanel-edge-brief 확장 범위

이 절이 위의 이전 검수·안전영역 해석보다 우선한다. 기존 원화·폰트·전투·성장·세이브 형식은 보존한다.

| 적용 위치 | 현행 좌표·동작 계약 |
|---|---|
| 가장자리와 중앙 구분 | 미니맵·자원·레벨/처치·튜토리얼/시스템/키 안내·펫·일반 알림은 실제 화면 끝. HP·MP 구슬+스킬바 묶음, 대화 모달, 인벤토리·상점·설정·성장 전체 창, 클리어·다음 난관은 중앙 16:9 영역 유지. 큰 모달 안의 내비게이션 열은 그 모달 구성 요소 |
| 실습창 충돌 회피 | web-uiux.js placeGuides()가 mmLvl의 실제 bottom+16px를 상단으로, globeHP/globeMP 본체와 .globe-glass 외곽 장식, skBar 중 가장 높은 top−16px를 하단으로 예약. resize·관찰한 노드 크기 변경 때 재측정. CSS --web-ui-guide-top/--web-ui-guide-bottom, 초기 폴백190px/220px. 실습창 top 및 max-height는 guide-scale로 나누어 zoom 후 실제 경계를 보존. max-height=(100dvh−상단 예약−하단 예약)/guide-scale. min-width761px에서 적용 |
| 레벨·처치 | 실습 중 mmLvl visibility=visible. 기존 패널 열린 동안 HUD를 숨기는 규칙은 유지. 실습 중 훈장 버튼 숨김은 유지하여 보조 팝업 충돌 방지 |
| 시스템·키 안내 | 같은 상/하단 예약을 사용. keyGuide는 overflow-y:auto·border-box. 안내 내용은 기존 내부 스크롤·푸터 동작 유지 |
| 펫 | game.html _petBubbleShow의 _guideOpen은 parryLesson/systemLesson/keyGuide가 hidden=false, display!=none, visibility!=hidden인지 확인. 까마귀 또는 안내 있음이면 _petAtLeft=true, left20px/right auto/transform-origin left bottom. 그 외 고양이는 right20px/left auto/right bottom. 기존 원화480px·ui-scale×ui-text-scale×1.5 보존 |
| 일반 알림 notif | left=왼쪽 inset+safe-area+20px, top=상단 inset+270px×ui-scale, max-width=min(440px,100vw−40px), 왼쪽 정렬. 펫·자원 사이에 배치. 전투 피드백 ph는 중앙·안전 폭 유지 |
| 캐시 | game.html의 web-uiux.css=20261031-edge5, web-uiux.js=20261031-edge2 |
| 검수 도구 | tools/check-web-sidepanel.mjs: 1920×1080,2560×1080,3840×1080,2560×1600 실제 페이지 캡처·가시 텍스트 Range 겹침·HUD 중앙/가장자리·안내/구슬/상태판/펫 충돌 검사. 각 캡처 페이지를 bringToFront한 뒤 전환 완료를 기다려 가시 텍스트0을 실패 처리하고, 실제 게임 캔버스를 다시 그린다. HTTP와 디스크 SHA256 비교. 로컬 forgelab=1&stage=0 Lv1000 테스트 경로·독립 브라우저 저장소를 사용하고 서버 save API는 검수 응답으로 격리. 자연 플레이 검수와 구분 |

대상 화면: 로비·캐릭터 선택·타이틀 메뉴·설정4탭·1-1 HUD·실습·시스템/키 안내·알림·인벤토리/보관함·스킬·대장간/물약 상점·성장·일시정지·클리어·난이도·조작 안내. 최종 실측·이미지·원격 SHA는 지정 sidepanel/REPORT.md와 source-receipt.json에 기록한다.

- sidepanel 체크포인트 a8bd2059c의 pre-commit guard.js가 game.html 줄수 기준을66030→66027로 자동 갱신했다. 이 갱신은 자기 pet 앵커 정리3줄 감소에 대응하며 보호 블록 해시는 바뀌지 않았다. 최종 원격 병합 줄수는 별도 최종 영수증에 기록한다.

## 공통 제목 띠 후속 — 2026-10-31

statwindow-brief 보정2에 따라 web-uiux.css에서 다섯 창 제목64px(40px 투명 원형 메달+24px 글자)·성장 머리64px를 공통화했다. 금빛 헤어라인 중앙을 끊어 은색 메달을 끼우고 중복되던 성장·대장간 배경 눈을 제거했다. 상세 수치와 원화 근거는 [UI_COMPOSITION 최신 절](UI_COMPOSITION_20260925.md#2026-10-31-성장-창과-공통-다섯-창의-얇은-제목-띠)에만 둔다. 통합 game.html CSS 캐시=20261031-edge5. 기존 메달 보정 원본은20261031-round-medallion. tools/check-stat-window.mjs는 --url/--out/--modules 옵션으로 분리 server.cjs에서 두 해상도×다섯 창의 제목/본문/AP/노드 경계·검색·미리보기·요약 닫기·J 재열기·저장0과1x/3x 크롭을 검사·기록한다. 스킬 본문은 다른 담당 소유이며 이번 수정 범위가 아니다.


- 최신 origin/main 9f5db2ac6의 악의구슬 명칭·성장 제목/눈 원화·스킬 창 변경과 정상 병합했다. 공통 CSS의 양쪽 독립 구역과 양쪽 문서 이력을 모두 보존했고, game.html guard 줄수는66032다. 검수는 이 통합본에서 다시 수행한다.

- 병합 후 cinematicGameplayHud의 hudMaliceLabel 기대값만 최신 화폐 SSOT(악의구슬)에 맞췄다. 기존 스테이지/숫자/지역 처치 검증과 게임 동작은 보존했다. 이 테스트 정합은 원격 화폐 표시명 변경을 되돌리지 않기 위한 것이다.

- 병합된 스킬 창은 skill-forge 담당의 최신 전체 화면·좌우 가장자리 정보판·중앙1800px 구성 예외를 보존한다. 인벤토리·설정·상점·성장은 기존 중앙 전체 창이며, 스킬의 좌우 설명/합성 로드맵은 실제 화면 끝이다. 최종 sidepanel 해상도 검수에 이 스킬 창도 포함한다.

2026-10-31 최종 보정: 다섯 창의 눈을 제목 바로 위 중앙에 놓고 기존 원화 중심부의 금속 명암을 높였다. 왼쪽 luminance 마스크·오른쪽 flex 장식을 대체하며 제목 높이44px는 유지한다. 현행 위치·합성 수치는 UI_COMPOSITION의 CTO 최종 보정 절을 따른다.

- origin/main09eec0076의 제목 중앙 눈 보정도 보존 병합했으며 최종 CSS 캐시는20261031-edge4다. 웹 검수 source는 해당 통합 커밋과 HTTP/디스크17파일 SHA256으로 고정한다.

- 최종 장식 경계 보강: 구슬 본체 밖으로44px 나오는 .globe-glass의 변환 후 실제 rect까지 HUD 예약/충돌검사에 포함했다. 1920×1080에서 안내창 하단이 본체뿐 아니라 바깥 프레임 위16px까지 비우도록 한다. 내부 체크리스트 스크롤·시작/건너뛰기 푸터는 유지한다.

- 검수 좌표는 본체 bodyRect와 바깥 장식 rect를 따로 보존한다. 중앙 정렬은 HP/MP 본체의 대칭 앵커를 기준으로, 안내창 충돌은 장식까지 포함한 rect를 기준으로 한다. 기존 원화가 양쪽 모두 약1.8px 좌측 보정되어 있는 것을 중앙 이탈로 오판하지 않으며, 충돌 기준은 완화하지 않는다. 검수도구 회귀2건을 추가했다.

- 원격6d190ff87의 악의오브 최종 명칭·4단계 원화/수거·빈 소켓·초광폭 로딩·64px 메달 제목을 보존 통합했다. HUD 테스트 기대명은 현행 악의오브다. 현재 CSS=20261031-edge5, JS=20261031-edge2이며, 검수 HTTP/디스크 대조는 새 화폐·로딩4모듈을 포함한21파일이다. guard 줄수는65990다.
