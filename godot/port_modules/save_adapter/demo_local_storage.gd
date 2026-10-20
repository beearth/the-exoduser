extends RefCounted
## DEMO11-05. Native implementation of the demo localStorage boundary.
## G62111/62128–62173, I3486–3520. Payload bytes stay plain UTF-8 JSON.
## No Player restore, slot activation policy, shared storage, network or combat.
const Reader = preload("res://port_modules/save_adapter/source_slot_reader.gd")
const Primitive = preload("res://port_modules/save_adapter/source_save_primitive.gd")
const Lifecycle = preload("res://port_modules/save_adapter/source_save_lifecycle_owner.gd")
const MAX_BYTES := 16 * 1024 * 1024 # Operational bound; reject without truncation.
const MAX_REQUESTS := 128 # Explicit release, never silently evict idempotency receipts.
const KEYS := ["hellsave_demo", "hellsave_demo_active", "hellsave_demo_0", "hellsave_demo_1", "hellsave_demo_2", "hellsave_demo_3", "hellsave_demo_4"]
var _root := ""
var _requests: Dictionary = {}
var _pending := ""
var _advancing := false
var _primitive := Primitive.new()
var _lifecycle := Lifecycle.new()
var _lifecycle_serial := 0
var _last_save_ms: float = 0.0
var _state_reader := Callable()
var _clock := Callable()

static func accepts_namespace(user_path: String) -> bool:
	var name := user_path.simplify_path().get_file()
	return name != "EXODUSER-Godot-Native-First" and name.begins_with("EXODUSER-demo11-")

func readiness() -> Dictionary:
	var user := OS.get_user_data_dir().simplify_path()
	# Do not even stat the real native user's save directory. DEMO11-01 owns
	# selecting the demo namespace; tests override it with their own namespace.
	if not accepts_namespace(user):
		return _error("demo_namespace_required")
	if not _no_links(user): return _error("linked_user_directory")
	var path := user.path_join(_store_name())
	if not _no_links(path): return _error("linked_store_directory")
	return {"ready": true, "status": "READY", "root": path, "host_io": true, "full_restore": false}

func open_store() -> Dictionary:
	var admission := readiness()
	if not admission.ready: return admission
	if not _pending.is_empty(): return _error("busy")
	if not _root.is_empty() and _root != admission.root: return _error("store_namespace_changed")
	var code := DirAccess.make_dir_recursive_absolute(admission.root)
	# Some native backends report OK for an existing path that is a file.
	# Publish the root only after proving it is an accessible directory.
	if code != OK or not DirAccess.dir_exists_absolute(admission.root) or DirAccess.open(admission.root) == null:
		return _error("mkdir_failed", code if code != OK else ERR_CANT_OPEN)
	_root = admission.root
	return admission

func _no_links(path: String) -> bool:
	var at := path.left(3) if path.length() > 2 and path[1] == ":" else "/"
	for part in path.trim_prefix(at).split("/", false):
		var parent := DirAccess.open(at)
		if parent != null and parent.is_link(part): return false
		at = at.path_join(part)
	return true

func _admit(key: String) -> Dictionary:
	if key not in _allowed_keys(): return _error("unsupported_key")
	var admission := readiness()
	if not admission.ready: return admission
	if _root.is_empty(): return _error("store_not_open")
	if _root != admission.root: return _error("store_namespace_changed")
	if not DirAccess.dir_exists_absolute(_root): return _error("store_directory_unavailable")
	if not _no_links(_root.path_join(key + ".json")): return _error("linked_value")
	return {"ready": true}

func get_item(key: String) -> Dictionary:
	var admission := _admit(key)
	if not admission.ready: return admission
	if DirAccess.open(_root) == null: return _error("read_directory_failed")
	var path := _root.path_join(key + ".json")
	if DirAccess.dir_exists_absolute(path): return _error("value_is_directory")
	if not FileAccess.file_exists(path): return {"ready": true, "status": "MISSING", "found": false}
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null: return _error("read_open_failed", FileAccess.get_open_error())
	if file.get_length() > MAX_BYTES: file.close(); return _error("value_too_large")
	var bytes := file.get_buffer(file.get_length())
	var code := file.get_error()
	file.close()
	if code != OK: return _error("read_failed", code)
	if not _valid_utf8(bytes): return _error("invalid_utf8")
	var raw := bytes.get_string_from_utf8()
	if raw.to_utf8_buffer() != bytes: return _error("invalid_utf8")
	return {"ready": true, "status": "FOUND", "found": true, "raw": raw}

func _valid_utf8(bytes: PackedByteArray) -> bool:
	var index := 0
	while index < bytes.size():
		var head := bytes[index]
		if head < 128: index += 1; continue
		var count := 1 if head >= 194 and head <= 223 else (2 if head >= 224 and head <= 239 else (3 if head >= 240 and head <= 244 else -1))
		if count < 0 or index + count >= bytes.size(): return false
		for offset in range(1, count + 1):
			if bytes[index + offset] < 128 or bytes[index + offset] > 191: return false
		var second := bytes[index + 1]
		if (head == 224 and second < 160) or (head == 237 and second > 159) or (head == 240 and second < 144) or (head == 244 and second > 143): return false
		index += count + 1
	return true

func read_json(key: String) -> Dictionary:
	var item := get_item(key)
	if not item.ready or not item.found: return item
	var parsed := Reader.parse_fixture_json(item.raw)
	if parsed.status != "READY": return _error("invalid_json:" + str(parsed.get("reason", "parse")))
	return {"ready": true, "status": "FOUND", "found": true, "value": parsed.value, "raw": item.raw}

func begin_set(request_id: String, key: String, raw: String) -> Dictionary:
	return _begin(request_id, key, raw, false)

func begin_remove(request_id: String, key: String) -> Dictionary:
	return _begin(request_id, key, "", true)

func _begin(id: String, key: String, raw: String, remove: bool) -> Dictionary:
	var admission := _admit(key)
	if not admission.ready: return admission
	if id.is_empty() or id.length() > 128: return _error("invalid_request_id")
	var signature := (key + "\n" + ("remove" if remove else "set") + "\n" + raw).sha256_text()
	if _requests.has(id):
		if _requests[id].signature != signature: return _error("request_id_conflict")
		return _requests[id].receipt.duplicate(true)
	if not _pending.is_empty(): return _error("busy")
	if _requests.size() >= MAX_REQUESTS: return _error("request_receipts_full")
	if not remove:
		if raw.to_utf8_buffer().size() > MAX_BYTES: return _error("value_too_large")
		var validation := _validate_raw(key, raw)
		if not validation.ready: return validation
	# mkdir is an exclusive cross-instance/process writer lock. Never remove a
	# foreign/stale lock automatically; old committed files remain readable.
	var lock := _root.path_join(".writer")
	var code := DirAccess.make_dir_absolute(lock)
	if code != OK: return _error("writer_locked", code)
	_pending = id
	_requests[id] = {"signature": signature, "key": key, "raw": raw, "remove": remove,
		"phase": "commit" if remove else "write", "receipt": {"ready": true, "status": "PENDING", "settled": false, "request_id": id}}
	return _requests[id].receipt.duplicate(true)

func advance(id: String) -> Dictionary:
	if _advancing: return _error("reentrant_io")
	_advancing = true
	var result := _advance(id)
	_advancing = false
	return result

func _advance(id: String) -> Dictionary:
	if not _requests.has(id): return _error("unknown_request")
	var t: Dictionary = _requests[id]
	if t.receipt.settled: return t.receipt.duplicate(true)
	var admission := _admit(t.key)
	if not admission.ready: return _finish(id, false, admission.reason)
	var temporary := _root.path_join(".writer/next")
	if t.phase == "write":
		if not _no_links(temporary): return _finish(id, false, "linked_temporary")
		var file := FileAccess.open(temporary, FileAccess.WRITE)
		if file == null: return _finish(id, false, "write_open_failed")
		file.store_buffer(t.raw.to_utf8_buffer())
		file.flush()
		var code := file.get_error()
		file.close()
		if code != OK: return _finish(id, false, "write_failed")
		t.phase = "commit"
		return t.receipt.duplicate(true)
	if not t.remove:
		if not _no_links(temporary) or not FileAccess.file_exists(temporary): return _finish(id, false, "temporary_missing_or_linked")
		# Detect short writes/tampering before replacing the previous save.
		if FileAccess.get_file_as_bytes(temporary) != t.raw.to_utf8_buffer(): return _finish(id, false, "temporary_mismatch")
	var target := _root.path_join(t.key + ".json")
	if DirAccess.dir_exists_absolute(target): return _finish(id, false, "value_is_directory")
	var code := OK
	if t.remove:
		if FileAccess.file_exists(target): code = DirAccess.remove_absolute(target)
	else:
		# Same filesystem rename, no delete-then-rename gap. A platform that
		# cannot replace the destination fails closed and preserves the old file.
		code = DirAccess.rename_absolute(temporary, target)
	return _finish(id, code == OK, "" if code == OK else "commit_failed")

func _finish(id: String, committed: bool, reason: String) -> Dictionary:
	var t: Dictionary = _requests[id]
	var temporary := _root.path_join(".writer/next")
	var cleanup := OK
	if not _no_links(_root.path_join(".writer")):
		cleanup = ERR_UNAUTHORIZED
	elif FileAccess.file_exists(temporary) or DirAccess.dir_exists_absolute(temporary): cleanup = DirAccess.remove_absolute(temporary)
	if cleanup == OK: cleanup = DirAccess.remove_absolute(_root.path_join(".writer"))
	var now := Time.get_unix_time_from_system() * 1000.0
	var valid_clock := true
	if _clock.is_valid():
		var current: Variant = _clock.call()
		valid_clock = current is Dictionary and current.get("ready") == true and (current.get("ms") is int or current.get("ms") is float) and is_finite(float(current.ms))
		if valid_clock: now = float(current.ms)
	# Same post-setItem success boundary as demo G62162. Reuse the SV ACK
	# calculation; its fixture-only readiness is deliberately unchanged.
	var ack := _primitive.web_ack({"state": "succeeded" if committed else "throw"}, _last_save_ms, now)
	if committed and valid_clock and not t.remove and t.key == "hellsave_demo": _last_save_ms = ack.result.last_save_ms
	t.receipt = {"ready": true, "status": "SETTLED", "settled": true, "ok": committed, "committed": committed,
		"request_id": id, "reason": reason, "cleanup_error": cleanup, "last_save_ms": _last_save_ms,
		"acknowledged": committed and valid_clock, "host_io": true, "durability_verified": false}
	_pending = ""
	return t.receipt.duplicate(true)

func run_request(id: String) -> Dictionary:
	if not _requests.has(id): return _error("unknown_request")
	for iteration in 3:
		var result := advance(id)
		if not result.get("ready", false) or result.get("settled", false): return result
	return _error("unexpected_pending")

func cancel_request(id: String) -> Dictionary:
	if _advancing: return _error("reentrant_io")
	if id != _pending or id.is_empty(): return _error("not_pending")
	_advancing = true
	var result := _finish(id, false, "cancelled")
	_advancing = false
	return result

func release_receipt(id: String) -> bool:
	if not _requests.has(id) or not _requests[id].receipt.settled: return false
	_requests.erase(id)
	return true

func configure_lifecycle(bindings: Dictionary) -> Dictionary:
	if not _pending.is_empty(): return _error("busy")
	for key in ["current_state", "clock"]:
		if not bindings.get(key) is Callable or not bindings[key].is_valid(): return _error("unbound:" + key)
	_state_reader = bindings.get("current_state", Callable())
	_clock = bindings.get("clock", Callable())
	var installed := bindings.duplicate()
	installed.current_state = _current_state
	installed.save_primitive = _lifecycle_save
	return _lifecycle.configure(installed)

func _current_state() -> Dictionary:
	if not _state_reader.is_valid(): return _error("current_state_unbound")
	var state: Variant = _state_reader.call()
	if not state is Dictionary or state.get("ready") != true: return _error("current_state_unavailable")
	var result: Dictionary = state.duplicate(true)
	result.last_save_ms = _last_save_ms
	return result

func _lifecycle_save(slot: Variant, context: Dictionary) -> Dictionary:
	if slot != "hellsave_demo" or not context.get("raw_json") is String:
		return {"ready": true, "settled": true, "ok": false, "committed": false, "reason": "serialized_demo_context_required"}
	_lifecycle_serial += 1
	var id := "lifecycle-" + str(_lifecycle_serial)
	var started := begin_set(id, slot, context.raw_json)
	if not started.ready:
		# Admission failed before IO: this is a KNOWN failed settlement, not an
		# unknown asynchronous operation that would strand a lifecycle ticket.
		return {"ready": true, "settled": true, "ok": false, "committed": false, "reason": started.reason}
	var result := run_request(id)
	release_receipt(id)
	return result

func start_auto_save() -> Dictionary: return _lifecycle.start_auto_save()
func schedule_boot_save() -> Dictionary: return _lifecycle.schedule_boot_save()
func poll() -> Dictionary: return _lifecycle.poll()
func rift_save_busy() -> Dictionary: return _lifecycle.rift_save_busy()
func snapshot() -> Dictionary:
	return {"root": _root, "pending": _pending, "receipts": _requests.size(), "last_save_ms": _last_save_ms,
		"lifecycle": _lifecycle.snapshot(), "main_connected": false, "full_restore": false}
func _error(reason: String, code: int = FAILED) -> Dictionary:
	return {"ready": false, "status": "NOT_READY", "reason": reason, "error": code, "settled": false}

# Narrow extension points; the demo game's original allowlist/format stay intact.
func _store_name() -> String: return "demo_local_storage"
func _allowed_keys() -> Array: return KEYS
func _validate_raw(key: String, raw: String) -> Dictionary:
	if key == "hellsave_demo_active":
		return {"ready": true} if raw in ["0", "1", "2", "3", "4"] else _error("invalid_active_slot")
	var parsed := Reader.parse_fixture_json(raw)
	return {"ready": true} if parsed.status == "READY" and parsed.value is Dictionary else _error("invalid_save_object")
