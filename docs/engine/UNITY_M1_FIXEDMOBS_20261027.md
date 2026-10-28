# M1 고정 몹 — 1-1 시작 적·문지기·호위 (PC, 2026-10-27)

유니티 총괄 배정(C01 스폰 + C07 진행). 맵 총괄 C04 판정(`218b9ee28`)의 "시작 적 DIFF"(고정 적 3 + 보스방 호위 12~16 누락)를 닫는다. 1-1을 시작하면 소환굴이 깨기 전까지 몹이 0마리라 "80% 처치 + 문지기" 클리어 조건이 성립하지 않았다.

## 1. 웹 기준 (`origin/main:game.html`)

| 항목 | 웹 | 줄 |
|---|---|---|
| 다안 육괴 | `_spawnCh1StartMediumEyeMasses`: 시작 위치 + `_CH1_START_MEDIUM_SPAWNS` `{dx:-13,dy:-18}`, `{dx:13,dy:-21}` 타일에 etype 4, 속성 `EL.D`, `elite=0`·`mods=[]`·`aura=null`·`_firstShot=false` | 31701~31714 |
| 문지기 | 보스 게이트 아래 3칸 `(G._bossCx, G._gateY+3)`에 `[29,39,49,59,69,79,89][hell]`. `hp=~~(mhp*4)`, `atk=~~(atk*2)`, `r=~~(r*1.4)`, `poise=maxPoise=80`, `elite=3`, `_isGateGuard`, `dropTier=min(4,hell+2)` | 31800~31816 |
| 호위 엘리트 | `4+~~(rnd*3)`마리, 문지기 둘레 반지름 55px 원 위, `rollEtype`, `elite=1`, `hp=~~(mhp*2.5)` | 31817~31827 |
| 외곽 웨이브 | `8+~~(rnd*5)`마리, 반지름 `100+rnd*80`px 원 위, `rollEtype`·`rollEl` | 31828~31837 |
| 분모 | `G._totalSpawned` = 소환굴 몫 합(168). 고정 몹·문지기·호위는 **포함하지 않는다** (`mkEn` 직접 호출) | 60963 `_regionInit` |
| 처치 집계 | 모든 처치가 `G.kills++`, `G._stageKills++` (고정 몹 포함) | 34559 외 |
| 문지기 처치 | `e._isGateGuard` 사망 → `G._gateGuard=null`, `G._gateGuardKilled=true` (진행도 +10%) | 42945~42950 |
| 게이트 개방 | 지역 없는 맵 폴백: `_stageKills/_totalSpawned + (문지기 처치 0.10) >= 0.8` (Unity는 지역 분할이 없어 이 규칙을 쓴다) | 42078~42090 |

맵 총괄 oracle(`unity_1_1_dump.compare.md`)의 웹 좌표: etype 4 (87,167)·(113,164), etype 29 (100,8), 방 5 호위 12~16마리.

## 2. 구현

| 파일 | 내용 |
|---|---|
| `Core/Simulation.StartMobs.cs` (신규) | `SpawnStartEnemies()` — 시작 타일 기준 다안 육괴 2 + 문지기 + 호위 + 웨이브를 웹 순서·공식대로 배치. 분모(`Stage.TotalSpawned`)에 넣지 않는다. `StartMobLog`에 역할·etype·타일·px·HP를 남긴다. `HarnessKill`은 하니스 전용(실제 처치 경로 `KillEnemy`) |
| `Core/Simulation.EnemyBridge.cs` | `SpawnEnemy(..., double? el = null)` — 속성 인자 추가(기본값 동작 불변) |
| `Core/EnemyPools.cs` | `RollEl(si, random)` — `rollEl(si)` (`HELL_EL` 테마 속성 확률 + 6속성 균등) |
| `Core/SimulationState.cs` | `EnemyState.IsGateGuard` |
| `Core/StageFlow.cs` | `HasFieldGate`·`GateGuard`, `OnGateGuardKilled()` + `StageEventKind.GateGuardDefeated`(끝에 추가). `KillEnemy`가 문지기 사망 시 호출 → `GateGuardKilled=true`로 기존 80% 규칙의 +10%가 켜진다 |
| `Core/Simulation.cs` | `KillEnemy`에서 문지기 처치 훅 |
| `NativeGame.cs` | `ResetRun`에서 `EnableFieldSpawns()` 직후 `SpawnStartEnemies()` |
| `NativeGame.M1Check.cs` | 새 항목 `02b` — 시작 몹 수·위치·분모 로그 |
| `Tools/start-mobs-test/` (신규) | 실제 `ch1_map.json`으로 시작 몹 배치·80% 규칙·문지기 보너스·한 판 클리어를 검사하는 독립 .NET 테스트 |

문지기는 `Stage.HasFieldGate`(맵에 보스 게이트 타일 3이 있음) + 바닥 칸(`FloorTile`)일 때만 만든다. 1-1 외 스테이지는 `SpawnStartEnemies`가 아무것도 하지 않는다(소환굴 필드 스폰도 1-1 한정).

## 3. 검증

### 3.1 독립 .NET 테스트 (`Tools/start-mobs-test`, 실제 1-1 맵, 시드 12345)

시작 위치 (100,185), 소환굴 분모 168. 시작 시 살아 있는 몹 **14마리**:

| 역할 | etype | 타일 | px | HP | elite |
|---|---|---|---|---|---|
| 다안 육괴 | 4 | (87,167) | (3500,6700) | 875 | 0 |
| 다안 육괴 | 4 | (113,164) | (4540,6580) | 875 | 0 |
| 문지기 | 29 | (100,8) | (4020,340) | 3500 | 3 |
| 호위 엘리트 ×4 | 4·7·0·24 | (101,8)·(100,9)·(99,8)·(100,7) | — | 2187 | 1 |
| 외곽 웨이브 ×7 | 25·7·4·6·26·1·4 | (103,8)·(102,10)·(100,12)·(98,10)·(97,8)·(97,5)·(103,5) | — | 875 | 0 |

웹 좌표와 타일 단위로 일치(등록된 웹 값 (87,167)·(113,164)·(100,8)). 방 5(문지기+호위+웨이브) = 12마리 = 웹 범위 12~16의 하한.

클리어 규칙 로그:

- 문지기 생존, 134/168 처치(79.8%) → 봉인 유지, 135/168(80.4%) → 개방.
- 문지기 처치 후 117/168(69.6%+10%) → 봉인 유지, 118/168(70.2%+10% = 80.2%) → 개방.
- 한 판: 문지기 처치(tick 140) → 118/168에서 게이트 개방 → 출구 타일 → 아레나 입장·보스 배치 → 보스 처치 → 아레나 출구 개방 → 출구 밟기 → 스테이지 클리어(+10 SP).

결과: **24 checks / 0 failures**.

### 3.2 회귀

| 검증 | 결과 | 비고 |
|---|---|---|
| dash-parry-oracle | 187,165 checks / 0 failures | 불일치 0 유지 |
| skill-sim-test | 67 checks / 0 failures | |
| enemy-pool-oracle | 26,271 checks / 0 failures | `RollEl` 추가는 `RollEtype` 소비 순서에 영향 없음 |
| c01-field-oracle | 448 checks / 0 failures | |
| enemy-spawn-oracle | 205,123 checks / 531 failures | **베이스(`origin/unity/main`)에서도 동일 531건** — 이번 변경 무관 |
| stage-flow-oracle | 1 failure (`extension: non-boss etype 77 still throws`) | 베이스에서도 동일 1건 — 이번 변경 무관. `*.csproj`가 `.gitignore`라 저장소에는 `StageFlowTests.csproj`가 없다(다른 worktree에서 복사, `Core/Skills/*.cs` 포함 필요) |

### 3.3 Unity 6000.6.7f1 빌드·m1-check

빌드 Succeeded, errors 0 (StandaloneWindows64, headless·음소거). `EXODUSER-Unity.exe -batchmode --unity-m1-check`.

## 4. 실행 결과 (Unity)

- **새 항목 `02b` ok**: 새 캐릭터 1-1 진입 직후 16마리 생존 — 다안 육괴 2 + 문지기 1 + 호위 5 + 웨이브 8, 분모 168(고정 몹 미포함). 위치: 다안 육괴 (87,167)·(113,164), 문지기 etype 29 (100,8) HP 3500 elite 3, 호위 (101,8)·(100,9)·(99,9)·(99,7)·(100,7). 웹 좌표와 일치.
- m1-check 전체 **16 ok / 2 not ok**(`12` 보스 처치·침몰, `13` 스테이지 클리어). 12/13은 `-batchmode`에서 베이스(`origin/unity/main`)도 같은 실패(B07b 보고 참조, 원인 미규명). 이번 변경 이전부터 있던 항목.
- **첫 실행에서 `07b`(적 공격)·`08`(드롭 장착)이 실패**했다. 둘 다 고정 시드 난수열에 민감한 항목이라, 시작 몹 배치가 난수를 소비해 이후 첫 전투·드롭 롤이 달라진 것이 원인으로 판단했다(고친 뒤 통과로 확인). 조치: `SpawnStartEnemies`가 실행 후 `randomState`를 되돌린다(첫 전투·드롭 롤이 시작 몹 배치에 좌우되지 않게). 고친 뒤 빌드·m1-check 1회 재실행 → 07b·08 통과.

## 4b. m1-check 12·13 판정과 수정 (유니티·맵 총괄 지적, 2026-10-28)

결론: **고정 몹(문지기)이 만든 회귀가 아니다. 보스 바 `Active`가 OnGUI에서만 풀리는 표현 쪽 기존 결함이었고, 이를 상태 판정으로 옮겨 batchmode에서도 18/18 ok가 되게 고쳤다.**

### 4b.1 문지기가 보스 바를 켜는가 — 아니오

- 웹: 보스 바는 `G._bossRef`(진짜 보스, `35997`)가 있을 때만 켜지고(`36013~36015`) 문지기는 `_bossRef`가 아니다. 웹에서 문지기에게 보스형 바는 뜨지 않는다.
- Unity: `StageFlowBossBar`(`NativeGame.StageFlow.cs:79`)는 `flow.InArena && (LoadPhase 0|4)` 안에서 `FindBoss()`(= `IsBoss`)만 바에 올린다. 문지기는 `IsBoss=false`이고 필드(`InArena=false`)에 있어 바가 켜질 수 없다.
- 12단계에서 바를 켜는 것은 아레나 드루이드이고, 처치 뒤 `Hide()`가 `hiding=true`로 두면 `active=false`는 `Draw()`(OnGUI)에서만 내려갔다.

### 4b.2 베이스도 batchmode에서는 실패했다

| 실행 | 방식 | 결과 |
|---|---|---|
| rm0 빌드 `_out/b07b/m1base` (문지기 없음, 10-27 18:57) | `-batchmode` | 17단계 중 **12·13 fail** ("exit tiles opened (FAILED)") |
| `_out/rmb1` (b280ddf61 + RM-B1) | 창 모드: `--unity-m1-check -popupwindow`, 보조 모니터 (5120,0) 1920x1080 (`run-rmb1-m1.ps1`) | 17/17 ok |
| 같은 rmb1 빌드 재실행 | 같은 창 모드 | 17/17 ok — 12단계 276 lethal hit, 13단계 kills 18/15, clear 80s |
| 고정 몹 빌드(수정 전) | `-batchmode` | 12·13 fail — 같은 276 hit, 18/15, 80s |

즉 "베이스가 batchmode에서 17/17"이라는 관측은 창 모드 실행(`rmb1` 스크립트)이었다. batchmode의 베이스는 처음부터 12·13이 실패했다.

### 4b.3 수정

`NativeBossBar.Active`가 숨김 페이드 완료를 직접 판정한다(`ResolveHide()`: `active && hiding && Alpha()<=.001`). `Draw()`의 같은 조건은 그대로 두어 OnGUI에서도 동일하게 풀린다. 12단계 조건(`!bossBar.Active`)은 바꾸지 않았다. 그래픽이 없어도 같은 값이 나온다.

### 4b.4 검증 (e3b522b58 병합 후, Unity 6000.6.7f1, 빌드 errors 0)

| 실행 | 결과 | 결과 파일 |
|---|---|---|
| `-batchmode -nographics --unity-m1-check` | **18/18 ok** (12 "exit tiles opened (verified)", 13 ok) | `E:/exoduser-wt/_out/fixedmobs/m1-batch/m1-check.json`, 로그 `m1-batch.log` |
| 창 모드 (`run-fixedmobs-m1.ps1`) | **18/18 ok** | `E:/exoduser-wt/_out/fixedmobs/m1-window/m1-check.json` |

시작 몹 16마리는 처치 수(18/15)에 영향이 없다 — 10단계 앞의 `sim.Enemies.Clear()`가 필드를 비운다.

## 5. 미이식·차이

| 항목 | 사유 |
|---|---|
| 지역(4분면) 클리어 규칙 | 2026-10-28 M1-REGION R-A에서 이식했다(`docs/engine/UNITY_M1_REGION_RA_20261028.md`). 이 문서의 클리어 로그(전역 80% + 문지기 10%)는 지역 없는 맵의 폴백 규칙 기준이다 |
| 문지기 처치 연출("⚔ 문지기 처치!"), 게이트 개방 타일 갱신(`bossGateOpen`) | 뷰·텍스트 소관. 이벤트(`GateGuardDefeated`)만 발생시킨다. 텍스트를 추가하면 번역 목록 등록이 필요해 이번엔 넣지 않음 |
| 문지기 드롭 티어 | `dropTier`를 웹 객체에 설정하지만 Unity `RollNormalEquipment`는 스테이지 기준 티어만 읽는다 |
| 호위·웨이브가 벽 위로 떨어질 때 | 웹과 같이 `canMv` 실패 위치는 건너뛴다(웨이브가 8~12보다 적게 나올 수 있음) |
| `Math.random` 순서 | 웹 RNG와 호출 순서만 맞췄고, 시드 일치 검증은 하지 않았다(웹 난수는 재현 불가) |
