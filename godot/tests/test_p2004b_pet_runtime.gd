extends SceneTree

const USERDIR = "EXODUSER-P2004B-Runtime-PC-Isolated-20261020"
var assertions := 0
var failures := 0
var main: Node

func _initialize() -> void:
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2004B_RUNTIME_FAIL ", label)

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	_check(isolated, "isolated userdir")
	if not isolated:
		quit(1)
		return
	var packed: PackedScene = load("res://scenes/main.tscn")
	main = packed.instantiate()
	root.add_child(main)
	for frame in range(10):
		await physics_frame
	var world: Node = main.get("world")
	var player: Node2D = main.get("player")
	var state: Node = main.get("source_state")
	var pets: Node = world.get_node("NativePets")
	pets.set_physics_process(false)
	var target: Node2D
	for enemy in world.get_enemies():
		if enemy.get_script().resource_path.ends_with("enemy_melee_flesh_crawler.gd"):
			target = enemy
			break
	_check(is_instance_valid(target), "actual dedicated enemy available")
	if not is_instance_valid(target):
		_finish()
		return
	player.global_position = target.global_position + Vector2(100, 0)
	var receipt: Dictionary = state.apply_native_intro_curtain_g_writes(main.get("source_intro_sequence"), "open")
	_check(receipt.get("applied") == true, "actual G.on owner admitted")
	pets.set("_tick", 60.0)
	pets.call("_check_pet_dialogue")
	var snapshot: Dictionary = pets.get_native_pets_snapshot()
	var log: Array = snapshot["say_log"]
	_check(not log.is_empty() and log[0].get("id") == "tut_start", "configured dialogue survives dedicated enemy read")
	_check(snapshot["dialogue_halt"] == "", "configured readers ready")
	_check(float(pets.get("_pet_enemy_avg_atk")) > 0.0, "500px attack mean read")
	_check(snapshot["dialogue_catalog"]["total"] == 171, "actual installed catalogue")
	_check(snapshot["dialogue_catalog"]["data_only_ids"].size() == 102, "actual data-only boundary")
	var before: Dictionary = snapshot["counters"]
	player.telemetry_event.emit("player_damage", {})
	player.telemetry_event.emit("native_hurte", {"killed": true})
	var after: Dictionary = pets.get_native_pets_snapshot()["counters"]
	_check(after["hit"] == before["hit"] + 1, "actual player signal hit connection")
	_check(after["atk"] == before["atk"] + 1 and after["kill"] == before["kill"] + 1, "actual player signal kill connection")
	_finish()

func _finish() -> void:
	if is_instance_valid(main):
		main.free()
	print("P2004B_RUNTIME_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"main_boots": 1, "forced_position_fields": 1, "telemetry_signal_fixture": true, "userdir": USERDIR}))
	quit(1 if failures > 0 else 0)
