extends SceneTree
const MAIN = preload("res://scripts/main.gd")
const AUTHORITY = preload("res://scripts/native_demo11_authority.gd")
const USERDIR := "EXODUSER-demo11-01-Isolated-20261021"
var assertions := 0
var failures := 0
func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("DEMO11_FAIL ", label)
func _initialize() -> void: call_deferred("_run")
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/custom_user_dir_name") == USERDIR and OS.get_user_data_dir().ends_with(USERDIR), "isolated_userdir")
	for route in ["full", "ea", "development", "_dLv500", "forge_lab", "", "DEMO"]:
		var rejected := AUTHORITY.boot_manifest(route)
		check(rejected.status == "REJECTED" and rejected.reason == "unsupported_boot_route" and not rejected.has("demo"), "no_development_fallthrough:" + route)
	var main: Node = MAIN.new()
	check(main.read_native_demo_policy().status == "NOT_READY", "preboot_policy_unavailable")
	var input := {"lv":100,"exp":999,"maxExp":100,"marker":[1]}
	check(main.evaluate_native_demo_exp_gate(input, "2026-10-21").reason == "boot_not_started", "preboot_gate_unavailable")
	main.set_meta("build_target", "full")
	main.set_meta("_dLv500", true)
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	var policy: Dictionary = main.read_native_demo_policy()
	check(policy.status == "READY" and policy.demo == true and policy.build_target == "demo" and policy.boot_route == "demo_new", "actual_main_selects_demo_not_developer_metadata")
	check(policy.stage == 0 and policy.last_stage == 0 and policy.hell == 0 and policy.level_cap == 100, "source_policy_values")
	check(is_instance_valid(main.world) and is_instance_valid(main.player) and is_instance_valid(main.hud), "actual_main_player_and_hud_booted")
	check(main.world.map_data.stage == policy.stage and main.source_state.read_current_g().stage == policy.stage, "actual_world_and_current_state_match_authority")
	check(main.source_state.read_current_p().lv == 1, "normal_demo_starts_level1_not_development100")
	policy.stage = 13
	policy.source.build = "tampered"
	policy.pending_consumers.clear()
	var fresh: Dictionary = main.read_native_demo_policy()
	check(fresh.stage == 0 and fresh.source.build == "game.html:16646-16648" and fresh.pending_consumers.size() == 3, "deep_copy_cannot_change_authority")
	var before := input.duplicate(true)
	var entry: Dictionary = main.evaluate_native_demo_exp_gate(input, "2026-10-21")
	check(entry.allowed == false and entry.reason == "demo" and entry.state.exp == 99, "entry_cap_clamps_without_xp_writer")
	input.exp = 7
	entry = main.evaluate_native_demo_exp_gate(input, "2026-10-21")
	var loop: Dictionary = main.evaluate_native_demo_exp_gate(input, "2026-10-21", true)
	check(entry.state.exp == 7 and loop.state.exp == 99, "reused_meta06_entry_min_and_loop_assignment")
	check(input.exp == 7 and input.marker == before.marker, "input_not_mutated")
	input.lv = 99
	check(main.evaluate_native_demo_exp_gate(input, "2026-10-21").allowed, "level99_allowed")
	input.lv = 1000
	input._transLvDate = "yesterday"
	check(main.evaluate_native_demo_exp_gate(input, "2026-10-21").state._transLvDate == "yesterday", "demo_precedes_daily_gate")
	main.free()
	# Actual World readiness fault: Main must consume policy before Player creation.
	var denied: Node = MAIN.new()
	denied.child_entered_tree.connect(func(child: Node):
		if child.name == "CH1CanonicalWorld":
			child.ready.connect(func(): child.map_data.stage = 1, CONNECT_ONE_SHOT))
	root.add_child(denied)
	if not denied.is_node_ready(): await denied.ready
	check(denied.world == null and denied.player == null and not denied.is_physics_processing(), "wrong_stage_rejected_before_player")
	denied.free()
	print("DEMO11_RESULT ", JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"actual_main_boots":2,"expected_error":"Native demo boot rejected: stage outside demo policy","expected_error_count":1}))
	quit(1 if failures else 0)
