extends SceneTree
## TI-00 isolated holder tests. The actors below are explicit fixtures, not Main.
## Run from an isolated project whose application custom user directory matches
## ISOLATED_DIRECTORY. This test never writes override.cfg or ProjectSettings.

const CONTRACT = preload("res://scripts/native_inventory_contract.gd")
const STATE = preload("res://scripts/native_source_new_run_state.gd")
const RESOURCES = preload("res://scripts/native_source_resource_authority.gd")
const PARAMETERS = preload("res://port_modules/player_resource_parameters_source/producer.gd")
const BOOTSTRAP = preload("res://port_modules/native_new_run_bootstrap_source/producer.gd")
const ISOLATED_DIRECTORY = "EXODUSER-ti-00-Isolated-20261020"
# game.html:15176. A literal oracle, not the producer used by the adapter.
const EXPECTED_SLOTS = ["weapon", "shield", "boots", "armor", "helmet", "bow",
	"gloves", "pants", "belt", "necklace", "ring1", "ring2", "cape", "bracelet",
	"headband", "ossuary", "headband2"]

class WorldFixture extends Node:
	var player: Node2D

class PlayerFixture extends Node2D:
	var state: String = "idle" # player.gd:68
	var facing: Vector2 = Vector2.RIGHT # player.gd:69
	var hp: float
	var max_hp: float
	var stamina: float = 0.0 # Installed by the actual ResourceAuthority.
	var max_stamina: float = 0.0
	var radius: float
	var iframes: float
	var world: Node
	func get_combat_world() -> Node:
		return world

class ForeignStateFixture extends Node:
	var getter_calls: int = 0
	func read_current_inventory() -> Variant:
		getter_calls += 1
		return {}

var checks: int = 0
var failures: int = 0
var current_group: String = ""
var rows: Array = []

func _initialize() -> void:
	# This must precede fixture creation and all access to any user:// resource.
	if OS.get_user_data_dir().get_file() != ISOLATED_DIRECTORY:
		push_error("TI00_INVALID_ISOLATION " + OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")

func _run() -> void:
	for id in ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08", "T09", "T10"]:
		current_group = "TI00-" + id
		var before_checks: int = checks
		var before_failures: int = failures
		await call("_test_" + id)
		var row: Dictionary = {"group": current_group,
			"checks": checks - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("TI00_GROUP_RESULT " + JSON.stringify(row))
	print("TI00_SUITE_RESULT " + JSON.stringify({"groups": rows.size(),
		"checks": checks, "failures": failures, "results": rows,
		"userdir": OS.get_user_data_dir(), "actual_holder": true,
		"actual_resource_authority": true, "actor_fixtures": true,
		"actual_Main": false, "save_io": false, "gameplay_acceptance": false}))
	quit(0 if failures == 0 else 1)

func check(condition: bool, label: String) -> bool:
	checks += 1
	if not condition:
		failures += 1
		push_error("TI00_ASSERT_FAIL " + current_group + ": " + label)
	return condition

func _make_fixture() -> Dictionary:
	var world = WorldFixture.new()
	var player = PlayerFixture.new()
	var boot_p: Dictionary = STATE.source_boot_p()["values"]
	player.hp = float(boot_p["hp"])
	player.max_hp = float(boot_p["mhp"])
	player.radius = float(boot_p["r"])
	player.iframes = float(boot_p["iframes"])
	player.world = world
	world.player = player
	var resources = RESOURCES.new()
	var state = STATE.new()
	var fixture: Dictionary = {"world": world, "player": player,
		"resources": resources, "state": state}
	if not check(resources.initialize_new_run(player, world, PARAMETERS.source_boot_parameters()),
			"actual ResourceAuthority accepts original boot parameters before Tree"):
		_free_fixture(fixture)
		return {}
	if not check(state.initialize_new_run(player, world, resources),
			"actual State initializes once with the same fixture Player/World/resources"):
		_free_fixture(fixture)
		return {}
	if not check(state.read_current_inventory() is Dictionary,
			"actual pre-Tree getter is available without startup, assets or Main"):
		_free_fixture(fixture)
		return {}
	return fixture

func _free_fixture(fixture: Dictionary) -> void:
	for key in ["state", "resources", "player", "world"]:
		var value: Variant = fixture.get(key)
		if is_instance_valid(value):
			value.free()

func _metadata(node: Node) -> Dictionary:
	var values: Dictionary = {}
	for name in node.get_meta_list():
		values[name] = node.get_meta(name)
	return values

func _actor_values(player: Node2D) -> Dictionary:
	return {"hp": player.hp, "max_hp": player.max_hp,
		"stamina": player.stamina, "max_stamina": player.max_stamina,
		"radius": player.radius, "iframes": player.iframes,
		"state": player.state, "facing": player.facing,
		"position": player.position, "parent": player.get_parent()}

func _test_T01() -> void:
	var contract = CONTRACT.new()
	var slots: Array = contract.source_slot_names()
	check(slots == EXPECTED_SLOTS and slots.size() == 17, "G:15176 exact canonical 17-slot order")
	var unique: Dictionary = {}
	for slot in slots:
		unique[slot] = true
	check(unique.size() == 17, "canonical slot names have no duplicates")
	slots[0] = "caller_changed"
	slots.append("future")
	check(contract.source_slot_names() == EXPECTED_SLOTS, "returned array cannot modify canonical slots")
	check(not is_same(slots, contract.source_slot_names()), "slot API returns a separate array")

func _test_T02() -> void:
	# G:16174-16179 literal and G:63948 fresh reset have the same key set.
	var literal: Dictionary = BOOTSTRAP.source_fresh_reset_inv()["values"]
	check(literal.size() == 4 and literal.has_all(["bag", "equipped", "selected", "ossCollect"]),
		"fresh source INV has exactly the four original fields")
	check(literal["bag"] is Array and literal["bag"].is_empty(), "fresh source bag is empty")
	check(literal["selected"] == null and literal["ossCollect"] == {}, "fresh selected null and empty ossCollect")
	var equipped: Dictionary = literal["equipped"]
	check(equipped.size() == 17 and equipped.has_all(EXPECTED_SLOTS), "fresh equipped is the 17-slot key set")
	for slot in EXPECTED_SLOTS:
		check(equipped[slot] == null, "fresh " + slot + " is null")
	var f: Dictionary = _make_fixture()
	if f.is_empty(): return
	var actual: Dictionary = f.state.read_current_inventory()
	check(actual == literal and actual["equipped"].has_all(EXPECTED_SLOTS),
		"actual initialized holder matches fresh literal without comparing key insertion order")
	_free_fixture(f)

func _test_T03() -> void:
	var f: Dictionary = _make_fixture()
	if f.is_empty(): return
	var contract = CONTRACT.new()
	check(contract.bind_source_state(f.state), "bind the actual State script")
	check(not f.state.is_inside_tree() and not f.player.is_inside_tree()
		and not f.state.is_native_new_run_state_ready(), "test is the pre-Tree seam, not Main readiness")
	var actual: Dictionary = f.state.read_current_inventory()
	var observed: Variant = contract.read_current_inventory()
	check(is_same(observed, actual), "adapter returns the identical INV Dictionary")
	for key in ["bag", "equipped", "ossCollect"]:
		check(is_same(observed[key], actual[key]), "identical nested owner reference: " + key)
	check(not actual.is_read_only() and not actual["equipped"].is_read_only()
		and not actual["bag"].is_read_only(), "reading does not freeze owner containers")
	_free_fixture(f)

func _test_T04() -> void:
	var f: Dictionary = _make_fixture()
	if f.is_empty(): return
	var contract = CONTRACT.new()
	contract.bind_source_state(f.state)
	var actual: Dictionary = f.state.read_current_inventory()
	# These writes create explicit test-owned nonempty/unknown-field fixtures.
	var future: Dictionary = {"list": [1, null, "x"]}
	var item: Dictionary = {"slot": "future_slot", "_future": future,
		"futureScalar": 123, "_gx": 9, "_gy": 17, "fav": true, "junk": false}
	actual["bag"].append(item)
	actual["equipped"]["weapon"] = item
	actual["equipped"]["future_slot"] = {"unrecognized": [42]}
	actual["selected"] = "eq:weapon"
	actual["futureTop"] = {"nested": [null, "kept"]}
	actual["ossCollect"]["future_part"] = {"r": 3, "t": 4, "extra": [99]}
	var before: Dictionary = actual.duplicate(true)
	var observed: Variant = contract.read_current_inventory()
	check(is_same(observed, actual) and is_same(observed["bag"][0], item)
		and is_same(observed["equipped"]["weapon"], item), "nonempty bag/equipped preserve item alias identity")
	check(is_same(observed["bag"][0]["_future"], future)
		and is_same(observed["bag"][0]["_future"]["list"], future["list"]), "unknown nested Dictionary/Array references survive")
	check(observed == before and item["futureScalar"] == 123,
		"unknown top-level/slot/item fields and existing coordinates/fav/junk/selected are untouched")
	check(observed["bag"][0]["_future"]["list"] == [1, null, "x"], "unknown null/scalar/list values survive")
	for count in range(3):
		check(is_same(contract.read_current_inventory(), actual) and actual == before,
			"repeated read " + str(count) + " neither normalizes nor mutates")
	_free_fixture(f)

func _test_T05() -> void:
	var f: Dictionary = _make_fixture()
	if f.is_empty(): return
	var contract = CONTRACT.new()
	contract.bind_source_state(f.state)
	var old: Dictionary = f.state.read_current_inventory()
	var item: Dictionary = {"slot": "armor", "futureScalar": 123}
	old["bag"].append(item)
	check(is_same(contract.read_current_inventory()["bag"][0], item), "current bag append is visible immediately")
	item["futureScalar"] = 456
	old["bag"].append({"slot": "bonePart"})
	check(contract.read_current_inventory()["bag"][0]["futureScalar"] == 456
		and contract.read_current_inventory()["bag"].size() == 2, "changed current item and bag are observed without cache")
	var replacement: Dictionary = BOOTSTRAP.source_fresh_reset_inv()["values"]
	replacement["selected"] = {"future_selection": [1]}
	# Rebinding the test-owned holder field verifies getter use on every call.
	f.state.set("_inventory", replacement)
	check(is_same(contract.read_current_inventory(), replacement)
		and not is_same(contract.read_current_inventory(), old), "owner current INV replacement does not return an old success")
	check(old["bag"].size() == 2 and item["futureScalar"] == 456, "read does not rewrite the previously observed object")
	check(is_same(contract.read_current_inventory()["selected"], replacement["selected"]),
		"admission requires a selected key without normalizing its value")
	_free_fixture(f)

func _test_T06() -> void:
	var contract = CONTRACT.new()
	check(contract.read_current_inventory() == null, "unbound read is null, not a fresh INV")
	var f: Dictionary = _make_fixture()
	if f.is_empty(): return
	contract.bind_source_state(f.state)
	var plain: Node = Node.new()
	check(not contract.bind_source_state(plain) and contract.read_current_inventory() == null,
		"ordinary Node is rejected and previous binding is cleared")
	plain.free()
	contract.bind_source_state(f.state)
	var foreign = ForeignStateFixture.new()
	check(not contract.bind_source_state(foreign) and contract.read_current_inventory() == null
		and foreign.getter_calls == 0, "foreign getter script is rejected before calling it; no old fallback")
	foreign.free()
	var uninitialized = STATE.new()
	check(contract.bind_source_state(uninitialized), "exact uninitialized State can bind structurally")
	check(contract.read_current_inventory() == null, "uninitialized owner null remains null")
	uninitialized.free()
	check(not contract.bind_source_state(null) and contract.read_current_inventory() == null,
		"null replacement leaves the adapter unbound")
	_free_fixture(f)

func _test_T07() -> void:
	var first: Dictionary = _make_fixture()
	if first.is_empty(): return
	var second: Dictionary = _make_fixture()
	if second.is_empty():
		_free_fixture(first)
		return
	var contract = CONTRACT.new()
	contract.bind_source_state(first.state)
	var old: Dictionary = contract.read_current_inventory()
	check(contract.bind_source_state(second.state)
		and is_same(contract.read_current_inventory(), second.state.read_current_inventory())
		and not is_same(contract.read_current_inventory(), old), "rebind reads only the second actual owner")
	second.state.queue_free()
	check(second.state.is_queued_for_deletion() and contract.read_current_inventory() == null,
		"queued owner is rejected before deferred deletion")
	check(not contract.bind_source_state(second.state), "queued owner cannot bind")
	await process_frame
	check(not is_instance_valid(second.state) and contract.read_current_inventory() == null,
		"freed queued owner never falls back to a cached INV")
	contract.bind_source_state(first.state)
	first.resources.free()
	check(first.state.read_current_inventory() == null and contract.read_current_inventory() == null,
		"actual getter null after ResourceAuthority free stays null")
	first.state.free()
	check(contract.read_current_inventory() == null, "WeakRef permits explicit owner free and reads null")
	_free_fixture(first)
	_free_fixture(second)

func _test_T08() -> void:
	var f: Dictionary = _make_fixture()
	if f.is_empty(): return
	var contract = CONTRACT.new()
	contract.bind_source_state(f.state)
	var actual: Dictionary = f.state.read_current_inventory()
	for key in ["bag", "equipped", "selected", "ossCollect"]:
		var saved: Variant = actual[key]
		actual.erase(key)
		var missing_before: Dictionary = actual.duplicate(true)
		check(contract.read_current_inventory() == null and actual == missing_before
			and not actual.has(key), "missing " + key + " rejects without automatic repair")
		actual[key] = saved
	for key in ["bag", "equipped", "ossCollect"]:
		var saved: Variant = actual[key]
		for bad in [null, 7, "wrong", {} if key == "bag" else []]:
			actual[key] = bad
			var invalid_before: Dictionary = actual.duplicate(true)
			check(contract.read_current_inventory() == null and actual == invalid_before,
				"wrong " + key + " type " + str(typeof(bad)) + " rejects without repair")
		actual[key] = saved
	var equipped: Dictionary = actual["equipped"]
	for slot in EXPECTED_SLOTS:
		equipped.erase(slot)
		check(contract.read_current_inventory() == null and not equipped.has(slot),
			"missing canonical slot " + slot + " rejects without reinsertion")
		equipped[slot] = null
	check(is_same(contract.read_current_inventory(), actual), "only fixture repair restores admission")
	var empty: Dictionary = {}
	f.state.set("_inventory", empty)
	check(contract.read_current_inventory() == null and empty.is_empty(), "malformed owner INV stays empty, not fabricated")
	f.state.set("_inventory", actual)
	_free_fixture(f)

func _test_T09() -> void:
	var f: Dictionary = _make_fixture()
	if f.is_empty(): return
	var contract = CONTRACT.new()
	var actual: Dictionary = f.state.read_current_inventory()
	var inv_before: Dictionary = actual.duplicate(true)
	var actor_before: Dictionary = _actor_values(f.player)
	var resource_before: Dictionary = f.resources.get_snapshot()
	var state_before: Dictionary = f.state.get_snapshot()
	var meta_before: Array = [_metadata(f.player), _metadata(f.world),
		_metadata(f.state), _metadata(f.resources)]
	check(contract.bind_source_state(f.state), "bind succeeds without fixture owner writes")
	for repeat in range(5):
		check(is_same(contract.read_current_inventory(), actual), "read " + str(repeat) + " keeps owner identity")
	check(actual == inv_before and _actor_values(f.player) == actor_before,
		"normal reads preserve inventory and fixture actor resources/fields/parent")
	check(f.resources.get_snapshot() == resource_before and f.state.get_snapshot() == state_before,
		"normal reads preserve authority/holder observations, no initializer rerun")
	check([_metadata(f.player), _metadata(f.world), _metadata(f.state), _metadata(f.resources)] == meta_before,
		"binding and reads preserve metadata/WeakRef claims on all fixture Nodes")
	# Snapshot after the explicit fixture corruption, then measure failed reads only.
	actual.erase("selected")
	var invalid_before: Dictionary = actual.duplicate(true)
	for repeat in range(3):
		check(contract.read_current_inventory() == null, "malformed failed read " + str(repeat) + " stays null")
	check(actual == invalid_before and _actor_values(f.player) == actor_before
		and f.resources.get_snapshot() == resource_before, "failed reads preserve invalid INV and player/resources")
	check([_metadata(f.player), _metadata(f.world), _metadata(f.state), _metadata(f.resources)] == meta_before,
		"failed reads do not change ownership metadata")
	_free_fixture(f)

func _test_T10() -> void:
	var f: Dictionary = _make_fixture()
	if f.is_empty(): return
	var contract = CONTRACT.new()
	contract.bind_source_state(f.state)
	var refs: Array = [weakref(f.state), weakref(f.resources), weakref(f.player), weakref(f.world)]
	_free_fixture(f)
	for reference in refs:
		check(reference.get_ref() == null, "cleanup releases only an owned fixture Node")
	check(contract.read_current_inventory() == null, "adapter does not keep its State alive")
	check(OS.get_user_data_dir().get_file() == ISOLATED_DIRECTORY, "exact isolated directory remains active")
