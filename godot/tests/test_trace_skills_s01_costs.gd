extends SceneTree
## Pure SK-S01 test: no Main, override.cfg, assets, actor or user:// IO.
## Oracle rows are compared externally to the actual latest-main JS functions.
const USERDIR := "EXODUSER-sk-s01-Isolated-20261020"
const COSTS = preload("res://port_modules/skill_management_cost_source/producer.gd")

var assertions := 0
var failures := 0
var rows: Array = []


func _initialize() -> void:
	# Test-process-only settings; never save ProjectSettings or create an override.
	ProjectSettings.set_setting("application/config/use_custom_user_dir", true)
	ProjectSettings.set_setting("application/config/custom_user_dir_name", USERDIR)
	call_deferred("_run")


func _run() -> void:
	_check(ProjectSettings.get_setting("application/config/use_custom_user_dir") == true,
		"custom user dir enabled")
	_check(ProjectSettings.get_setting("application/config/custom_user_dir_name") == USERDIR,
		"exact user dir name")
	_check(OS.get_user_data_dir().get_file() == USERDIR, "effective OS user dir")
	if failures > 0:
		_finish()
		return
	var input_before: Dictionary = {}
	for action in InputMap.get_actions():
		input_before[action] = InputMap.action_get_events(action)
	_test_numeric_domain()
	_test_early_returns()
	_test_rejections_and_borrowed_inputs()
	_check(root.get_child_count() == 0, "no actor/Main/other node created")
	_check(InputMap.get_actions() == input_before.keys(), "InputMap action list unchanged")
	for action in input_before:
		_check(InputMap.action_get_events(action) == input_before[action],
			"InputMap events unchanged: " + str(action))
	_finish()


func _test_numeric_domain() -> void:
	for lv in range(21):
		var up: Dictionary = COSTS.skill_up_sp_cost(lv)
		_check_ready(up, 1, "single %d" % lv)
		_check_ready(COSTS.skill_up_sp_cost(float(lv)), 1, "single Number float %d" % lv)
		rows.append(["single", lv, up.get("value")])
		for gems in range(8):
			var expected: int = [2, 1, 2, 3, 4, 5, 6, 7][gems] if lv < 9 \
				else [6, 1, 6, 6, 8, 8, 8, 8][gems]
			var fused: Dictionary = COSTS.fuse_up_sp_cost(lv, gems)
			_check_ready(fused, expected, "fusion %d/%d" % [lv, gems])
			_check_ready(COSTS.fuse_up_sp_cost(float(lv), float(gems)), expected,
				"fusion Number floats %d/%d" % [lv, gems])
			_check_ready(COSTS.fuse_up_sp_cost(lv, float(gems)), expected, "fusion mixed gem")
			_check_ready(COSTS.fuse_up_sp_cost(float(lv), gems), expected, "fusion mixed level")
			rows.append(["fusion", lv, gems, fused.get("value")])
		for sp_cost in range(16):
			var skill := {"spCost": sp_cost}
			var expected: int = 0 if lv == 0 else sp_cost + lv - 1
			var spent: Dictionary = COSTS.skill_spent_sp(skill, lv)
			_check_ready(spent, expected, "spent %d/%d" % [sp_cost, lv])
			_check_ready(COSTS.skill_spent_sp({"spCost": float(sp_cost)}, float(lv)),
				expected, "spent Number floats")
			_check(is_same(spent.input.skill, skill), "READY borrowed dictionary identity")
			rows.append(["spent", sp_cost, lv, spent.get("value")])


func _test_early_returns() -> void:
	for lv in range(21):
		var empty: Dictionary = COSTS.skill_spent_sp({}, lv)
		var absent: Dictionary = COSTS.skill_spent_sp(null, lv)
		_check_ready(empty, maxi(0, lv - 1), "missing spCost")
		_check_ready(absent, 0, "null skill")
		rows.append(["missing", lv, empty.get("value")])
		rows.append(["null", lv, absent.get("value")])
	# This unused field is never read by the original early return.
	var unused := {"spCost": "unread", "sentinel": {"kept": true}}
	_check_ready(COSTS.skill_spent_sp(unused, 0), 0, "lv0 before spCost read")
	_check(unused.spCost == "unread", "lv0 does not normalize the unused field")
	_check_ready(COSTS.fuse_up_sp_cost(1, 4), 4, "display star4 remains4")
	_check_ready(COSTS.fuse_up_sp_cost(1, 6), 6, "apply member6 remains6")


func _test_rejections_and_borrowed_inputs() -> void:
	var unsupported: Array = [null, true, false, "1", &"1", [], {}, Vector2.ZERO,
		NAN, INF, -INF, -1, 0.5, 21, 9223372036854775807]
	for raw in unsupported:
		_check_nr(COSTS.skill_up_sp_cost(raw), "unsupported_cur_lv", "cur_lv", raw)
		_check_nr(COSTS.fuse_up_sp_cost(raw, 2), "unsupported_cur_lv", "cur_lv", raw)
		_check_nr(COSTS.skill_spent_sp({}, raw), "unsupported_skill_lv", "skill_lv", raw)
	for raw in [true, "2", &"2", [], {}, NAN, INF, -1, 0.5, 8]:
		_check_nr(COSTS.fuse_up_sp_cost(1, raw), "unsupported_gem_count", "gem_count", raw)
	for raw in [true, false, "skill", &"skill", [], Vector2.ZERO, 0]:
		_check_nr(COSTS.skill_spent_sp(raw, 1), "unsupported_skill", "skill", raw)
	for raw in [null, true, false, "10", &"10", [], {}, NAN, INF, -1, 0.5, 16]:
		var skill := {"spCost": raw}
		var packet: Dictionary = COSTS.skill_spent_sp(skill, 1)
		_check_nr(packet, "unsupported_sp_cost", "skill", skill)
		_check(is_same(packet.input.skill, skill), "NR dictionary not copied")
	var named_key := {&"spCost": 10}
	_check_nr(COSTS.skill_spent_sp(named_key, 1), "unsupported_sp_cost_key", "skill", named_key)
	var sentinel := RefCounted.new()
	var nested := {"array": [sentinel, {"token": 7}]}
	var borrowed := {"spCost": 10, "nested": nested}
	var before: Dictionary = borrowed.duplicate(true)
	var first: Dictionary = COSTS.skill_spent_sp(borrowed, 20)
	for repeat in range(3):
		_check_ready(COSTS.skill_spent_sp(borrowed, 20), 29, "repeat %d" % repeat)
	_check(borrowed == before, "all input fields and nested values unchanged")
	_check(is_same(borrowed.nested, nested) and is_same(borrowed.nested.array[0], sentinel),
		"nested Dictionary/Object identity unchanged")
	_check(is_same(first.input.skill, borrowed), "READY raw input retained")
	_check(borrowed.size() == 2, "no new fields")


func _check_ready(packet: Dictionary, expected: int, label: String) -> void:
	_check(packet.get("status") == "READY" and packet.has("value") \
		and packet.value is int and packet.value == expected and not packet.has("reason"), label)


func _check_nr(packet: Dictionary, reason: String, key: String, raw: Variant) -> void:
	_check(packet.get("status") == "NOT_READY" and not packet.has("value") \
		and packet.get("reason") == reason, "NR: " + reason)
	_check(packet.has("input") and packet.input.has(key) \
		and is_same(packet.input[key], raw), "NR retains raw carrier: " + reason)


func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("SK_S01_FAIL ", label)


func _finish() -> void:
	print("SK_S01_ORACLE_ROWS ", JSON.stringify(rows))
	print("SK_S01_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"oracle_rows": rows.size(), "user_dir": OS.get_user_data_dir(),
		"main_boots": 0, "user_io": 0, "skipped": []}))
	quit(1 if failures > 0 or rows.is_empty() else 0)
