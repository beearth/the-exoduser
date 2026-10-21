extends SceneTree
## PCI-12 — request_native_recalc_st(owner, ctx) on the actual booted Main.
## 원본 recalcSt() 단독(G16425–16431): 캐시 3종 무효화 → resource_parameters.run_recalc_st → ST/mST만.
## Oracle: tests/pc_recalc_st_oracle.mjs (원본 recalcSt 본문 VM, UTF-8 파일).
const USERDIR = "EXODUSER-pc-life-pack-Isolated-20261021"
var checks := 0
var failures := 0
var main: Node
var state: Node
var resources: Node
var player: Node
var cases: Array = []
var port_rows: Array = []

func _initialize() -> void: call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCRC_FAIL ", label)

func argument(name: String) -> String:
	for value in OS.get_cmdline_user_args():
		if value.begins_with(name + "="): return value.substr(name.length() + 1)
	return ""

func p() -> Dictionary: return state.read_current_p()

func snap() -> Dictionary:
	var cur: Dictionary = p()
	var res: Dictionary = resources.read_current_resource_parameters()["values"]
	return {"hp": player.hp, "mhp": player.max_hp, "st": player.stamina, "mst": player.max_stamina, "mp": res.mp,
		"mmp": res.mmp, "stR": res.stR, "mpR": res.mpR, "shield": cur.get("shield"), "mshield": cur.get("mshield"),
		"baseDef": cur.get("baseDef"), "speed": cur.get("speed"), "baseAtk": cur.get("baseAtk"), "hpR": cur.get("hpR")}

func capture_case(name: String) -> void:
	var signed: Variant = main.source_initialization_services.read_native_signed_difficulty()
	var diff_value: float = float(signed.get("value", 0)) if signed is Dictionary else float(signed)
	var grit_container: Variant = main.source_providers.get_provider_bundle()["raw_grit"]
	var grit: Variant = grit_container.read_raw().get("raw") if is_instance_valid(grit_container) else null
	cases.append({"name": name, "mode": "recalc_st", "P": p().duplicate(true), "G": state.read_current_g().duplicate(true),
		"STATS": state.read_current_stats().duplicate(true), "PASSIVES": state.read_current_passives().duplicate(true),
		"INV": {"equipped": state.read_current_inventory()["equipped"].duplicate(true)}, "grit": grit, "diff": diff_value + 5.0})

func recalc_case(name: String) -> Dictionary:
	capture_case(name)
	var r: Dictionary = main.request_native_recalc_st(main, {"reason": "pcrc:" + name})
	check(r.get("status") == "READY" and r.get("committed") == true, name + " committed: " + str(r.get("reason")))
	port_rows.append({"st": player.stamina, "mst": player.max_stamina})
	return r

func only_st_mst_changed(a: Dictionary, b: Dictionary) -> bool:
	for k in a:
		if k in ["st", "mst"]: continue
		if str(a[k]) != str(b[k]): return false
	return true

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

	# S0 baseline
	var b0 := snap()
	var r0 := recalc_case("S0_baseline")
	check(r0.get("mode") == "recalc_st" and r0.get("cache_invalidations") == 1, "S0 one recalcSt invalidation (3 caches)")
	check(r0.get("cache_targets") == ["_eqAffixCache", "_eqStatCache", "_lEqCache"], "S0 cache targets 3")
	var cf: Dictionary = r0.get("committed_fields", {})
	check(cf.get("actor", []).is_empty() and cf.get("state", []).is_empty() and cf.get("resources", []).size() == 2 \
		and "st" in cf.resources and "mst" in cf.resources, "S0 ST/mST commit only: " + str(cf))
	check(only_st_mst_changed(b0, snap()), "S0 no other field changed")
	check(r0.get("free_refill") == false, "S0 no refill")

	# S1 dex +10 at reduced st → mst +20, st kept (no refill)
	player.stamina = 50.0
	var stats: Dictionary = state.read_current_stats()
	var dex0: Variant = stats["dex"]
	stats["dex"] = int(dex0) + 10
	var b1 := snap()
	recalc_case("S1_dex_up")
	var a1 := snap()
	check(float(a1.mst) == float(b1.mst) + 20.0 and float(a1.st) == 50.0, "S1 mst+20, st kept 50")
	check(only_st_mst_changed(b1, a1), "S1 HP/MP/shield/regen unchanged (no applyStats, no clamp)")

	# S2 dex down with full st → st=min(st,mst)
	player.stamina = player.max_stamina
	stats["dex"] = int(dex0) - 5
	var b2 := snap()
	recalc_case("S2_dex_down_clamp")
	var a2 := snap()
	check(float(a2.mst) == float(b2.mst) - 30.0 and float(a2.st) == float(a2.mst), "S2 st=min(st,mst) (original clamp kept)")
	stats["dex"] = dex0
	recalc_case("S2b_dex_restored")

	# S3 stale affix cache: equipped affix maxSTFlat added without invalidation → recalc invalidates first
	var weapon: Dictionary = state.read_current_inventory()["equipped"]["weapon"]
	var affixes: Array = weapon.get("affixes", [])
	var bundle: Dictionary = main.source_providers.get_provider_bundle()
	bundle["affix"].eq_affix("maxSTFlat") # warm cache with current (absent) value
	affixes.append({"id": "maxSTFlat", "value": 15})
	weapon["affixes"] = affixes
	check(float(bundle["affix"].eq_affix("maxSTFlat").get("value", -1)) == 0.0, "S3 affix cache stale before recalc")
	var b3 := snap()
	recalc_case("S3_affix_cache_invalidated")
	var a3 := snap()
	check(float(a3.mst) == float(b3.mst) + 15.0, "S3 recalcSt invalidated affix cache (mst +15): %s→%s affix=%s" % [b3.mst, a3.mst, str(bundle["affix"].eq_affix("maxSTFlat"))])
	affixes.pop_back()
	weapon["affixes"] = affixes
	recalc_case("S3b_affix_removed")

	# S4 failure → no mutation (원본 표현 불가 입력: P._crystalStats가 객체 → producer NOT_READY)
	var saved_cr: Variant = p().get("_crystalStats")
	var bogus := RefCounted.new()
	state.get("_p")["_crystalStats"] = bogus
	var b4 := snap()
	var r4: Dictionary = main.request_native_recalc_st(main, {"reason": "bad"})
	var a4 := snap()
	check(r4.get("status") == "NOT_READY" and r4.get("committed") == false and str(b4) == str(a4), "S4 NOT_READY unchanged: %s %s" % [r4.get("status"), r4.get("reason")])
	state.get("_p")["_crystalStats"] = saved_cr
	# S4b 원본 JS 동작 보존: STATS.dex 문자열 → 100+NaN → ~~NaN=0 (READY, 원본과 같은 mst) — oracle 대조
	stats["dex"] = "bad"
	recalc_case("S4b_dex_string_js_nan")
	check(float(player.max_stamina) < 100.0, "S4b JS ~~NaN=0 semantics kept (mst=%s)" % player.max_stamina)
	stats["dex"] = dex0
	recalc_case("S4c_dex_restored")
	var r5: Dictionary = main.request_native_recalc_st(main.world, {})
	check(r5.get("status") == "REJECTED" and r5.get("reason") == "runtime_stat_refresh_foreign_owner", "S5 foreign owner rejected")
	# existing modes untouched
	var r6: Dictionary = main.request_native_runtime_stat_refresh("apply_stats", "pcrc:existing")
	check(r6.get("status") == "READY" and r6.get("cache_invalidations") == 1, "S6 apply_stats mode unchanged")

	# timing (event path)
	var t0 := Time.get_ticks_usec()
	for i in 20:
		main.request_native_recalc_st(main, {"reason": "bench"})
	var avg_ms := float(Time.get_ticks_usec() - t0) / 20000.0

	# Oracle
	var cases_path := ProjectSettings.globalize_path("user://pcrc-cases.json")
	var out_path := ProjectSettings.globalize_path("user://pcrc-oracle.json")
	var f := FileAccess.open(cases_path, FileAccess.WRITE)
	f.store_string(JSON.stringify(cases))
	f.close()
	var code := OS.execute(argument("--node-bin"), PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_recalc_st_oracle.mjs"),
		"--source-game=" + argument("--source-game"), "--cases-file=" + cases_path, "--out-file=" + out_path]), [], true)
	check(code == 0, "oracle exit 0")
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(out_path))
	var compared := 0
	if oracle is Dictionary:
		check(oracle.rows.size() == cases.size(), "oracle rows complete")
		for i in oracle.rows.size():
			var row: Dictionary = oracle.rows[i]
			check(row.error == null, row.name + " oracle no throw: " + str(row.error))
			for field in ["st", "mst"]:
				check(absf(float(row.p[field]) - float(port_rows[i][field])) < 1e-9, "%s oracle %s source=%s port=%s" % [row.name, field, str(row.p[field]), str(port_rows[i][field])])
				compared += 1
	print("PCRC_RESULT ", JSON.stringify({"assertions": checks, "failures": failures, "oracle_fields_compared": compared, "recalc_ms_avg": avg_ms}))
	main.queue_free()
	await process_frame
	quit(1 if failures > 0 else 0)
