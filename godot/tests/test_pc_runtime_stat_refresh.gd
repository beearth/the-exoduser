extends SceneTree
## PC-RUNTIME-STATS — runtime applyStats refresh on the actual booted Main.
## Oracle: tests/pc_runtime_stat_refresh_oracle.mjs runs the original game.html
## applyStats/recalcSt/_refreshEquipmentStats bodies per case (UTF-8 files).
const USERDIR = "EXODUSER-pc-runtime-stats-Isolated-20261021"
const REFRESH = preload("res://scripts/native_source_player_runtime_stat_refresh.gd")
const FIELDS = ["hp", "mhp", "st", "mst", "mp", "mmp", "shield", "mshield", "hpR", "stR", "mpR", "speed",
	"_oocSpeed", "baseDef", "baseAtk", "maxPoise", "poise", "poiseR", "_effStats", "_crystalStats"]
var checks := 0
var failures := 0
var main: Node
var state: Node
var resources: Node
var player: Node
var cases: Array = []
var port_rows: Array = []
var reentry: Array = []
var level_refresh: Array = []

func _initialize() -> void: call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCRS_FAIL ", label)

func argument(name: String) -> String:
	for value in OS.get_cmdline_user_args():
		if value.begins_with(name + "="): return value.substr(name.length() + 1)
	return ""

func p() -> Dictionary: return state.read_current_p()

func set_currents(hp: float, st: float, mp: float, shield: float) -> void:
	# Harness-only damage setup on the actual owners (same style as DEMO11-20 harness).
	player.hp = hp
	player.stamina = st
	resources.get("_owned")["mp"] = mp
	state.get("_p")["shield"] = shield

func capture_case(name: String, mode: String) -> Dictionary:
	var current: Dictionary = p().duplicate(true)
	var signed: Variant = main.source_initialization_services.read_native_signed_difficulty()
	var diff_value: float = float(signed.get("value", 0)) if signed is Dictionary else float(signed)
	var grit_container: Variant = main.source_providers.get_provider_bundle()["raw_grit"]
	var grit: Variant = grit_container.read_raw().get("raw") if is_instance_valid(grit_container) else null
	return {"name": name, "mode": mode, "P": current, "G": state.read_current_g().duplicate(true),
		"STATS": state.read_current_stats().duplicate(true), "PASSIVES": state.read_current_passives().duplicate(true),
		"INV": {"equipped": state.read_current_inventory()["equipped"].duplicate(true)}, "grit": grit, "diff": diff_value + 5.0}

func refresh_case(name: String, mode: String) -> Dictionary:
	cases.append(capture_case(name, mode))
	var receipt: Dictionary = main.request_native_runtime_stat_refresh(mode, "pcrs:" + name)
	check(receipt.get("status") == "READY" and receipt.get("committed") == true, name + " committed: " + str(receipt.get("reason")))
	port_rows.append(receipt.get("after", {}).duplicate(true))
	return receipt

func same_value(a: Variant, b: Variant) -> bool:
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size(): return false
		for key in a:
			if not b.has(key) or not same_value(a[key], b[key]): return false
		return true
	if (a is int or a is float) and (b is int or b is float):
		return absf(float(a) - float(b)) <= 1e-9 * maxf(1.0, absf(float(b)))
	return a == b

func snapshot_actual() -> Dictionary:
	var out: Dictionary = {}
	var current: Dictionary = p()
	for field in FIELDS:
		if current.has(field): out[field] = current[field].duplicate(true) if current[field] is Dictionary else current[field]
	out["_player_max_hp"] = player.max_hp
	out["_player_hp"] = player.hp
	out["_player_base_def"] = player.base_def
	out["_player_move"] = player.get("_movement_speed")
	out["_player_max_poise"] = player.max_poise
	out["_res"] = resources.read_current_resource_parameters()["values"].duplicate(true)
	return out

func _on_refreshed(receipt: Dictionary) -> void:
	# Observer sees committed data; nested refresh is rejected while the pass owner is busy.
	reentry.append({"receipt_serial": receipt.get("pass_serial"),
		"nested": main.request_native_runtime_stat_refresh("apply_stats", "nested_from_signal")})

func _on_level_up(_packet: Dictionary) -> void:
	# DEMO11-19 order proof: inside the actual State addExp window (after level loop),
	# the runtime applyStats owner is callable synchronously (no lock conflict).
	level_refresh.append(main.request_native_runtime_stat_refresh("apply_stats", "level_up_window"))

func _run() -> void:
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated userdir")
	if failures > 0: quit(1); return
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for i in 8: await physics_frame
	main.process_mode = Node.PROCESS_MODE_DISABLED
	state = main.source_state
	resources = main.source_resources
	player = main.player
	check(state.is_native_new_run_state_ready() and resources.is_native_source_resources_ready(), "actual Main booted")
	# Initialization single-use guard is unchanged.
	var again: Dictionary = main.source_initialization.initialize_new_run()
	check(again.get("status") == "NOT_READY" and again.get("reason") == "not_configured_or_initialization_already_attempted", "init dispatcher still single-use")
	check(not is_instance_valid(main.source_runtime_stat_refresh), "refresh owner is lazy (no boot change)")
	for slot in state.read_current_inventory()["equipped"]:
		var item: Variant = state.read_current_inventory()["equipped"][slot]
		if item is Dictionary and item.get("crystals") is Array:
			for c in item["crystals"]: check(c == null, "starter crystal sockets empty (oracle has no CRYSTAL_DEFS): " + slot)

	# S0 baseline (idempotent original applyStats on the booted state).
	var r0 := refresh_case("S0_baseline", "apply_stats")
	var module: RefCounted = main.source_runtime_stat_refresh
	check(is_instance_valid(module) and module.get_script() == REFRESH, "Main-owned refresh module")
	check(r0.get("cache_invalidations") == 1, "apply_stats: recalcSt invalidation only (1)")
	module.native_runtime_stats_refreshed.connect(_on_refreshed)

	# S1 stat increase while damaged: maxima rise, currents untouched (no free refill).
	set_currents(100.0, 50.0, 30.0, 10.0)
	var stats: Dictionary = state.read_current_stats()
	var base_stats: Dictionary = stats.duplicate(true)
	stats["str"] = int(stats["str"]) + 20
	stats["dex"] = int(stats["dex"]) + 20
	stats["int"] = int(stats["int"]) + 20
	var b1 := snapshot_actual()
	var r1 := refresh_case("S1_stat_increase_damaged", "apply_stats")
	var a1 := snapshot_actual()
	check(a1.mhp > b1.mhp and a1.mst > b1.mst and a1.mmp > b1.mmp and a1.mshield > b1.mshield, "S1 maxima increased")
	check(a1.hp == 100.0 and a1._res.st == 50.0 and a1._res.mp == 30.0 and a1.shield == 10.0, "S1 no free refill (hp/st/mp/shield kept)")
	check(r1.get("free_refill") == false, "S1 receipt free_refill=false")
	check(a1.stR > b1.stR and a1.mpR > b1.mpR and a1.hpR > b1.hpR, "S1 regen parameters reflected")
	check(a1.speed > b1.speed and absf(float(a1._player_move) - float(a1.speed) * 60.0) < 1e-6, "S1 speed reflected on actor movement")
	check(a1._res.stR == a1.stR and a1._res.mpR == a1.mpR, "S1 resource authority readback = P")
	check(reentry.size() == 1 and reentry[0].nested.get("status") == "REJECTED" \
		and reentry[0].nested.get("reason") == "runtime_stat_refresh_reentrant", "S1 nested refresh from signal rejected")

	# S2 stat decrease at full resources: currents clamped to the new maxima.
	set_currents(player.max_hp, player.max_stamina, float(resources.read_current_resource_parameters()["values"]["mmp"]), float(p()["mshield"]))
	for key in base_stats: stats[key] = base_stats[key]
	var b2 := snapshot_actual()
	refresh_case("S2_stat_decrease_full", "apply_stats")
	var a2 := snapshot_actual()
	check(a2.mhp < b2.mhp and a2.hp == a2.mhp and a2._res.st == a2._res.mst and a2._res.mp == a2._res.mmp and a2.shield == a2.mshield, "S2 currents clamped to lower maxima")
	check(a2.hp < b2.hp, "S2 hp actually reduced by clamp")

	# S3 equipment transaction (harness moves one item) + equipment refresh.
	var equipped: Dictionary = state.read_current_inventory()["equipped"]
	var slot_name := ""
	for slot in ["gloves", "pants", "boots", "bracelet", "necklace", "armor", "belt", "ring1"]:
		if equipped.get(slot) is Dictionary: slot_name = slot; break
	check(not slot_name.is_empty(), "starter equipment slot present")
	var item: Dictionary = equipped[slot_name]
	item["bonusHp"] = float(item.get("bonusHp", 0)) + 40.0
	item["bonusMp"] = float(item.get("bonusMp", 0)) + 30.0
	item["bonusShield"] = float(item.get("bonusShield", 0)) + 25.0
	if not item.get("affixes") is Array: item["affixes"] = []
	(item["affixes"] as Array).append({"id": "maxSTFlat", "value": 15, "tier": 1})
	(item["affixes"] as Array).append({"id": "movSpeed", "value": 0.1, "tier": 1})
	set_currents(player.max_hp - 5.0, player.max_stamina - 5.0, 20.0, 1.0)
	var b3 := snapshot_actual()
	var r3 := refresh_case("S3_equipment_bonus_on", "equipment_refresh")
	var a3 := snapshot_actual()
	check(r3.get("cache_invalidations") == 2, "equipment: G16289 + recalcSt invalidations (2)")
	check(a3.mhp == b3.mhp + 40.0 or a3.mhp > b3.mhp, "S3 stale affix/eqStat caches not used (mhp rises)")
	check(a3.hp == b3.hp and a3._res.st == b3._res.st and a3._res.mp == b3._res.mp and a3.shield == b3.shield, "S3 equipment: no free refill")
	equipped[slot_name] = null
	set_currents(player.max_hp, player.max_stamina, float(resources.read_current_resource_parameters()["values"]["mmp"]), float(p()["mshield"]))
	var b3b := snapshot_actual()
	refresh_case("S3_unequip_full", "equipment_refresh")
	var a3b := snapshot_actual()
	check(a3b.mhp < b3b.mhp and a3b.hp == a3b.mhp and a3b._res.mp == a3b._res.mmp and a3b.shield == a3b.mshield, "S3 unequip clamps min(new max, old)")
	equipped[slot_name] = item
	refresh_case("S3_reequip", "equipment_refresh")

	# S4 original quirk: fortify/vital intermediate clamps differ between modes.
	var passives: Dictionary = state.read_current_passives()
	passives["pFortify"] = 1
	passives["pVital"] = 1
	refresh_case("S4_fortify_on", "apply_stats")
	set_currents(player.max_hp, player.max_stamina, float(resources.read_current_resource_parameters()["values"]["mmp"]), float(p()["mshield"]))
	var b4 := snapshot_actual()
	refresh_case("S4_fortify_full_apply_stats", "apply_stats")
	var a4 := snapshot_actual()
	check(a4.hp == b4.mhp - 300.0 and a4.mhp == b4.mhp, "S4 apply_stats keeps original pre-fortify hp clamp (-300)")
	set_currents(player.max_hp, player.max_stamina, float(resources.read_current_resource_parameters()["values"]["mmp"]), float(p()["mshield"]))
	refresh_case("S4_fortify_full_equipment", "equipment_refresh")
	var a4e := snapshot_actual()
	check(a4e.hp == a4e.mhp and a4e._res.mp == a4e._res.mmp, "S4 equipment refresh restores min(new max, old)")
	passives["pFortify"] = 0
	passives["pVital"] = 0
	refresh_case("S4_fortify_off", "apply_stats")

	# S5 early failure (health initial plan): no partial commit.
	var reentry_before := reentry.size()
	var before5 := snapshot_actual()
	var keep_str: Variant = stats["str"]
	stats["str"] = "bad"
	var r5: Dictionary = main.request_native_runtime_stat_refresh("apply_stats", "fail_early")
	stats["str"] = keep_str
	check(r5.get("status") == "NOT_READY" and r5.get("committed") == false and str(r5.get("reason")).begins_with("health_initial_capture_not_ready"), "S5 early failure reason: " + str(r5.get("reason")))
	check(same_value(snapshot_actual(), before5) and r5.get("unchanged") == true, "S5 no mutation")

	# S6 late failure (shield stage after ~20 staged writes): no partial commit.
	var stats_for_late: Dictionary = state.read_current_stats()
	stats_for_late["str"] = int(stats_for_late["str"]) + 7 # would change mhp/baseAtk if it leaked
	var keep_shield: Variant = p()["shield"]
	state.get("_p")["shield"] = "x"
	var before6 := snapshot_actual()
	var r6: Dictionary = main.request_native_runtime_stat_refresh("equipment_refresh", "fail_late")
	check(r6.get("status") == "NOT_READY" and r6.get("committed") == false, "S6 late failure rejected: " + str(r6.get("reason")))
	check(str(r6.get("reason")).contains("shield"), "S6 failure names the shield stage")
	check(same_value(snapshot_actual(), before6), "S6 no partial commit (actor/resources/P unchanged)")
	state.get("_p")["shield"] = keep_shield
	stats_for_late["str"] = int(stats_for_late["str"]) - 7
	check(reentry.size() == reentry_before, "failures emit no committed signal")

	# S7 owner/identity rejection and direct sink protection.
	var stranger := Node.new()
	var foreign: Dictionary = module.refresh(stranger, "apply_stats", "foreign")
	check(foreign.get("status") == "REJECTED" and foreign.get("reason") == "runtime_stat_refresh_foreign_owner", "S7 foreign owner rejected")
	var bad_mode: Dictionary = main.request_native_runtime_stat_refresh("bogus", "bad")
	check(bad_mode.get("status") == "REJECTED" and str(bad_mode.get("reason")).begins_with("runtime_stat_refresh_unknown_mode"), "S7 unknown mode rejected")
	var second: RefCounted = REFRESH.new()
	check(second.configure(main).get("reason") == "runtime_stat_refresh_not_Main_registered", "S7 second unregistered owner rejected")
	var real_state: Node = main.source_state
	main.source_state = stranger
	var swapped: Dictionary = module.refresh(main, "apply_stats", "swapped")
	main.source_state = real_state
	check(swapped.get("status") == "REJECTED" and swapped.get("reason") == "runtime_stat_refresh_Main_identity_changed", "S7 swapped State rejected")
	var before7 := snapshot_actual()
	check(player.commit_native_runtime_stat_refresh(main, module, {"hp": 1.0}).get("accepted") == false, "S7 Player sink closed outside commit window")
	check(resources.commit_native_runtime_stat_refresh(main, module, {"mp": 1.0}).get("accepted") == false, "S7 resource sink closed outside commit window")
	check(state.commit_native_runtime_stat_refresh(main, module, {"shield": 0.0}).get("accepted") == false, "S7 State sink closed outside commit window")
	check(state.commit_native_runtime_stat_refresh(main, second, {"shield": 0.0}).get("accepted") == false, "S7 State sink rejects unregistered module")
	check(player.commit_native_runtime_stat_refresh(stranger, module, {"hp": 1.0}).get("accepted") == false, "S7 Player sink rejects foreign owner")
	check(same_value(snapshot_actual(), before7), "S7 rejected sinks unchanged")
	stranger.free()

	# S8 DEMO11-19 order compatibility: refresh inside the actual addExp level window.
	state.native_level_up_handoff.connect(_on_level_up)
	var p8: Dictionary = p()
	var add: Dictionary = state.apply_native_add_exp(main, int(p8["maxExp"]) - int(p8["exp"]))
	state.native_level_up_handoff.disconnect(_on_level_up)
	check(add.get("applied") == true and add.get("levels", 0) >= 1, "S8 actual level up")
	check(level_refresh.size() == 1 and level_refresh[0].get("status") == "READY", "S8 refresh callable inside addExp window")

	# Cost of one refresh call (UI/level-up event path, not the tick path).
	var t0 := Time.get_ticks_usec()
	var timed_ok := 0
	for i in 20:
		if main.request_native_runtime_stat_refresh("equipment_refresh", "timing").get("committed") == true: timed_ok += 1
	var refresh_ms := float(Time.get_ticks_usec() - t0) / 1000.0 / 20.0
	check(timed_ok == 20, "20 repeated refreshes committed (repeatable entry)")

	# Oracle comparison: every READY case against original JS bodies.
	var cases_path := ProjectSettings.globalize_path("user://pcrs-cases.json")
	var out_path := ProjectSettings.globalize_path("user://pcrs-oracle.json")
	var file := FileAccess.open(cases_path, FileAccess.WRITE)
	file.store_string(JSON.stringify(cases)); file.close()
	var node := argument("--node-bin")
	var source := argument("--source-game")
	if source.is_empty(): source = ProjectSettings.globalize_path("res://../game.html")
	check(not node.is_empty(), "explicit node binary")
	var exit_code := OS.execute(node, PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_runtime_stat_refresh_oracle.mjs"),
		"--source-game=" + source, "--cases-file=" + cases_path, "--out-file=" + out_path]), [], true)
	check(exit_code == 0, "oracle exit 0")
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(out_path))
	check(oracle is Dictionary and oracle.get("rows", []).size() == cases.size(), "oracle rows complete")
	var compared := 0
	if oracle is Dictionary:
		for i in cases.size():
			var row: Dictionary = oracle.rows[i]
			check(row.get("error") == null, cases[i].name + " oracle no throw: " + str(row.get("error")))
			for field in FIELDS:
				if not row.p.has(field): continue
				compared += 1
				check(same_value(port_rows[i].get(field), row.p[field]), "%s %s port=%s original=%s" % [cases[i].name, field, str(port_rows[i].get(field)), str(row.p[field])])
	var artifacts := argument("--artifacts-dir")
	var summary := {"assertions": checks, "failures": failures, "oracle_cases": cases.size(), "oracle_fields_compared": compared,
		"oracle_slice_sha256": oracle.get("slice_sha256") if oracle is Dictionary else null,
		"source_functions": oracle.get("source_functions") if oracle is Dictionary else null,
		"refresh_snapshot": main.read_native_runtime_stat_refresh_snapshot().duplicate(true)}
	summary["refresh_snapshot"].erase("last_receipt")
	if not artifacts.is_empty():
		var f := FileAccess.open(artifacts.path_join("pc_runtime_stat_refresh_summary.json"), FileAccess.WRITE)
		if f != null: f.store_string(JSON.stringify(summary, "  ")); f.close()
	summary["refresh_ms_avg"] = refresh_ms
	if not artifacts.is_empty():
		var f2 := FileAccess.open(artifacts.path_join("pc_runtime_stat_refresh_summary.json"), FileAccess.WRITE)
		if f2 != null: f2.store_string(JSON.stringify(summary, "  ")); f2.close()
	print("PCRS_RESULT ", JSON.stringify({"assertions": checks, "failures": failures, "oracle_cases": cases.size(), "oracle_fields_compared": compared, "refresh_ms_avg": refresh_ms}))
	main.queue_free()
	for i in 12: await process_frame
	await create_timer(0.2).timeout
	quit(1 if failures > 0 else 0)
