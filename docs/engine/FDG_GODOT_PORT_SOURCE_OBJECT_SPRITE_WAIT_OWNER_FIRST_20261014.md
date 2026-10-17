> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

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

## 2026-10-14 원본 OBJ metadata 현재owner 반영

| 현재 범위 | 코드·최초 검증 |
|---|---|
| originalsameWorld metadata | 원초기77→CHDECO250in-place merges/기존31sameDict/현재296key. RHS28원JSfalsy·optionalfield조건보존/knownundefined4226은present키+null+declaredUndefinedmask/untouchedabsent와분리. |
| 원current후처리쓰기 | 실제edge4현재Canvas교체뒤samecurrentMeta _edgeErasednumeric1작성/원Metaamount유지/metadatawritegap4해소. CSS5실처리미완 _filterBakedwrite0/strictfullOBJ·WaitStageNR/sourceG.onfalse. |
| API·수명 | get_source_object_meta_publication()0arg / get_native_source_object_meta(key,field="")2arg(currentref/present/mask) / signal native_source_object_meta_changed(key,meta,phase). INITIALIZED77+MERGED250+CALLBACK_WRITE4=331events/epoch·ref·lifetime/신호재진입취소guard/namespacewithdraw. |
| 새검수 | actualMain1 FIRST13/13 PASS7.985673초/ERROR0/CameraWarning1/product수리0. 기존OBJ14/extra23+2/원성공군·PNG자료재검수재연0/신규helper·testleaf·assetcopyhashimport0. |

정확API·28필드·296/4226값·원JSmerge/필터미완·nullmask외부쓰기한계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 OBJ metadata 실제 현재 소유·후처리 쓰기」를 따른다. 이전meta원writer4미연결은당시이력이다. MAP PRODUCTION REPORT: currentmetadata+flagwriteronly,geometry/nav/collision/placement/outermass/renderer변경0/CAMERA QA미실행/TECH새13scope만. **VISUAL VERDICT: RETOUCH.**

## 2026-10-14 원본 OBJ 실제 생성·현재 참조 반영

| 현재 범위 | 구현·최초 검증 |
|---|---|
| sameMain/World actualoriginal | sourcekeys285→actualRaw265(initial33+deco230+dragon2)/sharedgroups11·sharedkeys31·alias20. native28/approx23과구분. realrequest265/deferred38→CPUCanvas33(hard14/key14/edge4/luma1), CSS5exactunsupportedNR. |
| 실제currentfields/lifetime | firstd.id만Canvas교체/aliasraw유지. OBJCanvascompletetrue/실NWNH/srcdeclaredUndefined; extra3undefined정책과scope·epoch분리. sameRaw230decoerrorFB64retry코드/actualfallbackruntime0. cancelobjectonly/exit각registry철회. |
| 미완권위 | CSS5processinggap+edge原_METAwritegap4; wholeOBJpublication/Wait/StageNR/sourceG.onfalse. nativeGPU/BrowserCanvaspixelparity/24unique24FPS미완. |
| 새resource·검수 | 신규original184/179358354B/sourcehash184+desthash184/byteidenticalcopy184/import184exit0/sidecar184. exactalready2재사용·oldproof/hash/copy/import0. actualMain1 FIRST14/14 PASS8.48416초/ERROR0/CameraWarning1/product수리0/oldsuccess재연0. signal828=265construct+265pending+265loaded+33Canvas. |

정확 API·수치·원필터5·edge4·특수필드·신규184bytes와미완경계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 OBJ 실제 생성·현재 참조 이식」을 따른다. 이전257missing은nativepathsubset이력이고원original현재285refs와구분한다. 285keys≠265Images≠186originalfiles≠new184를구분한다.

MAP PRODUCTION REPORT: registry/resourceonly,geometry/nav/collision/placement/outermass/기존renderer변경0; CAMERA QA미실행/TECH새14scope만. **VISUAL VERDICT: RETOUCH.**

## 2026-10-14 실제 extra21 이미지 공급 반영

| 현재 범위 | 코드와 최초 검증 |
|---|---|
| 같은 Main/World extra 이미지 | 원 생성순서 Raw21/파일15종 중 신규14종31,021,662B 첫copy·source/desthash각14·import14/exit0·sidecar14. 기존soil1 재사용·oldproof/hash/copy/import0. 실제globals8/register한번/load21/deferred callbacks16(path1+gate7+Ground8). |
| boss 현재참조·원field | 파일1→별도Raw7→deferred실CPU whitebg Canvas7(currentindex만교체), 캡처raw7유지. Canvas src/complete/naturalWidth는 knownundefined(field_presenttrue/valueNull/declared_undefinedtrue), raw는 실제srcquery/complete/naturalWidth. 원avg>220/20,avg>180/25,abs(r-g)/abs(g-b),~~alpha식/RGB보존. |
| 권위·취소·Wait | current extra kind ACTUAL_SOURCE_PUBLICATION/sameWorld refs만. cancel/exit·신호 재진입취소 guard 뒤권위철회/처리중단. 원OBJ285/actual28/257missing은 nativekind/coverageNR 그대로; source Wait extras21캡처 후 OBJ_SPR_PUBLICATION_KIND_UNKNOWN/NOT_READY/sourceG.onfalse/pending0/timer0. |
| 새 최초 검수 | actualMain1 FIRST23/23 PASS3.798419초/ERROR0/CameraWarning1; 신호70/새gate alpha변경925px. 독립정적취소결함1종 guard수리 뒤 새actualWorld2의취소2/2 PASS2.166113초/ERROR·Warning0. 성공23/옛successfulsuite재연0. error→fallback·원cache callback·GPU/전체startup·24고유장24FPS는미완. |

정확 API·변수·자산 bytes·원callback/수명·잔여 계약은 [중앙 엔진 정본](FDG_ENGINE.md)의 「실제 extra 이미지 생성·현재 참조 이식」을 따른다. 아래 extra권위0/GLOBAL_CAPTURE_PUBLICATION_KIND_UNKNOWN 문구는 이전 단위 이력이다. MAP PRODUCTION REPORT: resource registry만; geometry/nav/collision/placement/outermass/기존renderer변경0, CAMERA QA 미실행, TECH 새consumer scope만. **VISUAL VERDICT: RETOUCH.**

## 2026-10-14 원본 키·boot-label 소비 반영

| 범위 | 현재 결과 |
|---|---|
| 원 source image key 실제 registry | 285 선언/actual28entry/257missing/extra21권위0. sharedalias4쌍은 실제Texture identity뒤samefirstentry. strict originalOBJ/extra aggregates와 Wait는NOT_READY/nativekind유지. |

새 actualMain1/24 firstPASS(1.975504125초), ERROR0/CameraWarning1/수리·oldsuccess재연0. sourceG.onfalse/전체source·GPU·24장24FPS 미완. 정확API·완전성·lifetime은 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 이미지 키 매핑·실제 시작 모듈 소비」를 따른다. 아래 최초 source/standalone 이력과 이번 native subset을 구분한다.

## 2026-10-14 중앙 native 공급 반영

| 범위 | 현재 구현 | 남은 계약 |
|---|---|---|
| 실제 Main wait caller 공급 | World에 get_source_obj_spr_publication/capture_source_extra_img_globals/read_source_image_field를 구현하고 실제 Main child Wait에 같은 World3providers·startup8000ms를 bind했다. 실제 loader36성공+실패1의 native fields kind는 ACTUAL_NATIVE_RESOURCE_LOAD_PUBLICATION이며 source_mapping_complete=false. | 원 OBJ/extra 전체 권위는 각각 SOURCE_OBJ_SPR_COVERAGE_AUTHORITY_UNBOUND / SOURCE_EXTRA_IMAGE_GLOBALS_AUTHORITY_UNBOUND. 현재 원 Wait NOT_READY/GLOBAL_CAPTURE_PUBLICATION_KIND_UNKNOWN/pending0/timer0. SOURCE_WAIT_COMPLETED/TextureReady/fullStage 완료0. |

새 실제 검사 이력·정확 API·수명/원본 source 경계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「실제 네이티브 로딩 공급 연결」을 따른다. 이 문서의 아래 최초 standalone/원 HTML 이력과 이번 Main native subset은 구분한다. protected 인간 game/서버3333/save/UI 조작0.

# FDG Godot Port — source_object_sprite_wait_owner (FIRST, 2026-10-14)

Owner: source_object_sprite_wait_owner writer. Owned files only:

- `godot/port_modules/source_object_sprite_wait_owner/producer.gd`
- `godot/port_modules/source_object_sprite_wait_owner/test_first.gd`
- this document

Not owned (no edits): source_post_stage_owner orchestration (type3_actor), actual Main / current source image publisher and sink (ENGINE), curtain UI (ART), save lifecycle (BUILD).

Status: **FIRST test run PASS (10 groups / 870 assertions / 0 fails), code and test FROZEN.** This covers only the wait owner module, using CONSTRUCTOR_PROTOCOL fixtures. It is **not** gameplay completion, and it is **not** Main startup READY. No actual source image publisher is bound (§6).

## 1. Canonical source (exact)

`/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:18787-18800`

```js
function _waitObjSprites(timeout){
  return new Promise(r=>{
    const t0=Date.now();
    const _extraImgs=[_bossRoomBg,..._bossGateImgs,_impSpr,_skullWallImg,_wallEdgeImg,_pathBgImg,_voidVistaImg,_GROUND_TILES['gt_soil'],_GROUND_TILES['gt_ch2'],_GROUND_TILES['gt_ch3'],_GROUND_TILES['gt_hellwinter'],_GROUND_TILES['gt_ch4'],_GROUND_TILES['gt_ch5'],_GROUND_TILES['gt_ch6'],_GROUND_TILES['gt_ch7']];
    const check=()=>{
      let done=true;
      for(const k in _OBJ_SPR){const im=_OBJ_SPR[k];if(!im.complete&&!im.naturalWidth){done=false;break}}
      if(done){for(const im of _extraImgs){if(im&&im.src&&!im.complete&&!im.naturalWidth){done=false;break}}}
      if(done||Date.now()-t0>timeout)r();
      else setTimeout(check,50);
    };
    check();
  });
}
```

Caller `game.html:64466-64474`: `await _waitObjSprites(8000)` at boot 90%, then `setTimeout(r,0)`, then `_bootMapBuildPromise`. The 8000 belongs to the caller (post-stage); the wait owner has **no default timeout**.

### Details missing from existing docs

`docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md:79-102` lists only `_OBJ_SPR`, `_bossRoomBg`, `_bossGateImg`, `_impSpr` and says "all images `complete` or timeout". `docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md:109-111` adds `_skullWallImg`/`_wallEdgeImg`. The source is more specific:

- Pass condition per image is `complete || naturalWidth` (JS truthiness), not just `complete`. A failed load (`complete=true`, `naturalWidth=0`) **passes**. So does `complete` falsy with a truthy `naturalWidth`.
- `_bossGateImgs` is an **array, spread** in place (not a single `_bossGateImg`).
- The full extra list is `_bossRoomBg, ..._bossGateImgs, _impSpr, _skullWallImg, _wallEdgeImg, _pathBgImg, _voidVistaImg`, then 8 ground tiles in order `gt_soil, gt_ch2, gt_ch3, gt_hellwinter, gt_ch4, gt_ch5, gt_ch6, gt_ch7`. That is `14 + _bossGateImgs.length` entries: 1 + spread + 5 + 8. The tests cover 14 entries with an empty gate array (g01) and 15 with one gate (g04). This port does not read the real length of `_bossGateImgs` from source data.
- Extras are gated by `im && im.src`: a nil ref or a falsy `src` is skipped and never checked. The `_OBJ_SPR` loop has **no** `src` gate.
- `_OBJ_SPR` is re-read on every check (live object). `_extraImgs` is built **once** at wait creation: replacing the globals or arrays later is not visible, but the captured image objects' own changing fields are.
- The first incomplete `_OBJ_SPR` entry breaks the loop, and the extras are skipped for that check.
- Source order: `t0` is read, then `_extraImgs` is built, then the first `check()` runs synchronously. Timeout is strict `Date.now()-t0 > timeout`, and it is evaluated only when `done` is false (`||` short-circuit).

### Wait completion ≠ Texture READY

Source `r()` means "stop waiting": every image is complete-or-has-width, **or the time ran out**. That includes broken images and timeouts. The native packet therefore always carries `texture_ready: false` and `full_stage_ready: false`. A resolved wait never proves a texture loaded, rendered, or uploaded to the GPU.

## 2. Public API (for source_post_stage_owner)

`producer.gd` is `extends Node`, with no `_process`/`_physics_process` driver. It must be inside a tree.

| Method | Signature |
|---|---|
| bind | `bind_source_providers(obj_provider: Object, globals_provider: Object, image_authority: Object) -> void` |
| start | `begin_wait(timeout_ms: Variant) -> WaitHandle` (int/float only; anything else gives `NOT_READY TIMEOUT_NOT_NUMERIC_NO_DEFAULT`) |
| await | `wait_obj_sprites(timeout_ms: Variant) -> Dictionary` (coroutine; use `await`) |
| cancel | `cancel_wait(request_id: int, reason := "CALLER_CANCEL") -> bool` |
| dispose | `dispose_pending(reason := "OWNER_DISPOSE") -> int` (does not latch) |
| diag | `get_pending_count()`, `get_active_poll_timer_count()`, static `describe_public_api()` |
| signal | `wait_finished(packet: Dictionary)` |

`WaitHandle` (RefCounted) has these fields: `request_id: int`, `timeout_ms`, `is_terminal: bool`, `packet: Dictionary`, `signal finished(packet)`, `cancel(reason) -> bool`. The first check runs **synchronously** inside `begin_wait`. Check `is_terminal` before awaiting `finished`, or use `wait_obj_sprites`, which does that for you.

Each request is independent, like a separate Promise. There is no once, single-flight, cap, dedup, or fault latch.

### Packet

- `terminal`: one of `SOURCE_RESOLVED | NOT_READY | CANCELLED | DISPOSED`
- `status`: one of `SOURCE_WAIT_COMPLETED | UNVERIFIED_SOURCE_WAIT_COMPLETED | SOURCE_WAIT_TIMED_OUT | UNVERIFIED_SOURCE_WAIT_TIMED_OUT | NOT_READY | CANCELLED | DISPOSED`
- other fields: `source_resolved`, `resolve_cause` (`DONE|TIMEOUT`), `not_ready_reason`, `adapter_reason`
- `texture_ready=false` and `full_stage_ready=false`, always
- `authority_owner` (this wait Node), `authority_owner_instance_id`, `owner_in_tree`. These prove only that **this wait body ran**. They are not evidence of an actual image publication.
- `publication_verdict`, `publication_kinds_seen`, `publisher_owners_seen`
- timing and diagnostics: `timeout_ms`, `t0_wall_ms`, `wall_reads`, `wall_comparisons[]`, `begin_mono_us`, `terminal_mono_us`, `checks`, `check_mono_us[]`, `query_counts`, `query_log[]`, `extra_refs_captured`, `extra_ref_labels[]`, `polls[]`, `timers{created, callbacks, freed, early_wakes, pending_timer_cleaned_at_terminal, process_mode, ignore_time_scale(_supported)}`

**Post-stage rule:** reject any `UNVERIFIED_*` status, even when `source_resolved == true`. Only `SOURCE_WAIT_COMPLETED`/`SOURCE_WAIT_TIMED_OUT` from an actually bound publisher can count as source wait completion, and that still does not mean Texture READY.

`timers.freed` counts **queue_free() requests** issued by the owner. It is not observed object destruction. The tests measure Timer absence separately, after a frame flush.

## 3. Proposed provider contracts (ENGINE must implement the actual ones)

`publisher_owner` must be the **bound provider object itself** (`is_same`). A string label is not accepted.

1. **Current OBJ** — `obj_provider.get_source_obj_spr_publication() -> {publisher_owner: obj_provider, source_publication_kind, obj_spr: Dictionary}`. Called once per check. The keys are iterated in JS `for...in` order (array-index keys ascending, then insertion order).
2. **Global capture** — `globals_provider.capture_source_extra_img_globals() -> {publisher_owner: globals_provider, source_publication_kind, globals: {name: {present: bool, value}}}`. Called once per request. `present=false` maps to the JS ReferenceError equivalent and gives NOT_READY. A value of `null` with `present=true` is a valid nil extra. `_bossGateImgs` must be an Array (spread). `_GROUND_TILES` must be a Dictionary, and a missing key is allowed as source `undefined`.
3. **Field state** — `image_authority.read_source_image_field(image, field) -> {publisher_owner: image_authority, image_reference: image (is_same), field, field_present: true, value, source_publication_kind: ACTUAL_SOURCE_PUBLICATION|CONSTRUCTOR_PROTOCOL, native_publication_state: LOADING|LOADED|ERROR, image_identity?: diagnostic only}`. Fields are `complete`, `naturalWidth`, `src`, queried only as the source short-circuit requires.
   - `field_present=false` gives `NOT_READY FIELD_STATE_NOT_PUBLISHED:<field>`. A missing raw field is never coerced to a falsy value.
   - A **declared** `null/false/0/""` (with `field_present=true`) keeps its JS-falsy meaning.
   - An omitted key gives `FIELD_STATE_RECORD_OMITTED_KEY:<field>:<key>`, a wrong owner gives `FIELD_STATE_PUBLISHER_OWNER_NOT_BOUND_AUTHORITY`, and a different or copied image gives `FIELD_STATE_IMAGE_REFERENCE_MISMATCH`.
4. **Publication honesty** — the `source_publication_kind` string alone does not prove an actual publisher exists. Any `CONSTRUCTOR_PROTOCOL` read makes the request `UNVERIFIED_*`.

**No actual publisher has been found** in Main/World/initEntry production. Until ENGINE binds one, a production wait either ends NOT_READY (missing binding) or, with fixtures, ends UNVERIFIED. The wait owner never creates image authorities, and never infers state from files, metadata, World surfaces, Texture dimensions, a RootSpriteInspector, or new sprites. It uses no ResourceLoader, Image, ImageTexture, load, import, or hash.

Other NOT_READY reasons are listed below. All of them leave `source_resolved=false`.

- `OWNER_NOT_IN_TREE`
- `TIMEOUT_NOT_NUMERIC_NO_DEFAULT`
- `OBJ_SPR_PROVIDER_MISSING`, `GLOBAL_CAPTURE_PROVIDER_MISSING`, `IMAGE_STATE_AUTHORITY_MISSING`
- `*_PUBLISHER_OWNER_NOT_BOUND_PROVIDER`, `*_PUBLICATION_OMITTED_KEY:*`
- `GLOBAL_CAPTURE_FIELD_OMITTED:*`, `SOURCE_REFERENCEERROR_EQUIVALENT:*`, `SOURCE_TYPEERROR_EQUIVALENT_*`
- `OBJ_SPR_PUBLICATION_OMITTED_KEY:obj_spr`, `SOURCE_TYPEERROR_EQUIVALENT_OBJ_ENTRY_NULL:<k>`

## 4. Clocks and timer policy

- **Source timeout:** system wall `floor(Time.get_unix_time_from_system()*1000)`. `t0` is read before capture. The comparison is `now - t0 > timeout` (strict) and is read only when the check is not done.
- **Poll:** after a failed, non-timed-out check, `deadline_us = Time.get_ticks_usec() + 50000`, with a new one-shot `Timer` child (`PROCESS_MODE_ALWAYS`, and `ignore_time_scale=true` when the property exists). In the callback, if monotonic `now < deadline` (an early wake, e.g. from a heavy frame delta), the owner re-arms a fresh Timer for exactly `deadline - now`. It makes **no provider query and no source check** before the deadline, and it keeps the original deadline. The minimum Timer `wait_time` is 1 ms.
- The two clocks are never mixed. Physics dt, FPS, and frame counters are never used.
- **Cancel/dispose:** these are adapter terminals (`CANCELLED`/`DISPOSED` + `adapter_reason`), not source completion. The pending Timer is stopped and queue_free'd. Providers and images are untouched. `_exit_tree` disposes the pending requests. The owner does not latch: after re-entering the tree, new waits work.

## 5. New tests (`test_first.gd`)

First run used the portable Godot executable with `--headless --path /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/source_object_sprite_wait_owner/fixture --script res://port_modules/source_object_sprite_wait_owner/test_first.gd`. The fixture uses isolated `EXODUSER-SourceObjectSpriteWaitOwner-First-Isolated` userdata; no human project/userdata was used. The successful run is frozen and must not be repeated. The script prints one line, `FDG_SOURCE_OBJECT_SPRITE_WAIT_OWNER_FIRST_JSON {...}`, and exits 0 when there are no fails, 1 otherwise.

All providers are CONSTRUCTOR_PROTOCOL fixtures. Their headers set `publisher_owner: self`, their records set `image_reference: <actual fixture image>`, and declared falsy values carry an explicit `field_present: true`. They are UNVERIFIED, and no positive actual-publisher claim is made.

| Group | Evidence | What it covers |
|---|---|---|
| g01 | sync | immediate first check, DONE, one wall read, receipt owner, awaitable API |
| g02 | sync | for-in order, `&&` short-circuit, no extra query, cancel + timer absence after flush |
| g03 | sync | failure `complete=true,width0` resolves; im/src gates; no src gate in OBJ loop |
| g04 | actual Timer | current OBJ replacement visible; captured extra refs fixed; original image updates visible |
| g05 | literal policy | strict `>` boundary, deadline policy, js_truthy, for-in order (not elapsed proof) |
| g06 | actual Timer | 50 ms monotonic deadlines, no early query, wall timeout 400 ms |
| g07 | actual Timer | paused isolated tree + `Engine.time_scale=0.1`, ALWAYS timers |
| g08 | actual Timer | heavy frames (busy 45/30 ms); early wakes measured, `OBSERVED`/`NOT_OBSERVED` not forced |
| g09 | sync | missing bindings, unpublished fields, label/other owner, copied reference → NR; valid contrasts |
| g10 | actual Timer | concurrent independent requests, cancel, exit-tree dispose, no latch, Timer count 0 |

## 6. Final FIRST receipt ledger

Evidence files (Codex external): `first-test-summary.json`, `first-test-measure.json`, `first-test-runtime.json`, `backup-before-final-doc.json` under `.../godot-native-first/team-port/source_object_sprite_wait_owner/`.

### Run

| Item | Value |
|---|---|
| Attempt | 1, the first and only run. No INVALID, retry, repair or rerun. |
| UTC | `2026-10-13T21:45:52.324433Z` → `2026-10-13T21:45:54.469282Z` |
| Engine | Godot `4.7.2-stable (official)`, `--headless --script res://port_modules/source_object_sprite_wait_owner/test_first.gd`, run in an isolated fixture project copy |
| Exit code | 0 |
| SCRIPT ERROR / ERROR / WARNING | 0 / 0 / 0 (reported by executor) |
| Scripts run | `producer.gd` 25857 B sha256 `306090dedd6f0544789cb804fcbca0e763a31dab322268d4a44a84d24b279831`; `test_first.gd` 42651 B sha256 `7d9d8d685937487e3dfd8102ae856106aa93b35d62c46c0e691737fdf1613df1`. The same hashes are recorded in the frozen backup, `head_exists=false`. |
| Old scripts / old tests / asset copy-import | 0 / 0 / 0 |
| Totals | 10 groups / 870 assertions / 0 fails / `failed_groups=[]`, verdict PASS |
| Suite duration | 1871586 µs monotonic / 1871 ms wall |
| Headless frame signals | 205 `process_frame` / 118 `physics_frame`. These are the test harness's actual signal counts (measurement only). They are not physics method calls, gameplay clocks or continuous FPS. The producer has no `_process`/`_physics_process` driver, so it makes 0 automatic process/physics calls. Its waits run on its own Timer children. |
| Publication status | `actual_source_publisher_bound=false`, `actual_ready_claimed=false`, `texture_ready_claimed=false`. Every positive image-state fixture is CONSTRUCTOR_PROTOCOL, so every source-resolved positive result is UNVERIFIED; missing bindings, cancellation and disposal retain their distinct terminal labels. No public Main/GPU/240 claim. |
| Cleanup (measured once, after the suite) | Timers in tree 0, orphan node monitor 0, `paused=false`, `Engine.time_scale=1.0` |

### Groups

| Group | Assertions | Duration µs | Key measurement |
|---|---|---|---|
| g01_immediate_first_check_done | 17 | 217 | first request_id 1 |
| g02_obj_order_shortcircuit_no_extra_query | 14 | 6357 | — |
| g03_truthiness_failure_complete_src_gates | 7 | 889 | — |
| g04_current_obj_vs_captured_extra_refs | 197 | 345190 | 7 checks; intervals 57460, 54884, 56203, 54841, 52801, 57570 µs; early wakes 0 |
| g05_pure_policy_constructor_literals | 25 | 63 | literal policy only, not elapsed-time proof |
| g06_actual_50ms_deadline_and_wall_timeout | 220 | 450327 | 9 checks; intervals 50434, 52982, 57170, 56007, 55469, 51855, 57233, 55779 µs; final source wall elapsed 437 ms (> 400 strict); test-side 442452 µs mono / 442 ms wall; 8 timer callbacks; 18 image queries; early wakes 0 |
| g07_paused_isolated_tree_always_timer | 47 | 177598 | paused isolated tree + `time_scale=0.1`, `ignore_time_scale_supported=true`; **actual early wake 1**, and the monotonic 50 ms guard re-armed with no provider query before the deadline; intervals 54526, 56463, 53437 µs |
| g08_heavy_frame_delta_early_wake_actual | 239 | 627734 | 19 heavy frames (busy 30 ms); early wakes 0 → **NOT_OBSERVED** (no early-wake claim for g08); intervals all ~60.2 ms (60207–60367 µs); 9 timer callbacks |
| g09_missing_bindings_not_ready | 83 | 1358 | 24 NOT_READY reasons recorded exactly, e.g. `FIELD_STATE_NOT_PUBLISHED:complete/naturalWidth/src`, `FIELD_STATE_PUBLISHER_OWNER_NOT_BOUND_AUTHORITY:complete`, `FIELD_STATE_IMAGE_REFERENCE_MISMATCH:complete`, `OBJ_SPR_/GLOBAL_CAPTURE_PUBLISHER_OWNER_NOT_BOUND_PROVIDER` |
| g10_cancel_dispose_independence_lifetime | 21 | 247917 | timers in tree after group 0 |

`timers.freed` in packets counts queue_free() requests. Actual Timer absence and orphan count were measured separately, once, after a frame flush (g02/g10 and the suite cleanup above). No method counts beyond those in the ledger are claimed.

### History before the first run (not a runtime repair)

- The original CLI process (PID 55428) was stopped by the executor at `2026-10-13T21:38:10.979980Z`, **before any test ran**. Pre-test review had found two problems: `field_present=false` was coerced to null, and `publisher_owner` accepted string labels.
- A correction in the same session (PID 56735) switched to bound provider Object identity plus `image_reference` identity, and made `field_present=false` return NOT_READY. After that correction the code and test ran FIRST (10/870 PASS) and are now frozen.
- This was a production/test boundary correction made during review before the first run. It was not a failed run, and not a PASS repair.
- No permission denial, outside write or old-test read was observed in this scope.
- Session `80d1e5b1-1e44-424b-a8ca-9acb651253aa`, default model `claude-opus-5-5`, no model override.

## 7. Remaining authorities and central consumers

- **Actual source image publisher (ENGINE): UNBOUND.** It must supply the §3 provider objects: current `_OBJ_SPR`, captured extras globals, and `complete`/`naturalWidth`/`src` readers. Each must carry explicit `field_present`, `publisher_owner` = the provider object, `image_reference` = the exact image, `source_publication_kind` and `native_publication_state`.
  - These are **not** substitutes: string labels, file existence, Inspector data, native Texture width, World readiness.
  - These are legitimate source branches and must stay that way: declared null/falsy values, `complete=true,width0` error images, and a declared empty `_OBJ_SPR`.
  - A missing raw field or a missing provider gives NOT_READY. It never becomes a timeout ACK.
- **source_post_stage_owner (type3_actor):** it owns the `8000` caller (`game.html:64468`) and the follow-up `setTimeout(r,0)` / `_bootMapBuildPromise`.
  - It must not accept `source_resolved` alone.
  - It must reject `UNVERIFIED_*`.
  - It must treat `TIMED_OUT` as source continuation, not Texture READY. `texture_ready` and `full_stage_ready` are always false.
  - `authority_owner`/`owner_in_tree` only verify this runtime wait owner, not image publication.
- **Overall Main startup is not READY** because of this module.

### Related docs sync (ENGINE-owned path-only request; not edited here)

- `docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md:67-104`: the "all `complete`" wording should become `complete || naturalWidth`, with error images passing, plus the timeout semantics and the full extras list.
- `docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md:102-111`: the "load guaranteed before map build" wording. The wait ends on timeout or on error images too.
- The central startup/post-stage API integration docs.

Root delegates the full allowed keyword search/sync and the normal code + docs checkpoint. This worker made Git changes 0 and shared edits 0. docs2_3 is immutable. The 3 excluded marketing paths were never accessed. In this scope, source-asset/PNG copy, load, import and hash activity was 0; UI/save/server/Git mutations were 0. New owned code/test/doc receipt hashes were recorded by the executor, without old-asset hashing.


## 2026-10-17 ENGINE WIP: Main 소유 l_eq 이식

이 절은 현재 ENGINE WIP의 추가 구현 상태다. 기존 본문·동기화 checkpoint·과거 검수 결과는 해당 당시 기록으로 보존한다.

| 항목 | 현재 코드와 검증 상태 |
|---|---|
| 소유/최초값 | actual Main 인스턴스 하나를 native source-script context 하나로 대응하는 신규 설계. Main private Variant _source_l_eq_cache=null 선언 1회; Formula/Services/actor 교체는 초기화 사유가 아니다. |
| 실제 경로 | Main source-init 경계→Services weak current bridge→Formula.l_eq(stat)→Main-owned lazy query→State의 같은 actual INV/slot/item/special에 한정된 누락 필드 복원. 값은 actual legendarySpecial.val에서만 파생, 범용 setter 없음. |
| 순서/값 | cache={} 설치 후 INV/17 slot 순회. 첫 non-undefined, defined null/false/0/빈 문자열/NaN 보존·raw truthy 또는 숫자0. native 미표현 undefined/ToPropertyKey/prototype operand는 raw/prefix를 포함한 typed partial, retry/clear/rollback 없음. |
| cache hit/수명 | domain/INV/writer eager 조회 없이 새 metadata ownership guard. 같은 Main의 helper/actor 교체에도 cache 유지, 옛 caller와 Main 유실 거부. 기존 ordered affix/reference invalidation sink와 원 5개 reset 위치는 l_eq reset 권위로 확장하지 않음. |
| 등록/검수 | 현재 ENGINE WIP callback map **9/25·미16**. 기존8 뒤 실제 l_eq=Callable(self,read_normal_enemy_legendary_equipment) 하나를 추가했다. 원 첫 fixture parse 실패·행동0은 보존하고 header5줄만 수정한 새 namespace의 최초 신규 행동41/41 PASS도 별도 유지한다. 이번 등록 경계만 새 static9/9, 기존 행동·parser·static 검수 재실행0. 전체 hurtE 연결·실게임·main/R/served 반영은 미완이다. |
| 범위/한계 | full Main/Services.configure/State 자연 lifecycle·실 INV/save·원 JS boot/restore·게임/export/PC 최신판 완료 증거 없음. 초기 plan metadata에 불필요한 Q/E 선언·필드 및 Main876 Q currentOptions 할당 한 줄/Frame metadata도 포함됐으며 원본 보존·캐시 권위에서 제외. 실제 Q/E 실행·변경 없음. |

정확한 API·17 slot·최초 실패 로그·미소유 범위는 [Main 전설 장비 캐시 계약](FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md)에 기록한다.
