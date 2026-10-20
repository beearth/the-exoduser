extends "res://port_modules/save_adapter/demo_local_storage.gd"
## Separate native localStorage keys. Same protected namespace/atomic primitive.
const Shared = preload("res://port_modules/save_adapter/source_shared_store.gd")
func _store_name() -> String: return "demo_shared_local_storage"
func _allowed_keys() -> Array: return [Shared.STORAGE_KEY, Shared.MATS_KEY]
func _validate_raw(key: String, raw: String) -> Dictionary:
	var parsed := Reader.parse_fixture_json(raw)
	if parsed.status != "READY": return _error("invalid_shared_json")
	if key == Shared.STORAGE_KEY:
		if not parsed.value is Array or parsed.value.size() > Shared.STORAGE_MAX: return _error("invalid_shared_storage")
	else:
		var n: Variant = parsed.value
		if not (n is int or n is float) or not is_finite(float(n)) or n < 0 or n > Shared.MAX_SAFE or n != floor(float(n)): return _error("invalid_shared_mats")
	return {"ready": true}
