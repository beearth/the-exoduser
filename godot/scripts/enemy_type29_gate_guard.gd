extends "res://scripts/enemy_melee_ch1_ice_warrior.gd"
## G39125–39140/G40526–40558. PC damage/parry/final death remain external.
var gate_owner: Node
var gate_ticks:=0
var gate_not_ready: Dictionary={}
var _last_gate_frame:=-1.0
var _pending_contact: Dictionary={}
func configure(value: Dictionary,owner_world: Node2D) -> void:
 el=int(value.get("element_id",-1)) # This subclass supplies the validated constructor identity.
 super.configure(value,owner_world)
func is_native_registry_ready() -> bool:
 return is_instance_valid(gate_owner) and etype==29 and data.get("ai_profile")=="demo11_gate_guard_v1" and data.native_final.get("_isGateGuard")==true
func _source_normal_fields_domain_current() -> bool:
 return is_native_registry_ready() and elite==3 and mods.is_empty() and el==0
func _ready() -> void:
 super._ready();set_physics_process(false)
func _physics_process(_delta: float) -> void:pass
func advance_native_phase(sp: float,frame: float,_enemies: Array) -> void:
 if not alive or gate_not_ready.has("final_death") or not is_instance_valid(gate_owner) or not gate_owner.current() or frame<=_last_gate_frame or sp<=0:return
 _last_gate_frame=frame;gate_ticks+=1;native_frame+=sp
 var n: Dictionary=data.native_final
 n.reviveIframes=maxf(0.0,float(n.reviveIframes)-sp)
 _hit_stun=maxf(0,_hit_stun-sp);_stun_ticks=maxf(0,_stun_ticks-sp)
 _spawn_ticks=maxf(0,_spawn_ticks-sp);_hit_flash=maxf(0,_hit_flash-sp)
 if _hit_stun>0 or _stun_ticks>0 or float(n.get("_frozen",0))>0:return
 if not _pending_contact.is_empty():
  if not gate_owner.request_contact(self,_pending_contact):return
  var recovery: int=int(_pending_contact.recovery)
  _pending_contact={};state="recover";st2=recovery
 if not is_instance_valid(player) or player.hp<=0:return
 var before:=global_position
 var d:=global_position.distance_to(player.global_position)
 if not alerted and d<800 and world.has_line_of_sight(global_position,player.global_position):alerted=true
 if not alerted and d>400:return
 if d<800:facing=(player.global_position-global_position).angle()
 if poise<max_poise:
  _poise_regen+=sp
  if _poise_regen>=200:poise=minf(max_poise,poise+floorf(max_poise*0.15));_poise_regen=0
 st2-=sp
 if charge_ticks>0:
  charge_ticks-=sp
  if charge_ticks<=0:gate_not_ready.charged_projectile="actual_source_charge_owner_required"
 if state=="idle":
  n._iceSlamT-=sp
  if n._iceSlamT<=0 and d<120:
   state="eSlamWind";st2=45;n._iceSlamT=n._iceSlamCd
   gate_owner.queue_attack(self)
   if d<100:player.apply_native_freeze_slow(120)
  # Source independent second if; strict range prevents a draw at <=150/>=1200.
  if d>150 and d<1200 and world.sample_native_random_unit()<0.008*sp:
   state="eCharge";st2=25;n.echDx=cos(facing);n.echDy=sin(facing)
 match state:
  "idle":
   _move_native(Vector2.from_angle(facing)*float(data.speed_pixels_per_tick)*1.6,sp)
   _apply_separation(sp)
   if charge_ticks<=0:
    _projectile_ticks-=sp
    if _projectile_ticks<=0 and d<1000:_projectile_ticks=240;charge_ticks=60
  "eCharge":
   var destination:=global_position+Vector2(float(n.echDx),float(n.echDy))*5*sp
   if not world.can_move(destination,radius):state="recover";st2=30
   else:
    global_position=destination
    var segment:=global_position-before
    var t: float=clampf((player.global_position-before).dot(segment)/segment.length_squared(),0,1) if segment.length_squared()>0 else 0.0
    if player.global_position.distance_to(before+segment*t)<float(player.radius)+radius+18 and player.iframes<=0:
     _pending_contact={"kind":"charge","multiplier":30,"knockback":100,"source_line":40526,"recovery":30}
     if gate_owner.request_contact(self,_pending_contact):_pending_contact={};state="recover";st2=30
    elif st2<=0:state="recover";st2=30
  "eSlamWind":
   if st2<=0:
    _pending_contact={"kind":"slam","radius":70+radius,"multiplier":2,"player_knockback":10,"enemy_knockback":6,"source_line":40550,"recovery":50}
    if gate_owner.request_contact(self,_pending_contact):_pending_contact={};state="recover";st2=50
  "recover":
   if st2<=0:state="idle";st2=15+world.sample_native_random_unit()*15
 _finish_motion(before,sp)
 n.x=global_position.x;n.y=global_position.y;n.s=state;n.st2=st2
func receive_damage(amount: int,direction: Vector2,source: String,options: Dictionary={}) -> void:
 if not is_instance_valid(gate_owner) or not gate_owner.current() or not alive:return
 var result: Dictionary=preload("res://scripts/native_normal_enemy_hurte.gd").new().execute(world.get_parent(),world,self,amount,direction.angle(),0,options)
 if not result.get("ok",false):gate_not_ready.hurtE=str(result.get("reason"))
func apply_native_normal_enemy_death_write() -> Dictionary:
 var request: Dictionary=gate_owner.request_final_death(self)
 gate_not_ready.final_death=request.get("reason","PCI11_final_death_commit_required")
 return {"applied":false,"reason":gate_not_ready.final_death} # PC writes alive/final death/gate.
