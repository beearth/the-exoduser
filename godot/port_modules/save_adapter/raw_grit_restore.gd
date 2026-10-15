extends RefCounted
## Own actual raw holder plus narrow source writers. No _gritTotal calculation.
var _container: Dictionary = {}
var _initialized := false
func initialize(source_initialization: Dictionary) -> Dictionary:
	if _initialized: return _notready("source declaration already initialized")
	if not source_initialization.has("_grit"): return _notready("source _grit initialization absent")
	_container["_grit"] = source_initialization["_grit"]
	_initialized = true
	return {"ready": true}
func current_container() -> Variant:
	return _container if _initialized else null
func read_raw() -> Dictionary:
	return {"ready": true, "raw": _container["_grit"]} if _initialized else _notready("raw holder uninitialized")
func unpublish() -> void:
	_initialized = false
	_container.clear()
func _notready(reason: String, partial: bool = false) -> Dictionary:
	return {"ready": false, "applied": false, "reason": reason, "partial": partial, "main_connected": false}
func _truthy(value: Variant) -> bool:
	if value == null: return false
	if value is bool: return value
	if value is int or value is float: return value != 0 and not is_nan(float(value))
	if value is String: return not value.is_empty()
	return true
func _or(value: Variant, fallback: Variant) -> Variant: return value if _truthy(value) else fallback
func _number(value: Variant) -> float:
	if value == null: return 0.0
	if value is bool: return 1.0 if value else 0.0
	if value is int or value is float: return float(value)
	if value is String:
		var text: String = value.strip_edges()
		if text.is_empty(): return 0.0
		return text.to_float() if text.is_valid_float() else NAN
	if value is Array:
		if value.is_empty() or (value.size() == 1 and value[0] == null): return 0.0
		if value.size() == 1 and (value[0] is String or value[0] is int or value[0] is float): return _number(value[0])
	return NAN
func _js_string(value: Variant) -> String:
	if value is float and is_finite(value) and value == floor(value) and absf(value) < 1e18: return str(int(value))
	return str(value)
func _add(a: Variant, b: Variant) -> Variant:
	return _js_string(a) + _js_string(b) if a is String or b is String else _number(a) + _number(b)
func restore(serialized: Dictionary, player: Dictionary) -> Dictionary:
	if not _initialized: return _notready("actual raw holder initialization required")
	_container["_grit"] = _or(serialized.get("grit"), 0)
	var value := _number(_container["_grit"])
	var refund := 0.0
	if value > 0 and not _truthy(serialized.get("gritCostModeV2")):
		var legacy_spent := value * 3 + ((value - 1) * value) / 2
		refund = maxf(0, legacy_spent - value)
		if refund > 0:
			if not player.has("sp"): return _notready("caller SP absent after raw restore", true)
			player["sp"] = _add(player.sp, refund)
	return {"ready": true, "applied": true, "raw": _container["_grit"], "legacy_refund": refund, "writes": ["_grit", "P.sp"] if refund > 0 else ["_grit"], "main_connected": false}
func apply_plan(plan: Dictionary, player: Dictionary, allocations: Dictionary, evaluator: Callable, before_commit: Callable) -> Dictionary:
	if not _initialized or not player.has("sp") or not allocations.get("stats") is Dictionary or not allocations.get("passives") is Dictionary:
		return _notready("actual holder/SP/caller allocations required")
	if not evaluator.is_valid(): return _notready("original evaluatePlan authority absent")
	var live := {"stats": allocations.stats, "passives": allocations.passives, "grit": _container["_grit"], "sp": player.sp, "ap": _or(player.get("ap"), 0)}
	var response: Variant = evaluator.call(plan, live)
	if not response is Dictionary or response.get("ready") != true: return _notready("plan authority notready")
	var next: Variant = response.get("next")
	if not next is Dictionary or not _truthy(next.get("changes")): return {"ready": true, "applied": false, "reason": "source no accepted changes"}
	for key in ["grit", "sp", "ap"]:
		if not next.has(key): return _notready("approved next field absent: " + key)
	if not before_commit.is_valid(): return _notready("queue/stats/passives source prefix absent")
	var prefix: Variant = before_commit.call(next, live)
	if not prefix is Dictionary or prefix.get("ready") != true: return _notready("allocation prefix notready")
	_container["_grit"] = next.grit
	player["sp"] = next.sp
	player["ap"] = next.ap
	return {"ready": true, "applied": true, "writes": ["_grit", "P.sp", "P.ap"], "tail_pending": ["passive queue investment", "applyStats", "SFX/UI/save"], "main_connected": false}
func _safe_refund(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value)) and value >= 0 and value == floor(float(value)) and value <= 9007199254740991.0
func refund_all(player: Dictionary, allocations: Dictionary, refund_authority: Callable, clear_allocations: Callable) -> Dictionary:
	if not _initialized or not player.has("sp") or not allocations.get("stats") is Dictionary or not allocations.get("passives") is Dictionary:
		return _notready("holder/SP/caller allocations absent")
	if not refund_authority.is_valid(): return _notready("original refundTotals authority absent")
	var live := {"stats": allocations.stats, "passives": allocations.passives, "grit": _container["_grit"]}
	var response: Variant = refund_authority.call(live)
	if not response is Dictionary or response.get("ready") != true or not response.get("refund") is Dictionary: return _notready("refund authority notready")
	var totals: Dictionary = response.refund
	if not _safe_refund(totals.get("sp")) or not _safe_refund(totals.get("ap")): return _notready("source unsafe refund rejected")
	if totals.sp == 0 and totals.ap == 0: return {"ready": true, "applied": false, "reason": "source zero refund"}
	if not clear_allocations.is_valid(): return _notready("allocation clear callback absent")
	player["sp"] = _add(player.sp, totals.sp)
	player["ap"] = _add(_or(player.get("ap"), 0), totals.ap)
	var cleared: Variant = clear_allocations.call(allocations)
	if not cleared is Dictionary or cleared.get("ready") != true: return _notready("allocation clearing notready after SP/AP writes", true)
	_container["_grit"] = 0
	return {"ready": true, "applied": true, "writes": ["P.sp", "P.ap", "allocations clear", "_grit"], "tail_pending": ["applyStats", "SFX/UI/save"], "main_connected": false}
