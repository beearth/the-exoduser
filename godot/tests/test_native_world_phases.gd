extends SceneTree
## Actual World + actual combat Player, no Main/capture/user save. Participants
## only observe source phase order. They are not actual six-element emitters.
const WorldScript = preload("res://scripts/world.gd")
const PlayerScript = preload("res://scripts/player.gd")

class InitialPlayer extends PlayerScript:
	func _init(initial_position: Vector2) -> void:
		position = initial_position

class RegistryParticipant extends CharacterBody2D:
	signal telemetry_event(kind: String, data: Dictionary)
	var initial_ready: bool
	var initial_accept_target: bool
	var source_world: Node2D
	var trace: Array
	var hp = 1
	var alive = true
	var radius = 1.0
	var etype = 3
	var last_target: Node2D
	func _init(world: Node2D, records: Array, ready_value: bool = true, accept_value: bool = true) -> void:
		source_world = world
		trace = records
		initial_ready = ready_value
		initial_accept_target = accept_value
		position = world.get_start_position() + Vector2(300,0)
		collision_layer = 0
		collision_mask = 0
	func is_native_registry_ready() -> bool:
		return initial_ready
	func set_player(target: Node2D) -> bool:
		if not initial_accept_target:return false
		last_target = target
		return true
	func advance_native_phase(_ticks: float, frame: float, identity: Variant) -> void:
		trace.append({"kind":"owner2","frame":frame,"identity_actual":is_same(identity,source_world.get_native_world_identity())})

class FirstOwner extends Node2D:
	var source_world: Node2D
	var trace: Array
	var child: RegistryParticipant
	var birth_attempt: Dictionary = {}
	func _init(world: Node2D, records: Array) -> void:
		source_world = world
		trace = records
	func owner_step(_ticks: float, frame: float, identity: Variant) -> void:
		trace.append({"kind":"owner1","frame":frame,"particle_before":source_world.get_native_runtime_snapshot()["particle_pre_updates"],"identity_actual":is_same(identity,source_world.get_native_world_identity())})
		if child == null:
			child = RegistryParticipant.new(source_world,trace)
			birth_attempt = source_world.register_summoned_enemy(child)
	func warning_step(_ticks: float, frame: float, identity: Variant) -> void:
		# Runtime public counter observes the actual pre-projectile particle phase.
		trace.append({"kind":"particle_pre_observed","frame":frame,"particle_count":source_world.get_native_runtime_snapshot()["particle_pre_updates"]})
		trace.append({"kind":"warning","frame":frame,"identity_actual":is_same(identity,source_world.get_native_world_identity())})

class PendingBirthEmitter extends Node:
	var source_world: Node2D
	var trace: Array
	func _init(world: Node2D, records: Array) -> void:
		source_world = world
		trace = records
	func advance_birth_phase(_ticks: float, frame: float) -> void:
		trace.append({"kind":"pending_birth2","frame":frame,"actual_birth_counter_before":source_world.get_native_runtime_snapshot()["birth_phase_updates"]})

class ExistingProjectileObserver extends Node:
	var source_world: Node2D
	var trace: Array
	func _init(world: Node2D, records: Array) -> void:
		source_world = world
		trace = records
		process_physics_priority = 1
	func _physics_process(_delta: float) -> void:
		trace.append({"kind":"existing_projectile1","frame":source_world.get_native_frame()})

class HitFXObserver extends Node:
	var source_world: Node2D
	var trace: Array
	func _init(world: Node2D, records: Array) -> void:
		source_world = world
		trace = records
		process_physics_priority = 3
	func _physics_process(_delta: float) -> void:
		var hitfx = source_world.get_node("NativeProjectileHitEffects")
		trace.append({"kind":"hitFX3_observed","frame":source_world.get_native_frame(),"actual_boom_post_steps":hitfx.get_snapshot()["metrics"]["boom_post_steps"],"birth_steps":source_world.get_native_runtime_snapshot()["birth_phase_updates"]})

var _world: Node2D
var _player: Node2D
var _trace: Array = []
var _initial_report: Dictionary
var _initial_identity: Array
var _only: Array = []
var _failed = 0
var _passed: Array = []
var _completed: Array = []
var _physics_signal_observations = 0
var _pause_signal_observations = 0
var _observations: Dictionary = {}

func _initialize() -> void:
	for action in ["move_left","move_right","move_up","move_down","weapon","cancel_charge","pause"]:
		if not InputMap.has_action(action):InputMap.add_action(action)
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="):_only = Array(arg.trim_prefix("--only=").split(","))
	paused = true
	physics_frame.connect(func():_physics_signal_observations+=1)
	call_deferred("_run")

func check(value: bool, label: String) -> void:
	if not value:
		_failed+=1
		print("ASSERT_FAIL "+label)

func _setup_actual_world() -> bool:
	_world = WorldScript.new()
	root.add_child(_world)
	if not _world.ready_for_player:
		print("HARNESS_ERROR actual World source/resource preflight not ready")
		return false
	_player=InitialPlayer.new(_world.get_start_position())
	root.add_child(_player)
	_player.set_world(_world)
	_world.set_player(_player)
	_initial_report=_world.get_encounter_report()
	_initial_identity=_world.get_native_world_identity()
	check(_player.get_snapshot()["max_hp"]==350,"actual combat.json Player constructor loaded")
	check(is_same(_initial_identity,_world.get_enemies()),"actual source registry identity is combat query array")
	return true

func _registry_atomicity_and_initial_report() -> void:
	var before=_world.get_native_runtime_snapshot()
	var count=_world.get_child_count()
	var source_count=_world.get_enemies().size()
	for scenario in [{"ready":false,"target":true},{"ready":true,"target":false}]:
		var candidate=RegistryParticipant.new(_world,_trace,scenario["ready"],scenario["target"])
		var outcome=_world.register_summoned_enemy(candidate)
		check(not outcome.get("valid",true),"unready/set_player false actual registry transaction rejected")
		check(candidate.get_parent()==null and _world.get_child_count()==count and _world.get_enemies().size()==source_count,"rejected actor not appended/parented")
		check(_world.get_native_runtime_snapshot()["managed_owners"]==before["managed_owners"],"rejected actor did not allocate owner phase entry")
		candidate.free()
	check(_world.get_encounter_report()==_initial_report,"dynamic rejection does not replace frozen initial source report")
	check(is_same(_initial_identity,_world.get_native_world_identity()),"registry rejection preserves ens reference")
	_observations["atomic_registry"]={"initial_enemy_count":source_count,"initial_report_unchanged":true,"world_private_fields_written":false}

func _automatic_owner_particle_queue_birth_order_and_pause() -> void:
	var owner=FirstOwner.new(_world,_trace)
	_world.add_child(owner)
	check(_world.register_native_phase_consumer(owner,owner.owner_step,owner.warning_step),"actual owner callback registered")
	check(not _world.register_native_phase_consumer(owner,owner.owner_step,owner.warning_step),"duplicate actual owner registration rejected")
	var emitter=PendingBirthEmitter.new(_world,_trace)
	check(not _world.bind_native_projectile_emitter(emitter),"emitter without real world parent rejected")
	_world.add_child(emitter)
	check(_world.bind_native_projectile_emitter(emitter),"actual Node emitter service accepted after world parenting")
	check(not _world.bind_native_projectile_emitter(emitter),"duplicate emitter binding rejected")
	var projectile=ExistingProjectileObserver.new(_world,_trace)
	_world.add_child(projectile)
	var fx_observer=HitFXObserver.new(_world,_trace)
	_world.add_child(fx_observer)
	paused=false
	for unused in range(3):
		await physics_frame
		await process_frame
	paused=true
	check(owner.birth_attempt.get("valid",false),"owner1 actual source-order child registration succeeded")
	var frames: Dictionary = {}
	for event in _trace:
		var frame=float(event["frame"])
		if not frames.has(frame):frames[frame]=[]
		frames[frame].append(event)
	check(not frames.is_empty(),"actual SceneTree automatic phases observed")
	var checked=0
	for frame in frames:
		var events: Array=frames[frame]
		var kinds: Array=[]
		for event in events:kinds.append(event["kind"])
		var required=["owner1","owner2","particle_pre_observed","warning","existing_projectile1","pending_birth2","hitFX3_observed"]
		check(kinds==required,"actual automatic phase sequence atframe%s: %s" %[frame,kinds])
		if kinds==required:
			check(events[2]["particle_count"]==events[0]["particle_before"]+1,"actual particle pre counter advanced between owners and warning")
			check(events[6]["actual_boom_post_steps"]>0 and events[6]["birth_steps"]==events[5]["actual_birth_counter_before"]+1,"actual priority3 hitFX runs after real birth2 phase")
			for event in events:
				if event.has("identity_actual"):check(event["identity_actual"],"actual phase token keeps original registry reference")
			checked+=1
	var snapshot=_world.get_native_runtime_snapshot()
	check(snapshot["dynamic_spawn_count"]==1 and snapshot["managed_owners"]==2,"dynamic child automatically joined actual owner registry once")
	check(is_same(_initial_identity,_world.get_enemies()) and _world.get_encounter_report()==_initial_report,"actual dynamic append leaves reference and initial report untouched")
	var paused_snapshot=snapshot.duplicate(true)
	var trace_count=_trace.size()
	for unused in range(4):
		await physics_frame
		_pause_signal_observations+=1
		await process_frame
	check(_world.get_native_runtime_snapshot()==paused_snapshot and _trace.size()==trace_count,"actual SceneTree pause freezes world clock and participant callbacks")
	_observations["automatic_phases"]={"verified_frame_count":checked,"source_order":required_order(),"runtime":snapshot,"trace":_trace.duplicate(true),"pause_signal_count":4,"fake_participants_are_order_recorders_only":true,"actual_six_element_emitter_verified":false}

func required_order() -> Array:
	return ["owner1","owner2","particle_pre_observed","warning","existing_projectile1","pending_birth2","hitFX3_observed"]

func _group(name: String, callback: Callable) -> void:
	if not _only.is_empty() and not _only.has(name):return
	print("GROUP_BEGIN "+name)
	var before=_failed
	await callback.call()
	_completed.append(name)
	if before==_failed:
		_passed.append(name)
		print("GROUP_PASS "+name)
	else:print("GROUP_FAIL "+name)

func _run() -> void:
	if not _setup_actual_world():
		quit(2)
		return
	await _group("native_world_registry_atomicity_and_initial_report",_registry_atomicity_and_initial_report)
	await _group("native_world_automatic_owner_particle_queue_birth_order_and_pause",_automatic_owner_particle_queue_birth_order_and_pause)
	print("NATIVE_WORLD_PHASE_RECEIPT "+JSON.stringify({"completed":_completed,"passed":_passed,"failed_assertions":_failed,"automatic_physics_signal_observations":_physics_signal_observations,"paused_physics_signal_observations":_pause_signal_observations,"explicit_world_physics_method_calls":0,"live_HP_position_AI_clock_setters":false,"Main_capture_userdata_GUI":false,"old_suite_reexecutions":0,"observations":_observations}))
	_world.free()
	_player.free()
	quit(0 if _failed==0 else 1)
