extends SceneTree
const USERDIR="EXODUSER-demo11-32-Isolated-20261021"
const TICK=preload("res://scripts/native_demo11_fire_devil_tick.gd")
const MAIN=preload("res://scripts/main.gd")
var assertions:=0
var failures:=0
var rng_count:=0
var shots: Array=[]
var hurts: Array=[]
var benchmark: Dictionary={}
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
	assertions+=1
	if not ok:failures+=1;print("DEMO32_FAIL ",label)
func equal(a: Variant,b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float):return float(a)==float(b) if a is int or b is int else absf(float(a)-float(b))<=0.000000001
	if a is Dictionary and b is Dictionary:
		if a.size()!=b.size():return false
		for k in a:
			if not b.has(k) or not equal(a[k],b[k]):return false
		return true
	if a is Array and b is Array:
		if a.size()!=b.size():return false
		for i in range(a.size()):
			if not equal(a[i],b[i]):return false
		return true
	return typeof(a)==typeof(b) and a==b
func rng() -> float:rng_count+=1;return .25
func wall(_at: Vector2) -> bool:return false
func birth(props: Dictionary) -> Dictionary:shots.append(props.duplicate(true));return {"ack":true}
func contact(request: Dictionary) -> Dictionary:
	var p: Dictionary=request.player.duplicate(true)
	if request.kind=="body_push":p.x=request.position.x;p.y=request.position.y
	else:
		hurts.append({"damage":request.damage,"dtype":request.dtype})
		if request.has("knockback") and p.has("kb"):
			p.kb.x+=request.knockback.x;p.kb.y+=request.knockback.y
	return {"ack":true,"player_after":p}
func callbacks() -> Dictionary:return {"is_wall":wall,"rng":rng,"protected_contact":contact,"spawn_projectile":birth}
func frame(id: int,p: Dictionary) -> Dictionary:
	return {"ready":true,"serial":id,"sp":1.0,"player":p,"context":{"camera":Vector2.ZERO,"viewport":Vector2(1920,1080),"lesson_active":false,"qa_storage_active":false,"first_forest_active":false,"aggro_active":false}}
func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
	var node_bin:=""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):node_bin=arg.trim_prefix("--node-bin=")
	check(not node_bin.is_empty(),"explicit_node_bin")
	var output: Array=[]
	var path:=OS.get_user_data_dir().path_join("demo32-oracle.json")
	var rc:=OS.execute(node_bin,[ProjectSettings.globalize_path("res://tests/demo11_32_source_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--out="+path],output,true)
	check(rc==0,"source_oracle:"+"\n".join(output))
	if rc!=0:quit(1);return
	var fixtures: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(path))
	for row in fixtures.initial:check(equal(TICK.initial(Vector2.ZERO,row.lv),row.expected),"original_initial:"+str(row.lv))
	for row in fixtures.cases:
		var m: Dictionary=row.before.duplicate(true);var p: Dictionary=row.player.duplicate(true)
		rng_count=0;shots=[];hurts=[]
		var kernel:=TICK.new()
		for n in range(int(row.ticks)):
			check(kernel.begin(m,p,{"camera":Vector2(row.camera[0],row.camera[1]),"viewport":Vector2(1920,1080)},callbacks()),"begin:"+row.name)
			check(kernel.done and kernel.pending.is_empty(),"oracle_callbacks_only_source_unit:"+row.name)
			p=kernel.p
		if not equal(m,row.expected.record):print("DEMO32_DIFF ",row.name," ",JSON.stringify({"actual":m,"expected":row.expected.record}))
		check(equal(m,row.expected.record),"record:"+row.name)
		check(equal(p,row.expected.player),"player_plan:"+row.name)
		check(equal(shots,row.expected.shots),"raw_projectiles:"+row.name)
		check(equal(hurts,row.expected.hurts),"protected_requests:"+row.name)
		check(rng_count==row.expected.rng,"rng_count:"+row.name)
	# Missing PC stops exactly at contact; resume never decrements twice.
	var pending:=TICK.new();var m:=TICK.initial(Vector2.ZERO,1);m.asleep=0;m.hid=0
	var p: Dictionary={"x":120.0,"y":0.0,"r":20.0,"s":"idle","iframes":0.0}
	var owners:=callbacks();owners.erase("protected_contact")
	pending.begin(m,p,{"camera":Vector2.ZERO,"viewport":Vector2(1920,1080)},owners)
	check(not pending.done and pending.pending.command=="protected_contact" and m.t==1,"PC_missing_explicit_pending_prefix")
	pending.pump();check(m.t==1,"no_duplicate_prefix_wait")
	owners.protected_contact=contact;pending.pump();check(pending.done and m.t==1,"resume_once")
	# Actual Main/State + actual35 registry; protected callbacks intentionally UNBOUND.
	var main: Node=MAIN.new();root.add_child(main)
	if not main.is_node_ready():await main.ready
	main.set_process(false);main.world.set_process(false);main.world.set_physics_process(false);main.player.set_physics_process(false)
	var family: Node=main.native_demo_fire_devils;family.set_physics_process(false);main.native_demo_boss_projectiles.set_physics_process(false)
	check(family.snapshot().status=="DORMANT" and family.snapshot().records.is_empty(),"no_provider_no_original_coordinate_spawn")
	var provider:=Node2D.new();main.world.add_child(provider);var marks:=Node2D.new();marks.name="Markers";provider.add_child(marks)
	check(not main.bind_native_fire_devil_map(provider),"missing_marker_reject")
	for i in range(4):
		var marker:=Marker2D.new();marker.name="FireDevil"+str(i+1);marker.position=Vector2(-600-i*100,0);marks.add_child(marker)
	check(main.bind_native_fire_devil_map(provider),"actual_marker_provider_bound")
	check(not main.bind_native_fire_devil_map(provider),"duplicate_provider_reject")
	var g: Dictionary=main.source_state.read_current_g();g.on=true;var before:=g.duplicate(true)
	check(is_same(g._fireDevils,family._records) and g._fireDevils.size()==4,"State_same_four_slot_array")
	check(g._fireDevils[0].x==-600 and g._fireDevils[0].homeX==-600 and not g._fireDevils[0].has("ib"),"marker_pixel_no_site_or_ib")
	for i in range(4):
		var r: Dictionary=g._fireDevils[i];r.asleep=0;r.hid=0;r.burst=1;r.burstGap=0;r.enChg=0;r.shotCd=90
	var f:=frame(1,{"x":500.0,"y":0.0,"r":20.0,"s":"idle","iframes":0.0})
	check(family.advance_source_frame(f),"actual_family_tick")
	check(not family.advance_source_frame(f),"serial_once")
	var registry: Node=main.native_demo_boss_projectiles
	check(registry.snapshot().born>=1 and registry.snapshot().dropped>=1,"real35_drop_and_carrier_creation")
	check(registry.snapshot().shots.all(func(s):return s.in_tree and s.raw.fireMagic),"real35_flags_no_pool_duplicate")
	check(registry.advance_source_frame(f),"real35_motion_phase")
	check(registry.snapshot().shots.all(func(s):return s.calls==1),"actual_motion_once")
	var agg:=f.duplicate(true);agg.serial=2;agg.context.aggro_active=true
	check(not family.advance_source_frame(agg) and family.snapshot().reason=="aggro_target_unbound","aggro_requires_actual_node")
	var decoy:=Node2D.new();decoy.position=Vector2(-200,30);main.add_child(decoy)
	agg.context.aggro_target_node=decoy
	check(family.advance_source_frame(agg),"aggro_context_accepted_not_AI_retargeted")
	check(registry.advance_source_frame(agg),"registry_actual_aggro_motion")
	check(registry._entries.values().all(func(e):return e.node.player==decoy),"actual_carriers_retarget_real_decoy")
	check(family._frame.player.x==f.player.x,"FD_AI_still_targets_source_player_not_decoy")
	check(not registry.snapshot().protected_contact_bound,"PC_unbound_no_fake_damage_success")
	var hit_owner:=Node.new();main.add_child(hit_owner)
	check(family.bind_hit_owner(hit_owner),"PC_hit_ingress_owner_bind")
	check(not family.apply_hit(provider,0,99999).accepted,"foreign_hit_owner_reject")
	g._fireDevils[0].hid=1;g._fireDevils[0].emT=1
	check(family.apply_hit(hit_owner,0,1).accepted,"emergence_hittable")
	check(not family.apply_hit(hit_owner,0,1).accepted,"hit_cd8_reject")
	g._fireDevils[0].hitCd=0
	check(family.apply_hit(hit_owner,0,99999).get("dead",false) and g._fireDevils.size()==4 and g._fireDevils[0]==null,"actual_death_null_slot_not_compact")
	for key in ["kills","_stageKills","_fbDone","mats"]:check(equal(g.get(key),before.get(key)),"no_original_absent_reward:"+key)
	check(not family.apply_hit(hit_owner,0,1).accepted,"duplicate_dead_hit_reject")
	# Real registry MUST reject specialized energy; no mock carrier or success.
	for i in range(1,4):g._fireDevils[i].enChg=1;g._fireDevils[i].shotCd=90;g._fireDevils[i].burst=0
	var energy:=frame(3,f.player)
	check(not family.advance_source_frame(energy) and family.snapshot().pending.get("command")=="spawn_projectile","energy_real_registry_pending")
	check(registry.snapshot().reason=="specialized_tick_owner_required:elemBall","specialized_limit_not_hidden")
	var saved: Dictionary=g._fireDevils[1].duplicate(true)
	check(not family.resume_pending() and equal(saved,g._fireDevils[1]),"pending_birth_no_tick_or_RNG_replay")
	var paused:=frame(4,f.player);paused.context.lesson_active=true
	check(not family.advance_source_frame(paused),"lesson_no_tick")
	g._bossArena=true
	check(not family.advance_source_frame(frame(5,f.player)) and g._fireDevils==null,"arena_clears_family")
	main.queue_free();await process_frame;await process_frame
	check(not is_instance_valid(main),"actual_owner_freed")
	print("DEMO32_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"source_cases":fixtures.cases.size(),"skip":0,"benchmark":benchmark,"full_combat_ready":false}))
	quit(0 if failures==0 else 1)
