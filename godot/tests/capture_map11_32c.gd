extends "res://tests/benchmark_map11_21.gd"
## Actual Main, untouched field camera and actor scale, isolated storage only.
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-MAP11-32c-Isolated":quit(2);return
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
 main.camera.zoom=Vector2.ONE*.70
 _toggle(scene)
 RenderingServer.viewport_set_measure_render_time(root.get_viewport_rid(),true)
 await settle(Vector2(0,3700))
 for i in range(300):await physics_frame
 DisplayServer.window_set_title("지옥의 길 · 썩은 숲 입구")
 if "--benchmark-only" in OS.get_cmdline_user_args():
  DisplayServer.window_move_to_foreground()
  var ready:=FileAccess.open(output.path_join("../focus-ready.txt"),FileAccess.WRITE)
  ready.store_string(str(OS.get_process_id()));ready.close()
  var deadline: int=Time.get_ticks_msec()+60000
  while not DisplayServer.window_is_focused() and Time.get_ticks_msec()<deadline:await process_frame
  if not DisplayServer.window_is_focused():quit(4);return
  var result: Dictionary=await _measure_attempt("field",Vector2(0,3650))
  var f:=FileAccess.open(output.path_join("../performance.json"),FileAccess.WRITE)
  f.store_string(JSON.stringify({"sample":result,"monitors":monitor_summary,"disabled_nodes":disabled_nodes,"layer":layer,"attempts":1,"viewport":[1920,1080],"user_dir":OS.get_user_data_dir(),"adapter":RenderingServer.get_video_adapter_name(),"renderer":RenderingServer.get_current_rendering_method(),"scope":"actual Main, actual Player 600 ticks, selected first field region; no dense combat/PC claim"},"  "))
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

var monitor_summary: Dictionary={}
var disabled_nodes: Array[String]=[]
var layer: String="none"
func _toggle(scene: Node) -> void:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--disable-layer="):layer=arg.trim_prefix("--disable-layer=")
 var field: Node=scene.field_view
 var target: Node=field.get_node_or_null("Target32FirstRegion")
 if target!=null:
  for child in target.get_children():
   var id: String=str(child.name)
   if (layer=="floor" and id=="Target32GroundAndRootAO") or (layer=="trees" and id.begins_with("Target32_") and not "white" in id) or (layer=="fog" and id=="Target32LowMist") or (layer=="foreground" and id.begins_with("Target32Parallax")):
    _mask(child)
   if layer=="pulse" and id=="Target32GroundAndRootAO":child.material.set_shader_parameter("pulse_strength",0.)
   if layer=="white" and "white" in id:
    var mat:=CanvasItemMaterial.new();mat.light_mode=CanvasItemMaterial.LIGHT_MODE_UNSHADED;child.material=mat
 if layer=="floor":
  var bake: Node=field.get("ground_bake")
  if bake!=null:_mask(bake)
 if layer=="fog":
  var fog: Node=main.get_node_or_null("NativeScreenLighting/NativeFogGL")
  if fog!=null:_mask(fog)
 if layer=="combat":
  for enemy in main.world.get_enemies():
   enemy.process_mode=Node.PROCESS_MODE_DISABLED
   if enemy is CanvasItem:_mask(enemy)
  for child in main.get_children()+main.world.get_children():
   var script: Script=child.get_script()
   if script!=null and ("combat" in script.resource_path or "enemy" in script.resource_path or "encounter" in script.resource_path or "native_world_phase" in script.resource_path or "native_projectile_birth_phase" in script.resource_path or "native_demo11_" in script.resource_path or "spawn_hole" in script.resource_path):
    child.process_mode=Node.PROCESS_MODE_DISABLED;disabled_nodes.append(str(child.get_path()))
 var f:=FileAccess.open(output.path_join("../tree.txt"),FileAccess.WRITE)
 _dump(main,f);f.close()
func _mask(node: Node) -> void:
 if node is CanvasItem:node.visibility_layer=0
 disabled_nodes.append(str(node.get_path()))
 for child in node.get_children():_mask(child)
func _dump(node: Node,f: FileAccess) -> void:
 var script: Script=node.get_script()
 if script!=null:f.store_line(str(node.get_path())+" "+script.resource_path)
 for child in node.get_children():_dump(child,f)
func _measure_attempt(space: String,origin: Vector2) -> Dictionary:
 var samples: Array=[]
 var rid: RID=root.get_viewport_rid()
 var sampler: Callable=func():
  samples.append([Performance.get_monitor(Performance.TIME_PROCESS)*1000.,Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS)*1000.,RenderingServer.viewport_get_measured_render_time_cpu(rid),RenderingServer.viewport_get_measured_render_time_gpu(rid),Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME),Performance.get_monitor(Performance.RENDER_VIDEO_MEM_USED)])
 process_frame.connect(sampler)
 if "--profile-functions" in OS.get_cmdline_user_args():root.set_meta("demo47i_stage","MAP11-32c")
 var result: Dictionary=await super._measure_attempt(space,origin)
 if root.has_meta("demo47i_perf"):
  var pf:=FileAccess.open(output.path_join("../function-times.json"),FileAccess.WRITE)
  pf.store_string(JSON.stringify(root.get_meta("demo47i_perf"),"  "))
  root.remove_meta("demo47i_stage")
 process_frame.disconnect(sampler)
 var keys=["process_ms","physics_ms","render_cpu_ms","render_gpu_ms","draw_calls","primitives","video_mem_bytes"]
 for col in range(keys.size()):
  var values: Array=[]
  for row in samples:values.append(row[col])
  values.sort()
  var sum_: float=0.
  for value in values:sum_+=float(value)
  monitor_summary[keys[col]]={"mean":sum_/values.size(),"p95":values[int(values.size()*.95)],"max":values.back(),"nonzero":values.count(0.)<values.size()}
 monitor_summary["samples"]=samples.size()
 return result
