## 2026-10-14 원본 키·boot-label 소비 반영

| 범위 | 현재 결과 |
|---|---|
| 실제 Prepare Node callback 연결 | Main actualL2/HUD2/Window0/genuinezeroSignal bind. 실제원 CH1fallback/cache등 부재로 configureMISSING_BINDING:fallback_writer/runNOT_CONFIGURED. source 완료0. |

새 actualMain1/24 firstPASS(1.975504125초), ERROR0/CameraWarning1/수리·oldsuccess재연0. sourceG.onfalse/전체source·GPU·24장24FPS 미완. 정확API·완전성·lifetime은 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 이미지 키 매핑·실제 시작 모듈 소비」를 따른다. 아래 최초 source/standalone 이력과 이번 native subset을 구분한다.

## 2026-10-14 중앙 native 공급 반영

| 범위 | 현재 구현 | 남은 계약 |
|---|---|---|
| Main/HUD native 공급 subset | Main set_native_boot_loading(pct,text)/hide writer와 actual current OPT.lang 기반 localize_native_startup_text(ko,en)2arg, actual Window !visible||MODE_MINIMIZED reader 및 zero-argument signal/lifetime 연결. | CH1 enabled/IDs/preload/cache/fallback·source warn 부재. main Window visibility setter 미지원; owned subwindow5PASS만/OS 최소화·browser document equivalence 미검증. Prepare 전체 Main실행0/fallbackreturn≠TextureReady. |

새 실제 검사 이력·정확 API·수명/원본 source 경계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「실제 네이티브 로딩 공급 연결」을 따른다. 이 문서의 아래 최초 standalone/원 HTML 이력과 이번 Main native subset은 구분한다. protected 인간 game/서버3333/save/UI 조작0.

# FDG Godot Port — Source `_prepareStartMapView` Native Async Owner (first slice) — 2026-10-14

## 0. Status

| Item | State |
|---|---|
| Native async owner (`producer.gd`, `extends Node`) | First isolated runtime validated. Executes the source body itself: calls, writer, await, loop, current state, listener cleanup equivalent to `finally` |
| First new checks (`test_first.gd`) | **First 13 unique groups / 332 assertions PASS**. Codex executor ran the new isolated episode once; no reruns |
| Actual Map publishers (`_ch1StartOuterEnabled`, view IDs, CH1 start-outer preload/cache, boot fallback flag, visibility authority) | **Unported / unbound in Main** → no actual Main binding exists |
| Actual NativeMainReady | **NOT_READY**. A constructor-protocol PASS is not Main readiness |
| Related existing docs keyword search / sync (root ENGINE) | **PENDING, ENGINE**. This worker edited no existing doc |
| Git | Central normal checkpoint **pending**. This worker made no Git changes |

| File | Role |
|---|---|
| `godot/port_modules/source_prepare_start_map_view_owner/producer.gd` | Native Node owner, `configure(bindings)` + `await run_prepare_start_map_view()` |
| `godot/port_modules/source_prepare_start_map_view_owner/test_first.gd` | Standalone SceneTree first checks (ConstructorProtocol + isolated DocumentProtocol) |
| this doc | Source, API, bindings, timing, guards, gaps, §23 report, first valid ledger |

## 1. Source (canonical `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`)

Lines 12093–12113 were read (12114–12117 are the next function header and comment; not used).

| Line | Source | Native step (`trace` label) |
|---|---|---|
| 12094 | `_ch1StartOuterBootFallback=false;` | `fallback_writer(false)` → `fallback=false` |
| 12095 | `if(!_ch1StartOuterEnabled())return;` | `enabled()` → `enabled`; false → `DISABLED_AT_ENTRY` |
| 12096 | `setBootLoading(98,_L('시작 화면 준비 중...','Preparing starting view...'));` | `localize(ko,en)` → `L`, then `set_boot_loading(98,label)` → `setBootLoading` |
| 12097 | `let deadline=performance.now()+12000;` | `Time.get_ticks_usec()+12_000_000` → `deadline` |
| 12098–12099 | `visibleAgain` + `addEventListener('visibilitychange',…)` | own Callable connected to the bound Signal → `connect` |
| 12101 | `while(_ch1StartOuterEnabled()){` | `enabled` every loop; false → `DISABLED_IN_LOOP` |
| 12102 | `const ids=_ch1StartOuterViewIds();` | `view_ids()` → `ids` |
| 12103 | `_preloadCh1StartOuter();` | `preload_view()` → `preload` (return ignored, recorded) |
| 12104 | `ids.every(id=>_ch1StartOuterCache[id]?.status==='ready')` → return | `cache:<id>` per element, stops at first non-ready; true → `READY` / `READY_EMPTY_IDS` |
| 12105 | `ids.some(…==='error')\|\|(!document.hidden&&performance.now()>=deadline)` | `cache:<id>` until first `error`; only if none: `hidden`, and only if visible: `clock` |
| 12106–12108 | `_ch1StartOuterBootFallback=true; console.warn(…); return;` | `fallback=true`, `warn` → `FALLBACK_ERROR` / `FALLBACK_TIMEOUT` |
| 12110 | `await new Promise(resolve=>setTimeout(resolve,30));` | `timer` (§4) |
| 12112 | `finally{document.removeEventListener(…)}` | own listener disconnect on every exit (§5) |

## 2. Public API (`producer.gd`, preload; no `class_name`)

| API | Behavior |
|---|---|
| `configure(bindings: Dictionary) -> Dictionary` | `{status: "CONFIGURED"\|"NOT_READY", reason}`. Validates all keys. Invalid → clears bindings. While running → `RUNNING` |
| `await run_prepare_start_map_view() -> Dictionary` | Runs the source body once. Repeated sequential calls reuse the owner. A concurrent call → `NOT_READY/ALREADY_RUNNING` with zero source calls |
| `cancel()` | Removes the own listener immediately; the pending run returns `STOPPED/CANCELLED` after its current wait |
| `is_running() -> bool` | Busy state |
| `current_deadline_usec() -> int` | Live source `deadline` in `Time.get_ticks_usec()` units, `-1` when idle |
| Constants | `SOURCE, LOADING_PERCENT=98, TEXT_KO, TEXT_EN, DEADLINE_USEC=12000000, POLL_USEC=30000, POLL_SEC=0.03, WARNING, CALLABLE_KEYS, SIGNAL_KEY` |

### Result Dictionary

| Key | Meaning |
|---|---|
| `status` | `SOURCE_RETURNED` (the source body returned), `NOT_READY` (missing/invalid authority or NACK), `STOPPED` (lifecycle) |
| `return_path` | `DISABLED_AT_ENTRY`, `READY`, `READY_EMPTY_IDS`, `FALLBACK_ERROR`, `FALLBACK_TIMEOUT`, `DISABLED_IN_LOOP` (only with `SOURCE_RETURNED`) |
| `reason` | NOT_READY / STOPPED reason (§6) |
| `trace` | Executed source-step prefix in order, including listener events |
| `cycles, preload_calls, preload_last_ignored_return` | Loop counters; the preload return is recorded and ignored |
| `fallback_writes` | `[{value, applied}]` writer envelope per call |
| `timer_waits, early_timer_signals, early_frame_waits, min_poll_elapsed_usec` | 30 ms guard evidence |
| `deadline_resets, initial_deadline_usec, final_deadline_usec, elapsed_usec` | Deadline evidence (real monotonic µs) |
| `listener` | `{connected, disconnected, disconnect_cause ("run_end"\|"owner_exit_tree"\|"owner_predelete"\|"cancel"), events}` |
| `claims` | `full_map_ready, texture_ready, gpu_ready, native_main_ready, stage_ready, g_on` — **always false** |

Fallback success (`FALLBACK_*`) only means the source wrote the flag and warned. It is not full map, Texture, GPU, Main, stage or `G.on` readiness. `READY` only means every current cache entry for the current IDs reported `status === "ready"`.

## 3. Bindings (all required; no defaults, no no-op production providers)

| Key | Type | Source | Contract |
|---|---|---|---|
| `fallback_writer` | Callable(bool) → receipt | `_ch1StartOuterBootFallback=` | Must change the real authority. Returns `{status:"APPLIED"}`; anything else → `FALLBACK_WRITER_NACK:<value>` |
| `enabled` | Callable() → bool | `_ch1StartOuterEnabled()` | Strict `bool`; any other type → `INVALID_ENABLED` (no fallback to false) |
| `localize` | Callable(ko, en) → String | `_L` | Called with the 2 exact texts; non-String → `INVALID_LOCALIZED_TEXT` |
| `set_boot_loading` | Callable(int, String) → receipt | `setBootLoading` | Called with `98` and the localized label; non-APPLIED → `SET_BOOT_LOADING_NACK` |
| `view_ids` | Callable() → Array | `_ch1StartOuterViewIds()` | Non-Array → `INVALID_VIEW_IDS`. `[]` is valid only when returned by this provider; preload is still called before `every([])` |
| `preload_view` | Callable() | `_preloadCh1StartOuter()` | Return ignored like the source |
| `current_cache` | Callable() → Dictionary | `_ch1StartOuterCache` | Re-read per element access. `null` → `SOURCE_CACHE_NULL`; non-Dictionary → `INVALID_CACHE_AUTHORITY`. Absent / null / primitive entry or missing `status` = JS `undefined` = pending. Entry may be a Dictionary or an Object with a `status` property. Status must be the exact `String` `"ready"`/`"error"`; IDs are used as given |
| `document_hidden` | Callable() → bool | `document.hidden` | Strict `bool`; otherwise `INVALID_DOCUMENT_HIDDEN` (loop) / `INVALID_DOCUMENT_HIDDEN_IN_LISTENER` (listener, reported at the next checkpoint) |
| `warn` | Callable(String) → receipt | `console.warn` | Called with the exact `WARNING`; non-APPLIED → `WARN_NACK` |
| `visibility_changed` | Signal (0 args) | `'visibilitychange'` | Genuine `Signal` on a live Object that declares it with no arguments; otherwise `INVALID_BINDING:visibility_changed[:ARGS]` |

Validation runs in `configure` and again at run start (freed binding owners → `INVALID_BINDING:<key>`), before any source step. Missing key → `MISSING_BINDING:<key>`.

The JS assignment to `_ch1StartOuterBootFallback`, `setBootLoading` and `console.warn` have no return value. The receipt is the native **invocation envelope** contract; it is separate from the source return the source ignores (`preload_view`).

## 4. Timing

| Item | Value |
|---|---|
| Clock | `Time.get_ticks_usec()` only (real monotonic). No injected clock, no `Engine.time_scale`, no forced or shortened deadline |
| Deadline | `now + 12_000_000 µs` at 12097 |
| Listener | On each signal: reads `document_hidden`. Strict `false` → `deadline = now + 12 s`; `true` → no reset |
| Timeout check | Only when no `error` was found: read hidden; only if visible, read the clock and compare `now >= deadline` |
| Poll wait | `SceneTree.create_timer(0.03, process_always=true, process_in_physics=false, ignore_time_scale=true)` (browser `setTimeout` is independent of game pause and timeScale) |
| Guard after timer | If `now < start + 30000 µs` after the timer signal (heavy first-frame delta can fire it early), await `process_frame` until the real boundary. No enabled/IDs/preload before it. No CPU busy loop |
| Tree pause | Timer is `process_always`; `process_frame` emits while paused, so the loop continues through own-tree pause like browser timers |
| Real wall vs protocol vs GPU | Timing values are real wall µs. Visibility is a protocol fixture in tests. Physics/GPU FPS is not measured or claimed |

## 5. Listener cleanup and owner lifecycle

| Event | Behavior |
|---|---|
| Every return after connect (ready / error / timeout / disabled / NR) | `_disconnect_listener("run_end")` once (`finally` equivalent) |
| Owner exits tree during await | `NOTIFICATION_EXIT_TREE` disconnects at once (`owner_exit_tree`). The run resumes on the stored tree's timer and returns `STOPPED/OWNER_EXITED_TREE`, even if re-added before the timer fires |
| Owner freed | `NOTIFICATION_PREDELETE` disconnects. **Freeing during an await is unsupported** (the coroutine instance is gone). Detach and keep a reference until the run returns |
| `cancel()` | Disconnect at once (`cancel`), returns `STOPPED/CANCELLED` after the current wait |
| Other connections on the signal | Never touched. Only the owner's own `Callable(self, "_on_visibility_changed")` is connected or disconnected |
| Already connected own Callable | `LISTENER_ALREADY_CONNECTED`; connect error → `LISTENER_CONNECT_FAILED` |

## 6. NOT_READY / STOPPED reasons and preserved prefix

There is no rollback, all-or-none behavior, once gate, frame gate or global state. Steps already executed stay executed (for example `fallback=false` before `INVALID_ENABLED`, and `fallback=true` before `WARN_NACK`). `trace` and `fallback_writes` report the prefix.

| Reason | Point |
|---|---|
| `NOT_CONFIGURED`, `MISSING_BINDING:<k>`, `INVALID_BINDING:<k>[:ARGS]`, `OWNER_NOT_IN_TREE`, `ALREADY_RUNNING` | Before any source step |
| `FALLBACK_WRITER_NACK:false` | 12094 |
| `INVALID_ENABLED` | 12095 / 12101 |
| `INVALID_LOCALIZED_TEXT`, `SET_BOOT_LOADING_NACK` | 12096 |
| `LISTENER_ALREADY_CONNECTED`, `LISTENER_CONNECT_FAILED` | 12099 |
| `INVALID_VIEW_IDS` | 12102 |
| `SOURCE_CACHE_NULL`, `INVALID_CACHE_AUTHORITY` | 12104 / 12105 cache access (JS would throw) |
| `INVALID_DOCUMENT_HIDDEN`, `INVALID_DOCUMENT_HIDDEN_IN_LISTENER` | 12105 / 12098 |
| `FALLBACK_WRITER_NACK:true`, `WARN_NACK` | 12106 / 12107 |
| `STOPPED`: `OWNER_EXITED_TREE`, `CANCELLED` | after a 12110 wait |

Note: the `every` and `some` passes each read the cache per element exactly as the source evaluates them. They are not extra normalization reads. The owner writes nothing to G/P/lesson/global source clocks and does not touch `G.on`.

## 7. Actual native Main gap (exact)

| Needed public service | Current state |
|---|---|
| `_ch1StartOuterEnabled` port (incl. `?ch1StartOuter`, `?ch1StartPhase`, `G._bossArena` conditions in MAP_RUNTIME_ARCHITECTURE §3) | Unported / unbound |
| `_ch1StartOuterViewIds` (view chunk formula) | Unported. Not invented here |
| `_preloadCh1StartOuter` + `_ch1StartOuterCache` (64-chunk smoothing/outer set, decode/GPU warm) | Unported. Not invented here |
| `_ch1StartOuterBootFallback` holder and its terrain-fallback reader | Unported |
| Native document visibility authority (window focus/occlusion → `hidden` + 0-arg signal) | Not provided. Tests use an isolated DocumentProtocol |
| `setBootLoading` / `_L` / warning sink in native Main | Not bound |
| `source_post_stage_owner` orchestration calling `await run_prepare_start_map_view()` | Separate worker/ENGINE ownership. Binding from the actual current Main is unverified in this scope; this does not deny another worker's completed orchestration module |

Until these exist, actual NativeMainReady = **NOT_READY**. No production provider or no-op is supplied.

## 8. First checks (`test_first.gd`) — first 13 groups / 332 assertions PASS

Run: `godot --headless --path <executor fixture> --script res://port_modules/source_prepare_start_map_view_owner/test_first.gd`
Rerun FAILED/INVALID only: `… -- --groups=<group>[,<group>]` (unknown name → `INVALID_GROUP_SELECTORS`, exit 2).
Evidence class: ConstructorProtocol (RefCounted public callables that change their own state) + isolated DocumentProtocol Node with a real `visibility_changed` signal, in the script's own SceneTree. Not OS visibility, not the actual CH1 cache, not Main. No assets, PNG, Image, Sprite, Canvas or render use.

| Group | Covers | Result |
|---|---|---|
| `entry_disabled_false_first` | writer(false) first, applied to state; disabled → no L/loading/listener | FIRST PASS 21/21 |
| `empty_ids_preload_before_ready` | exact order, 2 texts, loading 98, preload before `every([])`, cache/hidden reads 0, listener restored | FIRST PASS 25/25 |
| `ready_cache_cycles` | IDs and cache change across cycles, absent/status-less pending, short-circuit read counts, lazy hidden | FIRST PASS 21/21 |
| `error_shortcircuit_no_hidden` | error stops every/some, no hidden read, exact warning, Object entry | FIRST PASS 21/21 |
| `missing_and_invalid_providers` | each missing key, invalid types, empty/arg Signal, freed authority, runtime NR prefixes, hidden null, detached owner | FIRST PASS 113/113 |
| `disabled_after_wait` | `DISABLED_IN_LOOP` after a real 30 ms wait | FIRST PASS 16/16 |
| `poll_30ms_guard` | min poll ≥ 30000 µs, loop reads ≥ 30 ms apart, early signal counters | FIRST PASS 7/7 |
| `visible_reset_deadline_listener` | hidden emit no reset; visible emit = now+12 s; pre-existing listener kept | FIRST PASS 22/22 |
| `own_tree_pause_resume` | loop continues under own `paused=true`, READY, resume | FIRST PASS 7/7 |
| `owner_exit_and_cancel` | detach → immediate disconnect, `STOPPED/OWNER_EXITED_TREE`, reuse after re-add, cancel | FIRST PASS 29/29 |
| `timeout_12s_hidden_guard` | real ≥ 12 s; hidden suppresses timeout past deadline; visible (no signal) → `FALLBACK_TIMEOUT` (~12.3 s wall) | FIRST PASS 23/23 |
| `fallback_writer_nack_warn_prefix` | writer NACK false/true, warn NACK without rollback, loading NACK | FIRST PASS 13/13 |
| `sequential_reuse_concurrent_reject` | sequential reuse, `ALREADY_RUNNING`, `RUNNING` configure | FIRST PASS 14/14 |

Every result also asserts all `claims` are false.

## 9. MAP PRODUCTION REPORT (Guide §23)

```text
================= MAP PRODUCTION REPORT =================

STAGE: CH1-1 si0/stage0 — native port of the startup resource wait only
       (game.html:12093-12113). No map content produced.

MASTER
- silhouette: not modified / unverified
- regions: not modified / unverified
- main route: not modified / unverified
- side spaces: not modified / unverified

OUTER MASS
- LEFT: not modified / unverified (locked baked outer untouched)
- RIGHT: not modified / unverified
- TOP: not modified / unverified
- SOUTH: not modified / unverified
- major holes: not modified / unverified

LARGE
- source assets: not modified / not read
- composites: not modified / unverified
- overlap: not modified / unverified
- repeated silhouette: not modified / unverified

MEDIUM
- connections: not modified / unverified
- remaining holes: not modified / unverified

GROUND
- shadow: not modified / unverified
- contamination: not modified / unverified
- structure integration: not modified / unverified

PLAYABLE
- main arenas: not modified / unverified
- travel space: not modified / unverified
- breathing space: not modified / unverified
- threat space: not modified / unverified
- combat readability: not modified / unverified

LANDMARK
- primary: not modified / unverified
- secondary: not modified / unverified
- tertiary: not modified / unverified

CAMERA QA
- START: not run (camera/placement untouched)
- EARLY: not run
- ARENA: not run
- SIDE L: not run
- SIDE R: not run
- LANDMARK: not run
- LATE: not run
- EXIT: not run

TECH QA
- route: not modified / not run
- collision: not modified / not run
- pageerror: not applicable (native) / not run
- 404: not applicable / not run
- seam: not modified / not run
- loading: first isolated 13 groups / 332 assertions PASS; actual CH1 publishers unverified;
           technical result is not a Visual PASS
- performance: not measured (no GPU/FPS/VRAM claim)

FILES
- stage-owned: godot/port_modules/source_prepare_start_map_view_owner/producer.gd,
               godot/port_modules/source_prepare_start_map_view_owner/test_first.gd,
               docs/engine/FDG_GODOT_PORT_SOURCE_PREPARE_START_MAP_VIEW_OWNER_FIRST_20261014.md
- concurrent touched: 0
- unrelated touched: 0 (geometry/camera/placement/LOCK numerics/maps/Main/State/Player/World unchanged)

GIT
- staged: no (central normal checkpoint pending)
- commit: no
- push: no
- deploy: no

VISUAL VERDICT:
RETOUCH — actual map GPU output unverified; no visual work in scope.
This technical PASS is not a Visual PASS (Guide §17, FAIL 10).

NEXT PASS: ENGINE binds the actual Map publishers (§7), then
           source_post_stage_owner orchestration and a real-Main camera board.
```

## 10. Authorship / process ledger

| Step | Record |
|---|---|
| Prewrite | 3 owned paths absent in working tree and HEAD (external record by the executor; also confirmed by failed Read of producer/doc before the first Write) |
| Reads | Guide 1047 lines whole, `_MAP_SSOT_INDEX.md` 68 lines whole, MAP_RUNTIME_ARCHITECTURE.md lines 1–319 (start-outer §3 lines 83–87 used), source_startup_activation doc, canonical game.html 12093–12117 |
| Read deviations (kept on record) | `/Users/fordeargamers/the-exoduser/R/game.html` and `/Users/fordeargamers/Projects/exoduser-migration-20261001/R/game.html` do not exist (2 errors). `/Users/fordeargamers/the-exoduser/game.html:12093-12117` was read once. It is a non-canonical variant, and its contents were not adopted, copied or used as evidence |
| Interruption | Codex executor sent SIGINT to its own CLI process group before any Write, confirmed exit, then resumed the same session/default model after the absolute canonical path correction. Human apps/threads were not interrupted |
| Writes | The 3 owned paths only. One pretest self-Edit pass on `test_first.gd` (identity assertion, concurrent-call order equality, `PackedStringArray` join). First isolated test run: 13 unique groups / 332 assertions PASS; runtime FAIL0/INVALID0/post-test product or fixture repair0/success-repeat0. Bash/Glob/Grep/MCP/Agent: 0 |
| Old scripts/tests/assets | Read/copy/run: 0 |

## 11. Next (ENGINE)

1. First run completed. Source/test and their successful episode are frozen; old success reruns0.
2. Port and bind the actual Map publishers in §7. Do not substitute constructor protocols.
3. Call `await run_prepare_start_map_view()` from the actual `source_post_stage_owner` (64466–64481 continuation) and keep `SOURCE_RETURNED` separate from Main/stage/`G.on` readiness.
4. Related existing docs keyword search / sync and code+docs checkpoint: PENDING.

## 12. Final actual runtime / authority receipt

| Item | First observed fact |
|---|---|
| Actual CLI | Initial PID55648, session `f25f5494-6e94-4cea-b450-bf6020aab3bc`; path correction before Write/test, own exit confirmed; resumed PID56135, configured default `claude-opus-5-5`, 493267ms success, permission denial0 on resumed execution |
| Read/Write | restricted/dontAsk, exact Read8 and Write/Edit3. Wrong workspace and two literal R paths explicitly Read-denied after correction; permissions expanded0. Guide1047/index68 full read once; no reread after correction |
| Source path deviation | Workspace source25lines Read1/1367content characters and nonexistent R-path errors2 preserved. Canonical migration absolute path12093..12117 re-read successfully; non-canonical contents not adopted. No source HTML edit/copy/hash |
| First native test | Godot4.7.2.stable.official.ed1daf0bf, headless, 13.536904542s, exit0, stderr0/SCRIPT_ERROR0. Unique13/332 PASS, runtime FAIL0/INVALID0, post-test source/test edits0, successful repeat0 |
| 30ms guard | Actual early timer signals7 / additional process_frame waits7. Minimum measured poll33535µs. Real loop gaps were at least30000µs; timer.signal alone was not treated as wall elapsed |
| Timeout / hidden | Actual timeout group12319ms. Real monotonic deadline12s was crossed while constructor document was hidden; timeout stayed suppressed. Constructor current visible value was later changed without emitting a visibility signal specifically to exercise the current-visibility timeout branch. This is protocol boundary evidence, not OS visibility behavior |
| Visibility reset | Genuine isolated DocumentProtocol signal invoked the actual owner listener. Hidden event did not reset; visible event reset deadline to real now+12s. Pre-existing listeners remained installed |
| Pause / lifecycle | Own isolated Tree paused/resumed; loop still progressed with real process-always timers. Own Node detached/cancelled and listener disconnected. Node retained until await returned; freeing during await remains unsupported |
| Actual publishers | CH1 current enabled/viewIDs/cache/preloader/fallback holder/OS visibility/boot loading/localizer/warning are not installed or verified by these constructor protocol suppliers. Actual NativeMain/current map authority remains NOT_READY/unverified |
| Return authority | `SOURCE_RETURNED` is only this source body return. Fallback error/timeout are normal source returns, not Texture READY. Actual result has no `authority_owner` field; caller must bind and validate the real source owner separately, never invent one from the fixture/result |
| Source claims | full_map_ready/texture_ready/gpu_ready/native_main_ready/stage_ready/g_on all false in every result; tests assert this. Constructor current cache cannot be adopted as actual Main/map readiness |
| Script closure / resources | GD closure2, both newly owned. No old source helper/test/proof read/copy/run; assets/PNG/hash/import0. Fresh custom userdir `EXODUSER-SourcePrepareStartMapView-Isolated-20261014` |
| Clock / renderer | Module explicit source game-clock advances0/render0. Native engine automatic physics/render tick counts not measured and not inferred from wall time. GPU/pixels/1080p240/VRAM evidence0 |
| Remaining integration | Public API/result/constructor-vs-actual authority contract handed to source_post_stage_owner worker. Existing common docs path-only list and normal code+docs checkpoint remain ENGINE ownership |

Final new-only external receipt: `E/godot-native-first/team-port/source_prepare_start_map_view_owner/{prewrite.json,path-correction.json,claude-launch.json,claude-resume-launch.json,claude-resume-result.json,test-attempt1.json,test-ledger.json,handoff.json,related-doc-paths.json}`. Human paused Main/Web/browser, save/userQA/server/shipping artifacts and sharedMainState/Player/World remain untouched; Git mutation0.
