extends SceneTree
var checks:=0
var failures:=0
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;printerr("UI05_FAIL ",label)
func run() -> void:
 check(OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-UI05-Test-Isolated-"),"isolated namespace")
 var lobby: Node=load("res://scenes/demo_lobby.tscn").instantiate();root.add_child(lobby);await process_frame
 lobby._choose(0)
 check(lobby._form.visible and not lobby._name_form.visible,"selection precedes name dialog")
 lobby._open_name();check(lobby.name_input.is_visible_in_tree(),"create opens name dialog")
 lobby.queue_free();await process_frame
 var main: Node=load("res://scenes/main.tscn").instantiate();root.add_child(main);current_scene=main
 for i in 8:await physics_frame
 var before: Dictionary=main.read_native_input_bindings().duplicate(true)
 var menu: Node=main.native_demo_pause_menu
 main._toggle_pause()
 check(menu.is_menu_visible() and menu.get_snapshot().page=="settings","ESC directly opens settings")
 var panel: Node=menu._center
 check(panel.controls.has("tab_system") and panel.controls.has("tab_screen") and panel.controls.has("tab_sound") and panel.controls.has("tab_controls"),"four source tabs")
 panel._rebuild("sound")
 panel.controls.sfxVol.value=37;panel.controls.sfxVol.drag_ended.emit(true)
 check(main.read_native_attack_audio_settings().sfx_percent==37,"sound slider reaches actual consumer")
 panel._rebuild("screen")
 panel.controls.shake.value=0;panel.controls.shake.drag_ended.emit(true)
 check(main.source_initialization_services.read_current_options().shake==0,"display slider reaches OPT owner")
 main._toggle_pause();check(not paused and not menu.is_menu_visible(),"second ESC resumes")
 check(before==main.read_native_input_bindings(),"settings do not rewrite bindings")
 check(main.hud._native_slot_skill_id("qsQ",{"activeQSk":"detonate"})=="detonate","Q source slot identity")
 check(main.hud._skill_icon_textures.get("detonate")!=null,"Q red detonate art preloaded")
 var forge: Node=main.source_inventory_ui.skill_forge
 check(forge.open_panel(),"skill panel actual open")
 var plate_found:=false
 for child in forge.stage.get_children():
  if child is TextureRect and child.texture!=null and child.texture.resource_path=="res://assets/ui/parity_skill_01/altar.png":plate_found=true
 check(plate_found,"integrated SKILL01 altar retained")
 forge.close_panel()
 var g: Dictionary=main.source_state.read_current_g()
 var sample:=g.duplicate(true);sample._bossClearT=60;sample._stageKills=168;sample._totalSpawned=168;sample._sStats={"deaths":0,"dmgTaken":0};sample.comboMax=10
 var result: Dictionary=preload("res://scripts/native_demo11_clear_result.gd").calculate(sample,0)
 check(result.current.s==8230 and result.current.r=="S","source clear score/rank fixture")
 var card:=preload("res://scripts/parity_clear_card.gd").new();root.add_child(card);card.setup(sample)
 check(card.next.text==preload("res://scripts/native_demo_ui_i18n.gd").text("데모 종료"),"clear card next action")
 card.queue_free();main.queue_free();await process_frame
 print("UI05_TEST_RESULT ",JSON.stringify({"checks":checks,"failures":failures}));quit(1 if failures else 0)
