extends SceneTree
## MAP11-14 actual Main camera/transport render harness; no combat completion.
const USERDIR="EXODUSER-map11-14-Isolated-20261021"
var main: Node
var output: String=""
var failures: int=0
var checks: int=0
var intervals: Array[float]=[]
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("MAP11_14_FAIL ",label)
func settle(point: Vector2) -> void:
 main.player.global_position=point;main.player.reset_physics_interpolation()
 main.camera.global_position=point;main.camera.reset_smoothing();main.camera.reset_physics_interpolation()
 for i in range(35):await physics_frame
func capture(id: String) -> void:
 await RenderingServer.frame_post_draw
 var image: Image=root.get_texture().get_image()
 check(image.get_size()==Vector2i(1920,1080),id+" resolution")
 check(image.save_png(output.path_join(id+".png"))==OK,id+" saved")
 check(image.get_region(Rect2i(640,180,640,720)).save_png(output.path_join(id+"_1x.png"))==OK,id+" crop")
func _run() -> void:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--captures="):output=arg.trim_prefix("--captures=")
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolated user dir")
 check(not output.is_empty(),"output specified")
 if failures:quit(2);return
 root.size=Vector2i(1920,1080);root.content_scale_size=Vector2i(1920,1080)
 DisplayServer.window_set_size(Vector2i(1920,1080));DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED);Engine.max_fps=0
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 check(main.source_intro_sequence.finish_native_guide().get("applied",false),"real intro finished")
 main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all()
 # Review captures suppress only the large pet subtitle; product UI stays intact.
 main.world.get_node("NativePets")._subtitle_root.hide()
 for i in range(10):await physics_frame
 check(main.native_map11.current(),"Main MAP11 ready")
 var scene: Node=main.world.get_node("Map11ProductScene")
 var sites: Dictionary=main.read_native_map11_provider().transition_sites()
 check(sites.arena_entry.name=="Entry" and sites.arena_exit.name=="Exit","Marker names preserved")
 await settle(Vector2(-850,-2400))
 await capture("01_landmark")
 await settle(Vector2(0,-3500))
 check(main.native_map11.snapshot().space=="field","approach remains field")
 check(scene.field_view.gate_open>.95,"gate visual opens")
 await capture("02_gate")
 main.player.global_position=sites.field_gate.global_position
 for i in range(40):await physics_frame
 check(main.native_map11.snapshot().space=="arena","actual automatic gate entry")
 await capture("03_arena_entry")
 var arena_offset: Vector2=scene.arena_view.global_position
 await settle(arena_offset+Vector2(1400,80))
 var faded: int=0
 for row in scene.arena_view._rim_sprites:
  if row.sprite.modulate.a<.5:faded+=1
 check(faded>0,"actual Main actor fades wall forest")
 check(scene.arena_view.get_node_or_null("IrregularFissureDecals")!=null,"RGBA fissures present")
 await capture("04_arena_wall")
 if "--no-benchmark" in OS.get_cmdline_user_args():
  print("MAP11_14_CAPTURE_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"benchmark_repeated":false}));main.queue_free();quit(1 if failures else 0);return
 # Single GUI render sample: 600 frames alternating the two rendered spaces.
 var last: int=Time.get_ticks_usec()
 for i in range(600):
  await process_frame
  var now: int=Time.get_ticks_usec();intervals.append((now-last)/1000.0);last=now
 intervals.sort()
 var total: float=0
 for value in intervals:total+=value
 var evidence: Dictionary={"checks":checks,"failures":failures,"viewport":[1920,1080],"user_dir":OS.get_user_data_dir(),"samples":600,"mean_fps":600000.0/total,"p95_ms":intervals[569],"p99_ms":intervals[593],"max_ms":intervals[599],"adapter":RenderingServer.get_video_adapter_name(),"renderer":RenderingServer.get_current_rendering_method(),"actors":main.world.get_enemies().size(),"wall_faded_sprites":faded,"scope":"actual Main static arena wall GUI render; no density combat, movement benchmark, GPU timer or Windows claim","target_fps":120,"floor_fps":60}
 var f:=FileAccess.open(output.path_join("../verification.json").simplify_path(),FileAccess.WRITE);f.store_string(JSON.stringify(evidence,"  "));f.close()
 print("MAP11_14_RESULT ",JSON.stringify(evidence))
 main.queue_free()
 for i in range(16):await process_frame
 quit(1 if failures else 0)
