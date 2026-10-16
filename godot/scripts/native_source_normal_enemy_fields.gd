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
		if stream != "enemy_writes": return _stop("source_effect_owner_unbound:" + stream + ":" + str(item.get("kind")))
		_applying = item
		var result: Dictionary = actor.commit_native_source_damage_field(self, item)
		_applying = {}
		if not result.get("applied") is bool or not result["applied"]: return _stop(str(result.get("reason", "source_field_owner_refused")))
		_last_field = item["field"]
		_cursor[stream] += 1
		_cursor["events"] += 1
	# Reject dangling items; applied prefix stays applied and is reported exactly.
	for stream in STREAMS:
		if _cursor[stream] - packet["from"][stream] != packet[stream].size(): return _stop("source_prefix_dangling_items:" + stream)
	return {"ok": true, "prefix_applied": true, "applied_prefix": get_cursors(), "parent_fields": actor.read_native_source_damage_fields(world), "full_hurtE_ready": false}

func _stop(reason: String) -> Dictionary:
	return {"ok": false, "prefix_applied": false, "reason": reason,
		"applied_prefix": get_cursors(), "full_hurtE_ready": false}
