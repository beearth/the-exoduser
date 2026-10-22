class_name ExoduserIceProjectile
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

# Only the exact water-bean source profile is admitted by EnemyFactory.
# Byte-identical original PNGs live inside res://assets/vfx. ResourceLoader
# consumes Godot import/export remaps rather than requiring external raw files.
static var _original_textures: Dictionary = {}
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
var _near_camera_extensions = 0

func configure(origin: Vector2, aim: Vector2, profile: Dictionary, target: Node2D, owner_world: Node2D, birth_frame: float = 0.0) -> void:
	data = profile.duplicate(true)
	position = origin
	birth_position = origin
	heading = aim.normalized()
	damage = int(data["contact_damage"])
	life_ticks = float(data["life_ticks"])
	# Native magic speed is sampled once at birth, not during flight.
	speed = randf_range(float(data["speed_pixels_per_second"][0]), float(data["speed_pixels_per_second"][1]))
	player = target
	world = owner_world
	native_frame = birth_frame
	if is_instance_valid(player):
		_previous_player_position = player.global_position

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	# Player's idle status clock precedes this projectile's posthit append.
	process_physics_priority = 1
	add_to_group("enemy_projectiles")
	add_to_group("ice_enemy_projectiles")
	collision_layer = 8
	collision_mask = 0
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	z_as_relative = false
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = float(data["radius"])
	shape.shape = circle
	add_child(shape)
	var original_texture = _original_texture(str(data["animation"]["texture"]))
	if original_texture == null:
		_end("missing_original_water_texture")
		return
	_sprite = Sprite2D.new()
	_sprite.name = "WaterFlight"
	_sprite.texture = original_texture
	_sprite.region_enabled = true
	_sprite.centered = true
	_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	var blend = CanvasItemMaterial.new()
	blend.blend_mode = CanvasItemMaterial.BLEND_MODE_MIX
	_sprite.material = blend
	add_child(_sprite)
	_update_visual()

static func _original_texture(path: String) -> Texture2D:
	if _original_textures.has(path):
		return _original_textures[path]
	if not ResourceLoader.exists(path, "Texture2D"):
		push_error("Required packaged original water texture is missing: " + path)
		return null
	var texture = ResourceLoader.load(path, "Texture2D") as Texture2D
	if texture == null:
		push_error("Required packaged original water texture is unreadable: " + path)
		return null
	_original_textures[path] = texture
	return texture

func _physics_process(delta: float) -> void:
	if _ended:
		return
	var ticks = delta * 60.0
	native_frame += ticks
	var camera = get_viewport().get_camera_2d()
	if camera == null:
		_end("missing_native_camera")
		return
	# Native order: camera cull, decay, nonred near-camera extension, homing,
	# movement, center-wall/swept player contact. Water fa remains one at life1.
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
		# Literal charge is movement dash, not the KiSlash windup/hold.
		var accepts = float(player.get("hp")) > 0.0 and float(player.get("iframes")) <= 0.0 and str(player.get("state")) != "charge"
		if distance < margin and accepts:
			player.receive_damage(damage, str(data["native_dtype"]), heading, float(data["player_knockback_pixels_per_tick"]))
			# Both original water side effects run independently after hurtP.
			_add_impact()
			var slow_extended: bool = player.apply_native_freeze_slow(float(data["freeze_slow"]["duration_ticks"]))
			telemetry_event.emit("enemy_projectile_hit", {"damage_request": damage, "native_dtype": data["native_dtype"], "element": data["element"], "parry_class": data["parry_class"], "waterBean": true, "distance": distance_travelled, "position": [global_position.x, global_position.y], "freeze_slow_extended": slow_extended, "freeze_slow_ticks": player.get_native_freeze_slow_ticks(), "burn_appended": false})
			_end("player")
			return
		_previous_player_position = current
	_update_visual()

func _segment_distance(start: Vector2, end: Vector2, point: Vector2) -> float:
	var line = end - start
	if line.length_squared() <= 1.0:
		return end.distance_to(point)
	var progress = clampf((point - start).dot(line) / line.length_squared(), 0.0, 1.0)
	return (start + line * progress).distance_to(point)

func _update_visual() -> void:
	if not _sprite or not _sprite.texture:
		return
	var animation: Dictionary = data["animation"]
	var cell_width = float(_sprite.texture.get_width()) / 4.0
	var cell_height = float(_sprite.texture.get_height()) / 2.0
	_visual_frame = int(fposmod(float(Time.get_ticks_msec()) * 0.012 + global_position.x * 0.04 + global_position.y * 0.025, 8.0))
	var row = 0 if _visual_frame < 4 else 1
	var crop_height = minf(cell_height - 1.0, cell_height * 0.255)
	var crop_y = minf(row * cell_height + cell_height * (0.10 if row else 0.675), row * cell_height + cell_height - crop_height)
	_sprite.region_rect = Rect2((_visual_frame % 4) * cell_width, crop_y, cell_width, crop_height)
	_sprite.scale = Vector2(float(animation["width"]) / cell_width, float(animation["height"]) / crop_height)
	# Native draw rect is horizontally offset -4% of the width before rotation.
	_sprite.position = Vector2(-float(animation["width"]) * 0.04, 0.0).rotated(heading.angle())
	_sprite.rotation = heading.angle()
	_sprite.modulate.a = 1.0

func _add_impact() -> void:
	if not is_instance_valid(world):
		return
	var impact = WaterImpact.new()
	impact.configure(global_position, data["impact"].duplicate(true), _original_texture(str(data["impact"]["texture"])))
	world.add_child(impact)

func _end(reason: String) -> void:
	if _ended:
		return
	_ended = true
	telemetry_event.emit("enemy_projectile_end", {"reason": reason, "life_ticks": life_ticks, "distance": distance_travelled, "parry_class": "magic", "waterBean": true, "near_camera_extensions": _near_camera_extensions})
	queue_free()

func get_snapshot() -> Dictionary:
	return {"damage": damage, "life_ticks": life_ticks, "speed": speed, "heading": [heading.x, heading.y], "position": [global_position.x, global_position.y], "native_frame": native_frame, "ended": _ended, "near_camera_extensions": _near_camera_extensions, "waterBean": true, "redBean": false, "blackBean": false, "blueBean": false, "fromRainbow": false, "native_dtype": data["native_dtype"], "parry_class": data["parry_class"], "visual_frame": _visual_frame, "visual_alpha": 1.0, "portable_export_dependency_packaged": bool(data["portable_export_dependency_packaged"])}

class WaterImpact extends Sprite2D:
	var data: Dictionary = {}
	var age_ticks = 0.0

	func configure(origin: Vector2, profile: Dictionary, original_texture: Texture2D) -> void:
		position = origin
		data = profile
		texture = original_texture

	func _ready() -> void:
		name = "WaterImpact"
		process_mode = Node.PROCESS_MODE_PAUSABLE
		add_to_group("water_impacts")
		region_enabled = true
		centered = true
		texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		z_as_relative = false
		z_index = clampi(int(global_position.y / 4.0) + 1, -2000, 4000)
		var blend = CanvasItemMaterial.new()
		blend.blend_mode = CanvasItemMaterial.BLEND_MODE_MIX
		material = blend
		_update_impact()

	func _physics_process(delta: float) -> void:
		age_ticks += delta * 60.0
		if age_ticks >= float(data["duration_ticks"]):
			queue_free()
			return
		_update_impact()

	func _update_impact() -> void:
		if texture == null:
			return
		var progress = clampf(age_ticks / float(data["duration_ticks"]), 0.0, 1.0)
		var frame = mini(15, int(progress * 16.0))
		var cell_width = float(texture.get_width()) / 4.0
		var cell_height = float(texture.get_height()) / 4.0
		region_rect = Rect2((frame % 4) * cell_width, floori(float(frame) / 4.0) * cell_height, cell_width, cell_height)
		var size = float(data["radius"]) * 3.0 * sqrt(minf(1.0, progress * 3.0))
		scale = Vector2(size / cell_width, size / cell_height)
		modulate.a = maxf(0.0, 1.0 - progress * 0.5)
