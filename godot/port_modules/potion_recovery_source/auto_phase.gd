extends RefCounted
## DEMO11-25 / QS-02: ordered auto-HP phase. game.html:35893-35910.
## QS-01 owns arithmetic; callbacks own all live reads and writes.
const Potion = preload("res://port_modules/potion_recovery_source/producer.gd")
var _math = Potion.new()
var _read: Callable
var _write: Callable
var _failed = ""
var _prefix: Array = []
var _unported: Array = []
var _running = false

func advance(sp: float, services: Dictionary) -> Dictionary:
	if _running: return {"status":"NOT_READY","reason":"reentrant_phase"}
	if not is_finite(sp) or sp < 0.0: return {"status":"NOT_READY","reason":"invalid_sp"}
	_read = services.get("read", Callable())
	_write = services.get("write", Callable())
	if not _read.is_valid() or not _write.is_valid(): return {"status":"NOT_READY","reason":"callbacks_missing"}
	_running = true
	_failed = ""
	_prefix = []
	_unported = []
	var result = _advance(sp)
	_running = false
	_read = Callable()
	_write = Callable()
	return result

func _advance(sp: float) -> Dictionary:
	# G35893: positive only, no zero clamp; G35894 always reads heal before gates.
	var cd: Variant = _r("cd")
	if not _failed.is_empty(): return _result(false)
	if float(cd) > 0.0:
		if not _w("cd", float(cd) - sp): return _result(false)
	var threshold: Variant = _r("heal")
	if not _failed.is_empty(): return _result(false)
	var lesson: Variant = _r("lesson")
	if not _failed.is_empty() or lesson == true: return _result(false)
	cd = _r("cd")
	if not _failed.is_empty() or float(cd) > 0.0: return _result(false)
	var p: Variant = _r("p")
	if not _failed.is_empty() or float(p.hp) <= 0.0: return _result(false)
	var g: Variant = _r("g")
	if not _failed.is_empty() or float(g.mats) <= 0.0: return _result(false)
	if float(p.mhp) - float(p.hp) < float(threshold): return _result(false)
	# G35896-35902: preserve successful prefix on callback rejection; no retry/refund.
	var before: Variant = _r("system_before")
	if not _failed.is_empty() or not _w("mats", float(g.mats) - 1.0): return _result(false)
	var gl: Variant = _r("gloves")
	if not _failed.is_empty(): return _result(false)
	var belt: Variant = _r("belt")
	if not _failed.is_empty(): return _result(false)
	var regen: Variant = _r("regen")
	if not _failed.is_empty(): return _result(false)
	var cooldown: Dictionary = _math.auto_cooldown(gl.raw, gl.present, belt.raw, belt.present, regen.raw, regen.present)
	if cooldown.status != "READY":
		_failed = cooldown.reason
		return _result(false)
	if not _w("cd", cooldown.value): return _result(false)
	# G35903: second live heal read, not threshold reuse. G35904 State HP writer.
	var heal: Variant = _r("heal")
	if not _failed.is_empty() or not _w("hp", heal): return _result(false)
	# G35905-35910: effects have explicit availability receipts, never fake success.
	if before != null and not _w("recovered", before): return _result(true)
	if not _w("sound", null): return _result(true)
	if not _w("belt_effect", null): return _result(true)
	if not _w("text", heal): return _result(true)
	_w("stats", null)
	return _result(true)

func _r(key: String) -> Variant:
	var packet: Variant = _read.call(key)
	if not packet is Dictionary or packet.get("status") != "READY" or not packet.has("value"):
		_failed = "read_rejected:" + key
		return null
	_prefix.append("read:" + key)
	return packet.value

func _w(key: String, value: Variant) -> bool:
	var packet: Variant = _write.call(key, value)
	if not packet is Dictionary or packet.get("accepted") != true:
		_failed = "write_rejected:" + key
		return false
	_prefix.append("write:" + key)
	if packet.get("implemented", true) == false: _unported.append(packet.get("reason", key))
	return true

func _result(used: bool) -> Dictionary:
	return {"status":"NOT_READY" if not _failed.is_empty() else ("PARTIAL" if not _unported.is_empty() else "READY"),
		"applied":used,"reason":_failed,"prefix":_prefix.duplicate(),"unported":_unported.duplicate()}
