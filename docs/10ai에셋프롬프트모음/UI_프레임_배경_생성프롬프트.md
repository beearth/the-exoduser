# 지옥의 길 UI 프레임 배경 생성 프롬프트

> 2026-04-16 확정본.  
> 모든 UI 배경 프레임 생성은 이 문서를 기준으로 한다.

## 사용 원칙

- 이 프롬프트는 `패널 배경 프레임` 전용이다.
- 목표는 `테두리만 고밀도`, `중앙은 저밀도/저대비`, `UI 텍스트 가독성 최우선`이다.
- 텍스트, 아이콘, 캐릭터, 실제 UI 요소가 들어간 이미지는 사용 금지.
- 생성 결과가 예쁘더라도 `center area clean`, `low detail center`, `UI readability`가 무너지면 폐기한다.

## 기본 베이스 프롬프트

> 기본 방향: `더 고어`가 아니라 `더 선명한 UI 프레임`.
> 컨셉아트처럼 흐리는 표현보다 `professional game interface template`, `ultra crisp`, `not blurry`를 우선한다.

```text
dark fantasy game UI frame, sharp and clean ornamental border,
designed as a professional game interface template, not concept art,
high clarity metal frame, strong silhouette, large readable chain shapes,
crisp corner decorations, subtle skull motifs only in corners,
clean center, smooth dark gradient center,
very sharp edge detail, minimal noise, minimal grunge,
bronze and black metal, subtle ember highlights,
front view, symmetrical layout, no text, no icons, no characters,
high resolution, polished game UI asset, ultra crisp, not blurry
```

## 필수 키워드

다음 키워드는 모든 파생 프롬프트에 반드시 포함:

| 키워드 | 이유 |
|---|---|
| `center area clean` | 중앙 정보 영역 확보 |
| `low detail center` | 텍스트/슬라이더 가독성 확보 |
| `no text` | 실제 UI 텍스트가 이미지에 박히는 사고 방지 |
| `UI readability` | 프레임보다 사용성 우선 강제 |
| `detail only on border` | 장식 밀도를 테두리로만 제한 |

## 버전별 파생 프롬프트

### 1. 체인 버전 (설정용)

```text
dark fantasy game UI frame, sharp and clean ornamental border,
heavy chains wrapping around edges, chains hanging only on borders,
designed as a professional game interface template, not concept art,
high clarity metal frame, strong silhouette, large readable chain shapes,
crisp corner decorations, subtle skull motifs only in corners,
center area clean and low detail for UI readability,
smooth dark gradient center,
very sharp edge detail, minimal noise, minimal grunge,
bronze and black metal, subtle ember highlights,
front view, symmetrical layout, no text, no icons, no characters,
high resolution, polished game UI asset, ultra crisp, not blurry
```

### 2. 고어 버전 (이벤트/팝업용)

```text
dark horror UI frame, blood splatter and skull piles only on corners and edges,
dripping blood from top border,
center area empty and clean for UI,
high contrast border, low contrast center,
cinematic horror lighting, no text, no UI elements
```

### 3. 룬/스킬 버전

```text
dark fantasy magic UI frame, glowing runes carved into border,
purple and orange glow accents,
arcane symbols only on edges,
center area clean and dark gradient,
high detail border, minimal center detail,
game skill menu background, no text
```

## 금지 키워드

다음 표현은 절대 넣지 말 것:

| 금지 표현 | 금지 이유 |
|---|---|
| `high detail everywhere` | 중앙까지 디테일이 퍼져 UI 가독성 붕괴 |
| `grunge full background` | 전체 배경이 시끄러워짐 |
| `blood splatter all over` | 중앙 정보 영역 오염 |
| `complex texture center` | 텍스트/수치 식별 실패 |
| `blurry` | 프레임 선예도 붕괴 |
| `painterly` | UI 자산 대신 회화풍 컨셉아트로 흐름 |
| `soft focus` | 테두리 실루엣 약화 |
| `concept art` | 실제 게임 UI 템플릿이 아닌 컨셉 이미지로 이탈 |
| `cinematic scene` | 프레임보다 장면 연출이 우세해짐 |
| `messy texture` | 읽기 영역 오염 |

## 검수 체크리스트

생성 후 아래 항목을 반드시 확인:

| 체크 | 기준 |
|---|---|
| 중앙 비어 있음 | 텍스트 박스를 얹어도 읽히는가 |
| 테두리 집중 | 장식/고밀도 요소가 모서리와 외곽에만 몰려 있는가 |
| 중앙 저대비 | 그룬지/피/룬이 중앙까지 침범하지 않는가 |
| 무문자 | 텍스트, 숫자, 가짜 버튼, 가짜 UI가 없는가 |
| 대칭성 | 프레임 실루엣이 UI 패널용으로 안정적인가 |
| 선예도 | 상단 바, 좌우 체인, 코너 장식이 흐리지 않고 또렷한가 |
| 프레임 존재감 | 중앙보다 외곽 프레임 실루엣이 분명하게 읽히는가 |

## 현재 패널 배정 가이드

| 창 | 권장 프롬프트 계열 |
|---|---|
| 설정 | 체인 버전 |
| 인벤토리 | 체인 버전 또는 저고어 버전 |
| 대장간 | 기본 베이스 프롬프트 |
| 창고 | 체인/뼈 장식 계열 |
| 능력치 | 저고어 또는 가시 장식 계열 |
| 스킬 | 룬/스킬 버전 |
| 이벤트 팝업 | 고어 버전 |

> 앞으로 새 UI 프레임을 생성할 때는 이 문서의 베이스 프롬프트를 먼저 붙이고, 창별 파생 프롬프트를 뒤에 덧붙인다.
> 설정 프레임처럼 체인 실루엣이 중요한 창은 `large readable chain shapes`, `ultra crisp`, `not blurry`를 반드시 유지한다.

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

현재 상세·생성 정보·검수 기록: docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md.
