# 다크드루이드 데모 피날레 v0.4 — 난도·막 연출·재도전

2026-09-09. 사용자 “일단 다 진행해봐”에 따른 후속 구현. 적용은 `_DEMO_MODE && G.stage===_DEMO_LAST_STAGE && G.stage===3 && e.ib`이며, 일반 모드 및 다른 보스는 기존 계약을 사용한다. v0.2의 공격 전조·패링·반격 창과 v0.3의 카메라·승리 연출은 유지한다. 아래 표가 체력·공격력·부활·재도전의 현행 SSOT다. 이전 QA의 측정치는 당시 버전의 이력이다.

## 설계와 적용 수치

| id / 적용 위치 | 현행 값 / 계약 |
|---|---|
| `_druidFinaleHp(lv,dm)` | `n=max(0,monLv−1)`, `max(1,floor(22278×(1+.055n+.0015n²)×dm))`. monLv와 dm은 기존 난이도/스테이지 오프셋 및 DIFF_MUL을 사용 |
| `mkEn`, `_dfSpawn` | si=3 및 피날레 조건일 때 위 HP를 적용. HP=mhp=에너지쉴드=에너지쉴드최대=poise=maxPoise. `_revPts=_maxRevPts=20`, `_druidBaseAtk=_atk`. 기본 ATK/속도와 장비·스킬·보상 공식은 기존 그대로 |
| HP 예시 dm1 | Lv1=22278, Lv30=85915, Lv60=210894. 각 값과 같은 초기 에너지쉴드가 추가된다. 플레이어의 현재 공격력/장비에 비례하는 자동 보정은 사용하지 않는다 |
| 설계 의도 | 기존 Lv30 첫 HP+쉴드 출력 환산808.5초, Lv60 1591.8초 및 평균10회 이상 부활 문제를 데모에 한정해 완화. 90~150초 전투를 지향하는 조정값이며 사람의 실제 TTK 확정값은 아니다. 기본 장비 비교군과 자동 입력 결과는 아래에 기록 |
| `_bossPhaseCheck` ATK | base=`_druidBaseAtk` (없으면 baseAtk 또는 현재 atk를 최초 저장). phase0/1/2/3/4의 base 배율=1/1.12/1.25/1.4/1.6, 마지막 저항은 항상1.6. `floor` 적용. 일반 모드의 전환마다×1.3은 유지 |
| 프레임 ATK 유지 | `_druidFinaleAtk(e)`와 상수배열 `_DRUID_FINALE_ATK`를 phase 전환 및 updateE의 매 프레임 ATK 리셋에 함께 사용. 리셋이 전환 강화치를 덮어쓰던 문제를 실제 브라우저에서 재현 후 수정 |
| HP 경계·기타 전환 | 80/60/40/20%의 기존 상한 보정, SPD/포이즈/쿨다운 변화, 제자리90f 무적·회복 유지. 현재 HP를 읽는 3막(phase0·1/2·3/4)도 유지 |
| 부활 판정 | 피날레는 즉시 부활 분기를 건너뛰고 기존180f 사망 대기에서 1회 판정. 첫 사망이고 남은 포인트>0이면 `clamp(1−suppress,0,1)`, 두 번째 사망부터0. `_druidFinaleReviveChance` 사용 |
| 억제력·포인트 | 기존 antiRevive+holyPrison15~30% 및 사망 비용10+신성력보너스2~5+영역3+플레이어풀HP2 그대로. 비용 차감 후 포인트0이면 부활0%. 최대 억제 비용20으로 첫 부활도 차단 가능 |
| 신성력 예시 | 영역/기타 추가 억제 없이0/30/60/100%이면 첫 저항100/70/40/0%, 이후0%. 기존 일반 보스의200%+stage×5% 즉시/150%+stage×5% 폴백 확률은 그대로 |
| `_reviveDruidFinale(e)` | 원래 사망 위치·반경44 유지. HP=`max(1,floor(mhp×.35))`, 쉴드/최대0, phase3, ATK=base×1.6 내림, 포인트0, `_druidLastStand=true`. 다음20% 경계에서3막 패턴 진입 |
| 저항 상태 초기화 | alive=true, `bossDruidRest`90f, 무적90f, 경직0/넉백0; `_bossRevJudged=false`, `_bossRevived=false`, `_reviveTimer=0`; act−1/step0/rest0/targetLocked=false; combo/feint/delay 초기화. `_spawnT`, `_bossReviveVFXPending`, `_tpWarnT`0. G.bossAlive/_bossRef/_druidFinaleBoss 복원 |
| 저항 연출 | 남은 적대 드루이드 독탄·독늪·독구슬 제거, 아군 반사탄 보존. 순간이동·즉시 피해·몸 축소 없이 기존 druid_shockring(r×3/256,5f/frame), shake8, boss_revive 샘플 volume.8/pitch1 |
| 판정 RNG 경계 | 기존 resolve의 `(roll||1)`은 유효한 roll=0을 실패로 바꾸므로 `(roll??1)`로 수정. 누락/null만1, 실제0은 정상 비교. 일반 보스에도 올바른0 확률 표본 처리 적용 |
| 최종 사망 | 두 번째 사망은180f 대기 후 확정. 기존 v0.3의1회 승리 배너210f/음악/보상/출구/데모종료 유지. 저항을 억제하면 첫 사망부터 같은 경로 |
| `_druidActCue` | 60%/20% 막 전환과 마지막 저항 시 `{boss,act,t:0}`(저항은 lastStand:true). dt 기반120f. initStage/arena 생성에서 null. 사망 중에는 그리지 않음 |
| `_drawDruidFinaleAct` | alpha=clamp(min(t/12,(120−t)/30),0,1), y=min(150,VH×.21), 배경360×42/alpha×.75/#10150d. 18px Noto Sans KR, px 크기로 시작해 WebGL atlas 보존. act1=#c8dfab, act2=#e8c294 |
| 막 표시 | `II · 숲의 포식자 / II · FOREST PREDATOR`, `III · 숲의 단말마 / III · DEATH THROES`, `마지막 저항 / LAST STAND`. HUD 이름 끝 ` · 1/3`, ` · 2/3`, ` · 3/3` 또는 ` · 마지막 저항` |
| 음악 | 1·2막=boss, 3막/마지막 저항=finalboss, 확정 처치=victory. 기존 BGM 전환/사용자 설정 사용. 부활180f 대기 중 필드 음악으로 자동 복귀하지 않음. 새 음원·믹서 추가 없음 |
| `_retryDruidFinale()` | 데모 si3 아레나의 retryBtn에서 `_enterBossArena(true)` 실행. 다른 사망은 기존 필드/일반 재시작. 버튼 리프 문구=`보스 재도전 / Retry Boss` |
| `_enterBossArena(retry=false)` | retry=true일 때 원래 필드 `_preArenaBackup` 보존, 잔존 일반몹 kill 누적 생략, 기존 아레나 생성·모든 공격/장판 정리·새 보스 생성 사용. 재시도마다 적/부활/보상 상태는 새 전투로 시작 |
| 재도전 위치 | 새 보스 남쪽500px를 safePt(P.r)로 확인 후 배치, 실패 시 기존6시 입구. 카메라를 플레이어로 초기화. 보스 `_druidRetry=true`, rest90f/무적90f. 테스트베드용10타일 배치는 retry에서 생략 |
| 재도전 첫 프레임 잡담 | `_petSay`의 피날레 판정은 demo/마지막si3/bossAlive 및 (arena 또는 기존 bossRef)로 판단한다. HUD가 새 bossRef를 찾기 전에도 tier≤2 잡담을 차단하며 `_PET_SURV_W` 생존 대사는 보존한다 |
| 재도전 음악·대사 | `_retryDruidFinale`에서 boss 음악을 명시 재생해 death 트랙 고착 방지. arena retry 시 기존 `_petBubble.t=0/pair=null/_uid=null`로 이전 전투 대사를 종료 |
| 독립 필드몹 | 데모 si3 아레나 진입에서 `G._worms=[]`, `_wmStage=G.stage`. `_wmTick`도 같은 아레나 조건이면 배열을 비우고 즉시 반환하여 필드 곰치4마리의 재생성 차단. 필드와 일반 모드에서는 기존 스폰/공격 유지 |
| 재도전 상태 | bossLoadPhase/T/Fade=0, stageCleared=false, deathSpawned=false, flashT/chromaT=0, paused=false. 공통 후처리에서 player idle/무적300f·넉백0·화톳불300f/반경280, applyStats→자원 완충. 경험치30% 손실은 클릭당1회. 화폐/물약/스킬 쿨다운 계약은 기존대로 |
| `_druidFinaleIntro` | 재도전 보스 카드60f, `_introFill=1`로 실제 HP 즉시 표시. 첫 입장180f/HP 채움90f 유지. 긴 네임카드·입장 로딩 시퀀스를 재도전에서는 반복하지 않음 |

## 검증

`tools/verify_druid_finale_pacing.py`는 실제 retryBtn 클릭, lethal hurtE→180f→저항→최종 승리, 2/3막 화면·BGM을 검증한다. 별도 구간의 실제 입력 시도는 장비/체력 강화나 주입 피해 없이 동작하며 사람 플레이를 대체하지 않는다. 통제된 기능 검증과 실제 입력 시도의 결과를 구분한다.

## 검증 결과 — 최종 실행

| 검사 | 결과 |
|---|---|
| Node | 관련66개 PASS: 전투/카메라/막·부활·재도전/패링/투사체/리스폰/곰치 스폰·결계/일시정지 및 전체 인라인 문법. 새 pacing7개, 기존 presentation7개에 재도전 첫 프레임 잡담 회귀 보강 |
| 실제 retryBtn | EXP1000→700, 현재 최대 HP/MP/ST/쉴드/기동게이지 완충, 새 보스, 원래 필드 백업 참조 유지, 보스 남쪽500px, HP85915/부활력20. death 음악→boss. 카드60f/HP 표시1 |
| 실제 부활·승리 | 실제 hurtE lethal, RNG0 통제. 즉시 alive=false/타이머180/확률1,180f 후 HP35%·반경44·phase3·포인트0 저항. 두 번째 lethal은 확정사망→bossAlive=false/victory. 기능 검증의 주입 피해를 아래 자동 입력 완주와 분리 |
| 실제 막 강화 | base88에서 phase2 ATK110/boss 음악, phase4 ATK140/finalboss 음악. 프레임 ATK 초기화 이후에도 유지, HUD2/3 및3/3·카드 표시 |
| 실제 입력 완주 | Lv30/T0 magic(seed909), HP955/MP408/ST387, 보스85915+쉴드85915, 신성력0. 마우스/WASD/Q/더블탭 입력으로 **74.72초**, 첫 처치+마지막 저항+최종 처치 완료. 5초 간격 표본 최소HP108.42, 종료HP950.18. 갓모드·주입 피해·강제 힐·보스 고정 없음. 기존 자연 리젠/자동 스킬/소모품 규칙은 유지. 단일 자동 정책이며 사람의 난도/처치 시간 확정값은 아님 |
| 카메라·회피·종료 | 1280×720/1600×900/1920×1080 각4방향 총12구도 PASS. 실제 마우스 오차.25px/0rad, 감속 상태 D 더블탭278.32px 이동·HP손실0·hurtP0·rest 복귀. 최종승리→실제출구→nextBtn→demoEnd PASS |
| 런타임 | pacing/presentation 브라우저 모두 pageerror0,404 0. guard PASS. 카메라/회피 검증은 프레임 상태 도달을 기다려 느린 브라우저에서도 고정 벽시계 시간에 오판하지 않도록 개선 |
| 증거 | `captures/druid_finale_v04/pacing.json`, `balance.json`, `retry.png`, `last_stand.png`, `act_2.png`, `act_4.png`, `act_3_final.png`, `dialogue.json`, `attempt_end.png`; 기존 카메라·종료 도구 결과는 `captures/druid_finale_20260909/presentation.json` |
| guard 기준 | 현재 통합 game.html 줄 수59992를 guard.baseline.json에 기록(이전59987). 동시 진행 능력치 UI 커밋과 피날레 변경이 포함된 현재 파일 기준 |

12초 LMB 출력 측정(고정 보스, 무한 자원 보충 없음):

| 레벨 / 장비 | 보스 HP=초기 쉴드 | 관측 DPS | 첫 HP+쉴드 출력 환산 |
|---|---:|---:|---:|
| Lv1 / T0 rarity0 | 22278 | 1273.9 | 35.0초 |
| Lv30 / T0 rarity1 | 85915 | 3330.3 | 51.6초 |
| Lv60 / T0 rarity2 | 210894 | 9065.2 | 46.5초 |

출력 환산은 공격 기회·회피·페이즈 무적·부활을 제외하므로 실제 전투 TTK가 아니다. 목표90~150초는 사람 플레이용 조정 지향점으로 유지하며 자동 완주74.72초로 목표 달성을 확정하지 않는다.

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | 데모 si3 보스전 전투·재도전·동적 카메라 QA |
| MASTER | 기존 silhouette/regions/main route/side spaces 유지. 작업은 기존 전투 공간의 PLAYABLE→CAMERA QA→TECH QA 범위 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음. 신규 외곽 제작 범위 없음 |
| LARGE | 기존 source assets/composites/overlap/repeated silhouette 유지 |
| MEDIUM | connections/remaining holes 변경 없음 |
| GROUND | shadow/contamination/structure integration 변경 없음. 마지막 저항 시 잔류 공격 정리 |
| PLAYABLE | main arena/travel space 유지, 재도전 safePt로 남쪽500px 접근. breathing=큰 공격 뒤96f, 저항/재시작90f. threat=3막+최대1회 저항. combat readability=HUD 진행/막 카드/전신 프레이밍 |
| LANDMARK | primary/secondary/tertiary 기존 구성 유지 |
| CAMERA QA | ARENA/BOSS/재도전/막 전환/저항 화면 확인. 3해상도×4방향 구도 및 실제 조준/감속 회피/EXIT→demoEnd 회귀. START/EARLY/SIDE L/SIDE R/LANDMARK/LATE 전체 환경 보드는 이번 변경 범위 밖 |
| TECH QA | Node 및 실제 브라우저 결과를 검증 절에 기록. geometry/route/collision/seam/loading 구조 변경 없음. 화면 기능 검수를 전체맵 성능·시각 승인으로 간주하지 않음 |
| FILES | game.html의 피날레 관련 부분, druidFinale 테스트/도구, 관련 docs. 동시 진행 stat-panel-ui/build-nwjs/gritSystem 변경은 보존·별도 소유 |
| GIT | 변경 전 tmp/druid_finale_v04/game.before.html 백업. 코드·검증·docs를 새 커밋으로 기록. 다른 작업 커밋 amend/rollback 없음 |
| VISUAL VERDICT | **RETOUCH** — 보스전 패턴·흐름 구현은 검증하며, 전체 아레나 환경의 반복 질감과 사람의 초심자/숙련자 난도 판정은 별도 출시 검수 대상으로 남음 |
| NEXT PASS | 사람 플레이에서 목표90~150초와 소모품 소비/학습 난도를 확인하여 수치 조정. 전체 아레나 미술 승인과 전투 기능 검수를 구분 |

`grep -r` 전체 docs 검색을 수행하고 관련 문서의 데모 예외·현재값 링크를 갱신했다. 보호된 `2_3 돌진+패링+방패시스템`은 수정하지 않는다.
