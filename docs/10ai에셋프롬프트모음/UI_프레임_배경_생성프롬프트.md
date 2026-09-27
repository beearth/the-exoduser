# 지옥의 길 UI 프레임 배경 생성 프롬프트

> 2026-09-27 인벤토리 최신 창 규격은 [장비 시스템 최신 절](../2_7%20인벤토리+장비시스템/2_7%20인벤토리+장비시스템.md)의 `100dvh−24px`(620px 이하 `−8px`) 및 장비/가방/정보 가변폭 1.28fr/clamp(400px,30vw,600px)/1fr이다. 아래 기존 270px 장비 행과 680px 창 높이는 당시 제작 기록이다.

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
| 높이 배분 | inv-wrap 첫 행270px, 가방 행 minmax(240px,1fr). 확보한 나머지 높이는 가방에 배정. 작은 화면은 기존 바깥 세로 스크롤 사용 |
| 적용 범위 | 인벤토리 내부 장비/유골함/보석/보관함 페이지 공통. 다른 메뉴 제목 유지 |

CSS 캐시 ui-refinement.css?v=20260927-3. 신규 이미지/아이템 데이터 변경/자동 테스트 추가·실행 없음.

정확한 CSS는 UI_COMPOSITION_20260925.md의 같은 절을 따른다.


## 2026-09-27 유골 제단 재질 아트 마감 v2

| 항목 | 현행 규격·연결 |
|---|---|
| 의도 | 기존 CSS 선형 원환·네온 등급 테두리를 고딕 석재 제단과 닳은 황동/흑철 유골 홈으로 교체. 중앙 유골함과 4부위 콜렉션 구조 유지 |
| 제단 에셋 | img/ui/ossuary_altar_hf_v2.png,1024×1024 RGB. .oss-ritual-ring:before, normal 합성. radial mask 62% 불투명/66% alpha .6/71% 투명. 로딩 실패 시 아래 CSS 석색 radial 바탕 유지 |
| 슬롯 에셋 | img/ui/ossuary_socket_hf_v2.png,1024×1024 RGBA, 모서리 alpha0. .oss-center:before/.oss-bone-node:before, background-size125% 112%, normal 합성. 원본 픽셀/알파 보존, 런타임 색 필터만 적용. 실패 시 부위 텍스트·그림·상호작용 유지 |
| 배치 | 유골함 탭 창 폭 min(980px,100vw−24px),높이 min(680px,94vh). 좌측 가방/우측 컬렉션 동등한 1fr씩,간격10px. 제단 최대폭380px/높이284px,원환274×274px. 중앙90×100px,부위88×88px. 두개골(50%,16%),팔(18%,50%),몸통(82%,50%),다리(50%,84%). 유골함 그림58×66px,부위38×38px |
| 모바일 | 폭899px 이하 가방 위/컬렉션 아래,행240px/minmax(440px,1fr),세로 스크롤. 폭560px 이하 부위76×88px,중앙82×100px,팔x15%/몸통x85%,패딩10px 8px. 제단284px/원환274px/그림 크기 유지 |
| 등급 표현 | 모든 테두리 금속 재질 통일. 개별 등급은 이름의 70% RARITY_C+30%#e1ccb0 혼색 및 하단4×4px 마름모 보석. 선택 프레임 brightness1.28/saturate.9. 수집 프레임 brightness.95/saturate.75,미수집.6/.4 |
| 읽기 | 슬롯에는 부위명·그림·등급만 노출. .oss-bone-tier display:none. 선택 상세는 부위·등급·T(t+1)·위력(r+t)·성장 효과. 중앙 이름은 하단 어두운 명판 위에 표시 |
| 완료 | 4/4+유골함 장착 시 중앙 프레임 brightness1.14/saturate.9, 제단 brightness.9/saturate.85. 기본 제단 .72/.7. 소환 해금 배지와 미수집 상태 구분 |
| 캐시 | game.html/game-easy-test.html: ui-refinement.css?v=20260927-bone-hover-flow |
| 불변 | 실제 4부위 해금 조건, 등급·티어 저장, 상위 r+t 등록, 전대 전투 수치, 재입력 회수 |
| 제작 | Higgsfield GPT Image 2.5(gpt_image_2_5),quality high,resolution1k,aspect1:1. 잔액1111.25 확인 후 2건 생성, GPT API 폴백 없음 |
| 작업 ID | 제단9ceb151d-45d5-476e-83ec-3a13c63e6b25 / 슬롯fa8121e1-87f3-4623-89c1-2edcd900e15e |
| 최종 화면 검증 | 1440×1080 실화면·390×844 좁은 화면 시각 확인. 1280×720/390×844 슬롯 겹침0·가로넘침0. 수집0→4 해금,상위갱신/하위거부,DOM 유지 확인. pageerror0. tmp/ossuary_altar_complete.png·ossuary_altar_390.png |

### 생성 프롬프트 원문

제단(opaque):

```text
Production game UI material asset, not a screenshot. A single ancient circular ossuary altar seen perfectly straight-on orthographic, centered, entirely visible in a square composition. Dark gothic action RPG, museum-quality hand-painted photoreal material rendering. Heavy concentric worn bronze and black iron rings carved into near-black basalt, embossed funerary knotwork, tarnished gold ridges, engraved unreadable runic marks, small rivets, tiny cracks, dust settled in grooves, subtle oxidized green patina, convincing shallow sculptural relief. Broad ring across 82 percent of canvas, an empty dark recessed central disk across 28 percent of canvas for a separate urn icon. Outer corners are dim charcoal stone subtly fading into nearly black. Balanced radial symmetry, restrained pale warm light from upper left catches chipped metal edges, deep crevices. Medium contrast so independent item icons placed on top remain dominant. Absolutely no item slots, cards, buttons, urn, bones, skulls, UI text, readable letters, numbers, character, flames, neon, glowing outlines, white background, perspective tilt, watermarks. This is the detailed textured backdrop layer for a functioning UI.
```

슬롯(transparent):

```text
Production game UI sprite asset. One empty reliquary item socket frame, centered and perfectly straight-on orthographic, square 1:1. Transparent outer background. Frame fills 94 percent of canvas, a vertical tombstone-like octagonal square with clipped corners, small pointed crown finial and lower triangular riveted seal. A hand-forged blackened iron outer rim, worn antique brass inlay, exquisite restrained gothic funerary relief, small raised corner rivets, physically chipped edges with warm upper-left highlights and deep recessed contact shadows. Empty inset center is dark charcoal suede/stone with subtle grain, occupying 65 percent of width and 72 percent of height, entirely blank for separate item icons and labels. Rich sculpted thickness, weathered realistic premium dark fantasy game UI. Balanced bilateral symmetry, finely drawn not noisy. No bright gold plastic, no neon, no colored glow, no skull or bone, no item, no text, no letters, no numbers, no watermark. Ensure full outer ornament visible with 3 percent transparent margin all around.
```


## 2026-09-27 유골함 가방·컬렉션 반반 구성

> 현행 화면 보정(2026-09-27): 장비창과 같은 전체 화면 창을 사용한다. 폭 1400px 이상·높이 850px 이상에서 유골 제단 원본 380×284px을 1.35배로 확대하고 컬렉션 공간 가운데에 둔다. 화면 배율로 실제 CSS 폭이 701~1200px이 되면 장비창은 장착판 왼쪽/가방·정보판 오른쪽 2열이며, 700px 이하에서만 1열 스택이다. 수치와 반응형 행은 `docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md` 최신 절을 따른다.

| 항목 | 현행 계약 |
|---|---|
| 배치 | 유골함 탭 창 폭 min(980px,100vw−24px),높이 min(680px,94vh). 좌측 가방/우측 컬렉션 동등한 1fr씩,간격10px. 제단 최대폭380px/높이284px,원환274×274px. 중앙90×100px,부위88×88px. 두개골(50%,16%),팔(18%,50%),몸통(82%,50%),다리(50%,84%). 유골함 그림58×66px,부위38×38px |
| 반응형 | 폭899px 이하 가방 위/컬렉션 아래,행240px/minmax(440px,1fr),세로 스크롤. 폭560px 이하 부위76×88px,중앙82×100px,팔x15%/몸통x85%,패딩10px 8px. 제단284px/원환274px/그림 크기 유지 |
| 정보 밀도 | 큰 제단 영역을 축소. 부위명·그림·등급은 슬롯에 유지,선택한 부위의 티어·위력·성장 효과는 하단 상세1곳. 상세 최소높이42px,패딩8px 10px |
| 재질 | 기존 제단·슬롯 아트 재사용. 슬롯 background-size125% 112%,중앙 inset −6px −4px,부위 inset −4px −2px. 등급 보석4×4px/bottom3px. 새로운 생성 에셋 없음 |
| 헤더·여백 | 컬렉션 기본 패딩10px 12px,제목14px(폭560px 이하12px),헤더 padding2px 0 8px. 부위명11px/1.4,footer padding8px 0 6px. 상세·힌트 margin4px 0 |
| 데이터·입력 | DOM·수집·저장·해금·장착·해제·분해 로직 유지. 가방10열·기존 셀 크기 및 내부 스크롤 유지 |
| 적용·캐시 | ui-refinement.css,game.html,game-easy-test.html. ui-refinement.css?v=20260927-bone-hover-flow |
| 검증 | 기존 ossuaryCollection 회귀6개 PASS. 저장 API를 차단한 실제 game.html UI에서1440×1080/1280×720/900×720 동등폭·좌우 배치,390×844 상하 배치 확인. 노드 겹침0·페이지 가로넘침0·pageerror0. 전환 연출을 QA 전용 CSS로 숨겨 검수했으며 게임 시작부터의 전체 흐름은 검증하지 않음. 캡처 tmp/ossuary_split_1440.png, tmp/ossuary_split_390.png |
