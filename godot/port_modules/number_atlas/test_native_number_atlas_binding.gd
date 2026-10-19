extends SceneTree
## New actual World startup binding only. Does not execute the supplier's
## frozen9/105 tests or either old native capture/probe mode.
const WorldScript = preload("res://scripts/world.gd")
const AdapterScript = preload("res://scripts/native_floating_text_adapter.gd")

class InitialCamera extends Camera2D:
	func _init(point: Vector2) -> void:
		position = point

var _world: Node2D
var _camera: Camera2D
var _adapter: Node2D
var _only: Array = []
var _failed = 0
var _passed: Array = []
var _completed: Array = []
var _observations: Dictionary = {}

func _initialize() -> void:
	paused = true
	if DisplayServer.get_name() != "headless":
		root.title = "EXODUSER number atlas binding — isolated QA"
		root.size = Vector2i(640,360)
		root.content_scale_size = Vector2i(640,360)
		root.content_scale_mode = Window.CONTENT_SCALE_MODE_CANVAS_ITEMS
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="):
			_only = Array(arg.trim_prefix("--only=").split(","))
	call_deferred("_run")

func check(value: bool, label: String) -> void:
	if not value:
		_failed += 1
		print("ASSERT_FAIL " + label)

func _setup_actual_world() -> bool:
	_world = WorldScript.new()
	_camera = InitialCamera.new(_world.get_start_position())
	root.add_child(_camera)
	_camera.make_current()
	_camera.force_update_scroll()
	root.add_child(_world)
	if not _world.ready_for_player:
		print("HARNESS_ERROR actual World startup not ready")
		return false
	var adapters: Array = []
	for child in _world.get_children():
		if child.get_script() == AdapterScript:
			adapters.append(child)
	if adapters.size() != 1:
		print("HARNESS_ERROR actual World adapter count invalid")
		return false
	_adapter = adapters[0]
	return true

func _wait_startup() -> bool:
	var deadline = Time.get_ticks_msec() + 15000
	while Time.get_ticks_msec() < deadline:
		var status: String = _world.get_native_text_snapshot()["number_atlas_startup_status"]
		if status not in ["not_started","baking"]:
			return true
		await process_frame
	print("HARNESS_ERROR startup atlas did not settle within15sec wall deadline")
	return false

func _one_owned_baker_and_consumer() -> bool:
	var bakers = 0
	var consumers = 0
	for child in _adapter.get_children():
		if child.name == "NativeNumberAtlasBaker":
			bakers += 1
		if child.name == "OriginalFloatingTextRing":
			consumers += 1
	return bakers == 1 and consumers == 1

func _headless_world_startup_atlas_guard() -> void:
	check(DisplayServer.get_name() == "headless", "headless binding group selected only under headless")
	if not _setup_actual_world() or not await _wait_startup():
		check(false, "actual headless startup fixture ready")
		return
	var snapshot: Dictionary = _world.get_native_text_snapshot()
	check(snapshot["ready"] and _one_owned_baker_and_consumer(), "actual World generic consumer and one supplier remain ready")
	check(snapshot["number_atlas_startup_status"] == "unavailable_headless"
		and snapshot["number_atlas_bake_calls"] == 1 and snapshot["number_atlas_supply_calls"] == 0,
		"actual startup calls supplier once and does not fabricate headless atlas")
	check(snapshot["number_atlas_gap"] and snapshot["number_atlas_runtime_texture_size"] == Vector2i.ZERO,
		"actual consumer keeps explicit numeric resource gap under headless")
	var baker: Node = _adapter.get_node("NativeNumberAtlasBaker")
	check(baker.get_child_count() == 0 and not baker.has_texture(), "headless supplier created no mask viewport or texture")
	var point: Vector2 = _camera.global_position
	check(_world.emit_native_text(point.x, point.y, "123", "#dd2200", 35, 28, "123"), "actual World numeric admission remains available")
	var admitted: Dictionary = _world.get_native_text_snapshot()
	for unused in range(5):
		await process_frame
	var after: Dictionary = _world.get_native_text_snapshot()
	check(after["number_atlas_bake_calls"] == 1 and after["number_atlas_supply_calls"] == 0,
		"redraw frames do not rebake or supply under headless")
	check(after["pool"] == admitted["pool"] and after["clock_calls"] == 0 and _world.get_native_frame() == 0,
		"startup and render frames add no World or text native aging")
	_observations["headless"] = {"startup_status":after["number_atlas_startup_status"],
		"bake_calls":1, "supply_calls":0, "owned_bakers":1, "owned_consumers":1,
		"native_ticks":0, "mask_viewports":baker.get_child_count(), "pixels_or_GPU_probe_replay":false}

func _native_world_startup_numeric_consumer() -> void:
	check(DisplayServer.get_name() != "headless", "native binding group requires a real display")
	if not _setup_actual_world() or not await _wait_startup():
		check(false, "actual native startup fixture ready")
		return
	var before: Dictionary = _world.get_native_text_snapshot()
	check(before["ready"] and _one_owned_baker_and_consumer(), "actual World owns exactly one baker and one consumer")
	check(before["number_atlas_startup_status"] == "supplied" and not before["number_atlas_gap"]
		and before["number_atlas_status"] == "supplied" and before["number_atlas_supplier_live"],
		"real async startup supplied the atlas into the existing consumer")
	check(before["number_atlas_runtime_texture_size"] == Vector2i(480,168)
		and before["number_atlas_bake_calls"] == 1 and before["number_atlas_supply_calls"] == 1,
		"one native bake and one supply use the actual runtime480x168 texture")
	var baker: Node = _adapter.get_node("NativeNumberAtlasBaker")
	check(baker.has_texture() and baker.get_texture().get_width() == 480 and baker.get_texture().get_height() == 168,
		"long-lived supplier retains the actual runtime texture after scratch viewport cleanup")
	var point: Vector2 = _camera.global_position
	check(_world.emit_native_text(point.x, point.y, "123", "#dd2200", 35, 28, "123"), "one numeric event enters the actual World public caller")
	var admitted: Dictionary = _world.get_native_text_snapshot()
	var deadline = Time.get_ticks_msec() + 5000
	var numeric: Dictionary = {}
	while Time.get_ticks_msec() < deadline and numeric.is_empty():
		await RenderingServer.frame_post_draw
		for command in _world.get_native_text_snapshot()["draw_trace"]:
			if command.get("op") == "num_atlas_drawn" and command.get("text") == "123":
				numeric = command
	check(not numeric.is_empty(), "actual existing consumer issued the numeric atlas render dispatch")
	if not numeric.is_empty():
		check(numeric["ci"] == 1 and numeric["blits"].size() == 3, "actual crit event draws three selected digits")
		var digits: Array = []
		for blit in numeric["blits"]:
			digits.append(blit["digit"])
			check(blit["src"] == Rect2(blit["digit"] * 48,56,48,56), "actual consumer samples supplier's crit row cell")
		check(digits == [1,2,3], "actual render blits retain admission digit order")
	for unused in range(4):
		await RenderingServer.frame_post_draw
	var after: Dictionary = _world.get_native_text_snapshot()
	check(after["number_atlas_bake_calls"] == 1 and after["number_atlas_supply_calls"] == 1,
		"further native render frames do not rebake or resupply")
	check(after["pool"] == admitted["pool"] and after["clock_calls"] == 0 and _world.get_native_frame() == 0,
		"startup and numeric drawing own no native60 clock")
	check(after["producer_counters"]["admitted"] == 1 and after["producer_counters"]["num_atlas_drawn"] > 0
		and after["producer_counters"]["num_atlas_gap_skipped"] == 0,
		"single event uses one real pool and supplied numeric renderer")
	_observations["native"] = {"display":DisplayServer.get_name(), "tiny_window_size":root.size,
		"startup_status":after["number_atlas_startup_status"], "runtime_texture_size":[480,168],
		"bake_calls":1, "supply_calls":1, "event_admissions":1, "numeric_dispatch":numeric,
		"native_ticks":0, "build_report":after["number_atlas_build_report"],
		"old_GPU8probe_replayed":false, "source_canvas_glyph_fidelity_verified":false,
		"new_screenshot_files":0, "public_world_or_Player_damage_evidence":false}

func _group(name: String, callback: Callable) -> void:
	if not _only.has(name):
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
	var known = ["headless_world_startup_atlas_guard","native_world_startup_numeric_consumer"]
	if _only.is_empty():
		_only = [known[0] if DisplayServer.get_name() == "headless" else known[1]]
	for requested in _only:
		if not known.has(requested):
			print("INVALID_ONLY_FILTER " + str(requested))
			quit(2)
			return
	await _group(known[0], _headless_world_startup_atlas_guard)
	await _group(known[1], _native_world_startup_numeric_consumer)
	print("NATIVE_NUMBER_ATLAS_BINDING_RECEIPT " + JSON.stringify({"completed":_completed, "passed":_passed,
		"failed_assertions":_failed, "evidence_class":"new_actual_World_startup_binding",
		"World_Player_physics_calls":0, "explicit_native_text_aging_calls":0,
		"explicit_render_draw_calls":0, "human_Main_save_GUI_CUA_access":false,
		"new_native_tiny_test_window":DisplayServer.get_name() != "headless",
		"live_HP_position_AI_clock_setters":false, "old_supplier9_105_or_GPU8probe_replayed":false,
		"observations":_observations}))
	if is_instance_valid(_world):
		_world.free()
	if is_instance_valid(_camera):
		_camera.free()
	quit(0 if _failed == 0 else 1)
