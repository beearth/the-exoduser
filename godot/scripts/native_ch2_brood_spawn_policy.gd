extends RefCounted
## EC2-05: game.html 39237–39247, type38 brood branch only.
## Pure copies/requests; no mkEn, actor birth, ens/World/region/save writer.
## Continuations leave constructor RNG/side effects BETWEEN each coordinate pair.

func advance_spawn_clock(actor: Dictionary, sp: float) -> Dictionary:
	var error: String = _actor_error(actor)
	if not error.is_empty() or not is_finite(sp) or sp < 0.0:
		return _stop(error if not error.is_empty() else "invalid_elapsed_ticks")
	var next: Dictionary = actor.duplicate(true)
	var idle_entered: bool = actor.s == "idle"
	if idle_entered:
		next._broodSpawnT = float(next._broodSpawnT) - sp
	return {"status":"READY","actor":next,"idle_entered":idle_entered,"commands":[],"product_connected":false}

## Call after BOTH spawn and existing EC2-03 gas clocks advanced (39238).
## array_length is ens.length, including dead entries, NOT alive count.
## Capacity is checked ONCE, before drawing count, never inside the batch.
func begin_batch(actor: Dictionary, array_length: int, idle_entered: bool, random_unit: Callable) -> Dictionary:
	var error: String = _actor_error(actor)
	if not error.is_empty() or array_length < 0:
		return _stop(error if not error.is_empty() else "invalid_enemy_array_length")
	var next: Dictionary = actor.duplicate(true)
	if not idle_entered or next._broodSpawnT > 0.0 or array_length >= 200:
		return _result({"phase":"complete","count":0,"index":0}, [], 0).merged({"actor":next})
	if not random_unit.is_valid():
		return _stop("source_random_unbound")
	# Reset precedes count RNG in the source. Only a copy is changed here.
	next._broodSpawnT = next._broodSpawnCd
	var draw: Dictionary = _sample(random_unit)
	if draw.status != "READY":
		return draw
	var count: int = 2 + int(float(draw.value) * 2.0)
	return _result({"phase":"coordinates","count":count,"index":0}, [], 1).merged({"actor":next})

## Supply fresh e and G.stage at EACH iteration, after the previous constructor
## and push have returned. A constructor can consume RNG or change source views.
## Missing _ri is undefined, distinct from room/null/-1; never substitute e.room.
func plan_child(batch: Dictionary, actor_at_site: Dictionary, stage_at_site: int, random_unit: Callable) -> Dictionary:
	var error: String = _batch_error(batch, "coordinates")
	if error.is_empty():
		error = _actor_error(actor_at_site)
	if not error.is_empty():
		return _stop(error)
	if stage_at_site < 4 or stage_at_site > 9:
		return _stop("unsupported_ch2_stage")
	if not random_unit.is_valid():
		return _stop("source_random_unbound")
	var x_draw: Dictionary = _sample(random_unit)
	if x_draw.status != "READY":
		return x_draw
	var y_draw: Dictionary = _sample(random_unit)
	if y_draw.status != "READY":
		y_draw.draws = 2
		return y_draw
	var request: Dictionary = {"kind":"mk_en","x":float(actor_at_site.x)+(float(x_draw.value)-0.5)*40.0,
		"y":float(actor_at_site.y)+(float(y_draw.value)-0.5)*40.0,"stage":stage_at_site,"etype":33,"ib":false,
		"el":actor_at_site.el if actor_at_site.get("el") != null and actor_at_site.el != 0 else 0}
	if actor_at_site.has("_ri"):
		request.room = actor_at_site._ri
	var next: Dictionary = batch.duplicate(true)
	next.phase = "await_constructor"
	return _result(next, [request], 2)

## Source mkEn returns an object or null (31120–31364). Empty Dictionary still
## means a JS truthy object; do not use GDScript container truthiness here.
## This receipt is supplied by the owner; it is NOT proof of an actual birth.
func resume_child(batch: Dictionary, returned_child: Variant) -> Dictionary:
	var error: String = _batch_error(batch, "await_constructor")
	if not error.is_empty():
		return _stop(error)
	if returned_child != null and not returned_child is Dictionary:
		return _stop("invalid_constructor_return")
	var commands: Array = []
	if returned_child != null:
		commands.append({"kind":"append_enemy","actor":returned_child.duplicate(true)})
	var next: Dictionary = batch.duplicate(true)
	next.index += 1
	next.phase = "coordinates" if next.index < next.count else "presentation"
	return _result(next, commands, 0)

## Presentation is after ALL constructor attempts, even when every one failed.
## Read current coordinates then; do not prebuild it before constructor calls.
func finish_batch(batch: Dictionary, actor_at_site: Dictionary) -> Dictionary:
	var error: String = _batch_error(batch, "presentation")
	if error.is_empty():
		error = _actor_error(actor_at_site)
	if not error.is_empty():
		return _stop(error)
	var next: Dictionary = batch.duplicate(true)
	next.phase = "complete"
	return _result(next, [
		{"kind":"text","x":actor_at_site.x,"y":float(actor_at_site.y)-20.0,"text":"산란!","col":"#cc8866","life":30},
		{"kind":"parts","x":actor_at_site.x,"y":actor_at_site.y,"col":"#dd6644","count":8}], 0)

func _sample(provider: Callable) -> Dictionary:
	var value: Variant = provider.call()
	if not _number(value) or float(value) < 0.0 or float(value) >= 1.0:
		return _stop("invalid_random_sample", 1)
	return {"status":"READY","value":value,"draws":1}

func _actor_error(actor: Dictionary) -> String:
	if typeof(actor.get("etype")) != TYPE_INT or actor.etype != 38:
		return "unsupported_etype"
	if not actor.get("ib") is bool or actor.ib or not actor.get("s") is String:
		return "invalid_nonboss_actor_context"
	for key in ["x","y","_broodSpawnT","_broodSpawnCd"]:
		if not _number(actor.get(key)):
			return "missing_actor_" + key
	if actor.has("el") and actor.el != null and (typeof(actor.el) != TYPE_INT or actor.el < 0 or actor.el > 6):
		return "invalid_actor_element"
	if actor.has("_ri") and actor._ri != null and typeof(actor._ri) != TYPE_INT:
		return "invalid_actor_region"
	return ""

func _batch_error(batch: Dictionary, phase: String) -> String:
	if batch.get("phase") != phase or typeof(batch.get("count")) != TYPE_INT or typeof(batch.get("index")) != TYPE_INT:
		return "invalid_batch_continuation"
	if batch.count not in [2,3] or batch.index < 0 or batch.index > batch.count:
		return "invalid_batch_continuation"
	if (phase == "presentation") != (batch.index == batch.count):
		return "invalid_batch_continuation"
	return ""

func _number(value: Variant) -> bool:
	return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value))

func _result(batch: Dictionary, commands: Array, draws: int) -> Dictionary:
	return {"status":"READY","batch":batch,"commands":commands,"draws":draws,"product_connected":false,"complete_actor":false}

func _stop(reason: String, draws: int = 0) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"commands":[],"draws":draws,"product_connected":false}
