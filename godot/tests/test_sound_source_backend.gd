extends SceneTree
## SND-07: source JS oracle + 실제 AudioStreamPlayer/Timer/격리 버스의 원본 MP3 byte 참조.
const ADMISSION = preload("res://port_modules/sound_source/node_admission.gd")
const POLICY = preload("res://port_modules/sound_source/policy.gd")
const BACKEND = preload("res://scripts/native_sound_backend.gd")
const CATALOG = preload("res://port_modules/sound_source/catalog.gd")
const USERDIR := "EXODUSER-snd-07-Isolated-20261020"
const SOURCE_MAIN := "91e2774b769869e59f80953e148a5c95203b0fea"
const SOURCE_SHA256 := preload("res://source_snapshot/snapshot.gd").SHA256
const FIXTURE := "res://tests/fixtures/sound_source_backend_oracle.json"
var assertions := 0
var failures := 0
var current_case := ""
var isolated := false
var source_steps := 0
var rows: Array = []
var events: Array = []
var records: Dictionary = {}
var admission: RefCounted
var current_op: Dictionary = {}
var calls: Array = []
var gain := 0.6
var stamp := 100.0
var ready := true
var load_requests: Array = []
var load_failure := false
var async_load := false
var witness: AudioStreamMP3
var catalog: RefCounted
var runtime: Dictionary = {}

func _initialize() -> void:
	isolated = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR \
		and OS.get_user_data_dir().get_file() == USERDIR
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		printerr("SND07_FAIL ", current_case, " ", label)

func _equal(actual: Variant, expected: Variant) -> bool:
	if (actual is int or actual is float) and (expected is int or expected is float):
		return absf(float(actual) - float(expected)) <= 1e-12 * maxf(1.0, absf(float(expected)))
	if actual is Dictionary and expected is Dictionary:
		if actual.size() != expected.size(): return false
		for key in expected:
			if not actual.has(key) or not _equal(actual[key], expected[key]): return false
		return true
	if actual is Array and expected is Array:
		if actual.size() != expected.size(): return false
		for i in actual.size():
			if not _equal(actual[i], expected[i]): return false
		return true
	return actual == expected

func _run() -> void:
	_check(isolated, "effective isolated USERDIR")
	_check(current_scene == null and root.get_child_count() == 0, "Main not booted")
	if not isolated:
		_finish()
		return
	var source := ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)
	_check(FileAccess.get_file_as_string(source).sha256_text() == SOURCE_SHA256, "immutable source snapshot bytes")
	var fixture: Variant = JSON.parse_string(FileAccess.get_file_as_string(FIXTURE))
	_check(fixture is Dictionary, "source fixture parses")
	if not fixture is Dictionary:
		_finish()
		return
	_check(fixture.source_ref == SOURCE_MAIN and fixture.source_sha256 == SOURCE_SHA256, "oracle provenance")
	_check(fixture.cases.size() == 29, "all 29 source scenarios")
	for row in fixture.cases:
		if row.type == "admission": _test_admission(row)
		else: _test_spatial(row)
	_check(source_steps == 458, "all 458 source steps")
	print("SND07_TRACE ", JSON.stringify(rows))
	await _test_engine(fixture.asset)
	# AudioServer의 stop playback 해제는 mixer thread에서 완료된다. owner 해제 후 실제 drain.
	await create_timer(0.15).timeout
	witness = null
	catalog = null
	_check(current_scene == null and root.get_child_count() == 0, "no Main/owner left")
	print("SND07_RUNTIME ", JSON.stringify(runtime))
	_finish()

func _stop_cleanup(id: int, _reason: String) -> void:
	events.append(["stop", id])
	_end(id)

func _end(id: int) -> void:
	if admission.finish(id): events.append(["cleanup", id])

func _test_admission(row: Dictionary) -> void:
	current_case = row.name
	admission = ADMISSION.new(row.get("mobile", false))
	records = {}
	var serial := 0
	var steps: Array = []
	for i in row.ops.size():
		current_op = row.ops[i]
		events = []
		var value: Variant = null
		match current_op.kind:
			"play":
				if current_op.get("buffer", true):
					var priority: float = POLICY.priority(current_op.key) if not current_op.has("pri") else current_op.pri
					var reply: Dictionary = admission.admit(current_op.key, priority, _stop_cleanup)
					if reply.status == "READY":
						serial += 1
						value = serial
						admission.register_node(serial, current_op.key, priority, current_op.now)
						records[serial] = {"parameters": ADMISSION.sample_parameters(current_op.vol, current_op.rate,
							current_op.pan, current_op.duration, row.get("sfx", 0.6)), "start": current_op.start}
			"finish": _end(int(current_op.id))
			"evict": value = admission.evict_lowest(current_op.pri, _stop_cleanup)
			_: _check(false, "unknown admission operation")
		var active: Array = admission.snapshot()
		for node in active:
			node.parameters = records[node.id].parameters.duplicate(true)
			node.start = records[node.id].start
		var observation := {"value": value, "events": events.duplicate(true), "active": active, "count": admission.active_count()}
		for field in ["value", "events", "active", "count"]:
			_check(_equal(observation[field], row.expected[i][field]), "step%d exact source %s" % [i, field])
		steps.append(observation)
		source_steps += 1
	rows.append({"name": current_case, "steps": steps})

func _now() -> float: return current_op.now
func _random() -> float:
	events.append(["rng", current_op.random])
	return current_op.random
func _dispatch(key: String, volume: float, rate: float, time: float, pan: float, priority: Variant) -> Dictionary:
	calls.append([key, volume, rate, time, pan, priority])
	return {"ok": true}

func _test_spatial(row: Dictionary) -> void:
	current_case = row.name
	var last: Dictionary = {}
	var steps: Array = []
	for i in row.ops.size():
		current_op = row.ops[i]
		events = []
		calls = []
		ADMISSION.spatial_resolved(last, current_op.key, current_op.vol, current_op.rate, current_op.x, current_op.y,
			current_op.listener, current_op.gx, _now, _random, _dispatch, current_op.pri)
		var observation := {"events": events.duplicate(true), "calls": calls.duplicate(true), "last": last.duplicate(true)}
		for field in ["events", "calls", "last"]:
			_check(_equal(observation[field], row.expected[i][field]), "step%d exact source %s" % [i, field])
		steps.append(observation)
		source_steps += 1
	rows.append({"name": current_case, "steps": steps})

func _sfx_gain() -> float: return gain
func _stamp() -> float: return stamp
func _audio_time() -> float: return 0.0
func _source_ready() -> bool: return ready
func _load_stream(key: String, path: String) -> Dictionary:
	load_requests.append({"key": key, "path": path})
	if async_load: return {"status": "PENDING"}
	if load_failure: return {"status": "NOT_READY"}
	return {"status": "READY", "stream": witness}

func _backend(mobile := false) -> Node:
	var backend = BACKEND.new()
	root.add_child(backend)
	_check(backend.configure(catalog, _load_stream, _sfx_gain, _stamp, _audio_time, _source_ready, mobile).status == "READY", "isolated backend ready")
	return backend

func _dispose(backend: Node) -> void:
	backend.queue_free()
	await process_frame
	await process_frame

func _test_engine(asset: Dictionary) -> void:
	current_case = "actual-original-MP3-and-engine-lifecycle"
	var original_buses := AudioServer.bus_count
	var bytes := FileAccess.get_file_as_bytes(asset.native_path)
	_check(bytes.size() == asset.bytes, "native MP3 byte length equals source main asset")
	_check(FileAccess.get_sha256(asset.native_path) == asset.sha256, "native MP3 SHA256 equals source main original")
	catalog = CATALOG.new()
	_check(catalog.lookup_sample(asset.key).value == asset.original_path, "SND02 source mapping used verbatim")
	witness = AudioStreamMP3.new()
	witness.data = bytes
	_check(witness.get_length() > 0.0, "actual original MP3 decodes, no synthetic PCM")
	runtime = {"asset": asset, "duration": witness.get_length(), "driver": AudioServer.get_driver_name(),
		"audible_verified": false, "PCM_verified": false, "existing_game_connected": false}
	var invalid = BACKEND.new()
	_check(invalid.configure(catalog, _load_stream, _sfx_gain, _stamp, _audio_time, _source_ready).status == "NOT_READY", "missing tree owner is unavailable")
	invalid.free()
	var backend := _backend()
	load_requests = []
	_check(backend.install_stream("invalid", AudioStreamMP3.new()).status == "NOT_READY", "empty native MP3 rejected rather than fake playback")
	_check(backend.dispatch(asset.key, 0.5, 1.0, 0.0).status == "UNLOADED_DROP", "first missing buffer request dropped")
	_check(backend.dispatch(asset.key, 0.5, 1.0, 0.0).status == "UNLOADED_DROP", "pending duplicate dropped")
	_check(backend.snapshot().pending == [asset.key] and backend.snapshot().starts == 0, "one pending and no early playback")
	await process_frame
	_check(load_requests == [{"key": asset.key, "path": asset.original_path}], "deferred read-only loader exact source URL once")
	_check(backend.snapshot().loaded == [asset.key] and backend.snapshot().starts == 0, "load does not replay abandoned requests")
	_check(backend.dispatch("missing", 1.0, 1.0, 0.0).status == "UNLOADED_DROP", "unknown buffer silent without loader")
	await process_frame
	_check(load_requests.size() == 1, "unknown not given invented file")
	gain = 0.6
	var reply: Dictionary = backend.dispatch(asset.key, 0.0, 4.0, 0.0, 0.7)
	_check(reply.status == "STARTED", "decoded original starts real AudioStreamPlayer")
	var snap: Dictionary = backend.snapshot()
	var actual: Dictionary = snap.active[0]
	var player: AudioStreamPlayer = backend.voice_node(reply.id)
	_check(player is AudioStreamPlayer and player.playing and player.stream == witness, "actual node is playing original stream")
	_check(actual.parameters.gain == 0.6 and absf(actual.volume - 0.6) < 1e-6, "vol=0 uses source (vol||1), real engine gain .6")
	_check(actual.pitch == 4.0, "real pitch scale set")
	_check(backend._voices[reply.id].timeout.ignore_time_scale and backend.process_mode == Node.PROCESS_MODE_ALWAYS, "wall-clock timeout unaffected by native time scale/pause")
	_check(absf(actual.timeout_seconds - (witness.get_length() + 0.5)) < 1e-9, "fallback timeout not divided by pitch")
	var panner_index := AudioServer.get_bus_index(actual.bus)
	_check(panner_index > 0 and AudioServer.get_bus_effect_count(panner_index) == 1, "isolated per-voice panner bus")
	_check(absf(AudioServer.get_bus_effect(panner_index, 0).pan - 0.7) < 1e-6, "actual panner receives source pan")
	_check(AudioServer.get_bus_volume_db(AudioServer.get_bus_index(snap.bus)) == 0.0, "base bus unity; master mix remains SND08")
	await create_timer(witness.get_length() / 4.0 + 0.4).timeout
	snap = backend.snapshot()
	_check(snap.active.is_empty() and snap.ends == 1 and snap.history[0].reason == "finished", "natural engine finished cleans one voice")
	backend._cleanup(reply.id, "late_timeout")
	_check(backend.snapshot().ends == 1 and AudioServer.get_bus_index(actual.bus) == -1, "late cleanup idempotent, panner removed once")
	runtime.natural_finish = snap.history.duplicate(true)
	gain = 0.0
	reply = backend.dispatch(asset.key, 1.0, 0.1, 0.0, 0.05)
	actual = backend.snapshot().active[0]
	_check(actual.parameters.gain == 0.0 and actual.volume == 0.0, "current OPT gain0 silences newly created actual voice")
	_check(actual.parameters.pan == null and actual.bus == backend.snapshot().bus, "pan threshold .05 does not allocate panner")
	await create_timer(witness.get_length() + 0.7).timeout
	snap = backend.snapshot()
	_check(snap.active.is_empty() and snap.ends == 2 and snap.history[-1].reason == "timeout", "real timeout cleans slow playback before pitch-adjusted end")
	runtime.timeout_finish = snap.history[-1].duplicate(true)
	gain = 0.6
	reply = backend.dispatch(asset.key, 1.0, 1.0, 10.0, 2.0)
	actual = backend.snapshot().active[0]
	_check(backend._voices[reply.id].start_timer.ignore_time_scale, "reserved start timer uses wall clock")
	_check(actual.delay == 10.0 and actual.start_time == 10.0 and not actual.playing, "future absolute start schedules silence, not seek")
	_check(actual.parameters.pan == 1.0, "raw pan clamp1")
	backend.voice_node(reply.id).queue_free()
	await process_frame
	_check(backend.snapshot().active.is_empty() and backend.snapshot().history[-1].reason == "voice_lost", "external node loss cleans timers and bus")
	# 예약 시작은 offset seek가 아니라 별도 wall-clock timer로 실제 시작한다.
	reply = backend.dispatch(asset.key, 1.0, 1.0, 0.05)
	_check(not backend.voice_node(reply.id).playing, "scheduled voice initially silent")
	await create_timer(0.1).timeout
	_check(backend.voice_node(reply.id).playing, "real scheduled timer starts from beginning")
	await _dispose(backend)
	_check(AudioServer.bus_count == original_buses, "owner exit restores original buses")
	load_failure = true
	backend = _backend()
	load_requests = []
	backend.dispatch(asset.key, 1.0, 1.0, 0.0)
	await process_frame
	_check(backend.snapshot().pending.is_empty() and backend.snapshot().loaded.is_empty() and backend.snapshot().starts == 0, "failed load clears pending and never plays")
	backend.dispatch(asset.key, 1.0, 1.0, 0.0)
	await process_frame
	_check(load_requests.size() == 2, "later request retries failed load without replay")
	await _dispose(backend)
	load_failure = false
	async_load = true
	backend = _backend()
	load_requests = []
	backend.dispatch(asset.key, 1.0, 1.0, 0.0)
	await process_frame
	backend.dispatch(asset.key, 1.0, 1.0, 0.0)
	await process_frame
	_check(load_requests.size() == 1 and backend.snapshot().pending == [asset.key], "async pending stays coalesced across frames")
	backend.fail_load(asset.key)
	_check(backend.snapshot().pending.is_empty(), "async failure clears pending")
	backend.dispatch(asset.key, 1.0, 1.0, 0.0)
	await process_frame
	_check(load_requests.size() == 2 and backend.snapshot().starts == 0, "async retry still drops original request")
	backend.install_stream(asset.key, witness)
	_check(backend.snapshot().pending.is_empty() and backend.snapshot().starts == 0, "async completion caches without replay")
	_check(backend.dispatch(asset.key, 1.0, 1.0, 0.0).status == "STARTED", "only subsequent request plays async result")
	await _dispose(backend)
	async_load = false
	await _test_caps(asset.key)
	_check(AudioServer.bus_count == original_buses, "cap tests leave no buses")
	backend = _backend()
	backend.install_stream(asset.key, witness)
	backend.dispatch(asset.key, 1.0, 1.0, 0.0, -0.7)
	var owner_bus: String = backend.snapshot().bus
	ready = false
	await process_frame
	_check(backend.snapshot().status == "NOT_READY" and backend.snapshot().active.is_empty(), "source readiness loss tears down actual voices")
	_check(backend.snapshot().history[-1].reason == "source_lost" and not backend.dispatch(asset.key, 1.0, 1.0, 0.0).ok, "loss prevents new playback")
	await _dispose(backend)
	ready = true
	_check(AudioServer.get_bus_index(owner_bus) == -1 and AudioServer.bus_count == original_buses, "lost owner bus disposed")
	backend = _backend()
	backend.install_stream(asset.key, witness)
	backend.dispatch(asset.key, 1.0, 1.0, 0.0, -0.7)
	await _dispose(backend)
	_check(AudioServer.bus_count == original_buses, "live owner exit tears down active voice and pan bus")
	runtime.final_bus_count = AudioServer.bus_count
	runtime.initial_bus_count = original_buses

func _test_caps(key: String) -> void:
	for mobile in [false, true]:
		current_case = "actual-cap-mobile-%s" % mobile
		var backend := _backend(mobile)
		backend.install_stream(key, witness)
		var cap := 16 if mobile else 48
		for i in cap:
			stamp = 100.0 + i
			_check(backend.dispatch(key, 1.0, 1.0, 0.0, 0.0, 9).status == "STARTED", "fill actual active pool with priority override9")
		_check(backend.snapshot().active.size() == cap, "actual active count equals source cap")
		_check(backend.dispatch(key, 1.0, 1.0, 0.0, 0.0, 9).status == "DROPPED", "same VOICE9 rejected")
		_check(backend.dispatch(key, 1.0, 1.0, 0.0, 0.0, 10).status == "STARTED", "higher SKILL10 evicts oldest9")
		_check(backend.snapshot().history[-1].id == 1 and backend.snapshot().ends == 1, "actual oldest chosen, one cleanup")
		await _dispose(backend)
		backend = _backend(mobile)
		backend.install_stream(key, witness)
		for i in cap:
			stamp = 100.0 + i
			_check(backend.dispatch(key, 1.0, 1.0, 0.0, 0.0, 10).status == "STARTED", "fill SKILL10")
		_check(backend.dispatch(key, 1.0, 1.0, 0.0, 0.0, 10).status == "STARTED", "same SKILL10 replaces oldest10")
		_check(backend.snapshot().history[-1].id == 1, "same priority oldest")
		await _dispose(backend)
		backend = _backend(mobile)
		backend.install_stream(key, witness)
		var proj_cap := 2 if mobile else 5
		for i in proj_cap: _check(backend.dispatch(key, 1.0, 1.0, 0.0, 0.0, 1).status == "STARTED", "actual PROJ fill")
		_check(backend.dispatch(key, 1.0, 1.0, 0.0, 0.0, 1).reason == "proj_cap", "actual PROJ cap5/2")
		_check(backend.dispatch(key, 1.0, 1.0, 0.0, 0.0, 2).reason == "hit_cap", "HIT counts already active PROJ")
		await _dispose(backend)
	# STEP는 주입 stream을 테스트 전용으로 두 key에 연결해 admission 배선만 검사한다.
	# 실제 footstep 원음 매핑/청감 검증으로 세지 않는다. 제품 registry에는 이 alias가 없다.
	var backend := _backend()
	backend.install_stream("footstep", witness)
	backend.install_stream("footstep2", witness)
	stamp = 100.0
	backend.dispatch("footstep", 1.0, 1.0, 0.0)
	stamp = 200.0
	backend.dispatch("footstep2", 1.0, 1.0, 0.0)
	backend.dispatch("footstep", 1.0, 1.0, 0.0)
	_check(backend.snapshot().active.size() == 2 and backend.snapshot().history[-1].id == 1, "actual STEP two nodes, self oldest eviction")
	await _dispose(backend)

func _finish() -> void:
	print("SND07_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "source_cases": rows.size(),
		"source_steps": source_steps, "isolated": isolated, "main_booted": current_scene != null,
		"nodes_left": root.get_child_count(), "audible_verified": false, "PCM_verified": false, "userdir": OS.get_user_data_dir()}))
	quit(0 if failures == 0 else 1)
