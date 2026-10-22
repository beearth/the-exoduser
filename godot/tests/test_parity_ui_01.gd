extends SceneTree
const Store=preload("res://port_modules/save_adapter/demo_local_storage.gd")
var checks:=0
var failures:=0
func _initialize() -> void:call_deferred("run")
func check(value: bool,label: String) -> void:
 checks+=1
 if not value:failures+=1;printerr("PARITY_UI_FAIL ",label)
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-demo11-parity-ui-01-Isolated-20261022":quit(2);return
 check(Store.accepts_namespace("/synthetic/EXODUSER-Godot-Native-First"),"product admitted purely; no product path IO")
 check(not Store.accepts_namespace("/synthetic/EXODUSER-other"),"unrelated namespace rejected")
 var lobby: Node=load("res://scenes/demo_lobby.tscn").instantiate();root.add_child(lobby)
 await process_frame
 check(lobby.menu.ready and lobby.menu.rows.size()==5,"five isolated slots")
 lobby.queue_free();await process_frame
 var main: Node=load("res://scenes/main.tscn").instantiate();root.add_child(main);current_scene=main
 for i in 12:await physics_frame
 check(is_instance_valid(main.source_inventory_ui),"inventory exists without storage flag")
 check(main.source_inventory_ui.open_panel(),"inventory opens")
 main.source_inventory_ui.close_panel()
 check(main.native_demo_life.snapshot().retry_stage_ready,"stage restoration callback bound")
 check(main._parity_ui_restore_stage(main).status=="READY","normal field restore admitted")
 print("PARITY_UI_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"product_dir_io":false}))
 main.queue_free();await process_frame;quit(1 if failures else 0)
