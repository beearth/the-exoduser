extends SceneTree
## PC-BOSS-CORE — native_ch1_boss_misc_states.gd / native_ch1_boss_queues.gd vs 원본 VM oracle.
## 소환(mkEn)은 oracle 도 RNG 미소비 stub(소환체 생성기 미이식 — 계약 §9 차이 기록).
const MISC = preload("res://scripts/native_ch1_boss_misc_states.gd")
const QUEUES = preload("res://scripts/native_ch1_boss_queues.gd")
const USERDIR := "EXODUSER-pc-boss-core-Isolated-20261022"
var assertions := 0
var failures := 0
var fail_samples: Array = []

class Fixture extends Node:
	var trace: Array = []
	var rng_q: Array = []
	var can_q: Array = []
	var pwin_q: Array = []
	var p: Dictionary = {}
	var armor_el := 0
	var g_lists: Dictionary = {}
	func rng(_tag: String) -> float:
		var u: float = rng_q.pop_front() if not rng_q.is_empty() else 0.5
		trace.append(["rng", u])
		return u
	# misc_* (core owner)
	func misc_present(cmd: String, args: Array, _line: int) -> void: trace.append(["present", cmd, args])
	func misc_g_write(fields: Dictionary) -> void:
		for k in fields: trace.append(["g", k, fields[k]])
	func misc_text(x: Variant, y: Variant, text: String, col: String, life: Variant) -> void: trace.append(["text", x, y, text, col, life])
	func misc_L(ko: String, _en: String) -> String: return ko
	func misc_hurt(e: Dictionary, pp: Dictionary, dmg: int, opts: Dictionary, _line: int) -> Dictionary:
		trace.append(["hurtP", dmg, {"dtype": str(opts.get("dtype", "")), "druidPoison": opts.get("druidPoison") == true}])
		return {"e": e, "p": p}
	func misc_kb_add(_pp: Dictionary, kx: float, ky: float) -> Dictionary:
		p.kb.x = float(p.kb.x) + kx
		p.kb.y = float(p.kb.y) + ky
		return p
	func misc_is_p_win() -> bool: return pwin_q.pop_front() if not pwin_q.is_empty() else false
	func misc_parry(bank: int) -> void:
		p.parryBank = float(p.get("parryBank", 0)) + bank
		trace.append(["parry", p.parryBank])
	func misc_poise_hit(e: Dictionary, amount: int) -> Dictionary:
		trace.append(["poiseHit", amount])
		return e
	func misc_spawn_projectile(_e: Dictionary, props: Dictionary, _line: int) -> void: trace.append(["spawn", props])
	func misc_spawn_mine(_e: Dictionary, props: Dictionary) -> void: trace.append(["spawn", props])
	func misc_append_queue(name: String, item: Dictionary) -> void: trace.append(["append", name, item])
	func misc_summon_unported(x: float, y: float, et: int, el: int) -> void: trace.append(["summon", x, y, et, el])
	func pf_can_move(x: float, y: float, r: float) -> bool:
		var v: bool = can_q.pop_front() if not can_q.is_empty() else true
		trace.append(["canMv", x, y, r, v])
		return v
	# q_* (queue env)
	func q_player() -> Dictionary: return p
	func q_hurt(dmg: int, opts: Dictionary) -> void: trace.append(["hurtP", dmg, {"dtype": str(opts.get("dtype", "")), "druidPoison": opts.get("druidPoison") == true}])
	func q_kb_add(kx: float, ky: float) -> void:
		p.kb.x = float(p.kb.x) + kx
		p.kb.y = float(p.kb.y) + ky
	func q_is_p_win() -> bool: return misc_is_p_win()
	func q_parry(bank: int, _in: float) -> void: misc_parry(bank)
	func q_rng(tag: String, _line: int) -> float: return rng(tag)
	func q_present(cmd: String, args: Array, _line: int) -> void: trace.append(["present", cmd, args])
	func q_text(x: Variant, y: Variant, text: String, col: String, life: Variant) -> void: trace.append(["text", x, y, text, col, life])
	func q_shake(n: float) -> void: trace.append(["shake", n])
	func q_shake_set(n: float) -> void: trace.append(["g", "shake", n * 100.0 / 100.0])
	func q_tr(t: String) -> String: return t
	func q_status(field: String, value: Variant) -> void:
		if field == "poison+": p.poison = float(p.get("poison", 0)) + float(value)
		elif field == "_webSlow>=": p._webSlow = maxf(float(p.get("_webSlow", 0)), float(value))
	func q_el_mul(a: int) -> float: return QUEUES.el_mul(a, armor_el)

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		if fail_samples.size() < 30: fail_samples.append(label)

func _initialize() -> void:
	create_timer(170.0).timeout.connect(func(): print("PCBOSS_STATES_WATCHDOG"); quit(2))
	call_deferred("_run")

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR), "isolation_userdir")
	var cases := _make_cases()
	var dir := ProjectSettings.globalize_path("user://")
	var in_path := dir.path_join("pc_boss_states_cases.json")
	var out_path := dir.path_join("pc_boss_states_oracle.json")
	var f := FileAccess.open(in_path, FileAccess.WRITE)
	f.store_string(JSON.stringify({"cases": _enc(cases)}))
	f.close()
	var output: Array = []
	var code := OS.execute(_arg("node-bin", "C:/nvm4w/nodejs/node.exe"), PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_boss_core_states_oracle.cjs"),
		"--cases-file=" + in_path, "--out-file=" + out_path]), output, true)
	check(code == 0, "oracle_exit:" + str(output))
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(out_path))
	if not oracle is Dictionary:
		print("PCBOSS_STATES_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "oracle": "missing", "output": output}))
		quit(1)
		return
	var by_id := {}
	for r in oracle.results:
		var d: Dictionary = _dec(r)
		by_id[int(d.id)] = d
	var stats := {"misc": 0, "queue": 0, "mine": 0, "hurt": 0, "spawn": 0, "rng": 0}
	for c in cases:
		var fx := Fixture.new()
		fx.rng_q = (c.env.get("rng", []) as Array).duplicate()
		fx.can_q = (c.env.get("canMv", []) as Array).duplicate()
		fx.pwin_q = (c.env.get("pwin", []) as Array).duplicate()
		fx.armor_el = int(c.env.get("armorEl", 0))
		fx.p = c.p.duplicate(true)
		var exp: Dictionary = by_id.get(int(c.id), {})
		check(not exp.has("error"), "oracle_error:%d:%s" % [c.id, str(exp.get("error")).left(200)])
		var g_out := {}
		if c.mode == "misc":
			stats.misc += 1
			var ctx := {"pc_core": fx, "shake": 100.0, "vfx_available": true}
			var started: Dictionary = MISC.begin_tick(0, c.e, c.sp, fx.p, ctx)
			var packet: Dictionary = MISC.next_tick(started.continuation, null, Callable(fx, "rng"))
			check(packet.status == "READY", "misc_ready:%d:%s" % [c.id, packet.get("reason")])
			_cmp(packet.enemy, exp.enemy, "enemy:%d" % c.id)
		elif c.mode == "queue":
			stats.queue += 1
			var upd: Dictionary = QUEUES.tick(c.g, c.sp, fx, 0)
			var merged: Dictionary = c.g.duplicate(true)
			for k in upd: merged[k] = upd[k]
			var lava: Variant = QUEUES.tick_lava(merged, c.sp, fx)
			if lava is Array: merged["_lavaPools"] = lava
			g_out = merged
			_cmp(g_out, exp.g, "g:%d" % c.id)
		else:
			stats.mine += 1
			var kept: Array = QUEUES.tick_mines(c.mines, c.sp, fx)
			_cmp(kept, exp.mines, "mines:%d" % c.id)
		var pa: Dictionary = fx.p.duplicate(true)
		var pb: Dictionary = exp.player.duplicate(true)
		_cmp(pa, pb, "player:%d" % c.id)
		var et: Array = exp.trace
		check(fx.trace.size() == et.size(), "trace_len:%d %d vs %d" % [c.id, fx.trace.size(), et.size()])
		for i in range(mini(fx.trace.size(), et.size())):
			_cmp(fx.trace[i], et[i], "trace:%d[%d]" % [c.id, i])
			match str(fx.trace[i][0]):
				"hurtP": stats.hurt += 1
				"spawn": stats.spawn += 1
				"rng": stats.rng += 1
		fx.free()
	print("PCBOSS_STATES_FAILS ", JSON.stringify(fail_samples))
	print("PCBOSS_STATES_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "cases": cases.size(), "stats": stats}))
	quit(1 if failures else 0)

func _make_cases() -> Array:
	var rng := RandomNumberGenerator.new()
	rng.seed = 2026102202
	var out: Array = []
	var id := 0
	var states := ["bossShockWind", "bossShock", "bossSummonWind", "bossSpinWind", "bossSpin", "bossMineWind", "bossPoisonDash"]
	for k in range(280):
		var s: String = states[k % states.size()]
		var e := {"ib": true, "etype": 0, "alive": true, "x": 4000.0 + rng.randf_range(-100, 100), "y": 4000.0 + rng.randf_range(-100, 100), "r": 44,
			"atk": [46, 69, 219][k % 3], "el": 0, "col": "#bbbbbb", "s": s, "st2": [5.0, 0.0, -0.5, 8.0, 12.0, 7.6][rng.randi() % 6], "_bossPhase": rng.randi_range(0, 4),
			"room": 0, "shockR": rng.randf_range(0, 300), "shockMax": 1000.0, "_spinAng": rng.randf_range(0, 6), "_ptAng": rng.randf_range(-PI, PI), "_ptT": rng.randf_range(0, 9)}
		var dist: float = [30.0, 150.0, 260.0, 480.0, 700.0][rng.randi() % 5]
		var a: float = rng.randf_range(0, TAU)
		if s == "bossShock": dist = float(e.shockR) + rng.randf_range(-25, 25)
		var p := {"x": float(e.x) + cos(a) * dist, "y": float(e.y) + sin(a) * dist, "r": 15.0, "iframes": [0.0, 0.0, 3.0][rng.randi() % 3],
			"s": ["idle", "idle", "charge"][rng.randi() % 3], "kb": {"x": 0.0, "y": 0.0}, "parryBank": 0.0}
		var env := {"rng": [], "canMv": [rng.randf() < 0.7], "pwin": [rng.randf() < 0.3]}
		for i in range(40): env.rng.append(rng.randf())
		out.append({"id": id, "mode": "misc", "e": e, "p": p, "sp": [1.0, 0.5, 2.0][rng.randi() % 3], "env": env, "g": {"_poisonPools": []}})
		id += 1
	for k in range(160):
		var cx := 4000.0
		var cy := 4000.0
		var p := {"x": cx + rng.randf_range(-400, 400), "y": cy + rng.randf_range(-400, 400), "r": 15.0, "iframes": [0.0, 0.0, 2.0][rng.randi() % 3],
			"s": ["idle", "charge", "idle"][rng.randi() % 3], "kb": {"x": 0.0, "y": 0.0}, "parryBank": 0.0}
		var g := {}
		if k % 2 == 0: g["_chaseAoes"] = [{"src": {"actor_ref": "boss"}, "cnt": rng.randi_range(0, 10), "maxCnt": 10, "t": rng.randf_range(50, 61), "interval": 60, "r": 450, "delay": 90, "dmg": 92, "el": 0, "druid": rng.randf() < 0.5,
			"zones": [{"x": p.x + rng.randf_range(-300, 300), "y": p.y, "r": 450, "t": rng.randf_range(85, 92), "delay": 90, "dmg": 92, "el": 0, "hit": rng.randf() < 0.3, "explT": rng.randf_range(0, 16), "druid": true}]}]
		if k % 3 == 0: g["_fissures"] = [{"x": cx, "y": cy, "ang": rng.randf_range(-PI, PI), "spd": 20, "len": rng.randf_range(0, 900), "maxLen": 900.0, "w": 140, "t": rng.randf_range(0, 141), "maxT": 140, "dmg": 92, "el": 0, "explR": 270.0, "exploded": false, "druid": true}]
		if k % 4 == 0: g["_tideWaves"] = [{"x": cx, "y": cy, "r": rng.randf_range(0, 500), "maxR": 1750, "spd": 15, "t": rng.randf_range(0, 120), "maxT": 120, "gapAng": rng.randf_range(-PI, PI), "gapSize": 0.8, "w": 60, "dmg": 69, "el": 0, "hitT": rng.randf_range(-1, 10)}]
		if k % 5 == 0: g["_seekerMines"] = [{"_druidMine": rng.randf() < 0.7, "x": p.x + rng.randf_range(-60, 60), "y": p.y + rng.randf_range(-60, 60), "vx": 1.0, "vy": 0.0, "spd": 1, "t": rng.randf_range(0, 400), "armT": 60, "maxT": 360, "r": 60, "dmg": 92, "el": 3, "hp": 1}]
		if k % 2 == 1: g["_poisonPools"] = [{"x": p.x + rng.randf_range(-200, 200), "y": p.y, "t": rng.randf_range(0, 241), "maxT": 240, "r": 175, "dmg": 13, "el": 0, "tickT": rng.randf_range(55, 61)}]
		if k % 3 == 1: g["_lavaPools"] = [{"x": p.x + rng.randf_range(-200, 200), "y": p.y, "t": rng.randf_range(50, 300), "warnT": 55, "maxT": 300, "r": 150, "dmg": 41, "el": 0, "tickT": rng.randf_range(25, 31)}]
		var env := {"rng": [], "pwin": [rng.randf() < 0.3, rng.randf() < 0.3], "armorEl": [0, 0, 4][rng.randi() % 3]}
		for i in range(80): env.rng.append(rng.randf())
		out.append({"id": id, "mode": "queue", "p": p, "g": g, "sp": [1.0, 0.5, 2.0][rng.randi() % 3], "env": env})
		id += 1
	for k in range(60):
		var p := {"x": 4000.0 + rng.randf_range(-40, 40), "y": 4000.0 + rng.randf_range(-40, 40), "r": 15.0, "iframes": [0.0, 2.0][rng.randi() % 2], "s": ["idle", "charge"][rng.randi() % 2], "kb": {"x": 0.0, "y": 0.0}}
		var mines: Array = []
		for i in range(rng.randi_range(1, 4)):
			mines.append({"x": 4000.0 + rng.randf_range(-50, 50), "y": 4000.0 + rng.randf_range(-50, 50), "vx": 0, "vy": 0, "dmg": 73, "el": 0, "friendly": false, "life": rng.randf_range(-1, 3), "ml": 180, "col": "#66dd22", "sz": 5, "mine": true, "_druidPoison": true})
		out.append({"id": id, "mode": "mine", "p": p, "mines": mines, "sp": [1.0, 2.0][rng.randi() % 2], "env": {"armorEl": 0}, "g": {}})
		id += 1
	return out

func _close(a: Variant, b: Variant) -> bool:
	if (a is float or a is int) and (b is float or b is int):
		var x := float(a)
		var y := float(b)
		if x == y: return true
		return absf(x - y) <= 1e-9 * maxf(1.0, maxf(absf(x), absf(y)))
	return a == b

func _cmp(a: Variant, b: Variant, label: String) -> void:
	if a is Dictionary and b is Dictionary:
		var keys := {}
		for k in a: keys[k] = true
		for k in b: keys[k] = true
		for k in keys: _cmp(a.get(k), b.get(k), label + "." + str(k))
		return
	if a is Array and b is Array:
		check(a.size() == b.size(), label + ":size %d vs %d" % [a.size(), b.size()])
		for i in range(mini(a.size(), b.size())): _cmp(a[i], b[i], label + "[" + str(i) + "]")
		return
	if a is bool or b is bool:
		check(a == b, label + " %s vs %s" % [a, b])
		return
	check(_close(a, b), label + " %s vs %s" % [a, b])

static func _bits(v: float) -> String:
	var b := PackedByteArray()
	b.resize(8)
	b.encode_double(0, v)
	return b.hex_encode()

func _enc(v: Variant) -> Variant:
	if v is float or v is int: return {"__f64": _bits(float(v))}
	if v is Array:
		var a: Array = []
		for x in v: a.append(_enc(x))
		return a
	if v is Dictionary:
		var d := {}
		for k in v: d[k] = _enc(v[k])
		return d
	return v

func _dec(v: Variant) -> Variant:
	if v is Dictionary:
		if v.has("__f64"): return String(v.__f64).hex_decode().decode_double(0)
		var d := {}
		for k in v: d[k] = _dec(v[k])
		return d
	if v is Array:
		var a: Array = []
		for x in v: a.append(_dec(x))
		return a
	return v
