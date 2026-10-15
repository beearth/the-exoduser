extends SceneTree
## New standalone TYPE7 dependency contracts only. No Main/factory/save/GUI.
## Constructor episodes are not a natural registered type7 encounter. Source
## raw timers expose summon_due before teleport completion; we do not skip it.
## No live HP/position/state/private clock setters or deterministic RNG hook.

const TeleportScript = preload("res://scripts/native_type7_teleport.gd")
const PlayerScript = preload("res://scripts/player.gd")
const PROFILE_FILE = "res://data/type7_teleport.json"
const STEP = 1.0 / 60.0
const OWNER_RADIUS = 22.73476334709674
const LANDING_THRESHOLD = (OWNER_RADIUS + 10.0) * 2.0 + 15.0

class OwnerContext extends CharacterBody2D:
	var attack = 40
	var radius = OWNER_RADIUS
	var facing = PI / 2.0
	var alive = true
	var state: String
	var native_flags = {"ib": false, "_ch1StartMedium": false, "_iceOnHit": false, "_lavaBurn": false}
	var mods = ["M30"]
	var _constructor_status: Dictionary
	var explicit_movement_calls = 0

	func _init(initial_position: Vector2, initial_state: String = "idle", initial_status: Dictionary = {}) -> void:
		position = initial_position
		state = initial_state
		_constructor_status = {"stun_ticks": 0.0, "frozen_ticks": 0.0, "hit_stun_ticks": 0.0}
		_constructor_status.merge(initial_status, true)
		collision_layer = 0
		collision_mask = 0

	func get_snapshot() -> Dictionary:
		return _constructor_status.duplicate(true)

	func advance_public_movement() -> void:
		# Generic constructor provider consumes actual public Input. This is not
		# a type7 AI implementation and does not assign a live position.
		explicit_movement_calls += 1
		velocity = Input.get_vector("move_left", "move_right", "move_up", "move_down") * 60.0
		move_and_slide()

class ReadonlyTargetContext extends Node2D:
	var radius = 15.0
	var iframes: float
	var hp: int
	var state: String
	var packets: Array = []
	var impulses: Array = []
	var burns: Array = []

	func _init(initial_position: Vector2, initial_state: String = "idle", initial_iframes: float = 0.0, initial_hp: int = 350) -> void:
		position = initial_position
		state = initial_state
		iframes = initial_iframes
		hp = initial_hp

	func receive_damage(amount: int, dtype: String = "phys", direction: Vector2 = Vector2.ZERO, strength: float = -1.0) -> void:
		# Packet oracle only; actual NativePlayer is used separately below.
		packets.append({"amount": amount, "dtype": dtype, "direction": direction, "strength": strength})

	func apply_native_posthurt_knockback(impulse: Vector2) -> void:
		impulses.append(impulse)

	func apply_native_burn(total: float) -> bool:
		burns.append(total)
		return true

class InitialPlayer extends PlayerScript:
	func _init(initial_position: Vector2) -> void:
		# Scene constructor placement, before ready/physics, never calibration.
		position = initial_position

class MissingOwnerBinding extends Node2D:
	# Deliberately absent alive/state, constructed invalid before configure.
	var attack = 40
	var radius = OWNER_RADIUS
	var facing = 0.0
	var native_flags = {"ib": false, "_ch1StartMedium": false}
	var mods = ["M30"]
	func get_snapshot() -> Dictionary:
		return {"stun_ticks": 0.0, "frozen_ticks": 0.0}

class WrongOwnerBinding extends MissingOwnerBinding:
	var alive: Variant
	var state: Variant
	func _init(initial_alive: Variant, initial_state: Variant) -> void:
		alive = initial_alive
		state = initial_state

class MissingTargetBinding extends Node2D:
	# Actual target methods/HP exist, but state is absent at construction.
	var radius = 15.0
	var iframes = 0.0
	var hp = 350
	func receive_damage(_amount: int, _kind: String = "phys") -> void:
		pass
	func apply_native_posthurt_knockback(_impulse: Vector2) -> void:
		pass
	func apply_native_burn(_total: float) -> bool:
		return false

class WrongTargetBinding extends MissingTargetBinding:
	var state: Variant
	func _init(initial_state: Variant) -> void:
		state = initial_state

class FixtureWorld extends Node2D:
	var initial_can_move: bool
	var probes: Array = []
	var token: Array = []

	func _init(initial_position: Vector2 = Vector2.ZERO, passable: bool = true) -> void:
		position = initial_position
		initial_can_move = passable

	func can_move(point: Vector2, radius: float) -> bool:
		probes.append({"point": point, "radius": radius})
		return initial_can_move

	func is_world_blocked(_point: Vector2) -> bool:
		return false

	func get_enemies() -> Array:
		return token

class ObservedController extends TeleportScript:
	var automatic_render_calls = 0
	func _process(delta: float) -> void:
		automatic_render_calls += 1
		super._process(delta)

var _profile: Dictionary
var _only: Array = []
var _failed_assertions = 0
var _valid_completed: Array = []
var _passed_groups: Array = []
var _events: Array = []
var _observations: Dictionary = {}
var _idle_calls = 0
var _queue_calls = 0
var _controller_render_calls = 0
var _direct_visual_render_calls = 0
var _player_physics_calls = 0
var _public_damage_requests = 0
var _fixture_movement_calls = 0
var _input_edges = 0
var _automatic_physics_signals = 0
var _actual_shot_auto_calls = 0
var _actual_controller_auto_calls = 0
var _actual_birth_phase_calls = 0
var _paused_physics_signal_observations = 0

func _initialize() -> void:
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon", "cancel_charge", "pause"]:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="):
			_only = Array(arg.trim_prefix("--only=").split(","))
	paused = true
	physics_frame.connect(func(): _automatic_physics_signals += 1)
	call_deferred("_run")

func _check(value: bool, label: String) -> void:
	if not value:
		_failed_assertions += 1
		print("ASSERT_FAIL " + label)

func _near(actual: float, expected: float, label: String, epsilon: float = 0.0001) -> void:
	_check(absf(actual - expected) <= epsilon, "%s actual=%s expected=%s" % [label, actual, expected])

func _vec(value: Variant) -> Vector2:
	return value if value is Vector2 else Vector2(float(value[0]), float(value[1]))

func _near_vector(actual: Vector2, expected: Vector2, label: String, epsilon: float = 0.001) -> void:
	_check(actual.distance_to(expected) <= epsilon, "%s actual=%s expected=%s" % [label, actual, expected])

func _record(kind: String, data: Dictionary) -> void:
	_events.append({"kind": kind, "data": data.duplicate(true)})

func _raw_state() -> Dictionary:
	return _profile["initial_native_state_reference"].duplicate(true)

func _terminal_episode(destination: Vector2) -> Dictionary:
	# An in-progress episode constructor, not an injected live warning. Full
	# natural source order is tested separately and stops at summon_due.
	var state = _raw_state()
	state["_tpWarnT"] = 1.0
	state["_tpWarnMax"] = 120.0
	state["_tpWarnX"] = destination.x
	state["_tpWarnY"] = destination.y
	state["_tpWarnCol"] = "#8833cc"
	state["summonT"] = state["summonCd"]
	return state

func _fixture(state: Dictionary, actor_global: Vector2, target_global: Vector2, passable: bool = true, target_state: String = "idle", target_iframes: float = 0.0, actual_player: bool = false, owner_state: String = "idle", owner_status: Dictionary = {}, origin: Vector2 = Vector2.ZERO) -> Dictionary:
	var world = FixtureWorld.new(origin, passable)
	root.add_child(world)
	var owner = OwnerContext.new(actor_global - origin, owner_state, owner_status)
	world.add_child(owner)
	var target: Node2D = InitialPlayer.new(target_global - origin) if actual_player else ReadonlyTargetContext.new(target_global - origin, target_state, target_iframes)
	world.add_child(target)
	var controller = ObservedController.new()
	world.add_child(controller)
	controller.telemetry_event.connect(_record)
	var accepted = controller.configure(owner, target, world, state, _profile)
	_check(accepted, "standalone constructor accepted: " + str(controller.get_snapshot().get("configuration_error")))
	return {"world": world, "owner": owner, "target": target, "controller": controller, "state": state, "token": world.token}

func _idle(f: Dictionary, frame: float, distance: float = 75.0) -> Dictionary:
	_idle_calls += 1
	return f["controller"].advance_idle(1.0, distance, frame, f["token"])

func _queue(f: Dictionary, frame: float, token: Variant = null) -> void:
	_queue_calls += 1
	f["controller"].advance_shot_warnings(1.0, frame, f["token"] if token == null else token)

func _render(controller: Node, ticks: float, now: float = 1000.0, slow: float = 1.0) -> void:
	_controller_render_calls += 1
	controller.advance_render(ticks, now, slow)

func _input(action: String, pressed: bool) -> void:
	_input_edges += 1
	if pressed:
		Input.action_press(action)
	else:
		Input.action_release(action)

func _dispose(f: Dictionary) -> void:
	if is_instance_valid(f["world"]):
		f["world"].free()

func _reject_binding_atomically(owner: Node2D, target: Node2D, label: String) -> void:
	var world = FixtureWorld.new()
	root.add_child(world)
	world.add_child(owner)
	world.add_child(target)
	var controller = ObservedController.new()
	world.add_child(controller)
	controller.telemetry_event.connect(_record)
	var state_ref = _raw_state()
	var initial_state = state_ref.duplicate(true)
	var event_count = _events.size()
	var children = world.get_child_count()
	var owner_position = owner.global_position
	var target_position = target.global_position
	_check(not controller.configure(owner, target, world, state_ref, _profile), "invalid initial binding rejects: " + label)
	_check(state_ref == initial_state and world.get_child_count() == children and _events.size() == event_count, "invalid initial binding has no state/children/events mutation: " + label)
	_near_vector(owner.global_position, owner_position, "invalid initial binding keeps owner location: " + label)
	_near_vector(target.global_position, target_position, "invalid initial binding keeps target location: " + label)
	_check(int(target.get("hp")) == 350, "invalid initial binding keeps HP: " + label)
	world.free()

func _native_idle_clock_contexts() -> void:
	_reject_binding_atomically(MissingOwnerBinding.new(), ReadonlyTargetContext.new(Vector2.ZERO), "actor alive/state absent")
	_reject_binding_atomically(WrongOwnerBinding.new(1, "idle"), ReadonlyTargetContext.new(Vector2.ZERO), "actor alive int")
	_reject_binding_atomically(WrongOwnerBinding.new(true, 7), ReadonlyTargetContext.new(Vector2.ZERO), "actor state int")
	_reject_binding_atomically(OwnerContext.new(Vector2.ZERO), MissingTargetBinding.new(), "target state absent")
	_reject_binding_atomically(OwnerContext.new(Vector2.ZERO), WrongTargetBinding.new(7), "target state int")
	var start = Vector2(4075.0, 340.0)
	var f = _fixture(_raw_state(), start, start + Vector2(75, 0), true, "idle", 0, true)
	var initial = f["controller"].get_snapshot()["native_state"]
	var missing = f["controller"].advance_idle(1.0, 75.0)
	_idle_calls += 1
	_check(missing.get("caller_boundary_error", "") == "missing_explicit_native_frame_or_logical_world_identity", "absent actual frame rejects phase")
	_check(f["controller"].get_snapshot()["native_state"] == initial, "missing caller does not consume timers")
	for frame in range(1, 112):
		_idle(f, frame)
		_queue(f, frame)
	_check(f["controller"].get_snapshot()["warnings"].is_empty(), "no queued shot before raw warning completion")
	_near(float(f["state"]["_tpWarnT"]), 0, "raw no warning through111")
	var result = _idle(f, 112)
	_check(result.get("warning_started", false), "raw112 first native warning")
	_near(float(f["state"]["_tpWarnT"]), 120, "creation update does not decrement warning")
	var fixed = Vector2(f["state"]["_tpWarnX"], f["state"]["_tpWarnY"])
	var proposal_distance = fixed.distance_to(f["target"].global_position)
	_check(proposal_distance >= 149.999 and proposal_distance <= 200.001, "actual randf proposal inside source annulus")
	_near_vector(f["owner"].global_position, start, "proposal does not teleport body")
	var before_walk: Vector2 = f["target"].global_position
	_input("move_right", true)
	f["target"]._physics_process(STEP)
	_player_physics_calls += 1
	_input("move_right", false)
	_check(f["target"].global_position.x > before_walk.x, "actual Player public Input moves during fixture")
	for frame in range(113, 159):
		result = _idle(f, frame)
		_queue(f, frame)
	_near_vector(Vector2(f["state"]["_tpWarnX"], f["state"]["_tpWarnY"]), fixed, "warning target fixed after actual Player movement")
	_check(result.get("summon_due", false), "raw158 mandatory summon consumer is exposed")
	_check(not result.get("full_summon_consumer_ready", true), "does not disguise missing summon as implemented")
	_near(float(f["state"]["_tpWarnT"]), 74, "warning remaining at raw summon boundary")
	_check(f["world"].probes.size() == 1, "one initial canMove proposal probe before summon boundary")
	_observations["raw_episode"] = {"warning_frame": 112, "summon_due_frame": 158, "proposal_distance": proposal_distance, "warning_remaining": 74, "player_public_movement": f["target"].global_position - before_walk, "full_natural_completion_executed": false}
	_dispose(f)
	var invalid = _fixture(_raw_state(), start, start + Vector2(75, 0), false)
	for frame in range(1, 113):
		result = _idle(invalid, frame)
	_check(result.get("target_invalid", false), "real random proposal failed initial canMove")
	_near(float(invalid["state"]["teleportT"]), 30, "failed entry timer30")
	_check(invalid["controller"].get_effect_snapshots().is_empty(), "failed entry emits no FX")
	_dispose(invalid)
	for status in ["eSummon", "recover"]:
		var episode = _terminal_episode(start + Vector2(180, 0))
		var paused_owner = _fixture(episode, start, start + Vector2(75, 0), true, "idle", 0, false, status)
		var before = episode.duplicate(true)
		_check(not _idle(paused_owner, 1).get("idle_consumed", true), "constructor source phase " + status + " stops warning")
		_check(episode == before, status + " does not decrement native timers")
		_dispose(paused_owner)
	for status in [{"stun_ticks": 1.0}, {"frozen_ticks": 1.0}, {"hit_stun_ticks": 1.0}]:
		var episode = _terminal_episode(start + Vector2(180, 0))
		var guarded = _fixture(episode, start, start + Vector2(75, 0), true, "idle", 0, false, "idle", status)
		_check(not _idle(guarded, 1).get("idle_consumed", true), "constructor owner status stops idle phase")
		_near(float(episode["_tpWarnT"]), 1, "constructor guard preserves in-progress timer")
		_dispose(guarded)

func _landing_public_player_and_guards() -> void:
	var destination = Vector2(2048, 4096)
	var failed = _fixture(_terminal_episode(destination), destination - Vector2(180, 0), destination + Vector2(10, 0), false)
	var owner_before: Vector2 = failed["owner"].global_position
	var result = _idle(failed, 1)
	_check(result.has("teleported") and not result["teleported"], "completion canMove recheck fails")
	_near_vector(failed["owner"].global_position, owner_before, "completion failure leaves body at actual old location")
	_check(failed["target"].packets.is_empty() and failed["controller"].get_effect_snapshots().is_empty(), "completion failure has no landing request/FX")
	_check(failed["controller"].get_snapshot()["warnings"].size() == 1, "caller still queues shot despite teleportE false")
	_near(float(failed["state"]["teleportT"]), 175.49626126885414, "completion resets source cooldown despite false")
	_near(float(failed["state"]["_tpWarnT"]), 0, "completion clears warning despite false")
	_dispose(failed)
	var real = _fixture(_terminal_episode(destination), destination - Vector2(180, 0), destination + Vector2(20, 0), true, "idle", 0, true, "idle", {}, Vector2(1024, 2048))
	var accepted_kb: Array = []
	real["target"].telemetry_event.connect(func(kind, data):
		_record(kind, data)
		if kind == "player_damage":
			accepted_kb.append(real["target"].get_native_knockback())
	)
	result = _idle(real, 1)
	_check(result.get("teleported", false), "actual successful completion moves source owner")
	_near_vector(real["owner"].global_position, destination, "consumer global destination in translated world")
	_check(real["target"].hp == 236, "real NativePlayer420 request cap+DEF yields114 loss")
	_check(accepted_kb.size() == 1, "one actual NativePlayer accepted damage event")
	if accepted_kb.size() == 1:
		_near(accepted_kb[0].length(), 114.0 / 350.0 * 30.0, "ordinary default randomKB retained")
		_near_vector(real["target"].get_native_knockback() - accepted_kb[0], Vector2(120, 0), "posthurt120 is additive after defaultKB")
	_observations["actual_landing"] = {"raw_request": 420, "hp": real["target"].hp, "ordinary_KB": accepted_kb, "total_KB": real["target"].get_native_knockback(), "constructor_translated_world": [1024, 2048]}
	_dispose(real)
	var dead = _fixture(_terminal_episode(destination), destination - Vector2(180, 0), destination, true, "idle", 0, true)
	for request in range(4):
		dead["target"].receive_damage(1000)
		_public_damage_requests += 1
	_check(dead["target"].hp == 0 and dead["target"].state == "dead", "actual public damage requests acquire dead guard")
	var before_kb: Vector2 = dead["target"].get_native_knockback()
	_idle(dead, 1)
	_check(dead["target"].hp == 0, "internally rejected landing cannot revive or damage dead Player")
	_near_vector(dead["target"].get_native_knockback() - before_kb, Vector2(120, 0), "inner dead rejection still receives posthurtKB; zero displacement is RIGHT")
	_dispose(dead)
	for condition in [{"state": "charge", "iframes": 0.0}, {"state": "idle", "iframes": 60.0}, {"state": "windup", "iframes": 0.0}]:
		var f = _fixture(_terminal_episode(destination), destination - Vector2(180, 0), destination, true, condition["state"], condition["iframes"])
		_idle(f, 1)
		var expects = 1 if condition["state"] == "windup" else 0
		_check(f["target"].packets.size() == expects and f["target"].impulses.size() == expects, "literal charge/iframe guards differ from KiSlash windup")
		if expects == 1 and not f["target"].packets.is_empty():
			_check(f["target"].packets[0]["amount"] == 420 and f["target"].packets[0]["dtype"] == "phys" and f["target"].packets[0]["strength"] == -1.0, "landing supplies only ordinary damage two-arg path")
		_dispose(f)
	for margin in [-0.05, 0.05]:
		var f = _fixture(_terminal_episode(destination), destination - Vector2(180, 0), destination + Vector2(LANDING_THRESHOLD + margin, 0))
		_idle(f, 1)
		_check(f["target"].packets.size() == (1 if margin < 0 else 0), "strict source landing range straddled without float equality claim")
		_dispose(f)
	_observations["landing_scope"] = {"literal_charge_context_only": true, "actual_Player_natural_charge_state_observed": false, "strict_boundary_offsets": [-0.05, 0.05], "eModHitP_M30_effect": false}

func _queued_birth_identity_and_automatic_clock() -> void:
	var destination = Vector2(1024, 2048)
	for kind in ["array", "dictionary"]:
		var f = _fixture(_terminal_episode(destination), destination - Vector2(180, 0), destination + Vector2(1000, 0))
		var token: Variant = ["generation"] if kind == "array" else {"generation": 1}
		_idle_calls += 1
		f["controller"].advance_idle(1, 75, 1, token)
		_queue_calls += 1
		f["controller"].advance_shot_warnings(1, 1, token)
		_near(float(f["controller"].get_snapshot()["warnings"][0]["t"]), 59, "same phase queued warning first59")
		var equal_new = token.duplicate(true)
		_queue_calls += 1
		f["controller"].advance_shot_warnings(1, 2, equal_new)
		_check(f["controller"].get_snapshot()["warnings"].is_empty() and f["controller"].get_delivery_snapshots().is_empty(), "same content new " + kind + " reference cancels")
		_dispose(f)
	var removed = _fixture(_terminal_episode(destination), destination - Vector2(180, 0), destination + Vector2(1000, 0))
	_idle(removed, 1)
	_queue(removed, 1)
	removed["owner"].free()
	_queue(removed, 2)
	_check(removed["controller"].get_snapshot()["warnings"].is_empty(), "actual owner lifecycle removal cancels undelivered shot")
	_dispose(removed)
	var f = _fixture(_terminal_episode(destination), destination - Vector2(180, 0), destination + Vector2(1000, 0), true, "idle", 0, false, "idle", {}, Vector2(512, 1024))
	_idle(f, 1)
	_queue(f, 1)
	var warning = f["controller"].get_snapshot()["warnings"][0]
	var baked_heading: Vector2 = warning["shots"][0]["heading"]
	var baked_origin: Vector2 = warning["shots"][0]["origin"]
	var actor_before: Vector2 = f["owner"].global_position
	_input("move_down", true)
	f["owner"].advance_public_movement()
	_fixture_movement_calls += 1
	_input("move_down", false)
	var displacement: Vector2 = f["owner"].global_position - actor_before
	_check(displacement.y > 0.0, "actual public Input/move_and_slide provider moved owner")
	var recipe = f["controller"].get_queue_warning_recipe(0)
	_near_vector(_vec(recipe["origin"]), f["owner"].global_position, "charge cue follows current owner center")
	_near(float(recipe["ring_radius"]), OWNER_RADIUS + 10, "first lane ring actual source radius")
	_near(float(recipe["progress"]), 1.0 / 60.0, "born59 warning arc progress1/60")
	_check(recipe["background_color"] == "#080808" and recipe["background_width"] == 5 and recipe["arc_color"] == "#ffffff" and recipe["arc_width"] == 6 and recipe["round_cap"], "actual physical cue black ring and white round arc")
	_check(not recipe["preteleport_circle"] and not recipe["full_Q_E_parry_ported"], "physical cue is separate from removed preteleport circle and Q/E support")
	for frame in range(2, 60):
		_queue(f, frame)
	_check(f["controller"].get_delivery_snapshots().is_empty(), "no release before native60")
	_queue(f, 60)
	var deliveries = f["controller"].get_delivery_snapshots()
	_check(deliveries.size() == 1, "exact one native60 release")
	if deliveries.is_empty():
		_dispose(f)
		return
	var born = deliveries[0]
	_actual_birth_phase_calls += int(born["birth_explicit_phase_calls"])
	_near(float(born["damage"]), 48, "new caller damage48")
	_near(float(born["life_ticks"]), 299.333, "same phase consumes300 minus.667")
	_near(float(born["distance_travelled"]), 5, "born phase actual shared kernel moves5")
	_near(float(born["native_frame"]), 60, "postbirth frame equals release phase")
	_near(float(born["release_native_frame"]), 60, "readonly immutable release frame60")
	_near(float(born["birth_prephase"]["native_frame"]), 59, "constructor adapter one phase before release")
	_near(float(born["birth_prephase"]["life_ticks"]), 300, "prephase actual life300")
	_check(born["birth_prephase"]["birth_explicit_phase_calls"] == 0 and born["birth_prephase"]["auto_physics_calls"] == 0 and born["birth_explicit_phase_calls"] == 1 and born["auto_physics_calls"] == 0, "birth explicit once and automatic zero before deferred handoff")
	_near_vector(_vec(born["configured_global_origin"]), baked_origin + displacement, "release uses baked origin plus actual owner displacement")
	# The configured baked aim already passed through one real birth update;
	# its existing homing may rotate by .00109083 before the five-pixel move.
	var consumed_heading = _vec(born["heading"])
	var birth_homing_turn = baked_heading.angle_to(consumed_heading)
	_near(birth_homing_turn, -0.00109083, "baked aim receives only the one source birth homing turn", 0.0000001)
	_near_vector(_vec(born["global_position"]), baked_origin + displacement + consumed_heading * 5, "translated world consumed global origin once with actual birth heading")
	var snapshot_copy = f["controller"].get_delivery_snapshots()
	snapshot_copy[0]["birth_prephase"]["native_frame"] = -999
	_near(float(f["controller"].get_delivery_snapshots()[0]["birth_prephase"]["native_frame"]), 59, "readonly nested birth snapshot detached")
	f["owner"].free()
	_check(Engine.physics_ticks_per_second == 60, "actual fixture native physics60")
	paused = false
	for unused in range(3):
		await physics_frame
		await process_frame
	paused = true
	var after = f["controller"].get_delivery_snapshots()
	_check(after.size() == 1, "born shot remains world sibling after owner removal")
	if after.size() == 1:
		var current = after[0]
		_actual_shot_auto_calls += int(current["auto_physics_calls"])
		_check(current["auto_physics_calls"] > 0, "actual SceneTree automatic physical dispatch observed")
		_near(float(current["native_frame"]), 60 + int(current["auto_physics_calls"]), "subsequent automatic native frame has no doubled birth")
		_near(float(current["life_ticks"]), 300 - 0.667 * (1 + int(current["auto_physics_calls"])), "automatic life follows one birth plus actual callback count")
		var paused_snapshot = current.duplicate(true)
		for unused in range(4):
			await physics_frame
			_paused_physics_signal_observations += 1
			await process_frame
		var resumed = f["controller"].get_delivery_snapshots()[0]
		_check(resumed["auto_physics_calls"] == paused_snapshot["auto_physics_calls"] and resumed["life_ticks"] == paused_snapshot["life_ticks"], "pause frame signals do not advance actual shot callbacks")
		_observations["queued_birth_and_auto"] = {"born": born, "actual_after_auto": current, "pause_signals": 4, "source_global_scheduler_bound": false}
	_actual_controller_auto_calls += f["controller"].automatic_render_calls
	_dispose(f)
	_observations["queue_status_boundary"] = {"actual_owner_free_cancellation": true, "constructor_stun_freeze_idle_guards": true, "actual_type7_public_stun_freeze_during_queue_verified": false, "actual_literal_charge_state_on_NativePlayer_verified": false}

func _world_visuals(world: Node2D, suffix: String) -> Array:
	var nodes: Array = []
	for node in get_nodes_in_group("type7_tp_" + suffix):
		if node is TeleportScript.TPVisual and node.get_snapshot()["world_instance"] == world.get_instance_id():
			nodes.append(node)
	return nodes

func _visual_step(effect: Node, ticks: float, slow: float = 1.0) -> void:
	_direct_visual_render_calls += 1
	effect.advance_render(ticks, 1000.0, slow)

func _render_resources_clock_and_pool_handover() -> void:
	var destination = Vector2(3072, 5120)
	var f = _fixture(_terminal_episode(destination), destination - Vector2(180, 0), destination + Vector2(1000, 0), true, "idle", 0, false, "idle", {}, Vector2(1024, 2048))
	_idle(f, 1)
	var native_before = f["controller"].get_snapshot()["native_state"]
	_render(f["controller"], 10, 1000, 0.35)
	_check(f["controller"].get_snapshot()["native_state"] == native_before, "render ticks do not consume native teleport state")
	var effects: Dictionary = {}
	for effect in f["controller"].get_effect_snapshots():
		effects[effect["kind"]] = effect
	_near(float(effects["smoke_out"]["t"]), 3.5, "smoke local render slow.35")
	_near(float(effects["impact"]["t"]), 3.5, "impact local render slow.35")
	_near(float(effects["burst"]["frame"]), 1, "ordinary burst10 ticks increments only once")
	_near(float(effects["burst"]["frame_t"]), 0, "burst threshold resets with no carry")
	var p = 3.5 / 18.0
	_near(float(effects["smoke_out"]["draw_size"]), OWNER_RADIUS * 4 * (1 + 1.8 * p), "source smoke nonlinear size")
	_near(float(effects["smoke_out"]["alpha"]), (1 - p * p) * 0.85, "source smoke nonlinear alpha")
	_check(effects["bolt"]["segments"].size() >= 7 and effects["bolt"]["segments"].size() <= 10, "actual random bolt6..9 steps gives7..10 points")
	_near_vector(effects["bolt"]["segments"][0], destination - Vector2(180, 0), "actual random bolt departure endpoint")
	_near_vector(effects["bolt"]["segments"][-1], destination, "actual random bolt arrival endpoint")
	var impact = _world_visuals(f["world"], "impacts")[0]
	_visual_step(impact, 2.5)
	var sprite = impact.get_node("OriginalTPTexture") as Sprite2D
	_check(sprite.texture.get_width() == 401 and sprite.texture.get_height() == 401, "actual imported impact401 square")
	_check(sprite.region_rect == Rect2(200, 0, 200, 200), "actual impact6/24 selects second200 square cell")
	_check(sprite.show_behind_parent and sprite.texture_filter == CanvasItem.TEXTURE_FILTER_LINEAR, "original bitmap before core glow with linear filter")
	_near_vector(impact.global_position, destination, "translated world impact has exact global destination")
	var burst = _world_visuals(f["world"], "bursts")[0]
	var burst_sprite = burst.get_node("OriginalTPTexture") as Sprite2D
	_check(burst_sprite.texture.get_width() == 576 and burst_sprite.texture.get_height() == 64, "actual original burst9 horizontal cells")
	_check(burst_sprite.region_rect == Rect2(64, 0, 64, 64), "burst actual second64 cell after single threshold")
	_near(burst_sprite.scale.x * 64, OWNER_RADIUS * 8, "source burst actual Sprite scale")
	for mode in ["smoke_out", "impact", "burst"]:
		var missing = TeleportScript.TPVisual.new()
		missing.configure(mode, destination, Vector2.ZERO, 90, 18 if mode == "smoke_out" else 24, null, f["world"].get_instance_id(), false)
		f["world"].add_child(missing)
		_visual_step(missing, 3)
		_near(float(missing.get_snapshot()["t"]), 3 if mode == "smoke_out" else 0, "missing-image readiness age ordering " + mode)
		_check(not missing.get_snapshot()["image_ready"], "constructor missing image stays explicit")
		missing.free()
	f["owner"].free()
	var age_before = float(impact.get_snapshot()["t"])
	_render(f["controller"], 1)
	_near(float(impact.get_snapshot()["t"]), age_before + 1, "world-sibling FX continues after actual source owner removal")
	_dispose(f)
	var pool_world = FixtureWorld.new(Vector2(1024, 2048))
	root.add_child(pool_world)
	var target = ReadonlyTargetContext.new(Vector2(5000, 5000))
	pool_world.add_child(target)
	var controllers: Array = []
	for index in range(13):
		var owner = OwnerContext.new(Vector2(100 + index, 100))
		pool_world.add_child(owner)
		var controller = ObservedController.new()
		pool_world.add_child(controller)
		var episode = _terminal_episode(pool_world.to_global(Vector2(280 + index, 100)))
		_check(controller.configure(owner, target, pool_world, episode, _profile), "pool sibling configured")
		_idle_calls += 1
		controller.advance_idle(1, 75, index + 1, pool_world.token)
		controllers.append(controller)
		_render(controller, 1)
	_check(_world_visuals(pool_world, "smokes").size() == 10 and _world_visuals(pool_world, "impacts").size() == 12 and _world_visuals(pool_world, "bolts").size() == 8, "actual per-world pool caps10/12/8")
	var prior: Dictionary = {}
	for suffix in ["smokes", "impacts", "bolts"]:
		for effect in _world_visuals(pool_world, suffix):
			prior[effect.get_instance_id()] = effect.get_snapshot()
	for controller in controllers:
		_render(controller, 1)
	for suffix in ["smokes", "impacts", "bolts"]:
		for effect in _world_visuals(pool_world, suffix):
			var observation = effect.get_snapshot()
			_near(float(observation["t"]), float(prior[effect.get_instance_id()]["t"]) + 1, "one actual render age after every former/new controller phase")
			_check(observation["render_driver_instance"] != 0, "pool slot has actual single driver identity")
	var other = _fixture(_terminal_episode(destination), destination - Vector2(180, 0), destination + Vector2(1000, 0))
	_idle(other, 1)
	_check(_world_visuals(other["world"], "smokes").size() == 2 and _world_visuals(pool_world, "smokes").size() == 10, "world identity isolates same-group pool slots")
	_dispose(other)
	for controller in controllers:
		_render(controller, 24)
	var inactive_first = _world_visuals(pool_world, "impacts")[0]
	_check(not inactive_first.get_snapshot()["active"], "normal render expiry leaves inactive pooled slot")
	var owner = OwnerContext.new(Vector2(100, 200))
	pool_world.add_child(owner)
	var last = ObservedController.new()
	pool_world.add_child(last)
	_check(last.configure(owner, target, pool_world, _terminal_episode(pool_world.to_global(Vector2(280, 200))), _profile), "inactive reuse sibling configured")
	_idle_calls += 1
	last.advance_idle(1, 75, 100, pool_world.token)
	_check(_world_visuals(pool_world, "impacts").size() == 12 and inactive_first.get_snapshot()["active"] and inactive_first.get_snapshot()["render_driver_instance"] == last.get_instance_id(), "first inactive actual slot reused with transferred driver")
	pool_world.free()
	_observations["visual_scope"] = {"actual_imported_resource_and_Sprite_region": true, "source_random_branch_pixel_equivalence": false, "pool_single_driver_phase_verified": true, "explicit_render_native_clock_separation": true, "render_recipe_is_not_pixel_PASS": true}

func _run_group(name: String, callable: Callable) -> void:
	if not _only.is_empty() and not _only.has(name):
		return
	print("GROUP_BEGIN " + name)
	var before = _failed_assertions
	await callable.call()
	_valid_completed.append(name)
	if _failed_assertions == before:
		_passed_groups.append(name)
		print("GROUP_PASS " + name)
	else:
		print("GROUP_FAIL " + name + " assertions=" + str(_failed_assertions - before))

func _run() -> void:
	var decoded = JSON.parse_string(FileAccess.get_file_as_string(PROFILE_FILE))
	if not decoded is Dictionary:
		print("HARNESS_ERROR new descriptor missing")
		quit(2)
		return
	_profile = decoded
	await _run_group("type7_native_idle_clock_contexts", _native_idle_clock_contexts)
	await _run_group("type7_landing_public_player_and_guards", _landing_public_player_and_guards)
	await _run_group("type7_queued_birth_identity_and_automatic_clock", _queued_birth_identity_and_automatic_clock)
	await _run_group("type7_render_resources_clock_and_pool_handover", _render_resources_clock_and_pool_handover)
	paused = true
	var summary = {"valid_completed_groups": _valid_completed, "passed_groups": _passed_groups, "failed_assertions": _failed_assertions, "explicit_idle_method_calls": _idle_calls, "explicit_queue_method_calls": _queue_calls, "actual_birth_explicit_phase_calls": _actual_birth_phase_calls, "explicit_Player_physics_method_calls": _player_physics_calls, "explicit_provider_public_movement_calls": _fixture_movement_calls, "public_damage_requests": _public_damage_requests, "public_Input_fixture_edges": _input_edges, "explicit_controller_render_calls": _controller_render_calls, "explicit_visual_render_calls": _direct_visual_render_calls, "actual_shot_automatic_physics_calls": _actual_shot_auto_calls, "actual_controller_automatic_render_calls": _actual_controller_auto_calls, "automatic_physics_frame_signals": _automatic_physics_signals, "paused_physics_signal_observations": _paused_physics_signal_observations, "observations": _observations, "live_actor_field_injection": false, "Main_or_factory_or_userdata_boot": false, "GUI_or_public_input": false, "source_support": [6, 10], "frozen_shipping_support": [5, 11], "etype7_registered": false, "VISUAL_VERDICT": "RETOUCH"}
	print("TYPE7_TEST_RECEIPT " + JSON.stringify(summary))
	quit(0 if _failed_assertions == 0 else 1)
