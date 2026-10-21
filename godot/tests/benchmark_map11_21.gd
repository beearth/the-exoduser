extends "res://tests/capture_map11_hell_props.gd"
## Single final related verification + one 600-tick benchmark per space.
const Tour=preload("res://scripts/maps/map11/tour_layout.gd")
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-21d-Isolated-20261021":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
 if output.is_empty():quit(3);return
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 if not is_instance_valid(main.source_intro_sequence):quit(5);return
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 var detail: Node=scene.get_node("MAP11Detail")
 var provider=preload("res://scripts/maps/map11/field_provider.gd").new()
 check(provider.compile(preload("res://scripts/maps/map11/field_recipe.gd").new()),"all authored route sweeps and anchors clear")
 check(detail.hell_props.size()==17,"17 standing props across six scenes")
 var evidence_rows: Array=[]
 for i in range(detail.hell_props.size()):
  var prop: Node2D=detail.hell_props[i]
  var sprite: Sprite2D=prop.get_child(0)
  var row: Array=Tour.ROWS[i]
  var bounds: Rect2=sprite.get_meta("opaque_ground_bounds")
  check(absf(bounds.end.y)<.001 and absf(bounds.get_center().x)<.001,"opaque bbox foot zero gap")
  check(sprite.texture is CanvasTexture and sprite.texture.normal_texture!=null,"baked diffuse+normal")
  check(prop.z_index==int(row[2].y/4.0) and not prop.z_as_relative,"same actor y depth")
  check(not provider.can_move(row[2],1.0),"authoritative foot blocks movement")
  check(prop.global_position.distance_to(scene.arena_view.global_position)>1700.0+row[4],"outside arena R1700")
  evidence_rows.append({"id":str(prop.name),"asset":row[0],"variant":row[1],"foot":str(row[2]),"height":row[3],"radius":row[4],"ground_bounds":str(bounds)})
 var patches: int=0
 for child in scene.field_view.get_children():
  if str(child.name).begins_with("FloorPatch") or str(child.name).begins_with("GroundStory"):patches+=1
 check(patches==0,"flat patches and broad scatter removed")
 check(scene.lighting_look.pools.size()==14,"eight existing plus six scene light pools")
 OS.low_processor_usage_mode=false
 DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 Engine.max_fps=240
 DisplayServer.window_move_to_foreground()
 results.append(await measure("field",Vector2(-850,-2400)))
 main.player.global_position=main.read_native_map11_provider().transition_sites().field_gate.global_position
 for i in range(40):await physics_frame
 check(main.native_map11.snapshot().space=="arena","real gate entry")
 results.append(await measure("arena",scene.arena_view.global_position+Vector2(1250,80)))
 for result in results:
  if result.valid:check(result.p95_ms<=8.33,result.space+" p95 within 8.33ms")
 var f:=FileAccess.open(output,FileAccess.WRITE)
 f.store_string(JSON.stringify({"samples":results,"checks":checks,"failures":failures,"props":evidence_rows,"viewport":[1920,1080],"physics_hz":Engine.physics_ticks_per_second,"user_dir":OS.get_user_data_dir(),"command_line":OS.get_cmdline_args(),"max_fps":Engine.max_fps,"low_processor_usage_mode":OS.low_processor_usage_mode,"scope":"GUI real Player input, 600 ticks per attempt; focus-interrupted attempts rejected in full, at most three attempts; arena nominal while real gate is PC pending; existing Godot coexists; no dense-combat/Windows/GPU timestamp claim"},"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0 if failures==0 else 1)

# A focus interruption invalidates the entire 600-tick attempt, including its p95.
# Retry for focus only; a valid slow sample is never retried to pass the budget.
func measure(space: String, origin: Vector2) -> Dictionary:
 var rejected: Array=[]
 for attempt in range(3):
  DisplayServer.window_move_to_foreground()
  var deadline: int=Time.get_ticks_msec()+10000
  while not DisplayServer.window_is_focused() and Time.get_ticks_msec()<deadline:
   await process_frame
  var row: Dictionary=await _measure_attempt(space,origin)
  if row.valid:
   row.rejected_focus_attempts=rejected
   row.attempt=attempt+1
   check(row.input_accepted and row.walk_distance>200.0,space+" actual Player walking")
   check(true,space+" window focused throughout sample")
   return row
  rejected.append(row)
 check(false,space+" no uninterrupted focused sample after three attempts")
 return {"space":space,"valid":false,"p95_ms":null,"focus_lost_frames":-1,"rejected_focus_attempts":rejected}

func _measure_attempt(space: String,origin: Vector2) -> Dictionary:
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
