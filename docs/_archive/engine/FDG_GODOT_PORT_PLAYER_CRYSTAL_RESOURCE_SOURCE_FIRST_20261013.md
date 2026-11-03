## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

> 2026-10-20 IT-03 current: `crystalEffects` now multiplies the existing star/enhancement factor by IT-01 `_qGemMul(cr.q)` before `base*mul`, matching latest origin/main `284d7faf` game.html:15289–15296/15316. Missing/null/zero q remains neutral (q50); q1=0.755 and q100=1.25. Unsupported q returns NOT_READY and the adapter returns null before any resource packet dispatch. Socket multiplication remains IT-04. The 2026-10-13 source anchors/test counts below are historical; current validation and exact input limits are in [IT-03 report](orders/reports/it-03_REPORT.md).

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

# FDG Godot Port — player_crystal_resource_source FIRST (2026-10-13)

TASK `GODOT-PORT-PLAYER-CRYSTAL-RESOURCE-SOURCE-FIRST-20261013`. An exact port of the original `crystalEffects(cr)` and the conditional `PROVIDER_CRYSTAL_EFFECTS` adapter for `player_resource_parameters_source` (SourceParameters).

Owned files (only these 3):
- `godot/port_modules/player_crystal_resource_source/producer.gd`
- `godot/port_modules/player_crystal_resource_source/test_first.gd`
- `docs/engine/FDG_GODOT_PORT_PLAYER_CRYSTAL_RESOURCE_SOURCE_FIRST_20261013.md`

Status: **source-backed effects/helper/conditional resource consumer technical complete / first5 groups125 checks PASS**. No Main / full crystal system / 240 readiness is claimed.

## 1. Pre-check: no existing helper

Production `.gd` search for `crystalEffects|CRYSTAL_DEFS|CRYSTAL_STAR|crystal_effects|cr_deep_well|crystalVal`: the only hits are the SourceParameters provider-key declaration, `equipment_armor_swap.gd` `CRYSTAL_BAG_MAX`, and `save_adapter` `crystalBag/CRYSTAL_DUST` passthrough. There is **no existing crystalEffects/registry/provider owner**, so the original definitions were ported exactly into the owned producer. The new `ITEM_SKILL_SLOT_ASSIGNMENT_20261014` doc also states it does not duplicate this module.

## 2. Original source (canonical `game.html`, read-only)

| Item | Original | Line |
|---|---|---|
| CRYSTAL_DEFS | 18 relics, `opts:[[stat,base],...]` | 15857-15876 |
| CRYSTAL_IDS | `Object.keys(CRYSTAL_DEFS)` | 15926 |
| CRYSTAL_STAR | `mul` 1.0 / 2.0 / 3.5 / 6.0 / 10.0 (조각/파편/결정/순수결정/완전결정) | 15938-15944 |
| crystalEffects | `const d=cr&&CRYSTAL_DEFS[cr.id],s=cr&&CRYSTAL_STAR[cr.star]; if(!d\|\|!s)return []; const mul=s.mul*(1+(cr.enh\|\|0)*0.1); return d.opts.map(([stat,base])=>({stat,value:base*mul}));` | 15951-15956 |
| Current-equipped caller | `_cr{hp..drop:0}`; SLOT_NAMES order `it.crystals[ci]` (truthy) → `crystalEffects(c)` → `_cr[stat]+=value`; `P._crystalStats=_cr` | 28596-28600 |
| Resource consumers | `P.mpR+=_cr.mpR/60` (28606), `P.stR+=_cr.stR/60` (28607), `P.mmp=~~(P.mmp+~~_cr.mp)+…` (28608), recalcSt `~~(P._crystalStats?P._crystalStats.st:0)` (16939) | |
| Non-resource consumers (other owners) | hp 28601, atk 28602, def 28603, spd 28604, hpR 28605, crit 28658, cdmg 28659, drop 28660, eDef 44033/51761, elements | |
| legacy id | `_CR_LEGACY_IDS` (15878), restore `_migrateCr` (4142) | |

Ported records (`opts` order = effect order; only the `opts`/`cat` fields that crystalEffects reads. Names/colors/slots/svg/craft are not included):

| id | cat | opts | Resource keys |
|---|---|---|---|
| cr_blood_oath | atk | atk 1, crit 0.06, hp 2 | — |
| cr_hunter_eye | atk | crit 0.23, cdmg 0.04, drop 0.04 | — |
| cr_ruin_heart | atk | cdmg 0.1, atk 0.2 | — |
| cr_cinder_crown | atk | fire 1.2, atk 0.25, crit 0.04 | — |
| cr_frost_fang | atk | ice 1, stR 0.03 | stR |
| cr_night_seed | atk | dark 1.2, mpR 0.03 | mpR |
| cr_storm_nerve | atk | light 1.5, spd 0.03, st 1 | st |
| cr_dawn_relic | atk | holy 1, hpR 0.04, mp 1 | mp |
| cr_martyr_tear | def | hp 8, hpR 0.04 | — |
| cr_iron_vow | def | def 1, hp 2 | — |
| cr_ward_stone | def | eDef 0.5, def 0.2, mp 1 | mp |
| cr_ash_wing | def | spd 0.08, st 1 | st |
| cr_living_root | def | hpR 0.15, hp 3, def 0.15 | — |
| cr_grave_lantern | def | drop 0.15, eDef 0.1 | — |
| cr_last_breath | acc | st 5, stR 0.03 | st, stR |
| cr_deep_well | acc | mp 5, mpR 0.03 | mp, mpR |
| cr_pulse_reed | acc | stR 0.08, st 1, spd 0.02 | stR, st |
| cr_oracle_pupil | acc | mpR 0.08, mp 1, crit 0.02 | mpR, mp |

Current IT-03 formula (game.html:15293–15294): `value = base × ((CRYSTAL_STAR[star].mul × (1 + enh×0.1)) × _qGemMul(q))`. Multiplication order is preserved. The following legacy example has missing q (neutral q50): `cr_deep_well` 3성(star 2) +3 → mul 3.5×1.3 → mp 22.75, mpR 0.1365.

Doc drift (for ENGINE sync; not edited here): `docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md` still has the old 17-type single-stat IDs (`cr_hp`, `cr_st`, `cr_mp`…) and statements like "자원결정 4종". The current source has 18 relics with 2–3 options each, and the old IDs only exist as migration keys in `_CR_LEGACY_IDS`.

## 3. Mixed non-resource effects / full `_crystalStats`

The adapter returns **all of the original effects** (no filtering). Every opts stat is one of the SourceParameters `CR_INIT_KEYS`, so `P._crystalStats` is filled with exact values for all 18 keys, including the non-resource ones (hp/atk/crit…). It is not completed by zeroing anything. `resource_effects`/`nonresource_effects` are diagnostic views only. Consuming the non-resource values (mhp/baseAtk/statCrit etc.) is another owner's job and not installed here (`MISSING_UPSTREAM.nonresource_consumers`).

## 4. API

| API | Kind | Description |
|---|---|---|
| `crystal_effects(cr)` | pure | Original crystalEffects. Returns `{status, ready, reason, effects, id, star, enh, star_mul, mul, cat, resource_effects, nonresource_effects}` |
| `provide_crystal_effects(cr)` | adapter | `(crystal)->Array[{stat,value}] \| null`. Array only for READY / READY_ORIGINAL_EMPTY |
| `crystal_effects_provider()` | adapter | Callable only when `support_readiness()` is READY, otherwise null |
| `with_crystal_effects_provider(providers)` | adapter | Adds only the PROVIDER_CRYSTAL_EFFECTS key to a copy. Refuses to overwrite an existing key or attach when not ready |
| `support_readiness()` | static | Integrity check on the ported tables: 18 ids in order, opts shape, every stat ∈ `CR_INIT_KEYS`, 5 stars |
| `source_tables()` | static | `SOURCE_TABLE` provenance (`current:false`). Not current inventory readiness |
| `call_count()/call_log()/last_result()/clear_call_log()` | diagnostics | Last 64 calls (status/reason/id/star/effects) |

Statuses (kept distinct):
- `READY` — original `d.opts.map` result.
- `READY_ORIGINAL_EMPTY` — the original **mandated** `[]`. Exact reasons: `cr_falsy` / `id_not_in_CRYSTAL_DEFS:<key>` (unknown key, un-migrated legacy id, primitive cr's `.id`=undefined) / `star_not_in_CRYSTAL_STAR:<key>`. If either side is definitely undefined, the result is `[]` regardless of the other side's shape (`!d||!s`).
- `SOURCE_THROW` — id is an `Object.prototype` key (constructor/__proto__/toString… 12 total) and star is valid → the original TypeError (`d.opts.map`). Provider returns null.
- `NOT_READY` — the original result can't be determined: cr is a Godot Object, id is an Array/Dictionary (JS ToString not reproduced), star is a non-index string (possibly an Array.prototype key such as `"length"`/`"02"`), enh is an Object. Provider returns null.
- `SOURCE_NON_FINITE` — original value is NaN/±Inf (e.g. enh `"abc"`). Only `diagnostic_effects` is returned. Provider returns null (a strict subset — the original would let NaN flow into _crystalStats).

Preserved coercion: `star` 2 / 2.0 / `"2"` are the same index; 2.5 / -1 / 5 / null / undefined are undefined. `(cr.enh||0)`: null/false/0/missing → 0; `"3"` → 3. A value of 0 is not an empty result (enh -10 → READY with two 0-valued effects).

## 5. Current-authority seam (where readiness is checked)

- Current equipped crystals come from SourceParameters' `inventory` provider (the actual current INV): `_read_container(PROVIDER_INVENTORY)` + `_equipped()` check readiness, and `plan_apply_stats` @28596-28600 iterates in SLOT_NAMES/ci order and passes **one crystal at a time** to this adapter. This module does not read or write INV/P/CRYSTAL_BAG itself (no fabricated inventory).
- No crystals equipped → the provider is not called (conditional), and SourceParameters can be READY without it.
- Crystals equipped and provider missing → `provider_missing:crystal_effects` NOT_READY. Adapter returns null → `crystal_effects_not_array` NOT_READY. In both cases packet is null and sink is 0.
- Divergence: the original SOURCE_THROW would leave partial assignments (stR/mmp/mpR/HP) from before the applyStats throw. This port does not reproduce that and stops entirely with NOT_READY.
- Reused (no duplication): `equipment_affix_reader.js_truthy/js_property_key/js_to_number`, `SourceParameters.CR_INIT_KEYS/PROVIDER_CRYSTAL_EFFECTS` and the public `configure/readiness/run_apply_stats/plan_*` (SourceParameters body unchanged).

`MISSING_UPSTREAM`: `current_INV` (ITEM/ENGINE), `install_sink` + applyStats/recalcSt call-site (ENGINE), `nonresource_consumers` (other owners), `legacy_id_migration` (restore owner).

Out of scope: crystal acquisition/drop/RNG, fusion, enhancement cost (`crystalEnhCost`), crafting/disassembly, slot compatibility (`slots`/attachCrystal), bag/inventory UI, save/restore, SP/level, crystal skills, rendering/icons (no images or assets copied).

## 6. FIRST isolated execution (5 groups /125 checks PASS)

Codex executor ran portable Godot4.7.2 --headless with the external fixture-attempt1 containing only owned2 and necessary readonly production5 scripts (SourceParameters/Affix/Cref/Formula/grit). No old test files/PNG/imports. physics60/Compatibility/dedicated userdir EXODUSER-PlayerCrystalResourceSource-Isolated-20261013.
Verdict: exit 0 = PASS (checks>0, 0 fails) / 1 = FAIL / 2 = INVALID (0 checks, unknown group, a group aborted before setting its completion flag). If `SCRIPT ERROR`/parse error appears on stderr, the run is INVALID even if exit is 0.

| group | First valid checks | Content |
|---|---:|---|
| records | 31 | 18 ids in order; 18×star0-4×enh{0,3,20} effect order/values exactly match the independent oracle (original opts/mul retyped in the test); star mul; deep_well/oracle_pupil representative values; resource/non-resource view; set of 10 resource-bearing ids |
| inputs | 43 | 16 cases: original-empty / NOT_READY / SOURCE_THROW with exact reasons, provider `[]` vs null; NaN → SOURCE_NON_FINITE; star 2.0/"2", enh "3"/null/false/missing coercion; enh -10 READY with value 0 (≠ empty); 5 statuses distinct |
| pipeline | 37 | Real SourceParameters + equipment_affix_reader + combat_reference_source (eq_stat/lv_b) + player_grit_source + this adapter. Current-INV equipped crystals across 5 slots → 6 calls in SLOT_NAMES order (null sockets skipped) → `_crystalStats` (including non-resource hp/atk/crit/spd) exactly equal to the original cumulative-order oracle → mmp 173 / mst 175 / mp·st clamp / stR·mpR exact. Baseline without crystals: mmp 149 / mst 128 → Δmmp = ~~_cr.mp (24), Δmst = ~~_cr.st (47). Sink order applyStats→invalidate→recalcSt; real affix/eqStat caches invalidated once each (built true→false, then rebuilt by recalcSt); dispatch 3; original write order |
| not_ready | 10 | Provider missing → NOT_READY/sink 0/P unchanged; SOURCE_THROW and non-finite → `crystal_effects_not_array`/sink 0; star 7 + un-migrated legacy `cr_mp` → READY with reasons recorded, `_crystalStats` all 0 = baseline; refuses overwrite |
| keepalive | 4 | SourceParameters keeps the RefCounted adapter alive; after `clear()` it is released and the result is NOT_READY |
| Total | 125 | First valid PASS; exit0, stderr empty/SCRIPT ERROR0, 0.660209875 seconds |

Fixtures are fixed constructor Dictionaries (P lv4/mp999/st999, STATS dex10/int20, necklace maxMPFlat 3, ring2 maxSTFlat 6, `_grit` 0) and are technical operands, not Main/live state. No live HP/position/AI/clock injection, forced success, enemy/difficulty changes, or attack tickets. No existing test files/receipts read, no previous success suites re-run, no PNG/source16/assets.

## 7. Related docs keyword search (ENGINE central sync handoff)

Keywords `crystalEffects|CRYSTAL_DEFS|CRYSTAL_STAR|_crystalStats|player_crystal_resource_source`, excluding the `INGAME_CAPTURE_STUDIO_20261009.md` basename. Docs matches (as of authoring):
- `docs/engine/FDG_GODOT_PORT_PLAYER_RESOURCE_PARAMETERS_SOURCE_FIRST_20261013.md` — the `crystal_effects` "Not ported"/MISSING_UPSTREAM line needs to be synced to this module
- `docs/engine/FDG_GODOT_PORT_ITEM_SKILL_SLOT_ASSIGNMENT_FIRST_20261014.md` — states it does not duplicate this module (no collision)
- `docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md` — old 17-type IDs drift (§2)
- `docs/2_7 인벤토리+장비시스템/3파트_아이템분류.md`
- `docs/3.1 ui hud 디자인/PASSIVE_TREE_REDESIGN_20260909.md`
- `docs/16영문화(i18n)/영문화_진행현황.md`
- `docs_backup_before_normalize_20260726/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md`
- `docs_backup_before_normalize_20260726/2_7 인벤토리+장비시스템/3파트_아이템분류.md`
- `docs_backup_before_normalize_20260726/16영문화(i18n)/영문화_진행현황.md`
- (this doc)

The 2_3 folders are immutable, and no common docs were edited. ENGINE handles common-doc sync, installing the real current INV/sink/applyStats call-site, and the normal code+docs checkpoint.


## 8. First execution ledger / exact limits

| group | first checks | status |
|---|---:|---|
| records | 31 | PASS |
| inputs | 43 | PASS |
| pipeline | 37 | PASS |
| not_ready | 10 | PASS |
| keepalive | 4 | PASS |
| total | 125 | unique5 PASS, no repeat |

The source-record check covered18 original IDs x5 star indices x3 enh values=270 combinations, aggregating each ID's ordered effects against the independently retyped source table/oracle. These are additional per-record comparisons inside the31 checks, not270 separate completed test groups. No FAIL/INVALID or post-run producer/test repair. The test's technical constructor values do not install actual current inventory/state in Main.

Actual SourceParameters.run_apply_stats was explicitly called8 times:4 valid runs emitted3 ordered parameter/cache packets each (baseline no crystals, normal mixed6-crystal input, original-empty input, retained-provider input);4 missing/throw/nonfinite/cleared runs emitted0 parameter packets. Each valid run applies source cache invalidations in order Affix then Cref, once each. The main mixed-input run made6 crystal provider calls in original SLOT_NAMES/ci order and preserved full mixed hp/atk/crit/spd effects alongside MP/ST resource fields. It emitted mmp173/mp173/mst175/st175, preserving intermediate mmp and original rounding; baseline149/128 gives resource delta24/47. No automatic source dispatch/clock advance/process/render, public play, pixels, GPU or minimum1080p240 measurement.

Actual Claude default configured claude-opus-5-5, sessionf94a5e6f-e11f-4aa5-b532-ff3fbb545ea0, PID15359, started UTC2026-10-13T17:22:48.684319, duration728833ms. No model override/settings change; restricted/dontAsk/ReadGlobGrep/exact owned3 WriteEdit, permission denial0/Bash-MCP-Agent-GUI0. Actual Claude authored all producer/newtests/source doc; Codex executor ran first fixture and appended this receipt only. Before-write working+HEAD absence/realparent/symlink manifest and pre-receipt doc bytes are in backup-before-write.json/doc-before-receipt.md under E/godot-native-first/team-port/player_crystal_resource_source/ with CLI/test stdout/stderr/engine/launch logs.

Instruction deviation (one initial search scope): actual Claude reported that its first broad *.md keyword Grep included the excluded basename INGAME_CAPTURE_STUDIO_20261009.md. Matches0, direct Read toolcalls0, returned matching body0, adoption into source implementation0. That initial search did NOT obey the requested exclusion; it is recorded rather than described as never accessed/searched. It then searched with the basename excluded. The executor's final related-doc snapshot also excluded the basename at the first rg scope and never reopened/rechecked the protected file. No user permission was inferred and no protected content was used. Initial authoring path list included docs_backup_before_normalize entries; those are background filename matches, not current truth or adopted source. The final keyword-doc-matches.json is the exact current docs/-only list.

The module supplies only the original numeric effects helper/adapter and preserves full effects to prevent partial mixed-effect loss. It does not implement actual current INV publication, legacy ID migration, acquisition/fusion/enhancement/UI/save/skill systems, nonresource stat consumers, shared applyStats or resource state installer. Unsupported JS shapes and original throw/nonfinite inputs are refused before whole source-parameter dispatch: original partially-written throw/NaN side effects are not reproduced. Main/full-crystal/current-state readiness remains false until ENGINE/ITEM/BUILD install their actual authorities and original call-site order.

Related current docs sync includes old2_9 single-stat17-ID drift versus exact source18 relic IDs, five star multipliers and original full opts; SourceParameters conditional helper now implemented but actual current input/sink installation still missing. Common docs/2_3/Git/shared files unchanged. ENGINE owns normal code+docs checkpoint. PNG/copy/hash/import/source16/old successful suite/public artifact/server/save/API/human paused screen changes0.
