extends SceneTree
## Real window renderer only. Matched-frame ON/OFF mist comparison; map look stays ON.
const USERDIR := "EXODUSER-maplook-mist-Isolated-20261020"
const MIST = preload("res://scripts/maplook/ground_mist.gd")
const SPOTS := {"start": Vector2(4020, 7420), "camp": Vector2(1900, 4180), "forest": Vector2(1800, 2200), "attack": Vector2(4020, 7420)}
var out := ""
var failures := 0
var checks := 0
var report := {}

func _initialize() -> void:
	call_deferred("_run")

func _check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("MIST_CAPTURE_FAIL ", label)

func _frames(count: int = 3) -> void:
	for i in count: await RenderingServer.frame_post_draw

func _freeze(node: Node) -> void:
	node.set_process(false)
	node.set_physics_process(false)
	node.set_process_input(false)
	node.set_process_unhandled_input(false)
	for child in node.get_children(): _freeze(child)

func _run() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--out="): out = arg.trim_prefix("--out=")
	if out.is_empty() or OS.get_user_data_dir().get_file() != USERDIR or DisplayServer.get_name() == "headless":
		printerr("real window renderer / explicit out / isolated userdir required")
		quit(2)
		return
	DirAccess.make_dir_recursive_absolute(out)
	root.size = Vector2i(1920, 1080)
	root.gui_disable_input = true
	seed(20261020)
	var main: Node = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_map_look", "on")
	root.add_child(main)
	for enemy in get_nodes_in_group("enemies"): enemy.process_mode = Node.PROCESS_MODE_DISABLED
	main.hud.set_native_debug_overlay_visible(false)
	for at in SPOTS.values():
		main.player.global_position = at
		main.camera.global_position = at
		main.camera.reset_smoothing()
		main.world._update_visible_chunks(at, true)
		for i in 30: await process_frame
	var mist: Node = main.world.get_node_or_null("MaplookGroundMist")
	_check(mist != null and mist.get_snapshot().layers == 2, "automatic module on actual main")
	if mist == null:
		main.free()
		_finish()
		return
	_freeze(main)
	main.camera.position_smoothing_enabled = false
	main.camera.physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_OFF
	main.camera.process_callback = Camera2D.CAMERA2D_PROCESS_IDLE
	Engine.time_scale = 0.0
	mist._time = 8.0
	var look: Node = main.world.get_node("NativeMapLook")
	var shader_clock_frozen := RenderingServer.has_method("set_shader_time_scale")
	if shader_clock_frozen: RenderingServer.call("set_shader_time_scale", 0.0)
	report = {"renderer": DisplayServer.get_name(), "viewport": [1920, 1080], "map_look": "on", "mist": mist.get_snapshot(),
		"comparison": "same main pose/CPU clock; only owned mist visibility differs; existing screen fog always on; native shader TIME may still animate", "spots": {}, "fixture_not_live_combat": true, "native_shader_clock_frozen": shader_clock_frozen}
	for spot in SPOTS:
		var at: Vector2 = SPOTS[spot]
		main.player.global_position = at
		main.player.velocity = Vector2.ZERO
		main.player.reset_physics_interpolation()
		main.camera.global_position = at
		main.camera.reset_smoothing()
		main.camera.reset_physics_interpolation()
		main.camera.force_update_scroll()
		main.world._update_visible_chunks(at, true)
		if spot == "attack":
			Engine.time_scale = 1.0
			main.player.set_physics_process(true)
			var accepted: bool = main.player.request_attack()
			_check(accepted, "actual player request_attack accepted")
			for i in 8: await physics_frame
			if main.player.state == "windup": main.player.release_attack()
			main.player._update_display()
			_freeze(main)
			Engine.time_scale = 0.0
			_check(main.player.state in ["swing", "recover"], "captured genuine attack phase")
		look._process(0.0)
		mist._process(0.0)
		mist.visible = false
		await _frames(8)
		var player_screen: Vector2 = main.player.get_global_transform_with_canvas().origin
		_check(player_screen.distance_to(Vector2(960, 540)) < 1.0, spot + " camera actually centered on player")
		var before: Image = root.get_texture().get_image()
		before.save_png(out.path_join(spot + "_before.png"))
		mist.visible = true
		await _frames(8)
		var after: Image = root.get_texture().get_image()
		after.save_png(out.path_join(spot + "_after.png"))
		_check(before.get_size() == Vector2i(1920, 1080) and after.get_size() == before.get_size(), spot + " real 1920x1080 viewport")
		_check(before.get_data() != after.get_data(), spot + " own mist contributes real pixels")
		var crop := Rect2i(600, 280, 720, 540)
		before.get_region(crop).save_png(out.path_join(spot + "_crop_before_1x.png"))
		after.get_region(crop).save_png(out.path_join(spot + "_crop_after_1x.png"))
		var comparison := Image.create(1440, 540, false, Image.FORMAT_RGBA8)
		comparison.blit_rect(before, crop, Vector2i.ZERO)
		comparison.blit_rect(after, crop, Vector2i(720, 0))
		comparison.save_png(out.path_join(spot + "_comparison_1x.png"))
		report.spots[spot] = {"at": [at.x, at.y], "before": spot + "_before.png", "after": spot + "_after.png", "crop": [600, 280, 720, 540], "player_screen": [player_screen.x, player_screen.y]}
	main.free()
	if shader_clock_frozen: RenderingServer.call("set_shader_time_scale", 1.0)
	Engine.time_scale = 1.0
	await _lighting_probe()
	for i in 12: await process_frame
	_finish()

func _mean(image: Image) -> Vector3:
	var sum := Vector3.ZERO
	var count := 0
	for y in range(160, 352, 2):
		for x in range(160, 352, 2):
			var color := image.get_pixel(x, y)
			sum += Vector3(color.r, color.g, color.b)
			count += 1
	return sum / float(count)

func _lighting_probe() -> void:
	var viewport := SubViewport.new()
	viewport.size = Vector2i(512, 512)
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	root.add_child(viewport)
	var world := Node2D.new()
	viewport.add_child(world)
	var player := Node2D.new()
	player.position = Vector2(80, 2000)
	world.add_child(player)
	var camera := Camera2D.new()
	camera.position = player.position
	world.add_child(camera)
	var ambient := CanvasModulate.new()
	ambient.color = Color(0.12, 0.12, 0.14)
	world.add_child(ambient)
	var mist: Node = MIST.install(world, {"tile_size": 40, "boundary": [[0, 0], [100, 0], [100, 100], [0, 100]]}, player)
	mist.set_process(false)
	mist._process(0.0)
	await _frames(8)
	var unlit: Image = viewport.get_texture().get_image()
	unlit.save_png(out.path_join("probe_unlit.png"))
	var light := PointLight2D.new()
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([Color.WHITE, Color.TRANSPARENT])
	var texture := GradientTexture2D.new()
	texture.gradient = gradient
	texture.width = 512
	texture.height = 512
	texture.fill = GradientTexture2D.FILL_RADIAL
	texture.fill_from = Vector2(0.5, 0.5)
	texture.fill_to = Vector2(1.0, 0.5)
	light.texture = texture
	light.position = player.position
	light.range_z_min = RenderingServer.CANVAS_ITEM_Z_MIN
	light.range_z_max = RenderingServer.CANVAS_ITEM_Z_MAX
	light.color = Color(1.0, 0.15, 0.03)
	light.energy = 2.0
	world.add_child(light)
	await _frames(8)
	var warm: Image = viewport.get_texture().get_image()
	warm.save_png(out.path_join("probe_warm.png"))
	light.color = Color(0.03, 0.15, 1.0)
	await _frames(8)
	var cool: Image = viewport.get_texture().get_image()
	cool.save_png(out.path_join("probe_cool.png"))
	light.position += Vector2(2000, 0)
	await _frames(8)
	var far: Image = viewport.get_texture().get_image()
	far.save_png(out.path_join("probe_far.png"))
	var red := _mean(warm) - _mean(unlit)
	var blue := _mean(cool) - _mean(unlit)
	_check(red.x > 0.001 and red.x > red.z * 1.5, "actual red PointLight tints only mist geometry red")
	_check(blue.z > 0.001 and blue.z > blue.x * 1.5, "actual blue PointLight tints mist blue")
	_check((_mean(far) - _mean(unlit)).length() < 0.002, "moving actual light away removes tint")
	report["light_probe"] = {"warm_delta": [red.x, red.y, red.z], "cool_delta": [blue.x, blue.y, blue.z], "far_error": (_mean(far) - _mean(unlit)).length(), "fixture": "only mist has lit geometry; no lit floor underneath"}
	viewport.free()

func _finish() -> void:
	report["checks"] = checks
	report["failures"] = failures
	var file := FileAccess.open(out.path_join("capture_report.json"), FileAccess.WRITE)
	file.store_string(JSON.stringify(report, "\t"))
	file.close()
	print("MIST_CAPTURE_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "out": out}))
	quit(0 if failures == 0 else 1)
