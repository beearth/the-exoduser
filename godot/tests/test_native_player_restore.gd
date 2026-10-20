extends SceneTree
const TRANSPORT = preload("res://tests/qa007/oracle_transport.gd")
const RESTORE = preload("res://port_modules/save_adapter/source_player_restore.gd")
const USERDIR := "EXODUSER-sv-restore-player-Isolated-20261020"
var checks := 0
var failures := 0
var artifacts := ""
var node_bin := TRANSPORT.node_binary()
var completed := false

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--artifacts-dir="): artifacts = arg.trim_prefix("--artifacts-dir=")
		if arg.begins_with("--node-bin="): node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("SV_RESTORE_PLAYER_FAIL ", label)
func wire(value: Variant) -> Variant:
	if value is float and not is_finite(value): return {"@number": "NaN" if is_nan(value) else ("Infinity" if value > 0 else "-Infinity")}
	if (value is float or value is int) and absf(float(value)) >= 1e12:
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
		if a != b: printerr("SV_RESTORE_PLAYER_VALUE ", label, " actual=", a, " expected=", b)
func safe(receipt: Dictionary) -> void:
	check(receipt.calculation_only and not receipt.write_authorized and not receipt.restore_connected and not receipt.storage_io and not receipt.network and not receipt.full_restore_verified, "detached no writer/IO/whole-restore claim")
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR or not OS.get_user_data_dir().contains(USERDIR):
		printerr("SV_RESTORE_PLAYER_INVALID_ISOLATION"); quit(2); return
	if artifacts.is_empty(): printerr("SV_RESTORE_PLAYER_NEEDS_ARTIFACT_DIRECTORY"); quit(2); return
	var oracle_receipt := TRANSPORT.execute_file(node_bin, ProjectSettings.globalize_path("res://../tools/sv_restore_player_oracle.cjs"), ProjectSettings.globalize_path("res://.."))
	var status: int = oracle_receipt.code
	check(status == 0, "exact source VM executed")
	var probe: Variant = oracle_receipt.data
	if not probe is Dictionary or status != 0: printerr(oracle_receipt.diagnostics); quit(2); return
	check(probe.source_unchanged and probe.actual_save_writes == 0 and probe.actual_server_calls == 0 and probe.live_restore_calls == 0, "source preserved; no actual storage/server/live actor")
	DirAccess.make_dir_recursive_absolute(artifacts)
	var file := FileAccess.open(artifacts.path_join("source-oracle.json"), FileAccess.WRITE)
	check(file != null, "QA output only")
	if file != null: file.store_string(JSON.stringify(probe)); file.close()
	for row in probe.rows:
		row.payload = unwire(row.payload); row.current = unwire(row.current)
		var before: Dictionary = row.payload.duplicate(true)
		var before_current: Dictionary = row.current.duplicate(true)
		var receipt: Dictionary = RESTORE.calculate(row.payload, row.current)
		safe(receipt); check(receipt.status == "READY", row.id + " ready: " + receipt.reason)
		if not receipt.has("plan"): continue
		compare(wire(receipt.plan), row.expected, row.id + "/source")
		var second: Dictionary = RESTORE.calculate(row.payload, receipt.plan)
		check(second.status == "READY", row.id + "/second ready")
		if second.has("plan"): compare(wire(second.plan), row.expected_second, row.id + "/reparse twice")
		var simulated_payload: Dictionary = row.payload.duplicate(true)
		if receipt.plan.skills is Dictionary: simulated_payload.skills = receipt.plan.skills.duplicate(true)
		var same_object: Dictionary = RESTORE.calculate(simulated_payload, receipt.plan)
		check(same_object.status == "READY", row.id + "/same object ready")
		if same_object.has("plan"): compare(wire(same_object.plan), row.expected_same_object, row.id + "/source mutated skills twice")
		compare(row.payload, before, row.id + "/input unchanged")
		compare(row.current, before_current, row.id + "/owner snapshot unchanged")
		# Mutate returned nested objects to prove deep detachment from both inputs.
		receipt.plan.player._apBossCleared = ["changed"]
		if not receipt.plan.player._passiveQueue.is_empty(): receipt.plan.player._passiveQueue[0] = "changed"
		if receipt.plan.player.get("untouched") is Dictionary: receipt.plan.player.untouched.nested.append(999)
		compare(row.payload, before, row.id + "/output not alias payload")
		compare(row.current, before_current, row.id + "/output not alias owner")
	_test_boundaries()
	completed = true
	check(completed, "completion sentinel")
	print("SV_RESTORE_PLAYER_RESULT " + JSON.stringify({"checks": checks, "failures": failures, "source_cases": probe.rows.size(), "source_evaluations": probe.rows.size() * 3, "provenance": probe.provenance, "source_hash": probe.source_hash, "userdir": OS.get_user_data_dir(), "calculation_only": true, "live_actor_readback_verified": false, "storage_writes": 0, "server_calls": 0}))
	quit(0 if failures == 0 else 1)
func _test_boundaries() -> void:
	var current := {"player": {"mhp": 777, "mmp": 333, "mst": 222, "rage": 71, "maskOn": false}, "stats": {}, "passives": {"pShield": 0}}
	for value in [null, false, 0, "", {}, {"charIdx": 2}, {"player": null}, {"player": 0}]:
		var r: Dictionary = RESTORE.calculate(value, {})
		safe(r); check(r.status == "REJECTED" and not r.has("plan"), "metadata/falsy no constructor replacement")
	for value in [[], "text", {"player": []}, {"player": "text"}, {"player": {}, "passives": []}, {"player": {}, "skills": 1}, {"player": {"lv": {}}}, {"player": {"ap": {}}}, {"player": {}, "grit": [2.5]}, {"player": {"sp": "5"}, "grit": 2.5}, {"player": {}, "grit": "0xFFFFFFFFFFFFFFF8"}, {"player": {"lv": 1500, "maxExp": -1, "exp": {}}}]:
		var r: Dictionary = RESTORE.calculate(value, current)
		safe(r); check(r.status == "HOLD" and not r.has("plan"), "unsupported carrier is HOLD, not invented restore")
	var missing: Dictionary = current.duplicate(true); missing.player.erase("mmp")
	check(RESTORE.calculate({"player": {}}, missing).status == "HOLD", "actual previous cap required")
	check(RESTORE.calculate({"player": {}}, {}).status == "HOLD", "actual allocation snapshot required")
	var restored: Dictionary = RESTORE.calculate({"player": {"hp": 0, "mp": 0, "st": 0, "mhp": 999, "mmp": 999, "mst": 999, "rage": 0, "maskOn": true}}, current)
	check(restored.plan.player.hp == 777 and restored.plan.player.mp == 333 and restored.plan.player.st == 222, "zero uses old caps before saved caps")
	check(restored.plan.player.mhp == 999 and restored.plan.player.mmp == 999 and restored.plan.player.mst == 999, "saved caps follow current resources")
	check(restored.plan.player.rage == 71 and restored.plan.player.maskOn == false, "protected fields unmodified")
	var huge: Dictionary = RESTORE.calculate({"player": {}, "passives": {"pDef": 2147483647}}, current)
	check(huge.status == "READY" and huge.plan.player.ap == 10737418208.0, "bounded closed-form cost avoids billion-iteration loop")
