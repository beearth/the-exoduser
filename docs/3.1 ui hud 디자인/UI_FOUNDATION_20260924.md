# 전체 UI 통일 — Hell Gothic

사용자 승인: 2026-09-24 ui_hell_concept.png의 고딕·악마·지옥 분위기로 실제 UI 작업 진행. 검은 철, 악마의 뿔과 날개, 붉은 지옥불, 밝은 뼈색 문자를 공통 언어로 사용한다. 기존 Iron Covenant는 이전 제작 방향이며 현재 SSOT는 아래다.

## 2026-09-24 공통 UI 현재 적용 계약

사용자가 승인한 고딕·악마·지옥 시안에 따라 Hell Gothic을 적용한다. 이전 Iron Covenant 황동 테마는 제작 이력이다. 런타임은 ui-foundation.css?v=20260924-hell2가 기존 스타일 뒤에서 덮어쓴다.

| 대상 | 현재 표시/동작 |
|---|---|
| 연결 | game.html, game-easy-test.html, index.html; NW.js 복사 목록에 ui-foundation.css, img 폴더 전체 포함 |
| 공통 외곽 크기 | 설정/인벤토리/대장간/스킬/능력치/창고: 폭>1400은 100vw−24px × 100dvh−24px, 외곽12px. 폭≤1400은 100vw−16px × 100dvh−16px, 외곽8px. max-width 상한 없음 |
| 내부 여백 | 폭>1400: 상88/좌우38/하28px. 폭781~1400: 상74/좌우32/하24px. 폭≤780: 상56/좌우18/하16px. 문장과 내비게이션 겹침을 방지하는 상단 예약 공간 |
| 공통 프레임 | img/ui/hell_gothic/frame.png, 1254×1254 RGBA. border-image slice22%, 표시64px; 폭≤780 표시32px. opacity1, pointer-events:none. 이미지 실패 시 1px #695047 테두리와 단색 배경 유지 |
| 상단 악마 문장 | img/ui/hell_gothic/crest.png, 2172×724 RGBA. top6px, 가로중앙. 폭>1400 216×72px / 폭781~1400 180×60px / 폭≤780 126×42px. normal 알파 합성, 입력 차단 없음 |
| 공통 토큰 | 배경 #100d0e / 안쪽 #090809 / 돌출 #211416; 본문 #eee4d4 / 보조 #bfb2a5 / 강조 #be5747 / 선 #57413c / 가넷 #681e1b |
| 탭 | 14px/700 Noto Sans KR, 최소42px. 폭≤780은 3열 grid, 간격4px, 패딩6px 4px, 줄높이1.25, 한글 단어 유지·줄바꿈 허용. 선택 #501614→#230c0d, 글자 #fff0df, 선 #c45b47, 하단2px #dd6a4f |
| 제목/닫기 | 제목24~34px·자간.14em(성장 기존 제목 유지). 닫기 최소42px/글자16px/패딩10px 28px, CSS #581611→#240809 붉은 금속 버튼. 포커스2px #ead6a5/offset3px |
| 패널 중 월드 HUD | 6개 메뉴 .on 동안 petSubtitle, hud, hudTop, hudCorner, bossBar, bossPostureBox, globeHP/MP, skBar, mmWrap, mmLvl, stageClock, areaTitle, tutorialBadgeButton, skBarTip, keyGuide 감춤. 닫으면 복구 |
| 설정 | 본문15px/줄높이1.55, 제목18px. range 강조 #c45b47. 수치 열76px·글자13px·줄높이1.4·줄바꿈으로 잘림 방지 |
| 스킬 추천 | skill-recommendations: 폭>1100 2열/≤1100 1열, 간격14px/카드패딩16px. 추천15단계 및 학습/합체 로직 유지 |
| 성장/인벤토리 | 기존 성장 인체 트리·투자 계획, 장비 좌표·두 귀걸이 슬롯·유골함·아이템 희귀도 색 유지. 문장/프레임/메뉴 표면만 변경 |
| 낮은 장비창 | 폭≥781이면서 높이≤800: 제목 margin/padding0·줄높이1.2, 헤더 최소44px·아래10px. 장비/가방 행 minmax(220px,1fr) minmax(170px,.65fr), 세로 스크롤. 성장 growth-shell은 전용 CSS보다 공통 패딩 우선 |
| 로비 | 붉은 흑철 표면, 40px 9-slice 프레임/inset2px. 선택 카드 #481718→#160e10, 선 #c15b47/왼쪽3px #d3634b. 구분선 위치 문장168×56px, 높이≤800은120×40px. 미선택 입장 숨김/이미지≤120px(낮은 화면≤96px), 중앙 안내 스크롤 유지 |
| 전투 HUD | skBar::before 문장114×38px, left50%/top18px, pointer-events:none. 기존 HP/MP/SP/쉴드/기동력 색·수치·슬롯·위치 유지 |
| 튜토리얼 가림 방지 | #parryLesson이 DOM에 존재하는 동안 mmLvl·tutorialBadgeButton visibility:hidden. 튜토리얼 종료 시 원상 복구 |


## 튜토리얼·안내 패널

| 항목 | 현재 구현 |
|---|---|
| parryLesson | opacity1. 배경 radial-gradient(ellipse at 50% 0,#47171288,transparent 48%),#100d0ef5. 패딩68px 24px 20px. 기존 반투명 배경 전체 이미지를 덮어씀 |
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

CSS 이미지 실패 시 solid 배경/테두리/DOM 글자·버튼이 남는다. 알파 합성은 normal이고 screen·검정색 키잉을 사용하지 않는다. 에셋 경로는 img/ 아래이며 NW.js 기존 img 폴더 전체 복사에 포함된다. 이전 iron_covenant_20260924 에셋은 제작 이력이며 현행 CSS에서 참조하지 않는다.

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
