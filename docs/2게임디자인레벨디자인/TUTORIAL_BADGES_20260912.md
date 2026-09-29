# 튜토리얼 수료 배지

| id | 배지 | 실제 획득 조건 | 디자인 |
|---|---|---|---|
| combat | 지옥의 첫걸음 | 이동·전투 1단 12개 체크 모두 성공 | 청동색 방패·교차 검 |
| resources | 불굴의 생존자 | 자원·정신력 2단 활성8개 체크 모두 성공(내부 step0·1·2·3·10·7·8·9) | 청록색 마름모 문장 |
| systems | 지옥의 개척자 | 시스템 7개 행동 체크 모두 성공 | 금색 문·완료 문양 |

`tutorial-badges.js/css`를 두 게임 HTML에서 로드한다. 실제 `completeStep`의 마지막 성공과 시스템 `record`에 연결하며, 완료하지 않고 건너뛴 항목은 배지를 주지 않는다. 중복 획득/중복 알림을 막는다. 배지는 장식용이며 스탯·화폐 보상은 없다.

| 기능 | 동작 |
|---|---|
| 모음 | 획득0개는 버튼 숨김. 획득1~3개는 우측 상태창 아래 배지 N/3 버튼. 클릭하면 3개 배지와 획득/미획득 조건을 표시 |
| 획득 알림 | 상단 중앙에 3.5초 동안 작은 이름 알림. 입력/게임 진행을 막지 않음 |
| 그림 | 코드로 작성한 SVG 문장, 각자 청동/청록/금색. 외부 이미지·폰트 추가 없음 |
| 보관 | localStorage `exoduser:tutorial-badges:v1:<slot>`에 획득 시각 기록. URL slot이 없으면 main. 같은 브라우저·같은 슬롯에서 재접속하면 유지 |
| 저장 범위 | 서버/계정/게임 세이브 동기화는 없음. localStorage 차단 시 현재 실행 중 획득/표시는 동작 |
| 접근성 | 버튼 펼침 상태·영역 이름·획득 role=status·포커스 표시. 키/마우스 해제 이벤트는 게임에 전달 |

검증: `node tools/test-tutorial-badges.cjs`로 미완료 미지급, 중복 차단, 3종 지급, 저장 복원, 슬롯 격리, 저장 실패 폴백, 양쪽 HTML 로드를 검사한다. 실제 브라우저 시각 검증은 별도 필요하다. 배포 시 JS/CSS 두 파일을 포함한다.


## 2026-09-22 영어 캐릭터·배지·HUD 후속

| 대상 | 현재 구현 |
|---|---|
| 캐릭터 | 신규 소개·직업·특성19개 영어 등록 |
| 배지 | 3종 이름·조건·모음·알림 영어, 언어 전환 시 획득/알림 타이머 보존 |
| HUD | _applyLang에서 리프4개 및 플레이어 상태 aria-label 즉시 갱신. 일시정지에서도 적용 |
| 악의기둥 | 기존27언어 원본 JSON에는 5초가 남아 있었음. ui-needed와 실제 번역을10초로 고쳐 strict 빌드 복구 |
| 검증 | 번역 빌드와 관련14개 검사 PASS. 캐릭터 영상/타 언어 신규 실습은 후속 |

상세: docs/16번역·로컬라이제이션/ENGLISH_CHARACTER_BADGE_HUD_20260922.md


## 2026-09-29 미획득 배지 HUD 숨김·상태 수치 겹침 수정

| 대상 / id | 현행 구현·검수 |
|---|---|
| 사용자 기준 | 획득 배지가 없으면 HUD에 배지0/3·빈 버튼·자리 표시를 남기지 않는다. 지역 처치·악의 수치를 가리지 않는다 |
| 표시 조건 | tutorial-badges.js의 init에서 button.hidden=true로 시작. render에서 count=Object.keys(earned).length; count===0이면 button/panel hidden=true 및 aria-expanded=false. 1~3개 획득·복원 시 button.hidden=false. 언어 갱신에도 같은 조건 적용 |
| 모음 열기 | toggle(open)은 button.hidden이면 열기를 거부하며 숨긴 버튼에 focus하지 않는다. 배지가 있으면 기존 닫기 초점/버튼 복귀·aria-expanded·3개 카드 정책 유지 |
| 위치 | button과 collection을 #mmLvl의 자식으로 연결. 둘 모두 position:absolute/right0/pointer-events:auto; 버튼 top:calc(100% + 8px),모음 top:calc(100% + 46px). 상태창의 기존 크기·UI배율·safe-area 이동을 따라가며 수치 행과 겹치지 않음 |
| 표시 CSS | button[hidden]/collection[hidden]/toast[hidden]은 display:none!important. 기존 버튼 padding5px10px/border1px/radius3px/font12px/1.5 유지. #mmLvl 미존재 폴백은 body에 연결,button fixed right20px/top180px,collection fixed right20px/top218px/width min(360px,100vw−40px)/max-height calc(100dvh−238px) |
| 획득·보관 | combat12/resources8/systems7 실제 완료 체크·중복 지급 차단·저장키·3.5초 알림 유지. 알림은 body에 남기며 배지 표시 정책으로 획득 기록이나 저장 데이터를 삭제하지 않음 |
| 적용·캐시 | tutorial-badges.js/css와 game.html/game-easy-test.html. 두HTML 모두 JS/CSS캐시20260929-earned-hud |
| 회귀 | 신규 표시·첫획득·복원·HUD연결4건 수정 전FAIL→수정 후PASS,기존 번역1건PASS. tools/test-tutorial-badges.cjs의 지급/중복/저장/슬롯격리/차단폴백/양HTML연결 검사PASS |
| 원본 브라우저 | Node3333 본편 독립 QA 슬롯에서 수정 전 배지0/3의 상태창 겹침true→수정 후 hidden=true/display:none/rect0. 메모리의 획득1개 상태는 상태창 bottom171.834px/버튼 top180.014px,겹침false. 모의 획득은 저장 API 호출 없이 earned만 변경 |
| 시각·입력 검수 | 원본 HUD DOM/CSS·배지JS를 분리한 fixture에서0개/1개 스크린샷,배지 모음 실제 클릭→닫기 초점/화면내 배치→닫기→0개 숨김 확인. 브라우저 viewport2534×1262,override없음. fixture는 UI 검수이며 튜토리얼 완료 플레이 검증은 아님 |
| 현재 게임 | 열린 demo 게임에도 디스크의 render/toggle 함수와 CSS를 hot apply. count0/hiddentrue/displaynone/지역 처치0/168 전체 노출을 실제 플레이 스크린샷으로 확인. 게임 ontrue/pausedfalse 유지; 재시작·저장쓰기·획득기록 수정 없음 |
| 기록·상태 | tmp/badge-hud-20260929에 before/fixture/docs전체검색/검수계약 보존. 기존 dirty·staged 작업 보존. .git 관리형 읽기 전용으로 커밋 미완료; NW.js패키지·Steam배포 미수행 |
