extends "res://tests/capture_map11_32c.gd"
## Isolated before/after render QA; no product camera/scale or combat edits.
var tag: String="before"
var receipts: Dictionary={}
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-SHARP-01-Isolated":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
  if arg.begins_with("--tag="):tag=arg.trim_prefix("--tag=")
 if output.is_empty():quit(3);return
 for i in range(10):await process_frame
 receipts["startup_display"]=_display_info()
 root.size=Vector2i(1920,1080);root.content_scale_size=Vector2i(1920,1080)
 DisplayServer.window_set_size(Vector2i(1920,1080))
 OS.low_processor_usage_mode=false;Engine.max_fps=240
 DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 scene.activate_space("field")
 await settle(Vector2(0,3700))
 for i in range(300):await physics_frame
 if "--benchmark-only" in OS.get_cmdline_user_args():
  DisplayServer.window_set_title("지옥의 길 · 썩은 숲 입구")
  DisplayServer.window_move_to_foreground()
  var ready:=FileAccess.open(output.path_join("../focus-ready.txt"),FileAccess.WRITE)
  ready.store_string(str(OS.get_process_id()));ready.close()
  var deadline: int=Time.get_ticks_msec()+60000
  while not DisplayServer.window_is_focused() and Time.get_ticks_msec()<deadline:await process_frame
  if not DisplayServer.window_is_focused():
   var failed:=FileAccess.open(output.path_join("../focus-unavailable.txt"),FileAccess.WRITE)
   failed.store_string("No sample started: focused window unavailable");quit(4);return
  RenderingServer.viewport_set_measure_render_time(root.get_viewport_rid(),true)
  var row: Dictionary=await _measure_native("field",Vector2(0,3650))
  var f:=FileAccess.open(output.path_join("../performance.json"),FileAccess.WRITE)
  f.store_string(JSON.stringify({"sample":row,"video_mem_bytes":Performance.get_monitor(Performance.RENDER_VIDEO_MEM_USED),"render_cpu_ms":RenderingServer.viewport_get_measured_render_time_cpu(root.get_viewport_rid()),"render_gpu_ms":RenderingServer.viewport_get_measured_render_time_gpu(root.get_viewport_rid()),"display":_display_info(),"renderer":RenderingServer.get_current_rendering_method(),"adapter":RenderingServer.get_video_adapter_name(),"attempts":1,"isolated":OS.get_user_data_dir()},"  "))
 else:
  main.process_mode=Node.PROCESS_MODE_DISABLED
  _fixed_actor()
  receipts["start"]=_scene_info(scene)
  await _capture_sharp("start")
  main.process_mode=Node.PROCESS_MODE_INHERIT
  scene.activate_space("arena")
  await settle(scene.arena_view.global_position+Vector2(0,800))
  for i in range(100):await physics_frame
  main.process_mode=Node.PROCESS_MODE_DISABLED
  _fixed_actor()
  var fixture: Node2D=scene.get_node("Boss11SceneActor")
  fixture.set_process(false);fixture.show();fixture.global_position=scene.arena_view.global_position
  fixture.z_as_relative=false;fixture.z_index=int(fixture.global_position.y/4.0)
  receipts["arena_entry"]=_scene_info(scene)
  await _capture_sharp("arena_entry")
  root.size=Vector2i(2560,1440);DisplayServer.window_set_size(root.size)
  for i in range(12):await process_frame
  receipts["large_window_display"]=_display_info()
  var f:=FileAccess.open(output.path_join("receipt.json"),FileAccess.WRITE)
  f.store_string(JSON.stringify(receipts,"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0)
func _fixed_actor() -> void:
 var sprite: AnimatedSprite2D=main.player._sprite
 if sprite.sprite_frames.has_animation("idle_south"):sprite.animation="idle_south"
 sprite.frame=0;sprite.stop()
func _capture_sharp(id: String) -> void:
 for i in range(12):await process_frame
 await RenderingServer.frame_post_draw
 var im: Image=root.get_texture().get_image()
 if im.get_size()!=Vector2i(1920,1080):quit(5);return
 im.save_png(output.path_join(id+".png"))
func _display_info() -> Dictionary:
 var screen: int=DisplayServer.window_get_current_screen()
 var keys=["display/window/dpi/allow_hidpi","display/window/stretch/mode","display/window/stretch/aspect","display/window/stretch/scale","display/window/stretch/scale_mode","rendering/textures/canvas_textures/default_texture_filter","rendering/2d/snap/snap_2d_transforms_to_pixel","rendering/2d/snap/snap_2d_vertices_to_pixel"]
 var values: Dictionary={}
 for key in keys:values[key]=ProjectSettings.get_setting(key)
 return {"settings":values,"screen_size":str(DisplayServer.screen_get_size(screen)),"screen_scale":DisplayServer.screen_get_scale(screen),"screen_dpi":DisplayServer.screen_get_dpi(screen),"window_size":str(DisplayServer.window_get_size()),"root_size":str(root.size),"root_texture_size":str(root.get_texture().get_size()),"framebuffer_image_size":str(root.get_texture().get_image().get_size()),"viewport_visible_rect":str(root.get_visible_rect()),"content_scale_size":str(root.content_scale_size),"content_scale_mode":root.content_scale_mode,"content_scale_factor":root.content_scale_factor,"screen_transform":str(root.get_screen_transform())}
func _scene_info(scene: Node) -> Dictionary:
 var sprites: Array=[]
 _inspect(scene.field_view.target32,sprites)
 _inspect(scene.arena_view,sprites)
 _inspect(main.player,sprites)
 return {"display":_display_info(),"camera_center":str(main.camera.get_screen_center_position()),"camera_position":str(main.camera.global_position),"camera_zoom":str(main.camera.zoom),"camera_offset":str(main.camera.offset),"player":str(main.player.global_position),"player_scale":str(main.player._sprite.scale),"field_transform":str(scene.field_view.get_global_transform_with_canvas()),"arena_transform":str(scene.arena_view.get_global_transform_with_canvas()),"textures":sprites,"scope":"actual Main frozen after normal camera arrival; source idle boss presentation fixture, no boss combat"}
func _inspect(node: Node,rows_: Array) -> void:
 var texture_: Texture2D
 if node is Sprite2D:texture_=node.texture
 elif node is AnimatedSprite2D and node.sprite_frames!=null:texture_=node.sprite_frames.get_frame_texture(node.animation,node.frame)
 if texture_!=null:
  var source: Texture2D=texture_
  if source is CanvasTexture:source=source.diffuse_texture
  if source is AtlasTexture:source=source.atlas
  var matrix: Transform2D=node.get_global_transform_with_canvas()
  rows_.append({"node":str(node.name),"texture":source.resource_path,"texture_size":str(texture_.get_size()),"source_size":str(source.get_size()),"filter":node.texture_filter,"screen_pixel_per_texel":str(matrix.get_scale()),"visible":node.is_visible_in_tree(),"position":str(matrix.origin)})
 for child in node.get_children():_inspect(child,rows_)

# Same 600-tick input sampler at native 2560x1440, logical FOV1920x1080.
func _measure_native(space: String,origin: Vector2) -> Dictionary:
 root.grab_focus()
 root.size=Vector2i(2560,1440);root.content_scale_size=Vector2i(1920,1080)
 DisplayServer.window_set_size(Vector2i(2560,1440))
 await settle(origin)
 intervals.clear()
 var last: int=Time.get_ticks_usec()
 var start: int=last
 var frame_start: int=Engine.get_process_frames()
 var tick_start: int=Engine.get_physics_frames()
 var sample_frames: Array[float]=[]
 var focus_lost: Array[int]=[]
 DisplayServer.window_move_to_foreground()
 for i in range(30):await process_frame
 var sampler: Callable=func():
  if not DisplayServer.window_is_focused():focus_lost.append(Engine.get_process_frames())
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

 var walk_distance: float=0.0
 for i in range(1,corners.size()):walk_distance+=corners[i-1].distance_to(corners[i])
 return ({"walk_distance":walk_distance,"product_space":main.native_map11.snapshot().space,"valid":focus_lost.is_empty(),"focus_lost_frames":focus_lost.size(),"space":space,"input_accepted":input_ok,"path_corners":str(corners),"walk_speed":main.player.get("_movement_speed"),"ticks":Engine.get_physics_frames()-tick_start,"wall_us":elapsed,"render_frames":Engine.get_process_frames()-frame_start,"mean_fps":(Engine.get_process_frames()-frame_start)*1000000.0/elapsed,"p95_ms":intervals[int(intervals.size()*.95)],"p99_ms":intervals[int(intervals.size()*.99)],"draw_calls":Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),"objects":Performance.get_monitor(Performance.RENDER_TOTAL_OBJECTS_IN_FRAME)})
