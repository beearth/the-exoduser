extends RefCounted
## EC2-04: dedicated type30/32/39 trigger policy only (game.html 39143–39163,
## 39255–39285). No common M29/type7 charge movement/sweep/slam execution,
## eProjAt/bean normalization, warning/birth, Player/World/State or RNG owner.

func advance_trigger_clocks(actor: Dictionary, sp: float) -> Dictionary:
	var error: String = _actor_error(actor)
	if not error.is_empty() or not is_finite(sp) or sp < 0.0:
		return _stop(error if not error.is_empty() else "invalid_elapsed_ticks")
	var next: Dictionary = actor.duplicate(true)
	var idle_entered: bool = actor.s == "idle"
	if idle_entered:
		for field in _timers(int(actor.etype)):
			next[field] = float(next[field]) - sp
	return {"status":"READY", "actor":next, "idle_entered":idle_entered, "commands":[], "product_connected":false}

## For39, the owner supplies the current snapshot AFTER its separate
## enrage/roar prefix. Preserve the once-evaluated outer idle guard and d.
## path_clear(view,length)->bool is needed ONLY when type30 reaches that site.
func plan_triggers(actor: Dictionary, player: Dictionary, distance: float, idle_entered: bool, path_clear: Callable) -> Dictionary:
	var error: String = _actor_error(actor)
	if not error.is_empty():
		return _stop(error)
	if not _number(player.get("x")) or not _number(player.get("y")) or not is_finite(distance) or distance < 0.0:
		return _stop("invalid_player_or_distance")
	var next: Dictionary = actor.duplicate(true)
	var commands: Array = []
	if not idle_entered:
		return _ready(next, commands)
	match int(next.etype):
		30:
			if next._wildChargeT <= 0.0 and distance < 1200.0 and distance > 40.0:
				if not path_clear.is_valid():
					return _stop("source_path_clear_unbound")
				var clear: Variant = path_clear.call(next.duplicate(true), 714.0 + float(next.r))
				if not clear is bool:
					return _stop("invalid_source_path_clear_result")
				if clear:
					var angle: float = atan2(float(player.y)-float(next.y), float(player.x)-float(next.x))
					next.echDx = cos(angle)
					next.echDy = sin(angle)
					next.facing = angle
					next.s = "eChargeWind"
					next.st2 = 90
					next._chgAimMax = 90
					next._chgDur = 17
					next._chgSpd = 42
					next._chgLen = 714.0 + float(next.r)
					next._wildChargeT = next._wildChargeCd
					commands.append(_text(next, -15.0, "돌진!", "#884422", 25))
					commands.append({"kind":"sfx_charge"})
		32:
			if next._boulderSlamT <= 0.0 and distance < 100.0:
				next.s = "eSlamWind"
				next.st2 = 50
				next._boulderSlamT = next._boulderSlamCd
				commands.append(_text(next, -20.0, "충격파!", "#ccaa88", 35))
				_groggy_if_near(commands, next, player)
				commands.append({"kind":"shake","amount":6})
				for index in range(4):
					commands.append(_shot(PI * 2.0 * index / 4.0 + PI / 4.0, 2.5, 1.3, 0, 200, "#776655", 3))
				if distance < 80.0:
					commands.append(_shot(atan2(float(player.y)-float(next.y), float(player.x)-float(next.x)), 4.0, 0.8, 0, 60, "#776655", 2))
					commands.append(_parts(next, "#776655", 4))
		39:
			if next._elderChargeT <= 0.0 and distance > 100.0 and distance < 1200.0:
				next._elderChargeT = next._elderChargeCd
				next.s = "eCharge"
				next.st2 = 30
				next.echDx = cos(float(next.facing))
				next.echDy = sin(float(next.facing))
				# Do NOT add/reset _chgSpd, _chgDur or a windup on the direct entry.
				commands.append(_text(next, -15.0, "돌진!", "#ff6633", 35))
				commands.append({"kind":"sfx_charge"})
			# Independent IF, even after charge changed s. Both CDs can reset.
			if next._elderSlamT <= 0.0 and distance < 120.0:
				next._elderSlamT = next._elderSlamCd
				next.s = "eSlamWind"
				next.st2 = 55
				commands.append(_text(next, -20.0, "충격파!", "#ff6633", 40))
				_groggy_if_near(commands, next, player)
				commands.append({"kind":"shake","amount":8})
				for index in range(8):
					commands.append(_shot(PI * 2.0 * index / 8.0, 3.0, 1.5, 0, 250, "#441100", 3))
				if distance < 100.0:
					commands.append(_shot(atan2(float(player.y)-float(next.y), float(player.x)-float(next.x)), 4.0, 1.2, next.get("el"), 60, "#441100", 2, next.has("el")))
					commands.append(_parts(next, "#441100", 4))
	return _ready(next, commands)

func _shot(angle: float, speed: float, requested_multiplier: float, element: Variant, life: int, color: String, size: int, element_present: bool = true) -> Dictionary:
	# eProjAt request values, NOT a normalized projectile. Common _beanRoll can
	# overwrite the multiplier (P -> 1.2) and eProjAt scales life by 1.5.
	var command: Dictionary = {"kind":"e_proj_at","angle":angle,"speed":speed,"requested_multiplier":requested_multiplier,
		"life":life,"col":color,"sz":size}
	# Missing el means source undefined; explicit null remains null, never P0.
	if element_present:
		command["el"] = element
	return command

func _groggy_if_near(commands: Array, actor: Dictionary, player: Dictionary) -> void:
	var dx: float = float(player.x)-float(actor.x)
	var dy: float = float(player.y)-float(actor.y)
	if sqrt(dx * dx + dy * dy) < 800.0:
		commands.append({"kind":"sfx_groggy"})

func _text(actor: Dictionary, dy: float, message: String, color: String, life: int) -> Dictionary:
	return {"kind":"text","x":actor.x,"y":float(actor.y)+dy,"text":message,"col":color,"life":life}

func _parts(actor: Dictionary, color: String, count: int) -> Dictionary:
	return {"kind":"parts","x":actor.x,"y":actor.y,"col":color,"count":count}

func _timers(etype: int) -> Array:
	return ["_wildChargeT"] if etype == 30 else ["_boulderSlamT"] if etype == 32 else ["_elderChargeT","_elderSlamT"]

func _actor_error(actor: Dictionary) -> String:
	if typeof(actor.get("etype")) != TYPE_INT or actor.etype not in [30,32,39]:
		return "unsupported_etype"
	if not actor.get("ib") is bool or actor.ib or not actor.get("s") is String:
		return "invalid_nonboss_actor_context"
	for field in ["x","y","r","facing","atk"] + _timers(int(actor.etype)):
		if not _number(actor.get(field)):
			return "missing_actor_" + field
	for field in _timers(int(actor.etype)):
		var cooldown: String = str(field).trim_suffix("T") + "Cd"
		if not _number(actor.get(cooldown)):
			return "missing_actor_" + cooldown
	if actor.r < 0.0:
		return "invalid_actor_radius"
	if actor.has("el") and actor.el != null and (typeof(actor.el) != TYPE_INT or actor.el < 0 or actor.el > 6):
		return "invalid_actor_element"
	return ""

func _number(value: Variant) -> bool:
	return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value))

func _ready(actor: Dictionary, commands: Array) -> Dictionary:
	return {"status":"READY", "actor":actor, "commands":commands,"product_connected":false,"common_consumers_required":true}

func _stop(reason: String) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"commands":[],"product_connected":false}
