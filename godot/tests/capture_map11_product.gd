extends SceneTree
const USERDIR := "EXODUSER-map11-prod-Isolated-20261021"
var checks:=0
var failures:=0
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("MAP11_CAPTURE_FAIL ",label)
func argument(key: String) -> String:
 for s in OS.get_cmdline_user_args():
  if s.begins_with(key+"="):return s.substr(key.length()+1)
 return ""
func capture(name: String) -> void:
 for i in 4:await process_frame
 await RenderingServer.frame_post_draw
 var image:=root.get_texture().get_image()
 check(image.get_size()==Vector2i(1920,1080),"viewport1920x1080")
 check(image.save_png(argument("--captures")+"/"+name+".png")==OK,"full viewport saved")
 check(image.get_region(Rect2i(700,340,520,440)).save_png(argument("--captures")+"/"+name+"_player_1x.png")==OK,"unscaled player/environment crop")
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"actual namespace")
 if failures:quit(1);return
 DisplayServer.window_set_size(Vector2i(1920,1080));root.size=Vector2i(1920,1080)
 var main: Node=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 for i in 8:await physics_frame
 main.source_state.read_current_g().on=true
 check(main.native_map11.current(),"actual production provider current")
 check(main.source_initialization_services.is_native_main_random_bridge_current(main,main.world),"protected bridge admitted after actual boot")
 check(not main.world.get_encounter_report().installed,"no fabricated canonical encounter installation")
 check(main.world.install_native_encounters({}).valid==false,"legacy-coordinate encounter API fails closed on MAP11")
 await capture("01_main_field")
 main.player.global_position=main.read_native_map11_provider().transition_sites().field_gate.global_position
 for i in 4:await physics_frame
 check(main.native_map11.snapshot().space=="arena","automatic actual Main gate contact")
 await capture("02_main_arena")
 var evidence: Dictionary={"space":main.native_map11.snapshot().space,"position":str(main.player.global_position),"camera_screen_center":str(main.camera.get_screen_center_position()),"camera_node":str(main.camera.global_position),"provider":main.read_native_map11_provider().describe(),"protected_rng_bridge":main.source_initialization_services.is_native_main_random_bridge_current(main,main.world)}
 main.queue_free()
 for i in 16:await process_frame
 await create_timer(.2).timeout
 print("MAP11_CAPTURE_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"evidence":evidence,"scope":"actual Main render harness; no manual desktop play, no combat completion"}))
 quit(1 if failures else 0)
