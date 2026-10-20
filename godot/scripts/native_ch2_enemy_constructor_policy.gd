extends RefCounted
## EC2-02: numeric projection of mkEn for si4..9, nonboss etype30..39.
## game.html:31120–31364. Collision admission and skin/actor creation are outside
## this boundary. The caller owns elite/mods/aura selection and the shared RNG.
const DIFF_MUL = [0.45,0.55,0.65,0.76,0.88,1.0,1.12,1.25,1.40,1.58,1.78] # 9276
const DIFF_LV_OFF = [-500,-400,-300,-200,-100,0,100,200,300,400,500] # 9272
# 30823–30920: HP, ATK, raw SPD, R, POISE, SHIELD%, RANGE, COL, in type order.
# These catalog HP/ATK/POISE/SHIELD values are NOT final actor defense/attack.
const CATALOG = [
	[22,14,0.6,10,10,0,400,"#884422"], [32,16,0.3,10,12,0,600,"#aa5533"],
	[96,18,0.12,15,40,60,400,"#776655"], [6,4,0.54,10,3,0,200,"#dd6644"],
	[16,6,0.36,10,8,0,600,"#556633"], [48,18,0.39,12,20,0,400,"#993311"],
	[38,12,0.45,10,12,0,400,"#447733"], [58,22,0.6,15,25,0,600,"#553322"],
	[112,6,0.09,20,50,0,800,"#774433"], [160,30,0.3,25,55,0,1000,"#441100"]]
const HP_MUL = [1.0,2.0,3.0,5.0] # ELITE_TIERS 31033–31037
const ATK_MUL = [1.0,1.3,1.6,2.0]
const SCALE_MUL = [1.0,1.08,1.2,1.35]
# Literal order from 31235–31259. Nonmatching etypes receive 9999 with NO draw.
const TIMERS = [
	["_wildChargeCd",30,60.0,30.0], ["_wildChargeT",30,30.0,20.0],
	["_boulderSlamCd",32,200.0,60.0], ["_boulderSlamT",32,80.0,40.0],
	["_poisonZoneCd",34,150.0,50.0], ["_poisonZoneT",34,60.0,30.0],
	["_beastComboCd",35,120.0,40.0], ["_beastComboT",35,50.0,30.0],
	["_beastRoarCd",35,300.0,80.0], ["_beastRoarT",35,120.0,60.0],
	["_serpentZigCd",36,80.0,30.0], ["_serpentZigT",36,40.0,20.0],
	["_predStealthCd",37,200.0,60.0], ["_predStealthT",37,80.0,40.0],
	["_broodSpawnCd",38,180.0,60.0], ["_broodSpawnT",38,60.0,30.0],
	["_broodGasCd",38,250.0,80.0], ["_broodGasT",38,100.0,40.0],
	["_elderRoarCd",39,250.0,80.0], ["_elderRoarT",39,100.0,40.0],
	["_elderChargeCd",39,150.0,50.0], ["_elderChargeT",39,60.0,30.0],
	["_elderSlamCd",39,300.0,80.0], ["_elderSlamT",39,120.0,60.0]]

class Draws extends RefCounted:
	var provider: Callable
	var count: int = 0
	var error: String = ""
	func _init(source: Callable) -> void:
		provider = source
	func sample() -> float:
		if not error.is_empty():
			return NAN
		var raw: Variant = provider.call()
		count += 1
		if typeof(raw) != TYPE_INT and typeof(raw) != TYPE_FLOAT:
			error = "invalid_random_sample"
			return NAN
		var value: float = float(raw)
		if not is_finite(value) or value < 0.0 or value >= 1.0:
			error = "invalid_random_sample"
			return NAN
		return value

## sources callbacks:
## elite(stage, random_unit)->int; mods(tier,stage,random_unit)->Array[String];
## aura(tier,stage,random_unit)->String|null. They are called at original sites.
## Missing bindings are NOT_READY, never silently replaced with normal/P/no mods.
func build(context: Dictionary, random_unit: Callable, sources: Dictionary) -> Dictionary:
	var reason: String = _context_error(context)
	if not reason.is_empty():
		return _stop(reason, 0)
	if not random_unit.is_valid():
		return _stop("invalid_random_callable", 0)
	for key in ["elite", "mods", "aura"]:
		if not sources.get(key) is Callable or not sources[key].is_valid():
			return _stop("missing_source_" + key, 0)
	var stage: int = int(context.stage)
	var etype: int = int(context.etype)
	var difficulty: int = int(context.difficulty)
	var level: float = maxf(1.0, (1.0 if float(context.player_level) == 0.0 else float(context.player_level)) + DIFF_LV_OFF[difficulty] + float(context.stage_difficulty_offset))
	var draws := Draws.new(random_unit)
	# 31131–31132: rollElite then conditional rollMods, before speed/radius.
	var tier: Variant = sources.elite.call(stage, draws.sample)
	if not draws.error.is_empty():
		return _stop(draws.error, draws.count)
	if typeof(tier) != TYPE_INT or tier < 0 or tier > 3:
		return _stop("invalid_source_elite", draws.count)
	var mods: Array = []
	if tier > 0:
		var selected: Variant = sources.mods.call(tier, stage, draws.sample)
		if not draws.error.is_empty():
			return _stop(draws.error, draws.count)
		if not selected is Array:
			return _stop("invalid_source_mods", draws.count)
		for mod in selected:
			if not mod is String:
				return _stop("invalid_source_mods", draws.count)
		mods = selected.duplicate(true)
	var catalog: Dictionary = catalog_for(etype)
	var speed: float = (catalog.speed + draws.sample() * 0.08) * 1.5
	if "M02" in mods:
		speed *= 1.5
	var radius: float = (catalog.r + draws.sample() * 2.0) * 2.0 * SCALE_MUL[tier]
	if not draws.error.is_empty():
		return _stop(draws.error, draws.count)
	# 31144–31151: preserve operation order and the TWO distinct HP floors.
	var curve: float = (0.4 * level * level * level + 199.0 * level + 100.0) if level <= 500.0 else (50000000.0 * pow(1.0014, level - 500.0))
	curve *= 2.925
	var pacing: float = 1.0 / (1.0 + minf(9.0, maxf(0.0, level - 1.0)) / 18.0)
	var hp: float = floor(floor(curve * pacing * DIFF_MUL[difficulty] * HP_MUL[tier]) * (1.0 + stage * 0.02))
	var attack: float = floor((50.0 + level * 1.95) * 0.6 * DIFF_MUL[difficulty] * ATK_MUL[tier])
	if not is_finite(hp) or not is_finite(attack):
		return _stop("nonfinite_constructor_stats", draws.count)
	# 31155–31160: all 30..39 use 240 before M02 then tier truncation.
	var projectile_cd: int = 240
	if "M02" in mods:
		projectile_cd = int(projectile_cd * 0.85)
	if tier > 0:
		projectile_cd = int(projectile_cd * (0.6 if tier >= 3 else 0.7 if tier >= 2 else 0.8))
	var fields: Dictionary = {"stage":stage, "etype":etype, "ib":false, "lv":level,
		"hp":hp, "mhp":hp, "atk":attack, "baseAtk":attack, "speed":speed, "baseSpd":speed, "r":radius,
		"poise":hp, "maxPoise":hp, "poiseR":0, "eShield":hp, "eShieldMax":hp, "eShieldRegenT":0,
		"elite":tier, "mods":mods, "projCd":projectile_cd}
	# 31165–31166: aura selection is BETWEEN facing and projT, not a prefix.
	fields.st2 = 30.0 + draws.sample() * 50.0
	fields.facing = draws.sample() * PI * 2.0
	if not draws.error.is_empty():
		return _stop(draws.error, draws.count)
	var aura: Variant = null
	if tier >= 2:
		aura = sources.aura.call(tier, stage, draws.sample)
		if not draws.error.is_empty():
			return _stop(draws.error, draws.count)
		if aura != null and not aura is String:
			return _stop("invalid_source_aura", draws.count)
	fields.aura = aura
	fields.projT = 180.0 + draws.sample() * 120.0
	fields.bossPatT = 30.0 + draws.sample() * 20.0
	if not draws.error.is_empty():
		return _stop(draws.error, draws.count)
	for timer in TIMERS:
		fields[timer[0]] = timer[2] + draws.sample() * timer[3] if etype == timer[1] else 9999
		if not draws.error.is_empty():
			return _stop(draws.error, draws.count)
	fields._predCorpseHeal = 0.3 if etype == 37 else 0.0
	# 31260,31300: unconditional draws, even for types with no special AI.
	fields._bossOrbitAng = draws.sample() * PI * 2.0
	fields._erraticAng = draws.sample() * PI * 2.0
	if not draws.error.is_empty():
		return _stop(draws.error, draws.count)
	return {"status":"READY", "fields":fields, "catalog":catalog, "draws":draws.count, "complete_actor":false}

func catalog_for(etype: int) -> Dictionary:
	if etype < 30 or etype > 39:
		return {}
	var row: Array = CATALOG[etype - 30]
	return {"hp":row[0], "atk":row[1], "raw_speed":row[2], "speed":maxf(0.2, row[2] * 1.3), "r":row[3], "poise":row[4], "shield":row[5], "range":row[6], "col":row[7]}

func _context_error(context: Dictionary) -> String:
	for key in ["stage", "etype", "difficulty", "player_level", "stage_difficulty_offset"]:
		var value: Variant = context.get(key)
		if (typeof(value) != TYPE_INT and typeof(value) != TYPE_FLOAT) or not is_finite(float(value)):
			return "missing_finite_context_" + key
	for key in ["stage", "etype", "difficulty"]:
		if float(context[key]) != floor(float(context[key])):
			return "nonintegral_context_" + key
	if context.stage < 4 or context.stage > 9:
		return "unsupported_stage"
	if context.etype < 30 or context.etype > 39:
		return "unsupported_etype"
	if context.difficulty < 0 or context.difficulty > 10:
		return "unsupported_difficulty"
	return ""

func _stop(reason: String, draws: int) -> Dictionary:
	return {"status":"NOT_READY", "reason":reason, "draws":draws, "complete_actor":false}
