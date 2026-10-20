extends SceneTree
const USERDIR := "EXODUSER-maplook-mist-Isolated-20261020"
const MIST = preload("res://scripts/maplook/ground_mist.gd")
var checks := 0
var failures := 0

func _initialize() -> void:
	call_deferred("_run")

func _check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("MIST_FAIL ", label)

func _run() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR:
		quit(2)
		return
	var world := Node2D.new()
	root.add_child(world)
	var player := Node2D.new()
	player.position = Vector2(2000, 2000)
	world.add_child(player)
	var existing := Sprite2D.new()
	var image := Image.create(4, 4, false, Image.FORMAT_RGBA8)
	image.fill(Color.RED)
	existing.texture = ImageTexture.create_from_image(image)
	existing.material = CanvasItemMaterial.new()
	existing.z_index = 88
	existing.visible = false
	world.add_child(existing)
	var protected := [existing.texture, existing.material, existing.visible, existing.z_index, existing.position]
	var map := {"tile_size": 40, "boundary": [[0, 0], [100, 0], [100, 100], [0, 100]], "props": [{"id": "m_ctree13", "position": [1200, 1200]}], "collision_rects": [[1, 2, 3, 4]]}
	var before := var_to_bytes(map)
	seed(20261020)
	var expected := randi()
	seed(20261020)
	var mist: Node2D = MIST.install(world, map, player)
	var random_after := randi()
	_check(is_instance_valid(mist), "valid install")
	if mist == null:
		world.free()
		_finish()
		return
	mist.set_process(false)
	var snap: Dictionary = mist.get_snapshot()
	_check(snap.layers == 2 and snap.chunks > 2, "two independently materialed world chunk layers")
	_check(snap.parallax == [0.025, 0.065] and snap.z == [-2300, -1800], "separate depth below actors and above floor")
	_check(snap.center_combined_alpha < 0.004 and snap.max_combined_alpha < 0.15, "bounded extra opacity protects existing screen fog")
	_check(random_after == expected, "global RNG unchanged")
	_check(var_to_bytes(map) == before, "map/collision/props unchanged")
	_check([existing.texture, existing.material, existing.visible, existing.z_index, existing.position] == protected, "existing visuals untouched")
	_check(mist._density(Vector2(50, 2000)) > mist._density(Vector2(2000, 2000)) * 10.0, "boundary denser than combat center")
	_check(mist._density(Vector2(1200, 1200)) > mist._density(Vector2(2000, 2000)) * 10.0, "forest root density")
	_check(MIST.install(world, map, player) == mist and world.get_child_count() == 3, "idempotent install without stacking haze")
	var positions: Array = []
	for layer in mist.get_children():
		for mesh in layer.get_children():
			positions.append(mesh.position)
			_check(mesh is MeshInstance2D and mesh.light_mask == 1 and mesh.material.shader == MIST.SHADER and not mesh.z_as_relative, "own world geometry participates in real lights")
	player.position += Vector2(400, 200)
	mist._process(1.0)
	var after_positions: Array = []
	for layer in mist.get_children():
		for mesh in layer.get_children(): after_positions.append(mesh.position)
	_check(after_positions == positions, "camera/player movement does not move world anchors")
	_check(mist._materials[0].get_shader_parameter("parallax_offset") == Vector2(10, 5) and mist._materials[1].get_shader_parameter("parallax_offset") == Vector2(26, 13), "two noise planes have different parallax")
	_check(mist._materials[0].get_shader_parameter("visual_time") == 1.0, "flow advances on local visual clock")
	var hash_before: String = snap.mask_hash
	mist.free()
	mist = MIST.install(world, map, player)
	_check(mist.get_snapshot().mask_hash == hash_before, "fixed-seed density repeatable")
	_check(MIST.install(world, {}, player) == mist, "reinstall returns own existing node without modifying it")
	mist.free()
	_check(MIST.install(world, {}, player) == null and world.get_child_count() == 2, "missing boundary creates no overlay")
	_check(MIST.install(world, {"boundary": [[0, 0], [0, 0], [0, 0]]}, player) == null, "degenerate geometry rejected")
	world.free()
	# Actual default harness boots OFF; forced ON uses unmodified MODULES discovery.
	var plain: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(plain)
	for i in 8: await physics_frame
	_check(plain.world.get_node_or_null("NativeMapLook") == null and plain.world.get_node_or_null("MaplookGroundMist") == null, "default OFF has no mist")
	_check(plain.get_node("NativeScreenLighting").is_native_lightmap_enabled(), "OFF screen lighting untouched")
	var map_before := var_to_bytes(plain.world.map_data)
	plain.free()
	var main: Node = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_map_look", "on")
	root.add_child(main)
	for i in 8: await physics_frame
	var attached: Node = main.world.get_node_or_null("MaplookGroundMist")
	_check(attached != null and attached.get_snapshot().layers == 2, "existing MODULES automatically installs mist ON")
	_check(var_to_bytes(main.world.map_data) == map_before, "ON does not change source map")
	var lighting: Node = main.get_node("NativeScreenLighting")
	_check(lighting.get_node("NativeFog2D").visible and lighting.get_node("NativeFogGL").visible, "existing screen fog preserved; no mutation")
	_check(main.world.get_node("NativeMapLook").get_native_map_look_snapshot().modules.has("ground_mist"), "installer reports module")
	main.free()
	for i in 12: await process_frame
	_finish()

func _finish() -> void:
	print("MIST_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "renderer": DisplayServer.get_name(), "userdir": OS.get_user_data_dir()}))
	quit(0 if failures == 0 else 1)
