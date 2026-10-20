extends SceneTree

const USERDIR = "EXODUSER-P2006B-Visual-Isolated-20261020"
const OUTPUT = "G:/exoduser-wt/_out/P2-006b-pc/visual-lmb/"
var main: Node

func _initialize() -> void:
	call_deferred("_run")

func _capture(label: String) -> void:
	var hud: Node = main.get("hud")
	hud.call("_refresh_native_first_fight_hud")
	await RenderingServer.frame_post_draw
	var icon: TextureRect = hud.get("_slot_icons")["skSlotLMB"]
	root.get_texture().get_image().save_png(OUTPUT + label + ".png")
	print("P2006B_LMB_CAPTURE ", JSON.stringify({"label": label,
		"activeLMBSk": main.get("source_state").read_current_p().get("activeLMBSk"),
		"state": main.get("player").get("state"), "rect": str(icon.get_global_rect()),
		"has_texture": icon.texture != null, "viewport": str(root.size)}))

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		quit(2)
		return
	root.title = "EXODUSER P2-006b isolated LMB observation"
	root.size = Vector2i(1920, 1080)
	root.content_scale_size = Vector2i(1920, 1080)
	DirAccess.make_dir_recursive_absolute(OUTPUT)
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(12):
		await physics_frame
	var parameters: Dictionary = main.get("source_state").read_current_p()
	var original: Variant = parameters.get("activeLMBSk")
	await _capture("native-source-idle")
	parameters["activeLMBSk"] = "weapon"
	await _capture("native-A-fixture-weapon-idle")
	var player: Node = main.get("player")
	player.request_attack()
	await _capture("native-A-fixture-weapon-attack")
	player.release_attack()
	for frame in range(180):
		await physics_frame
		if player.get("state") == "idle":
			break
	await _capture("native-A-fixture-weapon-after")
	parameters["activeLMBSk"] = original
	await _capture("native-source-restored")
	paused = true
	await create_timer(20.0, true, false, true).timeout
	paused = false
	main.get_parent().remove_child(main)
	main.free()
	quit()
