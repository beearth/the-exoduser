class_name ExoduserDarkProjectile
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

# Declared type3 charged-dark and etype21 dark-burst callers, never a life fallback.
# A sampled scalar speed is supplied by the owner; this kernel never owns RNG.
const ELEMENT = "dark"
const ELEMENT_ID = 3
const DARK_BALL = true
const SOURCE_SIZE = 3.2
var data: Dictionary = {}
var player: Node2D
var world: Node2D
var damage = 0
var life_ticks = 0.0
var initial_life_ticks = 0.0
var source_caller = ""
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


func configure(origin: Vector2, aim: Vector2, profile: Dictionary, target: Node2D, owner_world: Node2D, birth_frame: float = 0.0) -> bool:
	if _configured or not origin.is_finite() or not aim.is_finite() or aim.length_squared() <= 0.0 or not is_finite(birth_frame):
		return _reject("invalid_birth")
	if not is_instance_valid(target) or not is_instance_valid(owner_world) or not target.has_method("receive_damage") or not owner_world.has_method("is_world_blocked"):
		return _reject("missing_native_target_or_world")
	if not owner_world.has_method("supports_native_projectile_hit_fx") or not owner_world.has_method("emit_native_projectile_hit_fx"):
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
	var declared_caller = profile.get("source_caller", "")
	var declared_life = float(profile["life_ticks"])
	if not ((declared_caller == "etype3_charged_dark" and declared_life == 60.0) or (declared_caller == "etype21_dark_burst" and declared_life == 240.0)):
		return _reject("unsupported_declared_dark_source_caller")
	if float(profile["base_damage"]) < 1.0 or float(profile["base_damage"]) != floor(float(profile["base_damage"])) or float(profile["size"]) != SOURCE_SIZE:
		return _reject("unsupported_charged_source_profile")
	if float(profile["speed_pixels_per_second"]) < 500.0 or float(profile["speed_pixels_per_second"]) > 600.0:
		return _reject("missing_sampled_magic_speed")

	data = profile.duplicate(true)
	player = target
	world = owner_world
	position = origin
	birth_position = origin
	heading = aim.normalized()
	damage = int(profile["base_damage"])
	source_caller = declared_caller
	initial_life_ticks = declared_life
	life_ticks = declared_life
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
	var blend = CanvasItemMaterial.new()
	blend.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	material = blend

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
		var contact_damage = int(damage * 1.3)
		player.receive_damage(contact_damage, "magic")
		# Source producer follows hurtP even if its internal HP/iframe gate rejects it.
		world.emit_native_projectile_hit_fx({"element": ELEMENT, "element_id": ELEMENT_ID, "position": global_position, "target_position": player.global_position, "dark_ball": DARK_BALL, "redBean": false})
		telemetry_event.emit("enemy_projectile_hit", {"damage_request": contact_damage, "base_damage": damage, "native_dtype": "magic", "element": ELEMENT, "parry_class": "magic", "position": [global_position.x, global_position.y], "source_hit_fx_requested": true, "poison_appended": false, "burn_appended": false, "native_knockback": 0.0})
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
	return {"element": ELEMENT, "base_damage": damage, "life_ticks": life_ticks, "initial_life_ticks": initial_life_ticks, "source_caller": source_caller, "size": SOURCE_SIZE, "speed": speed, "native_frame": native_frame, "position": [global_position.x, global_position.y], "heading": [heading.x, heading.y], "ended": _ended, "near_camera_extensions": _near_camera_extensions, "parry_class": "magic", "gbBean": DARK_BALL, "fireMagic": ELEMENT == "fire", "poison_appended": false, "burn_appended": false, "configured": _configured, "error": _last_error}

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

func _process(_delta: float) -> void:
	if _configured and not _ended:
		queue_redraw()

func _draw() -> void:
	if not _configured or _ended:
		return
	# Literal _drawDarkSphere: four purple layers and one velocity line, no PNG.
	var r = 4.2 * clampf(SOURCE_SIZE * 1.5, 1.2, 4.0) * 0.7
	# gbBean has no _eyeSkin flag, so the source special glow pass remains active.
	var glow_pulse = 0.7 + sin(float(Time.get_ticks_msec()) / 200.0 + global_position.x) * 0.3
	var glow = Color("#cc44ff")
	glow.a = 0.35 * glow_pulse
	draw_circle(Vector2.ZERO, 12.0, glow)
	glow.a = 0.12 * glow_pulse
	draw_circle(Vector2.ZERO, 30.0, glow)
	var pulse = 0.82 + sin(float(Time.get_ticks_msec()) * 0.012 + global_position.x * 0.07) * 0.18
	draw_circle(Vector2.ZERO, r * 4.2, Color(0.2941176471, 0.0862745098, 0.4901960784, 0.13 * pulse))
	draw_circle(Vector2.ZERO, r * 2.35, Color(0.5607843137, 0.2117647059, 0.8470588235, 0.28 * pulse))
	draw_circle(Vector2.ZERO, r, Color(0.4274509804, 0.1294117647, 0.6784313725, 0.72))
	draw_circle(Vector2(-r * 0.22, -r * 0.28), r * 0.34, Color(0.7882352941, 0.5647058824, 1.0, 0.92))
	draw_line(-heading * r * 0.2, -heading * speed / 60.0 * 5.0, Color(0.6588235294, 0.3098039216, 1.0, 0.34), maxf(1.0, r * 0.55), true)
