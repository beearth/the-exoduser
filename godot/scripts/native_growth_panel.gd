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
 "cancel":["계획 취소","Discard changes"],"reset":["전체 환불","Refund all"],
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
var _key := "str"
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
 var node:=Label.new();node.text=caption;node.add_theme_font_size_override("font_size",size);parent.add_child(node);return node
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
 var theme:=Theme.new();theme.default_font=FONTS.stack("hell",700);theme.default_font_size=18
 for type in ["Label","Button","LineEdit","OptionButton"]:theme.set_color("font_color",type,Color("dfd6c2"))
 for state in ["normal","hover","pressed","focus","disabled"]:
  theme.set_stylebox(state,"Button",_style(Color("231c1b") if state!="hover" else Color("47342c"),Color("75634a") if state!="focus" else Color("dfc08a")))
 theme.set_stylebox("normal","LineEdit",_style(Color("131213"),Color("75634a")))
 _screen.theme=theme
 var shade:=ColorRect.new();shade.color=Color(0.015,0.01,0.015,0.97);_screen.add_child(shade);shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var frame:=PanelContainer.new();_screen.add_child(frame);frame.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);frame.offset_left=8;frame.offset_top=8;frame.offset_right=-8;frame.offset_bottom=-8
 frame.add_theme_stylebox_override("panel",_style(Color("121114"),Color("a49373")))
 var body:=VBoxContainer.new();body.add_theme_constant_override("separation",12);frame.add_child(body)
 var head:=HBoxContainer.new();body.add_child(head)
 var title:=_label(head,text("title"),38);title.size_flags_horizontal=Control.SIZE_EXPAND_FILL
 _points=_label(head,"",30)
 _button(head,text("summary"),func():_summary.visible=not _summary.visible)
 _button(head,text("close")+"  [J]",close_panel)
 _label(body,text("hint"),16)
 var columns:=HBoxContainer.new();columns.size_flags_vertical=Control.SIZE_EXPAND_FILL;columns.add_theme_constant_override("separation",16);body.add_child(columns)
 var left:=VBoxContainer.new();left.custom_minimum_size.x=200;columns.add_child(left)
 _search=LineEdit.new();_search.placeholder_text=text("search");_search.custom_minimum_size.y=44;left.add_child(_search);_search.text_changed.connect(func(s: String):_query=s.to_lower();_refresh())
 _button(left,text("all"),func():_path="all";_refresh())
 for route in _data.paths:
  var id: String=route.id
  _button(left,localized(route),func():_path=id;_refresh())
 var filters:=OptionButton.new();left.add_child(filters)
 for id in ["all","learned","planned"]:filters.add_item(text(id))
 filters.item_selected.connect(func(i: int):_filter=["all","learned","planned"][i];_refresh())
 _counter=_label(left,"",16)
 _label(left,text("changes"),22)
 var change_scroll:=ScrollContainer.new();change_scroll.size_flags_vertical=Control.SIZE_EXPAND_FILL;left.add_child(change_scroll)
 _changes=VBoxContainer.new();_changes.size_flags_horizontal=Control.SIZE_EXPAND_FILL;change_scroll.add_child(_changes)
 var center:=VBoxContainer.new();center.size_flags_horizontal=Control.SIZE_EXPAND_FILL;columns.add_child(center)
 var tools:=HBoxContainer.new();center.add_child(tools)
 _button(tools,"−",func():_set_zoom(_zoom-0.25));_button(tools,"100%",func():_set_zoom(1));_button(tools,"+",func():_set_zoom(_zoom+0.25))
 _scroll=ScrollContainer.new();_scroll.size_flags_vertical=Control.SIZE_EXPAND_FILL;center.add_child(_scroll)
 _extent=Control.new();_extent.custom_minimum_size=Vector2(1000,800);_scroll.add_child(_extent)
 _tree=Control.new();_tree.size=Vector2(1000,800);_extent.add_child(_tree);_tree.draw.connect(_draw_tree)
 var anatomy:=TextureRect.new();anatomy.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;anatomy.texture=load("res://assets/ui/demo_growth_body.svg");anatomy.size=Vector2(1000,800);anatomy.mouse_filter=Control.MOUSE_FILTER_IGNORE;_tree.add_child(anatomy)
 for node in _data.centers:_make_node(node,node.key,0)
 for node in _data.layout.nodes:_make_node(node,node.key,int(node.rank))
 var right:=VBoxContainer.new();right.custom_minimum_size.x=380;columns.add_child(right)
 var detail_scroll:=ScrollContainer.new();detail_scroll.size_flags_vertical=Control.SIZE_EXPAND_FILL;right.add_child(detail_scroll)
 _detail=VBoxContainer.new();_detail.custom_minimum_size.x=355;detail_scroll.add_child(_detail)
 _label(right,text("queue"),24);_label(right,text("queue_hint"),16)
 var qs:=ScrollContainer.new();qs.custom_minimum_size.y=140;right.add_child(qs);_queue=VBoxContainer.new();_queue.size_flags_horizontal=Control.SIZE_EXPAND_FILL;qs.add_child(_queue)
 _summary=_label(body,"",18);_summary.hide()
 _message=_label(body,"",18);_message.add_theme_color_override("font_color",Color("dfab96"))
 var footer:=HBoxContainer.new();body.add_child(footer)
 _button(footer,text("reset"),request_reset);_button(footer,text("cancel"),discard_plan)
 var gap:=Control.new();gap.size_flags_horizontal=Control.SIZE_EXPAND_FILL;footer.add_child(gap)
 _apply=_button(footer,text("apply"),apply_plan)
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
 b.size=Vector2(36,36) if rank==0 else Vector2(20,20);b.text=key.to_upper() if rank==0 and not key.begins_with("p") else ""
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
 _zoom=clampf(amount,1,2.5);_tree.scale=Vector2.ONE*_zoom;_extent.custom_minimum_size=Vector2(1000,800)*_zoom
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
 _points.text="SP  %s    AP  %s" % [number(result.sp if result!=null else _live.sp),number(result.ap if result!=null else _live.ap)]
 _apply.disabled=result==null or result.changes==0
 _clear(_detail);_label(_detail,label_for(_key),32);_label(_detail,text("current"),16)
 _label(_detail,"%s → %s" % [number(value(_live,_key)),number(value(_plan,_key))],28)
 var desc:=_label(_detail,localized(_defs[_key],"desc","descEn"),18);desc.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;desc.custom_minimum_size.x=350
 if _rank>0:_label(_detail,"Lv. %d · %d AP" % [_rank,POINT.rank_cost(_rank-1)],22)
 for row in _data.effects.get(_key,[]):
  var current:=_effect(row,value(_live,_key));var next:=_effect(row,value(_plan,_key))
  var l:=_label(_detail,localized(row)+"\n%s → %s%s" % [number(current),number(next),row.unit],18);l.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;l.custom_minimum_size.x=350
 _button(_detail,text("invest"),draft_step.bind(1));_button(_detail,text("refund"),draft_step.bind(-1))
 if _key.begins_with("p"):_button(_detail,text("queue"),change_queue)
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
  if rank==0:_captions[key].visible=shown and (bool(_center_major(key)) or not key.begins_with("p") or key==_key)
  if shown and (rank>0 or not key.begins_with("p")):count+=1
  var changed: bool=(value(_live,key)>=rank)!=(value(_plan,key)>=rank) if rank>0 else value(_live,key)!=value(_plan,key)
  var selected: bool=key==_key and rank==_rank
  var skin:=_style(Color("614a30") if rank>0 and value(_plan,key)>=rank else Color("33251e") if selected else Color("171519"),Color("f1cc88") if selected else Color("8b8064"))
  skin.set_content_margin_all(0)
  if rank>0:skin.set_corner_radius_all(10)
  _nodes[id].add_theme_stylebox_override("normal",skin)
  _nodes[id].modulate=Color("e0b083") if changed else Color("c7ac71") if value(_plan,key)>=(rank if rank else 1) else Color("8b8064")
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
 for key in _captions:_captions[key].visible=_nodes[key].visible and (_center_major(key) or not key.begins_with("p") or key==_key or _nodes[key].has_focus())
