extends RefCounted
## EC2-06: source game.html 39174–39235. Pure dedicated 35/36/37 copies and
## requests. No scheduler/clock authority, hurtP, actor/World/corpse/save writer.
## Fresh distances at Math.hypot/dst sites and collision results are owner inputs.
const Numbers = preload("res://port_modules/combat_stat_formula/producer.gd")

func advance_clocks(actor: Dictionary, sp: float) -> Dictionary:
	var error: String = _actor_error(actor)
	if not error.is_empty() or not _elapsed(sp):
		return _stop(error if not error.is_empty() else "invalid_elapsed_ticks")
	var next: Dictionary = actor.duplicate(true)
	var idle: bool = actor.s == "idle"
	if idle:
		for field in _timers(actor.etype):
			next[field] = float(next[field]) - sp
	return _ready(next, [], {"idle_entered":idle})

func plan_combo(actor: Dictionary, distance: float, idle_entered: bool) -> Dictionary:
	var error: String = _actor_error(actor,35)
	if not error.is_empty() or not _distance(distance):
		return _stop(error if not error.is_empty() else "invalid_distance")
	var next: Dictionary = actor.duplicate(true)
	var commands: Array = []
	if idle_entered and next._beastComboT <= 0.0 and distance < 40.0:
		next._beastComboT = next._beastComboCd
		for index in range(3):
			# Keep an owner reference, NOT a captured ATK/player snapshot. 0ms is
			# still a deferred callback; this module never executes it inline.
			commands.append({"kind":"schedule_beast_hit","index":index,"delay_ms":index*250})
		next._telegraphT = 20
		next.s = "windup"
		next.st2 = 15
		commands.append(_text(next,-15.0,"연타!","#993311",25))
	return _ready(next,commands)

## Invoke only when the external callback actually fires, using CURRENT actor
## and distance, without adding idle/alive/iframes/dead-player guards.
func plan_combo_hit(actor_now: Dictionary, current_distance: float, index: int) -> Dictionary:
	var error: String = _actor_error(actor_now,35)
	if not error.is_empty() or index < 0 or index > 2:
		return _stop(error if not error.is_empty() else "invalid_combo_index")
	if _flag(actor_now,"dead") or actor_now.hp <= 0.0 or actor_now.stunned != 0.0:
		return _ready(actor_now.duplicate(true),[])
	if not _distance(current_distance):
		return _stop("missing_current_callback_distance")
	if current_distance < 60.0:
		return _ready(actor_now.duplicate(true),[_hurt(float(actor_now.atk)*(0.7+index*0.15))],{"phase":"after_combo_hurt","index":index})
	return _ready(actor_now.duplicate(true),[])

## AFTER hurtP returns, including a refused hurt: read fresh P position and e.col.
func finish_combo_hit(actor_after_hurt: Dictionary, player_after_hurt: Dictionary, index: int) -> Dictionary:
	var error: String = _actor_error(actor_after_hurt,35)
	if not error.is_empty() or not _player_position(player_after_hurt) or index < 0 or index > 2:
		return _stop(error if not error.is_empty() else "invalid_post_combo_context")
	return _ready(actor_after_hurt.duplicate(true),[
		_parts(player_after_hurt,actor_after_hurt.col,4),
		_text(player_after_hurt,-10.0+index*12.0,"연타!","#993311",20)])

## Call after combo scheduling/its text. The original outer idle guard is ONCE.
func plan_roar(actor_at_site: Dictionary, current_distance: float, idle_entered: bool) -> Dictionary:
	var error: String = _actor_error(actor_at_site,35)
	if not error.is_empty():
		return _stop(error)
	var next: Dictionary = actor_at_site.duplicate(true)
	var commands: Array = []
	var scan: bool = idle_entered and next._beastRoarT <= 0.0
	if scan:
		if not _distance(current_distance):
			return _stop("missing_current_roar_distance")
		next._beastRoarT = next._beastRoarCd
		commands.append(_text(next,-20.0,"포효!","#ff4400",35))
		if current_distance < 800.0:
			commands.append({"kind":"sfx_groggy"})
		commands.append({"kind":"shake","amount":4})
	return _ready(next,commands,{"scan_allies":scan})

## Caller walks ens in its current order/length and supplies exact identity.
## No alive filter, permanent baseAtk write, buff TTL, aura owner or array clone.
func plan_roar_ally(parent: Dictionary, ally: Dictionary, same_identity: bool, current_distance: float, scan_entered: bool) -> Dictionary:
	var error: String = _actor_error(parent,35)
	if not error.is_empty() or not _player_position(ally) or not _number(ally.get("atk")) or not _optional_number(ally,"_aSpdM") or not _optional_flag(ally,"dead"):
		return _stop(error if not error.is_empty() else "invalid_ally_view")
	var next: Dictionary = ally.duplicate(true)
	var commands: Array = []
	if scan_entered and not _flag(ally,"dead") and not same_identity:
		if not _distance(current_distance):
			return _stop("missing_current_ally_distance")
		if current_distance < 200.0:
			next._aSpdM = _or_one(ally.get("_aSpdM"))*1.3
			next.atk = Numbers.js_to_int32(float(ally.atk)*1.3)
			commands = [_text(next,-10.0,"강화!","#ff8800",25),_parts(next,"#ff4400",4)]
	return _ready(parent.duplicate(true),commands,{"ally":next})

func plan_zig(actor: Dictionary, distance: float, sp: float, now: float, idle_entered: bool, can_move: Callable) -> Dictionary:
	var error: String = _actor_error(actor,36)
	if not error.is_empty() or not _distance(distance) or not _elapsed(sp) or not is_finite(now):
		return _stop(error if not error.is_empty() else "invalid_zig_context")
	var next: Dictionary = actor.duplicate(true)
	if idle_entered and next._serpentZigT <= 0.0 and distance < 1200.0:
		if not can_move.is_valid():
			return _stop("source_can_move_unbound")
		next._serpentZigT = next._serpentZigCd
		var angle: float = float(next.facing)+sin(now*4.0)*0.8
		var speed: float = float(next.speed)*2.0*_or_one(next.get("_aSpdM"))
		var x: float = float(next.x)+cos(angle)*speed*sp*10.0
		var y: float = float(next.y)+sin(angle)*speed*sp*10.0
		var clear: Variant = can_move.call(x,y,next.r)
		if not clear is bool:
			return _stop("invalid_source_can_move_result")
		if clear:
			next.x = x
			next.y = y
	return _ready(next,[])

func plan_serpent_poison(actor: Dictionary, player: Dictionary, distance: float, sp: float, idle_entered: bool, random_unit: Callable) -> Dictionary:
	var error: String = _actor_error(actor,36)
	if not error.is_empty() or not _distance(distance) or not _elapsed(sp) or not _player_position(player) or not _optional_number(player,"poison"):
		return _stop(error if not error.is_empty() else "invalid_poison_context")
	var next: Dictionary = player.duplicate(true)
	var commands: Array = []
	if idle_entered and distance < 50.0:
		var draw: Dictionary = _sample(random_unit)
		if draw.status != "READY":
			return draw
		if draw.value < 0.1*sp:
			next.poison = (float(next.poison) if next.get("poison") != null else 0.0)+3.0
			commands.append(_text(next,-10.0,"독!","#33aa22",20))
	return _ready(actor.duplicate(true),commands,{"player":next})

## Second independent draw, AFTER poison write/text. Never reuse its random U.
func plan_serpent_tail(actor_at_site: Dictionary, distance: float, sp: float, idle_entered: bool, random_unit: Callable) -> Dictionary:
	var error: String = _actor_error(actor_at_site,36)
	if not error.is_empty() or not _distance(distance) or not _elapsed(sp):
		return _stop(error if not error.is_empty() else "invalid_tail_context")
	if idle_entered and distance < 50.0:
		var draw: Dictionary = _sample(random_unit)
		if draw.status != "READY":
			return draw
		if draw.value < 0.05*sp:
			return _ready(actor_at_site.duplicate(true),[_hurt(float(actor_at_site.atk)*0.6)],{"phase":"after_tail_hurt"})
	return _ready(actor_at_site.duplicate(true),[])

func finish_tail_hit(actor_after_hurt: Dictionary, player_after_hurt: Dictionary) -> Dictionary:
	var error: String = _actor_error(actor_after_hurt,36)
	if not error.is_empty() or not _player_position(player_after_hurt):
		return _stop(error if not error.is_empty() else "invalid_post_tail_context")
	return _ready(actor_after_hurt.duplicate(true),[
		_text(actor_after_hurt,-15.0,"꼬리!","#447733",25),_parts(player_after_hurt,"#447733",6)])

func plan_stealth(actor: Dictionary, distance: float, idle_entered: bool) -> Dictionary:
	var error: String = _actor_error(actor,37)
	if not error.is_empty() or not _distance(distance):
		return _stop(error if not error.is_empty() else "invalid_distance")
	var next: Dictionary = actor.duplicate(true)
	var commands: Array = []
	if idle_entered and not _flag(next,"_cloaked") and next._predStealthT <= 0.0 and distance < 1200.0:
		next._cloaked = true
		next._predStealthT = next._predStealthCd
		commands.append(_text(next,-15.0,"은신...","#cc8855",25))
	return _ready(next,commands)

func plan_ambush(actor: Dictionary, player: Dictionary, distance: float, idle_entered: bool, can_move: Callable) -> Dictionary:
	var error: String = _actor_error(actor,37)
	if not error.is_empty() or not _distance(distance) or not _player_position(player) or not _number(player.get("facing")):
		return _stop(error if not error.is_empty() else "invalid_ambush_context")
	var next: Dictionary = actor.duplicate(true)
	var commands: Array = []
	if idle_entered and _flag(next,"_cloaked") and distance < 1200.0:
		if not can_move.is_valid():
			return _stop("source_can_move_unbound")
		var angle: float = float(player.facing)+PI
		var x: float = float(player.x)+cos(angle)*30.0
		var y: float = float(player.y)+sin(angle)*30.0
		var clear: Variant = can_move.call(x,y,next.r)
		if not clear is bool:
			return _stop("invalid_source_can_move_result")
		if clear:
			next.x = x
			next.y = y
		next._cloaked = false
		next._telegraphT = 20
		next.s = "windup"
		next.st2 = 12
		commands = [_text(next,-15.0,"기습!","#ff6600",30),{"kind":"sfx_charge"}]
		if not _flag(next,"_predAtkBoost"):
			next._predAtkBoost = true
			next._predBaseAtk = next.atk
			next.atk = Numbers.js_to_int32(float(next.atk)*1.5)
	return _ready(next,commands)

## Roll only AFTER ambush/presentation. The caller then scans current ens in order.
func plan_corpse_scan(actor_at_site: Dictionary, sp: float, idle_entered: bool, random_unit: Callable) -> Dictionary:
	var error: String = _actor_error(actor_at_site,37)
	if not error.is_empty() or not _elapsed(sp):
		return _stop(error if not error.is_empty() else "invalid_elapsed_ticks")
	var scan: bool = false
	if idle_entered and actor_at_site._predCorpseHeal > 0.0:
		var draw: Dictionary = _sample(random_unit)
		if draw.status != "READY":
			return draw
		scan = draw.value < 0.01*sp
	return _ready(actor_at_site.duplicate(true),[],{"scan_corpses":scan})

func plan_corpse_candidate(actor_at_site: Dictionary, corpse: Dictionary, current_distance: float, scan_entered: bool) -> Dictionary:
	var error: String = _actor_error(actor_at_site,37)
	if not error.is_empty() or not _player_position(corpse) or not _optional_flag(corpse,"dead"):
		return _stop(error if not error.is_empty() else "invalid_corpse_view")
	var next: Dictionary = actor_at_site.duplicate(true)
	var moved: Dictionary = corpse.duplicate(true)
	var commands: Array = []
	var matched: bool = false
	if scan_entered and _flag(corpse,"dead"):
		if not _distance(current_distance):
			return _stop("missing_current_corpse_distance")
		if current_distance < 60.0:
			matched = true
			next.hp = minf(float(next.mhp),float(next.hp)+Numbers.js_to_int32(float(next.mhp)*float(next._predCorpseHeal)))
			moved.x = -9999
			moved.y = -9999
			commands.append(_parts(next,"#88ff44",6))
	# Stop at the FIRST matched corpse, even when already at max HP.
	return _ready(next,commands,{"corpse":moved,"matched":matched})

func _timers(etype: int) -> Array:
	return ["_beastComboT","_beastRoarT"] if etype == 35 else ["_serpentZigT"] if etype == 36 else ["_predStealthT"]

func _actor_error(actor: Dictionary, expected: int = 0) -> String:
	if typeof(actor.get("etype")) != TYPE_INT or actor.etype not in [35,36,37] or (expected != 0 and actor.etype != expected):
		return "unsupported_etype"
	if not actor.get("ib") is bool or actor.ib or not actor.get("s") is String:
		return "invalid_nonboss_actor_context"
	var fields: Array = ["x","y","atk"] + _timers(actor.etype)
	for field in _timers(actor.etype):
		fields.append(str(field).trim_suffix("T")+"Cd")
	fields += ["hp","stunned"] if actor.etype == 35 else ["facing","speed","r"] if actor.etype == 36 else ["hp","mhp","r","_predCorpseHeal"]
	for field in fields:
		if not _number(actor.get(field)):
			return "missing_actor_"+str(field)
	for field in ["dead","_cloaked","_predAtkBoost"]:
		if not _optional_flag(actor,field):
			return "invalid_actor_"+field
	if not _optional_number(actor,"_aSpdM") or (actor.etype == 35 and not actor.get("col") is String):
		return "invalid_actor_speed_or_color"
	return ""

func _sample(provider: Callable) -> Dictionary:
	if not provider.is_valid():
		return _stop("source_random_unbound")
	var value: Variant = provider.call()
	if not _number(value) or value < 0.0 or value >= 1.0:
		return _stop("invalid_random_sample")
	return {"status":"READY","value":value}

func _hurt(raw: float) -> Dictionary:
	return {"kind":"hurt_player","damage":Numbers.js_to_int32(raw)}
func _text(view: Dictionary, dy: float, text: String, col: String, life: int) -> Dictionary:
	return {"kind":"text","x":view.x,"y":float(view.y)+dy,"text":text,"col":col,"life":life}
func _parts(view: Dictionary, col: String, count: int) -> Dictionary:
	return {"kind":"parts","x":view.x,"y":view.y,"col":col,"count":count}
func _or_one(value: Variant) -> float:
	return 1.0 if value == null or value == 0.0 else float(value)
func _flag(view: Dictionary, key: String) -> bool:
	return view.get(key) == true
func _optional_flag(view: Dictionary, key: String) -> bool:
	return view.get(key) == null or view[key] is bool
func _optional_number(view: Dictionary, key: String) -> bool:
	return view.get(key) == null or _number(view[key])
func _player_position(view: Dictionary) -> bool:
	return _number(view.get("x")) and _number(view.get("y"))
func _number(value: Variant) -> bool:
	return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value))
func _distance(value: float) -> bool:
	return is_finite(value) and value >= 0.0
func _elapsed(value: float) -> bool:
	return is_finite(value) and value >= 0.0
func _ready(actor: Dictionary, commands: Array, extra: Dictionary = {}) -> Dictionary:
	return {"status":"READY","actor":actor,"commands":commands,"phase":"complete","product_connected":false}.merged(extra,true)
func _stop(reason: String) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"commands":[],"product_connected":false}
