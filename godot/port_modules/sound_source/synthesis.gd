extends RefCounted
## SND-08 source graph synthesis. e556b617 game.html12463–12545.
## Noise PCM/Dist curve는 원본 runtime Float32Array 그대로. 음원 파일 출력·변환 없음.
## media contract: current_time/sample_rate, create/set_param/connect_nodes/disconnect_node,
## automate(id,param,method,value,time), create_buffer(PackedFloat32Array,sample_rate), write_buffer(id,pcm),
## start/stop(id,time_or_null)->{ok,error?}, on_ended(id,Callable), set_timeout(Callable,ms).
## 원본 예외는 명시 THREW packet으로 비교, 임의 GDScript runtime exception catch가 아니다.
var _media: RefCounted
var _master: Callable
var _rng: Callable
var _active := 0
var _maximum: int
var _serial := 0
var _live: Dictionary = {}

func _init(media: RefCounted, master_bus: Callable, random_unit: Callable, maximum := 48) -> void:
	_media = media
	_master = master_bus
	_rng = random_unit
	_maximum = maximum

func _adapter_ready() -> bool:
	if _media == null or not _master.is_valid() or not _rng.is_valid(): return false
	for method in ["create", "set_param", "connect_nodes", "disconnect_node", "automate", "create_buffer", "write_buffer", "start", "stop", "on_ended", "set_timeout"]:
		if not _media.has_method(method): return false
	return true

func status() -> Dictionary:
	return {"status": "READY" if _adapter_ready() else "NOT_READY",
		"scope": "injected_source_graph", "native_oscillator_PCM_verified": false}

func snapshot() -> Dictionary:
	return {"active": _active, "maximum": _maximum, "live": _live.keys()}

func _randomized(value: float) -> float:
	return value * (1.0 + (float(_rng.call()) - 0.5) * 2.0 * 0.05)

static func _falsy(value: float) -> bool:
	return value == 0.0 or is_nan(value)

func _auto(id: Variant, param: String, method: String, value: float, time: float) -> void:
	_media.automate(id, param, method, value, time)

func _envelope(gain: Variant, volume: float, attack: float, duration: float, time: float) -> void:
	_auto(gain, "gain", "set", 0.0, time)
	_auto(gain, "gain", "linear", volume, time + attack)
	_auto(gain, "gain", "exponential", 0.0001, time + duration)

func play(kind: String, args: Array) -> Dictionary:
	if status().status != "READY": return {"status": "NOT_READY"}
	if _active >= _maximum: return {"status": "DROPPED", "reason": "active_cap"}
	if kind not in ["tone", "noise", "dist", "fm", "sub"]:
		return {"status": "UNSUPPORTED", "kind": kind}
	var time: float = _media.current_time
	var nodes: Array = []
	var starters: Array = []
	var ended: Variant = null
	var duration := 0.0
	var gain: Variant = null
	match kind:
		"tone":
			duration = float(args[1])
			var attack := float(args[5]) if args.size() > 5 else 0.0
			if _falsy(attack): attack = 0.004
			var osc: Variant = _media.create("oscillator")
			gain = _media.create("gain")
			nodes = [osc, gain]
			_media.set_param(osc, "type", args[2] if args[2] != "" else "sine")
			_auto(osc, "frequency", "set", _randomized(float(args[0])), time)
			if args.size() > 4: _auto(osc, "frequency", "exponential", maxf(20.0, _randomized(float(args[4]))), time + duration)
			_envelope(gain, float(args[3]), attack, duration, time)
			_media.connect_nodes(osc, gain)
			_media.connect_nodes(gain, _master.call())
			starters = [osc]
			ended = osc
		"noise":
			duration = float(args[0])
			var attack := float(args[4]) if args.size() > 4 else 0.0
			if _falsy(attack): attack = 0.002
			var pcm := PackedFloat32Array()
			pcm.resize(int(float(_media.sample_rate) * duration))
			var buffer: Variant = _media.create_buffer(pcm, _media.sample_rate)
			for i in pcm.size(): pcm[i] = float(_rng.call()) * 2.0 - 1.0
			_media.write_buffer(buffer, pcm)
			var src: Variant = _media.create("buffer_source")
			_media.set_param(src, "buffer", buffer)
			var filter: Variant = _media.create("filter")
			_media.set_param(filter, "type", args[5] if args.size() > 5 and args[5] != "" else "lowpass")
			_auto(filter, "frequency", "set", float(args[1]), time)
			if args.size() > 3: _auto(filter, "frequency", "exponential", maxf(20.0, float(args[3])), time + duration)
			gain = _media.create("gain")
			nodes = [src, filter, gain]
			_envelope(gain, float(args[2]), attack, duration, time)
			_media.connect_nodes(src, filter)
			_media.connect_nodes(filter, gain)
			_media.connect_nodes(gain, _master.call())
			starters = [src]
			ended = src
		"dist":
			duration = float(args[1])
			var osc: Variant = _media.create("oscillator")
			_media.set_param(osc, "type", args[2] if args[2] != "" else "sawtooth")
			_auto(osc, "frequency", "set", _randomized(float(args[0])), time)
			if args.size() > 4 and not _falsy(float(args[4])):
				_auto(osc, "frequency", "exponential", maxf(20.0, float(args[4])), time + duration)
			var shaper: Variant = _media.create("waveshaper")
			var amount := float(args[5]) if args.size() > 5 else 0.0
			if _falsy(amount): amount = 20.0
			var curve := PackedFloat32Array()
			curve.resize(512)
			for i in 512:
				var x := i * 2.0 / 511.0 - 1.0
				curve[i] = (PI + amount) * x / (PI + amount * absf(x))
			_media.set_param(shaper, "curve", curve)
			_media.set_param(shaper, "oversample", "4x")
			gain = _media.create("gain")
			nodes = [osc, shaper, gain]
			_envelope(gain, float(args[3]), 0.003, duration, time)
			_media.connect_nodes(osc, shaper)
			_media.connect_nodes(shaper, gain)
			_media.connect_nodes(gain, _master.call())
			starters = [osc]
			ended = osc
		"fm":
			duration = float(args[3])
			var modulator: Variant = _media.create("oscillator")
			var depth: Variant = _media.create("gain")
			var carrier: Variant = _media.create("oscillator")
			gain = _media.create("gain")
			nodes = [modulator, depth, carrier, gain]
			_auto(modulator, "frequency", "set", float(args[1]), time)
			_auto(depth, "gain", "set", float(args[2]), time)
			_auto(depth, "gain", "exponential", 1.0, time + duration)
			_media.set_param(carrier, "type", args[5] if args.size() > 5 and args[5] != "" else "sine")
			_auto(carrier, "frequency", "set", _randomized(float(args[0])), time)
			if args.size() > 6 and not _falsy(float(args[6])):
				_auto(carrier, "frequency", "exponential", maxf(20.0, float(args[6])), time + duration)
			_media.connect_nodes(modulator, depth)
			_media.connect_nodes(depth, carrier, "frequency")
			_envelope(gain, float(args[4]), 0.003, duration, time)
			_media.connect_nodes(carrier, gain)
			_media.connect_nodes(gain, _master.call())
			starters = [modulator, carrier]
			ended = carrier
		"sub":
			duration = float(args[1])
			var osc: Variant = _media.create("oscillator")
			gain = _media.create("gain")
			nodes = [osc, gain]
			_media.set_param(osc, "type", "sine")
			_auto(osc, "frequency", "set", float(args[0]), time)
			if args.size() > 3 and not _falsy(float(args[3])):
				_auto(osc, "frequency", "exponential", maxf(8.0, float(args[3])), time + duration)
			_auto(gain, "gain", "set", float(args[2]), time)
			_auto(gain, "gain", "set", float(args[2]), time + 0.006)
			_auto(gain, "gain", "exponential", 0.0001, time + duration)
			_media.connect_nodes(osc, gain)
			_media.connect_nodes(gain, _master.call())
			starters = [osc]
			ended = osc
	# FM은 start(mod)→start(carrier)→stop(mod)→stop(carrier) 순서다.
	var failure: Dictionary = {}
	for node in starters:
		var packet: Dictionary = _media.start(node, time)
		if not packet.ok:
			failure = packet
			break
	if failure.is_empty():
		for node in starters:
			var packet: Dictionary = _media.stop(node, time + duration + 0.02)
			if not packet.ok:
				failure = packet
				break
	if not failure.is_empty():
		if kind == "tone":
			_media.stop(ended, null)
			for node in nodes: _media.disconnect_node(node)
		return {"status": "THREW", "error": failure.error}
	_active += 1
	_serial += 1
	var token := {"done": false, "nodes": nodes, "ended": ended, "starters": starters}
	_live[_serial] = token
	var cleanup := _cleanup.bind(_serial, token)
	_media.on_ended(ended, cleanup)
	_media.set_timeout(cleanup, (duration + 0.5) * 1000.0)
	return {"status": "SCHEDULED", "id": _serial}

func _cleanup(id: int, token: Dictionary) -> void:
	if token.done: return
	token.done = true
	_active = maxi(0, _active - 1)
	_live.erase(id)
	for node in token.nodes: _media.disconnect_node(node)

func cancel_all() -> void:
	# 추가 owner adapter 경계. 캡처한 노드만 중지, source timeout/ended와 같은 guard.
	for id in _live.keys():
		var token: Dictionary = _live[id]
		for node in token.starters: _media.stop(node, null)
		_cleanup(id, token)
