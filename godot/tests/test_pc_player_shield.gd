extends SceneTree
## PC-PLAYER-SHIELD — 플레이어 에너지쉴드(hurtP G43544~43566 흡수 · update G32758~32762 리젠) on the actual booted Main.
## Oracle: tests/pc_player_shield_oracle.mjs runs the ORIGINAL hurtP()/die()/regen statement (UTF-8 files).
## 실제 Player 피해 경로(receive_damage = 직격 hurtP, _receive_native_burn_damage = 화상 DOT hurtP)와
## State P(shield/mshield/shieldRegenT) readback을 원본 결과와 대조한다.
const USERDIR = "EXODUSER-pc-player-shield-Isolated-20261023"
const SHIELD_COLOR = "#4488ff"
var checks := 0
var failures := 0
var main: Node
var state: Node
var player: Node
var cases: Array = []
var port_rows: Array = []
var last_damage: Dictionary = {}
var died := 0

func _initialize() -> void: call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCSH_FAIL ", label)

func argument(name: String) -> String:
	for value in OS.get_cmdline_user_args():
		if value.begins_with(name + "="): return value.substr(name.length() + 1)
	return ""

func p() -> Dictionary: return state.read_current_p()
func secs(s: float) -> void:
	await create_timer(s, true, false, true).timeout

func _on_telemetry(kind: String, data: Dictionary) -> void:
	if kind == "player_damage": last_damage = data.duplicate(true)
	elif kind == "player_died": died += 1

func text_adapter() -> Node: return main.world.get_node("NativeFloatingText")
func text_admitted() -> int: return int(text_adapter().get_snapshot().producer_counters.get("admitted", 0))
func particle_requests() -> int:
	return int(main.world.get_node("NativeProjectileHitEffects").get_snapshot().metrics.literal_particle_requests)

## 쉴드 색(#4488ff) 텍스트만 비교 대상 — '-a'(#ff3333)·'💥한방캡!' 등은 Godot 직격 경로에 원래 없다(범위 밖, 보고서 기록).
func new_texts(before_admitted: int) -> Array:
	var snap: Dictionary = text_adapter().get_snapshot()
	var n: int = int(snap.producer_counters.admitted) - before_admitted
	var out: Array = []
	var limit: int = int(snap.pool_limit)
	var producer: Node2D = text_adapter().get_node("OriginalFloatingTextRing")
	var py: float = producer.to_local(player.global_position).y
	for i in range(n):
		var slot: Dictionary = snap.pool[(int(snap.next_slot) - n + i + limit * 4) % limit]
		if str(slot.c) == SHIELD_COLOR:
			out.append({"dy": roundf(float(slot.y) - py), "t": str(slot.t), "col": str(slot.c), "life": float(slot.ml)})
	return out

func base_p(hp: float, shield: float, mshield: float, regen_t: float) -> Dictionary:
	var cur: Dictionary = p()
	return {"x": 0, "y": 0, "s": "idle", "iframes": 0, "hp": hp, "mhp": player.max_hp, "shield": shield, "mshield": mshield,
		"shieldRegenT": regen_t, "baseDef": player.base_def, "poise": 4, "kb": {"x": 0, "y": 0}, "lv": cur.get("lv", 1),
		"facing": 0, "skills": {}, "_sbParryT": 0}

func hit_case(name: String, hp: float, shield: float, mshield: float, regen_t: float, dmg: int, kind: String,
		base_def: float = 2.0, energy_def: float = 0.0, extra: Dictionary = {}) -> void:
	player.base_def = base_def
	player.energy_def = energy_def
	player.hp = hp
	player.iframes = 0.0
	player.state = "idle"
	player.poise = 4
	var cur: Dictionary = p()
	cur["mshield"] = mshield
	cur["shield"] = shield
	cur["shieldRegenT"] = regen_t
	var c: Dictionary = {"name": name, "op": "hit", "dmg": dmg, "P": base_p(hp, shield, mshield, regen_t), "energyDef": energy_def}
	match kind:
		"phys": c["opts"] = {"dtype": "phys"}
		"magic": c["opts"] = {"dtype": "magic"}
		"burn": c["opts"] = {"dot": true, "burn": true, "src": "화상"}
		"dot_shieldhit": c["opts"] = {"dot": true, "shieldHit": true, "src": "화상"}
	c.merge(extra, true)
	cases.append(c)
	var t0: int = text_admitted()
	var p0: int = particle_requests()
	var d0: int = died
	last_damage = {}
	if kind in ["burn", "dot_shieldhit"]:
		player._receive_native_burn_damage(dmg)
	else:
		player.receive_damage(dmg, kind)
	var after: Dictionary = p()
	port_rows.append({"hp": player.hp, "shield": after.get("shield"), "mshield": after.get("mshield"),
		"shieldRegenT": after.get("shieldRegenT"), "died": died - d0, "texts": new_texts(t0),
		"parts": particle_requests() - p0, "dmgTaken_a": last_damage.get("amount"),
		"shield_receipt": last_damage.get("shield", {})})

func regen_case(name: String, shield: float, mshield: float, regen_t: float, sps: Array, p_mregen: float) -> void:
	var cur: Dictionary = p()
	cur["mshield"] = mshield
	cur["shield"] = shield
	cur["shieldRegenT"] = regen_t
	var passives: Dictionary = state.read_current_passives()
	var saved_pm: Variant = passives.get("pMRegen")
	passives["pMRegen"] = p_mregen
	var stats: Dictionary = state.read_current_stats()
	cases.append({"name": name, "op": "regen", "sps": sps, "STATS": {"int": stats.get("int")},
		"PASSIVES": {"pMRegen": p_mregen}, "P": {"shield": shield, "mshield": mshield, "shieldRegenT": regen_t, "lv": cur.get("lv", 1)}})
	var trace: Array = []
	var ready_all := true
	for sp in sps:
		var r: Dictionary = state.advance_native_player_shield_regen(main, float(sp))
		ready_all = ready_all and r.get("ready") == true
		trace.append({"shield": p().get("shield"), "shieldRegenT": p().get("shieldRegenT")})
	passives["pMRegen"] = saved_pm
	port_rows.append({"shield": p().get("shield"), "shieldRegenT": p().get("shieldRegenT"), "trace": trace, "ready": ready_all})

func num_eq(a: Variant, b: Variant) -> bool:
	if (a is float or a is int) and (b is float or b is int):
		return absf(float(a) - float(b)) < 1e-9 * maxf(1.0, absf(float(a)))
	return str(a) == str(b)

func _run() -> void:
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated userdir")
	if failures > 0: quit(1); return
	# 실제 필드 진입(인트로 → 커튼 → G.on) — update()는 G.on일 때만 돈다(G32107 phase_g_on).
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main); current_scene = main
	for i in 10: await process_frame
	var seq: Node = main.get("source_intro_sequence")
	check(is_instance_valid(seq), "intro sequence present (G.on owner)")
	await secs(0.9)
	for k in 3:
		seq.advance_native_guide(); await secs(0.4)
	seq.finish_native_guide()
	var deadline := Time.get_ticks_msec() + 9000
	while Time.get_ticks_msec() < deadline and main.source_state.read_current_g().get("on") != true:
		await process_frame
	for i in 10: await physics_frame
	main.process_mode = Node.PROCESS_MODE_DISABLED
	state = main.source_state
	player = main.player
	player.telemetry_event.connect(_on_telemetry)
	check(state.read_current_g().get("on") == true, "field entered: G.on true")
	var boot: Dictionary = p()
	var mshield0: float = float(boot.get("mshield", 0))
	check(mshield0 > 0.0 and float(boot.get("shield", 0)) == mshield0, "boot P.shield=P.mshield>0 (applyStats G27963~27964 · initStage G31569)")
	var mhp: float = player.max_hp
	var keep_hp: float = player.hp

	# ── 흡수 사례 (원본 hurtP 대조) ──
	hit_case("full_block", mhp, mshield0, mshield0, 0.0, 40, "phys")
	hit_case("full_block_exact_minus1", mhp, 41.0, mshield0, 0.0, 40, "phys")
	hit_case("overflow_partial", mhp, 10.5, mshield0, 0.0, 100, "phys")
	hit_case("overflow_equal", mhp, 39.0, mshield0, 0.0, 40, "phys")
	hit_case("shield_zero", mhp, 0.0, mshield0, 77.0, 100, "phys")
	hit_case("mshield_zero", mhp, 50.0, 0.0, 0.0, 100, "phys")
	hit_case("dr_phys_def500", mhp, mshield0, mshield0, 0.0, 120, "phys", 500.0)
	hit_case("dr_magic_edef800", mhp, 30.0, mshield0, 0.0, 120, "magic", 2.0, 800.0)
	hit_case("hitcap_then_shield", mhp, mshield0, mshield0, 0.0, 5000, "phys")
	hit_case("lethal_but_shield", 20.0, mshield0, mshield0, 0.0, 5000, "phys")
	hit_case("dot_burn_shield", mhp, mshield0, mshield0, 0.0, 16, "burn")
	hit_case("dot_shieldHit_flag", mhp, mshield0, mshield0, 0.0, 16, "dot_shieldhit")
	hit_case("dot_burn_overflow", mhp, 3.0, mshield0, 0.0, 16, "burn")
	hit_case("dot_burn_no_shield", mhp, 0.0, mshield0, 0.0, 16, "burn")

	# ── 리젠 사례 (원본 update 문장 대조) ──
	var sps180: Array = []
	for i in 185: sps180.append(1.0)
	regen_case("regen_delay_180", 0.0, mshield0, 180.0, sps180, 0.0)
	var sps_pm: Array = []
	for i in 160: sps_pm.append(1.0)
	regen_case("regen_delay_pMRegen5", 0.0, mshield0, 180.0, sps_pm, 5.0)
	regen_case("regen_speed_mixed_sp", 0.0, mshield0, 0.0, [1.0, 1.0, 0.5, 2.0, 1.0, 0.35, 1.0], 0.0)
	regen_case("regen_speed_pMRegen10", 12.25, mshield0, 0.0, [1.0, 1.0, 1.0, 1.0], 10.0)
	regen_case("regen_clamp_full", mshield0 - 0.1, mshield0, 0.0, [1.0, 1.0, 1.0], 0.0)
	regen_case("regen_mshield_zero", 5.0, 0.0, 0.0, [1.0, 1.0], 0.0)
	regen_case("regen_negative_T_boundary", 0.0, mshield0, 0.4, [1.0, 1.0, 1.0], 0.0)

	# ── 배선: 실제 update clock 경로가 리젠을 부른다 (같은 Main 재가동 20프레임) ──
	player.hp = keep_hp
	player.state = "idle"
	var cur: Dictionary = p()
	cur["mshield"] = mshield0
	cur["shield"] = 10.0
	cur["shieldRegenT"] = 0.0
	var snap0: Dictionary = state.get_native_player_shield_snapshot()
	main.process_mode = Node.PROCESS_MODE_INHERIT
	for i in 20: await physics_frame
	main.process_mode = Node.PROCESS_MODE_DISABLED
	var snap1: Dictionary = state.get_native_player_shield_snapshot()
	var clock_snap: Dictionary = main.get_native_source_clock_input_snapshot()
	var upd: Dictionary = clock_snap.get("update_clock_result", {})
	print("PCSH_WIRE update=", upd.get("status"), " reason=", upd.get("reason"), " last=", str(upd.get("last", {})).left(300), " steps=", clock_snap.get("update_steps_last"))
	var ticks: int = int(snap1.regen_ticks) - int(snap0.regen_ticks)
	check(ticks > 0 and float(snap1.shield) > 10.0 and float(snap1.shield) <= mshield0, "update clock wire regenerates shield (ticks=%d shield=%s)" % [ticks, str(snap1.shield)])
	cur["shield"] = 10.0
	cur["shieldRegenT"] = 180.0
	main.process_mode = Node.PROCESS_MODE_INHERIT
	for i in 20: await physics_frame
	main.process_mode = Node.PROCESS_MODE_DISABLED
	var snap2: Dictionary = state.get_native_player_shield_snapshot()
	check(float(snap2.shield) == 10.0 and float(snap2.shieldRegenT) < 180.0 and float(snap2.shieldRegenT) > 0.0, "update clock wire: delay counts down, no regen (T=%s shield=%s)" % [str(snap2.shieldRegenT), str(snap2.shield)])

	# ── 사망 조건 (배선 확인 뒤 — HP0이 생명주기 토큰을 연다) ──
	hit_case("death_no_shield", 20.0, 0.0, mshield0, 0.0, 200, "phys")
	hit_case("death_overflow", 30.0, 5.0, mshield0, 0.0, 200, "phys")

	# ── oracle ──
	var cases_path := ProjectSettings.globalize_path("user://pcsh-cases.json")
	var out_path := ProjectSettings.globalize_path("user://pcsh-oracle.json")
	var cf := FileAccess.open(cases_path, FileAccess.WRITE)
	cf.store_string(JSON.stringify(cases))
	cf.close()
	var node := argument("--node-bin")
	var source := argument("--source-game")
	check(not node.is_empty() and not source.is_empty(), "explicit node/source")
	var code := OS.execute(node, PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_player_shield_oracle.mjs"),
		"--source-game=" + source, "--cases-file=" + cases_path, "--out-file=" + out_path]), [], true)
	check(code == 0, "oracle exit 0")
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(out_path))
	check(oracle is Dictionary and oracle.rows.size() == cases.size(), "oracle rows complete")
	var compared := 0
	var table: Array = []
	if oracle is Dictionary:
		for i in oracle.rows.size():
			var row: Dictionary = oracle.rows[i]
			var port: Dictionary = port_rows[i]
			var o: Dictionary = row.p
			check(row.error == null, "%s oracle error=%s" % [row.name, str(row.error)])
			if row.op == "hit":
				var died_src: int = int(row.die_calls)
				var pairs := [["hp", o.get("hp"), port.hp], ["shield", o.get("shield"), port.shield],
					["shieldRegenT", o.get("shieldRegenT"), port.shieldRegenT], ["died", died_src, port.died],
					["a(dmgTaken)", row.dmgTaken, port.dmgTaken_a], ["parts", row.parts, port.parts]]
				# 원본 die()는 P.hp=0으로 맞춘다 — Godot은 maxf(0,…) (같은 0).
				for pr in pairs:
					check(num_eq(pr[1], pr[2]), "%s %s: source=%s port=%s" % [row.name, pr[0], str(pr[1]), str(pr[2])])
					compared += 1
				var src_texts: Array = row.texts.filter(func(t): return str(t.col) == SHIELD_COLOR)
				check(JSON.stringify(src_texts) == JSON.stringify(port.texts), "%s shield texts: source=%s port=%s" % [row.name, JSON.stringify(src_texts), JSON.stringify(port.texts)])
				compared += 1
				table.append({"case": row.name, "src_hp": o.get("hp"), "port_hp": port.hp, "src_shield": o.get("shield"),
					"port_shield": port.shield, "src_T": o.get("shieldRegenT"), "port_T": port.shieldRegenT, "died": port.died,
					"texts": port.texts, "parts": port.parts})
			else:
				check(port.ready == true, "%s regen sink ready every tick" % row.name)
				check(row.trace.size() == port.trace.size(), "%s trace length" % row.name)
				var ok: bool = row.trace.size() == port.trace.size()
				for k in mini(row.trace.size(), port.trace.size()):
					if not num_eq(row.trace[k].shield, port.trace[k].shield) or not num_eq(row.trace[k].shieldRegenT, port.trace[k].shieldRegenT):
						ok = false
						print("PCSH_TRACE ", row.name, " k=", k, " src=", row.trace[k], " port=", port.trace[k])
						break
				check(ok, "%s regen trace every tick == source" % row.name)
				compared += row.trace.size() * 2
				table.append({"case": row.name, "src_last": row.trace[-1] if row.trace.size() > 0 else null,
					"port_last": port.trace[-1] if port.trace.size() > 0 else null, "ticks": port.trace.size()})
	# 원본 플레이어 hurtP: DOT 게이트 없음 → shieldHit 플래그 유무가 결과를 바꾸지 않는다.
	if oracle is Dictionary:
		var by: Dictionary = {}
		for row in oracle.rows: by[row.name] = row
		check(JSON.stringify(by.dot_burn_shield.p) == JSON.stringify(by.dot_shieldHit_flag.p), "source: player DOT absorbed with or without shieldHit")

	var artifacts := argument("--artifacts-dir")
	var summary := {"assertions": checks, "failures": failures, "oracle_cases": cases.size(), "oracle_fields_compared": compared,
		"oracle_slice_sha256": oracle.get("slice_sha256") if oracle is Dictionary else null,
		"source_sha256": oracle.get("source_sha256") if oracle is Dictionary else null,
		"source_functions": oracle.get("source_functions") if oracle is Dictionary else null,
		"mhp": mhp, "mshield": mshield0, "table": table, "wire": {"regen_ticks_20f": ticks, "shield_after": snap1.shield, "delay_after": snap2.shieldRegenT}}
	if not artifacts.is_empty():
		var f := FileAccess.open(artifacts.path_join("pc_player_shield_summary.json"), FileAccess.WRITE)
		f.store_string(JSON.stringify(summary, "  "))
		f.close()
	print("PCSH_RESULT ", JSON.stringify({"assertions": checks, "failures": failures, "oracle_fields_compared": compared}))
	main.queue_free()
	await process_frame
	quit(1 if failures > 0 else 0)
