extends RefCounted
## SV-LOBBY-VIEW / DEMO11-04: actual local IO owner; no Player restore.
## I3486-3552 five demo keys/list; I3446-3452 metadata; I3593-3610 deletion.
signal changed
signal new_game_requested(slot: int, data: Dictionary)
signal continue_requested(slot: int, data: Dictionary)
const Storage = preload("res://port_modules/save_adapter/demo_local_storage.gd")
const Reader = preload("res://port_modules/save_adapter/source_slot_reader.gd")
var storage = Storage.new()
var rows: Array = []
var selected := -1
var pending_delete: Dictionary = {}
var last_error := ""
var ready := false
var _busy := false
var _serial := 0
var _instance := str(get_instance_id())

func open() -> bool:
	var result: Dictionary = storage.open_store()
	if not result.get("ready", false): return _fail(str(result.get("reason", "open")))
	if not _sync_interrupted_active():return false
	return refresh()

# index.html 3492-3509: recover the active session before listing slots.
# Compare every write against the observed bytes; never discard an unreadable save.
func _sync_interrupted_active() -> bool:
	var active: Dictionary=storage.get_item("hellsave_demo_active")
	var game: Dictionary=storage.get_item("hellsave_demo")
	if not active.get("ready",false) or not game.get("ready",false):return _fail("active_read_failed")
	if not active.get("found",false):return true # legacy single-save migration belongs to the restore owner
	if active.raw not in ["0","1","2","3","4"]:return _fail("active_invalid")
	var key:=_key(int(active.raw))
	var slot: Dictionary=storage.get_item(key)
	if not slot.get("ready",false):return _fail("active_read_failed")
	if slot.get("found",false):
		var meta: Variant=JSON.parse_string(slot.raw)
		var saved: Variant=JSON.parse_string(game.raw) if game.get("found",false) else {}
		if not meta is Dictionary or not saved is Dictionary:return _fail("active_json_invalid")
		var merged: Dictionary=saved.duplicate(true)
		merged.name=meta.get("name");merged.ts=meta.get("ts");merged.charIdx=meta.get("charIdx",0)
		if not _write(key,JSON.stringify(merged),false,slot.raw):return false
	if game.get("found",false) and not _write("hellsave_demo","",true,game.raw):return false
	return _write("hellsave_demo_active","",true,active.raw)

func refresh() -> bool:
	if _busy: return false
	var next: Array = []
	var raw_slots: Array = []
	for slot in 5:
		var value: Dictionary = storage.get_item(_key(slot))
		if not value.get("ready", false): return _fail(str(value.get("reason", "read")))
		raw_slots.append(value.get("raw"))
		var row := {"slot":slot,"kind":"empty","raw":"","data":{},"summary":{}}
		if value.get("found", false):
			row.raw = value.raw
			var parsed: Dictionary = Reader.parse_fixture_json(value.raw)
			row.kind = "corrupt"
			if parsed.status == "READY" and parsed.value is Dictionary:
				row.kind = "saved" if parsed.value.get("player") is Dictionary else "new"
				row.data = parsed.value
		next.append(row)
	# Existing reader owns original metadata fallback values, no copied formulas.
	var view: Dictionary = Reader.consume_list_response("nw_native", {},
		{"request":0,"current_request":0,"build":"demo","test_mode":false}, raw_slots)
	if view.status != "READY": return _fail(str(view.get("reason", "metadata")))
	var cursor := 0
	for row in next:
		var parsed := Reader.parse_fixture_json(row.raw) if not row.raw.is_empty() else {}
		if parsed.get("status") == "READY" and parsed.get("value") != null:
			if row.kind != "corrupt": row.summary = view.slots[cursor]
			cursor += 1
	rows = next
	ready = true
	last_error = ""
	if selected >= 0 and rows[selected].kind in ["empty", "corrupt"]: selected = -1
	changed.emit()
	return true

func select_slot(slot: int) -> bool:
	if not ready or _busy or slot < 0 or slot >= 5: return false
	selected = slot
	changed.emit()
	return true

func request_new(slot: int, character_name: String) -> bool:
	if _busy or slot < 0 or slot >= 5: return false
	if not refresh(): return false
	var title := character_name.strip_edges()
	if title.is_empty(): return _fail("name_required")
	if rows[slot].kind != "empty": return _fail("slot_not_empty")
	for row in rows:
		if row.data.get("name") == title: return _fail("duplicate_name")
	var data := {"name":title,"ts":int(Time.get_unix_time_from_system()*1000.0),"charIdx":0}
	var raw := JSON.stringify(data)
	if not _write(_key(slot), raw): return false
	if not refresh() or rows[slot].raw != raw: return _fail("readback_failed")
	selected = slot
	changed.emit()
	new_game_requested.emit(slot, rows[slot].data.duplicate(true))
	return true

func request_continue() -> bool:
	if _busy or selected < 0 or not ready: return false
	var slot := selected
	if not refresh(): return false
	if selected != slot or rows[slot].kind not in ["saved", "new"]: return _fail("slot_changed")
	# Selected raw payload only. No active/game key exchange or restore success.
	var data: Dictionary = rows[slot].data.duplicate(true)
	if rows[slot].kind == "new": new_game_requested.emit(slot, data)
	else: continue_requested.emit(slot, data)
	return true

func ask_delete(slot: int) -> bool:
	if _busy or slot < 0 or slot >= 5 or not refresh(): return false
	if rows[slot].kind == "empty": return false
	pending_delete = {"slot":slot,"raw":rows[slot].raw}
	changed.emit()
	return true

func cancel_delete() -> void:
	pending_delete.clear()
	changed.emit()

func confirm_delete() -> bool:
	if _busy or pending_delete.is_empty(): return false
	var slot: int = pending_delete.slot
	var current: Dictionary = storage.get_item(_key(slot))
	if not current.get("ready", false): return _fail(str(current.get("reason", "read")))
	if not current.get("found", false) or current.raw != pending_delete.raw:
		pending_delete.clear()
		refresh()
		return _fail("slot_changed")
	if not _write(_key(slot), "", true, pending_delete.raw): return false
	pending_delete.clear()
	if not refresh() or rows[slot].kind != "empty": return _fail("readback_failed")
	return true

func _write(key: String, raw: String, remove := false, expected: Variant = null) -> bool:
	_busy = true
	_serial += 1
	var id := "lobby-%s-%d" % [_instance, _serial]
	var result: Dictionary = storage.begin_remove(id,key) if remove else storage.begin_set(id,key,raw)
	if result.get("ready",false):
		# Check target again under the adapter's cross-process writer lock.
		var before: Dictionary = storage.get_item(key)
		var matches: bool = before.get("ready",false) and (before.get("raw") == expected)
		if not matches:
			storage.cancel_request(id)
			result = {"reason":"slot_changed"}
		else: result = storage.run_request(id)
	var ok: bool = result.get("ready",false) and result.get("settled",false) and result.get("ok",false)
	storage.release_receipt(id)
	_busy = false
	if not ok: return _fail(str(result.get("reason","io_failed")))
	return true

func _key(slot: int) -> String: return "hellsave_demo_" + str(slot)
func _fail(reason: String) -> bool:
	ready = false if rows.is_empty() else ready
	last_error = reason
	changed.emit()
	return false
func get_snapshot() -> Dictionary:
	return {"ready":ready,"rows":rows.duplicate(true),"selected":selected,
		"pending_delete":pending_delete.duplicate(true),"error":last_error,"busy":_busy,
		"actual_io":true,"restore_implemented":false}
