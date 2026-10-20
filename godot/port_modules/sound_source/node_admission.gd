extends RefCounted
## SND-07: e556b617 game.html12218–12294/12372–12386. 기존 active owner와 연결 없음.
const POLICY = preload("res://port_modules/sound_source/policy.gd")
var _active: Array = []
var _mobile: bool

func _init(mobile := false) -> void:
	_mobile = mobile

func snapshot() -> Array:
	return _active.duplicate(true)

func active_count() -> int:
	return _active.size()

func register_node(id: int, key: String, priority: float, stamp: float) -> void:
	_active.append({"id": id, "key": key, "pri": priority, "st": stamp})

func finish(id: int) -> bool:
	for i in _active.size():
		if _active[i].id != id: continue
		_active[i] = _active.back()
		_active.pop_back()
		return true
	return false

func evict_lowest(priority: float, stop_cleanup: Callable) -> bool:
	var index := -1
	var minimum := INF
	var oldest := INF
	for i in _active.size():
		var node: Dictionary = _active[i]
		var stamp: float = node.st
		if is_nan(stamp): stamp = 0.0 # 원본 (_st||0)의 numeric NaN
		if node.pri < minimum or (node.pri == minimum and stamp < oldest):
			minimum = node.pri
			oldest = stamp
			index = i
	if index >= 0 and (priority > minimum or (priority >= POLICY.PRI.SKILL and priority >= minimum)):
		stop_cleanup.call(_active[index].id, "priority_eviction")
		return true
	return false

func admit(key: String, priority: float, stop_cleanup: Callable) -> Dictionary:
	# callback은 중지와 finish를 동기 수행한다. source stop→_dn→cap 검사 순서 그대로.
	var limits: Dictionary = POLICY.limits(_mobile)
	if POLICY.is_footstep(key):
		var count := 0
		var oldest: Dictionary = {}
		for node in _active:
			if POLICY.is_footstep(node.key):
				count += 1
				if oldest.is_empty() or node.st < oldest.st: oldest = node
		if count >= limits.step_nodes and not oldest.is_empty():
			stop_cleanup.call(oldest.id, "step_oldest")
	var count := 0
	if priority <= POLICY.PRI.PROJ:
		for node in _active:
			if node.pri <= POLICY.PRI.PROJ: count += 1
		if count >= limits.proj_nodes: return {"status": "DROPPED", "reason": "proj_cap"}
	elif priority <= POLICY.PRI.HIT:
		for node in _active:
			if node.pri <= POLICY.PRI.HIT: count += 1
		if count >= limits.hit_nodes: return {"status": "DROPPED", "reason": "hit_cap"}
	if active_count() >= limits.active_nodes and not evict_lowest(priority, stop_cleanup):
		return {"status": "DROPPED", "reason": "active_cap"}
	return {"status": "READY"}

static func sample_parameters(volume: float, rate: float, pan: float, duration: float, sfx_gain: float) -> Dictionary:
	# numeric falsy는 0/NaN. source gain 최소0 clamp나 timeout의 pitch 보정을 추가하지 않는다.
	if volume == 0.0 or is_nan(volume): volume = 1.0
	if rate == 0.0 or is_nan(rate): rate = 1.0
	if duration == 0.0 or is_nan(duration): duration = 2.0
	return {"gain": minf(1.0, volume * sfx_gain), "rate": rate,
		"pan": clampf(pan, -1.0, 1.0) if absf(pan) > 0.05 else null,
		"timeout_ms": (duration + 0.5) * 1000.0}

static func spatial_resolved(last_t: Dictionary, key: String, volume: float, rate: float,
		x: float, y: float, listener: Variant, gx_mul: float, now_ms: Callable,
		random_unit: Callable, dispatch: Callable, priority_override: Variant = null) -> Dictionary:
	# SND-04 치환 이후 입력. 위치/OPT/State owner를 생성하거나 가져오지 않는다.
	if key.is_empty(): return {"status": "DROPPED", "reason": "empty_key"}
	if listener == null: return {"status": "DROPPED", "reason": "no_listener"}
	if not POLICY.is_skill(key):
		var now: float = now_ms.call()
		var last: float = last_t.get(key, 0.0)
		if now - last < 30.0: return {"status": "DROPPED", "reason": "duplicate_30ms"}
		last_t[key] = now
	var dx: float = x - listener.x
	var dy: float = y - listener.y
	var distance := sqrt(dx * dx + dy * dy)
	var falloff := 1.0 if distance <= 1200.0 else maxf(0.0, 1.0 - (distance - 1200.0) / 800.0)
	if falloff < 0.01: return {"status": "DROPPED", "reason": "distance"}
	var pan := clampf(dx / 600.0, -0.7, 0.7)
	var value := (volume * falloff * falloff) * (gx_mul if gx_mul < 1.0 else 1.0)
	if value < 0.01: return {"status": "DROPPED", "reason": "volume"}
	var result: Variant = dispatch.call(key, value, rate * (0.92 + float(random_unit.call()) * 0.16), 0.0, pan, priority_override)
	return {"status": "DISPATCHED", "reply": result}
