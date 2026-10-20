extends "res://scripts/enemy_melee_ch1_ice_warrior.gd"

const DARK_PROFILE := "native_ch1_etype21_dark_archer_v1"
const DARK_PROJECTILE = preload("res://scripts/enemy_projectile_dark.gd")
var dark_error := ""

static func build_dark_runtime(record: Dictionary) -> Dictionary:
	var runtime: Dictionary = build_runtime(record)
	runtime.ai_profile = DARK_PROFILE
	runtime.projectile = {"element": "dark", "element_id": 3, "parry_class": "magic", "native_dtype": "magic",
		"gbBean": true, "source_caller": "etype21_dark_burst", "base_damage": int(record.attack) * 2,
		"life_ticks": 240.0, "size": 3.2}
	return runtime

func _physics_process(delta: float) -> void:
	if not alive or not dark_error.is_empty(): return
	var ticks := delta * float(data.native_tick_rate)
	native_frame += ticks
	_spawn_ticks = maxf(0.0, _spawn_ticks - ticks)
	_hit_flash = maxf(0.0, _hit_flash - ticks)
	_hit_stun = maxf(0.0, _hit_stun - ticks)
	_stun_ticks = maxf(0.0, _stun_ticks - ticks)
	var before := global_position
	if _knockback.length_squared() > 0.02:
		_move_native(_knockback, ticks)
		_knockback *= pow(0.85, ticks)
	if _hit_stun > 0.0 or _stun_ticks > 0.0:
		charge_ticks = 0.0
		_finish_motion(before, ticks)
		return
	if poise < max_poise:
		_poise_regen += ticks
		if _poise_regen >= 200.0:
			poise = minf(max_poise, poise + floorf(max_poise * 0.15))
			_poise_regen = 0.0
	if not is_instance_valid(player):
		_finish_motion(before, ticks)
		return
	var distance := global_position.distance_to(player.global_position)
	if not alerted and state in ["idle", "recover"] and distance < 800.0 and world.has_line_of_sight(global_position, player.global_position): alerted = true
	if alerted and distance < 800.0: facing = (player.global_position - global_position).angle()
	if alerted and state in ["idle", "recover"]:
		if distance > 800.0 * 0.85:
			_move_flow(ticks)
			distance = global_position.distance_to(player.global_position)
		elif distance < 800.0 * 0.65 and distance > 30.0:
			var angle := (global_position - player.global_position).angle()
			var destination := global_position + Vector2.from_angle(angle) * float(data.speed_pixels_per_tick) * ticks * 0.5
			if not world.is_world_blocked(destination):
				global_position = destination
				distance = global_position.distance_to(player.global_position)
	if charge_ticks > 0.0:
		charge_ticks -= ticks
		if charge_ticks <= 0.0: _fire_projectile()
	if not dark_error.is_empty() or (not alerted and distance > 400.0):
		_finish_motion(before, ticks)
		return
	st2 -= ticks
	if state == "idle":
		if distance < 80.0:
			_move_native(-Vector2.from_angle(facing) * float(data.speed_pixels_per_tick) * 0.6, ticks)
		elif distance > 200.0:
			_move_native(Vector2.from_angle(facing) * float(data.speed_pixels_per_tick) * 1.2, ticks)
		_apply_separation(ticks)
		if charge_ticks <= 0.0:
			_projectile_ticks -= ticks
			if _projectile_ticks <= 0.0 and distance < 800.0:
				_projectile_ticks = float(data.native_final.projCd)
				charge_ticks = 60.0
	elif state == "recover" and st2 <= 0.0:
		state = "idle"
		st2 = 15.0 + world.sample_native_random_unit() * 15.0
	_finish_motion(before, ticks)

func _fire_projectile() -> void:
	if not alive or not is_instance_valid(player): return
	facing = (player.global_position - global_position).angle()
	var profile: Dictionary = data.projectile.duplicate(true)
	profile.speed_pixels_per_second = 500.0 + world.sample_native_random_unit() * 100.0
	var shot := DARK_PROJECTILE.new()
	if not shot.configure(world.to_local(global_position), Vector2.from_angle(facing), profile, player, world, world.get_native_frame()):
		dark_error = shot.get_last_error()
		shot.free()
		telemetry_event.emit("enemy_native_stop", {"id": data.id, "reason": dark_error})
		return
	shot.telemetry_event.connect(_forward_event)
	world.add_child(shot)
	world.emit_native_parts(global_position, "#a44cff", 3)

func get_snapshot() -> Dictionary:
	var result: Dictionary = super.get_snapshot()
	result["dark_error"] = dark_error
	return result

func _draw() -> void:
	if not alive: return
	for bar in BAR_LAYOUT.build(radius, float(hp), float(mhp), eShield, eShieldMax, _stun_ticks, (_maxStunned if _source_max_stunned_present else null)):
		draw_rect(bar.rect, bar.color)
	if charge_ticks <= 0.0: return
	var progress := clampf(1.0 - charge_ticks / 60.0, 0.0, 1.0)
	draw_arc(Vector2.ZERO, radius + 10.0, 0, TAU, 128, Color(8.0 / 255, 8.0 / 255, 8.0 / 255, 0.28), 5.0, true)
	if progress > 0.0:
		var color := Color("#a44cff")
		color.a = 0.8 + progress * 0.2
		draw_arc(Vector2.ZERO, radius + 10.0, -PI / 2.0, -PI / 2.0 + TAU * progress, 128, color, 3.5, true)
		draw_circle(Vector2.from_angle(-PI / 2.0) * (radius + 10.0), 1.75, color)
		draw_circle(Vector2.from_angle(-PI / 2.0 + TAU * progress) * (radius + 10.0), 1.75, color)
