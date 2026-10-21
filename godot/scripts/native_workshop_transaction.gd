extends RefCounted
## DEMO11-29. Event-only transaction over actual State INV/bags/wallet.
const Drop=preload("res://port_modules/kill_reward/drop_item_source.gd")
const Policy=preload("res://scripts/native_meta_enhancement_policy.gd")
const Quality=preload("res://port_modules/item_quality_source/producer.gd")
const DUST=[50,200,500,1500,5000] # G15380
const STAR_COST=[1.0,1.5,2.5,4.0,7.0] # G15285
const CRAFT_SLOTS=["weapon","bow","armor","shield","helmet","pants","gloves","boots","belt","necklace","ring","cape","bracelet","headband"] # G51085; ossuary absent
## PCI-12 owns G50836/G51176 recalcSt before applyStats.
## No substitute equipment_refresh or restore-only sink is used.
static func craft_target(inv: Dictionary,slot: String) -> String:
 if slot=="ring":return "ring1" if inv.equipped.get("ring1")==null else ("ring2" if inv.equipped.get("ring2")==null else "ring1")
 if slot=="headband":return "headband" if inv.equipped.get("headband")==null else ("headband2" if inv.equipped.get("headband2")==null else "headband")
 return slot
static func requires_recalc_st(op: String,inv: Dictionary,slot: String) -> bool:
 return op=="reroll" or (op=="equipment_craft" and inv.equipped.get(craft_target(inv,slot))==null)
var _main: WeakRef
var _state: WeakRef
var _draws: Array=[]
func configure(main: Node,state: Node) -> void:
 _main=weakref(main);_state=weakref(state)
func is_bound_to(main: Node,state: Node) -> bool:
 return _main!=null and _state!=null and _main.get_ref()==main and _state.get_ref()==state
static func reject(reason: String) -> Dictionary:return {"applied":false,"reason":reason}
func _remember(list: Array,value: Variant) -> void:
 if not (value is Dictionary or value is Array):return
 for row in list:
  if is_same(row.ref,value):return
 list.append({"ref":value,"values":value.duplicate()})
 for child in (value.values() if value is Dictionary else value):_remember(list,child)
func _restore(list: Array) -> void:
 for row in list:
  row.ref.clear()
  if row.ref is Dictionary:row.ref.merge(row.values)
  else:row.ref.append_array(row.values)
func _random(_tag: String="") -> float:
 var value: float=_main.get_ref().world.sample_native_random_unit()
 _draws.append(value)
 return value
func execute(op: String,a: Dictionary,inv: Dictionary,g: Dictionary,gems: Array,stones: Array,dust: int) -> Dictionary:
 _draws.clear()
 var main: Node=_main.get_ref();var state: Node=_state.get_ref()
 if int(g.get("stage",-1))!=0:return reject("outside_demo11_stage")
 var defs: Dictionary=Drop.load_tables().CRYSTAL_DEFS
 var item: Variant=a.get("item")
 var slot: String=str(a.get("slot",""))
 if op in ["attach","detach","unseal","upgrade","reroll"]:
  if not item is Dictionary or not inv.equipped.get(slot) is Dictionary or not is_same(item,inv.equipped[slot]):return reject("stale_equipment")
 var needs_recalc: bool=requires_recalc_st(op,inv,slot)
 var gi: int=int(a.get("gem_index",-1));var si: int=int(a.get("socket_index",-1))
 var gem: Variant=gems[gi] if gi>=0 and gi<gems.size() else null
 if gem is Dictionary and (not gem.get("star") is float and not gem.get("star") is int or int(gem.get("star",-1)) not in range(5)):return reject("gem_shape")
 if op in ["gem_enhance","gem_fuse","gem_decompose","attach"]:
  if not gem is Dictionary or not defs.has(gem.get("id")) or not is_same(gem,a.get("gem")):return reject("stale_gem")
 var cost:=0;var feed: Array=[];var needs_refresh:=false
 var stone_index: int=-1
 if op in ["unseal","upgrade"]:
  for i in stones.size():
   if stones[i] is Dictionary and stones[i].get("q")==a.get("q"):stone_index=i;break
  if stone_index<0:return reject("stale_stone")
  if op=="unseal" and item.get("crystals",[]).size()>=5:return reject("socket_max")
  if op=="upgrade" and (si<0 or si>=item.get("crystals",[]).size() or float(item.get("socketQ",[])[si] if si<item.get("socketQ",[]).size() else 1)>=float(a.q)):return reject("socket_quality")
 elif op=="attach":
  if si<0 or si>=item.get("crystals",[]).size() or item.crystals[si]!=null:return reject("socket_not_empty")
  if defs[gem.id].has("slots") and not defs[gem.id].slots.has(item.slot):return reject("gem_slot")
 elif op=="detach":
  if si<0 or si>=item.get("crystals",[]).size() or item.crystals[si]==null or gems.size()>=9999:return reject("detach_unavailable")
 elif op in ["gem_enhance","gem_fuse"]:
  for i in gems.size():
   if gems[i].id==gem.id and gems[i].star==gem.star:feed.append(i)
  if op=="gem_fuse" and (gem.star>=4 or feed.size()<3):return reject("fuse_materials")
  if op=="gem_enhance":
   if int(gem.get("enh",0))>=20 or feed.size()<2:return reject("enhance_materials")
   cost=Policy.malice_cost(ceil(500.0*(1.0+float(gem.get("enh",0))*0.5)*STAR_COST[int(gem.star)]))
 elif op in ["gem_craft","gem_buy"]:
  if not defs.has(a.get("id")) or gems.size()>=9999:return reject("gem_craft_unavailable")
  if op=="gem_buy":
   if not defs[a.id].get("craft",false):return reject("gem_not_malice_craftable")
   cost=Policy.malice_cost(50)
  elif int(a.get("star",-1)) not in range(5) or dust<DUST[int(a.star)]:return reject("insufficient_dust")
 elif op=="reroll":
  if int(item.get("rarity",0))<1:return reject("reroll_rarity")
  cost=Policy.malice_cost(200) # G50458, not old trace100 literal
 elif op=="equipment_craft":
  if not CRAFT_SLOTS.has(slot):return reject("craft_slot_hidden")
  cost=Policy.malice_cost(200000)
 elif op!="gem_decompose":return reject("unknown_operation")
 if float(g.get("mats",0))<cost:return reject("insufficient_malice")
 var journal: Array=[]
 for value in [inv,gems,stones]:_remember(journal,value)
 var mats: Variant=g.mats
 var cache: Dictionary=main.capture_native_equipment_caches(main.source_equipment)
 if cache.is_empty():return reject("cache_not_ready")
 var generator=Drop.new(_random);generator.demo_mode=main.read_native_demo_policy().get("demo",false)==true
 var result: Dictionary={"applied":true,"operation":op,"cost":cost,"dust":dust}
 var failure: String=""
 match op:
  "unseal","upgrade":
   if not item.get("crystals") is Array:item.crystals=[]
   if not item.get("socketQ") is Array:item.socketQ=Array();item.socketQ.resize(item.crystals.size());item.socketQ.fill(1)
   stones.remove_at(stone_index)
   if op=="unseal":item.crystals.append(null);item.socketQ.append(a.q);item.socketCount=item.crystals.size()
   else:
    if si>=item.socketQ.size():item.socketQ.resize(si+1)
    item.socketQ[si]=a.q;needs_refresh=true
  "attach":item.crystals[si]=gem;gems.remove_at(gi);needs_refresh=true
  "detach":gems.append(item.crystals[si]);item.crystals[si]=null;needs_refresh=true
  "gem_enhance":
   g.mats-=cost
   for i in feed:
    if i!=gi:gems.remove_at(i);break
   gem.enh=int(gem.get("enh",0))+1;needs_refresh=true
  "gem_fuse":
   var inputs: Array=[]
   for i in feed.slice(0,3):inputs.append(gems[i])
   var q: Dictionary=Quality.new().fused_quality(inputs)
   if q.get("status")!="READY":failure="quality_not_ready"
   else:
    var indices: Array=feed.slice(0,3);indices.reverse()
    for i in indices:gems.remove_at(i)
    gems.append({"id":gem.id,"star":int(gem.star)+1,"enh":0,"q":q.q});needs_refresh=true
  "gem_decompose":gems.remove_at(gi);result.dust+=int(DUST[int(gem.star)]*0.5)
  "gem_craft","gem_buy":
   if op=="gem_buy":g.mats-=cost
   else:result.dust-=DUST[int(a.star)]
   var made: Dictionary={"id":a.id,"star":0 if op=="gem_buy" else int(a.star),"enh":0,"q":1+int(_random()*100.0)}
   gems.append(made);result.created=made
  "reroll":
   g.mats-=cost
   item.affixes=generator.roll_affixes(int(item.rarity),str(item.slot),null,int(state.read_current_p().lv));needs_refresh=true
  "equipment_craft":
   g.mats-=cost # G51167 before element, rarity, type and mkItem RNG
   var element: int=int(_random()*6.0);var rarity: int=3 if _random()<0.9 else 4
   if slot=="ring":slot="ring1" if inv.equipped.get("ring1")==null else ("ring2" if inv.equipped.get("ring2")==null else "ring1")
   if slot=="headband":slot="headband" if inv.equipped.get("headband")==null else ("headband2" if inv.equipped.get("headband2")==null else "headband")
   var wt: Variant=null
   if slot in ["weapon","bow"]:
    var keys: Array=Drop.load_tables()["WTYPES" if slot=="weapon" else "BOWTYPES"].keys();wt=keys[int(_random()*keys.size())]
   var made: Variant=generator.mk_item(slot,0,element,rarity,wt,int(state.read_current_p().lv))
   if not made is Dictionary or generator.aborted:failure="source_generator_rejected"
   elif inv.equipped.get(slot)==null:inv.equipped[slot]=made;needs_refresh=true;result.created=made
   else:
    var pickup: Dictionary=state.apply_native_workshop_pickup(main,self,made)
    if not pickup.get("applied",false) and pickup.get("reason")!="bag_full":failure="pickup_owner_not_ready"
    else:
     result.created=made;result.pickup=pickup # G51178 ignores pickupItem false: price/RNG remain spent even when full.
 if generator.aborted:failure="source_rng_rejected"
 if failure.is_empty() and needs_refresh:
  if needs_recalc:
   var recalc: Dictionary=main.request_native_recalc_st(main,{"reason":"workshop:"+op})
   result.recalc_st=recalc
   if not recalc.get("committed",false):failure="recalc_st_rejected"
 if failure.is_empty() and needs_refresh:
  var refresh: Dictionary=main.request_native_runtime_stat_refresh("apply_stats","workshop:"+op)
  result.refresh=refresh
  if not refresh.get("committed",false):failure="refresh_rejected"
 if not failure.is_empty():
  _restore(journal);g.mats=mats;main.restore_native_equipment_caches(main.source_equipment,cache)
  return {"applied":false,"reason":failure,"memory_restored":true,"rng_rewound":false,"rng_draws":_draws.duplicate()}
 result.rng_draws=_draws.duplicate()
 result.remaining=g.mats
 return result
