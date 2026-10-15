class_name ExoduserHolyProjectile
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

# Exact type3 charged holy branch. Shared source Fx must be real and ready.
# A sampled scalar speed is supplied by the owner; this kernel never owns RNG.
const ELEMENT = "holy"
const ELEMENT_ID = 5
const DARK_BALL = false
const SOURCE_SIZE = 3.0
var data: Dictionary = {}
var player: Node2D
var world: Node2D
var damage = 0
var life_ticks = 0.0
var heading = Vector2.RIGHT
var speed = 0.0
var native_frame = 0.0
var birth_position = Vector2.ZERO
var distance_travelled = 0.0
var _previous_player_position = Vector2.ZERO
var _configured = false
var _ended = false
var _last_error = "not_configured"
var _near_camera_extensions = 0
const ORIGINAL_COMET = "res://assets/vfx/proj_bolt_comet.png"
var _texture: Texture2D
var _sprite: Sprite2D
var _sprite_frame = 0.0
var _comet_seen = false
var _first_glow_on = false

func configure(origin: Vector2, aim: Vector2, profile: Dictionary, target: Node2D, owner_world: Node2D, birth_frame: float = 0.0) -> bool:
	if _configured or not origin.is_finite() or not aim.is_finite() or aim.length_squared() <= 0.0 or not is_finite(birth_frame):
		return _reject("invalid_birth")
	if not is_instance_valid(target) or not is_instance_valid(owner_world) or not target.has_method("receive_damage") or not owner_world.has_method("is_world_blocked"):
		return _reject("missing_native_target_or_world")
	if not owner_world.has_method("supports_native_projectile_hit_fx") or not owner_world.has_method("emit_native_projectile_hit_fx") or not owner_world.has_method("get_native_projectile_fx_context"):
		return _reject("missing_required_world_hit_fx")
	if owner_world.supports_native_projectile_hit_fx(ELEMENT, DARK_BALL) != true:
		return _reject("required_world_hit_fx_not_supported")
	if not DARK_BALL and not target.has_method("get_native_element_multiplier"):
		return _reject("missing_native_element_multiplier")
	if profile.get("element") != ELEMENT or profile.get("parry_class") != "magic" or profile.get("native_dtype") != "magic":
		return _reject("wrong_source_identity")
	for flag in ["redBean", "blackBean", "waterBean", "blueBean", "friendly"]:
		if profile.get(flag, false) != false:
			return _reject("foreign_projectile_flag_" + flag)
	if profile.get("gbBean", false) != DARK_BALL or profile.get("fireMagic", false) != (ELEMENT == "fire"):
		return _reject("wrong_native_bean_identity")
	for key in ["base_damage", "life_ticks", "size", "speed_pixels_per_second"]:
		if not _number(profile.get(key)):
			return _reject("missing_finite_" + key)
	if float(profile["base_damage"]) < 1.0 or float(profile["base_damage"]) != floor(float(profile["base_damage"])) or float(profile["life_ticks"]) != 60.0 or float(profile["size"]) != SOURCE_SIZE:
		return _reject("unsupported_charged_source_profile")
	if float(profile["speed_pixels_per_second"]) < 500.0 or float(profile["speed_pixels_per_second"]) > 600.0:
		return _reject("missing_sampled_magic_speed")
	if not ResourceLoader.exists(ORIGINAL_COMET, "Texture2D"):
		return _reject("missing_original_comet")
	_texture = ResourceLoader.load(ORIGINAL_COMET, "Texture2D") as Texture2D
	if _texture == null:
		return _reject("unreadable_original_comet")
	data = profile.duplicate(true)
	player = target
	world = owner_world
	position = origin
	birth_position = origin
	heading = aim.normalized()
	damage = int(profile["base_damage"])
	life_ticks = 60.0
	speed = float(profile["speed_pixels_per_second"])
	native_frame = birth_frame
	_previous_player_position = player.global_position
	_configured = true
	_last_error = ""
	return true

func _ready() -> void:
	if not _configured:
		_end("unconfigured")
		return
	process_mode = Node.PROCESS_MODE_PAUSABLE
	process_physics_priority = 1
	add_to_group("enemy_projectiles")
	add_to_group(ELEMENT + "_enemy_projectiles")
	collision_layer = 8
	collision_mask = 0
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	z_as_relative = false
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = 5.2
	shape.shape = circle
	add_child(shape)
	var glow_blend = CanvasItemMaterial.new()
	glow_blend.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	material = glow_blend
	_sprite = Sprite2D.new()
	_sprite.name = ELEMENT.capitalize() + "NativeComet"
	_sprite.texture = _texture
	_sprite.region_enabled = true
	_sprite.centered = true
	_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	var shader = Shader.new()
	shader.code = "shader_type canvas_item; uniform vec4 element_color : source_color; void fragment(){ vec4 original = texture(TEXTURE, UV); COLOR = vec4(mix(original.rgb, element_color.rgb, 0.65), original.a); }"
	var tint = ShaderMaterial.new()
	tint.shader = shader
	tint.set_shader_parameter("element_color", Color("#ff88cc"))
	_sprite.material = tint
	add_child(_sprite)
	_update_visual()

func _physics_process(delta: float) -> void:
	if not _configured or _ended:
		return
	if not is_instance_valid(world) or not is_instance_valid(player):
		_end("world_or_target_ended")
		return
	var ticks = delta * 60.0
	native_frame += ticks
	var camera = get_viewport().get_camera_2d()
	if camera == null:
		_end("missing_native_camera")
		return
	# C7 common camera cull precedes decay and the nonred near-camera life1 extension.
	if global_position.distance_squared_to(camera.global_position) > 6250000.0:
		_end("camera_distance")
		return
	life_ticks -= ticks * 0.667
	if life_ticks <= 0.0:
		life_ticks = 1.0
		_near_camera_extensions += 1
	if life_ticks > 30.0:
		var desired = (player.global_position - global_position).angle()
		var difference = wrapf(desired - heading.angle(), -PI, PI)
		heading = Vector2.from_angle(heading.angle() + clampf(difference, -0.00655 * ticks, 0.00655 * ticks))
	var before = global_position
	velocity = heading * speed
	global_position += velocity * delta
	distance_travelled += before.distance_to(global_position)
	z_index = clampi(int(global_position.y / 4.0) + 1, -2000, 4000)
	if world.is_world_blocked(global_position):
		# Source addParts(...,1) truncates to zero and makes no blastlight.
		_end("wall")
		return
	var current = player.global_position
	var distance = minf(_segment_distance(before, global_position, current), _segment_distance(before, global_position, _previous_player_position))
	var accepts = float(player.get("iframes")) <= 0.0
	if not DARK_BALL:
		accepts = accepts and str(player.get("state")) != "charge"
	if distance < float(player.get("radius")) + SOURCE_SIZE * 3.0 + 4.0 and accepts:
		var multiplier = float(player.get_native_element_multiplier(ELEMENT_ID))
		if not is_finite(multiplier) or multiplier <= 0.0:
			_end("invalid_native_element_multiplier")
			return
		var contact_damage = int(damage * multiplier)
		player.receive_damage(contact_damage, "magic", heading, 2.0)
		# Source producer follows hurtP even if its internal HP/iframe gate rejects it.
		world.emit_native_projectile_hit_fx({"element": ELEMENT, "element_id": ELEMENT_ID, "position": global_position, "target_position": player.global_position, "dark_ball": DARK_BALL, "redBean": false})
		telemetry_event.emit("enemy_projectile_hit", {"damage_request": contact_damage, "base_damage": damage, "native_dtype": "magic", "element": ELEMENT, "parry_class": "magic", "position": [global_position.x, global_position.y], "source_hit_fx_requested": true, "poison_appended": false, "burn_appended": false, "native_knockback": 2.0})
		_end("player")
		return
	_previous_player_position = current
	queue_redraw()

func _segment_distance(start: Vector2, finish: Vector2, point: Vector2) -> float:
	var line = finish - start
	if line.length_squared() <= 1.0:
		return finish.distance_to(point)
	return (start + line * clampf((point - start).dot(line) / line.length_squared(), 0.0, 1.0)).distance_to(point)

func _reject(reason: String) -> bool:
	_last_error = reason
	return false

func _end(reason: String) -> void:
	if _ended:
		return
	_ended = true
	telemetry_event.emit("enemy_projectile_end", {"reason": reason, "element": ELEMENT, "life_ticks": life_ticks, "distance": distance_travelled, "near_camera_extensions": _near_camera_extensions})
	queue_free()

func get_last_error() -> String:
	return _last_error

func get_snapshot() -> Dictionary:
	return {"element": ELEMENT, "base_damage": damage, "life_ticks": life_ticks, "size": SOURCE_SIZE, "speed": speed, "native_frame": native_frame, "position": [global_position.x, global_position.y], "heading": [heading.x, heading.y], "ended": _ended, "near_camera_extensions": _near_camera_extensions, "parry_class": "magic", "gbBean": DARK_BALL, "fireMagic": ELEMENT == "fire", "poison_appended": false, "burn_appended": false, "configured": _configured, "error": _last_error}

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

func _process(_delta: float) -> void:
	if not _configured or _ended or _sprite == null:
		return
	# The source phase advances only in the expanded visible-shot collection.
	var visible_shot = _source_render_visible()
	_first_glow_on = visible_shot and not _comet_seen
	if visible_shot:
		_sprite_frame += 0.12
		_comet_seen = true
	_update_visual()
	queue_redraw()

func _source_render_visible() -> bool:
	var camera = get_viewport().get_camera_2d()
	if camera == null:
		return false
	var context: Dictionary = world.get_native_projectile_fx_context()
	var pad = 120.0 if bool(context.get("hi_fps", false)) else 200.0
	var half = get_viewport_rect().size / camera.zoom * 0.5 + Vector2.ONE * pad
	var center = camera.get_screen_center_position()
	return absf(global_position.x - center.x) <= half.x and absf(global_position.y - center.y) <= half.y

func _draw() -> void:
	# Comet success sets the source _eyeSkin flag: the tiny glow is first-draw only.
	if _first_glow_on:
		var pulse = 0.7 + sin(float(Time.get_ticks_msec()) / 200.0 + global_position.x) * 0.3
		var color = Color("#ff88cc")
		color.a = 0.08 * pulse
		draw_circle(Vector2.ZERO, 6.0, color)

func _update_visual() -> void:
	if _sprite == null or _texture == null:
		return
	var cell_width = float(_texture.get_width()) / 8.0
	var cell_height = float(_texture.get_height())
	var frame = posmod(int(_sprite_frame), 8)
	var visual_scale = clampf(SOURCE_SIZE * 1.5, 1.2, 4.0) * 0.7
	var length = 20.0 * visual_scale * 2.2 * 1.0
	var height = length * cell_height / cell_width
	_sprite.region_rect = Rect2(frame * cell_width, 0.0, cell_width, cell_height)
	_sprite.scale = Vector2(length / cell_width, height / cell_height)
	_sprite.position = Vector2(-0.12 * length, 0.0).rotated(heading.angle())
	_sprite.rotation = heading.angle()
	_sprite.modulate.a = 1.0
