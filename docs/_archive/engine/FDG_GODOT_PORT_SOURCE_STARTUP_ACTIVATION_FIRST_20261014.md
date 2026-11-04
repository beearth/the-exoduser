> **2026-10-14 실제 Main 커튼 서비스:** 기존 HUD에 ART 원view를 hidden bind하고 실제900ms callback을 소비했다. 첫15 중14valid/1FAIL→실패only1clean(906ms callback1), 제품수리0·성공재연0. sourcecontroller/G.on/600frames/GPU/fullMain 미연결, shadow80px/z45 gap 유지. 함께Root G-only publicplanner9/292와 Startup 원producer14/791를 동결기술scope로 정상 보존하며 실제Gwriter/18fields 일괄ACK0. [Main 커튼 정본](FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_FIRST_20261014.md).

# FDG Godot Port — Source Startup Activation (first slice) — 2026-10-14

## 0. Status

| Item | State |
|---|---|
| Narrow source producer (`producer.gd`) | **Technically complete** for the selected scope: 64483 boss 300 / 64487 nonzero 300 / 63808 intro 600 `G.on` + `P.iframes` packet |
| First new checks (`test_first.gd`) | **First valid run PASS**: 14 new groups, 791 assertions, 791 pass, 0 fail (§7) |
| Actual postStage 64466–64481 completion owner | **NOT implemented / NOT bound** → `NOT_READY` |
| Actual intro guide → curtain 63738–63808 completion owner | **NOT implemented / NOT bound** → `NOT_READY` |
| Live Main / State / Player binding | NOT done (ENGINE) |
| Related existing docs keyword search / sync / code+docs checkpoint | **PENDING, ENGINE** (not done by this worker; no existing doc edited) |

Evidence class of the PASS: constructor fixture authorities + isolated source-command sink. All structured completion packets in the run came from **constructor witnesses**, not from an actual postStage or intro owner, and are not Main install/activation evidence. No public build, Main, GPU, min240, or custom Node claim.

| File | Role |
|---|---|
| `godot/port_modules/source_startup_activation/producer.gd` | RefCounted producer: current readers + completion providers → read-only plan → one ordered packet to one sink |
| `godot/port_modules/source_startup_activation/test_first.gd` | SceneTree first checks (constructor fixtures, isolated sink; not live Main) |
| this doc | Source values, order, APIs, proposed contracts, gaps, first receipt |

## 1. Source (canonical `game.html`)

| Line | Source | Scope |
|---|---|---|
| 3855 | `_bossTestReq = v===null ? -1 : Math.max(0,~~(+v\|\|0))` → integral Number ≥ -1 | read via `boss_request` binding, no fallback |
| 64466–64481 | postStage boot continuation (sprite/map wait if boss<0, BGM gate, `_prepareStartMapView`, loading 100, hide, `_dbReady`, autosave, boot save schedule) | **required predecessor**, proposed completion packet |
| 64483 | `if(_bossTestReq>=0){G._cutsceneDone=true;G.on=true;if(P)P.iframes=300}` | BOSS_300 (G.on / P.iframes only) |
| 64484–64485 | `else if(G.stage===0){_startIntroCutscene()}` | strict numeric 0 → intro path |
| 64486–64487 | `}else{` / `G.on=true;P.iframes=300;` | NONZERO_300 |
| 63673–63689 | `_startIntro` (G.on=false, P.iframes=9999, guide start) | predecessor of intro completion (not executed here) |
| 63738–63743 | `_finishIntroGuide`: `state.done=true` … `_openIntroCurtain()` | intro completion boundary |
| 63745 | `setTimeout(()=>_disposeIntroGuide(state),900)` | **after** 63808; not a precondition, no 900 ms delay added |
| 63806–63808 | `_openIntroCurtain` entry: `G.on=true;P.iframes=600;` | INTRO_600 |
| 63307–63317 | `_startIntroCutscene` shortcuts: boss / plate / `!_forceCutscene&&(G.stage!==0\|\|G._cutsceneDone)` → immediate 300 | **OUTSIDE this slice, unowned residual** |

600 is written at `_openIntroCurtain` **entry**, right after the guide finishes (63743 → 63808), not after the curtain animation or `_disposeIntroGuide`. Not every stage-0 start is 600: restored stage 0 with `G._cutsceneDone`, plate test, and boss shortcuts in 63308–63317 write 300 and are unowned here. Forced PRO preview flow is also outside this slice.

Historical "all characters immediate 300" contract is superseded by restored INTRO (WARINTRO_CREATION_RUNTIME_20260910 document lines 107–130, save/data document lines 292–304): new-intro condition `!_forceCutscene, G.stage===0, !G._cutsceneDone`.

## 2. Order and branch (per call)

| Step | Read / decision | NOT_READY if |
|---|---|---|
| 0 | bindings `current_g, current_p, boss_request, post_stage_completion, sink` are valid Callables | `MISSING_BINDING:<name>` |
| 1 | `current_g()` | null → `SOURCE_G_NULL`; not Dictionary/Object → `INVALID_G_AUTHORITY` |
| 2 | `current_p()` (null allowed here) | non-null primitive → `INVALID_P_AUTHORITY` |
| 3 | before-snapshot of `G.on`, `G._cutsceneDone`, `G.stage`, `P.iframes` with presence metadata | — |
| 4 | `boss_request()` | not int / finite integral float ≥ -1 → `INVALID_BOSS_REQUEST` (missing/false/null/String are malformed, never -1) |
| 5 | `post_stage_completion()` | §4; plus `boss_request_observed` numeric ≠ current → `POST_STAGE_COMPLETION_BOSS_REQUEST_MISMATCH` |
| 6 | **64483** `boss >= 0` → BOSS_300 | — (P null ⇒ G.on only, source `if(P)`) |
| 7 | **64484** `G.stage` present and int 0 / float 0.0 | — |
| 7a | intro: `intro_curtain_completion` binding → packet (§4) → P required | `MISSING_BINDING:intro_curtain_completion`, `INTRO_CURTAIN_COMPLETION_*`, `SOURCE_P_NULL_NONBOSS` |
| 8 | **64486–64487** else → NONZERO_300; P required | `SOURCE_P_NULL_NONBOSS` |

- Strict stage: `false`, `null`, missing, `"0"`, `""`, `0.5`, `-1`, `[]` all take the else branch (NONZERO_300), as JS `===0`. Stage is never clamped or written. The intro provider is read only on the stage-0 branch.
- Boss value is preserved as read (e.g. `0.0` stays float); observed vs current compared as JS Number (`2` == `2.0`).
- `current_p` reader missing (`MISSING_BINDING:current_p`) ≠ reader returning null (source P null). Nonboss P null is NOT_READY because the original would lack P; no fake body.
- `before` labels describe presence: `{present, holder ("Dictionary"|"Object"|"null"|"invalid"), value, type}`. Absent vs null vs false are distinct. The snapshot is diagnostic only; it is **not** a write guard.

## 3. Packet (one sink call, ordered)

| Branch | `kind` | `source` | `write_source` | `write_anchor` / command `source_anchor` | commands |
|---|---|---|---|---|---|
| BOSS_300 | `source_startup_activation.boss_request_300` | `game.html:64483 if(_bossTestReq>=0)` | `G.on=true;if(P)P.iframes=300` | `game.html:64483` | `G.on=true`, then `P.iframes=300` only if P non-null |
| NONZERO_300 | `source_startup_activation.nonzero_stage_300` | `game.html:64486-64487 else (G.stage!==0)` | `G.on=true;P.iframes=300` | `game.html:64487` | `G.on=true`, `P.iframes=300` |
| INTRO_600 | `source_startup_activation.intro_curtain_600` | `game.html:63808 _openIntroCurtain` | `G.on=true;P.iframes=600` | `game.html:63808` | `G.on=true`, `P.iframes=600` |

- Packet keys: `kind, source, write_source, write_anchor, branch, boss_request, target_g, target_p, p_guard ("if(P)"|"none"), p_write_skipped_by_source_guard, commands, writes, residual_gaps`.
- Command keys (exact): `seq, target ("G"|"P"), field ("on"|"iframes"), value, expr ("G.on=true"|"P.iframes=300"|"P.iframes=600"), source_anchor, write_source`. The per-command anchor key is `source_anchor` (not `source`).
- `packet.writes` **is the same Array** as `packet.commands`. A sink executes one of them exactly once, never both.
- Plan, packet, `commands`, each command, `before`, `reads`, `residual_gaps` are read-only (shallow); `target_g`/`target_p` are the live authorities the sink writes.
- The producer never writes G or P; the sink owns writes. No once/frame/clock/dedup/sticky-fault latch, no RNG. Each call re-reads every provider.

## 4. PROPOSED REQUIRED INTEGRATION CONTRACT (unbound, unimplemented)

No actual owner supplies these packets. Contract constants and labels alone do **not** attest that the source physically ran. ENGINE must supply a source-backed public packet from the real owner, whose bound provider Callable's owner Object, current G and current P identities match. Generic bool / ACK / `initializer.completed` / HUD-created / map metadata / `NORMAL` / `READY` never count. Binding any current owner is a proposal; this doc makes no type/support upgrade or shipping claim.

| Field | post_stage_completion | intro_curtain_completion |
|---|---|---|
| `contract` | `fdg.source_startup_activation.post_stage_completion.v1` | `fdg.source_startup_activation.intro_curtain_completion.v1` |
| `source_owner` | `game.html:64466-64481 boot continuation postStage` | `game.html:63738-63743 _finishIntroGuide -> _openIntroCurtain` |
| `completed_boundaries` (exact Array) | `POST_STAGE_BOUNDARIES` (8 entries, 64466-64474 … 64481) | `INTRO_CURTAIN_BOUNDARIES` (63673-63689, 63739-63740, 63743, 63806-63807) |
| `authority_owner` | non-null Object, `is_same` bound provider `Callable.get_object()` | same |
| `authority_g` / `authority_p` | `is_same` current G / current P (P null only when it really is) | same |
| extra | `boss_request_observed` numeric == current boss request | — |

Rejection order (prefix `POST_STAGE_COMPLETION` / `INTRO_CURTAIN_COMPLETION`):

| Suffix | Trigger |
|---|---|
| `_PROVIDER_OWNER_NULL` | bound provider Callable has no owner object (not exercised by first checks) |
| `_PENDING` | provider returns null |
| `_NOT_STRUCTURED` | bare bool, `"READY"`, `"NORMAL"`, `"HUD_CREATED"`, any non-Dictionary |
| `_CONTRACT_MISMATCH` | generic ACK dict, `initializer.completed`, `map_metadata.*`, `hud.created`, other slot's contract |
| `_SOURCE_OWNER_MISMATCH` | owner label differs |
| `_BOUNDARIES_MISMATCH` | boundaries not the exact Array |
| `_AUTHORITY_OWNER_MISSING` | no `authority_owner`, or a label/bool instead of an Object |
| `_AUTHORITY_OWNER_MISMATCH` | packet object from a different provider |
| `_AUTHORITY_G_MISMATCH` / `_AUTHORITY_P_MISMATCH` | equal-content copy or other instance |

Owner identity is interface provenance, not a gameplay rule.

## 5. Public API (`producer.gd`, preload; no `class_name`)

| API | Behavior |
|---|---|
| `Producer.new(bindings: Dictionary)` | keys `current_g, current_p, boss_request, post_stage_completion, intro_curtain_completion, sink` → Callables. Holds strong refs to RefCounted binding owners. |
| `plan() -> Dictionary` (read-only) | `status (READY\|NOT_READY), reason, branch, branch_candidate, boss_request, reads, before, packet\|null`. Never calls the sink. |
| `activate() -> Dictionary` (read-only) | plan; if READY exactly one `sink.call(packet)`. `status`: `NOT_READY`, `SINK_APPLIED`, `SINK_REJECTED`, `SINK_RECEIPT_INVALID`; plus `reason, plan, sink_invocations (0\|1), sink_receipt` |
| sink receipt | `{"status": "APPLIED"}` or `{"status": "REJECTED", "reason": ...}`; relayed as diagnostic only, no retry, no latch, no added gameplay rule |

## 6. Current limits / residuals (caller- or ENGINE-owned)

| Gap | Owner |
|---|---|
| Actual postStage 64466–64481 completion provider | ENGINE (unbound → NOT_READY) |
| Actual `_finishIntroGuide`→`_openIntroCurtain` 63743/63808 completion provider | ENGINE (unbound → NOT_READY) |
| 64483 `G._cutsceneDone=true` before `G.on` | predecessor/caller, not emitted |
| 64488 `G._bonfire.t=300`, 64489 drop preview | caller, not emitted |
| 63809–63815 HUD on / cam / room+corridor spawn | caller, not emitted |
| 63308–63317 `_startIntroCutscene` boss / plate / restored-stage0 shortcuts (immediate 300) and forced PRO flow | unowned; not simulated. Must not be routed through the intro provider. |
| Live Main sink writing actual State G / Player P | ENGINE |

The packet covers only `G.on` and `P.iframes`; no branch is claimed fully finished.

## 7. First test receipt

Run (executor, isolated fixture project copy of the two new scripts only):
`Godot 4.7.2 --headless --path <executor fixture> --script res://port_modules/source_startup_activation/test_first.gd`
Retry selector syntax: `-- --only=<group>[,<group>]` (not needed: retry 0).

| Item | Value |
|---|---|
| Attempt | 1 (first and only run; no whole-suite second run) |
| UTC | 2026-10-13T20:16:01.675756Z → 2026-10-13T20:16:02.268650Z |
| Exit / SCRIPT ERROR / ERROR | 0 / 0 / 0 |
| producer.gd | 16045 B, sha256 `4469b746e0e0a0495dc5b62bb330df1b1f01469f10626dec07a63895d2881268` |
| test_first.gd | 36532 B, sha256 `c915f9dc28f5cca80f74c89b618c49723181ae832be0c9acf823c2d94e6e8ed7` |
| Result | PASS: 14 unique new groups, 791 assertions, 791 pass, 0 fail |
| Invalid selectors / failed groups / retry | 0 / 0 / 0 |
| Old scripts / old tests / assets / texture import / original-asset hash/import | 0 (new code/test SHA256 receipts above are separate) |
| Sink invocations | 43 = 40 APPLIED + 2 REJECTED + 1 non-Dictionary receipt diagnostic |
| Constructor writes by expr | `G.on=true` 40, `P.iframes=300` 30, `P.iframes=600` 8 (= 78) |
| Constructor writes by anchor | `game.html:64483` 20, `game.html:64487` 42, `game.html:63808` 16 (= 78) |
| Producer physics / process / render | 0 / 0 / 0 (RefCounted, no frame hooks) |
| Harness process / physics callbacks before summary | 0 / 0 (not a claim about all process frames) |
| Claims | live Main, actual postStage owner, actual intro owner, 63308–63317 shortcuts, public, GPU, min240: all false |

| Group | Covers | Assertions | Pass | Fail |
|---|---|---|---|---|
| `command_anchor_kind_order` | 3 branches: kind/source/write_source/anchor, command order/values/expr, writes alias, sink order | 55 | 55 | 0 |
| `boss_precedence` | boss beats stage 0 + ready intro; intro not read; `_cutsceneDone` untouched | 33 | 33 | 0 |
| `boss_request_numeric_domain` | 0.0/-1.0/2.0 accepted & preserved; 1.5, -2, INF, NAN, "0", null, bool rejected; observed mismatch | 114 | 114 | 0 |
| `stage_strict_zero` | false/null/"0"/""/0.5/-1/1/[]/missing → 300; int 0 and 0.0 → 600 | 119 | 119 | 0 |
| `post_stage_completion_rejects` | pending/bool/labels/ACK/initializer/owner missing/stranger/wrong provider/G,P copies | 109 | 109 | 0 |
| `intro_completion_rejects` | same for intro + HUD/map labels + post packet in intro slot | 107 | 107 | 0 |
| `intro600_structured_completion` | pending → constructor witness → 600, read order | 17 | 17 | 0 |
| `p_null_boss_and_nonboss` | boss P null G.on only; nonzero/intro P null NOT_READY; primitive G/P | 32 | 32 | 0 |
| `binding_missing_vs_source_absent` | missing reader ≠ null value; no -1 fallback; intro binding only on stage 0 | 55 | 55 | 0 |
| `before_fields_metadata` | absent vs null vs false; snapshot not live | 15 | 15 | 0 |
| `repeat_calls_no_once_gate` | repeat writes, pending→ready, no fault latch, branch switch per call | 78 | 78 | 0 |
| `readonly_plan_single_sink_call` | plan never sinks; read-only structures; one sink call per activate | 15 | 15 | 0 |
| `sink_rejection_diagnostic` | REJECTED relayed, no writes, invalid receipt, foreign sink | 19 | 19 | 0 |
| `object_authorities` | Object G/P via property presence and `set` | 23 | 23 | 0 |
| **Total** | | **791** | **791** | **0** |

## 8. Authorship / process ledger

| Step | Record |
|---|---|
| Prewrite absence | 2026-10-13T19:59:00Z, HEAD `273dcd22`, all 3 paths absent in working tree and HEAD |
| Writer launch | PID 44044, session `8f26a104-6e2e-4e42-882b-65f15a42e7ff`, default model claude-opus-5-5, no override, restricted / dontAsk / MCP none |
| **Scope deviation 1** | First launch ran one broad Grep **count** query (`get_cmdline_user_args\|--only=`) over `godot/port_modules`, which touched old completed test inventory counts (0 matches returned). Old test semantic read / copy / run: 0. Executor SIGTERM before any file or test (2026-10-13T20:02:00Z). |
| Resume 1 | PID 44252, same session, Grep removed (Read/Glob/Write/Edit). Producer written; executor pretest source review stopped it before test/doc existed (2026-10-13T20:09:00Z), producer 13697 B backed up, new checks run 0. |
| Pretest source contract corrections | Exact per-command source anchors, `writes`/`commands` same alias, completion `authority_owner` vs bound Callable owner identity, int / normalized integral float boss domain. These are pretest contract corrections, not runtime failure repairs. |
| Resume 2 | PID 44811, same session, default model; producer corrected, `test_first.gd` and this doc created; one writer self-Edit to the new test before first execution. |
| First run | §7; runtime product repair 0, successful group repeat 0 |
| Code/test frozen | After first PASS (2026-10-13T20:16:35Z backup: producer 16045 B, test 36532 B, both absent in HEAD `4c3f8643`) |
| Final doc | Claude doc-only PID 45381, same session/default model. Codex executor then corrected document line-citation wording and distinguished own-code SHA256 receipts from original-asset hash/import; code/test unchanged. |
| Permissions | Observed permission denials 0, writes outside the 3 owned paths 0. Interrupted processes have no result receipt; final creation result reported `permission_denials: []`. |

## 9. Next (ENGINE)

1. Implement the real postStage 64466–64481 owner and publish the §4 packet from that owner (owner Object = bound Callable owner, current G/P identities, observed boss request).
2. Implement the real `_finishIntroGuide`→`_openIntroCurtain` owner and publish the §4 intro packet at curtain entry (no 900 ms wait).
3. Bind a live Main sink that writes actual State G / Player P from `commands` (or `writes`, not both), once per `activate()`.
4. Own residuals in §6 (`_cutsceneDone`, bonfire, drop preview, HUD/cam/spawn, 63308–63317 shortcuts).
5. Related existing docs keyword search / sync and code+docs checkpoint: PENDING.
