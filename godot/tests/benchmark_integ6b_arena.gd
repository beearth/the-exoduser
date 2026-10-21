extends "res://tests/benchmark_map11_21.gd"
## One arena-space measurement. Transport fixture does not admit PC combat.
var monitor_rows: Array=[]
var costs: Dictionary={}
var sampling:=false
class Probe extends Node:
 var callback: Callable
 func _physics_process(_dt: float) -> void:callback.call()
func probe(target: Node,label: String) -> void:
 var row: Dictionary={"start":0,"samples":[]}
 costs[label]=row
 var before:=Probe.new();var after:=Probe.new()
 before.process_physics_priority=target.process_physics_priority
 after.process_physics_priority=target.process_physics_priority
 before.callback=func():row.start=Time.get_ticks_usec() if sampling else 0
 after.callback=func():
  if row.start>0:row.samples.append((Time.get_ticks_usec()-int(row.start))/1000.0)
 var parent: Node=target.get_parent()
 parent.add_child(before);parent.move_child(before,target.get_index())
 target.add_child(after);target.move_child(after,0)
func distribution(values: Array) -> Dictionary:
 if values.is_empty():return {}
 var sorted: Array=values.duplicate();sorted.sort()
 var total: float=0.0
 for v in sorted:total+=v
 return {"mean":total/sorted.size(),"p95":sorted[int(sorted.size()*.95)],"max":sorted[-1],"samples":sorted.size()}
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-INTEG6b-Arena-Isolated":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
 if output.is_empty():quit(3);return
 OS.low_processor_usage_mode=false
 root.size=Vector2i(1920,1080);root.content_scale_size=root.size
 DisplayServer.window_set_size(root.size)
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide()
 main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all()
 var sites: Dictionary=main.read_native_map11_provider().transition_sites()
 main.player.global_position=sites.field_gate.global_position
 var default_receipt: Dictionary=main.request_native_map11_transition("enter")
 var transport: Node=preload("res://tests/map11_transport_fixture.gd").install(main)
 if not is_instance_valid(transport):quit(4);return
 var receipt: Dictionary=main.request_native_map11_transition("enter")
 if receipt.get("status")!="READY" or transport.snapshot().space!="arena" or main.player.global_position!=sites.arena_entry.global_position:quit(5);return
 main.world.get_node("NativePets")._subtitle_root.hide()
 Engine.max_fps=240;DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 DisplayServer.window_move_to_foreground()
 var until: int=Time.get_ticks_msec()+15000
 while not DisplayServer.window_is_focused() and Time.get_ticks_msec()<until:await process_frame
 var viewport_rid: RID=root.get_viewport_rid()
 RenderingServer.viewport_set_measure_render_time(viewport_rid,true)
 probe(main,"main.gd::_physics_process")
 probe(main.world,"world.gd::_physics_process")
 probe(main.player,"player.gd::_physics_process")
 var collect: Callable=func():
  if sampling:monitor_rows.append({"process_ms":Performance.get_monitor(Performance.TIME_PROCESS)*1000.0,"physics_ms":Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS)*1000.0,"draw_calls":Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),"viewport_cpu_ms":RenderingServer.viewport_get_measured_render_time_cpu(viewport_rid),"viewport_gpu_ms":RenderingServer.viewport_get_measured_render_time_gpu(viewport_rid)})
 process_frame.connect(collect)
 sampling=true
 var arena: Node2D=main.world.get_node("Map11ProductScene").arena_view
 var sample: Dictionary=await _measure_attempt("arena",arena.global_position+Vector2(1250,80))
 sampling=false;process_frame.disconnect(collect)
 var summary: Dictionary={}
 for metric in ["process_ms","physics_ms","draw_calls","viewport_cpu_ms","viewport_gpu_ms"]:
  var values: Array=[]
  for row in monitor_rows:values.append(row[metric])
  summary[metric]=distribution(values)
 var functions: Dictionary={}
 for label in costs:functions[label]=distribution(costs[label].samples)
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png(output.path_join("arena.png"))
 var f:=FileAccess.open(output.path_join("benchmark.json"),FileAccess.WRITE)
 f.store_string(JSON.stringify({"sample":sample,"monitors":summary,"callbacks_ms":functions,"default_gate":default_receipt,"transport":receipt,"scope":"actual Main/Player/World authoritative arena via explicit map-only transport fixture; default combat gate remains PC pending; no boss AI or natural boss fight","attempts":1,"viewport":[1920,1080],"monitor_rows":monitor_rows,"renderer":RenderingServer.get_current_rendering_method()},"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0)
