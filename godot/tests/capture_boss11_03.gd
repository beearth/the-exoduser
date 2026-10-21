extends "res://tests/benchmark_map11_21.gd"
## Isolated composition only. No gate flags/signals, source ticks or combat owners.
const STYLE=preload("res://scripts/boss11_readability.gd")
var body: Sprite2D
var marks: Node2D
var phase_progress:=0.5
var projectiles: Node2D
func paint(board: String) -> void:
 marks.begin()
 projectiles.visible=board=="projectiles"
 match board:
  "slam":marks.circle(Vector2.ZERO,STYLE.SLAM_R,phase_progress)
  "tideWave":marks.ring(Vector2.ZERO,1000+60,120,-0.65,1.6,phase_progress)
  "burrowStrike":marks.circle(Vector2(260,140),STYLE.ERUPT_R,phase_progress)
  "lavaPools":
   for point in [Vector2(220,0),Vector2(220,360),Vector2(220,-360)]:marks.circle(point,STYLE.POOL_R,phase_progress)
  "chaseAoe":marks.circle(Vector2(260,140),STYLE.CHASE_R,phase_progress)
  "groundFissure":
   marks.strip(Vector2.ZERO,Vector2(STYLE.FISSURE_LENGTH,0),140,phase_progress,true)
   marks.circle(Vector2(STYLE.FISSURE_LENGTH,0),STYLE.FISSURE_BLAST,phase_progress)
  "slashCombo":marks.sector(Vector2.ZERO,359,0,2.4,phase_progress)
  "sweep":marks.sector(Vector2.ZERO,459,0,3.4,phase_progress)
  "spin":marks.circle(Vector2.ZERO,500,phase_progress)
  "grab":marks.circle(Vector2.ZERO,259,phase_progress)
  "jump":marks.circle(Vector2(450,100),300,phase_progress)
 marks.finish()
 if is_instance_valid(marks.overlay):marks.overlay.queue_redraw()
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-BOSS11-03-Isolated":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
 if output.is_empty():quit(3);return
 root.size=Vector2i(1600,900);root.content_scale_size=root.size
 DisplayServer.window_set_size(root.size)
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 scene.activate_space("arena")
 var arena: Node2D=scene.arena_view
 body=Sprite2D.new();body.texture=preload("res://assets/maps/map11/boss_dark_druid_8dir_v3.png")
 body.region_enabled=true;body.region_rect=Rect2(0,0,414,620);body.offset=Vector2(0,-310)
 body.z_index=350;arena.add_child(body)
 marks=preload("res://scripts/boss11_telegraph.gd").new();marks.z_index=349;arena.add_child(marks)
 # Existing HUD widgets, fixture values only. Never write actor/HP/gate/final death.
 var hud: Node=main.hud.get_node("PublicHUD/Demo11OwnerHUD")
 hud.set_process(false);hud._boss.show();hud._boss_name.text="다크드루이드"
 hud._boss_value.text="7500 / 10000";hud._boss_fill.size.x=375
 var receipt: Array=[]
 main.camera.zoom=Vector2.ONE*preload("res://scripts/boss11_camera.gd").ARENA_ZOOM
 await settle(arena.global_position+Vector2(450,260))
 for i in range(180):await physics_frame
 # Freeze composition; after intentionally changes the baseline camera zoom.
 main.process_mode=Node.PROCESS_MODE_DISABLED
 main.player.global_position=arena.global_position+Vector2(450,100)
 main.player.reset_physics_interpolation()
 main.player.set_physics_process(false)
 main.camera.position_smoothing_enabled=false
 main.camera.zoom=Vector2.ONE*preload("res://scripts/boss11_camera.gd").ARENA_ZOOM
 main.camera.offset=Vector2.ZERO
 main.camera.global_position=arena.global_position+Vector2(100,0)
 main.camera.reset_smoothing();main.camera.reset_physics_interpolation();main.camera.force_update_scroll()
 body.material=scene.get_node("MAP11Detail").material_
 body.set_instance_shader_parameter("rim_color",STYLE.RIM)
 projectiles=preload("res://tests/capture_boss11_01.gd").Warnings.new();projectiles.board="projectiles";projectiles.revised=true;projectiles.z_index=350;arena.add_child(projectiles);projectiles.hide()
 marks.bind_player(main.player)
 var one_board: String=""
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--board="):one_board=arg.trim_prefix("--board=")
 if "--benchmark-only" not in OS.get_cmdline_user_args():
  for board in []:
   if not one_board.is_empty():continue
   marks.begin();marks.finish()
   main.camera.zoom=Vector2.ONE*STYLE.ZOOM
   main.camera.global_position=arena.global_position+Vector2(0,STYLE.CAMERA_Y)
   main.camera.reset_smoothing();main.camera.reset_physics_interpolation();main.camera.force_update_scroll()
   await capture("before_"+board)
  main.camera.zoom=Vector2.ONE*preload("res://scripts/boss11_camera.gd").ARENA_ZOOM
  main.camera.global_position=arena.global_position+Vector2(100,0)
  main.camera.reset_smoothing();main.camera.reset_physics_interpolation();main.camera.force_update_scroll()
  for board in ["slam","groundFissure","tideWave","projectiles"]:
   if not one_board.is_empty() and one_board!=board:continue
   phase_progress=0.5;paint(board)
   await capture("after_"+board)
   receipt.append({"board":board,"live_pattern_execution":false,"source_dimensions":true})
  for phase in [0.5]:
   if not one_board.is_empty():continue
   phase_progress=phase;paint("slam")
   await capture("after_charge_"+str(int(phase*100)))
  
 var f:=FileAccess.open(output.path_join("receipt.json" if one_board.is_empty() else "receipt_"+one_board+".json"),FileAccess.WRITE)
 f.store_string(JSON.stringify({"boards":receipt,"size":[1600,900],"crop":[480,150,640,600],"zoom":preload("res://scripts/boss11_camera.gd").ARENA_ZOOM,"no_product_entry":true,"boss_bar":"DEMO11-42 widgets, fixture 7500/10000","verdict":"RETOUCH: .36 improves player size; full phase4 slam cannot fit in requested zoom range"},"  "))
 if "--captures-only" in OS.get_cmdline_user_args():
  main.queue_free()
  for i in range(16):await process_frame
  quit(0 if failures==0 else 1);return
 main.process_mode=Node.PROCESS_MODE_INHERIT;main.player.set_physics_process(true)
 OS.low_processor_usage_mode=false;Engine.max_fps=240
 DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 DisplayServer.window_move_to_foreground()
 phase_progress=0.5;paint("lavaPools");body.modulate=Color.WHITE
 # One nominal arena sample; focus loss allows exactly one retry.
 var sample: Dictionary=await _measure_attempt("arena",arena.global_position+Vector2(1250,80))
 if not sample.valid:
  var rejected: Dictionary=sample
  sample=await _measure_attempt("arena",arena.global_position+Vector2(1250,80))
  sample["rejected_attempt"]=rejected
 f=FileAccess.open(output.path_join("../benchmark.json"),FileAccess.WRITE)
 f.store_string(JSON.stringify(sample,"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0 if failures==0 else 1)
