extends SceneTree
## MAP11-16 actual Main render + real Player input walking; no combat completion.
const USERDIR="EXODUSER-map11-16b-Isolated-20261021"
var main: Node
var output: String=""
var failures: int=0
var checks: int=0
var results: Array=[]
var diagnostics: Dictionary={}
var intervals: Array[float]=[]
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("MAP11_16_FAIL ",label)
func settle(point: Vector2) -> void:
 main.player.global_position=point;main.player.reset_physics_interpolation()
 main.camera.global_position=point;main.camera.reset_smoothing();main.camera.reset_physics_interpolation()
 for i in range(35):await physics_frame
func capture(id: String) -> void:
 root.size=Vector2i(1600,900);root.content_scale_size=Vector2i(1600,900)
 DisplayServer.window_set_size(Vector2i(1600,900))
 for i in range(8):await process_frame
 root.grab_focus()
 await RenderingServer.frame_post_draw
 var image: Image=root.get_texture().get_image()
 check(image.get_size()==Vector2i(1600,900),id+" resolution")
 check(image.save_png(output.path_join(id+".png"))==OK,id+" saved")
 check(image.get_region(Rect2i(480,150,640,600)).save_png(output.path_join(id+"_1x.png"))==OK,id+" crop")
func _run() -> void:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--captures="):output=arg.trim_prefix("--captures=")
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolated user dir")
 check(not output.is_empty(),"output specified")
 if failures:quit(2);return
 root.grab_focus()
 root.size=Vector2i(1600,900);root.content_scale_size=Vector2i(1600,900)
 DisplayServer.window_set_size(Vector2i(1600,900));DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
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
 await capture("01_field")
 await settle(Vector2(-3150,-1050))
 await capture("02_outer_forest")
 await settle(Vector2(-850,-2400))
 check(scene.field_view.flesh_tree_instances>0,"Seedream trees installed")
 check(scene.field_view._surface.material.get_shader_parameter("ground").resource_path.ends_with("floor_fissure_seedream_tile.png"),"Seedream tile installed")
 diagnostics.field=diagnose(main.world.get_node("Map11ProductScene").field_view)
 if "--no-benchmark" not in OS.get_cmdline_user_args():results.append(await measure("field",Vector2(-850,-2400)))
 await settle(Vector2(0,-3500))
 check(main.native_map11.snapshot().space=="field","approach remains field")
 check(scene.field_view.gate_open>.95,"gate visual opens")
 await capture("03_boss_entrance")
 main.player.global_position=sites.field_gate.global_position
 for i in range(40):await physics_frame
 check(main.native_map11.snapshot().space=="arena","actual automatic gate entry")
 # Existing arena entry checked without extra capture.
 var arena_offset: Vector2=scene.arena_view.global_position
 await settle(arena_offset+Vector2(1400,80))
 var faded: int=0
 for row in scene.arena_view._rim_sprites:
  if row.sprite.modulate.a<.5:faded+=1
 check(faded>0,"actual Main actor fades wall forest")
 check(scene.arena_view.get_node_or_null("IrregularFissureDecals")!=null,"RGBA fissures present")
 # Existing arena wall checked without extra capture.
 diagnostics.arena=diagnose(main.world.get_node("Map11ProductScene").arena_view)
 if "--no-benchmark" not in OS.get_cmdline_user_args():results.append(await measure("arena",arena_offset+Vector2(1250,80)))
 if "--no-benchmark" in OS.get_cmdline_user_args():
  print("MAP11_16_CAPTURE_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"benchmark_repeated":false}));main.queue_free();quit(1 if failures else 0);return
 var evidence: Dictionary={"checks":checks,"failures":failures,"samples":results,"diagnostics":diagnostics,"capture_viewport":[1600,900],"benchmark_viewport":[1920,1080],"user_dir":OS.get_user_data_dir(),"renderer":RenderingServer.get_current_rendering_method(),"max_fps":Engine.max_fps,"physics_hz":Engine.physics_ticks_per_second,"actors":main.world.get_enemies().size(),"scope":"GUI real Player input left/down/right/up 150 ticks each; 600 physics ticks per space; no dense combat or Windows claim"}
 var f:=FileAccess.open(output.path_join("../verification.json").simplify_path(),FileAccess.WRITE);f.store_string(JSON.stringify(evidence,"  "));f.close()
 print("MAP11_16_RESULT ",JSON.stringify(evidence))
 main.queue_free()
 for i in range(16):await process_frame
 quit(1 if failures else 0)

func measure(space: String,origin: Vector2) -> Dictionary:
 root.grab_focus()
 root.size=Vector2i(1920,1080);root.content_scale_size=Vector2i(1920,1080)
 DisplayServer.window_set_size(Vector2i(1920,1080))
 await settle(origin)
 intervals.clear()
 var last: int=Time.get_ticks_usec()
 var start: int=last
 var frame_start: int=Engine.get_process_frames()
 var tick_start: int=Engine.get_physics_frames()
 var sample_frames: Array[float]=[]
 var sampler: Callable=func():
  var now: int=Time.get_ticks_usec()
  sample_frames.append(float(now)/1000.0)
 process_frame.connect(sampler)
 var actions: Array[String]=["move_left","move_down","move_right","move_up"]
 var corners: Array[Vector2]=[main.player.global_position]
 var input_ok: bool=true
 for action in actions:
  var event:=InputEventAction.new();event.action=action;event.pressed=true
  input_ok=input_ok and main.player.handle_native_input_event(event).get("accepted",false)
  for i in range(150):
   main.player.handle_native_input_event(event)
   await physics_frame
  event.pressed=false;main.player.handle_native_input_event(event)
  corners.append(main.player.global_position)
 print("BENCH_END ",space," wall_us=",Time.get_ticks_usec()-start)
 process_frame.disconnect(sampler)
 var elapsed: int=Time.get_ticks_usec()-start
 for i in range(1,sample_frames.size()):intervals.append(sample_frames[i]-sample_frames[i-1])
 intervals.sort()
 check(input_ok and corners[0].distance_to(corners[1])>200.0,space+" actual Player walking")
 return ({"space":space,"input_accepted":input_ok,"path_corners":str(corners),"walk_speed":main.player.get("_movement_speed"),"ticks":Engine.get_physics_frames()-tick_start,"wall_us":elapsed,"render_frames":Engine.get_process_frames()-frame_start,"mean_fps":(Engine.get_process_frames()-frame_start)*1000000.0/elapsed,"p95_ms":intervals[int(intervals.size()*.95)],"p99_ms":intervals[int(intervals.size()*.99)],"draw_calls":Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),"objects":Performance.get_monitor(Performance.RENDER_TOTAL_OBJECTS_IN_FRAME)})

# Setup/capture only. Never enumerate nodes or reflect methods in the tick path.
func diagnose(view: Node) -> Dictionary:
 var stack: Array[Node]=[view]
 var total: int=0;var visible: int=0;var overlap: float=0;var shaders: int=0
 var screen:=Rect2(Vector2.ZERO,Vector2(1920,1080))
 while not stack.is_empty():
  var node: Node=stack.pop_back()
  for child in node.get_children():stack.append(child)
  if not node is Sprite2D:continue
  total+=1
  var sprite: Sprite2D=node
  if not sprite.is_visible_in_tree():continue
  var local: Rect2=sprite.get_rect()
  var transform_: Transform2D=sprite.get_global_transform_with_canvas()
  var bounds:=Rect2(transform_*local.position,Vector2.ZERO)
  for corner in [local.position+Vector2(local.size.x,0),local.end,local.position+Vector2(0,local.size.y)]:bounds=bounds.expand(transform_*corner)
  var clipped: Rect2=bounds.intersection(screen)
  if not clipped.has_area():continue
  visible+=1;overlap+=clipped.get_area()/screen.get_area()
  if sprite.material is ShaderMaterial:shaders+=1
 return {"total_sprites":total,"onscreen_sprite_aabbs":visible,"onscreen_shader_sprites":shaders,"sprite_aabb_overdraw_upper_bound":overlap,"shoulders":view.get("shoulder_count"),"fissures":view.get("fissure_count"),"note":"AABB coverage upper bound includes transparent texels; not GPU fragment counter"}
