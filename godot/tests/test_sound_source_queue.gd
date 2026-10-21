extends SceneTree
## SND-03: 원본 JS를 실제 실행해 생성한 fixture와 phase를 단계별 대조.
## oracle의 JS throw ↔ native dispatch 실패 packet. 실제 GDScript 예외 catch 검증은 아님.
const PHASE = preload("res://port_modules/sound_source/queue_phase.gd")
const USERDIR := "EXODUSER-snd-03-Isolated-20261020"
const SOURCE_MAIN := "284d7faf49295b2f5061937a47ce96038032ed3c"
const SOURCE_SHA256 := preload("res://source_snapshot/snapshot.gd").SHA256
const FIXTURE := "res://tests/fixtures/sound_source_queue_oracle.json"
var assertions := 0
var failures := 0
var current_case := ""
var rows: Array = []
var events: Array = []
var calls: Array = []
var during: Array = []
var state: Dictionary = {}
var op: Dictionary = {}
var active := 0
var active_reads := 0
var isolate := false


func _initialize() -> void:
	isolate = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR \
		and OS.get_user_data_dir().get_file() == USERDIR
	call_deferred("_run")


func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		printerr("SND03_FAIL ", current_case, " ", label)


func _run() -> void:
	_check(isolate, "effective isolated USERDIR and override")
	_check(current_scene == null and root.get_child_count() == 0, "Main not booted")
	if not isolate:
		_finish()
		return
	var source_path := ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)
	_check(FileAccess.get_file_as_string(source_path).sha256_text() == SOURCE_SHA256, "current source matches pinned main bytes")
	var fixture: Variant = JSON.parse_string(FileAccess.get_file_as_string(FIXTURE))
	_check(fixture is Dictionary, "fixture parses")
	if not fixture is Dictionary:
		_finish()
		return
	_check(fixture.source_ref == SOURCE_MAIN and fixture.source_sha256 == SOURCE_SHA256, "oracle source provenance")
	_check(fixture.cases.size() == 32, "all 32 independent scenarios present")
	for row in fixture.cases:
		_test_source_case(row)
	_test_native_contract()
	_check(current_scene == null and root.get_child_count() == 0, "no playback/Main nodes created")
	print("SND03_TRACE ", JSON.stringify(rows))
	_finish()


func _equal(actual: Variant, expected: Variant) -> bool:
	if (actual is int or actual is float) and (expected is int or expected is float):
		return absf(float(actual) - float(expected)) <= 1e-12 * maxf(1.0, absf(float(expected)))
	if actual is Dictionary and expected is Dictionary:
		if actual.size() != expected.size():
			return false
		for key in expected:
			if not actual.has(key) or not _equal(actual[key], expected[key]):
				return false
		return true
	if actual is Array and expected is Array:
		if actual.size() != expected.size():
			return false
		for i in actual.size():
			if not _equal(actual[i], expected[i]):
				return false
		return true
	return actual == expected


func _now() -> float:
	events.append("now")
	return op.now


func _random() -> float:
	events.append("rng")
	return op.rng


func _audio_time() -> float:
	events.append("audio")
	return op.audio_time


func _active_nodes() -> int:
	active_reads += 1
	return active


func _dispatch(key: String, volume: float, rate: float, time: float, pan: float) -> Dictionary:
	events.append("dispatch")
	calls.append([key, volume, rate, time, pan])
	during.append({"queue_size": state.queue.size(), "frame_t": state.frame_t,
		"frame_counts": state.frame_counts.duplicate(true), "death_cd": state.death_cd,
		"hit_cd": state.hit_cd, "m_sfx_playing": state.m_sfx_playing, "sb_cd": state.sb_cd})
	if op.has("append") and calls.size() == 1:
		state.queue.append(op.append.duplicate(true))
	if calls.size() == int(op.fail_at):
		return {"ok": false, "error": "injected_dispatch"}
	active += int(op.active_delta)
	return {"ok": true}


func _test_source_case(row: Dictionary) -> void:
	current_case = row.name
	state = row.initial.duplicate(true)
	var steps: Array = []
	for i in row.ops.size():
		op = row.ops[i]
		events = []
		calls = []
		during = []
		active_reads = 0
		var failed := false
		if op.op == "enqueue":
			var receipt: Dictionary = PHASE.enqueue_resolved(state, op.key, op.vol, op.rate,
				op.pri, op.gx, _now, _random)
			_check(receipt.status in ["QUEUED", "DROPPED"], "explicit enqueue status")
		else:
			active = int(op.active)
			var before: int = state.queue.size()
			var receipt: Dictionary = PHASE.flush(state, row.mobile, _audio_time, _active_nodes, _dispatch)
			failed = receipt.status == "DISPATCH_FAILED"
			_check(receipt.attempted == calls.size(), "attempt count includes failed attempt")
			_check(receipt.processed == calls.size() - (1 if failed else 0), "successful prefix count")
			_check(receipt.failure == ({"reason": "dispatch_failed", "error": "injected_dispatch"} if failed else {}),
				"backend failure propagated after cleanup")
			_check(active_reads == (calls.size() if failed else before + (1 if op.has("append") else 0)), "active count read per live entry")
		var observation := {"state": state.duplicate(true), "events": events.duplicate(),
			"calls": calls.duplicate(true), "during": during.duplicate(true), "failed": failed}
		var expected: Dictionary = row.expected[i]
		for field in ["state", "events", "calls", "during", "failed"]:
			_check(_equal(observation[field], expected[field]), "step%d exact source %s" % [i, field])
		steps.append(observation)
	rows.append({"name": current_case, "steps": steps})


func _test_native_contract() -> void:
	current_case = "native-error-protocol-and-state-isolation"
	var a: Dictionary = PHASE.new_state()
	var b: Dictionary = PHASE.new_state()
	a.last_t.changed = 100
	a.frame_counts.changed = 8
	a.queue.append({"key": "normal", "vol": 1.0, "rate": 1.0})
	_check(b == {"queue": [], "last_t": {}, "frame_t": 0, "frame_counts": {},
		"death_cd": 0, "hit_cd": 0, "m_sfx_playing": 0, "sb_cd": 0}, "new states independent")
	var result: Dictionary = PHASE.flush(a, false, func(): return 0.0, func(): return 0,
		func(_k, _v, _r, _t, _p): return null)
	_check(result.status == "DISPATCH_FAILED" and result.failure.reason == "invalid_dispatch_result", "invalid backend reply never counts as success")
	_check(a.queue.is_empty() and a.frame_counts.changed == 0 and a.last_t.changed == 100, "invalid reply still cleans queue/counts but retains stamps")
	var callback_counts := {"clock": 0, "rng": 0}
	var clock := func():
		callback_counts.clock += 1
		return 100.0
	var rng := func():
		callback_counts.rng += 1
		return 0.5
	var c: Dictionary = PHASE.new_state()
	var receipt: Dictionary = PHASE.enqueue_resolved(c, "footstep", 0.0, NAN, false, 1.0, clock, rng)
	_check(receipt.status == "QUEUED" and c.queue[0].rate == 1.0 and c.queue[0].vol == 0.0,
		"numeric NaN rate fallback and zero volume boundary")
	_check(callback_counts == {"clock": 0, "rng": 1}, "priority skips clock and consumes one RNG")


func _finish() -> void:
	print("SND03_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"source_cases": rows.size(), "isolated": isolate, "userdir": OS.get_user_data_dir(),
		"Main_booted": current_scene != null, "source_main": SOURCE_MAIN,
		"source_sha256": SOURCE_SHA256, "audible_verified": false,
		"failure_protocol": "dispatch_packet_compared_to_JS_throw"}))
	quit(0 if failures == 0 and isolate and rows.size() == 32 else 1)
