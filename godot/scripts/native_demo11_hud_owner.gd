extends Control
## DEMO11-42: read-only live owner HUD. No combat/resource/timer writer.
const DISPATCH = preload("res://scripts/native_skill_dispatch.gd")
const FONTS = preload("res://scripts/native_ui_fonts.gd")
const INK = Color("dfd6c2")
const GOLD = Color("a49373")
var _main: Node
var _adapter: Node
var _boss: Control
var _boss_fill: TextureRect
var _boss_name: Label
var _boss_value: Label
var _strip: Panel
var _selection: Label
var _resources: Label
var _failure: Label
var _selected := "1"
var _last_failure := ""
var _failure_seconds := 0.0
var _elapsed := 0.0
var _snapshot: Dictionary = {"ready":false}

static func install_native_boot(main: Node) -> Control:
	var hud: Node = main.get("hud")
	var world: Node = main.get("world")
	if not is_instance_valid(hud) or not is_instance_valid(world): return null
	var parent: Control = hud.get_node_or_null("PublicHUD")
	var adapter: Node = world.get_node_or_null("NativeSkillSlots")
	if parent == null or adapter == null or parent.has_node("Demo11OwnerHUD"): return null
	var view := new()
	view.name = "Demo11OwnerHUD"
	view._main = main
	view._adapter = adapter
	parent.add_child(view)
	adapter.native_dispatch_observed.connect(view._observe)
	view.refresh_native_owners()
	return view

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	# Same viewport scale policy as existing HUD; no independent layout owner.
	_boss = Control.new()
	add_child(_boss)
	_boss.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_boss_name = _label(_boss,"",Vector2(-250,0),Vector2(500,34),24,"hell_title",Color("ffd3a2"))
	var rail := Panel.new()
	_boss.add_child(rail)
	rail.position=Vector2(-251,38);rail.size=Vector2(502,16)
	rail.mouse_filter=Control.MOUSE_FILTER_IGNORE
	var style := StyleBoxFlat.new()
	style.bg_color=Color("140707");style.border_color=Color("7d2c20")
	style.set_border_width_all(1);style.set_corner_radius_all(7)
	style.shadow_color=Color(0.46,0.15,0.09,0.38);style.shadow_size=8
	rail.add_theme_stylebox_override("panel",style)
	_boss_fill = TextureRect.new()
	rail.add_child(_boss_fill)
	_boss_fill.position=Vector2(1,1);_boss_fill.size=Vector2(500,14)
	_boss_fill.expand_mode=TextureRect.EXPAND_IGNORE_SIZE
	_boss_fill.mouse_filter=Control.MOUSE_FILTER_IGNORE
	var gradient := Gradient.new()
	gradient.offsets=PackedFloat32Array([0,.38,.72,1])
	gradient.colors=PackedColorArray([Color("2d0405"),Color("7f1212"),Color("cf361f"),Color("ffb16a")])
	var texture := GradientTexture2D.new();texture.gradient=gradient;texture.fill_to=Vector2(1,0)
	_boss_fill.texture=texture
	_boss_value=_label(_boss,"",Vector2(-250,58),Vector2(500,22),14,"cinzel_hell",INK)
	_strip=Panel.new();add_child(_strip)
	_strip.mouse_filter=Control.MOUSE_FILTER_IGNORE
	_strip.size=Vector2(640,62)
	var plate:=StyleBoxFlat.new()
	plate.bg_color=Color(0.035,0.028,0.027,.8)
	plate.border_color=Color(GOLD,.5);plate.border_width_top=1
	_strip.add_theme_stylebox_override("panel",plate)
	_selection=_label(self,"",Vector2.ZERO,Vector2(620,24),15,"hell",INK)
	_resources=_label(self,"",Vector2.ZERO,Vector2(620,22),14,"cinzel_hell",INK)
	_failure=_label(self,"",Vector2.ZERO,Vector2(660,26),16,"hell",Color("ff9d78"))

func _label(parent: Control, text: String, pos: Vector2, extent: Vector2, px: int, stack: String, color: Color) -> Label:
	var leaf:=Label.new();parent.add_child(leaf)
	leaf.text=text;leaf.position=pos;leaf.size=extent
	leaf.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	leaf.mouse_filter=Control.MOUSE_FILTER_IGNORE
	leaf.add_theme_font_override("font",FONTS.stack(stack,700 if stack=="hell_title" else 400))
	leaf.add_theme_font_size_override("font_size",px)
	leaf.add_theme_color_override("font_color",color)
	leaf.add_theme_color_override("font_shadow_color",Color(0,0,0,.95))
	leaf.add_theme_constant_override("shadow_offset_y",2)
	return leaf

func _process(delta: float) -> void:
	_failure_seconds=maxf(0,_failure_seconds-delta)
	_elapsed+=delta
	if _elapsed>=.1:
		_elapsed=0
		refresh_native_owners()

func _observe(key: String, result: Dictionary) -> void:
	if DISPATCH.HUD_SLOTS.has(key): _selected=key
	_last_failure="" if result.get("accepted")==true else str(result.get("reason","owner_unready"))
	_failure_seconds=0 if _last_failure.is_empty() else 3
	refresh_native_owners()

func refresh_native_owners() -> void:
	if not is_node_ready(): return
	var extent:=get_viewport_rect().size
	_boss.position=Vector2(extent.x*.5,18)
	_strip.position=Vector2(extent.x*.5-320,extent.y-228)
	_selection.position=Vector2(extent.x*.5-310,extent.y-221)
	_resources.position=Vector2(extent.x*.5-310,extent.y-197)
	_failure.position=Vector2(extent.x*.5-330,extent.y-252)
	var state: Node=_main.get("source_state") if is_instance_valid(_main) else null
	var p: Variant=state.read_current_p() if is_instance_valid(state) else null
	var g: Variant=state.read_current_g() if is_instance_valid(state) else null
	var live:=is_instance_valid(_main) and _main.is_inside_tree() and is_instance_valid(_adapter) and _adapter.is_inside_tree() and p is Dictionary and g is Dictionary
	_strip.visible=live
	_selection.visible=live;_resources.visible=live;_failure.visible=live and _failure_seconds>0
	_boss.visible=false
	_snapshot={"ready":live,"boss_visible":false,"selected_key":_selected,"failure_reason":_last_failure if _failure_seconds>0 else ""}
	if not live: return
	var selected: Dictionary=DISPATCH.RULES.slot_value(_selected,p,p.get("skillSlots"),p.get("ultSlot"))
	var sid: String=str(selected.value) if selected.get("status")=="READY" and selected.get("value")!=null else ""
	var learned: bool=not sid.is_empty() and p.get("skills",{}).get(sid,0)>0
	var record: Dictionary=DISPATCH.RULES.CATALOG.read_skill(sid)
	var title: String=str(record.value.name) if record.get("found")==true else "미배정"
	if not learned: title="미배정"
	var cds: Dictionary=_adapter.read_native_slot_cooldowns()
	var cd: Dictionary=cds.get(DISPATCH.HUD_SLOTS.get(_selected,""),{})
	var supported: bool=DISPATCH.EXECUTORS.has(sid)
	var readiness: String=str(cd.get("text","")) if not cd.is_empty() else ("준비" if supported and learned else "연결 대기")
	_selection.text="%s · %s · %s" % [_selected,title,readiness]
	_resources.text="ST %d / %d    MP %d / %d    SP %d    악의 %d" % [p.st,p.mst,p.mp,p.mmp,p.sp,g.mats]
	_failure.text=_failure_text(_last_failure)
	_snapshot.merge({"selected_skill":sid if learned else "","selection_text":_selection.text,"cooldown":cd.duplicate(true),"resource_text":_resources.text,"failure_text":_failure.text if _failure.visible else "","resources":{"st":p.st,"mst":p.mst,"mp":p.mp,"mmp":p.mmp,"sp":p.sp,"mats":g.mats}})
	var actor: Node=_main.get("native_demo_boss_actor")
	if not is_instance_valid(actor) or not actor.is_inside_tree() or actor.get_parent()!=_main.get("world"): return
	var boss: Dictionary=_main.read_native_demo_boss()
	var enemy: Dictionary=boss.get("enemy",{})
	if boss.get("status") not in ["READY","WAITING_OWNER"] or not _finite(enemy.get("hp")) or not _finite(enemy.get("mhp")) or enemy.mhp<=0 or enemy.hp<=0: return
	_boss.visible=true
	_boss_name.text="다크드루이드" # game.html:16689,16706,35837; demo stage0 only
	_boss_value.text="%d / %d" % [enemy.hp,enemy.mhp]
	var ratio:=clampf(float(enemy.hp)/float(enemy.mhp),0,1)
	_boss_fill.size.x=500*ratio
	_snapshot.merge({"boss_visible":true,"boss_hp":enemy.hp,"boss_max_hp":enemy.mhp,"boss_ratio":ratio,"boss_fill_px":_boss_fill.size.x,"boss_owner_status":boss.status},true)

static func _finite(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _failure_text(reason: String) -> String:
	match reason:
		"": return ""
		"unassigned_or_unlearned": return "사용 불가 · 스킬 미배정"
		"executor_interface_required","protected_poise_escape_interface_required": return "사용 불가 · 스킬 연결 대기"
		"source_global_or_actor_gate","dispatcher_not_configured_or_paused": return "사용 불가 · 현재 행동 상태"
		"slot_rule_or_absorbed": return "사용 불가 · 슬롯 또는 합체 상태"
		"ice_orb_active","ghost_walk_active": return "사용 불가 · 다른 스킬 사용 중"
		"cast_gate_refused": return "사용 불가 · 자원 또는 재사용 대기"
		_: return "사용 불가 · 상태 확인 필요"

func snapshot() -> Dictionary:
	return _snapshot.duplicate(true)
