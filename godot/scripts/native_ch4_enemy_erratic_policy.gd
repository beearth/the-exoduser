extends RefCounted
## EC4-03: ONLY game.html G39510–39518. Caller enters at this exact AI site,
## after common guards/ticks. Cached d/sp and raw _now (milliseconds) are inputs.
## Local fields/position + movement request, no actor/common movement writer.
const Constructor = preload("res://scripts/native_ch2_enemy_constructor_policy.gd")
const Formula = preload("res://port_modules/combat_stat_formula/producer.gd")

func step(actor: Dictionary, context: Dictionary, random_unit: Callable, can_move: Callable) -> Dictionary:
	var reason: String = _error(actor,context)
	if not reason.is_empty():
		return _stop(reason,0)
	if not random_unit.is_valid():
		return _stop("invalid_random_callable",0)
	if not can_move.is_valid():
		return _stop("invalid_can_move_callable",0)
	var e: Dictionary = actor.duplicate(true)
	var commands: Array = []
	var draws := Constructor.Draws.new(random_unit)
	if e.s == "idle": # G39510: one outer test, no common attack/tick/tail.
		e._erraticT = float(e._erraticT)-float(context.sp) # G39511 JS Number, once even at d>=250/sp0.
		if e._erraticT <= 0.0:
			# G39512: ANGLE first, TIMER second (unlike EC4-02 initialization).
			e._erraticAng = draws.sample()*PI*2.0
			if not draws.error.is_empty():
				return _stop(draws.error,draws.count)
			e._erraticT = 30.0+draws.sample()*30.0
			if not draws.error.is_empty():
				return _stop(draws.error,draws.count)
		if context.d < 250.0: # G39514–39516: cached d, strictly <50 and <250.
			var angle: float = float(e._erraticAng) if context.d < 50.0 else float(e.facing)+sin(float(context.raw_now)*0.005)*0.5
			var raw: Variant = e.get("_aSpdM")
			# Source (e._aSpdM || 1), numeric/boolean/null domain like EC3-03.
			var multiplier: float = 1.0 if raw == null or (raw is bool and not raw) or (_number(raw) and float(raw) == 0.0) else float(raw)
			var speed: float = float(e.speed)*multiplier*float(context.sp)
			var nx: float = float(e.x)+cos(angle)*speed
			var ny: float = float(e.y)+sin(angle)*speed
			if not is_finite(nx) or not is_finite(ny):
				return _stop("nonfinite_move",draws.count)
			var allowed: Variant = can_move.call(nx,ny,e.r)
			if not allowed is bool:
				return _stop("invalid_can_move_result",draws.count)
			commands.append({"kind":"move","site":"erratic","x":nx,"y":ny,"r":e.r,"allowed":allowed})
			if allowed:
				e.x = nx
				e.y = ny
		# G39518: independent of movement admission; do NOT recompute d or clamp p.
		if context.d < 30.0+float(e.r):
			var probability_draw: float = draws.sample()
			if not draws.error.is_empty():
				return _stop(draws.error,draws.count)
			if probability_draw < 0.03*float(context.sp):
				e._telegraphT = 20
				e.s = "windup"
				var duration_draw: float = draws.sample()
				if not draws.error.is_empty():
					return _stop(draws.error,draws.count)
				e.st2 = 10+Formula.js_to_int32(duration_draw*20.0)
	var fields: Dictionary = {"_erraticT":e._erraticT,"_erraticAng":e._erraticAng,"s":e.s}
	# Preserve absent versus explicit null if the source did not write these keys.
	for key in ["_telegraphT","st2"]:
		if e.has(key):
			fields[key] = e[key]
	return {"status":"READY","fields":fields,"position":{"x":e.x,"y":e.y},"commands":commands,"draws":draws.count,"full_tick":false,"product_connected":false}

func _number(v: Variant) -> bool:
	return (typeof(v) == TYPE_INT or typeof(v) == TYPE_FLOAT) and is_finite(float(v))
func _error(e: Dictionary, c: Dictionary) -> String:
	if not _number(e.get("etype")) or e.etype != 50:
		return "unsupported_etype"
	if not e.get("s") is String:
		return "invalid_state"
	for key in ["x","y","speed","r","facing","_erraticT","_erraticAng"]:
		if not _number(e.get(key)):
			return "missing_finite_actor_"+key
	for key in ["d","sp","raw_now"]:
		if not _number(c.get(key)):
			return "missing_finite_context_"+key
	if c.d < 0.0 or c.sp < 0.0 or e.r < 0.0:
		return "negative_geometry_or_step"
	var m: Variant = e.get("_aSpdM")
	if m != null and not m is bool and not _number(m):
		return "invalid_speed_multiplier"
	return ""
func _stop(reason: String, draws: int) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"draws":draws,"full_tick":false,"product_connected":false}
