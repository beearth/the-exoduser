extends RefCounted
## Test-only fresh P3 cohort after genuine Main boot; product owners stay intact.
static func install(main: Node) -> void:
 for old in [main.world.get_node("NativeSpawnHoleSystem"),main.get_node("NativeRegions")]:
  old.process_mode=Node.PROCESS_MODE_DISABLED
  old.name=String(old.name)+"ProductPreserved"
 # Retain the old scheduler node disabled; create a new cohort via public bind.
 main.native_natural_enemies.process_mode=Node.PROCESS_MODE_DISABLED
 main.native_natural_enemies=null
 main.world._native_natural_enemy_base=null
 main.native_demo_boss_projectiles._natural_source=null
 main.native_stage_spawn_adapter=null
 var holes=preload("res://scripts/native_spawn_hole_system.gd").new()
 holes.name="NativeSpawnHoleSystem"
 assert(holes.configure(main.world,main.player,main.source_state,main))
 main.world.add_child(holes)
 var regions=preload("res://scripts/native_regions.gd").new()
 regions.name="NativeRegions";main.add_child(regions)
 assert(regions.configure(main))
