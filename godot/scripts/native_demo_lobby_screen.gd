extends Control
const UI = preload("res://scripts/native_demo_ui_i18n.gd")
## Standalone request screen: res://scenes/demo_lobby.tscn. No combat/Main boot.
signal new_game_requested(slot: int, data: Dictionary)
signal continue_requested(slot: int, data: Dictionary)
const Entry = preload("res://scripts/native_demo_lobby_entry.gd")
var entry = Entry.new()
var character_index := 0
var detail_labels: Array[Label]=[]
var detail_traits: Array[Label]=[]
var detail_scene: TextureRect
var detail_thumb: TextureRect
var detail_create: Button
var detail_lock: Control
var character_source: Array=JSON.parse_string(FileAccess.get_file_as_string("res://data/parity_ui_06_characters.json"))
var character_buttons: Array[Button] = []
var creation_error: Label
var _entry_enabled := false
var _movie: CanvasLayer
var _launching := false
const Menu = preload("res://scripts/native_save_slot_menu.gd")
const Bridge = preload("res://scripts/native_settings_lobby_bridge.gd")
const Fonts = preload("res://scripts/native_ui_fonts.gd")
@export var language := "" # Empty uses the current settings locale.
var menu = Menu.new()
var bridge = Bridge.new()
var cards: Array[Button] = []
var card_names: Array[Label] = []
var card_infos: Array[Label] = []
var card_thumbs: Array[TextureRect] = []
var status: Label
var start: Button
var erase: Button
var name_input: LineEdit
var modal: Control
var modal_title: Label
var modal_error: Label
var modal_record: Label
var modal_slot_number: Label
var cancel: Button
var confirm: Button
var _previous_focus: Control
var _form_slot := -1
var _form: Control
var _name_form: Control
var _name_box: Control
var language_select: OptionButton
var _quit_modal: Control
var _modal_quit:=false
var slot_delete_buttons:Array[Button]=[]
var _card_order: Array[int]=[]
var _new_card: Button
var _enter_art: TextureRect
var _ancestor: TextureRect
var _keyart: TextureRect
var _disp_sub: Label
var _disp_title: Label
var _disp_title_shadow: Label
var _disp_detail: Label
var _disp_lines: Array[Control]=[]
const BONE = Color("dfd6c2")
const GOLD = Color("96714e")

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	if not language.is_empty():TranslationServer.set_locale(language)
	bridge.configure(TranslationServer.get_locale())
	_build()
	menu.changed.connect(_render)
	menu.new_game_requested.connect(func(slot: int, data: Dictionary):
		status.text = tr_text("새 전사 기록을 만들었습니다.","New warrior record created.")
		new_game_requested.emit(slot,data))
	menu.continue_requested.connect(func(slot: int, data: Dictionary):
		status.text = tr_text("선택한 기록을 확인했습니다.","Selected record checked.")
		continue_requested.emit(slot,data))
	_entry_enabled=bool(get_meta("native_lobby_entry_enabled",get_tree().get_script()==null))
	if _entry_enabled:
		new_game_requested.connect(_queue_entry)
		continue_requested.connect(func(slot:int,data:Dictionary):_queue_entry(slot,data,false))
	menu.open()
	var saved_language:Dictionary=menu.storage.get_item("hellLang")
	if saved_language.get("found",false) and saved_language.raw in ["ko","en"]:TranslationServer.set_locale(saved_language.raw)
	language_select.select(0 if TranslationServer.get_locale().begins_with("ko") else 1)
	var first_empty := 0
	for i in menu.rows.size():
		if menu.rows[i].kind=="empty":
			first_empty=i
			break
	_new_card.grab_focus() # index3825: initial focus on the create card
	if _entry_enabled and not get_tree().has_meta("parity_lobby_cinematic_seen"):
		get_tree().set_meta("parity_lobby_cinematic_seen",true)
		call_deferred("_play_cinematic")

func tr_text(ko: String, en: String) -> String: return UI.text(ko)
func _input(event: InputEvent) -> void:
	bridge.observe(event)
	# Let the native LineEdit own IME composition/cancel keys.
	if _name_form.visible and name_input.has_focus() and (event is not InputEventKey or event.keycode!=KEY_ESCAPE or name_input.has_ime_text()): return
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_ESCAPE:
		if modal.visible: _close_modal()
		elif _name_form.visible: _close_form()
		elif _form.visible: _close_form()
		get_viewport().set_input_as_handled()

func _box(rect: Rect2, fill: Color, edge: Color, parent: Node = self) -> Panel:
	var p := Panel.new()
	p.position=rect.position; p.size=rect.size
	var s := StyleBoxFlat.new()
	s.bg_color=fill; s.border_color=edge; s.set_border_width_all(1)
	s.content_margin_left=24; s.content_margin_top=16
	p.add_theme_stylebox_override("panel",s)
	parent.add_child(p)
	return p
func _label(text: String, at: Vector2, width: float, px: int, parent: Node = self, title := false) -> Label:
	var l := Label.new()
	UI.bind(l,text); l.position=at; l.size=Vector2(width,60)
	l.add_theme_font_override("font",Fonts.stack("hell_title" if title else "hell",700 if title else 400))
	l.add_theme_font_size_override("font_size",px); l.add_theme_color_override("font_color",BONE)
	l.mouse_filter=Control.MOUSE_FILTER_IGNORE
	parent.add_child(l)
	return l
func _button(text: String, rect: Rect2, callback: Callable, parent: Node = self, danger := false) -> Button:
	var b := Button.new()
	UI.bind(b,text); b.clip_text=true; b.position=rect.position; b.size=rect.size
	b.add_theme_font_override("font",Fonts.stack("hell",400)); b.add_theme_font_size_override("font_size",22)
	for state in ["normal","hover","pressed","focus","disabled"]:
		var s := StyleBoxFlat.new()
		s.bg_color=Color("321719") if danger else Color("151315")
		if state in ["hover","focus"]: s.bg_color=Color("402522")
		s.border_color=Color("c59c65") if state in ["hover","focus"] else GOLD
		s.set_border_width_all(2 if state=="focus" else 1)
		b.add_theme_stylebox_override(state,s)
	b.add_theme_color_override("font_color",BONE)
	b.add_theme_color_override("font_disabled_color",Color("766b65"))
	parent.add_child(b); b.pressed.connect(callback)
	return b
func _image(path: String, rect: Rect2, parent: Node = self) -> TextureRect:
	var t := TextureRect.new()
	t.name=path.get_file().get_basename()
	t.expand_mode=TextureRect.EXPAND_IGNORE_SIZE
	t.texture=load(path) if FileAccess.file_exists(path) else null; t.position=rect.position; t.size=rect.size
	t.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_COVERED
	t.mouse_filter=Control.MOUSE_FILTER_IGNORE; parent.add_child(t)
	return t
func _build() -> void:
	# index.html736–850, final lobby-layout CSS504–528 (1920×1080).
	_image("res://assets/ui/parity_ui_04/lobby_first_frame.png",Rect2(0,0,1920,1080))
	_ancestor=_image("res://assets/ui/parity_ui_04/ancestor.png",Rect2(381.8,76.8,531.7,864))
	# index744/172–174 #lobbyCharKeyart: selected record still, brightness(.82) contrast(1.04), cover.
	_keyart=_image("res://assets/ui/parity_ui_05/poster_idle_warrior_cs3_4k.jpg",Rect2(0,0,1920,1080));_keyart.hide()
	preload("res://scripts/native_parity_ui_surface.gd").brighten(_keyart,.82,1.04)
	_build_char_display()
	_build_version_overlay()
	_box(Rect2(1360,0,560,1080),Color("09090a"),Color.TRANSPARENT) # ui-refinement656: .lobby-right border:0
	var sigil:=_image("res://assets/ui/parity_ui_03/sigil.png",Rect2(1330,-68,620,620));sigil.modulate.a=.14
	var rail:=preload("res://scripts/native_parity_ui_surface.gd").Rail.new();rail.image=load("res://assets/ui/parity_ui_04/lobby_frame.png");rail.slice=.22;rail.width=48;rail.position=Vector2(1360,0);rail.size=Vector2(560,1080);rail.mouse_filter=Control.MOUSE_FILTER_IGNORE;add_child(rail)
	_image("res://assets/ui/parity_ui_04/logo.png",Rect2(1388,195,498,104)).stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	language_select=OptionButton.new();language_select.position=Vector2(1388,151.46875);language_select.size=Vector2(140,27);language_select.add_item("한국어");language_select.add_item("English");language_select.add_theme_font_override("font",Fonts.stack("font"));language_select.add_theme_font_size_override("font_size",12);language_select.add_theme_color_override("font_color",Color("ccaa88"));add_child(language_select)
	var language_style:=StyleBoxFlat.new();language_style.bg_color=Color(10.0/255,6.0/255,2.0/255,.8);language_style.border_color=Color(120.0/255,80.0/255,40.0/255,.4);language_style.set_border_width_all(1);language_select.add_theme_stylebox_override("normal",language_style)
	language_select.item_selected.connect(_select_language)
	var offline:=_label("OFFLINE",Vector2(1536,151),350,12);offline.size.y=27;offline.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT;offline.add_theme_font_override("font",Fonts.stack("font",700));offline.add_theme_color_override("font_color",Color(180.0/255,140.0/255,110.0/255,.55))
	# index809–838 / lobby-layout-20261016 504–528 / ui-refinement656–657,1005,1014 / index3576–3625.
	var records:=ScrollContainer.new();records.position=Vector2(1392,315);records.size=Vector2(480,178);records.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;add_child(records)
	var rows:=VBoxContainer.new();rows.add_theme_constant_override("separation",10);rows.size_flags_horizontal=Control.SIZE_EXPAND_FILL;records.add_child(rows)
	for i in 5:
		var b:=SlotCard.new();b.focus_mode=Control.FOCUS_ALL;b.custom_minimum_size=Vector2(470,84);b.size=Vector2(470,84)
		for state in ["normal","hover","pressed","focus","disabled"]:b.add_theme_stylebox_override(state,StyleBoxEmpty.new())
		rows.add_child(b);b.pressed.connect(_choose_card.bind(i));cards.append(b)
		var thumb:=Panel.new();thumb.position=Vector2(25,14);thumb.size=Vector2(56,56);thumb.mouse_filter=Control.MOUSE_FILTER_IGNORE
		var ts:=StyleBoxFlat.new();ts.bg_color=Color("0b0c0e");ts.border_color=Color(117/255.0,100/255.0,71/255.0);ts.set_border_width_all(1);ts.set_corner_radius_all(2);thumb.add_theme_stylebox_override("panel",ts);b.add_child(thumb)
		var portrait:=_image("res://assets/ui/demo_lobby/charselect/portrait_warrior.png",Rect2(1,1,54,54),thumb);card_thumbs.append(portrait)
		var dash:=_css_label("—",Rect2(0,0,56,56),25.6,Color(180/255.0,140/255.0,110/255.0,.4*.4),"font",300,0.0,thumb);dash.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;dash.vertical_alignment=VERTICAL_ALIGNMENT_CENTER;b.thumb_dash=dash
		var name_label:=_css_label("",Rect2(95,19,330,24),16.8,Color(238/255.0,228/255.0,212/255.0),"font",600,.84,b);card_names.append(name_label)
		var badge:=Panel.new();badge.size=Vector2(38.4,20);badge.mouse_filter=Control.MOUSE_FILTER_IGNORE
		var bs:=StyleBoxFlat.new();bs.bg_color=Color(120/255.0,80/255.0,40/255.0,.14);bs.border_color=Color(180/255.0,130/255.0,70/255.0,.45);bs.set_border_width_all(1);bs.set_corner_radius_all(3);badge.add_theme_stylebox_override("panel",bs);b.add_child(badge);b.badge=badge
		var badge_text:=_css_label("",Rect2(0,0,38.4,20),11.2,Color(217/255.0,162/255.0,74/255.0),"font",700,.896,badge);badge_text.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;badge_text.vertical_alignment=VERTICAL_ALIGNMENT_CENTER;badge_text.add_theme_color_override("font_shadow_color",Color.BLACK);badge_text.add_theme_constant_override("shadow_offset_y",1);badge_text.add_theme_constant_override("shadow_offset_x",0);b.badge_text=badge_text
		var info_label:=_css_label("",Rect2(95,47,330,18),12.48,Color(184/255.0,175/255.0,159/255.0),"font",400,.7488,b);card_infos.append(info_label)
		var delete_button:=_button("✕",Rect2(431,28,28,28),func():
			if menu.ask_delete(_card_slot(i)):_show_modal(),b);delete_button.add_theme_font_size_override("font_size",14);delete_button.add_theme_color_override("font_color",Color(199/255.0,143/255.0,136/255.0))
		for state in ["normal","hover","pressed","focus"]:
			var ds:=StyleBoxFlat.new();ds.bg_color=Color.TRANSPARENT if state=="normal" else Color(120/255.0,30/255.0,20/255.0,.2);ds.border_color=Color(117/255.0,68/255.0,62/255.0);ds.set_border_width_all(1);ds.set_corner_radius_all(2);delete_button.add_theme_stylebox_override(state,ds)
		delete_button.focus_mode=Control.FOCUS_NONE;delete_button.modulate.a=0.0;slot_delete_buttons.append(delete_button)
		b.delete_button=delete_button
		b.mouse_entered.connect(func():b.hovered_card=true;_sync_delete_visibility())
		b.mouse_exited.connect(func():b.hovered_card=false;_sync_delete_visibility())
		b.focus_entered.connect(_sync_delete_visibility);b.focus_exited.connect(_sync_delete_visibility)
	_new_card=SlotCard.new();_new_card.is_new=true;_new_card.position=Vector2(1392,503);_new_card.size=Vector2(480,64);_new_card.focus_mode=Control.FOCUS_ALL
	for state in ["normal","hover","pressed","focus","disabled"]:_new_card.add_theme_stylebox_override(state,StyleBoxEmpty.new())
	add_child(_new_card)
	_new_card.pressed.connect(func():
		for i in menu.rows.size():
			if menu.rows[i].kind=="empty":_choose(i);return)
	var new_thumb:=Panel.new();new_thumb.position=Vector2(17,12);new_thumb.size=Vector2(40,40);new_thumb.mouse_filter=Control.MOUSE_FILTER_IGNORE
	var nts:=StyleBoxFlat.new();nts.bg_color=Color("0b0c0e");nts.border_color=Color(117/255.0,100/255.0,71/255.0);nts.set_border_width_all(1);nts.set_corner_radius_all(2);new_thumb.add_theme_stylebox_override("panel",nts);_new_card.add_child(new_thumb)
	var plus:=_css_label("+",Rect2(0,0,40,40),25.6,Color(180/255.0,140/255.0,110/255.0,.4),"font",300,0.0,new_thumb);plus.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;plus.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
	var new_name:=_css_label("",Rect2(69,21,394,22),15.2,Color(238/255.0,228/255.0,212/255.0),"font",600,.608,_new_card);UI.bind(new_name,"새 캐릭터")
	var wishlist_caption:=_label("여러분의 Steam 찜 하나가\nEXODUSER: HELL LORD의\n다음 여정을 만듭니다",Vector2(1392,591),490,14);wishlist_caption.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;wishlist_caption.add_theme_font_override("font",Fonts.stack("font",700));wishlist_caption.add_theme_constant_override("line_spacing",-3)
	var wishlist_sub:=_label("공식 출시 소식을 가장 먼저 받아보세요",Vector2(1392,652),490,11);wishlist_sub.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	var wishlist:=_button("",Rect2(1537,674,200,44),func():OS.shell_open("https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/"))
	wishlist.name="WishlistButton";wishlist.add_theme_stylebox_override("normal",StyleBoxEmpty.new())
	_image("res://assets/ui/parity_ui_04/wishlist.png",Rect2(0,0,200,44),wishlist).stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	# lobby-layout524: .lobby-footer border-top 1px #96714e55 (1388,740,504).
	var footer_line:=ColorRect.new();footer_line.position=Vector2(1388,740);footer_line.size=Vector2(504,1);footer_line.color=Color("96714e55");footer_line.mouse_filter=Control.MOUSE_FILTER_IGNORE;add_child(footer_line)
	start=_button("",Rect2(1392,751,496,132),func():menu.request_continue())
	for state in ["normal","hover","pressed","focus","disabled"]:start.add_theme_stylebox_override(state,StyleBoxEmpty.new())
	_enter_art=_image("res://assets/ui/parity_ui_04/enter.png",Rect2(0,0,496,132),start);_enter_art.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	# index306: .enter-game-btn:disabled img → grayscale(1) brightness(.45).
	var gray:=ShaderMaterial.new();gray.shader=Shader.new();gray.shader.code="shader_type canvas_item;varying vec4 vmod;uniform float off=0.0;void vertex(){vmod=COLOR;}void fragment(){vec4 c=texture(TEXTURE,UV);float l=dot(c.rgb,vec3(.2126,.7152,.0722));vec3 g=vec3(l)*.45;COLOR=vec4(mix(c.rgb,g,off),c.a)*vmod;}"
	_enter_art.material=gray
	erase=_button("삭제",Rect2(1820,560,64,30),func():
		if menu.ask_delete(menu.selected):_show_modal());erase.hide()
	status=_label("",Vector2(1388,876),504,12);status.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	var replay:=_css_label("",Rect2(1388,897,61,32),11.2,Color(184/255.0,163/255.0,134/255.0),"font",400,.896,self);UI.bind(replay,"▶ 시네마틱");replay.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
	var replay_button:=Button.new();replay_button.position=Vector2(1388,897);replay_button.size=Vector2(61,32);replay_button.flat=true;replay_button.name="ReplayCinematic"
	for state in ["normal","hover","pressed","focus"]:replay_button.add_theme_stylebox_override(state,StyleBoxEmpty.new())
	replay_button.pressed.connect(_play_cinematic);add_child(replay_button)
	# #lobbyVersionTxt: _LOBBY_VER_LABEL.demo, .64rem/.28em rgba(125,100,70,.32), right-aligned before the quit button.
	var build_label:=_css_label("DEMO",Rect2(1700,905.5,144,15),10.24,Color(125/255.0,100/255.0,70/255.0,.32),"font",400,2.8672,self);build_label.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
	var quit_button:=QuitButton.new();quit_button.name="QuitButton";quit_button.position=Vector2(1856,895);quit_button.size=Vector2(36,36);quit_button.focus_mode=Control.FOCUS_ALL
	for state in ["normal","hover","pressed","focus"]:quit_button.add_theme_stylebox_override(state,StyleBoxEmpty.new())
	quit_button.pressed.connect(_show_quit);add_child(quit_button)
	_form=_box(Rect2(0,0,1920,1080),Color("090609"),Color.TRANSPARENT)
	_form.hide()
	var scene:=_image("res://assets/ui/parity_ui_05/poster_idle_warrior_cs3_4k.jpg",Rect2(0,0,1920,1080),_form);scene.modulate=Color(.82,.82,.82)
	detail_scene=scene
	var poster_grade:=ShaderMaterial.new();poster_grade.shader=preload("res://shaders/parity_ui_06_poster.gdshader");detail_scene.material=poster_grade;detail_scene.modulate=Color.WHITE
	var vignette:=ColorRect.new();vignette.size=Vector2(1920,1080);vignette.mouse_filter=Control.MOUSE_FILTER_IGNORE
	var vig:=ShaderMaterial.new();vig.shader=preload("res://shaders/parity_ui_06_vignette.gdshader");vignette.material=vig;_form.add_child(vignette)
	_box(Rect2(19,16,1882,1048),Color.TRANSPARENT,Color(.72,.56,.27,.22),_form)
	var header:=_label(tr_text("캐릭터 선택","Character Select"),Vector2(0,42),1920,38,_form,true);header.add_theme_font_override("font",Fonts.stack("font",700));header.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;header.add_theme_color_override("font_color",Color("e8c87a"))
	var hint:=_label(tr_text("지옥에 강림할 화신을 선택하라","Choose your incarnation"),Vector2(0,98),1920,16,_form);hint.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	var cls:=_label("",Vector2(72,324),320,14,_form);cls.text=UI.text("전사");detail_labels.append(cls);cls.add_theme_color_override("font_color",Color("c89a4a"))
	detail_labels.append(_label(tr_text("엑소듀서 전사","WARRIOR"),Vector2(72,354),340,34,_form,true))
	detail_labels.append(_label(tr_text("거대검을 휘두르는 흑철의 전사","A black-iron warrior wielding a greatsword"),Vector2(72,430),320,15,_form))
	detail_thumb=_image("res://assets/ui/demo_lobby/charselect/portrait_warrior.png",Rect2(72,492,150,200),_form)
	var traits:=_box(Rect2(1524,340,324,326),Color(.05,.03,.025,.85),GOLD,_form)
	var heading:=_label(tr_text("플레이 방식","Playstyle"),Vector2(22,26),296,16,traits,true);heading.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	var titles=["근접 화신","흑철의 방어","파멸의 일격"]
	var descriptions=["거대검을 휘두르는 정면 돌파형 전투가입니다.","검은 갑옷으로 적의 공세를 견디고 되받아칩니다.","느리지만 치명적인 광역 참격을 내리꽂습니다."]
	for i in 3:
		_box(Rect2(22,77+i*80,34,34),Color("302014"),Color("a0784680"),traits)
		_label(["⚔","◈","✦"][i],Vector2(22,74+i*80),34,18,traits).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
		detail_traits.append(_label(UI.text(titles[i]),Vector2(69,72+i*80),245,15,traits,true));detail_traits[-1].add_theme_font_override("font",Fonts.stack("font",700))
		var desc:=_label(UI.text(descriptions[i]),Vector2(69,98+i*80),232,13,traits);desc.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;desc.set_deferred("size",Vector2(232,42));desc.add_theme_font_override("font",Fonts.stack("font",400));detail_traits.append(desc)
	var portraits=["emblem_warrior.png","emblem_silvertail.png","emblem_hellgunner.png","emblem_transmuter.png","emblem_spearmage.png"]
	for i in 5:
		var b:=_button("",Rect2(710+i*108,864,70,70),_select_character.bind(i),_form)
		var round_style:=StyleBoxFlat.new();round_style.bg_color=Color("17100b");round_style.border_color=Color("c59c65") if i==0 else GOLD;round_style.set_border_width_all(2);round_style.set_corner_radius_all(35);b.add_theme_stylebox_override("normal",round_style);b.add_theme_stylebox_override("focus",round_style);b.add_theme_stylebox_override("hover",round_style)
		var icon:=_image("res://assets/ui/parity_ui_05/"+portraits[i],Rect2(6,6,58,58),b);icon.material=_portrait_circle();icon.modulate=Color.WHITE if i==0 else Color(.35,.35,.35)
		var caption:=_label(UI.text(["전사","실버테일","헬거너","변성술사","창법사"][i]),Vector2(-19,79),108,13,b);caption.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
		if i>0:
			_image("res://assets/ui/parity_ui_05/coming_soon_chains_v2.png",Rect2(0,0,70,70),b)
			var soon:=_label(UI.text("출시 준비 중"),Vector2(-19,106),108,11,b);soon.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
		character_buttons.append(b)
	_button(tr_text("취소","Cancel"),Rect2(580,1006,190,44),_close_form,_form)
	detail_create=_button(tr_text("생성","Create"),Rect2(1100,1006,240,44),_open_name,_form,true)
	detail_lock=_image("res://assets/ui/parity_ui_05/coming_soon_chains_v2.png",Rect2(740,248,440,440),_form);detail_lock.hide()
	_box(Rect2(114,448,212,62),Color("0c0a0af0"),Color("80705a"),detail_lock)
	_label(UI.text("출시 준비 중"),Vector2(114,448),212,24,detail_lock).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	var ornaments:=SourceOrnaments.new();ornaments.size=Vector2(1920,1080);ornaments.mouse_filter=Control.MOUSE_FILTER_IGNORE;_form.add_child(ornaments)
	_name_form=Control.new();_name_form.size=Vector2(1920,1080);_form.add_child(_name_form);_name_form.hide()
	var blur:=ColorRect.new();blur.size=Vector2(1920,1080);var blur_material:=ShaderMaterial.new();blur_material.shader=preload("res://shaders/sweep_b_dialog_blur.gdshader");blur.material=blur_material;_name_form.add_child(blur)
	_name_box=Control.new();_name_box.position=Vector2(740,372.5);_name_box.size=Vector2(440,335);_name_form.add_child(_name_box)
	var surface:=preload("res://scripts/native_parity_ui_surface.gd")
	surface.iron(_name_box,Rect2(0,0,440,335),Color("131215ee"),Color("0b0b0eef"))
	_box(Rect2(0,0,440,335),Color.TRANSPARENT,Color("756247"),_name_box)
	_box(Rect2(3,3,434,329),Color.TRANSPARENT,Color("a68a5433"),_name_box)
	_box(Rect2(6,6,428,323),Color.TRANSPARENT,Color("a68a542b"),_name_box)
	var name_title:=_label("새 캐릭터 생성",Vector2(41,49),358,24,_name_box,true);name_title.size.y=32;name_title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;var title_font: FontVariation=Fonts.stack("disp_title",700).duplicate();title_font.spacing_glyph=2;name_title.add_theme_font_override("font",title_font);name_title.add_theme_color_override("font_color",Color("ecd9b7"));name_title.add_theme_color_override("font_shadow_color",Color.BLACK);name_title.add_theme_constant_override("shadow_offset_x",0);name_title.add_theme_constant_override("shadow_offset_y",2)
	var description:=_label("지옥에 보낼 캐릭터의 이름을 지어주세요",Vector2(41,89),358,13,_name_box);description.size.y=19;description.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;var desc_font: FontVariation=Fonts.stack("font").duplicate();desc_font.spacing_glyph=1;description.add_theme_font_override("font",desc_font);description.add_theme_color_override("font_color",Color("c4b69e"))
	var name_caption:=_label("캐릭터 이름 (2~8자)",Vector2(41,136),358,14,_name_box);name_caption.size.y=21;var caption_font: FontVariation=Fonts.stack("font").duplicate();caption_font.spacing_glyph=1;name_caption.add_theme_font_override("font",caption_font);name_caption.add_theme_color_override("font_color",Color("d3c1a2"))
	name_input=LineEdit.new();name_input.max_length=8;name_input.position=Vector2(41,165);name_input.size=Vector2(358,54)
	var input_box:=StyleBoxFlat.new();input_box.bg_color=Color("090a0d");input_box.border_color=Color("79654a");input_box.set_border_width_all(1);input_box.set_corner_radius_all(2);input_box.content_margin_left=18;input_box.content_margin_right=18
	name_input.add_theme_stylebox_override("normal",input_box)
	var focused:StyleBoxFlat=input_box.duplicate();focused.border_color=Color("d7b985");focused.shadow_color=Color(215/255.0,185/255.0,133/255.0,.2);focused.shadow_size=2;name_input.add_theme_stylebox_override("normal",focused);name_input.add_theme_stylebox_override("focus",StyleBoxEmpty.new())
	name_input.add_theme_color_override("font_color",Color("f1e4c9"));name_input.add_theme_color_override("caret_color",Color("d7b985"));var input_font: FontVariation=Fonts.stack("font").duplicate();input_font.spacing_glyph=1;name_input.add_theme_font_override("font",input_font);name_input.add_theme_font_size_override("font_size",16);_name_box.add_child(name_input)
	name_input.text_submitted.connect(func(_value:String):_create())
	creation_error=_label("",Vector2(41,239),358,12,_name_box);creation_error.size.y=34;creation_error.vertical_alignment=VERTICAL_ALIGNMENT_CENTER;creation_error.add_theme_font_override("font",Fonts.stack("font"));creation_error.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;creation_error.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;creation_error.add_theme_color_override("font_color",Color(204/255.0,68/255.0,51/255.0));creation_error.hide()
	for i in 2:
		var b:Button=surface.button(_name_box,["취소","생성"][i],Rect2(41+i*185,239,173,47),_close_form if i==0 else _create,i==1,14)
		b.name="NameCancel" if i==0 else "NameCreate"
		_web_button(b,i==1,2,14.4,700 if i==1 else 400,1.152 if i==0 else 1.728)
	modal=Control.new(); modal.size=Vector2(1920,1080); add_child(modal)
	var veil := ColorRect.new(); veil.color=Color(0,0,0,0.85); veil.size=modal.size; modal.add_child(veil)
	var dialog:=Control.new();dialog.position=Vector2(760,470);dialog.size=Vector2(400,140);modal.add_child(dialog)
	surface.iron(dialog,Rect2(0,0,400,140),Color("131215ee"),Color("0b0b0eef"))
	for inset in [0,4,7]:_box(Rect2(inset,inset,400-inset*2,140-inset*2),Color.TRANSPARENT,Color("756247") if inset==0 else Color("a68a5444"),dialog)
	modal_title=_label("",Vector2(34,26),332,16,dialog);modal_title.size.y=24;modal_title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;modal_title.add_theme_font_override("font",Fonts.stack("font"));modal_title.add_theme_color_override("font_color",Color("ecd9b7"))
	modal_error=_label("",Vector2(34,113),332,12,dialog);modal_error.size.y=20
	confirm=surface.button(dialog,"확인",Rect2(34,70,160,44),func():
		if _modal_quit:get_tree().quit()
		elif menu.confirm_delete():_close_modal(),true,16)
	cancel=surface.button(dialog,"취소",Rect2(206,70,160,44),_close_modal,false,16)
	# index #delConfirmYes/No: 16px/700, radius 4; _delHighlight outlines the focused choice 2px #C9A961.
	_web_button(confirm,true,4,16,700,0.0);_web_button(cancel,false,4,16,700,0.0)
	cancel.focus_neighbor_left=cancel.get_path_to(confirm); cancel.focus_neighbor_right=cancel.get_path_to(confirm)
	confirm.focus_neighbor_left=confirm.get_path_to(cancel); confirm.focus_neighbor_right=confirm.get_path_to(cancel)
	cancel.focus_previous=cancel.get_path_to(confirm); cancel.focus_next=cancel.get_path_to(confirm)
	confirm.focus_previous=confirm.get_path_to(cancel); confirm.focus_next=confirm.get_path_to(cancel)
	modal.hide()

## ui-refinement: plate button edge — 1px border, inset top light, inset bottom bar, focus outline 2px #C9A961.
func _web_button(b: Button,active: bool,radius: int,px: float,weight: int,spacing: float) -> void:
	var font: FontVariation=Fonts.stack("font",weight).duplicate();font.spacing_glyph=roundi(spacing)
	b.add_theme_font_override("font",font);b.add_theme_font_size_override("font_size",roundi(px))
	b.add_theme_color_override("font_color",Color(1,240/255.0,209/255.0) if active else Color(223/255.0,206/255.0,176/255.0))
	b.add_theme_color_override("font_focus_color",b.get_theme_color("font_color"));b.add_theme_color_override("font_hover_color",b.get_theme_color("font_color"))
	for child in b.get_children():
		if child is TextureRect and child.material is ShaderMaterial:
			child.material.set_shader_parameter("tint",Color(87/255.0*.9+38/255.0*.1,23/255.0,12/255.0,.66) if active else Color(21/255.0,20/255.0,23/255.0,.59))
	var edge:=WebEdge.new();edge.active=active;edge.radius=radius;edge.size=b.size;edge.mouse_filter=Control.MOUSE_FILTER_IGNORE;b.add_child(edge)
	b.focus_entered.connect(edge.queue_redraw);b.focus_exited.connect(edge.queue_redraw)

class WebEdge extends Control:
	var active:=false
	var radius:=2
	func _draw() -> void:
		var r:=Rect2(Vector2(.5,.5),size-Vector2.ONE)
		var border:=Color(181/255.0,123/255.0,89/255.0) if active else Color(116/255.0,96/255.0,74/255.0)
		draw_line(Vector2(radius,1.5),Vector2(size.x-radius,1.5),Color(216/255.0,196/255.0,154/255.0,.2),1.0)
		draw_rect(Rect2(1,size.y-3,size.x-2,2),Color(171/255.0,115/255.0,84/255.0) if active else Color("090909"))
		var sb:=StyleBoxFlat.new();sb.draw_center=false;sb.border_color=border;sb.set_border_width_all(1);sb.set_corner_radius_all(radius);sb.anti_aliasing=true
		draw_style_box(sb,Rect2(Vector2.ZERO,size))
		if get_parent() is Control and (get_parent() as Control).has_focus():
			var ring:=StyleBoxFlat.new();ring.draw_center=false;ring.border_color=Color("c9a961");ring.set_border_width_all(2);ring.set_corner_radius_all(radius);ring.expand_margin_left=2;ring.expand_margin_right=2;ring.expand_margin_top=2;ring.expand_margin_bottom=2
			draw_style_box(ring,Rect2(Vector2.ZERO,size))

class SourceOrnaments extends Control:
	func _draw() -> void:
		var gold:=Color(.784,.588,.275,.55)
		for pair in [[Vector2(18,60),Vector2(18,14),Vector2(64,14)],[Vector2(1856,1066),Vector2(1902,1066),Vector2(1902,1020)]]:
			draw_polyline(PackedVector2Array(pair),gold,2,true)
		for x in [688,1112]:draw_line(Vector2(x,70),Vector2(x+120,70),Color(.784,.588,.275,.5),1,true)
		for rect in [Rect2(70,490,154,204),Rect2(1522,338,328,330)]:
			for corner in [rect.position,Vector2(rect.end.x,rect.position.y),rect.end,Vector2(rect.position.x,rect.end.y)]:
				var dx:=1 if corner.x==rect.position.x else -1
				var dy:=1 if corner.y==rect.position.y else -1
				draw_line(corner,corner+Vector2(16*dx,0),gold,2,true);draw_line(corner,corner+Vector2(0,16*dy),gold,2,true)
		draw_line(Vector2(72,408),Vector2(128,408),gold,2,true)
		draw_line(Vector2(1546,401),Vector2(1826,401),Color(.588,.431,.235,.35),1,true)
		draw_circle(Vector2(1686,340),14,Color("21160d"));draw_arc(Vector2(1686,340),14,0,TAU,48,gold,1,true)

class LockMark extends Control:
	func _draw() -> void:
		draw_arc(Vector2(14,8),10,PI,TAU,20,Color("dfd6c2"),2,true)
		draw_rect(Rect2(2,8,24,22),Color("161014"))
		draw_rect(Rect2(2,8,24,22),Color("bba27d"),false,2)
		draw_line(Vector2(14,16),Vector2(14,23),Color("dfd6c2"),2,true)

func _close_form() -> void:
	_form.hide()
	for b in cards: b.focus_mode=Control.FOCUS_ALL
	start.focus_mode=Control.FOCUS_ALL
	erase.focus_mode=Control.FOCUS_ALL
	_new_card.grab_focus()

func _choose(slot: int) -> void:
	if not menu.select_slot(slot): return
	if menu.rows[slot].kind=="empty":
		for b in cards: b.focus_mode=Control.FOCUS_NONE
		start.focus_mode=Control.FOCUS_NONE
		erase.focus_mode=Control.FOCUS_NONE
		_form_slot=slot; _select_character(0); creation_error.text=""; _form.show(); _name_form.hide(); name_input.clear(); character_buttons[0].grab_focus()
	else: _form.hide()
func _select_character(index: int) -> void:
	character_index=index
	var ch: Dictionary=character_source[index]
	detail_labels[0].text=UI.text(ch.job);detail_labels[1].text=UI.text(ch.name);detail_labels[2].text=UI.text(ch.desc)
	detail_scene.material.set_shader_parameter("locked",index!=0);detail_scene.texture=load(ch.poster);detail_thumb.texture=load(ch.bust)
	for i in 3:
		detail_traits[i*2].text=UI.text(ch.traits[i][1]);detail_traits[i*2+1].text=UI.text(ch.traits[i][2])
	for i in character_buttons.size():
		var button:=character_buttons[i];button.pivot_offset=Vector2(35,35);button.scale=Vector2.ONE*(1.1 if i==index else 1.0)
		var edge: StyleBoxFlat=button.get_theme_stylebox("normal").duplicate();edge.border_color=Color("b64b36") if i==index else GOLD
		for state in ["normal","focus","hover"]:button.add_theme_stylebox_override(state,edge)
	detail_create.disabled=index!=0;detail_create.text=UI.text("출시 준비 중" if index!=0 else "생성");detail_lock.visible=index!=0
	creation_error.text=""
func _create() -> void:
	var admission: Dictionary=Entry.validate_name(name_input.text,character_index)
	if not admission.ready:
		creation_error.text=_entry_error(admission.reason);_layout_name_error()
		return
	if menu.request_new(_form_slot,admission.name):
		_form.hide()
	else:
		creation_error.text=_entry_error(menu.last_error)
		status.text=creation_error.text;_layout_name_error()
func _entry_error(reason: String) -> String:
	match reason:
		"name_length":return tr_text("이름은 2~8자여야 합니다.","Name must be 2–8 characters.")
		"name_special":return tr_text("특수문자는 사용할 수 없습니다.","Special characters are not allowed.")
		"character_locked":return tr_text("출시 준비 중","Coming soon")
		"duplicate_name":return tr_text("이미 같은 이름의 캐릭터가 있습니다.","A warrior with this name already exists.")
		"active_save_sync_required":return tr_text("이전 전사의 저장 동기화가 필요합니다.","The previous warrior's save must be synchronized.")
		"saved_player_restore_required":return tr_text("입장하지 못했습니다. 기록은 보존됩니다.","Unable to enter. Your record is preserved.")
		_:return tr_text("입장하지 못했습니다. 기록은 보존됩니다.","Unable to enter. Your record is preserved.")
func _queue_entry(slot:int,_data:Dictionary,play_story:bool=true) -> void:
	call_deferred("_launch_entry",slot,play_story)
func _launch_entry(slot:int,play_story:bool=true) -> void:
	if not is_inside_tree() or is_queued_for_deletion():return
	if _launching:return
	_launching=true
	if play_story:
		var movie:CanvasLayer=_begin_movie("warrior")
		await movie.finished
	var result: Dictionary=entry.launch(self,slot)
	if not result.ready:
		_launching=false
		status.text=_entry_error(result.reason)
func _render() -> void:
	# index3555–3625: saved records first (slot order), empty placeholders up to VIEW=2, new card fixed below.
	_card_order.clear()
	var ready_rows: bool=menu.rows.size()==5
	if ready_rows:
		for row in menu.rows:
			if row.kind!="empty":_card_order.append(int(row.slot))
	var used: int=_card_order.size()
	if ready_rows:
		for row in menu.rows:
			if row.kind=="empty" and _card_order.size()<maxi(2,used):_card_order.append(int(row.slot))
	for i in cards.size():
		var card: SlotCard=cards[i]
		var slot: int=_card_order[i] if i<_card_order.size() else -1
		var row: Dictionary=menu.rows[slot] if slot>=0 else {"kind":"unavailable","summary":{}}
		card.visible=slot>=0
		var filled: bool=row.kind in ["saved","new"]
		card.kind=row.kind;card.selected=filled and menu.selected==slot
		card_names[i].text=str(row.summary.get("name","")) if filled else ("—" if row.kind=="empty" else tr_text("읽을 수 없는 기록 — 삭제 후 다시 생성","Unreadable record — delete to create again"))
		card_names[i].add_theme_color_override("font_color",Color(238/255.0,228/255.0,212/255.0))
		card_names[i].position.y=19.0 if filled else 30.0
		card_infos[i].text="Lv."+_number_label(row.summary.get("lv",1))+" · "+tr_text("1장 썩은 숲 1층","Chapter 1 · Rotten Forest 1F") if filled else ""
		card_thumbs[i].visible=filled
		card.thumb_dash.visible=not filled
		card.badge.visible=filled
		if filled:
			card.badge_text.text=UI.text("전사")
			var name_width: float=card_names[i].get_theme_font("font").get_string_size(card_names[i].text,HORIZONTAL_ALIGNMENT_LEFT,-1,card_names[i].get_theme_font_size("font_size")).x
			var badge_width: float=card.badge_text.get_theme_font("font").get_string_size(card.badge_text.text,HORIZONTAL_ALIGNMENT_LEFT,-1,card.badge_text.get_theme_font_size("font_size")).x+16.0
			card.badge.position=Vector2(95+name_width+8,21);card.badge.size=Vector2(badge_width,20);card.badge_text.size=card.badge.size
		slot_delete_buttons[i].visible=row.kind in ["saved","new","corrupt"]
		card.disabled=not menu.ready or row.kind=="empty"
		card.modulate=Color(1,1,1,.18 if row.kind=="empty" else 1.0)
		card.mouse_filter=Control.MOUSE_FILTER_IGNORE if row.kind=="empty" else Control.MOUSE_FILTER_STOP
		card.queue_redraw()
	var full: bool=used>=5
	_new_card.kind="new_full" if full else "new";_new_card.disabled=full;_new_card.modulate.a=.35 if full else 1.0;_new_card.queue_redraw()
	var has_selection: bool=menu.selected>=0 and menu.ready and menu.rows[menu.selected].kind in ["saved","new"]
	start.disabled=not has_selection
	_enter_art.material.set_shader_parameter("off",0.0 if has_selection else 1.0)
	start.text=""
	erase.disabled=menu.selected<0 or not menu.ready or menu.rows[menu.selected].kind=="empty"
	status.text="" if menu.last_error.is_empty() else _entry_error(menu.last_error)
	modal_error.text=tr_text("요청 실패 · ","Request failed · ")+menu.last_error if not menu.last_error.is_empty() else ""
	for b in cards: b.focus_mode=Control.FOCUS_NONE if modal.visible or _form.visible else Control.FOCUS_ALL
	start.focus_mode=Control.FOCUS_NONE if modal.visible or _form.visible else Control.FOCUS_ALL
	erase.focus_mode=Control.FOCUS_NONE if modal.visible or _form.visible else Control.FOCUS_ALL
	_update_char_display(menu.rows[menu.selected] if has_selection else {})
	_sync_delete_visibility()

## index3657–3706 _updateCharDisplay: selected record replaces the ancestor with its key art and name.
func _update_char_display(row: Dictionary) -> void:
	var selected: bool=not row.is_empty()
	_keyart.visible=selected;_ancestor.visible=not selected
	if selected:
		_disp_title.text=str(row.summary.get("name",""));_disp_sub.text=UI.text("전사");_disp_detail.text=""
	else:
		# Set directly (no TextBinding): _notification re-renders on locale change and re-balances the title.
		_disp_title.text=UI.text("묘왕 바르칸");_disp_sub.text=UI.text("선대 소환체");_disp_detail.text=UI.text("플레이어가 소환하는 선대의 영체")
	_layout_char_display(selected)

func _layout_char_display(selected: bool) -> void:
	# index .char-disp-empty is bottom-anchored (bottom:8%). Measured boxes 1920×1080:
	# idle KO title 44.8px h69 (Hangul line), EN 2 lines h122 (61/line); selected 36px h54; gap 4; sub 18.2; detail 16.8.
	var title_px: float=36.0 if selected else 44.8
	var spacing: int=roundi(title_px*(.16 if selected else .25))
	var title_font: FontVariation=Fonts.stack("disp_title",400).duplicate();title_font.spacing_glyph=spacing
	_disp_title.add_theme_font_override("font",title_font);_disp_title.add_theme_font_size_override("font_size",roundi(title_px))
	_disp_title.add_theme_color_override("font_color",Color(223/255.0,214/255.0,194/255.0,.94) if selected else Color(220/255.0,110/255.0,80/255.0,.78))
	_disp_title.text=_balance_lines(_disp_title.text.replace("\n"," "),title_font,roundi(title_px),500.0)
	var lines: int=_disp_title.text.count("\n")+1
	var hangul: bool=RegEx.create_from_string("[\\x{AC00}-\\x{D7A3}]").search(_disp_title.text)!=null
	var line_h: float=(54.0 if selected else 69.0) if hangul else roundf(title_px*1.3616)
	var title_h: float=line_h*lines
	var bottom: float=1047.6-(0.0 if selected else 16.8+4.0)
	var x: float=430.0 if selected else 383.6
	var title_top: float=bottom-title_h
	_disp_title.position=Vector2(x,title_top);_disp_title.size=Vector2(500,title_h)
	_disp_title_shadow.text=_disp_title.text;_disp_title_shadow.position=_disp_title.position+Vector2(0,5);_disp_title_shadow.size=_disp_title.size
	_disp_title_shadow.add_theme_font_override("font",title_font);_disp_title_shadow.add_theme_font_size_override("font_size",roundi(title_px))
	_disp_sub.position=Vector2(x,title_top-22.2);_disp_sub.size=Vector2(500,18.2)
	_disp_detail.position=Vector2(x,1030.8);_disp_detail.size=Vector2(500,16.8);_disp_detail.visible=not selected
	var box_top: float=_disp_sub.position.y-(6.0 if selected else 0.0)
	var line_y: float=box_top+(1047.6-box_top)*.43
	_disp_lines[0].position=Vector2(x,line_y);_disp_lines[1].position=Vector2(x+500-105,line_y)

## CSS text-wrap:balance for the display title: fewest lines, then most even widths.
static func _balance_lines(value: String,font: Font,px: int,width: float) -> String:
	# FontVariation.spacing_glyph is already included in get_string_size.
	var measure:=func(t: String) -> float:return font.get_string_size(t,HORIZONTAL_ALIGNMENT_LEFT,-1,px).x
	if measure.call(value)<=width or not value.contains(" "):return value
	var words: PackedStringArray=value.split(" ")
	var best:="";var best_score:=INF
	for i in range(1,words.size()):
		var first:=" ".join(words.slice(0,i));var second:=" ".join(words.slice(i))
		var w1: float=measure.call(first);var w2: float=measure.call(second)
		if w1>width or w2>width:continue
		var score:=maxf(w1,w2)
		if score<best_score:best_score=score;best=first+"\n"+second
	return value if best.is_empty() else best

func _build_char_display() -> void:
	# index175–182 .char-disp-*: drop-shadow(0 5px 12px #000e), side hairlines at 43%, glow animation 4.6s.
	for i in 2:
		var line:=GradientLine.new();line.size=Vector2(105,1);line.mirror=i==1;line.modulate.a=.76;line.mouse_filter=Control.MOUSE_FILTER_IGNORE;add_child(line);_disp_lines.append(line)
	_disp_sub=_css_label("",Rect2(383.6,935.6,500,18.2),13,Color(209/255.0,190/255.0,160/255.0),"cinzel_serif_kr",400,2.0,self)
	_disp_sub.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;_drop_shadow(_disp_sub)
	_disp_title_shadow=_css_label("",Rect2(383.6,957.8,500,69),44.8,Color(0,0,0,0),"disp_title",400,0.0,self)
	_disp_title_shadow.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;_disp_title_shadow.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
	_disp_title_shadow.add_theme_constant_override("line_spacing",0)
	_disp_title_shadow.add_theme_color_override("font_shadow_color",Color(0,0,0,.45));_disp_title_shadow.add_theme_constant_override("shadow_outline_size",8);_disp_title_shadow.add_theme_constant_override("shadow_offset_x",0);_disp_title_shadow.add_theme_constant_override("shadow_offset_y",0)
	_disp_title=_css_label("",Rect2(383.6,957.8,500,69),44.8,Color(220/255.0,110/255.0,80/255.0,.78),"disp_title",400,0.0,self)
	_disp_title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;_disp_title.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
	_disp_title.add_theme_constant_override("shadow_offset_x",0);_disp_title.add_theme_constant_override("shadow_offset_y",0);_disp_title.add_theme_constant_override("shadow_outline_size",8)
	_disp_title.add_theme_color_override("font_shadow_color",Color(196/255.0,68/255.0,68/255.0,.30))
	_disp_detail=_css_label("",Rect2(383.6,1030.8,500,16.8),12,Color(180/255.0,171/255.0,156/255.0),"font",400,.4,self)
	_disp_detail.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;_drop_shadow(_disp_detail)
	# @keyframes lobbyDispGlow: 0/100% 24px rgba(196,68,68,.30) ↔ 50% 46px rgba(224,96,74,.55), 4.6s ease-in-out.
	var glow:=create_tween().set_loops().set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	glow.tween_method(_set_disp_glow,0.0,1.0,2.3);glow.tween_method(_set_disp_glow,1.0,0.0,2.3)
	_layout_char_display(false)

func _set_disp_glow(t: float) -> void:
	if not is_instance_valid(_disp_title):return
	# Hard outline approximates the CSS blur: alpha scaled to the blur's average coverage (≈1/4).
	_disp_title.add_theme_color_override("font_shadow_color",Color(196/255.0,68/255.0,68/255.0,.30*.25).lerp(Color(224/255.0,96/255.0,74/255.0,.55*.25),t))
	_disp_title.add_theme_constant_override("shadow_outline_size",roundi(lerpf(8,14,t)))

func _drop_shadow(label: Label) -> void:
	# CSS drop-shadow(0 5px 12px #000e) is a blur; a hard Godot outline needs lower alpha to read the same.
	label.add_theme_color_override("font_shadow_color",Color(0,0,0,.45));label.add_theme_constant_override("shadow_offset_x",0)
	label.add_theme_constant_override("shadow_offset_y",5);label.add_theme_constant_override("shadow_outline_size",6)

## index1265–1272/3724–3731: label · release version · OFFLINE · build limits (top-left, pointer opens patch notes).
func _build_version_overlay() -> void:
	var lines: Array=["DEMO",_release_version_text(),"OFFLINE","Lv.1 START · Stage 1-1 Only · Lv.100 Cap · 1~2h"]
	for i in lines.size():
		var color:=Color(200/255.0,120/255.0,80/255.0,.5) if i==3 else Color(160/255.0,130/255.0,90/255.0,.5)
		var line:=_css_label(lines[i],Rect2(14,12+i*19.2,600,19.2),12,color,"font",400,1.8,self);line.vertical_alignment=VERTICAL_ALIGNMENT_CENTER;line.name="VersionOverlay%d" % i

static func _release_version_text() -> String:
	# release-version.json is the single version source (index1266–1267); fallback is the source's own literal.
	for path in [ProjectSettings.globalize_path("res://").path_join("../release-version.json").simplify_path(),"res://data/release_version.json"]:
		if FileAccess.file_exists(path):
			var data: Variant=JSON.parse_string(FileAccess.get_file_as_string(path))
			if data is Dictionary and str(data.get("version","")) != "":
				return "v"+str(data.version)+" · "+str(data.get("date","")).replace("-","")
	return "v0.6.0 · 20260521"

func _css_label(value: String,rect: Rect2,px: float,color: Color,stack: String,weight: int,spacing: float,parent: Node) -> Label:
	var l:=Label.new();l.text=value;l.position=rect.position;l.size=rect.size;l.mouse_filter=Control.MOUSE_FILTER_IGNORE
	var font: FontVariation=Fonts.stack(stack,weight).duplicate()
	if spacing!=0.0:font.spacing_glyph=roundi(spacing)
	l.set_meta("css_spacing",float(roundi(spacing)))
	l.add_theme_font_override("font",font);l.add_theme_font_size_override("font_size",roundi(px));l.add_theme_color_override("font_color",color)
	l.clip_text=false;parent.add_child(l);return l

func _card_slot(card: int) -> int: return _card_order[card] if card<_card_order.size() else -1
func _choose_card(card: int) -> void:
	var slot:=_card_slot(card)
	if slot>=0:_choose(slot)
func _sync_delete_visibility() -> void:
	# index286/ui-refinement1014: delete control appears on hover or focus-within only.
	var focus: Control=get_viewport().gui_get_focus_owner() if is_inside_tree() else null
	for card in cards:
		var c: SlotCard=card
		if c.delete_button!=null:c.delete_button.modulate.a=1.0 if (c.hovered_card or focus==c or focus==c.delete_button) and c.kind in ["saved","new","corrupt"] else 0.0

class SlotCard extends Button:
	var kind:="empty"
	var selected:=false
	var is_new:=false
	var hovered_card:=false
	var thumb_dash: Label
	var badge: Panel
	var badge_text: Label
	var delete_button: Button
	var _bg: TextureRect
	func _ready() -> void:
		clip_contents=false
		_bg=preload("res://scripts/native_parity_ui_surface.gd").art(self,"img/ui/hell_gothic/iron.png",Rect2(Vector2.ZERO,size))
		_bg.texture_repeat=CanvasItem.TEXTURE_REPEAT_ENABLED;_bg.show_behind_parent=true;move_child(_bg,0)
		var sh:=Shader.new();sh.code="shader_type canvas_item;varying vec4 vmod;uniform vec2 extent;uniform vec4 a:source_color;uniform vec4 b:source_color;uniform float horizontal=0.0;void vertex(){vmod=COLOR;}void fragment(){vec2 p=UV*extent;vec4 c=texture(TEXTURE,(p-extent*.5)/320.0+vec2(.5));vec4 g=mix(a,b,mix(UV.y,UV.x,horizontal));COLOR=vec4(mix(c.rgb,g.rgb,g.a),1.0)*vmod;}"
		var mat:=ShaderMaterial.new();mat.shader=sh;_bg.material=mat
		resized.connect(func():_bg.size=size;mat.set_shader_parameter("extent",size))
		mat.set_shader_parameter("extent",size)
		queue_redraw()
	func _draw() -> void:
		if _bg!=null:
			var mat: ShaderMaterial=_bg.material
			if selected:
				mat.set_shader_parameter("a",Color("4b251cdd"));mat.set_shader_parameter("b",Color("171215eb"));mat.set_shader_parameter("horizontal",1.0)
			else:
				mat.set_shader_parameter("a",Color("211c1cdc"));mat.set_shader_parameter("b",Color("101013ef"));mat.set_shader_parameter("horizontal",0.0)
		var r:=Rect2(Vector2(.5,.5),size-Vector2.ONE)
		if is_new:
			_dashed(r,Color(150/255.0,113/255.0,78/255.0))
			return
		if kind=="empty":_dashed(r,Color(81/255.0,74/255.0,61/255.0))
		elif selected:draw_rect(r,Color(172/255.0,121/255.0,83/255.0),false,1.0)
		else:draw_rect(r,Color(81/255.0,74/255.0,61/255.0),false,1.0)
		if selected:draw_rect(Rect2(1,1,3,size.y-2),Color(172/255.0,121/255.0,83/255.0))
		# index249/253 .char-item::before bar (left:0 inside border).
		if selected:
			var h:=size.y*.9;var top:=1.0+(size.y-2)*.05
			for k in 3:draw_rect(Rect2(1,top-2+k,4+2*(2-k),h+4-2*k),Color(196/255.0,68/255.0,68/255.0,.08))
			_bar(Rect2(1,top,4,h),Color(196/255.0,68/255.0,68/255.0,.2),Color(1,100/255.0,80/255.0,.95),1.0)
		else:
			_bar(Rect2(1,1.0+(size.y-2)*.2,3,(size.y-2)*.6),Color(196/255.0,68/255.0,68/255.0,0),Color(196/255.0,68/255.0,68/255.0,.4),.6)
	func _bar(rect: Rect2,edge: Color,mid: Color,alpha: float) -> void:
		var pts:=PackedVector2Array([rect.position,Vector2(rect.end.x,rect.position.y),Vector2(rect.end.x,rect.get_center().y),rect.position+Vector2(0,rect.size.y*.5)])
		var e:=Color(edge,edge.a*alpha);var m:=Color(mid,mid.a*alpha)
		draw_polygon(pts,PackedColorArray([e,e,m,m]))
		var pts2:=PackedVector2Array([rect.position+Vector2(0,rect.size.y*.5),Vector2(rect.end.x,rect.get_center().y),rect.end,Vector2(rect.position.x,rect.end.y)])
		draw_polygon(pts2,PackedColorArray([m,m,e,e]))
	func _dashed(r: Rect2,color: Color) -> void:
		for edge in [[r.position,Vector2(r.end.x,r.position.y)],[Vector2(r.position.x,r.end.y),r.end],[r.position,Vector2(r.position.x,r.end.y)],[Vector2(r.end.x,r.position.y),r.end]]:
			var a: Vector2=edge[0];var b: Vector2=edge[1];var length:=a.distance_to(b);var dir:=(b-a)/maxf(length,.001);var t:=0.0
			while t<length:
				draw_line(a+dir*t,a+dir*minf(t+3.0,length),color,1.0);t+=6.0

class QuitButton extends Button:
	# index837 #lobbyQuitBtn SVG M12 3v9 M6.3 5.7 a8 8 0 1 0 11.4 0, 20px, stroke 1.8; ring 36px.
	func _ready() -> void:
		mouse_entered.connect(queue_redraw);mouse_exited.connect(queue_redraw);focus_entered.connect(queue_redraw);focus_exited.connect(queue_redraw)
	func _draw() -> void:
		var hot:=is_hovered() or has_focus()
		var c:=size*.5
		draw_circle(c,17.5,Color("52261f66") if hot else Color(16/255.0,13/255.0,14/255.0,.5))
		draw_arc(c,17.5,0,TAU,64,Color("bd795b") if hot else Color(119/255.0,96/255.0,71/255.0,.4),1.0,true)
		var ink:=Color("f1b6a2") if hot else Color("b8a386")
		var k:=20.0/24.0;var o:=Vector2(8,8)
		draw_line(o+Vector2(12,3)*k,o+Vector2(12,12)*k,ink,1.8*k,true)
		draw_arc(o+Vector2(12,11.313)*k,8*k,deg_to_rad(224.6),deg_to_rad(-44.6),48,ink,1.8*k,true)
		for p in [Vector2(12,3),Vector2(12,12),Vector2(6.3,5.7),Vector2(17.7,5.7)]:draw_circle(o+p*k,.9*k,ink)

class GradientLine extends Control:
	var mirror:=false
	func _draw() -> void:
		var clear:=Color(164/255.0,147/255.0,115/255.0,0);var gold:=Color(164/255.0,147/255.0,115/255.0,.54)
		var l:=gold if mirror else clear;var r:=clear if mirror else gold
		draw_polygon(PackedVector2Array([Vector2.ZERO,Vector2(size.x,0),Vector2(size.x,1),Vector2(0,1)]),PackedColorArray([l,r,r,l]))

func _show_modal() -> void:
	_form.hide()
	_modal_quit=false
	var row:Dictionary=menu.rows[menu.pending_delete.slot]
	modal_title.text=str(row.data.get("name",row.summary.get("name","")))+UI.text(" 캐릭터를 정말 삭제하시겠습니까?")
	_previous_focus=get_viewport().gui_get_focus_owner(); modal.show(); _render(); cancel.grab_focus()
func _close_modal() -> void:
	menu.cancel_delete(); modal.hide(); _render()
	if is_instance_valid(_previous_focus): _previous_focus.grab_focus()
func get_snapshot() -> Dictionary:
	return {"menu":menu.get_snapshot(),"modal_visible":modal.visible,"form_visible":_form.visible,
		"language":bridge.language,"device":bridge.device,"restore_implemented":false}

# Source template literals show integral JSON numbers without Godot's .0 suffix.
func _number_label(value: Variant) -> String:
	if (value is int or value is float) and is_finite(float(value)) and float(value)==floor(float(value)):
		return "%.0f" % float(value)
	return str(value)

func _notification(what: int) -> void:
	if what==NOTIFICATION_TRANSLATION_CHANGED and is_instance_valid(status):
		bridge.configure(TranslationServer.get_locale());call_deferred("_render")

func _play_cinematic() -> void:
	if _launching:return
	_begin_movie("lobby")

func _begin_movie(kind: String) -> CanvasLayer:
	# index.finishCin / character-story finish remove the old overlay before handoff.
	if is_instance_valid(_movie):_movie.finish()
	_movie=preload("res://scripts/parity_video_intro.gd").new()
	add_child(_movie);_movie.begin(kind,bridge.language)
	return _movie

func _open_name() -> void:
	creation_error.text="";_layout_name_error();_name_form.show();name_input.grab_focus()
func _portrait_circle() -> ShaderMaterial:
	var shader:=Shader.new();shader.code="shader_type canvas_item;void fragment(){vec4 c=texture(TEXTURE,UV);COLOR=vec4(c.rgb,c.a*step(length(UV-vec2(.5)),.5))*COLOR;}"
	var material:=ShaderMaterial.new();material.shader=shader;return material

func _layout_name_error() -> void:
	var extra:=46.0 if not creation_error.text.is_empty() else 0.0 # index #status 8px pad ×18px + margins
	creation_error.visible=extra>0
	_name_box.position.y=372.5-extra*.5;_name_box.size.y=335+extra
	for child in _name_box.get_children():
		if child is Panel:child.size.y=335+extra-child.position.y*2
		elif child is TextureRect:child.size.y=335+extra
	for id in ["NameCancel","NameCreate"]:_name_box.get_node(id).position.y=239+extra

func _select_language(index:int) -> void:
	var code:String=["ko","en"][index]
	var old:Dictionary=menu.storage.get_item("hellLang")
	if not old.get("ready",false):return
	if not menu._write("hellLang",code,false,old.get("raw")):return
	TranslationServer.set_locale(code)
	bridge.configure(code)
	_render()
func _show_quit() -> void:
	_modal_quit=true;modal_title.text=UI.text("게임을 종료하시겠습니까?")
	_previous_focus=get_viewport().gui_get_focus_owner();modal.show();cancel.grab_focus()
