extends Node
## SND-07 isolated sample backend. Main/World/Player/State/기존 attack backend 연결0.
## 자체 active 집합/버스만 소유. 단일 게임 공통48상한·master EQ/comp는 후속 조정 대상.
const ADMISSION = preload("res://port_modules/sound_source/node_admission.gd")
const POLICY = preload("res://port_modules/sound_source/policy.gd")
var _admission: RefCounted
var _catalog: RefCounted
var _loader: Callable
var _sfx_volume: Callable
var _clock: Callable
var _audio_clock: Callable
var _source_ready: Callable
var _streams: Dictionary = {}
var _pending: Dictionary = {}
var _voices: Dictionary = {}
var _serial := 0
var _bus := ""
var _configured := false
var _lost := false
var _starts := 0
var _ends := 0
var _history: Array = []

func configure(catalog: RefCounted, load_stream: Callable, sfx_volume: Callable,
		now_ms: Callable, audio_time: Callable, source_ready: Callable, mobile := false) -> Dictionary:
	if _configured or not is_inside_tree(): return {"status": "NOT_READY", "reason": "owner_unavailable_or_configured"}
	if catalog == null or catalog.status().get("status") != "READY" or not load_stream.is_valid() \
		or not sfx_volume.is_valid() or not now_ms.is_valid() or not audio_time.is_valid() or not source_ready.is_valid():
		return {"status": "NOT_READY", "reason": "dependencies_unavailable"}
	_catalog = catalog
	_loader = load_stream
	_sfx_volume = sfx_volume
	_clock = now_ms
	_audio_clock = audio_time
	_source_ready = source_ready
	_admission = ADMISSION.new(mobile)
	_bus = "EXODUSER-SND07-%s" % get_instance_id()
	AudioServer.add_bus()
	AudioServer.set_bus_name(AudioServer.bus_count - 1, _bus)
	AudioServer.set_bus_send(AudioServer.get_bus_index(_bus), "Master")
	process_mode = Node.PROCESS_MODE_ALWAYS
	_configured = true
	return {"status": "READY"}

func install_stream(key: String, stream: AudioStream) -> Dictionary:
	if not _configured or _lost or not _valid_stream(stream): return {"status": "NOT_READY", "reason": "invalid_stream_or_owner"}
	_streams[key] = stream
	_pending.erase(key)
	return {"status": "READY"}

func dispatch(key: String, volume: float, rate: float, start_time: float, pan := 0.0,
		priority_override: Variant = null) -> Dictionary:
	if not _available(): return {"ok": false, "error": "source_unavailable"}
	# 원본은 buffer gate가 caps/footstep 교체보다 먼저다. 현재 요청은 load 후 replay하지 않는다.
	if not _streams.get(key) is AudioStream:
		var source: Dictionary = _catalog.lookup_sample(key)
		if source.status == "READY" and not _pending.has(key):
			_pending[key] = true
			_load_deferred.call_deferred(key, source.value)
		return {"ok": true, "status": "UNLOADED_DROP"}
	var stream: AudioStream = _streams[key]
	var params: Dictionary = ADMISSION.sample_parameters(volume, rate, pan, stream.get_length(), float(_sfx_volume.call()))
	# Godot pitch/gain으로 표현할 수 없는 입력을 clamp해서 가짜 재생하지 않는다.
	if params.rate <= 0.0 or params.gain < 0.0 or not is_finite(params.rate) or not is_finite(params.gain) or start_time < 0.0:
		return {"ok": false, "error": "unsupported_native_parameters"}
	var priority: float = POLICY.priority(key) if priority_override == null else float(priority_override)
	var admission: Dictionary = _admission.admit(key, priority, _cleanup)
	if admission.status != "READY": return {"ok": true, "status": "DROPPED", "reason": admission.reason}
	_serial += 1
	var id := _serial
	var voice := AudioStreamPlayer.new()
	voice.name = "SourceSample%s" % id
	voice.stream = stream
	voice.volume_linear = params.gain
	voice.pitch_scale = params.rate
	var panner_bus := ""
	if params.pan != null:
		panner_bus = _bus + "-pan-%s" % id
		AudioServer.add_bus()
		var index := AudioServer.bus_count - 1
		AudioServer.set_bus_name(index, panner_bus)
		AudioServer.set_bus_send(index, _bus)
		var effect := AudioEffectPanner.new()
		effect.pan = params.pan
		AudioServer.add_bus_effect(index, effect)
	voice.bus = _bus if panner_bus.is_empty() else panner_bus
	add_child(voice)
	var timeout := Timer.new()
	timeout.one_shot = true
	timeout.ignore_time_scale = true
	timeout.wait_time = params.timeout_ms / 1000.0
	add_child(timeout)
	var start_timer: Timer = null
	var delay := maxf(0.0, start_time - float(_audio_clock.call())) if start_time != 0.0 else 0.0
	if delay > 0.0:
		start_timer = Timer.new()
		start_timer.one_shot = true
		start_timer.ignore_time_scale = true
		start_timer.wait_time = delay
		add_child(start_timer)
	_voices[id] = {"player": voice, "timeout": timeout, "start_timer": start_timer, "pan_bus": panner_bus,
		"key": key, "parameters": params, "start_time": start_time, "delay": delay}
	_admission.register_node(id, key, priority, float(_clock.call()))
	voice.finished.connect(_cleanup.bind(id, "finished"), CONNECT_ONE_SHOT)
	voice.tree_exiting.connect(_cleanup.bind(id, "voice_lost"), CONNECT_ONE_SHOT)
	timeout.timeout.connect(_cleanup.bind(id, "timeout"), CONNECT_ONE_SHOT)
	timeout.start() # pitch와 예약 delay로 나누거나 늘리지 않는 원본 duration+.5
	if start_timer != null:
		start_timer.timeout.connect(_start_voice.bind(id), CONNECT_ONE_SHOT)
		start_timer.start()
	else:
		voice.play()
		if not voice.playing:
			_cleanup(id, "start_failed")
			return {"ok": false, "error": "native_start_failed"}
	_starts += 1
	return {"ok": true, "status": "STARTED", "id": id}

func _start_voice(id: int) -> void:
	if _available() and _voices.has(id): _voices[id].player.play()

func _load_deferred(key: String, path: String) -> void:
	if not _available(): return
	# loader는 원본 경로의 byte를 읽는 외부 read-only adapter. 반환 {status,stream?}.
	var result: Variant = _loader.call(key, path)
	if not _available(): return
	if result is Dictionary and result.get("status") == "PENDING": return
	_pending.erase(key)
	if result is Dictionary and result.get("status") == "READY" and result.get("stream") is AudioStream and _valid_stream(result.stream):
		_streams[key] = result.stream

static func _valid_stream(stream: AudioStream) -> bool:
	return stream != null and is_finite(stream.get_length()) and stream.get_length() > 0.0

func fail_load(key: String) -> void:
	# 비동기 read-only adapter 실패 완료. READY 완료는 install_stream으로 전달한다.
	_pending.erase(key)

func _available() -> bool:
	if not _configured or _lost or not is_inside_tree(): return false
	if not _source_ready.call():
		_lost = true
		for id in _voices.keys(): _cleanup(id, "source_lost")
		_pending.clear()
		return false
	return true

func _process(_delta: float) -> void:
	if _configured and not _lost: _available()

func _cleanup(id: int, reason: String) -> void:
	if not _voices.has(id): return
	var entry: Dictionary = _voices[id]
	_voices.erase(id)
	_admission.finish(id) # 원본 swap-pop, 중복 callback은 위 guard로 불변
	_ends += 1
	_history.append({"id": id, "reason": reason})
	if _history.size() > 64: _history.pop_front()
	var voice: AudioStreamPlayer = entry.player
	if is_instance_valid(voice):
		voice.stop()
		voice.stream = null
		voice.queue_free()
	for timer in [entry.timeout, entry.start_timer]:
		if is_instance_valid(timer):
			timer.stop()
			timer.queue_free()
	if not entry.pan_bus.is_empty():
		var index := AudioServer.get_bus_index(entry.pan_bus)
		if index > 0: AudioServer.remove_bus(index)

func snapshot() -> Dictionary:
	var voices: Array = []
	if _admission != null:
		for node in _admission.snapshot():
			var entry: Dictionary = _voices[node.id]
			var voice: AudioStreamPlayer = entry.player
			voices.append({"id": node.id, "key": node.key, "pri": node.pri, "st": node.st,
				"playing": is_instance_valid(voice) and voice.playing, "parameters": entry.parameters.duplicate(true),
				"volume": voice.volume_linear if is_instance_valid(voice) else null,
				"pitch": voice.pitch_scale if is_instance_valid(voice) else null,
				"bus": str(voice.bus) if is_instance_valid(voice) else null,
				"timeout_seconds": entry.timeout.wait_time, "start_time": entry.start_time, "delay": entry.delay})
	return {"status": "READY" if _configured and not _lost else "NOT_READY", "active": voices,
		"starts": _starts, "ends": _ends, "pending": _pending.keys(), "loaded": _streams.keys(),
		"bus": _bus, "history": _history.duplicate(true), "driver": AudioServer.get_driver_name(),
		"master_mix_ported": false, "shared_game_cap": false}

func voice_node(id: int) -> AudioStreamPlayer:
	return _voices[id].player if _voices.has(id) else null

func _exit_tree() -> void:
	for id in _voices.keys(): _cleanup(id, "owner_exit")
	var index := AudioServer.get_bus_index(_bus)
	if index > 0: AudioServer.remove_bus(index)
	_streams.clear()
	_pending.clear()
	_configured = false
