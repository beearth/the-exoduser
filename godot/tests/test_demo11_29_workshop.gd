extends SceneTree
const USERDIR="EXODUSER-demo11-29-Isolated-20261021"
const Drop=preload("res://port_modules/kill_reward/drop_item_source.gd")
var assertions:=0
var failures:=0
var main: Node
var state: Node
var inv: Dictionary
var g: Dictionary
var gems: Array
var stones: Array
var cases: Array=[]
class RejectRefresh extends RefCounted:
 var nested: Dictionary
 var forge: Dictionary
 var pickup: Dictionary
 var workshop_pickup: Dictionary
 func refresh(owner: Node,_mode: String,_reason: String) -> Dictionary:
  nested=owner.request_native_workshop("gem_buy",{"id":"cr_last_breath"})
  forge=owner.source_state.apply_native_forge_enhance(owner,owner.source_state.read_current_inventory().equipped.weapon)
  pickup=owner.source_state.apply_native_pickup_item(owner,{"slot":"armor"})
  workshop_pickup=owner.source_state.apply_native_workshop_pickup(owner,owner.source_workshop,{"slot":"armor"})
  return {"committed":false,"reason":"injected_refresh_failure"}
func check(ok: bool,label: String) -> void:
 assertions+=1
 if not ok:failures+=1;print("DEMO29_FAIL ",label)
func argument(key: String) -> String:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with(key+"="):return arg.substr(key.length()+1)
 return ""
func _initialize() -> void:call_deferred("_run")
func transact(op: String,args: Dictionary,oracle: bool=true) -> Dictionary:
 var safe: Dictionary=args.duplicate();safe.erase("item");safe.erase("gem")
 var c: Dictionary={"op":op,"a":safe,"inv":inv.duplicate(true),"gems":gems.duplicate(true),"stones":stones.duplicate(true),"dust":state.read_native_workshop_dust(),"mats":g.mats,"lv":state.read_current_p().lv}
 var draws: int=main.world.get_native_runtime_snapshot().random_draw_count
 var result: Dictionary=main.request_native_workshop(op,args)
 if result.has("refresh"):
  check(result.refresh.get("mode")=="apply_stats" and result.refresh.get("cache_invalidations")==1,"source direct applyStats; no equipment clamp or pre-invalidation")
 check(result.get("applied",false),op+" actual State commit: "+str(result.get("reason","")))
 check(main.world.get_native_runtime_snapshot().random_draw_count-draws==result.get("rng_draws",[]).size(),op+" shared RNG exact draw receipt")
 if result.get("applied",false) and oracle:
  c.rng=result.rng_draws
  c.after={"created":result.get("created"),"mats":g.mats} if op=="equipment_craft" else {"inv":inv.duplicate(true),"gems":gems.duplicate(true),"stones":stones.duplicate(true),"dust":state.read_native_workshop_dust(),"mats":g.mats}
  cases.append(c)
 return result
func gem_args(index: int) -> Dictionary:return {"gem_index":index,"gem":gems[index]}
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"effective isolated user dir")
 if failures:quit(2);return
 TranslationServer.set_locale("ko")
 main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 if not main.is_node_ready():await main.ready
 state=main.source_state;inv=state.read_current_inventory();g=state.read_current_g()
 gems=state.read_native_reward_bags().crystal;stones=state.read_native_reward_bags().stone
 g.mats=3000000 # Explicit wallet/material fixture, not natural drops.
 for q in [10,85,100,20,40,60]:
  check(state.apply_native_drop_bags(main,{"id":"cr_blood_oath","star":0,"enh":0,"q":q},{"q":q}).applied,"existing material owner fixture")
 paused=true
 main.source_forge.select_slot("weapon")
 var weapon: Dictionary=inv.equipped.weapon
 var original_hp: float=main.player.hp
 transact("unseal",{"slot":"weapon","item":weapon,"q":10})
 var before_max_hp: float=main.player.max_hp
 var attach: Dictionary={"slot":"weapon","item":weapon,"socket_index":0,"gem_index":0,"gem":gems[0]}
 transact("attach",attach)
 check(is_same(weapon.crystals[0],attach.gem),"actual gem identity transferred")
 var actual_crystal: Dictionary=state.read_current_p()._crystalStats
 check(absf(float(actual_crystal.get("atk",0))-0.8)<0.000001 and absf(float(actual_crystal.get("hp",0))-1.6)<0.000001,"exact q10 crystal effects through PC State readback")
 check(main.player.max_hp>before_max_hp,"existing PC HP parameter writer readback, no Mac writer")
 transact("upgrade",{"slot":"weapon","item":weapon,"socket_index":0,"q":85})
 check(weapon.socketQ[0]==85,"socket quality actual writer")
 transact("detach",{"slot":"weapon","item":weapon,"socket_index":0})
 check(weapon.crystals[0]==null and is_same(gems.back(),attach.gem),"detach preserves actual identity")
 transact("gem_enhance",gem_args(0))
 check(gems[0].enh==1,"gem enhancement no quality rewrite")
 transact("gem_fuse",gem_args(0))
 check(gems.back().star==1 and gems.back().enh==0,"synthesis rises star and resets enhancement")
 transact("gem_decompose",gem_args(gems.size()-1))
 check(state.read_native_workshop_dust()==100,"actual dust owner receives source star yield")
 transact("gem_craft",{"id":"cr_last_breath","star":0})
 check(state.read_native_workshop_dust()==50,"dust debit once")
 transact("gem_buy",{"id":"cr_last_breath"})
 check(not main.request_native_workshop("gem_buy",{"id":"cr_blood_oath"}).applied,"noncraft relic hidden/guarded")
 for q in [20,40,60].slice(0,5-weapon.crystals.size()):transact("unseal",{"slot":"weapon","item":weapon,"q":q})
 var mats: Variant=g.mats
 check(not main.request_native_workshop("unseal",{"slot":"weapon","item":weapon,"q":100}).applied and weapon.crystals.size()==5 and g.mats==mats,"max five; rejection no debit")
 check(not main.request_native_workshop("upgrade",{"slot":"weapon","item":weapon,"socket_index":0,"q":10}).applied,"non-improving stone rejected")
 # Actual shared RNG and full source generator. Occupied slot uses existing State pickup while paused.
 for slot in ["weapon","ring","headband","armor"]:
  var result: Dictionary=transact("equipment_craft",{"slot":slot})
  if result.applied:
   check(inv.bag.has(result.created),"occupied craft enters actual bag")
   for af in result.created.get("affixes",[]):check(not Drop.DEMO_BANNED.has(af.id),"demo banned affix absent")
 # Source G51167/G51178: full bag does not refund crafting payment or RNG.
 var saved_bag: Array=inv.bag.duplicate();inv.bag.clear()
 for y in range(60):
  for x in range(5):inv.bag.append({"slot":"weapon","_gx":x*2,"_gy":y*2})
 var full_mats: Variant=g.mats
 var full: Dictionary=transact("equipment_craft",{"slot":"weapon"})
 check(full.applied and full.get("pickup",{}).get("reason")=="bag_full" and inv.bag.size()==300 and not inv.bag.has(full.get("created")) and g.mats==full_mats-100000,"source full-bag craft still pays; actual pickup rejects delivery, no refund")
 inv.bag.clear();inv.bag.append_array(saved_bag)
 # Replace a source item through accepted22r before testing reroll.
 var crafted: Dictionary=inv.bag[0]
 check(main.request_native_equip_item(crafted,"weapon").applied,"22r actual equip reuse")
 weapon=inv.equipped.weapon
 var held_crystals: Variant=weapon.crystals
 var preserved: Dictionary=weapon.duplicate(true);preserved.erase("affixes")
 var reroll_before: Dictionary=weapon.duplicate(true)
 var reroll_rng: int=main.world.get_native_runtime_snapshot().random_draw_count
 var reroll_mats: Variant=g.mats
 var held: Dictionary=main.request_native_workshop("reroll",{"slot":"weapon","item":weapon})
 check(not held.applied and held.reason=="NOT_READY:PC_recalc_st_before_apply_stats" and weapon==reroll_before and g.mats==reroll_mats and main.world.get_native_runtime_snapshot().random_draw_count==reroll_rng,"reroll HOLD before payment or RNG; no substitute resource writer")
 var after: Dictionary=weapon.duplicate(true);after.erase("affixes")
 check(after==preserved and is_same(weapon.crystals,held_crystals),"reroll changes only affixes; socket identity preserved")
 g.mats=99
 var draws: int=main.world.get_native_runtime_snapshot().random_draw_count
 check(not main.request_native_workshop("reroll",{"slot":"weapon","item":weapon}).applied and g.mats==99 and main.world.get_native_runtime_snapshot().random_draw_count==draws,"insufficient price consumes no RNG")
 g.mats=1000
 check(not main.request_native_workshop("equipment_craft",{"slot":"ossuary"}).applied,"ossuary crafting hidden by original list")
 check(not state.apply_native_workshop(root,"gem_buy",{"id":"cr_last_breath"}).applied,"foreign State caller rejected")
 var actual_stage: Variant=g.stage;g.stage=1
 check(not main.request_native_workshop("gem_buy",{"id":"cr_last_breath"}).applied,"later stage not silently crafted with tier0")
 g.stage=actual_stage
 var old_refresh: Variant=main.source_runtime_stat_refresh
 var bad=RejectRefresh.new();main.source_runtime_stat_refresh=bad
 main.source_forge.select_slot("weapon")
 var old_affixes: Variant=weapon.affixes;var old_item: Dictionary=weapon.duplicate(true);mats=g.mats
 var failed: Dictionary=main.request_native_workshop("attach",{"slot":"weapon","item":weapon,"socket_index":0,"gem_index":0,"gem":gems[0]})
 main.source_runtime_stat_refresh=old_refresh
 check(not failed.applied and failed.get("memory_restored",false) and weapon==old_item and is_same(weapon.affixes,old_affixes) and g.mats==mats,"injected PC refresh failure restores references and payment")
 check(not bad.nested.applied and not bad.forge.get("paid",false) and not bad.pickup.applied and not bad.workshop_pickup.applied,"equipment/workshop/forge/pickup lock blocks callback reentry")
 check(main.player.hp<=original_hp,"no Mac HP/refill writer")
 var empty: Variant=inv.equipped.bow;inv.equipped.bow=null
 var empty_mats: Variant=g.mats;draws=main.world.get_native_runtime_snapshot().random_draw_count
 var empty_result: Dictionary=main.request_native_workshop("equipment_craft",{"slot":"bow"})
 check(not empty_result.applied and empty_result.reason=="NOT_READY:PC_recalc_st_before_apply_stats" and inv.equipped.bow==null and g.mats==empty_mats and main.world.get_native_runtime_snapshot().random_draw_count==draws,"empty-slot craft HOLD before debit and RNG")
 inv.equipped.bow=empty
 var file: String=OS.get_user_data_dir().path_join("workshop-cases.json")
 var output: String=OS.get_user_data_dir().path_join("workshop-original.json")
 var handle=FileAccess.open(file,FileAccess.WRITE);handle.store_string(JSON.stringify(cases));handle.close()
 var chunks: Array=[]
 var exit: int=OS.execute(argument("--node-bin"),PackedStringArray([ProjectSettings.globalize_path("res://tests/build_demo11_29_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--cases-file="+file,"--output="+output]),chunks,true)
 check(exit==0,"original JS UTF8 file oracle: "+"".join(chunks).left(300))
 var oracle: Variant=JSON.parse_string(FileAccess.get_file_as_string(output)) if exit==0 else null
 check(oracle is Dictionary and oracle.get("failures",-1)==0 and oracle.cases==cases.size(),"original JS full mutation/RNG comparison")
 paused=false
 for child in main.find_children("*","AudioStreamPlayer",true,false):child.stop()
 main.queue_free();main=null;await process_frame;await create_timer(.15).timeout
 print("DEMO29_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":cases.size(),"oracle":oracle,"explicit_wallet_material_fixture":true,"skipped":[]}))
 quit(1 if failures else 0)
