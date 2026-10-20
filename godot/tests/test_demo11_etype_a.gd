extends SceneTree
const USERDIR="EXODUSER-demo11-etype-a-Isolated-20261021"
const HANDOFF=preload("res://scripts/native_demo11_etype_a_spawn.gd")
const P43=preload("res://tests/test_demo11_43_stage_spawn_adapter.gd")
const FACTORY=preload("res://scripts/enemy_factory.gd")
var assertions:=0
var failures:=0
var by_type: Dictionary={}
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String,etype: int=-1) -> void:
	assertions+=1
	if etype>=0:by_type[str(etype)]=int(by_type.get(str(etype),0))+1
	if not ok:failures+=1;print("ETYPEA_FAIL ",label)
func selected(etype: int=0,n: int=1) -> Dictionary:
	# Constructor-unit inputs only, already-drawn source uniforms. Never a claim
	# that the still-HOLD scheduler selected these five types in live play.
	return {"etype":etype,"spawn_n":n,"elite":0,"mods":[],"speed_u":.25,"radius_u":.25,"literal":{"st2":42.5,"facing":.5,"projT":210.0,"bossPatT":35.0,"_bossOrbitAng":.5,"_erraticAng":.5}}
func run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
	var node_bin:=""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):node_bin=arg.trim_prefix("--node-bin=")
	check(FileAccess.file_exists(node_bin),"explicit_node_bin")
	var main: Node=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	if not main.is_node_ready():await main.ready
	main.set_process(false);main.world.set_process(false);main.world.set_physics_process(false);main.player.set_physics_process(false)
	var holes: Node=main.world.get_node("NativeSpawnHoleSystem")
	var provider=P43.Provider.new();main.world.add_child(provider)
	for i in range(4):
		var marker:=Marker2D.new();marker.position=Vector2(361+i*77,543+i*67);provider.add_child(marker)
		provider.rows.append({"id":"new-hole-"+str(i),"marker":marker,"region_id":i,"room":-1,"size":.3})
		provider.groups.append({"hole_id":"new-hole-"+str(i),"spawn_group_id":"group-"+str(i),"region_id":i,"total":8})
	check(main.bind_native_spawn_stage_provider(provider).ready,"actual43_marker_adapter")
	var g: Dictionary=main.source_state.read_current_g();g.on=true
	var total: int=int(g._totalSpawned);var region_totals: Array=[]
	for r in g._regions:region_totals.append(r.total)
	var before: int=main.world.get_enemies().size()
	check(not main.request_native_etype_a_spawn(provider,"group-0",selected()).ready,"foreign_source_owner",0)
	var bad:=selected();bad.speed_u=1.0
	check(not main.request_native_etype_a_spawn(holes,"group-0",bad).ready,"rng_upper_boundary_reject",0)
	bad=selected();bad.literal.erase("_erraticAng")
	check(not main.request_native_etype_a_spawn(holes,"group-0",bad).ready,"missing_source_draw_reject",0)
	bad=selected();bad.elite=1
	check(not main.request_native_etype_a_spawn(holes,"group-0",bad).ready,"unsupported_elite_no_substitute",0)
	bad=selected();bad.el=0
	check(not main.request_native_etype_a_spawn(holes,"group-0",bad).ready,"no_forced_element_substitution",0)
	var recipe:=selected();var unchanged:=recipe.duplicate(true)
	var receipt: Dictionary=main.request_native_etype_a_spawn(holes,"group-0",recipe)
	check(receipt.get("ready",false) and receipt.get("registered",false),"actual_P3_actor_registered",0)
	if not receipt.get("ready",false):print("ETYPEA_RECEIPT ",receipt);main.queue_free();await process_frame;quit(1);return
	var actor: Node=receipt.actor
	check(not actor.is_physics_processing(),"source_clock_HOLD_does_not_start_legacy_delta_AI",0)
	check(main.world.get_enemies().has(actor) and main.world.get_enemies().size()==before+1,"actual_world_registry_once",0)
	check(actor.global_position==provider.rows[0].marker.global_position+Vector2(actor.radius,0),"position_only_provider_marker_receipt",0)
	check(actor.data.native_final._homeX==actor.global_position.x and actor.data.native_final._homeY==actor.global_position.y,"source_home_follows_new_marker",0)
	check(actor.etype==0 and actor.el==-1 and actor.data.element_id==-1,"source_undefined_element_not_forced_physical",0)
	check(actor.data.native_final.reviveIframes==15,"source_revive_iframes15",0)
	check(actor.get_script().resource_path=="res://scripts/enemy_melee_flesh_crawler.gd","existing_actor_not_rewritten",0)
	check(recipe==unchanged,"input_detached",0)
	check(not main.request_native_etype_a_spawn(holes,"group-0",recipe).ready and main.world.get_enemies().size()==before+1,"same_source_index_no_duplicate",0)
	check(main.native_stage_spawn_adapter.snapshot().origins==1,"actual43_origin_bound",0)
	check(not actor.read_native_source_damage_fields(main.world).get("ready",false),"v3_exact_initial_domain_not_weakened",0)
	check(not receipt.full_combat_ready and receipt.scheduler=="HOLD_source_tick_integration","not_live_scheduler_fake_PASS",0)
	# Existing partial hurtE delegate remains available; not the v3 full owner.
	check(not actor.read_native_normal_enemy_hurte_fields(main.world).is_empty(),"legacy_dedicated_delegate_preserved",0)
	var adapter: RefCounted=main.native_stage_spawn_adapter
	check(actor.alive and actor.hp>0,"source_death_not_fabricated",0)
	check(not adapter.record_actor_kill(actor).get("applied",false),"live_actor_origin_kill_refused",0)
	check(g._regions[0].kills==0,"no_fake_region_kill",0)
	check(g._totalSpawned==total,"planned_denominator_unchanged",0)
	for i in range(4):check(g._regions[i].total==region_totals[i],"region_total_unchanged:"+str(i),0)
	# Natural undefined-el/general constructor is not the frozen element profile.
	for spec in [[1,"etype1_lightning_hive_bloater","enemy_archer_lightning_hive_bloater"],[4,"etype4_physical_spine_beast","enemy_tank_physical_spine_beast"],[4,"etype4_ice_soul_flame","enemy_tank_ice_soul_flame"]]:
		var et: int=spec[0]
		var cfg: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/"+spec[1]+".json"))
		var runtime: Dictionary=cfg.runtime.duplicate(true)
		var at: Vector2=provider.rows[et%4].marker.global_position
		runtime.id="isolated-new-map-"+spec[1];runtime.order=9000+et;runtime.spawn_position=[at.x,at.y];runtime.requested_spawn_position=[at.x,at.y]
		for key in ["x","_homeX"]:runtime.native_final[key]=at.x
		for key in ["y","_homeY"]:runtime.native_final[key]=at.y
		var existing: CharacterBody2D=load("res://scripts/"+spec[2]+".gd").new();existing.configure(runtime,main.world)
		var no: Dictionary=main.world.register_native_spawn_hole_enemy(existing,runtime.order)
		check(not no.valid and no.errors==["spawn_hole_enemy_actual_etype0_script_required"],"existing_World_gate:"+spec[1],et)
		check(existing.get_parent()==null,"rejected_actor_not_registered:"+spec[1],et);existing.free()
		check(not main.request_native_etype_a_spawn(holes,"group-1",selected(et)).ready,"no_unported_natural_profile_substitution:"+spec[1],et)
	for et in [5,6]:
		var f:=FACTORY.new()
		check(f.unsupported_reason({"etype":et})=="native_type_ai_not_ported","existing_factory_unported",et)
		check(not main.request_native_etype_a_spawn(holes,"group-1",selected(et)).ready,"no_other_actor_substitution",et)
		check(main.world.get_enemies().size()==before+1,"unported_created_zero",et)
	check(not main.request_native_etype_a_spawn(holes,"group-1",selected(20)).ready,"P2008_not_in_group")
	provider.revision="stale"
	check(not main.request_native_etype_a_spawn(holes,"group-0",selected(0,2)).ready,"stale_provider_no_spawn",0)
	check(main.world.get_enemies().size()==before+1,"rejections_no_hidden_actor_growth")
	main.queue_free();await process_frame;await process_frame
	print("ETYPEA_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"by_etype_boundary_checks":by_type,"skip":0,"five_type_spawn_benchmark":"BLOCKED_not_run","actual_types_registered":[0],"full_combat_ready":false}))
	quit(0 if failures==0 else 1)
