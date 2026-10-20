extends SceneTree
const USERDIR = "EXODUSER-demo11-21fix-Isolated-20261021"
const Drops = preload("res://scripts/native_world_drops.gd")
class Host extends Node2D:
	var camera: Camera2D
class State extends Node:
	var reads := 0
	func read_native_drop_records() -> Array: reads+=1; return []
	func apply_native_pickup_item(_owner: Node,_item: Dictionary) -> Dictionary: return {}
var checks := 0
var failures := 0
func _initialize() -> void: call_deferred("_run")
func check(value: bool,label: String) -> void:
	checks+=1
	if not value: failures+=1; printerr("DEMO11_21FIX_FAIL ",label)
func _run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolated test namespace")
	if failures: quit(2); return
	for exiting in ["state","main"]:
		var main:=Host.new(); root.add_child(main)
		var world:=Node2D.new(); root.add_child(world)
		var player:=Node2D.new(); world.add_child(player)
		var state:=State.new(); root.add_child(state)
		var drops:=Drops.new(); world.add_child(drops)
		check(drops.configure(main,world,player,state),exiting+" configure explicit lifecycle fixtures")
		drops.set_physics_process(false)
		var owner: Node=state if exiting=="state" else main
		root.remove_child(owner)
		check(not drops.get("_configured"),exiting+" tree exit immediately disables adapter")
		var reads:=state.reads
		owner.free()
		drops.queue_redraw(); drops.get_node("NativeDropBeams").queue_redraw()
		drops._draw(); drops._draw_beams(); drops._physics_process(0.0)
		await process_frame
		await process_frame
		check(not drops.get_native_world_drops_snapshot().configured and drops.get_native_world_drops_snapshot().records==-1,exiting+" queued/direct draw and snapshot safe after owner free")
		if exiting=="main": check(state.reads==reads,"State remains live but is not queried after Main exit")
		world.free()
		if is_instance_valid(state): state.free()
		if is_instance_valid(main): main.free()
	# Direct free of pre-Tree owners emits no tree_exiting; draw guards still apply.
	var guard:=Drops.new(); var detached_state:=State.new(); var detached_main:=Host.new()
	guard.set("_configured",true); guard.set("_state",detached_state); guard.set("_main",detached_main)
	detached_state.free(); detached_main.free()
	guard._draw(); guard._draw_beams()
	check(not guard.get_native_world_drops_snapshot().configured,"invalid owner guard independent of exit signal")
	guard.free()
	await process_frame
	print("DEMO11_21FIX_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"lifecycle_fixtures":true,"actual_Main":false,"save_io":false}))
	quit(0 if failures==0 else 1)
