extends SceneTree
## SV-COLLECT. Reuses SV-CONTRACT's unchanged actual-source scanner/fixtures.
## Every run requires USERDIR exactly; --main additionally boots actual Main.
const COLLECTOR = preload("res://port_modules/save_adapter/source_save_collector.gd")
const CONTRACT = preload("res://tests/test_native_save_contract.gd")
const RAW_GRIT = preload("res://port_modules/save_adapter/raw_grit_restore.gd")
const USERDIR := "EXODUSER-sv-collect-Isolated-20261020"
const NOW := 1700000000123
const EXTRA_PROBE := """
const inputs=['populated','defaults','queue_limit','extended_arrays','json_carriers'].map(kind=>({kind,data:bindings(kind)}));
const extraSamples=[];
for(const kind of ['empty_truthy','null_spreads','array_spreads']) {
 const data=bindings('populated');
 if(kind==='empty_truthy') {
  data.P.ap=[];data.P._transLvDate=[];data.P._transLvCount={};data.P._fused=[];
  data.P._skProf=[];data.P.activeQSk=[];data.INV.ossCollect=[];
  data.G._irisSz=[];data.G._taRecords=[];data.G.playTime={};
 } else if(kind==='null_spreads') {data.P.skills=null;data.UPGRADES=null;data.POT_LV=false;}
 else {data.P.skills=[1,null,false];data.UPGRADES=[false,9];data.POT_LV=[0];}
 inputs.push({kind,data});
 for(const producer of found) {
  const before=JSON.stringify(data),context=vm.createContext({...data,Date:{now:()=>1700000000123}});
  const value=vm.runInContext(helper+';('+producer.expression+')',context,{timeout:1000});
  extraSamples.push({kind,profile:producer.id,payload:JSON.parse(JSON.stringify(value)),input_unchanged:before===JSON.stringify(data)});
 }
}
const slotCases=[];
for(const kind of ['slot_object','slot_null']) {
 const data=bindings('populated');data.SKILL_SLOTS=kind==='slot_object'?{}:null;
 for(const producer of found) {
  const before=JSON.stringify(data),context=vm.createContext({...data,Date:{now:()=>1700000000123}});
  let payload=null,threw=false;
  try{payload=JSON.parse(JSON.stringify(vm.runInContext(helper+';('+producer.expression+')',context,{timeout:1000})));}
  catch(error){if(error.name!=='TypeError')throw error;threw=true;}
  slotCases.push({kind,profile:producer.id,data,payload,threw,input_unchanged:before===JSON.stringify(data)});
 }
}
console.log(JSON.stringify({inputs,extraSamples,slotCases}));
"""

class OwnedInputs extends RefCounted:
	var data: Dictionary
	var reads: Dictionary = {}
	var raw = RAW_GRIT.new()
	func _init(value: Dictionary) -> void:
		data = value.duplicate(true)
		raw.initialize({"_grit": data._grit})
	func read(name: String) -> Dictionary:
		reads[name] = reads.get(name, 0) + 1
		match name:
			"current_p": return data.P
			"current_g": return data.G
			"current_inventory": return data.INV
			"current_stats": return data.STATS
			"current_passives": return data.PASSIVES
			"raw_grit": return raw.read_raw()
			"reward_bags": return {"crystal": data.CRYSTAL_BAG, "stone": data.STONE_BAG}
			"save_globals": return data
		return {}
	func readers() -> Dictionary:
		var result: Dictionary = {}
		for key in COLLECTOR.DOMAIN_READERS + ["raw_grit", "reward_bags"]:
			result[key] = Callable(self, "read").bind(key)
		return result

class GoneOwner extends Node:
	func read() -> Dictionary: return {}

var assertions := 0
var failures := 0
var current_group := "setup"
var groups: Array = []
var source_probe: Dictionary = {}
var extra_probe: Dictionary = {}
var artifacts: String
var node_bin := "node"
var run_main := false
var observations: Dictionary = {}
var completed: Dictionary = {}

func _initialize() -> void:
	artifacts = ProjectSettings.globalize_path("res://../../_out/sv-collect")
	for arg in OS.get_cmdline_user_args():
		if arg == "--main": run_main = true
		if arg.begins_with("--node-bin="): node_bin = arg.trim_prefix("--node-bin=")
		if arg.begins_with("--artifacts-dir="): artifacts = arg.trim_prefix("--artifacts-dir=")
	call_deferred("_run")

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("SV_COLLECT_FAIL ", current_group, " ", label)

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR or not OS.get_user_data_dir().contains(USERDIR):
		printerr("SV_COLLECT_INVALID_ISOLATION ", OS.get_user_data_dir())
		quit(2)
		return
	if not _read_oracle():
		quit(2)
		return
	for group in ["original_source_profiles", "missing_owners_and_unsupported_inputs", "detached_read_only_and_current_values"]:
		current_group = group
		var before := assertions
		var failed_before := failures
		call("_test_" + group)
		check(completed.get(group, false), group + " reached final assertion without script abort")
		groups.append({"group": group, "assertions": assertions-before, "failures": failures-failed_before})
	if run_main:
		current_group = "actual_main_readers_and_owner_loss"
		var before := assertions
		var failed_before := failures
		await _test_actual_main()
		check(completed.get(current_group, false), "actual Main group reached final assertion without script abort")
		groups.append({"group": current_group, "assertions": assertions-before, "failures": failures-failed_before})
	print("SV_COLLECT_RESULT " + JSON.stringify({"assertions": assertions, "failures": failures, "groups": groups, "actual_main_tested": run_main, "full_main_save_ready": false, "storage_io": false, "observations": observations, "source_provenance": source_probe.producers.map(func(row):return {"profile": row.id, "start_line": row.start_line, "end_line": row.end_line, "sha256": row.sha256})}))
	quit(0 if failures == 0 else 1)

func _read_oracle() -> bool:
	check(DirAccess.make_dir_recursive_absolute(artifacts) == OK, "own QA artifact directory")
	var file_path := artifacts.path_join("sv-collect-owned-oracle.cjs")
	var file := FileAccess.open(file_path, FileAccess.WRITE)
	check(file != null, "own temporary Node helper opens")
	if file == null: return false
	file.store_string(CONTRACT.SOURCE_PROBE + EXTRA_PROBE)
	file.close()
	var output: Array = []
	var source_path := ProjectSettings.globalize_path("res://../game.html")
	var exit_code := OS.execute(node_bin, [file_path, source_path], output, true)
	check(DirAccess.remove_absolute(file_path) == OK, "only own temporary helper removed")
	check(exit_code == 0, "unchanged SV-CONTRACT oracle + extra cases actually executed")
	if exit_code != 0:
		printerr(output)
		return false
	var lines: PackedStringArray = str(output[0]).strip_edges().split("\n") if not output.is_empty() else PackedStringArray()
	check(lines.size() == 2, "two actual-source oracle records")
	if lines.size() != 2: return false
	var first: Variant = JSON.parse_string(lines[0])
	var second: Variant = JSON.parse_string(lines[1])
	check(first is Dictionary and second is Dictionary, "oracle JSON records parse")
	if not first is Dictionary or not second is Dictionary: return false
	source_probe = first
	extra_probe = second
	var record := FileAccess.open(artifacts.path_join("collector-oracle.json"), FileAccess.WRITE)
	check(record != null, "oracle provenance retained outside product")
	if record != null:
		record.store_string(JSON.stringify({"source": source_probe, "additional": extra_probe}))
		record.close()
	check(source_probe.source_unchanged and source_probe.samples.size() == 25 and extra_probe.extraSamples.size() == 15, "25 existing + 15 extended source evaluations")
	observations.source_sha256 = source_probe.source_sha256
	return failures == 0

func _inputs(kind: String) -> Dictionary:
	for row in extra_probe.inputs:
		if row.kind == kind: return row.data
	return {}

func _test_original_source_profiles() -> void:
	var samples: Array = source_probe.samples + extra_probe.extraSamples
	for row in samples:
		var owner := OwnedInputs.new(_inputs(row.kind))
		var before := owner.data.duplicate(true)
		var result: Dictionary = COLLECTOR.collect(owner.readers(), row.profile, NOW)
		var label: String = row.kind + "/" + row.profile
		check(result.status == "READY", label + " complete proven inputs: " + str(result.missing))
		if result.payload == null: continue
		compare(result.payload, row.payload, label)
		check(result.payload.keys() == row.payload.keys(), label + " original root property order")
		for key in ["player", "inv", "game"]:
			check(result.payload[key].keys() == row.payload[key].keys(), label + " original " + key + " property order")
		compare(owner.data, before, label + "/source_unwritten")
		check(row.input_unchanged, label + " source JS also read only")
		check(not result.write_authorized and not result.main_connected, label + " no product writer")
		check(owner.reads.size() == (6 if row.profile == "demo500" else 8), label + " only consumed domain readers")
		for count in owner.reads.values(): check(count == 1, label + " each reader exactly once")
	observations.original_projections = samples.size()
	completed[current_group] = true

func _expect_hold(readers: Dictionary, label: String, reason: String = "", profile: String = "local", timestamp: Variant = NOW) -> void:
	var response: Dictionary = COLLECTOR.collect(readers, profile, timestamp)
	check(response.status == "HOLD" and response.payload == null and not response.write_authorized, label + " has no partial payload")
	if not reason.is_empty(): check(response.missing.has(reason), label + " exact missing domain: " + str(response.missing))

func _test_missing_owners_and_unsupported_inputs() -> void:
	for key in COLLECTOR.DOMAIN_READERS + ["raw_grit", "reward_bags"]:
		var owner := OwnedInputs.new(_inputs("populated"))
		var readers := owner.readers()
		readers.erase(key)
		_expect_hold(readers, "missing/" + key, "reader:" + key)
	var holder := OwnedInputs.new(_inputs("populated"))
	holder.raw.unpublish()
	_expect_hold(holder.readers(), "unpublished raw holder", "raw_grit:not_ready")
	var owner := OwnedInputs.new(_inputs("populated"))
	owner.data.P.erase("hp")
	_expect_hold(owner.readers(), "unknown required P field", "P.hp")
	owner = OwnedInputs.new(_inputs("populated"))
	owner.data.erase("BAG_MAX")
	_expect_hold(owner.readers(), "absent BAG_MAX authority", "globals.BAG_MAX")
	owner = OwnedInputs.new(_inputs("populated"))
	_expect_hold(owner.readers(), "no guessed wall clock", "timestamp_ms", "local", null)
	_expect_hold(owner.readers(), "unknown path profile", "unknown_profile", "other")
	var gone := GoneOwner.new()
	var readers := owner.readers()
	readers.current_p = Callable(gone, "read")
	gone.free()
	_expect_hold(readers, "freed provider", "reader:current_p")
	readers = owner.readers()
	readers.current_p = Callable(owner, "read") # one required argument, not a zero-arg reader
	_expect_hold(readers, "reader arity mismatch", "reader:current_p")
	owner.data.P.skills = "native UTF-16 spread unproven"
	_expect_hold(owner.readers(), "unsupported string spread", "unsupported_spread:skills")
	owner = OwnedInputs.new(_inputs("populated"))
	owner.data.INV.bag[0].foreign = Vector2(1,2)
	_expect_hold(owner.readers(), "unknown native item carrier", "unsupported_carrier:payload.inv.bag.0.foreign")
	owner = OwnedInputs.new(_inputs("populated"))
	var cycle: Dictionary = {}
	cycle.self = cycle
	owner.data.INV.bag[0].cycle = cycle
	_expect_hold(owner.readers(), "cycles are held, not silently erased", "cyclic_carrier:payload.inv.bag.0.cycle.self")
	cycle.clear() # break test-only ref cycle
	check(COLLECTOR.current_readers(null, null).is_empty(), "no guessed owner bundle for absent Main")
	# Evaluate the source expressions, rather than duplicating a collector rule.
	check(extra_probe.slotCases.size() == 10, "ten actual-source iterable boundary evaluations")
	for row in extra_probe.slotCases:
		owner = OwnedInputs.new(row.data)
		var result: Dictionary = COLLECTOR.collect(owner.readers(), row.profile, NOW)
		if row.threw:
			check(result.status == "HOLD" and result.payload == null and result.missing.has("unsupported_iterable:skillSlots"), "original non-iterable throws: " + row.kind + "/" + row.profile)
		else:
			check(result.status == "READY", "original direct assignment accepts carrier: " + row.kind + "/" + row.profile)
			if result.payload != null: compare(result.payload, row.payload, row.kind + "/" + row.profile)
		check(row.input_unchanged, "slot boundary source owner unchanged")
	observations.iterable_boundary_evaluations = extra_probe.slotCases.size()
	# Demo500 does not consume the source-absent raw/reward fields.
	owner = OwnedInputs.new(_inputs("populated"))
	readers = owner.readers()
	readers.erase("raw_grit"); readers.erase("reward_bags")
	check(COLLECTOR.collect(readers, "demo500", NOW).status == "READY", "Demo500 intentional raw/reward absence")
	completed[current_group] = true

func _test_detached_read_only_and_current_values() -> void:
	var owner := OwnedInputs.new(_inputs("populated"))
	var readers := owner.readers()
	var first: Dictionary = COLLECTOR.collect(readers, "demo", NOW)
	check(first.status == "READY", "initial detached payload")
	if first.payload == null: return
	first.payload.inv.bag[0].custom.flag = true
	first.payload.stats.str = 999
	first.payload.crystalBag[0].q = 1
	first.payload.player.passiveQueue.clear()
	check(not owner.data.INV.bag[0].custom.flag and owner.data.STATS.str == 12 and owner.data.CRYSTAL_BAG[0].q == 50 and owner.data.P._passiveQueue.size() == 6, "mutating returned nested data cannot write owners")
	owner.data.G.mats = 9876
	owner.data.INV.bag[0].custom.changed_after = true
	owner.raw.current_container()._grit = 8 # test-owned raw holder, not a derived getter
	var second: Dictionary = COLLECTOR.collect(readers, "demo", NOW+1)
	check(second.status == "READY", "subsequent collection")
	if second.payload == null: return
	check(second.payload.game.mats == 9876 and second.payload.grit == 8 and second.payload.ts == NOW+1 and second.payload.inv.bag[0].custom.changed_after, "current owner values read again, no cached snapshot")
	check(first.payload.game.mats == 4321 and first.payload.grit == 3 and not first.payload.inv.bag[0].custom.has("changed_after"), "prior detached snapshot stays unchanged")
	check(not first.payload.inv.has("selected") and not first.payload.player.has("rage") and not first.payload.game.has("stageTime") and first.payload.storage.is_empty(), "only source save fields; transient fields and shared storage excluded")
	owner.data.P.ap = NAN
	owner.data.G.playTime = NAN
	var nonfinite: Dictionary = COLLECTOR.collect(readers, "local", NOW)
	check(nonfinite.status == "READY" and nonfinite.payload.player.ap == 0 and nonfinite.payload.game.playTime == 0, "source JS NaN falsy fallback, not Godot container truthiness")
	owner.data.P.activeQSk = &""
	owner.data.P._passiveQueue = [&"pAtk", &"unknown", &"pAtk"]
	var native_strings: Dictionary = COLLECTOR.collect(readers, "cloud")
	check(native_strings.status == "READY" and native_strings.payload.activeQSk == "parry" and native_strings.payload.player.passiveQueue == ["pAtk", "pAtk"], "native StringName maps to source string carrier without owner writes")
	completed[current_group] = true

func _test_actual_main() -> void:
	seed(20261020) # test-only deterministic starter stream, no product RNG changes
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for index in 4: await process_frame
	check(main.source_state.is_native_new_run_state_ready() and main.source_providers.is_native_source_providers_ready(), "actual Main current State/Providers ready")
	var state: Node = main.source_state
	var raw: Object = main.source_providers.get_provider("raw_grit")
	var p: Dictionary = state.read_current_p()
	var inv: Dictionary = state.read_current_inventory()
	var raw_before: Dictionary = raw.read_raw().duplicate(true)
	var p_before := p.duplicate(true)
	var inv_before := inv.duplicate(true)
	var reads: Dictionary = COLLECTOR.current_readers(state, main.source_providers)
	check(reads.size() == 7 and not reads.has("save_globals"), "same current bundle has seven proven readers, globals not invented")
	var result: Dictionary = COLLECTOR.collect(reads, "local", NOW)
	check(result.status == "HOLD" and result.payload == null and result.missing == ["reader:save_globals"], "actual Main incomplete owners HOLD, no fake full save")
	check(result.readers_called.size() == 7, "all available current domains actually consumed once")
	compare(p, p_before, "actual/P_unwritten")
	compare(inv, inv_before, "actual/INV_unwritten")
	compare(raw.read_raw(), raw_before, "actual/raw_unwritten")
	check(is_same(p, state.read_current_p()) and is_same(inv, state.read_current_inventory()), "current owner references not replaced")
	observations.main = {"status": result.status, "missing": result.missing, "readers": result.readers_called, "raw_grit": raw_before, "equipped_slots": inv.equipped.size(), "userdir": OS.get_user_data_dir()}
	main.free()
	var lost: Dictionary = COLLECTOR.collect(reads, "local", NOW)
	check(lost.status == "HOLD" and lost.payload == null and lost.missing.size() > 1, "Main freed: no old or fabricated owner values published")
	for index in 2: await process_frame
	completed[current_group] = true

func compare(actual: Variant, expected: Variant, path: String) -> void:
	var numbers: bool = (actual is int or actual is float) and (expected is int or expected is float)
	check(numbers or typeof(actual) == typeof(expected), path + " type")
	if not numbers and typeof(actual) != typeof(expected): return
	if actual is Dictionary:
		var a: Array = actual.keys(); var b: Array = expected.keys()
		a.sort(); b.sort()
		check(a == b, path + " exact keys")
		for key in b:
			if actual.has(key): compare(actual[key], expected[key], path + "." + str(key))
	elif actual is Array:
		check(actual.size() == expected.size(), path + " exact array length")
		for index in mini(actual.size(), expected.size()): compare(actual[index], expected[index], path + "." + str(index))
	else:
		check(actual == expected, path + " exact value")
