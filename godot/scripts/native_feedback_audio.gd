extends Node

const SYNTH = preload("res://scripts/native_feedback_synth.gd")
var _main: Node
var _voices: Array[AudioStreamPlayer] = []
var _last: Dictionary = {}
var _voice_at := -10000
var _voice: AudioStreamMP3
var _cache: Dictionary = {}
var _jobs: Array = []
var _pending: Array = []
var _audio_rng := RandomNumberGenerator.new()

func configure(owner: Node) -> void:
	_main = owner
	_audio_rng.randomize()
	var bytes: PackedByteArray = FileAccess.get_file_as_bytes("res://assets/sfx/voice/silvertail_resource_fail.mp3")
	if not bytes.is_empty():
		_voice = AudioStreamMP3.new()
		_voice.data = bytes
	for key in ["levelup", "pickup"]:
		_cache[key] = _prepare(key)

static func source_plan(key: String) -> Array:
	return SYNTH.source_plan(key)

func _prepare(key: String) -> Dictionary:
	var job: RefCounted = SYNTH.new(key)
	var task: int = WorkerThreadPool.add_task(Callable(job, "bake"))
	var entry := {"task": task, "job": job, "collected": false}
	_jobs.append(entry)
	return entry

func _collect(entry: Dictionary) -> bool:
	if not entry.collected:
		if not WorkerThreadPool.is_task_completed(int(entry.task)):
			return false
		WorkerThreadPool.wait_for_task_completion(int(entry.task))
		entry.collected = true
		_jobs.erase(entry)
	return true

func play_source(key: String) -> bool:
	var start: int = Time.get_ticks_usec()
	var settings: Dictionary = _main.read_native_attack_audio_settings()
	if settings.get("ready") != true or not _cache.has(key):
		_last = {"key": key, "accepted": false, "reason": settings.get("reason", "unsupported_source_key")}
		return false
	var entry: Dictionary = _cache[key]
	_cache[key] = _prepare(key)
	var request := {"entry": entry, "gain": settings.sfx_gain, "key": key, "requested_us": start}
	_last = {"key": key, "accepted": true, "layers": source_plan(key).size(), "gain": settings.sfx_gain,
		"dispatch_us": Time.get_ticks_usec() - start, "synthesis_on_game_thread": false,
		"unported": ["WebAudio_master_EQ3_compressor_knee30", "global_active_node_cap"]}
	if _collect(entry):
		_start_prepared(request)
	else:
		_pending.append(request)
	return true

func _start_prepared(request: Dictionary) -> void:
	var job: RefCounted = request.entry.job
	if job.get("stream") == null:
		push_error("Source feedback synthesis unavailable; no substitute sound.")
		return
	_play(job.get("stream"), float(request.gain))
	if _last.get("key") == request.key:
		_last["worker_build_us"] = job.get("build_us")
		_last["wait_us"] = Time.get_ticks_usec() - int(request.requested_us)
		_last["samples"] = job.get("stream").data.size() / 2

func _process(_delta: float) -> void:
	for request in _pending.duplicate():
		if _collect(request.entry):
			_start_prepared(request)
			_pending.erase(request)

func play_resource_voice() -> void:
	var now: int = Time.get_ticks_msec()
	if now - _voice_at < 10000 or _voice == null:
		return
	var settings: Dictionary = _main.read_native_attack_audio_settings()
	if settings.get("ready") != true:
		return
	_voice_at = now
	_play(_voice, pow(float(settings.sfx_gain), 2.0), 0.92 + _audio_rng.randf() * 0.16)

func _play(stream: AudioStream, gain: float, pitch: float = 1.0) -> void:
	var voice := AudioStreamPlayer.new()
	voice.stream = stream
	voice.pitch_scale = pitch
	voice.volume_linear = gain
	add_child(voice)
	_voices.append(voice)
	voice.finished.connect(func() -> void:
		voice.stream = null
		_voices.erase(voice)
		voice.queue_free())
	voice.play()

func snapshot() -> Dictionary:
	return {"last": _last.duplicate(true), "active": _voices.size(), "voice_ready": _voice != null, "pending": _pending.size(), "worker_jobs": _jobs.size()}

func _exit_tree() -> void:
	for entry in _jobs.duplicate():
		WorkerThreadPool.wait_for_task_completion(int(entry.task))
	_jobs.clear()
	_cache.clear()
	_pending.clear()
	for voice in _voices:
		voice.stop()
		voice.stream = null
	_voices.clear()
	_voice = null
