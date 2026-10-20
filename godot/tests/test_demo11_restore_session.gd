extends "res://tests/test_demo11_restore_connected.gd"
## 06b regression follows the 06c contract; retains its own existing namespace.
const ISOLATED_DIRECTORY := "EXODUSER-demo11-06b-Isolated-20261021"
func isolation_name() -> String: return ISOLATED_DIRECTORY
func _run() -> void:
	if not OS.get_cmdline_user_args().has("--focused-only"):
		super._run()
		return
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=ISOLATED_DIRECTORY or not OS.get_user_data_dir().ends_with(ISOLATED_DIRECTORY): quit(2); return
	_focused()
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
	# PC raw restore accepts finite negative caps; applyStats derives the new caps.
	var path := OS.get_user_data_dir().path_join("demo_local_storage/hellsave_demo.json")
	var payload: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(path)); payload.player.mmp=-1
	var file := FileAccess.open(path,FileAccess.WRITE); file.store_string(JSON.stringify(payload)); file.close()
	var before_shared := FileAccess.get_file_as_string(OS.get_user_data_dir().path_join("demo_shared_local_storage/hellcave_sharedStorage.json"))
	var failed := boot()
	check(failed.read_native_demo11_load_result().get("status")=="LOADED" and failed.read_native_demo11_load_result().resources.after.mmp==-1,"PC raw negative cap then applyStats/start")
	check(failed.source_state.read_current_p().lv==14 and failed.source_state.read_current_inventory().bag.size()==10,"valid raw cap load keeps saved State without fresh payout")
	check(before_shared==FileAccess.get_file_as_string(OS.get_user_data_dir().path_join("demo_shared_local_storage/hellcave_sharedStorage.json")),"valid retry preserves independent shared bytes")
	failed.free()
	for name in names:
		var original := OS.get_user_data_dir().path_join(name)
		check(DirAccess.rename_absolute(original,original+"-focus-evidence-"+str(Time.get_ticks_usec()))==OK,"retain focused IO evidence")
		check(DirAccess.rename_absolute(original+stamp,original)==OK,"restore separate-process restart fixture")
