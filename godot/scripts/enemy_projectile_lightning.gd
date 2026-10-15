class_name ExoduserLightningProjectile
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

# Exact ordinary EL.L projectile, not an ice/dark/physical visual alias.
# Originals are imported Texture2D resources. All render transforms are runtime.
static var _original_textures: Dictionary = {}
static var _comet_tint_shader: Shader
const ELECTRIC_COUNTER_NAME = "NativeElectricCounter"
var data: Dictionary = {}
var player: Node2D
var world: Node2D
var damage = 0
var life_ticks = 0.0
var heading = Vector2.RIGHT
var speed = 0.0
var distance_travelled = 0.0
var birth_position = Vector2.ZERO
var native_frame = 0.0
var _ended = false
var _sprite: Sprite2D
var _previous_player_position = Vector2.ZERO
var _visual_frame = 0
var _render_phase = 0.0
var _visible_render_count = 0
var _near_camera_extensions = 0
var _impact_textures: Array[Texture2D] = []

func configure(origin: Vector2, aim: Vector2, profile: Dictionary, target: Node2D, owner_world: Node2D, birth_frame: float = 0.0) -> void:
	data = profile.duplicate(true)
	position = origin
	birth_position = origin
	heading = aim.normalized()
	damage = int(data["contact_damage"])
	life_ticks = float(data["life_ticks"])
	speed = randf_range(float(data["speed_pixels_per_second"][0]), float(data["speed_pixels_per_second"][1]))
	player = target
	world = owner_world
	native_frame = birth_frame
	if is_instance_valid(player):
		_previous_player_position = player.global_position

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	# Player's idle dispatch precedes the projectile's post-hurtP append.
	process_physics_priority = 1
	var flight_texture = _original_texture(str(data["animation"]["texture"]))
	if flight_texture == null:
		_end("missing_original_lightning_texture")
		return
	# Preflight all required layers before creating any visual/status children.
	for layer in data["impact"]["layers"]:
		var original = _original_texture(str(layer["texture"]))
		if original == null:
			_end("missing_original_lightning_impact_texture")
			return
		_impact_textures.append(original)
	add_to_group("enemy_projectiles")
	add_to_group("lightning_enemy_projectiles")
	collision_layer = 8
	collision_mask = 0
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	z_as_relative = false
	z_index = clampi(int(global_position.y / 4.0) + 1, -2000, 4000)
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = float(data["radius"])
	shape.shape = circle
	add_child(shape)
	_sprite = Sprite2D.new()
	_sprite.name = "LightningCometFlight"
	_sprite.texture = flight_texture
	_sprite.region_enabled = true
	_sprite.region_filter_clip_enabled = true
	_sprite.centered = true
	_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	if _comet_tint_shader == null:
		_comet_tint_shader = Shader.new()
		_comet_tint_shader.code = "shader_type canvas_item;\nuniform vec4 element_tint : source_color;\nuniform float tint_alpha;\nvoid fragment(){ vec4 original = texture(TEXTURE, UV); COLOR = vec4(mix(original.rgb, element_tint.rgb, tint_alpha), original.a); }"
	var tint = ShaderMaterial.new()
	tint.shader = _comet_tint_shader
	tint.set_shader_parameter("element_tint", Color(str(data["animation"]["tint"]["color"])))
	tint.set_shader_parameter("tint_alpha", float(data["animation"]["tint"]["alpha"]))
	_sprite.material = tint
	add_child(_sprite)
	# Install one counter for the player's lifetime, before any possible hit.
	_ensure_electric_counter()
	_update_visual()

static func _original_texture(path: String) -> Texture2D:
	if not ResourceLoader.exists(path, "Texture2D"):
		push_error("Required packaged original lightning texture is missing: " + path)
		return null
	if _original_textures.has(path):
		return _original_textures[path]
	var original = ResourceLoader.load(path, "Texture2D") as Texture2D
	if original == null:
		push_error("Required packaged original lightning texture is unreadable: " + path)
		return null
	_original_textures[path] = original
	return original

func _physics_process(delta: float) -> void:
	if _ended:
		return
	var ticks = delta * 60.0
	native_frame += ticks
	var camera = get_viewport().get_camera_2d()
	if camera == null:
		_end("missing_native_camera")
		return
	# Camera cull -> life decay -> nonred near-camera life1 -> homing -> move.
	if global_position.distance_squared_to(camera.get_screen_center_position()) > pow(float(data["camera_cull_distance"]), 2.0):
		_end("camera_distance")
		return
	life_ticks -= ticks * float(data["life_decay_per_tick"])
	if life_ticks <= 0.0:
		life_ticks = float(data["expired_near_camera_life_ticks"])
		_near_camera_extensions += 1
	if is_instance_valid(player) and life_ticks > float(data["homing_until_life"]):
		var desired = (player.global_position - global_position).angle()
		var difference = wrapf(desired - heading.angle(), -PI, PI)
		var maximum_turn = float(data["homing_radians_per_tick"]) * ticks
		heading = Vector2.from_angle(heading.angle() + clampf(difference, -maximum_turn, maximum_turn))
	var before = global_position
	velocity = heading * speed
	global_position += velocity * delta
	distance_travelled += before.distance_to(global_position)
	z_index = clampi(int(global_position.y / 4.0) + 1, -2000, 4000)
	if is_instance_valid(world) and world.is_world_blocked(global_position):
		_end("wall")
		return
	if is_instance_valid(player):
		var current = player.global_position
		var distance = minf(_segment_distance(before, global_position, current), _segment_distance(before, global_position, _previous_player_position))
		var margin = float(player.get("radius")) + float(data["contact_margin"])
		# The literal movement-dash charge is excluded. KiSlash hold is windup.
		var accepts = float(player.get("iframes")) <= 0.0 and str(player.get("state")) != "charge"
		if distance < margin and accepts:
			var packet_direction = _packet_knockback_direction(current)
			player.receive_damage(damage, str(data["native_dtype"]), packet_direction, float(data["player_knockback_pixels_per_tick"]))
			_add_impact()
			# Native EL.L side effect follows hurtP even if its internal guard
			# rejected HP damage. It has no damage/movement/stun/poise effect.
			var counter = _ensure_electric_counter()
			var extended = false
			var electric_ticks = 0.0
			if counter != null:
				extended = counter.apply_native_electric(float(data["electric_timer"]["duration_ticks"]))
				electric_ticks = float(counter.get_snapshot()["electric_ticks"])
			telemetry_event.emit("enemy_projectile_hit", {"damage_request": damage, "native_dtype": data["native_dtype"], "element": data["element"], "parry_class": data["parry_class"], "distance": distance_travelled, "position": [global_position.x, global_position.y], "electric_extended": extended, "electric_ticks": electric_ticks, "redBean": false, "waterBean": false, "burn_appended": false})
			_end("player")
			return
		_previous_player_position = current

func _packet_knockback_direction(current_player_position: Vector2) -> Vector2:
	var direction = velocity
	if direction.length() <= 0.001:
		direction = current_player_position - global_position
	if direction.length() <= 0.001:
		return Vector2.DOWN
	return direction.normalized()

func _segment_distance(start: Vector2, end: Vector2, point: Vector2) -> float:
	var line = end - start
	if line.length_squared() <= 1.0:
		return end.distance_to(point)
	var progress = clampf((point - start).dot(line) / line.length_squared(), 0.0, 1.0)
	return (start + line * progress).distance_to(point)

func _process(_delta: float) -> void:
	if _ended or not is_instance_valid(_sprite) or not _comet_in_view():
		return
	# Native _sprFr advances by .12 on each visible render, not on a clock.
	_render_phase += float(data["animation"]["phase_increment_per_visible_render"])
	_visible_render_count += 1
	_update_visual()

func _comet_in_view() -> bool:
	if not is_visible_in_tree():
		return false
	var animation: Dictionary = data["animation"]
	var original_rect: Array = animation["draw_rect"]
	var local_rect = Rect2(float(original_rect[0]), float(original_rect[1]), float(original_rect[2]), float(original_rect[3]))
	var screen_transform = get_viewport().get_canvas_transform() * global_transform
	var first = screen_transform * local_rect.position.rotated(heading.angle())
	var screen_rect = Rect2(first, Vector2.ZERO)
	for corner in [Vector2(local_rect.end.x, local_rect.position.y), local_rect.end, Vector2(local_rect.position.x, local_rect.end.y)]:
		screen_rect = screen_rect.expand(screen_transform * corner.rotated(heading.angle()))
	return get_viewport_rect().intersects(screen_rect, true)

func _update_visual() -> void:
	if not is_instance_valid(_sprite):
		return
	var animation: Dictionary = data["animation"]
	var cell: Array = animation["cell_size"]
	_visual_frame = posmod(int(_render_phase), int(animation["flight_frames"]))
	_sprite.region_rect = Rect2(_visual_frame * float(cell[0]), 0.0, float(cell[0]), float(cell[1]))
	_sprite.scale = Vector2(float(animation["width"]) / float(cell[0]), float(animation["height"]) / float(cell[1]))
	_sprite.position = Vector2(float(animation["horizontal_center_offset_fraction"]) * float(animation["width"]), 0.0).rotated(heading.angle())
	_sprite.rotation = heading.angle()
	_sprite.modulate.a = 1.0

func _add_impact() -> void:
	if not is_instance_valid(world):
		return
	var impact = LightningImpact.new()
	impact.configure(global_position, data["impact"].duplicate(true), _impact_textures)
	world.add_child(impact)

func _ensure_electric_counter() -> NativeElectricCounter:
	if not is_instance_valid(player):
		return null
	var existing = player.get_node_or_null(ELECTRIC_COUNTER_NAME)
	if existing != null:
		if existing is NativeElectricCounter:
			return existing
		push_error("NativeElectricCounter name is occupied by an incompatible node")
		return null
	var counter = NativeElectricCounter.new()
	counter.name = ELECTRIC_COUNTER_NAME
	player.add_child(counter)
	return counter

func get_electric_snapshot() -> Dictionary:
	if not is_instance_valid(player):
		return {"electric_ticks": 0.0, "counter_present": false}
	var counter = player.get_node_or_null(ELECTRIC_COUNTER_NAME)
	if counter is NativeElectricCounter:
		return counter.get_snapshot()
	return {"electric_ticks": 0.0, "counter_present": false}

func _end(reason: String) -> void:
	if _ended:
		return
	_ended = true
	telemetry_event.emit("enemy_projectile_end", {"reason": reason, "life_ticks": life_ticks, "distance": distance_travelled, "parry_class": "magic", "element": "lightning", "near_camera_extensions": _near_camera_extensions})
	queue_free()

func get_snapshot() -> Dictionary:
	return {"damage": damage, "life_ticks": life_ticks, "speed": speed, "heading": [heading.x, heading.y], "position": [global_position.x, global_position.y], "native_frame": native_frame, "ended": _ended, "near_camera_extensions": _near_camera_extensions, "redBean": false, "blackBean": false, "blueBean": false, "gbBean": false, "waterBean": false, "fireMagic": false, "fromRainbow": false, "native_dtype": data["native_dtype"], "parry_class": data["parry_class"], "visual_frame": _visual_frame, "render_phase": _render_phase, "visible_render_count": _visible_render_count, "alpha": 1.0, "electric": get_electric_snapshot()}

class NativeElectricCounter extends Node:
	var _electric_ticks = 0.0
	var _idle_tick_signal_connected = false

	func _ready() -> void:
		process_mode = Node.PROCESS_MODE_PAUSABLE
		set_physics_process(false)
		set_process(false)
		var target = get_parent()
		if target != null and target.has_signal("native_idle_status_tick"):
			target.connect("native_idle_status_tick", _on_native_idle_status_tick)
			_idle_tick_signal_connected = true
		else:
			push_error("Native electric timer requires the read-only native_idle_status_tick signal")

	func apply_native_electric(duration_ticks: float) -> bool:
		var before = _electric_ticks
		_electric_ticks = maxf(_electric_ticks, duration_ticks)
		return _electric_ticks > before

	func _on_native_idle_status_tick(ticks: float) -> void:
		# Exact dispatch emitted after held auto-attack entry, before idle status
		# updates. No recover/stun -> idle fallthrough or artificial time setter.
		if _electric_ticks > 0.0:
			_electric_ticks -= ticks

	func get_snapshot() -> Dictionary:
		return {"electric_ticks": _electric_ticks, "counter_present": true, "idle_only": true, "clamp_zero": false, "idle_tick_signal_connected": _idle_tick_signal_connected, "legacy_zigzag_visual_ported": false}

class LightningImpact extends Node2D:
	var data: Dictionary = {}
	var age_ticks = 0.0
	var duration_ticks = 0.0
	var _layers: Array[Sprite2D] = []
	var _textures: Array[Texture2D] = []
	var _frames: Array[int] = []
	var _sizes: Array[float] = []
	var _alphas: Array[float] = []

	func configure(origin: Vector2, profile: Dictionary, originals: Array[Texture2D]) -> void:
		position = origin
		data = profile.duplicate(true)
		duration_ticks = maxf(66.0, float(data["requested_ticks"]))
		_textures.assign(originals)

	func _ready() -> void:
		process_mode = Node.PROCESS_MODE_PAUSABLE
		# Born during projectile update; its first age update is the next tick.
		process_physics_priority = 0
		add_to_group("lightning_impacts")
		z_as_relative = false
		z_index = clampi(int(global_position.y / 4.0) + 1, -2000, 4000)
		for index in data["layers"].size():
			var original = _textures[index]
			var sprite = Sprite2D.new()
			sprite.name = "LightningImpactLayer" + str(index + 1)
			sprite.texture = original
			sprite.region_enabled = true
			sprite.region_filter_clip_enabled = true
			sprite.centered = true
			sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
			add_child(sprite)
			_layers.append(sprite)
			_frames.append(0)
			_sizes.append(0.0)
			_alphas.append(0.0)
		_update_visual()

	func _physics_process(delta: float) -> void:
		age_ticks += delta * 60.0
		if age_ticks >= duration_ticks:
			queue_free()
			return
		_update_visual()

	func _update_visual() -> void:
		var progress = clampf(age_ticks / 66.0, 0.0, 1.0)
		for index in _layers.size():
			var layer: Dictionary = data["layers"][index]
			var phase = clampf(maxf(0.0, progress - float(layer["phase_delay_fraction"])) / float(layer["phase_rescale"]), 0.0, 1.0)
			var frame = mini(int(layer["frames"]) - 1, int(phase * int(layer["frames"])))
			var size = float(data["radius"]) * float(layer["size_multiplier"]) * sqrt(minf(1.0, phase * 3.0))
			var alpha = maxf(0.0, 1.0 - 0.5 * progress) * float(layer["alpha_multiplier"])
			var cell: Array = layer["cell_size"]
			var sprite = _layers[index]
			sprite.region_rect = Rect2((frame % int(layer["columns"])) * float(cell[0]), int(frame / int(layer["columns"])) * float(cell[1]), float(cell[0]), float(cell[1]))
			sprite.scale = Vector2(size / float(cell[0]), size / float(cell[1]))
			sprite.modulate.a = alpha
			_frames[index] = frame
			_sizes[index] = size
			_alphas[index] = alpha

	func get_snapshot() -> Dictionary:
		return {"age_ticks": age_ticks, "duration_ticks": duration_ticks, "position": [global_position.x, global_position.y], "frames": _frames.duplicate(), "sizes": _sizes.duplicate(), "alphas": _alphas.duplicate(), "world_sibling": true}
