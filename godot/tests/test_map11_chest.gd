extends SceneTree
const USERDIR := "EXODUSER-map11-prod-Isolated-20261021"
const REWARDS=preload("res://scripts/native_map11_chest_rewards.gd")
var checks:=0
var failures:=0
var values: Array=[]
var cursor:=0
var inner_rng:=RandomNumberGenerator.new()
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("MAP11_CHEST_FAIL ",label)
func arg(key: String) -> String:
 for s in OS.get_cmdline_user_args():
  if s.begins_with(key+"="):return s.substr(key.length()+1)
 return ""
func rng(tag: String) -> float:
 if not tag.begins_with("chest_"):return inner_rng.randf()
 var result: float=values[cursor];cursor+=1;return result
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated namespace")
 if failures:quit(1);return
 var cases: Array=[];var actuals: Array=[]
 for count in [0.0,.5,.999]:
  values=[count]
  for i in 5:values.append_array([i*.15,.8,[.1499,.15,.3999,.40,.70][i],.25,.75])
  cursor=0;inner_rng.seed=45021
  var built:=REWARDS.build(Vector2.ZERO,0,1,rng)
  check(built.status=="READY","existing mkItem accepts all chest rarities")
  var filtered: Array=[]
  for row in built.records:filtered.append({"x":row.x,"y":row.y,"type":row.type,"picked":row.picked,"item":{"slot":row.item.slot,"tier":row.item.tier,"el":row.item.el,"rarity":row.item.rarity}})
  cases.append({"values":values.duplicate()});actuals.append({"records":filtered,"outer_draws":cursor,"mats":built.mats_bonus+built.hp_extract})
 var cases_file:=ProjectSettings.globalize_path("user://chest_cases.json")
 var out:=ProjectSettings.globalize_path("user://chest_oracle.json")
 var file:=FileAccess.open(cases_file,FileAccess.WRITE);file.store_string(JSON.stringify(cases));file.close()
 var chunks: Array=[]
 var code:=OS.execute(arg("--node-bin"),PackedStringArray([ProjectSettings.globalize_path("res://tests/map11_chest_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--cases-file="+cases_file,"--out-file="+out]),chunks,true)
 check(code==0,"UTF8 file original oracle "+"".join(chunks).left(160))
 if code==0:
  var expected: Array=JSON.parse_string(FileAccess.get_file_as_string(out))
  for i in cases.size():
   check(JSON.parse_string(JSON.stringify(actuals[i].records))==expected[i].records,"original outer records "+str(i))
   check(actuals[i].outer_draws==expected[i].outer_draws,"original outer draw order "+str(i))
   check(actuals[i].mats==expected[i].mats and expected[i].mats==7,"original addPotion hp2 means total mats7")
 var main: Node=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 for i in 8:await physics_frame
 var chest: Node=main.native_map11_chest
 check(chest.snapshot().anchor=="map11.arena.boss" and not chest.visible,"actual bound marker and hidden until PC completion")
 check(chest.request_completion({"hp":0,"defeated":true},main).status=="NOT_READY","arbitrary HP/death receipt not authority")
 check(chest.open_chest().status=="NOT_READY","no chest open before PC completion")
 # Explicit component fixture; never called a real PC death or natural play PASS.
 var sites: Dictionary=main.read_native_map11_provider().transition_sites()
 main.player.global_position=sites.field_gate.global_position;main.request_native_map11_transition("enter")
 chest.set("_available",true);chest.show()
 var before: Dictionary=main.source_state.read_current_g().duplicate(true)
 main.player.global_position=chest.global_position+Vector2(60,0)
 check(chest.open_chest().reason=="distance","strict source <60 boundary")
 main.player.global_position=chest.global_position
 var records_before: int=main.source_state.read_native_drop_records().size()
 var receipt: Dictionary=chest.open_chest()
 check(receipt.applied and receipt.records>=3 and receipt.records<=5,"component commits through actual State")
 check(main.source_state.read_current_g().mats==before.mats+7,"actual mats owner +7, no potion inventory")
 check(main.source_state.read_native_drop_records().size()==records_before+receipt.records,"actual DEMO11-21 journal records")
 check(not receipt.save_committed and not receipt.persistent_opened,"no fake save or new permanent flag")
 check(not chest.open_chest().applied,"duplicate open refused")
 var foreign:=Node.new()
 check(not main.source_state.commit_native_map11_chest(main,foreign,{}).applied,"foreign chest refused");foreign.free()
 var inv: Dictionary=main.source_state.read_current_inventory()
 var bag_before: int=inv.bag.size()
 var record: Dictionary=main.source_state.read_native_drop_records()[0]
 check(main.source_state.apply_native_pickup_item(main,record.item).applied,"existing INV pickup owner accepts generated item")
 check(inv.bag.size()==bag_before+1,"actual original INV holder grows")
 main.queue_free()
 for i in 16:await process_frame
 await create_timer(.2).timeout
 print("MAP11_CHEST_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"source_cases":3,"production_PC_completion":"NOT_READY","reward_path":"actual Main component fixture, not natural boss death"}))
 quit(1 if failures else 0)
