extends SceneTree
const Main = preload("res://scripts/main.gd")
const TX = preload("res://scripts/native_salvage_transaction.gd")
const USERDIR := "EXODUSER-demo11-28-Isolated-20261021"
var checks := 0
var failures := 0
func _initialize() -> void: call_deferred("_run")
func check(ok: bool, label: String) -> void:
	checks+=1
	if not ok: failures+=1; printerr("DEMO11_28_FAIL ",label)
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR or not OS.get_user_data_dir().ends_with(USERDIR): quit(2); return
	if OS.get_cmdline_user_args().has("--edge-only"):
		var negative := {"rarity":0,"tier":-501}
		var inv := {"bag":[negative],"equipped":{}}
		check(TX.value_of(negative).value==-2,"source tier arithmetic retains negative value")
		check(not TX.eligible(inv,negative),"manual rejects negative source value")
		check(TX.auto_value(negative,{"min_pick_rar":2,"min_pick_lv_thr":-1},false).value==1,"auto-only Math.max1 clamps negative source value")
		var zero := {"rarity":0,"tier":-500}
		check(TX.value_of(zero).value==0 and TX.eligible({"bag":[zero],"equipped":{}},zero),"manual zero is valid source domain")
		check(TX.auto_value(zero,{"min_pick_rar":2,"min_pick_lv_thr":-1},false).value==1,"auto zero ->1")
		check(not TX.value_of({"enh":INF}).ready and not TX.value_of({"enh":1000001}).ready,"unbounded legacy computation refused, no clamp")
		print("DEMO11_28_RESULT "+JSON.stringify({"checks":checks,"failures":failures,"edge_only":true})); quit(failures); return

	TranslationServer.set_locale("ko")
	var main := Main.new(); root.add_child(main)
	check(main.source_state.is_native_new_run_state_ready(),"actual Main State ready")
	var inv: Dictionary=main.source_state.read_current_inventory()
	var g: Dictionary=main.source_state.read_current_g()
	var panel: CanvasLayer=main.get("_native_salvage_panel")
	if OS.get_cmdline_user_args().has("--input-only"):
		await process_frame # Finish SceneTree input-group registration after add_child.
		var ready: bool=main.source_state.is_native_new_run_state_ready()
		_key(KEY_G); await process_frame
		check(panel.get("_screen").visible and paused,"G engine input opens and pauses:"+JSON.stringify({"registered":panel.is_processing_input(),"owner_ready":ready,"visible":panel.get("_screen").visible,"paused":paused}))
		panel.select_all(false); panel.request_confirmation()
		check(panel.get("_confirm").visible,"real confirmation visible")
		var mats: float=g.mats
		_key(KEY_ESCAPE); await process_frame
		check(not panel.get("_confirm").visible and panel.get("_screen").visible and paused,"first Esc cancels confirmation only")
		check(g.mats==mats,"Esc never commits")
		_key(KEY_ESCAPE); await process_frame
		check(not panel.get("_screen").visible and not paused,"second Esc closes and does not toggle Main pause")
		main.free(); print("DEMO11_28_RESULT "+JSON.stringify({"checks":checks,"failures":failures,"engine_input":true})); quit(failures); return
	if OS.get_cmdline_user_args().has("--capture-only"):
		await _capture(main,panel,inv)
		main.free(); print("DEMO11_28_RESULT "+JSON.stringify({"checks":checks,"failures":failures,"capture_only":true})); quit(failures); return
	var eq: Dictionary=inv.equipped.weapon
	var eq_before := JSON.stringify(eq)
	var a := {"name":"source fixture A","rarity":2,"enh":10,"tier":0}
	var b := {"name":"source fixture B","rarity":0}
	var locked := {"name":"source fixture locked","rarity":4,"fav":true}
	var junk := {"name":"source fixture junk","rarity":1,"junk":true}
	inv.bag.clear(); inv.bag.append_array([a,b,locked,junk,eq])
	var before: float=g.mats
	check(TX.value_of(a).value==10015,"existing META golden enh10 rarity2")
	check(not main.request_native_salvage([locked,eq]).get("applied",false),"fav/equipped alias prohibited")
	check(not main.request_native_salvage([a.duplicate(true)]).get("applied",false),"deep equal detached item is not live bag identity")
	panel.open_panel()
	check(paused,"panel pauses game")
	panel.set("_selection",[a,b]); panel.request_confirmation()
	panel.cancel_confirmation()
	check(g.mats==before and inv.bag.size()==5,"cancel has no writer")
	panel.set("_selection",[a,b]); panel.request_confirmation()
	a.fav=true; inv.bag.reverse() # Confirmation must recheck references and locks.
	main.set("_source_l_eq_cache",{"test":true})
	panel.confirm_salvage()
	check(g.mats==before+1000 and inv.bag.size()==4,"confirm revalidates current eligibility and amount")
	check(TX.contains_ref(inv.bag,a) and not TX.contains_ref(inv.bag,b),"reordered bag removes original identity only")
	check(main.get("_source_l_eq_cache")==null and inv.selected==null,"existing cache invalidated and selection cleared")
	check(panel.get("_wallet").text==panel.number(g.mats),"actual UI wallet refreshed")
	panel.confirm_salvage()
	check(g.mats==before+1000,"double confirm cannot pay twice")
	check(not main.source_state.mark_native_salvage_junk(main,eq,true),"equipped junk marking prohibited")
	junk.junk=false
	check(not main.request_native_salvage([junk],true).get("applied",false),"junk predicate rechecked")
	check(main.source_state.mark_native_salvage_junk(main,junk,true),"single State flag owner")
	var result: Dictionary=main.request_native_salvage([junk,junk],true)
	check(result.applied and result.count==1 and result.gain==2000,"duplicate selection cannot duplicate award")
	check(is_same(eq,inv.equipped.weapon) and JSON.stringify(eq)==eq_before and TX.contains_ref(inv.bag,eq),"equipped value/reference unchanged")
	panel.close_panel(); check(not paused,"panel restores pause state")
	var low := {"type":"item","item":{"rarity":3,"reqLv":1},"picked":false}
	check(main.source_state.append_native_drop_records(main,[low]).applied,"actual drop journal ingress")
	check(not main.try_native_auto_salvage_pickup(low).get("applied",false),"normal pickup not silently salvaged")
	result=main.try_native_auto_salvage_pickup(low,true)
	check(result.applied and result.gain==20000 and low.picked,"full-bag nonlegendary -> existing value and picked ACK")
	check(not main.try_native_auto_salvage_pickup(low,true).get("applied",false),"picked record cannot pay twice")
	var legend := {"type":"item","item":{"rarity":4},"picked":false}
	main.source_state.append_native_drop_records(main,[legend])
	check(not main.try_native_auto_salvage_pickup(legend,true).get("applied",false) and not legend.picked,"full-bag legendary stays on ground")
	var options: Dictionary=main.source_initialization_services.read_current_options()
	options.minPickRar=2
	check(main.read_native_feel_opt_drop_filters().min_pick_rar==2,"actual current OPT filter")
	var filtered := {"type":"item","item":{"rarity":1,"reqLv":0},"picked":false}
	main.source_state.append_native_drop_records(main,[filtered])
	result=main.try_native_auto_salvage_pickup(filtered)
	check(result.applied and result.gain==2000 and filtered.picked,"below actual filter auto salvage")
	check(not main.try_native_auto_salvage_pickup(filtered.duplicate(true)).get("applied",false),"foreign journal identity rejected")
	var illegal := {"type":"item","item":eq,"picked":false}
	main.source_state.append_native_drop_records(main,[illegal])
	check(not main.try_native_auto_salvage_pickup(illegal,true).get("applied",false),"auto equipped alias rejected")
	var bad := {"rarity":2,"enh":"10"}; inv.bag.append(bad)
	check(not main.request_native_salvage([bad]).get("applied",false) and TX.contains_ref(inv.bag,bad),"unported numeric coercion fails closed")
	var wallet: float=g.mats; g.mats=NAN
	check(not main.request_native_salvage([bad]).get("applied",false) and TX.contains_ref(inv.bag,bad),"nonfinite wallet no partial INV commit")
	g.mats=wallet
	check(main.source_state.read_native_salvage_revision()==5,"single wallet writer and explicit revision")
	main.free()
	print("DEMO11_28_RESULT "+JSON.stringify({"checks":checks,"failures":failures,"actual_main":true,"userdir":OS.get_user_data_dir()})); quit(0 if failures==0 else 1)
func _key(code: Key) -> void:
	var event := InputEventKey.new(); event.keycode=code; event.physical_keycode=code; event.pressed=true
	Input.parse_input_event(event)
	var release := InputEventKey.new(); release.keycode=code; release.physical_keycode=code; release.pressed=false
	Input.parse_input_event(release)
func _capture(main: Node, panel: CanvasLayer, inv: Dictionary) -> void:
	var out := ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--captures="): out=arg.trim_prefix("--captures=")
	if out.is_empty(): check(false,"capture directory required"); return
	DirAccess.make_dir_recursive_absolute(out)
	DisplayServer.window_set_size(Vector2i(1920,1080)); root.size=Vector2i(1920,1080)
	inv.bag[0].fav=true; inv.bag[1].junk=true; inv.bag.append(inv.equipped.weapon)
	panel.open_panel()
	var chosen := []
	for item in inv.bag:
		if item is Dictionary and TX.eligible(inv,item) and chosen.size()<3: chosen.append(item)
	panel.set("_selection",chosen); panel.refresh()
	await _shot(panel,out,"01-selection")
	panel.request_confirmation()
	await _shot(panel,out,"02-confirmation")
	panel.confirm_salvage()
	await _shot(panel,out,"03-receipt")
	panel.close_panel()
func _shot(panel: CanvasLayer, out: String, name: String) -> void:
	await process_frame; await process_frame; await RenderingServer.frame_post_draw
	var image := root.get_texture().get_image()
	check(image.get_size()==Vector2i(1920,1080),"real 1920x1080 viewport "+name)
	check(image.save_png(out.path_join(name+".png"))==OK,"actual viewport capture "+name)
	var origin: Vector2i=Vector2i(panel.get("_panel").global_position)
	var regions := {"items":Rect2i(origin+Vector2i(34,265),Vector2i(540,270)),"summary":Rect2i(origin+Vector2i(620,165),Vector2i(320,335)),"footer":Rect2i(origin+Vector2i(30,700),Vector2i(920,80))}
	for key in regions: check(image.get_region(regions[key]).save_png(out.path_join(name+"-1x-"+key+".png"))==OK,"unscaled crop "+key)
