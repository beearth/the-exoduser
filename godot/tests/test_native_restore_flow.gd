extends SceneTree
const FLOW = preload("res://port_modules/save_adapter/source_restore_flow.gd")
const USERDIR := "EXODUSER-sv-restore-flow-Isolated-20261020"
var checks := 0
var failures := 0
var artifacts := ""
var node_bin := "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node"
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--artifacts-dir="): artifacts = arg.trim_prefix("--artifacts-dir=")
		if arg.begins_with("--node-bin="): node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("SV_RESTORE_FLOW_FAIL ", label)
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
		if value.size() == 1 and value.has("@number"): return NAN if value["@number"] == "NaN" else (INF if value["@number"] == "Infinity" else -INF)
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
		if a != b: printerr("SV_RESTORE_FLOW_VALUE ", label, " actual=", a, " expected=", b)
func safe(r: Dictionary) -> void:
	check(r.calculation_only and not r.write_authorized and not r.storage_io and not r.network and not r.restore_connected and not r.full_restore_verified and not r.partial_apply_authorized and r.connection_status == "HOLD", "calculation receipt has no live/partial apply authority")
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR or not OS.get_user_data_dir().contains(USERDIR): printerr("SV_RESTORE_FLOW_INVALID_ISOLATION"); quit(2); return
	if artifacts.is_empty(): printerr("SV_RESTORE_FLOW_NEEDS_ARTIFACT_DIRECTORY"); quit(2); return
	var output: Array = []
	var status := OS.execute(node_bin, [ProjectSettings.globalize_path("res://../tools/sv_restore_flow_oracle.cjs"), ProjectSettings.globalize_path("res://..")], output, true)
	check(status == 0 and output.size() == 1, "exact original source oracle executed")
	var probe: Variant = JSON.parse_string(str(output[0])) if not output.is_empty() else null
	if not probe is Dictionary or status != 0: printerr(output); quit(2); return
	check(probe.source_unchanged and probe.storage_calls == 0 and probe.server_calls == 0 and probe.live_writes == 0 and probe.protected_source_fixture_only, "source on detached fixtures only; no setter/server/game boot")
	DirAccess.make_dir_recursive_absolute(artifacts)
	var file := FileAccess.open(artifacts.path_join("source-oracle.json"), FileAccess.WRITE)
	check(file != null, "QA artifact writer only")
	if file != null: file.store_string(JSON.stringify(probe)); file.close()
	var calculator := FLOW.new()
	var tables: Dictionary = unwire(probe.tables)
	for row in probe.rows:
		var payload: Dictionary = unwire(row.payload)
		var current: Dictionary = unwire(row.current)
		var observations: Dictionary = unwire(row.observations)
		var before := JSON.stringify(wire({"d": payload, "current": current, "tables": tables, "observations": observations}))
		var r: Dictionary = calculator.calculate(payload, current, tables, observations)
		safe(r); check(r.status == "READY", row.id + " ready: " + r.reason + " at " + r.failed_stage)
		if not r.has("plan"):
			var diagnostic := FileAccess.open(artifacts.path_join(row.id + "-hold.json"), FileAccess.WRITE)
			diagnostic.store_string(JSON.stringify(wire(r)))
			continue
		compare(wire(r.plan.state), row.expected.state, row.id + "/state")
		compare(wire(r.plan.serialized), row.expected.serialized, row.id + "/serialized")
		compare(wire(r.trace), row.expected.trace, row.id + "/every stage")
		if payload.has("fused") and payload.fused is Dictionary: check(is_same(r.plan.state.player._fused, r.plan.serialized.fused), "source fused rebind identity preserved")
		if payload.has("skProf") and payload.skProf is Dictionary: check(is_same(r.plan.state.player._skProf, r.plan.serialized.skProf), "source mastery rebind identity preserved")
		var second: Dictionary = calculator.calculate(r.plan.serialized, r.plan.state, tables, unwire(row.second.observations))
		safe(second); check(second.status == "READY", row.id + "/second ready: " + second.reason)
		if second.has("plan"):
			compare(wire(second.plan.state), row.second.expected.state, row.id + "/second state")
			compare(wire(second.plan.serialized), row.second.expected.serialized, row.id + "/second serialized")
			compare(wire(second.trace), row.second.expected.trace, row.id + "/second stages")
		var trace_before := JSON.stringify(wire(r.trace))
		r.plan.state.player.skills["output_only"] = 1
		r.plan.serialized["output_only"] = true
		check(JSON.stringify(wire(r.trace)) == trace_before, "stage snapshots detached from later plan mutations")
		check(JSON.stringify(wire({"d": payload, "current": current, "tables": tables, "observations": observations})) == before, "input/current/owner tables/handoff observations unchanged")
	_boundaries(calculator, unwire(probe.rows[0]), tables)
	print("SV_RESTORE_FLOW_RESULT " + JSON.stringify({"checks": checks, "failures": failures, "fixtures": probe.rows.size(), "source_evaluations": probe.rows.size() * 2, "source_stages": FLOW.STAGES.size(), "source_hash": probe.source_hash, "provenance": probe.provenance, "userdir": OS.get_user_data_dir(), "calculation_only": true, "actual_storage_writes": 0, "actual_server_calls": 0, "live_connection": false, "protected_fixture_observations_only": true}))
	quit(0 if failures == 0 else 1)
func _boundaries(flow: RefCounted, row: Dictionary, tables: Dictionary) -> void:
	for value in [null, false, 0, "", {}, {"slot": 1}, {"player": null}, {"player": false}]:
		var r: Dictionary = flow.calculate(value, row.current, tables, row.observations)
		safe(r); check(r.status == "REJECTED" and not r.has("plan") and r.trace.is_empty(), "metadata/falsy player not full restore, no constructor fallback")
	for value in [true, 1, "text", [], {"player": 1}, {"player": "text"}, {"player": []}]:
		var r: Dictionary = flow.calculate(value, row.current, tables, row.observations)
		check(r.status == "HOLD" and not r.has("plan"), "malformed truthy carrier is not new game")
	check(flow.calculate(row.payload, {}, tables, row.observations).status == "HOLD", "owner current required")
	check(flow.calculate(row.payload, row.current, {}, row.observations).status == "HOLD", "owner known key tables required")
	for boundary in ["protected_qe", "protected_active_sync", "protected_wing"]:
		var obs: Dictionary = row.observations.duplicate(true); obs.erase(boundary)
		var missing: Dictionary = flow.calculate(row.payload, row.current, tables, obs)
		safe(missing); check(missing.status == "HOLD" and missing.failed_stage == boundary and not missing.has("plan") and missing.trace.size() == FLOW.STAGES.find(boundary), "absent protected handoff halts exact prefix/" + boundary)
		var expected_prefix: Array = row.expected.trace.slice(0, FLOW.STAGES.find(boundary))
		compare(wire(missing.trace), wire(expected_prefix), "partial prefix/" + boundary)
		var partial_before := JSON.stringify(row.current)
		missing.partial_snapshot.player.skills["not_applied"] = true
		check(JSON.stringify(row.current) == partial_before, "partial receipt detached and unapplied")
		obs = row.observations.duplicate(true); obs[boundary].before.game.mats = 777
		var stale: Dictionary = flow.calculate(row.payload, row.current, tables, obs)
		check(stale.status == "HOLD" and stale.failed_stage == boundary and not stale.has("plan"), "stale owner observation rejected/" + boundary)
		obs = row.observations.duplicate(true); obs[boundary].after.game.mats = 777
		var unowned: Dictionary = flow.calculate(row.payload, row.current, tables, obs)
		check(unowned.status == "HOLD" and unowned.failed_stage == boundary and not unowned.has("plan"), "unowned observed mutation rejected/" + boundary)
		# Boundary exception is caller-observed, not invented source fault coverage.
		obs = row.observations.duplicate(true); obs[boundary].state = "source_throw"; obs[boundary].after = obs[boundary].before.duplicate(true)
		var thrown: Dictionary = flow.calculate(row.payload, row.current, tables, obs)
		check(thrown.status == "SOURCE_THROW" and thrown.failed_stage == boundary and not thrown.has("plan") and thrown.trace.size() == FLOW.STAGES.find(boundary), "observed exception stops following stages/" + boundary)
	for pair in [["skills", []], ["fused", []], ["skProf", []], ["fuseProfSec", "truthy"]]:
		var payload: Dictionary = row.payload.duplicate(true); payload[pair[0]] = pair[1]
		var r: Dictionary = flow.calculate(payload, row.current, tables, row.observations)
		check(r.status == "HOLD" and not r.has("plan"), "unsupported carrier never silently normalized/" + pair[0])
	var malformed: Dictionary = row.payload.duplicate(true); malformed["skills"] = {"chargeBoost": {"not_a_number": true}}
	var numeric: Dictionary = flow.calculate(malformed, row.current, tables, {})
	check(numeric.status == "HOLD" and numeric.failed_stage == "protected_qe" and numeric.trace.size() == 5, "valid prefix still stops at absent protected boundary before later unsupported Number")
	var cycle := {}; cycle["self"] = cycle
	check(flow.calculate({"player": {}, "skills": cycle}, row.current, tables).status == "HOLD", "cyclic graph rejected")
	cycle.clear()
	var malformed_table: Dictionary = tables.duplicate(true); malformed_table["prof_cap"] = NAN
	check(flow.calculate(row.payload, row.current, malformed_table, row.observations).status == "HOLD", "nonfinite authority cap rejected")
	check(flow.calculate({"player": {}, "skills": {"__proto__": {}}}, row.current, tables).status == "HOLD", "prototype exotic semantics explicit HOLD")
	var alias_payload := {"player": {}, "fused": {"unknown": true}, "skProf": {"chainStun": 10001}}
	var alias_current: Dictionary = row.current.duplicate(true); alias_current.player.opaque = alias_payload.fused
	var prefix: Dictionary = flow.calculate(alias_payload, alias_current, tables)
	check(prefix.status == "HOLD" and prefix.failed_stage == "protected_qe", "aliases reach protected boundary")
	check(is_same(prefix.partial_snapshot.player.opaque, prefix.partial_snapshot.player._fused), "cross-input alias preserved inside detached graph")
	check(alias_payload.skProf.chainStun == 10001 and alias_payload.fused == {"unknown": true}, "partial mastery cap/rebind did not mutate caller")

	# Unsupported Number at mastery: preserve the proven skills/fused prefix,
	# do not publish the unproved in-stage scratch as a ready plan.
	var bad_prof := {"player": {}, "skills": {"kiSlash": 4}, "skProf": {"kiSlash": {"object": true}}}
	var unsupported: Dictionary = flow.calculate(bad_prof, row.current, tables)
	check(unsupported.status == "HOLD" and unsupported.failed_stage == "mastery" and unsupported.trace.size() == 2 and not unsupported.has("plan"), "unsupported Number halts at mastery")
	check(not unsupported.partial_snapshot.player._skProf.has("kiSlash") and unsupported.partial_snapshot.player.skills.kiSlash == 4, "partial snapshot is last completed stage, not unproved scratch")
	var protected_object: Dictionary = row.observations.duplicate(true)
	protected_object.protected_qe.after.player.activeQSk = {"opaque": 1}
	var unproved: Dictionary = flow.calculate(row.payload, row.current, tables, protected_object)
	check(unproved.status == "HOLD" and unproved.failed_stage == "protected_qe" and not unproved.has("plan"), "nonprimitive protected leaf not silently copied with lost alias")
