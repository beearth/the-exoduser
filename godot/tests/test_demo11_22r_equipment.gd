extends SceneTree
const USERDIR = "EXODUSER-demo11-22r-Isolated-20261021"
const Drop = preload("res://port_modules/kill_reward/drop_item_source.gd")
const Layout = preload("res://scripts/native_inventory_layout.gd")
const Slots = preload("res://scripts/native_inventory_contract.gd")
var checks := 0
var failures := 0
var main: Node
var state: Node
var inv: Dictionary
var g: Dictionary
var cases: Array=[]
var observations: Array=[]
var reentries: Array=[]
var fixture_rng := RandomNumberGenerator.new()
var generator=Drop.new(func(_tag: String): return fixture_rng.randf())
func _initialize() -> void:
	fixture_rng.seed=2026102122
	call_deferred("_run")
func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok: failures+=1; printerr("DEMO11_22R_FAIL ",label)
func same(a: Variant,b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float): return a==b
	if typeof(a)!=typeof(b): return false
	if a is Dictionary:
		if a.size()!=b.size(): return false
		for k in a:
			if not b.has(k) or not same(a[k],b[k]): return false
		return true
	if a is Array:
		if a.size()!=b.size(): return false
		for i in a.size():
			if not same(a[i],b[i]): return false
		return true
	return a==b
func item_for(slot: String) -> Dictionary:
	var item: Variant=generator.mk_item(slot,0,0,0,"sword" if slot=="weapon" else ("crossbow" if slot=="bow" else null),1)
	check(item is Dictionary and not generator.aborted,"production mkItem "+slot)
	return item if item is Dictionary else {}
func append(item: Dictionary) -> void:
	var size: Array=Layout.source_item_size(item)
	var pos: Variant=Layout.find_space(inv.bag,size[0],size[1],-1,item,300)
	check(pos!=null,"fixture source layout space")
	if pos!=null: item._gx=pos.x; item._gy=pos.y
	inv.bag.append(item)
func capture(op: String,item: Dictionary={},slot: String="") -> int:
	var index := -1
	for i in inv.bag.size():
		if is_same(inv.bag[i],item): index=i; break
	cases.append({"op":op,"index":index,"target":slot if op=="equip" else "","slot":slot,"inv":inv.duplicate(true),"mats":g.mats,"p":state.read_current_p().duplicate(true),"gems":state.read_native_reward_bags().crystal.duplicate(true)})
	return cases.size()-1
func observe(refresh_calls: int=1) -> void:
	observations.append({"refresh_calls":refresh_calls,"inv":inv.duplicate(true),"mats":g.mats,"gems":state.read_native_reward_bags().crystal.duplicate(true)})
func _run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolated namespace")
	if failures: quit(2); return
	main=load("res://scenes/main.tscn").instantiate(); root.add_child(main)
	for i in 8: await physics_frame
	paused=true
	state=main.source_state; inv=state.read_current_inventory(); g=state.read_current_g()
	check(state.is_native_new_run_state_ready(),"actual Main State current")
	var world_draws: int=main.world.get_native_runtime_snapshot().random_draw_count
	# Explicit fixture bag setup, not claimed as natural pickup or combat.
	inv.bag.clear()
	var contract=Slots.new(); check(contract.bind_source_state(state),"TI00 binds actual State")
	check(contract.source_slot_names().size()==17,"canonical17 source slots")
	for slot in contract.source_slot_names():
		var item:=item_for(slot); append(item)
		var bag: Array=inv.bag
		var original_inv: Dictionary=inv
		capture("equip",item,slot)
		var r: Dictionary=main.request_native_equip_item(item,slot)
		observe()
		check(r.get("applied",false),"G16293-16366 equip "+slot+" "+str(r.get("reason")))
		check(is_same(inv,original_inv) and is_same(inv.equipped[slot],item),"actual INV/slot item identity "+slot)
		check(not is_same(bag,inv.bag) and not inv.bag.any(func(v):return is_same(v,item)),"G16355 fresh bag array removes item identity "+slot)
		var receipt: Dictionary=r.get("refresh",{})
		check(receipt.get("committed",false) and receipt.get("mode")=="equipment_refresh" and receipt.get("cache_invalidations")==2,"one PC equipment pass "+slot)
		for field in {"hp":"mhp","mp":"mmp","st":"mst","shield":"mshield"}:
			var cap: Dictionary={"hp":"mhp","mp":"mmp","st":"mst","shield":"mshield"}
			check(receipt.has("after") and receipt.after[field]==min(receipt.before[field],receipt.after[cap[field]]),"G16291 min clamp "+slot+":"+field)
		capture("unequip",{},slot)
		r=main.request_native_unequip_item(slot); observe()
		check(r.get("applied",false) and inv.equipped[slot]==null and inv.bag.any(func(v):return is_same(v,item)),"G16367-16380 unequip identity "+slot)
	# Requirement and explicit target: denied call retains item's slot and same bag.
	var earring:=item_for("headband2"); append(earring); earring.reqLv=state.read_current_p().lv+1
	var before: Dictionary=inv.duplicate(true); var bag_ref: Array=inv.bag
	capture("equip",earring,"headband")
	var r: Dictionary=main.request_native_equip_item(earring,"headband"); observe(0)
	check(not r.get("applied",false) and same(inv,before) and is_same(inv.bag,bag_ref) and earring.slot=="headband2","reqLv fails before target/item/bag mutation")
	earring.reqLv=0
	capture("equip",earring,"headband")
	r=main.request_native_equip_item(earring,"headband"); observe()
	check(r.get("applied",false) and is_same(inv.equipped.headband,earring),"explicit earring target consumed for this call only")
	var earring2:=item_for("headband"); append(earring2)
	capture("equip",earring2)
	r=main.request_native_equip_item(earring2); observe()
	check(r.get("applied",false) and is_same(inv.equipped.headband2,earring2),"next auto earring selects second empty slot, no stale target")
	# Actual existing forge prefix now has an equip continuation; deterministic fixture enh1.
	var old:=item_for("weapon"); inv.equipped.weapon=old; old.enh=1
	var next:=item_for("weapon"); append(next)
	g.mats=499; before=inv.duplicate(true); capture("equip",next)
	r=main.request_native_equip_item(next); observe(0)
	check(not r.get("applied",false) and g.mats==499 and same(inv,before),"G16303-16319 cost500, mats499 blocks all mutation")
	g.mats=500; capture("equip",next)
	r=main.request_native_equip_item(next); observe()
	check(r.get("applied",false) and g.mats==0 and next.enh==1 and old.enh==0 and old.has("_enhRefund"),"forge prefix paid500 then actual equip/refresh, HOLD resolved")
	check(r.get("transfer",{}).get("continue_equip",false),"existing DEMO11-27 continuation receipt consumed")
	# Explicit stronger weapon fixture; existing attack reader, no damage execution.
	var stronger:=item_for("weapon"); stronger.atk=2000; append(stronger); g.mats=500
	capture("equip",stronger)
	var attack_result: Dictionary=main.request_native_equip_item(stronger); observe()
	check(attack_result.get("applied",false) and attack_result.attack_readback.basic_base_damage>attack_result.before_attack.basic_base_damage and attack_result.attack_readback.melee_ref>attack_result.before_attack.melee_ref,"existing real attack consumers change after equipment commit")
	# G16320-16345 real crystal identity: one socket, overflow to actual crystal bag.
	var old_shield:=item_for("shield")
	var gem_a={"id":"cr_blood_oath","star":1,"enh":0}
	var gem_b={"id":"cr_iron_vow","star":1,"enh":0}
	old_shield.crystals=[gem_a,gem_b]; old_shield.socketCount=2
	inv.equipped.shield=old_shield
	var new_shield:=item_for("shield"); new_shield.socketCount=1; new_shield.crystals=[null]; append(new_shield)
	var gems: Array=state.read_native_reward_bags().crystal
	gems.clear(); capture("equip",new_shield)
	var crystal_result: Dictionary=main.request_native_equip_item(new_shield); observe()
	check(crystal_result.get("applied",false) and is_same(new_shield.crystals[0],gem_a) and is_same(gems[0],gem_b) and old_shield.crystals==[null,null],"G16320-16345 socket and pouch preserve real crystal identities")
	# Actual attack/defense consumers: no damage execution or formula modification.
	check(r.get("attack_readback",{}).get("ready",false),"existing attack path reads equipped enhanced weapon")
	check(r.get("defense_readback")==main.player.base_def,"defense readback is actual actor field used by hurtP")
	var armor:=item_for("armor"); armor.affixes=[{"id":"defFlat","value":25}]; append(armor)
	r=main.request_native_equip_item(armor)
	check(r.get("applied",false) and main.player.base_def>=25,"G27942 defFlat refreshed into actual defense consumer")
	check(main.source_providers.get_provider_bundle().affix.eq_affix("defFlat").value==25,"affix cache observes new actual equipped item")
	# Early producer failure restores references, field presence, wallet and cache tokens.
	armor.enh=1; g.mats=500; armor.crystals=[gem_b]; armor.socketCount=1
	var failing:=item_for("armor"); failing.affixes=[null]; failing.socketCount=0; failing.crystals=[]; append(failing)
	var bundle: Dictionary=main.source_providers.get_provider_bundle()
	bundle.reference.melee_ref(); bundle.affix.eq_affix("defFlat")
	var ac: Dictionary=bundle.affix.capture_affix_cache_token(); var rc: Dictionary=bundle.reference.capture_eq_stat_cache_token(); var lc: Variant=main.get("_source_l_eq_cache")
	before=inv.duplicate(true); bag_ref=inv.bag
	var p_before: Dictionary=state.read_current_p().duplicate(true)
	var gems_before: Array=gems.duplicate(true); var crystal_ref: Array=armor.crystals
	r=main.request_native_equip_item(failing)
	check(not r.get("applied",false) and r.get("refresh",{}).has("status") and not r.get("refresh",{}).get("committed",false),"PC producer rejection surfaces as failed transaction")
	check(same(inv,before) and is_same(inv.bag,bag_ref) and same(state.read_current_p(),p_before),"runtime failure restores INV/value/reference and actor/resource P")
	check(is_same(ac.cache,bundle.affix.capture_affix_cache_token().cache) and is_same(rc.cache,bundle.reference.capture_eq_stat_cache_token().cache) and is_same(lc,main.get("_source_l_eq_cache")),"three caches restore original identity, not a neutral rebuild")
	check(g.mats==500 and same(gems,gems_before) and is_same(armor.crystals,crystal_ref) and is_same(armor.crystals[0],gem_b) and armor.enh==1,"failed PC refresh rolls back paid forge prefix and crystal/container identity")
	failing.affixes=[]
	# Synchronous signal reentry cannot interleave another bag transaction.
	main.source_runtime_stat_refresh.native_runtime_stats_refreshed.connect(func(_receipt): reentries.append(main.request_native_unequip_item("weapon")))
	r=main.request_native_equip_item(failing)
	check(r.get("applied",false) and reentries.size()==1 and not reentries[0].get("applied",false),"equipment State lock covers PC post-commit signal reentry")
	var foreign:=Node.new(); before=inv.duplicate(true)
	check(not state.apply_native_equipment_transaction(foreign,"unequip",{},"weapon").get("applied",false) and same(inv,before),"foreign State writer rejected")
	foreign.free()
	# Full equipment grid cannot unequip; categories still have independent grids.
	inv.bag.clear()
	for y in range(0,120,2):
		for x in range(0,10,2): inv.bag.append({"slot":"helmet","_gx":x,"_gy":y})
	# Explicit null coordinates: source grid must not overwrite occupied cells with skip item.
	inv.equipped.weapon._gx=null; inv.equipped.weapon._gy=null
	before=inv.duplicate(true); bag_ref=inv.bag
	capture("unequip",{},"weapon")
	r=main.request_native_unequip_item("weapon"); observe(0)
	check(not r.get("applied",false) and same(inv,before) and is_same(inv.bag,bag_ref),"G16373 full 10x120 grid rolls back unequip push")
	inv.equipped.ossuary=item_for("ossuary")
	r=main.request_native_unequip_item("ossuary")
	check(r.get("applied",false) and inv.bag.size()==301,"independent ossuary grid, no invented bag-length hard cap300")
	check(main.world.get_native_runtime_snapshot().random_draw_count==world_draws,"equipment uses no World/shared RNG")
	_run_oracle()
	paused=false; root.remove_child(main); main.free(); main=null
	await create_timer(.25,true,false,true).timeout
	await process_frame
	print("DEMO11_22R_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"oracle_cases":cases.size(),"actual_Main":true,"fixture_items":true,"combat_execution":false,"save_io":false}))
	quit(0 if failures==0 else 1)
func _run_oracle() -> void:
	var node_bin: String=""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
	check(not node_bin.is_empty(),"explicit node-bin")
	if node_bin.is_empty(): return
	var input:=OS.get_user_data_dir().path_join("equipment-cases.json")
	var output:=OS.get_user_data_dir().path_join("equipment-oracle.json")
	var file:=FileAccess.open(input,FileAccess.WRITE); file.store_string(JSON.stringify(cases,"",true,true)); file.close()
	var actual:=OS.get_user_data_dir().path_join("equipment-observations.json")
	var diagnostics_file:=FileAccess.open(actual,FileAccess.WRITE)
	diagnostics_file.store_string(JSON.stringify(observations,"",true,true)); diagnostics_file.close()
	var diagnostics: Array=[]
	var exit_code:=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/build_demo11_22r_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--cases-file="+input,"--observations-file="+actual,"--out-file="+output]),diagnostics,true)
	check(exit_code==0,"source mutation oracle "+"".join(diagnostics))
	if exit_code!=0: return
	var packet: Variant=JSON.parse_string(FileAccess.get_file_as_string(output))
	check(packet is Dictionary and packet.rows.size()==observations.size(),"oracle rows complete")
	if not packet is Dictionary: return
	for i in observations.size():
		check(packet.rows[i].error==null,"G16272-16380 source no throw #"+str(i))
		for field in ["inv","mats","gems","refresh_calls"]:
			check(packet.comparisons[i][field].equal,"G16272-16380 exact JS Number/shape match #"+str(i)+":"+field+" "+str(packet.comparisons[i][field].mismatch))
