extends Node
## PCIA-WIRE: presentation/roll/countdown only; PC owns every life write.
signal transition_observed(receipt: Dictionary)
var main: Node
var token := ""
var roll: Dictionary={}
var remaining := 0.0
var receipts: Array=[]
var last: Dictionary={}
var _epoch := -1
var _resolving := false
var _view: CanvasLayer
var _title: Label
var _body: Label
var _retry: Button
var _lobby: Button
var _save: Dictionary={}
var _fallen_layer: CanvasLayer
var _fallen: Control
var _fallen_second := -1
var _fallen_count: Label
var _fallen_power: Label
var _fallen_fill: ColorRect
var _fallen_material: ShaderMaterial
var _frozen_field: TextureRect
var _screen: Control
var _subtitle: Label
var _pets: Control
var _replay_button: Button
var _replay_layer: Control
var _replay_image: TextureRect
var _replay_frames: Array=[]
var _replay_index:=0
var _replay_values: Array=[]
var _replay_bars: Control
var _replay_world: SubViewport
var _replay_capture_busy:=false
var _capture_generation:=0
var _replay_material: ShaderMaterial
var _play_generation:=0
var _play_cursor:=0
var _play_count:=0
var _play_first:=0
var _replay_time: Label
var _replay_fill: ColorRect
var _replay_tint: ColorRect
var _replay_died: Label
var _replay_can_skip:=false
var _replaying:=false
var _replay_timer: Timer
var _bonfire: TextureRect
var _bonfire_layer: CanvasLayer
var _bonfire_left:=0.0
var _bonfire_origin:=Vector2.ZERO
var _clock:=0.0
var _death_elapsed:=0.0
var _crow_text: Label
var _cat_text: Label
var _dialogue: Dictionary={}
var _dialogue_timer: Timer
var _dialogue_order: Array=[]
var _dialogue_at:=0
var _navigation := ""
var _stage_restore: Callable
const Surface=preload("res://scripts/native_parity_ui_surface.gd")
const FONTS=preload("res://scripts/native_ui_fonts.gd")
const WORDS={"fallen":["쓰러졌습니다","You have fallen"],"dead":["빛이 꺼졌다","The Light Has Faded"],"retry":["다시 일어서라","Rise Again"],"lobby":["로비로 돌아가기","Return to Lobby"],"failed":["다시 시도하세요.","Please try again."],"count":["운명이 결정될 때까지 %d","%d until fate decides"],"loss":["EXP -%d","EXP -%d"]}
func word(key: String) -> String:
 return Surface.I18N.text(str(WORDS[key][0]),str(main.get_native_startup_language_snapshot().get("language","ko")))
func configure(owner: Node) -> void:
 main=owner;process_physics_priority=6
 main.native_player_life_phase_changed.connect(_phase)
 _build_view()
 if get_tree().has_meta("parity_ui_02_retry"):
  var retained: Texture2D=get_tree().get_meta("parity_ui_02_retry")
  _screen.hide()
  get_tree().remove_meta("parity_ui_02_retry")
  var cover:=TextureRect.new();cover.texture=retained;cover.size=Vector2(1920,1080);cover.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;cover.mouse_filter=Control.MOUSE_FILTER_IGNORE;_view.add_child(cover);_view.show()
  var fade:=create_tween();fade.tween_property(cover,"modulate:a",0.0,2.5).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT);fade.tween_callback(func():cover.queue_free();_view.hide())
  _start_bonfire.call_deferred()
func _phase(s: Dictionary) -> void:
 # PC prohibits reentry while publishing. Terminal HP0 writes also finish first.
 _consume_phase.call_deferred(s.duplicate(true))
func _consume_phase(s: Dictionary) -> void:
 if not is_instance_valid(main) or not main.can_process():return
 var current: Dictionary=main.read_native_player_life_phase()
 if s.get("phase")!=current.get("phase") or s.get("death_token")!=current.get("death_token"):return
 if s.phase=="hp0":
  token=str(s.death_token)
  var once: Dictionary=_request("revive_once")
  if once.get("status")=="APPLIED":return
  if once.get("reason")!="revive_once_not_eligible":return
  roll=_death_roll()
  if roll.is_empty():return
  var p: Dictionary=main.source_state.read_current_p()
  p._fallenRevChance=roll.chance;p._fallenRevCdFrames=roll.cd_frames;p._fallenCanRevive=roll.can_revive;p._fallenRevRoll=roll.roll
  var fallen: Dictionary=_request("fallen_enter")
  if fallen.get("status")=="APPLIED":
   remaining=300;_fallen_second=-1;_resolving=false
   var g: Dictionary=main.source_state.read_current_g()
   g.slowMo=maxf(float(g.get("slowMo",0)),30);g.shake=20
   _view.show();_screen.hide();_fallen.show();_update_count()
 elif s.phase=="alive":
  remaining=0;_fallen.hide();_view.hide();token="";_resolving=false
 elif s.phase=="dead":
  _show_dead()
func _request(op: String,extra: Dictionary={}) -> Dictionary:
 var request: Dictionary={"op":op,"request_id":token+":"+op+":"+str(extra.get("step","")),"player":main.player,"death_token":token}
 request.merge(extra,true)
 last=main.request_native_player_life_transition(request)
 receipts.append(last.duplicate(true));transition_observed.emit(last.duplicate(true))
 return last
func _death_roll() -> Dictionary:
 var p: Dictionary=main.source_state.read_current_p()
 var passive: Dictionary=main.source_state.read_current_passives()
 var power: Dictionary=main.read_native_source_equipment_affix("revivePow")
 var cd: Dictionary=main.read_native_source_equipment_affix("reviveCd")
 var implicit: Dictionary=main.source_providers.get_provider_bundle().formula.eq_implicit("_iRevPow")
 for r in [power,cd,implicit]:
  if str(r.get("status")) not in ["READY","READY_PARTIAL_AFTER_SOURCE_THROW"]:return {}
 var zone_bonus:=0.0
 for zone in main.source_state.read_current_g().get("_fireZones",[]):
  if zone.get("type")=="weakRev" and main.player.global_position.distance_to(Vector2(float(zone.x),float(zone.y)))<float(zone.r):
   zone_bonus=.10+(float(zone.get("lv",1))-1)*.01;break
 var demon: float=float(passive.get("pDemon",0))
 var chance: float=clampf(minf(100,int(float(p.lv)*.03))+demon*2+(float(power.value)+float(implicit.value)*.01+zone_bonus)*100-float(passive.get("pHuman",0))*10,0,100)
 var frames: int=int(maxf(6000,36000-demon*1800)*(1+float(cd.value)))
 # G43736 sample draw precedes the single G43751 roll. Audio availability is separate.
 var death_sample: int=1+int(main.world.sample_native_random_unit()*4)
 var death_pitch: float=1+(main.world.sample_native_random_unit()-.5)*.2
 main.set_meta("native_life_death_sample",{"index":death_sample,"pitch":death_pitch})
 return {"can_revive":chance>0 and float(p.get("_demonRevCd",0))<=0,"chance":chance,"cd_frames":frames,"roll":main.world.sample_native_random_unit()*100}
func _physics_process(_delta: float) -> void:
 if main==null:return
 _poll_save()
 var g: Dictionary=main.source_state.read_current_g()
 if get_tree().paused or g.get("paused",false) or not g.get("on",false):return
 var context: Dictionary=main.world.get_native_projectile_fx_context()
 var epoch: int=int(context.frame_reset_epoch)
 if epoch==_epoch:return
 _epoch=epoch
 var ticks: float=float(context.dt_sp)
 var p: Dictionary=main.source_state.read_current_p()
 if float(p.get("_demonRevCd",0))>0:p._demonRevCd=maxf(0,float(p._demonRevCd)-ticks)
 if remaining<=0 or _resolving:return
 remaining=maxf(0,remaining-ticks);_update_count()
 if remaining==0:
  _resolving=true
  _request("revive_resolve" if roll.can_revive and roll.roll<roll.chance else "final_death",{"roll_receipt":roll})
func _update_count() -> void:
 var sec:=int(ceil(remaining/60))
 # Presentation strings/theme updates are events, not per-source-tick allocations.
 if sec!=_fallen_second:
  _fallen_second=sec
  _fallen_count.text=str(sec)+"s"
  _fallen_count.add_theme_color_override("font_color",Color("ff3333" if sec<=1 else "ff7744" if sec<=2 else "ffcc44"))
  _fallen_power.text=Surface.I18N.text("부활력 ")+str(roll.get("chance",0))+"%" if roll.get("can_revive",false) else Surface.I18N.text("부활 불가")
 _fallen_fill.size.x=300*remaining/300.0
 _fallen_material.set_shader_parameter("progress",remaining/300.0)
func _show_dead() -> void:
 # G43869 stops frame updates: keep the last fallen canvas beneath CSS death fade.
 if DisplayServer.get_name()!="headless":
  if not is_instance_valid(_frozen_field):
   _frozen_field=TextureRect.new();_frozen_field.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;_frozen_field.size=Vector2(1920,1080);_frozen_field.mouse_filter=Control.MOUSE_FILTER_IGNORE;_view.add_child(_frozen_field);_view.move_child(_frozen_field,0)
  _frozen_field.texture=ImageTexture.create_from_image(get_viewport().get_texture().get_image());_frozen_field.show()
 var g: Dictionary=main.source_state.read_current_g()
 if not g.get("_sStats") is Dictionary:g._sStats={}
 g._sStats.deaths=int(g._sStats.get("deaths",0))+1
 g._ddDeaths=int(g.get("_ddDeaths",0))+1
 if not g.get("_ddChapDeathMap") is Dictionary:g._ddChapDeathMap={}
 g._ddChapDeathMap[0]=int(g._ddChapDeathMap.get(0,0))+1
 g.on=false
 for key in ["_ebBomb","_mmBomb","_gwLightning","_voidScarecrow"]:g[key]=null
 for key in ["_gsBombs","_bsBombs","_boneWalls","_fireZones","_stProjs","_ancestorReturns","_ancestors"]:g[key]=[]
 main.request_native_music_scene("death")
 _death_elapsed=0
 _fallen.hide()
 _view.show();_screen.show();_title.text=word("dead");_subtitle.show();_pets.show()
 _body.text="💀 %d 처치 | 1장 — 썩은 숲 | EXP -%d | 🔥 최대콤보 %d" % [int(g.get("kills",0)),int(float(main.source_state.read_current_p().get("exp",0))*.3),int(g.get("comboMax",0))]
 _screen.modulate.a=0
 var fade:=create_tween();fade.tween_method(_death_fade,0.0,1.0,2.5);fade.tween_callback(func():if is_instance_valid(_frozen_field):_frozen_field.hide())
 _replay_button.disabled=_replay_frames.is_empty();_replay_button.show()
 _start_dialogue()
 _retry.disabled=not _stage_restore.is_valid()
 _retry.show();_lobby.show()
func _death_fade(x: float) -> void:
 # CSS ease-out = cubic-bezier(0,0,.58,1), invert its x component.
 var lo:=0.0;var hi:=1.0
 for i in 16:
  var t: float=(lo+hi)*.5;var bx: float=3*(1-t)*t*t*.58+t*t*t
  if bx<x:lo=t
  else:hi=t
 var t: float=(lo+hi)*.5;_screen.modulate.a=3*(1-t)*t*t+t*t*t
func bind_stage_restore(owner: Node,callback: Callable) -> bool:
 if owner!=main or not callback.is_valid() or _stage_restore.is_valid():return false
 _stage_restore=callback
 _retry.disabled=false
 return true
func retry() -> Dictionary:
 # Stage construction is a distinct owner. Do not debit EXP or claim restart
 # until it can perform G63478–63520 on this actual run.
 if not _stage_restore.is_valid():return {"status":"NOT_READY","reason":"native_stage_reconstruction_owner_absent"}
 if main.read_native_player_life_phase().phase not in ["dead","respawning"]:return {"status":"NOT_READY","reason":"retry_requires_final_death"}
 if main.source_state.read_current_g().get("_bossArena",false):return {"status":"NOT_READY","reason":"boss_restore_owner_unavailable"}
 if main.read_native_player_life_phase().phase=="dead":
  var loss: Dictionary=_request("respawn",{"step":"exp_loss"})
  if loss.get("status")!="APPLIED":return loss
 var stage: Dictionary=_stage_restore.call(main)
 if stage.get("status")!="READY":return stage
 var reset: Dictionary=_request("respawn",{"step":"reset"})
 if reset.get("status")=="APPLIED":
  main.source_state.read_current_g().on=true
  # Retained screenshot is presentation only; headless has no viewport image.
  if DisplayServer.get_name()!="headless":
   var retry_image: Image=get_viewport().get_texture().get_image()
   if retry_image!=null and not retry_image.is_empty():
    get_tree().set_meta("parity_ui_02_retry",ImageTexture.create_from_image(retry_image))
  _replay_frames.clear();_dialogue_timer.stop();_pets.hide()
  _save=main.save_native_demo11_current();_navigation="retry_reload" if stage.get("reload_after_save",false) else "retry"
 return reset
func lobby() -> Dictionary:
 if main.read_native_player_life_phase().phase!="lobby":
  var prepared: Dictionary=_request("lobby_prepare")
  if prepared.get("status") not in ["APPLIED","SOURCE_RETURN"]:return prepared
 _save=main.save_native_demo11_current();_navigation="lobby"
 _poll_save();return _save
func _poll_save() -> void:
 if _navigation.is_empty():return
 if not _save.get("settled",true):return
 if not _save.get("committed",false):
  _body.text=word("failed");_navigation="";return
 if _navigation=="retry_reload":
  get_tree().call_deferred("reload_current_scene")
 if _navigation=="lobby":
  get_tree().set_meta("native_demo_return_language",main.get_native_startup_language_snapshot().get("language","ko"))
  get_tree().call_deferred("change_scene_to_file","res://scenes/demo_lobby.tscn")
 _navigation=""
func snapshot() -> Dictionary:
 return {"phase":main.read_native_player_life_phase(),"remaining":remaining,"roll_receipt":roll.duplicate(),"receipts":receipts.duplicate(true),"last":last.duplicate(true),"save":_save.duplicate(),"retry_stage_ready":_stage_restore.is_valid()}
func _build_view() -> void:
 # game.html:646–663,3101: full cover image and centered flex column.
 _view=CanvasLayer.new();_view.layer=95;add_child(_view)
 _fallen_layer=CanvasLayer.new();_fallen_layer.layer=9;add_child(_fallen_layer)
 _fallen=Control.new();_fallen.size=Vector2(1920,1080);_fallen.mouse_filter=Control.MOUSE_FILTER_IGNORE;_fallen_layer.add_child(_fallen)
 var tint:=ColorRect.new();tint.size=_fallen.size;tint.mouse_filter=Control.MOUSE_FILTER_IGNORE;_fallen.add_child(tint)
 _fallen_material=ShaderMaterial.new();_fallen_material.shader=preload("res://shaders/parity_fallen.gdshader");tint.material=_fallen_material
 Surface.panel(_fallen,Rect2(820,401.6,280,88),Color(0,0,0,.4875),Color(.706,.118,.118,.4875))
 _fallen_power=Surface.text(_fallen,"",Rect2(820,411.6,280,30),14,Color("ffccaa"),"font",700);_fallen_power.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 _fallen_count=Surface.text(_fallen,"",Rect2(820,421.6,280,66),52,Color("ffcc44"),"font",700);_fallen_count.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 var fallen_label:=Surface.text(_fallen,"쓰러짐...",Rect2(820,476.6,280,22),12,Color("cc886699"),"font");fallen_label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 Surface.panel(_fallen,Rect2(810,918,300,8),Color("220000b3"),Color("ff643266"))
 _fallen_fill=ColorRect.new();_fallen_fill.position=Vector2(810,918);_fallen_fill.size=Vector2(300,8);_fallen_fill.color=Color("ff6644b3");_fallen.add_child(_fallen_fill);_fallen.hide()
 var mono:=SystemFont.new();mono.font_names=PackedStringArray(["monospace"])
 for label_node in [_fallen_power,_fallen_count,fallen_label]:label_node.add_theme_font_override("font",mono)
 _screen=Control.new();_screen.size=Vector2(1920,1080);_view.add_child(_screen)
 var art:=Surface.art(_screen,"img/cin_remember_wide.png",Rect2(0,0,1920,1080));art.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_COVERED
 _title=Surface.text(_screen,word("dead"),Rect2(600,382,720,60),45,Color(.855,.824,.757,.94),"hell_title",700);_title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;var title_font:=FONTS.stack("hell_title",700).duplicate();preload("res://scripts/native_ui_fonts.gd").apply_spacing(title_font,int(6));_title.add_theme_font_override("font",title_font)
 _subtitle=Surface.text(_screen,"누군가는 너를 기다리고 있다",Rect2(560,452,800,32),20,Color(.776,.722,.620,.82),"hell");_subtitle.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;var sub_font:=FONTS.stack("hell",400).duplicate();preload("res://scripts/native_ui_fonts.gd").apply_spacing(sub_font,int(2));_subtitle.add_theme_font_override("font",sub_font)
 _body=Surface.text(_screen,"",Rect2(400,498,1120,33),18,Color(.682,.592,.435,.82),"cinzel_hell");_body.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;var info_font:=FONTS.stack("cinzel_hell",400).duplicate();preload("res://scripts/native_ui_fonts.gd").apply_spacing(info_font,int(2));_body.add_theme_font_override("font",info_font)
 _retry=_button("retry",Rect2(865,555,190,45),17);_retry.pressed.connect(func():
  var r: Dictionary=retry()
  if r.get("status")!="APPLIED":_body.text=word("failed"))
 _replay_button=_button("",Rect2(878,608,164,39),13);_replay_button.text="리플레이 보기";_replay_button.pressed.connect(_play_replay)
 _lobby=_button("lobby",Rect2(870,655,180,40),13);_lobby.pressed.connect(lobby)
 _pets=Control.new();_pets.position=Vector2(231,580);_pets.scale=Vector2.ONE*1.5;_pets.mouse_filter=Control.MOUSE_FILTER_IGNORE;_screen.add_child(_pets)
 Surface.art(_pets,"img/crow/portrait.png",Rect2(0,0,480,320))
 Surface.art(_pets,"img/cat_pet/portrait.png",Rect2(492,0,480,320))
 _crow_text=Surface.text(_pets,"…죽었군. 하지만 여신은 아직 널 안 놓았어.",Rect2(92,237,306,51),15,Color.WHITE,"pet",700);_crow_text.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;_crow_text.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
 _cat_text=Surface.text(_pets,"괜찮아?! 다시 일어설 수 있어, 포기하지 마!",Rect2(614,250,190,42),15,Color.WHITE,"pet",700);_cat_text.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;_cat_text.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
 var pet_font:=SystemFont.new();pet_font.font_names=PackedStringArray(["Malgun Gothic","Arial","Apple SD Gothic Neo","sans-serif"]);pet_font.font_weight=700
 for bubble in [_crow_text,_cat_text]:
  bubble.add_theme_font_override("font",pet_font);bubble.add_theme_constant_override("line_spacing",0)
  var target:=Vector2(306,51) if bubble==_crow_text else Vector2(190,42);bubble.scale=Vector2.ONE*(14.72/15.0);bubble.set_deferred("size",target/(14.72/15.0))
 _replay_layer=Surface.panel(_view,Rect2(0,0,1920,1080),Color.BLACK);_replay_layer.hide()
 var replay_shader:=Shader.new();replay_shader.code="shader_type canvas_item;uniform float intensity=.05;void fragment(){vec4 c=texture(TEXTURE,UV);c.rgb=mix(c.rgb,vec3(.313725,0,0),intensity);float box=max(clamp(1.0-UV.y/.08,0.0,1.0),clamp((UV.y-.92)/.08,0.0,1.0))*.7;c.rgb*=1.0-box;COLOR=c;}"
 _replay_material=ShaderMaterial.new();_replay_material.shader=replay_shader
 _replay_image=TextureRect.new();_replay_image.material=_replay_material;_replay_image.size=Vector2(1920,1080);_replay_image.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;_replay_image.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED;_replay_layer.add_child(_replay_image)
 Surface.text(_replay_layer,"☠ 사망 리플레이",Rect2(500,18,920,40),26,Color("cc4444"),"font",700).horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 _replay_time=Surface.text(_replay_layer,"",Rect2(500,1008,920,32),18,Color(.784,.627,.471,.8),"font");_replay_time.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 _replay_fill=ColorRect.new();_replay_fill.position=Vector2(192,1056);_replay_fill.size=Vector2(0,4);_replay_fill.color=Color("cc4444");_replay_fill.mouse_filter=Control.MOUSE_FILTER_IGNORE;_replay_layer.add_child(_replay_fill)
 _replay_bars=Control.new();_replay_bars.mouse_filter=Control.MOUSE_FILTER_IGNORE;_replay_layer.add_child(_replay_bars)
 _replay_died=Surface.text(_replay_layer,"YOU DIED",Rect2(400,430,1120,220),100,Color(.706,.157,.157,.95),"hell",700);_replay_died.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;_replay_died.hide()
 _replay_layer.gui_input.connect(func(e):
  if e is InputEventMouseButton and e.pressed and _replaying and _replay_can_skip:_finish_replay())
 if DisplayServer.get_name()!="headless":
  # World2D canvas only. Independent480×270 render target has no HUD/panel CanvasLayers.
  _replay_world=SubViewport.new();_replay_world.size=Vector2i(480,270);_replay_world.world_2d=get_viewport().world_2d;_replay_world.render_target_update_mode=SubViewport.UPDATE_DISABLED;add_child(_replay_world)
 _replay_timer=Timer.new();_replay_timer.ignore_time_scale=true;_replay_timer.wait_time=.1;_replay_timer.timeout.connect(_capture_replay);add_child(_replay_timer);_replay_timer.start()
 _dialogue=JSON.parse_string(FileAccess.get_file_as_string("res://data/parity_ui_02_death_dialogue.json"))
 _dialogue_timer=Timer.new();_dialogue_timer.ignore_time_scale=true;_dialogue_timer.wait_time=10;_dialogue_timer.timeout.connect(_next_dialogue);add_child(_dialogue_timer)
 _view.hide()
func _start_dialogue() -> void:
 _dialogue_order=_dialogue.pool.duplicate();_dialogue_order.shuffle();_dialogue_order.push_front(_dialogue_event());_dialogue_at=0;_render_dialogue();_dialogue_timer.start()
func _render_dialogue() -> void:
 var line: Array=_dialogue.lines[_dialogue_order[_dialogue_at]]
 _crow_text.text=Surface.I18N.text(str(line[0]));_cat_text.text=Surface.I18N.text(str(line[1]))
func _next_dialogue() -> void:
 if not _screen.visible or not _retry.visible:_dialogue_timer.stop();return
 _dialogue_at+=1
 if _dialogue_at>=_dialogue_order.size():_dialogue_order=_dialogue.pool.duplicate();_dialogue_order.shuffle();_dialogue_at=0
 _pets.modulate.a=0
 await get_tree().create_timer(.2,true,false,true).timeout
 _render_dialogue()
 create_tween().tween_property(_pets,"modulate:a",1.0,.25)
func _button(key: String,rect: Rect2,px: int) -> Button:
 var b:=Button.new();b.text=word(key) if not key.is_empty() else "";b.position=rect.position;b.size=rect.size;var font:=FONTS.stack("hell_title",700).duplicate();preload("res://scripts/native_ui_fonts.gd").apply_spacing(font,int(2));b.add_theme_font_override("font",font);b.add_theme_font_size_override("font_size",px);b.add_theme_color_override("font_color",Color(.855,.824,.757,.9))
 var style:=StyleBoxFlat.new();style.bg_color=Color(.031,.024,.02,.42);style.border_color=Color(.553,.486,.376,.58);style.set_border_width_all(1);b.add_theme_stylebox_override("normal",style)
 var hover:=style.duplicate();hover.bg_color=Color(.31,.208,.133,.34);hover.border_color=Color(.718,.651,.506,.8);b.add_theme_stylebox_override("hover",hover);b.add_theme_stylebox_override("pressed",hover);_screen.add_child(b);return b
func _capture_replay() -> void:
 # Original G43618–43644: 10Hz, 480px max axis, 50 rolling frames. Never physics-tick IO/loading.
 if DisplayServer.get_name()=="headless" or not _capture_owner_ready():return
 var current_g: Variant=main.source_state.read_current_g()
 if get_tree().paused or not current_g is Dictionary or not current_g.get("on",false):return
 if _replay_capture_busy or not is_instance_valid(_replay_world):return
 _replay_capture_busy=true
 var generation: int=_capture_generation
 var viewport: SubViewport=_replay_world
 viewport.canvas_transform=Transform2D(Vector2(.25,0),Vector2(0,.25),Vector2.ZERO)*get_viewport().canvas_transform
 viewport.render_target_update_mode=SubViewport.UPDATE_ONCE
 await RenderingServer.frame_post_draw
 _replay_capture_busy=false
 # The render fence may cross Main retirement/retry. Never dereference that old world.
 if generation!=_capture_generation or not _capture_owner_ready():return
 if not is_instance_valid(viewport) or viewport.is_queued_for_deletion() or not viewport.is_inside_tree():return
 var texture: ViewportTexture=viewport.get_texture()
 if texture==null or not texture.get_rid().is_valid():return
 var image: Image=texture.get_image()
 if image==null or image.is_empty():return
 var p: Variant=main.source_state.read_current_p()
 if not p is Dictionary:return
 var values: Dictionary={}
 for key in ["hp","mhp","st","mst","mp","mmp","shield","mshield"]:values[key]=p.get(key,0)
 if _replay_values.size()<50:_replay_values.append(values)
 else:_replay_values[_replay_index]=values
 if _replay_frames.size()<50:_replay_frames.append(ImageTexture.create_from_image(image))
 else:(_replay_frames[_replay_index] as ImageTexture).update(image)
 _replay_index=(_replay_index+1)%50
func _capture_owner_ready() -> bool:
 return is_inside_tree() and not is_queued_for_deletion() and is_instance_valid(main) and main.is_inside_tree() and not main.is_queued_for_deletion() and is_instance_valid(main.source_state) and not main.source_state.is_queued_for_deletion()
func _exit_tree() -> void:
 _capture_generation+=1
 _play_generation+=1
 if is_instance_valid(_replay_timer):_replay_timer.stop()
 if is_instance_valid(_replay_world):_replay_world.render_target_update_mode=SubViewport.UPDATE_DISABLED
func _play_replay() -> void:
 if _replay_frames.is_empty() or _replaying:return
 _replay_layer.show();_pets.hide();_replaying=true;_replay_can_skip=false;_replay_image.texture=null;_replay_time.text="";_replay_died.hide();_replay_fill.size.x=0
 _play_generation+=1;var generation: int=_play_generation
 _play_cursor=0;_play_count=_replay_frames.size();_play_first=_replay_index if _play_count==50 else 0
 # G43717 calls tick immediately AND G43663 calls it again after1500ms.
 # Preserve that actual shared-cursor schedule, rather than correcting its comment.
 _replay_tick(generation)
 await get_tree().create_timer(1.5,true,false,true).timeout
 if not _replaying or generation!=_play_generation:return
 _replay_can_skip=true;_replay_tick(generation)
func _replay_tick(generation: int) -> void:
 if not _replaying or generation!=_play_generation:return
 if _play_cursor>=_play_count:
  _replay_died.show()
  await get_tree().create_timer(1.5,true,false,true).timeout
  if _replaying and generation==_play_generation:_finish_replay()
  return
 var i: int=_play_cursor
 _replay_image.texture=_replay_frames[(_play_first+i)%_play_count]
 _replay_time.text="-%.1fs  "%(float(_play_count-i)/10)+Surface.I18N.text("(클릭: 건너뛰기)")
 _replay_fill.size.x=1536*float(i)/_play_count
 _replay_material.set_shader_parameter("intensity",.05+.25*float(i)/_play_count)
 _render_replay_bars(_replay_values[(_play_first+i)%_play_count])
 _play_cursor+=1
 await get_tree().create_timer(.4 if _play_cursor>=_play_count-15 else .2,true,false,true).timeout
 _replay_tick(generation)
func _unhandled_input(event: InputEvent) -> void:
 if _replaying and _replay_can_skip and event is InputEventJoypadButton and event.pressed and event.button_index in [0,1,2,3]:_finish_replay();get_viewport().set_input_as_handled()
func _finish_replay() -> void:
 _replaying=false;_play_generation+=1;_replay_layer.hide();_pets.show()
func _start_bonfire() -> void:
 _bonfire_origin=main.player.global_position
 # G63523,55323–55333: radius280 /300frames, .9 alpha, final120frames fade, 3% pulse.
 _bonfire_layer=CanvasLayer.new();_bonfire_layer.layer=6;add_child(_bonfire_layer)
 _bonfire=TextureRect.new();_bonfire.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;_bonfire.texture=preload("res://assets/sprites/bonfire_barrier.png");_bonfire.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;_bonfire.mouse_filter=Control.MOUSE_FILTER_IGNORE;_bonfire_layer.add_child(_bonfire);_bonfire_left=5.0
func _process(delta: float) -> void:
 if is_instance_valid(_screen) and _screen.visible and _retry.visible:
  _death_elapsed+=delta
  _title.modulate.a=.55-.25*cos(_death_elapsed*TAU/5)
 if _bonfire_left<=0 or not is_instance_valid(_bonfire):return
 _clock+=delta;_bonfire_left=maxf(0,_bonfire_left-delta)
 _bonfire.size=Vector2.ONE*560*(1+sin(_clock/.3)*.03)
 _bonfire.position=main.player.get_viewport_transform()*_bonfire_origin-_bonfire.size*.5
 _bonfire.modulate.a=minf(1,_bonfire_left/2)*.9
 if _bonfire_left==0:_bonfire_layer.queue_free()

func _dialogue_event() -> String:
 # Source _ddPickEvent G43794–43816. Only observe native-owned fields.
 var g: Dictionary=main.source_state.read_current_g()
 var deaths: int=int(g.get("_ddDeaths",1))
 if deaths<=1:return "dd_first"
 var boss: Variant=g.get("_bossRef")
 if boss is Dictionary and boss.get("alive",false):
  if float(boss.get("mhp",0))>0 and float(boss.get("hp",0))/float(boss.mhp)<=.15:return "dd_boss_lowhp"
  return "dd_boss"
 var logs: Array=g.get("_dmgLog",[])
 var source: String=str(logs[-1].get("src","")) if not logs.is_empty() else ""
 for row in [["레어|Rare","dd_rare"],["그랩|잡히|Grab|grab","dd_grab"],["도트|장판|DoT|Zone|dot","dd_dot"],["투사체|탄|Projectile|Bullet|bullet","dd_proj"]]:
  var regex:=RegEx.new();regex.compile(row[0])
  if regex.search(source)!=null:return row[1]
 if deaths>=10:return "dd_repeat10"
 if int(g.get("_ddChapDeathMap",{}).get(0,0))>=3:return "dd_chapter_repeat"
 if deaths>=5:return "dd_repeat5"
 if int(g.get("combo",0))>=50:return "dd_highcombo"
 return "dd_ch0"
func _render_replay_bars(values: Dictionary) -> void:
 for child in _replay_bars.get_children():_replay_bars.remove_child(child);child.queue_free()
 # Overlay drawn at original 480×270 resolution and scaled with the replay.
 _replay_bars.scale=Vector2.ONE*4
 var rows: Array=[["hp","mhp","cc2222","331111","HP %d/%d"%[values.hp,values.mhp]]]
 if float(values.mshield)>0:rows.append(["shield","mshield","6688cc","112244","SH"])
 rows.append_array([["st","mst","22aa44","112211","ST"],["mp","mmp","4466cc","111133","MP"]])
 for i in rows.size():
  var row: Array=rows[i];var y: int=248+i*5
  Surface.panel(_replay_bars,Rect2(14,y,120,4),Color(str(row[3]),.85),Color(1,1,1,.2))
  Surface.panel(_replay_bars,Rect2(14,y,int(120*clampf(float(values[row[0]])/maxf(1,float(values[row[1]])),0,1)),4),Color(str(row[2]),.85))
  Surface.text(_replay_bars,str(row[4]),Rect2(17,y-3,120,10),9,Color.WHITE,"font",700)
