extends SceneTree
## MAP11-20 actual Main render + real Player input walking; no combat completion.
const USERDIR="EXODUSER-map11-20-Isolated-20261021"
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
 if not ok:failures+=1;print("MAP11_20_FAIL ",label)
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
 # Previous render/transition/occlusion QA is recorded in after-preview.log.
 # This final run captures the refined profile and measures each space once.
 var scene: Node=main.world.get_node("Map11ProductScene")
 var sites: Dictionary=main.read_native_map11_provider().transition_sites()
 if "--benchmark-only" not in OS.get_cmdline_user_args():
  await settle(Vector2(-850,-2400));await capture("01_field")
  await settle(Vector2(-3150,-1050));await capture("02_outer_forest")
  await settle(Vector2(0,-3500));await capture("03_boss_entrance")
 if "--benchmark-only" not in OS.get_cmdline_user_args():
  var detail_: Node=scene.get_node("MAP11Detail")
  var prop: Node2D=detail_.hell_props[0]
  await settle(prop.global_position+Vector2(0,-40));await capture("04_occlusion_behind")
  check(main.player.z_index<prop.z_index,"player behind prop depth")
  await settle(prop.global_position+Vector2(0,35));await capture("05_occlusion_front")
  check(main.player.z_index>prop.z_index,"player in front prop depth")
 if "--no-benchmark" not in OS.get_cmdline_user_args():
  results.append(await measure("field",Vector2(-850,-2400)))
  main.player.global_position=sites.field_gate.global_position
  for i in range(40):await physics_frame
  check(main.native_map11.snapshot().space=="arena","automatic arena entry")
  results.append(await measure("arena",scene.arena_view.global_position+Vector2(1250,80)))
 # Each requested space is independently below the 120 Hz frame budget.
 for result in results:check(result.p95_ms<=8.33,result.space+" p95 within 8.33ms")
 var light_rows: Array=[]
 for row in scene.lighting_look.pools:
  light_rows.append({"id":str(row.node.name),"position":str(row.node.global_position),"radius":row.radius,"energy":row.energy})
 var detail: Node=scene.get_node("MAP11Detail")
 var patch_count: int=0
 for child in scene.field_view.get_children():
  if str(child.name).begins_with("FloorPatch"):
   patch_count+=1
   check(child.z_index==-2986 and child.texture_filter==CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS,"patch ground layer and mip filter")
 check(patch_count==12,"twelve authored patches")
 check(detail.hell_props.size()==8,"three pyramids four corpses one pit")
 for i in range(detail.hell_props.size()):
  var prop: Node2D=detail.hell_props[i]
  var sprite: Sprite2D=prop.get_child(0)
  check(prop.z_index==int(prop.position.y/4.0) and not prop.z_as_relative,"static foot follows actor y/4")
  check(sprite.texture_filter==CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS,"prop mip filter")
  var height_: float=sprite.texture.get_height()*sprite.scale.y
  check(height_>=62.4*1.5 and height_<=62.4*3.0,"prop 1.5 to 3 body48 heights")
 check(detail.decorated>=60,"cluster decorations built")
 check(main.player._sprite.material==detail.material_,"shared player rim material")
 check(detail.outlined>=2,"enemy rim mounted")
 diagnostics.decorations=detail.decorated;diagnostics.outlined=detail.outlined
 diagnostics.lights=light_rows
 diagnostics.light_cap=5
 check(scene.lighting_look.pools.size()==8,"bounded authored lights")
 check(main.world.get_node_or_null("NativeMapLook")==null,"no duplicate generic ambient")
 var evidence: Dictionary={"checks":checks,"failures":failures,"samples":results,"diagnostics":diagnostics,"capture_viewport":[1600,900],"benchmark_viewport":[1920,1080],"user_dir":OS.get_user_data_dir(),"renderer":RenderingServer.get_current_rendering_method(),"max_fps":Engine.max_fps,"physics_hz":Engine.physics_ticks_per_second,"actors":main.world.get_enemies().size(),"scope":"GUI real Player input left/down/right/up 150 ticks each; 600 physics ticks per space; no dense combat or Windows claim"}
 var f:=FileAccess.open(output.path_join("../verification.json").simplify_path(),FileAccess.WRITE);f.store_string(JSON.stringify(evidence,"  "));f.close()
 print("MAP11_20_RESULT ",JSON.stringify(evidence))
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
