extends "res://scripts/enemy_melee_ch1_ice_warrior.gd"
## B-only state owner. Existing atlas/collider/hurtE/poise kernels are inherited.
## Neither the type20 nor type0 autonomous AI is called.
const B_TYPES := [8,9,10,11,12]
const B_FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
var b_ready := false
var b_fault := ""
var b_ticks := 0
var b_source: Dictionary = {}
var b_base_atk := 0
var b_projectile_owner: Callable
var b_revive_pool: Callable
var b_summon_owner: Callable
func configure(value: Dictionary, owner_world: Node2D) -> void:
 if value.get("etype") not in B_TYPES or value.get("ai_profile")!="demo11_group_b_v1": return
 super.configure(value,owner_world)
 b_source=data.native_final
 b_base_atk=attack
 b_ready=true
func _source_normal_fields_domain_current() -> bool:
 return etype in B_TYPES and data.get("ai_profile")=="demo11_group_b_v1" and elite==0 and mods.is_empty()
func _ready() -> void:
 super._ready()
 set_physics_process(false) # tree entry must not re-enable autonomous AI
func _physics_process(_delta: float) -> void: pass
func is_native_registry_ready() -> bool: return b_ready
func read_native_normal_enemy_hurte_fields(caller_world: Node) -> Dictionary:
 # PCI-09 now gates etype8 before all writes when its consumer is absent.
 return super.read_native_normal_enemy_hurte_fields(caller_world)
func _b_stop(reason: String) -> void:
 b_fault=reason
 telemetry_event.emit("etype_b_not_ready",{"etype":etype,"reason":reason})
func advance_native_phase(ticks: float, _frame: float, _enemies: Array) -> void:
 if not b_ready or not b_fault.is_empty() or not alive or not is_instance_valid(player) or ticks<=0: return
 b_ticks+=1
 native_frame+=ticks
 var before:=global_position
 for key in ["_frozen","poison","bleed","burnT"]:
  if float(b_source.get(key,0))>0: _b_stop("unported_active_status:"+key);return
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
 if alerted and state in ["idle","recover"] and d>30:
  _move_flow(ticks)
  d=global_position.distance_to(player.global_position)
 if (not alerted and d>400) or float(player.hp)<=0: _finish_motion(before,ticks);return
 if charge_ticks>0:
  charge_ticks-=ticks
  if charge_ticks<=0 and not _b_fire("charged_projectile"): return
 st2-=ticks
 if etype==9 and state=="idle":
  b_source.reviveT-=ticks
  if b_source.reviveT<=0:
   var main: Node=player.get_parent()
   var receipt: Dictionary=main.request_native_enemy_revive(self,{"request_id":"b9:%d:%d"%[get_instance_id(),b_ticks],"revive_cd":b_source.reviveCd})
   if not receipt.get("accepted",false): _b_stop(str(receipt.get("reason","corpse_revive_rejected")));return
   b_source.reviveT=receipt.next_timer
  if d<100: _move_native(-Vector2.from_angle(facing)*float(data.speed_pixels_per_tick),ticks)
 if etype==10 and state=="idle":
  b_source.stealthT-=ticks
  if not b_source._cloaked and b_source.stealthT<=0 and d<1200:
   b_source._cloaked=true;b_source.stealthT=b_source.stealthCd
  if b_source._cloaked and d<1200:
   var behind:=player.global_position+Vector2.from_angle((player.facing as Vector2).angle()+PI)*35.0
   if world.can_move(behind,radius): global_position=behind
   b_source._cloaked=false;b_source._telegraphT=20.0;state="windup";st2=10.0
 if etype==11 and state=="idle":
  b_source.wombT-=ticks
  if b_source.wombT<=0:
   if world.query_native_enemies(global_position.x,global_position.y,200).size()<6: state="eSummon";st2=35
   else: b_source.wombT=60.0
  if d<120: _move_native(-Vector2.from_angle(facing)*float(data.speed_pixels_per_tick),ticks)
 if etype==12 and not b_source._enraged and hp<mhp*0.4:
  b_source._enraged=true
  data.speed_pixels_per_tick*=2.2
  b_base_atk=B_FORMULA.js_to_int32(b_base_atk*1.5)
  attack=b_base_atk
  b_source.speed=data.speed_pixels_per_tick;b_source.baseAtk=b_base_atk;b_source.atk=attack
 if state=="idle":
  if etype in [8,9,11]:
   if d<80: _move_native(-Vector2.from_angle(facing)*float(data.speed_pixels_per_tick)*0.6,ticks)
   elif d>200: _move_native(Vector2.from_angle(facing)*float(data.speed_pixels_per_tick)*1.2,ticks)
  else: _move_native(Vector2.from_angle(facing)*float(data.speed_pixels_per_tick)*1.6,ticks)
  _apply_separation(ticks)
  if etype in [10,12] and d<radius+float(player.radius)+8 and float(player.iframes)<=0 and st2<=0:
   # Existing protected Player API only; no damage/parry implementation here.
   player.receive_damage(B_FORMULA.js_to_int32(attack*0.8))
   st2=40+floorf(world.sample_native_random_unit()*20)
  if etype in [8,10,12] and charge_ticks<=0:
   _projectile_ticks-=ticks
   if _projectile_ticks<=0 and d<float(data.projectile_range):
    _projectile_ticks=240;charge_ticks=60
 elif state=="windup" and st2<=0: state="attack";st2=8
 elif state=="attack":
  if st2<=5 and st2+ticks>5:
   if not _b_fire("mouth_attack"): return
  if st2<=0: state="recover";st2=35
 elif state=="eSummon" and st2<=0:
  if not b_summon_owner.is_valid(): _b_stop("actual_type3_count2to3_MAP11_spawn_owner_required");return
  var receipt: Variant=b_summon_owner.call(self)
  if not receipt is Dictionary or receipt.get("ready")!=true: _b_stop("actual_type3_spawn_rejected");return
  b_source.wombT=b_source.wombCd;state="recover";st2=50
 elif state=="recover" and st2<=0:
  state="idle";st2=15+world.sample_native_random_unit()*15
 _finish_motion(before,ticks)
func _b_fire(kind: String) -> bool:
 if not b_projectile_owner.is_valid(): _b_stop("actual_B_source_projectile_owner_required:"+kind);return false
 var receipt: Variant=b_projectile_owner.call(self,kind)
 if not receipt is Dictionary or receipt.get("ready")!=true: _b_stop("actual_B_source_projectile_rejected:"+kind);return false
 return true

func _finish_motion(before: Vector2, ticks: float) -> void:
 super._finish_motion(before,ticks)
 b_source.x=global_position.x;b_source.y=global_position.y
 b_source.s=state;b_source.st2=st2;b_source.poise=poise
 b_source.kb={"x":_knockback.x,"y":_knockback.y}
