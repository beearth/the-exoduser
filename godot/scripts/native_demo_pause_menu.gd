extends CanvasLayer
## DEMO11-09: UI and readonly input/settings handoff. No BINDS or OPT writer.
const SETTINGS = preload("res://scripts/native_settings_read_view.gd")
const FONTS = preload("res://scripts/native_ui_fonts.gd")
const TEXT := {
 "pause":["일시정지","PAUSED"], "settings":["설정","SETTINGS"],
 "resume":["플레이 재개","Resume Play"], "back":["뒤로","Back"],
 "profile":["현재 조작 안내","Current Controls"],
 "move":["이동","Move"], "attack":["기본 공격","Primary Attack"],
 "combat":["Q 패링 · E 방패(불꽃칼날)","Q Parry · E Shield (Flame Blade)"],
 "fixed":["키 변경은 이 메뉴에서 제공하지 않습니다.","Key remapping is not available in this menu."],
 "pending":["설정 기능을 준비하고 있습니다.","Settings are being prepared."],
 "kept":["현재 설정과 조작은 그대로 유지됩니다.","Your current settings and controls are unchanged."],
 "footer":["ESC · 뒤로 / 플레이 재개","ESC · BACK / RESUME"]}
var _main: WeakRef
var _settings: RefCounted
var settings_bridge: RefCounted
var _root: Control
var _center: CenterContainer
var _page := "pause"
var _language := "ko"
var buttons: Dictionary = {}
func configure(main: Node) -> bool:
 _main=weakref(main)
 _settings=SETTINGS.new()
 if not _settings.configure(main.source_initialization_services): return false
 settings_bridge=preload("res://scripts/native_settings_preferences.gd").new()
 if not settings_bridge.configure(main):return false
 name="NativeDemoPauseMenu"
 layer=80
 process_mode=Node.PROCESS_MODE_ALWAYS
 _root=Control.new()
 _root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 add_child(_root)
 var backdrop:=ColorRect.new()
 backdrop.color=Color(0.025,0.02,0.025,0.97)
 backdrop.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 _root.add_child(backdrop)
 _root.visible=false
 return true
func _text(key: String) -> String:
 return TEXT[key][0 if _language.begins_with("ko") else 1]
func read_settings() -> Dictionary:
 return _settings.read_current_options_view()
func read_input_profile() -> Dictionary:
 var main: Node=_main.get_ref()
 return main.read_native_input_bindings().duplicate(true) if is_instance_valid(main) else {"ready":false}
func request_settings(changes: Dictionary) -> Dictionary:
 return settings_bridge.request(changes)
func sync_pause(paused: bool) -> void:
 var main: Node=_main.get_ref()
 _root.visible=paused and is_instance_valid(main) and not main.get_meta("native_review_requires_character",false)
 if _root.visible:
  var language: Dictionary=main.get_native_startup_language_snapshot()
  _language=str(language.get("language","ko"))
  _show("settings")
func is_menu_visible() -> bool:
 return _root.visible
func consume_pause_back() -> bool:
 return false
func _show(page: String) -> void:
 _language=str(read_settings().get("options",{}).get("lang","ko"))
 _page=page
 if is_instance_valid(_center):
  _root.remove_child(_center)
  _center.queue_free()
 buttons.clear()
 if page=="settings":
  var view=preload("res://scripts/native_settings_panel.gd").new()
  _center=view
  _root.add_child(view)
  view.setup(self)
  return
 _center=CenterContainer.new()
 _center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 _root.add_child(_center)
 var panel:=PanelContainer.new()
 panel.custom_minimum_size=Vector2(900,740)
 var style:=StyleBoxFlat.new()
 style.bg_color=Color("131011")
 style.border_color=Color("756957")
 style.set_border_width_all(2)
 style.set_content_margin_all(48)
 style.shadow_color=Color(0,0,0,0.7)
 style.shadow_size=28
 panel.add_theme_stylebox_override("panel",style)
 _center.add_child(panel)
 var box:=VBoxContainer.new()
 box.add_theme_constant_override("separation",18)
 panel.add_child(box)
 var crest:=TextureRect.new()
 crest.texture=preload("res://assets/ui/hell_gothic/crest.png")
 crest.expand_mode=TextureRect.EXPAND_IGNORE_SIZE
 crest.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED
 crest.custom_minimum_size.y=88
 box.add_child(crest)
 _label(box,"HELL ROAD · DEMO",16,"cinzel_hell",Color("a49373"))
 _label(box,_text("settings" if page=="settings" else "pause"),40,"hell_title",Color("dfd6c2"))
 var rail:=HSeparator.new()
 var line:=StyleBoxLine.new()
 line.color=Color("756047")
 rail.add_theme_stylebox_override("separator",line)
 box.add_child(rail)
 if page=="settings":
  _label(box,_text("pending"),25,"hell",Color("dfd6c2"))
  _label(box,_text("kept"),21,"hell",Color("b4a58e"))
  _button(box,"back",_text("back"))
 else:
  var profile:=read_input_profile()
  _label(box,_text("profile"),23,"hell",Color("b4a58e"))
  if profile.get("ready")==true:
   var p: Dictionary=profile.primary
   _label(box,_text("move")+"   "+str(p.up).trim_prefix("Key")+" / "+str(p.left).trim_prefix("Key")+" / "+str(p.down).trim_prefix("Key")+" / "+str(p.right).trim_prefix("Key"),21,"hell",Color("dfd6c2"))
   _label(box,_text("attack")+"   "+("MOUSE 1" if p.weapon=="mouse0" else str(p.weapon)),21,"hell",Color("dfd6c2"))
   _label(box,_text("combat"),21,"hell",Color("dfd6c2"))
  _label(box,_text("fixed"),17,"hell",Color("a99a82"))
  _button(box,"resume",_text("resume"))
  _button(box,"settings",_text("settings"))
 _label(box,_text("footer"),15,"cinzel_hell",Color("a49373"))
 buttons["back" if page=="settings" else "resume"].grab_focus()
func _label(box: Node,value: String,pixels: int,token: String,color: Color) -> void:
 var label:=Label.new()
 label.text=value
 label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 label.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 label.custom_minimum_size.x=800
 label.add_theme_font_override("font",FONTS.stack(token,700 if pixels>30 else 400))
 label.add_theme_font_size_override("font_size",pixels)
 label.add_theme_color_override("font_color",color)
 box.add_child(label)
func _button(box: Node,action: String,value: String) -> void:
 var row:=CenterContainer.new()
 box.add_child(row)
 var button:=Button.new()
 button.text=value
 button.custom_minimum_size=Vector2(540,56)
 button.add_theme_font_override("font",FONTS.stack("hell",700))
 button.add_theme_font_size_override("font_size",21)
 button.add_theme_color_override("font_color",Color("dfd6c2"))
 for state in ["normal","hover","pressed","focus"]:
  var style:=StyleBoxFlat.new()
  style.bg_color=Color("361715" if state!="pressed" else "190d0b")
  style.border_color=Color("d8c398" if state=="focus" else "8b7650")
  style.set_border_width_all(2 if state=="focus" else 1)
  if state=="focus":style.bg_color=Color(0,0,0,0)
  if state=="hover":style.bg_color=Color("51251c")
  button.add_theme_stylebox_override(state,style)
 button.pressed.connect(func():
  if action=="settings":_show("settings")
  elif action=="back":consume_pause_back()
  elif action=="resume":
   var main: Node=_main.get_ref()
   if is_instance_valid(main):main.call("_toggle_pause"))
 row.add_child(button)
 buttons[action]=button
func get_snapshot() -> Dictionary:
 return {"visible":_root.visible,"page":_page,"settings":read_settings().duplicate(true),"input":read_input_profile(),
  "settings_apply_status":"READY","input_mode_restore_status":"HOLD_no_binding_restore","key_remapping":false,"save_io":true,"bridge":settings_bridge.snapshot()}
