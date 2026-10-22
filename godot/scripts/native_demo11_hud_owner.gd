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
var _poise_fill: ColorRect
var _poise_label: Label
var _status_label: Label
var _status_chip: Panel
var _status_icon: TextureRect
var _intro_fill:=0.0
var _had_boss:=false
var _locale: Dictionary={}
var _language: String="ko"
var _strip: Panel
var _selection: Label
var _failure: Label
var _selected := "1"
var _last_failure := ""
var _failure_seconds := 0.0
var _selection_seconds := 0.0
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
	_locale=JSON.parse_string(FileAccess.get_file_as_string("res://data/parity_boss_01_locale.json"))
	var language: Dictionary=_main.get_native_startup_language_snapshot()
	_language=str(language.get("language","ko"))
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	# Same viewport scale policy as existing HUD; no independent layout owner.
	_boss = Control.new()
	add_child(_boss)
	_boss.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_boss_name = _label(_boss,"",Vector2(-400,0),Vector2(800,34),26,"hell_title",Color("ffd3a2"))
	var display_font:=FontVariation.new();display_font.base_font=preload("res://assets/boss_parity/BlackHanSans-Regular.ttf");display_font.variation_embolden=.5;display_font.spacing_glyph=2
	_boss_name.add_theme_font_override("font",display_font)
	var rail := Panel.new()
	_boss.add_child(rail)
	rail.position=Vector2(-250,37);rail.size=Vector2(500,14)
	rail.mouse_filter=Control.MOUSE_FILTER_IGNORE
	var style := StyleBoxFlat.new()
	style.bg_color=Color("140707");style.border_color=Color("7d2c20")
	style.set_border_width_all(1);style.set_corner_radius_all(7)
	style.shadow_color=Color(0.46,0.15,0.09,0.38);style.shadow_size=8
	rail.add_theme_stylebox_override("panel",style)
	_boss_fill = TextureRect.new()
	rail.add_child(_boss_fill)
	_boss_fill.position=Vector2(1,1);_boss_fill.size=Vector2(498,12)
	_boss_fill.expand_mode=TextureRect.EXPAND_IGNORE_SIZE
	_boss_fill.mouse_filter=Control.MOUSE_FILTER_IGNORE
	var gradient := Gradient.new()
	gradient.offsets=PackedFloat32Array([0,.38,.72,1])
	gradient.colors=PackedColorArray([Color("2d0405"),Color("7f1212"),Color("cf361f"),Color("ffb16a")])
	var texture := GradientTexture2D.new();texture.gradient=gradient;texture.fill_to=Vector2(1,0)
	_boss_fill.texture=texture
	_boss_value=_label(_boss,"",Vector2(-250,58),Vector2(500,22),14,"cinzel_hell",INK)
	_boss_value.hide()
	var poise_rail:=ColorRect.new();_boss.add_child(poise_rail);poise_rail.position=Vector2(-180,55);poise_rail.size=Vector2(360,6);poise_rail.color=Color("666666")
	var back:=ColorRect.new();poise_rail.add_child(back);back.position=Vector2.ONE;back.size=Vector2(358,4);back.color=Color(0,0,0,.6)
	_poise_fill=ColorRect.new();back.add_child(_poise_fill);_poise_fill.size=Vector2(358,4)
	_poise_label=_label(_boss,"",Vector2(182,56),Vector2(85,14),10,"font",Color("dddddd"))
	_poise_label.hide() # Source .bpow overflow:hidden clips the right:-52px label.
	_status_chip=Panel.new();_boss.add_child(_status_chip)
	var chip:=StyleBoxFlat.new();chip.bg_color=Color(0,0,0,.6);chip.border_color=Color("8888ff55");chip.set_border_width_all(1);chip.set_corner_radius_all(3);_status_chip.add_theme_stylebox_override("panel",chip)
	_status_icon=TextureRect.new();_status_chip.add_child(_status_icon);_status_icon.position=Vector2(6,4);_status_icon.size=Vector2(13,13)
	var shield:=Image.new();shield.load_svg_from_string(FileAccess.get_file_as_string("res://assets/boss_parity/shield_status.svg"));_status_icon.texture=ImageTexture.create_from_image(shield)
	_status_label=_label(_status_chip,"",Vector2(22,1),Vector2(70,20),14,"font",Color("8888ff"))
	_strip=Panel.new();add_child(_strip)
	_strip.mouse_filter=Control.MOUSE_FILTER_IGNORE
	_strip.size=Vector2(320,40)
	var plate:=StyleBoxFlat.new()
	plate.bg_color=Color(12.0/255,6.0/255,4.0/255,.94)
	plate.border_color=Color("6d4330");plate.set_border_width_all(1);plate.set_corner_radius_all(6)
	plate.shadow_color=Color(0,0,0,.7);plate.shadow_size=12
	_strip.add_theme_stylebox_override("panel",plate)
	_selection=_label(self,"",Vector2.ZERO,Vector2(320,30),15,"hell",Color("ffd080"))
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
	_selection_seconds=maxf(0,_selection_seconds-delta)
	_elapsed+=delta
	if _elapsed>=.1:
		_elapsed=0
		refresh_native_owners()

func _observe(key: String, result: Dictionary) -> void:
	if DISPATCH.HUD_SLOTS.has(key): _selected=key
	_selection_seconds=2.5
	_last_failure="" if result.get("accepted")==true else str(result.get("reason","owner_unready"))
	_failure_seconds=0 if _last_failure.is_empty() else 3
	refresh_native_owners()

func refresh_native_owners() -> void:
	if not is_node_ready(): return
	var extent:=get_viewport_rect().size
	_boss.position=Vector2(extent.x*.5,28) # source ui-inset-top10 + boss top18
	var hovered:=false
	var hud: Variant=_main.get("hud") if is_instance_valid(_main) else null
	if is_instance_valid(hud):
		for key in DISPATCH.HUD_SLOTS:
			var icon: Variant=hud._slot_icons.get(DISPATCH.HUD_SLOTS[key])
			if is_instance_valid(icon) and icon is Control and icon.get_global_rect().has_point(get_global_mouse_position()):
				_selected=key;hovered=true;break
	var center:=extent.x*.5
	var top:=extent.y-164
	if is_instance_valid(hud):
		var icon: Variant=hud._slot_icons.get(DISPATCH.HUD_SLOTS.get(_selected,""))
		if is_instance_valid(icon) and icon is Control:center=icon.get_global_rect().get_center().x;top=icon.get_global_rect().position.y-52
	_strip.position=Vector2(clampf(center-160,8,extent.x-328),top)
	_selection.position=_strip.position+Vector2(0,4)
	_failure.position=Vector2(clampf(center-330,8,extent.x-668),top-32)
	var state: Variant=_main.get("source_state") if is_instance_valid(_main) else null
	var p: Variant=state.read_current_p() if is_instance_valid(state) else null
	var g: Variant=state.read_current_g() if is_instance_valid(state) else null
	var live:=is_instance_valid(_main) and _main.is_inside_tree() and is_instance_valid(_adapter) and _adapter.is_inside_tree() and p is Dictionary and g is Dictionary
	_strip.visible=false # No counterpart in web #skBar.
	_selection.visible=false;_failure.visible=false
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
	var readiness: String=str(cd.get("text","")) if not cd.is_empty() else ("준비" if supported and learned else "사용 불가")
	_selection.text="%s · %s · %s" % [_selected,title,readiness]
	var resource_text: String="ST %d / %d    MP %d / %d    SP %d    악의 %d" % [p.st,p.mst,p.mp,p.mmp,p.sp,g.mats]
	_failure.text=_failure_text(_last_failure)
	_snapshot.merge({"selected_skill":sid if learned else "","selection_text":_selection.text,"cooldown":cd.duplicate(true),"resource_text":resource_text,"tooltip_visible":_strip.visible,"failure_text":_failure.text if _failure.visible else "","resources":{"st":p.st,"mst":p.mst,"mp":p.mp,"mmp":p.mmp,"sp":p.sp,"mats":g.mats}})
	var actor: Node=_main.get("native_demo_boss_actor")
	if not is_instance_valid(actor) or not actor.is_inside_tree() or actor.get_parent()!=_main.get("world"): return
	var boss: Dictionary=_main.read_native_demo_boss()
	var enemy: Dictionary=boss.get("enemy",{})
	if boss.get("status") not in ["READY","WAITING_OWNER"] or not _finite(enemy.get("hp")) or not _finite(enemy.get("mhp")) or enemy.mhp<=0 or enemy.hp<=0: return
	_boss.visible=true
	var deaths: int=int(enemy.get("deaths",0))
	_boss_name.text="다크드루이드"+(_tr(" [{mark} {n} 차 부활]").replace("{mark}","⚠" if deaths<=3 else "🔥").replace("{n}",str(deaths)) if deaths>0 else "")
	var stun: float=enemy.get("stunned",0);var immune: float=enemy.get("_pImmune",0)
	var poise: float=clampf(float(enemy.get("poise",1))/maxf(1,enemy.get("maxPoise",1)),0,1)
	if stun>0:
		poise=clampf(stun/maxf(1,enemy.get("_maxStunned",stun)),0,1);_poise_fill.color=Color("ffaa00");_poise_label.text=_tr("그로기! {s}s").replace("{s}","%.1f"%[stun/60])
	elif immune>0:
		poise=clampf(1-immune/300,0,1);_poise_fill.color=Color("8899ff");_poise_label.text=_tr("충전 중 {s}s").replace("{s}","%.1f"%[immune/60])
	else:
		_poise_fill.color=Color("ff6644") if poise<.3 else (Color("ffcc44") if poise<.6 else Color("dddddd"));_poise_label.text=_tr("포이즈 {p}%").replace("{p}",str(int(poise*100)))
	_poise_fill.size.x=358*poise
	_status_label.text=(_tr("면역 {s}s").replace("{s}","%.1f"%[immune/60])) if immune>0 else ((_tr("그로기 {s}s").replace("{s}","%.1f"%[stun/60])) if stun>0 else "")
	_status_chip.visible=not _status_label.text.is_empty()
	_status_icon.visible=immune>0
	var text_width: float=_status_label.get_theme_font("font").get_string_size(_status_label.text,HORIZONTAL_ALIGNMENT_LEFT,-1,14).x
	var chip_width: float=text_width+30
	_status_chip.position=Vector2(-chip_width/2,66);_status_chip.size=Vector2(chip_width,22);_status_label.size=Vector2(text_width,20)
	_boss_value.text="%d / %d" % [enemy.hp,enemy.mhp]
	var ratio:=clampf(float(enemy.hp)/float(enemy.mhp),0,1)
	_boss_fill.size.x=498*ratio
	_snapshot.merge({"boss_visible":true,"boss_hp":enemy.hp,"boss_max_hp":enemy.mhp,"boss_ratio":ratio,"boss_fill_px":_boss_fill.size.x,"boss_owner_status":boss.status},true)

static func _finite(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _failure_text(reason: String) -> String:
	match reason:
		"": return ""
		"unassigned_or_unlearned": return "사용 불가 · 스킬 미배정"
		"executor_interface_required","protected_poise_escape_interface_required": return "지금 사용할 수 없습니다."
		"source_global_or_actor_gate","dispatcher_not_configured_or_paused": return "사용 불가 · 현재 행동 상태"
		"slot_rule_or_absorbed": return "사용 불가 · 슬롯 또는 합체 상태"
		"ice_orb_active","ghost_walk_active": return "사용 불가 · 다른 스킬 사용 중"
		"cast_gate_refused": return "사용 불가 · 자원 또는 재사용 대기"
		_: return "사용 불가 · 상태 확인 필요"

func snapshot() -> Dictionary:
	return _snapshot.duplicate(true)

func _tr(key: String) -> String:
	return str(_locale.get(_language,_locale.get("en",{})).get(key,key))
