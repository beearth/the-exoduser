extends RefCounted
## SK-S05c: readonly source ledger projection, no actual fuse commit authority.
const S = preload("res://port_modules/skill_management_source/core_support.gd")
const AUTO_HOSTS := {"whirlDet":"whirlwind","slamStorm":"whirlwind","stormBeam":"whirlwind","stormBurst":"whirlwind","dimBreach":"chargeBoost","dimSlam":"chargeBoost","dimThunder":"chargeBoost","dimBlast":"chargeBoost","sixFuse":"fanShot","elemFuse":"omniBeam","bladeFuse":"maliceHunt","plagueFuse":"maliceHunt","plagueVenom":"maliceHunt","iceMortar":"maliceMortar","boneStorm":"maliceStorm","elecRepent":"maliceStorm","shieldFuse":"maliceSwipe","pillarSlam":"giantSlam2","pillarSpike":"darkPillar","holyFuse":"holyDome","holyIce":"holyDome","siegeGhost":"ghostXbowTurret","dualScarecrow":"voidScarecrow","thunderGhost":"bladeDash","timeStep":"timeWarp","infernoSlam":"giantSlam2"}

static func preview(key: Variant, fixture: Variant, mode: String = "guarded", demo: bool = false) -> Dictionary:
	var checked := S.prepare(fixture)
	if checked.status != "READY": return checked
	if not S.supported_id(key): return S.nr("unsupported_id")
	if not mode in ["guarded","direct"]: return S.nr("unsupported_fuse_mode")
	var f: Dictionary = checked.value
	if mode == "guarded" and not S.RULES.can_fuse(key,f.p,demo).value: return S.finish(fixture,f,false,"caller_gate")
	var ok := _apply_shadow(key,f)
	return S.finish(fixture,f,ok,"fused" if ok else "resources")

static func _apply_shadow(key: String, f: Dictionary) -> bool:
	var ids := S.members(key)
	var cost := S.star(key) * 3
	if f.p.sp < cost: return false
	if not f.p.get("_fused"): f.p["_fused"] = {}
	f.p.sp -= cost # Before any refunds, even if a refund could have paid this cost.
	var refund_sp := 0
	var refund_mat := 0
	for id in ids:
		var sk: Dictionary = S.CATALOG.read_skill(id)
		if not sk.found: continue
		if not S.lv(f.p,id): f.p.skills[id] = 1
		var level := S.lv(f.p,id)
		if level > 1:
			refund_sp += S.spent(sk.value,level) - sk.value.get("spCost",0)
			refund_mat += (level - 1) * S.mal_cost(sk.value.get("upMat",0))
			f.p.skills[id] = 1
	if refund_sp > 0: f.p.sp += refund_sp
	if refund_mat > 0: f.g.mats += refund_mat
	f.p._fused[key] = true
	if key in ["whirlDet","slamStorm","stormBeam"]: f.p["activeLMBSk"] = "whirlwind"
	if key == "stormBeam":
		if not S.lv(f.p,"peaceShield"): f.p.skills["peaceShield"] = 1
		if not S.lv(f.p,"hellRay"): f.p.skills["hellRay"] = 1
		f.p["activeMagicSk"] = "hellRay"
	var absorbed: Array = S.RULES.get_absorbed(key).value
	S.clear_slots(f,absorbed)
	var host: Variant = AUTO_HOSTS.get(key)
	if host != null and S.lv(f.p,host) >= 1 and not f.slots.has(host):
		var index: int = S.SLOTS.find_auto(host,f.slots).value
		if index >= 0: f.slots[index] = host
	S.sync_active_projection(f.p,absorbed)
	return true
