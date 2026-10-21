extends SceneTree
const USERDIR := "EXODUSER-map11-prod-Isolated-20261021"
var checks:=0
var failures:=0
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("MAP11_PROD_FAIL ",label)
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated userdir")
 if failures:quit(1);return
 var main: Node=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 for i in 8:await physics_frame
 check(is_instance_valid(main.player) and is_instance_valid(main.camera),"actual Main new run boot")
 var p: Node=main.read_native_map11_provider()
 check(is_instance_valid(p) and p.runtime_ready(),"actual Main provider ready")
 if not is_instance_valid(p):main.queue_free();await process_frame;quit(1);return
 check(main.world.get_script()==load("res://scripts/world.gd"),"exact protected World identity preserved")
 check(main.source_initialization_services.is_native_main_random_bridge_current(main,main.world),"actual protected RNG bridge admitted")
 var start: Marker2D=p.anchors("player_start")[0].marker
 check(main.player.global_position==start.global_position,"fresh actor at actual Start Marker")
 check(main.world.get_start_position()==start.global_position,"World start authority")
 check(p.anchors("*").size()==22 and p.anchors("hole").size()==4,"contract22Markers4holes")
 check(main.world.get_enemies().is_empty(),"no legacy coordinate encounters on MAP11")
 check(main.has_node("NativeRegions") and main.world.has_node("NativeSpawnHoleSystem"),"MAP11 combat owners installed")
 check(main.native_demo_encounter.snapshot().provider_bound,"actual encounter provider bound")
 check(main.native_map11.snapshot().gate_owner_bound,"default combat gate owner bound")
 var sites: Dictionary=p.transition_sites()
 var p_before: Dictionary=main.source_state.read_current_p().duplicate(true)
 check(main.request_native_map11_transition("enter").reason=="not_at_gate","remote gate denied")
 check(main.world.can_move(start.global_position,15),"field spatial query")
 check(not main.world.can_move(Vector2(-1800,-550),15),"field solid actual World query")
 check(not main.world.has_line_of_sight(Vector2(-2700,-550),Vector2(-900,-550)),"actual World solid LOS")
 # Walk the provider's authored marker route; each step is swept by same provider.
 var route: Array=["early","main","landmark","landmark_east","late","gate"]
 var last: Vector2=start.global_position
 for suffix in route:
  var marker: Marker2D
  for row in p.anchors("*"):
   if row.id=="map11.field."+suffix:marker=row.marker
  check(is_instance_valid(marker),"route Marker "+suffix)
  var target: Vector2=marker.global_position
  check(p.sweep_fraction(last,target,15,"field")==1.0,"authored swept route "+suffix)
  main.player.global_position=target;last=target
 var field_before: Vector2=main.player.global_position
 var camera_before: Vector2=main.camera.global_position
 var enter: Dictionary=main.request_native_map11_transition("enter")
 var g: Dictionary=main.source_state.read_current_g()
 print("MAP11_DEFAULT_GATE ",JSON.stringify({"entry":enter,"encounter":main.native_demo_encounter.snapshot(),"anglers":main.native_demo_anglers.snapshot(),"bossUnlocked":g.get("_bossUnlocked",false),"fbDone":g.get("_fbDone",false),"product_space":main.native_map11.snapshot().space}))
 check(enter.get("status")=="NOT_READY","fresh default gate preserves combat prerequisites")
 check(main.player.global_position==field_before and main.camera.global_position==camera_before and not g.get("_bossArena",false),"denied gate preserves Player camera State")
 # Separate transport fixture: no combat unlock, completion or E2E claim.
 var transport: Node=preload("res://tests/map11_transport_fixture.gd").install(main)
 check(is_instance_valid(transport),"explicit map-only transport fixture")
 enter=main.request_native_map11_transition("enter")
 check(enter.get("status")=="READY" and enter.get("space")=="arena","map-only actual gate transport")
 check(main.player.global_position==sites.arena_entry.global_position,"actual Player at arena Entry Marker")
 check(main.camera.global_position==sites.arena_entry.global_position,"actual camera follows transition")
 check(g.get("_bossArena",false)==true and g.get("mw")==128 and g.get("mh")==108,"source arena flag + gameplay extent128x108")
 check(transport.snapshot().space=="arena","authoritative product space arena")
 check(main.source_state.read_current_p().hp==p_before.hp,"transport does not refill HP")
 check(main.world.can_move(sites.boss.global_position,15),"actual arena query")
 check(not main.world.can_move(sites.boss.global_position+Vector2(1750,0),15),"actual arena boundary")
 main.player.global_position=sites.arena_exit.global_position
 check(main.request_native_map11_transition("leave").status=="NOT_READY","PC pending prevents early boss exit")
 check(main.player.global_position==sites.arena_exit.global_position and g._bossArena,"pending exit preserves actor and State")
 # Fail closed on provider retirement. No world/camera/State half-transition.
 main.player.global_position=sites.field_gate.global_position
 var before: Vector2=main.player.global_position;p.retire()
 check(main.request_native_map11_transition("enter").status=="NOT_READY","retired provider gate denied")
 check(main.player.global_position==before,"retired provider preserves actor")
 main.queue_free()
 for i in 16:await process_frame
 await create_timer(.2).timeout
 print("MAP11_PROD_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"production_gate":"NOT_READY_PC_fieldboss","path":"actual Main default gate denial; separate map-only transport fixture→arena Entry; exit pending PC completion","manual_play":false}))
 quit(1 if failures else 0)
