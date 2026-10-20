extends SceneTree
## SND-06: 원본 JS BGM 전체 객체 + 주입 media/Promise/timer oracle과 단계별 대조.
const CATALOG = preload("res://port_modules/sound_source/bgm_catalog.gd")
const SELECT = preload("res://port_modules/sound_source/bgm_selection.gd")
const LIFE = preload("res://port_modules/sound_source/bgm_lifecycle.gd")
const USERDIR := "EXODUSER-snd-06-Isolated-20261020"
const SOURCE_MAIN := "e556b617190c325ca39f5add04357f5dea5ca87e"
const SOURCE_SHA256 := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const FIXTURE := "res://tests/fixtures/sound_source_bgm_lifecycle_oracle.json"

class FixtureCatalog extends RefCounted:
	var data: Dictionary
	func _init(value: Dictionary) -> void: data = value.duplicate(true)
	func snapshot() -> Dictionary: return data.duplicate(true)

class Media extends RefCounted:
	var events: Array = []
	var audios: Array = []
	var timers: Array = []
	var promises: Array = []
	var listeners: Dictionary = {}
	var gains: Array = [null, null]
	func create_audio(src: String) -> RefCounted:
		var audio = FakeAudio.new(self, audios.size() + 1, src)
		audios.append(audio)
		events.append(["create", audio.id, src])
		return audio
	func set_interval(callback: Callable, ms: int) -> int: return _timer("interval", callback, ms)
	func set_timeout(callback: Callable, ms: int) -> int: return _timer("timeout", callback, ms)
	func _timer(kind: String, callback: Callable, ms: int) -> int:
		var id := timers.size() + 1
		timers.append({"id": id, "kind": kind, "ms": ms, "active": true, "callback": callback})
		events.append([kind, id, ms])
		return id
	func clear_interval(id: int) -> void:
		timers[id - 1].active = false
		events.append(["clear", id])
	func fire(id: int) -> void:
		var timer: Dictionary = timers[id - 1]
		if timer.kind == "timeout": timer.active = false
		events.append(["fire", id])
		timer.callback.call() # 해제됐어도 이미 event loop에 들어온 stale callback을 명시 실행.
	func add_listener(event: String, callback: Callable, passive: bool) -> void:
		listeners[event] = callback
		events.append(["listen", event, passive])
	func remove_listener(event: String, _callback: Callable) -> void:
		listeners.erase(event)
		events.append(["unlisten", event])
	func set_legacy_volume(value: float) -> void:
		for i in 2:
			if gains[i] != null: gains[i] = value
	func settle(index: int, ok: bool) -> void:
		var p: Dictionary = promises[index]
		p.settled = true
		events.append(["settle", index, ok])
		if ok:
			audios[p.audio - 1].paused = false
			if p.success.is_valid(): p.success.call()
		elif p.reject.is_valid(): p.reject.call()
	func snapshot() -> Dictionary:
		var a: Array = []
		for audio in audios: a.append(audio.snapshot())
		var t: Array = []
		for timer in timers: t.append({"id": timer.id, "kind": timer.kind, "ms": timer.ms, "active": timer.active})
		var p: Array = []
		for promise in promises: p.append({"audio": promise.audio, "settled": promise.settled})
		return {"audios": a, "timers": t, "promises": p, "listeners": listeners.keys(), "gains": gains.duplicate()}
	func release_callbacks() -> void:
		# RefCounted 테스트 대역의 순환 참조만 해제. 제품 stop()/원본 전이에는 호출하지 않는다.
		for a in audios:
			a.on_ended = Callable()
			a.on_error = Callable()
			a.media = null
		listeners.clear()
		timers.clear()
		promises.clear()
		audios.clear()

class FakeAudio extends RefCounted:
	var media: RefCounted
	var id: int
	var src: String
	var paused := true
	var preload_mode := "":
		set(v):
			preload_mode = v
			media.events.append(["preload", id, v])
	var volume := 1.0:
		set(v):
			volume = v
			media.events.append(["volume", id, v])
	var current_time := 0.0:
		set(v):
			current_time = v
			media.events.append(["time", id, v])
	var loop := false:
		set(v):
			loop = v
			media.events.append(["loop", id, v])
	var on_ended: Callable:
		set(v):
			on_ended = v
			media.events.append(["onended", id, v.is_valid()])
	var on_error: Callable:
		set(v):
			on_error = v
			media.events.append(["onerror", id, v.is_valid()])
	func _init(owner: RefCounted, number: int, path: String) -> void:
		media = owner
		id = number
		src = path
	func play(success: Callable, reject: Callable) -> void:
		media.events.append(["play", id])
		media.promises.append({"audio": id, "settled": false, "success": success, "reject": reject})
	func pause() -> void:
		paused = true
		media.events.append(["pause", id])
	func remove_src() -> void:
		src = ""
		media.events.append(["remove_src", id])
	func load() -> void: media.events.append(["load", id])
	func snapshot() -> Dictionary:
		return {"id": id, "src": src, "preload": preload_mode, "volume": volume, "time": current_time,
			"loop": loop, "onended": on_ended.is_valid(), "onerror": on_error.is_valid(), "paused": paused}

var assertions := 0
var failures := 0
var current_case := ""
var rows: Array = []
var current_op: Dictionary = {}
var rng_index := 0
var isolated := false
var source_steps := 0
var context: Dictionary = {}
var media: RefCounted

func _initialize() -> void:
	isolated = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR \
		and OS.get_user_data_dir().get_file() == USERDIR
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		printerr("SND06_FAIL ", current_case, " ", label)

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
	var source := ProjectSettings.globalize_path("res://").path_join("../game.html").simplify_path()
	_check(FileAccess.get_file_as_string(source).sha256_text() == SOURCE_SHA256, "latest pinned main source bytes")
	var fixture: Variant = JSON.parse_string(FileAccess.get_file_as_string(FIXTURE))
	_check(fixture is Dictionary, "oracle parses")
	if not fixture is Dictionary:
		_finish()
		return
	_check(fixture.source_ref == SOURCE_MAIN and fixture.source_sha256 == SOURCE_SHA256, "oracle provenance")
	_check(fixture.cases.size() == 93, "all 93 scenarios")
	var catalog = CATALOG.new()
	for row in fixture.cases: _test_case(row, catalog)
	_check(source_steps == 483, "all 483 oracle steps")
	_test_native_contract(catalog)
	_check(current_scene == null and root.get_child_count() == 0, "no Main/audio nodes")
	print("SND06_TRACE ", JSON.stringify(rows))
	_finish()

func _read_context() -> Dictionary: return context.duplicate(true)
func _random() -> float:
	_check(rng_index < current_op.rng.size(), "no extra RNG")
	if rng_index >= current_op.rng.size(): return 0.999999
	var value: float = current_op.rng[rng_index]
	rng_index += 1
	media.events.append(["rng", value])
	return value

func _state(life: RefCounted) -> Dictionary:
	var state: Dictionary = life.snapshot_state()
	state.cur = null if state.cur == null else state.cur.id
	for key in state.cache: state.cache[key] = state.cache[key].id
	for i in state.pending_extra.size(): state.pending_extra[i] = state.pending_extra[i].id
	return state

func _test_case(row: Dictionary, catalog: RefCounted) -> void:
	current_case = row.name
	context = row.get("context", {"bgm_track": "auto", "game": {"stage": 1, "cutscene_done": true, "on": true}}).duplicate(true)
	var input: RefCounted = catalog
	if row.has("tracks"):
		var data: Dictionary = catalog.snapshot()
		data.tracks = row.tracks.duplicate(true)
		input = FixtureCatalog.new(data)
	var selection = SELECT.new(input)
	media = Media.new()
	var life = LIFE.new(selection, media, _read_context, _random)
	_check(life.status() == {"status": "READY"}, "injected dependencies ready")
	var steps: Array = []
	for i in row.ops.size():
		current_op = row.ops[i]
		rng_index = 0
		media.events = []
		var value: Variant = null
		match current_op.kind:
			"play": life.play(current_op.key, current_op.get("force", false))
			"track": life.play_track(current_op.src)
			"get":
				var audio: RefCounted = life.get_audio(current_op.src)
				value = null if audio == null else audio.id
			"stop": life.stop()
			"fade": life.fade_out(current_op.ms)
			"volume": life.set_volume(current_op.value)
			"context": context = current_op.value.duplicate(true)
			"bad": selection.mark_bad(current_op.src)
			"extra": life.enqueue_pending_extra(media.create_audio(current_op.src))
			"interact": life.on_interact()
			"listener":
				if media.listeners.has(current_op.event): media.listeners[current_op.event].call()
			"ended_direct": life.on_ended()
			"ended", "error":
				var audio: RefCounted = media.audios[int(current_op.id) - 1]
				var callback: Callable = audio.on_ended if current_op.kind == "ended" else audio.on_error
				if callback.is_valid(): callback.call()
			"timer":
				_check(current_op.id >= 1 and current_op.id <= media.timers.size(), "source timer exists")
				media.fire(int(current_op.id))
			"settle":
				_check(current_op.index < media.promises.size(), "source play promise exists")
				if current_op.index < media.promises.size():
					_check(not media.promises[int(current_op.index)].settled, "promise settles once")
					media.settle(int(current_op.index), current_op.ok)
			"gains": media.gains = current_op.value.duplicate()
			_: _check(false, "unknown operation")
		var observation := {"value": value, "events": media.events.duplicate(true), "state": _state(life), "media": media.snapshot()}
		for field in ["value", "events", "state", "media"]:
			_check(_equal(observation[field], row.expected[i][field]), "step%d exact source %s" % [i, field])
		steps.append(observation)
		source_steps += 1
	rows.append({"name": current_case, "steps": steps})
	media.release_callbacks()
	media = null

func _test_native_contract(catalog: RefCounted) -> void:
	current_case = "native-readiness-and-identity-snapshots"
	var selection = SELECT.new(catalog)
	var backend = Media.new()
	var a = LIFE.new(selection, backend, _read_context, _random)
	var b = LIFE.new(SELECT.new(catalog), Media.new(), _read_context, _random)
	_check(b.snapshot_state().cur == null and b.snapshot_state().cache.is_empty(), "instances start independent")
	var first: RefCounted = a.get_audio("opaque")
	var snapshot: Dictionary = a.snapshot_state()
	_check(snapshot.cache.opaque == first, "snapshot preserves backend identity")
	snapshot.cache.clear()
	snapshot.cache_lru.append("changed")
	_check(a.snapshot_state().cache.size() == 1 and a.snapshot_state().cache_lru == ["opaque"], "snapshot containers independent")
	_check(b.snapshot_state().cache.is_empty(), "other model untouched")
	var state: Dictionary = a.status()
	state.status = "changed"
	_check(a.status().status == "READY", "status copy independent")
	for bad in [LIFE.new(null, backend, _read_context, _random), LIFE.new(selection, null, _read_context, _random),
		LIFE.new(selection, RefCounted.new(), _read_context, _random), LIFE.new(SELECT.new(null), backend, _read_context, _random),
		LIFE.new(selection, backend, Callable(), _random), LIFE.new(selection, backend, _read_context, Callable())]:
		_check(bad.status().status == "NOT_READY", "invalid dependency explicitly unavailable")
		bad.play("hell1")
		bad.play_track("none")
		bad.stop()
		bad.fade_out(100)
		bad.set_volume(1)
		bad.on_ended()
		bad.on_interact()
		bad.enqueue_pending_extra(first)
		_check(bad.get_audio("none") == null, "unready no media operations")
	_check(backend.audios.size() == 1 and backend.promises.is_empty(), "unready models do not allocate/play")
	backend.release_callbacks()

func _finish() -> void:
	print("SND06_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"source_cases": rows.size(), "source_steps": source_steps, "isolated": isolated,
		"main_booted": current_scene != null, "audio_nodes": root.get_child_count(), "userdir": OS.get_user_data_dir()}))
	quit(0 if failures == 0 else 1)
