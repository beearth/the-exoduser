extends Node2D
## MAPLOOK-MIST: two lit, world-anchored low fog layers; visual-only ownership.
const SHADER := preload("res://assets/vfx/maplook_ground_mist.gdshader")
const VISUAL_SEED := 20261020
const MASK_SIZE := 96
const MARGIN := 512.0
const CHUNK_SIZE := 1024.0
const LAYERS := [
	{"name": "LowFolds", "z": -2300, "opacity": 0.12, "parallax": 0.025, "scale": 0.0032, "flow": Vector2(5.0, -1.2)},
	{"name": "UpperWisps", "z": -1800, "opacity": 0.07, "parallax": 0.065, "scale": 0.0045, "flow": Vector2(-3.2, 1.4)}]
var _player: Node2D
var _boundary := PackedVector2Array()
var _forest := PackedVector2Array()
var _layers: Array[Node2D] = []
var _chunks := 0
var _materials: Array[ShaderMaterial] = []
var _origin := Vector2.ZERO
var _size := Vector2.ZERO
var _anchor := Vector2.ZERO
var _time := 0.0
var _mask_hash := ""


static func install(world: Node2D, map_data: Dictionary, player: Node2D) -> Node2D:
	if not is_instance_valid(world):
		return null
	var existing := world.get_node_or_null("MaplookGroundMist")
	if existing != null:
		return existing if existing.get_script() == load("res://scripts/maplook/ground_mist.gd") else null
	var boundary: Variant = map_data.get("boundary")
	if not boundary is Array or boundary.size() < 3:
		return null
	var mist: Node2D = load("res://scripts/maplook/ground_mist.gd").new()
	if not mist._configure(map_data, player):
		mist.free()
		return null
	mist.name = "MaplookGroundMist"
	world.add_child(mist)
	return mist


func _configure(map: Dictionary, player: Node2D) -> bool:
	var tile_value: Variant = map.get("tile_size", 40.0)
	if not _finite_number(tile_value) or float(tile_value) <= 0.0:
		return false
	var tile := float(tile_value)
	for point in map.boundary:
		if not point is Array or point.size() != 2 or not _finite_number(point[0]) or not _finite_number(point[1]):
			return false
		_boundary.append(Vector2(float(point[0]), float(point[1])) * tile)
	var bounds := Rect2(_boundary[0], Vector2.ZERO)
	for point in _boundary:
		bounds = bounds.expand(point)
	if bounds.size.x <= 0.0 or bounds.size.y <= 0.0:
		return false
	bounds = bounds.grow(MARGIN)
	_origin = bounds.position
	_size = bounds.size
	var props: Variant = map.get("props", [])
	for prop in (props if props is Array else []):
		if not prop is Dictionary:
			continue
		var id := str(prop.get("id", ""))
		var point: Variant = prop.get("position")
		if (id.begins_with("m_ctree") or id == "m_c1tree") and point is Array and point.size() == 2 and _finite_number(point[0]) and _finite_number(point[1]):
			_forest.append(Vector2(float(point[0]), float(point[1])))
	_player = player
	_anchor = player.global_position if is_instance_valid(player) else bounds.get_center()
	var image := Image.create(MASK_SIZE, MASK_SIZE, false, Image.FORMAT_R8)
	for y in MASK_SIZE:
		for x in MASK_SIZE:
			var at := _origin + Vector2(float(x) / (MASK_SIZE - 1), float(y) / (MASK_SIZE - 1)) * _size
			image.set_pixel(x, y, Color(_density(at), 0, 0, 1))
	_mask_hash = image.get_data().hex_encode().sha256_text()
	var texture := ImageTexture.create_from_image(image)
	var random := RandomNumberGenerator.new()
	random.seed = VISUAL_SEED
	for spec in LAYERS:
		var layer := Node2D.new()
		layer.name = spec.name
		add_child(layer)
		_layers.append(layer)
		var shader := ShaderMaterial.new()
		shader.shader = SHADER
		shader.set_shader_parameter("density_mask", texture)
		shader.set_shader_parameter("map_origin", _origin)
		shader.set_shader_parameter("map_size", _size)
		shader.set_shader_parameter("opacity", spec.opacity)
		shader.set_shader_parameter("noise_scale", spec.scale)
		shader.set_shader_parameter("flow", spec.flow)
		shader.set_shader_parameter("phase", random.randf_range(0.0, 100.0))
		_materials.append(shader)
		# Small world chunks keep distant PointLights out of a canvas item's light list.
		for row in int(ceil(_size.y / CHUNK_SIZE)):
			for col in int(ceil(_size.x / CHUNK_SIZE)):
				var corner := Vector2(col, row) * CHUNK_SIZE
				var extent := Vector2(minf(CHUNK_SIZE, _size.x - corner.x), minf(CHUNK_SIZE, _size.y - corner.y))
				var quad := QuadMesh.new()
				quad.size = extent
				var mesh := MeshInstance2D.new()
				mesh.name = "Mist_%d_%d" % [col, row]
				mesh.mesh = quad
				mesh.position = _origin + corner + extent * 0.5
				mesh.z_as_relative = false
				mesh.z_index = spec.z
				mesh.light_mask = 1
				mesh.material = shader
				layer.add_child(mesh)
				_chunks += 1

	return true


static func _finite_number(value: Variant) -> bool:
	return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value))


func _density(at: Vector2) -> float:
	var distance := INF
	for i in _boundary.size():
		var nearest := Geometry2D.get_closest_point_to_segment(at, _boundary[i], _boundary[(i + 1) % _boundary.size()])
		distance = minf(distance, at.distance_to(nearest))
	var edge := 1.0 - smoothstep(80.0, 620.0, distance)
	var density := 0.02 + 0.76 * edge if Geometry2D.is_point_in_polygon(at, _boundary) else 0.78
	for tree in _forest:
		density = maxf(density, 0.65 * (1.0 - smoothstep(100.0, 420.0, at.distance_to(tree))))
	return density


func _process(delta: float) -> void:
	_time += delta
	var camera := get_viewport().get_camera_2d()
	var center := camera.get_screen_center_position() if is_instance_valid(camera) else (_player.global_position if is_instance_valid(_player) else _anchor)
	for i in _materials.size():
		_materials[i].set_shader_parameter("visual_time", _time)
		_materials[i].set_shader_parameter("parallax_offset", (center - _anchor) * float(LAYERS[i].parallax))


func get_snapshot() -> Dictionary:
	return {"active": true, "layers": _layers.size(), "chunks": _chunks, "world_anchored": true, "light_mask": 1,
		"opacities": [0.12, 0.07], "parallax": [0.025, 0.065], "z": [-2300, -1800], "visual_time": _time,
		"mask_size": MASK_SIZE, "mask_hash": _mask_hash, "boundary_points": _boundary.size(), "forest_anchors": _forest.size(),
		"max_combined_alpha": 1.0 - (1.0 - 0.12 * 0.78) * (1.0 - 0.07 * 0.78),
		"center_combined_alpha": 1.0 - (1.0 - 0.12 * 0.02) * (1.0 - 0.07 * 0.02),
		"screen_overlay_modified": false, "seed": VISUAL_SEED}
