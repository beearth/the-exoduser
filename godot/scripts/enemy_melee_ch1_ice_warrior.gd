extends "res://scripts/enemy_melee_flesh_crawler.gd"

const PROFILE := "native_ch1_etype20_ice_warrior_v1"

func _source_normal_fields_domain_current() -> bool:
	# game.html:30888 ETYPE_POISE[20]=15 is superseded by 31164 poise=maxPoise=_hp=875.
	# 19973-20001/42490 use the same non-boss core; exact source order4=(elite1,el0),10=(0,0),12=(0,4).
	var profiles := {4: ["ch1_initial_005", 1, 0, "physical"], 10: ["ch1_initial_011", 0, 0, "physical"], 12: ["ch1_initial_013", 0, 4, "lightning"]}
	if etype != 20 or not profiles.has(source_order) or not mods.is_empty() or data.get("native_final", {}).get("ib") != false or get_script().resource_path != "res://scripts/enemy_melee_ch1_ice_warrior.gd": return false
	var profile: Array = profiles[source_order]
	return data.get("id") == profile[0] and elite == profile[1] and el == profile[2] and element == profile[3] and data.get("element") == profile[3]

static func build_runtime(record: Dictionary) -> Dictionary:
	var runtime: Dictionary = record.duplicate(true)
	var native: Dictionary = record["native_final"]
	runtime["ai_profile"] = PROFILE
	runtime["facing"] = record["initial_facing"]
	for field in ["eShield", "eShieldMax", "eRes"]:
		runtime[field] = native[field].duplicate(true) if native[field] is Array else native[field]
	runtime["native_flags"] = {}
	for field in ["_ch1StartMedium", "_firstShot", "_mob8dir", "_mobCh", "_mob8Col", "_mob8Row"]:
		if native.has(field):
			runtime["native_flags"][field] = native[field]
	var animation: Dictionary = runtime["animation"]
	var column: int = int(animation["column"])
	var row: int = int(animation["row"])
	animation["resources_copied"] = true
	animation["base_rect"] = [column * 256, row * 256, 256, 256]
	animation["walk_frame_rects"] = []
	for frame in range(4):
		animation["walk_frame_rects"].append([(column * 4 + frame) * 256, row * 256, 256, 256])
	animation["direction_angle_sectors"] = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"]
	runtime["projectile"] = {}
	return runtime


func _physics_process(delta: float) -> void:
	if not alive:
		return
	var ticks: float = delta * float(data["native_tick_rate"])
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
	var distance: float = global_position.distance_to(player.global_position)
	if not alerted and state in ["idle", "recover"] and distance < 800.0 and world.has_line_of_sight(global_position, player.global_position):
		alerted = true
		telemetry_event.emit("enemy_aggro", {"id": data["id"], "distance": distance})
	if alerted and distance < 800.0:
		facing = (player.global_position - global_position).angle()
	if alerted and state in ["idle", "recover"] and distance > 30.0:
		_move_flow(ticks)
		distance = global_position.distance_to(player.global_position)
	if (not alerted and distance > 400.0) or float(player.get("hp")) <= 0.0:
		_finish_motion(before, ticks)
		return
	st2 -= ticks
	if state == "idle":
		_move_native(Vector2.from_angle(facing) * float(data["speed_pixels_per_tick"]) * 1.6, ticks)
		_apply_separation(ticks)
	elif state == "recover" and st2 <= 0.0:
		state = "idle"
		st2 = 15.0 + _rng.randf() * 15.0
	_finish_motion(before, ticks)


func _move_flow(ticks: float) -> void:
	var direction: Vector2 = world.get_path_direction(global_position)
	var displacement: Vector2 = direction * float(data["speed_pixels_per_tick"]) * ticks
	if world.can_move(global_position + displacement, radius):
		global_position += displacement
	elif world.can_move(global_position + Vector2(displacement.x, 0), radius):
		global_position.x += displacement.x
	elif world.can_move(global_position + Vector2(0, displacement.y), radius):
		global_position.y += displacement.y


func _move_native(per_tick: Vector2, ticks: float) -> void:
	var destination: Vector2 = global_position + per_tick * ticks
	if world.can_move(destination, radius):
		global_position = destination


func _fire_projectile() -> void:
	pass


func apply_native_normal_enemy_poise_core(amount: int) -> Dictionary:
	var result: Dictionary = HURTE_OWNER.apply_poise_core(self, amount)
	if result.get("staggered") == true:
		_maxStunned = data["native_final"]["_maxStunned"]
		_source_max_stunned_present = true
	return result
