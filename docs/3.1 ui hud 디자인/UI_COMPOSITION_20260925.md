# UI 구성 개편 — 2026-09-25

## 적용 기준

사용자가 제공한 Diablo IV와 POE2 실제 화면을 참고했다. 공통점은 제목/분류/본문/행동의 구획, 일정한 행·슬롯 정렬, 저대비 재질, 얇은 금속 마감, 중요도에 따른 강조다. 패널 폭을 모두 30%로 고정하지 않는다. 외부 게임 이미지는 런타임에 복제하지 않았다.

2026-09-24 전체화면 Hell Gothic은 이전 구현이다. 이번 구현은 ui-foundation.css 뒤의 ui-refinement.css와 ui-panels.js가 담당한다. 튜토리얼·로비는 기존 foundation 계약 유지. 사용자는 구성이 정리됐다고 평가하고 디테일 마감을 계속 지시했다.

## 레이아웃 계약

| 항목 | 현재 구현 |
|---|---|
| 연결 | game.html/game-easy-test.html: ui-refinement.css?v=20260925-4, defer ui-panels.js?v=20260925-1. index.html은 CSS만. NW.js 두 파일 복사 |
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
