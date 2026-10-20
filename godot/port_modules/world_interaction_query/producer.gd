extends RefCounted
## NW-01: readonly query for the first MAP_OBJS interaction candidate.
## Source action body: game.html:32829-32853; distance:31723; outer gate:32827.
## Does not install data, consume input, apply actions, or block later chest/bulk pickup.

const SOURCE := "game.html:32829–32853"
const SOURCE_SHA256 := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const FRAGMENT_SHA256 := "9eea8397b33211a9a7b4ba18372d4fb60a5ab6cffa497687254d47b66d6c265f"


func query_map_object(player_xy: Variant, ordered_objects: Variant, interact_pressed: Variant, portal_used: Variant) -> Dictionary:
	if typeof(interact_pressed) != TYPE_BOOL or typeof(portal_used) != TYPE_BOOL:
		return _result(false, null, null, "gate_type")
	if not interact_pressed or portal_used:
		return _result(true)
	if not ordered_objects is Array:
		return _result(false, null, null, "objects_not_array")
	if not _finite_xy(player_xy):
		return _result(false, null, null, "player_xy_not_finite")
	for index in ordered_objects.size():
		var entry: Variant = ordered_objects[index]
		if not entry is Dictionary:
			return _result(false, null, null, "entry_not_dictionary")
		var kind: Variant = entry.get("type")
		if typeof(kind) != TYPE_STRING:
			return _result(false, null, null, "entry_type_not_string")
		if kind != "bonfire" and kind != "lore" and kind != "breakable" and kind != "altar":
			continue
		var flag_name: String = "read" if kind == "lore" else ("used" if kind == "altar" else "alive")
		if kind != "bonfire":
			var flag: Variant = entry.get(flag_name)
			if flag != null and typeof(flag) != TYPE_BOOL:
				return _result(false, null, null, "flag_unsupported")
			if (kind == "breakable" and flag != true) or (kind != "breakable" and flag == true):
				continue
		if not _finite_xy(entry):
			return _result(false, null, null, "entry_xy_not_finite")
		# Convert before subtraction: JS Number arithmetic, not int64 overflow.
		var dx: float = float(entry["x"]) - float(player_xy["x"])
		var dy: float = float(entry["y"]) - float(player_xy["y"])
		var distance: float = sqrt(dx * dx + dy * dy)
		if distance < (50.0 if kind == "breakable" else 60.0):
			return _result(true, index, kind)
	return _result(true)


func provenance() -> Dictionary:
	return {"file": "game.html", "start_line": 32828, "end_line": 32853,
		"source_sha256": SOURCE_SHA256, "fragment_sha256": FRAGMENT_SHA256,
		"connected": false}


func _finite_xy(value: Variant) -> bool:
	if not value is Dictionary:
		return false
	for key in ["x", "y"]:
		var number: Variant = value.get(key)
		if (typeof(number) != TYPE_INT and typeof(number) != TYPE_FLOAT) or not is_finite(float(number)):
			return false
	return true


func _result(ready: bool, index: Variant = null, kind: Variant = null, reason: Variant = null) -> Dictionary:
	return {"ready": ready, "matched": index != null, "source_index": index,
		"type": kind, "reason": reason, "source": SOURCE}
