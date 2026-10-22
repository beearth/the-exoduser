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
var _path_hint: Label
var _discard: Button

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
 surface.text(_screen,surface.I18N.text("전투의 길"),Rect2(35,320.4,160,25.2),18,Color(219/255.0,199/255.0,170/255.0),"disp_title",600)
 _counter=surface.text(_screen,"",Rect2(150,323,105,18),14,Color(196/255.0,183/255.0,166/255.0),"hell");_counter.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
 _search=LineEdit.new();_search.position=Vector2(35,359);_search.size=Vector2(220,44);_search.placeholder_text=surface.I18N.text("이름 · 효과 · 영문명 검색");_search.add_theme_font_override("font",FONTS.stack("font"));_search.add_theme_font_size_override("font_size",14);_screen.add_child(_search);_search.text_changed.connect(func(value:String):_query=value.to_lower();_refresh())
 var routes:Array=[{"id":"all","ko":"전체","en":"All"}]+_data.paths
 for i in routes.size():
  var route:Dictionary=routes[i];var id:String=route.id
  var b:=surface.button(_screen,localized(route),Rect2(35,413+i*61.05,220,58),func():_path=id;_refresh(),i==0,16);b.alignment=HORIZONTAL_ALIGNMENT_LEFT;b.add_theme_font_override("font",FONTS.stack("font",400));_path_buttons[id]=b
  for key in ["font_color","font_hover_color","font_pressed_color","font_focus_color"]:b.add_theme_color_override(key,Color(224/255.0,212/255.0,193/255.0))
  var count:=surface.text(b,"",Rect2(120,21,94,16),14,Color(196/255.0,183/255.0,166/255.0),"hell");count.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT;count.name="PathCount"
  if not route.has("icon"):
   var star:=surface.text(b,"✦",Rect2(8,12.9,24,32.2),23,Color(211/255.0,186/255.0,142/255.0),"font");star.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  for child in b.get_children():
   if child is TextureRect:child.hide()
  if route.has("icon"):
   var glyph_index:=0
   for gi in _data.defs.size():
    if _data.defs[gi].key==route.icon:glyph_index=gi;break
   var atlas:=AtlasTexture.new();atlas.atlas=_atlas;atlas.region=Rect2(glyph_index*32,0,32,32)
   var icon:=TextureRect.new();icon.texture=atlas;icon.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;icon.position=Vector2(10,17);icon.size=Vector2(24,24);icon.mouse_filter=Control.MOUSE_FILTER_IGNORE;icon.modulate=Color(str(route.get("color","#c5b27c")));b.add_child(icon) # --school-color
 for i in 3:
  var id:String=["all","learned","planned"][i]
  var b:=surface.button(_screen,text(id),Rect2([35.0,115.7,196.4][i],847.2,[39.5,39.5,58.6][i],38),func():_filter=id;_refresh(),i==0,16);_filter_buttons[id]=b;b.add_theme_font_override("font",FONTS.stack("font",400))
  for child in b.get_children():
   if child is TextureRect:child.hide()
 _path_hint=surface.text(_screen,surface.I18N.text("6개의 길 · 서로 조합 가능한 26개 패시브"),Rect2(35,896.2,220,44.8),14,Color(196/255.0,183/255.0,166/255.0),"font");_path_hint.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 _changes=VBoxContainer.new();_changes.hide();_screen.add_child(_changes)
 _source_viewport=surface.panel(_screen,Rect2(271,317,1174,624),Color("0b100e"),Color("57422f"));_source_viewport.clip_contents=true
 _extent=Control.new();_extent.size=Vector2(1174,624);_source_viewport.add_child(_extent)
 _tree=Control.new();_tree.size=Vector2(1000,800);_extent.add_child(_tree);_tree.draw.connect(_draw_tree)
 for node in _data.centers:_make_node(node,node.key,0)
 for node in _data.layout.nodes:_make_node(node,node.key,int(node.rank))
 _set_zoom(1)
 var live_link:=Button.new();live_link.text=surface.I18N.text("현재 전투 능력치 ↗");live_link.position=Vector2(271,956.8);live_link.size=Vector2(132.2,30.5);live_link.add_theme_font_override("font",FONTS.stack("font",400));live_link.add_theme_font_size_override("font_size",15)
 for key in ["font_color","font_hover_color","font_pressed_color","font_focus_color"]:live_link.add_theme_color_override(key,Color(207/255.0,175/255.0,135/255.0))
 for st in ["normal","hover","pressed","focus"]:live_link.add_theme_stylebox_override(st,StyleBoxEmpty.new())
 live_link.pressed.connect(func():_summary.visible=not _summary.visible);_screen.add_child(live_link)
 surface.button(_screen,"−",Rect2(1314,952,40,40),func():_set_zoom(_zoom-.25),false,14)
 _zoom_caption=surface.button(_screen,"100%",Rect2(1354,952,50,40),func():_set_zoom(1),false,14)
 surface.button(_screen,"+",Rect2(1404,952,40,40),func():_set_zoom(_zoom+.25),false,14)
 var right:=surface.panel(_screen,Rect2(1465,317,420,674),Color("161416"),Color("756247"));surface.frame(right,Rect2(0,0,420,674),8)
 var detail_scroll:=ScrollContainer.new();detail_scroll.position=Vector2(24,20);detail_scroll.size=Vector2(372,654);detail_scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED;detail_scroll.vertical_scroll_mode=ScrollContainer.SCROLL_MODE_SHOW_NEVER;right.add_child(detail_scroll)
 _detail=VBoxContainer.new();_detail.custom_minimum_size.x=355;_detail.add_theme_constant_override("separation",16);detail_scroll.add_child(_detail)
 _queue=VBoxContainer.new();_queue.hide();_screen.add_child(_queue)
 _summary=surface.text(_screen,"",Rect2(400,500,1000,150),18,Color("dfd6c2"),"font");_summary.hide()
 _message=surface.text(_screen,"",Rect2(39,1014.8,1368.7,22.4),14,Color(196/255.0,183/255.0,166/255.0),"font")
 # stat-panel-ui.css 하단: 전체 환불 계획=텍스트, 계획 취소/닫기=흑철 판, 변경 적용=적동 판(비활성 .48)
 _foot_button(text("reset"),Rect2(1421.7,1004,109.3,44),request_reset,"text")
 _discard=_foot_button(text("cancel"),Rect2(1545,1004,97.4,44),discard_plan,"iron")
 _apply=_foot_button(text("apply"),Rect2(1656.3,1003,123.4,46),apply_plan,"ember")
 _foot_button(text("close")+" [J]",Rect2(1793.7,1004,87.3,44),close_panel,"iron")
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
 _apply.modulate=Color(.78,.74,.72,.48) if _apply.disabled else Color.WHITE # opacity .48 + saturate(.3)
 _discard.disabled=result==null or result.changes==0
 _discard.modulate=Color(.78,.74,.72,.48) if _discard.disabled else Color.WHITE
 _refresh_path_counts()
 _clear(_detail)
 var ui:=preload("res://scripts/native_demo_ui_i18n.gd")
 _render_inspector(result)
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
func _foot_button(caption: String,rect: Rect2,callback: Callable,kind: String) -> Button:
 var b:=Button.new();b.text=caption;b.position=rect.position;b.size=rect.size
 b.add_theme_font_override("font",FONTS.stack("font",600 if kind=="ember" else 400));b.add_theme_font_size_override("font_size",16)
 var ink:=Color(166/255.0,140/255.0,113/255.0) if kind=="text" else (Color(1,222/255.0,189/255.0) if kind=="ember" else Color(201/255.0,178/255.0,145/255.0))
 for key in ["font_color","font_hover_color","font_pressed_color","font_focus_color","font_disabled_color"]:b.add_theme_color_override(key,ink)
 for st in ["normal","hover","pressed","focus","disabled"]:b.add_theme_stylebox_override(st,StyleBoxEmpty.new())
 if kind!="text":
  var plate:=FootPlate.new();plate.ember=kind=="ember";plate.size=rect.size;plate.show_behind_parent=true;plate.mouse_filter=Control.MOUSE_FILTER_IGNORE;b.add_child(plate)
 b.pressed.connect(callback);_screen.add_child(b);return b

class FootPlate extends Control:
 var ember:=false
 func _draw() -> void:
  var top:=Color(155/255.0,70/255.0,53/255.0) if ember else Color(45/255.0,40/255.0,33/255.0)
  var bottom:=Color(99/255.0,38/255.0,31/255.0) if ember else Color(19/255.0,23/255.0,25/255.0)
  draw_polygon(PackedVector2Array([Vector2.ZERO,Vector2(size.x,0),size,Vector2(0,size.y)]),PackedColorArray([top,top,bottom,bottom]))
  draw_rect(Rect2(1,1,size.x-2,size.y-2),Color(72/255.0,30/255.0,24/255.0) if ember else Color(17/255.0,21/255.0,22/255.0),false,2.0)
  draw_rect(Rect2(.5,.5,size.x-1,size.y-1),Color(207/255.0,150/255.0,113/255.0) if ember else Color(104/255.0,81/255.0,58/255.0),false,1.0)

func _effect(row: Dictionary,level: float) -> float:
 var amount: float=float(row.base)+float(row.per)*level
 if row.cap!=null:amount=minf(amount,float(row.cap))
 if _key=="pDemon" and row.unit=="s":amount=maxf(100,amount)
 return snappedf(amount,0.0001)

func number(amount: float) -> String:
 return str(int(amount)) if amount==floorf(amount) else ("%.4f" % amount).trim_suffix("0").trim_suffix("0").trim_suffix("0").trim_suffix(".")

func _refresh_path_counts() -> void:
 # stat-panel-ui.js 387–390: learned / total per path(전체=모든 노드).
 var stat_routes: Dictionary={"str":"assault","dex":"precision","int":"arcane","lck":"fate","grit":"survival"}
 for id in _path_buttons:
  var keys: Array=[]
  if id=="all":
   for row in _data.centers:keys.append(row.key)
  else:
   for route in _data.paths:
    if route.id==id:keys=route.keys.duplicate()
   for k in stat_routes:
    if stat_routes[k]==id:keys.append(k)
  var learned:=0;var total:=0
  for key in keys:
   if str(key).begins_with("p"):learned+=int(value(_plan,key));total+=int(_defs[key].max) if _defs.has(key) else 0
   else:learned+=1 if value(_plan,key)>0 else 0;total+=1
  var count: Label=_path_buttons[id].get_node_or_null("PathCount")
  if count!=null:count.text="%d / %d"%[learned,total]
 var hint:="6개의 길 · 서로 조합 가능한 26개 패시브|6 paths · 26 freely combinable passives".split("|")
 for route in _data.paths:
  if route.id==_path:hint=PackedStringArray(route.hint)
 _path_hint.text=hint[0] if TranslationServer.get_locale().begins_with("ko") else hint[1]

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

## stat-panel-ui.js 412–433 패시브 상세(growth-inspector) — 웹 실측 좌표(인스펙터 1465,317 기준, 스크롤 원점 +26,+20).
const NOTES := {
 "pAtk":["공통 합연산 피해 묶음에 더해집니다. 최종 피해 배율은 다른 패시브·장비와 함께 계산됩니다.","Added to the shared additive damage pool; final damage also depends on other passives and gear."],
 "pParry":["무지개탄 감소는 Lv5에서 상한에 도달합니다. 무지개탄 패링은 Q만 가능합니다.","Rainbow damage reduction caps at rank 5. Only Q can parry rainbow shots."],
 "pMagic":["시전속도 기본 배율은 ×2입니다. MP 비용 감소는 장비를 포함해 최대 60%입니다.","Base cast speed is ×2. MP cost reduction caps at 60% including gear."],
 "pGuard":["지속 피해에는 흡수율의 절반이 적용됩니다.","Damage over time uses half the absorption rate."],
 "pPierce":["기본 투사체 기준입니다. 일부 스킬은 자체 관통 공식을 사용합니다. 장비 포함 기본 관통 확률 상한 95%.","Base projectile values. Some skills use their own pierce rules. Base chance caps at 95% including gear."],
 "pCombo":["직접 명중마다 중첩. 빔은 4틱마다 1중첩. 초당 20% 감소, 5초 미명중 시 초기화. DOT·장판 제외.","Stacks on direct hits; beams add one per four ticks. Decays 20% per second, resets after five seconds without hits. Excludes DoT and ground effects."],
 "pAbund":["추가 피해는 적의 HP 조건입니다. 회복력 증가는 항상 적용됩니다.","Damage bonus checks enemy HP. Recovery is always active."],
 "pHuman":["성장과 자원을 얻는 대신 부활 확률을 잃습니다. 악마성과 함께 투자하면 부활 효과가 상쇄될 수 있습니다.","Gain damage and resources at the cost of revival chance. Humanity can offset Demon investment."],
 "pDemon":["부활 성공 시 HP·MP·ST를 전부 회복합니다. 실제 확률은 레벨·장비·인간성을 함께 계산하며 0~100%입니다. 기본 쿨다운 최저 100초.","Successful revival restores all HP, MP and ST. Actual chance includes level, gear and Humanity, clamped to 0–100%. Base cooldown has a 100-second floor."]}
const NOTE_DEFAULT := ["다른 패시브와 함께 투자할 수 있습니다. 표는 이 패시브의 기여이며, 최종 전투 능력치는 장비·조건에 따라 달라집니다.","Combine with other passives. These are this passive’s contributions; final combat stats depend on gear and conditions."]
func _t2(ko: String,en: String) -> String:return ko if TranslationServer.get_locale().begins_with("ko") else en
func _ilabel(parent: Node,value: String,rect: Rect2,px: float,color: Color,stack: String="font",weight: int=400,spacing: float=0.0,align:=HORIZONTAL_ALIGNMENT_LEFT) -> Label:
 var l:=Label.new();l.text=value;l.position=rect.position-Vector2(24,20);l.size=rect.size;l.horizontal_alignment=align;l.mouse_filter=Control.MOUSE_FILTER_IGNORE
 var f: FontVariation=FONTS.stack(stack,weight).duplicate()
 if spacing!=0.0:f.spacing_glyph=roundi(spacing)
 l.add_theme_font_override("font",f);l.add_theme_font_size_override("font_size",roundi(px));l.add_theme_color_override("font_color",color);parent.add_child(l);return l
func _render_inspector(result: Variant) -> void:
 # 좌표는 웹 절대값에서 인스펙터(1465,317)를 뺀 값.
 var root:=Control.new();root.custom_minimum_size=Vector2(372,640);root.mouse_filter=Control.MOUSE_FILTER_PASS;_detail.add_child(root)
 var passive: bool=_key.begins_with("p")
 var def: Dictionary=_defs[_key]
 var level: float=value(_plan,_key);var live_level: float=value(_live,_key)
 var route_name:="";var route_color:=Color("c5b27c")
 for route in _data.paths:
  if _key in route.keys:route_name=localized(route);route_color=Color(str(route.color))
 _ilabel(root,_t2("패시브 분석","PASSIVE ANALYSIS") if passive else _t2("능력치 분석","ATTRIBUTE INSIGHT"),Rect2(24,22,372,24),16,Color(213/255.0,194/255.0,162/255.0),"font",400,2.56)
 # hero: 원형 휘장 54px + 분류명
 var ring:=HeroRing.new();ring.position=Vector2(27,72)-Vector2(24,20);ring.size=Vector2(54,54);ring.color=route_color;root.add_child(ring)
 var index:=0
 for i in _data.defs.size():
  if _data.defs[i].key==_key:index=i
 if passive:
  var atlas:=AtlasTexture.new();atlas.atlas=_atlas;atlas.region=Rect2(index*32,0,32,32)
  var glyph:=TextureRect.new();glyph.texture=atlas;glyph.position=Vector2(11,11);glyph.size=Vector2(32,32);glyph.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;glyph.modulate=route_color;ring.add_child(glyph)
 else:
  _ilabel(ring,_key.to_upper(),Rect2(24,20+17,54,20),13,route_color,"cinzel_hell",700,0,HORIZONTAL_ALIGNMENT_CENTER)
 _ilabel(root,route_name if passive else _t2("기본 능력치","ATTRIBUTE"),Rect2(97,87,260,24),16,Color(213/255.0,194/255.0,162/255.0),"font",400,.96)
 _ilabel(root,label_for(_key),Rect2(27,144,366,48.6),36,Color(238/255.0,224/255.0,197/255.0),"disp_title",600,1.08)
 # 투자 레벨 + 수치 + 10칸 사선 막대
 var max_level:=int(def.max)
 _ilabel(root,_t2("투자 레벨","ALLOCATED RANK"),Rect2(27,211.1,200,24),16,Color(213/255.0,194/255.0,162/255.0))
 _ilabel(root,number(level),Rect2(230,210.6,135.8,25),25,Color(230/255.0,191/255.0,136/255.0),"hell",400,0,HORIZONTAL_ALIGNMENT_RIGHT)
 _ilabel(root,"/ "+str(max_level),Rect2(375.2,215.6,40,15),10,Color(157/255.0,139/255.0,112/255.0))
 var pips:=Pips.new();pips.position=Vector2(26,243.6)-Vector2(24,20);pips.size=Vector2(370,4);pips.count=mini(max_level,10) if passive else 10;pips.filled=int(level) if passive else 0;root.add_child(pips)
 # 효과 표 (상·하단 테두리 rgb(...))
 var line_col:=Color(164/255.0,147/255.0,115/255.0,.22)
 for yy in [261.6,309.3]:
  var ln:=ColorRect.new();ln.color=line_col;ln.position=Vector2(27,yy)-Vector2(24,20);ln.size=Vector2(366,1);root.add_child(ln)
 var pending: bool=level!=live_level
 var target: float=(level if pending else minf(level+1,float(def.max)))
 var from: float=live_level if pending else level
 _ilabel(root,_t2("패시브 기여","PASSIVE CONTRIBUTION"),Rect2(27,274.6,262,21.7),14,Color(201/255.0,187/255.0,165/255.0),"font",400,.56)
 _ilabel(root,_t2("현재","NOW"),Rect2(301,274.6,38,21.7),14,Color(196/255.0,183/255.0,166/255.0),"font",400,.56,HORIZONTAL_ALIGNMENT_RIGHT)
 _ilabel(root,_t2("계획","PLAN") if pending else _t2("다음","NEXT"),Rect2(351,274.6,42,21.7),14,Color(196/255.0,183/255.0,166/255.0),"font",400,.56,HORIZONTAL_ALIGNMENT_RIGHT)
 var y:=309.3
 var rows: Array=_data.effects.get(_key,[])
 for i in rows.size():
  var row: Dictionary=rows[i]
  var cur:=_effect(row,from);var nxt:=_effect(row,target)
  var h:=59.8 if i==0 else 62.2
  _ilabel(root,localized(row),Rect2(27,y+15.4,262,27.9),18,Color(201/255.0,187/255.0,165/255.0))
  _ilabel(root,number(cur)+str(row.unit),Rect2(240,y+15.4,96.3,27.9),18,Color(170/255.0,160/255.0,143/255.0),"font",400,0,HORIZONTAL_ALIGNMENT_RIGHT)
  var capped: bool=cur==nxt
  _ilabel(root,number(nxt)+str(row.unit),Rect2(300,y+12,93,37.2),24,Color(170/255.0,160/255.0,143/255.0) if capped else (Color(240/255.0,215/255.0,167/255.0) if i==0 else Color(239/255.0,180/255.0,123/255.0)),"hell" if i==0 else "font",400 if i==0 else 600,0,HORIZONTAL_ALIGNMENT_RIGHT)
  y+=h
  var ln:=ColorRect.new();ln.color=line_col;ln.position=Vector2(27,y)-Vector2(24,20);ln.size=Vector2(366,1);root.add_child(ln)
 var note: Array=NOTES.get(_key,NOTE_DEFAULT)
 var desc:=_ilabel(root,_t2(note[0],note[1]),Rect2(27,y+11,366,30.6),18,Color(213/255.0,200/255.0,182/255.0));desc.clip_text=true;desc.text_overrun_behavior=TextServer.OVERRUN_NO_TRIMMING
 # 액션: 상단 경계선 · 주 버튼 · 안내 2줄 · 환불 텍스트 버튼 (y=490.2 고정)
 var top:=490.2
 var sep:=ColorRect.new();sep.color=Color(164/255.0,147/255.0,115/255.0,.35);sep.position=Vector2(24,top)-Vector2(24,20);sep.size=Vector2(372,1);root.add_child(sep)
 var queued: Array=_live.get("queue",[])
 var ap: float=float(result.ap if result!=null else _live.ap)
 var reserved:=0
 for k in queued:
  if k==_key:reserved+=1
 var future: float=level+reserved
 var maxed: bool=future>=float(def.max)
 var cost:=POINT.rank_cost(int(future))
 var reserve: bool=passive and (queued.size()>0 or ap<cost)
 var caption:String=_t2("최대 레벨","Maximum rank") if maxed else ((_t2("자동 투자 예약 · {n} AP","Reserve auto-invest · {n} AP") if reserve else _t2("계획에 추가 · {n} AP","Add to plan · {n} AP")).replace("{n}",str(cost)))
 if not passive:caption=text("invest")
 var invest:=Button.new();invest.text=caption;invest.position=Vector2(24,top+13)-Vector2(24,20);invest.size=Vector2(372,49);invest.disabled=maxed
 invest.add_theme_font_override("font",FONTS.stack("font",600));invest.add_theme_font_size_override("font_size",18)
 for key in ["font_color","font_hover_color","font_pressed_color","font_focus_color"]:invest.add_theme_color_override(key,Color(244/255.0,216/255.0,168/255.0))
 invest.add_theme_color_override("font_disabled_color",Color(244/255.0,216/255.0,168/255.0,.48))
 for st in ["normal","hover","pressed","focus","disabled"]:invest.add_theme_stylebox_override(st,StyleBoxEmpty.new())
 var plate:=GoldPlate.new();plate.size=invest.size;plate.show_behind_parent=true;plate.mouse_filter=Control.MOUSE_FILTER_IGNORE;invest.add_child(plate)
 invest.pressed.connect(func():
  if reserve:change_queue()
  else:draft_step(1))
 root.add_child(invest)
 var note1:String=_t2("레벨 상한에 도달했습니다.","Rank cap reached.") if maxed else (_t2("현재 AP {ap} · 예약 후 예상 레벨 {rank} · AP가 모이면 자동 투자","Current AP {ap} · reserved target rank {rank} · auto-invest when affordable").replace("{ap}",number(ap)).replace("{rank}",number(future+1)) if reserve else _t2("추가 후 계획 잔여 AP {n}","{n} AP left after adding").replace("{n}",number(ap-cost)))
 var changed: int=int(result.changes) if result!=null else 0
 var note2:String=_t2("자동 투자 예약 {n}개 저장됨 · 아래에서 개별 취소 가능","{n} auto-invest reservations saved · cancel individually below").replace("{n}",str(queued.size())) if queued.size()>0 else (_t2("변경 {n}개 · 하단에서 적용","{n} changes · Apply below").replace("{n}",str(changed)) if changed>0 else _t2("AP가 부족해도 예약할 수 있습니다. 예약은 즉시 저장됩니다.","Reserve without enough AP. Reservations save immediately."))
 _ilabel(root,note1,Rect2(24,top+69,372,22.4),14,Color(196/255.0,183/255.0,166/255.0),"font",400,0,HORIZONTAL_ALIGNMENT_CENTER)
 _ilabel(root,note2,Rect2(24,top+97.4,372,22.4),14,Color(196/255.0,183/255.0,166/255.0),"font",400,0,HORIZONTAL_ALIGNMENT_CENTER)
 var refund:=Button.new();refund.text=_t2("1레벨 환불 계획","Plan rank refund")+((" · +"+str(POINT.rank_cost(int(level)-1))+" AP") if level>0 and passive else "")
 if not passive:refund.text=text("refund")
 refund.position=Vector2(24,top+119.8)-Vector2(24,20);refund.size=Vector2(372,44);refund.disabled=level<=0
 refund.add_theme_font_override("font",FONTS.stack("font",400));refund.add_theme_font_size_override("font_size",18)
 for key in ["font_color","font_hover_color","font_pressed_color","font_focus_color"]:refund.add_theme_color_override(key,Color(180/255.0,160/255.0,131/255.0))
 refund.add_theme_color_override("font_disabled_color",Color(180/255.0,160/255.0,131/255.0,.48))
 for st in ["normal","hover","pressed","focus","disabled"]:refund.add_theme_stylebox_override(st,StyleBoxEmpty.new())
 refund.pressed.connect(draft_step.bind(-1));root.add_child(refund)

class HeroRing extends Control:
 var color:=Color("c5b27c")
 func _draw() -> void:
  var c:=size*.5
  draw_circle(c,size.x*.5+5,Color(114/255.0,96/255.0,62/255.0,.4))
  draw_circle(c,size.x*.5+4,Color(24/255.0,27/255.0,23/255.0))
  draw_circle(c,size.x*.5,Color(19/255.0,25/255.0,28/255.0))
  draw_circle(c+Vector2(0,-size.y*.05),size.x*.33,Color(92/255.0,81/255.0,68/255.0,.2))
  draw_arc(c,size.x*.5-.5,0,TAU,64,Color(176/255.0,144/255.0,92/255.0),1.0,true)
class Pips extends Control:
 var count:=10
 var filled:=0
 func _draw() -> void:
  var w:=34.9;var gap:=2.1;var skew:=-0.466308*size.y
  for i in count:
   var x:=1.0+i*(w+gap)
   var col:=Color("c9a35e") if i<filled else Color(66/255.0,59/255.0,48/255.0)
   draw_polygon(PackedVector2Array([Vector2(x-skew*.5,0),Vector2(x+w-skew*.5,0),Vector2(x+w+skew*.5,size.y),Vector2(x+skew*.5,size.y)]),PackedColorArray([col,col,col,col]))
class GoldPlate extends Control:
 func _draw() -> void:
  var r:=Rect2(Vector2.ZERO,size)
  draw_polygon(PackedVector2Array([Vector2.ZERO,Vector2(size.x,0),size,Vector2(0,size.y)]),PackedColorArray([Color(104/255.0,80/255.0,50/255.0),Color(104/255.0,80/255.0,50/255.0),Color(48/255.0,38/255.0,25/255.0),Color(48/255.0,38/255.0,25/255.0)]))
  draw_rect(Rect2(1,1,size.x-2,size.y-2),Color(27/255.0,26/255.0,22/255.0),false,2.0)
  draw_rect(Rect2(.5,.5,size.x-1,size.y-1),Color(182/255.0,145/255.0,89/255.0),false,1.0)
  if get_parent() is Button and (get_parent() as Button).disabled:modulate.a=.48
