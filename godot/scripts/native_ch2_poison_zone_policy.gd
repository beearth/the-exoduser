extends RefCounted
## EC2-03. Pure commands/copies only. No actor, Player, World, RNG or save writes.
## game.html 39166–39173 / 39237–39252: CH2 nonboss34 mist / 38 gas.
## Clock and emission are separate so type38 brood work can remain between them.
const NumberSource = preload("res://port_modules/combat_stat_formula/producer.gd")

func advance_emitter_clock(actor: Dictionary, sp: float) -> Dictionary:
	var error: String = _actor_error(actor)
	if not error.is_empty() or not is_finite(sp) or sp < 0.0:
		return _stop(error if not error.is_empty() else "invalid_elapsed_ticks")
	var next: Dictionary = actor.duplicate(true)
	if next.s == "idle":
		var field: String = _timer(int(next.etype))
		next[field] = float(next[field]) - sp
	return {"status":"READY", "actor":next, "commands":[], "idle_entered":actor.s == "idle", "product_connected":false}

## Invoke at the actual gas/mist IF site using the then-current actor snapshot.
## For38 this is AFTER brood generation/its presentation, not before it.
## Pass the clock result idle_entered; the outer idle test is evaluated ONCE.
func plan_emission(actor: Dictionary, distance: float, idle_entered: bool) -> Dictionary:
	var error: String = _actor_error(actor)
	if not error.is_empty() or not is_finite(distance) or distance < 0.0:
		return _stop(error if not error.is_empty() else "invalid_distance")
	var next: Dictionary = actor.duplicate(true)
	var commands: Array = []
	var etype: int = int(actor.etype)
	var mist: bool = etype == 34
	var field: String = _timer(etype)
	if idle_entered and actor[field] <= 0.0 and distance < (300.0 if mist else 1200.0):
		next[field] = actor[_cooldown(etype)]
		var life: int = 300 if mist else 400
		var color: String = "#33aa22" if mist else "#556633"
		var packet: Dictionary = {"x":actor.x,"y":actor.y,"vx":0,"vy":0,
			"dmg":NumberSource.js_to_int32(float(actor.atk) * (0.4 if mist else 0.5)),
			"el":3,"friendly":false,"life":life,"ml":life,"col":color,"sz":8 if mist else 12,
			"poisonZone":true,"_tickCd":0,"_tickRate":30 if mist else 25}
		commands.append({"kind":"spawn_boss_projectile","packet":packet})
		commands.append({"kind":"text","x":actor.x,"y":float(actor.y)-15.0,"text":"독안개!" if mist else "독가스!","col":color,"life":30})
		commands.append({"kind":"sfx_magic","gain":0.7 if mist else 0.5})
	return {"status":"READY", "actor":next, "commands":commands, "product_connected":false}

## Input life is ALREADY advanced by the common projectile prefix (34671).
## Barrier/dome/other prefix decisions and elMul are supplied by existing owners.
## A contact stops at the synchronous hurt request. Do not pre-read post-hurt P.
func plan_contact(etype: int, zone: Dictionary, view: Dictionary, sp: float) -> Dictionary:
	var error: String = _zone_error(etype, zone)
	if not error.is_empty():
		return _stop(error)
	for key in ["distance","iframes","element_multiplier"]:
		if not _number(view.get(key)):
			return _stop("missing_contact_" + key)
	if not view.get("state") is String or view.distance < 0.0 or not is_finite(sp) or sp < 0.0:
		return _stop("invalid_contact_context")
	var next: Dictionary = zone.duplicate(true)
	next.vx = 0
	next.vy = 0
	if next._tickCd > 0.0:
		next._tickCd = float(next._tickCd) - sp
	if next._tickCd <= 0.0 and view.distance < float(next.sz) * 5.0 and view.iframes <= 0.0 and view.state != "charge":
		next._tickCd = next._tickRate if next._tickRate != 0 else 30
		var damage: int = NumberSource.js_to_int32(float(next.dmg) * float(view.element_multiplier))
		return {"status":"READY", "zone":next, "phase":"after_hurt_required",
			"commands":[{"kind":"hurt_projectile_player","damage":damage,"opts":{"dtype":"magic"}}], "product_connected":false}
	return _life_result(next, [])

## 34731–34734: ONLY after the hurt command returns, even if it refused damage.
## Caller supplies fresh player AND zone views; expiration is checked last.
func finish_contact(etype: int, zone_after_hurt: Dictionary, player_after_hurt: Dictionary) -> Dictionary:
	var error: String = _zone_error(etype, zone_after_hurt)
	if not error.is_empty():
		return _stop(error)
	if not _number(player_after_hurt.get("x")) or not _number(player_after_hurt.get("y")):
		return _stop("missing_post_hurt_player_position")
	var poison: Variant = player_after_hurt.get("poison")
	if poison != null and not _number(poison):
		return _stop("invalid_post_hurt_poison")
	var value: float = (0.0 if poison == null else float(poison)) + 2.0
	var commands: Array = [
		{"kind":"set_player_poison","value":value},
		{"kind":"text","x":player_after_hurt.x,"y":float(player_after_hurt.y)-10.0,"text":"독!","col":"#33aa22","life":15},
		{"kind":"parts","x":player_after_hurt.x,"y":player_after_hurt.y,"col":"#33aa22","count":3}]
	return _life_result(zone_after_hurt.duplicate(true), commands)

func radius(etype: int) -> Dictionary:
	if etype not in [34,38]:
		return _stop("unsupported_etype")
	return {"status":"READY", "value":40 if etype == 34 else 60, "product_connected":false}

func _life_result(zone: Dictionary, commands: Array) -> Dictionary:
	var expired: bool = zone.life <= 0.0
	if expired:
		commands.append({"kind":"parts","x":zone.x,"y":zone.y,"col":zone.col,"count":5})
		commands.append({"kind":"recycle_projectile"})
	return {"status":"READY", "zone":zone, "commands":commands, "phase":"branch_complete",
		"flow":"continue_projectiles" if expired else "fallthrough", "product_connected":false}

func _actor_error(actor: Dictionary) -> String:
	if typeof(actor.get("etype")) != TYPE_INT or actor.etype not in [34,38]:
		return "unsupported_etype"
	if not actor.get("ib") is bool or actor.ib:
		return "nonboss_actor_required"
	if not actor.get("s") is String:
		return "missing_actor_state"
	for key in ["x","y","atk",_timer(actor.etype),_cooldown(actor.etype)]:
		if not _number(actor.get(key)):
			return "missing_actor_" + key
	return ""

func _zone_error(etype: int, zone: Dictionary) -> String:
	if etype not in [34,38]:
		return "unsupported_etype"
	# Narrow packet shape. Actual actor identity/admission belongs to the caller.
	if zone.get("poisonZone") != true or zone.get("friendly") != false or zone.get("el") != 3 or zone.get("sz") != (8 if etype == 34 else 12):
		return "unsupported_poison_zone_packet"
	if not zone.get("col") is String:
		return "missing_zone_color"
	for key in ["x","y","vx","vy","dmg","life","_tickCd","_tickRate"]:
		if not _number(zone.get(key)):
			return "missing_zone_" + key
	return ""

func _timer(etype: int) -> String:
	return "_poisonZoneT" if etype == 34 else "_broodGasT"

func _cooldown(etype: int) -> String:
	return "_poisonZoneCd" if etype == 34 else "_broodGasCd"

func _number(value: Variant) -> bool:
	return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value))

func _stop(reason: String) -> Dictionary:
	return {"status":"NOT_READY", "reason":reason, "commands":[], "product_connected":false}
