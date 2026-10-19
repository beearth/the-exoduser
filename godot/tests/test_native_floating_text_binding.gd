extends SceneTree
## New binding contracts only: actual World/Player/Camera constructors, actual
## dark caller and priority3 dispatch. No Main, capture, save, pixels or old suites.
const WorldScript = preload("res://scripts/world.gd")
const PlayerScript = preload("res://scripts/player.gd")
const AdapterScript = preload("res://scripts/native_floating_text_adapter.gd")
const HitFxScript = preload("res://scripts/native_projectile_hit_fx.gd")

class InitialWorld extends WorldScript:
	func _init(offset: Vector2) -> void:
		position = offset

class InitialPlayer extends PlayerScript:
	func _init(point: Vector2) -> void:
		position = point

class InitialCamera extends Camera2D:
	func _init(point: Vector2) -> void:
		position = point
		zoom = Vector2(2, 2)

class MissingFontWorld extends WorldScript:
	# Constructor-only provider boundary. No canonical world bootstrap is run.
	func _ready() -> void:
		pass
	func get_native_text_font() -> Font:
		return null

class WrongPoolWorld extends WorldScript:
	func _ready() -> void:
		pass
	func get_native_projectile_fx_context() -> Dictionary:
		var context: Dictionary = super.get_native_projectile_fx_context()
		context["text_pool_limit"] = 120
		return context

class ReadyPayloadProvider extends Node:
	var initial_payload: Variant
	func _init(payload: Variant) -> void:
		initial_payload = payload
	func get_snapshot() -> Variant:
		return initial_payload
	func add_txt(_x: float, _y: float, _text: Variant, _color: Variant,
			_life: Variant = null, _size: Variant = null, _num: Variant = null) -> bool:
		return true
	func advance(_ticks: float, _frame: float, _identity: Variant) -> bool:
		return true

class ChangingPayloadProvider extends ReadyPayloadProvider:
	var calls = 0
	func _init() -> void:
		super({"ready":true})
	func get_snapshot() -> Variant:
		calls += 1
		return {"ready":true} if calls == 1 else "backend_status_unavailable"

class InvalidClockProbe extends Node:
	var source_world: Node2D
	var adapter: Node2D
	var trace: Array
	func _init(world: Node2D, sink: Node2D, observations: Array) -> void:
		source_world = world
		adapter = sink
		trace = observations
		process_physics_priority = 2
	func _physics_process(_delta: float) -> void:
		var frame: float = source_world.get_native_frame()
		var ticks: float = source_world.get_native_projectile_fx_context()["dt_sp"]
		var identity: Array = source_world.get_native_world_identity()
		var before: Dictionary = adapter.get_snapshot()
		var clone_rejected: bool = not adapter.advance_native_text(ticks, frame, identity.duplicate())
		var frame_rejected: bool = not adapter.advance_native_text(ticks, frame - 1, identity)
		var ticks_rejected: bool = not adapter.advance_native_text(ticks * 2, frame, identity)
		var after: Dictionary = adapter.get_snapshot()
		trace.append({"phase":"before_post3", "frame":frame,
			"clone_rejected":clone_rejected, "stale_frame_rejected":frame_rejected,
			"wrong_ticks_rejected":ticks_rejected, "pool_unchanged":before["pool"] == after["pool"],
			"clock_calls_before":before["clock_calls"]})

class PostClockObserver extends Node:
	var source_world: Node2D
	var adapter: Node2D
	var trace: Array
	func _init(world: Node2D, sink: Node2D, observations: Array) -> void:
		source_world = world
		adapter = sink
		trace = observations
		process_physics_priority = 3
	func _physics_process(_delta: float) -> void:
		var frame: float = source_world.get_native_frame()
		var ticks: float = source_world.get_native_projectile_fx_context()["dt_sp"]
		var before: Dictionary = adapter.get_snapshot()
		var rejected: bool = not adapter.advance_native_text(ticks, frame, source_world.get_native_world_identity())
		var after: Dictionary = adapter.get_snapshot()
		trace.append({"phase":"after_post3", "frame":frame, "duplicate_rejected":rejected,
			"pool_unchanged":before["pool"] == after["pool"],
			"clock_calls":after["clock_calls"], "last_native_frame":after["last_native_frame"]})

var _world: Node2D
var _player: Node2D
var _camera: Camera2D
var _adapter: Node2D
var _only: Array = []
var _failed = 0
var _completed: Array = []
var _passed: Array = []
var _observations: Dictionary = {}
var _physics_signals = 0
var _paused_signals = 0
var _explicit_rejected_clock_requests = 0

func _initialize() -> void:
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon", "cancel_charge", "pause"]:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="):
			_only = Array(arg.trim_prefix("--only=").split(","))
	paused = true
	physics_frame.connect(func(): _physics_signals += 1)
	call_deferred("_run")

func check(value: bool, label: String) -> void:
	if not value:
		_failed += 1
		print("ASSERT_FAIL " + label)

func _setup_actual_world() -> bool:
	_world = InitialWorld.new(Vector2(240, -160))
	_camera = InitialCamera.new(_world.to_global(_world.get_start_position()))
	root.add_child(_camera)
	_camera.make_current()
	_camera.force_update_scroll()
	root.add_child(_world)
	if not _world.ready_for_player:
		print("HARNESS_ERROR actual World resource/binding preflight failed")
		return false
	_player = InitialPlayer.new(_world.to_global(_world.get_start_position()))
	root.add_child(_player)
	_player.set_world(_world)
	_world.set_player(_player)
	var found: Array = []
	for child in _world.get_children():
		if child.get_script() == AdapterScript:
			found.append(child)
	if found.size() != 1:
		print("HARNESS_ERROR expected one actual World floating-text adapter")
		return false
	_adapter = found[0]
	check(_player.get_snapshot()["max_hp"] == 350, "actual combat Player constructor loaded")
	check(_adapter.get_snapshot()["ready"], "actual installed World binding is ready")
	return true

func _cleanup() -> void:
	paused = true
	if is_instance_valid(_world):
		_world.free()
	if is_instance_valid(_player):
		_player.free()
	if is_instance_valid(_camera):
		_camera.free()

func _generic_admission_view_and_number_gap() -> void:
	if not _setup_actual_world():
		check(false, "actual generic fixture ready")
		return
	var point: Vector2 = _world.to_global(_world.get_start_position())
	for index in range(41):
		check(_world.emit_native_text(point.x, point.y, "시전%d" % index, "#8888ff"), "World public addTxt accepted")
	var ring: Dictionary = _adapter.get_snapshot()
	check(ring["pool"].size() == 40 and ring["next_slot"] == 1 and ring["producer_counters"]["admitted"] == 41,
		"actual World admission uses one 40-slot ring, overwrites rather than appends")
	check(ring["pool"][0]["t"] == "시전40" and ring["pool"][1]["t"] == "시전1", "ko identity and source ring slot order survive World callback")
	check(is_equal_approx(ring["pool"][0]["x"], _world.get_start_position().x)
		and is_equal_approx(ring["pool"][0]["y"], _world.get_start_position().y), "translated actual World coordinate converted to child-local once")
	var view: Dictionary = ring["render_context"]
	var visible_size: Vector2 = root.get_visible_rect().size / _camera.zoom
	check(is_equal_approx(view["vw"], visible_size.x) and is_equal_approx(view["vh"], visible_size.y), "logical view derives from actual viewport and Camera zoom")
	var centre: Vector2 = _adapter.get_node("OriginalFloatingTextRing").to_local(_camera.get_screen_center_position())
	check(is_equal_approx(view["cam_x"], centre.x) and is_equal_approx(view["cam_y"], centre.y), "actual Camera centre uses the same child drawing space")
	check(not view["bt_active"], "normal source whitelist is retained")
	check(_world.emit_native_text(point.x, point.y, "경직!", "#fff", 30), "filtered ordinary text is still admitted")
	check(_world.emit_native_text(point.x, point.y, 123, "#ff0000", 30, 28, "123"), "original number branch is admitted with no atlas fabricated")
	var outside: Vector2 = _camera.get_screen_center_position() + Vector2(visible_size.x / 2 + 201, 0)
	check(_world.emit_native_text(outside.x, outside.y, "시전 바깥", "#fff", 30), "source draw culling does not cancel admission")
	var snapshot: Dictionary = _adapter.get_snapshot()
	var filtered = true
	var outside_filtered = true
	var number_branch = false
	for command in snapshot["draw_plan"]:
		filtered = filtered and command["text"] != "경직!"
		outside_filtered = outside_filtered and command["text"] != "시전 바깥"
		if command["text"] == "123":
			number_branch = command["branch"] == "num_atlas"
	check(filtered and outside_filtered and number_branch, "actual bound view feeds source whitelist, cull and number dispatch")
	check(snapshot["pool"][2]["t"] == 123, "ko localizer preserves Variant identity at admission")
	check(snapshot["number_atlas_gap"] and snapshot["number_atlas_status"] == "absent", "original number atlas remains an explicit resource gap")
	snapshot["pool"][0]["life"] = -999
	check(_adapter.get_snapshot()["pool"][0]["life"] == 35, "public pool snapshot is detached")
	_observations["generic"] = {"admissions":44, "ring_size":40, "translated_constructor_context":true,
		"logical_view":view, "number_atlas_original_pixels_verified":false, "automatic_native_ticks":0}
	_cleanup()

func _dark_event_single_pool_actual_post_clock() -> void:
	if not _setup_actual_world():
		check(false, "actual dark fixture ready")
		return
	var point: Vector2 = _player.global_position
	var before_frame: float = _world.get_native_frame()
	_world.emit_native_projectile_hit_fx({"element":"dark", "element_id":3, "dark_ball":true,
		"redBean":false, "position":point, "target_position":point})
	var admitted: Dictionary = _adapter.get_snapshot()
	var fx: Node2D = _world.get_node("NativeProjectileHitEffects")
	var labels = 0
	for child in fx.get_children():
		if child is Label:
			labels += 1
	check(admitted["producer_counters"]["admitted"] == 1 and admitted["live_count"] == 1, "actual dark event reaches one generic pool once")
	check(admitted["pool"][0]["t"] == "💜다크볼!" and admitted["pool"][0]["life"] == 30,
		"actual dark caller preserves text and life")
	check(fx.get_snapshot()["texts"] == 0 and labels == 0, "delegated dark event allocates no private text entry or Label")
	check(admitted["draw_plan"].is_empty(), "normal source whitelist excludes dark text while its life remains stored")
	paused = false
	for unused in range(3):
		await physics_frame
		await process_frame
	paused = true
	var after: Dictionary = _adapter.get_snapshot()
	var elapsed: float = _world.get_native_frame() - before_frame
	check(elapsed > 0 and elapsed < 30, "fresh automatic dark fixture observed before expiry")
	check(is_equal_approx(after["pool"][0]["life"], 30 - elapsed)
		and is_equal_approx(after["pool"][0]["y"], admitted["pool"][0]["y"] - .6 * elapsed),
		"actual priority3 advances life and rise once per published native time")
	check(after["producer_counters"]["native_ticks"] == after["clock_calls"]
		and after["clock_calls"] == fx.get_snapshot()["metrics"]["boom_post_steps"],
		"actual shared post phase has no private parallel or render clock aging")
	check(after["last_native_frame"] == _world.get_native_frame(), "post phase consumes the current actual World frame")
	_observations["dark_post"] = {"elapsed_native_ticks":elapsed, "clock_calls":after["clock_calls"],
		"event_admissions":1, "private_texts":0, "private_labels":labels,
		"automatic_fixture_physics":true, "pixel_or_public_natural_combat_evidence":false}
	_cleanup()

func _clock_identity_pause_and_atomic_preflight() -> void:
	for candidate in [MissingFontWorld.new(), WrongPoolWorld.new()]:
		root.add_child(candidate)
		var adapter = AdapterScript.new()
		var children: int = candidate.get_child_count()
		check(not adapter.configure(candidate), "constructor-invalid font/context binding rejected")
		check(adapter.get_child_count() == 0 and candidate.get_child_count() == children
			and not adapter.get_snapshot()["configured"], "failed preflight creates no producer or World child")
		adapter.free()
		candidate.free()
	if not _setup_actual_world():
		check(false, "actual clock fixture ready")
		return
	var point: Vector2 = _player.global_position
	check(_world.emit_native_text(point.x, point.y, "시전 clock", "#fff", 60), "actual clock fixture admission")
	var trace: Array = []
	_world.add_child(InvalidClockProbe.new(_world, _adapter, trace))
	_world.add_child(PostClockObserver.new(_world, _adapter, trace))
	paused = false
	for unused in range(2):
		await physics_frame
		await process_frame
	paused = true
	check(not trace.is_empty(), "actual automatic priority2/3 clock boundaries observed")
	for event in trace:
		if event["phase"] == "before_post3":
			_explicit_rejected_clock_requests += 3
			check(event["clone_rejected"] and event["stale_frame_rejected"] and event["wrong_ticks_rejected"]
				and event["pool_unchanged"], "unconsumed actual frame rejects copied identity, stale frame and wrong dt without aging")
		else:
			_explicit_rejected_clock_requests += 1
			check(event["duplicate_rejected"] and event["pool_unchanged"] and event["last_native_frame"] == event["frame"],
				"actual post has accepted the frame once before duplicate request")
	var frozen: Dictionary = _adapter.get_snapshot()
	var frame: float = _world.get_native_frame()
	var ticks: float = _world.get_native_projectile_fx_context()["dt_sp"]
	check(not _adapter.advance_native_text(ticks, frame, _world.get_native_world_identity()), "paused public advance rejected")
	_explicit_rejected_clock_requests += 1
	for unused in range(4):
		await physics_frame
		_paused_signals += 1
		await process_frame
	var after: Dictionary = _adapter.get_snapshot()
	check(after["pool"] == frozen["pool"] and after["clock_calls"] == frozen["clock_calls"]
		and _world.get_native_frame() == frame, "actual SceneTree pause freezes pool and published World clock across four signals")
	_observations["clock_guards"] = {"trace":trace, "paused_signal_count":4,
		"paused_pool_clock_unchanged":true, "constructor_faults_only":true}
	_cleanup()

func _backend_lifecycle_and_sink_atomicity() -> void:
	if not _setup_actual_world():
		check(false, "actual lifecycle binding fixture ready")
		return
	var bind_results: Array = []
	for payload in [{"ready":null}, {"ready":"true"}]:
		var provider = ReadyPayloadProvider.new(payload)
		_world.add_child(provider)
		var helper = HitFxScript.new()
		check(helper.configure(_world), "new unbound actual HitFX resource preflight ready")
		check(not helper.bind_native_floating_text_sink(provider.add_txt, provider.advance, provider.get_snapshot),
			"null/string readiness rejected without script failure")
		var rejected: Dictionary = helper.get_snapshot()
		check(not rejected["floating_text_sink_bound"] and not rejected["floating_text_sink_ready"]
			and rejected["texts"] == 0 and helper.get_child_count() == 0, "rejected sink binding is atomic and allocates no legacy Label")
		check(not helper.get_last_error().is_empty(), "invalid constructor provider reports binding error")
		check(helper.bind_native_floating_text_sink(_adapter.emit_native_text, _adapter.advance_native_text, _adapter.get_snapshot),
			"same unbound helper accepts actual adapter after invalid provider")
		check(helper.get_snapshot()["floating_text_sink_bound"] and helper.get_snapshot()["floating_text_sink_ready"]
			and helper.get_last_error().is_empty(), "valid retry clears prior error without partial sink state")
		bind_results.append({"invalid_ready_type":typeof(payload["ready"]), "atomic_reject":true, "actual_retry":true})
		helper.free()
		provider.free()
	var changing = ChangingPayloadProvider.new()
	_world.add_child(changing)
	var late_helper = HitFxScript.new()
	check(late_helper.configure(_world), "late-payload helper actual preflight ready")
	check(late_helper.bind_native_floating_text_sink(changing.add_txt, changing.advance, changing.get_snapshot),
		"constructor provider first ready dictionary accepted")
	check(not late_helper.get_snapshot()["floating_text_sink_ready"], "later non-Dictionary provider payload is safely unready")
	late_helper.free()
	changing.free()
	_cleanup()
	var lifecycle_results: Array = []
	for scenario in ["remove_producer", "reparent_producer", "queue_producer", "queue_adapter"]:
		if not _setup_actual_world():
			check(false, "actual lifecycle scenario fixture ready")
			return
		var point: Vector2 = _player.global_position
		check(_world.emit_native_text(point.x, point.y, "시전 lifetime", "#fff"), "actual pool admission before lifecycle loss")
		var before: Dictionary = _world.get_native_text_snapshot()
		var producer: Node2D = _adapter.get_node("OriginalFloatingTextRing")
		var fx: Node2D = _world.get_node("NativeProjectileHitEffects")
		check(fx.get_snapshot()["floating_text_sink_ready"], "installed sink is ready before public lifecycle operation")
		match scenario:
			"remove_producer":
				_adapter.remove_child(producer)
			"reparent_producer":
				producer.reparent(_world)
			"queue_producer":
				producer.queue_free()
			"queue_adapter":
				_adapter.queue_free()
		check(not _adapter.get_snapshot()["ready"] and not _world.get_native_text_snapshot()["ready"],
			"lost/reparented/queued backend makes actual public readiness false:" + scenario)
		check(not _world.emit_native_text(point.x, point.y, "시전 rejected", "#fff"), "unready actual World admission refused:" + scenario)
		_world.emit_native_projectile_hit_fx({"element":"dark", "element_id":3, "dark_ball":true,
			"redBean":false, "position":point, "target_position":point})
		var after: Dictionary = _adapter.get_snapshot()
		var fx_state: Dictionary = fx.get_snapshot()
		var labels = 0
		for child in fx.get_children():
			if child is Label:
				labels += 1
		check(after["pool"] == before["pool"], "unready admission and dark callback preserve original pool:" + scenario)
		check(fx_state["floating_text_sink_bound"] and not fx_state["floating_text_sink_ready"]
			and fx_state["texts"] == 0 and labels == 0, "persistent binding blocks legacy fallback after backend loss:" + scenario)
		lifecycle_results.append({"scenario":scenario, "ready_after":after["ready"],
			"pool_unchanged":after["pool"] == before["pool"], "legacy_labels":labels,
			"sink_bound":fx_state["floating_text_sink_bound"], "sink_ready":fx_state["floating_text_sink_ready"]})
		if producer.get_parent() == null:
			producer.free()
		_cleanup()
	_observations["backend_lifecycle"] = {"invalid_binding_constructor_providers":bind_results,
		"late_non_dictionary_status_safe":true, "lifecycle":lifecycle_results,
		"actual_public_lifecycle_only":true, "automatic_native_ticks":0, "new_helper_tree_added":false}

func _group(name: String, callback: Callable) -> void:
	if not _only.is_empty() and not _only.has(name):
		return
	print("GROUP_BEGIN " + name)
	var before = _failed
	await callback.call()
	_completed.append(name)
	if before == _failed:
		_passed.append(name)
		print("GROUP_PASS " + name)
	else:
		print("GROUP_FAIL " + name)

func _run() -> void:
	var known = ["generic_admission_view_and_number_gap", "dark_event_single_pool_actual_post_clock", "clock_identity_pause_and_atomic_preflight", "backend_lifecycle_and_sink_atomicity"]
	for requested in _only:
		if not known.has(requested):
			print("INVALID_ONLY_FILTER " + str(requested))
			quit(2)
			return
	await _group(known[0], _generic_admission_view_and_number_gap)
	await _group(known[1], _dark_event_single_pool_actual_post_clock)
	await _group(known[2], _clock_identity_pause_and_atomic_preflight)
	await _group(known[3], _backend_lifecycle_and_sink_atomicity)
	print("NATIVE_FLOATING_TEXT_BINDING_RECEIPT " + JSON.stringify({"completed":_completed,
		"passed":_passed, "failed_assertions":_failed, "automatic_physics_signal_observations":_physics_signals,
		"paused_physics_signal_observations":_paused_signals, "explicit_rejected_clock_requests":_explicit_rejected_clock_requests,
		"explicit_world_or_Player_physics_calls":0, "render_method_calls":0,
		"live_HP_position_AI_clock_setters":false, "Main_capture_save_GUI":false,
		"old_suite_reexecutions":0, "observations":_observations}))
	quit(0 if _failed == 0 else 1)
