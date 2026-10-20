extends SceneTree
## IT-04: real resource plans/adapter; all writes belong to local fixtures.
const Parameters := preload("res://port_modules/player_resource_parameters_source/producer.gd")
const Crystal := preload("res://port_modules/player_crystal_resource_source/producer.gd")
const Affix := preload("res://port_modules/equipment_affix_reader/producer.gd")
const USERDIR := "EXODUSER-it-04-Isolated-20261020"
var checks := 0
var failures := 0
var group := ""
var groups: Array = []
var oracle: Array = []

class CurrentInput extends RefCounted:
	var p := {"mp": 160.0, "st": 200.0}
	var inv := {"equipped": {}}
	var calls: Array = []
	var packets: Array = []
	var crystal := Crystal.new()
	var failure_at := -1
	var failure_packet: Variant = null
	func _init(equipped: Dictionary = {}) -> void:
		for slot in Affix.SLOT_NAMES:
			inv.equipped[slot] = equipped.get(slot)
	func player() -> Dictionary: return p
	func inventory() -> Dictionary: return inv
	func stats() -> Dictionary: return {"dex": 0.0, "int": 0.0}
	func passives() -> Dictionary: return {}
	func zero(_key: String = "") -> Dictionary: return {"status": "READY", "value": 0.0}
	func grit() -> float: return 0.0
	func effects(c: Variant) -> Variant:
		calls.append(c)
		if calls.size() == failure_at:
			return failure_packet
		return crystal.provide_crystal_effects(c)
	func sink(packet: Dictionary) -> bool:
		packets.append(packet.duplicate(true))
		for write in packet.writes:
			p[write.field] = write.value
		return true
	func providers(include_crystal: bool = true) -> Dictionary:
		var result := {"player": player, "inventory": inventory, "stats": stats,
			"passives": passives, "eq_affix": zero, "eq_stat": zero, "lv_b": zero, "grit": grit}
		if include_crystal:
			result["crystal_effects"] = effects
		return result

func _initialize() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true \
			or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR \
			or OS.get_user_data_dir().get_file() != USERDIR:
		printerr("IT04_INVALID isolated directory required: ", OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("run")

func run() -> void:
	for name in ["mixed_sockets", "source_matrix", "empty_and_legacy", "errors_atomic", "purity"]:
		group = name
		var before := checks
		var failed_before := failures
		call("test_" + name)
		groups.append({"group": name, "checks": checks - before, "failures": failures - failed_before})
	print("IT04_ORACLE ", JSON.stringify(oracle))
	print("IT04_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "groups": groups,
		"oracle_inputs": oracle.size(), "userdir": OS.get_user_data_dir(), "main_booted": false,
		"live_writes": 0, "fixture_sink_only": true, "source": "game.html:27934-27939,15322-15326"}))
	quit(0 if failures == 0 and checks > 0 else 1)

func check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
		printerr("IT04_FAIL ", group, " ", label)

func near(actual: float, expected: float, label: String) -> void:
	check(absf(actual - expected) <= 1e-12 * maxf(1.0, absf(expected)), label)

func bind(input: CurrentInput, include_crystal: bool = true) -> Variant:
	var parameters := Parameters.new()
	check(parameters.configure(input.providers(include_crystal), input.sink).ready, "original providers ready")
	return parameters

func record(eq: Dictionary, plan: Dictionary) -> void:
	if not plan.ready:
		return
	var cr: Dictionary = plan.values._crystalStats
	var bits := {}
	for stat in Parameters.CR_INIT_KEYS:
		bits[stat] = PackedFloat64Array([cr[stat]]).to_byte_array().hex_encode()
	oracle.append({"equipped": eq.duplicate(true), "sum_bits": bits})

func mixed_equipment() -> Dictionary:
	return {"ring1": {"crystals": [null, false, 0, "",
		{"id": "cr_deep_well", "star": 0, "q": 100, "tag": "A"},
		{"id": "cr_deep_well", "star": 0, "q": 50, "tag": "B"}],
		"socketQ": [{}, {}, {}, {}, 100, 100]},
		"ring2": {"crystals": [{"id": "cr_last_breath", "star": 0, "enh": 20, "q": 1, "tag": "C"}], "socketQ": [1]}}

func test_mixed_sockets() -> void:
	var eq := mixed_equipment()
	var input := CurrentInput.new(eq)
	var parameters: Variant = bind(input)
	var before: Dictionary = input.p.duplicate(true)
	var plan: Dictionary = parameters.plan_apply_stats()
	check(plan.ready and plan.packet != null, "mixed plan ready")
	near(plan.values._crystalStats.mp, 28.75, "gold resonance3 and silver mismatch2 each applied once")
	near(plan.values._crystalStats.mpR, .1725, "all options receive socket multiplier")
	near(plan.values._crystalStats.st, 11.325, "socket1 keeps quality/enhancement result")
	check(input.calls.size() == 3 and input.calls[0].tag == "A" and input.calls[1].tag == "B" and input.calls[2].tag == "C", "slot/index order and falsy holes skip")
	check(is_same(input.calls[0], eq.ring1.crystals[4]), "provider still receives original crystal reference, arity1")
	check(input.p == before and input.packets.is_empty(), "pure plan writes nothing")
	record(eq, plan)
	input.calls.clear()
	var run_result: Dictionary = parameters.run_apply_stats()
	check(run_result.ready and run_result.dispatched == [Parameters.KIND_APPLY_STATS, Parameters.KIND_INVALIDATE, Parameters.KIND_RECALC_ST], "existing dispatch order preserved")
	check(input.p.mmp == 128 and input.p.mp == 128 and input.p.mst == 111 and input.p.st == 111, "resource truncation and caps after socket sum")
	near(input.p.mpR, .052875, "MP regen after sum /60")
	near(input.p.stR, .0511325, "ST regen after sum /60")
	check(input.calls.size() == 3 and input.packets.size() == 3, "exactly one provider call per occupied crystal")
	parameters.clear()

func test_source_matrix() -> void:
	var index := 0
	var covered := {}
	for id in Crystal.CRYSTAL_IDS:
		for star in 5:
			for q in [1, 50, 100]:
				for socket_q in [1, 41, 100]:
					var slot: String = Affix.SLOT_NAMES[index % 17]
					covered[slot] = true
					var eq := {slot: {"crystals": [{"id": id, "star": star, "enh": (star % 2) * 20, "q": q}], "socketQ": [socket_q]}}
					var input := CurrentInput.new(eq)
					var parameters: Variant = bind(input)
					var plan: Dictionary = parameters.plan_apply_stats()
					check(plan.ready and input.calls.size() == 1, "18 definitions/5 stars/q/socket combinations ready")
					record(eq, plan)
					parameters.clear()
					index += 1
	check(index == 810 and covered.size() == 17, "all17 source slots covered")

func test_empty_and_legacy() -> void:
	for item in [null, {}, {"crystals": []}, {"crystals": [null, false, 0, ""], "socketQ": [{}, "bad", INF]}]:
		var input := CurrentInput.new({"ring1": item})
		var parameters: Variant = bind(input, false)
		var plan: Dictionary = parameters.plan_apply_stats()
		check(plan.ready and input.calls.is_empty(), "empty/falsy crystals need neither provider nor socket q")
		near(plan.values._crystalStats.mp, 0.0, "original empty sum")
		parameters.clear()
	for socket_q in [null, [], [null], [0], [-1], "bad"]:
		var eq := {"ring1": {"crystals": [{"id": "cr_deep_well", "star": 0}], "socketQ": socket_q}}
		var input := CurrentInput.new(eq)
		var parameters: Variant = bind(input)
		var plan: Dictionary = parameters.plan_apply_stats()
		check(plan.ready, "original non-array/short/fallback socket q ready")
		near(plan.values._crystalStats.mp, 5.0, "legacy q50/socket1 neutral")
		record(eq, plan)
		parameters.clear()

func test_errors_atomic() -> void:
	# Test both socket support loss and a bad later provider packet after valid effects.
	for mode in ["socket", "quality", "provider_null", "bad_array", "bad_field", "nonfinite", "overflow", "unknown_stat", "missing"]:
		var eq := {"ring1": {"crystals": [{"id": "cr_deep_well", "star": 0},
			{"id": "cr_last_breath", "star": 0}, {"id": "cr_oracle_pupil", "star": 0}], "socketQ": [1, 100, 1]}}
		var input := CurrentInput.new(eq)
		if mode == "socket": eq.ring1.socketQ[1] = "bad"
		if mode == "quality": eq.ring1.crystals[1].q = true
		if mode in ["provider_null", "bad_array", "bad_field", "nonfinite", "overflow", "unknown_stat"]:
			input.failure_at = 2
			if mode == "bad_array": input.failure_packet = [{"stat": "mp", "value": 5.0}, null]
			if mode == "bad_field": input.failure_packet = [{"stat": "mp", "value": "bad"}]
			if mode == "nonfinite": input.failure_packet = [{"stat": "mp", "value": NAN}]
			if mode == "overflow": input.failure_packet = [{"stat": "mp", "value": 1.7976931348623157e308}]
			if mode == "unknown_stat": input.failure_packet = [{"stat": "unknown", "value": 1.0}]
		var parameters: Variant = bind(input, mode != "missing")
		var p_before: Dictionary = input.p.duplicate(true)
		var inv_before: Dictionary = input.inv.duplicate(true)
		var result: Dictionary = parameters.run_apply_stats()
		check(not result.ready and result.dispatched.is_empty() and parameters.dispatch_count() == 0, "failed plan never dispatches " + mode)
		check(input.p == p_before and input.inv == inv_before and input.packets.is_empty(), "failed plan has no partial fixture/input writes " + mode)
		check(result.phase1.packet == null, "failed plan exposes no apply packet " + mode)
		if mode in ["socket", "quality"]:
			check(result.reason.begins_with("socket_multiplier_not_ready@1:") and input.calls.size() == 1, "socket is read before provider; later crystals not called")
		elif mode == "missing":
			check(result.reason == "provider_missing:crystal_effects" and input.calls.is_empty(), "missing provider not replaced with neutral effects")
		elif mode in ["nonfinite", "overflow", "unknown_stat"]:
			check(result.status == "NOT_READY" and result.reason.begins_with("crystal_sum_non_finite:") and input.calls.size() == 2, "invalid numerical packet refused before ~~ hides it")
		else:
			check(input.calls.size() == 2, "invalid effect packet stops subsequent providers")
		parameters.clear()

func test_purity() -> void:
	var eq := mixed_equipment()
	var input := CurrentInput.new(eq)
	var before: Dictionary = input.inv.duplicate(true)
	var array: Array = eq.ring1.crystals
	var crystal: Dictionary = array[4]
	var parameters: Variant = bind(input)
	var first: Dictionary = parameters.plan_apply_stats()
	first.values._crystalStats.mp = -999.0
	var second: Dictionary = parameters.plan_apply_stats()
	near(second.values._crystalStats.mp, 28.75, "fresh plan is detached from previous result")
	check(input.inv == before and is_same(input.inv.equipped.ring1.crystals, array) and is_same(array[4], crystal), "all input values/nested identities retained")
	check(input.packets.is_empty() and root.get_child_count() == 0, "no sink dispatch or Main nodes from pure queries")
	parameters.clear()
