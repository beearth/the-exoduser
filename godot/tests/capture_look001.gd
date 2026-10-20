extends SceneTree
## Opt-in LOOK-001 laboratory. The default game never loads this script.
## Static start-scene render benchmark, not a combat/gameplay benchmark.
const USERDIR := "EXODUSER-look-001-Isolated-20261020"
const FIXED_SEED := 20261020
const FIXED_SHADER_TIME := 2.0
var main: Node
var variant: Node
var mode := "A"
var output := ""
var seconds := 30.0
var sources_only := false
var result: Dictionary = {}

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--look001-mode="): mode = argument.get_slice("=", 1).to_upper()
		if argument.begins_with("--look001-output="): output = argument.trim_prefix("--look001-output=")
		if argument.begins_with("--look001-seconds="): seconds = float(argument.get_slice("=", 1))
		if argument == "--look001-sources-only": sources_only = true
	if mode not in ["A", "B", "C", "D"] or output.is_empty():
		_fail("mode A/B/C/D and absolute output directory required")
		return
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR \
			or not ProjectSettings.get_setting("application/config/use_custom_user_dir", false):
		_fail("isolated user directory required")
		return
	if DisplayServer.get_name() == "headless" or RenderingServer.get_current_rendering_driver_name() == "dummy":
		_fail("actual window renderer required; no dummy FPS/capture")
		return
	DirAccess.make_dir_recursive_absolute(output)
	root.size = Vector2i(1920, 1080)
	root.gui_disable_input = true
	seed(FIXED_SEED)
	main = (load("res://scenes/main.tscn") as PackedScene).instantiate()
	root.add_child(main)
	if main.get("world") == null or main.get("player") == null or main.world.ready_for_player != true:
		_fail("actual Main startup rejected")
		return
	# No physics tick is advanced: identical canonical start and actor state.
	_disable_physics(main)
	_fix_sprite_pose(main)
	# The decorative cat uses a private random phase, independent of global seed.
	# Normalize only this laboratory's frozen visual pose after normal boot.
	var pets: Node = main.world.get_node_or_null("NativePets")
	if pets != null: pets.pets["cat"]["t"] = 0.0
	main.hud.set_native_debug_overlay_visible(false)
	Engine.max_fps = 120
	for i in range(6): await process_frame
	var paths: Dictionary = {}
	_collect_sources(main, paths)
	var sources := paths.values()
	sources.sort_custom(func(a, b): return str(a.path) < str(b.path))
	_write_json(output.path_join("visible_sources.json"), {"sources": sources,
		"seed": FIXED_SEED, "focus": [main.player.position.x, main.player.position.y]})
	if not sources_only:
		if mode == "B":
			var manifest: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://assets/derived/look001/manifest.json"))
			if not manifest is Dictionary:
				_fail("derived normal manifest missing")
				return
			variant = load("res://scripts/look001/look_2d_variant.gd").new()
			main.add_child(variant)
			result["presentation"] = variant.configure(main, manifest)
		elif mode in ["C", "D"]:
			var mounted: Dictionary = main.mount_native_perspective_view()
			if mounted.get("ready") != true:
				_fail("perspective mount: " + str(mounted))
				return
			var perspective: Node = main.native_perspective_view
			result["mass_mount"] = perspective.mount_native_map_mass_scene()
			if result.mass_mount.get("ready") != true:
				_fail("existing mass mount rejected: " + str(result.mass_mount))
				return
			main.get_node("NativeScreenLighting").visible = false
			variant = load("res://scripts/look001/look_3d_variant.gd").new()
			main.add_child(variant)
			result["presentation"] = variant.configure(main, perspective, mode)
		if variant != null and result.presentation.get("ready") != true:
			_fail("presentation rejected: " + str(result.presentation))
			return
	for i in range(10): await process_frame
	_freeze_shader_time(main)
	_freeze_nodes(main)
	for i in range(30): await process_frame
	result.merge({"schema": "exoduser.look-001.capture.v1", "mode": mode,
		"userdir": OS.get_user_data_dir(), "seed": FIXED_SEED,
		"shader_time_seconds": FIXED_SHADER_TIME, "native_frame": main.world.get_native_frame(),
		"world_focus": [main.player.position.x, main.player.position.y],
		"camera_2d_center": [main.camera.get_screen_center_position().x, main.camera.get_screen_center_position().y],
		"resolution": [root.size.x, root.size.y], "engine": Engine.get_version_info(),
		"renderer": RenderingServer.get_current_rendering_method(),
		"driver": RenderingServer.get_current_rendering_driver_name(),
		"adapter": RenderingServer.get_video_adapter_name(),
		"benchmark": "frozen canonical start scene; real wall-clock frame_post_draw intervals; no combat",
		"simulation_ticks_advanced": 0, "fps_cap": 120, "derived_source_count": sources.size()})
	if variant != null: result["presentation"] = variant.get_snapshot()
	if mode in ["C", "D"]: result["perspective"] = main.get_native_perspective_view_snapshot()
	await RenderingServer.frame_post_draw
	var captured: Image = root.get_texture().get_image()
	if captured == null or captured.get_size() != Vector2i(1920, 1080):
		_fail("viewport capture must be 1920x1080")
		return
	result["capture_error"] = captured.save_png(output.path_join(mode + ".png"))
	if not sources_only:
		var intervals: Array = []
		var bins: Array = []
		var begin := Time.get_ticks_usec()
		var previous := begin
		var bin_begin := begin
		var bin_frames := 0
		while float(previous - begin) / 1000000.0 < seconds:
			await RenderingServer.frame_post_draw
			var now := Time.get_ticks_usec()
			intervals.append(now - previous)
			bin_frames += 1
			if now - bin_begin >= 1000000:
				bins.append({"elapsed_s": float(now - begin) / 1000000.0,
					"fps": float(bin_frames) * 1000000.0 / float(now - bin_begin),
					"engine_fps": Engine.get_frames_per_second()})
				bin_begin = now
				bin_frames = 0
			previous = now
		var duration := float(previous - begin) / 1000000.0
		var min_bin := INF
		for row in bins: min_bin = minf(min_bin, row.fps)
		result["performance"] = {"duration_s": duration, "rendered_frames": intervals.size(),
			"average_fps": float(intervals.size()) / duration,
			"minimum_frame_fps": 1000000.0 / float(intervals.max()),
			"minimum_one_second_fps": min_bin, "one_second_bins": bins}
		_write_json(output.path_join(mode + "_frame_intervals_us.json"), intervals)
	_write_json(output.path_join(mode + ".json"), result)
	print("LOOK001_RESULT ", JSON.stringify(result))
	if variant != null: variant.release()
	root.remove_child(main)
	main.free()
	main = null
	for i in range(4): await process_frame
	quit(0 if result.capture_error == OK else 1)

func _disable_physics(node: Node) -> void:
	node.set_physics_process(false)
	node.set_process_input(false)
	node.set_process_unhandled_input(false)
	node.set_process_unhandled_key_input(false)
	for child in node.get_children(): _disable_physics(child)

func _freeze_nodes(node: Node) -> void:
	node.set_process(false)
	node.set_physics_process(false)
	if node is AnimatedSprite2D:
		node.pause()
	if node is AnimationPlayer: node.pause()
	if node is Timer: node.stop()
	for child in node.get_children(): _freeze_nodes(child)

func _fix_sprite_pose(node: Node) -> void:
	if node is AnimatedSprite2D:
		node.pause()
		node.frame = 0
	for child in node.get_children(): _fix_sprite_pose(child)

func _freeze_shader_time(node: Node) -> void:
	var material: Material
	if node is CanvasItem: material = node.material
	elif node is GeometryInstance3D: material = node.material_override
	if material is ShaderMaterial and material.shader != null and material.shader.code.contains("TIME"):
		var copy := material.duplicate() as ShaderMaterial
		var shader := Shader.new()
		var regex := RegEx.new()
		regex.compile("\\bTIME\\b")
		var code := regex.sub(material.shader.code, "look001_fixed_time", true)
		var semicolon := code.find(";")
		shader.code = code.insert(semicolon + 1, "\nuniform float look001_fixed_time = 2.0;\n")
		copy.shader = shader
		copy.set_shader_parameter("look001_fixed_time", FIXED_SHADER_TIME)
		if node is CanvasItem: node.material = copy
		else: node.material_override = copy
	for child in node.get_children(): _freeze_shader_time(child)

func _collect_sources(node: Node, paths: Dictionary) -> void:
	var texture: Texture2D
	var cell := Vector2i.ZERO
	if node is Sprite2D and node.is_visible_in_tree():
		var bounds := Rect2(main.player.position - Vector2(1500, 1500), Vector2(3000, 2200))
		if bounds.intersects(node.get_global_transform() * node.get_rect()):
			texture = node.texture
			if texture != null and not texture.resource_path.contains("/production_finish/"):
				var sheet_size: Vector2 = node.region_rect.size if node.region_enabled else texture.get_size()
				if node.region_enabled or node.hframes > 1 or node.vframes > 1:
					cell = Vector2i(sheet_size / Vector2(node.hframes, node.vframes))
	elif node is AnimatedSprite2D and node.is_visible_in_tree() and node.sprite_frames != null:
		texture = node.sprite_frames.get_frame_texture(node.animation, node.frame)
	if texture is AtlasTexture:
		var atlas := texture as AtlasTexture
		if atlas.atlas != null and not atlas.atlas.resource_path.is_empty():
			paths[atlas.atlas.resource_path] = {"path": atlas.atlas.resource_path,
				"frame_size": [int(atlas.region.size.x), int(atlas.region.size.y)]}
	elif texture != null and texture.resource_path.begins_with("res://"):
		var row := {"path": texture.resource_path}
		if cell.x > 0 and cell.y > 0: row["frame_size"] = [cell.x, cell.y]
		if paths.has(texture.resource_path) and paths[texture.resource_path] != row:
			_fail("inconsistent atlas cell declarations: " + texture.resource_path)
			return
		paths[texture.resource_path] = row
	for child in node.get_children(): _collect_sources(child, paths)

func _write_json(path: String, value: Variant) -> void:
	var file := FileAccess.open(path, FileAccess.WRITE)
	file.store_string(JSON.stringify(value, "\t"))

func _fail(reason: String) -> void:
	push_error("LOOK001_BLOCKED " + reason)
	print("LOOK001_BLOCKED ", reason)
	if is_instance_valid(variant): variant.release()
	if is_instance_valid(main):
		if main.get_parent() != null: main.get_parent().remove_child(main)
		main.free()
	main = null
	quit(2)
