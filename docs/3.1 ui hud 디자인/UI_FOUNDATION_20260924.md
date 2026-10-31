# 전체 UI 통일 — Hell Gothic

> **2026-10-28 최상위 기준 추가**: 게임 전체 톤은 [EXODUSER 디자인 컨셉 — 실버 헬](DESIGN_CONCEPT_SILVER_HELL_20261028.md)을 먼저 따른다(사용자 결정: 로고를 메인 컨셉 이미지로). Hell Gothic의 흑철·악마·지옥 분위기는 유지하고, 금속 색은 금·황동 → 은빛 강철, 빨강은 "지옥의 눈"(선택·위험·초점)에만 쓴다. 아래의 금빛 헤어라인·황동 수치는 각 화면을 이식할 때 그 문서의 토큰으로 교체한다.

> 2026-09-29 현행: **미선택 기본 화면은 선대 소환체 · 묘왕 바르칸**, 캐릭터 카드 선택 후에는 해당 CHAR_VISUALS의 원화/아이들 영상과 이름·직업을 표시한다. 데모도 자동 선택 없이 시작하며 카드 클릭 후 입장을 활성화한다. 선택 해제 시 전대 화면으로 복귀한다. 아래 2026-09-28 제작·검수는 당시 이력이며, 현재 선택 표시 규칙은 [기본 전대 / 선택 캐릭터 전환 SSOT](<../3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md>)를 우선한다.


> 2026-09-27 인벤토리 최신 창 규격은 [장비 시스템 최신 절](../2_7%20인벤토리+장비시스템/2_7%20인벤토리+장비시스템.md)의 `100dvh−24px`(620px 이하 `−8px`) 및 장비/가방/정보 가변폭 1.28fr/clamp(400px,30vw,600px)/1fr이다. 아래 기존 270px 장비 행과 680px 창 높이는 당시 제작 기록이다.

사용자 승인: 2026-09-24 ui_hell_concept.png의 고딕·악마·지옥 분위기로 실제 UI 작업 진행. 검은 철, 악마의 뿔과 날개, 붉은 지옥불, 밝은 뼈색 문자를 공통 언어로 사용한다. 기존 Iron Covenant는 이전 제작 방향이며 현재 SSOT는 아래다.

## 2026-09-25 공통 UI 현재 적용 계약

최종 표면·버튼 상태·슬롯 음영은 UI_COMPOSITION_20260925.md의 디테일 마감 절을 따른다. 기존 기본표에서 동일 항목의 색·그림자는 해당 절이 우선한다.

2026-09-24 전체화면 Hell Gothic 구성은 2026-09-25 재구성으로 대체됐다. 사용자 제공 Diablo IV/POE2 화면의 구획·정렬·재질 규칙을 반영했다. ui-foundation.css 뒤에 ui-refinement.css?v=20260926-10을 로드하고 게임 두 HTML은 ui-panels.js?v=20260925-1을 defer 로드한다. 전체 세부 수치·컨트롤 목록·에셋 생성 기록의 SSOT: docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md.

| 대상 | 현재 계약 |
|---|---|
| 설정 | 화면 중앙 width100vw−24px/height100dvh−24px, 폭600px 이하 각각−12px. 게임(시스템 통합)/화면/사운드/조작 4탭, 본문만 스크롤, 자동저장/닫기 고정. 현행 상세: SETTINGS_UI_WORKSPACE_20260929.md |
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
| 시스템 안내 반투명 (2026-09-30 사용자 지시) | 게임 중 `#systemLesson`은 전투를 가리지 않도록 **반투명 + 클릭 통과**: 배경 `#2814138c→#100d0e80`(약 55/50%), 선 `#80544399`, 그림자 `0 8px 22px #0005`, 패널 `pointer-events:none`·버튼/링크만 `auto`(버튼 배경 `#351011b3`), 가독성용 text-shadow `0 1px 3px #000d, 0 0 6px #0008`. `backdrop-filter`는 캔버스 위 매 프레임 비용 때문에 미사용. `tutorialBadgeCollection`은 기존 불투명 유지. ui-foundation.css `?v=20260930-lesson-translucent` |

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
| 정보행 | 전투력/악의구슬/닫기 유지. gap0, margin4px 0 8px |
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


## 2026-10-16 로비 비율·생성/입장 배치 수리 — 현행 우선

사용자 지시인 로비 UI 비율/버튼 수리이며 전투 밸런스 변경이 아니다. 아래 index.html scoped CSS가 이 문서의 앞선 로비 크기·스크롤·입장 배율 표보다 우선한다. 기존 기본 CSS/과거 실측은 이력으로 유지한다.

| 항목 | 현행 구조·계약 |
|---|---|
| 변경 파일·범위 | index.html head 마지막 lobby-layout-20261016 CSS만 추가. 기존 로비 JS/DOM 자식/asset URL byte 불변, 새 제품 asset0. 원본 아트·로고·배경·생성/삭제/선택/입장·데모/요청guard/API·저장 권위 그대로 |
| 패널·카드 | 우측 clamp(340px,35vw,560px), 폭700px 이하100%. 카드 기본84px→높이760 이하76px→560 이하64px→440 이하56px. 카드 gap10px/낮은높이8px, 같은 단계의 저장 카드는 균일 |
| 목록·생성 | 기존 VIEW2·wheel/nav 인덱스 정책 유지. vp 선호=카드2개+gap/최소1개/내부 세로 스크롤. 별도 생성행64px→560 이하56px→440 이하48px. 440 이하 최소 목록122px/nav164px/coarse nav176px로 행 겹침 방지 |
| 입장 | 하단 구분선·margin/padding으로 분리. 기존 이미지 비율·색/점등 유지, max-height clamp(64px,14dvh,132px), vh fallback 동일. min-height64px. 앞선 min(500px,28dvh) 실측은 이전 배율 이력 |
| Steam CTA | 기존 버튼·URL·동작 유지. 버튼44px, 이미지100%×100% object-fit:contain. 높이760 이하/560 이하 보조행48px와 padding2px0. 최소44px 대상과 충돌하던 초기36/32px 검수안을 대체. 원본 PNG 치수는 읽지 않았고 어떤 비율도 contain 상자에 맞춤 |
| 입력 새영향 | 실제 online/local wheel/nav 산술 callback만 own slot/index/event/render/높이178/162/136/120/56 대역으로 신규4군, CSS 외 소스 불변1군·inline4개 구문. 전체 index 초기화·실목록/API·기인수 guard suite 실행0 |
| 레이아웃 검수 | 실제 lobby markup+scroll-vp/track과 ui-refinement 포함4개 linked CSS. own 카드/neutral intrinsic SVG/fallback 폰트 headless13조건. 1366×650 before 생성 bottom444 > content413.97로 잘림 재현. 최종 after 생성 bottom398 <= content458/footer466. 1280×720/800×480/320폭/844×390/coarse·긴이름/빈목록 확인 |
| 보완 이력 | 브라우저 경로2건 미존재, fixture CSS sanitizer2건으로 초기 시도 실패/무효. 이후 짧은높이·CTA placeholder/기존44px 최소·목록 최소공간 새영향 subset 보완. firstWholeClean=false. 새 CTA 자연높이가 닿은 after조건은 그 영향으로 재검수, 440 이하 변경도 해당 subset 검수 |
| 한계 | neutral 비율상자 화면은 실제 원화·폰트/브라우저 완성화면·물리기기/화질 PASS 증거가 아님. 실제 슬롯/생성/삭제/입장/saveAPI·사용자 창/reload·서버·PC 실행0. 아주 낮은 화면의 뒤 CTA는 기존 outer content 스크롤·초점으로 접근 가능, 행 자체와 이미지 fit/버튼 접근 검수 |

아래 CSS 전량이 현행 수치·간격·색·미디어 조건의 정확한 기준이다.

```css
/* Character selection: bounded cards, a separate create row and a compact entry. */
#lobby>.lobby-right{--lobby-card:84px;--lobby-card-gap:10px;flex:0 0 clamp(340px,35vw,560px);min-width:0;min-height:0;padding:24px 28px;justify-content:center;}
#lobby .lobby-content{flex:0 1 auto;min-height:0;gap:12px;padding-inline-end:6px;scroll-padding-block:6px;}
#lobby .lobby-content>.lobby-header{min-height:36px;margin:0;align-items:center;}
#lobby .lobby-content>.lobby-divider{height:104px!important;margin:0;}
#lobby .lobby-content>.char-list{display:flex;flex-direction:column;gap:10px;flex:0 1 auto;min-height:0;overflow:visible;padding:4px;}
#lobby .char-scroll-vp{flex:0 1 calc(var(--lobby-card)*2 + var(--lobby-card-gap));height:calc(var(--lobby-card)*2 + var(--lobby-card-gap));min-height:var(--lobby-card);overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable;scrollbar-width:thin;scrollbar-color:#96714e #121012;scroll-padding-block:4px;}
#lobby .char-scroll-track{gap:var(--lobby-card-gap);}
#lobby .char-scroll-track>.char-item{flex:0 0 var(--lobby-card);height:var(--lobby-card);min-height:var(--lobby-card);}
#lobby .char-scroll-nav{flex:0 0 auto;margin:0;gap:12px;opacity:1;}
#lobby .char-nav-btn{min-width:36px;min-height:32px;border:1px solid #75604766;background:#171214;}
#lobby .char-list>.char-item-new{flex:0 0 64px;height:64px;min-height:64px;margin-top:0!important;padding:8px 16px;gap:12px;border-color:#96714e!important;}
#lobby .char-item-new .char-thumb{flex-basis:40px;width:40px;height:40px;}
#lobby .char-item-new .char-name{font-size:.95rem;letter-spacing:.04em;}
#lobby .lobby-card-gap{display:none;}
#lobby .lobby-mid-area{flex:0 1 auto;min-height:0;max-height:152px;padding:0;overflow-y:auto;}
#lobby .lma-banner-inner{padding:8px 0;gap:6px;}
#lobby .lma-main-txt{font-size:14px;line-height:1.35;}
#lobby .lma-sub-txt{font-size:11px;line-height:1.4;letter-spacing:.03em;}
#lobby .lma-steam-btn{width:min(200px,70%);height:44px;display:flex;align-items:center;justify-content:center;}
#lobby .lma-steam-btn img{width:100%;height:100%;object-fit:contain;}
#lobby .lobby-footer{margin-top:14px;padding:10px 4px 4px;gap:0;border-top:1px solid #96714e55;}
#lobby .enter-game-btn{min-height:64px;}
#lobby .enter-game-btn img{width:100%;height:auto;max-height:clamp(64px,14vh,132px)!important;max-height:clamp(64px,14dvh,132px)!important;object-fit:contain;}
#lobby .lobby-bottom-actions{min-height:36px;margin-top:4px;}
@media(max-height:760px){
 #lobby>.lobby-right{--lobby-card:76px;padding-block:16px;}
 #lobby .lobby-content{gap:8px;}
 #lobby .lobby-content>.lobby-divider{height:72px!important;}
 #lobby .lma-txt-group{display:none;}
 #lobby .lobby-mid-area{flex:0 0 48px;max-height:48px;}
 #lobby .lma-banner-inner{padding:2px 0;}
 #lobby .lma-steam-btn{width:min(170px,60%);}
 #lobby .lobby-footer{margin-top:8px;padding-top:8px;}
}
@media(max-height:560px){
 #lobby>.lobby-right{--lobby-card:64px;--lobby-card-gap:8px;padding-block:10px;}
 #lobby .lobby-content{gap:6px;}
 #lobby .lobby-content>.lobby-header{min-height:30px;}
 #lobby .lobby-content>.lobby-divider{height:44px!important;}
 #lobby .char-list>.char-item-new{flex-basis:56px;height:56px;min-height:56px;}
 #lobby .char-scroll-track>.char-item{padding-top:6px;padding-bottom:6px;}
 #lobby .lobby-mid-area{flex-basis:48px;max-height:48px;}
 #lobby .lma-steam-btn{width:140px;height:44px;}
 #lobby .lobby-footer{margin-top:6px;padding-top:6px;}
}
@media(max-width:700px){
 #lobby>.lobby-left{display:none;}
 #lobby>.lobby-right{flex-basis:100%;width:100%;padding-inline:24px;}
 #lobby .lobby-content>.lobby-divider{height:76px!important;}
 #lobby .char-name:has(.char-name-label){flex-direction:column;align-items:flex-start;gap:2px;}
 #lobby .char-name:has(.char-name-label) .char-cls{max-width:100%;margin:0;}
}
@media(max-width:700px) and (max-height:560px){#lobby .lobby-content>.lobby-divider{height:44px!important;}}
@media(max-height:440px){
 #lobby>.lobby-right{--lobby-card:56px;}
 #lobby .lobby-content>.lobby-divider{height:32px!important;}
 #lobby .char-list>.char-item-new{flex-basis:48px;height:48px;min-height:48px;}
 #lobby .char-item-new .char-thumb{flex-basis:32px;width:32px;height:32px;}
 #lobby .char-scroll-track .char-thumb{flex-basis:36px;width:36px;height:36px;}
}
@media(pointer:coarse){#lobby .char-nav-btn{min-width:44px;min-height:44px;}}
@media(max-height:440px){
 #lobby .lobby-content>.char-list{min-height:122px;}
 #lobby .lobby-content>.char-list:has(>.char-scroll-nav){min-height:164px;}
}
@media(pointer:coarse) and (max-height:440px){
 #lobby .lobby-content>.char-list:has(>.char-scroll-nav){min-height:176px;}
 #lobby .lobby-content>.lobby-divider{height:24px!important;}
}
```

## 2026-10-20 Godot 이식 — 원본 글꼴 스택·인트로 키 안내 4컷 (P2-007a)

- Godot 포트 UI는 웹과 같은 글꼴 토큰을 쓴다: `--font-hell`(Nanum Myeongjo→Noto Serif KR), `--font-hell-title`(Cinzel Decorative→Nanum Myeongjo→Noto Serif KR), `'Cinzel',var(--font-hell)`(타이머·화폐·키 표기), `'Cinzel',serif`(진행 표시·레슨 키캡), body `--font`(Noto Sans KR — 쿨다운 초·안내 노트·버튼), 펫 자막 `'Malgun Gothic',sans-serif`(시스템에 없으면 Noto Sans KR). 단일 공급자 `godot/scripts/native_ui_fonts.gd`, 글꼴 파일 `godot/assets/fonts/ofl/`(OFL 동봉).
- 굵기는 game.html @import 로드 굵기 기준 브라우저 매칭 그대로(Cinzel은 700/900만 로드 → 일반 굵기 요청도 700으로 보임).
- 인트로 시작 대사+키 안내 4컷(`#introKeys`)을 원본 CSS 607~640 값으로 이식 — 웹 Chromium 1920×1080 실측과 패널 높이·요소 위치 ±0.1px. 상세·근거 표: [docs/engine/FDG_P2_007A_UI_POLISH_20261020.md](../engine/FDG_P2_007A_UI_POLISH_20261020.md).


## 2026-10-21 DEMO11-04 Godot 로컬 5슬롯 요청 UI

- 독립 진입 씬 `res://scenes/demo_lobby.tscn`은 1920×1080 설계 좌표의 로컬 데모 목록·이름 입력·선택·삭제 확인을 제공한다. Main 게임 부팅/실제 Player 복원은 이 단위 범위 밖이다. 이어하기는 실제 파일에서 재읽은 선택 슬롯 payload를 `continue_requested(slot,data)`로 전달하며 복원 성공·입장 성공으로 표시하지 않는다. metadata-only는 `new_game_requested` 경계다.
- 흑철 패널·뼈색 문자 `#dfd6c2`·금빛 헤어라인 `#96714e`·붉은 동작 버튼, 기존 NativeUIFont 공급자를 사용한다. 원본 로비 abyss/선대 portrait/hell_gothic crest 3개를 byte 동일 사본으로 재사용하고 새 원화/이모지를 만들지 않는다. 원본 abyss.webp는 PNG 바이트라 Godot 사본만 abyss.png 확장자로 식별한다. 선대 그림은 기록실 장식이며 선택 캐릭터 외형 완료로 간주하지 않는다.
- 일반 5슬롯 제한·원본 metadata fallback은 기존 source_slot_reader를 사용한다. 웹의 VIEW=2 스크롤을 복제하는 대신 native에서 5행을 한 판에 표시한다. 이름 입력은 index.html848의 maxlength8을 따른다. 캐릭터 선택/서사/온라인/Steam·설정 저장·복원은 별도 단위다.
- 삭제 확인은 취소에 최초 포커스, 좌우/Tab은 모달 안 두 버튼 순환, Escape 취소 후 호출 버튼으로 복귀한다. 이름은 일반 Label/Button으로 표시하고 rich text 해석을 하지 않는다. IO 실패는 목록을 성공처럼 미리 바꾸지 않으며 실패 reason을 표시한다. 확인 이후 저장 변경 시 삭제를 거절한다.
- SV-LOBBY-VIEW·SETTINGS S10은 이 기준 main에서 추적/후보 파일 계약이며 실행 구현은 없었다. 이번 지정 후보 `native_save_slot_menu.gd`와 `native_settings_lobby_bridge.gd`에 로컬 요청·명시 KO/EN 언어/장치 관측 부분을 구현했다. hellLang/OPT 영속 쓰기·29언어 완료·패드 전체 navigation 인수는 주장하지 않는다. 새 UI 키는 번역대상_전체목록에 등록했다.
- 화면 검수는 `_out/demo11-04/captures/`의 목록·삭제확인 1920×1080 PNG 및 각1x 크롭을 맥북총괄이 확인한다. 캡처는 격리 디렉터리의 명시 IO fixture이며 자연 플레이 저장/복원 검수와 구분한다. [검증·의존·경계 보고](../engine/orders/reports/demo11-04_REPORT.md).


### 2026-10-21 DEMO11-04 맥북총괄 RETOUCH 반영

- 사용자 최신 로비 검수 지시를 이 씬에 우선 적용한다. 슬롯·동작 버튼·안내·이름 입력의 기본 폰트는 `NativeUIFont.stack("hell",400)`(Nanum Myeongjo→Noto Serif KR), 제목은 `hell_title,700`(Cinzel Decorative→Nanum Myeongjo)이다. 이 씬에서는 이전 기본 sans-serif 토큰을 사용하지 않는다. 다른 게임 UI 폰트 토큰/공급자는 변경하지 않는다. 기본 문자색은 #dfd6c2다.
- 왼쪽 아트는 (175,290) 600×560으로 배치하고 EXODUSER/지옥의 길 제목은 y132/y215에 유지한다. 두 제목의 실제 rect가 아트 시작 y290 위에 끝나는지 검사한다. 명칭을 덮던 마스크 위 배치를 제거하고 금빛 구분선/하단 명조 문구는 유지한다. 원화·문장 byte와 크기 계약은 그대로다.
- 재캡처 자료는 `~/exoduser-wt/_out/demo11-21fix/captures/`의 목록·삭제확인1920×1080과 목록/확인/제목-아트 경계1x크롭이다. **화면 비교 자료 준비·맥북총괄 재검수 대기**, 시각 승인/완료로 세지 않는다. 새 문구0으로 번역 등록 변경0.

## 2026-10-31 웹 공통 UI·UX
로비·타이틀의 최신 안전 영역·원화 버튼·키보드·사운드 계약은 LOBBY_AAA_REFERENCE_STUDY_20261028.md의 같은 날짜 표, 게임 공통 창은 WEB_UIUX_GAME_20261031.md를 따른다. 이전 절의 화면 가장자리 배치는 초광폭에서 중앙 16:9 영역을 기준으로 환산한다.
