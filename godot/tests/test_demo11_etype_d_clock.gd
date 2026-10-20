extends "res://tests/test_demo11_etype_d_runtime.gd"
func run() -> void:
 await setup()
 if typed.size()!=5:main.free();quit(1);return
 await physics_frame
 var registry: Node=main.native_demo_boss_projectiles
 var a: Node=typed[0]
 check(owner.fire(a),"actual D-owned registry birth")
 await physics_frame;await physics_frame
 check(registry.snapshot().live>0 and registry._d_active,"single actual D clock active")
 var motion: int=registry.snapshot().motion_ticks
 var frame: Dictionary=owner.read_projectile_frame()
 check(not registry.advance_source_frame(frame) and registry.snapshot().motion_ticks==motion,"same epoch never double advances")
 main.source_state.read_current_g()._bossArena=true
 await physics_frame;await physics_frame
 check(not registry._d_active and registry.snapshot().live==0 and registry._serial==-1,"arena releases only D shots and clock for boss")
 main.source_state.read_current_g()._bossArena=false
 await physics_frame
 check(registry._d_active and owner.fire(a),"source can resume from native World frame")
 a.receive_damage(1,Vector2.RIGHT,"weapon",{"unported_D_clock_option":true})
 check(not a.read_native_normal_enemy_hurte_fields(main.world).ready and typed[1].read_native_normal_enemy_hurte_fields(main.world).ready,"direct PC field reader also respects type-local suspension")
 check(not owner.fire(a),"suspended type cannot bypass projectile entry")
 print("D_CLOCK_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skipped":[],"actual_D_actors":typed.size()}))
 main.free();quit(1 if failures else 0)
