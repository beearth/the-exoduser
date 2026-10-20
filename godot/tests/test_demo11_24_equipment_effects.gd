extends SceneTree
const USERDIR="EXODUSER-demo11-24-Isolated-20261021"
const Effects=preload("res://scripts/native_equipment_effect_consumption.gd")
const Drop=preload("res://port_modules/kill_reward/drop_item_source.gd")
const FIELDS=["hp","mhp","st","mst","mp","mmp","shield","mshield","hpR","stR","mpR","speed","_oocSpeed","baseDef","baseAtk","maxPoise","poise","poiseR","_effStats","_crystalStats"]
var checks:=0
var failures:=0
var main: Node
var state: Node
var cases: Array=[]
var observations: Array=[]
var rng:=RandomNumberGenerator.new()
func _initialize(): rng.seed=2026102124; call_deferred("_run")
func check(ok: bool,label: String):
	checks+=1
	if not ok: failures+=1; printerr("DEMO11_24_FAIL ",label)
func capture(id: String) -> Dictionary:
	var signed: Variant=main.source_initialization_services.read_native_signed_difficulty()
	var diff: float=float(signed.get("value",0)) if signed is Dictionary else float(signed)
	var raw: Variant=main.source_providers.get_provider_bundle().raw_grit
	return {"name":id,"mode":"equipment_refresh","P":state.read_current_p().duplicate(true),"G":state.read_current_g().duplicate(true),"STATS":state.read_current_stats().duplicate(true),"PASSIVES":state.read_current_passives().duplicate(true),"INV":{"equipped":state.read_current_inventory().equipped.duplicate(true)},"grit":raw.read_raw().get("raw"),"diff":diff+5}
func _run():
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolated namespace")
	if failures: quit(2); return
	main=load("res://scenes/main.tscn").instantiate(); root.add_child(main)
	for i in 8: await physics_frame
	paused=true; state=main.source_state
	var inv: Dictionary=state.read_current_inventory()
	var tables: Dictionary=Drop.load_tables()
	var factory=Drop.new(func(_tag: String): return rng.randf())
	var world_rng: int=main.world.get_native_runtime_snapshot().random_draw_count
	var count:=0
	for row in Effects.routes().values():
		if row.route!="equipment_refresh":continue
		count+=1
		var definition: Dictionary={}
		for a in tables.AFFIX_POOL:
			if a.id==row.id: definition=a; break
		check(not definition.is_empty(),"existing source table id "+row.id)
		var item: Dictionary=factory.mk_item(row.slots[0],0,0,0,null,1)
		item.affixes=[{"id":row.id,"tier":0,"value":definition.tiers[0]}]
		# Explicit eligible one-id fixture. No natural drop frequency claim.
		for slot in inv.equipped: inv.equipped[slot]=null
		inv.bag.clear(); inv.bag.append(item)
		var intended: Array=item.affixes
		item.affixes=[]
		var baseline: Dictionary=main.request_native_equip_item(item)
		check(baseline.get("applied",false),"same item without affix baseline "+row.id)
		var baseline_p: Dictionary=state.read_current_p().duplicate(true)
		check(main.request_native_unequip_item(item.slot).get("applied",false),"baseline unequip "+row.id)
		item.affixes=intended
		# Conditional source speed branch is exercised with existing P inputs only.
		state.get("_p")["_okSpdBuff"]=0
		main.player.hp=1
		# Capture ORIGINAL source input after transaction moved item, before its PC refresh.
		# Using the same item in the oracle equipped dictionary reproduces that boundary.
		var c: Dictionary=capture(row.id); c.INV.equipped[item.slot]=item.duplicate(true)
		cases.append(c)
		var r: Dictionary=main.request_native_equip_item(item)
		check(r.get("applied",false),"one-id actual transaction "+row.id+str(r.get("reason")))
		check(r.get("refresh",{}).get("committed",false),"PC equipment_refresh "+row.id)
		var effect: Dictionary=r.get("effects",{}).get("ids",{}).get(row.id,{})
		check(effect.get("status")=="READY" and effect.get("value")==definition.tiers[0],"id consumer receipt "+row.id)
		check(r.get("effects",{}).get("extra_refresh_calls")==0,"no second refresh "+row.id)
		observations.append(r.get("refresh",{}).get("after",{}))
		var changed:=false
		for field in FIELDS:
			if field in ["hp","mp","st","shield","poise"]:continue
			if baseline_p.get(field)!=r.get("refresh",{}).get("after",{}).get(field):changed=true
		check(changed,"one-id affix changes actual P readback "+row.id)
		var cache: Dictionary=main.source_providers.get_provider_bundle().affix.capture_affix_cache_token()
		Effects.observe(main,inv,r.refresh)
		check(is_same(cache.cache,main.source_providers.get_provider_bundle().affix.capture_affix_cache_token().cache),"observer preserves cache identity "+row.id)
		var u: Dictionary=main.request_native_unequip_item(item.slot)
		check(u.get("applied",false),"unequip uses same accepted refresh "+row.id)
	check(count==18,"all source applyStats candidate IDs covered")
	var damage_count:=0
	for row in Effects.routes().values():
		if row.route!="hurtE":continue
		damage_count+=1
		check(row.source_line>0,"PC request evidence "+row.id)
		if damage_count==1:
			var item: Dictionary=factory.mk_item(row.slots[0],0,0,0,null,1)
			item.affixes=[{"id":row.id,"value":1}]
			inv.bag.clear();inv.bag.append(item)
			var r: Dictionary=main.request_native_equip_item(item)
			check(r.get("applied",false) and r.get("effects",{}).get("ids",{}).get(row.id,{}).get("status")=="NOT_READY","protected damage ID remains NOT_READY after real equip")
	check(damage_count==72,"all direct hurtE requests counted")
	check(Effects.observe(main,inv,{"committed":false}).status=="NOT_READY","failed refresh never marked consumed")
	check(main.world.get_native_runtime_snapshot().random_draw_count==world_rng,"no shared World RNG")
	var node: String=""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):node=arg.trim_prefix("--node-bin=")
	check(not node.is_empty(),"explicit node-bin")
	var input:=OS.get_user_data_dir().path_join("effect-cases.json")
	var output:=OS.get_user_data_dir().path_join("effect-oracle.json")
	var f:=FileAccess.open(input,FileAccess.WRITE);f.store_string(JSON.stringify(cases,"",true,true));f.close()
	var observed:=OS.get_user_data_dir().path_join("effect-observations.json")
	f=FileAccess.open(observed,FileAccess.WRITE);f.store_string(JSON.stringify(observations,"",true,true));f.close()
	var text: Array=[]
	var code:=OS.execute(node,PackedStringArray([ProjectSettings.globalize_path("res://tests/compare_demo11_24_effects.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--cases-file="+input,"--out-file="+output,"--observations-file="+observed]),text,true)
	check(code==0,"existing original-function oracle "+"".join(text))
	if code==0:
		var packet: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(output))
		check(packet.rows.size()==observations.size(),"oracle rows")
		for i in observations.size():
			check(packet.rows[i].error==null,"original source no throw "+cases[i].name)
			for field in packet.comparisons[i].fields:check(field.equal,"exact JS Number readback "+cases[i].name+":"+field.field+" "+str(field))
	paused=false; root.remove_child(main); main.free();main=null
	await process_frame;await process_frame
	print("DEMO11_24_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"ids":count,"actual_Main":true,"combat_execution":false,"fixture_items":true}))
	quit(0 if failures==0 else 1)
