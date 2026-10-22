extends SceneTree
## PC-BOSS-CORE — native_demo11_boss_death.gd(42515–42624 / 42641–42650 / 34493–34535) vs 원본 VM oracle.
const DEATH = preload("res://scripts/native_demo11_boss_death.gd")
const USERDIR := "EXODUSER-pc-boss-core-Isolated-20261022"
var assertions := 0
var failures := 0
var fail_samples: Array = []

class FixtureEnv extends RefCounted:
	var trace: Array = []
	var rng: Array = []
	var can: Array = []
	var safe: Variant = null
	var suppress := 0.0
	var p: Dictionary = {}
	func bd_affix(_id: String, _line: int) -> Variant: return suppress
	func bd_rng(_tag: String, line: int) -> Variant:
		var u: float = rng.pop_front() if not rng.is_empty() else 0.5
		trace.append(["rng", line, u])
		return u
	func bd_text(x: Variant, y: Variant, text: String, col: String, life: Variant) -> void: trace.append(["text", x, y, text, col, life])
	func bd_present(cmd: String, args: Array, _line: int) -> void: trace.append(["present", cmd, args])
	func bd_hurt_player(dmg: int, opts: Dictionary) -> void: trace.append(["hurtP", dmg, opts])
	func bd_kb_add(kx: float, ky: float) -> void:
		p.kb.x = float(p.kb.x) + kx
		p.kb.y = float(p.kb.y) + ky
	func bd_can_move(x: float, y: float, r: float) -> bool:
		var v: bool = can.pop_front() if not can.is_empty() else true
		trace.append(["canMv", x, y, r, v])
		return v
	func bd_safe_pt(x: float, y: float, r: float) -> Variant:
		trace.append(["safePt", x, y, r])
		return safe.duplicate() if safe is Dictionary else null
	func bd_spawn_proj(props: Dictionary) -> void: trace.append(["spawn", props])
	func bd_g_write(fields: Dictionary) -> void:
		for k in fields: trace.append(["g", k, fields[k]])
	func bd_tr(t: String) -> String: return t
	func bd_lang_ko() -> bool: return true
	func bd_player_full_hp() -> bool: return float(p.hp) >= float(p.mhp)
	func bd_player() -> Dictionary: return p
	func bd_killed_bosses() -> Array: return []

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		if fail_samples.size() < 30: fail_samples.append(label)

func _initialize() -> void:
	create_timer(170.0).timeout.connect(func(): print("PCBOSS_DEATH_WATCHDOG"); quit(2))
	call_deferred("_run")

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR), "isolation_userdir")
	var cases := _make_cases()
	var dir := ProjectSettings.globalize_path("user://")
	var in_path := dir.path_join("pc_boss_death_cases.json")
	var out_path := dir.path_join("pc_boss_death_oracle.json")
	var f := FileAccess.open(in_path, FileAccess.WRITE)
	f.store_string(JSON.stringify({"cases": _enc(cases)}))
	f.close()
	var output: Array = []
	var code := OS.execute(_arg("node-bin", "C:/nvm4w/nodejs/node.exe"), PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_boss_core_death_oracle.cjs"),
		"--cases-file=" + in_path, "--out-file=" + out_path]), output, true)
	check(code == 0, "oracle_exit:" + str(output))
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(out_path))
	if not oracle is Dictionary:
		print("PCBOSS_DEATH_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "oracle": "missing", "output": output}))
		quit(1)
		return
	check(oracle.get("sha256") == preload("res://source_snapshot/snapshot.gd").SHA256, "oracle_snapshot_sha")
	var by_id := {}
	for r in oracle.results:
		var d: Dictionary = _dec(r)
		by_id[int(d.id)] = d
	var stats := {"death": 0, "tick": 0, "revived": 0, "final": 0, "fallback_revived": 0, "rng_rows": 0, "spawn": 0}
	for c in cases:
		var env := FixtureEnv.new()
		env.rng = (c.env.rng as Array).duplicate()
		env.can = (c.env.canMv as Array).duplicate()
		env.safe = c.env.safe
		env.suppress = c.env.suppress
		env.p = c.p.duplicate(true)
		var e: Dictionary = c.e.duplicate(true)
		var exp: Dictionary = by_id.get(int(c.id), {})
		check(not exp.has("error"), "oracle_error:%d:%s" % [c.id, exp.get("error")])
		if c.mode == "death":
			stats.death += 1
			var r1: Dictionary = DEATH.immediate(e, env)
			check(r1.ok == true, "imm_ok:%d" % c.id)
			if r1.get("revived") != true: DEATH.fallback_reserve(e, env)
			check((r1.get("revived") == true) == (exp.get("revived") == true), "revived:%d" % c.id)
			if r1.get("revived") == true: stats.revived += 1
		else:
			stats.tick += 1
			for i in range(int(c.ticks)):
				var r: Dictionary = DEATH.fallback_tick(e, c.sp, env)
				if r.get("outcome") == "final": stats.final += 1
				if r.get("outcome") == "revived": stats.fallback_revived += 1
		_cmp(e, exp.enemy, "enemy:%d" % c.id)
		_cmp(env.p, exp.player, "player:%d" % c.id)
		var et: Array = exp.trace
		check(env.trace.size() == et.size(), "trace_len:%d %d vs %d" % [c.id, env.trace.size(), et.size()])
		for i in range(mini(env.trace.size(), et.size())):
			_cmp(env.trace[i], et[i], "trace:%d[%d]" % [c.id, i])
			if str(env.trace[i][0]) == "rng": stats.rng_rows += 1
			if str(env.trace[i][0]) == "spawn": stats.spawn += 1
	print("PCBOSS_DEATH_FAILS ", JSON.stringify(fail_samples))
	print("PCBOSS_DEATH_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "cases": cases.size(), "stats": stats}))
	quit(1 if failures else 0)

func _make_cases() -> Array:
	var rng := RandomNumberGenerator.new()
	rng.seed = 2026102201
	var out: Array = []
	var id := 0
	for deaths in [0, 1, 2, 3, 6, 7, 8, 12, 14]:
		for revpts in [0.0, 5.0, 12.0, 120.0, 200.0]:
			for k in range(3):
				var e := _boss(rng)
				e.deaths = deaths
				e._revPts = revpts
				e._bossRevJudged = rng.randf() < 0.3
				if k == 2: e._origR = 44
				var p := _player(rng, e)
				var env := {"rng": [], "canMv": [rng.randf() < 0.6, true], "safe": {"x": e.x + 30.0, "y": e.y} if rng.randf() < 0.6 else null,
					"suppress": [0.0, 0.0, 0.12, 0.3][rng.randi() % 4]}
				for i in range(90): env.rng.append(rng.randf())
				if k == 0: env.rng[0] = 0.01
				out.append({"id": id, "mode": "death", "e": e, "p": p, "env": env})
				id += 1
	for k in range(60):
		var e := _boss(rng)
		e.alive = false
		e.deaths = rng.randi_range(1, 14)
		e._revPts = [0.0, 10.0, 15.0, 150.0][k % 4]
		e._maxRevPts = 200.0
		e._reviveTimer = [180.0, 1.0, 0.5, 30.0][k % 4]
		e._reviveX = e.x + 3.0
		e._reviveY = e.y - 5.0
		e._bossRevChance = rng.randf_range(0, 1.5) if k % 3 != 0 else 0
		e._bossRevRoll = rng.randf() if k % 5 != 0 else 1
		e._bossRevJudged = true
		var p := _player(rng, e)
		var env := {"rng": [], "canMv": [], "safe": null, "suppress": 0.0}
		for i in range(900): env.rng.append(rng.randf())
		out.append({"id": id, "mode": "tick", "e": e, "p": p, "env": env, "ticks": [1, 2, 200, 40][k % 4], "sp": [1.0, 0.5, 1.0, 2.0][k % 4]})
		id += 1
	return out

func _boss(rng: RandomNumberGenerator) -> Dictionary:
	return {"ib": true, "etype": 0, "alive": true, "x": 4000.0 + rng.randf_range(-200, 200), "y": 4000.0 + rng.randf_range(-200, 200),
		"r": 44, "hp": -15.0, "mhp": 21017.0, "atk": 46, "baseAtk": 46, "speed": 0.5, "bossPatCd": 35, "maxPoise": 21017.0, "poise": 0.0,
		"eShield": 0.0, "eShieldMax": 21017.0, "el": 0, "s": "bossSlash", "st2": 4.0, "_bossPhase": 2, "_maxRevPts": 200.0,
		"_comboSeq": ["slash"], "_comboIdx": 1, "_feinting": true, "_delaying": 3, "stunned": 0}

func _player(rng: RandomNumberGenerator, e: Dictionary) -> Dictionary:
	var a := rng.randf_range(0, TAU)
	var d: float = [40.0, 120.0, 400.0][rng.randi() % 3]
	return {"x": float(e.x) + cos(a) * d, "y": float(e.y) + sin(a) * d, "facing": rng.randf_range(-PI, PI), "hp": [577.0, 300.0][rng.randi() % 2],
		"mhp": 577.0, "iframes": [0.0, 0.0, 5.0][rng.randi() % 3], "s": ["idle", "charge", "wSwing"][rng.randi() % 3], "kb": {"x": 0.0, "y": 0.0}}

func _close(a: Variant, b: Variant) -> bool:
	if (a is float or a is int) and (b is float or b is int):
		var x := float(a)
		var y := float(b)
		if x == y: return true
		return absf(x - y) <= 1e-12 * maxf(1.0, maxf(absf(x), absf(y)))
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
