extends SceneTree
const USERDIR := "EXODUSER-demo11-44-Isolated-20261021"
const RESULT=preload("res://scripts/native_demo11_clear_result.gd")
var assertions:=0
var failures:=0
class FinalSource extends Node:
 signal final_death(actor: Node, stage_index: int)
 signal field_final(index: int,hp: float,final_death: bool,serial: int)
func check(ok: bool, label: String) -> void:
 assertions+=1
 if not ok:failures+=1;print("DEMO44_FAIL ",label)
func _initialize() -> void:call_deferred("_run")
func argument(key: String) -> String:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with(key+"="):return arg.substr(key.length()+1)
 return ""
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolation")
 var oracle_path: String=OS.get_user_data_dir().path_join("pet-survival-oracle.json")
 var output: Array=[]
 var code: int=OS.execute(argument("--node-bin"),PackedStringArray([ProjectSettings.globalize_path("res://tests/build_demo11_44_pet_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--output="+oracle_path]),output,true)
 check(code==0,"original JS urgent slice UTF8 file: "+"".join(output))
 var oracle: Variant=JSON.parse_string(FileAccess.get_file_as_string(oracle_path))
 check(oracle is Dictionary,"UTF8 oracle JSON complete")
 if oracle is Dictionary:
  for row in oracle.cases:
   check(preload("res://scripts/native_pets.gd").demo_boss_survival_ids(row.boss,row.p)==row.expected,"source boss survival selection "+str(row.boss))
 check(preload("res://scripts/native_pets.gd").demo_boss_survival_ids({"alive":true,"stunned":1},{"skills":{"execution":1}}).is_empty(),"execution cooldown owner absent stays HOLD, no false groggy fallback")
 var main: Node=preload("res://scripts/main.gd").new()
 root.add_child(main)
 if not main.is_node_ready():await main.ready
 var encounter: Node=main.native_demo_encounter
 var pets: Node=main.world.get_node("NativePets")
 pets.set_physics_process(false)
 check(pets.get_native_pets_snapshot().demo_owner_bound,"actual Main binds pet observers")
 check(not pets.bind_demo_owners(main) and not pets.bind_demo_owners(root),"duplicate/foreign pet owner binding rejected")
 var g: Dictionary=main.source_state.read_current_g()
 var regions: Node=main.get_node("NativeRegions")
 # Explicit HP/position fixture; no damage success claimed. Recovery uses actual State writer.
 g.on=true
 main.player.global_position=Vector2(100000,100000)
 var max_hp: float=main.player.max_hp
 main.player.hp=max_hp*0.05
 pets.call("_check_pet_dialogue")
 check(pets.get_native_pets_snapshot().say_log.back().id=="hp_critical","live State HP feeds original critical speech")
 var hp_receipt: Dictionary=main.source_state.commit_native_auto_potion(main,"hp",max_hp)
 check(hp_receipt.get("accepted")==true and main.source_state.read_current_p().hp==max_hp,"recovery goes through existing State/HP authority")
 var hp_before: float=main.player.hp
 pets.call("_check_pet_dialogue")
 check(main.player.hp==hp_before,"pet read never heals or damages")
 # Empty current bubble only in this explicit event fixture; normal CD tests are separate.
 pets.set("_pet_bubble",{"who":null,"source":"","txt":"","t":0.0,"mt":0.0,"pair":null,"pair_fired":false})
 check(encounter.snapshot().phase=="field" and not encounter.snapshot().provider_bound,"actual boot installs dormant coordinator")
 var map: Node2D=Node2D.new();main.world.add_child(map)
 var markers: Node2D=Node2D.new();markers.name="Markers";map.add_child(markers)
 check(not main.bind_native_demo_arena_provider(map),"missing marker fail closed")
 for name in ["Entry","Boss","Exit","Return"]:
  var marker:=Marker2D.new();marker.name=name;marker.position=Vector2(4020,7200);markers.add_child(marker)
 check(main.bind_native_demo_arena_provider(map) and not main.bind_native_demo_arena_provider(map),"marker-only provider bound once")

 var field_markers: Array=[]
 for i in range(4):
  var fm:=Marker2D.new();fm.position=Vector2(6000+i*500,7000);map.add_child(fm);field_markers.append(fm)
 check(main.bind_native_demo_anglers(map,field_markers),"actual field owner receives authored Marker fixture")
 for frame in range(3):await physics_frame
 check(pets.call("_demo_targets").is_empty(),"source iris only searches ens; field actors remain excluded")
 var pc:=FinalSource.new();main.world.add_child(pc)
 check(main.bind_native_demo_final_death_source(pc,&"final_death") and not main.bind_native_demo_final_death_source(pc,&"final_death"),"PC final signal bound once")
 pc.final_death.emit(main.native_demo_boss_actor,0)
 check(encounter.snapshot().phase=="field" and main.source_state.read_native_drop_records().is_empty(),"premature final signal no reward")
 check(main.native_demo_anglers.bind_pc_source(pc,&"field_final"),"existing PC field final seam bound")
 for i in range(4):pc.field_final.emit(i,0.0,true,i+1)
 check(pets.get_native_pets_snapshot().demo_owner_events.get("field_done")==true and pets.call("_demo_targets").is_empty(),"accepted field final family removes iris targets and records owner event")
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
 check(pets.get_native_pets_snapshot().demo_owner_events.get("gate")==true and pets.get_native_pets_snapshot().say_log.back().id=="boss_gate_open","P3 gate -> 37 -> original urgent pet speech")
 check(main.enter_native_demo_arena(root,options).status=="NOT_READY","unbound provider rejected")
 var spawned: Dictionary=main.enter_native_demo_arena(map,options)
 check(spawned.status=="READY" and encounter.snapshot().phase=="arena" and g._bossArena,"actual actor spawn and arena transition")
 var boss_samples: Array=pets.call("_demo_targets")
 check(boss_samples.size()==1 and boss_samples[0].key=="boss","actual boss owner read becomes iris candidate without normal registry mutation")
 main.player.global_position=map.get_node("Markers/Boss").global_position
 pets.call("_update_ghost_iris")
 check(pets.get_native_pets_snapshot().demo_iris_key=="boss","iris follows live boss via read-only owner sample")
 main.player.global_position=map.get_node("Markers/Entry").global_position
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
 check(pets.get_native_pets_snapshot().say_log.back().id=="boss_kill","accepted PC final -> State reward -> forced original boss-kill line")
 check(pets.call("_demo_targets").is_empty(),"final owner transition removes iris boss despite untouched HP fixture")
 var count_after_final: int=pets.get_native_pets_snapshot().say_log.size()
 check(main.native_demo_end_flow.get_snapshot().phase=="playing" and g.get("stageCleared")!=true,"death never skips Exit contact")
 pc.final_death.emit(main.native_demo_boss_actor,0)
 check(main.source_state.read_native_drop_records().size()==1 and main.read_native_demo_boss().enemy.hp==hp,"duplicate death no reward / protected HP untouched")
 check(pets.get_native_pets_snapshot().say_log.size()==count_after_final,"duplicate PC final cannot repeat speech")
 var inventory: Array=[]
 for i in 21:inventory.append({"type":"item","item":{"rarity":0}})
 check(main.source_state.append_native_drop_records(main,inventory).applied and main.source_state.read_native_drop_records().has(records[0]),"existing reward capacity protects unopened source chest")
 var before: float=main.source_state.read_current_p().sp
 g.stageTime=9000
 check(not main.leave_native_demo_arena(root),"foreign Exit provider rejected")
 check(main.leave_native_demo_arena(map),"actual clear -> DEMO11-38 acceptance")
 check(g._clearRecords["0"].t==120 and g._taRecords["0"]==150,"boss-time result / Exit-time TA distinction")
 check(main.native_demo_end_flow.get_snapshot().phase=="clear" and g.stageCleared and paused,"clear writer and actual paused UI")
 check(pets.get_native_pets_snapshot().demo_owner_events.get("clear")==true,"actual Exit clear receipt reaches pet observer before paused end UI")
 check(not pets.get_native_pets_snapshot().say_log.any(func(row):return row.id=="chapter_clear_0"),"no invented call to dead source chapter-clear callback")
 # State read_current_p is intentionally paused-not-current; inspect its existing snapshot via _p.
 check(float(main.source_state.get("_p").sp)==before+10,"original SP10 progression once")
 check(not main.leave_native_demo_arena(map),"duplicate clear rejected")
 main.native_demo_end_flow.call("_act","next")
 check(main.native_demo_end_flow.get_snapshot().phase=="end" and g.stage==0 and not g.stageCleared,"clear -> demoEnd no next stage")
 paused=false;main.free()
 print("DEMO44_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"pc_final_signal_fixture":true,"natural_boss_death_verified":false,"map_geometry_changed":false}))
 quit(1 if failures else 0)
