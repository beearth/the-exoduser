extends CanvasLayer
const UI = preload("res://scripts/native_demo_ui_i18n.gd")
## DEMO11-27. Existing Main/State actors; no private inventory/wallet, save IO, or tick polling.
const Fonts = preload("res://scripts/native_ui_fonts.gd")
const Policy = preload("res://scripts/native_meta_enhancement_policy.gd")
const Transaction = preload("res://scripts/native_meta_enhancement_transaction.gd")
const Potion = preload("res://port_modules/potion_recovery_source/producer.gd")
const SourceBinds = preload("res://scripts/native_intro_key_guide_panel.gd")
const WORDS = {
 "brand":["IRON COVENANT","IRON COVENANT"], "title":["검은 화로","The Black Forge"],
 "sub":["대장간 · 강화의 의식","Forge · Rite of Enhancement"],
 "enhance":["장비 강화","Enhance equipment"], "potion":["물약 강화","Enhance potion"], "transfer":["강화 이전","Enhancement transfer"],
 "wallet":["보유 악의  %s","Malice held  %s"], "close":["닫기  G / ESC","Close  G / ESC"],
 "equipped":["장착 중인 장비","Equipped items"], "empty":["장착된 장비가 없습니다.","No equipment is equipped."],
 "select":["강화할 장비를 선택하세요.","Select equipment to enhance."],
 "current":["현재 강화  +%s","Current enhancement  +%s"], "next":["성공 시  +%s","On success  +%s"],
 "chance":["성공 확률  %s%%","Success chance  %s%%"], "cost":["필요 악의  %s","Malice cost  %s"],
 "attempt":["강화 시도","Attempt enhancement"], "no_malice":["악의가 부족합니다.","Not enough Malice."],
 "success":["강화 성공  +%s","Enhancement succeeded  +%s"], "failure":["강화 실패 · 기존 단계 유지","Enhancement failed · Level preserved"],
 "paid":["소모 악의  %s","Malice spent  %s"], "safe":["실패해도 장비와 강화 단계는 유지됩니다.","Failure preserves the item and its enhancement level."],
 "live":["실행 시 현재 강화 단계로 비용을 다시 계산합니다.","Cost is recalculated from the current enhancement level on execution."],
 "unavailable":["지금은 거래할 수 없습니다.","The transaction is unavailable."],
 "hp":["악의 추출","Malice extraction"], "potion_level":["물약 강화  %s단","Potion enhancement  Level %s"],
 "recovery":["HP 회복량  %s → %s","HP recovery  %s → %s"], "requires":["필요 레벨  %s","Required level  %s"],
 "max":["최대 강화","Maximum enhancement"], "locked":["요구 레벨에 도달하면 강화할 수 있습니다.","Reach the required level to enhance."],
 "potion_success":["물약 강화 완료  %s단","Potion enhanced  Level %s"],
 "transfer_cost":["장비 교체 시 이전 비용  %s 악의","Transfer cost on equipment replacement  %s Malice"],
 "transfer_note":["이전은 장비 교체와 함께 이루어집니다. 새 장비에 현재 강화 단계를 옮깁니다.","Transfer accompanies equipment replacement and moves the current enhancement level to the new item."],
 "transfer_pending":["장비 교체 기능 준비 중","Equipment replacement is not yet available"],
 "transfer_zero":["이전할 강화 단계가 없습니다.","There is no enhancement level to transfer."],
 "footer":["실패는 남고, 화로는 식지 않는다.","Failure remains. The forge never cools."]}
var _main: WeakRef
var _state: WeakRef
var _selected: Dictionary = {}
var _tab = "enhance"
var _screen: Control
var _list: VBoxContainer
var _detail: VBoxContainer
var _wallet: Label
var _result: Label
var _opened = false
var _previous_pause = false
var _previous_g_pause: Variant
var _last: Dictionary = {}
var _strip = RegEx.new()

func configure(main: Node) -> void:
	_main=weakref(main)
	_state=weakref(main.source_state)
	process_mode=Node.PROCESS_MODE_ALWAYS
	layer=95

func is_bound_to(main: Node, state: Node) -> bool:
	return _main!=null and _state!=null and _main.get_ref()==main and _state.get_ref()==state \
		and is_inside_tree() and not is_queued_for_deletion() and get_parent()==main
func owns_selection(item: Dictionary) -> bool:
	return not _selected.is_empty() and is_same(_selected,item)
func owns_transfer_handoff(_old: Dictionary, _item: Dictionary) -> bool:
	# No equip replacement owner is present in main. Never expose a paid standalone transfer.
	return false
func select_slot(slot: String) -> bool:
	var state: Variant=_state.get_ref()
	if not is_instance_valid(state): return false
	var inv: Variant=state.read_current_inventory()
	if not inv is Dictionary or not inv.get("equipped") is Dictionary or not inv.equipped.get(slot) is Dictionary:return false
	_selected=inv.equipped[slot] # original callback keeps the actual selected item reference
	_tab="enhance"
	_refresh()
	return true
func get_snapshot() -> Dictionary:
	return {"opened":_opened,"tab":_tab,"last":_last.duplicate(true),"selected":_item_name(_selected),
		"transfer_equip_owner_bound":false,"save_connected":false,"source_binds_forge":SourceBinds.BINDS.forge}
func text(id: String) -> String:
	return UI.text(str(WORDS[id][0]))

func _ready() -> void:
	_strip.compile("[\\x{1F000}-\\x{1FAFF}\\x{2600}-\\x{27FF}\\x{FE0F}\\x{200D}]")
	_build()
	_screen.hide()
func _input(event: InputEvent) -> void:
	if is_instance_valid(_main.get_ref()) and is_instance_valid(_main.get_ref().get("source_workshop_panel")) and _main.get_ref().source_workshop_panel._opened:return
	if not event is InputEventKey or not event.pressed or event.echo:return
	# Main's source-default BINDS authority; no saved remapping owner is claimed.
	var forge_key: int=KEY_G if SourceBinds.BINDS.forge=="KeyG" else 0
	if event.physical_keycode==forge_key or (_opened and event.physical_keycode==KEY_ESCAPE):
		if _opened:close_panel()
		else:
			var main: Variant=_main.get_ref()
			if not is_instance_valid(main):return
			var lesson: Dictionary=main.read_native_normal_enemy_lesson_status()
			var g: Variant=main.source_state.read_current_g()
			if g is Dictionary and g.get("on")==true and lesson.get("ready")==true and lesson.get("active")==false:open_panel()
		get_viewport().set_input_as_handled()
func open_panel() -> void:
	if _opened:return
	var state: Variant=_state.get_ref()
	if not is_instance_valid(state):return
	var g: Variant=state.read_current_g()
	if not g is Dictionary:return
	_previous_pause=get_tree().paused
	_previous_g_pause=g.get("paused",false)
	g.paused=true
	g.forgeOpen=true
	_opened=true
	_screen.show()
	get_tree().paused=true
	_refresh()
func close_panel() -> void:
	if not _opened:return
	_opened=false
	_screen.hide()
	var state: Variant=_state.get_ref()
	if is_instance_valid(state):
		var g: Variant=state.read_current_g()
		if g is Dictionary:
			g.paused=_previous_g_pause
			g.forgeOpen=false
	if get_tree()!=null:get_tree().paused=_previous_pause
func _exit_tree() -> void:
	close_panel()
func attempt_selected() -> Dictionary:
	var main: Variant=_main.get_ref()
	if not is_instance_valid(main):return {"status":"NOT_READY"}
	_last=main.source_state.apply_native_forge_enhance(main,_selected)
	_refresh()
	return _last.duplicate(true)
func upgrade_potion() -> Dictionary:
	var main: Variant=_main.get_ref()
	if not is_instance_valid(main):return {"status":"NOT_READY"}
	_last=main.source_state.apply_native_forge_potion_upgrade(main)
	_refresh()
	return _last.duplicate(true)

func _box(bg: Color, edge: Color, pad: int=12) -> StyleBoxFlat:
	var s=StyleBoxFlat.new()
	s.bg_color=bg
	s.border_color=edge
	s.set_border_width_all(1)
	s.content_margin_left=pad;s.content_margin_right=pad;s.content_margin_top=pad;s.content_margin_bottom=pad
	return s
func _label(value: String, size: int=22, color: Color=Color("c9bda6"), stack: String="hell") -> Label:
	var l=Label.new();UI.bind(l,value)
	l.add_theme_font_override("font",Fonts.stack(stack,700 if size>=28 else 400))
	l.add_theme_font_size_override("font_size",size)
	l.add_theme_color_override("font_color",color)
	l.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	return l
func _button(value: String, callback: Callable) -> Button:
	var b=Button.new();UI.bind(b,value);b.custom_minimum_size=Vector2(0,46)
	b.add_theme_font_override("font",Fonts.stack("hell",700));b.add_theme_font_size_override("font_size",22)
	b.add_theme_color_override("font_color",Color("d9c7a5"))
	b.add_theme_stylebox_override("normal",_box(Color("211b19"),Color("715b3b")))
	b.add_theme_stylebox_override("hover",_box(Color("35241e"),Color("b29156")))
	b.add_theme_stylebox_override("pressed",_box(Color("461e1b"),Color("c39a57")))
	b.add_theme_stylebox_override("disabled",_box(Color("171616"),Color("3c3731")))
	b.add_theme_color_override("font_disabled_color",Color("68625a"))
	b.pressed.connect(callback);return b
func _line(parent: Control) -> void:
	var line=ColorRect.new();line.color=Color("65513a");line.custom_minimum_size.y=1;line.mouse_filter=Control.MOUSE_FILTER_IGNORE;parent.add_child(line)
func _space(parent: Control, h: float) -> void:
	var c=Control.new();c.custom_minimum_size.y=h;parent.add_child(c)
func _clear(parent: Node) -> void:
	for c in parent.get_children():parent.remove_child(c);c.queue_free()
func _build() -> void:
	_screen=Control.new();_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);add_child(_screen)
	var shade=ColorRect.new();shade.color=Color(0.015,0.008,0.01,0.88);shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);_screen.add_child(shade)
	var frame=PanelContainer.new();frame.position=Vector2(300,60);frame.size=Vector2(1320,960)
	var metal=_box(Color("121112"),Color("9b7a45"),28);metal.shadow_color=Color(0,0,0,.85);metal.shadow_size=22;frame.add_theme_stylebox_override("panel",metal);_screen.add_child(frame)
	var body=VBoxContainer.new();body.add_theme_constant_override("separation",8);frame.add_child(body)
	var brand=_label(text("brand"),15,Color("8c6843"),"cinzel_hell");brand.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;body.add_child(brand)
	var title=_label(text("title"),42,Color("dfc69b"),"hell_title");title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;body.add_child(title)
	var sub=_label(text("sub"),17,Color("a18368"));sub.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;body.add_child(sub)
	_line(body)
	var top=HBoxContainer.new();body.add_child(top)
	_wallet=_label("",23,Color("cfad72"),"cinzel_hell");_wallet.size_flags_horizontal=Control.SIZE_EXPAND_FILL;top.add_child(_wallet)
	top.add_child(_button(text("close"),close_panel))
	var tabs=HBoxContainer.new();tabs.add_theme_constant_override("separation",10);body.add_child(tabs)
	tabs.add_child(_button("소켓 · 유물 · 제작" if TranslationServer.get_locale().begins_with("ko") else "Sockets · Relics · Craft",func():_main.get_ref().open_native_workshop()))
	for id in ["enhance","potion","transfer"]:
		var key: String=id
		var b=_button(text(id),func():_tab=key;_last={};_refresh());b.size_flags_horizontal=Control.SIZE_EXPAND_FILL;tabs.add_child(b)
	_space(body,8)
	var columns=HBoxContainer.new();columns.add_theme_constant_override("separation",26);columns.custom_minimum_size.y=420;body.add_child(columns)
	var left=VBoxContainer.new();left.custom_minimum_size.x=535;columns.add_child(left)
	left.add_child(_label(text("equipped"),22,Color("a58d6d")));_line(left)
	var scroll=ScrollContainer.new();scroll.custom_minimum_size=Vector2(535,360);scroll.size_flags_vertical=Control.SIZE_EXPAND_FILL;left.add_child(scroll)
	_list=VBoxContainer.new();_list.size_flags_horizontal=Control.SIZE_EXPAND_FILL;_list.add_theme_constant_override("separation",8);scroll.add_child(_list)
	var right=PanelContainer.new();right.size_flags_horizontal=Control.SIZE_EXPAND_FILL;right.add_theme_stylebox_override("panel",_box(Color("1b1515"),Color("51402f"),16));columns.add_child(right)
	_detail=VBoxContainer.new();_detail.add_theme_constant_override("separation",8);right.add_child(_detail)
	_line(body)
	_result=_label("",23,Color("c9aa71"));_result.custom_minimum_size.y=48;body.add_child(_result)
	var footer=_label(text("footer"),18,Color("786452"));footer.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;body.add_child(footer)
func _item_name(item: Dictionary) -> String:
	return UI.text(_strip.sub(str(item.get("name","")),"",true).strip_edges())
func _refresh() -> void:
	if _list==null:return
	var state: Variant=_state.get_ref()
	if not is_instance_valid(state):return
	var g: Variant=state.read_current_g();var inv: Variant=state.read_current_inventory()
	if not g is Dictionary or not inv is Dictionary:return
	_wallet.text=text("wallet")%str(g.mats)
	_clear(_list);_clear(_detail)
	for slot in inv.equipped:
		var item: Variant=inv.equipped[slot]
		if not item is Dictionary:continue
		var slot_key: String=slot
		var q=Transaction.quote(item)
		var level: Variant=q.get("enh",0)
		var b=_button(_item_name(item)+"   +"+str(level),func():select_slot(slot_key))
		_list.add_child(b)
	if _list.get_child_count()==0:_list.add_child(_label(text("empty")))
	if _tab=="potion":_potion_details(state)
	elif not _selected.is_empty():_equipment_details(g)
	else:_detail.add_child(_label(text("select"),26))
	_result.text=""
	if not _last.is_empty():
		if _last.get("status")!="READY":_result.text=text("unavailable")
		elif not _last.get("paid",false):_result.text=text("no_malice") if _last.get("reason")=="insufficient_malice" else text("locked")
		elif _last.has("success"):_result.text=(text("success")%str(_last.after) if _last.success else text("failure"))+"\n"+text("paid")%str(_last.cost)
		else:_result.text=text("potion_success")%str(_last.level)+"  /  "+text("paid")%str(_last.cost)
func _equipment_details(g: Dictionary) -> void:
	var q=Transaction.quote(_selected)
	_detail.add_child(_label(_item_name(_selected),31,Color("dec394")))
	if q.status!="READY":_detail.add_child(_label(text("unavailable")));return
	_detail.add_child(_label(text("current")%str(q.enh),24))
	_line(_detail)
	if _tab=="transfer":
		_detail.add_child(_label(text("transfer_note"),22))
		_detail.add_child(_label(text("transfer_cost")%str(Policy.xfer_cost(float(q.enh))),25,Color("c8a164")))
		_detail.add_child(_label(text("transfer_zero") if float(q.enh)<=0.0 else text("transfer_note"),20))
		return
	_detail.add_child(_label(text("next")%str(q.enh+1),26,Color("d6bd88")))
	_detail.add_child(_label(text("chance")%("%.2f"%(float(q.rate)*100)),24))
	_detail.add_child(_label(text("cost")%str(q.cost),25,Color("c8a164")))
	var b=_button(text("attempt"),attempt_selected);b.disabled=float(g.mats)<float(q.cost);_detail.add_child(b)
	_detail.add_child(_label(text("safe"),18,Color("9b8c79")))
	_detail.add_child(_label(text("live"),17,Color("807568")))
func _potion_details(state: Node) -> void:
	var runtime: Dictionary=state.read_native_potion_runtime();var level: int=runtime.level
	var player: Dictionary=state.read_current_p();var g: Dictionary=state.read_current_g()
	var potion=Potion.new();var current=potion.pot_heal(level);var next=potion.pot_heal(level+1)
	_detail.add_child(_label(text("hp"),32,Color("d7bd8e")))
	_detail.add_child(_label(text("potion_level")%str(level),25));_line(_detail)
	if level>=10:
		_detail.add_child(_label(text("max"),26))
		return # source MAX view does not advertise an unavailable next level
	_detail.add_child(_label(text("recovery")%[str(current.value),str(next.value)],26))
	_detail.add_child(_label(text("requires")%str((level+1)*100),23))
	var cost: int=Policy.malice_cost(float((level+1)*5))
	_detail.add_child(_label(text("cost")%str(cost),25,Color("c8a164")))
	var b=_button(text("max") if level>=10 else text("potion"),upgrade_potion)
	b.disabled=level>=10 or float(player.lv)<float((level+1)*100) or float(g.mats)<float(cost)
	_detail.add_child(b)
	if float(player.lv)<float((level+1)*100):_detail.add_child(_label(text("locked"),18,Color("9b8c79")))

func _notification(what: int) -> void:
	if what==NOTIFICATION_TRANSLATION_CHANGED and _list!=null:call_deferred("_refresh")
