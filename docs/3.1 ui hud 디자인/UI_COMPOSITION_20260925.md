# UI 구성 개편 — 2026-09-25

## 적용 기준

사용자가 제공한 Diablo IV와 POE2 실제 화면을 참고했다. 공통점은 제목/분류/본문/행동의 구획, 일정한 행·슬롯 정렬, 저대비 재질, 얇은 금속 마감, 중요도에 따른 강조다. 패널 폭을 모두 30%로 고정하지 않는다. 외부 게임 이미지는 런타임에 복제하지 않았다.

2026-09-24 전체화면 Hell Gothic은 이전 구현이다. 이번 구현은 ui-foundation.css 뒤의 ui-refinement.css와 ui-panels.js가 담당한다. 튜토리얼·로비는 기존 foundation 계약 유지. 사용자는 구성이 정리됐다고 평가하고 디테일 마감을 계속 지시했다.

## 레이아웃 계약

| 항목 | 현재 구현 |
|---|---|
| 연결 | game.html/game-easy-test.html: ui-refinement.css?v=20260927-4, defer ui-panels.js?v=20260925-1. index.html은 CSS만. NW.js 두 파일 복사 |
| 설정 | 왼쪽 폭 min(680px,100vw−24px), 높이100dvh−24px, 최대높이1000px |
| 장비 | 오른쪽 폭 clamp(640px,36vw,780px), 최대100vw−24px; 폭≤780에서는100vw−16px |
| 스킬/대장간/창고 | 각각 최대1020/980/700px, 화면폭−24px 이내. 스킬 왼쪽; 대장간/창고 중앙 |
| 능력치 | 기존 전체화면과 인체 트리 구성 유지 |
| 공통 패딩 | 18px 22px 20px; 폭≤780은14px. 기존 외곽12px/8px 유지 |
| 표면 | iron.png를480px 크기로 반복, 검은 CSS 레이어로 감광. 3px double #665e50, 안쪽3px #090909/5px #343530, 내부 그림자32px |
| 프레임 | 기존 frame.png slice22%, 표시24px, opacity.65, pointer-events:none. 떠 있던 pbox::before 문장 숨김 |
| 제목 | 26px/.12em, 최소48px. 설정/대장간/창고60px, crest144×48px left6/top4. 장비22px/최소38px. 색#e6d6b9 |
| 전체 메뉴 | 기존 6개 메뉴, 최소32px/글자12px, 상단 고정; 폭≤780은3열. 회색 금속 기본/붉은 선택 |
| 분류 탭 | 최소35px, 글자13px(폭≤780은12px), 선택 금속#554635→#28231c, 상단#bc9a64. button/role tab/aria-selected/aria-controls, 좌우·Home·End 이동 |
| 본문 | #050707bb→#080909d9 + iron.png, 선#534b3e. 표면 로드 실패 시 CSS 어두운 면 유지 |
| 닫기·키캡 | 글자13px, 선#79674c, 4단 금속 그라디언트, 안쪽2px 검은 홈. 닫기 최소36px, 패딩7px18px |

## 설정 분류와 보존

기존 입력 노드를 append로 이동하므로 ID/이벤트/값/자동저장 함수를 보존한다. 부모 innerHTML/textContent 교체 없음. 남은 기존 게임 섹션은 게임 페이지로 옮겨 미분류 항목 누락을 피한다.

| 페이지 | 컨트롤/섹션 |
|---|---|
| 게임 | 난이도·자동물약·줍기·결정 자동처리·석궁/버스트루프/칼날개·기존 보스 디버그 |
| 화면 | optShake/optParts/optFps/optResScale/optIrisSz/optBrightness/optIrisGlow, optScreenSection, gfxPresetRow 섹션, diagGpu 섹션 |
| 사운드 | optSfx/optBgm/optBgmTrack |
| 조작 | keyBindList 섹션, cursorGrid 섹션 |
| 시스템 | optLang, charSelectGrid 섹션, saveP1 프리셋 섹션, toLobbyBtn2 섹션, resetBtn/quitBtn 섹션 |
| 고정 하단 | settingsAutoSaveLabel와 기존setClose, 본문만 스크롤 |
| 행 | 최소42px, 패딩8px4px, 간격10px. 이름폭43%/13px, 수치72px/12px, 선택창최소30px/12px |
| 체크 |20px 원형 금속 체크; 선택중 중앙 밝은 점. 설정 범위슬라이더 높이5px/강조#b99b65 |
| 버튼 | 최소34px/패딩7px12px/글자13px. 리셋·확인·종료만 어두운 붉은색 |
| 초기 상태 | 게임 탭. 선택 탭 유지하며 내용영역 scrollTop은 탭 전환 시0 |
| 언어 | 새 분류/필터 라벨은 한국어 및 영어. 나머지 언어는 새 라벨만 영어 폴백, 기존 컨트롤 번역은 기존 시스템 유지 |

## 장비 구성

| 항목 | 현재 구현 |
|---|---|
| 기본 | 장비 탭. 상단 장비·하단 가방 |
| 탭 | 장비/유골함/보석/보관함. 보석은 invCrystalsPanel 전용 그리드. 장비는 상단 장착창/하단 가방,유골함·보관함은 왼쪽 가방/오른쪽 전용 패널 동등폭(폭899px 이하 상하) |
| 격자 | 1열, 상단 minmax(270px,1.1fr), 하단 minmax(200px,1fr), 간격10px; 본문 세로스크롤 |
| 장비 도면 | 기존600×324 좌표 유지. zoom min(1,(100cqw−16px)/600px,(100cqh−26px)/324px) |
| 중복 제목 | 장비 탭으로 설명되는 장착 중 라벨은 숨겨 첫 슬롯과 겹침 방지 |
| 가방 | 필터는 details/summary로 접기, 기존invFilters/선택 로직 유지. invGrid최소140px, 가방최소200px |
| 상세 | invRight top135/right26px, 폭min(360px,85vw), 최대높이calc(100%−210px) |
| 호버 안정성 | `_invRenderDetail(idx,source,preview=false)`에서 호버 호출은 true, `inv-hover-preview` 클래스와 pointer-events:none!important로 마우스 가로채기 방지. 장착·가방·유골함 진입은 mouseenter. 클릭 선택 상세는 기본 false로 스크롤·버튼 조작 유지 |
| 조작 | 기존 분해/정렬/장착/비교 이벤트 유지. inv-actions 최소36px, 버튼 줄바꿈 |

## 에셋 생성

스킬 추천 카드는 동일 iron.png/480px 표면을 사용한다. 카드선#534b3e, 제목14px/#deccaa, 설명12px/#b8ae9a/줄높이1.6. 현재 추천은#a75e46 테두리와 왼쪽3px 표시를 사용한다.

| 항목 | 기록 |
|---|---|
| 경로 | img/ui/hell_gothic/iron.png |
| 규격 | 1254×1254 PNG, 불투명 단일 재질, 애니메이션 없음 |
| 도구 | 연결 OpenAI image_gen, 모델 ID 미노출 |
| 프롬프트 | Seamless tileable very dark charcoal blackened iron and fine worn slate; subtle hammered microscopic grain; low contrast warm charcoal; flat diffuse light; no frame/border/objects/icons/text/symbols/vignette/large cracks |
| 생성 원본 | exec-ec7948cc-f7c0-48b4-90a7-f5919729e555.png, 원본 보존 후 프로젝트로 복사 |
| 사용 | 공통 패널/안쪽 본문/장비 구획. CSS 어두운 레이어 합성, 파일실패 시 검은 그라디언트 유지 |

## 작업 범위

설정 및 장비 화면의 실제 브라우저 렌더를 보며 배치 조정. 자동 테스트는 추가·실행하지 않았다. 전체 언어 및 게임패드 회귀 완료를 의미하지 않는다. 스킬/성장 시스템·수치·세이브 데이터는 변경하지 않았다. 좌우 패널 동시 열기는 기존 openPanel 단일 활성 계약을 유지한다.

## 2026-09-25 디테일 마감 (현재 시각 규칙)

사용자가 패널 구성을 수용하고 디테일 보강을 요청했다. 아래 표는 위 기본표의 표면·테두리·상태 표현을 보완하는 최종 규칙이다. 배치/크기/기능 계약은 유지한다.

| 대상 | 최종 마감 |
|---|---|
| 외곽 | 선#756957, 안쪽2px #070909/4px #49483d/5px #111511, 내부30px #000b, 외부0 14px 48px #000c |
| 제목판 | iron.png/480px + 중앙#7d624b20·금속#403c3266→#171b18aa, 위선#8b765048/아래#88704d. 문장 아래선#99846545, 그림자0 2px 2px 검정 |
| 구획 제목 | 선#625741, 왼쪽3px #a38a59, 글자#ebdaba, 배경#66523b38→#22282018 |
| 분류 탭 | 모서리2px, iron.png/240px. 기본#34362f99→#161b17dd; 선택#79634799→#342b1cdd/선#ad9063/글자#ffebc2/상단2px #c8a977. 호버선#b59a6b/글자#fff0d1 |
| 버튼·키캡 | iron.png/240px 위 금속4단 #514a3999/#171c17d9/#11160fe8/#3d3322ba. 안쪽2px 검정 홈·상3px 하이라이트·하3px 음영. 눌림은 inset0 2px 7px 검정. 비활성 opacity.42/saturate.3/not-allowed |
| 위험 버튼 | resetBtn/resetYes/quitBtn: #4b211c→#210e0b, 선#895346, 글자#e3b39c |
| 설정 | 행 호버#c8b47a0b, 숫자 tabular-nums, select 포커스#b39c6b, 입력 키보드 포커스2px #d8c398/offset4px |
| 장비 슬롯 | 기존 희귀도 테두리 유지. #080c0bee→#171c17d9 + iron/240px, inset2px 홈·상3px7px 음영·하2px 반사. 라벨#d0c3a5. 호버 위치 이동 없음, 외곽1px #c5a471 |
| 가방/상세 | 셀 #090e0bd9→#20251add + iron/240px·안쪽 음영. 상세선#8c7654, 외부0 12px24px/안쪽2px 그림자 |
| 반응/스크롤 | 색·테두리·그림자120ms. reduced-motion에서는 전환 없음. 스크롤#796b50/#0c100d, thin |

기존 iron.png/frame.png/crest.png 재사용, 신규 이미지 생성 없음. 자동 테스트 추가·실행 없음. 전체 게임패드/다국어 회귀 검증 완료를 의미하지 않는다.


## 2026-09-25 조각 프레임·창고 슬롯 개편

POE2 설정 화면과 Diablo IV 장비 화면을 참고한 최신 표현 계약이다. 앞선 동일 항목의 프레임/제목 수치는 아래 표로 대체한다.

| 항목 | 현재 구현 |
|---|---|
| 공통 프레임 | frame.png 22% 슬라이스, 42px 표시, opacity 1, 아래 3px/blur2px 그림자 |
| 제목 | 설정/장비/대장간/스킬/창고: 최소112px, padding72px 20px 8px, 중앙 crest270×90px, brightness1.55. 제목 주변 frame 10px. 높이760px 이하 최소76px/padding-top40px/crest180×60px |
| 설정 본문 | 10px 틀, frame18px, padding18px. 어두운 본문과 바깥 금속의 명도 분리. 하단 padding12px 8px. 키캡/닫기 frame9px, 키캡 최소38px |
| 창고 배치 | 기존700px 패널 안에 좌측 슬롯/우측180px 상세, 간격12px. 본문 독립 스크롤. 폭560px 이하 세로 배치 |
| 슬롯 | 5열, gap3px, padding5px, 3px double 틀. 창고 최소10칸/가방 최소10칸을 시각적으로 표시하며 초과 시 5칸 단위 행 추가. 빈칸은 비대화형 장식, 실제 용량 STORAGE_MAX=200 유지 |
| 아이템 | 기존 _itemSkin 56px, 상세112px. 속성→물리→글리프 폴백 유지. 희귀도 테두리, 레벨 표시 |
| 선택/이동 | 첫 아이템 자동 선택. 슬롯 클릭은 상세 선택만, 우측 보관/꺼내기 버튼이 실제 이동. 이름·레벨·희귀도·강화수치 표시. native button/aria-pressed/포커스 지원 |
| 저장 | 실제 이동 직전에 배열 indexOf로 현재 위치 재확인. 기존 용량 제한, 좌표 초기화, SFX.pickup, _persistSharedStorage, dbSaveNow 유지. 인벤토리 내 보관함 동작은 기존 계약 |
| DOM | renderStorage가 소유하는 grid/nav 자식만 remove하고 새 노드 append. 부모 innerHTML/textContent 교체 없음. 기존 _itemSkin 마크업은 새 리프에 삽입 |
| 에셋 | 기존 crest.png/frame.png/iron.png 및 item-skins 재사용, 신규 이미지 생성 없음. CSS 배경/기본 선은 이미지 실패 시 유지 |

자동 테스트 추가·실행 없음. 기존 번역 키 재사용. 세이브 형식·아이템 수치 변경 없음.

아이템 아트 폴백 중복 표시 방지: `.vault-art .iskin:has(img)`는 font-size:0, 직계 SVG visibility:hidden. 이미지가 실패하여 제거되면 기본 글리프가 다시 표시된다.


현재 공통 프레임·제목 및 독립 창고 선택/이동 UI는 `UI_COMPOSITION_20260925.md`의 **2026-09-25 조각 프레임·창고 슬롯 개편 절**을 따른다. 이전 중복 수치는 해당 최신 표로 대체한다.


## 2026-09-25 금속 마감 보강

이 절은 앞선 제목판·본문 프레임·키캡 표현의 최신 규칙이다.

| 항목 | 구현 |
|---|---|
| 외곽 | 320px iron 반복, 좌우 밝은 금속 띠와 내부 음영. 안쪽 3/5/8/11px 단계의 턱, 외부0 16px 48px 그림자 |
| 제목판 | 중앙판 좌우19%, top70/bottom3px, border9px. 황동 #44321b→#94733e→#654b29→#34271a, soft-light 재질 합성. 글자#f7e7bb. 높이760px 이하 top40px |
| 설정 본문 | 9px #3c4137 틀, border-image 없음, margin6px 5px 0/padding14px. 안쪽 outline#8a7754 offset−5px, 금속 안쪽 선과 음영 |
| 구획 제목 | 16px, 배경 제거, 오른쪽으로 이어지는 금속 구분선, padding4px 2px 12px |
| 키 설정 행 | grid minmax(130px,1.3fr)/minmax(80px,1fr)/minmax(68px,.8fr)/20px. 간격8px, 최소48px, padding5px 3px. 이름13px/행간1.5, 홀수행 옅은 배경 |
| 키캡 | 폭100%, 최소36px, padding3px 5px, 글자12px. 4px #655438 금속 테두리, 모서리2px, 방사 그라디언트 고정점. 기본/호버/입력대기 구분, 기존 입력 로직 유지 |
| 작은 화면 | 폭560px 이하 행 열85px/58px/52px 최소+삭제16px, gap4px. 이름12px. 설정 본문 padding8px/좌우margin0 |
| 창고 | 헤더와 상세 배경의 금속 명도 보강. 선택/이동/용량 계약은 이전 절 유지 |
| 에셋 | 기존 iron/frame/crest 재사용, 신규 생성 없음. 제목판 CSS 기본색은 이미지 실패 시에도 유지 |

코드 변경은 CSS와 캐시 버전(20260925-7)만. 자동 테스트 추가·실행 없음.


## 2026-09-25 테두리 중첩 수정

사용자가 외곽 사각선과 장식 프레임의 중첩을 지적했다. 앞선 외곽·제목·설정 본문 테두리 계약은 이 표로 대체한다.

| 항목 | 현재 계약 |
|---|---|
| 외곽 | pbox border0/outline0/border-image none. 다중 inset 그림자 삭제, 외부0 14px 40px #000c만 사용. 장식 pbox::after 하나가 테두리 담당: frame.png slice350/32px/inset0/opacity1/filter none |
| 제목판 | 제목 컨테이너 선·배경·그림자 제거. 제목판 ::after는 1px #806944 단일 선, #3c3422→#191b12 배경, 외부0 3px5px 그림자. border-image 제거 |
| 설정 본문 | 1px #716047 선 하나. outline/inset 그림자 제거. 기존 패딩과 스크롤 유지 |
| 인벤 헤더 | 제목과 정보행을 한 열 grid로 분리. 제목 폭100%/최소88px/padding54px 12px 8px. 중앙 문장204×68px. 제목판 top53/좌우24%/bottom0, 폭560px 이하 좌우18% |
| 정보행 | 전투력·악의·닫기 정렬. gap8px/padding0 4px 8px/아래선1px #65583f. 전투력·악의의 중첩 박스 삭제. 문장과 충돌하지 않음 |
| 장비 구획 | 섹션 선1px #65583f, 중복 inset선 제거. 슬롯 안쪽 iskin 등급 그림자 제거, 바깥 슬롯 희귀도 테두리 유지. 슬롯 음영 inset0 2px5px, 라벨#e0d2b2 |
| 캐시 | ui-refinement.css?v=20260927-4, 게임 두 HTML 및 로비 동기화 |

CSS 변경만 적용. 기존 에셋 재사용. 자동 테스트 추가·실행 없음.


## 2026-09-25 Blackiron 아트 교체

악마 문장과 프레임의 원본 품질 개선 요청에 따라 게임 메뉴 6종의 에셋을 교체했다. 아래 표가 메뉴 프레임/문장 표시의 최신 계약이다.

| 항목 | 구현 |
|---|---|
| 생성 | 연결 Higgsfield GPT Image 2, High/2K/투명, 각각1장. 실제 PNG는 각각2048×2048 RGBA, 원본 보존 |
| 문장 | img/ui/blackiron/crest.png. 흑철·백랍 얼굴, 굵은 산양 뿔, 넓은 조각 날개, 황동 가장자리. 원본 알파>32 bbox[14,409,2033,1514] |
| 프레임 | img/ui/blackiron/frame.png. 뿔·아칸서스 모서리와 직선 레일. alpha>32 bbox[18,37,2030,2013], 중앙alpha0 |
| 사용 범위 | 설정/장비/대장간/스킬/창고/능력치 패널에서만 --ui-crest/--ui-frame 교체. 로비·튜토리얼·HUD는 기존 에셋 유지 |
| 외곽 | pbox 패딩36px30px28px. 프레임26% slice/60px 표시, 단일 ::after. 이미지 실패 시 #2c3029 테두리. 기존 pbox 자체border0 계약 유지 |
| 제목 | 최소142px/padding112px12px8px. 문장 박스200×112px, 원본 배경200×200px/center −36px, 필터 없음. 제목판top110/좌우20%/bottom0, 선#8d7b51 |
| 낮은 화면 | 높이800px 이하 제목최소116px/padding-top86px. 문장156×88px, 원본156×156px/center −28px. 제목판top84px |
| 좁은 화면 | 폭899px 이하 가방 위/컬렉션 아래,행240px/minmax(440px,1fr),세로 스크롤. 폭560px 이하 부위76×88px,중앙82×100px,팔x15%/몸통x85%,패딩10px 8px. 제단284px/원환274px/그림 크기 유지 |
| 기록 | img/ui/blackiron/prompts.md에 두 프롬프트 전문·생성ID·투명도 기록. 신규 픽셀 후처리 없음. img 폴더는 기존 NW.js 패키징 대상 |
| 버전 | ui-refinement.css?v=20260927-4 |

자동 테스트 추가·실행 없음. 원본 알파와 브라우저 렌더를 직접 확인.


## 2026-09-25 인벤토리 텍스트·박스 정비

081927 콘셉트 참고 화면 대비 실제 UI의 독립 간판형 제목, 작은 장비 라벨, 희미한 가방 제목과 격자를 보완했다. 아래 표가 인벤토리에만 적용되는 최신 계약이며 다른 메뉴의 Blackiron 규격은 유지한다. 콘셉트 이미지 수준 달성으로 판정하지 않는다.

| 항목 | 현재 구현 |
|---|---|
| 제목 구성 | 최소78px, padding 0 164px 0 16px, 좌측 정렬, 24px/600/자간.08em. 제목 박스 제거, 하단1px 그라데이션 구분선 |
| 문장 | 우측16px/top−5px, 표시144×84px, 배경144×144px/center−25px. 기존 Blackiron PNG 재사용 |
| 헤더 | 제목/수치 간격9px, 하단여백12px. 수치 행 padding0 4px/별도 테두리 없음 |
| 수치 | 전투력 라벨12px, 값19px/600, 세부11px, 재화12px. Noto Sans KR, 재화 칩 배경·선 제거 |
| 탭 | 높이34px,13px/500/자간.04em. 비선택 흑철 #292a26→#161916/선#555347, 선택 적갈색 #4b3028→#291a17/선#936749/하단2px#ba9061 |
| 본문 틀 | 단일1px #59574b 테두리, 어두운 철 질감. 장비 중앙에는 낮은 밝기의 타원형 배경 음영 |
| 장비 라벨 | Noto Sans KR 12px/500/행간1.25, 자간0, 위여백2px, 색#d7d0bd. 기존 종이인형 zoom과 슬롯 위치 유지 |
| 가방 | padding12px14px, 헤더최소30px/하단padding8px/여백8px/구분선1px#49483e. 제목14px/500, 정렬버튼최소28px/12px/좌우10px |
| 필터·격자 | 필터12px/행간1.5/하단9px, 추가 상단선 제거. 격자 외곽outline0, 각 빈 셀1px#3b4037/각진 모서리/흑철 음영 |
| 폭560px 이하 | 제목최소68px/22px/좌8px·우132px, 문장우8px/120×70px/배경120×120px/center−21px |
| 적용 | ui-refinement.css?v=20260927-4, game.html/game-easy-test.html/index.html 동기화. DOM·게임 수치 변경 없음 |

자동 테스트 추가·실행 없음. 렌더 확인은 디자인 외관에 한정한다.


### 장비 슬롯 이름 영역

| 항목 | 규격 |
|---|---|
| 슬롯 내부 | padding3px 0 18px, overflow hidden. 기존72×72px 외곽 유지 |
| 아이콘 | 48×48px, flex-shrink0 |
| 이름 영역 | absolute left0/right0/bottom0, 최소17px, 중앙 정렬, 위여백0, 배경#080c0bd9/상단1px#ffffff0c |
| 스타일 범위 | 인벤토리 전용 규칙을 #invPanel.panel .pbox 아래로 제한해 기존 고우선순위 스타일과 충돌 방지 |


## 2026-09-25 인벤토리 금속판·레일 적용

| 항목 | 현재 규격 |
|---|---|
| 재사용 에셋 | img/ui/iron_covenant_20260924/button.webp(1200×256), frame.webp(1024×1024). 기존 제작 에셋 그대로 재사용, 신규 생성·픽셀 편집 없음 |
| 탭·정렬 | button.webp 100%×100% normal 합성, 어두운 반투명 그라데이션. 비선택 흑철/선택 적갈색 및 하단2px# ac7953(공백 제외). 추가 CSS 외곽선0. 정렬버튼최소62px |
| 내부 레일 | 장비/가방/유골함/보관함 border-image frame.webp 4% slice/6px/늘이기. 기존1px 외곽선을 대체. 실패 시6px#504b41 |
| 표면 | 바깥·내부·슬롯 모두 숯색 철판. 장비 중앙만 낮은 황동빛 방사형 음영. 빈 가방 셀 선#44403b |
| 문장 연결 | 제목 오른쪽 기존 문장을164×96px/배경164×164px/center−28px, bottom−10px로 내려 제목 구분선과 연결 |
| 폭560px 이하 | 문장120×70px/배경120×120px/center−21px/bottom−6px |
| 범위·폴백 | 인벤토리에만 적용. 에셋 로드 실패 시 단색 바탕과 기존 DOM 텍스트 유지. normal 합성, 기존 NW.js img 복사 대상 |
| 버전 | ui-refinement.css?v=20260927-4 |

위 규격이 인벤토리의 이전 표면·테두리·문장 위치 규격을 대체한다. 자동 테스트는 추가하거나 실행하지 않으며 실제 브라우저 외관을 확인한다.


## 2026-09-25 참고 화면 조사·인벤토리 디테일 통합

참고: 사용자 스크린샷 175513(디아블로 캐릭터 UI),175521(현재 게임). 외부 근거: [Blizzard UI Design, 2020-02](https://news.blizzard.com/en-gb/article/23308274/diablo-iv-quarterly-updatefebruary-2020). 공식 설명은 작은 아이콘의 현실적인 재질, 낮은 배경 채도, 테두리 장식의 보조 등급 표시, 개별 UI 요소의 대비 및 배치 균형을 강조한다. 아래 비교는 제공 화면에 대한 관찰이며 현재 디아블로 최신 빌드의 수치 규격을 주장하지 않는다.

| 영역 | 참고 화면에서 관찰한 점 | 기존 구현의 부족 | 보강 |
|---|---|---|---|
| 박스 위계 | 외곽/구획/슬롯의 프레임 굵기와 장식 크기가 구분됨 | 안쪽은 균일한 얇은 선, 외곽만 장식 | 외곽 기존 Blackiron, 내부6px·슬롯3px 금속 레일 |
| 슬롯 | 눌린 바탕과 틀, 작은 등급 장식 | 초록 테두리와 빈 칸이 같은 구조 | 금속 틀/낮은 채도 등급 인레이/보조 마름모, 빈 슬롯 감광 |
| 글자 | 제목·주요수치·보조정보 크기 구분 | 제목 주변 여백은 크고 세부 수치는 작음 | 제목띠58px, 전투력21px, 세부12px |
| 조작부 | 버튼·구획 제목·화폐 줄까지 같은 재질 | 하단 버튼과 스크롤이 별도 양식 | 공통 금속판 버튼/하단 레일/가방 전용 스크롤 |
| 누적 스타일 | 요소별 재질 체계가 반복됨 | 후속 override 블록3개 누적 | Inventory finish 이후를 통합 규칙1개로 교체 |

### 최신 인벤토리 표시 계약

이 절은 이전 인벤토리 전용 제목·슬롯·가방·하단 마감 규격을 대체한다. 게임 수치/장비 좌표/아이템 크기/드래그·선택·잠금 기능은 변경하지 않는다.

| 대상 | 구현 규격 |
|---|---|
| 제목 | 최소58px/padding0 130px 0 16px,24px·600·자간.08em, 철판 질감 띠. 문장122×72px/right12px/bottom−9px/background122×122px center−21px |
| 수치 | 라벨12px,전투력21px/600,세부12px,재화12px. 수치 행padding0 8px/간격10px/하단12px |
| 탭·버튼 | 기존 button.webp 100%×100%, normal 합성. 탭높이36px/13px·500. 적갈색 선택/하단2px#ac7953. hover 밝기1.18,키보드focus2px#d6bd89 |
| 구획 | 장비/가방/유골함/보관함/상세 border-image frame.webp 4%/6px. 실패시6px#504b41 |
| 장비 슬롯 | 기존72×72px, border-image동일4%/3px, padding2px 0 18px. 아이콘48×48px,이름하단1px/좌우2px/높이16px/12px·500 |
| 등급 색 | rarity0=#978e7d,1=#81a36b,2=#6f9dba,3=#ac86b8,4=#c5a15f,5=#d48d5b. 실제 게임 등급 이름은 원래 시스템을 따르며 여기서는 rarity0~5 순서의 색상 규격 |
| 보조 표식 | 장착 아이템 좌상단5px/6×6px 마름모. rarity4~5는12×6px 두 마름모. 이름 위1px 등급 인레이. 빈 슬롯은 표식 없이 글자#8f897d/선#403d37 |
| 가방 | padding8px10px10px/헤더34px/하단여백8px/구분선1px#635b4d,제목14px·500. 정렬66×28px최소/12px |
| 필터 |12px/summary최소24px/하단8px,열림색#e4cfaa |
| 빈 격자·아이템 | 빈칸선1px#383638/철판감광. 아이템 각진모서리/낮은 적갈색 바탕. 기존 좌측등급선·잠금·선택outline 유지 |
| 가방 스크롤 | invCenter overflow hidden,invGrid flex-shrink1/min-height140px/overflow-y auto. scrollbar thin,WebKit7px/철색thumb/트랙#121113 |
| 공간 배분 | 장비 minmax(320px,1.3fr), 가방 minmax(200px,1fr). 실행할 버튼이 전혀 없는 하단은 숨겨 빈 공간 제거 |
| 하단 | 상단여백8px/padding-top8px/높이최소42px/상단선1px#5b5143/우측 정렬. 버튼최소34px/padding7px16px/12px·500 |
| 폭560px 이하 | 제목52px/22px/좌8px우110px,문장104×62px/right4px/bottom−8px/background104×104px center−18px,세부수치10px |
| 통합·버전 | ui-refinement.css Inventory finish 블록 하나로 최근3개 마감 블록 대체. ui-refinement.css?v=20260927-4. 신규 에셋 생성 없음 |

전체 아트 완성도는 콘셉트와 동등하다고 판정하지 않는다. 이번 범위는 박스 위계·슬롯 재질·조작부 통일. 자동 테스트 추가·실행 없이 실제 렌더를 확인한다.


## 2026-09-25 흑철 해골 문장 원본 교체

180950 스크린샷의 기존 문장은 잔장식과 금색 반사가 작은 크기에서 뭉개진다는 사용자 지적에 따라 신규 원본으로 교체했다.

| 항목 | 현재 구현 |
|---|---|
| 원본 | img/ui/blackiron/skull.png, 2048×2048 RGBA. 연결 Higgsfield GPT Image 2/높음/2K/투명/1장 |
| 생성 ID | hf_20260925_094125_c925e90d-593f-487e-ac6b-ddb33a67fd25 |
| 형태 | 굵은 위쪽 뿔, 큰 해골 얼굴, 넓은 금속 면, 얕은 적갈색 눈. 가는 날개·금색 소용돌이 장식 제거 |
| 알파 | alpha>32 bbox[16,121,2029,1927], alpha0 픽셀2,052,685, 중간알파2,141,619. 원본 보존/픽셀 후처리 없음 |
| 사용 범위 | 기존 Blackiron 문장을 참조하는 설정/인벤토리/대장간/스킬/창고/능력치 변수 교체. 로비/HUD 원본은 유지 |
| 합성 | normal 알파, 배경center/contain. 원본의 뿔·턱을 자르던 이전 crop offset 제거. 인벤토리122×72px 박스/좁은화면104×62px 기존 크기 유지 |
| 폴백 | CSS 이미지 로딩 실패 시 문장 장식만 사라지고 DOM 제목·프레임·조작 유지 |
| 버전 | ui-refinement.css?v=20260927-4, game.html/game-easy-test.html/index.html 동기화 |
| 기록 | img/ui/blackiron/skull.md 프롬프트 및 생성 정보. 기존 crest.png 보존 |

자동 테스트 추가·실행 없음. 원본 알파 및 실제 UI 축소 렌더 확인.


## 2026-09-25 해골 문장 재생성 — skull2

직전 큰 뿔 해골(skull.png)은 사용자 요청으로 사용을 중단하고 작은 해골+좌우 철제 받침의 일체형 원본으로 교체한다. 이전 원본은 제작 이력으로 보존한다.

| 항목 | 현재 규격 |
|---|---|
| 원본 | img/ui/blackiron/skull2.png,2048×2048 RGBA,연결 Higgsfield GPT Image 2/높음/2K/투명/1장 |
| 생성 | hf_20260925_104017_80cf4ddc-c35e-4a6e-b2c2-897acd5bee27,프롬프트 전문 skull2.md |
| 조형 | 동물 뿔 제거,중앙 해골과 좌우 수평 철제 받침,아래 작은 쐐기. 기존보다 낮고 넓은 일체형 조각 |
| 투명도 | alpha>32 bbox[36,671,2011,1344],alpha0=3,763,749/중간알파430,555. 원본 픽셀 그대로 보존 |
| 인벤토리 | 문장180×64px/right6px/bottom−8px/background180×180px center−56px. 제목 오른쪽padding194px. 실제 조각 전체를 표시하고 상하 투명 여백만 제외 |
| 폭560px 이하 | 문장140×50px/right4px/bottom−6px/background140×140px center−43px. 제목 오른쪽padding154px |
| 다른 메뉴 | 기존200×112px 박스/background200×200px center−45px. 높이800px 이하는156×88px/background156×156px center−35px |
| 합성·실패 | normal 알파. 이미지실패시 기존 DOM 제목/프레임/조작 유지. 메뉴 범위는 직전 skull 교체 범위 유지 |
| 버전 | ui-refinement.css?v=20260927-4 |

원본과 실제 제목 표시를 확인. 자동 테스트 추가·실행 없음.


## 2026-09-25 설정을 인벤토리 스타일로 통일

사용자 최신 지시: 인벤토리 스타일로 통일. 생성한 plate.png의 가죽 노이즈는 채택하지 않으며,추가 생성 요청 중이던 후보도 연결하지 않는다. 기존 인벤토리 원본 button.webp/frame.webp/iron.png/skull2.png를 재사용한다.

| 요소 | 설정 화면 적용 계약 |
|---|---|
| 제목 | 인벤토리와 동일한 좌측 제목 띠:최소58px/padding0 194px0 16px/24px·600·자간.08em. 별도 직사각형 제목판 제거/하단1px 그라데이션선 |
| 문장 | skull2.png,우측6px/bottom−8px/180×64px/background180×180px center−56px. 기존 해골 원본 유지 |
| 배경 | pbox 인벤토리와 동일한 iron.png320px+숯색 감광. 본문 iron.png480px+동일 감광 |
| 본문틀 | frame.webp4% slice/6px/0 stretch,기본border6px#504b41,outline0,shadow0,padding14px |
| 탭·키·버튼 | button.webp100%×100%+동일감광,추가CSSborder0/border-image없음/각진모서리. 일반글자#c7bead |
| 크기 | 내비최소32px/padding6px. 분류최소36px/padding7px6px/13px·500·자간.04em. 기존 키입력행 정렬 유지 |
| 선택 | 인벤토리와 같은 적갈색판/#f4e3bd계열 대신 실제#f4e6cb/하단2px#ac7953. hover밝기1.18/focus2px#d6bd89 |
| 입력상태 | 키입력대기outline2px#b7945e/글자#ffe5ac. 위험 버튼 글자#d9a08c. 가짜 키 리벳::before 제거 |
| 구획·하단 | 분류하단 중복선 없음/간격3px. 본문제목15px·600/padding8px0 10px. 하단상단여백8px/padding-top8px/선1px#5b5143. 닫기최소34px/padding7px16px/12px |
| 폭560px 이하 | 제목52px/22px/좌8px우154px. 문장140×50px/right4px/bottom−6px/background140×140px center−43px |
| 폴백·합성 | normal알파/단색배경·테두리·DOM텍스트 폴백. 설정동작·값·자동저장 변경 없음 |
| 버전 | ui-refinement.css?v=20260927-4. game.html/game-easy-test.html/index.html 및 관련 문서 동기화 |

설정 전용 후속 스타일은 Settings plates 블록 하나로 교체한다. 새 가죽판 생성본은 미채택 작업물이며 런타임 참조 없음. 자동 테스트 추가·실행 없음.


## 2026-09-26 정보 배경과 통합 제목판

레퍼런스의 구성 원칙을 적용한다. 조각·지지대·빈 제목판을 하나의 원본으로 연결하고, 글자는 DOM으로 유지한다. 설정/스킬/소지품의 정보 영역을 조용한 배경 위에 구획한다. 이전 좌측 제목·우측 skull2 계약은 아래 세 창에서 대체한다.

| 대상 | 현재 구현 계약 |
|---|---|
| 이미지 | img/ui/blackiron/header.png, GPT Image 2, High/2K/transparent, 2048×2048 RGBA, 알파 경계 [29,529,2018,1398]. 생성 정보와 프롬프트는 같은 폴더 header.md |
| 공통 제목 | settings/invPanel/skillPanel .ptitle, 높이158px, padding96px 12px 30px, 하단여백10px, 중앙24px/32px·자간.08em·#efe1c5. 폭560px 이하는22px |
| 원본 표시 | ::before 360×158px/max-width100%, 중앙, background360×360px center -90px. normal 알파 합성. ::after 없음. 원본의 반투명 외곽 음영 유지 |
| 소지품 압축 제목 | 가방 가시영역 확보: 높이118px/padding68px12px18px/22px. 원본270×270px center -67px, 표시270×118px. 장비/가방 grid 행 minmax(270px,1.1fr) minmax(200px,1fr) |
| 빈 스킬 요약 | #skillInfo:empty는 display:none. 정보가 없을 때 빈 테두리를 만들지 않는다 |
| 설정 구획 | 제목바 button.webp, padding10px14px/최소40px/15px. 기존 가로 장식선 제거. 설정행 좌우12px |
| 소지품 | 장비 뒤 저대비 아치: top5%/bottom4%/left·right31%, 내부 음영. 빈칸 중앙18×18px 마름모1px #9d8d6320. 가방 제목 영역 padding4px8px8px |
| 스킬 | 요약·그리드·장착바 frame.webp 4%/6px/0 stretch, border6px #504b41. 요약padding12px14px, 그리드12px, 장착바10px. 카테고리 제목 button.webp/padding10px |
| 스킬 카드 | iron.png와 어두운 배경, 각진 모서리, 상단1px빛·하단음영. 기존 카테고리/합체 상태의 색 테두리는 유지 |
| 스킬 탭 | button.webp, 기본 #c7bead. 선택 적갈색/글자#f4e6cb/하단2px#ac7953 |
| 폴백 | 이미지 실패 시 DOM 제목·본문·기존 단색 배경/6px 테두리 유지. JS 및 게임 수치 변경 없음 |
| 빈 배경 문양 | sigil.png 원본 재사용. 세 창 pbox에서 620×620px center -150px, 전면감광 #141315d9→#09090af2. 장비 배경은410×410px center, 감광#0c0b0dcc→#111012eb. 정보 위 DOM 오버레이 없음/클릭 차단 없음 |
| 캐시 | ui-refinement.css?v=20260927-4, game.html/game-easy-test.html/index.html |

원본 비율에 맞춰 CSS로 투명 여백만 표시 범위 밖에 둔다. 래스터 변형/재생성 후처리 없음. 자동 테스트 추가·실행 없음.


## 2026-09-26 전체 메뉴 마감

사용자 지시: 새 문양·제목판 스타일을 전체 UI에 적용하고 부족한 디테일을 보강한다. 신규 이미지 생성 없이 header.png/sigil.png/button.webp/frame.webp/iron.png를 재사용한다.

| 발견한 부족 | 구현 |
|---|---|
| 대장간·창고의 이전 해골과 별도 제목 박스 | 설정·스킬과 같은 일체형 제목판158px/360px 원본 표시로 교체 |
| 능력치 창의 다른 제목 양식 | 정보 밀도를 고려해118px/270px/20px 압축 제목판 적용, 수치 지갑과 설명 계층 유지 |
| 창별 내비·닫기 버튼의 재질 불일치 | 6개 게임 메뉴 모두 금속판/적갈색 선택/2px 강조로 통일 |
| 대장간의 어두운 설명·겹친 본문 프레임 | 설명12px·1.7·#b6a58f, 외부 본문 중복선 제거, 실제 목록만6px 금속 레일 |
| 창고 목록과 층 버튼의 평면 재질 | 금속판 버튼,6px 목록 레일,본문 내부 스크롤 |
| 성장 카드의 여러 겹 선 | 단일 외곽선+얕은 상단광. 선택 패시브의 계열색 및 상태 표시 유지 |
| 로비·캐릭터 정보창과 게임 메뉴의 단절 | 같은 숯색 철판/흐린 문양/적갈색 선택을 적용. 로비 구분 장식은 빈 제목판 대신 문양만 사용 |
| 낮은 화면에서 제목 장식이 본문을 차지 | 높이800px 이하 설정·대장간·스킬·창고 제목118px으로 축소 |
| 초점·스크롤 마감 차이 | 여섯 메뉴2px 황동 초점선,얇은 철색 스크롤. 기존 disabled와 게임 상태 유지 |

캐시 ui-refinement.css?v=20260927-4. game.html/game-easy-test.html/index.html 동기화. 게임 수치·저장·전투 로직 변경 없음. DOM 구조를 교체하지 않고 CSS 배경으로 합성하므로 이미지 실패 시 제목과 조작은 남는다. 자동 테스트 추가·실행 없음. 이번 전체 적용 범위는 여섯 메인 메뉴와 로비/캐릭터 정보 면, 공통 확인창(gcModal), 스킬 툴팁(skBarTip)이다. 전투 HUD의 조작 배치는 유지한다. 대장간의 기존 낮은 대비 보조문구(#886644/#665544/#776655)는 #b6a58f로 올린다.


### 스타일 수치 원본

최신 추가 스타일의 정확한 색상·치수·선택자는 아래와 같다. 기존 정보 배경 계약에 덧붙여 적용한다.

```css
/* Unified menu finish: all six windows, lobby, and character information. */
:root{--menu-plate:url('img/ui/iron_covenant_20260924/button.webp');--menu-rail:url('img/ui/iron_covenant_20260924/frame.webp');--menu-sigil:url('img/ui/blackiron/sigil.png');--menu-heading:url('img/ui/blackiron/header.png');}
:is(#forge,#storagePanel,#statPanel).panel .pbox{
 background:linear-gradient(#141315d9,#09090af2),var(--menu-sigil) center -150px/620px 620px no-repeat,var(--ui-surface) center/320px!important;
}
#statPanel.panel .pbox.growth-shell{background:linear-gradient(#141315df,#09090af2),var(--menu-sigil) 30% -140px/620px 620px no-repeat,var(--ui-surface) center/320px!important;}
#gcModal .gc-box{border:6px solid #504b41!important;border-image:var(--menu-rail) 4% / 6px / 0 stretch!important;border-radius:0!important;background:linear-gradient(#141315e0,#09090af5),var(--menu-sigil) center/360px 360px no-repeat,#111013!important;color:#e4d5b8;}
#gcModal .gc-btn{border-radius:0!important;background:linear-gradient(#15141782,#0b0a0cac),var(--menu-plate) center/100% 100% no-repeat!important;color:#ded0b8!important;}
#gcModal .gc-ok{border-color:#ac7953!important;background:linear-gradient(#57170c99,#260907b8),var(--menu-plate) center/100% 100% no-repeat!important;}
#skBarTip{border:1px solid #756247!important;border-radius:0!important;background:linear-gradient(#171417ed,#09090af5),var(--ui-surface) center/240px!important;color:#e4d5b8;box-shadow:0 6px 18px #000b!important;}
#forge.panel #fgGrid [style*="color:#886644"],#forge.panel #fgGrid [style*="color:#665544"],#forge.panel #fgGrid [style*="color:#776655"]{color:#b6a58f!important;}
:is(#forge,#storagePanel,#statPanel).panel .pbox .ptitle{
 display:flex!important;position:relative;isolation:isolate;box-sizing:border-box;flex-shrink:0!important;
 height:158px!important;min-height:158px!important;padding:96px 12px 30px!important;margin:0 0 10px!important;
 justify-content:center!important;align-items:center!important;text-align:center!important;
 background:none!important;border:0!important;box-shadow:none!important;
 font:600 24px/32px 'Noto Serif KR',serif!important;letter-spacing:.04em!important;color:#efe1c5!important;-webkit-text-fill-color:#efe1c5!important;text-shadow:0 2px 2px #000!important;
}
:is(#forge,#storagePanel,#statPanel).panel .pbox .ptitle::before{
 content:''!important;display:block!important;position:absolute!important;z-index:-1!important;top:0!important;bottom:auto!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;
 width:360px!important;max-width:100%!important;height:158px!important;filter:none!important;border:0!important;
 background:var(--menu-heading) center -90px/360px 360px no-repeat!important;pointer-events:none;
}
:is(#forge,#storagePanel,#statPanel).panel .pbox .ptitle::after{display:none!important;}
:is(#settings,#invPanel,#forge,#skillPanel,#storagePanel,#statPanel).panel .pbox :is(.panel-nav-tab,.pclose){
 background:linear-gradient(#15141782,#0b0a0cac),var(--menu-plate) center/100% 100% no-repeat,#232225!important;border:0!important;border-image:none!important;border-radius:0!important;box-shadow:none!important;color:#c7bead!important;
 min-height:32px;font:500 12px/1.4 'Noto Sans KR',sans-serif!important;letter-spacing:.02em!important;
}
:is(#settings,#invPanel,#forge,#skillPanel,#storagePanel,#statPanel).panel .pbox .panel-nav-tab.active{
 background:linear-gradient(#57170c99,#260907b8),var(--menu-plate) center/100% 100% no-repeat!important;color:#f4e6cb!important;box-shadow:inset 0 -2px #ac7953!important;
}
:is(#settings,#invPanel,#forge,#skillPanel,#storagePanel,#statPanel).panel :is(button,[role=button],input,select):focus-visible{outline:2px solid #d6bd89!important;outline-offset:2px;}
:is(#settings,#invPanel,#forge,#skillPanel,#storagePanel,#statPanel).panel .pbox *{scrollbar-width:thin;scrollbar-color:#75674f #121113;}
:is(#forge,#storagePanel).panel .pbox .frame-inner-panel:not(#forgeMats){border:0!important;background:none!important;box-shadow:none!important;padding:0!important;min-height:0;}
#forge.panel .pbox #forgeMats{flex-shrink:0;border:0!important;border-radius:0!important;background:linear-gradient(#19161982,#111015bf),var(--menu-plate) center/100% 100% no-repeat!important;color:#e3ceb0!important;padding:10px 14px!important;font:600 14px/1.5 'Noto Sans KR',sans-serif!important;}
#forge.panel .pbox #forgeLore{flex-shrink:0;color:#b6a58f!important;font-size:12px!important;line-height:1.7!important;padding:6px 10px!important;margin:0 0 8px!important;}
#forge.panel .pbox #fgTabs .fg-tab{border:0!important;border-radius:0!important;box-shadow:none!important;background:linear-gradient(#15141782,#0b0a0cac),var(--menu-plate) center/100% 100% no-repeat!important;color:#c7bead!important;min-height:40px!important;}
#forge.panel .pbox #fgTabs .fg-tab.act{background:linear-gradient(#57170c99,#260907b8),var(--menu-plate) center/100% 100% no-repeat!important;color:#f4e6cb!important;box-shadow:inset 3px 0 #ac7953!important;}
#forge.panel .pbox #fgGrid{min-height:0!important;max-height:none!important;overflow-y:auto!important;padding:8px!important;border:6px solid #504b41!important;border-image:var(--menu-rail) 4% / 6px / 0 stretch!important;background:linear-gradient(#111012df,#09090aed),var(--ui-surface) center/400px!important;}
#forge.panel .pbox #fgGrid>div{border-radius:0!important;}
#forge.panel .pbox #forgeConfirm{border:1px solid #786347!important;border-radius:0!important;background:#201813!important;}
#storagePanel.panel .pbox #storageFloorNav{flex-shrink:0;padding:6px 0 10px!important;gap:5px!important;}
#storagePanel.panel .pbox #storageFloorNav button{min-height:32px;padding:6px 12px!important;border-radius:0!important;background:linear-gradient(#19161982,#111015bf),var(--menu-plate) center/100% 100% no-repeat!important;color:#d8c6aa!important;}
#storagePanel.panel .pbox #storageGrid{min-height:0!important;max-height:none!important;flex:1;overflow:auto!important;padding:10px!important;border:6px solid #504b41!important;border-image:var(--menu-rail) 4% / 6px / 0 stretch!important;background:linear-gradient(#111012df,#09090aed),var(--ui-surface) center/400px!important;}
#statPanel.panel .pbox .growth-header{padding:0 10px 10px!important;gap:20px;}
#statPanel.panel .pbox .growth-header>div:first-child{flex:1;}
#statPanel.panel .pbox .growth-title{height:118px!important;min-height:118px!important;padding:68px 8px 18px!important;font-size:20px!important;margin:0!important;}
#statPanel.panel .pbox .growth-title::before{width:270px!important;height:118px!important;background-size:270px 270px!important;background-position:center -67px!important;}
#statPanel.panel .growth-kicker,#statPanel.panel .growth-subtitle{text-align:center;}
#statPanel.panel .growth-wallet{border:1px solid #66553e!important;box-shadow:inset 0 1px #b69d6922!important;border-radius:0;background:linear-gradient(#211c19ce,#111013ee),var(--ui-surface) center/240px!important;}
#statPanel.panel :is(.growth-stat,.growth-passive,.growth-inspector){border-radius:0!important;box-shadow:inset 0 1px #b69d691a!important;background:linear-gradient(#211c1cdd,#101013f2),var(--ui-surface) center/320px!important;}
#statPanel.panel :is(.growth-stat-desc,.growth-card-desc){color:#c2b6a4!important;line-height:1.6!important;}
#statPanel.panel .growth-passive[aria-pressed=true]{border-color:var(--school-color)!important;box-shadow:inset 0 2px var(--school-color),inset 0 -2px #a5824933!important;}
#statPanel.panel .growth-inspector{border:6px solid #504b41!important;border-image:var(--menu-rail) 4% / 6px / 0 stretch!important;}
.lobby-right{background:linear-gradient(#141315de,#09090af2),var(--menu-sigil) center -90px/620px 620px no-repeat,var(--ui-surface) center/320px!important;}
.lobby-right .lobby-divider{height:48px!important;background:var(--menu-sigil) center/88px 88px no-repeat!important;opacity:.35!important;mix-blend-mode:normal!important;}
.lobby-right :is(.char-item,.char-item-new){border-radius:0!important;background:linear-gradient(#211c1cdc,#101013ef),var(--ui-surface) center/320px!important;}
.lobby-right .char-item.active{background:linear-gradient(90deg,#4b251cdd,#171215eb),var(--ui-surface) center/320px!important;border-color:#ac7953!important;box-shadow:inset 3px 0 #ac7953!important;}
.cs-frame-box{background:linear-gradient(#171417eb,#0b0b0df5),var(--menu-sigil) center/420px 420px no-repeat!important;border-color:#66553e!important;border-radius:0!important;}
.cs-frame-box .cs-right-title{color:#e4d5b8!important;letter-spacing:.06em!important;}
@media(max-height:800px){
 :is(#settings,#forge,#skillPanel,#storagePanel).panel .pbox .ptitle{height:118px!important;min-height:118px!important;padding:68px 8px 18px!important;font-size:20px!important;}
 :is(#settings,#forge,#skillPanel,#storagePanel).panel .pbox .ptitle::before{width:270px!important;height:118px!important;background-size:270px 270px!important;background-position:center -67px!important;}
 .lobby-right .lobby-divider{height:32px!important;background-size:64px 64px!important;}
}

```


## 2026-09-26 슬롯과 상호작용 마감

| 영역 | 변경 계약 |
|---|---|
| 가방 상태 | renderInv의 inv-item에 data-ui-selected/isSelected, data-ui-locked/isFav, data-ui-junk/isJunk, data-ui-salvage/isSal을 문자열 true/false로 기록. 저장 상태·동작 변경 없음 |
| 선택·잠금 | 선택2px 상아색 안쪽 outline, 잠금1px 황동 outline와17px 잠금 배지. 분해 선택 붉은 바탕과 기존 X 유지 |
| 슬롯 수치 | ui-item-power,10px 고정폭 숫자/어두운 받침. 등급 점5px 마름모, 기존 등급색 유지 |
| 상세 계층 | 이름20px/1.4, 능력치13px/1.75, 출처·조작안내11px. ui-item-source/ui-item-hint 클래스로 특정 정보만 스타일 지정 |
| 수치 행 | id-stats 직계 div 중 직계 span이 있고 div가 없는 행만 flex 정렬. 첫 수치 span을 오른쪽으로, 강화 추가값은 그 뒤에 유지 |
| 버튼 | hover밝기1.16/누름.88+안쪽음영/전환.14초. 비활성opacity.48와채도.3. disabled 동작을 CSS로 변경하지 않음 |
| 툴팁 | skBarTip 최대480px 또는 화면−32px, 줄바꿈. 이름14px,설명12px/행간1.6, padding10px14px |
| 접근성 | prefers-reduced-motion은 이번 전환 제거. 기존 키보드/게임패드 초점 경로 유지 |

관련 CSS 전체 수치·선택자는 아래 원본 표기를 따른다. CSS 캐시 ui-refinement.css?v=20260927-4. game.html/game-easy-test.html/index.html 동기화. 신규 이미지 없음. 부모 컨테이너 교체를 추가하지 않고 기존 렌더 문자열에 클래스와 데이터 속성만 추가한다. 자동 테스트 추가·실행 없음.

### 실제 화면 관찰

소지품 가방의 등급 마름모·수치 받침 및 선택 테두리, 전대의 유골함 상세에서 이름/능력치 우측 수치 정렬을 확인했다. 잠금·분해 선택 상태는 렌더 속성과 스타일 연결까지 구현했으며 해당 상태의 화면 확인은 별도로 남는다. 기존 전대의 유골함 선택 시 하단 분해 예상 금액이 NaN으로 표시되는 문제를 발견했다. 이번 시각 마감은 분해 금액 공식에 손대지 않았으며 이 금액 계산은 후속 수정 항목이다.


### 스타일 수치 원본

최신 추가 스타일의 정확한 색상·치수·선택자는 아래와 같다. 기존 정보 배경 계약에 덧붙여 적용한다.

```css
/* Interaction finish: readable states, restrained feedback, structured details. */
#invPanel.panel .pbox .inv-item{transition:border-color .14s,box-shadow .14s,filter .14s!important;}
#invPanel.panel .pbox .inv-item[data-ui-selected=true],#invPanel.panel .pbox .inv-cell.sel{outline:2px solid #ead1a0!important;outline-offset:-2px!important;box-shadow:inset 0 0 0 3px #15100bd9,inset 0 0 18px #b9853930!important;z-index:6;}
#invPanel.panel .pbox .inv-item[data-ui-locked=true]:not([data-ui-selected=true]){outline:1px solid #9c8355!important;outline-offset:-1px!important;}
#invPanel.panel .pbox .inv-item[data-ui-junk=true]{background:linear-gradient(#56211e77,#160e10dd)!important;}
#invPanel.panel .pbox .inv-item[data-ui-salvage=true]{background:linear-gradient(#6c171777,#21090bdd)!important;box-shadow:inset 0 0 0 2px #af5b49!important;}
#invPanel.panel .pbox .inv-item .ui-item-mark{top:2px!important;right:2px!important;display:flex!important;align-items:center;justify-content:center;min-width:17px;min-height:17px;background:#17130eed;border:1px solid #8b7451;border-radius:2px;z-index:3;}
#invPanel.panel .pbox .inv-item .ui-item-power{bottom:2px!important;right:3px!important;color:#dfd0b5!important;background:#0b0b0bcb;padding:2px 3px;font:500 10px/1.1 'Noto Sans KR',sans-serif!important;font-variant-numeric:tabular-nums;}
#invPanel.panel .pbox .inv-item .rarity-dot{width:5px;height:5px;top:4px;left:5px;border-radius:0;transform:rotate(45deg);box-shadow:0 0 0 1px #090909;}
#invPanel.panel .pbox .inv-eq-slot:not(.inv-eq-item){box-shadow:inset 0 3px 8px #000b!important;}
#invPanel.panel .pbox .inv-eq-slot.inv-eq-item:hover,#invPanel.panel .pbox .inv-item:not(.dragging):hover{filter:brightness(1.12);box-shadow:inset 0 1px #e5d2a75c,inset 0 -1px #b19b6955!important;}
#invPanel.panel .pbox .inv-item.dragging{filter:none!important;transition:none!important;}
#invPanel.panel :is(.item-detail,.inv-cmp-float){border-radius:0!important;background:linear-gradient(#191619f5,#0d0c0ff9),var(--ui-surface) center/320px!important;box-shadow:0 8px 28px #000b!important;padding:14px!important;}
#invPanel.panel .id-name{font:600 20px/1.4 'Noto Serif KR',serif!important;letter-spacing:.01em!important;margin:5px 0 10px!important;overflow-wrap:anywhere;text-shadow:0 2px 2px #000!important;}
#invPanel.panel .id-stats{font:400 13px/1.75 'Noto Sans KR',sans-serif!important;font-variant-numeric:tabular-nums;padding-top:10px!important;border-top:1px solid #75624755!important;}
#invPanel.panel .id-stats>div{padding:3px 0;}
#invPanel.panel .id-stats>div:has(>span):not(:has(>div)){display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;}
#invPanel.panel .id-stats>div:has(>span):not(:has(>div))>span:first-of-type{margin-left:auto;text-align:right;}
#invPanel.panel .ui-item-source{font:500 11px/1.5 'Noto Sans KR',sans-serif!important;color:#bbaa8d!important;letter-spacing:.04em;}
#invPanel.panel .ui-item-hint{font:400 11px/1.65 'Noto Sans KR',sans-serif!important;color:#b4aa98!important;margin-top:12px!important;padding-top:8px;border-top:1px solid #6c5c414d;}
#invPanel.panel .cmp-header{font:600 12px/1.5 'Noto Sans KR',sans-serif!important;color:#cdb992!important;padding-right:22px;}
#invPanel.panel .cmp-close{color:#cbb99b!important;padding:4px;min-width:24px;text-align:center;}
#invPanel.panel :is(#combatPower,#invResBar,.id-btn,.inv-dep-item),#statPanel .growth-metric strong,#forge #forgeMats{font-variant-numeric:tabular-nums;}
:is(#settings,#invPanel,#forge,#skillPanel,#storagePanel,#statPanel).panel .pbox :is(.panel-nav-tab,.pclose,.ui-section-tab,.id-btn,.fg-tab,.set-key){transition:filter .14s,box-shadow .14s,color .14s!important;}
:is(#settings,#invPanel,#forge,#skillPanel,#storagePanel,#statPanel).panel .pbox :is(.panel-nav-tab,.pclose,.ui-section-tab,.id-btn,.fg-tab,.set-key):not(:disabled):not(.dis):not([aria-disabled=true]):hover{filter:brightness(1.16)!important;}
:is(#settings,#invPanel,#forge,#skillPanel,#storagePanel,#statPanel).panel .pbox :is(.panel-nav-tab,.pclose,.ui-section-tab,.id-btn,.fg-tab,.set-key):not(:disabled):not(.dis):not([aria-disabled=true]):active{filter:brightness(.88)!important;box-shadow:inset 0 3px 6px #000b!important;}
:is(#settings,#invPanel,#forge,#skillPanel,#storagePanel,#statPanel).panel .pbox :is(button:disabled,.id-btn.dis,[aria-disabled=true]){opacity:.48!important;filter:saturate(.3)!important;cursor:default!important;}
#skBarTip{width:max-content;max-width:min(480px,calc(100vw - 32px));white-space:normal!important;line-height:1.6!important;padding:10px 14px!important;}
#skBarTip .sbt-name{display:block;font-size:14px!important;line-height:1.5;margin:0 0 4px!important;color:#ead6ad!important;}
#skBarTip .sbt-desc{font-size:12px!important;color:#c4b69e!important;}
@media(prefers-reduced-motion:reduce){#invPanel .inv-item,.panel .pbox :is(.panel-nav-tab,.pclose,.ui-section-tab,.id-btn,.fg-tab,.set-key){transition:none!important;}}

```


## 2026-09-26 유니크 분해 NaN 수정과 상세창 마감

| 원인/대상 | 현재 계약 |
|---|---|
| 원인 | 전대의 유골함은 rarity5/tier0/enh0. 5개 원소뿐인 보상·강화배율 표에서 인덱스5를 읽어 undefined→NaN 발생 |
| 공통 등급 | _itemEconomyRarity(r): 0 이상 정수이면 min(r,4), 나머지는0. 아이템 rarity 자체는 변경하지 않음 |
| 사용 위치 | salvageVal 기본액·강화 환수, enhCost, 장비 교체 시 old._enhRefund 계산 |
| 유니크 기준 | 기존 최상위 경제 등급4를 사용: 기본 분해50,000/강화배율1.8. 일반~전설 값 변경 없음 |
| 유골함 | tier0/enh0/_enhRefund없음인 기본 전대의 유골함:50,000 악의. 표시·개별분해·일괄분해 모두 salvageVal 공유 |
| dropItem | 없는 아이템·fav 잠금은 false. 지급액 비유한/음수이면 삭제·지급 없이false. 정상 삭제/저장 후true를 반환해 기존 onclick의 renderInv 실행 |
| 상세 마감 | 빈 출처행 숨김,조작안내 받침,장착버튼 하단색,12px·34px최소높이·한줄 금속판 버튼,스크롤 거터. hover해도 선택/분해 테두리 유지 |

앞선 슬롯과 상호작용 마감 절에서 기록한 유골함 분해 NaN 미해결 항목을 해결한다. 실제 소지품 화면의 유골함 선택에서 분해(악의 +50000) 표시를 확인했다. 아이템을 실제로 삭제하는 분해 동작은 실행하지 않았다. 기존 저장 데이터의 이미 손상된 악의 잔액은 이 변경으로 추정 복원하지 않는다. 자동 테스트 추가·실행 없음. 캐시 ui-refinement.css?v=20260927-4.


### 스타일 수치 원본

최신 추가 스타일의 정확한 색상·치수·선택자는 아래와 같다. 기존 정보 배경 계약에 덧붙여 적용한다.

```css
/* Detail follow-through: separate metadata, controls, and long descriptions. */
#invPanel.panel .ui-item-source:empty{display:none;}
#invPanel.panel .ui-item-hint{background:linear-gradient(90deg,#33271c33,transparent);padding:8px!important;}
#invPanel.panel .pbox .id-btns{gap:6px!important;align-items:stretch;flex-wrap:nowrap;flex-shrink:0;}
#invPanel.panel .pbox .id-btn{min-height:34px;display:flex;align-items:center;justify-content:center;padding:7px 10px!important;font:500 12px/1.4 'Noto Sans KR',sans-serif!important;white-space:nowrap;background:linear-gradient(#15141782,#0b0a0cac),var(--menu-plate) center/100% 100% no-repeat!important;border:0!important;border-radius:0!important;}
#invPanel.panel .pbox .id-btn.equip:not(.dis){color:#dce5c0!important;box-shadow:inset 0 -2px #788967!important;}
#invPanel.panel .id-stats{scrollbar-gutter:stable;padding-right:6px!important;}
#invPanel.panel .id-stats>div:has(>span:only-child)[style*="margin"]{display:block!important;}
#invPanel.panel .id-stats>div:has(>span:only-child)[style*="margin"]>span{margin-left:0!important;text-align:left!important;}
#invPanel.panel .pbox .inv-item[data-ui-selected=true]:hover{box-shadow:inset 0 0 0 3px #15100bd9,inset 0 0 18px #b9853930!important;}
#invPanel.panel .pbox .inv-item[data-ui-salvage=true]:hover{box-shadow:inset 0 0 0 2px #af5b49!important;}

```


## 2026-09-26 창고와 상세 스크롤 마감

| 문제 | 적용 |
|---|---|
| 창고 원장·격자·상세에 서로 다른 이중 프레임 | 원장 button.webp/추가선0,격자1px #514a3d,상세 frame.webp4%/6px |
| 창고 이전 해골 문양 | vault-seal을 sigil.png110×110px/opacity.22로 교체. 상세 배경230×230px/center25px/감광 |
| 빈 창고가 가방을 밀어냄 | renderStorage의 창고 최소 표시 슬롯30→10(가방은기존10),5열 유지. 실제 항목이10개 초과면5개 단위로 행 증가. 저장 용량STORAGE_MAX200 변경 없음. 각 구획 제목에 보유 개수 추가 |
| 슬롯 상태 차이 | 일반 음각/호버밝기1.16/선택2px상아색/수치10px받침을 소지품과 일치 |
| 보관·꺼내기 조작 | 적갈색 금속판/하단2px#ac7953/최소36px |
| 하단 버튼 증가 시 가방 높이 변화 | inv-actions48px고정/한줄/가로스크롤/자식축소금지. 빈 invActionBtns만 숨김. 기존 전체빈행 숨김 규칙은 유지 |
| 상세창 내부 중첩 스크롤 | id-stats flex:none/overflow:visible, 바깥 invRight에서 스크롤. overscroll contain/안정 거터로 폭 변화 최소화 |
| 접근성 | 기존 보관/꺼내기 동작·aria-pressed·키보드 포커스 유지,감소된 동작 환경에서는 슬롯전환 제거 |

새 이미지 생성 없음. CSS 캐시 ui-refinement.css?v=20260927-4. game.html/game-easy-test.html/index.html 동기화. 자동 테스트 추가·실행 없음. 창고 표시 슬롯 수만 변경하며 아이템 상태·저장 용량·보관 동작 변경 없음. 실제 창고의 새 제목·문양·상세 카드 표시를 확인했다.


### 스타일 수치 원본

최신 추가 스타일의 정확한 색상·치수·선택자는 아래와 같다. 기존 정보 배경 계약에 덧붙여 적용한다.

```css
/* Vault and detail finish: consistent insets and stable action rail. */
#storagePanel.panel .pbox .vault-ledger{width:100%;box-sizing:border-box;border:0!important;box-shadow:none!important;border-radius:0;background:linear-gradient(#19161982,#111015bf),var(--menu-plate) center/100% 100% no-repeat!important;padding:10px 14px;color:#e4d5b8;}
#storagePanel.panel .pbox .vault-slots{border:1px solid #514a3d!important;box-shadow:inset 0 2px 7px #0009!important;padding:6px;gap:4px;background:#0d0c0e;}
#storagePanel.panel .pbox .vault-slot{background:linear-gradient(#222024bb,#100e11e8),var(--ui-surface) center/240px!important;box-shadow:inset 0 2px 5px #0009!important;transition:filter .14s,border-color .14s;}
#storagePanel.panel .pbox .vault-slot:not(.vault-empty):hover{filter:brightness(1.16);outline:1px solid #b9a47c;outline-offset:-1px;}
#storagePanel.panel .pbox .vault-slot[aria-pressed=true]{outline:2px solid #ead1a0!important;outline-offset:-2px!important;box-shadow:inset 0 0 0 3px #15100bd9,inset 0 0 18px #b9853930!important;}
#storagePanel.panel .pbox .vault-level{font:500 10px/1.2 'Noto Sans KR',sans-serif;color:#dfd0b5;background:#0b0b0bd9;padding:2px 3px;bottom:3px;right:3px;font-variant-numeric:tabular-nums;}
#storagePanel.panel .pbox .vault-detail{border:6px solid #504b41!important;border-image:var(--menu-rail) 4% / 6px / 0 stretch!important;background:linear-gradient(#191619eb,#0d0c0ff5),var(--menu-sigil) center 25px/230px 230px no-repeat,#111013!important;box-shadow:none!important;padding:12px!important;min-height:280px;}
#storagePanel.panel .pbox .vault-seal{background:var(--menu-sigil) center/110px 110px no-repeat!important;width:110px;height:110px;opacity:.22;}
#storagePanel.panel .pbox .vault-caption{font-size:11px;letter-spacing:.08em;color:#c3b393;border-bottom:1px solid #75624766;}
#storagePanel.panel .pbox .vault-name{font:600 16px/1.5 'Noto Serif KR',serif;margin:8px 0;}
#storagePanel.panel .pbox .vault-meta{font-size:12px;line-height:1.6;color:#c0b298;font-variant-numeric:tabular-nums;}
#storagePanel.panel .pbox .vault-transfer{background:linear-gradient(#57170c88,#260907aa),var(--menu-plate) center/100% 100% no-repeat!important;border:0!important;box-shadow:inset 0 -2px #ac7953!important;border-radius:0;min-height:36px;}
#invPanel.panel .pbox .inv-actions{flex-wrap:nowrap!important;flex-shrink:0!important;height:48px!important;min-height:48px!important;max-height:48px!important;box-sizing:border-box;overflow-x:auto;overflow-y:hidden;justify-content:flex-start!important;gap:8px;scrollbar-width:thin;}
#invPanel.panel .pbox .inv-actions>*{flex-shrink:0!important;}
#invPanel.panel .pbox #invActionBtns:empty{display:none;}
#invPanel.panel .pbox .inv-actions :is(button,.pclose,.id-btn){white-space:nowrap!important;}
#invPanel.panel .pbox #invRight{overscroll-behavior:contain;scrollbar-gutter:stable;}
#invPanel.panel .pbox #invRight .item-detail{flex-shrink:0;min-height:0;}
#invPanel.panel .pbox #invRight .id-stats{flex:none!important;overflow:visible!important;}
#invPanel.panel .pbox #invRight .ui-item-hint{margin-bottom:2px;}
#invPanel.panel .pbox #invCompareFloat{overscroll-behavior:contain;scrollbar-gutter:stable;}
@media(max-width:560px){#storagePanel.panel .pbox .vault-detail{min-height:180px;}#storagePanel.panel .pbox .vault-slots{gap:3px;padding:4px;}}
@media(prefers-reduced-motion:reduce){#storagePanel.panel .pbox .vault-slot{transition:none;}}

```


## 2026-09-27 소지품 필터와 상세 보조 정보

| 대상 | 적용 계약 |
|---|---|
| inv-filter-btn | span을 type=button으로 전환. aria-pressed에 선택 상태 반영. --filter-color에 기존 등급/속성 색 전달. 기존 필터 토글와 renderInv 유지 |
| 필터 재질 | 필터 영역 최대 높이68px/내부 세로 스크롤. 금속판, 28px 최소 높이, 11px 글씨, 선택 시 하단 2px 색선. 비선택 글씨 #c8bda7 |
| 키보드 초점 | 필터/상세 버튼/비교 닫기: 2px #ead1a0 안쪽 outline, offset -3px |
| 상세 보조 정보 | id-type 12px/1.6, #c0b298, 긴 단어 줄바꿈 |
| 비교 닫기 | 28×28px 금속색 버튼 받침, 헤더 오른쪽 36px 확보 |

캐시 ui-refinement.css?v=20260927-4. 신규 이미지 없음. 자동 테스트 추가·실행 없음. 정확한 스타일 수치는 아래 원본 참조.

```css
/* Inventory filter finish: readable plates and explicit selection. */
#invPanel.panel .pbox #invFilters{gap:5px!important;padding:8px 0!important;max-height:68px;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;}
#invPanel.panel .pbox .inv-filter-btn{appearance:none;box-sizing:border-box;min-height:28px;padding:5px 9px!important;margin:0!important;border:1px solid #544a3b!important;border-radius:0;color:#c8bda7!important;background:linear-gradient(#19171ac9,#100e11ed),var(--menu-plate) center/100% 100% no-repeat!important;font:500 11px/1.4 'Noto Sans KR',sans-serif!important;letter-spacing:.02em;transition:filter .14s!important;}
#invPanel.panel .pbox .inv-filter-btn.act{color:var(--filter-color,#ecd4a4)!important;border-color:#9b8259!important;box-shadow:inset 0 -2px var(--filter-color,#ecd4a4)!important;background:linear-gradient(#483724a6,#1b1510df),var(--menu-plate) center/100% 100% no-repeat!important;}
#invPanel.panel .pbox .inv-filter-btn:hover{filter:brightness(1.18);}
#invPanel.panel .pbox :is(.inv-filter-btn,.id-btn,.cmp-close):focus-visible{outline:2px solid #ead1a0!important;outline-offset:-3px!important;}
#invPanel.panel .pbox .id-type{font:500 12px/1.6 'Noto Sans KR',sans-serif!important;color:#c0b298!important;margin:0 0 8px!important;overflow-wrap:anywhere;}
#invPanel.panel .pbox .cmp-header{min-height:28px;box-sizing:border-box;padding:4px 36px 8px 0!important;border-bottom:1px solid #75624766!important;}
#invPanel.panel .pbox .cmp-close{box-sizing:border-box;width:28px;height:28px;line-height:20px;border:1px solid #786144;background:#181417;right:8px;top:6px;}
@media(prefers-reduced-motion:reduce){#invPanel.panel .pbox .inv-filter-btn{transition:none!important;}}
```


## 2026-09-27 인벤토리 중복 제목 제거

사용자 지시: 메뉴 탭으로 인벤토리임을 알 수 있으므로 큰 제목 장식은 제거하고 배낭 공간을 확보한다. 앞선 인벤토리 제목판 118px 계약을 대체한다.

| 항목 | 현재 계약 |
|---|---|
| 인벤토리 제목판 | 직계 헤더의 .ptitle display:none. 제목 이미지와 가상요소도 표시하지 않음 |
| 정보행 | 전투력/악의/닫기 유지. gap0, margin4px 0 8px |
| 높이 배분 | inv-wrap 첫 행270px, 가방 행 minmax(240px,1fr). 확보한 나머지 높이는 가방에 배정. 작은 화면은 기존 바깥 세로 스크롤 사용 |
| 적용 범위 | 인벤토리 내부 장비/유골함/보석/보관함 페이지 공통. 다른 메뉴 제목 유지 |

CSS 캐시 ui-refinement.css?v=20260927-4. 신규 이미지/아이템 데이터 변경/자동 테스트 추가·실행 없음.

```css
/* Inventory uses its navigation tab as the title; give the recovered space to the bag. */
#invPanel.panel .pbox>div:has(>.ptitle)>.ptitle{display:none!important;}
#invPanel.panel .pbox>div:has(>.ptitle){gap:0!important;margin:4px 0 8px!important;}
#invPanel.panel .pbox .inv-wrap{grid-template-rows:270px minmax(240px,1fr)!important;}
```


## 2026-09-27 아이템 정보 호버 종료

| 항목 | 현재 동작 |
|---|---|
| 원인 | _invClearHover가 이전 선택 아이템의 상세를 다시 렌더하여 마우스를 뗀 후에도 정보창이 남음 |
| 종료 | 기존 선택 복원 처리를 _invRestoreSelectedActions로 분리. _invClearHover는 이를 호출한 뒤 invRight visibility:hidden, invCompareFloat display:none |
| 재진입·선택 | _invRenderDetail에서 유효 아이템 확인 후 visibility:visible. 호버/클릭/패드 상세 진입 시 표시 |
| 유지 | INV.selected와 선택 테두리, 하단 장착·분해 버튼, 고정 48px 조작 영역 유지 |

이 절은 이전 선택 상세 자동 복원 계약을 대체한다. 아이템 데이터·저장 변경 없음. 자동 테스트 추가·실행 없음.


## 2026-09-27 유골함 탭 아이템 분류

| 항목 | 현재 계약 |
|---|---|
| 유골함 탭 배낭 | slot=ossuary 또는 bonePart인 소지 아이템 모두 표시. 장착 유골함·등록 도감은 우측 컬렉션(폭899px 이하 가방 아래)에서 표시 |
| 장비 탭 배낭 | ossuary/bonePart 제외 |
| 보관함 탭 배낭 | 기존 전체 소지 아이템 표시 |
| 전환 | _invChangeCategory: INV.selected=null, _invHover=-1, 분해 선택 clear, invFilter의 slot/rarity/el=null. renderInv 후 정보창 숨김 |
| 개수 | invCount는 현재 분류 보유 개수. invMax/BAG_MAX는 기존 공유 용량 |
| 일괄 조작 | 전체 쓰레기 지정/일괄분해는 filtered에 포함된 현재 표시 아이템만 대상. 분해는 확인창에 제시한 _jkItems 객체만 제거 |
| 데이터 | INV.bag/장착/도감/창고 저장 구조와 기존 좌표·용량 유지. 실제 아이템 복제·자동등록·소모 없음 |
| 함수/캐시 | _invCategoryMatches, _invChangeCategory. ui-panels.js?v=20260927-1 |

기존 필터 조건은 탭 분류 안에서 적용한다. 자동 테스트 추가·실행 없음.


## 2026-09-27 유골 콜렉션 제단 개편

사용자 확정: 참고 스크린샷 2026-09-27 165617의 중앙/주변 배치를 따라 중앙 유골함과 부위별 등급 콜렉션을 구성한다. 기존 소형 목록 UI를 대체한다.

| 항목 | 현행 계약 |
|---|---|
| 구성 | 중앙 유골함, 위 두개골(skull), 왼쪽 팔(arms), 오른쪽 몸통(torso), 아래 다리(legs). 철갑 전대 1종, 4부위 |
| 등급 | 각 부위 독립 rarity 0~5, tier 0~4. 등급명·등급색 보석 표시. T(tier+1)·위력(r+t)는 선택 상세에 표시. 미수집은 어두운 실루엣과 미수집 문구 |
| 수집·갱신 | 기존 INV.ossCollect['iron_warlord_'+part]={r,t}. 등록된 부위는 높은 r+t만 교체하며, 명시적 해제 시 해당 기록을 삭제하고 가방으로 반환. 동점/하위는 가방에서 기존 분해 가능. 등급별 별도 중복 앨범이나 동일 등급 세트 조건은 없음 |
| 해금 | _OSS_UNLOCK_ALL 임시 우회 제거. _ancPartPts는 미수집=-1, _ossSetComplete는 실제 4부위 필요. 혼합 등급 허용, 일반 r0/t0도 유효. 4/4+유골함 장착 시 소환 해금 표시. 자동 시전하지 않고 기존 전대 소환 스킬 사용 |
| 부위 효과 | 두개골=치명·위력, 몸통=최대HP, 팔=공격 위력, 다리=크기·이속. 기존 _calcAncestorStats 수치와 r+t 공식 유지 |
| 상호작용 | 부위 버튼 클릭/키보드 선택 → 하단 성장 효과. 중앙 유골함 좌클릭 상세, 호버 미리보기, 우클릭/유골함 해제 버튼. 유골 부위 우클릭/선택 유골 해제 버튼으로 가방 반환. 기존 등록/분해 유지 |
| DOM | renderOssPanel이 최초 1회 createElement/append로 구성. 이후 기존 노드·초점·핸들러 보존, 특정 리프 textContent만 갱신. 부모 innerHTML 교체 없음 |
| 제단 레이아웃 | 유골함 탭 창 폭 min(980px,100vw−24px),높이 min(680px,94vh). 좌측 가방/우측 컬렉션 동등한 1fr씩,간격10px. 제단 최대폭380px/높이284px,원환274×274px. 중앙90×100px,부위88×88px. 두개골(50%,16%),팔(18%,50%),몸통(82%,50%),다리(50%,84%). 유골함 그림58×66px,부위38×38px |
| 좁은 화면 | 폭560px 이하 부위76×96px, 중앙90×112px, 팔x14%/몸통x86%, 패널 padding12px 8px. 제단 높이338px 유지 |
| 그림·폴백 | 기존 유골함58×66px/부위38×38px. 제단·슬롯 PNG 유지. 로딩 실패 시 이름·그림·조작 및 CSS 바탕 유지 |
| 금속 원환 | 1024px 석재·황동 제단 아트를274×274px로 표시 |
| 접근성 | 실제 button·aria-label·aria-pressed·focus-visible. 해금 상태 role=status, 부위 설명 aria-live=polite. reduced-motion 시 transition 제거 |
| 버전·적용 | game.html 및 game-easy-test.html, ui-refinement.css?v=20260927-bone-withdraw |
| 검증 | test/ossuaryCollection.test.js 6개 PASS(미수집 차단/혼합등급 완성/기존 저장 보존). 격리 브라우저 0→4 수집·하위거부·상위갱신·DOM 보존·유골함 해제 확인. 1440×1080 캡처,1280×720·390×844 슬롯 겹침/가로 넘침 없음, pageerror 0 |

실제 유골 수집 기록이 없는 구세이브는 잠금 상태로 표시된다. 임시 우회로 소환하던 기록을 유골 수집으로 만들어 주지 않으며 기존 아이템·도감 저장값을 삭제하거나 이관하지 않는다.


### 유골 제단 현행 CSS

```css
/* Ancestral collection altar: sculpted basalt, bronze and individual relic sockets. */
#invPanel.panel[data-inventory-page=ossuary] .pbox{width:min(980px,calc(100vw - 24px))!important;height:min(680px,94vh)!important;}
#invPanel.panel[data-inventory-page=ossuary] .pbox .inv-wrap{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:minmax(0,1fr)!important;overflow:hidden!important;}
#invPanel.panel[data-inventory-page=ossuary] .pbox #invCenter{grid-column:1!important;grid-row:1!important;min-width:0!important;min-height:0!important;}
#invPanel.panel[data-inventory-page=ossuary] .pbox #invOssuaryPanel{grid-column:2!important;grid-row:1!important;min-width:0!important;overflow-y:auto!important;}
#invPanel.panel .pbox #invOssuaryPanel{display:flex;flex-direction:column;align-items:stretch;padding:10px 12px!important;overflow:hidden!important;background:radial-gradient(ellipse at 50% 42%,#44352345,transparent 70%),linear-gradient(#0c0e10b8,#0c0d0fea),var(--ui-surface) center/cover!important;}
#invOssuaryPanel .oss-collection-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:2px 0 8px;border-bottom:1px solid #75604470;flex-shrink:0;}
#invOssuaryPanel .oss-collection-title{font:600 14px/1.5 'Noto Serif KR',serif;color:#e0ceb0;letter-spacing:.07em;text-shadow:0 2px 2px #000;}
#invOssuaryPanel .oss-collection-count{font:500 11px/1.5 'Noto Sans KR',sans-serif;color:#c9b593;white-space:nowrap;font-variant-numeric:tabular-nums;padding:4px 9px;background:#090b0e80;border:1px solid #6f583b70;box-shadow:inset 0 1px 5px #0008;}
#invOssuaryPanel .oss-altar{width:100%;max-width:380px;height:284px;min-height:284px;position:relative;align-self:center;isolation:isolate;margin:4px 0;}
#invOssuaryPanel .oss-ritual-ring{position:absolute;left:50%;top:50%;width:274px;height:274px;transform:translate(-50%,-50%);border:0;border-radius:50%;background:radial-gradient(circle,#121414 22%,#665132 44%,#141617 69%);box-shadow:0 8px 24px #000a;z-index:-1;}
#invOssuaryPanel .oss-ritual-ring:before{content:'';position:absolute;inset:-12px;background:url('img/ui/ossuary_altar_hf_v2.png') center/contain no-repeat;mask-image:radial-gradient(circle,#000 62%,#0009 66%,transparent 71%);filter:brightness(.72) saturate(.7);}
#invOssuaryPanel .oss-ritual-ring:after{content:'';position:absolute;inset:32%;border-radius:50%;background:radial-gradient(ellipse,#c8a35216,transparent 67%);box-shadow:inset 0 0 30px #0009;}
#invPanel.panel .pbox #invOssuaryPanel :is(.oss-center,.oss-bone-node){appearance:none;position:absolute;transform:translate(-50%,-50%);margin:0;padding:0;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;border:0;border-radius:0;background:transparent;color:#b8ab94;transition:filter .18s;isolation:isolate;}
#invPanel.panel .pbox #invOssuaryPanel .oss-center{left:50%;top:50%;width:90px;height:100px;background:radial-gradient(ellipse at 50% 64%,#bea46318,transparent 67%);z-index:2;filter:drop-shadow(0 6px 7px #000);}
#invOssuaryPanel .oss-center:before{content:'';position:absolute;inset:-6px -4px;background:url('img/ui/ossuary_socket_hf_v2.png') center/125% 112% no-repeat;z-index:-1;filter:brightness(.82) saturate(.7);}
#invOssuaryPanel .oss-urn-image{width:58px;height:66px;object-fit:contain;filter:drop-shadow(0 3px 4px #000) brightness(1.2);}
#invOssuaryPanel .oss-urn-label{position:absolute;bottom:1px;padding:2px 10px;background:linear-gradient(90deg,transparent,#0b0d0fed 18%,#0b0d0fed 82%,transparent);font:600 12px/1.5 'Noto Serif KR',serif;color:#dfcda5;letter-spacing:.16em;text-shadow:0 2px 3px #000;}
#invOssuaryPanel .oss-center.empty .oss-urn-image{filter:grayscale(1) brightness(.45);opacity:.65;}
#invPanel.panel .pbox #invOssuaryPanel .oss-bone-node{width:88px;height:88px;filter:drop-shadow(0 5px 4px #000);}
#invOssuaryPanel .oss-bone-node:before{content:'';position:absolute;inset:-4px -2px;background:url('img/ui/ossuary_socket_hf_v2.png') center/125% 112% no-repeat;filter:brightness(.6) saturate(.4);z-index:-1;}
#invOssuaryPanel .oss-bone-node:after{content:'';position:absolute;left:50%;bottom:3px;width:4px;height:4px;transform:translateX(-50%) rotate(45deg);background:#39362d;border:1px solid #7d694a;box-shadow:0 1px 2px #000;}
#invOssuaryPanel .oss-bone-node[data-part=skull]{left:50%;top:16%;}
#invOssuaryPanel .oss-bone-node[data-part=torso]{left:82%;top:50%;}
#invOssuaryPanel .oss-bone-node[data-part=arms]{left:18%;top:50%;}
#invOssuaryPanel .oss-bone-node[data-part=legs]{left:50%;top:84%;}
#invOssuaryPanel .oss-bone-name{font:600 11px/1.4 'Noto Serif KR',serif;color:#ddceb4;text-shadow:0 2px 2px #000;letter-spacing:.06em;}
#invOssuaryPanel .oss-bone-image{width:38px;height:38px;object-fit:contain;filter:grayscale(1) brightness(.42);opacity:.7;}
#invOssuaryPanel .oss-bone-grade{font:600 11px/1.5 'Noto Sans KR',sans-serif;color:#938c7e;text-shadow:0 2px 3px #000;}
#invOssuaryPanel .oss-bone-tier{display:none;}
#invOssuaryPanel .oss-bone-node.collected:before{filter:brightness(.95) saturate(.75);}
#invOssuaryPanel .oss-bone-node.collected:after{background:var(--bone-rarity);border-color:color-mix(in srgb,var(--bone-rarity),#e4c78c 35%);box-shadow:0 0 7px color-mix(in srgb,var(--bone-rarity) 65%,transparent);}
#invOssuaryPanel .oss-bone-node.collected .oss-bone-grade{color:color-mix(in srgb,var(--bone-rarity) 70%,#e1ccb0);}
#invOssuaryPanel .oss-bone-node.collected .oss-bone-image{filter:drop-shadow(0 3px 3px #000) brightness(1.13);opacity:1;}
#invOssuaryPanel .oss-bone-node.selected:before{filter:brightness(1.28) saturate(.9);}
#invPanel.panel .pbox #invOssuaryPanel :is(.oss-bone-node,.oss-center):hover{filter:drop-shadow(0 5px 4px #000) brightness(1.2);}
#invPanel.panel .pbox #invOssuaryPanel :is(.oss-bone-node,.oss-center):focus-visible{outline:1px solid #e4cca0;outline-offset:2px;}
#invOssuaryPanel.oss-ready .oss-center:before{filter:brightness(1.14) saturate(.9) drop-shadow(0 0 7px #b6a04b44);}
#invOssuaryPanel.oss-ready .oss-center{background:radial-gradient(ellipse at 50% 60%,#b1bb672a,transparent 70%);}
#invOssuaryPanel.oss-ready .oss-ritual-ring:before{filter:brightness(.9) saturate(.85);}
#invOssuaryPanel .oss-collection-footer{display:flex;align-items:center;justify-content:center;gap:14px;padding:8px 0 6px;border-top:1px solid #75604470;background:linear-gradient(90deg,transparent,#8b70471a,transparent);}
#invOssuaryPanel .oss-ancestor-name{font:600 15px/1.5 'Noto Serif KR',serif;color:#e0cdae;letter-spacing:.1em;text-shadow:0 2px 2px #000;}
#invOssuaryPanel .oss-unlock-state{font:500 10px/1.5 'Noto Sans KR',sans-serif;color:#aa9e85;border:1px solid #74603d66;padding:3px 7px;background:#0b0d0f99;}
#invOssuaryPanel.oss-ready .oss-unlock-state{color:#c6d7a7;border-color:#98a16c66;background:#27301b55;}
#invOssuaryPanel :is(.oss-part-detail,.oss-collection-hint){margin:4px 0!important;text-align:center;font:400 11px/1.5 'Noto Sans KR',sans-serif;color:#c0b39b;}
#invOssuaryPanel .oss-part-detail{min-height:42px;padding:8px 10px;background:#080a0b9c;border:1px solid #75604440;box-sizing:border-box;}
#invOssuaryPanel .oss-collection-hint{color:#968974;font-size:10px;}
@media(max-width:899px){
  #invPanel.panel[data-inventory-page=ossuary] .pbox .inv-wrap{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:240px minmax(440px,1fr)!important;overflow-y:auto!important;}
  #invPanel.panel[data-inventory-page=ossuary] .pbox #invOssuaryPanel{grid-column:1!important;grid-row:2!important;}
}
@media(max-width:560px){
  #invPanel.panel .pbox #invOssuaryPanel{padding:10px 8px!important;}
  #invOssuaryPanel .oss-collection-title{font-size:12px;letter-spacing:0;}
  #invOssuaryPanel .oss-collection-count{font-size:10px;padding:3px 5px;}
  #invPanel.panel .pbox #invOssuaryPanel .oss-bone-node{width:76px;height:88px;}
  #invPanel.panel .pbox #invOssuaryPanel .oss-center{width:82px;height:100px;}
  #invOssuaryPanel .oss-bone-node[data-part=arms]{left:15%;}
  #invOssuaryPanel .oss-bone-node[data-part=torso]{left:85%;}
}
@media(prefers-reduced-motion:reduce){#invPanel.panel .pbox #invOssuaryPanel :is(.oss-center,.oss-bone-node){transition:none;}}
```


## 2026-09-27 보석 전용 인벤토리

사용자 요청은 유골함처럼 보석 전용 인벤토리 탭을 만드는 것이다. 기존 장비·결정 등급/수치/저장 구조는 변경하지 않는다.

| 항목 | 현행 계약 |
|---|---|
| 경로 | 장비 / 유골함 / 보석 / 보관함. 보석 버튼 inventory-tab-crystals, 패널 invCrystalsPanel, data-inventory-page=crystals |
| 데이터 | CRYSTAL_BAG 9999개 한도, CRYSTAL_DUST. 동일 id+star+enh 묶음, 원본 순서 보존. 18종·5성·+20강 유지 |
| 렌더 | renderInvCrystals; _invCrFilter=all/atk/def/acc, _invCrSelected는 실제 객체. 대장간/피커 필터와 독립 |
| 조작 | 호버 상세, 클릭/키보드 초점 선택, 호환 장착 장비 빈 홈 선택 → attachCrystal → dbSaveNow. 객체 인덱스·장비 동일성·빈 홈 재확인 |
| 가공 | 강화·합성·분해·제작은 기존 대장간 결정 탭. 장비 상세 소켓 피커·무료 탈착 유지 |
| 분리 | 보석 탭에서 장비판/유골함/창고/일반 가방/장비 상세/분해 버튼 숨김. 다른 페이지로 전환하면 기존 표시 복귀 |
| 구현 파일 | game.html, ui-panels.js, inventory-gems.css. ui-panels.js 캐시 20260927-gems, inventory-gems.css 캐시 20260927-2 |
| 검증 | Node 회귀 14개 PASS, game.html 인라인6개 구문 PASS. 저장 IO 없는 실제 UI 함수/CSS 브라우저 fixture에서 36묶음(72개)·방어12묶음·클릭/키보드 장착·4탭 왕복·영문·520px·빈 화면 PASS, pageerror0 |
| 검증 범위 | tmp/inventory-gems-qa/preview.html, screenshots/result.json. 전체 게임 시작 경로는 전환 연출/실행 중단으로 검증 완료하지 않음. UI 검수는 격리 fixture 결과 |

상세 데이터 계약: docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md. 스타일 원본: inventory-gems.css.

### 보석 화면 스타일 규격

| 대상 | 현행 값 (2026-09-27 디테일 2차) |
|---|---|
| 보석 탭 창 | width min(860px,100vw−24px). 다른 탭 폭은 기존 규칙 |
| 패널 | padding18px 20px 12px, 프레임6px/menu-rail4%, 단일 minmax(0,1fr)행 |
| 내부 | 상단 보석 격자 minmax(150px,1fr) + 하단 감정판208px, 간격14px |
| 셀 | auto-fill 최소72px, 행88px, 간격5px, 내부8px. 그리드 세로스크롤 |
| 상세판 | 열80px/남은폭/180px, 간격16px, padding16px 18px. 좌측 보석/중앙 효과/우측 홈 버튼 |
| 재질 | 기존 ui-surface/menu-rail/menu-plate/menu-sigil 재사용. 함몰 칸·각인 모서리·접촉 그림자·세선 황동 구획 |
| 보석 | 기본43×51px, 상세54×64px. 기존 CRYSTAL_DEFS.col + CSS 면 분할·반사선. 기본 saturate(.88) contrast(1.2) |
| 정보 | 제목18px, 이름17px, 효과26px, 설명11px, 부위 설명10px, 성급/강화10px, 수량16px |
| 상태 | 등급색30% 셀 테두리. 선택1px #ceb57e 안쪽선, 키보드2px #f2dbac. hover 보석−2px/brightness1.16/saturate1.12 |
| 버튼 | 필터 최소34px, 장착 최소32px. 장착 버튼7px 마름모 홈 표시, 자원10px 가루 문양 |
| 높이≤760·폭≥641 | 상단 minmax(120px,1fr), 하단178px, 간격10px, 행80px, 상세padding12px 16px |
| 폭≤640 | 패널padding12px 10px 10px; 상단minmax(140px,1fr)/하단230px/간격12px; 셀 최소61px/행80px/gap4px/padding5px |
| 폭≤640 상세 | 열58px/남은폭/130px·간격10px·padding12px, 보석44×54px, 제목/이름15px |
| 폭≤420 | 상세2열48px/남은폭, 장착 버튼은 하단 전체폭, 상세 내부스크롤. 일반 보석36×45px, 제목행/푸터 줄바꿈 |
| 접근성 | 버튼·aria·초점은 기존 유지. prefers-reduced-motion에서 전환과 hover 이동 제거 |
| 캐시 | inventory-gems.css?v=20260927-2 |

정확한 색상·면 좌표·그림자·반응형 선택자는 아래 CSS 원본을 따른다.

```css
/* Socket gems: iron specimen trays above a compact inspection desk. */
#invPanel.panel .pbox #invCrystalsPanel{display:none;}
#invPanel.panel[data-inventory-page=crystals] .pbox{width:min(860px,calc(100vw - 24px))!important;}
#invPanel.panel[data-inventory-page=crystals] .pbox :is(.inv-equip,#invOssuaryPanel,#invStorageCol,#invCenter,#invRight,.inv-actions){display:none!important;}
#invPanel.panel[data-inventory-page=crystals] .pbox .inv-wrap{grid-template-rows:minmax(0,1fr)!important;}
#invPanel.panel[data-inventory-page=crystals] .pbox #invCrystalsPanel{position:relative;isolation:isolate;display:flex;flex-direction:column;grid-column:1;grid-row:1;min-width:0;min-height:0;padding:18px 20px 12px;border:6px solid #504b41;border-image:var(--menu-rail) 4% / 6px / 0 stretch;background:radial-gradient(ellipse at 50% 0,#5c482f20,transparent 62%),linear-gradient(#141617f5,#0b0d0ff7),var(--ui-surface) center/420px;box-shadow:inset 0 0 30px #0009;}
#invPanel .inv-cr-head{position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:14px;border-bottom:1px solid #75624780;box-shadow:0 1px #000;flex-shrink:0;}
#invPanel .inv-cr-head::after{content:'';position:absolute;width:5px;height:5px;bottom:-3px;left:50%;transform:rotate(45deg);background:#a78a58;box-shadow:0 0 0 3px #151617;}
#invPanel .inv-cr-heading{margin:0;font:600 18px/1.5 'Noto Serif KR',serif;letter-spacing:.06em;color:#e1cfac;text-shadow:0 2px 2px #000;}
#invPanel :is(.inv-cr-capacity,.inv-cr-dust){color:#c5b698;font:500 12px/1.5 'Noto Sans KR',sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap;}
#invPanel .inv-cr-capacity{padding:4px 8px;border-left:1px solid #6c5d42;background:linear-gradient(90deg,#79613c19,transparent);}
#invPanel .inv-cr-filters{display:flex;gap:4px;padding:12px 0;flex-wrap:wrap;flex-shrink:0;}
#invPanel :is(.inv-cr-filter,.inv-cr-attach){appearance:none;box-sizing:border-box;border:1px solid #504b40;border-radius:1px;background:linear-gradient(#2c2c29b0,#111515e8),var(--menu-plate) center/100% 100%;box-shadow:inset 0 1px #b5a07920,inset 0 -2px #0008;color:#b6ae9c;cursor:pointer;font:500 12px/1.5 'Noto Sans KR',sans-serif;padding:7px 18px;min-height:34px;transition:border-color .14s,color .14s,filter .14s;}
#invPanel .inv-cr-filter[aria-pressed=true]{color:#ecdbb8;border-color:#9c8155;background:linear-gradient(#574532a0,#211d18dc),var(--menu-plate) center/100% 100%;box-shadow:inset 0 1px #c5a87766,inset 0 -2px #ad8b56;}
#invPanel .inv-cr-filter:hover{color:#e6d8bd;filter:brightness(1.12);}
#invPanel .inv-cr-body{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(150px,1fr) 208px;gap:14px;flex:1;min-height:0;overflow:hidden;}
#invPanel .inv-cr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));grid-auto-rows:88px;align-content:start;gap:5px;padding:8px;overflow-y:auto;overscroll-behavior:contain;min-height:0;border:1px solid #615642;border-top-color:#817052;outline:1px solid #080a0b;outline-offset:2px;background:repeating-linear-gradient(0deg,#ffffff02 0 1px,transparent 1px 4px),radial-gradient(ellipse at 50% 0,#342d252e,transparent 75%),#090c0e;box-shadow:inset 0 3px 12px #000b,0 1px #afa07b22;scrollbar-gutter:stable;scrollbar-width:thin;scrollbar-color:#756247 #0d1011;}
#invPanel .inv-cr-slot{position:relative;isolation:isolate;display:flex;align-items:center;justify-content:center;min-width:0;padding:12px 8px 16px;border:1px solid color-mix(in srgb,var(--gem-rank) 30%,#3a3b38);border-bottom-color:#242928;border-radius:1px;background:linear-gradient(130deg,#ffffff05,transparent 45%),radial-gradient(ellipse at 50% 80%,color-mix(in srgb,var(--gem-rank) 9%,transparent),transparent 75%),linear-gradient(#171c1ecf,#090c10ed),var(--ui-surface) center/260px;box-shadow:inset 0 0 0 2px #080b0cc9,inset 0 3px 8px #000c,0 1px #9891771a;cursor:pointer;color:#e6ddc8;transition:border-color .14s;}
#invPanel .inv-cr-slot::before{content:'';position:absolute;left:19%;right:19%;height:12px;bottom:16px;background:#000b;filter:blur(3px);border-radius:50%;z-index:-1;}
#invPanel .inv-cr-slot::after{content:'';position:absolute;inset:3px;pointer-events:none;background:linear-gradient(#9c8a5d,#9c8a5d) top left/7px 1px no-repeat,linear-gradient(#9c8a5d,#9c8a5d) top left/1px 7px no-repeat,linear-gradient(#9c8a5d,#9c8a5d) bottom right/7px 1px no-repeat,linear-gradient(#9c8a5d,#9c8a5d) bottom right/1px 7px no-repeat;opacity:.25;}
#invPanel .inv-cr-slot:hover{border-color:#9c8e70;}
#invPanel .inv-cr-slot:hover .inv-cr-gem{filter:brightness(1.16) saturate(1.12);transform:translateY(-2px);}
#invPanel .inv-cr-slot[aria-pressed=true]{border-color:#ceb57e;outline:1px solid #ceb57e;outline-offset:-3px;box-shadow:inset 0 0 18px #9972382b,0 0 0 1px #090909;}
#invPanel .inv-cr-slot[aria-pressed=true]::after{opacity:1;}
#invPanel :is(.inv-cr-slot,.inv-cr-filter,.inv-cr-attach):focus-visible{outline:2px solid #f2dbac;outline-offset:-3px;}
#invPanel .inv-cr-gem{--cut:polygon(50% 0,94% 28%,84% 78%,50% 100%,16% 78%,6% 28%);position:relative;display:block;width:43px;height:51px;flex-shrink:0;clip-path:var(--cut);background:linear-gradient(125deg,#fffc 0%,#fff2 14%,transparent 27%,#0008 75%,#fff8 100%),conic-gradient(from 16deg at 48% 36%,#fff7 0deg 37deg,#0009 38deg 85deg,#fff1 86deg 131deg,#000b 132deg 180deg,#fff6 181deg 229deg,#0006 230deg 277deg,#fffb 278deg 322deg,#fff2 323deg 360deg),var(--gem-color);filter:saturate(.88) contrast(1.2);transition:filter .16s,transform .16s;}
#invPanel .inv-cr-gem::before{content:'';position:absolute;inset:8px 9px 13px;clip-path:polygon(50% 0,100% 29%,78% 83%,48% 100%,17% 80%,0 29%);background:linear-gradient(145deg,#fff9,transparent 33%,#0007 72%,#fffa),conic-gradient(from 30deg at 54% 45%,transparent 0deg 105deg,#0005 106deg 220deg,#fff3 221deg 300deg,transparent 301deg),var(--gem-color);box-shadow:inset 0 0 8px #ffffff45;}
#invPanel .inv-cr-gem::after{content:'';position:absolute;inset:0;clip-path:var(--cut);background:linear-gradient(115deg,transparent 24%,#fff8 25%,transparent 26%),linear-gradient(67deg,transparent 57%,#fff5 58%,transparent 59%),radial-gradient(ellipse at 28% 25%,#fff 0 1%,#fff8 2%,transparent 13%);opacity:.8;}
#invPanel .inv-cr-gem[data-category=def]{--cut:polygon(24% 0,76% 0,100% 25%,100% 75%,76% 100%,24% 100%,0 75%,0 25%);}
#invPanel .inv-cr-gem[data-category=acc]{--cut:polygon(50% 0,100% 50%,50% 100%,0 50%);}
#invPanel :is(.inv-cr-tier,.inv-cr-enh,.inv-cr-count){position:absolute;font:500 10px/1.2 'Noto Sans KR',sans-serif;font-variant-numeric:tabular-nums;text-shadow:0 1px 3px #000,0 1px 1px #000;pointer-events:none;}
#invPanel .inv-cr-tier{top:5px;left:6px;color:color-mix(in srgb,var(--gem-rank) 70%,#a6a18f);}
#invPanel .inv-cr-enh{top:5px;right:6px;color:#b4c9ca;}
#invPanel .inv-cr-count{bottom:5px;right:7px;font:500 16px/1 'Noto Serif KR',serif;color:#e3d6b9;}
#invPanel .inv-cr-detail{position:relative;isolation:isolate;box-sizing:border-box;display:grid;grid-template-columns:80px minmax(0,1fr) 180px;grid-template-rows:auto auto auto auto 1fr;column-gap:16px;align-content:start;overflow-y:auto;min-height:0;padding:16px 18px;border:1px solid #746344;border-top:3px double #8a7650;background:radial-gradient(ellipse at 10% 40%,#76644520,transparent 55%),linear-gradient(#181b1cee,#0b0f11f5),var(--ui-surface) center/380px;box-shadow:inset 0 0 0 3px #070a0b,inset 0 0 0 4px #76654822;scrollbar-width:thin;scrollbar-color:#756247 #0d1011;}
#invPanel .inv-cr-detail::before{content:'';position:absolute;left:16px;top:22px;width:94px;height:120px;border:1px solid #75613c66;background:var(--menu-sigil) center/110px no-repeat;opacity:.38;z-index:-1;}
#invPanel .inv-cr-detail>.inv-cr-gem{grid-column:1;grid-row:1/6;width:54px;height:64px;align-self:center;justify-self:center;margin:0;}
#invPanel .inv-cr-name{grid-column:2;grid-row:1;font:600 17px/1.4 'Noto Serif KR',serif;margin:0 0 4px;text-shadow:0 2px #000;}
#invPanel .inv-cr-meta{grid-column:2;grid-row:2;font:11px/1.5 'Noto Sans KR',sans-serif;color:#b4a78d;margin:0 0 6px;}
#invPanel .inv-cr-stat{grid-column:2;grid-row:3;font:600 26px/1.2 'Noto Serif KR',serif;color:#d3dfbe;margin:1px 0 5px;text-shadow:0 2px #000;}
#invPanel .inv-cr-note{font:11px/1.65 'Noto Sans KR',sans-serif;color:#a99f8d;margin:3px 0;overflow-wrap:anywhere;}
#invPanel .inv-cr-detail>.inv-cr-note:nth-child(5){grid-column:2;grid-row:4;color:#cbbfa5;}
#invPanel .inv-cr-detail>.inv-cr-note:nth-child(6){grid-column:2;grid-row:5;font-size:10px;color:#8c887c;}
#invPanel .inv-cr-help{font:500 16px/1.5 'Noto Serif KR',serif;letter-spacing:.03em;color:#d5c29e;margin:14px 0 7px;}
#invPanel .inv-cr-detail:not(:has(>.inv-cr-gem)){display:flex;flex-direction:column;justify-content:center;padding-left:140px;}
#invPanel .inv-cr-detail:not(:has(>.inv-cr-gem))::before{top:50%;transform:translateY(-50%);height:110px;opacity:.3;}
#invPanel .inv-cr-targets{grid-column:3;grid-row:1/6;border-left:1px solid #74634766;padding-left:14px;display:flex;flex-direction:column;align-self:stretch;gap:5px;min-height:0;overflow-y:auto;scrollbar-width:thin;}
#invPanel .inv-cr-targets>.inv-cr-note{margin:0 0 5px;color:#c0b08e;font-size:10px;}
#invPanel .inv-cr-attach{position:relative;text-align:left;padding:7px 10px 7px 29px;min-height:32px;flex-shrink:0;font-size:11px;color:#d8c7a4;}
#invPanel .inv-cr-attach::before{content:'';position:absolute;left:10px;top:50%;width:7px;height:7px;border:1px solid #b69b62;transform:translateY(-50%) rotate(45deg);box-shadow:inset 0 0 0 2px #111;}
#invPanel .inv-cr-attach:hover{border-color:#c5a771;color:#ffebc2;filter:brightness(1.12);}
#invPanel .inv-cr-empty{grid-column:1/-1;align-self:center;text-align:center;color:#a99e8e;font:13px/1.8 'Noto Serif KR',serif;padding:25px 10px;}
#invPanel .inv-cr-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-top:10px;margin-top:10px;border-top:1px solid #60503b66;flex-shrink:0;}
#invPanel .inv-cr-footer>.inv-cr-note{font-size:10px;color:#857f70;}
#invPanel .inv-cr-dust{position:relative;padding:3px 0 3px 19px;color:#ccba93;}
#invPanel .inv-cr-dust::before{content:'';position:absolute;left:0;top:50%;width:10px;height:10px;transform:translateY(-50%) rotate(45deg);border:1px solid #988564;background:radial-gradient(#c3b7a6 1px,transparent 1.5px) 0 0/3px 3px,#50475c;box-shadow:0 1px 4px #000;}
@media(max-height:760px) and (min-width:641px){#invPanel .inv-cr-body{grid-template-rows:minmax(120px,1fr) 178px;gap:10px;}#invPanel .inv-cr-detail{padding:12px 16px;}#invPanel .inv-cr-grid{grid-auto-rows:80px;}#invPanel .inv-cr-footer{margin-top:7px;padding-top:7px;}}
@media(max-width:640px){#invPanel.panel[data-inventory-page=crystals] .pbox #invCrystalsPanel{padding:12px 10px 10px;}#invPanel .inv-cr-body{grid-template-rows:minmax(140px,1fr) 230px;gap:12px;}#invPanel .inv-cr-grid{grid-template-columns:repeat(auto-fill,minmax(61px,1fr));grid-auto-rows:80px;gap:4px;padding:5px;}#invPanel .inv-cr-detail{grid-template-columns:58px minmax(0,1fr) 130px;column-gap:10px;padding:12px;}#invPanel .inv-cr-detail::before{width:65px;left:8px;background-size:85px;}#invPanel .inv-cr-detail>.inv-cr-gem{width:44px;height:54px;}#invPanel .inv-cr-targets{padding-left:9px;}#invPanel .inv-cr-heading{font-size:15px;letter-spacing:.01em;}#invPanel .inv-cr-name{font-size:15px;}#invPanel .inv-cr-filter{padding:6px 12px;}#invPanel .inv-cr-detail:not(:has(>.inv-cr-gem)){padding-left:94px;}#invPanel .inv-cr-footer>.inv-cr-note{max-width:60%;}}
@media(max-width:420px){#invPanel .inv-cr-head{flex-wrap:wrap;gap:4px;padding-bottom:9px;}#invPanel .inv-cr-capacity{font-size:10px;padding:0 6px;}#invPanel .inv-cr-detail{grid-template-columns:48px minmax(0,1fr);grid-template-rows:auto;overflow-y:auto;}#invPanel .inv-cr-targets{grid-column:1/-1;grid-row:6;border-left:0;border-top:1px solid #74634766;padding:8px 0 0;margin-top:7px;overflow:visible;}#invPanel .inv-cr-detail::before{display:none;}#invPanel .inv-cr-detail:not(:has(>.inv-cr-gem)){padding:14px;}#invPanel .inv-cr-gem{width:36px;height:45px;}#invPanel .inv-cr-footer{flex-wrap:wrap;gap:3px;}#invPanel .inv-cr-footer>.inv-cr-note{max-width:100%;}}
@media(prefers-reduced-motion:reduce){#invPanel :is(.inv-cr-gem,.inv-cr-slot,.inv-cr-filter,.inv-cr-attach){transition:none;}#invPanel .inv-cr-slot:hover .inv-cr-gem{transform:none;}}
```


## 2026-09-27 보석 창 디테일 2차

| 변경 | 적용·검증 |
|---|---|
| 보석 창 | 상단의 넓은 보석 보관 격자와 하단 감정판으로 재배치. 함몰 슬롯·각인 모서리·보석 절단면/반사선·선택 표시 정리 |
| 데이터·조작 | renderInvCrystals/CRYSTAL_BAG/장착/가공/저장 변경 없음. CSS와 로딩 캐시만 변경 |
| 패키지 | build-nwjs.mjs FILES에 inventory-gems.css 추가. 기존 root CSS 누락 검사에서 해당1개 누락 RED → 보완 후 패키징2검사 PASS |
| 브라우저 | 실제 UI 함수/CSS를 사용하는 저장 IO 없는 fixture: 선택/필터/수량/마우스·키보드 장착/4탭 왕복/KO·EN/빈 목록 PASS. 1280×900,1280×720,520×800,390×844,1920×1080 캡처; 가로 넘침 없음, pageerror0 |
| 범위 | 전체 게임 진행·새 NW.js EXE 빌드는 이번 검수에 포함하지 않음. 에셋 생성 없음 |
| 규격 SSOT | docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md 보석 화면 스타일 규격. 백업 tmp/gems-polish-backup, 캡처 tmp/inventory-gems-qa |


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
| 캐시 | game.html/game-easy-test.html: ui-refinement.css?v=20260927-bone-withdraw |
| 불변 | 실제 4부위 해금 조건, 등급·티어 저장, 상위 r+t 등록, 전대 전투 수치, 재입력 회수 |
| 제작 | Higgsfield GPT Image 2.5(gpt_image_2_5),quality high,resolution1k,aspect1:1. 잔액1111.25 확인 후 2건 생성, GPT API 폴백 없음 |
| 작업 ID | 제단9ceb151d-45d5-476e-83ec-3a13c63e6b25 / 슬롯fa8121e1-87f3-4623-89c1-2edcd900e15e |
| 최종 화면 검증 | 1440×1080 실화면·390×844 좁은 화면 시각 확인. 1280×720/390×844 슬롯 겹침0·가로넘침0. 수집0→4 해금,상위갱신/하위거부,DOM 유지 확인. pageerror0. tmp/ossuary_altar_complete.png·ossuary_altar_390.png |


## 2026-09-27 유골함 가방·컬렉션 반반 구성

| 항목 | 현행 계약 |
|---|---|
| 배치 | 유골함 탭 창 폭 min(980px,100vw−24px),높이 min(680px,94vh). 좌측 가방/우측 컬렉션 동등한 1fr씩,간격10px. 제단 최대폭380px/높이284px,원환274×274px. 중앙90×100px,부위88×88px. 두개골(50%,16%),팔(18%,50%),몸통(82%,50%),다리(50%,84%). 유골함 그림58×66px,부위38×38px |
| 반응형 | 폭899px 이하 가방 위/컬렉션 아래,행240px/minmax(440px,1fr),세로 스크롤. 폭560px 이하 부위76×88px,중앙82×100px,팔x15%/몸통x85%,패딩10px 8px. 제단284px/원환274px/그림 크기 유지 |
| 정보 밀도 | 큰 제단 영역을 축소. 부위명·그림·등급은 슬롯에 유지,선택한 부위의 티어·위력·성장 효과는 하단 상세1곳. 상세 최소높이42px,패딩8px 10px |
| 재질 | 기존 제단·슬롯 아트 재사용. 슬롯 background-size125% 112%,중앙 inset −6px −4px,부위 inset −4px −2px. 등급 보석4×4px/bottom3px. 새로운 생성 에셋 없음 |
| 헤더·여백 | 컬렉션 기본 패딩10px 12px,제목14px(폭560px 이하12px),헤더 padding2px 0 8px. 부위명11px/1.4,footer padding8px 0 6px. 상세·힌트 margin4px 0 |
| 데이터·입력 | DOM·수집·저장·해금·장착·해제·분해 로직 유지. 가방10열·기존 셀 크기 및 내부 스크롤 유지 |
| 적용·캐시 | ui-refinement.css,game.html,game-easy-test.html. ui-refinement.css?v=20260927-bone-withdraw |
| 검증 | 기존 ossuaryCollection 회귀6개 PASS. 저장 API를 차단한 실제 game.html UI에서1440×1080/1280×720/900×720 동등폭·좌우 배치,390×844 상하 배치 확인. 노드 겹침0·페이지 가로넘침0·pageerror0. 전환 연출을 QA 전용 CSS로 숨겨 검수했으며 게임 시작부터의 전체 흐름은 검증하지 않음. 캡처 tmp/ossuary_split_1440.png, tmp/ossuary_split_390.png |


## 2026-09-27 보관함 좌우 반반 구성

| 항목 | 현행 계약 |
|---|---|
| 범위 | 인벤토리 내부 보관함 탭(data-inventory-page=storage). 별도 storagePanel은 그대로 유지 |
| 창 | 폭 min(980px,100vw−24px),높이 min(680px,94vh),유골함 탭과 동일 |
| 좌우 | 왼쪽 invCenter 가방,오른쪽 invStorageCol 보관함. repeat(2,minmax(0,1fr)),간격10px,1행 minmax(0,1fr) |
| 보관 조작 | invStBagSection을 보관함 탭 진입 시 invCenter 아래로 이동. 다른 탭은 invStorageCol로 복귀. 같은 DOM 노드를 append해 핸들러 보존. 목록 클릭 보관·창고 슬롯 클릭/우클릭 꺼내기 유지 |
| 창고 슬롯 | 기본6열,간격6px,폭100%/높이auto/aspect-ratio1. 패딩10px 12px. 아이템 그림 _itemSkin(item,34),빈 반환 시 _itemIco 폴백. 이름 title,등급점3×3px/좌상단3px. 기존 아트 로딩 폴백 경로 유지 |
| 가방 하단 | 보관 목록 margin-top8px. 제목12px/1.5,padding8px 0. 목록 최대높이112px,행 최소30px/padding4px 6px,아이템명12px/보관11px |
| 보관함 정보 | invStHeader 12px/1.5,margin8px 0 12px. 용량·저장·정렬·필터·접기·펼치기 기존 로직 유지 |
| 좁은 화면 | 폭899px 이하 가방 위/보관함 아래,행360px/minmax(280px,1fr),세로 스크롤. 폭560px 이하 보관함5열 |
| 적용 | ui-refinement.css 캐시20260927-bone-withdraw/ui-panels.js 캐시20260927-storage-split. game.html/game-easy-test.html 공통 |
| 검증 | uiPanelInitialization 회귀3개 PASS. 저장 API 차단한 game.html UI에서 보관1회·꺼내기1회·탭 왕복 시 노드 동일성 PASS.1440×1080/1280×720/900×720 좌우 동등폭,390×844 상하 배치,가로넘침0·슬롯 넘침0·pageerror0. QA에서 전환 연출만 숨김,게임 시작 전체 흐름은 검증 범위 밖 |
| 화면 | tmp/storage_split_1280.png,tmp/storage_split_390.png. 원본 백업 tmp/storage-split-backup |


## 2026-09-27 대장간 탭 글자 중앙 정렬

| 항목 | 현행 계약 |
|---|---|
| 대상 | 강화(upgrade)·물약(potion)·분해(salvage)·리롤(reroll)·결정(crystal)·제작(craft),fg-tab-v4 내부 fg-tab-txt |
| 원인·수정 | 예전 이미지 버튼의 아이콘 자리 margin-left:55%가 텍스트를 오른쪽으로 밀었음. renderForge의 라벨 인라인 스타일을 margin:0;text-align:center로 수정. 기존 버튼 중앙 배치 사용 |
| 유지 | 탭 크기·위치·재질·활성 표시·텍스트·기능·비용·저장 불변. CSS 추가 없음 |
| 파일 | game.html/game-easy-test.html 동일 변경 |
| 검증 | 저장 API 차단·전환 연출만 숨긴 game.html UI.1440×1080/1280×720/1024×768/390×844에서6개 라벨 중심과 버튼 중심의 가로 오차0px,영역 이탈0.6탭 클릭 전환 PASS,pageerror0. 수정 전1280px +52.8px,1024px +76.63px,390px +21.81px 쏠림 재현 |
| 캡처 | tmp/forge_alignment_after_1280.png. 게임 시작 전체 경로·실제 강화/제작 비용 소비는 검증 범위 밖 |


## 2026-09-27 등록 유골 해제·가방 반환

| 항목 | 현행 계약 |
|---|---|
| 함수 | withdrawBonePart(ancIdx,part). 유효 전대·skull/torso/arms/legs 및 현재 등록 확인. 성공true/실패false |
| 조작 | 부위 우클릭 즉시 해제 또는 부위 선택→선택 유골 해제(.oss-withdraw). 중앙 유골함은 기존 우클릭과 유골함 해제(.oss-unequip) 버튼 모두 지원 |
| 반환 | mkBonePart(ancIdx,part,record.t,record.r),기존 등급r/티어t/전대/부위 유지. 도감은 원래{r,t}만 보관하므로 반환 itemLv=0으로 고정하여 현재 캐릭터 레벨로 상승시키지 않음. 신규 ID,1×1 칸 |
| 원자적 이동 | BAG_MAX 및 _invFindSpace(1,1,신규가방index) 검사. 임시push 후 공간이 없으면pop하고 등록 유지. 공간 성공 시 _gx/_gy 지정→등록 키 delete→가방 아이템 선택→호버 제거→dbSaveForce→renderInv→이동 안내 |
| 중복 방지 | 해제 후 등록 키가 없어져 연속 호출은false. 가방 개수 또는 실제 칸이 부족하면 저장·등록·아이템 수 불변 |
| 소환 | 한 부위 해제 시4/4 미완성으로 새 소환 잠금. 반환 아이템 도감 재등록 가능. 이미 소환된 전대의 HP·회수·생존 규칙은 변경하지 않음 |
| 유골함 | 기존 unequipItem('ossuary') 재사용.2×2 공간 필요,등급/강화/결정 유지. 새 버튼도 기존 우클릭 핸들러 공유 |
| DOM·가용성 | 최초1회 .oss-actions와 실제button2개 추가,기존 자식 유지. 등록된 선택 부위가 없으면 유골 해제 disabled,유골함 미장착이면 유골함 해제 disabled. 키보드 버튼 실행 지원,KO/EN _L 안내 |
| 스타일 | actions flex/중앙/gap8px/wrap/margin-top6px/flex-shrink0. 버튼 최소높이30px,padding5px 10px,border1px #756044,배경#181513,글자#dfcda5,11px/1.5. disabled opacity.45 |
| 세이브 | INV.ossCollect 기존{ancId_part:{r,t}} 구조 유지. 해제 시 해당 키 삭제와 INV.bag 반환 아이템을 함께 dbSaveForce. 마이그레이션 없음 |
| 적용 | game.html/game-easy-test.html/ui-refinement.css. CSS 캐시20260927-bone-withdraw |
| 검증 | 신규 ossuaryWithdrawal6개+기존 ossuaryCollection6개=12 PASS. 브라우저 버튼 해제·우클릭·재등록·유골함 버튼 해제·1280/390px 조작부 스크롤 접근 PASS,pageerror0. 저장API 차단/전환연출 숨김,실사용 저장파일 수정 없음. tmp/bone_withdrawal_1280.png |
