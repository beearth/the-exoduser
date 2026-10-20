extends RefCounted
## DEMO11-16: source selection and one quote. Never executes protected combat.
const RULES = preload("res://port_modules/skill_management_source/slot_rules.gd")
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const EXECUTORS = {"giantSlam":"cast_giant_slam","spikeTrap":"cast_spike_trap","holyDome":"cast_holy_dome","iceOrb":"cast_ice_orb"}
const HUD_SLOTS = {"1":"qs0","2":"qs1","3":"qs2","4":"qs3","Space":"skSlot1","F":"qs5","Ctrl":"skSlotCT","Z":"ultSlot"}

static func select(slot_key: String, p: Dictionary, g: Dictionary, actor_state: String, orb_active: bool) -> Dictionary:
	if g.get("on") != true or g.get("paused",false) or actor_state in ["dead","fallen"]:
		return {"accepted":false,"reason":"source_global_or_actor_gate"}
	if orb_active and slot_key == "Space": return {"accepted":true,"skill":"iceOrb","method":"activate_ice_shatter","slot":slot_key}
	if actor_state == "pStun": return {"accepted":false,"reason":"protected_poise_escape_interface_required"}
	var selected: Dictionary = RULES.slot_value(slot_key,p,p.get("skillSlots"),p.get("ultSlot"))
	if selected.status != "READY": return {"accepted":false,"reason":selected.reason}
	var sid: Variant = selected.value
	if sid == null or not p.get("skills") is Dictionary or not (p.skills.get(sid) is int or p.skills.get(sid) is float) or p.skills[sid] < 1:
		return {"accepted":false,"reason":"unassigned_or_unlearned"}
	var absorbed: Dictionary = RULES.FUSION.is_absorbed(sid,p)
	if absorbed.status != "READY" or absorbed.value: return {"accepted":false,"reason":"slot_rule_or_absorbed","skill":sid}
	var allowed: Dictionary = RULES.can_equip(slot_key,sid,p)
	if allowed.status != "READY" or not allowed.value: return {"accepted":false,"reason":"slot_rule_or_absorbed","skill":sid}
	if p.get("_gwActive",false) and sid != "ghostWalk": return {"accepted":false,"reason":"ghost_walk_active","skill":sid}
	# Source Ctrl cancellation precedes selected skill, after learned/absorbed checks.
	if orb_active:
		if slot_key == "Ctrl" or sid == "iceOrb": return {"accepted":true,"skill":"iceOrb","method":"activate_ice_shatter","slot":slot_key}
		return {"accepted":false,"reason":"ice_orb_active","skill":sid}
	if not EXECUTORS.has(sid):
		return {"accepted":false,"reason":"executor_interface_required","skill":sid,"slot":slot_key,
			"protected_owner":slot_key in ["LMB","RMB","Shift","E","Q"],"ultimate":slot_key=="Z"}
	return {"accepted":true,"skill":sid,"method":EXECUTORS[sid],"slot":slot_key}

static func quote(sid: String, lv: int, p: Dictionary, context: Dictionary, lesson: bool = false) -> Dictionary:
	if lv < 1 or context.get("ready") != true: return {"ready":false,"reason":"cost_context_unready"}
	for key in ["st_discount","magic_cost","cd_red"]:
		if not (context.get(key) is int or context.get(key) is float) or not is_finite(float(context[key])): return {"ready":false,"reason":"cost_context_invalid"}
	if not (p.get("mst") is int or p.get("mst") is float) or not is_finite(float(p.mst)) or p.mst < 0: return {"ready":false,"reason":"max_st_unready"}
	var q := {"ready":true,"st":0.0,"mp":0.0,"mats":0,"cd":0.0}
	match sid:
		"giantSlam":
			q.st = minf(FORMULA.js_to_int32(50.0*(1.0+(lv-1)*.45)*context.st_discount),FORMULA.js_to_int32(float(p.mst)*.9))
			q.mats = 0 if lesson else 10
			q.cd = FORMULA.js_to_int32(maxf(60.0,1800.0-(lv-1)*12.0)*(1.0+context.cd_red))
		"spikeTrap": q.mats=5; q.cd=FORMULA.js_to_int32(600.0*(1.0+context.cd_red))
		"holyDome": q.cd=1800.0
		"iceOrb": q.mp=FORMULA.js_to_int32(50.0*(1.0+(lv-1)*.35)*context.magic_cost)
		_: return {"ready":false,"reason":"cost_executor_interface_required"}
	if q.st < 0 or q.mp < 0: return {"ready":false,"reason":"negative_cost_unsupported"}
	return q
