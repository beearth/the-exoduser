class_name ExoduserLightningHiveBloater
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

# Exact order15/type1/lightning hive-bloater. Preserve the two ranged
# movement stages and ordinary independent charge. Type1 has no melee
# contact path and is not classified undead by the canonical registry.
const LIGHTNING_PROJECTILE = preload("res://scripts/enemy_projectile_lightning.gd")
# P1-002.F: hurtE owner API 공용 구현 + 이 적의 원본 st2 대응 필드명.
const HURTE_OWNER = preload("res://scripts/native_dedicated_enemy_hurte_owner.gd")
const BAR_LAYOUT = preload("res://scripts/native_enemy_bar_layout.gd")
const HURTE_CONTACT_FIELD := "_state_ticks"

var data: Dictionary = {}
var world: Node2D
var player: Node2D
var spawn_position = Vector2.ZERO
var hp = 0
var max_hp = 0
var mhp = 0
var attack = 0
var radius = 0.0
var etype = 1
var element = "lightning"
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
var _state_ticks = 0.0
var _hit_stun = 0.0
var _stun_ticks = 0.0
var _poise_regen = 0.0
var _hit_flash = 0.0
var _spawn_ticks = 0.0
var _separation_ticks = 0.0
var _walk_distance = 0.0
var _move_hold = 0.0
var _moving = false
var _resources_ready = false
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
	_state_ticks = float(data["initial_idle_ticks"])
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
	# The factory checks every required texture before atomically installing.
	# Keep standalone construction failure explicit instead of using another skin.
	var animation: Dictionary = data["animation"]
	if data.has("a_constructor") or str(data.get("ai_profile","")).begins_with("demo11_"):
		preload("res://scripts/native_enemy_source_art.gd").prepare(animation,data.native_final,radius)
	for direction in animation["base_textures"]:
		var base_path = str(animation["base_textures"][direction])
		var walk_path = str(animation["walk_textures"][direction])
		if not ResourceLoader.exists(base_path, "Texture2D") or not ResourceLoader.exists(walk_path, "Texture2D"):
			push_error("Required original hive-bloater atlas is missing")
			set_physics_process(false)
			return
		_base_textures[direction] = ResourceLoader.load(base_path, "Texture2D") as Texture2D
		_walk_textures[direction] = ResourceLoader.load(walk_path, "Texture2D") as Texture2D
		if _base_textures[direction] == null or _walk_textures[direction] == null:
			push_error("Required original hive-bloater atlas is unreadable")
			set_physics_process(false)
			return
	_resources_ready = true
	add_to_group("enemies")
	collision_layer = 4
	collision_mask = 1 # Terrain/props only; source normal enemies do not block player bodies.
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	z_as_relative = false
	z_index = clampi(int(global_position.y / 4.0), -2000, 4000)
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = radius
	shape.shape = circle
	add_child(shape)
	_body = _make_sprite("Body", float(animation["draw_height"]) / 256.0)
	_walk = _make_sprite("WalkOverlay", float(animation["draw_height"]) / 256.0)
	var decor:=preload("res://scripts/native_enemy_source_decor.gd").new()
	decor.name="SourceEnemyDecor";add_child(decor);decor.configure(self)
	_update_animation()
	telemetry_event.emit("enemy_spawn", {"id": data["id"], "order": source_order, "etype": etype, "element": element, "position": [position.x, position.y], "hp": hp, "radius": radius, "native_speed": data["speed_pixels_per_tick"], "facing": facing, "consumer_profile": data["ai_profile"]})

func _make_sprite(sprite_name: String, draw_scale: float) -> Sprite2D:
	var sprite = Sprite2D.new()
	sprite.name = sprite_name
	sprite.region_enabled = true
	sprite.centered = true
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	sprite.scale = Vector2.ONE * draw_scale
	add_child(sprite)
	return sprite

func set_player(value: Node2D) -> void:
	player = value

func _physics_process(delta: float) -> void:
	if not alive or not _resources_ready:
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
	# Source hit-stun guard precedes the stunned charge-cancel branch.
	if _hit_stun > 0.0:
		_finish_motion(before, ticks)
		return
	if _stun_ticks > 0.0:
		if charge_ticks > 0.0:
			charge_ticks = 0.0
			telemetry_event.emit("enemy_charge_cancel", {"id": data["id"], "reason": "stunned"})
		_finish_motion(before, ticks)
		return
	if poise < max_poise:
		_poise_regen += ticks
		if _poise_regen >= float(data["poise_regen_ticks"]):
			poise = minf(max_poise, poise + floorf(max_poise * float(data["poise_regen_fraction"])))
			_poise_regen = 0.0
	if not is_instance_valid(player):
		_finish_motion(before, ticks)
		return
	var distance = global_position.distance_to(player.global_position)
	if not alerted and state in ["idle", "recover"] and distance < float(data["aggro_range"]) and world.has_line_of_sight(global_position, player.global_position):
		alerted = true
		telemetry_event.emit("enemy_aggro", {"id": data["id"], "distance": distance})
	if alerted and distance < float(data["aggro_range"]):
		facing = (player.global_position - global_position).angle()
	var movement: Dictionary = data["movement"]
	# First stage belongs to alerted idle/recover. Its retreat deliberately
	# checks only the destination point, unlike the second radius-tested stage.
	if alerted and state in ["idle", "recover"]:
		if distance > float(movement["ranged_ideal_max"]):
			_move_flow_native(world.get_path_direction(global_position), ticks)
		elif distance < float(movement["ranged_ideal_min"]) and distance > float(movement["ranged_retreat_stop_distance"]):
			var offset = -Vector2.from_angle(facing) * float(data["speed_pixels_per_tick"]) * float(movement["ranged_retreat_multiplier"]) * ticks
			if not world.is_world_blocked(global_position + offset):
				global_position += offset
		distance = global_position.distance_to(player.global_position)
	# Existing charge commits before the non-alerted far-return gate.
	if charge_ticks > 0.0:
		charge_ticks -= ticks
		if charge_ticks <= 0.0:
			charge_ticks = 0.0
			_fire_projectile()
	if (not alerted and distance > 400.0) or float(player.get("hp")) <= 0.0:
		_finish_motion(before, ticks)
		return
	_state_ticks -= ticks
	if state == "idle":
		if distance < float(movement["idle_retreat_below"]):
			_move_native(-Vector2.from_angle(facing) * float(data["speed_pixels_per_tick"]) * float(movement["idle_retreat_multiplier"]), ticks)
		elif distance > float(movement["idle_advance_above"]):
			_move_native(Vector2.from_angle(facing) * float(data["speed_pixels_per_tick"]) * float(movement["idle_advance_multiplier"]), ticks)
		_apply_separation(ticks)
		# Type1 is absent from the native melee-contact registry. Do not hit
		# by body overlap. Keep distance from the first stage for this gate.
		if charge_ticks <= 0.0:
			_projectile_ticks -= ticks
			if _projectile_ticks <= 0.0 and distance < float(data["projectile_range"]):
				_projectile_ticks = float(data["projectile_cooldown_ticks"])
				charge_ticks = float(data["projectile_charge_ticks"])
				telemetry_event.emit("enemy_charge", {"id": data["id"], "ticks": charge_ticks, "position": [global_position.x, global_position.y], "bean": "normal", "parry_class": "magic"})
	elif state == "recover" and _state_ticks <= 0.0:
		state = "idle"
		_state_ticks = 15.0 + _rng.randf() * 15.0
	# Conditional ticket/eCircle melee has no admitted automatic entry.
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
	var shot = LIGHTNING_PROJECTILE.new()
	shot.configure(global_position, aim, data["projectile"].duplicate(true), player, world, native_frame)
	shot.telemetry_event.connect(_forward_event)
	world.add_child(shot)
	telemetry_event.emit("enemy_projectile_birth", {"id": data["id"], "position": [global_position.x, global_position.y], "aim": [aim.x, aim.y], "life_ticks": shot.life_ticks, "damage": shot.damage, "native_dtype": "magic", "parry_class": "magic", "element": element})

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
				_state_ticks = 0.0
			elif state == "idle":
				_state_ticks = minf(_state_ticks, 5.0)
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
	var display_angle: float=facing
	if is_instance_valid(player) and player.hp>0 and global_position.distance_squared_to(player.global_position)<640000:
		display_angle=(player.global_position-global_position).angle()
	var direction_index = posmod(roundi(fposmod(display_angle, TAU) / (PI / 4.0)), 8)
	var direction: String = animation["direction_angle_sectors"][direction_index]
	_body.texture = _base_textures[direction]
	_body.region_rect = _rect(animation["base_rect"])
	_walk.texture = _walk_textures[direction]
	var frame = posmod(int(floor(_walk_distance / float(animation["walk_pixels_per_frame"]))), 4)
	_walk.region_rect = _rect(animation["walk_frame_rects"][frame])
	_walk.visible = _moving
	var spawn_alpha = maxf(0.0, 1.0 - _spawn_ticks / 20.0) if _spawn_ticks > 0.0 else 1.0
	var visual: Dictionary=data.native_final
	if visual.get("_cloaked",false):spawn_alpha*=.08+sin(Time.get_ticks_msec()/300)*.05
	elif float(visual.get("reviveIframes",0))>0:spawn_alpha*=maxf(0,.2+sin(Time.get_ticks_msec()/40)*.5)
	elif _stun_ticks>0:spawn_alpha*=.6
	_body.modulate = Color(1,1,1,spawn_alpha)
	_walk.modulate = _body.modulate

func _rect(value: Array) -> Rect2:
	return Rect2(float(value[0]), float(value[1]), float(value[2]), float(value[3]))

func get_snapshot() -> Dictionary:
	return {"id": data["id"], "order": source_order, "etype": etype, "element": element, "state": state, "alive": alive, "alerted": alerted, "hp": hp, "max_hp": max_hp, "eShield": eShield, "eShieldMax": eShieldMax, "poise": poise, "max_poise": max_poise, "charge_ticks": charge_ticks, "projectile_ticks": _projectile_ticks, "idle_ticks": _state_ticks, "hit_stun_ticks": _hit_stun, "stun_ticks": _stun_ticks, "poise_regen_ticks": _poise_regen, "walk_distance": _walk_distance, "native_frame": native_frame, "facing": facing, "position": [position.x, position.y], "knockback": [_knockback.x, _knockback.y], "pending_poise_amount": _pending_poise_amount, "last_flow_direction": [_last_flow_direction.x, _last_flow_direction.y], "flow_stuck_ticks": _flow_stuck_ticks, "native_type_traits": native_type_traits.duplicate(true), "undead_for_anti_revive": bool(native_type_traits["undead"]), "full_equipment_modifiers_ported": bool(native_type_traits["full_equipment_modifiers_ported"])}

func _draw() -> void:
	if not alive:
		return
	if charge_ticks > 0.0:
		var progress = 1.0 - charge_ticks / float(data["projectile_charge_ticks"])
		draw_arc(Vector2.ZERO, radius + 13.0, -PI * 0.5, -PI * 0.5 + TAU * progress, 48, Color(1.0, 238.0 / 255.0, 0.0, 0.85), 3.0, true)
	# P2-001a: 에너지 바 — 원본 drawEn(53961~53969) 규칙 그대로 (enemy.gd와 동일 공용 레이아웃).
	for bar in BAR_LAYOUT.build(radius, float(hp), float(mhp), eShield, eShieldMax,
			_stun_ticks, (data.get("native_final", {}) as Dictionary).get("_maxStunned")):
		draw_rect(bar["rect"], Color(bar["color"],bar["color"].a*_body.modulate.a))
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

func apply_native_normal_enemy_poise_core(amount: int) -> Dictionary:
	return HURTE_OWNER.apply_poise_core(self, amount)

# PCI-10 (PC-LIFE-PACK 2026-10-21): 시체 부활 writer(G38949–38950). 공용 구현 HURTE_OWNER.apply_corpse_revive.
func apply_native_enemy_corpse_revive(caller_world: Node) -> Dictionary:
	return HURTE_OWNER.apply_corpse_revive(self, caller_world, "_state_ticks")
