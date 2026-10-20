extends RefCounted
## SK-S05d: copied ledger only. Base shieldFuse reset remains an explicit HOLD.
const S = preload("res://port_modules/skill_management_source/core_support.gd")

static func minus_preview(skill_id: Variant, fixture: Variant) -> Dictionary:
	var checked := S.prepare(fixture)
	if checked.status != "READY": return checked
	var sk := S.definition(skill_id)
	if sk.status != "READY": return sk
	var f: Dictionary = checked.value
	var level := S.lv(f.p,skill_id)
	if level <= 1: return S.finish(fixture,f,false,"level_one_retained")
	var best: Variant = null
	var count := 0
	# Source minus uses actual P._fused insertion order, not registry order.
	for key in f.p.get("_fused", {}):
		var ids := S.members(key)
		if S.flag(f.p,key) and ids.has(skill_id) and ids.size() > count:
			best = key
			count = ids.size()
	if best != null:
		var ids := S.members(best)
		var minimum := S.min_level(f.p,ids)
		if minimum <= 1: return S.finish(fixture,f,false,"fused_level_one_retained")
		var refund := S.fuse_cost(minimum - 1,S.star(best))
		for id in ids:
			if S.lv(f.p,id,1) >= minimum: f.p.skills[id] = minimum - 1
		f.p.sp += refund
		return S.finish(fixture,f,true,"fusion_minus",{"key":best,"refund_sp":refund})
	f.p.skills[skill_id] = level - 1
	var refund := S.up_cost(level - 1)
	f.p.sp += refund
	f.g.mats += S.mal_cost(sk.value.get("upMat",0))
	return S.finish(fixture,f,true,"single_minus",{"refund_sp":refund})

static func reset_preview(skill_id: Variant, fixture: Variant, confirmed: bool) -> Dictionary:
	var checked := S.prepare(fixture)
	if checked.status != "READY": return checked
	var sk := S.definition(skill_id)
	if sk.status != "READY": return sk
	var f: Dictionary = checked.value
	var best: Variant = null
	var count := 0
	# Reset uses original GEM registry order, which differs from actual flag insertion.
	for key in S.CATALOG.GEM_METADATA:
		var ids := S.members(key)
		if ids.has(skill_id) and S.flag(f.p,key) and ids.size() > count:
			best = key
			count = ids.size()
	if best == "shieldFuse": return S.nr("HOLD_protected_base_shieldFuse_reset")
	var total := 0
	var reset_ids: Array = []
	var reset_keys: Array = []
	if best != null:
		reset_ids = S.members(best)
		for id in reset_ids:
			var def: Dictionary = S.CATALOG.read_skill(id)
			if def.found: total += def.value.get("spCost",0)
		for key in f.p.get("_fused",{}):
			if not S.flag(f.p,key): continue
			var ids := S.members(key)
			if not ids.any(func(id): return reset_ids.has(id)): continue
			reset_keys.append(key)
			var star := S.star(key)
			total += star * 3
			for level in range(1,S.min_level(f.p,ids)): total += S.fuse_cost(level,star)
		if not confirmed: return S.finish(fixture,f,false,"cancel",{"refund_sp":total,"key":best,"keys":reset_keys})
		for id in reset_ids: f.p.skills[id] = 0
		S.clear_slots(f,reset_ids)
		f.p.sp += total
		for key in reset_keys: f.p._fused.erase(key)
	else:
		var level := S.lv(f.p,skill_id)
		var free: bool = skill_id in ["spikeTrap","kiSlash","fireball"]
		total = S.spent(sk.value,level) - (S.spent(sk.value,1) if free else 0)
		if total <= 0 and free: return S.finish(fixture,f,false,"free_base_retained")
		if not confirmed: return S.finish(fixture,f,false,"cancel",{"refund_sp":total})
		f.p.skills[skill_id] = 1 if free else 0
		f.p.sp += total
		var key: Variant = S.RULES.get_fuse_key(skill_id,f.p).value
		if key != null and S.flag(f.p,key): f.p._fused.erase(key)
		reset_ids = [skill_id]
		S.clear_slots(f,reset_ids)
	# Source normal reset refunds no G.mats (including paid acquisition/upgrades).
	S.sync_active_projection(f.p,reset_ids)
	return S.finish(fixture,f,true,"fusion_reset" if best != null else "single_reset",{"refund_sp":total,"key":best,"keys":reset_keys})
