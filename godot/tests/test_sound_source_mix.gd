extends SceneTree
const MIX = preload("res://scripts/native_sound_mix.gd")
const SYNTH = preload("res://port_modules/sound_source/synthesis.gd")
const ADMISSION = preload("res://port_modules/sound_source/node_admission.gd")
const GRAPH = preload("res://tests/sound_source_graph_fake.gd")
const USERDIR := "EXODUSER-snd-08-Isolated-20261020"
const SOURCE_MAIN := "e556b617190c325ca39f5add04357f5dea5ca87e"
const SOURCE_SHA256 := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const FIXTURE := "res://tests/fixtures/sound_source_mix_oracle.json"
var assertions := 0
var failures := 0
var current_case := ""
var isolated := false
var source_steps := 0
var rows: Array = []
var media: RefCounted
var gain := 0.6

func _initialize() -> void:
	isolated = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR \
		and OS.get_user_data_dir().get_file() == USERDIR
	call_deferred("_run")
func _check(value: bool, label: String) -> void:
	assertions += 1
	if not value:
		failures += 1
		printerr("SND08_MIX_FAIL ", current_case, " ", label)
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
func _read_gain() -> float:
	media.events.append(["sfx", gain])
	return gain
func _run() -> void:
	_check(isolated, "effective USERDIR")
	_check(current_scene == null and root.get_child_count() == 0, "Main not booted")
	if not isolated:
		_finish()
		return
	var path := ProjectSettings.globalize_path("res://").path_join("../game.html").simplify_path()
	_check(FileAccess.get_file_as_string(path).sha256_text() == SOURCE_SHA256, "pinned latest main bytes")
	var fixture: Variant = JSON.parse_string(FileAccess.get_file_as_string(FIXTURE))
	_check(fixture is Dictionary, "oracle parses")
	if not fixture is Dictionary:
		_finish()
		return
	_check(fixture.source_ref == SOURCE_MAIN and fixture.source_sha256 == SOURCE_SHA256, "oracle provenance")
	_check(fixture.cases.size() == 26, "all 26 scenarios")
	for row in fixture.cases: _test_case(row)
	_check(source_steps == 55, "all 55 source steps")
	_test_native_contract(fixture.sample_gains)
	print("SND08_MIX_TRACE ", JSON.stringify(rows))
	_finish()
func _test_case(row: Dictionary) -> void:
	current_case = row.name
	media = GRAPH.new()
	media.sample_rate = int(row.get("sample_rate", 1000))
	gain = float(row.get("gain", 0.6))
	var mix = MIX.new(media, _read_gain)
	var synth = SYNTH.new(media, mix.mbus, media.random_unit, int(row.get("maximum", 48)))
	var steps: Array = []
	for i in row.ops.size():
		var op: Dictionary = row.ops[i]
		media.events = []
		media.fail = op.get("fail", "")
		var error: Variant = null
		match op.kind:
			"mbus": mix.mbus()
			"gain": gain = float(op.value)
			"helper":
				var reply: Dictionary = synth.play(op.helper, op.args)
				if reply.status == "THREW": error = reply.error
			"ended": media.end(int(op.id))
			"timer": media.fire(int(op.id))
			_: _check(false, "unknown operation")
		var observation := {"error": error, "events": media.events.duplicate(true), "state": media.snapshot(synth.snapshot().active)}
		for field in ["error", "events", "state"]:
			_check(_equal(observation[field], row.expected[i][field]), "step%d exact source %s" % [i, field])
		steps.append(observation)
		source_steps += 1
	rows.append({"name": current_case, "steps": steps})
	media.release_callbacks()
	media = null
func _test_native_contract(sample_gains: Array) -> void:
	current_case = "scope-lifetime-and-finite-source-buffers"
	_check(MIX.native_parity() == {"status": "UNVERIFIED", "biquad_Q": false, "compressor_knee": false, "automation_ramp": false, "PCM_equivalence": false}, "no fake native DSP parity")
	var not_ready = MIX.new(null, Callable())
	_check(not_ready.status().status == "NOT_READY" and not_ready.mbus() == null, "missing mix adapter not ready")
	var empty = SYNTH.new(null, Callable(), Callable())
	_check(empty.play("tone", []).status == "NOT_READY", "missing synth adapter not ready")
	var bad_mix = MIX.new(RefCounted.new(), _read_gain)
	_check(bad_mix.status().status == "NOT_READY" and bad_mix.mbus() == null, "incomplete non-null mix adapter rejected")
	var bad_synth = SYNTH.new(RefCounted.new(), _read_gain, _read_gain)
	_check(bad_synth.play("tone", []).status == "NOT_READY", "incomplete non-null synth adapter rejected")
	for row in sample_gains:
		media = GRAPH.new()
		gain = row.option
		var mixer = MIX.new(media, _read_gain)
		var bus: int = mixer.mbus()
		var parameters: Dictionary = ADMISSION.sample_parameters(0, 0, 0, 2, gain)
		var master: float = media.nodes[bus - 1].params.gain
		_check(_equal(parameters.gain, row.voice) and _equal(parameters.rate, row.rate), "SND07 voice vol0/rate0 source fallback")
		_check(_equal(master, row.master), "source mbus receives current sfx gain")
		_check(_equal(parameters.gain * master, row.product), "sample gain and master gain remain separate multiplicative stages")
		mixer.dispose()
		media.release_callbacks()
	media = GRAPH.new()
	var mix = MIX.new(media, _read_gain)
	var a = SYNTH.new(media, mix.mbus, media.random_unit)
	var b = SYNTH.new(media, mix.mbus, media.random_unit)
	a.play("fm", [400, 80, 200, 0.1, 0.1])
	a.cancel_all()
	b.play("tone", [100, 0.1, "sine", 0.1])
	media.events = []
	media.fire(1)
	_check(a.snapshot().active == 0 and b.snapshot().active == 1, "old canceled callback cannot change new instance")
	_check(media.events == [["fire", 1]], "old callback cannot disconnect new nodes")
	b.cancel_all()
	_check(b.snapshot().active == 0, "cancel own live nodes once")
	var before: Dictionary = mix.snapshot()
	var copy: Dictionary = mix.snapshot()
	copy.roles.clear()
	_check(mix.snapshot() == before, "snapshot containers independent")
	for row in rows:
		for step in row.steps:
			for buffer in step.state.buffers:
				for value in buffer.data: _check(is_finite(float(value)) and absf(float(value)) <= 1.0, "source noise PCM finite [-1,1]")
			for node in step.state.nodes:
				if node.params.has("curve"):
					_check(node.params.curve.size() == 512, "source waveshaper512")
					for value in node.params.curve: _check(is_finite(float(value)), "source wave curve finite")
	mix.dispose()
	_check(mix.snapshot().bus == null, "owned mix graph disposed")
	media.release_callbacks()
	media = null
func _finish() -> void:
	print("SND08_MIX_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "source_cases": rows.size(), "source_steps": source_steps,
		"isolated": isolated, "main_booted": current_scene != null, "nodes_left": root.get_child_count(), "native_DSP_parity_verified": false}))
	quit(0 if failures == 0 else 1)
