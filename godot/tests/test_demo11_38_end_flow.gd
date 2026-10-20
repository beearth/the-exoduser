extends SceneTree
const USERDIR := "EXODUSER-demo11-38-Isolated-20261021"
var checks := 0
var failures := 0
var urls: Array = []
func _initialize() -> void: call_deferred("_run")
func check(ok: bool, label: String) -> void:
 checks+=1
 if not ok:
  failures+=1
  print("DEMO1138_FAIL ",label)
func argument(key: String) -> String:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with(key+"="):return arg.substr(key.length()+1)
 return ""
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolated userdir")
 var node := argument("--node-bin")
 check(not node.is_empty(),"explicit node binary")
 var output: Array=[]
 var exit_code := OS.execute(node,PackedStringArray([ProjectSettings.globalize_path("res://tests/demo11_38_source_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html")]),output,true)
 var joined := ""
 for chunk in output:joined+=str(chunk)
 check(exit_code==0,"original nextStage/click oracle "+joined.left(160))
 var oracle: Variant=JSON.parse_string(joined)
 check(oracle is Dictionary,"complete oracle")
 if not oracle is Dictionary:quit(1);return
 var main: Node=load("res://scenes/main.tscn").instantiate()
 root.add_child(main)
 current_scene=main
 for i in 8: await physics_frame
 var flow: Node=main.native_demo_end_flow
 var state: Node=main.source_state
 var world: Node=main.world
 var player: Node=main.player
 check(flow.get_snapshot().phase=="playing","boot stays playing, no synthetic death")
 check(not flow.get("_view").visible,"end UI hidden at boot")
 check(main.read_native_demo_policy().last_stage==0,"actual 1-1 authority last stage")
 var stranger := Node.new()
 check(not state.commit_native_demo_clear(stranger,0,false),"foreign writer rejected")
 stranger.free()
 check(not state.commit_native_demo_clear(main,0,true),"end before clear rejected")
 for bad in [-1,1,3,1000]:
  main.native_demo_boss_defeated.emit(bad)
  check(flow.get_snapshot().phase=="playing","reject wrong stage "+str(bad))
 state.read_current_g().stage=1
 main.native_demo_boss_defeated.emit(0)
 check(flow.get_snapshot().phase=="playing","current State stage mismatch rejected")
 state.read_current_g().stage=0
 main.native_demo_boss_defeated.emit(0) # DEMO11-37 contract, no boss death implementation.
 check(flow.get_snapshot().phase=="clear" and flow.get_snapshot().clear_count==1,"one accepted clear signal")
 check(state.read_current_g().stageCleared and not state.read_current_g().on,"clear flags actual State")
 check(main.process_mode==Node.PROCESS_MODE_DISABLED,"finished run suspended")
 var at_signal: float=world.get_native_frame()
 # physics_frame is emitted before node callbacks; finish the in-flight tick
 # before measuring four subsequent ticks. Do not compare across that boundary.
 await physics_frame
 check(not world.can_process() and not player.can_process(),"actual world/player processing disabled")
 var frame: float=world.get_native_frame()
 for i in 4:await physics_frame
 var after_freeze: float=world.get_native_frame()
 check(after_freeze==frame,"physical world no longer advances: "+str([at_signal,frame,after_freeze]))
 print("DEMO1138_FREEZE ",JSON.stringify({"at_signal":at_signal,"settled":frame,"after4":after_freeze}))
 for i in 3:main.native_demo_boss_defeated.emit(0)
 check(flow.get_snapshot().clear_count==1,"duplicate clear does not reopen")
 var view: Control=flow.get("_view")
 check(view.buttons.next.text=="데모 종료","source clear CTA")
 view.buttons.next.pressed.emit() # Actual button connection.
 check(flow.get_snapshot().phase=="end" and flow.get_snapshot().end_count==1,"next button enters demoEnd once")
 check(state.read_current_g().stage==oracle.stage and state.read_current_g().on==oracle.on and state.read_current_g().stageCleared==oracle.stageCleared,"actual State equals original final branch")
 check(main.world==world and main.player==player and world.map_data.stage==0,"same actual stage0 world and player, no stage1 replacement")
 check(view.text("end_title")==oracle.title and view.text("end_body").replace("\n"," ")==oracle.body,"original title/body")
 for i in 3:
  flow.call("_act","next")
  main.native_demo_boss_defeated.emit(0)
 check(flow.get_snapshot().end_count==1 and flow.get_snapshot().clear_count==1,"end rejects duplicate next and clear")
 check(state.read_current_g().stage==0,"no stage1 after duplicates")
 check(flow.get_snapshot().wishlist_url==oracle.wishlist_url,"original Steam URL, no invented app id")
 # Intercept only the OS boundary; exercise the actual button -> consumer signal.
 flow.wishlist_requested.disconnect(Callable(main,"_open_native_demo_wishlist"))
 flow.wishlist_requested.connect(func(url: String):urls.append(url))
 view.buttons.wishlist.pressed.emit()
 check(urls==[oracle.wishlist_url] and flow.get_snapshot().phase=="end","wishlist dispatched without leaving demoEnd")
 flow.report_link_result(ERR_CANT_OPEN)
 check(view.get("_notice").text==view.text("link_failed"),"failed OS navigation stays retryable")
 view.get("_notice").text=""
 var font: Font=view.buttons.lobby.get_theme_font("font")
 check(font!=null and view.buttons.lobby.custom_minimum_size.y>=44,"token font and minimum input target")
 # Unknown locales use the registered English subset, no untranslated empty CTA.
 var ko: String=view.text("lobby")
 view.language="fr";check(view.text("lobby")=="Return to Lobby","non-Korean English fallback")
 view.language="ko";check(view.text("lobby")==ko,"Korean restored")
 var captures := argument("--captures")
 if not captures.is_empty():
  check(DisplayServer.get_name()!="headless","capture rendered with window display server")
  root.content_scale_size=Vector2i(1920,1080)
  root.size=Vector2i(1920,1080)
  for i in 3:await process_frame
  await RenderingServer.frame_post_draw
  var image: Image=root.get_texture().get_image()
  check(image.get_size()==Vector2i(1920,1080),"capture is exactly1920x1080")
  DirAccess.make_dir_recursive_absolute(captures)
  check(image.save_png(captures+"/demoEnd-1920x1080.png")==OK,"full viewport PNG")
  check(image.get_region(Rect2i(520,160,880,760)).save_png(captures+"/demoEnd-crop-1x.png")==OK,"unscaled1x crop")
  var meta := FileAccess.open(captures+"/capture.json",FileAccess.WRITE)
  meta.store_string(JSON.stringify({"viewport":[1920,1080],"crop":[520,160,880,760],"scale":1,"display_server":DisplayServer.get_name(),"phase":flow.get_snapshot().phase,"main_scene":"res://scenes/main.tscn","signal_injected":true,"boss_death_implemented":false}));meta.close()
 var main_ref: WeakRef = weakref(main)
 view.buttons.lobby.pressed.emit()
 flow.call("_act","lobby")
 check(flow.get_snapshot().lobby_count==1,"return navigation once even duplicate click")
 for i in 16:await process_frame
 check(current_scene!=null and current_scene.name=="DemoLobby","actual scene changed to native demo lobby")
 check(main_ref.get_ref()==null,"finished Main World player resources freed")
 check(root.find_children("CH1CanonicalWorld","",true,false).is_empty(),"no combat world created on lobby return")
 var lobby: Node=current_scene
 check(lobby.get("_view").page=="lobby","native lobby landing rendered")
 var lobby_ref: WeakRef = weakref(lobby)
 lobby.get("_view").buttons.replay.pressed.emit()
 lobby.call("_act","replay")
 for i in 16:await process_frame
 check(current_scene!=null and current_scene.name=="EXODUSER","replay returns to actual Main")
 check(lobby_ref.get_ref()==null,"lobby freed after replay")
 check(current_scene.read_native_demo_policy().stage==0 and current_scene.world.map_data.stage==0 and current_scene.source_state.read_current_p().lv==1,"replay starts fresh stage0 no stage1")
 check(current_scene.native_demo_end_flow.get_snapshot().phase=="playing","new run gets a fresh duplicate guard")
 current_scene.queue_free()
 for i in 16:await process_frame
 await create_timer(0.2).timeout
 print("DEMO1138_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skip":0,"signal_injected":true,"boss_death_detection":false,"external_browser_opened":false}))
 quit(1 if failures else 0)
