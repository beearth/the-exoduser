class_name ExoduserType3SpawnRecipe
extends RefCounted

## CH1 stage0 native mkEn(type3) constructor boundary. This module owns no
## actors, global RNG, clock, admission, textures, save data or physics dispatch.
## The caller supplies the shared native RNG and collision services. Never seed
## a per-child Godot RNG: eSummon and its interleaved FX use the same stream.
const EliteSelector = preload("res://port_modules/elite_spawn_rules_source/producer.gd")
const SCHEMA = "exoduser.godot.type3-spawn-recipe.v1"
const DIFFICULTY_MULTIPLIERS = [0.45, 0.55, 0.65, 0.76, 0.88, 1.0, 1.12, 1.25, 1.40, 1.58, 1.78]
const DIFFICULTY_LEVEL_OFFSETS = [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500]
const ELEMENTS = ["physical", "fire", "ice", "dark", "lightning", "holy"]
const SKINS = [
	"blood_swarm", "apostle_mass", "apostle_knight", "soul_flame", "hive_bloater", "spine_beast", "flesh_crawler", "carapace_predator",
	"bone_centipede_pro", "gas_zombie", "needle_tentacle", "rotting_slime_mass", "flesh_eye_mass", "corrupted_wolf", "crawling_horror", "eye_stalker_pro",
	"iron_butcher_pro", "plague_doctor_pro", "grotesque_quadruped", "black_castle_guardian", "poison_mushroom_giant", "forest_watcher", "boss_ch1_stag", "headless_knight",
	"plague_censer", "skinless_hound", "deformed_giant", "gut_witch", "iron_torturer", "jaw_stalker", "fallen_paladin", "flesh_executioner",
	"void_cultist", "skull_brute", "chain_wraith", "bone_archer", "bloated_warrior", "rot_knight", "etype1_archer", "blind_swordsman"
]

var _random: Callable
var _can_move: Callable
var _safe_point: Callable
var _configured = false
var _last_error = "not_configured"

func configure(native_random: Callable, can_move: Callable, safe_point: Callable) -> bool:
	if _configured or not native_random.is_valid() or not can_move.is_valid() or not safe_point.is_valid():
		_last_error = "missing_native_rng_or_collision_service"
		return false
	_random = native_random
	_can_move = can_move
	_safe_point = safe_point
	_configured = true
	_last_error = ""
	return true

func get_last_error() -> String:
	return _last_error

func build_child(x: float, y: float, context: Dictionary, element_id: int) -> Dictionary:
	# mkEn's collision radius is 10 before type3's final randomized radius.
	# Numbers remain double precision in Dictionaries; Vector2 would narrow them.
	var context_error = _context_error(context)
	if not _configured or not context_error.is_empty() or not is_finite(x) or not is_finite(y) or element_id < 0 or element_id >= ELEMENTS.size():
		return _failure(context_error if not context_error.is_empty() else "invalid_constructor_or_element")
	var requested_x = x
	var requested_y = y
	if not bool(_can_move.call(x, y, 10.0)):
		var safe: Variant = _safe_point.call(x, y, 10.0)
		if not safe is Dictionary or not _number(safe.get("x")) or not _number(safe.get("y")):
			return _failure("source_safe_point_unavailable")
		x = float(safe["x"])
		y = float(safe["y"])

	var difficulty: int = int(context["difficulty"])
	var level: int = maxi(1, int(context["player_level"]) + DIFFICULTY_LEVEL_OFFSETS[difficulty] + int(context["stage_difficulty_offset"]))
	var selection: Dictionary = EliteSelector.constructor_prefix(0,false,func(_purpose):return _unit())
	if selection.status != "READY":return _failure("elite_selector_NOT_READY")
	var elite: int = int(selection.elite)
	var mods: Array = selection.mods
	var hp_multiplier = 2.0 if elite == 1 else 1.0
	var attack_multiplier = 1.3 if elite == 1 else 1.0
	var scale_multiplier = 1.08 if elite == 1 else 1.0
	var speed = (0.75 * 1.3 + _unit() * 0.08) * 1.5
	var radius = (10.0 + _unit() * 2.0) * 2.0 * scale_multiplier
	var base_curve = (0.4 * level * level * level + 199.0 * level + 100.0) if level <= 500 else (50000000.0 * pow(1.0014, level - 500))
	base_curve *= 2.925
	var pacing = 1.0 / (1.0 + mini(9, maxi(0, level - 1)) / 18.0)
	var factory_hp = floor(base_curve * pacing * DIFFICULTY_MULTIPLIERS[difficulty] * hp_multiplier)
	var attack = int(floor((50.0 + level * 1.95) * 0.6 * DIFFICULTY_MULTIPLIERS[difficulty] * attack_multiplier))
	var idle = 30.0 + _unit() * 50.0
	var facing = _unit() * TAU
	var projectile_timer = 180.0 + _unit() * 120.0
	# These unconditional object-literal draws have no type3 AI authority but
	# must remain in the constructor stream before the next child is generated.
	var boss_pattern_timer = 30.0 + _unit() * 20.0
	var boss_orbit_angle = _unit() * TAU
	var erratic_angle = _unit() * TAU
	var skin = skin_from_spawn_x(x)
	var child_hp = _js_int32(factory_hp * 0.5)
	var recipe = {
		"schema": SCHEMA, "etype": 3, "ib": false, "stage": 0, "room": int(context["room"]), "lv": level,
		"x": x, "y": y, "requested_x": requested_x, "requested_y": requested_y,
		"r": radius, "speed": speed, "baseSpd": speed, "hp": child_hp, "mhp": child_hp,
		"factory_hp": factory_hp, "atk": attack, "baseAtk": attack, "el": element_id, "element": ELEMENTS[element_id],
		"alive": true, "s": "idle", "st2": idle, "facing": facing, "stunned": 0.0, "kb": {"x": 0.0, "y": 0.0},
		"elite": elite, "mods": mods, "aura": null, "poise": factory_hp, "maxPoise": factory_hp, "poiseR": 0.0,
		"eShield": 0, "eShieldMax": 0, "eShieldRegenT": 0.0, "eRes": [0, 0, 0, 0, 0, 0, 0],
		"projCd": 192 if elite == 1 else 240, "projT": projectile_timer, "chargeT": 0.0, "chargeCd": 9999,
		"bossPatCd": 9999, "bossPatT": boss_pattern_timer, "_bossOrbitAng": boss_orbit_angle,
		"_erraticT": 9999, "_erraticAng": erratic_angle, "_homeX": x, "_homeY": y, "_spawnT": 20.0,
		"_iceOnHit": false, "_iceFreeze": 0.0, "_firstShot": false, "_mobCh": 1, "_mob8dir": true,
		"_mob8Col": skin["col"], "_mob8Row": skin["row"], "_mobSkinPending": false,
		"animation": skin, "modT": _fresh_modifier_state(), "native_tick_rate": 60,
		"constructor_rng_draws": 10 if elite == 1 else 9, "full_type7_actor_registered": false
	}
	return {"valid": true, "error": "", "recipe": recipe}

func summon_type7(x: float, y: float, context: Dictionary, child_consumer: Callable, spawn_fx: Callable) -> Dictionary:
	# Entry is AFTER the eSummon channel's current-update particle call. The
	# parent scheduler owns channel40, timer reset, recover50 and global phase.
	# Callback order is ens.push(child) then original addParts(...,8). Its pool
	# and hiFPS guards can consume RNG; a no-op FX adapter is not source parity.
	var context_error = _context_error(context)
	if not _configured or not context_error.is_empty() or not is_finite(x) or not is_finite(y) or not child_consumer.is_valid() or not spawn_fx.is_valid():
		return _failure(context_error if not context_error.is_empty() else "missing_child_consumer_or_spawn_fx")
	var count = 1 + int(_unit() * 2.0)
	var recipes: Array = []
	for index in range(count):
		var angle = TAU * index / count + _unit()
		var distance = 30.0 + _unit() * 20.0
		var child_x = x + cos(angle) * distance
		var child_y = y + sin(angle) * distance
		var element_id = int(_unit() * 6.0)
		var built = build_child(child_x, child_y, context, element_id)
		if not built["valid"]:
			return {"valid": false, "error": built["error"], "requested_count": count, "consumed_count": recipes.size(), "recipes": recipes, "failed_child_index": index}
		var recipe: Dictionary = built["recipe"]
		# Consumers may construct a new actor, but must not reroll this recipe.
		# Rejection is explicit; no child is silently substituted or omitted.
		if child_consumer.call(recipe) != true:
			return {"valid": false, "error": "child_consumer_rejected", "requested_count": count, "consumed_count": recipes.size(), "recipes": recipes, "failed_child_index": index}
		recipes.append(recipe)
		# Canonical eSummon uses the proposed sx/sy for FX, even if mkEn moved
		# the child to a nearby safe point. Preserve that distinct origin.
		spawn_fx.call(child_x, child_y, "#8833cc", 8)
	return {"valid": true, "error": "", "requested_count": count, "consumed_count": count, "recipes": recipes, "parent_recovery_ticks": 50, "full_type7_actor_registered": false}

static func skin_from_spawn_x(x: float) -> Dictionary:
	var seed_value: int = (3 * 7 + _js_int32(x * 31.0)) & 0x7fffffff
	var index: int = seed_value % 40
	return {"skin": SKINS[index], "index": index, "cell": 256, "col": index % 8, "row": int(index / 8), "chapter": 1}

static func _js_int32(value: float) -> int:
	var low: int = int(value) & 0xffffffff
	return low - 0x100000000 if low >= 0x80000000 else low

func _unit() -> float:
	# Valid native RNG range is [0,1); integration supplies Math.random's
	# counterpart. Invalid providers fail loudly; no clamp changes a draw.
	var value: Variant = _random.call()
	assert(_number(value) and float(value) >= 0.0 and float(value) < 1.0, "native RNG must return a finite unit in [0,1)")
	return float(value)

func _context_error(context: Dictionary) -> String:
	for key in ["stage", "room", "player_level", "difficulty", "stage_difficulty_offset"]:
		if not _number(context.get(key)) or float(context[key]) != floor(float(context[key])):
			return "missing_integral_context_" + key
	if int(context["stage"]) != 0:
		return "stage0_only_other_native_elite_pools_unported"
	if int(context["difficulty"]) < 0 or int(context["difficulty"]) >= DIFFICULTY_MULTIPLIERS.size() or int(context["player_level"]) < 1:
		return "invalid_native_level_or_difficulty"
	return ""

func _failure(error: String) -> Dictionary:
	_last_error = error
	return {"valid": false, "error": error, "recipe": null}

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _fresh_modifier_state() -> Dictionary:
	return {"regen": 0.0, "summon": 0.0, "tp": 0.0, "chaos": 0.0, "vortex": 0.0, "lightning": 0.0, "twarp": 0.0,
		"cloned": false, "revived": false, "split": false, "sentry": 0.0, "sentryAng": 0.0, "sentryOn": false,
		"illusioned": false, "stealthT": 0.0, "eliteBusy": 0.0, "eliteCharge": 0.0, "eliteRing": 0.0, "eliteBolt": 0.0, "eliteMortar": 0.0}
