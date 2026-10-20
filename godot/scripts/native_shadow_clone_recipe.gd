extends RefCounted

const COMMON = preload("res://scripts/type3_spawn_recipe.gd")

static func build(spawn_x: float, spawn_y: float, context: Dictionary, random: Callable, can_move: Callable, safe_point: Callable) -> Dictionary:
	for key in ["stage", "difficulty", "player_level", "stage_difficulty_offset"]:
		if not context.get(key) is float and not context.get(key) is int:
			return {"valid": false, "reason": "missing_clone_context:" + key}
	if context.stage != 0 or context.difficulty < 0 or context.difficulty > 10:
		return {"valid": false, "reason": "clone_constructor_stage0_only"}
	if not can_move.call(Vector2(spawn_x, spawn_y), 10.0):
		var safe: Variant = safe_point.call(spawn_x, spawn_y, 10.0)
		if not safe is Dictionary:
			return {"valid": false, "reason": "source_mkEn_returns_null_before_clone_write"}
		spawn_x = safe.x
		spawn_y = safe.y
	var difficulty := int(context.difficulty)
	var level := maxi(1, int(context.player_level) + COMMON.DIFFICULTY_LEVEL_OFFSETS[difficulty] + int(context.stage_difficulty_offset))
	var elite := 1 if float(random.call()) < 0.03 else 0
	var mods: Array = []
	if elite == 1:
		mods.append(["M29", "M30"][int(float(random.call()) * 2.0)])
	var speed := (0.21 * 1.3 + float(random.call()) * 0.08) * 1.5
	var radius := (10.0 + float(random.call()) * 2.0) * 2.0 * (1.08 if elite else 1.0)
	var curve := (0.4 * level * level * level + 199.0 * level + 100.0) if level <= 500 else 50000000.0 * pow(1.0014, level - 500)
	var pacing := 1.0 / (1.0 + mini(9, maxi(0, level - 1)) / 18.0)
	var hp := floorf(curve * 2.925 * pacing * COMMON.DIFFICULTY_MULTIPLIERS[difficulty] * (2.0 if elite else 1.0))
	var attack := floorf((50.0 + level * 1.95) * 0.6 * COMMON.DIFFICULTY_MULTIPLIERS[difficulty] * (1.3 if elite else 1.0))
	var idle := 30.0 + float(random.call()) * 50.0
	var facing := float(random.call()) * TAU
	var projectile := 180.0 + float(random.call()) * 120.0
	var boss_pattern := 30.0 + float(random.call()) * 20.0
	var orbit := float(random.call()) * TAU
	var phase := 120.0 + float(random.call()) * 60.0
	var phase_cd := 240.0 + float(random.call()) * 80.0
	var erratic := float(random.call()) * TAU
	var skin_index := ((40 * 7 + COMMON._js_int32(spawn_x * 31.0)) & 0x7fffffff) % 40
	return {"valid": true, "etype": 40, "registered": false, "room_present": false,
		"x": spawn_x, "y": spawn_y, "lv": level, "el": 3, "elite": elite, "mods": mods,
		"hp": COMMON._js_int32(hp * 0.3), "mhp": COMMON._js_int32(hp * 0.3),
		"atk": COMMON._js_int32(attack * 0.5), "baseAtk": attack, "factory_hp": hp,
		"eShield": 0, "eShieldMax": 0, "poise": hp, "maxPoise": hp,
		"r": radius, "speed": speed, "st2": idle, "facing": facing, "projT": projectile,
		"bossPatT": boss_pattern, "_bossOrbitAng": orbit, "_wraithPhaseT": phase,
		"_wraithPhaseCd": phase_cd, "_erraticAng": erratic,
		"_mob8Col": skin_index % 8, "_mob8Row": int(skin_index / 8),
		"constructor_draws": 12 if elite else 11}
