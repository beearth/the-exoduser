extends CanvasLayer
const UI = preload("res://scripts/native_demo_ui_i18n.gd")
## DEMO11-27 → SWEEP-B PC: 원본 game.html #forge(3017–3035)·renderForge(50516–51180) 화면 그대로.
## 탭 6개(강화·물약·분해·리롤·유물·제작)는 기존 State/Main 거래 owner만 호출한다. 새 수치·저장·틱 폴링 없음.
const Fonts = preload("res://scripts/native_ui_fonts.gd")
const Policy = preload("res://scripts/native_meta_enhancement_policy.gd")
const Transaction = preload("res://scripts/native_meta_enhancement_transaction.gd")
const Potion = preload("res://port_modules/potion_recovery_source/producer.gd")
const SourceBinds = preload("res://scripts/native_intro_key_guide_panel.gd")
const S = preload("res://scripts/native_parity_ui_surface.gd")
const Glyphs = preload("res://scripts/native_source_glyphs.gd")
const SalvageTX = preload("res://scripts/native_salvage_transaction.gd")
const Drop = preload("res://port_modules/kill_reward/drop_item_source.gd")
# 구 DEMO11-27 문구 표(공방 하위 패널·기존 검사 호환). 대장간 본 화면 문구는 아래 원문 _L/_T 표를 쓴다.
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
# G50525–50547 _fgTabMeta(대장간 본 탭만, 장비 개별 탭은 숨김).
const FORGE_TABS := ["upgrade","potion","salvage","reroll","crystal","craft"]
const TAB_TEXT := {"upgrade":["강화","Enhance"],"potion":["물약","Potion"],"salvage":["분해","Salvage"],"reroll":["리롤","Reroll"],"crystal":["유물","Relic"],"craft":["제작","Craft"]}
# G50606 강화 목록 순서·이모지(원문 그대로).
const UPGRADE_SLOTS := [["weapon","⚔️","무기","Weapon"],["shield","🛡️","보조무기","Off-hand"],["armor","🦺","갑옷","Armor"],["helmet","👑","왕관","Crown"],["boots","👢","부츠","Boots"],["bow","🏹","활","Bow"],["gloves","🧤","장갑","Gloves"],["pants","👖","바지","Pants"],["belt","🥋","벨트","Belt"],["necklace","📿","목걸이","Necklace"],["ring1","💍","반지1","Ring1"],["ring2","💍","반지2","Ring2"],["cape","🧣","망토","Cape"],["bracelet","⭕","팔찌","Bracelet"],["headband","🎀","귀걸이1","Earring1"],["headband2","🎀","귀걸이2","Earring2"],["ossuary","⚱️","유골함","Ossuary"]]
const ENH_DEF := ["shield","armor","cape"]
const ENH_HP := ["gloves","pants","boots"]
const ENH_ST := ["ring1","ring2","belt"]
const ENH_MP := ["bracelet","necklace","headband","headband2","ossuary"]
const RARITY_C := ["#aaa","#44cc44","#4488ff","#bb44ff","#ffaa00","#8e55e9"]
const RARITY_N := [["일반","Common"],["고급","Uncommon"],["희귀","Rare"],["영웅","Epic"],["전설","Legendary"],["유니크","Unique"]]
const SAL_SLOTS := [["all","전체"],["weapon","⚔️"],["shield","🛡️"],["armor","🦺"],["helmet","⛑️"],["boots","👢"],["bow","🏹"],["gloves","🧤"],["pants","👖"],["necklace","📿"],["ring","💍"],["bracelet","⭕"],["headband","🎀"]]
const SLOT_KR := ["무기","보조무기","부츠","갑옷","왕관","활","장갑","바지","벨트","목걸이","반지1","반지2","망토","팔찌","귀걸이","유골함","귀걸이"]
const SLOT_EN := ["Weapon","Off-hand","Boots","Armor","Crown","Bow","Gloves","Pants","Belt","Necklace","Ring1","Ring2","Cape","Bracelet","Earring","Ossuary","Earring"]
const CRAFT_SLOTS := [["weapon","⚔️","무기","Weapon"],["bow","🏹","활","Bow"],["armor","🦺","갑옷","Armor"],["shield","🛡️","보조무기","Off-hand"],["helmet","👑","왕관","Crown"],["pants","👖","바지","Pants"],["gloves","🧤","장갑","Gloves"],["boots","👢","부츠","Boots"],["belt","🥋","벨트","Belt"],["necklace","📿","목걸이","Necklace"],["ring","💍","반지","Ring"],["cape","🧣","망토","Cape"],["bracelet","⭕","팔찌","Bracelet"],["headband","🎀","귀걸이","Earring"]]
const CRYSTAL_STAR := [["조각","Fragment","#888888"],["파편","Shard","#44cc44"],["유물","Relic","#4488ff"],["순수유물","Pure Relic","#cc44ff"],["완전유물","Perfect Relic","#ffaa00"]]
const STAR_COST_MUL := [1.0,1.5,2.5,4.0,7.0]
const DUST_COST := [50,200,500,1500,5000]
const BONE := Color(221/255.0,197/255.0,173/255.0)
var _main: WeakRef
var _state: WeakRef
var _selected: Dictionary = {}
var _tab = "upgrade"
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
var _fg_content: Control
var _scroll: ScrollContainer
var _lore: Label
var _fg_tab_buttons: Dictionary = {}
var _confirm_bar: Control
var _forge_sel: Dictionary = {}
var _sal_sel: Array = []
var _sal_rar := -1
var _sal_slot := "all"
var _reroll_sel := ""
var _cr_tab := "enhance"
var _cr_filter := "all"
var _cr_sel := -1
var _cr_craft_type := ""
var _cr_craft_star := 0
var _ai_slot := ""
var _ai_target := -1
var _craft_slot := ""
var _dialog: Control
var _dialog_text: RichTextLabel
var _dialog_yes: Callable
var _presentation: RefCounted

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
	_tab="upgrade"
	_refresh()
	return true
func get_snapshot() -> Dictionary:
	return {"opened":_opened,"tab":_tab,"last":_last.duplicate(true),"selected":_item_name(_selected),
		"transfer_equip_owner_bound":false,"save_connected":false,"source_binds_forge":SourceBinds.BINDS.forge}
func text(id: String) -> String:
	return UI.text(str(WORDS[id][0]))
func choose_tab(key: String) -> void:
	if key in FORGE_TABS:
		_tab=key;_forge_sel={};_sal_sel.clear();_reroll_sel="";_cr_sel=-1;_craft_slot="";_refresh()

func _ready() -> void:
	_strip.compile("[\\x{1F000}-\\x{1FAFF}\\x{2600}-\\x{27FF}\\x{FE0F}\\x{200D}]")
	_build()
	_screen.hide()
func _input(event: InputEvent) -> void:
	if is_instance_valid(_main.get_ref()) and is_instance_valid(_main.get_ref().get("source_workshop_panel")) and _main.get_ref().source_workshop_panel._opened:return
	if not event is InputEventKey or not event.pressed or event.echo:return
	if _opened and is_instance_valid(_dialog) and _dialog.visible and event.physical_keycode==KEY_ESCAPE:
		_dialog.hide();get_viewport().set_input_as_handled();return
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
	_set_hud_hidden(true)
	get_tree().paused=true
	_refresh()
func close_panel() -> void:
	if not _opened:return
	_opened=false
	_screen.hide()
	_set_hud_hidden(false)
	if is_instance_valid(_dialog):_dialog.hide()
	_forge_sel={};_sal_sel.clear() # G44081 closeAllPanels clears transient forge selections
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

# ── 공방 하위 패널(native_workshop_panel.gd)이 쓰는 구 위젯 도우미: 동작 유지 ──
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
func _item_name(item: Dictionary) -> String:
	return UI.text(_strip.sub(str(item.get("name","")),"",true).strip_edges())

# ── 원문 문구 도우미 ──
func _ko() -> bool: return TranslationServer.get_locale().begins_with("ko")
func _L(ko: String, en: String) -> String: return ko if _ko() else en
func _T(ko: String) -> String: return UI.text(ko)
func _rar_name(r: int) -> String: return _L(RARITY_N[clampi(r,0,5)][0],RARITY_N[clampi(r,0,5)][1])
func _disp_name(item: Dictionary) -> String:
	if _presentation==null:
		_presentation=preload("res://port_modules/item_presentation_source/producer.gd").new(Drop.load_tables().get("AFFIX_POOL",[]),func(raw):return UI.text(str(raw)))
	var r: Dictionary=_presentation.item_name(item)
	return str(r.value) if r.get("ready",false) else _T(str(item.get("name","")))
static func _enh_color(enh: float) -> String:
	if enh>=1000:return "#ff00ff"
	if enh>=500:return "#ffdd00"
	if enh>=200:return "#ff0088"
	if enh>=100:return "#ff4444"
	if enh>=75:return "#cc44ff"
	if enh>=50:return "#ff8844"
	if enh>=25:return "#ffcc00"
	if enh>=10:return "#44aaff"
	return "#44ff88"
static func _rate_color(rate: float) -> Color:
	if rate>=0.7:return Color("44ff44")
	if rate>=0.4:return Color("ffdd44")
	if rate>=0.1:return Color("ff8844")
	return Color("ff4444")

# ── 화면 골격: #forge .pbox(470,12,980,1056) ──
func _build() -> void:
	_screen=Control.new();_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);add_child(_screen)
	var shade:=WebBox.new();shade.position=Vector2.ZERO;shade.size=Vector2(1920,1080);shade.grad_a=Color(0,0,0,.533);shade.grad_b=Color(0,0,0,.2);shade.horizontal=true;shade.no_iron=true;_screen.add_child(shade) # #forge computed bg 90deg
	S.iron(_screen,Rect2(470,12,980,1056),Color("141315d9"),Color("09090af2"))
	var backdrop:=Control.new();backdrop.position=Vector2(470,12);backdrop.size=Vector2(980,1056);backdrop.clip_contents=true;backdrop.mouse_filter=Control.MOUSE_FILTER_IGNORE;_screen.add_child(backdrop)
	var sigil:=TextureRect.new();sigil.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;sigil.texture=preload("res://assets/ui/parity_ui_03/sigil.png");sigil.position=Vector2(180,-150);sigil.size=Vector2(620,620);sigil.modulate.a=.15;sigil.mouse_filter=Control.MOUSE_FILTER_IGNORE;backdrop.add_child(sigil)
	S.frame(_screen,Rect2(470,12,980,1056),60,true)
	# .panel-nav (500,48) 5×182.4×32, 활성=대장간, 하단 1px 선
	for i in 5:
		var index:=i
		var b:Button=S.button(_screen,["설정 [ESC]","인벤토리 [TAB]","대장간 [G]","스킬 [K]","능력치 [J]"][i],Rect2(500+i*184.4,48,182.4,32),func():_navigate(index),i==2,12)
		if i==2:
			var bar:=ColorRect.new();bar.color=Color(172/255.0,121/255.0,83/255.0);bar.position=Vector2(0,30);bar.size=Vector2(182.4,2);bar.mouse_filter=Control.MOUSE_FILTER_IGNORE;b.add_child(bar)
	var nav_line:=ColorRect.new();nav_line.color=Color("4a3f30");nav_line.position=Vector2(500,88);nav_line.size=Vector2(920,1);nav_line.mouse_filter=Control.MOUSE_FILTER_IGNORE;_screen.add_child(nav_line)
	# .ptitle (780,101,360,156): crest + 명판 + "복수의 대장간" Noto Serif KR 24/600
	var clip:=Control.new();clip.position=Vector2(780,82);clip.size=Vector2(360,123);clip.clip_contents=true;clip.mouse_filter=Control.MOUSE_FILTER_IGNORE;_screen.add_child(clip)
	var crest:=TextureRect.new();crest.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;crest.texture=preload("res://assets/ui/parity_ui_03/header.png");crest.position=Vector2(0,-90);crest.size=Vector2(360,360);crest.mouse_filter=Control.MOUSE_FILTER_IGNORE;clip.add_child(crest)
	S.art(_screen,"img/ui/iron_covenant_20260924/button.webp",Rect2(780,193,360,64))
	var title:=_css(_screen,"복수의 대장간",Rect2(780,193,360,64),24,Color(239/255.0,225/255.0,197/255.0),"disp_title",600,.48)
	title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;title.vertical_alignment=VERTICAL_ALIGNMENT_CENTER;UI.bind(title,"복수의 대장간")
	title.add_theme_color_override("font_shadow_color",Color.BLACK);title.add_theme_constant_override("shadow_offset_x",0);title.add_theme_constant_override("shadow_offset_y",2)
	# #forgeMats (500,267,920,41)
	_tinted_plate(_screen,Rect2(500,267,920,41),Color(21/255.0,19/255.0,23/255.0,.63)) # #forgeMats gradient(rgba(25,22,25,.51)→rgba(17,16,21,.75)) over plate
	_wallet=_css(_screen,"",Rect2(500,267,920,41),14,Color(227/255.0,206/255.0,176/255.0),"font",600,1.12)
	_wallet.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;_wallet.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
	# #forgeLore (732,330,688,32.4) 12px/1.7 opacity .85
	_lore=_css(_screen,"",Rect2(732,330,688,32.4),12,Color(182/255.0,165/255.0,143/255.0,.85),"hell",400,0)
	_lore.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;_lore.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
	# #fgTabs (500,518+46i,216,40)
	for i in FORGE_TABS.size():
		var key: String=FORGE_TABS[i]
		var b:Button=S.button(_screen,"",Rect2(500,518+46*i,216,40),func():choose_tab(key),false,14)
		b.add_theme_font_override("font",Fonts.stack("hell",400))
		_fg_tab_buttons[key]=b
	# #fgGrid (732,382.4,688,581.6) border 6px rgb(80,75,65) + iron 그라디언트, padding 8
	var grid_box:=WebBox.new();grid_box.position=Vector2(732,382.4);grid_box.size=Vector2(688,581.6);grid_box.grad_a=Color(17/255.0,16/255.0,18/255.0,.875);grid_box.grad_b=Color(9/255.0,9/255.0,10/255.0,.93);_screen.add_child(grid_box)
	S.frame(_screen,Rect2(732,382.4,688,581.6),6) # #forge #fgGrid border 6px + border-image rail
	_scroll=ScrollContainer.new();_scroll.position=Vector2(746,396.4);_scroll.size=Vector2(664,553.6);_scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;_scroll.vertical_scroll_mode=ScrollContainer.SCROLL_MODE_SHOW_NEVER;_screen.add_child(_scroll)
	_fg_content=Control.new();_fg_content.custom_minimum_size=Vector2(650,10);_scroll.add_child(_fg_content)
	# #forgeConfirm(선택 확인 바) — 그리드 아래
	_confirm_bar=Control.new();_confirm_bar.position=Vector2(732,972);_confirm_bar.size=Vector2(688,26);_screen.add_child(_confirm_bar);_confirm_bar.hide()
	# .pclose (885,1004,150,36) "닫기 [G]"
	var close:Button=S.button(_screen,"닫기 [G]",Rect2(885,1004,150,36),close_panel,false,12)
	close.add_theme_color_override("font_shadow_color",Color.BLACK);close.add_theme_constant_override("shadow_offset_y",2)
	_result=_css(_screen,"",Rect2(732,964,688,8),1,Color.TRANSPARENT,"font",400,0);_result.hide()
	_build_dialog()

func _tinted_plate(parent: Node,rect: Rect2,tint: Color) -> TextureRect:
	var plate:=S.art(parent,"img/ui/iron_covenant_20260924/button.webp",rect)
	var sh:=Shader.new();sh.code="shader_type canvas_item; uniform vec4 tint:source_color; void fragment(){vec4 c=texture(TEXTURE,UV);COLOR=vec4(mix(c.rgb,tint.rgb,tint.a),c.a);}"
	var mat:=ShaderMaterial.new();mat.shader=sh;mat.set_shader_parameter("tint",tint);plate.material=mat
	return plate

func _set_hud_hidden(hidden: bool) -> void:
	# ui-foundation.css124: body:has(#forge.on) hides #hud/#petSubtitle/#mmWrap/globes/#skBar/#stageClock/#areaTitle.
	var main: Variant=_main.get_ref() if _main!=null else null
	if not is_instance_valid(main):return
	var pets: Node=main.world.get_node_or_null("NativePets") if is_instance_valid(main.get("world")) else null
	for node in [main.get("hud"),pets.get("_subtitle_layer") if is_instance_valid(pets) else null]:
		if node is CanvasLayer:
			if hidden:
				node.set_meta("forge_prev_visible",node.visible);node.visible=false
			elif node.has_meta("forge_prev_visible"):
				node.visible=bool(node.get_meta("forge_prev_visible"));node.remove_meta("forge_prev_visible")

func _navigate(index: int) -> void:
	if index==2:return
	var main: Node=_main.get_ref()
	close_panel()
	if index==0:main._toggle_pause()
	elif index==1:main.source_inventory_ui.open_panel()
	elif index==3:main.source_inventory_ui.skill_forge.open_panel()
	else:main.source_inventory_ui._navigate([KEY_ESCAPE,KEY_TAB,KEY_G,KEY_K,KEY_J][index])

# ── 공용 렌더 도우미 ──
func _css(parent: Node,value: String,rect: Rect2,px: float,color: Color,stack: String,weight: int,spacing: float) -> Label:
	var l:=Label.new();l.text=value;l.position=rect.position;l.size=rect.size;l.mouse_filter=Control.MOUSE_FILTER_IGNORE
	var font: FontVariation=(Fonts.stack(stack,weight) if Fonts.STACKS.has(stack) else Fonts.stack("hell",weight)).duplicate()
	if spacing!=0.0:preload("res://scripts/native_ui_fonts.gd").apply_spacing(font,int(roundi(spacing)))
	l.add_theme_font_override("font",font);l.add_theme_font_size_override("font_size",maxi(1,roundi(px)));l.add_theme_color_override("font_color",color)
	parent.add_child(l);return l
func _rich(parent: Node,bbcode: String,rect: Rect2,px: float,color: Color,stack: String="hell",weight: int=400,center: bool=false) -> RichTextLabel:
	var r:=RichTextLabel.new();r.bbcode_enabled=true;r.scroll_active=false;r.fit_content=true;r.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	r.position=rect.position;r.size=rect.size;r.mouse_filter=Control.MOUSE_FILTER_IGNORE
	var f: Font=Fonts.stack(stack,weight);var b: Font=Fonts.stack(stack,700)
	r.add_theme_font_override("normal_font",f);r.add_theme_font_override("bold_font",b)
	r.add_theme_font_size_override("normal_font_size",roundi(px));r.add_theme_font_size_override("bold_font_size",roundi(px))
	r.add_theme_color_override("default_color",color)
	r.text=("[center]"+bbcode+"[/center]") if center else bbcode
	parent.add_child(r);return r
func _chip(parent: Node,value: String,rect: Rect2,px: float,color: Color,border: Color,bg: Color,radius: int,callback: Callable,border_w: int=1,weight: int=400) -> Button:
	var b:=Button.new();b.position=rect.position;b.size=rect.size;b.text=value;b.focus_mode=Control.FOCUS_NONE
	b.add_theme_font_override("font",Fonts.stack("hell",weight));b.add_theme_font_size_override("font_size",roundi(px))
	for state in ["normal","hover","pressed","disabled"]:
		var s:=StyleBoxFlat.new();s.bg_color=bg;s.border_color=border;s.set_border_width_all(border_w);s.set_corner_radius_all(radius);s.anti_aliasing=radius>0
		s.content_margin_left=0;s.content_margin_right=0;s.content_margin_top=0;s.content_margin_bottom=0
		if state=="hover":s.border_color=border.lightened(.25)
		b.add_theme_stylebox_override(state,s)
	for key in ["font_color","font_hover_color","font_pressed_color","font_disabled_color","font_focus_color"]:b.add_theme_color_override(key,color)
	if callback.is_valid():b.pressed.connect(callback)
	parent.add_child(b);return b
func _measure(value: String,px: float,stack: String="hell",weight: int=400) -> float:
	return Fonts.stack(stack,weight).get_string_size(value,HORIZONTAL_ALIGNMENT_LEFT,-1,roundi(px)).x
## .fg-i 카드: 1px rgb(100,83,63), linear-gradient(110deg, rgba(48,39,31,.4), rgba(17,16,19,.85)) + iron 320, inset 0 1px rgba(203,177,132,.08)
func _card(parent: Node,rect: Rect2,selected_border: Color=Color.TRANSPARENT,selected_bg: Color=Color.TRANSPARENT) -> WebBox:
	var c:=WebBox.new();c.position=rect.position;c.size=rect.size;c.border=Color(100/255.0,83/255.0,63/255.0) if selected_border.a==0 else selected_border
	c.grad_a=Color(48/255.0,39/255.0,31/255.0,.4);c.grad_b=Color(17/255.0,16/255.0,19/255.0,.85);c.horizontal=true;c.inset_top=Color(203/255.0,177/255.0,132/255.0,.08)
	if selected_bg.a>0:c.tint=selected_bg
	parent.add_child(c);return c
func _hit(extent: Vector2) -> Button:
	var hit:=Button.new();hit.flat=true;hit.size=extent;hit.focus_mode=Control.FOCUS_NONE
	for st in ["normal","hover","pressed","focus"]:hit.add_theme_stylebox_override(st,StyleBoxEmpty.new())
	return hit
func _glyph(parent: Node,id_or_tex: Variant,at: Vector2,size: int,color: Color) -> void:
	var tex: Texture2D=id_or_tex if id_or_tex is Texture2D else Glyphs.texture(str(id_or_tex),color,size)
	if tex==null:return
	var t:=TextureRect.new();t.texture=tex;t.position=at;t.size=Vector2(size,size);t.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;t.mouse_filter=Control.MOUSE_FILTER_IGNORE;parent.add_child(t)

# ── renderForge ──
func _refresh() -> void:
	if _fg_content==null:return
	var state: Variant=_state.get_ref()
	if not is_instance_valid(state):return
	var g: Variant=state.read_current_g();var inv: Variant=state.read_current_inventory()
	if not g is Dictionary or not inv is Dictionary:return
	_wallet.text=_T("악의")+": "+_num(g.mats)
	_lore.text=_T("🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭")
	for key in _fg_tab_buttons:
		var b: Button=_fg_tab_buttons[key];var active: bool=key==_tab
		b.text=_L(TAB_TEXT[key][0],TAB_TEXT[key][1])
		b.add_theme_color_override("font_color",Color(244/255.0,230/255.0,203/255.0) if active else Color(199/255.0,190/255.0,173/255.0))
		for child in b.get_children():
			if child is TextureRect and child.material is ShaderMaterial:child.material.set_shader_parameter("tint",Color(.26,.06,.035,.65) if active else Color(.04,.035,.045,.55))
			if child is ColorRect and child.name=="ActiveBar":child.visible=active
		if active and b.get_node_or_null("ActiveBar")==null:
			var bar:=ColorRect.new();bar.name="ActiveBar";bar.color=Color(172/255.0,121/255.0,83/255.0);bar.size=Vector2(3,40);bar.mouse_filter=Control.MOUSE_FILTER_IGNORE;b.add_child(bar)
	for c in _fg_content.get_children():_fg_content.remove_child(c);c.queue_free()
	var y:=0.0
	match _tab:
		"upgrade":y=_render_upgrade(state,g,inv)
		"potion":y=_render_potion(state,g)
		"salvage":y=_render_salvage(state,g,inv)
		"reroll":y=_render_reroll(state,g,inv)
		"crystal":y=_render_crystal(state,g)
		"craft":y=_render_craft(state,g,inv)
	_fg_content.custom_minimum_size=Vector2(650,y)
	_render_confirm(g)

## JS Number#toLocaleString()(en-US, 소수 최대 3자리) — G50672·G50683 AI 자동 강화 비용·보유·부족분.
static func _locale_num(v: float) -> String:
	if not is_finite(v): return "∞" if v > 0 else ("-∞" if v < 0 else "NaN")
	var neg: bool = v < 0.0
	var a: float = absf(v)
	var whole: float = floor(a)
	var frac: float = snappedf(a - whole, 0.001)
	if frac >= 1.0: whole += 1.0; frac = 0.0
	var digits: String = String.num(whole, 0)
	var out := ""
	for i in digits.length():
		if i > 0 and (digits.length() - i) % 3 == 0: out += ","
		out += digits[i]
	if frac > 0.0:
		out += String.num(frac, 3).substr(1).rstrip("0")
	return ("-" if neg and (whole > 0.0 or frac > 0.0) else "") + out
func _num(v: Variant) -> String:
	var f:=float(v);return str(int(f)) if f==floor(f) else str(f)

func _render_upgrade(state: Node,g: Dictionary,inv: Dictionary) -> float:
	var hdr:=_css(_fg_content,_T("장비 강화 (실패 시 재료만 소멸)"),Rect2(0,0,650,19),15.2,Color(1,170/255.0,68/255.0),"hell",700,1.52);hdr.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	var has_item:=false
	for row in UPGRADE_SLOTS:
		if inv.equipped.get(row[0]) is Dictionary:has_item=true
	var y:=51.0
	if has_item:
		# ── AI 자동 강화 섹션 (G50653–50690) ──
		var line:=ColorRect.new();line.color=Color(68/255.0,51/255.0,34/255.0);line.position=Vector2(0,y);line.size=Vector2(650,1);_fg_content.add_child(line)
		_css(_fg_content,"⚡ "+_T("AI 자동 강화"),Rect2(0,y+15,650,21),15.2,Color(204/255.0,136/255.0,68/255.0),"hell",700,0)
		_css(_fg_content,_T("장비 선택")+" → "+_T("목표치 설정")+" → "+_T("악의 투입")+" → "+_T("자동 시도"),Rect2(0,y+42,650,16),12.8,Color(182/255.0,165/255.0,143/255.0),"hell",400,0)
		var cx:=0.0;var cy:=y+66
		for row in UPGRADE_SLOTS:
			var it: Variant=inv.equipped.get(row[0])
			if not it is Dictionary:continue
			var slot_label: String=row[1]+" "+_L(row[2],row[3])
			var enh_text:="+"+_num(it.get("enh",0))
			var w: float=_measure(_L(row[2],row[3])+" "+enh_text,12.8)+_measure(" ",12.8)+16.6+18
			if cx+w>650:cx=0;cy+=31
			var sel: bool=_ai_slot==row[0];var key: String=row[0]
			var chip:=_chip(_fg_content,"",Rect2(cx,cy,w,27),12.8,Color("88ddff") if sel else Color(182/255.0,165/255.0,143/255.0),Color("44ccff") if sel else Color(51/255.0,34/255.0,17/255.0),Color(68/255.0,204/255.0,1,.15) if sel else Color(0,0,0,.2),3,func():_ai_slot=key;_ai_target=-1;_refresh())
			_rich(chip,"[color=#%s]%s[/color] [color=%s]%s[/color]"%[("88ddff" if sel else "b6a58f"),slot_label,"#f0d7b8",enh_text],Rect2(9,4,w-10,20),12.8,Color(182/255.0,165/255.0,143/255.0))
			cx+=w+4
		y=cy+31+8
		var ai_item: Variant=inv.equipped.get(_ai_slot) if not _ai_slot.is_empty() else null
		if ai_item is Dictionary:
			var cur: float=float(ai_item.get("enh",0))
			if _ai_target<=cur:_ai_target=int(cur)+100
			var exp_cost:=0.0
			for i in range(int(cur),_ai_target):
				var ec: Dictionary=Policy.enh_cost(float(i),ai_item.get("rarity",0));exp_cost+=float(ec.cost)/float(ec.rate)
			_css(_fg_content,_T("목표 강화치"),Rect2(0,y,300,14),12.48,Color("666666"),"hell",400,0)
			_css(_fg_content,_T("예상 필요 악의"),Rect2(320,y,300,14),12.48,Color("666666"),"hell",400,0)
			var box:=LineEdit.new();box.position=Vector2(0,y+17);box.size=Vector2(300,30);box.text=str(_ai_target);box.add_theme_font_size_override("font_size",14)
			box.add_theme_color_override("font_color",Color("ffcc88"));var bs:=StyleBoxFlat.new();bs.bg_color=Color("0a0806");bs.border_color=Color("443322");bs.set_border_width_all(1);bs.set_corner_radius_all(3);bs.content_margin_left=8;box.add_theme_stylebox_override("normal",bs);box.add_theme_stylebox_override("focus",bs)
			box.text_submitted.connect(func(v):_ai_target=maxi(int(cur)+1,int(v) if v.is_valid_int() else int(cur)+1);_refresh());_fg_content.add_child(box)
			var cost_box:=WebBox.new();cost_box.position=Vector2(320,y+17);cost_box.size=Vector2(220,30);cost_box.border=Color("443322");cost_box.solid=Color("0a0806");_fg_content.add_child(cost_box)
			# G50683 Math.ceil(_autoExpCost).toLocaleString() / (G.mats||0).toLocaleString() — 천 단위 쉼표(en-US)
			_rich(cost_box,"[color=#ffaa44]%s[/color] [font_size=12][color=#666666]/ %s %s[/color][/font_size]"%[_locale_num(ceil(exp_cost)),_T("보유"),_locale_num(float(g.mats))],Rect2(8,6,210,20),14.4,Color("ffaa44"))
			var start:=_chip(_fg_content,_T("강화 시작"),Rect2(552,y+17,98,30),12,Color(244/255.0,230/255.0,203/255.0),Color(181/255.0,123/255.0,89/255.0),Color(.26,.06,.035,.65),2,func():_do_ai_enhance())
			start.tooltip_text=""
			var enough: bool=float(g.mats)>=ceil(exp_cost)
			_rich(_fg_content,"+%s → +%s | %s %s"%[_num(cur),str(_ai_target),_T("보유 악의"),("[color=#44ff88]✔ "+_T("충분")+"[/color]") if enough else ("[color=#ff4444]✖ "+_T("부족")+" ("+_locale_num(ceil(exp_cost-float(g.mats)))+" "+_T("더 필요")+")[/color]")],Rect2(0,y+53,650,18),12.8,Color("886644"))
			y+=76
		else:
			_css(_fg_content,_T("위에서 장비를 선택하세요"),Rect2(0,y,650,17),13.6,Color(85/255.0,68/255.0,51/255.0),"hell",400,0)
			y+=25
	# ── 장비 카드 (G50606–50650) ──
	if not has_item:
		var e:=_css(_fg_content,_T("장착된 장비가 없습니다."),Rect2(0,y,650,60),15.2,Color("554433"),"hell",400,0);e.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;e.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
		return y+60
	for row in UPGRADE_SLOTS:
		var it: Variant=inv.equipped.get(row[0])
		if not it is Dictionary:continue
		var item: Dictionary=it
		var enh: float=float(item.get("enh",0))
		var q: Dictionary=Policy.enh_cost(enh,item.get("rarity",0))
		var rate: float=float(q.rate)
		var rp: float=rate*100.0
		var rate_txt: String=str(int(rp)) if rp>=10 else ("%.1f"%rp if rp>=1 else ("%.2f"%rp if rp>=.01 else "%.3f"%rp))
		var bonus:=""
		if item.get("atk",0):bonus+="ATK +%d%% → +%d%%"%[int(Policy.enh_mul_atk(enh)*100),int(Policy.enh_mul_atk(enh+1)*100)]
		var slot: String=str(item.get("slot",row[0]))
		if slot in ENH_DEF:bonus+=(" | " if not bonus.is_empty() else "")+"DEF +%d → +%d"%[int(Policy.enh_mul(enh)),int(Policy.enh_mul(enh+1))]
		if slot in ENH_HP:bonus+=(" | " if not bonus.is_empty() else "")+"HP +%d → +%d"%[int(enh),int(enh+1)]
		if slot in ENH_ST:bonus+=(" | " if not bonus.is_empty() else "")+"ST +%d → +%d"%[int(enh*0.2),int((enh+1)*0.2)]
		if slot in ENH_MP:bonus+=(" | " if not bonus.is_empty() else "")+"MP +%d → +%d"%[int(enh*0.2),int((enh+1)*0.2)]
		if bonus.is_empty():bonus=_T("강화 보너스 적용")
		var card:=_card(_fg_content,Rect2(0,y,650,108))
		var label: String=row[1]+" "+_L(row[2],row[3])+" "+_disp_name_plain(item)
		var name:=_rich(card,"%s [color=#f0d7b8]+%s[/color]"%[label,_num(enh)],Rect2(15,13,620,23),14,Color(240/255.0,213/255.0,183/255.0),"font",600)
		name.add_theme_color_override("font_shadow_color",Color(0,0,0,.78));name.add_theme_constant_override("shadow_offset_y",1)
		_css(card,bonus,Rect2(15,40.4,620,20.4),12,Color(192/255.0,179/255.0,157/255.0),"font",400,0)
		var sep:=ColorRect.new();sep.color=Color(137/255.0,113/255.0,77/255.0,.25);sep.position=Vector2(15,68.8);sep.size=Vector2(620,1);card.add_child(sep)
		_css(card,_T("성공률")+" "+rate_txt+"%",Rect2(15,75.8,300,19.2),12,_rate_color(rate),"hell",700,0)
		var cost:=_css(card,_T("악의")+" "+_num(q.cost),Rect2(335,75.8,300,19.2),12,Color(224/255.0,201/255.0,163/255.0),"hell",500,0);cost.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
		var key: String=row[0]
		var hit:=_hit(card.size)
		hit.pressed.connect(func():_click_upgrade(key));card.add_child(hit)
		y+=116
	return y-8

func _disp_name_plain(item: Dictionary) -> String:
	return _T(str(item.get("name",item.get("slot",""))))

func _click_upgrade(slot: String) -> void:
	# G50625–50644: 카드 클릭 = 즉시 1회 강화 시도(부족하면 notify만).
	if not select_slot(slot):return
	var tab: String=_tab
	var result: Dictionary=attempt_selected()
	_tab=tab
	if result.get("status")=="READY" and not result.get("paid",false):_notify(_T("악의가 부족합니다!"))
	_refresh()

## PC-SYS-4 — G28141~28186 _doAiEnhance(강화 시작 onclick, G50685). 원문 순서 그대로.
## #aiEnhResult(G28151~28181)는 원본도 곧바로 renderForge()(G28184)가 grid를 다시 그려 빈 div로 바뀐다 —
## 웹 실측: 클릭 직후 innerHTML ""(renderForge 직전에만 결과 HTML 존재). 그래서 화면에 그리지 않고 _ai_last에만 남긴다.
## 미이식: SFX.forge/SFX.hurt(WebAudio 합성음), poolPart 20개(시각·RNG 비소비 — 보스 코어 관례와 같음).
var _ai_last: Dictionary = {}
func _do_ai_enhance() -> Dictionary:
	var main: Variant=_main.get_ref();var state: Variant=_state.get_ref()
	if not is_instance_valid(main) or not is_instance_valid(state):return {"status":"NOT_READY"}
	var g: Variant=state.read_current_g();var inv: Variant=state.read_current_inventory()
	if not g is Dictionary or not inv is Dictionary or not inv.get("equipped") is Dictionary:return {"status":"NOT_READY"}
	var pp: Vector2=main.player.global_position
	var item: Variant=inv.equipped.get(_ai_slot) if not _ai_slot.is_empty() else null
	if not item is Dictionary:
		main.world.emit_native_text(pp.x,pp.y-20,_T("아이템 선택 필요"),"#cc4444",50) # G28144
		_ai_last={"status":"READY","ok":false,"reason":"no_item"};return _ai_last
	var cur: float=float(item.get("enh",0)) if (item.get("enh") is int or item.get("enh") is float) else 0.0
	var target: float=float(_ai_target) if _ai_target>0 else cur+100.0 # G28145 G._aiTarget||((enh||0)+100)
	var exp_budget:=0.0 # G28146
	for i in range(int(cur),int(target)):
		var ec: Dictionary=Policy.enh_cost(float(i),item.get("rarity",0) if item.get("rarity") else 0);exp_budget+=float(ec.cost)/float(ec.rate)
	var ceil_exp: float=ceil(exp_budget)
	var mats: float=float(g.mats) if (g.get("mats") is int or g.get("mats") is float) and float(g.mats)!=0.0 else 0.0
	var budget: float=minf(ceil_exp if ceil_exp!=0.0 else 1000.0,mats) # G28147 Math.min(Math.ceil(_expBudget)||1000,G.mats||0)
	if budget<=0.0:
		main.world.emit_native_text(pp.x,pp.y-20,_T("악의 부족"),"#cc4444",50) # G28148
		_ai_last={"status":"READY","ok":false,"reason":"budget_zero"};return _ai_last
	var opt: Dictionary=main.read_native_feel_opt_shake()
	var res: Dictionary=state.apply_native_forge_ai_enhance(main,_ai_slot,target,budget,float(opt.get("value",100.0)) if opt.get("ready")==true else 100.0)
	if res.get("status")!="READY":
		_ai_last=res.duplicate(true);return _ai_last
	res["apply_stats"]=main.request_native_runtime_stat_refresh("apply_stats","forge_ai_enhance:G28150")
	if res.get("ok")==true:
		# G28165~28168 SFX.forge(미이식)·shake(8)(State)·poolPart×20(미이식)·addTxt('+N 달성!',enhColor,100)
		main.world.emit_native_text(pp.x,pp.y-30,"+"+_num(res.to)+_L(" 달성!"," Achieved!"),_enh_color(float(res.to)),100)
	else:
		# G28179~28180 SFX.hurt(미이식)·addTxt('악의 소진...','#cc4444',70) — msg 조기 반환({ok:false,msg})도 원본은 이 분기
		main.world.emit_native_text(pp.x,pp.y-25,_T("악의 소진..."),"#cc4444",70)
	_refresh() # G28184 renderForge()
	if float(res.get("used",0))>0.0:res["saved"]=main.save_native_demo11_current() # G28185 dbSaveNow()
	_ai_last=res.duplicate(true)
	return _ai_last

func _notify(msg: String) -> void:
	var main: Variant=_main.get_ref()
	if is_instance_valid(main) and main.has_method("show_native_notify"):main.show_native_notify(msg)
	else:print("FORGE_NOTIFY ",msg)

func _render_potion(state: Node,g: Dictionary) -> float:
	_css(_fg_content,_T("⬆ 물약 강화 (최대 10단)"),Rect2(0,0,650,20),14.4,Color(170/255.0,136/255.0,85/255.0),"hell",700,1.44)
	var runtime: Dictionary=state.read_native_potion_runtime();var level: int=int(runtime.level)
	var player: Dictionary=state.read_current_p()
	var maxed: bool=level>=10
	var cost: int=Policy.malice_cost(float((level+1)*5))
	var req: int=(level+1)*100
	var lv_ok: bool=float(player.get("lv",1))>=req
	var potion=Potion.new();var cur=potion.pot_heal(level);var nxt=potion.pot_heal(level if maxed else level+1)
	var label:="❤️‍🔥 "+_L("HP 물약","HP Potion")+" Lv."+str(level)+(" (MAX)" if maxed else "")
	var sel: bool=_forge_sel.get("name","")==label
	var card:=_card(_fg_content,Rect2(0,34,650,108),Color("ffaa44") if sel else Color.TRANSPARENT,Color(1,170/255.0,68/255.0,.1) if sel else Color.TRANSPARENT)
	_rich(card,label,Rect2(15,13,620,23),14,Color(240/255.0,213/255.0,183/255.0),"font",600)
	var lv_txt:="" if maxed else ("" if lv_ok else " [color=#ff4444]⚠ Lv.%d %s[/color]"%[req,_T("필요")])
	_rich(card,(_T("최대 강화") if maxed else _T("회복량")+" "+_num(cur.value)+" → "+_num(nxt.value))+lv_txt,Rect2(15,39.4,620,21),12,Color(192/255.0,179/255.0,157/255.0),"font",400)
	if not maxed:
		var sep:=ColorRect.new();sep.color=Color(137/255.0,113/255.0,77/255.0,.25);sep.position=Vector2(15,68.8);sep.size=Vector2(620,1);card.add_child(sep)
		_css(card,_T("악의")+" "+str(cost),Rect2(15,75.8,620,19.2),12,Color(224/255.0,201/255.0,163/255.0),"font",500,0)
	if not maxed and lv_ok:
		var hit:=_hit(card.size)
		hit.pressed.connect(func():_forge_sel={"name":label,"desc":_L("HP 물약","HP Potion")+_L(" 강화 Lv."," Enhance Lv.")+str(level+1),"cost":cost,"fn":upgrade_potion};_refresh());card.add_child(hit)
	return 142.0

func _render_confirm(g: Dictionary) -> void:
	for c in _confirm_bar.get_children():_confirm_bar.remove_child(c);c.queue_free()
	_confirm_bar.visible=not _forge_sel.is_empty()
	if _forge_sel.is_empty():return
	var ok: bool=float(g.mats)>=float(_forge_sel.cost)
	_css(_confirm_bar,_T(str(_forge_sel.name))+" — "+str(_forge_sel.desc)+" — "+_T("악의")+" "+str(_forge_sel.cost),Rect2(0,0,560,26),13,Color("ffcc44"),"hell",700,0).vertical_alignment=VERTICAL_ALIGNMENT_CENTER
	var craft:=func():
		if float(_state.get_ref().read_current_g().mats)<float(_forge_sel.cost):return
		var fn: Callable=_forge_sel.fn
		_forge_sel={}
		fn.call()
	var b:=_chip(_confirm_bar,_T("제작"),Rect2(568,0,120,26),13,Color("ffcc44"),Color("aa8833") if ok else Color("443322"),Color(1,170/255.0,0,.15),0,craft,2,700)
	b.modulate.a=1.0 if ok else .4

func _sal_match(item: Dictionary) -> bool:
	if _sal_rar>=0 and int(item.get("rarity",0))!=_sal_rar:return false
	if _sal_slot!="all":
		var s: String=str(item.get("slot",""))
		if s!=_sal_slot and not (_sal_slot=="ring" and s in ["ring1","ring2"]) and not (_sal_slot=="headband" and s in ["headband","headband2"]):return false
	return true

func _render_salvage(state: Node,g: Dictionary,inv: Dictionary) -> float:
	var hdr:=_css(_fg_content,_T("악의의 분해로 — 장비를 악의로 갈아버려라"),Rect2(0,0,650,21),16,Color(1,102/255.0,68/255.0),"hell",700,1.6);hdr.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	_sal_sel=_sal_sel.filter(func(it):return it is Dictionary and SalvageTX.contains_ref(inv.bag,it))
	# 레어 필터 (G50727–50733)
	_css(_fg_content,_T("레어")+":",Rect2(0,39.5,30,16),12.8,Color(182/255.0,165/255.0,143/255.0),"hell",400,0)
	var rars:=[[-1,_T("전체")],[0,_rar_name(0)],[1,_rar_name(1)],[2,_rar_name(2)],[3,_rar_name(3)],[4,_rar_name(4)]]
	var x:=35.6
	for pair in rars:
		var r: int=pair[0];var act: bool=_sal_rar==r;var w: float=_measure(pair[1],12)+18
		_chip(_fg_content,pair[1],Rect2(x,37,w,21),12,(Color(RARITY_C[r]) if r>=0 else Color("ff6644")) if act else Color(102/255.0,85/255.0,68/255.0),Color("ff6644") if act else Color(51/255.0,34/255.0,17/255.0),Color(1,102/255.0,68/255.0,.1) if act else Color.TRANSPARENT,3,func():_sal_rar=r;_sal_sel.clear();_refresh())
		x+=w+4
	# 슬롯 필터
	_css(_fg_content,_T("슬롯")+":",Rect2(0,75.5,30,16),12.8,Color(182/255.0,165/255.0,143/255.0),"hell",400,0)
	x=35.6
	for pair in SAL_SLOTS:
		var s: String=pair[0];var act: bool=_sal_slot==s;var label: String=_T(pair[1]) if s=="all" else pair[1]
		var w: float=40.8 if s=="all" else 34.5
		_chip(_fg_content,label,Rect2(x,72 if s!="all" else 73,w,23 if s!="all" else 21),12,Color("ff6644") if act else Color(102/255.0,85/255.0,68/255.0),Color("ff6644") if act else Color(51/255.0,34/255.0,17/255.0),Color(1,102/255.0,68/255.0,.1) if act else Color.TRANSPARENT,3,func():_sal_slot=s;_sal_sel.clear();_refresh())
		x+=w+4
	# 일괄 선택
	var bulk:=[[_T("전체 선택"),func():
		for it in inv.bag:
			if it is Dictionary and _sal_match(it) and not SalvageTX.contains_ref(_sal_sel,it):_sal_sel.append(it)
		_refresh()],[_T("전체 해제"),func():_sal_sel.clear();_refresh()],[_T("희귀 이하"),func():
		_sal_sel.clear()
		for it in inv.bag:
			if it is Dictionary and _sal_match(it) and int(it.get("rarity",0))<=2:_sal_sel.append(it)
		_refresh()]]
	x=0
	for pair in bulk:
		var w: float=_measure(pair[0],12.8)+22
		_chip(_fg_content,pair[0],Rect2(x,111,w,26),12.8,Color(170/255.0,136/255.0,85/255.0),Color(68/255.0,51/255.0,34/255.0),Color(0,0,0,.2),3,pair[1])
		x+=w+4
	# 아이템 그리드 (2열, max-height 320 스크롤)
	var grid_scroll:=ScrollContainer.new();grid_scroll.position=Vector2(0,153);grid_scroll.size=Vector2(650,320);grid_scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;grid_scroll.vertical_scroll_mode=ScrollContainer.SCROLL_MODE_SHOW_NEVER;_fg_content.add_child(grid_scroll)
	var holder:=Control.new();grid_scroll.add_child(holder)
	var n:=0
	for it in inv.bag:
		if not it is Dictionary or not _sal_match(it):continue
		var item: Dictionary=it
		var sel: bool=SalvageTX.contains_ref(_sal_sel,item)
		var rect:=Rect2((n%2)*327,floor(n/2.0)*76.8,323,72.8)
		var card:=_card(holder,rect,Color("cc3322") if sel else Color.TRANSPARENT,Color(204/255.0,51/255.0,34/255.0,.12) if sel else Color.TRANSPARENT)
		var rc:=Color(RARITY_C[clampi(int(item.get("rarity",0)),0,5)])
		_glyph(card,Glyphs.item_texture(item,rc,15),Vector2(15,18.7),15,rc)
		var enh: float=float(item.get("enh",0))
		var name:=_rich(card,"%s%s"%[_disp_name(item),(" [color=%s]+%s[/color]"%[_enh_color(enh),_num(enh)]) if enh>0 else ""],Rect2(34,13,286,23),14,Color(240/255.0,213/255.0,183/255.0),"font",600)
		name.autowrap_mode=TextServer.AUTOWRAP_OFF;name.clip_contents=true
		var val: Dictionary=SalvageTX.value_of(item)
		_css(card,"%s T%s → %s %s"%[_rar_name(int(item.get("rarity",0))),_num(item.get("tier",0)),_T("악의"),_num(val.value) if val.get("ready",false) else "0"],Rect2(15,39.4,293,20.4),12,Color(192/255.0,179/255.0,157/255.0),"font",400,0)
		if sel:
			_css(card,"✗",Rect2(323-20,2,14,20),14.4,Color("ff4444"),"hell",700,0)
		var hit:=_hit(rect.size)
		hit.pressed.connect(func():
			if SalvageTX.contains_ref(_sal_sel,item):_sal_sel=_sal_sel.filter(func(v):return not is_same(v,item))
			else:_sal_sel.append(item)
			_refresh());card.add_child(hit)
		n+=1
	holder.custom_minimum_size=Vector2(650,ceil(n/2.0)*76.8)
	var grid_h: float=minf(320.0,ceil(n/2.0)*76.8-4) if n>0 else 60.0
	grid_scroll.size.y=grid_h
	if n==0:
		var e:=_css(holder,_T("분해할 아이템이 없습니다."),Rect2(0,0,650,60),15.2,Color("554433"),"hell",400,0);e.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;e.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
	var y: float=153+grid_h+6
	# 요약 + 분해 버튼 (G50770–50790)
	var line:=ColorRect.new();line.color=Color(51/255.0,34/255.0,17/255.0);line.position=Vector2(0,y);line.size=Vector2(650,1);_fg_content.add_child(line)
	var plan: Dictionary=SalvageTX.manual(inv,_sal_sel,false)
	var total: String=_num(plan.total) if plan.get("ready",false) else "0"
	_rich(_fg_content,_L("선택","Selected")+" [color=#ff6644][b]%d[/b][/color]"%_sal_sel.size()+_L("개 ->","  ->")+" [color=#cc66ff][b]%s[/b][/color] "%total+_L("악의 획득 예상","Malice expected"),Rect2(0,y+11,650,22),14.4,Color("aa8855"),"hell",400,true)
	y+=46
	if _sal_sel.size()>0:
		var label:=_L("분해 ({p0}개 -> 악의 {p1})","Salvage ({p0} -> {p1} Malice)").replace("{p0}",str(_sal_sel.size())).replace("{p1}",total)
		var w: float=_measure(label,16,"font",700)+60
		var ask:=func():_ask_salvage(inv)
		_chip(_fg_content,label,Rect2(325-w/2,y-4,w,42),16,Color("ff6644"),Color("cc3322"),Color(150/255.0,35/255.0,22/255.0,.3),6,ask,2,700)
		y+=48
	return y

func _ask_salvage(inv: Dictionary) -> void:
	var plan: Dictionary=SalvageTX.manual(inv,_sal_sel,false)
	if not plan.get("ready",false):return
	var refs: Array=plan.items.duplicate()
	var body:=_L("{p0}개 아이템을 분해합니다.\n{p1} {p2} 악의 획득.\n\n{p3} 복구 불가!","Salvage {p0} items.\n{p1} {p2} Malice gained.\n\n{p3} Cannot undo!").replace("{p0}",str(refs.size())).replace("{p1}","").replace("{p2}",_num(plan.total)).replace("{p3}","")
	_show_dialog(body,func():
		_main.get_ref().request_native_salvage(refs,false)
		_sal_sel.clear()
		_refresh())

func _render_reroll(state: Node,g: Dictionary,inv: Dictionary) -> float:
	var cost: int=Policy.malice_cost(200)
	var hdr:=_css(_fg_content,_L("리롤 — 접두/접미 재설정 | 악의 "+str(cost),"Reroll — Reset prefix/suffix | Malice "+str(cost)),Rect2(0,0,650,21),16,Color(68/255.0,204/255.0,1),"hell",700,1.6);hdr.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	var sc:=ScrollContainer.new();sc.position=Vector2(0,37);sc.size=Vector2(650,280);sc.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;sc.vertical_scroll_mode=ScrollContainer.SCROLL_MODE_SHOW_NEVER;_fg_content.add_child(sc)
	var holder:=Control.new();sc.add_child(holder)
	var y:=0.0
	for i in Glyphs.SLOT_NAMES.size():
		var slot: String=Glyphs.SLOT_NAMES[i]
		var it: Variant=inv.equipped.get(slot)
		var can: bool=it is Dictionary and int(it.get("rarity",0))>=1
		var sel: bool=_reroll_sel==slot
		var row:=WebBox.new();row.position=Vector2(0,y);row.size=Vector2(650,35);row.radius=3
		row.border=Color("44ccff") if sel else (Color("332211") if can else Color("1a1100"));row.solid=Color(68/255.0,204/255.0,1,.1) if sel else Color(0,0,0,.25)
		row.modulate.a=1.0 if can else .4;holder.add_child(row)
		if it is Dictionary:
			var rc:=Color(RARITY_C[clampi(int(it.get("rarity",0)),0,5)])
			_glyph(row,Glyphs.slot_texture(i,rc,15),Vector2(11,11.7),15,rc)
			var enh: float=float(it.get("enh",0))
			_rich(row,"[b][color=#%s]%s%s[/color][/b]"%[rc.to_html(false),_disp_name(it),(" [color=%s]+%s[/color]"%[_enh_color(enh),_num(enh)]) if enh>0 else ""]+(" [font_size=12][color=#554433]%s[/color][/font_size]"%_T("어픽스 없음") if can and (it.get("affixes",[]) as Array).is_empty() else ""),Rect2(32,7,610,21),16,rc)
		else:
			_glyph(row,Glyphs.slot_texture(i,Color("5a4a38"),15),Vector2(11,11.7),15,Color("5a4a38"))
			_css(row,_slot_name(i)+" — "+_T("비어있음"),Rect2(32,7,610,21),16,Color("443322"),"hell",400,0)
		if can:
			var hit:=_hit(row.size)
			hit.pressed.connect(func():_reroll_sel=slot;_refresh());row.add_child(hit)
		y+=39
	holder.custom_minimum_size=Vector2(650,y-4)
	var total: float=37+minf(280.0,y-4)+8
	if not _reroll_sel.is_empty() and inv.equipped.get(_reroll_sel) is Dictionary:
		var r_it: Dictionary=inv.equipped[_reroll_sel]
		var det:=WebBox.new();det.position=Vector2(0,total);det.size=Vector2(650,120);det.border=Color("44ccff");det.solid=Color(0,0,0,.35);det.radius=6;_fg_content.add_child(det)
		var rc:=Color(RARITY_C[clampi(int(r_it.get("rarity",0)),0,5)])
		_rich(det,"[b]%s[/b]"%_disp_name(r_it),Rect2(12,12,626,22),16,rc,"hell",700,true)
		var affix_lines:=""
		for af in r_it.get("affixes",[]):affix_lines+="[color=#ffcc44]%s[/color]\n"%_T(str(af.get("id","")))
		if affix_lines.is_empty():affix_lines="[color=#554433]%s[/color]"%_T("어픽스 없음")
		_rich(det,affix_lines,Rect2(12,40,626,40),13.6,Color("ffcc44"),"hell",400,true)
		var ok: bool=float(g.mats)>=cost
		var reroll:=func():
			if not ok:
				_notify(_T("악의 부족!"))
				return
			_last=_main.get_ref().request_native_workshop("reroll",{"slot":_reroll_sel,"item":r_it})
			_refresh()
		_chip(det,_L("어픽스 리롤","Affix Reroll")+" 👿"+str(cost),Rect2(250,80,150,32),14.4,Color("88ddff") if ok else Color("554433"),Color("44ccff") if ok else Color("332211"),Color(68/255.0,204/255.0,1,.12) if ok else Color(0,0,0,.3),6,reroll,2,700)
		total+=128
	return total

func _slot_name(i: int) -> String:
	if Glyphs.SLOT_NAMES[i] in ["headband","headband2"]:return _L("귀걸이","Earring")+("2" if Glyphs.SLOT_NAMES[i]=="headband2" else "1")
	return _L(SLOT_KR[i],SLOT_EN[i])

func _render_crystal(state: Node,g: Dictionary) -> float:
	var bags: Dictionary=state.read_native_reward_bags();var gems: Array=bags.get("crystal",[])
	var dust: int=state.read_native_workshop_dust()
	var defs: Dictionary=Drop.load_tables().get("CRYSTAL_DEFS",{})
	# 서브탭 (G50876–50882) 중앙 정렬
	var subs:=[["enhance",_L("강화","Enhance")],["synth",_L("합성","Synthesize")],["decomp",_L("분해/제작","Decompose / Craft")]]
	var widths:=[];var total_w:=0.0
	for sub in subs:
		var sw: float=_measure(sub[1],13.6)+22
		widths.append(sw)
		total_w+=sw
	total_w+=4*(subs.size()-1)
	var x:=325-total_w/2
	for i in subs.size():
		var key: String=subs[i][0];var act: bool=_cr_tab==key
		_chip(_fg_content,subs[i][1],Rect2(x,0,widths[i],25),13.6,Color("ddaaff") if act else Color("887766"),Color("bb88ff") if act else Color("443322"),Color(187/255.0,136/255.0,1,.12) if act else Color(0,0,0,.2),3,func():_cr_tab=key;_cr_sel=-1;_refresh())
		x+=widths[i]+4
	_rich(_fg_content,_L("보유: ","Owned: ")+"%d/9999 | "%gems.size()+_L("가루: ","Dust: ")+"[color=#cc88ff]%d[/color] | "%dust+_L("악의: ","Malice: ")+"[color=#cc66ff]%s[/color]"%_num(g.mats),Rect2(0,41,650,17),13.6,Color("887766"),"hell",400,true)
	var filters:=[["all",_L("전체","All")],["atk",_L("공격","Attack")],["def",_L("방어","Defense")],["acc",_L("자원","Resource")]]
	x=325-(64.4*4+6*3)/2
	for f in filters:
		var key: String=f[0];var act: bool=_cr_filter==key
		_chip(_fg_content,f[1],Rect2(x,72,64.4,32),16,Color("ddaaff") if act else Color("aa9988"),Color("bb88ff") if act else Color("443322"),Color(187/255.0,136/255.0,1,.12) if act else Color(0,0,0,.2),4,func():_cr_filter=key;_cr_sel=-1;_cr_craft_type="";_refresh())
		x+=70.4
	var hint:=_css(_fg_content,_L("일괄 작업은 선택한 분류에만 적용됩니다. 장착·해제는 인벤의 장비 소켓에서 가능합니다.","Bulk actions affect the selected category. Equip or detach relics through inventory sockets."),Rect2(0,118,650,16),12.8,Color("aa9988"),"hell",400,0);hint.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	var groups: Array=_crystal_groups(gems,defs)
	var y:=150.0
	if _cr_tab=="enhance" or _cr_tab=="synth":
		var label:=_T("일괄강화+합성") if _cr_tab=="enhance" else _T("최상위 일괄합성")
		var can:=false
		for gr in groups:
			if gr.idxs.size()>=3 and int(gr.star)<4:can=true
		var bulk:=_chip(_fg_content,label,Rect2(0,y,650,32),13.6,(Color("ffcc44") if _cr_tab=="enhance" else Color("ffdd66")) if can else Color("554433"),(Color("bb88ff") if _cr_tab=="enhance" else Color("ffcc44")) if can else Color("443322"),Color(0,0,0,.2),4,Callable(),2,700)
		bulk.disabled=true
		bulk.modulate.a=1.0 if can else .48
		y+=48
	if _cr_tab=="synth":
		var hdr:=_css(_fg_content,_T("같은 종류·같은 성급 유물 3개 → 1성급 상승 (강화 리셋)"),Rect2(0,150-22,650,18),14.4,Color("44ccff"),"hell",400,0);hdr.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	if groups.is_empty():
		var msg:=_L("이 분류에 유물이 없습니다","No relics in this category") if _cr_tab=="enhance" else (_T("합성 가능한 유물이 없습니다 (같은 종류·성급 3개 필요)") if _cr_tab=="synth" else _L("이 분류에 분해할 유물이 없습니다","No relics to decompose in this category"))
		var e:=_css(_fg_content,msg,Rect2(0,y,650,60),16,Color("554433"),"hell",400,0);e.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;e.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
		y+=60
	else:
		for gr in groups:
			var def: Dictionary=defs.get(gr.id,{})
			var star: Array=CRYSTAL_STAR[clampi(int(gr.star),0,4)]
			var row:=WebBox.new();row.position=Vector2(0,y);row.size=Vector2(650,28);row.radius=3;row.border=Color("332211");row.solid=Color(0,0,0,.2);_fg_content.add_child(row)
			_rich(row,"[color=%s][b]%s[/b][/color] [color=#ccaa88]%s[/color]%s [color=#ddbb88]×%d[/color]"%[star[2],_L(star[0],star[1]),_L(str(def.get("ko",gr.id)),str(def.get("en",gr.id))),(" [color=#44ccff]+%d[/color]"%int(gr.enh)) if int(gr.enh)>0 else "",gr.idxs.size()],Rect2(8,4,630,20),13.6,BONE)
			var gi: int=gr.idxs[0];var gem: Dictionary=gems[gi]
			var op:="gem_enhance" if _cr_tab=="enhance" else ("gem_fuse" if _cr_tab=="synth" else "gem_decompose")
			var hit:=_hit(row.size)
			hit.pressed.connect(func():_last=_main.get_ref().request_native_workshop(op,{"gem_index":gi,"gem":gem});_refresh());row.add_child(hit)
			y+=30
	if _cr_tab=="decomp":
		var line:=ColorRect.new();line.color=Color("332211");line.position=Vector2(0,y+8);line.size=Vector2(650,1);_fg_content.add_child(line)
		_css(_fg_content,_T("유물 제작 (가루 → 유물)"),Rect2(0,y+15,650,18),14.4,Color("44ff88"),"hell",700,0)
		y+=40
		var mats_cost: int=Policy.malice_cost(50)
		var line2:=ColorRect.new();line2.color=Color("332211");line2.position=Vector2(0,y+8);line2.size=Vector2(650,1);_fg_content.add_child(line2)
		_css(_fg_content,_L("악의로 1성 유물 제작 ("+str(mats_cost)+" 악의)","Craft 1★ Relic ("+str(mats_cost)+" Malice)"),Rect2(0,y+15,650,18),14.4,Color("cc66ff"),"hell",700,0)
		y+=38
		var cx:=0.0
		for id in defs:
			var def: Dictionary=defs[id]
			if not def.get("craft",false) or (_cr_filter!="all" and str(def.get("cat",""))!=_cr_filter):continue
			var ok2: bool=float(g.mats)>=mats_cost
			var name: String=_L(str(def.get("ko",id)),str(def.get("en",id)))
			var w: float=_measure(name,12.8)+14
			var cid: String=id
			_chip(_fg_content,name,Rect2(cx,y,w,22),12.8,Color("ddaaff") if ok2 else Color("554433"),Color("cc66ff") if ok2 else Color("332211"),Color(200/255.0,100/255.0,1,.1) if ok2 else Color(0,0,0,.2),3,func():_last=_main.get_ref().request_native_workshop("gem_buy",{"id":cid});_refresh())
			cx+=w+3
		y+=26
	return y

func _crystal_groups(gems: Array,defs: Dictionary) -> Array:
	# G15386 _crBagGroups: id·star·enh 같은 묶음, 분류 필터.
	var out: Array=[];var index: Dictionary={}
	for i in gems.size():
		var cr: Variant=gems[i]
		if not cr is Dictionary:continue
		var def: Dictionary=defs.get(cr.get("id",""),{})
		if _cr_filter!="all" and str(def.get("cat",""))!=_cr_filter:continue
		var key:="%s_%s_%s"%[cr.get("id",""),cr.get("star",0),cr.get("enh",0)]
		if not index.has(key):index[key]=out.size();out.append({"id":cr.get("id",""),"star":cr.get("star",0),"enh":cr.get("enh",0),"idxs":[]})
		out[index[key]].idxs.append(i)
	return out

func _render_craft(state: Node,g: Dictionary,inv: Dictionary) -> float:
	var cost: int=Policy.malice_cost(200000)
	if not _craft_slot.is_empty():return _render_craft_slot(state,g,inv,cost)
	var hdr:=_css(_fg_content,_L("🔨 장비 제작","🔨 Equipment Crafting"),Rect2(0,0,650,39),16.8,Color("ffcc44"),"hell",700,2.52);hdr.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;hdr.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
	_rich(_fg_content,_L("비용: ","Cost: ")+"[b][color=#ffaa44]%d[/color][/b] "%cost+_L("악의    |    보유: ","Malice per craft    |    Malice: ")+"[b][color=#cc66ff]%s[/color][/b]\n[color=%s]%s90%%[/color]    [color=%s]%s10%%[/color]"%[_num(g.mats),RARITY_C[3],_T("영웅"),RARITY_C[4],_T("전설")],Rect2(0,47,650,36),13.6,Color("887766"),"hell",400,true)
	for i in CRAFT_SLOTS.size():
		var row: Array=CRAFT_SLOTS[i]
		var rect:=Rect2(4+(i%3)*216,109+floor(i/3.0)*86,210,80)
		var card:=WebBox.new();card.position=rect.position;card.size=rect.size;card.radius=6;card.border=Color("443322");card.solid=Color(0,0,0,.3);_fg_content.add_child(card)
		var emo:=_css(card,row[1],Rect2(5,9,200,29),20.8,BONE,"hell",400,0);emo.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
		var nm:=_css(card,_L(row[2],row[3]),Rect2(5,38,200,16),12.8,Color(204/255.0,170/255.0,119/255.0),"hell",700,0);nm.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
		var slot: String=row[0]
		var cur: Variant=inv.equipped.get("ring1") if slot=="ring" and inv.equipped.get("ring1") else (inv.equipped.get("ring2") if slot=="ring" else (inv.equipped.get("headband") if slot=="headband" and inv.equipped.get("headband") else (inv.equipped.get("headband2") if slot=="headband" else inv.equipped.get(slot))))
		var cur_text:=_T(str(cur.get("name",""))) if cur is Dictionary else "—"
		var cl:=_css(card,cur_text,Rect2(5,57,200,14),11.2,Color(RARITY_C[clampi(int(cur.get("rarity",0)),0,5)]) if cur is Dictionary else Color("443322"),"hell",400,0);cl.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;cl.clip_text=true
		var hit:=_hit(rect.size)
		hit.mouse_entered.connect(func():card.border=Color("bb44ff");card.queue_redraw());hit.mouse_exited.connect(func():card.border=Color("443322");card.queue_redraw())
		hit.pressed.connect(func():_craft_slot=slot;_refresh());card.add_child(hit)
	var tip:=_css(_fg_content,_L("슬롯을 클릭하면 제작, 좌측에서 개별 선택도 가능","Click a slot to craft, or expand ▶ to pick from sidebar"),Rect2(0,109+5*86+6,650,20),12.48,Color("665544"),"hell",400,0);tip.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	return 109+5*86+26

func _render_craft_slot(state: Node,g: Dictionary,inv: Dictionary,cost: int) -> float:
	var row: Array=[]
	for r in CRAFT_SLOTS:
		if r[0]==_craft_slot:row=r
	var cur: Variant=inv.equipped.get(_craft_slot)
	var cur_box:=WebBox.new();cur_box.position=Vector2(0,0);cur_box.size=Vector2(650,64);cur_box.radius=4;cur_box.border=Color("332211");cur_box.solid=Color(0,0,0,.3);_fg_content.add_child(cur_box)
	if cur is Dictionary:
		_rich(cur_box,"[font_size=13][color=#887766]%s[/color][/font_size]\n[b][color=%s]%s[/color][/b]"%[_T("현재 장착"),RARITY_C[clampi(int(cur.get("rarity",0)),0,5)],_T(str(cur.get("name","")))],Rect2(8,8,634,48),15.2,BONE,"hell",400,true)
	else:
		_rich(cur_box,"[font_size=13][color=#554433]%s[/color][/font_size]\n[color=#665544]%s[/color]"%[_T("현재 장착"),_T("없음 — 제작하세요!")],Rect2(8,8,634,48),15.2,BONE,"hell",400,true)
	var hdr:=_css(_fg_content,"🔨 %s %s"%[row[1] if row.size()>1 else "",_L(row[2],row[3]) if row.size()>3 else ""]+_L(" 제작",""),Rect2(0,76,650,28),16,Color("ffcc44"),"hell",700,2.4);hdr.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	_rich(_fg_content,_L("보유 악의: ","Malice: ")+"[b][color=#cc66ff]%s[/color][/b]    |    "%_num(g.mats)+_L("제작 비용: ","Cost: ")+"[b][color=#ffaa44]%d[/color][/b]"%cost,Rect2(0,108,650,24),15.2,Color("776655"),"hell",400,true)
	var ok: bool=float(g.mats)>=cost
	var slot:=_craft_slot
	var label:=_L("🔨 제작 (👿{p0})","🔨 Craft (👿{p0})").replace("{p0}",str(cost))
	var w: float=_measure(label,17.6,"font",700)+64
	var craft:=func():
		_last=_main.get_ref().request_native_workshop("equipment_craft",{"slot":slot})
		_refresh()
	_chip(_fg_content,label,Rect2(325-w/2,236,w,48),17.6,Color("ffcc44") if ok else Color("554433"),Color("bb44ff") if ok else Color("332211"),Color(128/255.0,42/255.0,178/255.0,.22) if ok else Color(0,0,0,.3),8,craft,2,700)
	_chip(_fg_content,"◀ "+_L("제작","Craft"),Rect2(0,300,120,28),12.8,Color("aa8855"),Color("443322"),Color(0,0,0,.2),3,func():_craft_slot="";_refresh())
	return 340.0

# ── gameConfirm 대체(원문 확인창 문구) ──
func _build_dialog() -> void:
	_dialog=Control.new();_dialog.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);_screen.add_child(_dialog)
	var veil:=ColorRect.new();veil.color=Color(0,0,0,.6);veil.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);_dialog.add_child(veil)
	var box:=WebBox.new();box.position=Vector2(760,420);box.size=Vector2(400,220);box.border=Color(117/255.0,98/255.0,71/255.0);box.border_width=2;box.radius=8;box.solid=Color("131215ee");_dialog.add_child(box)
	_dialog_text=_rich(box,"",Rect2(24,24,352,110),16,Color(236/255.0,217/255.0,183/255.0),"font",400,true)
	var yes:Button=S.button(box,"확인",Rect2(34,156,160,44),_dialog_accept,true,16)
	var no:Button=S.button(box,"취소",Rect2(206,156,160,44),func():_dialog.hide(),false,16)
	_dialog.hide()
func _dialog_accept() -> void:
	_dialog.hide()
	if _dialog_yes.is_valid():_dialog_yes.call()
func _show_dialog(body: String,yes: Callable) -> void:
	_dialog_yes=yes;_dialog_text.text="[center]"+body+"[/center]";_dialog.show()

func _notification(what: int) -> void:
	if what==NOTIFICATION_TRANSLATION_CHANGED and _fg_content!=null:call_deferred("_refresh")

## CSS 박스: 테두리·모서리·단색 또는 iron(320) 위 그라디언트·상단 inset 하이라이트.
class WebBox extends Control:
	var border:=Color.TRANSPARENT
	var border_width:=1
	var radius:=0
	var solid:=Color.TRANSPARENT
	var grad_a:=Color.TRANSPARENT
	var grad_b:=Color.TRANSPARENT
	var horizontal:=false
	var inset_top:=Color.TRANSPARENT
	var tint:=Color.TRANSPARENT
	var no_iron:=false
	static var _iron: Texture2D
	func _ready() -> void:
		mouse_filter=Control.MOUSE_FILTER_PASS
		if (grad_a.a>0 or grad_b.a>0) and not no_iron:
			if _iron==null:_iron=preload("res://scripts/native_parity_ui_surface.gd").texture("img/ui/hell_gothic/iron.png")
			texture_repeat=CanvasItem.TEXTURE_REPEAT_ENABLED
		resized.connect(queue_redraw)
	func _draw() -> void:
		var r:=Rect2(Vector2.ZERO,size)
		if grad_a.a>0 or grad_b.a>0:
			if _iron!=null and not no_iron:
				# background: iron center/320px repeat — texel = (p-(size/2-160))/k, repeat sampling.
				var k:=320.0/_iron.get_width()
				var src_pos:=-(size*.5-Vector2(160,160))/k
				draw_texture_rect_region(_iron,r,Rect2(src_pos,size/k))
			var pts:=PackedVector2Array([Vector2.ZERO,Vector2(size.x,0),size,Vector2(0,size.y)])
			var cols:=PackedColorArray([grad_a,grad_b,grad_b,grad_a]) if horizontal else PackedColorArray([grad_a,grad_a,grad_b,grad_b])
			draw_polygon(pts,cols)
		if tint.a>0:draw_rect(r,tint)
		var sb:=StyleBoxFlat.new();sb.bg_color=solid;sb.draw_center=solid.a>0;sb.border_color=border;sb.set_border_width_all(border_width if border.a>0 else 0);sb.set_corner_radius_all(radius);sb.anti_aliasing=radius>0
		draw_style_box(sb,r)
		if inset_top.a>0:draw_line(Vector2(border_width,border_width+.5),Vector2(size.x-border_width,border_width+.5),inset_top,1.0)
