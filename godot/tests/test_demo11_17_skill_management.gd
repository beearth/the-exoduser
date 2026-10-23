extends SceneTree
const USERDIR="EXODUSER-demo11-17-Isolated-20261021-SWEEP-B2-20261023-01"
const LEARN=preload("res://port_modules/skill_management_source/learn.gd")
const UP=preload("res://port_modules/skill_management_source/upgrade.gd")
const REFUND=preload("res://port_modules/skill_management_source/refund.gd")
var checks:=0
var failures:=0
var main: Node
var state: Node
var oracle_rows:=0

class Handoff extends Node:
	var main: Node
	var fail:=false
	var calls:=0
	var nested: Dictionary={}
	var xp: Dictionary={}
	func deliver(receipt: Dictionary) -> Dictionary:
		calls+=1
		if fail:
			nested=main.request_native_skill_management({"request_id":"nested","action":"learn_up","skill_id":"iceStorm"})
			var p: Dictionary=main.source_state.read_current_p()
			xp=main.source_state.apply_native_add_exp(main,int(p.maxExp))
			receipt.after.p.sp=-999 # detached observer data, never the live P
			return {"accepted":false}
		return {"accepted":true,"ui_layout_executed":false,"save_committed":false}

func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok:failures+=1;printerr("DEMO11_17_FAIL ",label)
func _initialize() -> void:call_deferred("run")
func command(id: String,action: String,skill: String,confirmed: bool=false) -> Dictionary:
	return {"request_id":id,"action":action,"skill_id":skill,"confirmed":confirmed}
func snapshot() -> Dictionary:return main.read_native_skill_management()
func request(id: String,action: String,skill: String,confirmed: bool=false) -> Dictionary:
	var before: Dictionary=snapshot()
	var method: String="learn" if int(before.p.skills.get(skill,0))<1 else "upgrade"
	var plan: Dictionary
	match action:
		"learn_up":plan=LEARN.preview(skill,before,"ui") if method=="learn" else UP.preview(skill,before,"ui")
		"minus":method="minus";plan=REFUND.minus_preview(skill,before)
		"reset":method="reset";plan=REFUND.reset_preview(skill,before,confirmed)
	var result: Dictionary=main.request_native_skill_management(command(id,action,skill,confirmed))
	if plan.status=="READY" and plan.value.applied:
		check(result.get("committed",false),"policy accepted -> live commit "+id)
		if not result.get("committed",false):return result
		var expected: Dictionary=plan.value.fixture.duplicate(true)
		for field in plan.value.protected_active_proposals:expected.p[field]=plan.value.protected_active_proposals[field]
		check(result.get("after")==expected,"full policy ledger/active projection "+id)
		var args: Array=[skill,before,confirmed] if method=="reset" else [skill,before,"ui"] if method in ["learn","upgrade"] else [skill,before]
		var bits: Dictionary={}
		for pair in [["sp",expected.p.sp],["mats",expected.g.mats]]:
			var b:=PackedByteArray();b.resize(8);b.encode_double(0,float(pair[1]));bits[pair[0]]=b.hex_encode()
		print("SK_S05_ORACLE_ROW ",JSON.stringify({"method":method,"args":args,"value":{"fixture":result.after},"currency_bits":bits},"",false));oracle_rows+=1
	else:
		check(not result.get("committed",false) and result.prefix.is_empty(),"rejection prefix empty "+id)
		check(snapshot()==before,"rejection leaves exact ledger "+id)
	return result
func run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated user directory")
	main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	for i in 12:await physics_frame
	state=main.get("source_state")
	check(main.get("world").get("ready_for_player"),"actual Main ready")
	var first: Dictionary=snapshot()
	check(first.p.sp==0,"actual new game SP0")
	var rejected: Dictionary=request("after-xp","learn_up","darkPillar")
	check(not rejected.accepted,"SP shortage rejects before cost")
	var levelling:=0
	while int(state.read_current_p().lv)<50:
		var before: Dictionary=snapshot()
		var xp: Dictionary=state.apply_native_add_exp(main,int(before.p.maxExp))
		check(xp.applied and xp.levels==1 and xp.sp==before.p.sp+3,"XP +3 precedes learning lv"+str(before.p.lv))
		levelling+=1
	check(levelling==49 and snapshot().p.sp==147,"real XP grants 49*3 SP, no fixture injection")
	var learned: Dictionary=request("after-xp","learn_up","darkPillar")
	check(learned.accepted and learned.after.p.skills.darkPillar==1,"same rejected id can commit after XP")
	check(learned.before.p.sp-learned.after.p.sp==10 and learned.before.g.mats-learned.after.g.mats==50,"source learn SP10/malice50")
	check(snapshot().slots[1]=="darkPillar","source empty numeric slot auto assign")
	var stable: Dictionary=snapshot()
	var replay: Dictionary=main.request_native_skill_management(command("after-xp","learn_up","darkPillar"))
	check(replay.get("replayed",false) and replay.serial==learned.serial and snapshot()==stable,"retry exactly once")
	var conflict: Dictionary=main.request_native_skill_management(command("after-xp","learn_up","iceStorm"))
	check(not conflict.accepted and snapshot()==stable,"same id different payload refuses")
	request("up","learn_up","darkPillar")
	request("locked","learn_up","darkPillar")
	request("down","minus","darkPillar")
	request("cancel-reset","reset","darkPillar",false)
	var before_reset: Dictionary=snapshot()
	request("reset","reset","darkPillar",true)
	check(snapshot().p.skills.darkPillar==0 and snapshot().g.mats==before_reset.g.mats and not snapshot().slots.has("darkPillar"),"reset clears slot and refunds SP only")
	# K/L data transactions remain available while gameplay is paused.
	paused=true
	var paused_learn: Dictionary=request("paused-learn","learn_up","darkPillar")
	check(paused_learn.accepted,"paused K/L transaction allowed")
	if paused_learn.get("committed",false):request("paused-reset","reset","darkPillar",true)
	paused=false

	# PARITY-UI-03: web Forge slot writer must preserve the live ledger/resources.
	var forge_before: Dictionary=snapshot()
	var live_p: Dictionary=state.read_current_p()
	var hp_before: float=main.player.hp
	var fixed_id: String=str(live_p.activeLMBSk)
	var forge_receipt: Dictionary=state.commit_native_skill_forge_slot(main,"LMB",fixed_id)
	check(forge_receipt.get("committed",false) and snapshot()==forge_before,"Forge fixed selection exact no-op")
	check(main.player.hp==hp_before,"Forge selection no HP writer")
	check(not state.commit_native_skill_forge_slot(main,"1","unknown_skill").get("committed",false) and snapshot()==forge_before,"Forge invalid skill no prefix")
	check(not state.commit_native_skill_forge_slot(main,"invalid",fixed_id).get("committed",false) and snapshot()==forge_before,"Forge invalid slot no prefix")
	var foreign_forge:=Node.new();root.add_child(foreign_forge)
	check(not state.commit_native_skill_forge_slot(foreign_forge,"LMB",fixed_id).get("committed",false) and snapshot()==forge_before,"Forge foreign owner no prefix")
	foreign_forge.free()
	request("free-base","reset","spikeTrap",true)
	request("base-hold","reset","maliceSwipe",true)
	request("unknown","learn_up","unknown_skill")
	var borrowed: Dictionary=snapshot();borrowed.p.sp=-123;borrowed.p.skills.clear();borrowed.slots.clear()
	check(snapshot().p.sp>=0 and not snapshot().p.skills.is_empty() and snapshot().slots.size()==6,"readback detached")
	var foreign:=Node.new();root.add_child(foreign)
	stable=snapshot();check(not state.commit_native_skill_management(foreign,command("foreign","learn_up","darkPillar")).accepted and snapshot()==stable,"foreign owner no prefix");foreign.free()
	var forged: Dictionary=command("forged","learn_up","darkPillar");forged["patch"]={"sp":999999}
	check(not main.request_native_skill_management(forged).accepted and snapshot()==stable,"applicable patch rejected")
	var sink:=Handoff.new();sink.main=main;main.add_child(sink)
	check(main.bind_native_skill_management_handoff(Callable(sink,"deliver")),"actual descendant handoff bound")
	sink.fail=true
	var prefix: Dictionary=request("prefix-failure","learn_up","maliceMortar")
	check(not prefix.accepted and prefix.committed and prefix.status=="COMMITTED_HANDOFF_FAILED" and prefix.prefix==["ledger","active_selection","slots"],"one transaction retains failure prefix")
	check(not sink.nested.accepted and not sink.nested.committed and sink.nested.reason=="skill_transaction_in_progress","reentrant request fails before ledger")
	check(sink.xp.applied and snapshot().p.sp==prefix.after.p.sp+3 and snapshot().p.lv==prefix.after.p.lv+1,"XP after commit survives failed handoff")
	check(prefix.after.p.sp>=0 and snapshot().p.skills.maliceMortar==1,"observer mutation detached; committed skill remains")
	stable=snapshot();var calls: int=sink.calls
	replay=main.request_native_skill_management(command("prefix-failure","learn_up","maliceMortar"))
	check(replay.get("replayed",false) and not replay.accepted and replay.committed and sink.calls==calls and snapshot()==stable,"failed prefix replay does not debit/notify/grant XP twice")
	sink.fail=false
	request("next-after-failure","learn_up","maliceMortar")
	check(snapshot().p.skills.maliceMortar==2,"subsequent transaction succeeds")
	main.get_parent().remove_child(main)
	check(not main.request_native_skill_management(command("prefix-failure","learn_up","maliceMortar")).accepted,"cached replay cannot bypass lost live owner")
	main.free();main=null
	for i in 12:await process_frame
	print("DEMO11_17_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skip":0,"oracle_rows":oracle_rows,"real_xp_levelups":50,"UI_layout":false,"save_IO":false}))
	quit(1 if failures else 0)
