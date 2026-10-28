# M1-REGION R-A — 1-1 지역 4분할 클리어 규칙 (PC, 2026-10-28)

명세: `E:/exoduser-wt/_out/m1-region/SPEC.md` R-A (맵 총괄). 웹 원본 = `origin/main` `game.html` 커밋본(10-28, 65,958줄). 앵글러(R-B)는 이 단위에 섞지 않는다. R-A 동안 `StageFlow.FieldBossDone = true`(앵글러 없음).

## 1. 웹 기준 → Unity

| 항목 | 웹 (줄) | Unity |
|---|---|---|
| 켜는 조건 | `_regionInit` 60963: `G.mw<180 \|\| G.mh<180`이면 지역 없음 → 전역 80% 폴백 유지 | `Simulation.InitRegions()`: `MapTilesWide < 180 \|\| MapTilesHigh < 180`이면 `Regions = null` |
| 분할 | midX=mw/2, midY=mh/2, idx=(y/T<midY?0:2)+(x/T<midX?0:1) (0 북서·1 북동·2 남서·3 남동) | `RegionIdxAt(x,y)` (픽셀, T=40) |
| 지역 total | 소환굴마다 `_spawnHoleCount(size, si)`를 굴 좌표의 지역에 더함 (si=0: S 8 / M·L 15) | `SpawnHoles.Holes`를 `EnemyPools.SpawnHoleCount`로 합산 |
| 처치 귀속 | `_regKill` 60994: `e.ib` 제외, **스폰 위치** `_homeX/_homeY`(없으면 `e.x/e.y`)의 지역 kills+1 | `Simulation.RegKill` — `KillEnemy`가 `Kills++` 옆에서 호출. `EnemyState.HomeX/HomeY/HasHome`(SpawnEnemy가 `web._homeX/_homeY`를 복사) |
| 문지기 보너스 | `_regionRatio` 60991: `_gateGuardKilled && i===_regGateIdx`이면 +0.10. `_regGateIdx`는 문지기 스폰 지역(없으면 `_bossCx+.5`, `_gateY+.5`) | `RegionRatio`, `RegGateIdx`(`Stage.GateGuard` 위치 → 게이트 좌표 → midX/0) |
| 비율 | total>0이면 kills/total+보너스, 아니면 1 | 같음 (kills>total도 허용) |
| 클리어 판정 | `_regionCheckClears` 61032: 비율 ≥ 0.8−1e-9 이고 앵글러 사망이면 `cleared=true`, 다시 끄지 않음 | `RegionCheckClears` (`RegionClearRatio = 0.8`, `1e-9`) |
| 주기·정지 | `_regionTick` 61045: `_gameFrame%15`, `!G.on \|\| G._bossArena \|\| G._bossLoadPhase>0`이면 정지 | `TickRegions` (`TickCount % 15`, `Stage.Enabled`/`InArena`/`LoadPhase`), `Simulation.Tick`에서 `Stage.Tick()` 직전 호출 |
| 빈 지역 | 초기화 때 total≤0이고 앵글러 없으면 즉시 cleared | `InitRegions` 끝 |
| 앵글러(R-A) | `_regionFbAlive`: `G._fbDone`이면 죽음 | `RegionFbAlive`: `FieldBossDone`이면 false (R-B에서 실제 앵글러로 대체) |
| 지옥문 개방 | 42072~42080: `G._regions`가 있으면 `krakenOk && 클리어 지역 ≥4` 일 때만. 전역 80%는 폴백 | `StageFlow.CheckRooms`: `sim.Regions != null`이면 같은 조건 (30프레임 블록), 아니면 기존 폴백 |
| 봉인 문구 | 42106: "지옥문이 봉인됨 — 지역 클리어 N/4" | `GateSealed` 이벤트의 `Regions=true`, `Percent=N` → `NativeGame.StageFlow.cs`가 웹 원문을 그대로 표시 |
| 진행바 | 60602: 지역 있으면 클리어 N/4 ×100% | `NativeGame.FieldHud.cs`: `Regions != null ? 클리어/4 : 기존` |

기대값(실제 `ch1_map.json` 소환굴 14개): **북서 23 / 북동 60 / 남서 53 / 남동 32 = 168**, 문지기 (100,8) → 북동(idx 1).
호출 위치: `NativeGame.ResetRun`이 `EnableFieldSpawns → SpawnStartEnemies → InitRegions` 순서로 부른다(웹도 문지기 스폰 뒤에 `_regionInit`).

## 2. 변경 파일

| 파일 | 내용 |
|---|---|
| `Core/Simulation.Regions.cs` (신규) | `RegionState`, `InitRegions`, `RegionIdxAt`, `RegionRatio`, `RegionClearedCount`, `RegKill`, `RegionCheckClears`, `TickRegions`, `RegionFbAlive` |
| `Core/StageFlow.cs` | 지옥문 개방·봉인 이벤트의 지역 분기, `StageEventKind.RegionCleared`(끝에 추가), `StageEvent.Regions`, `RaiseRegionCleared` |
| `Core/Simulation.cs` | `KillEnemy`에서 `RegKill`, `Tick`에서 `TickRegions` |
| `Core/Simulation.EnemyBridge.cs`, `Core/SimulationState.cs` | 스폰 위치(`HomeX/HomeY/HasHome`) 보관 |
| `NativeGame.cs`, `NativeGame.StageFlow.cs`, `NativeGame.FieldHud.cs` | `InitRegions` 호출, 봉인 문구, 진행바 |
| `Tools/region-oracle/` (신규) | 웹 원본 함수를 Node VM에서 실행한 oracle과 C# 대조 |
| `Tools/region-test/` (신규) | 실제 `ch1_map.json`으로 totals·경계·문지기 보너스·3/4→4/4·한 판 |

## 3. 검증

### 3.1 웹 oracle (`Tools/region-oracle`, 원본 `origin/main` game.html)

원본 `_spawnHoleCount`·`_regionInit`·`_regKill`·`_regionRatio`·`_regionClearedCount`·`_regionFbAlive`·`_regionCheckClears`·`_regionTick`과 checkRooms의 지옥문 개방 블록(지역 있음)을 Node VM에서 그대로 실행한다(기대값을 손으로 쓰지 않음, 줄 블록 sha256 기록).

| 섹션 | 내용 | checks |
|---|---|---|
| holeCount | 크기 12종 × si 5종 | 60 |
| init | 무작위 400개 맵(200×200, 180×180, 179×200, 200×179, 100×100, 250×300 …)·소환굴 0~30개(분할선 위 포함)·문지기 유무·게이트 유무·앵글러 플래그 | 4,633 |
| sequence | 300개 시나리오: 처치(스폰 위치≠사망 위치, 위치 없음, 보스, 문지기), 대량 처치, 정지 플래그(`on`/아레나/로딩), 15프레임 주기 진행. 연산마다 total·kills·cleared·fbIdx·비율·클리어 수 비교 | 198,306 |
| unlock | 스테이지 3 × 앵글러 2 × 클리어 마스크 16 × 아레나 2 × 보스 생존 2 × 이미 개방 2 | 1,152 |

결과: **204,151 checks / 0 failures** (`_out/fixedmobs/region-oracle/green.json`).
민감도: ① 문지기 보너스를 모든 지역에 주면 6,542건 실패, ② 판정 주기를 16으로 바꾸면 12건 실패(둘 다 되돌림).

### 3.2 실제 1-1 맵 테스트 (`Tools/region-test`)

**55 checks / 0 failures**.

| 항목 | 결과 |
|---|---|
| 지역 total | 북서 23 / 북동 60 / 남서 53 / 남동 32, 합 168 = 소환굴 합계 |
| 경계 | 북서 18/23 미클리어 → 19/23 클리어 · 북동 47/60 → 48/60 · 남서 42/53 → 43/53 · 남동 25/32 → 26/32 (80% 직전·직후, 다음 15프레임 판정에서 켜짐) |
| 귀속 | 사망 위치를 분할선 위로 옮긴 처치도 태어난 지역에 집계 |
| 문지기 보너스 | 문지기 (100,8)은 북동. 문지기 처치 뒤 북동만 +0.10, 나머지 세 지역 비율은 kills/total 그대로. 북동은 문지기 포함 42/60 + 0.10 에서 클리어(0.7+0.1 부동소수 보정), 41/60 은 미클리어 |
| 3/4 → 4/4 | 3개 클리어 상태에서 100틱 동안 봉인 유지, 봉인 이벤트 N=3. 4번째(북동) 클리어 → 30프레임 블록에서 개방 |
| 보스 | 아레나의 보스는 어느 지역 kills에도 들어가지 않음 |

### 3.3 한 판 로그 (실제 1-1 맵, .NET)

```
run start:       NW 0/23  NE 0/60  SW 0/53  SE 0/32
after 3 regions: NW 19/23 (0.826, cleared@45)  NE 0/60  SW 43/53 (0.811, cleared@30)  SE 26/32 (0.813, cleared@15)
northeast:       guard died at tick 145, cleared at tick 150 (42/60 + 0.10)
gate opened at tick 150 -> arena -> boss killed -> exit -> StageCleared at tick 820 (+10 SP, clear time 11 s)
```

### 3.4 회귀 (베이스 `32f374bda`와 같은 수)

| 검증 | 결과 |
|---|---|
| dash-parry-oracle | 187,165 checks / 0 failures |
| skill-sim-test | 67 / 0 |
| enemy-pool-oracle | 26,271 / 0 |
| c01-field-oracle | 448 / 0 |
| Tools/start-mobs-test (지역 없는 폴백 경로) | 24 / 0 |
| enemy-spawn-oracle | 205,123 checks / 531 failures — 베이스와 동일 |
| stage-flow-oracle | 7,076 checks / 1 failure(`extension: non-boss etype 77 still throws`) — 베이스와 동일 |

### 3.5 Unity 6000.6.7f1 (빌드·m1-check)

(아래 §4)

## 4. 실행 결과 (Unity)

빌드: StandaloneWindows64, Unity 6000.6.7f1, **Succeeded, errors 0** (`E:/exoduser-wt/_out/fixedmobs/build-receipt5.json`).

| m1-check 실행 방식 | 결과 | 결과 파일 |
|---|---|---|
| `-batchmode -nographics` | **18/18 ok** | `E:/exoduser-wt/_out/fixedmobs/m1-region-batch/m1-check.json` (로그 `m1-region-batch.log`) |
| 창 모드 (`run-fixedmobs-m1.ps1`, 보조 모니터 5120,0 1920x1080) | **18/18 ok** | `E:/exoduser-wt/_out/fixedmobs/m1-region-window/m1-check.json` |

- 02b(시작 몹 16마리, 분모 168) ok. 07c(소환굴 필드 스폰) ok.
- **10단계 시나리오는 고치지 않았다.** 10단계는 필드 7,000px를 걷지 않고 `flow.ForceUnlock()`으로 게이트를 연다. 이 단계의 메모가 "gate still sealed at 17/15 kills: forced open by the harness"로 나온다. 이전 전역 80% 규칙이었다면 17/15 로 자연 개방이었지만, 지역 규칙에서는 손으로 만든 처치가 네 지역 80%를 채우지 못해 봉인이 유지된다. 이것이 웹 규칙이다(전역 처치 수로는 열리지 않음). 자연 개방 경로(4/4 → 개방 → 아레나 → 클리어)는 `Tools/region-test`와 region-oracle이 실제 맵·원본 함수로 덮는다.

2026-10-28 LT-10 후속: 위 문장은 당시 하네스 이력이다. 현재 M1의 `09c`는 실제 `RegKill` 처치 경로로 네 지역 80%를 채우고 실제 앵글러 피격·사망 경로로 네 마리를 없앤 뒤 `Stage.CheckRooms`의 자연 개방을 요구한다. `FieldBossDone=true`와 `ForceUnlock()` 직접 설정을 제거했다. 분모를 0으로 만들던 07c 이후의 `18/15`는 하네스의 임시 소환 수치였으므로 09c에서 실제 14굴 계획 합계 168로 복원한다. 최종 Unity 영수증은 `UNITY_LT10_LT11_20261028.md`를 따른다.

## 5. 웹과 다르게 한 점 / 미이식

| 항목 | 내용 |
|---|---|
| 판정 주기의 프레임 | 웹은 `_gameFrame%15`, Unity는 `Simulation.TickCount % 15`(Tick 시작에서 증가한 값). 두 카운터가 같은 프레임 번호라는 가정 — oracle은 같은 프레임 번호를 두 쪽에 넣어 비교했다 |
| 지역 입장 배너·방향 화살표·클리어 배너·펫 대사 | 스펙상 이번 범위 밖(UI 담당). `RegionCleared` 이벤트만 발생시킨다 |
| 게임 내 "▼ 지옥문 봉인 (지역 N/4) ▼" 월드 라벨(웹 52271) | Unity에는 게이트 라벨 자체가 없어 이번 범위에서 만들지 않았다. 봉인 문구(출구를 밟았을 때)와 진행바는 이식 |
| `EnemyTick`의 벽 끼임 정리 사망(`EnemyTick.cs:87`) | Unity는 이 경로의 `Kills`도 올리지 않는다(기존). 지역 `RegKill` 콜백도 연결하지 않아 둘이 일치한다 |
| 되살아난 구울 등 Core가 만들지 않은 적 | 스폰 위치 정보가 없어 웹의 `_homeX == null` 분기처럼 사망 위치로 귀속한다 |
| 게임에 표시되는 새 문구 | 웹 원문 그대로(`지옥문이 봉인됨 — 지역 클리어 N/4` 등). 번역 목록 `REGION-1`(No.3073~3087)에 이미 등록된 문구라 추가 등록 없음 |
