extends SceneTree
## DEMO11-21: production Main + P2-006a/b, real journal and input dispatch to actual INV.
## G32002–32034 rollDrop; G16721 journal; G32935–32941 R; G16411–16424 bag intake.
## Deterministic journal-boundary fixture; no fabricated kill/hurtE or visual PASS claim.
const USERDIR = "EXODUSER-demo11-21-Isolated-20261021"
const Drop = preload("res://port_modules/kill_reward/drop_item_source.gd")
var assertions := 0
var failures := 0
var main: Node
var forced_combat_fields := 0
func _initialize() -> void:
	call_deferred("_run")
func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("DEMO11_21_FAIL ",label)
func key(pressed: bool) -> void:
	var event := InputEventKey.new()
	event.physical_keycode = KEY_R
	event.keycode = KEY_R
	event.pressed = pressed
	Input.parse_input_event(event)
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and OS.get_user_data_dir().get_file()==USERDIR,"actual isolated userdir")
	if failures>0: finish();return
	main=load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(12): await physics_frame
	var world: Node2D=main.get("world")
	var state: Node=main.get("source_state")
	var player: Node2D=main.get("player")
	check(world.get("ready_for_player")==true,"actual Main/world ready")
	var adapter: Node2D=world.get_node_or_null("NativeWorldDrops")
	check(adapter!=null and adapter.get("_configured")==true,"accepted P2 adapter naturally installed by Main")
	if adapter==null: finish();return
	check(adapter.get_script()==load("res://scripts/native_world_drops.gd"),"existing renderer reused")
	check(adapter.texture_filter==CanvasItem.TEXTURE_FILTER_NEAREST,"P2-006b display preserved")
	var inv: Dictionary=state.read_current_inventory()
	var bag: Array=inv["bag"]
	var count_before: int=bag.size()
	var equipped_before: Dictionary=inv["equipped"].duplicate(true)
	var bundle: Dictionary=main.get("source_providers").get_provider_bundle()
	check(is_same(bundle["current_inventory"].call(),inv),"same live INV as product provider")
	check(state.read_native_drop_records().is_empty(),"fresh journal, no test clearing of product records")
	var draw_tags: Array=[]
	var dropper=Drop.new(func(tag: String) -> float:
		draw_tags.append(tag)
		if tag in ["drop_gate","drop_rarity","drop_slot","drop_element"]: return 0.0
		if tag.ends_with("_gate"): return 0.99
		return 0.5)
	var rolled: Variant=dropper.roll_drop({"ib":false,"etype":0,"elite":0,"drop_tier":0,"x":player.global_position.x,"y":player.global_position.y},
		{"stage":0,"drop_bonus":1.0,"min_pick_rar":0,"min_pick_lv_thr":-1,"plv":int(state.read_current_p()["lv"]),
		"crystal_bag_len":0,"crystal_bag_max":9999,"stone_bag_len":0,"stone_bag_max":9999})
	check(rolled is Dictionary and not dropper.aborted,"production rollDrop accepts explicit RNG fixture")
	if not rolled is Dictionary: finish();return
	check(rolled["world_items"].size()==1,"G32018–32034 one normal equipment record")
	if rolled["world_items"].size()!=1: finish();return
	var record: Dictionary=rolled["world_items"][0]
	var item: Dictionary=record["item"]
	check(item["slot"]=="weapon" and draw_tags.has("drop_gate"),"production item generation, no handwritten item")
	var foreign:=Node.new()
	var denied: Dictionary=state.append_native_drop_records(foreign,[record])
	foreign.free()
	check(denied.get("applied")==false and state.read_native_drop_records().is_empty() and bag.size()==count_before,"foreign journal writer denied without INV mutation")
	check(state.append_native_drop_records(main,[record]).get("applied")==true,"actual reward owner journal append")
	check(is_same(state.read_native_drop_records()[0]["item"],item),"journal retains original item identity")
	for frame in range(3): await physics_frame
	check(bag.size()==count_before,"G41430 no automatic intake before R")
	check(adapter.get_native_world_drops_snapshot()["records"]==1,"existing display consumes live journal")
	key(true)
	await process_frame
	key(false)
	await process_frame
	check(bag.size()==count_before+1,"G32935 actual scene R input reaches P2 intake")
	check(is_same(state.read_current_inventory(),inv) and is_same(inv["bag"],bag),"actual INV/bag authority preserved")
	check(bag.size()>0 and is_same(bag.back(),item),"same journal item now in actual INV")
	check(state.read_native_drop_records().is_empty() and record.get("picked")==true,"G32940 picked only after successful intake")
	check(item.get("_gx")!=null and item.get("_gy")!=null and item.get("_pickT") is int,"G16420 native grid coordinates and pickup time")
	check(inv["equipped"]==equipped_before,"G16411 no automatic equip into empty slot")
	check(is_same(bundle["current_inventory"].call()["bag"],bag) and bundle["current_inventory"].call()["bag"].has(item),"product reader immediately observes intake")
	key(true)
	await process_frame
	key(false)
	await process_frame
	check(bag.size()==count_before+1,"consumed journal item cannot be picked twice")
	check(adapter.get_native_world_drops_snapshot()["records"]==0,"existing display sees journal removal")
	main.get_parent().remove_child(main)
	main.free()
	main=null
	# AudioStreamPlaybackMP3 releases on the audio mixing thread after stop/free.
	# Keep the Tree alive for that owner to drain; do not mute/skip pickup audio.
	await create_timer(0.25,true,false,true).timeout
	await process_frame
	await process_frame
	finish()
func finish() -> void:
	if is_instance_valid(main):
		if main.get_parent()!=null:main.get_parent().remove_child(main)
		main.free()
	print("DEMO11_21_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"forced_combat_fields":forced_combat_fields,"journal_rng_fixture":true,"actual_Main":true,"synthetic_R_via_Input":true,"live_combat_drop_verified":false,"visual_verified":false,"userdir":OS.get_user_data_dir()}))
	quit(0 if failures==0 else 1)
