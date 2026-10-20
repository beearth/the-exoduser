extends RefCounted
## SK-S05e: deterministic copied batch/recommend ledgers, never live writers.
const S = preload("res://port_modules/skill_management_source/core_support.gd")
const LEARN = preload("res://port_modules/skill_management_source/learn.gd")
const FUSE = preload("res://port_modules/skill_management_source/fuse_commit.gd")

static func batch_preview(fixture: Variant) -> Dictionary:
	var checked := S.prepare(fixture)
	if checked.status != "READY": return checked
	var f: Dictionary = checked.value
	var lock := S.lock_level(f.p)
	var total := 0
	var fused_keys: Array = []
	var ranks: Dictionary = {}
	for key in S.PAIRS.FUSE_PAIRS:
		if S.flag(f.p,key):
			ranks[key] = fused_keys.size()
			fused_keys.append(key)
	# JS Array.sort is stable; Godot sort_custom is not, so tie rank is explicit.
	fused_keys.sort_custom(func(a,b):
		var na := S.members(a).size()
		var nb := S.members(b).size()
		return na > nb if na != nb else ranks[a] < ranks[b])
	var claimed: Dictionary = {}
	for key in fused_keys:
		var ids := S.members(key)
		if ids.all(func(id): return claimed.has(id)): continue
		for id in ids: claimed[id] = true
		var level := S.min_level(f.p,ids)
		while level < 20 and level < lock:
			var cost := S.fuse_cost(level,ids.size())
			if f.p.sp < cost: break
			for id in ids: f.p.skills[id] = maxi(S.lv(f.p,id,1),level + 1)
			f.p.sp -= cost
			level += 1
			total += 1
	for sk in S.CATALOG.SKILLS:
		if not sk.get("up",false) or claimed.has(sk.id): continue
		var level := S.lv(f.p,sk.id)
		if level < 1: continue
		while level < 20 and level < lock:
			var cost := S.up_cost(level)
			var material := S.mal_cost(sk.get("upMat",0))
			if f.p.sp < cost or f.g.mats < material: break
			f.p.skills[sk.id] += 1
			f.p.sp -= cost
			f.g.mats -= material
			level += 1
			total += 1
	return S.finish(fixture,f,total > 0,"batch",{"upgrades":total})

static func recommend_preview(fixture: Variant, demo: bool = false) -> Dictionary:
	var checked := S.prepare(fixture)
	if checked.status != "READY": return checked
	var f: Dictionary = checked.value
	var learned := 0
	var fused := 0
	for phase in S.CATALOG.RECOMMENDATIONS:
		var ids: Array = phase.get("skills",[])
		if phase.get("pick",false):
			if not ids.any(func(id): return S.lv(f.p,id) >= 1) and not ids.is_empty():
				var sk: Dictionary = S.CATALOG.read_skill(ids[0])
				if sk.found and sk.value.get("reqLv",0) <= f.p.lv and LEARN._apply_shadow(sk.value,f): learned += 1
			continue
		for id in ids:
			if S.lv(f.p,id) >= 1: continue
			var sk: Dictionary = S.CATALOG.read_skill(id)
			if not sk.found or sk.value.get("reqLv",0) > f.p.lv: continue
			if LEARN._apply_shadow(sk.value,f): learned += 1
		var key: Variant = phase.get("fuse")
		if key != null and S.RULES.can_fuse(key,f.p,demo).value:
			if FUSE._apply_shadow(key,f): fused += 1
	return S.finish(fixture,f,learned > 0 or fused > 0,"recommend",{"learned":learned,"fused":fused})
