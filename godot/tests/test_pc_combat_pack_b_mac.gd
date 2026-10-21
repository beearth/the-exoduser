extends "res://tests/test_pc_combat_pack_b.gd"
## Mac fixture adapter. All PC test groups/assertions are inherited unchanged.
var fixture_seeded:=false
func _enemies_alive() -> Array:
 if not fixture_seeded and is_instance_valid(world) and is_instance_valid(main):
  fixture_seeded=true
  # The PC fixture expects initial etype0 owners. MAP11 deliberately boots empty.
  # Use the existing actual source constructor, not a fake HP/hurtE implementation.
  var sequence: Node=main.source_intro_sequence
  for i in range(8):
   var at: Vector2=world.get_start_position()+Vector2(-300+i*80,-300)
   if world.can_move(at,38):
    sequence._spawn_ring_enemy(100+i,at.x,at.y)
  forced+=8
 return super._enemies_alive()
func _wall_model(_center: Vector2,_radius: float) -> Dictionary:
 var provider: Node2D=world.map11_provider
 var field: RefCounted=provider.field
 var outer: Array=[]
 for p in field._outer:
  var at: Vector2=provider.to_global(p)
  outer.append([at.x,at.y])
 var solids: Array=[]
 for row in field._solids:
  if row.blocks_move:
   var at: Vector2=provider.to_global(row.center)
   solids.append([at.x,at.y,row.radius])
 return {"map11_outer":outer,"map11_solids":solids}
func _wall_model_matches(model: Dictionary,points: Array) -> bool:
 var polygon:=PackedVector2Array()
 for p in model.map11_outer:polygon.append(Vector2(p[0],p[1]))
 for pt in points:
  var inside: bool=Geometry2D.is_point_in_polygon(pt,polygon)
  for i in range(polygon.size()):
   if Geometry2D.get_closest_point_to_segment(pt,polygon[i],polygon[(i+1)%polygon.size()]).distance_squared_to(pt)<.001:inside=true
  var blocked: bool=not inside
  for row in model.map11_solids:
   if pt.distance_squared_to(Vector2(row[0],row[1]))<=row[2]*row[2]:blocked=true
  if blocked!=world.is_world_blocked(pt):return false
 return true
func _run_oracle(cases: Array, name: String) -> Dictionary:
 check(not node_bin.is_empty() and FileAccess.file_exists(node_bin), "explicit_node_bin")
 check(not source_path.is_empty() and FileAccess.file_exists(source_path), "explicit_source_game")
 var dir: String = artifacts_dir if not artifacts_dir.is_empty() else OS.get_user_data_dir()
 DirAccess.make_dir_recursive_absolute(dir)
 var scen: String = dir.path_join("pcb_scenario_" + name + ".json")
 var outp: String = dir.path_join("pcb_oracle_" + name + ".json")
 var f := FileAccess.open(scen, FileAccess.WRITE)
 f.store_string(JSON.stringify({"cases": cases}))
 f.close()
 var output: Array = []
 var code: int = OS.execute(node_bin, PackedStringArray([ProjectSettings.globalize_path("res://tests/mac_pcib_source_oracle.cjs"),
  source_path, scen, outp]), output, true)
 check(code == 0, "oracle_vm_exit0:" + name)
 var decoded: Variant = JSON.parse_string(FileAccess.get_file_as_string(outp))
 check(decoded is Dictionary and decoded.get("source_sha256") == GAME_SHA256, "oracle_utf8_payload_sha:" + name)
 var by: Dictionary = {}
 if decoded is Dictionary:
  for row in decoded.cases:
   by[row.name] = row
   check(not row.has("exception"), "oracle_case_no_exception:" + str(row.name) + ":" + str(row.get("exception", "")))
   check((row.get("errors", []) as Array).is_empty(), "oracle_rng_feed_consistent:" + str(row.name))
 return by

