extends SceneTree
## PC-SKILL-WRITERS: SkillForge '일괄 레벨업'/'추천 자동' live writers on actual Main.
## Source: G3090 buttons → _skillBatchUp G47192–47233, _skillRecAuto G47299–47326.
## Every live call is compared with the SK-S05e copied ledger here and emitted as
## SK_S05_ORACLE_ROW for the original node VM oracle (tests/demo11_17_source_oracle.mjs).
const USERDIR="EXODUSER-pc-skill-writers-Isolated-20261022"
## Run with -- --demo11-storage=off: the Forge path below calls the real save hook, which must not write.
const BULK=preload("res://port_modules/skill_management_source/batch_recommend.gd")
const S=preload("res://port_modules/skill_management_source/core_support.gd")
var checks:=0
var failures:=0
var main: Node
var state: Node
var oracle_rows:=0
var scenarios: Array=[]

func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok:failures+=1;printerr("PC_SKILL_WRITERS_FAIL ",label)
func _initialize() -> void:call_deferred("run")
func snapshot() -> Dictionary:return main.read_native_skill_management()
func bits(fixture: Dictionary) -> Dictionary:
	var out: Dictionary={}
	for pair in [["sp",fixture.p.sp],["mats",fixture.g.mats]]:
		var b:=PackedByteArray();b.resize(8);b.encode_double(0,float(pair[1]));out[pair[0]]=b.hex_encode()
	return out
func emit(method: String,args: Array,fixture: Dictionary,counts: Dictionary) -> void:
	print("SK_S05_ORACLE_ROW ",JSON.stringify({"method":method,"args":args,"value":{"fixture":fixture,"counts":counts},"currency_bits":bits(fixture)},"",false));oracle_rows+=1
func xp_to(level: int) -> void:
	while int(state.read_current_p().lv)<level:
		var before: Dictionary=snapshot()
		var xp: Dictionary=state.apply_native_add_exp(main,int(before.p.maxExp))
		if not xp.get("applied",false) or int(xp.get("levels",0))<1:
			check(false,"real XP level-up to "+str(level)+" stopped at "+str(before.p.lv)+" "+str(xp.get("reason","")));return
## One button press through the public API. Returns the live result.
func press(tag: String,action: String,request_id: String="") -> Dictionary:
	var rid: String=request_id if not request_id.is_empty() else "bulk-"+tag
	var before: Dictionary=snapshot()
	var plan: Dictionary=BULK.batch_preview(before) if action=="batch" else BULK.recommend_preview(before,true)
	var result: Dictionary=main.request_skill_batch_level_up(rid) if action=="batch" else main.request_skill_recommend_auto(rid)
	var counts: Dictionary=plan.value.details if plan.status=="READY" else {}
	var row: Dictionary={"tag":tag,"action":action,"lv":before.p.lv,"sp_before":before.p.sp,"mats_before":before.g.mats,
		"committed":result.get("committed",false),"reason":result.get("reason",""),"counts":counts}
	if plan.status=="READY" and plan.value.applied:
		check(result.get("committed",false) and result.get("accepted",false),"applied plan -> live commit "+tag)
		if not result.get("committed",false):scenarios.append(row);return result
		var expected: Dictionary=plan.value.fixture.duplicate(true)
		for field in plan.value.protected_active_proposals:expected.p[field]=plan.value.protected_active_proposals[field]
		check(result.after==expected and snapshot()==expected,"live ledger == copied ledger "+tag)
		check(result.counts==counts,"counts "+tag)
		check(result.source_feedback.kind=="addTxt" and result.source_feedback.color=="#ffcc44","success feedback "+tag)
		check(result.prefix==["ledger","active_selection","slots"],"commit prefix "+tag)
		emit(action,[before] if action=="batch" else [before,true],result.after,counts)
		row["sp_after"]=result.after.p.sp;row["mats_after"]=result.after.g.mats
	else:
		check(not result.get("committed",false) and result.get("prefix",[1]).is_empty(),"rejection prefix empty "+tag)
		check(snapshot()==before,"rejection leaves exact ledger "+tag)
		if plan.status=="READY":
			check(result.reason==("nothing_to_level_up" if action=="batch" else "nothing_to_auto_build"),"zero reason "+tag)
			check(result.source_feedback.kind=="showPH" and result.source_feedback.color=="#ff8844","zero feedback "+tag)
			emit(action,[before] if action=="batch" else [before,true],before,counts)
	var diff: Dictionary={}
	var now: Dictionary=snapshot()
	for id in now.p.skills:
		if int(now.p.skills[id])!=int(before.p.skills.get(id,0)):diff[id]=[int(before.p.skills.get(id,0)),int(now.p.skills[id])]
	row["skill_changes"]=diff
	var fused: Array=[]
	for key in now.p._fused:
		if now.p._fused[key] and not before.p._fused.get(key,false):fused.append(key)
	row["fused_new"]=fused
	scenarios.append(row)
	print("PC_SKILL_WRITERS_SCENARIO ",JSON.stringify(row,"",false))
	return result

func run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated user directory")
	if not OS.get_cmdline_user_args().has("--demo11-storage=off"):
		check(false,"requires --demo11-storage=off (no save IO)");quit(1);return
	main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	for i in 12:await physics_frame
	state=main.get("source_state")
	check(main.get("world").get("ready_for_player"),"actual Main ready")
	check(main.read_native_demo_policy().get("demo")==true,"actual demo boot policy")
	var first: Dictionary=snapshot()
	check(first.p.sp==0 and first.p.lv==1,"actual new game Lv1 SP0")

	# S1: SP 0 → source zero branch (showPH), nothing written.
	var r: Dictionary=press("S1_batch_lv1_sp0","batch")
	check(not r.committed and r.reason=="nothing_to_level_up","S1 batch SP0 rejects")
	# S2: SP 0 recommend = SP 부족 partial. Only spCost0 skills can be learned (source has no SP>0 gate).
	r=press("S2_recommend_lv1_sp0_partial","recommend")
	check(r.committed and r.counts.fused==0 and r.after.p.sp==0,"S2 SP0 recommend learns only free skills, no fusion")
	for id in r.after.p.skills:
		if int(r.after.p.skills[id])>int(first.p.skills.get(id,0)):check(int(S.CATALOG.read_skill(id).value.get("spCost",0))==0,"S2 learned skill is spCost0 "+id)
	r=press("S2b_recommend_repeat_zero","recommend")
	check(not r.committed and r.reason=="nothing_to_auto_build","S2b repeat → zero branch")

	# S3: Lv49 lock=1 — every learned skill already at the level lock (최대치).
	xp_to(49)
	check(snapshot().p.sp==144,"real XP 48*3 SP")
	r=press("S3_batch_lv49_lock1","batch")
	check(not r.committed and r.reason=="nothing_to_level_up","S3 lock1 batch rejects despite SP")

	# S4: recommend Lv49 — reqLv-gated skills skipped (해금 미충족), demo-forbidden fusions skipped.
	var before4: Dictionary=snapshot()
	r=press("S4_recommend_lv49","recommend")
	check(r.committed,"S4 recommend commits")
	var after4: Dictionary=snapshot()
	for phase in S.CATALOG.RECOMMENDATIONS:
		for id in phase.get("skills",[]):
			var sk: Dictionary=S.CATALOG.read_skill(id)
			if sk.found and int(sk.value.get("reqLv",0))>int(after4.p.lv):
				check(int(after4.p.skills.get(id,0))==int(before4.p.skills.get(id,0)),"reqLv gated skill untouched "+id)
		var key: Variant=phase.get("fuse")
		if key!=null and not S.RULES.DEMO_ALLOWED.has(key):check(not after4.p._fused.get(key,false),"demo-forbidden fusion skipped "+str(key))
	# S5: repeat — learned/fused skipped; leftover SP partial or zero branch.
	r=press("S5_recommend_repeat","recommend")

	# S6: Lv52 lock=2 — fused groups (fuse cost) then singles; SP runs out (SP 부족 partial).
	xp_to(52)
	r=press("S6_batch_lv52_lock2_sp_limited","batch")
	check(r.committed and BULK.batch_preview(snapshot()).value.applied==false,"S6 stops exactly where next upgrade is unaffordable")
	r=press("S7_batch_repeat_zero","batch")
	check(not r.committed,"S7 repeat → zero branch")
	xp_to(99)
	# S8 while gameplay is paused: K/L data transactions have no G.paused guard (same as learn_up).
	paused=true
	r=press("S8_batch_lv99_lock2_paused","batch")
	check(r.committed,"S8 paused batch commits")
	paused=false
	# S9: 악의 0 — spend actual malice through the real cast-cost owner. All source upMat are 0,
	# so batch is not malice-gated (G47218–47220 _malCost(0)=0); recommend learning is (matCost).
	xp_to(100)
	var mats_now: int=int(snapshot().g.mats)
	if mats_now>0:check(state.apply_native_skill_cast_cost(main,mats_now).get("applied",false),"real malice spend to 0")
	check(int(snapshot().g.mats)==0,"malice 0")
	var before9: Dictionary=snapshot()
	r=press("S9_batch_lv100_lock3_mats0","batch")
	check(r.committed and snapshot().p.sp<before9.p.sp and snapshot().g.mats==0,"S9 lock3 batch with malice 0")
	r=press("S10_recommend_lv100_mats0","recommend")
	# S11: replay same id = same receipt, no double debit; same id other payload = conflict.
	var stable: Dictionary=snapshot()
	var replay: Dictionary=main.request_skill_batch_level_up("bulk-S9_batch_lv100_lock3_mats0")
	check(replay.get("replayed",false) and snapshot()==stable,"batch replay exactly once")
	var conflict: Dictionary=main.request_skill_recommend_auto("bulk-S9_batch_lv100_lock3_mats0")
	check(not conflict.get("accepted",true) and conflict.reason=="request_id_conflict" and snapshot()==stable,"same id other action refuses")
	# S12: skill_id must be empty for bulk actions.
	var odd: Dictionary=main.request_native_skill_management({"request_id":"bulk-odd","action":"batch","skill_id":"darkPillar","confirmed":false})
	check(not odd.accepted and odd.reason=="bulk_action_takes_no_skill_id" and snapshot()==stable,"bulk with skill id refuses")
	# S13: paused gameplay — K/L data transactions remain available (same as learn_up).
	paused=true
	r=press("S13_recommend_paused","recommend")
	paused=false
	# S14: Forge footer path — same call the Mac button makes (manage("batch","")), not the
	# disabled button itself. Proves the Mac UI only needs enabling.
	var forge: Control=main.source_inventory_ui.skill_forge
	check(forge.open_panel(),"forge opens")
	xp_to(100)
	var fb: Dictionary=snapshot()
	forge.manage("batch","")
	if forge.last.get("committed",false):check(forge.last.get("persistence",{}).get("status")=="OFF","forge save hook ran with storage OFF (no IO)")
	check(forge.last.has("committed") and (forge.last.committed or forge.last.reason=="nothing_to_level_up"),"forge manage(batch) reaches writer")
	forge.manage("recommend","")
	check(forge.last.has("committed") and (forge.last.committed or forge.last.reason=="nothing_to_auto_build"),"forge manage(recommend) reaches writer")
	forge.close_panel()

	# Fixture-only max-level rows (Lv20 needs P.lv>=950, unreachable in demo cap 100).
	var big: Dictionary=snapshot();big.p.lv=1000;big.p.sp=500.0;big.g.mats=0.0
	for id in big.p.skills:
		if int(big.p.skills[id])>=1:big.p.skills[id]=19
	var fx: Dictionary=BULK.batch_preview(big)
	check(fx.status=="READY" and fx.value.applied,"fixture Lv1000 batch applies")
	emit("batch",[big],fx.value.fixture,fx.value.details)
	var at20: Dictionary=fx.value.fixture.duplicate(true)
	var fx2: Dictionary=BULK.batch_preview(at20)
	emit("batch",[at20],fx2.value.fixture,fx2.value.details)

	main.get_parent().remove_child(main)
	check(not main.request_skill_batch_level_up("lost-owner").accepted,"lost owner refuses")
	main.free();main=null
	for i in 12:await process_frame
	print("PC_SKILL_WRITERS_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"oracle_rows":oracle_rows,"scenarios":scenarios.size()}))
	quit(1 if failures else 0)
