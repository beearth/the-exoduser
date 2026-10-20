extends RefCounted
## SK-S05a: learning previews. Actual resource/slot/active owners remain unbound.
const S = preload("res://port_modules/skill_management_source/core_support.gd")

static func ui_gate(skill_id: Variant, fixture: Variant) -> Dictionary:
	var checked := S.prepare(fixture)
	if checked.status != "READY": return checked
	var sk := S.definition(skill_id)
	if sk.status != "READY": return sk
	var p: Dictionary = fixture.p
	var def: Dictionary = sk.value
	return S.ready(S.lv(p, skill_id) < 1 and (not def.has("requires") or S.lv(p, def.requires) >= 1)
		and p.lv >= def.get("reqLv", 0) and p.sp >= def.spCost and fixture.g.mats >= S.mal_cost(def.get("matCost", 0)))

static func preview(skill_id: Variant, fixture: Variant, mode: String = "ui") -> Dictionary:
	var checked := S.prepare(fixture)
	if checked.status != "READY": return checked
	var sk := S.definition(skill_id)
	if sk.status != "READY": return sk
	if not mode in ["ui","direct","auto"]: return S.nr("unsupported_learning_mode")
	var f: Dictionary = checked.value
	if mode == "ui":
		var gate := ui_gate(skill_id, fixture)
		if not gate.value or not S.card_visible(sk.value,f.p): return S.finish(fixture, f, false, "ui_gate")
	elif mode == "direct" and S.lv(f.p, skill_id) >= 1:
		return S.nr("direct_handler_enters_upgrade_not_learning")
	var ok := _apply_shadow(sk.value, f)
	return S.finish(fixture, f, ok, "learned" if ok else "resources")

static func _apply_shadow(sk: Dictionary, f: Dictionary) -> bool:
	# 47274-47294: no learned/requires/reqLv gate here. Recommendation is the caller.
	var material := S.mal_cost(sk.get("matCost", 0))
	if f.p.sp < sk.get("spCost", 0) or f.g.mats < material: return false
	f.p.skills[sk.id] = 1
	f.p.sp -= sk.get("spCost", 0)
	f.g.mats -= material
	if sk.id == "chainAssault" and not S.lv(f.p, "chainSlam"): f.p.skills["chainSlam"] = 1
	for slot in ["charge","bow","tech","magic","q","lmb"]:
		if not S.CATALOG.SLOT_DEFINITIONS[slot].skills.has(sk.id): continue
		if slot == "charge": f.p["activeChargeSk"] = sk.id
		elif slot == "tech": f.p["activeTechSk"] = sk.id
		elif slot == "bow" and f.p.get("activeBowSk", "normal") in [null,"","normal"]: f.p["activeBowSk"] = sk.id
		elif slot == "magic" and f.p.get("activeMagicSk", "fireball") in [null,"","fireball"]: f.p["activeMagicSk"] = sk.id
		elif slot == "q" and sk.id != "parry": f.p["activeQSk"] = sk.id
		elif slot == "lmb" and sk.id != "kiSlash": f.p["activeLMBSk"] = sk.id
	var absorbed: Array = S.RULES.get_all_absorbed(f.p).value
	# Source learning clears numeric slots only, not ULT.
	for i in range(6):
		if absorbed.has(f.slots[i]): f.slots[i] = null
	if sk.get("ult", false):
		if not f.ultimate: f.ultimate = sk.id
	elif sk.get("act", false) and not absorbed.has(sk.id):
		var index: int = S.SLOTS.find_auto(sk.id, f.slots).value
		if index >= 0 and not f.slots.has(sk.id): f.slots[index] = sk.id
	return true
