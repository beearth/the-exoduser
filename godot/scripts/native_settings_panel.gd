extends CenterContainer
## SETTINGS-S02/S04/S09. Event-driven native controls; no key binding editor.
const FONTS=preload("res://scripts/native_ui_fonts.gd")
const TEXT={
"system":["시스템","System"],"screen":["화면","Display"],"sound":["사운드","Sound"],"controls":["조작","Controls"],
"language":["언어","Language"],"fps":["FPS 상한","FPS Limit"],"unlimited":["제한 없음","Unlimited"],"fullscreen":["전체화면","Fullscreen"],
"sfx":["효과음","Sound Effects"],"bgm":["배경 음악","Music"],"textScale":["안내 글자 크기","Guide Text Size"],"panelFit":["설정 창 화면에 맞추기","Fit Settings to Screen"],"shake":["화면 흔들림","Screen Shake"],
"restore_failed":["저장된 설정을 복원하지 못했습니다.","Saved settings could not be restored."],
"saved":["설정을 저장했습니다.","Settings saved."],"failed":["설정은 반영됐지만 저장하지 못했습니다.","Settings applied, but could not be saved."],"rejected":["설정을 반영하지 못했습니다.","Settings could not be applied."],
"note":["키 변경은 제공하지 않습니다. Q 패링 · E 방패(불꽃칼날)","No key remapping. Q Parry · E Shield (Flame Blade)"],
"fps_note":["렌더 상한 설정 · 물리 틱 60Hz 유지 · 성능 벤치 미실시","Render limit · Physics stays at 60 Hz · No benchmark performed"],
"back":["뒤로","Back"],"title":["설정","SETTINGS"]}
var controls: Dictionary={}
var _menu: Node
var _tab:="system"
var _status:=""
var _message: Label
var _panel: PanelContainer
func setup(menu: Node, tab: String="system") -> void:
	_menu=menu;_tab=tab
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_build()
func text(key: String) -> String:
	return TEXT[key][0 if str(_menu.read_settings().get("options",{}).get("lang","ko")).begins_with("ko") else 1]
func _style(color: String="141112") -> StyleBoxFlat:
	var style:=StyleBoxFlat.new();style.bg_color=Color(color);style.border_color=Color("a49373")
	style.set_border_width_all(1);style.set_content_margin_all(20)
	return style
func _build() -> void:
	controls.clear()
	_panel=PanelContainer.new();_panel.add_theme_stylebox_override("panel",_style());add_child(_panel)
	var theme:=Theme.new();theme.default_font=FONTS.stack("hell",400);theme.default_font_size=20;_panel.theme=theme
	var opt: Dictionary=_menu.read_settings().get("options",{})
	var scale: float=float(opt.get("textScale",100))/100.0
	var extent:=get_viewport_rect().size
	_panel.custom_minimum_size=Vector2(minf(1100,extent.x-24),maxf(700,extent.y-24) if opt.get("panelFit",true) else 780)
	var box:=VBoxContainer.new();box.add_theme_constant_override("separation",18);_panel.add_child(box)
	var header:=HBoxContainer.new();box.add_child(header)
	var brand:=_label(header,"HELL ROAD",17,"cinzel_hell",Color("a49373"));brand.size_flags_horizontal=Control.SIZE_EXPAND_FILL;brand.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
	var crest:=TextureRect.new();crest.name="HellGothicCrest"
	crest.texture=preload("res://assets/ui/hell_gothic/crest.png")
	crest.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;crest.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED;crest.custom_minimum_size=Vector2(150,54);header.add_child(crest)

	_label(box,text("title"),36,"hell_title",Color("dfd6c2"))
	var tabs:=HBoxContainer.new();box.add_child(tabs)
	for key in ["system","screen","sound","controls"]:
		var button:=_button(tabs,text(key),func():_rebuild(key))
		button.size_flags_horizontal=Control.SIZE_EXPAND_FILL
		button.disabled=key==_tab
		if key==_tab:
			button.add_theme_stylebox_override("disabled",_style("401c16"))
			button.add_theme_color_override("font_disabled_color",Color("dfd6c2"))
		controls["tab_"+key]=button
	var scroll:=ScrollContainer.new();scroll.size_flags_vertical=Control.SIZE_EXPAND_FILL;box.add_child(scroll)
	scroll.custom_minimum_size=Vector2(1000,450)
	var content:=VBoxContainer.new();content.add_theme_constant_override("separation",24);content.size_flags_horizontal=Control.SIZE_EXPAND_FILL;scroll.add_child(content)
	match _tab:
		"system":
			var language:=OptionButton.new();language.add_item("한국어");language.add_item("English");language.select(0 if opt.get("lang")=="ko" else 1)
			_row(content,text("language"),language,scale)
			language.item_selected.connect(func(index:int):_change({"lang":"ko" if index==0 else "en"},true))
			controls.lang=language
			_slider(content,"textScale",80,160,10,float(opt.get("textScale",100)),scale)
			_toggle(content,"panelFit",bool(opt.get("panelFit",true)),scale)
			_slider(content,"shake",0,100,1,float(opt.get("shake",80)),scale)
		"screen":
			var cap:=OptionButton.new()
			var caps: Array=_menu.settings_bridge.CAPS
			for i in caps.size():
				cap.add_item(text("unlimited") if caps[i]==0 else str(caps[i]));cap.set_item_metadata(i,caps[i])
				if caps[i]==opt.get("fpsCap"): cap.select(i)
			_row(content,text("fps"),cap,scale);controls.fpsCap=cap
			cap.item_selected.connect(func(index:int):_change({"fpsCap":cap.get_item_metadata(index)}))
			var fullscreen:=CheckButton.new();_theme_toggle(fullscreen);fullscreen.button_pressed=get_window().mode==Window.MODE_FULLSCREEN
			_row(content,text("fullscreen"),fullscreen,scale);controls.fullscreen=fullscreen
			fullscreen.toggled.connect(func(value:bool):_result(_menu.settings_bridge.request_screen("fullscreen" if value else "windowed")))
			_label(content,text("fps_note"),int(17*scale))
		"sound":
			_slider(content,"sfxVol",0,100,1,float(opt.get("sfxVol",60)),scale,"sfx")
			_slider(content,"bgmVol",0,100,1,float(opt.get("bgmVol",60)),scale,"bgm")
		"controls":
			_label(content,text("note"),int(20*scale))
			var input: Dictionary=_menu.read_input_profile()
			var primary: Dictionary=input.get("primary",{})
			_label(content,"%s / %s / %s / %s     %s     ESC" % [str(primary.get("up","")).trim_prefix("Key"),str(primary.get("left","")).trim_prefix("Key"),str(primary.get("down","")).trim_prefix("Key"),str(primary.get("right","")).trim_prefix("Key"),"MOUSE 1" if primary.get("weapon")=="mouse0" else str(primary.get("weapon",""))],int(22*scale),"cinzel_hell")
			# Read-only input profile is the existing Main owner, no InputMap/reset/save-binding writer.
			controls["input_ready"]=input.get("ready",false)
	var restore: Dictionary=_menu.settings_bridge.snapshot().restore
	var notice: String=text("restore_failed") if _status.is_empty() and restore.get("status")!="READY" else _status
	_message=_label(box,notice,18,"hell",Color("dfd6c2"))
	var back:=_button(box,text("back"),func():_menu.consume_pause_back())
	_menu.buttons["back"]=back
	back.grab_focus()
func _label(parent: Node,value: String,px: int,token: String="hell",color: Color=Color("dfd6c2")) -> Label:
	var label:=Label.new();parent.add_child(label);label.text=value
	label.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	label.add_theme_font_override("font",FONTS.stack(token,700 if token=="hell_title" else 400));label.add_theme_font_size_override("font_size",px);label.add_theme_color_override("font_color",color)
	return label
func _row(parent: Node,title: String,control: Control,scale: float) -> void:
	var row:=HBoxContainer.new();row.add_theme_constant_override("separation",24);parent.add_child(row)
	var label:=_label(row,title,int(20*scale));label.custom_minimum_size=Vector2(390,44)
	control.custom_minimum_size=Vector2(440,44);control.size_flags_horizontal=Control.SIZE_EXPAND_FILL
	control.add_theme_font_override("font",FONTS.stack("hell",400));control.add_theme_font_size_override("font_size",int(19*scale));control.add_theme_color_override("font_color",Color("dfd6c2"))
	if control is OptionButton:
		control.add_theme_stylebox_override("normal",_style("241817"));control.get_popup().add_theme_font_override("font",FONTS.stack("hell",400))
	row.add_child(control)
func _slider(parent: Node,key: String,low: float,high: float,step: float,value: float,scale: float,label_key: String="") -> void:
	var row:=HBoxContainer.new();row.add_theme_constant_override("separation",16)
	var slider:=HSlider.new();slider.min_value=low;slider.max_value=high;slider.step=step;slider.value=value;slider.custom_minimum_size=Vector2(340,44);slider.size_flags_horizontal=Control.SIZE_EXPAND_FILL
	_theme_slider(slider)
	row.add_child(slider)
	var number:=_label(row,"%d%%" % value,19,"cinzel_hell");number.custom_minimum_size.x=90
	_row(parent,text(label_key if not label_key.is_empty() else key),row,scale)
	slider.value_changed.connect(func(next:float):number.text="%d%%" % next)
	# One commit at drag completion / keyboard change, not every pixel/event tick.
	slider.drag_ended.connect(func(changed:bool):
		if changed:_change({key:slider.value},key=="textScale"))
	slider.gui_input.connect(func(event:InputEvent):
		if event is InputEventKey and event.pressed and event.keycode in [KEY_LEFT,KEY_RIGHT,KEY_HOME,KEY_END]:
			call_deferred("_keyboard_slider_commit",key,slider))
	controls[key]=slider
func _keyboard_slider_commit(key: String,slider: HSlider) -> void:
	if is_instance_valid(slider):_change({key:slider.value},key=="textScale")
func _toggle(parent: Node,key: String,value: bool,scale: float) -> void:
	var button:=CheckButton.new();_theme_toggle(button);button.button_pressed=value;_row(parent,text(key),button,scale);controls[key]=button
	button.toggled.connect(func(next:bool):_change({key:next},true))
func _button(parent: Node,value: String,callback: Callable) -> Button:
	var button:=Button.new();button.text=value;button.custom_minimum_size.y=48
	button.add_theme_font_override("font",FONTS.stack("hell",700));button.add_theme_font_size_override("font_size",20)
	button.add_theme_color_override("font_color",Color("dfd6c2"))
	for state in ["normal","hover","pressed","focus","disabled"]:button.add_theme_stylebox_override(state,_style("351511" if state in ["hover","pressed"] else "1b1514"))
	button.pressed.connect(callback);parent.add_child(button);return button
func _result(result: Dictionary) -> void:
	_status=text("saved" if result.get("applied",false) and result.get("persisted",false) else ("failed" if result.get("applied",false) else "rejected"))
	if is_instance_valid(_message):_message.text=_status
func _change(changes: Dictionary,rebuild: bool=false) -> void:
	_result(_menu.request_settings(changes))
	if rebuild:call_deferred("_rebuild",_tab)
func _rebuild(tab: String) -> void:
	var focus_key: String=""
	var focus: Control=get_viewport().gui_get_focus_owner()
	for key in controls:
		if controls[key] is Control and controls[key]==focus:focus_key=str(key)
	_tab=tab
	if is_instance_valid(_panel):remove_child(_panel);_panel.queue_free()
	_build()
	if controls.get(focus_key) is Control and not (controls[focus_key] is BaseButton and controls[focus_key].disabled):controls[focus_key].grab_focus()

# Native input semantics are retained; only local settings control visuals change.
func _control_box(fill: Color, height: float) -> StyleBoxFlat:
	var box:=StyleBoxFlat.new();box.bg_color=fill
	box.border_color=Color(164.0/255,147.0/255,115.0/255,0.5)
	box.set_border_width_all(1);box.content_margin_top=height/2;box.content_margin_bottom=height/2
	box.set_corner_radius_all(2)
	return box
func _vector_icon(svg: String) -> ImageTexture:
	var image:=Image.new();image.load_svg_from_string(svg)
	return ImageTexture.create_from_image(image)
func _theme_slider(slider: HSlider) -> void:
	slider.add_theme_stylebox_override("slider",_control_box(Color("171414"),8))
	slider.add_theme_stylebox_override("grabber_area",_control_box(Color("9c8457"),8))
	slider.add_theme_stylebox_override("grabber_area_highlight",_control_box(Color("b9a075"),8))
	var handle:=_vector_icon('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30"><path d="M11 1 L21 15 L11 29 L1 15 Z" fill="#a49373" stroke="#dfd6c2"/><path d="M11 7 L16 15 L11 23 L6 15 Z" fill="#382c21"/></svg>')
	for key in ["grabber","grabber_highlight","grabber_disabled"]:slider.add_theme_icon_override(key,handle)
func _theme_toggle(button: CheckButton) -> void:
	for checked in [false,true]:
		var x:=58 if checked else 4
		var icon:=_vector_icon('<svg xmlns="http://www.w3.org/2000/svg" width="88" height="40"><rect x="1" y="3" width="86" height="34" rx="3" fill="%s" stroke="#a49373"/><rect x="%d" y="7" width="26" height="26" rx="2" fill="%s" stroke="#dfd6c2"/><path d="%s" fill="none" stroke="%s" stroke-width="2"/></svg>' % ["#51432d" if checked else "#171414",x,"#c5b28a" if checked else "#534a3e","M64 19 L69 24 L78 14" if checked else "M12 20 L22 20","#211b16" if checked else "#dfd6c2"])
		for suffix in ["","_disabled"]:
			button.add_theme_icon_override(("checked" if checked else "unchecked")+suffix,icon)
	button.add_theme_stylebox_override("focus",_control_box(Color(0.64,0.57,0.45,0.08),0))
