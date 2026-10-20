extends "res://tests/test_demo11_43_stage_spawn_adapter.gd"
const F_DIR="EXODUSER-demo11-etype-f-Isolated-20261021"
const F_HOLES=preload("res://scripts/native_spawn_hole_system.gd")
const HURTE=preload("res://scripts/native_normal_enemy_hurte.gd")
var f_main: Node
var f_actors: Array=[]
var f_provider: Node2D
var f_rows: Array=[]
var f_spawn_us:=0
func source_input(etype: int) -> Dictionary:
 var literal: Dictionary={}
 for draw in F_HOLES.MKEN_LITERAL_DRAWS:
  if draw[1].is_empty() or draw[1].has(etype): literal[draw[0]]=draw[2]+(30.0 if etype==26 and draw[0]=="_iceBlizzT" else draw[3])*0.5
 return {"etype":etype,"elite":0,"mods":[],"speed_u":0.5,"radius_u":0.5,"literal":literal,"spawn_n":1}
func boot_f() -> void:
 check(OS.get_user_data_dir().ends_with(F_DIR),"actual F userdir")
 f_main=load("res://scenes/main.tscn").instantiate()
 root.add_child(f_main)
 await physics_frame
 check(f_main.source_state.apply_native_intro_curtain_g_writes(f_main.source_intro_sequence,"open").get("applied",false),"test-owned request through existing intro G.on writer")
 f_main.world.set_physics_process(false) # deterministic test-only manual owner phase
 f_provider=Provider.new()
 f_main.world.add_child(f_provider)
 var points: Array=[]
 for y in range(-240,241,80):
  for x in range(-240,241,80):
   var at: Vector2=f_main.player.global_position+Vector2(x,y)
   if at.distance_to(f_main.player.global_position)>100 and f_main.world.can_move(at+Vector2(38,0),38): points.append(at)
 check(points.size()>=3,"three geometry-valid fixture Marker sites")
 if points.size()<3:return
 for i in range(3):
  var marker=Marker2D.new();f_provider.add_child(marker);marker.global_position=points[i]
  var id="F"+str(26+i)
  f_provider.rows.append({"id":id,"marker":marker,"region_id":0,"size":0.3,"room":0})
  f_provider.groups.append({"hole_id":id,"spawn_group_id":id,"region_id":0,"total":8})
 check(f_main.bind_native_spawn_stage_provider(f_provider).ready,"actual adapter/P3 binding")
 var owner: Node=f_main.world.get_node("NativeSpawnHoleSystem")
 var total: Variant=f_main.source_state.read_current_g()._totalSpawned
 var bad: Dictionary=source_input(26)
 bad.literal._iceBlizzT=95.0
 check(not f_main.request_native_etype_f_spawn(owner,"F26",bad).get("ready",false),"source31233 range30; no P3 table40 fallback")
 var spawn_begin:=Time.get_ticks_usec()
 for etype in range(26,29):
  var result: Dictionary=f_main.request_native_etype_f_spawn(owner,"F"+str(etype),source_input(etype))
  check(result.get("ready",false) and result.get("registered",false),"real registered etype "+str(etype)+":"+str(result.get("reason")))
  if result.get("ready",false):
   var actor: Node2D=result.actor
   f_actors.append(actor)
   check(actor.get_parent()==f_main.world and f_main.world.get_enemies().has(actor),"actual ens/tree identity "+str(etype))
   check(actor.etype==etype and actor.hp==875 and actor.attack==31 and actor.el==-1,"source mkEn normal lv1 stats, undefined el retained "+str(etype))
   check(actor.global_position==result.site.position,"Marker receipt position "+str(etype))
   check(not actor.is_physics_processing(),"single World phase owner "+str(etype))
 f_spawn_us=Time.get_ticks_usec()-spawn_begin
 check(f_main.source_state.read_current_g()._totalSpawned==total,"no denominator inflation")
 check(not f_main.request_native_etype_f_spawn(owner,"F26",source_input(26)).get("ready",false),"one source token consumed once")
 check(not f_main.request_native_etype_f_spawn(f_main,"F26",source_input(26)).get("ready",false),"foreign scheduler refused")
func run() -> void:
 await boot_f()
 check(f_actors.size()==3,"three actual F actors required, no skipped case success")
 var damage: Array=[]
 for actor in f_actors:
  actor.eShield=0;actor.data.native_final.reviveIframes=0.0
  var before: float=actor.hp
  var result: Dictionary=HURTE.new().execute(f_main,f_main.world,actor,1,0.0,0,{})
  check(result.ok and actor.hp<before and actor.alive,"actual protected hurtE "+str(actor.etype))
  damage.append({"etype":actor.etype,"before":before,"after":actor.hp,"ok":result.ok,"reason":result.get("reason")})
 if f_actors.size()==3:
  for t in range(16):
   for actor in f_actors: actor.advance_native_phase(0.5,float(t),f_main.world.get_enemies())
  var wizard: Node2D=f_actors[0]
  wizard.f_source._iceBlizzT=0;wizard.alerted=true
  wizard.advance_native_phase(0.5,20,[])
  check(wizard.f_not_ready.has("blizzard") and wizard.f_pending.blizzard.el==3 and wizard.f_pending.blizzard.life==180 and wizard.f_pending.blizzard.dmg==9,"source dark blizzard request; actual owner missing")
  var pending: Dictionary=wizard.f_pending.blizzard
  var ticks: int=wizard.f_ticks
  wizard.advance_native_phase(0.5,21,[])
  check(is_same(pending,wizard.f_pending.blizzard) and wizard.f_ticks==ticks+1 and wizard.f_fault.is_empty(),"pending operation only; no repeated random payload/global actor stop")
  var bat: Node2D=f_actors[1]
  bat.global_position=f_main.player.global_position+Vector2(200,0);bat.alerted=true;bat.state="idle";bat.f_source._iceSwoopT=0
  bat.advance_native_phase(0.5,22,[])
  check(bat.state=="eSwoop" and bat.st2==15 and bat.f_not_ready.has("icicle_0"),"source swoop prefix and first wrapper wait")
  var args: Array=bat.f_pending.icicle_0.args
  check(args.slice(1)==[2.5,0.8,2,180,"#aabbee",1.5] and not bat.f_pending.has("icicle_1"),"exact eProjAt wrapper args; no second RNG before first ack")
  var golem: Node2D=f_actors[2]
  golem.global_position=f_main.player.global_position+Vector2(60,0);golem.alerted=true;golem.state="idle";golem.f_source._iceSlamT=0
  golem.advance_native_phase(0.5,23,[])
  check(golem.state=="eSlamWind" and golem.st2==50 and f_main.player.get_native_freeze_slow_ticks()==120,"real PC freeze API120 and source wind50")
  var player_hp: float=f_main.player.hp
  golem.st2=0;golem.advance_native_phase(0.5,24,[])
  check(golem.f_not_ready.has("slam_contact") and golem.state=="eSlamWind" and f_main.player.hp==player_hp,"no fake slam damage/knockback ack")
 print("ETYPE_F_RUNTIME_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"registered":f_actors.size(),"damage":damage,"freeze_ticks":f_main.player.get_native_freeze_slow_ticks(),"actual_projectile_or_slam_damage_verified":false,"MAP11_fixture":true}))
 f_main.free()
 await process_frame
 quit(0 if failures==0 else 1)
