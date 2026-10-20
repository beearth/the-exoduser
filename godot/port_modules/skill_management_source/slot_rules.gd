extends RefCounted
## SK-S04: explicit snapshot readers and copy-only slot previews. No live writer.
const CATALOG = preload("res://port_modules/skill_management_source/catalog.gd")
const FUSION = preload("res://port_modules/skill_management_source/fusion_rules.gd")
const TRUTH = preload("res://port_modules/equipment_affix_reader/producer.gd")
const SOURCE_PIN := "e556b617190c325ca39f5add04357f5dea5ca87e"
const SOURCE_REF := "game.html:44230-44274,44965-45007,46969-47083;skill-forge.js:17-24,57-84"
# Source Forge order; bow/T is in the legacy popup, not in these 13 slots.
const SLOTS := [
	{"k":"1","kind":"num","idx":0}, {"k":"2","kind":"num","idx":1},
	{"k":"3","kind":"num","idx":2}, {"k":"4","kind":"num","idx":3},
	{"k":"F","kind":"num","idx":5}, {"k":"Z","kind":"ult"},
	{"k":"LMB","kind":"fixed","def":"lmb","v":"activeLMBSk"},
	{"k":"RMB","kind":"fixed","def":"rmb","v":"activeRMBSk"},
	{"k":"Shift","kind":"fixed","def":"charge","v":"activeChargeSk"},
	{"k":"E","kind":"fixed","def":"magic","v":"activeMagicSk"},
	{"k":"Q","kind":"fixed","def":"q","v":"activeQSk"},
	{"k":"Ctrl","kind":"fixed","def":"ct","v":"activeCtSk"},
	{"k":"Space","kind":"num","idx":4}
]
const POPUP_DEFAULTS := {"charge":"charge","magic":"fireball","bow":"normal","tech":"maliceMortar","lmb":"kiSlash","rmb":"shieldBlock","q":"parry","ct":"ghostWalk"}
const POPUP_FIELDS := {"charge":"activeChargeSk","magic":"activeMagicSk","bow":"activeBowSk","tech":"activeTechSk","lmb":"activeLMBSk","rmb":"activeRMBSk","q":"activeQSk","ct":"activeCtSk"}
# This old popup table intentionally differs from Forge's hostOf and reset tables.
const POPUP_HOSTS := {"whirlDet":"whirlwind","slamStorm":"whirlwind","stormBeam":"whirlwind","dimBreach":"chargeBoost","dimSlam":"chargeBoost","dimThunder":"chargeBoost","dimBlast":"chargeBoost","sixFuse":"fanShot","elemFuse":"omniBeam","bladeFuse":"maliceHunt","plagueFuse":"maliceHunt","plagueVenom":"maliceHunt","iceMortar":"maliceMortar","boneStorm":"maliceStorm","elecRepent":"maliceStorm","shieldFuse":"maliceSwipe","pillarSlam":"giantSlam2","pillarSpike":"darkPillar","holyFuse":"holyDome","holyIce":"holyDome","timeStep":"timeWarp"}
const POPUP_FIXED_ONLY := ["bladeShot","fanShot","omniBeam","elemMissile","shieldThrow","blastShot","ghostWalk","iceOrb","timeWarp","needleShot","peaceShield","hellRay","blueShot","fireball","arcLaser"]
const FIXED_FREE := ["charge","parry","normal","fireball","kiSlash","ghostWalk"]
const FUSED_POPUP_FREE := ["normal","charge","parry","ghostWalk"]

static func read_definitions() -> Dictionary:
	return _ready(SLOTS.duplicate(true))

static func is_area(skill_id: Variant) -> Dictionary:
	var sk := _skill(skill_id)
	if sk.status != "READY": return sk
	return _ready(sk.found and sk.value.get("cat") == "tech" and sk.value.get("act", false) and not sk.value.get("fixed", false))

static func is_rage(skill_id: Variant) -> Dictionary:
	var sk := _skill(skill_id)
	if sk.status != "READY": return sk
	return _ready(skill_id in ["giantSlam", "giantSlam2"] or (sk.found and sk.value.get("cat") == "rage"))

static func can_assign(skill_id: Variant, slot_index: Variant) -> Dictionary:
	var sk := _skill(skill_id)
	if sk.status != "READY": return sk
	if not sk.found or not sk.value.get("act", false) or sk.value.get("ult", false) or sk.value.get("fixed", false): return _ready(false)
	if not _finite(slot_index): return _nr("unsupported_index", slot_index)
	if is_area(skill_id).value: return _ready(slot_index == 5)
	if is_rage(skill_id).value: return _ready(slot_index == 4)
	return _ready(slot_index >= 0 and slot_index < 4)

static func find_auto(skill_id: Variant, slots: Variant) -> Dictionary:
	if not _id(skill_id): return _nr("unsupported_id", skill_id)
	var valid := _slots(slots)
	if valid.status != "READY": return valid
	if slots.has(skill_id): return _ready(-1)
	if is_area(skill_id).value: return _ready(5 if slots[5] == null and can_assign(skill_id, 5).value else -1)
	if is_rage(skill_id).value: return _ready(4 if slots[4] == null and can_assign(skill_id, 4).value else -1)
	for i in range(4):
		if slots[i] == null and can_assign(skill_id, i).value: return _ready(i)
	return _ready(-1)

static func repair_preview(slots: Variant) -> Dictionary:
	var valid := _slots(slots)
	if valid.status != "READY": return valid
	var copy: Array = slots.duplicate(true)
	var changed := false
	var displaced: Array = []
	# Source order is F then Space, then ordinary slots, then displaced entries.
	for i in [5, 4]:
		var sid: Variant = copy[i]
		if TRUTH.js_truthy(sid) and not can_assign(sid, i).value:
			displaced.append(sid)
			copy[i] = null
			changed = true
	for i in range(4):
		var sid: Variant = copy[i]
		if not TRUTH.js_truthy(sid) or can_assign(sid, i).value: continue
		copy[i] = null
		changed = true
		if is_area(sid).value and not TRUTH.js_truthy(copy[5]): copy[5] = sid
		elif is_rage(sid).value and not TRUTH.js_truthy(copy[4]): copy[4] = sid
	for sid in displaced:
		if not TRUTH.js_truthy(sid) or copy.has(sid): continue
		if is_area(sid).value and not TRUTH.js_truthy(copy[5]):
			copy[5] = sid
			continue
		if is_rage(sid).value and not TRUTH.js_truthy(copy[4]):
			copy[4] = sid
			continue
		for i in range(4):
			if copy[i] == null and can_assign(sid, i).value:
				copy[i] = sid
				break
	return _ready({"slots":copy, "changed":changed})

static func slot_value(slot_key: Variant, player: Variant, slots: Variant, ultimate: Variant) -> Dictionary:
	var slot := _slot(slot_key)
	if slot.status != "READY": return slot
	var value: Variant
	if slot.value.kind == "num":
		var valid := _slots(slots)
		if valid.status != "READY": return valid
		value = slots[slot.value.idx]
	elif slot.value.kind == "ult":
		if not _slot_content(ultimate): return _nr("unsupported_ultimate", ultimate)
		value = ultimate
	else:
		if not player is Dictionary: return _nr("player_unavailable", player)
		value = player.get(slot.value.v, null)
		if not _slot_content(value): return _nr("unsupported_active_value", value)
	return _ready(value if TRUTH.js_truthy(value) else null)

static func slot_eligible(slot_key: Variant, player: Variant) -> Dictionary:
	var slot := _slot(slot_key)
	if slot.status != "READY": return slot
	var candidates: Array = []
	if slot.value.kind == "fixed": candidates = CATALOG.SLOT_DEFINITIONS[slot.value.def].skills.duplicate()
	else:
		for sk in CATALOG.SKILLS:
			if slot.value.kind == "ult":
				if sk.get("ult", false): candidates.append(sk.id)
			elif can_assign(sk.id, slot.value.idx).value: candidates.append(sk.id)
	var result: Array = []
	for sid in candidates:
		var absorbed := FUSION.is_absorbed(sid, player)
		if absorbed.status != "READY": return absorbed
		if absorbed.value: continue
		var sk := _skill(sid)
		if sk.found and sk.value.get("hidden", false):
			var level := _level(sid, player)
			if level.status != "READY": return level
			if not TRUTH.js_truthy(level.value) and not sk.value.get("reqLv", 0): continue
		result.append(sid)
	return _ready(result)

static func can_equip(slot_key: Variant, skill_id: Variant, player: Variant) -> Dictionary:
	var slot := _slot(slot_key)
	if slot.status != "READY": return slot
	if not _id(skill_id): return _nr("unsupported_id", skill_id)
	if skill_id.is_empty(): return _ready(false)
	var sk := _skill(skill_id)
	if slot.value.kind == "fixed":
		if not CATALOG.SLOT_DEFINITIONS[slot.value.def].skills.has(skill_id): return _ready(false)
		if not sk.found: return _ready(true)
	elif slot.value.kind == "ult" and (not sk.found or not sk.value.get("ult", false)): return _ready(false)
	var level := _level(skill_id, player)
	if level.status != "READY": return level
	if slot.value.kind == "fixed": return _ready(level.value >= 1 or FIXED_FREE.has(skill_id))
	if level.value < 1: return _ready(false)
	if slot.value.kind == "ult": return _ready(true)
	var absorbed := FUSION.is_absorbed(skill_id, player)
	if absorbed.status != "READY": return absorbed
	if absorbed.value: return _ready(false)
	return can_assign(skill_id, slot.value.idx)

static func equip_preview(slot_key: Variant, skill_id: Variant, player: Variant, slots: Variant, ultimate: Variant) -> Dictionary:
	# Copy-only plan for numeric/ultimate fixture fields. Fixed active writers remain protected.
	var slot := _slot(slot_key)
	if slot.status != "READY": return slot
	if slot.value.kind == "fixed": return _nr("fixed_writer_out_of_scope", slot_key)
	var valid := _slots(slots)
	if valid.status != "READY": return valid
	if not _slot_content(ultimate): return _nr("unsupported_ultimate", ultimate)
	var allowed := can_equip(slot_key, skill_id, player)
	if allowed.status != "READY": return allowed
	var copy: Array = slots.duplicate(true)
	var next_ult: Variant = ultimate
	if allowed.value:
		if slot.value.kind == "num":
			for i in range(copy.size()):
				if copy[i] == skill_id: copy[i] = null
			copy[slot.value.idx] = skill_id
		else: next_ult = skill_id
	return _ready({"allowed":allowed.value, "slots":copy, "ultimate":next_ult})

static func read_model(player: Variant, slots: Variant, ultimate: Variant) -> Dictionary:
	var result: Array = []
	for slot in SLOTS:
		var value := slot_value(slot.k, player, slots, ultimate)
		if value.status != "READY": return value
		var eligible := slot_eligible(slot.k, player)
		if eligible.status != "READY": return eligible
		result.append({"slot":slot.duplicate(true), "value":value.value, "eligible":eligible.value})
	return _ready(result)

static func numeric_popup_candidates(slot_index: Variant, player: Variant) -> Dictionary:
	if not _finite(slot_index): return _nr("unsupported_index", slot_index)
	if not player is Dictionary or not player.get("skills") is Dictionary: return _nr("popup_skills_unavailable", player)
	var absorbed := FUSION.get_all_absorbed(player)
	if absorbed.status != "READY": return absorbed
	var result: Array = []
	for sk in CATALOG.SKILLS:
		if not can_assign(sk.id, slot_index).value: continue
		var level := _level(sk.id, player)
		if level.status != "READY": return level
		if level.value >= 1 and not absorbed.value.has(sk.id) and not POPUP_FIXED_ONLY.has(sk.id): result.append(sk.id)
	return _ready(result)

static func fixed_popup(tab: Variant, player: Variant) -> Dictionary:
	if not _id(tab): return _nr("unsupported_id", tab)
	if not CATALOG.SLOT_DEFINITIONS.has(tab): return _nr("unknown_popup_tab", tab)
	if not player is Dictionary or not player.get("skills") is Dictionary: return _nr("popup_skills_unavailable", player)
	var absorbed := FUSION.get_all_absorbed(player)
	if absorbed.status != "READY": return absorbed
	var flags: Dictionary = {}
	for key in POPUP_HOSTS.keys() + ["stormBurst", "dimRush"]:
		var flag := FUSION.is_fused(key, player)
		if flag.status != "READY": return flag
		flags[key] = flag.value
	var fused: bool = false
	if tab == "lmb": fused = flags.stormBurst or flags.stormBeam or flags.slamStorm or flags.whirlDet
	elif tab == "charge": fused = flags.dimBreach # isDimBreach() at 44322 checks this key only
	elif tab == "magic":
		fused = flags.stormBurst or flags.stormBeam or flags.elemFuse
		if not fused:
			var fan := _level("fanShot", player)
			if fan.status != "READY": return fan
			if fan.value >= 1:
				var omni := _level("omniBeam", player)
				if omni.status != "READY": return omni
				fused = omni.value >= 1 and flags.sixFuse
	elif tab == "ct": fused = flags.timeStep
	var hidden: Array = absorbed.value.duplicate()
	if fused:
		for key in POPUP_HOSTS:
			if flags[key] and not hidden.has(POPUP_HOSTS[key]): hidden.append(POPUP_HOSTS[key])
	var definition: Dictionary = CATALOG.SLOT_DEFINITIONS[tab]
	var current: Variant = player.get(POPUP_FIELDS[tab], null)
	if not _slot_content(current): return _nr("unsupported_active_value", current)
	if not fused and not TRUTH.js_truthy(current): current = POPUP_DEFAULTS[tab]
	var options: Array = []
	for sid in definition.skills:
		if hidden.has(sid): continue
		var level := _level(sid, player)
		if level.status != "READY": return level
		if level.value >= 1 or (fused and FUSED_POPUP_FREE.has(sid)):
			if definition.info.has(sid): options.append({"id":sid, "active":current == sid})
	var host: Variant = null
	if fused:
		if tab == "lmb": host = "whirlwind"
		elif tab == "magic": host = "hellRay" if flags.stormBeam else "omniBeam" if flags.elemFuse or flags.sixFuse else "fireball"
		elif tab == "charge": host = "chargeBoost" if flags.dimBlast or flags.dimThunder or flags.dimSlam or flags.dimBreach else "charge"
	return _ready({"fused":fused, "current":current, "fusion_host":host, "options":options,
		"empty_locked":not fused and options.is_empty()})

static func _skill(skill_id: Variant) -> Dictionary:
	if not _id(skill_id): return _nr("unsupported_id", skill_id)
	return CATALOG.read_skill(skill_id)

static func _slot(slot_key: Variant) -> Dictionary:
	if not _id(slot_key): return _nr("unsupported_slot_key", slot_key)
	for slot in SLOTS:
		if slot.k == slot_key: return _ready(slot)
	return _nr("unknown_slot_key", slot_key)

static func _slots(slots: Variant) -> Dictionary:
	if not slots is Array or slots.size() != 6: return _nr("six_slots_unavailable", slots)
	for value in slots:
		if not _slot_content(value): return _nr("unsupported_slot_content", value)
	return _ready(true)

static func _slot_content(value: Variant) -> bool:
	return value == null or _id(value)

static func _level(skill_id: String, player: Variant) -> Dictionary:
	if not player is Dictionary: return _nr("player_unavailable", player)
	var skills: Variant = player.get("skills", null)
	if TRUTH.js_truthy(skills) and not skills is Dictionary: return _nr("unsupported_skills", skills)
	if not TRUTH.js_truthy(skills): return _ready(0) # Forge lv: P && P.skills && value || 0
	for key in skills:
		if not _id(key): return _nr("unsupported_skill_keys", skills)
	var value: Variant = skills.get(skill_id, null)
	if not TRUTH.js_truthy(value): return _ready(0)
	if not _finite(value): return _nr("unsupported_level", value)
	return _ready(value)

static func _id(value: Variant) -> bool:
	return value is String and not FUSION.PROTOTYPE_KEYS.has(value)

static func _finite(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _ready(value: Variant) -> Dictionary:
	return {"status":"READY", "value":value}

static func _nr(reason: String, input: Variant) -> Dictionary:
	return {"status":"NOT_READY", "reason":reason, "input":input}
