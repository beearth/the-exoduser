extends SceneTree
## Explicit one-shot inspection, never installed in product tick paths.
var out: String
var label: String
var dump_done:=false
func received(_message: String,_data: Array) -> bool:
 dump_done=true;return true
func _initialize() -> void:call_deferred("run")
func snapshot(state: String) -> void:
 for i in 4:await process_frame
 await RenderingServer.frame_post_draw
 dump_done=false
 EngineDebugger.send_message("vram:snapshot",[label+"-"+state])
 while not dump_done:await process_frame
 var clean: Array=[]
 var report: Dictionary={"state":state,"texture":Performance.get_monitor(Performance.RENDER_TEXTURE_MEM_USED),"video":Performance.get_monitor(Performance.RENDER_VIDEO_MEM_USED),"textures":clean}
 var f:=FileAccess.open(out.path_join(label+"-"+state+".json"),FileAccess.WRITE);f.store_string(JSON.stringify(report,"  "));f.close()
 root.get_texture().get_image().save_png(out.path_join("captures/"+label+"-"+state+"-1x.png"))
 print("VRAM_STATE ",state," ",report.texture," ",report.video)
func run() -> void:
 if not OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-VRAM-01-Isolated"):quit(2);return
 for a in OS.get_cmdline_user_args():
  if a.begins_with("--out="):out=a.trim_prefix("--out=")
  if a.begins_with("--label="):label=a.trim_prefix("--label=")
 EngineDebugger.register_message_capture("vram",received)
 root.size=Vector2i(1920,1080);root.content_scale_size=root.size
 var lobby=load("res://scenes/demo_lobby.tscn").instantiate();root.add_child(lobby)
 await snapshot("lobby")
 lobby.queue_free()
 for i in 4:await process_frame
 var main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_story_boot",true);main.set_meta("demo11_storage",true);main.set_meta("native_intro_boot","intro");root.add_child(main);current_scene=main
 for i in 6:await process_frame
 main.native_story_intro.set_process(false);main.native_story_intro.elapsed_ms=1200;main.native_story_intro._view.queue_redraw()
 await snapshot("intro")
 main.native_story_intro.finish("capture")
 for i in 10:await physics_frame
 main.source_intro_sequence.finish_native_guide()
 var deadline: int=Time.get_ticks_msec()+10000
 while not main.source_intro_sequence.lesson_flow.active and Time.get_ticks_msec()<deadline:await process_frame
 if is_instance_valid(main.source_intro_sequence.lesson_flow):main.source_intro_sequence.lesson_flow.skip_all()
 for i in 4:await process_frame
 await snapshot("field")
 paused=true
 assert(main.source_inventory_ui.open_panel())
 await snapshot("inventory")
 main.source_inventory_ui.close_panel()
 for i in 4:await process_frame
 assert(main.source_inventory_ui.open_panel())
 await snapshot("inventory-reopen")
 main.source_inventory_ui.close_panel()
 assert(main.source_inventory_ui.skill_forge.open_panel())
 await snapshot("skills")
 main.source_inventory_ui.skill_forge.close_panel()
 var scene=main.world.get_node("Map11ProductScene");scene.activate_space("arena")
 await snapshot("arena")
 main.queue_free()
 for i in 6:await process_frame
 EngineDebugger.unregister_message_capture("vram")
 print("VRAM_CAPTURE_RESULT ",JSON.stringify({"failures":0,"fixture":true,"e2e":false}));quit()
