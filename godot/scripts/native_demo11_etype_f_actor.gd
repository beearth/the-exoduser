extends "res://scripts/enemy_melee_ch1_ice_warrior.gd"
## F-only state owner. Existing atlas/collider/hurtE/poise kernels are inherited.
## Neither the type20 nor type0 autonomous AI is called.
const F_TYPES := [26,27,28]
const F_FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
var f_ready := false
var f_fault := ""
var f_not_ready: Dictionary={}
var f_pending: Dictionary={}
var f_contact_owner: Callable
var f_freeze_owner: Callable
var _icicle_index:=0
var _icicles_active:=false
var f_ticks := 0
var f_source: Dictionary = {}
var f_projectile_owner: Callable
func configure(value: Dictionary, owner_world: Node2D) -> void:
 if value.get("etype") not in F_TYPES or value.get("ai_profile")!="demo11_group_f_v1": return
 super.configure(value,owner_world)
 f_source=data.native_final
 f_ready=true
func _source_normal_fields_domain_current() -> bool:
 return etype in F_TYPES and data.get("ai_profile")=="demo11_group_f_v1" and elite==0 and mods.is_empty()
func _ready() -> void:
 super._ready()
 set_physics_process(false) # tree entry must not re-enable autonomous AI
func _physics_process(_delta: float) -> void: pass
func is_native_registry_ready() -> bool: return f_ready
func _f_stop(reason: String) -> void:
 f_fault=reason
 telemetry_event.emit("etype_f_not_ready",{"etype":etype,"reason":reason})
func advance_native_phase(ticks: float, _frame: float, _enemies: Array) -> void:
 if not f_ready or not f_fault.is_empty() or not alive or not is_instance_valid(player) or ticks<=0: return
 f_ticks+=1
 native_frame+=ticks
 var before:=global_position
 for key in ["_frozen","poison","bleed","burnT"]:
  if float(f_source.get(key,0))>0: _f_stop("unported_active_status:"+key);return
 if _knockback.length_squared()>0.02:
  _move_native(_knockback,ticks)
  _knockback*=pow(0.85,ticks)
 _hit_stun=maxf(0,_hit_stun-ticks)
 _stun_ticks=maxf(0,_stun_ticks-ticks)
 _spawn_ticks=maxf(0,_spawn_ticks-ticks)
 _hit_flash=maxf(0,_hit_flash-ticks)
 if _hit_stun>0 or _stun_ticks>0:
  _finish_motion(before,ticks);return
 if poise<max_poise:
  _poise_regen+=ticks
  if _poise_regen>=float(data.poise_regen_ticks):
   poise=minf(max_poise,poise+floorf(max_poise*float(data.poise_regen_fraction)))
   _poise_regen=0
 var d:=global_position.distance_to(player.global_position)
 if not alerted and d<800 and world.has_line_of_sight(global_position,player.global_position): alerted=true
 if alerted and d<800: facing=(player.global_position-global_position).angle()
 if alerted and state in ["idle","recover"]:
  var range_value: float=data.projectile_range
  if d>range_value*0.85: _move_flow(ticks)
  elif d<range_value*0.65 and d>30:
   var retreat:=global_position+Vector2.from_angle((global_position-player.global_position).angle())*float(data.speed_pixels_per_tick)*ticks*0.5
   if not world.is_world_blocked(retreat): global_position=retreat
  d=global_position.distance_to(player.global_position)
 if (not alerted and d>400) or float(player.hp)<=0: _finish_motion(before,ticks);return
 if charge_ticks>0:
  charge_ticks-=ticks
  if charge_ticks<=0 and not _request("charged_projectile",{"actor":self}): charge_ticks=0
 st2-=ticks
 if etype==26 and state=="idle":
  if not f_pending.has("blizzard"): f_source._iceBlizzT-=ticks
  if f_source._iceBlizzT<=0 and d<1200:
   if not f_pending.has("blizzard"):
    f_pending.blizzard={"x":player.global_position.x+(world.sample_native_random_unit()-0.5)*60,
     "y":player.global_position.y+(world.sample_native_random_unit()-0.5)*60,"vx":0,"vy":0,
     "dmg":F_FORMULA.js_to_int32(attack*0.3),"el":3,"friendly":false,"life":180,"ml":180,"col":"#5e10a8","sz":3,"blizzard":true}
   if _request("blizzard",f_pending.blizzard): f_source._iceBlizzT=f_source._iceBlizzCd
 if etype==27 and state=="idle":
  if not _icicles_active: f_source._iceSwoopT-=ticks
  if not _icicles_active and f_source._iceSwoopT<=0 and d<1200 and d>50:
   f_source._iceSwoopOx=global_position.x;f_source._iceSwoopOy=global_position.y
   state="eSwoop";st2=15;f_source.echDx=cos(facing);f_source.echDy=sin(facing)
   f_source._iceSwoopT=f_source._iceSwoopCd
   _icicle_index=0;_icicles_active=true
  if d>50 and d<1200:
   var orbit: float=(global_position-player.global_position).angle()+0.05*ticks
   var target:=player.global_position+Vector2.from_angle(orbit)*120
   _move_native((target-global_position).normalized()*float(data.speed_pixels_per_tick),ticks)
 if _icicles_active: _icicles()
 if etype==28 and state=="idle":
  f_source._iceSlamT-=ticks
  if f_source._iceSlamT<=0 and d<100:
   state="eSlamWind";st2=50;f_source._iceSlamT=f_source._iceSlamCd
   if d<90:
    if f_freeze_owner.is_valid(): f_freeze_owner.call(120.0)
    else: f_not_ready.freeze_slow="actual_Player_freeze_API_required"
 if state=="idle":
  if etype==26:
   if d<80: _move_native(-Vector2.from_angle(facing)*float(data.speed_pixels_per_tick)*0.6,ticks)
   elif d>200: _move_native(Vector2.from_angle(facing)*float(data.speed_pixels_per_tick)*1.2,ticks)
  elif etype!=27: _move_native(Vector2.from_angle(facing)*float(data.speed_pixels_per_tick)*1.6,ticks)
  _apply_separation(ticks)
  if charge_ticks<=0:
   _projectile_ticks-=ticks
   if _projectile_ticks<=0 and d<float(data.projectile_range): _projectile_ticks=240;charge_ticks=60
 elif state=="eSwoop":
  var destination:=global_position+Vector2(float(f_source.echDx),float(f_source.echDy))*6*ticks
  if world.can_move(destination,radius): global_position=destination
  else: state="recover";st2=25;_finish_motion(before,ticks);return
  if global_position.distance_to(player.global_position)<float(player.radius)+radius+8 and float(player.iframes)<=0:
   if _request("swoop_contact",{"actor":self,"damage_multiplier":1.8,"knockback":6,"source_line":40544}): state="recover";st2=35
  if st2<=0: state="recover";st2=35
 elif state=="eSlamWind" and st2<=0:
  var sr: float=70+radius
  if _request("slam_contact",{"actor":self,"radius":sr,"damage_multiplier":2,"player_knockback":10,"enemy_knockback":6,"source_line":40550}):
   f_source.shockR=0;f_source.shockMax=sr;state="recover";st2=50
 elif state=="recover" and st2<=0: state="idle";st2=15+world.sample_native_random_unit()*15
 _finish_motion(before,ticks)
func set_player(value: Node2D) -> void:
 super.set_player(value)
 if value.has_method("apply_native_freeze_slow"): f_freeze_owner=Callable(value,"apply_native_freeze_slow")
func _icicles() -> void:
 while _icicle_index<2:
  var kind: String="icicle_"+str(_icicle_index)
  if not f_pending.has(kind):
   var angle: float=facing+(world.sample_native_random_unit()-0.5)*0.6
   f_pending[kind]={"command":"eProjAt","actor":self,"args":[angle,2.5,0.8,2,180,"#aabbee",1.5],"source_line":20119}
  if not _request(kind,f_pending[kind]): return
  _icicle_index+=1
 _icicles_active=false
func _request(kind: String,payload: Dictionary) -> bool:
 var owner: Callable=f_contact_owner if kind in ["swoop_contact","slam_contact"] else f_projectile_owner
 if not f_pending.has(kind): f_pending[kind]=payload
 if not owner.is_valid(): f_not_ready[kind]="actual_protected_contact_owner_required" if kind in ["swoop_contact","slam_contact"] else "actual_F_source_projectile_owner_required";return false
 var receipt: Variant=owner.call(self,kind,f_pending[kind])
 if not receipt is Dictionary or receipt.get("ready")!=true: f_not_ready[kind]="owner_rejected";return false
 f_pending.erase(kind);f_not_ready.erase(kind)
 return true
func _finish_motion(before: Vector2,ticks: float) -> void:
 super._finish_motion(before,ticks)
 f_source.x=global_position.x;f_source.y=global_position.y;f_source.s=state;f_source.st2=st2
