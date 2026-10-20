extends SceneTree

const USERDIR = "EXODUSER-P2009A-Visual-Isolated-20261020"
var main: Node
var output: String
var records: Array = []

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	output = OS.get_environment("P2009A_VISUAL_OUT")
	if DisplayServer.get_name() == "headless" or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR or output.is_empty():
		print("P2009A_VISUAL_ABORT need actual window, isolated userdir and explicit output")
		quit(2)
		return
	DirAccess.make_dir_recursive_absolute(output)
	root.size = Vector2i(1920, 1080)
	DisplayServer.window_set_size(Vector2i(1920, 1080))
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "external")
	root.add_child(main)
	for frame in range(30):
		await physics_frame
	var state: Node = main.get("source_state")
	var feedback: Node = main.get_node("NativeFeedback")
	var slots: Node = main.get("world").get_node("NativeSkillSlots")
	var g: Dictionary = state.read_current_g()
	g["on"] = true
	var p: Dictionary = state.read_current_p()
	var reward: Dictionary = state.apply_native_add_exp(main, int(p.maxExp))
	var floating: Node = main.get("world").get_node("NativeFloatingText")
	for text in reward.get("texts", []):
		floating.emit_native_text(float(p.x) + float(text.dx), float(p.y) + float(text.dy), text.text, text.color, text.life)
	for frame in range(16):
		await physics_frame
	var notice_only: bool = OS.get_cmdline_user_args().has("--notice-only")
	await _shot("levelup", Rect2i(650, 815, 620, 115) if notice_only else Rect2i(780, 245, 360, 365))
	main.get("player").set("stamina", 0.0)
	slots.cast_giant_slam()
	await create_timer(0.12).timeout
	await _shot("st-shortage", Rect2i(650, 815, 620, 115))
	var current: Dictionary = state.read_current_p()
	main.get("source_resources").commit_native_skill_mana_spend(main, float(current.mp))
	slots.cast_ice_orb()
	await create_timer(0.12).timeout
	await _shot("mp-shortage", Rect2i(650, 815, 620, 115))
	if not notice_only:
		var pickup: Dictionary = state.apply_native_add_potion(main, "hp", 1)
		for text in pickup.get("texts", []):
			floating.emit_native_text(float(p.x) + float(text.dx), float(p.y) + float(text.dy), text.text, text.color, text.life)
		await create_timer(0.1).timeout
		await _shot("pickup", Rect2i(780, 390, 360, 240))
	print("P2009A_VISUAL_RESULT ", JSON.stringify({"window": DisplayServer.window_get_size(), "renderer": RenderingServer.get_video_adapter_name(), "records": records,
		"feedback": feedback.snapshot(), "harness": {"reward_owner_calls": 2, "text_consumer_calls": 2, "st_fixture_writes": 1, "mp_authority_drain": 1, "normal_play": false}}))
	root.remove_child(main)
	main.free()
	await process_frame
	quit(0)

func _shot(label: String, crop: Rect2i) -> void:
	await RenderingServer.frame_post_draw
	var viewport_image: Image = root.get_texture().get_image()
	viewport_image.save_png(output + "/" + label + "-viewport-1920x1080.png")
	viewport_image.get_region(crop).save_png(output + "/" + label + "-viewport-crop-1x.png")
	var record := {"label": label, "viewport": viewport_image.get_size(), "crop": crop, "resized": false,
		"player_screen": main.get("player").get_global_transform_with_canvas().origin,
		"vfx": main.get_node("NativeFeedback").snapshot().vfx}
	record["audio"] = main.get_node("NativeFeedback").snapshot().audio
	if DisplayServer.has_method("screen_get_image"):
		var desktop: Image = DisplayServer.screen_get_image(DisplayServer.window_get_current_screen())
		var client: Rect2i = Rect2i(DisplayServer.window_get_position(), DisplayServer.window_get_size())
		if desktop != null and Rect2i(Vector2i.ZERO, desktop.get_size()).encloses(client):
			var window_image: Image = desktop.get_region(client)
			window_image.save_png(output + "/" + label + "-os-window-1920x1080.png")
			window_image.get_region(crop).save_png(output + "/" + label + "-os-window-crop-1x.png")
			record["os_window_capture"] = true
		else:
			record["os_window_capture"] = false
	records.append(record)
