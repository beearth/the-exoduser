extends "res://tests/benchmark_map11_21.gd"
## Actual Main, untouched field camera and actor scale, isolated storage only.
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-MAP11-32-Isolated":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
 if output.is_empty():quit(3);return
 OS.low_processor_usage_mode=false;Engine.max_fps=240
 DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 DisplayServer.window_set_title("지옥의 길 · 썩은 숲 입구")
 root.size=Vector2i(1920,1080);root.content_scale_size=root.size;DisplayServer.window_set_size(root.size)
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 scene.activate_space("field")
 await settle(Vector2(0,3700))
 for i in range(300):await physics_frame
 if "--benchmark-only" in OS.get_cmdline_user_args():
  DisplayServer.window_move_to_foreground()
  var ready:=FileAccess.open(output.path_join("../focus-ready.txt"),FileAccess.WRITE)
  ready.store_string(str(OS.get_process_id()));ready.close()
  var deadline: int=Time.get_ticks_msec()+60000
  while not DisplayServer.window_is_focused() and Time.get_ticks_msec()<deadline:await process_frame
  if not DisplayServer.window_is_focused():quit(4);return
  var result: Dictionary=await _measure_attempt("field",Vector2(0,3650))
  var f:=FileAccess.open(output.path_join("../performance.json"),FileAccess.WRITE)
  f.store_string(JSON.stringify({"sample":result,"attempts":1,"viewport":[1920,1080],"user_dir":OS.get_user_data_dir(),"adapter":RenderingServer.get_video_adapter_name(),"renderer":RenderingServer.get_current_rendering_method(),"scope":"actual Main, actual Player 600 ticks, selected first field region; no dense combat/PC claim"},"  "))
 else:
  await frame_capture("game_entry")
  var receipt:=FileAccess.open(output.path_join("receipt.json"),FileAccess.WRITE)
  receipt.store_string(JSON.stringify({"camera_zoom":str(main.camera.zoom),"camera_center":str(main.camera.get_screen_center_position()),"transform":str(scene.field_view.get_global_transform_with_canvas()),"player":str(main.player.global_position),"player_scale":str(main.player._sprite.scale),"space":main.native_map11.snapshot().space,"isolated":OS.get_user_data_dir()},"  "))
  await create_timer(2.).timeout;await frame_capture("motion_2s")
  await settle(Vector2(-500,2550));await frame_capture("early_boundary")
  await settle(Vector2(-750,3500));await frame_capture("left_roots")
  await settle(Vector2(750,3500));await frame_capture("right_roots")
 main.queue_free()
 for i in range(16):await process_frame
 quit(0)
func frame_capture(id: String) -> void:
 for i in range(12):await process_frame
 await RenderingServer.frame_post_draw
 var im: Image=root.get_texture().get_image()
 im.save_png(output.path_join(id+".png"))
 im.get_region(Rect2i(560,170,800,700)).save_png(output.path_join(id+"_1x.png"))
