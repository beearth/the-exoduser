extends RefCounted
## EC3-06, game.html G39358–39365: etype43 trigger only.
## EC2-04 advance_trigger_clocks/plan_triggers receipt format; outer idle once.
## Caller supplies already-authorized owner tick and cached distance. No owner
## dispatch, movement, damage, lock clock, RNG, Main/State/save or live writer.
## Feed returned actor to existing enemy_mod_m29.step_charge, NEVER its trigger
## or start_windup (M29 60/18/32 differs from this source's 90/15/42).

func advance_trigger_clocks(actor: Dictionary, sp: float) -> Dictionary:
	var error: String = _actor_error(actor)
	if not error.is_empty() or not is_finite(sp) or sp < 0.0:
		return _stop(error if not error.is_empty() else "invalid_elapsed_ticks")
	var next: Dictionary = actor.duplicate(true)
	var idle_entered: bool = actor.s == "idle"
	if idle_entered:
		next._ddLungeT = float(next._ddLungeT) - sp
	return {"status":"READY","actor":next,"idle_entered":idle_entered,"commands":[],"product_connected":false}

## path_clear(view,length)->bool is called only at the original short-circuit
## site, before cooldown reset. An unbound source predicate halts explicitly.
func plan_triggers(actor: Dictionary, player: Dictionary, distance: float, idle_entered: bool, path_clear: Callable) -> Dictionary:
	var error: String = _actor_error(actor)
	if not error.is_empty():
		return _stop(error)
	if not _number(player.get("x")) or not _number(player.get("y")) or not is_finite(distance) or distance < 0.0:
		return _stop("invalid_player_or_distance")
	var next: Dictionary = actor.duplicate(true)
	var commands: Array = []
	if idle_entered and next._ddLungeT <= 0.0 and distance < 1200.0 and distance > 30.0:
		if not path_clear.is_valid():
			return _stop("source_path_clear_unbound")
		var clear: Variant = path_clear.call(next.duplicate(true), 630.0 + float(next.r))
		if not clear is bool:
			return _stop("invalid_source_path_clear_result")
		if clear:
			next._ddLungeT = next._ddLungeCd
			var angle: float = atan2(float(player.y)-float(next.y), float(player.x)-float(next.x))
			next.echDx = cos(angle)
			next.echDy = sin(angle)
			next.facing = angle
			next.s = "eChargeWind"
			next.st2 = 90
			next._chgAimMax = 90
			next._chgDur = 15
			next._chgSpd = 42
			next._chgLen = 630.0 + float(next.r)
			# Source does not clear _chgVisLen or claim an elite M29 lock here.
			commands.append({"kind":"text","x":next.x,"y":float(next.y)-15.0,"text":"돌진!","col":"#882211","life":25})
			commands.append({"kind":"sfx_charge"})
	return {"status":"READY","actor":next,"commands":commands,"product_connected":false,"common_consumers_required":true}

func _actor_error(actor: Dictionary) -> String:
	if typeof(actor.get("etype")) != TYPE_INT or actor.etype != 43:
		return "unsupported_etype"
	if not actor.get("ib") is bool or actor.ib or not actor.get("s") is String:
		return "invalid_nonboss_actor_context"
	for field in ["x","y","r","_ddLungeT","_ddLungeCd"]:
		if not _number(actor.get(field)):
			return "missing_actor_" + field
	if actor.r < 0.0:
		return "invalid_actor_radius"
	return ""

func _number(value: Variant) -> bool:
	return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value))

func _stop(reason: String) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"commands":[],"product_connected":false}
