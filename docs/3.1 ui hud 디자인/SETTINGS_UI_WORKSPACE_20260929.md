# 설정 UI 화면 확장 및 키 변경 조작 — 2026-09-29

사용자 지시: 설정 UI만 작고 답답하므로 크기를 확장한다. 기존 왼쪽 `min(680px,100vw−24px)`·최대 높이1000px 제한을 제거하고, 화면 크기에 맞춰 내용도 재배치했다. 이 문서가 앞선 날짜의 설정 창/제목/행/키캡 크기보다 우선한다. 기존 금속 프레임·제목 아트·버튼 에셋을 사용한다.

## 2026-09-30 설정 제목 명패 정렬

`img/ui/blackiron/header.png`에는 글자가 없는 명패가 들어 있다. 기존 `#settings .ptitle`의 왼쪽 패딩 `154px`(작은 폭 `104px`, 낮은 높이 `106px`)이 제목 글자를 명패 오른쪽으로 밀어 빈 명패와 분리했다. 설정 제목에만 글자를 명패 안으로 옮겼다. 다른 패널의 제목, 원본 아트, 설정 값과 동작은 유지한다.

| 조건 | 제목 글자 / 장식 / 검수 |
|---|---|
| 기본 | 제목 높이 `80px`, 왼쪽 패딩 `50px`, 아래 패딩 `9px`, 글자 `24px/28px`, `align-items:flex-end`; 장식 `140×80px`, 배경 `182×182px center -45px` |
| 폭 `600px` 이하 | 제목 높이 `64px`, 왼쪽 `30px`, 아래 `5px`, 글자 `20px/24px`; 장식 `90×64px`, 배경 `146×146px center -36px` |
| 높이 `650px` 이하 | 제목 높이 `52px`, 왼쪽 `30px`, 아래 `0`, 글자 `18px/24px`; 장식 `90×52px`, 배경 `120×120px center -30px` |
| 캐시·검수 | 명패 수정 당시 `game.html`, `game-easy-test.html`, `index.html`의 `ui-refinement.css` 쿼리 `20260930-settings-title-plaque`. 실제 로컬 게임 설정창에서 `1688×1262`, `390×844`, `1280×540` 명패 안 제목을 확인. CSS 캐시 때문에 쿼리 변경 전 새 스타일이 적용되지 않던 현상도 재현했다. 후속 게임 설정·HUD 현행 캐시는 `20260930-settings-density-hud6`; 상세 규격은 [후속 디테일 계약](SETTINGS_HUD_DETAIL_20260930.md)을 따른다. 다른 탭 기능·NW.js 패키지·Steam 빌드는 당시 검수 범위 밖 |

## 레이아웃 계약

| 대상 / 선택자 | 현행 값 / 동작 |
|---|---|
| `#settings.panel` | 중앙 정렬, padding12px, border-box, 배경#050507c9 |
| `.pbox` | width100vw−24px / height100dvh−24px, max-width/max-height none, min-width/min-height0, margin0, padding20px 28px, overflow hidden |
| `.ptitle` | height/min-height80px, padding0 16px 9px 50px, 왼쪽·아래 정렬, 글자24px/28px, margin-bottom14px |
| 제목 `::before` | left4px/top0, transform none, 140×80px, 기존 info-header 크기182×182px/위치center −45px |
| `.panel-nav` | gap6px/margin-bottom10px. 탭 최소40px/글자14px |
| `.ui-section-tabs` | gap8px/margin-bottom14px. 탭 최소48px/padding10px 16px/글자16px |
| `.settings-pages.frame-inner-panel` | padding24px, 기존 본문만 overflow auto. overscroll-behavior contain/scrollbar-gutter stable |
| `.settings-page` | 2열 minmax(0,1fr), gap18px 32px, 상단 정렬. hidden 페이지 display none |
| `.ui-section-heading` | 전체 열, margin0, 최소44px/글자18px |
| `.set-section` | margin0/padding12px 16px, min-width0, 배경#c5b99a05/테두리1px #8f7c552b |
| `.set-label` | margin0 0 12px/padding4px 0 10px, 글자16px |
| `.set-row` / `.set-range-row` | 최소60px/padding12px/gap16px |
| `.set-name` | 글자16px/줄높이1.6, 기본 폭·flex-basis38%. 체크박스 label 내부는 기존 유연한 폭 유지 |
| `.set-range-val` | 글자14px/고정112px, white-space normal |
| select / range / checkbox | select 최소40px/글자15px/padding6px 10px. range min-width0. checkbox24×24px/flex-basis24px. select가 있는 label은 정방향 |
| 게임 탭 | 기존 게임 섹션을 전체 열에 배치, 내부2열/gap8px 32px |
| 화면 탭 | ui-panels.js에서 optShake/optParts/optFps/optResScale/optIrisSz/optBrightness/optIrisGlow 7행을 기존 ID·리스너 그대로 화면 효과 그룹으로 이동. KO 화면 효과 / EN Screen effects |
| 사운드 탭 | 두 볼륨행2열. BGM 선택행 전체 열/최대1100px |
| 조작 탭 | minmax(0,2fr) / minmax(300px,1fr). 커서 섹션 sticky top0. cursorGrid flex-wrap/gap10px/overflow visible |
| 키 행 | grid minmax(160px,1.3fr) / minmax(90px,1fr) / minmax(80px,.8fr) / 28px, 최소58px/padding8px/gap12px |
| 패드 키 행 | data-bind-control=pad-로 시작하는 버튼을 가진 행은 이름/액션/키 minmax(54px,.45fr) / minmax(80px,1fr) / minmax(100px,1fr) 3칸. span min-width0, 액션14px/1.6 Noto Sans KR·#c5beb0·overflow-wrap anywhere. 보조/삭제 빈 공간 예약 없음 |
| 키 이름 / 키캡 | 이름15px. 키캡 최소42px/글자14px/weight700/줄높이1.5/padding6px 8px. 기존 선1px·아래3px·금속 재질 유지 |
| 삭제 / 모드 / 초기화 | 삭제 최소36px/글자16px. 모드·초기화 최소44px/글자14px |
| footer | margin-top14px/padding-top12px. 닫기 최소44px/최소폭180px/글자15px, 자동저장14px. 본문 스크롤과 별도로 고정 |
| 폭1600px 이상 | 그래픽 품질 섹션 내부2열/gap4px 20px. 제목·gfxPresetRow는 전체 열 |
| 폭1800px 이상 | keyBindList 내부2열/gap6px 24px. 모드/안내/초기화는 전체 열 |
| 폭1100px 이하 | pbox padding16px 20px/본문16px. 페이지·조작·게임 섹션1열/gap16px. 커서 sticky 해제 |
| 폭600px 이하 | 패널 여백6px, pbox100vw−12px/100dvh−12px/padding12px, 제목64px/20px/24px·왼쪽30px·아래5px. 제목 아트90×64px/146²/center−36px. 탭gap2px/최소40px/글자12px/padding8px 3px. 본문10px/섹션8px. 행padding10px 4px/gap8px. 이름14px/값82px·12px. 키 행 minmax(70px,1fr) / minmax(50px,.8fr) / minmax(46px,.7fr) / 20px (패드 행은 위3칸 유지), gap5px/padding6px 2px. 키명/캡12px, 캡padding5px 3px. 닫기 최소폭120px/자동저장12px |
| 높이650px 이하 | 제목52px/18px/24px·왼쪽30px·아래0/margin-bottom8px. 아트90×52px/120²/center−30px. 공통 패널 탭 최소32px/12px/margin-bottom6px. 설정 탭 최소36px/padding6px/margin-bottom8px. footer margin/padding-top8px |

## 입력 및 DOM 계약

| 대상 | 현행 동작 |
|---|---|
| 키 설정 목록 | 실제 button type=button 사용. 목록은 replaceChildren으로 재구성하고 부모 textContent로 자식을 삭제하지 않음 |
| `data-bind-control` | mode-kbm/mode-pad, kbm-{action}-main/alt/delete, kbm-reset, pad-{index}, pad-reset |
| 접근성 | 모드 aria-pressed, 기본·보조·삭제·패드 키 aria-label. 대기 중 이름도 입력 대기로 갱신 |
| 패드 고정 키 | 인덱스0/1/2/3/12/13/14/15 disabled. 기존 주입키/매핑 정책 유지 |
| 초점 | renderSettings 재구성 전 식별자를 보존, 같은 버튼 focus preventScroll. 보조 삭제 후 해당 alt로 복원 |
| 대기 | 시작 시 저장/매핑 변경 없음. repeat keydown 무시. 새 키는 기존 등록/충돌 정책으로 처리하고 Escape 취소 |
| 버튼 입력 | 설정 내 버튼의 Space/Enter/NumpadEnter/Tab을 게임 단축키로 전달하지 않음. 키 캡처 분기가 먼저이므로 대기 중 새 Space/Enter/Tab 등록은 가능 |
| 캐시 | 당시 `game.html`·`game-easy-test.html`의 ui-refinement.css는 `20260930-settings-title-plaque`, ui-panels.js는 `20260929-settings-choices`. 현재 게임 두 HTML의 CSS는 `20260930-settings-density-hud6`이고 `index.html`은 명패 캐시를 유지한다. |

## 검증 및 상태

| 항목 | 결과 |
|---|---|
| 실제 게임 | 메인/쉬운 테스트에서 실제 설정 화면 확인. 메인 새 로드에서 저장된 CSS·JS 버전과 화면 효과 그룹 확인 |
| 화면 크기 | 1920×1080, 1280×800, 960×640, 600×720, 390×844, 1280×540 각각5탭. 두 HTML 60화면에서 가로 잘림0, 본문 가로 스크롤0, 닫기 화면 안 |
| 메인 창 규격 | 1920×1080→1896×1056px, 390×844→378×832px, 2534×1262→2510×1238px |
| 키보드 실동작 | 기본/보조 등록, 보조 삭제 후 초점, Enter/Space 대기, Escape 취소, 반복 활성화 무시, 패드 편집 대기 및 KO/EN 키 이름 검수. 메인 새 로드에서도 Enter 대기→Escape 취소·초점/설정창 유지 확인 |
| 자동 검증 | settingsBindingControls 10건 + settingsCharacterLanguage 1건 + renderSettingsRestore 8건 =19/19 PASS. test-chain-input-bindings 두 HTML PASS. ui-panels.js 및 HTML 인라인 스크립트 구문/HTTP 디스크 응답 검증 |
| QA 저장 | 별도 QA 슬롯·탭, 변경 테스트의 Storage.setItem은 QA 탭 안에서만 기록하고 버림. 사용자 기존 키/옵션/게임 세이브 변경 없음. 임시 viewport는 reset 후 QA 탭 닫음 |
| 한계 | 물리 게임패드 입력 및 NW.js 패키지/Steam 업로드 미검증. 코드/문서 저장 완료, .git 읽기 전용 권한 프로필 때문에 이번 변경 커밋 미완료 |

시각 검수는 설정 화면의 크기·가독성·잘림·조작 상태에 대한 확인이며 전체 게임의 AAA 품질 달성 선언이 아니다. 백업/검색 결과/검증 자료는 `tmp/settings-workspace-20260929/`, 키 변경 전 백업은 `tmp/settings-controls-20260929/`에 둔다.

## 시스템 탭·미리보기 디테일 마감

| 대상 / id | 현행 계약 |
|---|---|
| 시스템·그래픽 버튼 | `#settings-page-system button`, `#gfxPresetRow button`: 최소44px, padding10px 14px, 글자15px/줄높이1.5, 긴 이름 줄바꿈. 폭600px 이하 글자14px/padding10px 8px |
| 프리셋 제목·메시지 | `describeSettingsControls(root)`가 `settingsPresetLabel`에 set-label 추가. 제목#dcc9a6/왼쪽 정렬/아래1px #8f7c553b. saveMsg 최소24px/margin-top10px/14px/1.5, role=status·aria-live=polite·aria-atomic=true |
| 그래픽 프리셋 | gfxPresetRow flex-wrap/gap8px, 버튼 flex1 1 100px/min-width0. 기존5단계 값·저장 정책 유지 |
| 캐릭터 카드 | charSelectGrid 왼쪽 정렬/행 높이 동등/gap14px. 카드 폭220px/최대100%/최소높이200px/padding16px, 내용에 따라 높이 증가. 세로 flex. 기존 미리보기88×88px/margin-bottom12px, 이름17px/1.5/아래8px, 설명14px/1.6/#c0b8a9, 선택표시14px/상단padding10px·아래 정렬. 폭600px 이하 카드100%/gap10px |
| 미리보기 배치 결함 | 게임의 전역 canvas fixed/top0/left0가 설정 캐릭터·커서 canvas에도 적용되어 카드 밖에 그려졌음. 설정 내부 charSelectGrid/cursorGrid canvas만 position:static/inset:auto/z-index:auto로 복원. 기존 스프라이트·픽셀 렌더링·게임 캔버스 유지 |
| 커서 카드·크기 | cursorGrid 카드96×104px/padding8px, 내부 이름13px/1.5. cursorSizeVal14px/최소폭56px. 기존 이미지·canvas·draw·이모지 폴백 유지 |
| 입력 이름·값 | `.set-range-row`의 range/select21개를 기존 `.set-name` 리프에 aria-labelledby로 연결. 없는 이름 ID는 settings-label-{control.id}. `.set-range-val` 또는 cursorSizeVal 리프는 aria-describedby로 연결; 없는 값 ID는 settings-value-{control.id}. 기존 ID·리스너·명시한 aria 이름/설명 및 자식 DOM 유지 |
| 번역·조작 | 이름/값을 복제하지 않고 실제 번역 리프와 갱신되는 값 노드를 참조. 본편 KO→EN에서21개 이름 유지, 실제 ArrowRight로 효과음79→80/읽기값80%/초점 optSfx 확인. 검수 탭 저장쓰기는 버림 |
| 검증 | settingsControlLabels3건 추가, 관련 설정 회귀 포함22/22 PASS. 본편·easy-test 각각6화면×5탭의 최종 재로드 검사 결과는 아래 기록 |
| 저장·백업 | 이 절의 당시 검수 캐시20260929-settings-finish2, 현행 캐시는 위 입력 계약 참조. tmp/settings-finish-20260929에 변경 전 파일·docs 전체 검색·검수 결과 보존. 기존 작업 보존, 관리형 .git 읽기 전용으로 커밋 미완료 |
| 최종 새 로드 | 본편/easy-test 각1920×1080·1280×800·960×640·600×720·390×844·1280×540×5탭=60화면: 가로 잘림0/본문 가로 스크롤0/닫기 화면 안/캐릭터 미리보기 카드 안/필드 이름21개. 본편 최종 버전은 추가 style 주입 없이 로드 |
| 작은 창 실제 조작 | easy-test390×844에서 캐릭터 이미지·설명 시각 확인. 본문 휠 스크롤 끝 scrollTop570/max570, 닫기 고정 유지. 검수용 시작 연출 canvas는 QA 탭에서만 CSS로 숨기고 종료 시 탭 닫음 |
| 파일 검증 | UI JS 및 두 HTML 인라인4개씩 구문PASS. HTTP200 원본 응답과 디스크의 HTML2개/CSS/JS 바이트 일치. 검수는 설정 UI이며 시작 연출·전투 흐름의 검수 완료를 뜻하지 않음 |

## 캐릭터·커서 선택 카드 조작 마감

| 대상 / id | 현행 계약 |
|---|---|
| 공통 카드 DOM | 두 HTML의 renderSettings에서 `button type=button`, 공통 class `settings-choice`, 캐릭터 `settings-character-choice` / 커서 `settings-cursor-choice`. 별도 역할 덮어쓰기 없이 네이티브 Tab·Enter·Space 활성화 사용 |
| 카드 식별·선택 | `data-settings-choice=character-{ci}` / `cursor-{ci}`, `aria-pressed=String(sel)`. 커서는 `_L(cur.name,cur.nameEn\|\|cur.name)`, 캐릭터는 `_T(ch.name)`으로 실제 표시와 aria-label 이름을 일치시킴 |
| 설명·텍스트 | 이름 span `settings-choice-name`, 캐릭터 설명 span `settings-choice-description` / id `settings-character-description-{ci}`를 aria-describedby로 참조. 선택 span `settings-choice-selected`, 커서 이모지 span `settings-choice-icon`. 이름·설명·선택 상태는 기존 번역 조회 사용 |
| 재구성·초점 | charSelectGrid/cursorGrid의 replaceChildren 사용. renderSettings 시작 시 activeElement의 가장 가까운 `#settings [data-settings-choice]`에서 `_choiceFocus` 보존. 같은 식별자를 가진 새 카드 append 후 focus({preventScroll:true}). 선택 후 Tab은 다음 카드로 이동 |
| 기존 선택 기능 | 커서 onclick: OPT.cursor 변경 → _cursorCache=[] → _applyCursor → saveSettings → renderSettings. 캐릭터 onclick: _loadCharAtlas(ci) → renderSettings. 기존 캐릭터 저장·스프라이트 로더와 커서 이미지/canvas/draw/이모지 폴백 유지 |
| 기본 재질 | appearance:none / margin0 / border2px #6c5840 / radius6px / color#d6ccba / letter-spacing normal / white-space normal. 배경 radial-gradient(ellipse at50% 5%,#473a2938,transparent72%) + linear-gradient(145deg,#201e21,#101217). 그림자 inset0 1px #f0d5a418 + 0 3px 10px #0004. border-color/background/box-shadow 전환 각각.15s |
| 선택·호버·초점 | aria-pressed=true: border#ccaa66, 배경 radial50% 5%/#b58c3c33/transparent80% + linear145deg/#3c3021/#211c17. hover 및 gp-hover: border#d1b27d, 그림자 inset0 1px #f0d5a430 + 0 3px 12px #0006. focus-visible: outline2px #f0cd8a/offset3px. 공통 버튼의 before/after 장식은 카드에만 display:none |
| 기존 확대 규격 | charSelectGrid/cursorGrid의 `>.settings-choice`에 위 시스템 마감 카드 크기를 적용. 설명 font-weight400/overflow-wrap anywhere, 이모지20px. 카드 크기·미리보기88px·작은 화면100% 정책은 동일 |
| 쉬운 테스트 번역 | game-easy-test.html의 직접 ch.name/ch.desc 출력을 `_T(ch.name)` / `_T(ch.desc)`로 맞춤. 본편과 동일한 기존 카탈로그 사용. 선택 표시와 접근성 이름·설명도 같은 번역 리프를 참조 |
| 자동 검증 | settingsChoiceControls8 + settingsBindingControls10 + settingsCharacterLanguage2 + settingsControlLabels3 + renderSettingsRestore8 =31/31 PASS. 선택 회귀는 변경 전6FAIL/2PASS → 변경 후8PASS. 이름·설명 EN→KO 회귀는 두 HTML 각각 PASS |
| 실동작 | 본편·easy-test에서 Enter 캐릭터0/Space 캐릭터1, Enter 커서1/Space 커서0의 실제 선택값·aria-pressed·초점 복원 확인. Tab으로 다음 커서 이동, 설정창 유지/G.paused=true. easy-test KO→EN 이름·설명 확인. 새 슬롯 QA 탭에서 저장쓰기를 기록 후 버림 |
| 화면 검수 | 본편 KO/EN 각각1920×1080·1280×800·960×640·600×720·390×844·1280×540×조작/시스템2탭=24건: 가로 잘림0/본문 가로 넘침0/닫기 화면 안/카드 자식·텍스트 넘침0. easy-test 선택·번역 실동작 확인 후 추가 크기 검사에서 브라우저 도구가 시간 초과 및 sandbox helper 시작 실패로 중단됨; 반환되지 않은 추가 검사 결과를 PASS로 집계하지 않음 |
| 최종 파일 검증 | ui-panels.js와 두 HTML의 인라인 스크립트4개씩 구문PASS. 두 HTML/CSS/JS의 HTTP200 원본 응답과 실제 디스크 바이트 일치, 두 HTML 캐시CSS/JS 모두20260929-settings-choices |
| 브라우저 중단 한계 | 도구 재연결도 sandbox helper 시작 실패로 중단. 이번 QA 탭의 임시 viewport 수동 reset/닫기 완료는 확인하지 못했으며 생성한 검수 탭은 도구의 턴 종료 자동 정리 대상. 기존 사용자 탭은 수정하지 않음 |
| 상태·자료 | 캐시20260929-settings-choices. 변경 전 백업·docs 전체 검색은 tmp/settings-choice-20260929. 소스·문서 저장, 기존 dirty/staged 작업 유지. .git 읽기 전용으로 커밋 미완료. 물리 패드/NW.js/Steam 미검증. gp-hover CSS 병기는 구현했으나 실제 패드 선택 이동은 미검증 |
