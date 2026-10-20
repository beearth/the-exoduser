extends Node
## Explicit LOOK-001 B only. Source texture/material/visible and simulation
## remain unchanged. Reversible culling selects owned normal-lit proxies.

const SCHEMA := "exoduser.look-001.2d-variant.v1"
const ORIGINAL_CULL_BIT := 1 << 18
const ENHANCED_LIGHT_BIT := 1 << 19
const VIEW_MARGIN := 320.0
const FIXED_FOG_TIME := 2.0
const AMBIENT_COLOR := Color(0.80, 0.81, 0.80)
const KEY_COLOR := Color(0.95, 0.84, 0.67)
const PLAYER_COLOR := Color(1.0, 0.64, 0.39)
const TORCH_COLOR := Color(1.0, 0.36, 0.16)
const HOLE_COLOR := Color(0.70, 0.16, 0.12)
const FOG_SHADER := preload("res://scripts/look001/look_2d_fog.gdshader")
const GRADE_SHADER := preload("res://scripts/look001/look_2d_grade.gdshader")

var _main: Node
var _world: Node2D
var _player: Node2D
var _viewport: Viewport
var _original_cull_mask := 0
var _proxy_root: Node2D
var _post_layer: CanvasLayer
var _mapping: Dictionary = {}
var _states: Dictionary = {}
var _normal_cache: Dictionary = {}
var _canvas_cache: Dictionary = {}
var _missing_normals: Dictionary = {}
var _light_rows: Array = []
var _occluder_rows: Array = []
var _selection_area := Rect2()
var _light_texture: GradientTexture2D
var _ready := false
var _reason := "not_configured"

func configure(main: Node, manifest: Dictionary) -> Dictionary:
	if _ready:
		return {"ready": false, "reason": "already_configured"}
	if not is_instance_valid(main) or not main.is_inside_tree() \
			or not is_instance_valid(main.get("world")) or not is_instance_valid(main.get("player")):
		return _reject("actual_main_world_player_required")
	if not manifest.get("mapping") is Dictionary or manifest.mapping.is_empty():
		return _reject("derived_normal_manifest_mapping_required")
	_main = main
	_world = main.get("world") as Node2D
	_player = main.get("player") as Node2D
	_viewport = main.get_viewport()
	_mapping = manifest.mapping.duplicate(true)
	_original_cull_mask = _viewport.canvas_cull_mask
	_selection_area = _read_view_area().grow(VIEW_MARGIN)
	_proxy_root = Node2D.new()
	_proxy_root.name = "Look001NormalLitProxies"
	_main.add_child(_proxy_root)
	_proxy_root.global_transform = Transform2D.IDENTITY
	var ambient := CanvasModulate.new()
	ambient.name = "Look001WorldAmbient"
	ambient.color = AMBIENT_COLOR
	_proxy_root.add_child(ambient)
	_make_light_texture()
	_collect_sources()
	if _states.is_empty():
		release()
		return _reject("no_current_visible_source_with_derived_normal")
	_viewport.canvas_cull_mask = _original_cull_mask & ~ORIGINAL_CULL_BIT
	_mount_lights()
	_mount_occluders()
	_mount_post()
	_ready = true
	_reason = ""
	process_priority = 100
	set_process(true)
	return get_snapshot()

func _read_view_area() -> Rect2:
	var inverse := _viewport.get_canvas_transform().affine_inverse()
	var size := Vector2(_viewport.get_visible_rect().size)
	var low := Vector2(INF, INF)
	var high := Vector2(-INF, -INF)
	for corner in [Vector2.ZERO, Vector2(size.x, 0.0), size, Vector2(0.0, size.y)]:
		var world_point: Vector2 = inverse * corner
		low = low.min(world_point)
		high = high.max(world_point)
	return Rect2(low, high - low)

func _collect_sources() -> void:
	if _world.has_method("get_native_baked_environment_publication"):
		var publication: Dictionary = _world.get_native_baked_environment_publication()
		for source in publication.get("source_nodes", []):
			if source is Sprite2D:
				_add_proxy(source, "baked_ground")
	var data: Variant = _world.get("map_data")
	if data is Dictionary:
		for row in data.get("props", []):
			var source := _world.get_node_or_null(str(row.get("id", "")))
			if source is Sprite2D:
				_add_proxy(source, "authored_prop")
	if _player.has_method("get_native_projection_metadata"):
		var metadata: Dictionary = _player.get_native_projection_metadata()
		var source: Variant = metadata.get("source")
		if metadata.get("ready") == true and source is AnimatedSprite2D:
			_add_proxy(source, "current_player")

func _source_texture(source: Node2D) -> Texture2D:
	if source is Sprite2D:
		return source.texture
	if source is AnimatedSprite2D and source.sprite_frames != null \
			and source.sprite_frames.has_animation(source.animation) \
			and source.frame < source.sprite_frames.get_frame_count(source.animation):
		return source.sprite_frames.get_frame_texture(source.animation, source.frame)
	return null

func _source_rect(source: Node2D) -> Rect2:
	var texture := _source_texture(source)
	if texture == null:
		return Rect2()
	var size: Vector2 = texture.get_size()
	if source is Sprite2D:
		size = (source.region_rect.size if source.region_enabled else size) / Vector2(source.hframes, source.vframes)
	var local_rect := Rect2(source.offset - size * 0.5 if source.centered else source.offset, size)
	var low := Vector2(INF, INF)
	var high := Vector2(-INF, -INF)
	for point in [local_rect.position, Vector2(local_rect.end.x, local_rect.position.y), local_rect.end, Vector2(local_rect.position.x, local_rect.end.y)]:
		var transformed: Vector2 = source.global_transform * point
		low = low.min(transformed)
		high = high.max(transformed)
	return Rect2(low, high - low)

func _add_proxy(source: Node2D, kind: String) -> void:
	if not source.is_visible_in_tree() or source.is_queued_for_deletion() \
			or not _source_rect(source).intersects(_selection_area):
		return
	var id := source.get_instance_id()
	if _states.has(id):
		return
	var canvas := _canvas_for_texture(_source_texture(source))
	if canvas == null:
		return
	var proxy := Sprite2D.new()
	proxy.name = "Look001_" + str(source.name)
	proxy.texture = canvas
	proxy.visibility_layer = 1
	proxy.light_mask = ENHANCED_LIGHT_BIT
	proxy.z_as_relative = false
	_proxy_root.add_child(proxy)
	_states[id] = {"source": weakref(source), "proxy": proxy, "kind": kind,
		"visibility_layer": source.visibility_layer, "source_path": str(source.get_path())}
	# Culling only; source visible/texture/material/process remain original.
	source.visibility_layer = ORIGINAL_CULL_BIT
	_sync_proxy(_states[id])

func _normal_for_texture(texture: Texture2D) -> Texture2D:
	if texture == null:
		return null
	if texture is AtlasTexture:
		var parent_normal := _normal_for_texture(texture.atlas)
		if parent_normal == null:
			return null
		var atlas := AtlasTexture.new()
		atlas.atlas = parent_normal
		atlas.region = texture.region
		atlas.margin = texture.margin
		atlas.filter_clip = texture.filter_clip
		return atlas
	var path := texture.resource_path
	if _normal_cache.has(path):
		return _normal_cache[path]
	var entry: Variant = _mapping.get(path)
	var normal_path := ""
	if entry is String:
		normal_path = entry
	elif entry is Dictionary:
		normal_path = str(entry.get("normal", entry.get("normal_path", "")))
	if normal_path.is_empty() or not ResourceLoader.exists(normal_path):
		_missing_normals[path] = "manifest_or_derived_resource_missing"
		return null
	var normal := load(normal_path) as Texture2D
	if normal == null or normal.get_size() != texture.get_size():
		_missing_normals[path] = "derived_normal_dimensions_mismatch"
		return null
	_normal_cache[path] = normal
	return normal

func _canvas_for_texture(texture: Texture2D) -> CanvasTexture:
	if texture == null:
		return null
	var id := texture.get_instance_id()
	if _canvas_cache.has(id):
		return _canvas_cache[id]
	var normal := _normal_for_texture(texture)
	if normal == null:
		return null
	var canvas := CanvasTexture.new()
	canvas.diffuse_texture = texture
	canvas.normal_texture = normal
	canvas.specular_color = Color(0.10, 0.095, 0.085)
	canvas.specular_shininess = 8.0
	_canvas_cache[id] = canvas
	return canvas

func _effective_z(source: CanvasItem) -> int:
	var current: CanvasItem = source
	var total := current.z_index
	while current.z_as_relative and current.get_parent() is CanvasItem:
		current = current.get_parent() as CanvasItem
		total += current.z_index
	return clampi(total, -4096, 4095)

func _sync_proxy(state: Dictionary) -> void:
	var source := state.source.get_ref() as Node2D
	var proxy: Sprite2D = state.proxy
	if not is_instance_valid(source) or not is_instance_valid(proxy):
		return
	var canvas := _canvas_for_texture(_source_texture(source))
	if canvas == null:
		# Never leave a stale animation frame when another source atlas is not
		# present in this local area's derived manifest.
		source.visibility_layer = state.visibility_layer
		proxy.visible = false
		return
	source.visibility_layer = ORIGINAL_CULL_BIT
	proxy.texture = canvas
	proxy.global_transform = source.global_transform
	proxy.centered = source.centered
	proxy.offset = source.offset
	proxy.flip_h = source.flip_h
	proxy.flip_v = source.flip_v
	proxy.modulate = source.modulate
	proxy.self_modulate = source.self_modulate
	proxy.texture_filter = source.texture_filter
	proxy.texture_repeat = source.texture_repeat
	proxy.z_index = _effective_z(source)
	proxy.visible = source.is_visible_in_tree()
	if source is Sprite2D:
		proxy.region_enabled = source.region_enabled
		proxy.region_rect = source.region_rect
		proxy.region_filter_clip_enabled = source.region_filter_clip_enabled
		proxy.hframes = source.hframes
		proxy.vframes = source.vframes
		proxy.frame = source.frame

func _make_light_texture() -> void:
	var gradient := Gradient.new()
	gradient.offsets = PackedFloat32Array([0.0, 0.25, 0.6, 1.0])
	gradient.colors = PackedColorArray([Color.WHITE, Color(1, 1, 1, 0.88), Color(1, 1, 1, 0.36), Color(1, 1, 1, 0)])
	_light_texture = GradientTexture2D.new()
	_light_texture.width = 512
	_light_texture.height = 512
	_light_texture.gradient = gradient
	_light_texture.fill = GradientTexture2D.FILL_RADIAL
	_light_texture.fill_from = Vector2(0.5, 0.5)
	_light_texture.fill_to = Vector2(1.0, 0.5)

func _mount_lights() -> void:
	_make_light("NorthWestKey", _player.global_position + Vector2(-680, -520), 1850.0, KEY_COLOR, 0.90, 220.0, "view_key")
	_make_light("PlayerWarm", _player.global_position + Vector2(0, -8), 520.0, PLAYER_COLOR, 0.55, 110.0, "actual_player")
	var data: Dictionary = _world.get("map_data")
	for row in data.get("props", []):
		var id := str(row.get("id", ""))
		var label := id + " " + str(row.get("texture", ""))
		if not label.to_lower().contains("torch"):
			continue
		var source := _world.get_node_or_null(id) as Node2D
		if source != null and _selection_area.grow(450.0).has_point(source.global_position):
			_make_light("Torch_" + id, source.global_position, 450.0, TORCH_COLOR, 0.72, 90.0, "actual_authored_torch")
	var state: Node = _main.get("source_state")
	if is_instance_valid(state) and state.has_method("read_current_g"):
		var g: Variant = state.read_current_g()
		if g is Dictionary:
			for hole in g.get("spawnHoles", []):
				if not hole is Dictionary:
					continue
				var point := Vector2(float(hole.get("x", 0.0)), float(hole.get("y", 0.0)))
				if _selection_area.grow(280.0).has_point(point):
					_make_light("Hole_%02d" % _light_rows.size(), point, 280.0, HOLE_COLOR, 0.32, 45.0, "actual_g_spawn_hole")

func _make_light(node_name: String, point: Vector2, radius: float, tint: Color, strength: float, height: float, basis: String) -> void:
	var light := PointLight2D.new()
	light.name = node_name
	light.texture = _light_texture
	light.texture_scale = radius * 2.0 / 512.0
	light.color = tint
	light.energy = strength
	light.height = height
	light.range_item_cull_mask = ENHANCED_LIGHT_BIT
	light.shadow_item_cull_mask = ENHANCED_LIGHT_BIT
	light.range_z_min = -4096
	light.range_z_max = 4095
	light.range_layer_min = 0
	light.range_layer_max = 0
	light.shadow_enabled = true
	light.shadow_color = Color(0.015, 0.012, 0.01, 0.66)
	light.shadow_filter = Light2D.SHADOW_FILTER_PCF5
	light.shadow_filter_smooth = 2.5
	_proxy_root.add_child(light)
	light.global_position = point
	_light_rows.append({"name": node_name, "position": point, "radius": radius,
		"color": tint, "energy": strength, "height": height, "basis": basis,
		"normal_receiver_mask": ENHANCED_LIGHT_BIT, "shadow_enabled": true,
		"range_z": [-4096, 4095]})

func _mount_occluders() -> void:
	var data: Dictionary = _world.get("map_data")
	for row in data.get("prop_colliders", []):
		var at: Array = row.get("position", [])
		var radii: Array = row.get("radii", [])
		if at.size() != 2 or radii.size() != 2:
			continue
		var point := Vector2(float(at[0]), float(at[1]))
		if not _selection_area.has_point(point):
			continue
		var polygon := OccluderPolygon2D.new()
		var vertices := PackedVector2Array()
		for index in range(16):
			var angle := TAU * float(index) / 16.0
			vertices.append(Vector2(cos(angle) * float(radii[0]), sin(angle) * float(radii[1])))
		polygon.polygon = vertices
		polygon.closed = true
		var occluder := LightOccluder2D.new()
		occluder.name = "FootprintShadow_" + str(row.get("id", ""))
		occluder.occluder = polygon
		occluder.occluder_light_mask = ENHANCED_LIGHT_BIT
		occluder.sdf_collision = false
		_proxy_root.add_child(occluder)
		occluder.global_position = point
		_occluder_rows.append({"id": row.get("id"), "position": point,
			"radii": radii.duplicate(), "vertices": 16,
			"basis": "actual_map_prop_collider_ellipse_polygonized",
			"artwork_silhouette_measured": false, "collision_modified": false})

func _mount_post() -> void:
	_post_layer = CanvasLayer.new()
	_post_layer.name = "Look001FogAndGrade"
	_post_layer.layer = 6
	_main.add_child(_post_layer)
	var fog := _post_rect("Look001ContinuousFog", FOG_SHADER)
	(fog.material as ShaderMaterial).set_shader_parameter("fixed_time", FIXED_FOG_TIME)
	var size := _viewport.get_visible_rect().size
	(fog.material as ShaderMaterial).set_shader_parameter("aspect", size.x / size.y)
	var copy := BackBufferCopy.new()
	copy.name = "Look001GradeSource"
	copy.copy_mode = BackBufferCopy.COPY_MODE_VIEWPORT
	_post_layer.add_child(copy)
	_post_rect("Look001HellGrade", GRADE_SHADER)

func _post_rect(node_name: String, shader: Shader) -> ColorRect:
	var rect := ColorRect.new()
	rect.name = node_name
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var material := ShaderMaterial.new()
	material.shader = shader
	rect.material = material
	_post_layer.add_child(rect)
	rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	return rect

func _process(_delta: float) -> void:
	if not _ready or not is_instance_valid(_main) or not is_instance_valid(_proxy_root):
		return
	for state in _states.values():
		_sync_proxy(state)

func get_snapshot() -> Dictionary:
	var proxies: Array = []
	for state in _states.values():
		var source := state.source.get_ref() as Node2D
		var proxy: Sprite2D = state.proxy
		if not is_instance_valid(source) or not is_instance_valid(proxy):
			continue
		var texture := proxy.texture as CanvasTexture
		proxies.append({"source": state.source_path, "kind": state.kind,
			"source_texture_unchanged": texture != null and texture.diffuse_texture == _source_texture(source),
			"normal_bound": texture != null and texture.normal_texture != null,
			"source_visibility_layer_before": state.visibility_layer,
			"source_visibility_layer_now": source.visibility_layer,
			"source_visible_property": source.visible, "proxy_visible": proxy.visible,
			"transform_equal": source.global_transform == proxy.global_transform,
			"z_index": proxy.z_index, "light_mask": proxy.light_mask})
	return {"schema": SCHEMA, "ready": _ready, "reason": _reason,
		"selection_area_world": _selection_area, "view_margin": VIEW_MARGIN,
		"proxy_count": proxies.size(), "proxies": proxies,
		"missing_normal_resources": _missing_normals.duplicate(),
		"distinct_derived_normal_maps": _normal_cache.size(),
		"point_lights": _light_rows.duplicate(true), "occluders": _occluder_rows.duplicate(true),
		"shadow_shape_basis": "actual_prop_collision_footprints_16_vertex_ellipse_approximation",
		"artwork_silhouette_or_prop_height_measured": false,
		"ambient_color": AMBIENT_COLOR, "post_layer": 6, "hud_layer": 10,
		"fixed_fog_time": FIXED_FOG_TIME,
		"original_cull_bit": ORIGINAL_CULL_BIT, "enhanced_light_bit": ENHANCED_LIGHT_BIT,
		"viewport_cull_mask_before": _original_cull_mask,
		"viewport_cull_mask_now": _viewport.canvas_cull_mask if is_instance_valid(_viewport) else 0,
		"source_visible_material_texture_modified": false,
		"simulation_modified": false, "original_assets_modified": false,
		"visual_approval": "USER_COMPARISON_PENDING"}

func release() -> void:
	set_process(false)
	for state in _states.values():
		var source := state.source.get_ref() as Node2D
		if is_instance_valid(source):
			source.visibility_layer = state.visibility_layer
	if is_instance_valid(_viewport):
		_viewport.canvas_cull_mask = _original_cull_mask
	if is_instance_valid(_proxy_root):
		_proxy_root.free()
	if is_instance_valid(_post_layer):
		_post_layer.free()
	_states.clear()
	_normal_cache.clear()
	_canvas_cache.clear()
	_mapping.clear()
	_light_rows.clear()
	_occluder_rows.clear()
	_missing_normals.clear()
	_proxy_root = null
	_post_layer = null
	_light_texture = null
	_main = null
	_world = null
	_player = null
	_viewport = null
	_ready = false
	_reason = "released"

func _exit_tree() -> void:
	release()

func _reject(reason: String) -> Dictionary:
	_reason = reason
	return {"schema": SCHEMA, "ready": false, "reason": reason}
