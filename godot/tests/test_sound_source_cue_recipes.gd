extends SceneTree
const CUES = preload("res://port_modules/sound_source/cue_recipes.gd")
const MIX = preload("res://scripts/native_sound_mix.gd")
const SYNTH = preload("res://port_modules/sound_source/synthesis.gd")
const GRAPH = preload("res://tests/sound_source_graph_fake.gd")
const USERDIR := "EXODUSER-snd-08-Isolated-20261020"
const SOURCE_MAIN := "91e2774b769869e59f80953e148a5c95203b0fea"
const SOURCE_SHA256 := preload("res://source_snapshot/snapshot.gd").SHA256
var assertions := 0
var failures := 0
var current_case := ""
var isolated := false
var phase := 0
var source_steps := 0
var rows: Array = []
var events: Array = []
var timers: Array = []
var now := 0.0
var fail_call := 0
var dispatch_count := 0

func _initialize() -> void:
	isolated = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR \
		and OS.get_user_data_dir().get_file() == USERDIR
	call_deferred("_run")
func _check(value: bool, label: String) -> void:
	assertions += 1
	if not value:
		failures += 1
		printerr("SND08_CUE_FAIL ", current_case, " ", label)
func _equal(a: Variant, b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float): return absf(float(a) - float(b)) <= 1e-12 * maxf(1.0, absf(float(b)))
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size(): return false
		for key in b:
			if not a.has(key) or not _equal(a[key], b[key]): return false
		return true
	if a is Array and b is Array:
		if a.size() != b.size(): return false
		for i in a.size():
			if not _equal(a[i], b[i]): return false
		return true
	return a == b
func _dispatch(kind: String, args: Array) -> Dictionary:
	events.append(["call", now, kind, args.duplicate(true)])
	dispatch_count += 1
	if dispatch_count == fail_call: return {"status": "THREW", "error": "cue_dispatch:%s" % dispatch_count}
	return {"status": "DISPATCHED"}
func _schedule(callback: Callable, ms: float) -> int:
	var id := timers.size() + 1
	timers.append({"id": id, "ms": ms, "due": now + ms, "callback": callback, "fired": false})
	events.append(["timer", id, ms])
	return id
func _fire(id: int) -> Dictionary:
	var timer: Dictionary = timers[id - 1]
	timer.fired = true
	now = timer.due
	events.append(["fire", id])
	var reply: Variant = timer.callback.call()
	return reply if reply is Dictionary else {}
func _drain() -> void:
	while true:
		var chosen: Dictionary = {}
		for timer in timers:
			if not timer.fired and (chosen.is_empty() or timer.due < chosen.due): chosen = timer
		if chosen.is_empty(): break
		_fire(chosen.id)
func _run() -> void:
	_check(isolated, "effective USERDIR")
	_check(current_scene == null and root.get_child_count() == 0, "Main not booted")
	if not isolated:
		_finish()
		return
	var path := ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)
	_check(FileAccess.get_file_as_string(path).sha256_text() == SOURCE_SHA256, "immutable source snapshot bytes")
	var fixture: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/sound_source_cue_oracle.json"))
	_check(fixture is Dictionary, "oracle parses")
	if not fixture is Dictionary:
		_finish()
		return
	_check(fixture.source_ref == SOURCE_MAIN and fixture.source_sha256 == SOURCE_SHA256, "oracle provenance")
	phase = int(fixture.phase)
	_check(phase in [1, 2, 3], "explicit sequential subunit")
	for row in fixture.cases: _test_case(row)
	_check(source_steps == [0, 5, 12, 25][phase], "all phase source steps")
	_test_contract()
	print("SND08_CUE_TRACE ", JSON.stringify(rows))
	_finish()
func _test_case(row: Dictionary) -> void:
	current_case = row.name
	now = 0.0
	dispatch_count = 0
	fail_call = int(row.get("fail_call", 0))
	timers = []
	var cues = CUES.new(_dispatch, _schedule)
	var steps: Array = []
	for i in row.ops.size():
		events = []
		var op: Dictionary = row.ops[i]
		var error: Variant = null
		var reply: Dictionary = {}
		match op.kind:
			"play":
				reply = cues.play(op.cue)
				_check(reply.status == ("THREW" if row.expected[i].error != null else "DISPATCHED"), "source dispatch/error packet")
			"fire": reply = _fire(int(op.id))
			"drain": _drain()
			_: _check(false, "unknown fixture operation")
		if reply.get("status") == "THREW": error = reply.error
		var snapshot: Array = []
		for timer in timers: snapshot.append({"id": timer.id, "ms": timer.ms, "due": timer.due, "fired": timer.fired})
		var observation := {"error": error, "events": events.duplicate(true), "now": now, "timers": snapshot}
		for field in ["error", "events", "now", "timers"]:
			_check(_equal(observation[field], row.expected[i][field]), "step%d exact source %s" % [i, field])
		steps.append(observation)
		source_steps += 1
	rows.append({"name": current_case, "steps": steps})
	timers.clear()
func _gain() -> float: return 0.6
func _test_contract() -> void:
	current_case = "dispatch-readiness-and-copies"
	fail_call = 0
	dispatch_count = 0
	var missing = CUES.new(Callable(), Callable())
	_check(missing.play("click").status == "NOT_READY", "unbound not dispatched")
	var cues = CUES.new(_dispatch, _schedule)
	events = []
	_check(cues.play("unknown").status == "UNSUPPORTED" and events.is_empty(), "unknown cue not invented")
	# 첫 소단위부터 실제 source synthesis graph로도 recipe의 호출 경로를 통과시킨다.
	var media = GRAPH.new()
	var mix = MIX.new(media, _gain)
	var synth = SYNTH.new(media, mix.mbus, media.random_unit)
	var sample_calls: Array = []
	var bridge := func(kind: String, args: Array) -> Dictionary:
		if kind == "sample":
			sample_calls.append(args.duplicate(true))
			return {"status": "UNBOUND_SAMPLE"}
		media.current_time = 5.25 + now / 1000.0
		return synth.play(kind, args)
	var wired = CUES.new(bridge, _schedule)
	wired.play("click")
	wired.play("pickup")
	_check(synth.snapshot().active == 4, "click1 + pickup3 complete source graph helpers")
	if phase >= 2:
		wired.play("potion")
		_drain()
		_check(synth.snapshot().active == 12, "potion8 helpers at 0/55/110/170 source graph")
	if phase >= 3:
		wired.play("forge")
		wired.play("crystalEquip")
		_drain()
		_check(synth.snapshot().active == 18, "forge3+crystal3 synth layers")
		_check(_equal(sample_calls, [["equip_rare", 0.38, 1.12, true]]), "crystal requests exact sample args, actual sample remains unbound")
	synth.cancel_all()
	_check(synth.snapshot().active == 0, "all own graph nodes canceled")
	media.release_callbacks()
	timers.clear()
	if phase >= 2:
		now = 0.0
		dispatch_count = 0
		cues.play("potion")
		cues.cancel_pending()
		cues.play("potion")
		events = []
		_fire(1)
		_check(events == [["fire", 1]], "canceled old delayed callback has no dispatch")
		_fire(4)
		_check(dispatch_count == 6, "new generation still dispatches55ms pair")
		_fire(3)
		_check(dispatch_count == 6, "old170ms callback cannot affect new generation")
		_fire(6)
		_check(dispatch_count == 8, "new170ms callback survives")
		timers.clear()
func _finish() -> void:
	print("SND08_CUE_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "source_cases": rows.size(), "source_steps": source_steps,
		"phase": phase, "isolated": isolated, "main_booted": current_scene != null, "nodes_left": root.get_child_count(), "sample_bound": false, "native_DSP_parity_verified": false}))
	quit(0 if failures == 0 else 1)
