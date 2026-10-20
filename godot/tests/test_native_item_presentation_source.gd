extends SceneTree
## IT-02: pure presentation tests. No Main or user:// IO.
const Presentation := preload("res://port_modules/item_presentation_source/producer.gd")
const USERDIR := "EXODUSER-it-02-Isolated-20261020"
var _checks := 0
var _failures := 0
var _group := ""
var _groups: Array = []
var _pool: Array
var _model: Variant
var _oracle_values: Array = []
var _oracle_names: Array = []

class Language extends RefCounted:
	var english := false
	var calls: Array = []
	func translate(value: String) -> String:
		calls.append(["T", value])
		return {"검": "Sword", "맹독의": "Poisoned", "물리방패의": "of Physical Guard"}.get(value, value) if english else value
	func localize(ko: String, en: String) -> String:
		calls.append(["L", ko, en])
		return en if english else ko

var _language := Language.new()

func _initialize() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true \
			or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR \
			or OS.get_user_data_dir().get_file() != USERDIR:
		printerr("IT02_INVALID isolated user directory required: ", OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")

func _run() -> void:
	var data: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/item_generation_tables.json"))
	if not data is Dictionary or not data.get("AFFIX_POOL") is Array:
		printerr("IT02_INVALID existing readonly affix table unavailable")
		quit(2)
		return
	_pool = data.AFFIX_POOL
	_model = Presentation.new(_pool, Callable(_language, "translate"), Callable(_language, "localize"))
	for group in ["rarity", "formatting", "names_and_callbacks", "first_definition", "unsupported", "purity", "source_pool"]:
		_group = group
		_language.english = false
		_language.calls.clear()
		var before := _checks
		var failed_before := _failures
		call("_test_" + group)
		_groups.append({"group": group, "checks": _checks - before, "failures": _failures - failed_before})
	print("IT02_TABLES ", JSON.stringify({"RARITY": Presentation.RARITY, "RARITY_N": Presentation.RARITY_N,
		"RARITY_N_EN": Presentation.RARITY_N_EN, "RARITY_C": Presentation.RARITY_C, "RARITY_MUL": Presentation.RARITY_MUL,
		"AFFIX_NAMES_KO": Presentation.AFFIX_NAMES_KO, "_AFFIX_DESC": Presentation._AFFIX_DESC}))
	print("IT02_VALUES ", JSON.stringify(_oracle_values))
	print("IT02_NAMES ", JSON.stringify(_oracle_names))
	print("IT02_RESULT ", JSON.stringify({"checks": _checks, "failures": _failures, "groups": _groups,
		"userdir": OS.get_user_data_dir(), "main_booted": false, "public_play_evidence": false,
		"source": "game.html:14346-14351,14858-15013,49730-49821,50422-50456"}))
	quit(0 if _failures == 0 and _checks > 0 else 1)

func _check(condition: bool, label: String) -> void:
	_checks += 1
	if not condition:
		_failures += 1
		printerr("IT02_FAIL ", _group, " ", label)

func _value(result: Dictionary, expected: String, label: String) -> void:
	_check(result.get("status") == "READY" and result.get("ready") == true and result.get("value") == expected, label + " -> " + str(result))

func _record_value(af: Dictionary, model: Variant = null, lang: String = "ko", pool: Variant = null) -> void:
	var target: Variant = _model if model == null else model
	var row := {"affix": af.duplicate(true), "compact": target.compact_value(af), "detail": target.detail_value(af), "lang": lang}
	var value: Variant = af.get("value")
	if value is float:
		row["float_bits"] = PackedFloat64Array([value]).to_byte_array().hex_encode()
	if value is float and not is_finite(value):
		row["value_kind"] = "NaN" if is_nan(value) else ("Infinity" if value > 0 else "-Infinity")
		row.affix.value = null
	if pool != null:
		row["pool"] = pool
	_oracle_values.append(row)

func _test_rarity() -> void:
	var ko := ["일반", "고급", "희귀", "영웅", "전설", "유니크"]
	var en := ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Unique"]
	var colors := ["#aaa", "#44cc44", "#4488ff", "#bb44ff", "#ffaa00", "#8e55e9"]
	var multipliers := [1.0, 1.2, 1.5, 1.8, 2.2, 2.5]
	for i in range(6):
		var view: Dictionary = _model.rarity_view(i)
		_check(view.ready and view.name == ko[i] and view.color == colors[i] and view.multiplier == multipliers[i], "rarity constants " + str(i))
		_check(view.code_present == (i < 5) and view.has("code") == (i < 5), "RARITY[5] must remain absent")
	_language.english = true
	for i in range(6):
		_check(_model.rarity_view(i).name == en[i], "English rarity " + str(i))

func _test_formatting() -> void:
	var rows := [
		["critRate", .0125, "+1%", "+1.25%"], ["critRate", .0001, "+0%", "+0.01%"],
		["critRate", -.00005, "0%", "0%"], ["critRate", -.00015, "0%", "-0.01%"],
		["critRate", -.005, "0%", "-0.5%"], ["critRate", -0.0, "0%", "0%"],
		["critRate", "0.0125", "+1%", "+1%"], ["critRate", true, "+100%", "+100%"],
		["critRate", INF, "+0%", "+0%"], ["critRate", -INF, "0%", "0%"], ["critRate", NAN, "0%", "0%"],
		["critRate", 21474836.48, "+-2147483648%", "+2147483648%"],
		["cooldownRed", -.0255, "-2%", "-2.55%"],
		["poisonDot", 5.25, "5.25/s", "5.25/s"], ["poisonDot", "raw", "raw/s", "raw/s"],
		["defFlat", 5, "+5", "+5"], ["defFlat", true, "+true", "+true"], ["defFlat", "+5", "++5", "++5"],
		["kiSlashParry", 20, "0.33초", "0.33초"], ["kiSlashParry", 67.5, "1.13초", "1.13초"],
		["kiSlashParry", -67.5, "-1.13초", "-1.13초"], ["kiSlashParry", 60.3, "1.00초", "1.00초"],
		["kiSlashParry", .3, "0.01초", "0.01초"], ["kiSlashParry", -.00001, "-0.00초", "-0.00초"],
		["kiSlashParry", -0.0, "0.00초", "0.00초"], ["kiSlashParry", "bad", "NaN초", "NaN초"],
		["parryExplosion", 1.125, "ATK×112%", "ATK×112%"], ["reviveOnce", .3555, "35%HP", "35%HP"],
		["missing", -0.0, "0", "0"], ["missing", "raw", "raw", "raw"], ["missing", null, "", ""],
		["missing", .123456, "0.123456", "0.123456"], ["missing", .000001, "0.000001", "0.000001"],
		["missing", 1e-7, "1e-7", "1e-7"], ["missing", 1e15, "1000000000000000", "1000000000000000"],
		["missing", 1e20, "100000000000000000000", "100000000000000000000"], ["missing", 1e21, "1e+21", "1e+21"],
		["missing", 1.2345678901234567, "1.2345678901234567", "1.2345678901234567"],
		["missing", 9.999999999999998, "9.999999999999998", "9.999999999999998"],
		["missing", _smallest_double(), "5e-324", "5e-324"], ["missing", 1e-300, "1e-300", "1e-300"],
		["missing", 1.7976931348623157e308, "1.7976931348623157e+308", "1.7976931348623157e+308"],
		["kiSlashParry", 1e15, "16666666666666.67초", "16666666666666.67초"],
		["kiSlashParry", -1e15, "-16666666666666.67초", "-16666666666666.67초"],
		["kiSlashParry", 6e22, "1e+21초", "1e+21초"],
	]
	for row in rows:
		var af := {"id": row[0], "value": row[1]}
		_value(_model.compact_value(af), row[2], "compact " + str(row))
		_value(_model.detail_value(af), row[3], "detail " + str(row))
		_record_value(af)
	_value(_model.compact_value({"id": "critRate"}), "", "missing value")
	var unbound := Presentation.new()
	_value(unbound.compact_value({}), "", "compact null precedes pool lookup")
	_check(not unbound.detail_value({}).ready, "detail lookup precedes null fallback")
	_language.english = true
	_value(_model.compact_value({"id": "kiSlashParry", "value": 20}), "0.33s", "tick language callback")
	_record_value({"id": "kiSlashParry", "value": 20}, _model, "en")
	_language.calls.clear()
	_model.detail_value({"id": "kiSlashParry", "value": null})
	_check(_language.calls.is_empty(), "null tick does not request localized suffix")

func _smallest_double() -> float:
	# GDScript's decimal literal parser underflows 5e-324; use exact binary64 bits.
	var bytes := PackedByteArray()
	bytes.resize(8)
	bytes.encode_u64(0, 1)
	return bytes.decode_double(0)

func _record_name(item: Dictionary, expected: String, lang: String = "ko", model: Variant = null, pool: Variant = null) -> void:
	var target: Variant = _model if model == null else model
	var result: Dictionary = target.item_name(item)
	_value(result, expected, "item name")
	var row := {"item": item.duplicate(true), "result": result, "lang": lang}
	if pool != null:
		row["pool"] = pool
	_oracle_names.append(row)

func _test_names_and_callbacks() -> void:
	var item := {"name": "검", "affixes": [{"id": "poisonDot"}, {"id": "physDR"}, {"id": "fireDot"}]}
	_record_name(item, "맹독의 검 [물리방패의]")
	_check(_language.calls == [["T", "검"], ["T", "맹독의"], ["T", "물리방패의"]], "base/prefix/suffix translation order")
	_language.english = true
	_record_name(item, "Poisoned Sword [of Physical Guard]", "en")
	_language.english = false
	var legacy := {"name": "검", "prefix": {"name": "옛접두"}, "suffix": {"name": "옛접미"}}
	_record_name(legacy, "옛접두 검 [옛접미]")
	for affixes in [null, false, 0, ""]:
		legacy["affixes"] = affixes
		_record_name(legacy, "옛접두 검 [옛접미]")
	legacy["affixes"] = []
	_language.calls.clear()
	_record_name(legacy, "검")
	_check(_language.calls == [["T", "검"]], "empty Array is truthy; no legacy translations")
	var unknown := {"name": "검", "affixes": [{"id": "missing"}]}
	_record_name(unknown, "검")
	var view: Dictionary = _model.affix_view({"id": "poisonDot", "value": 5})
	_check(view.ready and view.name == "맹독의" and view.description == "독 DoT" and view.value_text == "5/s" and view.color == "#66ddff", "known affix view")
	view = _model.affix_view({"id": "missing", "value": "raw"})
	_check(view.ready and view.name == "missing" and view.description == "" and view.value_text == "raw" and view.color == "#ffcc44" and not view.definition_present, "unknown view source fallbacks")
	_language.calls.clear()
	_model.affix_view({"id": "kiSlashParry", "value": 20})
	_check(_language.calls == [["T", "검기막이의"], ["T", "기검참3타패링"], ["L", "초", "s"]], "label/description/value localization order")

func _test_first_definition() -> void:
	var pool := [{"id": "critDmgW", "unit": "val", "type": 0}, {"id": "critDmgW", "unit": "pct", "type": 1}]
	var model := Presentation.new(pool, Callable(_language, "translate"), Callable(_language, "localize"))
	_value(model.compact_value({"id": "critDmgW", "value": .25}), "+0.25", "duplicate ID uses first definition")
	_record_value({"id": "critDmgW", "value": .25}, model, "ko", pool.duplicate(true))
	_record_name({"name": "검", "affixes": [{"id": "critDmgW"}]}, "극대화의 검", "ko", model, pool.duplicate(true))
	pool[0].type = 1
	_record_name({"name": "검", "affixes": [{"id": "critDmgW"}]}, "검 [극대화의]", "ko", model, pool.duplicate(true))
	_check(pool[0].unit == "val", "query does not mutate supplied pool")

func _bad(result: Dictionary, label: String) -> void:
	_check(result.get("status") == "NOT_READY" and result.get("ready") == false and result.get("reason", "") != "" and not result.has("value"), label)

func _test_unsupported() -> void:
	var unbound := Presentation.new(_pool)
	_bad(unbound.item_name({"name": "검"}), "missing T callback")
	_bad(unbound.rarity_view(0), "missing L callback")
	_bad(unbound.compact_value({"id": "kiSlashParry", "value": 20}), "missing tick L callback")
	for af in [null, true, [], "bad", {"id": "defFlat", "value": {}}, {"id": "critRate", "value": []}]:
		_bad(_model.compact_value(af), "unsupported affix/value")
	_bad(_model.compact_value({"id": "missing", "value": 9223372036854775807}), "native integer cannot silently lose precision in JS Number")
	for index in [-1, 6, 2.5, true, "2", NAN]:
		_bad(_model.rarity_view(index), "invalid rarity index")
	for item in [null, {}, {"name": "검", "affixes": "bad"}, {"name": "검", "affixes": [null]}, {"name": "검", "prefix": true}]:
		_bad(_model.item_name(item), "unsupported item shape")
	var invalid := Presentation.new([null], Callable(_language, "translate"), Callable(_language, "localize"))
	_bad(invalid.detail_value({"id": "critRate", "value": 1}), "malformed source pool")
	var bad_callback := Presentation.new(_pool, func(_x: String) -> Variant: return null)
	_bad(bad_callback.item_name({"name": "검"}), "invalid translation return")

func _test_purity() -> void:
	var af := {"id": "poisonDot", "value": 5.25, "extra": {"keep": true}}
	var list := [af, {"id": "physDR", "value": .04}]
	var item := {"name": "검", "uniqueArt": "ui-03", "affixes": list, "prefix": {"name": "old"}}
	var before: Dictionary = item.duplicate(true)
	var pool_before: Array = _pool.duplicate(true)
	for i in range(3):
		_model.item_name(item)
		_model.affix_view(af)
		_model.compact_value(af)
	_check(item == before and _pool == pool_before, "all input fields and source pool unchanged")
	_check(is_same(item.affixes, list) and is_same(list[0], af), "nested input identity unchanged")
	var result: Dictionary = _model.affix_view(af)
	result.name = "caller edit"
	_check(_model.affix_view(af).name == "맹독의", "result is detached from source strings")
	_check(root.get_child_count() == 0, "Main/game nodes not created")

func _test_source_pool() -> void:
	_check(_pool.size() == 409, "latest existing source pool has 409 records")
	_check(Presentation.AFFIX_NAMES_KO.size() == 417 and Presentation._AFFIX_DESC.size() == 265, "generated display dictionaries have exact source counts")
	for entry: Dictionary in _pool:
		for value: Variant in entry.tiers:
			var af := {"id": entry.id, "value": value}
			var compact: Dictionary = _model.compact_value(af)
			var detail: Dictionary = _model.detail_value(af)
			_check(compact.ready and detail.ready, "source tier formats without unsupported fallback: " + entry.id + ":" + str(value))
			_record_value(af)
