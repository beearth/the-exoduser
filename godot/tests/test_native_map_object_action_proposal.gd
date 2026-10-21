extends SceneTree
const TRANSPORT = preload("res://tests/qa007/oracle_transport.gd")
const USERDIR := "EXODUSER-nw-03-Isolated-20261020"
const PRODUCER = preload("res://port_modules/map_object_action_proposal/producer.gd")
var _producer = PRODUCER.new()
var _checks := 0
var _failures := 0
var _oracle_cases := 0
var _contract_cases := 0


func _initialize() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR:
		printerr("NW03 wrong userdir: ", OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")


func _check(ok: bool, label: String) -> void:
	_checks += 1
	if not ok:
		_failures += 1
		printerr("ASSERT_FAIL ", label)


func _json(value: Variant) -> Variant:
	return JSON.parse_string(JSON.stringify(value))


func _exercise(label: String, p: Variant, objects: Variant, pressed: Variant, portal: Variant, deps: Variant, expected: Dictionary, after: Variant = null) -> void:
	var before := var_to_bytes([p, objects, deps])
	var entries: Array = objects.duplicate() if objects is Array else []
	var children := root.get_child_count()
	seed(20261020)
	var expected_random := randi()
	seed(20261020)
	var result: Dictionary = _producer.propose(p, objects, pressed, portal, deps)
	var next_random := randi()
	_check(_json(result) == _json(expected), label + " complete source-ordered result")
	_check(result.size() == 9 and result.has_all(["ready", "matched", "source_index", "type", "reason", "commands", "rng_consumed", "source", "break_scope"]), label + " exact nine-key envelope")
	_check(typeof(result.ready) == TYPE_BOOL and typeof(result.matched) == TYPE_BOOL and result.commands is Array and typeof(result.rng_consumed) == TYPE_INT, label + " native carriers")
	_check((typeof(result.source_index) == TYPE_INT and typeof(result.type) == TYPE_STRING and result.break_scope == "map_objs") if result.matched else (result.source_index == null and result.type == null and result.break_scope == null), label + " integer index/null and MAP loop break scope")
	_check((result.reason == null) if result.ready else (typeof(result.reason) == TYPE_STRING and not result.matched and result.commands.is_empty() and result.rng_consumed == 0), label + " no partial commands on NR")
	_check(var_to_bytes([p, objects, deps]) == before, label + " deep inputs unchanged")
	var same_entries := true
	if objects is Array:
		for i in entries.size():
			if not is_same(entries[i], objects[i]):
				same_entries = false
	_check(same_entries, label + " object references/order unchanged")
	_check(next_random == expected_random, label + " actual RNG untouched")
	_check(root.get_child_count() == children, label + " scene unchanged")
	var random_commands := 0
	for command in result.commands:
		if command.op == "random":
			random_commands += 1
	_check(random_commands == result.rng_consumed, label + " explicit RNG consumption matches command prefix")
	_check(_producer.propose(p, objects, pressed, portal, deps) == result, label + " repeated call stable")
	if after != null:
		_check(_json(_apply_fixture(p, objects, deps, result)) == _json(after), label + " fixture poststate equals unchanged source")
	result.commands.append({"op": "test mutation"})
	if result.commands.size() > 1:
		result.commands[0].op = "nested mutation"
	_check(_json(_producer.propose(p, objects, pressed, portal, deps)) == _json(expected) and var_to_bytes([p, objects, deps]) == before, label + " fresh nested result cannot mutate inputs or future output")


func _apply_fixture(p: Dictionary, objects: Array, deps: Variant, result: Dictionary) -> Dictionary:
	var state := {"player": p.duplicate(true), "objects": objects.duplicate(true), "mats": deps.get("mats") if deps is Dictionary else null}
	for command in result.commands:
		if command.op != "set":
			continue
		var path: String = command.path
		if path.begins_with("P."):
			state.player[path.trim_prefix("P.")] = command.value
		elif path.begins_with("mo."):
			state.objects[result.source_index][path.trim_prefix("mo.")] = command.value
		elif path == "G.mats":
			state.mats = command.value
	return state


func _p() -> Dictionary:
	return {"x": 0, "y": 0, "mhp": 10, "mst": 20, "mmp": 30, "mshield": 40}


func _mo(type: String) -> Dictionary:
	return {"type": type, "x": 0, "y": 0, "alive": true, "hp": 1, "loot": "none"}


func _nr(p: Variant, objects: Variant, deps: Variant, reason: String) -> void:
	_contract_cases += 1
	_exercise("NR #" + str(_contract_cases) + " " + reason, p, objects, true, false, deps,
		{"ready": false, "matched": false, "source_index": null, "type": null, "reason": reason,
		"commands": [], "rng_consumed": 0, "source": PRODUCER.SOURCE, "break_scope": null})


func _run() -> void:
	var source := ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)
	var oracle := ProjectSettings.globalize_path("res://../tools/nw03_map_action_oracle.cjs")
	_check(FileAccess.get_sha256(source) == PRODUCER.SOURCE_SHA256, "pinned latest-main game SHA")
	_check(FileAccess.file_exists(oracle), "tracked oracle available")
	var receipt := TRANSPORT.execute_file(TRANSPORT.node_binary(), oracle, source)
	var code: int = receipt.code
	var output: String = receipt.diagnostics
	_check(code == 0, "source oracle exit0 " + str(output).left(200))
	var data: Variant = receipt.data if code == 0 else null
	_check(data is Dictionary and data.get("cases") is Array, "oracle required; no skip")
	if not data is Dictionary or not data.get("cases") is Array:
		_finish()
		return
	_check(data.source_sha256 == PRODUCER.SOURCE_SHA256 and data.fragment_sha256 == PRODUCER.FRAGMENT_SHA256 and data.fragments.loop.sha256_text() == PRODUCER.FRAGMENT_SHA256, "actual source excerpt hash")
	_check(not data.real_game_booted and not data.real_storage_io and not data.dependency_body_in_proposal, "fixture-only dependency boundary")
	_check(data.hp_actual_source.return_value == true and data.hp_actual_source.mats_after - data.hp_actual_source.mats_before == 1, "actual HP addPotion source is mats+1, not inventory item")
	_oracle_cases = data.cases.size()
	_check(_oracle_cases == 141, "source scenario denominator141")
	for case in data.cases:
		_exercise(case.name, case.player, case.objects, case.pressed, case.portal, case.dependencies, case.expected, case.after)
	_nr(null, null, null, "query:objects_not_array")
	_nr(null, [], null, "query:player_xy_not_finite")
	_nr(_p(), [null], null, "query:entry_not_dictionary")
	for value in [null, true, "1", {}, [], NAN, INF, -INF]:
		var mo := _mo("breakable")
		mo.hp = value
		_nr(_p(), [mo], null, "hp_not_finite")
	for type in ["breakable", "altar"]:
		for value in [null, false, 42, "deps", []]:
			var mo := _mo(type)
			mo.loot = "mat"
			_nr(_p(), [mo], value, "random_sample_not_ready")
		for sample in [null, true, "0.5", {}, [], NAN, INF, -INF, -0.001, 1, 1.1]:
			var mo := _mo(type)
			mo.loot = "mat"
			_nr(_p(), [mo], {"random_sample": sample}, "random_sample_not_ready")
	for value in [null, true, "10", {}, [], NAN, INF, -INF]:
		var mo := _mo("breakable")
		mo.loot = "mat"
		_nr(_p(), [mo], {"random_sample": 0, "mats": value}, "mats_not_finite")
		mo.loot = "potion"
		_nr(_p(), [mo], {"add_potion_return": value} if not (typeof(value) == TYPE_BOOL and value == true) else null, "add_potion_return_not_ready")
	for value in [true, "0", {}, [], NAN, INF, -INF]:
		var p := _p()
		p._altAtk = value
		_nr(p, [_mo("altar")], {"random_sample": 0}, "selected_buff_not_finite")
	for key in ["mhp", "mst", "mmp", "mshield"]:
		for value in [null, true, "1", {}, [], NAN, INF, -INF]:
			var p := _p()
			p[key] = value
			_nr(p, [_mo("bonfire")], null, "maxima_not_finite")
	# No-hit paths leave malformed downstream dependency/player-extra values unread.
	var nohit := {"ready": true, "matched": false, "source_index": null, "type": null, "reason": null, "commands": [], "rng_consumed": 0, "source": PRODUCER.SOURCE, "break_scope": null}
	_exercise("inactive gate malformed", null, null, false, false, Vector2.INF, nohit)
	_exercise("portal used malformed", null, null, true, true, Vector2.INF, nohit)
	# A nonbreaking hit has no reward RNG/potion/mats dependency, including null loot.
	for loot in ["mat", "potion", null, 1, {}, []]:
		var mo := _mo("breakable")
		mo.hp = 2
		mo.loot = loot
		var result: Dictionary = _producer.propose(_p(), [mo], true, false, Vector2.INF)
		_check(result.ready and result.commands.size() == 3 and result.rng_consumed == 0 and result.commands[0].value == 1, "nonlethal hit ignores loot/dependencies " + str(loot))
	var prov: Dictionary = _producer.provenance()
	_check(prov == {"file": "game.html", "start_line": 32828, "end_line": 32853, "source_sha256": PRODUCER.SOURCE_SHA256, "fragment_sha256": PRODUCER.FRAGMENT_SHA256, "connected": false, "add_potion_body_included": false}, "disconnected exact provenance")
	prov.connected = true
	_check(not _producer.provenance().connected, "fresh provenance")
	var text := FileAccess.get_file_as_string("res://port_modules/map_object_action_proposal/producer.gd")
	for forbidden in ["FileAccess", "DirAccess", "OS.", "SceneTree", "Node.new", "randi(", "randf(", "seed(", "Input.", "signal "]:
		_check(not text.contains(forbidden), "no actual IO/scene/RNG/input dependency " + forbidden)
	_check(text.count("preload(") == 1 and text.contains("world_interaction_query/producer.gd"), "only NW01 readonly query dependency")
	_finish()


func _finish() -> void:
	print("NW03_RESULT ", JSON.stringify({"checks": _checks, "failures": _failures, "oracle_cases": _oracle_cases, "contract_cases": _contract_cases,
		"actual_storage_writes": 0, "main_booted": false, "source_data_not_installed": true, "userdir": OS.get_user_data_dir()}))
	quit(0 if _failures == 0 else 1)
