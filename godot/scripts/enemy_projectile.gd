class_name ExoduserEnemyProjectile
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

const BLUE_SCRIPT = preload("res://port_modules/parry_blue_projectile/producer.gd")
var _raw: Dictionary = {}
var _reflected_blue: Node2D
var _reflection_frame := -1.0
var _last_blue_frame := -1.0
var _previous_player_position := Vector2.ZERO

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
	_previous_player_position=target.global_position
	# Existing normalized native dark-sphere birth: R _commit / _mkProj.
	_raw={"x":origin.x,"y":origin.y,"vx":heading.x*speed/60.0,"vy":heading.y*speed/60.0,"dmg":amount,"el":3,"life":120.0,"ml":120.0,"sz":3.2,"r":4.0,"dist":0.0,"friendly":false,"gbBean":true,"blackBean":false,"blueBean":false,"parryBlueBean":false,"magic":false,"homing":false,"col":"#a44cff","_fromRainbow":false,"parryClass":"magic","_aoeR":0.0,"_aoeDmg":0.0,"_eyeSkin":0.0,"_bluHitCD":0.0}

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
	if is_instance_valid(_reflected_blue):
		if world.get_native_frame()>_reflection_frame and world.get_native_frame()>_last_blue_frame:
			_last_blue_frame=world.get_native_frame()
			var context: Dictionary = world.get_native_projectile_fx_context()
			_reflected_blue.advance_native_projectile(context.dt_sp,world.get_native_frame(),world.get_native_world_identity())
			if not _ended:
				_raw.merge(_reflected_blue.p,true)
				global_position=Vector2(_raw.x,_raw.y)
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
	if is_instance_valid(player) and (collision==null or collision.get_collider()==player):
		var current: Vector2 = player.global_position
		var swept: float = minf(current.distance_to(Geometry2D.get_closest_point_to_segment(current,before,global_position)),_previous_player_position.distance_to(Geometry2D.get_closest_point_to_segment(_previous_player_position,before,global_position)))
		_previous_player_position=current
		var reaction: Dictionary = player.try_native_q_projectile_reflection(self,swept)
		if reaction.get("reflected")==true:
			telemetry_event.emit("enemy_projectile_q_reflected",reaction)
			return
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
	if is_instance_valid(_reflected_blue) and not _reflected_blue.ended:_reflected_blue.native_room_reset()
	telemetry_event.emit("enemy_projectile_end", {"reason": reason, "life_ticks": life_ticks, "distance": distance_travelled})
	queue_free()

func _draw() -> void:
	if is_instance_valid(_reflected_blue):return
	# Native _drawDarkSphere colors/radii. Default sz3.2 gives sSc2.8 and radius11.76.
	for i in range(1, _trail.size()):
		draw_line(to_local(_trail[i - 1]), to_local(_trail[i]), Color(0.45, 0.12, 0.75, 0.24 * (1.0 - float(i) / 12.0)), 5.0, true)
	var r = 11.76
	var pulse = 0.82 + sin(_visual_ms * 0.012 + global_position.x * 0.07) * 0.18
	draw_circle(Vector2.ZERO, r * 4.2, Color(0.294, 0.086, 0.49, 0.13 * pulse))
	draw_circle(Vector2.ZERO, r * 2.35, Color(0.56, 0.21, 0.847, 0.28 * pulse))
	draw_circle(Vector2.ZERO, r, Color(0.427, 0.129, 0.678, 0.72))
	draw_circle(Vector2(-r * 0.22, -r * 0.28), r * 0.34, Color(0.788, 0.565, 1.0, 0.92))

## Read-only existing sphere visual values for the native perspective caller.
func get_native_projection_visual() -> Dictionary:
	if is_instance_valid(_reflected_blue):
		return {"ready":not _ended,"kind":"native_parry_blue","position":global_position,"radius":11.76,"pulse":0.7+sin(_reflected_blue.render_now_ms/200.0+global_position.x)*0.3}
	return {"ready":is_inside_tree() and not is_queued_for_deletion(), "kind":"native_dark_sphere",
		"position":global_position, "radius":11.76,
		"pulse":0.82 + sin(_visual_ms * 0.012 + global_position.x * 0.07) * 0.18}

func read_native_q_carrier() -> Dictionary:
	if not is_inside_tree() or _ended:return {}
	if is_instance_valid(_reflected_blue):
		_raw.merge(_reflected_blue.p,true)
	else:
		_raw.merge({"x":global_position.x,"y":global_position.y,"vx":heading.x*speed/60.0,"vy":heading.y*speed/60.0,"dmg":damage,"life":life_ticks,"dist":distance_travelled},true)
	return _raw

func apply_native_q_reflection(reflected_damage: int, target: Variant, bindings: Dictionary, from_wave: bool = false) -> Dictionary:
	if _ended or is_instance_valid(_reflected_blue) or not is_instance_valid(world) or _raw.get("gbBean")!=true or _raw.get("friendly")!=false:
		return {"reflected":false,"reason":"actual_dark_carrier_not_hostile"}
	var current: Dictionary = read_native_q_carrier()
	if current.is_empty():return {"reflected":false,"reason":"actual_dark_carrier_unreadable"}
	var incoming: float = float(current.dmg)
	var old: Dictionary = current.duplicate()
	var v := Vector2(current.vx,current.vy)
	if target!=null:
		if not is_instance_valid(target) or not target is Node2D:return {"reflected":false,"reason":"actual_parry_target_unreadable"}
		v=Vector2.from_angle((target.global_position-(global_position if from_wave else player.global_position)).angle())*maxf(5.0,v.length())
	else:v*=-2.0
	# R35640-35643: gbBean is its own Q-only kind, not blackBean.
	current.merge({"vx":v.x,"vy":v.y,"friendly":true,"dmg":reflected_damage,"life":200.0,"ml":200.0,"gbBean":false,"blueBean":true,"parryBlueBean":true,"magic":true,"homing":true,"col":"#00e5ff","_aoeR":0.0,"_aoeDmg":0.0},true)
	if from_wave:
		# R36900: wave reflection retains gbBean; blackBean never enters this carrier.
		current.merge({"life":120.0,"ml":120.0,"gbBean":old.gbBean},true)
	var blue: Node2D = BLUE_SCRIPT.new()
	if not blue.configure_reflected(current,world,bindings):
		var reason: String = blue.last_error
		blue.free()
		current.clear()
		current.merge(old)
		return {"reflected":false,"reason":"source_blue_handoff:"+reason}
	blue.bind_external_driver(true,false)
	_reflected_blue=blue
	_reflection_frame=world.get_native_frame()
	blue.projectile_ended.connect(_on_native_blue_ended)
	world.add_child(blue)
	process_physics_priority=1
	collision_layer=0
	collision_mask=0
	velocity=Vector2.ZERO
	queue_redraw()
	return {"reflected":true,"incoming_dmg_before":incoming,"projectile_dmg":reflected_damage,"bank_add":0,"same_carrier_id":get_instance_id(),"source_kind":"gbBean","same_tick_blue_steps":blue.native_steps,"life":120.0 if from_wave else 200.0,"from_wave":from_wave}

func _on_native_blue_ended(reason: String, snapshot: Dictionary) -> void:
	telemetry_event.emit("q_reflected_projectile_ended",{"carrier_id":get_instance_id(),"reason":reason,"blue":snapshot})
	_end("blue_"+reason)

func get_native_q_carrier_snapshot() -> Dictionary:
	return {"carrier_id":get_instance_id(),"reflected":is_instance_valid(_reflected_blue),"raw":read_native_q_carrier().duplicate(),"blue":_reflected_blue.get_snapshot() if is_instance_valid(_reflected_blue) else {}}
