extends SceneTree
const USERDIR := "EXODUSER-map11-prod-Isolated-20261021"
func _initialize() -> void:call_deferred("_run")
func _run() -> void:
 if OS.get_user_data_dir().get_file()!=USERDIR:quit(2);return
 Engine.physics_ticks_per_second=120;Engine.max_fps=0
 var main: Node=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main);current_scene=main
 if not main.source_intro_sequence.finish_native_guide().get("applied",false):quit(6);return
 var lesson: Node=main.source_intro_sequence.lesson_flow
 var deadline: int=Time.get_ticks_msec()+10000
 while not lesson.active and Time.get_ticks_msec()<deadline:await process_frame
 if not lesson.active:quit(7);return
 lesson.skip_all()
 Engine.max_fps=0
 for i in 120:await physics_frame
 if not is_instance_valid(main.read_native_map11_provider()):quit(3);return
 if not main.source_initialization_services.is_native_main_random_bridge_current(main,main.world):quit(5);return
 var rows: Array=[]
 for space in ["field","arena"]:
  if space=="arena":
   main.player.global_position=main.read_native_map11_provider().transition_sites().field_gate.global_position
   var receipt: Dictionary=main.request_native_map11_transition("enter")
   print("MAP11_PROD_TRANSITION ",JSON.stringify(receipt))
   for i in 3:await physics_frame
   if main.native_map11.snapshot().space!="arena":
    print("MAP11_PROD_BENCH ",JSON.stringify({"samples":rows,"status":"NOT_READY","transition":receipt,"arena_measured":false}))
    main.queue_free()
    for i in 16:await process_frame
    await create_timer(.2).timeout
    quit(4);return
  for i in 30:await physics_frame
  var ticks: int=Engine.get_physics_frames();var start: int=Time.get_ticks_usec()
  var intervals: Array[int]=[]
  var previous: int=start
  for i in 600:
   await physics_frame
   var now: int=Time.get_ticks_usec()
   intervals.append(now-previous);previous=now
  var elapsed: int=Time.get_ticks_usec()-start
  intervals.sort()
  rows.append({"p95_wall_ms":intervals[569]/1000.0,"p95_within_budget":intervals[569]<=1000000.0/120,"space":space,"actor_count":main.world.get_enemies().size(),"ticks":Engine.get_physics_frames()-ticks,"wall_us":elapsed,"mean_wall_ms":elapsed/600000.0,"budget_120fps_ms":1000.0/120,"within_cpu_budget":elapsed/600000.0<=1000.0/120})
  print("MAP11_PROD_BENCH_ROW ",JSON.stringify(rows.back()))
 main.queue_free()
 for i in 16:await process_frame
 await create_timer(.2).timeout
 print("MAP11_PROD_BENCH ",JSON.stringify({"samples":rows,"physics_hz":120,"fixed_fps":120,"scope":"actual Main after product intro; sampled actor_count recorded separately; headless wall clock; no GPU/full-combat 120fps claim"}))
 quit(0)
