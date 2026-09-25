# UI 구성 개편 — 2026-09-25

## 적용 기준

사용자가 제공한 Diablo IV와 POE2 실제 화면을 참고했다. 공통점은 제목/분류/본문/행동의 구획, 일정한 행·슬롯 정렬, 저대비 재질, 얇은 금속 마감, 중요도에 따른 강조다. 패널 폭을 모두 30%로 고정하지 않는다. 외부 게임 이미지는 런타임에 복제하지 않았다.

2026-09-24 전체화면 Hell Gothic은 이전 구현이다. 이번 구현은 ui-foundation.css 뒤의 ui-refinement.css와 ui-panels.js가 담당한다. 튜토리얼·로비는 기존 foundation 계약 유지. 사용자는 구성이 정리됐다고 평가하고 디테일 마감을 계속 지시했다.

## 레이아웃 계약

| 항목 | 현재 구현 |
|---|---|
| 연결 | game.html/game-easy-test.html: ui-refinement.css?v=20260925-19, defer ui-panels.js?v=20260925-1. index.html은 CSS만. NW.js 두 파일 복사 |
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
| 탭 | 장비/유골함/보관함. 기존 invOssuaryPanel/invStorageCol은 동일한 상단 영역에서 교체, 가방은 유지 |
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
| 슬롯 | 5열, gap3px, padding5px, 3px double 틀. 창고 최소30칸/가방 최소10칸을 시각적으로 표시하며 초과 시 5칸 단위 행 추가. 빈칸은 비대화형 장식, 실제 용량 STORAGE_MAX=200 유지 |
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
| 캐시 | ui-refinement.css?v=20260925-19, 게임 두 HTML 및 로비 동기화 |

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
| 좁은 화면 | 폭560px 이하 패널padding30px22px24px, 프레임48px. 원본 투명 합성, 배경실패 시 제목 텍스트/기본 판 유지 |
| 기록 | img/ui/blackiron/prompts.md에 두 프롬프트 전문·생성ID·투명도 기록. 신규 픽셀 후처리 없음. img 폴더는 기존 NW.js 패키징 대상 |
| 버전 | ui-refinement.css?v=20260925-19 |

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
| 적용 | ui-refinement.css?v=20260925-19, game.html/game-easy-test.html/index.html 동기화. DOM·게임 수치 변경 없음 |

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
| 버전 | ui-refinement.css?v=20260925-19 |

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
| 통합·버전 | ui-refinement.css Inventory finish 블록 하나로 최근3개 마감 블록 대체. ui-refinement.css?v=20260925-19. 신규 에셋 생성 없음 |

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
| 버전 | ui-refinement.css?v=20260925-19, game.html/game-easy-test.html/index.html 동기화 |
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
| 버전 | ui-refinement.css?v=20260925-19 |

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
| 버전 | ui-refinement.css?v=20260925-19. game.html/game-easy-test.html/index.html 및 관련 문서 동기화 |

설정 전용 후속 스타일은 Settings plates 블록 하나로 교체한다. 새 가죽판 생성본은 미채택 작업물이며 런타임 참조 없음. 자동 테스트 추가·실행 없음.
