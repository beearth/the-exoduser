# CW 조사 — 기본 공격 1타 예비(wWindup) 6틱 구현 전 조사 (2026-11-05)

- 레인: 클라우드 CW, 브랜치 `claude/unity-cloud-core-windup-20261105`(기준 unity/main `bd06f3819`). 브리프 [BRIEF_CORE_WINDUP_20261105](BRIEF_CORE_WINDUP_20261105.md) §2의 네 항목을 코드에서 확인한 결과다.
- 이 컨테이너에는 Unity·dotnet이 없다. 아래는 모두 코드 읽기 결과이고, 컴파일·테스트 실행은 **미확인**이다.
- 줄 번호는 이 커밋 시점 unity/main 파일 기준이다.

## 1. 1타 진입 경로 (wSwing에 들어가는 모든 코드)

Core에서 `Player.State = "wSwing"`를 대입하는 곳은 `Runtime/Core/Simulation.cs` 두 줄뿐이다. 다른 Core 파일(스킬·패링·구르기·AI·보스)은 wSwing을 만들지 않는다.

| # | 경로 | 위치 | 조건 | 현재 동작 | 예비 적용 |
|---|---|---|---|---|---|
| A | LMB 입력(idle에서) | `Simulation.cs:107-119` | `Player.State=="idle" && attack && Stamina>=cost` | ST 차감 → **즉시 wSwing 5**. `ActiveAttack=="kiSlash"`면 같은 틱에 `SpawnKiSlash((KiComboStep%3)+1)` | **1타일 때 적용**: 일반 무기(`ActiveAttack!="kiSlash"`)는 Core에 콤보 추적이 없어 모든 스윙이 1타. 기검참은 `(KiComboStep%3)+1==1`(KiComboStep 0 또는 3)일 때만 1타 |
| B | 기검참 3타 충전 해제 | `Simulation.cs:121-132` | `State=="wWindup" && KiChargeActive && !attack` | 충전 틱만큼 센 뒤 wSwing 5 + `SpawnKiSlash(3, charged)` | 적용 안 함(3타, 기존 wWindup 충전 규칙 그대로) |
| C | 기검참 2타 | A와 같은 줄 | `KiComboStep==1` | 즉시 wSwing 5 | 적용 안 함(2타는 별도 결정) |
| — | 자동 공격·버퍼·펫·자동 물약 | 없음 | — | `TickAutoPotion`(물약)·`TickCrossbow`(석궁 자동 발사)는 wSwing을 만들지 않는다. 입력 버퍼 없음(idle 상태의 당 틱 `attack`만 본다) | 해당 없음 |
| — | 하네스가 상태를 손으로 대입 | `Tools/stage-flow-oracle/Program.cs:94`, `Tools/skill-ui/Program.cs:13`, `Tools/player-hurt-oracle/Program.cs:46`, `Editor/CharacterLab/HeroVerification.cs:31-32` | 직접 `State="wSwing"`/`"wWindup"` | 상태 머신을 거치지 않는다 | 영향 없음(아래 §3) |

- 입력은 `Tick(... bool attack ...)` 한 줄이다(`NativeGame.cs:339` `SkillUiState.AttackHeld`). 홀드하면 매 틱 true가 들어오지만 idle 분기에서만 소비된다. 예비 중 눌림은 웹(33355)과 같이 무시된다.
- 웹 oracle(game.html 33055·33564): idle→`P.s='wSwing';P.st2=5` 즉시. 웹의 `wWindup` 비충전 분기(33355 `else if(P.st2<=0){P.s='wSwing';P.st2=5}`)는 Charge Finisher(34078, `st2=~~(10/spd)`)만 쓴다. 기본 공격 예비 0은 **의도된 차이**로 기록한다(브리프 §0).

## 2. `wWindup` 참조처 전부와 1타 예비 오인 여부

| 파일:줄 | 용도 | 오인 가능? | 처리 |
|---|---|---|---|
| `Core/Simulation.cs:112-113` | 기검참 3타 충전 진입(`KiChargeActive=true`) | — | 그대로 |
| `Core/Simulation.cs:121` | `State=="wWindup" && KiChargeActive` 충전 갱신·해제 | 1타 예비는 `KiChargeActive=false`이므로 이 분기에 들어가지 않는다. **지금 코드에는 비충전 wWindup을 wSwing으로 넘기는 분기가 없다** → 새 분기 필요 | 웹 33355와 같은 비충전 분기 추가: `StateTicks<=0`이면 wSwing 5 |
| `Core/ParryRules.cs:59` | `IsAtkState`(투사체 반사 반경 계산, 웹 34856과 동일 목록) | wWindup 전부 공격 상태로 본다 | 웹과 같은 규칙. 그대로(1타 예비도 공격 상태) |
| `Core/PlayerPoise.cs:33` | 피격 시 `kiCharging`(=`KiChargeActive`)이면 stagger 면제 | 1타 예비는 `KiChargeActive=false` → **swing 중 피격과 같은 stagger** | 브리프 "피격은 swing과 동일"과 일치. 그대로 |
| `Core/Simulation.PlayerCombat.cs:240` | 위 OnHit 호출(`Player.KiChargeActive` 전달) | 같음 | 그대로 |
| `Core/Simulation.Roll.cs:64` | 구르기: `!KiChargeActive`면 `bladeDash`로 전환 | 1타 예비 중 Space → swing 중과 같이 구르기로 끊긴다(충전은 상태 유지) | 브리프 "캔슬은 기존 규칙과 동일"(=swing과 동일). 그대로. 차이가 필요하면 제안으로만 |
| `Core/Simulation.PlayerCombat.cs:46` | Q(sBlock) 진입은 `idle`·`sRecover`에서만 | 예비·swing·recover 모두 Q 불가(웹 `_tryKiSlashQCancel` 14299는 Core에 이식돼 있지 않음) | 그대로 |
| `Core/Skills/Simulation.Skills.cs:136,170` | 스킬 시전 차단 조건에 공격 상태 없음 | 예비 중 스킬 키 → swing 중과 같이 시전으로 끊긴다 | 그대로 |
| `Core/SkillUiState.cs:13,19-21` | 장착 거부(`State!="idle"`), 상태 문구(`KiChargeActive`→"충전", wRecover→"공격 회복", 그 외→"행동 중") | 1타 예비는 "행동 중"으로 뜬다(충전 문구 아님) | 그대로(표시 문자열 추가 없음 → 번역 등록 불필요) |
| `Core/Simulation.EnemyAi.cs:210` | `PState`(적 AI에 넘기는 플레이어 상태) | 적은 `"charge"`·`"sBlock"`만 비교(§4) | 영향 없음 |
| `Core/Simulation.EnemyBridge.cs:121` | hurtE 컨텍스트 `P.s` | `EnemyHurt.*`는 `"whirlwind"`·`"charge"`만 비교 | 영향 없음 |
| `Runtime/NativeHeroMotion.cs:13,16,27` | 스프라이트 시트 프레임(`UsesAttackSheet`, wWindup 프레임 0~2, `windupTicks` 인자) | 스프라이트 경로는 wWindup 프레임이 **있다**(`attack-bat-v1` 0~2). 단 `NativeGame.cs:443`이 `windupTicks=(int)(10/WeaponSpeed)`(=22, 웹 finisher 식)를 넘겨 6틱 동안 프레임 2 하나만 보인다 | 표현 몫. 플래그로 구분 가능하게만 한다(아래) |
| `Runtime/NativeHeroMotion.cs:252` | 리그픽셀 `case "wWindup"` → `HeroMotionKind.Charge`, `Phase=Charge/120` | **오인한다**: 1타 예비가 충전 자세(Phase 0 고정)로 보인다 | 표현 몫(MO 레인 브랜치와 충돌 방지). Core는 `Player.BasicWindup` 플래그를 두어 구분 가능하게 한다 |
| `Runtime/NativeGame.cs:444` | 스프라이트 회복 길이 식 복제 `(int)(16/(spd×mul))` | 1타 회복이 28이 되면 프레임 진행이 34 기준으로 어긋난다(표현만) | 표현 몫. Core에 `AttackRecoverTicks()`를 두어 같은 식을 쓸 수 있게 한다 |
| `Runtime/NativeGame.Impact.cs:47` | 접점 홀드 대상 상태 목록(wSwing·wRecover·…) | wWindup 미포함 → 예비 중 홀드 없음 | 그대로 |
| `Runtime/NativeGame.*Smoke/*Capture.cs`, `KiSlashView.cs:80`, `NativeHudSkills.cs:77-83`, `NativePractice*.cs`, `Vfx/NativeSkillRemaster.cs:286` | 모두 `KiChargeActive`로 충전을 판정 | 1타 예비는 false → 충전 UI·게이지·VFX가 켜지지 않는다 | 올바름. 그대로 |

**구분 방법(결정):** 상태 이름은 `"wWindup"`을 그대로 쓰고(위 규칙들이 "기존 wWindup과 동일"하게 걸리도록), `PlayerState.BasicWindup`(bool) 플래그를 추가한다. 예비 진입에 true, wSwing 전환에 false, 상태가 wWindup이 아니면 매 틱 false. 표현은 `State=="wWindup" && BasicWindup`(또는 `!KiChargeActive`)으로 충전과 구분한다. 별도 상태 이름(`wWindupBasic`)은 `IsAtkState`·`UsesAttackSheet`·Impact 홀드 등 문자열 비교 10여 곳을 모두 고쳐야 하고 MO 레인 표현 파일과 충돌하므로 쓰지 않는다.

## 3. Core 테스트·하네스 영향

`unity/Tools`(unity/main)와 Editor·Runtime 하네스에서 플레이어 공격 틱을 실제로 돌리는 곳을 전수 검색(`git grep "wSwing\|wRecover\|wWindup" origin/unity/main -- unity/Tools` + Runtime/Editor grep)했다.

| 하네스 | 위치 | 지금 기대값 | 변경 후 | 처리 |
|---|---|---|---|---|
| core 기본 테스트 | `Tools/Tests/Program.cs:62-64` | 공격 틱 1 → `wSwing && st2≈5 && ST 95`, 틱2 무피격, 틱3 피격(쉴드 743) | 틱1 = `wWindup && BasicWindup && st2 6`, 틱7 wSwing 5, 피격은 틱9(=3+6) | 기대값 갱신(이 커밋). 손 기대값이라 웹 비교 아님 |
| ki-slash-oracle | `Tools/ki-slash-oracle/Program.cs:22` | 첫 공격 틱에 `KiComboStep==1`("emits first projectile immediately") | 1타 예비 6틱 뒤 wSwing 진입 틱에 `SpawnKiSlash(1)` → 6틱 뒤 `KiComboStep==1` | 기대값 갱신(이 커밋). 23행 2타 즉시(`KiComboStep==2`)·3타 충전은 그대로 PASS 예상 |
| B05 근접 무기 스모크 | `Runtime/NativeGame.B05Smoke.cs:59-70` | 회복 틱 수 ≈ `(int)(16/(spd×mul))`(±2) | 1타 회복 = `max(base−6,4)` | 기대값을 `sim.AttackRecoverTicks()`로(이 커밋). 80틱 안에 피격(t=8) 유지 |
| damage-parity-oracle | `Tools/damage-parity-oracle/Program.cs:125-130` | 매 타 idle로 리셋, 40틱 안에 피격 | 피격 t=2→t=8, 40틱 안 | 변경 없음 |
| PortVerification | `Editor/PortVerification.cs:122-123` | 200틱 홀드 뒤 StateTicks 유효 | 동일 | 변경 없음 |
| HeroCapture 대검3타·검기3타 | `Runtime/NativeGame.HeroCapture.cs:61-62,100-104` | 180틱 홀드에 Swing 콤보 1·2·3 관측, 검기 130틱 뒤 해제 | 사이클 길이 40틱 동일(6+5+28+1 = 0+5+34+1) → 스윙 t=6·46·86… 관측 가능 | 변경 없음. 예비 6틱 동안 리그픽셀은 Charge로 분류됨(표현 몫) |
| M1Check | `Runtime/NativeGame.M1Check.cs:179` | `wSwing && st2==5`로 스윙 수 집계, 600틱 | 동일 | 변경 없음 |
| player-hurt-oracle | `Tools/player-hurt-oracle` | 상태 손 대입 + `HurtPlayer`만 호출(Tick 없음) | 동일 | 변경 없음 |
| roll/dash-parry/feedback/stage-flow/skill-ui oracle | 각 Program/export | 상태 손 대입(`wWindup`은 모두 `KiChargeActive=true`) | 동일 | 변경 없음 |
| gameplay-parity export-movement | `Tools/gameplay-parity/export-movement.cjs:16` | 상태별 이동 배율(wRecover .8 등) | 예비 중 이동 .8은 swing과 같은 `MovePlayer(.8)` 분기 | 변경 없음 |

- 웹 oracle "허용 목록": 기본 공격 틱 타이밍을 웹 실행 결과와 직접 대조하는 oracle은 없다(위 표). 의도된 차이는 `BASIC_ATTACK_DAMAGE_20260910.md` 하단 표와 CHANGELOG_SYNC에 기록한다. 이후 공격 틱 oracle을 만들면 "idle→wWindup 6 → wSwing"만 허용하고 나머지 불일치는 FAIL이다.

## 4. 적 AI의 플레이어 공격 예측

| 코드 | 비교 대상 | 결과 |
|---|---|---|
| `Core/EnemyAi.cs:132,145,374,444,668`, `Core/MeleeAttackRules.cs:38` | `PState != "charge"`, `!= "sBlock"` | wSwing·wWindup을 보지 않는다 → 6틱 어긋남 없음 |
| `Core/Simulation.EnemyAi.cs:162` | `Player.State == "charge"` | 같음 |
| `Core/DruidBoss*.cs`, `Simulation.DruidBoss.cs:98` | 패링 창(`IsParryWindow`)·거리·LOS만 | 공격 상태 미참조 |
| `EnemyState.MeleeCounterUntil` | 근접 패링 성공 뒤 카운터 창(`Simulation.MeleeParry.cs:10`) | 공격 진입과 무관 |
| 웹 `game.html:40119,40261` | 암흑기사·적기사 "플레이어 wSwing이면 40%/30% 회피" | **Core에 이식돼 있지 않다**(`EnemyAi.cs`에 dodge 없음). 이식될 때 wSwing 기준이면 예비 뒤 6틱 늦게 반응(설계상 오히려 자연스러움) — 그때 결정 |

결론: 현재 Core 적 AI는 플레이어 공격 상태를 예측에 쓰지 않으므로 영향 0.

## 5. 회복 하한에 걸리는 공격 속도 구간

`recoverBase=(int)(16/x)`, `x=WeaponSpeed×AttackSpeedMultiplier`, `recover=max(recoverBase−6,4)`, 총 길이 `6+5+recover`.

| recoverBase | x 구간 | recover | 총 길이(새) | 총 길이(구 5+base) | 차이 |
|---|---|---|---|---|---|
| ≥10 | x ≤ 1.6 | base−6 (≥4) | base+5 | base+5 | 0 |
| 9 | 1.6 < x ≤ 1.777… | 4(하한) | 15 | 14 | +1 |
| 8 | 1.777… < x ≤ 2.0 | 4 | 15 | 13 | +2 |
| 7 | 2.0 < x ≤ 2.285… | 4 | 15 | 12 | +3 |
| 6 | 2.285… < x ≤ 2.666… | 4 | 15 | 11 | +4 |
| ≤5 | x > 2.666… | 4 | 15 | ≤10 | ≥+5 |

- 하한은 **x > 1.6**부터 걸린다. 무기 spd = `0.45×RarityMul`(`DropTablesData.cs:13,550-556`: 근접 7종 모두 SpdMul .45) → 일반 .45 / 매직 .54 / 레어 .675 / 에픽 .81 / 전설 .99 / 신화 1.125. 배율 = `1+dex×.0005+장갑 atkSpd 어픽스+장갑 암시 3~8%`(`InventoryState.cs:143`).
- 신화 무기(1.125)라도 배율 1.4222 초과(어픽스 없이 dex ≥ 845)여야 하한에 닿는다. 시작 장비(.45×1.0336=.465)는 base 34 → recover 28, 총 39(측정 0/5/34와 같은 길이).
- 레이저 범위 안(x ≤ 1.6)에서는 총 길이와 DPS가 바뀌지 않고, 접점만 6틱 뒤로 간다.

## 6. 구현 범위 확정

- `Core/SimulationState.cs` `PlayerState.BasicWindup` 추가.
- `Core/Simulation.cs`: A 경로 1타 → `wWindup 6`; 비충전 wWindup 분기(예비 중 `attackAngle=Facing` 갱신은 기존 충전 wWindup 규칙과 동일하게 적용) → `wSwing 5` + 기검참 1타 발사; wRecover = 1타면 `AttackRecoverTicks()`(=max(base−6,4)), 그 외 `AttackRecoverBaseTicks()`; 상수 `BasicWindupTicks=6`, `BasicRecoverFloor=4`.
- 하네스 기대값: `Tools/Tests/Program.cs`, `Tools/ki-slash-oracle/Program.cs`, `Runtime/NativeGame.B05Smoke.cs`.
- 표현 파일(`NativeHeroMotion.cs`, `NativeGame.cs:443-444`)은 고치지 않는다(MO 레인). 제안: ① `NativeHeroMotion.cs:252`에 `case "wWindup"`를 `BasicWindup`이면 새 Kind(예: `Windup`, Phase=1−RemainingTicks/6)로 분기, ② `NativeGame.cs:443` windupTicks를 `BasicWindup`이면 6으로, 444 recovery를 `Simulation.AttackRecoverTicks()`로.
