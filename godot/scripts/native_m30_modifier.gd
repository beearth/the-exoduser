class_name ExoduserM30Modifier
extends Node2D

signal telemetry_event(kind: String, data: Dictionary)

# Owner-driven M30 only. This component does not admit an enemy, schedule AI,
# or share a global attack ticket. The owner passes its actual modT dictionary.
var _actor: Node2D
var _target: Node2D
var _world: Node2D
var _mod_state: Dictionary = {}
var _profile: Dictionary = {}
var _zones: Array[Dictionary] = []
var _configured = false
var _configuration_error = "not_configured"
var _pentagram: Texture2D
var _lava: Texture2D
var _render_now = 0.0
var _additive: AdditiveWarning

func configure(actor: Node2D, target: Node2D, world: Node2D, modifier_state: Dictionary, profile: Dictionary) -> bool:
	if _configured:
		return false
	if not is_instance_valid(actor) or not is_instance_valid(target) or not is_instance_valid(world):
		_configuration_error = "missing_owner_player_or_world"
		return false
	var mods: Variant = actor.get("mods")
	if not mods is Array or not mods.has("M30"):
		_configuration_error = "owner_missing_M30"
		return false
	if not modifier_state.has("eliteBusy") or not modifier_state.has("eliteRing"):
		_configuration_error = "missing_actual_modT_fields"
		return false
	for key in ["eliteBusy", "eliteRing"]:
		if not _finite_number(modifier_state[key]):
			_configuration_error = "invalid_modT_" + key
			return false
	if not _finite_number(actor.get("attack")):
		_configuration_error = "missing_public_owner_attack"
		return false
	if not target.has_method("receive_damage"):
		_configuration_error = "missing_public_player_damage_API"
		return false
	if not profile.has("warning") or not profile.has("lava") or not profile.has("native"):
		_configuration_error = "missing_M30_descriptor"
		return false
	if str(profile.get("schema", "")) != "exoduser.godot.native-M30-burst.v1":
		_configuration_error = "unsupported_M30_descriptor_schema"
		return false
	var native: Dictionary = profile["native"]
	var expected = {"eligibility_distance": 800.0, "accumulate_ticks": 480.0, "busy_ticks": 54.0, "warning_ticks": 54.0, "radius": 125.0, "damage_multiplier": 0.65}
	for key in expected:
		if not native.has(key) or not _finite_number(native[key]) or float(native[key]) != float(expected[key]):
			_configuration_error = "noncanonical_M30_" + key
			return false
	if str(native.get("color", "")) != "#ff2438":
		_configuration_error = "noncanonical_M30_color"
		return false
	var warning: Dictionary = profile["warning"]
	var lava_profile: Dictionary = profile["lava"]
	if not warning.has("texture") or not lava_profile.has("texture"):
		_configuration_error = "missing_required_texture_path"
		return false
	for key in ["frames", "frame_time", "base_alpha", "columns"]:
		if not lava_profile.has(key) or not _finite_number(lava_profile[key]):
			_configuration_error = "invalid_lava_" + key
			return false
	if float(lava_profile["frames"]) != 9.0 or float(lava_profile["frame_time"]) != 5.0 or float(lava_profile["base_alpha"]) != 0.85 or float(lava_profile["columns"]) != 3.0:
		_configuration_error = "noncanonical_lava_clock_or_grid"
		return false
	var cell: Variant = lava_profile.get("cell")
	if not cell is Array or cell.size() != 2 or not _finite_number(cell[0]) or not _finite_number(cell[1]) or float(cell[0]) != 768.0 or float(cell[1]) != 768.0:
		_configuration_error = "noncanonical_lava_cell"
		return false
	var penta = _load_original(str(warning["texture"]))
	var lava = _load_original(str(profile["lava"]["texture"]))
	if penta == null or lava == null:
		_configuration_error = "missing_required_original_texture"
		return false
	if str(warning["texture"]) != "res://assets/vfx/vfx_pentagram_red.png" or str(lava_profile["texture"]) != "res://assets/vfx/vfx_lava_erupt.png":
		_configuration_error = "noncanonical_original_texture_alias"
		return false
	# No owner state, timer, child, signal or registry mutation before preflight.
	_actor = actor
	_target = target
	_world = world
	_mod_state = modifier_state
	_profile = profile.duplicate(true)
	_pentagram = penta
	_lava = lava
	_configured = true
	_configuration_error = ""
	if is_node_ready():
		_build_additive_warning()
	return true

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	set_physics_process(false)
	set_process(false)
	z_as_relative = false
	if _configured:
		_build_additive_warning()

func _build_additive_warning() -> void:
	if is_instance_valid(_additive):
		return
	_additive = AdditiveWarning.new()
	_additive.name = "M30AdditiveWarning"
	_additive.kernel = self
	var blend = CanvasItemMaterial.new()
	blend.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	_additive.material = blend
	add_child(_additive)

static func _finite_number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _load_original(path: String) -> Texture2D:
	if not ResourceLoader.exists(path, "Texture2D"):
		push_error("Required packaged original M30 texture is missing: " + path)
		return null
	var original = ResourceLoader.load(path, "Texture2D") as Texture2D
	if original == null:
		push_error("Required packaged original M30 texture is unreadable: " + path)
	return original

func owns_modifier_state(value: Dictionary) -> bool:
	return is_same(_mod_state,value)

func is_owner_ready() -> bool:
	return _configured and is_instance_valid(_actor) and is_instance_valid(_target)

func advance_native(ticks: float, distance_to_player: float) -> void:
	_advance_modifier(ticks, distance_to_player, true)

func advance_owner_managed(ticks: float, distance_to_player: float) -> void:
	# EL-01 / G38798: caller already decremented the shared lock exactly once.
	_advance_modifier(ticks, distance_to_player, false)

func _advance_modifier(ticks: float, distance_to_player: float, tick_lock: bool) -> void:
	# Called once inside the owner's admitted mod block, after its existing
	# guards/tiering and before the far-unalerted return. No autonomous clock.
	if not _configured or not is_instance_valid(_actor) or not is_instance_valid(_target):
		return
	if not bool(_actor.get("alive")):
		return
	var mods: Variant = _actor.get("mods")
	if not mods is Array or mods.is_empty():
		return
	if tick_lock:
		_mod_state["eliteBusy"] = maxf(0.0, float(_mod_state["eliteBusy"]) - ticks)
	var native: Dictionary = _profile["native"]
	if mods.has("M30") and distance_to_player < float(native["eligibility_distance"]):
		_mod_state["eliteRing"] = float(_mod_state["eliteRing"]) + ticks
		if float(_mod_state["eliteRing"]) >= float(native["accumulate_ticks"]) and float(_mod_state["eliteBusy"]) <= 0.0:
			_mod_state["eliteBusy"] = float(native["busy_ticks"])
			_mod_state["eliteRing"] = 0.0
			var origin = _target.global_position
			var zone = {"x": origin.x, "y": origin.y, "r": float(native["radius"]), "t": float(native["warning_ticks"]), "dur": float(native["warning_ticks"]), "kind": "burst", "col": str(native["color"])}
			_zones.append(zone)
			telemetry_event.emit("M30_zone_birth", zone.duplicate(true))
	# Source reverse loop includes the just-born zone: sp1 ends t53/busy54.
	for index in range(_zones.size() - 1, -1, -1):
		var zone: Dictionary = _zones[index]
		zone["t"] = float(zone["t"]) - ticks
		if float(zone["t"]) <= 0.0:
			var origin = Vector2(float(zone["x"]), float(zone["y"]))
			var hit = _target.global_position.distance_to(origin) <= float(zone["r"])
			var requests_damage = hit and float(_target.get("iframes")) <= 0.0 and str(_target.get("state")) != "charge"
			var damage = maxi(1, int(float(_actor.get("attack")) * float(native["damage_multiplier"])))
			if requests_damage:
				# No added HP gate, element multiplier, or KB override. This preserves
				# the accepted shared hurtP path's own default knockback processing.
				_target.receive_damage(damage, "magic")
			_spawn_lava(zone)
			telemetry_event.emit("M30_zone_expired", {"position": [origin.x, origin.y], "radius": zone["r"], "damage_requested": requests_damage, "damage_request": damage, "dtype": "magic"})
			_zones.remove_at(index)
	queue_redraw()
	if is_instance_valid(_additive):
		_additive.queue_redraw()

func render_native(now: float) -> void:
	# Literal renderer-provided now drives pulse/spin; never native warning t.
	_render_now = now
	if not _configured:
		return
	if not _zones.is_empty():
		z_index = clampi(int(float(_zones[0]["y"]) / 4.0) + 1, -2000, 4000)
	queue_redraw()
	if is_instance_valid(_additive):
		_additive.queue_redraw()

func get_warning_recipe(index: int, now: float) -> Dictionary:
	if index < 0 or index >= _zones.size():
		return {}
	var zone: Dictionary = _zones[index]
	var radius = float(zone["r"])
	var duration = float(zone["dur"])
	if radius == 0.0 or duration == 0.0:
		return {}
	var q = clampf(1.0 - float(zone["t"]) / duration, 0.0, 1.0)
	var pulse = 0.5 + 0.5 * sin(now * 0.018)
	return {"position": [zone["x"], zone["y"]], "radius": radius, "q": q, "head": maxf(1.5, radius * q), "pulse": pulse, "spin": now * 0.0008, "col": zone["col"], "pentagram_rotation": now * 0.00028, "pentagram_alpha": 0.15 + q * 0.13, "pentagram_size": radius * 1.76, "source_over_outer_ticks": 20, "additive_progress_ticks": 12, "full_original_bitmap": true}

func _draw() -> void:
	if not _configured:
		return
	for index in _zones.size():
		var recipe = get_warning_recipe(index, _render_now)
		if recipe.is_empty():
			continue
		var center = to_local(Vector2(float(recipe["position"][0]), float(recipe["position"][1])))
		var radius = float(recipe["radius"])
		var pulse = float(recipe["pulse"])
		var spin = float(recipe["spin"])
		var col = Color(str(recipe["col"]))
		draw_set_transform(center, float(recipe["pentagram_rotation"]))
		var size = float(recipe["pentagram_size"])
		draw_texture_rect(_pentagram, Rect2(-size * 0.5, -size * 0.5, size, size), false, Color(1, 1, 1, float(recipe["pentagram_alpha"])))
		draw_set_transform(Vector2.ZERO)
		draw_circle(center, radius, _alpha(col, 0.15 + pulse * 0.05))
		draw_arc(center, radius - 1.0, 0, TAU, 128, _alpha(col, 0.82 + pulse * 0.12), 2.2 + pulse * 1.2, true)
		for i in 20:
			var angle = spin + TAU * float(i) / 20.0
			var length = 8.0 if i % 5 == 0 else 4.0
			draw_line(center + Vector2.from_angle(angle) * (radius - length), center + Vector2.from_angle(angle) * (radius + 1.0), _alpha(col, 0.70), 1.4, true)

static func _alpha(col: Color, value: float) -> Color:
	return Color(col.r, col.g, col.b, value)

func _spawn_lava(zone: Dictionary) -> void:
	if not is_instance_valid(_world):
		return
	var size = minf(float(zone["r"]) * 2.5, 360.0)
	var origin = Vector2(float(zone["x"]), float(zone["y"]) - size * 0.25)
	var effect = LavaEffect.new()
	effect.configure(origin, _profile["lava"].duplicate(true), _lava, size)
	_world.add_child(effect)
	telemetry_event.emit("M30_lava_birth", {"position": [origin.x, origin.y], "size": size, "frames": effect.max_frames, "frame_time": effect.frame_time, "owner_independent": true})

func get_snapshot() -> Dictionary:
	return {"configured": _configured, "configuration_error": _configuration_error, "modT": _mod_state.duplicate(true), "zones": _zones.duplicate(true), "own_physics_process": false, "own_global_game_clock": false, "render_now": _render_now, "global_attack_ticket": false, "etype7_admitted": false, "native_ancillary_particles_and_damage_text_ported": false, "global_VFX_pool_reuse_and_timed_branch_ported": false}

class AdditiveWarning extends Node2D:
	var kernel: ExoduserM30Modifier

	func _ready() -> void:
		process_mode = Node.PROCESS_MODE_PAUSABLE
		set_physics_process(false)
		set_process(false)

	func _draw() -> void:
		if not is_instance_valid(kernel):
			return
		for index in kernel._zones.size():
			var recipe = kernel.get_warning_recipe(index, kernel._render_now)
			if recipe.is_empty():
				continue
			var center = to_local(Vector2(float(recipe["position"][0]), float(recipe["position"][1])))
			var head = float(recipe["head"])
			var pulse = float(recipe["pulse"])
			var spin = float(recipe["spin"])
			var col = Color(str(recipe["col"]))
			draw_circle(center, head, ExoduserM30Modifier._alpha(col, 0.13 + pulse * 0.06))
			draw_arc(center, head, 0, TAU, 128, ExoduserM30Modifier._alpha(col, 0.22 + pulse * 0.12), 11.0, true)
			draw_arc(center, head, 0, TAU, 128, ExoduserM30Modifier._alpha(col, 0.86 + pulse * 0.12), 3.2 + pulse * 1.6, true)
			draw_arc(center, maxf(1.0, head - 7.0), 0, TAU, 128, ExoduserM30Modifier._alpha(col, 0.54), 1.2, true)
			for i in 12:
				var angle = spin + TAU * float(i) / 12.0
				draw_line(center + Vector2.from_angle(angle) * maxf(0.0, head - 3.0), center + Vector2.from_angle(angle) * (head + 6.0), ExoduserM30Modifier._alpha(col, 0.84), 1.5, true)
			var s = 5.0 + pulse * 2.0
			var diamond = PackedVector2Array([center + Vector2(0, -s), center + Vector2(s, 0), center + Vector2(0, s), center + Vector2(-s, 0), center + Vector2(0, -s)])
			draw_polyline(diamond, ExoduserM30Modifier._alpha(col, 0.95), 1.5, true)
			draw_circle(center, 2.2, ExoduserM30Modifier._alpha(col, 0.85))

class LavaEffect extends Node2D:
	var profile: Dictionary = {}
	var original: Texture2D
	var _configured_origin = Vector2.ZERO
	var frame = 0
	var max_frames = 9
	var frame_time = 5.0
	var t = 0.0
	var draw_size = 0.0
	var alpha = 0.85
	var ended = false
	var _sprite: Sprite2D
	var _draw_allowed = true

	func configure(origin: Vector2, descriptor: Dictionary, texture: Texture2D, size: float) -> void:
		_configured_origin = origin
		profile = descriptor.duplicate(true)
		original = texture
		max_frames = int(profile["frames"])
		frame_time = float(profile["frame_time"])
		draw_size = size
		frame = 0
		t = 0.0

	func _ready() -> void:
		process_mode = Node.PROCESS_MODE_PAUSABLE
		set_physics_process(false)
		add_to_group("M30_lava_effects")
		global_position = _configured_origin
		z_as_relative = false
		z_index = clampi(int(global_position.y / 4.0) + 1, -2000, 4000)
		var blend = CanvasItemMaterial.new()
		blend.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		material = blend
		if original != null:
			_build_sprite()

	func _build_sprite() -> void:
		if is_instance_valid(_sprite):
			return
		_sprite = Sprite2D.new()
		_sprite.name = "M30OriginalLava"
		_sprite.texture = original
		_sprite.region_enabled = true
		_sprite.region_filter_clip_enabled = true
		_sprite.centered = true
		_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		_sprite.use_parent_material = true
		add_child(_sprite)
		_update_visual()

	func _process(delta: float) -> void:
		advance_render(delta * 60.0, _draw_allowed)

	func advance_render(render_ticks: float, draw_allowed: bool = true) -> void:
		if ended:
			return
		if original == null:
			# Native missing-image branch retains the entry before advancing t.
			return
		if not is_instance_valid(_sprite) and is_node_ready():
			_build_sprite()
		t += render_ticks
		if t >= frame_time:
			t = 0.0
			frame += 1
		if frame >= max_frames:
			ended = true
			queue_free()
			return
		alpha = float(profile["base_alpha"]) * (1.0 - float(frame) / max_frames * 0.3)
		if alpha < 0.05:
			ended = true
			queue_free()
			return
		_draw_allowed = draw_allowed
		_update_visual()

	func _update_visual() -> void:
		if not is_instance_valid(_sprite):
			return
		var cell: Array = profile["cell"]
		var columns = int(profile["columns"])
		_sprite.region_rect = Rect2((frame % columns) * float(cell[0]), int(frame / columns) * float(cell[1]), float(cell[0]), float(cell[1]))
		_sprite.scale = Vector2(draw_size / float(cell[0]), draw_size / float(cell[1]))
		_sprite.modulate.a = alpha
		var screen = get_viewport().get_canvas_transform() * global_position
		var screen_scale = get_viewport().get_canvas_transform().get_scale().abs()
		var margin = Vector2(draw_size, draw_size) * screen_scale
		var view = get_viewport_rect()
		var in_view = screen.x >= view.position.x - margin.x and screen.x <= view.end.x + margin.x and screen.y >= view.position.y - margin.y and screen.y <= view.end.y + margin.y
		# Both culls follow the ordinary render clock, never its advance guard.
		_sprite.visible = _draw_allowed and in_view

	func get_snapshot() -> Dictionary:
		return {"position": [global_position.x, global_position.y], "configured_origin": [_configured_origin.x, _configured_origin.y], "frame": frame, "max_frames": max_frames, "t": t, "frame_time": frame_time, "draw_size": draw_size, "alpha": alpha, "ended": ended, "missing_texture": original == null, "draw_allowed": _draw_allowed, "visible": is_instance_valid(_sprite) and _sprite.visible, "own_physics_process": false, "owner_independent": true, "bornGameTime_timed_reuse_branch_ported": false, "global_VFX_pool_cap_or_budget_allocator_ported": false}
