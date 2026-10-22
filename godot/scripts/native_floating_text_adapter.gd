class_name ExoduserNativeFloatingTextAdapter
extends Node2D
## One World-owned addTxt ring. The unchanged producer owns source admission,
## glyph rendering and native_tick; only the priority3 post caller advances it.

const PRODUCER = preload("res://port_modules/floating_text/producer.gd")
const NUMBER_ATLAS = preload("res://port_modules/number_atlas/producer.gd")
const CONTEXT_SCHEMA = "exoduser.godot.native-projectile-fx-context.v1"
const REQUIRED_WORLD_METHODS = ["get_native_frame", "get_native_world_identity",
	"get_native_projectile_fx_context", "localize_native_text", "get_native_text_font"]

var _world: Node2D
var _producer: Node2D
var _configured = false
var _configuration_error = ""
var _last_frame = -1.0
var _last_epoch = -1
var _clock_calls = 0
var _clock_rejections = 0
var _emit_rejections = 0
var _number_atlas_baker: Node
var _number_atlas_texture: Texture2D
var _number_atlas_startup_started = false
var _number_atlas_startup_status = "not_started"
var _number_atlas_bake_calls = 0
var _number_atlas_supply_calls = 0

func configure(owner_world: Node2D) -> bool:
	if _configured:
		return false
	if not is_instance_valid(owner_world) or not owner_world.is_inside_tree():
		return _reject_configuration("missing_live_world")
	for method in REQUIRED_WORLD_METHODS:
		if not owner_world.has_method(method):
			return _reject_configuration("missing_world_method:" + method)
	var context: Variant = owner_world.get_native_projectile_fx_context()
	if not _context_valid(context):
		return _reject_configuration("unsupported_native_text_context")
	var frame: Variant = owner_world.get_native_frame()
	if not _number(frame) or float(frame) < 0.0:
		return _reject_configuration("invalid_native_world_frame")
	var identity: Variant = owner_world.get_native_world_identity()
	if not identity is Array:
		return _reject_configuration("missing_native_registry_identity")
	var font: Variant = owner_world.get_native_text_font()
	if not font is Font or font.resource_path != PRODUCER.LABEL_FONT_PATH:
		return _reject_configuration("missing_original_native_text_font")
	# Both callable targets are long-lived Nodes under this actual World. No
	# local RefCounted provider can disappear while the producer remains alive.
	_world = owner_world
	_producer = PRODUCER.new(Callable(_world, "localize_native_text"),
		Callable(self, "_render_context"), PRODUCER.SRC_TXTS_MAX)
	# Startup allocation only; source ring semantics/life/size stay unchanged.
	for index in range(PRODUCER.SRC_TXTS_MAX):
		_producer.txts.append({"x":0.0,"y":0.0,"t":"","c":"#fff","life":0.0,"ml":0.0,"sz":0.0,"_numStr":null})
	_producer.name = "OriginalFloatingTextRing"
	process_mode = Node.PROCESS_MODE_ALWAYS
	z_as_relative = false
	z_index = 4002
	set_physics_process(false)
	set_process(false)
	_producer.process_mode = Node.PROCESS_MODE_ALWAYS
	_producer.z_as_relative = false
	_producer.z_index = 4002
	add_child(_producer)
	_last_frame = float(frame)
	_last_epoch = int(context["frame_reset_epoch"])
	_configured = true
	_configuration_error = ""
	# The original font preflight is already complete. One long-lived baker is
	# retained beside the consumer; it does not participate in the native clock.
	_number_atlas_baker = NUMBER_ATLAS.new()
	_number_atlas_baker.name = "NativeNumberAtlasBaker"
	_number_atlas_baker.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(_number_atlas_baker)
	call_deferred("_start_number_atlas_once")
	return true

func _number_atlas_baker_live() -> bool:
	return is_instance_valid(_number_atlas_baker) \
		and _number_atlas_baker.get_parent() == self \
		and _number_atlas_baker.is_inside_tree() \
		and not _number_atlas_baker.is_queued_for_deletion()

func _start_number_atlas_once() -> void:
	if _number_atlas_startup_started:
		return
	_number_atlas_startup_started = true
	if not _binding_ready() or not _number_atlas_baker_live():
		_number_atlas_startup_status = "unavailable_startup_lifecycle"
		return
	# Exact source _buildNumAtlas canvas export (game.html:43945-43985).
	# Preloaded once; no glyph mask bake, font fallback or allocation in native tick.
	_number_atlas_texture = preload("res://assets/ui/web_number_atlas.png")
	_number_atlas_supply_calls += 1
	_number_atlas_startup_status = "supplied_source_canvas" if _producer.set_number_atlas(_number_atlas_texture) else "failed_consumer_supply"

func emit_native_text(x: float, y: float, text: Variant, color: Variant,
		life: Variant = null, size: Variant = null, num_str: Variant = null) -> bool:
	if not _binding_ready() or not is_finite(x) or not is_finite(y):
		_emit_rejections += 1
		return false
	# Admission receives actual source world coordinates. Transform once into
	# the same child drawing space used for camera/cull bounds.
	var point: Vector2 = _producer.to_local(Vector2(x, y))
	return _producer.add_txt(point.x, point.y, text, color, life, size, num_str)

func advance_native_text(ticks: float, actual_frame: float, world_identity: Variant) -> bool:
	if not _binding_ready() or get_tree().paused or not is_finite(ticks) or ticks <= 0.0:
		_clock_rejections += 1
		return false
	var context: Dictionary = _world.get_native_projectile_fx_context()
	var frame: float = float(_world.get_native_frame())
	var epoch: int = int(context["frame_reset_epoch"])
	if not is_finite(actual_frame) or not is_equal_approx(actual_frame, frame) \
			or not is_same(world_identity, _world.get_native_world_identity()) \
			or not is_equal_approx(ticks, float(context["dt_sp"])) \
			or frame <= _last_frame or epoch <= _last_epoch:
		_clock_rejections += 1
		return false
	_producer.native_tick(ticks)
	_last_frame = frame
	_last_epoch = epoch
	_clock_calls += 1
	return true

func _binding_ready() -> bool:
	return _configured and is_instance_valid(_world) and is_instance_valid(_producer) \
		and get_parent() == _world and is_inside_tree() and not is_queued_for_deletion() \
		and _producer.get_parent() == self and _producer.is_inside_tree() \
		and not _producer.is_queued_for_deletion() \
		and _context_valid(_world.get_native_projectile_fx_context())

func _render_context() -> Dictionary:
	if not _binding_ready():
		return {}
	var camera: Camera2D = get_viewport().get_camera_2d()
	if not is_instance_valid(camera) or not camera.is_inside_tree():
		return {}
	var zoom: Vector2 = camera.zoom
	if not zoom.is_finite() or zoom.x <= 0.0 or zoom.y <= 0.0:
		return {}
	var viewport_size: Vector2 = get_viewport_rect().size
	if viewport_size.x <= 0.0 or viewport_size.y <= 0.0:
		return {}
	var centre: Vector2 = _producer.to_local(camera.get_screen_center_position())
	var source: Dictionary = _world.get_native_projectile_fx_context()
	return {"float_text_enabled": source["float_text_enabled"],
		"bt_active": source["battle_test_active"], "hi_fps": source["hi_fps"],
		"cam_x": centre.x, "cam_y": centre.y,
		"vw": viewport_size.x / zoom.x, "vh": viewport_size.y / zoom.y}

func get_snapshot() -> Dictionary:
	var pool: Array = _producer.txts.duplicate(true) if is_instance_valid(_producer) else []
	var live_count = 0
	for slot in pool:
		if float(slot["life"]) > 0.0:
			live_count += 1
	var context: Dictionary = _render_context()
	var counters: Dictionary = _producer.get_counters() if is_instance_valid(_producer) else {}
	return {"configured": _configured, "ready": _binding_ready(),
		"configuration_error": _configuration_error, "pool": pool,
		"pool_limit": PRODUCER.SRC_TXTS_MAX,
		"next_slot": _producer.txt_next if is_instance_valid(_producer) else 0,
		"live_count": live_count, "last_native_frame": _last_frame,
		"last_clock_epoch": _last_epoch, "clock_calls": _clock_calls,
		"clock_rejections": _clock_rejections, "emit_rejections": _emit_rejections,
		"producer_counters": counters, "render_context": context,
		"render_context_ready": not context.is_empty(),
		"draw_plan": _producer.build_draw_plan(context).duplicate(true) if not context.is_empty() else [],
		"draw_trace": _producer.get_last_trace() if is_instance_valid(_producer) else [],
		"font_status": _producer.font_status if is_instance_valid(_producer) else "unconfigured",
		"number_atlas_gap": not is_instance_valid(_producer) or not _producer.has_number_atlas(),
		"number_atlas_status": _producer.num_atlas_status if is_instance_valid(_producer) else "absent",
		"number_atlas_startup_status": _number_atlas_startup_status,
		"number_atlas_bake_calls": _number_atlas_bake_calls,
		"number_atlas_supply_calls": _number_atlas_supply_calls,
		"number_atlas_supplier_live": _number_atlas_baker_live(),
		"number_atlas_runtime_texture_size": Vector2i(_number_atlas_texture.get_width(), _number_atlas_texture.get_height()) if is_instance_valid(_number_atlas_texture) else Vector2i.ZERO,
		"number_atlas_build_report": _number_atlas_baker.get_build_report() if is_instance_valid(_number_atlas_baker) else {},
		"number_atlas_clock_owner": "startup_only_no_native_driver",
		"locale_scope": "ko_identity", "automatic_native_physics": false,
		"native_clock_owner": "World_hitFX_priority3_post",
		"positions_scope": "world_to_producer_local_once"}

static func _context_valid(context: Variant) -> bool:
	if not context is Dictionary or context.get("schema") != CONTEXT_SCHEMA \
			or context.get("clock_mode") != "godot_delta_native60" \
			or context.get("budget_scope") != "new_native_hit_fx_only":
		return false
	for flag in ["float_text_enabled", "battle_test_active", "hi_fps"]:
		if not context.get(flag) is bool:
			return false
	for key in ["dt_sp", "frame_reset_epoch", "text_pool_limit"]:
		if not _number(context.get(key)):
			return false
	return float(context["dt_sp"]) > 0.0 \
		and float(context["frame_reset_epoch"]) >= 0.0 \
		and float(context["frame_reset_epoch"]) == floor(float(context["frame_reset_epoch"])) \
		and float(context["text_pool_limit"]) == PRODUCER.SRC_TXTS_MAX

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

func _reject_configuration(reason: String) -> bool:
	_configuration_error = reason
	return false
