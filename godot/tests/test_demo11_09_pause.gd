extends SceneTree
const USERDIR := "EXODUSER-demo11-09-Isolated-20261021"
var checks := 0
var failures := 0
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("DEMO1109_FAIL ",label)
func argument(key: String) -> String:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with(key+"="):return arg.substr(key.length()+1)
 return ""
func binds() -> Dictionary:
 var result: Dictionary={}
 for action in ["move_left","move_right","move_up","move_down","parry","shield_bash","weapon","rage_slot","pause","native_magic"]:
  var events: Array=[]
  for event in InputMap.action_get_events(action):events.append(event.as_text())
  result[action]=events
 return result
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolated userdir")
 var main: Node=load("res://scenes/main.tscn").instantiate()
 root.add_child(main)
 current_scene=main
 for i in 8:await physics_frame
 var menu: Node=main.native_demo_pause_menu
 var options: Dictionary=main.source_initialization_services.read_current_options()
 var before: Dictionary=options.duplicate(true)
 var input_before:=binds()
 var profile: Dictionary=main.read_native_input_bindings()
 var qe: Object=main.player.get("_native_combat_qe")
 check(not menu.is_menu_visible() and not paused,"menu hidden at boot")
 check(menu.read_input_profile()==profile,"existing Main BINDS view reused")
 check(profile.primary.parry=="KeyQ" and profile.primary.shield=="KeyE" and profile.primary.settings=="Escape","Q/E/Esc authority unchanged")
 var settings: Dictionary=menu.read_settings()
 check(settings.status=="NOT_READY" and settings.missing_keys==["textScale","panelFit","diffV2"],"S01 missing fields remain NOT_READY")
 check(not menu.request_settings({"sfxVol":0}).applied,"no fake setting writer when S01 incomplete")
 check(options==before and is_same(options,main.source_initialization_services.read_current_options()),"rejected setting preserves actual OPT identity and bytes")
 main.call("_toggle_pause")
 check(paused and menu.is_menu_visible(),"existing pause route presents menu")
 check(not main.world.can_process() and not main.player.can_process(),"actual world and player paused")
 check(not main.get("_character_panel").visible,"normal pause hides developer character picker")
 var frame: float=main.world.get_native_frame()
 for i in 4:await physics_frame
 check(main.world.get_native_frame()==frame,"world clock frozen during menu")
 menu.buttons.settings.pressed.emit()
 check(paused and menu.get_snapshot().page=="settings","settings view opens without resuming")
 check(menu.get_snapshot().settings_apply_status=="BLOCKED","blocked apply is explicit")
 check(not menu.request_settings({"diffV2":1,"lang":"en","binds":{}}).applied,"protected/unknown writes not accepted")
 main.call("_toggle_pause")
 check(paused and menu.get_snapshot().page=="pause","Escape semantic returns from settings before resume")
 menu.buttons.settings.pressed.emit()
 menu.buttons.back.pressed.emit()
 check(paused and menu.get_snapshot().page=="pause","actual Back button preserves pause")
 var dir:=argument("--captures")
 if not dir.is_empty():
  check(DisplayServer.get_name()!="headless","real display capture")
  root.content_scale_size=Vector2i(1920,1080);root.size=Vector2i(1920,1080)
  for i in 3:await process_frame
  await RenderingServer.frame_post_draw
  var image: Image=root.get_texture().get_image()
  check(image.get_size()==Vector2i(1920,1080),"1920x1080 viewport")
  DirAccess.make_dir_recursive_absolute(dir)
  check(image.save_png(dir+"/pause-1920x1080.png")==OK,"full PNG")
  check(image.get_region(Rect2i(500,100,920,880)).save_png(dir+"/pause-crop-1x.png")==OK,"unscaled1x crop")
 menu.buttons.resume.pressed.emit()
 check(not paused and not menu.is_menu_visible(),"Resume button uses existing pause exit")
 check(main.world.can_process() and main.player.can_process(),"actual processing resumed")
 for i in 3:await physics_frame
 check(main.world.get_native_frame()>frame,"actual world clock advances again")
 check(binds()==input_before and menu.read_input_profile()==profile,"all input event maps/profile unchanged after UI paths")
 check(main.player.get("_native_combat_qe")==qe,"same Q/E adapter identity")
 check(options==before and is_same(options,main.source_initialization_services.read_current_options()),"all options untouched, no default fill or restore")
 main.set_meta("native_review_requires_character",true)
 main.call("_toggle_pause")
 check(paused and not menu.is_menu_visible() and main.get("_character_panel").visible,"review character picker keeps original priority")
 # Existing review guard refuses resume until a character is selected.
 var selected: bool=main.player.get_native_character_profile_snapshot().get("ready")==true
 main.call("_toggle_pause")
 check(paused==not selected,"existing review resume predicate preserved")
 main.set_meta("native_review_requires_character",false)
 if paused:main.call("_toggle_pause")
 check(not paused,"normal pause exit restored")
 main.queue_free()
 for i in 16:await process_frame
 await create_timer(0.2).timeout
 print("DEMO1109_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skip":0,"settings_apply":"BLOCKED:S01_missing_and_S10_absent","saved_settings_restored":false}))
 quit(1 if failures else 0)
