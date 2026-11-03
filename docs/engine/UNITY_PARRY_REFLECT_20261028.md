# Unity 패링 반사(청콩) — 적 탄을 되돌려 보내는 Core (2026-10-28)

- 담당: PC Sonnet 세션 `unity-rmb1`(유니티 총괄 배정). 브랜치 `claude/unity-pc-parry-reflect-20261028`(`fe99b7435`)(unity/main `4469bf89a` 기준, main 병합 금지).
- 배경: 웹은 패링이 성공하면 적 탄이 청콩이 되어 가장 가까운 적에게 날아가 맞힌다. Unity Core에는 이게 없고 탄이 흡수됐다(`DruidBoss.Hazards.cs` "bullet reflection (blue bean) ... NOT ported"). 첫 실습 패링 단계(A18)와 드루이드 패링 볼리가 이 기능을 쓴다.
- 원칙: 레슨·드루이드 전용이 아닌 **일반 적 탄 공통 규칙**. 판정 근거는 웹 `game.html`의 투사체 루프(35033-35320, 34978-34992)이며 원문을 Node VM에서 그대로 실행한 결과와 대조한다.

## 1. API (`Runtime/Core/ParryReflect.cs`, 네임스페이스 `Combat`)

| 이름 | 역할 |
|---|---|
| `ReflectProjectile` | 반사에 쓰이는 탄 기록(위치·속도·피해·수명·종류 플래그·청콩 플래그·폭발 반경). `sz`/`r` 0 = 웹 `undefined`(웹이 `\|\|`로 읽음) |
| `ParryReflect.Resolve(p, in ResolveInput)` | 탄 하나가 플레이어의 패링에 닿았을 때 어떤 가지가 받는지 결정. 반사면 `p`를 제자리에서 청콩으로 바꾸고 `doParry` 인자(`ParryDmg`·`ParryX/Y`·`ParryEl`·`ResourceMul`·`ParryTag`)·`ParryBankAdd`·`IceBurst`를 돌려준다. `Outcome` = None / Other / Absorb / BigEnergyParry / BigEnergyHit / Consumed / Reflect, `Kind` = RedBean / PhysicalMouth / TitanEye / BwBean / GbBean / Magic |
| `ParryReflect.HomingTurn(p, tx, ty, sp)` | 반사탄 유도: 가장 가까운 적(400px 이내)을 향해 틱당 0.08rad 선회 |
| `ParryReflect.Blast(p, targets, dotPool, hits)` | 반사탄이 적에 닿으면(접촉 반경 `max(6, r+min(18, 속도/2))`) 폭발 반경(`_aoeR` 또는 100) 안의 모든 적에게 `~~(피해×(0.8+0.2×(1−거리/반경)))`, 넉백 `18×falloff`, 독 수치. 쓰였으면 true |
| `Simulation.ReflectInput(distance)` / `PayReflectParry(in result)` / `ReflectHoming(p)` / `ReflectContact(p)` | 시뮬레이션 쪽 연결. 탄 루프는 `ReflectInput`→`Resolve`→`PayReflectParry`를 부르고, 반사된 탄은 매 틱 `ReflectHoming`, 이동 뒤 `ReflectContact`를 부른다 |
| `IBossReflectHost` | 드루이드 탄 루프가 쓰는 선택 인터페이스(`BossHostAdapter`가 구현). 구현하지 않는 host(oracle)는 옛 동작 그대로 |

한 줄 사용법(UI/다른 탄 루프): 적 탄이 플레이어 가까이 오면 `var r = ParryReflect.Resolve(탄, sim.ReflectInput(거리));` → `r.Outcome == Reflect`면 `sim.PayReflectParry(r)` 후 탄을 계속 날리고(친화), 이후 매 틱 `sim.ReflectHoming(탄)` → 이동 → `sim.ReflectContact(탄)`(true면 탄 제거).

## 2. 분기 표 (웹 35064-35248, 순서 그대로)

| 순서 | 대상 | 조건 요약 | 결과 |
|---|---|---|---|
| 1 | Q 누름 구역 ≤ 20px | 비친화·패링 가능 | `Absorb` (탄 소멸) |
| 2 | 대형 에너지탄 | Q 패링 / 접촉 | `BigEnergyParry` / `BigEnergyHit` (혜성 5개 교체는 범위 밖) |
| 3 | 물리 입/뱀탄·빨콩에 Q | 100px 안, 무적 아님 | `Consumed` (오입력, 반사 없음) |
| 4 | 빨콩(E) | 물리 분류, `rbDeflR` 안, E 쳐내기 유효 | 속도 7로 표적(없으면 ×−4), 피해 `pParryProjDmg(…, E)×1.5`, 수명 240, **폭발 160 / ×2** |
| 5 | 물리 입탄(E) | 같음 | 속도 max(5, 속도)로 표적(없으면 ×−2), ×1.5, 수명 180 |
| 6 | 눈알탄(E) | 같음 | 5와 같고 `titanEye` 해제 |
| 7 | 무지개콩 | 비 Q 마법 패링 | `Consumed` (접촉 폭발) |
| 8 | 화이트볼(E) | `normalR` 안 | E면 반사(×1.5, `bwBean` 해제), 아니면 `Consumed` |
| 9 | 다크볼(Q) | `qPulseR`/`normalR` 안, 무적 아님 | Q면 반사(×2, 수명 200), 아니면 `Consumed` |
| 10 | 회전참 흡수 | 일반탄 | `Consumed` |
| 11 | 일반 마법탄(Q) | `wwAbsR` 안 | Q 마법 패링이면 반사(×1.5, `parryBank += 피해`, 물콩이면 얼음 폭발), 아니면 `Other`(웹의 나머지 분기가 처리) |

반사된 탄의 공통 변경: `friendly`, `blueBean`, `parryBlueBean`, `magic`, `homing`, 색 `#00e5ff`, 수명 = 최대 수명. 보스는 청콩에서 **최대 HP의 10 %** 아래로 맞지 않는다(`EnemyHurt`의 `parryBlueBean`).

## 3. 드루이드 연결 (`DruidBoss.Reflect.cs`, 끈 상태 oracle 불변)

- 탄 루프는 `reflectHost`가 있을 때만 새 경로를 탄다. 적 탄이 플레이어 400px 안에 오면 `Resolve`; 반사면 탄을 목록에 둔 채 친화 상태로 바꾸고 `doParry`를 지급, 아니면 옛 경로(`HurtPlayer`).
- **리모델링(`DruidRemodel`)에서는 반사하지 않는다**(보스전 총괄 판정 2026-10-28): 리모델링에서 탄을 쏘는 기술은 5번 독포자 부채뿐이고 명세 §3에서 패링 불가이며, 반사하면 보스 최대 HP 10 % 이상이 깎여 목숨 HP 곡선·RB1-5 시간 기준이 무너진다. `TryReflect` 첫 줄이 `if (Remodel) return false;`이고 리모델링 탄은 기존 피격 경로를 탄다.
- 친화 탄: 플레이어를 쫓는 유도·플레이어 충돌을 하지 않고, 청콩이면 400px 안의 가장 가까운 적을 향해 선회, 적에 닿으면 폭발해 소멸. 벽에 닿아도 소멸.
- `ApplyParrySuccess(bool qParry, double resourceMul = 1, string parryEl = null)`와 `ApplyEnemyDamage(..., blueBean, parryBlueBean, magicHit)`에 **끝 선택 인자**만 추가했다(`Simulation.PlayerCombat.cs`·`Simulation.cs`, 기존 호출 불변).

## 4. 검증 (2026-10-28)

| 항목 | 결과 |
|---|---|
| `parry-reflect-oracle` (웹 원문 실행 대조) | 48,708 검사 / 0 불일치 — 반사 3000건(26종 탄, 반사 326건·6종 전부), 유도 90건, 접촉 폭발 1800건 |
| `parry-reflect-test` (실제 Simulation + 드루이드 탄) | 26 검사 / 0 실패 — 이식본: E 쳐내기·Q 패링·무방비·오입력·표적 없음, 리모델링: E·Q 창에서 반사 0 |
| 회귀 | `dash-parry-oracle` 187,165 / 0, `druid-boss-oracle --rev origin/main --cases 48` 5,421,635 / 0 불일치, `druid-remodel-test` 41,195 / 0(`ParryGuardChecks` 10검사 포함) |
| Unity 6000.6.7f1 헤드리스 빌드 | 오류 0건 |

## 5. 미구현·후속

| 항목 | 이유 |
|---|---|
| 히트스톱 | 웹은 `G.hitStop=0`(32767 "히트스톱 완전 비활성")이라 반사 전용 히트스톱이 없다. `ParryRewards`의 `HitStopParryReflect`(7)는 상수만 있고 웹 어디서도 쓰이지 않는다. 지급은 기존 `doParry`(패링 히트스톱 6, 옵션 0이면 0)를 따른다 |
| 패링 수업 분기(`_lessonShot`)·`_parryHomingTarget` 수업 표적 | 수업은 A18 담당. 일반 규칙은 수업 표적 대신 가장 가까운 적을 쓴다 |
| 오입력·무지개·화이트/다크볼·회전 흡수의 **페널티 효과**(피해·넉백·화상·포이즈) | 탄이 소모된다는 사실(`Consumed`)만 보고. 효과는 기존 `HurtPlayer` 경로 |
| 대형 에너지탄 혜성 5개 교체 | `BigEnergyParry`로 보고만 |
| 반사 폭탄 가지(`p.bomb`), 유니크 관통·분열(`_uParrySplit`) | 아이템 시스템 이식 때 |
| 적 독 상태(`poisonT`·`poisonStk`) | Core에 적 독 DOT이 없어 수치만 반환 |
| `statInt()`·`statStr()` | 1(E 쳐내기와 같은 대용치) |
| 지뢰(`p.mine`) 패링 | 이식본 경로에만 해당하는 알려진 차이(보스전 총괄: 이식 단계 보스는 동작만 맞추는 수준이라 고치지 않음). 드루이드 탄 루프의 지뢰 가지는 충돌 전에 끝난다. 웹은 반사 시 즉시 소멸 |
