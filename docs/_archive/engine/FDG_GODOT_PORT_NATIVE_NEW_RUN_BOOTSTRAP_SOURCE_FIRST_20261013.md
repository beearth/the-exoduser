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

> **2026-10-14 실제 Main 커튼 서비스:** 기존 HUD에 ART 원view를 hidden bind하고 실제900ms callback을 소비했다. 첫15 중14valid/1FAIL→실패only1clean(906ms callback1), 제품수리0·성공재연0. sourcecontroller/G.on/600frames/GPU/fullMain 미연결, shadow80px/z45 gap 유지. 함께Root G-only publicplanner9/292와 Startup 원producer14/791를 동결기술scope로 정상 보존하며 실제Gwriter/18fields 일괄ACK0. [Main 커튼 정본](FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_FIRST_20261014.md).

## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

# FDG Godot Port — native_new_run_bootstrap_source (first)

- 모듈: `godot/port_modules/native_new_run_bootstrap_source/producer.gd` (RefCounted, `class_name` 없음 — 전역 registry 변경 0)
- 테스트: `godot/port_modules/native_new_run_bootstrap_source/test_first.gd` (독립 SceneTree runner)
- 원 R: canonical `exoduser-migration-20261001/game.html` (읽기전용). 재사용: `player_passives_source.source_boot_passives()` (26키 = `combat_stat_formula.PASSIVE_DEF_KEYS`)
- 범위: 세이브 없음(fresh) 새 실행 부트의 **source constructor packet + 순서 명령 producer + holder sink 계약**. 실제 Main/Player/World 설치·current 승격 아님.

## 1. 원 단계와 phase

| phase | 원 줄 | 내용 | 이 모듈 |
|---|---|---|---|
| file_init | 17122~17126 | `let G={…}` 40키 | `source_boot_g()` |
| file_init | 28268 | `let STATS={str:0,dex:0,int:0,vit:0,lck:0}` | `source_boot_stats()` |
| file_init | 28300 | `PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0)` | `source_boot_passives()` → 기존 producer 위임 |
| file_init | 28556 | `let _grit=0` | 이 모듈 범위 밖. file-init provenance 는 읽기전용 기존 `player_grit_source.source_boot_grit()` 소유. 이 bootstrap 은 그것을 호출/preload 하지 않고, grit reset·설치 명령도 0 (원 새 실행도 `_grit` reset 없음) |
| fresh_reset | 64386~64395 | P=mkP / INV / QSLOTS… / STATS / PASSIVES / BAG_MAX / G subset / STORAGE | 명령 0~11 |
| (결정) | 64396~64421 | testchar 분기, 서버/로컬 조회, dbRestore → `_loaded` | **caller 의 명시 결정만** 인정 |
| new_game_branch | 64421~64437 | `!_loaded` | 명령 12~17 |
| post_branch_common | 64441~64462 | 기본 스킬, 슬롯, atlas 대기, applyStats, test override, HUD | 명령 18~24 |
| stage_publisher | 64463~64465 → 32195 | `initStage(G.stage)` (내부 32217 `G._fireZones=[]`) | 명령 25 |

원 fresh_reset 은 세이브 조회 **전에** 무조건 실행되지만, 이 모듈은 loaded 분기를 제외하므로 결정이 `fresh_no_save` 일 때만 0~25 를 낸다. loaded 결정 → `LOADED_BRANCH_EXCLUDED`, 명령 0.

### file-init G 40필드의 원 literal 값

이 표는 source constructor만 설명한다. fresh reset은 아래 명령의 subset 대입이며, 실제 current G 설치는 ENGINE 소유다.

| 필드 | 원 file-init 값 |
|---|---|
| `on` | `false` |
| `paused` | `false` |
| `stage` | `0` |
| `kills` | `0` |
| `mats` | `0` |
| `cam` | `{"x":0,"y":0}` |
| `shake` | `0` |
| `parts` | `[]` |
| `txts` | `[]` |
| `forgeOpen` | `false` |
| `forgeTab` | `"upgrade"` |
| `forgeExpanded` | `false` |
| `forgeSort` | `null` |
| `rooms` | `[]` |
| `curRoom` | `0` |
| `map` | `null` |
| `mw` | `0` |
| `mh` | `0` |
| `hitStop` | `0` |
| `slowMo` | `0` |
| `stageCleared` | `false` |
| `_stageDiffOff` | `0` |
| `exits` | `[]` |
| `bossAlive` | `true` |
| `_chainCnt` | `0` |
| `_chainT` | `0` |
| `rifts` | `[]` |
| `spawnHoles` | `[]` |
| `atkTickets` | `0` |
| `maxAtkTickets` | `3` |
| `_irisSz` | `20` |
| `combo` | `0` |
| `comboTimer` | `0` |
| `comboMax` | `0` |
| `stageTime` | `0` |
| `_zones` | `null` |
| `_curZone` | `0` |
| `_zoneState` | `{}` |
| `_portals` | `null` |
| `_playerPortalPair` | `null` |

STATS는 삽입 순서 `str,dex,int,vit,lck` 각각 0이다. PASSIVES는 기존 `player_passives_source.source_boot_passives()`의 원 26키와 각각 0을 재사용하며, 이 모듈은 키 집합을 다시 정의하지 않는다. `atkTickets=0/maxAtkTickets=3`은 호환 literal 데이터만 유지하고 어택 티켓·동시공격 제한 소비는 구현하지 않는다.

## 2. 명령 순서 (`STEPS`, `plan()`)

| # | id | kind | 원 줄 | 쓰기 주체 |
|---|---|---|---|---|
| 0 | install_p | install_p | 64386 `P=mkP()` | provider `mk_p` 반환값을 참조로 전달(복사 0) |
| 1 | inv_reset | inv_reset | 64387 | bag=[], equipped 17 null(weapon,shield,boots,armor,helmet,bow,gloves,pants,necklace,ring1,ring2,cape,belt,bracelet,headband,ossuary,headband2), selected=null, ossCollect={} |
| 2 | qslots_potion_upgrades | external_barrier | 64388~64391 | 외부 |
| 3 | stats_reset | stats_rebind | 64392 | 새 객체 rebind (원 `STATS={…}`) |
| 4 | passives_reset | passives_zero_current_keys | 64393 | sink 가 **현재 키 집합** in-place 0 (26키 재구성 아님) |
| 5 | bag_max_inv_filter | external_barrier | 64394 | 외부 |
| 6 | g_reset_head | g_assign | 64395 | on=false, stage=(req>=0?req:0), kills=0, mats=(reader\|\|1000), exits=[] |
| 7 | cache_exit_center | external_barrier | 64395→20252 | 외부 |
| 8 | g_reset_boss | g_assign | 64395 | bossAlive=true, _bossRef=null, _crT=0, atkTickets=0 |
| 9 | hud_counters | external_barrier | 64395 | `_hudT=0;_hudAlive=0` 외부 |
| 10 | g_reset_tail | g_assign | 64395 | rifts=[], spawnHoles=[], _chainCnt=0, _chainT=0, _bossArena=false, _bossLoadPhase=0, _bossLoadFade=0, _bfxBolt=null, hellCleared=[] |
| 11 | storage_reset | external_barrier | 64395 | 외부 |
| 12 | parry_lesson_reset | external_barrier (optional) | 64423 | 외부(optional chaining — handler 가 부재를 ack) |
| 13 | g_cutscene | g_assign | 64424 | `_cutsceneDone=false` |
| 14 | default_items_equip | external_barrier | 64425 | items 소유자 |
| 15 | starter_bag | external_barrier | 64426~64430 | items 소유자(mkItem 10회 = 무기4+기타6 은 원 표현일 뿐, 개수 authority 아님) |
| 16 | recalc_st | external_barrier | 64431 | 외부 |
| 17 | difficulty_starting_skills | external_barrier | 64432~64437 | 외부(생략 시 full parity 아님) |
| 18 | ensure_base_skills | external_barrier | 64441~64446 | 외부 |
| 19 | new_game_skill_slots | external_barrier | 64448~64453 | 외부 |
| 20 | boot_atlas_wait | external_barrier | 64455~64457 | 외부 |
| 21 | apply_stats | external_barrier | 64458 | 외부 |
| 22 | stage_test_override | g_assign (conditional) | 64459 | req>=0 일 때만 dispatch, 아니면 `skipped` |
| 23 | boss_test_override | g_assign (conditional) | 64460 | 동일 |
| 24 | hud_show_update_slots | external_barrier | 64461~64462 | 외부 |
| 25 | init_stage | init_stage | 64463~64465 | 외부 stage publisher. sink 가 `stage`=현재 same G.stage 를 채움. `publishes=[source_fire_zones_provenance()]`, `boot_map_build_defer=[1,0]` |

G 는 literal 교체가 아니라 **같은 G 에 대한 필드 대입 subset**. 위에 없는 G 키(paused, maxAtkTickets, _zones …)는 건드리지 않는다. `atkTickets/maxAtkTickets` 는 literal 메타데이터일 뿐 ticket/동시공격 소비자 구현 0.
숫자: JS 정수 literal 은 GDScript int, PASSIVES 는 기존 producer 규약대로 float 0.0.

## 3. G literal vs reset vs stage `_fireZones`

| 구분 | 원 | `_fireZones` |
|---|---|---|
| constructor | 17122 G literal 40키 | 없음 |
| fresh reset | 64395 subset | 없음 |
| stage publisher | 32217 initStage | `G._fireZones=[]` (same G). `G._zones`/`M30._zones` alias 아님. 이 모듈 구현 0 |

## 4. API

| API | 설명 |
|---|---|
| static `source_boot_g/stats/passives()`, `source_fresh_reset_inv/stats()` (grit 생성자 없음) | `{status:SOURCE_BOOT,source,phase,current:false,derived:false,values}` 매 호출 새 할당 |
| static `source_fire_zones_provenance()` | `SOURCE_PROVENANCE`, implemented_here=false |
| static `plan()` / `external_step_ids()` | 단계 표 복사본 / external_barrier id 순서 |
| `configure(providers, sink) -> bool` | providers: `mk_p`, `load_shared_mats`, `stage_test_req`, `boss_test_req`. sink: `Callable(command)->bool\|{accepted:bool,…}`. 실행 후 false |
| `readiness(decision)` | 쓰기 전 검사: `PREFLIGHT_OK` / `NOT_READY`(decision_not_explicit, decision_not_explicit_fresh, missing_providers + missing[]) / `LOADED_BRANCH_EXCLUDED` |
| `run(decision) -> Dictionary` | 단 1회(재호출 `ALREADY_RAN`). 결과 `{status,reason,branch,missing,decision,committed[],skipped[],failed_step,failed_ack?,remaining[],current:false,main_ready:false,rollback:false,atomic:false,external_gaps[]}` |
| `last_result()`, `committed_steps()`, `status()`, `dispatch_count()`, `has_run()` | 방어 복사 getter |
| static `construct_private_state_sink()` | 사적 holder (origin=`private_source_constructor`), G/STATS/PASSIVES file-init, INV {}, P null |
| static `bind_state_sink(g,stats,passives,inv)` | caller 의 실제 참조 보유(origin=`caller_bound`, same G 정체성) |
| `SourceStateSink.consume(cmd)` / `as_sink()` / `set_external_handler(id, Callable)` | state 명령은 holder 에 직접 적용, external/init_stage 는 handler 필요(누락 → `external_handler_missing:<id>` 거절). P 가 이미 있으면 `actor_already_present` 거절(로드 actor 교체 금지) |

status: `SEQUENCE_ACKNOWLEDGED` = 0~25 중 조건에 따라 실행되는 단계는 모두 sink 수락, 조건이 거짓인 두 test override는 `skipped`로 기록. 이것도 `current=false/main_ready=false` — 64466 이후(스프라이트 대기, 컷신, 루프 시작 등)는 범위 밖.
`STOPPED` = provider 반환 미지원/sink 거절. 그 단계 이후 dispatch 0, 수락된 prefix 는 그대로 남음(롤백·원자성 없음).

- external handler 의 ack 는 **신뢰된 외부 단계 완료 신호**일 뿐이며, 실제 Main/current 준비 상태의 증명이 아니다. 이 모듈은 bool 또는 Dictionary의 `accepted` bool만 검사하며, 실제 외부 작업의 완료는 검증하지 않는다.
- `run()` 은 동기 수동 실행(await 0). handler는 이미 완료된 외부 단계를 동기로 확인한 경우에만 ack할 수 있다. 원 `boot_atlas_wait`(64455~64457 `await _mobAtlas.ready`, ≤5000ms)의 coroutine 대기나 단계 중단·재개 API는 구현하지 않았다. 실제 비동기 부트 순서와 완료 확인은 ENGINE의 별도 phase orchestration에 남는다.
- 중간 상태 유의: `inv_reset` 직후 INV.equipped 17 null 은 최종 INV 가 아니다(default_items_equip/starter_bag 외부 단계 전). current/main_ready 는 어떤 결과에서도 false.

## 5. 입력 규칙

- decision: `{branch:"fresh_no_save"}` 만 새 실행. `null/false/{}/{loaded:false}/restore 실패 표시` → NOT_READY (자동 새 실행 대체 0). `{branch:"loaded"}` → 명령 0.
- `load_shared_mats`: null/false/0/-0/NaN → 1000(`fallback=true`), 그 외 int/float raw. 문자열·true·기타 → STOPPED(`provider_unsupported:load_shared_mats`). reader 없음 → NOT_READY(중립 1000 0).
- `stage_test_req/boss_test_req`: int/float 만(NaN 은 원처럼 `>=0` 거짓). 기타 → STOPPED.
- `mk_p`: Dictionary 또는 유효 Object 만. 해제된 Object → STOPPED(`mk_p_returned_freed_object`), 그 외(null 포함) → STOPPED(`mk_p_returned_unsupported`). 둘 다 `is_instance_valid` 로 역참조 없이 판정, dispatch 0. sink 의 install_p 도 같은 검사(`p_missing_or_freed`). source 경계 검증일 뿐 실제 live actor 주입 아님.
- **mkP/full P 는 외부 공급·ENGINE 인증 대상.** 코드는 `mk_p` 반환의 타입(Dictionary/Object)과 해제 여부만 검사하며, mkP provenance·필드 완전성은 검증하지 않는다. `player_resource_parameters_source.source_boot_parameters()` 의 자원6 packet 은 full P 가 아니므로 `mk_p` 로 넘기면 안 된다 — 이는 caller 의 의미 요구사항이며, 그 packet 을 구조적으로 거절하는 구현은 **없다**(Dictionary 이므로 현재 코드는 통과시킨다).
- 미지원: 더 넓은 JS 값(문자열 숫자, 객체 truthy 등) 강제변환, for-in 상속 키.

## 6. 외부 gap (caller/owner 필요)

mkP 본문, QSLOTS/qsCooldown/autoPotCd/UPGRADES/POT_LV, BAG_MAX/invFilter, `_cacheExitCenter`, `_hudT/_hudAlive`, STORAGE/_getStore, parry lesson, defaultItems/mkItem/RNG, recalcSt, 난이도 시작 스킬, 기본 스킬/슬롯, atlas 대기, applyStats, HUD/updateQS/updateSkSlot, initStage 본문. testchar(64397)·loaded 복원 분기·64466 이후 부트 제외. 자동 physics/process/timer/UI/network/save 시작 0.

## 7. 첫 테스트 — 결과 (CODE/TEST FROZEN)

실행: `godot --headless --path <isolated project> --script res://port_modules/native_new_run_bootstrap_source/test_first.gd -- --report=/abs/report.json [--only=g1,g2]`
exit 0 PASS / 1 FAIL / 2 INVALID(인자, 로드 실패, 예기치 않은 오류 → 즉시 중단). 실행은 Codex executor 가 isolated project 에서 수행. 읽기/복사한 production 의존은 순수 producer 3개(`player_passives_source`, `combat_stat_formula`, `equipment_affix_reader`)뿐, 기존 테스트 0·asset 0·전체 import/GUI 0. report proof root: `native_new_run_bootstrap_source`.

| group | 검사 | checks | 결과 |
|---|---|---|---|
| constructor_fixed_holder | G 40키 순서/값, STATS, PASSIVES 26키 재사용, private/bound holder, 할당 격리, INV 17 null | 14 | PASS (attempt02) |
| preflight_decision_and_missing | 비명시 결정 6종, loaded 명령 0, 누락 providers/sink, mkP 호출·쓰기 0 | 11 | PASS (attempt02) |
| fresh_sequence_same_g | sink 순서=plan, same G 정체성, G subset vs 비대상 키 보존, STATS rebind, PASSIVES 현재 키(27) 0, INV, init_stage stage 인자, `_fireZones` publisher 에서만, grit 명령 0 | 16 | PASS (attempt02) |
| mats_reader_falsy | 0/null/false/NaN/-0 → 1000, 7/12.5 raw, 문자열 → STOPPED prefix, reader 누락 NOT_READY | 11 | PASS (attempt02) |
| external_failure_stops | recalc_st 거절 → 이후 0, remaining, prefix 유지, 단일 실행, handler 누락, actor 교체 거절, mkP null, mkP 해제 Object(SCRIPT ERROR 없이 STOPPED, P 미설치) | 11 | attempt02 FAIL(1 assert) → PASS (attempt03 `--only`) |
| provenance_fire_zones_overrides | stage→boss override, 전 명령 SOURCE_COMMAND/current=false/source, reset 에 `_fireZones/_zones` 없음, init_stage provenance, phase 순서, test req 미지원 | 7 | PASS (attempt02) |
| defensive_copies | plan/last_result/committed/decision 복사, sink 변이 비누출 | 6 | PASS (attempt02) |

고유 7 groups / 76 checks PASS 이력. 실제 실행 checks 87 (attempt02 76 + attempt03 11). 최종 상태로 전체 7 groups 를 한 번에 재실행하지는 **않았다**.

### 실행 이력

| 시도 | 내용 | 결과 |
|---|---|---|
| (실행 전 검토) | 실제 Claude 코드 변경: 불필요한 grit file-init wrapper(`source_file_init_grit`)와 그 constructor 테스트 제거, `mk_p` 해제 Object guard(producer + sink) 추가 + 테스트 1 branch. 첫 유효 테스트 전 변경이며 원 첫 초안의 PASS 가 아니다 | — |
| attempt01 | 전체 suite | INVALID, 0 checks, exit 2. Godot 4.7.2 parse error `producer.gd:472` — `SourceStateSink._external` 의 `var ok :=` 가 Variant 포함 식 추론 불가. 같은 식을 `var ok: bool =` 로 명시하는 1줄 수정. 유효 group 실행 0 |
| attempt02 (첫 유효) | 전체 suite | 6 groups 65 checks PASS. `external_failure_stops` 11 checks 중 1 assert FAIL + engine ERROR 1(`Lambda capture at index 0 was freed. Passed null instead.`) — fixture 가 lambda 로 해제 Object 를 capture 해 null 로 정화됨. 결과 사유 `mk_p_returned_unsupported` 는 null 에 대해 정확. SCRIPT ERROR 0. 이 group 은 PASS 로 채택하지 않음 |
| fixture 수정 | 같은 Claude 세션, 테스트 fixture 만: 보관된 private `FreedProvider`(멤버 Variant + 메서드)로 교체. production 변경 0 | — |
| attempt03 | `--only=external_failure_stops` | 11 PASS / 0 assert FAIL / stderr·SCRIPT ERROR·engine ERROR 0, exit 0. 성공한 6 groups 재실행 0 |

별도: Codex 가 Node.js 로 source-local G constructor/첫 reset 구간 4 case 를 따로 실행했다. 전체 boot/게임 parity 증명이 아니다.

렌더러/public play/GPU240 는 이 테스트로 증명되지 않는다.

### 작업 환경 기록

- 실제 CLI: 초기 PID 24750, session `8e55b25a-d4d8-404c-83fc-deef115dd3b4`, 구성 모델 `claude-opus-5-5`, restricted/dontAsk. 같은 세션에서 review(25636)/typefix(25949)/fixture(26139) 수행. model override/settings 변경/bypass 0. Codex executor 는 테스트 실행만 담당.
- 이 문서는 소유 3경로 중 신규 문서만 갱신(doc-only sync). scope·공유 문서 목록(초기 87 current keyword paths)은 ENGINE 이 중앙 관리하며 정상 checkpoint 에서 반영한다.
