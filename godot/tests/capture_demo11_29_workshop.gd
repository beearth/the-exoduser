extends SceneTree
const USERDIR="EXODUSER-demo11-29-Isolated-20261021"
var main: Node
func _initialize() -> void:call_deferred("_run")
func _run() -> void:
 if OS.get_user_data_dir().get_file()!=USERDIR:quit(2);return
 TranslationServer.set_locale("ko");root.size=Vector2i(1920,1080);DisplayServer.window_set_size(Vector2i(1920,1080))
 var out: String=""
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--capture-dir="):out=arg.trim_prefix("--capture-dir=")
 if out.is_empty():quit(2);return
 DirAccess.make_dir_recursive_absolute(out)
 main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 if not main.is_node_ready():await main.ready
 var state: Node=main.source_state;var g: Dictionary=state.read_current_g();g.mats=240600
 # Explicit display materials only, using the actual drop bag owner. No user save/seed change.
 for spec in [["cr_blood_oath",2,85],["cr_last_breath",0,48],["cr_last_breath",0,61],["cr_last_breath",0,76]]:
  state.apply_native_drop_bags(main,{"id":spec[0],"star":spec[1],"enh":0,"q":spec[2]},{"q":85})
 state.apply_native_drop_bags(main,null,{"q":100})
 main.open_native_workshop()
 var panel: Node=main.source_workshop_panel
 var inv: Dictionary=state.read_current_inventory();var item: Dictionary=inv.equipped.weapon
 var bags: Dictionary=state.read_native_reward_bags()
 for i in range(5-item.get("crystals",[]).size()):main.request_native_workshop("unseal",{"slot":"weapon","item":item,"q":85})
 var receipt: Dictionary=main.request_native_workshop("attach",{"slot":"weapon","item":item,"socket_index":0,"gem_index":0,"gem":bags.crystal[0]})
 if not receipt.get("applied",false):printerr("CAPTURE29_FAIL attach fixture ",receipt);quit(1);return
 var evidence: Array=[];var failures:=0
 for tab in ["sockets","gems"]:
  panel.choose_tab(tab)
  await process_frame;await process_frame;await RenderingServer.frame_post_draw
  var image: Image=root.get_texture().get_image()
  var rect: Rect2=panel._screen.get_child(1).get_global_rect()
  if image.get_width()!=1920 or image.get_height()!=1080 or rect.end.x>1920 or rect.end.y>1080:failures+=1
  var full: String=out.path_join(tab+"-1920x1080.png");var crop: String=out.path_join(tab+"-panel-1x.png")
  if image.save_png(full)!=OK:failures+=1
  if image.get_region(Rect2i(rect)).save_png(crop)!=OK:failures+=1
  evidence.append({"tab":tab,"full":full,"crop":crop,"scale":1,"viewport":[image.get_width(),image.get_height()],"panel_rect":[rect.position.x,rect.position.y,rect.size.x,rect.size.y]})
 var file=FileAccess.open(out.path_join("capture.json"),FileAccess.WRITE);file.store_string(JSON.stringify({"captures":evidence,"failures":failures,"material_fixture":true},"  "));file.close()
 var key:=InputEventKey.new();key.physical_keycode=KEY_G;key.pressed=true
 root.push_input(key,true)
 if panel._opened or main.source_forge._opened or get_tree_pause_check():failures+=1
 for child in main.find_children("*","AudioStreamPlayer",true,false):child.stop()
 main.queue_free();main=null;await process_frame;await create_timer(.15).timeout
 print("CAPTURE29_RESULT ",JSON.stringify({"assertions":7,"failures":failures,"captures":evidence}))
 quit(1 if failures else 0)

func get_tree_pause_check() -> bool:return paused
