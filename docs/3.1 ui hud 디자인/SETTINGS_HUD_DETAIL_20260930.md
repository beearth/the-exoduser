# 설정 창 밀도와 전투 HUD 마감 — 2026-09-30

이 문서는 `SETTINGS_UI_WORKSPACE_20260929.md` 이후의 설정 창 및 전투 HUD 변경을 기록한다. 게임 수치·설정값·키 바인딩은 유지한다. 2026-09-30 게임/시스템 통합으로 설정 탭 DOM만 재구성했다. 일반판과 쉬운판의 현행 CSS 캐시는 `20261001-settings-nav18`, JS 캐시는 `20261001-settings-nav17`이다. 로비의 CSS 캐시는 이 작업 범위에 포함하지 않는다. 후속 개선 상태는 [UI/UX 개선 프로젝트](UI_UX_IMPROVEMENT_PROJECT_20260930.md)에서 관리한다.

| 대상 | 적용 위치 | 현재 규격과 의도 |
|---|---|---|
| 게임 탭 | `#settings-page-game`, 데스크톱 폭 1101px 이상·높이 760px 이상 | 시스템 구역을 먼저, 게임 설정 10개를 다음에 둔다. 설정 프레임 최대 폭 1360px·높이 1010px. 시스템은 두 열, 게임 설정 10개도 두 열이며 본문만 세로 스크롤한다. 게임 설정 두 열 사이에 약한 세로 금속선을 둔다. |
| 사운드 탭 | `#settings-page-audio`, 같은 브레이크포인트 | 프레임 최대 폭 980px·높이 620px. 효과음·음악·BGM 선택이 스크롤 없이 보이도록 한다. |
| 시스템 구역 | `#settings-page-game .settings-system-group`, 같은 브레이크포인트 | 독립 시스템 탭을 제거하고 게임 페이지 맨 앞에 배치한다. 왼쪽은 언어 → 세팅 프리셋 → 전체화면·로비 → 리셋, 오른쪽은 캐릭터 선택 → 게임 종료. 기존 ID·리스너·값·버튼 동작을 유지한다. |
| 화면 탭 | `#settings-page-display`, 폭 1200px 이상 | 그래픽 품질 설정 13개를 두 열로 배열하고 그래픽 프리셋 5개를 한 줄에 둔다(`flex-basis:80px`). 하드웨어 진단은 두 설정 카드 아래 전폭 한 행이다. GPU·WebGL·성능 등급·벤치 FPS는 `2:1:1:1` 너비의 네 칸, 재진단 버튼은 190px 열에 배치한다. 진단 값 칸 최소 높이 68px, 버튼 최소 높이 76px. 폭 1199px 이하는 기존 배치·세로 스크롤을 유지한다. |
| 조작 탭 | `#settings-page-controls`, 폭 1200px 이상 | 마우스 커서 카드·크기 조절을 첫 행의 세 열에 배치하고 키 설정은 프레임 전폭의 두 열로 배열한다. 키보드·마우스 모드는 20개, 게임패드 모드는 9개 바인딩 행이며 각 행은 `min-height:52px`, 세로 간격 4px, 가로 간격 28px이다. 입력 모드 버튼과 초기화 버튼은 두 열을 차지한다. 폭 1199px 이하는 기존 단일 열·스크롤 배치를 유지한다. |
| 설정 행 | `.set-row`, `.set-range-row` | 호버 시 청동색 투명 배경, 키보드 포커스 시 2px 왼쪽 금속선과 배경. 행 배경 전환 0.16초. |
| 전투 목표 | `#mmLvl` | 최소 폭 216px, 안쪽 여백 12px 14px 13px, 청동색 1px 외곽선·상단 빛선·어두운 불투명 그라데이션. 레벨·경험치와 지역 처치·악의 값 사이 구분을 강화한다. |
| 전투 시간 | `#stageClock`, `#stageTimerHud` | 상단 중앙의 얇은 구분선과 어두운 배경, 시간 표시 0.75rem·자간 0.18em으로 전투 효과 위에서도 읽히게 한다. |
| 구석 자원 | `#hudCorner`, `.hud-resource` | 미니맵 아래 어두운 청동 띠, 위 1px·왼쪽 2px 테두리, 안쪽 여백 7px 10px 8px. 표시 불투명도 0.94, 자원 글자 0.7rem·불투명도 0.93, 두 자원 사이 얇은 구분선. |
| 작은 화면 | 폭 1100px 이하 및 600px 이하 기존 반응형 규칙 | 시스템과 게임 설정이 모두 단일 열이며 본문 세로 스크롤을 사용한다. 390×844에서 가로 넘침 없이 마지막 게임 항목까지 스크롤할 수 있고 닫기 버튼은 고정된다. |

## 실화면 검수

`server.cjs`의 `http://localhost:3333/game.html?test=1&slot=demo&demo=1`을 Chrome에서 열어 확인했다. 1668×1318에서 게임·사운드·시스템 탭은 각각 내용에 맞는 프레임이며, 사운드와 시스템 본문은 세로 스크롤 없이 마지막 조작까지 보인다. 시스템 본문 `scrollHeight=clientHeight=676px`이고 마지막 버튼 하단은 본문 표시 하단보다 위에 있다. 화면 탭의 하드웨어 진단은 전폭 1518px, 높이 187px이며 본문 `scrollHeight=clientHeight=960px` 안에 보인다. 1280×800에서는 그래픽 프리셋 5개가 한 줄, 그래픽 옵션이 두 열이고 하드웨어 진단은 전폭 1130px, 높이 171px이다. 본문 `scrollHeight=890px`, `clientHeight=442px`로 하단 진단까지 세로 스크롤하며 가로 넘침은 없다. 조작 탭의 키보드·마우스 모드는 20개 바인딩이 두 열로 표시되고 본문 `scrollHeight=1024px`, `clientHeight=960px`로 하단 초기화 버튼에 64px 스크롤이 필요하다. 게임패드 모드는 9개 바인딩과 전체 조작 가이드가 두 열 배치·세로 스크롤 안에 들어가며 하단 가이드가 잘리지 않는다. 1280×800에서는 조작 탭도 두 열(각 534px)을 유지하고 가로 넘침·조작 버튼 잘림이 없다. 390×844에서는 게임·시스템·화면·조작 탭의 폭 넘침이 없고 탭과 닫기 버튼이 보이며 긴 본문은 단일 열·세로 스크롤이다. 뷰포트 오버라이드는 검수 후 해제했다. 실제 전투 화면에서 우상단 레벨·경험치·지역 처치·악의 패널, 상단 타이머, 미니맵 아래 자원 띠가 배경 위에 표시되는 것을 확인했다.

남은 시각 작업: 게임 전투 효과가 밀집했을 때의 HUD 대비는 별도 실화면 검수가 더 필요하다. 하드웨어 진단의 백그라운드 탭 약 1초 프레임이 120프레임 평균에 섞여 `1 FPS`·C로 표시되던 문제는 `document.hidden`·`250ms` 초과 간격에서 부분 표본을 버리고 다시 측정하도록 수정했다. 로컬 활성 탭의 새 120프레임 표본은 S로 끝나는 것을 확인했다. 이 진단은 실제 전투 FPS·성능 병목의 측정이 아니며 스타일 변경의 프레임 영향도 측정하지 않았다.

## 2026-09-30 게임/시스템 통합

| ID·순서 | 이전 위치 | 현재 위치·동작 |
|---|---|---|
| `settings-tab-game` | 게임 탭 | 4탭 중 첫 탭. 내부 순서는 시스템 → 게임 설정 |
| `settings-tab-system` / `settings-page-system` | 독립 시스템 탭/페이지 | 제거. 표시 항목은 삭제하지 않음 |
| `optLang`, `charSelectGrid` | 시스템 페이지 | 게임 페이지의 시스템 구역. 기존 언어 옵션·캐릭터 카드 보존 |
| `saveP1`, `saveP2`, `loadP1`, `loadP2`, `saveMsg` | 시스템 페이지 | 같은 시스템 구역의 프리셋 카드. 저장·불러오기 피드백 보존 |
| `toLobbyBtn2`, `resetBtn`, `quitBtn`, 전체화면 버튼 | 시스템 페이지 | 같은 시스템 구역의 액션 카드. 확인 UI와 핸들러 보존 |
| `optDiff`, `optAutoPot`, `optMinRar`, `optMinLv`, `optCrAutoFuse`, `optCrAutoEnh`, `optXbowAuto`, `optBlPullMode`, `optBladeAuto`, `optBossDbg` | 게임 페이지 | 시스템 구역 다음의 게임 설정 카드. 값·리스너·저장 정책 불변 |
| 화면/사운드/조작 탭 | 각 페이지 | 유지. 설정 탭 순서는 게임 → 화면 → 사운드 → 조작 |

브라우저 실화면에서 본편 1668×1318은 4탭, 시스템 우선 순서, 본문 `scrollWidth=clientWidth=1282px`, 세로 `1092/676px` 스크롤을 확인했다. 390×844는 본문 `scrollWidth=clientWidth=342px`, 마지막 게임 항목까지 스크롤되며 고정 닫기가 보인다. 두 경우 모두 기존 시스템 항목 6개 기준 ID의 DOM 위치를 확인했다.

쉬운판 `game-easy-test.html`도 실제 화면에서 4탭·시스템 우선 순서와 가로 넘침 없음을 확인했다. `node --check ui-panels.js`와 설정 바인딩·캐릭터 언어·선택 카드·컨트롤 이름 테스트 23/23이 통과했다. 프리셋 저장, 게임 리셋, 종료 버튼은 사용자 데이터에 영향이 있어 QA에서 실행하지 않았으며 기존 ID와 이벤트 연결을 유지했다.

## 2026-10-01 게임 탭 구역 이동·재진입

| 요소 | 위치·동작 | 검수 기준 |
|---|---|---|
| `settings-game-heading-text` | 게임 페이지 제목의 리프 텍스트. 한국어 `게임 · 시스템`, 영어 `Game · System` | 제목은 이동 버튼을 포함한 부모 DOM을 덮어쓰지 않는다. |
| `.settings-jump-nav`, `.settings-jump-button` | 게임 페이지 상단 제목 안의 `시스템`, `게임 설정` 버튼. 이동 대상과 `aria-controls` 연결 | 본문 스크롤 중에도 제목 바가 상단에 남고, 대상 제목이 바 아래에 보이며 초점이 옮겨진다. |
| `settings-system-options`, `settings-game-options` | 각 구역의 안정적인 대상 ID | 시스템 h4와 게임 구역 제목은 프로그래밍 초점을 받는다. |
| 설정 닫기·재진입 | `#settings` class 변경 감지로 재진입 시 `.settings-pages.scrollTop=0` | 선택한 최상위 탭은 유지한다. 설정값·저장 동작은 바뀌지 않는다. |
| 구역 제목 초점 표시 | `.settings-group-heading`, `.set-label[role="heading"]` | 이동 후 기본 흰색 전체 윤곽 대신 왼쪽 3px 청동 강조선과 어두운 배경으로 초점 위치를 보인다. |

본편 실화면 390×844에서 `게임 설정` 이동 후 본문 `scrollTop=1152px`, 제목 상단 332px·고정 바 하단 322px, 다시 `시스템` 이동 후 `scrollTop=15px`, 제목 상단 323px·바 하단 322px였다. 두 경우 모두 대상 제목에 초점이 가고 가로 넘침이 없었다. 본편 1324×982에서 화면 탭을 아래로 스크롤해 `scrollTop=283px`로 만든 뒤 닫고 다시 열었을 때 화면 탭을 유지하며 `scrollTop=0`으로 돌아왔다. 같은 본편 화면에서 `게임 설정` 버튼에 Enter를 눌러 제목 초점 이동과 가로 넘침 없음을 확인했다. 쉬운판 실화면에서도 4탭과 게임 설정 이동·가로 넘침 없음을 확인했다. 제목 초점선은 CSS `nav16`을 적용한 본편·쉬운판 새로고침 후 흰색 윤곽이 사라지고 왼쪽 청동선이 보이는 실제 화면과 계산 스타일로 재확인했다. 설정 저장·리셋·종료 및 언어 변경은 이 검수에서 실행하지 않았다. `node --check ui-panels.js`, 설정 관련 테스트 23/23, `git diff --check`가 통과했다.

## 2026-10-01 UI-02 조작 탭 탐색 순서

`ui-panels.js`의 `settings()`에서 조작 페이지에 옮기는 `cursorGrid` 섹션과 `keyBindList` 섹션의 DOM 순서를 **커서 → 키 설정**으로 맞췄다. 데스크톱 폭 1200px 이상에서는 기존 CSS가 커서를 2행, 키 설정을 3행에 배치했지만 이전 DOM 순서는 그 반대라 Tab 이동과 보이는 순서가 어긋났다. 작은 화면의 단일 열에서도 커서가 키 설정 앞에 온다. 상위 탭 4개·섹션 내부 컨트롤·옵션 ID·바인딩 값·저장 정책과 CSS 배치는 바꾸지 않았다. 본편·쉬운판 JS 캐시는 `20261001-settings-nav17`이며 `node --check ui-panels.js`와 관련 테스트 23/23이 통과했다.

키보드·마우스와 게임패드의 `.bind-reset`은 원래 인라인의 붉은색 값이 `#settings button` 공통 `!important` 스타일에 덮여 일반 버튼처럼 보였다. `ui-refinement.css`에서 두 초기화 버튼만 기존 게임 리셋 계열의 경고 팔레트로 다시 구분한다. 기본 `border-color:#844536`, 글자 `#e2ad97`, 배경 `linear-gradient(#451e19,#200d0c)`, 상단 안쪽 빛선 `rgba(233,147,110,.18)`이며 호버는 테두리 `#b75f4b`, 글자 `#ffd1ba`, 배경 `linear-gradient(#592721,#2c1010)`이다. 초기화 핸들러·확인 방식·키 값은 바꾸지 않았다. 본편·쉬운판 CSS 캐시는 `20261001-settings-nav18`이다. 실화면의 키보드·패드 초기화 버튼 계산 색은 각각 `rgb(132,69,54)` 테두리와 `rgb(226,173,151)` 글자로 확인했다.

본편·쉬운판의 게임 공통 `keydown`은 `Space`·`Enter`·`NumpadEnter`·`Tab`에 대해 설정의 버튼을 게임 입력 처리에서 제외했으나, 설정 `input`·`select`는 제외하지 않았다. 그래서 `#optCursorSize`에 초점을 둔 채 Tab을 누르면 게임의 `preventDefault()`가 브라우저 초점 이동을 막았다. 두 HTML에서 이 네 키의 예외 대상을 `#settings.on input`·`#settings.on select`까지 넓혔다. 설정 패널 밖 게임 단축키와 `Escape` 닫기 동작은 그대로 둔다. 실제 본편·쉬운판에서 `#optCursorSize` 다음 Tab 초점이 `data-bind-control="mode-kbm"`으로 넘어갔다.

| UI-02 실화면 | 확인 결과 |
|---|---|
| 본편 1754×1262 | 화면 본문 904/904px, 사운드 286/286px, 조작 1024/904px 스크롤. 조작 DOM과 시각 순서는 커서 → 키 설정. 상위 탭 Home/End 이동과 키보드·패드 전환 후 초점 복원 확인. |
| 본편 1324×982 | 화면 907/624px, 사운드 286/286px, 조작 1125/624px 스크롤. 세 탭 가로 넘침 0px. 조작 모드 전환 뒤 `mode-kbm` 초점 복원 확인. |
| 본편 390×844 | 화면 1886/492px, 사운드 492/492px, 조작 패드 모드 1716/492px 스크롤. 세 탭 가로 넘침 0px, 고정 닫기 노출. 패드 초기화 버튼과 하단 가이드는 본문 스크롤·키보드 초점으로 접근 가능. |
| 쉬운판 1754×1262·390×844 | 조작 DOM 순서 커서 → 키 설정, 두 크기에서 `#optCursorSize` 다음 Tab 초점이 `mode-kbm`. 390×844의 화면 1886/492px, 사운드 492/492px, 조작 키보드 모드 1679/492px 스크롤이며 세 탭 가로 넘침 0px·고정 닫기 노출. |

검수는 QA팀 프레임 측정 종료 확인 후 별도 Chrome 탭에서 진행했다. 설정값·볼륨·키 초기화·하드웨어 재진단·저장/리셋은 실행하지 않았고, FPS·입력 지연도 측정하지 않았다.


### 2026-10-01 D10 독립 후보 검수

| 범위 | 현재 상태 | 실제 근거 |
|---|---|---|
| UI-10/U-D10 | 신규제안·미채택·게임비활성 | 흉갑/지옥강타 성공 실제소모>=100,저장롤10~20%,잔여 min(30,소모×롤) 후보 |
| 전투 후보 | ITEM75검사·독립148입력 포함8그룹 PASS | 원피해/악의/합체쿨/RNG 유지,중복·실패·재진입 방어 |
| 검토 UI | 한영10/15/20% 소비,22카드44원화 유지 | Chrome 실화면/160px/44로드/가로overflow0, IAB Enter·Space |
| 롤 모듈 | roll-values.js 현행 | .mjs에서 동일바이트이동, HTTP JavaScript MIME, 서버변경0 |
| 남은 게이트 | 새instance 저장binding·실전·패키지 | 활성0/runtimeReady=false/110차단,실제U-N01 미구현 |

관련188검사와 최종화면수정후12검사 통과. 독립후보 완료와 게임효과 적용은 구분한다. [상세·실패 포함 근거](../0마스터플랜/mac-resume-20261001/vscode-dispatch/D10-root-review.md).


### 2026-10-01 D10 저장 binding 후보 인수

| 대상 | 계약 |
|---|---|
| identity | `uniqueId:'UI-10'`, `slot:'armor'` |
| 저장 필드 | `uniqueRoll:{version:1,effectId:'U-D10',stat:'_uSlamEmberRage',unit:'fraction',storedValue:0.15}` |
| 값 | 10~20 정수%의 정규 소수 .10~.20만 허용. raw는 중복 저장하지 않고 기존 fromStoredValue로 읽는다 |
| 생성 | 명시 신규 생성 호출에만 주입 RNG 정확1회. plain JSON 데이터 snapshot이며 입력/중첩 객체 보존 |
| 읽기 | 필수 identity/slot/binding/schema/value는 own enumerable data 필드. 접근자·직렬화 훅·잘못된 prototype/schema/version/unit/value를 유효 binding으로 인정하지 않음 |
| 복원 | restoreD10Instance는 전달된 로드 객체를 그대로 반환. 신규 생성·수리·재롤·legacy 자동변환 없음 |
| 소비 | readStoredRoll→기존 createD10Consumer; 기본 enabled=false. UIUX는 실제 readD10Binding→기존 tooltip, 항상 active=false |
| 잘못된 값 | legacy/missing/invalid는 툴팁 없음과 상태 설명. 누락 값을 15%로 채우지 않음 |
| 한계 | 임의 Proxy를 실행 격리하는 보안 경계가 아님. 생성 API는 호출자가 새 아이템임을 보장해야 하며 저장된 missing UI10을 보충하는 API가 아님 |

`createNewIdentifiedD10Instance`는 명시 새 생성 fixture/호출자용 포트다. plain JSON 내용만으로 객체의 생성 이력을 증명할 수는 없다. 실제 생산 연결 때에는 fresh mkItem 생성 경로에서만 호출해야 한다. 현재 read/restore/tooltip이 이 생성 API를 호출하지 않는 회귀를 확인했다. 이 제약을 이유로 사용자가 일상 필드명을 선택하도록 반복 질문하지 않는다.


Node 후보 연결과 root 보강 회귀61PASS. 게임 생성/드롭/저장라우터·실제UI·패키지 연결은 미완료이며 활성0을 유지한다. 기존 소켓누락 마이그레이션 RNG·affixes 보충은 그대로다. [실제 검수·반례·제한](../0마스터플랜/mac-resume-20261001/vscode-dispatch/BINDING-root-review.md).

## 2026-10-07 지역 목표·앵글러·게이트 사유 HUD — ROOT-CH1-REGION-PROGRESS-HUD-20261007

기존 `#mmLvl` 최소폭216px 및 padding(12/14/13), font12px, offset은 유지한다. 이번 Main CH1 필드 활성 label의 확장과 scope 복귀만 아래와 같이 추가된다.

| 항목 | 현재 값 |
|---|---|
| label / count | `#hudKillLabel` 3줄 `pre-line`, `#killCnt` 기존값·펄스 유지 및 `alignSelf:flex-start` |
| scope | stage0/current region/G.on/두 leaf/bossAlive, 비보스방·비load·미완료; paused 자체는 제외하지 않음 |
| 활성 class | `mmLvl.classList.toggle('region-progress',!!active)` |
| 실제 CSS | `#mmLvl.region-progress{transform:scale(max(var(--ui-scale),1))}` |
| 최소 크기 | 활성 scale1/글자12CSSpx; 원 font/폭/padding/offset은 재설정하지 않음 |
| 복귀 | inactive/missing leaf에서 class 제거, label whiteSpace/value alignSelf는 `''`, 원 transform 복귀 |
| language | labels loop 뒤 helper1회로 paused 중에도 현재3줄 유지 |

이전29c1에서1280 font8CSS·640 font4CSS가 작았던 사실은 역사로 보존한다. 최종B8 한정 native KO/EN640×720 두 조건에서는 글자12CSS와 패널216×182.484375, viewport 포함/clock·minimap 비겹침/첫줄 정렬을 확인했다. ROOT의 실제 PNG 판독에서는 transient startareaTitle 오른쪽과 확대 패널의 겹침이 남아 **RETOUCH**다. 최종1280 재검사/전 해상도·28언어 fit 인수는 없다. 새 CPU8/새 native2를 이전68/native6과 clean 합산하지 않는다.

최종 `game.html` working 4,092,122B / SHA256 `b8be6378b7d2805b32ca38f92cca03179f8f1ebb2732bebacec6300f5fe7ad3a`, ROOT owned 4,091,937B / SHA256 `05fa7031c8f1d4b1e02643e9fd9964f81c3a80a25d698ab22a002c2330f1ddc0`의 6개 hunk 기준이다. 기존 foreign 185B는 미채택 상태로 보존한다.

전체 런타임 계약·검수 epoch·§23 보고는 [MAP_RUNTIME_ARCHITECTURE.md](../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md)의 `ROOT-CH1-REGION-PROGRESS-HUD-20261007` 절을 따른다.

### 2026-10-07 ROOT-MAIN-RIFT-VIEW-CONSUMER-20261007 · 본편에서 지옥의 틈 둘러보기

| 항목 | 현재 계약·근거 |
|---|---|
| 노출 | 실제 main의 origin이 http://127.0.0.1:3387이고 ch1RiftView=1일 때만 생성한다. 기본 OFF이며 기존 로비 carry4에 포함하지 않는다. 설정 메뉴·OPT·BINDS 저장 항목이 아니다. |
| 진입 버튼 | root-rift-view-open, native button type=button, 지옥의 틈 둘러보기. fixed left18px/bottom150px/z-index75, minHeight44px, padding10px 16px, border1px, radius7px, font600 14px system-ui. 설정 footer에는 넣지 않는다. |
| 버튼 입력 | mousedown은 preventDefault+stopPropagation으로 기존 window MB arming을 막는다. Enter/NumpadEnter/Space의 keydown·keyup은 stopPropagation만 하여 브라우저 기본 click을 허용한다. Tab·키 재지정 정책은 그대로다. |
| 사용자 화면 | view-only만 header/footer/aside를 display:none으로 감춘다. main은 padding/margin0·max-width해제·100vh, stage는 width/height100%·aspect-ratio auto·border/radius0. 실험조작 DOM은 보존하지만 화면 선택 접근은 감춘다. 일반 standalone/clear host의 해당 화면 배치는 바꾸지 않는다. |
| 접근성·리프 문구 | stage aria-label 지옥의 틈. canvas는 기존 WASD/방향키·Shift·J·R와 Escape 전투 복귀를 안내한다. loading-title 지옥의 틈으로 들어갑니다, loading-detail 공간을 준비하고 있습니다. legend는 리프일 때만 기존 조작과 Esc 복귀를 표시한다. 물리·rig·NPC·API는 그대로다. |
| host 문구 | 제목 지옥의 틈, iframe title 지옥의 틈 둘러보기, 준비 공간을 준비하고 있습니다., ready WASD 이동 · R 대화 · Esc 돌아가기, 종료 버튼 전투로 돌아가기. 주요 흐름에는 standalone 실험 조작·기술 표시를 드러내지 않는다. |
| ESC 우선순위 | ready 이후 view host가 child capture keydown을 설치한다. nonrepeat Escape를 preventDefault+stopImmediatePropagation한 뒤 child-escape로 본편에 즉시 귀환한다. 이 경로는 child NPC 대화의 Escape보다 우선하며 view-only에만 적용한다. 기존 standalone/clear host Escape는 그대로다. |

| 항목 | 현재 계약·근거 |
|---|---|
| 새 native 범위 | headed Chrome1/context1/page1/maxLivePage1/child동시1의 최초3조건 PASS, FAIL0/setupFAIL0/미도달0/exit0. main button→child 실제 표시/이동→Escape 귀환과 부모W 재개만 새 인수다. |
| 새 화면 표본 | controlsHidden true, child stageHeight612=viewportHeight612. root가 open/moving/return PNG3을 직접 판독해 실제 둘러보기·감춘 기술조작·이동 몸체·복귀 HUD/body 가시성만 한정 확인했다. |
| 오류·요청 | pageerror0/HTTP오류0. requestFailures5는 외부 font 의도 차단3과 local intro.mp4 abort2이며 후자 직접원인은 UNKNOWN. 모든 API는 합성 응답으로 격리, 합성 POST/api/mats1 forwardedfalse, save0/childAPI0/usersave0/durableACKfalse. context/browser closedtrue. |
| 미인수 | native GL·물리GPU 해제 UNKNOWN. 실main 전체 진행/native6/청취/실세이브/A급 미인수. 해부학적 발·전8방향·주민 전체 경로·물리 높이 미인수. 원화 확대 흐림·작고 어두운 몸·복귀 bonfire/portrait/FX 중첩이 남아 전체 VISUAL VERDICT RETOUCH. |

[입력·수명·정확 source 핀 정본](<../11내러티브·로어디자인/RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md>)과 [§23 전체 보고](<../4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md>)를 따른다. 기존 설정 footer·OPT·BINDS 및 사용자 설정 저장 항목은 변경하지 않았다.


### 2026-10-07 ROOT-MAIN-RIFT-NPC-PRESENCE-20261007 · 둘러보기 주민 접근 안내

본편의 격리된 지옥의 틈 둘러보기에서 주민 접근 안내를 화면 안에 추가했다. 숨겨진 실험용 aside를 다시 노출하지 않고, 기존 대화 소비자의 읽기 결과만 stage 안에 표시한다. 아래는 새 단위의 현재 계약이며 이전 ROOT-MAIN-RIFT-VIEW-CONSUMER 검수는 해당 소스의 이력으로 보존한다.

| 항목 | 현재 계약·한정 결과 |
|---|---|
| 범위·DOM | viewOnly=true에만 .stage 내부 div#view-npc-prompt.view-npc-prompt 생성. initial hidden=true, role=status, aria-live=polite. 일반 standalone/clear host의 aside와 #npc-near는 그대로다. |
| 문구 | `${nearestNpc.name.ko} · R로 대화` |
| 노출 | ready/live이며 paused/error/disposed/contextLost가 아니고, document.hidden=false, document.hasFocus()=true, activeElement가 world-canvas, 대화 view가 닫힘, 기존 nearestNpc가 있을 때만 표시한다. |
| 숨김·입력 | 조건 불충족 또는 clearIntent/stopFrame/fatal/dispose 수명 경로에서 숨긴다. leaf()의 자식 없는 노드만 갱신한다. R는 기존 canvas handler이며 새 클릭버튼·키 바인딩·44px target을 추가하지 않는다. |
| 배치 | position:absolute; bottom:70px; left:50%; transform:translateX(-50%); max-width:calc(100% - 32px); padding:10px 16px. |
| 스타일 | background:#101914ed; border:1px solid #d2ba83; border-radius:6px; color:#ead9ab; font-size:14px; text-align:center; pointer-events:none. |
| 갱신 한계 | 기존 time-lastUi >180ms UI 주기를 소비한다. 반경 이탈 직후 이전 안내가 잠깐 남을 수 있으며 R 실행은 fresh 위치로 검사한다. 추가 RAF/timer·매프레임 즉시 갱신 보장은 없다. |
| 새 CPU | 최종9dd71e4 source 신규4그룹27조건 PASS(동적21/정적6), VM21. 물리Node2는 준비pin 실패1·제품VM0과 실제 검수Node1을 구분한다. |
| 새 실제 화면 | 최초 headed Chrome1/context1/page1/child1. N1 도릭 근접 이름/R 안내 PASS, N2 실제R 정본대화·명시닫기·canvas focus·안내복귀 PASS. 뒤 parent 전체 localStorage 동등성 assertion은 hellsave_demo 변경으로 FAIL1, manual host return/post-return은 미도달, exit1. clean3PASS가 아니다. |
| 시각·권한 | root PNG2에서 안내/대화 가독은 확인했지만 작은 어두운 몸·주민/플레이어 및 cue 겹침·원화 확대 흐림은 RETOUCH. nearest/range/nav/대사/보상/quest/save 권한은 변경하지 않았다. |

최종 child source는 56848 B / SHA256 `9dd71e4a9cbc898e4b7a20610735f78feee668dab723c67b25f431bafe005dd8`다. 문서 담당자의 CPU/Chrome/Git 실행은 0이다. 저장소 동등성 실패의 원인과 실제 save/native6/청취/물리GPU·발·전8방향·전체주민 경로는 미인수다. [소스·검수 근거 정본](<../11내러티브·로어디자인/RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md>)과 [§23 전체 보고](<../4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md>)를 따른다.


### 2026-10-07 ROOT-MAIN-RIFT-SAVE-ADMISSION-20261007 · 저장 대기 후 둘러보기 입장

현재 둘러보기 버튼은 알려진 저장 예약/진행 중에는 입장을 기다리게 한다. 기존 위치·44px 최소높이·마우스/키 격리와 기본OFF 범위는 그대로이며, 새 저장설정 UI가 아니다.

| 항목 | 현재 계약·한정 결과 |
|---|---|
| scope | 실제 main의 http://127.0.0.1:3387 && ch1RiftView=1. 기본OFF·carry4제외·OPT/BINDS추가0. |
| disabled | _rootRiftViewSaveBusy() || !!_rootRiftViewJob. busy는 readiness/DB미준비·부팅 Set ticket·saving/debounce/pendingForce/dbSaveNow.pending을 본다. enabled는 저장대기 해제이지 다른 입장조건 전체충족을 뜻하지 않는다. |
| 정확 문구·우선순위 | owned면 '지옥의 틈 둘러보는 중'; 그외 busy면 '저장 중 · 잠시 기다려주세요'; 그외 '지옥의 틈 둘러보기'. |
| DOM 안전 | _rootRiftViewUpdateButton은 enabled/live와 connected button만 소비. children.length===0인 leaf 문구만 바꾸고 disabled/text 동일값 쓰기는 억제한다. 생성직후/기존 Block 경로 사용·추가RAF/interval0. |
| 부팅 예약 | 기존3000ms 예약4곳은 유지한다. ON에서 각각 Set ticket을 add하고 await dbSave finally에서해당ticket만delete. OFF는원setTimeout 그대로. settle는저장ACK가아니다. |
| 입장 Gate | 기존 stage/on/idle/class/lesson등 admission 뒤 busy면 save-pending으로 job/host생성 전에false. 저장취소/강제저장/진행권한변경0. |
| 새 검사 | CPU Node1/VM18/4그룹20PASS(동적18/정적2)·별도 headed Chrome1/context1/page1/child1 신규S1예약1→0와disabled→enabled/S2입장8초부모·저장표본/S3manualreturn·timer0/iframe0·buttonenabled의3PASS. 모두FAIL/미도달0·exit0. |
| 한계·이력 | 새표본은globalstorage lock/실saveACK가아님. 이전NPC native2PASS 뒤storageFAIL1/hostreturn미도달은과거source이력·재검사/합산0. rootPNG1에서몸/pet/복귀안내가보이는한정관측이며흐림/작고어두운몸으로전체RETOUCH. |

최종 game4100302 B/SHA256 `4166ed4b16d62fa87a47c39218553a3827a320b51c29cc553c64854901333c19`. API합성matsPOST1forward0/savePOST0/childAPI0/durableACKfalse·GLUNKNOWN·native6/audio/save/reward미인수다. [저장 정본](<../15 세이브+데이터구조/15 세이브+데이터구조.md>) / [소비자·근거](<../11내러티브·로어디자인/RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md>) / [§23보고](<../4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md>). 문서담당 제품실행/Git0, root보존예정.


### 2026-10-07 ROOT-MAIN-RIFT-NPC-PROMPT-FRESHNESS-20261007 · 주민 접근 안내 잔류 숨김

최종 `tools/2_5d-world-lab.mjs`는 **57096 B / SHA256 `d07e5520564dde709cb0e2469315e14f620e12bc950b6de29a0b22444148c255`**다. 기존56848/9dd71e4의180ms 잔류 설명과 당시 검수 결과는 그 source epoch의 이력으로 보존하며, 이 새 절이 현재 안내 갱신 계약을 우선한다.

| 항목 | 현재 계약 |
|---|---|
| 이름·표시 주기 | 기존 `time-state.lastUi >180ms` UI 주기를 유지한다. 새 대상 이름을 매프레임 즉시 표시한다고 보장하지 않는다. |
| cue 결과 | `pose(dt)`가 기존 `interactionCue.update`의 frozen snapshot을 반환한다. frame은 local `promptCue=null`로 시작하고 재생 중 move/pose 뒤 반환값을 받는다. |
| frame말 대조 | 유효한 frame에서 기존 updateUi 뒤·다음 RAF 예약 전에 검사한다. `active===true && disposed===false && approachVisible===true && nearestNpc && approachNpc===nearestNpc.npcId`를 모두 충족해야 이전 안내를 유지하며, 나머지는 view-only `#view-npc-prompt`를 숨기고 leaf를 빈 문자열로 만든다. |
| 대상·수명 | cue에는 이름이 없어 기존 nearestNpc의 이름을 쓴다. cue 누락/비활성/대상 불일치 및 paused frame의 null은 숨김 대상이다. 기존 clearIntent/stopFrame/fatal/dispose·canvas focus·대화닫힘 노출 가드는 유지한다. epoch 중단으로 frame이 일찍 끝난 경우 전체화면 최종숨김까지 새로 보장한 검수는 아니다. |
| 그대로인 계약 | CSS bottom70px/font14px 등 기존배치·주민좌표·nearest/range140/segment20/nav radius12·R fresh admission·대사/controller/보상/quest/save·카메라는 그대로다. 추가 nearest 탐색/입력/RAF/timer0. |

신규CPU22와 별도native2가 한정범위에서PASS했다. actual firstOut frame797은 lastUi보다175.1ms뒤이며 cached도릭nearest가 남아도 안내가숨겨졌다. root PNG2는직접판독했으나 after-out.png는첫이탈frame정확촬영이아니며 그근거는telemetry다. 기존도릭/저장대기검수와합산0·전체RETOUCH.

[상세계약·정확근거](<../11내러티브·로어디자인/RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md>) / [§23전체보고](<../4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md>). 문서담당제품CPU/Chrome/Git0·root보존예정.

### 2026-10-08 ROOT-MAIN-RIFT-VIEW-ZOOM-CONSUMER-20261008 · 둘러보기 확대/축소

현재 `tools/2_5d-world-lab.mjs`는 **60546B / SHA256 `9e82f40f140c125e71c3a8de63182c4c541f0bc4451b772acfb779739d4e05f0`**다. 아래는 새 view-only 줌 UI의 현재 계약이며, 앞선 view/NPC/freshness 작업의 소스 핀·검수 결과는 각 작업 당시 이력으로 보존한다. 기존 frame말 NPC 안내 숨김 계약은 유지한다.

| 항목 | 현재 계약 |
|---|---|
| 노출 | `view-only=1`의 stage 안 별도 `.view-zoom` 그룹. 숨겨진 aside를 다시 노출하지 않으며 일반 standalone의 기존 aside 확대 컨트롤 유지 |
| 버튼/표시 | `#view-zoom-out`의 `−`, `#view-zoom-in`의 `+`, 리프 `#view-zoom-value`의 정수 percent. 버튼 최소 가로/세로 44 CSS px |
| 원래 범위 | 기존 HTML `#zoom`: min80/max220/step5/value100. 80~220%, 5%p 간격, 초기100% |
| 소비 | 기존 range의 `stepDown()/stepUp()` → `applyZoomInput()` → `resize()` → `camera.zoom=Number(range.value)/100` → projection 갱신 |
| 경계 | 최소에서 축소/최대에서 확대 비활성. camera zoom을 .8~2.2 단위에서 finite 검증 후 표시용 percent만80~220 clamp/정수 반올림. `2.2*100`의 부동소수 오차로 정상 상한이 거절되지 않도록 구분 |
| 수명/identity | captured epoch/camera/scene/renderer/DOM/range 정의(min/max/step) 일치와 ready/error/contextloss/disposed 상태 확인. paused/hidden이면 조작 비활성 |
| 리프 안전 | captured output이 현재 ID 노드와 동일·connected·children0일 때 그 리프만 쓴다. 교체된 새 노드를 지우지 않음 |
| focus | 조작 성공 후 현재/usable이고 대화가 닫혀 있을 때만 canvas focus 복귀. 열린 대화의 선택지 focus를 강제 회수하지 않음 |
| 반복/저장 | 기존 updateUi/stopFrame/visibility 경로에 sync. 새 RAF/timer/저장 항목0; OPT/BINDS/로비carry4 추가0 |

줌은 기존 카메라의 화면 배율만 소비한다. actor의 world 크기/발 좌표, 원 PNG/scene/nav/배치, 근접 거리140, R/WASD/Escape, parent lease·저장 대기·복귀·클리어·보상 권한을 바꾸지 않는다. 다른 모드의 조작/scene 저장과 연결하지 않는다.

검수는 ROOT의 **최초 Node1 / 7그룹 / 25조건 PASS, FAIL·setup·미도달0 / exit0**다. 실제 소스의 resize/apply/install/stop/lifecycle/UI 생성 구역을 통제 DOM/range/renderer/dialogue 포트로 실행했다. 100→105→100, 220→215, 80 경계, paused/hidden/error/contextloss/disposed/epoch, 교체 리프, range 포트 재진입·throw, standalone UI0, 대화 focus 보존을 이 범위에서 확인했다. native `range.stepUp` 의미·실WebGL/GPU·실화면 인수는 아니다. 소스 peer의 새 actionable0은 정적 검토이며 별도 실행 성공으로 합산하지 않는다.

새 Chrome0/native **NOT_RUN**, 새 PNG0, 이번 UI 시각 **NOT_ASSESSED**다. 사용자 IAB tab13의 이전 로드 소스를 유지하고 reload/새 게임0이다. 전체 **VISUAL VERDICT: RETOUCH**. 실제 줌 가독성/버튼 겹침·전8카메라·발/물리높이/native6/audio/durable save는 이번에 인수하지 않았다.

[소비자·정확 근거](<../11내러티브·로어디자인/RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md>) / [§23 전체 보고](<../4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md>).

## 2026-10-08 시작 지역 제목과 지역 진행 HUD 분리

이번 기록은 **ROOT-CH1-AREA-TITLE-HUD-SEPARATION-20261008**의 현재 구현 계약이다. 이전 640×720 KO/EN 화면의 시작 제목·커진 HUD 겹침은 당시 관측 이력이며, 이번 소스만으로 시각 해결을 인수하지 않는다. 최종 working `game.html`은 4,112,493B / SHA256 `0b6beffafbb9d2335d668d14993a0b9b5d0e1f9a98a14d8668f019a0ff946e88`이다.

| 항목 | 현재 코드 계약 |
|---|---|
| 대상 | 재생 중인 `#areaTitle`과 표시 중인 `#mmLvl.on.region-progress` |
| 제목 resting top | `max(18%, calc(HUD의 실제 bottom + 15px + var(--gap-md)))`; 기존 `--gap-md=8px` 유지 |
| 유지 항목 | 제목3.1s·Y 이동−15..+7px·문구·폰트, 지역 HUD3줄·활성 scale 최소1/기본 글자12CSSpx 유지 |
| 조건 | 현재 title/panel/root DOM identity·connected·playing·G.on·visible·show·유한 양수 rect가 유효할 때만 적용 |
| 갱신 | observer/resize/visibility/animation 경계에서 실제 bbox 측정. 기존 update 첫 경계의 scope 확인은 활성 경로 bbox 읽기0; 비활성화는 다음 기존 update 경계에서 복원 |
| 소유·복원 | 첫 쓰기 직전 inline top 값과 priority를 캡처. 자기 값·priority가 모두 일치할 때만 원복; 외부 변경이면 hidden-first 경계도 포함해 해당 animation에서 양보 |
| 실패·종료 | observer 미지원이면 legacy 위치, pagehide에서 listener/observer 해제. 새 RAF/timer0, 게임 진행·저장 권한 변경0 |

검수는 실제 controller를 통제 DOM·MutationObserver·ResizeObserver·animation event에 연결한 Node1/VM9, 새6그룹25조건 PASS/FAIL0/준비실패0/미도달0/exit0이다. 이전 view zoom CPU25와 별도 epoch이며 합산하지 않는다. 새 Chrome/GPU/PNG0, native NOT_RUN, 이번 UI 시각 NOT_ASSESSED, 전체 **VISUAL VERDICT: RETOUCH**다. 사용자 IAB13의 이전 로드 화면은 재로드 없이 유지했다. 세부 계약·가이드 §23은 [MAP_RUNTIME_ARCHITECTURE](<../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md>)의 같은 TASK 절을 따른다.

제목과 regionBanner의 실제 겹침 및 640×720/1280×720 KO/EN 전체 animation·font/resize/언어·viewport fit은 아직 NOT_ASSESSED다. 기존 시작제목 겹침 RETOUCH를 현재 화면 개선 PASS로 바꾸지 않는다.


## 2026-10-08 메인 Rift 둘러보기 지면 선명도 기본값

**ROOT-MAIN-RIFT-VIEW-SHARPNESS-CONSUMER-20261008**는 숨겨진 기존 `plate-sharpness` select의 view-only 최초 요청값만0.5로 연결한다. 기존 −/+ 줌 leaf와80..220/step5/기본100% 계약은 유지하며 별도 사용자 설정UI를 추가하지 않는다. standalone·clearhost는 HTML 기본0이고 form restore 강제0는 주장하지 않는다. 기존 Number→terrain 소비/change handler/snapshot 유지, 1hunk/+48B다.

소스는60,594B / SHA256 `3a5b3e650a99f36e5734d5539ea80e27f58d85f8a40315bb628951c2bd315960`이다. effective0.5는 픽셀 ACK가 아니며 minification은 원plate 폴백이다. oldAB153/GUI13은 이전 epoch로 보존·재검수/합산0. 새 CPU/Chrome/PNG0, native NOT_RUN/UI NOT_ASSESSED/전체 RETOUCH. 열린 IAB14 view-only100%는 무조작·미재로드이고 다음 정상 재진입 소비이며 live 적용 주장은0이다.

현재 정적 계약과 §23 전 항목은 [HELL_RIFT_2_5D_SLICE](<../4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md>)의 같은 TASK 절을 따른다. CH1 외곽 썩은강/다른 적합 지역 용암은 다음 제안이며 구현·stage/좌표/geometry/배치/에셋 확정0이다.
