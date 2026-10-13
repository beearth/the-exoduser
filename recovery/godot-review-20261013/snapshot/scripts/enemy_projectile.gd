class_name ExoduserEnemyProjectile
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

var player: Node2D
var world: Node2D
var damage = 62
var life_ticks = 120.0
var heading = Vector2.RIGHT
var speed = 550.0
var distance_travelled = 0.0
var birth_position = Vector2.ZERO
var _trail: Array[Vector2] = []
var _ended = false
var _visual_ms = 0.0

func configure(origin: Vector2, aim: Vector2, amount: int, target: Node2D, owner_world: Node2D, native_speed: float) -> void:
	position = origin
	birth_position = origin
	heading = aim.normalized()
	damage = amount
	player = target
	world = owner_world
	speed = native_speed

func _ready() -> void:
	add_to_group("enemy_projectiles")
	collision_layer = 8
	collision_mask = 1 | 2
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	z_as_relative = false
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	# Native dark sphere size 1.6×2 → contact margin sz×3+4 = 13.6px.
	circle.radius = 13.6
	shape.shape = circle
	add_child(shape)

func _physics_process(delta: float) -> void:
	if _ended:
		return
	var ticks = delta * 60.0
	_visual_ms += delta * 1000.0
	life_ticks -= ticks * 0.667
	if life_ticks <= 0:
		_end("lifetime")
		return
	if is_instance_valid(player) and life_ticks > 30.0:
		var desired = (player.global_position - global_position).angle()
		var difference = wrapf(desired - heading.angle(), -PI, PI)
		heading = Vector2.from_angle(heading.angle() + clampf(difference, -0.00655 * ticks, 0.00655 * ticks))
	velocity = heading * speed
	var before = global_position
	var collision = move_and_collide(velocity * delta)
	distance_travelled += before.distance_to(global_position)
	z_index = clampi(int(global_position.y / 4.0) + 1, -2000, 4000)
	_trail.push_front(global_position)
	if _trail.size() > 12:
		_trail.pop_back()
	if collision:
		var target = collision.get_collider()
		if target == player and target.has_method("receive_damage"):
			var contact_damage = int(damage * 1.3)
			target.receive_damage(contact_damage, "magic")
			telemetry_event.emit("enemy_projectile_hit", {"damage_request": contact_damage, "distance": distance_travelled, "position": [global_position.x, global_position.y]})
		_end("collision")
	queue_redraw()

func _end(reason: String) -> void:
	if _ended:
		return
	_ended = true
	telemetry_event.emit("enemy_projectile_end", {"reason": reason, "life_ticks": life_ticks, "distance": distance_travelled})
	queue_free()

func _draw() -> void:
	# Native _drawDarkSphere colors/radii. Default sz3.2 gives sSc2.8 and radius11.76.
	for i in range(1, _trail.size()):
		draw_line(to_local(_trail[i - 1]), to_local(_trail[i]), Color(0.45, 0.12, 0.75, 0.24 * (1.0 - float(i) / 12.0)), 5.0, true)
	var r = 11.76
	var pulse = 0.82 + sin(_visual_ms * 0.012 + global_position.x * 0.07) * 0.18
	draw_circle(Vector2.ZERO, r * 4.2, Color(0.294, 0.086, 0.49, 0.13 * pulse))
	draw_circle(Vector2.ZERO, r * 2.35, Color(0.56, 0.21, 0.847, 0.28 * pulse))
	draw_circle(Vector2.ZERO, r, Color(0.427, 0.129, 0.678, 0.72))
	draw_circle(Vector2(-r * 0.22, -r * 0.28), r * 0.34, Color(0.788, 0.565, 1.0, 0.92))
