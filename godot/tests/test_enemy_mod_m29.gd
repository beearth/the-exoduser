extends SceneTree
## Isolated M29 (돌진) kernel fixtures. Run in a fresh project containing only
## scripts/enemy_mod_m29.gd and this file. Actor/player dictionaries below are
## constructor fixtures that stand in for the unconnected owner; they are not a
## public play path and no live Main/world/player is touched.

const Kernel = preload("res://scripts/enemy_mod_m29.gd")

var _failures: Array = []
var _checks = 0

class ObjActor extends RefCounted:
	var x: Variant = 0.0
	var y: Variant = 0.0
	var r: Variant = 14.0
	var atk: Variant = 10
	var el: Variant = 0
	var col: Variant = "#ff5533"
	var mods: Variant = ["M29"]
	var modT: Variant = {"eliteBusy": 0.0, "eliteCharge": 0.0}
	var s: Variant = "idle"
	var st2: Variant = 0.0
	var facing: Variant = 0.0
	var echDx: Variant = 0.0
	var echDy: Variant = 0.0
	var _chgAimMax: Variant = 0.0
	var _chgDur: Variant = 0.0
	var _chgSpd: Variant = 0.0
	var _chgLen: Variant = 0.0
	var _chgVisLen: Variant = null

class Seq extends RefCounted:
	var values: Array
	var i = 0
	func _init(v: Array) -> void:
		values = v
	func next() -> float:
		var v = float(values[i % values.size()])
		i += 1
		return v

func _ok(cond: bool, label: String) -> void:
	_checks += 1
	if not cond:
		_failures.append(label)

func _near(a: float, b: float, label: String, eps: float = 1e-9) -> void:
	_ok(absf(a - b) <= eps, "%s (got %s want %s)" % [label, a, b])

func _actor(mods: Array = ["M29"]) -> Dictionary:
	return {"x": 0.0, "y": 0.0, "r": 14.0, "atk": 10, "el": 0, "col": "#ff5533", "mods": mods,
		"modT": {"eliteBusy": 0.0, "eliteCharge": 0.0}, "s": "idle", "st2": 0.0, "facing": 0.0,
		"echDx": 0.0, "echDy": 0.0}

func _player(x: float = 100.0, y: float = 0.0) -> Dictionary:
	return {"x": x, "y": y, "r": 15.0, "iframes": 0.0, "state": "idle", "parry_window": false}

func _kernel(extra: Dictionary = {}, wall_x: float = INF, block_x: float = INF) -> RefCounted:
	var k = Kernel.new()
	var p = {
		"can_move": func(x: float, _y: float, _r: float) -> bool: return x < block_x,
		"is_wall": func(x: float, _y: float) -> bool: return x >= wall_x,
		"element_multiplier": func(el: Variant) -> float: return 2.0 if int(el) == 1 else 1.0,
	}
	p.merge(extra, true)
	_ok(k.configure(p), "configure fixture")
	return k

func _to_charge(k: RefCounted, a: Dictionary, p: Dictionary, aim: Dictionary = {}) -> void:
	var target = aim if not aim.is_empty() else p
	a["modT"]["eliteCharge"] = 540.0
	k.trigger(a, 0.0, 300.0, target)
	for _i in range(60):
		k.step_charge(a, 1.0, target)

func _init() -> void:
	var selected: Array = []
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="):
			selected = arg.trim_prefix("--only=").split(",")
	var results: Array = []
	if selected.is_empty() or selected.has("configure_and_constants"):
		var before = _failures.size()
		var before_checks = _checks
		_test_configure_and_constants()
		results.append({"group": "configure_and_constants", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("lock_helpers"):
		var before = _failures.size()
		var before_checks = _checks
		_test_lock_helpers()
		results.append({"group": "lock_helpers", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("trigger_guards"):
		var before = _failures.size()
		var before_checks = _checks
		_test_trigger_guards()
		results.append({"group": "trigger_guards", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("busy_and_independence"):
		var before = _failures.size()
		var before_checks = _checks
		_test_busy_and_independence()
		results.append({"group": "busy_and_independence", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("windup_timeline_and_aim_lock"):
		var before = _failures.size()
		var before_checks = _checks
		_test_windup_timeline_and_aim_lock()
		results.append({"group": "windup_timeline_and_aim_lock", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("wall_clipped_guide"):
		var before = _failures.size()
		var before_checks = _checks
		_test_wall_clipped_guide()
		results.append({"group": "wall_clipped_guide", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("charge_distance_and_recover"):
		var before = _failures.size()
		var before_checks = _checks
		_test_charge_distance_and_recover()
		results.append({"group": "charge_distance_and_recover", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("blocked_charge"):
		var before = _failures.size()
		var before_checks = _checks
		_test_blocked_charge()
		results.append({"group": "blocked_charge", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("hit_damage_and_knockback"):
		var before = _failures.size()
		var before_checks = _checks
		_test_hit_damage_and_knockback()
		results.append({"group": "hit_damage_and_knockback", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("swept_collision"):
		var before = _failures.size()
		var before_checks = _checks
		_test_swept_collision()
		results.append({"group": "swept_collision", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("hit_guards_parry_and_charge_state"):
		var before = _failures.size()
		var before_checks = _checks
		_test_hit_guards_parry_and_charge_state()
		results.append({"group": "hit_guards_parry_and_charge_state", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("fractional_native_clock"):
		var before = _failures.size()
		var before_checks = _checks
		_test_fractional_native_clock()
		results.append({"group": "fractional_native_clock", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("cosmetic_random_and_sink"):
		var before = _failures.size()
		var before_checks = _checks
		_test_cosmetic_random_and_sink()
		results.append({"group": "cosmetic_random_and_sink", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	if selected.is_empty() or selected.has("object_adapter_and_noop_states"):
		var before = _failures.size()
		var before_checks = _checks
		_test_object_adapter_and_noop_states()
		results.append({"group": "object_adapter_and_noop_states", "status": "PASS" if _failures.size() == before else "FAIL", "checks": _checks - before_checks})
	print(JSON.stringify({"kind": "M29_TEST_LEDGER", "groups": results, "checks": _checks, "failures": _failures, "execution": "synchronous_explicit_constructor_fixture", "automatic_physics": 0, "automatic_render": 0, "public_play": false}))
	if _failures.is_empty():
		print("M29_TEST_PASS checks=%d" % _checks)
		quit(0)
	else:
		for f in _failures:
			printerr("M29_TEST_FAIL: " + str(f))
		print("M29_TEST_FAIL failures=%d checks=%d" % [_failures.size(), _checks])
		quit(1)

func _test_configure_and_constants() -> void:
	var k = Kernel.new()
	_ok(not k.configure({}), "empty providers rejected")
	_ok(k.configuration_error == "missing_provider_can_move", "error names provider")
	_ok(not k.configure({"can_move": 1, "is_wall": 1, "element_multiplier": 1}), "non-callable rejected")
	var a = _actor()
	_ok(k.advance_mod(a, 1.0, 300.0)["error"] != "", "unconfigured advance reports error")
	_ok(float(a["modT"]["eliteCharge"]) == 0.0, "unconfigured advance mutates nothing")
	_near(Kernel.ACCUMULATE_TICKS, 540.0, "accumulate")
	_near(Kernel.BUSY_TICKS, 78.0, "busy")
	_near(Kernel.WINDUP_TICKS, 60.0, "windup")
	_near(Kernel.CHARGE_TICKS, 18.0, "dur")
	_near(Kernel.CHARGE_SPEED, 32.0, "speed")
	_near(Kernel.CHARGE_LENGTH_BASE, 640.0, "length base")
	_ok(Kernel.SOURCE_ID == "M29" and Kernel.SOURCE_NAME == "돌진" and Kernel.SOURCE_COLOR == "#ff5533" and Kernel.SOURCE_HELL == 0, "mod def")
	_ok(not k.has_method("_process") and not k.has_method("_physics_process"), "no autonomous dispatch")

func _test_lock_helpers() -> void:
	var t = {"eliteBusy": 0.0}
	_ok(Kernel.claim_attack(t, 78.0), "claim when free")
	_near(t["eliteBusy"], 78.0, "busy set")
	_ok(not Kernel.claim_attack(t, 54.0), "claim blocked while busy")
	_near(t["eliteBusy"], 78.0, "blocked claim keeps busy")
	_ok(not Kernel.tick_attack_lock(t, 77.0), "still busy at 1")
	_ok(Kernel.tick_attack_lock(t, 5.0), "free after tick")
	_near(t["eliteBusy"], 0.0, "busy floors at zero")

func _test_trigger_guards() -> void:
	var k = _kernel()
	var a = _actor()
	# distance bounds are exclusive: 140 and 520 do not accumulate
	k.advance_mod(a, 10.0, 140.0)
	k.advance_mod(a, 10.0, 520.0)
	_near(a["modT"]["eliteCharge"], 0.0, "140/520 exclusive")
	k.advance_mod(a, 10.0, 140.5)
	k.advance_mod(a, 10.0, 519.5)
	_near(a["modT"]["eliteCharge"], 20.0, "inside bounds accumulates")
	# not idle: no accumulation, no reset
	a["s"] = "windup"
	k.advance_mod(a, 10.0, 300.0)
	_near(a["modT"]["eliteCharge"], 20.0, "non-idle frozen")
	a["s"] = "idle"
	# no M29 mod
	var b = _actor(["M30"])
	k.advance_mod(b, 600.0, 300.0)
	_near(b["modT"]["eliteCharge"], 0.0, "M30-only owner untouched")
	_ok(b["s"] == "idle", "M30-only owner stays idle")
	# 539 -> no trigger; 540 -> trigger
	var c = _actor()
	var p = _player()
	var r1 = k.trigger(c, 539.0, 300.0, p)
	_ok(not r1["started"] and c["s"] == "idle", "539 does not trigger")
	var r2 = k.trigger(c, 1.0, 300.0, p)
	_ok(r2["started"] and c["s"] == "eChargeWind", "540 triggers")
	_near(c["modT"]["eliteCharge"], 0.0, "accumulator reset on trigger")
	_near(c["modT"]["eliteBusy"], 78.0, "busy claimed 78")
	_near(c["st2"], 60.0, "st2 60")
	_near(c["_chgAimMax"], 60.0, "aimMax 60")
	_near(c["_chgDur"], 18.0, "dur 18")
	_near(c["_chgSpd"], 32.0, "spd 32")
	_near(c["_chgLen"], 654.0, "len 640+r")
	_near(c["_chgVisLen"], 654.0, "initial vis len")
	_near(c["echDx"], 1.0, "aim x")
	_near(c["echDy"], 0.0, "aim y")
	var ev = r2["events"]
	_ok(ev.size() == 1 and ev[0]["kind"] == "windup_started", "windup event")
	# invalid modT
	var d = _actor()
	d["modT"] = {"eliteBusy": 0.0}
	_ok(k.advance_mod(d, 1.0, 300.0)["error"] == "missing_actual_modT_eliteBusy_eliteCharge", "missing modT reported")

func _test_busy_and_independence() -> void:
	var k = _kernel()
	var a = _actor(["M29", "M30"])
	var p = _player()
	a["modT"]["eliteBusy"] = 5.0 # e.g. another elite attack (M30/M31/M32) holds the shared lock
	a["modT"]["eliteCharge"] = 600.0
	var r = k.trigger(a, 1.0, 300.0, p)
	_ok(not r["started"] and a["s"] == "idle", "busy lock blocks claim")
	_near(a["modT"]["eliteCharge"], 601.0, "accumulator keeps growing, not reset")
	_near(a["modT"]["eliteBusy"], 5.0, "kernel does not tick shared lock itself")
	_near(a["modT"].get("eliteRing", 0.0), 0.0, "M30 accumulator untouched")
	for _i in range(5):
		Kernel.tick_attack_lock(a["modT"], 1.0)
	r = k.trigger(a, 1.0, 300.0, p)
	_ok(r["started"], "fires on first free tick")
	_near(a["modT"]["eliteBusy"], 78.0, "busy 78 after claim")
	# a second owner has its own state: independent
	var b = _actor()
	k.trigger(b, 100.0, 300.0, p)
	_near(b["modT"]["eliteCharge"], 100.0, "owners independent")
	_near(a["modT"]["eliteCharge"], 0.0, "owner A independent of B")

func _test_windup_timeline_and_aim_lock() -> void:
	var k = _kernel()
	var a = _actor()
	var p = _player(100.0, 0.0)
	a["modT"]["eliteCharge"] = 540.0
	k.trigger(a, 0.0, 300.0, p)
	# steps 1..14 (st2 59..46 > 45.3) track the player; step 15 (st2 45) locks.
	p = _player(0.0, 100.0)
	for i in range(14):
		k.step_charge(a, 1.0, p)
	_near(a["st2"], 46.0, "st2 after 14")
	_near(a["echDx"], 0.0, "tracks player x", 1e-12)
	_near(a["echDy"], 1.0, "tracks player y")
	p = _player(-100.0, 0.0)
	k.step_charge(a, 1.0, p)
	_near(a["st2"], 45.0, "st2 after 15")
	_near(a["echDy"], 1.0, "locked at 45", 1e-12)
	_near(a["echDx"], 0.0, "locked x", 1e-12)
	_ok(a["s"] == "eChargeWind", "still winding")
	for i in range(44):
		k.step_charge(a, 1.0, p)
	_near(a["st2"], 1.0, "st2 1 at step 59")
	_ok(a["s"] == "eChargeWind", "not yet charging at step 59")
	var r = k.step_charge(a, 1.0, p)
	_ok(a["s"] == "eCharge", "charging at step 60")
	_near(a["st2"], 18.0, "charge duration 18")
	_ok(a["_chgVisLen"] == null, "vis len cleared on charge")
	_ok(r["events"].any(func(e): return e["kind"] == "charge_started"), "charge_started event")
	# decrement flag false: owner already decremented
	var b = _actor()
	var q = _player()
	_to_charge(k, b, q)
	b["s"] = "eChargeWind"
	b["st2"] = 10.0
	k.step_charge(b, 1.0, q, false)
	_near(b["st2"], 10.0, "no decrement when owner did")

func _test_wall_clipped_guide() -> void:
	var k = _kernel({}, 300.0)
	var a = _actor()
	var p = _player()
	a["modT"]["eliteCharge"] = 540.0
	k.trigger(a, 0.0, 300.0, p)
	k.step_charge(a, 1.0, p)
	# probes at r + 12k: 14,26,...; first x>=300 is 14+12*24 = 302
	_near(a["_chgVisLen"], 302.0, "guide clipped to wall probe")
	# no wall: full length 654
	var k2 = _kernel()
	var b = _actor()
	b["modT"]["eliteCharge"] = 540.0
	k2.trigger(b, 0.0, 300.0, p)
	k2.step_charge(b, 1.0, p)
	_near(b["_chgVisLen"], 654.0, "unclipped guide")

func _test_charge_distance_and_recover() -> void:
	var k = _kernel()
	var a = _actor()
	var p = _player(5000.0, 0.0) # far away: never hit
	_to_charge(k, a, p)
	_ok(a["s"] == "eCharge", "charging")
	var last = {}
	for i in range(18):
		_ok(a["s"] == "eCharge", "still charging before step %d" % (i + 1))
		last = k.step_charge(a, 1.0, p)
	_near(a["x"], 576.0, "18*32 distance")
	_ok(a["s"] == "recover", "recover after expiry")
	_near(a["st2"], 30.0, "recover 30")
	_ok(last["events"].any(func(e): return e["kind"] == "recover_entered" and e["reason"] == "expired"), "expired reason")
	# kernel does not drive the recover state
	var before = a["x"]
	k.step_charge(a, 1.0, p)
	_near(a["x"], before, "recover not handled by kernel")

func _test_blocked_charge() -> void:
	var k = _kernel({}, INF, 100.0)
	var a = _actor()
	var p = _player(5000.0, 0.0)
	_to_charge(k, a, p)
	var steps = 0
	while a["s"] == "eCharge" and steps < 20:
		k.step_charge(a, 1.0, p)
		steps += 1
	_near(a["x"], 96.0, "stopped before blocker (3 moves)")
	_ok(steps == 4 and a["s"] == "recover", "fourth move blocked -> recover")
	_near(a["st2"], 30.0, "blocked recover 30")

func _test_hit_damage_and_knockback() -> void:
	var k = _kernel()
	var a = _actor()
	a["atk"] = 10
	a["el"] = 1
	var p = _player(100.0, 10.0)
	_to_charge(k, a, p, _player(100.0, 0.0))
	var hit = {}
	var steps = 0
	while a["s"] == "eCharge" and steps < 20:
		var r = k.step_charge(a, 1.0, p)
		steps += 1
		for e in r["events"]:
			if e["kind"] == "player_damage":
				hit = e
	_ok(steps == 2, "hit on second move (swept), steps=%d" % steps)
	_ok(a["s"] == "recover", "recover after hit")
	_near(a["st2"], 30.0, "recover 30 after hit")
	_ok(int(hit["amount"]) == 600, "atk*30*elMul(2) = 600")
	_near(hit["element_multiplier"], 2.0, "elMul")
	_ok(hit["apply_elite_mod_hit"], "eModHitP requested")
	var ang = atan2(10.0 - 0.0, 100.0 - 64.0)
	_near(hit["knockback"].x, cos(ang) * 100.0, "kb x", 1e-5)
	_near(hit["knockback"].y, sin(ang) * 100.0, "kb y", 1e-5)
	var im = hit["impact"]
	_ok(im["boom"]["r"] == 80 and im["boom"]["frames"] == 48 and im["boom"]["kind"] == "fire_medium", "boom 80/48/fire_medium")
	_ok(im["boom"]["x"] == 100.0 and im["boom"]["y"] == 10.0, "boom at player")
	_ok(im["shake"] == 10 and im["big_impact_element"] == "fire" and im["sfx"] == "detonate", "impact/shake/sfx")
	# integer truncation: atk 7 * 30 * 1 = 210; atk 7 with mult 2 = 420; fractional atk truncates
	var b = _actor()
	b["atk"] = 3.7
	var q = _player(40.0, 0.0)
	_to_charge(k, b, q)
	var r2 = k.step_charge(b, 1.0, q)
	var dmg = r2["events"].filter(func(e): return e["kind"] == "player_damage")
	_ok(dmg.size() == 1 and int(dmg[0]["amount"]) == int(3.7 * 30.0), "truncation toward zero")

func _test_swept_collision() -> void:
	var k = _kernel()
	# pad = 15+14+18 = 47. Player 46 off-axis at mid-segment; endpoint distance 48.7 > 47.
	var a = _actor()
	var p = _player(16.0, 46.0)
	a["modT"]["eliteCharge"] = 540.0
	k.trigger(a, 0.0, 300.0, _player(100.0, 0.0))
	for _i in range(60):
		k.step_charge(a, 1.0, _player(100.0, 0.0))
	var r = k.step_charge(a, 1.0, p)
	_ok(r["events"].any(func(e): return e["kind"] == "player_damage"), "sweep catches mid-segment pass")
	# outside the pad: no hit
	var b = _actor()
	var q = _player(16.0, 48.0)
	_to_charge(k, b, _player(100.0, 0.0))
	var r2 = k.step_charge(b, 1.0, q)
	_ok(r2["events"].is_empty() and b["s"] == "eCharge", "outside pad no hit")

func _test_hit_guards_parry_and_charge_state() -> void:
	var k = _kernel()
	# iframes > 0: pass through, keep charging
	var a = _actor()
	var p = _player(40.0, 0.0)
	p["iframes"] = 5.0
	_to_charge(k, a, p)
	var r = k.step_charge(a, 1.0, p)
	_ok(r["events"].is_empty() and a["s"] == "eCharge", "iframes: no hit, continue")
	# parry window beats damage; bank uses atk||10; poise 20
	var b = _actor()
	b["atk"] = 0
	var q = _player(40.0, 0.0)
	q["parry_window"] = true
	_to_charge(k, b, q)
	var r2 = k.step_charge(b, 1.0, q)
	var ev = r2["events"][0]
	_ok(ev["kind"] == "player_parry", "parry event")
	_ok(ev["parry_bank_add"] == 10, "atk 0 -> bank 10")
	_near(ev["poise_hit"], 20.0, "poise 20")
	_ok(ev["do_parry"]["projectile"] == false and ev["do_parry"]["atk"] == 0.0, "doParry args")
	_ok(b["s"] == "recover" and not r2["events"].any(func(e): return e["kind"] == "player_damage"), "parry: recover, no damage")
	# player in charge state: no damage packet but enemy still recovers
	var c = _actor()
	var q2 = _player(40.0, 0.0)
	q2["state"] = "charge"
	_to_charge(k, c, q2)
	var r3 = k.step_charge(c, 1.0, q2)
	_ok(not r3["events"].any(func(e): return e["kind"] == "player_damage"), "charge state: no damage")
	_ok(c["s"] == "recover", "charge state: still recover")
	# parry packet atk positive
	var d = _actor()
	d["atk"] = 25
	var q3 = _player(40.0, 0.0)
	q3["parry_window"] = true
	_to_charge(k, d, q3)
	_ok(k.step_charge(d, 1.0, q3)["events"][0]["parry_bank_add"] == 25, "bank uses atk")

func _test_fractional_native_clock() -> void:
	var k = _kernel()
	var a = _actor()
	var p = _player()
	a["modT"]["eliteCharge"] = 539.0
	var r = k.trigger(a, 0.35, 300.0, p)
	_ok(not r["started"], "0.35 short")
	r = k.trigger(a, 0.35, 300.0, p)
	_ok(not r["started"], "0.70 short")
	r = k.trigger(a, 0.35, 300.0, p)
	_ok(r["started"], "crosses 540 with slow-mo ticks")
	var steps = 0
	while a["s"] == "eChargeWind" and steps < 400:
		k.step_charge(a, 0.35, p)
		steps += 1
	_ok(steps == 172, "60/0.35 -> 172 steps, got %d" % steps)
	# charge moves speed*ticks per step
	var x0 = a["x"]
	k.step_charge(a, 0.35, _player(5000.0, 0.0))
	_near(a["x"] - x0, 32.0 * 0.35, "speed scaled by ticks")

func _test_cosmetic_random_and_sink() -> void:
	var seq = Seq.new([0.1, 0.9, 0.2])
	var sunk: Array = []
	var k = _kernel({"random": seq.next, "sink": func(e): sunk.append(e["kind"])})
	var a = _actor()
	var p = _player()
	a["modT"]["eliteCharge"] = 540.0
	k.trigger(a, 0.0, 300.0, p)
	var r = k.step_charge(a, 1.0, p)
	var spark = r["events"].filter(func(e): return e["kind"] == "vfx_spark")
	_ok(spark.size() == 1, "spark when rnd<.3")
	_near(spark[0]["vx"], (0.9 - 0.5) * 2.0, "spark vx from 2nd draw")
	_near(spark[0]["vy"], (0.2 - 0.5) * 2.0, "spark vy from 3rd draw")
	_near(spark[0]["x"], 14.0, "spark at e.x+dx*r")
	_ok(sunk.has("windup_started") and sunk.has("vfx_spark"), "sink receives every event")
	# no random provider -> no cosmetic events and no gameplay dependence
	var k2 = _kernel()
	var b = _actor()
	b["modT"]["eliteCharge"] = 540.0
	k2.trigger(b, 0.0, 300.0, p)
	_ok(k2.step_charge(b, 1.0, p)["events"].is_empty(), "no random provider: silent")

func _test_object_adapter_and_noop_states() -> void:
	var k = _kernel()
	var o = ObjActor.new()
	var p = _player()
	o.modT["eliteCharge"] = 540.0
	var r = k.trigger(o, 0.0, 300.0, p)
	_ok(r["started"] and o.s == "eChargeWind" and float(o._chgLen) == 654.0, "Object actor adapter")
	for _i in range(60):
		k.step_charge(o, 1.0, p)
	_ok(o.s == "eCharge", "Object actor reaches charge")
	_ok(Kernel.is_committed(o), "is_committed object")
	# unrelated owner states are untouched and not decremented
	var a = _actor()
	a["s"] = "recover"
	a["st2"] = 7.0
	var r2 = k.step_charge(a, 1.0, p)
	_ok(r2["events"].is_empty() and a["st2"] == 7.0 and a["s"] == "recover", "other states no-op")
	_ok(not Kernel.is_committed(a), "recover not committed")
