extends SceneTree
const TRANSPORT = preload("res://tests/qa007/oracle_transport.gd")
## NW-02: unchanged JS oracle, explicit native domain, disconnected command proposals.
const USERDIR := "EXODUSER-nw-02-Isolated-20261020"
const PRODUCER = preload("res://port_modules/player_portal_proposal/producer.gd")
const SHA := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
var _producer = PRODUCER.new()
var _checks := 0
var _failures := 0
var _oracle_cases := 0
var _contract_cases := 0


func _initialize() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR:
		printerr("NW02 wrong userdir: ", OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")


func _check(ok: bool, label: String) -> void:
	_checks += 1
	if not ok:
		_failures += 1
		printerr("ASSERT_FAIL ", label)


func _call(action: Variant, snapshot: Variant, zone: Variant = null) -> Dictionary:
	if action == "place":
		return _producer.propose_place(snapshot)
	if action == "use":
		return _producer.propose_use(snapshot)
	return _producer.propose_reset(action, zone)


func _json(value: Variant) -> Variant:
	# JSON Numbers have no int/float carrier distinction; preserve native bool/null/string.
	return JSON.parse_string(JSON.stringify(value))


func _exercise(label: String, action: String, snapshot: Variant, zone: Variant, expected: Dictionary, after: Variant = null) -> void:
	var before: PackedByteArray = var_to_bytes(snapshot)
	var children := root.get_child_count()
	seed(20261020)
	var random_expected := randi()
	seed(20261020)
	var result: Dictionary = _call(action, snapshot, zone)
	var random_after := randi()
	_check(_json(result) == _json(expected), label + " exact ordered source commands and return")
	_check(result.size() == 5 and result.has_all(["ready", "reason", "source", "source_return", "commands"]), label + " exact five-key result")
	_check(typeof(result.ready) == TYPE_BOOL and result.commands is Array, label + " native carriers")
	_check((result.reason == null and (typeof(result.source_return) == TYPE_BOOL or result.source_return == "undefined")) if result.ready else (typeof(result.reason) == TYPE_STRING and result.source_return == null and result.commands.is_empty()), label + " undefined/bool/NR distinction")
	_check(var_to_bytes(snapshot) == before, label + " input snapshot and nested identity unchanged")
	_check(random_after == random_expected, label + " RNG unchanged")
	_check(root.get_child_count() == children, label + " scene unchanged")
	_check(_call(action, snapshot, zone) == result, label + " stable repeated call")
	if after != null:
		_check(_json(_apply_fixture(snapshot, result.commands)) == _json(after), label + " applying proposal only to fixture equals source poststate")
	result.commands.append({"op": "test mutation"})
	if result.commands.size() > 1:
		result.commands[0]["op"] = "nested mutation"
	result["source"] = "mutation"
	_check(_json(_call(action, snapshot, zone)) == _json(expected), label + " fresh independent nested output")
	_check(var_to_bytes(snapshot) == before, label + " output mutations cannot alter input")


func _apply_fixture(snapshot: Dictionary, commands: Array) -> Dictionary:
	var s: Dictionary = snapshot.duplicate(true)
	for command in commands:
		if command.op == "append":
			s.pair.append(command.value.duplicate(true))
		elif command.op == "set":
			match command.path:
				"G._playerPortalPair": s.pair = command.value.duplicate(true) if command.value is Array else command.value
				"P.x": s.player.x = command.value
				"P.y": s.player.y = command.value
				"P.vx": s.player.vx = command.value
				"P.vy": s.player.vy = command.value
				"G.cam.x": s.cam.x = command.value
				"G.cam.y": s.cam.y = command.value
	return {"pair": s.pair, "player": s.player, "cam": s.cam}


func _nr(action: String, snapshot: Variant, reason: String, zone: Variant = null) -> void:
	_contract_cases += 1
	var source: Variant = {"place": PRODUCER.PLACE, "use": PRODUCER.USE, "load_zone": PRODUCER.ZONE}.get(action)
	_exercise(action + " NR " + reason + " #" + str(_contract_cases), action, snapshot, zone,
		{"ready": false, "reason": reason, "source": source, "source_return": null, "commands": []})


func _noop(action: String, snapshot: Variant, zone: Variant = null) -> void:
	_contract_cases += 1
	_exercise(action + " short circuit #" + str(_contract_cases), action, snapshot, zone,
		{"ready": true, "reason": null, "source": PRODUCER.PLACE if action == "place" else PRODUCER.USE,
		"source_return": "undefined" if action == "place" else false, "commands": []})


func _base() -> Dictionary:
	return {"on": true, "map_present": true, "player": {"x": 0, "y": 0}, "pair": null, "cam": null}


func _run() -> void:
	var source := ProjectSettings.globalize_path("res://../game.html")
	var oracle := ProjectSettings.globalize_path("res://../tools/nw02_player_portal_oracle.cjs")
	_check(FileAccess.get_sha256(source) == SHA, "latest pinned main source SHA")
	_check(FileAccess.file_exists(oracle), "tracked oracle exists")
	var receipt := TRANSPORT.execute_file(TRANSPORT.node_binary(), oracle, source)
	var code: int = receipt.code
	var output: String = receipt.diagnostics
	_check(code == 0, "unchanged source oracle exit0 " + str(output).left(200))
	var data: Variant = receipt.data if code == 0 else null
	_check(data is Dictionary and data.get("cases") is Array, "oracle mandatory; never skip")
	if not data is Dictionary or not data.get("cases") is Array:
		_finish()
		return
	_check(data.source_sha256 == SHA and not data.real_storage_io and not data.real_game_booted, "source and memory-only scope")
	for key in data.hashes:
		_check(data.fragments[key].sha256_text() == data.hashes[key], "unchanged excerpt hash " + key)
	_oracle_cases = data.cases.size()
	_check(_oracle_cases == 68, "source scenario denominator 68")
	for case in data.cases:
		_exercise(case.name, case.action, case.snapshot, case.get("zone_available"), case.expected, case.after)
	for action in ["place", "use"]:
		for value in [null, 42, true, "value", [], Vector2.ZERO]:
			_nr(action, value, "snapshot_not_dictionary")
	for value in [null, 0, 1, "true", {}, [], &"true"]:
		var s := _base()
		s.on = value
		_nr("place", s, "on_not_bool")
		s = _base()
		s.map_present = value
		_nr("place", s, "map_present_not_bool")
		_nr("load_zone", null, "zone_available_not_bool", value)
	for value in [null, 0, true, "unknown", &"init_stage", {}, []]:
		_nr(str(value) if typeof(value) == TYPE_STRING else "unknown", null, "reset_context_unsupported")
		# Direct Variant context must reject coercion too.
		_check(not _producer.propose_reset(value).ready, "reset actual Variant rejected " + str(value))
	for value in [false, 42, [], Vector2.ZERO]:
		var s := _base()
		s.player = value
		_nr("place", s, "player_not_dictionary")
	for value in [1, false, {}, [], &"dead"]:
		var s := _base()
		s.player.s = value
		_nr("place", s, "player_state_unsupported")
	for value in [{}, {"x": 0}, {"x": "0", "y": 0}, {"x": true, "y": 0}, {"x": NAN, "y": 0}, {"x": 0, "y": INF}, {"x": -INF, "y": 0}]:
		var s := _base()
		s.player = value
		_nr("place", s, "player_xy_not_finite")
		s.pair = [{"x": 0, "y": 0}, {"x": 300, "y": 0}]
		_nr("use", s, "player_xy_not_finite")
	for value in [false, 1, "pair", {}, Vector2.ZERO]:
		var s := _base()
		s.pair = value
		_nr("place", s, "pair_not_array_or_null")
		_nr("use", s, "pair_not_array_or_null")
	var s := _base()
	s.pair = []
	_nr("place", s, "empty_pair_unsupported")
	for value in [null, {}, {"x": 0}, {"x": "0", "y": 0}, {"x": NAN, "y": 0}, {"x": 0, "y": INF}]:
		s = _base()
		s.pair = [value]
		_nr("place", s, "pair_xy_not_finite")
		s.pair = [value, {"x": 300, "y": 0}]
		_nr("use", s, "pair_xy_not_finite")
		s.pair = [{"x": 0, "y": 0}, value]
		_nr("use", s, "target_xy_not_finite")
	for value in [true, 0, 1, "cam", [], Vector2.ZERO]:
		s = _base()
		s.pair = [{"x": 0, "y": 0}, {"x": 300, "y": 0}]
		s.cam = value
		_nr("use", s, "cam_unsupported")
	_noop("place", {"on": false, "map_present": 42, "player": Vector2.INF, "pair": 42})
	_noop("place", {"on": true, "map_present": false, "player": Vector2.INF, "pair": 42})
	for state in ["dead", "fallen"]:
		_noop("place", {"on": true, "map_present": true, "player": {"s": state}, "pair": 42})
	for pair in [null, [], [null], [null, null, null]]:
		_noop("use", {"pair": pair, "player": Vector2.INF, "cam": true})
	s = _base()
	s.pair = [{"x": 200, "y": 0}, {"x": 400, "y": 0}]
	s.cam = true
	_noop("use", s)
	_check(_producer.propose_reset("init_stage", Vector2.INF).ready, "stage reset ignores zone flag")
	var prov: Dictionary = _producer.provenance()
	_check(prov == {"file": "game.html", "source_sha256": SHA, "portal_sha256": "4eae4f08342dd95a93c73982f266bec0cf7eb4a54237d4574190aa9d9a1ddfef", "portal_lines": [18309, 18322], "reset_lines": [[30160, 30161], [31534, 31535]], "connected": false}, "exact disconnected provenance")
	prov.reset_lines[0][0] = -1
	_check(_producer.provenance().reset_lines[0][0] == 30160, "fresh nested provenance")
	var text := FileAccess.get_file_as_string("res://port_modules/player_portal_proposal/producer.gd")
	for forbidden in ["FileAccess", "DirAccess", "OS.", "SceneTree", "Node.new", "load(", "preload(", "randi(", "randf(", "seed(", "Input.", "signal "]:
		_check(not text.contains(forbidden), "no runtime dependency " + forbidden)
	_finish()


func _finish() -> void:
	print("NW02_RESULT ", JSON.stringify({"checks": _checks, "failures": _failures, "oracle_cases": _oracle_cases,
		"contract_cases": _contract_cases, "main_booted": false, "source_data_not_installed": true,
		"actual_storage_writes": 0, "userdir": OS.get_user_data_dir()}))
	quit(0 if _failures == 0 else 1)
