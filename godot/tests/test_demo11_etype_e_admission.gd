extends SceneTree
const USERDIR="EXODUSER-demo11-etype-e-Isolated-20261021"
const Runtime=preload("res://scripts/native_type7_runtime.gd")
const Type3=preload("res://scripts/type3_native_binding.gd")
const HurtE=preload("res://scripts/native_normal_enemy_hurte.gd")
const Elite=preload("res://port_modules/elite_spawn_rules_source/producer.gd")
var assertions:=0
var failures:=0
func check(ok: bool,label: String) -> void:
 assertions+=1
 if not ok:failures+=1;print("ETYPE_E_FAIL ",label)
func _initialize() -> void:call_deferred("_run")
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolation")
 var main: Node=preload("res://scripts/main.gd").new();root.add_child(main)
 if not main.is_node_ready():await main.ready
 var world: Node=main.world
 var before: Dictionary=world.get_encounter_report()
 var metrics: Dictionary=world.get_native_runtime_snapshot()
 var actors: Array=world.get_enemies().duplicate()
 var source: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/encounters.json"))
 var original: Dictionary=source.duplicate(true)
 check(not source.records.any(func(row):return row.etype==3),"source initial16 has no type3: dynamic constructor/context needed, no copied initial position")
 var type3=Type3.new()
 check(type3.has_method("receive_damage"),"standalone legacy damage exists, not sufficient for natural hurtE admission")
 check(not type3.has_method("read_native_normal_enemy_hurte_fields"),"type3 missing actual PC hurtE field-owner interface")
 var rejected: Dictionary=HurtE.new().execute(main,world,type3,1,0.0,0,{"beam":true})
 check(not rejected.ok and rejected.reason=="hurte_opts_unsupported:beam","actual PC option rejection remains NOT_READY, not silently stripped")
 check(rejected.rng_draws.is_empty(),"option rejection consumes no RNG")
 type3.free()
 var emitter=preload("res://scripts/native_element_projectile_emitter.gd").new()
 check(emitter.configure(world,main.player),"actual six-element emitter available for preflight")
 world.add_child(emitter)
 var runtime=Runtime.new()
 # Only real available callbacks. Missing PC parry/FX/audio are not replaced by fixture callbacks.
 var services: Dictionary={"projectile_emitter":emitter,"summon_context":Callable(main.source_state,"read_current_p"),"type3_interfaces":{
 "native_random":Callable(world,"sample_native_random_unit"),"emit_charged_projectile":Callable(emitter,"emit"),
 "player_context":Callable(main.player,"get_snapshot"),"element_multiplier":Callable(main.player,"get_native_element_multiplier"),"is_tile_wall":Callable(world,"is_world_blocked")}}
 check(not runtime.configure(world,main.player,services),"type7 cannot bypass missing real M29 service")
 check(runtime.get_last_error()=="missing_actual_type3_handle_m29_parry","exact missing PC M29 callable")
 check(runtime.get_snapshot().installed==0 and runtime.get_snapshot().prepared==0,"type7 preflight creates/registers no actor/helper")
 check(before.records[3].status=="unsupported" and before.records[2].status=="unsupported","exact type7/guard source still explicitly unsupported")
 check(not ResourceLoader.exists("res://scripts/enemy_type29_gate_guard.gd"),"no existing type29 natural attack/death consumer to register")
 check(not ResourceLoader.exists("res://port_modules/etype29_gate_attack_source/producer.gd") and not ResourceLoader.exists("res://port_modules/etype29_gate_death_source/producer.gd"),"planned guard attack/death modules remain absent")
 var null_guard: Dictionary=Elite.apply_forced_constructor(null,"gate_guard")
 check(null_guard.status=="NOT_READY" and null_guard.reason=="source_null_postassignment_would_throw","forced postprocess does not fabricate a constructor")
 check(main.native_demo_encounter.snapshot().phase=="field","37 gate never opened by failed preflight")
 check(world.get_encounter_report()==before and world.get_enemies()==actors,"all failed gates preserve actual registry/report")
 var after: Dictionary=world.get_native_runtime_snapshot()
 check(after.random_draw_count==metrics.random_draw_count and after.dynamic_spawn_count==metrics.dynamic_spawn_count and after.initial_install_revision==metrics.initial_install_revision,"no RNG/spawn/install prefix on rejection")
 check(source==original,"raw source immutable")
 runtime.free();emitter.free();main.free()
 print("ETYPE_E_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"status":"BLOCKED","etypes":{"3":"NOT_READY_PC_hurtE_owner","7":"NOT_READY_PC_M29","29":"NOT_READY_constructor_attack_death_gate_owner"},"natural_spawn_count":0,"three_actor_benchmark":"NOT_READY_not_executed","skipped":[]}))
 quit(1 if failures else 0)
