extends SceneTree
const USERDIR := "EXODUSER-maplook-toxic-Isolated-20261020"
const MODULE_PATH := "res://scripts/maplook/toxic_surface.gd"
var assertions := 0
var failures := 0
var out := ""

func _initialize() -> void:
	call_deferred("_run")

func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("TOXIC_FAIL ", label)

func _fingerprint(world: Node) -> Array:
	var rows: Array = []
	for node in world.get_children():
		if node is Sprite2D:
			rows.append([node.name, node.texture, node.material, node.visible, node.z_index,
				node.transform, node.offset, node.flip_h, node.modulate, node.get_child_count()])
	return rows

func _fixture(data: Dictionary) -> Node2D:
	var world := Node2D.new()
	root.add_child(world)
	for prop in data.props:
		if not prop.id in ["m_c1pool", "pit_poison", "m_c1gtoxic", "m_c1gtoxicf"]:
			continue
		var sprite := Sprite2D.new()
		sprite.name = prop.id
		sprite.texture = load(prop.texture)
		sprite.position = Vector2(prop.position[0], prop.position[1])
		sprite.scale = Vector2(prop.draw_size[0], prop.draw_size[1]) / sprite.texture.get_size()
		sprite.centered = false
		sprite.offset = -sprite.texture.get_size() * Vector2(prop.pivot[0], prop.pivot[1])
		sprite.flip_h = prop.flip_h
		sprite.z_index = int(sprite.position.y / 4.0)
		sprite.z_as_relative = false
		sprite.material = CanvasItemMaterial.new()
		world.add_child(sprite)
	return world

func _run() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--out="): out = arg.trim_prefix("--out=")
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		print("TOXIC_BLOCKED isolation")
		quit(2)
		return
	var script: Script = load(MODULE_PATH)
	if script == null or not script.can_instantiate():
		print("TOXIC_BLOCKED module parse")
		quit(2)
		return
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/map.json"))
	var data_before := JSON.stringify(data)
	var world := _fixture(data)
	var before := _fingerprint(world)
	seed(41923)
	var expected_first := randf()
	var expected_next := randf()
	seed(41923)
	_check(randf() == expected_first, "global RNG control")
	var layer: Node2D = script.install(world, data, null)
	_check(randf() == expected_next, "install does not consume global RNG")
	layer.set_process(false)
	_check(_fingerprint(world) == before, "install original texture/material/visible/z/transform/children unchanged")
	_check(script.install(world, data, null) == layer, "idempotent installation")
	_check(layer.get_child_count() == 4, "exactly four target overlays")
	var snapshot: Dictionary = layer.get_snapshot()
	_check(snapshot.surfaces.size() == 4 and snapshot.visual_seed == 20261020, "four deterministic surfaces")
	for surface in snapshot.surfaces:
		var source: Sprite2D = world.get_node(NodePath(surface.id))
		var overlay: Sprite2D = layer.get_node(NodePath(surface.id + "_ToxicSurface"))
		_check(overlay.texture == source.texture, surface.id + " original Texture2D identity")
		_check(overlay.transform == source.transform and overlay.offset == source.offset and overlay.flip_h == source.flip_h, surface.id + " aligned source footprint and flip")
		_check(overlay.z_index == source.z_index, surface.id + " original depth order")
		_check(surface.bubble_sites.size() == 8, surface.id + " eight fixed bubble sites")
		for site in surface.bubble_sites:
			var image := source.texture.get_image()
			_check(image.get_pixel(int(site[0] * image.get_width()), int(site[1] * image.get_height())).a > 0.95, surface.id + " bubble inside source alpha")
	layer._process(13.0)
	_check(_fingerprint(world) == before, "animation original properties unchanged")
	_check(layer.get_snapshot().clock == 13.0, "delta based animation clock")
	_check(JSON.stringify(data) == data_before, "map_data unchanged")
	var duplicate_world := _fixture(data)
	var duplicate_layer: Node2D = script.install(duplicate_world, data, null)
	duplicate_layer.set_process(false)
	_check(duplicate_layer.get_snapshot().surfaces == snapshot.surfaces, "fixed sites and phase repeat across instances")
	var source: Sprite2D = world.get_node("m_c1pool")
	source.visible = false
	layer._process(0.0)
	_check(not layer.get_node("m_c1pool_ToxicSurface").visible, "own overlay follows hidden original")
	source.visible = true
	if DisplayServer.get_name() != "headless":
		await _gpu_masks(layer)
	world.remove_child(layer)
	layer.free()
	_check(_fingerprint(world) == before, "removing own layer leaves all originals intact")
	world.free()
	duplicate_world.free()
	await _main_contract_and_capture()
	print("TOXIC_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "renderer": DisplayServer.get_name()}))
	quit(1 if failures else 0)

func _gpu_masks(layer: Node2D) -> void:
	# Render the actual production shader alone over transparent pixels. No base
	# sprite or green background can hide an alpha leak or a failed shader here.
	for original in layer.get_children():
		var viewport := SubViewport.new()
		viewport.size = Vector2i(256, 256)
		viewport.transparent_bg = true
		viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
		root.add_child(viewport)
		var sprite := Sprite2D.new()
		sprite.texture = original.texture
		sprite.material = original.material.duplicate()
		sprite.centered = false
		sprite.scale = Vector2(256, 256) / sprite.texture.get_size()
		viewport.add_child(sprite)
		sprite.material.set_shader_parameter("visual_time", 1.0)
		await RenderingServer.frame_post_draw
		await RenderingServer.frame_post_draw
		var first: Image = viewport.get_texture().get_image()
		sprite.material.set_shader_parameter("visual_time", 13.0)
		await RenderingServer.frame_post_draw
		await RenderingServer.frame_post_draw
		var second: Image = viewport.get_texture().get_image()
		var source_image: Image = sprite.texture.get_image()
		var leaks := 0
		var empty_samples := 0
		var changed := 0
		var painted := 0
		for y in range(256):
			for x in range(256):
				var uv := Vector2(float(x) / 256, float(y) / 256)
				var source_alpha := source_image.get_pixel(int(uv.x * source_image.get_width()), int(uv.y * source_image.get_height())).a
				var a := first.get_pixel(x, y)
				var b := second.get_pixel(x, y)
				if source_alpha < 0.005:
					empty_samples += 1
					if a.a > 0.005 or b.a > 0.005:
						if leaks < 10: print("TOXIC_LEAK ", original.name, " pixel=", [x,y], " source_alpha=", source_alpha, " effect=", [a.a,b.a])
						leaks += 1
				if b.a > 0.02: painted += 1
				if absf(a.r - b.r) + absf(a.g - b.g) + absf(a.a - b.a) > 0.015: changed += 1
		_check(empty_samples > 100 and leaks == 0, "%s GPU original-alpha exterior leaks=%d/%d" % [original.name, leaks, empty_samples])
		_check(painted > 100, "%s GPU shader draws (%d samples)" % [original.name, painted])
		_check(changed > 30, "%s GPU flowing surface changes over time (%d samples)" % [original.name, changed])
		if not out.is_empty():
			first.save_png(out.path_join(str(original.name) + "_shader_t1.png"))
			second.save_png(out.path_join(str(original.name) + "_shader_t13.png"))
		viewport.free()

func _boot(mode: String) -> Node:
	var main: Node = (load("res://scenes/main.tscn") as PackedScene).instantiate()
	if not mode.is_empty(): main.set_meta("native_map_look", mode)
	root.add_child(main)
	for i in 8: await physics_frame
	return main

func _main_contract_and_capture() -> void:
	var plain := await _boot("")
	_check(plain.world.get_node_or_null("MaplookToxicSurface") == null, "harness default OFF does not install toxic")
	var state_before: Dictionary = plain.source_state.read_current_g().duplicate(true)
	plain.free()
	var main := await _boot("on")
	var look: Node = main.world.get_node_or_null("NativeMapLook")
	var layer: Node = main.world.get_node_or_null("MaplookToxicSurface")
	_check(look != null and layer != null, "Main ON auto-installs via unchanged MODULES")
	if look == null or layer == null:
		main.free()
		return
	_check("toxic_surface" in look.get_native_map_look_snapshot().modules, "registered in live module snapshot")
	_check(layer.get_snapshot().surfaces.size() == 4, "live four surfaces")
	var keys: Array = main.source_state.read_current_g().keys()
	var previous_keys: Array = state_before.keys()
	keys.sort()
	previous_keys.sort()
	_check(keys == previous_keys, "default/ON gameplay key set identical")
	var original_properties := _fingerprint(main.world)
	layer._process(2.0)
	_check(_fingerprint(main.world) == original_properties, "live lit original texture/material/visible/z unchanged")
	if not out.is_empty() and DisplayServer.get_name() != "headless":
		await _capture(main, layer)
	main.free()

func _capture(main: Node, layer: Node) -> void:
	root.size = Vector2i(1920, 1080)
	root.gui_disable_input = true
	main.hud.set_native_debug_overlay_visible(false)
	var report := {"map_look": main.world.get_node("NativeMapLook").get_native_map_look_snapshot(),
		"toxic": layer.get_snapshot(), "views": {}, "comparison": "left before / right after; same ON lighting; only own overlay toggled"}
	for spot in ["north", "south"]:
		main.process_mode = Node.PROCESS_MODE_INHERIT
		var at := Vector2(6700, 1740) if spot == "north" else Vector2(6500, 5580)
		main.player.global_position = at + Vector2(-280, 200)
		main.player.velocity = Vector2.ZERO
		main.camera.global_position = at
		main.camera.position_smoothing_enabled = false
		main.camera.zoom = Vector2.ONE
		main.camera.force_update_scroll()
		main.world._update_visible_chunks(at, true)
		for enemy in get_nodes_in_group("enemies"): enemy.process_mode = Node.PROCESS_MODE_DISABLED
		for i in 10: await process_frame
		main.camera.global_position = at
		main.camera.force_update_scroll()
		layer._clock = 13.0
		layer._process(0.0)
		main.process_mode = Node.PROCESS_MODE_DISABLED
		Engine.time_scale = 0.0
		layer.visible = false
		await RenderingServer.frame_post_draw
		await RenderingServer.frame_post_draw
		var before: Image = root.get_texture().get_image()
		var draws_before := Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)
		layer.visible = true
		await RenderingServer.frame_post_draw
		await RenderingServer.frame_post_draw
		var after: Image = root.get_texture().get_image()
		var draws_after := Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)
		_check(before.get_size() == Vector2i(1920, 1080), spot + " real 1920x1080 viewport")
		before.save_png(out.path_join(spot + "_full_before.png"))
		after.save_png(out.path_join(spot + "_full_after.png"))
		_pair(before, after, out.path_join(spot + "_full_comparison.png"))
		var crops: Array = [{"name": "pool", "id": "m_c1pool", "size": Vector2i(540, 440)},
			{"name": "growth_n", "id": "m_c1gtoxic", "size": Vector2i(600, 600)}] if spot == "north" else [{"name": "pit", "id": "pit_poison", "size": Vector2i(320, 320)},
			{"name": "growth_s", "id": "m_c1gtoxicf", "size": Vector2i(520, 520)}]
		for crop in crops:
			var source: Node2D = main.world.get_node(NodePath(crop.id))
			var center := source.get_global_transform_with_canvas().origin
			var rect := Rect2i(Vector2i(center) - crop.size / 2, crop.size)
			var a := before.get_region(rect)
			var b := after.get_region(rect)
			a.save_png(out.path_join(crop.name + "_1x_before.png"))
			b.save_png(out.path_join(crop.name + "_1x_after.png"))
			_pair(a, b, out.path_join(crop.name + "_1x_comparison.png"))
		report.views[spot] = {"viewport": [1920, 1080], "camera": [at.x, at.y], "zoom": 1.0, "shader_time_scale": Engine.time_scale, "crop_count": crops.size(),
			"draw_calls_before": draws_before, "draw_calls_after": draws_after}
		Engine.time_scale = 1.0
	var file := FileAccess.open(out.path_join("capture-report.json"), FileAccess.WRITE)
	file.store_string(JSON.stringify(report, "\t"))
	file.close()

func _pair(before: Image, after: Image, path: String) -> void:
	var pair := Image.create(before.get_width() * 2, before.get_height(), false, before.get_format())
	pair.blit_rect(before, Rect2i(Vector2i.ZERO, before.get_size()), Vector2i.ZERO)
	pair.blit_rect(after, Rect2i(Vector2i.ZERO, after.get_size()), Vector2i(before.get_width(), 0))
	pair.save_png(path)
