# 실제 사용 이미지 범위 재검수·UI 잔점 제거 — 2026-09-13

사용자 후속 지시: 인게임에 사용하는 이미지만 재생성하고, 미사용 이미지는 삭제해도 된다. 이전4576개는 파일 목록이며 실사용 총수가 아니다. 이번 작업은 실제 코드 참조와 실행 중 요청을 근거로 대상을 좁혔다.

| 조사 | 결과와 한계 |
|---|---|
| 정적 참조 | game.html/index.html 및 로컬 스크립트47개에서 이미지 경로314개 추출, 존재 파일271개. 주석·폴백도 포함할 수 있고 문자열 조합 경로 전체를 증명하지는 않음 |
| 실제 실행 | 새 Chromium에서 게임 시작·컷신 종료 후 인트로 및 로비를 실행하여 이미지 요청629개 확인. HTTP 오류0·pageerror0. 모든 장·선택 분기 실행 목록은 아님 |
| 두 목록 합집합 | 존재하는 정적 참조와 실제 요청703개. 인게임 전체 이미지의 확정 총수라고 표기하지 않음 |
| 이전 검수 누락 보완 | ui_refs 창 배경6개, output 로고·버튼·아이콘 등6개와 루트 atlas_player/proj_atlas2개를 추가 시각 확인. SVG5개는 벡터이므로 래스터 점묘 재생성 대상이 아님 |
| 재생성 판정 | 실제 창 배경6개에 전면적 잔점·얼룩 입자가 남아 있어 GPT로 정리. 다른 추가 확인 이미지에는 같은 전면적 점묘 문제를 찾지 못함. 플레이어 아틀라스는 모아보기와 샘플 영역을 확인했으며 모든 프레임 개별 확대 검사는 아님 |
| 기존 별개 오류 | 고양이 idle/south-west/frame_001.png는 실제 요청되지만 기존부터 디코드 실패. 후속 로비 검수에서 동일 방향 frame_000.png 복사로 보완(동일 포즈 반복). [로비 추가 검수](LOBBY_IMAGE_REVIEW_20260913.md) |
| 보존 원칙 | ui_refs/output이라는 폴더명만으로 미사용 판정하지 않음. 이름을 조합하는 애니메이션·조건부 로딩은 요청되지 않았다는 이유로 삭제하지 않음 |

## 교체 파일

모든 파일의 경로는 img/ui_refs/window_frames/ 아래다. 생성 도구는 내장 image_gen.imagegen이며 [정확한 프롬프트·출력 기록](IMAGE_TEXTURE_RUNTIME_PROMPTS_20260913.json)을 보존한다. 원본 구도와 UI 칸 배치를 참조하면서 점입자를 제거하고 큰 균열·체인·뼈·촛불 형태는 유지했다. 생성 편집에 따른 세부 장식의 차이는 있다.

| 창 | 파일 | 이전 → 현재 해상도 | 처리 |
|---|---|---|---|
| 설정 | `panel-settings-chains-v2.png` | 2307×1581 → 1515×1038 | GPT 원본 참조 편집 |
| 인벤토리 | `panel-inventory-chains-v2.png` | 2313×1545 → 1534×1025 | GPT 원본 참조 편집 |
| 대장간 | `panel-forge-skulls-v2.png` | 2223×1452 → 1551×1014 | GPT 원본 참조 편집 |
| 능력치 | `panel-stats-thorns.png` | 768×512 → 1536×1024 | GPT 원본 참조 편집 |
| 스킬 | `panel-skills-runes.png` | 768×512 → 1536×1024 | GPT 원본 참조 편집 |
| 창고 | `panel-storage-bones.png` | 768×512 → 1536×1024 | GPT 원본 참조 편집 |

## 런타임·삭제 계약

| 항목 | 현재 |
|---|---|
| 창 배경 URL | game.html의6종 배경, 설정 --frame-art, preload4개 및 stat-panel-ui.css의 능력치 border-image에 ?v=20260913-smooth-ui |
| CSS 로드 | game.html의 stat-panel-ui.css?v=20260913-smooth-ui |
| 능력치 테두리 | border-image slice: 위19.53125%, 오른쪽13.671875%, 아래18.5546875%, 왼쪽13.671875%. 기존768×512 이미지의100/105/95/105px와 동일한 비율. 화면 border 두께28px 유지 |
| 삭제3개 | panel-settings-chains.png, panel-inventory-bloodhands.png, panel-forge-relic.png. UI 문서상 이미 참조 해제된 레거시3개이며 런타임 경로 조사에서도 참조 없음 |
| 삭제 안전성 | 절대 경로가 G:/exoduser 내부인지 확인하고 원본과 백업의 SHA256 일치 확인 후 개별 파일 삭제 |
| 원본 백업 | output/image_texture_cleanup_20260913/runtime_scope/originals/ 아래 실제 경로 구조로6개 수정 원본·3개 삭제 원본·game.html·stat-panel-ui.css 보존 |
| 범위 | 일반 게임 이미지·CSS 반영. 맵 geometry/환경 이미지·전투 수치 변경 없음. 원격 배포·USB 복사 없음 |

## 검증

| 검사 | 결과 |
|---|---|
| 실제 패널 | openPanel로 설정/인벤토리/대장간/창고/능력치/스킬6개를 열고 새 URL·자식 DOM·이미지 디코드 확인 PASS |
| 시각 | 1440×900의6개 창과1280×720 능력치 창 직접 확인. 잔점 정리·텍스트·테두리 확인 PASS |
| 입력·오류 | Escape로 능력치 창 닫힘. pageerror0. API 쓰기 차단으로 실제 세이브 쓰기 없음 |
| 회귀 | growthRemaster/statPanelTransactions12개 PASS |
| 자료 | runtime_scope/static_references.json, observed_requests.json, applied.json, ui_qa.json 및7개 패널 스크린샷 |

이전 컷신22개·로딩 사본4개 정리는 별도 기존 보고서에 기록되어 있다. 이번 추가 교체는6개이며 이전26개와 중복되지 않는다.

## 로비 후속 검수

이 기록의 UI6장 검수와 별도로, 로비/로딩 후보51개를 검수하고23개 장면 편집+메인 배경 사본3개=26개 PNG를 반영했다. [로비 추가 검수](LOBBY_IMAGE_REVIEW_20260913.md)에 개별 판정과 실제 화면 검증을 기록한다.

사용자 확대 검수로 확인된 거대전사3종의 칼날·갑옷·펫 목걸이 결함은 [거대전사 디자인 재작업](LOBBY_WARRIOR_REDESIGN_20260913.md)에서 디자인을 재제작했다. 메인3개와 로딩 사본3개를 갱신했으며, 그 외 이 문서의 UI6개는 그대로다.

## 2026-09-24 공통 UI 현재 적용 계약

사용자가 승인한 고딕·악마·지옥 시안에 따라 Hell Gothic을 적용한다. 이전 Iron Covenant 황동 테마는 제작 이력이다. 런타임은 ui-foundation.css?v=20260924-hell3가 기존 스타일 뒤에서 덮어쓴다.

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
| 로비 | 붉은 흑철 표면, 40px 9-slice 프레임/inset2px. 선택 카드 #481718→#160e10, 선 #c15b47/왼쪽3px #d3634b. 구분선 위치 문장168×56px, 높이≤800은120×40px. 입장 이미지 hue-rotate(95deg) saturate(.9)로 붉은 강조. 미선택 입장 숨김/이미지≤120px(낮은 화면≤96px), 중앙 안내 스크롤 유지 |
| 전투 HUD | skBar::before 문장114×38px, left50%/top18px, pointer-events:none. 기존 HP/MP/SP/쉴드/기동력 색·수치·슬롯·위치 유지 |
| 튜토리얼 가림 방지 | #parryLesson이 DOM에 존재하는 동안 mmLvl·tutorialBadgeButton visibility:hidden. 튜토리얼 종료 시 원상 복구 |

현재 상세·생성 정보·검수 기록: docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md.
