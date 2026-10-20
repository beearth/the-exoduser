extends SceneTree
const USERDIR="EXODUSER-demo11-23b-Isolated-20261021"
class GuideObservation extends Node2D:
	func get_snapshot() -> Dictionary: return {"phase":"guide"}
var checks: int=0
var failures: int=0
func _initialize() -> void: call_deferred("run")
func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok: failures+=1; printerr("DEMO11_23B_GATE_FAIL ",label)
func run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolated namespace")
	if failures: quit(2); return
	var main:=preload("res://scripts/main.gd").new(); main.set_meta("demo11_storage",true); root.add_child(main)
	for i in 8: await physics_frame
	check(main.read_native_demo11_load_result().get("committed",false),"actual loaded owner")
	var ui: Control=main.source_inventory_ui; var original: Node2D=main.source_intro_sequence
	# Supplied observation fixture only; do not edit the protected guide state.
	var observation:=GuideObservation.new(); main.source_intro_sequence=observation
	var event:=InputEventKey.new(); event.keycode=KEY_TAB; event.physical_keycode=KEY_TAB; event.pressed=true
	root.push_input(event,true); await process_frame
	check(not ui.visible and not paused,"inventory yields to existing guide input ownership")
	main.source_intro_sequence=original; observation.free()
	root.push_input(event,true); await process_frame
	check(ui.visible and paused,"normal viewport TAB still opens after guide observation")
	ui.close_panel(); check(not paused,"pause restored")
	root.remove_child(main); main.free(); await create_timer(.25,true,false,true).timeout
	print("DEMO11_23B_GATE_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"guide_observation_fixture":true,"protected_guide_writes":0}))
	quit(0 if failures==0 else 1)
