## 실제 Claude 작성 — boot-map 대기 수명 연결 (2026-10-14)

| 현재 계약 | 구현·검증·미완 |
|---|---|
| 실제 작성자 | Claude CLI default claude-opus-5-5, session e40c6505-ef6a-4b9a-bef5-90fe6830e9f0/최초PID72496/수명guard후속PID72743. restricted/dontAsk/Read16·Edit7성공/오류0·World만쓰기. Codex는Main1줄 binding/새consumer/docs/소유checkpoint만 담당. |
| World 실제 초기값 | schema fdg.native-world-source-boot-map-build.v1, defer0/queued0/promisenull/resolver미설치. bind_native_boot_map_source_state(state:Node,builder:Callable=Callable())->Dictionary는실제Worldchild/sourceState정확script/Tree/현재G.map필드와builder0argowner검증. Main은기존source_state를직접bind한다. |
| 공개API | set_native_boot_map_defer(value:Variant)->bool은finite숫자만/liveowner, 자동stage호출0. queue_native_boot_map_build()->Dictionary는실제owned NativeBootMapBuildHandle을promise키에반환/queued중같은handle재사용. read_native_boot_map_build_promise()->Variant는현재handle/null, owner·bindinglossnull. await_native_boot_map_build(handle:Variant)->Dictionary는await/liveowner·samehandleowner/epoch필수. get_source_boot_map_build_publication()->Dictionary는실현재defer/queued/promise/resolveridentity/epoch/physicalowner와미완경계게시. |
| 실제native대기 | sameWorld가실제SceneTree.process_frame을2회await. 두번째그때actualsourceState.read_current_g().map을읽는다. 실제현재mapnull일때builder생략/SOURCE_FULFILLED, source_promise_fulfilledtrue는이queueoperation만. queued0→resolver캡처→resolver/promise비움→finished(result)순서. 원JSfallback16ms·browserRAF동등미증명. |
| 취소·오류 | liveowner/epoch/state/handle검사, exit는CANCELLED/source_promise_fulfilledfalse로pendingsettle후ownedrefs철회. maptruthy/builder없으면NOT_READY:SOURCE_BOOT_MAP_BUILDER_MISSING, 실제cache성공0. GDScriptbuilder실행오류는catch/원throwparity미지원, builder_error_observablefalse/map_cache_verifiedfalse. |
| 원sourcecall·하류gap | source26051fileinit/26052..69queue/finally,initStage32322 및caller64463..72 defer1→initStage→0→currentpromisetruthy일때await. 이번원stagecaller자동실행0. 실제PostStage가요구하는RESOLVED packet과새nativeSOURCE_FULFILLED를아직직접bind하지않음. Stage/cache/promise대기전체완료로승격0. |
| 새최초검수 | actualMain1 FIRST13/13 PASS6.120741초/exit0/SCRIPT·Parse·ERROR0/기존CameraWarning1. 실제mapnull/handle재사용/1framepending→2framesfulfill/finally순서/foreign거절/exitcancel·cachedauthority거절만검수. 실행前정적수명guard4보완, 기존successfulsuite재연0. |

내부값은SOURCE_BOOT_MAP_STATE_SCRIPT=res://scripts/native_source_new_run_state.gd/SCHEDULER_SCOPE=native_two_scene_tree_process_frame_awaits다. state WeakRef/instanceID,builderCallable/ownerID,bindingUNBOUND→BOUND→OWNER_EXITED,epoch1→bind/철회증가,error빈문자열,closedfalse,defer0,queued0,promise/resolver,queue_sequence0,in_builder/in_resolvefalse,last_result빈Dict를실소유한다. NativeBootMapBuildHandle은ownerWeakRef/ID/epoch/sequence/frames0/finishedfalse/result빈Dict,finished(result)실signal과 is_finished()/get_result()를제공한다. 실제stage_map·buildMapCachewriter·GPU/browserparity·sourceG.onwriter·CSSraster5/fullOBJWait미완은false/NOT_READY유지한다.

MAP PRODUCTION REPORT: source현재Greader와bootqueueowner만연결; geometry/nav/collision/placement/outermass/renderer변경0/CAMERA QA미실행/TECH새13scope만. **VISUAL VERDICT: RETOUCH.** old13/meta·OBJ14/extra23+2/원모듈성공검사/PNG자료read/hash/copy/import0,새helper·productJSON·testleaf0,인간화면/save/API/3333조작0. 캐릭터24고유장24FPS/전체게임완성은미완이다.

## 2026-10-14 원본 OBJ 실제 생성·현재 참조 반영

| 현재 범위 | 구현·최초 검증 |
|---|---|
| sameMain/World actualoriginal | sourcekeys285→actualRaw265(initial33+deco230+dragon2)/sharedgroups11·sharedkeys31·alias20. native28/approx23과구분. realrequest265/deferred38→CPUCanvas33(hard14/key14/edge4/luma1), CSS5exactunsupportedNR. |
| 실제currentfields/lifetime | firstd.id만Canvas교체/aliasraw유지. OBJCanvascompletetrue/실NWNH/srcdeclaredUndefined; extra3undefined정책과scope·epoch분리. sameRaw230decoerrorFB64retry코드/actualfallbackruntime0. cancelobjectonly/exit각registry철회. |
| 미완권위 | CSS5processinggap+edge原_METAwritegap4; wholeOBJpublication/Wait/StageNR/sourceG.onfalse. nativeGPU/BrowserCanvaspixelparity/24unique24FPS미완. |
| 새resource·검수 | 신규original184/179358354B/sourcehash184+desthash184/byteidenticalcopy184/import184exit0/sidecar184. exactalready2재사용·oldproof/hash/copy/import0. actualMain1 FIRST14/14 PASS8.48416초/ERROR0/CameraWarning1/product수리0/oldsuccess재연0. signal828=265construct+265pending+265loaded+33Canvas. |

정확 API·수치·원필터5·edge4·특수필드·신규184bytes와미완경계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 OBJ 실제 생성·현재 참조 이식」을 따른다. 이전257missing은nativepathsubset이력이고원original현재285refs와구분한다. 285keys≠265Images≠186originalfiles≠new184를구분한다.

MAP PRODUCTION REPORT: registry/resourceonly,geometry/nav/collision/placement/outermass/기존renderer변경0; CAMERA QA미실행/TECH새14scope만. **VISUAL VERDICT: RETOUCH.**

## 2026-10-14 원본 키·boot-label 소비 반영

| 범위 | 현재 결과 |
|---|---|
| 실제 PostStage Node callback 연결 | 실currentG/P0/T1/HUD2/actualWaitNode1/actualPrepareNode0/hide0를bind. invalid=[]/missingboss_request·runNR/prefixempty/completionnull. boss=-1등 fakeprovider0/autoRun0. |

새 actualMain1/24 firstPASS(1.975504125초), ERROR0/CameraWarning1/수리·oldsuccess재연0. sourceG.onfalse/전체source·GPU·24장24FPS 미완. 정확API·완전성·lifetime은 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 이미지 키 매핑·실제 시작 모듈 소비」를 따른다. 아래 최초 source/standalone 이력과 이번 native subset을 구분한다.

## 2026-10-14 중앙 native 공급 반영

| 범위 | 현재 구현 | 남은 계약 |
|---|---|---|
| 중앙 보존 및 현재 공급 | standalone producer15912B/원 final doc 정상checkpoint에 포함. 유효8군228=초기2군14+invalid/실패6군214 선택검사, raw650의FAIL/INVALID 이력·full-final8재연0을 보존. Main에 실제 native loading/hide·OPT.lang2arg localizer·Window compatibility·Wait Node caller가 추가됐다. | 이 owner의 actual Main caller는 여전히0. localize1arg _T에 Main2arg _L를 직접 연결하지 않는다. 원 image/extra/CH1cache·initStage gap/force/BGM/dbReady/Save actualprimitive 미완. completionnull/Mainfalse/source63808 writer0·구 Intro22/28 미채택 유지. |

새 실제 검사 이력·정확 API·수명/원본 source 경계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「실제 네이티브 로딩 공급 연결」을 따른다. 이 문서의 아래 최초 standalone/원 HTML 이력과 이번 Main native subset은 구분한다. protected 인간 game/서버3333/save/UI 조작0.

# FDG Godot port — source postStage owner (first slice, 2026-10-14)

Module: `godot/port_modules/source_post_stage_owner/` (`producer.gd`, `test_first.gd`).
Status: code and test **frozen** (SHA recorded externally by the executor). Valid adopted history: 8 unique groups / 228 checks PASS (§9). This is **not** a full final 8-group suite run. `main_ready=false` always, even when the owner's own status is `COMPLETED`: no actual Main is bound.

## 1. Source (canonical `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`)

Predecessor (not owned): 64464 `initStage(G.stage)`. Owned scope 64466–64481:

| Line | Source | Native step (`completed_prefix` id) |
|---|---|---|
| 64466 | `if(_bossTestReq<0){` | `STEP_BOSS_READ` (boss read once, before any service) |
| 64467 | `setBootLoading(90,_T('맵 에셋 로딩...'))` | `localize` → `set_boot_loading(90,label)` |
| 64468 | `await _waitObjSprites(8000)` | `await wait_obj_sprites(8000)` |
| 64469 | `await new Promise(r=>setTimeout(r,0))` | `await get_tree().create_timer(0.0).timeout` (actual SceneTree) |
| 64470 | `if(_bootMapBuildPromise){` | `boot_map_build_promise()` read **only now**, JS truthiness |
| 64471 | `setBootLoading(97,_T('맵 캐시 생성 중...'))` | `localize` → `set_boot_loading(97,label)` |
| 64472 | `await _bootMapBuildPromise` | `await await_boot_map_build(promise)` |
| 64475 | `if(!(_forceCutscene\|\|(G.stage===0&&!G._cutsceneDone)))BGM.play(BGM.stageKey(G.stage))` | `force_cutscene()` + `current_g()` re-read **after** waits; strict numeric 0; then `bgm_stage_key(stage)` → `bgm_play(key)` |
| 64476 | `await _prepareStartMapView()` | `await prepare_start_map_view()` |
| 64477 | `setBootLoading(100,'완료')` | `set_boot_loading(100,"완료")` (literal, **no** localize) |
| 64478 | `hideBootLoading()` | `hide_boot_loading()` |
| 64479 | `_dbReady=true` | `set_db_ready(true)` |
| 64480 | `startAutoSave()` | `start_auto_save()` (registration) |
| 64481 | `_rootRiftViewScheduleBootSave()` | `schedule_boot_save()` (registration) |

Boss ≥ 0 skips 64467–64473 entirely. Not owned: 64483 onward (G.on / iframes / intro), `_prepareStartMapView` body 12093–12117, `_waitObjSprites` body, save timers/poll/save body.

## 2. Public API (`producer.gd`, `extends Node`, preload, no `class_name`)

| API | Behavior |
|---|---|
| `configure(bindings: Dictionary) -> Dictionary` | `{status: CONFIGURED\|NOT_READY, missing, invalid, main_ready:false}`. Each binding is a valid Callable with non-null owner and exact arity; RefCounted owners held strongly. |
| `async run_post_stage() -> Dictionary` | `{status: COMPLETED\|NOT_READY, reason, completed_prefix, completion, main_ready:false}`. Requires own node in tree at entry (`NOT_IN_TREE`). Concurrent call on same instance → `RUN_IN_PROGRESS` (transport guard, not a gameplay once/frame gate). Sequential runs reset completion to null and re-read everything. |
| `completion() -> Dictionary\|null` | bind as Startup `post_stage_completion` (`Callable(owner,"completion")`). Returns null while pending, after any NR, or when owner is detached/queued for deletion. |

Completion packet (published only after every step returned): `contract=Startup.CONTRACT_POST_STAGE`, `source_owner=Startup.POST_STAGE_SOURCE_OWNER`, `completed_boundaries=Startup.POST_STAGE_BOUNDARIES` (8), `authority_owner=self`, `authority_g`/`authority_p` = identities read at start and re-verified at the end, `boss_request_observed` = value as read. Only these three Startup public constants are reused; boss domain and G field presence are local readers.

## 3. Services (binding name, arity, required result)

| Binding | Arity | Required result | Kind |
|---|---|---|---|
| `current_g` | 0 | non-null Dictionary/Object (`SOURCE_G_NULL`, `INVALID_G_AUTHORITY`) | reader |
| `current_p` | 0 | null (actual) or Dictionary/Object (`INVALID_P_AUTHORITY`) | reader |
| `boss_request` | 0 | int / finite integral float ≥ -1 (`INVALID_BOSS_REQUEST`) | reader |
| `force_cutscene` | 0 | any; JS truthiness | reader |
| `localize` | 1 | String (`LOCALIZE_NOT_STRING`) | pure |
| `set_boot_loading` | 2 | `{status:"APPLIED"}` | sync mutator |
| `wait_obj_sprites` | 1 | awaited peer packet, §4 | async |
| `boot_map_build_promise` | 0 | raw current value | reader |
| `await_boot_map_build` | 1 | awaited `{status:"RESOLVED"}` | async bridge |
| `bgm_stage_key` | 1 | String | pure |
| `bgm_play` | 1 | `{status:"APPLIED"}` | sync mutator |
| `prepare_start_map_view` | 0 | awaited peer result, §4 | async |
| `hide_boot_loading` | 0 | `{status:"APPLIED"}` | sync mutator |
| `set_db_ready` | 1 (`true`) | `{status:"APPLIED"}` | sync mutator |
| `start_auto_save` / `schedule_boot_save` | 0 | `{ready:true,status:"SCHEDULED",id,due_ms,ticketed:bool}` | save owner registration only, not save completion |

Bare `true`/ACK is rejected (`<KEY>_NOT_APPLIED:<status>`). Diagnostic suffix is `<status>`, or `<status>:<reason>` when the returned Dictionary carries `reason`, else `<status>:<not_ready_reason>` (peer wait key). Diagnostic text only; acceptance is unaffected. Missing binding → `MISSING_BINDING:<key>`; freed owner → `BINDING_OWNER_FREED:<key>`.

## 4. Peer seams

| Seam | Actual binding | Accepted | Rejected |
|---|---|---|---|
| sprite wait | peer `source_object_sprite_wait_owner` Node after `bind_source_providers(obj, globals, image_authority)`; `Callable(peer,"wait_obj_sprites")` | `schema=fdg.source_object_sprite_wait_owner.packet.v1`, `source_ref=game.html:18787-18800 _waitObjSprites(timeout)`, `terminal=SOURCE_RESOLVED`, `source_resolved=true`, `status∈{SOURCE_WAIT_COMPLETED,SOURCE_WAIT_TIMED_OUT}`, `publication_verdict=ACTUAL_PUBLICATION_DECLARED_BY_ALL_READS`, **and** `authority_owner` `is_same` the bound Callable's `get_object()`, which is a valid Node with `is_inside_tree()`, **and** `owner_in_tree==true`. Timeout continues (source semantics). Texture/stage readiness NOT required. | `UNVERIFIED_SOURCE_WAIT_*` / `UNVERIFIED_CONSTRUCTOR_PROTOCOL_PRESENT` even with `source_resolved=true`; null / label / foreign / detached owner; `owner_in_tree` false → `WAIT_OBJ_SPRITES_NOT_SOURCE_RESOLVED`, prefix ends at `64467`, no timer/promise |
| prepare | peer `res://port_modules/source_prepare_start_map_view_owner/producer.gd` Node: `configure(bindings)` (9 Callables `fallback_writer(bool)`, `enabled()`, `localize(ko,en)`, `set_boot_loading(pct,label)`, `view_ids()`, `preload_view()`, `current_cache()`, `document_hidden()`, `warn(text)` + zero-arg Signal `visibility_changed`); `Callable(prepareOwner,"run_prepare_start_map_view")` | `status=SOURCE_RETURNED`, `return_path ∈ {DISABLED_AT_ENTRY, DISABLED_IN_LOOP, READY, READY_EMPTY_IDS, FALLBACK_ERROR, FALLBACK_TIMEOUT}`; readiness flags live in nested `claims` Dictionary (all false) and are not required | `NOT_READY`, `STOPPED`, `COMPLETED` alias → `PREPARE_START_MAP_VIEW_NOT_RETURNED` |
| save | `save_adapter/source_save_lifecycle_owner.gd` public `start_auto_save` / `schedule_boot_save` | `SCHEDULED` packet | its NR → `<KEY>_NOT_SCHEDULED:NOT_READY`; no poll/save body here |

## 5. Failure / lifetime

- Any NR: `completion` null, `completed_prefix` lists steps done, those side effects are kept (no rollback), no later service is called.
- After each await: owner freed / queued / out of tree → `OWNER_STOPPED`.
- G identity re-read at 64475 and at the end, P at the end; change → `CURRENT_G_CHANGED` / `CURRENT_P_CHANGED`. Missing reader (`MISSING_BINDING:current_p`) ≠ actual P null (completes with `authority_p=null`).
- Producer never writes G/P, never creates world/data/assets.

## 6. Actual vs protocol fixture

| Real code exercised by tests | Protocol fixture only (`Fx`, SOURCE_PROTOCOL_FIXTURE) |
|---|---|
| producer Node invoke order, `await` on fixture coroutines resumed by fixture signals, actual `SceneTree.create_timer(0.0)` yield (frame count measured), tree/lifetime checks | G/P dicts, boss/force values, localize, loading, BGM, hide, db_ready callbacks |
| actual save lifecycle owner `start_auto_save`/`schedule_boot_save` (fixture clock/rift bindings) | sprite wait packet and prepare result shapes (peer owners not bound) |
| actual Startup `plan()` consuming `completion()` (no `activate`, no sink, no G.on/iframes write) | promise object (`FakePromise`) |
| actual prepare owner Node `run_prepare_start_map_view()` invoked and awaited by the post-stage owner (`real_prepare`) | `PrepFx` callbacks with explicit input `enabled=false` (not a production fallback); `visibility_changed` fixture Signal (not OS visibility) |

`Fx` is a Node attached to the test tree so the wait-owner identity/tree gate is exercised; it adds `authority_owner=self` / `owner_in_tree=is_inside_tree()` only when the case did not supply them. It is not a published image bank.

Fixture positives do **not** attest actual Main, tree assets, sprite publisher, map view, BGM or save data. Positive custom service callbacks are SOURCE_PROTOCOL_FIXTURE: not a raw image publisher, not actual OS visibility, not Main, not an asset proof.

Real owners exercised (each a new affected consumer only; their old suites not read or re-run):
- **Save lifecycle owner:** 2 public registrations per run (`start_auto_save`, `schedule_boot_save`). No poll, settle or save I/O.
- **Sprite wait owner:** real but unbound, so `OBJ_SPR_PROVIDER_MISSING`.
- **Prepare owner:** real disabled-at-entry path, so `SOURCE_RETURNED` with `claims` all false.
- **Startup:** `plan()` only. Sink calls 0; `G.on` / `P.iframes` writes 0.

A sprite-wait `SOURCE_RESOLVED` packet is a declared receipt, not Texture/image validation. The source-contract completion is published only after the Node body actually invoked and awaited each step. The API alone does not prove that actual Main is installed or that the original services executed.

Zero for this slice: actual Main, actual source image publisher, full map, GPU, FPS 240, Texture READY, completed save.

## 7. Remaining exact gaps (ENGINE / central)

No basic `false` / `-1` / G fallback is invented for any of these; each stays unbound or NR.

| Gap | Effect now |
|---|---|
| Upstream Main `initStage` (64464) phase → `run_post_stage()` binding | none; `main_ready=false` |
| Actual current G / P / boss request / `_forceCutscene` readers from Main State | unbound |
| Live `_T` localize, `setBootLoading`, `hideBootLoading`, `BGM.stageKey/play`, `_dbReady` owners | unbound |
| Actual `_bootMapBuildPromise` reader + await bridge | unbound |
| Sprite wait owner with real raw image publication providers (`bind_source_providers`) | unbound → `OBJ_SPR_PROVIDER_MISSING` NR |
| Prepare owner with real view ids / visibility / current cache / preload bindings | unbound (only fixture disabled-at-entry exercised) |
| Save owner live clock / collector / slot / rift bindings | unbound; collector/slot Main NR |

## 8. Tests (`test_first.gd`, frozen; adopted results in §9)

Run: `godot --headless --path godot -s res://port_modules/source_post_stage_owner/test_first.gd -- --group=NAME` (exit 0 pass, 1 fail, 2 watchdog 20 s, 3 invalid group). Ledger line prints headless / explicit groups / render none / public play none. Each group reports `checks` (delta of `_check` calls) and fails if 0 checks ran; final line `SUMMARY {groups, checks, failures, process_frames, physics_frames, fixture, main_ready:false}`.

| Group | Covers |
|---|---|
| `pipeline` | pending sprite/promise/prepare signals block following steps; timer 0 yields ≥1 frame; promise read after timer; force/G read after promise; exact full call order; concurrent `RUN_IN_PROGRESS`; completion packet fields |
| `boss` | boss 0 / 2 / 0.0 skip all sprite/map calls; observed value preserved; invalid boss values NR with no later calls |
| `branches` | BGM strict stage 0 / force truthy / cutscene falsy table; falsy promise skips 97; wait TIMED_OUT continues; all 6 prepare return paths |
| `failure` | missing prepare NR prefix; UNVERIFIED wait; wait owner null / label / foreign / `owner_in_tree` false / detached (with and without `owner_in_tree:true`) stop before timer; prepare NOT_READY/STOPPED/COMPLETED; bare bool; rejected promise; save NR; sequential rerun; G/P reader cases |
| `identity` | G/P swap; detach during await; not in tree at entry; completion null after detach; freed Node service |
| `startup` | Startup `plan()` PENDING → READY NONZERO_300 → boss mismatch; sink 0, no G.on/P.iframes write |
| `real_wait_missing` | actual wait owner Node in tree, **no** `bind_source_providers`: direct `wait_obj_sprites(8000)` → `NOT_READY` / `OBJ_SPR_PROVIDER_MISSING` / `source_resolved=false` / `authority_owner` self. Fresh wait Node bound into the post-stage owner (boss -1): `WAIT_OBJ_SPRITES_NOT_SOURCE_RESOLVED:NOT_READY:OBJ_SPR_PROVIDER_MISSING`, prefix `[64466, 64467]`; timer 0 / promise / BGM / prepare / 100 / hide / dbReady / save never called; completion null. Real missing dependency, no providers or image state injected. |
| `real_prepare` | actual prepare owner direct: `SOURCE_RETURNED`/`DISABLED_AT_ENTRY`, `claims` Dictionary with 6 flags false (flags nested in `claims`, not top-level); post-stage owner (boss 0) invokes/awaits it after the BGM gate and before loading 100. No Main / full map / OS visibility claim. |

## 9. Execution ledger

- Turn 1 (code-first instruction narrowed scope): producer only written.
- First isolated compile `--check-only`: exit 0 but 3 parse errors (untyped `:=` bools at gate), dependency compile 1, engine error 1 → **INVALID**, 0 test groups executed.
- Turn 2: typed bools; private Startup helpers replaced by local readers; exact peer wait / prepare seams; tree-entry and detached-completion checks; test and doc added. Not yet compiled/run.
- Turn 3 (before first test execution): wait gate adds bound-owner identity + Node in tree + `owner_in_tree`; `Fx` became a tree Node; owner failure cases; check counter + per-group delta + SUMMARY JSON; new `real_prepare` group using the actual prepare owner. Successful groups so far: 0. Not yet compiled/run.
- Turn 4 (pre-first-execution fixture correction, not an executed FAIL): `real_prepare` reads flags from nested `claims`; new `real_wait_missing` group (actual unbound wait owner); `_status_of` appends upstream `reason`. 8 groups planned, each must report checks > 0. Actual Main unbound (`main_ready=false`); actual source image publication positive: 0. Not yet compiled/run.
- **First runtime (executor, all 8 groups, partial history):** raw 222 checks.
  - Valid PASS: `identity` 9 checks, `startup` 5 checks (2 groups / 14 checks, 0 fail) → frozen; not re-run, read or edited.
  - INVALID: `pipeline` 17 checks — `_main` started inside `SceneTree._initialize` before root/children entered the tree; 2 engine errors (`Array.back()` on empty log) localized to pipeline; 4 ObjectDB leaks from the invalid pipeline's unreleased coroutines (test harness, not gameplay/Main). Excluded from results.
  - FAIL: 5 groups / 191 checks / 36 assert fails — `boss` 42/6, `branches` 58/23, `failure` 62/4, `real_prepare` 14/1, `real_wait_missing` 15/2. Total assert fails 47 including the 11 from invalid pipeline.
  - External minimal probe: production async Callable await (Signal pending → resume) correct, 0 errors → no async-flow product repair.
- Turn 5 corrections (fixture tree/lifetime + 1 diagnostic; source/type/service body fixes: 0):
  - `_initialize` → `call_deferred("_main")`; `_main` awaits the first native `process_frame` before any group.
  - `pipeline` `log.back()` asserts guarded; `completed_prefix` last element read via `_last()` (null on empty).
  - Save lifecycle owner (RefCounted) was freed after `_bindings` returned (Callables are not strong refs) → now held in `Fx.save_owner`. Registration only: fixture clock 1000 → due 31000 (auto) / 4000 (boot); not actual Main / wall clock. Actual collector/slot remain Main NR; no poll/settle/save body.
  - Peer wait NOT_READY key is `not_ready_reason` (not `reason`); `real_wait_missing` direct assertion fixed; producer `_status_of` falls back to `not_ready_reason` (diagnostic only; acceptance/run flow unchanged).
  - Next run: selectors `pipeline, boss, branches, failure, real_prepare, real_wait_missing` only (no full 8, no identity/startup repeat). Not yet run.
- **Second runtime (6 selected groups):** raw PASS 214 checks, 43 process / 23 physics frames, but shutdown 1 WARNING (8 ObjectDB instances) + 1 ERROR (1 resource still in use) → **INVALID 6/214, not adopted**. `identity`/`startup` stay frozen (not re-run).
  - Cause (fixture): `failure` owner cases "owner detached" and "owner detached, claims in_tree" removed 2 `Fx` Nodes from the tree and never freed them; each holds a save owner (RefCounted), keeping script resources alive.
  - Turn 6 fix (test cleanup only; no assertion, source flow or production change): each detached `Fx` is freed (save owner ref cleared) right after its completed run and asserts; `_main` awaits 2 native `process_frame`s to flush queued frees before `quit`.
  - Same 6 groups pending recheck only; no semantic FAIL and no product flow repair.
- **Third runtime (same 6 groups only):** first VALID result. 214 checks PASS; fail 0, script errors 0, engine errors 0, stderr 0, exit 0.
  - Frames: 43 process / 23 physics, as measured in SUMMARY. The 2 cleanup-flush process frames come after SUMMARY; physics frames during the flush were not measured.
  - Native headless runtime 0.558924 s. This is not FPS or GPU evidence.
- Separate: initial code compile INVALID (3 parse errors, 0 groups). FPS / pixels / public play / actual Main G.on writes: 0.

### 9.1 Attempt table

| Attempt | Scope | Raw | Verdict |
|---|---|---|---|
| Compile `--check-only` | producer | 3 parse + 1 dependency compile + 1 engine error | INVALID, 0 groups |
| Runtime 1 | all 8 | 222 checks | `identity` 9 + `startup` 5 valid PASS (adopted); `pipeline` 17 INVALID (2 `Array.back` engine errors); 5 groups / 191 checks FAIL (36 assert fails; 47 raw incl. pipeline's 11). Shutdown 1 WARNING: 4 ObjectDB instances. |
| Runtime 2 | `pipeline`, `boss`, `branches`, `failure`, `real_prepare`, `real_wait_missing` | 214 checks all PASS | INVALID, not adopted: 1 WARNING (8 ObjectDB instances) + 1 ERROR (1 resource in use) |
| Runtime 3 | same 6 | 214 checks PASS, clean stderr, exit 0 | first VALID → adopted |

- Total actual runtime checks: 650 = 222 + 214 + 214.
- That splits as 228 unique adopted PASS + 191 FAIL + 17 invalid (`pipeline`, runtime 1) + 214 invalid (runtime 2) = 650.
- Adopted valid history: 8 unique groups / 228 checks = 14 (`identity` + `startup`, runtime 1) + 214 (runtime 3).
- There was no full final 8-group run, no repeat of a passed group, and no suite-wide final recheck. The `identity` / `startup` function bytes are unchanged and frozen. The shared global helpers and fixture changed later (tree defer, strong save-owner hold); the assertion bodies of those 2 groups were not edited.

### 9.2 Repairs (separated)

| Phase | Repair | Production flow change |
|---|---|---|
| First compile | 3 `bool` explicit types | — |
| Pre-first test | private Startup helpers removed (3 public constants only) | — |
| Pre-first test | peer wait schema / status / owner identity / in-tree gate; UNVERIFIED rejection | acceptance seam per peer API |
| Pre-first test | peer prepare `SOURCE_RETURNED` + 6 paths accepted; `claims` false | acceptance seam per peer API |
| Pre-first test | test check counter; `claims` nesting | test only |
| Post runtime 1 | fixture defer / tree timing; save RefCounted lifetime; `Array.back` guard | test only |
| Post runtime 1 | producer `_status_of` relays child `not_ready_reason` | diagnostic only |
| Post runtime 1 | external `Callable.callv` signal pending/resume probe: clean | none (async source flow fix 0) |
| Post runtime 2 | free 2 detached `Fx` nodes owning save refs; 2 tree frame flush | test only (production edit 0) |

## 10. Session record and handoff

| Item | Record |
|---|---|
| CLI session | `e7d08b98-5f46-4aff-b16d-9e86e6233252`; configured `claude-opus-5-5`, no model override, dontAsk |
| Tools | Read / Write / Edit on the exact allowlist (9 Read paths, 3 Write/Edit paths). Bash, Glob, Grep, MCP, GUI, Agent and settings use: 0. Permission denials: 0. |
| PID 55318 | interrupted after over-planning; 0 writes |
| PID 56084 | code-first rerun in the same session, approved by the parent; wrote the producer body (95 s) |
| PIDs 56593, 57801, 58372 | pre-first-test fixes |
| PID 59148 | failed fixture / diagnostic fix |
| PID 59699 | runtime 2 cleanup |
| PID 60043 | final doc-only turn, same session, ended successfully; observed Read/Edit of this new doc only |
| Failed edit | During the cleanup turn, one producer Edit had a nonsense search string and failed. No bytes changed. This was not a permission denial. |
| Unchanged | actors, world, shared docs, root Git, save servers, GUI, PNG imports |
| Related docs | 15 allowed metadata-only keyword matches, handed to ENGINE; protected `INGAME_CAPTURE_STUDIO_20261009.md` excluded |
| Pending | central code + docs checkpoint by ENGINE |

Final API: `configure(bindings) -> Dictionary`, `async run_post_stage() -> Dictionary`, `completion() -> Dictionary|null` (§2–§4).

Handoff:
- **ENGINE / central:** Main binding and every live service in §7, plus the central checkpoint.
- **Peer owners:** sprite wait providers and prepare bindings.
- **This module** owns only the three new paths.
