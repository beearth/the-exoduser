# 1-1 몬스터 품질 전수 감사 (MN 레인, 조사)

> 2026-11-05 · 클라우드 레인 MN(조사) · 브리프 [BRIEF_MONSTER_QUALITY_20261105](../0마스터플랜/worklog/cloud-lanes/BRIEF_MONSTER_QUALITY_20261105.md) §0·§1 + CTO 추가(16:05 동시 표시 상한 100마리, 피격 반응 열).
> 기준 SHA: origin/unity/main `9b2fcf5`. Core 수정 0, 코드 수정 0, 유료 0. **화면 판정은 전부 "Mac 미판정"**이고 아래 ○×는 코드·에셋 메타만 근거다.
> 선행 문서: [UNITY_CH1_1_ENEMY_3D_RIG_G0_20261103](UNITY_CH1_1_ENEMY_3D_RIG_G0_20261103.md)(30종 메시·리깅·클립 v1 제작 기록), [UNITY_ENEMY3D_WIRING_20261104](UNITY_ENEMY3D_WIRING_20261104.md)(Unity 연결 30행). 이 문서는 그 둘을 **품질 기준으로 다시 채점**하고 가족·예산·백로그를 더한다. 수치가 겹치면 그 둘을 인용하고 다시 쓰지 않는다.

## 0. 요약

| 항목 | 값 |
|---|---:|
| 1-1 몬스터 수(표현 키) | **30** = etype 29종(0·1·3~21·23~29·47) + 시작 다안 육괴(etype 4, `IsStartEyeMass`) |
| 가족 수 | **4** (A1 원거리 시전 이족 42.9% / A2 근접 경량 이족 26.5% / B 중량 이족 16.0% / C 비인간형 14.6%) |
| 상위 3가족 | **A1 → A2 → B** (일반 스폰 등장 비중 누계 85.4%) |
| 표현 경로 | 기본 = 2D 8방향 아틀라스(정지 1칸 + 걷기 4프레임, 위치 해시 외형). opt-in `--enemy-render=rigpixel` = 리깅 3D 실시간 픽셀 렌더 30종(클립 v1/v2 연결) |
| 채점(8열 × 4가족, 3D 경로 기준) | ○ 4 · × 22 · **Mac 미판정 8**(실루엣·먼 거리는 눈으로만 판정) — §2.2 |
| DESIGN LOCK | 30종 모두 **없음**(G0 §3). GPT 3면 시트 30장이 사실상의 원화이고 LOCK 대조표는 미작성 |
| 동시 표시 설계 예산 | **100마리**(사용자 16:05 "많아도 100마리 정도면 충분") — §3.4 추정표(실측 아님) |

## 1. 1-1 몬스터 전수표

### 1.1 나오는 경로 (Core, 파일:줄)

| 경로 | 수 | 종류 결정 | 출처 |
|---|---:|---|---|
| 소환굴 14개 | 168 | `RollEtype(0)`: 원거리/근접 50:50 → 제외 {2,22,30,43} 뺀 가중치 풀 | `Core/SpawnHoles.cs:109-111`(굴 좌표·크기), `:152`(생존 700 이상이면 대기), `Core/EnemyPools.cs:12`(1장 풀), `:22`(원거리 집합), `:23`(제외), `:49-60`(si0 추첨), `:85-89`(굴당 수: S 50·M 100·L 100 → si0 ×0.5×0.3) |
| 시작 다안 육괴 | 2 | etype 4 고정, 속성 D, 정예 0, 표현 태그 `IsStartEyeMass` | `Core/Simulation.StartMobs.cs:15,38-46` |
| 문지기 | 1 | etype 29, HP×4·ATK×2·r×1.4·포이즈 80·챔피언(elite 3) | `Core/Simulation.StartMobs.cs:56-69` |
| 문지기 호위 | 4~6 | `RollEtype(0)`, 매직(elite 1)·HP×2.5, 55px 고리 | `:71-82` |
| 외곽 웨이브 | 8~12 | `RollEtype(0)`, 100~180px 고리 | `:84-94` |
| 매직 정예 | 일반 스폰의 3% | 같은 etype, 크기 ×1.08 | `Core/EliteTables.cs:189-196`, `Core/EnemyFactory.cs:138,145`(r = (R+난수2)×2×ScaleMul) |
| 필드 보스 | 4 | 심연의 앵글러, 별도(보스 보드) | `Core/Simulation.FieldBoss.cs:24` |
| 소환 자식 | 가변 | 현자 7·자궁 11 → 요마 3(HP×0.5), 모체 17 → 거미 13, 쌍둥이 47 → 원령 40(ens 미추가) | `Core/EnemyAi.cs:704-726`(Summon), `:596-610`(Mother), `:618-626`(ShadowTwin) |
| 상한 | 800→700 | 적 목록 800 초과 시 먼 것부터 700까지 컬링(킬로 집계) | `Core/Simulation.EnemyCap.cs:119` |

한 판 추첨 수 N ≈ 183(G0 §2.1)이고, 아래 "기대 등장"은 G0 §2.2 값을 그대로 쓴다. 표시 반경은 `EnemyTables.R[etype]`(1장 10~25)의 **2배**(`EnemyFactory.cs:145`)이며 2D 경로는 `r×7/256` 배율(`NativeGame.cs:475`), 3D 경로는 `r/baseRadius` 배율(`NativeEnemyRigRenderer.cs:54`)로 화면 크기를 정한다.

### 1.2 표현 경로 두 벌

| 경로 | 켜는 조건 | 외형 결정 | 프레임·클립 | 코드 |
|---|---|---|---|---|
| **2D 아틀라스(기본)** | 항상(3D 미준비·3D 실패 폴백 포함) | 40칸 중 `(etype×7 + 스폰x×31) mod 40` 위치 해시 → **같은 etype이 자리마다 다른 생김새** | 정지 1칸(8방향 × 40) + 걷기 4프레임(8방향 × 40), 256px 칸. 공격·피격·사망 프레임 **0** | `Core/EnemyFactory.cs:497-503`, `NativeGame.cs:457-459,470-475`, 발 접지 `NativeEnemyFootprint.cs`(`Data/enemy_footprints.json`) |
| **rigpixel 3D(opt-in)** | `--enemy-render=rigpixel` + `NativeRemodel3D.Active` | `Data/enemy_rig_models.json` 30행(etype + startEyeMass 키 → `Resources/Enemies3D/<이름>.fbx`) | 종마다 8슬롯(idle·move·tell·active·recover·hit·stagger·death) + 추가 클립. 60fps = Core 1틱 | `NativeEnemyRigPolicy.cs:12-31`(상태 투영), `NativeEnemyRigAnimator.cs:62-78`(틱 샘플링), `NativeEnemyRigRenderer.cs:37-52,95-107`(적마다 RT 1장·캡처 카메라 공유) |

### 1.3 전수표 (등장 빈도순, 가족 표기)

열: 가족 / 역할(Core AI) / 1-1 확률·기대 수 / 3D 모델·본·삼각형 / 클립(틱) / LOCK. 모든 3D 모델은 텍스처 대신 **팔레트 8면 단색 재질**(`enemy3d-provenance.json` `palettePlanes: 8`, 렌더러가 재질 이름 `enemy_<hex>`에서 색을 읽음 `NativeEnemyRigRenderer.cs:31-35`)이고, 2D는 256px 칸이다. 공통 클립 idle 120·walk 60~72·hit 12·stagger 40·death 45는 생략하고 공격 계열만 적는다.

| # | etype | 이름(웹 → 3D) | 가족 | 역할(Core) | 확률 | 기대 | 2D 칸(G0) | 3D 모델 · 본 · tri | 공격 클립(틱) | LOCK |
|---:|---:|---|---|---|---:|---:|---:|---|---|---|
| 1 | 7 | 현자형 사도 | A1 | 원거리 800·탄 충전 60·순간이동(경고 120)·소환(eSummon 40) `EnemyAi.cs:397-423` | 12.50% | 22.9 | 27 | SageApostle·24·12,321 | attack_tele 60/act 6/rec 30, summon_tele 40/act 10/rec 30 | 없음 |
| 2 | 16 | 덫 사도 | A1 | 원거리 600·탄 충전 60·덫(d<250) `:580-589` | 8.93% | 16.3 | 16 | TrapperApostle·24·12,415 | 60/6/30, trap_set 30 | 없음 |
| 3 | 1 | 가시 사도 | A1 | 원거리 600·탄 충전 60(`:764-775`) | 7.14% | 13.1 | 15 | SpineApostle·24·12,495(외눈 1.25배 보정) | 60/6/30 | 없음 |
| 4 | 47 | 그림자 쌍둥이 | A2 | 근접·분신(원령 40)·순간이동 경고 120 → 착지 충격파 `:615-636`, `:424-441` | 6.25% | 11.4 | 29 | ShadowTwin·24·12,323 | slam_tele 24/act 3/rec 40, tp_vanish 30/appear 20, clone_cast 30 | 없음 |
| 5 | 4 | 갑각 사도 | B | 근접 G2 "slam": 예고 36/발동 3/반격 창 45, 사거리 r+pr+28 `MeleeAttackRules.cs:9-10,42-44` | 5.47% | 10.0 | 26(+7 재질) | CarapaceApostleV2·24·12,473 (blendTicks 2) | attack_tele 36/act 3/rec 45, block 20 | 없음 |
| 6 | 26 | 눈보라 마법사 → 가면 주술사 | A1 | 원거리·어둠 지대(blizzard 180·3) `:306-315` + 탄 충전 60 | 5.36% | 9.8 | 24 | HexerApostle·24·12,390 | 60/6/30 | 없음 |
| 7 | 8 | 부풀은 사도 | A1 | 원거리 800·탄 충전 60 | 5.36% | 9.8 | 9 | BloatedApostle·24·12,480 (가슴 비율 .429 = 배) | 60/6/30 | 없음 |
| 8 | 6 | 철갑 사도 | B | 근접 G2 "charge": 예고 24/돌진 20(4.5px/틱)/반격 창 40, 호위 이동(1·7·8 보호) `:368-393`, 방패 돌진 | 4.69% | 8.6 | 23 | IroncladApostle·24·12,471 (v2) | shield_tele 24/charge_run 20/charge_hit 4/attack_rec 40 | 없음 |
| 9 | 0 | 하급 사도 | A2 | 근접 G2 "swing": 예고 24/발동 2/반격 창 36 | 4.69% | 8.6 | 0 | LesserApostle·24·12,481 | attack_tele 24/act 2/rec 36 | 없음 |
| 10 | 12 | 광폭 사도 | B | 근접 접촉(idle 접촉 피해, 상태 전환 없음 `:747-751`)·HP 40%에서 광폭(속도×2.2) `:262-267` | 3.91% | 7.1 | 33 | BerserkApostle·24·12,443 | attack_tele 24/act 3/rec 30, rage 40 | 없음 |
| 11 | 25 | 빙판 슬라임 → 늪 슬라임 | C | 원거리 풀·어둠 지대(iceZone 480·2) `:300-304` + 탄 충전 60 | 3.57% | 6.5 | 12 | SwampSlime·21(Tripo)·12,472 | 60/6/30 | 없음 |
| 12 | 9 | 의식 사도 | A1 | 원거리 800·시체 부활(150px) `:443-461` + 탄 충전 60 | 3.57% | 6.5 | 21 | RitualApostle·24·12,091 + 지팡이 896(소켓 R) | 60/6/30 | 없음 |
| 13 | 24 | 동상 좀비 | A2 | 근접·접촉 시 빙결 슬로우 `:298` (MeleeEt 아님 → 접촉 피해 없음, `_FreezeSlow`만) | 3.12% | 5.7 | 34 | FrozenZombie·24·12,307 | 24/3/30 | 없음 |
| 14 | 20 | 빙결 전사 → 두건 도끼잡이 | A2 | 근접 풀·탄 없음(`NoProj`)·MeleeEt 아님 → **Core에 공격 동작 없음**(Idle 전진만) | 3.12% | 5.7 | 31 | CleaverApostle·24·12,434 | 24/3/30 | 없음 |
| 15 | 21 | 빙궁수 → 눈가린 쌍낫 | A2 | 근접 풀·KeepDistance 집합(`:50`)·일반 탄 480틱 간격 | 2.34% | 4.3 | 39 | DuelistApostle·24·12,468 + 낫 170×2(소켓 R/L) | 24/3/30 | 없음 |
| 16 | 10 | 그림자 사도 | A2 | 근접·은신 → 등 뒤 출현 → windup 10/attack 8/recover 35 `:463-470`, `:691-703` | 2.34% | 4.3 | 5 | ShadowApostle·24·12,410 | 24/3/30, vanish 20/appear 20 | 없음 |
| 17 | 23 | 얼음 정령 → 어둠 영체 | C | 근접 풀·KeepDistance·일반 탄 480 | 1.95% | 3.6 | 3 | Wraith·57(Tripo)·12,472 (부유) | 24/3/30 | 없음 |
| 18 | 14 | 날개 사도 | A2 | 급강하 eSwoop 18틱(6px/틱)·궤도 비행 `:545-553` | 1.95% | 3.6 | 2 | WingedApostle·24·12,353 | dive_tele 24/dive_act 12(루트 고정)/attack_rec 30 | 없음 |
| 19 | 5 | 태아형 악마 | C | 근접·windup 20 → attack 8 → recover 35(`:250`, 자폭 상태 `eSelfDestruct`는 idle 복귀만) | 1.95% | 3.6 | 6 | FetalDemon·56(Tripo)·12,520 | 24/3/30, explode_tele 30/act 6 | 없음 |
| 20 | 17 | 모체 사도 | C | 원거리 풀·거미 13 산란(즉시, 상태 없음) `:596-610` + 탄 충전 60 | 1.79% | 3.3 | 20 | MotherApostle·40(Tripo)·12,459 | 60/6/30, summon 40/10/30 | 없음 |
| 21 | 13 | 거미 사도 | C | 원거리·거미줄 탄(webT) `:268-277` + 탄 충전 60 | 1.79% | 3.3 | 10 | SpiderApostle·59(Tripo)·12,519 (v2) | 24/3/30 | 없음 |
| 22 | 3 | 요마 | A2(소형 변종) | 근접·MeleeEt 아님·windup 뒤 attack 5틱(`:691`, 진입 경로는 소환 자식만) | 1.56% | 2.9(+소환) | 25 | Imp·24·12,560 | 24/3/30 | 없음 |
| 23 | 27 | 고드름 박쥐 → 뼈 박쥐 | C | 급강하 eSwoop 15틱 + 탄 2발 `:567-577` | 1.17% | 2.1 | 없음(새) | IcicleBat·60(Tripo)·12,287 (부유) | dive_tele 24/dive_act 12(루트 고정)/attack_rec 30 | 없음 |
| 24 | 18 | 흡혈 사도 | A2 | 근접 접촉(MeleeEt) | 1.17% | 2.1 | 38 | VampireApostle·24·12,391 | 24/3/30 | 없음 |
| 25 | 15 | 분열 사도 → 분열 지렁이 | C | 근접 풀·일반 탄 480·사망 분열(Core 미이식 여부 미확인) | 1.17% | 2.1 | 8 | SplitWorm·60(Tripo)·12,240 (높이 0.188) | 24/3/30 | 없음 |
| 26 | 11 | 자궁 사도 | C | 근접 풀·KeepDistance·산란 eSummon 35 `:535-543` | 1.17% | 2.1 | 11 | WombApostle·71(Tripo)·12,334 | 60/6/30, summon 40/10/30 | 없음 |
| 27 | 28 | 빙하 골렘 | B | 근접·eSlamWind 50(d<100) `:317-325` | 0.78% | 1.4 | 36 | GlacierGolem·24·12,478 | 24/3/30 | 없음 |
| 28 | 19 | 대형 사도 | B | 근접 G2 2타 "slam": 예고 18/발동 2/간격 22/예고 40/발동 1/반격 창 36, 2타 사거리 70+r | 0.78% | 1.4 | 26 계열 | GiantApostle·24·12,521 | attack1_tele 18/act 2/gap 22, attack2_tele 40/act 1, attack_rec 36 | 없음 |
| 29 | 29 | 빙마 → 문지기 | B | 근접 G2 "combo" 3타: 예고 30/발동 3/간격 10/16/3/10/16/3/**반격 창 30** + 3타 끝 8방향 탄, 돌진 예고 40/돌진 **25** `MeleeAttackRules.cs:33,39,42-46` | 0.39%(+문지기 1) | 0.7+1 | 22(사슴 → 폐기) | Warden·24·12,387 + 망치 660(소켓 R) | combo1_tele 30/act 3/combo_gap 10/combo2 16/3/combo3 16/3/**attack_rec 45**, charge_tele 40/charge_run **20**/charge_hit 4 | 없음 |
| 30 | 4(시작) | 다안 육괴 | C | 근접 탱커(일반 4와 같은 G2 slam) | 고정 | 2 | 사용자 원화 8방향 | EyeMass·20(Tripo)·12,504 (가슴 비율 .49) | 24/3/30 | 없음 |

- 이름은 웹 `ETYPE` 표시명(G0 §2.2) → 2차·3차 시트에서 바뀐 3D 이름이다. 1장 색 규칙(얼음·화염 금지, `스테이지_몹분배.md`)에 따라 20번대는 썩은 숲 톤으로 다시 그렸다.
- 클립 길이·본 수·삼각형은 `Resources/Enemies3D/enemy3d-provenance.json`(origin/unity/main) 기준이다. 본체 삼각형은 30종 모두 12,091~12,560, 비사람형 9종은 Tripo "기타" 리깅(20~71본), 사람형 21종은 Meshy 24본이다.
- 레어몹 90~99는 Unity Core에 교체 스폰이 이식되지 않아 1-1에 나오지 않는다(G0 D4).

## 2. 품질 채점 (코드·메타 기준, 화면은 Mac 미판정)

기호: ○ 코드·메타로 충족 확인 / × 코드·메타로 미충족 확인 / **?** 눈으로만 판정 가능 → Mac 미판정. 2D 기본 경로와 3D opt-in 경로를 "2D / 3D"로 나눠 적는다.

| 항목 | A1 원거리 시전 이족 | A2 근접 경량 이족 | B 중량 이족 | C 비인간형 | 근거 |
|---|---|---|---|---|---|
| 1 실루엣 구별(가족끼리·영웅과) | 2D × / 3D **?** | 2D × / 3D **?** | 2D × / 3D **?** | 2D × / 3D **?** | 2D: 위치 해시로 같은 etype이 다른 칸(`EnemyFactory.cs:501-503`) → 생김새가 행동을 말하지 않음. 3D: etype 1:1 모델, G0 §4.1.2·4.1.6 Blender 셀 비교에서 "서로 다르게 읽힘"(제작자 판정). 영웅 옆 1x 비교는 Mac |
| 2 34° 먼 거리 가독성 | **?** | **?** | **?** | **?**(지렁이 15 높이 0.188·슬라임 0.624는 코드상 가장 작음) | 3D 텍셀 배율 = `screenHeight/1080` 정수(`NativeRigPixelPolicy.cs:238`), 최소 크기 바닥이 없음. 먼 적 85~130px 화면 높이(G0 §4.1.2 표)는 1080p 기준. 안개·비네트가 먼 적을 지우면 FAIL(LOCK) → Mac |
| 3 예고·접점·회복 틱 = 클립 길이 | **×** | **×** | **○**(0·4·6·19 일치) / 29 × | **×** | 원거리 탄: Core 충전 60 ✓, 발동·회복은 **표시 3·9틱**(`NativeEnemyRigPolicy.cs:25-26`)인데 클립은 6·30 → 정규화 재생으로 2~3배 압축. G2 5종: 0=24/2/36, 4=36/3/45, 6=24/20/40, 19=18/2/22/40/1/36 모두 클립과 같음. 29: 반격 창 Core 30 vs 클립 45, 돌진 Core 25 vs 클립 20. 접촉형(12·18·2)과 20·24는 Core에 공격 상태가 없어 Tell/Active가 **절대 재생되지 않음**. eSwoop(14·27)·eSummon(7·11)·tp 경고(47·7)는 투영 표에 없어 Idle/Move로 보임(`NativeEnemyRigPolicy.cs:18-27`) |
| 4 피격·사망 다양성(넉백·날아감·처형) | × | × | × | × | 사망 = `death` 45틱 1종(모든 행 `deathTicks 45`), 끝나면 즉시 숨김(`NativeEnemyRigRenderer.cs:89`), 시체 0(`Simulation.Death.cs:125` AddCorpse 무동작). 2D는 죽는 틱에 바로 사라짐(`NativeGame.cs:462`). 날아감·처형·방향별 사망 0. 넉백 벡터는 Core에 있음(`EnemyHurt.Body.cs:208-209`, ≤15px/틱) |
| 5 접지(그림자·발) | ○ | ○ | ○ | **×**(23·27 부유, 25·11·육괴 들림) | 2D: 발 픽셀 접지표(`enemy_footprints.json`) + HD2D 접촉 그림자. 3D: 모델 최저점을 바닥에 붙이고 접촉 그림자 r×0.02(`NativeEnemyRigRenderer.cs:48,106`). 부유 개체는 bounds 최저점을 바닥에 붙여 부유 높이 미반영(`enemy_rig_models.json` retouch 23·27), 덩어리형은 한쪽 들림(25·11·EyeMass) |
| 6 엘리트 표시 | × | × | × | × | Core: 크기 ×1.08/1.2/1.35·문지기 ×1.4(`EliteTables.cs:189-192`, `StartMobs.cs:64`)와 mods(M01~M04·M29·M30) 있음. Runtime: 오라·고리·이름·어픽스 표시 **0**(Runtime 비Core 파일에서 elite 표시 코드 없음, `A2DrawEnemyStatus`는 HP바만). 1-1에서 매직 3% + 호위 4~6 + 문지기가 크기 차이로만 구별됨 |
| 7 탄 출처 위치 | × | — | — | × | 충전탄은 **몸 중심**(`EnemyAi.cs:104-116` X=e.x,Y=e.y), `Mouth()`(r×0.7 앞, `:77-80`)는 windup→attack 탄(5·10·3)에만. 3D 손·입 소켓에서 탄이 나오는 연결 없음. 탄 그림은 `NativeBossView.FieldBullets.cs`(입·혜성·구체 시트)로 종류별 분리됨 |
| **8 피격 반응**(CTO 추가) | §2.1 참조 | §2.1 | §2.1 | §2.1 | 아래 표 |

### 2.1 피격 반응 — "맞았을 때 무엇이 보이고 들리는가" (현재 코드)

공통 경로(가족 무관, Core → Feedback → Runtime):

| 층 | 현재 코드 | 평가 |
|---|---|---|
| 히트 플래시 | Core `_hitFlash` 6틱(휘두르기 4)(`EnemyHurt.Body.cs:94,125`) → 2D 몸 색 (1,.62,.62) 붉은 틴트(`NativeGame.cs:478`). **3D 경로에는 플래시 없음**: `RigPixelComposite.shader`에 `_MainTex`만 있고 색 파라미터 0, `hit` 클립 12f를 10틱에 재생(`NativeEnemyRigPolicy.cs:20`)할 뿐 | 2D ○ / 3D **×** |
| 넉백 틱 | `kbAmt = min(dmg×.25×kbM, 15×kbM)` 벡터, 매 틱 ×0.85 감쇠, 벽 충돌 피해(`EnemyHurt.Body.cs:208-209`, `EnemyTick.cs:177-220`) — 2D·3D 모두 Core 좌표를 그대로 따라감 | ○ |
| 경직(히트스턴) | 일반 8틱·정예 4틱·보스 0(`EnemyHurt.Body.cs:127`) AI만 멈춤. 포이즈 붕괴 → stunned 180틱(`EnemyPoiseRules.cs:315`)에 `stagger` 40f를 **180틱에 늘려** 재생(`NativeEnemyRigPolicy.cs:19` duration=MaxStunned) → 4.5배 슬로우 | 히트스턴 ○ / 포이즈 경직 **×**(클립 길이 불일치) |
| 포즈 홀드(히트스톱) | 55/75/90ms(일반/치명/무거움) 동안 맞은 몸의 마지막 포즈 유지 + 0.1초 따뜻한 틴트(`Vfx/ImpactResponse.cs:24,35-38`, `NativeGame.cs:466`, 3D는 `poseFrozen`로 SyncActor 건너뜀 `NativeEnemyRigRenderer.cs:54`). Core 히트스톱 5틱(`EnemyHurt.Body.cs:129`) | ○ |
| 피 데칼·피 시트 | 피격마다 `Blood_FBF_4x4_dark` 시트(일반 9틱·무거움 18틱, 폭 = 크기×2×.6/1, `Vfx/CombatImpactTimeline.cs:99-104`), 바닥 혈흔 8칸 풀·유지 210틱·페이드 60(`:198`, `CombatImpactView.cs:142-148`). 3D는 가슴 비율 접점(`ImpactAnchor`). Core의 피 입자(`AddParts`·`PoolPart`)는 Unity에서 **무동작**(`Simulation.EnemyBridge.cs:98,102`) | ○(시트·혈흔) / 입자 × |
| 피해 숫자 | HP·쉴드 감소분 1초 표시(`NativeGame.cs:463`) | ○ |
| 소리 층 | 피격: 소리 분류표(`EnemySoundTables.cs:245-252` 사람형/곤충/영체/살/뼈/짐승/마법/갑옷) → `monster_hit1`(곤충·뼈·마법) / `monster_hit`(영체·짐승) / `monster_hit_flesh1·2`(살) / `flat_hit`(갑옷) / 사람형 둘 중 하나(`NativeFeedbackAudio.cs:205-214`), 치명 `crit_heavy`. 사망: 분류별 풀에서 최대 6성(피드백 모드 2성), 5틱 억제, 큰 적(r≥40) 1.05배 + 25% `monster_die1`(`:218-233`) | ○(분류 8종) |

가족별로 **다르게** 보이고 들리는 것은 지금 **소리 분류와 크기**뿐이다:

| 가족 | 보이는 것(2D / 3D) | 들리는 것 | 가족 고유 반응 |
|---|---|---|---|
| A1 원거리 시전 이족 | 붉은 틴트 6틱·포즈 홀드·넉백 / 3D: hit 12f 10틱, 틴트 없음 | 7·1·8·9·26 = 사람형 `monster_hit`/`hit1`, 16 = 곤충 `hit1`(1.3배 피치) | 없음. 충전 중 피격 시 `_projChargeT` 취소는 stunned일 때만(`EnemyTick.cs:226`) → 가벼운 피격은 충전 유지 |
| A2 근접 경량 이족 | 같음 | 0·20·21·24 사람형, 47 사람형, 10·14 뼈·곤충(10은 뼈 1.15배), 18 곤충 | 없음 |
| B 중량 이족 | 같음(크기만 큼) | 4·12 뼈, 6·29·28 갑옷 `flat_hit`, 19 곤충 | 포이즈 큼(4=35·19=40·29=50~80)이라 경직이 드묾. 갑각 `block` 클립은 Core 상태가 없어 미사용 |
| C 비인간형 | 같음 | 25·15 살(`flesh1/2`), 23·5·11·17 살/영체, 13 곤충, 27 짐승, 육괴(etype 4) 뼈 | 없음 |

### 2.2 채점 합계

| | ○ | × | Mac 미판정 |
|---|---:|---:|---:|
| 1 실루엣(3D 기준) | 0 | 0(2D는 4 ×) | 4 |
| 2 먼 거리 | 0 | 0 | 4 |
| 3 틱 일치 | 1 | 3 | 0 |
| 4 피격·사망 다양성 | 0 | 4 | 0 |
| 5 접지 | 3 | 1 | 0 |
| 6 엘리트 | 0 | 4 | 0 |
| 7 탄 출처 | 0 | 2(해당 2) | 0 |
| 8 피격 반응(3D 플래시 기준) | 0 | 4 | 0 |
| **합** | **4** | **22** | **8** |


## 3. 가족 설계

### 3.1 가족 정의와 상위 3가족

가족은 **같은 뼈대로 클립을 돌려 쓸 수 있는 몸**으로 묶었다. Meshy 사람형 21종은 모두 같은 24본 Humanoid 계열(Spine02 포함)이라 리타깃이 가능하고, Tripo 비사람형 9종은 본 수가 20~71로 전부 달라 서로 리타깃이 안 된다(`enemy3d-provenance.json` bones).

| 가족 | 구성 etype | 1-1 비중 | 베이스 바디 | 변종 규칙(크기·장식·색) | 공용 클립 세트 |
|---|---|---:|---|---|---|
| **A1 원거리 시전 이족** | 7·16·1·26·8·9 | **42.9%** | 1.8m 마른 이족, A자세, 24본. 기준 = 현자형 7 | 크기 0.63(26)~0.71(1) 표시u; 장식 = 머리(철장 16·가면 26·외눈 1·해골 지팡이 7·눈알 지팡이 9)와 배(8); 색 = 로브 명도 2단 + 발광 1색(손·눈) | idle·walk·**charge 60·fire 6·rec 30**(탄 충전 공통)·hit·stagger·death + 종별 1개(summon·trap·revive) |
| **A2 근접 경량 이족** | 47·0·24·20·21·10·14·3·18 | **26.5%** | 1.8~2.0m 이족, 24본. 기준 = 하급 사도 0 | 크기 0.78(요마 3, ×0.6)~1.42(47); 장식 = 손 무기(도끼 20·쌍낫 21·낫팔 47·갈고리 24)·날개 14·망토 47; 색 = 피부 2단 | idle·walk·**swing 24/2/36**(G2 0 기준)·hit·stagger·death + 종별 1개(vanish/appear 10·47, dive 14) |
| **B 중량 이족** | 4·6·12·28·19·29 | **16.0%**(+문지기 1) | 2.1~2.8m 덩치 이족(구부정), 24본. 기준 = 갑각 사도 4 | 크기 1.34(6)~2.57(29); 장식 = 등딱지 4·방패 6·망치 29·등 얼굴 19; 색 = 살·철 2계열 | idle·walk(무게)·**slam 36/3/45**(G2 4)·**charge 24/20/40**(G2 6)·combo(29)·hit·stagger·death·block |
| **C 비인간형** | 25·23·5·17·13·27·15·11·육괴 | **14.6%**(+시작 2) | 공용 없음(9종 9뼈대) | 종마다 개별 | 종마다 개별(공통 이름만 같음) |

- **상위 3가족 = A1 → A2 → B.** 비중 합 85.4%. 영웅 CH 파이프라인(C1 리그 합격 → M1 착수)과 같은 관문을 가족 단위로 복제한다(§5).
- C는 1-1 첫 전투(다안 육괴 2마리)와 슬라임(3.6%)이 들어 있어 비중은 낮지만 **첫인상**이다. 0차 시범으로 메시·리깅이 끝났으니 가족 작업 뒤 개별 RETOUCH로 처리한다.
- 가족 간 리타깃: A1↔A2↔B는 같은 24본이라 idle·walk·hit·stagger·death를 **한 벌**로 만들어 비율만 맞추면 된다. 지금은 30종이 각자 v1 클립을 가지고 있어(G0 §4.1.5·4.1.7) 손질 비용이 30배다. 가족 공용 클립으로 합치면 손질 대상이 3벌 + 종별 고유 1~2개로 줄어든다.

### 3.2 가족별 핵심 결함(코드·메타)

| 가족 | 1순위 결함 | 2순위 | 3순위 |
|---|---|---|---|
| A1 | 발동·회복 표시 틱(3·9)과 클립(6·30) 불일치 → 발사 순간이 뭉개짐 | 탄이 몸 중심에서 나옴(손·입 소켓 없음) | 3D 히트 플래시 없음 |
| A2 | 20·24·18·12(접촉형)·3은 Core에 공격 상태가 없어 **공격 동작이 영원히 안 나옴** | 47 순간이동·10 은신이 투영 표에 없어 Idle로 보임 | 사망 1종 |
| B | 29 문지기 반격 창 30 vs 클립 45, 돌진 25 vs 20 | 엘리트·문지기 표시 0(크기만) | 갑각 `block`·광폭 `rage` 클립은 Core 상태 없음 |
| C | 부유 2종(23·27) 바닥에 붙음, 덩어리 3종 한쪽 들림 | 뼈대가 모두 달라 공용 클립 불가 | 지렁이 15 위에서 가늘다(높이 0.188) |

### 3.3 Core 제안(번호, 수치·판정 변경 없음 — 표현 연결점만)

| # | 제안 | 성격 |
|---|---|---|
| C-1 | 접촉형(2·12·18)과 20·24에 **표현 전용 "접촉 공격" 이벤트**(Idle 접촉 피해 발생 틱·방향)를 Feedback으로 내보내기. 피해·쿨다운(`st2 40~60`)은 그대로 | 표현 신호 추가, 판정 무변경 |
| C-2 | eSwoop·eSummon·eSlamWind·eShieldBash·`_tpWarnT`·`_cloaked` 상태를 `NativeEnemyRigPolicy`가 읽어 Tell/Active/Recover로 투영(Runtime 변경만, Core 무변경) | 표현 |
| C-3 | 탄 충전 종료 표시 3/9틱을 **클립 길이(6/30)로** 늘리기 — 발사 틱은 Core 그대로(충전 60 끝), 표시만 Active 6·Recover 30 | 표현 |
| C-4 | 문지기 29 클립 attack_rec 45→30, charge_run 20→25로 **클립을 Core에 맞춤**(Core 수정 아님) | 자산 |
| C-5 | 포이즈 경직 180틱에 `stagger` 40f를 늘리지 않고 "쓰러짐 진입 40 → 유지 포즈 → 복귀 20"으로 3구간 재생 | 표현 |
| C-6 | 사망 2종 이상: 넉백 크기(`kb` 벡터 길이)·치명 여부로 `death`/`death_fly`/`death_execute` 선택. Core의 `killAng`·`dmg/mhp`(`EnemyHurt.Death.cs:332`)가 이미 있음 | 표현 + 자산 |
| C-7 | 엘리트 표시: `EliteTables.Tiers.Col`·mods 이름을 읽는 고리·이름표(실버 헬 톤)와 M01~M04 어픽스 아이콘 | 표현 |

### 3.4 동시 표시 100마리 예산 추정표 (설계 예산 = 100, **실측 아님**)

CTO 지시(16:05): 사용자 "많아도 100마리 정도면 충분" → 무리 예산 **100마리**로 고정. 목표 Mac 60fps(16.6ms), 최소사양 30fps(33ms). 아래는 현재 코드 구조에서 산술 추정이고, 실측은 Mac 레인이 `enemy3d-render.json`(`renderMs`·`renders`·`fallbacks`)으로 한다.

| 비용 항목 | 현재 구조(코드) | 1마리 추정 | 100마리 추정 | 60fps 판단 | 30fps 판단 |
|---|---|---:|---:|---|---|
| **픽셀 렌더: 적별 카메라 요청** | 보이는 적마다 `SubmitRenderRequest` 1회 + Point RT 1장(`NativeEnemyRigRenderer.cs:98-104`), 캡처 카메라 1개 공유. RT 128~256px | CPU 0.1~0.3ms(URP 카메라 패스 설정·컬링·클리어) | **10~30ms** | **×** (단독으로 예산 초과) | △(상한 근접) |
| 스키닝 | 12.1~12.6k tri × 24~71본, `updateWhenOffscreen` | GPU 0.02~0.05ms | 2~5ms GPU | ○ | ○ |
| 드로우콜(캡처 내부) | 팔레트 8면 = 서브메시 8 + 무기 1 | 8~9 | 800~900 | △(배칭 0) | △ |
| 드로우콜(월드 합성) | 합성 쿼드 1 + 접촉 그림자 1, 재질·RT가 달라 배칭 불가 | 2 | 200 | ○ | ○ |
| RT 메모리 | 128²×4B=64KB(보통) ~ 256²=256KB(문지기·대형) | 64~256KB | 6.4~25MB | ○ | ○ |
| Animator | 적마다 PlayableGraph Manual Evaluate 1회/틱(`NativeEnemyRigAnimator.cs:75`) | 0.02~0.05ms | 2~5ms CPU | △ | ○ |
| Core AI 틱 | 4계층(근접 150px 매 틱, 350px 1/2, 700px 1/4, 그 밖 1/8, `EnemyTick.cs:134-153`) + 12ms 예산 초과 시 건너뜀(`:52`) + 상한 700/800 | — | 100마리면 대부분 1~2계층, 웹 실측 기준 수 ms | ○ | ○ |
| 2D 아틀라스 폴백 | SpriteRenderer 2개/마리 | 무시 | 200 스프라이트 | ○ | ○ |
| **합(3D 경로)** | | | **CPU 14~40ms + GPU 5~10ms** | **×** | **△** |

- **병목은 "적별 카메라 구조" 하나**다(브리프 §1-3이 가리키는 TOOLCHAIN 위험 #02; 해당 문서는 이 체크아웃·origin/unity/main에 없어 브리프 문구로만 인용). 30마리까지는 G0 §7 기준 7(30마리 목표 프레임)로 측정 예정이었고, 100마리는 구조 변경 없이는 60fps가 안 나온다고 추정한다.
- 대안(사용자·CTO 결정, §5.3): (a) **적 레이어 1회 캡처**: 캡처 카메라 1대가 적 레이어 전체를 화면 해상도/텍셀 배율의 저해상도 RT 1장에 한 번 렌더하고 합성(원근 크기는 월드 카메라와 같은 투영을 쓰므로 자동). 적별 RT·요청이 사라져 CPU가 1회 비용으로 줄지만, 외곽선·발밑 스냅을 적마다 하던 방식은 전체 패스로 바꿔야 한다(CH 브리프 K7 "저해상도 합성" 실험과 같은 재료). (b) 거리별 LOD: 화면 높이 60px 이하는 2D 아틀라스(현재 폴백) 또는 캐시 프레임 재사용(움직임이 바뀔 때만 재렌더). (c) 상한 100 밖(Core 700)은 계층 4의 적이므로 렌더 생략·2D.
- 측정 지점: Mac에서 100마리 장면(소환굴 2개 동시 트리거 + 문지기 웨이브)에서 `renderMs`, Unity Profiler Render Thread, 드로우콜을 1회 측정하고 이 표의 추정을 실측으로 바꾼다.

## 4. 레퍼런스 관례 (출처·접속 여부)

이 세션의 네트워크는 검색 결과(스니펫)만 받고 **원문 페이지는 열 수 없었다**(news.blizzard.com·80.lv·maxroll.gg·nex-3.com 모두 DNS 미해결, 세션 네트워크 허용 목록 밖). 아래는 검색 스니펫에서 확인한 범위이고, 원문 확인은 Mac 또는 네트워크가 허용된 세션에서 1회 더 한다. `docs/0마스터플랜/D4_STUDY/04`(DIRECTION_RESET 색인)는 이 체크아웃과 origin/unity/main 모두에 없어 링크하지 못했다(다른 레인 push 뒤 링크 추가).

| 관례 | 디아4 | PoE2 | Hades | NRftW | 우리 적용(§5) |
|---|---|---|---|---|---|
| 가족 실루엣·자세 | 가족마다 고유 무기와 **뚜렷이 다른 실루엣·자세**(2021-06 분기 업데이트). D3 GDC(Lichtner): 몬스터 가독성은 영웅과 같은 비중, 실루엣 먼저·색·장식은 뒤 | — | 포즈·타이밍·실루엣이 세부보다 중요(2차 출처) | 애니메이션이 모든 것을 끌고 감(GamesRadar 인용) | 가족 베이스 바디 3 + 변종 규칙(§3.1), 흑백 실루엣 판정(G0 §7-3) |
| 색 코딩 | 엘리트 발광 색 코딩을 **버리고** 세계에 묻힘(Fergusson, Gamestar). 공통·엘리트·보스 3단 + 어픽스 | 매직·레어 모디파이어 표시(플레이어 피드백은 예고 부족 지적) | 따뜻한 강조 = 플레이어 쪽, 적 압박 = 차가운/어두운 톤(2차 출처) | — | 실버 헬 톤 고리·이름표(C-7), 원색 금지 |
| 예고(텔) | 시즌 11 몬스터 리워크: 추적·반응 속도 조정 | 레어 도약 강타 예고 부족이 불만(포럼) → 큰 공격은 긴 예고 | Hades II 가독성 비판: 예고 한쪽만 맞음·반경이 애니메이션에서 안 보임 | 예비동작→끝까지 가는 공격→빈틈(제작 기준, G0 §5) | G2 5종 예고·발동 틱 일치 유지, 비G2 종 표현 신호 추가(C-1·C-2) |
| 사망 연출 | — | — | — | — | 2종 이상(C-6), 혈흔은 이미 있음 |
| 엘리트 변주 | 같은 모델 + 어픽스 효과, 발광 아님 | 모디파이어 이름·오라 | — | — | 같은 모델·크기 배율(G0 D3) + 표시(C-7) |

검색 출처(접속: 스니펫만): [D4 2021-06 분기 업데이트(Blizzard 포럼 미러)](https://us.forums.blizzard.com/en/d3/t/diablo-iv-quarterly-update-q2-june-2021/36377/293) · [Gamestar D4 Fergusson 인터뷰](https://www.gamestar.de/artikel/diablo-4-feature-ersten-teil-dazugehoerte,3386575.html) · [Icy Veins D4 시즌 11 몬스터 리워크](https://www.icy-veins.com/d4/news/diablo-4-season-11-brings-major-monster-reworks/) · [PoE2 Zaccie 몬스터 밸런스(poe-vault)](https://www.poe-vault.com/poe2/news/path-of-exile-2-dev-talks-monster-balance-and-his-k-pop-obsession) · [PoE2 보스 디자인(Maxroll)](https://maxroll.gg/poe2/news/poe-2-boss-design-insights) · [PoE 포럼 예고 피드백](https://www.pathofexile.com/forum/view-thread/3688673) · [Hades II 가독성 비판(nex-3)](https://nex-3.com/blog/hades-ii-has-a-legibility-problem/) · [Hades VFX(80.lv)](https://80.lv/articles/a-behind-the-scenes-look-at-the-effects-in-hades/) · [NRftW 공격 애니메이션(80.lv)](https://80.lv/articles/a-closer-look-at-no-rest-for-the-wicked-s-attack-animations/) · [NRftW 전투(GamesRadar)](https://gamesradar.com/despite-diablo-vibes-ori-devs-new-action-rpg-is-actually-much-more-metroidvania-than-most-and-also-inspired-by-some-of-the-best-fighting-games-of-all-time). 레퍼런스의 에셋·코드는 반입하지 않는다.

## 5. 백로그

### 5.1 가족 순서와 관문 (영웅 CH 파이프라인과 같은 관문)

CH 브리프 C1(베이스 바디·리그·idle) → C2(장비) → C3(교체) 순서를 가족에 대응한다. **영웅 C1 리그 합격 뒤** M1 착수(브리프 §3). 각 관문 합격은 "33° 1x·3x 캡처 + 영웅 옆 비교 + 점 0"이고 판정은 Mac이다.

| 순서 | 가족 | G-LOCK | G-바디 | G-리그 | G-클립 | G-픽셀 | G-무리 |
|---|---|---|---|---|---|---|---|
| M1 | **A1 원거리 시전 이족**(현자형 7 기준) | LOCK 대조표 6종(실루엣·재질·발광 위치·색 3·금지), 기존 GPT 시트 S3·S4·S1·T26·T08·T09를 원화로 인정 | 베이스 바디 1(1.8m 마른 이족) + 변종 6(머리·배·지팡이 파트) | Rigify 24본 공용(영웅 리그 본 수 축소판), 웨이트 전사 | 공용 charge 60/fire **6**/rec **30** + idle·walk·hit·stagger·death 1벌 + summon·trap·revive | 표시 3·9 → 6·30(C-3), 탄 소켓(손·입) | 10마리 → **30마리** 장면 1x·3x, `renderMs` 기록 |
| M2 | **A2 근접 경량 이족**(하급 사도 0 기준) | 9종 LOCK | 베이스 바디 1 + 무기 파트 4(도끼·쌍낫·낫팔·갈고리) + 날개 1 + 크기 변종(요마 ×0.6) | A1 리그 재사용(비율만) | swing 24/2/36 공용 + 접촉형 표현 신호(C-1) + vanish/appear·dive 투영(C-2) + **사망 2종**(C-6) | 히트 플래시(3D 경로) | 30마리 |
| M3 | **B 중량 이족**(갑각 사도 4 기준) | 6종 LOCK, 문지기 위엄 규칙 | 베이스 바디 1(2.1m 덩치) + 등딱지·방패·망치·등 얼굴 파트, 크기 1.34~2.57 | A1 리그 비율 변형 | slam 36/3/45·charge 24/20/40·combo·block 공용, 문지기 클립 30·25 맞춤(C-4) | 엘리트 고리·이름표(C-7), 포이즈 경직 3구간(C-5) | 30마리 + 문지기 웨이브 장면 |
| M4 | C 비인간형 | 종별 RETOUCH(부유 높이, 덩어리 접지, 지렁이 굵기) | 기존 메시 유지 | 기존 Tripo 리그 유지 | 종별 v1 손질 | 접지 보정 | 첫 전투(육괴 2 + 소환굴 1) |
| M5 | 전체 | — | — | — | — | **100마리 구조**(§3.4 대안 a/b 중 결정) | **100마리 장면 실측** → 60/30fps 판정 |

- M1~M3의 클립은 가족 공용 1벌로 만들고 종별 고유 1~2개만 따로 둔다. 지금 30종 개별 v1 클립은 공용 클립이 합격한 뒤 **교체**한다(병행 유지 비용 없음).
- 중단 조건(G0 §7): 같은 방법 두 종 연속 같은 결함 FAIL → 방법 변경. 2D 폴백은 100마리 LOD로 남긴다.

### 5.2 즉시 가능한 수정(코드 승인 뒤, Core 무변경)

| # | 일 | 파일 | 근거 |
|---|---|---|---|
| R-1 | 탄 표시 Active 3·Recover 9 → 6·30 | `NativeEnemyRigPolicy.cs:25-26` | §2 항목 3 |
| R-2 | 3D 히트 플래시: 합성 셰이더에 `_HitTint` 추가, `HurtTicks>0`에 2D와 같은 (1,.62,.62) | `RigPixelComposite.shader`, `NativeEnemyRigRenderer.Render` | §2.1 |
| R-3 | eSwoop·eSummon·eSlamWind·eShieldBash·tp 경고·은신 상태를 Tell/Active/Recover로 투영 | `NativeEnemyRigPolicy.Sample` | §2 항목 3 |
| R-4 | 부유 개체(23·27) 바닥 오프셋 필드(`floatHeight`) 추가 | `enemy_rig_models.json`, `NativeEnemyRigRenderer.cs:48` | §2 항목 5 |
| R-5 | 문지기 29 클립 길이 Core 맞춤 | Blender → `Warden.fbx` | §2 항목 3 |
| R-6 | 사망 뒤 시체 유지(deathTicks 뒤 마지막 프레임 N초 유지 후 페이드) | `NativeEnemyRigRenderer.cs:89` | §2 항목 4 |

### 5.3 사용자·CTO 결정 항목

1. **100마리 렌더 구조**: (a) 적 레이어 1회 캡처(전체 패스) / (b) 거리 LOD(60px 이하 2D·캐시) / (c) 둘 다. 지금 구조(적별 카메라)로는 100마리 60fps 추정 ×.
2. **가족 공용 클립으로 통합**(30종 개별 v1 폐기, 3벌 + 고유) 승인 여부. 승인 시 M1부터 공용으로 만든다.
3. **사망 2종 이상·시체 유지** 범위(날아감·처형 포함 여부, 유지 시간).
4. **엘리트 표시 방식**(실버 헬 고리·이름표 vs 디아4식 무표시 + 어픽스 효과만).
5. 레퍼런스 원문 확인용 네트워크 허용(news.blizzard.com·80.lv·maxroll.gg·nex-3.com) 또는 Mac 세션에서 재확인.
6. C-1(접촉형 표현 신호) Feedback 추가는 Core 파일(`Simulation.EnemyBridge`) 한 줄이 필요하다 — 판정·수치 무변경이지만 Core 디렉터리 변경이므로 승인 대상.

## 6. Mac 미판정 목록 (코드로 판정 불가, 8칸)

| # | 항목 | 장면 |
|---|---|---|
| 1~4 | 가족별 실루엣 구별(영웅 옆 1x·3x, 흑백) | 34° 1920×1080·3840×1080, 가족 대표 1종 + 영웅 |
| 5~8 | 가족별 먼 거리 가독성(화면 위쪽 85~130px) | 소환굴 1개 트리거 뒤 먼 적 10마리 이상, 안개·비네트 포함 |
| 추가 | 비사람형 9종 실제 정면(WIRING "정면 보정" 표), 부유·접지, 30마리 `renderMs`, 10초 무음 영상 | WIRING §남은 일과 같음 |

## 7. 갱신한 문서

- 이 문서(신규). `몬스터_총관리.md` 상단에 이 감사 링크 1줄. `docs/CHANGELOG_SYNC.md` 절 1개. 코드·Core·에셋 변경 0.
