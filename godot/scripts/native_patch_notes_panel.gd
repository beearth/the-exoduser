extends Control
## index.html 745–787,3736–3771. Original patch-notes.js KO/EN payload.
const Fonts=preload("res://scripts/native_ui_fonts.gd")
const UI=preload("res://scripts/native_demo_ui_i18n.gd")
var previous: Control
var scrollbar_fade: Tween
func close() -> void:
 queue_free()
 if is_instance_valid(previous):previous.grab_focus()
func label_at(parent: Node,value: String,px: int,color: Color,stack: String="hell",spacing: int=0) -> Label:
 var l:=Label.new();l.text=value;l.add_theme_font_size_override("font_size",px);l.add_theme_color_override("font_color",color)
 var font: FontVariation=Fonts.stack(stack).duplicate()
 if stack=="cinzel_serif_kr":font.variation_opentype={TextServerManager.get_primary_interface().name_to_tag("wght"):500} # index imports500/600/700; request400 resolves500.
 Fonts.apply_spacing(font,spacing);l.add_theme_font_override("font",font);l.mouse_filter=Control.MOUSE_FILTER_IGNORE;parent.add_child(l);return l
func build(language: String) -> void:
 previous=get_viewport().gui_get_focus_owner();size=Vector2(1920,1080);z_index=220
 var veil:=Button.new();veil.size=size
 var vs:=StyleBoxFlat.new();vs.bg_color=Color(2/255.0,1/255.0,1/255.0,.66)
 for state in ["normal","hover","pressed","focus"]:veil.add_theme_stylebox_override(state,vs)
 add_child(veil);veil.pressed.connect(close)
 var panel:=Panel.new();panel.position=Vector2(680,210);panel.size=Vector2(560,660);add_child(panel)
 var ps:=StyleBoxFlat.new();ps.bg_color=Color.TRANSPARENT;ps.border_color=Color(164/255.0,147/255.0,115/255.0,.5);ps.set_border_width_all(1);ps.set_corner_radius_all(3);ps.shadow_color=Color(0,0,0,.8);ps.shadow_size=30;ps.shadow_offset=Vector2(0,18);panel.add_theme_stylebox_override("panel",ps)
 var background:=ColorRect.new();background.position=Vector2.ONE;background.size=panel.size-Vector2(2,2);background.mouse_filter=Control.MOUSE_FILTER_IGNORE;panel.add_child(background)
 var shader:=Shader.new();shader.code="shader_type canvas_item;void fragment(){float t=clamp(dot(UV-.5,vec2(.08716,.99619))+.5,0.,1.);vec4 c=mix(vec4(26.,18.,14.,247.35)/255.,vec4(12.,8.,7.,251.175)/255.,t);vec2 q=abs((UV-.5)*vec2(558.,658.))-(vec2(279.,329.)-vec2(2.));c.a*=1.-smoothstep(1.5,2.5,length(max(q,vec2(0.))));COLOR=c;}"
 var material:=ShaderMaterial.new();material.shader=shader;background.material=material
 var inset:=Panel.new();inset.position=Vector2(5,5);inset.size=panel.size-Vector2(10,10);inset.mouse_filter=Control.MOUSE_FILTER_IGNORE;panel.add_child(inset)
 var ins:=StyleBoxFlat.new();ins.draw_center=false;ins.border_color=Color(164/255.0,147/255.0,115/255.0,.22);ins.set_border_width_all(1);ins.set_corner_radius_all(2);inset.add_theme_stylebox_override("panel",ins)
 var title:=label_at(panel,UI.text("패치 노트",language),16,Color("d9c08a"),"disp_title",5);title.position=Vector2(27,23);title.size=Vector2(506,25);title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 var hair:=ColorRect.new();hair.color=Color(164/255.0,147/255.0,115/255.0,.55);hair.position=Vector2(33,58);hair.size=Vector2(494,.2);panel.add_child(hair)
 var scroll:=ScrollContainer.new();scroll.position=Vector2(27,68.2);scroll.size=Vector2(506,524.8);scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;panel.add_child(scroll)
 # CSS body content width490 (overlay scrollbar occupies no layout width).
 var rows:=Control.new();rows.custom_minimum_size.x=506;scroll.add_child(rows)
 var bar:=scroll.get_v_scroll_bar();bar.custom_minimum_size.x=6
 var track:=StyleBoxFlat.new();track.bg_color=Color.TRANSPARENT;track.set_content_margin_all(0)
 var thumb:=StyleBoxFlat.new();thumb.bg_color=Color(120/255.0,90/255.0,60/255.0,.5);thumb.set_corner_radius_all(3);thumb.content_margin_left=3;thumb.content_margin_right=3
 bar.add_theme_stylebox_override("scroll",track)
 for state in ["grabber","grabber_highlight","grabber_pressed"]:bar.add_theme_stylebox_override(state,thumb)
 # macOS Chrome overlay scrollbar: hidden at rest, shown by scroll/hover.
 bar.modulate.a=0
 bar.mouse_entered.connect(func():
  if is_instance_valid(scrollbar_fade):scrollbar_fade.kill()
  bar.modulate.a=1)
 bar.mouse_exited.connect(func():bar.modulate.a=0)
 bar.value_changed.connect(func(_value:float):
  if is_instance_valid(scrollbar_fade):scrollbar_fade.kill()
  bar.modulate.a=1;scrollbar_fade=create_tween();scrollbar_fade.tween_interval(1.0);scrollbar_fade.tween_property(bar,"modulate:a",0.0,.2))
 var y:=2.0
 var notes: Array=JSON.parse_string(FileAccess.get_file_as_string("res://data/parity_patch_notes.json"))
 for i in notes.size():
  var entry: Dictionary=notes[i]
  if i>0:y+=10
  var version:=label_at(rows,"v"+entry.version+" · "+str(entry.date).replace("-",""),16 if i==0 else 14,Color("ecdfc4" if i==0 else "dfd6c2"),"cinzel_serif_kr",2)
  version.position=Vector2(8,y);version.size=Vector2(490,21.5 if i==0 else 19.5);version.vertical_alignment=VERTICAL_ALIGNMENT_TOP
  y+=21.5 if i==0 else 19.5
  var content: Dictionary=entry.get("ko" if language.begins_with("ko") else "en",entry.get("en",{}))
  for section in content.get("sections",[]):
   y+=10 # adjacent block margins collapse: version bottom2/list bottom4 with section top10.
   var heading:=label_at(rows,section.title,13,Color(222/255.0,112/255.0,78/255.0,.88),"hell",2)
   heading.position=Vector2(8,y);heading.scale=Vector2.ONE*(12.8/13.0);heading.size=Vector2(490/(12.8/13.0),15/(12.8/13.0));heading.vertical_alignment=VERTICAL_ALIGNMENT_TOP
   var rule:=ColorRect.new();rule.color=Color(164/255.0,147/255.0,115/255.0,.2);rule.position=Vector2(8,y+18);rule.size=Vector2(490,1);rows.add_child(rule)
   y+=22 # heading normal15 + padding3 + border1 + margin-bottom3.
   for item in section.items:
    var text:=label_at(rows,item,13,Color("e8d9c6"));text.position=Vector2(22,y+2);text.scale=Vector2.ONE*(12.8/13.0);text.size=Vector2(476/(12.8/13.0),22.015625/(12.8/13.0));text.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;text.vertical_alignment=VERTICAL_ALIGNMENT_TOP
    text.add_theme_constant_override("line_spacing",6)
    var lines:=text.get_theme_font("font").get_multiline_string_size(item,HORIZONTAL_ALIGNMENT_LEFT,476/(12.8/13.0),13,-1,TextServer.BREAK_MANDATORY|TextServer.BREAK_WORD_BOUND|TextServer.BREAK_ADAPTIVE).y / text.get_theme_font("font").get_height(13)
    var height:=maxf(1,roundf(lines))*22.015625;text.size.y=height/(12.8/13.0)
    var diamond:=ColorRect.new();diamond.position=Vector2(10,y+9.216);diamond.size=Vector2(5,5);diamond.pivot_offset=Vector2(2.5,2.5);diamond.rotation=PI/4;diamond.color=Color(148/255.0,125.5/255.0,91/255.0,.85);rows.add_child(diamond)
    y+=height
 rows.custom_minimum_size.y=y+6
 var button:=Button.new();button.text=UI.text("닫기",language);button.position=Vector2(214,605);button.size=Vector2(132,36);var bf: FontVariation=Fonts.stack("hell").duplicate();Fonts.apply_spacing(bf,3);button.add_theme_font_override("font",bf);button.add_theme_font_size_override("font_size",13);button.add_theme_color_override("font_color",Color("dccbb6"))
 var bs:=StyleBoxFlat.new();bs.bg_color=Color("1d1413");bs.border_color=Color(164/255.0,147/255.0,115/255.0,.5);bs.set_border_width_all(1);bs.set_corner_radius_all(2)
 for state in ["normal","hover","pressed","focus"]:button.add_theme_stylebox_override(state,bs)
 var focus: StyleBoxFlat=bs.duplicate();focus.border_color=Color(214/255.0,120/255.0,70/255.0,.75);focus.shadow_color=Color(196/255.0,68/255.0,40/255.0,.35);focus.shadow_size=5;button.add_theme_stylebox_override("focus",focus);button.add_theme_color_override("font_focus_color",Color("fff0df"))
 panel.add_child(button);button.pressed.connect(close);button.grab_focus()
