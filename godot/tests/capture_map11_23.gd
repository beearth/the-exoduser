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
 if OS.get_user_data_dir().get_file()!="EXODUSER-MAP11-23-Isolated":quit(2);return
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
 scene.activate_space("field")
 for site in preload("res://scripts/maps/map11/tour_layout.gd").SCENES:
  await settle(site.camera);await capture(tag+"_"+site.id)
 var detail: Node=scene.get_node("MAP11Detail")
 var wheel: Node2D=detail.hell_props[7]
 await settle(wheel.global_position-Vector2(0,150));await capture(tag+"_08_execution_behind")
 check(is_equal_approx(wheel.modulate.a,.15),"actual camera foreground wheel fade")
 await settle(wheel.global_position+Vector2(0,100));await capture(tag+"_09_execution_front")
 check(is_equal_approx(wheel.modulate.a,1.0),"actual camera foreground wheel restored")
 scene.activate_space("arena")
 await settle(origin+Vector2(0,1100));await capture(tag+"_07_boss_entry")
 var field: Node2D=scene.field_view
 scene.activate_space("field")
 for i in [7,8,9,10]:
  var prop: Node2D=detail.hell_props[i]
  await settle(prop.global_position-Vector2(0,150))
  check(is_equal_approx(prop.modulate.a,.15),"execution actual camera fade %d"%i)
  await settle(prop.global_position+Vector2(0,100))
  check(is_equal_approx(prop.modulate.a,1.0),"execution actual camera restore %d"%i)
 var f:=FileAccess.open(output.path_join(tag+"_receipt.json"),FileAccess.WRITE)
 f.store_string(JSON.stringify({"checks":checks,"failures":failures,"space":"nominal arena visual; PC gate pending","size":[1600,900],"zoom":main.camera.zoom,"crop":[480,150,640,600]},"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0 if failures==0 else 1)
