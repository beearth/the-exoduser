extends Control
## DEMO11-23b: event-only view/caller. INV/STORAGE remain owned by State/06c.
const Fonts=preload("res://scripts/native_ui_fonts.gd")
const Query=preload("res://scripts/native_inventory_query.gd")
const Layout=preload("res://scripts/native_inventory_layout.gd")
const Slots=preload("res://scripts/native_inventory_contract.gd")
const Drop=preload("res://port_modules/kill_reward/drop_item_source.gd")
const Special=preload("res://port_modules/item_special_text_source/producer.gd")
const Present=preload("res://port_modules/item_presentation_source/producer.gd")
const TXT={"malice":["악의","Malice"],"inventory":["소지품","Inventory"],"equipment":["장비","Equipment"],"storage":["공유 창고","Shared storage"],"worn":["장착한 장비","Equipped"],"bag":["가방","Bag"],"sort":["정렬","Sort"],"all":["전체","All"],"grade":["등급","Rarity"],"slot":["부위","Slot"],"element":["속성","Element"],"close":["닫기","Close"],"equip":["장착","Equip"],"unequip":["해제","Unequip"],"deposit":["창고에 보관","Store item"],"withdraw":["가방으로 이동","Take item"],"current":["현재 장착","Currently equipped"],"candidate":["선택한 장비","Selected item"],"choose":["아이템을 선택하세요","Select an item"],"hint":["좌클릭 상세 · 우클릭 사용 · 끌어서 이동","Click for details · Right-click to use · Drag to move"],"level":["아이템 레벨","Item level"],"required":["요구 레벨","Required level"],"power":["아이템 파워","Item power"],"atk":["공격력","Attack"],"def":["방어력","Defense"],"eDef":["속성 방어","Element defense"],"bonusHp":["추가 생명력","Bonus health"],"spd":["공격 속도","Attack speed"],"socketCount":["소켓","Sockets"],"enh":["강화","Enhancement"],"empty":["비어 있음","Empty"],"fail":["요청을 완료하지 못했습니다.","The request could not be completed."],"savefail":["기록을 저장하지 못했습니다. 다시 시도해 주세요.","Could not save your record. Please try again."],"full":["보관 공간이 부족합니다.","There is not enough storage space."],"bones":["유골","Bones"],"compare":["장착 아이템 비교","Equipment comparison"],"physical":["물리","Physical"],"fire":["화염","Fire"],"ice":["빙결","Ice"],"dark":["암흑","Dark"],"light":["암전","Lightning"]}
const SLOT_KO=["무기","보조무기","부츠","갑옷","왕관","석궁","장갑","바지","벨트","목걸이","반지 1","반지 2","망토","팔찌","귀걸이 1","유골함","귀걸이 2"]
const SLOT_EN=["Weapon","Off-hand","Boots","Armor","Helmet","Crossbow","Gloves","Pants","Belt","Necklace","Ring 1","Ring 2","Cape","Bracelet","Earring 1","Ossuary","Earring 2"]
const BONE=Color("dfd6c2")
const GOLD=Color("96714e")
const DETAIL={
"wStCost":["ST소모","ST Cost"],"wRange":["무기사거리","Weapon Range"],"wArcW":["공격범위","Attack Arc"],"wStagger":["경직력","Stagger"],
"bowSpd":["발사속도","Fire Rate"],"bowRange":["사거리","Range"],"bowPierce":["관통확률","Pierce Chance"],"bonusSt":["ST총량","ST Total"],
"charge":["돌진력","Charge Power"],"chargeDist":["돌진거리","Charge Distance"],"chargeW":["돌진 폭","Charge Width"],"chargeAoE":["충돌 범위","Impact Area"],
"bonusRange":["추가 사거리","Bonus Range"],"bonusChargeDist":["추가 돌진거리","Bonus Charge Distance"],"chargeCharge":["돌진 충전","Charge Charge"],
"critRate":["치명타 확률","Critical Chance"],"critDmg":["치명타 피해","Critical Damage"],"atkSpd":["공격 속도 증가","Attack Speed Bonus"],"potCd":["물약 재사용 감소","Potion Cooldown Reduction"],
"beamDmg":["광선 피해","Beam Damage"],"splashR":["폭발 반경","Splash Radius"],"splashMul":["폭발 피해 배율","Splash Multiplier"],"magicPen":["마법 관통","Magic Penetration"],
"stRegen":["ST 재생","ST Regeneration"],"mpRegen":["MP 재생","MP Regeneration"],"bStr":["힘","Strength"],"bDex":["민첩","Dexterity"],"bInt":["지능","Intelligence"],"special":["특수 효과","Special Effect"]}
var language: String="ko"
var _main: WeakRef
var _state: WeakRef
var _was_paused:=false
var page: String="equipment"
var category: String="equipment"
var filter: Dictionary={"slot":null,"rarity":null,"el":null}
var selected: Dictionary={}
var selected_source: String="bag"
var detail: Control
var bag_grid: Control
var stock_grid: Control
var left: Control
var status: Label
var resources: Label
var counter: Label
var stock_counter: Label
var presenter: RefCounted
var specials: RefCounted
var slot_reader=Slots.new()
var _textures: Dictionary={}
var _rendered: Array=[]
var _equipped_nodes: Array=[]
var _last: Dictionary={}
var _filters: Array=[]
func filter_slots() -> Array:
	return slot_reader.source_slot_names().filter(func(slot): return slot not in ["ossuary","headband2"])+["bonePart"]

class ItemButton extends Button:
	var panel: Control
	var item: Dictionary
	var source: String
	func _get_drag_data(_at: Vector2) -> Variant:
		var icon:=TextureRect.new(); icon.texture=panel.icon_for(item); icon.custom_minimum_size=Vector2(64,64); icon.expand_mode=TextureRect.EXPAND_IGNORE_SIZE; icon.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		set_drag_preview(icon)
		return {"panel":panel,"item":item,"source":source}

class Grid extends Control:
	var panel: Control
	var kind: String
	var columns: int=10
	var cell: int=52
	var rows: int=10
	func _draw() -> void:
		for y in rows:
			for x in columns: draw_style_box(panel.style(Color("171316"),Color("3b3030")),Rect2(x*cell,y*cell,cell-2,cell-2))
	func _can_drop_data(_at: Vector2,data: Variant) -> bool:
		return data is Dictionary and data.get("panel")==panel and data.get("item") is Dictionary and ((kind=="bag" and data.source in ["bag","store"]) or (kind=="store" and data.source=="bag"))
	func _drop_data(at: Vector2,data: Variant) -> void:
		if kind=="store": panel.perform("deposit",data.item)
		elif data.source=="store": panel.perform("withdraw",data.item)
		else: panel.perform("move",data.item,{"x":int(at.x/cell),"y":int(at.y/cell)})
	func _gui_input(event: InputEvent) -> void:
		if kind=="bag" and event is InputEventMouseButton and event.button_index==MOUSE_BUTTON_LEFT and event.pressed and not panel.selected.is_empty() and panel.selected_source=="bag":
			panel.perform("move",panel.selected,{"x":int(event.position.x/cell),"y":int(event.position.y/cell)}); accept_event()

func t(key: String) -> String: return str((TXT if TXT.has(key) else DETAIL)[key][0 if language.begins_with("ko") else 1])
func is_bound_to(main: Node,state: Node) -> bool: return _main!=null and _main.get_ref()==main and _state.get_ref()==state
func configure(main: Node,state: Node) -> bool:
	if _main!=null or not slot_reader.bind_source_state(state): return false
	_main=weakref(main); _state=weakref(state); process_mode=Node.PROCESS_MODE_ALWAYS
	presenter=Present.new(Drop.load_tables().AFFIX_POOL,func(v): return str(v),func(ko,en): return str(ko if language.begins_with("ko") else en))
	specials=Special.new(Drop.load_tables().LEGENDARY_SPECIAL,Drop.load_tables().UNIQUE_SPECIAL,func(value): return str(value))
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT); mouse_filter=Control.MOUSE_FILTER_STOP
	_build(); hide(); return true
func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		var owner: Variant=_main.get_ref() if _main!=null else null
		var intro: Variant=owner.get("source_intro_sequence") if is_instance_valid(owner) else null
		if is_instance_valid(intro) and intro.get_snapshot().get("phase")=="guide": return # Original guide owns all keys.
		if event.physical_keycode==KEY_TAB or event.keycode==KEY_TAB or (visible and (event.physical_keycode==KEY_ESCAPE or event.keycode==KEY_ESCAPE)):
			if visible: close_panel()
			else: open_panel()
			get_viewport().set_input_as_handled()
func open_panel() -> bool:
	if not model().get("ready",false): return false
	_was_paused=get_tree().paused; get_tree().paused=true; show()
	var prepared: Dictionary=_main.get_ref().request_native_inventory_ui("layout") # G44049-44050
	if not prepared.get("applied",false): close_panel(); return false
	refresh_view(); return true
func close_panel() -> void:
	hide(); get_tree().paused=_was_paused; selected={}
func _exit_tree() -> void:
	if visible and is_inside_tree(): get_tree().paused=_was_paused
func model() -> Dictionary:
	var state: Variant=_state.get_ref() if _state!=null else null
	return state.read_native_inventory_ui(_main.get_ref()) if is_instance_valid(state) and is_instance_valid(_main.get_ref()) else {"ready":false}
func style(bg: Color,border: Color) -> StyleBoxFlat:
	var s:=StyleBoxFlat.new(); s.bg_color=bg; s.border_color=border; s.set_border_width_all(1); s.set_content_margin_all(8); return s
func box(rect: Rect2,parent: Node,bg:=Color("100e11"),border:=GOLD) -> Panel:
	var p:=Panel.new(); p.position=rect.position; p.size=rect.size; p.add_theme_stylebox_override("panel",style(bg,border)); parent.add_child(p); return p
func label(text: String,rect: Rect2,parent: Node,px: int=20,color:=BONE,title:=false) -> Label:
	var l:=Label.new(); l.text=text; l.position=rect.position; l.size=rect.size; l.add_theme_font_override("font",Fonts.stack("hell_title" if title else "hell",700 if title else 400)); l.add_theme_font_size_override("font_size",px); l.add_theme_color_override("font_color",color); l.mouse_filter=Control.MOUSE_FILTER_IGNORE; parent.add_child(l); return l
func button(text: String,rect: Rect2,parent: Node,call: Callable) -> Button:
	var b:=Button.new(); b.text=text; b.position=rect.position; b.size=rect.size
	b.add_theme_font_override("font",Fonts.stack("hell",400)); b.add_theme_font_size_override("font_size",20); b.add_theme_color_override("font_color",BONE)
	b.add_theme_stylebox_override("normal",style(Color("24191b"),Color("695344"))); b.add_theme_stylebox_override("hover",style(Color("3d2526"),GOLD)); b.add_theme_stylebox_override("pressed",style(Color("502328"),BONE)); b.add_theme_stylebox_override("focus",style(Color(0,0,0,0),GOLD)); b.pressed.connect(call); parent.add_child(b); return b
func _build() -> void:
	var veil:=ColorRect.new(); veil.size=Vector2(1920,1080); veil.color=Color(0.01,0.005,0.012,0.89); add_child(veil)
	var frame:=box(Rect2(65,55,1790,970),self)
	label(t("inventory"),Rect2(32,14,700,55),frame,36,BONE,true)
	button(t("close")+"  [TAB]",Rect2(1560,19,198,48),frame,close_panel)
	button(t("equipment"),Rect2(32,87,180,44),frame,func(): change_page("equipment"))
	button(t("storage"),Rect2(222,87,180,44),frame,func(): change_page("storage"))
	button(t("bones"),Rect2(412,87,150,44),frame,func(): category="ossuary" if category=="equipment" else "equipment"; clear_filter())
	button(t("sort"),Rect2(993,87,130,44),frame,func(): perform("sort"))
	counter=label("",Rect2(579,89,400,42),frame,20)
	resources=label("",Rect2(1144,89,600,42),frame,20)
	left=box(Rect2(32,154,400,718),frame)
	var bag_box:=box(Rect2(452,154,672,718),frame)
	label(t("bag"),Rect2(18,10,100,34),bag_box,24)
	var scroll:=ScrollContainer.new(); scroll.position=Vector2(18,124); scroll.size=Vector2(636,570); scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED; bag_box.add_child(scroll)
	bag_grid=Grid.new(); bag_grid.panel=self; bag_grid.kind="bag"; scroll.add_child(bag_grid)
	for fi in 3:
		var menu:=OptionButton.new(); menu.position=Vector2(18+fi*208,58); menu.size=Vector2(198,44); menu.add_theme_font_override("font",Fonts.stack("hell",400)); menu.add_theme_font_size_override("font_size",17)
		menu.add_theme_stylebox_override("normal",style(Color("21191d"),Color("695344"))); menu.add_theme_color_override("font_color",BONE)
		menu.get_popup().add_theme_font_override("font",Fonts.stack("hell",400)); menu.get_popup().add_theme_font_size_override("font_size",18)
		menu.add_item(t(["slot","grade","element"][fi])+" / "+t("all"),0)
		if fi==0:
			for i in filter_slots().size(): menu.add_item(slot_name(filter_slots()[i]),i+1)
		elif fi==1:
			for i in 5: menu.add_item(presenter.rarity_view(i).name,i+1) # G50229: no invented unique filter
		else:
			for key in ["physical","fire","ice","dark","light"]: menu.add_item(t(key))
		menu.item_selected.connect(func(index):
			filter[["slot","rarity","el"][fi]]=null if index==0 else (filter_slots()[index-1] if fi==0 else index-1); selected={}; refresh_view())
		bag_box.add_child(menu); _filters.append(menu)
	detail=box(Rect2(1144,154,614,718),frame)
	status=label("",Rect2(32,892,1726,34),frame,18)
	label(t("hint"),Rect2(32,931,1726,28),frame,17,Color("ae9f8d"))
func slot_name(slot: String) -> String:
	var index: int=slot_reader.source_slot_names().find(slot)
	return str((SLOT_KO if language.begins_with("ko") else SLOT_EN)[index]) if index>=0 else t("bones")
func change_page(value: String) -> void:
	page=value; category="all" if page=="storage" else "equipment"; clear_filter()
func clear_filter() -> void:
	filter={"slot":null,"rarity":null,"el":null}; selected={}
	for option in _filters: option.select(0)
	refresh_view()
func color_for(item: Dictionary) -> Color:
	var row: Dictionary=presenter.rarity_view(item.get("rarity",0)); return Color(row.color) if row.ready else BONE
func name_for(item: Dictionary) -> String:
	var row: Dictionary=presenter.item_name(item); return str(row.value) if row.get("ready",false) else str(item.get("name",slot_name(str(item.get("slot","")))))
func icon_for(item: Dictionary) -> Texture2D:
	var kind: String=str(item.get("wtype","sword")) if item.get("slot")=="weapon" else (str(item.get("btype","crossbow")) if item.get("slot")=="bow" else str(item.get("slot","armor")))
	if kind in ["headband","headband2"]: kind="earring"
	if kind in ["ring1","ring2"]: kind="ring"
	if kind=="bonePart": kind="ossuary"
	var element: int=int(item.get("el",0)); var elements: Array=["phys","fire","ice","dark","light","earth","holy"]
	var path: String="res://assets/item_skins/"+kind+"_"+str(elements[element] if element>=0 and element<elements.size() else "phys")+".png"
	if not _textures.has(path): _textures[path]=load(path) if ResourceLoader.exists(path) else null
	return _textures[path]
func _clear(parent: Node) -> void:
	for child in parent.get_children(): parent.remove_child(child); child.queue_free()
func _item_button(item: Dictionary,source: String,rect: Rect2,parent: Node) -> Button:
	var b:=ItemButton.new(); b.panel=self; b.item=item; b.source=source; b.position=rect.position; b.size=rect.size
	var color: Color=color_for(item); var chosen: bool=is_same(selected,item)
	b.add_theme_stylebox_override("normal",style(Color("251c22"),BONE if chosen else color.darkened(0.35))); b.add_theme_stylebox_override("hover",style(Color("40303a"),color)); b.add_theme_stylebox_override("focus",style(Color(0,0,0,0),GOLD))
	b.tooltip_text=""; parent.add_child(b)
	var art:=TextureRect.new(); art.expand_mode=TextureRect.EXPAND_IGNORE_SIZE; art.texture=icon_for(item); art.position=Vector2(5,5); art.size=rect.size-Vector2(10,25); art.expand_mode=TextureRect.EXPAND_IGNORE_SIZE; art.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED; art.mouse_filter=Control.MOUSE_FILTER_IGNORE; b.add_child(art)
	label(str(int(item.get("itemLv",0))),Rect2(4,rect.size.y-25,40,20),b,14,color)
	if int(item.get("enh",0))>0: label("+"+str(int(item.enh)),Rect2(rect.size.x-44,3,42,20),b,15,color)
	b.pressed.connect(func(): selected=item; selected_source=source; perform("select",item,{"source":source}); refresh_view())
	b.mouse_entered.connect(func(): show_detail(item,source))
	b.gui_input.connect(func(event):
		if event is InputEventMouseButton and event.button_index==MOUSE_BUTTON_RIGHT and event.pressed:
			if source=="eq": perform("unequip",item,{"slot":item.slot})
			elif source=="store": perform("withdraw",item)
			else: perform("deposit" if page=="storage" else "equip",item))
	return b
func refresh_view() -> void:
	var m: Dictionary=model()
	if not m.ready: close_panel(); return
	resources.text=t("malice")+"  "+str(int(_state.get_ref().read_current_g().get("mats",0)))
	counter.text=t("bag")+"  %d / %d" % [m.inventory.bag.size(),m.capacity]
	_clear(bag_grid); _clear(left); _rendered=[]; _equipped_nodes=[]
	var indices: Array=Query.filtered_indices(m.inventory.bag,filter,category)
	var end: int=10
	for i in indices:
		var it: Dictionary=m.inventory.bag[i]
		if it.get("_gx")==null or it.get("_gy")==null: continue
		var size: Array=Layout.source_item_size(it); var rect:=Rect2(int(it._gx)*52,int(it._gy)*52,size[0]*52-3,size[1]*52-3)
		_rendered.append({"index":i,"item":it}); _item_button(it,"bag",rect,bag_grid); end=maxi(end,int(it._gy)+size[1])
	bag_grid.rows=end; bag_grid.custom_minimum_size=Vector2(520,end*52); bag_grid.queue_redraw()
	if page=="storage":
		stock_counter=label(t("storage")+"  %d / 200" % m.store.size(),Rect2(16,10,370,40),left,24)
		var scroll:=ScrollContainer.new(); scroll.position=Vector2(16,64); scroll.size=Vector2(368,634); left.add_child(scroll)
		stock_grid=Grid.new(); stock_grid.panel=self; stock_grid.kind="store"; stock_grid.columns=3; stock_grid.cell=110; stock_grid.rows=maxi(6,ceili(m.store.size()/3.0)); stock_grid.custom_minimum_size=Vector2(330,stock_grid.rows*110); scroll.add_child(stock_grid)
		for i in m.store.size(): _item_button(m.store[i],"store",Rect2((i%3)*110,(i/3)*110,105,105),stock_grid)
	else:
		label(t("worn"),Rect2(16,10,370,36),left,24)
		var portrait:=TextureRect.new(); portrait.expand_mode=TextureRect.EXPAND_IGNORE_SIZE; portrait.texture=load("res://assets/ui/demo_lobby/ancestor.webp") if ResourceLoader.exists("res://assets/ui/demo_lobby/ancestor.webp") else null; portrait.position=Vector2(88,70); portrait.size=Vector2(220,590); portrait.expand_mode=TextureRect.EXPAND_IGNORE_SIZE; portrait.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_COVERED; portrait.modulate=Color(0.5,0.4,0.4,0.55); portrait.mouse_filter=Control.MOUSE_FILTER_IGNORE; left.add_child(portrait)
		var i: int=0
		for slot in slot_reader.source_slot_names():
			var rect:=Rect2(18 if i%2==0 else 300,66+(i/2)*70,78,64)
			var it: Variant=m.inventory.equipped[slot]
			if it is Dictionary: _equipped_nodes.append(_item_button(it,"eq",rect,left))
			else: box(rect,left,Color("171316"),Color("493c37")); label(slot_name(slot),rect,left,12,Color("95887a"))
			i+=1
	if not selected.is_empty(): show_detail(selected,selected_source)
	else: _clear(detail); label(t("choose"),Rect2(24,24,550,60),detail,26)
func show_detail(item: Dictionary,source: String) -> void:
	var m: Dictionary=model()
	if not m.ready: return
	_clear(detail)
	var slot: String=str(item.get("slot",""))
	if slot in ["headband","headband2"]:
		if m.inventory.equipped.headband==null: slot="headband"
		elif m.inventory.equipped.headband2==null: slot="headband2"
	var worn: Variant=m.inventory.equipped.get(slot)
	var compare: bool=source=="bag" and page=="equipment" and worn is Dictionary and not is_same(worn,item)
	label(t("compare") if compare else t("candidate"),Rect2(20,12,570,45),detail,26)
	if compare: _detail_card(worn,t("current"),Rect2(18,64,280,550)); _detail_card(item,t("candidate"),Rect2(312,64,280,550))
	else: _detail_card(item,t("current") if source=="eq" else t("candidate"),Rect2(18,64,574,550))
	var action: String="unequip" if source=="eq" else ("withdraw" if source=="store" else ("deposit" if page=="storage" else "equip"))
	button(t(action),Rect2(20,638,572,54),detail,func(): perform(action,item,{"slot":slot}))
func _detail_card(item: Dictionary,heading: String,rect: Rect2) -> void:
	var card:=box(rect,detail,Color("191418"),color_for(item).darkened(0.45))
	label(heading,Rect2(12,8,rect.size.x-24,28),card,17,Color("b4a38a"))
	var name:=label(name_for(item),Rect2(12,40,rect.size.x-24,74),card,23,color_for(item)); name.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	var row: Dictionary=presenter.rarity_view(item.get("rarity",0)); label(str(row.get("name",""))+"  /  "+slot_name(str(item.get("slot",""))),Rect2(12,118,rect.size.x-24,30),card,16,color_for(item))
	var scroll:=ScrollContainer.new(); scroll.position=Vector2(12,160); scroll.size=rect.size-Vector2(24,174); scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED; card.add_child(scroll)
	var list:=VBoxContainer.new(); list.size_flags_horizontal=Control.SIZE_EXPAND_FILL; scroll.add_child(list)
	for key in ["level","required","power","atk","def","eDef","bonusHp","spd","socketCount","enh"]+DETAIL.keys().filter(func(key): return key!="special"):
		var value: Variant=item.get({"level":"itemLv","required":"reqLv"}.get(key,key),0)
		if key=="power": value=Query.power(item) if Query.supported(item) else 0
		if key in ["level","required","power"] or Query.number(value)!=0:
			var percentage: bool=key in ["bowPierce","critRate","critDmg","atkSpd","potCd","splashMul"]
			var shown: float=float(value)*(100 if percentage else 1)
			var l:=label(t(key)+"  "+("%.3f" % shown).trim_suffix("000").trim_suffix(".")+("%" if percentage else ""),Rect2(0,0,rect.size.x-24,26),list,17); l.custom_minimum_size.y=29
	for affix in Query.array_value(item,"affixes"):
		var view: Dictionary=presenter.affix_view(affix)
		if view.get("ready",false):
			var l:=label((view.description if not view.description.is_empty() else view.name)+"  "+view.value_text,Rect2(0,0,rect.size.x-24,40),list,17,Color(view.color)); l.custom_minimum_size.y=48; l.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	for field in ["legendarySpecial","uniqueSpecial"]:
		if item.get(field)==null: continue
		var view: Dictionary=specials.legendary_text(item[field]) if field=="legendarySpecial" else specials.unique_view(item[field])
		if view.get("ready",false) and not str(view.get("text","")).is_empty():
			var content: String=str(view.text).replace("<br>","\n").replace("<br/>","\n")
			content=RegEx.create_from_string("<[^>]+>").sub(content,"",true)
			var l:=label(t("special")+" · "+content,Rect2(0,0,rect.size.x-24,90),list,17,color_for(item)); l.custom_minimum_size.y=120; l.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
func perform(action: String,item: Dictionary={},data: Dictionary={}) -> Dictionary:
	var main: Variant=_main.get_ref()
	var result: Dictionary=main.request_native_inventory_ui(action,item,data) if is_instance_valid(main) else {"applied":false}
	_last=result.duplicate(true)
	status.text="" if result.get("applied",false) and result.get("saved",true) else (t("savefail") if result.get("io_failed",false) else (t("full") if result.get("reason") in ["store_full","bag_full"] else t("fail")))
	if action!="select": selected={}; refresh_view()
	return result
func execute(action: String,item: Dictionary,data: Dictionary,inv: Dictionary,store: Array,capacity: int) -> Dictionary:
	var main: Node=_main.get_ref()
	var bag: Array=inv.bag; var index: int=-1; var stock_index: int=-1
	for i in bag.size():
		if is_same(bag[i],item): index=i; break
	for i in store.size():
		if is_same(store[i],item): stock_index=i; break
	if action=="select":
		if (data.get("source")=="bag" and index<0) or (data.get("source")=="store" and stock_index<0): return {"applied":false,"reason":"lost_item"}
		inv.selected=index if data.get("source")=="bag" else ("st:"+str(stock_index) if data.get("source")=="store" else "eq:"+str(item.get("slot","")))
		return {"applied":true}
	if action in ["equip","unequip"]:
		var result: Dictionary=main.request_native_equip_item(item,str(data.get("slot",""))) if action=="equip" else main.request_native_unequip_item(str(data.get("slot",item.get("slot",""))))
		if result.get("applied",false): result.saved=main.save_native_demo11_current().get("committed",false); result.io_failed=not result.saved
		return result
	if action=="deposit" and (index<0 or store.size()>=200): return {"applied":false,"reason":"store_full" if store.size()>=200 else "lost_item"}
	if action=="withdraw" and (stock_index<0 or bag.size()>=capacity): return {"applied":false,"reason":"bag_full" if bag.size()>=capacity else "lost_item"}
	if action=="move" and (index<0 or not Layout.can_place(bag,index,int(data.get("x",-1)),int(data.get("y",-1)),capacity)): return {"applied":false,"reason":"occupied_cell"}
	if action in ["layout","sort"] and not bag.all(func(it): return it is Dictionary and Query.supported(it)): return {"applied":false,"reason":"unsupported_item"}
	if action=="layout": Query.arrange(bag,capacity); inv.selected=null; return {"applied":true,"layout_only":true}
	if action not in ["deposit","withdraw","sort","move"]: return {"applied":false,"reason":"unknown_action"}
	var bag_before: Array=bag.duplicate(); var store_before: Array=store.duplicate(); var selection: Variant=inv.get("selected")
	var items: Array=[]
	for it in bag+store: items.append({"ref":it,"fields":it.duplicate()})
	match action:
		"deposit": store.append(item); bag.remove_at(index); inv.selected=null
		"withdraw": item._gx=null; item._gy=null; bag.append(item); store.remove_at(stock_index); inv.selected=null
		"move": item._gx=int(data.x); item._gy=int(data.y)
		"sort": Query.arrange(bag,capacity); inv.selected=null
	if action=="withdraw":
		var size: Array=Layout.source_item_size(item); var position: Variant=Layout.find_space(bag,size[0],size[1],bag.size()-1,item,capacity)
		if position!=null: item._gx=position.x; item._gy=position.y
	var receipt: Dictionary=main.save_native_demo11_current()
	if not receipt.get("committed",false):
		bag.assign(bag_before); store.assign(store_before); inv.selected=selection
		for row in items: row.ref.clear(); row.ref.merge(row.fields)
		var rollback: Dictionary=main.save_native_demo11_current()
		return {"applied":false,"io_failed":true,"reason":"save_failed","rollback_saved":rollback.get("committed",false)}
	return {"applied":true,"saved":true,"receipt":receipt}
func get_snapshot() -> Dictionary:
	return {"visible":visible,"page":page,"filter":filter.duplicate(),"indices":_rendered.map(func(row): return row.index),"last":_last.duplicate(true),"shared_owner":"State._demo11_storage / 06c","tick_polling":false}
