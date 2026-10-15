class_name ExoduserType7Teleport
extends Node2D

signal telemetry_event(kind: String, data: Dictionary)

# Caller assist only: no natural movement/summon/actor admission is added.
# Native AI and warning-queue phases are explicit; render continues in world.
var _actor: Node2D
var _target: Node2D
var _world: Node2D
var _state: Dictionary = {}
var _profile: Dictionary = {}
var _textures: Dictionary = {}
var _warnings: Array[Dictionary] = []
var _deliveries: Array[DeliveredPhysicalShot] = []
var _effects: Array[TPVisual] = []
var _configured = false
var _error = "not_configured"
var _draw_identity: Variant = null
var _last_idle: Dictionary = {}
var _font: SystemFont
var _render_now = 0.0
var _render_slow_factor = 1.0

func configure(actor: Node2D, target: Node2D, world: Node2D, state_ref: Dictionary, profile: Dictionary) -> bool:
	if _configured:
		return false
	if not is_instance_valid(actor) or not is_instance_valid(target) or not is_instance_valid(world):
		_error = "missing_actor_player_or_world"
		return false
	if not actor.has_method("get_snapshot") or not world.has_method("can_move") or not world.has_method("is_world_blocked"):
		_error = "missing_public_owner_snapshot_or_world_can_move"
		return false
	if not target.has_method("receive_damage") or not target.has_method("apply_native_posthurt_knockback") or not target.has_method("apply_native_burn"):
		_error = "missing_public_player_damage_or_additive_KB"
		return false
	if str(profile.get("schema", "")) != "exoduser.godot.native-type7-teleport.v1":
		_error = "invalid_descriptor_schema"
		return false
	if not profile.get("assets") is Array or not profile.get("queued_projectile") is Dictionary:
		_error = "missing_asset_or_queued_projectile_descriptor"
		return false
	for key in ["contact_damage", "life_ticks", "radius", "life_decay_per_tick", "homing_until_life", "homing_radians_per_tick", "contact_margin", "player_knockback_pixels_per_tick"]:
		if not _number(profile["queued_projectile"].get(key)):
			_error = "missing_finite_queued_projectile_" + key
			return false
	if not profile["queued_projectile"].get("speed_pixels_per_second") is Array or profile["queued_projectile"]["speed_pixels_per_second"].size() != 2:
		_error = "missing_queued_projectile_speed_range"
		return false
	for value in profile["queued_projectile"]["speed_pixels_per_second"]:
		if not _number(value):
			_error = "nonfinite_queued_projectile_speed"
			return false
	if not profile["queued_projectile"].get("animation") is Dictionary:
		_error = "missing_queued_projectile_animation"
		return false
	for key in ["width", "height"]:
		if not _number(profile["queued_projectile"]["animation"].get(key)):
			_error = "missing_queued_projectile_animation_" + key
			return false
	for key in ["native_dtype", "parry_class"]:
		if not profile["queued_projectile"].get(key) is String:
			_error = "missing_queued_projectile_" + key
			return false
	for key in ["teleportT", "teleportCd", "summonT", "_tpWarnT", "_tpWarnMax", "_tpWarnX", "_tpWarnY"]:
		if not state_ref.has(key) or not _number(state_ref[key]):
			_error = "missing_finite_native_state_" + key
			return false
	if not state_ref.has("_tpWarnCol"):
		_error = "missing_native_warning_color"
		return false
	for key in ["radius", "attack", "facing"]:
		if not _number(_field(actor, key)):
			_error = "missing_public_actor_" + key
			return false
	for key in ["radius", "iframes", "hp"]:
		if not _number(_field(target, key)):
			_error = "missing_public_player_" + key
			return false
	if not _field(actor, "alive") is bool:
		_error = "missing_public_actor_alive_bool"
		return false
	var actor_state: Variant = _field(actor, "state")
	if not actor_state is String and not actor_state is StringName:
		_error = "missing_public_actor_state_string"
		return false
	var target_state: Variant = _field(target, "state")
	if not target_state is String and not target_state is StringName:
		_error = "missing_public_player_state_string"
		return false
	var flags: Variant = _field(actor, "native_flags")
	if not flags is Dictionary or bool(flags.get("ib", false)) or bool(flags.get("_ch1StartMedium", false)):
		_error = "unsupported_boss_or_medium_shoot_eligibility_context"
		return false
	var mods: Variant = _field(actor, "mods")
	if not mods is Array or mods != ["M30"] or bool(flags.get("_iceOnHit", false)) or bool(flags.get("_lavaBurn", false)):
		_error = "unsupported_onhit_modifier_context"
		return false
	var status: Dictionary = actor.get_snapshot()
	if not _has_status_guards(status):
		_error = "missing_public_owner_stun_freeze_snapshot"
		return false
	var originals: Dictionary = {}
	var original_paths: Dictionary = {}
	for asset in profile["assets"]:
		if not asset is Dictionary or not asset.get("key") is String or not asset.get("resource") is String:
			_error = "invalid_required_asset_entry"
			return false
		if originals.has(str(asset["key"])):
			_error = "duplicate_required_asset_key:" + str(asset["key"])
			return false
		var path = str(asset["resource"])
		if not ResourceLoader.exists(path, "Texture2D"):
			_error = "missing_required_original_texture:" + path
			return false
		var original = ResourceLoader.load(path, "Texture2D") as Texture2D
		if original == null:
			_error = "unreadable_required_original_texture:" + path
			return false
		originals[str(asset["key"])] = original
		original_paths[str(asset["key"])] = path
	for key in ["smoke_out", "smoke_in", "impact", "burst", "shared_physical_mouth"]:
		if not originals.has(key):
			_error = "missing_required_original_asset_key:" + key
			return false
	if str(profile["queued_projectile"]["animation"].get("texture", "")) != str(original_paths["shared_physical_mouth"]):
		_error = "queued_projectile_texture_not_preflighted_original"
		return false
	# Full preflight precedes any source state, world children or HP mutation.
	_actor = actor
	_target = target
	_world = world
	_state = state_ref
	_profile = profile.duplicate(true)
	_textures = originals
	_configured = true
	_error = ""
	return true

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	set_physics_process(false)
	z_as_relative = false
	_font = SystemFont.new()
	_font.font_names = PackedStringArray(["Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"])
	_font.font_weight = 700

static func _field(value: Object, key: String) -> Variant:
	for field in value.get_property_list():
		if str(field["name"]) == key:
			return value.get(key)
	return null

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _has_status_guards(status: Dictionary) -> bool:
	return (status.has("stun_ticks") or status.has("stunned")) and (status.has("frozen_ticks") or status.has("_frozen"))

func _owner_status() -> Dictionary:
	if not is_instance_valid(_actor):
		return {"alive": false, "stun_ticks": 0.0, "frozen_ticks": 0.0}
	var source: Dictionary = _actor.get_snapshot()
	return {"alive": bool(_field(_actor, "alive")), "state": str(_field(_actor, "state")), "stun_ticks": float(source.get("stun_ticks", source.get("stunned", 0.0))), "frozen_ticks": float(source.get("frozen_ticks", source.get("_frozen", 0.0))), "hit_stun_ticks": float(source.get("hit_stun_ticks", 0.0)), "native_frame": source.get("native_frame", null)}

func _identity(provided: Variant) -> Variant:
	if provided != null:
		return provided
	if is_instance_valid(_world) and _world.has_method("get_enemies"):
		return _world.get_enemies()
	return null

static func _same_identity(a: Variant, b: Variant) -> bool:
	if a is Array or a is Dictionary or a is Object:
		return is_same(a, b)
	return a == b

func advance_idle(ticks: float, cached_distance: float, native_frame: float = -1.0, world_identity: Variant = null) -> Dictionary:
	var result = {"idle_consumed": false, "summon_due": false, "full_summon_consumer_ready": false, "full_type7_actor_registered": false}
	if not _configured or not is_instance_valid(_target):
		return result
	if not is_finite(ticks) or ticks <= 0.0 or not is_finite(cached_distance):
		result["caller_boundary_error"] = "invalid_native_ticks_or_cached_distance"
		return result
	var status = _owner_status()
	if not status["alive"] or status["state"] != "idle" or status["stun_ticks"] > 0.0 or status["frozen_ticks"] > 0.0 or status["hit_stun_ticks"] > 0.0:
		return result
	var frame = native_frame
	if frame < 0.0 and _number(status["native_frame"]):
		frame = float(status["native_frame"])
	var identity = _identity(world_identity)
	if not is_finite(frame) or frame < 0.0 or identity == null:
		result["caller_boundary_error"] = "missing_explicit_native_frame_or_logical_world_identity"
		return result
	_state["teleportT"] = float(_state["teleportT"]) - ticks
	_state["summonT"] = float(_state["summonT"]) - ticks
	result["idle_consumed"] = true
	_draw_identity = identity
	if float(_state["_tpWarnT"]) > 0.0:
		_state["_tpWarnT"] = float(_state["_tpWarnT"]) - ticks
		if float(_state["_tpWarnT"]) <= 0.0:
			var destination = Vector2(float(_state["_tpWarnX"]), float(_state["_tpWarnY"]))
			result["teleported"] = _complete_teleport(destination)
			_state["teleportT"] = float(_state["teleportCd"])
			_state["_tpWarnT"] = 0.0
			# Caller intentionally ignores teleportE's boolean when emitting.
			_queue_landing_shot(frame, identity)
	elif cached_distance < 100.0 and float(_state["teleportT"]) <= 0.0:
		var angle = randf() * TAU
		var distance = 150.0 + randf() * 50.0
		var destination = _target.global_position + Vector2.from_angle(angle) * distance
		if _world.can_move(destination, float(_field(_actor, "radius"))):
			_state["_tpWarnT"] = 120.0
			_state["_tpWarnMax"] = 120.0
			_state["_tpWarnX"] = destination.x
			_state["_tpWarnY"] = destination.y
			_state["_tpWarnCol"] = "#8833cc"
			result["warning_started"] = true
			telemetry_event.emit("type7_tp_warning_started", {"target": [destination.x, destination.y], "ticks": 120.0})
		else:
			_state["teleportT"] = 30.0
			result["target_invalid"] = true
	result["summon_due"] = float(_state["summonT"]) <= 0.0
	result["next_source_owner_phase"] = "If summon_due: original nearby query then eSummon40 or timer60; not implemented here"
	_last_idle = result.duplicate(true)
	queue_redraw()
	return result

func _complete_teleport(destination: Vector2) -> bool:
	var radius = float(_field(_actor, "radius"))
	if not _world.can_move(destination, radius):
		telemetry_event.emit("type7_tp_completion_blocked", {"target": [destination.x, destination.y]})
		return false
	var departure = _actor.global_position
	_spawn_effect("smoke_out", departure, radius * 4.0, 18.0)
	_actor.global_position = destination
	# Exact raw M30 owner has no eModHitP effect. Keep ordinary hurtP KB.
	var in_range = _target.global_position.distance_to(destination) < (radius + 10.0) * 2.0 + float(_field(_target, "radius"))
	if in_range and float(_field(_target, "iframes")) <= 0.0 and str(_field(_target, "state")) != "charge":
		var request = int(float(_field(_actor, "attack")) * 10.5)
		_target.receive_damage(request, "phys")
		var impulse = Vector2.from_angle((_target.global_position - destination).angle()) * 120.0
		_target.apply_native_posthurt_knockback(impulse)
		telemetry_event.emit("type7_tp_landing", {"damage_request": request, "additive_KB": [impulse.x, impulse.y], "eModHitP_M30_effect": false})
	_spawn_effect("impact", destination, radius * 4.0, 24.0)
	_spawn_effect("burst", destination, 64.0 * radius / 8.0, 0.0)
	_spawn_effect("smoke_in", destination, radius * 5.0, 22.0)
	_spawn_effect("bolt", departure, 0.0, 12.0, destination)
	_state["_tpFlashT"] = 12.0
	_state["_tpFlashCol"] = "#8833cc"
	telemetry_event.emit("type7_tp_completed", {"departure": [departure.x, departure.y], "arrival": [destination.x, destination.y]})
	return true

func _queue_landing_shot(frame: float, identity: Variant) -> void:
	var angle = (_target.global_position - _actor.global_position).angle()
	# Source uses ang||facing for mouth offset, but actual shot heading is ang.
	var mouth_angle = angle if angle != 0.0 else float(_field(_actor, "facing"))
	var center = _actor.global_position
	var origin = center + Vector2.from_angle(mouth_angle) * float(_field(_actor, "radius")) * 0.7
	var warning: Dictionary = {}
	for existing in _warnings:
		if existing["frame"] == frame and _same_identity(existing["world_identity"], identity):
			warning = existing
			break
	if warning.is_empty():
		var lane = 0
		for existing in _warnings:
			if _same_identity(existing["world_identity"], identity):
				lane += 1
		warning = {"frame": frame, "world_identity": identity, "t": 60.0, "dead": false, "x": center.x, "y": center.y, "r": float(_field(_actor, "radius")) + lane * 8.0, "parry_class": "physical", "col": "#f4f4f4", "shots": []}
		_warnings.append(warning)
	warning["shots"].append({"origin": origin, "heading": Vector2.from_angle(angle)})
	telemetry_event.emit("type7_shot_warning_birth", {"t": 60.0, "origin": [origin.x, origin.y], "heading": [cos(angle), sin(angle)], "radius": warning["r"], "frame": frame})

func advance_shot_warnings(ticks: float, native_frame: float, current_world_identity: Variant) -> void:
	if not _configured or current_world_identity == null or not is_finite(ticks) or ticks <= 0.0 or not is_finite(native_frame) or native_frame < 0.0:
		return
	_draw_identity = current_world_identity
	var status = _owner_status()
	var survivors: Array[Dictionary] = []
	for warning in _warnings:
		var cancelled = not _same_identity(warning["world_identity"], current_world_identity) or not status["alive"] or status["stun_ticks"] > 0.0 or status["frozen_ticks"] > 0.0
		if cancelled:
			telemetry_event.emit("type7_shot_warning_cancel", {"world_changed": not _same_identity(warning["world_identity"], current_world_identity), "alive": status["alive"], "stun_ticks": status["stun_ticks"], "frozen_ticks": status["frozen_ticks"]})
			continue
		warning["t"] = float(warning["t"]) - ticks
		if float(warning["t"]) > 0.0:
			survivors.append(warning)
			continue
		var displacement = _actor.global_position - Vector2(float(warning["x"]), float(warning["y"]))
		for shot in warning["shots"]:
			_deliver_shot(shot["origin"] + displacement, shot["heading"], ticks, native_frame)
	_warnings = survivors
	queue_redraw()

func _deliver_shot(global_origin: Vector2, heading: Vector2, ticks: float, native_frame: float) -> void:
	var shot = DeliveredPhysicalShot.new()
	# The shared shot increments its local clock before consuming a phase. Seed
	# it one phase earlier so the explicit birth phase renders this global frame.
	shot.configure(_world.to_local(global_origin), heading, _profile["queued_projectile"], _target, _world, native_frame - ticks)
	shot.birth_position = global_origin
	shot.bridge_global_origin = global_origin
	shot.release_native_frame = native_frame
	shot.set_physics_process(false)
	shot.telemetry_event.connect(_forward_event)
	_world.add_child(shot)
	shot.set_physics_process(false)
	shot.consume_birth_phase(ticks)
	_deliveries.append(shot)
	if not shot.is_queued_for_deletion():
		shot.call_deferred("set_physics_process", true)
	telemetry_event.emit("type7_shot_delivered", shot.get_bridge_snapshot())

func _forward_event(kind: String, data: Dictionary) -> void:
	telemetry_event.emit(kind, data)

func _spawn_effect(kind: String, origin: Vector2, size: float, duration: float, end: Vector2 = Vector2.ZERO) -> void:
	var group = "type7_tp_" + ("smokes" if kind.begins_with("smoke") else "impacts" if kind == "impact" else "bolts" if kind == "bolt" else "bursts")
	var cap = 10 if kind.begins_with("smoke") else 12 if kind == "impact" else 8 if kind == "bolt" else -1
	var slots: Array[TPVisual] = []
	if is_inside_tree():
		for node in get_tree().get_nodes_in_group(group):
			if node is TPVisual and node.world_instance == _world.get_instance_id():
				slots.append(node)
	var effect: TPVisual
	for node in slots:
		if not node.active:
			effect = node
			break
	if effect == null and cap > 0 and slots.size() >= cap:
		effect = slots[0]
		var oldest = 0.0
		for node in slots:
			var progress = node.t / node.duration if node.duration > 0.0 else 0.0
			if progress > oldest:
				oldest = progress
				effect = node
	var fresh = effect == null
	if fresh:
		effect = TPVisual.new()
	effect.configure(kind, origin, end, size, duration, _textures.get(kind), _world.get_instance_id(), cap > 0)
	# A reused per-world slot belongs to one render driver at a time. Older
	# controllers can retain read-only observations, but must not age it twice.
	effect.render_driver_instance = get_instance_id()
	if fresh:
		_world.add_child(effect)
		effect.add_to_group(group)
	if not _effects.has(effect):
		_effects.append(effect)

func _process(delta: float) -> void:
	advance_render(delta * 60.0, float(Time.get_ticks_msec()), _render_slow_factor)

func advance_render(render_ticks: float, now: float, source_slow_factor: float = 1.0) -> void:
	_render_now = now
	_render_slow_factor = source_slow_factor
	# VFX stays world-independent even if the source owner is dead/freed.
	for effect in _effects:
		if is_instance_valid(effect) and effect.render_driver_instance == get_instance_id():
			effect.advance_render(render_ticks, now, source_slow_factor)
	if is_instance_valid(_actor):
		z_index = clampi(int(_actor.global_position.y / 4.0) + 1, -2000, 4000)
	queue_redraw()

func get_queue_warning_recipe(index: int) -> Dictionary:
	if index < 0 or index >= _warnings.size():
		return {}
	var warning: Dictionary = _warnings[index]
	var match = _same_identity(warning["world_identity"], _draw_identity)
	var center = _actor.global_position if is_instance_valid(_actor) else Vector2(float(warning["x"]), float(warning["y"]))
	var progress = clampf(1.0 - float(warning["t"]) / 60.0, 0.0, 1.0)
	return {"world_match": match, "origin": [center.x, center.y], "warning_radius": warning["r"], "ring_radius": float(warning["r"]) + 10.0, "progress": progress, "background_color": "#080808", "background_width": 5.0, "background_alpha": 0.28, "arc_start": -PI / 2.0, "arc_end": -PI / 2.0 + TAU * progress, "arc_color": "#ffffff", "arc_width": 6.0, "arc_alpha": 1.0, "round_cap": true, "label": "물리탄 차징 · E로 패링", "label_center_y": center.y - float(warning["r"]) - 25.0, "preteleport_circle": false, "full_Q_E_parry_ported": false}

func _draw() -> void:
	if not _configured or _font == null:
		return
	for index in _warnings.size():
		var recipe = get_queue_warning_recipe(index)
		if not recipe.get("world_match", false):
			continue
		var center = to_local(Vector2(float(recipe["origin"][0]), float(recipe["origin"][1])))
		var radius = float(recipe["ring_radius"])
		draw_arc(center, radius, 0, TAU, 128, Color(8.0/255, 8.0/255, 8.0/255, 0.28), 5.0, true)
		if float(recipe["progress"]) > 0.0:
			var start = float(recipe["arc_start"])
			var end = float(recipe["arc_end"])
			draw_arc(center, radius, start, end, 128, Color.WHITE, 6.0, true)
			draw_circle(center + Vector2.from_angle(start) * radius, 3.0, Color.WHITE)
			draw_circle(center + Vector2.from_angle(end) * radius, 3.0, Color.WHITE)
		var label: String = recipe["label"]
		var width = _font.get_string_size(label, HORIZONTAL_ALIGNMENT_LEFT, -1, 13).x
		var label_center = to_local(Vector2(float(recipe["origin"][0]), float(recipe["label_center_y"])))
		var rect = Rect2(label_center - Vector2((width + 14.0) * 0.5, 10.0), Vector2(width + 14.0, 20.0))
		draw_rect(rect, Color(5.0/255, 8.0/255, 13.0/255, 0.92))
		draw_rect(rect, Color("#f4f4f4"), false, 1.5)
		var baseline = label_center.y + (_font.get_ascent(13) - _font.get_descent(13)) * 0.5
		draw_string(_font, Vector2(label_center.x - width * 0.5, baseline), label, HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color.WHITE)

func get_delivery_snapshots() -> Array[Dictionary]:
	var values: Array[Dictionary] = []
	for shot in _deliveries:
		if is_instance_valid(shot):
			values.append(shot.get_bridge_snapshot())
	return values

func get_effect_snapshots() -> Array[Dictionary]:
	var values: Array[Dictionary] = []
	for effect in _effects:
		if is_instance_valid(effect):
			values.append(effect.get_snapshot())
	return values

func get_snapshot() -> Dictionary:
	var warnings: Array[Dictionary] = []
	for index in _warnings.size():
		var w: Dictionary = _warnings[index]
		warnings.append({"t": w["t"], "frame": w["frame"], "r": w["r"], "position_at_birth": [w["x"], w["y"]], "shots": w["shots"].duplicate(true), "recipe": get_queue_warning_recipe(index)})
	return {"configured": _configured, "configuration_error": _error, "native_state": _state.duplicate(true), "warnings": warnings, "last_idle": _last_idle.duplicate(true), "deliveries": get_delivery_snapshots(), "effects": get_effect_snapshots(), "own_physics": false, "render_process_only": true, "render_driver_is_world_sibling": is_instance_valid(_world) and get_parent() == _world, "full_movement_or_summon_ported": false, "etype7_actor_registered": false, "world_generation_and_global_frame_binding_requires_actual_caller": true, "snapshot_frame_fallback_not_global_clock_proof": true, "fallback_enemy_array_identity_stability_requires_actual_caller": true, "shared_physical_kernel_full_camera_sweep_HPguard_parity_reaudited": false, "particle_light_shake_label_tpFlash_body_consumer_ported": false, "full_Q_E_parry_ported": false, "font_pixel_quality_reviewed": false}

class DeliveredPhysicalShot extends ExoduserPhysicalProjectile:
	var bridge_global_origin = Vector2.ZERO
	var release_native_frame = 0.0
	var birth_explicit_phase_calls = 0
	var auto_physics_calls = 0
	var explicit_native_ticks = 0.0
	var birth_prephase: Dictionary = {}

	func consume_birth_phase(ticks: float) -> void:
		if birth_explicit_phase_calls != 0:
			return
		birth_prephase = {"native_frame": native_frame, "release_native_frame": release_native_frame, "life_ticks": life_ticks, "global_position": [global_position.x, global_position.y], "local_position": [position.x, position.y], "birth_explicit_phase_calls": birth_explicit_phase_calls, "auto_physics_calls": auto_physics_calls}
		birth_explicit_phase_calls += 1
		explicit_native_ticks = ticks
		super._physics_process(ticks / 60.0)

	func _physics_process(delta: float) -> void:
		auto_physics_calls += 1
		super._physics_process(delta)

	func get_bridge_snapshot() -> Dictionary:
		return {"damage": damage, "life_ticks": life_ticks, "global_position": [global_position.x, global_position.y], "local_position": [position.x, position.y], "birth_position_global": [birth_position.x, birth_position.y], "configured_global_origin": [bridge_global_origin.x, bridge_global_origin.y], "heading": [heading.x, heading.y], "native_frame": native_frame, "release_native_frame": release_native_frame, "distance_travelled": distance_travelled, "speed": speed, "birth_prephase": birth_prephase.duplicate(true), "birth_explicit_phase_calls": birth_explicit_phase_calls, "explicit_native_ticks": explicit_native_ticks, "auto_physics_calls": auto_physics_calls, "owner_independent": true}

class TPVisual extends Node2D:
	var kind = ""
	var origin = Vector2.ZERO
	var endpoint = Vector2.ZERO
	var initial_size = 0.0
	var draw_size = 0.0
	var duration = 0.0
	var t = 0.0
	var frame = 0
	var frame_t = 0.0
	var alpha = 0.0
	var visual_rotation = 0.0
	var initial_rotation = 0.0
	var world_instance = 0
	var render_driver_instance = 0
	var active = false
	var persistent_pool = false
	var original: Texture2D
	var segments = PackedVector2Array()
	var branches: Array[PackedVector2Array] = []
	var now_value = 0.0
	var _sprite: Sprite2D

	func configure(mode: String, start: Vector2, end: Vector2, size: float, lifetime: float, image: Texture2D, world_id: int, pooled: bool) -> void:
		kind = mode
		origin = start
		endpoint = end
		initial_size = size
		draw_size = size
		duration = lifetime
		original = image
		world_instance = world_id
		persistent_pool = pooled
		t = 0.0
		frame = 0
		frame_t = 0.0
		active = true
		initial_rotation = randf() * TAU if kind.begins_with("smoke") else 0.0
		segments = PackedVector2Array()
		branches.clear()
		if kind == "bolt":
			var count = 6 + int(randf() * 4.0)
			segments.append(start)
			var step = (end - start) / count
			var perpendicular = (end - start).angle() + PI / 2.0
			for i in range(1, count):
				var offset = 20.0 + randf() * 15.0
				segments.append(start + step * i + Vector2(cos(perpendicular) * (offset if randf() > 0.5 else -offset), sin(perpendicular) * (offset if randf() > 0.5 else -offset)))
			segments.append(end)
		if is_node_ready():
			global_position = origin
			z_index = clampi(int(origin.y / 4.0) + 1, -2000, 4000)
			_prepare_sprite()
		visible = true

	func _ready() -> void:
		process_mode = Node.PROCESS_MODE_PAUSABLE
		set_process(false)
		set_physics_process(false)
		global_position = origin
		z_as_relative = false
		z_index = clampi(int(origin.y / 4.0) + 1, -2000, 4000)
		var blend = CanvasItemMaterial.new()
		blend.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		material = blend
		_prepare_sprite()

	func _prepare_sprite() -> void:
		if original != null and not is_instance_valid(_sprite):
			_sprite = Sprite2D.new()
			_sprite.name = "OriginalTPTexture"
			_sprite.centered = true
			_sprite.region_enabled = kind in ["impact", "burst"]
			_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
			_sprite.use_parent_material = true
			add_child(_sprite)
		if is_instance_valid(_sprite):
			_sprite.texture = original
			_sprite.region_enabled = kind in ["impact", "burst"]
			# Source impact draws its bitmap first and the central glow afterward.
			_sprite.show_behind_parent = kind == "impact"
			_sprite.visible = false

	func advance_render(render_ticks: float, now: float, slow_factor: float = 1.0) -> void:
		if not active:
			return
		now_value = now
		var local_ticks = render_ticks * slow_factor
		if kind == "burst":
			if original == null:
				return
			frame_t += render_ticks
			if frame_t >= 4.0:
				frame_t = 0.0
				frame += 1
			if frame >= 9:
				_expire()
				return
			alpha = 1.0 - 0.3 * frame / 9.0
		elif kind == "impact":
			if original == null or original.get_width() <= 0:
				return
			t += local_ticks
			if t >= duration:
				_expire()
				return
			var p = t / duration
			frame = mini(3, int(p * 4.0))
			draw_size = initial_size * (0.6 + p * 0.6)
			alpha = maxf(0.0, 1.0 - p * p)
		else:
			# Smoke clock precedes image readiness; bolt has no texture guard.
			t += local_ticks
			if t >= duration:
				_expire()
				return
			var p = t / duration
			if kind == "smoke_out":
				draw_size = initial_size * (1.0 + 1.8 * p)
				alpha = maxf(0.0, (1.0 - p * p) * 0.85)
				visual_rotation = initial_rotation + 1.5 * p
			elif kind == "smoke_in":
				draw_size = initial_size * maxf(0.6, 2.2 - 1.6 * p)
				alpha = (p / 0.4 if p < 0.4 else maxf(0.0, 1.0 - (p - 0.4) / 0.6)) * 0.9
				visual_rotation = initial_rotation - 1.2 * p
			else:
				alpha = 1.0 - p * p
				branches.clear()
				var angle = (endpoint - origin).angle()
				for i in range(1, segments.size() - 1):
					if randf() > 0.5:
						continue
					var branch_angle = angle + (1.0 if randf() > 0.5 else -1.0) * (0.5 + randf() * 0.8)
					var length = 15.0 + randf() * 20.0
					branches.append(PackedVector2Array([segments[i], segments[i] + Vector2.from_angle(branch_angle) * length]))
		_update_sprite()
		queue_redraw()

	func _expire() -> void:
		active = false
		visible = false
		if not persistent_pool:
			queue_free()

	func _update_sprite() -> void:
		if not is_instance_valid(_sprite) or original == null:
			return
		_sprite.visible = true
		if kind == "impact":
			_sprite.region_rect = Rect2((frame % 2) * 200, int(frame / 2) * 200, 200, 200)
		elif kind == "burst":
			_sprite.region_rect = Rect2(frame * 64, 0, 64, 64)
		var cell = Vector2(200, 200) if kind == "impact" else Vector2(64, 64)
		_sprite.scale = Vector2(draw_size, draw_size) / cell
		_sprite.rotation = visual_rotation
		_sprite.modulate.a = alpha

	func _draw() -> void:
		if not active:
			return
		var col = Color("#8833cc")
		if kind == "impact" and original != null and t / duration < 0.5:
			draw_circle(Vector2.ZERO, draw_size * 0.2, Color(col.r, col.g, col.b, 0.5 * (1.0 - 2.0 * t / duration)))
		elif kind == "bolt" and segments.size() >= 2:
			var points = PackedVector2Array()
			for point in segments:
				points.append(to_local(point))
			_draw_round_polyline(points, Color(col.r, col.g, col.b, alpha * 0.35), 8.0 + sin(now_value * 0.5) * 2.0)
			_draw_round_polyline(points, Color(1, 1, 1, alpha * 0.8), 2.0 + alpha * 2.0)
			for branch in branches:
				_draw_round_polyline(PackedVector2Array([to_local(branch[0]), to_local(branch[1])]), Color(col.r, col.g, col.b, alpha * 0.4), 1.5)

	func _draw_round_polyline(points: PackedVector2Array, color: Color, width: float) -> void:
		draw_polyline(points, color, width, true)
		draw_circle(points[0], width * 0.5, color)
		draw_circle(points[points.size() - 1], width * 0.5, color)

	func get_snapshot() -> Dictionary:
		return {"kind": kind, "origin": [origin.x, origin.y], "global_position": [global_position.x, global_position.y], "endpoint": [endpoint.x, endpoint.y], "active": active, "persistent_pool": persistent_pool, "world_instance": world_instance, "render_driver_instance": render_driver_instance, "t": t, "duration": duration, "frame": frame, "frame_t": frame_t, "initial_size": initial_size, "draw_size": draw_size, "alpha": alpha, "initial_rotation": initial_rotation, "visual_rotation": visual_rotation, "image_ready": original != null, "segments": segments.duplicate(), "branches": branches.duplicate(true), "clock_native_physics": false, "owner_independent": true}
