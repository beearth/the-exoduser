extends SceneTree
const DIR="EXODUSER-demo11-enemy-base3-Isolated-20261021"
const FIX=preload("res://tests/demo11_etype_a_fixture.gd")
const HOLES=preload("res://scripts/native_spawn_hole_system.gd")
const E=preload("res://scripts/native_demo11_etype_e_spawn.gd")
var main: Node
var checks:=0
var failures:=0
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("GATE_FAIL ",label)
func recipe(etype: int=29) -> Dictionary:
 var literal: Dictionary={}
 for draw in HOLES.MKEN_LITERAL_DRAWS:
  if draw[1].is_empty() or draw[1].has(etype):literal[draw[0]]=draw[2]+draw[3]*0.5
 return {"etype":etype,"elite":0,"mods":[],"speed_u":0.5,"radius_u":0.5,"literal":literal,"spawn_n":1}
func step() -> void:
 main.world._physics_process(1.0/60)
 main.world.advance_native_owner_phase()
 var e: Node=main.world.get_node("Demo11EtypeE")
 e.advance_warnings(main.world.get_native_frame(),main.world._native_last_ticks)
 main.world.advance_native_birth_phase()
func check_packet(actual: Dictionary,expected: Dictionary,label: String) -> void:
 check(actual.size()==expected.size(),label+" exact key count")
 for key in expected:
  var equal: bool=actual.has(key)
  if equal:
   if expected[key] is float or expected[key] is int:equal=absf(float(actual[key])-float(expected[key]))<0.000000001
   else:equal=actual[key]==expected[key]
  check(equal,label+"/"+key)
func run() -> void:
 check(OS.get_user_data_dir().ends_with(DIR),"isolation")
 main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 if not main.is_node_ready():await main.ready
 main.process_mode=Node.PROCESS_MODE_DISABLED
 var g: Dictionary=main.source_state.read_current_g();g.on=true;g._bossArena=false
 var provider=FIX.Provider.new();provider.world=main.world;main.world.add_child(provider)
 var at: Vector2=main.player.global_position+Vector2(200,0)
 check(main.world.can_move(at,60),"fixture Marker geometry")
 var marker:=Marker2D.new();provider.add_child(marker);marker.global_position=at
 provider.rows.append({"id":"E-marker","marker":marker,"region_id":0,"size":0.3,"room":-1})
 provider.groups.append({"hole_id":"E-marker","spawn_group_id":"E-group","region_id":0,"total":8})
 check(main.bind_native_spawn_stage_provider(provider).ready,"actual 43 Marker adapter")
 var holes: Node=main.world.get_node("NativeSpawnHoleSystem")
 var before: Dictionary=main.world.get_native_runtime_snapshot()
 var before_count: int=main.world.get_enemies().size()
 var r3: Dictionary=main.request_native_etype_e_spawn(holes,"E-group",recipe(3))
 var r7: Dictionary=main.request_native_etype_e_spawn(holes,"E-group",recipe(7))
 check(not r3.ready and r3.reason=="PC_type3_hurtE_field_owner_required","actual missing type3 field owner")
 check(not r7.ready and r7.reason=="missing_actual_type3_handle_m29_parry","actual missing type7 M29 callable")
 check(main.world.get_enemies().size()==before_count and main.world.get_native_runtime_snapshot().random_draw_count==before.random_draw_count,"3/7 reject before RNG/registry")
 var result: Dictionary=main.request_native_etype_e_spawn(holes,"E-group",recipe())
 check(result.get("ready",false),"actual guard constructor/common admission:"+str(result.get("reason")))
 if not result.get("ready",false):main.free();quit(1);return
 var actor: Node=result.actor
 var service: Node=main.world.get_node("Demo11EtypeE")
 var common: Node=main.native_natural_enemies
 check(actor.hp==3500 and actor.attack==62 and actor.radius==58 and actor.poise==80 and actor.eShield==875 and actor.el==0,"forced G31620–28 preserves constructor shield/mods")
 check(common.owns_actor(actor) and common.projectile_component(actor)==service and not actor.is_physics_processing(),"one prepared World/profile clock")
 check(not main.request_native_etype_e_spawn(holes,"E-group",recipe()).ready,"guard prefix once")
 var units: Array=[0.0,0.499999,0.5,0.999999,0.1,0.7,0.4,0.6]
 var fixture:=OS.get_user_data_dir().path_join("guard-source-input.json")
 var oracle:=OS.get_user_data_dir().path_join("guard-source-output.json")
 var file:=FileAccess.open(fixture,FileAccess.WRITE);file.store_string(JSON.stringify({"at":[actor.global_position.x,actor.global_position.y],"lv":1,"units":units}));file.close()
 var node_bin:="";var source:=""
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--node-bin="):node_bin=arg.trim_prefix("--node-bin=")
  if arg.begins_with("--source-game="):source=arg.trim_prefix("--source-game=")
 var output: Array=[]
 var rc:=OS.execute(node_bin,[ProjectSettings.globalize_path("res://tests/demo11_gate_guard_source_oracle.mjs"),"--source-game="+source,"--fixture="+fixture,"--out="+oracle],output,true)
 check(rc==0,"original source oracle:"+"\n".join(output))
 if rc!=0:main.free();quit(1);return
 var expected: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(oracle))
 for key in expected.constructor:
  var actual: Variant=actor.data.native_final.get(key)
  if key=="speed":actual=actor.data.speed_pixels_per_tick
  check(actual==expected.constructor[key] if not actual is float else absf(float(actual)-float(expected.constructor[key]))<0.000000001,"original mkEn+forced/"+str(key))
 var attacks: Array=E.attack_packets(actor.global_position,actor.radius,actor.facing,actor.attack)
 var deaths: Array=E.death_packets(actor.global_position,actor.attack,units)
 check(expected.draws==8 and attacks.size()==8 and deaths.size()==8,"8 source death RNG draws, exact attack/death lanes")
 for i in 8:
  check_packet(attacks[i],expected.attack[i],"original attack"+str(i))
  check_packet(deaths[i],expected.death[i],"original death"+str(i))
 var grouped: Array=[]
 for lane in E.death_lanes(deaths):
  for raw in lane.shots:
   var props: Dictionary=raw.duplicate(true);props._commit=true;grouped.append(props)
 for i in 8:check_packet(grouped[i],expected.death_emit_order[i],"original death warning release order"+str(i))
 check(E.death_packets(Vector2.ZERO,10,[1.0]).is_empty(),"invalid RNG prefix cannot manufacture death shots")
 check(not service.after_pc_final_death(main,actor).ready and not service.request_final_death(actor).ready,"no fixture/dead ack bypasses PCI11")
 check(main.world.get_native_runtime_snapshot().random_draw_count==before.random_draw_count,"pure oracle/blocked PC death consumes no World RNG")
 # Exact source attack reaches shared registry only after the 60-tick warning.
 actor.global_position=main.player.global_position+Vector2(90,0);actor.alerted=true;actor.data.native_final._iceSlamT=0
 main.player.iframes=1000000.0
 step()
 check(actor.state=="eSlamWind" and actor.st2==45 and service.warnings.size()==1,"strict <120 source wind45 and eight-shot warning")
 check(main.player.get_native_freeze_slow_ticks()>=120,"strict <100 uses existing Player freeze API")
 var registry: Node=main.native_demo_boss_projectiles
 var born: int=registry.snapshot().born
 for i in 58:step()
 check(registry.snapshot().born==born,"no early birth during warning59")
 step()
 check(registry.snapshot().born==born+8 and service.births==8 and service.warnings.is_empty(),"actual eight I source carriers after60 in common35")
 check(registry._entries.values().filter(func(e):return e.raw.get("waterBean",false) and e.raw.el==2 and e.calls>0).size()==8,"eight real carriers tick with authorized source element override")
 check(actor.gate_not_ready.get("slam")=="actual_PC_contact_owner_required" and main.player.hp>0,"protected slam remains explicit HOLD")
 check(not common.emit_projectile(actor,{"el":2}).ready,"arbitrary element override cannot bypass packet capability")
 # PC hurtE owns nonlethal damage and the refused lethal prefix; Mac never writes HP/alive/gate.
 actor.eShield=0;actor.data.native_final.reviveIframes=0
 var hp: int=actor.hp
 actor.receive_damage(1,Vector2.RIGHT,"weapon",{})
 check(actor.hp==hp-1 and actor.alive,"existing PC hurtE nonlethal HP owner")
 actor.receive_damage(int(actor.hp)+1000,Vector2.RIGHT,"weapon",{})
 check(actor.alive and actor.hp<=0 and actor.gate_not_ready.get("final_death")=="PCI11_final_death_owner_required","lethal PC HP prefix stops before Mac final-death/gate")
 check(not main.native_stage_spawn_adapter.record_actor_kill(actor).get("applied",false) and int(g._regions[0].kills)==0,"unconfirmed guard never commits origin or gate")
 check(not g.get("_gateGuardKilled",false) and main.native_demo_encounter.snapshot().phase=="field","gate authority unchanged")
 print("GATE_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"actual_guard_spawn":true,"actual_attack_carriers":service.births,"death_packets_source_verified":8,"actual_final_death":"HOLD_PCI11","types3_7":"NOT_READY_PC","skipped":[]}))
 main.free();quit(1 if failures else 0)
