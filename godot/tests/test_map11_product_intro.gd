extends SceneTree
const USERDIR := "EXODUSER-map11-prod-Isolated-20261021"
var checks:=0
var failures:=0
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("MAP11_INTRO_FAIL ",label)
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"actual namespace")
 if failures:quit(1);return
 var main: Node=load("res://scenes/main.tscn").instantiate()
 main.set_meta("native_intro_boot","intro");root.add_child(main)
 for i in 8:await physics_frame
 check(is_instance_valid(main.native_map11) and main.native_map11.current(),"actual product provider loaded in real intro mode")
 check(is_instance_valid(main.source_intro_sequence),"actual sequence installed")
 var sequence: Node=main.source_intro_sequence
 check(sequence.get_snapshot().phase=="guide","real startup entered guide")
 var provider: Node=main.read_native_map11_provider()
 var start: Vector2=provider.anchors("player_start")[0].marker.global_position
 check(main.player.global_position==start,"actual intro preserves Start Marker")
 check(not main.source_state.read_current_g().on,"guide correctly blocks game before open")
 var opened: Dictionary=sequence.finish_native_guide()
 check(opened.applied,"real public guide skip/open event")
 check(main.source_state.read_current_g().on,"actual State game on after guide")
 check(main.player.global_position==start,"field active at actual Start Marker")
 check(main.source_initialization_services.is_native_main_random_bridge_current(main,main.world),"protected bridge remains admitted in real intro")
 var positions: Array=[]
 for enemy in main.world.get_enemies():
  check(main.world.can_move(enemy.global_position,10),"actual source intro spawn passes same provider source clearance")
  positions.append(str(enemy.global_position))
 var snap: Dictionary=sequence.get_snapshot()
 main.queue_free()
 for i in 20:await process_frame
 await create_timer(.2).timeout
 print("MAP11_INTRO_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"guide_open":opened,"intro_positions":positions,"sequence":snap,"scope":"actual Main explicit product intro mode; source-relative intro ring, not DEMO11-43 Marker spawns; manual UI not claimed"}))
 quit(1 if failures else 0)
