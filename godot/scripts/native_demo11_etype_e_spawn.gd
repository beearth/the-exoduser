extends Node
## Mac source consumer; no protected HP/parry/gate writer or fabricated PC readiness.
const HOLES=preload("res://scripts/native_spawn_hole_system.gd")
const FORMULA=preload("res://port_modules/combat_stat_formula/producer.gd")
const RECIPE=preload("res://scripts/type3_spawn_recipe.gd")
const FORCED=preload("res://port_modules/elite_spawn_rules_source/producer.gd")
var main: Node
var actors: Array=[]
var warnings: Array=[]
var births:=0
var _used: Dictionary={}
var _template: Dictionary={}
var _warning_frame:=-1.0
var _authorized_actor: Node
var _authorized_props: Dictionary={}
var _pc_final_death: Callable
var _pc_contact: Callable
var _boundary_emitter: Node
var _boundary_group:=""
var _death_started: Dictionary={}
static func install(owner: Node) -> Node:
 var service=new();service.main=owner;service.name="Demo11EtypeE";owner.world.add_child(service)
 service._template=owner.world.get_node("NativeSpawnHoleSystem")._template
 service.process_physics_priority=1
 return service
func current() -> bool:
 if not is_instance_valid(main) or get_parent()!=main.world or get_tree().paused:return false
 var a: Variant=main.native_stage_spawn_adapter
 if a==null or not a.is_current():return false
 var g: Dictionary=main.source_state.read_current_g()
 return g.get("on",false) and g.get("stage")==0 and not g.get("_bossArena",false)
func read_projectile_context() -> Dictionary:
 return {"lesson_active":false,"qa_storage_active":false,"aggro_active":false}
func spawn_selected(owner: Node,group: String,source: Dictionary) -> Dictionary:
 if not current() or owner!=main.world.get_node("NativeSpawnHoleSystem"):return _no("actual_source_MAP11_owner_required")
 var etype: Variant=source.get("etype")
 if etype in [3,7]:return natural_boundary(etype,group)
 if etype!=29 or not etype is int:return _no("outside_E")
 var options: Dictionary=main.source_initialization_services.read_current_options()
 var g: Dictionary=main.source_state.read_current_g()
 if options.get("diff")!=5 or g.get("_stageDiffOff",0)!=0 or source.get("elite")!=0 or source.get("mods")!=[]:return _no("guard_normal_constructor_slice_required")
 if source.get("el",0)!=0:return _no("stage0_guard_STG_be_physical_required")
 for key in ["speed_u","radius_u"]:
  var v: Variant=source.get(key)
  if not _number(v) or v<0 or v>=1:return _no("source_uniform_required:"+key)
 if not source.get("spawn_n") is int or source.spawn_n<1 or not source.get("literal") is Dictionary:return _no("source_literal_and_index_required")
 for draw in HOLES.MKEN_LITERAL_DRAWS:
  if draw[1].is_empty() or draw[1].has(29):
   var v: Variant=source.literal.get(draw[0])
   if not _number(v) or v<draw[2] or v>=draw[2]+draw[3]:return _no("source_literal_required:"+str(draw[0]))
 var found:=false
 for hole in owner.holes:
  if hole.get("spawn_group_id")==group and source.spawn_n<=HOLES.spawn_hole_count(hole.size,0):found=true
 if not found:return _no("actual_source_group_required")
 var token:=group+"/"+str(source.spawn_n)
 if _used.has(token):return _no("source_prefix_already_consumed")
 var radius: int=FORMULA.js_to_int32((20.0+float(source.radius_u)*2)*2*1.4)
 var site: Dictionary=main.native_stage_spawn_adapter.request_spawn(group,{"etype":29,"radius":radius})
 if not site.get("ready",false):return site
 if not main.world.can_move(site.position,radius):return _no("MAP11_guard_site_geometry_rejected")
 if not is_instance_valid(main.native_natural_enemies):
  var bound: Dictionary=main.bind_native_natural_enemy_base(read_projectile_context,false)
  if not bound.get("ready",false):return bound
 var runtime:=_build_guard(site.position,source,main.source_state.read_current_p(),token)
 _used[token]=true
 var result: Dictionary=main.native_natural_enemies.spawn_profile_record(self,group,runtime,site)
 if result.get("registered",false):actors.append(result.actor)
 return result
func natural_boundary(etype: int,group: String="") -> Dictionary:
 _boundary_group=group
 # Preflight only, before constructor/RNG/Marker arbitration. Never a substitute actor.
 if etype==3:
  var actor=preload("res://scripts/type3_native_binding.gd").new()
  var fields_ready: bool=actor.has_method("read_native_normal_enemy_hurte_fields")
  actor.free()
  return _no("PC_type3_hurtE_field_owner_required" if not fields_ready else "actual_type3_recipe_and_PC_services_required")
 if etype==7:
  var runtime=preload("res://scripts/native_type7_runtime.gd").new()
  var emitter: Node=main.world._native_projectile_emitter
  if not is_instance_valid(emitter):
   if not is_instance_valid(_boundary_emitter):
    var candidate=preload("res://scripts/native_element_projectile_emitter.gd").new()
    if not candidate.configure(main.world,main.player):
     var error: String=str(candidate.get_snapshot().get("error"));candidate.free();runtime.free();return _no(error)
    add_child(candidate);_boundary_emitter=candidate
   emitter=_boundary_emitter
  var services: Dictionary={"projectile_emitter":emitter,"summon_context":summon_context,"type3_interfaces":{
   "native_random":Callable(main.world,"sample_native_random_unit"),"emit_charged_projectile":Callable(emitter,"emit"),
   "player_context":Callable(main.player,"get_snapshot"),"element_multiplier":Callable(main.player,"get_native_element_multiplier"),"is_tile_wall":Callable(main.world,"is_world_blocked")}}
  var ready: bool=runtime.configure(main.world,main.player,services)
  var reason: String=runtime.get_last_error()
  runtime.free()
  return _no("actual_type7_recipe_and_PC_services_required" if ready else reason)
 return _no("outside_type3_7_boundary")
func bind_pci11_final_death(owner: Callable) -> bool:
 if _pc_final_death.is_valid() or not owner.is_valid():return false
 _pc_final_death=owner;return true
func bind_protected_contact(owner: Callable) -> bool:
 if _pc_contact.is_valid() or not owner.is_valid():return false
 _pc_contact=owner;return true
func request_contact(actor: Node,payload: Dictionary) -> bool:
 if not current() or not actors.has(actor):return false
 if not _pc_contact.is_valid():actor.gate_not_ready[payload.kind]="actual_PC_contact_owner_required";return false
 var receipt: Variant=_pc_contact.call(actor,payload.duplicate(true))
 return receipt is Dictionary and receipt.get("ready")==true
func request_final_death(actor: Node) -> Dictionary:
 if not current() or not actors.has(actor):return _no("actual_guard_owner_required")
 if not _pc_final_death.is_valid():return _no("PCI11_final_death_owner_required")
 var receipt: Variant=_pc_final_death.call({"actor":actor,"source_line":42737,"mac_after_commit":after_pc_final_death})
 return receipt if receipt is Dictionary else _no("PCI11_final_death_receipt_required")
func after_pc_final_death(owner: Object,actor: Node) -> Dictionary:
 # Acknowledgement alone cannot forge a death. PC must have committed it first.
 if not _pc_final_death.is_valid() or _pc_final_death.get_object()!=owner or not current() or not actors.has(actor) or actor.alive or actor.hp>0:return _no("actual_PC_final_death_commit_required")
 if _death_started.has(actor.get_instance_id()):return _no("death_prefix_already_consumed")
 _death_started[actor.get_instance_id()]=true
 var units: Array=[]
 for i in 8:units.append(main.world.sample_native_random_unit())
 var props:=death_packets(actor.global_position,actor.attack,units)
 for lane in death_lanes(props):
  warnings.append({"actor":weakref(actor),"dead":true,"t":60.0,"origin":actor.global_position,"shots":lane.shots})
 if actor.global_position.distance_to(main.player.global_position)<100 and main.player.iframes<=0:main.player.apply_native_freeze_slow(150)
 return {"ready":true,"queued":props.size(),"gate_written":false,"remaining":"PC hitstop/FX/final gate confirmation"}
func queue_attack(actor: Node) -> void:
 if not current() or not actors.has(actor):return
 warnings.append({"actor":weakref(actor),"dead":false,"t":60.0,"origin":actor.global_position,"shots":attack_packets(actor.global_position,actor.radius,actor.facing,actor.attack)})
func _physics_process(_delta: float) -> void:
 advance_warnings(main.world.get_native_frame(),main.world._native_last_ticks)
func advance_warnings(frame: float,sp: float) -> void:
 if not current() or frame<=_warning_frame:return
 _warning_frame=frame
 var next: Array=[]
 for warning in warnings:
  var actor: Node=warning.actor.get_ref()
  if not is_instance_valid(actor):continue
  if not warning.dead and (not actor.alive or actor._stun_ticks>0 or float(actor.data.native_final.get("_frozen",0))>0):continue
  warning.t-=sp
  if warning.t>0:next.append(warning);continue
  var offset: Vector2=Vector2.ZERO if warning.dead else actor.global_position-warning.origin
  for raw in warning.shots:
   var props: Dictionary=raw.duplicate(true);props.x+=offset.x;props.y+=offset.y;props._commit=true
   _authorized_actor=actor;_authorized_props=props
   var receipt: Dictionary=main.native_natural_enemies.emit_projectile(actor,props)
   if receipt.get("ready",false):births+=1
   else:actor.gate_not_ready.projectile=str(receipt.get("reason"))
   _authorized_actor=null;_authorized_props={}
 warnings=next
func allows_projectile(actor: Node) -> bool:return current() and actors.has(actor) and _authorized_actor==actor
func authorizes_props(actor: Node,props: Dictionary) -> bool:return allows_projectile(actor) and props==_authorized_props and props.get("el") in [0,2]
static func attack_packets(at: Vector2,radius: float,face: float,atk: int) -> Array:
 var shots: Array=[]
 for i in 8:
  var angle: float=TAU*i/8
  var mouth_angle: float=angle if angle!=0 else face # JS ang||e.facing||0
  var x: float=at.x+cos(mouth_angle)*radius*0.7
  var y: float=at.y+sin(mouth_angle)*radius*0.7
  shots.append({"x":x,"y":y,"vx":cos(angle)*3*1.05,"vy":sin(angle)*3*1.05,"dmg":FORMULA.js_to_int32(atk*1.2),"el":2,"friendly":false,"life":450,"ml":450,"col":"#317cec","sz":2,"waterBean":true,"homing":true,"_commit":true})
 return shots
static func death_packets(at: Vector2,atk: int,units: Array) -> Array:
 if units.size()!=8:return []
 for u in units:
  if not _number(u) or u<0 or u>=1:return []
 var shots: Array=[]
 for i in 8:
  var black: bool=units[i]<0.5
  var angle: float=TAU*i/8
  var speed: float=4.4 if black else 2.5
  var p: Dictionary={"x":at.x,"y":at.y,"vx":cos(angle)*speed,"vy":sin(angle)*speed,"dmg":FORMULA.js_to_int32(atk*(1.5 if black else 1.2)),"el":0 if black else 2,"friendly":false,"life":400 if black else 200,"ml":400 if black else 200,"col":"#00aa00" if black else "#cc1100","sz":2.0 if black else 1.5,"_druidPoison":false,"_druidStraight":false,"_druidThornVolley":false}
  if black:p.blackBean=true
  else:p.redBean=true;p.homing=true
  shots.append(p)
 return shots
func _no(reason: String) -> Dictionary:return {"ready":false,"registered":false,"reason":reason}
static func _number(value: Variant) -> bool:return (value is int or value is float) and is_finite(float(value))

func _build_guard(pos: Vector2,source: Dictionary,player: Dictionary,token: String) -> Dictionary:
 var etype: int=29
 var room: int=-1
 var r: Dictionary=_template.duplicate(true)
 var lv: int=maxi(1,int(player.lv))
 var curve: float=(0.4*lv*lv*lv+199.0*lv+100.0) if lv<=500 else 50000000.0*pow(1.0014,lv-500)
 var health: int=int(floor(curve*2.925/(1.0+minf(9,maxf(0,lv-1))/18.0)))
 var atk: int=int(floor((50.0+lv*1.95)*0.6))
 var idx: int=0
 var speed: float=(maxf(0.2,0.36*1.3)+float(source.speed_u)*0.08)*1.5
 var radius: float=(20.0+float(source.radius_u)*2)*2
 var skin: int=((etype*7+FORMULA.js_to_int32(pos.x*31))&0x7fffffff)%40
 var a: Dictionary=r.animation
 a.skin=RECIPE.SKINS[skin];a.column=skin%8;a.row=int(skin/8)
 a.base_rect=[skin%8*256,int(skin/8)*256,256,256]
 a.walk_frame_rects=[]
 for f in range(4): a.walk_frame_rects.append([(skin%8*4+f)*256,int(skin/8)*256,256,256])
 var literal: Dictionary=source.literal
 r.merge({"id":"demo11_guard_"+token,"ai_profile":"demo11_gate_guard_v1","order":-1,
  "etype":etype,"element":"physical","element_id":0,"spawn_position":[pos.x,pos.y],"room":room,"level":lv,
  "hp":health,"attack":atk,"radius":radius,"speed_pixels_per_tick":speed,"elite":0,"mods":[],"aura":null,
  "poise":health,"max_poise":health,"eShield":health,"eShieldMax":health,"eRes":[0,0,0,0,0,0,0],
  "initial_idle_ticks":literal.st2,"facing":literal.facing,"initial_projectile_ticks":literal.projT,
  "projectile_cooldown_ticks":240,"projectile_range":1000.0},true)
 var n: Dictionary=r.native_final
 n.merge({"etype":etype,"el":0,"ib":false,"x":pos.x,"y":pos.y,"r":radius,"hp":health,"mhp":health,
  "atk":atk,"baseAtk":atk,"speed":speed,"baseSpd":speed,"eShield":health,"eShieldMax":health,"poise":health,"maxPoise":health,
  "st2":literal.st2,"facing":literal.facing,"alive":true,"s":"idle","stunned":0,"kb":{"x":0,"y":0},
  "_homeX":pos.x,"_homeY":pos.y,"_mob8Col":skin%8,"_mob8Row":int(skin/8),"_iceSwoopOx":0.0,"_iceSwoopOy":0.0,
  "reviveIframes":15.0,"projT":literal.projT,"projCd":r.projectile_cooldown_ticks},true)
 for key in literal: n[key]=literal[key]
 var forced: Dictionary=FORCED.apply_forced_constructor(n,"gate_guard")
 assert(forced.status=="READY")
 n.col="#4455aa";n.lv=lv
 r.hp=n.hp;r.attack=n.atk;r.radius=n.r;r.poise=n.poise;r.max_poise=n.maxPoise;r.elite=n.elite
 r.native_flags={"_isGateGuard":true,"ib":false}
 return r

func summon_context() -> Dictionary:
 var adapter: Variant=main.native_stage_spawn_adapter
 if adapter==null or not adapter.is_current():return {}
 var room: Variant=null
 for hole in main.world.get_node("NativeSpawnHoleSystem").holes:
  if hole.get("spawn_group_id")==_boundary_group:room=hole.get("room");break
 if not room is int:return {} # Actual selected source group, no invented room.
 var g: Dictionary=main.source_state.read_current_g()
 var p: Dictionary=main.source_state.read_current_p()
 var options: Dictionary=main.source_initialization_services.read_current_options()
 return {"stage":g.get("stage"),"room":room,"player_level":p.get("lv"),"difficulty":options.get("diff"),"stage_difficulty_offset":g.get("_stageDiffOff",0)}

static func death_lanes(shots: Array) -> Array:
 # G20072–20078 groups by element/black/class, insertion order, before60 release.
 var lanes: Array=[]
 for shot in shots:
  var lane: Dictionary={}
  for candidate in lanes:
   if candidate.el==shot.el and candidate.blackBean==shot.get("blackBean",false):lane=candidate;break
  if lane.is_empty():
   lane={"el":shot.el,"blackBean":shot.get("blackBean",false),"shots":[]};lanes.append(lane)
  lane.shots.append(shot)
 return lanes
