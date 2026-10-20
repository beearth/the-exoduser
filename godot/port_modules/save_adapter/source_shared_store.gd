extends RefCounted
## Source game.html 3725-3729, 3741-3752, 48521-48545. No live IO/writers.
## Observations describe caller-owned snapshots, including post-write readbacks.
const JS = preload("res://port_modules/save_adapter/source_player_restore.gd")
const JSON_READER = preload("res://port_modules/save_adapter/source_slot_reader.gd")
const GRAPH = preload("res://port_modules/save_adapter/source_inventory_restore.gd")
const MODES := ["browser_origin", "qa_fixture"]
const STORAGE_KEY := "hellcave_sharedStorage"
const MATS_KEY := "hellcave_sharedMats"
const STORAGE_MAX := 200
const MAX_SAFE := 9007199254740991 # int64 literal -> double is exact; avoid decimal float lexer rounding.
var _graph := GRAPH.new()
# Optional native transport decoder; default source-read contract unchanged.
var native_number_decoder := Callable()

# Grammar comes from the accepted strict reader. Decode integer lexemes through
# int64 instead of Godot JSON's decimal path, which rounds the 2^53-1 boundary.
class ExactJSON extends RefCounted:
	var source := ""
	var at := 0
	var held := ""
	var number_decoder := Callable()
	func space() -> void:
		while at < source.length() and source[at] in [" ", "\t", "\r", "\n"]: at += 1
	func string_value() -> Variant:
		var begin := at
		at += 1
		while at < source.length():
			if source[at] == "\\": at += 2
			elif source[at] == '"':
				at += 1
				return JSON.parse_string(source.substr(begin, at - begin))
			else: at += 1
		return null
	func value() -> Variant:
		space()
		if source[at] == '"': return string_value()
		if source[at] == "{":
			at += 1; space()
			var result := {}
			if source[at] == "}": at += 1; return result
			while true:
				space(); var key: Variant = string_value(); space(); at += 1
				result[key] = value(); space()
				if source[at] == "}": at += 1; return result
				at += 1
		elif source[at] == "[":
			at += 1; space()
			var result := []
			if source[at] == "]": at += 1; return result
			while true:
				result.append(value()); space()
				if source[at] == "]": at += 1; return result
				at += 1
		for token in ["null", "true", "false"]:
			if source.substr(at, token.length()) == token:
				at += token.length()
				return null if token == "null" else token == "true"
		var begin := at
		while at < source.length() and source[at] not in [",", "]", "}", " ", "\t", "\r", "\n"]: at += 1
		var text: String = source.substr(begin, at - begin)
		if not text.contains(".") and not text.to_lower().contains("e"):
			var digits: String = text.trim_prefix("-")
			if digits.length() > 18: held = "json_integer_precision_unproven"; return null
			if text == "-0": return PackedByteArray([0, 0, 0, 0, 0, 0, 0, 128]).to_float64_array()[0]
			return float(text.to_int())
		var mantissa: String = text.to_lower().split("e")[0].replace("-", "").replace(".", "").trim_prefix("+")
		while mantissa.begins_with("0") and mantissa.length() > 1: mantissa = mantissa.substr(1)
		if number_decoder.is_valid():
			var exact: Dictionary=number_decoder.call(text)
			if exact.get("ready",false): return exact.value
			held="native_number_outside_supported_domain"; return null
		var number: float = text.to_float()
		if mantissa.length() > 15 or not is_finite(number) or absf(number) >= 1e12:
			held = "json_decimal_precision_unproven"; return null
		if number == 0 and text.begins_with("-"): return PackedByteArray([0, 0, 0, 0, 0, 0, 0, 128]).to_float64_array()[0]
		return number

func _receipt(status: String, reason: String) -> Dictionary:
	return {"status": status, "reason": reason, "calculation_only": true, "write_authorized": false,
		"storage_io": false, "network": false, "restore_connected": false, "full_restore_verified": false,
		"pending": ["platform namespace/actual shared-store connection", "all setters/persist/server ACK", "live G/STORAGE/serialized owner handoff"]}
func _value(value: Variant, reason: String, fallback: bool = false) -> Dictionary:
	var result := _receipt("READY", reason)
	result["value"] = value; result["source_fallback"] = fallback
	return result
func _observation(mode: String, observation: Variant) -> Dictionary:
	if mode not in MODES: return _receipt("HOLD", "namespace_mode_not_selected")
	if not observation is Dictionary: return _receipt("HOLD", "read_observation_absent")
	if not observation.get("state") is String: return _receipt("HOLD", "read_state_absent")
	if observation.state == "error":
		return _receipt("SOURCE_THROW" if mode == "qa_fixture" else "READ_ERROR", "source_getter_exception")
	if observation.get("state") != "value" or not observation.has("value") or (observation.value != null and not observation.value is String):
		return _receipt("HOLD", "web_storage_string_or_null_required")
	return _value(observation.value, "supplied_read_observation")
func read_storage(mode: String, observation: Variant) -> Dictionary:
	var observed := _observation(mode, observation)
	if observed.status == "READ_ERROR": return _value([], "normal_read_exception", true)
	if observed.status != "READY": return observed
	var raw: Variant = observed.value
	if mode == "browser_origin" and not JS._truthy(raw): return _value([], "normal_absent", true)
	raw = JS._or(raw, "[]")
	var scanner := JSON_READER.StrictJSON.new(); scanner.source = raw
	var valid: bool = scanner.value(0); scanner.space()
	if not scanner.held.is_empty(): return _receipt("HOLD", scanner.held)
	if not valid or scanner.at != raw.length():
		return _receipt("SOURCE_THROW", "qa_json_parse_exception") if mode == "qa_fixture" else _value([], "normal_json_exception", true)
	var decoder := ExactJSON.new(); decoder.source = raw; decoder.number_decoder=native_number_decoder
	var value: Variant = decoder.value()
	if not decoder.held.is_empty(): return _receipt("HOLD", decoder.held)
	if mode == "browser_origin" and not value is Array: return _value([], "normal_non_array", true)
	return _value(value, "source_json_read")
func read_mats(mode: String, observation: Variant) -> Dictionary:
	var observed := _observation(mode, observation)
	if observed.status == "READ_ERROR": return _value(0, "normal_read_exception", true)
	if observed.status != "READY": return observed
	var raw: Variant = observed.value
	if mode == "qa_fixture":
		var number := _coerced_number(raw, true)
		if number.status != "READY": return number
		return _value(maxf(0, minf(float(JS._or(number.value, 0)), MAX_SAFE)), "qa_number_clamp_no_floor")
	if not JS._truthy(raw): return _value(0, "normal_absent", true)
	var text: String = JS._trim_js(raw)
	var negative: bool = text.begins_with("-")
	if text.begins_with("-") or text.begins_with("+"): text = text.substr(1)
	var digits := ""
	for character in text:
		if character < "0" or character > "9": break
		digits += character
	if digits.is_empty(): return _value(0, "normal_parse_int_nan", true)
	while digits.begins_with("0") and digits.length() > 1: digits = digits.substr(1)
	if digits == "0": return _value(PackedByteArray([0, 0, 0, 0, 0, 0, 0, 128]).to_float64_array()[0] if negative else 0.0, "normal_parse_int_zero")
	if negative: return _value(0, "normal_parse_int_negative", true)
	if digits.length() > 309: return _value(0, "normal_parse_int_nonfinite", true)
	if digits.length() == 309: return _receipt("HOLD", "parse_int_overflow_boundary_unproven")
	if digits.length() > 16: return _value(MAX_SAFE, "normal_parse_int_safe_cap")
	var integer: int = digits.to_int()
	return _value(minf(float(integer), MAX_SAFE), "normal_parse_int")
func _coerced_number(value: Variant, clamp_only: bool = false) -> Dictionary:
	if not JS._coercible(value): return _receipt("HOLD", "number_coercion_unproven")
	var primitive: Variant = JS._primitive(value)
	if primitive is String:
		var text: String = JS._trim_js(primitive)
		var pattern := RegEx.new(); pattern.compile("^[+-]?[0-9]+$")
		if pattern.search(text) != null:
			var negative: bool = text.begins_with("-")
			var digits: String = text.trim_prefix("-").trim_prefix("+")
			while digits.begins_with("0") and digits.length() > 1: digits = digits.substr(1)
			if digits == "0": return _value(-0.0 if negative else 0.0, "exact_zero")
			if digits.length() > 18:
				# QA's final clamp is exact for every larger positive/negative
				# decimal integer, whether Number() overflows or stays finite.
				if clamp_only: return _value(0 if negative else MAX_SAFE, "clamp_equivalent_large_integer")
				return _receipt("HOLD", "saved_integer_precision_unproven")
			return _value(float(digits.to_int()) * (-1 if negative else 1), "exact_integer_coercion")
		var numeric: float = JS._number(text)
		if is_finite(numeric) and not text.to_lower().begins_with("0x") and not text.to_lower().begins_with("0b") and not text.to_lower().begins_with("0o"):
			var mantissa: String = text.to_lower().split("e")[0].replace("-", "").replace("+", "").replace(".", "")
			while mantissa.begins_with("0") and mantissa.length() > 1: mantissa = mantissa.substr(1)
			if absf(numeric) >= 1e12 or mantissa.length() > 15: return _receipt("HOLD", "decimal_number_precision_unproven")
		return _value(numeric, "source_number_coercion")
	return _value(JS._number(primitive), "source_number_coercion")
func _storage_intent(value: Array, reason: String) -> Dictionary:
	return {"kind": "storage", "reason": reason, "value": _graph._clone(value, [], []), "execute_authorized": false}
func plan_store(current_storage: Dictionary, mode: String, observation: Variant = null) -> Dictionary:
	if mode not in MODES: return _receipt("HOLD", "namespace_mode_not_selected")
	if not _graph._graph_supported(current_storage, []): return _receipt("HOLD", "storage_graph_unproven")
	var storage: Dictionary = _graph._clone(current_storage, [], [])
	var intents := []
	var read_count := 0
	if not JS._truthy(storage.get("0")) or not JS._truthy(storage.get("_synced")):
		var loaded := read_storage(mode, observation)
		if loaded.status != "READY": return loaded
		if not loaded.value is Array: return _receipt("HOLD", "qa_store_non_array_unproven")
		read_count = 1; storage["0"] = loaded.value; storage["_synced"] = true
		for key in _graph._js_keys(storage):
			if key in ["0", "_synced"]: continue
			if storage[key] is Array and not storage[key].is_empty():
				storage["0"] = storage["0"] + storage[key]; storage[key] = []
		if storage["0"].size() > STORAGE_MAX: storage["0"].resize(STORAGE_MAX)
		intents.append(_storage_intent(storage["0"], "get_store"))
	if not storage.get("0") is Array: return _receipt("HOLD", "synced_store_non_array_unproven")
	var result := _receipt("READY", "detached_get_store_calculation")
	result["plan"] = {"storage": storage, "store": storage["0"]}
	result["intents"] = intents; result["read_count"] = read_count
	return result
func plan_restore(serialized: Variant, current: Dictionary, observations: Dictionary) -> Dictionary:
	if not JS._truthy(serialized): return _receipt("REJECTED", "source_falsy_payload")
	if not serialized is Dictionary: return _receipt("HOLD", "payload_not_object")
	if not JS._truthy(serialized.get("player")): return _receipt("REJECTED", "source_no_player")
	if not serialized.player is Dictionary: return _receipt("HOLD", "player_carrier_unproven")
	if not current.has("mats"): return _receipt("HOLD", "current_mats_absent")
	var mode: Variant = observations.get("mode")
	if not mode is String or mode not in MODES: return _receipt("HOLD", "namespace_mode_not_selected")
	for key in ["mats_reads", "storage_reads"]:
		if not observations.get(key) is Array: return _receipt("HOLD", "read_schedule_absent:" + key)
	if not _graph._graph_supported({"payload": serialized, "current": current, "observations": observations}, []): return _receipt("HOLD", "input_graph_unproven")
	var d: Dictionary = _graph._clone(serialized, [], [])
	var mats: Variant = _graph._clone(current.mats, [], [])
	var intents := []
	var mi := 0; var si := 0
	if JS._truthy(d.get("game")):
		if not d.game is Dictionary: return _receipt("HOLD", "game_carrier_unproven")
		var number := _coerced_number(d.game.get("mats"))
		if number.status != "READY": return number
		var saved: float = maxf(0, floor(float(JS._or(number.value, 0))))
		if observations.mats_reads.size() < 2: return _receipt("HOLD", "mats_post_write_readback_absent")
		var first := read_mats(mode, observations.mats_reads[mi]); mi += 1
		if first.status != "READY": return first
		if saved > 0 and saved != first.value:
			var proposed: float = maxf(first.value, saved)
			intents.append({"kind": "mats", "argument": proposed, "normalized": maxf(0, minf(floor(proposed), MAX_SAFE)), "execute_authorized": false})
			d.game["mats"] = 0
		var second := read_mats(mode, observations.mats_reads[mi]); mi += 1
		if second.status != "READY": return second
		mats = maxf(0, second.value)
	var legacy: Variant = null
	if JS._truthy(d.get("storage")):
		if d.storage is Dictionary: legacy = d.storage.get("0")
		elif d.storage is Array: legacy = d.storage[0] if not d.storage.is_empty() else null
		else: return _receipt("HOLD", "legacy_storage_carrier_unproven")
	if JS._truthy(legacy):
		if not legacy is Array: return _receipt("HOLD", "legacy_storage_slice_unproven")
		if not legacy.is_empty():
			if si >= observations.storage_reads.size(): return _receipt("HOLD", "legacy_shared_read_absent")
			var shared := read_storage(mode, observations.storage_reads[si]); si += 1
			if shared.status != "READY": return shared
			if not shared.value is Array: return _receipt("HOLD", "qa_legacy_shared_shape_unproven")
			if shared.value.is_empty(): intents.append(_storage_intent(legacy.slice(0, STORAGE_MAX), "legacy_transfer"))
			d["storage"] = {}
	if si >= observations.storage_reads.size(): return _receipt("HOLD", "post_rebind_shared_read_absent")
	var store := plan_store({"_synced": false}, mode, observations.storage_reads[si]); si += 1
	if store.status != "READY": return store
	intents.append_array(store.intents)
	var result := _receipt("READY", "detached_restore_max_and_transfer")
	result["plan"] = {"serialized": d, "mats": mats, "storage": store.plan.storage}
	result["intents"] = intents; result["reads"] = {"mats": mi, "storage": si}
	return result
