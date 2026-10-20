extends SceneTree
const Main = preload("res://scripts/main.gd")
const Session = preload("res://port_modules/save_adapter/demo_load_session.gd")
const USERDIR := "EXODUSER-demo11-06b-Isolated-20261021"
class Clock extends RefCounted:
	var ms: float=0
	func read() -> Dictionary: return {"ready":true,"ms":ms}
var checks := 0
var failures := 0
func _initialize() -> void: call_deferred("_run")
func check(ok: bool, label: String) -> void:
	checks+=1
	if not ok: failures+=1; printerr("DEMO11_06B_FAIL ",label)
func boot() -> Node:
	var main := Main.new()
	main.set_meta("demo11_storage",true)
	root.add_child(main)
	return main
func finish() -> void:
	print("DEMO11_06B_RESULT "+JSON.stringify({"checks":checks,"failures":failures,"actual_main":true,"pc_interface_wait":true,"userdir":OS.get_user_data_dir()}))
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
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR or not OS.get_user_data_dir().ends_with(USERDIR): quit(2); return
	if OS.get_cmdline_user_args().has("--focused-only"):
		_focused(); finish(); return
	if OS.get_cmdline_user_args().has("--restart-only"):
		var loaded := boot()
		var result: Dictionary=loaded.read_native_demo11_load_result()
		check(result.get("status")=="PC_INTERFACE_WAIT" and result.get("committed")==true,"separate process real loaded actor:"+JSON.stringify(result))
		if result.get("committed")==true:
			check(loaded.source_state.read_current_p().lv==12,"restart XP/level")
			check(loaded.player.hp==87 and loaded.player.stamina==42,"restart actual HP/ST")
			check(loaded.source_resources.read_current_resource_parameters().values.mp==31,"restart actual MP")
			check(loaded.source_state.read_current_inventory().bag.size()==11,"restart bag no fresh append")
			check(loaded.player.process_mode==Node.PROCESS_MODE_DISABLED and not loaded.is_physics_processing(),"restart waiting not playing")
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
	check(result.get("status")=="PC_INTERFACE_WAIT" and result.get("committed")==true,"loaded actual State committed but PC wait:"+JSON.stringify(result))
	if result.get("committed")==true:
		var restored: Dictionary=loaded.source_state.read_current_p()
		check(restored.lv==12 and restored.exp==27 and restored.maxExp==91 and restored.sp==8 and restored.ap==4,"XP/level/SP/AP restored")
		check(restored._transLvCount==2 and restored._goddessGift==["proof"],"XP extended fields")
		check(loaded.player.hp==87 and loaded.player.stamina==42,"actual Player resource restoration")
		check(loaded.source_resources.read_current_resource_parameters().values.mp==31,"actual authority MP restored")
		check(restored.skills.spikeTrap==3 and restored.skills.holyDome==2 and restored._skProf.spikeTrap==120,"learned skills/mastery")
		check(restored.skillSlots[0]=="spikeTrap" and restored.ultSlot==null,"slots loaded")
		check(loaded.source_state.read_current_inventory().bag.size()==11,"no fresh starter append")
		check(loaded.source_state.read_current_inventory().bag[-1].uniqueArt=="keep","item unknown/unique fields survive migrations")
		check(loaded.source_state.read_native_demo11_storage()["0"][0].custom.shared,"shared independent real IO restore")
		check(loaded.source_state.read_current_g().mats==218,"shared mats max not addition")
		check(result.pending==["protected_qe","protected_active_sync","protected_wing"],"all PC call sites named")
		check(loaded.player.process_mode==Node.PROCESS_MODE_DISABLED and loaded.world.process_mode==Node.PROCESS_MODE_DISABLED and not loaded.is_physics_processing(),"PC wait freezes actor/world/main")
		check(loaded.save_native_demo11_current().get("committed")!=true,"partial loaded state cannot overwrite save")
		check(loaded.get("_demo11_session").restore_stopped(loaded).get("committed")!=true,"one-shot rejects duplicate restoration")
		check(loaded.save_native_demo11_current().get("committed")!=true,"failed duplicate cannot unlock saving")
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
	finish()

func _focused() -> void:
	var node_bin := ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
	var output: Array=[]
	var code := OS.execute(node_bin,[ProjectSettings.globalize_path("res://../tools/sv_restore_flow_oracle.cjs"),ProjectSettings.globalize_path("res://..")],output,true)
	var probe: Variant=JSON.parse_string("".join(output))
	check(code==0 and probe is Dictionary,"original skill table oracle via output join")
	if probe is Dictionary:
		var calc := Session.Flow.new()
		check(calc._same(Session.Collector._detach(Session.skill_tables()),probe.tables),"all production skill/fusion/absorption/slot/cap tables match source")
	var transport := preload("res://tests/qa007/oracle_transport.gd")
	var receipt := transport.execute_file(node_bin,ProjectSettings.globalize_path("res://../tools/sv_restore_items_oracle.cjs"),ProjectSettings.globalize_path("res://.."))
	check(receipt.code==0 and receipt.data is Dictionary,"original item table oracle via UTF8 file")
	if receipt.data is Dictionary:
		var native := Session.item_tables()
		var calc := Session.Flow.new()
		for key in native: check(calc._same(native[key],decode_oracle(receipt.data.source_tables[key])),"native item table exact source/"+key)
	var names := ["demo_local_storage","demo_shared_local_storage"]
	var stamp := "-focus-preserved-"+str(Time.get_ticks_usec())
	for name in names:
		var path := OS.get_user_data_dir().path_join(name)
		check(DirAccess.rename_absolute(path,path+stamp)==OK,"preserve restart fixture for focused test")
	var fresh := boot()
	check(fresh.read_native_demo11_load_result().get("status")=="FRESH","focused actual fresh Main")
	var session: RefCounted=fresh.get("_demo11_session")
	var legacy := []
	for i in 201: legacy.append({"slot":"boots","marker":i})
	var migration: Dictionary=session.plan_shared({"player":{},"game":{"mats":123},"storage":[legacy]},0)
	check(migration.status=="READY" and migration.plan.storage["0"].size()==200,"legacy array storage uses exact empty-only 200 cap")
	check(session._persist_shared(migration).status=="READY","actual shared legacy IO commit/readback")
	migration=session.plan_shared({"player":{},"game":{"mats":99},"storage":[legacy]},0)
	check(migration.status=="READY" and migration.plan.mats==123 and migration.plan.storage["0"].size()==200,"retry shared mats max and no repeated legacy concatenation")
	var clock := Clock.new()
	var base: float=Time.get_unix_time_from_system()*1000.0
	clock.ms=base+4000
	session.store.set("_clock",Callable(clock,"read"))
	var lifecycle: RefCounted=session.store.get("_lifecycle")
	var bindings: Dictionary=lifecycle.get("_bindings"); bindings.clock=Callable(clock,"read")
	fresh.source_state.read_current_p().lv=13
	var pumped: Dictionary=session.poll()
	check(pumped.ready and pumped.outcomes.size()==1 and pumped.outcomes[0].result.get("committed")==true,"real Main 3s lifecycle collector/atomic save")
	check(session.store.read_json("hellsave_demo").value.player.lv==13,"boot save current XP snapshot")
	var committed: String=session.store.get_item("hellsave_demo").raw
	var lock := OS.get_user_data_dir().path_join("demo_shared_local_storage/.writer")
	check(DirAccess.make_dir_absolute(lock)==OK,"lifecycle shared IO fault")
	clock.ms=base+31000
	fresh.source_state.read_current_g().on=true
	fresh.source_state.read_current_p().lv=14
	pumped=session.poll()
	check(pumped.ready and pumped.outcomes.size()==1 and pumped.outcomes[0].result.get("ok")==false,"known shared failure settles auto-save event")
	check(lifecycle.snapshot().inflight.is_empty() and lifecycle.snapshot().boot_tickets==0,"no unknown outcome/ticket leak")
	check(session.store.get_item("hellsave_demo").raw==committed,"failed shared save preserves previous game bytes")
	check(DirAccess.remove_absolute(lock)==OK,"test foreign lock removal")
	clock.ms=base+61000
	pumped=session.poll()
	check(pumped.ready and pumped.outcomes.size()==1 and pumped.outcomes[0].result.get("committed")==true,"next scheduled auto-save recovers")
	check(session.store.read_json("hellsave_demo").value.player.lv==14,"recovery snapshot reads new XP")
	fresh._demo11_stop_boot({"status":"HOLD","reason":"test_startup_failure"})
	check(fresh.save_native_demo11_current().get("committed")!=true,"failed fresh start blocks saving")
	fresh.free()
	# Resource rejection must precede both shared IO and any actual actor write.
	var path := OS.get_user_data_dir().path_join("demo_local_storage/hellsave_demo.json")
	var payload: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(path)); payload.player.mmp=-1
	var file := FileAccess.open(path,FileAccess.WRITE); file.store_string(JSON.stringify(payload)); file.close()
	var before_shared := FileAccess.get_file_as_string(OS.get_user_data_dir().path_join("demo_shared_local_storage/hellcave_sharedStorage.json"))
	var failed := boot()
	check(failed.read_native_demo11_load_result().get("status")=="HOLD","invalid resource cap rejected")
	check(failed.source_state.read_current_p().lv==1 and failed.source_state.read_current_inventory().bag.is_empty(),"resource validation failure has no partial State commit")
	check(before_shared==FileAccess.get_file_as_string(OS.get_user_data_dir().path_join("demo_shared_local_storage/hellcave_sharedStorage.json")),"resource validation before shared persistence")
	failed.free()
	for name in names:
		var original := OS.get_user_data_dir().path_join(name)
		check(DirAccess.rename_absolute(original,original+"-focus-evidence-"+str(Time.get_ticks_usec()))==OK,"retain focused IO evidence")
		check(DirAccess.rename_absolute(original+stamp,original)==OK,"restore separate-process restart fixture")
