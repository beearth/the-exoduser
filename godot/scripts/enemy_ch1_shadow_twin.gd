extends "res://scripts/enemy_melee_ch1_ice_warrior.gd"

const SHADOW_PROFILE := "native_ch1_etype47_shadow_twin_v1"
const CLONE = preload("res://scripts/native_shadow_clone_recipe.gd")
const TELEPORT = preload("res://scripts/native_shadow_teleport.gd")
var shadow_state: Dictionary = {}
var clone_attempts := 0
var last_discarded_clone: Dictionary = {}
var shadow_error := ""
var _teleport: Node2D

static func build_shadow_runtime(record: Dictionary) -> Dictionary:
	var runtime: Dictionary = build_runtime(record)
	runtime.ai_profile = SHADOW_PROFILE
	var physical: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/etype0_physical_flesh_crawler.json"))
	runtime.projectile = physical.runtime.projectile.duplicate(true)
	return runtime

func configure(value: Dictionary, owner_world: Node2D) -> void:
	super.configure(value, owner_world)
	for key in ["_stCloneCd", "_stCloneT", "_stTpCd", "_tpWarnT", "_tpWarnMax", "_tpWarnX", "_tpWarnY", "_tpWarnCol"]:
		shadow_state[key] = value.native_final[key]

func set_player(value: Node2D) -> void:
	player = value
	if is_instance_valid(_teleport): return
	var helper := TELEPORT.new()
	if not helper.configure_shadow(self, player, world, shadow_state):
		shadow_error = "actual_shadow_teleport_dependencies_not_ready"
		helper.free()
		return
	_teleport = helper
	world.add_child(helper)

func _physics_process(delta: float) -> void:
	if not alive or not shadow_error.is_empty(): return
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
	if alerted and state in ["idle", "recover"] and distance > 30.0:
		_move_flow(ticks)
		distance = global_position.distance_to(player.global_position)
	if shadow_state.get("_tpFlashT", 0.0) > 0.0: shadow_state._tpFlashT -= ticks
	if charge_ticks > 0.0:
		charge_ticks -= ticks
		if charge_ticks <= 0.0: _fire_projectile()
	if not alerted and distance > 400.0:
		_finish_motion(before, ticks)
		return
	st2 -= ticks
	if state == "idle":
		_advance_shadow(ticks, distance)
		if not shadow_error.is_empty():
			_finish_motion(before, ticks)
			return
		_move_native(Vector2.from_angle(facing) * float(data.speed_pixels_per_tick) * 1.6, ticks)
		_apply_separation(ticks)
		if charge_ticks <= 0.0:
			_projectile_ticks -= ticks
			if _projectile_ticks <= 0.0 and distance < 400.0:
				_projectile_ticks = float(data.native_final.projCd)
				charge_ticks = 60.0
	elif state == "recover" and st2 <= 0.0:
		state = "idle"
		st2 = 15.0 + _sample_unit() * 15.0
	_finish_motion(before, ticks)

func _advance_shadow(ticks: float, distance: float) -> void:
	shadow_state._stCloneT -= ticks
	shadow_state._stTpCd -= ticks
	if shadow_state._stCloneT <= 0.0 and world.get_enemies().size() < 200:
		var context: Dictionary = world.read_native_initial_encounter_spawn_context()
		if context.is_empty():
			shadow_error = "actual_clone_constructor_context_not_ready"
			return
		shadow_state._stCloneT = shadow_state._stCloneCd
		var clone_x := global_position.x + (_sample_unit() - 0.5) * 60.0
		var clone_y := global_position.y + (_sample_unit() - 0.5) * 60.0
		last_discarded_clone = CLONE.build(clone_x, clone_y, context, Callable(self, "_sample_unit"), Callable(world, "can_move"), Callable(world, "native_safe_point"))
		clone_attempts += 1
		if not last_discarded_clone.valid:
			shadow_error = last_discarded_clone.reason
			return
		world.emit_native_text(global_position.x, global_position.y - 15.0, "분신!", "#cc44ff", 25)
		world.emit_native_parts(global_position, "#cc44ff", 6)
	if shadow_state._tpWarnT > 0.0:
		shadow_state._tpWarnT -= ticks
		if shadow_state._tpWarnT <= 0.0:
			if not is_instance_valid(_teleport):
				shadow_error = "actual_shadow_teleport_owner_lost"
				return
			_teleport.complete_shadow(Vector2(shadow_state._tpWarnX, shadow_state._tpWarnY))
			shadow_state._stTpCd = 120.0 + _sample_unit() * 40.0
			shadow_state._tpWarnT = 0.0
	elif shadow_state._stTpCd <= 0.0 and distance < 1200.0 and distance > 60.0:
		var angle := _sample_unit() * TAU
		var offset := 60.0 + _sample_unit() * 40.0
		var destination := player.global_position + Vector2.from_angle(angle) * offset
		if world.can_move(destination, radius):
			shadow_state._tpWarnT = 120.0
			shadow_state._tpWarnMax = 120.0
			shadow_state._tpWarnX = destination.x
			shadow_state._tpWarnY = destination.y
			shadow_state._tpWarnCol = "#cc44ff"
		else: shadow_state._stTpCd = 30.0

func _sample_unit() -> float:
	return world.sample_native_random_unit()

func _fire_projectile() -> void:
	if not alive or not is_instance_valid(player): return
	_sample_unit()
	facing = (player.global_position - global_position).angle()
	var shot := PHYSICAL_PROJECTILE.new()
	shot.configure(world.to_local(global_position), Vector2.from_angle(facing), data.projectile, player, world, world.get_native_frame())
	shot.telemetry_event.connect(_forward_event)
	world.add_child(shot)
	world.emit_native_parts(global_position, str(data.native_final.col), 2)

func get_snapshot() -> Dictionary:
	var result: Dictionary = super.get_snapshot()
	result.merge({"shadow_state": shadow_state.duplicate(true), "clone_attempts": clone_attempts, "last_discarded_clone": last_discarded_clone.duplicate(true), "shadow_error": shadow_error, "clone_registry_append": false, "full_teleport_particle_light_shake_parity": false})
	return result

func _draw() -> void:
	if not alive: return
	for bar in BAR_LAYOUT.build(radius, float(hp), float(mhp), eShield, eShieldMax, _stun_ticks, (_maxStunned if _source_max_stunned_present else null)):
		draw_rect(bar.rect, bar.color)
	if charge_ticks <= 0.0: return
	var progress := clampf(1.0 - charge_ticks / 60.0, 0.0, 1.0)
	draw_arc(Vector2.ZERO, radius + 10.0, 0, TAU, 128, Color(8.0 / 255, 8.0 / 255, 8.0 / 255, 0.28), 5.0, true)
	if progress > 0.0:
		draw_arc(Vector2.ZERO, radius + 10.0, -PI / 2.0, -PI / 2.0 + TAU * progress, 128, Color.WHITE, 6.0, true)
		draw_circle(Vector2.from_angle(-PI / 2.0) * (radius + 10.0), 3.0, Color.WHITE)
		draw_circle(Vector2.from_angle(-PI / 2.0 + TAU * progress) * (radius + 10.0), 3.0, Color.WHITE)
	if not is_instance_valid(_teleport): return
	var font: Font = _teleport.get("_font")
	if font == null: return
	var label := "물리탄 차징 · E로 패링"
	var width := font.get_string_size(label, HORIZONTAL_ALIGNMENT_LEFT, -1, 13).x
	var center := Vector2(0, -radius - 25.0)
	var background := Rect2(center - Vector2((width + 14.0) * 0.5, 10.0), Vector2(width + 14.0, 20.0))
	draw_rect(background, Color(5.0 / 255, 8.0 / 255, 13.0 / 255, 0.92))
	draw_rect(background, Color("#f4f4f4"), false, 1.5)
	draw_string(font, Vector2(-width * 0.5, center.y + (font.get_ascent(13) - font.get_descent(13)) * 0.5), label, HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color.WHITE)
