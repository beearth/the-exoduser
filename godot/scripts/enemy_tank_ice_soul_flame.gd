class_name ExoduserIceSoulFlame
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

# Exact raw order8/type4/ice soul-flame consumer. The canonical type4 path
# shares ordinary pursuit/contact/charge; no invented tank armor or attacks.
# _UNDEAD_ET classifies type4 for antiRevive, but equipment affixes are absent.
const ICE_PROJECTILE = preload("res://scripts/enemy_projectile_ice.gd")
# P1-002.F: hurtE owner API 공용 구현 + 이 적의 원본 st2 대응 필드명.
const HURTE_OWNER = preload("res://scripts/native_dedicated_enemy_hurte_owner.gd")
const HURTE_CONTACT_FIELD := "_contact_ticks"

var data: Dictionary = {}
var world: Node2D
var player: Node2D
var spawn_position = Vector2.ZERO
var hp = 0
var max_hp = 0
var mhp = 0
var attack = 0
var radius = 0.0
var etype = 4
var element = "ice"
var elite = 0
var mods: Array = []
var aura: Variant = null
var native_flags: Dictionary = {}
var native_type_traits: Dictionary = {}
var initial_timers: Dictionary = {}
var source_order = -1
var alive = true
var state = "idle"
var alerted = false
var facing = 0.0
var eShield = 0.0
var eShieldMax = 0.0
var eRes: Array = []
var poise = 0.0
var max_poise = 0.0
var charge_ticks = 0.0
var native_frame = 0.0
var _projectile_ticks = 0.0
var _contact_ticks = 0.0
var _hit_stun = 0.0
var _stun_ticks = 0.0
var _poise_regen = 0.0
var _hit_flash = 0.0
var _spawn_ticks = 0.0
var _separation_ticks = 0.0
var _walk_distance = 0.0
var _move_hold = 0.0
var _moving = false
var _knockback = Vector2.ZERO
var _pending_poise_amount = 0.0
var _last_flow_direction = Vector2.ZERO
var _flow_stuck_ticks = 0.0
var _rng = RandomNumberGenerator.new()
var _body: Sprite2D
var _walk: Sprite2D
var _base_textures: Dictionary = {}
var _walk_textures: Dictionary = {}

func configure(value: Dictionary, owner_world: Node2D) -> void:
	data = value.duplicate(true)
	world = owner_world
	spawn_position = Vector2(float(data["spawn_position"][0]), float(data["spawn_position"][1]))
	position = spawn_position
	hp = int(data["hp"])
	max_hp = hp
	mhp = hp
	attack = int(data["attack"])
	radius = float(data["radius"])
	etype = int(data["etype"])
	element = str(data["element"])
	elite = int(data["elite"])
	mods = data["mods"].duplicate(true)
	aura = data["aura"]
	native_flags = data["native_flags"].duplicate(true)
	native_type_traits = data["native_type_traits"].duplicate(true)
	initial_timers = data["initial_timers"].duplicate(true)
	source_order = int(data["order"])
	facing = float(data["facing"])
	eShield = float(data["eShield"])
	eShieldMax = float(data["eShieldMax"])
	eRes = data["eRes"].duplicate(true)
	poise = float(data["poise"])
	max_poise = float(data["max_poise"])
	_contact_ticks = float(data["initial_idle_ticks"])
	_projectile_ticks = float(data["initial_projectile_ticks"])
	_poise_regen = float(initial_timers["poiseR"])
	_spawn_ticks = float(data["initial_spawn_fade_ticks"])
	charge_ticks = float(initial_timers["chargeT"])
	var native: Dictionary = data["native_final"]
	state = str(native["s"])
	alive = bool(native["alive"])
	_stun_ticks = float(native["stunned"])
	_knockback = Vector2(float(native["kb"]["x"]), float(native["kb"]["y"]))
	_rng.seed = int(data["factory_random_seed"])

func _ready() -> void:
	name = str(data["id"])
	process_mode = Node.PROCESS_MODE_PAUSABLE
	add_to_group("enemies")
	collision_layer = 4
	collision_mask = 1 | 2
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	z_as_relative = false
	z_index = clampi(int(global_position.y / 4.0), -2000, 4000)
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = radius
	shape.shape = circle
	add_child(shape)
	var animation: Dictionary = data["animation"]
	for direction in animation["base_textures"]:
		_base_textures[direction] = load(animation["base_textures"][direction])
		_walk_textures[direction] = load(animation["walk_textures"][direction])
	_body = _make_sprite("Body", float(animation["draw_height"]) / 256.0)
	_walk = _make_sprite("WalkOverlay", float(animation["draw_height"]) / 256.0)
	_update_animation()
	telemetry_event.emit("enemy_spawn", {"id": data["id"], "order": source_order, "etype": etype, "element": element, "position": [position.x, position.y], "hp": hp, "radius": radius, "native_speed": data["speed_pixels_per_tick"], "facing": facing, "consumer_profile": data["ai_profile"]})

func _make_sprite(sprite_name: String, draw_scale: float) -> Sprite2D:
	var sprite = Sprite2D.new()
	sprite.name = sprite_name
	sprite.region_enabled = true
	sprite.centered = true
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.scale = Vector2.ONE * draw_scale
	add_child(sprite)
	return sprite

func set_player(value: Node2D) -> void:
	player = value

func _physics_process(delta: float) -> void:
	if not alive:
		return
	var ticks = delta * float(data["native_tick_rate"])
	native_frame += ticks
	_spawn_ticks = maxf(0.0, _spawn_ticks - ticks)
	_hit_flash = maxf(0.0, _hit_flash - ticks)
	_hit_stun = maxf(0.0, _hit_stun - ticks)
	_stun_ticks = maxf(0.0, _stun_ticks - ticks)
	var before = global_position
	if _knockback.length_squared() > 0.02:
		_move_native(_knockback, ticks)
		_knockback *= pow(0.85, ticks)
	# Native updateE checks hit stun before its stunned/charge-cancel branch.
	if _hit_stun > 0.0:
		_finish_motion(before, ticks)
		return
	if _stun_ticks > 0.0:
		if charge_ticks > 0.0:
			charge_ticks = 0.0
			telemetry_event.emit("enemy_charge_cancel", {"id": data["id"], "reason": "stunned"})
		_finish_motion(before, ticks)
		return
	# Source ordinary enemies regenerate; only its boss branch resets at stun end.
	if poise < max_poise:
		_poise_regen += ticks
		if _poise_regen >= float(data["poise_regen_ticks"]):
			poise = minf(max_poise, poise + floorf(max_poise * float(data["poise_regen_fraction"])))
			_poise_regen = 0.0
	if not is_instance_valid(player):
		_finish_motion(before, ticks)
		return
	var distance = global_position.distance_to(player.global_position)
	if not alerted and distance < float(data["aggro_range"]) and world.has_line_of_sight(global_position, player.global_position):
		alerted = true
		telemetry_event.emit("enemy_aggro", {"id": data["id"], "distance": distance})
	if alerted and distance < float(data["aggro_range"]):
		facing = (player.global_position - global_position).angle()
	if alerted and state in ["idle", "recover"] and distance > float(data["pursuit_stop_distance"]):
		_move_flow_native(world.get_path_direction(global_position), ticks)
		distance = global_position.distance_to(player.global_position)
	# Committed charge advances before the non-alerted far-return gate.
	if charge_ticks > 0.0:
		charge_ticks -= ticks
		if charge_ticks <= 0.0:
			charge_ticks = 0.0
			_fire_projectile()
	if (not alerted and distance > 400.0) or float(player.get("hp")) <= 0.0:
		_finish_motion(before, ticks)
		return
	_contact_ticks -= ticks
	if state == "idle":
		_move_native(Vector2.from_angle(facing) * float(data["speed_pixels_per_tick"]) * float(data["idle_movement_multiplier"]), ticks)
		_apply_separation(ticks)
		# Source uses the distance sampled before direct idle movement.
		if distance < radius + float(player.get("radius")) + float(data["contact_extra_radius"]) and float(player.get("iframes")) <= 0.0 and _contact_ticks <= 0.0:
			var amount = int(attack * float(data["contact_damage_multiplier"]))
			player.receive_damage(amount)
			_contact_ticks = float(data["contact_cooldown_min_ticks"]) + floorf(_rng.randf() * float(data["contact_cooldown_random_ticks"]))
			telemetry_event.emit("enemy_contact", {"id": data["id"], "damage_request": amount, "cooldown_ticks": _contact_ticks})
		if charge_ticks <= 0.0:
			_projectile_ticks -= ticks
			if _projectile_ticks <= 0.0 and distance < float(data["projectile_range"]):
				_projectile_ticks = float(data["projectile_cooldown_ticks"])
				charge_ticks = float(data["projectile_charge_ticks"])
				telemetry_event.emit("enemy_charge", {"id": data["id"], "ticks": charge_ticks, "position": [global_position.x, global_position.y], "bean": "water", "parry_class": "magic"})
	elif state == "recover" and _contact_ticks <= 0.0:
		state = "idle"
		_contact_ticks = 15.0 + _rng.randf() * 15.0
	# eCircle/ticket windup has no admitted entry in this consumer.
	_finish_motion(before, ticks)

func _move_flow_native(flow_direction: Vector2, ticks: float) -> void:
	# Native _ffMoveE caches direction components before applying speed. Its
	# axis fallback belongs only to alerted idle/recover flow, not all movement.
	var direction = flow_direction
	if direction != Vector2.ZERO:
		_last_flow_direction = direction
	elif _last_flow_direction != Vector2.ZERO:
		direction = _last_flow_direction
	else:
		direction = Vector2.from_angle((player.global_position - global_position).angle())
	var per_tick = direction * float(data["speed_pixels_per_tick"])
	var offset = per_tick * ticks
	if world.can_move(global_position + offset, radius):
		_flow_stuck_ticks = 0.0
	elif world.can_move(global_position + Vector2(offset.x, 0.0), radius):
		per_tick.y = 0.0
		_last_flow_direction = Vector2(direction.x, 0.0)
		_flow_stuck_ticks = 0.0
	elif world.can_move(global_position + Vector2(0.0, offset.y), radius):
		per_tick.x = 0.0
		_last_flow_direction = Vector2(0.0, direction.y)
		_flow_stuck_ticks = 0.0
	else:
		_flow_stuck_ticks += ticks
		velocity = Vector2.ZERO
		# Native eight-direction escape/full pathing remains unported.
		return
	velocity = per_tick * 60.0
	move_and_slide()

func _move_native(per_tick: Vector2, ticks: float) -> void:
	if per_tick.is_zero_approx():
		return
	if world.can_move(global_position + per_tick * ticks, radius):
		velocity = per_tick * 60.0
		move_and_slide()
	else:
		velocity = Vector2.ZERO

func _apply_separation(ticks: float) -> void:
	if _separation_ticks > 0.0:
		_separation_ticks -= ticks
		return
	var push = Vector2.ZERO
	for other in world.get_enemies():
		if other == self or not is_instance_valid(other) or not bool(other.get("alive")):
			continue
		var difference = global_position - other.global_position
		var distance_squared = difference.length_squared()
		if distance_squared > pow(radius * 4.4, 2.0):
			continue
		var minimum = radius + float(other.get("radius")) + 4.0
		if distance_squared > 0.01 and distance_squared < minimum * minimum:
			var distance = sqrt(distance_squared)
			push += difference / distance * ((minimum - distance) / minimum) * 1.5
	_move_native(push, ticks)
	_separation_ticks = 3.0

func _finish_motion(before: Vector2, ticks: float) -> void:
	var travelled = before.distance_to(global_position)
	_walk_distance += travelled
	if travelled * travelled > 0.25:
		_moving = true
		_move_hold = 3.0
	elif _move_hold > 0.0:
		_move_hold -= ticks
	else:
		_moving = false
	velocity = Vector2.ZERO
	z_index = clampi(int(global_position.y / 4.0), -2000, 4000)
	_update_animation()
	queue_redraw()

func _fire_projectile() -> void:
	if not alive or not is_instance_valid(player):
		return
	var aim = (player.global_position - global_position).normalized()
	facing = aim.angle()
	var shot = ICE_PROJECTILE.new()
	shot.configure(global_position, aim, data["projectile"].duplicate(true), player, world, native_frame)
	shot.telemetry_event.connect(_forward_event)
	world.add_child(shot)
	telemetry_event.emit("enemy_projectile_birth", {"id": data["id"], "position": [global_position.x, global_position.y], "aim": [aim.x, aim.y], "life_ticks": shot.life_ticks, "damage": shot.damage, "native_dtype": "magic", "parry_class": "magic"})

func _forward_event(kind: String, value: Dictionary) -> void:
	telemetry_event.emit(kind, value)

func receive_poise_damage(amount: float) -> void:
	# Existing crescent sends its poise request before HP damage. Defer until
	# that same packet has passed the native modifier and eShield stages.
	if alive and amount > 0.0:
		_pending_poise_amount += amount

func receive_damage(amount: int, direction: Vector2, source: String, opts: Dictionary = {}) -> void:
	var pending = _pending_poise_amount
	_pending_poise_amount = 0.0
	if not alive or amount <= 0:
		return
	var is_dot = bool(opts.get("dot", false))
	var damage = int(amount * (1.5 if _stun_ticks > 0.0 and not is_dot else 1.0))
	var absorbed = 0.0
	if (not is_dot or bool(opts.get("shieldHit", false))) and eShieldMax > 0.0 and eShield > 0.0:
		absorbed = minf(eShield, damage)
		eShield = maxf(0.0, eShield - damage)
		damage = maxi(0, int(damage - absorbed))
	if damage > 0:
		alerted = true
		if not is_dot:
			if state == "recover":
				state = "idle"
				_contact_ticks = 0.0
			elif state == "idle":
				_contact_ticks = minf(_contact_ticks, 5.0)
		hp -= damage
		_hit_flash = 6.0
		if state == "idle":
			_hit_stun = float(data["hit_stun_ticks"])
		if not is_dot and not bool(opts.get("noKB", false)) and not direction.is_zero_approx():
			var kb_multiplier = float(opts.get("kbMult", 0.5 if source == "kiSlash" else 1.0))
			var magic_scale = 0.2 if bool(opts.get("magic", false)) else 1.0
			_knockback += direction.normalized() * minf(damage * 0.25 * kb_multiplier * magic_scale, 15.0 * kb_multiplier * magic_scale)
	if not is_dot and (pending > 0.0 or bool(opts.get("poiseHit", false))):
		var poise_multiplier = float(opts.get("poiseMult", pending / amount if pending > 0.0 else 1.0))
		_apply_poise(int(damage * poise_multiplier))
	telemetry_event.emit("enemy_damage", {"id": data["id"], "raw_amount": amount, "amount": damage, "absorbed": absorbed, "eShield": eShield, "hp": hp, "source": source, "poise": poise})
	if hp <= 0:
		alive = false
		state = "dead"
		charge_ticks = 0.0
		collision_layer = 0
		collision_mask = 0
		velocity = Vector2.ZERO
		if _body:
			_body.modulate.a = 0.5
			_walk.visible = false
		telemetry_event.emit("enemy_death", {"id": data["id"], "position": [global_position.x, global_position.y]})
	queue_redraw()

func _apply_poise(amount: int) -> void:
	if amount <= 0:
		return
	poise = maxf(0.0, poise - amount)
	_poise_regen = 0.0
	if poise <= 0.0:
		_stun_ticks = maxf(_stun_ticks, 180.0)
		telemetry_event.emit("enemy_stagger", {"id": data["id"], "ticks": _stun_ticks})

func _update_animation() -> void:
	if not _body or not alive:
		return
	var animation: Dictionary = data["animation"]
	var direction_index = posmod(roundi(fposmod(facing, TAU) / (PI / 4.0)), 8)
	var direction: String = animation["direction_angle_sectors"][direction_index]
	_body.texture = _base_textures[direction]
	_body.region_rect = _rect(animation["base_rect"])
	_walk.texture = _walk_textures[direction]
	var frame = posmod(int(floor(_walk_distance / float(animation["walk_pixels_per_frame"]))), 4)
	_walk.region_rect = _rect(animation["walk_frame_rects"][frame])
	_walk.visible = _moving
	var spawn_alpha = maxf(0.0, 1.0 - _spawn_ticks / 20.0) if _spawn_ticks > 0.0 else 1.0
	_body.modulate = Color(1.0 + _hit_flash / 6.0, 1.0, 1.0, spawn_alpha)
	_walk.modulate = _body.modulate

func _rect(value: Array) -> Rect2:
	return Rect2(float(value[0]), float(value[1]), float(value[2]), float(value[3]))

func get_snapshot() -> Dictionary:
	return {"id": data["id"], "order": source_order, "etype": etype, "element": element, "state": state, "alive": alive, "alerted": alerted, "hp": hp, "max_hp": max_hp, "eShield": eShield, "eShieldMax": eShieldMax, "poise": poise, "max_poise": max_poise, "charge_ticks": charge_ticks, "projectile_ticks": _projectile_ticks, "contact_ticks": _contact_ticks, "hit_stun_ticks": _hit_stun, "stun_ticks": _stun_ticks, "poise_regen_ticks": _poise_regen, "walk_distance": _walk_distance, "native_frame": native_frame, "facing": facing, "position": [position.x, position.y], "knockback": [_knockback.x, _knockback.y], "pending_poise_amount": _pending_poise_amount, "last_flow_direction": [_last_flow_direction.x, _last_flow_direction.y], "flow_stuck_ticks": _flow_stuck_ticks, "native_type_traits": native_type_traits.duplicate(true), "undead_for_anti_revive": bool(native_type_traits["undead"]), "anti_revive_affix_ported": bool(native_type_traits["nonzero_antiRevive_modifier_ported_by_this_unit"])}

func _draw() -> void:
	if not alive:
		return
	if charge_ticks > 0.0:
		var progress = 1.0 - charge_ticks / float(data["projectile_charge_ticks"])
		draw_arc(Vector2.ZERO, radius + 13.0, -PI * 0.5, -PI * 0.5 + TAU * progress, 48, Color(0.2, 136.0 / 255.0, 1.0, 0.85), 3.0, true)
	var bar = Rect2(-48, -float(data["animation"]["draw_height"]) * 0.5 - 14, 96, 5)
	draw_rect(bar, Color(0.12, 0.1, 0.1, 0.9))
	draw_rect(Rect2(bar.position, Vector2(bar.size.x * maxf(0.0, float(hp) / max_hp), bar.size.y)), Color(0.53, 0.13, 0.18))
	# P1-002.F: 에너지쉴드 — 원본 drawEn(game.html:53963)과 같이 HP 바와 같은 칸 위에
	# 쉴드 비율만큼 #44aaff로 덮어 그린다(별도 줄 아님). enemy.gd(P1-002.E)와 동일.
	if eShieldMax > 0.0 and eShield > 0.0:
		draw_rect(Rect2(bar.position, Vector2(bar.size.x * minf(1.0, eShield / eShieldMax), bar.size.y)), Color8(0x44, 0xaa, 0xff))
# ═══ P1-002.F: 기본 근접 hurtE 경로의 적 측 owner API (generic enemy.gd와 동일 계약) ═══
# 공용 구현: native_dedicated_enemy_hurte_owner.gd. 기존 receive_damage·고유 경로는 유지.
func read_native_normal_enemy_hurte_fields(caller_world: Node) -> Dictionary:
	return HURTE_OWNER.read_fields(self, caller_world)

func apply_native_normal_enemy_field_write(field: String, value: Variant) -> Dictionary:
	return HURTE_OWNER.apply_field_write(self, HURTE_CONTACT_FIELD, field, value)

func apply_native_normal_enemy_bookkeeping(fields: Dictionary) -> Dictionary:
	return HURTE_OWNER.apply_bookkeeping(self, fields)

func apply_native_normal_enemy_hp_write(write: Dictionary) -> Dictionary:
	return HURTE_OWNER.apply_hp_write(self, write)

func apply_native_normal_enemy_death_write() -> Dictionary:
	return HURTE_OWNER.apply_death_write(self)

func report_native_normal_enemy_hurte_event(kind: String, payload: Dictionary) -> void:
	telemetry_event.emit(kind, payload)

func add_native_knockback(value: Vector2) -> void:
	if alive and value.is_finite(): _knockback += value
