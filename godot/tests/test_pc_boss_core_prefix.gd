extends SceneTree
## PC-BOSS-CORE — native_demo11_boss_prefix.gd(updateE 38584–38884) vs 원본 VM oracle 대조.
## 같은 고정 env 스크립트(충돌·LOS·흐름장·RNG)를 양쪽에 주고 결과 enemy/player/d/early·호출 trace 를 비교한다.
## 부동소수 비교: 사칙연산은 비트 동일 기대, 초월함수(atan2/cos/sin/sqrt/pow) 경유 값은 상대 1e-12 허용.
const PREFIX = preload("res://scripts/native_demo11_boss_prefix.gd")
const USERDIR := "EXODUSER-pc-boss-core-Isolated-20261022"
var assertions := 0
var failures := 0
var fail_samples: Array = []

class FixtureEnv extends RefCounted:
	var q := {}
	var trace: Array = []
	var lesson := false
	var ff: Variant = null
	var rifts: Array = []
	var msfx := 0
	func _take(k: String, fb: Variant) -> Variant:
		var a: Array = q[k]
		return a.pop_front() if not a.is_empty() else fb
	func pf_lesson_active() -> bool: return lesson
	func pf_tile_free(x: float, y: float, r: float) -> bool:
		var v: bool = _take("tile", true)
		trace.append(["tile", x, y, r, v])
		return v
	func pf_can_move(x: float, y: float, r: float) -> bool:
		var v: bool = _take("canMv", true)
		trace.append(["canMv", x, y, r, v])
		return v
	func pf_real_wall(x: float, y: float) -> bool:
		var v: bool = _take("realWall", false)
		trace.append(["realWall", PREFIX._i32(x / 40.0), PREFIX._i32(y / 40.0), v])
		return v
	func pf_los(x1: float, y1: float, x2: float, y2: float) -> bool:
		var v: bool = _take("los", true)
		trace.append(["los", x1, y1, x2, y2, v])
		return v
	func pf_ff_dir(x: float, y: float) -> Variant:
		trace.append(["ffDir", x, y])
		return ff.duplicate() if ff is Dictionary else null
	func pf_rng(_tag: String, line: int) -> float:
		var u: float = _take("rng", 0.5)
		trace.append(["rng", line, u])
		return u
	func pf_present(cmd: String, args: Array, _line: int) -> void:
		trace.append(["present", cmd, args])
	func pf_translate(t: String) -> String: return t
	func pf_hurt_e(e: Dictionary, dmg: int, _line: int) -> Dictionary:
		trace.append(["hurt", dmg])
		var out: Dictionary = e.duplicate(true)
		out.hp = float(out.hp) - dmg
		return out
	func pf_rifts() -> Array: return rifts
	func pf_msfx_playing() -> int: return msfx
	func pf_msfx_inc() -> void: msfx += 1
	func pf_generic_tick(e: Dictionary, p: Dictionary, sp: float) -> Dictionary:
		trace.append(["generic"])
		var out: Dictionary = e.duplicate(true)
		out._projChargeT = float(out._projChargeT) - sp
		if out._projChargeT <= 0:
			out._projChargeT = 0
			out._fired = int(out.get("_fired", 0)) + 1
		return {"ok": true, "e": out, "p": p}

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		if fail_samples.size() < 30: fail_samples.append(label)

func _initialize() -> void:
	create_timer(170.0).timeout.connect(func(): print("PCBOSS_PREFIX_WATCHDOG"); quit(2))
	call_deferred("_run")

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR), "isolation_userdir")
	var cases := _make_cases()
	var dir := ProjectSettings.globalize_path("user://")
	var in_path := dir.path_join("pc_boss_prefix_cases.json")
	var out_path := dir.path_join("pc_boss_prefix_oracle.json")
	var f := FileAccess.open(in_path, FileAccess.WRITE)
	f.store_string(JSON.stringify({"cases": _enc(cases)}))
	f.close()
	var node := _arg("node-bin", "C:/nvm4w/nodejs/node.exe")
	var output: Array = []
	var code := OS.execute(node, PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_boss_core_prefix_oracle.cjs"),
		"--cases-file=" + in_path, "--out-file=" + out_path]), output, true)
	check(code == 0, "oracle_exit:" + str(output))
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(out_path))
	check(oracle is Dictionary and oracle.get("sha256") == preload("res://source_snapshot/snapshot.gd").SHA256, "oracle_snapshot_sha")
	if not oracle is Dictionary:
		print("PCBOSS_PREFIX_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "oracle": "missing", "output": output}))
		quit(1)
		return
	var by_id := {}
	for r in oracle.get("results", []):
		var dr: Dictionary = _dec(r)
		by_id[int(dr.id)] = dr
	var compared := 0
	var not_ready := 0
	var early := 0
	var rng_rows := 0
	for c in cases:
		var env := FixtureEnv.new()
		for k in ["tile", "canMv", "realWall", "los", "rng"]: env.q[k] = (c.env[k] as Array).duplicate()
		env.lesson = c.env.lesson
		env.ff = c.env.ff
		env.rifts = c.env.rifts
		env.msfx = c.env.msfx
		var got: Dictionary = PREFIX.run(c.e, c.p, c.sp, env)
		var exp: Dictionary = by_id.get(int(c.id), {})
		if exp.has("error"):
			check(false, "oracle_error:%d:%s" % [c.id, exp.error])
			continue
		if got.status != "READY":
			not_ready += 1
			check(false, "prefix_not_ready:%d:%s" % [c.id, got.reason])
			continue
		compared += 1
		check(got.return_update == exp.early, "early:%d" % c.id)
		if got.return_update: early += 1
		if not exp.early: check(_close(got.distance, exp.d), "distance:%d %s vs %s" % [c.id, got.distance, exp.d])
		_cmp(got.enemy, exp.enemy, "enemy:%d" % c.id)
		_cmp(got.player, exp.player, "player:%d" % c.id)
		var et: Array = exp.trace
		check(env.trace.size() == et.size(), "trace_len:%d %d vs %d" % [c.id, env.trace.size(), et.size()])
		for i in range(mini(env.trace.size(), et.size())):
			_cmp(env.trace[i], et[i], "trace:%d[%d]" % [c.id, i])
			if str(env.trace[i][0]) == "rng": rng_rows += 1
	print("PCBOSS_PREFIX_FAILS ", JSON.stringify(fail_samples))
	print("PCBOSS_PREFIX_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "cases": cases.size(),
		"compared": compared, "early_returns": early, "rng_rows": rng_rows, "not_ready": not_ready}))
	quit(1 if failures else 0)

func _close(a: Variant, b: Variant) -> bool:
	if (a is float or a is int) and (b is float or b is int):
		var x := float(a)
		var y := float(b)
		if x == y: return true
		if is_nan(x) and is_nan(y): return true
		return absf(x - y) <= 1e-12 * maxf(1.0, maxf(absf(x), absf(y)))
	return a == b

func _cmp(a: Variant, b: Variant, label: String) -> void:
	if a is Dictionary and b is Dictionary:
		var keys := {}
		for k in a: keys[k] = true
		for k in b: keys[k] = true
		for k in keys:
			var av: Variant = a.get(k)
			var bv: Variant = b.get(k)
			_cmp(av, bv, label + "." + str(k))
		return
	if a is Array and b is Array:
		check(a.size() == b.size(), label + ":size")
		for i in range(mini(a.size(), b.size())): _cmp(a[i], b[i], label + "[" + str(i) + "]")
		return
	if a is bool or b is bool:
		check(a == b, label + " %s vs %s" % [a, b])
		return
	check(_close(a, b), label + " %s vs %s" % [a, b])

func _make_cases() -> Array:
	var rng := RandomNumberGenerator.new()
	rng.seed = 20261022
	var out: Array = []
	var states := ["idle", "recover", "bossChargeWind", "bossCharge", "bossSlash", "bossSlamWind"]
	for i in range(400):
		var e := {"ib": true, "etype": 0, "elite": 0, "mods": [], "x": 4000.0 + rng.randf_range(-300, 300), "y": 4000.0 + rng.randf_range(-300, 300),
			"r": 44, "hp": 21017.0, "mhp": 21017.0, "atk": 46, "baseAtk": 46, "speed": 0.5, "s": states[rng.randi() % states.size()],
			"st2": rng.randf_range(-5, 40), "facing": rng.randf_range(0, TAU), "kb": {"x": 0, "y": 0}, "_aAtkM": 1, "_aSpdM": 1,
			"stunned": 0, "reviveIframes": 0, "_alerted": rng.randf() < 0.5}
		var mode := i % 20
		if mode == 1: e.kb = {"x": rng.randf_range(-20, 20), "y": rng.randf_range(-20, 20)}
		if mode == 2: e.kb = {"x": 18.0, "y": 0.0}
		if mode == 3: e._hitStun = 3.0
		if mode == 4: e.stunned = rng.randf_range(1, 250); e._maxStunned = rng.randf_range(0, 200) if rng.randf() < 0.5 else 0
		if mode == 5: e._frozen = rng.randf_range(0.2, 3)
		if mode == 6: e._spikeSlow = 30.0; e._spikeSlowLv = rng.randi_range(1, 5); e.kb = {"x": 5.0, "y": -3.0}
		if mode == 7: e._telegraphT = 10.0; e.reviveIframes = 5.0; e._cursed = 2.0; e._shockT = 0.5; e._shockStk = 3
		if mode == 8: e._prevX = e.x - 1.0; e._prevY = e.y; e._moveHold = 2.0
		if mode == 9: e._prevX = e.x; e._prevY = e.y; e._moveHold = 0.5
		if mode == 10: e._webSlow = 4; e._frozenImmune = 5; e._iceResDown = 1; e._iceShardRes = 0.001; e._weakT = 0.5; e._weakPhys = 1; e._shockDRT = 2; e._blinkWeakT = 0.3; e._freezeGauge = 0.2
		if mode == 11: e._reviveChase = true
		if mode == 12: e._mSfxCd = rng.randf_range(-1, 3)
		if mode == 13: e._projChargeT = rng.randf_range(0.2, 2)
		if mode == 14: e._aAtkM = 1.25
		if mode == 15: e._comboStk = 7; e._comboHitT = rng.randf_range(50, 310); e._comboDecayT = rng.randf_range(50, 70)
		if mode == 16: e._wwStk = 9; e._wwStkT = 0 if rng.randf() < 0.5 else 2
		if mode == 17: e._tpFlashT = 3; e._hrMarkT = 0.5; e._hrMark = 2; e._bbStkT = 0.4; e._bbStk = 3
		if mode == 18: e._lastFdx = 0.6; e._lastFdy = 0.8
		if mode == 19: e._stuckT = 95
		var dist: float = [20.0, 100.0, 250.0, 700.0, 900.0, 1200.0][rng.randi() % 6]
		var ang: float = rng.randf_range(0, TAU)
		var p := {"x": e.x + cos(ang) * dist, "y": e.y + sin(ang) * dist, "r": 15.0, "facing": rng.randf_range(-PI, PI),
			"s": "idle", "iframes": 0.0, "kb": {"x": 0.0, "y": 0.0}}
		var env := {"tile": [], "canMv": [], "realWall": [], "los": [], "rng": [], "lesson": false, "ff": null, "rifts": [], "msfx": rng.randi_range(0, 3)}
		for k in range(12):
			env.tile.append(rng.randf() < 0.85)
			env.canMv.append(rng.randf() < (0.2 if mode == 19 else 0.7))
			env.realWall.append(rng.randf() < 0.5)
			env.los.append(rng.randf() < 0.7)
			env.rng.append(rng.randf())
		if rng.randf() < 0.5: env.ff = {"x": cos(ang + 0.3), "y": sin(ang + 0.3)}
		if mode == 1 and rng.randf() < 0.5: env.rifts = [{"x": e.x + 5.0, "y": e.y, "t": 30.0, "maxT": 120.0}]
		out.append({"id": i, "e": e, "p": p, "sp": [1.0, 0.5, 2.0, 1.7][rng.randi() % 4], "env": env})
	return out

static func _bits(v: float) -> String:
	var b := PackedByteArray()
	b.resize(8)
	b.encode_double(0, v)
	return b.hex_encode()

func _enc(v: Variant) -> Variant:
	if v is float: return {"__f64": _bits(v)}
	if v is int: return {"__f64": _bits(float(v))}
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
		if v.has("__f64"):
			var b: PackedByteArray = String(v.__f64).hex_decode()
			return b.decode_double(0)
		var d := {}
		for k in v: d[k] = _dec(v[k])
		return d
	if v is Array:
		var a: Array = []
		for x in v: a.append(_dec(x))
		return a
	return v
