extends SceneTree
const TRANSPORT = preload("res://tests/qa007/oracle_transport.gd")
## Exact source branch oracles with exclusively caller-owned in-memory fixtures.
const READER = preload("res://port_modules/save_adapter/source_slot_reader.gd")
const USERDIR := "EXODUSER-sv-transport-read-Isolated-20261020"
var checks := 0
var failures := 0
var group := "setup"
var groups: Array = []
var completed: Dictionary = {}
var probe: Dictionary = {}
var node_bin := TRANSPORT.node_binary()
var artifacts := ""

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--artifacts-dir="): artifacts = arg.trim_prefix("--artifacts-dir=")
		if arg.begins_with("--node-bin="): node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("SV_TRANSPORT_READ_FAIL ", group, " ", label)

func compare(a: Variant, b: Variant, label: String) -> void:
	var numeric: bool = (a is int or a is float) and (b is int or b is float)
	check(numeric or typeof(a) == typeof(b), label + " type")
	if not numeric and typeof(a) != typeof(b): return
	if a is Dictionary:
		var ak: Array = a.keys(); var bk: Array = b.keys()
		ak.sort(); bk.sort()
		check(ak == bk, label + " keys")
		for key in bk:
			if a.has(key): compare(a[key], b[key], label + "." + str(key))
	elif a is Array:
		check(a.size() == b.size(), label + " length")
		for i in mini(a.size(), b.size()): compare(a[i], b[i], label + "." + str(i))
	else: check(a == b, label + " value")

func safe(receipt: Dictionary) -> void:
	check(receipt.fixture_only and not receipt.storage_io and not receipt.network and not receipt.write_authorized and not receipt.restore_connected, "no actual IO/restore/writer authority")

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR or not OS.get_user_data_dir().contains(USERDIR):
		printerr("SV_TRANSPORT_READ_INVALID_ISOLATION")
		quit(2)
		return
	if artifacts.is_empty():
		printerr("SV_TRANSPORT_READ_NEEDS_OWN_ARTIFACT_DIRECTORY")
		quit(2)
		return
	var output: Array = []
	var status := OS.execute(node_bin, [ProjectSettings.globalize_path("res://../tools/sv_transport_read_oracle.cjs"), ProjectSettings.globalize_path("res://..")], output, true)
	check(status == 0 and not output.is_empty(), "source-only Node oracle executed")
	var decoded: Variant = TRANSPORT.decode_output(output)
	check(decoded is Dictionary, "source oracle JSON")
	if not decoded is Dictionary or status != 0: quit(2); return
	probe = decoded
	check(probe.source_unchanged and probe.actual_server_calls == 0 and probe.actual_save_writes == 0 and probe.actual_restore_calls == 0, "no server/save/restore execution; source bytes unchanged")
	DirAccess.make_dir_recursive_absolute(artifacts)
	var file := FileAccess.open(artifacts.path_join("source-oracle.json"), FileAccess.WRITE)
	check(file != null, "only QA log output opens")
	if file != null: file.store_string(JSON.stringify(probe)); file.close()
	for name in ["server_slot_projection", "strict_json_boundaries", "lobby_response_read", "load_read_admission", "unknown_scope_and_unsupported"]:
		group = name
		var before := checks
		var failed_before := failures
		call("_test_" + name)
		check(completed.get(name, false), "group reached completion sentinel")
		groups.append({"group": name, "checks": checks - before, "failures": failures - failed_before})
	print("SV_TRANSPORT_READ_RESULT " + JSON.stringify({"checks": checks, "failures": failures, "groups": groups,
		"server_cases": probe.server.size(), "json_cases": probe.jsonCases.size(), "lobby_cases": probe.lobby.size() * 2,
		"load_cases": probe.load.size() * 2, "fixture_only": true, "actual_server_calls": 0, "actual_save_writes": 0,
		"full_save_verified": false, "provenance": probe.provenance, "source_hashes": probe.source_hashes, "userdir": OS.get_user_data_dir()}))
	quit(0 if failures == 0 else 1)

func _test_server_slot_projection() -> void:
	for row in probe.server:
		var before: Array = row.files.duplicate(true)
		var result: Dictionary = READER.project_slot_files(row.target, row.files)
		check(result.status == "READY", row.id + " projection ready")
		safe(result)
		if result.has("payload"):
			compare(result.payload, row.expected, row.id)
			check(result.payload.keys() == row.expected.keys(), row.id + " root order")
			for i in mini(result.payload.slots.size(), row.expected.slots.size()): check(result.payload.slots[i].keys() == row.expected.slots[i].keys(), row.id + " row order")
		compare(row.files, before, row.id + "/unchanged")
		check(row.unchanged, "original route fixture unchanged")
	completed[group] = true

func _test_strict_json_boundaries() -> void:
	for row in probe.jsonCases:
		var result: Dictionary = READER.parse_fixture_json(row.raw)
		check(result.status == ("READY" if row.ok else "PARSE_ERROR"), "JSON.parse strict grammar: " + row.raw)
		if row.ok and result.has("value"): compare(result.value, row.expected, "parsed JSON")
	var surrogate: Dictionary = READER.parse_fixture_json('"\\uD800"')
	check(surrogate.status == "HOLD" and surrogate.reason == "lone_surrogate_unproven", "valid JS lone surrogate is unproven, not corrupted")
	var deep: Dictionary = READER.parse_fixture_json("[".repeat(130) + "0" + "]".repeat(130))
	check(deep.status == "HOLD" and deep.reason == "json_depth_unproven", "deep valid input held without invented absence")
	completed[group] = true

func _test_lobby_response_read() -> void:
	for row in probe.lobby:
		for target in READER.TARGETS:
			var before: Array = row.fallback.duplicate(true)
			var result: Dictionary = READER.consume_list_response(target, row.response, row.lobby, row.fallback)
			safe(result)
			if row.stale:
				check(result.status == "STALE" and not result.apply and not result.has("slots") and row.renders == 0, "late callback cannot replace current slots")
			elif not row.expected.slots is Array:
				check(result.status == "HOLD" and result.reason == "non_array_slots", "unproven list carrier cannot be installed")
				if result.has("original_slots"): compare(result.original_slots, row.expected.slots, "malformed slots retained")
			else:
				check(result.status == "READY" and result.apply, "source lobby read decision")
				if result.has("slots"):
					compare(result.slots, row.expected.slots, "source lobby slots")
					check(result.development == row.expected.development, "strict development marker/test/build gate")
			compare(row.fallback, before, "fallback not written or migrated")
	completed[group] = true

func _test_load_read_admission() -> void:
	for row in probe.load:
		for target in READER.TARGETS:
			var before: Dictionary = row.response.duplicate(true)
			var result: Dictionary = READER.consume_load_response(target, row.response)
			safe(result)
			if row.has("expected_status"): check(result.status == row.expected_status, "HTTP/parse/error differentiation")
			elif not row.found: check(result.status == "REJECTED", "source j.ok && j.data rejects falsy data")
			else:
				check(result.status == "READY" and result.source_found_save and not result.full_save_verified, "admission is not full-save or restore proof")
				if result.has("payload"):
					compare(result.payload, row.payload, "load payload not normalized")
					if row.payload is Dictionary and not row.payload.has("player"): check(result.kind == "metadata", "fresh metadata distinguished")
					if row.payload is Dictionary and row.payload.get("player") is Dictionary: check(result.kind == "player_payload_candidate", "even empty player is only a candidate")
			compare(row.response, before, "response fixture unchanged")
	completed[group] = true

func _test_unknown_scope_and_unsupported() -> void:
	var receipt: Dictionary = READER.project_slot_files("unselected", [])
	check(receipt.status == "HOLD", "no implicit namespace authority"); safe(receipt)
	check(READER.consume_load_response("dev_server", {}).status == "HOLD", "unknown HTTP status not fabricated")
	check(READER.project_slot_files("dev_server", [{"name":"a.json","raw":'"\\uD800"'}]).status == "HOLD", "unproven valid string never silently excluded")
	check(READER.project_slot_files("dev_server", [{"name":"a.json"}]).status == "HOLD", "missing raw authority held")
	var lobby := {"request": 1, "current_request": 1, "build": "full", "test_mode": true}
	check(READER.consume_list_response("dev_server", {"status":404}, lobby, []).status == "HOLD", "five slot snapshot is required for fallback")
	check(READER.consume_list_response("dev_server", {"status":200,"body":"{}"}, {}, []).status == "HOLD", "missing lobby context held")
	var first: Dictionary = READER.consume_load_response("nw_native", {"status":200,"body":'{"ok":true,"data":{"player":{},"inv":{"bag":[{"opaque":3}]}}}'})
	if first.has("payload"):
		first.payload.inv.bag[0].opaque = 9
		var second: Dictionary = READER.consume_load_response("nw_native", {"status":200,"body":'{"ok":true,"data":{"player":{},"inv":{"bag":[{"opaque":3}]}}}'})
		check(second.payload.inv.bag[0].opaque == 3, "return values detached across reads")
	var invalid_lobby: Dictionary = lobby.duplicate()
	invalid_lobby.request = null
	check(READER.consume_list_response("dev_server", {"status":200,"body":"{}"}, invalid_lobby, []).status == "HOLD", "unknown request authority held")
	check(READER.consume_list_response("dev_server", {"status":404}, lobby, [false,null,null,null,null]).status == "HOLD", "non-storage carrier held without script abort")
	completed[group] = true
