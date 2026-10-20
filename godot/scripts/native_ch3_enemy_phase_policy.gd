extends RefCounted
## EC3-03. Pure projection of game.html:39289–39316, NOT updateE/actor writer.
## Caller supplies the already computed d, sp and current P, plus read-only canMv.
## Returned position is a local projection for subsequent source-site aiming.
## Commands require a separate owner; canMv must not apply movement itself.
const Constructor = preload("res://scripts/native_ch2_enemy_constructor_policy.gd")

func step(actor: Dictionary, context: Dictionary, random_unit: Callable, can_move: Callable) -> Dictionary:
	var reason: String = _error(actor, context)
	if not reason.is_empty():
		return _stop(reason, 0)
	if not random_unit.is_valid():
		return _stop("invalid_random_callable", 0)
	if not can_move.is_valid():
		return _stop("invalid_can_move_callable", 0)
	var e: Dictionary = actor.duplicate(true)
	var commands: Array = []
	var draws := Constructor.Draws.new(random_unit)
	if e.s == "idle": # 39289: one outer test, no common tick/tail here.
		e._wraithPhaseT -= context.sp
		if not e._wraithPhasing and e._wraithPhaseT <= 0.0 and context.d < 1200.0:
			e._wraithPhasing = true
			e._wraithPhaseT = 60.0 + draws.sample() * 30.0
			if not draws.error.is_empty():
				return _stop(draws.error, draws.count)
			commands.append({"kind":"addTxt", "x":e.x, "y":e.y-15.0, "text_key":"소멸...", "col":"#aa66ff", "life":20})
		if e._wraithPhasing:
			e._wraithPhaseT -= context.sp # 39296: also on the entry tick.
			reason = _move(e, context, 1.5, "phase", can_move, commands)
			if not reason.is_empty():
				return _stop(reason, draws.count)
			if e._wraithPhaseT < -60.0:
				e._wraithPhaseT = 0.0
			if e._wraithPhaseT <= 0.0 or context.d < 30.0:
				e._wraithPhasing = false
				e._wraithPhaseT = e._wraithPhaseCd
				if context.d < 50.0:
					var shot: Dictionary = {"kind":"eProjAt", "angle":atan2(context.py-e.y, context.px-e.x), "speed":5.0, "dmg_mul":1.5, "life":60, "col":"#aa66ff", "size":2}
					# Preserve missing e.el versus explicit null; no EL.P fallback.
					if e.has("el"):
						shot.el = e.el
					commands.append(shot)
					commands.append({"kind":"addTxt", "x":e.x, "y":e.y-10.0, "text_key":"기습!", "col":"#aa66ff", "life":25})
					commands.append({"kind":"addParts", "x":e.x, "y":e.y, "col":"#aa66ff", "count":4})
		# Independent if, not elif: can perform a SECOND canMv/move this tick.
		if not e._wraithPhasing and context.d > 30.0 and context.d < 1200.0:
			reason = _move(e, context, 1.0, "ordinary", can_move, commands)
			if not reason.is_empty():
				return _stop(reason, draws.count)
	return {"status":"READY", "fields":{"_wraithPhaseT":e._wraithPhaseT, "_wraithPhasing":e._wraithPhasing}, "position":{"x":e.x,"y":e.y}, "commands":commands, "draws":draws.count, "full_tick":false, "product_connected":false}

## Request ONLY at hurtE:42154, after its earlier guards/modifiers/side effects.
## This does not short-circuit the entire hurtE from its entry or write HP/poise.
func hurt_return_request(actor: Dictionary) -> Dictionary:
	if not _number(actor.get("etype")) or float(actor.etype) != floor(float(actor.etype)):
		return {"status":"NOT_READY", "reason":"invalid_etype", "complete_hurte":false}
	if actor.etype == 40 and not actor.get("_wraithPhasing") is bool:
		return {"status":"NOT_READY", "reason":"invalid_phasing", "complete_hurte":false}
	return {"status":"READY", "return_requested":actor.etype == 40 and actor.get("_wraithPhasing",false) == true, "source_line":42154, "complete_hurte":false}

func _move(e: Dictionary, c: Dictionary, multiplier: float, site: String, can_move: Callable, commands: Array) -> String:
	var angle: float = atan2(c.py-e.y, c.px-e.x)
	var raw: Variant = e.get("_aSpdM")
	# JS (e._aSpdM || 1): missing/null/false/0 -> 1, negative stays negative.
	var speed_mul: float = 1.0 if raw == null or (raw is bool and not raw) or (_number(raw) and float(raw) == 0.0) else float(raw)
	var speed: float = float(e.speed) * multiplier * speed_mul * float(c.sp)
	var nx: float = float(e.x) + cos(angle) * speed
	var ny: float = float(e.y) + sin(angle) * speed
	if not is_finite(nx) or not is_finite(ny):
		return "nonfinite_move"
	var allowed: Variant = can_move.call(nx, ny, e.r)
	if not allowed is bool:
		return "invalid_can_move_result"
	commands.append({"kind":"move", "site":site, "x":nx, "y":ny, "r":e.r, "allowed":allowed})
	if allowed:
		e.x = nx
		e.y = ny
	return ""

func _number(v: Variant) -> bool:
	return (typeof(v) == TYPE_INT or typeof(v) == TYPE_FLOAT) and is_finite(float(v))
func _error(e: Dictionary, c: Dictionary) -> String:
	if not _number(e.get("etype")) or e.etype != 40:
		return "unsupported_etype"
	if not e.get("s") is String or not e.get("_wraithPhasing") is bool:
		return "invalid_state"
	for key in ["x","y","speed","r","_wraithPhaseT","_wraithPhaseCd"]:
		if not _number(e.get(key)):
			return "missing_finite_actor_" + key
	for key in ["d","sp","px","py"]:
		if not _number(c.get(key)):
			return "missing_finite_context_" + key
	if c.d < 0.0 or c.sp < 0.0 or e.r < 0.0:
		return "negative_geometry_or_step"
	var m: Variant = e.get("_aSpdM")
	if m != null and not m is bool and not _number(m):
		return "invalid_speed_multiplier"
	return ""
func _stop(reason: String, draws: int) -> Dictionary:
	return {"status":"NOT_READY", "reason":reason, "draws":draws, "full_tick":false, "product_connected":false}
