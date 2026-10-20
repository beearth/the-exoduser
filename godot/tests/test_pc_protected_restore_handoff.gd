extends SceneTree
## PC-RUNTIME-STATS B — protected restore handoffs (DEMO11-06) + resource restore writer.
## Oracle: existing tools/sv_restore_flow_oracle.cjs (exact source slices on detached
## fixtures), captured to a UTF-8 file by tests/pc_restore_flow_oracle_to_file.mjs.
const USERDIR = "EXODUSER-pc-runtime-stats-Isolated-20261021"
const FLOW = preload("res://port_modules/save_adapter/source_restore_flow.gd")
const HANDOFF = preload("res://scripts/native_source_protected_restore_handoff.gd")
var checks := 0
var failures := 0
var fail_prints := 0

func _initialize() -> void: call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		fail_prints += 1
		if fail_prints <= 40: print("PCRH_FAIL ", label)

func argument(name: String) -> String:
	for value in OS.get_cmdline_user_args():
		if value.begins_with(name + "="): return value.substr(name.length() + 1)
	return ""

# Same numeric wire format as test_native_restore_flow.gd.
func wire(value: Variant) -> Variant:
	if value is float and not is_finite(value): return {"@number": "NaN" if is_nan(value) else ("Infinity" if value > 0 else "-Infinity")}
	if (value is float or value is int) and (float(value) != floor(float(value)) or absf(float(value)) >= 1e12 or (value == 0 and PackedFloat64Array([float(value)]).to_byte_array().hex_encode() == "0000000000000080")):
		return {"@f64": PackedFloat64Array([float(value)]).to_byte_array().hex_encode()}
	if value is Dictionary:
		var result := {}
		for key in value: result[key] = wire(value[key])
		return result
	if value is Array:
		var result := []
		for item in value: result.append(wire(item))
		return result
	return value

func unwire(value: Variant) -> Variant:
	if value is Dictionary:
		if value.size() == 1 and value.has("@number"): return NAN if value["@number"] == "NaN" else (INF if value["@number"] == "Infinity" else -INF)
		if value.size() == 1 and value.has("@f64"): return str(value["@f64"]).hex_decode().to_float64_array()[0]
		var result := {}
		for key in value: result[key] = unwire(value[key])
		return result
	if value is Array:
		var result := []
		for item in value: result.append(unwire(item))
		return result
	return value

func canon(value: Variant) -> String:
	# Key-order independent, int/float independent canonical JSON of the wire form.
	var w: Variant = wire(value)
	return JSON.stringify(_sorted(w))

func _sorted(value: Variant) -> Variant:
	if value is Dictionary:
		var keys: Array = value.keys(); keys.sort()
		var out := {}
		for key in keys: out[key] = _sorted(value[key])
		return out
	if value is Array:
		var out := []
		for item in value: out.append(_sorted(item))
		return out
	if value is int: return float(value)
	return value

func observe(stage: String, state: Dictionary, payload: Dictionary, tables: Dictionary) -> Dictionary:
	match stage:
		"protected_qe": return HANDOFF.protected_qe(state, payload)
		"protected_active_sync": return HANDOFF.protected_active_sync(state, tables)
		"protected_wing": return HANDOFF.protected_wing(state)
	return {}

func _run() -> void:
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated userdir")
	if failures > 0: quit(1); return
	var out_path := ProjectSettings.globalize_path("user://pcrh-restore-oracle.json")
	var exit_code := OS.execute(argument("--node-bin"), PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_restore_flow_oracle_to_file.mjs"),
		"--repo-root=" + ProjectSettings.globalize_path("res://.."), "--out-file=" + out_path]), [], true)
	check(exit_code == 0, "restore source oracle exit 0")
	var probe: Variant = JSON.parse_string(FileAccess.get_file_as_string(out_path))
	check(probe is Dictionary and probe.get("rows") is Array and probe.get("protected_source_fixture_only") == true, "oracle rows")
	if not probe is Dictionary: quit(1); return
	var tables: Dictionary = unwire(probe.tables)
	var flow := FLOW.new()
	var direct := {"protected_qe": 0, "protected_active_sync": 0, "protected_wing": 0}
	var e2e_ready := 0
	var e2e_rows := 0
	for row_wire in probe.rows:
		var row: Dictionary = row_wire
		var payload: Variant = unwire(row.payload)
		var current: Dictionary = unwire(row.current)
		# 1) Direct parity: PC handoff on the oracle's detached before == source after.
		for stage in HANDOFF.STAGES:
			if not row.observations.has(stage): continue
			var obs: Dictionary = unwire(row.observations[stage])
			var mine: Dictionary = observe(stage, obs.before, payload if payload is Dictionary else {}, tables)
			direct[stage] += 1
			check(mine.get("state") == obs.state, row.id + "/" + stage + " state " + str(mine.get("state")))
			check(canon(mine.get("before")) == canon(obs.before), row.id + "/" + stage + " before")
			check(canon(mine.get("after")) == canon(obs.after), row.id + "/" + stage + " after mine=" + canon(mine.get("after")).left(200) + " src=" + canon(obs.after).left(200))
			check(canon(obs.before) == canon(unwire(row.observations[stage]).before), row.id + "/" + stage + " input not mutated")
		# 2) End-to-end: flow halts at each boundary; PC handoff supplies the observation.
		if row.expected.status != "READY" or not payload is Dictionary: continue
		e2e_rows += 1
		var supplied := {}
		var result: Dictionary = {}
		for attempt in 4:
			result = flow.calculate(payload, current, tables, supplied)
			if result.status == "HOLD" and str(result.reason).begins_with("protected_owner_observation_absent:"):
				var stage: String = result.failed_stage
				supplied[stage] = observe(stage, result.partial_snapshot, payload, tables)
				continue
			break
		check(result.status == "READY", row.id + " e2e READY with PC observations: " + str(result.status) + " " + str(result.get("reason")) + " @" + str(result.get("failed_stage")))
		if result.status == "READY":
			e2e_ready += 1
			check(canon(result.plan.state) == canon(unwire(row.expected.state)), row.id + " e2e final state == source")
			check(supplied.size() == 3, row.id + " all three handoffs supplied")
	# 3) Boundary rejection: HOLD observations are not accepted as source observations.
	var bad: Dictionary = HANDOFF.protected_qe({}, {})
	check(bad.state == "HOLD" and not bad.has("after"), "missing player → HOLD, no after")
	var first: Dictionary = unwire(probe.rows[1])
	var halted: Dictionary = flow.calculate(first.payload, first.current, tables, {"protected_qe": bad})
	check(halted.status == "HOLD" and halted.failed_stage == "protected_qe", "flow keeps HOLD on HOLD handoff")
	# 4) Resource restore writer on the actual Main.
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for i in 8: await physics_frame
	main.process_mode = Node.PROCESS_MODE_DISABLED
	var authority: Node = main.source_resources
	var state: Node = main.source_state
	var player: Node = main.player
	var values := {"hp": 900.0, "mhp": 800.0, "st": 120.0, "mst": 333.0, "mp": 44.0, "mmp": 210.0, "stR": 0.31, "mpR": 0.07}
	var snap := func() -> Dictionary:
		var p: Dictionary = state.read_current_p()
		return {"hp": player.hp, "mhp": player.max_hp, "st": player.stamina, "mst": player.max_stamina,
			"res": authority.read_current_resource_parameters()["values"].duplicate(true), "p_hp": p.hp, "p_mp": p.mp}
	var before0: Dictionary = snap.call()
	var stranger := Node.new()
	check(authority.commit_native_restore_resources(stranger, values).accepted == false, "foreign owner rejected")
	var missing := values.duplicate(); missing.erase("mpR")
	check(authority.commit_native_restore_resources(main, missing).reason == "restore_resources_field_set_mismatch", "partial field set rejected")
	var nan := values.duplicate(); nan["mmp"] = NAN
	check(authority.commit_native_restore_resources(main, nan).reason == "restore_resources_value_invalid:mmp", "NaN rejected")
	var extra := values.duplicate(); extra.erase("stR"); extra["shield"] = 1.0
	check(authority.commit_native_restore_resources(main, extra).accepted == false, "unknown field rejected")
	check(canon(snap.call()) == canon(before0), "rejections keep every previous value")
	stranger.free()
	var regen_commits_before: int = authority.get_snapshot().commit_count
	var ok: Dictionary = authority.commit_native_restore_resources(main, values)
	check(ok.accepted == true, "restore commit accepted: " + str(ok.get("reason")))
	check(canon(ok.before) != canon(ok.after), "before/after readback returned")
	var p: Dictionary = state.read_current_p()
	check(player.hp == 900.0 and player.max_hp == 800.0 and p.hp == 900.0 and p.mhp == 800.0, "HP/mhp raw restore (no clamp, original dbRestore)")
	check(p.st == 120.0 and p.mst == 333.0 and p.mp == 44.0 and p.mmp == 210.0 and is_equal_approx(p.stR, 0.31) and is_equal_approx(p.mpR, 0.07), "ST/MP/rates restored through actual owners")
	check(authority.get_snapshot().commit_count == regen_commits_before, "not a regeneration commit (regen counter unchanged)")
	print("PCRH_RESULT ", JSON.stringify({"assertions": checks, "failures": failures, "oracle_rows": probe.rows.size(),
		"direct_observations": direct, "e2e_rows": e2e_rows, "e2e_ready": e2e_ready}))
	main.queue_free()
	for i in 12: await process_frame
	await create_timer(0.2).timeout
	quit(1 if failures > 0 else 0)
