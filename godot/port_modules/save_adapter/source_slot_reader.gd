extends RefCounted
## Pure fixture readers. No filesystem, HTTP, namespace selection, save/restore,
## owner installation or migration. Target labels must be explicitly supplied.
const TARGETS := ["dev_server", "nw_native"]
const MAX_JSON_DEPTH := 128 # Unsupported deeper inputs HOLD, not 'missing/corrupt'.

class StrictJSON extends RefCounted:
	var source := ""
	var at := 0
	var held := ""
	func space() -> void:
		while at < source.length() and source[at] in [" ", "\t", "\r", "\n"]: at += 1
	func take(token: String) -> bool:
		if source.substr(at, token.length()) != token: return false
		at += token.length()
		return true
	func digit() -> bool:
		return at < source.length() and source[at] >= "0" and source[at] <= "9"
	func string_token() -> bool:
		if not take('"'): return false
		while at < source.length():
			var code := source.unicode_at(at)
			if take('"'): return true
			if code < 32: return false
			if take("\\"):
				if at >= source.length(): return false
				var escape := source[at]
				at += 1
				if escape == "u":
					var hex := source.substr(at, 4)
					if hex.length() != 4 or not hex.is_valid_hex_number(false): return false
					at += 4
					var unit := hex.hex_to_int()
					if unit >= 0xD800 and unit <= 0xDBFF:
						if source.substr(at, 2) != "\\u": held = "lone_surrogate_unproven"; return false
						var low := source.substr(at + 2, 4)
						if low.length() != 4 or not low.is_valid_hex_number(false) or low.hex_to_int() < 0xDC00 or low.hex_to_int() > 0xDFFF:
							held = "lone_surrogate_unproven"; return false
						at += 6
					elif unit >= 0xDC00 and unit <= 0xDFFF:
						held = "lone_surrogate_unproven"; return false
				elif escape not in ['"', "\\", "/", "b", "f", "n", "r", "t"]: return false
			else: at += 1
		return false
	func number_token() -> bool:
		take("-")
		if not digit(): return false
		if source[at] == "0": at += 1
		else:
			while digit(): at += 1
		if take("."):
			if not digit(): return false
			while digit(): at += 1
		if take("e") or take("E"):
			if not take("+"): take("-")
			if not digit(): return false
			while digit(): at += 1
		return true
	func value(depth: int) -> bool:
		if depth > MAX_JSON_DEPTH: held = "json_depth_unproven"; return false
		space()
		if at >= source.length(): return false
		if source[at] == '"': return string_token()
		if take("{"):
			space()
			if take("}"): return true
			while true:
				space()
				if not string_token(): return false
				space()
				if not take(":") or not value(depth + 1): return false
				space()
				if take("}"): return true
				if not take(","): return false
		elif take("["):
			space()
			if take("]"): return true
			while true:
				if not value(depth + 1): return false
				space()
				if take("]"): return true
				if not take(","): return false
		elif take("true") or take("false") or take("null"): return true
		else: return number_token()
		return false

static func parse_fixture_json(raw: String) -> Dictionary:
	var scanner := StrictJSON.new()
	scanner.source = raw
	var valid := scanner.value(0)
	scanner.space()
	if not scanner.held.is_empty(): return {"status": "HOLD", "reason": scanner.held}
	if not valid or scanner.at != raw.length(): return {"status": "PARSE_ERROR", "reason": "invalid_json"}
	var parser := JSON.new()
	if parser.parse(raw) != OK: return {"status": "HOLD", "reason": "native_json_carrier_unproven"}
	return {"status": "READY", "value": parser.data}

static func _truthy(value: Variant) -> bool:
	if value == null: return false
	if value is bool: return value
	if value is int or value is float: return value != 0 and not is_nan(float(value))
	if value is String: return not value.is_empty()
	return true

static func _prop(value: Variant, key: String) -> Variant:
	return value.get(key) if value is Dictionary else null

static func _or(value: Variant, fallback: Variant) -> Variant:
	return value if _truthy(value) else fallback

static func _wire(value: Variant) -> Variant:
	# Parsed sendJSON response equivalent; no encoder or storage primitive.
	if value is float and not is_finite(value): return null
	if value is Dictionary:
		var out: Dictionary = {}
		for key in value: out[str(key)] = _wire(value[key])
		return out
	if value is Array:
		var out: Array = []
		for entry in value: out.append(_wire(entry))
		return out
	return value

static func _receipt(status: String, target: String, details: Dictionary = {}) -> Dictionary:
	var result := {"status": status, "target": target, "fixture_only": true, "storage_io": false,
		"network": false, "write_authorized": false, "restore_connected": false}
	result.merge(details)
	return result

## server:198-213/node:118-126 with caller-owned readdir/readFile snapshots.
static func project_slot_files(target: String, files: Array) -> Dictionary:
	if target not in TARGETS: return _receipt("HOLD", target, {"reason": "unknown_target"})
	var slots: Array = []
	var excluded: Array = []
	for entry in files:
		if not entry is Dictionary or not entry.get("name") is String or not entry.get("raw") is String:
			return _receipt("HOLD", target, {"reason": "unproven_file_fixture"})
		var name: String = entry.name
		if not name.ends_with(".json") or name.begins_with("_"): continue
		var parsed := parse_fixture_json(entry.raw)
		if parsed.status == "HOLD": return _receipt("HOLD", target, {"reason": parsed.reason, "file": name})
		if parsed.status != "READY" or parsed.value == null:
			excluded.append(name)
			continue
		var data: Variant = parsed.value
		var index := name.find(".json") # JS replace removes only the first occurrence.
		var character: Variant = _prop(data, "charIdx")
		slots.append({"name": name.substr(0, index) + name.substr(index + 5), "ts": _or(_prop(data, "ts"), 0),
			"lv": _or(_prop(_prop(data, "player"), "lv"), 1), "stage": _or(_prop(_prop(data, "game"), "stage"), 0),
			"kills": _or(_prop(_prop(data, "game"), "kills"), 0), "charIdx": character if character != null else 0})
	var payload := {"ok": true, "slots": slots}
	if target == "dev_server": payload.development = true
	return _receipt("READY", target, {"payload": _wire(payload), "excluded_json": excluded})

static func _response(target: String, response: Dictionary) -> Dictionary:
	if target not in TARGETS: return _receipt("HOLD", target, {"reason": "unknown_target"})
	if response.get("transport_error") == true: return _receipt("TRANSPORT_ERROR", target)
	var status: Variant = response.get("status")
	if not (status is int or status is float) or not is_finite(float(status)) or status != floor(float(status)) or status < 100 or status > 599:
		return _receipt("HOLD", target, {"reason": "unproven_http_status"})
	if status < 200 or status >= 300:
		return _receipt("NOT_FOUND" if status == 404 else "HTTP_ERROR", target, {"http_status": status})
	if not response.get("body") is String: return _receipt("HOLD", target, {"reason": "unproven_response_body"})
	var parsed := parse_fixture_json(response.body)
	if parsed.status != "READY": return _receipt(parsed.status, target, {"reason": parsed.reason})
	return _receipt("READY", target, {"value": parsed.value})

## Read stage of index:3522-3550, after any externally owned demo sync.
## fallback_raw is exactly five caller-supplied localStorage strings/nulls.
static func consume_list_response(target: String, response: Dictionary, lobby: Dictionary, fallback_raw: Array) -> Dictionary:
	if target not in TARGETS: return _receipt("HOLD", target, {"reason": "unknown_target"})
	for key in ["request", "current_request", "build", "test_mode"]:
		if not lobby.has(key): return _receipt("HOLD", target, {"reason": "missing_context:" + key})
	if not lobby.build is String or not lobby.test_mode is bool:
		return _receipt("HOLD", target, {"reason": "unproven_lobby_context"})
	for key in ["request", "current_request"]:
		var sequence: Variant = lobby[key]
		if not (sequence is int or sequence is float) or not is_finite(float(sequence)) or sequence != floor(float(sequence)):
			return _receipt("HOLD", target, {"reason": "unproven_request_sequence"})
	if lobby.request != lobby.current_request: return _receipt("STALE", target, {"apply": false})
	var parsed := _receipt("TRANSPORT_ERROR", target) if lobby.build == "demo" else _response(target, response)
	if parsed.status == "HOLD": return parsed
	if parsed.status == "READY" and parsed.value != null:
		var data: Variant = parsed.value
		var ok := _truthy(_prop(data, "ok"))
		var raw_slots: Variant = _prop(data, "slots")
		var slots: Variant = raw_slots if ok and _truthy(raw_slots) else []
		var developer: bool = ok and typeof(_prop(data, "development")) == TYPE_BOOL and _prop(data, "development") == true and lobby.test_mode and lobby.build != "demo"
		if not slots is Array:
			return _receipt("HOLD", target, {"reason": "non_array_slots", "original_slots": slots, "development": developer})
		return _receipt("READY", target, {"slots": slots, "development": developer, "mode": "response", "apply": true})
	if fallback_raw.size() != 5: return _receipt("HOLD", target, {"reason": "unproven_five_slot_snapshot"})
	var slots: Array = []
	for index in range(5):
		var raw: Variant = fallback_raw[index]
		if raw == null or (raw is String and raw.is_empty()): continue
		if not raw is String: return _receipt("HOLD", target, {"reason": "unproven_storage_string"})
		var item := parse_fixture_json(raw)
		if item.status == "HOLD": return _receipt("HOLD", target, {"reason": item.reason})
		if item.status != "READY" or item.value == null: continue
		var data: Variant = item.value
		slots.append({"name": _or(_prop(data, "name"), "Slot " + str(index + 1)),
			"lv": _or(_prop(_prop(data, "player"), "lv"), 1), "stage": _or(_prop(_prop(data, "game"), "stage"), 0),
			"charIdx": _or(_prop(data, "charIdx"), 0)})
	return _receipt("READY", target, {"slots": slots, "development": false, "mode": "fallback", "apply": true, "cause": parsed.status})

## game:63968 j.ok && j.data admission only; a player field is NOT full-save proof.
static func consume_load_response(target: String, response: Dictionary) -> Dictionary:
	var parsed := _response(target, response)
	if parsed.status != "READY": return parsed
	var envelope: Variant = parsed.value
	if envelope == null: return _receipt("PARSE_ERROR", target, {"reason": "null_envelope"})
	var data: Variant = _prop(envelope, "data")
	if not _truthy(_prop(envelope, "ok")) or not _truthy(data): return _receipt("REJECTED", target)
	var kind := "non_object_payload"
	if data is Dictionary: kind = "player_payload_candidate" if _truthy(_prop(data, "player")) else "metadata"
	return _receipt("READY", target, {"payload": data, "kind": kind, "source_found_save": true, "full_save_verified": false})
