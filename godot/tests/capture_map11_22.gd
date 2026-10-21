extends "res://tests/capture_map11_hell_props.gd"
var tag: String="before"
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-22-Isolated-20261021":quit(2);return
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
 for site in [["01_entry",Vector2(0,1100)],["02_center",Vector2.ZERO],["03_edge",Vector2(-1450,-300)],["04_finale",Vector2(0,-1650)]]:
  await settle(origin+site[1]);await capture(tag+"_"+site[0])
 var f:=FileAccess.open(output.path_join(tag+"_receipt.json"),FileAccess.WRITE)
 f.store_string(JSON.stringify({"checks":checks,"failures":failures,"space":"nominal arena visual; PC gate pending","size":[1600,900],"zoom":main.camera.zoom,"crop":[480,150,640,600]},"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0 if failures==0 else 1)
