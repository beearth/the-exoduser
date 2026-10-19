## 중앙 회복 phase 최초 연결 — 2026-10-14

원 dispatcher와 실제 Player/World/SourceResourceAuthority가 presence→영역HP→MP→ST→rates 사전계산→자연HP→자연ST→MP를 실제 Tree에서 소비했다. 첫6그룹88 clean PASS이며 원 helper 성공 검사 재연0이다. 이 실행의 G/INV/PASSIVES/hpR/lesson/init witness는 명시 constructor fixture다. 실제 Main 시작 장비25·파생HP/MP/ST·전체초기화는 아직 미완이다. 최신 API·clock·null/lifecycle·검증 한계는 docs/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md 및 FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md가 현재 중앙 상태다. 아래 독립 source 테스트 이력과 수치는 보존한다.

# FDG Godot Port — HP Regeneration Source (first) — 2026-10-13

TASK `GODOT-PORT-HP-REGENERATION-SOURCE-FIRST-20261013`

- Producer: `godot/port_modules/hp_regeneration_source/producer.gd`
- Test: `godot/port_modules/hp_regeneration_source/test_first.gd`
- This doc: `docs/engine/FDG_GODOT_PORT_HP_REGENERATION_SOURCE_FIRST_20261013.md`
- Scope: `SCOPE = {main_ready:false, public_play:0, owns_clock:false}`. This module does not make Main ready and is not used in public play. Exact raw-HP math here does not complete full Main, live Player, or World integration.

## 0. Validation history

### Results across versions (precise; not a whole-9-group final PASS claim)

| Version | Run | Scope | Checks | Result |
|---|---|---|---|---|
| v1 finite-guard | 1st | 8 groups | 93 | exit 1, script errors 0. 7 groups PASS, `coercion_defaults` 1 fixture FAIL |
| v1 finite-guard | retry | `--only=coercion_defaults` | 16 | PASS, exit 0, FAIL/INVALID/script errors 0 |
| v2 source-guard | 1st | `--only=source_nonfinite_rate_guard` | 11 | PASS, exit 0, FAIL/INVALID/script errors 0 |

- **Unique checks across versions:** 9 groups / 104 checks PASS (v1 93 + v2 11). This is history across two code versions. **The current v2 code has not been run as a whole 9-group suite.**
- **Executed checks in total:** 120 (v1 109 + v2 11).
- **After v2:** the old 8 groups (93 checks) and `coercion_defaults` (16 checks) were **never re-run**. In the v2 code, `coercion_defaults` has one changed expectation (overflow now caps to `mhp`) for code/test coherence. Its v1 PASS was against the v1 expectation, and the changed check has not been executed.
- **Repairs:**
  - Product: 1 source-guard repair, made because of the review. None was made during the new test run.
  - Fixture: v1 had 1, and v2 has 0 after its run.
- **Unchanged from v1:** source query order, guard, cap, phase, source providers, and the public API. The new group only adds read-only checks for the new branch.
- **Provenance:**
  - Same Claude session and model as v1: PID 10917, session `5224666f-b40b-42b9-bf86-767a0d3727f1`, `claude-opus-5-5`.
  - Source-guard resume: PID 12858.
  - v2 executor: a new headless Codex run, isolated to v2 only.
- **Saved proofs:** the old proofs and manifests remain saved as `version1-finite-guard` and `before-source-guard-repair`.
- **Pending:** Codex will verify, after this doc, that the final producer and test bytes match the isolated v2 tested copy.
- **Scope:** v2 is **not** full source or malformed-JS parity, and **not** Main ready.

### v2: source-guard product repair (current code). New branch PASS (11/11)

- **What a final source-guard review found:** v1 rejected any computed non-finite `_hpr` with `NOT_READY`. That included `+Inf` produced from fields and provider values that are all finite. The original `if(_hpr>0&&…)` + `Math.min(mhp,…)` caps a `+Inf` rate to `mhp` when `sp>0`. This is valid overflow from finite inputs, not malformed JS.
- **Producer repair:** the blanket `_hpr` finite rejection is removed. The source comparison now decides:
  - `+Inf` → write, capped to `mhp`;
  - `-Inf` → `guard_skip` with reason `_hpr<=0`;
  - `NaN` → `guard_skip` with reason `_hpr_NaN`.

  Validation and missing-input `NOT_READY` behaviour for required state and provider values are unchanged.
- **Residual invalid-output protection (kept):** if `hp + _hpr/div*sp` is NaN before `min` (`+Inf * sp=0`), the result is `NOT_READY new_hp_NaN` and nothing is written. The original would assign `P.hp=NaN`. This deliberate scope bound is the only remaining divergence on this path. It is not full malformed-JS parity.
- **Test coherence:** the single obsolete assert in `coercion_defaults` ("overflow hpr NOT_READY") now expects `READY` + a write capped to `mhp`. This is a code/test coherence update, and that group is **not re-run**.
- **New 9th group `source_nonfinite_rate_guard`** (11 checks) runs on the real chain:
  - finite `hpR=1e308`, pRegen 2, holy true, lifeHealPow .2, pAbund 1, pPred 3 → `+Inf` → one sink write of `mhp` at `sp=1`;
  - full HP → no sink;
  - `hpR=-1e308` → `-Inf` → `guard_skip`;
  - `pAbund=-20` with HP above 30% → last factor 0 → `Inf*0=NaN` → `guard_skip`;
  - `+Inf*sp0` → `NOT_READY`, no NaN write;
  - counters.

  **Status:** first run of `-- --only=source_nonfinite_rate_guard` passed 11/11 with exit 0.

### v1: prior finite-guard (historical snapshot, superseded for the computed-non-finite branch)

Codex was the isolated executor. Results as Codex reported them:

| Run | Scope | Result |
|---|---|---|
| 1st | all 8 groups, 93 checks | exit 1, 0 script errors. 7 groups PASS. `coercion_defaults` 1 FAIL (`overflow hpr NOT_READY`) |
| retry | `--only=coercion_defaults`, 16 checks | PASS, exit 0, FAIL 0, INVALID 0, script errors 0 |

- **Unique checks:** 93, all PASS. **Executed checks:** 109 (93 + 16).
- The successful 7 groups were not re-run. The whole 8-group set was not re-run after the fix. No old success suite was run.
- **Repairs:** product 0, fixture 1. The original fixture input `1e308*1.06*1*1.2*1.35 ≈ 1.7172e308` is finite (< 1.79769e308). So the producer correctly wrote `mhp`, and the expected `NOT_READY` was wrong. The single added fixture line `fx.holy = true` brings in the real ×2 multiplier, so the rate overflows to Inf. That line is legitimate state set between calls.
- **Per-group counts:** the first report gave only the aggregate 93, with no count per group. The figure of 77 checks for the 7 passing groups is derived (93 − 16). It was not measured per group.
- The other 7 groups were unchanged. Codex will check, after this doc is finalized, that the final producer and test bytes match the tested copy.
- **Provenance:**
  - Claude worker: PID 10917, session `5224666f-b40b-42b9-bf86-767a0d3727f1`, init model `claude-opus-5-5`, no override, `dontAsk`/restricted, 0 denials.
  - Fixture fix: PID 11791.
  - Writes went to exactly the 3 paths above. Old tests read: 0.
- **Independent oracle:** Codex saved 10 Node observations from an HP-source-local oracle. They are not full native byte parity. No old oracle, script, hash, or source16 was re-run.
- **Not instrumented:** global SceneTree frames. **Not covered:** assets, fonts, import, GUI, public pixels, GPU, FPS.

## 1. Source (canonical `game.html`, read-only)

| Line | Source |
|---|---|
| 28709 | `pAbundRegen(){return (PASSIVES.pAbund\|\|0)*.05}` |
| 28711 | `pPredRegen(){return P.hp<=P.mhp*.3?(PASSIVES.pPred\|\|0)*.10:0}` |
| 33356 | `const _hpr=(P.hpR\|\|0)*pRegenMul()*_hdMul*(1+_eqAffix('lifeHealPow'))*(1+pAbundRegen()+pPredRegen());` |
| 33357 | `const _regenDiv=P.s==='idle'?8:16;` |
| 33358 | `if(_hpr>0&&P.hp>0&&P.hp<P.mhp){P.hp=Math.min(P.mhp,P.hp+_hpr/_regenDiv*sp)}` |

Design docs used (narrow rows only):
- `docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md` §1: HP regen ÷8 idle / ÷16 in action; holyDome ×2; pRegenMul multiplies.
- `docs/14밸런스+수치테이블/패시브효과표.md` rows 47–50 and 78–79: pAbund always-on regen 5%/Lv; pPred self HP ≤30% regen 10%/Lv.
- `docs/7아이템디자인/아이템_어픽스_시스템.md` row 577: `lifeHealPow` (bracelet, PRE, pct).

## 2. Phase position

From the original order: holyDome flat (33352) → STMP rate precompute (33353–54) → **HP regen (33356–58)** → STMP writes (33359–64).
The central caller must give this module the current HP **after** the holyDome flat write. It must call HP regen before the STMP writes.
A narrow search found no HP natural regen branch in NativePlayer. The existing native ST branch is not part of this unit. This module does not modify NativePlayer or the World caller.

## 3. Formula, query order, guards

The original left-to-right evaluation is kept:

```
_hpr = hpR * regen_mul * hd_mul * (1 + life_heal_pow) * ((1 + abund) + pred)
new_hp = min(mhp, hp + (_hpr / regen_div) * sp)
```

Read order (`result.read_order`):
`P.hpR → pRegenMul() → _hdMul → _eqAffix('lifeHealPow') → PASSIVES.pAbund → P.hp → P.mhp → [PASSIVES.pPred] → P.s`.
Provider call order: `regen_mul_result → in_holy_dome → life_heal_pow_result → current_passives (pAbund, always) → current_passives (pPred, only if raw hp<=mhp*.3)`.
On the false branch, `PASSIVES.pPred` is not read. The threshold is inclusive (`<=`).

- The guard is `_hpr>0 && hp>0 && hp<mhp`. It runs **after** all rate helpers. There is no full-HP or dead short-circuit before the providers are called.
- If the guard fails → `READY` + `action:"guard_skip"`. Full or overcap HP gets no sink call and no downclamp (unlike STMP). A computed `NaN` or `-Inf` `_hpr` fails the comparison the same way (v2).
- `regen_div` is 8 only when `P.s==='idle'`. Every other string (`beam`, `dead`, `active`, …) uses 16. There are no extra idle, pause, expiry, iframe, parry-lesson, or combat guards.
- `hp>0` is required, so this path cannot revive a dead player.
- `sp=0`: if the original guard is true, this module writes the unchanged HP once.
- Negative `sp` → `NOT_READY sp_negative_unsupported`. This is not implied by the original guard.

## 4. Coercion, defaults, supported scope

| Input | Rule |
|---|---|
| `P.hpR` | Original `\|\|0`. A missing key, null, false, 0, NaN, or '' → 0. This is a valid source default **only** because the current P container is bound. true→1. A numeric string uses `AffixReader.js_to_number`. |
| `PASSIVES.pAbund/pPred` | Same `\|\|0` rule on the **current** PASSIVES Dictionary (`player_passives_source.read_current_passives()`). This is not boot-neutral. null PASSIVES → `NOT_READY`. |
| `P.hp`, `P.mhp` | Required finite numbers. No neutral defaults. |
| `P.s` | Required String or StringName. No default. |
| `pRegenMul()` | Upstream `regeneration_stat_source.read_regen_mul()`. Only `READY` with a finite value is authority. `SOURCE_NON_FINITE` (for example, undefined `pRegen`) → `NOT_READY`. No 1 is invented. |
| `_eqAffix('lifeHealPow')` | Upstream `equipment_affix_reader.eq_affix('lifeHealPow')` with the existing lazy cache. Only `READY` is authority. `READY_PARTIAL_AFTER_SOURCE_THROW`, `SOURCE_THROW`, and `NOT_READY` stop HP dispatch. `absent_zero` is a valid 0. |
| `in_holy_dome` | Must be bool: the current phase flag. This is not a new zone predicate. Any other type → `NOT_READY`. |

Supported numeric scope (v2):
- **Required inputs:** a non-finite required state field or provider value gives `NOT_READY`, a null packet, and 0 dispatch.
- **Computed `_hpr` from finite inputs:** handled the way the source handles it. `+Inf` with `sp>0` caps to `mhp`. `NaN` and `-Inf` fail the guard → `READY guard_skip`, no sink.
- **Residual invalid-output protection:** an unbounded `hp+_hpr/div*sp` that is NaN (`+Inf*sp0`) gives `NOT_READY new_hp_NaN`, so the actual HP is never NaN. The original would write NaN.
- Truthy arrays and objects for `hpR` or passives are unsupported and give `NOT_READY`. The original can apply ToNumber to them; for example, a single-element array becomes a number.
- **This port does not claim full malformed-JS parity.**
- Upstream throw or partial results stop HP dispatch locally. Error propagation across the whole `updatePlayer`, and whether the next STMP phase runs, are central concerns. This local module does not handle them.

## 5. API

```
configure(current_state_reader: Callable, providers: Dictionary, hp_sink: Callable) -> readiness
source_providers(regen_stat, affix_reader, passives_source, in_holy_dome: Callable) -> Dictionary   # static
readiness() / counters() / last_result() / clear()
plan_native(sp)    -> {ready, status, reason, action, packet, trace, read_order, dispatched:false, applied:false}
advance_native(sp) -> same; when action=="write", calls hp_sink(packet.hp_after) exactly once
```

Provider keys (all required; unknown keys make the module not ready):
`regen_mul_result`, `life_heal_pow_result` (`Callable(affix,'eq_affix').bind('lifeHealPow')`), `current_passives`, `in_holy_dome`.
`hp_sink(new_hp: float) -> bool`. `applied` counts only when the sink returns `true`.
`packet = {hp_before, hp_after, hpr, regen_div, sp}`.
`counters = {evaluations, not_ready, guard_skips, dispatched, applied}`.
When `hp_sink` is unbound, `advance_native` returns `NOT_READY` before it calls any provider. `plan_native` does not need the sink.
This is a pure RefCounted with explicit methods. Owners of RefCounted method Callables, including bound Callables, are held as strong references.
There is no `_process`, `_physics_process`, auto-physics, or clock. The central `PAUSED` path simply does not call the module.

## 6. Central binding (remaining, not done here)

Exact items still needed from the central caller:
- **Getter** (`current_state_reader`): returns the live P with current `hp`, `mhp`, `s`, and `hpR`, read after the holyDome flat and the STMP precompute.
- **Sources:**
  - current PASSIVES through `player_passives_source.configure_current_passives_reader`;
  - INV through `equipment_affix_reader.configure` and `regeneration_stat_source.configure`;
  - the holy-dome phase flag (see `FDG_GODOT_PORT_HOLY_DOME_PRESENCE_SOURCE_FIRST_20261013.md`; zone predicate and flat stay outside).
- **Setter:** a single `hp_sink(new_hp)`, the only HP writer for this phase, called before the STMP writes.
- **Affix cache:** invalidation stays at the original source points, owned by the central caller or ITEM. This module adds no cache, invalidation, or timer.
- **Source-error propagation:** propagation across the whole `updatePlayer`, including whether the next STMP phase runs, is a central concern.
- **Missing actual HP parameters:** there is no native `hpR` (recalcStats `0.05+str×0.002+lifeRegen`), `mhp`, or state authority bound yet. Until the central caller binds them, the result is `NOT_READY`.
- **Test fixture:** the fixture's constructor uses boot passives to set up its own current state. It does not prove actual Main or boot authority.

## 7. Read-only dependencies

`regeneration_stat_source`, `equipment_affix_reader`, `player_passives_source`. Only their public results or readers are used. This module does not edit them and does not duplicate the pRegen calculation or the STMP provider.

## 8. Exclusions

No writes to MP, ST, shield, poise, DOT, potions, resurrection, or save. No clamping of other resources. No passive distribution or level mutation. No affix generation. No fake Main ready. No 20× or distribution defaults. No edits to protected 2_3 or marketing docs, or to shared files. No Git operations.

## 9. Test groups

`chain_write`, `pred_threshold`, `guards`, `coercion_defaults`, `affix_authority`, `authority_missing`, `order_mutation`, `retention_scope` (v1: 93 checks, PASS), plus `source_nonfinite_rate_guard` (v2: 11 checks, PASS). The v1 groups were not re-run on the v2 code (see §0).
Chain under test: actual current P + real PASSIVES current seam → existing regen-stat multiplier + actual affix lazy cache → manual HP producer → single `hp_sink`.
CLI: `-- --only=g1,g2 --report=path.json`. Exit codes: 0 PASS, 1 FAIL, 2 INVALID (unknown group or argument, or 0 checks).

## 10. Related docs for central ENGINE sync (not edited here)

Central ENGINE handles the final sync of this new path at its normal code + docs checkpoint.

`docs/engine/FDG_ENGINE.md`, `docs/engine/FDG_INTEGRATION_INTERFACE.md`,
`docs/engine/FDG_GODOT_PORT_REGENERATION_STAT_SOURCE_FIRST_20261013.md`,
`docs/engine/FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md`,
`docs/engine/FDG_GODOT_PORT_EQUIPMENT_AFFIX_READER_FIRST_20261013.md`,
`docs/engine/FDG_GODOT_PORT_PLAYER_PASSIVES_SOURCE_FIRST_20261013.md`,
`docs/engine/FDG_GODOT_PORT_HOLY_DOME_PRESENCE_SOURCE_FIRST_20261013.md`,
plus the three source docs in §1.

## 11. Keywords

HP regeneration, HP natural regen, 자연 리젠, HP 리젠, 체력 회복, _hpr, hpR, P.hpR, _regenDiv, regen_div, idle ÷8, action ÷16, beam, dead state, pRegenMul, regen_mul, regeneration_stat_source, read_regen_mul, _hdMul, holyDome, 회복의 영역, in_holy_dome, holy dome flat, _eqAffix, lifeHealPow, 치유의, bracelet, 팔찌, equipment_affix_reader, eq_affix, lazy affix cache, invalidate_affix_cache, SOURCE_THROW, READY_PARTIAL_AFTER_SOURCE_THROW, pAbund, 풍요, pAbundRegen, pPred, 약자포식, pPredRegen, HP ≤30% inclusive, PASSIVES, player_passives_source, read_current_passives, current vs boot passives, js_to_number, js_truthy, `||0` default, SOURCE_NON_FINITE, NOT_READY, guard_skip, overcap no downclamp, no revival, Math.min cap, mhp, sp=0, negative sp unsupported, hp_sink, single HP writer, plan_native, advance_native, manual phase, no own clock, PAUSED caller, RefCounted owner retention, bound Callable, STMP phase order, game.html 33356–33358, game.html 28709, game.html 28711, NativePlayer HP branch absent, computed +Inf cap, computed NaN/-Inf guard_skip, new_hp_NaN residual protection, source_nonfinite_rate_guard, no malformed-JS parity, fixture-only repair, v1 finite-guard, v2 source-guard, 104 unique checks across versions, 120 executed checks
