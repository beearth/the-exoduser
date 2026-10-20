extends RefCounted
## SK-S05 private preview support. Borrowed fixture is never modified.
const CATALOG = preload("res://port_modules/skill_management_source/catalog.gd")
const COST = preload("res://port_modules/skill_management_cost_source/producer.gd")
const RULES = preload("res://port_modules/skill_management_source/fusion_rules.gd")
const SLOTS = preload("res://port_modules/skill_management_source/slot_rules.gd")
const PAIRS = preload("res://port_modules/fusion_star_source/producer.gd")
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const ACTIVE_FIELDS := ["activeLMBSk","activeRMBSk","activeChargeSk","activeMagicSk","activeQSk","activeCtSk","activeBowSk","activeTechSk"]
const SOURCE_PIN := "e556b617190c325ca39f5add04357f5dea5ca87e"
const MAX_SAFE_INTEGER := 9007199254740991
# Different original host tables intentionally remain different.
const SYNC_HOSTS := {"elemFuse":"omniBeam","sixFuse":"omniBeam","stormBeam":"whirlwind","stormBurst":"whirlwind","whirlDet":"whirlwind","slamStorm":"whirlwind","dimBreach":"chargeBoost","dimSlam":"chargeBoost","dimThunder":"chargeBoost","dimBlast":"chargeBoost","bladeFuse":"maliceHunt","plagueFuse":"maliceHunt","plagueVenom":"maliceHunt","iceMortar":"maliceMortar","boneStorm":"maliceStorm","elecRepent":"maliceStorm","shieldFuse":"maliceSwipe","holyFuse":"holyDome","holyIce":"holyDome","holyWeak1":"holyDome","holyWeak2":"holyDome","holyWeak3":"holyDome","holyWeak4":"holyDome","pillarSpike":"darkPillar","pillarSlam":"giantSlam2","infernoSlam":"giantSlam2","siegeGhost":"ghostXbowTurret","thunderGhost":"bladeDash","timeStep":"timeWarp"}

static func prepare(fixture: Variant) -> Dictionary:
	if not fixture is Dictionary: return nr("fixture_unavailable")
	if not fixture.get("p") is Dictionary or not fixture.get("g") is Dictionary: return nr("p_g_unavailable")
	var p: Dictionary = fixture.p
	if not p.get("skills") is Dictionary: return nr("skills_unavailable")
	if not integer(p.get("sp")) or not integer(p.get("lv")) or not integer(fixture.g.get("mats")): return nr("resources_or_level_unsupported")
	if not keys(p.skills): return nr("unsupported_skill_keys")
	for value in p.skills.values():
		if not integer(value) or value < 0 or value > 20: return nr("unsupported_skill_level")
	var fused: Variant = p.get("_fused", null)
	if not fused is Dictionary: return nr("fused_map_unavailable")
	if fused is Dictionary:
		if not keys(fused): return nr("unsupported_fused_keys")
		for value in fused.values():
			if not value is bool: return nr("unsupported_fused_flag")
	var slots: Variant = fixture.get("slots")
	if not slots is Array or slots.size() != 6: return nr("six_slots_unavailable")
	for id in slots:
		if id != null and not supported_id(id): return nr("unsupported_slot_value")
	if not fixture.has("ultimate") or (fixture.ultimate != null and not supported_id(fixture.ultimate)): return nr("ultimate_unavailable")
	for field in ACTIVE_FIELDS:
		var value: Variant = p.get(field)
		if value != null and not supported_id(value): return nr("unsupported_active_value")
	var shadow: Dictionary = fixture.duplicate(true)
	# Web SP/mats are Number, not native int64. Preserve rounding at each operation.
	shadow.p.sp = float(shadow.p.sp)
	shadow.g.mats = float(shadow.g.mats)
	return ready(shadow)

static func finish(original: Dictionary, shadow: Dictionary, applied: bool, branch: String, details: Dictionary = {}) -> Dictionary:
	# Project source fixed-active side effects as data, never as an applicable P patch.
	var proposals: Dictionary = {}
	for field in ACTIVE_FIELDS:
		if shadow.p.has(field) and (not original.p.has(field) or shadow.p[field] != original.p[field]): proposals[field] = shadow.p[field]
		if original.p.has(field): shadow.p[field] = original.p[field]
		else: shadow.p.erase(field)
	return ready({"fixture":shadow, "applied":applied, "branch":branch, "details":details,
		"protected_active_proposals":proposals, "runtime_writer":"NOT_IMPLEMENTED"})

static func definition(id: Variant) -> Dictionary:
	if not supported_id(id): return nr("unsupported_id")
	var sk: Dictionary = CATALOG.read_skill(id)
	if not sk.found: return nr("unknown_skill")
	return ready(sk.value)

static func lv(p: Dictionary, id: String, fallback: int = 0) -> int:
	var value: int = int(p.skills.get(id, 0))
	return value if value != 0 else fallback

static func flag(p: Dictionary, key: String) -> bool:
	var fused: Variant = p.get("_fused")
	return fused is Dictionary and fused.get(key, false)

static func members(key: String) -> Array:
	return PAIRS.FUSE_PAIRS.get(key, []).duplicate()

static func star(key: String) -> int:
	return int(PAIRS.GEM_GROUP_STAR.get(key, 0)) if PAIRS.GEM_GROUP_STAR.get(key, 0) else members(key).size()

static func min_level(p: Dictionary, ids: Array) -> int:
	var result := 2147483647
	for id in ids: result = mini(result, lv(p, id, 1))
	return result

static func lock_level(p: Dictionary) -> int:
	return mini(20, FORMULA.js_to_int32(float(p.lv) / 50.0) + 1)

static func mal_cost(value: int) -> int:
	# game.html:28080-28085. QS-01's existing potion reader has no malCost API.
	return 0 if value <= 0 else maxi(1, int(ceil(value * 0.5)))

static func up_cost(level: int) -> int:
	return COST.skill_up_sp_cost(level).value

static func fuse_cost(level: int, count: int) -> int:
	return COST.fuse_up_sp_cost(level, count).value

static func spent(sk: Dictionary, level: int) -> int:
	return COST.skill_spent_sp(sk, level).value

static func card_visible(sk: Dictionary, p: Dictionary) -> bool:
	# Legacy row's early visibility gates, game.html:47955-47965.
	if RULES.is_absorbed(sk.id,p).value: return false
	if sk.id == "chainSlam" and lv(p,"chainAssault") < 1: return false
	if sk.get("hidden",false) and not lv(p,sk.id) and sk.id != "chainSlash" and not sk.get("reqLv",0): return false
	return true

static func clear_slots(f: Dictionary, ids: Array) -> void:
	for i in range(6):
		if ids.has(f.slots[i]): f.slots[i] = null
	if ids.has(f.ultimate): f.ultimate = null

static func sync_active_projection(p: Dictionary, reset_ids: Array) -> void:
	# Source 44644-44661 on a private shadow only; finish strips these writes.
	var hosts: Array = []
	for key in SYNC_HOSTS:
		if flag(p, key): hosts.append(SYNC_HOSTS[key])
	var fields := ["activeLMBSk","activeChargeSk","activeMagicSk","activeQSk","activeCtSk","activeBowSk"]
	var defs := ["lmb","charge","magic","q","ct","bow"]
	var defaults := ["kiSlash","charge","fireball","parry","ghostWalk","normal"]
	for i in range(fields.size()):
		var value: Variant = p.get(fields[i])
		var valid: bool = value != null and value != ""
		if valid and reset_ids.has(value) and not hosts.has(value): valid = false
		elif valid: valid = lv(p, value) >= 1 or CATALOG.SLOT_DEFINITIONS[defs[i]].skills.has(value)
		if not valid and (i == 0 or value != defaults[i]): p[fields[i]] = defaults[i]
	if p.get("activeRMBSk") and reset_ids.has(p.activeRMBSk): p["activeRMBSk"] = "maliceSwipe"

static func integer(value: Variant) -> bool:
	if value is int: return value >= -MAX_SAFE_INTEGER and value <= MAX_SAFE_INTEGER
	return value is float and is_finite(value) and value == floor(value) and abs(value) <= float(MAX_SAFE_INTEGER)

static func supported_id(value: Variant) -> bool:
	return value is String and not RULES.PROTOTYPE_KEYS.has(value)

static func keys(dict: Dictionary) -> bool:
	for key in dict:
		if not supported_id(key): return false
	return true

static func ready(value: Variant) -> Dictionary:
	return {"status":"READY", "value":value}

static func nr(reason: String) -> Dictionary:
	return {"status":"NOT_READY", "reason":reason}
