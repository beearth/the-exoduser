extends SceneTree
## IT-03: current crystalEffects -> existing resource adapter. Fixture writes only.
const Crystal := preload("res://port_modules/player_crystal_resource_source/producer.gd")
const Parameters := preload("res://port_modules/player_resource_parameters_source/producer.gd")
const Affix := preload("res://port_modules/equipment_affix_reader/producer.gd")
const USERDIR := "EXODUSER-it-03-Isolated-20261020"
var checks := 0
var failures := 0
var group := ""
var groups: Array = []
var oracle: Array = []
var model := Crystal.new()

class ResourceFixture extends RefCounted:
	var p := {"mp": 160.0, "st": 200.0}
	var inv := {"equipped": {}}
	var packets: Array = []
	func _init(crystals: Array) -> void:
		for slot in Affix.SLOT_NAMES:
			inv.equipped[slot] = null
		# Socket q must not affect this IT-03 consumer (IT-04 is separate).
		inv.equipped.ring1 = {"crystals": crystals, "socketQ": [100, 100, 100]}
	func player() -> Dictionary: return p
	func inventory() -> Dictionary: return inv
	func stats() -> Dictionary: return {"dex": 0.0, "int": 0.0}
	func passives() -> Dictionary: return {}
	func zero(_key: String = "") -> Dictionary: return {"status": "READY", "value": 0.0}
	func grit() -> float: return 0.0
	func sink(packet: Dictionary) -> bool:
		packets.append(packet.duplicate(true))
		for write in packet.writes:
			p[write.field] = write.value
		return true
	func providers() -> Dictionary:
		return {"player": player, "inventory": inventory, "stats": stats,
			"passives": passives, "eq_affix": zero, "eq_stat": zero,
			"lv_b": zero, "grit": grit}

func _initialize() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true \
			or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR \
			or OS.get_user_data_dir().get_file() != USERDIR:
		printerr("IT03_INVALID isolated directory required: ", OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("run")

func run() -> void:
	for name in ["tables", "quality_boundaries", "source_matrix", "empty_and_errors", "resource_consumer", "purity"]:
		group = name
		var before := checks
		var failed_before := failures
		call("test_" + name)
		groups.append({"group": name, "checks": checks - before, "failures": failures - failed_before})
	print("IT03_TABLES ", JSON.stringify(Crystal.source_tables()))
	print("IT03_ORACLE ", JSON.stringify(oracle))
	print("IT03_RESULT ", JSON.stringify({"checks": checks, "failures": failures,
		"groups": groups, "oracle_inputs": oracle.size(), "userdir": OS.get_user_data_dir(),
		"main_booted": false, "live_state_writes": 0, "fixture_sink_only": true,
		"source": "game.html:15289-15296,15316"}))
	quit(0 if checks > 0 and failures == 0 else 1)

func check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
		printerr("IT03_FAIL ", group, " ", label)

func near(actual: float, expected: float, label: String) -> void:
	check(absf(actual - expected) <= 1e-12 * maxf(1.0, absf(expected)), label)

func record(cr: Variant, result: Dictionary) -> void:
	var row := {"crystal": cr, "status": result.status, "effects": result.effects}
	if result.ready and result.has("mul"):
		row["mul_bits"] = PackedFloat64Array([result.mul]).to_byte_array().hex_encode()
		var bits: Array = []
		for effect in result.effects:
			bits.append(PackedFloat64Array([effect.value]).to_byte_array().hex_encode())
		row["effect_bits"] = bits
	oracle.append(row)

func test_tables() -> void:
	var json: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/item_generation_tables.json"))
	check(json is Dictionary, "existing readonly item JSON loads")
	if not json is Dictionary: return
	check(Crystal.support_readiness().ready and Crystal.CRYSTAL_IDS.size() == 18, "existing18 definitions ready")
	check(json.CRYSTAL_DEFS.keys() == Crystal.CRYSTAL_DEFS.keys(), "definition order unchanged")
	for id in Crystal.CRYSTAL_IDS:
		var source: Dictionary = json.CRYSTAL_DEFS[id]
		var native: Dictionary = Crystal.CRYSTAL_DEFS[id]
		check(source.cat == native.cat and source.opts.size() == native.opts.size(), "opts/cat " + id)
		for i in source.opts.size():
			check(source.opts[i][0] == native.opts[i][0] and source.opts[i][1] == native.opts[i][1], "option " + id + str(i))
	for i in 5:
		check(json.CRYSTAL_STAR[i].mul == Crystal.CRYSTAL_STAR_MUL[i], "star unchanged " + str(i))

func test_quality_boundaries() -> void:
	for row in [[1, .755], [50, 1.0], [100, 1.25], [0, 1.0], [-0.0, 1.0],
		[null, 1.0], [-1, .755], [101, 1.25], [40.5, .9525]]:
		var cr := {"id": "cr_deep_well", "star": 0, "enh": 0, "q": row[0]}
		var result: Dictionary = model.crystal_effects(cr)
		check(result.status == "READY" and result.effects.size() == 2, "quality ready " + str(row[0]))
		near(result.mul, row[1], "quality multiplier")
		near(result.effects[0].value, 5.0 * row[1], "mp quality value")
		near(result.effects[1].value, .03 * row[1], "mpR quality value")
		record(cr, result)
	var old := {"id": "cr_deep_well", "star": 2, "enh": 3}
	var legacy: Dictionary = model.crystal_effects(old)
	near(legacy.effects[0].value, 22.75, "old item without q remains neutral")
	record(old, legacy)
	for row in [[1, 113.25], [100, 187.5]]:
		var result: Dictionary = model.crystal_effects({"id": "cr_deep_well", "star": 4, "enh": 20, "q": row[0]})
		near(result.effects[0].value, row[1], "star4 enh20 quality extremes")

func test_source_matrix() -> void:
	for id in Crystal.CRYSTAL_IDS:
		for star in 5:
			for enh in [0, 3, 20]:
				for q in [1, 50, 100, 40.5, 0, null, -1, 101]:
					var cr := {"id": id, "star": star, "enh": enh, "q": q}
					var result: Dictionary = model.crystal_effects(cr)
					check(result.status == "READY" and result.effects.size() == Crystal.CRYSTAL_DEFS[id].opts.size(), "all source combinations ready " + id)
					for i in result.effects.size():
						check(result.effects[i].stat == Crystal.CRYSTAL_DEFS[id].opts[i][0], "source option order " + id)
					record(cr, result)

func test_empty_and_errors() -> void:
	for cr in [null, false, 0, "", {}, {"id": "missing", "star": 0, "q": "bad"},
		{"id": "cr_atk", "star": 0}, {"id": "cr_deep_well", "star": 5, "q": {}},
		{"id": "constructor", "star": 5, "q": true}]:
		var result: Dictionary = model.crystal_effects(cr)
		check(result.status == "READY_ORIGINAL_EMPTY" and result.ready and result.effects == [], "original empty before q " + str(cr))
		check(model.provide_crystal_effects(cr) == [], "original empty adapter")
		record(cr, result)
	for q in ["50", true, false, [], {}, NAN, INF, -INF]:
		var cr := {"id": "cr_deep_well", "star": 0, "q": q}
		var result: Dictionary = model.crystal_effects(cr)
		check(result.status == "NOT_READY" and not result.ready and result.effects == null and result.reason.begins_with("quality:"), "unsupported q fails without normal effects")
		check(model.provide_crystal_effects(cr) == null, "unsupported q adapter null")
	var thrown: Dictionary = model.crystal_effects({"id": "constructor", "star": 0, "q": "bad"})
	check(thrown.status == "SOURCE_THROW" and thrown.effects == null, "existing prototype error classification preserved")
	var nan_enh: Dictionary = model.crystal_effects({"id": "cr_deep_well", "star": 0, "enh": "abc", "q": 100})
	check(nan_enh.status == "SOURCE_NON_FINITE" and nan_enh.effects == null, "existing nonfinite enhancement status preserved")
	for enh in [null, false, "3", -10]:
		var cr := {"id": "cr_deep_well", "star": "2", "enh": enh, "q": 100}
		var result: Dictionary = model.crystal_effects(cr)
		check(result.status == "READY", "existing star/enh coercions unchanged")
		record(cr, result)

func bind(fixture: ResourceFixture, crystal: Variant) -> Variant:
	var parameters := Parameters.new()
	var augmented: Dictionary = crystal.with_crystal_effects_provider(fixture.providers())
	check(augmented.ok, "existing adapter installs")
	check(parameters.configure(augmented.providers, fixture.sink).ready, "existing resource parameters ready")
	return parameters

func test_resource_consumer() -> void:
	var crystals := [null, {"id": "cr_deep_well", "star": 0, "q": 100},
		{"id": "cr_last_breath", "star": 0, "enh": 20, "q": 1}]
	var fixture := ResourceFixture.new(crystals)
	var inventory_before: Dictionary = fixture.inv.duplicate(true)
	var crystal := Crystal.new()
	var parameters: Variant = bind(fixture, crystal)
	var result: Dictionary = parameters.run_apply_stats()
	check(result.ready and result.dispatched == [Parameters.KIND_APPLY_STATS, Parameters.KIND_INVALIDATE, Parameters.KIND_RECALC_ST], "existing dispatch order")
	near(fixture.p._crystalStats.mp, 6.25, "quality used exactly once; socket not applied")
	near(fixture.p._crystalStats.st, 11.325, "quality after enhancement")
	near(fixture.p.mpR, .05 + .0375 / 60.0, "source MP regeneration")
	near(fixture.p.stR, .05 + .06795 / 60.0, "source ST regeneration")
	check(fixture.p.mmp == 106 and fixture.p.mp == 106 and fixture.p.mst == 111 and fixture.p.st == 111, "original resource integer truncation/caps")
	check(fixture.inv == inventory_before and is_same(fixture.inv.equipped.ring1.crystals, crystals), "consumer preserves inventory values and identity")
	var calls: Array = crystal.call_log()
	check(calls.size() == 2 and calls[0].id == "cr_deep_well" and calls[1].id == "cr_last_breath", "original crystal iteration order and null skip")
	parameters.clear()
	# A later unsupported crystal must prevent the whole first packet dispatch.
	fixture = ResourceFixture.new([crystals[1], {"id": "cr_last_breath", "star": 0, "q": "bad"}])
	var before: Dictionary = fixture.p.duplicate(true)
	parameters = bind(fixture, Crystal.new())
	result = parameters.run_apply_stats()
	check(not result.ready and result.reason == "crystal_effects_not_array" and result.dispatched.is_empty() and result.phase1.packet == null, "unsupported quality refuses resource packet")
	check(fixture.p == before and fixture.packets.is_empty() and parameters.dispatch_count() == 0, "no partial fixture writes")
	parameters.clear()
	# Initial equipment/legacy q omission keeps the old neutral results.
	fixture = ResourceFixture.new([{"id": "cr_deep_well", "star": 0}])
	parameters = bind(fixture, Crystal.new())
	check(parameters.run_apply_stats().ready and fixture.p.mmp == 105 and fixture.p.mst == 100, "legacy neutral initial caps")
	near(fixture.p.mpR, .0505, "legacy neutral initial regeneration")
	parameters.clear()

func test_purity() -> void:
	var cr := {"id": "cr_deep_well", "star": 2, "enh": 3, "q": 100, "extra": {"keep": [1, 2]}}
	var before: Dictionary = cr.duplicate(true)
	var nested: Array = cr.extra.keep
	var first: Dictionary = model.crystal_effects(cr)
	first.effects[0].value = -999
	var second: Dictionary = model.crystal_effects(cr)
	check(cr == before and is_same(cr.extra.keep, nested), "nested input unchanged")
	near(second.effects[0].value, 28.4375, "result mutation cannot change definition or input")
	check(root.get_child_count() == 0, "no Main or live nodes created")
