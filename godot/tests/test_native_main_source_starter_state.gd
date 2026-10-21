extends SceneTree
# FIRST actual Main startup consumer. No duplicate manual startup scene,
# resource/inventory fixture, LCG, live actor setter, manual clock or old tests.
const MAIN = preload("res://scenes/main.tscn")
const STATE = preload("res://scripts/native_source_new_run_state.gd")
const PROVIDERS = preload("res://scripts/native_source_player_providers.gd")
const BOOTSTRAP = preload("res://port_modules/native_new_run_bootstrap_source/producer.gd")
# game.html:16714-16718 file-init literal; keep this contract separate from
# initStage:31655 -> _regionInit:60698-60699 writes on the live current G.
const BOOT_G_KEYS = ["on", "paused", "stage", "kills", "mats", "cam", "shake", "parts", "txts",
	"forgeOpen", "forgeTab", "forgeExpanded", "forgeSort", "rooms", "curRoom", "map", "mw", "mh",
	"hitStop", "slowMo", "stageCleared", "_stageDiffOff", "exits", "bossAlive", "_chainCnt", "_chainT",
	"rifts", "spawnHoles", "atkTickets", "maxAtkTickets", "_irisSz", "combo", "comboTimer", "comboMax",
	"stageTime", "_zones", "_curZone", "_zoneState", "_portals", "_playerPortalPair"]
const REGION_INIT_G_KEYS = ["_regions", "_regMidX", "_regMidY", "_regCurIdx", "_regBannerCd",
	"_regGateIdx", "_bossClearT"]
# P3-002: initStage genFromTemplate 30625 `G._totalSpawned=Σ_spawnHoleCount` (spawnHoles는 이미 G40).
# game.html:31569 initStage -> native_demo11_anglers.gd:43 (preserve existing clear).
const FIELD_BOSS_INIT_G_KEYS = ["_fbDone"]
const SPAWN_HOLE_INIT_G_KEYS = ["_totalSpawned"]
const GROUPS = ["startup_state_and_items", "public_actor_sync", "original_provider_consumers",
	"once_and_tree_gates", "lifecycle_and_grit_loss"]
const ISOLATED_DIRECTORY = "EXODUSER-MainSourceStarter-Isolated-20261014"
const EQUIP_ORDER = ["weapon", "shield", "boots", "armor", "helmet", "bow", "gloves", "pants",
	"necklace", "ring1", "ring2", "cape", "bracelet", "headband", "headband2"]
var checks = 0
var failures = 0
var current_group = ""

func _initialize() -> void:
	if not OS.get_user_data_dir().contains(ISOLATED_DIRECTORY):
		push_error("STARTER_INVALID_ISOLATION " + OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")

func _run() -> void:
	var selected: Array = GROUPS.duplicate()
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="): selected = Array(arg.trim_prefix("--only=").split(",", false))
	var rows: Array = []
	for id in selected:
		if not GROUPS.has(id): quit(2); return
		current_group = id
		var before_checks = checks
		var before_failures = failures
		var start_time = Time.get_ticks_msec()
		var observation: Dictionary = await call("_test_" + id)
		var row = {"group": id, "checks": checks - before_checks, "failures": failures - before_failures,
			"elapsed_ms": Time.get_ticks_msec() - start_time, "observation": observation}
		rows.append(row)
		print("MAIN_STARTER_GROUP_RESULT " + JSON.stringify(row))
	print("MAIN_STARTER_SUITE_RESULT " + JSON.stringify({"groups": selected.size(), "checks": checks,
		"failures": failures, "results": rows, "actual_Main": true, "input_fixtures": false,
		"full_derived_parameters_proven": false, "full_bootstrap_completed": false,
		"full_automatic_source_pipeline_proven": false, "userdir": OS.get_user_data_dir(), "old_suites": 0}))
	quit(0 if failures == 0 else 1)

func check(ok: bool, label: String) -> bool:
	checks += 1
	if not ok:
		failures += 1
		push_error("MAIN_STARTER_ASSERT_FAIL " + current_group + ": " + label)
	return ok

func make_main() -> Node2D:
	var main = MAIN.instantiate()
	root.add_child(main)
	check(is_instance_valid(main.player) and is_instance_valid(main.world), "actual Main owns live Player/World")
	check(is_instance_valid(main.source_state) and main.source_state.is_native_new_run_state_ready(), "actual Main source State ready")
	check(is_instance_valid(main.source_providers) and main.source_providers.is_native_source_providers_ready(), "actual Main provider binding ready")
	check(main.source_state.get_native_new_run_player() == main.player and main.source_providers.get_native_source_player() == main.player, "one actual actor identity")
	return main

func destroy_main(main: Node2D) -> void:
	main.queue_free()
	await process_frame

static func _has_exact_keys(value: Variant, expected_keys: Array) -> bool:
	if not value is Dictionary or value.size() != expected_keys.size():
		return false
	var unique_keys: Dictionary = {}
	for key in expected_keys:
		if unique_keys.has(key) or not value.has(key):
			return false
		unique_keys[key] = true
	return true

func _test_startup_state_and_items() -> Dictionary:
	var before_ms = floor(Time.get_unix_time_from_system() * 1000.0)
	var main = make_main()
	var after_ms = ceil(Time.get_unix_time_from_system() * 1000.0)
	var state: Node = main.source_state
	var providers: Dictionary = main.source_providers.get_provider_bundle()
	var g: Dictionary = state.read_current_g()
	var p: Dictionary = state.read_current_p()
	var snap: Dictionary = state.get_snapshot()
	var source_boot_g: Dictionary = BOOTSTRAP.source_boot_g()
	var preserved_boot_g: Dictionary = snap["source_boot_inputs"]["g_file_init"]
	check(_has_exact_keys(source_boot_g["values"], BOOT_G_KEYS) \
		and _has_exact_keys(preserved_boot_g["values"], BOOT_G_KEYS) \
		and preserved_boot_g == source_boot_g \
		and _has_exact_keys(g, BOOT_G_KEYS + REGION_INIT_G_KEYS + SPAWN_HOLE_INIT_G_KEYS + FIELD_BOSS_INIT_G_KEYS) \
		and state.read_current_stats().size() == 5 and state.read_current_passives().size() == 26,
		"preserved source boot G40; actual G40+region7+spawnHole1+fieldBoss1/STATS5/PAS26")
	check(is_same(g, providers["current_g"].call()) and is_same(p, providers["current_p"].call()), "same G/P references across actual providers")
	# QA-001: boot packet and actual post-applyStats P are different phases.
	# game.html:27930,27944 write hpR before new-game initStage (64019,64025).
	check(not g.has("_fireZones") and not STATE.source_boot_p()["values"].has("hpR"), "unpublished stage zone and constructor-only HP rate remain absent")
	var hp_rate_writes: Array = state.get_snapshot()["source_initializer_writes"].filter(func(write): return write["field"] == "hpR")
	check(not hp_rate_writes.is_empty() and p.has("hpR") and p["hpR"] == hp_rate_writes.back()["value"], "current HP rate equals the final original initialization write")
	for packet in snap["source_boot_inputs"].values():
		check(packet["current"] == false and packet["derived"] == false, "source input packet stays noncurrent/nonderived")
	check(snap["current_installed"] == true and snap["main_full_ready"] == false and snap["derived_parameters_ready"] == false, "constructed actual current remains scoped pre-applyStats")
	var inv: Dictionary = state.read_current_inventory()
	var items: Dictionary = main.get_native_source_starter_items()
	check(inv["equipped"].size() == 17 and items["equipped"].size() == 15 and inv["bag"].size() == 10, "actual equipment15/bag10 in original17slot INV")
	check(inv["equipped"]["belt"] == null and inv["equipped"]["ossuary"] == null, "original unequipped slots remain null")
	for index in range(15):
		var item: Dictionary = items["equipped"][index]
		check(item["slot"] == EQUIP_ORDER[index] and is_same(item, inv["equipped"][EQUIP_ORDER[index]]), "original equip order and same item identity")
	for index in range(10): check(is_same(items["bag"][index], inv["bag"][index]), "same actual bag item identity")
	var ledger: Dictionary = snap["initial_starter_ledger"]
	check(ledger["items_created"] == 25 and ledger["equip_calls"] == 15 and ledger["bag_calls"] == 10 and ledger["mk_item_entries"] == 26, "actual original source factory counts including headband2 recursive entry")
	var events: Array = ledger["events"]
	check(events.size() == 50, "source creation/install events exact50")
	for index in range(15): check(events[index]["kind"] == "mk_item" and events[index+15]["kind"] == "equip", "all default items created before equipment installation")
	for index in range(10): check(events[index*2+30]["kind"] == "mk_item" and events[index*2+31]["kind"] == "bag", "bag source creation immediately precedes append")
	var draws: int = main.world.get_native_runtime_snapshot()["random_draw_count"]
	check(draws > 0 and draws == ledger["rng_draws"] and ledger["time_calls"] == 25 and ledger["level_reads"] == 70, "actual shared World RNG/time consumers, no LCG count assumption")
	for item in items["equipped"] + items["bag"]:
		check(float(item["id"]) >= before_ms and float(item["id"]) <= after_ms + 1.0, "actual item UID uses native Unix milliseconds plus source random draw")
	var out = {"equipped": 15, "bag": 10, "rng_draws": draws, "time_calls": ledger["time_calls"],
		"mk_item_entries": ledger["mk_item_entries"], "uid_window_ms": [before_ms, after_ms], "source_boot_current": false}
	await destroy_main(main)
	return out

func _test_public_actor_sync() -> Dictionary:
	var main = make_main()
	var bundle: Dictionary = main.source_providers.get_provider_bundle()
	var p: Dictionary = main.source_state.read_current_p()
	check(main.player.request_attack(), "actual public attack")
	main.player.release_attack()
	main.player.receive_damage(100, "magic")
	var current: Dictionary = bundle["current_p"].call()
	check(is_same(p, current) and current["st"] == main.player.stamina and current["hp"] == main.player.hp and current["s"] == main.player.state, "same owned P readthrough after real attack/damage")
	# P2-001e: 원본 새 게임 순서(applyStats 64019 → initStage 64025 → 31567 풀충전)로
	# 부팅 완료 시 hp=mhp/mp=mmp/st=mst. 고정 350 기준(hp==250/mp==160)은 원본 순서와
	# 달라 기대값만 정정 — 의도(공격=ST만 소모, MP 발명 없음, 피해 100 정확 차감)는 동일.
	check(current["st"] < current["mst"] and current["hp"] == current["mhp"] - 100.0 and current["mp"] == current["mmp"], "actual native resource changes, no invented MP cost")
	var frame: float = main.world.get_native_frame()
	var deadline = Time.get_ticks_msec() + 4000
	while main.world.get_native_frame() <= frame and Time.get_ticks_msec() < deadline: await process_frame
	current = bundle["current_p"].call()
	check(main.world.get_native_frame() > frame and current["st"] == main.player.stamina and current["hp"] == main.player.hp, "actual natural World clock retains current readthrough")
	var out = {"s": current["s"], "st": current["st"], "hp": current["hp"], "mp": current["mp"], "manual_actor_setters": false}
	await destroy_main(main)
	return out

func _test_original_provider_consumers() -> Dictionary:
	var main = make_main()
	var bundle: Dictionary = main.source_providers.get_provider_bundle()
	var snap: Dictionary = main.source_providers.get_snapshot()
	check(snap["provider_names"].size() == 10 and snap["binding_ready"] == true, "actual provider10 constructed")
	check(bundle["current_p"].call()["_fused"] == {"shieldFuse": true}, "original mkP fused state is actually supplied")
	var star: Dictionary = bundle["fusion"].fuse_star("holyDome")
	check(star["status"] == "READY" and star["value"] == 0, "original Fusion consumes actual constructor state")
	check(bundle["rates"].read_source_rates()["status"] == "READY", "actual Rates reads same original current INV/P/PAS")
	check(bundle["reference"].eq_stat("Grit")["status"] == "READY" and bundle["affix"].eq_affix("gritFlatN")["status"] == "READY", "original Cref/Affix consume actual generated inventory")
	check(snap["raw_grit_current"]["ready"] == true and snap["raw_grit_current"]["raw"] == 0 and snap["source_grit_boot_input"]["current"] == false, "actual raw declaration0 distinct from boot-input readiness")
	var grit_total: Dictionary = bundle["grit_total"].call()
	check(grit_total["status"] == "READY" and grit_total["ready"] == true and (grit_total["value"] is int or grit_total["value"] is float), "new structured original gritTotal getter returns actual source result")
	check(snap["bindings"]["parameters"]["ready"] == false and snap["bindings"]["parameters"]["missing"] == ["resource_sink"], "initial provider receipt has no fabricated resource sink")
	check(snap["source_parameters"]["ready"] == true and snap["source_parameters"]["missing"].is_empty() and snap["resource_sink_installed_by_bundle"] == false, "current original dispatcher owns the installed resource sink, not the provider bundle")
	var initialization: Dictionary = main.get_native_source_player_initialization_snapshot()
	check(initialization["result"]["completed"] == true and not main.source_initialization.is_native_source_initialization_active(), "source dispatcher completed and closed the constructor write window")
	check(snap["main_full_ready"] == false and snap["derived_parameter_application_proven"] == false and snap["automatic_rate_advance"] == false, "actual providers are not full Main/derived/automatic phase")
	var out = {"fusion_holyDome": star["value"], "grit_total": grit_total,
		"binding_ready": snap["binding_ready"], "parameters": snap["source_parameters"]}
	await destroy_main(main)
	return out

func _test_once_and_tree_gates() -> Dictionary:
	var main = make_main()
	var before: Dictionary = main.source_state.get_snapshot()
	var draws: int = main.world.get_native_runtime_snapshot()["random_draw_count"]
	var old_items: Dictionary = main.get_native_source_starter_items()
	var result: Dictionary = main.source_state.run_native_initial_starter_items(Callable(main.world, "sample_native_random_unit"), Callable())
	check(result["status"] == "ALREADY_ATTEMPTED" and main.world.get_native_runtime_snapshot()["random_draw_count"] == draws, "once retry consumes no World RNG or time provider")
	check(main.source_state.get_snapshot()["initial_starter_ledger"] == before["initial_starter_ledger"], "retry preserves actual factory ledger")
	check(is_same(old_items, main.get_native_source_starter_items()), "retained first raw result identity preserved")
	check(not main.source_state.initialize_new_run(main.player, main.world, main.source_resources), "State reinitialization rejects actual actor")
	var other = STATE.new()
	check(not other.initialize_new_run(main.player, main.world, main.source_resources), "new State refuses an already Tree/ready actor")
	other.free()
	var other_providers = PROVIDERS.new()
	check(not other_providers.configure(main.player, main.world, main.source_state, main.source_resources), "fresh provider construction does not reinitialize Tree actor")
	check(main.source_providers.is_native_source_providers_ready() and main.world.get_native_runtime_snapshot()["random_draw_count"] == draws, "failed constructors preserve actual binding and shared RNG")
	var out = {"retry": result["status"], "rng_before": draws, "rng_after": main.world.get_native_runtime_snapshot()["random_draw_count"]}
	await destroy_main(main)
	return out

func _test_lifecycle_and_grit_loss() -> Dictionary:
	var main = make_main()
	var bundle: Dictionary = main.source_providers.get_provider_bundle()
	check(main.player.request_attack(), "public attack before State lifecycle loss")
	main.player.release_attack()
	main.player.receive_damage(100, "magic")
	var st: float = main.player.stamina
	var hp: float = main.player.hp
	main.source_state.free()
	for key in ["current_g", "current_p", "current_stats", "current_passives", "current_inventory"]:
		check(bundle[key].call() == null, "lost actual State reader returns null: " + key)
	check(main.source_providers.get_provider_bundle().is_empty() and not main.source_providers.is_native_source_providers_ready(), "lost State rejects new provider access")
	check(bundle["rates"].read_source_rates()["status"] != "READY" and bundle["parameters"].read_current_parameters()["status"] == "NOT_READY", "fresh source reads NR, no actual current refill")
	check(main.get_native_source_starter_items()["status"] != "READY" and main.player.stamina == st and main.player.hp == hp, "lost holder fabricates no inventory/current state or actor resources")
	await destroy_main(main)
	var grit_main = make_main()
	var grit_bundle: Dictionary = grit_main.source_providers.get_provider_bundle()
	var valid_total: Dictionary = grit_bundle["grit_total"].call()
	grit_bundle["raw_grit"].unpublish()
	var lost_total: Dictionary = grit_bundle["grit_total"].call()
	check(valid_total["status"] == "READY" and lost_total["status"] == "NOT_READY" and lost_total["value"] == null, "unpublished raw grit is structured NR/null, never diagnostic zero")
	check(grit_bundle["grit"].read_current_grit()["status"] == "NOT_READY", "current raw grit authority loss propagates")
	var out = {"lost_state_provider_ready": false, "grit_before": valid_total, "grit_after": lost_total,
		"actual_actor_resource_refill": false}
	await destroy_main(grit_main)
	return out
