extends CanvasLayer
## DEMO11-19ui. Presentation/draft only; 19r remains the sole transaction writer.
const POINT = preload("res://scripts/native_meta_point_policy.gd")
const OWNER = preload("res://scripts/native_demo_growth_owner.gd")
const FONTS = preload("res://scripts/native_ui_fonts.gd")
const DATA_PATH := "res://data/demo_growth_ui.json"
const WORDS := {
 "title":["성장의 각인","Sigils of Ascension"],"all":["전체","All"],
 "search":["이름 · 효과 검색","Search name · effect"],"learned":["습득","Learned"],
 "planned":["변경 중","Planned"],"invest":["투자 계획","Plan investment"],
 "refund":["환불 계획","Plan refund"],"apply":["변경 적용","Apply changes"],
 "cancel":["계획 취소","Discard changes"],"reset":["전체 환불 계획","Plan full refund"],
 "close":["닫기","Close"],"queue":["예약","Queue"],"unqueue":["예약 취소","Cancel queued rank"],
 "changes":["변경 목록","Changes"],"reset_title":["모든 투자를 환불하시겠습니까?","Refund all allocations?"],
 "reset_body":["환불 계획을 만듭니다. 변경 적용 전에는 실제 능력치가 바뀌지 않습니다.","Creates a refund plan. Allocations remain unchanged until you apply."],
 "confirm":["환불 계획 만들기","Plan full refund"],"back":["돌아가기","Back"],
 "invalid":["포인트가 부족하거나 투자할 수 없습니다.","Insufficient points or allocation unavailable."],
 "stale":["능력치가 바뀌었습니다. 계획을 취소하고 다시 선택하세요.","Allocations changed. Discard the plan and try again."],
 "failed":["변경을 적용하지 못했습니다.","Could not apply changes."],
 "hint":["선택하여 계획 · 적용하여 각인","Choose your path. Apply to inscribe."],
 "queue_hint":["레벨업 시 순서대로 투자","Allocated in order on level up"],
 "current":["현재 → 계획","Current → Planned"],"limit":["최대","Maximum"],
 "legacy":["기록된 패시브","Recorded passive"],
 "empty":["예약 없음","No queued ranks"],"summary":["전투 능력치","Combat attributes"]}
var _main: WeakRef
var _data: Dictionary
var _defs: Dictionary = {}
var _atlas: Texture2D
var _plan: Dictionary = {}
var _live: Dictionary = {}
var _key := "pAtk"
var _rank := 0
var _path := "all"
var _filter := "all"
var _query := ""
var _opened := false
var _previous_pause := false
var _previous_g_pause: Variant
var _zoom := 1.0
var _last: Dictionary = {}
var _screen: Control
var _tree: Control
var _detail: VBoxContainer
var _changes: VBoxContainer
var _queue: VBoxContainer
var _points: Label
var _message: Label
var _counter: Label
var _confirm: Control
var _search: LineEdit
var _nodes: Dictionary = {}
var _captions: Dictionary = {}
var _summary: Label
var _extent: Control
var _scroll: ScrollContainer
var _apply: Button
var _source_viewport:Control
var _zoom_caption:Button
var _path_buttons:Dictionary={}
var _filter_buttons:Dictionary={}

func text(id: String) -> String:
 return WORDS[id][0 if TranslationServer.get_locale().begins_with("ko") else 1]
func localized(row: Dictionary,ko: String="ko",en: String="en") -> String:
 return str(row.get(ko,"") if TranslationServer.get_locale().begins_with("ko") else row.get(en,""))
func configure(main: Node) -> void:
 _main=weakref(main);process_mode=Node.PROCESS_MODE_ALWAYS;layer=96
 _data=JSON.parse_string(FileAccess.get_file_as_string(DATA_PATH))
 _atlas=load("res://assets/ui/demo_growth_glyphs.svg")
 for row in _data.defs:_defs[row.key]=row
func get_snapshot() -> Dictionary:
 return {"opened":_opened,"selected":_key,"rank":_rank,"plan":_plan.duplicate(true),"live":_live.duplicate(true),
 "last":_last.duplicate(true),"confirm_visible":_confirm.visible,"centers":31,"ranks":260,"zoom":_zoom,"save_committed":false}
func _ready() -> void:
 _build();_screen.hide()
func _input(event: InputEvent) -> void:
 if not event is InputEventKey or not event.pressed or event.echo:return
 if _opened and _confirm.visible and event.physical_keycode==KEY_TAB:
  var buttons: Array=_confirm.get_node("Box/Actions").get_children()
  buttons[1 if buttons[0].has_focus() else 0].grab_focus();get_viewport().set_input_as_handled();return
 if _opened and event.physical_keycode==KEY_ESCAPE:
  if _confirm.visible:_confirm.hide()
  elif _summary.visible:_summary.hide()
  else:close_panel()
  get_viewport().set_input_as_handled();return
 if _opened and not _search.has_focus() and event.physical_keycode in [KEY_G,KEY_I,KEY_K]:
  close_panel();return
 if event.physical_keycode!=KEY_J or (_opened and _search.has_focus()):return
 if _opened:close_panel()
 else:
  var main: Node=_main.get_ref()
  var g: Dictionary=main.source_state.read_current_g()
  var lesson: Dictionary=main.read_native_normal_enemy_lesson_status()
  if g.get("on")==true and not get_tree().paused and lesson.get("ready")==true and not lesson.get("active",true):open_panel()
 get_viewport().set_input_as_handled()
func open_panel() -> void:
 if _opened or get_tree().paused:return
 var main: Node=_main.get_ref()
 _live=main.read_native_growth();_plan=POINT.create_plan(_live)
 _previous_pause=get_tree().paused
 var g: Dictionary=main.source_state.read_current_g()
 _previous_g_pause=g.get("paused",false);g.paused=true;g.statOpen=true
 _opened=true;_screen.show();get_tree().paused=true
 _message.text="";_refresh()
func close_panel() -> void:
 if not _opened:return
 _opened=false;_plan={};_confirm.hide();_summary.hide();_screen.hide()
 var main: Variant=_main.get_ref()
 if is_instance_valid(main):
  var g: Dictionary=main.source_state.read_current_g();g.paused=_previous_g_pause;g.statOpen=false
 if get_tree()!=null:get_tree().paused=_previous_pause
func _exit_tree() -> void:close_panel()
func select_node(key: String,rank: int=0) -> void:
 if not _defs.has(key):return
 _key=key;_rank=rank;_refresh()
func value(plan: Dictionary,key: String) -> float:
 return float(plan.grit if key=="grit" else plan.passives.get(key,0) if key.begins_with("p") else plan.stats.get(key,0))
func evaluated() -> Variant:return POINT.evaluate_plan(_plan,_live,OWNER.CAPS,OWNER.definitions())
func draft_step(direction: int) -> bool:
 if not _opened or _confirm.visible:return false
 var candidate:=_plan.duplicate(true)
 var current:=value(candidate,_key)
 var target: float=current+direction
 if _rank>0:target=maxf(current,float(_rank)) if direction>0 else minf(current,float(_rank-1))
 if target==current:return false
 if _key=="grit":candidate.grit=target
 elif _key.begins_with("p"):candidate.passives[_key]=target
 else:candidate.stats[_key]=target
 var result: Variant=POINT.evaluate_plan(candidate,_live,OWNER.CAPS,OWNER.definitions())
 if result==null:_message.text=text("invalid");return false
 _plan=candidate;_message.text="";_refresh();return true
func discard_plan() -> void:
 _live=_main.get_ref().read_native_growth();_plan=POINT.create_plan(_live);_message.text="";_refresh()
func apply_plan() -> Dictionary:
 if not _opened or _confirm.visible:return {"applied":false}
 _last=_main.get_ref().request_native_growth({"action":"plan","plan":_plan.duplicate(true)})
 if _last.get("applied",false):discard_plan()
 else:_message.text=text("stale" if _last.get("reason")=="stale_or_empty_plan" else "failed")
 return _last.duplicate(true)
func request_reset() -> void:
 if not _opened:return
 _confirm.show();_confirm.get_node("Box/Actions/Back").grab_focus()
func confirm_reset() -> void:
 if not _confirm.visible:return
 for key in _plan.stats:_plan.stats[key]=0
 for key in _plan.passives:_plan.passives[key]=0
 _plan.grit=0;_confirm.hide();_refresh()
func change_queue(index: int=-1) -> Dictionary:
 if not _opened or _confirm.visible:return {"applied":false}
 var cmd: Dictionary={"action":"queue_cancel","index":index} if index>=0 else {"action":"queue_add","key":_key,"amount":1}
 _last=_main.get_ref().request_native_growth(cmd)
 if not _last.get("applied",false):_message.text=text("invalid")
 _live=_main.get_ref().read_native_growth();_refresh()
 return _last.duplicate(true)
func label_for(key: String) -> String:return localized(_defs[key]) if _defs.has(key) else text("legacy")
func _label(parent: Node,caption: String,size: int=18) -> Label:
 var node:=Label.new();node.text=caption;node.add_theme_font_override("font",FONTS.stack("font",700 if size>=28 else 400));node.add_theme_font_size_override("font_size",size);parent.add_child(node);return node
func _button(parent: Node,caption: String,callback: Callable) -> Button:
 var node:=Button.new();node.text=caption;node.custom_minimum_size=Vector2(0,44);node.pressed.connect(callback);parent.add_child(node)
 node.focus_entered.connect(func():
  if is_instance_valid(_confirm) and _confirm.visible and not _confirm.is_ancestor_of(node):_confirm.get_node("Box/Actions/Back").grab_focus())
 return node
func _clear(node: Node) -> void:
 for child in node.get_children():node.remove_child(child);child.queue_free()
func _style(bg: Color,border: Color) -> StyleBoxFlat:
 var s:=StyleBoxFlat.new();s.bg_color=bg;s.border_color=border;s.set_border_width_all(1);s.set_content_margin_all(10);return s
func _build() -> void:
 _screen=Control.new();add_child(_screen);_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var theme:=Theme.new();theme.default_font=FONTS.stack("font");theme.default_font_size=16
 for kind in ["Label","Button","LineEdit"]:theme.set_color("font_color",kind,Color("d5c2a2"))
 for state in ["normal","hover","pressed","focus","disabled"]:theme.set_stylebox(state,"Button",_style(Color("211b17"),Color("756247")))
 theme.set_stylebox("normal","LineEdit",_style(Color("090d0f"),Color("3a3227")))
 _screen.theme=theme
 var surface:=preload("res://scripts/native_parity_ui_surface.gd")
 surface.iron(_screen,Rect2(12,12,1896,1056),Color("171719ee"),Color("080b0df5"));surface.frame(_screen,Rect2(12,12,1896,1056),60,true)
 var sigil:=TextureRect.new();sigil.texture=preload("res://assets/ui/parity_ui_03/sigil.png");sigil.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;sigil.position=Vector2(360,-45);sigil.size=Vector2(620,620);sigil.modulate.a=.15;sigil.mouse_filter=Control.MOUSE_FILTER_IGNORE;_screen.add_child(sigil)
 for i in 5:
  var index:=i
  surface.button(_screen,["설정 [ESC]","인벤토리 [TAB]","대장간 [G]","스킬 [K]","능력치 [J]"][i],Rect2(36+i*369.6,26,367.6,40),func():_navigate_source(index),i==4,14)
 var kicker:=surface.text(_screen,surface.I18N.text("EXODUSER · 캐릭터 성장"),Rect2(0,78,1920,26),14,Color("c4b69e"),"font",700);kicker.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 var crest_clip:=Control.new();crest_clip.position=Vector2(720,100);crest_clip.size=Vector2(360,160);crest_clip.clip_contents=true;_screen.add_child(crest_clip)
 var crest:=TextureRect.new();crest.texture=preload("res://assets/ui/parity_ui_03/header.png");crest.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;crest.position=Vector2(0,-90);crest.size=Vector2(360,360);crest_clip.add_child(crest)
 surface.art(_screen,"img/ui/iron_covenant_20260924/button.webp",Rect2(720,196,360,64))
 var title:=surface.text(_screen,text("title"),Rect2(720,196,360,64),25,Color("ecd9b7"),"hell",700);title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;title.position.y+=10
 var hint:=surface.text(_screen,surface.I18N.text("힘을 벼리고, 당신의 길을 새기세요."),Rect2(520,270,760,28),16,Color("c4b69e"),"font");hint.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 surface.panel(_screen,Rect2(1777,148,98,79),Color("1c1916"),Color("756247"))
 var ap_label:=surface.text(_screen,surface.I18N.text("계획 후 AP"),Rect2(1777,156,98,24),14,Color("d5c2a2"),"font");ap_label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 _points=surface.text(_screen,"",Rect2(1777,180,98,40),30,Color("dfc6a8"),"font",700);_points.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 surface.text(_screen,surface.I18N.text("전투의 길"),Rect2(35,317,220,28),19,Color("d5c2a2"),"font",700)
 _counter=surface.text(_screen,"",Rect2(188,317,67,28),13,Color("d5c2a2"),"font");_counter.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
 _search=LineEdit.new();_search.position=Vector2(35,359);_search.size=Vector2(220,44);_search.placeholder_text=surface.I18N.text("이름 · 효과 · 영문명 검색");_search.add_theme_font_override("font",FONTS.stack("font"));_search.add_theme_font_size_override("font_size",14);_screen.add_child(_search);_search.text_changed.connect(func(value:String):_query=value.to_lower();_refresh())
 var routes:Array=[{"id":"all","ko":"전체","en":"All"}]+_data.paths
 for i in routes.size():
  var route:Dictionary=routes[i];var id:String=route.id
  var b:=surface.button(_screen,localized(route),Rect2(35,414+i*62,220,58),func():_path=id;_refresh(),i==0,14);b.alignment=HORIZONTAL_ALIGNMENT_LEFT;b.add_theme_font_override("font",FONTS.stack("font",700));_path_buttons[id]=b
  for child in b.get_children():
   if child is TextureRect:child.hide()
  if route.has("icon"):
   var glyph_index:=0
   for gi in _data.defs.size():
    if _data.defs[gi].key==route.icon:glyph_index=gi;break
   var atlas:=AtlasTexture.new();atlas.atlas=_atlas;atlas.region=Rect2(glyph_index*32,0,32,32)
   var icon:=TextureRect.new();icon.texture=atlas;icon.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;icon.position=Vector2(10,17);icon.size=Vector2(24,24);icon.mouse_filter=Control.MOUSE_FILTER_IGNORE;b.add_child(icon)
 for i in 3:
  var id:String=["all","learned","planned"][i]
  var b:=surface.button(_screen,text(id),Rect2(35+i*73,850,73,40),func():_filter=id;_refresh(),i==0,14);_filter_buttons[id]=b
  for child in b.get_children():
   if child is TextureRect:child.hide()
 var path_hint:=surface.text(_screen,surface.I18N.text("6개의 길 · 서로 조합 가능한 26개 패시브"),Rect2(35,896,220,60),13,Color("c4b69e"),"font");path_hint.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 _changes=VBoxContainer.new();_changes.hide();_screen.add_child(_changes)
 _source_viewport=surface.panel(_screen,Rect2(271,317,1174,624),Color("0b100e"),Color("57422f"));_source_viewport.clip_contents=true
 _extent=Control.new();_extent.size=Vector2(1174,624);_source_viewport.add_child(_extent)
 _tree=Control.new();_tree.size=Vector2(1000,800);_extent.add_child(_tree);_tree.draw.connect(_draw_tree)
 for node in _data.centers:_make_node(node,node.key,0)
 for node in _data.layout.nodes:_make_node(node,node.key,int(node.rank))
 _set_zoom(1)
 surface.button(_screen,surface.I18N.text("현재 전투 능력치 ↗"),Rect2(275,952,300,40),func():_summary.visible=not _summary.visible,false,14)
 surface.button(_screen,"−",Rect2(1314,952,40,40),func():_set_zoom(_zoom-.25),false,14)
 _zoom_caption=surface.button(_screen,"100%",Rect2(1354,952,50,40),func():_set_zoom(1),false,14)
 surface.button(_screen,"+",Rect2(1404,952,40,40),func():_set_zoom(_zoom+.25),false,14)
 var right:=surface.panel(_screen,Rect2(1465,317,420,674),Color("161416"),Color("756247"));surface.frame(right,Rect2(0,0,420,674),8)
 var detail_scroll:=ScrollContainer.new();detail_scroll.position=Vector2(26,20);detail_scroll.size=Vector2(368,620);right.add_child(detail_scroll)
 _detail=VBoxContainer.new();_detail.custom_minimum_size.x=355;_detail.add_theme_constant_override("separation",16);detail_scroll.add_child(_detail)
 _queue=VBoxContainer.new();_queue.hide();_screen.add_child(_queue)
 _summary=surface.text(_screen,"",Rect2(400,500,1000,150),18,Color("dfd6c2"),"font");_summary.hide()
 _message=surface.text(_screen,"",Rect2(35,1005,1360,40),14,Color("dfab96"),"font")
 surface.button(_screen,text("reset"),Rect2(1415,1004,120,44),request_reset,false,14)
 surface.button(_screen,text("cancel"),Rect2(1545,1004,96,44),discard_plan,false,14)
 _apply=surface.button(_screen,text("apply"),Rect2(1656,1004,124,44),apply_plan,false,14)
 surface.button(_screen,text("close")+" [J]",Rect2(1792,1004,88,44),close_panel,false,14)
 _confirm=Control.new();_confirm.z_index=20;_screen.add_child(_confirm);_confirm.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var dim:=ColorRect.new();dim.color=Color(0,0,0,0.88);_confirm.add_child(dim);dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var dialog_frame:=Panel.new();_confirm.add_child(dialog_frame);dialog_frame.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
 dialog_frame.offset_left=-354;dialog_frame.offset_top=-134;dialog_frame.offset_right=354;dialog_frame.offset_bottom=134
 dialog_frame.add_theme_stylebox_override("panel",_style(Color("181316"),Color("a49373")))
 var box:=VBoxContainer.new();box.name="Box";_confirm.add_child(box);box.set_anchors_and_offsets_preset(Control.PRESET_CENTER);box.offset_left=-330;box.offset_top=-110;box.offset_right=330;box.offset_bottom=110
 _label(box,text("reset_title"),30)
 var explain:=_label(box,text("reset_body"),18);explain.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;explain.custom_minimum_size=Vector2(660,76)
 var actions:=HBoxContainer.new();actions.name="Actions";box.add_child(actions)
 _button(actions,text("confirm"),confirm_reset)
 var back:=_button(actions,text("back"),func():_confirm.hide());back.name="Back"
 # Modal subtree owns keyboard focus while shown.
 _confirm.visibility_changed.connect(func():
  for button in _nodes.values():button.focus_mode=Control.FOCUS_NONE if _confirm.visible else Control.FOCUS_ALL)
 _confirm.hide()
func _make_node(row: Dictionary,key: String,rank: int) -> void:
 var b:=Button.new();var id: String=key if rank==0 else key+"@"+str(rank)
 b.name=id;b.position=Vector2(row.x,row.y)-Vector2(18,18) if rank==0 else Vector2(row.x,row.y)-Vector2(10,10)
 b.size=Vector2(44,44) if rank==0 else Vector2(10,10);b.text=key.to_upper() if rank==0 and not key.begins_with("p") else ""
 if rank==0 and key.begins_with("p"):
  var index:=0
  for i in _data.defs.size():
   if _data.defs[i].key==key:index=i;break
  var icon:=AtlasTexture.new();icon.atlas=_atlas;icon.region=Rect2(index*32,0,32,32);b.icon=icon;b.expand_icon=true
  b.add_theme_constant_override("icon_max_width",26)
 b.add_theme_font_size_override("font_size",12);b.tooltip_text=label_for(key)+( " · "+str(rank) if rank else "")
 b.pressed.connect(select_node.bind(key,rank));_tree.add_child(b);_nodes[id]=b
 if rank==0:
  b.mouse_entered.connect(func():_captions[key].show())
  b.mouse_exited.connect(func():_refresh_captions())
  b.focus_entered.connect(func():_captions[key].show())
  b.focus_exited.connect(func():_refresh_captions())
  var caption:=_label(_tree,label_for(key),16);caption.position=Vector2(row.x-75,row.y-72);caption.size.x=150;caption.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;caption.mouse_filter=Control.MOUSE_FILTER_IGNORE;caption.z_index=1
  _captions[key]=caption
func _set_zoom(amount: float) -> void:
 _zoom=clampf(amount,1,2.5)
 var scale_factor:float=minf((1174.0-12)/1000,(624.0-12)/800)*_zoom
 _tree.scale=Vector2.ONE*scale_factor;_tree.position=Vector2(587,312)-Vector2(500,400)*scale_factor
 if is_instance_valid(_zoom_caption):_zoom_caption.text=str(roundi(_zoom*100))+"%"
func _draw_tree() -> void:
 var points: Dictionary={"origin":Vector2(500,400),"spine":Vector2(500,320),"neck":Vector2(500,160),"leftShoulder":Vector2(385,245),"rightShoulder":Vector2(615,245)}
 for row in _data.centers:points[row.key]=Vector2(row.x,row.y)
 for row in _data.layout.nodes:points[row.id]=Vector2(row.x,row.y)
 for pair in [["spine","origin"],["neck","spine"],["leftShoulder","spine"],["rightShoulder","spine"]]:_tree.draw_line(points[pair[0]],points[pair[1]],Color(0.55,0.5,0.39,0.6),1,true)
 for row in _data.centers:_tree.draw_line(points[row.parent],points[row.key],Color(0.55,0.5,0.39,0.6),1,true)
 for row in _data.layout.links:_tree.draw_line(points[row.from],points[row.to],Color(0.55,0.5,0.39,0.6),1,true)
func _refresh() -> void:
 if not _opened:return
 var result: Variant=evaluated()
 _points.text=number(result.ap if result!=null else _live.ap)
 _apply.disabled=result==null or result.changes==0
 _clear(_detail)
 var ui:=preload("res://scripts/native_demo_ui_i18n.gd")
 _label(_detail,ui.text("패시브 분석"),16)
 var route_name:=""
 for route in _data.paths:
  if _key in route.keys:route_name=localized(route);break
 if not route_name.is_empty():_label(_detail,route_name,16)
 _label(_detail,label_for(_key),29)
 var level:float=value(_plan,_key);var next:float=minf(float(_defs[_key].max),level+1)
 _label(_detail,ui.text("투자 레벨")+"    "+number(level)+" / "+str(int(_defs[_key].max)),14)
 var separator:=HSeparator.new();_detail.add_child(separator)
 _label(_detail,ui.text("패시브 기여")+"                 "+ui.text("현재")+"    "+ui.text("다음"),14)
 for row in _data.effects.get(_key,[]):
  var current:=_effect(row,level);var target:=_effect(row,next)
  _label(_detail,localized(row)+"    "+number(current)+str(row.unit)+"  "+number(target)+str(row.unit),18)
  _detail.add_child(HSeparator.new())
 var desc:=_label(_detail,localized(_defs[_key],"desc","descEn"),16);desc.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;desc.custom_minimum_size.x=350
 var reserve:bool=_key.begins_with("p") and result!=null and result.ap<POINT.rank_cost(int(level))
 var caption:String=(ui.text("자동 투자 예약 · {p0} AP") if reserve else text("invest")).replace("{p0}",str(POINT.rank_cost(int(level))))
 var invest:=_button(_detail,caption,func():
  if reserve:change_queue()
  else:draft_step(1))
 invest.disabled=level>=float(_defs[_key].max)
 var refund:=_button(_detail,text("refund"),draft_step.bind(-1));refund.disabled=level<=0
 _clear(_changes)
 for row in _data.centers:
  if value(_live,row.key)!=value(_plan,row.key):
   var key: String=row.key
   _button(_changes,"%s  %s → %s" % [label_for(key),number(value(_live,key)),number(value(_plan,key))],func():_path="all";_query="";_filter="all";_search.text="";select_node(key))
 _clear(_queue)
 if _live.queue.is_empty():_label(_queue,text("empty"),16)
 for i in _live.queue.size():_button(_queue,"%d. %s · %s" % [i+1,label_for(_live.queue[i]),text("unqueue")],change_queue.bind(i))
 var count:=0
 for id in _nodes:
  var pieces: PackedStringArray=id.split("@");var key: String=pieces[0];var rank:=int(pieces[1]) if pieces.size()>1 else 0
  var shown:=_query.is_empty() or (label_for(key)+" "+str(_defs[key].ko)+" "+str(_defs[key].en)+" "+str(_defs[key].desc)+" "+str(_defs[key].descEn)+" "+key).to_lower().contains(_query)
  if _path!="all":
   var keys: Array=[]
   for route in _data.paths:
    if route.id==_path:keys=route.keys.duplicate()
   var stat_routes: Dictionary={"str":"assault","dex":"precision","int":"arcane","lck":"fate","grit":"survival"}
   shown=shown and (key in keys or stat_routes.get(key)==_path)
  if _filter=="learned":shown=shown and value(_plan,key)>=(rank if rank>0 else 1)
  elif _filter=="planned":shown=shown and ((value(_plan,key)>=rank)!=(value(_live,key)>=rank) if rank>0 else value(_plan,key)!=value(_live,key))
  _nodes[id].visible=shown
  if rank==0:_captions[key].visible=shown and _nodes[id].has_focus()
  if shown and (rank>0 or not key.begins_with("p")):count+=1
  var changed: bool=(value(_live,key)>=rank)!=(value(_plan,key)>=rank) if rank>0 else value(_live,key)!=value(_plan,key)
  var selected: bool=key==_key and rank==_rank
  var skin:=_style(Color("614a30") if rank>0 and value(_plan,key)>=rank else Color("33251e") if selected else Color("171519"),Color("f1cc88") if selected else Color("8b8064"))
  skin.set_content_margin_all(0)
  if rank>0:skin.set_corner_radius_all(5)
  elif key.begins_with("p"):skin.set_corner_radius_all(22)
  _nodes[id].add_theme_stylebox_override("normal",skin)
  _nodes[id].modulate=Color.WHITE
  skin.bg_color=Color("685032") if selected else Color("17201b")
  skin.border_color=Color("ffe0a3") if selected else Color("a49878")
  if rank==0:
   skin.set_corner_radius_all(22 if key.begins_with("p") else 6);skin.shadow_color=Color("bb9d689e");skin.shadow_size=3
  elif rank==10:
   skin.set_corner_radius_all(1);_nodes[id].pivot_offset=Vector2(5,5);_nodes[id].rotation=PI/4
 for id in _path_buttons:
  var box:=StyleBoxFlat.new();box.bg_color=Color(0.65,.5,.29,.13) if id==_path else Color.TRANSPARENT;box.border_color=Color("d99172");box.border_width_left=2 if id==_path else 0;box.content_margin_left=42
  _path_buttons[id].add_theme_stylebox_override("normal",box)
 for id in _filter_buttons:
  var box:=StyleBoxFlat.new();box.bg_color=Color.TRANSPARENT;box.border_color=Color("d99172");box.border_width_bottom=2 if id==_filter else 0
  _filter_buttons[id].add_theme_stylebox_override("normal",box)
 if _message.text.is_empty():_message.text=ui.text("AP가 부족해도 예약 가능 · 짝수 레벨업으로 AP가 모이면 순서대로 자동 투자됩니다.")
 _counter.text="%d / 265" % count
 var p: Dictionary=_main.get_ref().source_state.read_current_p()
 _summary.text="HP %s / %s    ST %s / %s    MP %s / %s" % [p.hp,p.mhp,p.st,p.mst,p.mp,p.mmp]
 _tree.queue_redraw()
func _effect(row: Dictionary,level: float) -> float:
 var amount: float=float(row.base)+float(row.per)*level
 if row.cap!=null:amount=minf(amount,float(row.cap))
 if _key=="pDemon" and row.unit=="s":amount=maxf(100,amount)
 return snappedf(amount,0.0001)

func number(amount: float) -> String:
 return str(int(amount)) if amount==floorf(amount) else ("%.4f" % amount).trim_suffix("0").trim_suffix("0").trim_suffix("0").trim_suffix(".")

func _center_major(key: String) -> bool:
 for row in _data.centers:
  if row.key==key:return bool(row.major)
 return false
func _refresh_captions() -> void:
 for key in _captions:_captions[key].visible=_nodes[key].visible and _nodes[key].has_focus()

func _navigate_source(index:int) -> void:
 if index==4:return
 close_panel()
 var main:Node=_main.get_ref()
 if index==0:main._toggle_pause()
 elif index==1:main.source_inventory_ui.open_panel()
 elif index==2:main.source_forge.open_panel()
 elif index==3:main.source_inventory_ui.skill_forge.open_panel()
