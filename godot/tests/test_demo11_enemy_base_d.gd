extends "res://tests/test_demo11_etype_d_runtime.gd"
func run() -> void:
 check(OS.get_user_data_dir().ends_with("EXODUSER-demo11-enemy-base-Isolated-20261021"),"common migration isolation")
 await setup()
 var common: Node=main.native_natural_enemies
 check(is_instance_valid(common) and not common.scheduler_enabled,"D selected ingress keeps automatic scheduler HOLD")
 check(typed.size()==5 and common.counts.registered==5,"all D profiles admitted by the one common owner")
 for actor in typed:
  check(common.owns_actor(actor) and common.projectile_component(actor)==owner,"common registry identity retains D behavior owner "+str(actor.etype))
 for i in 2:await physics_frame
 var registry: Node=main.native_demo_boss_projectiles
 check(registry._natural_source.get_ref()==common and registry._d_active,"one common registry source clock")
 check(registry.birth_demo11_d(owner,{},owner.read_projectile_frame())==null,"legacy D raw entry cannot bypass common actor identity")
 check(owner.fire(typed[0]),"D projectile passes actual common birth admission")
 for i in 2:await physics_frame
 check(registry._entries.values().any(func(e):return e.get("D_owner")==owner and e.calls>0),"D lifecycle tag survives common Carrier tick")
 check(main.world._native_natural_enemy_base.get_ref()==common,"single World admission capability")
 typed[2].receive_damage(1,Vector2.RIGHT,"weapon",{"migration_unported_option":true})
 check(not common.emit_projectile(typed[2],{}).ready,"suspended type cannot bypass shared projectile admission")
 check(owner.fire(typed[0]),"suspension does not stop another profile")
 print("BASE_D_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skipped":[],"actual_D_profiles":typed.size(),"automatic_D_scheduler":"HOLD","type25_death":"HOLD_PC_prefix"}))
 main.free();quit(1 if failures else 0)
