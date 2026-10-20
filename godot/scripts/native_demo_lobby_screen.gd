extends Control
## Standalone request screen: res://scenes/demo_lobby.tscn. No combat/Main boot.
signal new_game_requested(slot: int, data: Dictionary)
signal continue_requested(slot: int, data: Dictionary)
const Entry = preload("res://scripts/native_demo_lobby_entry.gd")
var entry = Entry.new()
var character_index := 0
var character_buttons: Array[Button] = []
var creation_error: Label
var _entry_enabled := false
const Menu = preload("res://scripts/native_save_slot_menu.gd")
const Bridge = preload("res://scripts/native_settings_lobby_bridge.gd")
const Fonts = preload("res://scripts/native_ui_fonts.gd")
@export var language := "ko"
var menu = Menu.new()
var bridge = Bridge.new()
var cards: Array[Button] = []
var status: Label
var start: Button
var erase: Button
var name_input: LineEdit
var modal: Control
var modal_title: Label
var modal_error: Label
var modal_record: Label
var cancel: Button
var confirm: Button
var _previous_focus: Control
var _form_slot := -1
var _form: Control
const BONE = Color("dfd6c2")
const GOLD = Color("96714e")

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bridge.configure(language)
	_build()
	menu.changed.connect(_render)
	menu.new_game_requested.connect(func(slot: int, data: Dictionary):
		status.text = tr_text("새 전사 기록을 만들었습니다.","New warrior record created.")
		new_game_requested.emit(slot,data))
	menu.continue_requested.connect(func(slot: int, data: Dictionary):
		status.text = tr_text("선택한 기록을 확인했습니다. 이어하기는 준비 중입니다.","Selected record checked. Continue is not available yet.")
		continue_requested.emit(slot,data))
	_entry_enabled=bool(get_meta("native_lobby_entry_enabled",get_tree().get_script()==null))
	if _entry_enabled:new_game_requested.connect(_queue_entry)
	menu.open()
	cards[0].grab_focus()

func tr_text(ko: String, en: String) -> String: return bridge.text(ko,en)
func _input(event: InputEvent) -> void:
	bridge.observe(event)
	# Let the native LineEdit own IME composition/cancel keys.
	if _form.visible and name_input.has_focus(): return
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_ESCAPE:
		if modal.visible: _close_modal()
		elif _form.visible: _form.hide(); cards[maxi(0,_form_slot)].grab_focus()
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
	l.text=text; l.position=at; l.size=Vector2(width,60)
	l.add_theme_font_override("font",Fonts.stack("hell_title" if title else "hell",700 if title else 400))
	l.add_theme_font_size_override("font_size",px); l.add_theme_color_override("font_color",BONE)
	l.mouse_filter=Control.MOUSE_FILTER_IGNORE
	parent.add_child(l)
	return l
func _button(text: String, rect: Rect2, callback: Callable, parent: Node = self, danger := false) -> Button:
	var b := Button.new()
	b.text=text; b.clip_text=true; b.position=rect.position; b.size=rect.size
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
	t.texture=load(path); t.position=rect.position; t.size=rect.size
	t.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_COVERED
	t.mouse_filter=Control.MOUSE_FILTER_IGNORE; parent.add_child(t)
	return t
func _build() -> void:
	_image("res://assets/ui/demo_lobby/abyss.png",Rect2(0,0,1920,1080))
	var shade := ColorRect.new(); shade.color=Color(0.02,0.015,0.025,0.64); shade.size=Vector2(1920,1080); shade.mouse_filter=Control.MOUSE_FILTER_IGNORE; add_child(shade)
	_image("res://assets/ui/demo_lobby/ancestor.webp",Rect2(175,290,600,560))
	_image("res://assets/ui/demo_lobby/crest.png",Rect2(285,28,360,120)).stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_label("EXODUSER",Vector2(230,132),600,66,self,true)
	_label(tr_text("지옥의 길","THE ROAD THROUGH HELL"),Vector2(350,215),520,28,self,true)
	_box(Rect2(170,856,620,1),GOLD,GOLD)
	_label(tr_text("선대의 기억","MEMORY OF THE ANCESTOR"),Vector2(185,878),600,32,self,true)
	_label(tr_text("끝나지 않은 여정은 이곳에 남는다.","An unfinished journey waits here."),Vector2(185,936),650,22)
	_box(Rect2(968,76,842,906),Color(0.035,0.027,0.033,0.95),GOLD)
	_label(tr_text("전사의 기록","WARRIOR RECORDS"),Vector2(1010,105),720,40,self,true)
	_label(tr_text("로컬 데모  /  다섯 개의 저장 슬롯","LOCAL DEMO  /  FIVE SAVE SLOTS"),Vector2(1010,168),700,18)
	for i in 5:
		var b := _button("",Rect2(1010,235+i*108,758,94),_choose.bind(i))
		b.alignment=HORIZONTAL_ALIGNMENT_LEFT
		b.add_theme_constant_override("outline_size",0)
		cards.append(b)
	start=_button(tr_text("이어하기","Continue"),Rect2(1010,810,508,62),func(): menu.request_continue(),self,true)
	erase=_button(tr_text("삭제","Delete"),Rect2(1540,810,228,62),func():
		if menu.ask_delete(menu.selected): _show_modal())
	status=_label("",Vector2(1010,888),755,17)
	status.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	status.size.y=75
	_label(tr_text("로컬 기록은 이 기기에 보관됩니다.","Local records are stored on this device."),Vector2(1010,998),800,17)
	_form=_box(Rect2(1000,440,780,440),Color("131014"),GOLD)
	_form.hide()
	_label(tr_text("새 전사의 이름","New warrior name"),Vector2(22,10),650,25,_form,true)
	_label(tr_text("엑소듀서 전사 · 흑철의 전사","WARRIOR · BLACK IRON"),Vector2(24,59),700,21,_form)
	var english=["WARRIOR","BLADE DANCER","HELLGUNNER","TRANSMUTER","SPEARMAGE"]
	for index in 5:
		var b:=_button(tr_text(Entry.CHARACTERS[index],english[index]),Rect2(24+index*146,112,138,60),_select_character.bind(index),_form)
		b.add_theme_font_size_override("font_size",16)
		b.disabled=index!=0
		b.tooltip_text=tr_text("출시 준비 중","Coming soon") if index!=0 else tr_text("생성 가능한 전사","Available warrior")
		character_buttons.append(b)
	_label(tr_text("다른 전사들은 출시 준비 중입니다.","Other warriors are coming soon."),Vector2(24,180),710,18,_form)
	creation_error=_label("",Vector2(24,360),710,18,_form)
	creation_error.add_theme_color_override("font_color",Color("ce8972"))
	name_input=LineEdit.new(); name_input.max_length=8; name_input.position=Vector2(24,246); name_input.size=Vector2(470,56)
	var input_box:=StyleBoxFlat.new();input_box.bg_color=Color("0b090b");input_box.border_color=GOLD;input_box.set_border_width_all(1);input_box.content_margin_left=16
	name_input.add_theme_stylebox_override("normal",input_box)
	var focused: StyleBoxFlat=input_box.duplicate();focused.border_color=Color("c59c65");focused.set_border_width_all(2);name_input.add_theme_stylebox_override("focus",focused)
	name_input.add_theme_color_override("font_color",BONE)
	name_input.add_theme_color_override("selection_color",Color("602820"))
	name_input.add_theme_color_override("caret_color",Color("c59c65"))
	name_input.add_theme_font_override("font",Fonts.stack("hell",400)); name_input.add_theme_font_size_override("font_size",22); _form.add_child(name_input)
	_button(tr_text("새로하기","New game"),Rect2(516,246,236,56),_create,_form,true)
	_button(tr_text("취소","Cancel"),Rect2(516,310,236,48),func(): _form.hide(); cards[maxi(0,_form_slot)].grab_focus(),_form)
	modal=Control.new(); modal.size=Vector2(1920,1080); add_child(modal)
	var veil := ColorRect.new(); veil.color=Color(0,0,0,0.85); veil.size=modal.size; modal.add_child(veil)
	var dialog := _box(Rect2(540,330,840,410),Color("100d10"),GOLD,modal)
	modal_title=_label(tr_text("기록을 삭제하시겠습니까?","Delete this record?"),Vector2(44,32),750,36,dialog,true)
	modal_record=_label("",Vector2(44,94),750,25,dialog,true)
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

func _choose(slot: int) -> void:
	if not menu.select_slot(slot): return
	if menu.rows[slot].kind=="empty":
		_form_slot=slot; character_index=0; creation_error.text=""; _form.show(); name_input.clear(); name_input.grab_focus()
	else: _form.hide()
func _select_character(index: int) -> void:
	if index!=0:
		creation_error.text=tr_text("출시 준비 중","Coming soon")
		return
	character_index=0
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
		"saved_player_restore_required":return tr_text("이어하기 복원 연결이 필요합니다.","Continue requires the save restore connection.")
		_:return tr_text("입장하지 못했습니다. 기록은 보존됩니다.","Unable to enter. Your record is preserved.")
func _queue_entry(slot: int,_data: Dictionary) -> void:
	call_deferred("_launch_entry",slot)
func _launch_entry(slot: int) -> void:
	if not is_inside_tree() or is_queued_for_deletion():return
	var result: Dictionary=entry.launch(self,slot)
	if not result.ready:status.text=_entry_error(result.reason)
func _render() -> void:
	for i in cards.size():
		var row: Dictionary = menu.rows[i] if menu.rows.size()==5 else {"kind":"unavailable"}
		var text := tr_text("빈 슬롯 — 새로하기","Empty slot — New game")
		if row.kind in ["saved","new"]:
			text = str(row.summary.get("name","")) + "    /    " + ("Lv. " + _number_label(row.summary.get("lv")) if row.kind=="saved" else tr_text("새 전사","New warrior"))
		elif row.kind=="corrupt": text=tr_text("읽을 수 없는 기록 — 삭제 후 다시 생성","Unreadable record — delete to create again")
		elif row.kind=="unavailable": text=tr_text("저장소를 열 수 없습니다.","Cannot open the save store.")
		cards[i].text = "   %02d     %s" % [i+1,text]
		cards[i].disabled=not menu.ready
		cards[i].modulate=Color("ffdfaa") if menu.selected==i else Color.WHITE
	start.disabled=menu.selected<0 or not menu.ready or menu.rows[menu.selected].kind not in ["saved","new"]
	start.text=tr_text("새로하기","New game") if menu.selected>=0 and menu.rows[menu.selected].kind=="new" else tr_text("이어하기","Continue")
	erase.disabled=menu.selected<0 or not menu.ready or menu.rows[menu.selected].kind=="empty"
	status.text=tr_text("로컬 기록을 선택하거나 빈 슬롯에서 새 전사를 만드세요.","Select a local record or create a warrior in an empty slot.") if menu.last_error.is_empty() else tr_text("요청 실패 · ","Request failed · ")+menu.last_error
	modal_error.text=tr_text("요청 실패 · ","Request failed · ")+menu.last_error if not menu.last_error.is_empty() else ""
	for b in cards: b.focus_mode=Control.FOCUS_NONE if modal.visible else Control.FOCUS_ALL
	start.focus_mode=Control.FOCUS_NONE if modal.visible else Control.FOCUS_ALL
	erase.focus_mode=Control.FOCUS_NONE if modal.visible else Control.FOCUS_ALL
func _show_modal() -> void:
	_form.hide()
	var row: Dictionary=menu.rows[menu.pending_delete.slot]
	modal_record.text="%02d  /  %s" % [int(row.slot)+1,str(row.data.get("name",row.summary.get("name","")))]
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
