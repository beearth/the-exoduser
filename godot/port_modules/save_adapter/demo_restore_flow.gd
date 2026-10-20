extends "res://port_modules/save_adapter/source_restore_flow.gd"
const Collector = preload("res://port_modules/save_adapter/source_save_collector.gd")
## Reuse every accepted noncombat restore stage. Missing protected stages are
## explicit pending interfaces, never identity observations or permission to start.
func prepare(d: Dictionary, current: Dictionary, tables: Dictionary, handoffs: Dictionary = {}) -> Dictionary:
	_held = ""; _tables = tables; _by_id = {}
	# Live native dictionaries may introduce StringName keys via d.field writes.
	# The accepted collector detaches that supported string carrier explicitly;
	# unsupported objects/cycles still HOLD instead of JSON-dropping their fields.
	var issue := Collector._carrier_issue({"d":d,"current":current,"tables":tables},[],"restore")
	if not issue.is_empty(): return {"status":"HOLD","reason":issue}
	d=Collector._detach(d); current=Collector._detach(current); tables=Collector._detach(tables)
	_tables=tables
	if not _graph._graph_supported({"d": d, "current": current, "tables": tables}, []) or not _safe_keys(d): return {"status": "HOLD", "reason": "invalid_graph"}
	if not _table_shape(tables): return {"status": "HOLD", "reason": "tables_absent"}
	for sk in tables.skills: _by_id[sk.id] = sk
	if not current.get("player") is Dictionary or not current.player.get("skills") is Dictionary or not current.get("game") is Dictionary or not current.get("skill_slots") is Array or current.skill_slots.size() != 6: return {"status": "HOLD", "reason": "current_absent"}
	var state: Dictionary = _copy(current)
	var saved: Dictionary = _copy(d)
	var pending := []
	for stage in STAGES:
		if stage.begins_with("protected_"):
			var callback: Variant = handoffs.get(stage)
			if not callback is Callable or not callback.is_valid():
				pending.append(stage)
				continue
			# PC must observe its real pure restoration operation on this exact
			# state. No partial live mutation is allowed by this interface.
			var raw: Variant = callback.call(_copy(state), _copy(saved))
			if _handoff(stage, state, raw) != "READY": return {"status": "HOLD", "reason": _held}
		else:
			_stage(stage, saved, state)
			if not _held.is_empty(): return {"status": "HOLD", "reason": _held}
	return {"status": "READY" if pending.is_empty() else "PC_INTERFACE_WAIT", "pending": pending, "state": state, "start_authorized": pending.is_empty()}
