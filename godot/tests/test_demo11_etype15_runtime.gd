extends "res://tests/test_demo11_43_stage_spawn_adapter.gd"
const B_DIR="EXODUSER-C15-Test-20261022"
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
 preload("res://tests/mac_pcib_fixture_main.gd").install(b_main)
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
 check(points.size()>=1,"five geometry-valid fixture Marker sites")
 if points.size()<1:return
 for i in range(1):
  var marker=Marker2D.new();b_provider.add_child(marker);marker.global_position=points[i]
  var id="B"+str(15+i)
  b_provider.rows.append({"id":id,"marker":marker,"region_id":0,"size":0.3,"room":0})
  b_provider.groups.append({"hole_id":id,"spawn_group_id":id,"region_id":0,"total":8})
 check(b_main.bind_native_spawn_stage_provider(b_provider).ready,"actual adapter/P3 binding")
 var owner: Node=b_main.world.get_node("NativeSpawnHoleSystem")
 var total: Variant=b_main.source_state.read_current_g()._totalSpawned
 var spawn_begin:=Time.get_ticks_usec()
 for etype in range(15,16):
  var result: Dictionary=b_main.request_native_etype15_spawn(owner,"B"+str(etype),source_input(etype))
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
 check(not b_main.request_native_etype15_spawn(owner,"B15",source_input(15)).get("ready",false),"one source token consumed once")
 check(not b_main.request_native_etype15_spawn(b_main,"B15",source_input(15)).get("ready",false),"foreign scheduler refused")

var deaths: Array=[]
func final_death(event: Dictionary) -> void:
 if event.event=="final_death":deaths.append(event.actor)
func run() -> void:
 await boot_b()
 check(b_actors.size()==1,"one actual C15 actor")
 var oracle: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://tests/etype15_source_oracle.json"))
 if b_actors.size()==1:
  var actor: Node=b_actors[0]
  for row in oracle.rows:
   var runtime: Dictionary=b_main._native_etype15_spawn._build_runtime(15,Vector2(351,543),source_input(15),{"lv":int(row.lv)},0)
   for key in ["hp","mhp","atk","r","speed","poise","maxPoise","eShield","eShieldMax","st2","facing","projT","projCd","_splitDone","baseSpd"]:
    check(is_equal_approx(float(runtime.native_final.get(key,0)),float(row.expected[key])),"original constructor oracle lv%d %s"%[row.lv,key])
  for expected in oracle.split:
   var pos:=Vector2(expected.x,expected.y)
   var runtime: Dictionary=b_main._native_etype15_spawn._build_runtime(15,pos,source_input(15),{"lv":1},0)
   b_main._native_etype15_spawn.apply_split_overrides(runtime,26.0,-1,"")
   for key in expected:
    check(is_equal_approx(float(runtime.native_final.get(key,0)),float(expected[key])),"original split oracle "+str(key))
  check(b_main.subscribe_native_final_enemy_death(final_death,{"subscriber":b_main,"events":["final_death"]}).get("accepted",false),"PCI11 subscribe")
  actor.eShield=0;actor.data.native_final.reviveIframes=0
  actor.data.native_final._revived=true # unit-only: select final death instead of original 50% revival_pending
  var nonlethal: Dictionary=b_main.request_native_hurte(actor,1,0.0,false,{},0,{"token":"C15/nonlethal"})
  check(nonlethal.status=="APPLIED" and actor.alive and actor.hp<875,"nonlethal NOT_READY released")
  var origin: Vector2=actor.global_position
  var count: int=b_main.world.get_enemies().size()
  var kills_before: int=b_main.source_state.read_current_g().kills
  var lethal: Dictionary=b_main.request_native_hurte(actor,1000000,0.0,false,{},0,{"token":"C15/lethal"})
  observations.lethal=lethal
  check(lethal.status=="APPLIED","actual PC death pipeline:"+str(lethal.get("reason")))
  check(b_main.native_pcib_death_effects.calls[15]==1,"PCI09 once")
  check(deaths.count(actor)==1,"PCI11 once")
  check(b_main.world.get_enemies().size()==count+2,"two actual children")
  var prefix: int=-1
  var final: int=-1
  for i in lethal.get("journal",[]).size():
   var label: String=str(lethal.journal[i])
   if label.contains("death_prefix:etype15"):prefix=i
   if label.contains("final_death_published"):final=i
  check(prefix>=0 and final>prefix,"PCI09 before PCI11")
  var child_n:=0
  for child in b_main.world.get_enemies():
   if child.etype!=15 or child==actor:continue
   child_n+=1
   var n: Dictionary=child.data.native_final
   check(n._splitDone and child.hp==int(n.poise*.35) and child.eShield==0 and child.eShieldMax==0,"split stats, full constructor poise")
   check(child.radius==15 and is_equal_approx(child.data.speed_pixels_per_tick,n.baseSpd*1.3),"radius and speed versus preserved baseSpd")
   check(child.global_position.distance_to(origin)>=18 and child.global_position.distance_to(origin)<26,"source offset distance")
   check(b_main.native_stage_spawn_adapter._origins.has(child.get_instance_id()),"child Marker origin")
   check(child.read_native_normal_enemy_hurte_fields(b_main.world).get("_splitDone")==true,"splitDone PCI owner readback")
   child.data.native_final._revived=true # unit-only final-death branch, product retains original revival roll
   var hit: Dictionary=b_main.request_native_hurte(child,1000000,0.0,false,{},0,{"token":"child/"+str(child_n)})
   observations["child"+str(child_n)]={"receipt":hit,"death_count":deaths.count(child)}
   check(hit.status=="APPLIED" and deaths.count(child)==1,"child final death reward pipeline:"+str(hit.get("reason")))
  check(child_n==2 and b_main.native_pcib_death_effects.calls[15]==1,"no recursive split")
  var kills: int=b_main.source_state.read_current_g().kills
  check(kills==kills_before+3,"parent plus two child kill rewards exactly once")
  var replay: Dictionary=b_main.request_native_hurte(actor,1000000,0.0,false,{},0,{"token":"C15/lethal"})
  check(replay.get("replayed",false) and b_main.source_state.read_current_g().kills==kills,"same death no second rewards")
 print("ETYPE15_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"observations":observations}))
 b_main.free()
 await process_frame
 quit(0 if failures==0 else 1)
