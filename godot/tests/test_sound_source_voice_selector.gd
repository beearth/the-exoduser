extends SceneTree
## SND-04: 원본 JS selector와 실제 sample/direct 진입 prefix의 상태·호출 순서 oracle.
## direct는 원본 buffer 미존재 gate까지. 실제 오디오/버스/청취 검증이 아니다.
const VOICE = preload("res://port_modules/sound_source/voice_selector.gd")
const CATALOG = preload("res://port_modules/sound_source/catalog.gd")
const PHASE = preload("res://port_modules/sound_source/queue_phase.gd")
const USERDIR := "EXODUSER-snd-04-Isolated-20261020"
const SOURCE_MAIN := "284d7faf49295b2f5061937a47ce96038032ed3c"
const SOURCE_SHA256 := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const FIXTURE := "res://tests/fixtures/sound_source_voice_selector_oracle.json"
var assertions := 0
var failures := 0
var current_case := ""
var rows: Array = []
var events: Array = []
var op: Dictionary = {}
var now := 0.0
var rng_index := 0
var selector: RefCounted
var isolated := false


func _initialize() -> void:
	isolated = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR \
		and OS.get_user_data_dir().get_file() == USERDIR
	call_deferred("_run")


func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		printerr("SND04_FAIL ", current_case, " ", label)


func _run() -> void:
	_check(isolated, "effective isolated USERDIR and override")
	_check(current_scene == null and root.get_child_count() == 0, "Main not booted")
	if not isolated:
		_finish()
		return
	var source_path := ProjectSettings.globalize_path("res://").path_join("../game.html").simplify_path()
	_check(FileAccess.get_file_as_string(source_path).sha256_text() == SOURCE_SHA256, "source byte match pinned main")
	var fixture: Variant = JSON.parse_string(FileAccess.get_file_as_string(FIXTURE))
	_check(fixture is Dictionary, "fixture parses")
	if not fixture is Dictionary:
		_finish()
		return
	_check(fixture.source_ref == SOURCE_MAIN and fixture.source_sha256 == SOURCE_SHA256, "oracle source provenance")
	_check(fixture.mapping_count == 42 and fixture.cases.size() == 71, "all map keys and 71 scenarios")
	_check(VOICE.REPEAT_BLOCK_MS == 10000 and _equal(VOICE.VARIANT_COUNTS, fixture.variant_counts), "10000ms and seven source variant branches")
	var catalog = CATALOG.new()
	_check(catalog.status().status == "READY", "SND-02 catalog ready")
	for row in fixture.cases:
		_test_source_case(row, catalog)
	_test_native_contract(catalog)
	selector = null
	_check(current_scene == null and root.get_child_count() == 0, "no playback/Main nodes created")
	print("SND04_TRACE ", JSON.stringify(rows))
	_finish()


func _clock() -> float:
	events.append(["clock", now])
	return now


func _random() -> float:
	_check(rng_index < op.rng.size(), "no unexpected extra RNG call")
	if rng_index >= op.rng.size():
		return 0.0
	var value: float = op.rng[rng_index]
	rng_index += 1
	events.append(["rng", value])
	now += op.advance_on_rng
	return value


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


func _test_source_case(row: Dictionary, catalog: RefCounted) -> void:
	current_case = row.name
	selector = VOICE.new(catalog)
	var queue: Dictionary = PHASE.new_state()
	var steps: Array = []
	for i in row.ops.size():
		op = row.ops[i]
		now = op.now
		rng_index = 0
		events = []
		var result: Dictionary = selector.select_key(op.key, int(op.char), _clock, _random)
		_check(result.status in ["READY", "SILENT"], "explicit ready or source silence")
		var key: String = result.key
		if op.path == "sample" and not key.is_empty():
			PHASE.enqueue_resolved(queue, key, op.vol, op.rate, op.pri, op.gx, _clock, _random)
		# direct는 원본의 선택→미존재 buffer return. backend 동작은 이 테스트에 포함하지 않는다.
		var observation := {"key": key, "events": events.duplicate(true),
			"last_at": selector.snapshot_last_at(), "queue": queue.queue.duplicate(true),
			"queue_last_t": queue.last_t.duplicate(true)}
		for field in ["key", "events", "last_at", "queue", "queue_last_t"]:
			_check(_equal(observation[field], row.expected[i][field]), "step%d exact source %s" % [i, field])
		steps.append(observation)
	rows.append({"name": current_case, "steps": steps})


func _test_native_contract(catalog: RefCounted) -> void:
	current_case = "native-state-isolation-and-unavailable-catalog"
	op = {"rng": [0.0, 0.75], "advance_on_rng": 0.0}
	now = 1000.0
	rng_index = 0
	events = []
	var a = VOICE.new(catalog)
	var b = VOICE.new(catalog)
	_check(a.status() == {"status": "READY", "mapping_count": 42}, "exact catalog status")
	var status: Dictionary = a.status()
	status.mapping_count = 0
	_check(a.status().mapping_count == 42, "status mutation isolated")
	_check(a.select_key("voice_attack", 1, _clock, _random) == {"status": "READY", "key": "silvertail_attack"}, "single mapping selects")
	_check(b.snapshot_last_at().is_empty(), "separate instance has no shared stamp")
	var snapshot: Dictionary = a.snapshot_last_at()
	snapshot.clear()
	_check(a.select_key("voice_bladefuse", 1, _clock, _random) == {"status": "SILENT", "key": "", "reason": "repeat_block"}, "alias blocked despite external snapshot mutation")
	_check(b.select_key("voice_attack", 1, _clock, _random).key == "silvertail_attack", "second instance independently eligible")
	_check(a.select_key("male_grunt", 1, _clock, _random).key == "silvertail_grunt1", "first instance chooses variant1")
	rng_index = 0
	_check(b.select_key("male_grunt", 1, _clock, _random).key == "silvertail_grunt1", "second instance variant stamps independent")
	var missing = VOICE.new(null)
	events = []
	_check(missing.select_key("voice_attack", 1, _clock, _random) == {"status": "NOT_READY", "reason": "voice_catalog_unavailable", "key": ""}, "missing catalog is not source silence or fallback")
	_check(missing.select_key("voice_attack", 0, _clock, _random) == {"status": "READY", "key": "voice_attack"}, "other char passthrough precedes map lookup")
	_check(events.is_empty() and missing.snapshot_last_at().is_empty(), "unavailable/passthrough consumes no clock or RNG")
	var invalid_catalog = CATALOG.new("res://data/__snd04_missing_catalog__.json")
	var invalid = VOICE.new(invalid_catalog)
	_check(invalid.status().status == "NOT_READY" and invalid.status().catalog_status.reason == "catalog_file_unavailable", "catalog failure details preserved")


func _finish() -> void:
	print("SND04_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"source_cases": rows.size(), "source_steps": 387, "isolated": isolated,
		"userdir": OS.get_user_data_dir(), "Main_booted": current_scene != null,
		"source_main": SOURCE_MAIN, "source_sha256": SOURCE_SHA256, "audible_verified": false,
		"direct_scope": "selection_then_missing_buffer_only"}))
	quit(0 if failures == 0 and isolated and rows.size() == 71 else 1)
