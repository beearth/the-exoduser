extends "res://tests/benchmark_map11_21.gd"
## Actual Main presentation; source idle boss is a capture fixture, not live combat.
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-MAP11-30b-Isolated":quit(2);return
 var tag: String="after"
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
  if arg.begins_with("--tag="):tag=arg.trim_prefix("--tag=")
 if output.is_empty():quit(3);return
 OS.low_processor_usage_mode=false
 DisplayServer.window_move_to_foreground()
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
 if "--live-motion" in OS.get_cmdline_user_args():
  scene.boss_camera.set_physics_process(false)
  await settle(arena.global_position)
  main.camera.zoom=Vector2.ONE*.36;main.camera.position_smoothing_enabled=false
  for i in range(60):await physics_frame
  var phase: float=fposmod(Time.get_ticks_msec()/1000.0,1.0/.55)
  await create_timer(fposmod(.2-phase,1.0/.55)).timeout
  await frame_capture("motion_0s")
  await create_timer(2.0).timeout
  await frame_capture("motion_2s")
  var rows: Array=[]
  for row in arena._target_rows:
   rows.append({"name":row.sprite.name,"visible":row.sprite.is_visible_in_tree(),"material":row.sprite.material.shader.code,"modulate":row.sprite.modulate,"z":row.sprite.z_index,"relative":row.sprite.z_as_relative,"foot":row.sprite.global_position})
  var f:=FileAccess.open(output.path_join("motion-receipt.json"),FileAccess.WRITE)
  f.store_string(JSON.stringify({"transform":str(arena.get_global_transform_with_canvas()),"rows":rows,"scope":"actual Main live; no frozen parent; nominal arena; no spawned boss"},"  "))
  main.queue_free()
  for i in range(16):await process_frame
  quit();return
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
  # Use the product presentation component; fixture has no AI/HP/gate writes.
  var fixture: Node2D=scene.get_node("Boss11SceneActor")
  fixture.set_process(false);fixture.show();fixture.global_position=arena.global_position
  fixture.z_as_relative=false;fixture.z_index=int(arena.global_position.y/4.0)
  var entry_zoom: Vector2=main.camera.zoom
  var entry_transform: Transform2D=arena.get_global_transform_with_canvas()
  await frame_capture(tag+"_entry")
  # Capture-only explicit viewport matrix: Main is frozen, including its camera.
  # Shader TIME remains live. This does not enter the product or performance path.
  main.camera.enabled=false
  root.canvas_transform=Transform2D(Vector2(.36,0),Vector2(0,.36),Vector2(960,497.2)-arena.global_position*.36)
  for row in arena._target_rows:row.sprite.show()
  arena._foreground.position=Vector2(0,(820-562.5)*arena.TargetLook.SOURCE_SCALE+120)
  # Begin just before the authored jaw-open threshold; +2 s crosses it.
  var period: float=1.0/.55
  var phase: float=fposmod(Time.get_ticks_msec()/1000.0,period)
  await create_timer(fposmod(.20-phase,period)).timeout
  await frame_capture("motion_0s")
  await create_timer(2.0).timeout
  await frame_capture("motion_2s")
  var parallax_delta: Vector2=Vector2.ZERO # static camera: parallax is intentionally stationary
  # Near-melee framing from the exact product camera formula, applied as a fixture matrix.
  main.player.global_position=arena.global_position+Vector2(100,110)
  scene.boss_camera._physics_process(1.0)
  var center: Vector2=main.camera.global_position+main.camera.offset-arena.global_position
  root.canvas_transform=Transform2D(Vector2(.8,0),Vector2(0,.8),Vector2(960,540)-center*.8-arena.global_position*.8)
  await frame_capture("near_melee")
  var sprite: AnimatedSprite2D=main.player.get("_sprite")
  var texture_: Texture2D=sprite.sprite_frames.get_frame_texture(sprite.animation,sprite.frame)
  var receipt:=FileAccess.open(output.path_join("scale.json"),FileAccess.WRITE)
  receipt.store_string(JSON.stringify({"entry_zoom":entry_zoom,"entry_transform":str(entry_transform),"parallax_delta":parallax_delta,"player_animation":sprite.animation,"player_atlas":texture_.atlas.resource_path if texture_ is AtlasTexture else texture_.resource_path,"player_scale":sprite.scale,"player_frame":str(texture_.resource_path),"player_region":str(texture_.region) if texture_ is AtlasTexture else "full","player_anchor":sprite.offset,"zoom":main.camera.zoom,"boss_height":620.0,"fixture_scope":"product idle scene view; no natural AI or melee damage claim"},"  "))
  var f:=FileAccess.open(output.path_join(tag+"_receipt.json"),FileAccess.WRITE)
  f.store_string(JSON.stringify({"viewport":[1920,1080],"canvas_transform":str(arena.get_global_transform_with_canvas()),"camera_center_local":str(main.camera.get_screen_center_position()-arena.global_position),"camera_local":main.camera.global_position-arena.global_position,"offset":main.camera.offset,"zoom":main.camera.zoom,"player_local":main.player.global_position-arena.global_position,"crop":[560,170,800,700],"boss":"source idle fixture, no AI/HP/gate writes","space":"nominal arena"},"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0)
func frame_capture(id: String) -> void:
 for i in range(12):await process_frame
 RenderingServer.force_draw()
 var im: Image=root.get_texture().get_image()
 im.save_png(output.path_join(id+".png"))
 im.get_region(Rect2i(560,170,800,700)).save_png(output.path_join(id+"_1x.png"))
