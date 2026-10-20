extends "res://scripts/native_forge_panel.gd"
## DEMO11-29 uses accepted forge material/font widgets; no polling or private wallet.
var _gem_type := "cr_last_breath"
var _content: VBoxContainer
var _tab_buttons: Dictionary={}
func _label(value: String,size: int=22,color: Color=Color("dfd6c2"),stack: String="hell") -> Label:
	return super._label(value,size,color,stack)
func tr2(ko: String,en: String) -> String:return ko if TranslationServer.get_locale().begins_with("ko") else en
func _input(event: InputEvent) -> void:
	if _opened and event is InputEventKey and event.pressed and not event.echo and event.physical_keycode in [KEY_G if SourceBinds.BINDS.forge=="KeyG" else 0,KEY_ESCAPE]:
		close_panel();get_viewport().set_input_as_handled()
func _build() -> void:
	_tab="sockets"
	_screen=Control.new();_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);add_child(_screen)
	var theme_all:=Theme.new();theme_all.default_font=Fonts.stack("hell",400);theme_all.default_font_size=20;_screen.theme=theme_all
	var shade:=ColorRect.new();shade.color=Color(0.01,0.005,0.008,.93);shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);_screen.add_child(shade)
	var frame:=PanelContainer.new();frame.position=Vector2(220,48);frame.size=Vector2(1480,984)
	frame.add_theme_stylebox_override("panel",_box(Color("111012"),Color("9b7a45"),28));_screen.add_child(frame)
	var body:=VBoxContainer.new();body.add_theme_constant_override("separation",10);frame.add_child(body)
	var brand:=_label("IRON COVENANT",16,Color("9b7a45"),"cinzel_hell");brand.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;body.add_child(brand)
	var heading:=_label(tr2("검은 화로 · 장인의 작업대","The Black Forge · Artisan's Bench"),38,Color("dfd6c2"),"hell_title");heading.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;body.add_child(heading)
	_line(body)
	var top:=HBoxContainer.new();body.add_child(top)
	_wallet=_label("",22,Color("dfd6c2"));_wallet.size_flags_horizontal=Control.SIZE_EXPAND_FILL;top.add_child(_wallet)
	top.add_child(_button(tr2("강화로 돌아가기","Back to enhancement"),func():close_panel();_main.get_ref().source_forge.open_panel()))
	top.add_child(_button(text("close"),close_panel))
	var tabs:=HBoxContainer.new();body.add_child(tabs)
	for pair in [["sockets","소켓","Sockets"],["gems","유물","Relics"],["craft","장비 제작","Equipment crafting"],["reroll","재련","Reforge"]]:
		var key: String=pair[0]
		var button:=_button(tr2(pair[1],pair[2]),func():_tab=key;_refresh());button.size_flags_horizontal=Control.SIZE_EXPAND_FILL;tabs.add_child(button);_tab_buttons[key]=button
	var scroll:=ScrollContainer.new();scroll.custom_minimum_size=Vector2(1400,500);scroll.size_flags_vertical=Control.SIZE_EXPAND_FILL;body.add_child(scroll)
	_content=VBoxContainer.new();_content.size_flags_horizontal=Control.SIZE_EXPAND_FILL;_content.add_theme_constant_override("separation",12);scroll.add_child(_content)
	_line(body)
	_result=_label("",21,Color("d3b77d"));_result.custom_minimum_size.y=40;body.add_child(_result)
	var footer:=_label(tr2("불꽃은 재료를 기억한다.","The flame remembers its offerings."),18,Color("9a8370"));footer.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;body.add_child(footer)
func choose_tab(key: String) -> void:
	if key in ["sockets","gems","craft","reroll"]:_tab=key;_refresh()
func _action(label: String,op: String,args: Dictionary,ok: bool=true,parent: Node=null) -> void:
	var button:=_button(label,func():
		_last=_main.get_ref().request_native_workshop(op,args)
		_refresh()
		_result.text=tr2("가방에 공간이 없습니다!","There is no room in your bag!") if _last.get("pickup",{}).get("reason")=="bag_full" else tr2("거래를 완료했습니다.","The transaction is complete.") if _last.get("applied",false) else tr2("재료와 장비를 다시 확인하세요.","Check your materials and equipment."))
	button.disabled=not ok
	if parent is GridContainer:button.custom_minimum_size=Vector2(430,64)
	(parent if parent!=null else _content).add_child(button)
func _refresh() -> void:
	if _content==null:return
	for key in _tab_buttons:
		_tab_buttons[key].add_theme_stylebox_override("normal",_box(Color("38221c") if key==_tab else Color("211b19"),Color("c5a064") if key==_tab else Color("715b3b")))
	var state: Node=_state.get_ref();var inv: Variant=state.read_current_inventory();var g: Variant=state.read_current_g()
	if not inv is Dictionary or not g is Dictionary:return
	var bags: Dictionary=state.read_native_reward_bags();var gems: Array=bags.get("crystal",[]);var stones: Array=bags.get("stone",[])
	var stone_choices: Array=[]
	var seen_quality: Dictionary={}
	for stone in stones:
		if not seen_quality.has(stone.q):stone_choices.append(stone);seen_quality[stone.q]=true
	var dust: int=state.read_native_workshop_dust()
	_wallet.text=tr2("악의  %s     유물 가루  %s     소켓석  %s","Malice  %s     Relic dust  %s     Socket stones  %s")%[g.mats,dust,stones.size()]
	_clear(_content)
	if _tab=="craft":
		_content.add_child(_label(tr2("제작 비용  100000 악의  ·  영웅 90% / 전설 10%","Craft cost  100000 Malice  ·  Heroic 90% / Legendary 10%"),24,Color("dfd6c2")))
		_content.add_child(_label(tr2("빈 장비 칸에는 자동 장착됩니다. 이미 장착했다면 가방으로 보냅니다.","An empty equipment slot is filled automatically. Otherwise the item goes to your bag."),20))
		var grid:=GridContainer.new();grid.columns=3;grid.add_theme_constant_override("h_separation",14);grid.add_theme_constant_override("v_separation",12);_content.add_child(grid)
		var labels=[["weapon","무기","Weapon"],["bow","활","Bow"],["armor","갑옷","Armor"],["shield","보조무기","Off-hand"],["helmet","왕관","Crown"],["pants","바지","Pants"],["gloves","장갑","Gloves"],["boots","부츠","Boots"],["belt","벨트","Belt"],["necklace","목걸이","Necklace"],["ring","반지","Ring"],["cape","망토","Cape"],["bracelet","팔찌","Bracelet"],["headband","귀걸이","Earring"]]
		for row in labels:_action(tr2(row[1],row[2]),"equipment_craft",{"slot":row[0]},float(g.mats)>=100000 and not preload("res://scripts/native_workshop_transaction.gd").requires_recalc_st("equipment_craft",inv,row[0]),grid)
		return
	var defs: Dictionary=preload("res://port_modules/kill_reward/drop_item_source.gd").load_tables().CRYSTAL_DEFS
	if _tab=="gems":
		_content.add_child(_label(tr2("보유 유물 · 합성 / 강화 / 분해","Relics held · Synthesize / Enhance / Decompose"),24))
		for i in gems.size():
			var gem: Dictionary=gems[i];var args: Dictionary={"gem_index":i,"gem":gem}
			var line:=HBoxContainer.new();_content.add_child(line)
			var name:=_label(str(defs[gem.id]["ko" if TranslationServer.get_locale().begins_with("ko") else "en"])+"   "+str(int(gem.star)+1)+tr2("성"," rank")+"  +"+str(gem.get("enh",0))+"  q"+str(gem.get("q",50)),20);name.custom_minimum_size.x=500;line.add_child(name)
			var count:=0
			for entry in gems:
				if entry.id==gem.id and entry.star==gem.star:count+=1
			var cost: int=Policy.malice_cost(ceil(500.0*(1.0+float(gem.get("enh",0))*0.5)*preload("res://scripts/native_workshop_transaction.gd").STAR_COST[int(gem.star)]))
			_action(tr2("강화  ","Enhance  ")+str(cost),"gem_enhance",args,count>=2 and int(gem.get("enh",0))<20 and float(g.mats)>=cost,line)
			_action(tr2("합성","Synthesize"),"gem_fuse",args,count>=3 and int(gem.star)<4,line)
			_action(tr2("분해","Decompose"),"gem_decompose",args,true,line)
		if gems.is_empty():_content.add_child(_label(tr2("보유한 유물이 없습니다.","No relics are held.")))
		_line(_content)
		_content.add_child(_label(tr2("악의로 유물 제작  ·  25 악의","Craft a relic  ·  25 Malice"),24))
		for id in defs:
			if defs[id].get("craft",false):_action(str(defs[id]["ko" if TranslationServer.get_locale().begins_with("ko") else "en"]),"gem_buy",{"id":id},float(g.mats)>=25 and gems.size()<9999)
		_content.add_child(_label(tr2("가루로 유물 제작","Craft a relic from dust"),24))
		var types:=OptionButton.new();var ids: Array=defs.keys()
		for id in ids:types.add_item(str(defs[id]["ko" if TranslationServer.get_locale().begins_with("ko") else "en"]))
		types.selected=ids.find(_gem_type);types.item_selected.connect(func(index):_gem_type=ids[index];_refresh());_content.add_child(types)
		var ranks:=HBoxContainer.new();_content.add_child(ranks)
		for rank in range(5):
			var r: int=rank;var cost: int=preload("res://scripts/native_workshop_transaction.gd").DUST[r]
			_action(str(r+1)+tr2("성  "," rank  ")+str(cost),"gem_craft",{"id":_gem_type,"star":r},dust>=cost and gems.size()<9999,ranks)
		return
	for slot in inv.equipped:
		var item: Variant=inv.equipped[slot]
		if not item is Dictionary:continue
		if _tab=="reroll":
			if int(item.get("rarity",0))<1:continue
			_content.add_child(_label(_item_name(item),24,Color("dfd6c2")))
			var presentation=preload("res://port_modules/item_presentation_source/producer.gd").new(preload("res://port_modules/kill_reward/drop_item_source.gd").load_tables().AFFIX_POOL,func(raw):return TranslationServer.translate(str(raw)))
			for affix in item.get("affixes",[]):
				var shown: Dictionary=presentation.affix_view(affix)
				if shown.get("ready",false):_content.add_child(_label(str(shown.name)+"  "+str(shown.value_text),18))
			_action(tr2("재련  100 악의","Reforge  100 Malice"),"reroll",{"slot":slot,"item":item},false) # PC recalcSt-only writer missing: no debit/RNG or development text.
			continue
		_content.add_child(_label(_item_name(item),24,Color("dfd6c2")))
		var sockets: Array=item.get("crystals",[]);var quality: Array=item.get("socketQ",[])
		var homes:=HBoxContainer.new();homes.add_theme_constant_override("separation",12);_content.add_child(homes)
		for i in sockets.size():
			var surround:=PanelContainer.new();surround.custom_minimum_size.x=250;surround.add_theme_stylebox_override("panel",_box(Color("1a1515"),Color("665138"),12));homes.add_child(surround)
			var card:=VBoxContainer.new();card.add_theme_constant_override("separation",8);surround.add_child(card)
			var title: String=tr2("홈 ","Socket ")+str(i+1)+"  q"+str(quality[i] if i<quality.size() and quality[i]!=null else 1)
			card.add_child(_label(title,20))
			if sockets[i]!=null:
				card.add_child(_label(str(defs[sockets[i].id]["ko" if TranslationServer.get_locale().begins_with("ko") else "en"]),20))
				_action(tr2("유물 분리","Detach relic"),"detach",{"slot":slot,"item":item,"socket_index":i},gems.size()<9999,card)
			else:
				card.add_child(_label(tr2("빈 홈","Empty socket"),20,Color("9b8a75")))
				for j in gems.size():
					var gem: Dictionary=gems[j]
					if defs[gem.id].get("slots",[]).has(item.slot):_action(tr2("장착  ","Attach  ")+str(defs[gem.id]["ko" if TranslationServer.get_locale().begins_with("ko") else "en"]),"attach",{"slot":slot,"item":item,"socket_index":i,"gem_index":j,"gem":gem},true,card)
			for stone in stone_choices:
				var current: float=float(quality[i]) if i<quality.size() and quality[i]!=null else 1.0
				if sockets.size()>=5 and float(stone.q)>current:_action(tr2("홈 승급  q","Upgrade socket  q")+str(stone.q),"upgrade",{"slot":slot,"item":item,"socket_index":i,"q":stone.q},true,card)
		if sockets.size()<5:
			for stone in stone_choices:_action(tr2("홈 개방  q","Open socket  q")+str(stone.q),"unseal",{"slot":slot,"item":item,"q":stone.q})
		_line(_content)
