extends SceneTree
const USERDIR="EXODUSER-demo11-etype-a-Isolated-20261021"
const FIXTURE=preload("res://tests/demo11_etype_a_fixture.gd")
const BUILD=preload("res://scripts/native_demo11_etype_a_constructor.gd")
const FACTORY=preload("res://scripts/enemy_factory.gd")
var assertions:=0
var failures:=0
var by_type: Dictionary={}
var events: Array=[]
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String,et: int=-1) -> void:
	assertions+=1
	if et>=0:by_type[str(et)]=int(by_type.get(str(et),0))+1
	if not ok:failures+=1;print("ATYPE_REGISTERED_FAIL ",label)
func observe(kind: String,packet: Dictionary) -> void:events.append({"kind":kind,"packet":packet})
func run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
	var node_bin:=""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):node_bin=arg.trim_prefix("--node-bin=")
	var output: Array=[];var oracle_path:=OS.get_user_data_dir().path_join("resume-etype-a-source.json")
	var rc:=OS.execute(node_bin,[ProjectSettings.globalize_path("res://tests/demo11_etype_a_source_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--out="+oracle_path],output,true)
	check(rc==0,"original_mkEn_oracle:"+"\n".join(output))
	if rc!=0:quit(1);return
	var oracle: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(oracle_path))
	var physical: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(FACTORY.DEMO11_ETYPE_A_REGISTRATIONS[0].template)).runtime.projectile
	for row in oracle.rows:
		var et: int=int(row.etype)
		var template: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(FACTORY.DEMO11_ETYPE_A_REGISTRATIONS[et].template)).runtime
		var value: Dictionary=BUILD.build(template,physical,et,Vector2(351,543),row.lv,0,FIXTURE.recipe(et),"oracle",7000,int(row.diff))
		for key in row.expected:
			check(absf(float(value.native_final[key])-float(row.expected[key]))<=0.000000001,"source:"+str(et)+"/"+str(row.lv)+"/"+str(row.diff)+"/"+key,et)
		check(row.el_undefined and not value.native_final.has("el") and value.element_id==-1,"undefined_el_preserved",et)
	var f:=FIXTURE.new();check(f.setup(self),"actual_main_marker_cohort")
	if f.actors.size()!=5:print("ATYPE_SETUP ",f.receipts);f.close();await process_frame;quit(1);return
	var main: Node=f.main;var world: Node=main.world;var g: Dictionary=main.source_state.read_current_g()
	var total: int=g._totalSpawned
	var base_count: int=world.get_enemies().size()
	var atypes: Array=[]
	for i in range(5):
		var a: Node=f.actors[i];var et: int=a.etype;atypes.append(et)
		a.telemetry_event.connect(observe)
		check(world.get_enemies().has(a) and a.is_inside_tree() and a.is_native_registry_ready(),"actual_registered:"+str(et),et)
		check(not a.is_physics_processing(),"one_World_clock_only:"+str(et),et)
		check(a.global_position==f.provider.rows[i%4].marker.global_position,"marker_only:"+str(et),et)
		check(a.data.element_id==-1 and a.data.native_final.reviveIframes==15,"native_spawn_fields:"+str(et),et)
		var duplicate: Dictionary=main.request_native_etype_a_spawn(f.holes,"cohort-group-"+str(i%4),FIXTURE.recipe(et,2 if i==4 else 1))
		check(not duplicate.ready and world.get_enemies().size()==base_count,"no_duplicate:"+str(et),et)
	check(atypes==[0,1,4,5,6] and main.native_stage_spawn_adapter.snapshot().origins==5,"five_real_origins_no_substitution")
	# Real World phase dispatch, not direct wrapper tick calls.
	for i in range(20):await physics_frame
	await process_frame
	for a in f.actors:
		check(a.a_phase_calls>0 and a.data.native_final.reviveIframes<15,"automatic_existing_owner_phase:"+str(a.etype),a.etype)
		var calls: int=a.a_phase_calls
		a.advance_native_phase(1,world.get_native_frame(),world.get_enemies())
		check(a.a_phase_calls==calls,"same_frame_dedup:"+str(a.etype),a.etype)
	# Existing ordinary projectile carriers and PC contact interfaces.
	for i in [0,1,2]:f.actors[i]._fire_projectile()
	check(events.filter(func(e):return e.kind=="enemy_projectile_birth").size()>=3,"real_0_1_4_carriers")
	var birth: Dictionary=events.filter(func(e):return e.kind=="enemy_projectile_birth").back().packet
	var carrier: Object=instance_from_id(int(birth.node_id))
	check(not carrier.data.redBean and not carrier.native_homing_enabled and carrier.data.native_dtype=="magic","undefined_el_no_redBean_burn_or_physical_damage_rewrite")
	var hp_before: float=main.player.hp
	var protected_receipt: Dictionary=main.player.receive_native_projectile_contact(carrier,int(carrier.damage),str(carrier.data.native_dtype),Vector2.RIGHT,0.0)
	check(protected_receipt.get("accepted",false) and main.player.hp<hp_before,"actual_carrier_to_PC_damage_interface")

	# Type5 current source has a windup/attack warning, never a suicide explosion.
	var a5: Node=f.actors[3];a5.alerted=true;a5.state="windup";a5.st2=1
	for i in range(85):await physics_frame
	await process_frame
	check(events.any(func(e):return e.kind=="enemy_projectile_birth" and e.packet.id==a5.data.id),"type5_windup_warning_actual_projectile",5)
	check(a5.state!="eSelfDestruct","type5_no_invented_explosion",5)
	# Protected rich bash must request PC ownership, not ordinary-hit fallback.
	var a6: Node=f.actors[4]
	a6.eShield=0;a6.state="idle";a6.data.native_final.shieldBashT=0
	a6.global_position=main.player.global_position-Vector2(65,0);a6.alerted=true
	for i in range(12):await physics_frame
	await process_frame
	check(a6.a_pending.get("kind")=="shield_bash","type6_PC_bash_request_visible",6)
	check(not a6.a_bash_owner.is_valid(),"no_fake_PC_QE_result",6)
	# Real incoming public actor damage path + actual origin kill, not HP assignment.
	for a in f.actors:
		if a.etype==6:a.a_pending={}
		a.receive_damage(int(a.hp+a.eShield)*3,Vector2.RIGHT,"group_a_isolated_combat")
		check(not a.alive and a.hp<=0,"actual_actor_damage_death:"+str(a.etype),a.etype)
		var receipt: Dictionary=main.native_stage_spawn_adapter.record_actor_kill(a)
		check(receipt.get("applied",false),"origin_kill:"+str(a.etype),a.etype)
		check(not main.native_stage_spawn_adapter.record_actor_kill(a).get("applied",false),"kill_once:"+str(a.etype),a.etype)
	check(g._totalSpawned==total,"planned_denominator_unchanged")
	f.close();await process_frame;await process_frame
	print("ATYPE_REGISTERED_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"by_type":by_type,"source_rows":oracle.rows.size(),"actual_registered":[0,1,4,5,6],"skip":0,"rich_type6_PC_bash":"WAITING_OWNER","v3_full_damage_domain":"UNCHANGED"}))
	quit(0 if failures==0 else 1)
