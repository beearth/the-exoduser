extends SceneTree
var OUT:=OS.get_environment("HOME")+"/exoduser-wt/_out/PARITY-MAP-01/performance.json"
func _initialize() -> void:call_deferred("run")
func finish(row: Dictionary) -> void:
 var file:=FileAccess.open(OUT,FileAccess.WRITE);file.store_string(JSON.stringify(row,"  "));file.close();print("PARITY_PERF ",JSON.stringify(row));quit()
func run() -> void:
 if not OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-PARITY-MAP-01-"):quit(2);return
 root.size=Vector2i(1920,1080);DisplayServer.window_set_size(root.size)
 var main: Node=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 for i in range(10):await physics_frame
 main.source_intro_sequence.finish_native_guide()
 var deadline: int=Time.get_ticks_msec()+10000
 while Time.get_ticks_msec()<deadline:
  if is_instance_valid(main.source_intro_sequence.lesson_flow) and main.source_intro_sequence.lesson_flow.active:main.source_intro_sequence.lesson_flow.skip_all();break
  await process_frame
 deadline=Time.get_ticks_msec()+60000
 while not DisplayServer.window_is_focused() and Time.get_ticks_msec()<deadline:await process_frame
 if not DisplayServer.window_is_focused():finish({"status":"미측정","reason":"GUI focus unavailable within 60 seconds"});return
 for i in range(120):await process_frame
 var samples: Array[float]=[];var vram: Array[int]=[];var lost: int=0;var previous: int=Time.get_ticks_usec()
 var started: int=previous
 while Time.get_ticks_usec()-started<10000000:
  await process_frame
  var now: int=Time.get_ticks_usec();samples.append((now-previous)/1000.0);previous=now
  if not DisplayServer.window_is_focused():lost+=1
  vram.append(int(Performance.get_monitor(Performance.RENDER_VIDEO_MEM_USED)))
 samples.sort();vram.sort()
 var row: Dictionary={"status":"MEASURED" if lost==0 else "INVALID_FOCUS","scope":"actual Main CH1-1 field at start; natural runtime; 1920x1080 GUI 10s; not full-map or dense-combat performance","focus_lost_frames":lost,"frames":samples.size(),"p95_ms":samples[int(samples.size()*.95)],"p99_ms":samples[int(samples.size()*.99)],"vram_p95_bytes":vram[int(vram.size()*.95)],"texture_memory_bytes":int(Performance.get_monitor(Performance.RENDER_TEXTURE_MEM_USED)),"game_on":main.source_state.read_current_g().get("on"),"enemy_count":main.world.get_enemies().size(),"render_draw_calls":Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)}
 main.queue_free()
 for i in range(4):await process_frame
 finish(row)
