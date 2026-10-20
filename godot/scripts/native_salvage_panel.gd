extends CanvasLayer
const TX = preload("res://scripts/native_salvage_transaction.gd")
const FONTS = preload("res://scripts/native_ui_fonts.gd")
const TEXT := {
	"title":["악의의 분해로","Salvage Furnace"], "currency":["악의","Malice"], "bag":["분해할 장비","Equipment"],
	"close":["닫기  [G / Esc]","Close  [G / Esc]"], "select":["선택","Select"],
	"all":["전체 선택","Select all"], "clear":["전체 해제","Clear"],
	"junk":["쓰레기","Junk"], "mark":["쓰레기 지정","Mark junk"],
	"junk_all":["쓰레기 선택","Select junk"], "protected":["잠금 / 장착 보호","Locked / equipped"],
	"empty":["분해할 아이템이 없습니다.","No items to salvage."],
	"selected":["선택한 장비","Selected equipment"], "gain":["획득할 악의","Malice to gain"],
	"wallet":["보유 악의","Current Malice"], "salvage":["선택 장비 분해","Salvage selected"],
	"warning":["분해한 장비는 복구할 수 없습니다.","Salvaged equipment cannot be recovered."],
	"auto":["자동 분해 규칙","Auto-salvage rules"],
	"rules":["필터 미만 장비 · 줍기 시 분해\n가방 부족 · 전설 이상 유지\n잠금 / 장착 장비 · 분해 제외","Below filter · salvage on pickup\nFull bag · retain legendary or higher\nLocked / equipped · never salvage"],
	"pending_auto":["자동 줍기 연결 대기","Automatic pickup pending"],
	"confirm":["정말 분해하시겠습니까?","Confirm salvage"],
	"confirm_body":["선택한 장비 %d개\n악의 +%s\n\n분해는 되돌릴 수 없습니다.","%d selected items\n+%s Malice\n\nSalvage cannot be undone."],
	"yes":["분해 확정","Confirm salvage"], "cancel":["취소","Cancel"],
	"done":["장비 %d개 분해 · 악의 +%s","Salvaged %d items · +%s Malice"],
	"save_wait":["저장 연동 대기 · 현재 실행에 반영","Save connection pending · applied this session"],
	"changed":["선택한 장비의 상태가 변경됐습니다.","Selected equipment has changed."],
	"unsupported":["분해 계산 대기","Salvage calculation unavailable"],
}
var _main: WeakRef
var _screen: Control
var _panel: Panel
var _rows: VBoxContainer
var _selection: Array=[]
var _pending: Array=[]
var _junk_only := false
var _pending_junk := false
var _confirm_accept: Button
var _count: Label
var _gain: Label
var _wallet: Label
var _action: Button
var _status: Label
var _confirm_shield: ColorRect
var _confirm: Panel
var _confirm_text: Label
var _was_paused := false
var _lang := 0

func configure(main: Node) -> void: _main=weakref(main)
func tr_ui(key: String) -> String: return TEXT[key][_lang]
func number(value: float) -> String: return str(int(value)) if value==floor(value) else str(value)
func _ready() -> void:
	process_mode=Node.PROCESS_MODE_ALWAYS
	layer=45
	_lang=0 if TranslationServer.get_locale().begins_with("ko") else 1
	_screen=Control.new(); _screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT); add_child(_screen)
	var theme := Theme.new(); theme.default_font=FONTS.stack("hell",700); theme.default_font_size=18; _screen.theme=theme
	for type in ["Label","Button","CheckBox"]: theme.set_color("font_color",type,Color("dfd6c2"))
	for state in ["normal","hover","pressed","focus","disabled"]: theme.set_stylebox(state,"Button",box("20251e" if state!="disabled" else "141713","79674c" if state!="focus" else "dfd6c2"))
	var veil := ColorRect.new(); veil.color=Color(0.01,0.015,0.012,0.82); veil.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT); _screen.add_child(veil)
	_panel=Panel.new(); _panel.size=Vector2(980,780); _screen.add_child(_panel)
	_panel.add_theme_stylebox_override("panel",box("101310","756957",2,18))
	var frame := TextureRect.new(); frame.texture=preload("res://assets/ui/hell_gothic/frame.png"); frame.expand_mode=TextureRect.EXPAND_IGNORE_SIZE; frame.stretch_mode=TextureRect.STRETCH_SCALE; frame.position=Vector2(-12,-12); frame.size=Vector2(1004,804); frame.modulate=Color(1,1,1,0.24); frame.mouse_filter=Control.MOUSE_FILTER_IGNORE; _panel.add_child(frame)
	var crest := TextureRect.new(); crest.texture=preload("res://assets/ui/hell_gothic/crest.png"); crest.expand_mode=TextureRect.EXPAND_IGNORE_SIZE; crest.stretch_mode=TextureRect.STRETCH_SCALE; crest.position=Vector2(418,6); crest.size=Vector2(144,48); crest.mouse_filter=Control.MOUSE_FILTER_IGNORE; _panel.add_child(crest)
	label("SALVAGE",Vector2(300,52),Vector2(380,45),30,true).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	label(tr_ui("title"),Vector2(240,98),Vector2(500,36),21).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	button(tr_ui("close"),Vector2(752,30),Vector2(196,40),close_panel)
	line(Vector2(30,143),Vector2(920,1))
	label(tr_ui("bag"),Vector2(34,163),Vector2(300,30),22)
	button(tr_ui("all"),Vector2(34,209),Vector2(150,40),func(): select_all(false))
	button(tr_ui("junk_all"),Vector2(194,209),Vector2(150,40),func(): select_all(true))
	button(tr_ui("clear"),Vector2(354,209),Vector2(150,40),func(): _selection.clear(); refresh())
	var scroll := ScrollContainer.new(); scroll.position=Vector2(34,265); scroll.size=Vector2(540,420); scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED; _panel.add_child(scroll)
	var inset := MarginContainer.new(); inset.size_flags_horizontal=Control.SIZE_EXPAND_FILL
	for side in ["margin_top","margin_bottom"]: inset.add_theme_constant_override(side,12)
	for side in ["margin_left","margin_right"]: inset.add_theme_constant_override(side,4)
	scroll.add_child(inset)
	_rows=VBoxContainer.new(); _rows.size_flags_horizontal=Control.SIZE_EXPAND_FILL; _rows.add_theme_constant_override("separation",8); inset.add_child(_rows)
	line(Vector2(596,165),Vector2(1,520))
	label(tr_ui("selected"),Vector2(626,169),Vector2(290,30),20)
	_count=label("0",Vector2(626,209),Vector2(290,52),40,true)
	label(tr_ui("gain"),Vector2(626,278),Vector2(290,30),18)
	_gain=label("0",Vector2(626,316),Vector2(290,48),34,true); _gain.add_theme_color_override("font_color",Color("dfb676"))
	label(tr_ui("wallet"),Vector2(626,389),Vector2(290,28),17)
	_wallet=label("0",Vector2(626,425),Vector2(290,40),23,true)
	line(Vector2(626,488),Vector2(290,1))
	label(tr_ui("auto"),Vector2(626,505),Vector2(290,30),19)
	label(tr_ui("rules"),Vector2(626,547),Vector2(300,94),16)
	label(tr_ui("pending_auto"),Vector2(626,651),Vector2(290,26),15).add_theme_color_override("font_color",Color("a6987c"))
	line(Vector2(30,701),Vector2(920,1))
	_status=label(tr_ui("warning"),Vector2(34,715),Vector2(560,54),16); _status.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	_action=button(tr_ui("salvage"),Vector2(626,720),Vector2(318,44),request_confirmation,true)
	_build_confirm()
	_screen.resized.connect(_layout)
	_layout(); _screen.hide()
func box(bg: String, border: String, width: int=1, shadow: int=0) -> StyleBoxFlat:
	var style := StyleBoxFlat.new(); style.bg_color=Color(bg); style.border_color=Color(border); style.set_border_width_all(width); style.shadow_color=Color(0,0,0,0.7); style.shadow_size=shadow; style.set_content_margin_all(8); return style
func label(text: String, at: Vector2, dimensions: Vector2, px: int, title: bool=false) -> Label:
	var node := Label.new(); node.text=text; node.position=at; node.size=dimensions; node.add_theme_font_size_override("font_size",px)
	if title: node.add_theme_font_override("font",FONTS.stack("cinzel_hell",700))
	_panel.add_child(node); return node
func button(text: String, at: Vector2, dimensions: Vector2, callback: Callable, danger: bool=false) -> Button:
	var b := Button.new(); b.text=text; b.position=at; b.size=dimensions; b.add_theme_stylebox_override("normal",box("30130f" if danger else "20251e","895346" if danger else "79674c")); b.add_theme_stylebox_override("hover",box("4b211c" if danger else "34382c","c5a471")); b.add_theme_stylebox_override("pressed",box("170d0b","a38a59",2)); b.add_theme_stylebox_override("focus",box("00000000","dfd6c2",2)); b.add_theme_stylebox_override("disabled",box("171b18","393b30")); b.add_theme_color_override("font_disabled_color",Color("6d7065")); b.pressed.connect(callback); _panel.add_child(b); return b
func line(at: Vector2, dimensions: Vector2) -> void:
	var r := ColorRect.new(); r.position=at; r.size=dimensions; r.color=Color("625741"); r.mouse_filter=Control.MOUSE_FILTER_IGNORE; _panel.add_child(r)
func _layout() -> void:
	if is_instance_valid(_panel): _panel.position=(_screen.size-_panel.size)*0.5
func _owner() -> Node: return _main.get_ref() if _main!=null else null
func open_panel() -> void:
	var main := _owner()
	if main==null or not is_instance_valid(main.source_state) or not main.source_state.is_native_new_run_state_ready(): return
	_was_paused=get_tree().paused; get_tree().paused=true
	_selection.clear(); _junk_only=false; _pending.clear(); _confirm.hide(); _confirm_shield.hide(); refresh(); _screen.show(); _action.grab_focus()
func close_panel() -> void:
	if not _screen.visible: return
	_screen.hide(); _confirm.hide(); _confirm_shield.hide(); _selection.clear(); _pending.clear(); get_tree().paused=_was_paused
func _exit_tree() -> void:
	if is_instance_valid(_screen) and _screen.visible: get_tree().paused=_was_paused
func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.physical_keycode==KEY_G:
			if _screen.visible: close_panel()
			else: open_panel()
			get_viewport().set_input_as_handled()
		elif _screen.visible and event.physical_keycode==KEY_ESCAPE:
			if _confirm.visible: cancel_confirmation()
			else: close_panel()
			get_viewport().set_input_as_handled()
func select_all(junk: bool) -> void:
	_junk_only=junk
	_selection.clear()
	var inv: Dictionary=_owner().source_state.read_current_inventory()
	for item in inv.bag:
		if item is Dictionary and TX.eligible(inv,item,junk): _selection.append(item)
	refresh()
func _safe_name(item: Dictionary) -> String:
	var raw: String=str(item.get("nameEn",item.get("name",""))) if _lang==1 else str(item.get("name",""))
	var out := ""
	for ch in raw:
		var n: int=ch.unicode_at(0)
		if n<0x1F000 and not (n>=0x2600 and n<=0x27BF) and n!=0xFE0F: out+=ch
	return out
func refresh() -> void:
	if not is_instance_valid(_rows): return
	var main := _owner()
	if main==null or not is_instance_valid(main.source_state): return
	var inv: Variant=main.source_state.read_current_inventory()
	if not inv is Dictionary: return
	for child in _rows.get_children(): _rows.remove_child(child); child.queue_free()
	_selection=_selection.filter(func(it): return it is Dictionary and TX.eligible(inv,it,_junk_only))
	for item in inv.bag:
		if not item is Dictionary: continue
		var row := HBoxContainer.new(); row.custom_minimum_size=Vector2(516,66); row.add_theme_constant_override("separation",10); _rows.add_child(row)
		var pick := CheckBox.new(); pick.custom_minimum_size=Vector2(32,32); pick.size_flags_vertical=Control.SIZE_SHRINK_CENTER; pick.disabled=not TX.eligible(inv,item); pick.button_pressed=TX.contains_ref(_selection,item); row.add_child(pick)
		pick.toggled.connect(func(on):
			_junk_only=false
			if on: _selection.append(item)
			else: _selection=_selection.filter(func(v):return not is_same(v,item))
			refresh())
		var column := VBoxContainer.new(); column.size_flags_horizontal=Control.SIZE_EXPAND_FILL; row.add_child(column)
		var name_label := Label.new(); name_label.text=_safe_name(item); name_label.text_overrun_behavior=TextServer.OVERRUN_TRIM_ELLIPSIS; name_label.custom_minimum_size.x=290; name_label.tooltip_text=name_label.text; column.add_child(name_label)
		var rarity: Variant=item.get("rarity")
		if (rarity is int or rarity is float) and is_finite(float(rarity)) and rarity==floor(float(rarity)) and rarity>=0 and rarity<6:
			name_label.add_theme_color_override("font_color",Color(["#aaa","#44cc44","#4488ff","#bb44ff","#ffaa00","#8e55e9"][int(rarity)])) # G14350 visual rarity, not economy clamp.
		var info := Label.new(); var price := TX.value_of(item)
		info.text=("+"+number(price.value)+"  "+tr_ui("currency")) if price.ready else tr_ui("unsupported")
		if not TX.eligible(inv,item): info.text=tr_ui("protected") if price.ready and price.value>=0 else tr_ui("unsupported")
		info.add_theme_font_size_override("font_size",15); info.add_theme_color_override("font_color",Color("a99b7b")); column.add_child(info)
		var junk := Button.new(); junk.text=tr_ui("junk") if TX.JS._truthy(item.get("junk")) else tr_ui("mark"); junk.disabled=not TX.eligible(inv,item); junk.custom_minimum_size=Vector2(112,42); junk.size_flags_vertical=Control.SIZE_SHRINK_CENTER; junk.add_theme_font_size_override("font_size",15); row.add_child(junk)
		junk.pressed.connect(func(): main.source_state.mark_native_salvage_junk(main,item,not TX.JS._truthy(item.get("junk"))); refresh())
	if inv.bag.is_empty():
		var empty := Label.new(); empty.text=tr_ui("empty"); _rows.add_child(empty)
	var plan := TX.manual(inv,_selection,_junk_only)
	_count.text=str(_selection.size()); _gain.text=number(plan.total) if plan.ready else "0"; _wallet.text=number(float(main.source_state.read_current_g().mats)); _action.disabled=not plan.ready
func _build_confirm() -> void:
	_confirm_shield=ColorRect.new(); _confirm_shield.size=Vector2(980,780); _confirm_shield.color=Color(0,0,0,0.65); _panel.add_child(_confirm_shield); _confirm_shield.hide()
	_confirm=Panel.new(); _confirm.position=Vector2(210,224); _confirm.size=Vector2(560,330); _confirm.add_theme_stylebox_override("panel",box("170e0c","a66b49",2,28)); _panel.add_child(_confirm)
	var heading := Label.new(); heading.text=tr_ui("confirm"); heading.position=Vector2(28,24); heading.add_theme_font_size_override("font_size",24); _confirm.add_child(heading)
	_confirm_text=Label.new(); _confirm_text.position=Vector2(28,80); _confirm_text.size=Vector2(510,140); _confirm_text.add_theme_font_size_override("font_size",21); _confirm.add_child(_confirm_text)
	var old_panel := _panel; _panel=_confirm
	var cancel := button(tr_ui("cancel"),Vector2(28,260),Vector2(220,44),cancel_confirmation)
	_confirm_accept=button(tr_ui("yes"),Vector2(272,260),Vector2(260,44),confirm_salvage,true)
	for key in ["focus_next","focus_previous","focus_neighbor_left","focus_neighbor_right","focus_neighbor_top","focus_neighbor_bottom"]:
		cancel.set(key,cancel.get_path_to(_confirm_accept)); _confirm_accept.set(key,_confirm_accept.get_path_to(cancel))
	_panel=old_panel; _confirm.hide()
func request_confirmation() -> void:
	var inv: Dictionary=_owner().source_state.read_current_inventory()
	var plan := TX.manual(inv,_selection,_junk_only)
	if not plan.ready: return
	_pending_junk=_junk_only
	_pending=plan.items.duplicate() # references, not indices or detached copies
	_confirm_text.text=tr_ui("confirm_body") % [plan.items.size(),number(plan.total)]
	_confirm_shield.show(); _confirm.show(); _confirm_accept.grab_focus()
func confirm_salvage() -> void:
	var result: Dictionary=_owner().request_native_salvage(_pending,_pending_junk)
	_pending.clear(); _selection.clear(); _confirm.hide(); _confirm_shield.hide(); refresh()
	if result.get("applied",false):
		_status.text=tr_ui("done") % [result.count,number(result.gain)]
		if result.persistence.get("committed")!=true: _status.text+="\n"+tr_ui("save_wait")
	else: _status.text=tr_ui("changed")

func cancel_confirmation() -> void:
	_confirm.hide(); _confirm_shield.hide(); _pending.clear()
