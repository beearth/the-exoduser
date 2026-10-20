extends RefCounted
## 시험 전용 source AudioContext graph. 실제 Godot DSP/PCM 출력 adapter가 아니다.
var current_time := 5.25
var sample_rate := 1000
var events: Array = []
var nodes: Array = []
var buffers: Array = []
var timers: Array = []
var _ended: Dictionary = {}
var fail := ""
var rng_index := 0
const RANDOM := [0.0, 0.25, 0.5, 0.75, 0.999999]

static func normal(value: Variant) -> Variant:
	if value is PackedFloat32Array: return Array(value)
	if value is Dictionary:
		var result := {}
		for key in value: result[key] = normal(value[key])
		return result
	if value is Array:
		var result: Array = []
		for entry in value: result.append(normal(entry))
		return result
	return value

func random_unit() -> float:
	var value: float = RANDOM[rng_index % RANDOM.size()]
	rng_index += 1
	events.append(["rng", value])
	return value

func destination() -> int: return 0
func create(kind: String) -> int:
	var id := nodes.size() + 1
	nodes.append({"id": id, "kind": kind, "params": {}})
	events.append(["create", kind, id])
	return id
func set_param(id: int, param: String, value: Variant) -> void:
	nodes[id - 1].params[param] = normal(value)
	events.append(["set", id, param, normal(value)])
func connect_nodes(a: int, b: int, param := "") -> void: events.append(["connect", a, b, param])
func disconnect_node(id: int) -> void: events.append(["disconnect", id])
func automate(id: int, param: String, method: String, value: float, time: float) -> void:
	events.append(["auto", id, param, method, value, time])
func create_buffer(data: PackedFloat32Array, rate: int) -> int:
	var id := buffers.size() + 1
	buffers.append({"id": id, "rate": rate, "data": Array(data)})
	events.append(["buffer", id, data.size(), rate])
	return id
func write_buffer(id: int, data: PackedFloat32Array) -> void: buffers[id - 1].data = Array(data)
func start(id: int, time: Variant) -> Dictionary: return _transport("start", id, time)
func stop(id: int, time: Variant) -> Dictionary: return _transport("stop", id, time)
func _transport(kind: String, id: int, time: Variant) -> Dictionary:
	events.append([kind, id, time])
	if fail == kind:
		fail = ""
		return {"ok": false, "error": "injected:" + kind}
	return {"ok": true}
func on_ended(id: int, callback: Callable) -> void:
	_ended[id] = callback
	events.append(["onended", id, callback.is_valid()])
func end(id: int) -> void:
	if _ended.has(id): _ended[id].call()
func set_timeout(callback: Callable, ms: float) -> int:
	var id := timers.size() + 1
	timers.append({"id": id, "ms": ms, "callback": callback, "fired": false})
	events.append(["timeout", id, ms])
	return id
func fire(id: int) -> void:
	var timer: Dictionary = timers[id - 1]
	timer.fired = true
	events.append(["fire", id])
	timer.callback.call()
func snapshot(active: int) -> Dictionary:
	var copy: Array = nodes.duplicate(true)
	for node in copy: node["onended"] = _ended.has(node.id)
	var time: Array = []
	for timer in timers: time.append({"id": timer.id, "ms": timer.ms, "fired": timer.fired})
	return {"active": active, "nodes": copy, "buffers": buffers.duplicate(true), "timers": time}
func release_callbacks() -> void:
	_ended.clear()
	timers.clear()
