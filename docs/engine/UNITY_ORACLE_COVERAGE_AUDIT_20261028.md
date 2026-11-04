# Unity Core oracle 범위 감사 (2026-10-28)

- 대상: `origin/unity/main` **169656706** 의 `unity/Assets/Exoduser/Runtime/Core/**`(.cs 98개)와 `unity/Tools/*` 폴더 60개(검증 도구 57개 + Fixtures·MediaRecovery·Tests)
- 웹 기준: `origin/main` **8acbec5fa** 의 `game.html`(65,958줄, sha256 `6f9253d9…3dfe01`). 아래 줄 번호는 모두 이 판 기준이다. 예전 보고서의 줄 번호는 판이 달라 맞지 않는다.
- 방법: 읽기만 했다. 코드 수정·Unity 빌드·.NET/Node 실행은 하지 않았다. 검사 수는 문서(`docs/engine/UNITY_*`, 보스전 보드, 도구 README)에 적힌 최근 값이고, 이번 감사에서 다시 돌린 값이 아니다.
- 작성: unity-core-oracle-opus (유니티 총괄 배정)

## 0. 결론

1. **수치 계산 Core는 대부분 웹 원문을 Node VM에서 실행해 대조한다.** 적 생성·틱·AI·피격(앞·중간), 돌진·패링·반사, 플레이어 피격, 지역, 드랍, 물약, 구르기, 석궁, 드루이드(원본 경로)가 여기에 든다. 이 부분의 빈 곳은 작다.
2. **빈 곳은 이 계산들을 엮는 Simulation 접착층과, 아직 이식·병합되지 않은 웹 구간에 몰려 있다.** M1(1-1 한 판 완주)에 걸리는 큰 빈 곳은 다섯 가지다.
   - **처치 꼬리**: `hurtE` 사망부(42701~43325) 중 Unity에 들어온 것은 손으로 조립한 `Simulation.KillEnemy`뿐이다. 사망부 앞쪽 oracle(CX-04c1, 4,225,618/0)은 `claude/unity-pc-c01-20261026` 6496a5660에만 있고 **unity/main에 병합되지 않았다.**
   - **적 이동 흐름장**: 웹은 `_ffBuild`(32030)로 흐름장을 계속 갱신하고(32335) 모든 추적 이동이 `_ffMoveE`→`_ffDir`을 탄다. Unity는 흐름장 없이 이동하고, enemy-ai-oracle은 `prelude.js`에서 `_ffDir(){return null}`로 꺼 둔 채 비교한다. 벽이 있는 실제 1-1에서는 적이 돌아가는 경로가 웹과 다르다.
   - **스탯 재계산**: 웹 `applyStats`(28085~28147)에 대응하는 `InventoryState.CalculateStats`는 손 이식이다. 대조는 stat-parity 2/2 스냅샷뿐이다. 이동 속도도 `(2.6+dex*.005)*(1+_iMovSpd)`만 반영하고, 웹 28110의 이동속도 어픽스·근성·크리스탈(28126)과 이동 식 33207의 장화 `bt().spd`는 빠져 있다.
   - **플레이어 행동 상태 머신**: `update()` PLAYER_ACT(32337~34530)의 상태 전이·프레임 타이밍은 CoreTests 손 기대값 몇 줄(휘두르기 5프레임, 대각 2.6px)과 skill-sim-test 67/0(손 기대값)에만 기대고 있다. 판정 함수는 dash-parry-oracle 187,165/0이 덮지만, 언제 어떤 상태로 넘어가는지는 대조하지 않는다.
   - **스킬 실행기·악의구**: 수치 공식(SkillRules)은 skill-oracle이 덮는다. 상태·틱(장판·강타·얼음보주·악의구 비행·폭발 `_fireballExplode` 24761·약화 `_maliceWeakMul` 24751)은 손 기대값 67건뿐이다.
3. **가로 위험이 하나 있다. oracle의 기준 game.html이 대부분 낡았다.** 커밋된 oracle.json 25개 중 현재 origin/main과 같은 판을 고정한 것은 parry-reflect·region 2개뿐이다. 10-24 뒤 game.html 커밋은 12개였다. 대부분 소리·연출이지만 구르기 18프레임(2ec76449a)처럼 규칙이 바뀐 커밋도 있었다. 구르기는 Unity가 따라갔다(13afecf09). 나머지가 같은지는 블록 해시를 다시 대조하기 전에는 알 수 없다.

## 1. 시스템별 대조표

방식 표기: **원문** = 웹 원문 줄 범위를 VM에서 실행한 결과와 비교(기대값 손 입력 없음), **캡처** = 웹 화면/값 캡처와 비교, **손** = 사람이 쓴 기대값, **실맵** = 실제 ch1_map 데이터로 동작 확인(손 기대값).

### 1-1. 적

| 시스템 | Core 파일 | 웹 (origin/main 8acbec5fa) | 검증 도구 · 최근 검사 수 | 방식 | 빈 곳 |
|---|---|---|---|---|---|
| 적 수치 테이블 | EnemyTables·EliteTables·EnemyTickTables·EnemyHurtTables (생성) | `ETYPE_HP` 31006~, `HELL_SPAWN` 31152, `ELITE_TIERS` 31216, `AURA_DEFS` 31266, `BOSS_MOVES` 9861 | enemy-tables-oracle 2,784/0 | 원문 | 생성 파일을 손으로 고쳤는지 감지하는 검사가 없다(§2-3) |
| 적 생성 `mkEn` | EnemyFactory(생성)·EnemySpawn(생성)·EnemySpawn.Tick | `mkEn` 31303~ | enemy-spawn-oracle 204,592/0 (531건 실패를 16167a3ac에서 고침) | 원문 | 없음 |
| 스폰 풀 `rollEtype`·소환굴 수 | EnemyPools | `rollEtype` 31176, `_spawnHoleCount` 31213 | enemy-pool-oracle 26,271/0 | 원문 | 없음 |
| 소환굴 갱신 | SpawnHoles·Simulation.Holes | update() 소환굴 블록 35822~35879 | c01-field-oracle 448/0 (1-1 최종 구멍 14개, 대본 걷기) | 원문 | 걷기 대본 1종이다. 구멍 깨우기 거리·간격의 경계 사례는 적다 |
| 시작 고정 몹·문지기 | Simulation.StartMobs | `_spawnCh1StartMediumEyeMasses` 31702~31715, `initStage` 문지기 블록 ~31790~31832 (`_isGateGuard` 31808) | start-mobs-test 24/0 | **손·실맵** | **웹 원문 대조 없음.** 위치·엘리트·배율·호위 수·난수 순서가 손 기대값이다 |
| 적 루프 앞처리 + updateE 앞 | EnemyTick·EnemyTickContext | 적 루프 앞처리(update 안), `updateE` 38781~ 앞부분 | enemy-tick-oracle 3,253,978/0 | 원문 | 없음 |
| updateE 본문(1-1 etype 0~29·47) + DOT | EnemyAi·Simulation.EnemyAi | `updateE` 38781~41607 | enemy-ai-oracle 2,323,428/0 (692 시나리오) | 원문 | ① **흐름장 꺼짐**: `prelude.js`가 `_ffMoveE`를 가짜 이동으로, `_ffDir`을 null로 바꾼다 → 이동 경로는 비교 대상이 아니다. ② 1-1 밖 etype은 범위 밖(M1 뒤) |
| 적 이동 흐름장 | (없음) · Simulation.EnemyAi의 `_ffMoveE` 대체 | `_ffBuild` 32030~32079, `_ffDir` 32080, `_ffMoveE` 32090~, 갱신 32335, Worker 오프로드 31929~ | 없음 | — | **이식 안 됨 + oracle 없음** |
| 적 피격 앞·중간 `hurtE` H1·H2 | EnemyHurt·EnemyHurt.Body·EnemyHurtContext·EnemyPoiseRules | `hurtE` 42310~42700 (`데미지 → HP 직행` 42554) | enemy-hurt-oracle 688,490/0 (보스전 보드 기록: H1 933,221/0, H2 2,437,201/0) | 원문 | 없음 |
| 적 피격 사망부 앞 (H3a: 디코이·부활·On-Kill·침강·콤보·문지기) | unity/main에 **없음** | `if(e.hp<=0){` 42701~42951 | CX-04c1 4,225,618/0 — **c01 브랜치 6496a5660에만 있음** | 원문(브랜치) | **unity/main 미병합.** 지금은 ReviveRules·Simulation.Revive(부활 일부)와 `Simulation.KillEnemy`(손 조립)이 대신한다 |
| 적 피격 사망부 뒤 (잔해 드롭~끝) | Simulation.KillEnemy (손) | 42952~43325 | 없음 (CX-04c2 = 0) | **손** | **oracle 없음.** 처치 수·콤보 틱(보스 1800 / 일반 +60, 최대 1200)·악의오브 +4·킬 드랍·엘리트 악의오브·장비 드랍·경험치의 **순서와 난수 소비 순서**를 웹과 맞춰 본 적이 없다 |
| 에너지쉴드 | EnergyShield | hurtE 쉴드 블록, hurtP 쉴드 블록, 쉴드 재생 32939~ | enemy-hurt / player-hurt / shield-revive oracle 안에서 | 원문 | 없음 |
| 부활·구울·드루이드 피날레 | ReviveRules·Simulation.Revive | `_druidFinaleReviveChance` 17244, `_reviveDruidFinale` 17247, `_spawnGhoul` 41801, `GHOUL_DEFS` 41790 | shield-revive-oracle (문서에 최근 수 없음) | 원문 | 사망부 전체(H3) 안에서의 호출 순서는 위 "사망부" 행과 같은 빈 곳 |

### 1-2. 플레이어

| 시스템 | Core 파일 | 웹 | 검증 도구 · 최근 검사 수 | 방식 | 빈 곳 |
|---|---|---|---|---|---|
| 이동·충돌·60Hz 틱 | Simulation (Codex 소유)·SimulationState | `canMv`, PLAYER_ACT 32337~, 이동 식 33207 | CoreTests(대각 2.6px·벽 미끄러짐 손 기대값) + `canMv` 표본 2,523 원문 | 충돌=원문, 이동=**손** | 이동 속도가 2.6 고정에 가깝다(§0-2 스탯 재계산). 상태별 배율(33320 ×.8, 33483 ×.3, 33950 ×.35 등)의 대조 없음 |
| 근접 휘두르기·기검참 | KiSlash·Simulation | `meleeRef` 28953, `hitArc` 37789, `spawnCrescent` 16969, `_fireKiSlashCrescent` 16997, `updateCrescents` 20002 | ki-slash-oracle 93/0 + damage-parity-oracle(실패 0, 수 미기재) | 원문 | 피해는 덮였다. 입력→상태 전이 프레임(휘두르기 5프레임, 3타·홀드 차지 진입)은 CoreTests 손 기대값 |
| 돌진·패링·방패·E 강타 판정 | ParryRules·ParryRewards·ChainDash·PlayerPoise | `_lParryWinTicks` 16803, `isPWin` 38666, `doParry` 38667~38776, `_eSwingRadius` 3526, `_harp*`/`_dash*` 13058~ | dash-parry-oracle 187,165/0 | 원문 | 없음(순수 함수) |
| 돌진·패링·방패 상태 머신 | Simulation.PlayerCombat·Simulation.BashStrike | PLAYER_ACT sBash 분기 등 | 없음 (파일 주석에 미이식 목록: 반사 파이프라인 일부, sRecover Shift 취소, 실버테일 런지 패링, 유니크 훅) | **대조 없음** | 상태 전이·취소 창·게이지 소비 시점이 웹과 같은지 확인한 적이 없다 |
| 패링 반사 | ParryReflect·Simulation.ParryReflect | `_isBigEnergy` 17443, `_physicalProjectileMultiplier` 17110, 탄 루프 반사 분기 | parry-reflect-oracle 48,708/0 (현재 판 고정) + parry-reflect-test(시뮬) | 원문 | `statInt()/statStr()`=1 대체, `_uParrySplit` 등 유니크 훅 미이식(문서화됨) |
| 구르기 | RollRules·Simulation.Roll | `_canRoll` 45574, `activateRoll` 45575, `_finishRoll` 45600, `_tickBladeDash` 45613 | roll-oracle 88,140/0 (18프레임 반영 뒤) | 원문 | 입력 조합(방향키+구르기키 순서)은 손 |
| 플레이어 피격 | Simulation.PlayerHurt·PlayerPoise | `hurtP` 43622~43850 | player-hurt-oracle 47,559/0 | 원문 | 없음 |
| 분노·악의 | RageMalice·SimulationRage | `_rageMax` 28073, `_malCost` 28264, `_maliceMul` 28071 | rage-malice-oracle (최근 수 미기재) | 원문 | 엘리트 악의(사망부 안)는 처치 꼬리 빈 곳에 포함 |
| 레벨·경험치 | LevelExp | `_calcMaxExp` 43334, `addExp` 43340, 처치 경험치 줄(사망부) | level-exp-oracle (oracle.json 30MB git 제외, 최근 수 미기재) | 원문 | 레벨업 부수효과(HP·ST +20%)는 손. `_processPassiveQueue` 미이식 |
| 자동 물약·킬 드랍 물약 | AutoPotion·AutoPotionEquipment | `potHeal` 28255, `addPotion` 28433, 킬 드랍 줄(사망부 뒤) | auto-potion-oracle 2,438/0 | 원문 | 없음 |
| 석궁 자동 사격 | Simulation.Crossbow·WeaponCatalog | `_autoBowSpec` 17632, `_fireXbow` 28886, `_autoFireBowSkill` 28908, 플레이어 탄 루프 35362~ | weapon-xbow-oracle 108,780/0 | 원문 | 없음 |

### 1-3. 스킬

| 시스템 | Core 파일 | 웹 | 검증 도구 · 최근 검사 수 | 방식 | 빈 곳 |
|---|---|---|---|---|---|
| 스킬 수치(배율·비용·반경·쿨·둔화) | Skills/SkillRules | `_SK_MUL` 44714, `_skMul` 44763, `activateSpikeTrap` 45766, `activateGiantSlam` 46706, `_gSlamHit` 46785, `activateHolyDome` 46964, `activateIceOrb` 47014, `activateIceShatter` 47024 | skill-oracle (최근 수 미기재) | 원문 | 없음 |
| 스킬 실행기(입력·상태·틱) | Skills/Simulation.Skills | `_dispatchSkillSlot` 13083, `_dispatchCtSkill` 13271, update() 장판·강타·얼음보주 틱(`G._fireZones`, 얼음보주 36872~36893) | skill-sim-test 67/0 | **손** | 장판 DOT 주기·둔화 적용 시점·강타 타격 프레임·얼음보주 자동 파쇄의 웹 대조 없음 |
| 악의구(E 기본) | Skills/Simulation.Fireball | `_execMagicE` 29132, magicCast "악의구 (기본 폴백)" 33821~, 플레이어 탄 루프 35362~, `_fireballExplode` 24761, `_maliceWeakMul` 24751 | skill-sim-test 안 일부 | **손** | 비행·성장·유도·벽 반사·폭발 반경·약화 스택 대조 없음 |
| 스킬 창 표시 | SkillUiState | `SKILL_LIST` 44368 | skill-ui (export만, 값 복사) | 캡처 | — |

### 1-4. 보스·스테이지·지역

| 시스템 | Core 파일 | 웹 | 검증 도구 · 최근 검사 수 | 방식 | 빈 곳 |
|---|---|---|---|---|---|
| 드루이드(웹 원본 경로) | DruidBoss·.Moves·.Hazards·.Hit·.Reflect·DruidBossData(생성)·Simulation.DruidBoss | `_bossStartPattern` 37899, `_bossAI` 38570, 드루이드 `updateE` 상태, `spawnProj` 17128, `_spawnBossProjectile` 17121, update() 보스 장판 37200~37320 | druid-boss-oracle 5,421,635/0 (리모델 플래그 끔) | 원문 | 일반 원거리 몹 탄이 같은 탄 루프 경로를 쓸 때 그 시나리오가 들어 있는지 미확인 |
| 드루이드 리모델(RM-B1) | DruidBoss.Remodel·DruidRemodelData·DruidTelegraph·Simulation.DruidRemodel | (웹에 없음 — 새 설계) | druid-remodel-test (손) | 손 | 웹 대조 대상이 아니다(사용자 확정: 보스는 새로 설계). 플래그를 켰을 때 공유 코드(탄·장판) 회귀는 원본 oracle이 보지 않는다 |
| 보스 아레나·스테이지 흐름 | BossArena·StageFlow | `genBossArena` 30880, `_enterBossArena` 30932, `checkRooms` 41967~42211, `_applyCh1StartNorthGate` 30204 | stage-flow-oracle 7,076/0 | 원문 | `initStage` 전체(31716~31853)는 범위 밖 |
| 지역 4분면 클리어 | Simulation.Regions | `_regionInit` 60963, `_regKill` 60994, `_regionCheckClears` 61032, `_regionTick` 61045 | region-oracle 204,151/0 (현재 판) + region-test 55/0 (실맵) | 원문 | 없음 |
| 첫 실습 | FirstPracticeCombat·FirstPracticeFlow·FirstPracticeSession | game.html 튜토리얼 | first-practice (손) | 손 | 웹 27레슨 중 일부만(A18) — M1 경로 밖 |

### 1-5. 아이템·저장

| 시스템 | Core 파일 | 웹 | 검증 도구 · 최근 검사 수 | 방식 | 빈 곳 |
|---|---|---|---|---|---|
| 월드 드랍·아이템 생성 | WorldDrop·ItemFactory·DropTablesData(생성) | `rollDrop` 32185, `mkItem` 16073, `rollAffixes` 15310, `_wiPush` 16902 | drop-oracle 5,900/0 (+ 시드 확장 114,000/0) | 원문 | 뼈 조각·크리스탈·소켓석(같은 `rollDrop` 뒤쪽) 미이식 |
| 장비 적용·스탯 재계산 | InventoryState.CalculateStats·EquipmentApplication | `applyStats` 28085~28147, `_refreshEquipmentStats` 16468 | stat-parity 2/2 MATCH (스냅샷 2개) | 캡처 2건 | **원문 실행 대조 없음.** 이동속도 어픽스·근성·크리스탈·`_altSpd`·패시브가 빠져 있다 |
| 전투력 | InventoryCombatPower | `calcCP` 49745 | (전용 oracle 없음, 미리보기 화면 비교만) | 캡처 | STATS·PASSIVES 항이 0(파일 주석) |
| 인벤토리 상태·비교 | InventoryState·InventoryComparison·InventoryData | `_rarName` 14528, `cmpKeys` | inventory-oracle 892/0, comparison-oracle | 원문 | 없음 |
| 전투 세이브 | CombatSave·CombatSaveStore·SaveJson | `dbSave`의 `saveData` 3566~, `dbRestore` 3636, `_restoreExpProgress` 3630 | save-oracle (최근 수 미기재) | 원문 | 없음 |
| 캐릭터·설정·키·언어·로비·HUD·피드백·일시정지 | CharacterRoster*·NativeSettings*·KeyBindings·LobbyFlow·LobbyLanguage·HudValues·Feedback·PauseNavigation·FrontendEntryFlow·FrontendPadPolicy·WarriorStoryState | `updateHUD` 60512, `_hset` 60511, `BINDS` 6222 등 | hud-oracle·feedback-oracle·keybind-parity 1,079/0·lobby-oracle·language-oracle·startup-flow 29/0·inventory-navigation 35/35 외 | 원문·캡처·손 혼합 | 전투 규칙과 무관(UI 계약). 이번 위험도 대상에서 뺐다 |

## 2. 가로 빈 곳 (여러 시스템에 걸침)

### 2-1. oracle 기준 판이 낡음

커밋된 oracle.json이 고정한 game.html sha256 앞 16자. 현재 origin/main = `6f9253d93f000b14`.

| 고정 판 | oracle |
|---|---|
| `6f9253d93f000b14` (현재) | parry-reflect, region |
| `f459dd1faee75a68` | dash-parry, enemy-ai, player-hurt |
| `feffdc30a7c0dc27` | damage-parity, roll, skill |
| `d73d691989c1cb84` | auto-potion, enemy-spawn, enemy-tick |
| `2e5caefd04e80ad4` | stage-flow, weapon-xbow |
| `dee094fd165e9b2f` (10-23 Codex 스냅샷) | feedback, hud, inventory, ki-slash |
| 기타 | drop `38d8ea2d`, enemy-hurt `e096ab5c`, enemy-tables `4d911cdd`, comparison `ba930ad5`, lobby `8bff9fd6`(index.html) |
| 해시 기록 없음 | c01-field, enemy-pool, language |

- 대부분의 export.cjs는 실행할 때 블록별 sha256을 남긴다(예: enemy-hurt `anchors[]`). 따라서 **블록 해시만 다시 계산하면** 전체 export·dotnet 없이 바뀐 블록을 찾을 수 있다.
- 판이 다르다고 해서 결과가 틀렸다는 뜻은 아니다. 대조한 함수 블록이 바뀌었는지가 미확인이다.

### 2-2. 손 기대값 테스트가 규칙 정답처럼 쓰이는 곳

CoreTests(45줄), skill-sim-test 67, start-mobs-test 24, region-test 55, druid-remodel-test, first-practice, inventory/pause-navigation. 이 중 CoreTests에는 이미 낡은 기대가 있다. `"unimplemented item factory cannot fake pickup"`은 D01(ItemFactory) 이식 전 가정이다. `"source death rewards4mat1XP"`도 처치 꼬리를 손으로 고정한다. 손 기대값은 "Simulation이 공식을 순서대로 부르는가" 확인용으로만 쓰고, 규칙 정답은 원문 oracle로 옮겨야 한다.

### 2-3. 생성 파일 손 편집 감지 없음

`gen-cs.cjs` 산출물 8개: DropTablesData, DruidBossData, EliteTables, EnemyFactory, EnemyHurtTables, EnemySpawn, EnemyTables, EnemyTickTables. 16167a3ac 사고(EnemySpawn.cs에 `_mwStk` 손 추가)는 oracle 필드 규칙 덕분에 우연히 잡혔다. 생성기를 다시 돌려 커밋본과 바이트 비교하는 검사는 아직 없다.

### 2-4. 이미 고쳐진 것 (확인만)

- 테스트 csproj Core 글롭: `Core/*.cs`(비재귀)가 남은 csproj는 **0개**(671d562a8 반영 확인).
- `StageFlowTests.csproj` 저장소 추가(강제 add) 확인.

### 2-5. 실행 환경 차이 (이번 범위 밖, 기록만)

oracle은 Windows .NET 8 독립 실행이다. `JsMath`(fdlibm 포트)가 Atan2/Cos/Sin을 V8과 맞추지만 `Math.Pow`는 .NET 그대로다. Mac·IL2CPP Player에서 비트 일치하는지는 상태 3(실플레이 인수) 때 실측할 항목이다(보스전 보드 미확인 항목과 같음).

## 3. 빈 곳 위험도

기준: 플레이 영향(크다=매 전투·매 처치에 보임) · M1 해당 · 숫자가 쉽게 어긋나는 정도(난수 순서·프레임·식 분기 수).

| # | 빈 곳 | 플레이 영향 | M1 | 어긋나기 쉬움 | 위험도 |
|---|---|---|---|---|---|
| G1 | 처치 꼬리(`hurtE` 사망부 42701~43325) 손 조립 + CX-04c1 미병합 | 큼 — 모든 처치의 경험치·드랍·악의·콤보·문지기 | 예 (문지기 +10%가 관문 조건) | 높음 — 난수 소비 순서·분기 많음 | **상** |
| G2 | 적 이동 흐름장 미이식·oracle에서 꺼짐 | 큼 — 벽 있는 맵에서 모든 추적 몹 | 예 | 높음 — 경로가 갈리면 이후 상태 전부 갈림 | **상** |
| G3 | 스탯 재계산 `applyStats` 손 이식(대조 2건) | 큼 — 드랍 장비를 끼는 순간 HP·방어·치명·속도 | 예 (1-1 드랍 장착) | 높음 — 항 30여 개 | **상** |
| G4 | 플레이어 행동 상태 머신(PLAYER_ACT) 전이·프레임 | 큼 — 조작감 전체 | 예 | 중 — 판정 함수는 덮였고 전이만 비어 있음 | **상** |
| G5 | 스킬 실행기·악의구 틱 손 기대값 | 중 — 시작 스킬 4종 + E 기본 | 예 | 중 | **중** |
| G6 | oracle 기준 판 낡음(23/25) | 잠재적으로 큼 — 웹이 바뀌었는데 Unity가 옛 규칙을 지킬 수 있음 | 예 | 판정 전 미확인 | **중** (점검은 싸다) |
| G7 | 시작 고정 몹·문지기 배치 손 기대값 | 중 — 1-1 첫 전투·관문 조건 | 예 | 중 — 난수·위치 | **중** |
| G8 | 생성 파일 손 편집 감지 없음 | 중 — 재생성 때 조용히 깨짐 | 간접 | 낮음(사고 1회) | **하** |
| G9 | 전투력 `calcCP` STATS·PASSIVES 0 | 작음 — 표시값 | 아니오 | 낮음 | **하** |
| G10 | 리모델 플래그 켠 상태의 공유 코드 회귀 | 중 | 예 (M1이 리모델 드루이드를 쓰면) | 중 | **하~중** — 리모델은 웹 대조 대상이 아니라 보스전 총괄 판정 |

## 4. 다음 oracle 작업 단위 제안 (위험도 순)

공통 규칙: 각 단위는 **새 Tools 폴더 하나 + 그 단위 보고서 하나**를 소유한다. Core를 고칠 일이 생기면 아래 "Core 소유"에 적힌 파일만 고친다. 다른 단위 소유 파일은 고칠 곳을 보고서에 적어 넘긴다. `Simulation.cs`(Codex 소유) 수정은 O-1만 하고, 다른 단위는 patch 문서로 남긴다. oracle은 이번 감사의 기준 판(origin/main 8acbec5fa, sha `6f9253d9…`)으로 export한다.

| 순서 | 단위 | 웹 범위 | 파일 범위 (겹침 없음) | 검사 방식 | 담당 |
|---|---|---|---|---|---|
| O-1 | **처치 꼬리 oracle (CX-04c1 병합 + CX-04c2)** | `hurtE` 42701~43325 전체, 같은 적 재진입 포함 | Tools: `enemy-hurt-oracle` 확장(H3a·H3b) · Core 소유: `EnemyHurt.Death*.cs`(신규), `Simulation.cs`의 `KillEnemy`/`OnEnemyZeroHp` 구역, `ReviveRules.cs`, `Simulation.Revive.cs` | 원문 실행. 6496a5660 H3a를 현재 unity/main 위로 옮기고 H3b(잔해 드롭~끝)를 추가한다. 처치 결과 필드 전부와 `Math.random` 소비 횟수·순서를 비교한다. 변이 검사 포함 | **Opus** (사망부 분기·난수 순서 판단) |
| O-2 | **적 흐름장 이동 oracle** | `_ffBuild` 32030~32079, `_ffDir` 32080, `_ffMoveE` 32090~, 갱신 32335, Worker 경로 31929~ | Tools: `flow-field-oracle`(신규) · Core 소유: `FlowField.cs`(신규), `Simulation.EnemyAi.cs`의 `FlowMove` 연결, `EnemyTickContext.cs` | 원문 실행. 실제 `ch1_map.json` 격자에서 플레이어 위치 표본마다 흐름장 배열 전체와 `_ffMoveE` 한 걸음을 비교한다. 먼저 Worker 비동기(한 프레임 늦은 장)와 동기 `_ffBuild` 중 어느 쪽이 웹 실제 동작인지 판정해 문서에 적는다. 이후 enemy-ai-oracle `prelude.js` 스텁 제거 여부를 결정 | **Opus** (Worker 타이밍 판정) |
| O-3 | **스탯 재계산 oracle** | `applyStats` 28085~28147, `_refreshEquipmentStats` 16468, 이동 식 33207 `bt().spd` | Tools: `apply-stats-oracle`(신규) · Core 소유: `InventoryState.cs`의 `CalculateStats`, `EquipmentApplication.cs`, `InventoryData.cs`, `SimulationState.cs`의 `PlayerSpeed` | 원문 실행. drop-oracle이 만드는 아이템(1-1 드랍 티어·레어도 전 범위)으로 장비 조합 격자를 만들고, Lv·난이도·스탯 포인트별 `P.*` 결과(mhp·mst·mmp·def·speed·crit·regen)를 비교한다. 패시브·크리스탈 0과 비0을 둘 다 넣는다 | **Opus** (의존 함수 스텁 범위 결정) |
| O-4 | **oracle 출처 드리프트 점검** | 각 export.cjs의 앵커 블록 | Tools: `oracle-drift`(신규, 읽기 전용) · Core 소유 없음 | 각 export.cjs의 앵커 규칙으로 현재 game.html에서 블록만 다시 잘라 oracle.json에 기록된 블록 sha256과 비교한다. 바뀐 블록 목록과 재export가 필요한 oracle 목록을 낸다. 해시 기록이 없는 c01-field·enemy-pool·language에는 기록을 추가한다. 전체 export·dotnet 실행은 하지 않는다 | **Sonnet** (반복) |
| O-5 | **플레이어 행동 상태 머신 트레이스 oracle** | PLAYER_ACT 32337~34530 중 이동·근접 휘두르기·sBash·sDraw·sRecover·패링·구르기 진입 | Tools: `player-act-oracle`(신규) · Core 소유: `Simulation.PlayerCombat.cs`, `Simulation.BashStrike.cs`, `Simulation.Roll.cs` (Simulation.cs 쪽 수정은 patch 문서) | 원문 실행. 입력 대본(키 누름·뗌·홀드 프레임)을 웹 update()의 플레이어 구간에 넣고, 프레임마다 `P.s`·`P.st2`·x/y·st/mp·게이지를 기록해 비교한다. 적·투사체는 stub. 휘두르기 5프레임·대각 2.6px 같은 CoreTests 손 기대값을 여기로 옮긴다 | **Opus** (update() 잘라낼 경계 판단) |
| O-6 | **시작 스킬 실행기·악의구 트레이스 oracle** | `_dispatchSkillSlot` 13083, `_dispatchCtSkill` 13271, 장판·강타·얼음보주 틱, 악의구 33821~·35362~·`_fireballExplode` 24761·`_maliceWeakMul` 24751 | Tools: `skill-trace-oracle`(신규) · Core 소유: `Skills/Simulation.Skills.cs`, `Skills/Simulation.Fireball.cs` | 원문 실행. 스킬별 대본(시전→틱→종료)을 돌려 프레임별 장판 목록·적 HP·둔화·악의·쿨을 비교한다. skill-sim-test의 규칙성 기대값을 이쪽으로 옮기고, skill-sim-test는 "순서 호출" 검사로 줄인다 | **Opus** 명세 → **Sonnet** 구현 (O-5 틀을 재사용) |
| O-7 | **시작 고정 몹·문지기 oracle** | `_spawnCh1StartMediumEyeMasses` 31702~31715, `initStage` 문지기·호위 블록 ~31790~31832 | Tools: `start-mobs-oracle`(신규) · Core 소유: `Simulation.StartMobs.cs` | 원문 실행. `initStage(0)` 해당 블록을 VM에서 돌려 생성된 적 목록(etype·좌표·배율·엘리트·`_isGateGuard`)과 난수 소비를 비교한다. start-mobs-test는 실맵 동작 확인으로 남긴다 | **Sonnet** (c01-field-oracle 틀과 같음) |
| O-8 | **생성 파일 재생성 일치 검사 + 낡은 손 기대 정리** | — | Tools: `gen-check`(신규), `Tests/Program.cs` · Core 소유: 없음 (생성 파일 8개는 읽기만) | 각 `gen-cs.cjs`를 커밋된 oracle 입력으로 다시 돌려 커밋본과 바이트 비교한다. CoreTests의 낡은 기대(`unimplemented item factory…`)는 지운다. 처치 보상 손 기대는 O-1 결과로 바꾸라는 TODO를 단다 | **Sonnet** (반복) |

- 병렬 배정: O-1·O-2·O-3·O-4·O-7·O-8은 서로 파일이 겹치지 않아 동시에 시작할 수 있다. O-6은 O-5의 트레이스 틀을 쓰므로 O-5 명세 뒤에 시작한다.
- O-4 결과 재export가 필요하다고 나온 oracle은 해당 시스템 담당 단위가 다시 돌린다. O-4는 목록만 낸다.
- M1 순서 권장: O-1 → O-2 → O-3 → O-5 (나머지는 병렬 보조).

## 5. 미확인

- shield-revive·rage-malice·level-exp·skill·save·hud·feedback·comparison oracle의 최근 검사 수는 문서에서 찾지 못했다. 실행 영수증(`runs/`)에만 있을 수 있다.
- 일반 원거리 몹(`_RANGED_ET`) 탄이 druid-boss-oracle 탄 루프 시나리오에 포함되는지 확인하지 않았다.
- 웹 흐름장이 실제 플레이에서 Worker 비동기 경로로 도는지, 동기 `_ffBuild`로 도는지는 O-2에서 판정한다.
- 이번 감사는 코드를 읽기만 했다. 어떤 도구도 다시 실행하지 않았다.
