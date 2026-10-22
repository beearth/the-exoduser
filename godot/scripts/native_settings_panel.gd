extends CenterContainer
## Source: ui-panels.js settings(), game.html #settings, ui-refinement.css.
const S=preload("res://scripts/native_parity_ui_surface.gd")
const UI=preload("res://scripts/native_demo_ui_i18n.gd")
const FONTS=preload("res://scripts/native_ui_fonts.gd")
var controls: Dictionary={}
var _menu: Node
var _tab:="system"
var _panel: Control
var _status:=""
var _message: Label
var _rows: Array=[]
func setup(menu: Node,tab: String="system") -> void:
 _menu=menu;_tab=tab
 set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 _rows=JSON.parse_string(FileAccess.get_file_as_string("res://data/parity_ui_05_settings.json"))
 _build()
func _text(parent: Node,value: String,rect: Rect2,px: int=16) -> Label:
 return S.text(parent,UI.text(value),rect,px,Color("d5c6ac"),"hell")
func _build() -> void:
 controls.clear()
 _panel=Control.new();_panel.custom_minimum_size=Vector2(1920,1080);add_child(_panel)
 S.iron(_panel,Rect2(12,12,1896,1056),Color("171719ee"),Color("080b0df5"))
 var backdrop:=Control.new();backdrop.position=Vector2(12,12);backdrop.size=Vector2(1896,1056);backdrop.clip_contents=true;_panel.add_child(backdrop)
 var sigil:=TextureRect.new();sigil.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;sigil.texture=preload("res://assets/ui/parity_ui_03/sigil.png");sigil.position=Vector2(638,-150);sigil.size=Vector2(620,620);sigil.modulate.a=.15;backdrop.add_child(sigil)
 S.frame(_panel,Rect2(12,12,1896,1056),60,true)
 for i in 5:
  var index:=i
  S.button(_panel,["설정 [ESC]","인벤토리 [TAB]","대장간 [G]","스킬 [K]","능력치 [J]"][i],Rect2(36+i*369.6,26,367.6,40),func():_navigate(index),i==0,14)
 var clip:=Control.new();clip.position=Vector2(780,82);clip.size=Vector2(360,165);clip.clip_contents=true;_panel.add_child(clip)
 var crest:=TextureRect.new();crest.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;crest.texture=preload("res://assets/ui/parity_ui_03/header.png");crest.position=Vector2(0,-90);crest.size=Vector2(360,360);clip.add_child(crest)
 S.art(_panel,"img/ui/iron_covenant_20260924/button.webp",Rect2(780,184,360,62))
 var title:=_text(_panel,"설정",Rect2(780,184,360,62),24);title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 for i in 4:
  var key: String=["system","screen","sound","controls"][i]
  controls["tab_"+key]=S.button(_panel,["게임","화면","사운드","조작"][i],Rect2(40+i*462,257,454,48),func():_rebuild(key),_tab==key,16)
 var data: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/parity_ui_05_settings_layout.json"))[_tab]
 var scroll:=ScrollContainer.new();scroll.position=Vector2(45,325);scroll.size=Vector2(1830,652);_panel.add_child(scroll)
 S.panel(_panel,Rect2(45,325,1830,652),Color(0,0,0,.2),Color("5c503d")).show_behind_parent=true
 var content:=preload("res://scripts/parity_settings_page.gd").new();scroll.add_child(content);content.setup(self,data,_rows)
 _footer()
func _footer() -> void:
 _message=_text(_panel,_status if not _status.is_empty() else "✓ 설정 자동 저장",Rect2(40,1014,600,24),14);_message.horizontal_alignment=HORIZONTAL_ALIGNMENT_LEFT
 var back:=S.button(_panel,"닫기 [ESC]",Rect2(1700,1004,180,40),func():_menu._main.get_ref()._toggle_pause(),false,16);_menu.buttons.back=back
func _theme(control: Control) -> void:
 control.add_theme_font_override("font",FONTS.stack("hell"));control.add_theme_font_size_override("font_size",16);control.add_theme_color_override("font_color",Color("ddccaa"))
 if control is OptionButton:control.get_popup().add_theme_font_override("font",FONTS.stack("hell"))
func _change(changes: Dictionary,rebuild: bool=false) -> void:
 var result: Dictionary=_menu.request_settings(changes)
 if result.get("applied",false):
  _status=UI.text("✓ 설정 자동 저장")
  if rebuild:_rebuild(_tab)
func _rebuild(tab: String) -> void:
 _tab=tab
 if is_instance_valid(_panel):remove_child(_panel);_panel.queue_free()
 _build()
func _navigate(index: int) -> void:
 if index==0:return
 var main: Node=_menu._main.get_ref();main._toggle_pause()
 if index==1:main.source_inventory_ui.open_panel()
 elif index==3:main.source_inventory_ui.skill_forge.open_panel()
 else:main.source_inventory_ui._navigate([KEY_ESCAPE,KEY_TAB,KEY_G,KEY_K,KEY_J][index])
