extends Control
## Event-driven Hell Gothic surface; no frame callbacks or generated assets.
signal action_requested(action: String)
const FONTS = preload("res://scripts/native_ui_fonts.gd")
const WORDS := {
 "clear_title": ["구역 클리어!", "Area Clear!"],
 "clear_body": ["썩은 숲을 정복했습니다.", "You conquered the Rotten Forest."],
 "end_title": ["데모 종료", "End of Demo"],
 "end_body": ["여기까지 데모입니다.\n정식 출시를 기대해주세요!", "This is the end of the demo.\nLooking forward to the full release!"],
 "support": ["STEAM 위시리스트로 응원해 주세요!", "Support us by wishlisting on Steam!"],
 "wishlist": ["STEAM 위시리스트", "Wishlist on Steam"],
 "lobby": ["로비로 돌아가기", "Return to Lobby"],
 "lobby_title": ["지옥의 길", "HELL ROAD"],
 "lobby_body": ["다시 지옥의 문을 여시겠습니까?", "Will you open the gates of hell again?"],
 "replay": ["데모 다시 시작", "Play Demo Again"],
 "footer": ["썩은 숲 · 첫 번째 여정", "ROTTEN FOREST · THE FIRST JOURNEY"],
 "link_failed": ["Steam 페이지를 열지 못했습니다. 다시 시도하세요.", "Could not open Steam. Please try again."]}
var language := "ko"
var page := ""
var buttons: Dictionary = {}
var _center: CenterContainer
var _notice: Label
func text(key: String) -> String:
 return WORDS[key][0 if language.begins_with("ko") else 1]
func show_page(value: String) -> void:
 page = value
 if is_instance_valid(_center):
  remove_child(_center)
  _center.queue_free()
 buttons.clear()
 _center = CenterContainer.new()
 _center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 add_child(_center)
 var panel := PanelContainer.new()
 panel.custom_minimum_size = Vector2(880, 742)
 var metal := StyleBoxFlat.new()
 metal.bg_color = Color("131011")
 metal.border_color = Color("756957")
 metal.set_border_width_all(2)
 metal.shadow_color = Color(0,0,0,0.75)
 metal.shadow_size = 32
 metal.content_margin_left = 68
 metal.content_margin_right = 68
 metal.content_margin_top = 34
 metal.content_margin_bottom = 34
 panel.add_theme_stylebox_override("panel", metal)
 _center.add_child(panel)
 var box := VBoxContainer.new()
 box.add_theme_constant_override("separation", 18)
 panel.add_child(box)
 var crest := TextureRect.new()
 crest.texture = preload("res://assets/ui/hell_gothic/crest.png")
 crest.custom_minimum_size = Vector2(0, 104)
 crest.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
 crest.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
 box.add_child(crest)
 _label(box, "ZONE CLEARED" if page == "clear" else ("HELL ROAD · DEMO" if page == "end" else "DEMO LOBBY"), 17, "cinzel_hell", Color("a49373"))
 _label(box, text("clear_title" if page=="clear" else ("end_title" if page=="end" else "lobby_title")), 44, "hell_title", Color("dfd6c2"))
 var line := HSeparator.new()
 var rail := StyleBoxLine.new()
 rail.color = Color("756047")
 rail.thickness = 1
 line.add_theme_stylebox_override("separator", rail)
 box.add_child(line)
 _label(box, text("clear_body" if page=="clear" else ("end_body" if page=="end" else "lobby_body")), 25, "hell", Color("d2c5b0"))
 var spacer := Control.new()
 spacer.custom_minimum_size.y = 10
 box.add_child(spacer)
 if page == "clear":
  _button(box,"next",text("end_title"),true)
 else:
  if page == "end": _label(box,text("support"),20,"hell",Color("a99a82"))
  _button(box,"wishlist",text("wishlist"),page=="end")
  _button(box,"lobby" if page=="end" else "replay",text("lobby" if page=="end" else "replay"),page=="lobby")
 _notice = _label(box,"",17,"hell",Color("c68b76"))
 _label(box,text("footer"),15,"hell",Color("958775"))
 queue_redraw()
func _label(parent: Node, value: String, font_size: int, token: String, color: Color) -> Label:
 var label := Label.new()
 label.text = value
 label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
 label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
 label.custom_minimum_size.x = 740
 label.add_theme_font_override("font", FONTS.stack(token,700 if font_size>30 else 400))
 label.add_theme_font_size_override("font_size",font_size)
 label.add_theme_color_override("font_color",color)
 parent.add_child(label)
 return label
func _button(parent: Node, action: String, value: String, primary: bool) -> void:
 var row := CenterContainer.new()
 parent.add_child(row)
 var button := Button.new()
 button.name = action.capitalize()+"Button"
 button.text = value
 button.custom_minimum_size = Vector2(540,58)
 button.add_theme_font_override("font",FONTS.stack("hell",700))
 button.add_theme_font_size_override("font_size",21)
 button.add_theme_color_override("font_color",Color("dfd6c2"))
 button.add_theme_color_override("font_hover_color",Color("fff0df"))
 for state in ["normal","hover","pressed","disabled","focus"]:
  var style := StyleBoxFlat.new()
  style.bg_color = Color("361715" if primary else "211b1a")
  style.border_color = Color("9c7056" if primary else "756047")
  style.set_border_width_all(1)
  style.border_width_top = 2
  if state == "hover": style.bg_color = Color("51251c")
  if state == "pressed": style.bg_color = Color("190d0b")
  if state == "disabled": style.bg_color=Color("151212");style.border_color=Color("42382e")
  if state == "focus":
   style.bg_color=Color(0,0,0,0)
   style.border_color=Color("d8c398")
   style.set_border_width_all(2)
  button.add_theme_stylebox_override(state,style)
 button.pressed.connect(func() -> void: action_requested.emit(action))
 row.add_child(button)
 buttons[action] = button
func show_link_failure() -> void:
 _notice.text=text("link_failed")
func _draw() -> void:
 draw_rect(Rect2(Vector2.ZERO,size),Color("080709"))
 # Symmetric iron ribs and a restrained ember seam; no per-frame animation.
 var c := size * 0.5
 for side in [-1.0,1.0]:
  for inset in [0.0,22.0,42.0]:
   var pts := PackedVector2Array([Vector2(c.x+side*(600+inset),size.y),Vector2(c.x+side*(600+inset),330),Vector2(c.x+side*320,105),Vector2(c.x,60+inset)])
   draw_polyline(pts,Color(0.26,0.19,0.16,0.35),1.0,true)
 draw_line(Vector2(c.x-480,178),Vector2(c.x+480,178),Color("6b3026"),2.0,true)
