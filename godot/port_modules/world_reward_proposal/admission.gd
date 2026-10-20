extends RefCounted
## Pure _wiPush proposal (game.html:16721). No owner, playback or generator.
## Supported records: String type, bool/null flags, finite/null item rarity.
static func finite(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func flag(value: Variant) -> bool:
	return value == null or typeof(value) == TYPE_BOOL

static func sound_request(record: Dictionary) -> Variant:
	if not record.get("type") is String: return "record_type_not_string"
	if record.type != "item" or record.get("item") == null: return null
	if not record.item is Dictionary or not flag(record.get("_dropPreview")): return "item_or_preview_unsupported"
	if record.get("_dropPreview") == true: return null
	var rarity: Variant = record.item.get("rarity")
	if rarity != null and not finite(rarity): return "rarity_not_finite"
	if not finite(record.get("x")) or not finite(record.get("y")): return "sound_xy_not_finite"
	return [rarity if rarity != null else 0, record.x, record.y]

static func rank_record(record: Variant) -> Variant:
	if not record is Dictionary or not record.get("type") is String: return "record_type_not_string"
	if record.type == "chest":
		if not flag(record.get("picked")): return "picked_unsupported"
		if record.get("picked") != true:
			if not flag(record.get("opened")): return "opened_unsupported"
			if record.get("opened") != true: return INF
	if record.type != "item": return -1
	if record.get("item") == null: return 0
	if not record.item is Dictionary: return "item_unsupported"
	var rarity: Variant = record.item.get("rarity")
	return (rarity if rarity != null else 0) if rarity == null or finite(rarity) else "rarity_not_finite"

func propose(records: Variant, incoming: Variant) -> Dictionary:
	var out := {"ready": false, "reason": null, "world_items_after": [], "commands": []}
	if not records is Array or not incoming is Dictionary:
		out.reason = "array_or_record_unsupported"
		return out
	var sound: Variant = sound_request(incoming)
	if sound is String:
		out.reason = sound
		return out
	var items: Array = records.duplicate(true)
	var record: Dictionary = incoming.duplicate(true)
	items.append(record)
	var commands: Array = [{"op": "append", "record": record.duplicate(true)}]
	if sound is Array: commands.append({"op": "call", "name": "playItemDropSfx", "args": sound})
	while items.size() > 20:
		var mi := 0
		var mr := INF
		for i in items.size():
			var rank: Variant = rank_record(items[i])
			if rank is String:
				out.reason = rank
				return out
			if float(rank) < mr:
				mr = float(rank)
				mi = i
		commands.append({"op": "swap_tail", "index": mi, "tail_index": items.size() - 1})
		items[mi] = items[-1]
		items.resize(items.size() - 1)
		commands.append({"op": "resize", "length": items.size()})
	out.merge({"ready": true, "world_items_after": items, "commands": commands}, true)
	return out
