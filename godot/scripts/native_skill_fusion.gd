extends RefCounted
## DEMO11-18: demo-only selection/ledger policy. Damage/shield execution stays HOLD.
const S=preload("res://port_modules/skill_management_source/core_support.gd")
const FUSE=preload("res://port_modules/skill_management_source/fuse_commit.gd")

static func inspect(key: Variant, fixture: Dictionary) -> Dictionary:
	var prepared: Dictionary=S.prepare(fixture)
	if prepared.status!="READY": return prepared
	if not S.supported_id(key) or not S.PAIRS.FUSE_PAIRS.has(key):return S.nr("unknown_fusion")
	var gate: Dictionary=S.RULES.can_fuse(key,fixture.p,true)
	if gate.status!="READY": return gate
	var stars: Dictionary={}
	for member in S.members(key):
		stars[member]={"innate":S.RULES.innate_star(member),"fused":S.RULES.fused_star(member,fixture.p),"display":S.RULES.display_star(member,fixture.p)}
	var protected: bool=key=="shieldFuse"
	return S.ready({"key":key,"members":S.members(key),"star":S.star(key),"creation_cost_sp":S.star(key)*3,
		"demo_allowed":S.RULES.DEMO_ALLOWED.has(key),"rule_allowed":gate.value,"rule_reason":gate.get("branch",""),
		"can_commit":gate.value and fixture.p.sp>=S.star(key)*3 and not protected,
		"absorbed":S.RULES.get_absorbed(key).value,"all_absorbed":S.RULES.get_all_absorbed(fixture.p).value,
		"member_stars":stars,"names":S.RULES.fusion_names(key).value,
		"combat_callsite":{"key":key,"status":"HOLD","damage_execution":false,"shield_execution":false,"protected_shield":protected}})

static func preview(key: Variant, fixture: Dictionary) -> Dictionary:
	var model: Dictionary=inspect(key,fixture)
	if model.status!="READY":return model
	if key=="shieldFuse":return S.nr("HOLD_protected_shieldFuse_commit")
	# Always guarded + demo=true. Caller cannot select full/direct/forge-lab mode.
	if not model.value.rule_allowed:return S.finish(fixture,S.prepare(fixture).value,false,model.value.rule_reason)
	return FUSE.preview(key,fixture,"guarded",true)
