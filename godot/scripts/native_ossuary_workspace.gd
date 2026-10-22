extends Control
## game.html:50018–50129; inventory-oss-balance.css; DOM oracle1920×1080.
const S=preload("res://scripts/native_parity_ui_surface.gd")
const ROOT="res://assets/ui/parity_ui_03/"
var panel: Control
var chosen: String=""
var body: Control
var item_card: Control
const PARTS=["skull","torso","arms","legs"]
const NAMES=["두개골","몸통","팔","다리"]
const ROLES=["치명 · 위력","최대 HP","공격 위력","크기 · 이동속도"]
func configure(owner: Control) -> void:panel=owner;size=Vector2(1920,1080);render()
func text(value: String,rect: Rect2,px:=12,color:=Color("dfcda5"),stack: String="font") -> Label:return S.text(body,value,rect,px,color,stack)
func art(texture: Texture2D,rect: Rect2) -> TextureRect:
 var n:=TextureRect.new();n.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;n.texture=texture;n.position=rect.position;n.size=rect.size;n.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED;n.mouse_filter=Control.MOUSE_FILTER_IGNORE;body.add_child(n);return n
func render() -> void:
 if is_instance_valid(body):remove_child(body);body.queue_free()
 body=Control.new();body.size=size;add_child(body)
 var m: Dictionary=panel.model();var inv: Dictionary=m.inventory
 S.iron(body,Rect2(519,12,1389,1056),Color("171719ee"),Color("080b0df5"));S.frame(body,Rect2(519,12,1389,1056),60,true)
 for i in 5:S.button(body,["설정 [ESC]","인벤토리 [TAB]","대장간 [G]","스킬 [K]","능력치 [J]"][i],Rect2(549+i*266,48,264,39),func():panel._navigate([KEY_ESCAPE,KEY_TAB,KEY_G,KEY_K,KEY_J][i]),i==1)
 text("전투력  %d"%panel._cp(m).total,Rect2(556,100,500,28),14)
 text("악의: "+str(int(panel._state.get_ref().read_current_g().get("mats",0))),Rect2(1275,100,260,28),12)
 S.button(body,"✕",Rect2(1842,100,28,28),panel.close_panel,false,19)
 for i in 4:S.button(body,["장비","유골함","유물","보관함"][i],Rect2(549+i*332,136,330,36),func():panel.change_page(["equipment","ossuary","crystals","storage"][i]),i==1)
 S.iron(body,Rect2(549,183,421.92,856),Color("161719eb"),Color("090b0def"));S.frame(body,Rect2(549,183,421.92,856),12)
 S.button(body,"가방 (%d/%d)"%[inv.bag.filter(func(it):return it.get("slot") in ["ossuary","bonePart"]).size(),m.capacity],Rect2(565,197,390,40),func():pass)
 S.button(body,"〉 아이템 필터",Rect2(565,246,390,32),func():panel.filter_bar.visible=not panel.filter_bar.visible)
 var scroll:=ScrollContainer.new();scroll.position=Vector2(569,290);scroll.size=Vector2(382,360.5);body.add_child(scroll)
 var grid=panel.Grid.new();grid.panel=panel;grid.kind="bag";grid.cell=38;grid.columns=10;grid.rows=120;grid.custom_minimum_size=Vector2(380,4560);scroll.add_child(grid)
 for it in inv.bag:
  if it.get("slot") in ["ossuary","bonePart"] and it.get("_gx")!=null:panel._item_button(it,"bag",Rect2(float(it._gx)*38,float(it._gy)*38,73,73),grid)
 S.panel(body,Rect2(565,633,390,334),Color("101013"),Color("756342"))
 text("◇   유골함 정보",Rect2(585,805,350,40),18,Color("e0ceb0"),"hell")
 text("아이템 또는 유골에 마우스를 올려 정보를 확인하세요",Rect2(585,847,350,40),11)
 S.iron(body,Rect2(980.92,183,497.89,856),Color("161719eb"),Color("090b0def"));S.frame(body,Rect2(980.92,183,497.89,856),12)
 var count:=0
 for part in PARTS:
  if inv.ossCollect.has("iron_warlord_"+part):count+=1
 text("선대의 유골 콜렉션",Rect2(999,201,360,30),14,Color("e0ceb0"),"hell")
 text("수집 %d / 4"%count,Rect2(1394,201,75,30),11)
 var altar:=art(preload("res://assets/ui/parity_ui_03/ossuary_altar_hf_v2.png"),Rect2(1028,354,404,404));css_art(altar,.72,.7,Vector2.ONE,true)
 var oss: Variant=inv.equipped.get("ossuary")
 var center:=bare_button(Rect2(1169,489,121.5,135),func():
  if oss is Dictionary:panel.show_detail(oss,"eq"))
 center.mouse_entered.connect(func():
  if oss is Dictionary:show_item(oss))
 S.art(center,"img/ui/ossuary_socket_hf_v2.png",Rect2(-5,-8,132,151))
 var urn:=art(preload("res://assets/item_skins/ossuary_phys.png"),Rect2(1190,511,78,89));S.brighten(urn,1.2 if oss is Dictionary else .45)
 text("유골함",Rect2(1174,595,115,30),16,Color("dfcda5"),"hell").horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 for i in 4:
  var part: String=PARTS[i];var record: Dictionary=inv.ossCollect.get("iron_warlord_"+part,{})
  var pos: Vector2=[Vector2(1170.46,366.49),Vector2(1318.27,496.85),Vector2(1022.65,496.85),Vector2(1170.46,627.21)][i]
  var b:=bare_button(Rect2(pos,Vector2.ONE*118.8),func():chosen=part;render())
  var socket:=S.art(b,"img/ui/ossuary_socket_hf_v2.png",Rect2(0,0,118.8,118.8));css_art(socket,.6 if record.is_empty() else 1.0,.4,Vector2(1.25,1.12))
  var icon:=TextureRect.new();icon.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;icon.texture=load("res://assets/item_skins/bone_"+part+".png");icon.position=Vector2(33,30);icon.size=Vector2(51,51);icon.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED;icon.mouse_filter=Control.MOUSE_FILTER_IGNORE;b.add_child(icon);css_art(icon,.42 if record.is_empty() else 1.13,0.0 if record.is_empty() else 1.0,Vector2.ONE,false,.7 if record.is_empty() else 1.0)
  S.text(b,NAMES[i],Rect2(0,8,118,24),15,Color("ddceb4"),"hell").horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  S.text(b,"미수집" if record.is_empty() else str(panel.presenter.rarity_view(int(record.get("r",0))).name),Rect2(0,84,118,23),14,Color("b8ab94"),"hell").horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  b.gui_input.connect(func(event):
   if event is InputEventMouseButton and event.button_index==MOUSE_BUTTON_RIGHT and event.pressed:panel.perform("withdraw_bone",{},{"part":part}))
 text("철갑 전대",Rect2(1090,880,280,32),16,Color("e0ceb0"),"hell").horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 var state: String="소환 해금" if count==4 and oss is Dictionary else ("유골함 장착 필요" if count==4 else "유골 수집 중")
 text(state,Rect2(1245,884,220,25),10)
 var info: String="부위를 선택하면 등급과 성장 효과를 확인할 수 있습니다."
 if not chosen.is_empty():
  var i: int=PARTS.find(chosen);var record: Dictionary=inv.ossCollect.get("iron_warlord_"+chosen,{})
  var grade: String="미수집" if record.is_empty() else str(panel.presenter.rarity_view(int(record.get("r",0))).name)+" T"+str(int(record.get("t",0))+1)+" · 위력 "+str(int(record.get("r",0))+int(record.get("t",0)))
  info=NAMES[i]+" · "+grade+" — "+ROLES[i]
 text(info,Rect2(1007,924,453,32),11).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 text("유골 우클릭 또는 선택 후 해제 · 해제한 유골은 가방으로 이동",Rect2(1006,966,456,25),10).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 S.button(body,"선택 유골 해제",Rect2(1142,993,90,30),func():panel.perform("withdraw_bone",{},{"part":chosen}))
 S.button(body,"유골함 해제",Rect2(1241,993,78,30),func():
  if oss is Dictionary:panel.perform("unequip",oss,{"slot":"ossuary"}))
 S.iron(body,Rect2(1488.81,183,388.19,678.8),Color("161719eb"),Color("090b0def"));S.frame(body,Rect2(1488.81,183,388.19,678.8),12)
 text("소환 전대",Rect2(1504,194,240,32),14,Color("e0ceb0"),"hell");text("1 / 1",Rect2(1832,199,42,20),11)
 art(preload("res://assets/ui/parity_ui_03/iron_warlord_portrait.png"),Rect2(1503,227,360.19,478.72))
 text("ANCESTOR · 01",Rect2(1507,719,352,17),9)
 text("철갑 전대",Rect2(1507,735,352,32),22,Color("f0d7ad"),"hell")
 text(state,Rect2(1507,765,352,18),11)
 text("유골 수집",Rect2(1507,799,352,18),11);text("%d / 4"%count,Rect2(1829,799,45,18),11)
 S.panel(body,Rect2(1507,820,352,4),Color("060808"),Color("6a563660"));S.panel(body,Rect2(1507,820,count*88,4),Color("d6b77b"))
 text("네 부위를 모으면 전대 소환이 해금됩니다.",Rect2(1507,834,352,22),10)

func show_item(item: Dictionary) -> void:
 if is_instance_valid(item_card):item_card.queue_free()
 # Current web 1x DOM: invOssInfo / invRight / .id-stats, G49525–49606.
 item_card=S.panel(body,Rect2(565,633,390,334),Color("101013"),Color("756342"))
 var card:=S.panel(item_card,Rect2(17,13,356,308),Color("151215"),Color("756342"))
 S.panel(card,Rect2(4,4,348,3),panel.color_for(item))
 S.panel(card,Rect2(15,16,50,24),Color("211e1b"),Color("423827"))
 S.text(card,"장착 중",Rect2(23,18,80,20),10,Color("c6b48f"),"hell")
 S.text(card,panel.name_for(item),Rect2(15,46,326,27),14,Color("f0d7ad"),"hell",700)
 S.panel(card,Rect2(15,76,326,1),Color("382e27"))
 var rows: Array=panel._card_rows(item)
 for i in rows.size():
  var y:float=85+i*28
  if i%2==1:S.panel(card,Rect2(15,y-1,326,28),Color("241f1b"))
  var ink:Color=Color("b99c80")
  if str(rows[i][0])=="추가MP:":ink=Color("4488ff")
  elif str(rows[i][0])=="전대 위력:":ink=Color("88aaff")
  S.text(card,str(rows[i][0]),Rect2(21,y,290,26),11,ink,"hell")
  var value:=S.text(card,str(rows[i][1]),Rect2(21,y,308,26),11,Color("dfc69e"),"hell",700);value.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
 var y:float=85+rows.size()*28
 if item.get("_implicitKo"):
  S.text(card,"◆ "+S.I18N.text(str(item._implicitKo)).replace("X",str(item.get("_implicitVal",0))),Rect2(15,y,326,27),12,Color("aaddff"))
  y+=26;S.panel(card,Rect2(15,y,326,1),Color("334455"));y+=10
 for af in item.get("affixes",[]):
  var view: Dictionary=panel.presenter.affix_view(af)
  if view.get("ready",false):
   S.panel(card,Rect2(15,y,326,1),Color("333333"))
   S.text(card,str(view.name)+": "+str(view.description)+" "+str(view.value_text),Rect2(23,y+7,310,32),12,Color(view.color),"hell")
   y+=52
 S.panel(card,Rect2(15,256,326,1),Color("382e27"))
 S.text(card,"좌클릭: 선택 | 우클릭: 장착 | Space: 쓰레기 | F: 잠금",Rect2(23,265,310,27),10,Color("aa9980"))

func css_art(node: TextureRect,brightness: float,saturation: float,crop: Vector2,circle:=false,opacity: float=1.0) -> void:
 var shader:=Shader.new();shader.code="shader_type canvas_item;uniform float brightness=1.0;uniform float saturation=1.0;uniform vec2 crop=vec2(1.0);uniform bool circle=false;uniform float opacity=1.0;void fragment(){vec4 c=texture(TEXTURE,(UV-vec2(.5))/crop+vec2(.5));float l=dot(c.rgb,vec3(.2126,.7152,.0722));c.rgb=mix(vec3(l),c.rgb,saturation)*brightness;if(circle)c.a*=1.0-smoothstep(.44,.5,length(UV-vec2(.5)));c.a*=opacity;COLOR=c;}"
 var mat:=ShaderMaterial.new();mat.shader=shader;mat.set_shader_parameter("brightness",brightness);mat.set_shader_parameter("saturation",saturation);mat.set_shader_parameter("crop",crop);mat.set_shader_parameter("circle",circle);mat.set_shader_parameter("opacity",opacity);node.material=mat

func bare_button(rect: Rect2,callback: Callable) -> Button:
 var b:=Button.new();b.position=rect.position;b.size=rect.size
 for state in ["normal","hover","pressed","focus"]:b.add_theme_stylebox_override(state,StyleBoxEmpty.new())
 body.add_child(b);b.pressed.connect(callback);return b
