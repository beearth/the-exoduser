extends Node2D
## D profile constructor/unique actions; common natural owner admits actors/shots.
const FACTORY=preload("res://scripts/enemy_factory.gd")
const SHARED=preload("res://scripts/type3_spawn_recipe.gd")
var main: Node
var actors: Array=[]
var not_ready_types: Dictionary={}
func suspend_type(etype: int,reason: String) -> void:
 not_ready_types[etype]=reason
 for actor in actors:
  if is_instance_valid(actor) and actor.etype==etype:actor.not_ready=reason
var zones: Array=[]
var _frame: Dictionary={"ready":false}
var _next:=0
var _constructor_draws: Array=[]
func _unit() -> float:
 var u: float=main.world.sample_native_random_unit();_constructor_draws.append(u);return u
static func install(main_owner: Node) -> Node2D:
 var node=new();node.main=main_owner;node.name="Demo11EtypeD";main_owner.world.add_child(node)
 main_owner.world.register_native_phase_consumer(node,node.advance_native_phase)
 main_owner.native_demo_boss_projectiles.bind_demo11_d(node,node.read_projectile_frame)
 node.process_physics_priority=1
 return node
func current() -> bool:
 if not is_instance_valid(main) or get_parent()!=main.world:return false
 var adapter: Variant=main.native_stage_spawn_adapter
 if adapter==null or not adapter.is_current():return false
 var g: Dictionary=main.source_state.read_current_g()
 return g.get("stage")==0 and g.get("on",false) and not g.get("_bossArena",false) and not get_tree().paused
func spawn_selected(group: String,etype: int,element: int=-1) -> Dictionary:
 if not current() or etype not in FACTORY.DEMO11_D_ETYPES or element not in [-1,0,1,2,3,4,5]:return {"ready":false,"reason":"D_context_or_type_invalid"}
 if not_ready_types.has(etype):return {"ready":false,"etype":etype,"reason":not_ready_types[etype]}
 if not is_instance_valid(main.native_natural_enemies):
  var bound: Dictionary=main.bind_native_natural_enemy_base(read_projectile_context,false)
  if not bound.get("ready",false):return bound
 var adapter: Variant=main.native_stage_spawn_adapter
 if adapter==null or not adapter.is_current():return {"ready":false,"reason":"actual_MAP11_adapter_required"}
 var world: Node2D=main.world
 var options: Dictionary=main.source_initialization_services.read_current_options()
 var diff: int=int(options.get("diff",0))
 if diff<0 or diff>=SHARED.DIFFICULTY_MULTIPLIERS.size():return {"ready":false,"reason":"source_diff_invalid"}
 _constructor_draws.clear()
 # This draw is rollElite(stage0). Do not substitute another type on refusal.
 if _unit()<0.03:return {"ready":false,"reason":"D_elite_mod_owner_NOT_READY","etype":etype,"rng_prefix_committed":true}
 var raw_speed: float={18:0.12,19:0.2,23:0.21,24:0.12,25:0.3}[etype]
 var speed_value: float=(maxf(0.2,raw_speed*1.3)+_unit()*0.08)*1.5
 var radius_value: float=({18:16,19:22,23:10,24:10,25:10}[etype]+_unit()*2)*2
 var site: Dictionary=adapter.request_spawn(group,{"etype":etype,"radius":radius_value})
 if not site.get("ready",false):return site # consumed constructor prefix is never replayed internally
 var at: Vector2=site.position
 var level: int=maxi(1,int(main.source_state.read_current_p().lv)+SHARED.DIFFICULTY_LEVEL_OFFSETS[diff]+int(main.source_state.read_current_g().get("_stageDiffOff",0)))
 var curve: float=(0.4*level*level*level+199.0*level+100.0) if level<=500 else 50000000.0*pow(1.0014,level-500)
 var health: int=int(floor(curve*2.925/(1.0+mini(9,maxi(0,level-1))/18.0)*SHARED.DIFFICULTY_MULTIPLIERS[diff]))
 var atk: int=int(floor((50.0+level*1.95)*0.6*SHARED.DIFFICULTY_MULTIPLIERS[diff]))
 var idle: float=30+_unit()*50
 var face: float=_unit()*TAU
 var pt: float=180+_unit()*120
 var boss_t: float=30+_unit()*20
 var slam_cd: float=200+_unit()*80 if etype==19 else 9999
 var slam_t: float=80+_unit()*40 if etype==19 else 9999
 var slime_cd: float=120+_unit()*40 if etype==25 else 9999
 var slime_t: float=40+_unit()*20 if etype==25 else 9999
 var orbit: float=_unit()*TAU
 var erratic: float=_unit()*TAU
 var native: Dictionary={"etype":etype,"ib":false,"el":element,"hp":health,"mhp":health,"atk":atk,"r":radius_value,"x":at.x,"y":at.y,"alive":true,"s":"idle","st2":idle,"facing":face,"stunned":0,"kb":{"x":0,"y":0},"elite":0,"mods":[],"aura":null,"poise":health,"maxPoise":health,"poiseR":0,"eShield":health,"eShieldMax":health,"eRes":[0,0,0,0,0,0,0],"reviveIframes":15,"slamCd":slam_cd,"slamT":slam_t,"_iceSlimeCd":slime_cd,"_iceSlimeT":slime_t,"drainHeal":0.3 if etype==18 else 0,"_iceOnHit":etype>=20,"projCd":9999 if etype==24 else 240,"projT":pt,"bossPatT":boss_t,"_bossOrbitAng":orbit,"_erraticAng":erratic}
 _next+=1
 var record: Dictionary={"id":"demo11-D-%d"%_next,"order":-1,"etype":etype,"stage":0,"level":level,"element_id":element,"element":"undefined" if element==-1 else SHARED.ELEMENTS[element],"elite":0,"mods":[],"aura":null,"spawn_position":[at.x,at.y],"hp":health,"attack":atk,"radius":radius_value,"poise":health,"max_poise":health,"speed_pixels_per_tick":speed_value,"initial_idle_ticks":idle,"initial_projectile_ticks":pt,"facing":face,"factory_random_seed":0,"initial_timers":{},"native_final":native}
 record["constructor_draws"]=_constructor_draws.duplicate()
 record["source_context"]={"player_level":main.source_state.read_current_p().lv,"stage_offset":main.source_state.read_current_g().get("_stageDiffOff",0),"diff":diff}
 var result: Dictionary=main.native_natural_enemies.spawn_profile_record(self,group,record,site)
 if not result.get("ready",false):
  if result.get("actor") is Node:result.actor.not_ready="origin_rejected"
  return result
 var actor: CharacterBody2D=result.actor
 var origin: Dictionary=result.origin
 actors.append(actor)
 return {"ready":true,"actor":actor,"etype":etype,"origin":origin,"full_source_update":false,"death_ready":etype!=25}
func advance_native_phase(sp: float,_native_frame: float,_enemies: Array) -> void:
 if not current():_frame={"ready":false};return
 _frame={"ready":true,"serial":int(main.world.get_native_projectile_fx_context().frame_reset_epoch),"sp":sp,"context":{"lesson_active":false,"qa_storage_active":false,"aggro_active":false},"player":{"x":main.player.global_position.x,"y":main.player.global_position.y,"r":main.player.radius,"iframes":main.player.iframes,"s":main.player.state}}
func fire(actor: Node2D) -> bool:
 if not actors.has(actor) or actor.not_ready!="" or not current() or not _frame.get("ready",false):return false
 var el: int=actor.data.element_id
 var a: float=(main.player.global_position-actor.global_position).angle()
 var speed_value: float=3.3 if el==3 else 3.2 if el in [1,2] else 3
 var mult: float=1.0 if el==3 else 1.2 if el in [1,2] else 0.8
 var life: int=int({18:400,19:400,23:800,25:600}[actor.etype]*0.3)
 var props: Dictionary={"x":actor.global_position.x,"y":actor.global_position.y,"vx":cos(a)*speed_value,"vy":sin(a)*speed_value,"dmg":int(actor.attack*mult),"el":el,"friendly":false,"life":life,"ml":life,"sz":1.6 if el in [1,2,3] else 1.5,"col":{1:"#ff2e22",2:"#317cec",3:"#a44cff"}.get(el,"#bbbbbb"),"_commit":true}
 if el==1:props.fireMagic=true
 if el==2:props.waterBean=true
 if el==3:props.gbBean=true
 var r: Dictionary=main.native_natural_enemies.emit_projectile(actor,props)
 return r.get("ready",false) and r.get("receipt") is Dictionary and r.receipt.get("projectile_result") is Dictionary
func zone(actor: Node2D) -> bool:
 if not actors.has(actor) or actor.etype!=25:return false
 zones.append({"position":actor.global_position,"life":480.0,"el":3,"sz":2.0});queue_redraw();return true
func _physics_process(_delta: float) -> void:
 if not current() or not _frame.get("ready",false):return
 var serial: int=_frame.serial
 if serial==int(get_meta("zone_serial",-1)):return
 set_meta("zone_serial",serial)
 for i in range(zones.size()-1,-1,-1):
  var z: Dictionary=zones[i];z.life-=_frame.sp*0.667
  # Source stationary zones are camera-cull exempt; near-camera expiry retention.
  var camera: Camera2D=get_viewport().get_camera_2d()
  var center: Vector2=camera.global_position if camera!=null else main.player.global_position
  var retire: bool=false
  if z.life<=0:
   if z.position.distance_squared_to(center)>6250000:retire=true
   else:z.life=1
  if main.player.iframes<=0 and main.player.state!="charge" and main.player.global_position.distance_to(z.position)<main.player.radius+z.sz*3+4:
   if z.el==2:main.player.apply_native_freeze_slow(60)
   retire=true
  if retire:zones.remove_at(i)
 queue_redraw()
func _draw() -> void:
 for z in zones:draw_circle(to_local(z.position),z.sz*5,Color(0.37,0.06,0.66,0.3))

func read_projectile_frame() -> Dictionary:
 if is_instance_valid(main) and get_tree().paused:return {"ready":false,"retain_owner":true}
 return _frame if current() else {"ready":false}

func read_projectile_context() -> Dictionary:
 # Original D's explicit baseline: QA/aggro scenes are outside this profile.
 if not current():return {}
 return {"lesson_active":false,"qa_storage_active":false,"aggro_active":false}

func allows_projectile(actor: Node) -> bool:
 return current() and actors.has(actor) and actor.not_ready=="" and _frame.get("ready",false)
