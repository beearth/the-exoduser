extends SceneTree
const Main = preload("res://scripts/main.gd")
const Session = preload("res://port_modules/save_adapter/demo_load_session.gd")
const USERDIR := "EXODUSER-demo11-06c-Isolated-20261021"
class Clock extends RefCounted:
	var ms: float=0
	func read() -> Dictionary: return {"ready":true,"ms":ms}
var checks := 0
var failures := 0
func _initialize() -> void: call_deferred("_run")
func isolation_name() -> String: return USERDIR
func check(ok: bool, label: String) -> void:
	checks+=1
	if not ok: failures+=1; printerr("DEMO11_06C_FAIL ",label)
func boot() -> Node:
	var main := Main.new()
	main.set_meta("demo11_storage",true)
	root.add_child(main)
	return main
func finish() -> void:
	print("DEMO11_06C_RESULT "+JSON.stringify({"checks":checks,"failures":failures,"actual_main":true,"pc_interfaces_connected":true,"userdir":OS.get_user_data_dir()}))
	quit(0 if failures==0 else 1)
func decode_oracle(value: Variant) -> Variant:
	if value is Dictionary:
		if value.size()==1 and value.has("@f64"): return str(value["@f64"]).hex_decode().to_float64_array()[0]
		var result := {}
		for k in value: result[k]=decode_oracle(value[k])
		return result
	if value is Array:
		var result := []
		for item in value: result.append(decode_oracle(item))
		return result
	return value
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=isolation_name() or not OS.get_user_data_dir().ends_with(isolation_name()): quit(2); return
	if OS.get_cmdline_user_args().has("--restart-only"):
		var loaded := boot()
		var result: Dictionary=loaded.read_native_demo11_load_result()
		check(result.get("status")=="LOADED" and result.get("start_authorized")==true and result.get("committed")==true,"separate process real loaded actor:"+JSON.stringify(result))
		if result.get("committed")==true:
			check(loaded.source_state.read_current_p().lv==12,"restart XP/level")
			check(loaded.player.hp==loaded.player.max_hp and loaded.player.stamina==loaded.player.max_stamina,"restart initStage HP/ST refill")
			check(loaded.source_resources.read_current_resource_parameters().values.mp==loaded.source_resources.read_current_resource_parameters().values.mmp,"restart initStage MP refill")
			check(loaded.source_state.read_current_inventory().bag.size()==11,"restart bag no fresh append")
			check(loaded.player.process_mode==Node.PROCESS_MODE_PAUSABLE and loaded.is_physics_processing() and loaded.source_state.read_current_g().on,"restart actual loaded start")
		loaded.free(); finish(); return
	for name in ["demo_local_storage","demo_shared_local_storage"]:
		var path := OS.get_user_data_dir().path_join(name)
		if DirAccess.dir_exists_absolute(path):
			check(DirAccess.rename_absolute(path,path+"-preserved-"+str(Time.get_ticks_usec()))==OK,"preserve previous isolated evidence")
	var fresh := boot()
	check(fresh.read_native_demo11_load_result().get("status")=="FRESH","real Main fresh path")
	if not is_instance_valid(fresh.source_state) or not fresh.source_state.is_native_new_run_state_ready():
		fresh.free(); finish(); return
	var p: Dictionary=fresh.source_state.read_current_p()
	p.lv=12; p.exp=27; p.maxExp=91; p.sp=8; p.ap=4
	p._transLvDate="2026-10-21"; p._transLvCount=2; p._goddessGift=["proof"]
	p.skills.spikeTrap=3; p.skills.holyDome=2; p._skProf={"spikeTrap":120}
	p.skillSlots=["spikeTrap",null,null,null,"giantSlam","holyDome"]
	fresh.player.hp=87; fresh.player.stamina=42
	var mana: Dictionary=fresh.source_resources.get("_owned"); mana.mp=31
	var inv: Dictionary=fresh.source_state.read_current_inventory()
	check(inv.bag.size()==10,"fresh bag original count")
	inv.bag.append({"slot":"boots","rarity":0,"name":"native test","uniqueArt":"keep","custom":{"unknown":17}})
	fresh.source_state.read_current_g().mats=218
	var stash: Dictionary=fresh.source_state.get("_demo11_storage"); stash["0"]=[{"slot":"boots","custom":{"shared":true}}]
	var saved: Dictionary=fresh.save_native_demo11_current()
	check(saved.get("committed")==true,"collector to real atomic file")
	var store: RefCounted=fresh.get("_demo11_session").store
	var bytes: Dictionary=store.get_item("hellsave_demo")
	check(bytes.get("found")==true,"actual game save exists")
	if not bytes.get("found",false): fresh.free(); finish(); return
	var original: String=bytes.raw
	var payload: Dictionary=store.read_json("hellsave_demo").value
	check(payload.player.lv==12 and payload.player.exp==27 and payload.player.sp==8 and payload.player.ap==4,"collector XP/SP/AP")
	check(payload.skills.spikeTrap==3 and payload.skillSlots[0]=="spikeTrap","collector skills/slots")
	check(payload.storage.is_empty(),"game storage remains empty separate authority")
	check(payload.inv.bag.size()==11 and payload.inv.bag[-1].custom.unknown==17,"collector inventory dynamic fields")
	fresh.free()
	var loaded := boot()
	var result: Dictionary=loaded.read_native_demo11_load_result()
	check(result.get("status")=="LOADED" and result.get("start_authorized")==true and result.get("committed")==true,"loaded actual State started via PC interfaces:"+JSON.stringify(result))
	if result.get("committed")==true:
		var restored: Dictionary=loaded.source_state.read_current_p()
		check(restored.lv==12 and restored.exp==27 and restored.maxExp==91 and restored.sp==8 and restored.ap==4,"XP/level/SP/AP restored")
		check(restored._transLvCount==2 and restored._goddessGift==["proof"],"XP extended fields")
		check(loaded.player.hp==loaded.player.max_hp and loaded.player.stamina==loaded.player.max_stamina,"actual initStage HP/ST refill")
		check(loaded.source_resources.read_current_resource_parameters().values.mp==loaded.source_resources.read_current_resource_parameters().values.mmp,"actual initStage MP refill")
		check(restored.skills.spikeTrap==3 and restored.skills.holyDome==2 and restored._skProf.spikeTrap==120,"learned skills/mastery")
		check(restored.skillSlots[0]=="spikeTrap" and restored.ultSlot==null,"slots loaded")
		check(loaded.source_state.read_current_inventory().bag.size()==11,"no fresh starter append")
		check(loaded.source_state.read_current_inventory().bag[-1].uniqueArt=="keep","item unknown/unique fields survive migrations")
		check(loaded.source_state.read_native_demo11_storage()["0"][0].custom.shared,"shared independent real IO restore")
		check(loaded.source_state.read_current_g().mats==218,"shared mats max not addition")
		check(result.pending.is_empty() and result.protected_trace.size()==3,"three real PC observations consumed")
		for trace in result.protected_trace: check(trace.detached==true and trace.live_writes==0,"PC pure observation "+trace.stage)
		check(result.resources.accepted and result.resources.after.hp==87 and result.resources.after.st==42 and result.resources.after.mp==31,"PC raw resource writer before applyStats/initStage")
		check(result.apply_stats.committed and result.apply_stats.before.hp==87 and result.apply_stats.before.st==42 and result.apply_stats.before.mp==31,"applyStats sees restored resources, not fresh refill")
		check(result.stage_entry.applied and result.stage_entry.hp==loaded.player.max_hp,"existing stage entry after PC applyStats")
		check(not loaded.get_meta("demo11_load_gate") and loaded.source_state.read_current_g().on,"load gate released only after complete boot")
		check(loaded.get_meta("native_intro_boot")=="dormant","loaded never fresh intro reset")
		check(restored.skills.maliceSwipe>=1 and restored.skills.shieldThrow>=1 and restored._fused.shieldFuse==true,"PC wing restoration installed")
		check(restored.activeQSk=="parry" and restored.activeRMBSk=="maliceSwipe","PC protected active selection")
		check(loaded.source_state.get("_demo11_load_used") and loaded.source_state.get("_demo11_start_sealed"),"load one-shot sealed")
		check(loaded.player.process_mode==Node.PROCESS_MODE_PAUSABLE and loaded.world.process_mode==Node.PROCESS_MODE_PAUSABLE and loaded.is_physics_processing(),"loaded actor/world/main enabled")
		check(loaded.save_native_demo11_current().get("committed")==true,"full loaded state save unblocked")
		check(loaded.get("_demo11_session").restore_stopped(loaded).get("committed")!=true,"one-shot rejects duplicate restoration")
		check(loaded.save_native_demo11_current().get("committed")==true,"duplicate restore does not damage started session")
		original=loaded.get("_demo11_session").store.get_item("hellsave_demo").raw
		var no_qe: Dictionary=Session.Flow.new().prepare(payload,{"player":restored.duplicate(true),"game":loaded.source_state.read_current_g().duplicate(true),"skill_slots":[null,null,null,null,null,null],"ult_slot":null},Session.skill_tables(),{"protected_qe":func(_state,_saved): return {}})
		check(no_qe.status=="HOLD" and str(no_qe.reason).begins_with("protected_owner_observation_absent:"),"missing/invalid PC observation cannot authorize")
	loaded.free()
	# Three faults: shared writer lock, corrupt player JSON, damaged shared JSON.
	var shared_root := OS.get_user_data_dir().path_join("demo_shared_local_storage")
	check(DirAccess.make_dir_absolute(shared_root.path_join(".writer"))==OK,"foreign writer fault injected")
	var failed := boot()
	check(failed.read_native_demo11_load_result().get("status")=="HOLD","shared IO failure stops load")
	check(failed.source_state.read_current_inventory().bag.is_empty() and failed.source_state.read_current_p().lv==1,"failed IO has neither fresh payout nor partial loaded XP")
	failed.free()
	check(DirAccess.remove_absolute(shared_root.path_join(".writer"))==OK,"foreign fault released by test owner")
	var game_path := OS.get_user_data_dir().path_join("demo_local_storage/hellsave_demo.json")
	var file := FileAccess.open(game_path,FileAccess.WRITE); file.store_string('{"player":[]}'); file.close()
	failed=boot()
	check(failed.read_native_demo11_load_result().get("status")=="HOLD" and failed.world==null,"invalid player never fresh start")
	failed.free()
	file=FileAccess.open(game_path,FileAccess.WRITE); file.store_string(original); file.close()
	var stash_path := shared_root.path_join("hellcave_sharedStorage.json")
	var stash_raw := FileAccess.get_file_as_string(stash_path)
	file=FileAccess.open(stash_path,FileAccess.WRITE); file.store_string("["); file.close()
	failed=boot()
	check(failed.read_native_demo11_load_result().get("status")=="HOLD","corrupt shared is not empty success")
	check(failed.source_state.read_current_inventory().bag.is_empty(),"corrupt shared no live inventory writes")
	failed.free()
	file=FileAccess.open(stash_path,FileAccess.WRITE); file.store_string(stash_raw); file.close()
	check(FileAccess.get_file_as_string(game_path)==original,"all failed loads preserve committed save bytes")
	# Fourth fault: PC applyStats rejects unsupported stats after raw restore.
	payload=JSON.parse_string(original); payload.stats.str="unproven"
	var bad_raw := JSON.stringify(payload)
	file=FileAccess.open(game_path,FileAccess.WRITE); file.store_string(bad_raw); file.close()
	failed=boot()
	var held: Dictionary=failed.read_native_demo11_load_result()
	check(held.get("status")=="HOLD" and str(held.get("reason")).begins_with("loaded_apply_stats:"),"PC applyStats failure held:"+JSON.stringify(held))
	check(not failed.source_state.read_current_g().on and failed.player.process_mode==Node.PROCESS_MODE_DISABLED and not failed.is_physics_processing(),"failed applyStats cannot start")
	check(failed.save_native_demo11_current().get("committed")!=true and FileAccess.get_file_as_string(game_path)==bad_raw,"failed applyStats cannot overwrite save")
	failed.free()
	file=FileAccess.open(game_path,FileAccess.WRITE); file.store_string(original); file.close()
	finish()
