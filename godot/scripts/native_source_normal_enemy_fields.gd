extends RefCounted

# One actual source invocation, with only its local four-cursor prefix. It is not
# a global clock, attack limit, transaction, rollback or full hurtE producer.
const STREAMS := ["enemy_writes", "owner_requests", "presentation"]
const CURSORS := ["enemy_writes", "owner_requests", "presentation", "events"]
var _world: WeakRef
var _actor: WeakRef
var _closed := false
var _cursor := {"enemy_writes": 0, "owner_requests": 0, "presentation": 0, "events": 0}
var _applying: Dictionary = {}
var _last_field := ""
var _poise_call_entered := false
var _applying_poise := false

func configure(world: Node, actor: Node) -> void:
	_world = weakref(world)
	_actor = weakref(actor)

func is_applying_item(actor: Node, item: Dictionary) -> bool:
	return not _closed and _actor.get_ref() == actor and not _applying.is_empty() and is_same(_applying, item)

func follows_recover_transition() -> bool:
	return not _closed and _last_field == "s"

func get_cursors() -> Dictionary:
	return _cursor.duplicate()

func close() -> void:
	_closed = true
	_applying = {}
	_applying_poise = false

func consume_prefix(packet: Variant) -> Dictionary:
	var world: Variant = _world.get_ref() if _world != null else null
	var actor: Variant = _actor.get_ref() if _actor != null else null
	if _closed or not is_instance_valid(world) or not is_instance_valid(actor) or not world.is_native_normal_enemy_field_call_current(self, actor): return _stop("actual_source_field_call_not_current")
	if not packet is Dictionary or not packet.get("from") is Dictionary or not packet.get("events") is Array: return _stop("source_prefix_shape")
	for key in CURSORS:
		if not packet["from"].has(key) or typeof(packet["from"][key]) != TYPE_INT or packet["from"][key] != _cursor[key]: return _stop("source_prefix_stale_or_invalid_cursor:" + key)
	for stream in STREAMS:
		if not packet.get(stream) is Array: return _stop("source_prefix_stream_shape:" + stream)
	for event in packet["events"]:
		if not event is Dictionary or typeof(event.get("seq")) != TYPE_INT or event["seq"] != _cursor["events"] or not event.get("stream") is String or typeof(event.get("index")) != TYPE_INT or typeof(event.get("line")) != TYPE_INT: return _stop("source_event_shape_or_order")
		var stream: String = event["stream"]
		if stream not in STREAMS or event["index"] != _cursor[stream]: return _stop("source_event_stream_or_index")
		var local_index: int = event["index"] - packet["from"][stream]
		if local_index < 0 or local_index >= packet[stream].size(): return _stop("source_event_item_missing")
		var item: Variant = packet[stream][local_index]
		if not item is Dictionary or typeof(item.get("line")) != TYPE_INT or item["line"] != event["line"]: return _stop("source_event_item_line_mismatch")
		var result: Dictionary
		if stream == "enemy_writes":
			_applying = item
			result = actor.commit_native_source_damage_field(self, item)
		elif stream == "owner_requests" and item.get("kind") is String and item["kind"] == "enemy.kb_add":
			_applying = item
			result = actor.commit_native_source_kb_add(self, item)
		else:
			return _stop("source_effect_owner_unbound:" + stream + ":" + str(item.get("kind")))
		_applying = {}
		if not result.get("applied") is bool or not result["applied"]: return _stop(str(result.get("reason", "source_field_owner_refused")))
		_last_field = item["field"] if stream == "enemy_writes" else ""
		_cursor[stream] += 1
		_cursor["events"] += 1
	# Reject dangling items; applied prefix stays applied and is reported exactly.
	for stream in STREAMS:
		if _cursor[stream] - packet["from"][stream] != packet[stream].size(): return _stop("source_prefix_dangling_items:" + stream)
	return {"ok": true, "prefix_applied": true, "applied_prefix": get_cursors(), "parent_fields": actor.read_native_source_damage_fields(world), "full_hurtE_ready": false}

func _stop(reason: String) -> Dictionary:
	return {"ok": false, "prefix_applied": false, "reason": reason,
		"applied_prefix": get_cursors(), "full_hurtE_ready": false}

func get_poise_hit_callable() -> Callable:
	var world: Variant = _world.get_ref() if _world != null else null
	var actor: Variant = _actor.get_ref() if _actor != null else null
	if _closed or not is_instance_valid(world) or not is_instance_valid(actor) or not world.is_native_normal_enemy_field_call_current(self, actor): return Callable()
	return Callable(self, "poise_hit")

func is_applying_poise(actor: Node) -> bool:
	return not _closed and _applying_poise and _actor.get_ref() == actor

# v3 owners.poise_hit(call) at 42490. Parent stream cursors and the separate
# synchronous owner core are reported independently; a core write is not a
# parent enemy_writes event and never advances those four cursors.
func poise_hit(call: Variant) -> Dictionary:
	var world: Variant = _world.get_ref() if _world != null else null
	var actor: Variant = _actor.get_ref() if _actor != null else null
	if _closed or not is_instance_valid(world) or not is_instance_valid(actor) or not world.is_native_normal_enemy_field_call_current(self, actor): return _poise_stop("actual_source_poise_call_not_current")
	if _poise_call_entered: return _poise_stop("source_poise_sync_call_already_entered")
	if not call is Dictionary or not call.get("kind") is String or call["kind"] != "poise_hit" or typeof(call.get("line")) != TYPE_INT or call["line"] != 42490 or typeof(call.get("amt")) != TYPE_INT: return _poise_stop("source_poise_42490_call_shape")
	_poise_call_entered = true
	var prefix: Dictionary = consume_prefix(call.get("commit"))
	if prefix.get("ok") != true:
		prefix["source_body_returned"] = false
		prefix["poise_core_applied"] = false
		prefix["executed"] = 0
		return prefix
	_applying_poise = true
	var core: Dictionary = actor.apply_native_source_poise_hit(self, call["amt"])
	_applying_poise = false
	var result: Dictionary = {"ok": false, "prefix_applied": true,
		"applied_prefix": get_cursors(), "executed": 1 if core.get("source_branch_entered") == true else 0,
		"poise_core_applied": core.get("poise_core_applied") == true,
		"source_body_returned": core.get("source_body_returned") == true,
		"full_hurtE_ready": false, "source_clock_ready": false}
	var fields: Dictionary = actor.read_native_source_damage_fields(world)
	result["parent_fields"] = fields
	if core.get("ready") == true and core.get("source_body_returned") == true and core.get("source_return") is bool and fields.get("ready") == true:
		result["ok"] = true
		result["staggered"] = core["source_return"]
		result["parent_view"] = fields["view"]
	else:
		result["reason"] = str(core.get("reason", "source_poise_fresh_view_unavailable"))
		if core.has("core_staggered"): result["core_staggered"] = core["core_staggered"]
		if core.has("next_source_line"): result["next_source_line"] = core["next_source_line"]
	return result

func _poise_stop(reason: String) -> Dictionary:
	var result: Dictionary = _stop(reason)
	result["poise_core_applied"] = false
	result["source_body_returned"] = false
	result["executed"] = 0
	return result
