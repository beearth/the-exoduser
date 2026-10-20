extends SceneTree
## Independent native construction fixtures; no public session/input/report access.

const FactoryScript = preload("res://scripts/enemy_factory.gd")
const WorldScript = preload("res://scripts/world.gd")
const CrawlerScript = preload("res://scripts/enemy_melee_flesh_crawler.gd")
const IceScript = preload("res://scripts/enemy_tank_ice_soul_flame.gd")
const SpineScript = preload("res://scripts/enemy_tank_physical_spine_beast.gd")
const HiveScript = preload("res://scripts/enemy_archer_lightning_hive_bloater.gd")
const PhysicalScript = preload("res://scripts/enemy_projectile_physical.gd")
const PlayerScript = preload("res://scripts/player.gd")
const MainScript = preload("res://scripts/main.gd")
const STEP = 1.0 / 60.0
const PROFILE = "native_ch1_etype0_physical_flesh_crawler_v1"
const SOURCE_SHA = "91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa"
const CONFIG_SHA = "f8b0a168d2c7cb39ede3a0acf4942ff73a0016f70cc58ac581b3a29a96508300"

class RecordingTarget extends Node2D:
	var hp = 350
	var radius = 15.0
	var iframes = 0.0
	var state = "idle"
	var packets: Array = []
	var burn_requests: Array = []

	func receive_damage(amount: int, kind: String = "phys", direction: Vector2 = Vector2.ZERO, impulse: float = -1.0) -> void:
		# A request sink, not an HP oracle or a simulated public player.
		packets.append({"amount": amount, "kind": kind, "direction": direction, "impulse": impulse})

	func apply_native_burn(total_damage: float) -> bool:
		# game.html:35091 appends redBean burn separately after the damage request.
		burn_requests.append(total_damage)
		return true

class TechnicalWorld extends Node2D:
	var target: Node2D
	var actor: Node2D
	var _los: bool
	var _blocked: bool

	func _init(los: bool = true, blocked: bool = false) -> void:
		_los = los
		_blocked = blocked

	func has_line_of_sight(_from: Vector2, _to: Vector2) -> bool:
		return _los

	func can_move(_position: Vector2, _radius: float) -> bool:
		return not _blocked

	func is_world_blocked(_position: Vector2) -> bool:
		return _blocked

	func get_path_direction(world_position: Vector2) -> Vector2:
		return (target.global_position - world_position).normalized() if is_instance_valid(target) else Vector2.ZERO

	func get_enemies() -> Array:
		return [actor] if is_instance_valid(actor) else []

var _source: Dictionary
var _config: Dictionary
var _combat: Dictionary
var _selected: Array[String] = []
var _failures = 0
var _passes = 0
var _case_name = ""
var _explicit_native_calls = 0

func _initialize() -> void:
	paused = true
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			for item in argument.trim_prefix("--only=").split(","):
				_selected.append(item)
	call_deferred("_run")

func _run() -> void:
	_source = JSON.parse_string(FileAccess.get_file_as_string("res://data/encounters.json"))
	_config = JSON.parse_string(FileAccess.get_file_as_string("res://data/etype0_physical_flesh_crawler.json"))
	_combat = JSON.parse_string(FileAccess.get_file_as_string("res://data/combat.json"))
	for case_name in ["admission", "native_clock", "shield_packet"]:
		if not _selected.is_empty() and not _selected.has(case_name):
			continue
		_case_name = case_name
		var before = _failures
		match case_name:
			"admission": _test_admission()
			"native_clock": await _test_native_clock()
			"shield_packet": await _test_shield_packet()
		if _failures == before:
			_passes += 1
			print("PASS ", case_name)
		else:
			print("FAIL ", case_name)
	print("GODOT_ETYPE0_RESULT ", JSON.stringify({"passed": _passes, "failed_assertions": _failures, "only": _selected, "explicit_native_method_calls": _explicit_native_calls, "automatic_game_simulation": false, "public_play_evidence": false, "performance_evidence": false, "live_app_inputs": 0, "alive_stun_execution_verified": false}))
	quit(0 if _failures == 0 and _passes > 0 else 1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		_failures += 1
		printerr("ASSERT_FAIL [", _case_name, "] ", message)

func _number(actual: Variant, expected: Variant, message: String, tolerance: float = 0.000001) -> void:
	_check(absf(float(actual) - float(expected)) <= tolerance, message)

func _json_equal(left: Variant, right: Variant) -> bool:
	if (typeof(left) == TYPE_FLOAT or typeof(left) == TYPE_INT) and (typeof(right) == TYPE_FLOAT or typeof(right) == TYPE_INT):
		return float(left) == float(right)
	if left is Array and right is Array:
		if left.size() != right.size():
			return false
		for index in range(left.size()):
			if not _json_equal(left[index], right[index]):
				return false
		return true
	if left is Dictionary and right is Dictionary:
		if left.size() != right.size():
			return false
		for key in left:
			if not right.has(key) or not _json_equal(left[key], right[key]):
				return false
		return true
	return left == right

func _test_admission() -> void:
	_check(FileAccess.get_sha256("res://data/encounters.json") == SOURCE_SHA, "original sixteen-record snapshot stays byte-exact")
	_check(FileAccess.get_sha256("res://data/etype0_physical_flesh_crawler.json") == CONFIG_SHA, "independent source-derived profile bytes stay exact")
	var record: Dictionary = _source["records"][14]
	_check(record["runtime"] == null and record["support"]["runtime_supported"] == false and record["animation"]["resources_copied"] == false, "historical unported snapshot is never rewritten to claim support")
	var factory = FactoryScript.new()
	_check(factory.unsupported_reason(record).is_empty(), "exact requested record admitted by new capability")
	for mutation in [{"id": "another_type0"}, {"order": 13}, {"element": "dark", "element_id": 3}, {"elite": 1}, {"spawn_position": [3900, 244.62260903114446]}]:
		var other = record.duplicate(true)
		other.merge(mutation, true)
		_check(not factory.unsupported_reason(other).is_empty(), "admission cannot become broad etype0 support: " + JSON.stringify(mutation))
	var wrong_skin = record.duplicate(true)
	wrong_skin["animation"]["skin"] = "soul_flame"
	_check(not factory.unsupported_reason(wrong_skin).is_empty(), "unported art never gets the crawler behavior")
	var world = WorldScript.new()
	root.add_child(world)
	var report: Dictionary = world.get_encounter_report()
	var actors: Array = world.get_enemies()
	# game.html:31120-31162 and 31608-31648 define the unchanged source records/order.
	_check(world.ready_for_player and report.get("source_count") == 16 and report.get("supported_count") == 11 and report.get("unsupported_count") == 5 and actors.size() == 11, "actual world preserves source16 with eleven exact supported actors and unsupported5")
	if actors.size() != 11 or report.get("records", []).size() != 16:
		world.free()
		return
	var orders: Array = []
	for registered in actors:
		orders.append(registered.source_order)
	_check(orders == [0, 1, 4, 8, 9, 10, 11, 12, 13, 14, 15], "actual registry preserves exact supported source order")
	_check(actors[9].get_script() == CrawlerScript and actors[9].source_order == 14 and str(actors[9].name) == "ch1_initial_015", "actual tenth registered actor is the exact crawler class/order/id")
	_check(actors[3].get_script() == IceScript and str(actors[3].name) == "ch1_initial_009" and report["records"][8]["consumer_profile"] == "native_ch1_etype4_ice_soul_flame_v1", "ice neighbor uses its dedicated identity and profile")
	_check(actors[8].get_script() == SpineScript and str(actors[8].name) == "ch1_initial_014" and report["records"][13]["consumer_profile"] == "native_ch1_etype4_physical_spine_beast_v1", "spine neighbor uses its dedicated identity and profile")
	var entry: Dictionary = report["records"][14]
	_check(entry["record"] == record and entry["source_support"] == record["support"] and entry["consumer_profile"] == PROFILE and entry["status"] == "supported", "current capability and untouched source declaration coexist in actual report")
	_check(report["records"][2]["status"] == "unsupported", "guardian remains explicitly unported")
	_check(report["records"][15]["status"] == "supported" and report["records"][15]["consumer_profile"] == "native_ch1_etype1_lightning_hive_bloater_v1" and actors[10].get_script() == HiveScript and str(actors[10].name) == "ch1_initial_016", "neighboring lightning archer uses its exact dedicated class and profile")
	var actor = actors[9]
	_check(_json_equal(actor.data, _config["runtime"]) and _json_equal(actor.initial_timers, record["initial_timers"]), "actual configure preserves the admitted profile and original timers without normalization")
	for native_key in _config["runtime"]["native_final"]:
		_check(record["native_final"].has(native_key) and _json_equal(actor.data["native_final"][native_key], record["native_final"][native_key]), "every admitted native field preserves its full source origin: " + native_key)
	_check(actor.position == Vector2(3888.7242834487565, 244.62260903114446), "Godot combat-center Vector2 consumes original double spawn")
	_check(actor.hp == 875 and actor.max_hp == 875 and actor.attack == 31 and actor.eShield == 875 and actor.poise == 875, "actual initial combat values unchanged")
	_number(actor.radius, 22.103927369229496, "actual native radius")
	_number(actor.facing, 2.6490353528754254, "actual native initial facing")
	_number(actor.get_snapshot()["contact_ticks"], 38.106732717715204, "initial contact clock not reseeded")
	_number(actor.get_snapshot()["projectile_ticks"], 269.4780135154724, "initial projectile clock not reseeded")
	_check(actor.get_snapshot()["native_frame"] == 0 and actor.charge_ticks == 0 and not actor.alerted, "registration does not run a simulation tick")
	var body: Sprite2D = actor.get_node("Body")
	var walk: Sprite2D = actor.get_node("WalkOverlay")
	_check(body.texture.resource_path == "res://assets/enemy/atlas_ch1_8dir_south_west.png" and walk.texture.resource_path == "res://assets/enemy/atlas_ch1_8dir_walk_south_west.png", "actual initial facing loads the original southwest pair")
	_check(body.region_rect == Rect2(1536, 0, 256, 256) and walk.region_rect == Rect2(6144, 0, 256, 256), "actual region selects col6, rather than a different monster")
	_check(body.texture.get_size() == Vector2(2048, 1280) and walk.texture.get_size() == Vector2(8192, 1280) and not walk.visible, "actual copied atlas layout and idle overlay preserved")
	_number(body.scale.y, 154.72749158460647 / 256.0, "original body height and central pivot scale", 0.00001)
	var main: Node = MainScript.new()
	main.set("world", world)
	var summary: Dictionary = main.call("_encounter_summary")
	_check(summary["supported_count"] == 11 and summary["unsupported_count"] == 5 and summary["records"][14]["status"] == "supported", "main metadata reads actual current capability, not the frozen declaration")
	main.free()
	world.free()

func _fixture(offset: Vector2, los: bool = true) -> Dictionary:
	var world = TechnicalWorld.new(los)
	root.add_child(world)
	var target = RecordingTarget.new()
	target.position = Vector2(3888.7242834487565, 244.62260903114446) + offset
	world.add_child(target)
	world.target = target
	var actor = CrawlerScript.new()
	actor.configure(_config["runtime"], world)
	actor.set_player(target)
	world.actor = actor
	var events: Array = []
	actor.telemetry_event.connect(func(kind: String, data: Dictionary) -> void: events.append({"kind": kind, "data": data.duplicate(true)}))
	world.add_child(actor)
	return {"world": world, "target": target, "actor": actor, "events": events}

func _step(node: Node, count: int = 1) -> void:
	for index in range(count):
		node.call("_physics_process", STEP)
		_explicit_native_calls += 1

func _shots(world: Node) -> Array:
	return world.get_children().filter(func(child: Node) -> bool: return child.get_script() == PhysicalScript)

func _test_native_clock() -> void:
	# Run explicit fixture calls inside a real physics-frame callback so
	# CharacterBody2D.move_and_slide sees Godot's actual fixed physics delta.
	var movement = _fixture(Vector2(600, 0))
	await physics_frame
	var origin: Vector2 = movement["actor"].global_position
	_step(movement["actor"], 100)
	var snapshot: Dictionary = movement["actor"].get_snapshot()
	_check(snapshot["alerted"] and snapshot["state"] == "idle" and snapshot["native_frame"] == 100, "LOS activates native idle at fixed60 ticks, without inventing windup")
	_number(snapshot["projectile_ticks"], 169.4780135154724, "one native tick per physics call, not render FPS")
	_check(movement["actor"].global_position.x > origin.x and snapshot["walk_distance"] > 128, "actual native movement drives the distance clock")
	var walk: Sprite2D = movement["actor"].get_node("WalkOverlay")
	_check(walk.visible and walk.region_rect == Rect2(6400, 0, 256, 256), "actual travelled distance selects source walk frame1")
	movement["world"].free()
	var blocked = _fixture(Vector2(600, 0), false)
	_step(blocked["actor"], 4)
	_check(not blocked["actor"].alerted and blocked["actor"].get_snapshot()["projectile_ticks"] == 269.4780135154724 and blocked["actor"].get_snapshot()["walk_distance"] == 0, "non-alerted far/blocked LOS preserves idle clocks and position")
	blocked["world"].free()
	var contact = _fixture(Vector2.ZERO)
	_step(contact["actor"], 39)
	_check(contact["target"].packets.size() == 1 and contact["target"].packets[0]["amount"] == 24 and contact["target"].packets[0]["kind"] == "phys", "real initial contact clock emits one physical24 request")
	var contact_left: float = contact["actor"].get_snapshot()["contact_ticks"]
	_check(contact_left >= 40 and contact_left <= 59 and contact["actor"].state == "idle", "source random contact cooldown and idle-only state preserved")
	contact["world"].free()
	var charged = _fixture(Vector2(300, 0))
	_step(charged["actor"], 269)
	_check(charged["actor"].charge_ticks == 0 and _shots(charged["world"]).is_empty(), "original fractional first wait has not fired early")
	_step(charged["actor"])
	_check(charged["actor"].charge_ticks == 60 and charged["actor"].get_snapshot()["projectile_ticks"] == 240, "actual first charge starts60 and resets wait240")
	_step(charged["actor"], 59)
	_check(charged["actor"].charge_ticks == 1 and _shots(charged["world"]).is_empty(), "59 ticks cannot release the committed projectile")
	_step(charged["actor"])
	var shots = _shots(charged["world"])
	_check(shots.size() == 1 and charged["actor"].charge_ticks == 0 and charged["actor"].state == "idle", "sixtieth charge tick releases one physical projectile without new melee states")
	if shots.size() == 1:
		var shot = shots[0]
		_check(shot.damage == 24 and shot.data["native_dtype"] == "parry" and shot.data["parry_class"] == "physical" and shot.life_ticks == 120 and shot.speed == 300, "actual born projectile keeps physical24, class and independent clocks")
		_check(shot.native_frame == 330 and charged["actor"].get_snapshot()["native_frame"] == 330, "birth consumes the frame incremented before native update logic (original R32793)")
		var life_before = shot.life_ticks
		for render in range(4):
			shot.call("_update_visual")
		_check(shot.life_ticks == life_before and shot.native_frame == 330, "four visual refreshes cannot accelerate simulation")
		var packet_count = charged["target"].packets.size()
		_step(shot)
		_check(charged["target"].packets.size() == packet_count + 1 and charged["target"].packets[-1]["kind"] == "parry" and charged["target"].packets[-1]["impulse"] == 2, "actual swept contact forwards parry type and exact additive2 impulse")
		_check(charged["target"].burn_requests == [48.0] and shot.is_queued_for_deletion(), "source redBean damage24 also requests burn48 and completes the hit")
	charged["world"].free()

func _test_shield_packet() -> void:
	var shield = _fixture(Vector2(300, 0))
	await physics_frame
	var actor = shield["actor"]
	actor.receive_poise_damage(100)
	actor.receive_damage(100, Vector2.RIGHT, "kiSlash")
	var snapshot: Dictionary = actor.get_snapshot()
	_check(snapshot["hp"] == 875 and snapshot["eShield"] == 775 and snapshot["poise"] == 875 and snapshot["poise_regen_ticks"] == 0 and snapshot["stun_ticks"] == 0 and snapshot["hit_stun_ticks"] == 0 and not snapshot["alerted"] and _json_equal(snapshot["knockback"], [0, 0]), "full shield absorption clears queued packet but changes no HP/poise/stun/alert/KB")
	_check(snapshot["pending_poise_amount"] == 0, "absorbed queued poise cannot leak into a future hit")
	actor.receive_damage(1000, Vector2.RIGHT, "weapon")
	snapshot = actor.get_snapshot()
	_check(snapshot["eShield"] == 0 and snapshot["hp"] == 650 and snapshot["poise"] == 875 and snapshot["hit_stun_ticks"] == 8 and _json_equal(snapshot["knockback"], [15, 0]), "weapon overflow uses remaining225 and KB15; weapon does not invent poise damage")
	shield["world"].free()
	var queued = _fixture(Vector2(300, 0))
	queued["actor"].receive_poise_damage(1000)
	_check(queued["actor"].poise == 875, "queued opt-in request waits for this packet's shield result")
	queued["actor"].receive_damage(1000, Vector2.RIGHT, "kiSlash")
	snapshot = queued["actor"].get_snapshot()
	_check(snapshot["hp"] == 750 and snapshot["eShield"] == 0 and snapshot["poise"] == 750 and _json_equal(snapshot["knockback"], [7.5, 0]) and snapshot["stun_ticks"] == 0, "confirmed multiplier1 applies only remaining125, with kiSlash KB.5")
	_check(snapshot["pending_poise_amount"] == 0, "single opt-in packet consumed once")
	queued["world"].free()
	var world = TechnicalWorld.new()
	root.add_child(world)
	var player = PlayerScript.new()
	player.set_combat(_combat)
	player.set_world(world)
	world.add_child(player)
	world.target = player
	for hit in range(2):
		var shot = PhysicalScript.new()
		shot.configure(player.global_position - Vector2(10, 0), Vector2.RIGHT, _config["runtime"]["projectile"], player, world)
		world.add_child(shot)
		_step(shot)
	_check(player.hp == 302 and player.get_snapshot()["energy_def"] == 0 and player.get("_knockback") == Vector2(4, 0), "actual projectile-to-player parry24 twice uses EDEF0 and adds2 each, without physical DR")
	var bites = world.get_children().filter(func(child: Node) -> bool: return child is Sprite2D and str(child.name).begins_with("PhysicalBite"))
	_check(bites.size() == 2 and bites[0].region_rect.position.y == 384 and bites[0].region_rect.size == Vector2(768, 384), "real accepted packets use original bite row1, rather than dark art")
	if not bites.is_empty():
		_step(bites[0], 47)
		_check(not bites[0].is_queued_for_deletion(), "bite lifetime not shortened by visual frames")
		_step(bites[0])
		_check(bites[0].is_queued_for_deletion(), "bite expires at actual physics48 ticks")
	world.free()
