extends SceneTree
const Special := preload("res://port_modules/item_special_text_source/producer.gd")
const USERDIR := "EXODUSER-it-05-Isolated-20261020"
var checks := 0
var failures := 0
var group := ""
var groups: Array = []
var oracle: Array = []
var tables: Dictionary
var model: Variant

class Language extends RefCounted:
	var english := false
	var calls: Array = []
	func translate(text: String) -> String:
		calls.append(text)
		if not english: return text
		return {"하옵": "Low", "중옵": "Mid", "상옵": "High",
			"template": "English {p}|{s}|{n}"}.get(text, "EN:" + text)

var language := Language.new()

func _initialize() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true \
			or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR \
			or OS.get_user_data_dir().get_file() != USERDIR:
		printerr("IT05_INVALID isolated directory required: ", OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("run")

func run() -> void:
	var data: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/item_generation_tables.json"))
	if not data is Dictionary or not data.get("LEGENDARY_SPECIAL") is Dictionary or not data.get("UNIQUE_SPECIAL") is Dictionary:
		printerr("IT05_INVALID existing readonly tables unavailable")
		quit(2)
		return
	tables = data
	model = Special.new(tables.LEGENDARY_SPECIAL, tables.UNIQUE_SPECIAL, language.translate)
	for name in ["all_definitions", "roll_boundaries", "legacy_and_substitution", "reverse_and_locale", "unsupported", "purity"]:
		group = name
		language.english = false
		language.calls.clear()
		var before := checks
		var failed_before := failures
		call("test_" + name)
		groups.append({"group": name, "checks": checks - before, "failures": failures - failed_before})
	print("IT05_ORACLE ", JSON.stringify(oracle))
	print("IT05_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "groups": groups,
		"oracle_inputs": oracle.size(), "userdir": OS.get_user_data_dir(), "main_booted": false,
		"live_writes": 0, "source": "game.html:16625-16626,49822-49847"}))
	quit(0 if failures == 0 and checks > 0 else 1)

func check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
		printerr("IT05_FAIL ", group, " ", label)

func record(kind: String, special: Variant, target: Variant = null, legends: Variant = null, uniques: Variant = null) -> Dictionary:
	var selected: Variant = model if target == null else target
	language.calls.clear()
	var result: Dictionary = selected.unique_view(special) if kind == "unique" else selected.legendary_text(special)
	var row := {"kind": kind, "special": special.duplicate(true) if special is Dictionary else special,
		"result": result, "english": language.english, "calls": language.calls.duplicate()}
	if legends != null: row["legendary_table"] = legends.duplicate(true)
	if uniques != null: row["unique_table"] = uniques.duplicate(true)
	oracle.append(row)
	return result

func test_all_definitions() -> void:
	check(tables.LEGENDARY_SPECIAL.size() == 19 and tables.UNIQUE_SPECIAL.size() == 39, "existing19/39 definitions")
	for definition: Dictionary in tables.LEGENDARY_SPECIAL.values():
		var result := record("legendary", {"stat": definition.stat, "ko": "old saved text", "val": -999})
		check(result.ready and result.text == definition.ko and result.definition_present, "legend current text by stat, not saved value")
	for definition: Dictionary in tables.UNIQUE_SPECIAL.values():
		var samples: Array = [null]
		if definition.has("roll"):
			samples = [definition.roll[0], floor((definition.roll[0] + definition.roll[1]) / 2.0), definition.roll[1]]
		for raw: Variant in samples:
			var special := {"stat": definition.stat, "ko": definition.ko, "val": definition.val}
			if raw != null:
				special["disp"] = raw
				special["secs"] = "00.50" # Exact saved string, intentionally independent of raw.
			var result := record("unique", special)
			check(result.ready and result.definition_present, "all39 known views ready")
			check(not ("{s}" in result.text or "{p}" in result.text or "{n}" in result.text), "all39 canonical placeholders removed")
			check(result.label_present == definition.has("roll"), "fixed effects have no roll label")
			if raw != null:
				check(result.raw_text == str(int(raw)), "disp takes precedence over unchanged val")
			else:
				check(result.label == "" and result.label_color == "", "no invented label for fixed definition")

func custom_model(roll: Array = [0, 3], scale: Variant = null) -> Dictionary:
	var definition := {"stat": "range", "ko": "{s}/{p}/{n}", "val": 0, "roll": roll}
	if scale != null: definition["scale"] = scale
	var unique := {"a": definition}
	return {"model": Special.new({}, unique, language.translate), "unique": unique}

func test_roll_boundaries() -> void:
	var custom := custom_model()
	for row in [[-1, 0], [0, 0], [.999999999, 0], [1, 1], [1.00000001, 1], [1.99999999, 1], [2, 2], [3, 2], [4, 2]]:
		var special := {"stat": "range", "ko": "{p}", "disp": row[0]}
		var result := record("unique", special, custom.model, {}, custom.unique)
		check(result.ready and result.label == Special.LABELS[row[1]] and result.label_color == Special.LABEL_COLORS[row[1]], "exact thirds boundary " + str(row[0]))
	for roll in [[3, 3], [3, 0]]:
		custom = custom_model(roll)
		var result := record("unique", {"stat": "range", "ko": "fixed", "val": 3}, custom.model, {}, custom.unique)
		check(result.ready and not result.label_present, "non-increasing range has no label")

func test_legacy_and_substitution() -> void:
	# Scaled old saves have no disp: use source Math.round(val/scale), not floor.
	for row in [[.305, "31"], [-.005, "0"], [.4999, "50"]]:
		var special := {"stat": "_uKiChargeDmg", "ko": "{p}|{n}|{s}", "val": row[0], "secs": "00.50"}
		var result := record("unique", special)
		check(result.ready and result.raw_text == row[1] and result.text == row[1] + "|" + row[1] + "|00.50", "scale reconstruction/seconds string preserved")
	var result := record("unique", {"stat": "_uParryRageCd", "ko": "{s}:{p}", "val": 30})
	check(result.ready and result.text == ":30", "missing secs stays empty; no invented /60 recovery")
	for raw: Variant in [0, null, false, "", "raw", "$$", "$&", "$`", "$'", "$1"]:
		result = record("unique", {"stat": "old_unknown", "ko": "a{s}b{p}c{n}d", "disp": raw, "secs": raw, "val": 999})
		check(result.ready and not result.label_present and not result.definition_present, "defined disp including falsy values wins")
	result = record("unique", {"stat": "old_unknown", "ko": "{p}|{p}|{s}|{s}|{n}|{n}", "val": 7, "secs": "x"})
	check(result.ready and result.text == "7|{p}|x|{s}|7|{n}", "source replaces first literal occurrence only")
	result = record("unique", {"stat": "old_unknown", "ko": "{p}|{s}|{n}"})
	check(result.ready and result.text == "undefined||undefined", "missing raw value is undefined, missing secs empty")

func test_reverse_and_locale() -> void:
	var legends := {"a": {"stat": "same", "ko": "first"}, "b": {"stat": "same", "ko": "last"}}
	var uniques := {"a": {"stat": "same", "ko": "unused", "scale": .01, "roll": [0, 3]},
		"b": {"stat": "same", "ko": "last", "scale": .1, "roll": [0, 30]}}
	var custom := Special.new(legends, uniques, language.translate)
	var result := record("legendary", {"stat": "same", "ko": "saved"}, custom, legends, uniques)
	check(result.ready and result.text == "last", "legend reverse index last-wins")
	result = record("unique", {"stat": "same", "ko": "{p}", "val": 1}, custom, legends, uniques)
	check(result.ready and result.raw_text == "10" and result.label == "중옵", "unique reverse index last-wins")
	result = record("legendary", {"stat": "old", "ko": "saved fallback"})
	check(result.ready and result.text == "saved fallback" and not result.definition_present, "unknown legendary saved ko fallback")
	language.english = true
	result = record("unique", {"stat": "_uKiChargeDmg", "ko": "template", "disp": 75, "secs": "0.50"})
	check(result.ready and result.text == "English 75|0.50|75" and result.label == "Mid", "translate before substitution")
	check(language.calls == ["template", "하옵", "중옵", "상옵"], "all3 labels translated eagerly in source order")
	result = record("legendary", {"stat": "_lHelmFree", "ko": "old"})
	check(result.ready and result.text == "EN:" + tables.LEGENDARY_SPECIAL.helmet.ko, "legend callback receives current definition ko")
	for empty in [null, false, 0, ""]:
		result = record("unique", empty)
		check(result.ready and result.text == "" and language.calls.is_empty(), "absent effect skips translation")
		result = record("legendary", empty)
		check(result.ready and result.text == "" and language.calls.is_empty(), "absent legend skips translation")

func bad(result: Dictionary, label: String) -> void:
	check(result.get("status") == "NOT_READY" and result.get("ready") == false and result.get("reason", "") != "" and not result.has("text"), label)

func test_unsupported() -> void:
	for special in [true, [], "bad", {"ko": "x", "stat": []}, {"ko": 3},
		{"ko": "x", "disp": {}}, {"ko": "x", "secs": []}, {"ko": "x", "val": 9223372036854775807},
		{"ko": "x", "stat": "constructor"}]:
		bad(model.unique_view(special), "unsupported unique input")
	bad(model.legendary_text({"stat": "unknown"}), "missing fallback ko")
	var unbound := Special.new(tables.LEGENDARY_SPECIAL, tables.UNIQUE_SPECIAL)
	bad(unbound.unique_view({"ko": "x"}), "translation callback missing")
	var invalid := Special.new({}, {"a": {"ko": "bad"}}, language.translate)
	bad(invalid.unique_view({"ko": "x"}), "malformed source index")
	invalid = Special.new({}, {"a": {"stat": "bad", "ko": "x", "roll": [0]}}, language.translate)
	bad(invalid.unique_view({"stat": "bad", "ko": "x"}), "malformed roll")
	invalid = Special.new({}, {"a": {"stat": "bad", "ko": "x", "scale": "0.1"}}, language.translate)
	bad(invalid.unique_view({"stat": "bad", "ko": "x", "val": 1}), "unsupported table scale")
	invalid = Special.new({}, {}, func(_text: String) -> Variant: return null)
	bad(invalid.unique_view({"ko": "x"}), "translation return not string")

func test_purity() -> void:
	var special := {"stat": "_uKiChargeDmg", "ko": "{p}", "val": .5, "extra": {"keep": [1, 2]}}
	var before: Dictionary = special.duplicate(true)
	var source_before: Dictionary = tables.duplicate(true)
	var nested: Array = special.extra.keep
	var result: Dictionary = model.unique_view(special)
	result.text = "caller edit"
	check(model.unique_view(special).text == "50", "fresh result detached")
	check(special == before and tables == source_before and is_same(special.extra.keep, nested), "input/tables/nested refs unchanged")
	check(root.get_child_count() == 0, "no Main/UI nodes created")
