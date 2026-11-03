## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# FDG Godot Port — Player Effective Stats Source FIRST (2026-10-13)

TASK `GODOT-PORT-PLAYER-EFFECTIVE-STATS-SOURCE-FIRST-20261013`

| 항목 | 값 |
|---|---|
| 코드 | `godot/port_modules/player_effective_stats_source/producer.gd` |
| 테스트 | `godot/port_modules/player_effective_stats_source/test_first.gd` |
| 실행 상태 | **FIRST PASS** — Codex isolated executor, Godot 4.7.2 attempt01: exit 0 / stderr 0 / SCRIPT ERROR 0, 10 groups 66 checks (아래 "첫 실행 결과"). code/test FROZEN |
| 작성/실행 분리 | 작성: Claude (model `claude-opus-5-5`, restricted/dontAsk, 정확 3 path, 최초 Write 는 PASS 주장 없이 NOT_RUN). 실행·proof 작성: Codex |
| main_ready | **false** (ENGINE cohort authority 미설치) |
| 범위 | 원 `P._effStats=s` (@28570) 단일 write 조립 + 단일 ordered sink |
| 범위 밖 | s.str/dex/int/vit 재계산, `_lvB`/`_eqAffix`/`_eqStat`/캐시 재조회, HP/MP/DEF/speed/shield/`_crystalStats`, STATS/PASSIVES 투자, 장비 재계산, clock/process/input/UI/저장 |

## 원 source (canonical game.html 28564-28571, 읽기 전용)

| 줄 | 원 식 | 이 모듈 |
|---|---|---|
| 28566-28567 | `_eqStr/_eqDex/_eqInt` 17 slot 단일 for-loop `(+it.bX\|\|0)` | 재계산 0 — HP/resource plan 이 이미 합산 |
| 28568 | `_lb=_lvB()` (1회) | HP plan `values.lv_b` 재사용, 새 `_lvB` 조회 0 |
| 28569 | `str:STATS.str+_eqStr+_lb+~~_eqAffix('strFlat')` | HP plan `values.s_str` |
| 28569 | `dex:STATS.dex+_eqDex+_lb+~~_eqAffix('dexFlat')` | resource plan `values.s_dex` |
| 28569 | `int:STATS.int+_eqInt+_lb+~~_eqAffix('intFlat')` | resource plan `values.s_int` |
| 28569 | `vit:~~_eqAffix('vitFlat')` | HP plan `values.s_vit` |
| 28569 | `lck:STATS.lck+_lb` | **유일 신규 식**: 현재 `STATS.lck` + HP `lv_b` |
| 28570 | `P._effStats=s` | fresh object 1회, key order `str,dex,int,vit,lck`, partial merge 0 |

순서: 28570 write 는 HP@28582 / DEF / speed / MP / `_cr` 보다 앞. packet `gaps[end]` = `game.html:28571-28582` (다음 owner: `player_health_parameters_source` PHASE_INITIAL 이하).

## LCK 분기 (STATS.lck + _lb)

| 현재 STATS.lck | 결과 | 근거 |
|---|---|---|
| int/float (0 포함) | `float(v)+lb` | bound 0 은 유효 0 |
| `null` | `0+lb` | JS `null+n` |
| `true`/`false` | `1+lb` / `0+lb` | JS ToNumber |
| 키 부재 | NOT_READY `STATS.lck_missing` | undefined → authority 누락 (0 보충 금지) |
| String/Array/Object | NOT_READY `unsupported_js_plus_operand:STATS.lck:*` | 원은 문자열 연결 — 미구현 |
| ±Inf/NaN 결과 | `SOURCE_NON_FINITE`, dispatch 0 | 원은 NaN 대입 — 미지원 |

JS ToNumber 는 `equipment_affix_reader.js_to_number` 재사용 (null/bool/number 만 전달).

## Providers / schema

| key | 계약 | 읽기 순서 |
|---|---|---|
| `cohort` | `() -> cohort` (아래) — deep copy 후 사용 | 1 |
| `current_cohort` | `() -> cohort_id` 현재 applyStats pass (String 비어있지 않음 \| int, 타입 엄격) | 2 |
| `stats` | `() -> 현재 STATS Dictionary` | 3 |
| `player` | `() -> 현재 P Dictionary` (읽기: `before`, getter) | 4 |
| sink | `effective_stats_sink(packet) -> bool` (bool `true` 만 ack) | 5 (1회) |

cohort:

```
{ status:"READY", cohort_id, authority:String, current_main:bool,
  stats_at_prefix:{str,dex,int,lck},
  hp_initial:{cohort_id, plan:<HealthParams.plan_initial() 결과>},
  resource_plan:{cohort_id, plan:<ResourceParams.plan_apply_stats() 결과>} }
```

검증 (하나라도 실패 → NOT_READY, packet null, sink 0):

| 검사 | reason |
|---|---|
| cohort status/id/authority/current_main(bool) | `cohort_not_ready:*` / `cohort_id_missing` / `cohort_authority_missing` / `cohort_current_main_not_bool` |
| `current_cohort` == cohort_id (타입+값) | `stale_cohort:current=… cohort=…` |
| 같은 cohort 이미 dispatch | `cohort_already_dispatched:<id>` |
| 섹션 cohort_id 일치 | `cohort_mismatch:<section>` |
| plan status `READY` (SOURCE_BOOT/SOURCE_NON_FINITE/NOT_READY 거부) | `<section>_not_ready:*` |
| `packet.kind` = `HealthParams.PHASE_INITIAL` / `ResourceParams.KIND_APPLY_STATS` (상수 참조) | `<section>_wrong_kind:*` |
| `packet.source` = `HealthParams.PHASE_SOURCE[PHASE_INITIAL]` / `game.html:28564-28614` | `<section>_wrong_source:*` |
| values `s_str,s_vit,lv_b` / `s_dex,s_int` 유한 숫자 | `<section>_value_missing:*` / `_value_not_finite_number:*` |
| 현재 STATS str/dex/int/lck == `stats_at_prefix` (타입+값) | `stale_cohort:STATS.<k>_changed_since_prefix` |
| packet/kind 없는 current scalar 필드 dict | `<section>_packet_missing` |

## Packet (단일 write)

```
{ kind:"apply_stats_effective_stats", source:"game.html:28566-28570", cohort_id, authority, current_main,
  writes:[{ field:"_effStats", value:{str,dex,int,vit,lck}, source:"game.html:28570", expr:"P._effStats=s",
            before_present, before }],
  gaps:[{ at:"end", source:"game.html:28571-28582", owner:… }] }
```

- sink 는 cohort 당 최대 1회 호출 (거부돼도 재-dispatch 0).
- sink 에는 packet deep copy 전달; producer ack 사본은 sink 측 변조와 분리.
- Callable owner(RefCounted) 강하게 유지 — 로컬 해제 후에도 동작.

## 현재 getter `read_current_effective_stats()`

| 상황 | status / provenance |
|---|---|
| P 에 `_effStats` 없음 | NOT_READY / `absent` (plan 값·0 으로 만들지 않음) |
| 비 Dictionary | NOT_READY / `current_unsupported` |
| ack 없음 (plan 만, 또는 sink 거부) | NOT_READY / `current_unverified` |
| 키순서 또는 값이 ack 와 다름 | NOT_READY / `current_unverified` (`P._effStats_diverged_from_ack`) |
| 현재 cohort 가 ack cohort 아님 | NOT_READY / `stale` |
| 위 모두 통과 | READY / `stage_acked:cohort_<id>` |

`main_ready` 는 항상 false. before(packet `writes[0].before`) 와 after(getter) provenance 는 분리.

## 기존 helper 재사용

| 재사용 | 방식 |
|---|---|
| `player_health_parameters_source` | `PHASE_INITIAL`, `PHASE_SOURCE` 상수 + 이미 계산된 `plan_initial()` 결과 소비 (호출 0) |
| `player_resource_parameters_source` | `KIND_APPLY_STATS` 상수 + 이미 계산된 `plan_apply_stats()` 결과 소비 (호출 0) |
| `equipment_affix_reader` | `js_to_number` (LCK operand) |

새 aggregate/formula/`_eqStat`/캐시/`_lvB` 호출 0.

## 테스트 그룹

```
godot --headless --path godot --script res://port_modules/player_effective_stats_source/test_first.gd \
  -- [--only=group1,group2] [--report=/abs/path.json]
exit 0 PASS / 1 FAIL / 2 INVALID
```

| group | 내용 |
|---|---|
| `compose_ready` | 실 HP/resource plan 1회씩 → 5필드 값, key order, sink 1회, `_lvB`/`_eqAffix` 추가 호출 0, provider 읽기 순서 |
| `lck_admission` | null/true/false/float/음수 READY, string 미지원, 부재 NOT_READY, Inf SOURCE_NON_FINITE |
| `valid_zero` | 전부 0 + int cohort_id → READY 0 write |
| `stale_cohort` | current id 진행, prefix 이후 STATS 변경, 섹션 id 불일치, `"1"` vs `1` |
| `wrong_source_kind` | kind 교차, SOURCE_BOOT, scalar fallback, lv_b/s_int 누락, s_vit 문자열, 다른 phase source, HP NOT_READY, authority/current_main/snapshot 누락 |
| `single_write` | 같은 cohort 재실행 차단, sink 거부 재-dispatch 0, 기존 `_effStats` 위 fresh object (merge 0) |
| `holder_getter` | absent/plan≠current/acked READY/diverged/stale/key order/sink 변조 격리 |
| `retention` | owner 유지, cohort 입력 defensive copy |
| `main_not_ready` | `main_readiness()` NOT_READY, fixture `current_main=false` |
| `missing_bindings` | provider/sink 누락, 미구성 |

fixture cohort 는 `private_fixture_cohort()` / `FixedCohortSupplier` — `authority:"private_fixture"`, `current_main:false`. Main 준비 증명 아님.

## 첫 실행 결과 (Codex isolated, Godot 4.7.2, attempt01)

| 항목 | 값 |
|---|---|
| exit / stderr / SCRIPT ERROR | 0 / 0 / 0 |
| 결과 | **FIRST PASS** — FAIL/INVALID 수리 0, 재실행 0 |
| 범위 | 신규 suite 만. 기존 HP/resource/DEF/shield success suite 반복 실행 0 |
| 의존 | production helper 7개 읽기 전용 (old test 복사·asset·import·GUI·Main 0) |

| group | checks |
|---|---|
| `compose_ready` | 12 |
| `holder_getter` | 8 |
| `lck_admission` | 8 |
| `main_not_ready` | 4 |
| `missing_bindings` | 4 |
| `retention` | 3 |
| `single_write` | 8 |
| `stale_cohort` | 5 |
| `valid_zero` | 3 |
| `wrong_source_kind` | 11 |
| **합계** | **66** (10 groups) |

증명된 것:

- 흐름: 실 공개 HP `plan_initial()` / resource `plan_apply_stats()` 를 private fixture cohort 당 1회 캡처 → composer → `_effStats` sink 1회 → 현재 getter.
- fixture 5필드 값: `str 16 / dex 12 / int 11 / vit 4 / lck 7`, key order `str,dex,int,vit,lck`.
- composer 는 HP/RP plan, level, affix, stat query 를 다시 호출하지 않는다. `_lvB` query baseline 3→3, `_eqAffix` 11→11.
- **주의:** baseline 3 회 `_lvB` 는 fixture 상류 plan 들이 각자 조회한 것(HP 1, resource 1 + `_gritTotal` 1)이다. 원 prefix 의 단일 `_lb=_lvB()` 1회나 단일 17 slot loop 를 증명하지 않는다. 기존 plan 들은 이후 HP/MP/결정 helper 도 조회할 수 있다. 이 query order 동일성은 ENGINE 공통 prefix authority / source call-order binding gap 으로 남는다.

LCK 원 oracle (Node, 원 식 `STATS.lck+_lb` 만, 신규 8 case):

| 입력 | 원 결과 | port |
|---|---|---|
| 0 / null / true / false / float | 기대 숫자 (port 와 일치) | READY 같은 값 |
| `'3'` + 2 | `'32'` (문자열 연결) | NOT_READY `unsupported_js_plus_operand` (0 cast 아님) |
| `''` + 2 | `'2'` (문자열 연결) | NOT_READY `unsupported_js_plus_operand` |

다른 4 stat 의 source oracle 실행 0, 전체 게임 실행 0. STR/DEX/INT/VIT 는 신규 식이 없고, LCK 분기만 `AffixReader.js_to_number` 를 현재 STATS + 캡처된 HP `lv_b` 에 쓴다.

## API 동작 기록 (원 parity 주장 아님)

| 동작 | 실제 API |
|---|---|
| 이미 dispatch 된 cohort 가 sink 거부됨 | 같은 cohort 로 재시도 불가 (`cohort_already_dispatched`). 새 cohort_id 또는 `configure()`/`clear()` 필요 |
| 같은 cohort 재실행 | sink 호출 0, dispatch_count 불변 |
| `current_main` bool / cohort `authority` 라벨 | 형식만 검증. 물리적 Main 증명 아님 — `main_ready` 항상 false |

cohort 단위 1회 정책은 중복 write 를 막기 위한 이 port 의 API 정책이다. 원 applyStats 의 full-update parity 는 주장하지 않는다.

## 한계 / 남은 nonHP Main gap

| gap | owner |
|---|---|
| applyStats prefix 에서 HP `plan_initial` + resource `plan_apply_stats` 를 각 1회 계산·같은 cohort_id 로 캡처하는 SourceRoot (`cohort` provider) | ENGINE |
| 현재 applyStats pass id authority (`current_cohort`) | ENGINE |
| 현재 STATS(str/dex/int/lck) authority | BUILD |
| native Player 의 `_effStats` 저장/읽기 + sink 설치, 이후 HP@28582 phase 로 이어지는 call-site | ENGINE |
| HP/resource 의 `_lvB` 동일성 교차검증 (resource values 에 `lv_b` 미노출) | cohort authority 의존 |
| HP/resource plan 이 각자 `INV`/`_eqAffix` 를 읽음 → 원 단일 for-loop/단일 `_lb` 와의 query order 동일성은 cohort 캡처 시점에 ENGINE 이 보장해야 함 | ENGINE |
| cohort_id + STATS(str/dex/int/lck) snapshot 검사만 수행. INV/PASSIVES/`P.lv`/affix·eqStat 캐시 동일성과 실제 source 호출 순서는 검증하지 않음 — 외부(cohort authority) 신뢰 사실 | ENGINE |
| fixture `_lvB` baseline 3 회는 상류 plan 별 조회 — 원 단일 `_lb` 1회 / 단일 17 slot loop 증명 아님 | ENGINE 공통 prefix authority |
| sink 가 거부한 cohort 는 같은 id 로 재시도 불가 (새 cohort 또는 `clear()`/`configure()`) | API 정책 |
| `SOURCE_NON_FINITE` HP plan(s_str 유한이어도 mhp 비유한) 은 보수적으로 거부 | 후속 |
| string+number JS 연결 미구현 | 후속 |
| Skill/stats 8 소비자 readiness, 전체 applyStats orchestrator | ENGINE |

Keywords: effStats, applyStats, 28570, LCK, cohort, single write, player_effective_stats_source
