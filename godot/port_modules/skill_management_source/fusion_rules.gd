extends RefCounted
## SK-S03: readonly queries over an explicitly borrowed player snapshot.
## No live owner binding, learning/fusing, input, Q/E, save, clock or RNG writes.
const CATALOG = preload("res://port_modules/skill_management_source/catalog.gd")
const FUSION = preload("res://port_modules/fusion_star_source/producer.gd")
const TRUTH = preload("res://port_modules/equipment_affix_reader/producer.gd")
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const SOURCE_PIN := "284d7faf49295b2f5061937a47ce96038032ed3c"
const SOURCE_REF := "game.html:16649,44487-44501,44560-44642,48148-48149"
const REQUIRED_PROFICIENCY := 600
const PROFICIENCY_CAP := 9999
const STAR_COLOR := "#ffcc00"
# JS inherited prototype properties are outside this native own-key API.
const PROTOTYPE_KEYS := ["__proto__", "constructor", "toString", "valueOf", "toLocaleString", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__"]

const DEMO_ALLOWED := [
	"dimBreach",
	"dimSlam",
	"sixFuse",
	"elemFuse",
	"whirlDet",
	"slamStorm",
	"bladeFuse",
	"bladeEcho",
	"plagueFuse",
	"plagueVenom",
	"boneStorm",
	"elecRepent",
	"shieldFuse",
	"holyFuse",
	"holyIce",
	"iceMortar",
	"pillarSpike",
	"pillarSlam",
	"infernoSlam",
	"thunderGhost",
	"dualScarecrow",
	"siegeGhost"
]

const ABSORPTION := {
	"dimBreach": [
		"magicBlink"
	],
	"dimSlam": [
		"magicBlink",
		"chainAssault"
	],
	"dimThunder": [
		"magicBlink",
		"chainAssault",
		"chainSlam"
	],
	"dimRush": [
		"magicBlink",
		"chainAssault",
		"chainSlash",
		"chainSlam"
	],
	"dimBlast": [
		"magicBlink",
		"chainAssault",
		"chainSlash",
		"chainSlam",
		"giantSlam"
	],
	"whirlDet": [
		"detonate"
	],
	"slamStorm": [
		"detonate",
		"giantSlam"
	],
	"stormBeam": [
		"detonate",
		"giantSlam",
		"fanShot",
		"omniBeam",
		"elemMissile"
	],
	"stormBurst": [
		"detonate",
		"giantSlam",
		"fanShot",
		"omniBeam",
		"elemMissile",
		"burstLoop"
	],
	"bladeFuse": [
		"guardian"
	],
	"iceMortar": [
		"iceOrb"
	],
	"sixFuse": [
		"omniBeam"
	],
	"elemFuse": [
		"fanShot",
		"omniBeam",
		"elemMissile"
	],
	"boneStorm": [
		"boneWall"
	],
	"elecRepent": [
		"hellRay",
		"boneWall"
	],
	"shieldFuse": [
		"shieldThrow"
	],
	"plagueFuse": [
		"guardian",
		"plagueBurst"
	],
	"plagueVenom": [
		"guardian",
		"plagueBurst",
		"venomBlade"
	],
	"holyFuse": [
		"holyPrison"
	],
	"holyIce": [
		"holyPrison",
		"iceStorm"
	],
	"holyWeak1": [
		"holyPrison",
		"iceStorm",
		"weakPhys"
	],
	"holyWeak2": [
		"holyPrison",
		"iceStorm",
		"weakPhys",
		"weakMag"
	],
	"holyWeak3": [
		"holyPrison",
		"iceStorm",
		"weakPhys",
		"weakMag",
		"weakPj"
	],
	"holyWeak4": [
		"holyPrison",
		"iceStorm",
		"weakPhys",
		"weakMag",
		"weakPj",
		"weakRev"
	],
	"pillarSpike": [
		"spikeTrap"
	],
	"pillarSlam": [
		"darkPillar"
	],
	"infernoSlam": [
		"fireAura"
	],
	"siegeGhost": [
		"voidScarecrow"
	],
	"dualScarecrow": [
		"explodeScarecrow"
	],
	"thunderGhost": [
		"thunderStake"
	],
	"timeStep": [
		"ghostWalk"
	]
}

const NAMES_KO := {
	"dimBreach": "기동:기습",
	"dimSlam": "기동:파쇄",
	"dimThunder": "기동:전폭",
	"dimRush": "기동:칼날개",
	"dimBlast": "기동:섬멸",
	"whirlDet": "회전기폭",
	"slamStorm": "지진폭풍",
	"stormBeam": "암전나선",
	"stormBurst": "암전폭류",
	"bladeFuse": "악의 해방",
	"iceMortar": "얼음소용돌이",
	"sixFuse": "만화광선",
	"elemFuse": "추적암전",
	"boneStorm": "해골번개",
	"elecRepent": "참회 귀환",
	"shieldFuse": "불꽃칼날",
	"plagueFuse": "독혈해방",
	"plagueVenom": "독사해방",
	"holyFuse": "결계의 영역",
	"holyIce": "물의 영역",
	"holyWeak1": "파쇄의 영역",
	"holyWeak2": "침식의 영역",
	"holyWeak3": "관통의 영역",
	"holyWeak4": "권능의 영역",
	"pillarSpike": "기둥가시",
	"pillarSlam": "기둥강타",
	"infernoSlam": "지옥강타 2",
	"siegeGhost": "공성유령",
	"dualScarecrow": "쌍둥이허수아비",
	"thunderGhost": "전격의창",
	"timeStep": "시간걸음",
	"bladeEcho": "추적전격"
}

const NAMES_EN := {
	"dimBreach": "Maneuver:Ambush",
	"dimSlam": "Maneuver:Shatter",
	"dimThunder": "Maneuver:Thunder",
	"dimRush": "Maneuver:Bladewing",
	"dimBlast": "Maneuver:Annihilate",
	"whirlDet": "Whirl-Det",
	"slamStorm": "Quake Storm",
	"stormBeam": "Lightning Helix",
	"stormBurst": "Lightning Burst",
	"bladeFuse": "Malice Liberation",
	"iceMortar": "Ice Vortex",
	"sixFuse": "Luminescence",
	"elemFuse": "Tracking Lightning",
	"boneStorm": "Bone Lightning",
	"elecRepent": "Repentance Return",
	"shieldFuse": "Flame Blade",
	"plagueFuse": "Plague Liberation",
	"plagueVenom": "Venom Liberation",
	"holyFuse": "Ward Domain",
	"holyIce": "Water Domain",
	"holyWeak1": "Shatter Domain",
	"holyWeak2": "Corrode Domain",
	"holyWeak3": "Pierce Domain",
	"holyWeak4": "Sovereign Domain",
	"pillarSpike": "Pillar Spike",
	"pillarSlam": "Pillar Slam",
	"infernoSlam": "Hell Slam II",
	"siegeGhost": "Siege Ghost",
	"dualScarecrow": "Twin Scarecrow",
	"thunderGhost": "Thunder Spear",
	"timeStep": "Time Step",
	"bladeEcho": "Blade Chase"
}

# 44487 exclusions are display-candidate rules, not _canFuse prerequisites.
const DISPLAY_EXCLUSIONS := {
	"sixFuse": ["elemFuse"], "elemFuse": ["stormBeam", "stormBurst"],
	"whirlDet": ["slamStorm"], "slamStorm": ["stormBeam", "stormBurst"],
	"stormBeam": ["stormBurst"], "dimBreach": ["dimSlam", "dimThunder", "dimRush"],
	"dimSlam": ["dimThunder", "dimRush"], "dimThunder": ["dimRush"], "dimRush": ["dimBlast"],
	"boneStorm": ["elecRepent"],
	"holyFuse": ["holyIce", "holyWeak1", "holyWeak2", "holyWeak3", "holyWeak4"],
	"holyIce": ["holyWeak1", "holyWeak2", "holyWeak3", "holyWeak4"],
	"holyWeak1": ["holyWeak2", "holyWeak3", "holyWeak4"],
	"holyWeak2": ["holyWeak3", "holyWeak4"], "holyWeak3": ["holyWeak4"]}

static func read_rules_catalog() -> Dictionary:
	return {"demo_allowed": DEMO_ALLOWED.duplicate(), "absorption": ABSORPTION.duplicate(true),
		"names_ko": NAMES_KO.duplicate(), "names_en": NAMES_EN.duplicate(),
		"source_pin": SOURCE_PIN, "source": SOURCE_REF}

static func can_fuse(key: Variant, player: Variant, demo_mode: Variant = false) -> Dictionary:
	if not _supported_id(key): return _nr("unsupported_id", key)
	if not FUSION.FUSE_PAIRS.has(key): return _ready(false, "unknown_fusion")
	if not demo_mode is bool: return _nr("unsupported_demo_mode", demo_mode)
	if demo_mode and not DEMO_ALLOWED.has(key): return _ready(false, "demo_forbidden")
	var state: Dictionary = _fused_state(player)
	if state.status != "READY": return state
	if _flag(state.value, key): return _ready(false, "already_fused")
	if not player.has("skills") or not player.skills is Dictionary:
		return _nr("skills_unavailable", player)
	if not _string_keys(player.skills): return _nr("unsupported_skill_keys", player.skills)
	for member in FUSION.FUSE_PAIRS[key]:
		var level: Variant = player.skills.get(member, null)
		if level == null: return _ready(false, "member_unlearned")
		if not _finite_number(level): return _nr("unsupported_member_level", level)
		if level < 1: return _ready(false, "member_unlearned")
	return _ready(true, "members_learned")

static func is_fused(key: Variant, player: Variant) -> Dictionary:
	if not _supported_id(key): return _nr("unsupported_id", key)
	var state: Dictionary = _fused_state(player)
	if state.status != "READY": return state
	return _ready(_flag(state.value, key))

static func get_fuse_key(skill_id: Variant, player: Variant) -> Dictionary:
	if not _supported_id(skill_id): return _nr("unsupported_id", skill_id)
	var state: Dictionary = {}
	for key in FUSION.FUSE_PAIRS:
		if not FUSION.FUSE_PAIRS[key].has(skill_id): continue
		if state.is_empty():
			state = _fused_state(player)
			if state.status != "READY": return state
		var fused: Dictionary = state.value
		if _flag(fused, key): continue
		var skip := false
		for higher in DISPLAY_EXCLUSIONS.get(key, []):
			if _flag(fused, higher):
				skip = true
				break
		if skip: continue
		if key == "elecRepent" and not _flag(fused, "boneStorm"): continue
		return _ready(key)
	return _ready(null)

static func innate_star(skill_id: Variant) -> Dictionary:
	if not _supported_id(skill_id): return _nr("unsupported_id", skill_id)
	var minimum := 999
	for key in FUSION.FUSE_PAIRS:
		if FUSION.FUSE_PAIRS[key].has(skill_id): minimum = mini(minimum, _group_star(key))
	return _ready(maxi(1, minimum - 1) if minimum < 999 else 0)

static func fused_star(skill_id: Variant, player: Variant) -> Dictionary:
	if not _supported_id(skill_id): return _nr("unsupported_id", skill_id)
	# Reuse the existing original _fuseStar provider; no duplicate maximum algorithm.
	var provider = FUSION.new()
	provider.configure(func() -> Variant: return player)
	return provider.fuse_star(skill_id)

static func display_star(skill_id: Variant, player: Variant) -> Dictionary:
	var native: Dictionary = innate_star(skill_id)
	if native.status != "READY": return native
	if not player is Dictionary: return _nr("player_unavailable", player)
	var demo_test: Variant = player.get("isDemoTest", false)
	if not demo_test is bool: return _nr("unsupported_demo_test", demo_test)
	var star: int = native.value
	if not demo_test:
		var fused: Dictionary = fused_star(skill_id, player)
		if fused.status != "READY": return fused
		star = maxi(star, int(fused.value))
	var count := mini(star, 6) if star >= 1 else 0
	return _ready({"star":star, "count":count, "text":"★".repeat(count),
		"color":STAR_COLOR if count > 0 else null})

static func get_absorbed(key: Variant) -> Dictionary:
	if not _supported_id(key): return _nr("unsupported_id", key)
	# bladeEcho is absent from the source table; do not repair it.
	return _ready(ABSORPTION.get(key, []).duplicate())

static func get_all_absorbed(player: Variant) -> Dictionary:
	var state: Dictionary = _fused_state(player)
	if state.status != "READY": return state
	var result: Array = []
	for key in FUSION.FUSE_PAIRS:
		if not _flag(state.value, key): continue
		for member in ABSORPTION.get(key, []):
			if not result.has(member): result.append(member)
	return _ready(result)

static func is_absorbed(skill_id: Variant, player: Variant) -> Dictionary:
	if not _supported_id(skill_id): return _nr("unsupported_id", skill_id)
	var state: Dictionary = _fused_state(player)
	if state.status != "READY": return state
	var fused: Dictionary = state.value
	# Source checks stormBeam only: elemFuse + stormBurst (without stormBeam) is also exempt.
	if skill_id == "omniBeam" and _flag(fused, "elemFuse") and not _flag(fused, "stormBeam"):
		return _ready(false)
	for key in FUSION.FUSE_PAIRS:
		if _flag(fused, key) and ABSORPTION.get(key, []).has(skill_id): return _ready(true)
	return _ready(false)

static func fusion_names(key: Variant) -> Dictionary:
	if not _supported_id(key): return _nr("unsupported_id", key)
	# Raw KO/EN source labels; _L/_T/format and actual locale ownership are not implemented.
	return _ready({"ko":NAMES_KO.get(key, key), "en":NAMES_EN.get(key, key)})

static func category_proficiency(category: Variant, player: Variant) -> Dictionary:
	if not _supported_id(category): return _nr("unsupported_id", category)
	if not TRUTH.js_truthy(player) or category.is_empty(): return _ready(0)
	return _proficiency_value(player, "_catProf", category)

static func skill_proficiency(skill_id: Variant, player: Variant) -> Dictionary:
	if not _supported_id(skill_id): return _nr("unsupported_id", skill_id)
	if not TRUTH.js_truthy(player): return _ready(0)
	if not player is Dictionary: return _nr("player_unavailable", player)
	var category: Variant = "phys" if skill_id in ["meleeAttack", "shieldBash"] else null
	if category == null:
		var definition: Dictionary = CATALOG.read_skill(skill_id)
		if definition.status != "READY": return definition
		if definition.found: category = definition.value.cat
	if category != null: return category_proficiency(category, player)
	return _proficiency_value(player, "_skProf", skill_id)

static func proficiency_level(skill_id: Variant, player: Variant) -> Dictionary:
	var value: Dictionary = skill_proficiency(skill_id, player)
	if value.status != "READY": return value
	return _ready(FORMULA.js_to_int32(float(value.value) / 10.0))

static func proficiency_multiplier(skill_id: Variant, player: Variant) -> Dictionary:
	var value: Dictionary = proficiency_level(skill_id, player)
	if value.status != "READY": return value
	return _ready(1.0 + int(value.value) * 0.02)

static func proficiency_cap(skill_id: Variant) -> Dictionary:
	if not _supported_id(skill_id): return _nr("unsupported_id", skill_id)
	return _ready(PROFICIENCY_CAP)

static func proficiency_maxed(skill_id: Variant, player: Variant) -> Dictionary:
	var value: Dictionary = skill_proficiency(skill_id, player)
	if value.status != "READY": return value
	return _ready(value.value >= PROFICIENCY_CAP)

static func card_proficiency(key: Variant, player: Variant) -> Dictionary:
	if not _supported_id(key): return _nr("unsupported_id", key)
	if not FUSION.FUSE_PAIRS.has(key): return _ready(0)
	var minimum := INF
	for member in FUSION.FUSE_PAIRS[key]:
		var value: Dictionary = skill_proficiency(member, player)
		if value.status != "READY": return value
		minimum = minf(minimum, float(value.value))
	return _ready(0 if is_inf(minimum) else minimum)

static func card_proficiency_hms(key: Variant, player: Variant) -> Dictionary:
	var value: Dictionary = card_proficiency(key, player)
	if value.status != "READY": return value
	var seconds := FORMULA.js_to_int32(value.value)
	var minutes := FORMULA.js_to_int32(float(seconds) / 60.0)
	var remainder := seconds - minutes * 60
	return _ready(str(minutes) + "m" + (str(remainder) + "s" if remainder != 0 else ""))

static func fuse_proficiency(key: Variant, player: Variant) -> Dictionary:
	return card_proficiency(key, player)

static func required_proficiency(key: Variant) -> Dictionary:
	if not _supported_id(key): return _nr("unsupported_id", key)
	# Source ignores key and returns 600; this is not a _canFuse gate.
	return _ready(REQUIRED_PROFICIENCY)

static func _flag(fused: Dictionary, key: String) -> bool:
	return TRUTH.js_truthy(fused.get(key, null))

static func _group_star(key: String) -> int:
	var explicit: Variant = FUSION.GEM_GROUP_STAR[key]
	return int(explicit) if TRUTH.js_truthy(explicit) else FUSION.FUSE_PAIRS[key].size()

static func _fused_state(player: Variant) -> Dictionary:
	if not player is Dictionary: return _nr("player_unavailable", player)
	return _map_or_empty(player.get("_fused", null))

static func _map_or_empty(value: Variant) -> Dictionary:
	if not TRUTH.js_truthy(value): return _ready({})
	if not value is Dictionary: return _nr("unsupported_map", value)
	if not _string_keys(value): return _nr("unsupported_map_keys", value)
	return _ready(value) # internal borrowed map; public results never mutate it

static func _proficiency_value(player: Variant, field: String, key: String) -> Dictionary:
	if not player is Dictionary: return _nr("player_unavailable", player)
	var state: Dictionary = _map_or_empty(player.get(field, null))
	if state.status != "READY": return state
	var value: Variant = state.value.get(key, null)
	if not TRUTH.js_truthy(value): return _ready(0)
	if not _finite_number(value): return _nr("unsupported_proficiency_value", value)
	return _ready(value)

static func _string_keys(value: Dictionary) -> bool:
	for key in value:
		if not key is String or PROTOTYPE_KEYS.has(key): return false
	return true

static func _supported_id(value: Variant) -> bool:
	return value is String and not PROTOTYPE_KEYS.has(value)

static func _finite_number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _ready(value: Variant, branch: String = "source_value") -> Dictionary:
	return {"status":"READY", "value":value, "branch":branch}

static func _nr(reason: String, input: Variant) -> Dictionary:
	return {"status":"NOT_READY", "reason":reason, "input":input}
