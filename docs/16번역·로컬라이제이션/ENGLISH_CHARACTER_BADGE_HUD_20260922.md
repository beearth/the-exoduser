# 영어 캐릭터·배지·HUD 보완 — 2026-09-22

| 대상 | 현행 계약 |
|---|---|
| 캐릭터 | localization/ui/en.json의 19개 설명·직업·특성 키를 생성 번들에 포함 |
| 배지 | tutorial-badges.js의 t→_L로 제목·설명·3종 이름/조건·상태·알림 번역 |
| 언어 전환 | refreshLanguage→render, 열린 알림은 toastId로 다시 번역. 획득 시각·저장·3.5초 타이머 유지 |
| HUD | 두 HTML의 _applyLang에서 _refreshPersistentHudLanguage 호출. 레벨/경험치/지역 처치/악의의 리프만 교체; 숫자 자식 보존 |
| 접근성 | mmLvl의 Player status 및 배지 모음 aria-label 번역 |
| 수집기 | tutorial-badges.js의 this.t와 detail/detailEn 쌍 수집 |
| 악의기둥 | 27언어 ui JSON 키/실번역 및 ui-needed 레지스트리를 5초→10초로 정정. 9기둥, 반경250+(Lv-1)×22, 쿨15초 유지 |
| 빌드 | tools/build-localization.mjs strict 모드 통과: 28개 story, uiSource779 |
| 검사 | 캐릭터/배지/HUD/번역 런타임/커버리지14개 PASS. 영상 및 전체 영어 완료 판정과 별개 |

## 캐릭터 영어 원본

| KO 키 | EN |
|---|---|
| 엑소듀서 전사 | Exoduser Warrior |
| 거대검을 휘두르는 흑철의 전사 | A black-iron warrior wielding a greatsword |
| 전사 | Warrior |
| 근접 화신 | Avatar of Melee |
| 거대검을 휘두르는 정면 돌파형 전투가입니다. | A frontline fighter who breaks through enemies with a greatsword. |
| 흑철의 방어 | Black-Iron Defense |
| 검은 갑옷으로 적의 공세를 견디고 되받아칩니다. | Endure the enemy assault in black armor, then strike back. |
| 파멸의 일격 | Devastating Strike |
| 느리지만 치명적인 광역 참격을 내리꽂습니다. | Deliver slow but lethal slashes across a wide area. |
| 실버테일 | Silvertail |
| 회전하는 단 하나의 검, 그녀의 춤은 파멸 | One spinning blade. Her dance brings ruin. |
| 블레이드 댄서 | Blade Dancer |
| 검무의 화신 | Avatar of the Blade Dance |
| 회전대검으로 사방의 적을 동시에 베어냅니다. | Cut down enemies on every side with a spinning greatsword. |
| 쌍단검 기동 | Twin-Dagger Mobility |
| 빠르고 민첩한 연속 공격으로 파고듭니다. | Close in with swift, agile chains of attacks. |
| 무희의 춤 | Dancer's Grace |
| 화려한 회피와 폭발적인 딜을 오가는 곡예입니다. | Flow between graceful evasions and explosive bursts of damage. |
| 블레이드 댄서. 회전대검, 단검 하나 | Blade dancer. Spinning greatsword and one dagger. |


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

## 2026-10-07 지역 목표·앵글러·게이트 사유 HUD — ROOT-CH1-REGION-PROGRESS-HUD-20261007

기존 두 HTML 공통 leaf-refresh 설명은 그 epoch의 계약으로 보존한다. 이번 새 예외는 Main `game.html`에만 추가되며 Easy까지 변경/검수했다고 해석하지 않는다.

| 위치 | 현재 Main 계약 |
|---|---|
| `_refreshPersistentHudLanguage()` | 기본 labels loop 직후 `_updateRegionKillLabel(G._regions&&G._regCurIdx>=0?G._regions[G._regCurIdx]:null)` 동기1회 |
| paused | active 판정에 paused 제외가 없으므로 paused 중 KO/EN 변경도 Target/Angler/Gate3줄 즉시 복구 |
| 초기화/비활성 | G.on=false에서 inactive; 늦은 REGION 상수 접근0, `지역 처치` / `Area kills` 폴백 |
| leaf 안전/캐시 | 특정 label/value leaf만 변경; `_hset`이 캐시와 실제 text/style을 비교하여 loop의 기본값 덮기를 복구 |
| 가독 복귀 | 활성만 `#mmLvl.region-progress` scale최소1/글자12CSS; inactive class제거/기존 transform 복귀 |

최초33a80의 language regression은 source 읽기 후 CPU/native 실행 전에 정정했다(그 핀 실행0). 29c1의 CPU68 및 native layout4+paused language2조건은 그 source 결과다. 최종B8에서는 class/paused 경계 한정 CPU8조건, KO/EN640 native2조건을 별도 기록하며 이전 결과를 새 source의 clean suite로 합산하지 않는다. ROOT PNG 판독은 transient startareaTitle overlap 때문에 **RETOUCH**다. language change 관측은 synthetic selectOption이며28언어·UI class 선택·실save/native6 인수는 없다.

최종 `game.html` working 4,092,122B / SHA256 `b8be6378b7d2805b32ca38f92cca03179f8f1ebb2732bebacec6300f5fe7ad3a`, ROOT owned 4,091,937B / SHA256 `05fa7031c8f1d4b1e02643e9fd9964f81c3a80a25d698ab22a002c2330f1ddc0`의 6개 hunk 기준이다. 기존 foreign 185B는 미채택 상태로 보존한다.

전체 런타임 계약·검수 epoch·§23 보고는 [MAP_RUNTIME_ARCHITECTURE.md](../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md)의 `ROOT-CH1-REGION-PROGRESS-HUD-20261007` 절을 따른다.
