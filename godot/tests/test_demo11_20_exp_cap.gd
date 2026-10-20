extends SceneTree
const CURVE = preload("res://scripts/native_source_meta_exp_curve.gd")
const COLLECTOR = preload("res://port_modules/save_adapter/source_save_collector.gd")
const USERDIR = "EXODUSER-demo11-20-Isolated-20261021"
var checks := 0
var failures := 0
var main: Node
var state: Node
var events: Array = []
var nested: Array = []
var cases: Array = []

func _initialize() -> void: call_deferred("_run")
func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("DEMO1120_FAIL ", label)
func argument(name: String) -> String:
	for value in OS.get_cmdline_user_args():
		if value.begins_with(name + "="): return value.substr(name.length()+1)
	return ""
func packet(c: Dictionary) -> Dictionary:
	var p: Dictionary = state.read_current_p()
	var resources: Dictionary = main.source_resources.read_current_resource_parameters()["values"]
	return {"lv":c.lv,"exp":c.exp,"maxExp":15 if c.lv==1 else CURVE.required_exp(c.lv),
		"sp":7,"ap":2,"hp":100,"mhp":main.player.max_hp,"st":10,"mst":main.player.max_stamina,
		"mp":20,"mmp":resources.mmp,"skills":p.skills.duplicate(true)}
func _on_level_up(value: Dictionary) -> void:
	events.append(value.duplicate(true))
	value.save.requested = false # consumer must not alias the State's receipt
	nested.append(state.apply_native_add_exp(main,1))
	check(not state.configure_native_demo_exp_mode(main,false), "mode change rejected during grant")
func _run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolated userdir")
	if failures>0: quit(1); return
	seed(20261021) # only this harness; no product RNG changes
	main=load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for i in 8: await physics_frame
	main.process_mode=Node.PROCESS_MODE_DISABLED
	state=main.source_state
	check(state.is_native_new_run_state_ready(),"actual State ready")
	state.native_level_up_handoff.connect(_on_level_up)
	var definitions: Array = [
		{"name":"exact99","lv":99,"exp":0,"amount":830,"demo":true},
		{"name":"surplus99","lv":99,"exp":829,"amount":2,"demo":true},
		{"name":"huge99","lv":99,"exp":0,"amount":1000000000,"demo":true},
		{"name":"huge1","lv":1,"exp":0,"amount":1000000000,"demo":true},
		{"name":"already100low","lv":100,"exp":17,"amount":1000000000,"demo":true},
		{"name":"already100excess","lv":100,"exp":9000,"amount":1000000000,"demo":true},
		{"name":"belowcap","lv":99,"exp":1,"amount":2,"demo":true},
		{"name":"fullmode100","lv":100,"exp":844,"amount":1,"demo":false},
		{"name":"demonic99","lv":99,"exp":0,"amount":830,"demo":true,"demonic":true},
		{"name":"multi95","lv":95,"exp":0,"amount":1000000000,"demo":true}]
	for c in definitions:
		cases.append({"name":c.name,"p":packet(c),"demo":c.demo,"amount":c.amount,"demonic":c.get("demonic",false)})
	var file := FileAccess.open("user://source-cases.json",FileAccess.WRITE)
	file.store_string(JSON.stringify(cases));file.close()
	var output: Array = []
	var node := argument("--node-bin")
	check(not node.is_empty(),"explicit node binary")
	var args := PackedStringArray([ProjectSettings.globalize_path("res://tests/demo11_20_source_oracle.mjs"),
		"--source-game="+ProjectSettings.globalize_path("res://../game.html"),
		"--cases-file="+ProjectSettings.globalize_path("user://source-cases.json")])
	var exit_code := OS.execute(node,args,output,true)
	var joined := ""
	for chunk in output: joined += str(chunk)
	check(exit_code==0,"original addExp oracle: "+joined.left(160))
	var oracle: Variant = JSON.parse_string(joined)
	check(oracle is Dictionary and oracle.get("rows",[]).size()==cases.size(),"oracle complete JSON")
	if not oracle is Dictionary: main.queue_free(); quit(1); return
	for i in cases.size():
		var c: Dictionary=cases[i]
		var expected: Dictionary=oracle.rows[i]
		var p: Dictionary=state.read_current_p()
		for key in c.p: p[key]=c.p[key].duplicate(true) if c.p[key] is Dictionary else c.p[key]
		main.player.hp=c.p.hp;main.player.stamina=c.p.st
		main.source_resources.get("_owned")["mp"]=c.p.mp
		var passives: Dictionary=state.read_current_passives()
		passives.pDemon=1 if c.demonic else 0;passives.pHuman=0
		check(state.configure_native_demo_exp_mode(main,c.demo),c.name+" configure mode")
		events.clear();nested.clear()
		var serial_before: int=int(state.read_native_level_up_handoff().get("serial",0))
		var result: Dictionary=state.apply_native_add_exp(main,int(c.amount))
		p=state.read_current_p()
		check(result.applied==true,c.name+" applied (blocked cap is not a kill failure)")
		for key in ["lv","exp","maxExp","sp","ap","hp","st","mp"]:
			check(p[key]==expected.p[key],c.name+" actual owner/original "+key)
		check(events.size()==int(expected.saves),c.name+" one post-level handoff or none")
		check(result.texts.size()==expected.texts.size(),c.name+" actual SP/AP text count")
		if expected.saves>0:
			check(result.levels==int(expected.p.lv)-int(c.p.lv),c.name+" level count")
			check(result.texts[0].text==expected.texts[0][2] and result.texts[0].color==expected.texts[0][3],c.name+" text/color original")
			check(events[0].presentation.title==expected.popups[0][0] and events[0].presentation.color==expected.popups[0][1],c.name+" presentation handoff")
			check(events[0].save.requested and not events[0].save.committed and events[0].save.source_line==43171,c.name+" actual save request, no fake IO")
			check(events[0].lv==p.lv and events[0].exp==p.exp and events[0].sp==p.sp and events[0].ap==p.ap,c.name+" handoff after committed level fields")
			check(state.read_native_level_up_handoff().save.requested,c.name+" detached consumer data")
			check(nested.size()==1 and nested[0].applied==false,c.name+" no reentrant grant")
		else:
			check(result.levels==0 and result.handoff.is_empty(),c.name+" no level side effects")
			check(int(state.read_native_level_up_handoff().get("serial",0))==serial_before,c.name+" no extra save/display event")
		main.hud.call("_refresh_native_first_fight_hud")
		var hud: Dictionary=main.hud.get_native_first_fight_hud_snapshot()
		check(hud.lv_text==str(int(p.lv)),c.name+" actual HUD level")
		check(hud.exp_text==str(int(p.exp))+" / "+str(int(p.maxExp)),c.name+" actual HUD XP")
	var before: Dictionary=state.read_current_p().duplicate(true)
	check(state.apply_native_add_exp(main,-1).applied==false,"negative XP rejection unchanged")
	var stranger := Node.new()
	check(state.apply_native_add_exp(stranger,999).applied==false,"foreign owner rejection")
	check(not state.configure_native_demo_exp_mode(stranger,false),"foreign mode setter rejected")
	stranger.free()
	check(state.read_current_p()==before,"rejected input preserves owner state")
	var readers: Dictionary=COLLECTOR.current_readers(state,main.source_providers)
	check(readers.current_p.call().lv==before.lv,"save handoff reads the same current State")
	var collected: Dictionary=COLLECTOR.collect(readers,"local",1)
	check(collected.status=="HOLD" and collected.payload==null and collected.missing==["reader:save_globals"],"existing collector still honest HOLD until DEMO11-06")
	check(state.read_current_p()==before,"collector is read-only")
	print("DEMO1120_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"source_cases":cases.size(),"skip":0,"save_io":false,"main_booted":true}))
	main.queue_free()
	for i in 12: await process_frame
	await create_timer(0.2).timeout
	quit(1 if failures>0 else 0)
