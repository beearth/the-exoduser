extends RefCounted
## EC3-05 / G39337–39356. Pure requests and read-only queries, no actual writer.
## Owner must apply/ack each request before resume. No deadpool/registry ownership.
const Draws = preload("res://scripts/native_ch2_enemy_constructor_policy.gd")
const Formula = preload("res://port_modules/combat_stat_formula/producer.gd")
const Truth = preload("res://port_modules/equipment_affix_reader/producer.gd")
const OWNER = "EC3-05/v1"
const FIRE = {"owner":"EC3-05/v1","entry":"fire"}

func begin(actor: Dictionary, context: Dictionary) -> Dictionary:
	if not _actor(actor) or not _num(context.get("d")) or not _num(context.get("sp")) or context.d < 0 or context.sp < 0:
		return _fail("invalid_tick_snapshot",0)
	if actor.s != "idle":
		return _done({"e":actor.duplicate(true),"draws":0})
	var t: Dictionary = {"owner":OWNER,"e":actor.duplicate(true),"d":context.d,"index":0,"seq":0,"draws":0,"stage":"after_clock"}
	return _request(t,"actor_fields",39338,{"fields":{"_fmAbsorbCd":actor._fmAbsorbCd-context.sp,"_fmSpitT":actor._fmSpitT-context.sp}})

## readers: length(), entry(index)->opaque String ref, dead(ref)->{present,value},
## coordinate(ref,axis)->float, actor("heal")->full snapshot, hypot(dx,dy)->source float64.
## No array snapshot, alive fallback, sorting, pooled corpse or position writer.
func resume(token: Dictionary, response: Dictionary, random_unit: Callable, readers: Dictionary) -> Dictionary:
	if token.get("owner") != OWNER or not token.get("pending") is Dictionary or not token.get("e") is Dictionary or not _actor(token.e) or not _num(token.get("d")) or not token.get("index") is int or not token.get("seq") is int or not token.get("draws") is int or token.get("stage") not in ["after_clock","scan","corpse_x","corpse_y","parts","spit","done"]:
		return _fail("invalid_continuation",0)
	var t: Dictionary = token.duplicate(true)
	var p: Dictionary = t.pending
	if not p.get("op") is String or p.get("seq") != t.seq:
		return _fail("invalid_pending_request",t.draws)
	if p.op in ["actor_fields","arm_spit"] and not p.get("fields") is Dictionary:
		return _fail("invalid_pending_request",t.draws)
	if p.op == "corpse_field" and (not p.get("ref") is String or p.get("field") not in ["x","y"] or p.get("value") != -9999.0):
		return _fail("invalid_pending_request",t.draws)
	if response.get("ack") != true or response.get("seq") != t.seq or response.get("op") != p.op:
		return _fail("owner_ack_missing_or_stale",t.draws)
	if not response.get("actor_after") is Dictionary or not _actor(response.actor_after):
		return _fail("actor_readback_missing",t.draws)
	if p.op in ["actor_fields","arm_spit"]:
		if response.get("applied") != true:
			return _fail("actor_write_unconfirmed",t.draws)
		for key in p.fields:
			if response.actor_after.get(key) != p.fields[key]:
				return _fail("actor_write_readback_mismatch",t.draws)
		if p.op == "arm_spit" and response.get("fire_binding") != FIRE:
			return _fail("fire_binding_unconfirmed",t.draws)
	elif p.op == "corpse_field":
		if response.get("applied") != true or response.get("ref") != p.ref or not response.get("corpse_after") is Dictionary or not _num(response.corpse_after.get("x")) or not _num(response.corpse_after.get("y")) or response.corpse_after.get(p.field) != p.value:
			return _fail("corpse_write_unconfirmed",t.draws)
		if p.ref == "actor" and response.actor_after.get(p.field) != p.value:
			return _fail("aliased_actor_readback_mismatch",t.draws)
	elif p.op == "addParts":
		if response.get("executed") != true:
			return _fail("effect_unconfirmed",t.draws)
	else:
		return _fail("unknown_pending_operation",t.draws)
	t.e = response.actor_after.duplicate(true)
	t.erase("pending")
	match t.stage:
		"after_clock":
			if t.e._fmAbsorbCd <= 0:
				if not random_unit.is_valid():
					return _fail("invalid_random_callable",t.draws)
				var draw := Draws.Draws.new(random_unit)
				var cd: float = 180.0 + draw.sample()*60.0
				t.draws += draw.count
				if not draw.error.is_empty():
					return _fail(draw.error,t.draws)
				t.stage = "scan"
				return _request(t,"actor_fields",39341,{"fields":{"_fmAbsorbCd":cd}})
			t.stage = "spit"
		"corpse_x":
			t.stage = "corpse_y"
			return _request(t,"corpse_field",39345,{"ref":t.corpse,"field":"x","value":-9999.0})
		"corpse_y":
			t.stage = "parts"
			return _request(t,"corpse_field",39345,{"ref":t.corpse,"field":"y","value":-9999.0})
		"parts":
			t.stage = "spit"
			return _request(t,"addParts",39346,{"position_ref":"actor","col":"#ff6644","count":8})
		"done":
			return _done(t)
	if t.stage == "scan":
		for name in ["length","entry","dead","coordinate","actor","hypot"]:
			if not readers.get(name) is Callable or not readers[name].is_valid():
				return _fail("missing_reader_"+name,t.draws)
		while true:
			var length: Variant = readers.length.call()
			if not length is int or length < 0:
				return _fail("invalid_ens_length",t.draws)
			if t.index >= length:
				break
			var ref: Variant = readers.entry.call(t.index)
			if not ref is String or ref.is_empty():
				return _fail("invalid_ens_entry_reference",t.draws)
			var dead: Variant = readers.dead.call(ref)
			if not dead is Dictionary or not dead.get("present") is bool or (dead.present and not dead.has("value")):
				return _fail("dead_reader_incomplete",t.draws)
			if dead.present and Truth.js_truthy(dead.value):
				# Original property read order, including a corpse aliasing actor.
				var coordinates: Array = []
				for site in [[ref,"x"],["actor","x"],[ref,"y"],["actor","y"]]:
					var coordinate: Variant = readers.coordinate.call(site[0],site[1])
					if not _num(coordinate):
						return _fail("distance_readback_missing",t.draws)
					coordinates.append(float(coordinate))
				var distance: Variant = readers.hypot.call(coordinates[0]-coordinates[1],coordinates[2]-coordinates[3])
				if not _num(distance) or distance < 0:
					return _fail("invalid_source_hypot",t.draws)
				if distance < 80.0:
					var current: Variant = readers.actor.call("heal")
					if not current is Dictionary or not _actor(current):
						return _fail("heal_readback_missing",t.draws)
					t.e = current.duplicate(true)
					t.corpse = ref
					t.stage = "corpse_x"
					var hp: float = minf(float(current.mhp),float(current.hp)+Formula.js_to_int32(float(current.mhp)*0.15))
					return _request(t,"actor_fields",39344,{"fields":{"hp":hp}})
			t.index += 1
		t.stage = "spit"
	if t.stage == "spit":
		if t.e._fmSpitT <= 0.0 and t.d < 1200.0 and t.d > 60.0:
			t.stage = "done"
			return _request(t,"arm_spit",39351,{"fields":{"_fmSpitT":t.e._fmSpitCd,"s":"eShootWind","st2":60.0,"_swChargeEl":3},"fire_binding":FIRE.duplicate()})
		return _done(t)
	return _fail("invalid_stage",t.draws)

## Execute only when the actual windup owner invokes the installed callback.
## Reads CURRENT P now; no captured entry angle/target, no projectile/FX writer.
func fire(actor: Dictionary, read_player: Callable) -> Dictionary:
	if not _num(actor.get("etype")) or actor.etype != 42 or not _num(actor.get("x")) or not _num(actor.get("y")) or not read_player.is_valid():
		return _fail("invalid_fire_context",0)
	var p: Variant = read_player.call()
	if not p is Dictionary or not _num(p.get("x")) or not _num(p.get("y")):
		return _fail("current_player_missing",0)
	return {"status":"READY","commands":[{"op":"eProjAt","angle":atan2(float(p.y)-float(actor.y),float(p.x)-float(actor.x)),"speed":2.5,"dmg_mul":0.8,"el":3,"life":200,"col":"#dd4466","size":5}, {"op":"addTxt","position_ref":"actor","offset_y":-15.0,"text_key":"분비!","col":"#882233","life":25}],"draws":0,"full_tick":false,"product_connected":false}

func _request(t: Dictionary, op: String, line: int, data: Dictionary) -> Dictionary:
	t.seq += 1
	var command: Dictionary = {"op":op,"source_line":line,"seq":t.seq}
	command.merge(data)
	t.pending = command.duplicate(true)
	return {"status":"READY","done":false,"command":command,"continuation":t,"draws":t.draws,"full_tick":false,"product_connected":false}
func _done(t: Dictionary) -> Dictionary:
	return {"status":"READY","done":true,"actor":t.e.duplicate(true),"draws":t.draws,"full_tick":false,"product_connected":false}
func _num(v: Variant) -> bool:
	return (typeof(v) == TYPE_INT or typeof(v) == TYPE_FLOAT) and is_finite(float(v))
func _actor(e: Dictionary) -> bool:
	if not _num(e.get("etype")) or e.etype != 42 or not e.get("s") is String:
		return false
	for key in ["x","y","hp","mhp","st2","_fmAbsorbCd","_fmSpitT","_fmSpitCd"]:
		if not _num(e.get(key)):
			return false
	return true
func _fail(reason: String, draws: int) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"draws":draws,"full_tick":false,"product_connected":false}
