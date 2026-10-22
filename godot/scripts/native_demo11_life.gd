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
var _navigation := ""
var _stage_restore: Callable
const FONTS=preload("res://scripts/native_ui_fonts.gd")
const WORDS={"fallen":["쓰러졌습니다","You have fallen"],"dead":["다시 일어서라","Rise Again"],"retry":["재시작","Retry"],"lobby":["로비로 돌아가기","Return to Lobby"],"failed":["다시 시도하세요.","Please try again."],"count":["운명이 결정될 때까지 %d","%d until fate decides"],"loss":["EXP -%d","EXP -%d"]}
func word(key: String) -> String:
 return WORDS[key][0 if str(main.get_native_startup_language_snapshot().get("language","ko")).begins_with("ko") else 1]
func configure(owner: Node) -> void:
 main=owner;process_physics_priority=6
 main.native_player_life_phase_changed.connect(_phase)
 _build_view()
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
   remaining=300;_resolving=false
   var g: Dictionary=main.source_state.read_current_g()
   g.slowMo=maxf(float(g.get("slowMo",0)),30);g.shake=20
   _view.show();_title.text=word("fallen");_retry.hide();_lobby.hide();_update_count()
 elif s.phase=="alive":
  remaining=0;_view.hide();token="";_resolving=false
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
func _update_count() -> void:_body.text=word("count")%int(ceil(remaining/60))
func _show_dead() -> void:
 var g: Dictionary=main.source_state.read_current_g()
 if not g.get("_sStats") is Dictionary:g._sStats={}
 g._sStats.deaths=int(g._sStats.get("deaths",0))+1
 g.on=false
 for key in ["_ebBomb","_mmBomb","_gwLightning","_voidScarecrow"]:g[key]=null
 for key in ["_gsBombs","_bsBombs","_boneWalls","_fireZones","_stProjs","_ancestorReturns","_ancestors"]:g[key]=[]
 main.request_native_music_scene("death")
 _view.show();_title.text=word("dead")
 _body.text=word("loss")%int(float(main.source_state.read_current_p().get("exp",0))*.3)
 _retry.disabled=not _stage_restore.is_valid()
 _retry.show();_lobby.show()
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
  get_tree().call_deferred("change_scene_to_file","res://scenes/demo11_lobby.tscn")
 _navigation=""
func snapshot() -> Dictionary:
 return {"phase":main.read_native_player_life_phase(),"remaining":remaining,"roll_receipt":roll.duplicate(),"receipts":receipts.duplicate(true),"last":last.duplicate(true),"save":_save.duplicate(),"retry_stage_ready":_stage_restore.is_valid()}
func _build_view() -> void:
 _view=CanvasLayer.new();_view.layer=95;add_child(_view)
 var backdrop:=ColorRect.new();backdrop.color=Color(.025,.01,.015,.87);backdrop.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);_view.add_child(backdrop)
 var center:=CenterContainer.new();center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);_view.add_child(center)
 var panel:=PanelContainer.new();panel.custom_minimum_size=Vector2(780,460);center.add_child(panel)
 var style:=StyleBoxFlat.new();style.bg_color=Color("171011");style.border_color=Color("82634d");style.set_border_width_all(2);style.content_margin_left=48;style.content_margin_right=48;style.content_margin_top=48;style.content_margin_bottom=48;panel.add_theme_stylebox_override("panel",style)
 var box:=VBoxContainer.new();box.add_theme_constant_override("separation",26);panel.add_child(box)
 var crest:=TextureRect.new();crest.texture=preload("res://assets/ui/hell_gothic/crest.png");crest.custom_minimum_size.y=96;crest.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;crest.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED;box.add_child(crest)
 _title=Label.new();_title.add_theme_font_override("font",FONTS.stack("hell_title",700));_title.add_theme_font_size_override("font_size",44);_title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;box.add_child(_title)
 _body=Label.new();_body.add_theme_font_override("font",FONTS.stack("hell",400));_body.add_theme_font_size_override("font_size",24);_body.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;box.add_child(_body)
 _retry=_button(box,"retry");_retry.pressed.connect(func():
  var r: Dictionary=retry()
  if r.get("status")!="APPLIED":_body.text=word("failed"))
 _lobby=_button(box,"lobby");_lobby.pressed.connect(lobby)
 _view.hide()
func _button(box: Node,key: String) -> Button:
 var b:=Button.new();b.text=word(key);b.custom_minimum_size.y=58;b.add_theme_font_override("font",FONTS.stack("hell",700));b.add_theme_font_size_override("font_size",22);box.add_child(b);return b
