extends RefCounted
## EC3-04: game.html:39318–39334 only. No actor/Main/State/Player writes.
## Call at the dedicated source site with its cached d/sp/current P snapshot.
const Constructor = preload("res://scripts/native_ch2_enemy_constructor_policy.gd")
const Formula = preload("res://port_modules/combat_stat_formula/producer.gd")

func step(actor: Dictionary, context: Dictionary, random_unit: Callable) -> Dictionary:
	var reason: String = _error(actor, context)
	if not reason.is_empty():
		return _stop(reason, 0)
	if not random_unit.is_valid():
		return _stop("invalid_random_callable", 0)
	var e: Dictionary = actor.duplicate(true)
	var commands: Array = []
	var draws := Constructor.Draws.new(random_unit)
	# Outer idle test is evaluated ONCE. Guard and slash can both run this tick.
	if e.s == "idle":
		e._dkGuardT -= context.sp
		e._dkSlashT -= context.sp
		if e._dkGuardT <= 0.0 and context.d < 1200.0 and not e._dkGuarding:
			e._dkGuarding = true
			e._dkGuardT = 90.0 + draws.sample() * 40.0
			if not draws.error.is_empty():
				return _stop(draws.error, draws.count)
		if e._dkGuarding:
			e._dkGuardT -= context.sp # Also on entry tick; slash clock only once.
			if e._dkGuardT <= 0.0:
				e._dkGuarding = false
				e._dkGuardT = e._dkGuardCd
		if e._dkSlashT <= 0.0 and context.d < 45.0:
			e._dkSlashT = e._dkSlashCd
			e._telegraphT = 20.0
			e.s = "windup"
			e.st2 = 18.0
			# Source hurts P immediately at windup entry, NOT on a later animation.
			commands.append({"kind":"hurtP", "dmg":Formula.js_to_int32(float(e.atk) * 1.3)})
			# hurtP may reenter hurtE (43415+, thorns/reflect). Resolve these
			# reads AFTER hurtP, at their own source command sites, not upfront.
			commands.append({"kind":"addParts", "position_ref":"player", "color_ref":"actor.col", "count":6})
			commands.append({"kind":"addTxt", "position_ref":"actor", "offset_y":-15.0, "text_key":"강타!", "col":"#ff4422", "life":30})
			commands.append({"kind":"shake", "amount":3})
	var fields: Dictionary = {"_dkGuardT":e._dkGuardT,"_dkSlashT":e._dkSlashT,"_dkGuarding":e._dkGuarding,"s":e.s,"st2":e.st2}
	if e.has("_telegraphT"):
		fields._telegraphT = e._telegraphT
	return {"status":"READY", "fields":fields, "fields_timing":"before_commands", "commands":commands, "draws":draws.count, "full_tick":false, "product_connected":false}

## Apply ONLY at hurtE:42156, after phase return42154, before later damage/poise.
## This projects the local damage value; it neither writes HP nor connects hurtE.
func hurt_damage_projection(actor: Dictionary, damage: Variant) -> Dictionary:
	if not _number(actor.get("etype")) or float(actor.etype) != floor(float(actor.etype)):
		return _hurt_stop("invalid_etype")
	if not _number(damage):
		return _hurt_stop("invalid_damage")
	if actor.etype == 41 and not actor.get("_dkGuarding") is bool:
		return _hurt_stop("invalid_guarding")
	var applied: bool = actor.etype == 41 and actor.get("_dkGuarding",false) == true
	return {"status":"READY", "value":Formula.js_to_int32(float(damage) * 0.5) if applied else damage, "applied":applied, "source_line":42156, "complete_hurte":false}

func _number(v: Variant) -> bool:
	return (typeof(v) == TYPE_INT or typeof(v) == TYPE_FLOAT) and is_finite(float(v))
func _error(e: Dictionary, c: Dictionary) -> String:
	if not _number(e.get("etype")) or e.etype != 41:
		return "unsupported_etype"
	if not e.get("s") is String or not e.get("_dkGuarding") is bool:
		return "invalid_state"
	for key in ["atk","st2","_dkGuardT","_dkGuardCd","_dkSlashT","_dkSlashCd"]:
		if not _number(e.get(key)):
			return "missing_finite_actor_" + key
	if e.has("_telegraphT") and not _number(e._telegraphT):
		return "invalid_telegraph"
	for key in ["d","sp"]:
		if not _number(c.get(key)):
			return "missing_finite_context_" + key
	if c.d < 0.0 or c.sp < 0.0:
		return "negative_distance_or_step"
	return ""
func _stop(reason: String, draws: int) -> Dictionary:
	return {"status":"NOT_READY", "reason":reason, "draws":draws, "full_tick":false, "product_connected":false}
func _hurt_stop(reason: String) -> Dictionary:
	return {"status":"NOT_READY", "reason":reason, "complete_hurte":false}
