extends RefCounted
## SND-08 source mbus graph. game.html e556b617:12408–12460.
## 주입 media graph adapter 전용. Godot EQ Q/knee/ramp를 임의 대체하지 않는다.
## media: create(kind), set_param(id,param,value), connect_nodes(a,b,param=""),
## disconnect_node(id), destination(). 모든 handle은 adapter 소유 identity 값이다.
var _media: RefCounted
var _gain_reader: Callable
var _bus: Variant = null
var _roles: Dictionary = {}
var _nodes: Array = []

func _init(media: RefCounted, gain_reader: Callable) -> void:
	_media = media
	_gain_reader = gain_reader

func _adapter_ready() -> bool:
	if _media == null or not _gain_reader.is_valid(): return false
	for method in ["create", "set_param", "connect_nodes", "disconnect_node", "destination"]:
		if not _media.has_method(method): return false
	return true

func status() -> Dictionary:
	return {"status": "READY" if _adapter_ready() else "NOT_READY",
		"scope": "injected_source_graph", "native_DSP_parity_verified": false}

static func native_parity() -> Dictionary:
	# AudioEffectEQ/Compressor와 source Biquad(Q)/knee/ramp는 검증 전이다.
	return {"status": "UNVERIFIED", "biquad_Q": false, "compressor_knee": false,
		"automation_ramp": false, "PCM_equivalence": false}

func _node(role: String, kind: String) -> Variant:
	var id: Variant = _media.create(kind)
	_nodes.append(id)
	_roles[role] = id
	return id

func mbus() -> Variant:
	if status().status != "READY": return null
	if _bus != null:
		_media.set_param(_bus, "gain", float(_gain_reader.call()))
		return _bus
	var high: Variant = _node("eq_high", "filter")
	_media.set_param(high, "type", "highshelf")
	_media.set_param(high, "frequency", 6000.0)
	_media.set_param(high, "gain", -9.0)
	var mid: Variant = _node("eq_mid", "filter")
	_media.set_param(mid, "type", "peaking")
	_media.set_param(mid, "frequency", 3000.0)
	_media.set_param(mid, "Q", 0.8)
	_media.set_param(mid, "gain", -5.0)
	var low: Variant = _node("eq_low", "filter")
	_media.set_param(low, "type", "lowshelf")
	_media.set_param(low, "frequency", 250.0)
	_media.set_param(low, "gain", 4.0)
	var hit: Variant = _node("hit", "compressor")
	_media.set_param(hit, "threshold", -12.0)
	_media.set_param(hit, "ratio", 8.0)
	_media.set_param(hit, "attack", 0.001)
	_media.set_param(hit, "release", 0.08)
	var hit_in: Variant = _node("hit_in", "gain")
	_media.set_param(hit_in, "gain", 0.55)
	_media.connect_nodes(hit_in, hit)
	var skill: Variant = _node("skill", "compressor")
	_media.set_param(skill, "threshold", -8.0)
	_media.set_param(skill, "ratio", 4.0)
	_media.set_param(skill, "attack", 0.003)
	_media.set_param(skill, "release", 0.15)
	var skill_in: Variant = _node("skill_in", "gain")
	_media.set_param(skill_in, "gain", 0.8)
	_media.connect_nodes(skill_in, skill)
	var boss: Variant = _node("boss_in", "gain")
	_media.set_param(boss, "gain", 1.0)
	var comp: Variant = _node("master_comp", "compressor")
	_media.set_param(comp, "threshold", -6.0)
	_media.set_param(comp, "knee", 30.0)
	_media.set_param(comp, "ratio", 2.0)
	_media.set_param(comp, "attack", 0.015)
	_media.set_param(comp, "release", 0.35)
	_bus = _node("mbus", "gain")
	_media.set_param(_bus, "gain", float(_gain_reader.call()))
	_media.connect_nodes(hit, _bus)
	_media.connect_nodes(skill, _bus)
	_media.connect_nodes(boss, _bus)
	_media.connect_nodes(_bus, high)
	_media.connect_nodes(high, mid)
	_media.connect_nodes(mid, low)
	_media.connect_nodes(low, comp)
	_media.connect_nodes(comp, _media.destination())
	return _bus

func snapshot() -> Dictionary:
	return {"bus": _bus, "roles": _roles.duplicate(), "nodes": _nodes.duplicate(),
		"native_DSP_parity_verified": false}

func dispose() -> void:
	if _media != null:
		for node in _nodes: _media.disconnect_node(node)
	_nodes.clear()
	_roles.clear()
	_bus = null
