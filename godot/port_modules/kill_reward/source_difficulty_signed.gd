extends RefCounted
## Original @9567: ((typeof OPT != undefined && OPT.diff != null) ? OPT.diff : 5) - 5.
## Current OPT authority is caller-owned; no initializer, cache, input, or clock.
var _reader: Callable
func configure_current_opt_reader(reader: Callable) -> bool:
	_reader = reader
	return _reader.is_valid()
func diff_signed() -> Dictionary:
	if not _reader.is_valid():
		return {"status": "NOT_READY", "value": null, "reason": "current_OPT_reader_unbound"}
	var opt: Variant = _reader.call()
	if not opt is Dictionary:
		return {"status": "NOT_READY", "value": null, "reason": "current_OPT_authority_unavailable"}
	var raw: Variant = opt.get("diff", null)
	if raw == null:
		return {"status": "READY", "value": 0.0, "origin": "current_OPT_nullish_diff_source_fallback_5"}
	if not (raw is int or raw is float):
		return {"status": "NOT_READY", "value": null, "reason": "non_numeric_diff_JS_coercion_not_ported"}
	return {"status": "READY", "value": float(raw) - 5.0, "origin": "current_OPT_diff"}
