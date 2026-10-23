extends Control
## Measured source DOM at 1920x1080 / scale 1; native controls, no webview/raster UI.
const S=preload("res://scripts/native_parity_ui_surface.gd")
const UI=preload("res://scripts/native_demo_ui_i18n.gd")
const Fonts=preload("res://scripts/native_ui_fonts.gd")
var panel: Control
var fields: Dictionary={}
var values: Dictionary={}
var sliders: Dictionary={}
static func color(css: String) -> Color:
 var t:=css.trim_prefix("rgba(").trim_prefix("rgb(").trim_suffix(")").split(",")
 if t.size()<3:return Color.TRANSPARENT
 return Color(float(t[0])/255,float(t[1])/255,float(t[2])/255,float(t[3]) if t.size()>3 else 1.0)
func setup(owner_panel: Control,data: Dictionary,rows: Array) -> void:
 panel=owner_panel
 custom_minimum_size=Vector2(1805,float(data.height))
 for row in rows:fields[row.id]=row
 var opt: Dictionary=panel._menu.read_settings().get("options",{})
 for n in data.nodes:
  var r:=Rect2(n.rect[0],n.rect[1],n.rect[2],n.rect[3])
  var id: String=n.id;var cls: String=n.cls
  match n.kind:
   "panel":
    var bg:=color(n.background);var border:=color(n.border)
    var radius:=int(str(n.get("radius","0px")).trim_suffix("px").to_float())
    if cls.contains("ui-section-heading"):
     # SWEEP-B: computed 테두리 0, bg linear-gradient(90deg, rgba(28,23,20,.97), rgba(13,13,16,.97)) + 그림자 0 5px 14px rgba(0,0,0,.55)
     var head:=Panel.new();head.position=r.position;head.size=r.size;head.mouse_filter=Control.MOUSE_FILTER_IGNORE
     var hs:=StyleBoxFlat.new();hs.bg_color=Color(20/255.0,18/255.0,18/255.0,.97);hs.shadow_color=Color(0,0,0,.55);hs.shadow_size=7;hs.shadow_offset=Vector2(0,5)
     head.add_theme_stylebox_override("panel",hs);add_child(head)
     var grad:=Gradient.new();grad.set_color(0,Color(28/255.0,23/255.0,20/255.0,.97));grad.set_color(1,Color(13/255.0,13/255.0,16/255.0,.97))
     var gt:=GradientTexture2D.new();gt.gradient=grad;gt.width=64;gt.height=4;gt.fill_from=Vector2(0,0);gt.fill_to=Vector2(1,0)
     var fill:=TextureRect.new();fill.texture=gt;fill.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;fill.stretch_mode=TextureRect.STRETCH_SCALE;fill.size=r.size;fill.mouse_filter=Control.MOUSE_FILTER_IGNORE;head.add_child(fill)
    elif cls.contains("set-range-row"):
     # SWEEP-B: computed border = 하단만 rgba(177,162,125,.07) (상·좌우 0)
     var row_line:=ColorRect.new();row_line.color=Color(177/255.0,162/255.0,125/255.0,.07);row_line.position=Vector2(r.position.x,r.end.y-1);row_line.size=Vector2(r.size.x,1);row_line.mouse_filter=Control.MOUSE_FILTER_IGNORE;add_child(row_line)
    elif radius>0:
     var box:=Panel.new();box.position=r.position;box.size=r.size;box.mouse_filter=Control.MOUSE_FILTER_IGNORE
     var st:=StyleBoxFlat.new();st.bg_color=bg;st.border_color=border;st.set_border_width_all(1);st.set_corner_radius_all(radius);st.anti_aliasing=true
     box.add_theme_stylebox_override("panel",st);add_child(box)
    else:S.panel(self,r,bg,border)
   "text":
    var px:=roundi(float(n.px));var weight:=700 if int(n.weight)>=600 else 400
    var font: String="font" if n.font.contains("Noto Sans") else ("cinzel_hell" if n.font.contains("Cinzel") else "hell")
    var label:=S.text(self,UI.text(n.text),r,px,color(n.color),font,weight)
    label.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
    if cls=="settings-choice-description":
     label.autowrap_mode=TextServer.AUTOWRAP_ARBITRARY;label.add_theme_constant_override("line_spacing",5)
     # Original 14px face: prior Windows embolden also expands each advance in FreeType.
     var source_font:FontVariation=Fonts.stack("hell",400).duplicate();source_font.variation_embolden=0.0;label.add_theme_font_override("font",source_font)
    label.set_deferred("size",r.size)
    if r.size.y<float(n.px)*1.7:label.autowrap_mode=TextServer.AUTOWRAP_OFF
    label.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT if n.align=="right" else (HORIZONTAL_ALIGNMENT_CENTER if n.align=="center" else HORIZONTAL_ALIGNMENT_LEFT)
    values[id]=label
   "button":
    var caption: String="" if cls.contains("settings-choice") else n.text
    var b:=S.button(self,caption,r,func():action(id,n.text),cls.contains("selected"),roundi(float(n.px)))
    # SWEEP-B: 원문 computed font-weight·글자색, 위험 버튼(리셋/종료) 적동 그라디언트(75,33,28)→(33,14,11)
    b.add_theme_font_override("font",Fonts.stack("font",int(str(n.get("weight","500")))))
    for key in ["font_color","font_hover_color","font_pressed_color","font_focus_color"]:b.add_theme_color_override(key,color(str(n.color)))
    if str(n.get("border","")).begins_with("rgb(137, 83, 70)"):
     for child in b.get_children():
      if child is TextureRect and child.material is ShaderMaterial:child.material.set_shader_parameter("tint",Color(54/255.0,23/255.0,19/255.0,.82))
    if cls.contains("settings-choice"):
     for child in b.get_children():
      if child is TextureRect:child.hide()
     var selected:bool=n.text.contains("선택됨")
     var style:=StyleBoxFlat.new();style.bg_color=Color.TRANSPARENT;style.border_color=Color("ccaa66") if selected else Color("6c5840");style.set_border_width_all(2);style.set_corner_radius_all(6)
     for state in ["normal","hover","pressed","focus"]:b.add_theme_stylebox_override(state,style)
     var background:=ColorRect.new();background.position=Vector2(2,2);background.size=r.size-Vector2(4,4);background.mouse_filter=Control.MOUSE_FILTER_IGNORE;background.show_behind_parent=true
     var shader:=Shader.new();shader.code="shader_type canvas_item;uniform bool selected=false;void fragment(){vec3 top=(selected?vec3(60.,48.,33.):vec3(32.,30.,33.))/255.;vec3 bottom=(selected?vec3(33.,28.,23.):vec3(16.,18.,23.))/255.;float t=clamp(dot(UV-.5,vec2(.573576,.819152))+.5,0.,1.);vec3 c=mix(top,bottom,t);float a=(selected?.2:.219608)*(1.-clamp(length((UV-vec2(.5,.05))/vec2(.7071,1.0735))/(selected?.8:.72),0.,1.));c=mix(c,(selected?vec3(181.,140.,60.):vec3(71.,58.,41.))/255.,a);COLOR=vec4(c,1.);}"
     var material:=ShaderMaterial.new();material.shader=shader;material.set_shader_parameter("selected",selected);background.material=material;b.add_child(background)
    panel.controls[id if not id.is_empty() else n.text]=b
   "range":
    var row: Dictionary=fields.get(id,{})
    var slider:=HSlider.new();slider.min_value=float(n.min);slider.max_value=float(n.max);slider.step=maxf(1,float(n.step)) if str(n.step)!="any" else .01
    slider.value=panel._menu.settings_bridge.CAPS.find(int(opt.get("fpsCap",0))) if id=="optFps" else (float(opt.get("autoPotThr",.99))*100 if id=="optAutoPot" else float(opt.get(row.get("key",""),n.value)));slider.position=r.position-Vector2(0,10);slider.size=Vector2(r.size.x,25);add_child(slider);theme_slider(slider)
    slider.value_changed.connect(func(v:float):
     _update_value(id,v))
    slider.drag_ended.connect(func(changed:bool):
     if changed:commit(row,panel._menu.settings_bridge.CAPS[int(slider.value)] if id=="optFps" else slider.value))
    slider.gui_input.connect(func(event:InputEvent):
     if event is InputEventKey and event.pressed and event.keycode in [KEY_LEFT,KEY_RIGHT,KEY_HOME,KEY_END]:
      call_deferred("keyboard_slider",row,id,slider))
    panel.controls[row.get("key",id)]=slider;sliders[id]=slider
   "check":
    var row: Dictionary=fields.get(id,{})
    var check:=CheckBox.new();check.position=r.position;check.size=r.size;check.button_pressed=bool(opt.get(row.get("key",""),n.checked));add_child(check);theme_check(check)
    check.toggled.connect(func(v:bool):commit(row,v));panel.controls[row.get("key",id)]=check
   "select":
    var row: Dictionary=fields.get(id,{})
    var select:=OptionButton.new();select.position=r.position;select.size=r.size;add_child(select);panel._theme(select)
    # SWEEP-B: select computed — bg rgb(12,16,12), 1px rgb(125,108,74), Noto Sans KR 15 rgb(228,213,175)
    var sel_style:=StyleBoxFlat.new();sel_style.bg_color=color(str(n.background));sel_style.border_color=color(str(n.border));sel_style.set_border_width_all(1);sel_style.content_margin_left=8;sel_style.content_margin_right=8
    for st in ["normal","hover","pressed","focus"]:select.add_theme_stylebox_override(st,sel_style)
    select.add_theme_font_override("font",Fonts.stack("font",400));select.add_theme_font_size_override("font_size",roundi(float(n.px)))
    for key in ["font_color","font_hover_color","font_pressed_color","font_focus_color"]:select.add_theme_color_override(key,color(str(n.color)))
    var val: Variant=opt.get(row.get("key",""),n.value)
    for option in n.options:
     select.add_item(UI.text(option[1]));select.set_item_metadata(select.item_count-1,option[0])
     if str(val)==str(option[0]):select.select(select.item_count-1)
    select.item_selected.connect(func(i:int):
     var v: Variant=select.get_item_metadata(i)
     if val is int:v=int(v)
     elif val is float:v=float(v)
     commit(row,v))
    panel.controls[row.get("key",id)]=select
   "canvas":
    # G48615–48635: same first cell alpha bounds, body72px/foot80px.
    var texture: Texture2D=load("res://assets/player_silvertail/6.png" if r.position.x>1100 else "res://assets/player/south.png")
    var source:=texture.get_image();var body:=Rect2i(48,48,0,0);var all:=Rect2i(48,48,0,0)
    var left:=48;var top:=48;var right:=0;var bottom:=0;var al:=48;var at:=48;var ar:=0;var ab:=0
    for y in 48:
     for x in 48:
      var alpha:=source.get_pixel(x,y).a
      if alpha>0:al=mini(al,x);at=mini(at,y);ar=maxi(ar,x+1);ab=maxi(ab,y+1)
      if alpha>100.0/255.0:left=mini(left,x);top=mini(top,y);right=maxi(right,x+1);bottom=maxi(bottom,y+1)
    body=Rect2i(left,top,right-left,bottom-top);all=Rect2i(al,at,ar-al,ab-at)
    if body.size.y<=0:body=all
    var below:=all.end.y-body.end.y;var center:float=(body.position.x+body.end.x)*.5
    var scale_factor:=minf(72.0/body.size.y,minf(40.0/maxf(center-all.position.x,all.end.x-center),minf(78.0/(body.end.y-all.position.y),8.0/below if below>0 else INF)))
    var clip:=Control.new();clip.position=r.position;clip.size=r.size;clip.clip_contents=true;clip.mouse_filter=Control.MOUSE_FILTER_IGNORE;add_child(clip)
    var image:=TextureRect.new();image.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;var atlas:=AtlasTexture.new();atlas.atlas=texture;atlas.region=Rect2(0,0,48,48);image.texture=atlas;image.position=Vector2(44-center*scale_factor,80-body.end.y*scale_factor);image.size=Vector2.ONE*48*scale_factor;image.texture_filter=CanvasItem.TEXTURE_FILTER_NEAREST;clip.add_child(image)
   "image":
    var image:=TextureRect.new();image.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;image.texture=load("res://assets/ui/parity_ui_05/"+str(n.src).get_file());image.position=r.position;image.size=r.size;add_child(image)
 # Nodes are in DOM order; labels can follow their corresponding input.
 for id in sliders:_update_value(id,sliders[id].value)
func _update_value(id:String,value:float) -> void:
 var label_id:String="cursorSizeVal" if id=="optCursorSize" else id+"Val"
 if not values.has(label_id):return
 var result:=str(int(value))+"%"
 match id:
  "optFps":
   var caps:Array=panel._menu.settings_bridge.CAPS
   var cap:int=caps[clampi(int(value),0,caps.size()-1)]
   result=str(cap) if cap>0 else UI.text("제한없음")
  "optAutoPot":result="HP "+str(int(value))+UI.text("% 이하")
  "optIrisSz","optIrisGlow":result=str(int(value))
  "optDiff":return # Source _diffName and difficulty writer remain the PC owner.
  "optMinRar":result=UI.text(["일반 이상","마법 이상","희귀 이상","전설 이상","유니크 이상"][clampi(int(value),0,4)])
  "optMinLv":
   var tier:int=int(value);result=UI.text("사용 안 함") if tier==0 else str(tier)+("단 (" if TranslationServer.get_locale().begins_with("ko") else "T (")+str(1000 if tier==7 else tier*100)+"Lv+)"
  "optCrAutoFuse","optCrAutoEnh":return # Original star/enhancement label owner is not replaced with a guessed unit.
 values[label_id].text=result
func commit(row: Dictionary,value: Variant) -> void:
 if not row.is_empty():panel._change({str(row.key):value},row.key in ["lang","panelFit","textScale"])
func action(id: String,caption: String) -> void:
 if caption=="전체화면 (F11)":
  panel._menu.settings_bridge.request_screen("fullscreen" if get_window().mode!=Window.MODE_FULLSCREEN else "windowed");return
 match id:
  "saveP1","saveP2":panel._menu.settings_bridge.save()
  "loadP1","loadP2":panel._menu.settings_bridge.restore()
  "toLobbyBtn2":
   var main: Node=panel._menu._main.get_ref()
   if main.has_method("_demo11_return_to_lobby"):main._demo11_return_to_lobby()
  "quitBtn":get_tree().quit()
  "btnFullscreen":panel._menu.settings_bridge.request_screen("fullscreen" if get_window().mode!=Window.MODE_FULLSCREEN else "windowed")
  _:pass
func svg(value: String) -> ImageTexture:
 var img:=Image.new();img.load_svg_from_string(value);return ImageTexture.create_from_image(img)
func theme_slider(slider: HSlider) -> void:
 var base:=StyleBoxLine.new();base.color=Color("665f54");base.thickness=4;slider.add_theme_stylebox_override("slider",base)
 var active:=StyleBoxLine.new();active.color=Color("b79c65");active.thickness=4
 slider.add_theme_stylebox_override("grabber_area",active);slider.add_theme_stylebox_override("grabber_area_highlight",active)
 var handle:=svg('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="7.5" fill="#b79c65"/></svg>')
 slider.add_theme_icon_override("grabber",handle);slider.add_theme_icon_override("grabber_highlight",handle)
func theme_check(check: CheckBox) -> void:
 for pressed in [false,true]:
  var inner: String='<circle cx="12" cy="12" r="4" fill="#ead9a4"/>' if pressed else ''
  var icon:=svg('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="11" fill="#252820" stroke="#ad945a"/><circle cx="12" cy="12" r="8" fill="%s"/>%s</svg>' % ["#a99563" if pressed else "#141913",inner])
  check.add_theme_icon_override("checked" if pressed else "unchecked",icon)

func keyboard_slider(row: Dictionary,id: String,slider: HSlider) -> void:
 if is_instance_valid(slider):commit(row,panel._menu.settings_bridge.CAPS[int(slider.value)] if id=="optFps" else slider.value)
