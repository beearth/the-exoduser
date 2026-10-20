extends SceneTree
const USERDIR = "EXODUSER-demo11-27-Isolated-20261021"
const Tx = preload("res://scripts/native_meta_enhancement_transaction.gd")
var assertions=0
var failures=0
var calls=0
var sample=0.0
var main: Node
var oracle_attempts=0
var oracle_transfers=0
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
	assertions+=1
	if not ok:
		failures+=1
		printerr("DEMO11_27_FAIL ",label)
func rng() -> float:
	calls+=1
	return sample
func _run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolated data dir")
	if failures==0:
		_test_oracle()
		await _test_actual()
	if is_instance_valid(main):
		main.source_forge.close_panel()
		for child in main.find_children("*","AudioStreamPlayer",true,false):child.stop()
		main.queue_free();main=null
		await process_frame
		await create_timer(.15).timeout
	print("DEMO11_27_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_attempts":oracle_attempts,"oracle_transfers":oracle_transfers}))
	quit(0 if failures==0 else 1)
func _test_oracle() -> void:
	var node_bin=""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):node_bin=arg.trim_prefix("--node-bin=")
	check(not node_bin.is_empty(),"explicit node-bin")
	if node_bin.is_empty():return
	var output:Array=[]
	var file=OS.get_user_data_dir().path_join("forge-source.json")
	var code=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/build_demo11_27_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--output="+file]),output,true)
	check(code==0,"UTF8 original oracle "+"".join(output))
	if code!=0:return
	var packet:Variant=JSON.parse_string(FileAccess.get_file_as_string(file))
	check(packet is Dictionary,"JSON file complete")
	if not packet is Dictionary:return
	for row in packet.attempts:
		oracle_attempts+=1;calls=0;sample=row.input.roll
		var item={"enh":row.input.enh,"rarity":row.input.rarity};var wallet={"mats":row.input.mats}
		var result=Tx.attempt(item,wallet,rng)
		var label="G50623-50627 #"+str(oracle_attempts)
		check(result.status=="READY",label+" status")
		check(item.enh==row.expected.enh,label+" enhancement/no downgrade")
		check(wallet.mats==row.expected.mats,label+" paid malice")
		check(calls==row.expected.rng_calls,label+" zero/one RNG")
		check(result.cost==row.expected.cost,label+" live quote")
	for row in packet.transfers:
		oracle_transfers+=1
		var old={"enh":row.input.enh,"rarity":row.input.rarity};var item={"enh":row.input.next};var wallet={"mats":row.input.mats}
		var result=Tx.transfer_prefix(old,item,wallet)
		check(result.status=="READY","G16303-16319 status")
		check(_json_numeric_equal(old,row.expected.old) and _json_numeric_equal(item,row.expected.item),"transfer overwrite/old reset/refund")
		check(wallet.mats==row.expected.mats,"transfer cost/insufficient funds no writes")
	var item={"enh":0,"rarity":0};var wallet={"mats":7500};calls=0;sample=.99
	var result=Tx.attempt(item,wallet,rng)
	check(not result.success and item.enh==0 and wallet.mats==0 and calls==1,"exact rate equality is paid failure")
	item.enh=10;wallet.mats=0;calls=0
	result=Tx.attempt(item,wallet,rng)
	check(not result.paid and calls==0 and item.enh==10,"insufficient before RNG/write")
func _test_actual() -> void:
	main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	for i in range(8):await physics_frame
	check(is_instance_valid(main.source_forge) and main.source_forge.is_bound_to(main,main.source_state),"actual Main/State forge bound")
	var state:Node=main.source_state;var g:Dictionary=state.read_current_g();var inv:Dictionary=state.read_current_inventory()
	check(main.source_forge.select_slot("weapon"),"select actual starter weapon reference")
	var item:Dictionary=inv.equipped.weapon;var start=Tx.quote(item)
	g.mats=start.cost-1
	var n:float=item.get("enh",0)
	var count:int=main.world.get_native_runtime_snapshot().random_draw_count
	var result:Dictionary=main.source_forge.attempt_selected()
	check(result.status=="READY" and not result.paid and item.get("enh",0)==n,"actual insufficient keeps item and wallet")
	check(main.world.get_native_runtime_snapshot().random_draw_count==count,"actual insufficient consumes zero World RNG")
	g.mats=start.cost
	main.source_forge.open_panel()
	check(paused and g.paused==true,"forge pauses gameplay")
	var hp:float=main.player.hp;var st:float=main.player.stamina
	result=main.source_forge.attempt_selected()
	check(result.status=="READY" and result.paid and result.rng_calls==1,"actual paid decision while shop paused")
	check(main.world.get_native_runtime_snapshot().random_draw_count==count+1,"actual paid consumes exactly one World RNG")
	check(g.mats==0 and item.get("enh",0)==n+(1 if result.success else 0),"actual State/INV debit+outcome")
	check(result.success==(result.roll<result.rate),"actual World RNG strict comparison")
	check(main.player.hp==hp and main.player.stamina==st,"forge does not heal/damage or spend combat resources")
	# The captured item is intentionally live: no source-invented stale identity/quote rejection.
	item.enh=2;g.mats=100000
	result=main.source_forge.attempt_selected()
	check(result.cost==Tx.Policy.enh_cost(2,item.get("rarity")).cost,"reprice current item, not old selection quote")
	var other=Node.new()
	check(state.apply_native_forge_enhance(other,item).status=="NOT_READY","foreign writer rejected")
	other.free()
	var old_level:int=state.read_native_potion_runtime().level
	state.read_current_p().lv=99;g.mats=3
	check(not main.source_forge.upgrade_potion().paid,"potion level99 blocked")
	state.read_current_p().lv=100
	result=main.source_forge.upgrade_potion()
	check(result.paid and result.cost==3 and state.read_native_potion_runtime().level==old_level+1 and g.mats==0,"demo level100 potion upgrade costs3 and shares 25b POT_LV")
	check(main.source_potion._math.pot_heal(state.read_native_potion_runtime().level).value==150,"automatic potion observes upgraded recovery150")
	check(not main.source_forge.upgrade_potion().paid,"next upgrade requires level200")
	var copy=item.duplicate(true)
	check(state.apply_native_forge_transfer_prefix(main,item,copy).status=="NOT_READY","no paid transfer without actual equip continuation")
	main.source_forge.close_panel()
	check(not paused and g.paused==false,"shop closes and restores previous pause")
	for id in main.source_forge.WORDS:
		for value in main.source_forge.WORDS[id]:
			var emoji=false
			for c in str(value):
				if c.unicode_at(0)>=0x1f000 and c.unicode_at(0)<=0x1faff:emoji=true
			check(not emoji,"UI has no emoji "+id)

# JSON transports every JS Number as native float; compare exact numeric value,
# while retaining every dictionary key and shape (Dictionary== distinguishes int/float).
func _json_numeric_equal(a: Variant,b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float):return float(a)==float(b)
	if a is Dictionary and b is Dictionary:
		if a.size()!=b.size():return false
		for key in a:
			if not b.has(key) or not _json_numeric_equal(a[key],b[key]):return false
		return true
	return a==b
