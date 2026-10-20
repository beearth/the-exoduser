extends RefCounted
## EC4-04: G39521–39523 trigger; G42827–42835 death continuation DATA only.
## No native mkEn/registry/FX owner exists for this unit: every death result is
## PLAN + HOLD, never evidence of a birth. EC2-05 continuation shape reference;
## CH2 count/cap/null-skip/etype33/_ri/element fallback are NOT shared semantics.
const Constructor = preload("res://scripts/native_ch2_enemy_constructor_policy.gd")
const Formula = preload("res://port_modules/combat_stat_formula/producer.gd")
const Truth = preload("res://port_modules/equipment_affix_reader/producer.gd")

func trigger(actor: Dictionary, d: float) -> Dictionary:
	if not _number(actor.get("etype")) or actor.etype != 51:
		return _stop("unsupported_etype")
	if not actor.get("s") is String or not _number(actor.get("r")) or actor.r < 0 or not is_finite(d) or d < 0:
		return _stop("invalid_trigger_context")
	var active: bool = actor.s == "idle" and d < 35.0+float(actor.r)
	return {"status":"READY","fields":{"_telegraphT":20,"s":"windup","st2":20} if active else {},"draws":0,"full_tick":false,"product_connected":false}

func begin_death(parent: Dictionary) -> Dictionary:
	if not _number(parent.get("etype")) or parent.etype != 51:
		return _stop("unsupported_etype")
	# G42827: outer gate ONCE. Later callbacks may change parent source views.
	var active: bool = not Truth.js_truthy(parent.get("_amalgSplit"))
	return _plan({"phase":"coordinates" if active else "complete","count":2,"index":0},[],0)

func plan_child(batch: Dictionary, parent_at_site: Dictionary, stage_at_site: int, random_unit: Callable) -> Dictionary:
	if not _batch_ok(batch,"coordinates"):
		return _stop("invalid_batch_continuation")
	if not _number(parent_at_site.get("x")) or not _number(parent_at_site.get("y")) or stage_at_site < 0:
		return _stop("invalid_coordinate_context")
	if not random_unit.is_valid():
		return _stop("invalid_random_callable")
	var draws := Constructor.Draws.new(random_unit)
	var angle: float = PI*float(batch.index)+draws.sample() # G42829: angle FIRST.
	if not draws.error.is_empty():
		return _stop(draws.error,draws.count)
	var distance: float = 18.0+draws.sample()*8.0
	if not draws.error.is_empty():
		return _stop(draws.error,draws.count)
	var x: float = float(parent_at_site.x)+cos(angle)*distance
	var y: float = float(parent_at_site.y)+sin(angle)*distance
	if not is_finite(x) or not is_finite(y):
		return _stop("nonfinite_coordinate",draws.count)
	# G42830: seven positional args; missing keys mean undefined, not null.
	var request: Dictionary = {"kind":"mk_en","x":x,"y":y,"stage":stage_at_site,"etype":50,"ib":false,"argc":7}
	for key in ["el","room"]:
		if parent_at_site.has(key):
			request[key] = parent_at_site[key]
	var next: Dictionary = batch.duplicate(true)
	next.phase = "await_constructor"
	return _plan(next,[request],draws.count)

func resume_constructor(batch: Dictionary, child_receipt: Variant, parent_at_post: Dictionary) -> Dictionary:
	if not _batch_ok(batch,"await_constructor"):
		return _stop("invalid_batch_continuation")
	if child_receipt == null:
		# G42831: ne.hp dereference throws. No skip, next child, push or text.
		var halted: Dictionary = batch.duplicate(true)
		halted.phase = "halted"
		return {"status":"SOURCE_FAILURE","reason":"null_constructor_return","source_line":42831,"write_site":"ne.hp","batch":halted,"commands":[],"draws":0,"execution":"HOLD","product_connected":false,"complete_actor":false}
	if not child_receipt is Dictionary or not _number(child_receipt.get("hp")) or not _number(child_receipt.get("speed")) or not _number(parent_at_post.get("r")) or parent_at_post.r < 0:
		return _stop("incomplete_constructor_receipt")
	var child: Dictionary = child_receipt.duplicate(true)
	# G42831: CHILD current HP, then PARENT current radius, not catalog/parent HP.
	child.hp = Formula.js_to_int32(float(child.hp)*0.35)
	child.mhp = child.hp
	child.eShield = 0
	child.eShieldMax = 0
	child.r = maxi(5,Formula.js_to_int32(float(parent_at_post.r)*0.6))
	child.speed = float(child.speed)*1.3
	child._amalgSplit = true
	if not is_finite(child.speed):
		return _stop("nonfinite_child_speed")
	var next: Dictionary = batch.duplicate(true)
	next.phase = "await_append"
	return _plan(next,[{"kind":"append_enemy","actor":child}],0)

func resume_append(batch: Dictionary, child_after_append: Dictionary, parent_after_append: Dictionary) -> Dictionary:
	if not _batch_ok(batch,"await_append"):
		return _stop("invalid_batch_continuation")
	if not _number(child_after_append.get("x")) or not _number(child_after_append.get("y")):
		return _stop("missing_post_append_position")
	# G42832: append may change source views; sample child XY and parent col NOW.
	var parts: Dictionary = {"kind":"parts","x":child_after_append.x,"y":child_after_append.y,"count":6}
	if parent_after_append.has("col"):
		parts.col = parent_after_append.col
	var next: Dictionary = batch.duplicate(true)
	next.phase = "await_parts"
	return _plan(next,[parts],0)

func resume_parts(batch: Dictionary) -> Dictionary:
	if not _batch_ok(batch,"await_parts"):
		return _stop("invalid_batch_continuation")
	var next: Dictionary = batch.duplicate(true)
	next.index += 1
	next.phase = "coordinates" if next.index < 2 else "presentation"
	return _plan(next,[],0)

func finish_batch(batch: Dictionary, parent_at_text: Dictionary) -> Dictionary:
	if not _batch_ok(batch,"presentation"):
		return _stop("invalid_batch_continuation")
	if not _number(parent_at_text.get("x")) or not _number(parent_at_text.get("y")):
		return _stop("missing_presentation_position")
	var next: Dictionary = batch.duplicate(true)
	next.phase = "complete"
	return _plan(next,[{"kind":"text","x":parent_at_text.x,"y":float(parent_at_text.y)-15.0,"text_key":"분리!","col":"#884455","life":30}],0)

func _batch_ok(b: Dictionary, phase: String) -> bool:
	if b.get("phase") != phase or typeof(b.get("count")) != TYPE_INT or b.count != 2 or typeof(b.get("index")) != TYPE_INT:
		return false
	return b.index == 2 if phase == "presentation" else b.index >= 0 and b.index < 2
func _number(v: Variant) -> bool:
	return (typeof(v) == TYPE_INT or typeof(v) == TYPE_FLOAT) and is_finite(float(v))
func _plan(batch: Dictionary, commands: Array, draws: int) -> Dictionary:
	return {"status":"PLAN","batch":batch,"commands":commands,"draws":draws,"execution":"HOLD","product_connected":false,"complete_actor":false}
func _stop(reason: String, draws: int = 0) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"draws":draws,"execution":"HOLD","product_connected":false}
