extends SceneTree
var checks:=0
var failures:=0
func _initialize()->void:call_deferred("run")
func check(ok:bool,label:String)->void:
 checks+=1
 if not ok:failures+=1;printerr("SWEEPB_FAIL ",label)
func run()->void:
 check(OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-SWEEPB-Test-Isolated-"),"fresh isolated storage")
 var entry=preload("res://scripts/native_demo_lobby_entry.gd")
 check(entry.validate_name("a/b").ready and entry.validate_name("a\\b").ready,"source permits path punctuation in character names")
 check(not entry.validate_name("<>").ready and not entry.validate_name("a&").ready,"source excludes HTML delimiters")
 var lobby:Node=load("res://scenes/demo_lobby.tscn").instantiate();root.add_child(lobby);await process_frame
 lobby._choose(0);lobby._open_name()
 check(lobby.name_input.is_visible_in_tree(),"create step owns live editable field")
 lobby._close_form();check(not lobby._form.visible,"name cancel returns to lobby")
 lobby._select_language(1);await process_frame
 check(lobby.menu.storage.get_item("hellLang").raw=="en" and TranslationServer.get_locale().begins_with("en"),"language selection persists and changes current UI")
 lobby._select_language(0)
 lobby._show_quit();check(lobby.modal.visible and lobby.cancel.has_focus(),"quit opens with cancel focused")
 lobby.cancel.pressed.emit();check(not lobby.modal.visible,"cancel quit preserves running scene")
 lobby._choose(0);lobby._open_name();lobby.name_input.text="순례자";lobby._create()
 check(lobby.menu.rows[0].kind=="new" and lobby.slot_delete_buttons[0].visible,"actual new metadata produces slot delete control")
 lobby.slot_delete_buttons[0].pressed.emit();check(lobby.modal.visible,"slot delete opens source confirmation")
 lobby.cancel.pressed.emit();check(lobby.menu.rows[0].kind=="new","delete cancellation preserves record")
 lobby.slot_delete_buttons[0].pressed.emit();lobby.confirm.pressed.emit();check(lobby.menu.rows[0].kind=="empty","confirmed delete removes only selected isolated slot")
 lobby.queue_free();await process_frame
 var main:Node=load("res://scenes/main.tscn").instantiate();root.add_child(main);current_scene=main
 for i in 8:await physics_frame
 main._toggle_pause()
 var settings:Node=main.native_demo_pause_menu._center
 settings._rebuild("sound");settings.controls.sfxVol.value=37;settings.controls.sfxVol.drag_ended.emit(true)
 settings._rebuild("sound")
 var content:Node
 for child in settings._panel.get_children():
  if child is ScrollContainer:content=child.get_child(0)
 check(content.values.optSfxVal.text=="37%","reopened volume label reads committed option")
 settings._rebuild("screen");settings.controls.fpsCap.value=3;settings.controls.fpsCap.drag_ended.emit(true)
 for child in settings._panel.get_children():
  if child is ScrollContainer:content=child.get_child(0)
 check(content.values.optFpsVal.text=="144" and Engine.max_fps==144,"FPS label and render cap use actual cap")
 settings._rebuild("system")
 for child in settings._panel.get_children():
  if child is ScrollContainer:content=child.get_child(0)
 check(settings.controls.autoPotThr.value==99 and content.values.optAutoPotVal.text=="HP 99% 이하","fractional threshold is displayed in source percent units")
 main._toggle_pause()
 var growth:Node=main.get_node("NativeGrowthPanel");growth.open_panel()
 check(growth.get_snapshot().opened and paused,"source growth shell opens actual pause flow")
 growth.select_node("pMagic");growth._set_zoom(1.25);growth.close_panel()
 check(not paused and not main.source_state.read_current_g().statOpen,"growth close restores actual run")
 var view:Node=main.native_demo_end_flow._view;view.show_page("end")
 check(view.buttons.has("wishlist") and view.buttons.has("lobby") and not view.buttons.has("next"),"end presents source actions")
 main.queue_free();await process_frame
 print("SWEEPB_UI_RESULT ",JSON.stringify({"checks":checks,"failures":failures}));quit(1 if failures else 0)
