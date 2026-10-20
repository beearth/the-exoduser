extends "res://tests/test_demo11_43_stage_spawn_adapter.gd"
const B_DIR="EXODUSER-demo11-etype-b-Isolated-20261021"
const B_HOLES=preload("res://scripts/native_spawn_hole_system.gd")
const HURTE=preload("res://scripts/native_normal_enemy_hurte.gd")
var b_main: Node
var b_actors: Array=[]
var b_provider: Node2D
var b_rows: Array=[]
var b_spawn_us:=0
func source_input(etype: int) -> Dictionary:
 var literal: Dictionary={}
 for draw in B_HOLES.MKEN_LITERAL_DRAWS:
  if draw[1].is_empty() or draw[1].has(etype): literal[draw[0]]=draw[2]+draw[3]*0.5
 return {"etype":etype,"elite":0,"mods":[],"speed_u":0.5,"radius_u":0.5,"literal":literal,"spawn_n":1}
func boot_b() -> void:
 check(OS.get_user_data_dir().ends_with(B_DIR),"actual B userdir")
 b_main=load("res://scenes/main.tscn").instantiate()
 root.add_child(b_main)
 await physics_frame
 check(b_main.source_state.apply_native_intro_curtain_g_writes(b_main.source_intro_sequence,"open").get("applied",false),"test-owned request through existing intro G.on writer")
 b_main.world.set_physics_process(false) # deterministic test-only manual owner phase
 b_provider=Provider.new()
 b_main.world.add_child(b_provider)
 var points: Array=[]
 for y in range(-240,241,80):
  for x in range(-240,241,80):
   var at: Vector2=b_main.player.global_position+Vector2(x,y)
   if at.distance_to(b_main.player.global_position)>100 and b_main.world.can_move(at+Vector2(38,0),38): points.append(at)
 check(points.size()>=5,"five geometry-valid fixture Marker sites")
 if points.size()<5:return
 for i in range(5):
  var marker=Marker2D.new();b_provider.add_child(marker);marker.global_position=points[i]
  var id="B"+str(8+i)
  b_provider.rows.append({"id":id,"marker":marker,"region_id":0,"size":0.3,"room":0})
  b_provider.groups.append({"hole_id":id,"spawn_group_id":id,"region_id":0,"total":8})
 check(b_main.bind_native_spawn_stage_provider(b_provider).ready,"actual adapter/P3 binding")
 var owner: Node=b_main.world.get_node("NativeSpawnHoleSystem")
 var total: Variant=b_main.source_state.read_current_g()._totalSpawned
 var spawn_begin:=Time.get_ticks_usec()
 for etype in range(8,13):
  var result: Dictionary=b_main.request_native_etype_b_spawn(owner,"B"+str(etype),source_input(etype))
  check(result.get("ready",false) and result.get("registered",false),"real registered etype "+str(etype)+":"+str(result.get("reason")))
  if result.get("ready",false):
   var actor: Node2D=result.actor
   b_actors.append(actor)
   check(actor.get_parent()==b_main.world and b_main.world.get_enemies().has(actor),"actual ens/tree identity "+str(etype))
   check(actor.etype==etype and actor.hp==875 and actor.attack==31 and actor.el==-1,"source mkEn normal lv1 stats, undefined el retained "+str(etype))
   check(actor.global_position==result.site.position,"Marker receipt position "+str(etype))
   check(not actor.is_physics_processing(),"single World phase owner "+str(etype))
 b_spawn_us=Time.get_ticks_usec()-spawn_begin
 check(b_main.source_state.read_current_g()._totalSpawned==total,"no denominator inflation")
 check(not b_main.request_native_etype_b_spawn(owner,"B8",source_input(8)).get("ready",false),"one source token consumed once")
 check(not b_main.request_native_etype_b_spawn(b_main,"B8",source_input(8)).get("ready",false),"foreign scheduler refused")
func run() -> void:
 await boot_b()
 var damage_rows: Array=[]
 for actor in b_actors:
  # Test-owned shield/iframe setup exposes the protected owner HP writer; no HP
  # writer substitute. Original source spawn grants 15 reviveIframes.
  actor.eShield=0
  actor.data.native_final.reviveIframes=0.0
  var before: int=actor.hp
  var result: Dictionary=HURTE.new().execute(b_main,b_main.world,actor,1,0.0,0,{})
  damage_rows.append({"etype":actor.etype,"before":before,"after":actor.hp,"receipt":result})
  if actor.etype==8:
   check(not result.ok and actor.hp==before and str(result.reason).contains("etype8_protected_death_blast_owner_required"),"only type8 refused before missing protected death")
  else:
   check(result.ok and actor.hp<before and actor.alive,"actual protected hurtE nonlethal HP write "+str(actor.etype)+":"+str(result.get("reason")))
 if b_actors.size()==5:
  # Let the real hurtE hit-stun prefix expire before testing unrelated B states.
  for tick in range(16):
   for actor in b_actors: actor.advance_native_phase(0.5,float(tick),b_main.world.get_enemies())
  var shadow: Node=b_actors[2]
  shadow.b_source.stealthT=0;shadow.alerted=true;shadow.global_position=b_main.player.global_position+Vector2(60,0)
  shadow.advance_native_phase(0.5,1,[])
  check(shadow.state=="windup" and shadow.st2==10 and not shadow.b_source._cloaked,"source stealth to windup")
  var berserk: Node=b_actors[4]
  berserk.hp=int(berserk.mhp*0.39);berserk.alerted=true
  var speed: float=berserk.data.speed_pixels_per_tick
  berserk.advance_native_phase(0.5,1,[])
  check(berserk.b_source._enraged and is_equal_approx(berserk.data.speed_pixels_per_tick,speed*2.2) and berserk.attack==46,"source low-HP enrage")
  berserk.advance_native_phase(0.5,2,[])
  check(berserk.attack==46 and is_equal_approx(berserk.data.speed_pixels_per_tick,speed*2.2),"enrage once")
  var shaman: Node=b_actors[1]
  shaman.b_source.reviveT=0;shaman.alerted=true;shaman.advance_native_phase(0.5,1,[])
  check(shaman.b_fault=="actual_dead_pool_revive_owner_required","missing real deadPool not counterfeit revival")
  var womb: Node=b_actors[3]
  womb.state="eSummon";womb.st2=0;womb.alerted=true;womb.advance_native_phase(0.5,1,[])
  check(womb.b_fault=="actual_type3_count2to3_MAP11_spawn_owner_required","no wrong type7 count or unapproved child coordinates")
 print("ETYPE_B_RUNTIME_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"registered":b_actors.size(),"damage_rows":damage_rows,"combat_scope":"nonlethal_hurtE_types9to12; type8_refused","source_scheduler_auto_tick":false,"MAP11_product_provider":false}))
 b_main.free()
 await process_frame
 quit(0 if failures==0 else 1)
