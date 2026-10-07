# 다크드루이드 데모 피날레 v0.3 — 카메라·최종 처치·밸런스 측정

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.

2026-09-09. 사용자의 “계속해”에 따른 후속 구현. 전투 패턴 수치는 [피날레 설계](DARK_DRUID_DEMO_FINALE_DESIGN.md) §0의 v0.2 계약을 유지한다. 이번 변경은 `?demo`/`?bic`, 마지막 stage=si3의 피날레에 적용한다.

## 구현 계약

| 적용 위치 / id | 현행 값·동작 |
|---|---|
| `_druidFinaleFrame(e,px,py,vw,vh,out)` | `_isDruidFinale`이며 플레이어와 거리≤1100px일 때 전용 프레이밍. `out`은 `G._druidFrame`을 재사용. 멀리 떨어진 입구 접근에서는 플레이어+look-ahead를 추적 |
| 시각 경계 | `_CODEX_BOSS[3]`의 dw9.3/dh14.1, dh=`e.r×14.1`. 반폭=max(`e.r×9.3×.5`,`dh×.56`), 기준발=`e.y+_btOffsetY−6×_btScaleMul`. 상단=기준발−dh×.86−24, 하단=max(기준발+dh×.14,e.y+e.r+120). 플레이어 x/y±100도 포함 |
| 잠행 경계 | 표적 고정 상태의 Under/Erupt는 `_diveTx/y ±(e.r+140)`까지 포함. 잠행 중에도 기립 높이 경계를 유지해 형태 변환마다 줌이 튀는 것을 줄임 |
| 화면 여백 | 위=min(100,vh×.14), 아래=min(155,vh×.22), 좌우=min(100,vw×.08). y중심은 아래−위 여백의 차를 `2×zoom`으로 나눠 보정 |
| 줌 | `clamp(min((vw−2×좌우여백)/경계폭,(vh−위−아래여백)/경계높이),.30,.80)`. 넓게 볼 때 보간 `1−.88^dt`, 다시 당길 때 `1−.98^dt`. 일반 보스는 기존.80/일반 보간.94 유지 |
| 추적·클램프 | 기존 위치 보간·정수화·맵 bounds clamp 유지. 데모 피날레는 테스트베드에서도 전용 프레이밍 사용. 일반 bosstest는 기존 플레이어 중심 유지. 맵 geometry/collision 변경 없음 |
| `_druidFinaleBoss` | 카메라의 살아있는 보스 참조 및 `hurtE`의 보스 사망 판정 진입 때 보존. HUD가 죽은 `_bossRef`를 null로 비워도 부활 대기와 최종 판정에 사용. `initStage`, `_enterBossArena`에서 null 초기화 |
| 카메라 유지 | 보스 alive, `_reviveTimer>0`, 또는 승리 t<90f 동안 전용 프레임 후보 유지. 승리 후 90f가 지나면 플레이어 추적·zoom1로 복귀 |
| 마우스 | `_setMousePosition`은 실제 화면좌표를 `mouse._screenX/Y`에도 보관. `_syncDruidFinaleMouse`가 이벤트 직후 및 카메라 갱신 후 `중심+(실제좌표−중심)/zoom`으로 기존 월드 조준용 mouse.x/y를 보정. 데모 피날레 아레나에서 적용, 일반 화면은 raw 그대로. `_gpActive`이면 게임패드 조준을 덮어쓰지 않음. 피날레에서 기존 `_mouseFacingReady`가 있으면 `_setMouseFacing`으로 갱신 |
| 펫 대사 | `_petSay`: 살아있는 피날레에서 `_PET_SURV_W[id]`에 없는 tier≤2(분위기/튜토리얼/진행 잡담)는 새 출력 거부. 생존·핵심 전투·전투조언은 유지. 이미 표시 중인 자막을 강제로 지우지 않음. 격파 후에는 일반 출력 복귀 |
| `_finishDruidFinale` | `_isDruidFinale`, `alive=false`, `_reviveTimer≤0`, `_druidDefeated` 미설정일 때만 실행. 기존 방 완료 판정의 부활 대기 검사 뒤 호출, 같은 보스는 1회만 실행 |
| 잔류 공격 정리 | 최종 확정 시 `_druidPoison && !friendly` 탄만 `_recycleProj` 후 제거. 아군 반사탄·타 적탄 보존. 단독 드루이드 아레나의 `_lavaPools`, `_druidOrbs` 비움. 부활 대기 중에는 정리하지 않음 |
| 승리 효과 | 기존 `druid_shockring`: max(.5,e.r×4/256),6f/frame. blast light 반경320/수명45/RGB170,210,110. helper의 shake8 뒤 공통 방 완료가 `G.shake=10×OPT.shake/100`으로 설정. `BGM.play('victory')`. 공통 SFX.victory·보물상자·출구 생성도 기존대로 실행 |
| 승리 상태 | `G._druidVictory={boss:e,t:0}`. update에서 dt 기준 t=min(210,t+dt), 일시정지 시 진행 정지. 기존 등장 `_bossCine.active=false`. stage/arena 생성 때 상태 초기화 |
| `_drawDruidFinaleVictory` | t<210f, alpha=clamp(min(t/30,(210−t)/45),0,1). y=VH×.3, 전체폭 배경(y−52,높이122), 배경 alpha×.78. 입력을 막지 않으며 보상 회수 가능 |
| 승리 문구 | `다크드루이드 격파 / DARK DRUID DEFEATED` 13px, `썩은 숲 해방 / THE FOREST IS FREE` min(34,VW×.027)px, `보상을 회수하고 출구로 향하세요 / Claim your reward and head for the exit` 12px. `_L` 사용. 색상 순서 #d4dda0/#f1e8c8/#bbc8b0, 선 #849565·300×1px, 배경 #0b100d |
| 텍스트 렌더 계약 | 배너의 px 크기로 시작하는 폰트는 유지. 2026-09-10 공용 WebGL2/WebGPU 아틀라스도 CSS의 px 크기 토큰을 읽도록 수정했다. `900 22px`의 크기는 22이며 셀 높이는 44px이다. 숫자 굵기를 크기로 오독해 512px 아틀라스를 매번 비우던 결함을 수정했다. [Mac 실기 조사](../12퍼포먼스·최적화/MAC_TEXT_ATLAS_FPS_20260910.md) |
| 종료 경로 | 부활 최종 판정→승리 배너/음악→보물상자·출구→클리어의 `데모 종료` 버튼→demoEnd. 기존 3초 부활 대기·부활 확률·포인트·HP/ATK·쉴드·보상 수치 변경 없음 |

## 검증과 재현

- 관련 Node 회귀 48/48 PASS: 새 presentation 7건과 기존 피날레·Q분류/반사·독탄·독늪·보스부활·테스트카메라·펫 대사·전체 인라인 문법.
- `tools/verify_druid_finale_presentation.py`: 1280×720/1600×900/1920×1080 × 동서남북400px =12개 실제 WebGL 캡처. 실제 게임 카메라 블록을 동일 브라우저에서 240tick 실행해 정착 화면 검증. 전투 전체의 자동 플레이 성공을 의미하지 않는다. 단위 검사는 남쪽650px도 포함.
- 실제 마우스 이벤트 후 월드 표적 오차<2px, 조준 각도 오차<.01rad. 최종 사망의 180f 대기 동안 승리 없음, 완료 후 victory 음악·독탄0/독늪0·demoEnd 실제 클릭 연결 확인.
- 감속90f 상태에서 실제 D 더블탭 입력: mkP 기본 bladeDash1·현재 장비 스탯·정상 기동게이지 비용으로275.12px 이동, HP 손실0/피해함수 호출0, 보스 생존 및 `bossDruidRest` 복귀. 잠행 초기화에 필요한 `_teleOx/y`를 빠뜨렸던 QA 스크립트의 NaN을 보정한 뒤 유효한 공격 회피를 재검증했다. 원래 공용 기동/감속 수치 변경 없음.
- `tools/verify_druid_finale_controls.py`: 실제 Q 입력/반사, 제자리 페이즈 전환, 돌진 방향/분출 표적 고정, rest96f 반격과 종료 경로 회귀 PASS. 2026-09-09 재실행 Q 반사1발/parryBank279, 반격 쉴드100 감소, pageerror/404=0.
- 시각 검수로 큰 제목 미표시를 발견해 폰트 아틀라스 크기 해석을 수정한 뒤 재캡처. 회귀 테스트는 기술 PASS이며 아래 환경 시각 판정과 구분한다.
- 근거: `captures/druid_finale_20260909/presentation.json`, `camera_*`, `victory.png`, `ending.png`, `balance.json`. 카메라 자동 검사·승리 캡처에서 테스트 캐릭터를 사용했다. 별도 밸런스 측정은 아래처럼 테스트 강화치를 초기화했다.

## v0.3 장비·부활 측정 이력 (현행 v0.4 이전)

당시 예상 피날레 진입 레벨/빌드를 질의했다. 이후 사용자가 전체 진행을 지시하여 v0.4는 아래 비교군을 기준으로 조정했다. 임시 비교군은 Lv1/T0일반, Lv30/T0마법, Lv60/T0희귀. 패시브·배분 스탯·강화0, 자동 레벨 스탯, 기본 kiSlash1, 실제 mkItem 장비(seed909) 사용. 테스트의 HP9999/ATK500/INT5000/GOD 리젠을 제거하고 `mkP→recalcSt→applyStats` 및 해당 레벨에서 `mkEn`으로 보스를 새로 생성했다.

12초 실제 LMB 홀드 중 보스 위치와 휴식 상태만 고정하여 출력량을 비교했다. 무기 공격·원래 플레이어 시스템이 주는 실제 `hurtE` 후 HP/쉴드 감소를 합산한다. 자원을 무한 보충하지 않는다. 아래 환산값은 회피·공격 기회·스킬 성장·부활을 고려하지 않은 **첫 HP+쉴드 출력 환산 시간**이며 실제 전투 TTK가 아니다.

| 비교군 | HP / ST / MP | meleeRef | 보스 HP / 쉴드 | 12초 실측 피해 | 실측 DPS | 첫 HP+쉴드 출력 환산(초) |
|---|---|---|---|---|---|---|
| Lv1 / rarity0 / tier0 | 563 / 303 / 239 | 36 | 22278 / 22278 | 15341 | 1270.6 | 35.1 |
| Lv30 / rarity1 / tier0 | 955 / 387 / 408 | 83 | 1255330 / 1255330 | 37679 | 3105.2 | 808.5 |
| Lv60 / rarity2 / tier0 | 1601 / 442 / 634 | 191 | 7325117 / 7325117 | 111015 | 9203.5 | 1591.8 |

이 QA 당시(v0.4 전) 보스 HP는 `floor(floor((.4×monLv³+199×monLv+100)×2.925×24×dm×et.hpMul)×1.06)` (Lv≤500, si3), 쉴드는 같은 값이다. 레벨 상승 시 HP가 세제곱으로 늘어나는 반면 이 임시 비교군은 스킬1렙이므로 성장 빌드의 완성도를 대변하지 못한다. 세제곱 HP와 반복 부활의 결합을 다음 밸런스 작업에서 우선 검토하되, 이 측정만으로 공통 HP 곡선을 변경하지 않았다.

부활은 현행 production의 즉시 확률식과 폴백 기초식을 읽어, seed909·각10,000회 시뮬레이션했다. si3/초기218pt, 기본사망10pt + 신성력 보너스, 폴백10pt. 풀피 처치+2/구속의영역+3 및 영역의 추가 신성력은 제외. 첫 사망 이전 생명은 아래 부활 수에 포함하지 않는다.

| 신성력 | 평균 부활 | 10분위 | 중앙값 | 90분위 |
|---|---|---|---|---|
| 0% | 10.5525 | 9 | 10 | 12 |
| 30% | 8.5478 | 7 | 8 | 10 |
| 60% | 6.5343 | 5 | 6 | 8 |
| 100% | 3.9352 | 2 | 4 | 6 |

결론: 신성력 없는 비교 조건에서는 중앙값10회 부활로 여러 번 전투를 반복한다. 실제 데모 진입 빌드·허용 총 전투시간·신성력 접근성을 정해 전체 플레이로 조정해야 한다. 부활 확률/포인트 및 공통 Q/E/기동 계약은 이번 작업에서 유지했다.

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | 데모 si3 아레나 전투 카메라·최종 처치 QA |
| MASTER | silhouette / regions / main route / side spaces 모두 기존 유지 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH / major holes 변경 없음; 전체맵 환경 재심사 범위 밖 |
| LARGE | source assets / composites / overlap / repeated silhouette 변경 없음; 기존 드루이드와 VFX만 사용 |
| MEDIUM | connections / remaining holes 변경 없음 |
| GROUND | shadow / contamination / structure integration 변경 없음. 최종 사망 확정 때 잔류 독늪 제거 |
| PLAYABLE | main arenas/travel space 유지. breathing=기존96f, threat=기존3막. combat readability=전신·플레이어 프레이밍, 비긴급 잡담 억제, 조준 배율 일치 |
| LANDMARK | primary / secondary / tertiary 변경 없음 |
| CAMERA QA | ARENA/BOSS=3해상도×4방향 캡처 및 실제 줌/포인터 검증. EXIT=실제 출구 통과·demoEnd. START/EARLY/SIDE L/SIDE R/LANDMARK/LATE의 전체 지역 환경 보드 재제작 미실시 |
| TECH QA | 관련48개 테스트·브라우저 pageerror/404=0. route/collision/seam/loading 구조 변경 없음. 전체맵 성능 벤치마크는 미실시; 프레이밍 out 재사용·기존 위치/줌 보간 사용 |
| FILES | stage-owned: game.html, test/druidFinalePresentation.test.js, tools/verify_druid_finale_presentation.py, tools/measure_druid_finale_balance.py, 관련 docs. concurrent touched: 별도 트레일러 문서/도구는 수정·스테이징 제외. unrelated touched: 없음 |
| GIT | 코드·검사·도구·docs를 같은 커밋으로 기록. push/deploy 없음. 이전 동시 작업 커밋을 amend하지 않음 |
| VISUAL VERDICT | **RETOUCH** — 검사한 전투 구도의 전신 잘림과 승리 제목 누락은 해결. 아레나 반복 바닥/외곽 구성 전체, 실제 진입 빌드의 전투 시간·피로도·큰 이동 직후의 동적 카메라는 출시 승인 전 추가 검수 필요 |
| NEXT PASS | 사용자 진입 빌드 확정 후 총 전투 TTK/부활/자원 압박 조정, 실제 완주 영상에서 동적 프레이밍 검수, 3막 음향 고조·등장/재도전 동선 |

백업: `tmp/druid_finale_20260909/game.before.html`. docs 전체 `grep -r` 검색 결과의 기존 드루이드 설명·카메라·펫·사망·번역 문서에 v0.3 예외와 이 문서 링크를 동기화했다. 보호된 `2_3 돌진+패링+방패시스템` 문서는 수정하지 않았다. 검증 훅의 `tools/guard.baseline.json` 게임 줄 수도59933→59987로 동기화했다.

> 2026-09-10 현행 공통 HP는 `_enemyHpPacing(monLv)`를 곱한다. 데모 si3는 v0.4 전용식 그대로다. 이 문서의 과거 측정 수치를 현행 HP로 사용하지 않는다. [현행 밸런스](../14밸런스+수치테이블/EARLY_COMBAT_5_7_1_20260910.md).


## 2026-10-03 source27 — 새 스테이지의 드루이드 공격 상태 초기화

| 정확 key / 적용 위치 | 현재 값·동작 | 보존 경계 |
|---|---|---|
| `G._druidOrbs` / 일반 `initStage(si)`의 기존 보스 패턴 정리 끝 | 새 빈 배열 `[]` | 이전 스테이지 ORB 객체는 수정·재사용하지 않음. 현 스테이지 ORB producer/접촉/피해/수명 코드 불변 |
| `G._druidOrbT` | 0 | 이후 실제 tick에서 다시 증가. 기존 110f/3발/6.8 frame 속도 불변 |
| `G._druidParryT` | 0 | 이전 스테이지 Q 리듬탄 누적 시간만 제거. 주기·수량·피해·Q/E 규칙 불변 |
| `G._druidParryVolley` | 0 | 이전 웨이브 번호 제거. 이후 기존 발사 시 다시 증가 |
| 양판 코드 | `G._lavaField=null;G._gwPillar=null;` 뒤 각70B 추가 | `_enterBossArena`·retry field 복귀에 이미 있는 네 초기화와 동일. 새 helper·전역정리·삭제0 |
| 다른 분기 | bosstest early-return는 기존 arena 초기화 위임 유지 | 사망 대기/부활 중 clear 추가0. HP50%/180f·si3 피날레·field snapshot46key·save schema·P/INV·플레이어 VFX 불변 |
| 검수 | 원본16개 중4PASS/12FAIL → 후보18PASS → 생산18+기존필드50+사망음향36=104PASS | 실제 전체 initStage 및 실제 ORB tick 원문 실행. 맵/적 생성·render/audio는 대역; 원본/후보 정상stage 전체G/P/events 동일. native·전체맵/청취 인수 아님 |
| Mac / 진행 | source27 코드 checkpoint 시점에는 새 앱 포장 전이었음(후속 현재 포장은 아래 표) | source26/3401은 이전 코드의 실제 숲1·일반 사망 retry·inventory 이력 보존. 이번 CUA 관측은 맥 잠금으로 중단, 사용자 해제 질문 대기. 보스/4지역/획득장착/저장재로드 미인수 |

정본·정확 SHA·대역/fixture·§23 보고는 `docs/8.1보스디자인바이블/DRUID_STAGE_TRANSIENT_LIFETIME_20261003.md`를 따른다. 기존 source14 복귀 정리와 source26 음악 예외 계약은 유지하며 이전 문단은 해당 시점 이력이다. native 보스 사망 시 문/몬스터 진행 보존의 완료 선언이 아니다.


## 2026-10-03 source27 Mac 별도 후보 — 포장/파일 검수 완료, 실제 기동 미실시

| 항목 | 현재 정확 상태 |
|---|---|
| 생산 코드 / job | `3c7dc6ab1cb0bc68cc3b969e27d06204fbe0f97f` / `953a5489-91eb-4d43-9c18-f05454ad27a7` / port3402. 일반 initStage 드루이드 ORB=[]/타이머3=0 각70B 포함 |
| 실제 포장 | frozen7918 입력/runtime340 재사용, 새job execute1회. stage/app payload7916 각각 전체SHA·coverage exact, 복사당6645491317B. source3 byte-exact/bootstrap2 역치환 exact/runtimearm64 실행파일5·plist ID 확인 |
| 증거 | physical 영수증31761B / SHA256 `94bcf7fe6ba1af2b39476511bc691b06b54c920ac636c8216f053ea638da385e` |
| 실제 기동 | 새앱 launch0/HTTP0/GUI입력0, profile/saveRoot 아직 존재하지 않음. CUA의 source26 화면 조회는 Mac 잠금으로 실패, 해제 질문 pending. 인증·잠금 우회0 |
| 인수 경계 | 생산104PASS는 이전 코드 검수이며 이번 포장 test반복0. 같은source27 CH1 시작·전투/획득/장착·4지역/보스문·보스 사망/부활/retry 진행보존·실저장·청취·시각 미인수 |
| 이전 실행본 | source26/3401 포함기존12검수앱 존재/plist ID/profile-save metadata만 확인. 내용hash·입력0. source26의 숲1·일반 사망retry·inventory는 이전 후보의 부분 플레이 이력이며 source27완주로 합산0 |
| 보존 | 기존67WIP/manager4/사용자23변경·원래게임/세이브 보존. 사용자 원래앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0. 삭제·cleanup·설치·새팀·새채팅0 |

앞선 source27 코드 checkpoint에서 “아직 포장하지 않음”은 당시 단계의 이력이다. 현재 실행 가능한 파일 후보는 준비됐으며 실제 Mac 플레이 인수는 대기다. 정확 앱/프로필·저장경로와 원문SHA는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`를 따른다. source26 음악 예외·source14 field복귀·46key 진행 보존 계약은 그대로 포함한다.


## 2026-10-03 source28 Mac 파일 후보 / source27 실제 플레이 후속

이 절은 이전 포장·잠금 대기 이후의 상태다. 이전 날짜별 기록은 당시 이력으로 보존한다.

| 항목 | 확인한 상태와 남은 검수 |
|---|---|
| 최신 파일 후보 | source28 / job `2242869e-903a-4917-a38c-e0f6c02ff47c` / port3403 / 입력 커밋 `f376e3ce9c3524fa7874078c6738e1e5ab8a1e5b` / **PACKAGED_NOT_RUNTIME_ACCEPTED** |
| 포함 코드 | field 복귀의 `P.poison=0;P._rbPoison=[];P._rbBurn=[];` 양판 각44B 및 이전 initStage 드루이드 초기화. 생산89PASS는 경계 대역 포함 코드 검수 이력이며 실제 앱 완주 증거가 아님 |
| 실제 파일 검수 | frozen7918 입력 중 bootstrap2 파생. stage/app payload7916 각각 전체SHA 일치, source3 exact, bootstrap2 전체 역치환 exact, arm64 실행파일5와 plist ID 확인. 재빌드·검사 반복0 |
| source28 실제 플레이 | launch0/native입력0. 물리 검수 시 새 profile/saveRoot 미생성. 전투·보스 사망/부활·열린 문/몬스터 보존·실저장·청취·카메라 인수 미완료 |
| source27 실제 장착/일반retry | 정상 전사 시작→연습 건너뛰기→CH1 첫 필드. 장착4건 후 CP1857. 일반 사망→다시 일어서라로 HP549/549 MP376/376 SP279/279 및 장비 유지 확인 |
| source27 마지막 관찰 | 첫 처치1/32, EXP2/15, 악의997, 시간55초, HP0. Controls 설정 화면에서 대기. 앞선 완충 관찰을 현재 생존으로 계산하지 않음. 아이템 줍기·4지역·보스 해금/사망 미인수 |
| 보존 | source27 포함 기존13 검수앱 존재/Info.plist ID 확인. 기존 profile/save 내용 변경0. 원사용자 앱 정확 위치 UNKNOWN; 전체 원본hash 보존 검증으로 확대0 |
| 물리 영수증 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source28-build/physical-receipt.json` 32859B / SHA256 `2b677de448db516036e2d32069f5b326e5aec535104f7db0072c57b5d21e5bda` |

파생 port3403·격리 user-state는 원본 서버3333·저장 schema 변경이 아니다. source27 부분 플레이를 source28 제품 인수로 합산하지 않는다. 상세 successor 경로·SHA·장착 표는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`의 후속 기록을 따른다.


## 2026-10-07 CH1 카메라 zoom과 마우스 조준 소비 — ROOT-CH1-CAMERA-MOUSE-AIM-20261007

기존 마우스 표의 “일반 화면은 raw 그대로”는 아래 새 CH1 opt-in scope를 제외한 일반 화면을 뜻한다. si3 데모 피날레의 .3 최소 zoom 보정/기존 facing 갱신은 그대로 유지한다.

현재 `game.html` working은 4,084,115B / `b3439a539397e73dcc929d565f172a720facdb282b654e741b9f495e8fc6e6f3`, root owned HEAD+변경 blob은 4,083,930B / `ae8244039d7ecc7383fc96076d7ad7bf9e17d7044330d8c0737a333240130073`다. 원래 타인 WIP185B를 보존한다. 이번 단위는 카메라를 바꾸는 대신 입력 좌표가 실제 현재 zoom을 소비하게 한다. camera framing·zoom 보간·시트·애니메이션·전투·AI·충돌·저장 수치는 변경하지 않는다.

전역 `_setMousePosition`의 finite client/rect/raw 위치 guard와 CH1 opt-in의 zoom 역변환은 적용 범위가 다르다. 범위 밖 valid raw/finale 수식은 유지하며, 새 CH1 scope만 current rect+저장 clientXY를 현재 `G._camZoom||1` positive finite 값으로 재투영한다(.3 cap 없음). scoped point 계산 완료 후에만 원자 게시하고 `_set`은 boolean을 반환한다. 일반 mousemove/mousedown의 facing은 true일 때만, 패드 해제 첫 이동은 기존 `_gpClearAll()` 뒤 scoped `_set` 성공 시만 추가 갱신한다. 정확 표/수식은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 같은 unit 절을 따른다.

| 검수 | 현재 상태/경계 |
|---|---|
| 신규 CPU | 현재b343 source의 신규 actual main 함수·실제 input callbacks VM 검수: 최초 Node1/VM24/DOM rect141, 7그룹28복합조건 PASS/FAIL0/미도달0/exit0. 통제 DOM/gamepad 경계이며 실제 GPU/하드웨어 gamepad 인수와 구분 |
| 신규 native | 현재b343 source의 최초 실제 main bosstest0 Chrome/context/page 각1, 3조건 PASS/FAIL0/미도달0/exit0. 동일 trusted mousemove의 effective point/facing 오차0; 같은 이벤트의 legacy 각도 오차는 −.3038275023834693rad. resize1280×720→1600×900에서 새 mousemove0·point 오차0·저장 facing 유지, trusted W 이동 중 저장 facing 유지. source5 exact·GL0·pageerror/HTTP failure0. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘 |
| visual | root가 실제 PNG1을 직접 판독: Druid antler/body 식별, 아래 작은 player·green FX 겹침과 반복 평면 baked 지면 남음. VISUAL VERDICT: RETOUCH. 그림의 보스 alpha 지점에 실제 공격이 적중한다는 pixel target hit 인수는 아님 |
| 이력 분리 | 이전 AIM read-only 계획의 구현0은 작성 당시 상태다. 현재 구현은 위 source핀과 실제 검수로 판단하며 옛 camera14/native1/105검색·공식원문 보존을 새 성과로 재실행/합산하지 않음 |
| 미인수 | 하드웨어 GP·arena exit 잔여 zoom의 native·normal route·boss lifecycle·shake/round/interpolation/alpha alignment·performance·native6/audio/reward/save. controlled CPU의 GP/arena exit 케이스를 실제 native 인수로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-camera-aim-20261007/`이다. `implementation-receipt.json` 4,493B / `045a27500ee5504a75440a7d913359badd5a0c72ed885352a8072bd5d9423c86`의 exact replacements/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 epoch checkpoint 전·deploy0이다.

최종 `aim-cpu-receipt.json` 1,124B / `f4a25b7ae304f8c4665d9f7f821ced2f89e23fbdeb8f168ae661cd39056b6c7c`, `native-result.json` 12,782B / `451a9070a4177502675978364ae877263d32ed7f6ba4e33ba98f216fa8dcf901`, `validation-receipt.json` 1,994B / `be8dc72efa2c1b886df9683a6f89ca7a4667ffd8fd9f05f9235c0d825ccf490e`, `visual-verdict.json` 4,764B / `22108e6e5e55733b0a4c83150f6ed31a791d3ce07900c29f85a94d8c740c593a`를 각각 보존한다. CPU28과 native3은 별도 검수이며 clean 전체 조건으로 합산하지 않는다. 0707 공식 raw6와 다음 retry 계획도 별도 원자료로, 이번 AIM 제품 인수에 합산하지 않는다.
