extends SceneTree
const AUTHORITY = preload("res://scripts/native_demo11_authority.gd")
const ACTOR = preload("res://scripts/native_demo11_boss_actor.gd")
const SERVICE = preload("res://scripts/native_demo11_boss_projectiles.gd")
const USERDIR := "EXODUSER-demo11-35-Isolated-20261021"
var assertions := 0
var failures := 0
var scope: Node2D
var world: Node2D
var target: Node2D
var actor: Node
var service: Node
var prefix_state := "bossFanWind"
var serial := 1
class Arena extends "res://scripts/world.gd":
	var wall_x := INF
	func _ready() -> void: pass
	func _physics_process(_delta: float) -> void: pass
	func _process(_delta: float) -> void: pass
	func can_move(_position: Vector2,_radius: float) -> bool: return true
	func native_safe_point(x: float,y: float,_r: float) -> Variant: return {"x":x,"y":y}
	func is_world_blocked(at: Vector2) -> bool: return at.x>wall_x
	func read_native_source_player_projectile_context() -> Dictionary: return {"ready":false,"reason":"independent_source_driver"}
class Target extends Node2D:
	var forbidden_calls := 0
	func receive_damage(_damage: Variant,_dtype: Variant) -> void: forbidden_calls+=1
	func try_native_q_projectile_reflection(_shot: Variant,_distance: Variant) -> Dictionary:
		forbidden_calls+=1
		return {}
class Scope extends Node2D:
	var world: Node2D
	var player: Node2D
	var native_demo_boss_actor: Node2D
	func read_native_demo_policy() -> Dictionary: return AUTHORITY.boot_manifest()
func _initialize() -> void: call_deferred("_run")
func check(ok: bool,label: String) -> void:
	assertions+=1
	if not ok:
		failures+=1
		print("DEMO35_FAIL ",label)
func setup() -> void:
	scope=Scope.new()
	root.add_child(scope)
	world=Arena.new()
	scope.world=world
	scope.add_child(world)
	target=Target.new()
	target.position=Vector2(0,400)
	scope.player=target
	scope.add_child(target)
	actor=ACTOR.install_native_boot(scope)
	scope.native_demo_boss_actor=actor
	actor.set_physics_process(false)
	service=SERVICE.install_native_boot(scope)
	service.set_physics_process(false)
func frame(id: int) -> Dictionary:
	return {"ready":true,"serial":id,"sp":1.0,"player":{"x":0.0,"y":400.0,"r":20.0,"s":"idle","iframes":0.0,"facing":0.0,"kb":{"x":0.0,"y":0.0}},"context":{"lesson_active":false,"qa_storage_active":false,"aggro_active":false,"thorn_first":true,"druid_finale":false,"vfx_available":false,"frame":float(id),"shake":100.0,"drop_counter":service.read_drop_counter()},"globals":{},"player_stats":null}
func prefix(request: Dictionary) -> Dictionary:
	var enemy: Dictionary=request.enemy.duplicate(true)
	enemy.s=prefix_state
	enemy.st2=0.0
	return {"ack":true,"enemy_after":enemy,"player_after":request.player,"context_after":request.frame.context,"globals_after":{},"through_source_line":40443,"cached_distance":400.0,"sp_after":1.0,"return_update":false}
func suffix(request: Dictionary) -> Dictionary: return {"ack":true,"enemy_after":request.enemy,"player_after":request.player}
func presentation(request: Dictionary) -> Dictionary:
	# Only isolated presentation/control callbacks. Birth is NEVER mocked.
	if request.command=="source_global_write":
		scope.set_meta(request.event.field,request.event.value)
		return {"ack":true,"globals_after":{request.event.field:scope.get_meta(request.event.field)}}
	if request.command=="_T": return {"ack":true,"value":str(request.args[0])}
	return {"ack":true}
func finish_actor() -> void:
	for i in range(300):
		var p: Dictionary=actor.snapshot().pending
		if p.is_empty(): break
		check(p.command not in ["spawnProj_owner","_spawnBossProjectile"],"birth_bound_to_real_service:"+str(p.command))
		if p.command in ["spawnProj_owner","_spawnBossProjectile"]: break
		if not actor.bind_owner(p.command,presentation): break
	check(actor.snapshot().reason=="" and actor.snapshot().pending.is_empty(),"actor_continuation_completed")
func request(props: Dictionary,id: int) -> Dictionary:
	return {"command":"spawnProj_owner","args":[props],"frame":frame(id)}
func born(props: Dictionary,id: int) -> Variant:
	return service._birth_request(request(props,id))
func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
	setup()
	var result: Dictionary=actor.spawn({"si":0,"room":0,"x":0.0,"y":0.0,"difficulty_index":5,"stage_diff_offset":0.0,"player_level":1.0})
	check(result.status=="READY","real_BC02_actor")
	actor.bind_owner("source_updateE_prefix",prefix)
	actor.bind_owner("source_updateE_suffix",suffix)
	check(actor.begin_tick(frame(1)),"actual_actor_BC09_fan")
	finish_actor()
	var first: Dictionary=service.snapshot()
	check(first.born==12 and first.live==12 and first.shots.all(func(s):return s.in_tree),"actor_produced_12_real_carriers_not_ack_only")
	check(first.shots.all(func(s):return s.raw._druidPoison and s.raw._druidThornVolley),"source_flags_preserved")
	check(service.advance_source_frame(frame(1)),"real_birth_phase")
	var after: Dictionary=service.snapshot()
	check(after.shots.all(func(s):return s.birth_ticks==1 and s.calls==1),"every_new_carrier_advanced_once_in_birth_frame")
	check(not service.advance_source_frame(frame(1)) and service.snapshot().motion_ticks==12,"no_second_tick_same_source_serial")
	check(after.shots.any(func(s):return abs(s.raw.x)>0.0 or abs(s.raw.y)>0.0),"real_nodes_moved")
	check(target.forbidden_calls==0 and not after.protected_contact_bound and after.unbound_contact_scans==12,"no_PC_damage_or_parry_call_no_mock_success")
	# Retire existing actual carriers via the existing ordinary wall owner.
	world.wall_x=-INF
	check(service.advance_source_frame(frame(2)),"wall_frame")
	check(service.snapshot().live==0 and service.snapshot().retired==12,"actual_registry_removed_on_wall")
	await process_frame
	await process_frame
	check(get_nodes_in_group("demo11_boss_projectiles").is_empty(),"retired_nodes_really_freed")
	world.wall_x=INF
	var props: Dictionary={"x":0.0,"y":0.0,"vx":2.0,"vy":0.0,"dmg":7,"el":0,"life":0.5,"ml":0.5,"redBean":true,"_commit":true,"_druidStraight":true}
	var preserved:=props.duplicate(true)
	var birth: Variant=born(props,3)
	check(birth is Dictionary and birth.ack and service.snapshot().live==1,"actual_recycled_pool_birth")
	check(props==preserved,"caller_props_unchanged")
	check(not birth.projectile_result._druidPoison and not birth.projectile_result._druidThornVolley,"recycled_flags_reset")
	check(service.advance_source_frame(frame(3)) and service.snapshot().live==0 and service.snapshot().last_retired.reason=="lifetime","source_red_expiry_actual_node_retired")
	# Nonred near-camera source life1 extension, then camera culling.
	var nonred:=props.duplicate(true)
	nonred.redBean=false
	nonred.gbBean=true
	nonred.el=3
	birth=born(nonred,4)
	check(birth is Dictionary and birth.projectile_result.parryClass=="magic","preexisting_class_authority_magic")
	service.advance_source_frame(frame(4))
	check(service.snapshot().live==1 and service.snapshot().shots[0].raw.life==1.0,"nonred_near_camera_retained_at_life1")
	target.position=Vector2(3000,0)
	service.advance_source_frame(frame(5))
	check(service.snapshot().live==0 and service.snapshot().last_retired.reason=="camera_distance","source_camera_cull")
	target.position=Vector2(0,400)
	# Global 2/3 dropping is a real pool recycle, not a fake live node.
	var ordinary:=props.duplicate(true)
	ordinary.erase("_commit")
	ordinary.life=100.0
	ordinary.ml=100.0
	for id in [6,7,8]:
		birth=born(ordinary,id)
		check(birth is Dictionary and birth.ack,"source_drop_request_executed")
	check(service.snapshot().dropped==2 and service.snapshot().live==1 and service.read_drop_counter()==0,"global_drop_counter_keeps_only_third_actual_carrier")
	var bad: Dictionary=request({"mine":true},9)
	check(service._birth_request(bad)==null and service.snapshot().reason.begins_with("specialized_tick_owner_required"),"specialized_hazard_not_substituted")
	check(target.forbidden_calls==0,"all_protected_paths_untouched")
	scope.free()
	await process_frame
	print("DEMO35_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"actual_actor_births":12,"mock_birth_acks":0,"damage_parry_verified":false,"independent_scene":true}))
	quit(1 if failures else 0)
