extends SceneTree
const USERDIR="EXODUSER-demo11-23b-Isolated-20261021"
var checks: int=0
var failures: int=0
func _initialize() -> void: call_deferred("run")
func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok: failures+=1; printerr("DEMO11_23B_FAULT_FAIL ",label)
func run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"exact isolated namespace")
	if failures: quit(2); return
	var main:=preload("res://scripts/main.gd").new(); main.set_meta("demo11_storage",true); root.add_child(main)
	for i in 8: await physics_frame
	check(main.read_native_demo11_load_result().get("committed",false),"actual prior UI save restored via 06c")
	var ui: Control=main.source_inventory_ui; check(ui.open_panel(),"actual inventory open")
	var model: Dictionary=ui.model(); var bag: Array=model.inventory.bag; var stock: Array=model.store
	check(not bag.is_empty(),"real existing fixture inventory available")
	if bag.is_empty(): ui.close_panel(); main.free(); quit(1); return
	var target: Dictionary=bag[0]; var bag_before: Array=bag.duplicate(); var stock_before: Array=stock.duplicate()
	var session: RefCounted=main.get("_demo11_session")
	var shared_before: String=session.shared.get_item("hellcave_sharedStorage").raw
	var game_before: String=session.store.get_item("hellsave_demo").raw
	var lock: String=session.store.readiness().root.path_join(".writer")
	check(DirAccess.make_dir_absolute(lock)==OK,"inject own game writer lock after shared commit phase")
	var result: Dictionary=main.request_native_inventory_ui("deposit",target)
	check(not result.get("applied",false) and result.get("io_failed",false),"later game commit failure is not presented as applied")
	check(is_same(model.inventory.bag,bag) and bag==bag_before and stock==stock_before and is_same(bag[0],target),"sole owner restores actual arrays and object identity")
	check(session.shared.get_item("hellcave_sharedStorage").raw==shared_before,"compensating save restores earlier committed shared bytes")
	check(session.store.get_item("hellsave_demo").raw==game_before,"locked game bytes remain exactly original")
	check(DirAccess.remove_absolute(lock)==OK,"remove only this test lock")
	ui.close_panel(); root.remove_child(main); main.free()
	await create_timer(.25,true,false,true).timeout
	print("DEMO11_23B_FAULT_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"actual_IO":true,"power_cut_atomicity":false}))
	quit(0 if failures==0 else 1)
