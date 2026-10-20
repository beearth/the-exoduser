extends SceneTree

const USERDIR := "EXODUSER-MAPLOOK-HOLE-PC-Isolated-20261020"
const FX := preload("res://scripts/maplook/spawn_hole_fx.gd")
const HOLE := Vector2(3780, 6220)
const STAND := Vector2(3780, 6400)
var output := ""
var overlay: Node2D
var world: Node2D
var captures: Array = []

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name") != USERDIR or DisplayServer.get_name() == "headless":
		print("HOLE_CAPTURE_ABORT isolation_or_renderer")
		quit(2)
		return
	output = OS.get_environment("MAPLOOK_HOLE_OUT")
	if output.is_empty():
		quit(3)
		return
	DirAccess.make_dir_recursive_absolute(output)
	seed(20261020)
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(8):
		await physics_frame
	world = main.get("world")
	var player: Node2D = main.get("player")
	player.global_position = STAND
	var camera: Camera2D = main.get("camera")
	camera.position_smoothing_enabled = false
	camera.global_position = STAND
	camera.reset_smoothing()
	camera.force_update_scroll()
	main.process_mode = Node.PROCESS_MODE_DISABLED
	var system: Node = world.get_node("NativeSpawnHoleSystem")
	system.set("_game_frame", 121)
	system.call("_redraw")
	var ambient := CanvasModulate.new()
	ambient.color = Color(0.30, 0.31, 0.34)
	world.add_child(ambient)
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([Color.WHITE, Color(1, 1, 1, 0)])
	var light_texture := GradientTexture2D.new()
	light_texture.gradient = gradient
	light_texture.width = 1120
	light_texture.height = 1120
	light_texture.fill = GradientTexture2D.FILL_RADIAL
	light_texture.fill_from = Vector2(0.5, 0.5)
	light_texture.fill_to = Vector2(1.0, 0.5)
	var lantern := PointLight2D.new()
	lantern.texture = light_texture
	lantern.color = Color(1.0, 0.70, 0.46)
	lantern.position = STAND
	world.add_child(lantern)
	overlay = FX.install(world, world.get("map_data"), player)
	overlay.set_process(false)
	await _shot("baseline", false)
	overlay.call("_process", 2.0)
	await _shot("idle", true)
	overlay.call("_process", 0.3)
	await _shot("idle_sequence", true)
	for frame in range(121):
		system.advance_native(1.0)
	overlay.call("_process", 0.8)
	await _shot("summoning", true)
	overlay.call("_process", 0.3)
	await _shot("summoning_sequence", true)
	var before: Dictionary = main.get("source_state").read_current_g().duplicate(true)
	var bench: Array = []
	Engine.max_fps = 0
	DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
	overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	overlay.visible = true
	overlay.set_process(true)
	var initial_warm := Time.get_ticks_usec()
	while Time.get_ticks_usec() - initial_warm < 10000000:
		await RenderingServer.frame_post_draw
	for enabled in [false, true, true, false]:
		overlay.visible = enabled
		overlay.set_process(enabled)
		var warm_start := Time.get_ticks_usec()
		while Time.get_ticks_usec() - warm_start < 3000000:
			await RenderingServer.frame_post_draw
		bench.append(await _measure(enabled))
	var unchanged: bool = before == main.get("source_state").read_current_g()
	var result := {"resolution": [root.get_texture().get_width(), root.get_texture().get_height()],
		"renderer": RenderingServer.get_video_adapter_name(), "captures": captures,
		"benchmark": bench, "mean_added_ms": (bench[1]["mean_ms"] + bench[2]["mean_ms"] - bench[0]["mean_ms"] - bench[3]["mean_ms"]) * 0.5,
		"budget_ms": 0.5, "simulation_unchanged_during_benchmark": unchanged,
		"source_metrics": system.get_snapshot()["metrics"], "overlay": overlay.get_snapshot(),
		"fixture": "actual Main frozen; source.advance_native 121 ticks for natural trigger and first summon; capture-only ambient and player light; no hole light"}
	var file := FileAccess.open(output + "/capture_result.json", FileAccess.WRITE)
	file.store_string(JSON.stringify(result, "\t"))
	file.close()
	print("HOLE_CAPTURE_RESULT ", JSON.stringify(result))
	root.remove_child(main)
	main.free()
	quit(0 if unchanged else 1)

func _shot(label: String, enabled: bool) -> void:
	overlay.visible = enabled
	for frame in range(4):
		await process_frame
	await RenderingServer.frame_post_draw
	var image: Image = root.get_texture().get_image()
	var center: Vector2 = world.get_global_transform_with_canvas() * HOLE
	var crop := Rect2i(Vector2i(center) - Vector2i(200, 150), Vector2i(400, 300))
	var full_error := image.save_png(output + "/" + label + ".png")
	var crop_error := image.get_region(crop).save_png(output + "/" + label + "_1x.png")
	captures.append({"label": label, "full_error": full_error, "crop_error": crop_error,
		"crop": [crop.position.x, crop.position.y, crop.size.x, crop.size.y], "target_screen": [center.x, center.y]})
	print("HOLE_SHOT ", label, " ", crop)

func _measure(enabled: bool) -> Dictionary:
	var started := Time.get_ticks_usec()
	var previous := started
	var first_frame := Engine.get_process_frames()
	var last_frame := first_frame
	var samples: Array[float] = []
	var process_total := 0.0
	var process_max := 0.0
	while Time.get_ticks_usec() - started < 10000000:
		await process_frame
		await RenderingServer.frame_post_draw
		var current := Time.get_ticks_usec()
		var frame_number := Engine.get_process_frames()
		if frame_number == last_frame:
			continue
		last_frame = frame_number
		samples.append(float(current - previous) / 1000.0)
		previous = current
		var process_ms := float(Performance.get_monitor(Performance.TIME_PROCESS)) * 1000.0
		process_total += process_ms
		process_max = maxf(process_max, process_ms)
	var total := 0.0
	var maximum := 0.0
	for sample in samples:
		total += sample
		maximum = maxf(maximum, sample)
	samples.sort()
	return {"enabled": enabled, "duration_seconds": float(previous - started) / 1000000.0,
		"frames": samples.size(), "engine_frames": last_frame - first_frame,
		"mean_ms": total / samples.size(), "max_ms": maximum,
		"p95_ms": samples[int(samples.size() * 0.95)], "process_mean_ms": process_total / samples.size(),
		"process_max_ms": process_max}
