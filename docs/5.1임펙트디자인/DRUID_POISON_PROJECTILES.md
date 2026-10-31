
## 2026-10-16 R 기존 VFX의 main 소비 연결

| 항목 | 이번 현재 범위 |
|---|---|
| 제품 | game.html 승인13계열·원PNG13/JSON13·atlas runtime1. roots48/다른24장·기존 진행/피해/QE/RNG·본체와main 최신 변경 보존. |
| 실행 | 개발/NW 서버의 mjs MIME 및 packaging의 정확6필수파일(runtime/data4/QA storage) 연결. 빌드·배포0. |
| 새 확인 | 구문·caller 정적 연결/crop13/handler HTTP200, 격리 actual Main Image decode/clip ready13·page error0. 자연 전투/전체GPU 품질·전체port 증거 아님. |
| 남음 | R 전체 통합·실 R source/PC 실행 및 native LAVA 준비. 상세 docs/engine/FDG_PC_MAC_GIT_SYNC_20261016.md. |

> 2026-10-16 통합 범위: 웹 본편 수치·현행은 최신 main 기준, 별도 Native/FDG 항목은 source pin9a4534b4의 부분 이식·명시 opt-in 계약이다. 전체 최신 본편 이식 완료가 아니다. 상세: docs/engine/FDG_PC_MAC_GIT_SYNC_20261016.md.

# 드루이드 녹색 독탄 — 2026-09-06

> **2026-10-11 NORMAL r4 예외:** fan/elemBall의 `_druidStraight`는 NORMAL si0/3 !finale 소유자만인정하고풀기본/reset false. fan명시physical/magic/black magic과NORMALelemBall magic class를보존한후기존독wrapper가EL.P/녹색으로정규화한다. 적대해당탄의유도는없고Q반사blue유도는그대로다. NORMALelemBall Q성공시해당형태flag만false로내려blue렌더를소비한다. 독+3·기존원PNG·시각범위·타보스/피날레원소구금지규칙유지. 녹색orb를완성된나무가시로표기하지않는다. fan수/피해/속도예외의정확값은 [r4 계약](../engine/FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md).

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.


> **2026-09-08 데모 피날레 예외:** `?demo`/`?bic`의 마지막 보스(si3)는 [다크드루이드 피날레 v0.2](../8.1보스디자인바이블/DARK_DRUID_DEMO_FINALE_DESIGN.md) §0을 따른다. 전용 3막·5종 패턴, 동작별 Q독탄(48f 전조/막별1·2·3웨이브/간격30f/수명90f), 돌진·잠행 뒤96f 회복, 잠행 표적 고정, 제자리 HP페이즈 전환, 반투명 독늪을 적용했다. 이 조건의 독립 ORB·상시 리듬탄·idle 자동탄은 생성하지 않는다. 일반 si0/si3와 다른 보스의 수치·부활·Q/E 규칙은 기존 계약 유지. 아래 이전 드루이드 설명은 해당 예외를 제외한 기존 계약/이력이다.

> **2026-09-06 드루이드 독탄 최신 계약:** si0/si3 보스 소유 탄은 녹색 독탄으로 통일한다. 기존 화염 혜성 외형 설명보다 `docs/5.1임펙트디자인/DRUID_POISON_PROJECTILES.md`가 우선한다. 화마귀16f 구체의 녹색 질감 버전을 사용하고 피해 EL.P 및 실제 HP 피해시 중독+3을 적용한다. 기존 Q/E 분류는 보존한다. 추적지뢰도 드루이드만 녹색 구체240px로 교체; 다른 보스/소환 잡몹은 제외. 독립 녹색 ORB는 유지. 교체목록 전체 완료는 아님.

| 항목 | 구현 계약 |
|---|---|
| 대상 | si0/si3의 ib=true 보스가 발사한 탄. `_spawnBossProjectile(e,props)`에서 `_druidPoison` 표식 부여. 소환 잡몹 및 다른 보스 제외 |
| 독 속성 | 독 전용 EL 번호는 만들지 않는다. 기존 독의 EL.P=0 기반 피해와 P.poison 상태이상을 사용. col=#66dd22 |
| 패링 | 변환 전 `_projectileParryClass` 값을 p.parryClass에 보존. Q/E/패링금지 구분 유지, blackBean은 Q 전용 유지. 반사 후에는 기존 아군 탄 외형 사용 |
| 비행 아트 | 화마귀 `img/proj_firedevil_orb.png` 4×4/16f를 1회 grayscale→multiply #66dd22→원본 alpha 마스크로 베이크. 픽셀 질감 유지. 프레임70ms, source-over |
| 비행 크기 | 기본 일반 max(96,min(180,(sz\|\|4)×24))px, elemBall 및 추적지뢰240px. 2026-09-10부터 적대 원본 physical만 `_physicalProjectileMultiplier(p,2)=2`을 곱해 일반192~360px; 원본 magic/forbidden·추적지뢰는×1. 피해 EL.P만으로 물리 배율을 정하지 않음. 판정 반경은 시각 크기로 변경하지 않음 |
| 리듬탄 | 기존 발사 속도/주기/발수 입력 유지. 화염 입력 프로필을 owner wrapper에서 독으로 정규화. 집광/Q 텍스트 녹색 |
| 피격 | `_hurtProjectilePlayer`가 druidPoison 옵션 전달. hurtP에서 최종 HP 피해 a>0일 때 P.poison+=3. 무적/회피/무피해에는 신규 독 부여 없음. 기존 중독 감소/틱 공식 재사용 |
| 화상 | 드루이드 빨콩의 기존 _rbBurn 추가는 금지. 중독으로 대체 |
| 추적지뢰 | `_druidMine` 소유 표식, 녹색 화마귀 구체240px, 대기alpha .65/활성1. 실제 피해시 중독+3. 기존 추적/준비/수명 유지 |
| 독립 ORB | 이미 녹색 드루이드 8f 시트와 중독+3/속박을 쓰는 별도 G._druidOrbs 경로 유지 |
| 풀 재사용 | spawnProj 재사용시 _druidPoison=false, _druidParryClass=null 초기화. 다른 적에게 표식 누수 방지 |
| 범위 제외 | 보스 근접공격 및 모든 장판 재디자인은 이번 탄막 요청 범위가 아님. 보스 VFX 교체 목록 전체 작업은 별도 |

## 검증

- owner-aware 테스트: stage0/3/4 × ib true/false에서 드루이드 소유자만 표식 획득.
- 관련 테스트 7개 PASS(소유자, 리듬탄, 풀, 문법).
- `tmp/verify_druid_poison.py`: 실제 브라우저에서 드루이드 탄 poison=true/el0/green/Q, 일반 몬스터 false/el1 확인, pageerror0.
- `captures/druid_poison_projectiles.png`: 녹색 재질·16f 시트 경로/일반과 대형 크기 확인. 모든 패턴 장시간 교전 검수는 미실시.

## 2026-09-16 투사체 재검수

| 변경 | 현재 상태 |
|---|---|
| 검수 보강·예외 수정 | 실제 돌진형22/30/43의 충전 완료 발사와 물리6프로필 외형 확인. 드루이드 이미지 실패 시에도 녹색 본체를 표시. [검수 범위·폴백 수치·69개 테스트](../8.0몬스터디자인/PHYSICAL_PROJECTILE_AUDIT_20260916.md) |


<!-- DARK_DRUID_THORN_FIRST_APPENDIX_BEGIN -->
## 2026-10-11 · 다크드루이드 가시 일제발사 first opt-in

기존 본문·r9/live-fix와 이전 결과표는 해당 범위의 동결 이력으로 보존한다. 아래는 기존 자기 격리 QA에 fdgDruidThorn=first를 명시한 별도 ENGINE_AUTHORING fan 예외만 기술한다. 기본 본편·옵션 없는 QA·피날레·상위 phase 계약을 덮어쓰지 않는다.

| 항목 | first opt-in 계약 |
|---|---|
| gate / owner | window._FDGDruidQaStorage.active && fdgDruidThorn=first. 실제 발사 대상은 ib=true·si0/3·!finale·phase0/1 NORMAL 보스만 |
| native 발사 | bossFanWind의 기존 st2<=0 한 tick에서12발을 동시에 생성. 별도 wave clock/연속탄 생성0. lane0..11 중 physical0/1/3/4/6/7/9/10=8발, magic2/5/8/11=4발(i%3===2), 이 범위 blackBean0 |
| 조준 / 폭 | first start와 준비 wind의 e.facing=atan2(P.y−e.y,P.x−e.x)로 현재 Player 추적, 발사 tick에서 aim을 확정한다. fanW=π×(.7+.06×phase)rad, a=aim−fanW/2+fanW×i/11. 발사 이후 hostile _druidStraight로 forced homing/steer 제외·고정 방향 유지 |
| local flags / 예외 | _druidThornVolley pooled 기본/reset false, _druidThornLane 기본/reset−1. 해당 flag탄만 기존 modulo3 drop 및 생성 직후 decoy/ancestor aim 재지정에서 제외. 공용 후처리 배율은 적용하며 전역 drop/decoy/seek 변경0 |
| 입력 / 최종 속도 | 입력4.4px/native tick. 기존 후처리 최종 physical5px/tick=300px/s(60Hz), magic500/60..600/60px/tick=500..600px/s. 이 값은 clip24FPS와 별개이며 신규 속도 배율0 |
| 피해 | n=floor(atk×1.3), 최종 physical=floor(floor(2n)×.5), magic=floor(2n). atk103이면 n133/physical133/magic266. native poison wrapper는 원 class 보존 후 EL.P/col#66dd22, 실제 HP 피해시 기존 poison+3 |
| 수명 / 판정 | life/ml400은 nominal native-frame metadata. 기존 감소 life−=sp×.667 및 magic의 카메라2500px 이내 또는 실제 가시 영역+100px 이내에서 life<=0→life1 연장. 원거리 정리는 두 범위 밖에서만 수행(2026-10-31 웹 기준), 정확400tick 종료/초 단위로 승격0. 후처리 sz2.4·pool.r5.2; 일반탄 player collision base=P.r+7.2/기본 gate=P.r+11.2(base+4), 기존 Q/E 확장·현재/이전 P/shot 선분 sweep 유지, 저작 silhouette로 판정변경0 |
| 준비 / 회복 / cd | wind=floor(25×BOSS_PHASES[phase].teleM)+extraDelay, phase0/1의 base18/16native f(추가 delay 별도). 발사 직후 recover45, 다음 기존 보스 recover update에서20으로 clamp. 기존 fan cd100 유지. authored1.6초를 native 준비·수명·회복 시간으로 덮어쓰지 않는다 |
| 보존 | 기존 E physical/Q magic/black Q-only·반사 friendly blue 유도·피해/poise·자원 유지. phase2+의 기존 count/black/modulo3 drop·피날레·다른 보스·기본 main·사용자 save 유지 |
| hostile physical 아트 | _drawDruidThornShot의 ENGINE_AUTHORING 목질가시. localX[-27,32] 길이59worldpx, 최대Y±10 폭20. 몸체 quad/측면 triangular barbs/밝은 ridge, fill path당 vertex<=4로 기존 X WebGPU fill 소비 |
| physical draw-local 색 / stroke | bark#2b1a11/ridge#a77943/light#dfc18b, stroke#50321a·width1.5. 위치p.x/y 및 atan2(vy,vx) 회전으로 저작하며 native sz/r/판정과 구분 |
| hostile magic 아트 | diamond localX[-15,18]·Y±12, trailX[-30,-8]. fill#185744/stroke#7de6b2·width2/core#efffd4, trail#78eac7·width3·native alpha×.45. 기존 X path 소비, 별도 atlas/bitmap/new backend0 |
| native/friendly 제외 | _druidThornVolley && !friendly인 poison-shot caller만 새아트 선택. 다른 드루이드 독탄은 기존 녹색 orb 경로, 패링 후 friendly blue는 기존 아트/유도 소비. draw-local save/restore로 원 alpha/transform 유지 |
| tell / 실제 wind | first start에서 _druidFanWindMax=e.st2·e.facing=atan2Player, bossFanWind에서도 e.facing=atan2Player로 준비 중 추적. tell progress=clamp(1−st2/실제 _druidFanWindMax), 폭π×(.7+.06×phase)와 같은 atan2Player 소비. 기존 default p/facing 원값 유지 |
| loader / 공개 QA | native bridge query thorn-volley-first, QA query thorn-volley-first2 / 옵션 thornVolley:true. aria 드루이드 나무가시 공격 QA, leaf title DARK DRUID · 나무가시. 기본 main/old revision 분기를 새기본으로 전환하지 않는다 |
| camera bounds / player 접촉 | 적대 thorn camera envelope radius physical33/magic31worldpx. pool.r5.2와 player 접촉 base=P.r+7.2·기본 gate=P.r+11.2는 별도 값이다. 기존 Q/E 확장·현재/이전 P/shot 선분 sweep·actor/projectile 좌표 유지, camera 여백으로 collision 확대0 |
| 새 기술 검사 | pose 신규3/3 최초 PASS. ROOT7고유그룹 최종 PASS: 최초5/6에서 scope harness1실패 수리, GPU face 관련2그룹 재확인, 신규 wind-aim1 추가. 전체7/7 최초 PASS라고 기록하지 않는다. old suite 재실행0 |
| 실제 단계 관측 | final-poses step8/17/18/26/38에서 각각 wind10/wind1/recover45/recover13/recover1. step18에서12발 physical8/magic4, 실제 atk46→physical59/magic118. 선행 본체 native fade는8step 뒤 visible. source key/FPS와 native step 관측을 구분한다 |
| 공개 E / Q 범위 | E physicalProjectile/druidStraight native-parry1과 friendly guided blue를 실제 확인. 다른 E magic callback은 기존 조건부 소비이며 Q 성공으로 세지 않는다. Q pressKey 약1ms tap 성공0; hold는 지원 CDP Input 불가로 미시험, actor/input 상태주입0 |
| 정상속도·강제 fan | normal-speed-forced:114 fullframes/record5095ms, 공개 force pattern. playerHP521→125.59375/pStun, bossHP21017 alive/shield17744, E/Q 성공0. 정상속도여도 강제 pattern을 자연 AI fan 성공으로 확대하지 않는다 |
| 자연 native AI | native-ai:172 fullframes/record7037ms, AI 시작/강제 pattern0. HP595→0/fallen, bossHP21017 alive/shield18881. 자연 beanStorm/groundFissure/charge/slam/slashCombo 관측, fan0/new thorn0/EQ0. 이 run의 무관측이며 전체 AI의 fan 미지원으로 확대0 |
| 실제 저장 / 오류 | 두 run runtimeexception0. 공개 자기 설정 save write1, reopen own read1/write0·config {distance340,pattern:fan,phase0,scale:.5} 복원. 전투 actor snapshot 저장0·HP3000 fixture0·actor console writes0. 전체 network/404 무오류 주장0 |
| 최종 관측 / 정본 | VISUAL RETOUCH / 정확 잔여1 THORN_VOLLEY_COMBAT_ACCEPTANCE: 실전 가독성·Q hold 성공·자연 AI fan 관측 미인수. 실제 E 부분 성공/신규 기술 PASS를 전체 전투·엔진 완료 PASS로 확대0. 정확 GIF 파생 duration/경로·전체 실제 verdict/§23는 새 정본 참조 |

정본: [다크드루이드 가시 일제발사 첫 사본](../engine/FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md).
<!-- DARK_DRUID_THORN_FIRST_APPENDIX_END -->

> **2026-10-29 사용자 지시 "모든지뢰는 어둠지뢰 저걸로 바꿔라 디자인을 일단":** 지뢰 외형을 탄막 시험장 "어둠 지뢰"(진홍 결계진, `img/vfx/mine_trap_ward_sheet.png` 왼쪽 칸)로 통일했다. `p.mine` 탄(보스 지뢰 설치 포함)은 원래 이 외형이고, 이번에 **추적지뢰 `G._seekerMines`**(일반 보스의 주황 원 + 드루이드 si0/si3의 녹색 독 구슬)도 같은 결계진(지름 = 폭발 반경 r×2, 무장 전 불투명도 .46·무장 뒤 .78~.96 맥동, 0.00035rad/ms 회전)으로 그린다. 위 "드루이드 독탄 녹색 통일" 계약 중 **추적지뢰만 예외**로 바뀐다(이동탄 독탄은 그대로). 판정·이동·피해는 변경 없음. 코드 `game.html` "추적지뢰 렌더". 검수 `tmp/design-review/20261029_mines/mines_1600.png`.
