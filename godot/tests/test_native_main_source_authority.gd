extends SceneTree

# Actual Main scene only. No manual World/Player assembly, original formula
# replay, fixture MP/G/INV/PASSIVES, automatic source regeneration or physics.
const MAIN = preload("res://scenes/main.tscn")
const AUTHORITY = preload("res://scripts/native_source_resource_authority.gd")
const PARAMETERS = preload("res://port_modules/player_resource_parameters_source/producer.gd")
const ISOLATED_DIRECTORY = "EXODUSER-MainSourceAuthority-Isolated-20261014"
const GROUPS = ["startup_lineage", "public_attack_atomic", "rejected_transactions",
	"new_run_constructor_gates", "authority_lifecycle"]
var checks = 0
var failures = 0
var current_group = ""

func _initialize() -> void:
	# Never load Main/capture against the user's existing QA directory.
	if not OS.get_user_data_dir().contains(ISOLATED_DIRECTORY):
		push_error("MAIN_AUTHORITY_INVALID_ISOLATION " + OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")

func _run() -> void:
	var selected: Array = GROUPS.duplicate()
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="): selected = Array(arg.trim_prefix("--only=").split(",", false))
	var records: Array = []
	for id in selected:
		if not GROUPS.has(id): quit(2); return
		current_group = id
		var first_checks = checks
		var first_failures = failures
		var start_time = Time.get_ticks_msec()
		var observation: Dictionary = await call("_test_" + id)
		var record = {"group": id, "checks": checks - first_checks,
			"failures": failures - first_failures,
			"elapsed_ms": Time.get_ticks_msec() - start_time, "observation": observation}
		records.append(record)
		print("MAIN_AUTHORITY_GROUP_RESULT " + JSON.stringify(record))
	print("MAIN_AUTHORITY_SUITE_RESULT " + JSON.stringify({"groups": selected.size(),
		"checks": checks, "failures": failures, "results": records,
		"isolated_user_dir": OS.get_user_data_dir(), "actual_main_scene": true,
		"source_natural_regeneration_installed": false, "derived_parameters_ready": false,
		"manual_physics": false, "old_suites": 0}))
	quit(0 if failures == 0 else 1)

func check(ok: bool, label: String) -> bool:
	checks += 1
	if not ok:
		failures += 1
		push_error("MAIN_AUTHORITY_ASSERT_FAIL " + current_group + ": " + label)
	return ok

func make_main() -> Node2D:
	var main = MAIN.instantiate()
	main.set_meta("native_source_regeneration_boot", "external") # P2-005d: synthetic natural_regen 패킷 검증은 자동 리젠 없는 정지 상태 전제 — 하니스 옵트아웃
	root.add_child(main) # the actual production Main _ready owns construction
	check(is_instance_valid(main.player) and is_instance_valid(main.world), "actual Main creates its Player and World")
	check(is_instance_valid(main.source_resources), "actual Main creates source authority")
	check(main.source_resources.is_native_source_resources_ready(), "actual live World child source resources ready")
	check(main.player.get_native_source_resource_authority() == main.source_resources, "same actual Player public authority binding")
	check(main.world.player == main.player and main.source_resources.get_parent() == main.world, "same actor / World ownership")
	return main

func destroy_main(main: Node2D) -> void:
	main.queue_free()
	await process_frame

func resource_packet(authority: Node, st_value: float, mp_value: float) -> Dictionary:
	var state: Dictionary = authority.read_native_regen_state()
	return {"kind": "natural_regen", "source": "game.html:33359-33364", "writes": [
		{"field": "st", "before": state["st"], "value": st_value, "cap_field": "mst"},
		{"field": "mp", "before": state["mp"], "value": mp_value, "cap_field": "mmp"}]}

func _test_startup_lineage() -> Dictionary:
	var main = make_main()
	var authority: Node = main.source_resources
	var original: Dictionary = PARAMETERS.source_boot_parameters()
	var snapshot: Dictionary = main.player.get_native_source_resources_snapshot()
	var current: Dictionary = authority.read_current_resource_parameters()
	check(snapshot["source_boot_input"] == original, "Main consumes exact original SOURCE_BOOT input")
	check(original["status"] == "SOURCE_BOOT" and original["current"] == false and original["derived"] == false, "original source packet remains noncurrent and nonderived")
	check(current["status"] == "READY" and current["current"] == true and current["derived"] == false, "actual constructed current projection has distinct provenance")
	# QA-001: game.html:27929-27947 applyStats / 16425-16431 recalcSt precede
	# stage-entry refill (31567); SOURCE_BOOT remains immutable input history.
	var expected: Dictionary = original["values"].duplicate(true)
	var source_writes: Array = authority.get_snapshot()["source_initializer_writes"]
	for write in source_writes:
		if expected.has(write["field"]): expected[write["field"]] = write["value"]
	expected["st"] = expected["mst"]
	expected["mp"] = expected["mmp"]
	var same_numeric_values = not source_writes.is_empty() and current["values"].size() == expected.size()
	for field in expected:
		var value: Variant = current["values"].get(field)
		same_numeric_values = same_numeric_values and (value is int or value is float) \
			and is_finite(float(value)) and float(value) == float(expected[field])
	check(same_numeric_values, "actual Main current six numeric leaves equal ordered source writes and stage refill")
	check(current["values"]["mp"] == main.source_state.read_current_p()["mp"] and current["values"]["mmp"] == main.source_state.read_current_p()["mmp"] and current["values"]["stR"] == expected["stR"] and current["values"]["mpR"] == expected["mpR"], "real holder MP/MMP and source rates equal current owner and original writes")
	check(current["phase"] == "source_initialization_partial" and current["derived_ready"] == false and current["main_full_ready"] == false, "initialized current remains partial, not full derived Main authority")
	check(current["lineage"]["kind"] == "new_run" and current["lineage"]["input_current"] == false and current["lineage"]["input_derived"] == false, "current lineage retains original boot flags")
	check(snapshot["bound"] == true and snapshot["automatic_physics"] == false and snapshot["restore_fallback"] == false and snapshot["missing_upstream_manufactured"] == false, "public bound scope has no fallback or manufactured globals")
	var copied: Dictionary = main.player.get_native_source_resources_snapshot()
	copied["source_boot_input"]["values"]["mp"] = -999
	copied["current_parameters"]["values"]["mp"] = -999
	check(authority.read_current_resource_parameters()["values"]["mp"] == current["values"]["mp"] and authority.get_snapshot()["source_boot_input"] == original, "public deep copies cannot overwrite actual current or source input")
	var report: Dictionary = main.world.get_encounter_report()
	check(report["supported_count"] == 6 and report["unsupported_count"] == 10, "Main encounter support6 / unsupported10 unchanged")
	var out = {"current": current, "source_boot": original,
		"encounters": {"supported": report["supported_count"], "unsupported": report["unsupported_count"]}}
	await destroy_main(main)
	return out

func _test_public_attack_atomic() -> Dictionary:
	var main = make_main()
	var authority: Node = main.source_resources
	var before_attack: Dictionary = authority.read_native_regen_state()
	check(main.player.request_attack(), "actual Main public attack succeeds")
	main.player.release_attack()
	var state: Dictionary = authority.read_native_regen_state()
	check(state["st"] == main.player.stamina and state["s"] == main.player.state and state["st"] < before_attack["st"], "authority reads same actual attacked actor fields")
	check(state["mp"] == before_attack["mp"], "public physical attack does not invent MP cost")
	# Synthetic sink packet: MP159 is a requested value, not natural recovery.
	# Boot mpR0 is historical input; make_main explicitly opts out of automatic regen.
	var packet = resource_packet(authority, minf(state["st"] + 1.0, state["mst"]), 159.0)
	check(authority.commit_native_regen_resources(packet), "public synthetic paired packet commits actual ST and owned MP")
	var after: Dictionary = authority.read_native_regen_state()
	check(after["st"] == packet["writes"][0]["value"] and main.player.stamina == after["st"] and after["mp"] == 159, "both actual resources consume ordered packet values")
	check(main.player.get_native_source_resources_snapshot()["current_parameters"]["values"]["mp"] == 159, "public Main getter observes actual owned MP write")
	check(authority.get_snapshot()["commit_count"] == 1 and authority.get_snapshot()["last_packet"] == packet, "one synchronous transaction recorded")
	var attack_st: float = state["st"]
	var frame: float = main.world.get_native_frame()
	var deadline = Time.get_ticks_msec() + 4000
	while main.world.get_native_frame() <= frame and Time.get_ticks_msec() < deadline: await process_frame
	check(main.world.get_native_frame() > frame and authority.read_native_regen_state()["st"] == main.player.stamina, "natural actual World frame keeps actual field readthrough")
	check(authority.read_native_regen_state()["mp"] == 159 and authority.get_snapshot()["commit_count"] == 1, "no automatic source MP regen or extra authority dispatch")
	var out = {"attack_st": attack_st, "synthetic_commit": packet, "after": after,
		"actual_mp": authority.read_native_regen_state()["mp"], "source_natural_regen_branch": false}
	await destroy_main(main)
	return out

func _test_rejected_transactions() -> Dictionary:
	var main = make_main()
	var authority: Node = main.source_resources
	check(main.player.request_attack(), "public attack provides real ST deficit")
	main.player.release_attack()
	var before: Dictionary = authority.read_native_regen_state()
	var valid = resource_packet(authority, before["st"] + 1.0, 159.0)
	for kind in ["st_before", "mp_before", "st_cap", "mp_cap", "hp_field"]:
		var packet: Dictionary = valid.duplicate(true)
		match kind:
			"st_before": packet["writes"][0]["before"] += 1.0
			"mp_before": packet["writes"][1]["before"] += 1.0
			"st_cap": packet["writes"][0]["value"] = before["mst"] + 1.0
			"mp_cap": packet["writes"][1]["value"] = before["mmp"] + 1.0
			"hp_field": packet["writes"][0]["field"] = "hp"
		check(not authority.commit_native_regen_resources(packet), "public actual sink rejects " + kind)
		check(authority.read_native_regen_state() == before and authority.get_snapshot()["commit_count"] == 0, "invalid BOTH before/cap packet leaves BOTH actual resources unchanged")
	paused = true
	check(not authority.commit_native_regen_resources(valid), "actual paused Tree rejects resource transaction")
	check(authority.read_native_regen_state() == before, "paused rejection changes neither resource")
	paused = false
	var out = {"rejected_packets": 6, "actual_resources": before, "commit_count": authority.get_snapshot()["commit_count"]}
	await destroy_main(main)
	return out

func _test_new_run_constructor_gates() -> Dictionary:
	var main = make_main()
	var authority: Node = main.source_resources
	var before: Dictionary = authority.read_native_regen_state()
	check(not authority.initialize_new_run(main.player, main.world, PARAMETERS.source_boot_parameters()), "same actual authority cannot reinitialize")
	check(authority.read_native_regen_state() == before, "reinitialization does not overwrite current actor resources")
	var another = AUTHORITY.new()
	check(not another.initialize_new_run(main.player, main.world, PARAMETERS.source_boot_parameters()), "preexisting actual Tree actor rejects fresh constructor before mutation")
	check(not main.world.bind_native_player_source_resources(another), "rejected constructor cannot half bind")
	check(authority.read_native_regen_state() == before and main.player.get_native_source_resource_authority() == authority, "original actual Main binding and both resources preserved")
	check(not main.world.bind_native_player_source_resources(authority), "same Player persistent binding does not admit second bind")
	another.free()
	var out = {"ready_actor_reinitialization": false, "constructor_current_resource_fields": before, "manual_scene_assembly": false}
	await destroy_main(main)
	return out

func _test_authority_lifecycle() -> Dictionary:
	var main = make_main()
	var authority: Node = main.source_resources
	check(main.player.request_attack(), "actual public attack precedes authority loss")
	main.player.release_attack()
	var st: float = main.player.stamina
	authority.free() # actual provider lifecycle, no actor resource setter
	check(main.player.get_native_source_resource_authority() == null, "freed holder has no public authority fallback")
	var snapshot: Dictionary = main.player.get_native_source_resources_snapshot()
	check(snapshot["bound"] == true and snapshot["ready"] == false, "persistent source binding remains explicitly missing")
	check(not snapshot.has("current_parameters") and main.player.stamina == st, "missing reader manufactures no current MP and does not overwrite actual ST")
	check(main.player.get_meta("native_source_resource_authority_initialized", false) == true, "explicit initialized claim persists after owner loss")
	var replacement = AUTHORITY.new()
	check(not replacement.initialize_new_run(main.player, main.world, PARAMETERS.source_boot_parameters()), "owner loss cannot overwrite ready actor by new bootstrap")
	check(not main.world.bind_native_player_source_resources(replacement), "missing/rejected authority is not half installed")
	replacement.free()
	var frame: float = main.world.get_native_frame()
	var deadline = Time.get_ticks_msec() + 4000
	while main.world.get_native_frame() <= frame and Time.get_ticks_msec() < deadline: await process_frame
	check(main.world.get_native_frame() > frame and main.player.get_native_source_resource_authority() == null, "actual Main remains live with missing source resource authority")
	var out = {"bound": snapshot["bound"], "ready": snapshot["ready"], "mp_default_refill": false,
		"legacy_ST_or_source_regen_change_claim": false, "manual_physics": false}
	await destroy_main(main)
	return out
