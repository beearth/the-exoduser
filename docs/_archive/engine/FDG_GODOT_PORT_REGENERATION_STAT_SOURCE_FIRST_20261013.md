## 중앙 회복 phase 최초 연결 — 2026-10-14

원 dispatcher와 실제 Player/World/SourceResourceAuthority가 presence→영역HP→MP→ST→rates 사전계산→자연HP→자연ST→MP를 실제 Tree에서 소비했다. 첫6그룹88 clean PASS이며 원 helper 성공 검사 재연0이다. 이 실행의 G/INV/PASSIVES/hpR/lesson/init witness는 명시 constructor fixture다. 실제 Main 시작 장비25·파생HP/MP/ST·전체초기화는 아직 미완이다. 최신 API·clock·null/lifecycle·검증 한계는 docs/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md 및 FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md가 현재 중앙 상태다. 아래 독립 source 테스트 이력과 수치는 보존한다.

## ENGINE actual resource regeneration binding - 2026-10-14

The new optional binding uses the SAME Player and World. It replaces the partial ST-only branch after binding and consumes World dt_sp/frame/ens once. Missing actual MP/base rates/current G/source phase rejects binding. Constructor fixture providers do not establish production Main authority. The previous .28 ST base stays only for an unbound Player; provider loss after binding never revives that fallback.

| Public API / value | Contract |
|---|---|
| Player.bind_native_resource_regeneration(adapter) | Same Player/World, five required methods, exact bool readiness, single persistent binding |
| Player.get_native_resource_regeneration_snapshot() | Deep copy of adapter snapshot plus persistent bound flag; unavailable adapter reports ready=false and bound |
| World.bind_native_player_resource_regeneration(adapter) | Existing ready World player only; no new actor/input/clock |
| ExoduserNativeResourceRegenerationAdapter.configure | Actual authority state s/st/mst/mp/mmp/stR/mpR; source rate supplier and holyDome supplier; lesson and exact source-phase readiness callbacks |
| Source rate / sink | Strict base-first 12-slot MP then ST rates; holy multiplier 2 or 1 once; idle /8, other /16, beam MP x0.5; source ST then MP ordered single atomic packet, including cap downclamp |
| Native clock / exclusions | Actual World dt_sp/frame/epoch/ens identity, duplicate/pause/lifecycle rejection. Dead Player skips regen. Chapter2 lesson skips writes. No HP/holy flat/QE/potion/save changes |
| Integration proof | 7 unique groups / 170 clean checks: first5/139, repaired clock13, repaired provider-loss18. Actual checks219 across 3 attempts; initial FAIL1 and SCRIPT_ERROR2/6 preserved. Clean success groups and old source suites rerun0 |
| Main / visual | Actual MP/current G and holyflat->rate precompute->HP->STMP phase unadopted. Constructor witness is not full source-phase proof. Main/character/pixel/240FPS remain unproven; VISUAL RETOUCH |

Exact contracts and first runtime evidence: [Resource regeneration binding SSOT](FDG_GODOT_RESOURCE_REGENERATION_BINDING_20261014.md).

---

# FDG Godot Port — regeneration_stat_source FIRST (2026-10-13)

TASK `GODOT-PORT-REGENERATION-STAT-SOURCE-FIRST-20261013`. This is a standalone production provider for four inputs: the original `pRegenMul()`, `pMRegenMul()`, and the 12-slot direct equipment `stRegen` and `mpRegen` sums. These are the four inputs that the completed `resource_regeneration_source` listed as provider gaps. The module also exposes the original left-to-right pre-holy `_mpr`/`_str` rates as a central exact seam.

Related docs: [자원리젠+소모공식 §1](../2_1%20스킬관리+합체시스템+자원/자원리젠+소모공식.md) ("장비 어픽스: stRegen, mpRegen 별도 가산", "패시브: pRegenMul(), pMRegenMul() 곱연산"), [resource_regeneration_source FIRST](FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md).

## Keyword paths

| Path | Role |
|---|---|
| `godot/port_modules/regeneration_stat_source/producer.gd` | provider (RefCounted, no clock, no writes) |
| `godot/port_modules/regeneration_stat_source/test_first.gd` | isolated tests G01–G10 (`--only` / `--report`) |
| `docs/engine/FDG_GODOT_PORT_REGENERATION_STAT_SOURCE_FIRST_20261013.md` | this doc |
| R `game.html:17020-17032` | slot getters (read-only) |
| R `game.html:28703-28704` | `pRegenMul` / `pMRegenMul` |
| R `game.html:33353-33354` | `_mpr` / `_str` consumer expressions |

Rules for these paths:
- Search: the full allowed search goes through central ENGINE.
- `2_3` docs are protected. This module does not edit them.
- Checkpoints for normal code and docs are made by central. This module does no Git operations.

## Status

- **Complete as a standalone source module.** It reads the actual current PASSIVES, INV and P through callbacks, computes the exact 12-slot terms, and exposes the 4 natural-module wrappers.
- **Real consumer proven in a test.** G09 (25 checks) runs the completed natural module into one isolated state sink.
- **Pending (central):** binding into the full current Main, holyDome and Player, i.e. the central replacement.
- **Known path difference, kept visible.** The natural module's legacy `configure()` path groups the sum as base + Σ. That differs from the original base-first order. The exact rate API (`read_source_rates`) is the seam for the central replacement.
  - No current code was edited to hide this difference.
  - No claim of exact handling for all malformed JS values is made.
- **Natural STRICT consumer added (2026-10-14, production repair in `resource_regeneration_source`).** `natural.configure_source_rates(P reader, Callable(helper, "read_source_rates"), holyDome, sink)` consumes `read_source_rates()` once per plan. It validates the exact result shape (`ready`/`status`/`value{_mpr_pre_holy,_str_pre_holy}`/`mp`/`st`/`holy_dome:"external"`), checks that each detail `base` equals the raw current P field, and then applies `*_hdMul`. This module's code and tests were **not** changed for that repair; the existing API was sufficient. The new chain is current PASSIVES seam + raw INV/P → `read_source_rates()` → natural `configure_source_rates` → one isolated sink. The natural module's new G11–G15 passed on the first attempt: 5 groups, 458 unique checks, exit 0, FAIL/INVALID/script error 0. Codex ran them as the isolated executor, with this module copied read-only. See [resource_regeneration_source FIRST](FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md#rate-paths-legacy-aggregate-vs-strict-source-rates-production-repair-2026-10-14).
- **Failures are never neutral values.** `SOURCE_NON_FINITE` and `NOT_READY` never stand in for 1 or 0. The restrictions on arrays, prototypes, getters and long numeric strings are listed below.

## Provenance

| Item | Value |
|---|---|
| Author | Claude Code, initial PID 5808 |
| Session | `2417c6c9-ae9a-4ace-a7ba-6cad41bfe2eb` |
| Model | `claude-opus-5-5`, configured, no override |
| Fixture resumes | 8686, 8823 |
| Permission denials | none |
| Test execution | Codex, isolated |

**Scope exception, recorded as it happened.** During the first Claude turn, two files of the completed natural module were read read-only, for reference only:
- `resource_regeneration_source/test_first.gd`, lines 1–269, to match the fixture style;
- its doc header, lines 1–40.

They were not executed, copied or edited, and there were no further reads after that turn.

Read-only production dependencies:
- `equipment_affix_reader`: only the static `js_truthy`, the `JS_SAFE_INTEGER_MAX` constant, and `js_to_number` on a private unbound instance. No cache, `_eqAffix`, or private member is accessed.
- `resource_regeneration_source`: only the provider key constants.
- No file other than the three listed above was created or edited.

## Source table

| # | Source (R game.html) | Port |
|---|---|---|
| 1 | `pRegenMul(){return 1+PASSIVES.pRegen*.03}` (28703) | `read_regen_mul()` / `regen_mul()` |
| 2 | `pMRegenMul(){return 1+PASSIVES.pMRegen*.03}` (28704) | `read_mregen_mul()` / `mregen_mul()` |
| 3 | `Σ12 (x().stRegen\|\|0)` inside 33354 | `read_equip_st_regen()` / `equip_st_regen()` (starts at 0) |
| 4 | `Σ12 (x().mpRegen\|\|0)` inside 33353 | `read_equip_mp_regen()` / `equip_mp_regen()` (starts at 0) |
| 5 | `(P.mpR+…12…)*pMRegenMul()` then `(P.stR+…12…)*pRegenMul()` (33353→33354, without `*_hdMul`) | `read_source_rates()` → `{_mpr_pre_holy, _str_pre_holy}` |

## 12-slot mapping (exact order of 33353/33354)

| # | Getter (line) | `INV.equipped.` key |
|---|---|---|
| 1 | `wp` (17020) | `weapon` |
| 2 | `sh` (17021) | `shield` |
| 3 | `bt` (17022) | `boots` |
| 4 | `ar` (17023) | `armor` |
| 5 | `hm` (17024) | `helmet` |
| 6 | `bw` (17025) | `bow` |
| 7 | `gl` (17026) | `gloves` |
| 8 | `pt` (17027) | `pants` |
| 9 | `nc` (17029) | `necklace` |
| 10 | `rg1` (17030) | `ring1` |
| 11 | `rg2` (17031) | `ring2` |
| 12 | `cp` (17032) | `cape` |

Not read: `belt` (the `blt` getter at 17028 exists, but 33353/33354 do not use it), `bracelet`, `headband`, `ossuary`, `headband2`.

The 12-slot table is not the 17-entry `SLOT_NAMES` and not the `_eqAffix` affix cache. An affix whose `id` is `"mpRegen"` does not contribute to the sum; only the item's direct `.stRegen`/`.mpRegen` property does. Iteration follows the source slot order, not the order of `Dictionary` insertion.

## API

```
configure(passives_reader: Callable, player_reader: Callable, inventory_reader: Callable) -> readiness Dictionary
  passives_reader : ()->current PASSIVES Dictionary | null   (intended: player_passives_source.read_current_passives)
  player_reader   : ()->current P Dictionary (reads mpR, stR only)
  inventory_reader: ()->current INV Dictionary — same reader that equipment_affix_reader.configure() takes
readiness() -> {ready, status, missing[], requires{api:[readers]}}     # binding check only, no calls
read_regen_mul / read_mregen_mul / read_equip_st_regen / read_equip_mp_regen / read_source_rates
  -> {ready, status, reason, value, …detail}
regen_mul() / mregen_mul() / equip_st_regen() / equip_mp_regen() -> float   # READY value, else NAN
natural_providers() -> {regen_mul, mregen_mul, equip_st_regen, equip_mp_regen}: Callable
last_result(api := "") -> Dictionary copy
clear()
```

Status values:
- `READY`
- `NOT_READY`: a binding or shape problem. `value` is null.
- `SOURCE_NON_FINITE`: the original expression yields NaN or ±Infinity. `value` is null and `source_value` holds the NaN/Inf.

Owners: `configure` keeps strong references to the RefCounted owners of all three Callables. The completed natural module in turn keeps a strong reference to the helper through the `natural_providers()` Callables.

## Current authority vs boot / fallback

- **PASSIVES**: read through the actual current seam, `player_passives_source.read_current_passives()`, on every call. If that seam returns null, the result is `NOT_READY "PASSIVES_null"`; the exact cause is in `player_passives_source.current_status()`. Unbound PASSIVES is **not** treated as the source boot zero (@28300). This module uses no `derive_restore*` or boot claim.
- **INV**: the raw current INV, read on every call. The module reproduces only the 12 getters `INV.equipped.<slot>||{}`.
  - Unbound reader, `INV` null or non-dict, `INV.equipped` undefined or null (a source TypeError), or non-dict → `NOT_READY`.
  - A bound empty `equipped` map `{}` → `READY 0` (the source `||{}` default). This is distinct from the unbound case.
- **P**: `P.mpR` / `P.stR` must be a finite-or-infinite number (int within safe range, or float). Missing → `P.<f>_missing`. Any other type → `NOT_READY`, because the source would concatenate or coerce.
- **No cache**: each API calls only the readers it needs, every time it is called. It does not call all three on every call.
  - `regen_mul` and `mregen_mul` read PASSIVES only.
  - `equip_*_regen` reads INV only.
  - `read_source_rates()` reads P, INV and PASSIVES once per expression: twice each, `_mpr` first, then `_str`.

  Test G10 counts these reads.

## Readiness and coercion rules

### PASSIVES value (`x*.03`, ToNumber)

| Raw | Result |
|---|---|
| missing key (undefined) | NaN → `SOURCE_NON_FINITE` |
| `null` / `false` / `""` / whitespace | 0 → `1.0` |
| `true` | 1 → `1.03` |
| numeric string (decimal / hex / bin / oct) | StringToNumber via `equipment_affix_reader.js_to_number` |
| finite number (negative or large included) | authoritative, e.g. `-40` → `1+(-40)*.03` READY |
| `"abc"`, `"Infinity"`, `INF`, `NAN` | `SOURCE_NON_FINITE` |
| int with absolute value above 2^53−1 | `NOT_READY …_unsafe_integer` |
| Dictionary / Array / Object | `NOT_READY …_unsupported_shape` (no prototype or `valueOf` parity claimed) |

### Equipment term (`x().prop||0`, then `+`)

| Slot or property | Result |
|---|---|
| slot missing, or falsy (`null`, `false`, `0`, `NaN`, `''`) | `{}` → term 0 |
| truthy primitive or Array slot (`true`, `5`, `"sword"`, `[]`) | `.prop` is undefined → term 0 |
| Object slot (not Dictionary) | `NOT_READY …_unsupported_slot_shape` |
| property missing, or falsy (`null`, `false`, `0`, `-0`, `NaN`, `''`) | 0 |
| `true` | +1 (numeric addition) |
| finite number, or ±Infinity | added as-is. A non-finite final sum → `SOURCE_NON_FINITE` |
| truthy String | `NOT_READY …_string_concatenation_unsupported`. The string is **not** converted with `Number()`, because the source concatenates. |
| Dictionary / Array / Object | `NOT_READY …_object_addition_unsupported` |
| int with absolute value above 2^53−1 | `NOT_READY …_unsafe_integer` |

Scope that is explicitly not claimed:
- JS prototype or getter properties, cyclic objects, and `valueOf`/`toString` hooks.
- Correctly rounded parsing of very long decimal strings: `String.to_float` is used through the shared helper.
- Hex, binary or octal strings above 2^63.
- `StringName` vs `String` key aliasing.

## Float grouping boundary and central exact binding

The source accumulates left to right from the P base: `((((P.mpR+t1)+t2)+…)+t12)*mul*_hdMul`.

The completed `resource_regeneration_source` computes `(P.mpR + equip_sum) * mul * hd`. Feeding it `equip_*_regen()`, which computes `0+t1+…+t12`, groups the terms differently. This can change:
- the last ulp. G07 example: `P.mpR=2^53`, `t1=t2=1`. The source gives `2^53`; the grouped form gives `2^53+2`.
- overflow behaviour. G07 example: `P.mpR=-1e308`, `t1=t2=1e308`. The source result is finite; the equipment-only sum overflows, so the wrapper returns NaN and the natural module reports NOT_READY.

**Bit-equivalence with the source is not claimed for the natural-provider path.** For ordinary representable values (G09) the two paths are equal. The completed natural module was not edited.

Exact seam: `read_source_rates()` returns the source-ordered pre-holy values, `_mpr` before `_str`. Central code applies `_mpr = _mpr_pre_holy * _hdMul` and `_str = _str_pre_holy * _hdMul`, which matches the source's left-to-right `(sum*mul)*_hdMul`. This module never computes `_hdMul`, `_inHolyDome` or zone state.

Evaluation order inside `read_source_rates()`:
- If `_mpr` is `NOT_READY` (for example, an `INV.equipped` TypeError), `_str` is not evaluated (`st: null`). This mirrors the source throwing at 33353.
- If `_mpr` is `SOURCE_NON_FINITE`, `_str` is still evaluated and reported, but the overall status is the first non-READY in source order and `value` is null.

## Binding into the natural module

### STRICT (source-exact; the intended central binding)

```
helper.configure(passives.read_current_passives, <P reader>, <INV reader>)
natural.configure_source_rates(<same P reader>, Callable(helper, "read_source_rates"), <external holyDome provider>, <single resource sink>)
```

- `natural_providers()` is not used here, and the four scalar wrappers are not evaluated.
- Any non-READY `read_source_rates()` result becomes natural `NOT_READY source_rates_not_ready:<status>:<reason>` with dispatch 0. The precise supplier reason is carried through.

Still pending in central ENGINE:
- the actual current Main P/MP getter, including `mst`, `stR` and `mpR`
- the current PASSIVES and INV binding
- the holyDome provider and guard context
- the exact phase: after the holyDome flat regen and HP regen, before `_demonRevCd`
- disabling or replacing the old native ST regen at `player.gd:231-233` before the single call is enabled

No source Main READY is claimed. `readiness().source_exact` on the natural module marks only the STRICT ordered path.

### LEGACY aggregate (compatibility only; not source-exact, not final Main readiness)

```
var provs := helper.natural_providers()
provs[NaturalRegen.PROVIDER_IN_HOLY_DOME] = <external readonly holyDome provider>   # holy owner
natural.configure(<P state_reader>, provs, <single resource sink>)
```

- If any helper result is non-READY, the wrapper returns `NAN`. The completed `_num` finite guard then produces `provider_not_finite_number:<key>`, the result is NOT_READY, and nothing is dispatched (G09).
- The natural module reads providers in the order `equip_mp_regen`, `mregen_mul`, `equip_st_regen`, `regen_mul`, so the first failing key in that order is the one reported.
- The exact helper status and reason remain in `helper.last_result(api)`.

## Explicitly outside this module

The following belong to other owners and are not performed here:
- clock, process or physics hooks; writes to resources or any shared field
- holyDome / zone, the HP or shield regeneration lines, recovery entry, QE, potions
- save, passive growth, level clock, and edits to Player/World/body
- Git operations

## Production vs test proof

| Claim | Kind |
|---|---|
| source expressions, 12-slot table, coercion rules | production code + this doc (hand-derived from R lines above) |
| current-read / no stale cache, same INV as `equipment_affix_reader.read_shield()`, affix cache untouched | test G03 |
| exactly 12 slots, 5 excluded, slot order (2^53 float order probe) | test G01/G04 |
| missing/falsy/coercion/overflow | test G05/G06 |
| source-ordered rates, grouping/overflow boundary, mp→st order | test G07 |
| wrappers NaN on failure, owner retention | test G08 |
| binding through completed `resource_regeneration_source` with an external read-only holy provider and one isolated sink | test G09 |
| no clock, no writes, fresh read counts | test G10 |

Claude wrote the tests and did not run them. Codex ran them in isolation and reported the results below. Claude did not observe these runs; they are recorded here as reported.

### Run history

| Attempt | Selected | Result |
|---|---|---|
| 1 | all | **INVALID, 0 groups, 0 checks.** Parse error in G10: `hp is Node` on a variable statically typed as the RefCounted `PRODUCER`. Shell exit 0 — **not** a PASS. |
| — | — | Fixture fix 1: the reference was widened to `Object` before the `is Node` check. |
| 2 (first valid) | G01–G10 | 363 checks. All groups PASS except G05, which failed 1 of its 72 checks (fixture error, see fix 2). |
| — | — | Fixture fix 2: G05 "max safe int" expected `9007199254740991.0`, a decimal float literal that Godot parses as `9007199254740990`. It now expects `float(9007199254740991)`. The producer value was correct. |
| 3 | G05 only | PASS, 72 checks, exit 0. FAIL, INVALID, script errors and unexpected results: 0. |

Checks per group in attempt 2:

| Group | Checks | Result |
|---|---|---|
| G01 | 12 | PASS |
| G02 | 75 | PASS |
| G03 | 27 | PASS |
| G04 | 34 | PASS |
| G05 | 72 | 1 fixture FAIL → retried PASS |
| G06 | 54 | PASS |
| G07 | 27 | PASS |
| G08 | 21 | PASS |
| G09 | 25 | PASS |
| G10 | 16 | PASS |

Totals:
- **Unique checks that passed:** 363 (10 groups). Checks executed: 435 = 363 + 72 (the G05 retry). The invalid attempt 1 ran 0 checks.
- **Repairs:** 0 to the producer, 2 to the fixture.
- **Not re-run:** the 9 groups that passed in attempt 2, the existing suites of completed modules, and the full set of 10 groups after the G05 fix.
- **Historical, not upgraded.** This run history (10 groups, 363 checks) predates the natural STRICT repair (2026-10-14). The repair did not change this module's bytes, and no new run of this suite was made or is claimed. The natural G11–G15 PASS uses this module as a read-only dependency. It is recorded in the natural doc and is not counted here.

### What the runs measure, and what they don't

- Per the executor, the final bytes of the code and test equal the isolated copy that was run.
- The seven Node source-oracle results are seven independent vector observations local to the source. They do **not** count as full native parity.
- Nothing else was measured: no assets, fonts, imports, public pixels, GPU or FPS.
- The tests make explicit method calls on pure RefCounted objects. SceneTree global frames are not instrumented.

Test fixture rules:
- The fixture uses only fixture-local RefCounted authorities and imports the production `resource_regeneration_source`, `player_passives_source` and `equipment_affix_reader` read-only.
- It uses no assets, fonts, imports or GUI. The existing tests of the completed modules are neither run nor copied.

Command line:

```
godot --headless --path godot -s res://port_modules/regeneration_stat_source/test_first.gd -- [--only=G01,G07] [--report=/abs.json]
```

Exit codes: `0` all selected groups PASS, `1` any FAIL, `2` INVALID (bad args, unknown group, a group that aborted or made zero checks, or a report write failure). `--only` de-duplicates IDs, so it can be used to retry a subset. The JSON report contains `selected/pass/fail/invalid/complete/groups[{id,name,status,checks,fails}]`.
