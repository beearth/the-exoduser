class_name ExoduserEnemy
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

const ENEMY_PROJECTILE = preload("res://scripts/enemy_projectile.gd")

var data: Dictionary = {}
var world: Node2D
var player: Node2D
var spawn_position = Vector2.ZERO
var hp = 875
var max_hp = 875
var mhp = 875
var poise = 875.0
var max_poise = 875.0
var radius = 34.0
var attack = 31
var etype = 4
var element = "dark"
var elite = 0
var mods: Array = []
var aura: Variant = null
var native_flags: Dictionary = {}
var initial_timers: Dictionary = {}
var source_order = -1
var alive = true
var state = "idle"
var alerted = false
var facing = PI * 0.5
var charge_ticks = 0.0
var _projectile_ticks = 240.0
var _contact_ticks = 0.0
var _hit_stun = 0.0
var _stun_ticks = 0.0
var _poise_regen = 0.0
var _hit_flash = 0.0
var _motion_ms = 0.0
var _rng = RandomNumberGenerator.new()
var _body: Sprite2D
var _moving = false
var _knockback = Vector2.ZERO

func configure(value: Dictionary, owner_world: Node2D) -> void:
	data = value
	world = owner_world
	spawn_position = Vector2(float(data["spawn_position"][0]), float(data["spawn_position"][1]))
	position = spawn_position
	hp = int(data["hp"])
	max_hp = hp
	mhp = hp
	poise = float(data["poise"])
	max_poise = float(data.get("max_poise", hp))
	attack = int(data["attack"])
	etype = int(data.get("etype", 4))
	element = str(data.get("element", "dark"))
	elite = int(data.get("elite", 0))
	mods = data.get("mods", []).duplicate(true)
	aura = data.get("aura")
	native_flags = data.get("native_flags", {}).duplicate(true)
	initial_timers = data.get("initial_timers", {}).duplicate(true)
	source_order = int(data.get("order", -1))
	facing = float(data.get("facing", PI * 0.5))
	radius = float(data["radius"])
	_contact_ticks = float(data["initial_idle_ticks"])
	_projectile_ticks = float(data["initial_projectile_ticks"])
	_poise_regen = float(initial_timers.get("poiseR", 0.0))
	charge_ticks = float(initial_timers.get("chargeT", 0.0))
	var native: Dictionary = data.get("native_final", {})
	state = str(native.get("s", "idle"))
	alive = bool(native.get("alive", true))
	_hit_stun = float(native.get("stunned", 0.0))
	var native_kb: Dictionary = native.get("kb", {})
	_knockback = Vector2(float(native_kb.get("x", 0.0)), float(native_kb.get("y", 0.0)))
	_rng.seed = int(data["factory_random_seed"])

func _ready() -> void:
	name = str(data["id"])
	add_to_group("enemies")
	collision_layer = 4
	collision_mask = 1 | 2
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	z_as_relative = false
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = radius
	shape.shape = circle
	add_child(shape)
	_body = Sprite2D.new()
	_body.texture = load(data["animation"]["texture"])
	_body.hframes = 4
	_body.vframes = 8
	_body.scale = Vector2.ONE * (float(data["animation"]["draw_height"]) / 256.0)
	_body.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	add_child(_body)
	_update_animation()
	telemetry_event.emit("enemy_spawn", {"id": data["id"], "order": source_order, "etype": etype, "element": element, "position": [position.x, position.y], "hp": hp, "radius": radius, "native_speed": data["speed_pixels_per_tick"], "facing": facing})

func set_player(value: Node2D) -> void:
	player = value

func _physics_process(delta: float) -> void:
	if not alive or not is_instance_valid(player):
		return
	var ticks = delta * 60.0
	_motion_ms += delta * 1000.0
	_hit_flash = maxf(0.0, _hit_flash - ticks)
	if _knockback.length_squared() > 0.02:
		var next = global_position + _knockback * ticks
		if world.can_move(next, radius):
			velocity = _knockback * 60.0
			move_and_slide()
		else:
			_knockback = Vector2.ZERO
		_knockback *= pow(0.85, ticks)
	_hit_stun = maxf(0.0, _hit_stun - ticks)
	if _stun_ticks > 0.0:
		_stun_ticks = maxf(0.0, _stun_ticks - ticks)
		charge_ticks = 0.0
		if _stun_ticks == 0.0:
			poise = float(max_hp)
		velocity = Vector2.ZERO
		_update_animation()
		queue_redraw()
		return
	if _hit_stun > 0.0:
		velocity = Vector2.ZERO
		_update_animation()
		queue_redraw()
		return
	if poise < max_hp:
		_poise_regen += ticks
		if _poise_regen >= float(data["poise_regen_ticks"]):
			poise = minf(float(max_hp), poise + floorf(max_hp * float(data["poise_regen_fraction"])))
			_poise_regen = 0.0
	var distance = global_position.distance_to(player.global_position)
	if not alerted and distance < float(data["aggro_range"]) and world.has_line_of_sight(global_position, player.global_position):
		alerted = true
		telemetry_event.emit("enemy_aggro", {"id": data["id"], "distance": distance})
	if alerted and distance < float(data["aggro_range"]):
		facing = (player.global_position - global_position).angle()
	# Charge decrements independently of idle/contact cooldown; born projectiles own their lifetime.
	if charge_ticks > 0.0:
		charge_ticks = maxf(0.0, charge_ticks - ticks)
		if charge_ticks == 0.0:
			_fire_projectile()
	if not alerted and distance > 400.0:
		velocity = Vector2.ZERO
		_moving = false
		_update_animation()
		queue_redraw()
		return
	if player.get("hp") != null and float(player.get("hp")) <= 0.0:
		velocity = Vector2.ZERO
		return
	_contact_ticks -= ticks
	var to_player = Vector2.from_angle(facing)
	var native_speed = float(data["speed_pixels_per_tick"])
	var movement = to_player * native_speed * float(data["idle_movement_multiplier"])
	if alerted and distance > float(data["pursuit_stop_distance"]):
		movement += world.get_path_direction(global_position) * native_speed
	velocity = movement * 60.0
	var before = global_position
	if world.can_move(global_position + velocity * delta, radius):
		move_and_slide()
	else:
		velocity = Vector2.ZERO
	_moving = before.distance_squared_to(global_position) > 0.25
	z_index = clampi(int(global_position.y / 4.0), -2000, 4000)
	distance = global_position.distance_to(player.global_position)
	var player_radius = float(player.get("radius")) if player.get("radius") != null else 15.0
	if distance < radius + player_radius + float(data["contact_extra_radius"]) and _contact_ticks <= 0.0:
		var amount = int(attack * float(data["contact_damage_multiplier"]))
		player.receive_damage(amount)
		_contact_ticks = float(data["contact_cooldown_min_ticks"]) + _rng.randi_range(0, int(data["contact_cooldown_random_ticks"]) - 1)
		telemetry_event.emit("enemy_contact", {"id": data["id"], "damage_request": amount, "cooldown_ticks": _contact_ticks})
	if charge_ticks <= 0.0:
		_projectile_ticks -= ticks
		if _projectile_ticks <= 0.0 and distance < float(data["projectile_range"]):
			_projectile_ticks = float(data["projectile_cooldown_ticks"])
			charge_ticks = float(data["projectile_charge_ticks"])
			telemetry_event.emit("enemy_charge", {"id": data["id"], "ticks": charge_ticks, "position": [global_position.x, global_position.y]})
	_update_animation()
	queue_redraw()

func _fire_projectile() -> void:
	if not is_instance_valid(player) or not alive:
		return
	var shot = ENEMY_PROJECTILE.new()
	var aim = (player.global_position - global_position).normalized()
	shot.configure(global_position, aim, attack * 2, player, world, _rng.randf_range(500.0, 600.0))
	shot.telemetry_event.connect(_forward_event)
	world.add_child(shot)
	telemetry_event.emit("enemy_projectile_birth", {"id": data["id"], "position": [global_position.x, global_position.y], "aim": [aim.x, aim.y], "life_ticks": 120.0, "damage": attack * 2, "contact_damage_request": int(attack * 2 * 1.3)})

func _forward_event(kind: String, value: Dictionary) -> void:
	telemetry_event.emit(kind, value)

func receive_damage(amount: int, direction: Vector2, source: String) -> void:
	if not alive or amount <= 0:
		return
	alerted = true
	_contact_ticks = minf(_contact_ticks, 5.0)
	hp -= amount
	_hit_flash = 6.0
	_hit_stun = float(data["hit_stun_ticks"])
	if source == "weapon" and not direction.is_zero_approx():
		_knockback += direction.normalized() * minf(amount * 0.25, 15.0)
	# The native player attack owns poise amount. Damage is not silently reused as poise damage.
	telemetry_event.emit("enemy_damage", {"id": data["id"], "amount": amount, "hp": hp, "source": source, "direction": [direction.x, direction.y]})
	if hp <= 0:
		alive = false
		state = "dead"
		charge_ticks = 0.0
		velocity = Vector2.ZERO
		collision_layer = 0
		collision_mask = 0
		_body.modulate = Color(0.45, 0.32, 0.34, 0.5)
		telemetry_event.emit("enemy_death", {"id": data["id"], "position": [global_position.x, global_position.y]})
	queue_redraw()

func receive_poise_damage(amount: float) -> void:
	if not alive or amount <= 0:
		return
	poise = maxf(0.0, poise - amount)
	_poise_regen = 0.0
	if poise <= 0:
		_stun_ticks = 180.0
		charge_ticks = 0.0
		telemetry_event.emit("enemy_stagger", {"id": data["id"], "ticks": _stun_ticks})

func _update_animation() -> void:
	if not _body or not alive:
		return
	var angle = facing
	var direction = posmod(roundi(angle / (PI / 4.0)), 8)
	var row = int(data["animation"]["native_direction_rows"][direction])
	var column = 2 + posmod(int(_motion_ms / 120.0), 2) if _moving else 0
	_body.frame = row * 4 + column
	_body.modulate = Color(1.0 + _hit_flash / 6.0, 1.0, 1.0, 1.0)

func _draw() -> void:
	if not alive:
		return
	# Native contact uses its cooldown; only the real 60-tick projectile has a charge cue.
	if charge_ticks > 0.0:
		var progress = 1.0 - charge_ticks / float(data["projectile_charge_ticks"])
		draw_arc(Vector2.ZERO, radius + 13.0, -PI * 0.5, -PI * 0.5 + TAU * progress, 48, Color(0.64, 0.3, 1.0, 0.85), 3.0, true)
		if is_instance_valid(player):
			var aim = (player.global_position - global_position).normalized()
			draw_line(aim * radius, aim * (radius + 42.0), Color(0.65, 0.38, 0.9, 0.5), 2.0, true)
	var bar = Rect2(-48, -float(data["animation"]["draw_height"]) * 0.5 - 14, 96, 5)
	draw_rect(bar, Color(0.12, 0.1, 0.1, 0.9))
	draw_rect(Rect2(bar.position, Vector2(bar.size.x * maxf(0, float(hp) / max_hp), bar.size.y)), Color(0.53, 0.13, 0.18))
