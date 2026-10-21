extends "res://tests/benchmark_map11_21.gd"
## Actual Main presentation; source idle boss is a capture fixture, not live combat.
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-MAP11-30-Isolated":quit(2);return
 var tag: String="after"
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
  if arg.begins_with("--tag="):tag=arg.trim_prefix("--tag=")
 if output.is_empty():quit(3);return
 root.size=Vector2i(1920,1080);root.content_scale_size=root.size
 DisplayServer.window_set_size(root.size)
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 scene.activate_space("arena")
 var arena: Node2D=scene.arena_view
 await settle(arena.global_position+Vector2(0,800))
 for i in range(100):await physics_frame
 if "--benchmark-only" in OS.get_cmdline_user_args():
  OS.low_processor_usage_mode=false;Engine.max_fps=240
  DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
  DisplayServer.window_move_to_foreground()
  var deadline: int=Time.get_ticks_msec()+15000
  while not DisplayServer.window_is_focused() and Time.get_ticks_msec()<deadline:await process_frame
  var sample: Dictionary=await _measure_attempt("arena",arena.global_position+Vector2(1250,80))
  var f:=FileAccess.open(output.path_join("../benchmark.json"),FileAccess.WRITE)
  f.store_string(JSON.stringify({"sample":sample,"viewport":[1920,1080],"renderer":RenderingServer.get_current_rendering_method(),"adapter":RenderingServer.get_video_adapter_name(),"user_dir":OS.get_user_data_dir(),"attempts":1,"scope":"nominal arena, actual Player input 600 ticks, PID81277 preserved, no natural boss combat"},"  "))
 else:
  # Freeze actors only after the product camera reached its normal arrival pose.
  main.process_mode=Node.PROCESS_MODE_DISABLED
  var body:=Sprite2D.new();body.texture=preload("res://assets/maps/map11/boss_dark_druid_8dir_v3.png")
  body.region_enabled=true;body.region_rect=Rect2(0,0,414,620);body.offset=Vector2(0,-310)
  body.position=Vector2(0,-180);body.z_as_relative=false;body.z_index=int((arena.global_position.y-180)/4.0)
  body.material=scene.get_node("MAP11Detail").material_;arena.add_child(body)
  await frame_capture(tag+"_entry")
  var f:=FileAccess.open(output.path_join(tag+"_receipt.json"),FileAccess.WRITE)
  f.store_string(JSON.stringify({"viewport":[1920,1080],"camera_local":main.camera.global_position-arena.global_position,"offset":main.camera.offset,"zoom":main.camera.zoom,"player_local":main.player.global_position-arena.global_position,"crop":[560,170,800,700],"boss":"source idle fixture, no AI/HP/gate writes","space":"nominal arena"},"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0)
func frame_capture(id: String) -> void:
 for i in range(12):await process_frame
 await RenderingServer.frame_post_draw
 var im: Image=root.get_texture().get_image()
 im.save_png(output.path_join(id+".png"))
 im.get_region(Rect2i(560,170,800,700)).save_png(output.path_join(id+"_1x.png"))
