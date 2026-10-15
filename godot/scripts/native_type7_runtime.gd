class_name ExoduserNativeType7Runtime
extends Node

signal telemetry_event(kind: String, data: Dictionary)

# Assembly only: original record remains immutable and no factory/Main admission
# is performed automatically. World owns the source clock, registry and phases.
const ActorScript = preload("res://scripts/enemy_type7_physical_flesh_crawler.gd")
const M30Script = preload("res://scripts/native_m30_modifier.gd")
const RecipeScript = preload("res://scripts/type3_spawn_recipe.gd")
const ChildScript = preload("res://scripts/type3_native_binding.gd")
const WarningScript = preload("res://port_modules/common_charge_warning/producer.gd")
const M29_CAPABILITIES = ["combat_qe", "warning_fx", "impact_fx", "detonate_sound"]
const NATIVE_FLAG_KEYS = ["_ch1StartMedium", "_firstShot", "_mob8dir", "_mobCh", "_mob8Col", "_mob8Row", "ib", "_iceOnHit", "_iceFreeze", "_lavaBurn"]
const DIRECTIONS = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"]
var _world: Node2D
var _target: Node2D
var _emitter: Node
var _context_provider: Callable
var _child_interfaces: Dictionary = {}
var _recipe: RefCounted
var _tp_profile: Dictionary = {}
var _m30_profile: Dictionary = {}
var _configured = false
var _error = "not_configured"
var _runtime_fault = ""
var _prepared: Dictionary = {}
var _installed: Array = []
var _last_readiness: Dictionary = {}
var _last_context: Dictionary = {}
var _last_summon: Dictionary = {}
var _metrics = {"prepared": 0, "prepare_rejected": 0, "installed": 0, "install_rejected": 0,
	"prepared_disposed": 0, "summon_calls": 0, "child_configured": 0, "child_registered": 0,
	"child_rejected": 0, "spawn_fx_calls": 0}

func configure(world: Node2D, target: Node2D, services: Dictionary) -> bool:
	if _configured or not is_instance_valid(world) or not is_instance_valid(target):
		return _fail("invalid_actual_world_or_target")
	for method in ["sample_native_random_unit", "can_move", "native_safe_point", "get_native_frame", "get_native_world_identity", "emit_native_parts", "emit_native_channel_particle", "register_summoned_enemy", "register_native_initial_consumer"]:
		if not world.has_method(method): return _fail("missing_actual_world_" + method)
	if not _callable(services.get("summon_context")) or not (services.get("type3_interfaces") is Dictionary):
		return _fail("missing_actual_summon_context_or_type3_interfaces")
	var emitter: Variant = services.get("projectile_emitter")
	if not is_instance_valid(emitter) or not (emitter is Node): return _fail("missing_actual_projectile_emitter")
	for method in ["emit", "supports_source_actor", "create_type7_teleport", "get_snapshot"]:
		if not emitter.has_method(method): return _fail("missing_actual_emitter_" + method)
	var emitter_status: Variant = emitter.get_snapshot()
	if not (emitter_status is Dictionary) or emitter_status.get("configured") != true:
		return _fail("actual_six_element_emitter_not_ready")
	for element in range(6):
		if emitter.supports_source_actor(3, element) != true: return _fail("missing_actual_type3_element_" + str(element))
	var interfaces: Dictionary = services["type3_interfaces"].duplicate()
	for key in ["native_random", "emit_charged_projectile", "player_context", "element_multiplier", "is_tile_wall", "handle_m29_parry", "emit_m29_event", "m29_readiness"]:
		if not _callable(interfaces.get(key)): return _fail("missing_actual_type3_" + key)
	_world = world
	_target = target
	_emitter = emitter
	_context_provider = services["summon_context"]
	_child_interfaces = interfaces
	if not _m29_ready(): return false
	if _context().is_empty(): return false
	var cleanup_available = false
	var child_script_resource: Script = ChildScript
	for method in child_script_resource.get_script_method_list():
		if method.get("name") == "dispose_unregistered_native_dependencies": cleanup_available = true
	if not cleanup_available: return _fail("missing_actual_type3_constructor_cleanup")
	_tp_profile = _descriptor("res://data/type7_teleport.json")
	_m30_profile = _descriptor("res://data/m30_burst.json")
	if _tp_profile.is_empty() or _m30_profile.is_empty(): return _fail("missing_original_TP_or_M30_descriptor")
	var recipe = RecipeScript.new()
	if not recipe.configure(Callable(world, "sample_native_random_unit"), _can_move, Callable(world, "native_safe_point")):
		return _fail("actual_child_recipe_configuration_rejected")
	_recipe = recipe
	# Route the existing binder to the same actual world sampler and source emitter.
	# These local Callable bindings do not modify the caller's services dictionary.
	_child_interfaces["native_random"] = Callable(world, "sample_native_random_unit")
	_child_interfaces["emit_charged_projectile"] = Callable(emitter, "emit")
	_configured = true
	_error = ""
	return true

static func project_actor_payload(record: Dictionary) -> Dictionary:
	if not _projection_error(record).is_empty(): return {}
	var payload = record.duplicate(true)
	var native: Dictionary = record["native_final"]
	payload["facing"] = native["facing"]
	payload["eShield"] = native["eShield"]
	payload["eShieldMax"] = native["eShieldMax"]
	payload["eRes"] = native["eRes"].duplicate(true)
	var flags: Dictionary = {}
	for key in NATIVE_FLAG_KEYS:
		if native.has(key): flags[key] = native[key]
	payload["native_flags"] = flags
	var animation: Dictionary = record["animation"].duplicate(true)
	var column = int(animation["column"])
	var row = int(animation["row"])
	animation["base_rect"] = [column * 256, row * 256, 256, 256]
	var walk: Array = []
	for frame in range(4): walk.append([(column * 4 + frame) * 256, row * 256, 256, 256])
	animation["walk_frame_rects"] = walk
	animation["direction_angle_sectors"] = DIRECTIONS.duplicate()
	payload["animation"] = animation
	payload["ai_profile"] = "native_type7_owner_dispatch_v1"
	return payload

func prepare_actor(record: Dictionary) -> Dictionary:
	if not _configured or not _runtime_fault.is_empty(): return _prepare_failure("runtime_not_ready")
	if not _m29_ready() or _context().is_empty(): return _prepare_failure(_error)
	var projection_error = _projection_error(record)
	if not projection_error.is_empty(): return _prepare_failure(projection_error)
	var actor = ActorScript.new()
	actor.configure(project_actor_payload(record), _world)
	var status: Variant = actor.get_snapshot()
	if not (status is Dictionary) or status.get("configured") != true:
		actor.free()
		return _prepare_failure("actual_type7_actor_configuration_rejected")
	actor.set_player(_target)
	var teleport: Node2D = _emitter.create_type7_teleport()
	# Type7 actor owns the one actual M30 render driver; helper adds none.
	var m30 = M30Script.new()
	if not is_instance_valid(teleport) or not teleport.configure(actor, _target, _world, actor.native_state, _tp_profile):
		_free_unparented([teleport, m30, actor])
		return _prepare_failure("actual_TP_configuration_rejected")
	if not m30.configure(actor, _target, _world, actor.modifier_state, _m30_profile):
		_free_unparented([teleport, m30, actor])
		return _prepare_failure("actual_M30_configuration_rejected")
	if not actor.bind_native_effects(Callable(_world, "sample_native_random_unit"), Callable(_world, "emit_native_parts"), Callable(_world, "emit_native_channel_particle"), "#bbbbbb"):
		_free_unparented([teleport, m30, actor])
		return _prepare_failure("actual_type7_effect_binding_rejected")
	if not actor.bind_native_dependencies(teleport, m30, _complete_summon, Callable(_emitter, "emit")):
		_free_unparented([teleport, m30, actor])
		return _prepare_failure("actual_type7_dependency_binding_rejected")
	var warning = WarningScript.new()
	warning.configure(_common_charge_snapshot.bind(weakref(actor)), _common_charge_frame)
	_prepared[actor.get_instance_id()] = {"actor": actor, "teleport": teleport, "m30": m30, "warning": warning, "original_record": record.duplicate(true)}
	_metrics.prepared += 1
	return {"valid": true, "actor": actor, "error": ""}

func install_actor(record: Dictionary) -> Dictionary:
	var prepared = prepare_actor(record)
	if not prepared["valid"]: return prepared
	var actor: Node2D = prepared["actor"]
	var bundle: Dictionary = _prepared[actor.get_instance_id()]
	for helper in [bundle["teleport"], bundle["m30"]]:
		_world.add_child(helper)
		var status: Variant = helper.get_snapshot()
		if helper.get_parent() != _world or not helper.is_node_ready() or not (status is Dictionary) or status.get("configured") != true:
			_metrics.install_rejected += 1
			dispose_prepared_actor(actor)
			return {"valid": false, "actor": null, "error": "actual_world_helper_install_rejected"}
	var warning: Node2D = bundle["warning"]
	_world.add_child(warning)
	if warning.get_parent() != _world or not warning.is_node_ready() or warning.is_physics_processing():
		_metrics.install_rejected += 1
		dispose_prepared_actor(actor)
		return {"valid": false, "actor": null, "error": "actual_common_charge_warning_install_rejected"}
	# World owns atomic exact-source validation, registry insertion, parentadd and
	# owner/warning phase registration. No duplicate actoradd or Array mutation.
	var registered: Variant = _world.register_native_initial_consumer(actor, bundle["original_record"])
	if not (registered is Dictionary) or registered.get("valid") != true:
		_metrics.install_rejected += 1
		if actor.get_parent() != null:
			_runtime_fault = "initial_registry_atomic_contract_violated"
			return {"valid": false, "actor": actor, "error": _runtime_fault}
		dispose_prepared_actor(actor)
		return {"valid": false, "actor": null, "error": "actual_initial_registry_rejected", "registry_result": registered}
	_prepared.erase(actor.get_instance_id())
	_installed.append(weakref(actor))
	_metrics.installed += 1
	return {"valid": true, "actor": actor, "error": "", "registry_result": registered, "original_record_mutated": false}

func dispose_prepared_actor(actor: Node2D) -> bool:
	if not is_instance_valid(actor) or actor.get_parent() != null or not _prepared.has(actor.get_instance_id()): return false
	var bundle: Dictionary = _prepared[actor.get_instance_id()]
	_prepared.erase(actor.get_instance_id())
	for helper in [bundle["teleport"], bundle["m30"], bundle["warning"]]:
		if is_instance_valid(helper) and (helper.get_parent() == null or helper.get_parent() == _world): helper.free()
	actor.free()
	_metrics.prepared_disposed += 1
	return true

func _common_charge_snapshot(reference: WeakRef) -> Dictionary:
	var actor: Node2D = reference.get_ref()
	if not is_instance_valid(actor) or not is_instance_valid(_world):
		return {"enemies": [], "shot_warnings": []}
	var charge: Dictionary = actor.get_common_charge_snapshot()
	var local = _world.to_local(actor.global_position)
	# Renderer consumes canonical e.el; element_id retains explicit enum metadata.
	return {"enemies": [{"id": str(actor.get("data")["id"]), "el": 0, "element_id": 0,
		"x": local.x, "y": local.y, "r": charge["radius"], "alive": charge["alive"],
		"_projChargeT": charge["ticks"], "_projChargeCol": charge["color"],
		"_projChargeBean": charge["bean"], "_projChargeParryClass": charge["parry_class"]}],
		"shot_warnings": []}

func _common_charge_frame() -> Dictionary:
	return {"game_frame": int(_world.get_native_frame()), "lang": "ko"}

func _complete_summon(actor: Node2D) -> Dictionary:
	_metrics.summon_calls += 1
	if not _configured or not _runtime_fault.is_empty() or not is_instance_valid(actor): return _summon_failure("runtime_or_actual_owner_unavailable")
	if not _m29_ready(): return _summon_failure(_error)
	var context = _context()
	if context.is_empty(): return _summon_failure(_error)
	var result: Dictionary = _recipe.summon_type7(actor.global_position.x, actor.global_position.y, context, _consume_child, _spawn_child_fx)
	_last_summon = result.duplicate(true)
	if result.get("valid") != true:
		# Preserve already completed source-order children/FX. Do not retry a failed
		# partial wave and resample it on every channel update.
		_runtime_fault = str(result.get("error", "actual_summon_consumer_failed"))
	return result

func _consume_child(recipe: Dictionary) -> bool:
	var child = ChildScript.new()
	if not child.configure(recipe, _target, _world, _child_interfaces.duplicate()):
		_cleanup_child(child)
		_metrics.child_rejected += 1
		return false
	_metrics.child_configured += 1
	if not child.is_native_registry_ready():
		_cleanup_child(child)
		_metrics.child_rejected += 1
		return false
	var result: Variant = _world.register_summoned_enemy(child)
	if not (result is Dictionary) or result.get("valid") != true:
		if child.get_parent() == null: _cleanup_child(child)
		else: _runtime_fault = "child_registry_atomic_contract_violated"
		_metrics.child_rejected += 1
		return false
	_metrics.child_registered += 1
	return true

func _cleanup_child(child: Node2D) -> void:
	if not is_instance_valid(child) or child.get_parent() != null: return
	if not child.has_method("dispose_unregistered_native_dependencies") or child.dispose_unregistered_native_dependencies() != true:
		_runtime_fault = "actual_unregistered_child_cleanup_rejected"
	child.free()

func _spawn_child_fx(x: float, y: float, color: String, count: int) -> void:
	_world.emit_native_parts(Vector2(x, y), color, count)
	_metrics.spawn_fx_calls += 1

func _can_move(x: float, y: float, radius: float) -> bool:
	return _world.can_move(Vector2(x, y), radius)

func _m29_ready() -> bool:
	if not _callable(_child_interfaces.get("m29_readiness")): return _fail("missing_actual_M29_readiness")
	var ready: Variant = _child_interfaces["m29_readiness"].call()
	if not (ready is Dictionary): return _fail("invalid_actual_M29_readiness")
	_last_readiness = ready.duplicate(true)
	for capability in M29_CAPABILITIES:
		if not (ready.get(capability) is bool) or ready[capability] != true: return _fail("unavailable_actual_M29_" + capability)
	var player_context: Variant = _child_interfaces["player_context"].call(_target)
	if not (player_context is Dictionary) or not (player_context.get("parry_window") is bool): return _fail("missing_actual_M29_player_parry_context")
	return true

func _context() -> Dictionary:
	if not _context_provider.is_valid():
		_fail("missing_actual_summon_context")
		return {}
	var context: Variant = _context_provider.call()
	if not (context is Dictionary):
		_fail("invalid_actual_summon_context")
		return {}
	for key in ["stage", "room", "player_level", "difficulty", "stage_difficulty_offset"]:
		if not _number(context.get(key)) or float(context[key]) != floor(float(context[key])):
			_fail("missing_integral_summon_context_" + key)
			return {}
	if int(context["stage"]) != 0 or int(context["player_level"]) < 1 or int(context["difficulty"]) < 0 or int(context["difficulty"]) >= RecipeScript.DIFFICULTY_MULTIPLIERS.size():
		_fail("unsupported_actual_summon_context")
		return {}
	_last_context = context.duplicate(true)
	return context.duplicate(true)

static func _projection_error(record: Dictionary) -> String:
	if record.get("id") != "ch1_initial_004" or record.get("order") != 3 or record.get("etype") != 7 or record.get("element") != "physical" or record.get("element_id") != 0 or record.get("elite") != 1 or record.get("mods") != ["M30"]:
		return "noncanonical_initial_type7_identity"
	for key in ["hp", "attack", "radius", "poise", "max_poise", "initial_idle_ticks", "initial_projectile_ticks", "initial_spawn_fade_ticks", "factory_random_seed"]:
		if not _number(record.get(key)): return "missing_source_body_ctor_" + key
	if not record.has("aura"): return "missing_source_body_ctor_aura"
	var spawn: Variant = record.get("spawn_position")
	if not (spawn is Array) or spawn.size() != 2 or not _number(spawn[0]) or not _number(spawn[1]): return "missing_source_body_ctor_spawn_position"
	if not (record.get("initial_timers") is Dictionary): return "missing_source_body_ctor_initial_timers"
	for key in ["poiseR", "chargeT"]:
		if not _number(record["initial_timers"].get(key)): return "missing_source_body_ctor_timer_" + key
	if not (record.get("native_final") is Dictionary): return "missing_actual_native_final"
	var native: Dictionary = record["native_final"]
	for key in ["facing", "eShield", "eShieldMax"]:
		if not _number(native.get(key)): return "missing_native_ctor_" + key
	if not (native.get("eRes") is Array): return "missing_native_ctor_eRes"
	for resistance in native["eRes"]:
		if not _number(resistance): return "invalid_native_ctor_eRes"
	if not (native.get("s") is String) or not (native.get("alive") is bool) or not _number(native.get("stunned")): return "missing_native_body_state"
	if not (native.get("kb") is Dictionary) or not _number(native["kb"].get("x")) or not _number(native["kb"].get("y")): return "missing_native_body_knockback"
	if not (record.get("animation") is Dictionary): return "missing_source_animation"
	var animation: Dictionary = record["animation"]
	for key in ["column", "row", "draw_height", "walk_frames", "walk_pixels_per_frame", "atlas_columns", "atlas_rows"]:
		if not _number(animation.get(key)): return "missing_source_animation_" + key
	var cell: Variant = animation.get("cell_size")
	if not (cell is Array) or cell.size() != 2 or not _number(cell[0]) or not _number(cell[1]) or float(cell[0]) != 256.0 or float(cell[1]) != 256.0:
		return "noncanonical_source_animation_cell"
	if float(animation["column"]) != 6.0 or float(animation["row"]) != 0.0 or float(animation["atlas_columns"]) != 8.0 or float(animation["atlas_rows"]) != 5.0 or float(animation["walk_frames"]) != 4.0 or float(animation["walk_pixels_per_frame"]) != 128.0:
		return "noncanonical_source_animation_geometry"
	for key in ["base_textures", "walk_textures"]:
		if not (animation.get(key) is Dictionary): return "missing_source_animation_" + key
		if animation[key].size() != 8: return "missing_eight_source_animation_" + key
		for direction in DIRECTIONS:
			if not animation[key].has(direction): return "missing_source_animation_direction_" + direction
			var path: Variant = animation[key][direction]
			if not (path is String) or path.is_empty(): return "invalid_source_animation_resource"
	if float(animation["draw_height"]) != 159.1433434296772: return "noncanonical_source_body_draw_height"
	if not (animation.get("native_pivot") is Array): return "missing_source_animation_native_pivot"
	var pivot: Array = animation["native_pivot"]
	if pivot.size() != 2 or not _number(pivot[0]) or not _number(pivot[1]) or float(pivot[0]) != 0.5 or float(pivot[1]) != 0.5: return "noncanonical_source_animation_pivot"
	return ""

func _descriptor(path: String) -> Dictionary:
	if not FileAccess.file_exists(path): return {}
	var parser = JSON.new()
	if parser.parse(FileAccess.get_file_as_string(path)) != OK or not (parser.data is Dictionary): return {}
	return parser.data.duplicate(true)

static func _free_unparented(nodes: Array) -> void:
	for node in nodes:
		if is_instance_valid(node) and node.get_parent() == null: node.free()

func _prepare_failure(reason: String) -> Dictionary:
	_error = reason
	_metrics.prepare_rejected += 1
	return {"valid": false, "actor": null, "error": reason}

func _summon_failure(reason: String) -> Dictionary:
	return {"valid": false, "error": reason, "requested_count": 0, "consumed_count": 0, "recipes": [], "parent_recovery_ticks": 50}

func _fail(reason: String) -> bool:
	_error = reason
	return false

func get_last_error() -> String:
	return _error

func get_snapshot() -> Dictionary:
	return {"configured": _configured, "error": _error, "runtime_fault": _runtime_fault, "prepared": _prepared.size(), "installed": _installed.size(), "metrics": _metrics.duplicate(true), "actual_M29_readiness": _last_readiness.duplicate(true), "actual_summon_context": _last_context.duplicate(true), "last_summon": _last_summon.duplicate(true), "automatic_factory_main_registration": false, "private_clock": false, "source_record_rewritten": false, "full_type7_admission_claimed": false}

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _callable(value: Variant) -> bool:
	return value is Callable and value.is_valid()
