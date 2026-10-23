extends Control
## DEMO11-23b: event-only view/caller. INV/STORAGE remain owned by State/06c.
const Surface=preload("res://scripts/native_parity_ui_surface.gd")
const Fonts=preload("res://scripts/native_ui_fonts.gd")
const Query=preload("res://scripts/native_inventory_query.gd")
const Layout=preload("res://scripts/native_inventory_layout.gd")
const Slots=preload("res://scripts/native_inventory_contract.gd")
const Drop=preload("res://port_modules/kill_reward/drop_item_source.gd")
const Special=preload("res://port_modules/item_special_text_source/producer.gd")
const Present=preload("res://port_modules/item_presentation_source/producer.gd")
const TXT={"malice":["악의","Malice"],"inventory":["소지품","Inventory"],"equipment":["장비","Equipment"],"storage":["공유 창고","Shared storage"],"worn":["장착한 장비","Equipped"],"bag":["가방","Bag"],"sort":["정렬","Sort"],"all":["전체","All"],"grade":["등급","Rarity"],"slot":["부위","Slot"],"element":["속성","Element"],"close":["닫기","Close"],"equip":["장착","Equip"],"unequip":["해제","Unequip"],"deposit":["창고에 보관","Store item"],"withdraw":["가방으로 이동","Take item"],"current":["현재 장착","Currently equipped"],"candidate":["선택한 장비","Selected item"],"choose":["아이템을 선택하세요","Select an item"],"hint":["좌클릭 상세 · 우클릭 사용 · 끌어서 이동","Click for details · Right-click to use · Drag to move"],"level":["아이템 레벨","Item level"],"required":["요구 레벨","Required level"],"power":["아이템 파워","Item power"],"atk":["공격력","Attack"],"def":["방어력","Defense"],"eDef":["에너지DEF","Energy DEF"],"bonusHp":["추가 생명력","Bonus health"],"spd":["공격 속도","Attack speed"],"socketCount":["소켓","Sockets"],"enh":["강화","Enhancement"],"empty":["비어 있음","Empty"],"fail":["요청을 완료하지 못했습니다.","The request could not be completed."],"savefail":["기록을 저장하지 못했습니다. 다시 시도해 주세요.","Could not save your record. Please try again."],"full":["보관 공간이 부족합니다.","There is not enough storage space."],"bones":["유골","Bones"],"compare":["장착 아이템 비교","Equipment comparison"],"physical":["물리","Physical"],"fire":["화염","Fire"],"ice":["빙결","Ice"],"dark":["암흑","Dark"],"light":["암전","Lightning"]}
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
var skill_forge: Control
var ossuary_workspace: Control
var compare_expanded:=false
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
var combat_power: Label
var cp_value: Label
var cp_break: Label
var junk_button: Button
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
var filter_bar: Control
var _filter_open:=false
const EQ_POS=[[0,294],[450,294],[450,426],[108,162],[108,30],[558,294],[108,294],[108,426],[450,162],[450,30],[0,162],[558,162],[558,426],[0,426],[0,30],[120,220],[558,30]]
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
   for x in columns:
     draw_style_box(panel.style(Color("181819"),Color("3b3835")),Rect2(x*cell,y*cell,cell-1,cell-1))
     var c:=Vector2(x*cell+cell*.5,y*cell+cell*.5)
     draw_polyline(PackedVector2Array([c+Vector2(0,-12),c+Vector2(12,0),c+Vector2(0,12),c+Vector2(-12,0),c+Vector2(0,-12)]),Color("3b352c"),1)
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
 hide()
 skill_forge=preload("res://scripts/native_skill_forge.gd").new();get_parent().add_child(skill_forge);skill_forge.configure(main,self)
 return true
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
 if is_instance_valid(skill_forge) and skill_forge.visible:skill_forge.close_panel()
 if not model().get("ready",false): return false
 if get_child_count()==0:_build()
 else:Surface.resume_art(self)
 _was_paused=get_tree().paused; get_tree().paused=true; show()
 var prepared: Dictionary=_main.get_ref().request_native_inventory_ui("layout") # G44049-44050
 if not prepared.get("applied",false): close_panel(); return false
 refresh_view(); return true
func close_panel() -> void:
 hide(); get_tree().paused=_was_paused; selected={}
 # Keep controls/scroll/filter state; detach only reloadable image references.
 Surface.suspend_art(self);_textures.clear()
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
 var l:=Label.new(); l.text=text; l.position=rect.position; l.size=rect.size; l.add_theme_font_override("font",Fonts.stack("font",700 if title else 400)); l.add_theme_font_size_override("font_size",px); l.add_theme_color_override("font_color",color); l.mouse_filter=Control.MOUSE_FILTER_IGNORE; parent.add_child(l); return l
func button(text: String,rect: Rect2,parent: Node,call: Callable) -> Button:
 var b:=Button.new(); b.text=text; b.position=rect.position; b.size=rect.size
 b.add_theme_font_override("font",Fonts.stack("hell",400)); b.add_theme_font_size_override("font_size",20); b.add_theme_color_override("font_color",BONE)
 b.add_theme_stylebox_override("normal",style(Color("24191b"),Color("695344"))); b.add_theme_stylebox_override("hover",style(Color("3d2526"),GOLD)); b.add_theme_stylebox_override("pressed",style(Color("502328"),BONE)); b.add_theme_stylebox_override("focus",style(Color(0,0,0,0),GOLD)); b.pressed.connect(call); parent.add_child(b); return b
func _build() -> void:
 # DOM bounds at 1920×1080; CSS source inventory-space.css:15–122,395–489.
 Surface.panel(self,Rect2(0,0,1920,1080),Color(0,0,0,.5))
 Surface.iron(self,Rect2(12,12,1896,1056),Color("171719ee"),Color("080b0df5"))
 Surface.frame(self,Rect2(12,12,1896,1056),60,true)
 var navs: Array=["설정 [ESC]","인벤토리 [TAB]","대장간 [G]","스킬 [K]","능력치 [J]"]
 for i in 5:
  Surface.button(self,navs[i],Rect2(42+i*367.6,48,365.6,39),func(): _navigate([KEY_ESCAPE,KEY_TAB,KEY_G,KEY_K,KEY_J][i]),i==1)
 combat_power=Surface.text(self,"전투력",Rect2(50,102,36,24),12,Color("886644"),"font")
 cp_value=Surface.text(self,"",Rect2(92,101,50,26),21,Color("e1c28b"),"font",600)
 cp_break=Surface.text(self,"",Rect2(148,102,115,24),12,Color("b8b0a1"),"font")
 counter=Surface.text(self,"",Rect2(788,204,340,28),14);counter.z_index=2
 resources=Surface.text(self,"",Rect2(1024,100,450,28),12)
 var close:=Surface.button(self,"✕",Rect2(1842,100,28,28),close_panel,false,19)
 close.add_theme_font_override("font",Fonts.stack("font",900));close.add_theme_color_override("font_color",Color("aa8866"))
 var close_box:=style(Color("271310"),Color("865e43"));close.add_theme_stylebox_override("normal",close_box)
 for i in 4:
  var tab: String=["equipment","ossuary","crystals","storage"][i]
  Surface.button(self,["장비","유골함","유물","보관함"][i],Rect2(42+i*459.75,136,456.75,36),func(): change_page(tab),i==0,13)
 left=Surface.panel(self,Rect2(43,183,708.59375,800),Color("111315"),Color("625846"))
 var bag_box:=Surface.panel(self,Rect2(761.59375,183,623.5625,800),Color("101012"),Color("625846"))
 Surface.frame(bag_box,Rect2(0,0,623.5625,800),6)
 Surface.button(bag_box,"↕ 정렬",Rect2(485,18,70,40),func(): perform("sort"))
 var maximum:=Surface.button(bag_box,"최대",Rect2(557,18,48,40),func(): pass);maximum.disabled=true
 var filter_toggle:=Surface.button(bag_box,"〉 아이템 필터",Rect2(18,67,587.56,32),func(): _filter_open=not _filter_open;filter_bar.visible=_filter_open)
 filter_toggle.alignment=HORIZONTAL_ALIGNMENT_LEFT;filter_toggle.add_theme_font_override("font",Fonts.stack("font",400));filter_toggle.add_theme_color_override("font_color",Color("c3b59b"));filter_toggle.add_theme_font_size_override("font_size",11)
 var filter_style:=style(Color("2a211b88"),Color("514638"));filter_style.content_margin_left=10;filter_toggle.add_theme_stylebox_override("normal",filter_style)
 var scroll:=ScrollContainer.new();scroll.position=Vector2(18,111);scroll.size=Vector2(587.56,671);scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;bag_box.add_child(scroll)
 bag_grid=Grid.new();bag_grid.panel=self;bag_grid.kind="bag";bag_grid.cell=56;scroll.add_child(bag_grid)
 filter_bar=Surface.panel(bag_box,Rect2(18,100,587.56,60),Color("151316"),GOLD);filter_bar.z_index=10;filter_bar.hide()
 for fi in 3:
  var menu:=OptionButton.new();menu.position=Vector2(fi*195,8);menu.size=Vector2(190,38);menu.add_theme_font_override("font",Fonts.stack("font",400));menu.add_theme_font_size_override("font_size",12)
  menu.add_item(t(["slot","grade","element"][fi])+" / "+t("all"),0)
  if fi==0:
   for i in filter_slots().size():menu.add_item(slot_name(filter_slots()[i]),i+1)
  elif fi==1:
   for i in 5:menu.add_item(presenter.rarity_view(i).name,i+1)
  else:
   for key in ["physical","fire","ice","dark","light"]:menu.add_item(t(key))
  menu.item_selected.connect(func(index):
   filter[["slot","rarity","el"][fi]]=null if index==0 else (filter_slots()[index-1] if fi==0 else index-1);selected={};refresh_view())
  filter_bar.add_child(menu);_filters.append(menu)
 Surface.iron(left,Rect2(1,1,706.59,798),Color("161719eb"),Color("090b0def"))
 detail=Surface.panel(self,Rect2(1395.15625,183,481.84375,800),Color("101619"),Color("756342"))
 status=Surface.text(self,"",Rect2(42,993,600,32),12)
 junk_button=Surface.button(self,"전체 쓰레기 지정",Rect2(886,1004,156,34),func(): perform("junk_all"))
func _equipment(m: Dictionary) -> void:
 Surface.text(left,"장착 중",Rect2(18,15,670,28),12,Color("d1c1a3"))
 Surface.panel(left,Rect2(18,43,670,1),Color("3b352c"))
 var board:=Control.new();board.position=Vector2(18.796875,96.3046875);board.scale=Vector2.ONE*(671.0/654.0);board.mouse_filter=Control.MOUSE_FILTER_IGNORE;left.add_child(board)
 var portrait:=Surface.art(board,"img/ui/inventory_knight_cutout_20260928.png",Rect2(134.5,0,385,560));Surface.brighten(portrait,1.65,1.02)
 for i in 17:
  if i==15:continue # G15857: ossuary is a separate page, never a wearable slot.
  var slot: String=slot_reader.source_slot_names()[i]
  var rect:=Rect2(EQ_POS[i][0],EQ_POS[i][1],96,96)
  var it: Variant=m.inventory.equipped.get(slot)
  var b: Control
  if it is Dictionary:b=_item_button(it,"eq",rect,board);_equipped_nodes.append(b)
  else:b=Control.new();b.position=rect.position;b.size=rect.size;board.add_child(b)
  var socket:=Surface.art(b,"img/ui/ossuary_socket_hf_v2.png",Rect2(0,-16,96,128));socket.show_behind_parent=true;Surface.brighten(socket,1.12 if it is Dictionary else .66)
  var sm: ShaderMaterial=socket.material
  sm.shader=Shader.new();sm.shader.code="shader_type canvas_item;uniform float brightness=1.12;void fragment(){vec2 p=UV;vec2 pts[22]=vec2[22](vec2(.50,.01),vec2(.58,.09),vec2(.55,.14),vec2(.78,.15),vec2(.94,.25),vec2(.94,.79),vec2(.81,.88),vec2(.58,.89),vec2(.50,.98),vec2(.42,.89),vec2(.19,.88),vec2(.06,.79),vec2(.06,.25),vec2(.22,.15),vec2(.45,.14),vec2(.42,.09),vec2(.50,.01),vec2(.50,.01),vec2(.50,.01),vec2(.50,.01),vec2(.50,.01),vec2(.50,.01));bool inside=false;for(int i=0,j=15;i<16;j=i++){if(((pts[i].y>p.y)!=(pts[j].y>p.y))&&(p.x<(pts[j].x-pts[i].x)*(p.y-pts[i].y)/(pts[j].y-pts[i].y)+pts[i].x)){inside=!inside;}}if(!inside){discard;}vec4 c=texture(TEXTURE,vec2(UV.x*.75+.125,UV.y));COLOR=vec4(c.rgb*brightness,c.a);}"
  sm.set_shader_parameter("brightness",1.12 if it is Dictionary else .66)
  var caption:=Surface.text(b,slot_name(slot),Rect2(19,71,58,13),10,Color("e5d3ad"));caption.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 var count: int=m.inventory.equipped.values().filter(func(v):return v is Dictionary).size()
 for i in 3:
  var readout:=Surface.panel(left,Rect2(18+i*224,741,217,42),Color.TRANSPARENT)
  Surface.text(readout,["장착 부위","유물 홈","전투력"][i],Rect2(10,6,90,28),11,Color("a89a81"))
  var text:=Surface.text(readout,[str(count)+" / 16","0 / 0",str(_power_total(m))][i],Rect2(90,2,117,36),16,Color("e7cf96"),"font",700);text.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
func _cp(m: Dictionary) -> Dictionary:
 var state: Node=_state.get_ref();var p: Dictionary=state.read_current_p();var stats: Dictionary=state.read_current_stats();var passives: Dictionary=state.read_current_passives()
 var atk: float=Query.number(p.get("baseAtk",0))*2
 var defense: float=(Query.number(p.get("baseDef",0))+Query.number(p.get("_altDef",0))*30)*3
 var extra: float=Query.number(p.get("lv",0))*10+Query.number(p.get("mhp",0))*.5+Query.number(p.get("mst",0))*.3+Query.number(p.get("mmp",0))*.3
 for k in ["str","dex","int","lck"]:extra+=Query.number(stats.get(k,0))*2
 for v in passives.values():extra+=Query.number(v)*15
 for it in m.inventory.equipped.values():
  if not it is Dictionary:continue
  atk+=Query.number(it.get("atk",0))*2;defense+=Query.number(it.get("def",0))*3
  for pair in [["spd",40],["wStagger",1.5],["wRange",.4],["bowRange",.3],["bowSpd",30],["charge",1],["chargeDist",.5],["bonusChargeDist",5],["chargeW",1],["chargeAoE",1.5],["stagger",1.5],["bonusSt",1.5],["stRegen",200],["mpRegen",500],["splashR",1],["splashMul",80],["magicPen",30],["bonusRange",8]]:extra+=Query.number(it.get(pair[0],0))*pair[1]
  for em in it.get("elements",[]):extra+=Query.number(em.get("dmg",0))*.8
 return {"total":int(atk+defense+extra),"atk":int(atk),"def":int(defense),"extra":int(extra)}
func _power_total(m: Dictionary) -> int:return _cp(m).total
func _empty_detail(m: Dictionary) -> void:
 # game.html 49680 .inv-detail-empty + inventory-space.css 실측(상세 원점 1395.16,183 기준 상대좌표)
 var kicker:=Surface.text(detail,"장비 기록",Rect2(19,17,433.8,13),10,Color("ae8c5d"),"hell",700)
 var kf: FontVariation=kicker.get_theme_font("font").duplicate();Surface.Fonts.apply_spacing(kf,2);kicker.add_theme_font_override("font",kf)
 var title:=Surface.text(detail,"현재 전투 구성",Rect2(19,40,433.8,26),20,Color("e1c99b"),"font",700);var tf: FontVariation=title.get_theme_font("font").duplicate();Surface.Fonts.apply_spacing(tf,1);title.add_theme_font_override("font",tf)
 var hint:=Surface.text(detail,"장비나 가방 아이템을 가리키면 이곳에서 옵션과 비교 정보를 확인합니다.",Rect2(19,76,360,40.8),12,Color(169/255.0,156/255.0,133/255.0));hint.autowrap_mode=TextServer.AUTOWRAP_WORD;hint.add_theme_constant_override("line_spacing",3);hint.set_deferred("size",Vector2(360,40.8))
 var p: Dictionary=_state.get_ref().read_current_p()
 for i in 4:
  # .inv-detail-metrics>div 213.4×42.3, 열 간격 7, 행 간격 7, bg rgba(10,16,20,.72) 1px #66583d, pad 10 12
  var metric:=Surface.panel(detail,Rect2(19+(i%2)*220.4,132.8+(i/2)*49.3,213.4,42.3),Color(10/255.0,16/255.0,20/255.0,.72),Color("66583d"))
  Surface.text(metric,["공격","방어","추가 효과","유물 장착"][i],Rect2(13,14,110,15),11,Color(169/255.0,155/255.0,129/255.0),"hell",500)
  var val:=Surface.text(metric,str([_cp(m).atk,_cp(m).def,_cp(m).extra,"0 / 0"][i]),Rect2(90,11,110.4,20),16,Color("ead2a1"),"font",700);val.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
 # .inv-loadout-title: margin 24 0 10, pad-bottom 8, border-bottom 1px #69563a, 700 11px ls .16em #cba875
 var loadout:=Surface.text(detail,"장착 목록",Rect2(19,258.4,433.8,15.4),11,Color("cba875"),"hell",700);var lf: FontVariation=loadout.get_theme_font("font").duplicate();Surface.Fonts.apply_spacing(lf,2);loadout.add_theme_font_override("font",lf)
 var rule:=ColorRect.new();rule.position=Vector2(19,281.8);rule.size=Vector2(433.8,1);rule.color=Color("69563a");rule.mouse_filter=Control.MOUSE_FILTER_IGNORE;detail.add_child(rule)
 var j:=0
 for i in 17:
  if i==15:continue
  var slot: String=slot_reader.source_slot_names()[i];var it: Variant=m.inventory.equipped.get(slot)
  var entry:=Surface.panel(detail,Rect2(19+(j%2)*220.4,302.8+(j/2)*55,213.4,48),Color(16/255.0,21/255.0,24/255.0),Color(81/255.0,68/255.0,52/255.0))
  Surface.text(entry,slot_name(slot),Rect2(10,8,193,13),10,Color(159/255.0,144/255.0,121/255.0),"hell",500)
  Surface.text(entry,name_for(it) if it is Dictionary else "빈 칸",Rect2(10,24,193,15.6),12,Color("e1c99b"),"font",600);j+=1
func _navigate(key: int) -> void:
 close_panel()
 if key==KEY_TAB:return
 var e:=InputEventKey.new();e.physical_keycode=key;e.keycode=key;e.pressed=true
 Input.parse_input_event.call_deferred(e)
func slot_name(slot: String) -> String:
 var index: int=slot_reader.source_slot_names().find(slot)
 return str((SLOT_KO if language.begins_with("ko") else SLOT_EN)[index]) if index>=0 else t("bones")
func change_page(value: String) -> void:
 page=value; category="all" if page=="storage" else ("ossuary" if page=="ossuary" else "equipment"); clear_filter()
func clear_filter() -> void:
 filter={"slot":null,"rarity":null,"el":null}; selected={}
 for option in _filters: option.select(0)
 refresh_view()
func color_for(item: Dictionary) -> Color:
 var row: Dictionary=presenter.rarity_view(item.get("rarity",0)); return Color(row.color) if row.ready else BONE
func name_for(item: Dictionary) -> String:
 return Surface.I18N.text(str(item.get("name",slot_name(str(item.get("slot","")))))) # G49603: _T(it.name), no composed affix rename.
func icon_for(item: Dictionary) -> Texture2D:
 var kind: String=str(item.get("wtype",item.get("btype",item.get("slot",""))))
 if kind in ["headband","headband2"]: kind="earring"
 if kind in ["ring1","ring2"]: kind="ring"
 if kind=="bonePart": kind="ossuary"
 if kind in ["armor","axe","belt","boots","bracelet","cape","crossbow","earring","gloves","helmet","necklace","pants","shield","sword"]:
  return Surface.texture("img/ui/item-cutouts/"+kind+"_phys_cutout.png")
 var element: int=int(item.get("el",0)); var elements: Array=["phys","fire","ice","dark","light","holy","earth"]
 var path: String="res://assets/item_skins/"+kind+"_"+str(elements[element] if element>=0 and element<elements.size() else "phys")+".png"
 if not _textures.has(path): _textures[path]=load(path) if ResourceLoader.exists(path) else null
 return _textures[path]
func _clear(parent: Node) -> void:
 for child in parent.get_children(): parent.remove_child(child); child.queue_free()
func _item_button(item: Dictionary,source: String,rect: Rect2,parent: Node) -> Button:
 var b:=ItemButton.new(); b.panel=self; b.item=item; b.source=source; b.position=rect.position; b.size=rect.size
 var color: Color=color_for(item); var chosen: bool=is_same(selected,item)
 b.add_theme_stylebox_override("normal",StyleBoxEmpty.new() if source=="eq" else style(Color("251c22"),BONE if chosen else color.darkened(0.35))); b.add_theme_stylebox_override("hover",style(Color("40303a"),color)); b.add_theme_stylebox_override("focus",style(Color(0,0,0,0),GOLD))
 b.tooltip_text=""; parent.add_child(b)
 var art:=TextureRect.new(); art.expand_mode=TextureRect.EXPAND_IGNORE_SIZE; art.texture=icon_for(item); art.position=Vector2(17,12) if source=="eq" else Vector2(5,5); art.size=Vector2(62,62) if source=="eq" else rect.size-Vector2(10,20); art.expand_mode=TextureRect.EXPAND_IGNORE_SIZE; art.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED; art.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR; art.mouse_filter=Control.MOUSE_FILTER_IGNORE; b.add_child(art)
 if source!="eq":
  var shape: Array=Layout.source_item_size(item)
  if shape[0]*shape[1]>=4:
   var name_label:=label(name_for(item),Rect2(4,rect.size.y-14,rect.size.x-8,13),b,10,color);name_label.clip_text=true;name_label.modulate.a=.53
  var power_label:=label(str(Query.power(item)),Rect2(2,rect.size.y-14,rect.size.x-4,13),b,9,Color("aa9977"));power_label.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
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
 if not visible:return
 if page=="ossuary":
  for child in get_children():
   if child is CanvasItem:child.hide()
  if not is_instance_valid(ossuary_workspace):
   ossuary_workspace=preload("res://scripts/native_ossuary_workspace.gd").new();add_child(ossuary_workspace);ossuary_workspace.configure(self)
  else:ossuary_workspace.render()
  ossuary_workspace.show();return
 if is_instance_valid(ossuary_workspace):
  remove_child(ossuary_workspace);ossuary_workspace.queue_free();ossuary_workspace=null
  for child in get_children():
   if child is CanvasItem:child.show()
  filter_bar.visible=_filter_open
 var m: Dictionary=model()
 if not m.ready: close_panel(); return
 cp_value.text=str(_cp(m).total)
 cp_break.text="⚔%d ⛨%d ✧%d" % [_cp(m).atk,_cp(m).def,_cp(m).extra]
 junk_button.text=Surface.I18N.text("전체 쓰레기 지정 ({p0}개)").replace("{p0}",str(m.inventory.bag.filter(func(it):return not it.get("junk",false) and not it.get("fav",false)).size()))
 resources.text=t("malice")+": "+str(int(_state.get_ref().read_current_g().get("mats",0)))
 counter.text=t("bag")+" (%d/%d)" % [m.inventory.bag.size(),m.capacity]
 _clear(bag_grid); _clear(left); Surface.iron(left,Rect2(1,1,706.59,798),Color("161719eb"),Color("090b0def")); _rendered=[]; _equipped_nodes=[]
 var indices: Array=Query.filtered_indices(m.inventory.bag,filter,category)
 var end: int=10
 for i in indices:
  var it: Dictionary=m.inventory.bag[i]
  if it.get("_gx")==null or it.get("_gy")==null: continue
  var size: Array=Layout.source_item_size(it); var rect:=Rect2(int(it._gx)*56,int(it._gy)*56,size[0]*56-3,size[1]*56-3)
  _rendered.append({"index":i,"item":it}); _item_button(it,"bag",rect,bag_grid); end=maxi(end,int(it._gy)+size[1])
 bag_grid.rows=120; bag_grid.custom_minimum_size=Vector2(560,120*56); bag_grid.queue_redraw()
 if page=="storage":
  stock_counter=label(t("storage")+"  %d / 200" % m.store.size(),Rect2(16,10,370,40),left,24)
  var scroll:=ScrollContainer.new(); scroll.position=Vector2(16,64); scroll.size=Vector2(368,634); left.add_child(scroll)
  stock_grid=Grid.new(); stock_grid.panel=self; stock_grid.kind="store"; stock_grid.columns=3; stock_grid.cell=110; stock_grid.rows=maxi(6,ceili(m.store.size()/3.0)); stock_grid.custom_minimum_size=Vector2(330,stock_grid.rows*110); scroll.add_child(stock_grid)
  for i in m.store.size(): _item_button(m.store[i],"store",Rect2((i%3)*110,(i/3)*110,105,105),stock_grid)
 elif page=="equipment": _equipment(m)
 elif page=="ossuary":
  Surface.text(left,"유골함",Rect2(18,15,670,36),20)
  var it: Variant=m.inventory.equipped.get("ossuary")
  if it is Dictionary:_item_button(it,"eq",Rect2(120,220,96,96),left)
 if not selected.is_empty():show_detail(selected,selected_source)
 else:_clear(detail);_empty_detail(m)

func show_detail(item: Dictionary,source: String) -> void:
 if page=="ossuary" and is_instance_valid(ossuary_workspace):ossuary_workspace.show_item(item);return
 var m: Dictionary=model()
 if not m.ready:return
 _clear(detail)
 var slot: String=str(item.get("slot",""));var worn: Variant=m.inventory.equipped.get(slot)
 var compare: bool=source=="bag" and page=="equipment" and worn is Dictionary and not is_same(worn,item)
 if compare:
  Surface.text(detail,"장착 아이템 비교",Rect2(18,12,440,35),14,Color("e1c99b"),"font",700)
  _detail_card(worn,"현재 장착",Rect2(18,60,218,684),true)
  _detail_card(item,"가방 아이템",Rect2(244,60,218,684),true)
  var toggle:=Surface.button(detail,"▾ 수치 차이 전체 보기" if compare_expanded else "▸ 수치 차이 전체 보기",Rect2(18,754,440,28),func():compare_expanded=not compare_expanded;show_detail(item,source),false,11)
  if compare_expanded:_compare_differences(item,worn)
 else:
  Surface.text(detail,"휠: 상세 스크롤",Rect2(18,12,440,30),11,Color("a99c85"))
  _detail_card(item,"장착 중" if source=="eq" else "보관 아이템",Rect2(18,51,444,700),false)
func _card_rows(item: Dictionary) -> Array:
 var rows: Array=[]
 if item.get("itemLv",0):rows.append(["아이템 Lv.",str(item.itemLv)])
 if item.get("reqLv",0):rows.append(["요구 Lv.",str(item.reqLv)])
 var table: Dictionary=Drop.load_tables()
 var wt: Dictionary=table.WTYPES.get(item.get("wtype",""),{})
 var bt: Dictionary=table.BOWTYPES.get(item.get("btype",""),{})
 var type: Dictionary=wt if not wt.is_empty() else bt
 if not type.is_empty():rows.append([str(type.name),""])
 if item.get("atk",0):
  rows.append(["ATK:",str(item.atk)])
  if not type.is_empty():rows.append(["DPS:","%.1f" % (float(item.atk)*float(type.get("atkMul",1))*60/(33/float(type.get("spdMul",1))))])
 for field in [["def","물리DEF"],["eDef","에너지DEF"],["spd","SPD"],["wStCost","ST소모"],["wRange","무기사거리"],["wArcW","공격범위"],["wStagger","경직력"],["bowSpd","발사속도"],["bowRange","사거리"],["bowPierce","관통확률"],["stagger","경직력"],["charge","돌진력"],["chargeDist","돌진거리"],["chargeW","돌진폭"],["chargeAoE","광역범위"],["bonusChargeDist","돌진거리+"],["chargeCharge","돌진충전"],["shieldWt","무게"],["range","사거리"],["bonusSt","ST총량"],["stRegen","ST회복"],["mpRegen","MP회복"],["beamDmg","마법DP"],["splashR","스플래시 범위"],["splashMul","스플래시 배율"],["magicPen","마법 관통"],["bonusRange","사거리+"],["atkSpd","공격속도"],["potCd","물약속도"],["bonusHp","추가HP"],["bonusShield","추가쉴드"],["bonusMp","추가MP"],["ancPow","전대 위력"],["expBonus","경험치"],["bStr","STR"],["bDex","DEX"],["bInt","INT"],["bLck","LCK"],["critRate","치명률"]]:
  var v: Variant=item.get(field[0],0)
  if not Query.number(v):continue
  var shown: String=str(v)
  if field[0]=="bowSpd":shown="%.1f" % (60*float(v)/33)+"발/초"
  elif field[0] in ["bowPierce","splashMul","atkSpd","potCd","ancPow","expBonus"]:shown="+"+str(int(float(v)*100))+"%"
  elif field[0] in ["bonusHp","bonusShield","bonusMp"]:shown="+"+str(v)
  elif field[0]=="spd":shown=("+" if float(v)>=0 else "")+str(v)
  rows.append([str(field[1])+":",shown])
 return rows
func _detail_card(item: Dictionary,heading: String,rect: Rect2,compact: bool=false) -> void:
 var rows: Array=_card_rows(item)
 var card:=Surface.panel(detail,rect,Color("0a0e11"),Color("756342"))
 var content:=Control.new();content.custom_minimum_size=Vector2(rect.size.x-18,110+rows.size()*30);var sc:=ScrollContainer.new();sc.position=Vector2(8,10);sc.size=rect.size-Vector2(16,20);sc.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;card.add_child(sc);sc.add_child(content)
 Surface.panel(content,Rect2(0,0,rect.size.x-18,3),color_for(item))
 Surface.text(content,heading,Rect2(9,8,rect.size.x-36,24),11,Color("a99c85"))
 Surface.text(content,name_for(item),Rect2(9,32,rect.size.x-36,36),14 if compact else 20,color_for(item),"hell",700).clip_text=true
 var y:=78.0
 for i in rows.size():
  var row: Array=rows[i]
  if i%2==1:Surface.panel(content,Rect2(6,y,rect.size.x-30,28),Color("241f1b"))
  Surface.text(content,Surface.I18N.text(row[0]),Rect2(12,y,rect.size.x-48,28),12 if compact else 14,Color("b99c80"),"hell")
  var value:=Surface.text(content,str(row[1]),Rect2(12,y,rect.size.x-48,28),12 if compact else 14,Color("dfc69e"),"hell");value.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT;y+=30
 if item.get("_implicitKo"):
  var implicit:=Surface.text(content,"◆ "+str(item._implicitKo).replace("X",str(int(item.get("_implicitVal",0)))),Rect2(12,y,rect.size.x-48,36),12,Color("aaddff"),"hell");implicit.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;y+=44
 for af in item.get("affixes",[]):
  var view: Dictionary=presenter.affix_view(af)
  if not view.get("ready",false):continue
  var line:=Surface.text(content,str(view.name)+": "+str(view.description)+" "+str(view.value_text),Rect2(12,y,rect.size.x-48,44),12,Color(view.color),"hell");line.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;y+=48
 for field in ["legendarySpecial","uniqueSpecial"]:
  if item.get(field)==null:continue
  var view: Dictionary=specials.legendary_text(item[field]) if field=="legendarySpecial" else specials.unique_view(item[field])
  if view.get("ready",false):
   var line:=Surface.text(content,RegEx.create_from_string("<[^>]+>").sub(str(view.get("text","")),"",true),Rect2(12,y,rect.size.x-48,70),12,color_for(item),"hell");line.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;y+=74
 content.custom_minimum_size.y=y+25
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
 if action=="withdraw_bone":
  # G45857–45878: same r/t, itemLv0; append, find-space, remove collection, save.
  var part: String=str(data.get("part",""));var key: String="iron_warlord_"+part
  if part not in ["skull","torso","arms","legs"] or not inv.ossCollect.has(key):return {"applied":false,"reason":"bone_absent"}
  if bag.size()>=capacity:return {"applied":false,"reason":"bag_full"}
  var record: Dictionary=inv.ossCollect[key]
  var bone: Dictionary={"id":Time.get_unix_time_from_system()*1000+main.world.sample_native_random_unit(),"slot":"bonePart","anc":"iron_warlord","part":part,"el":0,"rarity":clampi(int(record.get("r",0)),0,5),"tier":clampi(int(record.get("t",0)),0,4),"name":"철갑 전대의 "+str({"skull":"두개골","torso":"몸통","arms":"팔","legs":"다리"}[part]),"emoji":"🦴","itemLv":0,"reqLv":0,"affixes":[]}
  var prior: Variant=inv.selected
  bag.append(bone)
  var position: Variant=Layout.find_space(bag,1,1,bag.size()-1,bone,capacity)
  if position==null:bag.pop_back();return {"applied":false,"reason":"bag_full"}
  bone._gx=position.x;bone._gy=position.y;inv.ossCollect.erase(key);inv.selected=null
  var saved: Dictionary=main.save_native_demo11_current()
  if not saved.get("committed",false):bag.pop_back();inv.ossCollect[key]=record;inv.selected=prior;return {"applied":false,"io_failed":true}
  return {"applied":true,"saved":true}
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
 if action not in ["deposit","withdraw","sort","move","junk_all"]: return {"applied":false,"reason":"unknown_action"}
 var bag_before: Array=bag.duplicate(); var store_before: Array=store.duplicate(); var selection: Variant=inv.get("selected")
 var items: Array=[]
 for it in bag+store: items.append({"ref":it,"fields":it.duplicate()})
 match action:
  "junk_all":
   for i in Query.filtered_indices(bag,filter,category):
    if not bag[i].get("fav",false):bag[i].junk=true
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

func _compare_differences(item: Dictionary,worn: Dictionary) -> void:
 # Original _invCompareStats G49875–49944; raw base values, lower cost is better.
 var overlay:=Surface.panel(detail,Rect2(18,100,444,650),Color("101315"),Color("756342"))
 var scroll:=ScrollContainer.new();scroll.position=Vector2(12,12);scroll.size=Vector2(420,626);overlay.add_child(scroll)
 var content:=Control.new();content.custom_minimum_size=Vector2(400,100);scroll.add_child(content)
 Surface.text(content,"베이스 스탯 비교 (강화 수치 제외)",Rect2(0,0,400,30),12,Color("a99c85"))
 var fields: Array=[["atk","ATK"],["def","DEF"],["spd","SPD"],["wStCost","ST소모"],["wRange","무기사거리"],["wArcW","공격범위"],["wStagger","무기경직"],["bowSpd","발사속도"],["bowRange","활사거리"],["bowPierce","관통확률"],["bonusSt","ST총량"],["charge","돌진력"],["chargeDist","돌진거리"],["bonusChargeDist","돌진거리+"],["chargeW","돌진폭"],["chargeAoE","광역범위"],["chargeCharge","돌진충전"],["stagger","경직력"],["blockRate","블록율"],["shieldWt","무게"],["splashR","스플래시범위"],["splashMul","스플래시배율"],["magicPen","마법관통"],["bonusRange","사거리+"],["stRegen","ST회복"],["mpRegen","MP회복"],["bStr","STR"],["bDex","DEX"],["bInt","INT"],["atkSpd","공격속도"],["potCd","물약쿨감"],["bonusHp","추가HP"],["expBonus","경험치보너스"],["critRate","치명률"],["critDmg","치명뎀"],["beamDmg","마법DP"],["bonusChargeStock","돌진충전+"],["eDef","에너지방어"],["ancPow","전대위력"]]
 var y:=40.0
 for field in fields:
  var k: String=field[0];var delta: float=Query.number(item.get(k,0))-Query.number(worn.get(k,0))
  if absf(delta)<=.0001:continue
  var good: bool=delta<0 if k in ["wStCost","shieldWt","potCd"] else delta>0
  Surface.text(content,str(field[1])+": "+("+" if delta>0 else "")+(str(int(delta)) if delta==int(delta) else "%.3f"%delta),Rect2(0,y,400,25),13,Color("44cc44" if good else "cc4444"));y+=26
 content.custom_minimum_size.y=y+20
