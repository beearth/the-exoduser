extends SceneTree
## W01: 원 _autoBowSpec 순수 계산의 고정 oracle·진단·불변성 검수.
## Main/INV writer/실제 저장/입력/투사체/게임 clock 실행 없음.
const USERDIR = "EXODUSER-w01-Isolated-20261020"
const SPEC = preload("res://port_modules/auto_bow_spec/producer.gd")
const CATALOG = preload("res://port_modules/item_armor_element/source_item_catalog.gd")
const BASE_SHA = "c3cf8ce6b0cc1a5c381240260e03dff71c68af8d"
var assertions: int = 0
var failures: int = 0
var cases: int = 0
var subject = SPEC.new()
var catalog = CATALOG.new()

class BadCatalog extends RefCounted:
	func bow_definition(_key: Variant) -> Variant:
		return 7

class MissingCatalog extends RefCounted:
	func bow_definition(_key: Variant) -> Variant:
		return null

class SparseCatalog extends RefCounted:
	# Test dependency fixture, not an alternate product catalog or INV authority.
	func bow_definition(_key: Variant) -> Variant:
		return {"range": 0, "projSpd": 0}

func _initialize() -> void:
	ProjectSettings.set_setting("application/config/use_custom_user_dir", true)
	ProjectSettings.set_setting("application/config/custom_user_dir_name", USERDIR)
	call_deferred("_run")

func _run() -> void:
	check(OS.get_user_data_dir().get_file() == USERDIR, "exact isolated userdir")
	check(root.get_child_count() == 0, "no Main or gameplay nodes")
	_test_original_vectors()
	_test_coercion_boundaries()
	_test_unsupported_and_dependencies()
	_test_immutability_and_receipts()
	print("W01_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"cases": cases, "userdir": OS.get_user_data_dir(), "actual_Main": false,
		"source_base": BASE_SHA, "source_function": "_autoBowSpec", "skipped": []}))
	quit(0 if failures == 0 else 1)

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("W01_ASSERT_FAIL ", label)

func _same_value(actual: Variant, expected: Variant) -> bool:
	if typeof(actual) != typeof(expected):
		return false
	if expected is float:
		if is_nan(expected): return is_nan(actual)
		if is_inf(expected): return actual == expected
		return absf(actual - expected) <= 0.000000001
	return actual == expected

func _observe(value: Variant) -> Variant:
	if value is float:
		if is_nan(value): return {"number_kind": "NaN"}
		if is_inf(value): return {"number_kind": "+Infinity" if value > 0 else "-Infinity"}
	return value

func _expect(label: String, bow: Dictionary, passives: Dictionary,
	expected_range: float, expected_speed: Variant, status: String = "READY",
	expected_key: String = "crossbow", fallback: bool = false) -> Dictionary:
	cases += 1
	var before_bow: Dictionary = bow.duplicate(true)
	var before_passives: Dictionary = passives.duplicate(true)
	var got: Dictionary = subject.evaluate(bow, passives, catalog)
	check(got.get("status") == status, label + ": status")
	var actual_range: Variant = got.get("range")
	check(actual_range is float and _same_value(actual_range, expected_range), label + ": exact range")
	check(_same_value(got.get("spd"), expected_speed), label + ": raw speed value and type")
	check(got.get("catalog_key") == expected_key and got.get("catalog_fallback") == fallback,
		label + ": catalog selection")
	check(got.get("input_presence", {}).get("pBow") == passives.has("pBow"), label + ": pBow presence")
	check(_same_value(got.get("raw_range"), actual_range) and _same_value(got.get("raw_spd"), got.get("spd")),
		label + ": receipt preserves raw result")
	check(_deep_same(bow, before_bow) and _deep_same(passives, before_passives),
		label + ": deep inputs unchanged including NaN")
	print("W01_CASE_RESULT ", JSON.stringify({"case": label, "status": got.get("status"),
		"range": _observe(actual_range), "spd": _observe(got.get("spd")),
		"spd_type": typeof(got.get("spd")), "catalog_key": got.get("catalog_key")}))
	return got

func _deep_same(actual: Variant, expected: Variant) -> bool:
	if typeof(actual) != typeof(expected): return false
	if expected is Dictionary:
		if actual.size() != expected.size(): return false
		for key in expected:
			if not actual.has(key) or not _deep_same(actual[key], expected[key]): return false
		return true
	if expected is Array:
		if actual.size() != expected.size(): return false
		for index in expected.size():
			if not _deep_same(actual[index], expected[index]): return false
		return true
	return _same_value(actual, expected)

func _expect_blocked(label: String, bow: Dictionary, dependency: RefCounted,
	status: String = "SOURCE_UNSUPPORTED") -> void:
	cases += 1
	var got: Dictionary = subject.evaluate(bow, {"pBow": 0}, dependency)
	check(got.get("status") == status, label + ": blocked status")
	check(got.has("range") and got.range == null and got.has("spd") and got.spd == null,
		label + ": no fabricated numeric result")
	check(not String(got.get("reason", "")).is_empty(), label + ": diagnostic reason")

func _test_original_vectors() -> void:
	# Fixed expected values from latest game.html:17451–17457 / :28044.
	# These expectations do not call the Godot producer or recompute its formula.
	_expect("01 empty", {}, {"pBow": 0}, 800.0, 22)
	_expect("02 repeater", {"btype": "repeater"}, {"pBow": 0}, 700.0, 22, "READY", "repeater")
	_expect("03 arcane", {"btype": "arcane"}, {"pBow": 0}, 840.0, 22, "READY", "arcane")
	_expect("04 unknown", {"btype": "unknown"}, {"pBow": 0}, 800.0, 22, "READY", "crossbow", true)
	var explicit_null := _expect("05 null btype", {"btype": null}, {"pBow": 0}, 800.0, 22)
	check(explicit_null.input_presence.btype and explicit_null.btype_fallback, "null btype presence vs default")
	_expect("06 catalog floor", {"bowRange": 100}, {"pBow": 0}, 800.0, 22)
	_expect("07 greater raw range", {"bowRange": 1200}, {"pBow": 0}, 1200.0, 22)
	_expect("08 bonus", {"bonusRange": 2}, {"pBow": 0}, 824.0, 22)
	_expect("09 passive ten", {}, {"pBow": 10}, 1440.0, 22)
	_expect("10 negative passive", {}, {"pBow": -10}, 220.0, 22)
	_expect("11 operation order", {"bowRange": 1000, "bonusRange": 3}, {"pBow": 5}, 1450.4, 22)
	_expect("12 zero speed", {"bowProjSpd": 0}, {"pBow": 0}, 800.0, 22)
	_expect("13 negative speed", {"bowProjSpd": -5}, {"pBow": 0}, 800.0, -5)
	_expect("14 string zero speed", {"bowProjSpd": "0"}, {"pBow": 0}, 800.0, "0", "SOURCE_RAW_SPEED")
	_expect("15 missing passive", {}, {}, NAN, 22, "SOURCE_NON_FINITE")
	_expect("16 null passive", {}, {"pBow": null}, 800.0, 22)
	_expect("17 bad range", {"bowRange": "abc"}, {"pBow": 0}, NAN, 22, "SOURCE_NON_FINITE")
	_expect("18 array range", {"bowRange": []}, {"pBow": 0}, 800.0, 22)
	_expect("19 object bonus", {"bonusRange": {}}, {"pBow": 0}, NAN, 22, "SOURCE_NON_FINITE")
	_expect("20 infinite range", {"bowRange": INF}, {"pBow": 0}, INF, 22, "SOURCE_NON_FINITE")
	# JS inherited keys yield1000/13 and Array['repeater'] yields700/22 in the oracle.
	# W01 deliberately reports unsupported instead of ordinary unknown fallback.
	_expect_blocked("21 prototype", {"btype": "__proto__"}, catalog)
	_expect_blocked("22 constructor", {"btype": "constructor"}, catalog)
	_expect_blocked("23 array btype", {"btype": ["repeater"]}, catalog)
	_expect("24 object speed", {"bowProjSpd": {}}, {"pBow": 0}, 800.0, {}, "SOURCE_RAW_SPEED")

func _test_coercion_boundaries() -> void:
	_expect("string range", {"bowRange": "900"}, {"pBow": 0}, 900.0, 22)
	_expect("string bonus", {"bonusRange": "2"}, {"pBow": 0}, 824.0, 22)
	_expect("hex passive", {}, {"pBow": " 0xA "}, 1440.0, 22)
	_expect("empty passive string", {}, {"pBow": ""}, 800.0, 22)
	_expect("array passive", {}, {"pBow": [2]}, 928.0, 22)
	_expect("object passive", {}, {"pBow": {}}, NAN, 22, "SOURCE_NON_FINITE")
	_expect("unclamped passive", {}, {"pBow": 20}, 2080.0, 22)
	_expect("negative bonus minimum", {"bonusRange": -100}, {"pBow": 0}, 220.0, 22)
	_expect("NaN OR range", {"bowRange": NAN}, {"pBow": 0}, 800.0, 22)
	_expect("NaN passive propagates", {}, {"pBow": NAN}, NAN, 22, "SOURCE_NON_FINITE")
	_expect("Infinity times zero", {"bowRange": INF}, {"pBow": -12.5}, NAN, 22, "SOURCE_NON_FINITE")
	_expect("negative Infinity passive", {}, {"pBow": -INF}, 220.0, 22)
	_expect("boolean raw speed", {"bowProjSpd": true}, {"pBow": 0}, 800.0, true, "SOURCE_RAW_SPEED")
	_expect("empty array raw speed", {"bowProjSpd": []}, {"pBow": 0}, 800.0, [], "SOURCE_RAW_SPEED")
	_expect("infinite raw speed", {"bowProjSpd": INF}, {"pBow": 0}, 800.0, INF, "SOURCE_NON_FINITE")
	var combined := _expect("raw speed and NaN", {"bowRange": "bad", "bowProjSpd": "0"},
		{"pBow": 0}, NAN, "0", "SOURCE_RAW_SPEED")
	check(combined.non_finite_fields == ["range"], "raw speed diagnosis retains nonfinite range")
	var falsy := _expect("false btype", {"btype": false}, {"pBow": 0}, 800.0, 22)
	check(falsy.btype_fallback and not falsy.catalog_fallback, "btype OR vs lookup fallback")
	_expect("numeric unknown btype", {"btype": 42}, {"pBow": 0}, 800.0, 22, "READY", "crossbow", true)
	var sparse: Dictionary = subject.evaluate({}, {"pBow": 0}, SparseCatalog.new())
	check(sparse.status == "READY" and sparse.range == 1000.0 and sparse.spd == 13,
		"source constant fallback reached through explicit sparse dependency fixture")

func _test_unsupported_and_dependencies() -> void:
	for key in ["__defineGetter__", "__defineSetter__", "hasOwnProperty", "__lookupGetter__",
		"__lookupSetter__", "isPrototypeOf", "propertyIsEnumerable", "toString", "valueOf", "toLocaleString"]:
		_expect_blocked("prototype " + key, {"btype": key}, catalog)
	_expect_blocked("dictionary btype", {"btype": {}}, catalog)
	_expect_blocked("fractional btype", {"btype": 1.25}, catalog)
	_expect_blocked("unsafe integer btype", {"btype": 9007199254740992}, catalog)
	_expect_blocked("foreign numeric carrier", {"bonusRange": Vector2.ONE}, catalog)
	_expect_blocked("custom converter carrier", {"bowRange": {"valueOf": 3}}, catalog)
	var self_cycle: Array = []
	self_cycle.append(self_cycle)
	_expect_blocked("self-referential numeric array", {"bowRange": self_cycle}, catalog)
	var left: Array = []
	var right: Array = []
	left.append(right)
	right.append(left)
	_expect_blocked("mutually-referential numeric arrays", {"bonusRange": left}, catalog)
	var passive_cycle: Dictionary = subject.evaluate({}, {"pBow": self_cycle}, catalog)
	check(passive_cycle.status == "SOURCE_UNSUPPORTED" and passive_cycle.range == null,
		"cyclic passive is unsupported without fake range")
	# Break fixture reference cycles before shutdown; no product cleanup or source mutation.
	self_cycle.clear()
	left.clear()
	right.clear()
	_expect_blocked("null dependency", {}, null, "NOT_READY")
	_expect_blocked("missing method", {}, RefCounted.new(), "NOT_READY")
	_expect_blocked("wrong definition type", {}, BadCatalog.new(), "NOT_READY")
	_expect_blocked("missing default definition", {}, MissingCatalog.new(), "NOT_READY")

func _test_immutability_and_receipts() -> void:
	var bow := {"btype": "arcane", "bowRange": 1200, "bonusRange": 2,
		"bowProjSpd": {"nested": [1, 2]}, "unrelated": {"item": [3, 4]}}
	var passives := {"pBow": 3, "unrelated": [7, {"x": 8}]}
	var before_bow := bow.duplicate(true)
	var before_passives := passives.duplicate(true)
	var before_catalog := CATALOG.BOWTYPES.duplicate(true)
	var first: Dictionary = subject.evaluate(bow, passives, catalog)
	var second: Dictionary = subject.evaluate(bow, passives, catalog)
	check(first == second, "same inputs repeat exact receipt")
	check(bow == before_bow and passives == before_passives, "deep input snapshots unchanged")
	check(CATALOG.BOWTYPES == before_catalog, "catalog constants unchanged by evaluate")
	var definition: Dictionary = catalog.bow_definition("arcane")
	definition.range = -123
	check(catalog.bow_definition("arcane").range == 840, "catalog returned definition is a deep copy")
	check(subject.evaluate({}, {"pBow": 0}, catalog).range == 800.0, "prior calls do not cache effective bow")
	check(first.source.base_sha == BASE_SHA and first.source.file == "game.html"
		and first.source.function == "_autoBowSpec" and first.source.lines == [17451, 17457]
		and first.source.passive_line == 28044, "current source receipt")
	first.source.lines[0] = -1
	check(subject.evaluate({}, {"pBow": 0}, catalog).source.lines == [17451, 17457], "receipt metadata does not mutate module constant")
	check(first.input_presence == {"btype": true, "bowRange": true, "bonusRange": true,
		"bowProjSpd": true, "pBow": true}, "exact input presence key set")
	check(root.get_child_count() == 0, "still no Main/gameplay nodes")
