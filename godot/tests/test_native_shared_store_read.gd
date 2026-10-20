extends SceneTree
const TRANSPORT = preload("res://tests/qa007/oracle_transport.gd")
const SHARED = preload("res://port_modules/save_adapter/source_shared_store.gd")
const USERDIR := "EXODUSER-sv-shared-read-Isolated-20261020"
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
		printerr("SV_SHARED_READ_FAIL ", label)
func wire(value: Variant) -> Variant:
	if value is float and not is_finite(value): return {"@number": "NaN" if is_nan(value) else ("Infinity" if value > 0 else "-Infinity")}
	if (value is float or value is int) and (float(value) != floor(float(value)) or absf(float(value)) >= 1e12 or (value == 0 and PackedFloat64Array([float(value)]).to_byte_array().hex_encode() == "0000000000000080")):
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
		if a != b: printerr("SV_SHARED_READ_VALUE ", label, " actual=", a, " expected=", b)
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
		printerr("SV_SHARED_READ_INVALID_ISOLATION"); quit(2); return
	if artifacts.is_empty(): printerr("SV_SHARED_READ_NEEDS_ARTIFACT_DIRECTORY"); quit(2); return
	var output: Array = []
	var status := OS.execute(node_bin, [ProjectSettings.globalize_path("res://../tools/sv_shared_read_oracle.cjs"), ProjectSettings.globalize_path("res://..")], output, true)
	check(status == 0 and not output.is_empty(), "exact original source oracle executed")
	var probe: Variant = TRANSPORT.decode_output(output)
	if not probe is Dictionary or status != 0: printerr(output); quit(2); return
	check(probe.source_unchanged and probe.actual_storage_reads == 0 and probe.actual_storage_writes == 0 and probe.actual_server_calls == 0 and probe.source_writer_helpers_executed == 0, "only fixture getters and writer stubs, source bytes unchanged")
	DirAccess.make_dir_recursive_absolute(artifacts)
	var file := FileAccess.open(artifacts.path_join("source-oracle.json"), FileAccess.WRITE)
	check(file != null, "QA output only")
	if file != null: file.store_string(JSON.stringify(probe)); file.close()
	var reader := SHARED.new()
	for row in probe.reads:
		var before := JSON.stringify(row.observation)
		var receipt: Dictionary = reader.call("read_" + row.kind, row.mode, row.observation)
		safe(receipt); check(receipt.status == row.expected.status, "source getter status/" + row.mode + "/" + row.kind + "/" + str(row.observation))
		if row.expected.status == "READY":
			check(receipt.has("value"), "source getter returned value")
			if receipt.has("value"): compare(wire(receipt.value), row.expected.value, "source getter value/" + row.mode + "/" + row.kind + "/" + str(row.observation))
		check(JSON.stringify(row.observation) == before, "read observation unchanged")
	for row in probe.stores:
		var storage: Dictionary = unwire(row.storage)
		var before := JSON.stringify(wire(storage))
		var receipt: Dictionary = reader.plan_store(storage, row.mode, row.observation)
		safe(receipt); check(receipt.status == "READY", row.id + " store ready: " + receipt.reason)
		if receipt.has("plan"):
			compare(wire(receipt.plan), row.expected.plan, row.id + "/getStore plan")
			compare(wire(receipt.intents), row.expected.intents, row.id + "/candidate calls")
			compare(receipt.read_count, row.expected.read_count, row.id + "/source getter count")
			check(is_same(receipt.plan.storage["0"], receipt.plan.store) == row.expected.store_alias, "store return is exact storage0 reference")
			var intents_before := JSON.stringify(wire(receipt.intents))
			receipt.plan.store.append({"output_only": true})
			check(JSON.stringify(wire(receipt.intents)) == intents_before, "candidate value is synchronous detached snapshot")
		check(JSON.stringify(wire(storage)) == before, "getStore output not alias input")
	for row in probe.restores:
		var payload: Dictionary = unwire(row.payload)
		var current: Dictionary = unwire(row.current)
		var before := JSON.stringify(wire({"payload": payload, "current": current, "observations": row.observations}))
		var receipt: Dictionary = reader.plan_restore(payload, current, row.observations)
		safe(receipt); check(receipt.status == "READY", row.id + " restore ready: " + receipt.reason)
		if not receipt.has("plan"): continue
		compare(wire(receipt.plan), row.expected.plan, row.id + "/restore source")
		compare(wire(receipt.intents), row.expected.intents, row.id + "/restore candidate calls")
		compare(receipt.reads, row.expected.reads, row.id + "/read sequence")
		var second: Dictionary = reader.plan_restore(receipt.plan.serialized, {"mats": receipt.plan.mats}, row.second_observations)
		check(second.status == "READY", row.id + "/second ready: " + second.reason)
		if second.has("plan"):
			compare(wire(second.plan), row.second.plan, row.id + "/second source")
			compare(wire(second.intents), row.second.intents, row.id + "/second candidate calls")
			compare(second.reads, row.second.reads, row.id + "/second reads")
		receipt.plan.serialized["output_only"] = true
		receipt.plan.storage["0"].append({"output_only": true})
		check(JSON.stringify(wire({"payload": payload, "current": current, "observations": row.observations})) == before, "restore output/cleared legacy is detached; no observed writes")
	_test_boundaries(reader)
	print("SV_SHARED_READ_RESULT " + JSON.stringify({"checks": checks, "failures": failures, "read_cases": probe.reads.size(), "store_cases": probe.stores.size(), "restore_cases": probe.restores.size(), "restore_source_evaluations": probe.restores.size() * 2, "provenance": probe.provenance, "source_hash": probe.source_hash, "userdir": OS.get_user_data_dir(), "calculation_only": true, "actual_storage_reads": 0, "actual_storage_writes": 0, "actual_server_calls": 0, "live_connection": false}))
	quit(0 if failures == 0 else 1)
func _test_boundaries(reader: RefCounted) -> void:
	for observation in [null, {}, {"state": 1}, {"state": "unknown"}, {"state": "value"}, {"state": "value", "value": 0}]:
		var r: Dictionary = reader.read_storage("browser_origin", observation)
		safe(r); check(r.status == "HOLD" and not r.has("value"), "unknown observations are not empty storage")
	check(reader.read_mats("automatic", {"state": "value", "value": "1"}).status == "HOLD", "no implicit namespace selection")
	for text in ['["\\uD800"]', '['.repeat(130) + '0' + ']'.repeat(130), '[1e400]', '[1234567890123456789]', '[0.12345678901234567]']:
		var r: Dictionary = reader.read_storage("browser_origin", {"state": "value", "value": text})
		check(r.status == "HOLD" and not r.has("value"), "valid but unproved JSON is not corrupt/missing: " + r.reason)
	check(reader.read_mats("browser_origin", {"state": "value", "value": "9".repeat(309)}).status == "HOLD", "parseInt overflow edge explicitly unproved")
	var observations := {"mode": "browser_origin", "mats_reads": [], "storage_reads": [{"state": "value", "value": "[]"}]}
	for value in [null, false, 0, "", {}, {"player": null}]:
		check(reader.plan_restore(value, {"mats": 0}, observations).status == "REJECTED", "source no-player admission")
	check(reader.plan_restore({"player": {}}, {}, observations).status == "HOLD", "no current G.mats invented")
	check(reader.plan_restore({"player": {}, "game": {}}, {"mats": 0}, observations).status == "HOLD", "post-write mats observation required")
	check(reader.plan_restore({"player": {}}, {"mats": 0}, {"mode": "browser_origin", "mats_reads": [], "storage_reads": []}).status == "HOLD", "post-rebind observation required")
	check(reader.plan_restore({"player": {}, "storage": {"0": "unsupported slice"}}, {"mats": 0}, observations).status == "HOLD", "unproved legacy slice not normalized")
	check(reader.plan_store({"_synced": false}, "qa_fixture", {"state": "value", "value": "null"}).status == "HOLD", "QA raw non-array does not become normal []")
	var qa := {"mode": "qa_fixture", "mats_reads": [{"state": "error"}, {"state": "value", "value": "0"}], "storage_reads": []}
	var thrown: Dictionary = reader.plan_restore({"player": {}, "game": {}}, {"mats": 77}, qa)
	check(thrown.status == "SOURCE_THROW" and not thrown.has("plan"), "QA uncaught getter exception not successful restore")
	var reloaded: Dictionary = reader.plan_store({"_synced": false, "1": [{"id": 1}]}, "browser_origin", {"state": "error"})
	check(reloaded.status == "READY" and reloaded.plan.store.size() == 1, "normal IO fallback still calculates legacy floor merge")
