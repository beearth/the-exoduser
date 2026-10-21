extends SceneTree
## PC-SOURCE-PERF 보충 — direct hurtE (Main.request_native_hurte) and the
## twelve normal-enemy provider callbacks, timed on the actual booted Main.
## Run with `--map11=off` (legacy enemies). Non-lethal hits (dmg 1) on one
## eligible enemy whose HP is restored between calls; one lethal sample.
const USERDIR := "EXODUSER-pc-source-perf-Isolated-20261021"
const HURTE := preload("res://scripts/native_normal_enemy_hurte.gd")
const PASS_PATH := "res://scripts/native_source_validation_pass.gd"
var main: Node
var serial := 0

func _initialize() -> void: call_deferred("_run")

func eligible() -> Array:
	var out: Array = []
	for e in main.world.get_enemies():
		if is_instance_valid(e) and e.get("alive") == true and e.has_method("read_native_normal_enemy_hurte_fields") \
				and not e.has_method("accept_native_hurte_owner_binding"):
			var f: Dictionary = e.read_native_normal_enemy_hurte_fields(main.world)
			if f.get("ready") == true and f.get("ib") != true and int(f.get("etype")) not in HURTE.SPECIAL_HIT_ETYPES \
					and int(f.get("etype")) not in [8, 15, 29] and int(f.get("el")) != 1:
				out.append(e)
	return out

func pass_counters() -> Array:
	if not ResourceLoader.exists(PASS_PATH): return [-1, -1]
	var p: Script = load(PASS_PATH)
	return [p.evaluations, p.hits]

func stats(v: Array) -> Dictionary:
	if v.is_empty(): return {}
	var o: Array = v.duplicate(); o.sort()
	var s := 0.0
	for x in v: s += float(x)
	return {"n": v.size(), "mean_ms": s / v.size() / 1000.0, "p50_ms": float(o[int(v.size() * .5)]) / 1000.0,
		"max_ms": float(o[-1]) / 1000.0}

func hurte(e: Node, dmg: int) -> Dictionary:
	serial += 1
	return main.request_native_hurte(e, dmg, 0.0, true, {}, 0, {"token": "pcsp:%d" % serial})

func _run() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR: quit(2); return
	main = load("res://scenes/main.tscn").instantiate(); root.add_child(main)
	for i in range(30): await physics_frame
	main.player.iframes = 1000000.0
	var targets := eligible()
	var result := {"label": "", "eligible": targets.size(), "has_pass": ResourceLoader.exists(PASS_PATH)}
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--label="): result.label = a.trim_prefix("--label=")
	# 12 provider callbacks, 200 calls each.
	var callbacks: Dictionary = main.source_initialization_services.get_normal_enemy_damage_provider_callbacks(main)
	var provider_rows := {}
	for name in callbacks:
		var cb: Callable = callbacks[name]
		var args: Array = []
		match name:
			"eq_affix": args = ["critRate"]
			"u_eq", "l_eq": args = ["atk"]
			"el_mul": args = [0, 0]
		var t: Array = []
		var c0 := pass_counters()
		for i in range(200):
			var s := Time.get_ticks_usec(); cb.callv(args); t.append(Time.get_ticks_usec() - s)
		var c1 := pass_counters()
		var row := stats(t)
		row["validations_per_call"] = float(c1[0] - c0[0]) / 200.0
		row["memo_hits_per_call"] = float(c1[1] - c0[1]) / 200.0
		provider_rows[name] = row
	result.providers = provider_rows
	# Direct non-lethal hurtE x60 on one target (HP restored each time).
	if not targets.is_empty():
		var e: Node = targets[0]
		var hp0: float = float(e.get("hp"))
		var t: Array = []
		var statuses := {}
		var c0 := pass_counters()
		for i in range(60):
			e.set("hp", hp0)
			var s := Time.get_ticks_usec(); var r := hurte(e, 1); t.append(Time.get_ticks_usec() - s)
			statuses[str(r.get("status")) + ":" + str(r.get("reason"))] = statuses.get(str(r.get("status")) + ":" + str(r.get("reason")), 0) + 1
		var c1 := pass_counters()
		e.set("hp", hp0)
		result.hurte_nonlethal = stats(t)
		result.hurte_nonlethal.validations_per_call = float(c1[0] - c0[0]) / 60.0
		result.hurte_nonlethal.memo_hits_per_call = float(c1[1] - c0[1]) / 60.0
		result.hurte_nonlethal_status = statuses
		# One lethal sample per remaining eligible target (max 3).
		var lethal: Array = []
		var lstatus := {}
		for k in range(1, mini(4, targets.size())):
			var le: Node = targets[k]
			var c2 := pass_counters()
			var s := Time.get_ticks_usec(); var r := hurte(le, int(float(le.get("hp")) + 100000.0)); lethal.append(Time.get_ticks_usec() - s)
			var c3 := pass_counters()
			lstatus[str(k)] = {"status": r.get("status"), "reason": r.get("reason"), "killed": r.get("kill_receipt", {}).get("killed"),
				"validations": c3[0] - c2[0], "memo_hits": c3[1] - c2[1]}
		result.hurte_lethal = stats(lethal)
		result.hurte_lethal_rows = lstatus
	print("PCSP_HURTE_RESULT ", JSON.stringify(result))
	main.free()
	await process_frame
	quit(0)
