class_name ExoduserType3NativeBinding
extends "res://scripts/type3_summoned_actor.gd"

## Actual adapter around the original type3 actor. Its local AI clock is never
## assigned by the world/observer. The world owns the three-argument phase.
## No type7 admission, RNG reroll, element alias or fake parry availability.
const EliteOrder = preload("res://port_modules/elite_owner_attack_order/producer.gd")
const M29Script = preload("res://scripts/enemy_mod_m29.gd")
const M30Script = preload("res://scripts/native_m30_modifier.gd")
const M30_DESCRIPTOR = "res://data/m30_burst.json"
const M29_CAPABILITIES = ["combat_qe", "warning_fx", "impact_fx", "detonate_sound"]

var _binding_configured = false
var _binding_error = "not_configured"
var _runtime_binding_error = ""
var _binding_target: WeakRef
var _binding_world: WeakRef
var _providers: Dictionary = {}
var _m29: RefCounted
var _m30: Node2D
var _global_phase_frame = -1.0
var _phase_world_identity: Variant = null
var _accepted_owner_phases = 0
var _m29_lock_calls = 0
var _m29_trigger_calls = 0
var _m29_state_calls = 0
var _m30_native_calls = 0
var _m29_capability_receipt: Dictionary = {}

var facing: float:
	get: return float(get_native_modifier_state().get("facing", 0.0))
var native_flags: Dictionary:
	get:
		var flags: Dictionary = {}
		var raw = get_native_modifier_state()
		for key in ["ib", "_ch1StartMedium", "_iceOnHit", "_lavaBurn"]:
			if raw.has(key):
				flags[key] = raw[key]
		return flags

class BoundM30 extends M30Script:
	# The source module owns no native process. This adds only a real render
	# driver as a world sibling, so existing lava can outlive the enemy node.
	func _ready() -> void:
		super._ready()
		set_process(true)
	func _process(_delta: float) -> void:
		render_native(float(Time.get_ticks_msec()))

func configure(recipe: Dictionary, target: Node2D, world: Node2D, interfaces: Dictionary) -> bool:
	if _binding_configured or _configured:
		_binding_error = "already_configured"
		return false
	var error = _binding_preflight(recipe, target, world, interfaces)
	if not error.is_empty():
		_binding_error = error
		return false
	var actor_interfaces = interfaces.duplicate()
	actor_interfaces["automatic_physics"] = false
	actor_interfaces["modifier_pre_ai"] = _modifier_pre_ai
	actor_interfaces["modifier_state_step"] = _modifier_state_step
	actor_interfaces["player_context"] = _player_context
	var root_error = _preflight(recipe, target, world, actor_interfaces)
	if not root_error.is_empty():
		_binding_error = root_error
		return false
	var selected_mods: Array = recipe["mods"]
	var m30_profile: Dictionary = {}
	if selected_mods.has("M30"):
		var decoded: Variant = JSON.parse_string(FileAccess.get_file_as_string(M30_DESCRIPTOR))
		if not decoded is Dictionary:
			_binding_error = "missing_actual_M30_descriptor"
			return false
		m30_profile = decoded
		for section in ["warning", "lava"]:
			var path = str(m30_profile.get(section, {}).get("texture", ""))
			if not ResourceLoader.exists(path, "Texture2D"):
				_binding_error = "missing_actual_M30_resource:" + path
				return false
	_providers = interfaces.duplicate()
	_binding_target = weakref(target)
	_binding_world = weakref(world)
	if selected_mods.has("M29"):
		_m29 = M29Script.new()
		if not _m29.configure({"can_move": _m29_can_move, "is_wall": _m29_is_wall, "element_multiplier": _m29_element_multiplier, "random": _providers["native_random"], "sink": _on_m29_event}):
			_binding_error = "actual_M29_configuration_rejected"
			return false
	if not super.configure(recipe, target, world, actor_interfaces):
		_binding_error = "root_actor_configuration_rejected"
		return false
	if selected_mods.has("M30"):
		var kernel = BoundM30.new()
		if not kernel.configure(self, target, world, get_native_modifier_state()["modT"], m30_profile):
			_binding_error = "actual_M30_configuration_rejected:" + str(kernel.get_snapshot().get("configuration_error", ""))
			kernel.free()
			return false
		_m30 = kernel
		_m30.telemetry_event.connect(_forward_modifier_event)
		world.add_child(_m30)
	_binding_configured = true
	_binding_error = ""
	set_physics_process(false)
	return true

func _binding_preflight(recipe: Dictionary, target: Node2D, world: Node2D, interfaces: Dictionary) -> String:
	if not is_instance_valid(target) or not is_instance_valid(world):
		return "missing_actual_target_or_world"
	for method in ["get_native_frame", "get_native_world_identity"]:
		if not world.has_method(method):
			return "missing_actual_world_" + method
	for key in ["native_random", "emit_charged_projectile"]:
		if not _callable(interfaces.get(key)):
			return "missing_actual_" + key
	if not recipe.get("mods") is Array:
		return "missing_native_mods"
	if recipe["mods"].has("M29"):
		for method in ["receive_damage", "apply_native_posthurt_knockback"]:
			if not target.has_method(method):
				return "missing_actual_player_" + method
		# EL-01: missing PC non-projectile parry stays NOT_READY; no dummy service.
		for key in ["player_context", "element_multiplier", "is_tile_wall", "handle_m29_parry", "emit_m29_event", "m29_readiness"]:
			if not _callable(interfaces.get(key)):
				return "missing_actual_M29_" + key
		var ready: Variant = interfaces["m29_readiness"].call()
		if not ready is Dictionary:
			return "invalid_actual_M29_readiness"
		for capability in M29_CAPABILITIES:
			if not ready.get(capability) is bool or not ready[capability]:
				return "unavailable_actual_M29_" + capability
		var context: Variant = interfaces["player_context"].call(target)
		if not _valid_context(context, true):
			return "missing_actual_M29_parry_player_context"
		_m29_capability_receipt = ready.duplicate(true)
	return ""

static func _callable(value: Variant) -> bool:
	return value is Callable and value.is_valid()

static func _valid_context(value: Variant, require_parry: bool) -> bool:
	if not value is Dictionary:
		return false
	for key in ["x", "y", "r", "hp", "iframes"]:
		if not _number(value.get(key)):
			return false
	if not value.get("state") is String:
		return false
	return not require_parry or value.get("parry_window") is bool

func set_player(target: Node2D) -> bool:
	if not is_instance_valid(target):
		return false
	if _binding_configured and is_instance_valid(_target()) and _target() != target:
		_runtime_binding_error = "live_retarget_requires_new_binding"
		return false
	_binding_target = weakref(target)
	return true

func _target() -> Node2D:
	return _binding_target.get_ref() if _binding_target != null else null

func advance_native_phase(ticks: float, native_frame: float, world_identity: Variant) -> void:
	if not _binding_configured or not _number(ticks) or ticks <= 0 or not _number(native_frame) or world_identity == null:
		return
	var world = _binding_world.get_ref()
	if not is_instance_valid(world) or (is_inside_tree() and get_tree().paused):
		return
	if float(world.get_native_frame()) != native_frame or not is_same(world.get_native_world_identity(), world_identity):
		_runtime_binding_error = "phase_not_owned_by_actual_world"
		return
	if _global_phase_frame == native_frame and is_same(_phase_world_identity, world_identity):
		_runtime_binding_error = "duplicate_world_owner_phase"
		return
	if mods.has("M29"):
		var ready: Variant = _providers["m29_readiness"].call()
		for capability in M29_CAPABILITIES:
			if not ready is Dictionary or not ready.get(capability, false):
				_runtime_binding_error = "actual_M29_dependency_became_unavailable:" + capability
				return
		if not _valid_context(_providers["player_context"].call(_target()), true):
			_runtime_binding_error = "actual_M29_context_became_unavailable"
			return
	_global_phase_frame = native_frame
	_phase_world_identity = world_identity
	_accepted_owner_phases += 1
	# Do not assign root _native_frame or any root timer. Root consumes one
	# local phase through its unchanged actual implementation and hooks.
	super.advance_native(ticks)

func get_native_global_frame() -> float:
	return _global_phase_frame

func is_native_registry_ready() -> bool:
	return _binding_configured and _runtime_binding_error.is_empty()

func dispose_unregistered_native_dependencies() -> bool:
	# A failed registry transaction may own a provisional world-sibling M30.
	# Installed actors and all other world children remain outside this cleanup.
	if get_parent() != null:
		return false
	if is_instance_valid(_m30):
		_m30.free()
	_m30 = null
	_m29 = null
	_binding_configured = false
	_binding_error = "unregistered_dependencies_disposed"
	return true

func _player_context(target: Node2D) -> Dictionary:
	if _callable(_providers.get("player_context")):
		var context: Variant = _providers["player_context"].call(target)
		if _valid_context(context, mods.has("M29")):
			return context
	return {"x": target.global_position.x, "y": target.global_position.y, "r": target.get("radius"), "hp": target.get("hp"), "iframes": target.get("iframes"), "state": target.get("state")}

func _modifier_pre_ai(_actor: Node2D, ticks: float, distance: float, context: Dictionary) -> void:
	var raw = get_native_modifier_state()
	var result: Dictionary = EliteOrder.advance(raw, ticks, distance, context, _m29, _m30)
	if result.status != "READY":
		_runtime_binding_error = "elite_owner_NOT_READY:" + str(result.get("reason"))
		return
	if mods.has("M29"):
		_m29_lock_calls += 1
		_m29_trigger_calls += 1
	if mods.has("M30"):
		_m30_native_calls += 1

func _modifier_state_step(_actor: Node2D, ticks: float, context: Dictionary) -> void:
	if mods.has("M29"):
		_m29_state_calls += 1
		# Source root actor already decremented st2 before this hook.
		_m29.step_charge(get_native_modifier_state(), ticks, context, false)

func _m29_can_move(x: float, y: float, r: float) -> bool:
	return _binding_world.get_ref().can_move(Vector2(x, y), r)

func _m29_is_wall(x: float, y: float) -> bool:
	return _providers["is_tile_wall"].call(Vector2(x, y))

func _m29_element_multiplier(element_id: int) -> float:
	return float(_providers["element_multiplier"].call(element_id))

func _on_m29_event(event: Dictionary) -> void:
	var target = _target()
	var kind = str(event.get("kind", ""))
	if kind == "player_damage":
		# Exact single M29/M30 owners have no eModHitP effect. Keep hurtP's
		# ordinary accepted impulse and add the separate source KB afterwards.
		target.receive_damage(int(event["amount"]), "phys")
		target.apply_native_posthurt_knockback(event["knockback"])
	elif kind == "player_parry":
		if not _providers["handle_m29_parry"].call(self, target, event.duplicate(true)):
			_runtime_binding_error = "actual_M29_parry_consumer_rejected"
	if not _providers["emit_m29_event"].call(self, event.duplicate(true)):
		_runtime_binding_error = "actual_M29_FX_or_sound_consumer_rejected:" + kind
	telemetry_event.emit("type3_M29_" + kind, event.duplicate(true))

func _forward_modifier_event(kind: String, data: Dictionary) -> void:
	telemetry_event.emit(kind, data)

func get_snapshot() -> Dictionary:
	var snapshot = super.get_snapshot()
	var raw = get_native_modifier_state()
	snapshot["binding_configured"] = _binding_configured
	snapshot["binding_configuration_error"] = _binding_error
	snapshot["runtime_binding_error"] = _runtime_binding_error
	snapshot["stun_ticks"] = float(raw.get("stunned", 0.0))
	snapshot["frozen_ticks"] = float(raw.get("_frozen", 0.0))
	snapshot["hit_stun_ticks"] = float(raw.get("_hitStun", 0.0))
	snapshot["global_native_frame"] = _global_phase_frame
	snapshot["local_actor_native_frame"] = snapshot["native_frame"]
	snapshot["accepted_world_owner_phases"] = _accepted_owner_phases
	snapshot["M29_lock_calls"] = _m29_lock_calls
	snapshot["M29_trigger_calls"] = _m29_trigger_calls
	snapshot["M29_state_calls"] = _m29_state_calls
	snapshot["M30_native_calls"] = _m30_native_calls
	snapshot["M29_actual_required_capabilities"] = _m29_capability_receipt.duplicate(true)
	snapshot["M30_world_sibling"] = is_instance_valid(_m30) and _m30.get_parent() == _binding_world.get_ref()
	snapshot["native_flags"] = native_flags
	snapshot["source_global_frame_not_written_into_actor_clock"] = true
	snapshot["full_type7_actor_registered"] = false
	return snapshot
