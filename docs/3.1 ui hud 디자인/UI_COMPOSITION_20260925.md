# UI 구성 개편 — 2026-09-25

> 2026-09-28 현행: **선대 소환체 · 묘왕 바르칸**, “플레이어가 소환하는 선대의 영체”. 오른쪽 데모 저장 카드는 “플레이어 기록”. 투명48프레임 v2 스프라이트(셀384×624, 8×6, 12fps/4초)와 바닥·구조물을 고정한 독립 배경 영상(v2, 1920×1088, 24fps/12.083333초)을 사용한다. 이전 정적 원화와 v1 전체 신체 영상은 제작 이력이다. [생성·안정화·검수](<../5.0애니메이션파이프라인/LOBBY_VARKAN_SPRITE_VIDEO_20260928.md>).


## 2026-09-28 장착 가능한 보석 선택창 — 현행

빈 홈을 클릭한 보석 팝업은 호환되는 보유 보석만 고유 원화·성급·이름·옵션 카드로 표시한다. 헤더의 부위명·`호환 n / 보유 n`, 각 분류·성급의 후보 수로 왜 일부만 보이는지 알려준다. 필터는 어두운 금속 버튼과 금색 선택 상태를 사용한다. 빈 결과는 홈 문양·원인 설명·가능할 때 전체 후보로 복귀하는 버튼을 표시한다. 기존 결정 주머니 명칭과 가루 수치는 이 팝업에서 제거했다. `ui-refinement.css?v=20260928-storage-icon-gem-picker2`와 [보석함 상세 계약](GEM_ATELIER_20260927.md)을 따른다.

## 2026-09-27 전투 스킬 전체화면 작업공간 — 현행

| 항목 | 현행 규격 |
|---|---|
| 창 | `#skillPanel .skill-pbox` 폭 `100vw−16px`, 높이 `100dvh−16px`, 사방 여백 8px. `skill-workspace.css?v=20260927-fullscreen4`가 기존 1020px 폭 제한을 덮는다 |
| 본문 | `#skillInfo`는 전폭 자원 행. 그 아래 왼쪽은 스킬 목록, 오른쪽은 `#skillDetail` 스킬/합체 정보판. 오른쪽 폭 `clamp(300px,25vw,420px)`, 왼쪽은 나머지 폭. 두 칸은 각각 독립 스크롤 |
| 스킬 목록 | 폭 1100px 초과에서 카테고리 3열, 이하 2열. 선택한 스킬의 카테고리는 그리드 전폭으로 넓혀 상세 수치를 읽는다. 추천 합체 경로는 넓은 화면에서 2열 |
| 합체 정보판 | 선택 전에는 합체 도감 32종을 합체 가능→완성→기타 순으로 표시한다. 스킬 선택 후에는 해당 스킬 설명과 연결된 합체식만 표시한다. 재료 버튼은 해당 스킬의 공격/방어/특수 탭과 상세 카드로 이동한다. 습득 재료는 채운 마름모로 구별한다 |
| 작은 화면 | 폭 760px 이하에는 목록 위·정보판 아래의 1열. 높이 620px 이하에는 본문 높이 390px와 창 자체 스크롤을 적용해 제목·슬롯바가 본문을 완전히 가리지 않게 한다 |
| 조작 보존 | 기존 습득·강화·합체·추천·슬롯 할당 로직은 유지. 정보판은 현재 `P.skills`와 `_FUSE_GEM_GROUPS`를 읽어 표시만 한다. `game.html`에서 패널 노드와 렌더 함수를 추가했고 패키징 목록 `build-nwjs.mjs`에 CSS를 포함한다 |

## 2026-09-27 보석함 장비 스킨 최신 기준

보석함 장비칸은 정사각형 원화에 맞춘 1:1 카드다. `_itemSkin(item,96)` 이미지는 카드 안쪽1px를 `object-fit:contain`으로 채우며 강제 확대와 크롭을 쓰지 않는다. 17부위는 큰 화면에서 5열×6행, 폭 700px 이하 4열, 480px 이하 3열로 배치한다. 검은 빈 홈과 장착 홈은 그림 위 하단에 겹쳐 둔다. 홈 버튼은 아이콘보다 높은 계층이며 아이콘은 `pointer-events:none`이다. 현행 CSS 캐시는 `inventory-gems-finish.css?v=20260927-square-art2`. 다음 절의 이전 크기·캐시 값과 충돌하면 [보석함 상세 계약](GEM_ATELIER_20260927.md)과 이 절을 따른다.

## 2026-09-27 보석함 중앙 장비 배치판 — 이전 단계 기록

> 보석 시각 자산은 `assets/gems/cursed_relics_1.svg`·`cursed_relics_2.svg`이고 당시 CSS 캐시는 `inventory-gems-finish.css?v=20260927-gem-only1`이었다. 18개 저주 유물을 보석함·감정판·장착 홈·대장간에 공유한다. 빈 홈은 검은 홀, 장착 홈은 보석 아트로 구별한다. 호환 부위 중 빈 홈이 있는 카드만 `ready`와 보석색 홈 링으로 강조하고, 호환되지만 꽉 찬 카드는 `full`로 구별한다. 현재 호환 빈 홈 합계는 장비판 안내에 표시한다. 채워진 홈 hover/focus는 해당 장착 보석을 감정판에 미리 보여주며 떠나면 선택 보석으로 돌아간다. 보유 보석은 좌클릭 홀드로 선택·호환 빈 홈 강조, 6px 이상 이동하면 보석 그림만 칸에서 뽑혀 커서를 따라가고 빈 홈에 놓아 장착한다. 비활성 패널 자식은 포인터 입력을 받지 않는다. [감정판·장비판 세부 계약](GEM_ATELIER_20260927.md)을 우선한다.

이 단계 구현은 [GEM_ATELIER_20260927.md](GEM_ATELIER_20260927.md)를 따른다. 당시 창은 최대1280px·높이 min(860px,96vh), 좌우 .78:1.22였다. 왼쪽 보석/필터/상세, 오른쪽 캐릭터 실루엣과 5열×6행의17부위. 호환 부위 강조·장착 현황 집계·이미지 실패 폴백을 제공한다. 당시 CSS 키는 `inventory-gems-finish.css?v=20260927-atelier2`. 아래 보강 규격은 이전 단계 기록이며 충돌 시 링크 문서가 우선한다. 실제 코드 기반 브라우저 회귀12항목 및 데스크톱/390px 검수 완료.

## 2026-09-27 보석함 디자인 보강 — 이전 단계 기록

`inventory-gems-finish.css?v=20260927-2`를 `inventory-gems.css?v=20260927-jewel-finish` 뒤에 로드한다. 아래 이전 유골함형 규격의 충돌 값은 이 절이 대체한다. 장착 로직·비용·보석 능력치는 변경 없음.

| 항목 | 최종 규격 |
|---|---|
| 창 | 폭 min(1100px,100vw−24px), 높이 min(780px,94vh). 내부 padding16px 18px 10px |
| 헤더 | 보석함 / Gem collection, 제목22px·자간 .14em, 마름모 표식15px. 보유량11px·padding5px 12px |
| 구성 | 좌우1:1.08, 행 minmax(120px,1fr)/154px, 간격12px |
| 보석 격자 | 최소열69px·행91px·간격6px·padding9px. 아이콘34×43px, 이름10px·1줄 말줄임, 수량11px, 성급9px |
| 장비판 | 4열·간격6px·내부스크롤, 카드 최소78px·padding5px 3px 6px·gap2px. 제목11px, 금속 모서리와 내부 테두리 |
| 아이콘 | `_itemSkin(item,38,'#c5b38d')`, 받침48×38px, 실제 이미지/SVG 최대36×32px. `ossuary_socket_hf_v2.png` 프레임 재사용 |
| 배경 원판 | `ossuary_altar_hf_v2.png`, inset48px 20px 20px, opacity .13, saturate .45, pointer-events:none |
| 보석 홈 | 당시 23×23px 원형 금속 홈·간격3px, 장착 보석14×18px. 현행 빈 홈 문자는 숨기고 검은 홀로 표시 |
| 상세 | 열70px/나머지·간격14px·padding14px 16px, 보석43×54px, 이름16px·수치26px. 미선택 문양68×94px |
| 좁은 화면 | ≤640px: 창 내부padding10px, 제목18px, 1열·행240px/154px/minmax(470px,auto), 장비3열, 보석 최소열62px |
| 이미지 | 기존 유골함·게임 표면 리소스 재사용. 신규 이미지 생성 없음. 배경 이미지 누락 시 CSS 바탕·테두리와 부위명/홈 유지 |
| 검증 | 디스크 함수로 격리 장착 회귀 9항목 통과, 브라우저 화면에서 이미지 로드 후 확인. Git/CLI는 기존 터미널 장애로 미실행 |

## 2026-09-27 유골함형 보석함 — 현행 레이아웃

사용자 최신 확정: 보석함을 유골함처럼 좌우로 정리하고 전체 장비 부위에 보석을 끼운다. 아래 최초 보석 스타일 표와 CSS 스냅샷은 이전 기록이며 충돌 시 이 절과 `inventory-gems.css` 하단 규칙이 우선한다.

| 항목 | 현행 값 / 동작 |
|---|---|
| 창 | 폭 `min(980px,100vw - 24px)`, 높이 `min(680px,94vh)`; 유골함과 동일 |
| 보드 | 동일 폭 2열, 행 `minmax(100px,1fr) 140px`, 간격10px. 왼쪽 보석/상세, 오른쪽 장비판은 두 행 전체 사용 |
| 장비판 | 17부위, 4열, 간격4px, 내부 스크롤. 미장착도 표시하고 실제 장비 홈만 조작 |
| 부위 카드 | padding2px, 제목10px, 아이콘 높이18px·최대폭26px, 아이템 이름 tooltip. 기존 `_itemSkin(item,28,'#c5b38d')` 재사용 |
| 소켓 | 18×18px, 간격2px, 빈 홈◇ / 장착 보석12×15px. 비호환 disabled opacity .24, 키보드 focus 2px |
| 보유 격자 | 최소열54px, 행58px, 간격3px, 보석29×36px, 수량12px |
| 상세 | 높이140px, 열58px/나머지, 간격10px, padding10px 12px, 보석36×45px, 이름14px, 수치21px. 기존 별도 홈 목록은 숨기고 오른쪽 장비판에서 조작 |
| 외관 | 유골함과 같은 어두운 표면·금속 구분선, 제목14px. 기존 이미지·테두리 사용, 신규 이미지 생성 없음 |
| 폭≤640 | 1열, 행200px/140px/minmax(370px,auto), 내부스크롤. 장비판은 세 번째 행 |
| 파일 | `game.html`의 `renderInvCrystals`; CSS 키 `20260927-equipment-board` |
| 검증 | 격리 DOM 장착·탈착·17부위·지연 콜백 등 9항목 통과. 실제 화면과 분리한 브라우저 사본으로 배치 검수. CLI/Git 검증은 터미널 장애로 미실행 |

## 2026-09-27 조작 키캡 마감

| 대상 | 현행 값 |
|---|---|
| #settings.panel .pbox #keyBindList .set-key | 선1px #76634b/아래3px #40362b, radius2px, linear-gradient(#35302bd9,#171518eb) + menu-plate center/100% 100% no-repeat, shadow inset 0 1px #c7b18b30와 0 2px 3px #0008, 글자#dfd0b4, 자간.04em, overflow-wrap:anywhere |
| 호버 | 선#b79a6a, 글자#f8e8c7 |
| 입력 대기 행 | .set-row:has(.listening), 배경 linear-gradient(90deg,#8e69332e,#46332116), inset 3px 0 #bb965e |
| 입력 대기 키 | animation:none/opacity1, 배경 linear-gradient(#614a2cd9,#281c13ed), 선#cbaa6e, shadow inset 0 1px #ffe1a34d와 0 0 12px #ae7c3226, 글자#fff0ca. 기존 outline2px #b7945e/offset1px 유지 |
| 동작 이름 | .set-name overflow-wrap:anywhere |

기존 키 저장·재지정·보조키 삭제 동작 유지. 이전 녹색 배경·4px 테두리는 위 스타일로 대체. 신규 에셋과 자동 테스트 없음. Chrome 1920×960에서 기본·보조 키캡의 금속 재질과 정렬을 확인했다. 실제 키 재지정과 대기 상태의 화면 검수는 수행하지 않았다.

비교창 조사: 현재 game.html의 renderInv는 invCompareArea와 invCompareFloat를 숨기며 비교창 내용을 생성하는 경로가 없다. 따라서 비교창 스타일은 잔존 스타일이며 실제 비교 UX 검수 완료로 취급하지 않는다.

## 2026-09-27 아이템 상세 원장 마감

| 대상 | 최신 규칙 |
|---|---|
| ui-item-source:not(:empty) | align-self:flex-start, padding3px 7px, 선1px #75624766, 배경#32271966. letter-spacing은 기존 !important .04em 유지 |
| 기본 수치 행 | id-stats 직계 div 중 직계 span 있고 직계 div 없으며 style에 margin 없는 행. padding3px 6px/min-height24px/border-box/아래선1px #8c765414 |
| 수치 행 교차 배경 | 해당 행 nth-child(even)에 linear-gradient(90deg,#9b80500d,#9b80501a) |
| 수치 span | weight600, overflow-wrap:anywhere. 기존 우측 수치 정렬 유지 |
| 특수 옵션 묶음 | id-stats 직계 div 중 직계 div 포함. padding8px!important/margin-top8px!important/위선1px #75624766!important/배경 linear-gradient(90deg,#51402b22,transparent)/overflow-wrap:anywhere |
| 옵션 내부 행 | 직계 div+div margin-top4px |
| 비교 헤더 | letter-spacing .04em/overflow-wrap:anywhere |

CSS 시각 마감만 적용. 하단 고정 액션 줄은 기존 한 줄·가로스크롤 계약 유지. 신규 이미지·데이터 변경·자동 테스트 없음. 이전 동일 항목은 위 규칙으로 대체한다. Chrome 1920×960에서 녹슨 단검의 장착 출처 배지·교차 수치 행·특수 옵션 배경을 확인했다. 비교창과 전체 언어 검수는 별도 미완료.


## 2026-09-27 가방 도구줄 디테일

| 대상 | 현행 스타일 |
|---|---|
| inventory-filters summary | border-box, 최소32px, flex 중앙 정렬, gap9px, padding5px 10px, list-style:none, 선1px #514638, 배경 linear-gradient(90deg,#41322250,#14111588), 글자#c3b59b, pointer |
| 펼침 화살표 | 기본 marker 숨김. before 빈 문자열, 6×6px/flex 0 0 6px, 오른쪽·아래1px #c0a373, 닫힘 rotate(-45deg)/열림 rotate(45deg) |
| 열림 | 글자#ecd7ad, 선#8b704a, 배경 linear-gradient(90deg,#68502d55,#171216aa) |
| 호버/키보드 초점 | 호버 선#b2986b/글자#f0dfbd. focus-visible outline2px #ead1a0/offset−3px |
| 가방 숫자 | invCount #f0dfbd/weight700, invMax #a99d87 |
| invExpand | padding0 8px, 왼쪽선1px #75624766, 글자#b8aa91, nowrap, 500 11px/1.5 Noto Sans KR/sans-serif. 직계 span은 color#b8aa91!important/font:inherit!important로 기존 최대 표기 대비 보정 |
| invSortBtn 호버 | 글자#f0dfbd!important, inset 0 −1px #ba9a64 |

CSS만 변경. 기존 필터·정렬·용량 동작과 DOM 보존. 새 에셋·애니메이션 없음. 정확한 적용 선택자는 ui-refinement.css의 inventory-filters 구간이며 위 규칙은 앞선 동일 항목을 대체한다. Chrome 1920×960 화면에서 펼친 필터와 가방 배치 확인, Enter 키로 접기 확인. 자동 테스트 추가 없음.


## 2026-09-27 최초 장비 탭 초기화 안전성

| 대상 | 현재 계약 |
|---|---|
| ui-panels.js inventory | 최초 inventoryPage 미설정 시 기본 equipment 탭과 aria-selected/aria-hidden만 설정. 플레이어 생성 전 _invChangeCategory/renderInv 호출 없음 |
| 실제 탭 전환 | 기존 inventoryPage가 정의되어 있고 새 key와 다를 때만 _invChangeCategory 호출. 같은 탭 재선택은 재렌더하지 않음 |
| 검증 | test/uiPanelInitialization.test.js 2개 통과. 수정 전 동일 초기화 오류 재현. 브라우저 게임 시작, 설정→인벤토리→유골함 전환 확인 |
| 범위 | UI 초기화만 변경. 장비 수치·분해·보관·세이브 형식 변경 없음 |

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


현재 공통 프레임·제목 및 독립 창고 선택/이동 UI는 `UI_COMPOSITION_20260925.md`의 **2026-09-25 조각 프레임·창고 슬롯 개편 절**을 따른다. 이전 중복 수치는 해당 최신 표로 대체한다.

아이템 아트 폴백 중복 표시 방지: `.vault-art .iskin:has(img)`는 font-size:0, 직계 SVG visibility:hidden. 이미지가 실패하여 제거되면 기본 글리프가 다시 표시된다.


## 2026-09-25 금속 마감 보강

이 절은 앞선 제목판·본문 프레임·키캡 표현의 최신 규칙이다.

| 항목 | 구현 |
|---|---|
| 외곽 | 320px iron 반복, 좌우 밝은 금속 띠와 내부 음영. 안쪽 3/5/8/11px 단계의 턱, 외부0 16px 48px 그림자 |
| 제목판 | 중앙판 좌우19%, top70/bottom3px, border9px. 황동 #44321b→#94733e→#654b29→#34271a, soft-light 재질 합성. 글자#f7e7bb. 높이760px 이하 top40px |
| 설정 본문 | 9px #3c4137 틀, border-image 없음, margin6px 5px 0/padding14px. 안쪽 outline#8a7754 offset−5px, 금속 안쪽 선과 음영 |
| 구획 제목 | 16px, 배경 제거, 오른쪽으로 이어지는 금속 구분선, padding4px 2px 12px |
| 키 설정 행 | grid minmax(130px,1.3fr)/minmax(80px,1fr)/minmax(68px,.8fr)/20px. 간격8px, 최소48px, padding5px 3px. 이름13px/행간1.5, 홀수행 옅은 배경 |
| 키캡 | 폭100%, 최소36px, padding3px 5px, 글자12px. 현행 재질·테두리·대기 상태는 2026-09-27 조작 키캡 마감 표 참조. 기존 입력 로직 유지 |
| 작은 화면 | 폭560px 이하 행 열85px/58px/52px 최소+삭제16px, gap4px. 이름12px. 설정 본문 padding8px/좌우margin0 |
| 창고 | 헤더와 상세 배경의 금속 명도 보강. 선택/이동/용량 계약은 이전 절 유지 |
| 에셋 | 기존 iron/frame/crest 재사용, 신규 생성 없음. 제목판 CSS 기본색은 이미지 실패 시에도 유지 |

코드 변경은 CSS와 캐시 버전(20260925-7)만. 자동 테스트 추가·실행 없음.

최신 제목판·설정 본문 틀·키 설정 정렬/키캡 규칙은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 금속 마감 보강 절**을 따른다.


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

최신 제목판·설정 본문 틀·키 설정 정렬/키캡 규칙은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 테두리 중첩 수정 절**을 따른다.


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
| 좁은 화면 | 폭899px 이하 가방 위/컬렉션 아래,행max-content/minmax(440px,1fr),가방최소260px·격자140px,세로 스크롤. 폭560px 이하 부위76×88px,중앙82×100px,팔x15%/몸통x85%,패딩10px 8px. 제단284px/원환274px/그림 크기 유지 |
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
| 입력상태 | 키입력대기outline2px#b7945e/글자#fff0ca, 대기 행·재질은 2026-09-27 조작 키캡 마감 표 참조. 위험 버튼 글자#d9a08c. 가짜 키 리벳::before 제거 |
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
| 로비·캐릭터 정보창과 게임 메뉴의 단절 | 같은 숯색 철판/흐린 문양/적갈색 선택을 적용. 로비 구분영역에 기존 EXODUSER 로고 이미지를 중앙 배치(2026-09-27) |
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
.lobby-right{isolation:isolate;background:transparent!important;border:0!important;box-shadow:none!important;padding:28px 30px 24px;}
.lobby-right::before{content:"";position:absolute;inset:22px;background:linear-gradient(#141315de,#09090af2),var(--menu-sigil) center -90px/620px 620px no-repeat,var(--ui-surface) center/320px;clip-path:polygon(12px 0,calc(100% - 12px) 0,100% 12px,100% calc(100% - 12px),calc(100% - 12px) 100%,12px 100%,0 calc(100% - 12px),0 12px);pointer-events:none;z-index:-1;}
.lobby-right::after{inset:0;border-width:48px;border-image-width:48px;}
.lobby-right .lobby-divider{height:120px!important;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:none!important;opacity:1!important;mix-blend-mode:normal!important;}
.lobby-right .lobby-header{justify-content:flex-end;min-height:48px;}
.lobby-right .lobby-brand-logo{display:block;height:100%;max-height:100%;max-width:100%;width:auto;object-fit:contain;}
.lobby-right :is(.char-item,.char-item-new){border-radius:0!important;background:linear-gradient(#211c1cdc,#101013ef),var(--ui-surface) center/320px!important;}
.lobby-right .char-item.active{background:linear-gradient(90deg,#4b251cdd,#171215eb),var(--ui-surface) center/320px!important;border-color:#ac7953!important;box-shadow:inset 3px 0 #ac7953!important;}
.cs-frame-box{background:linear-gradient(#171417eb,#0b0b0df5),var(--menu-sigil) center/420px 420px no-repeat!important;border-color:#66553e!important;border-radius:0!important;}
.cs-frame-box .cs-right-title{color:#e4d5b8!important;letter-spacing:.06em!important;}
@media(max-height:800px){
 :is(#settings,#forge,#skillPanel,#storagePanel).panel .pbox .ptitle{height:118px!important;min-height:118px!important;padding:68px 8px 18px!important;font-size:20px!important;}
 :is(#settings,#forge,#skillPanel,#storagePanel).panel .pbox .ptitle::before{width:270px!important;height:118px!important;background-size:270px 270px!important;background-position:center -67px!important;}
 .lobby-right .lobby-divider{height:80px!important;}
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
| 높이 배분 | 장비 탭 inv-wrap 첫 행270px, 가방 행 minmax(min-content,1fr). invCenter height:auto/min-height260px,invGrid height140px/flex1 1 140px. 필터 높이를 반영하며 나머지 높이는 가방에 배정. 작은 화면은 기존 바깥 세로 스크롤 사용 |
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
| 전환 | 초기 UI 구성은 기본 equipment 탭과 접근성 상태만 설정한다. inventoryPage가 이미 정의되고 새 탭과 다를 때만 _invChangeCategory 호출: INV.selected=null, _invHover=-1, 분해 선택 clear, invFilter의 slot/rarity/el=null. renderInv 후 정보창 숨김. 같은 탭 재선택은 재렌더하지 않음 |
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
| 버전·적용 | game.html 및 game-easy-test.html, ui-refinement.css?v=20260927-bone-hover-flow |
| 검증 | test/ossuaryCollection.test.js 6개 PASS(미수집 차단/혼합등급 완성/기존 저장 보존). 격리 브라우저 0→4 수집·하위거부·상위갱신·DOM 보존·유골함 해제 확인. 1440×1080 캡처,1280×720·390×844 슬롯 겹침/가로 넘침 없음, pageerror 0 |

실제 유골 수집 기록이 없는 구세이브는 잠금 상태로 표시된다. 임시 우회로 소환하던 기록을 유골 수집으로 만들어 주지 않으며 기존 아이템·도감 저장값을 삭제하거나 이관하지 않는다.

### 2026-09-28 유골함 전대 초상 세 번째 칸 (현행)

사용자 최신 확정: 넓은 화면의 유골함 탭은 가방/정보, 유골 제단, 해당 전대 초상을 가로 3칸으로 쓴다. 위 2칸·980px 규격은 이전 기록이며 이 절이 대체한다. 실제 소환 로스터는 아직 `iron_warlord` 철갑 전대 1종이다.

| 항목 | 현행 계약 |
|---|---|
| 창/열 | 폭 `min(1390px,100vw−24px)`·높이 기존 `min(680px,94vh)`. 화면 폭 1120px 이상에서 열 `minmax(290px,1fr) / minmax(380px,1.18fr) / minmax(290px,.92fr)`; 오른쪽 세 번째 열에 초상 |
| 좁은 화면 | 900~1119px: 왼쪽 가방/정보, 오른쪽 제단 위·초상 아래 스크롤. 899px 이하: 가방 → 제단 → 초상 세로 순서. 다른 인벤토리 탭에서는 초상 숨김 |
| 연결 키 | 신규 유골함 `mkItem('ossuary')`는 `anc:'iron_warlord'`. 구세이브 유골함에 `anc`가 없으면 현행 첫 로스터 철갑 전대로 표시. 선택한 가방 유골함의 `anc`가 있으면 그 전대를 미리보기; 아니면 장착 유골함 또는 첫 가방 유골함 기준. 도감 키는 기존 `iron_warlord_skull/torso/arms/legs` 유지 |
| 초상 이미지 | `ANC_ROSTER[0].portrait = img/vfx_ancestor/iron_warlord_portrait.png`는 Higgsfield GPT Image 2.5 생성본 `hf_20260927_151141_29fba833-6a17-4994-8a22-8640d2669e0c.png`의 로컬 사본(880×1168). 2026-09-28 사용자가 선택한 전사형 시안이다. 로딩 실패 시 `portraitFallback = img/vfx_ancestor/ancestor_iron_warlord_walk_v2.png`의 5번째 셀(index4)로 전환하고, 그것도 실패하면 `전대 형상 없음` 문구를 유지한다 |
| 초상 프레임 | 제단 오른쪽 독립 패널, 안쪽 여백 상하10px/좌우12px. 원화가 로드되면 무대의 `flex-grow`를 0으로 고정하고 폭 100%에 `aspect-ratio:880/1168`을 적용한다. 프레임과 이미지도 같은 크기·`object-fit:contain`으로 묘비 장식부터 발끝까지 잘림 없이 표시한다. 넓은 화면에서 초상 패널은 내용 높이에 맞춰 위쪽 정렬하고, 1119px 이하에서는 초상 grid row를 `auto`로 늘려 정보가 잘리지 않게 한다. 폴백 시트만 기존 프레임 폭 최대310px·시트 폭 `6×100%`·왼쪽 `−4×100%`로 자른다. 이름22px, 수집 막대4px |
| 정보 | 전대 이름, 소환 가능/유골함 장착 필요/수집 중 상태, 수집 n/4 진행도와 간단한 해금 안내. 이미지와 기록은 수집 완료 전에도 보이며 기존 유골/유골함 조작을 가리지 않는다 |
| 갱신/DOM | `renderOssPanel()`이 선택된 전대의 리프 텍스트와 진행 폭, 이미지 경로만 갱신한다. 부모 `textContent`/`innerHTML` 교체 금지. 선택 유골 우클릭·해제는 현재 전대 index로 연결 |
| 적용 | `game.html`, `game-easy-test.html`, `inventory-oss-balance.css?v=20260928-ossuary-fit5`, `img/vfx_ancestor/iron_warlord_portrait.png`. 기존 제단 크기·부위 배치·유골 포인트 공식·세이브 도감 구조 유지 |

전대의 시각 정체성은 **지옥에서 실제로 싸웠던 선대 전사**다. 깨진 백색 가면·머리 뒤 세 개의 묘비 파편·낡은 석관 견갑·가슴의 푸른 유골핵·부서진 대검·붉은 장례 천을 핵심 실루엣으로 고정한다. 유골로 쌓은 괴수·제단형 거상으로 대체하지 않는다. 생성 프롬프트 핵심: “full-body dark fantasy former warrior who fought in hell, cracked white burial mask, three broken gravestone halo slabs, weathered coffin pauldron with hanging relics, exposed rib cage with glowing blue urn heart, chipped oversized sword, torn red burial strips, black-blue hell ruins, cinematic character key art”. 생성본 URL: `https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260927_151141_29fba833-6a17-4994-8a22-8640d2669e0c.png`. 현행 게임은 이 원본의 로컬 사본을 사용하므로 오프라인에서도 초상이 표시된다.


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
  #invPanel.panel[data-inventory-page=ossuary] .pbox .inv-wrap{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:max-content minmax(440px,1fr)!important;overflow-y:auto!important;}
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

> **현행 변경:** 2026-09-27 고유 보석 전면 교체로 아래 최초 단일 옵션·일반 보석 외형은 이력이다. 현재 18종은 모두 이름과 2~3옵션, 18개 개별 실루엣·각인·색을 가진다. 후속 감정판은 `inventory-gems-finish.css?v=20260927-unique2`를 로드하고, 각 옵션을 최소23px 행으로 분리하며 18종별 설정 문구를 표시한다. [보석함 현행 규격](GEM_ATELIER_20260927.md)과 [18종 데이터표](../2_9%20결정슬롯시스템/2_9%20결정슬롯시스템.md)를 우선한다.

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
| 내부 (이전 규격) | 상단 보석 격자 minmax(150px,1fr) + 하단 감정판208px, 간격14px |
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
| 모바일 | 폭899px 이하 가방 위/컬렉션 아래,행max-content/minmax(440px,1fr),가방최소260px·격자140px,세로 스크롤. 폭560px 이하 부위76×88px,중앙82×100px,팔x15%/몸통x85%,패딩10px 8px. 제단284px/원환274px/그림 크기 유지 |
| 등급 표현 | 모든 테두리 금속 재질 통일. 개별 등급은 이름의 70% RARITY_C+30%#e1ccb0 혼색 및 하단4×4px 마름모 보석. 선택 프레임 brightness1.28/saturate.9. 수집 프레임 brightness.95/saturate.75,미수집.6/.4 |
| 읽기 | 슬롯에는 부위명·그림·등급만 노출. .oss-bone-tier display:none. 선택 상세는 부위·등급·T(t+1)·위력(r+t)·성장 효과. 중앙 이름은 하단 어두운 명판 위에 표시 |
| 완료 | 4/4+유골함 장착 시 중앙 프레임 brightness1.14/saturate.9, 제단 brightness.9/saturate.85. 기본 제단 .72/.7. 소환 해금 배지와 미수집 상태 구분 |
| 캐시 | game.html/game-easy-test.html: ui-refinement.css?v=20260927-bone-hover-flow |
| 불변 | 실제 4부위 해금 조건, 등급·티어 저장, 상위 r+t 등록, 전대 전투 수치, 재입력 회수 |
| 제작 | Higgsfield GPT Image 2.5(gpt_image_2_5),quality high,resolution1k,aspect1:1. 잔액1111.25 확인 후 2건 생성, GPT API 폴백 없음 |
| 작업 ID | 제단9ceb151d-45d5-476e-83ec-3a13c63e6b25 / 슬롯fa8121e1-87f3-4623-89c1-2edcd900e15e |
| 최종 화면 검증 | 1440×1080 실화면·390×844 좁은 화면 시각 확인. 1280×720/390×844 슬롯 겹침0·가로넘침0. 수집0→4 해금,상위갱신/하위거부,DOM 유지 확인. pageerror0. tmp/ossuary_altar_complete.png·ossuary_altar_390.png |


## 2026-09-27 대장간 제작 목록 마감

이 절은 앞선 동일 선택자의 시각 규칙을 대체한다. 수치·제작·강화·저장 로직과 DOM 변경 없음. 기존 iron 표면을 재사용하며 신규 에셋 없음.

| 대상 | 현행 규격 |
|---|---|
| #fgGrid | gap8px, overscroll-behavior:contain, scrollbar-gutter:stable |
| .fg-i | relative/min-width0, padding12px 14px, 선1px #64533f, linear-gradient(110deg,#30271f66,#111013d9)+ui-surface center/320px, inset 0 1px #cbb18414 |
| 호버 | dis 제외, 선#b69b6d, inset 3px 0 #b69b6d 및 inset 0 1px #cbb18424 |
| .fg-sel | 선#d1b27b, linear-gradient(110deg,#69503166,#19130fee)+기존표면, inset 3px 0 #d1b27b |
| .fg-in | Noto Sans KR 600 14px/1.6, 아래여백4px, overflow-wrap:anywhere; 기존 희귀도 색 유지 |
| .fg-id | 12px/1.7, #c0b39d, overflow-wrap:anywhere |
| .fg-ic | Noto Sans KR 500 12px/1.6, tabular-nums, #e0c9a3, 위여백8px/위패딩6px/위선1px #89714d40, gap6px/flex-wrap:wrap; 성공률 의미색 유지 |
| #forgeConfirm | padding12px 16px, 위선2px #b79560, linear-gradient(110deg,#47331fc9,#181215f2), flex-shrink0 |
| #fgSelName / #fgSelDesc | 이름 Noto Serif KR 600 14px/1.5 #eddbb5; 설명 Noto Sans KR 12px/1.7 #c7b79b/tabular-nums. 둘 다 overflow-wrap:anywhere |
| 작은 화면 | 폭560px 이하 카드padding10px/이름13px |
| 전환 | 카드 border-color/background-color .14s, reduced-motion 시 none |
| 검수 | 격리 브라우저 테스트 캐릭터, 저장 API 쓰기 차단. 6탭×1920×1080/1280×720/520×800: 페이지·그리드 가로넘침0, 패널 화면내, 닫기 하단 화면내. 1280×720 강화 카드 시각 확인, pageerror0 |
| 범위 | 확인 바/선택 카드 규칙은 CSS 적용; 실제 자원 소비·강화 성공/실패·게임패드·전체언어 회귀는 수행하지 않음 |


## 2026-09-27 유골함 가방·컬렉션 반반 구성

| 항목 | 현행 계약 |
|---|---|
| 배치 | 유골함 탭 창 폭 min(980px,100vw−24px),높이 min(680px,94vh). 좌측 가방/우측 컬렉션 동등한 1fr씩,간격10px. 제단 최대폭380px/높이284px,원환274×274px. 중앙90×100px,부위88×88px. 두개골(50%,16%),팔(18%,50%),몸통(82%,50%),다리(50%,84%). 유골함 그림58×66px,부위38×38px |
| 반응형 | 폭899px 이하 가방 위/컬렉션 아래,행max-content/minmax(440px,1fr),가방최소260px·격자140px,세로 스크롤. 폭560px 이하 부위76×88px,중앙82×100px,팔x15%/몸통x85%,패딩10px 8px. 제단284px/원환274px/그림 크기 유지 |
| 정보 밀도 | 큰 제단 영역을 축소. 부위명·그림·등급은 슬롯에 유지,선택한 부위의 티어·위력·성장 효과는 하단 상세1곳. 상세 최소높이42px,패딩8px 10px |
| 재질 | 기존 제단·슬롯 아트 재사용. 슬롯 background-size125% 112%,중앙 inset −6px −4px,부위 inset −4px −2px. 등급 보석4×4px/bottom3px. 새로운 생성 에셋 없음 |
| 헤더·여백 | 컬렉션 기본 패딩10px 12px,제목14px(폭560px 이하12px),헤더 padding2px 0 8px. 부위명11px/1.4,footer padding8px 0 6px. 상세·힌트 margin4px 0 |
| 데이터·입력 | DOM·수집·저장·해금·장착·해제·분해 로직 유지. 가방10열·가용 너비에 맞춘 셀 크기 및 세로 내부 스크롤 유지(2026-09-27: 스크롤바 여유 최소12px 확보) |
| 적용·캐시 | ui-refinement.css,game.html,game-easy-test.html. ui-refinement.css?v=20260927-bone-hover-flow |
| 검증 | 기존 ossuaryCollection 회귀6개 PASS. 저장 API를 차단한 실제 game.html UI에서1440×1080/1280×720/900×720 동등폭·좌우 배치,390×844 상하 배치 확인. 노드 겹침0·페이지 가로넘침0·pageerror0. 전환 연출을 QA 전용 CSS로 숨겨 검수했으며 게임 시작부터의 전체 흐름은 검증하지 않음. 캡처 tmp/ossuary_split_1440.png, tmp/ossuary_split_390.png |


## 2026-09-27 대장간 낮은 화면·좁은 화면 공간 확보

앞선 같은 대상의 레이아웃 규칙은 이 표로 대체한다. 기존 제목 아트·본문 글자 크기·제작 동작을 보존한다.

| 대상 | 현행 규격·근거 |
|---|---|
| 원인 | 폭1200px 이하에서 기존 세로 탭의 폭 규칙과 flex-wrap이 함께 적용되어 6개 탭이 1열로 쌓임. 목록 clientHeight가 1024×768에서70px,520×800에서16px까지 축소. 기존 넘침 검사만으로는 실사용 공간 부족을 검출하지 못했음 |
| 폭1200px 이하 #fgTabs | display:grid,grid-template-columns:repeat(3,minmax(0,1fr)),gap6px,padding-right0. 자식 .fg-tab width:auto/min-width0/margin0. 6탭을3열2행으로 배치 |
| 높이800px 이하·폭781px 이상 제목 | height/min-height88px, padding50px 8px 12px, font-size18px. ::before 216×88px, background-size216×216px/center −54px. 기존118px 제목에서30px 절약 |
| 같은 조건 본문 | .frame-inner-panel-stack gap8px, #forgeMats padding6px 14px, #forgeLore padding4px 10px/margin-bottom4px |
| 1280×720 결과 | 목록 border-box 높이267.609375→325.609375px(+58px). 최종 clientHeight314px |
| 좁은 화면 결과 | 목록 clientHeight:1024×768 254px,520×800 196px,390×844 200px.1920×1080은568px |
| 검증 | 디스크CSS=서버GET 응답 일치, 새로고침 및 stylesheet 재요청으로 로딩. 5해상도×6탭 실제 클릭30조합에서 활성탭1개,목록clientHeight≥150px,가로넘침0,패널·닫기 화면내,pageerror0 |
| 시각 | 1280×720/520×800 화면에서 제목판·탭·본문 확인. 격리 테스트 캐릭터 사용, API 쓰기 차단, 검수용 익명 시네마틱 canvas만 브라우저 CSS로 숨김. 이 숨김은 게임 원본 변경이 아님 |
| 기록·한계 | tmp/forge-polish-backup/compact-report.json 및 forge-compact-1280.png. 실제 자원 소비·전체언어·게임패드 회귀 미검증. 터미널 장애와 .git 쓰기 제한으로 커밋 미완료; TERMINAL_FAILURE_FALLBACK_20260927.md에 따라 파일 수정·디스크 검증 계속 |


## 2026-09-27 스킬 장착바 키캡과 낮은 화면 마감

| 대상 | 현행 규격 |
|---|---|
| .skill-close | min-width0/max-width100% |
| #skSlotBar | border-box/max-width100%, justify-content:safe center, overflow-x:auto/overflow-y:hidden, overscroll-behavior-x:contain, gap6px/padding8px/thin scrollbar. 넘칠 때 왼쪽 시작을 보존하며 가로 스크롤 |
| 직계 div[title] 슬롯 | border-box/flex0 0 42px/width42px/height48px/radius0/padding-bottom10px, linear-gradient(#28231ddd,#100e11ee)+ui-surface center/160px, inset0 1px #d0b58820. 기존 슬롯 테두리색 유지 |
| 슬롯 이미지 |26×26px, 기존 스킬 이미지 재사용 |
| 직계 키 라벨 |bottom2px/right2px/left2px, Noto Sans KR 600 10px/1.2, #e1cda7, 중앙정렬, 배경#0b090cbb, shadow0 1px 2px #000. 기존8px에서10px로 확대 |
| 슬롯 호버 |선#c0a271, inset0 0 0 1px #c0a27155 |
| 높이800px 이하·폭781px 이상 제목 |height/min-height88px,padding50px 8px 12px,font18px. ::before216×88px,background216×216px/center −54px. 이전118px 제목 규칙 대체 |
| 같은 조건 #skillInfo |padding8px 14px,font13px/1.5,tabular-nums |
| 동작 보존 |키 매핑·슬롯 수·스킬 장착/습득·저장·카드 상태 변경 없음. CSS만 수정. 좁은 화면 마지막 슬롯 클릭 시 기존 skSlotPop 열림 확인 |
| 검증 |1280×720/1920×1080/520×800/390×844 × 추천/공격/방어/특수 실제 클릭16조합: 가로넘침0,패널폭 화면내,스크롤 본문높이150px 이상,모든 키10px 이상,마지막 슬롯 접근가능,pageerror0. 한국어·테스트 캐릭터 기준 |
| 검수 환경 |API 쓰기 차단, 익명 시네마틱 및 boss3dCvs/vfx3dCvs만 격리 브라우저에서 숨김. 게임 원본에서 해당 레이어 숨김 변경 없음. 실제 디스크 CSS 재요청 사용 |
| 기록·한계 |tmp/skill-polish-review/report.json,skill-1280.png,skill-390.png. 전체언어/게임패드/실제 습득·자원소비 미검증. 커밋은 기존 터미널/.git 권한 장애로 미완료 |


## 2026-09-27 보관함 좌우 반반 구성

| 항목 | 현행 계약 |
|---|---|
| 범위 | 인벤토리 내부 보관함 탭(data-inventory-page=storage). 2026-09-28부터 별도 storagePanel은 제거하고 이 탭만 사용 |
| 창 | 폭 min(980px,100vw−24px),높이 min(680px,94vh),유골함 탭과 동일 |
| 좌우 | 왼쪽 invCenter 가방,오른쪽 invStorageCol 보관함. repeat(2,minmax(0,1fr)),간격10px,1행 minmax(0,1fr) |
| 보관 조작 | invStBagSection을 보관함 탭 진입 시 invCenter 아래로 이동. 다른 탭은 invStorageCol로 복귀. 같은 DOM 노드를 append해 핸들러 보존. 보관함 탭의 가방 격자·보관 목록 우클릭으로 넣기, 창고 슬롯 우클릭으로 꺼내기. 기존 좌클릭 이동도 유지 |
| 창고 슬롯 | 기본6열,간격6px,폭100%/높이auto/aspect-ratio1. 패딩10px 12px. 아이템 그림 _itemSkin(item,34)을 생성하되 CSS에서 슬롯 안쪽 너비·높이(각 12px 여백)에 맞춰 확대, 비율은 contain. 빈 반환 시 _itemIco 폴백. 이름 title,등급점3×3px/좌상단3px. 기존 아트 로딩 폴백 경로 유지 |
| 가방 하단 | 보관 목록 margin-top8px. 제목12px/1.5,padding8px 0. 목록 최대높이112px,행 최소30px/padding4px 6px,아이템명12px/보관11px |
| 보관함 정보 | invStHeader 12px/1.5,margin8px 0 12px. 용량·저장·정렬·필터·접기·펼치기 기존 로직 유지 |
| 좁은 화면 | 폭899px 이하 가방 위/보관함 아래,행max-content/minmax(280px,1fr),가방최소360px·격자140px,세로 스크롤. 폭560px 이하 보관함5열 |
| 적용 | ui-refinement.css 캐시20260927-bone-hover-flow/ui-panels.js 캐시20260927-storage-split. game.html/game-easy-test.html 공통 |
| 검증 | uiPanelInitialization 회귀3개 PASS. 저장 API 차단한 game.html UI에서 보관1회·꺼내기1회·탭 왕복 시 노드 동일성 PASS.1440×1080/1280×720/900×720 좌우 동등폭,390×844 상하 배치,가로넘침0·슬롯 넘침0·pageerror0. QA에서 전환 연출만 숨김,게임 시작 전체 흐름은 검증 범위 밖 |
| 화면 | tmp/storage_split_1280.png,tmp/storage_split_390.png. 원본 백업 tmp/storage-split-backup |


## 2026-09-27 스킬 분류 탭·카드 디테일

| 대상 | 현행 규격·적용 |
|---|---|
| 렌더 표식 | game.html/game-easy-test.html renderSkillPanel의 _hierBar.className=skill-category-tabs, tb.className=skill-category-tab + 선택 시 active, --skill-category-color=h.col. 기존 SKILL_HIER/_skHierTab/번역/클릭/호버 핸들러 유지 |
| 제목 선택자 보정 | #skillGrid>div:not(.skill-recommendations):not(.skill-category-tabs)>div:first-child. 분류 첫 탭이 하위 카테고리 제목 스타일을 받던 중복 적용 제거 |
| 탭 바 | grid/repeat(4,minmax(0,1fr)),gap6px,width100%,margin0 0 12px,padding0 0 10px,아래선1px #77624655 |
| 기본 탭 | border-box/min-width0/min-height38px,flex 중앙정렬,padding7px 10px,선1px #67563f,radius0,linear-gradient(#211b20bb,#100d11ed)+info-plate center/100% 100%,글자#c9bda7,Noto Sans KR 600 13px/1.5,자간.03em,가운데정렬,overflow-wrap:anywhere |
| 활성 | 글자 --skill-category-color,선 color-mix(in srgb,해당색55%,#87765a),배경 linear-gradient(#53412b77,#181115dd)+동일 재질,아래 inset2px 해당색 |
| 분류색 | 기존 추천#ffcc44/공격#ff6644/방어#44aa88/특수#ff8800 재사용 |
| 탭 호버 | 글자#f3e3c4,선#c2a677. 활성 하단표시는 유지 |
| 카드 호버 | #skillGrid [data-sk-id] brightness1.12, inset0 2px #e4c99744 및 inset0 −4px 8px #0007. 위치·크기·기존 상태 테두리는 유지 |
| 반응 | 탭 color/border-color/box-shadow .14s,카드 filter/box-shadow .14s. reduced-motion에서는 transition:none |
| 폭560px 이하 | 탭 font12px,padding7px 4px,자간0.4열 유지 |
| 검증 |1280×720/1920×1080/520×800/390×844 ×4분류 실제 클릭16조합: 활성1개/클릭대상일치/탭텍스트넘침0/페이지가로넘침0/pageerror0. reduced-motion transition0s. 일반게임 기존 inline syntax 테스트1개 PASS,쉬운게임4개 인라인 스크립트 구문 PASS |
| 검수 범위 |테스트 캐릭터/API쓰기차단/연출canvas를 QA에서만 숨겨 검수. 신규 이미지·스킬수치·저장 변경 없음. 전체언어·게임패드·실제 스킬투자 회귀 미검증 |
| 증거 |tmp/skill-detail-review/skill-1280.png,skill-390.png,report.json. 터미널/.git 권한 장애로 커밋 미완료 |


## 2026-09-27 추천 빌드 진행 카드 디테일

| 대상 | 현행 규격 |
|---|---|
| 렌더 표식 |양쪽 게임 renderSkillPanel: phDiv.className=skill-rec-step, data-rec-state는 _done이면 complete,아니고 _isCur이면 current,나머지 upcoming. phHdr.className=skill-rec-title,phDesc.className=skill-rec-description |
| 단계·판정 |기존15단계,배열·습득·합체·현재단계·자동스크롤 판정 보존. data-rec-state는 기존 판정 결과의 시각 표식이며 upcoming은 현재 단계가 아닌 미완료 카드를 뜻함 |
| 공통 카드 |border-box,align-self:start,min-width0,margin0,padding12px,선#635540. 기존 표면·격자 유지 |
| complete |min-height38px,padding8px 12px,gap8px,선#536047,linear-gradient(100deg,#29302277,#111211e8)+ui-surface center/320px. 마지막 span Noto Sans KR 500 12px/1.6,#b4c69f,overflow-wrap:anywhere |
| current |선#ba945b,linear-gradient(110deg,#58402366,#171116ed)+ui-surface center/320px,inset3px 0 #ba945b 및 inset0 1px #e3c48c22. 이전 추천 현재단계 적갈색선#a75e46을 대체 |
| 제목 행 |align-items:flex-start,gap8px,margin-bottom8px,padding-bottom8px,아래선1px #79634444 |
| 제목 마지막 span |Noto Sans KR 600 14px/1.6,#d0c0a0,overflow-wrap:anywhere. current에서는#f1d79d |
| 설명 |padding-left0,margin-bottom10px,Noto Sans KR 400 12px/1.7,#beb19d,overflow-wrap:anywhere |
| 폭560px 이하 |모든 단계 카드padding10px,제목13px. 완료 카드에도 동일 작은화면 패딩 적용 |
| 검증 |1280×720/1920×1080/520×800/390×844 ×미진행/일부완료/전체완료12조합: 카드15개,완료0/1/15개·현재1/1/0개,제목·카드·페이지 가로넘침0,pageerror0. 일반 inline syntax1검사/쉬운 inline4개 구문PASS |
| 범위 |API 쓰기를 차단한 격리 테스트 캐릭터 메모리로3상태 구성,시각검수에서 canvas만 QA CSS로 숨김. 실제 스킬 투자·저장·전체언어·게임패드 회귀 미검증. 신규 이미지 없음 |
| 기록 |tmp/skill-recommendation-review/report.json 및 recommendation-current-1280.png/recommendation-complete-1280.png. 커밋은 기존 실행 환경/.git 권한 문제로 미완료 |


## 2026-09-27 대장간 탭 글자 중앙 정렬

| 항목 | 현행 계약 |
|---|---|
| 대상 | 강화(upgrade)·물약(potion)·분해(salvage)·리롤(reroll)·결정(crystal)·제작(craft),fg-tab-v4 내부 fg-tab-txt |
| 원인·수정 | 예전 이미지 버튼의 아이콘 자리 margin-left:55%가 텍스트를 오른쪽으로 밀었음. renderForge의 라벨 인라인 스타일을 margin:0;text-align:center로 수정. 기존 버튼 중앙 배치 사용 |
| 유지 | 탭 크기·위치·재질·활성 표시·텍스트·기능·비용·저장 불변. CSS 추가 없음 |
| 파일 | game.html/game-easy-test.html 동일 변경 |
| 검증 | 저장 API 차단·전환 연출만 숨긴 game.html UI.1440×1080/1280×720/1024×768/390×844에서6개 라벨 중심과 버튼 중심의 가로 오차0px,영역 이탈0.6탭 클릭 전환 PASS,pageerror0. 수정 전1280px +52.8px,1024px +76.63px,390px +21.81px 쏠림 재현 |
| 캡처 | tmp/forge_alignment_after_1280.png. 게임 시작 전체 경로·실제 강화/제작 비용 소비는 검증 범위 밖 |


## 2026-09-27 가방 마지막 열 잘림 수정

| 항목 | 현재 구현 |
|---|---|
| 적용 위치 | game.html, game-easy-test.html의 renderInv 및 ui-refinement.css의 #invGrid |
| 가용 너비 | 부모 clientWidth에서 computed paddingLeft와 paddingRight를 뺀 안쪽 너비 |
| 스크롤바 여유 | max(12, grid.offsetWidth − grid.clientWidth)px; scrollbar-gutter:stable로 세로 스크롤바 공간 확보 |
| 셀 크기 | max(1,min(56,floor((가용 너비 − 스크롤바 여유)/10)))px. 기존 최소38px 제한을 없애 좁은 화면에서도10열 전체 표시 |
| 그리드 폭 | 10 × 셀 크기 + 스크롤바 여유. 기존 자동 좌우 여백으로 중앙 정렬, overflow-x:hidden 유지 |
| 창 크기 변경 | 부모 clientWidth 변경을 ResizeObserver로 감지해 renderInv 재실행. 높이만 바뀔 때는 재실행하지 않음 |
| 좌표 | 셀·아이템·드래그 모두 _GC_SZ 사용. 격자 시작점과 아이템 _gx/_gy 저장 좌표 유지 |
| 검증 | 1920/1280/900/640/390px 너비에서 마지막 열 및2×2 아이템 오른쪽 경계 확인. 리사이즈 후 드래그 x8→x6 확인 |


## 2026-09-27 가방 패딩 충돌·분할 화면 높이 보정

| 항목 | 현재 구현 |
|---|---|
| 공통 격자 | ui-refinement.css의 #invPanel.panel .pbox #invGrid: display:block,padding:0,gap:0 모두 important. 절대좌표 셀에 기존 CSS Grid의 패딩9px/gap4px이 적용되던 충돌 제거 |
| 좁은 분할 화면 | 폭899px 이하 유골함/보관함 탭만 적용. invCenter height:auto,유골함 min-height260px/보관함360px. invGrid height140px/flex0 0 140px. 모두 important |
| 행 높이 | 유골함 max-content minmax(440px,1fr),보관함 max-content minmax(280px,1fr). 필터 펼침·보관 목록 높이를 첫 행에 반영하고 전체 본문 세로 스크롤 유지 |
| 데이터 | 셀 수·저장 좌표·아이템 이동·필터 기능 불변. CSS 변경만 적용 |
| 검증 | 실제 디스크 CSS를 새로고침해390/640/899/900/1280/1920px ×2탭×필터 열림/닫힘24조합. 가방 부모 세로 넘침0,가방 가로 넘침0,페이지 가로 넘침0,마지막 열 경계 정상,pageerror0 |
| 검수 환경 | 저장 API 쓰기 차단 테스트 캐릭터,2×2 아이템 포함. canvas만 QA CSS로 숨김. 보고서 tmp/bag-split-fit-review/report.json. 실제 저장·전체언어·게임패드 미검증 |


## 2026-09-27 등록 유골 해제·가방 반환

| 항목 | 현행 계약 |
|---|---|
| 함수 | withdrawBonePart(ancIdx,part). 유효 전대·skull/torso/arms/legs 및 현재 등록 확인. 성공true/실패false |
| 조작 | 부위 우클릭 즉시 해제 또는 부위 선택→선택 유골 해제(.oss-withdraw). 중앙 유골함은 기존 우클릭과 유골함 해제(.oss-unequip) 버튼 모두 지원 |
| 반환 | mkBonePart(ancIdx,part,record.t,record.r),기존 등급r/티어t/전대/부위 유지. 도감은 원래{r,t}만 보관하므로 반환 itemLv=0으로 고정하여 현재 캐릭터 레벨로 상승시키지 않음. 신규 ID,1×1 칸 |
| 원자적 이동 | BAG_MAX 및 _invFindSpace(1,1,신규가방index) 검사. 임시push 후 공간이 없으면pop하고 등록 유지. 공간 성공 시 _gx/_gy 지정→등록 키 delete→선택 부위·아이템 선택 초기화→dbSaveForce→renderInv→_invClearHover→이동 안내 |
| 중복 방지 | 해제 후 등록 키가 없어져 연속 호출은false. 가방 개수 또는 실제 칸이 부족하면 저장·등록·아이템 수 불변 |
| 소환 | 한 부위 해제 시4/4 미완성으로 새 소환 잠금. 반환 아이템 도감 재등록 가능. 이미 소환된 전대의 HP·회수·생존 규칙은 변경하지 않음 |
| 유골함 | 기존 unequipItem('ossuary') 재사용.2×2 공간 필요,등급/강화/결정 유지. 새 버튼도 기존 우클릭 핸들러 공유 |
| DOM·가용성 | 최초1회 .oss-actions와 실제button2개 추가,기존 자식 유지. 등록된 선택 부위가 없으면 유골 해제 disabled,유골함 미장착이면 유골함 해제 disabled. 키보드 버튼 실행 지원,KO/EN _L 안내 |
| 스타일 | actions flex/중앙/gap8px/wrap/margin-top6px/flex-shrink0. 버튼 최소높이30px,padding5px 10px,border1px #756044,배경#181513,글자#dfcda5,11px/1.5. disabled opacity.45 |
| 세이브 | INV.ossCollect 기존{ancId_part:{r,t}} 구조 유지. 해제 시 해당 키 삭제와 INV.bag 반환 아이템을 함께 dbSaveForce. 마이그레이션 없음 |
| 적용 | game.html/game-easy-test.html/ui-refinement.css. CSS 캐시20260927-bone-hover-flow |
| 검증 | 신규 ossuaryWithdrawal6개+기존 ossuaryCollection6개=12 PASS. 브라우저 버튼 해제·우클릭·재등록·유골함 버튼 해제·1280/390px 조작부 스크롤 접근 PASS,pageerror0. 저장API 차단/전환연출 숨김,실사용 저장파일 수정 없음. tmp/bone_withdrawal_1280.png |


## 2026-09-27 장비 가방 높이·긴 호버 설명 접근 수정

| 항목 | 현행 계약 |
|---|---|
| 장비 탭 높이 | ui-refinement.css: data-inventory-page=equipment의 inv-wrap 행270px minmax(min-content,1fr),invCenter height:auto/min-height260px,invGrid height140px/flex1 1 140px. 모두 important. 필터를 펼치면 행이 늘고 큰 화면에서는 가방이 남은 높이를 사용 |
| 호버 상세 휠 | ui-panels.js inventory 초기화에서 invPanel wheel 위임. #invGrid/.inv-eq-slot/.oss-center 위에서 invRight가 보이고 clientHeight>0이며 호버 미리보기 또는 나란히 비교가 열렸을 때 정보판을 스크롤. 짧은 내용도 배경 가방으로 휠을 넘기지 않음 |
| 나란히 비교 휠 보정 | 장비 탭 invRight가 inv-side-compare이고 실제 보이면 hover-preview 유무와 무관하게 #invGrid 전체의 휠을 두 .inv-compare-card scrollTop에 같은 delta로 적용한다. 카드가 짧거나 스크롤 끝이어도 preventDefault하여 가방 위치를 고정한다. 비교가 없는 호버 정보는 invRight 단일 스크롤을 사용하고, 정보가 닫히면 가방 휠을 원래대로 둔다. game.html/game-easy-test.html의 공통 스크립트 캐시는 ui-panels.js?v=20260927-compare-wheel2 |
| 같은 상세 재렌더 | game.html `_invRenderDetail`에서 우측 패널의 현재 아이템 객체와 출처가 다음 렌더와 같으면 invRight 본문 scrollTop, 두 비교 카드 scrollTop, 수치 차이 details open/scrollTop을 보존. 호버 종료로 선택 상세를 복원할 때 읽던 위치가 맨 위로 튀지 않음. `_invRenderEmptyDetail`은 추적 아이템을 비워 다른 아이템의 위치를 재사용하지 않음 |
| 입력 규칙 | deltaMode=0은 픽셀,1은16px,2는상세창 clientHeight 배율. deltaY=0 또는 Ctrl/Meta/Shift는 전달하지 않음. 정보판으로 라우팅할 때 preventDefault/passive:false,양끝에서도 가방 이동 방지. 비교가 열렸으면 가방 빈 칸 휠도 정보판에 적용하고, 정보판이 닫혔을 때는 기존 가방 스크롤 |
| 표시 | game.html _invRenderDetail의 preview 분기에 inv-preview-scroll-hint 리프 생성. KO 휠: 상세 스크롤 / EN Wheel: scroll details. sticky top0/z-index2/padding4px 6px/margin-bottom8px/배경#181417/글자#c9bda7/11px 500 1.5/아래선1px #75624766 |
| 기존 동작 | 호버 미리보기 pointer-events:none 유지. 마우스 이탈 시 정보창 숨김,선택·장착·저장 유지. game-easy-test.html은 기존 비미리보기 상세 구현이므로 preview 안내를 추가하지 않음; 공통 CSS와 가드된 리스너만 로드 |
| 검증 | 390×844/640×720/900×720/1280×720/1920×1080 ×4탭×필터 열림/닫힘40조합: 표시된 가방의 세로·가로 넘침0,페이지 가로 넘침0. 휠 상세 위/아래 끝 접근,배경 가방 정지,마우스 이탈 숨김,빈 칸 휠 가방 이동 확인. pageerror0 |
| 회귀·환경 | gameHtmlInlineSyntax 및 uiPanelInitialization 기존 테스트4개 PASS. 저장 API 차단 테스트 캐릭터와 실제 저장 CSS/JS로 검수,canvas만 QA에서 숨김. 전체언어·게임패드·실제 저장 미검증. tmp/inventory-detail-audit/report.json |


## 2026-09-27 좁은 장비 카드의 홈·아이콘 잘림 수정

| 항목 | 구현·검증 |
|---|---|
| 원인 | 작은 화면의4홈 장비가 nowrap과 고정21px 마지막 행 때문에 카드 오른쪽을 넘음. 38px 스킨 wrapper와42×32px 받침도 불일치 |
| 수정 | inventory-gems-finish.css에서 장비판 행 minmax(min-content,1fr),카드 마지막 행 auto/min-width0. 홈 컨테이너width/max-width100%·wrap·center,버튼flex-shrink0. 아이콘 flex 중앙정렬/max-width100%,내부 .iskin36×32px important/max-width100%,받침 inset −4px 0 |
| 폭 검증 |360/390/700/701/900/1280/1920px에서17부위 유지,카드·홈·아이콘 가로 넘침0,홈의 카드 경계 이탈0,페이지 가로 넘침0. 본문 세로 스크롤로 모든 부위 접근 |
| 실제 조작 |390px에서 왕관4번째 홈에 피의 맹세 장착:보유12→11/장착0→1,탈착:보유11→12/장착1→0. 저장 API와 저장 함수를 차단한 테스트 캐릭터 메모리만 사용 |
| 회귀 갱신 |test/crystalEquipment.browser.js의 제거된 cr_hp/cr_atk/cr_mp를 현행 cr_martyr_tear/cr_blood_oath/cr_last_breath로 교체. 기존12개 시나리오 그대로 브라우저 실행 PASS. 최초 구 ID 기반 실패와 현행 ID 재검증을 구분 |
| 범위 |장비 부위 좌표·보석 능력치·비용·저장 구조 불변. CSS 및 기존 테스트 입력만 수정. 전체언어·게임패드 검증 없음. tmp/gem-detail-audit에 결과·백업 |


## 2026-09-27 결정 선택 팝업 디테일 보정

| 항목 | 현행 규격·동작 |
|---|---|
| 적용 | game.html/game-easy-test.html renderCrystalBag 및 closeCrystalPicker,공통 ui-refinement.css |
| 창 | #crBagPop border-box,폭 min(380px,100vw−24px),최대높이 min(70vh,100dvh−24px),padding12px,gap8px,선1px #8b7350,모서리0,기존 ui-surface320px 재사용 |
| 제목·닫기 | cr-picker-head gap8px/shrink0,제목14px600/1.5·색#dfcba4·줄바꿈,가루11px. cr-picker-close는 type=button/aria-label 닫기 또는 Close,30×30px. focus-visible 2px #ead1a0/offset−3px |
| 필터 | cr-picker-filters는20개 균등 CSS 열/gap5px. 첫4분류 각각5열,성급5개 각각4열. 최소높이28px/padding3px 4px/11px1.4. 기존 분류·성급 클릭 핸들러 유지 |
| 목록 | cr-picker-list min-height0,세로스크롤/가로hidden,overscroll contain,thin/stable scrollbar,gap6px. cr-picker-item shrink0/wrap/padding8px,선#67563f/모서리0. 이름12px600/1.5·flex1,마지막 옵션행100%/위여백5px/위선1px #67563f66/11px1.65,긴 옵션 줄바꿈 |
| 빈 결과 | 장비 슬롯 및 필터 조건 통과 후 visibleCount 증가. 0이면 role=status 안내. 주머니 자체가 비면 기존 결정이 없습니다,보유 중 필터0건이면 현재 장비와 필터에 맞는 보석이 없습니다. / No gems match this equipment and filter. |
| 닫기 | closeCrystalPicker가 _crBagOpen=false,_crPickSlot=null,_crPickCb=null 후 팝업숨김. 닫기 버튼이 공통 함수 호출. 선택 콜백과 원래 bag index 전달 유지 |
| 검증 |320×568/360×740/390×844/640×480/1280×720 모두 화면 안,가로 넘침0·행 텍스트 넘침0. 장비와 맞지 않는 필터/빈 주머니 안내,선택 후 콜백/피커 상태 초기화,Enter로 닫기 확인 |
| 환경·제한 | 저장 함수 및 API 쓰기를 차단한 테스트 캐릭터. main inline syntax 테스트1개 및 easy 인라인4개 구문PASS. 검수 재실행 pageerror0. 모든 언어·패드 미검증. tmp/crystal-picker-detail에 백업·보고서 |


## 2026-09-27 유골 해제 직후 호버 초기화

| 항목 | 현행 동작 |
|---|---|
| 원인 | 해제 후 선택 부위와 반환 아이템 선택을 유지했고, 빈 소켓에도 CSS :hover 및 기본 title 툴팁이 남았음. 유골함도 해제 후 기존 호버 상세가 남을 수 있었음 |
| 유골 부위 | 성공 시 선택 부위와 INV.selected를 비우고 renderInv 뒤 _invClearHover 호출. 등록·미수집 소켓의 기본 title 제거, aria-label 설명 유지. 등록 소켓은 자체 정보 팝업 표시 |
| 유골함 | unequipItem('ossuary') 성공 확인 후 INV.selected를 비우고 renderInv 뒤 _invClearHover. 빈 유골함은 title 제거, aria-label 유지. 공간 부족으로 해제 실패하면 기존 상태 유지 |
| 스타일 | CSS 호버 밝기 적용 대상을 등록된 유골(.collected)과 장착 유골함(.oss-center:not(.empty))으로 제한. 빈 소켓과 빈 유골함 transition:none으로 해제 직후 원래 밝기로 복귀 |
| 적용 | game.html, game-easy-test.html, ui-refinement.css. CSS 캐시 20260927-bone-hover-clear |
| 검증 | ossuaryWithdrawal+ossuaryCollection 12개 PASS. 저장 API 차단 브라우저에서 네 부위 우클릭→미수집/title 없음/재등록, 선택 해제, 유골함 해제→title 없음, 1280/390px 및 pageerror0 확인 |


## 2026-09-27 인벤토리·보석 피커 키보드 조작 보정

| 항목 | 현재 구현 |
|---|---|
| 하단 조작 | 양쪽 game HTML의 _invRenderDetail에서 장착·분해·해제·꺼내기 id-btn을 type=button으로 렌더. 기존 onclick 동작 유지,48px 하단 영역·가로 스크롤 유지 |
| 피커 필터 | cr-picker-filter type=button/data-filter/aria-pressed. renderCrystalBag가 재렌더 전 포커스된 필터 key를 읽고 동일 key 버튼에 focus({preventScroll:true}) 복원. CSS의 span 선택자는 해당 버튼 class로 변경 |
| 피커 목록 | cr-picker-item type=button. Enter/Space 기본 클릭 사용. 게임패드 목록 선택자는 div[onclick]에서 .cr-picker-item으로 변경하여 기존 순서·클릭 경로 보존 |
| 전역 키 예외 | K/KH 입력 등록 전에 초점 대상이 #invPanel.on button 또는 #crBagPop button이고 code가 Space/Enter/NumpadEnter/Tab이면 게임 키 핸들러 return. preventDefault 없이 브라우저 기본 입력 사용. 버튼 밖 기존 Space 쓰레기·Tab 메뉴 동작 유지 |
| 초점 표시 | 피커 필터/목록 focus-visible outline2px #ead1a0/offset−3px,상속폰트/색·왼쪽정렬. 기존 하단 버튼 초점 표시 유지 |
| 하단 초점 노출 | ui-panels.js inventory focusin에서 .inv-actions button 경계를 측정. 오른쪽 또는 왼쪽 이탈분만큼 rail.scrollLeft 조정. 본문 세로 위치·가방 높이 변경 없음 |
| 검증 | 실제 Space로 필터 변경·보석 선택·장착·해제 성공. Space 후 junk=false 보존. Tab/Shift+Tab 이동·필터 초점 유지 확인.320/390/640/1280px에서 실제 Tab 이동 후 마지막 하단 버튼 전체 노출. pageerror0 |
| 회귀·범위 | 기존 gameHtmlInlineSyntax/uiPanelInitialization4개 PASS,easy 실행 인라인4개 구문PASS. 저장 차단 격리 캐릭터 검수. 분해 실제 실행·물리 게임패드·전체언어 미검증. tmp/inventory-keyboard-detail 보고서·백업 |


## 2026-09-27 유골 등록 직후 호버 해제와 장착 유골 정보

| 항목 | 현행 동작 |
|---|---|
| 가방→등록 | 유골 가방 칸 우클릭은 registerBonePart 전용 분기. 일반 장비의 applyStats/eq:부위 선택/중복 renderInv을 실행하지 않음 |
| 호버 해제 | registerBonePart 성공 후 가방 아이템 삭제·선택 초기화·저장·renderInv 다음 _invClearHover를 호출하여 이전 가방 정보가 즉시 닫힘. 등록 실패 시 아이템과 정보 유지 |
| 등록 유골 정보 | 유골함 화면의 .oss-bone-node mouseenter/mousemove에서 좌측 #invOssInfo 고정 정보판에 부위명·등급r·티어t+1·위력r+t·역할을 표시한다. 미수집 부위도 역할·획득 안내를 표시한다. 기본 title 툴팁은 제거하고 aria-label 유지 |
| 팝업 종료 | mouseleave와 부위 우클릭 해제에서 즉시 hidden. 해제 후 기록이 없는 칸은 팝업을 열지 않음. document.body에 단일 role=tooltip 노드를 만들고 pointer-events:none으로 조작을 가리지 않음 |
| 배치 | 커서에서 16px 떨어뜨리고 뷰포트 가장자리 8px 안쪽으로 제한. 최대폭 min(240px,100vw−16px), padding9px 12px, 글자12px/1.6, z-index2147483647 |
| 저장 | INV.ossCollect와 가방 데이터 형식·기존 수치 변경 없음. 정보 팝업과 호버 상태는 저장하지 않음 |
| 적용 | game.html, game-easy-test.html, ui-refinement.css?v=20260927-bone-hover-flow |
| 검증 | 저장 API를 차단한 게임 화면에서 가방 유골 호버→우클릭 등록 직후 호버 상세 닫힘, 등록 유골 호버 정보 즉시 표시, 우클릭 해제 즉시 팝업 닫힘 PASS. 기존 유골 회귀12개·네 부위 우클릭 QA PASS, pageerror0. tmp/bone_hover_info_1280.png |


## 2026-09-27 보석 피커 진입·복귀 초점 연결

| 항목 | 현행 동작 |
|---|---|
| 적용 | 양쪽 game HTML의 renderCrystalBag/openCrystalPicker/closeCrystalPicker 및 _crPickerFocusStart/_crPickerFocusRestore |
| 진입 기록 | _crPickerFocusOrigin에 원래 버튼 node와 장비 card의 data-slot,홈 data-socket 저장. openCrystalPicker 렌더 후 첫 cr-picker-item으로 focus,목록이 비면 첫 cr-picker-filter,없으면 닫기 버튼 |
| 피커 의미 | role=dialog,aria-label=번역된 결정 주머니. 배경을 inert로 바꾸지 않으며 aria-modal 선언 없음 |
| Tab·Escape | 표시·활성 버튼 사이에서 마지막 Tab→첫 버튼,첫 Shift+Tab→마지막 버튼. Escape는 기본동작과 전파를 중지한 뒤 closeCrystalPicker 호출하여 부모 인벤토리를 함께 닫지 않음 |
| 복귀 | 닫기에서 상태 초기화·숨김 뒤 원래 연결된 표시 버튼으로 focus({preventScroll:true}). 재렌더로 원래 노드가 없어지면 동일 data-slot/data-socket의 새 버튼,그것도 숨겨지거나 없으면 현재 인벤토리 선택 탭으로 복귀. 복귀 정보는 사용 전 null로 초기화 |
| 선택 완료 | 보석 선택 콜백을 실행한 뒤 공통 closeCrystalPicker 호출. 장착으로 보석함 DOM이 재생성되어도 같은 부위·같은 홈으로 복귀 |
| 검증 | Enter 진입 후 첫 보석 초점,Tab/Shift+Tab 양끝 순환,Escape 복귀·부모 창 유지,Space 장착 후 armor 홈0의 새 버튼 복귀 확인. 빈 피커→all 필터→Escape→armor 홈1,탭 이탈 후 equipment 활성탭 복귀 확인 |
| 환경·회귀 | 저장 API/함수 차단 격리 캐릭터. 검수 재시작 후 튜토리얼 안내 입력 가로채기를 식별하고 해당 구간 분리 재확인. 기존 구문/패널 초기화4검사PASS,easy 실행 인라인4개 구문PASS. 전체언어·물리게임패드 미검증. tmp/picker-focus-return/report.json 및 edge-report.json |


## 2026-09-27 결정 피커 필터·입력 선택 동기화

| 항목 | 현행 구현·검증 |
|---|---|
| 재현 | 기존18행에서 _gpCrIdx=17인 상태로6행 필터로 전환하면 표시 선택0개·A버튼 무반응 |
| 필터 전환 | renderCrystalBag가 pop.dataset.crFilter와 _crBagFilter를 비교해 바뀌면 _gpCrIdx=0. 필터 유지 재렌더는 인덱스를0~현재 행 수−1 범위로 제한,빈 목록은0 |
| 입력 동기화 | 각 .cr-picker-item focus 및 movementX/Y가 있는 mousemove에서 현재 행 index를 _gpCrIdx에 반영. _gpCrBagNav도 매 실행 유효 범위로 제한. D-pad 이동 시 같은 행 focus({preventScroll:true}) 후 scrollIntoView({block:nearest}) |
| 보존 | A 클릭은 표시된 행의 기존 원본 bag index 핸들러 실행. 필터/홈 호환 판정·보석 데이터·저장·강화 비용 변경 없음 |
| 자동 회귀 | test/crystalPickerNavigation.test.js 추가: 일반/쉬운게임 각각 목록축소 후A선택,빈 목록 무선택,D-pad 초점·스크롤·A 일치 총6개. 기존 결정관리12개+구문1개+패널초기화3개 포함 총22개PASS |
| 기존 테스트 보완 | crystalForgeManagement.test.js의 간이 DOM에 HTMLButtonElement/activeElement/querySelector/querySelectorAll 모형 보충. 앞선 초점 API 도입에 따른 테스트 환경 누락 수정. 기존 검증 조건 유지 |
| 브라우저 | 실제 디스크 코드에서18→6행 필터 변경 후index0,키보드focus행3→index3,마우스행1→index1,D-pad 아래→행2초점,A→cr_ward_stone 선택·팝업닫힘 확인. pageerror0 |
| 범위 | 저장 차단 테스트 캐릭터,실제 게임 함수를 모의 패드 상태로 실행. 물리 게임패드·전체언어 미검증. 튜토리얼은 건너뛰기 버튼으로 종료 후 검수. tmp/crystal-picker-nav에 보고서·백업 |

## 2026-09-27 장비 이동 후 호버 시각 상태

| 항목 | UI 계약 |
|---|---|
| 이동 직후 | 가방 위치·장착 부위가 바뀌면 마우스가 정지해 있어도 우측 상세와 비교창을 숨기고 이전 선택·호버를 해제 |
| 다시 보기 | 새 아이템 위로 마우스를 이동하거나 클릭하면 상세 표시. 위치가 그대로인 일반 재렌더는 클릭 선택 유지 |
| 빈 장비 슬롯 | 장비 해제 뒤 커서 아래 빈 소켓에는 장착 아이템용 호버 밝기를 적용하지 않음 |
| 적용 | `game.html`, `game-easy-test.html`, `ui-refinement.css?v=20260927-inventory-move-hover` |

## 2026-09-27 가방 첫 칸 드래그 배치

| 항목 | UI 계약 |
|---|---|
| 빈칸 판정 | 장비 탭에서 보이지 않는 유골함·유골 부위는 장비 탭 격자의 빈칸을 막지 않음. 유골함 탭에서도 장비 아이템 좌표가 유골 배치를 막지 않음 |
| 드래그 | 2×2 장비를 첫 좌상단 `(0,0)`으로 이동 가능. 같은 탭 아이템이 점유한 칸은 기존처럼 무효 표시·이동 취소 |
| 정렬 | 장비/유골 각 탭이 좌상단부터 별도로 정렬. 화면상의 가방 수량·저장 구조는 기존 계약 유지 |


## 2026-09-27 정지 포인터 아래 스크롤 선택 튐 방지

| 항목 | 현행 동작·검증 |
|---|---|
| 원인 | 스크롤에 따른 mouseenter까지 선택 변경으로 처리. 60행 목록에서 index30에 초점/스크롤 후 index25,휠 후28로 덮어써짐 |
| 입력 규칙 | .cr-picker-item focus는 선택 동기화 유지. mouseenter 동기화 제거. mousemove의 movementX 또는 movementY가0이 아닐 때만 syncIndex. 스크롤·0거리 이벤트는 현재 선택 보존 |
| 쉬운게임 보완 | renderCrystalBag 말미의 목록 이벤트 연결과 재렌더 필터 초점 복원 누락을 보완. 생성 영역은 createContextualFragment + replaceChildren으로 갱신. 기존 쉬운게임 분류·아이템 수치 유지 |
| 브라우저 재현 | 디스크 renderCrystalBag 함수를 격리 게임 페이지에 반영해 동일 포인터 위치에서 재현. 수정 후 index30/초점30이 자동 스크롤과 휠 뒤에도 유지,실제 포인터를32행에 이동하면 index32. 마지막 index59/초점59/목록끝 일치 |
| 이벤트 회귀 | test/crystalPickerPointer.browser.js: 양쪽 실제 렌더러를 독립 DOM에서 실행. 행생성/초점/포인터진입/0거리이동/실제이동/필터축소 각6개,총12개PASS. 앱 데이터·저장 변경 없음 |
| 기존 회귀 | 결정관리12+패드이동6+구문1+패널초기화3=22개PASS. 쉬운게임 실행 인라인4개 구문PASS. 물리 게임패드·전체언어 미검증 |
| 기록 | tmp/picker-scroll-stability의 before/after/last-row/pointer-regression JSON과 코드 백업 |


## 2026-09-27 로비 원본 로고 중앙 이동

| 항목 | 현행 규격 |
|---|---|
| 사용자 지시 | 기존 좌상단 EXODUSER 이미지 로고를 캐릭터 목록 위 중앙으로 이동. 별도로 추가했던 게임명 텍스트 제거 |
| DOM | index.html의 .lobby-divider 안에 img.lobby-brand-logo, src=img/logo_exoduser.png, alt=EXODUSER, draggable=false |
| 문양 제거 | 해당 구분영역 background:none, opacity:1, flex 중앙정렬. 큰 배경 문양 유지 |
| 헤더 | 기존 좌상단 로고 래퍼 제거. .lobby-header는 justify-content:flex-end, min-height:48px로 언어·계정 영역 정렬 |
| 로고 규격 | display:block, height:100%, max-height:100%, max-width:100%, width:auto, object-fit:contain |
| 높이·캐시 | 구분영역 120px·화면 높이800px 이하 80px, flex-shrink:0. index의 ui-refinement.css 캐시 20260927-lobby-logo250 |
| 검증 | 실제 index/CSS를 스크립트 비활성 격리 페이지에서 표시. 360/664/1280/1920px에서 원본 이미지 로딩·영역 내 배치, 가로 중심 오차 0.01px 미만. 헤더 이미지와 추가 텍스트 각각 0개. 로그인/세이브 API 실행 없음. tmp/lobby-logo-center/after.png 및 report.json |


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


## 2026-09-27 중앙 EXODUSER 로고 2.5배 확대

| 항목 | 현행 규격 |
|---|---|
| 기본 크기 | .lobby-divider 높이120px!important, flex-shrink:0. 기존48px 대비2.5배 |
| 낮은 화면 | max-height:800px에서 영역80px!important. 기존32px 대비2.5배 |
| 이미지 | .lobby-brand-logo height:100%, max-height:100%, max-width:100%, width:auto, object-fit:contain. 원본 이미지·중앙 정렬 유지 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-lobby-logo250 |
| 검증 | 1920×960,1280×900,1280×720,800×720에서 영역 내 배치·중심 오차0.01px 미만·캐릭터 목록 비겹침. tmp/lobby-logo-250/after.png 및 report.json. 스크립트 비활성 렌더 검수 |


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


## 2026-09-27 로비 계정 영역 폭과 키보드 로그아웃 수정

| 항목 | 현행 규격 |
|---|---|
| 재현 | 긴 계정명이 flex 최소 콘텐츠 폭을 강제하여 1280px 화면의 우측 패널이784.34px로 확대. 정상35%는448px |
| 레이아웃 | .lobby-right 및 헤더 min-width:0, 헤더 flex-shrink:0. .lobby-account-controls grid-template-columns:minmax(0,140px) minmax(0,1fr), gap8px, width100%, min-width0, align-items:center |
| 언어 선택 | width100%, min-width0, max-width100%. 기존 다국어 옵션과 이벤트 유지 |
| 계정명 | lobby-mode flex/right 정렬, gap8px,min-width0,margin-top0,letter-spacing.04em. .lobby-account-email은 한 줄 ellipsis, font-size.7rem,색#aa8855, title에 전체 주소 |
| 로그아웃 | span 대신 type=button, id=lobbyLogout 유지. flex:0 0 auto, 최소높이28px,padding3px4px,border0,transparent배경,색#b8a386,글자.65rem,자간.08em. hover와 gp-hover는#ead6a5. 기존 공통 focus-visible outline 사용 |
| DOM·이벤트 | createElement와 리프 textContent로 주소를 텍스트 처리, replaceChildren으로 계정 요소 구성. 기존 sb.auth.signOut 호출 유지 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-account-layout |
| 검증 | 800/1280/1600/1920px에서 패널 폭360/448/560/672px, 계정 컨트롤 영역 내 배치·가로 넘침 없음. 실제 생성 코드와 signOut 스텁으로 Enter/Space 각1회 호출 확인. 로비 회귀8개 통과, 인라인 스크립트4개 구문 통과. tmp/lobby-account-layout/report.json 및 after.png. 실계정 로그아웃·저장 호출 없음 |


## 2026-09-27 캐릭터 카드 이름·직업·삭제 영역 분리

| 항목 | 현행 규격 |
|---|---|
| 문제 | 긴 이름 뒤 직업 배지가 잘리고 삭제 버튼과 텍스트 영역이16px 겹침 |
| 온라인·로컬 이름 | 기존 .char-name 안에 .char-name-label span 추가. 이름 본문은 escHtml 적용, title은 해당 리프 DOM 프로퍼티에 원문 직접 대입하여 전체 이름 확인 |
| 이름·직업 배치 | 이름 행 flex/align-items:center/gap8px. 이름 min-width0/한 줄 ellipsis. 직업 flex:0 0 auto/max-width50%/margin-left0/한 줄 ellipsis |
| 삭제 영역 | 삭제 버튼이 있는 .char-item만 padding-right48px·삭제28px, pointer:coarse에서는 padding-right64px·삭제44px. 텍스트와 삭제 버튼 사이10px 확보 |
| 진행 정보 | .char-info 한 줄 ellipsis로 긴 지역명이 카드 밖에 넘치지 않음 |
| 삭제 발견성 | 카드 focus-within 또는 hover:none 환경에서 삭제 버튼 opacity1. 기존 삭제 확인 동작 유지 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-card-details |
| 검증 | 온라인·로컬 실제 카드 템플릿을 격리 페이지에 렌더. 화면폭800/1280/1920에서 직업 배지 영역 내·삭제 간격10px·이름 말줄임 및 전체 이름 title 확인. 삭제 키보드 초점 opacity1. 로비 회귀7개 및 인라인 스크립트4개 구문 통과. tmp/lobby-card-details/after.png 및 report.json. 실제 캐릭터 선택·삭제·세이브 요청 없음 |


## 2026-09-27 로비 카드 키보드 선택·생성

| 항목 | 현행 규격 |
|---|---|
| 대상 | 온라인·로컬·데모의 실제 캐릭터 카드, 생성 가능한 새 캐릭터 카드 및 온라인 빈 목록 생성 카드. 빈 슬롯·생성 불가 카드는 제외 |
| DOM | _addLobbyCardControl(card,label,key)가 type=button.char-select를 prepend. aria-label/title은 이름·직업·레벨/진행 정보 또는 번역된 새 캐릭터, data-card-key는 online:id/local:name/demo/new |
| 배치 | .char-select absolute/inset0/z-index1/width100%/height100%/padding0/border0/radius0/transparent. 삭제 버튼은 별도 형제이며 z-index2 |
| 키보드 | Tab으로 카드 선택 가능, Enter/Space의 네이티브 click이 기존 카드 선택·생성 이벤트로 전달. 선택만 하고 실제 입장은 ENTER 버튼으로 진행 |
| 초점 복원 | 클릭 시작 시 초점 여부 저장, setTimeout 0으로 이벤트 버블링·목록 재생성 이후 처리. 기존 버튼이 제거되고 activeElement가 body일 때 동일 data-card-key 버튼에 focus(preventScroll:true). 다른 초점은 빼앗지 않음 |
| 초점 표시 | outline2px solid #ead6a5, outline-offset:-3px로 카드 내부에 표시 |
| 목록 초기화 | 온라인·로컬 렌더러의 cl.innerHTML 초기화를 replaceChildren으로 변경 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-card-keyboard |
| 검증 | 실제 온라인/로컬 렌더러·선택 함수 추출, 격리된 선택·생성·삭제 확인 콜백 사용. Enter/Space 각각 선택1회, 재렌더 후 초점 유지, 삭제 Enter는 선택 없이 확인1회, 생성 Space1회. 로비 회귀8개 통과 및 inline4개 구문 확인. tmp/lobby-card-keyboard/report.json 및 after.png. 실제 계정·저장·삭제 API 호출 없음 |


## 2026-09-27 목록 이동 초점·온라인 오른쪽 스틱 수정

| 항목 | 현행 규격 |
|---|---|
| 재현 | 목록 이동 버튼 클릭이 렌더러를 재실행하여 활성 버튼을 제거, 키보드 초점이 body로 유실. 오른쪽 스틱은 로컬 ID만 조회하여 온라인 목록 미동작 |
| 공통 바인딩 | _bindLobbyListNavigation(up,down,move), 위 -1/아래 +1. 각 렌더러는 인덱스를0~total-VIEW로 제한한 뒤 재렌더 |
| 초점 유지 | 클릭 전 활성 버튼이었다면 재렌더 후 동일 ID의 활성 버튼에 focus(preventScroll:true). 마지막/첫 페이지에서 해당 버튼이 disabled이면 반대 방향 버튼으로 초점 이동. 이미 다른 요소로 이동한 초점은 보존 |
| 게임패드 | 위 charNavUpOn 우선·charNavUp 폴백, 아래 charNavDnOn 우선·charNavDn 폴백. 기존 오른쪽 스틱 임계값±0.5 및 방향 진입1회 처리 유지 |
| 검증 | 온라인/로컬 실제 렌더러로 Enter3회:2-3→3-4→4-5/5, 끝에서 위 버튼 초점, Space로3-4/5 복귀. 실제 스틱 처리 코드에1,1,0,1,-1 입력:2-3,2-3,2-3,3-4,2-3/5로 두 모드 일치. 실제 게임패드 하드웨어 검증은 아님 |
| 회귀·기록 | 로비 회귀8개 통과, inline4개 구문 통과. tmp/lobby-list-navigation/report.json 및 gamepad-report.json. 테스트 데이터5개 사용, 계정·저장·삭제 API 호출 없음 |


## 2026-09-27 유골함 정보판 배치

| 항목 | UI 계약 |
|---|---|
| 가방 영역 | 유골함 탭 좌측의 큰 빈 가방 격자를 줄이고, 아래에 보석창과 같은 고정 정보판 `#invOssInfo`를 배치. 빈 상태는 안내문, 호버 시 아이템 카드 또는 유골 부위 카드 표시 |
| 정보 | 가방의 유골함/유골 부위와 장착 유골함은 기존 상세 스탯을 정보판 안에 표시. 제단 부위는 부위명·등급·티어·위력·효과를 표시. 화면 전환·장착·해제·호버 종료 시 이전 정보 제거 |
| 크기 | 폭899px 초과 좌우 동등폭이며 왼쪽 가방 격자/정보판은 남은 세로 공간을 1:1로 사용한다(격자 최소146px, 정보판 최소160px, 간격10px). 전체 화면형 인벤토리 외곽은 유지한다. 폭650~899px은 격자80px/정보판 최소100px, 폭649px 이하는 상하 흐름. 긴 장비 상세는 정보판 내부 스크롤 |
| 적용 | game.html, game-easy-test.html, ui-refinement.css?v=20260927-oss-info-plate. 1280×720·725×550·390×844 브라우저 확인 |

## 2026-09-27 로비 목록 컨트롤 클릭·터치 영역 확대

| 항목 | 현행 규격 |
|---|---|
| 재현 | 화살표 실제 높이15.2px, 삭제24×24px로 클릭 영역이 작음 |
| 기본 입력 | 화살표 최소32×32px, inline-flex 중앙정렬, padding4px8px. 삭제28×28px, 카드 오른쪽 padding48px |
| 터치 | pointer:coarse에서 화살표 최소44×44px, 삭제44×44px 및 opacity1, 카드 오른쪽 padding64px |
| 간격 | 삭제 버튼 right10px 유지, 텍스트와 버튼 사이10px 유지 |
| 초점·호버 | 목록 내비 align-items:center. 화살표 focus-visible outline-offset:-2px. 활성 화살표 hover/gp-hover 색#ffd6bb,배경#6b38282e |
| 캐시 | index.html의 ui-refinement.css?v=20260927-control-targets |
| 검증 | 온라인 실제 렌더러,1920/1280/800×720에서 화살표32px·삭제28px·간격10px·가로 넘침 없음·footer 화면 내. 키보드 이동 후 초점 유지. Chromium hasTouch 입력 에뮬레이션에서44×44px 및 간격10px 확인, 실제 터치 기기 검증은 아님. tmp/lobby-control-targets/report.json,desktop.png,touch.png |


## 2026-09-27 낮은 로비 화면 세로 접근성 수정

| 항목 | 현행 규격 |
|---|---|
| 재현 | 높이600px 이하에서 ENTER 하단612px, footer620px로 화면 밖 잘림. 배너 영역6px로 축소 |
| 구조 | .lobby-right 내부 콘텐츠를 .lobby-content로 감쌈. 모든 높이에서 flex column으로 배치하고 부족한 높이만 내부 스크롤 사용 |
| 낮은 화면 | 전체 높이에서 내부만 flex column/overflow-y:auto/overflow-x:hidden/flex:1 1 auto/min-height0/min-width0. scrollbar-gutter:stable,padding-right8px,thin 스크롤바 색#75674f/#101113,scroll-padding-block4px. 직계 자식 flex-shrink0 |
| 배너·프레임 | 낮은 화면의 lobby-mid-area flex:0 0 auto/overflow:visible로 중첩 스크롤 제거. 부모 장식 프레임·배경은 고정, 로고·카드 크기 보존 |
| 휠 경계 | 온라인·로컬 모두 현재 .char-scroll-vp에 연결한 wheel에서 Math.sign(deltaY)와 현재 데이터 길이로 다음 인덱스 계산. 실제 목록 이동 때만 preventDefault/렌더, 시작·끝·delta0에서는 기본 외부 스크롤 허용. 로컬 최초 바인딩의 오래된 chars 길이 캡처 제거 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-short-lobby |
| 검증 | 격리 로비 카드3개 고정 높이로1280×720/1024×600/960×540/800×480 검수. 낮은 화면에서 ENTER 초점 시 내부 스크롤196/256/316px, 버튼 화면 내·가로 넘침 없음. 실제 휠 핸들러 상하 경계/이동/0 입력 확인. 로비 회귀8개·inline4개 구문 통과. tmp/lobby-short-height/after.png,report.json,wheel-report.json |


## 2026-09-27 삭제 확인창 키보드 초점·취소 보완

| 항목 | 현행 규격 |
|---|---|
| 모달 의미 | delConfirmModal role=dialog, aria-modal=true, aria-labelledby=delConfirmMsg, tabindex=-1 |
| 열기 | _delConfirmReturnFocus에 호출 전 activeElement 저장, 기본 취소 버튼에 실제 focus(preventScroll:true). 기존 게임패드 선택 테두리와 초점 동기화 |
| 키보드 | Tab/Shift+Tab은 확인·취소2개 사이 순환, Escape는 비처리중 닫기. 버튼 focus 이벤트가 _delConfirmIdx를 동기화 |
| 처리 중 | 기존 _delConfirmBusy 및 두 버튼 disabled 유지. 모달 컨테이너에 초점, Tab은 이동 차단, Escape도 busy 잠금으로 닫히지 않음. 화면 전환은 창과 초점을 해제하며 요청 잠금은 완료까지 유지 |
| 복귀 | 닫힐 때 기존 요소가 연결되어 있으면 복귀, 목록 재렌더로 제거됐으면 #charList .char-select 첫 버튼에 복귀. 오류 메시지 기존 lobbyStatus에 유지 |
| 테스트 지원 | characterSync.test.js DOM 목 객체에 dataset/setAttribute/prepend/focus 및 document.activeElement/querySelector 보완. 삭제 검증 조건 유지 |
| 검증 | 실제 모달 함수 격리 실행: 취소 최초 초점,Tab/Shift+Tab 순환,Escape 취소와 원래 초점 복귀,콜백0회. 비동기 처리 중 Tab/Escape 잠금·콜백1회,모의 실패 후 오류 표시·대체 카드 초점 확인. characterSync8개·inline4개 구문 통과. tmp/lobby-delete-focus/report.json. 실제 삭제·계정·저장 요청 없음 |


## 2026-09-27 이름 입력 IME와 생성창 키보드 보완

| 항목 | 현행 규격 |
|---|---|
| 한글 확정 | charName keydown Enter는 isComposing 또는 keyCode229이면 생성하지 않음. 일반 Enter는 preventDefault, repeat이면 생성하지 않음. 일반 단일 Enter만 기존 createBtn.click 호출 |
| 모달 의미 | createModal role=dialog,aria-modal=true,aria-labelledby=createModalTitle. 기존 제목 h2에 해당 id 부여 |
| 열기 | _visualConfirm에서 이름 초기화와 setStatus 공백으로 이전 오류 제거. 기존50ms 입력 초점은 모달이 여전히 show일 때만 실행 |
| 이동·취소 | Tab/Shift+Tab이 이름·취소·생성의 enabled 컨트롤 사이 순환. 조합 중 Escape 무시, 일반 Escape는 기존 취소 버튼 클릭 |
| 취소 정리 | 모달 닫기, _vkbHide 및 상태 안내 초기화. 생성 가능 카드 버튼 우선, 없으면 첫 캐릭터 버튼으로 focus(preventScroll:true) |
| 검증 | 실제 입력 핸들러 격리 실행: composing Enter/keyCode229/repeat 각각 생성0회, 단일 Enter1회. Tab 순환·조합 Escape 유지·일반 Escape 닫힘·카드 초점 복귀·가상 키보드 정리 확인. 브라우저 합성 입력 검증이며 OS IME 실기 테스트는 아님. 생성/삭제/스토리 회귀27개,inline4개 구문 통과. tmp/lobby-create-input/report.json. 실제 캐릭터 생성·삭제 없음 |


## 2026-09-27 온라인 생성 실패 복귀·중복 요청 방지

| 항목 | 현행 규격 |
|---|---|
| 재현 | 온라인 insert Promise 예외가 처리되지 않아 생성 버튼 disabled가 유지. 중복 이름 실패 시 숨긴 이름 입력창 미복원. 진행 중 직접 호출은 요청 중복 가능 |
| 요청 잠금 | doCreateChar 시작 시 createBtn.disabled이면 즉시 반환. 기존 처리중 버튼 상태를 공통 중복 요청 가드로 사용 |
| 온라인 예외 | currentUser.id 확인 후 insert, try/catch로 Promise rejection 및 인증 누락 처리, finally에서 버튼 disabled=false |
| 재시도 UI | 현재 요청 번호일 때만 중복23505는 기존 중복 이름 안내, 기타 오류는 기존 생성 실패 접두어·message/알 수 없는 오류 표시. charName에 시도한 이름 유지, createModal show 및 입력 focus |
| 저장 계약 | 온라인 오류를 로컬 저장으로 대체하거나 자동 재시도하지 않음. 성공 이후 _afterCharacterCreated는 insert 예외 처리 바깥에서1회 실행. 기존 오프라인 저장 경로 유지 |
| 회귀 | characterStoryCreation.test.js에 네트워크 rejection/중복 이름/인증 없음의 버튼 해제·이름 보존·창 복원·초점·스토리 미진입3건, 대기 요청 중복 차단1건 추가. 수정 전4건 실패→수정 후통과 |
| 검증 | 생성·삭제·스토리 회귀31개 통과, inline4개 구문 통과. 외부 저장 없이 모의 API 검증. tmp/lobby-create-retry/changes.patch |


## 2026-09-27 오프라인 생성 실패 복귀·저장 예외 처리

| 항목 | 현행 규격 |
|---|---|
| 대상 | _enterOffline의 createBtn override 및 doCreateChar의 _testMode 분기 |
| 공통 실패 UI | 현재 요청 번호일 때만 _showCreateFailure(name,message) 호출:버튼 잠금 해제,이름 보존,setStatus 오류,생성창 show,이름 입력 초점 |
| 예외 | 기존 서버→localStorage 폴백 바깥에 저장 예외 처리 추가. getItem/setItem 용량·접근 예외 시 재시도 UI, finally에서 버튼 잠금 해제 |
| 중복 보호 | 오프라인 버튼 override도 disabled이면 재진입 차단. localStorage hellsave_demo_0~4를 먼저 조사해 같은 이름이 있으면 빈 슬롯이 있어도 저장 없이 중단 |
| 기존 제한 | 폴백5슬롯 유지. 가득참·중복 이름·명시적 서버 생성 실패 모두 공통 실패 UI로 복귀. 기존 캐릭터 삭제·덮어쓰기 없음 |
| 테스트 | 버튼/직접 경로×용량 예외/슬롯 가득참/중복 이름6건 추가. 중복은 첫 슬롯 동일 이름·나머지 빈 슬롯으로 확인. 저장 실패 시 스토리0회,기존 데이터 쓰기0회(용량 오류의 실패 시도1회) |
| 검증 | 생성·삭제·스토리37개 통과, 보강한 중복 fixture 포함6건 재통과,inline4개 구문 통과. 수정 전 신규6건 실패. 모의 API/localStorage만 사용. tmp/lobby-offline-retry/changes.patch |

## 2026-09-27 인벤토리 화면 면적 재배분

2026-09-28 장비 기사 선명도: 원래 회색 기사 원화(688×1024)를 Higgsfield image_background_remover(job 625361b0-5c91-425d-8321-771a9f172fd8)로 분리한 `img/ui/inventory_knight_cutout_20260928.png`(688×1024 RGBA, 1265160바이트)를 직접 표시한다. 밝기 기반 canvas 마스크는 어두운 갑옷까지 지워 폐기했다. 런타임에는 alpha를 재계산하지 않는다. 로딩 실패 시 기존 로컬 투명 기사로 폴백한다. `inventory-paperdoll.js`는 장비판 ResizeObserver와 이미지 decode 후 is-ready 처리만 담당한다. 표시는 contain·mask-image:none·opacity1·normal 합성, brightness(1.65) contrast(1.02) drop-shadow(0 8px 12px #000). 기사 JS/CSS 캐시 키20260928-equipment-cutout3, 장비 슬롯 CSS 캐시 키20260928-relic-frame1.

| 대상 | 최신 UI 규칙 |
|---|---|
| 네 탭 공통 | 인벤토리 창은 화면 상하 12px 여백을 두고 `100dvh−24px` 높이로 채운다. 폭도 `100vw−24px`; 620px 이하에서는 사방 4px 여백. 탭 본문이 남은 높이를 차지한다 |
| 장비 | 1200px 초과에서 장비판·10열 가방·정보판을 왼쪽부터 `minmax(0,1.28fr)`·`clamp(400px,30vw,600px)`·`minmax(380px,1fr)`로 배치. 가방 폭을 10열 격자에 맞춰 최대 600px로 제한하고 격자 오른쪽의 검은 띠를 정보판에 넘긴다. 세 영역은 본문 전체 높이, 가방 격자만 내부 스크롤 |
| 의미 있는 여백 | 캐릭터 아래는 장착 부위 수·장착한 보석 홈 수·전투력. 상세 선택 전 정보판은 상단부터 `calcCP()`의 공격/방어/추가 효과·홈 현황과 16부위 장착 목록을 2열로 표시한다. 장착 목록을 누르면 해당 아이템 상세로 이동하며, 가방/장착 아이템 선택 시 기존 옵션·비교 정보로 바뀐다 |
| 작은 화면 | 700px 이하 장착판→가방→정보판을 세로로 놓고 본문을 스크롤한다. 701~1200px은 아래 현행 2열 계약을 따른다. 620px 이하 인벤토리 창 여백 축소. 장비 게임 데이터와 유골함/보석/보관함의 내부 조작은 그대로 유지 |
| 소스 | `game.html`, `inventory-space.css?v=20260927-three-columns11`, `build-nwjs.mjs`. 장비 시스템 세부 수치와 반응형 행 값은 `docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md` 참조 |

장비 탭의 가방 후보와 현재 착용 아이템이 모두 있으면 오른쪽 정보 열에서 착용 장비/후보를 좌우로 고정해 첫 화면에서 비교한다. CP 변화는 위쪽에 바로 보이고 나머지 수치 차이는 아래 접기 영역에 유지한다. 비교 구조·해제 조건은 장비 시스템 문서의 최신 절을 따른다.


## 2026-09-27 생성·삭제창 좁은 화면 및 긴 문구 대응

| 항목 | 현행 규격 |
|---|---|
| 재현 | 360px 화면 삭제창400px로 좌우20px 넘침. 공백 없는 긴 오류/이름이 생성창1601px·삭제창3104px scrollWidth 유발 |
| 창 범위 | .create-modal-inner 및 #delConfirmModal>div min-width0/max-width:calc(100vw - 24px)!important/max-height:calc(100dvh - 24px), overflow-y:auto/overflow-x:hidden/overflow-wrap:anywhere/scroll-padding-block8px. 삭제창 width400px |
| 작은 화면 | max-width480px 또는 max-height480px에서 두 창 padding24px18px!important |
| 버튼 | 생성·삭제 버튼행 flex-wrap:wrap, 버튼 flex:1 1 96px/min-width0/min-height44px |
| 긴 문구 | 생성 제목·안내·삭제 질문 anywhere 줄바꿈. 생성 #status font12px/line-height1.5/max-height140px/overflow-y:auto/anywhere 줄바꿈 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-dialog-layout |
| 검증 |1280×720,360×480,640×360,320×280×생성/삭제2종=8경우. 긴 오류·삭제 안내로 창 화면 내·가로 넘침 없음·초점 버튼 보임 확인. tmp/lobby-dialog-layout/report.json 및 after.png. 스크립트 비활성 격리 렌더로 실제 저장·삭제 없음 |


## 2026-09-27 가상 키보드 선택 키 자동 스크롤

| 항목 | 현행 규격 |
|---|---|
| 재현 |640×360에서 가상 키보드 마지막 OK 키 하단442px,생성창 하단348px. 게임패드 선택 표시만 이동하여 키가 화면 밖에 남음 |
| 처리 | _vkbHighlight에서 data-vr/data-vc로 선택 키 확인. closest(.create-modal-inner) 내부 가시영역을 panelRect.top+clientTop부터 clientHeight까지 계산,위아래4px 여유 |
| 이동 | 선택 키가 위/아래 경계를 넘을 때 필요한 거리만 panel.scrollTop 보정. 이미 보이면 스크롤하지 않음. 문서·로비 및 실제 입력 초점은 이동하지 않음 |
| 유지 | 기존8행·키 크기·한글 조합·게임패드 입력 방식 유지. 신규 이미지·저장 없음 |
| 검증 | 실제 _vkbShow/_vkbHighlight 격리 실행,1280×720/640×360/360×480/320×280에서 첫행→마지막행→첫행12경우 선택 키 가시성 통과. 640×360 마지막행 scrollTop99px. inline4개 구문 통과. 게임패드 선택 좌표 시뮬레이션이며 실물 하드웨어 검증은 아님. tmp/lobby-vkb-scroll/report.json 및 after.png |


## 2026-09-27 로비 하단 버튼 접근성 보완

| 항목 | 현행 규격 |
|---|---|
| 다시보기 | replayCinBtn을 span에서 type=button으로 변경. 기존 _goCinematic onclick·번역 셀렉터·게임패드 목록 유지. 키보드 Enter/Space로 동작 |
| 표시 | 최소높이32px,padding4px0,border0,transparent배경,글자#b8a386/.7rem/자간.08em. hover·gp-hover #ead6a5, focus-visible outline-offset0 |
| 입장 | enterGameBtn 기본 aria-label=입장, _applyLobbyLang에서 _TL(입장)로 갱신. 이미지 노드·선택 전 disabled 유지 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-footer-controls |
| 검증 | 실제 마크업 격리 브라우저에서 Enter/Space 각각 다시보기 콜백1회(시네마틱 실행은 스텁). 입장 접근성 이름·이미지1개·disabled 보존,영문/한글 라벨 갱신 확인. 로비 언어·선택 회귀5개 통과. tmp/lobby-footer-controls/report.json 및 after.png |


## 2026-09-27 언어 팝업 화면 경계·키보드 보완

| 항목 | 현행 규격 |
|---|---|
| 재현 |360×480 화면 우하단 선택창에서 기존 팝업 right412/bottom764로 잘림 |
| 배치 | 좌우 여백8px, min-width=min(200,화면폭−16),max-width=화면폭−16. 아래 공간이 min(240,화면높이×.6) 이상 또는 위 공간보다 크면 아래, 아니면 위로 배치. 최대높이는 가용공간과60vh 중 작은 값,최소48px. 좌표 화면 내 보정 |
| 키보드 | 선택창 Enter/Space/위/아래로 열기, 팝업 ArrowUp/Down/Home/End로 탐색,Enter/Space로 기존 change1회 실행. 열기·팝업 키는 시네마틱 등 상위 키 처리로 전파하지 않음 |
| 닫기 | Escape는 선택값 유지하고 원래 select로 초점 복귀,Tab은 닫은 후 기본 이동. 바깥 pointerdown 및 화면 전환(_goLogin/_goCinematic/_goLobby/showLobby)은 초점을 강제로 되돌리지 않고 닫기 |
| 접근성 | 팝업 tabindex0/role=listbox/aria-label=Language. 행 role=option/aria-selected 및 고유id,팝업 aria-activedescendant. 선택창 aria-controls/aria-expanded 상태 동기화 |
| DOM | 팝업 재구성은 replaceChildren,행 텍스트는 리프 textContent. 기존 옵션·change 처리·게임패드 인덱스 계약 유지 |
| 검증 | 실제 팝업 코드 격리 실행,360×480/1280×720/640×360/320×280 우하단 배치 모두 화면내. 방향키 선택change1회,Escape취소 값 유지·초점복귀,바깥 클릭닫기 확인. 로비 회귀5개·inline4개 구문 통과. tmp/lobby-language-popup/report.json 및 after.png. 언어 저장은 검수용 change 계수로 대체 |


## 2026-09-27 언어 메뉴 혼합 입력·화면 크기 변경 보완

| 항목 | 현행 규격 |
|---|---|
| 재현 | 마우스로3번 행을 가리킨 후 Enter가0번을 확정.1280→360px 축소 후 팝업 right1062px로 화면 밖 유지 |
| 마우스 | 행 mousemove의 clientX/clientY를 _langPopPointer와 비교,처음 또는 좌표 변경 때만 _langPopIdx 갱신 및 _hlLangPop(false). 정지 포인터의 동일 좌표 이벤트는 키보드 선택을 덮어쓰지 않음 |
| 강조 | 개별 enter/leave 배경 조작 제거, 공통 _hlLangPop으로 배경·outline·aria-activedescendant 동기화. scroll 기본true,마우스 이동은false로 스크롤 점프 방지 |
| 창 크기 변경 | 기존 배치 수식을 _positionLangPop(pop,sel)로 분리. 열린 상태의 window resize에서 위치·최대높이 재계산 후 선택 행을 내부 스크롤로 노출,행 재생성·언어 확정·키보드 초점 이동 없음 |
| 검증 | 실제 메뉴 코드 격리 브라우저:마우스3번→Enter3번 확정,End28번 강조 후1280×720→360×480 축소 시 화면 내·28번 강조 유지,Enter28번 확정. 로비 회귀5개 통과. tmp/lobby-language-mixed-input/report.json. 실제 언어 저장 없음 |


## 2026-09-27 로비 통합 검증·언어 선택 행 가시성 보정

| 항목 | 결과·현행 규격 |
|---|---|
| 통합 검증 | 로비 단계·언어 선택·선택 정보·29언어 지역명·캐릭터 동기화·생성 스토리·스토리 제어·울트라와이드·언어 지역명9개 테스트 파일,82개 통과 |
| 추가 재현 | 메뉴 마지막 언어 선택 후1280×900→360×280 축소 시 팝업 하단227px,선택 행 하단598px로 내부 시야 밖 |
| 보정 | 열린 언어 팝업 resize에서 _positionLangPop 뒤 _hlLangPop 호출. 선택 인덱스 유지하며 현재 행을 내부 스크롤로 노출 |
| 브라우저 검증 |360×280→640×360→1280×900에서 마지막28번 항목 유지·선택 행 가시성·메뉴 화면 내 확인. tmp/lobby-integrated-review/report.json. 모의 팝업 검수,사용자 언어·저장 데이터 변경 없음 |


## 2026-09-27 저장 이름 툴팁의 따옴표 보존

| 항목 | 현행 규격 |
|---|---|
| 재현 | escHtml은 텍스트용 변환으로 따옴표를 인코딩하지 않음. 기존 저장 이름 전사 "별명" & 동료의 title이 전사 공백까지만 표시 |
| 수정 | 온라인/로컬 .char-name-label의 HTML title 보간 제거. 새 카드 생성 후 특정 리프 노드의 title 프로퍼티에 ch.name/s.name 직접 대입 |
| 유지 | 이름 본문은 기존 escHtml로 표시,선택 버튼 aria-label/title은 기존 DOM 대입. 신규 이름 입력 제한·저장 데이터 변경 없음 |
| 검증 | 온라인·로컬 실제 템플릿×큰따옴표/작은따옴표/꺾쇠·앰퍼샌드3종=6경우 본문·title 원문 일치,추가 속성·자식 없음. 로비 회귀7개 통과. tmp/lobby-name-attributes/report.json. 사용자 저장 수정 없음 |


## 2026-09-27 가상 키보드 한글 8글자 경계 보호

| 항목 | 현행 규격 |
|---|---|
| 대상 | index.html의 _vkbInput(k), 이름 최대 8글자 유지 |
| 재현 | 8번째 초성 뒤 새 초성을 입력하면 표시되지 않은 입력이 _hgState를 덮어써 다음 모음에서 마지막 글자 변경. 8번째 음절의 받침 뒤 모음을 입력하면 새 글자 추가 없이 기존 받침만 소실 |
| 경계 처리 | 길이 8 이상이고 조합 중이면 상태 변경 전에 sameSyllable 검사. 중성 전에는 모음(_isJung), 중성 이후 종성 전에는 초성이면서 종성 가능한 자음(_isCho와 _isJong), 종성 이후에는 _JONG_MERGE가 있는 자음만 허용. 그 외 입력은 input 이벤트 후 반환하여 값과 조합 상태 보존 |
| 유지 | 같은 음절의 모음·받침·겹받침 조합 및 기존 백스페이스 유지. 여유 글자 수가 있으면 받침 분리 후 다음 음절 생성 유지 |
| 회귀 | test/lobbyHangulInput.test.js: 초성 덮어쓰기·받침 소실·종성 불가 초성 덮어쓰기 방지, 겹받침·백스페이스·여유 길이 받침 분리 총 6건. 수정 전 3건 실패, 수정 후 6건 통과 |
| 검증 | 한글 입력·캐릭터 생성·언어 선택 관련 테스트 총 36건 통과. 실제 함수 VM 실행이며 실물 게임패드·OS IME 검증은 아님. tmp/lobby-hangul-limit/changes.patch에 코드·테스트·문서 함께 보관 |


## 2026-09-27 언어 메뉴 재열기 입력 상태 초기화

| 항목 | 현행 규격 |
|---|---|
| 재현 | 스틱을 기울인 채 메뉴를 닫고 밖에서 중립 복귀 후 다시 열면 로그인 첫 상하 이동이 무시됨. 로비는 이전 반복 대기시간이 남아 첫 이동 지연. 동일 좌표의 첫 마우스 이동도 이전 좌표 비교 때문에 무시됨 |
| 공통 처리 | _openLangPop에서 대상 select 확인 후 _langPopPointer=null, _GP.prev._lpU=false, _lpD=false, _lpDir=null, _lpRepT=0. 로그인·로비·시네마틱 공통 열기 함수에 적용 |
| 유지 | 현재 select.selectedIndex로 초기 선택. 탐색만으로 언어 확정하지 않음. 기존 스틱 임계값 ±0.5 및 로비 반복 초기300ms/이후80ms 유지. 같은 열린 메뉴 안에서는 정지 포인터가 키보드 선택을 덮어쓰지 않음 |
| 검증 | lobbyLanguageReopen.test.js: 로그인/로비 × 상/하 4건 및 동일 좌표 재열기 마우스1건. 수정 전5건 실패→수정 후 통과. 언어 선택·한글 입력 포함 총12건 통과. 실제 함수 VM 실행, 실물 게임패드 미검증 |
| 기록 | tmp/lobby-language-reopen/changes.patch에 코드·회귀 테스트·문서 동시 보관. 기존 터미널/.git 쓰기 제한으로 커밋 미완료 |


## 2026-09-27 낮은 로비 게임패드 선택 자동 노출

| 항목 | 현행 규격 |
|---|---|
| 재현 | 960×540에서 게임패드로 하단 시네마틱 버튼 선택 시 패널 하단516px,선택 버튼 하단768.19px,scrollTop0으로 화면 밖 유지 |
| 처리 | lobbyNav에서 _lobbyGpIdx 또는 실제 선택 요소 변경 시 현재 컨트롤의 closest(.lobby-content) 확인. clientHeight>0 및 scrollHeight>clientHeight일 때만 패널 내부 scrollTop 보정 |
| 경계 | 패널 getBoundingClientRect.top+clientTop 기준 위아래4px 여유. 선택 요소가 위 경계보다 위면 차이만큼 감소,아래 경계보다 아래면 차이만큼 증가. 이미 보이면 이동 없음 |
| 유지 | 내용이 패널 높이를 넘지 않으면 스크롤하지 않음. 실제 DOM 초점·언어 선택·캐릭터 선택/삭제 동작은 변경 없음. 중립 프레임은 같은 인덱스·동일 요소에서 스크롤하지 않음 |
| 브라우저 검증 | 실제 로비 HTML/CSS와 lobbyNav 함수,검수 카드3개로 960×540/800×480/1024×600/1280×900 각 첫 선택+아래6+위6 총52개 가시성 통과. 중립 스크롤 유지 및 document.scrollY0. 실제 저장/삭제 요청 없이 모의 패드 입력,실물 패드 미검증 |
| 회귀·기록 | 언어 재열기·캐릭터 선택 정보·언어 선택 테스트10개 통과. tmp/lobby-pad-visibility/report.json,after.png,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 목록 재렌더 후 게임패드 대상 동기화

| 항목 | 현행 규격 |
|---|---|
| 재현 | 오른쪽 스틱 목록 이동과 A/X를 같은 프레임에 입력하면 미리 수집한 _navItems가 제거된 카드 DOM을 참조하여 이전 카드 선택/삭제 확인 실행. 같은 인덱스의 새 DOM에는 gp-hover 누락 |
| 순서 | 오른쪽 스틱 페이지 이동을 _navItems 수집 전에 처리. 최신 보이는 DOM 수집 → 이전 요소가 남아 있으면 인덱스 복원 → 인덱스 상한 보정 → 방향 탐색 → 강조 → A/X 실행 순서 |
| 강조 상태 | _GP.prev._lobbyEl에 이전 실제 요소 참조 저장. 인덱스 또는 요소가 바뀌면 이전 요소 gp-hover 제거 후 현재 요소 강조·패널 노출·호버 사운드 처리. 교체 DOM도 같은 인덱스에서 갱신 |
| 유지 | 오른쪽 스틱 ±0.5 임계값 및 중립 복귀 전 방향별1회 이동, 온라인 ID 우선·로컬 폴백 유지. X는 기존 삭제 확인 클릭만 실행하며 삭제 확정 과정 유지 |
| 회귀 | lobbyGamepadRefresh.test.js 신규4건: 우스틱+A 최신 카드 선택,우스틱+X 최신 카드 삭제 확인,같은 인덱스 DOM 교체 강조 복구·이전 강조 제거,우스틱 홀드1회 및 중립 재진입. 수정 전3실패/1통과→수정 후4통과 |
| 검증·기록 | 캐릭터 동기화·선택 정보·언어 재열기 포함21개 통과. 실제 lobbyNav 추출 및 모의 DOM/패드 입력,실제 저장·삭제/실물 패드 검증 없음. tmp/lobby-pad-refresh/changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 로비 버튼 목록 변경 시 선택 대상 유지

| 항목 | 현행 규격 |
|---|---|
| 재현 | 현재 선택 앞에 버튼이 추가되거나 제거되면 숫자 인덱스만 유지되어 다른 컨트롤로 강조/A 실행 대상 이동. 입장 버튼 활성화로 시네마틱 앞에 탐색 항목 추가되는 경우 포함 |
| 처리 | _navItems 수집 후 _GP.prev._lobbyEl과 동일한 요소를 findIndex하여 _retainedGpIdx 계산. 0 이상이면 _lobbyGpIdx를 해당 위치로 복원한 뒤 상한 보정·방향 입력 처리 |
| 폴백 | 이전 요소가 제거되거나 탐색 대상에서 제외되면 기존 인덱스 상한 보정 유지. DOM이 교체된 카드는 기존 교체 감지·강조 갱신 경로 사용 |
| 자동 회귀 | lobbyGamepadRefresh.test.js에 앞 항목 삽입/제거 후 A 대상 유지,삽입 후 방향 입력의 기준 유지,현재 요소 제거 후 남은 항목 폴백4건 추가. 수정 전 신규3건 실패/1건 통과,수정 후 통과. 관련 테스트 총25건 통과 |
| 브라우저 | 실제 로비 마크업/CSS/lobbyNav 격리 실행. 960×540에서 시네마틱 선택 후 입장 버튼 활성화/비활성화 각각 A 실행이 시네마틱 콜백으로 전달(총2회),강조1개 유지. 실제 시네마틱 실행·저장 없음,실물 패드 미검증 |
| 기록 | tmp/lobby-pad-stable-target/report.json 및 changes.patch. 코드·테스트·문서 함께 보관,기존 터미널/.git 제한으로 커밋 미완료 |

## 2026-09-27 보석함 보유 격자·감정판 반반 배치

| 항목 | 현행 계약 |
|---|---|
| 화면 | 전체 화면형 보석함에서 폭900px 이상은 왼쪽 보유 보석/오른쪽 장비판을 1:1로 사용한다. 폭701~899px은 기존 .85:1.15, 폭700px 이하는 세로 스택이다. 왼쪽 필터 아래 보유 격자와 감정판도 남은 세로 공간을 1:1로 사용한다. |
| CSS | `inventory-gems-balance.css?v=20260927-half`를 `inventory-space.css`·`inventory-gems-finish.css` 뒤에 로드한다. 열 1:1은 폭900px 이상, 행 1:1은 폭701px 이상·높이600px 이상에 적용한다. 행은 `auto minmax(120px,1fr) minmax(160px,1fr)`, 간격12px이다. 폭700px 이하/높이600px 미만의 기존 세로 배치는 유지한다. |
| 측정 | 2500×1200 격자393px·감정판393px, 1280×720과 900×720 격자147px·감정판160px. 390×844는 기존 격자263px·감정판210px. |
| 동작·저장 | 보석 선택·호버 감정·장착/탈착·옵션 수치·`CRYSTAL_BAG` 저장 형식 변경 없음. 선택 보석 이름 표시와 pageerror 0을 네 화면 크기에서 확인했다. |


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
| 구조 | #lobbyBgImg를 .lobby-left 내부에서 #lobby 직계 자식으로 이동. 좌측65%(1100px 이하55%) 영역에 contain/center center로 원본 전체 한 장 표시(미선택 배경 잘림 수정). 기존 _swapLobbyBg의 이미지 선택·전환 및 DOM id 유지 |
| 레이어 | .lobby background:#000/isolation:isolate/overflow:hidden. 검정은 로딩·페이드 시 별도 body 배경 노출 방지용. 직계 배경 z-index0/pointer-events:none,좌우 패널 z-index1,왼쪽 자체 배경 transparent |
| 유지 | 오른쪽 장식 바깥은 동일 로비 장면을 노출. 내부 inset22px 배경·문양·카드·로고·버튼 및 캐릭터 미리보기 유지. 기존 배경3종 선택 정책 유지,새 이미지 생성 없음 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-single-lobby-scene |
| 검증 | 실제 HTML/CSS 격리 브라우저에서 flame 기존 에셋1장으로1600×900 시각 확인. #lobbyBgImg1개/부모lobby/전체화면크기 일치. body에 검수용 마젠타 배경을 두어 외곽에 노출되지 않음 확인. 960×540·1920×1080에서도 전체크기 일치/횡넘침 없음 |
| 기록 | tmp/lobby-single-scene/after.png,report.json,sizes.json,changes.patch. 게임 저장·계정 변경 없음. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 선택 캐릭터와 로비 전체 장면 일치

| 항목 | 현행 규격 |
|---|---|
| 사용자 확정 | 로비 표시 이미지는 선택 캐릭터와 일치. 선택 실버테일 뒤/우측 외곽에 랜덤 전사 배경이 남는 상태 금지 |
| 구조 | #lobbyCharPreview/video 및 #lobbyCharKeyart/img를 .lobby-left 안에서 #lobby 직계 자식으로 이동. 선택 시 #lobbyBgImg visibility:hidden,선택 해제 시 복원 |
| 매핑 | _updateCharDisplay의 기존 CHAR_VISUALS[s.charIdx 또는0] 공통 데이터로 이름·직업·영상·정적 이미지 표시. 영상이 있으면 idleVid,실패/재생 거절 시 같은 캐릭터 poster 우선·portrait 폴백. 영상 없는 경우 poster 또는 portrait 표시,keyart 플래그에 의한 숨김 제거 |
| 실버테일 | 기존 공식 assets/charselect/silvertail_solo.png?v=20260927을 전체 선택 장면으로 사용. 썸네일은 공식 bust 유지. 신규 이미지·영상 생성/변형 없음 |
| 늦은 응답 | 정적 폴백 콜백에서 _selectedCharDisplay!==s이면 무시. 캐릭터 전환 시 preview.onerror 초기화,선택 해제 시 video src/poster 및 정적 src 제거 |
| 영상 재사용 | getAttribute(src)의 물음표 앞 경로와 idleVid 경로를 비교하여 같은 영상의 불필요한 reload 방지. 기존 idleRate 유지 |
| 구도 | 직계 선택 미디어 z-index0,left0,width65%,height100%,object-fit:contain,object-position:center center,transform:none. 폭1100px 이하는 width55%. 원본 전체 표시,우측 패널은 자기 열을 채움(전체화면 잘림 수정 규칙) |
| 캐시 | index.html:ui-refinement.css?v=20260927-selected-scene |
| 검증 | 신규4회귀(정적 선택/영상 실패/이전 영상 늦은 실패/선택 해제)와 선택정보·동기화 포함16개 통과. 실제 CSS/함수 격리 브라우저1600×900 실버테일 표시 및 전사 영상 오류 후 전사 포스터1개만 표시 확인. 실물 게임패드·실계정 저장 미검증 |
| 기록 | tmp/lobby-selected-scene/silvertail.png,warrior-fallback.png,report.json,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 장비·유골함 화면 비율과 장비 카드 정렬

| 항목 | 현행 구현 |
|---|---|
| 큰 화면 장비 | 폭 1200px 초과에서 장착판/가방/정보판은 기존 3열 `minmax(0,1.28fr) clamp(400px,30vw,600px) minmax(380px,1fr)`, 간격 12px. |
| 중간 폭 장비 | 폭 701~1200px에서 좌측 장착판 1열이 2행을 차지하고 우측 가방/정보판이 위아래 1:1이다. 열은 `minmax(300px,1fr) minmax(0,1fr)`. 장착 그림판은 아래 2026-09-28 규격과 공통 배율을 사용한다. |
| 짧은 화면 | 폭 701~1200px·높이 650px 이하에서 우측 행 최소 높이 가방 220px/정보판 150px, 본문 내부 세로 스크롤. 장착판 최대 높이는 `100dvh - 252px`로 첫 화면의 하단 장착 현황 카드가 보이게 한다. |
| 좁은 화면 장비 | 폭 700px 이하에서는 장착판→가방→정보판 1열. 행 최소 440/440/320px, 폭 620px 이하는 370/400/300px이다. |
| 장비 카드 | 96×96px 소켓 안에 상·좌우 padding 3/4px과 하단 이름 영역 19px을 예약한다. 스킨 70×70px, 이름 띠 높이 18px·좌우 0으로 카드 안쪽에 맞춘다. 공통 zoom으로 함께 확대/축소된다. |
| 유골함 | 가방/컬렉션 좌우 1:1을 유지한다. 폭 1400px 이상·높이 850px 이상에서 제단 380×284px 원본을 1.35배로 표시하고 남는 컬렉션 공간의 세로 중앙에 둔다. 작은 화면의 제단 크기와 스택은 유지한다. |
| 연결 | `inventory-space.css?v=20260927-aligned12`, `inventory-oss-balance.css?v=20260927-scale2`를 `game.html`에 로드한다. NW.js 목록에는 유골함·보석함 균형 CSS를 포함한다. 아이템 장착/해제·호버·저장 데이터 변경 없음. |


## 2026-09-27 전체화면 선택 이미지 잘림 수정

| 항목 | 현행 규격 |
|---|---|
| 원인 | 선택 미디어 width135%/145% 및 음수left와 cover가 전체화면에서 원본 글자·머리·목을 잘라냄. 해당 확대 규칙 폐기 |
| 선택 이미지·영상 | #lobby 직계 .lobby-char-preview: left0,right:auto,width65%,height100%,object-fit:contain,object-position:center center,transform:none. 폭1100px 이하는 width55%. 원본 전체를 좌측 가용 영역 안에 표시 |
| 비율 | 원본을 변형하거나 자르지 않음. 표시 배율 min(영역폭/원본폭,영역높이/원본높이),남는 공간은 검정 여백. 임의 추가 배경 이미지 없음 |
| 우측 패널 | 사용자 대안 수용: .lobby>.lobby-right background:#100d0e!important로 자기 열을 화면 상하·오른쪽 끝까지 채움. 기존 장식 프레임·안쪽 문양·컨트롤 유지. 이전 외곽 투명 계약의 로비 부분은 이 규칙으로 대체 |
| 캐시 | index.html ui-refinement.css?v=20260927-selected-fit |
| 검증 | 실제 HTML/CSS 격리 렌더2560×900,1920×1080,1600×900,960×540에서 원본 전체 포함·선택 영역과 우측 패널 겹침 없음·횡넘침 없음. 2560×900 표시1588.35×900/가용1664×900,전체 문구와 머리·발 시각 확인. 기능/저장 변경 없음 |
| 기록 | tmp/lobby-selected-fit/report.json,ultrawide.png,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 실버테일 이전 초상화·애니메이션 복원 및 영상 잘림 방지

| 항목 | 현행 규격 |
|---|---|
| 사용자 결정 | 실버테일 애니메이션 전환 요청 후 초상화 교체 이력 확인,이전 초상화·영상 복원 방향으로 진행. 정적 키아트만 표시하던 당일 변경을 대체 |
| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
| 영상 | 실버테일1280×720/3초,기본1배속·muted/loop/playsinline. 로비 및 선택창 기존 video 경로로 재생,오류 시 같은 캐릭터 포스터·정적 초상화 사용 |
| 목 잘림 | 전사 원본 및 로비 중간 프레임에 머리 정상. #charVisualPop .cs-idle-vid 기본cover→contain/center top/transform:none,21:9 이상 scale1.15/scaleX1.1 제거. 로비 contain 배율 유지 |
| 검증 | 실제 로비 영상 실버테일0.2초/1.5초 프레임 축소 샘플값279839597/268599186으로 동작 확인. 초광폭2560×900 선택창 전사3840×2160/5.541667초 및 실버테일1280×720/3초 모두 contain/transform none 확인. 관련10개 회귀 통과 |
| 생성·기록 | 새 Higgsfield 영상 생성 제출 없음. tmp/silvertail-animation-restore/에 백업·복원 자산 목록·브라우저 캡처·report.json·코드/문서 changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 미선택 기사 배경 머리 잘림 수정

| 항목 | 현행 규격 |
|---|---|
| 원인 | 사용자233356 스크린샷은 선택 전 #lobbyBgImg. 선택 영상만 contain으로 바꾼 뒤 미선택 배경cover/전체화면 크기/자동줌이 남아 투구·머리 잘림 |
| 적용 | .lobby>.lobby-bg-img:left0,right:auto,width65%,background-size:contain,background-position:center center,animation:none,transform:none. 폭1100px 이하 width55%. 기존 z-index0/pointer-events:none 유지 |
| 표시 | 원본 전체를 좌측 영역 안에 표시,비율 차이는 검정 여백. 기존 로비 Ken Burns 확대는 이 요소에서 사용하지 않음. frost/flame/abyss1536×1024 원본·선택 정책 변경 없음 |
| 상태 | 선택 전에는 배경1개,선택 후에는 기존 선택 캐릭터 영상·정적 폴백으로 전환. 이번 수정은 미선택 상태의 표시 배율만 변경 |
| 캐시 | index.html ui-refinement.css?v=20260927-unselected-fit |
| 검증 | 실제 HTML/CSS 격리 브라우저:배경3종×2560×900/1920×1080/1600×900/960×540=12경우 contain/animation none/transform none·우측 겹침 없음·횡넘침 없음 확인. frost투구·까마귀·고양이·검 원본 전체 시각 확인 |
| 기록 | tmp/lobby-unselected-fit/report.json,frost-after.png,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


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


## 2026-09-28 로비 중간 높이 배너 압축 방지

| 항목 | 구현 계약 |
|---|---|
| 원인 | 높이681~720px에서 display:contents와 배너 flex 축소가 결합해 3개 카드 검수 시 배너가6px로 압축됨 |
| 수정 | .lobby-content의 flex column 및 overflow-y:auto/overflow-x:hidden을 모든 높이에 적용. 기존 scrollbar-gutter:stable,padding-right8px,scroll-padding-block4px 유지. 직계 자식 flex-shrink0 및 배너 flex:0 0 auto/overflow:visible |
| 배치 | 충분한 높이에서는 스크롤 없음. 부족할 때 패널 내부 스크롤로 배너와 입장 버튼 모두 접근. 기존 680px 한정 규칙 대체 |
| 검증 | 디스크에 저장한 실제 로비 HTML/CSS를 새 브라우저 페이지로 불러와 스크립트 비활성 및 3개 검수용 카드로 검증. 3840×2160,1920×1080,1920×720,2560×720,1280×681,960×540 모두 가로 넘침 없음 및 버튼 전체 접근. 681~720 높이 배너132px 복원 |
| 캐시 | index.html의 ui-refinement.css?v=20260928-lobby-content-fit |


## 2026-09-28 로비 안내 제목·이름 줄바꿈

| 항목 | 현행 규격 |
|---|---|
| 원인 | .char-disp-title의 white-space:nowrap 때문에 640×480에서 SIAPAKAH ENGKAU?가 좌측 영역을 넘어 오른쪽 패널 뒤로 잘림 |
| 수정 | index.html .char-disp-title: white-space:normal,overflow-wrap:anywhere,text-wrap:balance. 기존 폰트 크기·색·선택 상태·장식 유지. 들어가는 문구는 한 줄,긴 문구는 가용 폭에서 줄바꿈 |
| 검증 | 실제 수정 HTML/CSS를 스크립트 비활성 브라우저에 로드. 중복 제외 번역·한국어·8글자 한글/영문 이름 28개 × 1920×1080,960×540,640×480,480×360 = 112조건 텍스트 범위가 제목 폭 안에 포함됨 확인 |
| 범위 | 표시 CSS만 수정. 이름 값·번역 문자열·캐릭터 에셋·저장 동작 변경 없음 |
| 기록 | tmp/lobby-title-wrap/report.json,after.png,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |

## 2026-09-28 스킬창 카테고리 고정·레벨 정보 스크롤

| 항목 | 현행 계약 |
|---|---|
| 카테고리 | `renderSkillPanel()`이 4개 대분류 탭을 `#skillCategoryNav`에 렌더한다. 이 줄은 `.frame-inner-panel-stack` 첫 행에서 스킬 목록 스크롤 밖에 고정된다. 카테고리 전환과 강조는 기존 동작을 유지한다. |
| 레벨·자원 정보 | `#skillInfo`(LV/SP/악의/사슬)는 `#skillGridWrap`의 첫 자식이다. 휠로 목록을 내리면 요약도 스킬 카드와 함께 위로 이동한다. |
| 스크롤 경계 | `#skillGridWrap`과 우측 `#skillDetail`만 각각 내부 스크롤한다. 높이 620px 이하에서도 바깥 `.skill-pbox`는 스크롤하지 않고 중앙 영역이 남는 높이를 사용한다. 게임패드 기본 스크롤 대상도 `#skillGridWrap`이다. |
| 연결·검증 | `skill-workspace.css?v=20260928-fixed-categories5`를 사용한다. 1940×1158, 970×579, 390×844에서 휠 후 탭의 화면 y좌표 유지, 정보 y좌표 감소, 목록 scrollTop 증가, pageerror 0을 확인했다. 스킬 데이터·레벨업·합체·저장 형식은 변경하지 않았다. |


## 2026-09-28 로비 우측 하단 게임 종료

| 항목 | 현행 구현 |
|---|---|
| 배치 | index.html #lobbyQuitBtn, type=button. .lobby-bottom-actions를 .lobby-content 밖 우측 패널 하단에 배치하여 스크롤과 독립. 시네마틱 좌측,버전·종료 우측 |
| 스타일 | 로비 인라인 CSS. 종료 최소높이32px,padding4px 6px,글자.7rem,기본색#b8a386,hover/gp-hover#f1b6a2. corner gap12px 및 flex-wrap. 종료/입장/시네마틱/언어선택 focus-visible outline-offset:-2px로 잘림 방지 |
| 확인 | _showLobbyQuit → 기존 확인창 _showDelConfirm의 선택적 message 인수 사용. 기본 취소,Escape/B 취소,Tab 초점 순환 및 닫은 뒤 원래 버튼 초점 복원. 기존 삭제 기본 문구·동작 유지 |
| 종료 | window.nw.App.quit 우선,다음 window.electronAPI.quitApp을 await,일반 브라우저 window.close. 브라우저가 닫히지 않으면150ms 뒤 직접 탭 닫기 안내. 실패 시 안내 메시지. 세이브 삭제·변경 없음 |
| 입력·언어 | 로비 게임패드 수집 목록에 #lobbyQuitBtn 포함. 버튼은 _applyLobbyLang의 한국어/영어 fallback,확인/오류/브라우저 안내는 한국어 또는 영어 |
| 검증 | 실제 확인창 코드 격리 실행:취소 기본/Escape 복귀/취소 시 종료0회,NW·Electron·브라우저 각 stub1회. 1920×1080,1280×720,960×540에서 하단 버튼 전체 표시 및 초점offset -2px. 실제 앱 종료·실물패드·실계정 저장은 실행하지 않음 |
| 기록 | tmp/lobby-quit/after.png,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 종료·삭제 확인창 스틱 입력 재진입

| 항목 | 현행 규격 |
|---|---|
| 재현 | 왼쪽 스틱을 기울인 채 확인창을 열면 다음 프레임에 기본 취소가 확인으로 바뀜. 신규 회귀 테스트로 수정 전 실패 확인 |
| 수정 | _showDelConfirm 진입 시 _GP.prev._dlL/_dlR을 현재 _GP.axes[0]의 -0.5 미만/+0.5 초과 상태로 초기화. 진입 전에 유지하던 기울임은 선택을 바꾸지 않고,중립 복귀 후 새 입력부터 처리 |
| 적용 | 종료·캐릭터 삭제 공용 확인창. 기본 취소,새 D-pad 입력,A확정/B취소,키보드 Tab/Escape 및 비동기 중복 방지 유지 |
| 검증 | test/lobbyConfirmStick.test.js 신규2개와 characterSync/lobbyGamepadRefresh 포함18개 통과. 유지된 왼쪽 입력+A는 취소되어 콜백0회,중립 후 다시 왼쪽+A는 콜백1회. 실물 패드·실제 종료·저장 삭제 실행 없음 |
| 기록 | tmp/lobby-confirm-stick 백업 및 changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 확인창 Enter·Space 자동 반복 차단

| 항목 | 현행 규격 |
|---|---|
| 재현 | 종료 버튼에서 Enter를 유지하면 확인창 취소 버튼으로 반복 keydown이 전달되어 창이 즉시 닫힘 |
| 수정 | #delConfirmModal keydown에서 repeat이며 key가 Enter 또는 공백이면 preventDefault/stopPropagation 후 반환. 키를 놓고 다시 누르는 기본 버튼 활성화는 유지 |
| 범위 | 종료·캐릭터 삭제 공용 확인창. 기존 Tab 초점 순환/Escape 취소,게임패드,비동기 중복 제출 방지 유지 |
| 검증 | 신규 Enter/Space 회귀2개는 수정 전 실패 후 통과. 관련20개 테스트 통과. Chromium 실제 키 입력으로 Enter 반복2회에도 확인창 유지·취소 초점·종료0회,해제 후 Tab/Enter는 종료 stub1회 확인. 실제 앱 종료·삭제 미실행 |
| 기록 | tmp/lobby-confirm-repeat/browser-report.json 및 changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 하단 정렬 및 전원 아이콘 종료 버튼

| 항목 | 현행 규격 |
|---|---|
| 사용자 확정 | 게임 종료 글자 버튼을 전원 종료 모양 아이콘으로 교체 |
| 아이콘 | #lobbyQuitBtn 내부 인라인 SVG viewBox0 0 24 24,표시20×20,stroke currentColor/1.8,둥근 선 끝. 버튼36×36,padding7px,원형 border-radius50%,border1px #77604766,배경#100d0e80,색#b8a386 |
| 상호작용 | hover/gp-hover 색#f1b6a2,테두리#bd795b,배경#52261f66. 기존 종료 확인창 및 키보드·패드 동작 유지 |
| 언어·접근성 | SVG aria-hidden=true/focusable=false. 버튼 aria-label/title은 한국어 게임 종료,번역값 또는 영어 Quit Game. _applyLobbyLang에서 textContent 교체 대상에서 제외하고 속성만 갱신하여 SVG 보존 |
| 하단 정렬 | .lobby-corner-actions flex1 1 auto/min-width0,줄바꿈 제거. 양쪽 버튼 flex0 0 auto/white-space nowrap. 버전 min-width0/overflow hidden/text-overflow ellipsis/white-space nowrap/margin-top0/text-align right,실제 버전 전체 문구는 title에 저장 |
| 검증 | 실제 HTML/CSS에서1920×1080,960×540,640×480,480×360 모두36×36 아이콘 화면 안. 한국어/영어 속성 갱신 후 SVG1개 유지. 이전 영문 텍스트 버튼640px창 높이74px/시네마틱 두줄 문제도 해소. 실제 종료 미실행 |
| 기록 | tmp/lobby-footer-fit/power-after.png,power-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 게임패드 연결 표시와 전원 버튼 겹침 제거

| 항목 | 현행 규격 |
|---|---|
| 재현 | 기존 fixed right14px/bottom12px/24px 🎮 표시가960×540에서 전원 버튼 영역과 겹침 |
| 배치 | 로비 display:flex일 때 _gpDot이 #lobbyCornerActions의 #lobbyQuitBtn 앞에 표시 노드를 이동. 로비 밖은 body로 복귀하여 기존 fixed 위치 유지. 연결 상태가 같아도 화면 전환에 따른 부모 이동은 수행 |
| 로비 표시 | position:static!important,flex0 0 auto,font-size18px!important,line-height1,width24px,text-align center. 기존 하단 gap12px로 전원과 분리 |
| 연결 해제 | hidden=true 및 opacity0,다시 연결 시 hidden=false/opacity1. aria-hidden=true와 기존 pointer-events:none 유지,Tab 대상 아님 |
| 검증 | 실제 HTML/CSS 및 실제 _gpDot 함수 격리 실행. 1920×1080,960×540,640×480,480×360 모두 겹침·가로 넘침 없음,전원과12px 간격. 연결 해제 공간 반환,로비 밖 body 이동 및 동일 연결 상태에서 로비 복귀 확인. 실물 패드 검증 아님 |
| 기록 | tmp/lobby-pad-indicator/after.png,report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 종료 확인창 초점 복귀 일치

| 항목 | 현행 규격 |
|---|---|
| 재현 | 패드의 programmatic click은 DOM 초점을 옮기지 않아 종료창 취소 후 이전 언어 select로 초점이 복귀함 |
| 수정 | _showLobbyQuit 진입 시 #lobbyQuitBtn.focus({preventScroll:true}) 후 공용 확인창을 열어 실제 실행 버튼을 복귀 대상으로 저장 |
| 유지 | 삭제 확인창의 복귀 규칙과 종료 확인/취소 동작 유지. 스크롤 위치를 변경하지 않음 |
| 검증 | 신규 회귀 수정 전 실패 후 통과,확인창·캐릭터 동기화13개 통과. Chromium에서 언어 select 초점→프로그램 클릭→Escape 후 lobbyQuitBtn 복귀/종료0회 확인. 확인창960×540,640×360,360×280 모두 화면 내 |
| 기록 | tmp/lobby-quit-focus/report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 상태 안내 고정 노출

| 항목 | 현행 구현 |
|---|---|
| 재현 | 960×540에서 카드3개 및 scrollTop0일 때 lobbyStatus 하단487px가 스크롤 패널 하단474px를 넘어 안내가 잘림 |
| 위치 | #lobbyStatus를 .lobby-content 밖, .lobby-bottom-actions 바로 앞으로 이동. 카드 스크롤 위치와 독립적으로 표시 |
| 규격 | line-height1.5,max-height min(80px,20dvh),overflow-y auto,overflow-wrap anywhere,flex0 0 auto. 기존 글꼴.75rem/padding8px/role status/aria-live polite 및 리프 갱신 유지. :empty display none으로 빈 공간 제거 |
| 긴 안내 | 상한을 넘는 문구는 안내 자체에서 스크롤. 하단 전원 버튼 위치 보존 |
| 검증 | 실제 HTML/CSS 1920×1080,960×540,640×360 × 빈문구/21자안내/450자오류 총9조건에서 가로 넘침 없음·안내 영역 및 전원 화면 내. 빈 상태높이0,긴 안내높이80/80/72px 및 내부스크롤. 캐릭터 동기화·삭제 실패 회귀8개 통과 |
| 기록 | tmp/lobby-notice-visible/report.json,after.png,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 상태 안내 교체 시 읽기 위치 초기화

| 항목 | 현행 규격 |
|---|---|
| 재현 | 긴 오류를 스크롤한 뒤 새 오류로 교체해도 scrollTop260px가 유지되어 새 안내 첫 문장이 보이지 않음 |
| 수정 | setStatus의 status/lobbyStatus 리프에서 textContent가 새 메시지와 다를 때만 교체하고 scrollTop0. 동일 문구는 노드·스크롤을 유지하고 error 클래스만 갱신 |
| 유지 | 자식 노드가 있는 컨테이너는 수정하지 않는 기존 DOM 보호 유지. 생성창·로비 모두 적용 |
| 검증 | 신규 회귀 수정 전 실패 후 통과. 캐릭터 동기화/확인창 포함14개 통과. 실제 Chromium 새 내용 교체 시 scrollTop0,동일 내용 재설정 시120 유지 확인 |
| 기록 | tmp/lobby-status-reset/report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 종료 상태 안내 언어 갱신

| 항목 | 현행 규격 |
|---|---|
| 수정 | setStatus는 기존 문자열 외에 {ko,en} 메시지를 지원. _localizedStatus에 메시지·오류 여부를 보관하고 현재 언어가ko이면 한국어,그 외에는 기존 영어 fallback 사용 |
| 전환 | _applyLobbyLang에서 _refreshStatusLanguage 호출. 현재 보관된 번역 가능 안내만 다시 표시. 일반 문자열·빈 메시지로 교체하면 메타데이터 제거하여 이전 안내 복원 방지 |
| 적용 | 브라우저 탭 직접 닫기 안내와 게임 종료 실패 안내. 서버 오류 원문은 번역하거나 제거하지 않음. 다른 언어에 신규 번역을 추가한 것은 아님 |
| 안전성 | 초기 언어 적용 시 _refreshStatusLanguage는 document.getElementById를 사용하여 뒤에서 선언되는 $ 참조를 피함. 자식 노드 보호·내용 변경 시 scrollTop0·같은 내용 읽기 위치 유지 |
| 검증 | 언어 왕복/오류 스타일 유지/서버 오류 보존/빈 문구/초기 DOM 헬퍼 미선언 회귀 포함17개 통과. 별도 기존 선택정보·언어 팝업9개 통과 |
| 기록 | tmp/lobby-status-language/changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 낮은 로비 로딩 여백 압축

| 항목 | 현행 구현 |
|---|---|
| 재현 | 960×540 로비 초기 로딩 상태에서 입장 버튼 하단548.33px이 내부 패널 하단474px을 넘어 잘림. sticky 버튼은 배너를 덮어 불채택 |
| 원인 | .no-chars 로딩 문구 위아래40px과 헤더/구분선/배너 간격 누적. 480px 높이에서는 외부 ui-refinement.css가 로고 구분선80px!important로 덮어씀 |
| 높이680px 이하 | .no-chars padding4px 20px,헤더/구분선 margin-bottom4px,배너 위아래 padding4px,mid-area padding-top0. 로딩 빈 공간만 압축하고 입장 버튼 이미지는 기존 반응형 크기 유지 |
| 높이480px 이하 | #lobby .lobby-right .lobby-divider height52px!important로 외부 스타일 우선순위 해결, .no-chars padding0 20px |
| 범위 | 로비 초기 로딩 텍스트와 짧은 화면의 간격. 캐릭터3개 등 내용이 화면보다 길면 기존 .lobby-content 내부 스크롤 유지 |
| 검증 | 실제 index.html 및 외부 CSS 재로딩 후1920×1080,1280×720,960×540,800×480,640×480에서 Steam 배너·입장 버튼 초기에 모두 표시,가로 넘침 없음. 480×360은 내부 스크롤 필요·가로 넘침 없음 |
| 기록 | tmp/lobby-loading-compact/after.png,report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 전원 아이콘 터치 영역 확대

| 항목 | 현행 규격 |
|---|---|
| 원인 | 로비 전원 버튼이 터치 환경에도36×36px로 남아 기존 카드 내비·삭제44×44px 규격보다 작음 |
| 조정 | @media(pointer:coarse) #lobbyQuitBtn width44px,height44px,min-height44px,padding11px. 기존20×20px SVG·원형·종료 확인 동작 유지 |
| 동시 배치 | 터치 전용 로딩 문구 padding0 20px 및 하단 액션 padding-top0으로 추가8px 높이를 흡수. 기존 버튼 배율·본문 배너를 줄이지 않음 |
| 검증 | Chromium hasTouch 환경에서 pointer:coarse=true 확인. 1280×720,960×540,800×480,640×480에서 전원44×44px,전원·입장 버튼 초기 화면 내,횡넘침 없음. 실제 터치 기기 검증은 아님 |
| 기록 | tmp/lobby-power-touch/after.png,report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 선택 직업명 영문 대체 문구

| id | 한글 키 | 영문 기본값 | 표시 위치 |
|---|---|---|---|
| CHAR_VISUALS[0] | 전사 | Warrior | #charDispSub, _TL(_vi.job) |
| CHAR_VISUALS[1] | 블레이드 댄서 | Blade Dancer | #charDispSub, _TL(_vi.job) |

기존 _LOBBY_EN에 두 키를 추가한다. 한국어에서는 원문을 유지하고 영문에서는 번역을 사용한다. 다른 언어 전용 키가 없으면 기존 _TL의 영문 fallback을 사용하며, 각 언어 번역 완료로 간주하지 않는다. 캐릭터 데이터·영상·생성 가능 여부는 변경하지 않는다. 실제 _TL 함수와 영문 테이블 회귀 테스트 5개 통과. tmp/lobby-job-translation/changes.patch에 변경 기록, 기존 Git 쓰기 제한으로 커밋 미완료.


## 2026-09-28 좁은 캐릭터 카드 정보 재배치

| 항목 | 현행 규격 |
|---|---|
| 원인 | 640×480 카드에서 이름과 직업 배지가 같은 행을 나눠 사용하여 이름폭25px/직업33px로 한두 글자만 표시 |
| 기준 | #lobby .char-list container-type:inline-size/container-name:lobby-cards. 열 폭300px 이하에서만 재배치,넓은 열 기존 한 줄 유지 |
| 좁은 카드 | 왼쪽padding12px,gap10px,초상화40×40px. 이름행 column/align-start/gap2px,이름 font.9rem/line-height1.2,width100%. 직업 max-width100%/line-height1.2. 텍스트 gap2px,진행정보 font.65rem/line-height1.3 |
| 유지 | 카드 높이84px,이름·직업 말줄임,이름 title 및 삭제 영역 desktop48px/coarse64px 유지 |
| 검증 | 실제 HTML/CSS 영문8글자 이름·Blade Dancer 카드로1280/960/800/640 화면 확인. 좁은800/640 이름폭169.36/97.36px,텍스트 카드 안·삭제와10px 간격.640×480 터치 에뮬레이션에서도 삭제44×44px·간격10px·텍스트 카드 안 확인 |
| 기록 | tmp/lobby-narrow-cards/after.png,report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 캐릭터 카드 전체 정보 안내

| 항목 | 현행 규격 |
|---|---|
| 원인 | 카드 전체를 덮는 .char-select의 안내는 이름·직업만 포함하여 말줄임된 진행 정보는 전체 확인 불가. 개별 리프 title은 위의 버튼 때문에 마우스 대상이 아님 |
| 수정 | _addLobbyCardControl에서 .char-info 리프의 trim한 텍스트를 읽어 기존 label 뒤에 구분자 · 와 함께 추가. 실제 선택 버튼 title과 aria-label에 동일한 전체 설명 적용 |
| 범위 | 온라인·로컬 공통 카드. 진행 정보 없는 생성 카드는 기존 label 유지. DOM 내용·카드 크기·클릭/삭제 동작 변경 없음 |
| 검증 | Chromium640×480 실제 선택 버튼이 진행 정보 위의 마우스 대상임을 확인. tooltip/aria에 이름·Blade Dancer·Lv.99·Chapter7 전체 포함,자식 이름 노드 유지. 선택정보·패드 회귀13개 통과 |
| 기록 | tmp/lobby-card-full-info/changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 삭제 취소 후 실제 실행 버튼으로 복귀

| 항목 | 현행 규격 |
|---|---|
| 재현 | 패드 X가 삭제 버튼 click을 프로그램으로 실행하면 기존 DOM 초점이 언어 메뉴 등에 남아 취소 후 엉뚱한 메뉴로 복귀 |
| 수정 | 온라인·로컬 카드 삭제 click 핸들러가 e.currentTarget.focus({preventScroll:true}) 후 _showDelConfirm 호출. 기존 공용 복귀 처리로 방금 삭제를 요청한 버튼에 복귀 |
| 유지 | 삭제 요청·확정·취소·버튼 크기·키보드/패드 행동 유지. 초점 이동 자체로 스크롤을 바꾸지 않음 |
| 검증 | 신규 온라인/로컬 회귀2개 수정 전 실패→통과. 실제 이벤트 앞부분 및 확인창을 Chromium에 격리 실행,언어 select 초점에서 프로그램 클릭→Escape 후 각 삭제 버튼 복귀/삭제 콜백0회. 확인창·캐릭터 동기화·패드26개 통과 |
| 테스트 보완 | characterSync 테스트의 빈 카드 DOM에 querySelector(null) 동작을 추가하여 앞선 전체 카드 정보 안내와 호환. 실제 삭제 API 호출 없음 |
| 기록 | tmp/lobby-delete-focus/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 게임패드 사용 불가 카드 제외

| 항목 | 현행 계약 |
|---|---|
| 원인 | 빈 슬롯 및 생성 한도에 도달한 새 캐릭터 카드는 inline pointer-events:none이지만 기존 패드 수집은 offsetParent만 검사하여 동작 없는 칸에 정지 |
| 대상 수집 | _navItems는 offsetParent===null 또는 el.style.pointerEvents===none인 요소를 제외. 온라인·로컬 공통 빈 슬롯과 생성 불가 카드,기존 숨김/disabled 버튼 제외 유지 |
| 강조 정리 | 이전 _GP.prev._lobbyEl이 새 cur.el과 다르면 gp-hover·inline outline·outlineOffset을 제거. 같은 요소의 인덱스만 바뀌면 강조선 유지 |
| 검증 | 신규4회귀 수정 전 실패→수정 후 통과. 카드 사이 비활성 칸 건너뛰기 및 선택 중 비활성화 확인. 탐색·확인창·캐릭터 동기화30개 통과. Chromium800×480 실제 로비 DOM/탐색 함수에서 usableFirst→usableLast,빈 칸 강조 없음·비활성 카드 강조선 제거 확인. 실물 패드 미검증 |
| 기록 | tmp/lobby-gamepad-disabled/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |

## 2026-09-28 장비 기사·아이템 박스 확대

| 항목 | 현행 규격 |
|---|---|
| 대상 | 메인 game.html 장비창. 원래 회색 기사와 16개 장착 슬롯 유지 |
| 장비판 | 654×560px. 슬롯 좌표는 인벤토리 시스템 문서 EQ_POS 표가 기준 |
| 기사 | 385×560px, 이전 210×320px 대비 폭83.3%·높이75% 확대. contain·opacity 1·normal 합성. 최종 필터 brightness1.65/contrast1.02 |
| 슬롯·스킨 | 클릭96×96px·장식96×128px. 승인 프레임 ossuary_socket_hf_v2.png를128×128px 중앙 표시, ::before inset−16px 0. 스킨62×62px(left17/top12), 이름 띠13px(left/right19/bottom12)·글자10px. 등급 하단6px 마름모, 선택 프레임 brightness1.5/saturate1 |
| 배율 | ResizeObserver로 장비 패널 clientWidth=W/clientHeight=H 측정. max(.1,min(2.1,(W-36)/654,(H-98)/560))를 inline zoom에 적용. 숨김 W/H=0이면 보류. 기사·슬롯·아이콘·라벨 공통 배율 |
| 배경·비율 | 역 U자·원형 문양 모두 제거. 장비판은 낮은 대비 금속 표면과 기사 발 아래 낮은 타원 받침. 1201px 이상 장비:가방:정보=1.25:1.1:.85, 간격10px. 하단 현황은 구분선으로 정리 |
| 캐시·빌드 | game.html: ui-refinement.css?v=20260928-equipment-stage3, inventory-space.css?v=20260928-relic-frame1, inventory-paperdoll.js?v=20260928-equipment-cutout3. NW.js FILES에 inventory-paperdoll.js·knight-portrait.css 추가 |
| 검수 | 최신2190×721·2194×1234 CSS 화면에서16슬롯 경계 및 하단 현황 침범0·중심 hit16/16. 실제 무기 호버로 우측 상세 갱신. 원래 기사 어두운 갑옷 보존 실화면 확인. 패키지 빌드 미실행 |
| 동기화 | 관련 docs 전체 검색과 인벤토리/UI 문서 동기화 완료. 다른 작업의 변경은 유지하고 장비창 관련 파일만 로컬 체크포인트에 포함 |


## 2026-09-28 데모 로비 자동 선택 유지

| 항목 | 현행 계약 |
|---|---|
| 원인 | _renderSlotList의 데모 분기가 고정 캐릭터를 선택한 뒤 loadLocalCharacters의 마지막 _updateCharDisplay()가 표시·영상·입장 버튼을 다시 초기화. _selectedSlot=demo와 active 카드만 남아 표시와 불일치 |
| 초기화 순서 | loadLocalCharacters 시작에서 _selectedSlot/_selectedSlotName=null 및 _updateCharDisplay()로 이전 선택 초기화. 로딩 완료 후 _renderSlotList만 호출하며 뒤의 중복 초기화 제거 |
| 데모 | _renderSlotList가 _selectedSlot=demo,_selectedSlotName=demo,_updateCharDisplay({name:DEMO CHARACTER,charIdx:0,stage:0})를 적용. 로딩 후 active 플레이어 기록 카드·선대 소환체 이름/설명·독립 스프라이트/배경 영상·enabled ENTER/점등 유지 |
| 일반 로비 | 자동 선택 추가 없음. full 로컬 목록은 초기화 상태로 렌더하며 사용자가 선택하기 전 입장 disabled/소등 유지. 온라인 동작 변경 없음 |
| 검증 | 데모 서버 성공/브라우저 저장 폴백2회귀 수정 전 실패→통과 및 full 선택 초기화1건 추가. 개발 슬롯·데모 경로·선택 정보·캐릭터 동기화28개 통과. Chromium960×540 실제 HTML/CSS/함수 격리 실행에서 demo/full×서버 성공/실패4건,선택·제목·배경·ENTER disabled/filter 일치 확인 |
| 범위·기록 | 사용자 저장 데이터 수정·실제 게임 입장·패키지 갱신/업로드 없음. tmp/lobby-demo-selection/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 목록 모드 전환 시 휠 충돌 제거

| 항목 | 현행 계약 |
|---|---|
| 원인 | 로컬 _renderSlotList가 #charList 부모에 _wheelBound로 wheel을 영구 연결. 온라인 전환 후 .char-scroll-vp wheel 이벤트가 부모로 전파되면 오래된 로컬 핸들러도 실행하여 온라인 카드가 로컬 카드로 교체 |
| 수정 | 로컬 wheel을 현재 렌더한 vp(.char-scroll-vp)에 연결,온라인과 동일 범위. cl._wheelBound 제거. replaceChildren으로 뷰포트가 교체되면 이전 핸들러도 현재 목록 이벤트 경로에서 제외 |
| 입력 범위 | 캐릭터 카드 뷰포트 위에서 목록 이동. 고정 생성 카드·화살표 등 뷰포트 밖의 휠은 본문 스크롤로 전달. 시작/끝/deltaY0은 preventDefault하지 않음. Math.sign(deltaY),현재 _localSlots 길이 및 VIEW2 유지 |
| 검증 | 신규2회귀 수정 전 실패→통과. 로컬→온라인 전환 후 휠1회가 온라인 인덱스만 이동,로컬 인덱스0 유지. 로컬 왕복/끝 경계 기본 스크롤 확인. 슬롯·패드 탐색·캐릭터 동기화·데모 경로37개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/렌더러 격리 실행. 버블링 WheelEvent로 수정 전 online1/local1·local-1,local-2 표시 재현→수정 후 online1/local0·online-1,online-2 표시. 계정/저장 API 호출 없음 |
| 기록 | tmp/lobby-wheel-scope/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로컬 목록 응답 순서 보호

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | loadLocalCharacters에 요청 순서 검사가 없어 이전 API 성공·실패가 최신 _localSlots와 카드 DOM·개발자 표시를 덮어씀. 선택 id/표시는 최신 상태로 남고 목록만 옛 데이터/빈 목록이 되는 불일치 |
| _characterLoadSeq | 로비 공용 선택 상태 옆에 var로 선언,초기값0. loadCharacters/loadLocalCharacters 진입마다 request=++_characterLoadSeq를 캡처 |
| API 성공 | await res.json() 완료 직후 request!==_characterLoadSeq이면 return. 최신 요청만 _localSlots 및 _developerSlots를 반영하고 렌더 |
| API 실패 | catch 진입 즉시 같은 순서 검사. 오래된 fetch/JSON 오류는 localStorage 폴백·배열 초기화·표시 갱신 없이 return. 최신 실패의 기존5칸 폴백은 유지 |
| 선택 상태 | 최신 목록에서 선택한 카드가 이전 응답으로 교체되지 않음. 목록 조회 시작의 선택 초기화·데모 자동 선택·최신 요청 렌더 규칙은 유지 |
| 테스트 | 오래된 성공/fetch 실패/JSON 실패 및 JSON 파싱 지연4회귀 수정 전 실패→통과. 개발 슬롯·캐릭터 동기화·데모 경로·패드 탐색41개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/함수 격리 실행에서 두 요청 완료 순서 역전 후 최신 카드 선택. 수정 전 성공은 old 카드/active 없음,실패는 빈 목록/active 없음으로 재현. 수정 후 두 상황 모두 latest 카드·active·선택 이름·ENTER 활성·개발자 표시 유지 |
| 범위·기록 | 현행은 공용 _characterLoadSeq로 온라인/로컬 요청 간 늦은 응답까지 차단. 실제 네트워크 취소는 하지 않음. 사용자 저장·실계정 API 변경 없음. tmp/lobby-local-load-order/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 온라인·로컬 목록 요청 번호 통합

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 기존 모드별 요청 번호는 같은 모드의 역전만 차단. 반대 모드 목록을 불러온 뒤 이전 성공·오류가 도착하면 카드 목록만 이전 모드로 바뀌고 선택 이름/ENTER는 현재 상태로 남음 |
| _characterLoadSeq | index.html 로비 선택 상태 옆의 공용 var,초기값0. loadCharacters/loadLocalCharacters 모두 시작 시 request=++_characterLoadSeq 캡처. 기존 _onlineLoadSeq/_localLoadSeq 선언 제거 |
| 온라인 반영 | request!==_characterLoadSeq 또는 계정 없음/조회 당시 userId와 다르면 무시. 서버 성공 및 error 메시지 출력 전에 검사. 기존 계정 소유 확인 유지 |
| 로컬 반영 | JSON 파싱 완료 후 및 catch 진입 시 같은 공용 번호 검사. 이전 fetch/JSON 실패는 폴백·렌더 없이 반환. 최신 요청의 개발 플래그 및5칸 폴백 유지 |
| 모드 전환 | 반대 모드의 새 목록 요청 자체가 이전 요청을 무효화. 기존 모드 내 늦은 응답 보호도 동일 번호로 유지. 네트워크 요청 자체를 중단하거나 로그인/시네마틱 전환만으로 취소하는 기능은 추가하지 않음 |
| 검증 | 로컬→온라인/온라인→로컬×이전 성공/실패4회귀 수정 전 실패→통과. 슬롯·캐릭터 동기화·데모 경로·패드 탐색45개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/함수 격리 실행 전후8조건. 수정 전 반대 모드 카드/빈 목록·active 없음 재현. 수정 후 현재 카드·active·선택/표시 이름·ENTER 활성·모드에 맞는 개발자 표시 유지 |
| 범위·기록 | 실계정/저장 API 및 사용자 저장 데이터 변경 없음. tmp/lobby-list-mode-order/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 이탈 후 목록 응답 무효화

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 목록 대기 중 로그인/시네마틱으로 이동해도 번호가 유지되어 늦은 응답이 숨긴 로비를 재렌더. 데모에서는 자동 선택·ENTER 활성·캐릭터 영상 표시를 다시 켬 |
| _goLogin | 함수 진입 직후 ++_characterLoadSeq. 로그인 화면·시네마틱 handoff·언어·데모 입장 버튼 등 기존 전환 유지 |
| _goCinematic | 함수 진입 직후 ++_characterLoadSeq. 기존 영화 초기화·다시보기·화면 전환 유지 |
| 응답 | 기존 loadCharacters/loadLocalCharacters의 공유 번호 검사로 이탈 전 대기 요청을 무시. 실제 네트워크 중단 없음. 새 로비 진입에서 다시 요청하면 정상 렌더 |
| 테스트 | 실제 두 전환 함수×온라인/로컬×성공/오류8회귀,완전한 전환용 DOM/타이머 대역에서 수정 전8실패→수정 후통과. 목록·캐릭터 동기화·데모·패드·영화 handoff55개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/함수 격리 실행,두 전환×데모 성공/오류 전후8조건. 수정 전 숨긴 로비의 demo 선택·영상 show·입장 활성 재현→수정 후 카드 DOM 유지·선택 null·영상 show 없음·입장 disabled 유지 |
| 범위·기록 | 현행 _goLogin/_goCinematic은 선택 상태와 로비 영상 src/poster를 정리. 로비 로딩 후처리도 현재 _characterLoadSeq와 lobby 표시 상태를 검사. 실제 계정·저장 API/사용자 데이터 변경 없음. tmp/lobby-leave-load/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 이탈 시 선택 영상 해제

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 이미 선택한 lobbyCharPreview는 로그인/시네마틱 진입 후에도 재생. _selectedCharDisplay도 남아 언어 적용의 선택 정보 갱신이 숨겨진 영상을 다시 play할 수 있음 |
| _goLogin/_goCinematic | ++_characterLoadSeq 직후 _selectedSlot=null,_selectedSlotName=null,_updateCharDisplay() 실행. 이전 응답 무효화 및 선택/미디어 해제 |
| 영상 | 기존 _updateCharDisplay의 미선택 분기로 pause,onerror=null,show 제거,src/poster 제거,load 호출. 정적 keyart의 show/src도 제거 |
| 표시 | _selectedCharDisplay=null,ENTER disabled/소등,선택 제목/직업 초기화,디폴트 배경 복원. 저장 데이터·캐릭터 외형 에셋·원본 비율 변경 없음 |
| 재진입 | 기존 목록 조회 및 선택 경로에서 다시 영상 src/poster를 설정하고 play. 선택 언어 갱신은 _selectedCharDisplay가 null이면 영상 재생 경로에 진입하지 않음 |
| 테스트 | 실제 표시 함수 및 두 전환 함수의 영상 정지/소스 제거/선택 초기화2회귀 수정 전 실패→통과. 슬롯·캐릭터 동기화·데모·패드·영화 handoff·선택 정보62개 통과 |
| 브라우저 | Chromium960×540 실제 전사0/실버테일1 영상 time>.05s 재생 확인 후 로그인/시네마틱 전후8조건. 수정 전 paused=false/src 유지,수정 후 paused=true/src·poster null/show 없음/ENTER disabled. 선택 정보 갱신 뒤 유지 및 재선택 실제 재생8조건 확인 |
| 범위·기록 | 영상·오디오 원본 교체/생성,사용자 저장 데이터 수정 없음. 현행 로비 로딩 후처리는 현재 요청/표시 상태를 검사. tmp/lobby-leave-media/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 로딩 후처리 요청 확인

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 목록 함수가 오래된 응답을 무시해도 이를 기다린 _goLobby/showLobby가 마지막 hideLoading을 실행하여 새 요청/다른 화면의 로딩 표시까지 제거. _goLobby는 이미지16장 프리로드도 실행 |
| _goLobby | 모드별 목록 호출의 Promise를 pending에 저장한 뒤 시작된 _characterLoadSeq를 request에 캡처. await pending 후 request!==_characterLoadSeq 또는 lobby.style.display!==flex이면 반환 |
| showLobby | loadCharacters() 호출 직후 pending와 현재 request 캡처. await 후 동일 번호/로비 표시 조건 검사,통과할 때만 hideLoading |
| 후처리 | 현재 로비 진입만 hideLoading 및 _preloadLoadingImgs 실행. 숨겨진 로비/이전 진입은 로딩 DOM·프리로드에 영향 없음. 정상 온라인/로컬 진입은 기존 로딩 종료 유지 |
| 시네마틱 | fromCinematic=true의 전체 화면 로딩 로고 생략 및 목록 내 로딩 표시 유지. 기존 handoff 동작 변경 없음 |
| 테스트 | 온라인/로컬×이전 요청 완료/숨긴 로비 완료4회귀 수정 전 실패→통과 및 정상 완료2건 통과. 데모 경로·목록·동기화·영화 handoff·패드63개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/로비 진입·로딩 DOM 함수,대기 목록 Promise 격리. 전후8조건: 수정 전 이전 완료가 loading/chapterGate none·프리로드1회,수정 후 새 로딩 block 유지·프리로드0회. 최신 완료는 none·프리로드1회 확인 |
| 범위·기록 | 실계정/저장 API·사용자 데이터·로딩 에셋 변경 없음. tmp/lobby-loading-owner/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 화면 전환 시 언어 메뉴 닫기

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | body에 만든 _langPop이 화면 전환 후에도 block/_langPopOpen=true/aria-expanded=true로 남아 이전 화면 메뉴와 입력 분기를 유지 |
| 전환 | _goLogin/_goCinematic/_goLobby/showLobby 시작에서 if($('_langPop'))_closeLangPop(false) 실행 |
| 닫기 | 기존 함수의 display:none,_langPopOpen=false,원래 select aria-expanded=false 사용. restore=false로 숨겨질 select에 초점 복귀하지 않음. 탐색 인덱스를 언어 선택값으로 확정하지 않으며 change 호출 없음 |
| 초기화 순서 | 초기 오프라인/시네마틱 진입이 뒤쪽 let _langPopOpen 선언보다 먼저 실행될 수 있으므로,동적 팝업 DOM이 생성된 경우에만 닫기 호출. 팝업 없는 초기 진입에서 TDZ 접근 없음 |
| 재열기 | 기존 _openLangPop의 선택값 기준 인덱스·스틱/포인터 초기화 유지. 새 팝업 내용/탐색은 기존 경로 |
| 테스트 | 네 전환×열린 메뉴4회귀 수정 전 실패→통과,초기 메뉴 상태 선언 전 실행4건 통과. 언어 재열기/선택·데모 진입·목록·동기화·영화 handoff·패드77개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/언어 팝업/전환 함수 격리 전후8조건. 수정 전 메뉴 block/open/expanded=true 유지→수정 후 none/false/false. 선택 인덱스1 유지,change0,원래 select focus0,재열기 정상 |
| 검수 대역 | 기존 진입/영상 테스트의 자동 생성 DOM은 _langPop 미생성 시 null을 반환하도록 보완. 실제 동적 팝업 생성 계약과 일치 |
| 범위·기록 | 사용자 언어·저장 데이터 변경 없음. tmp/lobby-language-transition/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 호버음 소스 정리와 이탈 진동 종료

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | _stopHover가100ms 뒤 전역 _hoverSrc.stop()을 호출하나 즉시 참조를 null로 초기화하여 기존 소스가 종료되지 않음. 새 호버가 시작되면 지연 콜백이 새 소스를 종료. 로그인/시네마틱 이탈은 호버음·패드 반복 진동 정리 누락 |
| _stopHover | 호출 당시 src=_hoverSrc,gain=_hoverGain 캡처. 기존0.08초 fade/100ms 지연 유지. 콜백은 캡처한 src.stop/src.disconnect 및 gain.disconnect만 실행,각 실패 독립 catch. 전역 참조 즉시 null 유지 |
| _goLogin/_goCinematic | 진입 시 try _stopHover/catch 및 사용 가능한 _GP.vibLoopStop 실행. 기존 선택 영상/응답/언어 메뉴 정리 유지. 로비 BGM 정책 및 영화 음량 변경 없음 |
| 초기화 | 초기 동기 진입은 뒤쪽 let 호버 상태 선언 전일 수 있으므로 기존 호출 패턴처럼 try/catch. 아직 재생 소스가 없는 부트에서 전환 중단 없음. 패드 객체/메서드 없는 검수 환경도 허용 |
| 테스트 | 소스 종료·이전 fade가 새 소스를 정지하지 않음·두 전환 호버/진동 정리4회귀 수정 전 실패→통과,호버 초기화 전 전환2건 통과. 언어·데모·목록·동기화·handoff·패드83개 통과 |
| 브라우저 | Chromium960×540 실제 정지/전환/패드 루프 함수와 gain0 무음 AudioBufferSourceNode로 전후6조건. 수정 전 rapid hover는 old ended=false/new=true,이탈은 반복 진동9회까지 증가. 수정 후 old=true/new=false,이탈 loop없음·추가 진동 없음·소스 참조 해제. 실물 패드 진동 검증은 아님 |
| 범위·기록 | 사용자 오디오 청취·실물 패드 실행·음원 교체 없음. tmp/lobby-hover-cleanup/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 패드 연결 해제 피드백 정리

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | index.html gamepaddisconnected는 connected/active/vibRef만 초기화하여 cursor:none,inputMode=pad,스틱 값,진동 interval,호버음,이전 카드 강조가 남음 |
| 연결 상태 | 기존 connected=false,active=false,vibRef=null 유지. _GP.axes=[0,0,0,0]으로 잔여4축 초기화 |
| 피드백 | _GP.vibLoopStop 및 try _stopHover/catch 실행. 반복 진동 interval 해제,기존 캡처 소스 정지 경로 사용 |
| 강조 | _GP.prev._lobbyEl이 있으면 gp-hover·outline·outlineOffset 제거. prev._lobbyEl 및 prev._lobbyIdx 삭제하여 재연결의 새 강조/피드백 갱신 허용 |
| KBM 복귀 | document.body.style.cursor=빈 문자열,localStorage inputMode=kbm. 선택 캐릭터와 ENTER 활성 상태는 변경하지 않음 |
| 테스트 | 커서/KBM,반복 피드백/스틱,이전 강조/재연결3회귀 수정 전 실패→통과. 패드·handoff·언어·데모·목록·동기화86개 통과 |
| 브라우저 | Chromium960×540 실제 DOM/패드 관리자/연결 이벤트/로비 탐색 함수 모의 실행. 수정 전 cursor none/loop/강조/4축 잔류→수정 후 커서/KBM·loop 없음·강조 제거·4축0. 재연결 후 ENTER 선택에서 hoverStarts1/loop/강조 복구 확인. 실물 연결·진동 검증은 아님 |
| 적용 범위 | index.html 로비의 명시적 gamepaddisconnected와 _gpGlobalPoll의 no-gamepad 경로. game.html의 주입 키·폴링상 일시 소실 정책은 기존대로 유지 |
| 기록 | tmp/lobby-pad-disconnect/browser-report.json,reconnect-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |

## 2026-09-28 로비 게임패드 폴링 소실 정리

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | _gpGlobalPoll은 navigator.getGamepads()에서 연결된 패드를 찾지 못하면 즉시 return하여 gamepaddisconnected 이벤트를 놓친 BT/절전 소실에서 cursor:none, inputMode=pad, 4축, 진동 루프, 호버음, 이전 카드 강조가 남았다. |
| 공용 정리 | _resetDisconnectedPadState가 connected/active/vibRef를 초기화하고 axes=[0,0,0,0], vibLoopStop, 호버음 정리, 이전 카드 gp-hover/outline/outlineOffset 제거, prev 버튼·방향·카드 래치 전체 초기화, cursor 복구, inputMode=kbm을 수행한다. |
| 이벤트·폴링 | gamepaddisconnected와 _gpGlobalPoll의 no-gamepad 경로가 같은 공용 정리를 사용한다. 폴링에서는 관련 상태가 하나라도 남을 때만 호출하여 패드 없는 프레임마다 호버 정리와 저장 쓰기를 반복하지 않는다. |
| 재연결 | 기존 gamepadconnected가 connected/vibRef를 다시 설정한다. 다음 실제 패드 입력의 로비 탐색이 새 강조와 피드백을 시작한다. |
| 테스트 | no-gamepad 폴링 소실의 상태 정리와 무패드 연속 프레임 idempotent 회귀 2건은 수정 전 실패했고 수정 후 통과했다. 패드, handoff, 언어, 데모, 목록, 동기화 88건이 통과했다. |
| 브라우저 | Chromium 960×540 실제 로비 DOM과 _gpGlobalPoll을 getGamepads 빈 배열 대역으로 실행했다. 수정 전 상태·커서·강조·루프가 두 프레임 유지되고, 수정 후 connected/active false, 4축 0, loop/이전 강조 없음, cursor 복구, KBM, 호버 정리 1회와 두 번째 프레임 동일을 확인했다. 실물 BT/절전 소실 검증은 아니다. |
| 적용 범위 | index.html 로비 글로벌 패드 폴링과 명시적 연결 해제. game.html의 키 주입과 독립 폴링 정책은 변경하지 않는다. |
| 기록 | tmp/lobby-pad-poll-loss/browser-report.json. 기존 Git 쓰기 제한으로 커밋 미완료. |

## 2026-09-28 로비 패드 재연결 첫 입력 정리

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 연결 해제 뒤 _GP.prev에 이전 장치의 버튼 pressed 상태와 방향 래치가 남으면, 새 패드가 버튼을 누른 상태로 재연결될 때 just 입력이 false가 될 수 있었다. |
| 정리 | _resetDisconnectedPadState는 카드 강조 참조만 지우지 않고 _GP.prev 전체를 새 객체로 초기화한다. |
| 재연결 | 다음 _gpGlobalPoll은 새 장치의 pressed 버튼을 이전 상태 없음으로 비교하므로 첫 프레임의 just 입력을 정상 전달한다. |
| 회귀 | polling loss 뒤 prev[0]과 _lobbyDir이 비워지고, A 버튼을 누른 새 패드의 첫 폴링이 just[0]=true가 되는 테스트를 추가했다. 수정 전 실패, 수정 후 통과. |
| 적용 범위 | index.html 로비의 명시적·폴링 연결 해제 공용 정리. game.html 입력 계약은 변경하지 않는다. |

## 2026-09-28 로비 포인터·키보드 패드 피드백 해제

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | mousemove와 keydown은 _GP.active와 입력 모드만 KBM으로 돌려, 이전 gp-hover 강조와 반복 진동, 호버음이 로비에 남았다. |
| 공용 피드백 정리 | _clearGamepadFeedback이 vibLoopStop, 호버음 정지, 이전 카드 gp-hover·outline·outlineOffset 제거, _lobbyEl/_lobbyIdx 삭제를 수행한다. |
| KBM 전환 | _leaveGamepadInput이 active=false, 공용 피드백 정리, cursor 복구, inputMode=kbm을 한 번에 수행한다. 마우스 이동 임계값 기존 3초과와 _fromGp가 아닌 키보드 입력 조건은 유지한다. |
| 연결 해제 | _resetDisconnectedPadState는 축0·연결 참조 해제 후 _leaveGamepadInput을 호출하고 prev 전체를 초기화한다. |
| 회귀 | mousemove와 keydown 각각에서 active false, 반복 진동 종료, 호버음 1회 정지, 강조 제거, KBM/커서 복구를 확인하는 2건을 추가했다. 수정 전 실패, 수정 후 통과. |
| 적용 범위 | index.html 로비 입력 방식 전환. game.html 입력 계약과 선택 캐릭터 상태는 변경하지 않는다. |

## 2026-09-28 로비 다중 패드 주 입력 유지

| id / 위치 | 현행 계약 |
|---|---|
| 연결 | gamepadconnected는 vibRef가 없을 때만 새 패드를 초기 진동 대상으로 저장한다. 뒤늦은 보조 패드 연결이 현재 주 패드의 피드백 대상을 바꾸지 않는다. |
| 폴링 | _gpGlobalPoll이 navigator.getGamepads의 첫 connected 패드를 입력 주체와 vibRef로 함께 설정한다. 입력과 진동 대상이 일치한다. |
| 해제 | gamepaddisconnected는 보조 패드 해제면 주 패드의 active, 축, 커서, 강조, 반복 진동을 유지한다. 주 패드 해제면 남은 패드로 연결만 넘기고 이전 입력 상태를 초기화한다. |
| 마지막 해제 | 남은 connected 패드가 없을 때만 기존 _resetDisconnectedPadState 공용 정리를 수행한다. |
| 회귀 | 주 패드 연결 뒤 보조 패드 연결·해제에서 vibRef=주 패드, connected/active/축 유지, KBM 전환 없음 1건을 추가했다. 수정 전 실패, 수정 후 통과. |
| 적용 범위 | index.html 로비의 브라우저 Gamepad API 연결·폴링 경로. game.html의 입력 계약은 변경하지 않는다. |

## 2026-09-28 로비 주 패드 교체 입력 초기화

| id / 위치 | 현행 계약 |
|---|---|
| 구분 | gamepaddisconnected의 이벤트 패드가 vibRef와 같은 index 또는 같은 객체이면 주 패드 손실로 판단한다. 다른 패드면 보조 패드 해제다. |
| 주 패드 교체 | _handoffConnectedPadState가 남은 패드를 connected/vibRef로 설정하고 axes=[0,0,0,0], active=false, 호버·반복 진동·강조 종료, cursor 복구, inputMode=kbm, prev 전체 초기화를 수행한다. |
| 다음 입력 | 남은 패드의 다음 폴링은 새 prev 상태를 기준으로 첫 버튼 just와 활성화를 시작한다. |
| 보조 패드 해제 | 기존 주 패드의 입력·피드백 상태는 유지한다. |
| 회귀 | 주 패드 손실 뒤 보조 패드가 남는 경우 vibRef=보조, connected=true, active=false, 4축0, prev 래치 삭제, KBM 전환을 확인하는 1건을 추가했다. 수정 전 실패, 수정 후 통과. |
| 적용 범위 | index.html 로비 다중 패드 장치 전환. game.html 입력 계약은 변경하지 않는다. |

## 2026-09-28 로비 폴링 장치 교체와 KBM 복귀 유지

| id / 위치 | 현행 계약 |
|---|---|
| `_gpGlobalPoll` 연결 | 연결 이벤트 없이 첫 connected 패드를 발견해도 `_GP.connected=true`, `vibRef=gp`로 매 프레임 상태를 동기화한다. |
| 장치 교체 | 기존 `vibRef`와 현재 패드의 `index` 또는 `id`가 달라지면 버튼 비교 전에 `_handoffConnectedPadState(gp)`로 이전 축·입력 래치·호버음·반복 진동·강조를 정리한다. |
| 같은 장치 스냅샷 | 객체가 새로 만들어져도 `index/id`가 같으면 장치 교체로 처리하지 않는다. 누른 버튼을 유지한 다음 프레임은 `just=false`다. |
| 축 갱신 | 0~3번 축 모두 기존 DEAD=0.25 기준으로 매 프레임 갱신한다. 없는 오른쪽 스틱 축은 0으로 처리해 이전 값이 남지 않는다. |
| KBM 복귀 유지 | `_GP.active=false`이면 입력 샘플과 연결 표시까지만 갱신하고 UI 탐색 핸들러를 실행하지 않는다. 다음 실제 버튼·축 입력이 active=true를 설정하면 탐색을 재개한다. |
| 회귀 | 이벤트 없는 연결, 장치 교체 첫 입력·이전 피드백 종료, 같은 장치 스냅샷의 버튼 유지, 없는 축 초기화, 마우스 복귀 후 유휴 폴링·재입력의 5건. 변경 전 결함 4건 실패, 같은 장치 유지 1건 통과 → 변경 후 전체 통과. 관련 로비 회귀 98건 통과. |
| 실제 런타임 | Node 서버의 원본 index.html을 Chromium에서 실행하고 getGamepads만 대역으로 주입했다. 이벤트 없는 secondary 첫 프레임 just=true/다음 false, 축4개0, 이전 강조·루프 제거를 확인했다. 마우스 복귀 후100ms active=false/강조0/KBM, 재입력 후 active=true/강조1/커서 숨김을 확인했다. 실물 패드 검증은 별도다. |
| 화면 QA | 데모 로비 960×540, 1280×720, 1920×1080에서 가로 넘침 없음. 캐릭터 카드·입장·종료·확인/취소 버튼 모두 화면 안. 종료 팝업 기본 취소 초점과 Escape 후 종료 버튼 초점 복귀 확인. |
| 증거 | test/lobbyGamepadDeviceSwitch.test.js, tmp/lobby-pad-device-switch/browser-report.json, quit-960x540.png, quit-1280x720.png, quit-1920x1080.png. |

## 2026-09-28 로비 고정 포인터 클릭의 입력 모드 복귀

| id / 위치 | 현행 계약 |
|---|---|
| 재현 | 패드로 종료 버튼을 강조한 뒤 마우스를 같은 위치에서 클릭하면 movement 합이 3을 넘지 않아 종료창이 열려도 active=true, cursor=none, inputMode=pad와 배경 gp-hover가 남았다. |
| `pointerdown` | index.html의 window 캡처 단계에서 passive=true로 처리한다. active=true이고 이벤트가 _fromGp가 아니면 기존 _leaveGamepadInput을 실행한다. |
| 지원 입력 | mouse, touch, pen 모두 포인터 이동 여부와 무관하게 KBM 복귀, 커서 복원, 이전 강조·호버음·반복 진동 정리를 수행한다. 실제 클릭·터치의 기본 동작은 유지한다. |
| 패드 입력 | _fromGp=true인 포인터 이벤트는 패드 모드와 피드백을 유지한다. programmatic click은 pointerdown을 생성하지 않는다. |
| 회귀 | mouse/touch/pen 3건은 변경 전 실패→변경 후 통과. 패드가 만든 이벤트 보존 1건도 통과. 모달·로비 통합109건 통과. |
| 실제 런타임 | Node 서버의 원본 로비와 getGamepads 대역으로 패드 A 열기/B 취소를 확인했다. 이동 없는 마우스 클릭 후100ms active=false, cursor 복원, KBM, 배경 강조 제거와 취소 초점 확인. Escape 후 종료 버튼 복귀와 종료 호출0회 확인. touch/pen PointerEvent 전달 뒤70ms에도 active=false와 강조0 확인. 실물 패드·터치펜 검증은 별도다. |
| 증거 | tmp/lobby-pointer-takeover/mouse-after.png, browser-report.json. |

## 2026-09-28 로비·문 열림 진동의 비동기 거부 처리

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 두 playEffect 호출의 try/catch는 동기 예외만 처리했다. Promise 거부가 처리되지 않아 로비 반복 진동과 문 열림 예약 진동에서 unhandled rejection이 쌓였다. |
| `_GP.vib` | playEffect('dual-rumble', {startDelay:0, duration:dur, weakMagnitude:weak, strongMagnitude:strong})의 반환 Promise에 catch를 연결한다. 동기 예외도 기존 catch로 처리한다. |
| 문 열림 진동 | index.html의 _steps 8개 예약 콜백 안 playEffect 반환 Promise도 catch로 처리한다. 단계별 시각·기간·강도는 기존 값 그대로다. 전체 수치는 docs/6사운드디자인/6사운드디자인.md의 같은 날짜 표를 따른다. |
| 실패 정책 | 진동 실패는 게임 조작·선택·팝업 흐름을 중단하거나 추가 상태 문구를 표시하지 않는다. 진동 지원이 없는 패드도 기존대로 허용한다. |
| 회귀 | 신규5건: 단발 거부 처리, 문 열림8콜백 거부 처리, 동기 예외 허용, 미지원 허용, 정상 요청 인수 유지. 변경 전 앞2건 실패→수정 후 모두 통과. 관련 로비·모달 통합114건 통과. |
| 실제 런타임 | Node 서버의 원본 로비에서 getGamepads와 playEffect만 대역으로 교체했다. 거부 반복 요청은 수정 전130ms 동안 오류5회, 수정 후3회 요청에서 오류0회였다. 같은 페이지에서 원본 문 열림 예약 코드8단계를 실행해 거부8회·오류0회 확인. 종료창 열기·Escape 취소 후 버튼 초점 복귀 정상. 실물 패드 진동 검증은 별도다. |
| 증거 | test/lobbyHapticsFailure.test.js, tmp/lobby-haptics-rejection/browser-report.json. |
| 커밋 상태 | 이번 코드2줄·회귀·문서만 담은8파일 검수본은5회귀 및 inline4개 구문 검증 통과. 승인된 실행 도구의 WindowsApps 런처 오류317과 대체 경로의 .git/objects 쓰기 제한으로 커밋 미완료. 기존 game.html·SKILL_CARD_ICON_FIT_20260928.md 스테이징 보존. 검수본: tmp/lobby-haptics-rejection/commit-review. |


## 2026-09-28 화면 전환 시 종료·삭제 확인창 해제

| id / 적용 위치 | 현행 계약 |
|---|---|
| 원인 | 종료·삭제 공용 확인창이 로그인/시네마틱/로비 갱신 후에도 남아 이전 콜백과 초점을 유지. 제출한 요청의 늦은 완료가 새 목록 요청 또는 이전 오류 안내를 시작할 수도 있었음 |
| 전환 | index.html의 _goLogin, _goCinematic, _goLobby, showLobby 진입에서 #delConfirmModal의 inline display가 flex일 때만 _hideDelConfirm({fromTransition:true}) 호출. 초기 숨김 상태에는 확인창 let 변수 초기화 전 호출하지 않음 |
| _hideDelConfirm | fromTransition 기본 false. 일반 취소는 기존 busy 잠금 및 열린 창의 원래 버튼 초점 복귀 유지. 전환은 busy 중에도 창을 숨기고 _delConfirmCb/_delConfirmReturnFocus를 null로 정리하며, 창 내부 초점을 blur. 이전 로비 버튼으로 초점을 돌리지 않음 |
| 제출된 요청 | _delConfirmBusy는 기존 요청이 완료될 때까지 유지. 실제 전송된 DELETE/quit 요청을 취소하거나 되돌리지 않음. _delConfirmCb를 지역 onYes로 캡처하고, 현재 콜백이 onYes와 같을 때만 공용 오류 안내/완료 닫기 실행. 완료 후 busy 해제·확인/취소 버튼 재활성화 |
| 온라인 삭제 | 콜백 시작 시 request=_characterLoadSeq 캡처. DELETE 응답 후 request가 현재 번호와 다르면 목록 재조회/삭제 결과 안내 없이 return. 같은 화면은 기존 user_id 소유 필터·정확히1행/id 일치 검증과 loadCharacters 유지 |
| 로컬 삭제 | 같은 request 번호를 캡처하고 fetch 완료 후 및 catch 진입에서 번호 확인. 이전 작업이면 _slotScrollIdx 변경, loadLocalCharacters, localStorage 폴백 삭제/오류 안내를 시작하지 않음. 같은 화면의 서버 삭제·hellsave_demo_ 접두사·5칸 폴백 정책 유지 |
| 종료 안내 | _showLobbyQuit 콜백도 request 번호 캡처. 브라우저 직접 닫기 안내150ms와 NW/Electron/브라우저 종료 실패 안내는 번호가 같을 때만 setStatus. 정상 종료 우선순위 유지 |
| 회귀 | test/lobbyConfirmTransition.test.js 신규21건. 창 전환/늦은 완료6건 및 실제 콜백 후처리6건이 수정 전 각각 실패 후 통과. 일반 취소·busy 잠금·같은 화면 로컬 삭제/종료 안내·초기화 전 진입 보존. characterSync의 온라인 삭제 대역에 실제 공용 요청 번호 추가. 관련 로비 통합135건 및 inline script4개 구문 통과 |
| 브라우저 | Node 서버 실제 페이지960×540에서 전환4경로 전후 확인: flex/콜백 유지 → none/콜백 및 복귀 참조 null. 지연 성공/실패 대역에서도 전환 즉시 닫힘·busy 완료 후 해제·새 화면 초점 유지·공용 이전 오류 없음. 원본 삭제 콜백에 API/목록 대역만 주입한 전후8조건에서 이전 목록 재조회1회 → 0회, 로컬 실패의 저장 조회5회/오류 안내 → 0회/안내 없음. 데스크톱 종료 실패의 늦은 안내도 제거 |
| 화면·범위 | 960×540/1920×1080에서 종료창 Escape 취소 후 전원 버튼 초점 복귀, 로비 표시·가로 넘침 없음, pageerror0. 실계정 세션 종료/저장 삭제·앱 종료·실물 패드는 실행하지 않음. 실제 전환 함수와 콜백의 대역 검증이며 인증 서버의 종단 검증은 아님 |
| 기록·커밋 | tmp/lobby-confirm-transition/browser-report.json, test-output.txt, changes.patch. 코드·테스트·관련 문서6개를 이 작업 범위로 보존. 기존 승인 실행의 WindowsApps 런처 오류317 및 .git/objects 쓰기 제한이 남아 커밋 미완료. 다른 작업의 game.html/스킬 문서 스테이징은 변경하지 않음 |


2026-09-28 공통 아이템 스킨 폴백: `.iskin:has(>.iskin-img)>svg{visibility:hidden}`로 투명 PNG 뒤 금색 대체 SVG의 비침을 막는다. 이미지가 최종 실패하여 제거되면 SVG가 다시 표시된다. 보석함·장비창·가방·보관함 공통이며, [보석함 표시 계약](GEM_ATELIER_20260927.md)의 검증·실패 조건을 따른다.


## 2026-09-28 외형·이름 팝업 정리와 이전 영상 폴백 차단

| id / 적용 위치 | 현행 계약 |
|---|---|
| 재현 | 외형 취소 뒤 #csIdleVid가 숨은 채 계속 재생. 로그인/시네마틱/로비 전환4경로에 외형창 또는 이름창·가상 키보드·내부 초점이 남음. 실버테일 선택 뒤 전사 영상의 늦은 실패 콜백이 실버테일 영상을 멈추고 전사 초상화를 표시할 수 있었음 |
| _visualPreviewSeq | index.html의 _pendingVisualIdx 옆 let, 초기0. 유효한 열린 외형창의 selectVisual 호출 및 열린 창 닫기에서 증가. 선택 시 request를 캡처하며 현재 번호와 열린 flex 상태가 모두 일치해야 지연 미디어 처리를 허용 |
| selectVisual | 유효한 캐릭터와 열린 #charVisualPop이 없으면 반환. 오류 폴백, canplay의 타이머 정리, 5000ms 스톨 검사, 초상화/배경의180ms 지연 반영에 동일 isCurrent 검사. 새 선택·닫기 이전 콜백은 영상 정지나 이미지 교체를 수행하지 않음 |
| _closeVisualSelect | restoreFocus 기본false. 열린 외형창만 정리하고 번호 증가·내부 초점 blur·display none. csIdleVid/csSceneVid의 _csT clear/null, onerror/oncanplay null, stopMediaVideo, on 클래스 제거, src/poster 제거, load 실행. 숨김 상태 재호출은 상태를 바꾸지 않음 |
| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |
| 이름 확정 | _visualConfirm은 기존 comingSoon 차단 후 _closeVisualSelect 사용. createModal show, 이름/안내 초기화, 기존50ms 조건부 이름 초점 유지. 캐릭터 생성 요청·저장·스토리 경로 변경 없음 |
| _closeCreationOverlays | 외형창 공용 닫기 후 열린 createModal의 내부 초점 blur·show 제거·_vkbHide. 이름창이 숨겨져도 vkbWrap이 block이면 키보드 정리. _goLogin/_goCinematic/_goLobby/showLobby에서 사용 가능한 이 함수를 호출. 초기 숨김 상태에는 나중에 선언한 팝업/키보드 let 상태를 접근하지 않음. 이름창 show 또는 createBtn.disabled이면 생성 안내 초기화, 활성 생성 스토리는 skip()으로 종료. |
| _vkbHide | vkbWrap display none 및 replaceChildren()으로 생성된 키 DOM을 비움. 기존 _vkbActive=false/_hgState=null 유지. 부모 innerHTML 문자열 교체를 사용하지 않음. 한글 조합·키 배열·8글자 제한 변경 없음 |
| 에셋·표시 | 전사4K/idleRate0.75 및 실버테일 복원 영상·초상화·포스터 경로와 comingSoon:true 유지. contain/center top/transform none 규격 변경 없음. 재열면 기존 선택의 src/poster를 다시 지정해 재생. 신규 이미지/영상 생성 없음 |
| 회귀 | test/lobbyCreationOverlayLifecycle.test.js 신규17건: 닫기·재열기·이름 확정·이전 폴백·일반 취소 초점·전환4경로의 외형/이름/초기화 안전. 원본 코드에서13실패/4통과 → 수정 후17통과. 관련 생성·한글·패드·확인창·언어·목록 통합187건, inline script4개 구문 통과 |
| 실제 화면 | Node 서버 원본 페이지960×540에서 전환8조건: 외형 flex/재생 true 및 이름 show/키보드 block → 외형 none/paused true/src·poster·타이머 null, 이름 show false/키보드 none/active false/조합 null/숨은 초점 없음. 페이지 오류0 |
| 선택 정합성 | 원본 selectVisual 콜백으로 전사→실버테일→전사 늦은 오류를 재현: selected1이나 전사 초상화 표시·실버테일 정지. 수정 함수는 selected1·실버테일 재생·정적 초상화 숨김 유지. 실제 미디어 에셋으로 전후 확인 |
| 취소·재열기 | 960×540/1920×1080 실제 취소 버튼으로 미디어 해제·연결된 실행 컨트롤 초점 복귀, 재열기 후 전사 영상 재생, 이름창 Escape 취소·횡넘침 없음 확인. 가상 키보드 DOM8행 → 전환 후 자식0개 확인 |
| 검증 범위 | 데모 로비에는 생성 카드가 없어 openVisualSelect로 진입하고 실제 취소/생성확정/Escape 컨트롤을 사용. 실계정 인증 전환·캐릭터 저장/삭제·앱 종료 요청은 수행하지 않음. 이미 전송된 생성 요청의 성공/실패 후처리 정책은 이번 변경 범위가 아님 |
| 기록·커밋 | tmp/lobby-creation-overlays/browser-report.json, red-tests.txt, test-output.txt, changes.patch. 관련 문서9개 동기화. 기존 WindowsApps 실행 오류317 및 .git 쓰기 제한으로 커밋 미완료. 다른 작업의 스테이징을 변경하지 않음 |


## 2026-09-28 화면 이탈 후 캐릭터 생성 응답·스토리 후처리 차단

| id / 적용 위치 | 현행 계약 |
|---|---|
| 요청 번호 | doCreateChar와 _enterOffline 생성 콜백 시작 시 기존 _characterLoadSeq를 request로 캡처. _goLogin/_goCinematic 및 새 로컬·온라인 목록 요청이 번호를 바꾸면 이전 생성 후처리 중단 |
| 외형 일치 | 버튼 경로에서 _pendingVisualIdx를 visualIdx로 한 번 캡처. 서버 charIdx, localStorage charIdx 및 _afterCharacterCreated에 같은 값을 전달 |
| 스토리 수명 | _afterCharacterCreated는 자체 loadCharacters/loadLocalCharacters 호출 직후 증가한 번호를 캡처. 온라인 목록 완료와 story.play 완료/예외 후 번호가 같아야 showCharGate·BGM 복구. 자체 목록 갱신은 정상 생성 취소로 간주하지 않음 |
| 전환 정리 | _closeCreationOverlays는 이름창 show 또는 createBtn.disabled일 때 setStatus('')로 이전 생성 안내 제거. 기존 팝업/키보드 정리 후 ExoduserCharacterStory.active이면 skip() 호출. 이전 Promise 완료는 번호 검사로 게임 진입하지 않음 |
| 실제 저장 | 이미 전송된 저장 요청을 취소하거나 성공 데이터를 되돌리지 않음. 다음 정상 목록 조회에서 서버 결과 확인. 화면 이탈 뒤 추가 localStorage 폴백 쓰기·자동 재시도 없음 |
| 회귀 | test/lobbyCreationResponse.test.js 신규22건. 최초21건은 원본에서20실패/1통과, 안내·재생기 정리 추가 검사는 수정 전22건 중10실패/12통과. 관련 통합209건·inline script4개 구문 통과 |
| 실제 브라우저 | Node 서버 실제 페이지960×540, 시작 타이틀 실제 클릭 후 직접/버튼×성공/오류/네트워크 실패6조건: 로그인 유지·생성창 숨김·안내 빈값·현재 초점 유지·스토리/입장0회·추가 폴백 저장0회·버튼 해제. 실제 재생 중 스토리도 전환 즉시 종료, 이전 입장0회 |
| 전체 계약·증거 | [세이브 설계](../15%20세이브+데이터구조/15%20세이브+데이터구조.md)의 동명 절. 같은 화면의 기존 생성 성공/실패 유지. 관련 문서7개 동기화, 커밋은 기존 .git 쓰기 제한으로 미완료 |


## 2026-09-28 외형 선택창 키보드 조작·초점 격리

| id / 적용 위치 | 현행 계약 |
|---|---|
| 모달 의미 | #charVisualPop role=dialog/aria-modal=true/aria-labelledby=charVisualTitle. 기존 제목 h2에 charVisualTitle id 추가 |
| 미리보기 버튼 | openVisualSelect는 .cs-ico를 type=button인 네이티브 button으로 생성. selectVisual에서 .sel 및 aria-pressed=true/false를 함께 갱신. 출시 준비 캐릭터도 미리보기 버튼은 활성, visualCreateBtn만 기존 잠금 유지 |
| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |
| Tab | _visualSelectKeydown: 캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반4개/출시 잠금3개. 초점이 외부에 있으면 정순 첫 항목/역순 마지막 항목으로 복구. preventDefault/stopPropagation으로 배경 이동 차단 |
| 방향키 | 아이콘에 초점이 있을 때만 ArrowLeft/ArrowRight, Home/End 처리. 현재 인덱스를0~icons.length-1 범위로 제한하고 대상 네이티브 click 후 focus. 선택·설명·영상·생성 잠금·aria-pressed가 동일 캐릭터로 갱신. 취소/생성 버튼의 방향키는 가로채지 않음 |
| Escape·IME | 열린 창의 일반 Escape는 기본 동작·버블링 차단 후 비반복 입력일 때 visualCancelBtn.click(). isComposing 또는 keyCode229 이벤트 및 숨김 상태는 처리하지 않음. OS IME 실기 검증은 별도 |
| 버튼 마감 | .cs-ico padding0/border0/background transparent/font inherit로 네이티브 버튼 기본 재질 제거. :focus-visible outline2px solid #ead6a5/offset6px/radius4px. 기존 아이콘·레이아웃·미디어 에셋 유지 |
| 회귀 | test/lobbyVisualKeyboard.test.js 신규17건: 열기/선택 상태, 양방향 Tab, 잠금, 외부 초점 복구, 방향키, Escape 정리, IME6조건, 숨김/클릭 경로. 원본16실패/1통과→수정 후17통과. 관련 로비·생성·패드·울트라와이드 통합228건 및 inline script4개 구문 통과 |
| 실제 화면 | Node 서버의 실제 페이지에서 시작 타이틀 클릭 후960×540/1920×1080 확인. 실제 Tab/Shift+Tab/Enter/Space/방향키/Home/End/Escape 입력. 초점 전부 창 내부, 출시 잠금 유지, 취소 후 실행 버튼 복귀, 미디어 pause/src 해제. 컨트롤·초점 테두리 화면 내 및 가로 넘침 없음 |
| 전체 계약·증거 | [캐릭터 선택 기획](../3.1%20ui%20hud%20디자인/캐릭터선택_리모델링_기획서.md)의 동명 절. 관련 문서6개 동기화, 저장 요청0/pageerror0. 커밋은 현재 .git 쓰기 제한으로 실행 불가 |
