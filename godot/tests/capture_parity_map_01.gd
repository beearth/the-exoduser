extends SceneTree
var OUT:=OS.get_environment("HOME")+"/exoduser-wt/_out/PARITY-MAP-01/captures/"
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if not OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-PARITY-MAP-01-"):quit(2);return
 root.size=Vector2i(1920,1080);DisplayServer.window_set_size(root.size)
 var main: Node=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 for i in range(12):await physics_frame
 main.source_intro_sequence.finish_native_guide()
 var deadline: int=Time.get_ticks_msec()+10000
 while Time.get_ticks_msec()<deadline:
  if is_instance_valid(main.source_intro_sequence.lesson_flow) and main.source_intro_sequence.lesson_flow.active:main.source_intro_sequence.lesson_flow.skip_all();break
  await process_frame
 for j in range(60):await physics_frame
 main.world.get_node("Map11ProductScene").set_physics_process(false)
 paused=true
 main.get_node("NativeScreenLighting").process_mode=Node.PROCESS_MODE_ALWAYS
 var points: Array=[Vector2(4020,7420),Vector2(3380,7250),Vector2(4100,3250),Vector2(4020,900)]
 var rows: Array=[]
 for i in range(points.size()):
  main.player.global_position=points[i];main.camera.global_position=points[i]
  main.camera.reset_smoothing()
  main.player.z_index=int(points[i].y/4)
  main.player.reset_physics_interpolation();main.camera.reset_physics_interpolation();main.camera.force_update_scroll()
  main.world.get_node("Map11ProductScene").field_view.update_product(points[i],1.0/60)
  main.camera.global_position=points[i];main.camera.force_update_scroll()
  for j in range(4):await process_frame
  var scene: Node=main.world.get_node("Map11ProductScene")
  scene.set_physics_process(false);scene.field_view.render_at(1000)
  await RenderingServer.frame_post_draw
  var img:=root.get_texture().get_image()
  img.save_png(OUT+str(i+1)+"_godot.png")
  rows.append({"point":str(points[i]),"camera":str(main.camera.get_screen_center_position()),"zoom":str(main.camera.zoom)})
 print("PARITY_CAPTURE ",JSON.stringify(rows))
 main.queue_free()
 for i in range(4):await process_frame
 quit()
