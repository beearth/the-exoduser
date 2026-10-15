extends SceneTree
# FIRST scoped integration. The actual Main owns Player/World/source resources.
# Direct Authority sinks; exact original providers; no manual physics.
# Constructor G/INV/PASSIVES/lesson/fuse/rate fixtures are not Main authority.
const MAIN = preload("res://scenes/main.tscn")
const PHASE = preload("res://scripts/native_source_player_regeneration_phase.gd")
const RATES = preload("res://port_modules/regeneration_stat_source/producer.gd")
const AFFIX = preload("res://port_modules/equipment_affix_reader/producer.gd")
const PASSIVES = preload("res://port_modules/player_passives_source/producer.gd")
const FUSION = preload("res://port_modules/fusion_star_source/producer.gd")
const SCHEMA = "exoduser.godot.source-player-regeneration-services.v1"
const FULL_TRACE = ["dome", "holy_flat", "holy_flat_hp", "holy_flat_mpst", "rates_precompute", "hp", "hp_natural", "lesson", "natural", "natural_resources"]
const GROUPS = ["source_order_once", "fractional_hp_damage", "lesson_flat_continues",
	"actual_clock_rejects", "source_nr_stops_later", "lifecycle_fail_closed"]
const ISOLATED_DIRECTORY = "EXODUSER-SourceRegenPhase-Isolated-20261014"
var checks = 0
var failures = 0
var current_group = ""

class FixtureServices extends Node:
	var main: Node2D
	var phase: Object
	var fusion: Object
	var options: Dictionary
	var current_g: Variant
	var current_passives: Variant
	var calls = {"p": 0, "g": 0, "inventory": 0, "passives": 0,
		"fuse": 0, "lesson": 0, "init": 0, "hp_sink": 0, "flat_sink": 0}
	var commits: Array[Dictionary] = []
	func _init(actual_main: Node2D, constructor_options: Dictionary = {}) -> void:
		main = actual_main
		options = constructor_options.duplicate(true)
		current_g = {"_fireZones": [{"type": "holyDome", "lv": 1,
			"x": main.player.global_position.x, "y": main.player.global_position.y, "r": 64.0}]}
		current_passives = {"pRegen": 0, "pMRegen": 0, "pAbund": 0, "pPred": 0}
	func read_p() -> Variant:
		calls["p"] += 1
		if not is_instance_valid(main.source_resources): return null
		var value: Dictionary = main.source_resources.read_native_regen_state()
		if value.is_empty(): return null
		value["hp"] = main.player.hp
		value["mhp"] = main.player.max_hp
		# Declared constructor hpR fixture, never a write to actual P/stat data.
		value["hpR"] = options.get("hpR", 0.8)
		value["_fused"] = {"shieldFuse": true} # declared original mkP constructor fixture
		return value
	func read_g() -> Variant:
		calls["g"] += 1
		return current_g
	func read_inventory() -> Variant:
		calls["inventory"] += 1
		return {"equipped": {}} # fixture authority, NOT original starter inventory
	func read_passives() -> Variant:
		calls["passives"] += 1
		return current_passives
	func read_fuse_star(skill: String) -> Dictionary:
		calls["fuse"] += 1
		return fusion.fuse_star(skill) # actual readonly original helper, no scalar alias
	func read_lesson() -> Dictionary:
		calls["lesson"] += 1
		return options.get("lesson", {"parry_lesson_active": false})
	func read_main_init_ready() -> bool:
		calls["init"] += 1
		return true # declared fixture witness, never a Main-global lineage claim
	func lose_passives() -> void:
		current_passives = null # fixture provider lifecycle, no original PAS write

func _initialize() -> void:
	if not OS.get_user_data_dir().contains(ISOLATED_DIRECTORY):
		push_error("SOURCE_PHASE_INVALID_ISOLATION " + OS.get_user_data_dir())
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
		print("SOURCE_PHASE_GROUP_RESULT " + JSON.stringify(row))
	print("SOURCE_PHASE_SUITE_RESULT " + JSON.stringify({"groups": selected.size(), "checks": checks,
		"failures": failures, "results": rows, "userdir": OS.get_user_data_dir(),
		"actual_main_scene": true, "upstream_constructor_fixtures": true,
		"full_main_source_authority_proven": false, "manual_physics": false, "old_suites": 0}))
	quit(0 if failures == 0 else 1)

func check(ok: bool, label: String) -> bool:
	checks += 1
	if not ok:
		failures += 1
		push_error("SOURCE_PHASE_ASSERT_FAIL " + current_group + ": " + label)
	return ok

func make_actual_main() -> Node2D:
	var main = MAIN.instantiate()
	root.add_child(main)
	check(is_instance_valid(main.player) and is_instance_valid(main.world), "actual Main owns actor and World")
	check(main.player.get_native_source_resource_authority() == main.source_resources, "same actual source-resource actor")
	return main

func destroy_actual_main(main: Node2D) -> void:
	main.queue_free()
	await process_frame

class ClockProbe extends Node:
	var armed = false
	var done = false
	var phase: Object
	var world: Node
	var fixture: FixtureServices
	var result: Dictionary = {}
	func _physics_process(_delta: float) -> void:
		if not armed or done: return
		var before: Dictionary = phase.get_snapshot()
		var calls: Dictionary = fixture.calls.duplicate(true)
		var frame: float = world.get_native_frame()
		var dt: float = world.get_native_projectile_fx_context()["dt_sp"]
		var ens: Array = world.get_native_world_identity()
		var rejects = [not phase.advance_native(dt, frame, ens.duplicate()),
			not phase.advance_native(dt, frame - 1.0, ens),
			not phase.advance_native(dt + 1e-7, frame, ens),
			not phase.advance_native(dt, frame + 1e-7, ens)]
		var query_zero = calls == fixture.calls
		var after: Dictionary = phase.get_snapshot()
		result = {"rejects": rejects, "query_zero": query_zero, "frame": frame,
			"admitted_before": before["counts"]["clock_admitted"],
			"admitted_after_bad": after["counts"]["clock_admitted"]}
		done = true

func make_bound_scene(options: Dictionary = {}) -> Dictionary:
	var main = make_actual_main()
	var fixture = FixtureServices.new(main, options)
	main.add_child(fixture)
	var probe = ClockProbe.new()
	main.add_child(probe)
	main.move_child(probe, main.player.get_index()) # observer before Player0 after World-1
	probe.process_physics_priority = 0
	var passives = PASSIVES.new()
	passives.configure_current_passives_reader(Callable(fixture, "read_passives"))
	var affix = AFFIX.new()
	affix.configure(Callable(fixture, "read_inventory"))
	var rates = RATES.new()
	rates.configure(Callable(passives, "read_current_passives"), Callable(fixture, "read_p"), Callable(fixture, "read_inventory"))
	var fusion = FUSION.new()
	fusion.configure(Callable(fixture, "read_p"))
	fixture.fusion = fusion
	var phase = PHASE.new()
	fixture.phase = phase
	var deadline = Time.get_ticks_msec() + 4000
	while main.world.get_native_frame() <= 0.0 and Time.get_ticks_msec() < deadline: await process_frame
	check(main.world.get_native_frame() > 0.0, "actual World clock naturally published")
	var services = {"schema": SCHEMA, "rates": rates, "affix": affix, "passives": passives,
		"current_g": Callable(fixture, "read_g"), "current_p": Callable(fixture, "read_p"),
		"fuse_star": Callable(fixture, "read_fuse_star"),
		"hp_sink": Callable(main.source_resources, "commit_native_source_hp"),
		"flat_resource_sink": Callable(main.source_resources, "commit_native_holy_flat_resources"),
		"lesson": Callable(fixture, "read_lesson"), "main_init_ready": Callable(fixture, "read_main_init_ready")}
	check(phase.configure(main.player, main.world, main.source_resources, services), "exact fixture-backed original phase configures")
	check(main.source_resources.bind_native_source_regeneration_phase(phase), "actual Authority binds phase once")
	check(main.world.bind_native_player_resource_regeneration(phase), "actual World/Player binds exclusive phase")
	return {"main": main, "fixture": fixture, "phase": phase, "probe": probe,
		"affix": affix, "rates": rates, "passives": passives, "fusion": fusion}

func wait_admissions(s: Dictionary, amount: int) -> void:
	var goal: int = s.phase.get_snapshot()["counts"]["clock_admitted"] + amount
	var deadline = Time.get_ticks_msec() + 4000
	while s.phase.get_snapshot()["counts"]["clock_admitted"] < goal and Time.get_ticks_msec() < deadline: await process_frame
	check(s.phase.get_snapshot()["counts"]["clock_admitted"] >= goal, "actual admitted World phases advance")

func wait_world_ticks(s: Dictionary, amount: float) -> void:
	var goal: float = s.main.world.get_native_frame() + amount
	var deadline = Time.get_ticks_msec() + 4000
	while s.main.world.get_native_frame() < goal and Time.get_ticks_msec() < deadline: await process_frame
	check(s.main.world.get_native_frame() >= goal, "actual World frames remain live")

func _test_source_order_once() -> Dictionary:
	var s = await make_bound_scene()
	check(s.main.player.request_attack(), "public attack creates actual ST deficit")
	s.main.player.release_attack()
	s.main.player.receive_damage(100, "magic")
	await wait_admissions(s, 2)
	var snap: Dictionary = s.phase.get_snapshot()
	check(snap["trace"] == FULL_TRACE, "presence flatHP flatMPST precompute HP naturalSTMP exact phase order")
	var admitted: int = snap["counts"]["clock_admitted"]
	for name in ["dome", "holy_flat", "flat_resource_sink", "rates_precompute", "hp", "lesson", "natural", "natural_resource_sink"]:
		check(snap["counts"][name] == admitted, "once per actual admitted phase: " + name)
	var results: Dictionary = snap["last_results"]
	check(results["hp"]["packet"]["hp_before"] == results["holy_flat"]["hp_packet"]["new_hp"], "HP natural reads after actual flat HP")
	var packet: Dictionary = s.main.source_resources.get_snapshot()["last_packet"]
	check(s.main.player.stamina == packet["writes"][0]["value"], "source STMP final value has no appended native .28 fallback")
	check(snap["natural_plans_before_hp"] == 0 and snap["commit_phase"] == "", "no extra Natural plan; sink tag closed outside actual phase")
	var hp: float = s.main.player.hp
	check(not s.main.source_resources.commit_native_source_hp(hp) and s.main.player.hp == hp, "external HP sink has no admitted subphase")
	var out = {"trace": snap["trace"], "counts": snap["counts"], "actual_hp": hp,
		"actual_st": s.main.player.stamina, "fixture_globals_not_main_ready": true}
	await destroy_actual_main(s.main)
	return out

func _test_fractional_hp_damage() -> Dictionary:
	var s = await make_bound_scene()
	s.main.player.receive_damage(100, "magic")
	await wait_admissions(s, 1)
	var fractional: float = s.main.player.hp
	check(fractional > 250.0 and fractional != floor(fractional), "real public damage then source fractional healing")
	s.main.player.receive_damage(2, "magic")
	check(is_equal_approx(s.main.player.hp, fractional - 2.0), "next public damage preserves fractional HP")
	var after_damage: float = s.main.player.hp
	await destroy_actual_main(s.main)
	var capped = await make_bound_scene({"hpR": 1000.0})
	capped.main.player.receive_damage(1, "magic")
	await wait_admissions(capped, 1)
	check(capped.main.player.hp == capped.main.player.max_hp, "actual source natural HP terminal cap")
	await destroy_actual_main(capped.main)
	var terminal = make_actual_main()
	for _index in range(4): terminal.player.receive_damage(200, "magic")
	check(terminal.player.hp == 0.0 and terminal.player.state == "dead", "public damage clamps actual terminal HP to zero")
	await destroy_actual_main(terminal)
	return {"fractional_hp": fractional, "after_public_damage": after_damage,
		"QE_positive_subunit_requestQ": "NOT_OBSERVED: separate configured QE/state admission scope"}

func _test_lesson_flat_continues() -> Dictionary:
	var s = await make_bound_scene({"lesson": {"parry_lesson_active": true, "parry_lesson_chapter": 2}})
	check(s.main.player.request_attack(), "public attack prepares real ST deficit")
	s.main.player.release_attack()
	s.main.player.receive_damage(100, "magic")
	var st: float = s.main.player.stamina
	await wait_admissions(s, 2)
	var snap: Dictionary = s.phase.get_snapshot()
	check(s.main.player.hp > 250.0 and s.main.player.stamina > st, "lesson leaves flat HP/MPST and HP natural active")
	check(not snap["trace"].has("natural_resources") and snap["counts"]["natural_resource_sink"] == 0, "chapter2 blocks only Natural resource writes")
	check(s.main.source_resources.get_snapshot()["commit_count"] == 0 and snap["counts"]["flat_resource_sink"] > 0, "no STMP Natural sink; actual flat sink still active")
	var out = {"trace": snap["trace"], "counts": snap["counts"], "hp": s.main.player.hp, "st": s.main.player.stamina}
	await destroy_actual_main(s.main)
	return out

func _test_actual_clock_rejects() -> Dictionary:
	var s = await make_bound_scene()
	s.probe.phase = s.phase
	s.probe.world = s.main.world
	s.probe.fixture = s.fixture
	s.probe.armed = true
	var deadline = Time.get_ticks_msec() + 4000
	while not s.probe.done and Time.get_ticks_msec() < deadline: await process_frame
	check(s.probe.done, "natural engine observer runs before actual Player")
	var result: Dictionary = s.probe.result
	check(not result["rejects"].has(false) and result["query_zero"], "copy/stale/dt/frame epsilon reject before every source query")
	check(result["admitted_before"] == result["admitted_after_bad"], "invalid calls do not reserve native phase")
	check(s.phase.get_snapshot()["last_native_frame"] >= result["frame"], "actual Player subsequently consumes same or later real World phase")
	var calls: Dictionary = s.fixture.calls.duplicate(true)
	var frame: float = s.main.world.get_native_frame()
	var dt: float = s.main.world.get_native_projectile_fx_context()["dt_sp"]
	check(not s.phase.advance_native(dt, frame, s.main.world.get_native_world_identity()) and calls == s.fixture.calls, "duplicate source phase query0")
	paused = true
	calls = s.fixture.calls.duplicate(true)
	check(not s.phase.advance_native(dt, frame, s.main.world.get_native_world_identity()) and calls == s.fixture.calls, "paused source phase query0")
	paused = false
	await destroy_actual_main(s.main)
	return {"probe": result, "manual_physics": false}

func _test_source_nr_stops_later() -> Dictionary:
	var s = await make_bound_scene()
	check(s.main.player.request_attack(), "public attack creates ST deficit for NR boundary")
	s.main.player.release_attack()
	s.main.player.receive_damage(100, "magic")
	s.fixture.lose_passives()
	await wait_admissions(s, 1)
	var snap: Dictionary = s.phase.get_snapshot()
	check(snap["ready"] == false and snap["source_ready"] == false, "actual source NR marks phase unready")
	check(snap["trace"] == ["dome", "holy_flat", "holy_flat_hp", "holy_flat_mpst", "rates_precompute"], "NR preserves prior flat writes and stops all later phases")
	check(not snap["last_results"].has("hp") and not snap["last_results"].has("natural"), "no HP natural or STMP dispatch after rates NR")
	var auth: Dictionary = s.main.source_resources.get_snapshot()
	check(auth["commit_count"] == 0 and auth["last_source_write"]["phase"] == "holy_flat_mpst", "only original partial flat resources committed")
	check(s.main.player.stamina == auth["last_source_write"]["writes"][1]["value"], "NR never revives native .28 fallback")
	var out = {"trace": snap["trace"], "error": snap["error"], "actual_hp": s.main.player.hp, "actual_st": s.main.player.stamina}
	await destroy_actual_main(s.main)
	return out

func _test_lifecycle_fail_closed() -> Dictionary:
	var s = await make_bound_scene()
	check(s.main.player.request_attack(), "public attack creates pre-loss ST deficit")
	s.main.player.release_attack()
	var st: float = s.main.player.stamina
	var hp: float = s.main.player.hp
	s.fixture.free()
	await wait_world_ticks(s, 3.0)
	var snap: Dictionary = s.main.player.get_native_resource_regeneration_snapshot()
	check(snap["bound"] == true and snap["ready"] == false, "lost actual fixture reader keeps persistent phase adoption but closes readiness")
	check(s.main.player.stamina == st and s.main.player.hp == hp, "lost provider does not write HP/ST or enable native fallback")
	check(s.phase.get_native_source_commit_phase() == "", "lifecycle loss grants no source commit tag")
	await destroy_actual_main(s.main)
	return {"bound": snap["bound"], "ready": snap["ready"], "source_upstream_fixture": true}
