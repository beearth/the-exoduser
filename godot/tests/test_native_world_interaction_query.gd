extends SceneTree
const TRANSPORT = preload("res://tests/qa007/oracle_transport.gd")
## NW-01: source-backed readonly MAP_OBJS query. No Main/Player/World boot.
const USERDIR := "EXODUSER-nw-01-Isolated-20261020"
const QUERY = preload("res://port_modules/world_interaction_query/producer.gd")
const EXPECTED_SOURCE := "game.html:32829–32853"
const SOURCE_SHA := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const FRAGMENT_SHA := "9eea8397b33211a9a7b4ba18372d4fb60a5ab6cffa497687254d47b66d6c265f"
var _query = QUERY.new()
var _checks := 0
var _failures := 0
var _group := "setup"
var _groups: Array = []
var _oracle_cases := 0
var _contract_cases := 0


func _initialize() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR:
		printerr("NW01 wrong userdir: ", OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")


func _check(ok: bool, label: String) -> void:
	_checks += 1
	if not ok:
		_failures += 1
		printerr("ASSERT_FAIL [", _group, "] ", label)


func _start(name: String) -> void:
	_group = name
	_groups.append({"group": name, "checks_before": _checks, "failures_before": _failures})


func _end() -> void:
	var row: Dictionary = _groups[-1]
	row["checks"] = _checks - row.checks_before
	row["failures"] = _failures - row.failures_before
	row.erase("checks_before")
	row.erase("failures_before")


func _exercise(label: String, player: Variant, objects: Variant, pressed: Variant, portal: Variant, expected: Dictionary) -> void:
	var player_before: Variant = player.duplicate(true) if player is Dictionary else player
	var objects_before: Variant = objects.duplicate(true) if objects is Array else objects
	var entries: Array = objects.duplicate() if objects is Array else []
	var children_before: int = root.get_child_count()
	seed(20261020)
	var expected_random: int = randi()
	seed(20261020)
	var result: Dictionary = _query.query_map_object(player, objects, pressed, portal)
	var next_random: int = randi()
	_check(result == expected, label + " exact source/contract result")
	_check(result.size() == 6 and result.has_all(["ready", "matched", "source_index", "type", "reason", "source"]), label + " exact six keys")
	_check(typeof(result.ready) == TYPE_BOOL and typeof(result.matched) == TYPE_BOOL and typeof(result.source) == TYPE_STRING, label + " flag/source types")
	_check((typeof(result.source_index) == TYPE_INT and typeof(result.type) == TYPE_STRING) if result.matched else (result.source_index == null and result.type == null), label + " index/type carriers")
	_check(result.reason == null if result.ready else typeof(result.reason) == TYPE_STRING, label + " reason carrier")
	_check(var_to_bytes(player) == var_to_bytes(player_before) and var_to_bytes(objects) == var_to_bytes(objects_before), label + " input deep snapshot unchanged")
	var same_entries := true
	if objects is Array:
		for i in entries.size():
			if not is_same(entries[i], objects[i]):
				same_entries = false
	_check(same_entries, label + " entry references/order unchanged")
	_check(next_random == expected_random, label + " global RNG untouched")
	_check(root.get_child_count() == children_before, label + " no scene children created")
	var repeated: Dictionary = _query.query_map_object(player, objects, pressed, portal)
	_check(repeated == result, label + " repeat query stable")
	result["source"] = "test mutation"
	_check(_query.query_map_object(player, objects, pressed, portal) == expected, label + " fresh output ownership")


func _nr(label: String, player: Variant, objects: Variant, pressed: Variant, portal: Variant, reason: String) -> void:
	_contract_cases += 1
	_exercise(label, player, objects, pressed, portal, {"ready": false, "matched": false,
		"source_index": null, "type": null, "reason": reason, "source": EXPECTED_SOURCE})


func _normal(label: String, player: Variant, objects: Variant, pressed: Variant, portal: Variant, index: Variant = null, kind: Variant = null) -> void:
	_contract_cases += 1
	_exercise(label, player, objects, pressed, portal, {"ready": true, "matched": index != null,
		"source_index": index, "type": kind, "reason": null, "source": EXPECTED_SOURCE})


func _run() -> void:
	_start("source_oracle")
	var node_binary := TRANSPORT.node_binary()
	var source_path := ProjectSettings.globalize_path("res://../game.html")
	var oracle_path := ProjectSettings.globalize_path("res://../tools/nw01_world_interaction_oracle.cjs")
	_check(FileAccess.get_sha256(source_path) == SOURCE_SHA, "current source hash")
	_check(FileAccess.file_exists(oracle_path), "tracked oracle exists")
	var receipt := TRANSPORT.execute_file(node_binary, oracle_path, source_path)
	var code: int = receipt.code
	var output: String = receipt.diagnostics
	_check(code == 0, "source oracle exit0; output=" + str(output).left(300))
	var data: Variant = receipt.data if code == 0 else null
	_check(data is Dictionary and data.get("cases") is Array, "oracle JSON/cases available; no skip")
	if not data is Dictionary or not data.get("cases") is Array:
		_end()
		_finish()
		return
	_check(data.source.source_sha256 == SOURCE_SHA and data.source.fragment_sha256 == FRAGMENT_SHA, "oracle provenance")
	_check(data.real_storage_io == false and data.real_game_booted == false, "oracle memory scope")
	_check(data.fragments.loop.sha256_text() == FRAGMENT_SHA, "actual unchanged loop hash")
	_oracle_cases = data.cases.size()
	_check(_oracle_cases == 104, "source scenario denominator 104")
	for entry in data.cases:
		var expected: Dictionary = entry.expected.duplicate(true)
		var wire_index: Variant = expected.source_index
		var valid_index: bool = wire_index == null
		if typeof(wire_index) == TYPE_FLOAT or typeof(wire_index) == TYPE_INT:
			valid_index = is_finite(float(wire_index)) and float(wire_index) == floor(float(wire_index)) and float(wire_index) >= 0 and entry.objects is Array and float(wire_index) < entry.objects.size()
		_check(valid_index and expected.matched == (wire_index != null), entry.name + " JSON Number index is integral/in range or null")
		if wire_index != null and valid_index:
			expected["source_index"] = int(wire_index)
		_exercise(entry.name, entry.player, entry.objects, entry.pressed, entry.portal, expected)
	_end()
	_start("domain_and_short_circuit")
	var p := {"x": 0, "y": 0}
	var hit := {"type": "lore", "x": 0, "y": 0}
	for gate in [null, 0, 1, "true", {}, [], &"true"]:
		_nr("bad pressed " + str(gate), null, null, gate, true, "gate_type")
		_nr("bad portal " + str(gate), null, null, false, gate, "gate_type")
	_normal("inactive invalid everything", null, 1, false, false)
	_normal("portal invalid everything", Vector2.INF, null, true, true)
	_nr("array check before player", null, null, true, false, "objects_not_array")
	for player in [null, {}, {"x": 0}, {"x": "0", "y": 0}, {"x": true, "y": 0}, {"x": NAN, "y": 0}, {"x": 0, "y": INF}, {"x": -INF, "y": 0}, Vector2.ZERO]:
		_nr("bad player " + str(player), player, [], true, false, "player_xy_not_finite")
	for entry in [null, 0, true, "lore", [], Vector2.ZERO]:
		_nr("bad entry " + str(entry), p, [entry], true, false, "entry_not_dictionary")
	for kind in [null, 1, true, {}, [], &"lore"]:
		_nr("bad type " + str(kind), p, [{"type": kind}], true, false, "entry_type_not_string")
	_nr("missing type", p, [{}], true, false, "entry_type_not_string")
	for type in ["bonfire", "lore", "breakable", "altar"]:
		for bad_xy in [{}, {"x": 0}, {"x": false, "y": 0}, {"x": "1", "y": 0}, {"x": NAN, "y": 0}, {"x": 0, "y": INF}]:
			var entry: Dictionary = bad_xy.duplicate()
			entry["type"] = type
			entry["alive"] = true
			_nr(type + " malformed coordinate " + str(bad_xy), p, [entry], true, false, "entry_xy_not_finite")
	for pair in [["lore", "read"], ["altar", "used"], ["breakable", "alive"]]:
		for flag in [0, 1, "false", {}, [], &"true", NAN]:
			var entry := {"type": pair[0], "x": 999, "y": 0}
			entry[pair[1]] = flag
			_nr(str(pair) + " bad flag before distance " + str(flag), p, [entry], true, false, "flag_unsupported")
	for inactive in [{"type": "lore", "read": true}, {"type": "altar", "used": true}, {"type": "breakable", "alive": false}, {"type": "breakable", "alive": null}, {"type": "breakable"}]:
		_normal("skip inactive malformed xy", p, [inactive, hit], true, false, 1, "lore")
	_normal("ignore unrelated flag", p, [{"type": "lore", "x": 0, "y": 0, "alive": "invalid", "used": {}}], true, false, 0, "lore")
	_normal("first hit ignores later NR", p, [hit, 0, {"type": "lore", "read": "invalid"}], true, false, 0, "lore")
	_nr("NR before hit", p, [null, hit], true, false, "entry_not_dictionary")
	_normal("unknown skips invalid flag/xy", p, [{"type": "unknown", "read": "invalid", "x": NAN}, hit], true, false, 1, "lore")
	_normal("int64 subtraction converts first", {"x": -9223372036854775807, "y": 0}, [{"type": "bonfire", "x": 9223372036854775807, "y": 0}], true, false)
	_end()
	_start("provenance_and_scope")
	var prov: Dictionary = _query.provenance()
	_check(prov == {"file": "game.html", "start_line": 32828, "end_line": 32853,
		"source_sha256": SOURCE_SHA, "fragment_sha256": FRAGMENT_SHA, "connected": false}, "exact disconnected provenance")
	prov["connected"] = true
	_check(_query.provenance().connected == false, "provenance returns fresh dictionary")
	var producer_text := FileAccess.get_file_as_string("res://port_modules/world_interaction_query/producer.gd")
	for forbidden in ["FileAccess", "DirAccess", "OS.", "SceneTree", "Node.new", "load(", "preload(", "randi(", "randf(", "seed(", "Input.", "signal "]:
		_check(not producer_text.contains(forbidden), "no runtime IO/scene/RNG/input dependency " + forbidden)
	_end()
	_finish()


func _finish() -> void:
	print("NW01_RESULT ", JSON.stringify({"checks": _checks, "failures": _failures, "groups": _groups,
		"oracle_cases": _oracle_cases, "contract_cases": _contract_cases, "source_data_not_installed": true,
		"main_booted": false, "actual_storage_writes": 0, "userdir": OS.get_user_data_dir()}))
	quit(0 if _failures == 0 else 1)
