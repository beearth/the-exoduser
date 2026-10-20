extends RefCounted
## SV-SAVE-PRIMITIVE: memory fixture ONLY. No host IO, serializer or callback.
## Product storage/format/SDK/State/Main/lifecycle connection remains HOLD.
const NAMESPACE := "EXODUSER-sv-save-primitive-Isolated-20261020"
const JS = preload("res://port_modules/save_adapter/source_player_restore.gd")

func readiness() -> Dictionary:
	return {"status": "HOLD", "product_write_authorized": false, "Main_connected": false,
		"reason": "fixture_only_no_product_storage_serializer_transport_or_owner_binding"}
func create_fixture(fixture_namespace: String) -> Variant:
	if fixture_namespace != NAMESPACE: return null
	return MemoryFixture.new()

class MemoryFixture extends RefCounted:
	# Keys are virtual tokens, never host paths. Payload is already serialized bytes
	# supplied by QA; this module neither manufactures nor changes any save format.
	var _files := {}
	var _fds := {}
	var _next_fd := 20
	var _sequences := {}
	var _transactions := {}
	var _next_transaction := 0
	var _faults: Array = []
	var _counts := {}
	var _calls: Array = []
	func _token(value: String) -> bool:
		if value.is_empty() or value.length() > 128 or value in [".", ".."]: return false
		for c in value:
			if not ((c >= "a" and c <= "z") or (c >= "A" and c <= "Z") or (c >= "0" and c <= "9") or c in ["_", "-", "."]): return false
		return true
	func seed(key: String, bytes: PackedByteArray) -> bool:
		if not _token(key) or not _transactions.is_empty(): return false
		_files[key] = bytes.duplicate(); return true
	func set_faults(faults: Array) -> bool:
		if not _transactions.is_empty(): return false
		for fault in faults:
			if not fault is Dictionary or fault.get("op") not in ["open", "write", "close", "rename", "unlink"] or not fault.get("nth") is int or fault.nth < 1 or fault.get("effect") not in ["before", "partial", "after"]: return false
			if fault.op == "open" and fault.effect != "before": return false
			if fault.effect == "partial" and (fault.op != "write" or not fault.get("bytes") is int or fault.bytes < 0): return false
		_faults = faults.duplicate(true); return true
	func begin(mode: String, key: String, bytes: PackedByteArray, process_id: int = 1) -> Dictionary:
		if mode not in ["dev_atomic", "nw_direct"] or not _token(key) or key.contains(".") or process_id < 1: return {"status": "HOLD", "reason": "fixture_mode_token_or_process_invalid"}
		_next_transaction += 1
		var temporary := ""
		if mode == "dev_atomic":
			_sequences[process_id] = int(_sequences.get(process_id, 0)) + 1
			temporary = key + ".tmp-" + str(process_id) + "-" + str(_sequences[process_id])
		_transactions[_next_transaction] = {"mode": mode, "key": key, "bytes": bytes.duplicate(), "temporary": temporary,
			"phase": "open" if mode == "dev_atomic" else "direct_write", "descriptor": null, "owned": false, "error": ""}
		return {"status": "PENDING", "id": _next_transaction}
	func _event(op: String, args: Array) -> Dictionary:
		_counts[op] = int(_counts.get(op, 0)) + 1
		_calls.append({"op": op, "args": args.duplicate(true)})
		for f in _faults:
			if f.op == op and f.nth == _counts[op]: return f
		return {}
	func _failed(t: Dictionary, reason: String) -> void:
		t["error"] = reason
		t["phase"] = "cleanup_close" if t.descriptor != null else ("cleanup_unlink" if t.owned else "done")
	func _finish_phase(t: Dictionary) -> void:
		t["phase"] = "cleanup_unlink" if t.owned else "done"
	func advance(id: int) -> Dictionary:
		if not _transactions.has(id): return {"status": "HOLD", "reason": "unknown_fixture_transaction"}
		var t: Dictionary = _transactions[id]
		var fault := {}; var fd: int
		match t.phase:
			"open":
				fault = _event("open", [t.temporary, "wx"])
				if not fault.is_empty(): _failed(t, "open")
				elif _files.has(t.temporary): _failed(t, "open")
				else:
					fd = _next_fd; _next_fd += 1
					_files[t.temporary] = PackedByteArray(); _fds[fd] = t.temporary
					t["descriptor"] = fd; t["owned"] = true; t["phase"] = "write"
			"write", "direct_write":
				var direct: bool = t.phase == "direct_write"
				var target: Variant = t.key if direct else t.descriptor
				fault = _event("write", [target, Array(t.bytes), "utf8"])
				if not fault.is_empty() and fault.effect == "before":
					if direct: t["error"] = "write"; t["phase"] = "done"
					else: _failed(t, "write")
				else:
					var key: String = t.key if direct else str(_fds.get(t.descriptor, ""))
					if key.is_empty(): _failed(t, "write")
					else:
						_files[key] = t.bytes.slice(0, mini(fault.bytes, t.bytes.size())) if not fault.is_empty() and fault.effect == "partial" else t.bytes.duplicate()
						if not fault.is_empty():
							if direct: t["error"] = "write"; t["phase"] = "done"
							else: _failed(t, "write")
						else: t["phase"] = "done" if direct else "close"
			"close":
				fault = _event("close", [t.descriptor])
				if not fault.is_empty() and fault.effect == "before": _failed(t, "close")
				else:
					_fds.erase(t.descriptor)
					if not fault.is_empty(): _failed(t, "close")
					else: t["descriptor"] = null; t["phase"] = "rename"
			"rename":
				fault = _event("rename", [t.temporary, t.key])
				if not fault.is_empty() and fault.effect == "before": _failed(t, "rename")
				else:
					_files[t.key] = _files[t.temporary]; _files.erase(t.temporary)
					if not fault.is_empty(): _failed(t, "rename")
					else: t["owned"] = false; t["phase"] = "done"
			"cleanup_close":
				fault = _event("close", [t.descriptor])
				if fault.is_empty() or fault.effect != "before": _fds.erase(t.descriptor)
				_finish_phase(t)
			"cleanup_unlink":
				fault = _event("unlink", [t.temporary])
				if fault.is_empty() or fault.effect != "before": _files.erase(t.temporary)
				t["phase"] = "done"
		return transaction(id)
	func transaction(id: int) -> Dictionary:
		if not _transactions.has(id): return {"status": "HOLD", "reason": "unknown_fixture_transaction"}
		var t: Dictionary = _transactions[id]
		return {"status": "SETTLED" if t.phase == "done" else "PENDING", "ok": t.error.is_empty() and t.phase == "done", "error": t.error, "phase": t.phase,
			"fixture_only": true, "host_io": false, "product_write_authorized": false, "durability_verified": false}
	func run(id: int) -> Dictionary:
		var r := transaction(id)
		for iteration in 8:
			if r.status != "PENDING": break
			r = advance(id)
		return r
	func snapshot() -> Dictionary:
		var files := {}; var descriptors := {}
		for key in _files: files[key] = Array(_files[key])
		for key in _fds: descriptors[str(key)] = _fds[key]
		return {"files": files, "descriptors": descriptors, "calls": _calls.duplicate(true)}

func _receipt() -> Dictionary:
	return {"status": "READY", "calculation_only": true, "fixture_only": true, "product_write_authorized": false,
		"host_io": false, "network": false, "Main_connected": false, "full_save_verified": false, "connection_status": "HOLD"}
func _valid_time(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value)) and absf(float(value)) <= 9007199254740991
# Post-await ACK only. request_id is diagnostic; source compares current _charId.
func cloud_ack(request_id: String, current_id: String, response: Dictionary, last_ms: Variant, now_ms: Variant) -> Dictionary:
	var r := _receipt()
	if not _valid_time(last_ms) or not _valid_time(now_ms) or response.get("state") not in ["returned", "throw"]:
		r["status"] = "HOLD"; return r
	var acknowledged := false; var caught: bool = response.state == "throw"
	if not caught:
		var value: Variant = response.get("value")
		if value == null: caught = true
		elif not value is Dictionary: r["status"] = "HOLD"; return r
		elif not JS._truthy(value.get("error")):
			var updated: Variant = value.get("data")
			if updated is Array and updated.size() == 1:
				if updated[0] == null: caught = true
				elif updated[0] is Dictionary: acknowledged = updated[0].get("id") is String and updated[0].id == current_id
				elif updated[0] is Array: r["status"] = "HOLD"; return r
			elif JS._truthy(updated) and not updated is Array: r["status"] = "HOLD"; return r
	r["result"] = {"last_save_ms": now_ms if acknowledged else last_ms, "acknowledged": acknowledged, "caught": caught,
		"identity_changed": request_id != current_id, "current_id_comparison": true}
	return r
# Original local catch cannot see block-scoped saveData. Do not invent a
# successful fallback after transport/parse/offline-write exceptions.
func local_ack(request_slot: String, current_slot: String, server_before: Variant, observation: Dictionary, last_ms: Variant, now_ms: Variant) -> Dictionary:
	var r := _receipt()
	if not _valid_time(last_ms) or not _valid_time(now_ms) or (server_before != null and not server_before is bool) or observation.get("kind") not in ["offline", "http_error", "transport_error", "parse_error", "json"]:
		r["status"] = "HOLD"; return r
	var kind: String = observation.kind
	if (server_before is bool and not server_before and kind != "offline") or (kind == "offline" and not (server_before is bool and not server_before)):
		r["status"] = "HOLD"; return r
	var acknowledged := false; var caught := false; var fallback_calls := 0; var catch_reference_error := false
	var server_after: Variant = server_before
	if kind in ["offline", "http_error"]:
		if observation.get("write") not in ["succeeded", "failed"]: r["status"] = "HOLD"; return r
		fallback_calls = 1
		if kind == "http_error": server_after = false
		if observation.write == "succeeded": acknowledged = true
		elif kind == "offline": caught = true; catch_reference_error = true; server_after = false
	elif kind in ["transport_error", "parse_error"]:
		server_after = false; caught = true; catch_reference_error = true
	else:
		var value: Variant = observation.get("value")
		if value == null:
			server_after = false; caught = true; catch_reference_error = true
		elif not value is Dictionary: r["status"] = "HOLD"; return r
		else: server_after = true; acknowledged = JS._truthy(value.get("ok"))
	r["result"] = {"last_save_ms": now_ms if acknowledged else last_ms, "acknowledged": acknowledged, "caught": caught,
		"server_ok": server_after, "fallback_calls": fallback_calls, "catch_reference_error": catch_reference_error,
		"identity_changed": request_slot != current_slot, "ack_slot_checked": false}
	return r

# Source web 64089-64092, post-setItem only. Setter is never called here.
func web_ack(observation: Dictionary, last_ms: Variant, now_ms: Variant) -> Dictionary:
	var r := _receipt()
	if not _valid_time(last_ms) or not _valid_time(now_ms) or observation.get("state") not in ["succeeded", "throw"]:
		r["status"] = "HOLD"; return r
	var acknowledged: bool = observation.state == "succeeded"
	r["result"] = {"last_save_ms": now_ms if acknowledged else last_ms, "acknowledged": acknowledged, "caught": not acknowledged}
	return r
