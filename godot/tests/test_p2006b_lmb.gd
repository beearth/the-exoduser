extends SceneTree

const USERDIR = "EXODUSER-P2006B-LMB-Isolated-20261020"
var assertions := 0
var failures := 0
var observations: Array = []

func _initialize() -> void:
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2006B_LMB_FAIL ", label)

func _observe(main: Node, label: String) -> Dictionary:
	var hud: Node = main.get("hud")
	hud.call("_refresh_native_first_fight_hud")
	var icon: TextureRect = hud.get("_slot_icons")["skSlotLMB"]
	var result := {"label": label, "state": main.get("player").get("state"),
		"activeLMBSk": main.get("source_state").read_current_p().get("activeLMBSk"),
		"icon_file": hud.get_native_first_fight_hud_snapshot()["slot_icon_files"]["skSlotLMB"],
		"has_texture": icon.texture != null, "rect": str(icon.get_global_rect())}
	observations.append(result)
	return result

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true \
			or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		print("P2006B_LMB_ABORT isolation required")
		quit(2)
		return
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(12):
		await physics_frame
	var player: Node = main.get("player")
	var parameters: Dictionary = main.get("source_state").read_current_p()
	var original_skill: Variant = parameters.get("activeLMBSk")
	var original := _observe(main, "boot")
	_check(original.icon_file == "kiSlash" and original.has_texture, "unmodified boot has kiSlash texture")
	parameters["activeLMBSk"] = "weapon"
	var injected := _observe(main, "A_visual_fixture_injection")
	_check(injected.icon_file == "" and not injected.has_texture, "A fixture weapon is not in source SKILL_ICONS")
	var attack_started: bool = player.request_attack()
	_check(attack_started, "public request_attack accepted")
	var attacking := _observe(main, "attacking_with_weapon")
	_check(attacking.icon_file == "" and not attacking.has_texture, "blank remains during attack with weapon assignment")
	player.release_attack()
	for frame in range(180):
		await physics_frame
		if player.get("state") == "idle":
			break
	var after_attack := _observe(main, "idle_with_weapon")
	_check(after_attack.state == "idle" and not after_attack.has_texture, "idle weapon assignment stays blank; not transient attack animation")
	parameters["activeLMBSk"] = original_skill
	var restored := _observe(main, "restored_source_selection")
	_check(restored.icon_file == "kiSlash" and restored.has_texture, "restoring source selection restores texture")
	main.get_parent().remove_child(main)
	main.free()
	print("P2006B_LMB_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"observations": observations, "production_changes": 0, "test_parameter_writes": 2}))
	quit(1 if failures > 0 else 0)
