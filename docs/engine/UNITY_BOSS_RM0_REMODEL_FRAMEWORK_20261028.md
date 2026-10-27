# RM-B0 — 보스 리메이크 공통 실행 틀 (2026-10-28)

명세·검수: 보스전 총괄. 구현: PC Opus 세션(RM-B0). 지시서: `E:/exoduser-wt/_out/rmb-ch1/RMB0_BRIEF.md`.
브랜치 `claude/unity-pc-rmb0-20261028`(시작 `origin/unity/main` = `7aea256aa`). 커밋 `402bb6ff4`(틀) → `cac9c1c89`(훅 보완). unity/main 병합은 유니티 총괄이 한다.

## 0. 한 줄

RM-B1 드루이드 전용이던 리모델 구조를 **"스테이지별 기술 세트(데이터) + 보스별 partial 파일(전용 규칙)"**로 일반화했다. 새 보스의 Core 구현은 **자기 파일을 추가하고 슬롯 하나를 채우는 것만으로** 진행한다. 드루이드 파일은 데이터 참조를 세트 경유로 바꾼 기계적 치환만 했고, 플래그를 끈 동작은 하나도 바뀌지 않았다(oracle 0불일치).

## 1. 구조

| 층 | 파일 | 하는 일 |
|---|---|---|
| 세트(데이터) | `Core/BossRemodel.cs` — `BossRemodelSet` | 목숨 수, 목숨별 HP 비율·몸 크기·쉴드 비율, 쓰러짐 틱, `Moves`·`Combos`·`Phases`(목숨 = 페이즈), `Parryable`·`Instant`·`Forced`, 공용 실행기 리모델 변형 수치(`SlamRadius`·`PoisonTrailTicks`·`ChaseZone*`·`SummonMax`), 드루이드 규칙 스위치 4개, `Hooks`, `Validate()` |
| 보스 규칙(훅) | `Core/BossRemodel.cs` — `BossRemodelHooks` | AI 쪽 4개(`ForcePick`·`StartMove`·`TickState`·`Telegraphs`), 목숨 쪽 5개(`OnAttach`·`OnCollapse`·`CollapseTick`·`OnLife`·`OnFinal`). 전부 선택, null = 아무 일 없음 |
| 스테이지 슬롯 | `Core/BossRemodel.cs` — `BossRemodelSets.Build()` | si → 세트. 게임 데이터는 **si0·si3 = 드루이드 세트뿐**. si1·si2·si3 교체는 `static partial void Stage1/2/3(...)` 슬롯을 보스 파일이 채운다(빈 슬롯은 컴파일에서 사라짐). 등록 시 `Validate()` 실패면 예외 |
| 드루이드 세트 | `Core/DruidRemodelData.cs` — `DruidRemodelData.Set` | 첫 인스턴스. 기존 상수·표를 그대로 묶음(값 복사 없음, 같은 배열 참조). 수치를 바꿀 때는 지금처럼 `DruidRemodelData.cs` 상수만 고친다 |
| AI 엔진 | `Core/DruidBoss*.cs` + `Core/DruidBoss.RemodelSet.cs` | oracle 검증된 점수·콤보·페인트·쿨다운 엔진과 23개 실행기. `DruidBoss.Set`에서 표를 읽는다. 새 파일에 `RmGrab`·`RmForcedPick`·`RmStartForced`·훅 호출부 |
| 목숨·연결 | `Core/Simulation.DruidRemodel.cs` + `Core/Simulation.BossRemodel.cs` | 목숨 전환(쓰러짐·다음 목숨·마지막 처치)을 세트 값으로. 플래그·`RemodelSets`·스포너 등록 |

### 1.1 드루이드 규칙 (드루이드 세트에서만 켜짐)

| 스위치 | 규칙 | 꺼진 세트에서 |
|---|---|---|
| `Heartbeat` | 12번 심장 박동 강제 발동(P3 진입 1회, 이후 40초) | `heartbeat` 기술을 세트에 넣을 수 없음(`Validate` 거부) |
| `GrabAbsorb` | 잡기 120틱 유지·HP 3% 흡수·3타로 벗어남 | `grab` = 웹 잡기(60틱) |
| `RootBonus` | 쓰러짐 중 뿌리 3타 → 다음 목숨 −10%p, 한 판 1회 | 쓰러짐 중 타격은 삼켜지기만 함(`rootCut` 이벤트 없음) |
| `Sink` | 마지막 쓰러짐 = `SinkDruid`(STY-D9 침강), 이벤트 메모 `sink` | 일반 처치, 메모 `kill` |

숫자(박동 쿨 2400·잡기 120틱 등)는 드루이드 상수 그대로다. 1-4처럼 박동을 바꾸는 보스는 아래 §2의 훅(자기 상태로 덮어쓰기)으로 만든다.

### 1.2 공용 실행기를 쓸 때 알아 둘 것

- 리모델을 켜면 23개 실행기는 **리모델 변형**으로 돈다(난타 3타·3타 패링 불가, 균열 직선 1줄, 해일 고리 1개·틈 1개, 추적지뢰 3개, 소환 동시 `SummonMax`, `Instant` 기술 앞 `bossRmWind` 예고, 콤보당 페인트 1회, HP 페이즈 판정·대기 탄·리듬탄·오브 없음). 수치는 세트 필드로 바꾼다.
- 공용 id의 동작을 바꾸려면 `StartMove`/`TickState` 훅에서 그 id·상태를 받아 `true`를 돌려준다(공용 실행기보다 먼저 불린다). `false`면 공용 실행기가 돈다.
- **드루이드 무대 분기**(`DruidStage` = si0·si3)는 무대 번호로 켜지므로 si1·si2 보스에는 없다: 돌진 직전 조준 고정, 근접 3연속 뒤 원거리·기습 점수 ×3, 보스 탄의 드루이드 독탄화, 장판 독 부여. 필요하면 자기 기술로 만든다.
- `BossMove.Idx`는 쿨다운 칸 번호다. **0~58**(`DruidBossData.MoveSlots` = 59) 안에서 세트 안에서만 겹치지 않으면 된다(다른 보스 세트와는 겹쳐도 됨).

## 2. 새 보스 추가 절차 (파일 체크리스트)

예: 1-2 독버섯 거인(si1). 드루이드 파일·Codex 소유 파일(Simulation.cs, SimulationState.cs, NativeGame*, NativeHud*)은 건드리지 않는다.

1. **`Core/MushroomGiantRemodelData.cs`** (+ `.meta`) — 데이터와 슬롯
   ```csharp
   public static class MushroomGiantRemodelData {
       public const string SetId = "mushroomGiant";
       public static readonly BossRemodelSet Set = Make();
       static BossRemodelSet Make() {
           var s = new BossRemodelSet { Id = SetId, Lives = 2, LifeHpFraction = new[] { 1.0, 0.55 }, BodyScale = new[] { 1.2, 1.08 }, ShieldFraction = new[] { 0, 0.0 },
               CollapseTicks = 120, Moves = new[] { BossRemodelSet.Move("slam", 14, ...), BossRemodelSet.Move("mgSow", 41, ...), ... },
               Combos = ..., Phases = new[] { BossRemodelSet.PhaseDef("P1", ...), BossRemodelSet.PhaseDef("P2", ...) }, Parryable = ..., Instant = ..., Forced = { "mgHarvest" } };
           DruidBoss.MushroomGiantHooks(s.Hooks);      // AI 훅 연결 (2번 파일)
           s.Hooks.OnCollapse = ...; s.Hooks.OnLife = ...;   // 목숨 훅 (3번 파일, 필요할 때)
           return s;
       }
   }
   public static partial class BossRemodelSets { static partial void Stage1(Dictionary<int, BossRemodelSet> m) { m[1] = MushroomGiantRemodelData.Set; } }
   ```
2. **`Core/DruidBoss.MushroomGiant.cs`** (+ `.meta`) — `public sealed partial class DruidBoss` 안의 static 메서드로 AI 훅을 둔다(같은 클래스라 `StartPattern`·`PlayerHit`·`Parry`·`Tele`·`RmStartForced`·`host`를 쓸 수 있다). 보스별 상태값은 `public sealed partial class DruidData`에 필드를 더한다(이름 앞에 보스 접두어, 예 `MgSprouts`).
   - `StartMove` — 새 기술 id(또는 **덮어쓸 공용 id**)면 `d.S`(자기 상태 이름, 접두어 `rmMg...`)·`d.St2`를 정하고 `true`. `false`면 공용 실행기가 돈다.
   - `TickState` — 자기 상태면 처리하고 `true`(끝낼 때 `"recover"`·`"bossRec"`·`"idle"`로). 아니면 `false`.
   - `ForcePick` — 점수 추첨 밖의 예약 발동(RM2 "씨 뿌리기 끝 360f 뒤 반드시 수확"). `RmStartForced(e, d, "mgHarvest", dist)`로 시작한다. 이런 기술은 세트 `Forced`에 넣는다(점수에서 빠짐).
   - `Telegraphs` — 자기 상태의 예고 항목을 `Tele(into, id, kind, shape, total, remaining, index)`로 더한다(§4).
3. **`Core/Simulation.MushroomGiantRemodel.cs`** (필요할 때만) — 목숨 훅. `OnCollapse`(쓰러짐 시작), `CollapseTick`(쓰러짐 매 틱: RM3처럼 몸을 둥지로 옮기기 — `e.X`/`e.Y`, `sim.CanMove`), `OnLife`(다음 목숨: 싹 흡수로 쉴드 등 — `e.Shield`/`e.MaxShield`), `OnFinal`(마지막 처치 직전). 처치·보상·출구 개방은 공용 경로(`KillEnemy` → StageFlow)가 한다.
4. **하니스** — `unity/Tools/<boss>-remodel-test/` 또는 `druid-remodel-test`에 검사 파일 추가. 최소: 플래그 켠 실제 Simulation 한 판(생성 → 목숨 전환 → 처치 → 출구), 목숨별 허용 기술 밖 0, 예고 `Move` 번호 = 세트 행, 플래그 끈 해당 si 무변화, 드루이드 oracle·druid-remodel-test 그대로.
5. **문서** — 보스 명세 문서(RM2/RM3/RM4)에 구현 기록, 이 문서 §6 표에 한 줄.

`.meta`는 새 GUID로 직접 만든다(`fileFormatVersion: 2` + `guid: <32 hex>`). 다른 보스와 겹치는 파일은 `BossRemodel.cs`의 슬롯 선언뿐인데, si1·si2·si3 슬롯은 이미 선언돼 있어 고칠 일이 없다(2장 이후 보스는 슬롯 한 줄 추가).

## 3. 플래그

| 플래그 | 범위 | 기본 |
|---|---|---|
| `Simulation.BossRemodel` (`BossRemodelSettings.Default`) | 등록된 모든 세트 | 꺼짐 |
| `Simulation.RemodelBosses` (HashSet, 세트 `Id`) | 보스별 | 비어 있음 |
| `Simulation.DruidRemodel` (`DruidRemodelSettings.Default`, 기존 그대로) | si0·si3(드루이드 무대). 1-4 세트가 바뀌어도 이 플래그로 켜진다 | 꺼짐 |

- 켜짐 = 그 si에 세트가 등록돼 있고 위 셋 중 하나가 참. `Simulation.RemodelSetFor(si)`가 판정한다.
- si0·si3은 지금처럼 항상 `SpawnDruid` 스포너가 있다. **다른 si는 리메이크가 켜졌을 때만** `Stage.BossSpawners[si] = SpawnDruid`가 등록된다 → 꺼진 si1·si2는 지금처럼 보스 Core가 없다(출구에서 `BossCoreMissing`).
- 보스는 같은 `EnemyFactory.Create(..., si, 0, true, ...)`(mkEn) 경로로 만들어지고 `DruidBoss`가 `Set`을 받아 리메이크 AI로, `Simulation.DruidRemodel`이 목숨으로 돌린다.
- 플래그는 `AttachDruidBoss()` 전에 정한다. 뒤에 바꾸면 `RefreshRemodelSpawners()`.
- 하니스는 `sim.RemodelSets[si] = 세트`를 `AttachDruidBoss()` 전에 넣어 **게임 데이터에 등록하지 않고** 시험한다.

## 4. 예고 목록 API 규칙

- 호출은 그대로 `Simulation.DruidTelegraphs(list)`(별칭 `RemodelTelegraphs`). 매 틱 `Tick` 뒤 1회, 읽기 전용, 플래그 끄면 빈 목록.
- `DruidTelegraph.Move` = **현재 세트 `Moves`의 행 번호(1부터)**, `MoveId` = `Set.Moves[Move-1].Id`. 드루이드는 RM-B1 §3 표 1~12 그대로(출력 바이트 동일 확인). `Set.MoveNo(id)`.
- 종류(`DruidTeleKind`: 패링 반짝·바닥 표시·잡기 눈)와 모양(`DruidTeleShape`: 원·부채꼴·선·틈 고리·안전지대 뺀 전장·자취)은 모든 보스 공용이다. 새 모양이 필요하면 보스전 총괄과 정한 뒤 enum에 끝번호로 추가한다(기존 번호 불변).
- 공용 실행기의 예고는 상태 이름 기준으로 자동으로 나온다. 보스 자기 상태의 예고는 `Hooks.Telegraphs`가 공용 항목 **뒤에** 붙인다. `Serial`은 기술 시작마다 1씩 오르는 공용 값(`TeleSerial`)을 쓰고, `Total`/`Remaining`은 판정까지 남은 틱(첫 예고 틱의 `St2`는 `d.RmTeleTotal`에 있다).
- 타입 이름의 `Druid` 접두어는 바꾸지 않는다(RB1-3·4 동시 작업과 충돌 방지). 모든 리메이크 보스의 공용 API로 쓴다.

## 5. 검사 결과 (2026-10-28, 산출물 `E:/exoduser-wt/_out/rmb0/`)

| 검사 | 결과 | 비고 |
|---|---|---|
| `druid-boss-oracle --rev origin/main --cases 48` (플래그 끔) | **5,421,635검사 0불일치** | 틀 커밋 뒤·훅 보완 뒤 각 1회 (`oracle/`, `oracle2/`) |
| `druid-remodel-test` 드루이드 부분 | **41,195검사 0실패** | 수정 전(`7aea256aa` 소스 빌드)과 `remodel-fight-A/B.json`·`remodel-telegraphs.json`·보고서 **바이트 동일** |
| `druid-remodel-test` RM-B0 부분(`FrameworkChecks.cs`, 별도 줄 `remodel-frame`) | **105검사 0실패** | 아래 표 |
| `parry-reflect-test` | **26검사 0실패** | 보고서 수정 전과 바이트 동일 |
| `m1-check` (Unity 6000.6.7f1, `-batchmode -nographics`) | **미실행** §5.1 | 전 기준: 같은 Core의 `parry-reflect` 빌드 18/18 ok |

견본 세트(테스트 프로젝트 안에만 있음, `BossRemodelSets` 미등록):

| 견본 | 내용 | 확인한 것 |
|---|---|---|
| FW-A si1 `sampleSi1` | 기존 실행기 3개(`slashCombo`·`charge`·`slam`), 목숨 2(HP 1.0/0.5, 몸 1.0/0.8, 쉴드 0/0.1), 쓰러짐 90틱, 보스별 플래그 | 같은 mkEn 경로로 생성 → 쓰러짐(90틱, HP 1 고정, 뿌리 보상 없음) → 목숨 2(HP·몸·쉴드 값) → 처치(침강 없음, 메모 `kill`) → `BossAlive=false`·출구 열림. 목숨 훅 4종 각 1회, `CollapseTick` 90회. 목숨별 허용 기술 밖 0, 3기술 모두 사용, `slam`은 목숨 2에서만. 예고 `Move` = 세트 행 |
| FW-B si2 `sampleSi2` | 자기 기술 `sampleRing`(StartMove·TickState·Telegraphs·ForcePick 훅, 테스트 안 partial `DruidBoss`) + `charge`, 목숨 1, 공통 플래그 | 첫 기술 = 강제 발동 `sampleRing`, 자기 기술 시작 8·발동 7, 자기 예고(Move 1) 출력, 처치·출구 |
| 끔 si1·si2 | 세트를 넣고 플래그 끔 | 스포너 없음, 출구에서 아레나 로드 시작 없음(지금 동작). `DruidRemodel`만 켜면 si0·si3만 켜지고 si1·si2는 꺼짐 |
| 등록부·검증 | `BossRemodelSets.Build()` | 게임 데이터 = si0·si3 드루이드뿐, 세트 검증 통과, 훅 없는 자기 기술·쿨다운 칸 중복은 거부, 드루이드 세트 = RM-B1 표·규칙, 드루이드 기술 번호 1~12 |

### 5.1 m1-check

**미실행(대기).** 10-28 첫 빌드(`run-rmb0-unity.ps1`, headless)는 Bee 단계에서 `GetLastError 1455`(페이징 파일 부족)로 중단됐다. 컴파일 오류가 아니라 PC 커밋 메모리 고갈이다(127.8GB 중 약 126GB 사용, 다른 세션 Unity 플레이어 6개 실행 중). 이후 CTO 규칙(10-28: Unity 빌드·플레이어는 PC 전체 동시 1개, 커밋 여유 20GB 이상일 때만, 재시도 반복 금지)에 따라 여유를 기다렸으나 대기 스크립트 자체가 OutOfMemory로 끝나 재시도하지 않았다.

Core 변경은 Runtime 화면 코드를 건드리지 않고 플래그 기본값이 꺼져 있다. m1-check 경로(드루이드 웹 이식 AI)가 같은 동작임은 oracle 0불일치·druid-remodel-test 바이트 동일로 확인했다. 병합 전 m1-check 1회는 메모리 여유가 생기면 `E:/exoduser-wt/_out/rmb0/run-rmb0-unity.ps1`로 돌린다(전 기준 18/18 ok).

## 6. 드루이드 파일 변경 (unity-rmb1 RB1-3·4·6 동시 작업 대비)

| 파일 | 줄(+/−) | 내용 |
|---|---|---|
| `DruidBoss.cs` | 2/2 | 점수 제외·강제 발동 호출을 세트 경유로(`Set.Forced`, `RmForcedPick`) |
| `DruidBoss.Moves.cs` | 12/12 | `DruidRemodelData.X` → `Set.X`(패링·즉발·추적장판·소환·강타 반경·독 자취), 잡기 흡수 `Remodel` → `RmGrab`, `switch` 앞 훅 2줄 |
| `DruidBoss.Remodel.cs` | 4/4 | `Ph`·기술표·콤보표·쿨다운 예외를 `Set` 경유로 |
| `DruidTelegraph.cs` | 6/10 | `MoveNo`를 `Set.MoveNo`로, 강타 반경 2곳, 주석 2줄, 끝에 훅 1줄 |
| `DruidRemodelData.cs` | 13/0 | 끝에 `Set` 추가(기존 줄 변경 없음) |
| `Simulation.DruidBoss.cs` | 6/4 | 스포너 등록 1줄, 생성 시 세트 선택, 틱 분기 |
| `Simulation.DruidRemodel.cs` | 18/12 | 상수 → `st.Set`, 뿌리 보상·침강 스위치, 훅 호출 |
| `Simulation.Revive.cs` | 1/1 | 리모델 0HP 분기 조건 |

`DruidBoss*.cs` 합계 +18/−18줄, 로직 이동·이름 변경 없음. 충돌 가능성: RB1-3(균열 기둥 막힘)은 `DruidBoss.Hazards.cs`·균열 판정 쪽일 것 — RM-B0은 `Hazards.cs`를 건드리지 않았고 `Moves.cs`의 균열 줄도 그대로라 **문맥 충돌 가능성 낮음**. RB1-4(예고 표시)가 `DruidTelegraph.cs`의 `MoveNo`·`AddSlam`·`CollectTelegraphs` 끝을 고치면 **작은 문맥 충돌 가능** — 그 경우 `DruidRemodelData.X`를 `Set.X`로 다시 바꾸는 것만 지키면 된다. RB1-6(속도 재설계)이 `DruidRemodelData.cs` 상수를 바꾸는 것은 세트가 같은 상수·배열을 참조하므로 그대로 반영된다. RB1-6이 `DruidBoss.Moves.cs`의 기술 줄(난타·강타·잡기 등)을 고치면 같은 줄에서 충돌할 수 있다 — 바뀐 줄의 `DruidRemodelData.X`/`Remodel`(잡기) 표기만 위 표대로 맞추면 된다.

## 7. 남은 일

- **m1-check 미실행**(§5.1): PC 커밋 메모리 여유가 20GB 이상이고 다른 Unity가 없을 때 `run-rmb0-unity.ps1` 1회. 유니티 총괄 병합 판단 전에 필요하면 이 세션에 지시.
- 보스별 움직임 원칙 M1~M5(최대 이동 px/틱·회전 상한·빈 시간)는 공용 이동(`IdleMove`·`FlowMove`) 쪽 규칙이다. RB1-6이 드루이드 파일에 넣을 때 세트 필드(예: `MoveSpeedCap`·`TurnRate`)로 받으면 모든 보스가 같이 쓴다 — RB1-6 담당과 보스전 총괄이 정한다.
- 1-4(RM-B4)의 박동 변경·흡수 등은 `Stage3` 슬롯 + 자기 상태 훅으로 만든다. 박동·잡기 수치를 세트로 옮길지는 RB4-1에서 정한다(지금은 드루이드 상수).
- 2장 이후 보스: `BossRemodelSets`에 슬롯 선언 한 줄씩 추가.
