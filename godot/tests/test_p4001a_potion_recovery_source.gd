extends SceneTree
## QS-01, original game.html at ad6ac68a2:27677-27679/28072/35894/35898-35903.
## Pure producer only. No Main, Player, saves, settings, clock or simulated use.
const SOURCE = preload("res://port_modules/potion_recovery_source/producer.gd")
const USERDIR = "EXODUSER-qs-01-Isolated-20261020"

var _source = SOURCE.new()
var _checks = 0
var _failures = 0
var _groups: Array = []
var _observations: Dictionary = {}


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR \
		and OS.get_user_data_dir().get_file() == USERDIR
	_check(isolated, "effective custom user directory equals QS-01 isolation")
	if not isolated:
		_finish()
		return
	var child_count: int = root.get_child_count()
	for group in ["definition", "heal", "cooldown", "unsupported", "repeatability"]:
		var before: int = _checks
		var failures_before: int = _failures
		call("_test_" + group)
		var row = {"group": group, "checks": _checks - before, "failures": _failures - failures_before}
		_groups.append(row)
		print("QS01_GROUP ", JSON.stringify(row))
	_check(root.get_child_count() == child_count, "pure calls create no scene nodes")
	_finish()


func _finish() -> void:
	print("QS01_RESULT ", JSON.stringify({"checks": _checks, "failures": _failures,
		"groups": _groups, "observations": _observations, "userdir": OS.get_user_data_dir(),
		"main_booted": false, "runtime_potion_connected": false}))
	quit(0 if _failures == 0 and not _groups.is_empty() else 1)


func _check(ok: bool, label: String) -> void:
	_checks += 1
	if not ok:
		_failures += 1
		printerr("QS01_FAIL ", label)


func _value(packet: Dictionary, expected: float, label: String) -> void:
	_check(packet.get("status") == "READY" and packet.has("value"), label + ": READY/value")
	if packet.get("status") != "READY" or not packet.has("value"):
		return
	var actual: Variant = packet["value"]
	_check(typeof(actual) in [TYPE_INT, TYPE_FLOAT], label + ": numeric result")
	if typeof(actual) in [TYPE_INT, TYPE_FLOAT]:
		_check(is_nan(float(actual)) if is_nan(expected) else float(actual) == expected,
			label + ": source value")


func _test_definition() -> void:
	var expected = {"name": "악의 추출", "emoji": "👿", "col": "#33cc66", "colG": "#66ff99",
		"base": 100, "per": 20, "desc": "악의를 소모해 지옥의 힘으로 회복합니다 (+100 HP)"}
	var first: Dictionary = _source.hp_definition()
	var second: Dictionary = _source.hp_definition()
	_check(first.size() == 7, "POT.hp exact seven keys (27678)")
	for key in expected:
		_check(first.get(key) == expected[key], "POT.hp " + key)
	_check(not is_same(first, second), "definition returns independent dictionaries")
	first["base"] = -123
	first["new_key"] = true
	_check(second == expected and _source.hp_definition() == expected, "caller edits cannot alter next definition")


func _test_heal() -> void:
	var expected = [100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
	for level in range(11):
		_value(_source.pot_heal(level), float(expected[level]), "potHeal level %d (28072)" % level)
	for row in [[-1, 100], [11, 1100], [0.5, 50], [1.0, 150], [-INF, 100], [INF, INF], [NAN, NAN]]:
		_value(_source.pot_heal(row[0]), float(row[1]), "uncapped/source Number potHeal " + str(row[0]))
	for row in [[0, 0.12, 112], [1, 0.12, 168], [0, -0.25, 75], [0, -2.0, -100],
			[0, NAN, 0], [0, INF, 0], [NAN, 0.0, 0], [INF, 0.0, 0], [0, 42949672.96, 100]]:
		_value(_source.enhanced_heal(row[0], row[1]), float(row[2]), "enhanced/ToInt32 (35894/35903) " + str(row))
	_observations["level_0_to_10"] = expected


func _test_cooldown() -> void:
	# Expected values are from the exact original JS declarations 35898-35902.
	# Includes JS numeric strings, missing properties and Number bitwise wrapping.
	var rows = [
		["base", null, false, null, false, 0, true, 420],
		["individual_caps", 0.8, true, 0.9, true, 99, true, 126],
		["string_rounding", "0.10", true, "0.20", true, 5, true, 230],
		["invalid_gear", "junk", true, "junk", true, 0, true, 420],
		["negative_gear", -0.1, true, 0, true, 0, true, 462],
		["signed_wrap", -6000000, true, 0, true, 0, true, 6],
		["nan_passive", 0, true, 0, true, NAN, true, 6],
		["absent_passive", 0, true, 0, true, null, false, 6],
		["null_false", null, true, false, true, null, true, 420],
		["bool_conversion", true, true, false, true, false, true, 336],
		["nan_gear", NAN, true, NAN, true, 0, true, 420],
		["positive_infinity", INF, true, INF, true, 0, true, 252],
		["negative_infinity", -INF, true, 0, true, 0, true, 6],
		["empty_whitespace", "", true, " \t\n", true, "0", true, 420],
		["numeric_syntax", "0x1", true, "1e-1", true, "5", true, 231],
		["invalid_passive", 0, true, 0, true, "junk", true, 6],
		["negative_passive", 0, true, 0, true, -5, true, 482],
		["zero_signs", -0.0, true, 0.0, true, 0.0, true, 420]
	]
	var observed: Dictionary = {}
	for row in rows:
		var result: Dictionary = _source.auto_cooldown(row[1], row[2], row[3], row[4], row[5], row[6])
		_value(result, float(row[7]), "auto cooldown " + row[0])
		observed[row[0]] = result.get("value")
	_observations["cooldowns"] = observed


func _not_ready(packet: Dictionary, raw: Variant, reason: String, label: String) -> void:
	_check(packet.get("status") == "NOT_READY" and not packet.has("value"), label + ": no numeric fallback")
	_check(packet.get("reason") == reason, label + ": reason")
	_check(packet.has("raw") and typeof(packet["raw"]) == typeof(raw), label + ": raw type")
	if typeof(raw) in [TYPE_ARRAY, TYPE_DICTIONARY, TYPE_OBJECT]:
		_check(is_same(packet.get("raw"), raw), label + ": raw reference preserved")
	else:
		_check(packet.get("raw") == raw, label + ": raw value preserved")


func _test_unsupported() -> void:
	var object = RefCounted.new()
	var array = ["keep", {"value": 3}]
	var dictionary = {"keep": array}
	var inputs = [null, true, "1", StringName("1"), array, dictionary, object,
		Vector2(1, 2), 9007199254740992, -9223372036854775807 - 1]
	for raw in inputs:
		_not_ready(_source.pot_heal(raw), raw, "unsupported_level", "level " + type_string(typeof(raw)))
		_not_ready(_source.enhanced_heal(0, raw), raw, "unsupported_potion_power", "power " + type_string(typeof(raw)))
	for raw in [array, dictionary, object, StringName(".1"), Vector2(1, 2), 9007199254740992]:
		_not_ready(_source.auto_cooldown(raw, true, 0, true, 0, true), raw,
			"unsupported_gloves_pot_cd", "gloves " + type_string(typeof(raw)))
		_not_ready(_source.auto_cooldown(0, true, raw, true, 0, true), raw,
			"unsupported_belt_pot_cd", "belt " + type_string(typeof(raw)))
		_not_ready(_source.auto_cooldown(0, true, 0, true, raw, true), raw,
			"unsupported_p_regen", "passive " + type_string(typeof(raw)))
	# Missing-property carriers are not accessed/coerced, regardless of raw shape.
	_value(_source.auto_cooldown(object, false, dictionary, false, 0, true), 420, "absent property raw unused")
	_check(array == ["keep", {"value": 3}] and is_same(dictionary["keep"], array), "unsupported input containers unchanged")


func _test_repeatability() -> void:
	var independent = SOURCE.new()
	_value(_source.enhanced_heal(0, 0.0), 100, "first amount")
	_value(_source.enhanced_heal(1, 0.0), 150, "next call reads new level")
	_value(_source.enhanced_heal(1, 0.12), 168, "next call reads new power")
	_value(independent.enhanced_heal(0, 0.0), 100, "second instance independent")
	var first: Dictionary = _source.auto_cooldown(0, true, 0, true, 0, true)
	first["value"] = -999
	_value(_source.auto_cooldown(0, true, 0, true, 0, true), 420, "results are not a shared cache")
