extends "res://tests/benchmark_map11_21.gd"
const Finale=preload("res://scripts/maps/map11/arena_finale.gd")
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-22d-Isolated-20261021":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
 if output.is_empty():quit(3);return
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 scene.activate_space("arena")
 var arena: Node2D=scene.arena_view
 check(scene.provider.arena.radius==1700.0,"D05 R1700")
 check(scene.provider.arena.content_valid,"arena authored routes and anchors")
 var feet: Node=arena.get_node("FinaleExteriorFootCircles")
 check(feet.get_child_count()==Finale.ROWS.size(),"one foot collision per prop")
 var evidence: Array=[]
 for i in range(Finale.ROWS.size()):
  var row: Array=Finale.ROWS[i]
  var sprite: Sprite2D=arena.get_node("Finale%02d"%i)
  var bounds: Rect2=sprite.get_meta("opaque_ground_bounds")
  check(row[2].length()-row[4]>1700.0,"entire foot circle outside combat disk")
  check(absf(bounds.end.y)<.001 and absf(bounds.get_center().x)<.001,"opaque ground foot aligned")
  check(sprite.texture is CanvasTexture and sprite.texture.normal_texture!=null,"PNG diffuse and normal")
  check(not sprite.z_as_relative and sprite.z_index==int(sprite.global_position.y/4.0),"world foot depth")
  check(feet.get_child(i).position==row[2] and feet.get_child(i).shape.radius==row[4],"collision uses authored foot")
  evidence.append({"asset":row[0],"view":row[1],"foot":str(row[2]),"height":row[3],"radius":row[4],"radial_clearance":row[2].length()-row[4]-1700.0})
 check(is_equal_approx(arena.get_node("RGBAFloorDecals").get_child(0).material.get_shader_parameter("opacity"),.16),"faint floor decorations")
 check(is_equal_approx(arena.get_node("IrregularFissureDecals").get_child(0).material.get_shader_parameter("opacity"),.12),"faint floor fissures")
 # No new vertical prop foot intersects even the largest centered slam R1320.
 # Tide R1750 and fissure 2304 can reach beyond the room; preserve their source extents.
 check(preload("res://scripts/maps/map11/arena_preview.gd").SLAM_R==1320.0,"source slam extent preserved")
 check(preload("res://scripts/maps/map11/arena_preview.gd").TIDE_R==1750.0,"source tide extent preserved")
 check(preload("res://scripts/maps/map11/arena_preview.gd").FISSURE_LENGTH==2304.0,"source fissure extent preserved")
 var retired: int=0
 for cull in arena._rim_sprites:
  var sprite: Sprite2D=cull.sprite
  var bounds: Rect2=sprite.get_meta("opaque_ground_bounds")
  if sprite.has_meta("finale_retired"):retired+=1
  check(cull.rect.has_point(sprite.position+bounds.get_center()),"cull includes current opaque bounds")
 check(retired==32,"24 corpse/cocoon and eight repeated trees retired")
 for child in arena.get_children():
  if child.has_meta("contact_source"):
   check(not child.get_meta("contact_source").has_meta("finale_retired"),"retired source leaves no contact shadow")
 check(arena._shoulders.size()==32,"reused 32 root shoulders form ritual perimeter")
 for root_ in arena._shoulders:
  check(root_.position.length()>=1529.9 and root_.position.length()<=1621,"root ring protects central combat void")
 var floor_material: ShaderMaterial=arena.get_node("SkinFloor").material
 check(floor_material.shader==preload("res://scripts/maps/map11/arena_shoulder.gdshader"),"ritual integrated floor shader")
 var ring_material: ShaderMaterial=arena.get_node("RitualRootCracks").material
 check(ring_material.get_shader_parameter("glow_strength") is float,"explicit non-Nil glow uniform")
 check(is_equal_approx(ring_material.get_shader_parameter("glow_strength"),.10),"bounded crimson glow")
 var verify_only: bool="--verify-only" in OS.get_cmdline_user_args()
 var samples: Array=[]
 if not verify_only:
  var processes: Array=[]
  OS.execute("/bin/ps",["-axo","pid,comm"],processes)
  var other_godot: bool=false
  for line in str(processes[0]).split("\n"):
   if line.ends_with("/Godot") and int(line.strip_edges().get_slice(" ",0))!=OS.get_process_id():other_godot=true
  if other_godot:
   push_error("Other Godot process present; nominal sample not started")
   quit(4);return
  OS.low_processor_usage_mode=false;DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED);Engine.max_fps=240
  DisplayServer.window_move_to_foreground()
  var focus_deadline: int=Time.get_ticks_msec()+15000
  while not DisplayServer.window_is_focused() and Time.get_ticks_msec()<focus_deadline:await process_frame
  for i in range(90):await process_frame
  var row: Dictionary=await _measure_attempt("arena",arena.global_position+Vector2(1250,80))
  row.attempt=1;row.scope="nominal arena, actual PC gate pending; presentation explicitly activated"
  check(row.focus_lost_frames==0,"entire single sample focused")
  check(row.input_accepted and row.walk_distance>200.0,"real player input fixture walked")
  if row.valid:check(row.p95_ms<=8.33,"p95 budget 8.33ms")
  samples.append(row)
 var f:=FileAccess.open(output,FileAccess.WRITE)
 f.store_string(JSON.stringify({"samples":samples,"checks":checks,"failures":failures,"props":evidence,"viewport":[1920,1080],"user_dir":OS.get_user_data_dir(),"scope":"related checks only; performance deferred while protected Godot PID81277 is present" if verify_only else "one nominal arena sample; no retries"},"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0 if failures==0 else 1)
