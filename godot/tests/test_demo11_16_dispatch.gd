extends SceneTree
const D = preload("res://scripts/native_skill_dispatch.gd")
const USERDIR = "EXODUSER-demo11-16-Isolated-20261021"
var checks := 0
var failures := 0
var main: Node
var node_bin := ""
var source_game := ""
func check(ok: bool, message: String) -> void:
	checks += 1
	if not ok: failures += 1; printerr("DEMO11_16_FAIL ",message)
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
		if arg.begins_with("--source-game="): source_game=arg.trim_prefix("--source-game=")
	call_deferred("run")
func run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated userdir")
	check(not node_bin.is_empty() and not source_game.is_empty(),"explicit source/node paths")
	if failures: finish();return
	var output: Array=[]
	var fixture := OS.get_user_data_dir().path_join("demo11-16-source.json")
	if FileAccess.file_exists(fixture): DirAccess.remove_absolute(fixture)
	var code := OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/demo11_16_source_oracle.cjs"),source_game,fixture]),output,true)
	check(code==0,"source Node exit0 "+"".join(output).left(200))
	if code!=0: finish();return
	var data: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(fixture))
	for row: Dictionary in data.rows:
		var p := {"mst":row.mst}
		var gsl: Dictionary=D.quote("giantSlam",int(row.lv),p,row.context)
		check(gsl.ready and gsl.st==row.giant_st and gsl.cd==row.giant_cd and gsl.mats==10,"source giant cost/cd")
		check(D.quote("giantSlam",int(row.lv),p,row.context,true).mats==0,"lesson exemption")
		check(D.quote("iceOrb",int(row.lv),p,row.context).mp==row.ice_mp,"source ice cost")
		check(D.quote("spikeTrap",int(row.lv),p,row.context).cd==row.spike_cd,"source spike cd")
		check(D.quote("holyDome",int(row.lv),p,row.context).cd==row.dome_cd,"source dome cd")
	var p := {"skills":{"spikeTrap":1,"giantSlam":1,"holyDome":1,"iceOrb":1,"blackStar":1},"skillSlots":["spikeTrap",null,null,null,"giantSlam","holyDome"],"ultSlot":"blackStar","activeCtSk":"iceOrb","_fused":{}}
	var g := {"on":true,"paused":false}
	for key in ["1","Space","F","Ctrl"]: check(D.select(key,p,g,"idle",false).accepted,"four source key "+key)
	p.skillSlots[0]=null;p.skillSlots[2]="spikeTrap"
	check(not D.select("1",p,g,"idle",false).accepted and D.select("3",p,g,"idle",false).skill=="spikeTrap","actual assignment replaces hardcode")
	check(D.select("Z",p,g,"idle",false).reason=="executor_interface_required","ULT no fake execution")
	check(D.select("Space",p,g,"iceOrb",true).method=="activate_ice_shatter","Space orb precedence")
	check(D.select("Ctrl",p,g,"iceOrb",true).method=="activate_ice_shatter","Ctrl orb repeat")
	check(not D.select("F",p,g,"dead",false).accepted,"dead gate")
	check(not D.quote("giantSlam",1,{"mst":100},{"ready":false}).ready,"provider failure")
	main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	for i in 12: await physics_frame
	var intro: Node=main.get("source_intro_sequence")
	check(intro.begin_native_intro().get("applied",false),"actual intro owner begins")
	check(intro.finish_native_guide().get("applied",false),"actual guide owner opens G.on")
	var state: Node=main.get("source_state")
	var adapter: Node=main.get("world").get_node_or_null("NativeSkillSlots")
	check(is_instance_valid(adapter) and main.get("world").get("ready_for_player"),"actual Main dispatcher bound")
	if not is_instance_valid(adapter): finish();return
	# Current-state reader returns the actual owned P. Fixture assignment uses this
	# existing test seam; production dispatch never writes slot assignments.
	var actual: Dictionary=state.read_current_p()
	actual.skillSlots[0]=null;actual.skillSlots[2]="spikeTrap"
	var before: Dictionary=state.read_current_g().duplicate(true)
	check(not main.dispatch_native_skill_slot("1").accepted,"live empty key refuses")
	var live: Dictionary=main.dispatch_native_skill_slot("3")
	check(live.accepted,"live reassigned spike "+str(live))
	check(before.mats-state.read_current_g().mats==5,"exact one material debit")
	check(adapter.gc_cd==600 and adapter.read_native_slot_cooldowns().has("qs2") and not adapter.read_native_slot_cooldowns().has("qs0"),"HUD same authority follows slot")
	before=state.read_current_g().duplicate(true)
	check(not main.dispatch_native_skill_slot("3").accepted and before.mats==state.read_current_g().mats,"cooldown rejects without debit")
	# Fixed-key compatibility through the actual adapter input entry, fixture-only
	# cooldown reset after its rejection test; no production timer override.
	adapter.gc_cd=0.0
	actual.skillSlots[0]="spikeTrap";actual.skillSlots[2]=null
	for key in [KEY_1,KEY_F,KEY_SPACE,KEY_CTRL]:
		var pressed:=InputEventKey.new();pressed.physical_keycode=key;pressed.pressed=true
		adapter._unhandled_input(pressed)
		match key:
			KEY_1: check(adapter.gc_cd==600,"fixed 1 dispatch")
			KEY_F: check(adapter.hd_cd==1800,"fixed F dispatch")
			KEY_SPACE: check(adapter.gsl_cd==1800,"fixed Space dispatch")
			KEY_CTRL: check(adapter.get_native_skill_slots_snapshot().io_active,"fixed Ctrl dispatch")
	check(main.dispatch_native_skill_slot("Ctrl").accepted and not adapter.get_native_skill_slots_snapshot().io_active,"live Ctrl shatter existing executor")
	var resources: Node=main.get("source_resources")
	var resource_before: Dictionary=resources.read_current_resource_parameters().duplicate(true)
	check(not state.commit_native_skill_dispatch_cost(main,1,1,2147483647).accepted,"material shortage atomic")
	check(resources.read_current_resource_parameters()==resource_before,"material failure no resource prefix")
	var rogue:=Node.new();root.add_child(rogue)
	check(not state.commit_native_skill_dispatch_cost(rogue,1,1,0).accepted,"foreign owner refused")
	rogue.free()
	var player: Node=main.get("player")
	var st_before: float=player.stamina
	var mp_before: float=state.read_current_p().mp
	check(not state.commit_native_skill_dispatch_cost(main,st_before+1,1,0).accepted and player.stamina==st_before and state.read_current_p().mp==mp_before,"ST failure no MP prefix")
	check(not state.commit_native_skill_dispatch_cost(main,1,mp_before+1,0).accepted and player.stamina==st_before and state.read_current_p().mp==mp_before,"MP failure no ST prefix")
	actual=state.read_current_p();actual.ultSlot="blackStar";actual.skills.blackStar=1
	before=state.read_current_g().duplicate(true)
	check(not main.dispatch_native_skill_slot("Z").accepted and before.mats==state.read_current_g().mats and state.read_current_p().mp==mp_before,"live unavailable ULT spends zero")
	var event:=InputEventKey.new();event.physical_keycode=KEY_3;event.pressed=true;event.echo=true
	var logs: int=adapter.get_native_skill_slots_snapshot().cast_log.size();adapter._unhandled_input(event)
	check(adapter.get_native_skill_slots_snapshot().cast_log.size()==logs,"echo input ignored")
	main.get_parent().remove_child(main);main.free();main=null
	for i in 12: await process_frame
	print("DEMO11_16_SOURCE_CASES ",data.rows.size())
	finish()
func finish() -> void:
	if is_instance_valid(main):main.get_parent().remove_child(main);main.free()
	print("DEMO11_16_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skip":0,"full_active_ult_execution":false}))
	quit(1 if failures else 0)
