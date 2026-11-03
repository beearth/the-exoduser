## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# FDG Godot 포트 — player_base_attack_source FIRST (2026-10-14)

TASK: GODOT-PORT-PLAYER-BASE-ATTACK-SOURCE-FIRST-20261014
상태: **코드/테스트 FROZEN** (수정·재실행 없음). 승인된 이력 = 서로 다른 group 13개 / assertion 318개 (8 + 5).
- **1차 EARLY(@28588): FIRST PASS** — 8 group / 185 assertions / FAIL 0. 2026-10-13T19:18:17.653027Z → 19:18:18.242717Z, exit 0, ERROR 0, SCRIPT ERROR 0. ledger calls: sink 42 / output 57 / ref 7.
- **2차 영향 범위(crystal @28602 + 공식 packet metadata): FIRST PASS** — 선택된 새 5 group / 133 assertions / FAIL 0. 2026-10-13T19:29:24.134701Z → 19:29:24.734544Z, exit 0, ERROR 0, SCRIPT ERROR 0. ledger calls: sink 28 / output 56 / ref 2 (음성 케이스 포함). 첫 실행에 통과: parse/INVALID 0, runtime 수리 0, retry 0.
- 1차 8 group 은 2차 실행에서 선택되지 않았고 다시 실행하지 않았다. 13 group 전체를 한 번에 돌리는 최종 suite 재실행은 **하지 않았다** — 318 은 두 실행을 더한 승인 이력이지 단일 실행 결과가 아니다.
- 2차는 이 작업에서 승인된 **별도 crystal 코드 추가**다. 1차 코드의 버그 수정이 아니며, 원 early 필드 계산과 1차 8 테스트는 보존됐다(executor `early-function-preservation.json`: configure/readiness/source_boot_base_atk/read_current_base_atk/_plan_fail/plan/run 원 본문 모두 그대로, old8_rerun 0).
- 2차 착수 전 3파일 백업: 외부 `after-early-first-pass-before-crystal-adapter/` (executor 생성).

소유 파일(3개):
- `godot/port_modules/player_base_attack_source/producer.gd`
- `godot/port_modules/player_base_attack_source/test_first.gd`
- `docs/engine/FDG_GODOT_PORT_PLAYER_BASE_ATTACK_SOURCE_FIRST_20261014.md` (이 문서)

## 1. 문서 기준

- `14밸런스+수치테이블.md` §공격력 기반 함수(238행): `meleeRef() = (wp.atk × (1+강화배율) + flatAtk어픽스 + baseAtk) × 봉인`
- `스킬데미지공식표.md` 124~128행: `meleeRef() = (주무기ATK + enhMulAtk + slotFlat + baseAtk + STR) × 봉인`, `baseAtk = 15 + (stage-1)×2`
- 문서 공식은 요약이다. 정확한 분기·fallback 은 아래 원 소스가 권위.

## 2. 원 소스 (canonical game.html, 읽기전용)

| 위치 | 원문 | 의미 |
|---|---|---|
| applyStats @28588 | `P.baseAtk=G.on?15+((G.stage\|\|1)-1)*2:15;` | 이 모듈이 담당하는 유일한 대입 |
| @28586 / @28589 | `P.poiseR` 초기화 / `P.speed=...` | 원 단계 위치: poise 다음, speed 앞 (재현하지 않음) |
| mkP @29657 | `baseAtk:8` | 부팅 리터럴(SOURCE_BOOT) |

## 3. 분기 / stage 표

일반 JS Number. `~~`/floor/clamp/양수·유한 정책 없음.

- `G.on` = JS ToBoolean(`AffixReader.js_truthy`). falsy(false/0/-0/""/null/NaN/**부재=undefined**) → **15**, `G.stage` 는 읽지도 변환하지도 않는다.
  - `G.on` 부재 = 원 `undefined` → falsy → 15. 원 의미 그대로이므로 READY(NOT_READY 아님).
- truthy → `(G.stage||1)` 원 fallback → ToNumber(`AffixReader.js_to_number`, 중복 numeric 로직 없음) → `15+(n-1)*2`.

| G.stage | 결과 | 비고 |
|---|---|---|
| 1 / 5 | 15 / 23 | |
| 0, null, 부재, NaN, false, "" | 15 | fallback 1 |
| -2 / -0.5 / 1.5 | 9 / 12 / 16 | 음수·소수 보존 |
| true | 15 | ToNumber(true)=1, fallback 아님 |
| "3" / "0" / " 2 " / "0x3" | 19 / 13 / 17 / 19 | truthy 문자열 ToNumber |
| ["4"] / [] | 21 / 13 | 배열 ToNumber |
| "abc", {}, [1,2] | NaN | SOURCE_NON_FINITE |
| "Infinity", 1e308 / "-Infinity" | +Inf / -Inf | SOURCE_NON_FINITE |

## 4. API (`producer.gd`, `extends RefCounted`)

- `configure(g_reader, p_reader, sink) -> readiness` — `g_reader()`: 현재 G, `p_reader()`: 현재 P, `sink(value: float) -> bool`: 고정 P.baseAtk 대입.
- `readiness()` — 바인딩만 확인(reader 호출 0). `{status, missing:[G_reader,P_reader,sink]}`.
- `plan()` — 우변만 평가, 쓰기 0. `{status, value, source_value, branch, on_present, on_raw, stage_inspected, stage_present, stage_raw, stage_fallback, stage_number, reason}`.
- `run()` — 순서: 바인딩 → 현재 P.baseAtk(before) → plan → **sink 1회** → readback(after).
- `read_current_base_atk()` — provenance `CURRENT`, `{present, value, is_number, non_finite}`. 부재 → present false, value null (8 기본값 금지).
- `static source_boot_base_atk()` — provenance `SOURCE_BOOT`, value 8, `current:false`. 현재값/파생값이 아니다.
- 카운터: `plan_calls`, `run_calls`, `sink_calls`.
- Callable 은 약참조 — provider 인스턴스는 호출자가 강하게 보관.

## 5. 부팅 8 vs applyStats 현재값

- mkP 의 8 은 부팅 리터럴일 뿐이다. 원은 applyStats 첫 실행에서 15(또는 stage 파생값)로 덮어쓴다.
- 포트: `source_boot_base_atk()`(SOURCE_BOOT 8)와 `read_current_base_atk()`(CURRENT)는 별개. P 에 baseAtk 가 없으면 8 로 메우지 않는다.

## 6. 미준비 / 부분 / 비유한 경계

| 상황 | status | sink |
|---|---|---|
| G/P reader 또는 sink 미바인딩·해제 | NOT_READY (`unbound:...`) | 0 |
| G reader null 반환 (현재 G 없음) | NOT_READY `G_reader_null` — 가짜 15 금지 | 0 |
| P reader null 반환 | NOT_READY `P_reader_null` | 0 |
| G 가 Dictionary 아님 | NOT_READY `G_unsupported_shape:*` (원 G 는 항상 객체) | 0 |
| G.on Object / (on truthy 시) G.stage Object | NOT_READY `*_unsupported_shape:Object` — Godot Object 커스텀 coercion 미지원 | 0 |
| 원 결과 NaN/±Infinity | **SOURCE_NON_FINITE**, `value` null, `source_value` 에 원 Number | 0 |
| ack false / 비-bool | SINK_REJECTED | 1 |
| ack true 인데 readback 불일치 | SINK_READBACK_MISMATCH | 1 |

- **원은 NaN/Infinity 를 그대로 `P.baseAtk` 에 쓴다.** 이 포트는 숫자 쓰기 도메인 밖으로 보고 쓰지 않고 진단만 낸다. 15 로 clamp 하지 않으며 READY 로 위장하지 않는다.
- ack 는 포트 계약일 뿐 네이티브 게임플레이 gate 가 아니다. latch 없음 — 거부 후 다음 run 은 정상 진행.
- 프레임/dedup/single-hit/stage 모드 lock/fault latch/gate 를 새로 만들지 않았다.

## 7. 실제 소비자 (combat_reference_source)

- `combat_reference_source/producer.gd` `melee_ref()`/`magic_ref()` 가 `configure_player_reader` 의 같은 P reader 로 **새로 쓰인 P.baseAtk** 를 읽는다(`terms.base_atk_raw`).
- 이 모듈은 ref 공식도 baseAtk 공식도 재구현하지 않는다. 테스트는 실제 Cref + 실제 AffixReader helper 를 쓰고 ref 차분 = baseAtk 차분만 비교.

## 8. 남은 Main 오케스트레이션 (이 모듈 범위 밖)

- applyStats 전체 순서(poise @28586 → baseAtk → speed @28589), 호출 시점(스테이지 진입/장비 변경/레벨업), `_eqStat` 캐시 무효화, G/P authority 실제 바인딩은 ENGINE/Main 담당. 이 모듈은 자동 driver·Node·asset 0.
- RNG/clock/무기/speed/poise/HP/좌표 변경 0.

## 9. 첫 테스트 (`test_first.gd`) — 1차 8 group **FIRST PASS (185 assertions)**, 동결

실행: `godot --headless --path godot --script res://port_modules/player_base_attack_source/test_first.gd -- [--only=<group>[,<group>]]`
출력: `PLAYER_BASE_ATTACK_LEDGER=<JSON>` (`groups`/`assertions`/`FAIL`/`failures`/`calls{ref,output,sink}`/`invalid_groups`). 실패 또는 잘못된 group → exit 1.

| group | 내용 | 결과 |
|---|---|---|
| on_false | on falsy(부재 포함) → 15, stage 미검사(NaN 문자열/Object 넣어도), 단일 대입 | PASS |
| on_true_stage | §3 표 + on truthy 변형(1/"yes"/{}/[]) | PASS |
| non_finite | SOURCE_NON_FINITE, value null, sink 0, P 불변 | PASS |
| not_ready | 미바인딩/G null/G primitive/P null → dispatch 0, 대비 G `{}`/`{on:true}` READY 15 | PASS |
| unsupported_shape | G.on/G.stage Godot Object → NOT_READY | PASS |
| boot_vs_current | SOURCE_BOOT 8 vs CURRENT 8 → 파생 15, 다른 P 필드·G 불변, baseAtk 부재 ≠ 8 | PASS |
| cref_consumer | 실제 Cref melee_ref 가 매 쓰기 후 새 baseAtk 를 읽음(비유한 단계는 이전값 유지) | PASS |
| sink_ack | ack false/비-bool/거짓 ack → 거부, latch 없이 다음 run READY | PASS |

- 1차 합계 185 assertions, FAIL 0 (2026-10-13T19:18:17.653027Z → 19:18:18.242717Z, exit 0, ERROR/SCRIPT ERROR 0, ledger sink 42 / output 57 / ref 7). 이후 이 8 group 의 assertion 은 수정하지 않았고 재실행 대상이 아니다.
- 2차에서 ledger 에 `selected`(실행된 group 이름)가 추가됐고, assertion 0 개인 선택 group 은 `zero_assertions` 실패, 선택 group 0 개면 exit 1 (0-assert 거짓 PASS 방지). 기존 필드는 그대로.
- headless 테스트 통과는 공개 빌드 검증(240)이 아니다.

## 10. 유지되는 불변 (변경 0)

native 60 / QE 검은콩 magic Q 전용 / 독립 탄환 / attack ticket 없음 / RNG source / pixel alias — 이 모듈은 어느 것도 건드리지 않는다.

## 11. 2차 영향 범위 — crystal @28602 + 공식 packet metadata (FIRST PASS, 5 group / 133 assertions)

1차 scalar `plan()/run()/read_current_base_atk()/source_boot_base_atk()` 와 legacy `configure(G,P,sink(float))` 는 의미 변경 0. 아래는 모두 **추가**.

### 11.1 원 소스 anchor

| 단계 | 위치 | 원문 | 앞 / 뒤 |
|---|---|---|---|
| EARLY | @28587-28588 | `P.baseAtk=G.on?15+((G.stage\|\|1)-1)*2:15;` | poise @28586 다음 / speed @28589 앞 |
| (생산) | @28600 | `P._crystalStats=_cr;` | `_cr` 는 player_resource_parameters_source 가 계산 |
| (사이) | @28601 | `P.mhp=~~(P.mhp+~~_cr.hp)+...` | health crystal — 타 owner |
| CRYSTAL | @28602 | `P.baseAtk+=~~_cr.atk;` | @28601 다음 / DEF crystal @28603 앞 |

두 단계를 이어 부르는 applyStats 전체 메서드는 없다. 중앙(ENGINE)이 원 순서대로 각 단계를 따로 호출한다.

### 11.2 공식 packet (ENGINE whitelist, 키 정확히 이것만)

```
{kind, source, writes:[{field:'baseAtk', value, source, expr, before_present, before}]}
```

| 상수 | 값 |
|---|---|
| `KIND_EARLY` | `apply_stats_base_attack_early` |
| `EARLY_PACKET_SOURCE` | `game.html:28587-28588` |
| `EARLY_WRITE_SOURCE` | `game.html:28588` |
| `EARLY_EXPR` | `P.baseAtk=G.on?15+((G.stage\|\|1)-1)*2:15` |
| `KIND_CRYSTAL` | `apply_stats_base_attack_crystal` |
| `CRYSTAL_SOURCE` (packet.source = write.source) | `game.html:28602` |
| `CRYSTAL_EXPR` | `P.baseAtk+=~~_cr.atk` |

- `before_present`/`before` 는 쓰기 직전 실제 현재 P.baseAtk (P reader 읽기만).
- READY packet 의 `value` 는 유한한 실제 값이다(비유한은 packet 대신 `diagnostic_packet`).
- 다른 kind / frame authority / phase guard 는 만들지 않았다.

**ENGINE 현재 상태(최신 trusted ENGINE 보고 기준, 이 작업에서 관찰·수정하지 않음):** 중앙 서비스는 현재 1차 scalar `plan().value` 를 계산/조회 없이 metadata 로 감싸
`kind='apply_stats_base_attack_initial'`, `source='game.html:28588'` 의 baseAtk 쓰기 1회로 보낸다.
이것은 이 모듈의 공개 `KIND_EARLY` packet 과 **같은 원 @28588 대입**이며 metadata 별칭일 뿐이다(actor/스탯 계산 별칭 아님).
- 중앙은 `apply_stats_base_attack_initial` wrapper **또는** 공개 EARLY packet 중 **하나만** 쓴다. early 공식/sink 를 두 번 부르면 안 된다.
- CRYSTAL 은 새 source writer 단계(@28602, health crystal mhp @28601 다음 / DEF crystal @28603 앞). 공식 dispatcher 는 경로 하나만 채택한다.
- 공유 서비스/whitelist 본문은 ENGINE 소유 — 이 worker 는 수정하지 않았다.

### 11.3 공개 API (추가분)

| API | 의미 |
|---|---|
| `static early_packet(ready_plan, before)` | READY `plan()` 결과 + CURRENT `read_current_base_atk()` 결과 → EARLY packet. **순수**(조회·계산 0): `plan.value` 를 재계산·변환 없이 그대로 감쌈 |
| `plan_early_packet()` | P 읽기(before) → `plan()` 1회(G 읽기 1회) → `early_packet`. 쓰기 0 |
| `run_early_packet()` | `plan_early_packet` → packet sink 1회 → readback. legacy scalar `run()` 과 별개 경로(둘 다 동작) |
| `configure_crystal_reader(crystal_reader, p_reader)` | 중앙 capture wrapper reader + 현재 P reader. legacy configure 와 독립 |
| `configure_packet_sink(packet_sink)` | EARLY/CRYSTAL 공용 `packet_sink(packet)->bool` |
| `crystal_readiness()` | 바인딩만: `{status: READY \| PROVIDER_BINDING_GAP, missing:[crystal_reader, crystal_P_reader, packet_sink]}` |
| `plan_crystal()` | wrapper 1회 + 현재 P 1회 읽기 → CRYSTAL packet. `_cr` 계산/수정 0 |
| `run_crystal()` | `plan_crystal` → packet sink 1회 → readback. **호출 1회 = baseAtk 덧셈 1회** |
| 카운터 | `crystal_reader_calls`, `crystal_plan_calls`, `crystal_run_calls`, `packet_sink_calls` |

packet sink/crystal reader/P reader 의 RefCounted owner 는 producer 가 강참조(`_packet_owners`).

### 11.4 crystal provider 바인딩 (중앙 capture)

- 중앙은 `player_resource_parameters_source.plan_apply_stats()` 를 원 applyStats 에서 **1회** 실행하고(실제 `player_crystal_resource_source` crystalEffects provider 포함), `values._crystalStats` 객체를 capture 한다.
- crystal reader 는 그 객체를 **같은 identity** 로 담은 wrapper 를 반환: `{status:'READY', value:<_cr Dictionary>, stage:<선택 String>}`.
- crystal stage 마다 reader 1회. resource plan/lv/장비/RNG 재실행 0, captured `_cr` 수정 0. crystalStats/effective/base/공식/캐시 계산 중복 0.

### 11.5 `~~_cr.atk` — 부호 있는 ToInt32

- 공개 `CombatStatFormula.js_to_int32(float(cr.atk))`. 소수 절삭(0 방향), 음수 보존, 2^32 wrap (예 2147483648 → -2147483648, 4294967301 → 5).
- `cr.atk` NaN/±Inf → **0** — 원 ToInt32 결과이지 가짜 정규화가 아니다(`cr_atk_raw_non_finite` 진단 유지).
- 부호 있는 stage clamp/RNG/clock/frame gate/latch 없음.

### 11.6 현재 P.baseAtk (JS `+=`)

- 덧셈 대상은 **early 와 사이 단계 이후의 현재 P.baseAtk** — 부팅 8 / 이전 early 값 재사용 0.
- number → 숫자 덧셈. null → 0, bool → 0/1 (기존 `js_to_number`).
- String/Array/Dictionary/Godot Object → 원은 문자열 연결/커스텀 coercion → **SOURCE_NONNUMERIC_DOMAIN** (가짜 연결 0, sink 0).
- baseAtk 부재 → `undefined+n = NaN` → SOURCE_NON_FINITE (`diagnostic_packet` 에 before_present false/before null), sink 0. NaN/±Inf 현재값도 SOURCE_NON_FINITE.

### 11.7 미준비 경계 (덧셈 0 위장 금지)

| 상황 | status / reason | reader | sink |
|---|---|---|---|
| crystal reader / P reader / packet sink 미바인딩 | PROVIDER_BINDING_GAP `unbound:...` | 0 | 0 |
| reader null (중앙 capture 없음) | NOT_READY `crystal_reader_null` | 1 | 0 |
| wrapper 비-Dictionary / status≠READY / stage 비-String | NOT_READY `crystal_wrapper_*` | 1 | 0 |
| wrapper.value 부재·null / 비-Dictionary | NOT_READY `captured_cr_missing` / `captured_cr_unsupported_shape:*` | 1 | 0 |
| `_cr.atk` 부재 | NOT_READY `captured_cr.atk_missing` (원 `_cr` 은 atk:0 초기화 → 부재 = capture 아님, 0 대체 금지) | 1 | 0 |
| `_cr.atk` 비-number | NOT_READY `captured_cr.atk_not_number:*` | 1 | 0 |
| P reader null | NOT_READY `P_reader_null` | 1 | 0 |
| `_cr.atk` 0 (실제 값) | READY, +0 쓰기 1회 | 1 | 1 |

### 11.8 packet sink / ack

- 고정 생성자 P 에 `packet.writes` 를 원 순서대로, field `baseAtk` 만 대입. sink 에는 `packet.duplicate(true)` 전달.
- bool ack 는 포트 계약일 뿐 게임 gate 가 아니다: false/비-bool → SINK_REJECTED, ack true + readback 불일치 → SINK_READBACK_MISMATCH. 지속 실패 상태/latch 없음.

### 11.9 실제 consumer 경로 (테스트 `crystal_source_consumer`)

고정 생성자 G/P/STATS/PASSIVES/INV(무기·갑옷 결정: blood_oath★2 enh3, ruin_heart★4, cinder_crown★0) →
`run_early_packet` (19) → `SourceParameters.plan_apply_stats()` 1회 (실제 crystalEffects catalog, Affix `eq_affix`, Cref `eq_stat`/`lv_b`) →
`values._crystalStats` identity capture (atk 4.55+2.0+0.25, `~~` = 6) → `run_crystal` → 공식 packet → 고정 P (25) → 실제 Cref `melee_ref()` 가 `base_atk_raw` 25, ref 차분 = 6.

PASS 로 확인된 사실: 공통 `SourceParameters.plan_apply_stats()` **1회**(실제 CrystalEffects catalog) → captured atk 6.8 (같은 Dictionary identity, 수정 0) → crystal reader 조회 **1회** → 공개 `Formula.js_to_int32` = 6 → early 공식 packet baseAtk 19 → crystal 쓰기 1회 25 → 실제 Cref `melee_ref` 차분 6. crystal 단계에서 resource plan / crystal table / effective 재계산 0.
이 경로의 SourceParameters/CrystalSource catalog 메서드는 새 branch 에서 소비만 했고, 그 모듈들의 기존 테스트는 재실행하지 않았다.

### 11.10 새 테스트 group — **FIRST PASS** (5 group / 133 assertions / FAIL 0)

실행(새 group 만, 1차 8 group 미선택):

```
godot --headless --path godot --script res://port_modules/player_base_attack_source/test_first.gd -- --only=early_packet_adapter,crystal_packet,crystal_source_consumer,crystal_missing,crystal_int32_boundaries
```

| group | 내용 | assertions | 결과 |
|---|---|---|---|
| early_packet_adapter | plan.value 그대로 감쌈(추가 G 읽기 0), 상수/whitelist, before 부재 vs P 부재, 비유한 plan → packet 0, sink gap, packet dispatch, legacy scalar 유지 | 17 | PASS |
| crystal_packet | early 후 + 사이 health 후 현재 P 에 +6, wrapper 1회, `_cr` identity/불변, G 읽기 0, 호출당 덧셈 1회, ack 거부 후 latch 없음 | 15 | PASS |
| crystal_source_consumer | 실제 SourceParameters+CrystalSource+Affix+Cref 경로(§11.9), provider 1회/resource plan 1회, 재실행·dispatch 0 | 13 | PASS |
| crystal_missing | binding gap / wrapper·cr·atk·P 부재 → NOT_READY, reader 1회·sink 0·P 불변, 대비 실제 atk 0 READY | 25 | PASS |
| crystal_int32_boundaries | 소수/음수/wrap/NaN·Inf→0 ToInt32, 현재 P 도메인(소수·음수·null·bool READY / 문자열·배열·객체 NONNUMERIC / 부재·NaN·Inf NON_FINITE) | 63 | PASS |

- ledger: `selected` = 위 5개, `invalid_groups` [], `failures` [], calls sink 28 / output 56 / ref 2.
- 런타임: 2026-10-13T19:29:24.134701Z → 19:29:24.734544Z, exit 0, ERROR 0, SCRIPT ERROR 0, Godot v4.7.2.stable.official.

### 11.10a 측정하지 않은 것 / 범위 밖

- 명시적 driver 의 physics/process/render 0. 자동 프레임 **UNMEASURED**. Node 0, asset 0, 공개 빌드/GPU 240 검증 0.
- 기존 consumer 본문과 다른 모듈의 성공 suite 는 실행하지 않았다.
- 실제 Main/driver/native attack 의 P.baseAtk 쓰기 통합은 **여기서 관찰되지 않았다**. 현재 기능 확인은 이 모듈이 소유한 고정 fixture 위의 실제 Cref 까지다.

### 11.11 남은 중앙(ENGINE) 작업

- 원 applyStats 순서대로 EARLY(poise 다음) / CRYSTAL(@28601 다음, @28603 앞) 단계 호출, resource plan 1회 실행 + `_crystalStats` capture wrapper 설치, 실제 P/G authority 및 packet sink 설치.
- native attack / Cref 설치 / dispatcher / player body 연결은 ENGINE 소유. 이 모듈은 Node/clock/자동 driver 0.
- EARLY 는 `apply_stats_base_attack_initial` wrapper 와 공개 EARLY packet 중 하나만 사용(§11.2). CRYSTAL dispatcher 경로 채택.
- 관련 문서(ENGINE sync, resource parameters FIRST 등) 갱신과 일반 checkpoint 는 **PENDING** — Codex executor 는 허용 경로 키워드를 검색해 정확한 경로/현재값을 인계하고, 기존 문서 동기화 및 normal code+docs checkpoint 는 ENGINE가 수행. 이 작업은 이 문서만 수정했다.

## 12. 계약 요약 (2차, 구분 정리)

| 구분 | 규칙 |
|---|---|
| 현재 baseAtk | early 및 사이 단계 이후 실제 현재 P.baseAtk. 부팅 8 / 이전 early 값 재사용 0 |
| 현재 fresh `_cr` | 중앙이 resource plan 1회에서 capture 한 같은 객체. stage 마다 reader 1회, 수정 0, 재계산 0 |
| `~~_cr.atk` | 부호 있는 ToInt32(공개 `Formula.js_to_int32`). 소수 절삭·음수·2^32 wrap, 원 atk NaN/±Inf → 0 |
| 문자열 `+=` | 현재 baseAtk 가 String/Array/Dictionary/Object → `SOURCE_NONNUMERIC_DOMAIN` (원은 연결, 포트는 쓰기 0) |
| 비유한 쓰기 | 결과 NaN/±Inf(baseAtk 부재 포함) → `SOURCE_NON_FINITE`. 원은 그 값을 쓰지만 포트 쓰기 도메인 밖 → `diagnostic_packet` 만 |
| binding gap | reader/sink 미바인딩 → `PROVIDER_BINDING_GAP` (reader 호출 0). 현재값 부재(`*_null`, `captured_cr_*`) 는 `NOT_READY` 로 구분 |
| sink ACK | false/비-bool → `SINK_REJECTED`, readback 불일치 → `SINK_READBACK_MISMATCH`. 진단일 뿐 — 새 latch/dedup 없음 |

## 13. 실행 receipt (외부 metadata 기준)

- Claude 기본 모델(로그 `claude-opus-5-5`, model override 0), session `20d676a5-7162-4c79-9cc5-ec58c6cd526c`.
  - 1차 생성 PID 38776 (2026-10-13T19:13:50Z), 승인된 crystal 추가 PID 39306 (19:21:42Z), 이 문서 갱신 PID 40533 (19:30:58Z) — `claude-launch.json` / `claude-crystal-adapter-launch.json` / `claude-final-doc-launch.json`.
  - 권한 `--restricted` / `dontAsk`, 쓰기 허용 정확히 소유 3경로, MCP `[]`. 1차·crystal 세션 stream 로그의 `permission_denials` 는 비어 있음.
- 착수 전 부재 확인: WORK·HEAD 모두 3파일 없음(`scope-absence-backup.json`, backup_existing_files 0). crystal 추가 전 HEAD 부재 receipt `crystal-HEAD-backup-receipt.json` (HEAD `7432c091…`, 3파일 head_exists false, Git_mutation 0) + 자체 바이트 백업 `after-early-first-pass-before-crystal-adapter/`.
- 테스트 실행은 executor 의 격리 clone fixture(`fixture-attempt1/`, `run-isolated.py`)에서. runtime: `attempt1.runtime.json` (1차), `attempt2.runtime.json` (2차).
- 이 작업이 만든 변경: 소유 3파일뿐. 새 uid 0, 공유 코드/Git/사람 작업/save/server/PNG/import 0.

Codex executor receipt 보충: 위 기존 문서/정상 checkpoint의 소유자는 ENGINE다. 이 보충은 첫 유효 code/test를 수정하거나 성공 검사를 재실행하지 않는 소유 경계 정정이다.
