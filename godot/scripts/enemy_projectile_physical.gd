class_name ExoduserPhysicalProjectile
extends CharacterBody2D

const FLIGHT_TEXTURE=preload("res://assets/enemy/proj_phys_mouth.png")

signal telemetry_event(kind: String, data: Dictionary)

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
var native_expiry_policy: Callable
var native_homing_enabled := true
var _sprite: Sprite2D
var _previous_player_position = Vector2.ZERO

func configure(origin: Vector2, aim: Vector2, profile: Dictionary, target: Node2D, owner_world: Node2D, birth_frame: float = 0.0) -> void:
	data = profile.duplicate(true)
	position = origin
	birth_position = origin
	heading = aim.normalized()
	damage = int(data["contact_damage"])
	life_ticks = float(data["life_ticks"])
	speed = float(data["speed_pixels_per_second"][0])
	player = target
	world = owner_world
	native_frame = birth_frame
	if is_instance_valid(player):
		_previous_player_position = player.global_position

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	# Native player idle consumption precedes projectile collision/append.
	# World children precede Player in this scene, so order this new shot last.
	process_physics_priority = 1
	add_to_group("enemy_projectiles")
	add_to_group("physical_enemy_projectiles")
	collision_layer = 8
	# Native general projectiles use center-wall and swept radial player tests;
	# player iframes do not turn into a Godot solid-body collision/despawn.
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
	_sprite.name = "PhysicalMouth"
	_sprite.texture = FLIGHT_TEXTURE # packaged physical carrier; resource resident before simulation
	_sprite.region_enabled = true
	_sprite.centered = true
	_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_sprite.scale = Vector2(float(data["animation"]["width"]) / 768.0, float(data["animation"]["height"]) / 384.0)
	add_child(_sprite)
	_update_visual()

func _physics_process(delta: float) -> void:
	var before: Vector2 = global_position
	if not advance_native_projectile_motion(delta): return

	if is_instance_valid(player):
		var current = player.global_position
		var distance = minf(_segment_distance(before, global_position, current), global_position.distance_to(_previous_player_position))
		var margin = float(player.get("radius")) + float(data["contact_margin"])
		var accepts = float(player.get("hp")) > 0.0 and float(player.get("iframes")) <= 0.0 and str(player.get("state")) != "charge"
		if distance < margin and accepts:
			player.receive_damage(damage, str(data["native_dtype"]), heading, float(data["player_knockback_pixels_per_tick"]))
			_add_bite()
			var burn_applied = false
			# Source35712 is a separate post-hurtP producer, including lethal
			# or internally rejected contact damage. Existing outer gate stays.
			if bool(data.get("redBean", false)) and not bool(data.get("_druidPoison", false)):
				burn_applied = player.apply_native_burn(damage * 2.0)
			telemetry_event.emit("enemy_projectile_hit", {"damage_request": damage, "native_dtype": data["native_dtype"], "parry_class": data["parry_class"], "distance": distance_travelled, "position": [global_position.x, global_position.y], "burn_dot_ported": true, "burn_applied": burn_applied, "burn_pool": damage * 2.0})
			_end("player")
			return
		_previous_player_position = current
	_update_visual()

## DEMO11-35: same ordinary motion/expiry owner, callable before PC contact.
## Legacy _physics_process still executes its original protected block unchanged.
func advance_native_projectile_motion(delta: float) -> bool:
	if _ended:
		return false
	var ticks = delta * 60.0
	native_frame += ticks
	life_ticks -= ticks * float(data["life_decay_per_tick"])
	if life_ticks <= 0.0:
		if native_expiry_policy.is_valid() and native_expiry_policy.call(self) == true:
			life_ticks = 1.0
		else:
			_end("lifetime")
			return false
	if is_instance_valid(player) and native_homing_enabled and life_ticks > float(data["homing_until_life"]):
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
		return false
	return true

func _segment_distance(start: Vector2, end: Vector2, point: Vector2) -> float:
	var line = end - start
	if line.length_squared() <= 1.0:
		return end.distance_to(point)
	var progress = clampf((point - start).dot(line) / line.length_squared(), 0.0, 1.0)
	return (start + line * progress).distance_to(point)

func _update_visual() -> void:
	if not _sprite:
		return
	var frame = posmod((int(native_frame) >> 2) + int(global_position.x * 0.03), 8)
	_sprite.region_rect = Rect2(frame * 768.0, 0.0, 768.0, 384.0)
	_sprite.rotation = heading.angle()

func _add_bite() -> void:
	if not is_instance_valid(player) or not is_instance_valid(world) or not is_inside_tree() or float(player.get("hp")) <= 0.0:
		return
	var bites = get_tree().get_nodes_in_group("physical_bites")
	if bites.size() >= 3:
		bites[0].remove_from_group("physical_bites")
		bites[0].queue_free()
	var bite = PhysicalBite.new()
	bite.target = player
	bite.heading = heading
	bite.texture = _sprite.texture
	world.add_child(bite)

func _end(reason: String) -> void:
	if _ended:
		return
	_ended = true
	telemetry_event.emit("enemy_projectile_end", {"reason": reason, "life_ticks": life_ticks, "distance": distance_travelled, "parry_class": "physical"})
	queue_free()

class PhysicalBite extends Sprite2D:
	var target: Node2D
	var heading = Vector2.RIGHT
	var age_ticks = 0.0

	func _ready() -> void:
		name = "PhysicalBite"
		process_mode = Node.PROCESS_MODE_PAUSABLE
		add_to_group("physical_bites")
		region_enabled = true
		centered = true
		texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
		z_as_relative = false
		_update_bite()

	func _physics_process(delta: float) -> void:
		age_ticks += delta * 60.0
		if age_ticks >= 48.0 or not is_instance_valid(target) or float(target.get("hp")) <= 0.0:
			queue_free()
			return
		_update_bite()

	func _update_bite() -> void:
		if not is_instance_valid(target):
			return
		var phase = fmod(age_ticks, 16.0)
		var bite = sin(phase / 16.0 * PI)
		global_position = target.global_position - heading * Vector2(18.0 - bite * 3.0, 12.0 - bite * 3.0) + Vector2(0.0, -14.0)
		var size = 36.0 * (1.0 - bite * 0.16)
		scale = Vector2(size * 2.0 / 768.0, size / 384.0)
		rotation = heading.angle() + sin(age_ticks * 1.4) * 0.055
		modulate.a = minf(1.0, (48.0 - age_ticks) / 12.0)
		region_rect = Rect2(mini(5, int(floor(phase / 16.0 * 6.0))) * 768.0, 384.0, 768.0, 384.0)
		z_index = clampi(int(target.global_position.y / 4.0) + 1, -2000, 4000)
