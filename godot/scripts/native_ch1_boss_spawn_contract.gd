extends RefCounted
## BC02: ordinary CH1 boss mkEn numeric packet, not an actor/factory registration.
## Source: latest main 284d7faf49295b2f5061937a47ce96038032ed3c game.html.
## No Main, World, state owner, RNG singleton, file IO, skin or save writes.
## Caller supplies current numeric inputs, collision readers and six RNG units.

const Catalog = preload("res://scripts/native_ch1_boss_catalog.gd")
const CatalogContext = preload("res://scripts/native_boss_catalog_context.gd")
# game.html 14338 (ELC), selected by the boss branch at 31163.
const _ELEMENT_COLORS = ["#bbbbbb", "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc", "#88aa44"]
const _DIFF_LV_OFF = [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500]
const _DIFF_MUL = [0.45, 0.55, 0.65, 0.76, 0.88, 1.0, 1.12, 1.25, 1.40, 1.58, 1.78]
const _RNG_SITES = [
	["st2", 31167], ["facing", 31167], ["projT", 31170],
	["bossPatT", 31173], ["_bossOrbitAng", 31262], ["_erraticAng", 31302],
]


static func source_receipt() -> Dictionary:
	return {
		"source_main": "284d7faf49295b2f5061937a47ce96038032ed3c",
		"game_sha256": preload("res://source_snapshot/snapshot.gd").SHA256,
		"dependency": "BC01 e4396da5e7541562542ab65053d8ecac0bf16e52",
		"source_lines": [9272, 9276, 31035, 31036, 31121, 31122, 31187, 31212, 31262, 31302, 31361],
		"scope": "81 numeric/common/boss fields; no ordinary-etype timers, actor or skin binding",
		"rng_sites": _RNG_SITES.duplicate(true), "ordinary_boss_only": true,
		"finale_reachable": false, # 16646-16650 / 17056-17057: stage==0 AND stage==3 impossible.
	}


## request: si:int (default CH1 0..3; explicit catalog supplies stage range),
## x/y/player_level/stage_diff_offset:numeric,
## difficulty_index:int (out-of-table indices retain source || fallback), room:int.
## rng(field:String)->unit in [0,1); can_move(x,y,r)->bool;
## safe_point(x,y,r)->{x,y} or null, needed only after blocked can_move.
## Missing providers/unsupported shapes are NOT_READY, never invented spawn data.
static func build_spawn_packet(request: Dictionary, rng: Callable,
		can_move: Callable, safe_point: Callable = Callable(), chapter_catalog: Variant = null) -> Dictionary:
	var ledger: Array = []
	var reads: Array = []
	for key in ["si", "difficulty_index", "room"]:
		if not request.has(key) or not request[key] is int:
			return _failure("NOT_READY", "integer_input_required:" + key, ledger, reads)
	var si: int = request["si"]
	var resolved: Dictionary = CatalogContext.resolve(chapter_catalog)
	if not resolved["ready"]: return _failure("NOT_READY", resolved["reason"], ledger, reads)
	var data_catalog: Variant = resolved["catalog"]
	var boss: Dictionary = data_catalog.boss_for_stage(si)
	if not boss.get("supported", false):
		return _failure("NOT_READY", "unsupported_chapter_stage", ledger, reads)
	var element: Variant = boss.get("element_id")
	if not element is int or element < 0 or element >= _ELEMENT_COLORS.size():
		return _failure("NOT_READY", "boss_element_unsupported", ledger, reads)
	for key in ["x", "y", "player_level", "stage_diff_offset"]:
		if not request.has(key) or not _numeric(request[key]):
			return _failure("NOT_READY", "numeric_input_required:" + key, ledger, reads)
	var x: float = request["x"]
	var y: float = request["y"]
	# mkEn 31124 returns before collision reads and all random draws.
	if not is_finite(x) or not is_finite(y):
		return _failure("REJECTED", "source_non_finite_position", ledger, reads)
	var player_level: float = request["player_level"]
	var stage_offset: float = request["stage_diff_offset"]
	# Numeric JS || fallbacks: zero and NaN are false, negative values are true.
	if player_level == 0.0 or is_nan(player_level):
		player_level = 1.0
	if is_nan(stage_offset):
		stage_offset = 0.0
	if not is_finite(player_level) or not is_finite(stage_offset):
		return _failure("NOT_READY", "non_finite_level_input", ledger, reads)
	if not can_move.is_valid():
		return _failure("NOT_READY", "can_move_reader_missing", ledger, reads)
	reads.append({"kind": "can_move", "x": x, "y": y, "r": 22})
	var movable: Variant = can_move.call(x, y, 22.0)
	if not movable is bool:
		return _failure("NOT_READY", "can_move_reader_not_boolean", ledger, reads)
	if not movable:
		if not safe_point.is_valid():
			return _failure("NOT_READY", "safe_point_reader_missing", ledger, reads)
		reads.append({"kind": "safe_point", "x": x, "y": y, "r": 22})
		var point: Variant = safe_point.call(x, y, 22.0)
		if point == null:
			return _failure("REJECTED", "source_spawn_blocked", ledger, reads)
		if not point is Dictionary or not point.has("x") or not point.has("y") \
				or not _numeric(point["x"]) or not _numeric(point["y"]):
			return _failure("NOT_READY", "safe_point_shape_unsupported", ledger, reads)
		x = float(point["x"])
		y = float(point["y"])
		if not is_finite(x) or not is_finite(y):
			return _failure("NOT_READY", "safe_point_non_finite", ledger, reads)
	if not rng.is_valid():
		return _failure("NOT_READY", "rng_provider_missing", ledger, reads)
	var difficulty: int = request["difficulty_index"]
	var level_offset: float = _DIFF_LV_OFF[difficulty] if difficulty >= 0 and difficulty < 11 else 0.0
	var dm: float = _DIFF_MUL[difficulty] if difficulty >= 0 and difficulty < 11 else 1.0
	var level: float = maxf(1.0, player_level + level_offset + stage_offset)
	# 31147 preserves multiplication order; do not use Int32, cube rounding or old multipliers.
	var curve: float = (0.4 * level * level * level + 199.0 * level + 100.0 \
		if level <= 500.0 else 50000000.0 * pow(1.0014, level - 500.0)) * 2.925
	var pacing: float = 1.0 / (1.0 + minf(9.0, maxf(0.0, level - 1.0)) / 18.0)
	var first_hp: float = floor(curve * pacing * 24.0 * dm * 1.0)
	var hp: float = floor(first_hp * (1.0 + si * 0.02))
	var attack: float = floor((75.0 + level * 2.9) * 0.6 * dm * 1.0)
	# Preserve IEEE doubles (including overflow) just like Math.floor, never int32-cast HP.
	var units: Array = []
	for site: Array in _RNG_SITES:
		var value: Variant = rng.call(site[0])
		if not _numeric(value) or not is_finite(float(value)) or value < 0 or value >= 1:
			return _failure("NOT_READY", "rng_unit_invalid:" + site[0], ledger, reads)
		units.append(float(value))
		ledger.append({"ordinal": ledger.size(), "field": site[0], "source_line": site[1], "unit": value})
	var rev_points: float = 200.0 + floor(si * 5.882 + 0.5) # source Math.round, si is nonnegative.
	var fields: Dictionary = {
		"x": x, "y": y, "r": 44, "hp": hp, "mhp": hp, "atk": attack, "baseAtk": attack,
		"speed": 0.5, "baseSpd": 0.5, "el": element, "col": _ELEMENT_COLORS[element],
		"alive": true, "stunned": 0, "kb": {"x": 0, "y": 0},
		"poise": hp, "maxPoise": hp, "poiseR": 0,
		"ib": true, "etype": boss["etype"], "room": request["room"], "lv": level, "s": "idle",
		"st2": 30.0 + units[0] * 50.0, "facing": units[1] * PI * 2.0,
		"elite": 0, "mods": [], "aura": null,
		"modT": {"regen": 0, "summon": 0, "tp": 0, "chaos": 0, "vortex": 0, "lightning": 0,
			"twarp": 0, "cloned": false, "revived": false, "split": false, "sentry": 0,
			"sentryAng": 0, "sentryOn": false, "illusioned": false, "stealthT": 0,
			"eliteBusy": 0, "eliteCharge": 0, "eliteRing": 0, "eliteBolt": 0, "eliteMortar": 0},
		"projCd": 50, "projT": 70.0 + units[2] * 50.0, "chargeT": 0, "chargeCd": 9999,
		"dropTier": mini(int(boss["hell"])+1,4), "bossPatCd": 35, "bossPatT": 30.0 + units[3] * 20.0,
		"jumpX": 0, "jumpY": 0, "jumpOx": 0, "jumpOy": 0, "_bossPhase": 0, "_combatSt": "engage",
		"_comboSeq": null, "_comboIdx": 0,
		# Source allocates BOSS_MOVES.length (59), NOT max sparse idx + 1 (61).
		"_moveCDs": _zero_cooldowns(data_catalog), "_lastMoves": [], "_feinting": false, "_delaying": 0,
		"_dbgScores": null, "shockR": 0, "shockMax": 0, "laserAng": 0, "laserLen": 0,
		"deaths": 0, "reviveIframes": 0, "meteors": [], "_revPts": rev_points, "_maxRevPts": rev_points,
		"shieldAng": 0, "eShield": hp, "eShieldMax": hp, "eShieldRegenT": 0,
		"eRes": [0, 0, 0, 0, 0, 0, 0], "_firstShot": false,
		"bleed": 0, "bleedT": 0, "bleedStk": 0, "_bleedPool": 0,
		"poison": 0, "poisonT": 0, "poisonStk": 0, "_poisonPool": 0,
		"burnT": 0, "burnStk": 0, "_burnPool": 0, "_homeX": x, "_homeY": y,
		"_bossOrbitAng": units[4] * PI * 2.0, "_bossStrafeCd": 0,
		"_erraticT": 9999, "_erraticAng": units[5] * PI * 2.0, "_spawnT": 20,
	}
	return {"status": "READY", "fields": fields, "rng_ledger": ledger, "placement_reads": reads,
		"calculation": {"level": level, "dm": dm, "curve": curve, "pacing": pacing, "first_floor_hp": first_hp}}


static func _numeric(value: Variant) -> bool:
	return value is int or value is float


static func _zero_cooldowns(data_catalog: Variant) -> Array:
	var result: Array = []
	result.resize(data_catalog.source_receipt()["global_move_count"])
	result.fill(0)
	return result


static func _failure(status: String, reason: String, ledger: Array, reads: Array) -> Dictionary:
	return {"status": status, "reason": reason, "fields": {},
		"rng_ledger": ledger, "placement_reads": reads}
