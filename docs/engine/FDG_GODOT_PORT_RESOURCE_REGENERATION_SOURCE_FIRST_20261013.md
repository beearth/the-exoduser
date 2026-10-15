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

# FDG Godot Port — resource_regeneration_source FIRST (2026-10-13)

TASK `GODOT-PORT-RESOURCE_REGENERATION_SOURCE-FIRST-20261013`. This module ports the original `updatePlayer` natural ST/MP regeneration as a pure plan plus a single resource sink. It has no clock of its own and never writes directly to Player/World/P/G.

Related docs: [자원리젠+소모공식 §1](../2_1%20스킬관리+합체시스템+자원/자원리젠+소모공식.md) (기본 리젠, 상태별 리젠 배율, 추가 배율).

## Keyword paths

| Path | Role |
|---|---|
| `godot/port_modules/resource_regeneration_source/producer.gd` | plan + single-sink dispatch |
| `godot/port_modules/resource_regeneration_source/test_first.gd` | isolated tests G01–G10 (legacy) + G11–G15 (STRICT) (`--only` / `--report`) |
| `godot/port_modules/regeneration_stat_source/producer.gd` | STRICT rate supplier `read_source_rates()` (read-only dependency; not edited by this repair) |
| `docs/engine/FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md` | this doc |
| R `game.html:33347-33364` | original source (read-only) |
| `godot/scripts/player.gd:231-233` | old native simple ST regen (replacement boundary; not edited) |

## Source expressions

| # | Source (R game.html) | Port | Input |
|---|---|---|---|
| 1 | `_hdMul=_inHolyDome?2:1` (33350) | `hd_mul` | provider `in_holy_dome` → bool |
| 2 | `_mpr=(P.mpR+Σ(slot.mpRegen\|\|0))*pMRegenMul()*_hdMul` (33353) | `_mpr` | state `mpR`; providers `equip_mp_regen`, `mregen_mul` |
| 3 | `_str=(P.stR+Σ(slot.stRegen\|\|0))*pRegenMul()*_hdMul` (33354) | `_str` | state `stR`; providers `equip_st_regen`, `regen_mul` |
| 4 | `!(window._parryLesson?.active&&window._parryLesson.chapter===2)` (33360) | guard → `guard_skip` | guard_context `parry_lesson_active` (bool), `parry_lesson_chapter` (int, required only when active) |
| 5 | idle: `P.st=Math.min(P.mst,P.st+_str/8*sp)` then `P.mp=Math.min(P.mmp,P.mp+_mpr/8*sp)` (33361) | writes[0]=st, writes[1]=mp | state `s, st, mst, mp, mmp` |
| 6 | else: `P.st=Math.min(P.mst,P.st+_str/16*sp)`; `_mpMul=P.s==='beam'?.5:1`; `P.mp=Math.min(P.mmp,P.mp+_mpr/16*_mpMul*sp)` (33362) | same | same |

Slots: `wp sh bt ar hm bw gl pt nc rg1 rg2 cp`. `pRegenMul()=1+PASSIVES.pRegen*.03`, `pMRegenMul()=1+PASSIVES.pMRegen*.03` (28703-28704). The passives owner computes these. This module does not implement them.

`Math.min` is ported as-is: a current value above its cap is pulled **down** to the cap. The +Inf collapse applies **only** to the final update intermediate (`P.st+_str/8*sp`, and likewise for MP). If that overflows to +Inf, `Math.min` clamps it to the finite `mst`/`mmp`. If the computed rate `_mpr`/`_str` is itself non-finite, the tick is rejected with NOT_READY. Scope is finite, authoritative numeric input only. This is not full parity with JS behaviour on malformed values.

## Providers (required — absent ⇒ NOT_READY, never a neutral 1)

| Key | Original | Owner / gap |
|---|---|---|
| `regen_mul` | `pRegenMul()` | passives owner — **gap**: there is no public seam in `player_passives_source` yet |
| `mregen_mul` | `pMRegenMul()` | passives owner — **gap** (same) |
| `equip_st_regen` | `Σslot (x().stRegen\|\|0)` | ROOT equipment — **gap**: `equipment_affix_reader` has no per-slot `stRegen` sum |
| `equip_mp_regen` | `Σslot (x().mpRegen\|\|0)` | ROOT equipment — **gap** (same) |
| `in_holy_dome` | `G._fireZones` holyDome `dst(P,zone)<r` | zone/skill owner — **gap** |

The `||0` fallback applies per slot inside the equipment provider. This module only requires a finite number back.

All five providers are currently **unbound**. No live binding exists, so live readiness is NOT_READY. `in_holy_dome` remains external (zone/skill owner).

> **Superseded note (2026-10-14).** The paragraph above originally said a future `regeneration_stat_source` was "not implemented yet". That supplier now exists, and this module now has a STRICT mode that consumes its exact rate API (next section). The provider table above describes the **legacy aggregate** path only.

## Rate paths: LEGACY aggregate vs STRICT source rates (production repair, 2026-10-14)

The legacy `configure()` computes `(P.base + Σprovider) * mul * hd` (former lines 207/208). That grouping does not follow the original base-first 12-term order `((P.base+t1)+…+t12)*mul*_hdMul`, so the last ulp or the overflow outcome can differ. Example: `P.stR=1e16`, `wp.stRegen=-1e16`, `sh.stRegen=1`, `pRegen=0` gives a source rate of `1` but an aggregate rate of `0`. This repair adds an explicit STRICT path. The legacy path is unchanged and is kept for compatibility.

| Mode (`mode()`, `readiness().mode`, result `mode`/`rate_path`) | Configure | Status |
|---|---|---|
| `unconfigured` | initial / after `clear()` | NOT_READY (`not_configured,…`, legacy-shaped list, unchanged) |
| `legacy_aggregate` | `configure(state_reader, providers5, sink)` | Explicit aggregate/compatibility path. `source_exact:false`. **Not** source-exact and **not** final Main readiness |
| `strict_source_rates` | `configure_source_rates(state_reader, source_rate_reader, in_holy_dome, resource_sink)` | Source-exact rate path. `source_exact:true` |

### STRICT API

```
configure_source_rates(state_reader: Callable, source_rate_reader: Callable, in_holy_dome: Callable, resource_sink: Callable) -> readiness
  state_reader       : ()->current raw P — the SAME reader bound as regeneration_stat_source player_reader
  source_rate_reader : ()->regeneration_stat_source.read_source_rates() result (called exactly once per plan)
  in_holy_dome       : ()->bool (external holy/zone owner)
  resource_sink      : (packet)->bool (same single sink / packet as legacy)
readiness() -> {ready, status, missing[], mode, source_exact}
  strict missing labels: state_reader, source_rate_reader, provider:in_holy_dome, resource_sink
```

- Each configure first calls `clear()`, which drops every binding of the other mode. A local copy of the previous owners keeps them alive until the new owners are retained. RefCounted owners of all four Callables are retained.
- STRICT takes no legacy providers and never evaluates them. It supplies no default values.
- The packet `kind` (`natural_regen`), `source` and `writes` are unchanged. Rich metadata is only on the plan result: `mode`, `rate_path`, `_mpr_pre_holy`, `_str_pre_holy`.

### STRICT per-tick order

1. readiness → `sp` → guard_context validation (same as legacy). On failure, the rate reader, holy and sink are not called.
2. Current raw P is read once. All 7 fields (`s, st, mst, mp, mmp, stR, mpR`) are required and finite, exactly as in legacy. There is no synthetic 0.
3. `in_holy_dome()` (source 33350 `_hdMul`) must return a bool. Otherwise `provider_not_bool:in_holy_dome`.
4. `source_rate_reader()` is called once. Inside the supplier, `_mpr` is evaluated before `_str` (P, INV, PASSIVES each). The result must satisfy the contract below.
5. `_mpr = _mpr_pre_holy * _hdMul`, THEN `_str = _str_pre_holy * _hdMul`. This is the source `(sum*mul)*_hdMul`, with no reassociation. A non-finite product gives `computed_non_finite:_mpr`/`_str`.
6. The shared `_apply_plan` (identical code for both modes) applies the parry-lesson guard after the calculation, then idle `/8`, active `/16`, beam MP `*.5` and the `Math.min` caps (downclamp included). ST is written before MP, with one sink call and one ack.

### STRICT result contract (else NOT_READY, `command`/`packet` null, dispatch 0)

| Check (in order) | Reason |
|---|---|
| not a Dictionary | `source_rates_not_dictionary` |
| `status` missing or not a String | `source_rates_status_missing` |
| `status != "READY"` | `source_rates_not_ready:<status>:<supplier reason>` (precise supplier reason, e.g. `…:NOT_READY:_mpr:PASSIVES_null …`, `…:SOURCE_NON_FINITE:_str:…`) |
| `ready` not `true` (missing / false / non-bool) | `source_rates_contradictory:ready` |
| `value` not a Dictionary | `source_rates_value_not_dictionary` |
| `_mpr_pre_holy` / `_str_pre_holy` missing | `source_rates_value_missing:<key>` |
| either key not a finite number | `source_rates_value_not_finite_number:<key>` |
| `value` has keys other than these two | `source_rates_value_unexpected_keys` |
| `mp` / `st` detail not a Dictionary | `source_rates_detail_missing:mp`/`st` |
| detail status not READY, or detail value ≠ `value` key | `source_rates_contradictory:mp`/`st` |
| detail `base` missing or ≠ this tick's raw `P.mpR`/`P.stR` | `source_rates_base_mismatch:mpR`/`stR` (base zeroing or a different P is rejected) |
| `holy_dome != "external"` | `source_rates_contradictory:holy_dome` |

A valid zero (`P.stR=0`, `P.mpR=0`, bound `equipped:{}`) is READY and dispatches. It is distinct from a missing field or an unbound reader.

**What `readiness().source_exact` means.** `true` means only that the STRICT source-ordered rate path is configured. It does **not** mean:
- live readiness or Main authority;
- full parity with malformed JS values;
- that every source input is bound.

No source Main READY is manufactured anywhere.

### Central binding contract (pending — not done here)

```
helper.configure(passives.read_current_passives, <P reader>, <INV reader>)       # regeneration_stat_source
natural.configure_source_rates(<same P reader>, Callable(helper, "read_source_rates"), <holyDome provider>, <single resource sink>)
```

Remaining central ENGINE work (not done in this unit):
- Bind the actual current Main P authority, i.e. the getter for `s, st, mst, mp, mmp, stR, mpR`, including the MP getter.
- Bind the current PASSIVES seam and the raw INV reader into the supplier.
- Bind the holyDome provider and the parry-lesson guard context.
- Call `advance_native` at the exact source phase: after the holyDome flat regen and HP regen, before `_demonRevCd` (see Phase below).
- Disable or replace the old native ST regen at `player.gd:231-233` **before** the single central call is enabled.
- Leave source costs and resource entry to their other owners.

Until all of that is done, live readiness stays NOT_READY.

## Single phase / sink

| Item | Value |
|---|---|
| Phase | exact source phase inside updatePlayer: AFTER the holyDome flat regen (33352) and the HP regen phase (33356-33358), BEFORE `_demonRevCd` (33366). Reordering is not authorized. The state reader must return current state that already includes those earlier updates |
| Tick | `advance_native(sp, guard_context)`; `sp` = central native60 ticks. Explicit method ticks only: no `_physics_process`/`_process`, no own clock, no global driver |
| Sink | ONE `resource_sink(packet) -> bool`; packet `{kind:"natural_regen", source, writes:[{field:"st",before,value,cap_field:"mst"},{field:"mp",before,value,cap_field:"mmp"}]}` |
| Dispatch | 1 per applied tick; 0 on NOT_READY or guard skip. `applied` is true only when the sink returns `true`; otherwise reason is `sink_rejected` |
| Reads | state reader and all providers are called fresh every tick; nothing is cached or snapshotted |
| Retention | RefCounted owners of the method Callables are held strongly (`_owners`) |

## Readiness

| Condition | Result |
|---|---|
| reader / any provider / sink missing or invalid | `NOT_READY`, `not_ready:<list>` |
| `sp` non-number or non-finite / negative | `sp_invalid` / `sp_negative_unsupported` (the source has no guard; negative `sp` is unsupported, not invented behaviour) |
| guard_context missing or field missing/wrong type | `guard_context_missing` / `guard_field_missing:<key>` |
| state field missing | `field_missing:<f>`. Missing ≠ 0: a valid 0 (`stR=0`, `st=0`, `sp=0`) is READY and dispatches |
| state number NaN/Inf/bool/null/string | `field_not_finite_number:<f>`; `s` non-string → `field_not_string:s` |
| provider non-finite/non-number; holyDome non-bool | `provider_not_finite_number:<k>` / `provider_not_bool:in_holy_dome` |
| `_str`/`_mpr` overflow | `computed_non_finite:_str` / `_mpr` |
| parry lesson active && chapter===2 | READY, command `guard_skip`, dispatch 0 |

## Replacement boundary (central ENGINE handoff — not edited here)

The central binding must use the STRICT `configure_source_rates` path; the legacy aggregate path is not the source-exact replacement. When this producer is bound, `godot/scripts/player.gd` `_physics_process` lines 231-233 (`divisor = 8.0 if state=="idle" else 16.0; stamina = minf(max_stamina, stamina + _stamina_regen_base / divisor * ticks)`) must be **disabled/replaced** by the central call to `advance_native`. Leaving both active would apply regen twice. The native `0.28` `_stamina_regen_base` is a simplified constant. It does not prove the original full-source rate or a neutral alias. The native `hp<=0` early return (player.gd:220) remains the caller's guard.

Excluded (other owners): holyDome flat regen (33352), HP regen (33356-33358), energy-shield regen (33392-33395), stage-5 ST drain (33382-33390), Q/E entry/hold drain/release, potion, hit, save/restore, passive/level effect distribution. These excluded phases keep their original order relative to this one (see Phase above).

## Tests

`godot --headless --path godot -s res://port_modules/resource_regeneration_source/test_first.gd -- [--only=G01,..] [--report=/abs.json]`. With no `--only`, all 15 groups run. Exit 0 = all selected groups PASS, 1 = FAIL, 2 = INVALID (aborted group / zero checks / bad args / report write failure). Fixture providers (`pRegen`/`pMRegen` from fixture PASSIVES) are test-only. They are not live readiness, and global frame cost is unmeasured.

### Result (first valid run)

The first unique run of G01–G10 passed every group: **291 checks**, exit 0, FAIL 0, INVALID 0, SCRIPT ERROR / unexpected output 0. No product or test repair was needed, no successful run was repeated, and no older suites were run.

| Group | Checks | Status |
|---|---|---|
| G01 source_literals | 7 | PASS |
| G02 missing_binding_not_ready_no_dispatch | 68 | PASS |
| G03 missing_field_vs_valid_zero | 65 | PASS |
| G04 idle_active_beam_divisors | 9 | PASS |
| G05 math_min_cap_including_downclamp | 6 | PASS |
| G06 parry_lesson_chapter2_guard | 26 | PASS |
| G07 holy_dome_mul_order_and_current_providers | 6 | PASS |
| G08 non_finite_inputs_not_ready | 85 | PASS |
| G09 isolated_sink_consumption_and_retention | 11 | PASS |
| G10 no_own_clock_explicit_ticks | 8 | PASS |

Scope of this result:
- It is a headless, pure test using explicit fixtures and explicit method ticks.
- SceneTree global signals were not instrumented.
- The producer is a RefCounted with no automatic physics/process/render/clock.
- It is not proof of assets (imports: 0), public pixels, GPU, or live readiness.

**Historical, not upgraded.** The G01–G10 result above (10 groups, 291 checks) was measured on the pre-repair producer bytes. It was **not** re-run after the STRICT repair and is not claimed for the current bytes. Per the executor, the G01–G10 function bodies in the current `test_first.gd` were compared to the originals and are byte-equal. They were compared, not executed.

### STRICT repair tests G11–G15 (2026-10-14) — first run: all PASS

These are new groups appended to the same `test_first.gd`. The G01–G10 bodies and their fixtures (`Holder`, `Prov`, `Freeable`, `_state`, `_providers`, `_make`) are unchanged. The real chain is:

`player_passives_source` current seam → `regeneration_stat_source.read_source_rates()` → natural STRICT → one isolated writable sink.

The same `SHolder.read` is bound as both the natural `state_reader` and the supplier `player_reader`. The fixtures produce no rates. `SAuthority`/`SHoly`/`SHolder` record call labels only. `RateTap` is a read-only pass-through that returns the production result object unchanged. `ShapeReader` is used only in G13, for single-field mutations of a real production result.

| Group | Checks | Status | Covers |
|---|---|---|---|
| G11 strict_ieee_source_order_rate_not_aggregate | 28 | PASS | `P.stR=1e16`, `wp.stRegen=-1e16`, `sh.stRegen=1`, `pRegen=0`: the STRICT `_str` is 1 and the actual ST packet increment is `1/8`. The supplier base equals the raw `P.stR`/`P.mpR`, with no base zeroing. The grouped legacy result of 0 is a contrast inside this new test, not a delivery of the old suite |
| G12 strict_query_order_single_rate_call_dome_after | 42 | PASS | Callback log `P, holy, rates>, P, INV, PAS, P, INV, PAS, <rates, sink`: source 33350 flag before 33353–33354. One rate call per plan, no legacy wrapper evaluated, `*_hdMul` after pre-holy (finite pre × 2 → `computed_non_finite:_mpr`), ST then MP in one packet. On an `INV.equipped` null failure, MP is evaluated and ST is never reached |
| G13 strict_preflight_shape_authority_not_ready | 330 | PASS | preflight (`sp`, guard, all 7 raw P fields) calls no rate reader or holy. Covers unbound bindings, 26 malformed-shape fixtures, holy non-bool, a real supplier `SOURCE_NON_FINITE`, valid-zero READY, and PASSIVES authority loss (next dispatch 0, then live restore) |
| G14 strict_guard_caps_divisors | 20 | PASS | chapter-2 lesson: rates are computed, then `guard_skip` with 0 writes. chapter 1 applies. Checks `/8`, `/16`, beam `*.5` and the `Math.min` cap/downclamp on the STRICT branch |
| G15 strict_mode_switch_clear_retention | 38 | PASS | legacy↔strict switching drops obsolete bindings (weakref owners are released and legacy providers are not called in strict). `clear()` → `unconfigured`. Full-chain retention through the natural owners |

The 26 malformed-shape fixtures are single-field mutations of an actual production `read_source_rates()` result. They are not a successful proof of Main with faked rates.

Command (selection of new groups only):

```
godot --headless --path godot -s res://port_modules/resource_regeneration_source/test_first.gd -- --only=G11,G12,G13,G14,G15 [--report=/abs.json]
```

**Result (first and only attempt, reported by the executor):**
- All 5 groups PASS, **458 unique checks**.
- exit 0; FAIL 0, INVALID 0, SCRIPT ERROR / unexpected output 0.
- Test repairs 0. Product repairs during testing 0. Successful runs repeated 0.
- Executions of old G01–G10 0. Executions of the regeneration_stat_source suite 0.

Claude wrote the tests. Codex ran them as the isolated executor, and Claude did not observe the run.

Scope of this result:
- **Executed bytes.** The owned new code and test were copied in isolation, together with 4 read-only production dependencies: `regeneration_stat_source`, `player_passives_source` and `equipment_affix_reader`, plus this module's producer. The test script contains the historical G01–G10 bodies, which were excluded by `--only`.
- **Not run or touched.** There were no separate old-test copies or executions. Nothing involved assets, fonts, imports, GUI, native physics/render, public pixels, or GPU/FPS.
- **Kind of test.** These are explicit RefCounted API calls. SceneTree global frames are not instrumented.
- **No changes to:** public clock, MP getter, human input, save, server, shared Player, or Git.

### Provenance (STRICT repair unit)

| Item | Value |
|---|---|
| Author | Claude Code CLI, PID 9168 |
| Session | `677a65af-047c-43bb-b3b2-f2b606d0dfc4` |
| Model | `claude-opus-5-5`, default, no override |
| Permission mode | dontAsk / restricted, denials 0 |
| Test execution | Codex, isolated executor |
| Production repair | natural producer: STRICT API, result validation, shared `_apply_plan` |
| Test change | natural `test_first.gd`: 5 new groups added |
| Docs | this doc + the regeneration_stat_source doc |
| Supplier | `regeneration_stat_source` production code and test unchanged |

### Checkpoint

The original change touched only this doc plus the two module files. The STRICT repair (2026-10-14) touches this doc, `producer.gd` and `test_first.gd`, plus the `regeneration_stat_source` doc (status only). The `regeneration_stat_source` code and tests are unchanged. There are no shared doc, Git, World or Player changes. The normal code and docs checkpoint is done by central ENGINE, which receives every keyword-matched path above as delivered metadata. The `2_3` docs are immutable and were not touched.
