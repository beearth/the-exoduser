> **2026-10-14 실제 Main 커튼 서비스:** 기존 HUD에 ART 원view를 hidden bind하고 실제900ms callback을 소비했다. 첫15 중14valid/1FAIL→실패only1clean(906ms callback1), 제품수리0·성공재연0. sourcecontroller/G.on/600frames/GPU/fullMain 미연결, shadow80px/z45 gap 유지. 함께Root G-only publicplanner9/292와 Startup 원producer14/791를 동결기술scope로 정상 보존하며 실제Gwriter/18fields 일괄ACK0. [Main 커튼 정본](FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_FIRST_20261014.md).

# FDG Godot Port — Source G assignment first (2026-10-14)

Module: `godot/port_modules/native_new_run_bootstrap_source/producer.gd`. The only change is the new public wrapper; existing code is unchanged.
New public API: `plan_g_assignment(step_id, actual_context) -> Dictionary`
New test: `godot/port_modules/native_new_run_bootstrap_source/test_g_assignment_first.gd`

Status: **verified on the first valid isolated run (Godot 4.7.2), as recorded by the executor.** All 9 groups ran: 292 checks, 0 failures, SCRIPT ERROR 0, stderr 0, exit 0. Code and test are frozen after that result.

Scope of the verification: the new public wrapper, plus a private fixed holder that consumes only the public packet. Every packet stays `SOURCE_COMMAND` / `current:false` / `main_ready:false`. This is a read-only G plan. Actual State writes and the actual Main phase remain ENGINE work.

## Verification record (executor-reported)

| item | value |
|---|---|
| engine | Godot 4.7.2, isolated script closure (4 production scripts + 1 new test = 5 scripts total) |
| groups (exactly 9) | `public_branches`, `context`, `query_order`, `fallback_valid0`, `conditional`, `interleave`, `isolation`, `reentrancy`, `resolver_reuse` |
| checks / failures | 292 / 0 |
| SCRIPT ERROR / stderr / exit | 0 / 0 / 0 |
| execution model | runs in `_initialize`, then `quit`. Automatic physics/process/render 0 |
| side effects | assets 0, import 0, editor 0, actual Main G writes 0, GPU / public visual / FPS 0 |
| not executed or copied | old bootstrap 7/76/full26, Main 29, PHT, hashes, any other old success |

### First-attempt chronology and distinctions

| stage | what happened | counts as a test execution? |
|---|---|---|
| writer turn 1 | Added the wrapper, new test, and this doc | no (nothing run) |
| pre-execution review (same session) | Removed a temporary always-true noop assertion (`_ok(r.get("source", "") == "" or true, "noop")`). Added the wrapper arity preflight (`provider_nonzero_arity:<key>`) and its new tests | no (nothing run) |
| first valid isolated execution | 9 groups / 292 checks / 0 failures | **yes, the only one** |
| after execution | product repairs 0, repeated successful runs 0, invalid executions 0 | — |

The existing resolver (`_g_fields`, `_test_req`, `_mats`, `STEPS`, `configure`/`readiness`/`run`/`_command`) is unchanged. The parent byte-verified the old producer's prefix and suffix around the single new hunk.

## Transparency notes

**Writer (first turn) path mistake.** The first turn wasn't flawless. The writer first requested `the-exoduser/game.html` (repo copy) at offset 64395 limit 1, 64424 limit 1, and 64459 limit 2. That file has only 60617 lines, so none of those reads returned content. The writer then read the correct canonical R locals at `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`. This is a task read-path deviation: 3 requests to 1 wrong path. Both actual CLI results show `permission_denials=[]`. Permissions, tools, and model weren't expanded.

**Executor note.** The executor records the path deviation above separately in its own proof. To finalize this doc, no source, old file, code, or test was reopened. Only this doc was read and edited.

## Session / collision chronology (metadata)

1. The writer was first launched as PID 50366, session `8078aaeb-dd6b-4a96-9eb4-e63812fa7a5d`. It used the configured default model `claude-opus-5-5` and permission mode `dontAsk`. The launch declared Read rules for 5 exact files and Write/Edit rules for the 3 owned paths; the 3 mistaken repo source Read requests are disclosed above.
2. A central duplicate-owner warning came in. The process was paused with SIGSTOP before it made any writes of its own. At that point the producer baseline was 27407 B and unchanged, and the new test and doc didn't exist yet.
3. The central worker stopped and made 0 writes. The parent granted this writer exclusive ownership. The same PID and session resumed with SIGCONT, and the first turn succeeded.
4. The same-session pre-execution review ran as PID 52512 and ended successfully.
5. This final doc-only turn used the same session as PID 53192 and ended successfully. Its observed tool calls were only Read and Write of this new document.
6. Sizes at the end: producer 32976 B (only the needed public wrapper added), new test 25896 B, frozen at the first PASS.
7. Before any writes, the parent saved external backups: WORK and HEAD bytes, the bytes at the stop, and the bytes before the review. The parent verified its own hunk and that the old producer prefix and suffix are unchanged.
8. No Git, shared-doc, asset, save, UI, or server mutations. Metadata for the 5 related doc paths was handed to ENGINE for shared sync and the normal checkpoint.

## Existing API doc consulted

From `docs/engine/FDG_GODOT_PORT_NATIVE_NEW_RUN_BOOTSTRAP_SOURCE_FIRST_20261013.md`, I read only the paragraphs below, before the valid run. Its old test ledger and the old test file weren't read or touched.
- §2 command order (lines 77–106): STEPS rows 6/8/10 (`g_reset_head/boss/tail`, 64395), 7/9/11 (interleaved externals `cache_exit_center`, `hud_counters`, `storage_reset`), 13 (`g_cutscene`, 64424), 22/23 (conditional overrides, 64459/64460, `skipped` when the condition is false).
- §4 API and §5 input rules (lines 118–148): `configure`/`readiness`/`run` contracts. The decision must be `{branch:"fresh_no_save"}`, with no automatic new-run substitution and no commands for `loaded`. The `load_shared_mats` falsy→1000 table and `provider_unsupported:*`. `stage_test_req/boss_test_req` accept int/float only, and NaN `>=0` is false. The new wrapper keeps these resolver semantics and adds no new value rules.

Canonical R is only `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html` (lines 64395, 64424, 64459–64460).

## Canonical source (read-only R `game.html`)

| public step_id | R line | source expression |
|---|---|---|
| `g_initial_reset` | 64395 | `G.on=false;G.stage=_stageTestReq>=0?_stageTestReq:0;G.kills=0;G.mats=_loadSharedMats()\|\|1000;G.exits=[];_cacheExitCenter();G.bossAlive=true;G._bossRef=null;G._crT=0;G.atkTickets=0;_hudT=0;_hudAlive=0;G.rifts=[];…;G.hellCleared=[];STORAGE={};STORAGE._synced=false;_getStore();` |
| `g_cutscene` | 64424 | `G._cutsceneDone=false;` (`!_loaded` branch only) |
| `stage_test_override` | 64459 | `if(_stageTestReq>=0)G.stage=_stageTestReq;` |
| `boss_test_override` | 64460 | `if(_bossTestReq>=0)G.stage=_bossTestReq;` |

`g_initial_reset` is a public alias over three existing internal segments: `g_reset_head` (STEPS index 6, 5 fields), `g_reset_boss` (index 8, 4 fields), and `g_reset_tail` (index 10, 9 fields). The internal IDs and every other STEPS id (`install_p`, `inv_reset`, `cache_exit_center`, …) are rejected with `unsupported_g_step`.

## Resolver reuse

The wrapper contains no field formulas or field literals. For each segment it calls the existing `_g_fields(id)` on an **isolated resolver scope**. That scope is a temporary instance of the same script (`get_script().new()`, so subclass overrides apply) whose `_providers` holds only the callables needed for this call. Segment metadata (`source/expr/owner/phase/kind/conditional`) is copied from the existing `STEPS` entries. The order and interleave entries come from the `STEPS` index range.

The wrapper never reads or writes the producer's own state:
- `_providers` keeps the same identity and contents;
- `_sink`, `_owners`, `_ran`, `_dispatch_count`, `_committed` and `_result` are not touched.

It doesn't call `configure`, `readiness`, `run`, `_command`, or the sink. Because each call has its own isolated scope, a reentrant call (a callback that calls `plan_g_assignment` again) leaves no provider binding to restore and can't corrupt one. When the call returns, the scope is released, so no callable owners stay retained.

## actual_context schema (ENGINE)

```
{
  "decision":  {"branch": "fresh_no_save"},          # BRANCH_FRESH, required and explicit
  "providers": {                                      # only what the queried step needs
    "stage_test_req":   Callable() -> number,         # original _stageTestReq
    "load_shared_mats": Callable() -> number|null|false,  # original _loadSharedMats()
    "boss_test_req":    Callable() -> number,         # original _bossTestReq
  }
}
```

| step_id | required providers | queries (order, count) |
|---|---|---|
| `g_initial_reset` | `stage_test_req`, `load_shared_mats` | stage ×1 → mats ×1 |
| `g_cutscene` | none | 0 |
| `stage_test_override` | `stage_test_req` | stage ×1 |
| `boss_test_override` | `boss_test_req` | boss ×1 |

The wrapper never needs `mk_p` or the sink. It never touches P, INV, STATS, PASSIVES, starter, recalc or applyStats. Extra providers are ignored and never called. A missing provider, a non-Callable, or an invalid Callable (including one whose owner was freed) gives `missing_providers` with **no neutral fill** (no 1000/−1/false).

Source readers take zero arguments. After the missing check, each bound provider is checked with `Callable.get_argument_count()`:
- If the count isn't 0, the result is `NOT_READY` / `provider_nonzero_arity:<key>`, reporting the first offender in `PUBLIC_G_PROVIDERS` order. The callable is never invoked, so there's no SCRIPT ERROR, and the key is **not** added to `missing`.
- A bound callable whose remaining argument count is 0 (e.g. `f.bind(x)` on a 1-arg method) is accepted, and its value goes through the same resolver.

All of these checks run before any query, so a rejection means 0 callback calls. This preflight exists only in the wrapper.

## Status / reasons

| case | status | reason |
|---|---|---|
| step not public | `NOT_READY` | `unsupported_g_step` |
| context not Dictionary | `NOT_READY` | `context_not_dictionary` |
| decision missing / not `{branch: String}` | `NOT_READY` | `decision_not_explicit` |
| branch `loaded` | `LOADED_BRANCH_EXCLUDED` | `loaded_restore_branch_excluded` |
| other branch | `NOT_READY` | `decision_not_explicit_fresh` |
| needed provider absent/invalid/freed | `NOT_READY` | `missing_providers` + `missing:[…]` |
| needed provider argument count ≠ 0 | `NOT_READY` | `provider_nonzero_arity:<key>` (`missing:[]`) |
| provider value type unsupported | `NOT_READY` | resolver reason verbatim, e.g. `provider_unsupported:stage_test_req` |
| ok | `SOURCE_COMMAND` | `""` |

When the wrapper can't produce a plan, the result has no `fields` or `segments`, and it doesn't change producer state or `_result`. Every result has `current:false, main_ready:false`.

## Resolver value semantics (existing, unchanged)

- `G.stage` in the initial reset: a request `>=0` gives the raw value; `<0` or NaN gives `0` (source ternary). A request of `0` is a valid 0.
- `G.mats`: `0 / -0 / 0.0 / NaN / null / false` → `1000`, with `meta.mats_fallback=true`. This is the legitimate source fallback `_loadSharedMats()||1000`, not a missing-provider fill. Any other number is passed through raw, including negative numbers. `true`, strings, and other types → `provider_unsupported:load_shared_mats`.
- `g_cutscene`: the value `false` comes from the existing resolver's source literal.
- Conditional overrides: if the request is `<0` or NaN, the result is `status:SOURCE_COMMAND, skipped:true, fields:[]`. `meta.<provider>` holds the exact request value, and the segment has `conditional:true, skipped:true`. A request of `0` applies `stage=0`. The wrapper never invents −1 or any other stage value.

## Success packet

```
{status:"SOURCE_COMMAND", current:false, main_ready:false, applied:false, sink:"pending_engine",
 step_id, branch:"fresh_no_save", target:"same G", phase,
 segments:[{status:"SOURCE_COMMAND", current:false, main_ready:false, index, id, kind:"g_assign", phase,
            source, expr, owner, target:"same G", conditional, skipped, fields:[[key,value],…], meta?}…],
 fields:[[key,value],…],      # source-ordered concat, deep copy (not aliased to segment fields)
 meta:{…}, skipped,
 order:[{index,id,kind,source,expr,owner, segment | implemented_here:false+between:[prev,next]}…],
 interleaves:[…external entries of order…],
 apply_contract:"per_segment_interleaved" | "single_segment",
 followed_by:{index,id,kind,source,expr,external}}
```

Every call allocates fresh arrays and dictionaries (e.g. `exits`, `rifts`, `hellCleared`), so changes a consumer makes don't leak into later plans.

## Interleave (g_initial_reset)

`order` runs over STEPS indices 6 → 10:

| index | id | kind |
|---|---|---|
| 6 | `g_reset_head` | G fields 1–5 |
| 7 | `cache_exit_center` | external, `_cacheExitCenter()` |
| 8 | `g_reset_boss` | G fields 6–9 |
| 9 | `hud_counters` | external, `_hudT=0;_hudAlive=0` |
| 10 | `g_reset_tail` | G fields 10–18 |

`followed_by` = index 11, `storage_reset` (external).

`fields` is only a convenience flattening of the 18 values. **It isn't the source phase.** To follow the source phase, apply each segment in `order` and run the external barrier at each interleave position. The wrapper runs no barrier (`implemented_here:false`). The parent/ENGINE owns that phasing.

## Test (`test_g_assignment_first.gd`, frozen)

Runner: `godot --headless --path godot --script res://port_modules/native_new_run_bootstrap_source/test_g_assignment_first.gd [-- --group=NAME]`. It prints one summary JSON line (`groups, checks, failed, failures[]`) that lists only failures, and exits 1 on any failure. Everything runs in `_initialize`: no frames, no Main, no P. The test is new and meaningful; nothing in it comes from the old test ledger.

Groups (all 9 passed in the first valid run):
- `public_branches`: the four public steps, read-only packets, 64395 key order, the cutscene literal, and rejection of private/unsupported ids with 0 queries.
- `context`:
  - non-dict context, implicit decision, non-fresh branch;
  - loaded branch excluded with 0 queries;
  - missing/invalid providers with 0 queries and no fill;
  - 1-arg stage/mats/boss providers rejected with `provider_nonzero_arity:<key>` and 0 callback calls;
  - a missing + 1-arg mix lists only the absent key;
  - a bound callable with zero remaining args is accepted;
  - a freed provider owner is treated as missing;
  - exact resolver reason propagation, and the point where queries stop.
- `query_order`: stage→mats once each, cutscene 0 queries, one read per override, varying requests not cached.
- `fallback_valid0`: the MATS `||1000` truth table, the stage ternary including NaN, and an override with request 0.
- `conditional`: `<0`/NaN requests skip with empty fields and the exact meta, one query each.
- `interleave`: order, `between`, `followed_by`, the contract, and a fixed holder that consumes only the public packet and reproduces the 64395 statement order.
- `isolation`:
  - a configured producer whose callbacks and sink are called 0 times;
  - `_providers` identity and contents, `_sink`, `_owners`, `_ran`, `_dispatch_count`, `_committed` and `_result` all preserved;
  - readiness still OK;
  - fresh, non-aliased arrays;
  - an unconfigured producer stays unconfigured.
- `reentrancy`: a stage callback calls the wrapper again with its own context, and both resolve correctly.
- `resolver_reuse`: a `Probe` subclass overrides `_g_fields` to append a marker. The markers appear per segment in order, which shows the wrapper goes through the existing resolver.

## Exact API (final)

```
plan_g_assignment(step_id: Variant, actual_context: Variant) -> Dictionary
  step_id        ∈ {"g_initial_reset", "g_cutscene", "stage_test_override", "boss_test_override"}
  actual_context = {decision: {branch: "fresh_no_save"},
                    providers: {<PUBLIC_G_PROVIDERS[step_id]> : zero-arg valid Callable}}
  → SOURCE_COMMAND read-only plan (current:false, main_ready:false, applied:false, sink:"pending_engine")
  | NOT_READY (unsupported_g_step | context_not_dictionary | decision_not_explicit |
               decision_not_explicit_fresh | missing_providers | provider_nonzero_arity:<key> |
               provider_unsupported:<key>)
  | LOADED_BRANCH_EXCLUDED (loaded_restore_branch_excluded)
const PUBLIC_G_STEPS, PUBLIC_G_PROVIDERS
```

## Remaining gaps (ENGINE / parent, not this module)

- **Actual context:** the actual source of the `fresh_no_save` decision and the real `_stageTestReq` / `_loadSharedMats` / `_bossTestReq` callables in the actual Main.
- **Ordered State sink:** actual writes to the same G, segment by segment, following `order`, with the `cache_exit_center` / `hud_counters` barriers between segments and `storage_reset` after them, plus readback of the written G.
- **Actual Main phase:** putting `g_cutscene` (64424) and the overrides (64459/64460) in their source positions relative to the other STEPS externals (`install_p` … `apply_stats`, `init_stage`). Checking `current` / `main_ready`.
- **Excluded branches:** loaded/restore and testchar.
- **Sync:** checkpoint and shared doc / CHANGELOG sync, owned by the parent.
