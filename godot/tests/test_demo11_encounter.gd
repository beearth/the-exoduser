extends SceneTree
const USERDIR := "EXODUSER-demo11-37-Isolated-20261021"
const RESULT=preload("res://scripts/native_demo11_clear_result.gd")
var assertions:=0
var failures:=0
class FinalSource extends Node:
 signal final_death(actor: Node, stage_index: int)
func check(ok: bool, label: String) -> void:
 assertions+=1
 if not ok:failures+=1;print("DEMO37_FAIL ",label)
func _initialize() -> void:call_deferred("_run")
func argument(key: String) -> String:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with(key+"="):return arg.substr(key.length()+1)
 return ""
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolation")
 var output: Array=[]
 var code: int=OS.execute(argument("--node-bin"),PackedStringArray([ProjectSettings.globalize_path("res://tests/demo11_37_source_oracle.mjs"),"--source-game="+argument("--source-game")]),output,true)
 var joined: String=""
 for chunk in output:joined+=str(chunk)
 var oracle: Variant=JSON.parse_string(joined)
 check(code==0 and oracle is Dictionary,"original JS result oracle "+joined.left(120))
 if oracle is Dictionary:
  for fixture in oracle.cases:
   var actual: Variant=JSON.parse_string(JSON.stringify(RESULT.calculate(fixture.g,int(fixture.regions))))
   if actual!=fixture.result and failures==0:print("DEMO37_ORACLE_DIFF ",JSON.stringify({"actual":actual,"expected":fixture.result}))
   check(actual==fixture.result,"source result/record "+str(fixture.g))
 var main: Node=preload("res://scripts/main.gd").new()
 root.add_child(main)
 if not main.is_node_ready():await main.ready
 var encounter: Node=main.native_demo_encounter
 var g: Dictionary=main.source_state.read_current_g()
 var regions: Node=main.get_node("NativeRegions")
 check(encounter.snapshot().phase=="field" and not encounter.snapshot().provider_bound,"actual boot installs dormant coordinator")
 var map: Node2D=Node2D.new();main.world.add_child(map)
 var markers: Node2D=Node2D.new();markers.name="Markers";map.add_child(markers)
 check(not main.bind_native_demo_arena_provider(map),"missing marker fail closed")
 for name in ["Entry","Boss","Exit","Return"]:
  var marker:=Marker2D.new();marker.name=name;marker.position=Vector2(4020,7200);markers.add_child(marker)
 check(main.bind_native_demo_arena_provider(map) and not main.bind_native_demo_arena_provider(map),"marker-only provider bound once")
 var pc:=FinalSource.new();main.world.add_child(pc)
 check(main.bind_native_demo_final_death_source(pc,&"final_death") and not main.bind_native_demo_final_death_source(pc,&"final_death"),"PC final signal bound once")
 pc.final_death.emit(main.native_demo_boss_actor,0)
 check(encounter.snapshot().phase=="field" and main.source_state.read_native_drop_records().is_empty(),"premature final signal no reward")
 var options: Dictionary={"room":0,"difficulty_index":5,"stage_diff_offset":0}
 check(main.enter_native_demo_arena(map,options).status=="NOT_READY","locked actual gate rejects entry")
 # P3 owns attribution and gate. Fixture sets readiness inputs, never synthetic kills.
 check(g._regions is Array and g._regions.size()==4,"actual P3 region owner active")
 for region in g._regions:region.cleared=true
 g["_fbDone"]=false
 regions.set("_last_frame",-1.0);regions._physics_process(0)
 check(g.get("_bossUnlocked")!=true,"regions alone cannot bypass live angler requirement")
 g["_fbDone"]=true;g["bossAlive"]=true;g["on"]=true
 regions.set("_last_frame",-1.0);regions._physics_process(0)
 check(g.get("_bossUnlocked")==true and encounter.snapshot().phase=="gate","actual P3 gate signal consumed")
 check(main.enter_native_demo_arena(root,options).status=="NOT_READY","unbound provider rejected")
 var spawned: Dictionary=main.enter_native_demo_arena(map,options)
 if spawned.get("status")=="NOT_READY":
  check(encounter.snapshot().phase=="gate" and not main.leave_native_demo_arena(map),"PC boss NOT_READY preserves gate and rejects clear")
  var bus: Dictionary=main.read_native_final_enemy_death_snapshot()
  check(not bus.is_empty(),"PCI-11 actual subscriber installed")
  print("DEMO37_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":["boss HP/final-death/reward/clear NOT_READY"],"boss_receipt":spawned,"natural_boss_death_verified":false}))
  main.free();quit(1 if failures else 0);return
 check(spawned.status=="READY" and encounter.snapshot().phase=="arena" and g._bossArena,"actual actor spawn and arena transition")
 check(main.player.global_position==map.get_node("Markers/Entry").global_position,"provider Entry marker used")
 check(main.enter_native_demo_arena(map,options).status=="NOT_READY" and not main.leave_native_demo_arena(map),"no duplicate entry or living-boss clear")
 var hp: float=main.read_native_demo_boss().enemy.hp
 g["stageTime"]=7200;g["_totalSpawned"]=16;g["_stageKills"]=15;g["comboMax"]=13;g["_sStats"]={"deaths":0,"dmgTaken":0}
 pc.final_death.emit(root,0);pc.final_death.emit(main.native_demo_boss_actor,1)
 check(encounter.snapshot().phase=="arena","foreign actor/stage signal ignored")
 pc.final_death.emit(main.native_demo_boss_actor,0)
 var records: Array=main.source_state.read_native_drop_records()
 check(encounter.snapshot().phase=="exit" and records.size()==1 and records[0].type=="chest" and not records[0].opened,"actual State reward record, not mock ack")
 check(records[0].x==map.get_node("Markers/Boss").global_position.x and g._bossClearT==120 and not g.bossAlive,"Marker reward and original death-time snapshot")
 check(main.native_demo_end_flow.get_snapshot().phase=="playing" and g.get("stageCleared")!=true,"death never skips Exit contact")
 pc.final_death.emit(main.native_demo_boss_actor,0)
 check(main.source_state.read_native_drop_records().size()==1 and main.read_native_demo_boss().enemy.hp==hp,"duplicate death no reward / protected HP untouched")
 var inventory: Array=[]
 for i in 21:inventory.append({"type":"item","item":{"rarity":0}})
 check(main.source_state.append_native_drop_records(main,inventory).applied and main.source_state.read_native_drop_records().has(records[0]),"existing reward capacity protects unopened source chest")
 var before: float=main.source_state.read_current_p().sp
 g.stageTime=9000
 check(not main.leave_native_demo_arena(root),"foreign Exit provider rejected")
 check(main.leave_native_demo_arena(map),"actual clear -> DEMO11-38 acceptance")
 check(g._clearRecords["0"].t==120 and g._taRecords["0"]==150,"boss-time result / Exit-time TA distinction")
 check(main.native_demo_end_flow.get_snapshot().phase=="clear" and g.stageCleared and paused,"clear writer and actual paused UI")
 # State read_current_p is intentionally paused-not-current; inspect its existing snapshot via _p.
 check(float(main.source_state.get("_p").sp)==before+10,"original SP10 progression once")
 check(not main.leave_native_demo_arena(map),"duplicate clear rejected")
 main.native_demo_end_flow.call("_act","next")
 check(main.native_demo_end_flow.get_snapshot().phase=="end" and g.stage==0 and not g.stageCleared,"clear -> demoEnd no next stage")
 paused=false;main.free()
 print("DEMO37_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"pc_final_signal_fixture":true,"natural_boss_death_verified":false,"map_geometry_changed":false}))
 quit(1 if failures else 0)
