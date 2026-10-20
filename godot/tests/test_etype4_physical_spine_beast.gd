extends SceneTree
## New spine consumer fixtures only. No live input/state/timer writes or source rehash.

const FactoryScript = preload("res://scripts/enemy_factory.gd")
const WorldScript = preload("res://scripts/world.gd")
const SpineScript = preload("res://scripts/enemy_tank_physical_spine_beast.gd")
const IceScript = preload("res://scripts/enemy_tank_ice_soul_flame.gd")
const CrawlerScript = preload("res://scripts/enemy_melee_flesh_crawler.gd")
const HiveScript = preload("res://scripts/enemy_archer_lightning_hive_bloater.gd")
const PhysicalScript = preload("res://scripts/enemy_projectile_physical.gd")
const STEP = 1.0 / 60.0
const PROFILE = "native_ch1_etype4_physical_spine_beast_v1"

class RecordingTarget extends Node2D:
	var hp = 350
	var radius = 15.0
	var iframes = 0.0
	var state = "idle"
	var packets: Array = []
	var burn_requests: Array = []

	func receive_damage(amount: int, kind: String = "phys", direction: Vector2 = Vector2.ZERO, impulse: float = -1.0) -> void:
		# Request sink, not a full player HP/poise/shield simulation.
		packets.append({"amount": amount, "kind": kind, "direction": direction, "impulse": impulse})

	func apply_native_burn(total_damage: float) -> bool:
		burn_requests.append(total_damage)
		return true

class TechnicalWorld extends Node2D:
	var target: Node2D
	var actor: Node2D
	var _los: bool
	var _blocked: bool

	func _init(los: bool, blocked: bool) -> void:
		_los = los
		_blocked = blocked

	func has_line_of_sight(_from: Vector2, _to: Vector2) -> bool:
		return _los

	func can_move(_position: Vector2, _radius: float) -> bool:
		return not _blocked

	func is_world_blocked(_position: Vector2) -> bool:
		# Movement blockage is the actor fixture; projectile path stays open.
		return false

	func get_path_direction(world_position: Vector2) -> Vector2:
		return (target.global_position - world_position).normalized()

	func get_enemies() -> Array:
		return [actor] if is_instance_valid(actor) else []

class AxisWorld extends TechnicalWorld:
	var _mode: String
	var _origin: Vector2

	func _init(mode: String, origin: Vector2) -> void:
		super(true, false)
		_mode = mode
		_origin = origin

	func can_move(point: Vector2, _radius: float) -> bool:
		match _mode:
			"both": return true
			"x": return point.y == _origin.y
			"y": return point.x == _origin.x
		return false

var _source: Dictionary
var _config: Dictionary
var _selected: Array[String] = []
var _case_name = ""
var _passes = 0
var _failures = 0
var _explicit_calls = 0

func _initialize() -> void:
	paused = true
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			for name in argument.trim_prefix("--only=").split(","):
				_selected.append(name)
	call_deferred("_run")

func _run() -> void:
	_source = JSON.parse_string(FileAccess.get_file_as_string("res://data/encounters.json"))
	_config = JSON.parse_string(FileAccess.get_file_as_string("res://data/etype4_physical_spine_beast.json"))
	for name in ["exact_admission", "native_motion_charge", "shield_poise_order", "flow_axis_boundaries"]:
		if not _selected.is_empty() and not _selected.has(name):
			continue
		_case_name = name
		var before = _failures
		match name:
			"exact_admission": _test_admission()
			"native_motion_charge": await _test_motion_charge()
			"shield_poise_order": await _test_shield_poise()
			"flow_axis_boundaries": await _test_flow_axes()
		if _failures == before:
			_passes += 1
			print("PASS ", name)
		else:
			print("FAIL ", name)
	print("GODOT_SPINE_RESULT ", JSON.stringify({"passed": _passes, "failed_assertions": _failures, "only": _selected, "explicit_physics_method_calls": _explicit_calls, "automatic_fixture_simulation_ticks": 0, "public_play_evidence": false, "performance_evidence": false, "forced_actor_fields": 0, "source_rehashes": 0, "source_factory_executions": 0, "live_app_inputs": 0, "alive_stun_execution_verified": false}))
	quit(0 if _failures == 0 and _passes > 0 else 1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		_failures += 1
		printerr("ASSERT_FAIL [", _case_name, "] ", message)

func _number(actual: Variant, expected: Variant, message: String, tolerance: float = 0.000001) -> void:
	_check(absf(float(actual) - float(expected)) <= tolerance, message)

func _equal(a: Variant, b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float):
		return float(a) == float(b)
	if a is Array and b is Array:
		if a.size() != b.size(): return false
		for i in range(a.size()):
			if not _equal(a[i], b[i]): return false
		return true
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size(): return false
		for key in a:
			if not b.has(key) or not _equal(a[key], b[key]): return false
		return true
	return a == b

func _step(node: Node, count: int = 1) -> void:
	for index in range(count):
		node.call("_physics_process", STEP)
		_explicit_calls += 1

func _fixture(offset: Vector2, los: bool = true, blocked: bool = false) -> Dictionary:
	var world = TechnicalWorld.new(los, blocked)
	root.add_child(world)
	var actor = SpineScript.new()
	actor.configure(_config["runtime"], world)
	world.actor = actor
	var target = RecordingTarget.new()
	# Constructor context only; never repositioned after the fixture starts.
	target.position = actor.spawn_position + offset
	world.target = target
	world.add_child(target)
	actor.set_player(target)
	var events: Array = []
	actor.telemetry_event.connect(func(kind: String, value: Dictionary): events.append({"kind": kind, "data": value.duplicate(true)}))
	world.add_child(actor)
	return {"world": world, "actor": actor, "target": target, "events": events}

func _shots(world: Node) -> Array:
	var result: Array = []
	for child in world.get_children():
		if child.get_script() == PhysicalScript:
			result.append(child)
	return result

func _events(fixture: Dictionary, kind: String) -> Array:
	var result: Array = []
	for event in fixture["events"]:
		if event["kind"] == kind:
			result.append(event["data"])
	return result

func _test_admission() -> void:
	var record: Dictionary = _source["records"][13]
	_check(_source["records"].size() == 16 and record["id"] == "ch1_initial_014" and record["order"] == 13 and record["etype"] == 4 and record["element"] == "physical", "exact original sixteen-record identity without rehash/reproduction")
	_check(record["runtime"] == null and record["support"]["runtime_supported"] == false and record["animation"]["resources_copied"] == false, "frozen source creation declaration stays unported")
	var factory = FactoryScript.new()
	_check(factory.unsupported_reason(record).is_empty(), "new exact spine capability admitted")
	for mutation in [{"id": "another_type4"}, {"order": 12}, {"element": "ice", "element_id": 2}, {"elite": 1}, {"spawn_position": [3900, 340]}]:
		var other = record.duplicate(true)
		other.merge(mutation, true)
		_check(not factory.unsupported_reason(other).is_empty(), "no broad type4 profile alias: " + JSON.stringify(mutation))
	var other_skin = record.duplicate(true)
	other_skin["animation"]["skin"] = "soul_flame"
	_check(not factory.unsupported_reason(other_skin).is_empty(), "wrong art cannot receive spine AI")
	var world = WorldScript.new()
	root.add_child(world)
	var report: Dictionary = world.get_encounter_report()
	var actors: Array = world.get_enemies()
	# game.html:31120-31162 and 31608-31648 define the unchanged source records/order.
	_check(world.ready_for_player and report.get("source_count") == 16 and report.get("supported_count") == 6 and report.get("unsupported_count") == 10 and actors.size() == 6, "actual world consumes source16 into six exact actors and ten explicit unsupported records")
	if actors.size() != 6 or report.get("records", []).size() != 16:
		world.free()
		return
	var orders: Array = []
	for registered in actors:
		orders.append(registered.source_order)
	_check(orders == [0, 1, 8, 13, 14, 15], "actual registry preserves exact supported source order")
	_check(actors[3].get_script() == SpineScript and actors[3].source_order == 13 and str(actors[3].name) == "ch1_initial_014" and actors[4].source_order == 14 and actors[4].get_script() == CrawlerScript and str(actors[4].name) == "ch1_initial_015", "exact spine actor registers before the unchanged dedicated crawler")
	var entry: Dictionary = report["records"][13]
	_check(_equal(entry["record"], record) and _equal(entry["source_support"], record["support"]) and entry["consumer_profile"] == PROFILE and entry["status"] == "supported", "full original record and snapshot support coexist with current capability")
	_check(report["records"][2]["status"] == "unsupported", "guardian remains explicitly unsupported")
	_check(report["records"][8]["status"] == "supported" and report["records"][8]["consumer_profile"] == "native_ch1_etype4_ice_soul_flame_v1" and actors[2].get_script() == IceScript and str(actors[2].name) == "ch1_initial_009", "ice type4 uses its exact dedicated class and profile")
	_check(report["records"][15]["status"] == "supported" and report["records"][15]["consumer_profile"] == "native_ch1_etype1_lightning_hive_bloater_v1" and actors[5].get_script() == HiveScript and str(actors[5].name) == "ch1_initial_016", "lightning archer uses its exact dedicated class and profile")
	var actor = actors[3]
	_check(_equal(actor.data, _config["runtime"]) and _equal(actor.initial_timers, record["initial_timers"]) and _equal(actor.native_flags, _config["runtime"]["native_flags"]), "actual configure copies source-derived profile, initial clocks and flags")
	for key in _config["runtime"]["native_final"]:
		_check(record["native_final"].has(key) and _equal(actor.data["native_final"][key], record["native_final"][key]), "every consumed native field retains source origin: " + key)
	_check(actor.position == Vector2(3878.7467967160046, 340) and actor.hp == 875 and actor.max_hp == 875 and actor.attack == 31 and actor.eShield == 875 and actor.poise == 875, "exact original spawn and raw combat values")
	_number(actor.radius, 34.3551987009123, "original collision radius")
	_number(actor.facing, 0.384930423474355, "original initial facing")
	_number(actor.get_snapshot()["projectile_ticks"], 299.5166686736047, "original projectile clock not reseeded")
	_number(actor.get_snapshot()["contact_ticks"], 30.77384915202856, "original contact clock not normalized")
	var body: Sprite2D = actor.get_node("Body")
	var walk: Sprite2D = actor.get_node("WalkOverlay")
	_check(body.region_rect == Rect2(1280, 0, 256, 256) and body.texture.get_size() == Vector2(2048, 1280) and body.texture.resource_path == _config["runtime"]["animation"]["base_textures"]["east"], "actual spine cell5 and correct initial directional texture are loaded")
	_number(body.scale.y * 256.0, 240.48639090638608, "source draw height within Godot Vector2 float32 precision", 0.0001)
	_check(body.centered and body.texture_filter == CanvasItem.TEXTURE_FILTER_NEAREST and walk.region_rect == Rect2(5120, 0, 256, 256) and not walk.visible, "source center pivot, nearest sampling and idle plus separate walk overlay")
	var snapshot: Dictionary = actor.get_snapshot()
	_check(snapshot["undead_for_anti_revive"] and not snapshot["anti_revive_affix_ported"] and _equal(snapshot["native_type_traits"], _config["runtime"]["native_type_traits"]), "source undead identity preserved separately from unported nonzero antiRevive equipment")
	snapshot["native_type_traits"]["undead"] = false
	_check(actor.get_snapshot()["native_type_traits"]["undead"], "detached traits report cannot mutate actual actor")
	world.free()

func _test_motion_charge() -> void:
	# Establish actual engine physics delta before manual CharacterBody updates.
	await physics_frame
	var blocked = _fixture(Vector2(350, 0), false, true)
	var origin: Vector2 = blocked["actor"].global_position
	_step(blocked["actor"], 12)
	_check(not blocked["actor"].alerted and blocked["actor"].global_position == origin and blocked["actor"].get_snapshot()["walk_distance"] == 0, "LOS denial and blocked native movement preserve non-alerted stationary context")
	blocked["world"].free()
	var directions = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"]
	for index in range(8):
		var angle = index * PI / 4.0
		var fixture = _fixture(Vector2.from_angle(angle) * 350.0)
		var actor = fixture["actor"]
		origin = actor.global_position
		_step(actor)
		_check(actor.alerted and actor.global_position.distance_to(origin) > 0.5 and actor.state == "idle", "actual LOS pursuit and direct idle movement, no invented windup: " + directions[index])
		_number(wrapf(actor.facing - angle, -PI, PI), 0, "source facing follows target direction")
		var body: Sprite2D = actor.get_node("Body")
		var walk: Sprite2D = actor.get_node("WalkOverlay")
		_check(body.texture.resource_path == _config["runtime"]["animation"]["base_textures"][directions[index]] and walk.texture.resource_path == _config["runtime"]["animation"]["walk_textures"][directions[index]] and walk.visible, "actual base and walk consume the matching eight-direction sheets")
		fixture["world"].free()
	var walking = _fixture(Vector2(799, 0))
	var frames: Dictionary = {}
	for tick in range(400):
		_step(walking["actor"])
		var distance = float(walking["actor"].get_snapshot()["walk_distance"])
		var expected = int(floor(distance / 128.0)) % 4
		var walk: Sprite2D = walking["actor"].get_node("WalkOverlay")
		_check(walk.region_rect == Rect2(5120 + expected * 256, 0, 256, 256), "actual travelled distance selects original spine walk cell")
		frames[expected] = true
		if frames.size() == 4: break
	_check(frames.size() == 4 and walking["actor"].state == "idle", "all four walk cells reached by actual movement, not 24frame/time fabrication")
	walking["world"].free()
	var contact = _fixture(Vector2.ZERO, true, true)
	_step(contact["actor"], 30)
	_check(contact["target"].packets.is_empty(), "fractional original contact wait remains positive through tick30")
	_step(contact["actor"])
	_check(contact["target"].packets.size() == 1 and contact["target"].packets[0]["amount"] == 24 and contact["target"].packets[0]["kind"] == "phys", "native type4 contact consumes st2 on tick31 and requests original physical24")
	var cooldown = float(contact["actor"].get_snapshot()["contact_ticks"])
	_check(cooldown >= 40 and cooldown <= 59 and cooldown == floor(cooldown), "source contact cooldown40..59 without fixed random outcome")
	contact["world"].free()
	var charging = _fixture(Vector2(300, 0), true, true)
	var actor = charging["actor"]
	_step(actor, 299)
	_check(actor.charge_ticks == 0 and _shots(charging["world"]).is_empty(), "original fractional first projectile timer survives native299")
	_step(actor)
	_check(actor.charge_ticks == 60 and _events(charging, "enemy_charge").size() == 1 and _shots(charging["world"]).is_empty(), "native300 starts source normal physical60 charge only")
	_step(actor, 59)
	_check(actor.charge_ticks == 1 and _shots(charging["world"]).is_empty(), "native359 has no early shot")
	_step(actor)
	var shots = _shots(charging["world"])
	_check(shots.size() == 1 and actor.native_frame == 360 and actor.charge_ticks == 0 and _events(charging, "enemy_projectile_birth").size() == 1, "native360 completes source charge into one real physical projectile")
	if shots.size() != 1:
		charging["world"].free()
		return
	var shot = shots[0]
	_check(shot.get_parent() == charging["world"] and shot.global_position == actor.global_position and _equal(shot.data, _config["runtime"]["projectile"]) and shot.damage == 24 and shot.life_ticks == 120 and shot.speed == 300, "existing physical class consumes actor-center raw24/life120/speed300 profile")
	# Actual damage requests kill the caster; no actor state/HP field is forced.
	actor.receive_damage(1000, Vector2.ZERO, "weapon")
	actor.receive_damage(1000, Vector2.ZERO, "weapon")
	_check(not actor.alive and actor.state == "dead" and not shot.is_queued_for_deletion(), "caster death leaves the already born projectile independent")
	_step(shot)
	_number(shot.life_ticks, 119.333, "independent shot life decay0.667 per native tick")
	_number(shot.distance_travelled, 5, "independent physical speed300 at delta1/60")
	for tick in range(80):
		if shot.is_queued_for_deletion(): break
		_step(shot)
	_check(charging["target"].packets.size() == 1 and charging["target"].packets[0]["amount"] == 24 and charging["target"].packets[0]["kind"] == "parry" and charging["target"].packets[0]["impulse"] == 2.0 and charging["target"].burn_requests == [48.0], "new spine caller reaches shared parry24/headingKB2/posthitburn48 request sink after caster death")
	charging["world"].free()

func _test_shield_poise() -> void:
	await physics_frame
	var absorbed = _fixture(Vector2(300, 0), true, true)
	var actor = absorbed["actor"]
	actor.receive_poise_damage(100)
	actor.receive_damage(100, Vector2.RIGHT, "kiSlash")
	var snapshot: Dictionary = actor.get_snapshot()
	_check(actor.eShield == 775 and actor.hp == 875 and actor.poise == 875 and not actor.alerted and snapshot["hit_stun_ticks"] == 0 and snapshot["knockback"] == [0.0, 0.0] and snapshot["pending_poise_amount"] == 0, "fully absorbed source packet cannot affect HP/hitstun/KB/poise or carry queued poise into another hit")
	actor.receive_damage(800, Vector2.RIGHT, "weapon")
	snapshot = actor.get_snapshot()
	_check(actor.eShield == 0 and actor.hp == 850 and actor.poise == 875 and actor.alerted and snapshot["hit_stun_ticks"] == 8, "only remaining25 reaches HP; weapon damage is not automatic poise or invented armor")
	_number(snapshot["knockback"][0], 6.25, "weapon KB uses remaining25 times0.25")
	absorbed["world"].free()
	var weapon = _fixture(Vector2(300, 0), true, true)
	weapon["actor"].receive_damage(1000, Vector2.RIGHT, "weapon")
	snapshot = weapon["actor"].get_snapshot()
	_check(snapshot["hp"] == 750 and snapshot["eShield"] == 0 and snapshot["poise"] == 875, "raw type4 has no armor or nonzero equipment bonus: shield875 then HP125, no ordinary weapon poise")
	_number(snapshot["knockback"][0], 15, "weapon KB capped15 after remaining HP damage")
	weapon["world"].free()
	var charging = _fixture(Vector2(300, 0), true, true)
	actor = charging["actor"]
	_step(actor, 320)
	_check(actor.charge_ticks == 40, "charge state reached through native initial timer and twenty natural charge updates")
	actor.receive_poise_damage(1000)
	actor.receive_damage(1000, Vector2.RIGHT, "kiSlash")
	snapshot = actor.get_snapshot()
	_check(snapshot["hp"] == 750 and snapshot["poise"] == 750 and snapshot["stun_ticks"] == 0 and snapshot["hit_stun_ticks"] == 8 and snapshot["charge_ticks"] == 40, "queued opt-in poise uses shield-overflow125, not the full1000 or forced living stun")
	_number(snapshot["knockback"][0], 7.5, "kiSlash KB multiplier0.5 applied after remaining-damage cap")
	_step(actor, 7)
	_check(actor.charge_ticks == 40 and actor.get_snapshot()["hit_stun_ticks"] == 1, "source loop decreases hitstun before AI guard, pausing charge for seven positive-hitstun updates")
	_step(actor)
	_check(actor.charge_ticks == 39 and actor.get_snapshot()["hit_stun_ticks"] == 0, "eighth decay reaches0 and resumes native charge on that update")
	actor.receive_damage(750, Vector2.ZERO, "weapon")
	_check(not actor.alive and actor.state == "dead" and actor.charge_ticks == 0 and _shots(charging["world"]).is_empty(), "accepted HP damage causes real death and cancels a not-yet-born shot")
	charging["world"].free()

func _axis_fixture(mode: String) -> Dictionary:
	var initial = _config["runtime"]["spawn_position"]
	var origin = Vector2(float(initial[0]), float(initial[1]))
	var world = AxisWorld.new(mode, origin)
	root.add_child(world)
	var actor = SpineScript.new()
	actor.configure(_config["runtime"], world)
	world.actor = actor
	var target = RecordingTarget.new()
	target.position = actor.spawn_position + Vector2(150, 150)
	world.target = target
	world.add_child(target)
	actor.set_player(target)
	world.add_child(actor)
	return {"world": world, "actor": actor}

func _test_flow_axes() -> void:
	await physics_frame
	for mode in ["both", "x", "y", "none"]:
		var fixture = _axis_fixture(mode)
		var actor = fixture["actor"]
		var origin: Vector2 = actor.global_position
		_step(actor)
		var movement: Vector2 = actor.global_position - origin
		_check(actor.alerted, "actual source LOS acquisition precedes the flow movement boundary")
		match mode:
			"both": _check(movement.x > 0 and movement.y > 0, "open diagonal path moves both coordinates")
			"x": _check(movement.x > 0 and movement.y == 0, "blocked diagonal flow uses source X-only fallback")
			"y": _check(movement.x == 0 and movement.y > 0, "blocked diagonal and X flow use source Y-only fallback")
			"none": _check(movement == Vector2.ZERO, "fully blocked source flow cannot invent a teleport or movement")
		fixture["world"].free()
	var close_without_los = _fixture(Vector2(75, 0), false, true)
	_step(close_without_los["actor"])
	_check(not close_without_los["actor"].alerted, "actual source has no unconditional near50..100 alert; close75 still needs LOS")
	close_without_los["world"].free()
