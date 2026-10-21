extends "res://tests/capture_map11_30.gd"
## Same Main composition, real shader TIME. Only actors/camera freeze for comparison.
var probes: Dictionary={}
func probe(id: String, source: CanvasItem) -> void:
 var viewport:=SubViewport.new();viewport.size=Vector2i(512,512)
 viewport.world_2d=World2D.new();viewport.transparent_bg=true
 viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 root.add_child(viewport)
 var item: CanvasItem=source.duplicate();viewport.add_child(item)
 if item is Sprite2D:
  item.centered=true;item.offset=Vector2.ZERO;item.position=Vector2(256,256)
  item.scale=Vector2.ONE*(500.0/maxf(item.texture.get_width(),item.texture.get_height()))
 else:
  item.position=Vector2(256,256);item.scale=Vector2.ONE*.09
 item.visible=true;probes[id]=viewport
func shot(id: String) -> int:
 await RenderingServer.frame_post_draw
 var stamp: int=Time.get_ticks_usec()
 root.get_texture().get_image().save_png(output.path_join("motion_"+id+".png"))
 for key in probes:probes[key].get_texture().get_image().save_png(output.path_join(key+"_"+id+".png"))
 return stamp
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-MAP11-30p-Motion-Isolated":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
 if output.is_empty():quit(3);return
 seed(30);root.size=Vector2i(1920,1080);root.content_scale_size=root.size
 DisplayServer.window_set_size(root.size)
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene");scene.activate_space("arena")
 var arena: Node2D=scene.arena_view
 await settle(arena.global_position+Vector2(0,800))
 for i in range(100):await physics_frame
 main.camera.physics_interpolation_mode=Node.PHYSICS_INTERPOLATION_MODE_OFF
 main.camera.position_smoothing_enabled=false;main.camera.reset_smoothing();main.camera.force_update_scroll()
 # Check the real existing parallax callback independently of the fixed comparison camera.
 arena.update_product_occlusion(Vector2(0,800),.016)
 var foreground: Sprite2D=arena.get_node("Target30ParallaxBranches")
 var old: Vector2=foreground.position
 main.camera.global_position.x+=100;main.camera.reset_smoothing();main.camera.force_update_scroll()
 arena.update_product_occlusion(Vector2(0,800),.016)
 var parallax_delta: Vector2=foreground.position-old
 check(absf(parallax_delta.x+8.0)<.05,"foreground remains camera-driven .08 parallax")
 main.process_mode=Node.PROCESS_MODE_DISABLED
 main.camera.global_position=arena.global_position+Vector2(0,118.9053)-main.camera.offset
 main.camera.reset_smoothing();main.camera.force_update_scroll()
 foreground.position=Vector2(0,(820-562.5)*2.6666666667+120)
 var body:=Sprite2D.new();body.texture=preload("res://assets/maps/map11/boss_dark_druid_8dir_v3.png")
 body.region_enabled=true;body.region_rect=Rect2(0,0,414,620);body.offset=Vector2(0,-310)
 body.position=Vector2(0,-180);body.z_as_relative=false;body.z_index=int((arena.global_position.y-180)/4.0)
 body.material=scene.get_node("MAP11Detail").material_;arena.add_child(body)
 probe("veins",arena.get_node("Target30Floor"))
 probe("pod_mouth",arena.get_node("Target30_west_mouth"))
 probe("fog",arena.get_node("Target30PerimeterMist"))
 # Keep the established comparison transform after any always-processing game callbacks.
 # The camera stays registered so lighting/culling can still read it normally.
 var lock_view: Callable=func():
  root.canvas_transform=Transform2D(Vector2(.36,0),Vector2(0,.36),Vector2(960,497.1943)-arena.global_position*.36)
  foreground.position=Vector2(0,(820-562.5)*2.6666666667+120)
 RenderingServer.frame_pre_draw.connect(lock_view)
 DisplayServer.window_move_to_foreground()
 for i in range(10):await process_frame
 check(not paused and is_equal_approx(Engine.time_scale,1.0),"real clock continues")
 var begin: int=await shot("0s")
 var mouth_frames: Array[Image]=[]
 var next_mouth: int=begin
 while Time.get_ticks_usec()-begin<2000000:
  await process_frame
  if Time.get_ticks_usec()>=next_mouth:
   await RenderingServer.frame_post_draw
   mouth_frames.append(probes["pod_mouth"].get_texture().get_image().get_region(Rect2i(214,214,50,50)))
   next_mouth+=160000
 var end: int=await shot("2s")
 for i in range(mouth_frames.size()):mouth_frames[i].save_png(output.path_join("mouth_state_%02d.png"%i))
 var f:=FileAccess.open(output.path_join("receipt.json"),FileAccess.WRITE)
 f.store_string(JSON.stringify({"elapsed_seconds":(end-begin)/1000000.0,"time_scale":Engine.time_scale,"paused":paused,"shader_TIME_override":false,"parallax_delta_for_camera_100px":str(parallax_delta),"canvas":str(arena.get_global_transform_with_canvas()),"checks":checks,"failures":failures,"scope":"real Main; fixed actor/camera, live shader TIME; material-isolated 512px probes"},"  "))
 print("MAP11-30p MOTION checks=%d failures=%d elapsed=%f"%[checks,failures,(end-begin)/1000000.0])
 RenderingServer.frame_pre_draw.disconnect(lock_view)
 for key in probes:probes[key].queue_free()
 main.queue_free()
 for i in range(16):await process_frame
 quit(0 if failures==0 else 1)
