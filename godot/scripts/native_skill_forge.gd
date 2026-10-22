extends Control
## Web SkillForge: skill-forge.js:18–316 / skill-forge.css. Event driven, no combat owner.
const Surface=preload("res://scripts/native_parity_ui_surface.gd")
const Catalog=preload("res://port_modules/skill_management_source/catalog.gd")
const Slots=preload("res://port_modules/skill_management_source/slot_rules.gd")
const Rules=preload("res://port_modules/skill_management_source/fusion_rules.gd")
const Support=preload("res://port_modules/skill_management_source/core_support.gd")
const Pairs=preload("res://port_modules/fusion_star_source/producer.gd")
var main: Node
var inventory: Control
var stage: Control
var selected_slot:=6
var selected_skill: String=""
var staged: Array=[]
var old_pause:=false
var snapshot: Dictionary={}
var icons: Dictionary={}
var icon_paths: Dictionary={}
var serial:=0
var last: Dictionary={}
var disc_shader: Shader
var rune_shader: Shader
var levelup_voice: AudioStreamPlayer
var feedback_seen: Dictionary={}
var feedback_toast: Control
var feedback_tween: Tween
func configure(owner: Node,inv: Control) -> void:
 main=owner;inventory=inv;process_mode=Node.PROCESS_MODE_ALWAYS
 size=Vector2(1920,1080);mouse_filter=Control.MOUSE_FILTER_STOP
 disc_shader=Shader.new();disc_shader.code=FileAccess.get_file_as_string("res://shaders/skill_forge_disc.gdshader")
 rune_shader=Shader.new();rune_shader.code=FileAccess.get_file_as_string("res://shaders/skill_forge_sigil.gdshader")
 # File manifest is fixed at build time. Textures load on UI events only.
 icon_paths=JSON.parse_string(FileAccess.get_file_as_string("res://data/parity_ui_03_assets.json")).paths
 levelup_voice=AudioStreamPlayer.new();levelup_voice.stream=preload("res://assets/ui/parity_skill_01/levelup.wav");add_child(levelup_voice)
 feedback_toast=preload("res://scripts/parity_hud_toast.gd").new();feedback_toast.position=Vector2(0,858);feedback_toast.size=Vector2(1920,42);feedback_toast.mouse_filter=Control.MOUSE_FILTER_IGNORE;feedback_toast.z_index=100;add_child(feedback_toast)
 hide()
func _input(event: InputEvent) -> void:
 if not event is InputEventKey or not event.pressed or event.echo:return
 var key: int=event.physical_keycode if event.physical_keycode else event.keycode
 if key==KEY_K:
  if visible:close_panel()
  else:open_panel()
  get_viewport().set_input_as_handled()
 elif visible and key==KEY_ESCAPE:
  close_panel();get_viewport().set_input_as_handled()
 elif visible and key==KEY_TAB:
  close_panel();inventory.open_panel();get_viewport().set_input_as_handled()
func open_panel() -> bool:
 var intro: Node=main.source_intro_sequence
 if is_instance_valid(intro) and intro.get_snapshot().get("phase")=="guide":return false
 if inventory.visible:inventory.close_panel()
 snapshot=main.read_native_skill_management()
 if snapshot.is_empty():return false
 old_pause=get_tree().paused;get_tree().paused=true;show();render();return true
func close_panel() -> void:
 hide();get_tree().paused=old_pause
 if is_instance_valid(stage):remove_child(stage);stage.queue_free();stage=null
 icons.clear()
func _exit_tree() -> void:
 if visible and is_inside_tree():get_tree().paused=old_pause
func skill_name(id: String) -> String:
 var sk: Dictionary=Catalog.read_skill(id)
 if sk.get("found",false):return str(sk.value.name)
 for d in Catalog.SLOT_DEFINITIONS.values():
  if d.get("info",{}).has(id):return str(d.info[id].name)
 return id
func skill_desc(id: String) -> String:
 var sk: Dictionary=Catalog.read_skill(id)
 if sk.get("found",false):return str(sk.value.get("desc","") if TranslationServer.get_locale().begins_with("ko") else sk.value.get("descEn",sk.value.get("desc","")))
 for d in Catalog.SLOT_DEFINITIONS.values():
  if d.get("info",{}).has(id):return str(d.info[id].get("desc","") if TranslationServer.get_locale().begins_with("ko") else d.info[id].get("descEn",d.info[id].get("desc","")))
 return ""
func level(id: String) -> int:return int(snapshot.p.skills.get(id,0))
func slot_value(i: int) -> String:
 var r: Dictionary=Slots.slot_value(Slots.SLOTS[i].k,snapshot.p,snapshot.slots,snapshot.ultimate)
 return str(r.value) if r.get("value")!=null else ""
func host_of(key: String) -> String:return "omniBeam" if key=="elemFuse" else str(Pairs.FUSE_PAIRS[key][0])
func group_key(id: String) -> String:
 var best: String="";var n:=0
 for key in Pairs.FUSE_PAIRS:
  var members: Array=Pairs.FUSE_PAIRS[key]
  if snapshot.p._fused.get(key,false) and id in members and members.size()>n:best=key;n=members.size()
 return best
func group(id: String) -> Array:
 var key: String=group_key(id)
 return Pairs.FUSE_PAIRS[key].duplicate() if not key.is_empty() else [id]
func display_name(id: String) -> String:
 var key: String=group_key(id)
 return str(Rules.fusion_names(key).value.get("ko",skill_name(id))) if not key.is_empty() and host_of(key)==id else skill_name(id)
func model() -> Dictionary:
 var h: String=slot_value(selected_slot)
 if selected_slot==8 and level("chargeBoost")>=1:h="chargeBoost"
 var keys: Array=[];var cands: Array=[];var combined: Array=group(h) if not h.is_empty() else []
 for id in staged:
  if id not in combined:combined.append(id)
 for key in Pairs.FUSE_PAIRS:
  if host_of(key)==h:keys.append(key)
 keys.sort_custom(func(a,b):return Pairs.FUSE_PAIRS[a].size()<Pairs.FUSE_PAIRS[b].size())
 var ready: String=""
 for key in keys:
  var members: Array=Pairs.FUSE_PAIRS[key]
  if snapshot.p._fused.get(key,false):continue
  if members.size()==combined.size() and combined.all(func(id):return id in members):ready=key
  for id in members:
   if id in combined or cands.any(func(c):return c.id==id):continue
   cands.append({"id":id,"ok":combined.all(func(sid):return sid in members),"learned":level(id)>0,"demo":key not in Rules.DEMO_ALLOWED})
 return {"host":h,"set":combined,"keys":keys,"cands":cands,"ready":ready}
func text(value: String,rect: Rect2,px: int=13,color:=Color("dfd6c2"),title: bool=false) -> Label:
 return Surface.text(stage,value,rect,px,color,"hell_title" if title else "hell")
func action(value: String,rect: Rect2,callback: Callable,enabled:=true) -> Button:
 var b:=Button.new();b.text=Surface.I18N.text(value);b.position=rect.position;b.size=rect.size;b.disabled=not enabled
 b.add_theme_font_override("font",Surface.Fonts.stack("hell"));b.add_theme_font_size_override("font_size",13)
 var box:=StyleBoxFlat.new();box.bg_color=Color("201813");box.border_color=Color("6b5843");box.set_border_width_all(1);b.add_theme_stylebox_override("normal",box);b.add_theme_stylebox_override("disabled",box);b.modulate.a=1 if enabled else .42
 if value in ["습득","강화 +"]:
  var fire: StyleBoxFlat=box.duplicate();fire.bg_color=Color("6e2418");fire.border_color=Color("a34d3f");b.add_theme_stylebox_override("normal",fire);b.add_theme_stylebox_override("disabled",fire);b.add_theme_color_override("font_color",Color("fff0df"));b.add_theme_color_override("font_disabled_color",Color("b8ada7"))
  if not enabled:fire.bg_color=Color("382b29");fire.border_color=Color("59463e")
 stage.add_child(b);b.pressed.connect(callback);return b
class DropButton extends Button:
 var forge: Control
 var skill_id: String=""
 var slot_index: int=-1
 var altar:=false
 func _get_drag_data(_at: Vector2) -> Variant:
  if skill_id.is_empty():return null
  var preview:=TextureRect.new();preview.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;preview.texture=forge.icon_for(skill_id);preview.custom_minimum_size=Vector2(56,56);set_drag_preview(preview)
  return {"forge":forge,"skill":skill_id}
 func _can_drop_data(_at: Vector2,data: Variant) -> bool:
  if not data is Dictionary or data.get("forge")!=forge:return false
  if altar:return forge.model().cands.any(func(c):return c.id==data.skill and c.ok and c.learned and not c.demo)
  return slot_index>=0 and Slots.can_equip(Slots.SLOTS[slot_index].k,data.skill,forge.snapshot.p).get("value",false)
 func _drop_data(_at: Vector2,data: Variant) -> void:
  if altar:forge.place_material(data.skill)
  else:forge.equip(slot_index,data.skill)
class Halo extends Control:
 var radius:=35.0
 func _draw() -> void:
  for i in range(18,0,-1):
   draw_arc(size/2,radius+i,0,TAU,96,Color(.925,.475,.345,.025*(1.0-i/19.0)),2,true)
  draw_arc(size/2,radius+1,0,TAU,96,Color("ec795855"),2,true)
func disc(id: String,rect: Rect2,selected: bool=false,parent: Node=null) -> TextureRect:
 var icon: Texture2D=icon_for(id)
 if selected:
  var halo:=Halo.new();halo.position=rect.position-Vector2.ONE*18;halo.size=rect.size+Vector2.ONE*36;halo.radius=rect.size.x*.5;halo.mouse_filter=Control.MOUSE_FILTER_IGNORE;(stage if parent==null else parent).add_child(halo)
 var n:=TextureRect.new();n.position=rect.position;n.size=rect.size;n.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;n.texture=icon if icon!=null else load("res://assets/ui/parity_ui_03/sigil.png");n.mouse_filter=Control.MOUSE_FILTER_IGNORE;n.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;n.texture_repeat=CanvasItem.TEXTURE_REPEAT_DISABLED
 var mat:=ShaderMaterial.new();mat.shader=disc_shader;mat.set_shader_parameter("selected",1.0 if selected else 0.0);mat.set_shader_parameter("has_icon",icon!=null);mat.set_shader_parameter("glass_veil",.32 if parent!=null or selected else 0.0);n.material=mat
 (stage if parent==null else parent).add_child(n);return n
func render() -> void:
 snapshot=main.read_native_skill_management()
 if is_instance_valid(stage):remove_child(stage);stage.queue_free()
 stage=Control.new();stage.size=size;add_child(stage)
 Surface.panel(stage,Rect2(0,0,1920,1080),Color(0,0,0,.7))
 Surface.iron(stage,Rect2(12,12,1896,1056),Color("171719ee"),Color("080b0df5"))
 var backdrop_clip:=Control.new();backdrop_clip.position=Vector2(12,12);backdrop_clip.size=Vector2(1896,1056);backdrop_clip.clip_contents=true;backdrop_clip.mouse_filter=Control.MOUSE_FILTER_IGNORE;stage.add_child(backdrop_clip)
 var background_sigil:=TextureRect.new();background_sigil.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;background_sigil.texture=load("res://assets/ui/parity_ui_03/sigil.png");background_sigil.position=Vector2(638,-150);background_sigil.size=Vector2.ONE*620;background_sigil.modulate.a=.15;background_sigil.mouse_filter=Control.MOUSE_FILTER_IGNORE;backdrop_clip.add_child(background_sigil)
 Surface.frame(stage,Rect2(12,12,1896,1056),60,true)
 for i in 5:
  Surface.button(stage,["설정 [ESC]","인벤토리 [TAB]","대장간 [G]","스킬 [K]","능력치 [J]"][i],Rect2(36+i*369.6,26,367.6,32),func():navigate(i),i==3)
 var header_clip:=Control.new();header_clip.position=Vector2(819.6,79);header_clip.size=Vector2(280.8,71.76);header_clip.clip_contents=true;header_clip.mouse_filter=Control.MOUSE_FILTER_IGNORE;stage.add_child(header_clip)
 var header:=TextureRect.new();header.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;header.texture=load("res://assets/ui/parity_ui_03/header.png");header.position=Vector2(0,-70.2);header.size=Vector2(280.8,280.8);header.mouse_filter=Control.MOUSE_FILTER_IGNORE;header_clip.add_child(header)
 var title_plate:=TitlePlate.new();title_plate.image=Surface.texture("img/ui/iron_covenant_20260924/button.webp");title_plate.position=Vector2(819.6,150.76);title_plate.size=Vector2(280.8,49.92);title_plate.mouse_filter=Control.MOUSE_FILTER_IGNORE;stage.add_child(title_plate)
 text("전투 스킬",Rect2(819.6,155,280.8,34),19,Color("f7e7bb"),true).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 Surface.panel(stage,Rect2(36,212.47,1848,792.53),Color("0b0809"),Color("3b332c"))
 var fire_back:=ColorRect.new();fire_back.position=Vector2(37,213.47);fire_back.size=Vector2(1846,790.53);fire_back.mouse_filter=Control.MOUSE_FILTER_IGNORE
 var back_material:=ShaderMaterial.new();back_material.shader=preload("res://shaders/parity_ui_06_forge_back.gdshader");fire_back.material=back_material;stage.add_child(fire_back)
 # 13 slots: CSS width92 / gap14, centered at1920.
 for i in 13:
  var x: float=278+i*106;var id: String=slot_value(i)
  var b:=DropButton.new();b.forge=self;b.slot_index=i;b.position=Vector2(x,229.47);b.size=Vector2(92,105);stage.add_child(b)
  for state in ["normal","hover","pressed","focus"]:b.add_theme_stylebox_override(state,StyleBoxEmpty.new())
  disc(id,Rect2(8.9,-4.1,74.2,74.2) if i==selected_slot else Rect2(11,0,70,70),i==selected_slot,b)
  b.pressed.connect(func():selected_slot=i;staged=[];selected_skill="";render())
  var key:=Surface.text(b,Slots.SLOTS[i].k,Rect2(0,73,92,14),11,Color("c9a663"),"hell_title");key.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  var name_label:=Surface.text(b,display_name(id) if not id.is_empty() else "비어 있음",Rect2(0,89,92,15),11,Color("b9ab92"),"hell");name_label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;name_label.clip_text=true
 var m: Dictionary=model()
 Surface.panel(stage,Rect2(51,339.11,330,564.89),Color("140f0edb"),Color("a4937380"));Surface.panel(stage,Rect2(1539,339.11,330,564.89),Color("140f0edb"),Color("a4937380"))
 render_altar(m);render_info(m);render_road(m);render_tray(m)
 Surface.button(stage,"일괄 레벨업",Rect2(927,1022,106,32),func():manage("batch",""))
 Surface.button(stage,"추천 자동",Rect2(1041,1022,94,32),func():manage("recommend",""))
 Surface.button(stage,"닫기 [ESC]",Rect2(813,1022,106,32),close_panel)
func navigate(i: int) -> void:
 close_panel()
 if i==1:inventory.open_panel()
 elif i!=3:inventory._navigate([KEY_ESCAPE,KEY_TAB,KEY_G,KEY_K,KEY_J][i])
func render_altar(m: Dictionary) -> void:
 # JS renderAltar geometry; CSS mid width1122, H554, TOP10 BOT78.
 var W:=1134.0;var H:=564.89;var cy:=10+(H-88)/2;var R:=minf(W*.3,(H-88)*.4);var node_size:=minf(92,R*.56);R=minf(R,(H-88)/2-node_size/2-16)
 var cx:=960.0;cy+=339.11
 var plate:=TextureRect.new();plate.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;plate.texture=preload("res://assets/ui/parity_skill_01/altar.png");var radius: float=maxf(R*1.32,R+node_size*.65);radius*=1024.0/792.0;plate.position=Vector2(cx-radius,cy-radius);plate.size=Vector2.ONE*radius*2;plate.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;plate.mouse_filter=Control.MOUSE_FILTER_IGNORE
 var mat:=ShaderMaterial.new();mat.shader=rune_shader;plate.material=mat;stage.add_child(plate);plate.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;plate.texture_repeat=CanvasItem.TEXTURE_REPEAT_DISABLED
 var core_size: float=maxf(48,minf(150,minf(R*1.02,(R-node_size/2)*1.3)))
 if not m.host.is_empty():disc(m.host,Rect2(cx-core_size/2,cy-core_size/2,core_size,core_size),true)
 if not m.host.is_empty():
  var glow:=ColorRect.new();glow.position=Vector2(cx,cy)-Vector2.ONE*core_size;glow.size=Vector2.ONE*core_size*2;glow.mouse_filter=Control.MOUSE_FILTER_IGNORE
  var gm:=ShaderMaterial.new();gm.shader=preload("res://shaders/parity_ui_06_core_glow.gdshader");glow.material=gm;stage.add_child(glow)
 text(display_name(m.host) if not m.host.is_empty() else "슬롯이 비어 있습니다",Rect2(407,349.11,460,42),22,Color("dfd6c2"),true)
 var ring: Array=m.set if m.set.size()>1 else []
 var ghost: bool=m.cands.any(func(c):return c.ok and c.learned and not c.demo) and m.set.size()<10
 var n: int=ring.size()+(1 if ghost else 0)
 for i in n:
  var a: float=-PI/2+i*TAU/n;var pos:=Vector2(cx,cy)+Vector2(cos(a),sin(a))*R
  if i<ring.size():
   disc(ring[i],Rect2(pos-Vector2.ONE*node_size/2,Vector2.ONE*node_size));text(skill_name(ring[i]),Rect2(pos+Vector2(-90,node_size/2+3),Vector2(180,22)),12).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  else:text("+",Rect2(pos-Vector2(25,25),Vector2(50,50)),28).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 var drop:=DropButton.new();drop.forge=self;drop.altar=true;drop.position=Vector2(393,339.11);drop.size=Vector2(W,H-78);stage.add_child(drop)
 for state in ["normal","hover","pressed","focus"]:drop.add_theme_stylebox_override(state,StyleBoxEmpty.new())
 var hint: String=""
 if m.host.is_empty():hint="아래에서 스킬을 끌어 위의 슬롯에 넣으세요"
 elif not m.ready.is_empty():hint="레시피 완성 — 합성할 수 있습니다"
 elif ghost:hint="빛나는 재료를 끌어 제단에 넣으면 합성됩니다"
 elif m.keys.is_empty():hint="이 스킬은 합성 계열이 없습니다"
 else:hint="합성할 재료를 먼저 습득하세요"
 text(hint,Rect2(440,834,1040,28),13).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 if not staged.is_empty():action("대기 비우기",Rect2(915,835,90,32),func():staged=[];render())
func render_info(m: Dictionary) -> void:
 var id: String=selected_skill if not selected_skill.is_empty() else m.host
 if id.is_empty():text("스킬을 고르면 정보가 표시됩니다",Rect2(66,360,298,25),12,Color("7d7264"));return
 disc(id,Rect2(66,354.11,64,64));text(display_name(id),Rect2(142,366.31,215,26),18,Color("dfd6c2"),true)
 var sk: Dictionary=Catalog.read_skill(id);var lv: int=level(id)
 if sk.get("found",false):text("Lv %d / 20"%lv,Rect2(142,390.91,215,20),12,Color("c9a663"))
 var desc:=text(skill_desc(id),Rect2(66,439.11,300,65),13,Color("d8ccb8"));desc.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;desc.set_deferred("size",Vector2(300,65))
 if sk.get("found",false):
  var cost: int=int(sk.value.get("spCost",0) if lv==0 else Support.COST.skill_up_sp_cost(lv).value)
  text(Surface.I18N.text("습득 " if lv==0 else "강화 ")+"SP "+str(cost),Rect2(66,513.42,298,24),12,Color("b9ab92"))
  action("습득" if lv==0 else "강화 +",Rect2(66,538.42,67,34),func():manage("learn_up",id),snapshot.p.sp>=cost and (lv==0 or lv<1+int(snapshot.p.lv/50)))
  if lv>0 and lv>=1+int(snapshot.p.lv/50) and lv<20:
   text("Lv"+str((1+int(snapshot.p.lv/50))*50)+Surface.I18N.text(" 도달 시 해금"),Rect2(190,513.42,175,24),12,Color("e3a16f"))
  if lv>0:
   action("강화 −",Rect2(139,538.42,65,34),func():manage("minus",id),lv>1)
   action("리셋",Rect2(210,538.42,55,34),func():confirm_reset(id))
 var allowed: Dictionary=Slots.can_equip(Slots.SLOTS[selected_slot].k,id,snapshot.p)
 if slot_value(selected_slot)!=id and allowed.get("value",false):action(Surface.I18N.text("이 슬롯에 장착")+" ["+Slots.SLOTS[selected_slot].k+"]",Rect2(72,651,285,32),func():equip(selected_slot,id))
 if m.cands.any(func(c):return c.id==id and c.ok and c.learned and not c.demo):action("제단에 넣기",Rect2(72,692,285,32),func():place_material(id))
 text("SP %d  ·  악의 %s  ·  LV %d"%[snapshot.p.sp,str(int(snapshot.g.mats)),snapshot.p.lv],Rect2(66,584.42,298,30),12,Color("b9ab92"),true)
func confirm_reset(id: String) -> void:
 var dialog:=ConfirmationDialog.new();dialog.dialog_text=skill_name(id)+" 리셋";dialog.confirmed.connect(func():manage("reset",id,true));stage.add_child(dialog);dialog.popup_centered()
func manage(kind: String,id: String,confirmed:=false) -> void:
 serial+=1
 var request_id: String="forge-"+str(get_instance_id())+"-"+str(serial)
 if kind=="batch":last=main.request_skill_batch_level_up(request_id)
 elif kind=="recommend":last=main.request_skill_recommend_auto(request_id)
 else:last=main.request_native_skill_management({"request_id":request_id,"action":kind,"skill_id":id,"confirmed":confirmed})
 present_feedback(request_id,last.get("source_feedback",{}))
 if last.get("committed",false):last["persistence"]=main.save_native_demo11_current();last.saved=last.persistence.get("committed",false)
 render()
func equip(i: int,id: String) -> void:
 last=main.source_state.commit_native_skill_forge_slot(main,Slots.SLOTS[i].k,id)
 if last.get("committed",false):staged=[];last["persistence"]=main.save_native_demo11_current();last.saved=last.persistence.get("committed",false)
 selected_slot=i;render()
func place_material(id: String) -> void:
 for member in group(id):
  if member not in staged:staged.append(member)
 render()
 var m: Dictionary=model()
 if not m.ready.is_empty():
  var d:=ConfirmationDialog.new();d.dialog_text=skill_name(m.host)+" 합성\n"+" + ".join(m.set)+"\nSP -"+str(Support.star(m.ready)*3);d.confirmed.connect(func():manage("fuse",m.ready,true);staged=[];render());stage.add_child(d);d.popup_centered()
func render_road(m: Dictionary) -> void:
 text("합성 로드맵",Rect2(1554,354.11,298,32),16,Color("dfd6c2"),true)
 if m.keys.is_empty():text("이 스킬은 합성 계열이 없습니다",Rect2(1554,397,298,30),12,Color("7d7264"));return
 var y:=385.0
 for key in m.keys:
  var live: Dictionary=main.read_native_skill_fusion(key)
  var hidden: bool=Catalog.GEM_METADATA.get(key,{}).get("hidden",false) and not snapshot.p._fused.get(key,false) and not live.get("value",{}).get("rule_allowed",false)
  var name_text: String="???" if hidden else str(live.get("value",{}).get("names",{}).get("ko",key))
  Surface.panel(stage,Rect2(1548,y,298,80),Color("ffffff06"),Color("5a4b3c"))
  text("★".repeat(int(Support.star(key))),Rect2(1558,y+8,85,20),11,Color("c9a663"))
  text(name_text,Rect2(1642,y+8,200,22),13)
  text("완성" if snapshot.p._fused.get(key,false) else ("정식판" if key not in Rules.DEMO_ALLOWED else "재료 부족"),Rect2(1724,y+31,112,20),11,Color("b9ab92"))
  if not hidden:
   for j in Pairs.FUSE_PAIRS[key].size():disc(Pairs.FUSE_PAIRS[key][j],Rect2(1558+j*28,y+44,24,24))
  y+=86
func render_tray(m: Dictionary) -> void:
 Surface.panel(stage,Rect2(51,912,1818,80),Color("120d0ceb"),Color("a4937380"))
 text(Surface.I18N.text("넣을 수 있는 스킬")+"  ["+Slots.SLOTS[selected_slot].k+"]",Rect2(64,926.66,220,24),14,Color("dfd6c2"),true)
 var tray_hint:=text("끌어서 위 슬롯에 장착 · 빛나는 재료는 제단으로",Rect2(64,947.66,220,35),11,Color("7d7264"));tray_hint.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;tray_hint.set_deferred("size",Vector2(220,35))
 var eligible: Dictionary=Slots.slot_eligible(Slots.SLOTS[selected_slot].k,snapshot.p)
 var ids: Array=eligible.get("value",[])
 var scroll:=ScrollContainer.new();scroll.position=Vector2(310,929);scroll.size=Vector2(1000,78);scroll.vertical_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;stage.add_child(scroll)
 var row:=HBoxContainer.new();row.add_theme_constant_override("separation",8);scroll.add_child(row)
 text("장착",Rect2(292,943,40,30),12,Color("c9a663"))
 for id in ids:chip(row,id)
 text("합성 재료",Rect2(1590,943,120,30),12,Color("c9a663"))
 var materials:=ScrollContainer.new();materials.position=Vector2(1670,927.5);materials.size=Vector2(180,58);materials.vertical_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;stage.add_child(materials)
 var mr:=HBoxContainer.new();mr.add_theme_constant_override("separation",8);materials.add_child(mr)
 if m.cands.is_empty():
  text("이 모체로 합성할 재료가 없습니다" if not m.host.is_empty() else "모체 스킬을 먼저 장착하세요",Rect2(1670,943,180,30),11,Color("7d7264"))
 for c in m.cands:chip(mr,c.id)
func chip(parent: Node,id: String) -> void:
 var b:=DropButton.new();b.forge=self;b.skill_id=id;b.custom_minimum_size=Vector2(170,55);parent.add_child(b)
 var style:=StyleBoxFlat.new();style.bg_color=Color("241c18");style.border_color=Color("4d4136");style.set_border_width_all(1);style.set_corner_radius_all(28);style.border_color=Color("ff9b4a") if id==slot_value(selected_slot) or id==selected_skill else style.border_color;b.add_theme_stylebox_override("normal",style)
 disc(id,Rect2(5,7,36,36),false,b)
 Surface.text(b,skill_name(id),Rect2(49,7,114,22),13,Color("dfd6c2"),"hell").clip_text=true
 Surface.text(b,("Lv "+str(level(id))) if level(id)>0 else ("미습득" if Catalog.read_skill(id).get("found",false) else ""),Rect2(49,29,114,18),11,Color("b9ab92"),"hell")
 b.pressed.connect(func():selected_skill=id;render())

func icon_for(id: String) -> Texture2D:
 # Source _skFuseIcon G44119–44134, priority is the same as the web.
 var groups: Dictionary={"maliceStorm":["elecRepent","boneStorm"],"maliceHunt":["plagueFuse","bladeFuse"],"maliceMortar":["iceMortar"],"maliceSwipe":["shieldFuse"],"darkPillar":["pillarSpike"],"giantSlam2":["infernoSlam","pillarSlam"],"holyDome":["holyWeak4","holyWeak3","holyWeak2","holyWeak1","holyIce","holyFuse"],"ghostXbowTurret":["siegeGhost"],"voidScarecrow":["dualScarecrow"],"bladeDash":["thunderGhost"],"timeWarp":["timeStep"]}
 var resolved: String=id
 for key in groups.get(id,[]):
  if snapshot.p._fused.get(key,false):resolved=key;break
 var mapping: Variant=Catalog.ICONS.get(resolved)
 if mapping is String:resolved=mapping
 if not icon_paths.has(resolved):return null
 if not icons.has(resolved):icons[resolved]=load(icon_paths[resolved])
 return icons[resolved]

class TitlePlate extends Control:
 var image: Texture2D
 func _draw() -> void:
  # ui-refinement.css:1366: source28/72, destination8/20, filled center.
  var ts: Vector2=image.get_size();var sx: Array=[0.0,72.0,ts.x-72,ts.x];var sy: Array=[0.0,28.0,ts.y-28,ts.y]
  var dx: Array=[0.0,20.0,size.x-20,size.x];var dy: Array=[0.0,8.0,size.y-8,size.y]
  for y in 3:
   for x in 3:draw_texture_rect_region(image,Rect2(dx[x],dy[y],dx[x+1]-dx[x],dy[y+1]-dy[y]),Rect2(sx[x],sy[y],sx[x+1]-sx[x],sy[y+1]-sy[y]))

# G47228/G47320 emit into the existing world text pool, behind the paused Forge,
# just like the web canvas. No UI-local timer consumes source text life while paused.
func present_feedback(request_id: String,feedback: Dictionary) -> void:
 if feedback.is_empty() or feedback_seen.has(request_id):return
 feedback_seen[request_id]=true
 var message: String=str(feedback.get("ko","") if TranslationServer.get_locale().begins_with("ko") else feedback.get("en",""))
 if feedback.kind=="showPH":
  feedback_toast.text=message;feedback_toast.ink=Color(feedback.color);feedback_toast.modulate.a=1
  if feedback_tween!=null:feedback_tween.kill()
  feedback_tween=create_tween();feedback_tween.tween_interval(.5);feedback_tween.tween_property(feedback_toast,"modulate:a",0.,.1)
 else:
  var adapter: Node=main.world.get_node_or_null("NativeFloatingText")
  if is_instance_valid(adapter):adapter.emit_native_text(main.player.global_position.x,main.player.global_position.y+float(feedback.dy),message,feedback.color,feedback.life)
  var settings: Dictionary=main.read_native_attack_audio_settings()
  levelup_voice.volume_linear=float(settings.get("sfx_gain",1.));levelup_voice.play()
