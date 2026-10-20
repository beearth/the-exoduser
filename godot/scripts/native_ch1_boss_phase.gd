extends RefCounted
## BC05: ordinary CH1 phase/state-clock packets. Never a complete updateE tick.
## Checkpoints deliberately stop around spatial, damage, aura, projectile and AI
## owners. Apply write_keys only; execute commands at their indicated boundary.

const Catalog = preload("res://scripts/native_ch1_boss_catalog.gd")
const CHECKPOINTS = ["lesson_gate", "telegraph", "after_wall_push", "after_knockback",
	"attack_reset", "after_aura", "after_projectile_charge", "dispatch_phase",
	"after_ai_feint", "recovery_switch"]


static func source_receipt() -> Dictionary:
	return {"source_main": "e556b617190c325ca39f5add04357f5dea5ca87e",
		"game_sha256": "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4",
		"dependency": "BC04 818e9b2027afa37fadbf13a6b79b885abdb95f6b",
		"phase_writes": [38236, 38259], "phase_effect_continuation": [38271, 38312], "source_boss_phase_hitstop": 6,
		"clock_ranges": [[38584, 38592], [38614, 38635], [38771, 38772],
			[38874, 38884], [40444, 40454], [41375, 41383]],
		"checkpoints": CHECKPOINTS.duplicate(), "demo_last_stage": 0,
		"live_tick_connected": false, "damage_or_iframe_execution_verified": false}


## Exact phase scalar writes, stopping BEFORE the first presentation/teleport read.
## A transition requires the remaining source effects to run before the caller
## resumes dispatch. Merely building this request does not execute any effect.
static func phase_transition(si: int, enemy: Dictionary) -> Dictionary:
	if not Catalog.boss_for_stage(si).get("supported", false): return _failure("unsupported_chapter_stage")
	if not enemy.get("_bossPhase") is int or Catalog.phase_by_index(enemy["_bossPhase"]).is_empty():
		return _failure("unsupported_phase")
	if not _numbers(enemy, ["hp", "mhp"]) or enemy["mhp"] <= 0: return _failure("hp_snapshot_unsupported")
	var ratio: float = float(enemy["hp"]) / float(enemy["mhp"])
	var phase: int = 0 if ratio > 0.80 else (1 if ratio > 0.60 else (2 if ratio > 0.40 else (3 if ratio > 0.20 else 4)))
	if phase <= enemy["_bossPhase"]: return _packet(enemy, enemy.duplicate(true), "phase_unchanged", "finale_then_idle_ai")
	if not _numbers(enemy, ["atk", "speed", "maxPoise", "bossPatCd"]): return _failure("phase_stats_missing")
	var cds: Variant = enemy.get("_moveCDs")
	if cds != null and not cds is Array: return _failure("cooldown_shape_unsupported")
	var e: Dictionary = enemy.duplicate(true)
	var ph: Dictionary = Catalog.phase_by_index(phase)
	e["_bossPhase"] = phase
	e["hp"] = maxf(e["hp"], _i32(e["mhp"] * ph["hp"][1]))
	e["reviveIframes"] = 90
	# Current source finale requires stage3 AND _DEMO_LAST_STAGE=0, so is false.
	e["atk"] = _i32(e["atk"] * 1.3)
	e["speed"] = minf(e["speed"] * 1.15, 1.8 + phase * 0.1)
	e["maxPoise"] = _i32(e["maxPoise"] * 1.2) # Never write current poise/poiseR.
	e["bossPatCd"] = maxi(20, _i32(e["bossPatCd"] * (0.9 - phase * 0.05)))
	e["stunned"] = 0
	e["s"] = "recover"
	e["st2"] = 45
	e["bossPatT"] = 10
	e["_comboSeq"] = null
	e["_comboIdx"] = 0
	e["_feinting"] = false
	e["_delaying"] = 0
	if e.get("_moveCDs") is Array:
		if e["_moveCDs"].size() < 59: e["_moveCDs"].resize(59)
		for i in range(59): e["_moveCDs"][i] = 0 # No idx59/60 reset.
	var result: Dictionary = _packet(enemy, e, "phase_transition", "phase_effects_required")
	result["commands"] = [{"command": "resume_boss_phase_effects", "source_lines": [38271, 38312],
		"old_phase": enemy["_bossPhase"], "phase": phase,
		"requires": ["player_snapshot", "collision_safe_point", "hurtP", "boss_projectiles",
			"vfx_sfx", "global_hitstop_slowmo", "delayed_howl"], "executed": false}]
	result["continuation_required"] = true
	return result


## These checkpoints are NOT composited across missing owners. The caller must
## finish each next_boundary owner and pass its real next snapshot onward.
## No stunned/_hitStun/_pImmune loop timer is decreased a second time here.
static func clock_step(si: int, checkpoint: String, enemy: Dictionary, sp: float,
		context: Dictionary = {}, rng: Callable = Callable()) -> Dictionary:
	if not Catalog.boss_for_stage(si).get("supported", false): return _failure("unsupported_chapter_stage")
	if not CHECKPOINTS.has(checkpoint): return _failure("unknown_checkpoint")
	if not _number(sp): return _failure("non_finite_clock")
	var optional_timers: Dictionary = {"telegraph": ["_telegraphT"],
		"after_wall_push": ["reviveIframes", "_cursed", "_shockT"],
		"after_knockback": ["_bluHitCD", "_hitStun", "stunned", "_maxStunned"],
		"attack_reset": ["_tpFlashT"]}
	for key: String in optional_timers.get(checkpoint, []):
		if enemy.has(key) and enemy[key] != null and not _number(enemy[key]): return _failure("timer_shape_unsupported:" + key)
	var e: Dictionary = enemy.duplicate(true)
	var result: Dictionary
	match checkpoint:
		"lesson_gate":
			if _truthy(e.get("_lessonEnemy")):
				if not context.get("lesson_active") is bool: return _failure("lesson_active_reader_missing")
				if context["lesson_active"]: return _packet(enemy, e, "lesson_return", "return_update")
			return _packet(enemy, e, "continue", "telegraph")
		"telegraph":
			if _positive(e.get("_telegraphT")):
				if not _numbers(e, ["r"]): return _failure("radius_missing")
				e["_telegraphT"] -= sp
				e["_telegraphR"] = e["r"] + 20
			return _packet(enemy, e, "continue", "wall_push_owner")
		"after_wall_push":
			if _positive(e.get("reviveIframes")): e["reviveIframes"] = maxf(0, e["reviveIframes"] - sp)
			if _positive(e.get("_cursed")): e["_cursed"] -= sp
			if _positive(e.get("_shockT")):
				e["_shockT"] -= sp
				if e["_shockT"] <= 0:
					e["_shockT"] = 0
					e["_shockStk"] = 0
			return _packet(enemy, e, "continue", "knockback_wall_damage_owner")
		"after_knockback":
			if _positive(e.get("_bluHitCD")): e["_bluHitCD"] -= sp
			if _positive(e.get("_hitStun")): return _packet(enemy, e, "hitstun_return", "return_update")
			if _positive(e.get("stunned")):
				# _cancelProjCharge, game.html:20121, only these four scalar resets.
				e["_projChargeT"] = 0
				e["_projChargeCol"] = null
				e["_projChargeBean"] = null
				e["_projChargeParryClass"] = null
				if e["stunned"] > 180: e["stunned"] = 180
				if not _truthy(e.get("_maxStunned")) or e["_maxStunned"] < e["stunned"]:
					e["_maxStunned"] = e["stunned"]
				# The inner <=0 branch in 38625 cannot follow numeric >0 and this
				# cancel helper: no timer decrease occurs between the comparisons.
				return _packet(enemy, e, "stunned_return", "return_update")
			return _packet(enemy, e, "continue", "movement_freeze_status_dot_owners")
		"attack_reset":
			if not _numbers(e, ["baseAtk"]): return _failure("base_attack_missing")
			e["atk"] = e["baseAtk"]
			if _positive(e.get("_tpFlashT")): e["_tpFlashT"] -= sp
			return _packet(enemy, e, "continue", "elite_and_aura_owners")
		"after_aura":
			if not _numbers(e, ["atk", "_aAtkM"]): return _failure("resolved_aura_snapshot_missing")
			if e["_aAtkM"] != 1: e["atk"] = _i32(e["atk"] * e["_aAtkM"])
			return _packet(enemy, e, "continue", "projectile_charge_owner")
		"after_projectile_charge":
			if not _numbers(e, ["st2"]): return _failure("state_clock_missing")
			if not context.has("flow_direction"): return _failure("flow_reader_missing")
			var direction: Variant = context["flow_direction"]
			if direction != null:
				if not direction is Dictionary or not _numbers(direction, ["x", "y"]): return _failure("flow_shape_unsupported")
				e["_moveAng"] = atan2(direction["y"], direction["x"])
			else:
				if not _numbers(e, ["x", "y"]) or not _numbers(context, ["player_x", "player_y"]): return _failure("player_position_reader_missing")
				e["_moveAng"] = atan2(context["player_y"] - e["y"], context["player_x"] - e["x"])
			e["st2"] -= sp
			return _packet(enemy, e, "continue", "other_type_dispatch_owners")
		"dispatch_phase":
			if e.get("ib") != true or not e.get("s") is String: return _failure("boss_dispatch_shape_missing")
			if _truthy(e.get("_btFrozen")) and e["s"] == "idle":
				e["vx"] = 0
				e["vy"] = 0
				e["kb"] = {"x": 0, "y": 0}
				return _packet(enemy, e, "frozen_idle_return", "return_update")
			if _truthy(e.get("alive")): return phase_transition(si, enemy)
			return _packet(enemy, e, "phase_not_called", "finale_then_idle_ai")
		"after_ai_feint":
			if e.get("ib") != true or not e.get("s") is String: return _failure("boss_dispatch_shape_missing")
			if _truthy(e.get("_feinting")) and e["s"].ends_with("Wind"):
				if not _numbers(e, ["st2"]): return _failure("state_clock_missing")
				if e["st2"] <= 0:
					if not _numbers(e, ["x", "y"]): return _failure("effect_position_missing")
					e["s"] = "recover"
					e["st2"] = 25
					e["_feinting"] = false
					result = _packet(enemy, e, "feint_cancelled", "state_switch")
					result["commands"] = [{"command": "addTxt", "source_line": 40454,
						"args": [e["x"], e["y"] - 30, "...", "#cccccc", 30], "executed": false}]
					return result
			return _packet(enemy, e, "continue", "state_switch")
		"recovery_switch":
			if e.get("ib") != true or e.get("etype") != 0 or not e.get("s") is String:
				return _failure("ordinary_boss_recovery_shape_missing")
			if e["s"] not in ["recover", "bossRec"]: return _packet(enemy, e, "other_state", "other_state_owner")
			if not _numbers(e, ["st2"]): return _failure("state_clock_missing")
			var commands: Array = []
			if e["s"] == "recover":
				commands.append({"command": "atkTicketRelease", "source_line": 41376, "executed": false})
				if e["st2"] > 20: e["st2"] = 20
			var ledger: Array = []
			if e["st2"] <= 0:
				if not rng.is_valid(): return _failure("rng_provider_missing")
				var unit: Variant = rng.call("recovery_idle_timer")
				ledger.append({"field": "recovery_idle_timer", "source_line": 41382 if e["s"] == "recover" else 41375, "unit": unit})
				if not _number(unit) or unit < 0 or unit >= 1: return _failure("rng_unit_invalid", ledger)
				e["s"] = "idle"
				e["st2"] = 3 + unit * 5 # No truncation: fractional source timer.
			result = _packet(enemy, e, "recovery_switch", "end_state_switch")
			result["commands"] = commands
			result["rng_ledger"] = ledger
			return result
	return _failure("unknown_checkpoint")



## Start the remaining phase function as a resumable command stream. Each owner
## acknowledges its actual call before we draw/compute the next source operation.
## This preserves RNG interleaving inside VFX/projectile/damage owners. A recorded
## request or a fixture acknowledgment is never evidence that a real effect ran.
static func begin_phase_effects(si: int, enemy: Dictionary, player: Dictionary) -> Dictionary:
	if not Catalog.boss_for_stage(si).get("supported", false): return _failure("unsupported_chapter_stage")
	if not enemy.get("_bossPhase") is int or enemy["_bossPhase"] < 1 or enemy["_bossPhase"] > 4:
		return _failure("transition_phase_required")
	if not _numbers(enemy, ["x", "y", "r", "atk"]) or not enemy.has("el"): return _failure("phase_effect_actor_missing")
	if not _numbers(player, ["x", "y", "facing", "iframes"]) or not player.get("s") is String:
		return _failure("phase_effect_player_missing")
	return {"status": "READY", "continuation": {"version": 1, "si": si,
		"enemy": enemy.duplicate(true), "player": player.duplicate(true), "step": 0, "i": 0,
		"origin_x": enemy["x"], "origin_y": enemy["y"], "radius": enemy["r"] if enemy["r"] != 0 else 20,
		"pending": "", "position_commit": null}, "full_tick_complete": false}


## response={ack:true,...} confirms the PREVIOUS command. Read results require
## value, hurtP requires player_after, revive VFX requires actual global readback.
## No implicit success, position fallback, damage result or global default.
static func phase_effect_step(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if token.get("version") != 1 or not token.get("enemy") is Dictionary or not token.get("player") is Dictionary \
		or not token.get("step") is int or not token.get("i") is int or not token.get("pending") is String:
		return _failure("effect_continuation_shape_unsupported")
	if not token.get("si") is int or not Catalog.boss_for_stage(token["si"]).get("supported", false) \
		or not _numbers(token, ["origin_x", "origin_y", "radius"]) or not token.has("position_commit") \
		or token["i"] < 0 or token["i"] > 24 or token["pending"] not in ["", "ack", "canMv", "safePt", "hurtP", "translate", "revive_vfx", "boss_sfx"]:
		return _failure("effect_continuation_shape_unsupported")
	if not _numbers(token["enemy"], ["x", "y", "r", "atk"]) or not token["enemy"].has("el"):
		return _failure("phase_effect_actor_missing")
	var state: Dictionary = token.duplicate(true)
	var e: Dictionary = state["enemy"]
	var player: Dictionary = state["player"]
	var phase: int = e.get("_bossPhase", -1)
	if phase < 1 or phase > 4 or state["step"] < 0 or state["step"] > 25: return _failure("effect_continuation_range_unsupported")
	var pending: String = state["pending"]
	if pending != "":
		if not response is Dictionary or response.get("ack") != true: return _failure("effect_owner_ack_missing")
		match pending:
			"canMv":
				if not response.get("value") is bool: return _failure("collision_result_missing")
				if response["value"]:
					e["x"] = state["target_x"]
					e["y"] = state["target_y"]
					state["step"] = 5
					state["position_commit"] = {"x": e["x"], "y": e["y"], "source_line": 38278}
			"safePt":
				if not response.has("value"): return _failure("safe_point_result_missing")
				if response["value"] != null:
					if not response["value"] is Dictionary or not _numbers(response["value"], ["x", "y"]): return _failure("safe_point_shape_unsupported")
					e["x"] = response["value"]["x"]
					e["y"] = response["value"]["y"]
					state["position_commit"] = {"x": e["x"], "y": e["y"], "source_line": 38279}
			"hurtP":
				if not response.get("player_after") is Dictionary or not _numbers(response["player_after"], ["x", "y"]): return _failure("post_damage_player_reader_missing")
				state["player"] = response["player_after"].duplicate(true)
				player = state["player"]
			"translate":
				if not response.get("value") is String: return _failure("translation_result_missing")
				state["label"] = response["value"]
			"revive_vfx":
				if not _numbers(response, ["slow_mo_after", "hit_stop_scale"]): return _failure("post_vfx_global_reader_missing")
				state["slow_mo_after"] = response["slow_mo_after"]
				state["hit_stop_scale"] = response["hit_stop_scale"]
			"boss_sfx":
				if not response.has("value"): return _failure("boss_sfx_reader_missing")
				if response["value"] != null and (not response["value"] is Dictionary \
					or not response["value"].get("howl") is String or not _number(response["value"].get("howlP"))): return _failure("boss_sfx_shape_unsupported")
				state["sfx"] = response["value"]
		state["pending"] = ""
	var ctx: Dictionary = {"rng": rng, "ledger": [], "error": ""}
	if state["position_commit"] != null:
		var commit: Dictionary = state["position_commit"]
		state["position_commit"] = null
		return _effect_packet(state, "write_enemy_fields", commit["source_line"], [{"x": commit["x"], "y": commit["y"]}], ctx)
	var ox: float = state["origin_x"]
	var oy: float = state["origin_y"]
	var radius: float = state["radius"]
	var color: String = ["none", "#ff8800", "#cc2200", "#aa0022", "#8800cc"][phase]
	while state["step"] <= 25:
		var step: int = state["step"]
		var i: int = state["i"]
		state["step"] += 1
		match step:
			0, 5:
				if i >= 14:
					state["i"] = 0
					continue
				state["step"] = step
				state["i"] += 1
				var angle: float = PI * 2 * i / 14.0
				var speed: float = 4.0
				if step == 0:
					var u: Variant = _effect_draw(ctx, "departure_speed", 38273)
					if ctx["error"] != "": return _failure(ctx["error"], ctx["ledger"])
					speed += u * 5
				var unit: Variant = _effect_draw(ctx, "departure_size" if step == 0 else "arrival_size", 38273 if step == 0 else 38280)
				if ctx["error"] != "": return _failure(ctx["error"], ctx["ledger"])
				var x: float = ox + cos(angle) * radius * 0.6 if step == 0 else e["x"] + cos(angle) * (radius * 2.5)
				var y: float = oy + sin(angle) * radius * 0.6 if step == 0 else e["y"] + sin(angle) * (radius * 2.5)
				return _effect_packet(state, "poolPart", 38273 if step == 0 else 38280,
					[x, y, cos(angle) * speed * (1 if step == 0 else -1), sin(angle) * speed * (1 if step == 0 else -1), color, 3 + unit * 2, 12], ctx)
			1: return _effect_packet(state, "poolPart", 38274, [ox, oy, 0, 0, color, radius * 2, 10, 3, 0, 0], ctx)
			2: return _effect_packet(state, "_addBlastLight", 38274, [ox, oy, radius * 3, 12, 255, 68, 0], ctx)
			3:
				var unit: Variant = _effect_draw(ctx, "teleport_angle", 38275)
				if ctx["error"] != "": return _failure(ctx["error"], ctx["ledger"])
				state["angle"] = player["facing"] + PI + (unit - 0.5) * 0.8
				state["target_x"] = player["x"] + cos(state["angle"]) * (80 + phase * 25)
				state["target_y"] = player["y"] + sin(state["angle"]) * (80 + phase * 25)
				return _effect_packet(state, "canMv", 38278, [state["target_x"], state["target_y"], e["r"]], ctx, "canMv")
			4: return _effect_packet(state, "safePt", 38279, [player["x"] + cos(state["angle"]) * 50, player["y"] + sin(state["angle"]) * 50, e["r"]], ctx, "safePt")
			6: return _effect_packet(state, "poolPart", 38281, [e["x"], e["y"], 0, 0, "#ffffff", radius * 1.5, 8, 3, 0, 0], ctx)
			7: return _effect_packet(state, "_addBlastLight", 38281, [e["x"], e["y"], radius * 4, 14, 255, 68, 0], ctx)
			8:
				e["_tpFlashT"] = 8
				return _effect_packet(state, "write_enemy_fields", 38281, [{"_tpFlashT": 8}], ctx)
			9: return _effect_packet(state, "_addTpSmoke", 38282, [ox, oy, radius * 4, 18, 0], ctx)
			10: return _effect_packet(state, "_addTpSmoke", 38282, [e["x"], e["y"], radius * 5, 22, 1], ctx)
			11: return _effect_packet(state, "_addTpImpact", 38283, [e["x"], e["y"], radius * 4, 24, color], ctx)
			12: return _effect_packet(state, "_addTpBolt", 38283, [ox, oy, e["x"], e["y"], 14, color], ctx)
			13:
				var dx: float = player["x"] - e["x"]
				var dy: float = player["y"] - e["y"]
				if sqrt(dx * dx + dy * dy) < 100 + phase * 30 and player["iframes"] <= 0 and player["s"] != "charge":
					return _effect_packet(state, "hurtP", 38288, [_i32(e["atk"] * (0.4 + phase * 0.1)), {"dtype": "magic"}], ctx, "hurtP")
				state["step"] = 16
			14:
				var angle: float = atan2(player["y"] - e["y"], player["x"] - e["x"])
				return _effect_packet(state, "player_kb_add", 38289, [cos(angle) * 10, sin(angle) * 10], ctx)
			15: return _effect_packet(state, "addTxt", 38290, [player["x"], player["y"] - 20, {"call": "_T", "args": ["🌊충격파!"]}, "#ff4400", 30], ctx)
			16:
				var count: int = 8 + phase * 4
				if i >= count:
					state["i"] = 0
					continue
				state["step"] = 16
				state["i"] += 1
				var angle: float = PI * 2 * i / count
				var ux: Variant = _effect_draw(ctx, "volley_vx", 38297)
				if ctx["error"] != "": return _failure(ctx["error"], ctx["ledger"])
				var uy: Variant = _effect_draw(ctx, "volley_vy", 38297)
				if ctx["error"] != "": return _failure(ctx["error"], ctx["ledger"])
				var red: bool = i % 2 == 0
				var projectile: Dictionary = {"x": e["x"], "y": e["y"], "vx": cos(angle) * (3 + ux), "vy": sin(angle) * (3 + uy),
					"dmg": _i32(e["atk"] * (1.5 if red else 1.2)), "el": e["el"], "friendly": false, "life": 380, "ml": 380,
					"col": "#cc1100" if red else "hsl(" + str(int(i * 360.0 / count)) + ",100%,60%)", "sz": 1.8 if red else 1.5}
				if red:
					projectile["redBean"] = true
					projectile["homing"] = true
				return _effect_packet(state, "_spawnBossProjectile", 38297, [projectile], ctx)
			17: return _effect_packet(state, "_T", 38301, [Catalog.phase_by_index(phase)["label"]], ctx, "translate")
			18: return _effect_packet(state, "addTxt", 38301, [e["x"], e["y"] - 50, state["label"], "#ff0000" if phase >= 3 else ("#cc2200" if phase >= 2 else "#ff8800"), 70], ctx)
			19: return _effect_packet(state, "_reviveVFX", 38302, [e["x"], e["y"], "#ffdd44", "⚡부활! HP +30%", {"partN": 16, "partSpd": 5, "shake": 10, "vfxSize": 140, "flash": 3}], ctx, "revive_vfx")
			20: return _effect_packet(state, "write_globals", 38303, [{"hitStop": _i32((6 + phase * 3) * state["hit_stop_scale"] / 100.0), "slowMo": maxf(state["slow_mo_after"], 60 + phase * 15)}], ctx)
			21: return _effect_packet(state, "shake", 38305, [14 + phase * 4], ctx)
			22: return _effect_packet(state, "SFX.groggy", 38307, [], ctx)
			23: return _effect_packet(state, "_bossSfx", 38308, [state["si"]], ctx, "boss_sfx")
			24:
				var profile: Variant = state["sfx"]
				var sample: Variant = profile["howl"] if profile is Dictionary else {"random_choice": ["boss_howl", "boss_howl1"], "threshold": 0.5}
				var pitch: Variant = {"call": "_r", "args": [profile["howlP"] if profile is Dictionary else 0.85, 0.12]}
				return _effect_packet(state, "setTimeout", 38309, [120, {"command": "playSample", "args": [sample, 0.8, pitch], "source_line": 38310 if profile is Dictionary else 38311}], ctx)
			25: return {"status": "READY", "done": true, "enemy": e, "continuation": null, "command": null, "rng_ledger": ctx["ledger"], "full_tick_complete": false}
	return _failure("effect_continuation_range_unsupported")


static func _effect_packet(state: Dictionary, command: String, line: int, args: Array,
		ctx: Dictionary, pending: String = "ack") -> Dictionary:
	state["pending"] = pending
	return {"status": "READY", "done": false, "enemy": state["enemy"].duplicate(true), "continuation": state,
		"command": {"command": command, "source_line": line, "args": args, "executed": false},
		"rng_ledger": ctx["ledger"], "full_tick_complete": false}


static func _effect_draw(ctx: Dictionary, tag: String, line: int) -> Variant:
	if not ctx["rng"].is_valid():
		ctx["error"] = "rng_provider_missing"
		return null
	var unit: Variant = ctx["rng"].call(tag)
	ctx["ledger"].append({"field": tag, "source_line": line, "unit": unit})
	if not _number(unit) or unit < 0 or unit >= 1:
		ctx["error"] = "rng_unit_invalid"
		return null
	return unit


static func _i32(value: float) -> int:
	# JS ~~ is ToInt32, not floor or an unrestricted Godot int (large HP matters).
	if not is_finite(value) or value == 0: return 0
	var wrapped: float = fmod(floor(value) if value >= 0 else ceil(value), 4294967296.0)
	if wrapped < 0: wrapped += 4294967296.0
	if wrapped >= 2147483648.0: wrapped -= 4294967296.0
	return int(wrapped)


static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))


static func _numbers(object: Dictionary, keys: Array) -> bool:
	for key: String in keys:
		if not _number(object.get(key)): return false
	return true


static func _positive(value: Variant) -> bool:
	return _number(value) and value > 0


static func _truthy(value: Variant) -> bool:
	if value == null: return false
	if value is bool: return value
	if value is int or value is float: return value != 0 and not is_nan(float(value))
	if value is String: return not value.is_empty()
	return true # JS [] and {} are truthy.


static func _failure(reason: String, ledger: Array = []) -> Dictionary:
	return {"status": "NOT_READY", "reason": reason, "enemy": null, "write_keys": [],
		"commands": [], "rng_ledger": ledger, "full_tick_complete": false}


static func _packet(before: Dictionary, e: Dictionary, outcome: String, boundary: String) -> Dictionary:
	var keys: Array = []
	for key in e:
		if not before.has(key) or before[key] != e[key]: keys.append(key)
	return {"status": "READY", "enemy": e, "write_keys": keys, "outcome": outcome,
		"next_boundary": boundary, "commands": [], "rng_ledger": [],
		"continuation_required": false, "full_tick_complete": false}
