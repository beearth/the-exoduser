extends "res://tests/test_p2006a_world_drops.gd"

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		push_error("P2006A_CONTRACT isolation required")
		quit(2)
		return
	current_group = "source_contract"
	if not await _boot_main():
		_check(false, "Main boot")
	else:
		await _contracts()
	_cleanup()
	# Stop/free is asynchronous to the audio mix thread; keep cleanup observable.
	await create_timer(0.25,true,false,true).timeout
	await process_frame
	await process_frame
	print("P2006A_CONTRACT_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures}))
	quit(1 if failures > 0 else 0)

func _contracts() -> void:
	var adapter: Node2D = _adapter()
	var source: Node = active_main.get("source_state")
	var player: Node2D = active_main.get("player")
	var bone_skin: Texture2D = adapter._skin_for(_mk("bonePart", 2, "유골", {"part": "skull"}))
	_check(bone_skin != null, "27795 bone_skull.png has no element suffix")
	var unique_skin: Texture2D = adapter._skin_for(_mk("weapon", 5, "고유검", {"wtype": "sword", "uniqueArt": "ui-01"}))
	var normal_skin: Texture2D = adapter._skin_for(_mk("weapon", 5, "일반검", {"wtype": "sword"}))
	_check(unique_skin != null and unique_skin != normal_skin, "27866 uniqueArt cutout precedes generic cutout")
	var beam_layer: Node2D = adapter.get_node_or_null("NativeDropBeams")
	_check(beam_layer != null and beam_layer.material is CanvasItemMaterial
		and (beam_layer.material as CanvasItemMaterial).blend_mode == CanvasItemMaterial.BLEND_MODE_ADD,
		"52587 beam uses additive blend, not source-over")
	var bag: Array = source.read_current_inventory().get("bag")
	var count_before := bag.size()
	for offset in range(3):
		_push(player.global_position.x + 50 + offset * 10, player.global_position.y,
			_mk("helmet", 2, "입력%d" % offset))
	for frame in range(10):
		adapter._physics_process(1.0 / 60.0)
	_check(bag.size() == count_before, "41430 no automatic pickup without R")
	var key := InputEventKey.new()
	key.physical_keycode = KEY_R
	key.pressed = true
	adapter._unhandled_input(key)
	_check(bag.size() == count_before + 1, "32935 R press picks one")
	key.echo = true
	adapter._unhandled_input(key)
	_check(bag.size() == count_before + 1, "keydown echo must not bypass 9-tick hold interval")
	key.echo = false
	key.pressed = false
	adapter._unhandled_input(key)
	_check(adapter.get("_interact_held") == false and float(adapter.get("_pick_hold_t")) == 0.0,
		"32979 release resets hold")
	key.pressed = true
	adapter._unhandled_input(key)
	var count_after_press := bag.size()
	for frame in range(8):
		adapter._physics_process(1.0 / 60.0)
	_check(bag.size() == count_after_press, "32958 hold does not repeat before 9 ticks")
	adapter._physics_process(1.0 / 60.0)
	_check(bag.size() == count_after_press + 1, "32958 hold repeats on tick 9")
	key.pressed = false
	adapter._unhandled_input(key)
	var inventory: Dictionary = source.read_current_inventory()
	var old_bag: Array = inventory["bag"]
	inventory["bag"] = []
	var urn_one: Dictionary = source.apply_native_pickup_item(active_main, _mk("ossuary", 5, "유골함1"))
	var urn_two: Dictionary = source.apply_native_pickup_item(active_main, _mk("ossuary", 5, "유골함2"))
	_check(urn_one.get("gx") == 0 and urn_two.get("gx") == 2,
		"16188 same ossuary category occupies its own grid")
	var equipment: Dictionary = source.apply_native_pickup_item(active_main, _mk("armor", 2, "갑옷"))
	_check(equipment.get("gx") == 0, "16188 equipment grid does not collide with ossuary grid")
	var unknown_one: Dictionary = source.apply_native_pickup_item(active_main, _mk("unknown", 0, "1x1a"))
	var unknown_two: Dictionary = source.apply_native_pickup_item(active_main, _mk("unknown", 0, "1x1b"))
	_check(unknown_one.get("gx") == 2 and unknown_two.get("gx") == 3,
		"16186 unknown slot uses source 1x1 fallback")
	inventory["bag"] = old_bag
	_check(source.commit_native_world_item_picked(active_main, -999).get("applied") == false,
		"unknown serial cannot remove a drop")
	var foreign_owner := Node.new()
	var rejected: Dictionary = source.apply_native_pickup_item(foreign_owner, _mk("helmet", 1, "외부"))
	_check(rejected.get("applied") == false, "foreign owner cannot pick up")
	foreign_owner.free()
	if adapter.has_method("_sound_profile"):
		var near_sound: Dictionary = adapter._sound_profile(player.global_position + Vector2(600, 0), true)
		var far_sound: Dictionary = adapter._sound_profile(player.global_position + Vector2(1600, 0), true)
		var pickup_sound: Dictionary = adapter._sound_profile(player.global_position + Vector2(1600, 0), false)
		_check(is_equal_approx(float(near_sound["falloff"]), 1.0) and is_equal_approx(float(near_sound["pan"]), 0.7),
			"12380 source spatial: full gain inside 1200, dx/600 clamped .7")
		_check(is_equal_approx(float(far_sound["falloff"]), 0.25), "12383 spatial 1600px gives squared .5 falloff")
		_check(is_equal_approx(float(pickup_sound["falloff"]), 1.0) and float(pickup_sound["pan"]) == 0.0,
			"16271 pickup sound is not spatial")
	else:
		_check(false, "source spatial sound profile missing")
