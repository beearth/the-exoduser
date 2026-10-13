extends CharacterBody2D
## Small native combat consumer; this is not the full inventory/save/parry runtime.

signal crescent_requested(step: int, charge_frames: float, direction: Vector2)
signal stats_changed
signal telemetry_event(kind: String, data: Dictionary)

const HIT_EFFECT = preload("res://scripts/hit_effect.gd")
const SLASH_SHEET = preload("res://assets/vfx/ki_slash_radiant_sheet.png")
const ADDITIVE = preload("res://assets/vfx/radiant.gdshader")
const DIRECTIONS: Array[String] = ["south", "south-east", "east", "north-east", "north", "north-west", "west", "south-west"]
const NATIVE_BURN_MAX_STACKS = 10
const NATIVE_BURN_DURATION_TICKS = 600.0
const NATIVE_BURN_INTERVAL_TICKS = 30.0
const NATIVE_BURN_POOL_DIVISOR = 20.0
@export var hp: int = 350
@export var max_hp: int = 350
@export var stamina: float = 200.0
@export var max_stamina: float = 200.0
@export var melee_ref: float = 8.0
@export var stat_str: float = 1.0
@export var attack_multiplier: float = 0.7
@export var ki_slash_level: int = 1
@export var charge_frames: float = 0.0
@export var combo_step: int = 0
@export var visual_scale: float = 2.5
@export var radius: float = 15.0
@export var base_def: float = 2.0
@export var energy_def: float = 0.0
@export var iframes: float = 0.0
@export var poise: int = 4
@export var max_poise: int = 4
var state: String = "idle"
var facing := Vector2.RIGHT
var combat: Dictionary = {}
var _world: Node
var _sprite: AnimatedSprite2D
var _charge_sprites: Array[AnimatedSprite2D] = []
var _charge_marks: Node2D
var _weapon_held: bool = false
var _accessibility_hold: bool = false
var _blocked_until_release: bool = false
var _was_wall_contact: bool = false
var _state_left: float = 0.0
var _combo_left: float = 0.0
var _crescent_cooldown: float = 0.0
var _clock_frames: float = 0.0
var _walk_distance: float = 0.0
var _attack_direction := Vector2.RIGHT
var _atk_bonus: int = 0
var _melee_contact_done: bool = false
var _was_moving: bool = false
var _movement_speed: float = 156.0
var _stamina_regen_base: float = 0.28
var _recovery_ticks: float = 53.0
var _charge_step: float = 40.0
var _charge_max: float = 120.0
var _swing_ticks: float = 5.0
var _knockback := Vector2.ZERO
var _native_burns: Array[Dictionary] = []

func set_world(world: Node) -> void:
	_world = world

func get_combat_world() -> Node:
	return _world

func set_combat(data: Dictionary) -> void:
	combat = data
	if is_node_ready():
		_apply_combat_values()

func _ready() -> void:
	motion_mode = CharacterBody2D.MOTION_MODE_FLOATING
	collision_layer = 2
	collision_mask = 1 | 4
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	if combat.is_empty():
		var decoded = JSON.parse_string(FileAccess.get_file_as_string("res://data/combat.json"))
		if decoded is Dictionary:
			combat = decoded
	_apply_combat_values()
	var body_shape := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = radius
	body_shape.shape = circle
	add_child(body_shape)
	_build_sprite()
	_build_charge_display()
	_update_display()
	stats_changed.emit()

func _apply_combat_values() -> void:
	var profile: Dictionary = combat.get("player", {})
	var skill: Dictionary = combat.get("kiSlash", {})
	_movement_speed = float(profile.get("movement_per_tick", 2.6)) * 60.0
	_stamina_regen_base = float(profile.get("stamina_regen_base", 0.28))
	_charge_step = float(skill.get("charge_step_ticks", 40.0))
	_charge_max = float(skill.get("charge_max_ticks", 120.0))
	_swing_ticks = float(skill.get("swing_ticks", 5.0))
	_recovery_ticks = maxf(1.0, floor(float(skill.get("recovery_numerator", 16.0)) / (float(skill.get("weapon_speed_fallback", 0.3)) * float(skill.get("dex_multiplier", 1.0)) * (1.0 + float(skill.get("attack_speed_affix_sum", 0.0))))))

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.physical_keycode == KEY_SPACE:
		if _accessibility_hold:
			release_attack()
		elif combo_step == 2 and state == "idle":
			if request_attack() and state == "windup":
				_accessibility_hold = true
				telemetry_event.emit("accessibility_charge_hold", {"input": "Space", "native_lmb_hold": false})
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("cancel_charge"):
		cancel_attack()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("weapon"):
		_weapon_held = true
		request_attack()
	elif event.is_action_released("weapon"):
		if not _accessibility_hold:
			release_attack()

func request_attack() -> bool:
	_weapon_held = true
	if hp <= 0 or state != "idle" or _blocked_until_release:
		return false
	var cost: float = attack_cost()
	if stamina < cost:
		telemetry_event.emit("stamina_insufficient", {"required": cost, "stamina": stamina})
		return false
	stamina -= cost
	_atk_bonus = int(floor(cost * 1.5))
	_attack_direction = facing
	if combo_step == 2 and _combo_left > 0.0:
		state = "windup"
		charge_frames = 0.0
		_state_left = 999.0
		telemetry_event.emit("charge_started", {"step": 3, "cost": cost})
	else:
		_begin_swing((combo_step % 3) + 1, 0.0)
	stats_changed.emit()
	return true

func release_attack() -> void:
	_weapon_held = false
	_accessibility_hold = false
	_blocked_until_release = false
	if state == "windup" and hp > 0:
		var held_frames: float = charge_frames
		charge_frames = 0.0
		_begin_swing(3, held_frames)
		stats_changed.emit()

func cancel_attack() -> bool:
	if hp <= 0 or state not in ["windup", "swing", "recover"]:
		return false
	var cancelled_state: String = state
	# The prototype ports cancellation only. No shield/parry/cost/cooldown is claimed.
	if state == "windup":
		combo_step = 0
		_combo_left = 0.0
	state = "idle"
	_state_left = 0.0
	charge_frames = 0.0
	_accessibility_hold = false
	_atk_bonus = 0
	_blocked_until_release = true
	telemetry_event.emit("attack_cancelled", {"previous_state": cancelled_state, "q_scope": "cancel_only", "emitted_crescents_preserved": true})
	stats_changed.emit()
	return true

func attack_cost() -> float:
	var skill: Dictionary = combat.get("kiSlash", {})
	return float(skill.get("cost_base", 10.0)) + (ki_slash_level - 1) * float(skill.get("cost_per_level", 2.0))

func is_charging() -> bool:
	return state == "windup" and hp > 0

func charge_tier() -> int:
	return mini(3, int(floor(maxf(0.0, charge_frames) / _charge_step)))

func _begin_swing(step: int, held_frames: float) -> void:
	state = "swing"
	_state_left = _swing_ticks
	_melee_contact_done = false
	_attack_direction = facing
	combo_step = step
	var skill: Dictionary = combat.get("kiSlash", {})
	_combo_left = float(skill.get("combo_ticks", 120.0))
	_crescent_cooldown = 20.0 if step == 3 else 12.0
	crescent_requested.emit(step, held_frames, _attack_direction)
	telemetry_event.emit("kiSlash_fired", {"step": step, "charge_frames": held_frames, "direction": _attack_direction})

func _physics_process(delta: float) -> void:
	var ticks: float = delta * 60.0
	_clock_frames += ticks
	iframes = maxf(0.0, iframes - ticks)
	if hp <= 0:
		velocity = Vector2.ZERO
		return
	var aim: Vector2 = get_global_mouse_position() - global_position
	if aim.length_squared() > 1.0:
		facing = aim.normalized()
	var held: bool = _weapon_held or _accessibility_hold or Input.is_action_pressed("weapon")
	if not held:
		_blocked_until_release = false
	if state == "idle" and held and not _blocked_until_release:
		request_attack()
	var before_stamina: float = stamina
	var divisor: float = 8.0 if state == "idle" else 16.0
	stamina = minf(max_stamina, stamina + _stamina_regen_base / divisor * ticks)
	var move_input: Vector2 = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	var speed_scale: float = 1.0 if state == "idle" else (0.0 if state in ["stagger", "pStun"] else 0.8)
	velocity = move_input * _movement_speed * speed_scale
	if absf(_knockback.x) > 0.1 or absf(_knockback.y) > 0.1:
		velocity += _knockback * 0.5 * 60.0
		_knockback *= pow(0.65, ticks)
	var previous_position: Vector2 = global_position
	move_and_slide()
	var wall_contact: bool = false
	for index in range(get_slide_collision_count()):
		var contact: KinematicCollision2D = get_slide_collision(index)
		var collider = contact.get_collider()
		if collider is CollisionObject2D and (collider.collision_layer & 1) != 0:
			wall_contact = true
	if wall_contact and not _was_wall_contact:
		telemetry_event.emit("wall_contact", {"position": global_position, "velocity": velocity, "collisions": get_slide_collision_count()})
	_was_wall_contact = wall_contact
	var moved: float = global_position.distance_to(previous_position)
	_walk_distance += moved
	_was_moving = moved > 0.001
	if state == "idle":
		# The native _rbBurn loop belongs to the entered idle case. Walking
		# keeps this state; other cases returning to idle wait until next tick.
		_tick_native_burns(ticks)
	elif state == "windup":
		_attack_direction = facing
		var previous_tier: int = charge_tier()
		charge_frames = minf(_charge_max, charge_frames + ticks)
		if charge_tier() > previous_tier:
			telemetry_event.emit("charge_tier", {"tier": charge_tier(), "frames": charge_frames, "multiplier": pow(2.0, charge_tier())})
			if charge_tier() == 3:
				_full_charge_flash()
		if not held:
			release_attack()
	elif state == "swing":
		_state_left -= ticks
		if not _melee_contact_done and _swing_ticks - _state_left >= 2.0:
			_melee_contact_done = true
			_melee_contact()
		if _state_left <= 0.0:
			state = "recover"
			_state_left = _recovery_ticks
	elif state == "recover":
		_state_left -= ticks
		if _state_left <= 0.0:
			state = "idle"
	elif state in ["stagger", "pStun"]:
		_state_left -= ticks
		if _state_left <= 0.0:
			if state == "pStun":
				poise = max_poise
				iframes = 60.0
				telemetry_event.emit("player_stun_ended", {"poise": poise, "iframes": iframes})
			state = "idle"
			stats_changed.emit()
	if _crescent_cooldown > 0.0:
		_crescent_cooldown -= ticks
	if _combo_left > 0.0:
		_combo_left -= ticks
		if _combo_left <= 0.0:
			combo_step = 0
	if stamina != before_stamina or state == "windup":
		stats_changed.emit()

func receive_damage(amount: int, damage_type: String = "phys", source_direction: Vector2 = Vector2.ZERO, native_knockback_strength: float = -1.0) -> void:
	if hp <= 0 or iframes > 0.0:
		return
	var defence: float = energy_def if damage_type in ["magic", "parry"] else base_def
	var reduction: float = minf(0.75, defence / (defence + 2500.0))
	var capped: int = mini(amount, int(floor(max_hp * 0.33)))
	var final_damage: int = maxi(maxi(1, int(floor(max_hp * 0.005))), int(floor(capped * (1.0 - reduction))))
	hp = maxi(0, hp - final_damage)
	# Literal native non-DOT hurtP resets iframe to zero AFTER its cap calculation.
	# Do not invent ordinary-hit/cap invulnerability from the earlier stale doc note.
	iframes = 0.0
	if state != "pStun":
		poise = maxi(0, poise - 1)
		if poise <= 0:
			state = "pStun"
			_state_left = 240.0
			charge_frames = 0.0
			combo_step = 0
			_combo_left = 0.0
			_accessibility_hold = false
			telemetry_event.emit("player_stunned", {"ticks": 240.0, "charge_interrupted": true, "emitted_crescents_preserved": true})
		elif not is_charging():
			state = "stagger"
			_state_left = 6.0
	# Native projectile opts.knockback replaces the generic impulse calculation;
	# both paths add their impulse only after the existing hurtP acceptance gates.
	var strength: float = native_knockback_strength if native_knockback_strength >= 0.0 else clampf(float(final_damage) / max_hp * 30.0, 1.0, 12.0)
	var push: Vector2 = source_direction.normalized() if source_direction.length_squared() > 0.0 else Vector2.from_angle(randf() * TAU)
	_knockback += push * strength
	telemetry_event.emit("player_damage", {"raw_amount": amount, "amount": final_damage, "damage_type": damage_type, "hp": hp, "poise": poise, "iframes": iframes, "charging_preserved": is_charging(), "defence": defence})
	if hp == 0:
		state = "dead"
		charge_frames = 0.0
		_weapon_held = false
		_accessibility_hold = false
		velocity = Vector2.ZERO
		telemetry_event.emit("player_died", {"emitted_crescents_preserved": true})
	stats_changed.emit()

func get_snapshot() -> Dictionary:
	return {"hp": hp, "max_hp": max_hp, "stamina": stamina, "max_stamina": max_stamina, "state": state, "combo_step": combo_step, "charge_frames": charge_frames, "charge_tier": charge_tier(), "damage_multiplier": pow(2.0, charge_tier()), "position": global_position, "melee_ref": melee_ref, "q_scope": "cancel_only", "accessibility_hold": _accessibility_hold, "poise": poise, "max_poise": max_poise, "iframes": iframes, "base_def": base_def, "energy_def": energy_def, "burn_stacks": get_native_burn_snapshot()}

func apply_native_burn(total_damage: float) -> bool:
	# Called after the existing redBean generic-contact path, independently
	# of hurtP acceptance or lethal HP damage. Source cap ignores new stacks.
	if _native_burns.size() >= NATIVE_BURN_MAX_STACKS:
		return false
	_native_burns.append({"total": total_damage, "t": NATIVE_BURN_DURATION_TICKS, "tick": 0.0})
	telemetry_event.emit("native_burn_applied", {"total": total_damage, "t": NATIVE_BURN_DURATION_TICKS, "tick": 0.0, "stack_count": _native_burns.size()})
	stats_changed.emit()
	return true

func get_native_burn_snapshot() -> Array[Dictionary]:
	return _native_burns.duplicate(true)

func _tick_native_burns(ticks: float) -> void:
	var surviving: Array[Dictionary] = []
	# Do not re-check state after an earlier stack kills the player: the
	# entered native idle loop still consumes each remaining stack's clock.
	for index in range(_native_burns.size()):
		var burn: Dictionary = _native_burns[index]
		burn["t"] = float(burn["t"]) - ticks
		burn["tick"] = float(burn["tick"]) + ticks
		if float(burn["t"]) <= 0.0:
			telemetry_event.emit("native_burn_expired", {"index": index, "total": burn["total"], "t": burn["t"], "tick": burn["tick"]})
			continue
		if float(burn["tick"]) >= NATIVE_BURN_INTERVAL_TICKS:
			# Exactly one request; source resets to zero rather than retaining
			# overshoot or synthesizing a while-loop of scheduled pulses.
			burn["tick"] = 0.0
			var raw_damage: int = maxi(1, int(float(burn["total"]) / NATIVE_BURN_POOL_DIVISOR))
			var hp_damage: int = _receive_native_burn_damage(raw_damage)
			telemetry_event.emit("native_burn_pulse", {"index": index, "total": burn["total"], "t": burn["t"], "tick": burn["tick"], "raw_amount": raw_damage, "amount": hp_damage, "accepted": hp_damage > 0, "dot": true, "burn": true, "src": "화상"})
		surviving.append(burn)
	_native_burns = surviving

func _receive_native_burn_damage(amount: int) -> int:
	if hp <= 0 or state in ["fallen", "dead"] or iframes > 0.0:
		return 0
	# Raw/no-equipment native hurtP opts={dot:true,burn:true,src:'화상'}.
	# Keep direct-hit receive_damage and all of its consumers unchanged.
	var reduction: float = minf(0.75, base_def / (base_def + 2500.0))
	var capped: int = mini(amount, int(floor(max_hp * 0.33)))
	var final_damage: int = maxi(maxi(1, int(floor(max_hp * 0.005))), int(floor(capped * (1.0 - reduction))))
	hp = maxi(0, hp - final_damage)
	iframes = 0.0
	# DOT skips poise, stagger/stun, knockback, bite and attack cancellation.
	telemetry_event.emit("player_damage", {"raw_amount": amount, "amount": final_damage, "damage_type": "phys", "hp": hp, "poise": poise, "iframes": iframes, "charging_preserved": is_charging(), "defence": base_def, "dot": true, "burn": true, "src": "화상"})
	if hp == 0:
		# Existing terminal-death consumer; full fallen/revival remains absent.
		# Retain the burn array, as native die does, and stop future idle ticks.
		state = "dead"
		_weapon_held = false
		_accessibility_hold = false
		velocity = Vector2.ZERO
		telemetry_event.emit("player_died", {"emitted_crescents_preserved": true, "dot": true, "burn": true, "burn_stacks_retained": true})
	stats_changed.emit()
	return final_damage

func _melee_contact() -> void:
	if not is_instance_valid(_world) or not _world.has_method("get_enemies"):
		_atk_bonus = 0
		return
	# mkP/no-equipment native hitArc packet, before downstream enemy defenses.
	var amount: int = int(floor(floor((melee_ref + 15.0) * 6.0) * attack_multiplier)) + _atk_bonus
	_atk_bonus = 0
	for candidate in _world.get_enemies():
		if not is_instance_valid(candidate) or not candidate is Node2D or not candidate.has_method("receive_damage"):
			continue
		var enemy: Node2D = candidate
		if "hp" in enemy and int(enemy.get("hp")) <= 0:
			continue
		var target_radius: float = float(enemy.get("radius")) if "radius" in enemy else 15.0
		var offset: Vector2 = enemy.global_position - global_position
		if offset.length() <= 50.0 + target_radius and absf(_attack_direction.angle_to(offset)) < 0.95:
			enemy.receive_damage(amount, offset.normalized(), "weapon")
			telemetry_event.emit("melee_hit", {"damage": amount, "enemy_id": enemy.get_instance_id()})

func _full_charge_flash() -> void:
	var flash = HIT_EFFECT.new()
	get_parent().add_child(flash)
	flash.configure(global_position, _attack_direction, 627.0 * 0.26, 2, 2.0)

func _build_sprite() -> void:
	_sprite = AnimatedSprite2D.new()
	_sprite.name = "Warrior"
	_sprite.centered = false
	_sprite.scale = Vector2.ONE * visual_scale
	_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	var attack: Texture2D = load("res://assets/player/attack-bat-v1.png")
	for direction_index in range(8):
		var dir: String = DIRECTIONS[direction_index]
		var source: Texture2D = load("res://assets/player/" + dir + ".png")
		for mode in ["idle", "walk", "source_attack", "attack"]:
			var animation: StringName = StringName(mode + "_" + dir)
			frames.add_animation(animation)
			frames.set_animation_loop(animation, mode in ["idle", "walk"])
			var count: int = 2 if mode == "idle" else (9 if mode == "attack" else 8)
			var offset: int = 0 if mode == "idle" else (2 if mode == "walk" else 10)
			frames.set_animation_speed(animation, 60.0 / (48.0 if mode == "idle" else 8.0))
			for index in range(count):
				var atlas := AtlasTexture.new()
				atlas.atlas = attack if mode == "attack" else source
				atlas.region = Rect2(index * 80, direction_index * 80, 80, 80) if mode == "attack" else Rect2((offset + index) * 48, 0, 48, 48)
				frames.add_frame(animation, atlas)
	_sprite.sprite_frames = frames
	add_child(_sprite)

func _build_charge_display() -> void:
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	frames.add_animation("charge")
	for index in range(3):
		var atlas := AtlasTexture.new()
		atlas.atlas = SLASH_SHEET
		atlas.region = Rect2(index * 418, 0, 418, 418)
		frames.add_frame("charge", atlas)
	for index in range(2):
		var sprite := AnimatedSprite2D.new()
		sprite.sprite_frames = frames
		sprite.animation = "charge"
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		var material := ShaderMaterial.new()
		material.shader = ADDITIVE
		material.set_shader_parameter("hue_degrees", 150.0)
		sprite.material = material
		sprite.z_index = 10
		add_child(sprite)
		_charge_sprites.append(sprite)
	_charge_marks = Node2D.new()
	_charge_marks.z_index = 11
	_charge_marks.draw.connect(_draw_charge_marks)
	add_child(_charge_marks)

func _process(_delta: float) -> void:
	_update_display()

func _update_display() -> void:
	if _sprite == null:
		return
	var direction: Vector2 = _attack_direction if state in ["swing", "recover", "windup"] else facing
	var direction_index: int = posmod(int(round((PI / 2.0 - direction.angle()) / (PI / 4.0))), 8)
	var mode: String = "attack" if state in ["windup", "swing", "recover"] else ("walk" if state == "idle" and _was_moving and hp > 0 else "idle")
	var animation: StringName = StringName(mode + "_" + DIRECTIONS[direction_index])
	if _sprite.animation != animation:
		_sprite.animation = animation
	# Native center stays P. Both source feet align at P.y + 23*visual_scale.
	_sprite.offset = Vector2(-40, -35) if mode == "attack" else Vector2(-24, -24)
	if mode == "attack":
		_sprite.frame = _attack_frame()
	elif mode == "walk":
		_sprite.frame = posmod(int(floor(_walk_distance * 8.0 / 256.0)), 8)
	else:
		_sprite.frame = int(floor(_clock_frames / 48.0)) % 2
	_sprite.modulate = Color(0.65, 0.65, 0.65, 1.0) if hp <= 0 else Color.WHITE
	for sprite in _charge_sprites:
		sprite.visible = is_charging()
	_charge_marks.visible = is_charging()
	if is_charging():
		var tier: int = charge_tier()
		var pulse: float = 1.0 + sin(_clock_frames / 60.0 * 25.0) * 0.035
		var width: float = (78.0 + tier * 13.0 + 4.0 * fmod(charge_frames, _charge_step) / _charge_step) * pulse
		for index in range(2):
			var sprite: AnimatedSprite2D = _charge_sprites[index]
			sprite.frame = int(floor(_clock_frames / 7.0)) % 3
			sprite.rotation = _attack_direction.angle()
			sprite.scale = Vector2(width * (0.96 if index == 0 else 0.82), width * (1.0 if index == 0 else 0.86)) / 418.0
			sprite.modulate.a = (0.24 + 0.08 * tier) if index == 0 else (0.58 + 0.08 * tier)
		_charge_marks.queue_redraw()

func _attack_frame() -> int:
	if state == "windup":
		# Native charge keeps st2=999; WarriorBatSwing windup clamps to pose zero.
		return 0
	var speed: float = 0.85
	if state == "swing":
		return mini(6, 2 + int(floor(maxf(0.0, (_swing_ticks - _state_left) * speed))))
	if _state_left <= 0.0:
		return 8
	var elapsed: float = _recovery_ticks - _state_left
	var delay: float = 5.0 * (1.0 / speed - 1.0)
	if elapsed < delay:
		return mini(6, 2 + int(floor((5.0 + elapsed) * speed)))
	var progress: float = clampf(1.0 - _state_left / maxf(1.0, _recovery_ticks - delay), 0.0, 1.0)
	return 6 if progress < 0.45 else (7 if progress < 0.8 else 8)

func _draw_charge_marks() -> void:
	var width: float = 78.0 + charge_tier() * 13.0 + 4.0 * fmod(charge_frames, _charge_step) / _charge_step
	var transform := Transform2D(_attack_direction.angle(), Vector2.ZERO)
	for index in range(3):
		var point := Vector2(-width * 0.23 + index * 12.0, width * 0.29)
		_charge_marks.draw_line(transform * point, transform * (point + Vector2(9, -12)), Color("fff4df") if index < charge_tier() else Color("8c3445"), 4.0 if index < charge_tier() else 2.0, true)
