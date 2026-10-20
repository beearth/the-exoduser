extends SceneTree
## Fresh technical fixtures for exactly ch1_initial_016; never the public app.
## Product/factory READY and all four implementations must precede execution.

const FactoryScript = preload("res://scripts/enemy_factory.gd")
const PlayerScript = preload("res://scripts/player.gd")
const HiveScript = preload("res://scripts/enemy_archer_lightning_hive_bloater.gd")
const LightningScript = preload("res://scripts/enemy_projectile_lightning.gd")
const STEP = 1.0 / 60.0
const RECORD_ID = "ch1_initial_016"
const SOURCE_FILE = "res://data/encounters.json"
const CONFIG_FILE = "res://data/etype1_lightning_hive_bloater.json"

class RecordingTarget extends Node2D:
	signal native_idle_status_tick(ticks: float)
	var hp = 350
	var radius = 15.0
	var iframes = 0.0
	var state = "idle"
	var packets: Array = []
	var _reject: bool

	func _init(initial_state: String = "idle", initial_iframes: float = 0.0, reject_damage: bool = false, initial_hp: int = 350) -> void:
		# Initial context only; no active actor HP/state/timer/position writes.
		state = initial_state
		iframes = initial_iframes
		_reject = reject_damage
		hp = initial_hp

	func receive_damage(amount: int, kind: String = "phys", direction: Vector2 = Vector2.ZERO, impulse: float = -1.0) -> void:
		packets.append({"amount": amount, "kind": kind, "direction": direction, "impulse": impulse, "accepted": not _reject})
		# Request sink only; never substitute it for real Player damage proof.

class TechnicalWorld extends Node2D:
	var target: Node2D
	var actors: Array = []
	var _los: bool
	var _point_blocked: bool
	var _motion_blocked: bool

	func _init(los: bool = true, point_blocked: bool = false, motion_blocked: bool = false) -> void:
		_los = los
		_point_blocked = point_blocked
		_motion_blocked = motion_blocked

	func has_line_of_sight(_from: Vector2, _to: Vector2) -> bool:
		return _los

	func is_world_blocked(_position: Vector2) -> bool:
		return _point_blocked

	func can_move(_position: Vector2, _radius: float) -> bool:
		return not _motion_blocked

	func get_path_direction(position_value: Vector2) -> Vector2:
		return (target.global_position - position_value).normalized() if is_instance_valid(target) else Vector2.ZERO

	func get_enemies() -> Array:
		return actors

	func separation_move_native(_actor: Node2D, _ticks: float) -> Vector2:
		return Vector2.ZERO

var _failed_assertions = 0
var _passed = 0
var _incomplete: Array = []
var _explicit_physics_calls = 0
var _automatic_fixture_ticks = 0
var _fixture_action_edges = 0
var _only: Array = []
var _events: Array = []
var _source: Dictionary
var _runtime: Dictionary
var _render_method_calls = 0
var _automatic_idle_dispatches = 0
var _dispatch_log: Array = []

func _initialize() -> void:
	# Main normally installs these actions; this fixture never boots Main.
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon", "cancel_charge", "pause"]:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="):
			_only = Array(arg.trim_prefix("--only=").split(","))
	paused = true
	call_deferred("_run")

func _run_group(group_name: String, test: Callable) -> void:
	if not _only.is_empty() and group_name not in _only:
		return
	var before = _failed_assertions
	var completed: Variant = await test.call()
	if completed != true:
		_incomplete.append(group_name)
		print("INCOMPLETE " + group_name)
	elif _failed_assertions == before:
		_passed += 1
		print("PASS " + group_name)
	else:
		print("FAIL " + group_name)

func _check(condition: bool, label: String) -> void:
	if not condition:
		_failed_assertions += 1
		print("ASSERT_FAIL " + label)

func _near(actual: float, expected: float, label: String, epsilon: float = 0.00001) -> void:
	_check(absf(actual - expected) <= epsilon, "%s actual=%s expected=%s" % [label, actual, expected])

func _read_json(path: String) -> Dictionary:
	return JSON.parse_string(FileAccess.get_file_as_string(path))

func _record(source: Dictionary) -> Dictionary:
	for value in source["records"]:
		if value["id"] == RECORD_ID:
			return value
	return {}

func _tick(value: Node, frames: int = 1) -> void:
	for _frame in range(frames):
		_explicit_physics_calls += 1
		value._physics_process(STEP)

func _observe(kind: String, data: Dictionary) -> void:
	_events.append({"kind": kind, "data": data.duplicate(true)})

func _events_of(kind: String) -> Array:
	return _events.filter(func(event): return event["kind"] == kind)

func _camera(holder: Node2D, center: Vector2) -> Camera2D:
	var camera = Camera2D.new()
	camera.position = center
	holder.add_child(camera)
	camera.make_current()
	camera.force_update_scroll()
	return camera

func _hive_fixture(distance: float, angle: float, los: bool = true, point_blocked: bool = false, motion_blocked: bool = false) -> Dictionary:
	var record = _record(_source)
	var spawn = Vector2(record["spawn_position"][0], record["spawn_position"][1])
	var holder = TechnicalWorld.new(los, point_blocked, motion_blocked)
	var target = RecordingTarget.new()
	# Constructor target context, before entering the tree. Native actor
	# configuration always uses the unchanged exact record's runtime.
	target.position = spawn + Vector2.from_angle(angle) * distance
	holder.target = target
	root.add_child(holder)
	holder.add_child(target)
	_camera(holder, spawn)
	var actor = HiveScript.new()
	actor.configure(_runtime.duplicate(true), holder)
	actor.set_player(target)
	actor.process_mode = Node.PROCESS_MODE_DISABLED
	actor.telemetry_event.connect(_observe)
	holder.actors.append(actor)
	holder.add_child(actor)
	return {"holder": holder, "actor": actor, "target": target}

func _projectile_fixture(origin: Vector2, target_position: Vector2, camera_position: Vector2, target_state: String = "idle", initial_iframes: float = 0.0, reject_damage: bool = false, initial_hp: int = 350) -> Dictionary:
	var holder = TechnicalWorld.new()
	var target = RecordingTarget.new(target_state, initial_iframes, reject_damage, initial_hp)
	target.position = target_position
	holder.target = target
	root.add_child(holder)
	holder.add_child(target)
	_camera(holder, camera_position)
	var shot = LightningScript.new()
	shot.configure(origin, Vector2.RIGHT, _runtime["projectile"].duplicate(true), target, holder, 0)
	shot.process_mode = Node.PROCESS_MODE_DISABLED
	shot.telemetry_event.connect(_observe)
	holder.add_child(shot)
	return {"holder": holder, "shot": shot, "target": target}

func _render_tick(value: Node, calls: int = 1) -> void:
	for _call in range(calls):
		_render_method_calls += 1
		value._process(STEP)

func _exact_admission() -> bool:
	var record = _record(_source)
	var before = JSON.stringify(record)
	var factory = FactoryScript.new()
	_check(factory.unsupported_reason(record).is_empty(), "exact hive record admitted")
	for changed in [{"id": "other"}, {"element": "dark"}, {"animation": {"skin": "bone_archer"}}]:
		var other = record.duplicate(true)
		for key in changed:
			other[key] = changed[key]
		_check(not factory.unsupported_reason(other).is_empty(), "no unrelated id/element/skin alias admitted")
	var holder = TechnicalWorld.new()
	root.add_child(holder)
	var result: Dictionary = factory.consume_atomic(_source, holder)
	_check(result.get("valid", false), "actual factory accepts source with new exact consumer")
	if not result.get("valid", false):
		print("FACTORY_ERRORS " + JSON.stringify(result.get("errors")))
		holder.free()
		return true
	_check(result["source_count"] == 16 and result["supported_count"] == 11 and result["unsupported_count"] == 5, "actual capability11/5, source16 unchanged")
	var selected: Node = null
	for actor in result["instances"]:
		actor.process_mode = Node.PROCESS_MODE_DISABLED
		holder.actors.append(actor)
		holder.add_child(actor)
		if actor.data["id"] == RECORD_ID:
			selected = actor
	_check(selected != null and selected.get_script() == HiveScript, "factory constructs dedicated hive actor")
	if selected != null:
		var snapshot: Dictionary = selected.get_snapshot()
		_check(snapshot["order"] == 15 and snapshot["etype"] == 1 and snapshot["element"] == "lightning", "actual actor identity")
		_check(snapshot["hp"] == 875 and snapshot["eShield"] == 875 and snapshot["poise"] == 875 and snapshot["native_frame"] == 0, "native original fields, no simulation at registration")
		_near(snapshot["projectile_ticks"], 233.01430687308311, "initial original projectile timer")
		_near(snapshot["idle_ticks"], 73.7369225313887, "initial original idle timer")
		_near(selected.radius, 20.63275862764567, "original collision radius")
		_check(selected.position == Vector2(4125.581107525944, 263.29083522849453), "original spawn cast to native Vector2 without placement correction")
		_check(not snapshot["undead_for_anti_revive"] and not snapshot["full_equipment_modifiers_ported"], "type1 does not inherit type4 undead trait")
		for key in _runtime["native_flags"]:
			_check(selected.data["native_flags"][key] == record["native_final"][key], "original native flag " + key)
		_check(selected.data["initial_timers"] == record["initial_timers"], "initial source timers copied without reseeding")
		var body = selected.get_node("Body")
		_check(body.region_rect == Rect2(1024, 0, 256, 256), "real hive cell4, not bone archer")
	_check(JSON.stringify(record) == before and record["runtime"] == null and not record["support"]["runtime_supported"], "frozen origin remains declarationfalse/runtimenull")
	holder.free()
	return true

func _movement_atlas() -> bool:
	var speed = 0.37612932557612655
	# Independent scalar outcomes from the ordered source stages, not a
	# transcription of its branch code. Point blocking differs from radius.
	for sample in [[650.0, 2.2, false, false], [500.0, 1.2, false, false], [200.0, 0.7, false, false], [60.0, -1.1, false, false], [80.0, -0.5, false, false], [200.0, 0.0, true, false], [500.0, 0.0, false, true]]:
		var f = _hive_fixture(sample[0], 0.0, true, sample[2], sample[3])
		var before: Vector2 = f["actor"].position
		_tick(f["actor"])
		_near(f["actor"].position.x - before.x, speed * sample[1], "two-stage move distance=" + str(sample[0]), 0.001)
		_near(f["actor"].position.y - before.y, 0.0, "no orthogonal drift", 0.001)
		_check(f["target"].packets.is_empty(), "type1 has no body-contact attack")
		f["holder"].free()
	var no_los = _hive_fixture(75, 0, false)
	_tick(no_los["actor"])
	_check(not no_los["actor"].get_snapshot()["alerted"], "LOSfalse near75 adds no invented near-alert")
	_check(no_los["target"].packets.is_empty(), "no hidden contact packet when LOS blocked")
	no_los["holder"].free()
	var directions = ["east", "south_east", "south", "south_west", "west", "north_west", "north", "north_east"]
	for index in range(8):
		var f = _hive_fixture(650, index * PI / 4.0)
		_tick(f["actor"])
		var body = f["actor"].get_node("Body")
		var walk = f["actor"].get_node("WalkOverlay")
		_check(body.texture.resource_path == "res://assets/enemy/atlas_ch1_8dir_" + directions[index] + ".png", "actual body direction " + directions[index])
		_check(walk.texture.resource_path == "res://assets/enemy/atlas_ch1_8dir_walk_" + directions[index] + ".png", "actual walk direction " + directions[index])
		_check(walk.region_rect == Rect2(4096, 0, 256, 256), "initial source walk cell")
		f["holder"].free()
	var moving = _hive_fixture(795, 0)
	var frames_seen: Dictionary = {0: true}
	for _index in range(1600):
		_tick(moving["actor"])
		var distance: float = moving["actor"].get_snapshot()["walk_distance"]
		var cell = int(floor(distance / 128.0)) % 4
		frames_seen[cell] = true
		_check(moving["actor"].get_node("WalkOverlay").region_rect == Rect2(4096 + cell * 256, 0, 256, 256), "real travel selects source128px frame")
		if frames_seen.size() == 4:
			break
	_check(frames_seen.size() == 4, "all four original walk cells observed by movement, not frame setters")
	moving["holder"].free()
	return true

func _projectile_vfx() -> bool:
	_events.clear()
	var charged = _hive_fixture(500, 0, true, false, true)
	_tick(charged["actor"], 233)
	_check(charged["actor"].charge_ticks == 0, "233 eligible updates do not begin early")
	_tick(charged["actor"])
	_check(charged["actor"].charge_ticks == 60, "234th eligible update begins source60 charge")
	_tick(charged["actor"], 59)
	_check(_events_of("enemy_projectile_birth").is_empty(), "charge does not fire at59")
	var center: Vector2 = charged["actor"].global_position
	_tick(charged["actor"])
	var children = charged["holder"].get_children().filter(func(value): return value.get_script() == LightningScript)
	_check(children.size() == 1, "60th charge tick creates one actual lightning projectile")
	if children.size() == 1:
		var shot = children[0]
		_check(shot.global_position == center and shot.native_frame == 294 and charged["actor"].state == "idle", "actor-center birth/local frame294/independent idle state")
		charged["actor"].free()
		_tick(shot)
		_check(not shot.get_snapshot()["ended"] and shot.native_frame == 295, "already born projectile advances after owner free")
	charged["holder"].free()
	var visual = _projectile_fixture(Vector2.ZERO, Vector2(1000, 0), Vector2.ZERO)
	var shot = visual["shot"]
	var sprite = shot.get_node("LightningCometFlight")
	_check(sprite.texture.resource_path == "res://assets/vfx/proj_bolt_comet.png" and sprite.region_rect == Rect2(0, 0, 254, 137), "actual imported comet texture/crop")
	_near(sprite.scale.x * 254, 123.2, "original comet length")
	_near(sprite.scale.y * 137, 66.4503937007874, "original comet height")
	_near(sprite.position.x, -14.784, "original comet asymmetric center")
	_check(sprite.material is ShaderMaterial and sprite.material.get_shader_parameter("element_tint") == Color("#ffee00"), "real source color shader uniform")
	_near(sprite.material.get_shader_parameter("tint_alpha"), 0.65, "source-atop tint strength")
	_tick(shot)
	_near(shot.get_snapshot()["render_phase"], 0, "physics never advances visible render phase")
	_render_tick(shot, 9)
	_near(shot.get_snapshot()["render_phase"], 1.08, "ten actual visible render calls")
	_check(sprite.region_rect == Rect2(254, 0, 254, 137), "source+.12 render selects actual frame1")
	_near(sprite.modulate.a, 1, "source flight alpha1")
	visual["holder"].free()
	var near_camera = _projectile_fixture(Vector2.ZERO, Vector2(10000, 0), Vector2(2000, 0))
	_tick(near_camera["shot"], 270)
	_check(near_camera["shot"].get_snapshot()["near_camera_extensions"] == 1 and near_camera["shot"].life_ticks == 1, "life180/.667 expires at270 and near camera extends1")
	near_camera["holder"].free()
	var far_camera = _projectile_fixture(Vector2.ZERO, Vector2(10000, 0), Vector2(3000, 0))
	_tick(far_camera["shot"])
	_check(far_camera["shot"].get_snapshot()["ended"] and far_camera["shot"].life_ticks == 180, "front camera cull before lifetime decay")
	far_camera["holder"].free()
	for sample in [["idle", 0.0, false, true, 350], ["windup", 0.0, true, true, 350], ["dead", 0.0, true, true, 0], ["charge", 0.0, false, false, 350], ["idle", 1.0, false, false, 350]]:
		var f = _projectile_fixture(Vector2.ZERO, Vector2(4, 0), Vector2.ZERO, sample[0], sample[1], sample[2], sample[4])
		_tick(f["shot"])
		_check(f["target"].packets.size() == int(sample[3]), "source ordinary on-hit outer guard " + sample[0])
		if sample[3]:
			var packet: Dictionary = f["target"].packets[0]
			_check(packet["amount"] == 48 and packet["kind"] == "magic" and packet["impulse"] == 2.0, "actual selected no-affix lightning48/magic/KB2 request")
			_near(f["shot"].get_electric_snapshot()["electric_ticks"], 30, "counter append even if internal damage sink rejects")
			var impacts = f["holder"].get_children().filter(func(value): return value.has_method("get_snapshot") and value.get_snapshot().has("duration_ticks"))
			_check(impacts.size() == 1, "actual on-hit creates independent two-layer impact")
			if impacts.size() == 1:
				var impact = impacts[0]
				_check(impact.get_snapshot()["duration_ticks"] == 66 and impact.get_snapshot()["age_ticks"] == 0, "requested48 becomes actual66, birthage0")
				_check(impact.get_node("LightningImpactLayer1").region_rect == Rect2(0, 0, 128, 128) and impact.get_node("LightningImpactLayer2").region_rect == Rect2(0, 0, 128, 170), "two real original sheet cells")
				_tick(impact, 2)
				_near(impact.get_snapshot()["sizes"][1], 0, "FBF delay2.64, age2 stillzero")
				_tick(impact)
				_check(impact.get_snapshot()["sizes"][1] > 0, "FBF actual size begins after age3")
				_tick(impact, 62)
				_check(not impact.is_queued_for_deletion() and impact.get_snapshot()["frames"] == [15, 11], "age65 finalframes16/12 and still alive")
				_tick(impact)
				_check(impact.is_queued_for_deletion(), "actual impact expiry at66")
		f["holder"].free()
	return true

func _player_fixture(automatic: bool = false) -> Dictionary:
	var holder = TechnicalWorld.new()
	root.add_child(holder)
	var player = PlayerScript.new()
	player.set_world(holder)
	holder.target = player
	holder.add_child(player)
	# Paused SceneTree prevents automatic dispatch while retaining the
	# CharacterBody physics space for explicit method fixtures. DISABLED
	# would remove its body from the space and invalidate motion calls.
	player.process_mode = Node.PROCESS_MODE_PAUSABLE
	_camera(holder, Vector2.ZERO)
	return {"holder": holder, "player": player}

func _actual_player_shot(f: Dictionary) -> Node:
	var shot = LightningScript.new()
	shot.configure(f["player"].global_position - Vector2(4, 0), Vector2.RIGHT, _runtime["projectile"].duplicate(true), f["player"], f["holder"], 0)
	shot.telemetry_event.connect(_observe)
	f["holder"].add_child(shot)
	return shot

func _electric_clock() -> bool:
	var f = _player_fixture()
	var player = f["player"]
	var shot = _actual_player_shot(f)
	_tick(shot)
	var counter = player.get_node("NativeElectricCounter")
	_check(player.hp == 302 and player.get("_knockback") == Vector2(2, 0), "new lightning actual Player magic48 and additive packetKB2, baseline EDEF0")
	_check(counter.get_snapshot()["idle_tick_signal_connected"] and not counter.is_physics_processing(), "actual player-owned counter subscribes exact idle publisher, no sampler")
	_near(counter.get_snapshot()["electric_ticks"], 30, "fresh post-damage counter30")
	while player.state != "idle":
		_tick(player)
	_near(counter.get_snapshot()["electric_ticks"], 30, "stagger and its final idle-transition update freeze counter")
	Input.action_press("move_right")
	_fixture_action_edges += 1
	_tick(player)
	Input.action_release("move_right")
	_fixture_action_edges += 1
	_near(counter.get_snapshot()["electric_ticks"], 29, "real idle walking publisher consumes one tick")
	_check(player.velocity.x > 0, "real Input action enters movement rather than timer-only getter")
	Input.action_press("weapon")
	_fixture_action_edges += 1
	_tick(player)
	Input.action_release("weapon")
	_fixture_action_edges += 1
	_check(player.state == "swing", "public held autoattack leaves idle at actual publisher gate")
	_near(counter.get_snapshot()["electric_ticks"], 29, "idle->autoattack update does not consume counter")
	while player.state != "idle":
		_tick(player)
	_near(counter.get_snapshot()["electric_ticks"], 29, "swing/recover and last recover->idle update freeze")
	_check(player.request_attack(), "public second combo request enters actual phase")
	while player.state != "idle":
		_tick(player)
	Input.action_press("weapon")
	_fixture_action_edges += 1
	_tick(player, 6)
	_check(player.is_charging(), "real third-step hold reached through public requests/Input action")
	_near(counter.get_snapshot()["electric_ticks"], 29, "KiSlash windup freezes only timer; no charge-immunity alias")
	Input.action_release("weapon")
	_fixture_action_edges += 1
	_check(player.cancel_attack(), "public cancel leaves actual hold without private state writes")
	var again = _actual_player_shot(f)
	_tick(again)
	_check(player.get_node("NativeElectricCounter") == counter, "second projectile reuses one owner counter")
	_near(counter.get_snapshot()["electric_ticks"], 30, "real second hit refreshes max30")
	while player.state != "idle":
		_tick(player)
	# Explicit fractional-delta API contract only, not automatic native60
	# or game-speed evidence; no timer/HP/state/clock field is rewritten.
	for _frame in range(30):
		_explicit_physics_calls += 1
		player._physics_process(1.01 / 60.0)
	_near(counter.get_snapshot()["electric_ticks"], -0.3, "positive counter may cross below zero without clamp")
	_tick(player)
	_near(counter.get_snapshot()["electric_ticks"], -0.3, "negative counter no further decrement")
	_check(counter.apply_native_electric(30) and not counter.apply_native_electric(30), "public max refresh reports extension only")
	f["holder"].free()
	# One small real SceneTree dispatch fixture. Signals are observed only;
	# test never emits status/telemetry or writes game simulation fields.
	var live = _player_fixture(true)
	var automatic_player = live["player"]
	var clock_before: float = automatic_player.get("_clock_frames")
	var idle_before = _automatic_idle_dispatches
	automatic_player.native_idle_status_tick.connect(func(_ticks):
		_automatic_idle_dispatches += 1
		_dispatch_log.append("idle"))
	var automatic_shot = _actual_player_shot(live)
	automatic_shot.telemetry_event.connect(func(kind, _data):
		if kind == "enemy_projectile_hit":
			_dispatch_log.append("hit"))
	paused = false
	for _frame in range(3):
		await physics_frame
		await process_frame
	paused = true
	var automatic_counter = automatic_player.get_node("NativeElectricCounter")
	_check(_dispatch_log.has("idle") and _dispatch_log.has("hit") and _dispatch_log.find("idle") < _dispatch_log.find("hit"), "actual player0 dispatch precedes shot1 append")
	var frozen: float = automatic_counter.get_snapshot()["electric_ticks"]
	var idle_at_pause = _automatic_idle_dispatches
	for _frame in range(4):
		await physics_frame
	_check(_automatic_idle_dispatches == idle_at_pause and automatic_counter.get_snapshot()["electric_ticks"] == frozen, "actual paused tree four engine frames preserve owner status")
	_automatic_fixture_ticks += int(round(automatic_player.get("_clock_frames") - clock_before))
	_check(_automatic_fixture_ticks > 0 and _automatic_idle_dispatches > idle_before, "automatic simulation counted separately from explicit methods")
	live["holder"].free()
	return true

func _run() -> void:
	_source = _read_json(SOURCE_FILE)
	_runtime = _read_json(CONFIG_FILE)["runtime"]
	await _run_group("exact_hive_factory_admission", _exact_admission)
	await _run_group("hive_ranged_movement_and_atlas", _movement_atlas)
	await _run_group("hive_lightning_projectile_and_vfx", _projectile_vfx)
	await _run_group("hive_electric_counter_owner_and_clock", _electric_clock)
	var result = {"passed": _passed, "failed_assertions": _failed_assertions, "incomplete_groups": _incomplete, "explicit_physics_method_calls": _explicit_physics_calls, "render_method_calls": _render_method_calls, "automatic_fixture_simulation_ticks": _automatic_fixture_ticks, "automatic_native_idle_dispatches": _automatic_idle_dispatches, "fixture_Input_action_edges": _fixture_action_edges, "GUI_inputs": 0, "source_factory_reproduction": 0, "source_or_PNG_hashes": 0, "old_suites": 0, "actual_public_play_evidence": false, "actual_pixel_or_performance_evidence": false}
	print("RESULT " + JSON.stringify(result))
	quit(0 if _failed_assertions == 0 and _incomplete.is_empty() else 1)
