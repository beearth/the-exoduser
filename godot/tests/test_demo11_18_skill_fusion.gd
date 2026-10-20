extends SceneTree
const USERDIR="EXODUSER-demo11-18-Isolated-20261021"
const S=preload("res://port_modules/skill_management_source/core_support.gd")
const FUSE=preload("res://port_modules/skill_management_source/fuse_commit.gd")
const REFUND=preload("res://port_modules/skill_management_source/refund.gd")
var checks:=0
var failures:=0
var main: Node
var state: Node
var serial:=0
var oracle_rows:=0
var actual_commits:=0
var denied:=0
class Sink extends Node:
	var calls:=0
	func deliver(_receipt: Dictionary) -> Dictionary:
		calls+=1
		return {"accepted":false,"reason":"fixture_post_commit_refusal"}
func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok:failures+=1;printerr("DEMO11_18_FAIL ",label)
func _initialize() -> void:call_deferred("run")
func id() -> String:
	serial+=1
	return "fusion-"+str(serial)
func snap() -> Dictionary:return main.read_native_skill_management()
func shadow(plan: Dictionary) -> Dictionary:
	var f: Dictionary=plan.value.fixture.duplicate(true)
	for field in plan.value.protected_active_proposals:f.p[field]=plan.value.protected_active_proposals[field]
	return f
func oracle(method: String,args: Array,result: Dictionary) -> void:
	var bits: Dictionary={}
	for pair in [["sp",result.after.p.sp],["mats",result.after.g.mats]]:
		var b:=PackedByteArray();b.resize(8);b.encode_double(0,float(pair[1]));bits[pair[0]]=b.hex_encode()
	print("SK_S05_ORACLE_ROW ",JSON.stringify({"method":method,"args":args,"value":{"fixture":result.after},"currency_bits":bits},"",false));oracle_rows+=1
func fuse(key: String,request_id: String="") -> Dictionary:
	var before: Dictionary=snap()
	var plan: Dictionary=FUSE.preview(key,before,"guarded",true)
	var result: Dictionary=main.request_native_skill_fusion(id() if request_id.is_empty() else request_id,key)
	if S.RULES.DEMO_ALLOWED.has(key) and key!="shieldFuse" and plan.status=="READY" and plan.value.applied:
		check(result.get("committed",false),"live fuse commits "+key)
		if not result.get("committed",false):return result
		check(result.after==shadow(plan),"exact policy+active ledger "+key)
		check(result.fusion_combat_handoff.status=="HOLD" and not result.fusion_combat_handoff.damage_execution and not result.fusion_combat_handoff.shield_execution,"combat remains callsite-only "+key)
		oracle("fuse",[key,before,"guarded",true],result);actual_commits+=1
	else:
		check(not result.get("committed",false) and result.prefix.is_empty(),"blocked fuse prefix empty "+key)
		check(snap()==before,"blocked fuse no debit or flags "+key);denied+=1
	return result
func undo(host: String,confirmed: bool) -> Dictionary:
	var before: Dictionary=snap()
	var plan: Dictionary=REFUND.reset_preview(host,before,confirmed)
	var result: Dictionary=main.request_native_skill_fusion_undo(id(),host,confirmed)
	if plan.status=="READY" and plan.value.applied:
		check(result.get("committed",false) and result.after==shadow(plan),"undo exact original reset "+host)
		if result.get("committed",false):oracle("reset",[host,before,confirmed],result)
	else:check(not result.get("committed",false) and snap()==before,"cancel/HOLD no change "+host)
	return result
func fixture(key: String,funds: int) -> void:
	# Declared test-only starting ledgers on this isolated actual Main. No actor,
	# combat owner, physics or source policy is stubbed/replaced.
	var p: Dictionary=state.read_current_p()
	p.lv=100;p.sp=funds
	p.skills.clear()
	for sk in S.CATALOG.SKILLS:p.skills[sk.id]=1
	for member in S.members(key):p.skills[member]=3
	p._fused.clear();p._fused["shieldFuse"]=true
	p.skillSlots.assign([null,null,null,null,null,null]);p.ultSlot=null
	var absorbed: Array=S.RULES.get_absorbed(key).value
	for i in mini(6,absorbed.size()):p.skillSlots[i]=absorbed[i]
	for field in S.ACTIVE_FIELDS:p[field]=null
	p.activeLMBSk="kiSlash";p.activeRMBSk="maliceSwipe";p.activeCtSk="iceOrb";p.activeMagicSk="fireball";p.activeQSk="parry";p.activeChargeSk="charge"
	state.read_current_g().mats=1000
func run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated directory")
	main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	for i in 12:await physics_frame
	state=main.source_state
	check(main.read_native_demo_policy().demo and main.read_native_demo_policy().build_target=="demo","actual immutable demo boot policy")
	# Natural acquisition first: six real level-ups produce18 SP; learn10 then
	# iceMortar's2star*3 consumes6. No ledger fixture used for this path.
	for i in 6:
		var p: Dictionary=state.read_current_p().duplicate(true)
		check(state.apply_native_add_exp(main,int(p.maxExp)).applied,"natural XP grant")
	check(state.read_current_p().sp==18,"natural SP18")
	check(main.request_native_skill_management({"request_id":"natural-learn","action":"learn_up","skill_id":"maliceMortar"}).committed,"natural component learn")
	var model: Dictionary=main.read_native_skill_fusion("iceMortar")
	check(model.status=="READY" and model.value.star==2 and model.value.can_commit,"live star/allowed model")
	var natural: Dictionary=fuse("iceMortar","natural-fuse")
	check(natural.get("committed",false) and state.read_current_p().sp==2,"natural fuse exact cost6")
	check(not snap().slots.has("iceOrb") and state.read_current_p().activeCtSk=="ghostWalk","absorbed CT sync uses source default")
	var stable: Dictionary=snap()
	check(main.request_native_skill_fusion("natural-fuse","iceMortar").get("replayed",false) and snap()==stable,"fuse retry no double cost")
	undo("maliceMortar",false);undo("maliceMortar",true)
	check(not state.read_current_p()._fused.has("iceMortar") and state.read_current_p().sp==28,"source reset26 refund including source acquisition, no invented spent-history cap")
	# Every registry key: enough learned members/SP to distinguish the demo ban
	# from missing-members/resource failures; nonprotected allowed ones then commit.
	for key: String in S.PAIRS.FUSE_PAIRS:
		fixture(key,1000)
		model=main.read_native_skill_fusion(key)
		check(model.status=="READY" and model.value.star==S.star(key),"current stars "+key+" reason="+str(model.get("reason","")))
		if model.status!="READY":continue
		check(model.value.demo_allowed==S.RULES.DEMO_ALLOWED.has(key),"demo source whitelist "+key)
		if key=="siegeGhost":check(model.value.star==3 and model.value.members.size()==2,"star3 override differs from member count2")
		if key=="shieldFuse":
			state.read_current_p()._fused["shieldFuse"]=false
			var held: Dictionary=fuse(key)
			check(held.reason=="HOLD_protected_shieldFuse_commit","shield commit HOLD even without base flag")
		elif model.value.demo_allowed:
			var cost: int=S.star(key)*3
			state.read_current_p().sp=cost-1
			var req: String=id();fuse(key,req) # refund cannot pay initial cost
			state.read_current_p().sp=cost
			var done: Dictionary=fuse(key,req)
			check(done.get("committed",false),"resource retry same id after correction "+key)
			if done.get("committed",false):
				for absorbed in S.RULES.get_absorbed(key).value:check(not snap().slots.has(absorbed) and snap().ultimate!=absorbed,"absorbed numeric/ULT cleared "+key+":"+absorbed)
				var current: Dictionary=main.read_native_skill_fusion(key)
				for member in S.members(key):check(current.value.member_stars[member].fused.value>=S.star(key),"actual current fused-star provider "+key+":"+member)
				fuse(key) # already fused, not another debit
		else:
			var banned: Dictionary=fuse(key)
			check(banned.reason=="demo_forbidden","explicit _DEMO_MODE deny "+key)
	fixture("holyIce",100)
	state.read_current_p()._fused["holyFuse"]=true;state.read_current_p()._fused["holyIce"]=true
	var overlap: Dictionary=undo("holyDome",true)
	check(overlap.get("committed",false) and not state.read_current_p()._fused.has("holyFuse") and not state.read_current_p()._fused.has("holyIce"),"highest-group undo clears overlapping active groups")
	fixture("iceMortar",100)
	stable=snap()
	var bypass: Dictionary=main.request_native_skill_management({"request_id":id(),"action":"fuse","skill_id":"stormBeam","demo":false,"mode":"direct"})
	check(not bypass.committed and snap()==stable,"caller cannot override demo/guarded mode")
	fuse("unknown_fusion")
	var foreign:=Node.new();root.add_child(foreign)
	check(state.read_native_skill_fusion(foreign,"iceMortar").status=="NOT_READY","foreign readonly owner rejected");foreign.free()
	undo("maliceSwipe",true)
	var sink:=Sink.new();main.add_child(sink)
	check(main.bind_native_skill_management_handoff(Callable(sink,"deliver")),"post-commit failure seam")
	paused=true
	var prefix: Dictionary=fuse("iceMortar","prefix")
	paused=false
	check(prefix.get("committed",false) and not prefix.accepted and prefix.status=="COMMITTED_HANDOFF_FAILED","paused fusion retains failed handoff prefix")
	stable=snap()
	check(main.request_native_skill_fusion("prefix","iceMortar").get("replayed",false) and sink.calls==1 and snap()==stable,"failed handoff retry once")
	model=main.read_native_skill_fusion("iceMortar");model.value.member_stars.clear();model.value.absorbed.clear()
	check(not main.read_native_skill_fusion("iceMortar").value.member_stars.is_empty(),"readonly model detached")
	main.get_parent().remove_child(main);main.free()
	for i in 12:await process_frame
	print("DEMO11_18_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skip":0,"oracle_rows":oracle_rows,"live_fuse_commits":actual_commits,"denied_cases":denied,"UI_layout":false,"damage_execution":false,"shield_execution":false}))
	quit(1 if failures else 0)
