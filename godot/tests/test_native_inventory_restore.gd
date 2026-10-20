extends SceneTree
const TRANSPORT = preload("res://tests/qa007/oracle_transport.gd")
const RESTORE = preload("res://port_modules/save_adapter/source_inventory_restore.gd")
const USERDIR := "EXODUSER-sv-restore-items-Isolated-20261020"
var checks := 0
var failures := 0
var artifacts := ""
var node_bin := TRANSPORT.node_binary()
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--artifacts-dir="): artifacts = arg.trim_prefix("--artifacts-dir=")
		if arg.begins_with("--node-bin=" ): node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("SV_RESTORE_ITEMS_FAIL ", label)
func wire(value: Variant) -> Variant:
	if value is float and not is_finite(value): return {"@number": "NaN" if is_nan(value) else ("Infinity" if value > 0 else "-Infinity")}
	if (value is float or value is int) and (float(value) != floor(float(value)) or absf(float(value)) >= 1e12):
		return {"@f64": PackedFloat64Array([float(value)]).to_byte_array().hex_encode()}
	if value is Dictionary:
		var result := {}
		for key in value: result[key] = wire(value[key])
		return result
	if value is Array:
		var result := []
		for item in value: result.append(wire(item))
		return result
	return value
func unwire(value: Variant) -> Variant:
	if value is Dictionary:
		if value.size() == 1 and value.has("@f64"): return str(value["@f64"]).hex_decode().to_float64_array()[0]
		var result := {}
		for key in value: result[key] = unwire(value[key])
		return result
	if value is Array:
		var result := []
		for item in value: result.append(unwire(item))
		return result
	return value
func compare(a: Variant, b: Variant, label: String) -> void:
	var numeric: bool = (a is int or a is float) and (b is int or b is float)
	check(numeric or typeof(a) == typeof(b), label + " type")
	if not numeric and typeof(a) != typeof(b): return
	if a is Dictionary:
		var ak: Array = a.keys(); var bk: Array = b.keys()
		ak.sort(); bk.sort(); check(ak == bk, label + " keys")
		for key in bk:
			if a.has(key): compare(a[key], b[key], label + "." + str(key))
	elif a is Array:
		check(a.size() == b.size(), label + " length")
		for i in mini(a.size(), b.size()): compare(a[i], b[i], label + "." + str(i))
	else:
		check(a == b, label + " value")
		if a != b: printerr("SV_RESTORE_ITEMS_VALUE ", label, " actual=", a, " expected=", b)
func identities(value: Variant) -> Array:
	var aliases := []
	_visit(value, "", [], [], aliases)
	return aliases
func _visit(value: Variant, path: String, seen: Array, paths: Array, aliases: Array) -> void:
	if not value is Dictionary and not value is Array: return
	for i in seen.size():
		if is_same(seen[i], value): aliases.append([path, paths[i]]); return
	seen.append(value); paths.append(path)
	if value is Array:
		for i in value.size(): _visit(value[i], path + "/" + str(i), seen, paths, aliases)
	else:
		var keys: Array = value.keys(); keys.sort()
		for key in keys: _visit(value[key], path + "/" + key, seen, paths, aliases)
func at(value: Variant, path: Array) -> Variant:
	for key in path: value = value[int(key)] if value is Array else value[key]
	return value
func safe(receipt: Dictionary) -> void:
	check(receipt.calculation_only and not receipt.write_authorized and not receipt.restore_connected and not receipt.storage_io and not receipt.network and not receipt.full_restore_verified, "calculation only; no live/storage/format claim")
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR or not OS.get_user_data_dir().contains(USERDIR):
		printerr("SV_RESTORE_ITEMS_INVALID_ISOLATION"); quit(2); return
	if artifacts.is_empty(): printerr("SV_RESTORE_ITEMS_NEEDS_ARTIFACT_DIRECTORY"); quit(2); return
	var oracle_receipt := TRANSPORT.execute_file(node_bin, ProjectSettings.globalize_path("res://../tools/sv_restore_items_oracle.cjs"), ProjectSettings.globalize_path("res://.."))
	var status: int = oracle_receipt.code
	check(status == 0, "exact source oracle ran")
	var probe: Variant = oracle_receipt.data
	if not probe is Dictionary or status != 0: printerr(oracle_receipt.diagnostics); quit(2); return
	check(probe.source_unchanged and probe.actual_storage_reads == 0 and probe.actual_save_writes == 0 and probe.actual_server_calls == 0 and probe.live_restore_calls == 0, "no actual save/storage/server/live actor")
	var tables: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/item_generation_tables.json"))
	check(tables is Dictionary, "existing readonly source tables loaded")
	if not tables is Dictionary: quit(2); return
	for key in ["SLOT_NAMES", "SLOT_EMOJI", "RARITY_MUL", "WTYPES", "BOWTYPES", "_WP_MOD"]:
		compare(wire(tables[key]), probe.source_tables[key], "existing table vs exact main source/" + key)
	compare(RESTORE.LEGACY_IDS, probe.source_tables._CR_LEGACY_IDS, "18 legacy IDs exact source")
	compare(RESTORE.POTION_KEYS, probe.source_tables.POT.keys(), "POT known keys exact source")
	DirAccess.make_dir_recursive_absolute(artifacts)
	var file := FileAccess.open(artifacts.path_join("source-oracle.json"), FileAccess.WRITE)
	check(file != null, "QA output opens")
	if file != null: file.store_string(JSON.stringify(probe)); file.close()
	var calculator := RESTORE.new()
	for row in probe.rows:
		var graph := {"payload": unwire(row.payload), "current": unwire(row.current)}
		for link in row.links:
			var parent: Variant = at(graph, link.target.slice(0, -1))
			var key: Variant = link.target[-1]
			parent[int(key) if parent is Array else key] = at(graph, link.source)
		# JSON carries values, not shared references. Restore every source fixture
		# alias, including prefix/suffix values and opaque uniqueArt objects.
		for pair in row.input_identities:
			var target: Array = str(pair[0]).trim_prefix("/").split("/")
			var origin: Array = str(pair[1]).trim_prefix("/").split("/")
			var parent: Variant = at(graph, target.slice(0, -1))
			parent[int(target[-1]) if parent is Array else target[-1]] = at(graph, origin)
		var before := JSON.stringify(wire(graph))
		compare(identities(graph), row.input_identities, row.id + "/fixture identity")
		var receipt: Dictionary = calculator.calculate(graph.payload, graph.current, tables)
		safe(receipt); check(receipt.status == "READY", row.id + " ready: " + receipt.reason)
		if not receipt.has("plan"): continue
		compare(wire(receipt.plan), row.expected, row.id + "/exact source")
		compare(identities(receipt.plan), row.identities, row.id + "/source identities")
		var second_current := {"inventory": receipt.plan.inventory, "storage_before": receipt.plan.storage_after, "storage_after": receipt.plan.storage_after, "upgrades": receipt.plan.upgrades, "pot_levels": receipt.plan.pot_levels}
		var second: Dictionary = calculator.calculate(graph.payload, second_current, tables)
		check(second.status == "READY", row.id + "/second ready: " + second.reason)
		if second.has("plan"):
			compare(wire(second.plan), row.expected_second, row.id + "/second source")
			compare(identities(second.plan), row.second_identities, row.id + "/second source identity")
		check(JSON.stringify(wire(graph)) == before, row.id + "/input values unchanged")
		compare(identities(graph), row.input_identities, row.id + "/input identity unchanged")
		# Returned graph can be edited without touching input snapshots or tables.
		receipt.plan.inventory.bag.append({"test_output_only": true})
		if receipt.plan.inventory.get("ossCollect") is Dictionary: receipt.plan.inventory.ossCollect["test_output_only"] = true
		check(JSON.stringify(wire(graph)) == before, row.id + "/output detached")
		var repeat: Dictionary = calculator.calculate(graph.payload, graph.current, tables)
		check(repeat.status == "READY", row.id + "/repeat ready")
		if repeat.has("plan"): compare(wire(repeat.plan), row.expected, row.id + "/repeat deterministic")
	_test_boundaries(calculator, tables)
	for key in ["SLOT_NAMES", "SLOT_EMOJI", "RARITY_MUL", "WTYPES", "BOWTYPES", "_WP_MOD"]:
		compare(wire(tables[key]), probe.source_tables[key], "tables unchanged/" + key)
	print("SV_RESTORE_ITEMS_RESULT " + JSON.stringify({"checks": checks, "failures": failures, "source_cases": probe.rows.size(), "source_evaluations": probe.rows.size() * 2, "provenance": probe.provenance, "source_hash": probe.source_hash, "data_hash": probe.data_hash, "userdir": OS.get_user_data_dir(), "calculation_only": true, "live_inventory_applied": false, "storage_reads": 0, "storage_writes": 0, "server_calls": 0}))
	quit(0 if failures == 0 else 1)
func _test_boundaries(calculator: RefCounted, tables: Dictionary) -> void:
	var current := {"inventory": {"bag": [], "equipped": {}, "selected": 4}, "storage_before": {}, "storage_after": {}, "upgrades": {}, "pot_levels": {"hp": 2}}
	for payload in [null, false, 0, "", {}, {"inv": {}}, {"player": null}]:
		var result: Dictionary = calculator.calculate(payload, current, tables)
		safe(result); check(result.status == "REJECTED" and not result.has("plan"), "no player admission/constructor replacement")
	for fields in [{"inv": []}, {"inv": {"bag": "bad"}}, {"inv": {"equipped": []}}, {"inv": {"bag": [1]}}, {"inv": {"bag": [{"slot": "shield", "name": 1}]}}, {"inv": {"bag": [{"affixes": {}}]}}, {"inv": {"bag": [{"affixes": [null], "suffix": {"name": "s"}}]}}, {"inv": {"bag": [{"slot": "bracelet", "name": "???", "tier": -1}]}}, {"inv": {"bag": [{"slot": "headband", "name": "???", "tier": 1.5}]}}, {"inv": {"bag": [{"btype": "constructor"}]}}, {"crystalBag": "bad"}, {"crystalBag": [1]}, {"crystalBag": [{"q": {}}]}, {"bagMax": {}}, {"player": "unproven"}]:
		var payload: Dictionary = fields.duplicate(true)
		if not payload.has("player"): payload["player"] = {}
		var before := JSON.stringify(payload)
		var result: Dictionary = calculator.calculate(payload, current, tables)
		safe(result); check(result.status == "HOLD" and not result.has("plan"), "unproved/would-throw domain held: " + result.reason)
		check(JSON.stringify(payload) == before, "HOLD input unchanged")
	check(calculator.calculate({"player": {}}, {}, tables).status == "HOLD", "no invented current inventory or storage")
	check(calculator.calculate({"player": {}}, current, {}).status == "HOLD", "missing source tables")
	check(calculator.calculate({"player": {}, "potLv": {"constructor": 1}}, current, tables).status == "HOLD", "inherited POT key is unproved, not silently ignored")
	check(calculator.calculate({"player": {}, "potLv": []}, current, tables).status == "HOLD", "nonobject POT enumeration unproved")
	var cycle: Array = []; cycle.append(cycle)
	check(calculator.calculate({"player": {}, "inv": {"bag": cycle}}, current, tables).status == "HOLD", "cycle rejected before cloning")
	cycle.clear()
	var after_failure: Dictionary = calculator.calculate({"player": {}, "inv": {"bag": [], "equipped": {}}}, current, tables)
	check(after_failure.status == "READY", "failed calculation has no stale instance error")
	check(after_failure.plan.inventory.equipped.keys() == ["belt", "bracelet", "ossuary", "headband", "headband2"], "only five legacy missing keys; no invented full equipment")
	check(current.inventory.selected == 4 and after_failure.plan.inventory.selected == null, "selection reset in detached output only")
