extends "res://tests/capture_map11_hell_props.gd"
var tag: String="before"
class RangePreview extends Node2D:
 func _draw() -> void:
  var source=preload("res://scripts/maps/map11/arena_preview.gd")
  draw_arc(Vector2.ZERO,source.SLAM_R,0,TAU,160,Color(1,.61,.19,.90),9,true)
  draw_arc(Vector2.ZERO,source.TIDE_R,0,TAU,180,Color(.45,.77,.97,.8),8,true)
  draw_line(Vector2.ZERO,Vector2(source.FISSURE_LENGTH,0),Color(1,.24,.28,.9),22,true)
  draw_arc(Vector2(source.FISSURE_LENGTH,0),source.FISSURE_BLAST,0,TAU,96,Color(1,.24,.28,.7),9,true)
  for center in [Vector2.ZERO,Vector2(-1430,-300),Vector2(1300,-400)]:
   for i in range(5):
    var point: Vector2=center+Vector2((i-2)*65,0)
    var tint: Color=[Color(1,.18,.09),Color(.65,.35,1),Color(.45,.95,1),Color(1,.85,.35),Color(.4,1,.7)][i]
    draw_circle(point,7.2,Color(.025,.015,.02),true,-1,true)
    draw_circle(point,5.2,tint,true,-1,true)
    draw_arc(point+Vector2(0,70),26,0,TAU,32,Color(.30,.8,1,.9),5,true)

func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-22d-Isolated-20261021":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
  if arg.begins_with("--tag="):tag=arg.trim_prefix("--tag=")
 if output.is_empty():quit(3);return
 root.size=Vector2i(1600,900);root.content_scale_size=Vector2i(1600,900)
 DisplayServer.window_set_size(Vector2i(1600,900))
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 scene.activate_space("arena")
 var origin: Vector2=scene.arena_view.global_position
 if "--silhouette-only" in OS.get_cmdline_user_args():
  var boss:=Sprite2D.new();boss.name="TestOnlySourceIdleArt_NoBossAI"
  boss.texture=preload("res://assets/maps/map11/boss_dark_druid_8dir_v3.png")
  boss.region_enabled=true;boss.region_rect=Rect2(0,0,414,620)
  boss.offset=Vector2(0,-310);boss.scale=Vector2.ONE*(620.4/620.0)
  boss.position=Vector2(220,-80);boss.z_as_relative=false;boss.z_index=int((origin.y-80)/4.0)
  var actor_material:=ShaderMaterial.new();actor_material.shader=preload("res://scripts/maps/map11/actor_rim.gdshader")
  boss.material=actor_material;boss.set_instance_shader_parameter("rim_color",Color(.62,.20,.16,.30))
  scene.arena_view.add_child(boss)
  for i in range(160):await physics_frame
  await settle(origin);await capture("silhouette_source_idle_no_ai")
  boss.hide()
  var overview:=Camera2D.new();overview.position=Vector2.ZERO;overview.zoom=Vector2(.20,.20)
  scene.arena_view.add_child(overview);overview.make_current()
  for i in range(8):await process_frame
  await capture("ritual_overview")
  main.queue_free()
  for i in range(16):await process_frame
  quit(0 if failures==0 else 1);return
 for site in [["01_entry",Vector2(0,1100)],["02_center",Vector2.ZERO]]:
  await settle(origin+site[1]);await capture(tag+"_"+site[0])
  if site[0]=="01_entry":
   for i in range(140):await physics_frame
   if tag=="after":await capture("after_01_entry_combat")
 var f:=FileAccess.open(output.path_join(tag+"_receipt.json"),FileAccess.WRITE)
 f.store_string(JSON.stringify({"checks":checks,"failures":failures,"space":"nominal arena visual; PC gate pending","size":[1600,900],"zoom":main.camera.zoom,"crop":[480,150,640,600]},"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0 if failures==0 else 1)
