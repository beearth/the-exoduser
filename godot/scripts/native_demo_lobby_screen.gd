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
		_request_main_preload() # PC-INPUT-PARITY: 로비 동안 Main 리소스를 백그라운드로 읽어 진입 정지를 줄인다
	menu.open()
	var first_empty := 0
	for i in menu.rows.size():
		if menu.rows[i].kind=="empty":
			first_empty=i
			break
	cards[first_empty].grab_focus()
	if _entry_enabled and not get_tree().has_meta("parity_lobby_cinematic_seen"):
		get_tree().set_meta("parity_lobby_cinematic_seen",true)
		call_deferred("_play_cinematic")

func tr_text(ko: String, en: String) -> String: return UI.text(ko)
func _input(event: InputEvent) -> void:
	bridge.observe(event)
	# Let the native LineEdit own IME composition/cancel keys.
	if _form.visible and name_input.has_focus(): return
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_ESCAPE:
		if modal.visible: _close_modal()
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
	_image("res://assets/ui/parity_ui_04/ancestor.png",Rect2(381.8,76.8,531.7,864))
	_label("선대 소환체",Vector2(540,932),250,13).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	var ancestor_name:=_label("묘왕 바르칸",Vector2(380,963),520,45,self,true);ancestor_name.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;ancestor_name.add_theme_color_override("font_color",Color("b85c43"))
	_label("플레이어가 소환하는 선대의 영체",Vector2(410,1030),460,12).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	_box(Rect2(1360,0,560,1080),Color("09090a"),Color("3a1a55"))
	var sigil:=_image("res://assets/ui/parity_ui_03/sigil.png",Rect2(1330,-68,620,620));sigil.modulate.a=.14
	var rail:=preload("res://scripts/native_parity_ui_surface.gd").Rail.new();rail.image=load("res://assets/ui/parity_ui_04/lobby_frame.png");rail.slice=.22;rail.width=48;rail.position=Vector2(1360,0);rail.size=Vector2(560,1080);rail.mouse_filter=Control.MOUSE_FILTER_IGNORE;add_child(rail)
	_image("res://assets/ui/parity_ui_04/logo.png",Rect2(1388,195,498,104)).stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_label("한국어",Vector2(1388,147),160,12)
	var records:=ScrollContainer.new();records.position=Vector2(1392,315);records.size=Vector2(490,178);records.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;add_child(records)
	var rows:=VBoxContainer.new();rows.add_theme_constant_override("separation",10);rows.size_flags_horizontal=Control.SIZE_EXPAND_FILL;records.add_child(rows)
	for i in 5:
		var b:=_button("",Rect2(0,0,480,84),_choose.bind(i),rows)
		b.custom_minimum_size=Vector2(480,84);b.alignment=HORIZONTAL_ALIGNMENT_LEFT;b.add_theme_font_size_override("font_size",16);cards.append(b)
		card_thumbs.append(_image("res://assets/ui/demo_lobby/charselect/portrait_warrior.png",Rect2(24,14,56,56),b))
		var name_label:=_label("",Vector2(94,12),350,16,b);name_label.size.y=26;name_label.add_theme_font_override("font",Fonts.stack("font",700));card_names.append(name_label)
		var info_label:=_label("",Vector2(94,45),350,12,b);info_label.size.y=22;info_label.add_theme_font_override("font",Fonts.stack("font",400));card_infos.append(info_label)
	_button("+  "+tr_text("새 캐릭터","New Character"),Rect2(1392,503,490,64),func():
		for i in menu.rows.size():
			if menu.rows[i].kind=="empty":_choose(i);return)
	var wishlist_caption:=_label("여러분의 Steam 찜 하나가\nEXODUSER: HELL LORD의\n다음 여정을 만듭니다",Vector2(1392,591),490,14);wishlist_caption.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;wishlist_caption.add_theme_font_override("font",Fonts.stack("font",700));wishlist_caption.add_theme_constant_override("line_spacing",-3)
	var wishlist_sub:=_label("공식 출시 소식을 가장 먼저 받아보세요",Vector2(1392,652),490,11);wishlist_sub.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	_image("res://assets/ui/parity_ui_04/wishlist.png",Rect2(1537,674,200,44)).stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	start=_button("",Rect2(1388,751,504,132),func():menu.request_continue())
	_image("res://assets/ui/parity_ui_04/enter.png",Rect2(0,0,504,132),start).stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	erase=_button("삭제",Rect2(1820,560,64,30),func():
		if menu.ask_delete(menu.selected):_show_modal());erase.hide()
	status=_label("",Vector2(1388,876),504,12);status.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	_button("▶ 시네마틱",Rect2(1388,897,130,30),_play_cinematic)
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
	_name_form=_box(Rect2(0,0,1920,1080),Color(0,0,0,.85),Color.TRANSPARENT,_form);_name_form.hide()
	_box(Rect2(680,390,560,300),Color("100d10"),GOLD,_name_form)
	var name_title:=_label(tr_text("새 전사의 이름","New warrior name"),Vector2(710,430),500,28,_name_form,true);name_title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	name_input=LineEdit.new(); name_input.max_length=8; name_input.position=Vector2(745,516); name_input.size=Vector2(430,54)
	var input_box:=StyleBoxFlat.new();input_box.bg_color=Color("0b090b");input_box.border_color=GOLD;input_box.set_border_width_all(1);input_box.content_margin_left=16
	name_input.add_theme_stylebox_override("normal",input_box)
	var focused: StyleBoxFlat=input_box.duplicate();focused.border_color=Color("c59c65");focused.set_border_width_all(2);name_input.add_theme_stylebox_override("focus",focused)
	name_input.add_theme_color_override("font_color",BONE)
	name_input.add_theme_color_override("selection_color",Color("602820"))
	name_input.add_theme_color_override("caret_color",Color("c59c65"))
	name_input.add_theme_font_override("font",Fonts.stack("hell",400)); name_input.add_theme_font_size_override("font_size",26); _name_form.add_child(name_input)
	name_input.text_submitted.connect(func(_value: String): _create())
	creation_error=_label("",Vector2(745,580),430,16,_name_form)
	creation_error.add_theme_color_override("font_color",Color("ce8972"))
	_button(tr_text("생성","Create"),Rect2(1000,622,176,44),_create,_name_form,true)
	_button(tr_text("취소","Cancel"),Rect2(745,622,176,44),func():_name_form.hide(),_name_form)
	modal=Control.new(); modal.size=Vector2(1920,1080); add_child(modal)
	var veil := ColorRect.new(); veil.color=Color(0,0,0,0.85); veil.size=modal.size; modal.add_child(veil)
	var dialog := _box(Rect2(540,330,840,410),Color("100d10"),GOLD,modal)
	modal_title=_label(tr_text("기록을 삭제하시겠습니까?","Delete this record?"),Vector2(44,32),750,36,dialog,true)
	modal_slot_number=_label("",Vector2(44,94),40,25,dialog)
	modal_slot_number.add_theme_font_override("font",Fonts.stack("hell",700))
	modal_record=_label("",Vector2(84,94),710,25,dialog,true)
	_label(tr_text("선택한 슬롯의 로컬 기록이 삭제됩니다.","The selected local slot record will be deleted."),Vector2(44,146),750,22,dialog)
	_label(tr_text("삭제한 기록은 되돌릴 수 없습니다.","This cannot be undone."),Vector2(44,192),750,21,dialog)
	modal_error=_label("",Vector2(44,230),750,16,dialog)
	cancel=_button(tr_text("취소","Cancel"),Rect2(44,280,350,66),_close_modal,dialog)
	confirm=_button(tr_text("기록 삭제","Delete record"),Rect2(440,280,350,66),func():
		if menu.confirm_delete(): _close_modal(),dialog,true)
	cancel.focus_neighbor_left=cancel.get_path_to(confirm); cancel.focus_neighbor_right=cancel.get_path_to(confirm)
	confirm.focus_neighbor_left=confirm.get_path_to(cancel); confirm.focus_neighbor_right=confirm.get_path_to(cancel)
	cancel.focus_previous=cancel.get_path_to(confirm); cancel.focus_next=cancel.get_path_to(confirm)
	confirm.focus_previous=confirm.get_path_to(cancel); confirm.focus_next=confirm.get_path_to(cancel)
	modal.hide()

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
	cards[maxi(0,_form_slot)].grab_focus()

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
		creation_error.text=_entry_error(admission.reason)
		return
	if menu.request_new(_form_slot,admission.name):
		_form.hide()
	else:
		creation_error.text=_entry_error(menu.last_error)
		status.text=creation_error.text
func _entry_error(reason: String) -> String:
	match reason:
		"name_length":return tr_text("이름은 2~8자여야 합니다.","Name must be 2–8 characters.")
		"name_special":return tr_text("특수문자는 사용할 수 없습니다.","Special characters are not allowed.")
		"character_locked":return tr_text("출시 준비 중","Coming soon")
		"duplicate_name":return tr_text("이미 같은 이름의 캐릭터가 있습니다.","A warrior with this name already exists.")
		"active_save_sync_required":return tr_text("이전 전사의 저장 동기화가 필요합니다.","The previous warrior's save must be synchronized.")
		"saved_player_restore_required":return tr_text("입장하지 못했습니다. 기록은 보존됩니다.","Unable to enter. Your record is preserved.")
		_:return tr_text("입장하지 못했습니다. 기록은 보존됩니다.","Unable to enter. Your record is preserved.")
func _queue_entry(slot: int,_data: Dictionary) -> void:
	call_deferred("_launch_entry",slot)
func _launch_entry(slot: int) -> void:
	if not is_inside_tree() or is_queued_for_deletion():return
	if _launching:return
	_launching=true
	var movie: CanvasLayer=_begin_movie("warrior")
	await movie.finished
	# PC-INPUT-PARITY: 진입(Main 로드·_ready·첫 프레임)을 입력 콜백 안에서 한 프레임에 몰아 하면
	# 20초 정지 동안 쌓인 OS 키 메시지가 Godot Windows 키 버퍼(512)를 넘어 뒤쪽(뗌 포함)이 버려진다.
	# 웹 index→game.html 이동처럼 검은 화면에서 로드를 기다리되, 프레임마다 이벤트 펌프가 돌게 나눈다.
	_show_entry_black()
	await _await_main_preload()
	if not is_inside_tree() or is_queued_for_deletion():return
	# 검은 프레임을 그린 직후(frame_post_draw) 진입한다. Main의 첫 _process와 첫 그리기(셰이더 컴파일 등)는
	# 다음 프레임(이벤트 펌프 뒤)으로 넘어가 한 프레임 정지가 둘로 나뉜다. 타이머·call_deferred는 같은 프레임
	# 그리기 앞에 실행돼 나뉘지 않았다(측정: 80/62회 넘침). 그리기를 건너뛰는 헤드리스·최소화 창은 기다리지 않는다.
	if DisplayServer.get_name()!="headless" and get_window().mode!=Window.MODE_MINIMIZED:
		await RenderingServer.frame_post_draw
	if not is_inside_tree() or is_queued_for_deletion():return
	_launch_entry_now(slot)
func _launch_entry_now(slot: int) -> void:
	if not is_inside_tree() or is_queued_for_deletion():return
	var result: Dictionary=entry.launch(self,slot)
	if not result.ready:
		_launching=false
		if is_instance_valid(_entry_black):_entry_black.queue_free()
		status.text=_entry_error(result.reason)
const MAIN_SCENE_PATH:="res://scenes/main.tscn"
var _main_preload_requested:=false
var _main_preload_ref: Resource
var _entry_black: CanvasLayer
func _request_main_preload() -> void:
	# 같은 리소스를 백그라운드 스레드로 미리 읽는다(entry.launch의 load()는 캐시를 받음). 진입 계약·순서 불변.
	if _main_preload_requested:return
	_main_preload_requested=true
	if ResourceLoader.has_cached(MAIN_SCENE_PATH):return
	if ResourceLoader.load_threaded_request(MAIN_SCENE_PATH)!=OK:_main_preload_requested=false
func _await_main_preload() -> void:
	_request_main_preload()
	if ResourceLoader.has_cached(MAIN_SCENE_PATH) and _main_preload_ref!=null:return
	while ResourceLoader.load_threaded_get_status(MAIN_SCENE_PATH)==ResourceLoader.THREAD_LOAD_IN_PROGRESS:
		await get_tree().process_frame
	if ResourceLoader.load_threaded_get_status(MAIN_SCENE_PATH)==ResourceLoader.THREAD_LOAD_LOADED:
		_main_preload_ref=ResourceLoader.load_threaded_get(MAIN_SCENE_PATH)
	await get_tree().process_frame # 입력 콜백(영상 건너뛰기) 밖으로 나온다
func _show_entry_black() -> void:
	# 영상 패널과 같은 검은 바탕(parity_video_intro layer 100)을 진입까지 유지 — 로비가 한 프레임도 비치지 않게.
	if is_instance_valid(_entry_black):return
	_entry_black=CanvasLayer.new();_entry_black.layer=100;_entry_black.process_mode=Node.PROCESS_MODE_ALWAYS
	var black:=ColorRect.new();black.color=Color.BLACK;black.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);black.mouse_filter=Control.MOUSE_FILTER_STOP
	_entry_black.add_child(black);add_child(_entry_black)
func _render() -> void:
	for i in cards.size():
		var row: Dictionary = menu.rows[i] if menu.rows.size()==5 else {"kind":"unavailable"}
		var text := tr_text("빈 슬롯 — 새로하기","Empty slot — New game")
		if row.kind in ["saved","new"]:
			text = str(row.summary.get("name",""))+"  ·  "+tr_text("엑소듀서 전사","WARRIOR")+"\nLv."+_number_label(row.summary.get("lv",1))+" · "+tr_text("1장 썩은 숲 1층","Chapter 1 · Rotten Forest 1F")
		elif row.kind=="corrupt": text=tr_text("읽을 수 없는 기록 — 삭제 후 다시 생성","Unreadable record — delete to create again")
		elif row.kind=="unavailable": text=tr_text("저장소를 열 수 없습니다.","Cannot open the save store.")
		cards[i].text = ""
		card_names[i].text=str(row.summary.get("name","")) if row.kind in ["saved","new"] else "—"
		card_infos[i].text="Lv."+_number_label(row.summary.get("lv",1))+" · "+tr_text("1장 썩은 숲 1층","Chapter 1 · Rotten Forest 1F") if row.kind in ["saved","new"] else ""
		card_thumbs[i].visible=row.kind in ["saved","new"]
		cards[i].visible=row.kind!="empty" or i<2
		if row.kind=="empty":cards[i].modulate.a=.18
		cards[i].add_theme_font_size_override("font_size",16)
		cards[i].disabled=not menu.ready or row.kind=="empty"
		cards[i].modulate=Color("ffdfaa") if menu.selected==i else Color(1,1,1,.18 if row.kind=="empty" else 1)
	start.disabled=menu.selected<0 or not menu.ready or menu.rows[menu.selected].kind not in ["saved","new"]
	start.text=""
	erase.disabled=menu.selected<0 or not menu.ready or menu.rows[menu.selected].kind=="empty"
	status.text="" if menu.last_error.is_empty() else _entry_error(menu.last_error)
	modal_error.text=tr_text("요청 실패 · ","Request failed · ")+menu.last_error if not menu.last_error.is_empty() else ""
	for b in cards: b.focus_mode=Control.FOCUS_NONE if modal.visible or _form.visible else Control.FOCUS_ALL
	start.focus_mode=Control.FOCUS_NONE if modal.visible or _form.visible else Control.FOCUS_ALL
	erase.focus_mode=Control.FOCUS_NONE if modal.visible or _form.visible else Control.FOCUS_ALL
func _show_modal() -> void:
	_form.hide()
	var row: Dictionary=menu.rows[menu.pending_delete.slot]
	modal_slot_number.text="%02d" % [int(row.slot)+1]
	modal_record.text="/  %s" % [str(row.data.get("name",row.summary.get("name","")))]
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
	_name_form.show();name_input.grab_focus()
func _portrait_circle() -> ShaderMaterial:
	var shader:=Shader.new();shader.code="shader_type canvas_item;void fragment(){vec4 c=texture(TEXTURE,UV);COLOR=vec4(c.rgb,c.a*step(length(UV-vec2(.5)),.5))*COLOR;}"
	var material:=ShaderMaterial.new();material.shader=shader;return material
