# HUD 창 크기·페이지 줌 적응 — 2026-09-29

사용자 요구: 크롬 창 크기·해상도와 관계없이 게임 HUD의 디자인 비율을 유지한다.

## 원인과 현행 계약

| 항목 | 현행 값/동작 | 적용 위치 |
|---|---|---|
| 기준 해상도 | 1920×1080 | game.html / game-easy-test.html applyUIScale() |
| 자동 배율 | min(innerWidth/1920, innerHeight/1080), toFixed(4) | --ui-auto-scale → --ui-scale alias |
| 고정 상하한 | 기존0.5~3.0 제거. 유한한 양수이면 그대로 적용 | applyUIScale() |
| 잘못된 화면 크기 | 배율이 0/음수/NaN/무한이면 직전 CSS 값 유지 | Number.isFinite(autoScale), autoScale>0 |
| 갱신 시점 | 초기1회 + window resize | 기존 호출/이벤트 유지 |
| 기본 inset | 위/오른쪽/아래10px×scale | :root --ui-inset-top/right/bottom |
| HP/MP | 기준 구체175px, transform scale(scale×0.9), 아래10px×scale | .hp-globe / .mp-globe |
| 스킬바 | 기준820×182px, transform scale(scale×0.9), 아래(10−25)px×scale=−15px×scale | #skBar |
| 스킬 툴팁 | 아래(10+130)px×scale=140px×scale; 기존 폭/글꼴 별도 계약 유지 | #skBarTip |
| 상단 HUD | 기본58px×scale, 600px 이하190px×scale (+safe-area); 중앙 앵커. 상태 글자만 최소11px, 리프 여백/행간은 화면 px 유지 | #hudTop, ui-refinement.css |
| 자원 | 위(10+178)px×scale=188px×scale, 왼쪽16px×scale | #hudCorner |
| 시계 | 위(10+7)px×scale=17px×scale; 기준 폭170px | #stageClock |
| 상태 | 위(10+6)px×scale=16px×scale; 오른쪽(10+10)px×scale=20px×scale | #mmLvl |
| 미니맵 | 위/왼쪽8px×scale; 기준166×166px, transform scale(scale×0.85) | #mmWrap |
| 보스 | 위(10+18)px×scale=28px×scale; HP 기준500px, 포이즈 기준140px | #bossBar / .bhw / .bpw |
| 모바일 중복 축소 | max-width600px의 보스바300px/80vw 재계산과 상단 HUD 좌우8px 재배치 제거 | 기존 미디어 쿼리 |
| Safe area | 실제 env(safe-area-inset-*)는 추가로 그대로 적용 | 기존 safe-area 표현식 |

CSS 크기 제한과 transform 자동 배율을 중복 적용하지 않는다. 이전 시계104px/13vw/170px 및 보스 HP500px/70vw 폭 제한은 기준 폭으로 교체했다. 1920×1080 기준 배치는 유지한다.

## 관측과 검증 범위

이전 실행 페이지에서 innerWidth11252/innerHeight5048/devicePixelRatio0.25와 UI 배율3을 관측했다. 최단 변 기준 필요한 배율은4.6741이다. 고정 상한으로 HP 표시가118.125 화면 픽셀 상당으로 축소되며 정상 창2813×1262의184.039와 달랐다. 브라우저 내부 줌 설정은 보안 정책으로 열지 못했으므로 25% 줌은 이 수치에 근거한 추정이다. 이후 새로 확인한 사용자 게임 탭은2813×1262/DPR1/배율1.1685였다. 에이전트가 Chrome 설정을 복원했다고 주장하지 않는다.

| 검증 | 결과 |
|---|---|
| 수정 전 회귀 | uiAutoScale 8개 중6개 실패: 줌·작은 창/8K·잘못된 크기 |
| 수정 후 자동 테스트 | uiAutoScale8 + persistentHudLanguage2 + actionHudUpdates4 =14 PASS |
| 실제 HUD DOM/CSS | 두 HTML 각각6 viewport =12 사례. 일반 창, CSS viewport4배/0.25표시, 1/5 viewport/5배표시,640×360,7680×4320,21:9 |
| 브라우저 검수 방식 | 원본 HTML의 HUD DOM·스타일과 applyUIScale()을 독립 iframe에 로드. Chrome 줌/viewport 설정을 변경하지 않음 |
| 표시 크기 | 2813×1262: HP184.0388/bar862.3530; 11252×5048을0.25배 표시: HP184.0427/bar862.3715 |
| 여백 | 구체10×scale, 스킬바−15×scale, 상태16×scale을 실제 bounding rect로 확인 |
| 검수 파일 | tmp/ui-scale-20260929/hud-layout.html |

메인 패널의 rem/vw 최대 폭·모바일 메뉴 구성은 별도 계약이다. 이 변경은 HUD 자동 배율/앵커에 한정하며 월드 캔버스 rz()/카메라/OPT.resScale/세이브/스킬/VFX 로직은 변경하지 않는다. 기존 리소스 부족 문제 전체가 이 HUD 변경으로 해결됐다고 판단하지 않는다.

## 최종 확인

| 항목 | 결과 |
|---|---|
| 실제 실행 게임 | on=true/paused=false/2813×1262/DPR1을 UI 적용 전후 유지. 저장된 함수와16개 CSS 치환만 새로고침 없이 적용, 화면 확인 |
| 검수 최종 | 원본 HUD 스타일의 크기·여백·시계170px·보스 HP500px 포함12/12 PASS, QA 오류0 |
| 파일 검증 | 두 HTML의 실제 HTTP200 응답 바이트와 디스크 바이트 동일. fetch.text()는 easy HTML의 기존 UTF-8 BOM을 제거하므로 문자열 길이는1 차이 |
| 문법 | 두 HTML의 인라인 스크립트 합계12개 파싱 PASS, import map JSON 파싱 PASS |
| 회귀 | 최종14/14 PASS. rz() 본문은 UI 작업 전 백업과 동일 |
| Git | 관련9파일 패치 tmp/ui-scale-20260929/changes.patch, 편집 전 사본에 적용 가능 여부 확인. 관리형 .git 읽기 전용으로 stage/commit 미수행 |
| 패키지/업로드 | 이번 변경으로 패키징·배포·외부 업로드 미실시 |

실행 중인 페이지 수정은 소스 저장을 대신하지 않는다. 원본 디스크/HTTP 응답·새로 고친 독립 HUD 검수 화면·실제 게임의 즉시 반영 상태를 각각 확인했다. 전체 게임 페이지의 강제 새로고침은 진행 상태를 보존하기 위해 수행하지 않았다. 확인 메타데이터는 tmp/ui-scale-20260929/verification.json에 기록했다.

## 2026-09-29 펫 대사·하단 구체 겹침 수정

| 항목 / 적용 위치 | 현행 계약·검증 |
|---|---|
| 원인 | petSubtitle의 고정 bottom120px가 UI 배율과 무관해 HP/MP 구체 장식 및 스킬바와 겹쳤음. 본편·easy-test 각6화면×2화자, 수정 전16/24 겹침 |
| 컨테이너 위치 | game.html/game-easy-test.html의 petSubtitle: position fixed; bottom calc(var(--ui-inset-bottom,0px) + 220px * var(--ui-scale,1) + env(safe-area-inset-bottom,0px)). 기준1920×1080/inset10px에서230px. 창 크기·safe area 변화에 CSS가 즉시 대응 |
| 하단 경계 | 구체 기준175px/배율scale×.9, glass 장식263px의 상단 돌출44px까지 포함한 경계207.1px×scale보다 대사 하단이22.9px×scale 위. 구체 장식·수치·스킬바를 가리지 않음 |
| 보존 | 초상화480px·이미지 v4·scale(ui-scale×1.5), 좌/우20px, crow 텍스트92/237/306/51 및 cat122/250/190/42, 글자.92rem·굵기700, opacity 최대.6/지수.6 페이드 유지. 발화·pair·우선순위·쿨다운·음성·패드 키 치환·저장/전투 로직 변경 없음. 사망 화면 듀얼 초상화의 위치는 별도이며 변경 없음 |
| 브라우저 경계 검사 | 실제 두 HTML에서 HUD DOM/CSS 및 표시 함수를 추출한 iframe. 1920×1080/1280×720/640×360/2560×1080/800×1200/2534×1235, 까마귀/디로이 각1회:24/24 PASS. 대사와 장식 간격7.635~26.194px, 프레임 화면 밖 이탈0 |
| 실제 게임 | 디스크의 저장된 bottom 속성만 열린 게임에 hot apply. 적용 전후 ontrue/pausedfalse, 발화 t27/mt240/pairtrue 동일. 이후 실제 전투 중 까마귀 대사·HP/MP·스킬바 분리 화면 확인. 사용자 게임 강제 새로고침 없음 |
| 회귀 | petLanguageRefresh/petGateLockedDialogue/petRageFullDialogue:3/3 PASS. 두 HTML 인라인 스크립트 문법 검증 및 HTTP 원본/디스크 바이트 확인 |
| 검수 파일 | tmp/pet-hud-20260929/qa.html 및 변경 전 백업. 검수 프레임은 플레이 흐름 전체 검증을 대신하지 않음 |
| 소스 제어 | 기존 dirty/staged 작업 보존. 이번 위치 변경·문서 동기화 완료, 관리형 .git 읽기 전용으로 커밋 미수행. NW.js 패키징·Steam 배포 미수행 |


## 설정창 예외 규격 (2026-09-29)

| 대상 | 현행 규칙 |
|---|---|
| #settings.panel .pbox | CSS viewport 기준 100vw−24px / 100dvh−24px, max-width/max-height none. 폭600px 이하 −12px. 전체 HUD ui-scale과 별개로 읽을 수 있는 설정명16px/키캡14px을 기본으로 사용 |
| 반응형 | 폭1100px 이하 그룹1열, 폭600px 이하 설정명14px/키캡12px. 높이650px 이하 제목52px로 축소. 상세 SETTINGS_UI_WORKSPACE_20260929.md |


2026-10-01 UI03: 상단 상태 표시만 작은 창 판독을 위해 자동 축소에 최소11px 예외를 둔다. width/max-width는 transform 전 scale 역산으로 이중 축소를 피한다. [수치·실화면 검수](../0마스터플랜/mac-resume-20261001/UI03-상단전투정보-검수.md). 나머지 HUD 자동 배율 계약은 유지한다.
