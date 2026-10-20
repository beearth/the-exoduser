extends SceneTree
## FB-01. Pure catalog/initial records; never boots Main or fabricates a field boss actor.
const USERDIR = "EXODUSER-fb-01-Isolated-20261020"
const SOURCE_MAIN = "ad497089c7955d3e344e1488e5286e9b0ddd9092"
const SOURCE_SHA = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const ORACLE = "res://tests/fixtures/fb_01_source_oracle_20261020.json"
var subject: Script
var checks := 0
var failed: Array = []
var groups: Array = []
var current := "setup"
var random_callback_calls := 0
var oracle_cases := 0
var json_number_drifts := 0


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var path = "res://port_modules/fieldboss_source/catalog.gd"
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--catalog="):
			path = arg.trim_prefix("--catalog=") # External mutant diagnostics only.
	var isolated = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	_check(isolated, "exact isolated directory")
	if isolated:
		subject = load(path)
		_check(subject != null, "catalog script loads")
		if subject != null:
			for group in ["catalog_contract", "source_oracle", "invalid_inputs", "purity_and_rng"]:
				current = group
				var before = checks
				var before_failed = failed.size()
				call("_" + group)
				groups.append({"group": group, "assertions": checks - before, "failures": failed.size() - before_failed})
	print("FB01_RESULT ", JSON.stringify({"assertions": checks, "failures": failed.size(), "failed": failed,
		"groups": groups, "skipped": [], "oracle_cases": oracle_cases, "expected_oracle_cases": 205, "random_callback_calls": random_callback_calls,
		"decimal_json_input_drifts": json_number_drifts,
		"main_boots": 0, "live_state_writes": 0, "public_play_evidence": false}))
	quit(0 if failed.is_empty() else 1)


func _check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failed.append(current + ":" + label)


func _number(value: Variant) -> bool:
	return value is int or value is float


func _compare(actual: Variant, expected: Variant, label: String) -> void:
	if expected is Dictionary:
		_check(actual is Dictionary, label + ":dictionary")
		if not actual is Dictionary: return
		var keys = actual.keys(); keys.sort()
		var expected_keys = expected.keys(); expected_keys.sort()
		_check(keys == expected_keys, label + ":exact key set")
		for key in expected:
			if actual.has(key): _compare(actual[key], expected[key], label + "." + str(key))
	elif expected is Array:
		_check(actual is Array, label + ":array")
		if not actual is Array: return
		_check(actual.size() == expected.size(), label + ":length")
		for i in range(mini(actual.size(), expected.size())):
			_compare(actual[i], expected[i], label + "[" + str(i) + "]")
	elif _number(expected):
		_check(_number(actual) and float(actual) == float(expected), label + ":exact JS Number")
	else:
		_check(typeof(actual) == typeof(expected) and actual == expected, label + ":type/value")


func _catalog_contract() -> void:
	var expected = {
		"angler": {"count": 4, "tile_size": 40, "wake_distance": 1000,
			"sites": [[58,158],[148,150],[52,42],[148,42]], "element_ids": [2,1,3,4],
			"region_indices": [2,3,0,1], "hp_multiplier": 7.5, "energy_charge_ticks": 180},
		"worm": {"count": 4, "tile_size": 40, "wake_distance": 1000,
			"sites": [[70,160],[50,100],[155,70],[72,55]]},
		"firedevil": {"count": 4, "tile_size": 40, "wake_distance": 1000,
			"sites": [[78,125],[125,125],[78,70],[125,70]], "hp_multiplier": 2.5,
			"energy_charge_ticks": 180, "speed_per_tick": 1.8},
		"gate_guard": {"etype_by_hell": [29,39,49,59,69,79,89],
			"position_expression": "((G._bossCx+.5)*T,(G._gateY+3+.5)*T)",
			"mkEn_arguments": {"ib": false,"room": -1,"el_expression": "STG[si].be"},
			"requires": ["nonempty_bossGate","defined_gateY","front_tile_in_bounds_and_floor_0","approved_mkEn_input"],
			"post_mkEn_writes": [
				{"field":"hp","expression":"~~(gg.mhp*4)"}, {"field":"mhp","expression":"gg.hp"},
				{"field":"atk","expression":"~~(gg.atk*2)"}, {"field":"baseAtk","expression":"gg.atk"},
				{"field":"r","expression":"~~(gg.r*1.4)"}, {"field":"poise","value":80},
				{"field":"maxPoise","value":80}, {"field":"elite","value":3},
				{"field":"_isGateGuard","value":true}, {"field":"dropTier","expression":"Math.min(4,SI_TO_HELL[si]+2)"}],
			"region_clear_bonus": 0.10},
	}
	for kind in expected:
		var result: Dictionary = subject.catalog(kind)
		_ready(result, kind)
		_compare(result.get("value"), expected[kind], kind)


func _ready(result: Dictionary, kind: String) -> void:
	_check(result.get("status") == "READY" and result.get("writes") == 0, kind + ":pure READY")
	var ref = result.get("source_ref", {})
	_check(ref.get("main") == SOURCE_MAIN and ref.get("sha256") == SOURCE_SHA and ref.get("file") == "game.html", kind + ":source pin")
	var refs = {"angler":"16631,60694,60973-60978,60985,61043-61046", "worm":"61237-61243",
		"firedevil":"61443-61448,61460,61632-61635", "gate_guard":"31614-31626,60725"}
	_check(ref.get("lines") == refs[kind], kind + ":source lines")


func _source_oracle() -> void:
	var fixture = JSON.parse_string(FileAccess.get_file_as_string(ORACLE))
	_check(fixture is Dictionary, "independent JS fixture loads")
	if not fixture is Dictionary: return
	_check(fixture.source_main == SOURCE_MAIN and fixture.game_sha256 == SOURCE_SHA, "fixture source pin")
	var html = ProjectSettings.globalize_path("res://").path_join("../game.html").simplify_path()
	_check(FileAccess.get_sha256(html) == SOURCE_SHA, "actual worktree source bytes")
	_check(fixture.case_count == 205 and fixture.cases.size() == 205, "all 205 source cases present")
	for row in fixture.cases:
		oracle_cases += 1
		var input = _exact_input(row)
		var before = input.duplicate(true)
		var result: Dictionary = subject.build_initial(row.kind, input)
		_ready(result, row.kind)
		_compare(result.get("value"), row.expected, row.label)
		_compare(input, before, row.label + ":input unchanged")
	# Independent fixed numbers keep the seven ordinary rows reviewable beside the JS oracle.
	var fixed = [[0,16125,24,150,19,5375,21], [1,16125,27,195,22,5375,24],
		[10,39750,60,600,49,13250,55], [100,276000,384,4650,319,92000,357],
		[500,1326000,1824,22650,1519,442000,1701], [501,1328625,1827,22695,1522,442875,1704],
		[1000,2638500,3624,45150,3019,879500,3381]]
	for row in fixed:
		for k in range(3):
			var kind = ["angler","worm","firedevil"][k]
			var value: Dictionary = subject.build_initial(kind, _input(kind, row[0])).get("value", {})
			_check(value.get("hp") == row[1+k*2] and value.get("atk") == row[2+k*2], "fixed HP/ATK:" + kind + ":" + str(row[0]))


func _exact_input(row: Dictionary) -> Dictionary:
	# Godot's decimal JSON parser can round the JS input by one ULP. Preserve
	# the actual source operands, not a tolerance or a changed expected result.
	var input: Dictionary = row.input.duplicate(true)
	var numeric_keys: Array = []
	for key in input:
		if _number(input[key]): numeric_keys.append(key)
	var encoded_keys = row.input_number_hex.keys()
	numeric_keys.sort(); encoded_keys.sort()
	_check(numeric_keys == encoded_keys, row.label + ":every source Number encoded")
	for key in row.input_number_hex:
		var hex: String = row.input_number_hex[key]
		_check(hex.length() == 16, row.label + ":IEEE754 length")
		var bytes = PackedByteArray()
		for i in range(8): bytes.append(hex.substr(i * 2, 2).hex_to_int())
		var exact = bytes.decode_double(0)
		var round_trip = PackedByteArray(); round_trip.resize(8); round_trip.encode_double(0, exact)
		_check(round_trip.hex_encode() == hex and is_finite(exact), row.label + ":exact finite IEEE754 input")
		if float(input[key]) != exact: json_number_drifts += 1
		input[key] = exact
	return input


func _input(kind: String, lv: Variant = 1) -> Dictionary:
	return {"player_level":lv,"x":2820,"y":6420,"asleep":true} if kind == "worm" else {"player_level":lv,"tx":58,"ty":158,"tile_size":40,"element":2}


func _reject(result: Dictionary, reason: String) -> void:
	_compare(result, {"status":"NOT_READY","reason":reason,"writes":0}, reason)


func _invalid_inputs() -> void:
	for kind in ["", "ANGler", "other", null, true, 1, [], {}]:
		_reject(subject.catalog(kind), "unknown_kind")
		_reject(subject.build_initial(kind, {}), "unknown_kind")
	for input in [{}, null, [], {"hp":3500,"atk":62}, {"player_level":1}]:
		_reject(subject.build_initial("gate_guard", input), "requires_approved_mkEn_input")
	for kind in ["angler","worm","firedevil"]:
		for bad in [null, [], 1, true, "input"]:
			_reject(subject.build_initial(kind,bad), "input_not_dictionary")
		var keys = ["player_level","x","y"] if kind == "worm" else ["player_level","tx","ty","tile_size"]
		for key in keys:
			var input = _input(kind); input.erase(key)
			_reject(subject.build_initial(kind,input), "finite_number_required:" + key)
			for bad in [null, true, "1", [], {}, NAN, INF, -INF]:
				input = _input(kind); input[key] = bad
				_reject(subject.build_initial(kind,input), "finite_number_required:" + key)
		if kind == "worm":
			var input = _input(kind); input.erase("asleep")
			_reject(subject.build_initial(kind,input), "bool_required:asleep")
			for bad in [null, 0, 1, "true", [], {}]:
				input = _input(kind); input.asleep = bad
				_reject(subject.build_initial(kind,input), "bool_required:asleep")
		else:
			for bad in [0, -40, 20, 40.5]:
				var input = _input(kind); input.tile_size = bad
				_reject(subject.build_initial(kind,input), "source_tile_size_mismatch")
			if kind == "angler":
				var input = _input(kind); input.erase("element")
				_reject(subject.build_initial(kind,input), "unsupported_angler_element")
				for bad in [null,true,"2",[],{},NAN,INF,-INF,0,5,6,-1,2.5]:
					input = _input(kind); input.element = bad
					_reject(subject.build_initial(kind,input), "unsupported_angler_element")
				input = _input(kind); input.element = 2.0
				_check(subject.build_initial(kind,input).status == "READY", "JS Number element 2.0 admitted")


func _random_callback() -> float:
	random_callback_calls += 1
	return 0.5


func _purity_and_rng() -> void:
	seed(20261020)
	var first = randf(); var second = randf()
	seed(20261020)
	_check(randf() == first, "RNG fixture reset")
	for kind in ["angler","worm","firedevil"]:
		var input = _input(kind)
		input["opaque"] = {"sentinel":[1,2]}
		input["rand"] = Callable(self,"_random_callback")
		var before = input.duplicate(true)
		var first_result: Dictionary = subject.build_initial(kind,input)
		var original = first_result.value.duplicate(true)
		first_result.value.hp = -123
		first_result.source_ref.main = "changed"
		var next: Dictionary = subject.build_initial(kind,input)
		_compare(next.value,original,kind + ":fresh independent record")
		_compare(input,before,kind + ":opaque input remains owned by caller")
		_ready(next,kind)
		var cat: Dictionary = subject.catalog(kind)
		var original_catalog = cat.value.duplicate(true)
		cat.value.sites[0][0] = -999
		cat.value.sites.append([0,0])
		if kind == "angler": cat.value.region_indices[0] = -99
		_compare(subject.catalog(kind).value,original_catalog,kind + ":deep catalog copy")
	var guard: Dictionary = subject.catalog("gate_guard")
	guard.value.post_mkEn_writes[0].expression = "bad"
	_check(subject.catalog("gate_guard").value.post_mkEn_writes[0].expression == "~~(gg.mhp*4)", "guard nested catalog independent")
	_check(random_callback_calls == 0, "caller RNG never invoked")
	_check(randf() == second, "global RNG stream not consumed")
