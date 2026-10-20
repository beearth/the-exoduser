extends SceneTree
const USERDIR="EXODUSER-demo11-24b-Isolated-20261021"
const Cache=preload("res://scripts/native_system_equipment_affixes.gd")
const Drop=preload("res://port_modules/kill_reward/drop_item_source.gd")
const Hurt=preload("res://scripts/native_normal_enemy_hurte.gd")
var checks:=0
var failures:=0
var main: Node
var state: Node
var cases: Array=[]
var id_results: Array=[]
var rng:=RandomNumberGenerator.new()
func _initialize():rng.seed=2026102124;call_deferred("_run")
func check(ok: bool,label: String):
	checks+=1
	if not ok:failures+=1;printerr("DEMO11_24B_FAIL ",label)
func capture(id: String,kind: String,actual: Variant) -> Dictionary:
	return {"id":id,"kind":kind,"actual":actual,"P":state.read_current_p().duplicate(true),"G":state.read_current_g().duplicate(true),"STATS":state.read_current_stats().duplicate(true),"PASSIVES":state.read_current_passives().duplicate(true),"INV":state.read_current_inventory().duplicate(true),"potion_level":state.read_native_potion_runtime().level}
func _run():
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolation")
	if failures:quit(2);return
	main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
	for i in 12:await physics_frame
	main.source_intro_sequence.finish_native_guide()
	await create_timer(1.9).timeout
	var flow: Node=main.source_intro_sequence.lesson_flow
	check(is_instance_valid(flow) and flow.active,"production intro owns the real clock")
	if is_instance_valid(flow):flow.skip_all()
	for i in 3:await physics_frame
	# Declared interference-control fixture, not a natural encounter claim.
	for e in main.world.get_enemies():
		if is_instance_valid(e):e.global_position=Vector2(-5000,-5000)
	paused=true;state=main.source_state
	var inv: Dictionary=state.read_current_inventory()
	var factory=Drop.new(func(_tag):return rng.randf())
	var tables: Dictionary=Drop.load_tables()
	var system: RefCounted=main.source_system_affixes
	check(main.source_regeneration.get_snapshot().intro_identity_adoptions==1,"real intro/lesson ens handoff exactly once")
	check(system.get_snapshot().ready,"actual boot cache warmed")
	for id in Cache.IDS:
		var before_failures:=failures
		var def: Dictionary={}
		for a in tables.AFFIX_POOL:
			if a.id==id:def=a;break
		check(not def.is_empty(),"source definition "+id)
		var slot: String="boots"
		var route: Dictionary=preload("res://scripts/native_equipment_effect_consumption.gd").routes()[id]
		slot=route.slots[0]
		var item: Dictionary=factory.mk_item(slot,0,0,0,null,1)
		item.affixes=[{"id":id,"value":def.tiers[0],"tier":0}]
		for key in inv.equipped:inv.equipped[key]=null
		inv.bag.clear();inv.bag.append(item)
		var cache_before: Dictionary=system.get_snapshot()
		var r: Dictionary=main.request_native_equip_item(item)
		check(r.get("applied",false),"actual equip "+id+str(r.get("reason")))
		check(system.get_snapshot().rebuilds==cache_before.rebuilds+1,"one event cache rebuild "+id)
		check(main.read_native_system_equipment_affix(id).get("value")==def.tiers[0],"cached value "+id)
		var source_queries: int=system.get_snapshot().source_queries
		for i in 100:main.read_native_system_equipment_affix(id)
		check(system.get_snapshot().source_queries==source_queries,"100 reads never query source "+id)
		var context: Dictionary=main.read_native_skill_dispatch_cost_context()
		var adapter: Node=main.world.get_node("NativeSkillSlots")
		if id in ["cooldownRed","helmCooldown","endCooldownAll","skillCdRed"]:
			cases.append(capture(id,"cd",context.cd_red))
			state.read_current_g().mats=1000
			state.get("_p").skills.spikeTrap=1;adapter.gc_cd=0.0
			var q: Dictionary=adapter._skill_quote("spikeTrap",1,state.read_current_p())
			paused=false;adapter.cast_spike_trap();paused=true
			check(adapter.gc_cd==q.cd and state.read_current_g().mats==995,"actual trap cooldown/material writer "+id)
		elif id in ["mpCostRed","stCostRed"]:
			var magic: bool=id=="mpCostRed"
			cases.append(capture(id,"magic" if magic else "st",context.magic_cost if magic else context.st_discount))
			state.read_current_g().mats=1000
			var q: Dictionary=adapter._skill_quote("iceOrb" if magic else "giantSlam",1,state.read_current_p())
			var before: Dictionary=state.read_current_p().duplicate(true)
			paused=false
			var receipt: Dictionary=adapter._commit_skill_quote(q)
			paused=true
			var after: Dictionary=state.read_current_p()
			check(receipt.get("accepted",false) and after.mp==before.mp-q.mp and after.st==before.st-q.st,"actual quote resource commit "+id)
		elif id in ["lckFlatR","lckFlatN","dropRate","expBonus"]:
			var enemy: Node
			for e in main.world.get_enemies():
				if is_instance_valid(e) and e.alive and e.etype==0:enemy=e;break
			check(is_instance_valid(enemy),"actual normal enemy available "+id)
			if is_instance_valid(enemy):
				enemy.data=enemy.data.duplicate(true);enemy.data.level=100;enemy.hp=1;enemy.eShield=0
				state.get("_p").lv=1;state.get("_p").exp=0;state.get("_p").maxExp=1000000
				var exp_before: float=state.read_current_p().exp
				var served: int=system.get_snapshot().served.get(id,0)
				var h=Hurt.new();paused=false
				var outcome: Dictionary=h.execute(main,main.world,enemy,999999,0.0,0,{"dot":true,"shieldHit":true})
				paused=true
				check(outcome.get("ok",false) and outcome.get("killed",false),"actual reward pipeline "+id+str(outcome.get("reason")))
				check(system.get_snapshot().served.get(id,0)>served,"reward consumer read admitted cache "+id)
				var journal: Dictionary={}
				for entry in outcome.get("journal",[]):journal[entry.op]=entry.data
				if id=="expBonus":
					var c: Dictionary=capture(id,"exp",state.read_current_p().exp-exp_before)
					c.raw_exp=journal.get("add_exp",{}).get("raw",-1)
					cases.append(c);check(c.raw_exp>=0,"raw exp recorded")
				else:
					# Real protected reward helper uses the same callback; no damage formula copy.
					var lck: Variant=h._lck_total(state.read_current_p(),inv.equipped)
					cases.append(capture(id,"drop" if id=="dropRate" else "lck",main.read_native_system_equipment_affix(id).value if id=="dropRate" else lck))
					check(journal.has("roll_drop"),"rollDrop executed using cached affixes "+id)
		elif id=="potionPower":
			var g: Dictionary=state.read_current_g();g.on=true;g.paused=false;g.mats=2
			main.player.hp=1
			state.set("_auto_potion_cd",0.0)
			var uses: int=main.source_potion.get_snapshot().uses
			paused=false
			for i in 8:await process_frame
			var amount: Variant=main.source_potion._read("heal").get("value")
			paused=true
			var actual: Dictionary=main.source_potion.get_snapshot()
			check(actual.uses==uses+1 and g.mats==1,"actual automatic potion consumes one malice")
			cases.append(capture(id,"potion",amount))
			check(amount is float or amount is int,"potion actual heal readback ready")
			check(amount!=null and main.player.hp>=1.0+float(amount),"actual HP sink includes potion affix")
		elif id=="lifeHealPow":
			state.read_current_g().mats=0;state.read_current_g().on=true;state.read_current_g().paused=false
			main.player.hp=main.player.max_hp*.5
			var served: int=system.get_snapshot().served.get(id,0)
			paused=false
			for i in 5:await physics_frame
			paused=true
			var snap: Dictionary=main.source_regeneration.get_snapshot()
			var hp: Dictionary=snap.last_results.get("hp",{})
			print("DEMO11_24B_REGEN_DIAG ",JSON.stringify(snap))
			check(hp.get("applied",false),"actual World phase HP sink")
			check(system.get_snapshot().served.get(id,0)>served,"actual regen uses equipment-time cache")
			cases.append(capture(id,"regen",hp.get("packet",{}).get("hpr")))
		elif id=="skillBoost":
			var g: Dictionary=state.read_current_g();g.mats=0;g.on=true;g.paused=false
			main.player.hp=main.player.max_hp*.5
			state.get("_p").skills.holyDome=1;adapter.hd_cd=0.0
			var served: int=system.get_snapshot().served.get(id,0)
			paused=false;adapter.cast_holy_dome()
			for i in 5:await physics_frame
			paused=true
			var flat: Dictionary=main.source_regeneration.get_snapshot().last_results.get("holy_flat",{})
			print("DEMO11_24B_FLAT_DIAG ",JSON.stringify(main.source_regeneration.get_snapshot()))
			check(flat.get("applied",false) and system.get_snapshot().served.get(id,0)>served,"actual holy flat HP uses cached skillBoost")
			var c: Dictionary=capture(id,"flat",flat.get("flat_amount"));c.sp=flat.get("sp");c.dome_level=flat.get("level");c.fuse_star=flat.get("star");cases.append(c)
			g._fireZones=[]
		check(system.get_snapshot().source_queries==source_queries,"consumer event/ticks did not rebuild/query affix source "+id)
		id_results.append({"id":id,"checks_passed":failures==before_failures})
	# Failed refresh must preserve the last admitted equipment cache and INV.
	var bad: Dictionary=factory.mk_item("armor",0,0,0,null,1);bad.affixes=[null];inv.bag.clear();inv.bag.append(bad)
	var cached: Dictionary=system.get_snapshot()
	var result: Dictionary=main.request_native_equip_item(bad)
	check(not result.get("applied",false) and system.get_snapshot().rebuilds==cached.rebuilds,"failed producer leaves admitted cache unchanged")
	check(main.read_native_system_equipment_affix("unknown").get("status")=="NOT_READY","unknown cache id denied")
	var foreign:=Node.new();check(not main.source_regeneration.adopt_completed_intro_identity(foreign).get("accepted",false),"foreign phase handoff rejected");check(not main.source_regeneration.adopt_completed_intro_identity(main).get("accepted",false),"completed intro handoff cannot replay");check(system.rebuild(foreign).get("status")=="NOT_READY" and system.get_snapshot().rebuilds==cached.rebuilds,"foreign cache writer rejected without mutation");foreign.free()
	_oracle()
	var f:=FileAccess.open(OS.get_user_data_dir().path_join("id-results.json"),FileAccess.WRITE);f.store_string(JSON.stringify(id_results));f.close()
	paused=false
	for audio in main.find_children("*","AudioStreamPlayer",true,false):audio.stop()
	root.remove_child(main);main.free();main=null
	await create_timer(.2).timeout
	await process_frame;await process_frame
	print("DEMO11_24B_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"ids":id_results.size(),"oracle_cases":cases.size(),"actual_Main":true,"direct_kill_fixture":true,"natural_loot_claim":false}))
	quit(0 if failures==0 else 1)
func _oracle():
	var node: String=""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):node=arg.trim_prefix("--node-bin=")
	check(not node.is_empty(),"explicit node-bin")
	var input:=OS.get_user_data_dir().path_join("system-cases.json");var output:=OS.get_user_data_dir().path_join("system-oracle.json")
	var f:=FileAccess.open(input,FileAccess.WRITE);f.store_string(JSON.stringify(cases,"",true,true));f.close()
	var text: Array=[]
	var code:=OS.execute(node,PackedStringArray([ProjectSettings.globalize_path("res://tests/build_demo11_24b_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--cases-file="+input,"--out-file="+output]),text,true)
	check(code==0,"source oracle "+"".join(text))
	if code!=0:return
	var packet: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(output))
	check(packet.rows.size()==13,"all 13 ids have original-function cases")
	for row in packet.rows:check(row.equal,"exact source JS "+row.id+" "+str(row))
