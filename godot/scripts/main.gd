extends Node2D
## Native Godot scene. No WebView, HTTP API or browser save access.

const NativePerspectiveViewScript = preload("res://scripts/native_perspective_view.gd")
const WorldScript = preload("res://scripts/world.gd")
const PlayerScript = preload("res://scripts/player.gd")
const CrescentScript = preload("res://scripts/crescent.gd")
const HudScript = preload("res://scripts/hud.gd")
const CaptureScript = preload("res://scripts/performance_capture.gd")
const SourceResourcesScript = preload("res://scripts/native_source_resource_authority.gd")
const SourceParameters = preload("res://port_modules/player_resource_parameters_source/producer.gd")
const SourceStateScript = preload("res://scripts/native_source_new_run_state.gd")
const SourceProvidersScript = preload("res://scripts/native_source_player_providers.gd")
const SourceInitializationScript = preload("res://scripts/native_source_player_initialization.gd")
const SourceInitializationServicesScript = preload("res://scripts/native_source_player_initialization_services.gd")
const SourceLessonScript = preload("res://port_modules/parry_lesson_source/producer.gd")
const NativeSpriteInspector = preload("res://port_modules/native_sprite_resource_readiness/producer.gd")
const NativePlayerSpriteExpectation = preload("res://scripts/native_player_sprite_expectation.gd")
const IntroCurtainViewScript = preload("res://port_modules/character_clip/intro_curtain_view.gd")
const IntroCurtainFinishScript = preload("res://port_modules/character_clip/intro_curtain_source_finish.gd")
const SourceImageWaitScript = preload("res://port_modules/source_object_sprite_wait_owner/producer.gd")
const SourcePrepareViewScript = preload("res://port_modules/source_prepare_start_map_view_owner/producer.gd")
const SourcePostStageScript = preload("res://port_modules/source_post_stage_owner/producer.gd")
const QAdapterScript = preload("res://scripts/native_combat_qe_adapter.gd")
const NativeFireballPhaseScript = preload("res://scripts/native_fireball_phase.gd")
const QBurstDrawScript = preload("res://port_modules/character_clip/shield_burst_draw_caller.gd")
const SOURCE_BOOT_EN_LABELS := {"맵 에셋 로딩...": "Loading map assets...",
	"맵 캐시 생성 중...": "Building map cache...", "완료": "Complete"}
# Recorded pins only. The baseline is not the compiled HEAD, and a source pin
# does not prove latest content. Unrecorded export facts stay null.
const NATIVE_VERSION_CONFIG := {"schema": "fdg.native-content-version.v1", "contract_revision": 1,
	"baseline_checkpoint": "e4981763fe562799f345c094102f2e284bcbe0f1",
	"baseline_checkpoint_kind": "BASELINE_NOT_CURRENT_COMPILE_HEAD",
	"source_combat_commit": "9a4534b42f74093095ebc3364a25dd104e93b379",
	"web_export": {"artifact": "fdg-godot-web-native-first-20261013", "alignment": "source-aligned",
		"documented_date": "2026-10-13", "export_timestamp": null, "export_timestamp_status": "NOT_RECORDED",
		"native_code_checkpoint": null, "native_code_checkpoint_status": "NOT_RECORDED",
		"live_url": "http://127.0.0.1:3333/output/fdg-godot-web-native-first-20261013/index.html",
		"latest_full_game": false},
	"steam": {"version": null, "version_status": "NOT_VERIFIED", "parity": "NOT_VERIFIED", "accessible": false}}

signal source_document_visibility_changed

# Platform samples only: never source dt/sp/acc or a gameplay update witness.
var _native_source_frame_timestamp_ms: Variant = null
var _native_source_render_serial := 0
var _native_source_clock_input_open := false

var native_perspective_view: Node
var native_fireball_phase: RefCounted
var native_fireball_delivery: Node
var native_q_control: RefCounted
var _q_burst_draw: Node2D
var _q_view: SubViewport
var _q_canvas: Node2D
var _q_sprite: Sprite2D
var _native_source_elements: Variant = {"P": 0, "F": 1, "I": 2, "D": 3, "L": 4, "H": 5, "E": 6}
var _native_source_elements_owner_script: WeakRef = weakref(get_script())
var _native_source_play_time_owner_script: WeakRef = weakref(get_script())

var world: Node2D
var player: CharacterBody2D
var hud: CanvasLayer
var _character_layer: CanvasLayer
var _character_panel: PanelContainer
var _character_picker: OptionButton
var _character_status: Label
var capture: Node
var camera: Camera2D
var combat: Dictionary
var source_resources: Node
var source_state: Node
var source_providers: RefCounted
var source_starter_items: Dictionary = {}
var source_initialization: RefCounted
var source_initialization_services: RefCounted
var _source_l_eq_cache: Variant = null
var _source_l_eq_write_context: Dictionary = {}
var source_initialization_result: Dictionary = {}
var source_lesson: RefCounted
var _source_lesson_file_init_attempted: bool = false
var _source_lesson_file_init_publish_calls: int = 0
var _source_lesson_boot_packet: Dictionary = {}
var _source_lesson_publish_result: Dictionary = {}
var _source_lesson_binding_error: String = "not_file_init_published"
var _native_player_sprite_startup_report: Dictionary = {}
var _native_player_sprite_startup_readonly_calls: int = 0
var source_intro_curtain: Control
var source_intro_curtain_finish: Node2D
var _source_intro_curtain_binding_error: String = "not_bound"
var source_image_wait: Node
var _native_source_image_wait_startup: Dictionary = {}
var _native_startup_window: WeakRef
var _native_window_visibility_events: int = 0
var source_prepare_start_view: Node
var source_post_stage: Node
var _native_prepare_configuration: Dictionary = {}
var _native_post_stage_configuration: Dictionary = {}
var _native_source_extra_registration: Dictionary = {}
var _native_source_object_registration: Dictionary = {}

func _ready() -> void:
	_publish_native_source_lesson_file_init()
	process_mode = Node.PROCESS_MODE_ALWAYS
	Engine.max_fps = 240
	_register_inputs()
	combat = JSON.parse_string(FileAccess.get_file_as_string("res://data/combat.json"))
	world = WorldScript.new()
	world.name = "CH1CanonicalWorld"
	world.process_mode = Node.PROCESS_MODE_PAUSABLE
	add_child(world)
	if not world.ready_for_player:
		push_error("Native World startup rejected: " + world.get_native_startup_error() + "; player startup stopped.")
		return
	player = PlayerScript.new()
	player.name = "Player"
	player.process_mode = Node.PROCESS_MODE_PAUSABLE
	player.z_as_relative = false
	player.position = world.get_start_position()
	player.set_combat(combat)
	player.set_world(world)
	source_resources = SourceResourcesScript.new()
	source_resources.name = "SourcePlayerResources"
	# Construct source resources on this new actor before it enters the Tree.
	# SOURCE_BOOT remains an input record; current reads use the actual holder.
	if not source_resources.initialize_new_run(player, world, SourceParameters.source_boot_parameters()):
		push_error("Source new-run resource initialization rejected; player startup stopped.")
		source_resources.free()
		source_resources = null
		player.free()
		player = null
		return
	source_state = SourceStateScript.new()
	source_state.name = "SourceNewRunState"
	if not source_state.initialize_new_run(player, world, source_resources):
		_stop_source_player_startup("source_state_constructor_rejected")
		return
	# The source factory samples the actual shared native RNG and system clock.
	# Install all 15 default items, then create/append the 10 bag items once.
	source_starter_items = source_state.run_native_initial_starter_items(
		Callable(world, "sample_native_random_unit"), Callable(self, "_source_now_ms"))
	if source_starter_items.get("status") != "READY":
		_stop_source_player_startup("source_starter_items_rejected:" + str(source_starter_items.get("reason")))
		return
	source_providers = SourceProvidersScript.new()
	if not source_providers.configure(player, world, source_state, source_resources):
		_stop_source_player_startup("source_provider_configuration_rejected:" + str(source_providers.get_snapshot().get("error")))
		return
	if not _initialize_source_player_parameters():
		_stop_source_player_startup("source_parameter_initialization_rejected:" + str(source_initialization_result.get("reason")))
		return
	world.add_child(source_resources)
	world.add_child(source_state)
	add_child(player)
	world.set_player(player)
	if not player.bind_native_armor_inventory(Callable(source_state, "read_current_inventory")):
		_stop_source_player_startup("native_armor_inventory_binding_rejected")
		return
	if not player.bind_native_attack_selection(Callable(source_state,"read_current_p")):
		_stop_source_player_startup("native_current_attack_selection_binding_rejected")
		return
	if not world.bind_native_player_source_resources(source_resources):
		push_error("Actual source resource holder binding rejected; player startup stopped.")
		return
	if not world.bind_native_player_projectile_store(self):
		_stop_source_player_startup("native_player_projectile_store_binding_rejected")
		return
	if not world.bind_native_player_projectile_consumer(self):
		_stop_source_player_startup("native_player_projectile_consumer_binding_rejected")
		return
	# Read the existing ready Player child. Main is still inside its own _ready;
	# native resource inspection does not acknowledge source startup or quality.
	_native_player_sprite_startup_readonly_calls += 1
	_native_player_sprite_startup_report = get_native_player_sprite_readiness()
	if _native_player_sprite_startup_report.get("status") != "READY":
		_stop_source_player_startup("native_player_sprite_not_ready:" + str(_native_player_sprite_startup_report.get("reason")))
		# Abort only this newly constructed scene before camera/HUD/capture.
		# Keep the failed diagnostic; no replacement actor or cached READY.
		world.free()
		world = null
		set_physics_process(false)
		set_process_unhandled_input(false)
		return
	player.crescent_requested.connect(_spawn_crescent)
	player.telemetry_event.connect(_record_event)
	native_fireball_phase=NativeFireballPhaseScript.new()
	if not native_fireball_phase.configure(self):
		_stop_source_player_startup("native_fireball_phase_bindings_rejected")
		return
	player.native_fireball_phase_tick.connect(_advance_native_fireball_phase)
	if world.has_signal("telemetry_event"):
		world.telemetry_event.connect(_record_event)
	camera = Camera2D.new()
	camera.name = "GameplayCamera"
	camera.process_mode = Node.PROCESS_MODE_PAUSABLE
	camera.position = player.position
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 7.0
	camera.process_callback = Camera2D.CAMERA2D_PROCESS_PHYSICS
	camera.limit_left = 0
	camera.limit_top = 0
	camera.limit_right = 8000
	camera.limit_bottom = 8000
	add_child(camera)
	camera.make_current()
	camera.reset_smoothing()
	capture = CaptureScript.new()
	capture.name = "PerformanceCapture"
	add_child(capture)
	if capture.has_method("bind"):
		capture.bind(player, world)
	capture.start_session({"source_checkout": "/Users/fordeargamers/Projects/exoduser-migration-20261001", "source_parent": "9a4534b42f74093095ebc3364a25dd104e93b379", "source_mode": "CH1-1 canonical encounter; actual pre-stage source Player parameters", "source_player_initialization": get_native_source_player_initialization_snapshot(), "native_player_sprite_readiness": get_native_player_sprite_startup_snapshot(), "initial_encounter_factory": _encounter_summary(), "target": "our Steam minimum class / 1920x1080 / 240FPS", "measurement_device": "Apple M5 Pro / 24 GiB / macOS arm64", "low_spec_windows_measured": false})
	hud = HudScript.new()
	hud.name = "HUD"
	add_child(hud)
	hud.bind(player, world)
	hud.pause_requested.connect(_toggle_pause)
	hud.restart_requested.connect(_restart)
	_build_native_character_selection_ui()
	_install_native_q_control()
	_install_native_attack_audio()
	_bind_native_intro_curtain_view()
	_bind_native_startup_services()
	var metrics_timer := Timer.new()
	metrics_timer.wait_time = 0.1
	metrics_timer.process_mode = Node.PROCESS_MODE_ALWAYS
	metrics_timer.timeout.connect(func() -> void: hud.set_telemetry(capture.live_metrics()))
	add_child(metrics_timer)
	metrics_timer.start()
	if OS.get_cmdline_user_args().has("--fdg-native-perspective-first"):
		var perspective_result: Dictionary = mount_native_perspective_view()
		if perspective_result.get("ready") != true:
			push_error("Native perspective mount rejected: " + str(perspective_result.get("reason")))
	_record_event("native_factory_created", {"source": "canonical migration mkP / CH1-1", "simulation_hz": 60, "render_target_fps": 240, "initial_state": _play_state(), "version_manifest": get_native_content_version_manifest()})
	print("GODOT_FIRST_PLAYABLE_READY ", JSON.stringify({"runtime": Engine.get_version_info()["string"], "scene": "res://scenes/main.tscn", "viewport": get_viewport_rect().size, "player_spawn": player.position}))

func mount_native_perspective_view(settings: Dictionary = {}) -> Dictionary:
	if not _native_main_service_live() or not _native_content_version_not_ready_reason().is_empty():
		return {"ready":false, "reason":"actual_main_not_ready"}
	if is_instance_valid(native_perspective_view):
		return {"ready":false, "reason":"perspective_view_already_owned"}
	native_perspective_view = NativePerspectiveViewScript.new()
	native_perspective_view.name = "NativePerspectiveView"
	native_perspective_view.process_mode = Node.PROCESS_MODE_PAUSABLE
	add_child(native_perspective_view)
	var result: Dictionary = native_perspective_view.mount(self, settings)
	if result.get("ready") != true:
		native_perspective_view.free()
		native_perspective_view = null
	# Collision-box mass is an explicit diagnostic API, not original scenery.
	return result

func _native_perspective_view_owned() -> bool:
	return _native_main_service_live() and is_instance_valid(native_perspective_view) \
		and not native_perspective_view.is_queued_for_deletion() and native_perspective_view.get_parent() == self \
		and native_perspective_view.is_inside_tree() and native_perspective_view.get_tree() == get_tree() \
		and native_perspective_view.get_script() == NativePerspectiveViewScript

func get_native_perspective_view_snapshot() -> Dictionary:
	return native_perspective_view.get_snapshot() if _native_perspective_view_owned() else {"ready":false, "reason":"not_mounted"}

func bind_native_map_draw_owner(owner: Node) -> Dictionary:
	return native_perspective_view.bind_native_map_draw_owner(owner) if _native_perspective_view_owned() else {"bound":false, "ready":false, "reason":"perspective_view_not_owned"}

func get_native_map_draw_publication() -> Dictionary:
	return native_perspective_view.read_native_map_draw_publication() if _native_perspective_view_owned() else {"bound":false, "ready":false, "reason":"perspective_view_not_owned"}

func native_world_to_screen(point: Vector2, height: float = 0.0) -> Dictionary:
	return native_perspective_view.world_to_screen(point, height) if _native_perspective_view_owned() else {"ready":false}

func native_screen_to_world(screen: Vector2, height: float = 0.0) -> Dictionary:
	return native_perspective_view.screen_to_world(screen, height) if _native_perspective_view_owned() else {"ready":false}

func _native_main_service_live() -> bool:
	return is_inside_tree() and not is_queued_for_deletion() \
		and get_script() != null and get_script().resource_path == "res://scripts/main.gd"

func get_native_content_version_manifest() -> Dictionary:
	# Read-only: actual Main-owned consumers only. No asset/PNG load, source G
	# write, fallback actor or cached READY. Content parity stays incomplete.
	var reason: String = _native_content_version_not_ready_reason()
	var manifest: Dictionary = {"schema": NATIVE_VERSION_CONFIG["schema"],
		"config": NATIVE_VERSION_CONFIG.duplicate(true), "scope": "actual_selected_native_consumers",
		"status": "CURRENT_NATIVE_CONTENT_MANIFEST" if reason.is_empty() else "NOT_READY",
		"reason": reason, "content_parity": "INCOMPLETE", "latest_full_game": false}
	manifest["platform_frame_input"] = world.read_native_source_frame_input() if is_instance_valid(world) and world.has_method("read_native_source_frame_input") else {"ready":false,"reason":"actual_world_unbound","source_clock_ready":false}
	manifest["source_clock_input_authority"] = get_native_source_clock_input_snapshot()
	if not reason.is_empty():
		return manifest
	var sprite: AnimatedSprite2D = player.get_node_or_null("Warrior")
	var animations: Array = []
	for animation in sprite.sprite_frames.get_animation_names():
		var count: int = sprite.sprite_frames.get_frame_count(animation)
		var first: Texture2D = sprite.sprite_frames.get_frame_texture(animation, 0) if count > 0 else null
		animations.append({"name": str(animation), "frames": count,
			"fps": sprite.sprite_frames.get_animation_speed(animation),
			"first_frame_atlas": first.atlas.resource_path if first is AtlasTexture and first.atlas != null else null})
	manifest["character"] = {"consumer": str(sprite.get_path()), "type": sprite.get_class(),
		"character_selector_implemented":is_instance_valid(_character_picker),"selection":read_native_character_selection(),
		"profile":player.get_native_character_profile_snapshot(),"original_storage_restored":false,"animations": animations}
	manifest["input"]=read_native_input_bindings()
	manifest["q_control"]=player.get_native_q_control_snapshot()
	manifest["q_reflection"]=get_native_q_reflection_snapshot()
	manifest["e_control"]=player.get_native_e_control_snapshot()
	manifest["attack_tempo"]=player.get_native_attack_tempo_snapshot()
	manifest["attack_audio"]=get_native_attack_audio_snapshot()
	manifest["fireball_owner"]=native_fireball_phase.get_snapshot() if is_instance_valid(native_fireball_phase) else {"producer_bound":false}
	manifest["fireball_delivery"]=read_native_fireball_delivery_readiness()
	manifest["fireball_sample_dispatch"]=get_native_fireball_sample_snapshot()
	manifest["player_projectile_store"]=world.get_native_player_projectile_store_snapshot()
	manifest["fireball_world_consumer"]=world.get_native_player_projectile_consumer_snapshot()
	var slash: Variant = player.get_script().get_script_constant_map().get("SLASH_SHEET")
	var combat_source: Variant = combat.get("source")
	var qe: Dictionary = player.get_native_combat_qe_snapshot()
	manifest["skills"] = {"combat_schema": combat.get("schema"),
		"current_lmb":player.get_native_attack_selection_snapshot(),
		"current_attack_parameters":read_native_attack_parameters(),
		"combat_source_commit": combat_source.get("commit") if combat_source is Dictionary else null,
		"combat_source_profile": combat_source.get("profile") if combat_source is Dictionary else null,
		"ki_slash": _source_lesson_json_diagnostic(combat.get("kiSlash")),
		"q_scope": player.get_snapshot().get("q_scope"),
		"combat_qe": {"ready": qe.get("ready"), "bound": qe.get("bound"), "status": qe.get("status"), "scope": qe.get("scope")},
		"ki_slash_sheet": slash.resource_path if slash is Resource else "UNBOUND"}
	var map_data: Variant = world.get("map_data")
	var map_meta: Dictionary = {}
	for key in ["schema", "stage", "name", "source", "source_meta"]:
		map_meta[key] = _source_lesson_json_diagnostic(map_data.get(key)) if map_data is Dictionary else null
	manifest["map"] = {"world": str(world.get_path()), "map_data": map_meta,
		"surface_context": _source_lesson_json_diagnostic(world.get_native_map_surface_context()) \
			if world.has_method("get_native_map_surface_context") else "UNBOUND",
		"camera": {"consumer": str(camera.get_path()), "class": camera.get_class(),
			"projection": "native_2d", "perspective": false, "zoom": [camera.zoom.x, camera.zoom.y]}}
	manifest["map"]["perspective_view"] = get_native_perspective_view_snapshot()
	# Source G is observed only; null map means the source map stage is not live.
	var g: Variant = source_state.read_current_g() \
		if is_instance_valid(source_state) and source_state.has_method("read_current_g") else null
	var g_map_null: Variant = g.get("map") == null if g is Dictionary and g.has("map") else null
	manifest["source_g"] = {"bound": g != null, "map_null": g_map_null}
	var gaps: Array = ["original_character_storage_restore_unimplemented",
		"original_24_unique_frames_24fps_unimplemented_full_quality_not_verified", "css5_unported",
		"world_cache_unported", "full_startup_unported", "not_latest_steam_content",
		"source_pin_does_not_prove_latest_content"]
	if g_map_null != false:
		gaps.append("source_G_map_null_or_unbound")
	manifest["gaps"] = gaps
	return manifest

func _native_content_version_not_ready_reason() -> String:
	if not _native_main_service_live():
		return "actual_main_not_live"
	var owners: Dictionary = {"player": [player, PlayerScript], "world": [world, WorldScript], "camera": [camera, null]}
	for key in owners:
		var node: Variant = owners[key][0]
		if not is_instance_valid(node):
			return "actual_%s_missing" % key
		if node.is_queued_for_deletion():
			return "actual_%s_queued_for_deletion" % key
		if node.get_parent() != self or not node.is_inside_tree() or node.get_tree() != get_tree():
			return "actual_%s_not_physical_main_child" % key
		if owners[key][1] != null and node.get_script() != owners[key][1]:
			return "actual_%s_script_lost" % key
	if world.player != player:
		return "actual_world_player_identity_lost"
	if not is_instance_valid(source_state) or source_state.is_queued_for_deletion():
		return "actual_source_state_missing_or_queued"
	if source_state.get_parent() != world or not source_state.is_inside_tree() or source_state.get_tree() != get_tree() \
			or source_state.get_script() != SourceStateScript:
		return "actual_source_state_owner_lost"
	if get_viewport().get_camera_2d() != camera:
		return "actual_main_camera_not_current"
	var sprite: Node = player.get_node_or_null("Warrior")
	if not sprite is AnimatedSprite2D or sprite.is_queued_for_deletion() or sprite.sprite_frames == null:
		return "actual_player_animated_sprite_missing"
	return ""

func _bind_native_startup_services() -> void:
	world.bind_native_boot_map_source_state(source_state)
	# Native visibility is an explicit compatibility boundary. Focus and game
	# pause are not document visibility, and desktop occlusion is not published.
	var window: Window = get_window()
	if window != null and window.is_inside_tree() and not window.is_queued_for_deletion():
		_native_startup_window = weakref(window)
		window.visibility_changed.connect(_on_native_window_visibility_changed)
	# Consume the original wait owner with the actual current loader provider.
	# Partial native resource coverage remains NOT_READY in its source packet.
	source_image_wait = SourceImageWaitScript.new()
	source_image_wait.name = "SourceObjectSpriteWait"
	add_child(source_image_wait)
	# The current extra namespace is created by the actual World loader before
	# the source wait captures its original raw references. Gate onload later
	# replaces only the current array entries; captured raw references survive.
	_native_source_extra_registration = world.register_native_source_extra_images()
	_native_source_object_registration = world.register_native_source_object_images()
	source_image_wait.bind_source_providers(world, world, world)
	var handle = source_image_wait.begin_wait(8000)
	if handle.is_terminal:
		_native_source_image_wait_startup = handle.packet
	else:
		handle.finished.connect(_on_native_source_image_wait_finished, CONNECT_ONE_SHOT)
	_bind_native_source_startup_owners()

func _bind_native_source_startup_owners() -> void:
	source_prepare_start_view = SourcePrepareViewScript.new()
	source_prepare_start_view.name = "SourcePrepareStartMapView"
	add_child(source_prepare_start_view)
	_native_prepare_configuration = source_prepare_start_view.configure({
		"localize": Callable(self, "localize_native_startup_text"),
		"set_boot_loading": Callable(self, "set_native_boot_loading"),
		"document_hidden": Callable(self, "read_native_document_hidden"),
		"visibility_changed": source_document_visibility_changed})
	source_post_stage = SourcePostStageScript.new()
	source_post_stage.name = "SourcePostStage"
	add_child(source_post_stage)
	# Bind the actual peer Node directly: the source wait packet's authority is
	# that Node, not the Main wrapper. Unported services remain omitted/NOT_READY.
	_native_post_stage_configuration = source_post_stage.configure({
		"current_g": Callable(source_state, "read_current_g"),
		"current_p": Callable(source_state, "read_current_p"),
		"localize": Callable(self, "translate_native_boot_label"),
		"set_boot_loading": Callable(self, "set_native_boot_loading"),
		"wait_obj_sprites": Callable(source_image_wait, "wait_obj_sprites"),
		"prepare_start_map_view": Callable(source_prepare_start_view, "run_prepare_start_map_view"),
		"hide_boot_loading": Callable(self, "hide_native_boot_loading")})

func _on_native_source_image_wait_finished(packet: Dictionary) -> void:
	_native_source_image_wait_startup = packet

func _on_native_window_visibility_changed() -> void:
	if not _native_main_service_live():
		return
	_native_window_visibility_events += 1
	source_document_visibility_changed.emit()

func _exit_tree() -> void:
	_dispose_native_attack_audio()
	var window: Window = _native_startup_window.get_ref() if _native_startup_window != null else null
	if is_instance_valid(window) and window.visibility_changed.is_connected(_on_native_window_visibility_changed):
		window.visibility_changed.disconnect(_on_native_window_visibility_changed)
	_native_startup_window = null

func read_native_document_hidden() -> Variant:
	if not _native_main_service_live() or _native_startup_window == null:
		return null
	var window: Window = _native_startup_window.get_ref()
	if not is_instance_valid(window) or window.is_queued_for_deletion() \
			or not window.is_inside_tree() or window != get_window():
		return null
	return not window.visible or window.mode == Window.MODE_MINIMIZED

func get_native_document_visibility_snapshot() -> Dictionary:
	var hidden: Variant = read_native_document_hidden()
	return {"status": "READY" if typeof(hidden) == TYPE_BOOL else "NOT_READY",
		"scope": "native_window_visibility_compatibility", "hidden": hidden,
		"visibility_changed": source_document_visibility_changed,
		"events": _native_window_visibility_events,
		"policy": "hidden_or_minimized_actual_window; focus_and_pause_independent",
		"desktop_occlusion_supported": false, "browser_document_equivalence_proven": false,
		"minimize_signal_delivery_proven": false,
		"display_server": DisplayServer.get_name(), "full_main_ready": false}

func get_native_startup_language_snapshot() -> Dictionary:
	if not _native_main_service_live():
		return {"status": "NOT_READY", "reason": "actual_main_not_live"}
	if not is_instance_valid(source_initialization_services) \
			or not source_initialization_services.has_method("read_current_options"):
		return {"status": "NOT_READY", "reason": "actual_source_OPT_owner_missing"}
	var options: Variant = source_initialization_services.read_current_options()
	if not options is Dictionary or not options.get("lang") is String:
		return {"status": "NOT_READY", "reason": "actual_current_OPT_lang_unpublished"}
	var language: String = options["lang"]
	return {"status": "READY" if language in ["ko", "en"] else "NOT_READY",
		"reason": "" if language in ["ko", "en"] else "source_language_catalog_unbound:" + language,
		"language": language, "native_locale": TranslationServer.get_locale(),
		"reader": "actual source_initialization_services.read_current_options",
		"source_OPT_lang_bound": true, "source_T_catalog_bound": false,
		"source_boot_EN_subset": SOURCE_BOOT_EN_LABELS.duplicate(),
		"format_values_supported": false, "full_main_ready": false}

func localize_native_startup_text(ko: String, en: String) -> String:
	var language: Dictionary = get_native_startup_language_snapshot()
	if language.get("status") != "READY":
		return ""
	# Original two-string selection uses current OPT.lang. The full _T catalog
	# and ExoduserI18n.format values remain outside this small loading seam.
	if language["language"] == "ko":
		return ko
	# Original _L prefers _T when the Korean key exists in the EN table;
	# otherwise its exact caller-supplied English string is used.
	return str(SOURCE_BOOT_EN_LABELS.get(ko, en))

func translate_native_boot_label(text: String) -> Variant:
	var language: Dictionary = get_native_startup_language_snapshot()
	if language.get("status") != "READY":
		return null
	if language["language"] == "ko" or text.is_empty():
		return text
	if SOURCE_BOOT_EN_LABELS.has(text):
		return SOURCE_BOOT_EN_LABELS[text]
	# These are already-localized literals at the known boot callpoints. Unknown
	# keys require the unported original _T catalog rather than a guessed fallback.
	if text in SOURCE_BOOT_EN_LABELS.values() or text == SourcePrepareViewScript.TEXT_EN:
		return text
	return null

func set_native_boot_loading(percent: Variant, text: Variant) -> Dictionary:
	if not _native_main_service_live() or not is_instance_valid(hud) \
			or hud.is_queued_for_deletion() or hud.get_parent() != self \
			or not hud.is_inside_tree() or not hud.has_method("set_native_boot_loading"):
		return {"status": "NOT_READY", "reason": "actual_HUD_loading_writer_missing"}
	if not text is String:
		return {"status": "NOT_READY", "reason": "invalid_loading_text"}
	var localized: Variant = translate_native_boot_label(text)
	if not localized is String:
		return {"status": "NOT_READY", "reason": "source_boot_label_translation_unbound"}
	return hud.set_native_boot_loading(percent, localized)

func hide_native_boot_loading() -> Dictionary:
	if not _native_main_service_live() or not is_instance_valid(hud) \
			or hud.is_queued_for_deletion() or hud.get_parent() != self \
			or not hud.is_inside_tree() or not hud.has_method("hide_native_boot_loading"):
		return {"status": "NOT_READY", "reason": "actual_HUD_loading_writer_missing"}
	return hud.hide_native_boot_loading()

func get_native_source_image_wait_snapshot() -> Dictionary:
	var live: bool = _native_main_service_live() and is_instance_valid(source_image_wait) \
		and not source_image_wait.is_queued_for_deletion() and source_image_wait.get_parent() == self \
		and source_image_wait.is_inside_tree() and source_image_wait.get_tree() == get_tree() \
		and source_image_wait.get_script() != null \
		and source_image_wait.get_script().resource_path == "res://port_modules/source_object_sprite_wait_owner/producer.gd" \
		and is_instance_valid(world) and not world.is_queued_for_deletion() \
		and world.is_inside_tree() and world.get_parent() == self and world.get_tree() == get_tree()
	return {"status": "BOUND" if live else "NOT_READY",
		"packet": _native_source_image_wait_startup.duplicate(true),
		"extra_registration": _native_source_extra_registration.duplicate(true),
		"object_registration": _native_source_object_registration.duplicate(true),
		"source_wait_completed": false, "full_main_ready": false,
		"source_coverage_gaps": [world.get_source_obj_spr_publication().get("reason"),
			world.capture_source_extra_img_globals().get("reason")] if live else ["actual_provider_not_live"],
		"pending_requests": source_image_wait.get_pending_count() if live else null,
		"active_poll_timers": source_image_wait.get_active_poll_timer_count() if live else null}

func get_native_startup_service_bindings() -> Dictionary:
	if not _native_main_service_live():
		return {"status": "NOT_READY", "reason": "actual_main_not_live", "bindings": {}}
	return {"status": "PARTIAL_NATIVE_BINDINGS", "owner": self,
		"bindings": {"set_boot_loading": Callable(self, "set_native_boot_loading"),
			"hide_boot_loading": Callable(self, "hide_native_boot_loading"),
			"localize": Callable(self, "localize_native_startup_text"),
			"post_stage_localize": Callable(self, "translate_native_boot_label"),
			"document_hidden": Callable(self, "read_native_document_hidden"),
			"visibility_changed": source_document_visibility_changed},
		"unbound": ["source_T_catalog", "CH1_enabled", "CH1_view_ids",
			"CH1_preload_view", "CH1_current_cache", "CH1_fallback_writer", "source_warn"],
		"full_main_ready": false}

func get_native_source_startup_owner_snapshot() -> Dictionary:
	var live: bool = _native_main_service_live() and is_instance_valid(source_prepare_start_view) \
		and not source_prepare_start_view.is_queued_for_deletion() \
		and source_prepare_start_view.get_parent() == self and source_prepare_start_view.is_inside_tree() \
		and source_prepare_start_view.get_script() == SourcePrepareViewScript \
		and source_prepare_start_view.get_tree() == get_tree() \
		and is_instance_valid(source_post_stage) and not source_post_stage.is_queued_for_deletion() \
		and source_post_stage.get_parent() == self and source_post_stage.is_inside_tree() \
		and source_post_stage.get_script() == SourcePostStageScript and source_post_stage.get_tree() == get_tree()
	return {"status": "BOUND_PARTIAL" if live else "NOT_READY",
		"prepare_configuration": _native_prepare_configuration.duplicate(true),
		"post_stage_configuration": _native_post_stage_configuration.duplicate(true),
		"post_stage_completion": source_post_stage.completion() if live else null,
		"upstream_init_stage_complete": false, "auto_run_post_stage": false,
		"source_G_activation_bound": false, "full_main_ready": false}

func wait_native_source_images(timeout_ms: Variant) -> Dictionary:
	if get_native_source_image_wait_snapshot().get("status") != "BOUND":
		return {"status": "NOT_READY", "reason": "actual_source_image_wait_owner_not_live"}
	return await source_image_wait.wait_obj_sprites(timeout_ms)

func _bind_native_intro_curtain_view() -> void:
	# Supply the existing HUD parent; the source view creates no actor or asset.
	# It stays hidden until the future original intro controller calls it.
	source_intro_curtain = IntroCurtainViewScript.new()
	source_intro_curtain.name = "SourceIntroCurtain"
	if not source_intro_curtain.bind(hud):
		_source_intro_curtain_binding_error = "actual_HUD_curtain_binding_rejected"
		source_intro_curtain.free()
		source_intro_curtain = null
		return
	_source_intro_curtain_binding_error = ""
	# Consume the completed shadow facet on this existing view. Source-z
	# ordering remains unbound until all actual neighbouring UI mappings exist.
	source_intro_curtain_finish = IntroCurtainFinishScript.new()
	source_intro_curtain_finish.name = "SourceIntroCurtainShadow"
	if not source_intro_curtain_finish.bind(source_intro_curtain):
		source_intro_curtain_finish.free()
		source_intro_curtain_finish = null

func get_native_intro_curtain_view() -> Control:
	# Return only the actual current view owned by this Main's HUD.
	var script: Script = get_script()
	if is_queued_for_deletion() or not is_inside_tree() or script == null \
			or script.resource_path != "res://scripts/main.gd":
		return null
	if not is_instance_valid(hud) or hud.is_queued_for_deletion() \
			or hud.get_parent() != self or hud.get_tree() != get_tree():
		return null
	if not is_instance_valid(source_intro_curtain) or source_intro_curtain.is_queued_for_deletion() \
			or not source_intro_curtain.is_inside_tree() or not source_intro_curtain.is_node_ready() \
			or source_intro_curtain.get_parent() != hud or source_intro_curtain.get_tree() != get_tree():
		return null
	var view_script: Script = source_intro_curtain.get_script()
	if view_script == null or view_script.resource_path != "res://port_modules/character_clip/intro_curtain_view.gd":
		return null
	return source_intro_curtain

func get_native_intro_curtain_snapshot() -> Dictionary:
	var view: Control = get_native_intro_curtain_view()
	var finish_script: Script = source_intro_curtain_finish.get_script() if is_instance_valid(source_intro_curtain_finish) else null
	var shadow_bound: bool = view != null and is_instance_valid(source_intro_curtain_finish) \
		and finish_script != null and finish_script.resource_path == "res://port_modules/character_clip/intro_curtain_source_finish.gd" \
		and not source_intro_curtain_finish.is_queued_for_deletion() \
		and source_intro_curtain_finish.is_inside_tree() \
		and source_intro_curtain_finish.get_parent() == view \
		and source_intro_curtain_finish.get_tree() == get_tree() and source_intro_curtain_finish.view == view
	return {"schema": "fdg-native-main-intro-curtain-service-v1",
		"status": "READY" if view != null else "NOT_READY", "readiness_scope": "native_ui_service",
		"reason": "" if view != null else (_source_intro_curtain_binding_error if not _source_intro_curtain_binding_error.is_empty() else "actual_curtain_view_not_live"),
		"bound": view != null, "hidden": not view.visible if view != null else null,
		"parent": str(view.get_parent().name) if view != null else null,
		"elapsed_ms": view.elapsed_ms() if view != null else null,
		"progress": view.progress() if view != null else null,
		"source_controller_bound": false, "source_startup_activation_bound": false,
		"full_main_ready": false, "public_play_proven": false, "gpu_render": "NOT_PROVEN",
		"inset_shadow_bound": shadow_bound, "inset_shadow_blur_px": 80.0, "inset_shadow_alpha": 0.95,
		"hairline_shadow_residual_max": 0.014, "parent_z45_bound": false,
		"not_rendered": [] if shadow_bound else IntroCurtainViewScript.NOT_RENDERED.duplicate()}

func get_native_player_sprite_readiness() -> Dictionary:
	# Inspect actual Main-owned resources synchronously, without another actor,
	# texture load, clock advance or source completion publication.
	var script: Script = get_script()
	if is_queued_for_deletion() or not is_inside_tree() or script == null \
			or script.resource_path != "res://scripts/main.gd":
		return _native_player_sprite_not_ready("actual_main_not_live")
	if not is_instance_valid(player):
		return _native_player_sprite_not_ready("actual_player_missing")
	if player.is_queued_for_deletion():
		return _native_player_sprite_not_ready("player_queued_for_deletion")
	if not player.is_inside_tree() or not player.is_node_ready() \
			or player.get_parent() != self or player.get_tree() != get_tree():
		return _native_player_sprite_not_ready("actual_player_tree_not_ready")
	if not is_instance_valid(world) or world.is_queued_for_deletion() \
			or world.get_parent() != self or world.get_tree() != get_tree() \
			or world.player != player:
		return _native_player_sprite_not_ready("actual_world_player_identity_lost")
	var selected: Dictionary = player.get_native_character_profile_snapshot()
	if selected.get("selection_applied")==true and selected.get("ready")!=true:
		return _native_player_sprite_not_ready("current_native_character_profile_not_ready")
	return _native_player_sprite_scope(NativeSpriteInspector.inspect(player,NativePlayerSpriteExpectation.build(selected if selected.get("ready")==true else {})))

func get_native_player_sprite_startup_snapshot() -> Dictionary:
	return {"report": _native_player_sprite_startup_report.duplicate(true),
		"startup_readonly_calls": _native_player_sprite_startup_readonly_calls,
		"full_main_ready": false, "public_play_proven": false}

func _native_player_sprite_not_ready(reason: String) -> Dictionary:
	var report: Dictionary = NativeSpriteInspector.inspect(null, NativePlayerSpriteExpectation.build())
	report["reason"] = reason
	report["errors"] = [{"code": reason, "at": "actual_Main_Player", "detail": {}}]
	return _native_player_sprite_scope(report)

func _native_player_sprite_scope(report: Dictionary) -> Dictionary:
	report["full_main_ready"] = false
	report["public_play_proven"] = false
	report["automatic_source_regeneration_bound"] = false
	return report

func _publish_native_source_lesson_file_init() -> void:
	# The source file literal precedes World/Player/new-run construction.
	# The original full controller and new-character reset are not invoked.
	if _source_lesson_file_init_attempted:
		return
	_source_lesson_file_init_attempted = true
	var script: Script = get_script()
	if script == null or script.resource_path != "res://scripts/main.gd":
		_source_lesson_binding_error = "physical_native_main_script_mismatch"
		return
	source_lesson = SourceLessonScript.new()
	_source_lesson_boot_packet = SourceLessonScript.source_constructor_packet()
	var provenance: Dictionary = {"caller": "Main._ready/file_init", "native_main_instance_id": get_instance_id(),
		"main_resource_path": script.resource_path, "native_phase": "before_World_Player_source_construction",
		"source_file_init": "R parry-lesson.js:2-6", "automatic_source_regeneration_bound": false}
	_source_lesson_file_init_publish_calls += 1
	_source_lesson_publish_result = source_lesson.publish_file_init(SourceLessonScript.ORIGIN_NATIVE_MAIN_BINDING, provenance)
	_source_lesson_binding_error = "" if _source_lesson_publish_result.get("status") == "READY" \
		and _source_lesson_publish_result.get("ready") == true else "original_file_init_publish_rejected"

func get_native_source_lesson_callable() -> Callable:
	# Main custody is the lifetime boundary, not a pinned epoch or a false
	# fallback. The same callable is usable before publication and afterwards.
	return Callable(self, "_read_native_source_lesson_guard")

func _read_native_source_lesson_guard() -> Variant:
	if not _native_source_lesson_holder_live():
		return null
	var reader: Callable = source_lesson.get_dispatcher_lesson_callable()
	return reader.call() if reader.is_valid() else null

func _native_source_lesson_holder_live() -> bool:
	var script: Script = get_script()
	return not is_queued_for_deletion() and script != null and script.resource_path == "res://scripts/main.gd" \
		and is_instance_valid(source_lesson) and source_lesson.get_script() == SourceLessonScript

func get_native_source_lesson_snapshot() -> Dictionary:
	var holder_live: bool = _native_source_lesson_holder_live()
	# This diagnostic read increments the original read_guard counter once.
	# It neither advances a lesson/controller nor runs resource regeneration.
	var guard: Dictionary = source_lesson.read_guard_detail() if holder_live else {
		"status": "NOT_READY", "ready": false, "value": null, "reason": "actual_Main_lesson_holder_unavailable"}
	var holder: Dictionary = source_lesson.get_snapshot() if holder_live else {}
	return {"status": guard.get("status"), "guard_ready": guard.get("ready") == true,
		"holder_retained_by_actual_Main": holder_live, "native_main_instance_id": get_instance_id(),
		"file_init_attempted": _source_lesson_file_init_attempted,
		"file_init_publish_calls": _source_lesson_file_init_publish_calls,
		"file_init_error": _source_lesson_binding_error,
		"source_boot_input": _source_lesson_boot_packet.duplicate(true),
		"publish_result": _source_lesson_publish_result.duplicate(true),
		"holder": _source_lesson_json_diagnostic(holder), "guard_detail": _source_lesson_json_diagnostic(guard),
		"raw_current_reference_is_not_guard_authority": true,
		"lesson_controller_bound": false, "automatic_source_regeneration_bound": false,
		"full_main_ready": false, "public_play_proven": false}

static func _source_lesson_json_diagnostic(value: Variant) -> Variant:
	if typeof(value) == TYPE_NIL or value is bool or value is String or value is int:
		return value
	if value is float:
		return value if is_finite(value) else "SOURCE_NON_FINITE_DIAGNOSTIC"
	if value is Dictionary:
		var copy: Dictionary = {}
		for key in value:
			copy[str(key)] = _source_lesson_json_diagnostic(value[key])
		return copy
	if value is Array:
		var copy: Array = []
		for item in value:
			copy.append(_source_lesson_json_diagnostic(item))
		return copy
	return "UNSERIALIZABLE_SOURCE_DIAGNOSTIC:" + type_string(typeof(value))

func _source_now_ms() -> float:
	return floor(Time.get_unix_time_from_system() * 1000.0)

func _initialize_source_player_parameters() -> bool:
	# Keep the real suppliers and dispatcher alive for this actual Main.
	# All source writes occur before the new actor enters the Tree.
	source_initialization = SourceInitializationScript.new()
	source_initialization_services = SourceInitializationServicesScript.new()
	if not source_initialization_services.configure(player, world, source_state,
			source_resources, source_providers, source_initialization):
		source_initialization_result = {"status": "NOT_READY", "reason": "actual_initialization_services_not_ready",
			"services": source_initialization_services.get_snapshot()}
		return false
	if not source_initialization_services.bind_main_source_legendary_cache(self):
		source_initialization_result = {"status":"NOT_READY","reason":"actual_Main_legendary_binding_rejected"}
		return false
	if not source_initialization.configure(player, world, source_state, source_resources,
			source_initialization_services.get_services()):
		source_initialization_result = {"status": "NOT_READY", "reason": "actual_initialization_dispatcher_not_ready",
			"dispatcher": source_initialization.get_snapshot()}
		return false
	for owner in [player, source_state, source_resources]:
		if not owner.bind_native_source_initialization(source_initialization):
			source_initialization_result = {"status": "NOT_READY", "reason": "actual_source_write_owner_binding_rejected"}
			return false
	source_initialization_result = source_initialization.initialize_new_run()
	return source_initialization_result.get("status") == "READY" \
		and source_initialization_result.get("completed") == true

func get_native_source_player_initialization_snapshot() -> Dictionary:
	return {"result": source_initialization_result.duplicate(true),
		"dispatcher": source_initialization.get_snapshot() if is_instance_valid(source_initialization) else {},
		"services": source_initialization_services.get_snapshot() if is_instance_valid(source_initialization_services) else {},
		"main_full_ready": false, "automatic_regeneration_bound": false}

func get_native_source_starter_items() -> Dictionary:
	if not is_instance_valid(source_state) or not source_state.is_native_new_run_state_ready():
		return {"status": "NOT_READY", "reason": "actual_source_state_not_ready", "equipped": [], "bag": []}
	return source_starter_items

func _stop_source_player_startup(reason: String) -> void:
	push_error("Native source player startup rejected: " + reason)
	# Only this startup's newly constructed actors are removed. A late sprite
	# failure can occur after Tree entry. Keep the accepted source prefix in
	# diagnostics; do not reset existing actors, registry or saves.
	source_providers = null
	if is_instance_valid(source_state):
		source_state.free()
		source_state = null
	if is_instance_valid(source_resources):
		source_resources.free()
		source_resources = null
	if is_instance_valid(player):
		player.free()
		player = null

func _capture_native_source_frame_input() -> void:
	if not _native_main_service_live():
		return
	_native_source_frame_timestamp_ms = float(Time.get_ticks_usec()) / 1000.0
	_native_source_render_serial += 1

func read_native_source_frame_input(caller: Node) -> Dictionary:
	if not _native_main_service_live() or not is_instance_valid(caller) or not is_instance_valid(world) or world.is_queued_for_deletion() or world.get_parent()!=self or (caller!=self and caller!=world):
		return {"ready":false,"reason":"actual_platform_frame_input_owner_mismatch","source_clock_ready":false}
	if _native_source_render_serial<=0 or _native_source_frame_timestamp_ms==null:
		return {"ready":false,"reason":"actual_main_render_input_not_captured","source_clock_ready":false}
	return {"ready":true,"scope":"LAST_NATIVE_PLATFORM_RENDER_INPUT_ONLY",
		"timestamp_ms":_native_source_frame_timestamp_ms,"render_serial":_native_source_render_serial,
		"clock_domain":"godot_engine_monotonic_milliseconds","source_clock_ready":false,
		"source_update_returned":false}

func is_native_source_clock_input_phase(caller: RefCounted, serial: int) -> bool:
	return _native_main_service_live() and _native_source_clock_input_open and caller == source_initialization_services and serial == _native_source_render_serial

func read_native_source_frame_monotonic_now(caller: RefCounted, serial: int) -> Variant:
	if not is_native_source_clock_input_phase(caller, serial):
		return null
	return float(Time.get_ticks_usec()) / 1000.0

func _advance_native_source_clock_input() -> void:
	if not _native_main_service_live() or not is_instance_valid(source_initialization_services) or source_initialization_services.get_script()!=SourceInitializationServicesScript or not is_instance_valid(world) or not world.has_method("read_native_source_frame_input"):
		return
	var input: Dictionary = world.read_native_source_frame_input()
	_native_source_clock_input_open = true
	source_initialization_services.capture_native_source_render_input(self, input)
	_native_source_clock_input_open = false

func read_native_source_player_projectile_context(caller: Node) -> Dictionary:
	if not _native_main_service_live() or caller!=world or not is_instance_valid(source_initialization_services) or source_initialization_services.get_script()!=SourceInitializationServicesScript:
		return {"ready":false,"reason":"actual_source_clock_context_owner_unbound"}
	return source_initialization_services.read_current_source_projectile_context(caller)

func get_native_source_clock_input_snapshot() -> Dictionary:
	if not _native_main_service_live() or not is_instance_valid(source_initialization_services) or source_initialization_services.get_script()!=SourceInitializationServicesScript:
		return {"ready":false,"reason":"actual_source_clock_context_owner_unbound","source_clock_ready":false}
	return source_initialization_services.read_source_clock_input_snapshot(self)

func _process(_delta: float) -> void:
	_capture_native_source_frame_input()
	_advance_native_source_clock_input()
	_advance_native_attack_audio()
	if is_instance_valid(_q_burst_draw) and not _q_burst_draw.is_queued_for_deletion() and is_instance_valid(_q_sprite):
		var status: Dictionary = _q_burst_draw.update()
		var ready: bool = is_instance_valid(native_q_control) and native_q_control.is_native_q_control_ready()
		var active: bool = ready and (player.state=="sBlock" or status.get("has_ring",false))
		_q_sprite.visible=active
		_q_view.render_target_update_mode=SubViewport.UPDATE_ALWAYS if active else SubViewport.UPDATE_DISABLED
		_q_sprite.global_position=player.global_position
		_q_canvas.position=Vector2(576,576)-player.global_position
		_q_canvas.queue_redraw()

func _physics_process(_delta: float) -> void:
	if not get_tree().paused and is_instance_valid(player) and is_instance_valid(camera):
		player.z_index = clampi(int(player.position.y / 4.0), -4096, 4095)
		camera.position = player.position

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("pause"):
		_toggle_pause()
		get_viewport().set_input_as_handled()


const QParryTargetScript = preload("res://port_modules/parry_homing_target/producer.gd")
const QBlackCarrierScript = preload("res://port_modules/combat_qe/black_carrier_consumer.gd")
const QBlackProjectileScript = preload("res://port_modules/black_bean_projectile/producer.gd")
const QDarkProjectileScript = preload("res://scripts/enemy_projectile.gd")
var _q_homing_target: RefCounted
var _q_homing_frame := -1.0
var _q_reflection_count := 0
var _q_last_reflection: Dictionary = {}

func read_native_q_parry_source() -> Dictionary:
	if read_native_q_control_resources().get("ready")!=true:return {"ready":false,"reason":"current_q_source_not_ready"}
	var b: Dictionary = source_providers.get_provider_bundle()
	var p: Dictionary = source_state.read_current_p()
	var passives: Variant = source_state.read_current_passives()
	var options: Variant = source_initialization_services.read_current_options() if is_instance_valid(source_initialization_services) else null
	if not _native_source_lesson_holder_live() or _read_native_source_lesson_guard()==null:return {"ready":false,"reason":"current_parry_lesson_authority_not_ready"}
	if not passives is Dictionary or not options is Dictionary:return {"ready":false,"reason":"current_parry_passives_or_OPT_not_ready"}
	var sbpw: bool = player.state=="sBlock" and float(p.get("_sbParryT",0))>0.0
	var sub: Dictionary = b.formula.read_combat_qe_subset(sbpw)
	for key in ["parry_scale","parry_dmg_mul","parry_bonus","leg_shield_parry","ki_floor"]:
		if not sub.provided.has(key) or not is_finite(float(sub.provided[key])):return {"ready":false,"reason":"current_parry_stat_not_ready:"+key}
	var regen_lv: float = b.affix.js_to_number(passives.get("pRegen") if b.affix.js_truthy(passives.get("pRegen")) else 0,true)
	var dot_lv: float = b.affix.js_to_number(passives.get("pDot") if b.affix.js_truthy(passives.get("pDot")) else 0,true)
	if not is_finite(regen_lv) or not is_finite(dot_lv):return {"ready":false,"reason":"current_parry_passive_nonfinite"}
	return {"ready":true,"stats":sub.provided,"actual_sbPW":sbpw,"regen_lv":regen_lv,"dot_pool":1.0+dot_lv*0.05,"options":options,"p":p}

func _read_native_q_parry_lesson() -> Variant:
	return source_lesson.get_current_lesson_reference() if _native_source_lesson_holder_live() else null

func _read_native_q_dot_pool() -> Variant:
	var source: Dictionary = read_native_q_parry_source()
	return source.dot_pool if source.get("ready")==true else null

func get_native_q_reflection_snapshot() -> Dictionary:
	return {"dark_carrier_bound":is_instance_valid(_q_homing_target),"count":_q_reflection_count,"last":_q_last_reflection.duplicate(true),"full_doparry":false,"remaining":["harp_rage_mats_rewards","parry_affix_explosion","source_audio_hitstop_impact","poison_target_adapter"],"black_natural_caller_bound":false}

func reflect_native_q_source_projectile(projectile: Node, distance: float) -> Dictionary:
	if not is_instance_valid(projectile) or projectile.get_parent()!=world or projectile.get("world")!=world or not is_finite(distance) or distance<0.0 or player.hp<=0.0 or not is_instance_valid(native_q_control) or not native_q_control.is_native_q_control_ready():
		return {"reflected":false,"reason":"actual_q_contact_owner_not_ready"}
	var current: Dictionary = read_native_q_parry_source()
	if current.get("ready")!=true:return {"reflected":false,"reason":current.get("reason")}
	var p: Dictionary = current.p
	var window: float = float(p.get("_sbParryT",0))
	if window<=0.0 or player.state in ["sBash","whirlwind","beam","elecRepent"]:return {"reflected":false,"reason":"source_q_window_inactive"}
	var raw: Dictionary
	var is_black: bool = projectile.get_script()==QBlackProjectileScript
	if projectile.get_script()==QDarkProjectileScript:
		raw=projectile.read_native_q_carrier()
		if player.iframes>0.0:return {"reflected":false,"reason":"source_gb_iframe_gate"}
	elif is_black:
		var shot: Object = projectile.get_shot()
		if not is_instance_valid(shot):return {"reflected":false,"reason":"actual_black_shot_not_ready"}
		raw=shot.raw
	else:return {"reflected":false,"reason":"source_projectile_kind_not_adopted"}
	if raw.get("friendly")!=false or (is_black and raw.get("blackBean")!=true) or (not is_black and raw.get("gbBean")!=true):
		return {"reflected":false,"reason":"source_hostile_flags_not_ready"}
	var radius: float = 100.0 if player.state=="sBlock" else float(p.get("_sbReleaseR",0))
	if radius<=0.0:radius=(player.radius+float(raw.sz)*3.0)*3.0+8.0
	if player.state=="sBlock" and distance<=20.0:return {"reflected":false,"reason":"source_q_core_absorb_not_adopted"}
	if distance>=radius:return {"reflected":false,"reason":"outside_source_q_radius","radius":radius}
	var bank: float = 0.0
	if is_black:
		var bank_raw: Variant = p.get("parryBank")
		var affix: Object = source_providers.get_provider_bundle().affix
		bank=affix.js_to_number(bank_raw if affix.js_truthy(bank_raw) else 0,true)
		if not is_finite(bank):return {"reflected":false,"reason":"actual_black_bank_nonfinite"}
	var st: Dictionary = current.stats
	var base: int = maxi(current_source_parry_int(float(raw.dmg)*(1.0+minf(1.0,float(st.parry_scale)/300.0))*0.5*float(st.parry_dmg_mul)*(1.0+float(st.parry_bonus))*float(st.leg_shield_parry)),int(st.ki_floor))
	if not is_instance_valid(_q_homing_target):
		_q_homing_target=QParryTargetScript.new()
		if not _q_homing_target.configure({"player":player,"query_enemies":Callable(world,"query_native_enemies"),"frame_provider":Callable(world,"get_native_frame"),"parry_lesson":Callable(self,"_read_native_q_parry_lesson")}):
			_q_homing_target=null
			return {"reflected":false,"reason":"actual_parry_homing_provider_not_ready"}
	var frame: float = world.get_native_frame()
	if frame!=_q_homing_frame:
		var reset: Dictionary = _q_homing_target.reset_for_projectile_pass()
		if reset.get("ok")!=true:return {"reflected":false,"reason":reset.get("error")}
		_q_homing_frame=frame
	var target: Dictionary = _q_homing_target.query()
	if target.get("ok")!=true:return {"reflected":false,"reason":target.get("error")}
	var reward_multiplier: float = 1.5 if is_black else 1.0
	var reward: int = current_source_parry_int(50.0*(1.0+float(st.parry_bonus))*(1.0+current.regen_lv*0.2)*reward_multiplier)
	if reward<0:return {"reflected":false,"reason":"source_parry_reward_negative"}
	var result: Dictionary
	if is_black:
		var ctx: Dictionary = QBlackCarrierScript.build_ctx(player.global_position,native_q_control,base,target.target)
		result=QBlackCarrierScript.consume(projectile,ctx)
		if result.get("ready")!=true:return {"reflected":false,"reason":result.get("current_block")}
		if not commit_native_q_control_state({"parryBank":bank+result.bank_add}):return {"reflected":false,"reason":"actual_black_bank_commit_failed"}
	else:
		result=projectile.apply_native_q_reflection(current_source_parry_int(float(base)*2.0),target.target,{"source_opt":current.options,"p_dot_pool":Callable(self,"_read_native_q_dot_pool"),"camera_position":func():return camera.global_position,"query_enemies":Callable(world,"query_native_enemies")})
		if result.get("reflected")!=true:return result
	var resources: Dictionary = source_resources.commit_native_q_parry_reward(self,float(reward))
	if resources.get("accepted")!=true:return {"reflected":false,"reason":"actual_parry_reward_commit_failed"}
	source_state.read_current_p()
	_q_reflection_count+=1
	_q_last_reflection={"kind":"blackBean" if is_black else "gbBean","carrier_id":projectile.get_instance_id(),"source_dmg":result.get("incoming_dmg_before"),"base":base,"projectile_dmg":result.projectile_dmg,"reward":reward,"resources":resources,"frame":frame,"distance":distance,"radius":radius,"bank_add":result.get("bank_add",0),"same_carrier":true,"same_tick_blue_steps":0,"full_doparry":false}
	player.telemetry_event.emit("q_projectile_reflected",_q_last_reflection.duplicate(true))
	return {"reflected":true,"reaction":2,"damage_applied":0,"source":_q_last_reflection.duplicate(true)}

func current_source_parry_int(value: float) -> int:
	return source_providers.get_provider_bundle().formula.js_to_int32(value)


func read_native_e_control_source() -> Dictionary:
	if not is_instance_valid(source_providers) or not source_providers.is_native_source_providers_ready() or not is_instance_valid(source_state) or source_state.is_queued_for_deletion() or not is_instance_valid(source_resources) or not source_resources.is_native_source_resources_ready():
		return {"ready":false,"reason":"actual_e_source_owners_not_ready"}
	var profile: Dictionary = player.get_native_character_profile_snapshot()
	if profile.get("ready")!=true:return {"ready":false,"reason":"explicit_e_character_selection_required"}
	var b: Dictionary = source_providers.get_provider_bundle()
	var p: Variant = source_state.read_current_p()
	var inv: Variant = source_state.read_current_inventory()
	var passives: Variant = source_state.read_current_passives()
	if not p is Dictionary or not p.get("skills") is Dictionary or not inv is Dictionary or not inv.get("equipped") is Dictionary or not passives is Dictionary:
		return {"ready":false,"reason":"current_e_domains_not_ready"}
	var reference: Dictionary = b.reference.melee_ref()
	var atk: Dictionary = b.formula.p_atk_mul()
	var shield: Dictionary = b.affix.read_shield()
	if reference.get("status")!="READY" or atk.get("status")!="READY" or shield.get("status")!="READY":return {"ready":false,"reason":"current_e_stats_not_ready"}
	var read_or = func(value,default_value):return b.affix.js_to_number(value if b.affix.js_truthy(value) else default_value,true)
	var lv: float = read_or.call(p.skills.get("maliceSwipe"),0)
	var cost_lv: float = read_or.call(p.skills.get("maliceSwipe"),1)
	var throw_lv: float = read_or.call(p.skills.get("shieldThrow"),1)
	var wing_level: float = maxf(1.0,minf(cost_lv,throw_lv))
	var cost: float = 5.0+(cost_lv-1.0)*2.0
	var bonus_range: float = read_or.call(shield.shield.get("bonusRange"),0)
	var boots: Variant = inv.equipped.get("boots")
	var boots_spd: float = read_or.call(boots.get("spd") if boots is Dictionary else null,0)
	var parry_lv: float = b.affix.js_to_number(passives.get("pParry"),passives.has("pParry"))
	var wp: Variant = inv.equipped.get("weapon")
	var element: float = read_or.call(wp.get("el") if wp is Dictionary else null,0)
	var fields: Dictionary = {}
	for key in ["st2","_sdHold","_kgChg","_kgTier","_sBashChgMul","_atkBon","_stWingT","_stCd"]:
		fields[key]=read_or.call(p.get(key),1 if key=="_sBashChgMul" else 0)
	var values: Array = [lv,cost,cost_lv,throw_lv,bonus_range,boots_spd,element,p.get("speed"),reference.value,atk.value]
	values.append_array(fields.values())
	for value in values:
		if not (value is int or value is float) or not is_finite(float(value)):return {"ready":false,"reason":"current_e_nonfinite_source"}
	var recovery: int = b.formula.js_to_int32(_native_source_tempo_ratio(28.0,1.0+parry_lv*0.1))
	if cost<=0.0 or element<0 or element>6 or floor(element)!=element:return {"ready":false,"reason":"current_e_scalar_domain_not_supported"}
	return {"ready":true,"scope":"E_CONTROL_PARTIAL","p":p,"fields":fields,"shield_cost":cost,"level":lv,"reference":float(reference.value),"p_atk_mul":float(atk.value),"range_mul":1.0+(wing_level-1.0)*0.05,"bonus_range":bonus_range,"attack_move_speed":(float(p.speed)+boots_spd)*60.0*0.8,"recovery":recovery,"element":int(element),"character_index":profile.index,"held":player.get_native_input_snapshot().held.get("shield_bash",false),"q_held":player.get_native_input_snapshot().held.get("parry",false),"auto_wave_adopted":true,"projectile_parry_adopted":false}

func spend_native_e_stamina(amount: float) -> Dictionary:
	if read_native_e_control_source().get("ready")!=true:return {"accepted":false,"reason":"current_e_source_not_ready"}
	var result: Dictionary = source_resources.commit_native_e_stamina_cost(self,amount)
	var p: Variant = source_state.read_current_p()
	if result.get("accepted")==true and (not p is Dictionary or p.st!=result.after):return {"accepted":false,"reason":"current_e_stamina_readback_mismatch"}
	return result

func apply_native_e_slam() -> Dictionary:
	var current: Dictionary = read_native_e_control_source()
	if current.get("ready")!=true or player.state!="sBash":return {"accepted":false,"reason":"current_e_strike_not_ready"}
	var fields: Dictionary = current.fields
	var mult: float = clampf(float(fields._sBashChgMul),1.0,3.0)
	var radius: float = floor((70.0+current.bonus_range*4.0)*current.range_mul*mult)
	var raw: int = current_source_parry_int(current.reference*2.0*(1.0+(current.level-1.0)*0.21 if current.level>=1.0 else 1.0)*mult)+int(fields._atkBon)
	if not commit_native_q_control_state({"_atkBon":0.0}):return {"accepted":false,"reason":"current_e_bonus_commit_failed"}
	var amount: int = current_source_parry_int(float(raw)*current.p_atk_mul)
	var hits: Array = []
	var unsupported: int = 0
	for enemy in world.query_native_enemies(player.global_position.x,player.global_position.y,radius+20.0):
		if not is_instance_valid(enemy) or not enemy is Node2D or enemy.get("alive")!=true:continue
		if not enemy.has_method("receive_native_e_slam"):unsupported+=1;continue
		var distance: float = enemy.global_position.distance_to(player.global_position)
		if distance>radius+float(enemy.radius):continue
		var e_data: Variant = enemy.get("data")
		var source: Variant = e_data.get("native_final") if e_data is Dictionary else null
		if source is Dictionary and source.get("ib")==true:unsupported+=1;continue
		var el_map: Dictionary = {"physical":0,"fire":1,"ice":2,"dark":3,"lightning":4,"holy":5,"poison":6}
		if not el_map.has(enemy.element):unsupported+=1;continue
		var elemental: float = preload("res://port_modules/item_armor_element/producer.gd").element_multiplier(current.element,el_map[enemy.element])
		var final_damage: int = current_source_parry_int(float(amount)*elemental)
		var stun: float = 60.0
		if enemy.poise<=0.0:
			var p: Dictionary = current.p
			var affix: Object = source_providers.get_provider_bundle().affix
			var lv_raw: Variant = p.get("_gslLv") if affix.js_truthy(p.get("_gslLv")) else p.skills.get("giantSlam")
			var level: float = affix.js_to_number(lv_raw if affix.js_truthy(lv_raw) else 1,true)
			stun=maxf(60.0,float(current_source_parry_int(minf(300.0,150.0+(level-1.0)*15.0)*elemental)))
		var direction: Vector2 = (enemy.global_position-player.global_position).normalized()
		var result: Dictionary = enemy.receive_native_e_slam(final_damage,direction,stun)
		hits.append({"enemy_id":enemy.get_instance_id(),"distance":distance,"radius":enemy.radius,"damage":final_damage,"result":result})
	var result: Dictionary = {"accepted":true,"radius":radius,"multiplier":mult,"base_damage":raw,"damage":amount,"hits":hits,"unsupported_targets":unsupported,"arc_filter":false,"source":"R34047-34059 -> R47029 _gSlamHit","full_e_parity":false}
	player.telemetry_event.emit("e_slam_resolved",result)
	return result

func read_native_q_control_resources() -> Dictionary:
	var result := {"ready":false,"reason":"current_q_source_owners_not_ready"}
	if not is_instance_valid(source_providers) or not source_providers.is_native_source_providers_ready() or not is_instance_valid(source_resources) or not source_resources.is_native_source_resources_ready() or not is_instance_valid(source_state) or source_state.is_queued_for_deletion():return result
	var p: Variant = source_state.read_current_p()
	if not p is Dictionary or not p.get("skills") is Dictionary:return result
	var bundle: Dictionary = source_providers.get_provider_bundle()
	if bundle.affix.js_truthy(p.skills.get("detonate")):
		result.reason="detonate_hold_damage_owner_not_adopted"
		return result
	if p.get("activeQSk")=="peaceShield" and bundle.affix.js_to_number(p.skills.get("peaceShield"),p.skills.has("peaceShield"))>=1.0:
		result.reason="peace_shield_full_runtime_not_adopted"
		return result
	var block: Dictionary = bundle.formula.block_base()
	var cd: Dictionary = bundle.affix.eq_affix("shieldCdRed")
	if block.get("status")!="READY" or cd.get("status")!="READY":
		result.reason="current_q_block_or_cooldown_stats_not_ready"
		return result
	var fields: Dictionary = {}
	for pair in [["hold_ticks","_sbHoldT"],["window","_sbParryT"],["cooldown","_sbCd"],["release_saved","_sbReleaseR"],["parry_t","parryT"]]:
		var raw: Variant = p.get(pair[1])
		fields[pair[0]]=bundle.affix.js_to_number(raw if bundle.affix.js_truthy(raw) else 0,true)
	for value in [p.get("mp"),p.get("mmp"),block.value,cd.value,fields.hold_ticks,fields.window,fields.cooldown,fields.release_saved,fields.parry_t]:
		if not (value is int or value is float) or not is_finite(float(value)):
			result.reason="current_q_nonfinite_source_value"
			return result
	if float(p.mp)<0.0 or float(p.mmp)<0.0 or float(p.mp)>float(p.mmp):return result
	fields.merge({"ready":true,"reason":"","mana":float(p.mp),"max_mana":float(p.mmp),"block_base":float(block.value),"shield_cd_red":float(cd.value),"detonate_lv":0,"release_r":100.0+400.0*clampf(float(fields.hold_ticks)/240.0,0.0,1.0),"parry_held":player.get_native_input_snapshot().held.get("parry",false)})
	return fields

func spend_native_qe_mana(amount: float) -> bool:
	if read_native_q_control_resources().get("ready")!=true:return false
	var result: Dictionary = source_resources.commit_native_q_mana_cost(self,amount)
	var current: Variant = source_state.read_current_p()
	return result.get("accepted")==true and current is Dictionary and current.mp==result.after

func commit_native_q_control_state(fields: Dictionary) -> bool:
	return is_instance_valid(source_state) and not source_state.is_queued_for_deletion() and source_state.commit_native_q_fields(self,fields)

func _install_native_q_control() -> void:
	if read_native_q_control_resources().get("ready")!=true:return
	_q_view=SubViewport.new()
	_q_view.name="QControlCanvas"
	_q_view.size=Vector2i(1152,1152)
	_q_view.transparent_bg=true
	_q_view.disable_3d=true
	_q_view.world_2d=World2D.new()
	_q_view.render_target_update_mode=SubViewport.UPDATE_DISABLED
	world.add_child(_q_view)
	_q_canvas=Node2D.new()
	_q_canvas.position=Vector2(576,576)-player.global_position
	_q_view.add_child(_q_canvas)
	_q_canvas.draw.connect(_draw_native_q_range)
	_q_burst_draw=QBurstDrawScript.new()
	_q_canvas.add_child(_q_burst_draw)
	_q_burst_draw.bind(player,{"now_ms":func():return Time.get_ticks_msec(),"rand":func():return randf()})
	_q_sprite=Sprite2D.new()
	_q_sprite.name="QControlGroundVisual"
	_q_sprite.texture=_q_view.get_texture()
	_q_sprite.z_as_relative=false
	_q_sprite.z_index=-2800
	_q_sprite.visible=false
	world.add_child(_q_sprite)
	native_q_control=QAdapterScript.new()
	if not native_q_control.configure_q_control(player,world,self,_q_burst_draw) or not world.bind_native_player_q_control(native_q_control):
		native_q_control.withdraw_q_control()
		return
	hud.show_native_input_status("Q 다크볼 · E 탭/차징 핵심 연결 · 파동/투사체패링/Space 미완")

func _draw_native_q_range() -> void:
	if not is_instance_valid(native_q_control) or player.state!="sBlock":return
	var current: Dictionary = native_q_control.get_q_control_snapshot()
	if not current.ready:return
	var radius: float = current.radius
	var offset: float = fmod(Time.get_ticks_msec()*0.12,23.0)
	var color := Color("ffffff" if current.window>0.0 else "69b8ff")
	color.a=0.68
	for dash in range(-1,int(ceil(TAU*radius/23.0))+1):
		var begin: float = (dash*23.0-offset)/radius
		_q_canvas.draw_arc(player.global_position,radius,begin,begin+14.0/radius,5,color,2.5,true)
	_q_canvas.draw_arc(player.global_position,20.0,0.0,TAU,48,Color(0.749,0.91,1.0,0.3),1.5,true)

func withdraw_native_q_visual() -> void:
	if is_instance_valid(_q_sprite):_q_sprite.visible=false
	if is_instance_valid(_q_view):_q_view.render_target_update_mode=SubViewport.UPDATE_DISABLED

func is_native_q_control_visual(source: Node2D) -> bool:
	return is_instance_valid(_q_sprite) and source==_q_sprite and source.get_parent()==world and is_instance_valid(_q_view) and source.texture==_q_view.get_texture()

func read_native_attack_parameters() -> Dictionary:
	var result := {"ready":false,"reason":"current_attack_providers_not_ready"}
	if not is_instance_valid(source_providers) or not source_providers.is_native_source_providers_ready() or source_providers.get_native_source_player()!=player or source_providers.get_native_source_world()!=world:
		return result
	var bundle: Dictionary = source_providers.get_provider_bundle()
	var current: Variant = bundle.current_p.call()
	var inventory: Variant = bundle.current_inventory.call()
	if not current is Dictionary or not inventory is Dictionary or not inventory.get("equipped") is Dictionary:
		result.reason="current_attack_p_or_inventory_not_ready"
		return result
	var reference: Dictionary = bundle.reference.melee_ref()
	var multiplier: Dictionary = bundle.formula.p_atk_mul()
	if reference.get("status")!="READY" or multiplier.get("status")!="READY":
		result.reason="current_attack_reference_or_multiplier_not_ready"
		result.reference=reference
		result.multiplier=multiplier
		return result
	var weapon: Variant = inventory.equipped.get("weapon")
	if not bundle.affix.js_truthy(weapon): weapon={}
	if not weapon is Dictionary or not current.has("baseAtk"):
		result.reason="current_basic_attack_weapon_or_base_not_ready"
		return result
	# R wSwing uses raw atk || 0, unlike meleeRef's +atk || 0.
	# String concatenation is outside this native scalar damage contract.
	var raw_atk: Variant = weapon.get("atk") if bundle.affix.js_truthy(weapon.get("atk")) else 0
	var base: Variant = current.baseAtk
	if not (raw_atk is int or raw_atk is float or raw_atk is bool) or not (base==null or base is int or base is float or base is bool):
		result.reason="current_basic_attack_nonnumeric_addition_domain"
		return result
	var enhancement: Variant = weapon.get("enh") if bundle.affix.js_truthy(weapon.get("enh")) else 0
	var enhanced: float = bundle.affix.js_to_number(enhancement,true)*0.25
	var base_number: float = bundle.affix.js_to_number(base,true)
	var attack_number: float = bundle.affix.js_to_number(raw_atk,true)
	var values := [float(reference.value),float(multiplier.value),enhanced,base_number,attack_number]
	for value in values:
		if not is_finite(value):
			result.reason="current_attack_source_non_finite"
			return result
	var range_raw: Variant = weapon.get("wRange") if bundle.affix.js_truthy(weapon.get("wRange")) else 50
	var bonus_raw: Variant = weapon.get("bonusRange") if bundle.affix.js_truthy(weapon.get("bonusRange")) else 0
	var arc_raw: Variant = weapon.get("wArcW") if bundle.affix.js_truthy(weapon.get("wArcW")) else 0.95
	if not (range_raw is int or range_raw is float or range_raw is bool):
		result.reason="current_basic_attack_nonnumeric_range_addition"
		return result
	var hit_range: float = bundle.affix.js_to_number(range_raw,true)+bundle.affix.js_to_number(bonus_raw,true)*4.0
	var hit_arc: float = bundle.affix.js_to_number(arc_raw,true)
	if not is_finite(hit_range) or not is_finite(hit_arc):
		result.reason="current_attack_range_non_finite"
		return result
	var tempo: Dictionary=read_native_attack_tempo()
	if tempo.get("ready")!=true:return tempo
	return {"ready":true,"reason":"","authority":"current_source_providers","tempo":tempo,
		"melee_ref":float(reference.value),"stat_str":1.0,"p_atk_mul":float(multiplier.value),"p_melee_mul":1.0,
		"basic_base_damage":SourceProvidersScript.FORMULA.js_to_int32(((base_number+attack_number)+enhanced+15.0)*6.0),
		"basic_range":hit_range,"basic_arc":hit_arc,"reference":reference,"multiplier":multiplier}

func _spawn_crescent(step: int, charge_frames: float, direction: Vector2) -> void:
	var selection: Dictionary = player.get_native_attack_selection_snapshot()
	if selection.get("ready") != true or selection.get("emit_ki_slash") != true or selection.get("level") != player.ki_slash_level:
		_record_event("crescent_dispatch_rejected",selection)
		return
	var parameters: Dictionary = read_native_attack_parameters()
	if parameters.get("ready")!=true:
		_record_event("crescent_dispatch_rejected",parameters)
		return
	if get_tree().get_nodes_in_group("crescents").size() >= int(combat.get("kiSlash", {}).get("pool_max", 16)):
		_record_event("crescent_pool_full", {"native_pool_limit": 16})
		return
	var crescent = CrescentScript.new()
	crescent.name = "KiSlash"
	crescent.process_mode = Node.PROCESS_MODE_PAUSABLE
	add_child(crescent)
	if crescent.has_signal("telemetry_event"):
		crescent.telemetry_event.connect(_record_event)
	if not crescent.configure(player, step, charge_frames, direction, combat):
		crescent.queue_free()

func _build_native_character_selection_ui() -> void:
	_character_layer=CanvasLayer.new()
	_character_layer.name="ExplicitCharacterSelection"
	_character_layer.layer=11
	_character_layer.process_mode=Node.PROCESS_MODE_ALWAYS
	add_child(_character_layer)
	_character_panel=PanelContainer.new()
	_character_panel.position=Vector2(24,166)
	_character_panel.custom_minimum_size=Vector2(440,120)
	var theme := Theme.new()
	theme.default_font=load("res://assets/fonts/NotoSansKR.ttf")
	theme.default_font_size=18
	_character_panel.theme=theme
	_character_layer.add_child(_character_panel)
	var box := VBoxContainer.new()
	_character_panel.add_child(box)
	var title := Label.new()
	title.text="이 시험에서 사용할 캐릭터"
	box.add_child(title)
	_character_picker=OptionButton.new()
	_character_picker.name="CharacterPicker"
	_character_picker.add_item("캐릭터를 선택하세요",1000)
	_character_picker.set_item_disabled(0,true)
	for choice in player.get_native_character_choices():
		_character_picker.add_item(choice.name,choice.index)
		_character_picker.set_item_disabled(_character_picker.item_count-1,not choice.available)
		if not choice.available: _character_picker.set_item_tooltip(_character_picker.item_count-1,"원본 시트가 준비되지 않았습니다")
	_character_picker.select(0)
	box.add_child(_character_picker)
	_character_status=Label.new()
	_character_status.text="일시정지 중 선택할 수 있습니다"
	box.add_child(_character_status)
	_character_picker.item_selected.connect(_on_native_character_selected)
	_character_panel.visible=get_tree().paused
	_character_picker.disabled=not get_tree().paused

func read_native_character_selection() -> Dictionary:
	var result := {"ready":false,"index":null,"reason":"explicit_native_character_not_selected",
		"authority":"native_explicit_ui_selection","source_storage_restored":false}
	if is_queued_for_deletion() or not is_inside_tree() or not is_instance_valid(player) or player.get_parent()!=self or not is_instance_valid(_character_layer) or _character_layer.is_queued_for_deletion() or _character_layer.get_parent()!=self or not is_instance_valid(_character_picker) or _character_picker.is_queued_for_deletion() or not _character_picker.is_inside_tree():
		result.reason="actual_native_character_ui_not_live"
		return result
	var selected: int = _character_picker.selected
	if selected<1 or selected>=_character_picker.item_count: return result
	var index: int = _character_picker.get_item_id(selected)
	if index!=0 and index!=1:
		result.reason="unsupported_native_character_choice"
		return result
	if _character_picker.is_item_disabled(selected):
		result.reason="native_character_resources_unavailable"
		return result
	result.ready=true
	result.index=index
	result.reason=""
	return result

func _on_native_character_selected(item_index: int) -> void:
	if not get_tree().paused or item_index!=_character_picker.selected:
		_character_status.text="일시정지 중에 선택하세요"
		return
	var applied: Dictionary = player.apply_native_character_selection(Callable(self,"read_native_character_selection"))
	if applied.get("ready")!=true:
		_character_status.text="선택한 원본 시트를 읽지 못했습니다"
		return
	_character_status.text=str(applied.name)+" · 대기 / 걷기 / 공격 준비"
	if _native_perspective_view_owned(): native_perspective_view._sync_sprites()
	_record_event("native_character_selected",{"selection":read_native_character_selection(),"profile":applied})

func _toggle_pause() -> void:
	if get_tree().paused and get_meta("native_review_requires_character",false) and player.get_native_character_profile_snapshot().get("ready")!=true:
		hud.set_status("캐릭터를 먼저 선택한 뒤 플레이를 재개하세요")
		return
	if not get_tree().paused and is_instance_valid(player):
		player.clear_native_input_states()
	get_tree().paused = not get_tree().paused
	hud.set_pause_state(get_tree().paused)
	if is_instance_valid(_character_panel):
		_character_panel.visible=get_tree().paused
		_character_picker.disabled=not get_tree().paused
	if capture.has_method("set_pause_state"):
		capture.set_pause_state(get_tree().paused)
	_record_event("pause_changed", {"paused": get_tree().paused, "state": _play_state()})
	if get_tree().paused and capture.has_method("save_report"):
		capture.save_report()

func _restart() -> void:
	if capture.has_method("save_report"):
		capture.save_report()
	get_tree().paused = false
	get_tree().reload_current_scene()

func _record_event(kind: String, data: Dictionary) -> void:
	if kind=="native_input_unavailable" and is_instance_valid(hud):
		hud.show_native_input_status("Q 보호막: 실제 실행 소유자 연결 대기" if data.get("action")=="parry" else ("E 처내기: 동작 연결 대기" if data.get("action")=="shield_bash" else "Space: 원본 분노 스킬 슬롯 연결 대기"))
	if is_instance_valid(capture):
		capture.record_event(kind, data)

func _play_state() -> Dictionary:
	var enemies: Array = []
	if is_instance_valid(world):
		for enemy in world.get_enemies():
			if is_instance_valid(enemy):
				enemies.append({"id": enemy.name, "hp": enemy.hp, "alive": enemy.alive, "position": enemy.position, "state": enemy.state})
	return {"player": player.get_snapshot() if is_instance_valid(player) else {}, "enemies": enemies, "crescents": get_tree().get_nodes_in_group("crescents").size(), "enemy_projectiles": get_tree().get_nodes_in_group("enemy_projectiles").size(), "encounter_factory": _encounter_summary()}

func _encounter_summary() -> Dictionary:
	if not is_instance_valid(world) or not world.has_method("get_encounter_report"):
		return {}
	var report: Dictionary = world.get_encounter_report()
	var records: Array = []
	for record in report.get("records", []):
		records.append({"order": record.get("order"), "id": record.get("id"), "etype": record.get("etype"), "status": record.get("status"), "reason": record.get("reason")})
	return {"installed": report.get("installed", false), "source_count": report.get("source_count", 0), "supported_count": report.get("supported_count", 0), "unsupported_count": report.get("unsupported_count", 0), "records": records}

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		if is_instance_valid(capture) and capture.has_method("save_report"):
			capture.save_report()

func _register_inputs() -> void:
	# Explicit native defaults from R BINDS, not restored browser BINDS/BINDS2.
	if InputMap.has_action("cancel_charge"): InputMap.erase_action("cancel_charge")
	var keys = {"move_left": KEY_A, "move_right": KEY_D, "move_up": KEY_W, "move_down": KEY_S, "parry": KEY_Q, "shield_bash": KEY_E, "rage_slot": KEY_SPACE, "pause": KEY_ESCAPE}
	for action in keys:
		if not InputMap.has_action(action): InputMap.add_action(action)
		InputMap.action_erase_events(action)
		var key := InputEventKey.new()
		key.physical_keycode = keys[action]
		InputMap.action_add_event(action, key)
	if not InputMap.has_action("weapon"): InputMap.add_action("weapon")
	InputMap.action_erase_events("weapon")
	var mouse := InputEventMouseButton.new()
	mouse.button_index = MOUSE_BUTTON_LEFT
	InputMap.action_add_event("weapon", mouse)
	if not InputMap.has_action("native_magic"):InputMap.add_action("native_magic")
	InputMap.action_erase_events("native_magic")
	var magic_mouse:=InputEventMouseButton.new()
	magic_mouse.button_index=MOUSE_BUTTON_RIGHT
	InputMap.action_add_event("native_magic",magic_mouse)

func read_native_input_bindings() -> Dictionary:
	var primary := {"up":"KeyW","down":"KeyS","left":"KeyA","right":"KeyD","weapon":"mouse0","parry":"KeyQ","shield":"KeyE","bow":"Space","settings":"Escape","beam":"mouse2"}
	var secondary: Dictionary = {}
	for action in primary: secondary[action]=null
	var qe_ready: bool = is_instance_valid(player) and player.get_native_combat_qe_snapshot().get("ready")==true
	var q_ready: bool = is_instance_valid(player) and player.get_native_q_control_snapshot().get("ready")==true
	var supported: Array = ["movement","weapon_pressed_held_released","pause"]
	if is_instance_valid(native_fireball_phase):supported.append("magic_held_deferred_owner_partial")
	var e_ready: bool = is_instance_valid(player) and player.get_native_e_control_snapshot().get("ready")==true
	if e_ready:supported.append_array(["e_draw_charge_sbash_recover_partial","e_default_fused_wave_dark_reflection_partial"])
	if q_ready:supported.append_array(["q_control_hold_release_partial","q_dark_projectile_reflection"])
	return {"ready":is_inside_tree() and not is_queued_for_deletion(),"authority":"native_explicit_defaults_from_R","source_saved_bindings_restored":false,"primary":primary,"secondary":secondary,"supported":supported,"q_owner_ready":qe_ready or q_ready,"q_route":"existing_adapter_request_release" if qe_ready else ("Q_CONTROL_PARTIAL" if q_ready else "NOT_READY"),"unsupported":["q_black_other_natural_carriers","q_core_absorb","q_full_doparry_rewards_fx_audio","q_detonate_peace_runtime","e_nonfused_other_carriers_pose_audio_full_fx","space_rage_slot","saved_bindings","secondary_remapping","full_qe_fsm"]}

# R46689/36853: default shieldFuse wave in the existing Player post-move phase.
# Full hurtE/doParry, nonfused throw, source sound/pose remain separate gaps.
var _e_wave_frame := -1.0
var _e_wave_births := 0
var _e_wave_hits := 0
var _e_wave_reflections := 0
var _e_wave_expired := 0
var _e_wave_last: Dictionary = {}

func read_native_e_wave_source() -> Dictionary:
	var control: Dictionary=read_native_e_control_source()
	if control.get("ready")!=true:return control
	var b: Dictionary=source_providers.get_provider_bundle()
	var p: Dictionary=control.p
	var g: Variant=source_state.read_current_g()
	if not g is Dictionary:return {"ready":false,"reason":"current_wave_G_not_ready"}
	if g.has("_stProjs") and not g._stProjs is Array:return {"ready":false,"reason":"current_wave_pool_shape_unsupported"}
	var fused: bool=b.affix.js_to_number(p.skills.get("maliceSwipe"),true)>=1.0 and b.affix.js_to_number(p.skills.get("shieldThrow"),true)>=1.0 and p.get("_fused") is Dictionary and b.affix.js_truthy(p._fused.get("shieldFuse"))
	if not fused:return {"ready":false,"reason":"nonfused_auto_throw_not_adopted"}
	var shield: Dictionary=b.affix.read_shield()
	var star: Dictionary=b.fusion.fuse_star("shieldThrow")
	var boost: Dictionary=b.affix.eq_affix("skillBoost")
	if shield.get("status")!="READY" or star.get("status")!="READY" or boost.get("status")!="READY":return {"ready":false,"reason":"current_wave_shield_fusion_affix_not_ready"}
	var lv: float=b.affix.js_to_number(p.skills.get("shieldThrow") if b.affix.js_truthy(p.skills.get("shieldThrow")) else 1,true)
	var ml: float=b.affix.js_to_number(p.skills.get("maliceSwipe") if b.affix.js_truthy(p.skills.get("maliceSwipe")) else 1,true)
	var wing: float=maxf(1.0,minf(ml,lv))
	var shield_atk: float=b.affix.js_to_number(shield.shield.get("atk") if b.affix.js_truthy(shield.shield.get("atk")) else 3,true)
	var fm: float=preload("res://port_modules/detonate_blast/producer.gd").fuse_mul(float(star.value),float(boost.value))
	var base: float=b.affix.js_to_number(p.get("baseAtk"),true)
	var multiplier: float=control.range_mul*clampf(float(control.fields._sBashChgMul),1.0,3.0)
	var damage: float=(shield_atk+base*0.3+10.0)*(1.0+(lv-1.0)*0.12)*10.0*(1.5+(wing-1.0)*0.12)*fm
	for v in [lv,wing,shield_atk,base,multiplier,damage,fm]:
		if not is_finite(v):return {"ready":false,"reason":"current_wave_nonfinite"}
	return {"ready":true,"p":p,"g":g,"level":lv,"cooldown":maxf(120.0,720.0-wing*15.0),"damage":current_source_parry_int(damage),"range_mul":multiplier,"fuse_mul":fm}

func _emit_native_e_wave_particle(at: Vector2, velocity: Vector2, color: Color, size: float, life: float) -> void:
	world.emit_native_source_particle({"position":at,"velocity":velocity,"color":color,"size":size,"life_ticks":life,"render_owner":"native_e_wave"})

func advance_native_e_wave(frame: float, requested: bool) -> void:
	if not _native_main_service_live() or get_tree().paused or frame<=_e_wave_frame or frame!=world.get_native_frame():return
	_e_wave_frame=frame
	var source: Dictionary=read_native_e_wave_source()
	if source.get("ready")!=true:
		_e_wave_last={"ready":false,"reason":source.get("reason")}
		return
	var p: Dictionary=source.p
	var g: Dictionary=source.g
	var ticks: float=world.get_native_projectile_fx_context().dt_sp
	var waves: Array=g.get("_stProjs",[])
	var gc: int=int(g.get("_gcT",0))+1
	if gc>20:gc=0
	if not source_state.commit_native_e_wave_state(self,waves,gc):return
	var extra: float=0.0
	if g.get("_fireZones") is Array:
		for zone in g._fireZones:
			if zone is Dictionary and zone.get("type")=="holyDome" and Vector2(float(zone.x),float(zone.y)).distance_to(player.global_position)<float(zone.r):
				extra=ticks
				break
	var fields: Dictionary={}
	if float(p.get("_stCd",0))>0.0:fields["_stCd"]=float(p._stCd)-ticks-extra
	if float(p.get("_stWingT",0))>0.0:fields["_stWingT"]=float(p._stWingT)-ticks
	if not fields.is_empty() and not commit_native_q_control_state(fields):return
	if requested and player.state=="sBash" and float(p.get("_stCd",0))<=0.0:
		var direction: Vector2=player.facing
		var pos: Vector2=player.global_position+direction*25.0
		var wave: Dictionary={"x":pos.x,"y":pos.y,"vx":direction.x*12.0,"vy":direction.y*12.0,"ang":direction.angle(),"dist":0.0,"maxDist":210.0*source.range_mul,"r":50.0*source.range_mul,"w":95.0*source.range_mul,"dmg":source.damage,"slv":source.level,"_hitSet":{},"wave":true,"_wvT":0.0}
		if not commit_native_q_control_state({"_stCd":source.cooldown,"_stWingT":40.0}):return
		waves.append(wave)
		if not source_resources.commit_native_e_wave_protection(self):return
		_e_wave_births+=1
		_e_wave_last={"ready":true,"birth_frame":frame,"origin":pos,"damage":source.damage,"cooldown":source.cooldown,"max_dist":wave.maxDist,"radius":wave.r,"width":wave.w,"fuse_mul":source.fuse_mul,"iframes":player.iframes,"extra_st_cost":0}
		player.telemetry_event.emit("e_wave_born",_e_wave_last.duplicate())
		for k in range(12):
			var angle: float=direction.angle()+(float(k)/12.0-0.5)*1.2
			var vx: float=cos(angle)*4.0+world.sample_native_random_unit()*2.0
			var vy: float=sin(angle)*4.0+world.sample_native_random_unit()*2.0
			var size: float=2.0+world.sample_native_random_unit()*3.0
			var life: float=12.0+world.sample_native_random_unit()*8.0
			_emit_native_e_wave_particle(player.global_position,Vector2(vx,vy),Color("#ff7a24"),size,life)
	var survivors: Array=[]
	for index in range(waves.size()):
		var wave: Dictionary=waves[index]
		if wave.get("wave")!=true:survivors.append(wave);continue
		var direction: Vector2=Vector2.from_angle(wave.ang)
		var perpendicular: Vector2=Vector2.from_angle(wave.ang+PI/2.0)
		wave.x+=float(wave.vx)*ticks;wave.y+=float(wave.vy)*ticks
		wave.dist+=Vector2(wave.vx,wave.vy).length()*ticks
		wave._wvT+=ticks
		if float(wave.dist)>=float(wave.maxDist):
			_e_wave_expired+=1
			player.telemetry_event.emit("e_wave_expired",{"frame":frame,"dist":wave.dist,"max_dist":wave.maxDist,"hits":wave._hitSet.size()})
			continue
		var point: Vector2=Vector2(wave.x,wave.y)
		var half: float=float(wave.w)/2.0
		for enemy in world.get_native_world_identity():
			if not is_instance_valid(enemy) or not enemy is Node2D or enemy.get("alive")!=true or wave._hitSet.has(enemy.get_instance_id()) or not enemy.has_method("receive_native_e_wave"):continue
			var delta: Vector2=enemy.global_position-point
			if delta.dot(direction)<=-float(wave.r) or delta.dot(direction)>=float(wave.r)+20.0 or absf(delta.dot(perpendicular))>=half+float(enemy.radius):continue
			var result: Dictionary=enemy.receive_native_e_wave(int(wave.dmg),direction,float(wave.slv))
			if result.get("accepted")!=true:continue
			wave._hitSet[enemy.get_instance_id()]=true
			_e_wave_hits+=1
			world.emit_native_parts(enemy.global_position,"#ffaa44",10)
			player.telemetry_event.emit("e_wave_hit",{"enemy_id":enemy.get_instance_id(),"frame":frame,"point":point,"enemy_position":enemy.global_position,"along":delta.dot(direction),"perpendicular":delta.dot(perpendicular),"damage":wave.dmg,"result":result})
		var projectiles: Array=get_tree().get_nodes_in_group("enemy_projectiles")
		projectiles.reverse()
		for projectile in projectiles:
			if not is_instance_valid(projectile) or projectile.is_queued_for_deletion() or projectile.get_parent()!=world or projectile.get_script()!=QDarkProjectileScript:continue
			var raw: Dictionary=projectile.read_native_q_carrier()
			if raw.is_empty() or raw.get("friendly") or raw.get("blackBean") or raw.get("fbEnergy") or raw.get("fdEnergy"):continue
			var delta: Vector2=Vector2(raw.x,raw.y)-point
			if delta.dot(direction)>-float(wave.r) and delta.dot(direction)<float(wave.r)+20.0 and absf(delta.dot(perpendicular))<half:
				_reflect_native_e_wave(projectile,raw)
		if (gc+index)%2==0:
			var side: float=1.0 if world.sample_native_random_unit()>0.5 else -1.0
			var px: float=wave.x+perpendicular.x*side*(half*world.sample_native_random_unit())
			var py: float=wave.y+perpendicular.y*side*(half*world.sample_native_random_unit())
			var vx: float=(world.sample_native_random_unit()-0.5)*2.0
			var vy: float=-world.sample_native_random_unit()*3.0
			var size: float=2.0+world.sample_native_random_unit()*3.0
			var life: float=10.0+world.sample_native_random_unit()*6.0
			_emit_native_e_wave_particle(Vector2(px,py),Vector2(vx,vy),Color("#aa8855"),size,life)
			vx=(world.sample_native_random_unit()-0.5)*1.5
			vy=-world.sample_native_random_unit()*2.0
			size=1.5+world.sample_native_random_unit()*2.0
			life=6.0+world.sample_native_random_unit()*4.0
			_emit_native_e_wave_particle(Vector2(px,py),Vector2(vx,vy),Color("#ffaa44"),size,life)
		survivors.append(wave)
	source_state.commit_native_e_wave_state(self,survivors,gc)

func _reflect_native_e_wave(projectile: Node, raw: Dictionary) -> Dictionary:
	var current: Dictionary=read_native_q_parry_source()
	if current.get("ready")!=true:return {"reflected":false}
	var st: Dictionary=source_providers.get_provider_bundle().formula.read_combat_qe_subset(true).get("provided",{})
	for field in ["parry_scale","parry_dmg_mul","parry_bonus","leg_shield_parry","ki_floor"]:
		if not st.has(field) or not is_finite(float(st[field])):return {"reflected":false}
	var base: int=maxi(current_source_parry_int(float(raw.dmg)*(1.0+minf(1.0,float(st.parry_scale)/300.0))*0.5*float(st.parry_dmg_mul)*(1.0+float(st.parry_bonus))*float(st.leg_shield_parry)),int(st.ki_floor))
	var point: Vector2=Vector2(raw.x,raw.y)
	var target: Node2D=null
	var nearest: float=600.0
	for enemy in world.query_native_enemies(point.x,point.y,600.0):
		if not is_instance_valid(enemy) or not enemy is Node2D or enemy.get("alive")!=true:continue
		var distance: float=enemy.global_position.distance_to(point)
		if distance<nearest:nearest=distance;target=enemy
	var result: Dictionary=projectile.apply_native_q_reflection(current_source_parry_int(float(base)*1.5),target,{"source_opt":current.options,"p_dot_pool":Callable(self,"_read_native_q_dot_pool"),"camera_position":func():return camera.global_position,"query_enemies":Callable(world,"query_native_enemies")},true)
	if result.get("reflected")!=true:return result
	var reward: int=current_source_parry_int(50.0*(1.0+float(st.parry_bonus))*(1.0+current.regen_lv*0.2))
	var resources: Dictionary=source_resources.commit_native_q_parry_reward(self,float(reward))
	_e_wave_reflections+=1
	player.telemetry_event.emit("e_wave_projectile_reflected",{"frame":world.get_native_frame(),"base":base,"result":result,"resources":resources,"full_doparry":false})
	return result

func get_native_e_wave_snapshot() -> Dictionary:
	var g: Variant=source_state.read_current_g() if is_instance_valid(source_state) else null
	var p: Variant=source_state.read_current_p() if is_instance_valid(source_state) else null
	return {"scope":"DEFAULT_FUSED_WAVE_PARTIAL","ready":read_native_e_wave_source().get("ready")==true,"births":_e_wave_births,"hits":_e_wave_hits,"reflections":_e_wave_reflections,"expired":_e_wave_expired,"active":g.get("_stProjs",[]).size() if g is Dictionary else null,"cooldown":p.get("_stCd",0) if p is Dictionary else null,"wing":p.get("_stWingT",0) if p is Dictionary else null,"last":_e_wave_last.duplicate(),"full_e_parity":false}

# Source28655/34001: current statDex and post-strike recovery, not render speed.
# Explicit JS undefined is converted before arithmetic; authority loss is NR.
static func _native_source_tempo_ratio(numerator: float, denominator: float) -> float:
	if is_nan(denominator):return NAN
	if denominator==0.0:return INF
	return numerator/denominator

func read_native_attack_tempo() -> Dictionary:
	if not is_instance_valid(source_providers) or not source_providers.is_native_source_providers_ready() or source_providers.get_native_source_player()!=player or source_providers.get_native_source_world()!=world:return {"ready":false,"reason":"current_tempo_source_owners_not_ready"}
	var b: Dictionary=source_providers.get_provider_bundle()
	var p: Variant=b.current_p.call()
	var inv: Variant=b.current_inventory.call()
	var stats: Variant=b.current_stats.call()
	var passives: Variant=b.current_passives.call()
	if not p is Dictionary or not inv is Dictionary or not inv.get("equipped") is Dictionary or not stats is Dictionary or not passives is Dictionary:return {"ready":false,"reason":"current_tempo_domains_not_ready"}
	var weapon: Variant=inv.equipped.get("weapon")
	var gloves: Variant=inv.equipped.get("gloves")
	if not b.affix.js_truthy(weapon):weapon={}
	if not b.affix.js_truthy(gloves):gloves={}
	if not weapon is Dictionary or not gloves is Dictionary:return {"ready":false,"reason":"current_tempo_equipment_shape_unsupported"}
	var dex: Dictionary=b.reference.eq_stat("Dex")
	var level: Dictionary=b.reference.lv_b()
	var affix: Dictionary=b.affix.eq_affix("atkSpeed")
	var implicit: Dictionary=b.formula.eq_implicit("_iAtkSpd")
	var unique: Dictionary=b.formula.u_eq("_uGloveSpd")
	var melee: Dictionary=b.affix.eq_affix("meleeAtkSpd")
	var glove: Dictionary=b.affix.eq_affix("glovesAtkSpd")
	for packet in [dex,level,affix,implicit,unique,melee,glove]:
		if packet.get("status")!="READY":return {"ready":false,"reason":"current_tempo_reader_not_ready","source":packet}
	var raw_dex: Variant=stats.get("dex") if stats.has("dex") else NAN
	var addition: Dictionary=b.formula._js_add(raw_dex,dex.value)
	if not addition.get("ok",false):return {"ready":false,"reason":addition.get("reason")}
	addition=b.formula._js_add(addition.value,level.value)
	if not addition.get("ok",false):return {"ready":false,"reason":addition.get("reason")}
	var stat_dex: float=1.0+b.affix.js_to_number(addition.value,true)*0.0005
	var glove_speed: float=b.affix.js_to_number(gloves.get("atkSpd"),gloves.has("atkSpd"))
	stat_dex+=glove_speed if b.affix.js_truthy(glove_speed) else 0.0
	stat_dex+=float(affix.value)
	stat_dex+=float(implicit.value)*0.01
	var unique_value: Variant=unique.value if b.affix.js_truthy(unique.value) else 0
	addition=b.formula._js_add(stat_dex,unique_value)
	if not addition.get("ok",false):return {"ready":false,"reason":addition.get("reason")}
	stat_dex=b.affix.js_to_number(addition.value,true)
	var raw_speed: Variant=weapon.get("spd")
	var speed: float=b.affix.js_to_number(raw_speed if b.affix.js_truthy(raw_speed) else 0.3,true)
	var wind_speed: float=b.affix.js_to_number(raw_speed if b.affix.js_truthy(raw_speed) else 1.0,true)
	var denominator: float=speed*stat_dex*(1.0+float(melee.value)+float(glove.value))
	var recovery: int=b.formula.js_to_int32(_native_source_tempo_ratio(16.0,denominator))
	var windup: int=b.formula.js_to_int32(_native_source_tempo_ratio(10.0,wind_speed))
	var e_level: float=b.affix.js_to_number(passives.get("pParry"),passives.has("pParry"))
	var e_recovery: int=b.formula.js_to_int32(_native_source_tempo_ratio(28.0,1.0+e_level*0.1))
	return {"ready":true,"authority":"current_source_tempo","swing_ticks":5.0,"recovery_ticks":recovery,"render_recovery_ticks":recovery if recovery!=0 else 1,"render_windup_ticks":windup if windup!=0 else 1,"e_swing_ticks":20.0,"e_recovery_ticks":e_recovery,"e_render_recovery_ticks":e_recovery if e_recovery!=0 else 1,"stat_dex":stat_dex if is_finite(stat_dex) else null,"stat_dex_nonfinite":not is_finite(stat_dex),"dex_present":stats.has("dex"),"weapon_spd_present":weapon.has("spd"),"weapon_spd":speed if is_finite(speed) else null,"weapon_spd_fallback":not b.affix.js_truthy(raw_speed),"melee_atk_speed":melee.value,"gloves_atk_speed":glove.value,"warrior_render_speed":0.85,"silver_render_speed":1.5,"e_passive_present":passives.has("pParry"),"e_passive":e_level if is_finite(e_level) else null}

# Narrow original sample playback in this Main owner. No generated replacement
# sound, no voice/other skill adoption, and no original master EQ parity claim.
const ATTACK_SAMPLE_PATHS := {
	"sword_swing1":"res://assets/sfx/attack_source/sword_swing1.mp3",
	"sword_swing2":"res://assets/sfx/attack_source/sword_swing2.mp3",
	"sword_swing3":"res://assets/sfx/attack_source/sword_swing3.mp3",
	"monster_hit":"res://assets/sfx/attack_source/monster_hit2.mp3",
	"monster_hit1":"res://assets/sfx/attack_source/monster_hit1.mp3",
	"monster_hit_flesh1":"res://assets/sfx/attack_source/monster_hit_flesh1.mp3",
	"monster_hit_flesh2":"res://assets/sfx/attack_source/monster_hit_flesh2.mp3",
	"flat_hit":"res://assets/sfx/attack_source/flat_hit.mp3"}
const ATTACK_HIT_CATEGORIES := [
	{"types":[3,11,13,15,16,17,18,19,45,46,72],"key":"monster_hit1","pitch":1.3},
	{"types":[7,9,26,40,47,48,66,76,78,84,86,88,95,96],"key":"monster_hit","pitch":0.7},
	{"types":[5,42,50,51,52,53,56,57,58],"key":"flesh","pitch":1.0},
	{"types":[4,10,12,14,23,82,83,85],"key":"monster_hit1","pitch":1.15},
	{"types":[22,27,30,33,35,38,39,43,63,64,73,75],"key":"monster_hit","pitch":0.9},
	{"types":[25,59,69,79,89,97,98,99],"key":"monster_hit1","pitch":1.2},
	{"types":[28,29,32,49,61,62,68,77,80,81,87,91,92],"key":"flat_hit","pitch":1.0}]
var _attack_audio_streams: Dictionary={}
var _attack_audio_queue: Array=[]
var _attack_audio_active: Array=[]
var _attack_audio_bindings: Dictionary={}
var _attack_audio_last_ms: Dictionary={}
var _attack_audio_bus: StringName=&""
var _attack_audio_output: StringName=&""
var _attack_audio_reason := "not_installed"
var _attack_audio_serial := 0
var _attack_audio_seen_serial := -1
var _attack_audio_seen_phases: Dictionary={}
var _attack_audio_hit_cd := 0
var _attack_audio_render_epoch := 0
var _attack_audio_log: Array=[]
var _attack_audio_random_trace: Array=[]
var _attack_audio_starts := 0
var _attack_audio_ended := 0

func _install_native_attack_audio() -> void:
	for key in ATTACK_SAMPLE_PATHS:
		# Normal runtime MP3 decoder, approved original bytes, no re-encoding.
		var bytes: PackedByteArray=FileAccess.get_file_as_bytes(ATTACK_SAMPLE_PATHS[key])
		if bytes.is_empty():_attack_audio_reason="approved_sample_missing:"+key;return
		var stream:=AudioStreamMP3.new()
		stream.data=bytes
		stream.loop=false
		if stream.get_length()<=0.0:_attack_audio_reason="sample_decoder_not_ready:"+key;return
		_attack_audio_streams[key]=stream
	_attack_audio_output=StringName("FDGAttackOutput_"+str(get_instance_id()))
	_attack_audio_bus=StringName("FDGAttackSource_"+str(get_instance_id()))
	AudioServer.add_bus()
	var output: int=AudioServer.bus_count-1
	AudioServer.set_bus_name(output,_attack_audio_output)
	AudioServer.set_bus_send(output,&"Master")
	AudioServer.add_bus()
	var source: int=AudioServer.bus_count-1
	AudioServer.set_bus_name(source,_attack_audio_bus)
	AudioServer.set_bus_send(source,_attack_audio_output)
	_attack_audio_reason=""
	for enemy in world.get_enemies():_bind_native_attack_enemy_audio(enemy)
	world.child_entered_tree.connect(_on_native_attack_audio_child_entered)

func _on_native_attack_audio_child_entered(child: Node) -> void:
	_bind_native_attack_enemy_audio.call_deferred(child)

func _bind_native_attack_enemy_audio(enemy: Variant) -> void:
	if not is_instance_valid(enemy) or enemy.is_queued_for_deletion() or enemy.get_parent()!=world or not world.get_native_world_identity().has(enemy) or not enemy.has_signal("telemetry_event") or not enemy.has_method("receive_damage"):return
	var id: int=enemy.get_instance_id()
	if _attack_audio_bindings.has(id):return
	var callback: Callable=_on_native_attack_enemy_audio.bind(enemy)
	enemy.telemetry_event.connect(callback)
	_attack_audio_bindings[id]={"node":weakref(enemy),"callback":callback}

func read_native_attack_audio_settings() -> Dictionary:
	if not _native_main_service_live() or not is_instance_valid(player) or player.is_queued_for_deletion() or player.get_parent()!=self or not is_instance_valid(world) or world.is_queued_for_deletion() or world.player!=player or not is_instance_valid(source_providers) or not source_providers.is_native_source_providers_ready() or not is_instance_valid(source_initialization_services):return {"ready":false,"reason":"actual_audio_source_owners_not_ready"}
	var options: Variant=source_initialization_services.read_current_options()
	if not options is Dictionary or not options.has("sfxVol"):return {"ready":false,"reason":"actual_current_OPT_sfxVol_missing"}
	var value: float=source_providers.get_provider_bundle().affix.js_to_number(options.sfxVol,true)
	if not is_finite(value) or value<0.0 or value>100.0:return {"ready":false,"reason":"current_audio_volume_outside_native_supported_domain"}
	if AudioServer.get_bus_index(_attack_audio_bus)<0 or AudioServer.get_bus_index(_attack_audio_output)<0 or not _native_attack_audio_original_samples_ready():return {"ready":false,"reason":_attack_audio_reason if not _attack_audio_reason.is_empty() else "actual_audio_bus_or_sample_lost"}
	return {"ready":true,"sfx_percent":value,"sfx_gain":value/100.0,"authority":"actual_current_source_OPT","saved_settings_restored":false,"global_ultimate_turret_context_ported":false}

func request_native_attack_sound(caller: Node, phase: String, step: int, attack_serial: int) -> Dictionary:
	var settings: Dictionary=read_native_attack_audio_settings()
	if settings.get("ready")!=true:return {"accepted":false,"reason":settings.get("reason")}
	var profile: Dictionary=player.get_native_character_profile_snapshot()
	if caller!=player or get_tree().paused or profile.get("ready")!=true or player.state!="swing" or attack_serial<=0 or attack_serial!=player._native_attack_audio_serial or phase not in ["start","hit_arc"]:return {"accepted":false,"reason":"actual_attack_audio_caller_not_ready"}
	if _attack_audio_seen_serial!=attack_serial:
		_attack_audio_seen_serial=attack_serial
		_attack_audio_seen_phases.clear()
	if _attack_audio_seen_phases.has(phase):return {"accepted":false,"reason":"duplicate_actual_attack_phase"}
	var selection: Dictionary=player.get_native_attack_selection_snapshot()
	if selection.get("ready")!=true:return {"accepted":false,"reason":"actual_audio_skill_selection_not_ready"}
	_attack_audio_seen_phases[phase]=true
	_attack_audio_random_trace.clear()
	var key: String
	var pitch: float
	if phase=="start" and selection.get("emit_ki_slash")==true:
		key="sword_swing"+str(clampi(step,1,3))
		pitch=1.0+(_native_attack_audio_random_unit()-0.5)*2.0*0.06
	else:
		key="sword_swing"+str(mini(2,int(_native_attack_audio_random_unit()*3.0))+1)
		pitch=1.0+(_native_attack_audio_random_unit()-0.5)*2.0*0.08
	return _queue_native_attack_sample(key,0.85,pitch,true,{"phase":phase,"attack_serial":attack_serial,"character":profile.index,"step":step})

func _on_native_attack_enemy_audio(kind: String, data: Dictionary, enemy: Node) -> void:
	if kind!="enemy_damage" or data.get("source") not in ["weapon","kiSlash"] or get_tree().paused or not is_instance_valid(enemy) or enemy.is_queued_for_deletion() or enemy.get_parent()!=world or not world.get_native_world_identity().has(enemy):return
	if float(data.get("raw_amount",data.get("amount",0)))<=0.0 or _attack_audio_hit_cd>0:return
	if read_native_attack_audio_settings().get("ready")!=true or player.get_native_character_profile_snapshot().get("ready")!=true:return
	var type: Variant=enemy.get("etype")
	if not type is int:return
	_attack_audio_random_trace.clear()
	_attack_audio_hit_cd=8
	var key: String=""
	var pitch: float=1.0
	for category in ATTACK_HIT_CATEGORIES:
		if category.types.has(type):key=category.key;pitch=category.pitch;break
	if key=="flesh":
		key="monster_hit_flesh1" if _native_attack_audio_random_unit()<0.5 else "monster_hit_flesh2"
		pitch=1.0+(_native_attack_audio_random_unit()-0.5)*2.0*0.1
	elif key.is_empty():key="monster_hit" if _native_attack_audio_random_unit()<0.5 else "monster_hit1"
	_queue_native_attack_sample(key,0.3,pitch,false,{"phase":"accepted_enemy_damage","enemy_id":enemy.get_instance_id(),"etype":type,"source":data.source})

func _queue_native_attack_sample(key: String, gain: float, rate: float, priority: bool, context: Dictionary) -> Dictionary:
	var now: int=Time.get_ticks_msec()
	if not priority:
		if now-int(_attack_audio_last_ms.get(key,0))<30:return {"accepted":false,"reason":"source_30ms_key_gate"}
		_attack_audio_last_ms[key]=now
	# playSample jitter occurs before backend caps; preserve this shared draw.
	rate*=0.92+_native_attack_audio_random_unit()*0.16
	var request: Dictionary={"key":key,"gain":gain,"rate":rate,"priority":priority,"context":context,"world_frame":world.get_native_frame(),"requested_epoch":_attack_audio_render_epoch,"source_random_values":_attack_audio_random_trace.duplicate(),"character":player.get_native_character_profile_snapshot().index}
	if priority:_attack_audio_queue.push_front(request)
	else:_attack_audio_queue.append(request)
	_record_event("native_attack_audio_queued",request.duplicate(true))
	return {"accepted":true,"key":key,"rate":rate}

func _advance_native_attack_audio() -> void:
	_attack_audio_render_epoch+=1
	if _attack_audio_hit_cd>0:_attack_audio_hit_cd-=1
	var settings: Dictionary=read_native_attack_audio_settings()
	if settings.get("ready")!=true:
		_attack_audio_queue.clear()
		for entry in _attack_audio_active.duplicate():_finish_native_attack_audio(entry.id,"source_lost")
		return
	var source_bus: int=AudioServer.get_bus_index(_attack_audio_bus)
	AudioServer.set_bus_volume_linear(source_bus,float(settings.sfx_gain))
	AudioServer.set_bus_mute(source_bus,float(settings.sfx_gain)==0.0)
	var pending: Array=_attack_audio_queue
	_attack_audio_queue=[]
	var seen: Dictionary={}
	var categories: Dictionary={}
	var count: int=0
	var mobile: bool=OS.has_feature("android") or OS.has_feature("ios")
	for request in pending:
		if player.get_native_character_profile_snapshot().get("index")!=request.character:continue
		var category: String="g_swing" if request.key.begins_with("sword_swing") else ("fireball" if request.key=="fireball" else "g_monHit")
		if not request.priority and (count>=(3 if mobile else 6) or int(categories.get(category,0))>=(1 if mobile else 2)):continue
		categories[category]=int(categories.get(category,0))+1
		var n: int=int(seen.get(request.key,0))
		var volume_mul: float=1.0 if n<2 else maxf(0.08,pow(0.5,n-1))
		var pitch_mul: float=1.0 if n<2 else maxf(0.7,1.0-(n-1)*0.05)
		_start_native_attack_sample(request,volume_mul,pitch_mul,settings.sfx_gain)
		seen[request.key]=n+1
		count+=1

func _start_native_attack_sample(request: Dictionary, volume_mul: float, pitch_mul: float, source_gain: float) -> void:
	# Source checks the buffer before voice caps/eviction. New fireball only;
	# the original eight loaded-key paths retain their existing backend body.
	if request.key=="fireball" and not _attack_audio_streams.get("fireball") is AudioStream:
		_native_fireball_sample_last={"status":"SOURCE_UNLOADED_DROP","queued":false,"sample_loaded":false,"loader_bound":false,"audible":false}
		_record_event("native_fireball_sample_unloaded_drop",_native_fireball_sample_last.duplicate(true))
		return
	var priority: int=10 if request.priority else 2
	var mobile: bool=OS.has_feature("android") or OS.has_feature("ios")
	if priority<=2:
		var hit_count: int=0
		for active in _attack_audio_active:
			if active.priority<=2:hit_count+=1
		if hit_count>=(2 if mobile else 3):return
	if _attack_audio_active.size()>=(16 if mobile else 48):
		var lowest: Dictionary=_attack_audio_active[0]
		for active in _attack_audio_active:
			if active.priority<lowest.priority:lowest=active
		if priority>lowest.priority or (priority>=10 and priority>=lowest.priority):_finish_native_attack_audio(lowest.id,"priority_eviction")
		else:return
	var voice:=AudioStreamPlayer.new()
	voice.name="SourceAttackSample"
	voice.process_mode=Node.PROCESS_MODE_ALWAYS
	voice.stream=_attack_audio_streams[request.key]
	voice.bus=_attack_audio_bus
	voice.volume_linear=minf(1.0,float(request.gain)*volume_mul*source_gain)
	voice.pitch_scale=float(request.rate)*pitch_mul
	add_child(voice)
	_attack_audio_serial+=1
	var id: int=_attack_audio_serial
	_attack_audio_active.append({"id":id,"player":voice,"key":request.key,"priority":priority})
	voice.finished.connect(_finish_native_attack_audio.bind(id,"finished"),CONNECT_ONE_SHOT)
	voice.play()
	get_tree().create_timer(voice.stream.get_length()+0.5,true).timeout.connect(_finish_native_attack_audio.bind(id,"fallback"),CONNECT_ONE_SHOT)
	_attack_audio_starts+=1
	var entry: Dictionary={"id":id,"key":request.key,"path":ATTACK_SAMPLE_PATHS[request.key],"context":request.context,"source_random_values":request.source_random_values,"world_frame":request.world_frame,"request_epoch":request.requested_epoch,"play_epoch":_attack_audio_render_epoch,"pitch":voice.pitch_scale,"voice_gain":voice.volume_linear,"source_bus_gain":source_gain,"driver":AudioServer.get_driver_name(),"playing":voice.playing}
	_attack_audio_log.append(entry)
	if _attack_audio_log.size()>64:_attack_audio_log.pop_front()
	_record_event("native_attack_audio_started",entry.duplicate(true))

func _finish_native_attack_audio(id: int, reason: String) -> void:
	for index in range(_attack_audio_active.size()):
		var entry: Dictionary=_attack_audio_active[index]
		if entry.id!=id:continue
		_attack_audio_active[index]=_attack_audio_active.back()
		_attack_audio_active.pop_back()
		if is_instance_valid(entry.player):
			entry.player.stop()
			entry.player.stream=null
			entry.player.queue_free()
		_attack_audio_ended+=1
		_record_event("native_attack_audio_ended",{"id":id,"reason":reason})
		return

func get_native_attack_audio_snapshot() -> Dictionary:
	var voices: Array=[]
	for entry in _attack_audio_active:
		if is_instance_valid(entry.player):voices.append({"id":entry.id,"key":entry.key,"playing":entry.player.playing,"position":entry.player.get_playback_position(),"bus":str(entry.player.bus)})
	return {"scope":"CURRENT_ATTACK_SAMPLE_PLAYBACK_PARTIAL","settings":read_native_attack_audio_settings(),"driver":AudioServer.get_driver_name(),"source_bus":str(_attack_audio_bus),"output_bus":str(_attack_audio_output),"decoded_original_samples":_attack_audio_streams.size(),"active":voices,"queued":_attack_audio_queue.size(),"starts":_attack_audio_starts,"ends":_attack_audio_ended,"recent":_attack_audio_log.duplicate(true),"render_epoch":_attack_audio_render_epoch,"hit_cd":_attack_audio_hit_cd,"original_master_EQ_compressor_ported":false,"voice_BGM_other_skill_ported":false,"subjective_sound_equivalence_verified":false}

func _dispose_native_attack_audio() -> void:
	_attack_audio_queue.clear()
	for entry in _attack_audio_active.duplicate():_finish_native_attack_audio(entry.id,"owner_exit")
	for binding in _attack_audio_bindings.values():
		var enemy: Node=binding.node.get_ref()
		if is_instance_valid(enemy) and enemy.telemetry_event.is_connected(binding.callback):enemy.telemetry_event.disconnect(binding.callback)
	_attack_audio_bindings.clear()
	if is_instance_valid(world) and world.child_entered_tree.is_connected(_on_native_attack_audio_child_entered):world.child_entered_tree.disconnect(_on_native_attack_audio_child_entered)
	for name in [_attack_audio_bus,_attack_audio_output]:
		var index: int=AudioServer.get_bus_index(name)
		if index>0:AudioServer.remove_bus(index)
	_attack_audio_streams.clear()

func _native_attack_audio_random_unit() -> float:
	var value: float=world.sample_native_random_unit()
	_attack_audio_random_trace.append(value)
	return value

# Native RMB reader/owner wiring. The source producer being configured is not
# proof that actual projectile, proficiency guards or source sample are ready.
func get_native_fireball_bindings() -> Dictionary:
	return {"read_p":Callable(self,"read_native_fireball_p"),
		"read_beam_held":Callable(self,"read_native_fireball_held"),
		"read_gamepad_active":Callable(self,"read_native_fireball_gamepad_active"),
		"read_p_magic_cost":Callable(self,"read_native_fireball_magic_cost"),
		"read_p_magic_spd":Callable(self,"read_native_fireball_magic_speed"),
		"read_magic_ref":Callable(self,"read_native_fireball_reference"),
		"read_p_magic_mul":Callable(self,"read_native_fireball_magic_multiplier"),
		"read_fuse_mul":Callable(self,"read_native_fireball_fuse_multiplier"),
		"read_helmet":Callable(self,"read_native_fireball_helmet"),
		"apply_cast_start":Callable(self,"apply_native_fireball_cast_start"),
		"apply_cast_finish":Callable(self,"apply_native_fireball_cast_finish"),
		"apply_recover_idle":Callable(self,"apply_native_fireball_recover_idle")}

func read_native_fireball_p() -> Variant:
	return source_state.read_current_p() if is_instance_valid(source_state) and source_state.is_native_new_run_state_ready() else null

func read_native_fireball_held() -> bool:
	return is_instance_valid(player) and player.get_native_input_snapshot().held.get("native_magic",false)==true

func read_native_fireball_gamepad_active() -> Variant:
	if not is_instance_valid(player):return null
	# Only an actually admitted mouse event establishes this native KBM path.
	# Unknown/unsupported input does not become a fabricated browser GP flag.
	return false if player.get_native_input_snapshot().get("magic_input_kind")=="keyboard_mouse" else null

func _native_fireball_provider_bundle() -> Dictionary:
	return source_providers.get_provider_bundle() if is_instance_valid(source_providers) and source_providers.is_native_source_providers_ready() else {}

func _native_fireball_ready_scalar(result: Variant) -> Variant:
	if not result is Dictionary or result.get("status")!="READY":return null
	var value: Variant=result.get("value")
	return value if (value is int or value is float) and is_finite(float(value)) else null

func read_native_fireball_magic_cost() -> Variant:
	var b: Dictionary=_native_fireball_provider_bundle()
	if b.is_empty():return null
	var passives: Variant=source_state.read_current_passives()
	if not passives is Dictionary or not (passives.get("pMagic") is int or passives.get("pMagic") is float):return null
	var reduction: Variant=_native_fireball_ready_scalar(b.affix.eq_affix("mpCostRed"))
	var unique: Variant=_native_fireball_ready_scalar(b.formula.u_eq("_uHelmMagic"))
	if reduction==null or unique==null or not is_finite(float(passives.pMagic)):return null
	var value: float=maxf(0.40,1.0-float(passives.pMagic)*0.04-float(reduction)-float(unique))
	return value if is_finite(value) else null

func read_native_fireball_magic_speed() -> Variant:
	var b: Dictionary=_native_fireball_provider_bundle()
	if b.is_empty():return null
	var passives: Variant=source_state.read_current_passives()
	if not passives is Dictionary or not (passives.get("pMagic") is int or passives.get("pMagic") is float):return null
	var cast_speed: Variant=_native_fireball_ready_scalar(b.affix.eq_affix("castSpeed"))
	var headband: Variant=_native_fireball_ready_scalar(b.affix.eq_affix("headbandCastSpd"))
	if cast_speed==null or headband==null or not is_finite(float(passives.pMagic)):return null
	var value: float=(2.0+float(passives.pMagic)*0.08)*(1.0+float(cast_speed)+float(headband))
	return value if is_finite(value) and value>0.0 else null

func read_native_fireball_reference() -> Variant:
	var b: Dictionary=_native_fireball_provider_bundle()
	return _native_fireball_ready_scalar(b.reference.magic_ref()) if not b.is_empty() else null

func read_native_fireball_magic_multiplier() -> Variant:
	var b: Dictionary=_native_fireball_provider_bundle()
	return _native_fireball_ready_scalar(b.formula.p_magic_mul(true)) if not b.is_empty() else null

func read_native_fireball_fuse_multiplier(skill: Variant) -> Variant:
	if skill!="fireball":return null
	var b: Dictionary=_native_fireball_provider_bundle()
	if b.is_empty():return null
	var star: Variant=_native_fireball_ready_scalar(b.fusion.fuse_star(skill))
	var boost: Variant=_native_fireball_ready_scalar(b.affix.eq_affix("skillBoost"))
	if star==null or boost==null:return null
	return (1.0+(float(star)-1.0)*0.2 if float(star)>=2.0 else 1.0)*(1.0+float(boost))

func read_native_fireball_helmet() -> Variant:
	if not is_instance_valid(source_state) or not source_state.is_native_new_run_state_ready():return null
	var inventory: Variant=source_state.read_current_inventory()
	if not inventory is Dictionary or not inventory.get("equipped") is Dictionary:return null
	var helmet: Variant=inventory.equipped.get("helmet")
	# Original hm() is INV.equipped.helmet || {}; never create or equip an item.
	if helmet==null:return {}
	return helmet if helmet is Dictionary else null

func read_native_fireball_delivery_readiness() -> Dictionary:
	if not is_instance_valid(native_fireball_delivery) or native_fireball_delivery.is_queued_for_deletion():
		return {"ready":false,"reason":"actual_fireball_projectile_delivery_unbound"}
	if native_fireball_delivery.get_parent()!=world or native_fireball_delivery.get("player")!=player or native_fireball_delivery.get("source_state")!=source_state or native_fireball_delivery.get("source_resources")!=source_resources or not native_fireball_delivery.has_method("read_native_fireball_readiness") or not native_fireball_delivery.has_method("prepare_native_fireball_finish"):
		return {"ready":false,"reason":"actual_fireball_delivery_owner_mismatch"}
	var current: Variant=native_fireball_delivery.read_native_fireball_readiness()
	if not current is Dictionary:return {"ready":false,"reason":"actual_fireball_delivery_readiness_not_dictionary"}
	for key in ["ready","projectile_ready"]:
		if current.get(key)!=true:return {"ready":false,"reason":"actual_fireball_delivery_missing:"+key}
	var proficiency: Dictionary=read_native_fireball_proficiency_guard()
	if proficiency.get("ready")!=true:return {"ready":false,"reason":proficiency.get("reason")}
	var dispatcher: Dictionary=read_native_fireball_sample_dispatcher_readiness()
	if dispatcher.get("ready")!=true:return {"ready":false,"reason":dispatcher.get("reason")}
	var result: Dictionary=current.duplicate()
	result["proficiency_ready"]=true
	result["proficiency_lesson_active"]=proficiency.active
	result["sample_dispatcher_ready"]=true
	result["sample_loaded"]=dispatcher.sample_loaded
	result["sample_loader_bound"]=false
	return result

func prepare_native_fireball_delivery(payload: Dictionary) -> Dictionary:
	var ready: Dictionary=read_native_fireball_delivery_readiness()
	if ready.get("ready")!=true:return ready
	var prepared: Variant=native_fireball_delivery.prepare_native_fireball_finish(payload)
	return prepared if prepared is Dictionary else {"ready":false,"reason":"actual_fireball_delivery_prepare_not_dictionary"}

func apply_native_fireball_cast_start(request: Dictionary) -> Dictionary:
	var speed: Variant=read_native_fireball_magic_speed()
	var cost: Variant=read_native_fireball_magic_cost()
	if speed==null or cost==null:return {"accepted":false,"reason":"actual_fireball_cost_or_speed_not_ready"}
	var b: Dictionary=_native_fireball_provider_bundle()
	if request.get("cost")!=b.formula.js_to_int32(10.0*float(cost)) or request.get("cast_frames")!=b.formula.js_to_int32(14.0/float(speed)):
		return {"accepted":false,"reason":"current_fireball_cost_or_speed_changed"}
	return source_state.apply_native_fireball_start(self,request)

func apply_native_fireball_cast_finish(request: Dictionary) -> Dictionary:
	if not is_instance_valid(source_state):return {"accepted":false,"reason":"actual_fireball_state_owner_missing"}
	return source_state.apply_native_fireball_finish(self,request)

func apply_native_fireball_recover_idle(request: Dictionary) -> Dictionary:
	if not is_instance_valid(source_state):return {"accepted":false,"reason":"actual_fireball_state_owner_missing"}
	return source_state.apply_native_fireball_recover_idle(self,request)

func _advance_native_fireball_phase(ticks: float,frame: float,entered_state: String) -> void:
	if is_instance_valid(native_fireball_phase):native_fireball_phase.advance_native(ticks,frame,entered_state)

# Only the four actual typed provider inputs are owned here. No synthetic
# callbacks are added for the remaining normal hurtE owners.
func get_native_normal_enemy_damage_provider_callbacks() -> Dictionary:
	if not _native_main_service_live() or not is_instance_valid(source_initialization_services) \
			or source_initialization_services.get_script() != SourceInitializationServicesScript:
		return {}
	return source_initialization_services.get_normal_enemy_damage_provider_callbacks(self)

func read_native_source_equipment_affix(id: Variant) -> Dictionary:
	# Read through the current actual source owner. Keep its cache, status,
	# partial prefix and query-key semantics; do not rebuild or normalize here.
	var bundle: Dictionary = _native_fireball_provider_bundle()
	if not _native_main_service_live() or bundle.is_empty():
		# Existing packet callers retain their original unavailable reason.
		return {"status": "NOT_READY", "reason": "actual_packet_affix_provider_not_ready"}
	return bundle.affix.eq_affix(id)

func read_native_player_projectile_pierce_flat() -> Dictionary:
	return read_native_source_equipment_affix("pierceFlat")

func read_native_player_projectile_pierce_passive() -> Dictionary:
	if not _native_main_service_live() or not is_instance_valid(source_state) or not source_state.is_native_new_run_state_ready():
		return {"status": "NOT_READY", "reason": "actual_packet_passive_owner_not_ready"}
	var passives: Variant = source_state.read_current_passives()
	if not passives is Dictionary:
		return {"status": "NOT_READY", "reason": "actual_packet_passives_missing"}
	# Actual PASSIVES holder is mandatory. Missing/null/falsy numeric key alone
	# follows source PASSIVES.pPierce || 0; unsupported shapes stay explicit.
	var level: Variant = passives.get("pPierce", 0)
	if level == null or (level is bool and not level) or (level is String and level.is_empty()):
		level = 0
	if not (level is int or level is float) or not is_finite(float(level)):
		return {"status": "NOT_READY", "reason": "current_pierce_passive_shape_unsupported"}
	return {"status": "READY", "value": level}

var _native_fireball_sample_last: Dictionary = {"status":"UNBOUND","audible":false}

# Normal-hit lesson input: one active-only read on the same current holder.
# The regen/chapter guard and existing fireball finish bridge stay separate.
func read_native_normal_enemy_lesson_status() -> Dictionary:
	if not _native_main_service_live() or not _native_source_lesson_holder_live():
		return {"status":"NOT_READY", "ready":false, "reason":"actual_normal_lesson_owner_unbound"}
	var holder: RefCounted = source_lesson
	var result: Dictionary = holder.read_active_status()
	if not is_instance_valid(holder) or not _native_main_service_live() \
			or not _native_source_lesson_holder_live() or source_lesson != holder:
		return {"status":"NOT_READY", "ready":false, "reason":"actual_normal_lesson_owner_changed", "read_result":result}
	if typeof(result.get("epoch")) != TYPE_INT or holder.get_epoch() != result.epoch:
		return {"status":"NOT_READY", "ready":false, "reason":"actual_normal_lesson_epoch_changed", "read_result":result}
	return result

func read_native_fireball_proficiency_guard() -> Dictionary:
	if not _native_main_service_live() or not _native_source_lesson_holder_live():
		return {"ready":false,"reason":"actual_fireball_lesson_owner_unbound"}
	var detail: Dictionary = source_lesson.read_guard_detail()
	var authority: String = str(detail.get("authority",""))
	if authority in [SourceLessonScript.AUTH_PROPERTY_UNCREATED, SourceLessonScript.AUTH_PROPERTY_UNSET, SourceLessonScript.AUTH_PROPERTY_FALSY]:
		if detail.get("ready") != true:
			return {"ready":false,"reason":"actual_fireball_lesson_witness_not_ready"}
		return {"ready":true,"active":false,"known_absent":authority != SourceLessonScript.AUTH_PROPERTY_FALSY,"authority":authority}
	if authority != SourceLessonScript.AUTH_CURRENT_LESSON:
		return {"ready":false,"reason":"actual_fireball_lesson_authority_missing"}
	# The regen guard additionally needs chapter. Source _addSkProf reads only
	# active, so use the current public reference, not detail.ready as active.
	var current: Variant = source_lesson.get_current_lesson_reference()
	var active: Variant
	if current is Dictionary:
		active = current.get("active")
	elif current is Object and is_instance_valid(current):
		active = current.get("active")
	else:
		return {"ready":false,"reason":"actual_fireball_lesson_reference_unknown"}
	if typeof(active) not in SourceLessonScript.JS_RECOGNIZED_TYPES:
		return {"ready":false,"reason":"actual_fireball_lesson_active_type_unsupported"}
	return {"ready":true,"active":SourceLessonScript.AFFIX.js_truthy(active),"known_absent":false,"authority":authority}

func _native_attack_audio_original_samples_ready() -> bool:
	# All original eight remain mandatory; a new loaded fireball key is allowed.
	for key in ATTACK_SAMPLE_PATHS:
		if not _attack_audio_streams.get(key) is AudioStream:
			return false
	return true

func read_native_fireball_sample_dispatcher_readiness() -> Dictionary:
	if not _native_main_service_live() or not is_instance_valid(source_initialization_services) or source_initialization_services.get_script()!=SourceInitializationServicesScript:
		return {"ready":false,"reason":"actual_fireball_sample_global_owner_unbound"}
	var context: Variant = source_initialization_services.read_current_sample_context(self)
	if not context is Dictionary or context.get("ready")!=true:
		return {"ready":false,"reason":context.get("reason","actual_fireball_current_sample_context_not_ready") if context is Dictionary else "actual_fireball_current_sample_context_not_ready"}
	var volume: Variant = context.get("gx_vol_mul")
	if not (volume is int or volume is float) or not is_finite(float(volume)):
		return {"ready":false,"reason":"actual_fireball_current_gx_volume_not_numeric"}
	var settings: Dictionary = read_native_attack_audio_settings()
	if settings.get("ready")!=true:
		return {"ready":false,"reason":settings.get("reason","actual_sample_queue_backend_not_ready")}
	var profile: Dictionary = player.get_native_character_profile_snapshot()
	if profile.get("ready")!=true:
		return {"ready":false,"reason":"actual_fireball_sample_character_not_ready"}
	return {"ready":true,"gx_vol_mul":volume,"sample_loaded":_attack_audio_streams.get("fireball") is AudioStream,
		"loader_bound":false,"authority":"actual_source_initialization_services.current_sample_globals","audible_verified":false}

func dispatch_native_fireball_sample(caller: Node, rate: float) -> void:
	# Exact void playSample('fireball',.8,_r(1,.08)) front. Only the current
	# resource owner during its actual cast-finish commit can call this path.
	if not _native_main_service_live() or caller!=source_resources or not is_instance_valid(caller) or caller.get("_committing")!=true or not is_instance_valid(player) or player.state!="magicCast" or not is_finite(rate):
		_native_fireball_sample_last={"status":"NOT_READY","reason":"actual_fireball_sample_caller_mismatch","audible":false}
		return
	var context: Dictionary = read_native_fireball_sample_dispatcher_readiness()
	if context.get("ready")!=true:
		_native_fireball_sample_last={"status":"NOT_READY","reason":context.get("reason"),"audible":false}
		return
	var volume: float = 0.8
	var multiplier: float = float(context.gx_vol_mul)
	if multiplier < 1.0:
		volume *= multiplier
		if volume < 0.01:
			_native_fireball_sample_last={"status":"SOURCE_GX_VOLUME_SKIP","queued":false,"audible":false}
			return
	# fireball is neither a Silvertail voice-map key nor a 30ms dedup key.
	_attack_audio_random_trace.clear()
	var queued: Dictionary = _queue_native_attack_sample("fireball",volume,rate,true,{"phase":"fireball_finish"})
	_native_fireball_sample_last={"status":"QUEUED" if queued.get("accepted")==true else "NOT_READY",
		"queued":queued.get("accepted")==true,"sample_loaded":context.sample_loaded,
		"loader_bound":false,"rate":queued.get("rate"),"audible":false}

func get_native_fireball_sample_snapshot() -> Dictionary:
	return {"last":_native_fireball_sample_last.duplicate(true),
		"readiness":read_native_fireball_sample_dispatcher_readiness(),"loader_bound":false,"audible_verified":false}

const NATIVE_FIREBALL_UNIQUE_KEYS = ["_uOrbPoisonBurst","_uVortexOrbPulse","_uPoiseOrbFracture","_uParryOrbEcho"]
const NATIVE_FIREBALL_DAMAGE_CALLBACKS = ["read_enemy","elem_mul","bump_malice_weak","hurt_enemy","hit_side_effects","hurt_field_mobs","apply_fireball_poison"]

func read_native_fireball_unique_values() -> Variant:
	if not _native_main_service_live() or not is_instance_valid(source_state) or not source_state.is_native_new_run_state_ready():
		return null
	var inventory: Variant=source_state.read_current_inventory()
	if not inventory is Dictionary or not inventory.get("equipped") is Dictionary:
		return null
	var result: Dictionary={}
	for stat in NATIVE_FIREBALL_UNIQUE_KEYS:
		var value: Variant=0
		for slot in SourceLessonScript.AFFIX.SLOT_NAMES:
			var item: Variant=inventory.equipped.get(slot)
			if not SourceLessonScript.AFFIX.js_truthy(item):
				continue
			# Current source items are dictionaries. Do not turn an unknown
			# native carrier into a fabricated item with zero unique values.
			if not item is Dictionary:
				return null
			var raw: Variant=item.get(stat)
			if SourceLessonScript.AFFIX.js_truthy(raw):
				value=raw
				break
		result[stat]=value
	return result

func _query_native_fireball_enemies(x: float,y: float,radius: float) -> Array:
	# Actual World query returns the same Node handles. read_enemy returns a
	# separate view; it never replaces these handles with hashed dictionaries.
	return world.query_native_enemies(x,y,radius)

func _is_native_fireball_wall(x: float,y: float) -> bool:
	return world.is_world_blocked(Vector2(x,y))

func read_native_fireball_flight_dependencies() -> Dictionary:
	if not _native_main_service_live() or not is_instance_valid(world) or not is_instance_valid(player) or world.get("player")!=player or not is_instance_valid(source_state) or not source_state.is_native_new_run_state_ready():
		return {"ready":false,"missing":["actual_fireball_source_owners"]}
	var missing: Array=[]
	var clock: Variant=null
	if world.has_method("read_native_source_player_projectile_context"):
		clock=world.read_native_source_player_projectile_context()
	if not clock is Dictionary or clock.get("ready")!=true:
		missing.append("actual_source_projectile_clock_sp_dt_sp")
	var envelope: Variant=null
	if world.has_method("get_native_source_fireball_bindings"):
		envelope=world.get_native_source_fireball_bindings()
	var owner: Variant=envelope.get("owner") if envelope is Dictionary else null
	var bindings: Variant=envelope.get("bindings") if envelope is Dictionary else null
	var owner_ok: bool=owner is Node and is_instance_valid(owner) and owner.get_parent()==world and owner.get("player")==player and owner.get("source_state")==source_state and owner.get("source_resources")==source_resources
	if not envelope is Dictionary or envelope.get("ready")!=true or not owner_ok or not bindings is Dictionary:
		missing.append("actual_hurtE_field_mob_poison_side_effect_owner")
	else:
		if envelope.get("hit_set_key_kind")!="godot_instance_id":
			missing.append("actual_field_mob_hit_set_key_contract")
		for key in NATIVE_FIREBALL_DAMAGE_CALLBACKS:
			var callback: Variant=bindings.get(key)
			if not callback is Callable or not callback.is_valid() or callback.get_object()!=owner:
				missing.append("actual_fireball_callback:"+key)
	var g: Variant=source_state.read_current_g()
	var counter: Variant=g.get("_gcT") if g is Dictionary else null
	if not counter is int or counter<0 or counter>20:
		missing.append("actual_current_G_gcT")
	var profile: Dictionary=player.get_native_character_profile_snapshot()
	if profile.get("ready")!=true or not profile.get("index") is int:
		missing.append("actual_current_character_index")
	var epoch: Variant=world.get_native_runtime_snapshot().get("clock_updates")
	if not epoch is int:
		missing.append("actual_native_phase_epoch")
	if clock is Dictionary and clock.get("ready")==true:
		for key in ["sp","dt_sp"]:
			var value: Variant=clock.get(key)
			if not (value is int or value is float) or not is_finite(float(value)):
				missing.append("actual_source_clock_value:"+key)
		if clock.get("native_epoch")!=epoch:
			missing.append("actual_source_clock_phase_mismatch")
	if not missing.is_empty():
		return {"ready":false,"missing":missing,"source_clock_equivalence_claim":false}
	var context: Dictionary={"sp":clock.sp,"dt_sp":clock.dt_sp,"gc_t":counter,"char_idx":profile.index}
	if is_instance_valid(source_initialization_services):
		var options: Variant=source_initialization_services.read_current_options()
		if options is Dictionary:
			if options.has("parts"):context["parts_opt"]=options.parts
			if options.has("deathFx"):context["death_fx_opt"]=options.deathFx
	var actual: Dictionary=bindings.duplicate()
	actual["query_enemies"]=Callable(self,"_query_native_fireball_enemies")
	actual["is_wall"]=Callable(self,"_is_native_fireball_wall")
	actual["read_unique_values"]=Callable(self,"read_native_fireball_unique_values")
	return {"ready":true,"context":context,"bindings":actual,"owner":owner,"native_epoch":epoch}

# Source-script context cache: owned by this Main, never by actor/Formula.
func can_bind_native_source_legendary_formula(formula: RefCounted, services: RefCounted,
		state: Node, providers: RefCounted) -> bool:
	return _source_legendary_context_error(formula, services, state, providers, false).is_empty()

func _source_legendary_context_error(formula: RefCounted, services: RefCounted,
		state: Node, providers: RefCounted, require_binding: bool = true) -> String:
	if not is_instance_valid(self) or is_queued_for_deletion() or get_script() == null \
			or get_script().resource_path != "res://scripts/main.gd":
		return "legendary_Main_not_live"
	for object in [formula, services, state, providers, player, world, source_resources]:
		if not is_instance_valid(object): return "legendary_owner_lost"
		if object is Node and object.is_queued_for_deletion(): return "legendary_owner_queued"
	if source_initialization_services != services or source_state != state \
			or source_providers != providers or world.get_parent() != self:
		return "legendary_Main_identity_changed"
	if services.get_script() != SourceInitializationServicesScript \
			or providers.get_script() != SourceProvidersScript or state.get_script() != SourceStateScript:
		return "legendary_source_script_changed"
	if is_node_ready() and not is_inside_tree(): return "legendary_Main_removed"
	if not services.is_native_main_legendary_bridge_current(self, state, providers):
		return "legendary_services_identity_changed"
	if not state.is_native_main_legendary_owner_current(self):
		return "legendary_state_identity_changed"
	if providers.get_native_main_legendary_formula(self) != formula:
		return "legendary_formula_identity_changed"
	if require_binding and not formula.is_main_legendary_source_bound_to(self, services, state, providers):
		return "legendary_formula_binding_changed"
	return ""

func read_native_source_legendary_equipment(stat: Variant, formula: RefCounted,
		services: RefCounted, state: Node, providers: RefCounted) -> Dictionary:
	var error := _source_legendary_context_error(formula, services, state, providers)
	if not error.is_empty(): return _source_legendary_failure("NOT_READY", error, "owner", stat)
	if _source_l_eq_cache == null:
		# Original rebuild installs {} before reading SLOT_NAMES/INV.
		_source_l_eq_cache = {}
		var inventory_result: Dictionary = state.read_native_legendary_inventory(self, formula, services, providers)
		if inventory_result.get("status") != "READY":
			return _source_legendary_failure(str(inventory_result.get("status", "NOT_READY")),
				str(inventory_result.get("reason", "legendary_inventory_unavailable")), "INV", inventory_result)
		error = _source_legendary_context_error(formula, services, state, providers)
		if not error.is_empty(): return _source_legendary_failure("NOT_READY", error, "owner_after_INV", inventory_result)
		var inventory: Dictionary = inventory_result["value"]
		if not inventory.has("equipped") or inventory["equipped"] == null:
			return _source_legendary_failure("SOURCE_THROW", "TypeError: equipped is null or undefined", "INV.equipped", inventory)
		if not inventory["equipped"] is Dictionary:
			return _source_legendary_failure("UNSUPPORTED_OPERAND", "equipped_property_container_unrepresented", "INV.equipped", inventory["equipped"])
		var equipped: Dictionary = inventory["equipped"]
		var slots := ["weapon","shield","boots","armor","helmet","bow","gloves","pants","belt","necklace","ring1","ring2","cape","bracelet","headband","ossuary","headband2"]
		for slot in slots:
			error = _source_legendary_context_error(formula, services, state, providers)
			if not error.is_empty(): return _source_legendary_failure("NOT_READY", error, "slot_owner", slot)
			var item: Variant = equipped.get(slot)
			if not _source_legendary_truthy(item): continue
			if not item is Dictionary:
				return _source_legendary_failure("UNSUPPORTED_OPERAND", "item_property_container_unrepresented", "item.legendarySpecial", item)
			var special: Variant = item.get("legendarySpecial")
			if not _source_legendary_truthy(special): continue
			if not special is Dictionary:
				return _source_legendary_failure("UNSUPPORTED_OPERAND", "special_property_container_unrepresented", "legendarySpecial.stat", special)
			var raw_stat: Variant = special.get("stat")
			if not _source_legendary_truthy(raw_stat): continue
			var key_result := source_legendary_property_key(raw_stat)
			if key_result.get("status") != "READY":
				return _source_legendary_failure("UNSUPPORTED_OPERAND", key_result["reason"], "legendarySpecial.stat", raw_stat)
			var key: String = key_result["key"]
			if not item.has(key):
				_source_l_eq_write_context = {"formula":formula,"services":services,"state":state,"providers":providers,
					"inventory":inventory,"slot":slot,"item":item,"special":special}
				var write_result: Dictionary = state.restore_native_legendary_item_stat(self, inventory, slot, item, special)
				_source_l_eq_write_context = {}
				if write_result.get("status") != "READY":
					return _source_legendary_failure(str(write_result.get("status", "NOT_READY")),
						str(write_result.get("reason", "legendary_restore_rejected")), "item[stat]", write_result)
				error = _source_legendary_context_error(formula, services, state, providers)
				if not error.is_empty(): return _source_legendary_failure("NOT_READY", error, "owner_after_restore", write_result)
			if not _source_l_eq_cache.has(key):
				_source_l_eq_cache[key] = item[key]
	# Cache hits never query inventory, resource/domain readers, or the writer.
	error = _source_legendary_context_error(formula, services, state, providers)
	if not error.is_empty(): return _source_legendary_failure("NOT_READY", error, "owner_after_query", stat)
	var query_key := source_legendary_property_key(stat)
	if query_key.get("status") != "READY":
		return _source_legendary_failure("UNSUPPORTED_OPERAND", query_key["reason"], "cache[stat]", stat)
	var raw: Variant = _source_l_eq_cache.get(query_key["key"])
	var value: Variant = raw if _source_legendary_truthy(raw) else 0
	return {"status":"READY","value":value,"source":"_lEq/_lEqRebuild@game.html:16609-16620",
		"non_finite":value is float and (is_nan(value) or is_inf(value)),"reason":"","undefined_reads":[]}

func is_native_source_legendary_write_current(state: Node, inventory: Dictionary,
		slot: String, item: Dictionary, special: Dictionary) -> bool:
	var context := _source_l_eq_write_context
	if context.is_empty() or context.get("state") != state or not is_same(context.get("inventory"), inventory) \
			or context.get("slot") != slot or not is_same(context.get("item"), item) \
			or not is_same(context.get("special"), special): return false
	return _source_legendary_context_error(context["formula"], context["services"], state, context["providers"]).is_empty()

func _source_legendary_failure(status: String, reason: String, operand: String, raw: Variant) -> Dictionary:
	return {"status":status,"reason":reason,"operand":operand,"raw":raw,
		"cache_initialized":_source_l_eq_cache is Dictionary,"cache_prefix":_source_l_eq_cache,
		"partial":_source_l_eq_cache is Dictionary,"source":"_lEq/_lEqRebuild@game.html:16609-16620"}

static func _source_legendary_truthy(value: Variant) -> bool:
	if value == null: return false
	if value is bool: return value
	if value is int: return value != 0
	if value is float: return value != 0.0 and not is_nan(value)
	if value is String: return not value.is_empty()
	return true

static func source_legendary_property_key(value: Variant) -> Dictionary:
	var key: String
	if value is String:
		key = value
	elif value == null:
		key = "null"
	elif value is bool:
		key = "true" if value else "false"
	elif value is int:
		if value < -9007199254740991 or value > 9007199254740991:
			return {"status":"UNSUPPORTED_OPERAND","reason":"integer_property_key_outside_JS_exact_domain"}
		key = str(value)
	elif value is float:
		if is_nan(value): key = "NaN"
		elif is_inf(value): key = "-Infinity" if value < 0.0 else "Infinity"
		elif value == 0.0: key = "0"
		elif abs(value) <= 9007199254740991.0 and floor(value) == value: key = str(int(value))
		else: return {"status":"UNSUPPORTED_OPERAND","reason":"JS_number_property_key_format_unrepresented"}
	else:
		return {"status":"UNSUPPORTED_OPERAND","reason":"JS_ToPropertyKey_unrepresented"}
	if key in ["__proto__","constructor","toString","toLocaleString","valueOf","hasOwnProperty",
			"isPrototypeOf","propertyIsEnumerable","__defineGetter__","__defineSetter__","__lookupGetter__","__lookupSetter__"]:
		return {"status":"UNSUPPORTED_OPERAND","reason":"JS_Object_prototype_property_unrepresented"}
	return {"status":"READY","key":key}

# Rand ownership is metadata-only; the existing scalar sampler stays separate.
func is_native_source_rand_context_current(services: Variant, expected_world: Variant) -> bool:
	if not is_instance_valid(self) or is_queued_for_deletion() or get_script() == null \
			or get_script().resource_path != "res://scripts/main.gd":
		return false
	if not services is RefCounted or not is_instance_valid(services) \
			or not expected_world is Node or not is_instance_valid(expected_world):
		return false
	if source_initialization_services != services or world != expected_world \
			or expected_world.is_queued_for_deletion() or expected_world.get_parent() != self:
		return false
	if services.get_script() != SourceInitializationServicesScript \
			or expected_world.get_script() == null \
			or expected_world.get_script().resource_path != "res://scripts/world.gd":
		return false
	return services.is_native_main_random_bridge_current(self, expected_world)

func is_native_source_element_context_current(formula: RefCounted, services: RefCounted,
		state: Node, providers: RefCounted) -> bool:
	if not is_instance_valid(_native_source_elements_owner_script): return false
	var expected_script: Variant = _native_source_elements_owner_script.get_ref()
	if not expected_script is Script or not is_instance_valid(expected_script) \
			or not is_same(get_script(), expected_script): return false
	if not _source_legendary_context_error(formula, services, state, providers, false).is_empty():
		return false
	if not is_inside_tree(): return false
	var live_tree: SceneTree = get_tree()
	for candidate in [player, world, state, source_resources]:
		if not candidate is Node or not candidate.is_inside_tree() \
				or candidate.get_tree() != live_tree: return false
	if state.get_parent() != world or source_resources.get_parent() != world \
			or world.get("player") != player: return false
	return true

func _native_source_element_operand_supported(value: Variant) -> bool:
	var kind: int = typeof(value)
	if kind == TYPE_INT:
		return value >= -9007199254740991 and value <= 9007199254740991
	return kind == TYPE_NIL or kind == TYPE_BOOL or kind == TYPE_STRING or kind == TYPE_FLOAT

func _native_source_element_strict_equal(left: Variant, right: Variant) -> bool:
	var left_kind: int = typeof(left)
	var right_kind: int = typeof(right)
	var left_number: bool = left_kind == TYPE_INT or left_kind == TYPE_FLOAT
	var right_number: bool = right_kind == TYPE_INT or right_kind == TYPE_FLOAT
	if left_number and right_number:
		if left_kind == TYPE_FLOAT and left != left: return false
		if right_kind == TYPE_FLOAT and right != right: return false
		return left == right
	if left_kind != right_kind: return false
	return left == right

func _native_source_element_not_ready(reason: String, a: Variant, d: Variant,
		reads: Array, read_result: Variant = null) -> Dictionary:
	var packet: Dictionary = {"status": "NOT_READY", "reason": reason,
		"raw_arguments": {"a": a, "d": d}, "EL_reads": reads,
		"source": "Main._native_source_elements/elMul"}
	if read_result != null: packet["read_result"] = read_result
	return packet

func _native_source_element_read_member(elements: Dictionary, key: String, reads: Array) -> Dictionary:
	var present: bool = elements.has(key)
	var record: Dictionary = {"key": key, "present": present}
	reads.append(record)
	if not present:
		return {"status": "NOT_READY", "reason": "EL_own_member_missing", "read_result": record}
	var value: Variant = elements[key]
	record["value"] = value
	record["raw_type"] = typeof(value)
	if not _native_source_element_operand_supported(value):
		return {"status": "NOT_READY", "reason": "EL_member_domain_unsupported", "read_result": record}
	return {"status": "READY", "value": value, "read_result": record}

func _native_source_element_match_pair(elements: Dictionary, a: Variant, d: Variant,
		first: String, second: String, reads: Array) -> Dictionary:
	var first_read: Dictionary = _native_source_element_read_member(elements, first, reads)
	if first_read.get("status") != "READY": return first_read
	if not _native_source_element_strict_equal(a, first_read["value"]):
		return {"status": "READY", "matched": false}
	var second_read: Dictionary = _native_source_element_read_member(elements, second, reads)
	if second_read.get("status") != "READY": return second_read
	return {"status": "READY", "matched": _native_source_element_strict_equal(d, second_read["value"])}

func _native_source_element_finish(packet: Dictionary, a: Variant, d: Variant,
		reads: Array, elements: Dictionary, formula: RefCounted, services: RefCounted,
		state: Node, providers: RefCounted) -> Dictionary:
	if not is_native_source_element_context_current(formula, services, state, providers) \
			or not is_same(_native_source_elements, elements):
		return _native_source_element_not_ready("element_owner_changed_after_read", a, d, reads, packet)
	return packet

func read_native_source_element_multiplier(a: Variant, d: Variant, formula: RefCounted,
		services: RefCounted, state: Node, providers: RefCounted) -> Dictionary:
	var reads: Array = []
	if not is_native_source_element_context_current(formula, services, state, providers):
		return _native_source_element_not_ready("element_owner_not_current", a, d, reads)
	var elements: Variant = _native_source_elements
	if not elements is Dictionary:
		return _native_source_element_not_ready("EL_owner_not_Dictionary", a, d, reads)
	if not _native_source_element_operand_supported(a) or not _native_source_element_operand_supported(d):
		var unsupported: Dictionary = _native_source_element_not_ready("argument_domain_unsupported", a, d, reads)
		return _native_source_element_finish(unsupported, a, d, reads, elements, formula, services, state, providers)
	var pair: Dictionary = _native_source_element_match_pair(elements, a, d, "F", "I", reads)
	if pair.get("status") != "READY":
		var failed_0: Dictionary = _native_source_element_not_ready(pair.get("reason", "EL_read_failed"), a, d, reads, pair)
		return _native_source_element_finish(failed_0, a, d, reads, elements, formula, services, state, providers)
	if pair["matched"]:
		var matched_0: Dictionary = {"status": "READY", "value": 2.0, "raw_arguments": {"a": a, "d": d}, "EL_reads": reads, "source": "Main._native_source_elements/elMul"}
		return _native_source_element_finish(matched_0, a, d, reads, elements, formula, services, state, providers)
	pair = _native_source_element_match_pair(elements, a, d, "I", "F", reads)
	if pair.get("status") != "READY":
		var failed_1: Dictionary = _native_source_element_not_ready(pair.get("reason", "EL_read_failed"), a, d, reads, pair)
		return _native_source_element_finish(failed_1, a, d, reads, elements, formula, services, state, providers)
	if pair["matched"]:
		var matched_1: Dictionary = {"status": "READY", "value": 2.0, "raw_arguments": {"a": a, "d": d}, "EL_reads": reads, "source": "Main._native_source_elements/elMul"}
		return _native_source_element_finish(matched_1, a, d, reads, elements, formula, services, state, providers)
	pair = _native_source_element_match_pair(elements, a, d, "D", "L", reads)
	if pair.get("status") != "READY":
		var failed_2: Dictionary = _native_source_element_not_ready(pair.get("reason", "EL_read_failed"), a, d, reads, pair)
		return _native_source_element_finish(failed_2, a, d, reads, elements, formula, services, state, providers)
	if pair["matched"]:
		var matched_2: Dictionary = {"status": "READY", "value": 2.0, "raw_arguments": {"a": a, "d": d}, "EL_reads": reads, "source": "Main._native_source_elements/elMul"}
		return _native_source_element_finish(matched_2, a, d, reads, elements, formula, services, state, providers)
	pair = _native_source_element_match_pair(elements, a, d, "L", "D", reads)
	if pair.get("status") != "READY":
		var failed_3: Dictionary = _native_source_element_not_ready(pair.get("reason", "EL_read_failed"), a, d, reads, pair)
		return _native_source_element_finish(failed_3, a, d, reads, elements, formula, services, state, providers)
	if pair["matched"]:
		var matched_3: Dictionary = {"status": "READY", "value": 2.0, "raw_arguments": {"a": a, "d": d}, "EL_reads": reads, "source": "Main._native_source_elements/elMul"}
		return _native_source_element_finish(matched_3, a, d, reads, elements, formula, services, state, providers)
	pair = _native_source_element_match_pair(elements, a, d, "D", "H", reads)
	if pair.get("status") != "READY":
		var failed_4: Dictionary = _native_source_element_not_ready(pair.get("reason", "EL_read_failed"), a, d, reads, pair)
		return _native_source_element_finish(failed_4, a, d, reads, elements, formula, services, state, providers)
	if pair["matched"]:
		var matched_4: Dictionary = {"status": "READY", "value": 2.0, "raw_arguments": {"a": a, "d": d}, "EL_reads": reads, "source": "Main._native_source_elements/elMul"}
		return _native_source_element_finish(matched_4, a, d, reads, elements, formula, services, state, providers)
	pair = _native_source_element_match_pair(elements, a, d, "H", "D", reads)
	if pair.get("status") != "READY":
		var failed_5: Dictionary = _native_source_element_not_ready(pair.get("reason", "EL_read_failed"), a, d, reads, pair)
		return _native_source_element_finish(failed_5, a, d, reads, elements, formula, services, state, providers)
	if pair["matched"]:
		var matched_5: Dictionary = {"status": "READY", "value": 2.0, "raw_arguments": {"a": a, "d": d}, "EL_reads": reads, "source": "Main._native_source_elements/elMul"}
		return _native_source_element_finish(matched_5, a, d, reads, elements, formula, services, state, providers)
	pair = _native_source_element_match_pair(elements, a, d, "E", "L", reads)
	if pair.get("status") != "READY":
		var failed_6: Dictionary = _native_source_element_not_ready(pair.get("reason", "EL_read_failed"), a, d, reads, pair)
		return _native_source_element_finish(failed_6, a, d, reads, elements, formula, services, state, providers)
	if pair["matched"]:
		var matched_6: Dictionary = {"status": "READY", "value": 2.0, "raw_arguments": {"a": a, "d": d}, "EL_reads": reads, "source": "Main._native_source_elements/elMul"}
		return _native_source_element_finish(matched_6, a, d, reads, elements, formula, services, state, providers)
	pair = _native_source_element_match_pair(elements, a, d, "L", "E", reads)
	if pair.get("status") != "READY":
		var failed_7: Dictionary = _native_source_element_not_ready(pair.get("reason", "EL_read_failed"), a, d, reads, pair)
		return _native_source_element_finish(failed_7, a, d, reads, elements, formula, services, state, providers)
	if pair["matched"]:
		var matched_7: Dictionary = {"status": "READY", "value": 2.0, "raw_arguments": {"a": a, "d": d}, "EL_reads": reads, "source": "Main._native_source_elements/elMul"}
		return _native_source_element_finish(matched_7, a, d, reads, elements, formula, services, state, providers)
	if _native_source_element_strict_equal(a, d):
		var physical_read: Dictionary = _native_source_element_read_member(elements, "P", reads)
		if physical_read.get("status") != "READY":
			var physical_failure: Dictionary = _native_source_element_not_ready(physical_read.get("reason", "EL_read_failed"), a, d, reads, physical_read)
			return _native_source_element_finish(physical_failure, a, d, reads, elements, formula, services, state, providers)
		if not _native_source_element_strict_equal(a, physical_read["value"]):
			var same_element: Dictionary = {"status": "READY", "value": 0.5, "raw_arguments": {"a": a, "d": d}, "EL_reads": reads, "source": "Main._native_source_elements/elMul"}
			return _native_source_element_finish(same_element, a, d, reads, elements, formula, services, state, providers)
	var neutral: Dictionary = {"status": "READY", "value": 1.0, "raw_arguments": {"a": a, "d": d}, "EL_reads": reads, "source": "Main._native_source_elements/elMul"}
	return _native_source_element_finish(neutral, a, d, reads, elements, formula, services, state, providers)

func is_native_source_play_time_context_current(services: RefCounted, state: Node,
		raw_g: Variant = null, require_g_identity: bool = false) -> bool:
	if not is_instance_valid(self) or is_queued_for_deletion() \
			or not is_instance_valid(_native_source_play_time_owner_script):
		return false
	var expected_script: Variant = _native_source_play_time_owner_script.get_ref()
	if not expected_script is Script or not is_instance_valid(expected_script) \
			or not is_same(get_script(), expected_script):
		return false
	if not is_instance_valid(services) or not is_instance_valid(state) \
			or state.is_queued_for_deletion():
		return false
	if not is_same(source_initialization_services, services) or not is_same(source_state, state):
		return false
	if not is_same(services.get_script(), SourceInitializationServicesScript) \
			or not is_same(state.get_script(), SourceStateScript):
		return false
	if not is_inside_tree():
		return false
	var live_tree: SceneTree = get_tree()
	for candidate in [player, world, state, source_resources]:
		if not candidate is Node or not is_instance_valid(candidate) \
				or candidate.is_queued_for_deletion() or not candidate.is_inside_tree() \
				or not is_same(candidate.get_tree(), live_tree):
			return false
	if not is_same(world.get_parent(), self) or not is_same(state.get_parent(), world) \
			or not is_same(source_resources.get_parent(), world):
		return false
	return state.is_native_play_time_owner_current(
		self, player, world, source_resources, raw_g, require_g_identity)
