# 전체 UI 통일 — Hell Gothic

> 2026-09-28 현행 로비는 묘왕 바르칸의 투명 24프레임 스프라이트(`varkan_idle_v1.png`, 셀384×624, 12fps 왕복)와 독립 묘실 배경 영상(`lobby_varkan_crypt_loop_v1.mp4`)을 표시한다. 선택 상태와 무관하게 전대 이름/소환 표제를 유지하고 슬롯 선택은 입장 활성 상태에 반영한다. 정적 어깨 대검 원화 및 과거 영상 계약은 제작 이력이다. 현행 규격: [로비 전대 표시](<../3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md>).


> 2026-09-27 인벤토리 최신 창 규격은 [장비 시스템 최신 절](../2_7%20인벤토리+장비시스템/2_7%20인벤토리+장비시스템.md)의 `100dvh−24px`(620px 이하 `−8px`) 및 장비/가방/정보 가변폭 1.28fr/clamp(400px,30vw,600px)/1fr이다. 아래 기존 270px 장비 행과 680px 창 높이는 당시 제작 기록이다.

사용자 승인: 2026-09-24 ui_hell_concept.png의 고딕·악마·지옥 분위기로 실제 UI 작업 진행. 검은 철, 악마의 뿔과 날개, 붉은 지옥불, 밝은 뼈색 문자를 공통 언어로 사용한다. 기존 Iron Covenant는 이전 제작 방향이며 현재 SSOT는 아래다.

## 2026-09-25 공통 UI 현재 적용 계약

최종 표면·버튼 상태·슬롯 음영은 UI_COMPOSITION_20260925.md의 디테일 마감 절을 따른다. 기존 기본표에서 동일 항목의 색·그림자는 해당 절이 우선한다.

2026-09-24 전체화면 Hell Gothic 구성은 2026-09-25 재구성으로 대체됐다. 사용자 제공 Diablo IV/POE2 화면의 구획·정렬·재질 규칙을 반영했다. ui-foundation.css 뒤에 ui-refinement.css?v=20260926-10을 로드하고 게임 두 HTML은 ui-panels.js?v=20260925-1을 defer 로드한다. 전체 세부 수치·컨트롤 목록·에셋 생성 기록의 SSOT: docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md.

| 대상 | 현재 계약 |
|---|---|
| 설정 | 왼쪽 min(680px,100vw−24px), 게임/화면/사운드/조작/시스템 5탭, 본문만 스크롤, 자동저장/닫기 고정 |
| 장비 | 오른쪽 clamp(640px,36vw,780px), 화면폭−24px 상한. 장비/유골함/보석/보관함 탭(보석은 전용 그리드, 나머지는 기존 가방), 필터 접기. 폭≤780은 화면폭−16px. 유골함·보관함 탭은 폭min(980px,100vw−24px)/높이min(680px,94vh),왼쪽 가방·오른쪽 각 전용 패널 동등폭(폭899px 이하 상하) |
| 스킬/대장간/창고 | 각각 최대1020/980/700px, 화면폭−24px 상한. 스킬 왼쪽, 대장간/창고 중앙 |
| 성장 | 기존 전체화면/인체 트리 유지, 공통 표면/내비게이션 마감 적용 |
| 재질/프레임 | iron.png 1254×1254,480px 반복+감광 CSS. 3px double선, 기존 frame.png 22%/24px/opacity.65. pbox 상단 문장 제거, 설정/대장간/창고 제목에144×48px 문장 |
| 공통 크기 | 패딩18px22px20px, 폭≤780은14px. 메뉴최소32px/12px, 분류최소35px/13px(작은화면12px), 설정행최소42px |
| 입력 보존 | 기존 노드/ID/리스너/값/자동저장 유지. 분류 탭만 새 DOM. 키보드 좌우/Home/End 지원. 새 라벨 한국어/영어, 기타언어 영어 폴백 |
| 월드/HUD | 패널 뒷배경은 검정 반투명 그라디언트. 기존 메뉴 중 HUD 감춤/일시정지 유지. 패널 동시열기 미구현 |
| 튜토리얼/로비 | ui-foundation.css의 2026-09-24 튜토리얼/로비 전용 계약 유지 |

## 튜토리얼·안내 패널

| 항목 | 현재 구현 |
|---|---|
| parryLesson | opacity1. 부모 transparent/border0/box-shadow:none, 내부 ::before padding-box에 기존 어두운 배경 유지(2026-09-27 정정). 패딩68px 24px 20px. 장식 프레임·문장 유지 |
| 프레임/문장 | frame.png slice22%/40px, crest.png 174×58px·top6px. 이미지 레이어 pointer-events:none; 실제 체크/텍스트/버튼은 DOM |
| 작은/낮은 화면 | 폭≤760 패딩18px 20px 16px, 문장 숨김, 행12px·패딩5px. 폭>760이면서 높이≤700 패딩54px 20px 16px, 문장120×40px·top6px. 기존 최대 높이·본문 스크롤·하단 버튼 고정 유지 |
| 현재 목표 | 행14px/줄높이1.6, 패딩7px 8px, #fff0df, #551819aa→#25101166 배경, 선 #a34d3f, 왼쪽2px #ec7958. 완료 #b2d6ac. 마법/물리/성공 게이지의 의미 색 유지 |
| 키캡/안내 | art 높이64px(실습50px), 키캡 글자 #fff0df. 본문 #e8d9c6/줄높이1.7, 부제·안전문구 #c2b6a9 |
| 행동 버튼 | 시작 최소44px, 붉은 CSS 버튼/글자 #fff0df. 건너뛰기 최소36px, 선 #665044·배경 #1d1413·글자 #dccbb6. 하단 여백/진행바 margin-top12px |
| 상태/진행 | 1·2단 실제 통과 조건·단계·키바인딩·세이브·자동 진행 유지. 장식은 성공 판정에 관여하지 않는다 |
| 시스템 안내/배지 | systemLesson·tutorialBadgeCollection opacity1, #281413f5→#100d0ef5, 선 #805443. 시스템 버튼 최소36px, #351011 배경. 뒤쪽 parryLessonBackdrop opacity.5 유지 |

## 에셋과 생성 정보

연결된 OpenAI 이미지 생성 도구(image_gen)를 사용했다. 모델 식별자는 도구가 노출하지 않아 추정하지 않는다. 사용자 승인 시안을 참조해 문장과 9-slice 프레임을 각각 생성했으며 별도 후처리 없이 PNG 알파를 보존해 복사했다.

| 파일 | 규격/용도 | 생성 요청 |
|---|---|---|
| img/ui/hell_gothic/concept.png | 승인 시안 원본; 런타임 로드 안 함 | 고딕 성당·흑철·악마 문장·붉은 지옥불, 장비창/튜토리얼/HUD, 읽기 쉬운 중앙 |
| img/ui/hell_gothic/crest.png | 2172×724 RGBA, 1,283,642 bytes, 단일 장식/프레임 셀 없음 | 시안의 상단 악마 문장. 정면 대칭 흑철 해골·긴 뿔·박쥐 날개·붉은 눈, 3:1 실루엣, 투명 배경, 텍스트/패널/배경 없음 |
| img/ui/hell_gothic/frame.png | 1254×1254 RGBA, 821,639 bytes, 단일 9-slice 프레임/애니메이션 없음 | 시안의 흑철 이중 레일·뼈 형태 고딕 조각·핏빛 법랑·불씨. 네 모서리 악마 장식, 신축 가능한 직선 중앙 레일, 완전 투명 중앙, 텍스트/중앙 문장 없음 |

CSS 이미지 실패 시 solid 배경/테두리/DOM 글자·버튼이 남는다. 알파 합성은 normal이고 screen·검정색 키잉을 사용하지 않는다. 에셋 경로는 img/ 아래이며 NW.js 기존 img 폴더 전체 복사에 포함된다. iron_covenant_20260924의 button.webp와 frame.webp는 인벤토리 금속판·내부 레일에 재사용한다. divider.webp는 사용하지 않는다.

## 검수 기록

실제 Chrome localhost:3333에서 확인했다. 테스트 슬롯 hell-ui-review를 사용하고 사용자 캐릭터의 장비나 성장 투자는 변경하지 않았다.

| 확인 항목 | 결과 |
|---|---|
| 1920급 | 설정·장비·튜토리얼·HUD·로비에서 악마 문장/프레임과 색 적용 확인 |
| 1280×720 | 설정·장비·대장간·스킬·성장·창고 전환 및 스크린샷 확인. 성장 전용 padding 충돌 수정, 장비 영역 최소220px 확보, 설정 수치 열76px로 잘림 개선 |
| 768×720 | 장비 화면 세로 스크롤, 메뉴3열×2행, computed font14px·높이42px 확인 |
| 튜토리얼 | opacity1 및 안내/시작/건너뛰기 버튼 확인. 실습 패널 중 배지 visibility:hidden 확인. 기존 건너뛰기 버튼으로 종료 후 메뉴 전환 확인 |
| 이미지/폴백 | frame/crest hasAlpha:true 및 브라우저 실제 합성 확인. CSS 단색·테두리 폴백 포함. 네트워크 실패 강제 주입 검사는 하지 않음 |
| 범위 | UI의 실제 화면 검수. 전체 다국어·게임패드·패링 전투 회귀 완료를 의미하지 않음. 게임 로직과 데이터 변경 없음 |

앞선 세션의 브라우저 연결 차단은 새 작업 탭 생성으로 해결했다. 승인된 콘셉트의 분위기를 기존 게임 UI에 적용한 버전이며, 시안의 아이템/전사 그림을 통째로 게임에 대체하지 않았다.


현재 공통 프레임·제목 및 독립 창고 선택/이동 UI는 `UI_COMPOSITION_20260925.md`의 **2026-09-25 조각 프레임·창고 슬롯 개편 절**을 따른다. 이전 중복 수치는 해당 최신 표로 대체한다.

최신 제목판·설정 본문 틀·키 설정 정렬/키캡 규칙은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 금속 마감 보강 절**을 따른다.

최신 제목판·설정 본문 틀·키 설정 정렬/키캡 규칙은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 테두리 중첩 수정 절**을 따른다.

게임 메뉴의 최신 문장·프레임 에셋과 표시 규격은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 Blackiron 아트 교체 절**을 따른다. 과거 생성 기록은 이력이며, 로비/튜토리얼/HUD의 기존 에셋 계약은 유지한다.

인벤토리의 최신 제목·텍스트·박스 규격은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 인벤토리 텍스트·박스 정비 절**을 따른다. 다른 메뉴와 기존 아트 생성 기록은 유지한다.

인벤토리의 최신 박스·슬롯·텍스트·조작부 계약은 UI_COMPOSITION_20260925.md의 **2026-09-25 참고 화면 조사·인벤토리 디테일 통합 절**을 따른다.

최신 메뉴 문장 에셋과 알파·표시 규격은 UI_COMPOSITION_20260925.md의 **2026-09-25 흑철 해골 문장 원본 교체 절**을 따른다. 이전 문장 생성 기록은 이력으로 보존한다.

메뉴 문장의 최신 원본과 표시 규격은 UI_COMPOSITION_20260925.md의 **2026-09-25 해골 문장 재생성 — skull2 절**을 따른다. 직전 skull.png는 사용 중단한 제작 이력이다.

설정 화면의 최신 제목·박스·탭·키·버튼 재질은 UI_COMPOSITION_20260925.md의 **2026-09-25 설정을 인벤토리 스타일로 통일 절**을 따른다. 생성 가죽판은 채택하지 않으며 기존 인벤토리 에셋을 재사용한다.

설정·인벤토리·스킬의 최신 중앙 제목판과 본문 구획 계약은 UI_COMPOSITION_20260925.md의 **2026-09-26 정보 배경과 통합 제목판 절**을 따른다. 이 세 창은 skull2.png 대신 header.png를 사용한다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 전체 메뉴 마감 절**을 따른다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 슬롯과 상호작용 마감 절**을 따른다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 유니크 분해 NaN 수정과 상세창 마감 절**을 따른다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 창고와 상세 스크롤 마감 절**을 따른다.


## 2026-09-27 인벤토리 중복 제목 제거

사용자 지시: 메뉴 탭으로 인벤토리임을 알 수 있으므로 큰 제목 장식은 제거하고 배낭 공간을 확보한다. 앞선 인벤토리 제목판 118px 계약을 대체한다.

| 항목 | 현재 계약 |
|---|---|
| 인벤토리 제목판 | 직계 헤더의 .ptitle display:none. 제목 이미지와 가상요소도 표시하지 않음 |
| 정보행 | 전투력/악의/닫기 유지. gap0, margin4px 0 8px |
| 높이 배분 | 장비 탭 inv-wrap 첫 행270px, 가방 행 minmax(min-content,1fr). invCenter height:auto/min-height260px,invGrid height140px/flex1 1 140px. 필터 높이를 반영하며 나머지 높이는 가방에 배정. 작은 화면은 기존 바깥 세로 스크롤 사용 |
| 적용 범위 | 인벤토리 내부 장비/유골함/보석/보관함 페이지 공통. 다른 메뉴 제목 유지 |

CSS 캐시 ui-refinement.css?v=20260927-3. 신규 이미지/아이템 데이터 변경/자동 테스트 추가·실행 없음.

정확한 CSS는 UI_COMPOSITION_20260925.md의 같은 절을 따른다.


## 2026-09-27 로비 ENTER 버튼 원본 색상 복원

| 항목 | 현행 규격 |
|---|---|
| 의도 | 사용자 피드백에 따라 로비 입장 버튼의 기존 원본 색상 보존 |
| 에셋 | assets/lobby/lobby_enter_btn.png 유지. 보라색 보석·문양과 밝은 금속색 ENTER 글자 |
| CSS | ui-foundation.css의 .lobby-right .enter-game-btn img 색조 회전·채도 필터 제거. 선택 상태의 이미지 computed filter:none (미선택은 아래 소등 계약 적용) |
| 범위 | 버튼 크기·배치·hover·disabled·입장 동작 유지. 시네마틱 ENTER와 무관 |
| 캐시 | index.html의 ui-foundation.css?v=20260927-enter-original |
| 검증 | 스크립트 비활성 로비에서 원본 이미지 로딩과 computed filter:none 확인. tmp/lobby-enter-original-color/after.png. 로그인·세이브 API 호출 없음 |


## 2026-09-27 로비 프레임 외곽 투명화·장식 확대

| 항목 | 현행 규격 |
|---|---|
| 원인 | .lobby-right 전체의 배경·왼쪽 선·외부 그림자가 알파 프레임 바깥에도 사각형으로 남음 |
| 패널 | isolation:isolate, background:transparent!important, border:0!important, box-shadow:none!important. padding:28px 30px 24px |
| 안쪽 배경 | ::before, position:absolute, inset:22px, z-index:-1, pointer-events:none. 기존 철판·문양·그라디언트 유지, 네 모서리 12px 사선 clip-path로 배경만 제한 |
| 장식 프레임 | ::after inset:0, border-width:48px, border-image-width:48px. 기존 40px 대비 20% 확대. 기존 --ui-frame 이미지·slice22%·stretch·z-index2·pointer-events:none 유지 |
| 원본 이미지 | 수정·생성 없음. 프레임의 기존 PNG 알파 사용, 바깥은 로비 배경이 비침 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-lobby-frame |
| 검증 | 스크립트 비활성 실제 index/CSS, 1280/1600/1920px에서 패널 배경 투명·border0·shadow none·fill inset22px·frame48px 확인. 패널 가로 넘침 없음. tmp/lobby-frame-transparency/after.png 및 report.json. 로그인·세이브 API 미실행 |


## 2026-09-27 캐릭터 선택에 따른 ENTER 소등·점등

| 항목 | 현행 규격 |
|---|---|
| 미선택 | disabled 유지, display:block!important, opacity:1!important, 버튼 filter:none!important. 이미지 grayscale(1) brightness(.45)로 보석·문양 소등, 클릭 불가 |
| 선택 | 기존 _updateCharDisplay(s) 및 온라인 선택 처리의 disabled=false를 그대로 사용. 이미지 filter:none으로 원본 보라색 점등 |
| 선택 해제 | 기존 _updateCharDisplay()의 disabled=true로 소등 복귀 |
| 전환 | 이미지 filter .45s ease, prefers-reduced-motion:reduce에서는 transition:none |
| 배치·원본 | assets/lobby/lobby_enter_btn.png 재사용. 상태 전환 시 버튼 영역 높이 동일, 숨김에 따른 레이아웃 이동 제거. 입장은 별도 클릭 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-enter-light |
| 검증 | 스크립트 비활성 로비에서 실제 _updateCharDisplay 함수만 추출 실행, 번역·배경 교체·캐릭터 영상은 격리. 미선택 disabled/display:block/opacity1/filter grayscale(1) brightness(.45), 선택 disabled=false/filter none, 해제 disabled=true 확인. 두 상태 높이120px 동일. tmp/lobby-enter-light/off.png 및 on.png. 로그인·세이브 API 미실행 |


## 2026-09-27 내부 전체 투명화 폐기

사용자 의도를 오해한 변경으로 폐기. 아래 프레임 안 유지·밖만 투명 정정 규격을 적용한다.


## 2026-09-27 투명화 범위 정정: 프레임 안 유지·밖만 투명

| 항목 | 현행 규격 |
|---|---|
| 사용자 확정 | 230651 스크린샷 지적: 박스 안을 투명하게 하라는 뜻이 아님. 직전 전체 내부 투명화는 오해로 폐기. 장식 테두리 바깥만 투명 |
| 로비 원인·수정 | .lobby-right 자체는 이미 transparent이고 ::before inset22px 안쪽 배경 유지. 최신 단일 장면 규칙에 따라 #lobbyBgImg를 로비 전체로 확장하고 .lobby의 검정 로딩 폴백을 유지. 외곽에 별도 body 배경이 비치지 않음. 카드·배너·버튼·내부 문양 유지 |
| 튜토리얼 | #parryLesson 부모 background:transparent,border0,box-shadow:none 유지. ::before의 실제 border-width18px·border-image-width40px에 기존 radial-gradient(ellipse at 50% 0,#47171288,transparent 48%),#100d0ef5 배경을 padding-box로 제한. 프레임22% 슬라이스·문장 유지 |
| 내부 복원 | 키·현재 행·footer·시작/건너뛰기 버튼·자원 안내·체크박스의 직전 투명 오버라이드 제거. 기존 붉은 현재 행/버튼 및 배경 복원. parryLessonBackdrop도 기존 정의 복원 |
| 캐시 | index.html/game.html/game-easy-test.html: ui-foundation.css?v=20260927-frame-interior, ui-refinement.css?v=20260927-frame-exterior |
| 검증 | Chromium1280×900에서 검수용 줄무늬 배경을 이용해 로비/튜토리얼 바깥만 배경이 비치고 내부는 어두운 배경 유지 확인. 튜토리얼 내부 rgba(16,13,14,.96),padding-box,frame40px,부모border0. 로비 부모/전체 배경transparent 및 내부 inset22px 확인. 실제 CSS 격리 검수,게임 데이터 변경 없음 |
| 기록 | tmp/frame-outside-only/report.json,lobby-after.png,tutorial-after.png,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 로비 장면 배경 한 장으로 통일

| 항목 | 현행 규격 |
|---|---|
| 원인 | 로비 투명 외곽에서 body의 별도 img/lording 랜덤 배경이 노출되어 왼쪽 로비 장면과 오른쪽 외곽 장면이 달라짐 |
| 구조 | #lobbyBgImg를 .lobby-left 내부에서 #lobby 직계 자식으로 이동. absolute/inset0/cover/left center로 로비 전체에 한 장 표시. 기존 _swapLobbyBg의 이미지 선택·전환 및 DOM id 유지 |
| 레이어 | .lobby background:#000/isolation:isolate/overflow:hidden. 검정은 로딩·페이드 시 별도 body 배경 노출 방지용. 직계 배경 z-index0/pointer-events:none,좌우 패널 z-index1,왼쪽 자체 배경 transparent |
| 유지 | 오른쪽 장식 바깥은 동일 로비 장면을 노출. 내부 inset22px 배경·문양·카드·로고·버튼 및 캐릭터 미리보기 유지. 기존 배경3종 선택 정책 유지,새 이미지 생성 없음 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-single-lobby-scene |
| 검증 | 실제 HTML/CSS 격리 브라우저에서 flame 기존 에셋1장으로1600×900 시각 확인. #lobbyBgImg1개/부모lobby/전체화면크기 일치. body에 검수용 마젠타 배경을 두어 외곽에 노출되지 않음 확인. 960×540·1920×1080에서도 전체크기 일치/횡넘침 없음 |
| 기록 | tmp/lobby-single-scene/after.png,report.json,sizes.json,changes.patch. 게임 저장·계정 변경 없음. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 로비 입장 버튼 자동 배율 복원

| 항목 | 현행 구현 |
|---|---|
| 원인 | ui-foundation.css의 고정 max-height 120px 및 낮은 화면 96px 규칙이 index.html의 반응형 배율을 덮어씀 |
| 크기 | .lobby-right .enter-game-btn img: width 100%, height auto, object-fit contain; max-height min(500px,28dvh), 미지원 환경은 min(500px,28vh) |
| 선택 상태 | 선택/미선택 이미지 크기는 동일. 기존 점등/소등 필터 유지 |
| 실측 | 3840×2160: 높이490.17px, 2560×1440:319.14px, 1920×1080:233.63px, 1280×720:148.11px, 960×540:135.14px. 이미지 원본 종횡비 유지 |
| 검증 | 실제 index.html/CSS를 스크립트 비활성 상태로 확인. 5개 해상도 가로 넘침 없음 및 선택 전후 동일 크기. 별도 3개 더미 카드 배치 후 1080/720/540 높이에서 스크롤로 버튼 전체 접근 확인. 로그인·세이브 API 미실행 |
| 캐시 | index.html의 ui-foundation.css?v=20260927-enter-responsive |
| 이전 기록 | 소등 검증 당시 높이120px 기록은 과거 측정값이며 현행 크기 계약은 이 표를 따름 |
