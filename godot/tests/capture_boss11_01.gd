extends "res://tests/benchmark_map11_21.gd"
## Isolated composition only. No gate flags/signals, source ticks or combat owners.
const STYLE=preload("res://scripts/boss11_readability.gd")
var body: Sprite2D
var warnings: Node2D
class Warnings extends Node2D:
 var board: String="idle"
 var revised: bool=false
 func _draw() -> void:
  var style=preload("res://scripts/boss11_readability.gd")
  var centers: Array[Vector2]=[]
  var radius: float=0
  match board:
   "slam":centers=[Vector2.ZERO];radius=style.SLAM_R
   "tideWave":centers=[Vector2.ZERO];radius=style.TIDE_R
   "burrowStrike":centers=[Vector2(260,140)];radius=style.ERUPT_R
   "lavaPools":centers=[Vector2(220,0),Vector2(220,360),Vector2(220,-360)];radius=style.POOL_R
   "chaseAoe":centers=[Vector2(260,140)];radius=style.CHASE_R
   "groundFissure":
    var end:=Vector2(style.FISSURE_LENGTH,0)
    draw_line(Vector2.ZERO,end,style.INK if revised else Color(1,.24,.28,.9),style.HALO if revised else 22,true)
    draw_line(Vector2.ZERO,end,style.WARNING if revised else Color(1,.24,.28,.9),style.EDGE,true)
    centers=[end];radius=style.FISSURE_BLAST
   "projectiles":
    for i in range(5):
     var point:=Vector2(-240+i*120,180)
     var col:=Color(.4,1,.7) if i%2==0 else Color(.30,.8,1)
     draw_circle(point,26,style.INK,true,-1,true)
     draw_circle(point,18,col,true,-1,true)
    return
  for center in centers:
   if revised:draw_arc(center,radius,0,TAU,160,style.INK,style.HALO,true)
   draw_arc(center,radius,0,TAU,160,style.WARNING if revised else Color(1,.24,.28,.7),style.EDGE,true)
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-BOSS11-01-Isolated":quit(2);return
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
 warnings=Warnings.new();warnings.z_index=349;arena.add_child(warnings)
 # Existing HUD widgets, fixture values only. Never write actor/HP/gate/final death.
 var hud: Node=main.hud.get_node("PublicHUD/Demo11OwnerHUD")
 hud.set_process(false);hud._boss.show();hud._boss_name.text="다크드루이드"
 hud._boss_value.text="7500 / 10000";hud._boss_fill.size.x=375
 var boards=["idle","movement","slam","tideWave","burrowStrike","lavaPools","chaseAoe","groundFissure","projectiles","hit"]
 var receipt: Array=[]
 main.camera.zoom=Vector2.ONE*STYLE.ZOOM
 await settle(arena.global_position+Vector2(450,260))
 for i in range(180):await physics_frame
 # Freeze composition after startup: same camera/player/lighting for both tags.
 main.process_mode=Node.PROCESS_MODE_DISABLED
 main.player.global_position=arena.global_position+Vector2(450,100)
 main.player.reset_physics_interpolation()
 main.player.set_physics_process(false)
 main.camera.position_smoothing_enabled=false
 main.camera.global_position=arena.global_position+Vector2(0,STYLE.CAMERA_Y)
 main.camera.reset_smoothing();main.camera.reset_physics_interpolation();main.camera.force_update_scroll()
 for tag in ["before","after"]:
  for board in boards:
   warnings.board=board;warnings.revised=tag=="after";warnings.queue_redraw()
   body.position=Vector2(180,80) if board=="movement" else Vector2.ZERO
   body.material=scene.get_node("MAP11Detail").material_ if tag=="after" else null
   if tag=="after":body.set_instance_shader_parameter("rim_color",STYLE.RIM)
   body.modulate=Color(1.4,1.25,1.15) if board=="hit" else Color.WHITE
   await capture(tag+"_"+board)
   receipt.append({"tag":tag,"board":board,"live_pattern_execution":false,"pose":"idle atlas; movement position/hit tint only","projectile_class_execution":false})
 var f:=FileAccess.open(output.path_join("receipt.json"),FileAccess.WRITE)
 f.store_string(JSON.stringify({"boards":receipt,"size":[1600,900],"crop":[480,150,640,600],"zoom":STYLE.ZOOM,"no_product_entry":true,"boss_bar":"DEMO11-42 widgets, fixture 7500/10000","verdict":"RETOUCH: live renderer and all-pattern coverage pending"},"  "))
 if "--captures-only" in OS.get_cmdline_user_args():
  main.queue_free()
  for i in range(16):await process_frame
  quit(0 if failures==0 else 1);return
 main.process_mode=Node.PROCESS_MODE_INHERIT;main.player.set_physics_process(true)
 OS.low_processor_usage_mode=false;Engine.max_fps=240
 DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 DisplayServer.window_move_to_foreground()
 warnings.board="lavaPools";warnings.queue_redraw();body.modulate=Color.WHITE
 # One nominal arena sample; inherited sampler invalidates any focus loss. No retry.
 var sample: Dictionary=await _measure_attempt("arena",arena.global_position+Vector2(1250,80))
 f=FileAccess.open(output.path_join("../benchmark.json"),FileAccess.WRITE)
 f.store_string(JSON.stringify(sample,"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0 if failures==0 else 1)
