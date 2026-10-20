extends SceneTree
const USERDIR="EXODUSER-demo11-enemy-base-Isolated-20261021"
const H=preload("res://scripts/native_spawn_hole_system.gd")
const P43=preload("res://tests/test_demo11_43_stage_spawn_adapter.gd")
var checks:=0
var failures:=0
var main: Node
var observations: Dictionary={}
class Provider extends P43.Provider:
	var candidates: Array=[]
	var next_site:=0
	func spawn_sites(kind: String,request: Dictionary) -> Dictionary:
		for a in rows:
			if a.id==request.hole_id and not candidates.is_empty():
				var marker: Marker2D=candidates[next_site%candidates.size()];next_site+=1
				return {"ready":kind=="hole","revision":revision,"position":marker.global_position,"region_id":a.region_id,"site_id":a.id}
		return {"ready":false}
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok:failures+=1;print("ENEMY_BASE_FAIL ",label)
func context() -> Dictionary:
	# Explicit isolated scene: no QA storage scene or aggro target is installed.
	return {"lesson_active":false,"qa_storage_active":false,"aggro_active":false}
func recipe(n: int) -> Dictionary:
	return {"etype":0,"spawn_n":n,"elite":0,"mods":[],"speed_u":0.5,"radius_u":0.5,
		"literal":{"st2":30.0,"facing":0.0,"projT":240.0,"bossPatT":40.0,"_bossOrbitAng":1.0,"_erraticAng":1.0}}
func step() -> void:
	main.world._physics_process(1.0/60)
	main.world.advance_native_owner_phase()
	main.world.advance_native_birth_phase()
	main.native_natural_enemies.advance_scheduler(main.world.get_native_frame())
func run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolated_namespace")
	main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	if not main.is_node_ready():await main.ready
	main.process_mode=Node.PROCESS_MODE_DISABLED # All source phases below are explicit.
	var world: Node=main.world
	var holes: Node=world.get_node("NativeSpawnHoleSystem")
	var provider=Provider.new();world.add_child(provider)
	for y in range(-5,6):
		for x in range(-5,6):
			var point: Vector2=main.player.global_position+Vector2(x*55,y*55)
			if point.distance_to(main.player.global_position)<120 or not world.can_move(point,24):continue
			var marker:=Marker2D.new();provider.add_child(marker);marker.global_position=point;provider.candidates.append(marker)
	check(provider.candidates.size()>=31,"authored_Marker_candidates_on_real_walkable_floor")
	for i in 4:
		var marker:=Marker2D.new();provider.add_child(marker)
		marker.global_position=main.player.global_position+Vector2(0,-3000*i)
		provider.rows.append({"id":"base-marker-"+str(i),"marker":marker,"region_id":i,"room":-1,"size":0.5})
		provider.groups.append({"hole_id":"base-marker-"+str(i),"spawn_group_id":"base-group-"+str(i),"region_id":i,"total":15})
	check(main.bind_native_spawn_stage_provider(provider).ready,"real_MAP11_Marker_adapter")
	check(not main.bind_native_natural_enemy_base(Callable()).ready,"missing_reader_no_fake_defaults")
	check(main.bind_native_natural_enemy_base(context).ready,"single_common_base_bound")
	var base: Node=main.native_natural_enemies
	check(not main.bind_native_natural_enemy_base(context).ready,"duplicate_base_rejected")
	var g: Dictionary=main.source_state.read_current_g();g.on=true;g.paused=false
	var total: int=g._totalSpawned
	# Seed selection uses the real source CDF/elite draw, never edits the pool.
	var chosen:=-1
	for value in 10000:

		# World uses randi()/2^32, so use that same operation exactly.
		seed(value)
		var us: Array=[]
		for j in 5:us.append(float(randi())/4294967296.0)
		if H.roll_etype_from(us[2],us[3])==0 and us[4]>=0.25:chosen=value;break
	check(chosen>=0,"source_seed_has_real_type0_selection")
	for i in 211:
		# Supply deterministic global stream immediately before the actual first
		# constructor boundary. All trigger/delay/tick logic still runs unchanged.
		if holes.holes[0].get("_spawnDelay")==0:seed(chosen)
		step()
		if base.counts.registered>0:break
	check(base.counts.registered==1,"natural_trigger_delay_scheduler_created_type0")
	check(holes._game_frame>=210 and holes.holes[0]._triggered and holes.holes[0]._spawned==1,"source_scheduler_bookkeeping")
	var actor: Node=base.last_receipt.get("actor")
	if not is_instance_valid(actor):observations.last=base.last_receipt;finish();return
	check(world.get_enemies().has(actor) and actor.get_parent()==world,"actual_World_registry")
	check(actor.etype==0 and actor.el==-1 and actor.data.native_final.get("el")==null,"undefined_EL_preserved")
	check(not actor.is_physics_processing(),"no_second_delta_clock")
	check(not actor.read_native_source_damage_fields(world).get("ready",false),"protected_exact_v3_domain_not_weakened")
	check(main.native_stage_spawn_adapter.snapshot().origins==1,"actual_origin_registered")
	var before: float=actor.native_frame
	step();check(actor.native_frame==before+1,"World_phase_advances_actor_once")
	world.advance_native_owner_phase();base.advance_scheduler(world.get_native_frame())
	check(actor.native_frame==before+1,"same_frame_not_replayed")
	check(actor.data.native_final.reviveIframes==14,"revive_decay_before_AI")
	check(not base.spawn_selected(holes,"base-group-0",recipe(1)).ready,"prefix_not_duplicated")
	var bad:=recipe(2);bad.el=0
	check(not base.spawn_selected(holes,"base-group-0",bad).ready,"forced_element_rejected")
	bad=recipe(2);bad.etype=13
	check(not base.spawn_selected(holes,"base-group-0",bad).ready,"unregistered_type_no_substitution")
	# Existing actor/PC HP entry, no test writes HP/alive or calls record kill.
	actor.receive_damage(int(actor.hp+actor.eShield+1000),Vector2.ZERO,"weapon",{})
	check(not actor.alive and actor.hp<=0,"existing_damage_interface_actually_kills")
	check(g._regions[0].kills==1 and base.counts.origin_kills==1,"death_event_actual_origin_handoff")
	check(not main.native_stage_spawn_adapter.record_actor_kill(actor).applied and g._regions[0].kills==1,"death_origin_not_double_counted")
	check(g._totalSpawned==total,"planned_denominator_unchanged")
	var cohort: Array=[]
	for group in 3:
		for n in range(1,16):
			if group==0 and n==1:continue
			var made: Dictionary=base.spawn_selected(holes,"base-group-"+str(group),recipe(n))
			if made.get("ready",false):cohort.append(made.actor)
			if cohort.size()==30:break
		if cohort.size()==30:break
	check(cohort.size()==30,"thirty_actual_natural_actors")
	# Explicit valid Marker-site fixture, all thirty operate near the player.
	# The benchmark is AI/registry CPU wall time, not GPU/full game fps.
	for e in cohort:
		e.alerted=true
		# Force an imminent source charge, not direct projectile/registry creation.
		e._projectile_ticks=0.0
	for h in holes.holes:h._spawnCD=1000000.0;h._triggered=true;h._spawnDelay=0.0;h._spawnTotal=15;h._spawned=int(h.get("_spawned",0));h._spawnInterval=60
	main.player.iframes=1000000.0 # Benchmark fixture excludes protected player damage cost.
	var born_before: int=main.native_demo_boss_projectiles.snapshot().born
	for i in 65:step()
	var shot_snapshot: Dictionary=main.native_demo_boss_projectiles.snapshot()
	check(shot_snapshot.born>born_before and shot_snapshot.live>0,"actual_charge_birth_enters_DEMO11_35_registry")
	check(shot_snapshot.shots.all(func(s):return s.in_tree and s.birth_ticks==1),"real_carriers_each_birth_tick_once")
	check(shot_snapshot.shots.any(func(s):return s.raw.el==-1 and s.raw.parryClass=="magic"),"undefined_EL_is_magic_not_forced_physical")
	if failures>0:
		observations.registry=shot_snapshot;finish();return
	var count: int=base.counts.registered
	var samples: Array=[]
	var start:=Time.get_ticks_usec()
	for i in 600:
		var tick_start:=Time.get_ticks_usec();step();samples.append(Time.get_ticks_usec()-tick_start)
	var elapsed:=Time.get_ticks_usec()-start;samples.sort()
	observations.benchmark={"ticks":600,"actual_live_natural_actors":cohort.filter(func(e):return e.alive).size(),"elapsed_us":elapsed,"mean_us":float(elapsed)/600,"p95_us":samples[569],"p99_us":samples[593],"max_us":samples[-1],"budget_us":1000000.0/120,"scope":"30 actual natural actors + source scheduler + DEMO11-35 motion; CPU fixed native tick, no render/GPU/full-game fps claim"}
	check(base.counts.registered==count and cohort.all(func(e):return e.alive),"fixed_30_cohort_not_empty_or_growing")
	check(samples[593]<1000000.0/120,"thirty_actor_p99_within_120fps_budget")
	observations.registry=main.native_demo_boss_projectiles.snapshot();observations.base=base.counts.duplicate();observations.chosen_seed=chosen
	provider.revision="stale";check(not base.spawn_selected(holes,"base-group-0",recipe(2)).ready,"stale_provider_rejected")
	finish()
func finish() -> void:
	main.queue_free();await process_frame;await process_frame
	print("ENEMY_BASE_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"observations":observations,"full_hurtE_v3_claim":false}))
	quit(1 if failures else 0)
