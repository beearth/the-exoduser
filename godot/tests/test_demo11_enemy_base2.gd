extends SceneTree
const DIR="EXODUSER-demo11-enemy-base2-Isolated-20261021"
const FIX=preload("res://tests/demo11_etype_a_fixture.gd")
const HOLES=preload("res://scripts/native_spawn_hole_system.gd")
const HURTE=preload("res://scripts/native_normal_enemy_hurte.gd")
const FACTORY=preload("res://scripts/enemy_factory.gd")
var checks:=0
var failures:=0
var main: Node
var rows: Array=[]
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("BASE2_FAIL ",label)
func context() -> Dictionary:return {"lesson_active":false,"qa_storage_active":false,"aggro_active":false}
func step() -> void:
 main.world._physics_process(1.0/60.0)
 main.world.advance_native_owner_phase()
 main.world.advance_native_birth_phase()
func run() -> void:
 check(OS.get_user_data_dir().ends_with(DIR),"isolation")
 main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 if not main.is_node_ready():await main.ready
 main.process_mode=Node.PROCESS_MODE_DISABLED
 var g: Dictionary=main.source_state.read_current_g();g.on=true;g._bossArena=false
 var provider=FIX.Provider.new();provider.world=main.world;main.world.add_child(provider)
 var types: Array=[0,1,4,5,6,8,9,10,11,12,18,19,23,24,25]
 var points: Array=[]
 for y in range(-600,601,100):
  for x in range(-600,601,100):
   var at: Vector2=main.player.global_position+Vector2(x,y)
   if at.distance_to(main.player.global_position)>180 and main.world.can_move(at,60):points.append(at)
 check(points.size()>=15,"15 geometry-valid fixture Markers")
 if points.size()<15:main.free();quit(1);return
 for i in 15:
  var marker:=Marker2D.new();provider.add_child(marker);marker.global_position=points[i]
  var id="BASE2-"+str(types[i])
  provider.rows.append({"id":id,"marker":marker,"region_id":0,"size":0.3,"room":0})
  provider.groups.append({"hole_id":id,"spawn_group_id":id,"region_id":0,"total":8})
 check(main.bind_native_spawn_stage_provider(provider).ready,"real 43 adapter")
 check(main.bind_native_natural_enemy_base(context,false).ready,"one explicit common owner")
 var common: Node=main.native_natural_enemies
 seed(20261021)
 var started:=Time.get_ticks_usec()
 var actors: Array=[]
 for et in types:
  var id="BASE2-"+str(et)
  var made: Dictionary
  if et in [0,1,4,5,6]:made=main.request_native_etype_a_spawn(common.holes,id,FIX.recipe(et))
  elif et in [8,9,10,11,12]:made=main.request_native_etype_b_spawn(common.holes,id,source_input(et))
  else:made=main.spawn_native_demo11_d(id,et)
  check(made.get("ready",false),"actual spawn "+str(et)+":"+str(made.get("reason")))
  if made.get("ready",false):actors.append(made.actor)
 var spawn_us:=Time.get_ticks_usec()-started
 check(actors.size()==15 and common.counts.registered==15 and FACTORY.NATURAL_REGISTRATIONS.size()==15,"one registry 15 unique registrations; 13 death-capable plus 2 HOLD")
 if actors.size()!=15:main.free();quit(1);return
 for a in actors:check(common.owns_actor(a) and not a.is_physics_processing(),"common World identity/clock "+str(a.etype))
 var cross: Dictionary=main.request_native_etype_b_spawn(common.holes,"BASE2-0",source_input(8))
 check(not cross.get("ready",false) and common.counts.registered==15,"cross-profile source token cannot register twice")
 check(not common.admit_source_record(RefCounted.new(),"BASE2-0",{}, {"ready":true,"spawn_group_id":"BASE2-0"},source_input(8)).ready,"foreign profile capability refused")
 var samples: Array=[]
 for tick in 10:
  var tick_start:=Time.get_ticks_usec();step();samples.append(Time.get_ticks_usec()-tick_start)

 for a in actors:
  var ticks: float=a.a_phase_calls if a.etype in [0,1,4,5,6] else (a.b_ticks if a.etype in [8,9,10,11,12] else a.native_ticks)
  check(ticks>=10,"actual World tick "+str(a.etype))
 # Selected profile admission must not silently enable the automatic CDF scheduler.
 for et in types:
  if et==0:continue
  var held: Dictionary=common.spawn_selected(common.holes,"BASE2-"+str(et),source_input(et))
  check(not held.ready and held.reason=="natural_profile_scheduler_HOLD:"+str(et),"automatic profile scheduler remains HOLD "+str(et))
 # Existing A physical carrier + common D raw carrier coexist in registry35.
 var registry: Node=main.native_demo_boss_projectiles
 for a in actors:
  if a.etype in [0,1,4]:a._fire_projectile()
  if a.etype==18:check(main.world.get_node("Demo11EtypeD").fire(a),"D common birth")
 check(registry._entries.values().filter(func(e):return e.get("profile_carrier",false)).size()==3,"three A carriers in common registry")
 step()
 check(registry._entries.values().all(func(e):return e.calls>0),"A and D single shared registry clock")
 for a in actors:
  if a.etype==12:
   check(not a.b_projectile_owner.is_valid(),"B missing projectile profile remains honest HOLD")
 var kills:=0
 var initial_kills: int=int(g._regions[0].kills)
 for a in actors:
  a.data.native_final.reviveIframes=0.0;a.eShield=0
  var before: int=a.hp
  var receipt: Dictionary={}
  if a.etype in [8,9,10,11,12]:receipt=HURTE.new().execute(main,main.world,a,int(a.hp)+1000,0.0,0,{})
  else:a.receive_damage(int(a.hp)+1000,Vector2.RIGHT,"weapon",{})
  var held: bool=a.etype in [8,25]
  check((a.alive and a.hp==before) if a.etype==8 else ((a.alive and a.hp<=0 and a.not_ready.contains("PC_hurtE_42804_death_prefix_required")) if a.etype==25 else (not a.alive and a.hp<=0)),"PC death or explicit HOLD "+str(a.etype)+":"+str(receipt.get("reason","")))
  if not a.alive:kills+=1
  rows.append({"etype":a.etype,"spawn":true,"tick":true,"death":not a.alive,"remaining":"PC death prefix HOLD" if held else "","reason":receipt.get("reason",a.get("not_ready") if a.etype in [18,19,23,24,25] else "")})
 check(kills==13,"13 actual deaths; no forced B8/D25 death")
 check(int(g._regions[0].kills)-initial_kills==13,"13 actual immutable origin kill handoffs")
 check(common._prepared.is_empty(),"no leaked admission capability")
 provider.revision="stale"
 check(not common.emit_profile_projectile(actors[0],Vector2.ZERO,{}),"stale provider cannot emit")
 print("BASE2_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"rows":rows,"actual_spawns":actors.size(),"actual_deaths":kills,"spawn_wall_us":spawn_us,"15_actor_fixed_10tick_us":samples,"optimization":false}))
 main.free();quit(1 if failures else 0)

func source_input(etype: int) -> Dictionary:
 var literal: Dictionary={}
 for draw in HOLES.MKEN_LITERAL_DRAWS:
  if draw[1].is_empty() or draw[1].has(etype):literal[draw[0]]=draw[2]+draw[3]*0.5
 return {"etype":etype,"elite":0,"mods":[],"speed_u":0.5,"radius_u":0.5,"literal":literal,"spawn_n":1}
