extends SceneTree
## PCI-01 — 플레이어 생명주기(request_native_player_life_transition) on the actual booted Main.
## Oracle: tests/pc_player_life_oracle.mjs runs the original die()/_fallenResolve()/retry/lobby
## source (UTF-8 files). 실제 Player/자원/State owner readback과 원본 P 결과를 대조한다.
const USERDIR = "EXODUSER-pc-life-pack-Isolated-20261021"
const LIFE = preload("res://scripts/native_source_player_life.gd")
var checks := 0
var failures := 0
var main: Node
var state: Node
var resources: Node
var player: Node
var life: RefCounted
var serial := 0
var phase_events: Array = []
var reentry: Array = []
var oracle_cases: Array = []
var port_rows: Array = []

func _initialize() -> void: call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCPL_FAIL ", label)

func argument(name: String) -> String:
	for value in OS.get_cmdline_user_args():
		if value.begins_with(name + "="): return value.substr(name.length() + 1)
	return ""

func p() -> Dictionary: return state.read_current_p()
func mmp() -> float: return float(resources.read_current_resource_parameters()["values"]["mmp"])
func mp() -> float: return float(resources.read_current_resource_parameters()["values"]["mp"])

func req(op: String, token: Variant, extra: Dictionary = {}) -> Dictionary:
	serial += 1
	var r: Dictionary = {"op": op, "request_id": "pcpl:%d" % serial, "player": player, "death_token": token}
	r.merge(extra, true)
	return main.request_native_player_life_transition(r)

func actual() -> Dictionary:
	var cur: Dictionary = p()
	return {"hp": player.hp, "st": player.stamina, "mp": mp(), "shield": cur.get("shield"), "state": player.state,
		"iframes": player.iframes, "exp": cur.get("exp"), "_reviveOnceUsed": cur.get("_reviveOnceUsed"),
		"_demonRevCd": cur.get("_demonRevCd"), "_fallenAng": cur.get("_fallenAng"),
		"burns": player.get_native_burn_snapshot().size(), "freeze": player.get_native_freeze_slow_ticks(),
		"kb": player.get("_knockback")}

func same(a: Dictionary, b: Dictionary) -> bool:
	for k in a:
		if not b.has(k) or str(a[k]) != str(b[k]): return false
	return a.size() == b.size()

func kill_player() -> void:
	# 실제 hurtP 경로(receive_damage) 반복 — 한방캡(33%) 때문에 여러 번.
	for i in 12:
		if player.hp <= 0.0: break
		player.iframes = 0.0
		player.receive_damage(int(player.max_hp))

func oracle_p() -> Dictionary:
	var cur: Dictionary = p()
	var out := {"hp": cur.hp, "mhp": cur.mhp, "st": cur.st, "mst": cur.mst, "mp": cur.mp, "mmp": cur.mmp,
		"shield": cur.get("shield", 0), "mshield": cur.get("mshield", 0), "exp": cur.get("exp", 0), "s": cur.s,
		"iframes": cur.iframes, "facing": cur.facing, "lv": cur.get("lv", 1), "st2": 0, "kb": {"x": 0, "y": 0}}
	for k in ["_reviveOnceUsed", "_demonRevCd"]:
		if cur.has(k): out[k] = cur[k]
	return out

func add_case(name: String, op: String, before: Dictionary, extra: Dictionary, port: Dictionary) -> void:
	var c := {"name": name, "op": op, "P": before}
	c.merge(extra, true)
	oracle_cases.append(c)
	port_rows.append(port)

func _on_phase(snapshot: Dictionary) -> void:
	phase_events.append(snapshot.duplicate(true))
	if reentry.is_empty() and snapshot.get("phase") == "fallen":
		reentry.append(req("final_death", snapshot.get("death_token"), {"roll_receipt": {"can_revive": false, "roll": 1, "chance": 0}}))

func set_revive_once_affix(on: bool) -> void:
	var weapon: Dictionary = state.read_current_inventory()["equipped"]["weapon"]
	var affixes: Array = weapon.get("affixes", [])
	if on:
		affixes.append({"id": "reviveOnce", "value": 1})
	else:
		for i in range(affixes.size() - 1, -1, -1):
			if affixes[i] is Dictionary and affixes[i].get("id") == "reviveOnce": affixes.remove_at(i)
	weapon["affixes"] = affixes
	main.source_providers.get_provider_bundle()["affix"].invalidate_affix_cache()

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
	life = main.source_player_life
	check(is_instance_valid(life) and life.get_script() == LIFE, "Main-owned life module configured at boot")
	var ph: Dictionary = main.read_native_player_life_phase()
	check(ph.phase == "alive" and ph.death_token == "" and ph.clear_blocked == false, "S0 alive/no token/clear open")
	main.native_player_life_phase_changed.connect(_on_phase)

	# S1 alive: token-required ops are no-mutation rejects; lobby is SOURCE_RETURN.
	var b0 := actual()
	var r: Dictionary = req("fallen_enter", "nope")
	check(r.status == "REJECTED" and r.reason == "death_token_mismatch" and same(b0, actual()), "S1 fallen before HP0 rejected unchanged")
	r = req("lobby_prepare", null)
	check(r.status == "SOURCE_RETURN" and r.accepted == true and same(b0, actual()), "S1 lobby alive = SOURCE_RETURN, no writes")
	r = main.request_native_player_life_transition({"op": "fallen_enter", "player": player, "death_token": ""})
	check(r.status == "REJECTED" and r.reason == "player_life_request_id_required", "S1 request_id required")
	r = main.request_native_player_life_transition({"op": "teleport", "request_id": "x1", "player": player})
	check(r.status == "REJECTED" and str(r.reason).begins_with("player_life_unknown_op"), "S1 unknown op rejected")
	# sink outside the commit window
	var direct: Dictionary = player.commit_native_player_life(main, life, {"iframes": 120.0})
	check(direct.get("accepted") == false and direct.get("reason") == "player_life_not_in_commit_window", "S1 player sink outside window rejected")
	var direct2: Dictionary = resources.commit_native_player_life_resources(main, life, {"hp": 1.0})
	check(direct2.get("accepted") == false, "S1 resource sink outside window rejected")
	var direct3: Dictionary = state.commit_native_player_life_p(main, life, {"exp": 0})
	check(direct3.get("accepted") == false, "S1 state sink outside window rejected")
	check(same(b0, actual()), "S1 all rejects unchanged")

	# S2 HP0 via actual hurtP → token issued, terminal dead preserved.
	player.apply_native_burn(400.0)
	kill_player()
	ph = main.read_native_player_life_phase()
	var token1: String = ph.death_token
	check(player.hp == 0.0 and player.state == "dead", "S2 existing HP0 block unchanged (dead)")
	check(ph.phase == "hp0" and token1.begins_with("pdeath:") and ph.clear_blocked == true, "S2 PC death_token issued at HP0")
	check(ph.pre_death_state in ["stagger", "pStun", "idle"], "S2 pre-death hurtP state captured: " + str(ph.pre_death_state))
	player.telemetry_event.emit("player_died", {})
	check(main.read_native_player_life_phase().death_token == token1 and main.read_native_player_life_phase().duplicate_hp0 == 1, "S2 duplicate HP0 event: no new token")

	# S3 reviveOnce not equipped → revive_once rejected; foreign actor rejected; fallen_enter applies.
	var b3 := actual()
	r = req("revive_once", token1)
	check(r.status == "REJECTED" and r.reason == "revive_once_not_eligible" and same(b3, actual()), "S3 revive_once w/o affix rejected unchanged")
	r = main.request_native_player_life_transition({"op": "fallen_enter", "request_id": "foreign", "player": main.world, "death_token": token1})
	check(r.status == "REJECTED" and r.reason == "player_life_foreign_actor" and same(b3, actual()), "S3 foreign actor rejected")
	r = life.request(main.world, {"op": "fallen_enter", "request_id": "foreign2", "player": player, "death_token": token1})
	check(r.status == "REJECTED" and r.reason == "player_life_foreign_owner", "S3 foreign owner rejected")
	var ob: Dictionary = oracle_p()
	ob["s"] = ph.pre_death_state # source die() runs while P.s is the hurtP state
	var fallen_id := "pcpl:fallen1"
	r = main.request_native_player_life_transition({"op": "fallen_enter", "request_id": fallen_id, "player": player, "death_token": token1})
	var a3 := actual()
	check(r.status == "APPLIED" and r.life_phase == "fallen", "S3 fallen_enter APPLIED: " + str(r.get("reason")))
	check(a3.state == "fallen" and a3.iframes == 9999.0 and a3.hp == 0.0, "S3 fallen state/iframes9999/hp0")
	check(absf(float(a3._fallenAng) - (player.facing.angle() + PI)) < 1e-9, "S3 _fallenAng=facing+PI")
	check(r.rng_span.consumed == 0, "S3 PC consumed no RNG")
	check(main.read_native_player_life_phase().clear_blocked == true, "S3 clear blocked while fallen")
	add_case("die_fallen", "die", ob, {"affix": {}, "random": [0.1, 0.5]}, a3)
	# reentry from the phase signal was rejected (handler fired inside the commit)
	check(reentry.size() == 1 and reentry[0].status == "REJECTED" and reentry[0].reason == "player_life_reentrant", "S3 reentrant request from signal rejected")
	# duplicate request_id → previous receipt only
	var dup: Dictionary = main.request_native_player_life_transition({"op": "fallen_enter", "request_id": fallen_id, "player": player, "death_token": token1})
	check(dup.replayed == true and dup.status == "APPLIED" and same(a3, actual()), "S3 duplicate request_id replays receipt, no re-run")
	r = req("fallen_enter", token1)
	check(r.status == "REJECTED" and r.reason == "player_life_requires_hp0_phase" and same(a3, actual()), "S3 second fallen_enter rejected")
	# damage during fallen is ignored by existing gates
	player.receive_damage(50)
	check(same(a3, actual()), "S3 fallen invulnerable (existing gates)")

	# S4 roll contract: wrong branch rejected.
	r = req("revive_resolve", token1, {"roll_receipt": {"can_revive": true, "roll": 50.0, "chance": 3.0, "cd_frames": 36000}})
	check(r.status == "REJECTED" and r.reason == "revive_roll_not_success" and same(a3, actual()), "S4 revive with failing roll rejected")
	r = req("final_death", token1, {"roll_receipt": {"can_revive": true, "roll": 1.0, "chance": 3.0}})
	check(r.status == "REJECTED" and r.reason == "revive_roll_success_requires_revive_resolve" and same(a3, actual()), "S4 final_death with success roll rejected")
	r = req("revive_resolve", token1, {})
	check(r.status == "REJECTED" and r.reason == "roll_receipt_required", "S4 roll receipt required")

	# S5 demon revive success (G43849–43856): full hp/mp/st, idle, iframes120, cd, shield NOT refilled.
	state.get("_p")["shield"] = 3.0
	var ob5: Dictionary = oracle_p()
	ob5["_fallenCanRevive"] = true; ob5["_fallenRevRoll"] = 1.0; ob5["_fallenRevChance"] = 3.0; ob5["_fallenRevCdFrames"] = 36000
	r = req("revive_resolve", token1, {"roll_receipt": {"can_revive": true, "roll": 1.0, "chance": 3.0, "cd_frames": 36000}})
	var a5 := actual()
	check(r.status == "APPLIED" and r.life_phase == "alive", "S5 revive_resolve APPLIED: " + str(r.get("reason")))
	check(a5.hp == player.max_hp and a5.st == player.max_stamina and a5.mp == mmp(), "S5 hp/st/mp full")
	check(a5.state == "idle" and a5.iframes == 120.0 and float(a5._demonRevCd) == 36000.0, "S5 idle/iframes120/_demonRevCd")
	check(float(a5.shield) == 3.0, "S5 shield not refilled on battle revive")
	check(a5.burns == 1, "S5 burn stacks retained (source die/resolve keep DOT)")
	ph = main.read_native_player_life_phase()
	check(ph.phase == "alive" and ph.death_token == "" and ph.clear_blocked == false, "S5 phase alive, clear unblocked")
	add_case("resolve_success", "resolve", ob5, {}, a5)
	r = req("final_death", token1, {"roll_receipt": {"can_revive": false, "roll": 1, "chance": 0}})
	check(r.status == "REJECTED" and r.reason == "death_token_stale" and same(a5, actual()), "S5 retired token rejected as stale")

	# S6 second death → new token → fallen → final death.
	kill_player()
	var token2: String = main.read_native_player_life_phase().death_token
	check(token2 != token1 and token2.begins_with("pdeath:"), "S6 new token per HP0")
	r = req("fallen_enter", token2)
	check(r.status == "APPLIED", "S6 fallen")
	var ob6: Dictionary = oracle_p()
	ob6["_fallenCanRevive"] = false; ob6["_fallenRevRoll"] = 50.0; ob6["_fallenRevChance"] = 0
	r = req("final_death", token2, {"roll_receipt": {"can_revive": false, "roll": 50.0, "chance": 0.0}})
	var a6 := actual()
	check(r.status == "APPLIED" and r.life_phase == "dead" and a6.state == "dead" and a6.iframes == 0.0, "S6 final_death dead/iframes0")
	check(main.read_native_player_life_phase().clear_blocked == true, "S6 clear blocked while dead")
	add_case("resolve_fail", "resolve", ob6, {}, a6)

	# S7 respawn: reset before exp_loss rejected; exp loss; apply_stats failure rolls back; reset.
	r = req("respawn", token2, {"step": "reset"})
	check(r.status == "REJECTED" and r.reason == "respawn_reset_requires_exp_loss_first" and same(a6, actual()), "S7 reset before exp_loss rejected")
	state.get("_p")["exp"] = 1234
	var ob7: Dictionary = oracle_p()
	ob7["burnT"] = 30; ob7["_freezeSlow"] = 5; ob7["_rbBurn"] = [1]; ob7["skills"] = {}
	r = req("respawn", token2, {"step": "exp_loss"})
	check(r.status == "APPLIED" and int(p().exp) == 864 and r.life_phase == "respawning", "S7 exp 1234→864 (~~(1234*.3)=370)")
	var stats: Dictionary = state.read_current_stats()
	var saved_str: Variant = stats["str"]
	stats["str"] = "bad"
	var b7 := actual()
	r = req("respawn", token2, {"step": "reset"})
	check(r.status == "FAILED" and str(r.reason).begins_with("respawn_apply_stats_failed") and same(b7, actual()), "S7 applyStats failure → reset rolled back unchanged: " + str(r.get("reason")))
	check(main.read_native_player_life_phase().phase == "respawning", "S7 phase kept after failure")
	stats["str"] = saved_str
	player.get("_knockback")
	r = req("respawn", token2, {"step": "reset"})
	var a7 := actual()
	check(r.status == "APPLIED" and r.life_phase == "alive" and r.apply_stats.status == "READY", "S7 respawn reset APPLIED with applyStats: " + str(r.get("reason")))
	check(a7.hp == player.max_hp and a7.st == player.max_stamina and a7.mp == mmp() and float(a7.shield) == float(p().mshield), "S7 full hp/st/mp/shield")
	check(a7.state == "idle" and a7.iframes == 300.0 and a7.kb == Vector2.ZERO, "S7 idle/iframes300/kb0")
	check(a7.burns == 0 and a7.freeze == 0.0, "S7 DOT/slow cleared (_refillRespawnResources)")
	add_case("retry", "retry", ob7, {}, a7)

	# S8 reviveOnce priority: with affix, fallen_enter rejected; revive_once applies (P.s kept).
	set_revive_once_affix(true)
	kill_player()
	var token3: String = main.read_native_player_life_phase().death_token
	var pre: String = str(main.read_native_player_life_phase().pre_death_state)
	var b8 := actual()
	r = req("fallen_enter", token3)
	check(r.status == "REJECTED" and r.reason == "revive_once_priority:G43727" and same(b8, actual()), "S8 reviveOnce has priority over fallen")
	var ob8: Dictionary = oracle_p()
	ob8["s"] = pre
	r = req("revive_once", token3)
	var a8 := actual()
	check(r.status == "APPLIED" and a8.hp == player.max_hp and a8.mp == mmp() and a8.st == player.max_stamina, "S8 revive_once full resources")
	check(a8.iframes == 120.0 and a8._reviveOnceUsed == true and a8.state == pre, "S8 iframes120/_reviveOnceUsed/state kept as hurtP state")
	add_case("die_revive_once", "die", ob8, {"affix": {"reviveOnce": 1}}, a8)
	kill_player()
	var token4: String = main.read_native_player_life_phase().death_token
	r = req("revive_once", token4)
	check(r.status == "REJECTED" and r.reason == "revive_once_not_eligible", "S8 reviveOnce used once only")
	r = req("fallen_enter", token4)
	check(r.status == "APPLIED", "S8 after used → fallen allowed")
	set_revive_once_affix(false)

	# S9 lobby_prepare from fallen-with-HP0 → full/idle, terminal.
	var ob9: Dictionary = oracle_p()
	r = req("lobby_prepare", token4)
	var a9 := actual()
	check(r.status == "APPLIED" and a9.hp == player.max_hp and a9.state == "idle" and float(a9.shield) == float(p().mshield), "S9 lobby_prepare restores hp/st/mp/shield/idle")
	check(a9.iframes == 9999.0, "S9 lobby leaves iframes (source does not touch)")
	add_case("lobby", "lobby", ob9, {}, a9)
	r = req("respawn", token4, {"step": "exp_loss"})
	check(r.status == "REJECTED" and r.reason == "player_life_lobby_terminal", "S9 lobby terminal")

	# Oracle comparison
	var compared := 0
	var oracle: Variant = null
	var cases_path := ProjectSettings.globalize_path("user://pcpl-cases.json")
	var out_path := ProjectSettings.globalize_path("user://pcpl-oracle.json")
	var cf := FileAccess.open(cases_path, FileAccess.WRITE)
	cf.store_string(JSON.stringify(oracle_cases))
	cf.close()
	var node := argument("--node-bin")
	var source := argument("--source-game")
	check(not node.is_empty() and not source.is_empty(), "explicit node/source")
	var code := OS.execute(node, PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_player_life_oracle.mjs"),
		"--source-game=" + source, "--cases-file=" + cases_path, "--out-file=" + out_path]), [], true)
	check(code == 0, "oracle exit 0")
	oracle = JSON.parse_string(FileAccess.get_file_as_string(out_path))
	check(oracle is Dictionary and oracle.rows.size() == oracle_cases.size(), "oracle rows complete")
	if oracle is Dictionary:
		for i in oracle.rows.size():
			var row: Dictionary = oracle.rows[i]
			var port: Dictionary = port_rows[i]
			var op: String = row.op
			var o: Dictionary = row.p
			var pairs: Array = [["hp", "hp"], ["st", "st"], ["mp", "mp"], ["s", "state"], ["iframes", "iframes"]]
			if row.name != "resolve_success": pairs.append(["shield", "shield"])
			if row.name == "die_revive_once": pairs.append(["_reviveOnceUsed", "_reviveOnceUsed"])
			if row.name == "resolve_success": pairs.append(["_demonRevCd", "_demonRevCd"])
			if row.name == "die_fallen": pairs.append(["_fallenAng", "_fallenAng"])
			if row.name == "retry": pairs.append(["exp", "exp"])
			for pair in pairs:
				var ov: Variant = o.get(pair[0])
				var pv: Variant = port.get(pair[1])
				var ok: bool = str(ov) == str(pv) or ((ov is float or ov is int) and (pv is float or pv is int) and absf(float(ov) - float(pv)) < 1e-6)
				check(ok, "%s oracle %s: source=%s port=%s (err=%s)" % [row.name, pair[0], str(ov), str(pv), str(row.error)])
				compared += 1
			if row.name == "resolve_success":
				check(float(o.get("shield")) == float(ob5.shield), "resolve_success oracle shield unchanged by source")
				compared += 1
			if row.name == "die_fallen":
				check(float(o.get("st2")) == 300.0, "die_fallen oracle st2=300 (Mac countdown value)")
				compared += 1
	var artifacts := argument("--artifacts-dir")
	var summary := {"assertions": checks, "failures": failures, "oracle_cases": oracle_cases.size(), "oracle_fields_compared": compared,
		"oracle_slice_sha256": oracle.get("slice_sha256") if oracle is Dictionary else null,
		"source_sha256": oracle.get("source_sha256") if oracle is Dictionary else null,
		"source_functions": oracle.get("source_functions") if oracle is Dictionary else null,
		"oracle_errors": oracle.rows.map(func(x): return x.error) if oracle is Dictionary else null,
		"phase_events": phase_events.size(), "history": life.get_history()}
	if not artifacts.is_empty():
		var f := FileAccess.open(artifacts.path_join("pc_player_life_summary.json"), FileAccess.WRITE)
		f.store_string(JSON.stringify(summary, "  "))
		f.close()
	print("PCPL_RESULT ", JSON.stringify({"assertions": checks, "failures": failures, "oracle_fields_compared": compared}))
	main.queue_free()
	await process_frame
	quit(1 if failures > 0 else 0)
