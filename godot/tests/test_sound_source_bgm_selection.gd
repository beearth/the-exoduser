extends SceneTree
## SND-05: 실제 원본 BGM 객체·SI map의 Node VM oracle 대조. 오디오 backend 없음.
const CATALOG = preload("res://port_modules/sound_source/bgm_catalog.gd")
const SELECT = preload("res://port_modules/sound_source/bgm_selection.gd")
const USERDIR := "EXODUSER-snd-05-Isolated-20261020"
const SOURCE_MAIN := "91e2774b769869e59f80953e148a5c95203b0fea"
const SOURCE_SHA256 := preload("res://source_snapshot/snapshot.gd").SHA256
const FIXTURE := "res://tests/fixtures/sound_source_bgm_oracle.json"

class FixtureCatalog extends RefCounted:
	var data: Dictionary
	func _init(value: Dictionary) -> void:
		data = value.duplicate(true)
	func snapshot() -> Dictionary:
		return data.duplicate(true)

var assertions := 0
var failures := 0
var current_case := ""
var rows: Array = []
var events: Array = []
var op: Dictionary = {}
var rng_index := 0
var isolated := false
var source_steps := 0


func _initialize() -> void:
	isolated = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR \
		and OS.get_user_data_dir().get_file() == USERDIR
	call_deferred("_run")


func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		printerr("SND05_FAIL ", current_case, " ", label)


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
	_check(isolated, "effective isolated USERDIR and override")
	_check(current_scene == null and root.get_child_count() == 0, "Main not booted")
	if not isolated:
		_finish()
		return
	var source_path := ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)
	_check(FileAccess.get_file_as_string(source_path).sha256_text() == SOURCE_SHA256, "source bytes match immutable snapshot")
	var fixture: Variant = JSON.parse_string(FileAccess.get_file_as_string(FIXTURE))
	_check(fixture is Dictionary, "fixture parses")
	if not fixture is Dictionary:
		_finish()
		return
	_check(fixture.source_ref == SOURCE_MAIN and fixture.source_sha256 == SOURCE_SHA256, "oracle provenance")
	_check(fixture.cases.size() == 46, "all 46 scenarios")
	var catalog = CATALOG.new()
	_test_catalog(catalog, fixture)
	for row in fixture.cases:
		_test_case(row, catalog)
	_check(source_steps == 225, "all 225 source steps executed")
	_test_native_contract(catalog)
	_check(current_scene == null and root.get_child_count() == 0, "no audio/Main nodes created")
	print("SND05_TRACE ", JSON.stringify(rows))
	_finish()


func _test_catalog(catalog: RefCounted, fixture: Dictionary) -> void:
	current_case = "catalog-source-values-and-deep-copies"
	_check(catalog.status() == {"status": "READY", "pool_count": 19, "gameplay_count": 50,
		"all_random_count": 57, "stage_count": 35, "legacy_count": 8}, "exact source counts")
	var snapshot: Dictionary = catalog.snapshot()
	var expected: Dictionary = fixture.catalog.duplicate(true)
	expected["status"] = "READY"
	_check(_equal(snapshot, expected), "all catalog keys/paths/SI map/legacy exact source")
	_check(snapshot.tracks.keys() == fixture.catalog.tracks.keys(), "19 pool insertion order")
	_check(_equal(catalog.all_random_entries().entries, fixture.all_random_entries), "all 57 entries retain source order and duplicates")
	var ashes: String = snapshot.tracks.hell1[0]
	_check(catalog.all_random_entries().entries.count(ashes) == 2, "hell1/gameplay duplicate weighted twice")
	for key in fixture.catalog.tracks:
		_check(_equal(catalog.tracks_for(key).entries, fixture.catalog.tracks[key]), "exact pool " + key)
	_check(catalog.tracks_for("missing").entries.is_empty(), "unknown active pool empty")
	_check(catalog.tracks_for("title").entries.is_empty(), "legacy title not made an active pool")
	_check(_equal(catalog.legacy_snapshot().entries, fixture.catalog.legacy_bgm_map), "legacy map separate namespace")
	snapshot.tracks.gameplay.clear()
	snapshot.legacy_bgm_map["0"].explore = "changed"
	snapshot.si_to_hell[0] = 6
	_check(_equal(catalog.snapshot(), expected), "snapshot nested mutation cannot leak")
	var entries: Dictionary = catalog.tracks_for("hell1")
	entries.entries.clear()
	_check(catalog.tracks_for("hell1").entries.size() == 1, "single pool copy isolated")
	var all: Dictionary = catalog.all_random_entries()
	all.entries.clear()
	_check(catalog.all_random_entries().entries.size() == 57, "all entries copy isolated")
	for si in [-1, 35, 100000]:
		_check(catalog.stage_key(si) == {"status": "UNSUPPORTED", "reason": "invalid_stage_index", "si": si}, "invalid si explicitly unsupported, no invented stage")


func _random() -> float:
	_check(rng_index < op.rng.size(), "no unexpected extra RNG")
	if rng_index >= op.rng.size():
		return 0.999999 # 실패 단정은 남기고 fixture backend가 무한히 0을 반환하지 않도록 한다.
	var value: float = op.rng[rng_index]
	rng_index += 1
	events.append(value)
	return value


func _src(packet: Dictionary) -> Variant:
	_check(packet.get("status") == "READY" and packet.has("src"), "ready selection packet distinguishes null from unavailable")
	return packet.get("src")


func _test_case(row: Dictionary, catalog: RefCounted) -> void:
	current_case = row.name
	var input: RefCounted = catalog
	if row.has("tracks"):
		var data: Dictionary = catalog.snapshot()
		data.tracks = row.tracks.duplicate(true)
		input = FixtureCatalog.new(data) # 동일 원본 함수에 넣은 synthetic 경계 fixture. 제품 표 변경 아님.
	var selection = SELECT.new(input)
	for src in row.get("bad", []):
		selection.mark_bad(src)
	var steps: Array = []
	for i in row.ops.size():
		op = row.ops[i]
		events = []
		rng_index = 0
		var value: Variant = null
		match op.kind:
			"random": value = _src(selection.pick_random(op.key, _random))
			"all": value = _src(selection.pick_all_random(_random))
			"act": value = _src(selection.pick_act_first(op.key, _random))
			"mixed": value = _src(selection.pick_mixed(op.key, _random))
			"last": selection.set_last_src(op.src)
			"bad": selection.mark_bad(op.src)
			"reset": selection.reset_act(op.key)
			"is_act": value = SELECT.is_act_key(op.key)
			"stage":
				var key: Dictionary = catalog.stage_key(int(op.si))
				_check(key.status == "READY", "valid canonical SI")
				value = key.key
			"enter":
				# source play(auto)의 선곡 segment만. gate/Audio/stop/fade/lifecycle 모사는 인수하지 않는다.
				selection.reset_act(op.key)
				value = _src(selection.pick_act_first(op.key, _random))
				if value == null: value = _src(selection.pick_mixed(op.key, _random))
				if value != null: selection.set_last_src(value)
			_: _check(false, "unknown fixture operation")
		var observation := {"value": value, "events": events.duplicate(), "state": selection.snapshot_state()}
		for field in ["value", "events", "state"]:
			_check(_equal(observation[field], row.expected[i][field]), "step%d exact source %s" % [i, field])
		steps.append(observation)
		source_steps += 1
	rows.append({"name": current_case, "steps": steps})


func _test_native_contract(catalog: RefCounted) -> void:
	current_case = "native-readiness-and-instance-isolation"
	var a = SELECT.new(catalog)
	var b = SELECT.new(catalog)
	a.mark_bad("bad")
	a.set_last_src("last")
	a.reset_act("hell1")
	_check(b.snapshot_state() == {"last_src": "", "bad_srcs": {}, "played_sets": {}, "act_done": {}}, "two instances independent")
	var before: Dictionary = a.snapshot_state()
	var changed: Dictionary = a.snapshot_state()
	changed.played_sets.hell1.append("changed")
	changed.bad_srcs.clear()
	_check(a.snapshot_state() == before, "nested state snapshot independent")
	var status: Dictionary = a.status()
	status.status = "changed"
	_check(a.status().status == "READY", "status copy independent")
	var missing = SELECT.new(null)
	op = {"rng": []}
	events = []
	rng_index = 0
	for packet in [missing.pick_random("boss", _random), missing.pick_all_random(_random), missing.pick_act_first("hell1", _random), missing.pick_mixed("hell1", _random)]:
		_check(packet == {"status": "NOT_READY", "reason": "bgm_catalog_unavailable"}, "not ready is not a successful null track")
	_check(events.is_empty(), "unavailable catalog consumes RNG0")
	for row in [["res://data/__snd05_missing__.json", "catalog_file_unavailable"], ["res://port_modules/sound_source/policy.gd", "catalog_json_invalid"], ["res://data/combat.json", "catalog_shape_invalid"]]:
		var bad = CATALOG.new(row[0])
		_check(bad.status().reason == row[1] and bad.snapshot().status == "NOT_READY", "catalog explicit load error")
		_check(bad.all_random_entries().status == "NOT_READY" and bad.stage_key(0).status == "NOT_READY", "unavailable catalog publishes no fabricated empty pool")


func _finish() -> void:
	print("SND05_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"source_cases": rows.size(), "source_steps": source_steps, "isolated": isolated,
		"userdir": OS.get_user_data_dir(), "Main_booted": current_scene != null,
		"source_main": SOURCE_MAIN, "source_sha256": SOURCE_SHA256, "audible_verified": false,
		"scope": "catalog_selection_only"}))
	quit(0 if failures == 0 and isolated and rows.size() == 46 and source_steps == 225 else 1)
