extends SceneTree
const PRIMITIVE = preload("res://port_modules/save_adapter/source_save_primitive.gd")
const USERDIR := "EXODUSER-sv-save-primitive-Isolated-20261020"
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
		printerr("SV_SAVE_PRIMITIVE_FAIL ", label)
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
		if a != b: printerr("SV_SAVE_PRIMITIVE_VALUE ", label, " actual=", a, " expected=", b)
func safe(r: Dictionary) -> void:
	check(r.fixture_only and not r.product_write_authorized and not r.host_io and not r.network and not r.Main_connected and not r.full_save_verified and r.connection_status == "HOLD", "ACK calculation has no product/host authority")
func bytes(value: Array) -> PackedByteArray:
	return PackedByteArray(value)
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR or not OS.get_user_data_dir().contains(USERDIR): printerr("SV_SAVE_PRIMITIVE_INVALID_ISOLATION"); quit(2); return
	if artifacts.is_empty(): printerr("SV_SAVE_PRIMITIVE_NEEDS_ARTIFACT_DIRECTORY"); quit(2); return
	var output: Array = []
	var status := OS.execute(node_bin, [ProjectSettings.globalize_path("res://../tools/sv_save_primitive_oracle.cjs"), ProjectSettings.globalize_path("res://..")], output, true)
	check(status == 0 and output.size() == 1, "source oracle executed")
	var probe: Variant = JSON.parse_string(str(output[0])) if not output.is_empty() else null
	if not probe is Dictionary or status != 0: printerr(output); quit(2); return
	check(probe.source_unchanged and probe.host_storage_writes == 0 and probe.server_calls == 0 and probe.fixture_only, "only source reads and memory writes; no network")
	DirAccess.make_dir_recursive_absolute(artifacts)
	var file := FileAccess.open(artifacts.path_join("source-oracle.json"), FileAccess.WRITE)
	check(file != null, "external QA artifact only")
	if file != null: file.store_string(JSON.stringify(probe)); file.close()
	var primitive := PRIMITIVE.new()
	check(primitive.readiness().status == "HOLD" and not primitive.readiness().product_write_authorized, "product primitive/lifecycle binding explicitly unavailable")
	for row in probe.cases:
		var fixture: RefCounted = primitive.create_fixture(USERDIR)
		for key in row.initial: check(fixture.seed(key, bytes(row.initial[key])), "seed own virtual fixture only")
		var faults: Array = row.faults.duplicate(true)
		for fault in faults:
			fault["nth"] = int(fault.nth)
			if fault.has("bytes"): fault["bytes"] = int(fault.bytes)
		check(fixture.set_faults(faults), "valid fixture fault schedule")
		var payload := bytes(row.bytes)
		var original := payload.duplicate()
		var ticket: Dictionary = fixture.begin(row.mode, "slotA", payload, 11)
		check(ticket.status == "PENDING", "start memory primitive")
		if ticket.status != "PENDING": continue
		payload.append(255)
		var result: Dictionary = fixture.run(ticket.id)
		check(result.status == "SETTLED" and result.ok == row.expected.ok and result.error == row.expected.error, "source write result/" + row.mode + "/" + JSON.stringify(faults))
		check(result.fixture_only and not result.host_io and not result.product_write_authorized and not result.durability_verified, "no host/durability claim")
		compare(fixture.snapshot(), row.expected.snapshot, "source FS calls/bytes/fd/cleanup/" + row.mode + "/" + JSON.stringify(faults))
		check(original == bytes(row.bytes), "caller byte carrier unchanged")
		var snap: Dictionary = fixture.snapshot(); var original_snap := JSON.stringify(snap)
		fixture.run(ticket.id)
		check(JSON.stringify(fixture.snapshot()) == original_snap, "settled transaction cannot replay a write")
		snap.files["output_only"] = [1]
		snap.calls.append({"output_only": true})
		check(JSON.stringify(fixture.snapshot()) == original_snap, "fixture snapshots detached")
	for row in probe.interleavings:
		var fixture: RefCounted = primitive.create_fixture(USERDIR)
		fixture.seed("slotA", PackedByteArray([111, 108, 100]))
		var a: Dictionary = fixture.begin("dev_atomic", "slotA", bytes(row.a_bytes), 11)
		for i in int(row.steps): fixture.advance(a.id)
		if int(row.steps) < 4: check(fixture.snapshot().files.slotA == [111, 108, 100], "atomic target unchanged before rename")
		var b: Dictionary = fixture.begin("dev_atomic", "slotA", bytes(row.b_bytes), 22)
		check(fixture.run(b.id).ok and fixture.run(a.id).ok, "two virtual process writers settled")
		compare(fixture.snapshot(), row.expected, "source reentrant virtual schedule/" + row.hook)
	var serial: RefCounted = primitive.create_fixture(USERDIR)
	var sample: Dictionary = probe.interleavings[0]
	for payload in [sample.a_bytes, sample.b_bytes]:
		var ticket: Dictionary = serial.begin("dev_atomic", "slotA", bytes(payload), 11)
		check(serial.run(ticket.id).ok, "same process sequential fixture write")
	compare(serial.snapshot(), probe.sequential, "source per-process sequence and last rename wins")
	for row in probe.cloud:
		var before := JSON.stringify(row)
		var result: Dictionary = primitive.cloud_ack(row.request_id, row.current_id, row.response, 17, 1000)
		safe(result); check(result.status == "READY", "cloud ACK subset ready")
		if result.has("result"): compare(result.result, row.expected, "source cloud ACK/" + JSON.stringify(row.response) + "/" + row.current_id)
		check(JSON.stringify(row) == before, "ACK does not mutate response")
	for row in probe.local:
		var before := JSON.stringify(row)
		var result: Dictionary = primitive.local_ack(row.request_slot, row.current_slot, row.server_before, row.observation, 17, 1000)
		safe(result); check(result.status == "READY", "local ACK subset ready")
		if result.has("result"): compare(result.result, row.expected, "source local ACK/" + JSON.stringify(row.observation))
		check(JSON.stringify(row) == before, "local ACK does not write response or state")
	for row in probe.web:
		var result: Dictionary = primitive.web_ack(row.observation, 17, 1000)
		safe(result); check(result.status == "READY" and row.setter_fixture_calls == 1, "web post-write observation ready")
		if result.has("result"): compare(result.result, row.expected, "source web ACK")
	_boundaries(primitive)
	print("SV_SAVE_PRIMITIVE_RESULT " + JSON.stringify({"checks": checks, "failures": failures, "write_cases": probe.cases.size(), "interleavings": probe.interleavings.size(), "cloud_ack_cases": probe.cloud.size(), "local_ack_cases": probe.local.size(), "web_ack_cases": probe.web.size(), "source_hashes": probe.source_hashes, "provenance": probe.provenance, "host_storage_writes": 0, "actual_server_calls": 0, "fixture_only": true, "product_connection": "HOLD", "userdir": OS.get_user_data_dir()}))
	quit(0 if failures == 0 else 1)
func _boundaries(primitive: RefCounted) -> void:
	for fixture_namespace in ["", "EXODUSER-Godot-Native-First", "user://", USERDIR + "-other"]:
		check(primitive.create_fixture(fixture_namespace) == null, "no other namespace/storage object created")
	var fixture: RefCounted = primitive.create_fixture(USERDIR)
	for key in ["", "..", "../slot", "user://slot", "res://slot", "/tmp/slot", "folder/slot"]:
		check(not fixture.seed(key, PackedByteArray([1])) and fixture.begin("dev_atomic", key, PackedByteArray([1])).status == "HOLD", "host path is never an addressable fixture key")
	check(fixture.begin("FileAccess", "slotA", PackedByteArray([1])).status == "HOLD", "no real-file backend selector")
	check(fixture.advance(1).status == "HOLD", "unknown transaction cannot write")
	check(not fixture.set_faults([{"op": "open", "nth": 1, "effect": "after"}]), "unproved open-after-effect fault not silently supported")
	check(not fixture.set_faults([{"op": "read", "nth": 1, "effect": "before"}]), "no injected external callback/backend")
	check(primitive.cloud_ack("A", "A", {}, 17, 1000).status == "HOLD", "missing transport observation")
	check(primitive.cloud_ack("A", "A", {"state": "returned", "value": {"data": {"length": 1}}}, 17, 1000).status == "HOLD", "non-array ACK exotic carrier explicitly unproved")
	check(primitive.cloud_ack("A", "A", {"state": "throw"}, NAN, 1000).status == "HOLD", "unavailable clock not fabricated")
	check(primitive.local_ack("A", "A", true, {"kind": "offline", "write": "succeeded"}, 17, 1000).status == "HOLD", "contradictory route observation")
	check(primitive.local_ack("A", "A", false, {"kind": "offline"}, 17, 1000).status == "HOLD", "fallback write outcome required")
	check(primitive.local_ack("A", "A", null, {"kind": "json", "value": 1}, 17, 1000).status == "HOLD", "non-object JSON ACK subset not guessed")

	check(primitive.web_ack({}, 17, 1000).status == "HOLD", "no assumed web write success")

	check(fixture.begin("dev_atomic", "slotA.tmp-11-1", PackedByteArray([1])).status == "HOLD", "primary tokens cannot alias another transaction temporary token")
	var other: RefCounted = primitive.create_fixture(USERDIR)
	var ticket: Dictionary = fixture.begin("dev_atomic", "slotA", PackedByteArray([1, 2]))
	check(fixture.run(ticket.id).ok and other.snapshot().files.is_empty() and other.snapshot().calls.is_empty(), "fixture instances have independent ownership and storage")
	check(not fixture.seed("slotA", PackedByteArray([9])) and not fixture.set_faults([]), "started fixture cannot be reseeded or have fault history replaced")
