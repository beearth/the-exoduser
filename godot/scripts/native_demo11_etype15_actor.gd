extends "res://scripts/enemy_melee_ch1_ice_warrior.gd"
## C15 state owner. Existing atlas/collider/hurtE/poise kernels are inherited.
## World owns the sole source-sp clock; no autonomous second AI.
const B_TYPES := [15]
const ACTIVE_STATUS_FIELDS = ["_frozen","poison","bleed","burnT"]
var b_ready := false
var b_fault := ""
var b_ticks := 0
var b_source: Dictionary = {}
var b_base_atk := 0
var b_projectile_owner: Callable
func configure(value: Dictionary, owner_world: Node2D) -> void:
 if value.get("etype") not in B_TYPES or value.get("ai_profile")!="demo11_c15_v1": return
 super.configure(value,owner_world)
 b_source=data.native_final
 b_base_atk=attack
 b_ready=true
func _source_normal_fields_domain_current() -> bool:
 return etype in B_TYPES and data.get("ai_profile")=="demo11_c15_v1" and elite in [0,1]
func _ready() -> void:
 super._ready()
 set_physics_process(false) # tree entry must not re-enable autonomous AI
func _physics_process(_delta: float) -> void: pass
func is_native_registry_ready() -> bool: return b_ready
func read_native_normal_enemy_hurte_fields(caller_world: Node) -> Dictionary:
 # Dedicated owner readback predates PCI09; expose the actual split guard.
 var fields: Dictionary=super.read_native_normal_enemy_hurte_fields(caller_world)
 fields["_splitDone"]=data.native_final.get("_splitDone")==true
 return fields
func _b_stop(reason: String) -> void:
 b_fault=reason
 telemetry_event.emit("etype_b_not_ready",{"etype":etype,"reason":reason})
func advance_native_phase(ticks: float, _frame: float, _enemies: Array) -> void:
 if not b_ready or not b_fault.is_empty() or not alive or not is_instance_valid(player) or ticks<=0: return
 b_ticks+=1
 if float(b_source.get("reviveIframes",0))>0:b_source.reviveIframes=maxf(0,float(b_source.reviveIframes)-ticks)
 native_frame+=ticks
 var before:=global_position
 for key in ACTIVE_STATUS_FIELDS:
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
 if alerted and (state=="idle" or state=="recover"):
  if d>510:_move_flow(ticks)
  elif d<390 and d>30:_move_native(-Vector2.from_angle(facing)*float(data.speed_pixels_per_tick)*.5,ticks)
  d=global_position.distance_to(player.global_position)
 if (not alerted and d>400) or float(player.hp)<=0: _finish_motion(before,ticks);return
 if charge_ticks>0:
  charge_ticks-=ticks
  if charge_ticks<=0 and not _b_fire("charged_projectile"): return
 st2-=ticks
 if state=="idle":
  _move_native(Vector2.from_angle(facing)*float(data.speed_pixels_per_tick)*1.6,ticks)
  _apply_separation(ticks)
  if charge_ticks<=0:
   _projectile_ticks-=ticks
   if _projectile_ticks<=0 and d<float(data.projectile_range):
    _projectile_ticks=240;charge_ticks=60
 elif state=="windup" and st2<=0: state="attack";st2=8
 elif state=="attack":
  if st2<=5 and st2+ticks>5:
   if not _b_fire("mouth_attack"): return
  if st2<=0: state="recover";st2=35
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
 b_source.kb.x=_knockback.x;b_source.kb.y=_knockback.y
