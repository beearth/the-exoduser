extends SceneTree
## TI-01: literal layout assertions + emitted cases for the unmodified JS oracle.
## Main/pickup/UI/save are not exercised. Every fixture item/coordinate is explicit.
const LAYOUT = preload("res://scripts/native_inventory_layout.gd")
const CONTRACT = preload("res://scripts/native_inventory_contract.gd")
const STATE = preload("res://scripts/native_source_new_run_state.gd")
const RESOURCES = preload("res://scripts/native_source_resource_authority.gd")
const PARAMETERS = preload("res://port_modules/player_resource_parameters_source/producer.gd")
const ISOLATED_DIRECTORY = "EXODUSER-ti-01-Isolated-20261020"
# Independent literal oracle from latest main game.html:15176,15829-15834.
const SLOTS = ["weapon", "shield", "boots", "armor", "helmet", "bow", "gloves", "pants", "belt",
	"necklace", "ring1", "ring2", "cape", "bracelet", "headband", "ossuary", "headband2"]

class WorldFixture extends Node:
	var player: Node2D

class PlayerFixture extends Node2D:
	var state: String = "idle"
	var facing: Vector2 = Vector2.RIGHT
	var hp: float
	var max_hp: float
	var stamina: float = 0.0
	var max_stamina: float = 0.0
	var radius: float
	var iframes: float
	var world: Node
	func get_combat_world() -> Node:
		return world

var checks: int = 0
var failures: int = 0
var oracle_cases: int = 0
var current_group: String
var groups: Array = []

func _initialize() -> void:
	# Fail before creating fixtures or reading user:// when isolation is wrong.
	if OS.get_user_data_dir().get_file() != ISOLATED_DIRECTORY:
		push_error("TI01_INVALID_ISOLATION " + OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")

func _run() -> void:
	for group in ["sizes_categories_rows", "grid_skip_categories", "space_and_bounds", "source_order_edges", "read_only_actual_holder"]:
		current_group = group
		var before: int = checks
		var failed_before: int = failures
		call("_test_" + group)
		var row = {"group": group, "checks": checks - before, "failures": failures - failed_before}
		groups.append(row)
		print("TI01_GROUP_RESULT ", JSON.stringify(row))
	print("TI01_SUITE_RESULT ", JSON.stringify({"checks": checks, "failures": failures,
		"groups": groups, "oracle_cases_emitted": oracle_cases, "userdir": OS.get_user_data_dir(),
		"actual_holder": true, "actor_fixtures": true, "actual_Main": false,
		"coordinate_writes_by_layout": false, "pickup_or_save": false}))
	quit(0 if failures == 0 else 1)

func _expect(actual: Variant, expected: Variant, label: String) -> void:
	checks += 1
	if actual != expected:
		failures += 1
		push_error("TI01_ASSERT_FAIL " + current_group + ": " + label + " actual=" + str(actual) + " expected=" + str(expected))

func _case(request: Dictionary) -> Variant:
	var actual: Variant
	var bag: Array = request.get("bag", [])
	var limit: int = request.get("bag_max", 300) # Test oracle input, not a product default.
	match request["op"]:
		"size": actual = LAYOUT.source_item_size(request["item"])
		"category": actual = LAYOUT.source_item_category(request["item"])
		"rows": actual = LAYOUT.source_inventory_rows(limit)
		"grid": actual = LAYOUT.build_grid(bag, request.get("skip", -1), request.get("item"), limit)
		"find": actual = LAYOUT.find_space(bag, request["w"], request["h"], request.get("skip", -1),
			LAYOUT.ITEM_FROM_SKIP if request.get("default_item", false) else request.get("item"), limit)
		"place": actual = LAYOUT.can_place(bag, request["index"], request["x"], request["y"], limit)
	oracle_cases += 1
	print("TI01_ORACLE_CASE ", JSON.stringify({"id": oracle_cases, "request": request, "actual": actual}))
	return actual

func _test_sizes_categories_rows() -> void:
	for slot in SLOTS:
		_expect(_case({"op": "size", "item": {"slot": slot}}), [2, 2], "slot " + slot)
	for kind in ["sword", "dagger", "hammer", "mace", "club", "axe", "spear"]:
		_expect(_case({"op": "size", "item": {"slot": "weapon", "wtype": kind}}), [2, 2], kind)
	for kind in ["crossbow", "repeater", "arcane"]:
		_expect(_case({"op": "size", "item": {"slot": "bow", "btype": kind}}), [2, 2], kind)
	for item in [{"slot": "weapon", "wtype": "future"}, {"slot": "bow", "btype": "future"}]:
		_expect(_case({"op": "size", "item": item}), [2, 2], "unknown subtype uses slot")
	for item in [{}, {"slot": "bonePart"}, {"slot": "future", "wtype": "sword"}, {"slot": "future", "btype": "arcane"}]:
		_expect(_case({"op": "size", "item": item}), [1, 1], "unsupported slot does not borrow subtype")
	for item in [{"slot": "ossuary"}, {"slot": "bonePart"}]:
		_expect(_case({"op": "category", "item": item}), "ossuary", "ossuary category")
	for item in [{}, {"slot": "weapon"}, {"slot": "future"}]:
		_expect(_case({"op": "category", "item": item}), "equipment", "equipment category")
	# Null is a source TypeError, not the normal unknown-slot [1,1] fallback.
	_expect(LAYOUT.source_item_size(null), null, "null item is not a size fallback")
	_expect(LAYOUT.source_item_category(null), null, "null item is not equipment")
	for row in [[300, 120], [24, 10], [26, 11], [30, 12], [301, 121], [0, 10], [-1, 10]]:
		_expect(_case({"op": "rows", "bag_max": row[0]}), row[1], "external bag_max " + str(row[0]))

func _test_grid_skip_categories() -> void:
	var weapon = {"slot": "weapon", "_gx": 0, "_gy": 0}
	var bone = {"slot": "bonePart", "_gx": 0, "_gy": 0}
	var bag: Array = [weapon, null, bone, {"slot": "helmet"}, {"slot": "armor", "_gx": 2}]
	var grid: Array = _case({"op": "grid", "bag": bag, "skip": 0, "item": weapon, "bag_max": 24})
	_expect(grid.size(), 10, "minimum rows")
	_expect(grid[0].size(), 10, "ten columns")
	_expect([grid[0][0], grid[0][1], grid[1][0], grid[1][1], grid[0][2]], [0, 0, 0, 0, -1], "grid includes skipped item's original index")
	grid = _case({"op": "grid", "bag": bag, "item": bone, "bag_max": 24})
	_expect([grid[0][0], grid[0][1]], [2, -1], "category filter keeps original index2")
	grid = _case({"op": "grid", "bag": bag, "item": null, "bag_max": 24})
	_expect([grid[0][0], grid[0][1]], [2, 0], "explicit null combines categories; later record wins")
	grid[0][0] = 999 # Caller may edit the returned grid, not any inventory input.
	_expect(LAYOUT.build_grid(bag, -1, bone, 24)[0][0], 2, "fresh grid and rows are independent")
	_expect(_case({"op": "find", "bag": [weapon], "w": 2, "h": 2, "item": {"slot": "armor"}, "bag_max": 24}), {"x": 2, "y": 0}, "equipment next position")
	_expect(_case({"op": "find", "bag": [weapon], "w": 1, "h": 1, "item": bone, "bag_max": 24}), {"x": 0, "y": 0}, "bone grid ignores equipment")
	_expect(_case({"op": "find", "bag": [bone], "w": 2, "h": 2, "item": {"slot": "ossuary"}, "bag_max": 24}), {"x": 1, "y": 0}, "ossuary collides with bone")
	_expect(_case({"op": "find", "bag": [weapon], "w": 2, "h": 2, "skip": 0, "default_item": true, "bag_max": 24}), {"x": 0, "y": 0}, "omitted item resolves bag[skip]")


	var default_bag: Array = [weapon, {"slot": "bonePart"}]
	_expect(_case({"op": "find", "bag": default_bag, "w": 1, "h": 1, "skip": 1, "default_item": true, "bag_max": 24}), {"x": 0, "y": 0}, "default item derives the bone category")
	_expect(_case({"op": "find", "bag": default_bag, "w": 1, "h": 1, "skip": 1, "item": null, "bag_max": 24}), {"x": 2, "y": 0}, "explicit null does not derive the bone category")

func _test_space_and_bounds() -> void:
	var bag: Array = [{"slot": "weapon"}]
	for row in [[8, 118, true], [9, 118, false], [8, 119, false], [-1, 0, false], [0, -1, false]]:
		_expect(_case({"op": "place", "bag": bag, "index": 0, "x": row[0], "y": row[1], "bag_max": 300}), row[2], "2x2 boundary " + str(row))
	_expect(_case({"op": "place", "bag": [null], "index": 0, "x": 0, "y": 0, "bag_max": 24}), false, "null bag item cannot be placed")
	_expect(_case({"op": "place", "bag": bag, "index": 3, "x": 0, "y": 0, "bag_max": 24}), false, "missing index")

	_expect(_case({"op": "find", "bag": [], "w": 11, "h": 2, "item": null, "bag_max": 24}), null, "too wide")
	_expect(_case({"op": "find", "bag": [], "w": 2, "h": 11, "item": null, "bag_max": 24}), null, "too tall")
	var filled: Array = []
	for y in range(0, 10, 2):
		for x in range(0, 10, 2):
			filled.append({"slot": "armor", "_gx": x, "_gy": y})
	_expect(_case({"op": "find", "bag": filled, "w": 2, "h": 2, "item": {"slot": "weapon"}, "bag_max": 24}), null, "no space")
	filled[24].erase("_gx")
	_expect(_case({"op": "find", "bag": filled, "w": 2, "h": 2, "item": {"slot": "weapon"}, "bag_max": 24}), {"x": 8, "y": 8}, "last remaining space")
	var many: Array = []
	many.resize(301)
	_expect(_case({"op": "find", "bag": many, "w": 2, "h": 2, "item": {"slot": "armor"}, "bag_max": 300}), {"x": 0, "y": 0}, "not a universal bag.length hard cap")

func _test_source_order_edges() -> void:
	var shared = {"slot": "armor", "_gx": 0, "_gy": 0}
	var overlaps: Array = [shared, shared]
	_expect(_case({"op": "place", "bag": overlaps, "index": 0, "x": 0, "y": 0, "bag_max": 24}), false, "skip0 does not remove same-identity index1")
	_expect(_case({"op": "place", "bag": overlaps, "index": 1, "x": 0, "y": 0, "bag_max": 24}), true, "last written index1 is allowed even over index0 (source order)")
	var edge_bag: Array = [{"slot": "armor", "_gx": 9, "_gy": 9}]
	var grid: Array = _case({"op": "grid", "bag": edge_bag, "item": null, "bag_max": 24})
	_expect(grid[9][9], 0, "source clips upper out-of-range cells")
	grid = _case({"op": "grid", "bag": [{"slot": "armor", "_gx": -1, "_gy": 0}], "item": null, "bag_max": 24})
	_expect([grid[0][0], grid[0][9]], [0, -1], "negative x property is not Python/Godot wraparound")
	grid = _case({"op": "grid", "bag": [{"slot": "armor", "_gx": 0.5, "_gy": 0}], "item": null, "bag_max": 24})
	_expect(grid[0], [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1], "fractional x Array properties are not indexed cells")
	_expect(LAYOUT.build_grid([{"slot": "armor", "_gx": 0, "_gy": -1}], -1, null, 24), null, "source-invalid row cannot wrap")
	_expect(LAYOUT.build_grid([{"slot": "armor", "_gx": "0", "_gy": 0}], -1, null, 24), null, "unsupported native coordinate type is not normalized")
	_expect(LAYOUT.find_space([], 0, 2, -1, null, 24), null, "native dimensions require positive integers")
	_expect(LAYOUT.build_grid([true], -1, null, 24), null, "truthy non-item not silently accepted")
	_expect(_case({"op": "grid", "bag": [null, false, 0, ""], "item": null, "bag_max": 24})[0][0], -1, "source falsy holes skipped")
	# A deterministic input matrix; its parity is verified against actual JS,
	# separately from the literal assertions above, never counted as fake PASS.
	for max_count in [24, 26, 30, 300, 301]:
		for slot in ["weapon", "bonePart"]:
			for skip in [-1, 0]:
				_case({"op": "find", "bag": [{"slot": "weapon", "_gx": 0, "_gy": 0},
					{"slot": "bonePart", "_gx": 0, "_gy": 0}], "w": 2, "h": 2,
					"skip": skip, "item": {"slot": slot}, "bag_max": max_count})

func _test_read_only_actual_holder() -> void:
	var world = WorldFixture.new()
	var player = PlayerFixture.new()
	var boot_p: Dictionary = STATE.source_boot_p()["values"]
	player.hp = boot_p["hp"]
	player.max_hp = boot_p["mhp"]
	player.radius = boot_p["r"]
	player.iframes = boot_p["iframes"]
	player.world = world
	world.player = player
	var resources = RESOURCES.new()
	var state = STATE.new()
	var contract = CONTRACT.new()
	_expect(resources.initialize_new_run(player, world, PARAMETERS.source_boot_parameters()), true, "actual resource authority fixture")
	_expect(state.initialize_new_run(player, world, resources), true, "actual pre-Tree State fixture")
	_expect(contract.bind_source_state(state), true, "TI-00 read bridge binds actual holder")
	var inventory: Dictionary = contract.read_current_inventory()
	var item = {"slot": "weapon", "wtype": "sword", "_gx": 0, "_gy": 0, "fav": true,
		"junk": false, "future": {"nested": [null, 1, "opaque"]}}
	inventory["bag"].append(item) # Test-owned fixture write, not a layout writer.
	inventory["selected"] = 0
	var before: Dictionary = inventory.duplicate(true)
	var bag: Array = inventory["bag"]
	var equipped: Dictionary = inventory["equipped"]
	var oss_collect: Dictionary = inventory["ossCollect"]
	var nested: Dictionary = item["future"]
	var player_before: Array = [player.hp, player.max_hp, player.stamina, player.max_stamina, player.position]
	_expect(is_same(inventory, state.read_current_inventory()), true, "same actual INV reference")
	_expect(LAYOUT.find_space(bag, 2, 2, -1, item, 300), {"x": 2, "y": 0}, "read actual current bag via TI-00")
	_expect(LAYOUT.can_place(bag, 0, 8, 118, 300), true, "placement only queried")
	_expect(LAYOUT.can_place(bag, 0, -1, 0, 300), false, "failed placement also only queried")
	_expect(LAYOUT.find_space(bag, 11, 2, -1, item, 300), null, "failed space search also only queried")
	var returned_size: Array = LAYOUT.source_item_size(item)
	returned_size[0] = 99
	_expect(LAYOUT.source_item_size(item), [2, 2], "returned size cannot corrupt later lookup")
	_expect(inventory, before, "all input values/coords/fav/junk/selection unchanged")
	_expect(is_same(contract.read_current_inventory(), inventory), true, "no replacement INV")
	_expect(is_same(inventory["bag"], bag) and is_same(inventory["equipped"], equipped) and is_same(inventory["ossCollect"], oss_collect), true, "same child container references")
	_expect(is_same(bag[0], item) and is_same(item["future"], nested), true, "same item and opaque nested references")
	_expect([player.hp, player.max_hp, player.stamina, player.max_stamina, player.position], player_before, "no actor/resource writes")
	for node in [state, resources, player, world]:
		node.free()
	_expect(contract.read_current_inventory(), null, "fixture fully released")
