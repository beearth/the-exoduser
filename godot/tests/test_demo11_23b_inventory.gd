extends SceneTree
const USERDIR="EXODUSER-demo11-23b-Isolated-20261021"
const Main=preload("res://scripts/main.gd")
const Session=preload("res://port_modules/save_adapter/demo_load_session.gd")
const Numbers=preload("res://port_modules/save_adapter/native_json_number.gd")
const Query=preload("res://scripts/native_inventory_query.gd")
const Drop=preload("res://port_modules/kill_reward/drop_item_source.gd")
var checks: int=0
var failures: int=0
var artifacts: String
var node_bin: String
var source: String
var capture_out: String
var rng:=RandomNumberGenerator.new()
var generator: RefCounted
var main: Node
func argument(key: String) -> String:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with(key+"="): return arg.trim_prefix(key+"=")
	return ""
func _initialize() -> void: call_deferred("run")
func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok: failures+=1; printerr("DEMO11_23B_FAIL ",label)
func same(a: Variant,b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float): return a==b
	if typeof(a)!=typeof(b): return false
	if a is Array:
		if a.size()!=b.size(): return false
		for i in a.size():
			if not same(a[i],b[i]): return false
		return true
	if a is Dictionary:
		if a.size()!=b.size(): return false
		for k in a:
			if not b.has(k) or not same(a[k],b[k]): return false
		return true
	return a==b
func write_json(path: String,value: Variant) -> void:
	var file:=FileAccess.open(path,FileAccess.WRITE); file.store_string(JSON.stringify(value,"",true,true)); file.close()
func node(args: Array) -> int:
	var output: Array=[]; var code:=OS.execute(node_bin,PackedStringArray(args),output,true)
	check(code==0,"oracle transport "+"".join(output)); return code
func boot() -> Node:
	var game:=Main.new(); game.set_meta("demo11_storage",true); root.add_child(game)
	for i in 8: await physics_frame
	return game
func destroy() -> void:
	if is_instance_valid(main.source_inventory_ui) and main.source_inventory_ui.visible: main.source_inventory_ui.close_panel()
	paused=false; root.remove_child(main); main.free(); main=null
	await create_timer(.25,true,false,true).timeout
func item(slot: String,rarity: int=0,level: int=1) -> Dictionary:
	var value: Variant=generator.mk_item(slot,0,0,rarity,"sword" if slot=="weapon" else ("crossbow" if slot=="bow" else null),level)
	check(value is Dictionary and not generator.aborted,"source mkItem fixture "+slot)
	return value if value is Dictionary else {}
func run() -> void:
	root.size=Vector2i(1920,1080); root.content_scale_size=Vector2i(1920,1080)
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolated namespace before IO")
	if failures: quit(2); return
	artifacts=argument("--artifacts-dir"); node_bin=argument("--node-bin"); source=argument("--source-game"); capture_out=argument("--capture-out")
	check(not artifacts.is_empty() and not node_bin.is_empty() and not source.is_empty(),"explicit paths")
	DirAccess.make_dir_recursive_absolute(artifacts)
	rng.seed=2026102123; generator=Drop.new(func(_tag): return rng.randf())
	if argument("--capture-only")=="on":
		main=await boot()
		check(main.source_inventory_ui.open_panel(),"capture-only loaded panel")
		await captures(main.source_inventory_ui,main.source_state.read_current_inventory())
		await destroy()
		print("DEMO11_23B_CAPTURE_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"actual_IO":true,"fixture_items":true,"capture_only":true}))
		quit(0 if failures==0 else 1); return
	# Reset only the test namespace; never touch First or another user's store.
	var session:=Session.new(); check(session.store.open_store().ready and session.shared.open_store().ready,"actual demo adapters open")
	for io in [session.store,session.shared]:
		for key in io._allowed_keys():
			var id: String="test-reset-"+key; var r: Dictionary=io.begin_remove(id,key)
			if r.get("status")=="PENDING": r=io.run_request(id)
			check(r.get("committed",false),"isolated reset "+key); io.release_receipt(id)
	_test_numbers()
	_test_query()
	main=await boot()
	check(main.read_native_demo11_load_result().get("status")=="FRESH","actual 06c fresh branch")
	var ui: Control=main.source_inventory_ui; var state: Node=main.source_state
	check(ui.open_panel() and paused,"TAB panel owns pause")
	var m: Dictionary=ui.model(); var inv: Dictionary=m.inventory; var stock: Array=m.store
	check(is_same(inv,state.read_current_inventory()) and is_same(stock,state.get("_demo11_storage")["0"]),"no new INV/STORAGE owner or detached live clone")
	check(inv.bag.size()==10 and stock.is_empty(),"source fresh 10 bag, actual empty shared store")
	var value: Dictionary=inv.bag[0]; var original_id: Variant=value.get("id"); var coords: Array=[value._gx,value._gy]
	var size: int=inv.bag.size()
	var r: Dictionary=ui.perform("deposit",value)
	check(r.get("applied",false) and r.get("saved",false) and inv.bag.size()==size-1 and is_same(stock[0],value),"actual deposit moves one identity and settles native IO")
	check([value._gx,value._gy]==coords,"deposit preserves original grid coordinates")
	var shared_io: RefCounted=main.get("_demo11_session").shared
	var raw: Dictionary=shared_io.get_item("hellcave_sharedStorage")
	check(raw.get("found",false) and raw.raw.contains(str(value.name)),"actual shared UTF8 file readback")
	await destroy(); main=await boot()
	ui=main.source_inventory_ui; state=main.source_state
	check(main.read_native_demo11_load_result().get("status")=="LOADED" and main.read_native_demo11_load_result().get("committed",false),"06c actual loaded restore/start")
	check(ui.open_panel(),"loaded inventory reopens")
	m=ui.model(); inv=m.inventory; stock=m.store
	check(stock.size()==1 and stock[0].id==original_id and inv.bag.size()==size-1,"normal generated fractional item ID survives shared native restore exactly")
	value=stock[0]; r=ui.perform("withdraw",value)
	check(r.get("applied",false) and stock.is_empty() and inv.bag.size()==size and is_same(inv.bag[-1],value),"actual withdraw same object into sole bag")
	# Foreign identity, exact caps, occupied cells, and real writer failure.
	var before: Array=inv.bag.duplicate(); r=ui.perform("deposit",value.duplicate(true))
	check(not r.get("applied",false) and inv.bag==before and stock.is_empty(),"copied ID cannot select/remove a different object")
	var held: Array=stock.duplicate()
	for i in 200: stock.append({"slot":"boots","name":"fixture","rarity":0,"id":i})
	r=ui.perform("deposit",value)
	check(not r.get("applied",false) and r.reason=="store_full" and inv.bag==before and stock.size()==200,"original shared cap200, no writes on reject")
	stock.assign(held)
	var lock: String=main.get("_demo11_session").shared.readiness().root.path_join(".writer")
	check(DirAccess.make_dir_absolute(lock)==OK,"own actual writer lock injection")
	var bytes_before: String=main.get("_demo11_session").shared.get_item("hellcave_sharedStorage").raw
	r=ui.perform("deposit",value)
	check(not r.get("applied",false) and r.get("io_failed",false) and inv.bag==before and stock.is_empty(),"failed native commit restores in-memory identities")
	check(main.get("_demo11_session").shared.get_item("hellcave_sharedStorage").raw==bytes_before,"failed commit leaves real shared bytes unchanged")
	check(DirAccess.remove_absolute(lock)==OK,"remove only own test lock")
	r=ui.perform("move",inv.bag[0],{"x":-1,"y":0})
	check(not r.get("applied",false),"negative/occupied drag destination rejected")
	var drag_data: Dictionary={"panel":ui,"item":inv.bag[0],"source":"bag"}
	check(ui.bag_grid._can_drop_data(Vector2.ZERO,drag_data) and not ui.bag_grid._can_drop_data(Vector2.ZERO,{"panel":null,"item":value,"source":"bag"}),"drag identity stays within the actual panel")
	ui.bag_grid._drop_data(Vector2(449,449),drag_data)
	check(drag_data.item._gx==8 and drag_data.item._gy==8,"actual drag drop uses original grid collision writer and save")
	var prior_bag: Array=inv.bag.duplicate(); var prior_store: Array=stock.duplicate()
	stock.append(item("boots"))
	while inv.bag.size()<m.capacity: inv.bag.append({"slot":"helmet","name":"fixture","rarity":0})
	r=main.request_native_inventory_ui("withdraw",stock[-1])
	check(not r.get("applied",false) and r.reason=="bag_full" and stock.size()==1 and inv.bag.size()==m.capacity,"original withdraw bag.length capacity gate, independent of geometric gaps")
	inv.bag.assign(prior_bag); stock.assign(prior_store)
	var broken: Dictionary={"slot":"weapon","name":"fixture","affixes":[null]}; inv.bag.append(broken)
	r=main.request_native_inventory_ui("sort")
	check(not r.get("applied",false) and is_same(inv.bag[-1],broken),"unsupported source-throw carrier does not silently sort or mutate")
	inv.bag.pop_back()
	ui.close_panel()
	var key:=InputEventKey.new(); key.physical_keycode=KEY_TAB; key.keycode=KEY_TAB; key.pressed=true; root.push_input(key,true); await process_frame
	check(ui.visible and paused,"real TAB input opens existing owner UI")
	key=InputEventKey.new(); key.physical_keycode=KEY_ESCAPE; key.keycode=KEY_ESCAPE; key.pressed=true; root.push_input(key,true); await process_frame
	check(not ui.visible and not paused,"real ESC input closes UI and restores pause")
	check(ui.open_panel(),"reopen after input test")
	var alien:=Node.new(); check(not state.apply_native_inventory_ui(alien,"sort",{},{}).get("applied",false),"foreign writer rejected"); alien.free()
	ui.filter={"slot":value.slot,"rarity":value.rarity,"el":value.el}; ui.refresh_view()
	var indices: Array=ui.get_snapshot().indices
	check(indices.all(func(i): return is_same(inv.bag[i],ui._rendered[indices.find(i)].item)),"filtered view retains actual bag index and identity")
	ui.clear_filter()
	# Use the accepted 22r commit, not a second equipment writer.
	var candidate:=item("armor"); candidate.reqLv=0; inv.bag.append(candidate)
	r=ui.perform("equip",candidate)
	check(r.get("applied",false) and r.get("refresh",{}).get("committed",false) and is_same(inv.equipped.armor,candidate),"UI equip consumes 22r / PC refresh and actual actor readback")
	check(ui.get_snapshot().shared_owner=="State._demo11_storage / 06c" and not ui.get_snapshot().tick_polling,"single inherited owner, no tick polling")

	# Source G45857: owned collection r/t -> new bag bone itemLv0, durable save.
	var collection_before: Dictionary=inv.ossCollect.duplicate(true)
	inv.ossCollect["iron_warlord_skull"]={"r":2,"t":1}
	var bone_size: int=inv.bag.size()
	var removed_bone: Dictionary=ui.perform("withdraw_bone",{},{"part":"skull"})
	check(removed_bone.get("applied",false) and removed_bone.get("saved",false),"withdraw bone saved")
	check(not inv.ossCollect.has("iron_warlord_skull") and inv.bag.size()==bone_size+1,"withdraw moves collection exactly once")
	if inv.bag.size()>bone_size:
		var bone: Dictionary=inv.bag.back()
		check(bone.slot=="bonePart" and bone.part=="skull" and bone.itemLv==0 and bone.rarity==2 and bone.tier==1,"source bone carrier no current-level uplift")
		inv.bag.pop_back()
	inv.ossCollect.assign(collection_before)
	var absent_bone: Dictionary=ui.perform("withdraw_bone",{},{"part":"not-a-part"})
	check(not absent_bone.get("applied",false) and inv.bag.size()==bone_size,"invalid bone no prefix")
	if not capture_out.is_empty() and DisplayServer.get_name()!="headless": await captures(ui,inv)
	await destroy()
	print("DEMO11_23B_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"actual_Main":true,"actual_IO":true,"loaded_restore":true,"capture":not capture_out.is_empty(),"fixture_items":true,"combat_execution":false}))
	quit(0 if failures==0 else 1)
func _test_numbers() -> void:
	var output: String=artifacts.path_join("numbers.json")
	if node([ProjectSettings.globalize_path("res://tests/build_demo11_23b_oracle.mjs"),"--source-game="+source,"--out-file="+output])!=0: return
	var rows: Array=JSON.parse_string(FileAccess.get_file_as_string(output))
	for row in rows:
		var actual: Dictionary=Numbers.decode(row.raw)
		check(actual.get("ready",false),"binary64 decode "+row.raw)
		if actual.get("ready",false): check(PackedFloat64Array([actual.value]).to_byte_array().hex_encode()==row.hex,"exact JS Number bits "+row.raw)
func _test_query() -> void:
	var cases: Array=[]; var observed: Array=[]
	var slots: Array=["weapon","shield","armor","boots","ring1","headband","necklace","bow","gloves","ossuary"]
	for n in 16:
		var bag: Array=[]
		for i in 10:
			var it:=item(slots[i],(n+i)%5); it.fav=i%7==0; it.junk=i%4==0; bag.append(it)
		if n==0: bag[0].crystals=[{"id":"cr_blood_oath","star":1,"q":81,"enh":2}]; bag[0].socketQ=[90]
		cases.append(bag.duplicate(true))
		var powers: Array=bag.map(func(it): return Query.power(it)); var order: Array=Query.sorted_indices(bag)
		Query.arrange(bag,300); observed.append({"powers":powers,"order":order,"coords":bag.map(func(it): return [it._gx,it._gy])})
	var input: String=artifacts.path_join("query-cases.json"); var output: String=artifacts.path_join("query-oracle.json"); write_json(input,cases)
	if node([ProjectSettings.globalize_path("res://tests/build_demo11_23b_oracle.mjs"),"--source-game="+source,"--cases-file="+input,"--out-file="+output])!=0: return
	var expected: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(output))
	for i in observed.size():
		for key in ["powers","order","coords"]: check(same(observed[i][key],expected.rows[i][key]),"source full itemPower/stable sort/layout #"+str(i)+":"+key)
	check(Query.filtered_indices([{"slot":"headband2","rarity":0,"el":0},{"slot":"armor","rarity":0,"el":0}],{"slot":"headband","rarity":0,"el":0})==[0],"rarity0/el0 AND filters and joint earring slots")
func captures(ui: Control,inv: Dictionary) -> void:
	DirAccess.make_dir_recursive_absolute(capture_out)
	# Explicit display fixtures generated by the actual source factory, no invented stats.
	inv.bag.clear()
	main.source_state.get("_demo11_storage")["0"].clear() # Explicit capture fixture only.
	for slot in ["weapon","armor","shield","boots","ring1","gloves"]: inv.bag.append(item(slot,4 if slot=="weapon" else 2,12))
	Query.arrange(inv.bag,300); check(main.save_native_demo11_current().get("committed",false),"capture fixture uses real save path")
	ui.change_page("equipment")
	await RenderingServer.frame_post_draw
	var image: Image=root.get_texture().get_image(); check(image.get_size()==Vector2i(1920,1080),"actual viewport1920x1080")
	check(image.save_png(capture_out.path_join("01-bag-1920x1080.png"))==OK,"bag capture"); image.get_region(Rect2i(510,210,680,720)).save_png(capture_out.path_join("01-bag-1x.png"))
	var candidate: Dictionary=inv.bag.filter(func(it): return it.slot=="weapon")[0]
	ui.show_detail(candidate,"bag")
	await RenderingServer.frame_post_draw
	image=root.get_texture().get_image(); check(image.save_png(capture_out.path_join("02-compare-1920x1080.png"))==OK,"compare capture"); image.get_region(Rect2i(1205,210,620,720)).save_png(capture_out.path_join("02-compare-1x.png"))
	check(ui.perform("deposit",inv.bag[-1]).get("applied",false) and ui.perform("deposit",inv.bag[-1]).get("applied",false),"capture stash populated by actual settled deposit")
	ui.change_page("storage")
	await RenderingServer.frame_post_draw
	image=root.get_texture().get_image(); check(image.save_png(capture_out.path_join("03-storage-1920x1080.png"))==OK,"storage capture"); image.get_region(Rect2i(90,210,420,720)).save_png(capture_out.path_join("03-storage-1x.png"))
