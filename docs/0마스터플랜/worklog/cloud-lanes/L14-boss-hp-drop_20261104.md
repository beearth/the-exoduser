# L14 — 드루이드 보스 HP가 약 560틱 만에 148,786 → 1로 줄어드는 원인 (2026-11-04)

**상태: 분석만 함(코드 수정 0). 원인 후보 확신도 "높음"이지만, Unity를 실행하지 않고 코드로만 추적했다. Mac 재확인이 필요하다.**
빌드 = `codex/unity-boss-base-20261104` @ `7445707be`(preview6 `6229288c0` + a2r-nre-fix `8a5740a22` + druid-silhouette `a1f7d925a`). 인자 `--remodel3d --unity-fullrun-qa --enemy-render=rigpixel --boss-render=rigpixel`. 근거: `claude/unity-mac-report-20261104` `mac_20261104.md` "드루이드 회색 실루엣" 절의 추가 관찰.

## 0. 결론

1. **HP를 강제로 바꾸거나 피해를 두 번 넣는 코드는 없다.** QA 봇(`NativeGame.FullRunQa.cs`)·아레나 리뷰(`NativeGame.BossArenaReview.cs`)·3D/rigpixel 뷰 모두 보스 HP를 쓰지 않는다. 기검참은 적마다 한 번만 맞는다(`KiSlash.cs:89-92` `HitEnemies`). 보스 DOT는 보스 틱에서 돌지 않는다. 그래서 HP가 줄어드는 길은 Core의 정상 피해 경로뿐이다.
2. **이 빌드만 리모델 드루이드와 싸운다.** `b58ce84a`(드루이드 세트 기본값)가 들어가서 `--remodel3d`만 줘도 3목숨·7기술 리모델이 켜진다(`NativeReviewArgs.DecideDruidSet`, 로그 `[DruidSet] remodel=true reason=3d-arena`). unity/main `9196a515d`는 이 커밋이 없다. 그래서 같은 인자로도 **옛 웹 드루이드**(23기술, HP 5페이즈, 판정 부활, 리듬 탄막, 오브, 무지개콩)와 싸운다. combo4·unity/main의 "6사망"과 이 빌드의 "0사망"은 **서로 다른 보스와 싸운 결과**다.
3. **빨리 줄어드는 직접 원인(확신도 높음):** 봇은 아레나에서 기검참 3타를 120틱 꽉 채워 충전해 쏜다. 이 탄은 **피해 ×8, 반경 264px**이다. 리모델 드루이드는 탄을 쏘지 않으므로 봇이 막기·회피로 공격을 끊는 일이 거의 없다. 몸 반경은 130px이고 큰 동작 뒤에 서 있으므로 거의 모든 탄이 맞는다. 결과는 실측 **약 266 HP/틱**(148,786 ÷ 560)이다.
4. **설계 검증에 쓴 기준값이 틀렸다(확신도 높음).** RM1 §13.7과 `FightLengthChecks.cs`는 봇 DPS를 **35 HP/틱**으로 두고 2~3분(중앙값 161.6초)에 합격했다. 이 35는 **옛 웹 세트와 싸운 판**(3d-round-1, 플래그가 꺼져 있던 판)에서 잰 값이다. 리모델 세트에서 잰 실제 봇 DPS는 약 7.6배다. 같은 표의 100/틱 행도 59초인데, 266/틱이면 전투 전체가 **약 24초**로 계산된다(§3).
5. **판정:** QA가 일부러 넣은 동작(강제 진행·스킵)이 아니다. 실제 게임 규칙으로 일어나는 **밸런스 결함**이다. 사람 플레이어도 같은 충전 반복으로 P1을 약 9초에 끝낼 수 있다는 뜻이다. 버그 수정 대상이라기보다 보스전 총괄의 수치·설계 결정 대상이다(§5).

## 1. 틱 속도

`NativeGame.cs:104` `Time.fixedDeltaTime=1f/60f`. 60틱 = 1초다. 560틱은 약 9.3초, 555틱은 약 9.25초다. QA 봇은 프레임마다 `FixedUpdate()`를 직접 한 번 부른다(`NativeGame.FullRunQa.cs:285`). 틱 수는 `Simulation.TickCount` 기준이라 배속과 무관하다. 다만 텔레메트리 표본은 **실시간 10초마다** 찍힌다(`FullRunQa.cs:291,297`). 그래서 Mac의 "약 560틱"은 표본 두세 개 사이의 거친 값이다(±1표본 = 실제 fps에 따라 수백 틱).

## 2. 보스 HP 수치 — Core·웹 대조

| 항목 | Core (`7445707be`) | 웹 oracle (origin/main `game.html`) | 일치 |
|---|---|---|---|
| 기준 HP | `EnemyFactory.cs:146-149`: `floor((0.4L³+199L+100)×2.925 × pacing × 24 × dm × hpMul) × (1+si×0.02)`, pacing = `1/(1+min(9,L−1)/18)` | 31567-31568 `_bossMul=ib?24:1`, 같은 식 | 일치 |
| L12, 난이도 5(dm 1), si 0 | **148,788**. Mac 148,786은 첫 표본 직전 2 피해로 보임 | 같음 | 일치 |
| L1 | **21,016**. Mac 20,699는 첫 표본 전에 317 피해가 들어간 값으로 보임 | 같음 | 일치 |
| 리모델 목숨 HP | `DruidRemodelData.LifeHpFraction` 1.0 / 0.6 / 0.4. P2·P3에 쉴드 15%(`ShieldFraction`) | 해당 없음(리모델 신규 설계, oracle 대상 아님) | — |
| 리모델 실효 HP 합 | 기준 × (1 + 0.6×1.15 + 0.4×1.15) = 기준 × 2.15. **L12 약 319,900**, L1 약 45,200. 목숨 사이 무적 무릎 120틱 × 2 | — | — |
| 옛 웹 세트 | HP 5페이즈(0.8/0.6/0.4/0.2 경계에서 `PhaseCheck`가 HP를 경계값으로 올리고 90틱 무적), 판정 부활(`_revPts` 200), 리듬 탄막 90−6×phase틱마다 | 같음(oracle 검증 경로) | 일치 |
| 기검참 피해 | `KiSlash.cs:37-42`: `ref × 7 × DamageMul × skill × (3타면 2^tier)`, tier = floor(충전틱/40) 최대 3 | 17208-17217 `_kiSlashHoldMultiplier`, 같은 식 | 일치 |

→ HP 공식과 기검참 공식은 웹과 같다. 리모델 HP 비율만 웹 대조 대상이 아니다.

## 3. 원인 후보 표

| # | 파일:줄 | 조건 | 예상 HP 곡선 | 확신도 |
|---|---|---|---|---|
| A | `NativeGame.FullRunQa.cs:254-258`(아레나에서 `KiChargeTicks<120`이면 attack 유지 → 120에서 놓음) + `Core/Simulation.cs:121-131`(놓으면 `SpawnKiSlash(3, charged)`) + `Core/KiSlash.cs:37-42,63-65`(tier 3 = 피해 ×8, 반경 120×2.2=264) | 리모델 세트. 봇의 `defend`·`evade`는 보스 탄이 있을 때만 켜진다(`FullRunQa.cs:221-237`). 리모델 7기술은 탄을 만들지 않는다. 리듬 탄막·오브·대기 콩은 `!Remodel`일 때만 돈다(`DruidBoss.Hazards.cs:165`, `DruidBoss.cs:360`, `DruidBoss.Moves.cs:182`) | **계단형**: 약 170틱 순환(1타 → 2타 → 3타 120틱 충전 → 발사, 쿨 12/12/20)마다 1타·2타 ×1과 3타 ×8, 순환당 기준값의 약 10배. 치명 1.5배와 포이즈 붕괴 후 스턴 1.5배(`EnemyHurt.cs` 스턴 ×1.5)가 더해진다. L12 P1 148,788 ≈ 3~4순환 ≈ 510~680틱. Mac 560틱과 맞는다 | **높음** |
| B | `NativeReviewArgs.cs:29-40`, `NativeGame.ReviewArgs.cs:16-19`(`b58ce84a`) | `--remodel3d`면 `DruidRemodel=true`. 9196a515d에는 없음 | 보스가 바뀐다. 옛 세트: 리듬 탄막(90틱 < 충전 120틱)이 3타 충전을 Q·구르기로 자주 끊고, 보스가 순간이동·이동하며, 페이즈 경계 HP 보정과 판정 부활이 있다 → 느리게 줄고 봇은 6사망. 리모델: A 곡선, 0사망 | **높음**(사실 확인: 커밋 diff) |
| C | `Core/DruidRemodelData.cs:20`(`LifeRadiusPx` 130/111/57, `2a637d1b`·`50e60ebf`) + `Simulation.BossRemodelRules.cs` `RemodelSeparatePlayer` | 이전 반경 44 → 130. 3타 탄(264)·근접 호(`Simulation.cs:217` 사거리 + `enemy.Radius`)의 적중 판정에 보스 반경이 더해진다. 봇은 몸 밀어내기로 몸 가장자리에 붙는다 | A를 키운다(빗나감 감소). 혼자서 7배를 만들지는 않는다 | 중간(보조 요인) |
| D | `RM1 §13.7` / `unity/Tools/druid-remodel-test/FightLengthChecks.cs:15` `BotDpsPerTick = 35` | 옛 세트 판에서 잰 DPS로 리모델 길이를 검증. "피해는 위치와 무관"이라고 가정해 C와 A의 효과가 시뮬에 들어가지 않는다 | 검증은 161.6초로 통과했지만, 실제 266/틱이면 P1 ≈ 559틱, P2 ≈ 89,273×1.15/266 ≈ 386틱, P3 ≈ 59,515×1.15/266 ≈ 257틱, 무릎 240틱. **합계 약 1,440틱 ≈ 24초** | **높음**(검증 결함) |
| E | `Core/DruidBoss.cs:160-170` 벽 충돌 피해 `max(kb×4, MaxHp×min(.08, kb×.004))` | 넉백 중 보스 **중심점**이 타일 벽(`IsProjectileWall`)에 닿을 때. 반경 130에서는 가장자리가 먼저 막혀 중심이 벽에 닿기 어렵다 | HP 비례 계단(최대 8%). 레벨과 무관하게 같은 틱 수를 만들 수 있는 유일한 HP 비례 경로지만, 조건이 거의 안 맞는다 | 낮음 |
| F | `Core/EnemyHurt.cs:103,313` 파랑콩 반사 = 보스 MaxHp 10% | Q로 마법탄을 튕겨야 한다. 리모델 7기술은 탄이 없다 | 해당 없음(리모델). 옛 세트에서만 큰 몫(설계 메모: 실측 피해 3.48M 중 스킬·반사 2.35M) | 리모델에서는 배제 |
| G | 3D/rigpixel 뷰, `BossArenaReview`, `M1Check` | 뷰·리뷰에는 보스 HP를 쓰는 코드가 없다. `M1Check.cs:469,481`의 강제 피해는 `--unity-m1-check` 경로 전용이고 이 인자에는 없다. 아레나 리뷰 입력은 `--unity-boss-arena-review`일 때만 돈다 | — | 배제 |
| H | 보스 DOT(얼음 0.8%, mh 2% MaxHp; `EnemyAi.cs:206-226`) | 보스는 `BossTick`(DruidBossTick)으로만 돌고 `EnemyAi` DOT 틱을 거치지 않는다 | — | 배제 |

### 직행 판(L1, 20,699 → 0, 약 555틱)

- L1에서도 같은 A 경로다. L1 기검참 ref ≈ 무기 + 15 + 0.5 ≈ 25~30이면 기준값 ≈ 1,470~1,760이고, 3타 충전 한 방이 약 11,800~14,100이다. 21,016 HP P1은 약 1.5~2순환(약 300틱)이면 끝난다. 나머지 틱은 접근·첫 충전으로 설명된다.
- "→ 0"은 P1만으로는 나오지 않는다(P1이 0이 되면 Core는 HP를 1로 둔다: `Simulation.DruidRemodel.cs:72,82`). 0은 ① 마지막 목숨 처치 뒤 `FindBoss()==null`이라 표본의 `bossHp`가 0으로 찍혔거나, ② 표본 간격(실시간 10초마다, `FullRunQa.cs:291,297`) 사이에 P1→P3가 지나간 경우다. 이 판이 P1만인지 전체인지는 **미확인**이다. L1 전체 실효 HP 약 45,200 + 무릎 240틱도 555틱 안에 들어갈 수 있는 크기다.
- 두 판의 틱 수가 거의 같은 것(560/555)은 우연일 가능성이 크다. 남은 HP 비례 경로(E)는 조건이 거의 안 맞는다.

## 4. unity/main(`9196a515d`) ↔ 이 빌드(`7445707be`) 차이 중 HP·피해에 닿는 것

`git diff 9196a515d..7445707be -- unity/Assets/Exoduser/Runtime`(merge-base `1fe5c4366`, 각각 91·152커밋 앞섬). Core는 12파일이 바뀌었다.

| 변경 | 커밋 | HP·피해 영향 |
|---|---|---|
| 드루이드 세트 기본값: 3D 아레나·데모는 리모델 | `b58ce84a` | **결정적.** 싸우는 보스가 바뀜(B) |
| Core 반경 44 → 91 → 130/111/57, 거리 이동량, 몸 분리 | `50e60ebf`, `2a637d1b` | 플레이어 적중률 상승(C). 보스 HP 수치는 그대로 |
| RB1-7 수치(내려찍기 140→260, 걷기 멈춤 100→220, 채찍 8→10틱, 잡기 접촉 30→150 등) | `6e02269d`, `b7ec5ce0`, `41d16c6d` | 보스가 플레이어에게 주는 피해·거리. 보스 HP와는 무관 |
| D-U3 플레이어 최대 HP(SP 활력 읽기, `lifeMaxHP`·`maxHPFlat`·장비 기개) | unity/main 쪽에만 있음(이 빌드에는 없음) | 플레이어 최대 HP만 다르다. 보스 HP와는 무관(0사망과도 직접 관계는 작음) |
| `DruidBoss.cs` AI 거리 `rawDist`, 기술 선택 거리 이동 | `50e60ebf` | 기술 선택만. HP와는 무관 |

보스 HP 공식(`EnemyFactory`), 기검참 공식(`KiSlash`), 피격 공통 경로(`EnemyHurt`·`Simulation.ApplyEnemyDamage`)는 두 커밋 사이에서 **바뀌지 않았다**.

## 5. 최소 수정안 (패치 문서만, 적용 안 함, 결정 = 보스전 총괄·CTO)

Core 수치·판정은 이 레인에서 바꾸지 않는다. 아래 셋 중 무엇을 할지는 보스전 총괄이 정한다.

1. **검증부터 고친다(필수, 테스트만).** `unity/Tools/druid-remodel-test/FightLengthChecks.cs:15`의 `BotDpsPerTick`을 리모델 세트 실측값으로 바꾼다. 실측값은 Mac 재확인의 ①(`bossHp` 감소/틱)이고, 현재 추정은 약 266이다. 그러면 지금 수치에서 중앙값 120~180초 검사가 FAIL로 드러난다. RM1 §13.7 표의 "근거" 칸에 "3d-round-1은 옛 웹 세트(플래그 꺼짐) 판"을 적는다.
   ```diff
   -    const double BotDpsPerTick = 35;
   +    const double BotDpsPerTick = 266;   // 11-04 Mac: remodel set (b58ce84a) 3D fullrun, P1 148,786 -> 1 in ~560 ticks; 35 was the old web set run
   ```
2. **리모델 보스가 받는 피해를 조정한다(데이터·훅, 리모델 신규 설계라 oracle 대상 아님).** 프레임워크에 이미 `BossRemodelHooks.DamageScale`이 있다(`BossRemodel.cs:38`, `Simulation.BossRemodelRules.cs:101-111`, 웹 `_aDefM` 경로). 드루이드 세트는 이 훅을 쓰지 않는다. 266/틱을 2~3분(무릎 제외 약 8,760틱)에 맞추려면 실효 HP를 약 2.33M으로 올리거나(현재의 약 7.3배), 받는 피해를 약 0.14배로 줄여야 한다. HP 배율만 올리면 다른 공격(근접·마법)의 손맛까지 7배 무거워진다. 그러니 **3타 충전 의존을 깨는 설계**와 함께 보는 것이 맞다. 예: P1부터 충전을 끊는 압박 기술, 아니면 충전 3타에 보스 포이즈 저항.
3. **봇만 바꾸는 안은 수정이 아니다.** 충전틱을 줄이면(`fullrun-policy.json` `chargeTicks`) 측정값은 내려간다. 하지만 사람도 같은 충전 반복을 할 수 있으므로 게임 결함이 그대로 남는다. 진단용으로만 쓴다(아래 ③).

## 6. Mac 재확인 방법 (같은 빌드 `7445707be`, 코드 변경 없이)

| # | 인자·입력 | 볼 로그·키 | 기대값(이 분석이 맞다면) |
|---|---|---|---|
| ① | 기존 인자 그대로 | Player.log `[DruidSet] remodel=true reason=3d-arena`. `telemetry.jsonl`(또는 `FULLRUN {…}` 줄)의 `tick`·`bossHp`·`state`·`level` | `bossHp`가 `state=="wWindup"` 뒤 `wSwing`이 나온 표본 사이에서 기준값의 약 25%씩 계단으로 떨어진다. P1 끝은 `bossHp:1`, 이어 P2 = 기준 × 0.6(L12 = 89,273) |
| ② | `--unity-druid-legacy` 추가(옛 웹 세트 강제) | 같은 키 + `[DruidSet] remodel=false reason=legacy-arg` | HP가 훨씬 느리게 줄고(옛 실측 35/틱 근처), 봇 사망이 다시 생긴다 → 원인 B 확인 |
| ③ | 출력 폴더에 `fullrun-policy.json` = `{"enabled":true,"chargeTicks":30}` (아레나·보스 생존 중에만 적용, `FullRunPolicy.cs:53`. 기록은 `policy-history.jsonl`) | `bossHp` 감소/틱 | tier 0(×1)으로 놓으므로 감소 속도가 약 1/3~1/4로 준다 → 원인 A 확인 |
| ④ | 직행 판 `--unity-boss-direct 0` | `bossHp` 연속 표본 | 0이 찍히기 전에 `1`(무릎)과 P2·P3 최대치(L1: 12,610 / 8,406 + 쉴드)가 보이는지 본다. 안 보이면 표본 간격 문제(§3 직행 판) |

판정 메모: ①~③이 기대대로 나오면 결론 3·4가 확정된다. ③에서도 266/틱 근처가 나오면 A가 틀린 것이다. 그때는 E(벽 충돌 텍스트 "벽 충돌!"이 화면이나 로그에 나오는지)와 다른 HP 비례 경로를 다시 추적한다.

## 7. 안 한 것

- Unity·dotnet 실행 없음(클라우드 컨테이너에 dotnet 없음). 수치는 코드 공식으로 계산했다.
- 봇의 L12 기검참 레벨·무기·힘 실측값은 텔레메트리에 없어서 ref는 범위로 추정했다(순환 3~4회).
- 코드·테스트·다른 docs는 수정하지 않았다(레인 규칙: 이 문서 1파일만).
