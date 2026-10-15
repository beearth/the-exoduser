extends RefCounted
## Explicit event pump for source setInterval/setTimeout. No engine timers or user IO.
const AUTO_INTERVAL_MS := 30000
const AUTO_SUCCESS_GAP_MS := 10000
const BOOT_DELAY_MS := 3000
const REQUIRED := ["clock", "current_state", "current_collector", "current_slot", "current_rift", "save_primitive"]
var _bindings: Dictionary = {}
var _events: Array[Dictionary] = []
var _inflight: Dictionary = {}
var _tickets: Dictionary = {}
var _serial := 0

func configure(bindings: Dictionary) -> Dictionary:
	_bindings = bindings.duplicate()
	return readiness()

func readiness() -> Dictionary:
	var missing: Array[String] = []
	for key in REQUIRED:
		if not _bindings.get(key) is Callable or not (_bindings[key] as Callable).is_valid(): missing.append(key)
	return {"ready": missing.is_empty(), "status": "READY" if missing.is_empty() else "NOT_READY", "missing": missing, "Main_connected": false}

func _read(key: String) -> Dictionary:
	if not _bindings.get(key) is Callable or not (_bindings[key] as Callable).is_valid(): return _nr("missing:" + key)
	var packet: Variant = (_bindings[key] as Callable).call()
	if not packet is Dictionary or packet.get("ready") != true: return _nr("unavailable:" + key)
	return packet

func _nr(reason: String) -> Dictionary:
	return {"ready": false, "status": "NOT_READY", "reason": reason, "executed": false}

func _now() -> Dictionary:
	var packet := _read("clock")
	var value: Variant = packet.get("ms")
	if not packet.ready: return packet
	if not (value is int or value is float) or not is_finite(float(value)): return _nr("invalid_clock")
	return packet

func start_auto_save() -> Dictionary:
	var clock := _now()
	if not clock.ready: return clock
	# Source clearInterval only cancels the previous recurring timer, never boot saves.
	for index in range(_events.size() - 1, -1, -1):
		if _events[index].kind == "auto": _events.remove_at(index)
	return _schedule("auto", float(clock.ms) + AUTO_INTERVAL_MS, false)

func schedule_boot_save() -> Dictionary:
	var clock := _now()
	if not clock.ready: return clock
	var rift := _read("current_rift")
	if not rift.ready: return rift
	if not rift.get("enabled") is bool: return _nr("invalid_rift_enabled")
	return _schedule("boot", float(clock.ms) + BOOT_DELAY_MS, rift.enabled)

func _schedule(kind: String, due: float, ticketed: bool) -> Dictionary:
	_serial += 1
	var event := {"id": _serial, "kind": kind, "due": due, "ticketed": ticketed}
	_events.append(event)
	if ticketed: _tickets[_serial] = true
	return {"ready": true, "status": "SCHEDULED", "id": _serial, "due_ms": due, "ticketed": ticketed}

func poll() -> Dictionary:
	var clock := _now()
	if not clock.ready: return clock
	var outcomes: Array = []
	while true:
		_events.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a.due < b.due or (a.due == b.due and a.id < b.id))
		if _events.is_empty() or _events[0].due > float(clock.ms): break
		var event: Dictionary = _events[0]
		var result := _execute(event)
		outcomes.append(result)
		if not result.get("executed", false): return {"ready": false, "status": "NOT_READY", "outcomes": outcomes, "reason": result.get("reason"), "Main_connected": false}
		_events.remove_at(0)
		if event.kind == "auto":
			event.due += AUTO_INTERVAL_MS
			_events.append(event)
		if not result.ready: return {"ready": false, "status": "NOT_READY", "outcomes": outcomes, "reason": result.get("reason"), "Main_connected": false}
	return {"ready": true, "status": "PUMPED", "outcomes": outcomes, "Main_connected": false}

func _execute(event: Dictionary) -> Dictionary:
	if event.kind == "auto":
		var clock := _now()
		if not clock.ready: return clock
		var state := _read("current_state")
		if not state.ready: return state
		var last: Variant = state.get("last_save_ms")
		if not (last is int or last is float) or not is_finite(float(last)): return _nr("invalid_last_save_time")
		# Source doAutoSave reads Date.now before G.on/_dbReady.
		if float(clock.ms) - float(last) < AUTO_SUCCESS_GAP_MS:
			return {"ready": true, "executed": true, "status": "SKIPPED", "reason": "success_gap", "id": event.id}
		if not state.get("on") is bool or not state.get("db_ready") is bool: return _nr("invalid_current_state")
		if not state.on or not state.db_ready:
			return {"ready": true, "executed": true, "status": "SKIPPED", "reason": "on_or_db_ready", "id": event.id}
	# Boot invokes dbSave unconditionally; dbSave admission/last-success writes belong to primitive.
	if not _bindings.get("save_primitive") is Callable or not (_bindings.save_primitive as Callable).is_valid(): return _nr("missing:save_primitive")
	var slot := _read("current_slot")
	if not slot.ready: return slot
	if not slot.has("value"): return _nr("missing_current_slot_value")
	var collected := _read("current_collector")
	if not collected.ready: return collected
	if not collected.get("context") is Dictionary: return _nr("missing_current_context")
	var request_id: int = event.id
	if event.kind == "auto":
		_serial += 1
		request_id = _serial
	var raw: Variant = (_bindings.save_primitive as Callable).call(slot.value, collected.context)
	if not raw is Dictionary or raw.get("ready") != true or not raw.get("settled") is bool or (raw.get("settled") == true and not raw.get("ok") is bool):
		_inflight[request_id] = {"ticketed": event.ticketed, "kind": event.kind, "outcome_unknown": true}
		return {"ready": false, "executed": true, "status": "NOT_READY", "reason": "primitive_result_unavailable", "id": request_id}
	if raw.settled:
		if not raw.get("ok") is bool: return _nr("primitive_outcome_missing")
		_tickets.erase(event.id)
		return {"ready": true, "executed": true, "status": "SETTLED", "id": request_id, "result": raw.duplicate(true)}
	_inflight[request_id] = {"ticketed": event.ticketed, "kind": event.kind}
	return {"ready": true, "executed": true, "status": "PENDING", "id": request_id, "result": raw.duplicate(true)}

func settle(request_id: int, result: Dictionary) -> Dictionary:
	if not _inflight.has(request_id): return _nr("unknown_request")
	if result.get("ready") != true or result.get("settled") != true or not result.get("ok") is bool: return _nr("settlement_unavailable")
	_inflight.erase(request_id)
	# Source finally clears a RIFT ticket on success, failure or caught host rejection.
	_tickets.erase(request_id)
	return {"ready": true, "status": "SETTLED", "id": request_id, "result": result.duplicate(true)}

func rift_save_busy() -> Dictionary:
	var rift := _read("current_rift")
	if not rift.ready: return rift
	var state := _read("current_state")
	if not state.ready: return state
	if not rift.get("save_state_ready") is bool: return _nr("missing_rift_save_state_ready")
	for key in ["db_ready", "saving", "save_debounce", "pending_force", "save_now_pending"]:
		if not state.get(key) is bool: return _nr("missing_save_busy:" + key)
	return {"ready": true, "busy": not rift.save_state_ready or not state.db_ready or not _tickets.is_empty() or state.saving or state.save_debounce or state.pending_force or state.save_now_pending, "boot_tickets": _tickets.size()}

func snapshot() -> Dictionary:
	return {"scheduled": _events.duplicate(true), "inflight": _inflight.duplicate(true), "boot_tickets": _tickets.size(), "Main_connected": false, "stageReady": false}
