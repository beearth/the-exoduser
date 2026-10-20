extends SceneTree
## SETTINGS-S01, latest main 9528ea35 game.html:6311 / 48752-48753.
## Unit providers are explicit doubles. actual_main uses the real Services owner.
## Reset 18/20 is source evidence only; actual reset belongs to S03.

const View = preload("res://scripts/native_settings_read_view.gd")
const USERDIR := "EXODUSER-settings-s01-Isolated-20261020"
const GROUPS := ["reference", "raw_identity", "missing_and_loss", "reset_evidence", "actual_main"]

class CountingOptionsOwner extends RefCounted:
	var value: Variant
	var reads := 0
	func read_current_options() -> Variant:
		reads += 1
		return value

var _selected: Array = []
var _assertions := 0
var _failures := 0
var _group := ""
var _rows: Array = []
var _observations: Dictionary = {}
var _main: Node
var _source_lines: PackedStringArray


func _initialize() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true \
			or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR \
			or OS.get_user_data_dir().get_file() != USERDIR:
		print("SETTINGS_S01_INVALID isolated userdir required: ", OS.get_user_data_dir())
		quit(2)
		return
	for arg in OS.get_cmdline_user_args():
		if arg == "--only=unit":
			_selected = ["reference", "raw_identity", "missing_and_loss", "reset_evidence"]
		elif arg == "--only=actual_main":
			_selected = ["actual_main"]
		else:
			print("SETTINGS_S01_INVALID unknown argument ", arg)
			quit(2)
			return
	if _selected.is_empty():
		print("SETTINGS_S01_INVALID select unit or actual_main explicitly")
		quit(2)
		return
	var source_path := ProjectSettings.globalize_path("res://").path_join("../game.html").simplify_path()
	if not FileAccess.file_exists(source_path):
		print("SETTINGS_S01_INVALID latest worktree game.html unavailable")
		quit(2)
		return
	_source_lines = FileAccess.get_file_as_string(source_path).split("\n")
	call_deferred("_run")


func _run() -> void:
	for group in _selected:
		_group = group
		var before_checks := _assertions
		var before_failures := _failures
		await call("_test_" + group)
		_cleanup()
		var row := {"group": group, "assertions": _assertions - before_checks,
			"failures": _failures - before_failures}
		_rows.append(row)
		print("SETTINGS_S01_GROUP ", JSON.stringify(row))
	print("SETTINGS_S01_RESULT ", JSON.stringify({"assertions": _assertions,
		"failures": _failures, "groups": _rows, "observations": _observations,
		"userdir": OS.get_user_data_dir(), "source": "game.html:6311,48752-48753",
		"shared_product_files_modified": 0, "settings_restored": false,
		"reset_implemented": false, "public_play_evidence": false}))
	quit(0 if _failures == 0 and _assertions > 0 else 1)


func _check(condition: bool, label: String) -> void:
	_assertions += 1
	if not condition:
		_failures += 1
		printerr("SETTINGS_S01_FAIL ", _group, " ", label)


func _cleanup() -> void:
	if is_instance_valid(_main):
		if _main.get_parent() != null:
			_main.get_parent().remove_child(_main)
		_main.free()
	_main = null
	paused = false


func _source_defaults(electron: bool) -> Dictionary:
	if _source_lines.size() <= 6310 or not _source_lines[6310].begins_with("let OPT={"):
		_check(false, "latest source OPT declaration is game.html:6311")
		return {}
	var body := _source_lines[6310].trim_prefix("let OPT={").trim_suffix("};").strip_edges()
	var expected: Dictionary = {}
	for pair in body.split(","):
		var bits := pair.split(":", true, 1)
		if bits.size() != 2:
			_check(false, "source literal key/value parser accepts declaration")
			return {}
		var token := bits[1]
		if token == "IS_ELECTRON?100:80":
			expected[bits[0]] = 100 if electron else 80
		else:
			# This source literal has only JSON primitives / single-quoted strings.
			expected[bits[0]] = JSON.parse_string(token.replace("'", "\""))
	return expected


func _input_snapshot() -> Dictionary:
	var result: Dictionary = {}
	for action in InputMap.get_actions():
		var events: Array = []
		for event in InputMap.action_get_events(action):
			events.append(event.as_text())
		result[action] = {"deadzone": InputMap.action_get_deadzone(action), "events": events}
	return result


func _test_reference() -> void:
	var before_inputs := _input_snapshot()
	var before_cap := Engine.max_fps
	var before_hz := Engine.physics_ticks_per_second
	var before_buses := AudioServer.bus_count
	var view := View.new()
	for electron in [false, true]:
		var expected := _source_defaults(electron)
		var actual: Dictionary = view.get_source_default_reference(electron)
		_check(expected.size() == 38 and actual.size() == 38, "source and reference each have38 fields")
		for key in expected:
			_check(actual.has(key) and actual.get(key) == expected[key], "source6311 default " + str(key))
		_check(actual.parts == (100 if electron else 80), "source Electron parts100 / browser80")
	var first: Dictionary = view.get_source_default_reference()
	var second: Dictionary = view.get_source_default_reference()
	_check(not is_same(first, second), "reference returns separate diagnostic copies")
	first.shake = 0
	first["new_fixture_field"] = [1]
	var after: Dictionary = view.get_source_default_reference()
	_check(after.shake == 80 and after.size() == 38 and not after.has("new_fixture_field"),
		"reference mutation cannot alter baseline")
	_check(_input_snapshot() == before_inputs and Engine.max_fps == before_cap \
		and Engine.physics_ticks_per_second == before_hz and AudioServer.bus_count == before_buses,
		"reference reads do not modify InputMap / frame caps / audio buses")
	_observations[_group] = {"reference_fields": second.size(), "parts_browser": second.parts,
		"parts_electron": view.get_source_default_reference(true).parts}


func _test_raw_identity() -> void:
	var provider := CountingOptionsOwner.new()
	provider.value = _source_defaults(false)
	var before_inputs := _input_snapshot()
	var before_cap := Engine.max_fps
	var before_hz := Engine.physics_ticks_per_second
	var view := View.new()
	_check(view.configure(provider) and provider.reads == 0, "configure binds without querying source")
	var other := CountingOptionsOwner.new()
	_check(not view.configure(provider) and not view.configure(other), "one binding cannot be replaced")
	var packet: Dictionary = view.read_current_options_view()
	_check(packet.status == "READY" and provider.reads == 1, "one read invokes actual reader once")
	_check(is_same(packet.get("options"), provider.value), "READY carries actual raw Dictionary identity")
	_check(packet.missing_keys.is_empty() and packet.extra_keys.is_empty(), "complete source keys have no gap")
	provider.value.shake = 0
	provider.value.sfxVol = 0
	provider.value.bloom = false
	var nested := {"array": [null, false, 0]}
	provider.value["fixture_extra"] = nested
	provider.value[7] = null
	var before: Dictionary = provider.value.duplicate(true)
	packet = view.read_current_options_view()
	_check(provider.reads == 2 and other.reads == 0, "subsequent read uses original owner once")
	_check(packet.options.shake == 0 and packet.options.sfxVol == 0 and packet.options.bloom == false,
		"zero/false remain raw live values without defaults")
	_check(is_same(packet.options, provider.value) and is_same(packet.options.fixture_extra, nested),
		"extra nested container identity is not cloned")
	_check(packet.extra_keys == ["fixture_extra", 7] and packet.options[7] == null,
		"extra keys retain order/type and null value")
	_check(provider.value == before, "reading never writes current options")
	var replacement := _source_defaults(true)
	provider.value = replacement
	packet = view.read_current_options_view()
	_check(is_same(packet.options, replacement) and not is_same(packet.options, before),
		"owner replacement is observed instead of caching first Dictionary")
	_check(_input_snapshot() == before_inputs and Engine.max_fps == before_cap \
		and Engine.physics_ticks_per_second == before_hz, "current view does not alter native input/cadence")
	_observations[_group] = {"reader_calls": provider.reads, "replacement_parts": packet.options.parts}


func _test_missing_and_loss() -> void:
	var view := View.new()
	_check(view.read_current_options_view() == {"status": "NOT_READY", "reason": "source_owner_not_configured"},
		"unconfigured read does not fabricate options")
	var invalid := RefCounted.new()
	_check(not view.configure(null) and not view.configure(invalid), "invalid owners are rejected")
	var provider := CountingOptionsOwner.new()
	provider.value = _source_defaults(false)
	for key in ["textScale", "panelFit", "diffV2"]:
		provider.value.erase(key)
	var before: Dictionary = provider.value.duplicate(true)
	_check(view.configure(provider), "invalid configure does not consume one valid binding")
	var packet: Dictionary = view.read_current_options_view()
	_check(packet.status == "NOT_READY" and packet.reason == "source_settings_fields_missing",
		"merged S01: missing source fields are NOT_READY")
	_check(packet.expected_count == 38 and packet.current_count == 35 \
		and packet.missing_keys == ["textScale", "panelFit", "diffV2"], "source38 / explicit native35 gap is exact")
	_check(not packet.has("options") and is_same(packet.get("observed_options"), provider.value),
		"missing packet preserves diagnostic raw ref without usable options")
	_check(provider.value == before and provider.reads == 1, "missing read neither fills nor retries")
	provider.value = null
	packet = view.read_current_options_view()
	_check(packet.reason == "current_options_unavailable" and not packet.has("options") \
		and not packet.has("observed_options") and provider.reads == 2, "null reader has no stale raw packet")
	provider.value = []
	packet = view.read_current_options_view()
	_check(packet.reason == "current_options_not_dictionary" and provider.reads == 3, "unsupported reader type is not coerced")
	provider = null
	packet = view.read_current_options_view()
	_check(packet == {"status": "NOT_READY", "reason": "source_owner_lost"}, "WeakRef does not retain disposed owner")
	_check(not view.configure(CountingOptionsOwner.new()), "lost owner cannot silently rebind")
	var no_reader := CountingOptionsOwner.new()
	var method_view := View.new()
	_check(method_view.configure(no_reader), "method loss fixture binds normally")
	no_reader.set_script(null)
	_check(method_view.read_current_options_view().get("reason") == "source_options_reader_missing",
		"reader method loss is checked before call")
	_observations[_group] = {"missing_keys": ["textScale", "panelFit", "diffV2"], "missing_status": "NOT_READY"}


func _binding_keys(text: String) -> Array:
	var regex := RegEx.new()
	regex.compile("([A-Za-z][A-Za-z0-9]*):")
	var keys: Array = []
	for match_value in regex.search_all(text):
		var key: String = match_value.get_string(1)
		if key not in keys:
			keys.append(key)
	return keys


func _test_reset_evidence() -> void:
	_check(_source_lines.size() > 48752 and _source_lines[48751].strip_edges().begins_with("BINDS={") \
		and _source_lines[48752].strip_edges().begins_with("BINDS2={"), "reset evidence is source48752-48753")
	var initial := _binding_keys("\n".join(_source_lines.slice(6187, 6197)))
	var reset_primary := _binding_keys(_source_lines[48751])
	var reset_secondary := _binding_keys(_source_lines[48752])
	_check(initial.size() == 20 and "irisToggle" in initial and "bladeToggle" in initial, "source initial bindings20 include two toggles")
	_check(reset_primary.size() == 18 and reset_secondary.size() == 18, "source reset restores18 primary/secondary keys")
	_check("irisToggle" not in reset_primary and "bladeToggle" not in reset_primary \
		and "irisToggle" not in reset_secondary and "bladeToggle" not in reset_secondary,
		"preserve source reset omission; no corrected20 reset in S01")
	_observations[_group] = {"initial_count": initial.size(), "reset_primary_count": reset_primary.size(),
		"reset_secondary_count": reset_secondary.size(), "omitted": ["irisToggle", "bladeToggle"],
		"evidence_only": true, "implementation_deferred_to": "S03"}


func _test_actual_main() -> void:
	var packed: Variant = load("res://scenes/main.tscn")
	_check(packed is PackedScene, "actual Main scene loads")
	if not packed is PackedScene:
		return
	_main = packed.instantiate()
	root.add_child(_main)
	await process_frame
	var services: Object = _main.get("source_initialization_services")
	_check(is_instance_valid(services) and services.has_method("read_current_options"), "actual Services options API exists")
	if not is_instance_valid(services) or not services.has_method("read_current_options"):
		return
	var current: Variant = services.read_current_options()
	_check(current is Dictionary, "actual Services reader returns its live owner Dictionary")
	if not current is Dictionary:
		return
	var state: Object = services.get_source_options_state()
	_check(is_instance_valid(state), "actual options owner is available")
	if not is_instance_valid(state):
		return
	var before: Dictionary = current.duplicate(true)
	var phase_before: Dictionary = state.get_last_status()
	var input_before := _input_snapshot()
	var cap_before := Engine.max_fps
	var hz_before := Engine.physics_ticks_per_second
	var view := View.new()
	_check(view.configure(services), "read view binds real Services without replacing owner")
	var packet: Dictionary = view.read_current_options_view()
	_check(packet.get("status") == "NOT_READY" and packet.get("reason") == "source_settings_fields_missing",
		"actual native owner gap is visible, not manufactured READY")
	_check(packet.get("current_count") == 35 and packet.get("expected_count") == 38 \
		and packet.get("missing_keys") == ["textScale", "panelFit", "diffV2"], "actual native35 reports exact source38 gap")
	_check(is_same(packet.get("observed_options"), current) and not packet.has("options"), "actual diagnostic ref identity / no usable fallback")
	_check(is_same(current, services.read_current_options()) and current == before, "view leaves actual options ref and all values unchanged")
	_check(current.get("diff") == 5 and current.get("parts") == 80 \
		and current.get("sfxVol") == 60 and current.get("fpsCap") == 0, "actual baseline source values5/80/60/0")
	_check(phase_before.get("phase") == "current_pre_restore" \
		and state.get_last_status().get("phase") == phase_before.get("phase"), "reader cannot promote lifecycle to restored/live")
	_check(cap_before == 240 and Engine.max_fps == cap_before \
		and hz_before == 60 and Engine.physics_ticks_per_second == hz_before \
		and _input_snapshot() == input_before, "actual Engine240 / physics60 / InputMap unchanged")
	_observations[_group] = {"status": packet.get("status"), "current_count": packet.get("current_count"),
		"missing_keys": packet.get("missing_keys"), "phase": phase_before.get("phase"),
		"actual_identity": is_same(packet.get("observed_options"), current), "cap": cap_before, "physics_hz": hz_before}
