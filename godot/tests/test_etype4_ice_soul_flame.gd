extends SceneTree
## Fresh headless ice fixtures only; no live application input/field/time writes.
## Final producer API and all cases must be ready before the first execution.

const FactoryScript = preload("res://scripts/enemy_factory.gd")
const WorldScript = preload("res://scripts/world.gd")
const PlayerScript = preload("res://scripts/player.gd")
const IceScript = preload("res://scripts/enemy_tank_ice_soul_flame.gd")
const HiveScript = preload("res://scripts/enemy_archer_lightning_hive_bloater.gd")
const IceProjectile = preload("res://scripts/enemy_projectile_ice.gd")
const STEP = 1.0 / 60.0
const PROFILE = "native_ch1_etype4_ice_soul_flame_v1"

class RecordingTarget extends Node2D:
	var hp = 350
	var radius = 15.0
	var iframes = 0.0
	var state = "idle"
	var packets: Array = []
	var slow_requests: Array = []
	var order_log: Array = []
	var _reject_damage: bool
	var _slow_remaining = 0.0
	var burn_requests: Array = []

	func _init(initial_iframes: float = 0.0, initial_state: String = "idle", reject_damage: bool = false) -> void:
		# Constructor context only. No running actor fields are rewritten.
		iframes = initial_iframes
		state = initial_state
		_reject_damage = reject_damage

	func receive_damage(amount: int, kind: String = "phys", direction: Vector2 = Vector2.ZERO, impulse: float = -1.0) -> void:
		packets.append({"amount": amount, "kind": kind, "direction": direction, "impulse": impulse, "accepted": not _reject_damage})
		order_log.append("damage")
		# A request sink, not a full player damage/status simulation.

	func apply_native_freeze_slow(duration: float) -> bool:
		slow_requests.append(duration)
		order_log.append("slow")
		var previous = _slow_remaining
		_slow_remaining = maxf(previous, duration)
		return _slow_remaining > previous

	func get_native_freeze_slow_ticks() -> float:
		return _slow_remaining

	func apply_native_burn(amount: float) -> bool:
		burn_requests.append(amount)
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
		return false

	func get_path_direction(world_position: Vector2) -> Vector2:
		return (target.global_position - world_position).normalized()

	func get_enemies() -> Array:
		return [actor] if is_instance_valid(actor) else []

var _source: Dictionary
var _config: Dictionary
var _selected: Array[String] = []
var _case_name = ""
var _passes = 0
var _failures = 0
var _explicit_calls = 0
var _automatic_fixture_ticks = 0
var _fixture_action_edges = 0

func _initialize() -> void:
	paused = true
	# main._configure_input normally creates these actions before scene play.
	# This fresh --script fixture does not run main._ready or its public scene.
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon"]:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			for name in argument.trim_prefix("--only=").split(","):
				_selected.append(name)
	call_deferred("_run")

func _run() -> void:
	_source = JSON.parse_string(FileAccess.get_file_as_string("res://data/encounters.json"))
	_config = JSON.parse_string(FileAccess.get_file_as_string("res://data/etype4_ice_soul_flame.json"))
	for name in ["exact_ice_admission", "ice_actor_packet", "ice_projectile_hit_order", "native_freeze_slow_clock"]:
		if not _selected.is_empty() and not _selected.has(name):
			continue
		_case_name = name
		var before = _failures
		match name:
			"exact_ice_admission": _test_admission()
			"ice_actor_packet": await _test_actor()
			"ice_projectile_hit_order": await _test_projectile()
			"native_freeze_slow_clock": await _test_slow()
		if _failures == before:
			_passes += 1
			print("PASS ", name)
		else:
			print("FAIL ", name)
	_action(false)
	print("GODOT_ICE_RESULT ", JSON.stringify({"passed": _passes, "failed_assertions": _failures, "explicit_physics_method_calls": _explicit_calls, "automatic_fixture_simulation_ticks": _automatic_fixture_ticks, "headless_fixture_action_edges": _fixture_action_edges, "forced_actor_fields": 0, "live_app_inputs": 0, "source_rehashes": 0, "source_factory_executions": 0, "public_play_evidence": false, "performance_evidence": false, "only": _selected}))
	quit(0 if _failures == 0 else 1)

func _expect(ok: bool, description: String) -> void:
	if not ok:
		_failures += 1
		printerr("ASSERT_FAIL [%s] %s" % [_case_name, description])

func _near(actual: float, expected: float, epsilon: float = 0.00001) -> bool:
	return absf(actual - expected) <= epsilon

func _step(node: Node, count: int = 1) -> void:
	for _i in range(count):
		_explicit_calls += 1
		node._physics_process(STEP)

func _action(pressed: bool) -> void:
	_fixture_action_edges += 1
	if pressed:
		Input.action_press("move_right")
	else:
		Input.action_release("move_right")

func _new_player(at: Vector2 = Vector2(4020, 7420)) -> Dictionary:
	var holder = TechnicalWorld.new(true, false)
	holder.process_mode = Node.PROCESS_MODE_PAUSABLE
	get_root().add_child(holder)
	var player = PlayerScript.new()
	player.position = at # Constructor context only; never rewrite a running actor.
	player.set_world(holder)
	holder.target = player
	holder.add_child(player)
	return {"holder": holder, "player": player}

func _public_windup(player: Node) -> void:
	# No state/timer jump: two ordinary attack/recovery cycles, then third hold.
	for _i in range(2):
		_expect(player.request_attack(), "public combo request accepted")
		player.release_attack()
		_step(player, 58)
		_expect(player.state == "idle", "ordinary swing/recovery reaches idle")
	_expect(player.request_attack() and player.state == "windup", "public third combo enters Ki hold")

class PostPhysicsWitness extends Node:
	var player: Node
	var snapshots: Array = []

	func _init(target: Node) -> void:
		player = target
		process_physics_priority = 1000
		process_mode = Node.PROCESS_MODE_PAUSABLE

	func _physics_process(_delta: float) -> void:
		# Read-only witness after the real player/projectile priorities; no field writes.
		snapshots.append(player.get_snapshot().duplicate(true))

func _camera(holder: Node2D, center: Vector2) -> Camera2D:
	var camera = Camera2D.new()
	camera.position = center # Initial fixture camera context only.
	camera.process_mode = Node.PROCESS_MODE_ALWAYS
	holder.add_child(camera)
	camera.make_current()
	camera.force_update_scroll()
	return camera

func _record() -> Dictionary:
	return _source["records"][8]

func _actor_fixture(offset: Vector2, blocked: bool = true, los: bool = true) -> Dictionary:
	var holder = TechnicalWorld.new(los, blocked)
	holder.process_mode = Node.PROCESS_MODE_PAUSABLE
	get_root().add_child(holder)
	var spawn: Array = _record()["spawn_position"]
	var origin = Vector2(spawn[0], spawn[1])
	var target = RecordingTarget.new()
	target.position = origin + offset
	holder.target = target
	holder.add_child(target)
	var actor = IceScript.new()
	actor.configure(_config["runtime"].duplicate(true), holder)
	actor.set_player(target)
	holder.actor = actor
	holder.add_child(actor)
	_camera(holder, origin)
	return {"holder": holder, "target": target, "actor": actor}

func _shot(holder: Node2D, target: Node2D, origin: Vector2, aim: Vector2 = Vector2.RIGHT) -> Node:
	var shot = IceProjectile.new()
	shot.configure(origin, aim, _config["runtime"]["projectile"].duplicate(true), target, holder, 0.0)
	holder.add_child(shot)
	return shot

func _shot_fixture(target_offset: Vector2, camera_offset: Vector2 = Vector2.ZERO, iframe: float = 0.0, target_state: String = "idle", rejects: bool = false) -> Dictionary:
	var holder = TechnicalWorld.new(true, false)
	holder.process_mode = Node.PROCESS_MODE_PAUSABLE
	get_root().add_child(holder)
	var target = RecordingTarget.new(iframe, target_state, rejects)
	target.position = target_offset
	holder.target = target
	holder.add_child(target)
	_camera(holder, camera_offset)
	var shot = _shot(holder, target, Vector2.ZERO)
	return {"holder": holder, "target": target, "shot": shot}

func _test_admission() -> void:
	var record = _record()
	var raw: Dictionary = record["native_final"]
	_expect(record["id"] == "ch1_initial_009" and record["order"] == 8 and record["etype"] == 4, "frozen identity/order/type preserved")
	_expect(record["element"] == "ice" and record["element_id"] == 2 and record["animation"]["skin"] == "soul_flame", "exact ice skin preserved")
	_expect(record["support"]["runtime_supported"] == false and record["runtime"] == null and raw.size() == 337, "frozen source declaration/full337 not rewritten")
	_expect(raw["_iceOnHit"] == false and raw["_iceFreeze"] == 0 and raw["mods"].is_empty(), "no modifier freeze invented")
	_expect(not raw.has("_alerted"), "raw initial alerted absent, not stored false")
	var factory = FactoryScript.new()
	_expect(factory.unsupported_reason(record) == "", "exact ice record admitted")
	for mutation in [{"id": "ch1_initial_014"}, {"order": 13}, {"element": "physical", "element_id": 0}, {"elite": 1}]:
		var changed = record.duplicate(true)
		for key in mutation: changed[key] = mutation[key]
		_expect(factory.unsupported_reason(changed) != "", "different identity/element/elite is not this consumer")
	var wrong_skin = record.duplicate(true)
	wrong_skin["animation"]["skin"] = "spine_beast"
	_expect(factory.unsupported_reason(wrong_skin) != "", "physical skin is not an ice alias")
	var world = WorldScript.new()
	get_root().add_child(world)
	var report = world.get_encounter_report()
	# game.html:31120-31162 and 31608-31648 define the unchanged source records/order.
	_expect(world.ready_for_player and report["installed"] and report["source_count"] == 16 and report["supported_count"] == 9 and report["unsupported_count"] == 7, "actual World consumes16 with nine exact profiles and seven explicit unsupported")
	var orders: Array = []
	var ice: Node = null
	var hive: Node = null
	for actor in world.get_enemies():
		orders.append(actor.source_order)
		if actor.source_order == 8: ice = actor
		if actor.source_order == 15: hive = actor
	_expect(orders == [0,1,4,8,10,12,13,14,15] and ice is IceScript, "actual registry preserves source order and dedicated ice class")
	_expect(hive is HiveScript and str(hive.name) == "ch1_initial_016" and report["records"][15]["status"] == "supported" and report["records"][15]["consumer_profile"] == "native_ch1_etype1_lightning_hive_bloater_v1", "added lightning hive has exact dedicated class/identity/profile")
	_expect(report["records"][2]["status"] == "unsupported", "guardian remains explicitly unported")
	_expect(report["records"][8]["record"] == record and report["records"][8]["consumer_profile"] == PROFILE, "readonly factory retains complete original record beside new capability")
	for key in _config["runtime"]["native_final"]:
		_expect(_config["runtime"]["native_final"][key] == raw[key], "subset origin exact: " + key)
	if ice != null:
		var snapshot = ice.get_snapshot()
		_expect(snapshot["hp"] == 875 and snapshot["poise"] == 875 and snapshot["eShield"] == 875 and ice.data["attack"] == 31, "raw HP/ATK/shield/poise consumed without boosts")
		_expect(_near(snapshot["projectile_ticks"], 294.2270742729306) and _near(snapshot["contact_ticks"],44.74301584530622) and _near(snapshot["facing"],3.801742677476639), "exact initial clocks/facing retained")
		_expect(ice.data["native_flags"] == _config["runtime"]["native_flags"] and ice.data["initial_timers"] == _config["runtime"]["initial_timers"], "flags and all197 initial clocks retained")
		var body: Sprite2D = ice.get_node("Body")
		var walk: Sprite2D = ice.get_node("WalkOverlay")
		_expect(body.region_rect == Rect2(768,0,256,256) and walk.region_rect == Rect2(3072,0,256,256), "actual soul cell3 and first overlay3072 consumed")
		_expect(body.texture.get_width() == 2048 and body.texture.get_height() == 1280 and body.centered and _near(body.scale.y*256,244.12126080784947,0.0001), "actual source texture/center/height retained, not anatomical quality proof")
		_expect(not walk.visible and not snapshot["alerted"], "initial walk hidden and falsey alert mapped to consumer false")
	world.free()

func _test_actor() -> void:
	await physics_frame
	var contact = _actor_fixture(Vector2.ZERO)
	_step(contact["actor"],44)
	_expect(contact["target"].packets.is_empty(), "initial contact clock does not fire by44")
	_step(contact["actor"])
	_expect(contact["target"].packets.size() == 1 and contact["target"].packets[0]["amount"] == 24 and contact["target"].packets[0]["kind"] == "phys" and contact["target"].slow_requests.is_empty(), "45th contact stays phys24 with no ice side effect")
	contact["holder"].free()
	var shooting = _actor_fixture(Vector2(300,0))
	var actor = shooting["actor"]
	_step(actor,294)
	_expect(actor.charge_ticks == 0, "source initial294.227 timer is not ready at294")
	_step(actor)
	_expect(actor.charge_ticks == 60 and actor.state == "idle", "295 starts water charge60 without invented melee phase")
	_step(actor,59)
	_expect(actor.charge_ticks == 1 and shooting["holder"].get_children().filter(func(x): return x is IceProjectile).is_empty(), "354 has no early shot")
	_step(actor)
	var shots = shooting["holder"].get_children().filter(func(x): return x is IceProjectile)
	_expect(shots.size() == 1, "355 births one actual dedicated water projectile")
	if shots.size() == 1:
		var shot = shots[0]
		var snap = shot.get_snapshot()
		_expect(snap["damage"] == 74 and snap["native_dtype"] == "magic" and snap["parry_class"] == "magic" and snap["waterBean"] and not snap["redBean"] and not snap["blueBean"] and snap["native_frame"] == 355, "37→74 magic/water metadata and real birth clock")
		_expect(shot.birth_position.is_equal_approx(actor.global_position) and shot.get_parent() == shooting["holder"] and snap["life_ticks"] == 120, "center source and independent world owner")
		actor.receive_damage(1000,Vector2.ZERO,"weapon")
		actor.receive_damage(1000,Vector2.ZERO,"weapon")
		_expect(not actor.alive and not shot.get_snapshot()["ended"], "normal shield/HP requests kill caster without deleting born shot")
		_step(shot)
		_expect(_near(shot.life_ticks,119.333) and shot.distance_travelled >= 500.0/60.0-0.001 and shot.distance_travelled <= 10.001, "born shot actually advances at magic band without position times2")
	shooting["holder"].free()
	for index in range(8):
		var moving = _actor_fixture(Vector2.from_angle(index*PI/4.0)*350,false)
		_step(moving["actor"])
		var direction: String = ["east","south-east","south","south-west","west","north-west","north","north-east"][index]
		var body: Sprite2D = moving["actor"].get_node("Body")
		var walk: Sprite2D = moving["actor"].get_node("WalkOverlay")
		_expect(body.texture.resource_path == _config["runtime"]["animation"]["base_textures"][direction] and walk.texture.resource_path == _config["runtime"]["animation"]["walk_textures"][direction], "soul actual movement selects direction " + direction)
		_expect(body.region_rect == Rect2(768,0,256,256) and walk.region_rect == Rect2(3072,0,256,256), "soul cell remains distinct from physical spine")
		moving["holder"].free()
	var distance = _actor_fixture(Vector2(799,0),false)
	var seen: Dictionary = {}
	for _i in range(620):
		_step(distance["actor"])
		var snapshot = distance["actor"].get_snapshot()
		var source_frame = int(floor(snapshot["walk_distance"]/128.0)) % 4
		var walk: Sprite2D = distance["actor"].get_node("WalkOverlay")
		_expect(walk.region_rect.position.x == 3072+source_frame*256, "actual distance selects soul overlay cell")
		seen[source_frame] = true
	_expect(seen.size() == 4 and distance["actor"].get_snapshot()["walk_distance"] > 384, "four original distance-driven frames observed without24fps/sample claim")
	distance["holder"].free()

func _test_projectile() -> void:
	await physics_frame
	var flight = _shot_fixture(Vector2(1000,10000))
	var shot = flight["shot"]
	_step(shot)
	_expect(_near(shot.heading.angle(),0.00655,0.000001) and _near(shot.life_ticks,119.333), "post-decay life>30 takes exact first homing step")
	var sprite: Sprite2D = shot.get_node("WaterFlight")
	var animation: Dictionary = _config["runtime"]["projectile"]["animation"]
	# game.html:24026 flight / 8926,18812 impact; byte-identical Godot copies are internal.
	# FDG_GODOT_ETYPE4_ICE_SOUL_FLAME_20261013.md:9-11 records the copy/hash contract.
	_expect(sprite.texture != null and sprite.modulate.a == 1 and shot.get_snapshot()["portable_export_dependency_packaged"] == true, "packaged original water texture loads with alpha1 and declared dependency")
	_expect(animation["texture"] == "res://assets/vfx/water_blue_projectile_sheet.png" and animation["external_original_file"] == false and animation["packaged_original_copy"] == true and sprite.texture != null and sprite.texture.resource_path == animation["texture"] and ResourceLoader.exists(animation["texture"], "Texture2D"), "actual flight Resource uses the internal original-copy path")
	_step(shot,134)
	var stopped_heading = shot.heading
	_expect(shot.life_ticks < 30, "135th decay crosses homing lifetime boundary")
	_step(shot,45)
	var extended = shot.get_snapshot()
	_expect(not extended["ended"] and extended["near_camera_extensions"] == 1 and _near(extended["life_ticks"],1) and shot.heading.is_equal_approx(stopped_heading) and extended["visual_alpha"] == 1, "180th near-camera expiry extends1 and continues straight with full alpha")
	flight["holder"].free()
	var far = _shot_fixture(Vector2(1000,10000),Vector2(2501,0))
	_step(far["shot"])
	var far_snap = far["shot"].get_snapshot()
	_expect(far_snap["ended"] and far_snap["life_ticks"] == 120 and far["shot"].distance_travelled == 0, "camera2501 culls before decay/movement")
	far["holder"].free()
	for context in [{"iframe":1.0,"state":"idle"},{"iframe":0.0,"state":"charge"}]:
		var guarded = _shot_fixture(Vector2(8,0),Vector2.ZERO,context["iframe"],context["state"])
		_step(guarded["shot"])
		_expect(guarded["target"].packets.is_empty() and guarded["target"].slow_requests.is_empty(), "outer iframe/literal movement charge blocks packet and slow together")
		guarded["holder"].free()
	var rejected = _shot_fixture(Vector2(8,0),Vector2.ZERO,0,"idle",true)
	_step(rejected["shot"])
	_expect(rejected["target"].order_log == ["damage","slow"] and rejected["target"].packets[0]["amount"] == 74 and rejected["target"].packets[0]["kind"] == "magic" and rejected["target"].hp == 350 and rejected["target"].get_native_freeze_slow_ticks() == 60 and rejected["target"].burn_requests.is_empty(), "hurtP-like internal rejection sink still receives subsequent max60, no burn")
	var impact = rejected["holder"].get_children().filter(func(x): return x.name == "WaterImpact")
	_expect(impact.size() == 1 and impact[0].texture != null, "actual original water impact sheet consumed")
	if impact.size() == 1:
		var impact_profile: Dictionary = _config["runtime"]["projectile"]["impact"]
		_expect(impact_profile["texture"] == "res://assets/vfx/Water_ImpactWater_Sheet.png" and impact_profile["external_original_file"] == false and impact_profile["packaged_original_copy"] == true and impact[0].texture != null and impact[0].texture.resource_path == impact_profile["texture"] and ResourceLoader.exists(impact_profile["texture"], "Texture2D"), "actual impact Resource uses its internal original-copy path")
		_step(impact[0],22)
		_expect(_near(impact[0].scale.x*impact[0].texture.get_width()/4.0,216,0.001), "real impact reaches radius72 times3 at22/66")
	rejected["holder"].free()
	var sweep = _new_player(Vector2(4,28.5))
	_camera(sweep["holder"],Vector2.ZERO)
	var moving_shot = _shot(sweep["holder"],sweep["player"],Vector2.ZERO)
	_fixture_action_edges += 1
	Input.action_press("move_down")
	_step(sweep["player"])
	_fixture_action_edges += 1
	Input.action_release("move_down")
	_expect(_near(sweep["player"].global_position.y,31.1,0.001) and sqrt(4*4+28.5*28.5)>28.6, "real down input moves current point outside28.6 while previous endpoint also outside")
	_step(moving_shot)
	_expect(sweep["player"].hp == 276 and sweep["player"].get_native_freeze_slow_ticks() == 60 and moving_shot.get_snapshot()["ended"], "previous player segment at28.5 independently catches water magic74/slow60")
	sweep["holder"].free()

func _test_slow() -> void:
	await physics_frame
	var fixture = _new_player()
	var player = fixture["player"]
	_action(true)
	var origin = player.global_position
	_step(player)
	var baseline_velocity = player.velocity.x
	var baseline_distance = player.global_position.x-origin.x
	_expect(_near(baseline_velocity,156) and baseline_distance>0, "fresh real player moves at baseline through actual fixture action")
	var before = player.get_snapshot()
	_expect(player.apply_native_freeze_slow(60) and not player.apply_native_freeze_slow(60) and not player.apply_native_freeze_slow(30), "max refresh does not stack or shorten60")
	_expect(player.hp == before["hp"] and player.poise == before["poise"] and player.state == before["state"] and player.iframes == before["iframes"], "status application leaves combat gates/HP/poise unchanged")
	for i in range(59):
		var old = player.global_position
		_step(player)
		_expect(player.get_native_freeze_slow_ticks() == 59-i and _near(player.velocity.x,baseline_velocity/2.0) and _near(player.global_position.x-old.x,baseline_distance/2.0,0.001), "idle decrement-before-move update " + str(i+1))
	_step(player)
	_expect(player.get_native_freeze_slow_ticks() == 0 and _near(player.velocity.x,baseline_velocity), "60th eligible update resumes full speed")
	_expect(player.apply_native_freeze_slow(60), "next normal hit can refresh60")
	_public_windup(player)
	_step(player,5)
	_expect(player.state == "windup" and player.get_native_freeze_slow_ticks() == 60, "actual swing/recover/Ki hold do not consume idle slow clock")
	_expect(player.cancel_attack(), "public cancellation returns idle")
	player.release_attack()
	_step(player)
	_expect(player.get_native_freeze_slow_ticks() == 59 and _near(player.velocity.x,baseline_velocity/2), "next actual idle update after public cancel consumes59")
	_action(false)
	fixture["holder"].free()
	var automatic = _new_player()
	_camera(automatic["holder"],automatic["player"].global_position)
	automatic["player"].apply_native_freeze_slow(60)
	_step(automatic["player"],30)
	var auto_shot = _shot(automatic["holder"],automatic["player"],automatic["player"].global_position)
	_expect(automatic["player"].get_native_freeze_slow_ticks() == 30 and automatic["player"].process_physics_priority == 0 and auto_shot.process_physics_priority == 1, "real automatic constructor starts30 with native player0/shot1")
	var witness = PostPhysicsWitness.new(automatic["player"])
	automatic["holder"].add_child(witness)
	paused = false
	while witness.snapshots.size() < 8:
		await process_frame
	paused = true
	_automatic_fixture_ticks += witness.snapshots.size()
	_expect(witness.snapshots[0]["hp"] == 276 and witness.snapshots[0]["state"] == "stagger" and witness.snapshots[0]["freeze_slow_ticks"] == 60, "automatic dispatch appends fresh60 after player idle clock and real magic74")
	for i in range(1,7):
		_expect(witness.snapshots[i]["freeze_slow_ticks"] == 60, "actual stagger and its idle-return update freeze slow clock")
	_expect(witness.snapshots[7]["state"] == "idle" and witness.snapshots[7]["freeze_slow_ticks"] == 59, "automatic next eligible idle consumes59")
	automatic["holder"].free()
