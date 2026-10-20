extends "res://tests/test_demo11_43_stage_spawn_adapter.gd"
const B = preload("res://scripts/native_demo11_etype_b_preflight.gd")
const B_USERDIR = "EXODUSER-demo11-etype-b-Isolated-20261021"
func run() -> void:
 check(OS.get_user_data_dir().ends_with(B_USERDIR),"B isolation")
 var main = load("res://scenes/main.tscn").instantiate()
 root.add_child(main)
 await physics_frame
 var subject = B.new()
 check(subject.inspect(main,"B",{}).reason=="actual_MAP11_adapter_not_current","no legacy coordinate fallback")
 var provider = Provider.new()
 main.world.add_child(provider)
 var marker = Marker2D.new()
 provider.add_child(marker)
 marker.position = Vector2(510,620) # fixture authoring, NOT an accepted MAP11 product map
 provider.rows.append({"id":"B-marker","marker":marker,"region_id":0,"size":0.3,"room":0})
 provider.groups.append({"hole_id":"B-marker","spawn_group_id":"B","region_id":0,"total":8})
 check(main.bind_native_spawn_stage_provider(provider).ready,"actual DEMO43 adapter binding")
 var before: int = main.world.get_enemies().size()
 var current_g: Dictionary = main.source_state.read_current_g()
 var total: Variant = current_g._totalSpawned
 var r: Dictionary = subject.inspect(main,"B",{8:10.0,9:10.0,10:10.0,11:10.0,12:10.0})
 check(r.rows.size()==5 and not r.ready,"all five inspected, no false activation")
 for i in range(5):
  var row: Dictionary = r.rows[i]
  check(row.etype==8+i and row.unit=="DEMO11-"+str(58+i),"unit identity "+str(i))
  check(row.site_ready and row.site.site_id=="B-marker","adapter Marker candidate "+str(i))
  check(row.site.position==marker.global_position+Vector2(10,0),"provider receipt only "+str(i))
  check(row.status=="NOT_READY" and row.factory_reason=="native_type_ai_not_ported" and not row.actor_registered and row.extension_registered,"legacy factory unchanged / B extension present "+str(i))
 check(main.world.get_enemies().size()==before and current_g._totalSpawned==total,"no actor/denominator fabrication")
 var bad: Dictionary = subject.inspect(main,"B",{8:-1,9:10.0,10:10.0,11:10.0,12:10.0})
 check(not bad.rows[0].site_ready and bad.rows[1].site_ready and bad.rows.size()==5,"one rejection continues next species")
 provider.revision="stale"
 check(subject.inspect(main,"B",{}).reason=="actual_MAP11_adapter_not_current","stale stage rejected")
 print("ETYPE_B_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"rows":r.rows,"actual_etype_spawns":0,"scope":"preflight_only_not_combat"}))
 main.free()
 await process_frame
 quit(0 if failures==0 else 1)
