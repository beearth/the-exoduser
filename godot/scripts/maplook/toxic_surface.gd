extends Node2D
## Read-only source sprites; four separate, alpha-clipped surface overlays.
const SURFACE_SHADER := preload("res://assets/vfx/maplook_toxic_surface.gdshader")
const VISUAL_SEED := 20261020
const TARGETS := {"m_c1pool": 0, "pit_poison": 1, "m_c1gtoxic": 2, "m_c1gtoxicf": 2}
const BUBBLES := 8
var _records: Array[Dictionary] = []
var _clock := 0.0

static func install(world: Node2D, map_data: Dictionary, _player: Node2D) -> Node2D:
	if not is_instance_valid(world):
		return null
	var existing := world.get_node_or_null("MaplookToxicSurface")
	if existing != null:
		return existing
	var layer: Node2D = load("res://scripts/maplook/toxic_surface.gd").new()
	layer.name = "MaplookToxicSurface"
	world.add_child(layer)
	for prop in map_data.get("props", []):
		var id: String = str(prop.get("id", ""))
		if not TARGETS.has(id):
			continue
		var source := world.get_node_or_null(NodePath(id)) as Sprite2D
		if source != null and source.texture != null:
			layer._mount(source, id, TARGETS[id])
	return layer

func _mount(source: Sprite2D, id: String, kind: int) -> void:
	# All randomness belongs to this instance/id; never randf()/seed() globally.
	var random := RandomNumberGenerator.new()
	random.seed = VISUAL_SEED + id.hash()
	var phase := random.randf_range(0.0, TAU)
	var bubbles := PackedVector4Array()
	var image := source.texture.get_image()
	for i in BUBBLES:
		var uv := Vector2(0.5, 0.5)
		for attempt in 128:
			var candidate := Vector2(random.randf_range(0.23, 0.77), random.randf_range(0.28, 0.72))
			var color := image.get_pixel(mini(int(candidate.x * image.get_width()), image.get_width() - 1), mini(int(candidate.y * image.get_height()), image.get_height() - 1))
			if color.a > 0.95 and color.g > maxf(color.r * 1.04, color.b * 1.04):
				uv = candidate
				break
		bubbles.append(Vector4(uv.x, uv.y, random.randf_range(0.006, 0.014), random.randf()))
	var overlay := Sprite2D.new()
	overlay.name = id + "_ToxicSurface"
	overlay.texture = source.texture
	overlay.transform = source.transform
	overlay.centered = source.centered
	overlay.offset = source.offset
	overlay.flip_h = source.flip_h
	overlay.flip_v = source.flip_v
	overlay.region_enabled = source.region_enabled
	overlay.region_rect = source.region_rect
	overlay.hframes = source.hframes
	overlay.vframes = source.vframes
	overlay.frame = source.frame
	overlay.texture_filter = source.texture_filter
	overlay.z_as_relative = false
	overlay.z_index = source.z_index
	overlay.modulate = source.modulate
	var material := ShaderMaterial.new()
	material.shader = SURFACE_SHADER
	material.set_shader_parameter("surface_kind", kind)
	material.set_shader_parameter("surface_phase", phase)
	material.set_shader_parameter("bubble_sites", bubbles)
	material.set_shader_parameter("visual_time", _clock)
	overlay.material = material
	add_child(overlay)
	_records.append({"id": id, "kind": kind, "source": weakref(source), "overlay": overlay,
		"phase": phase, "bubble_sites": bubbles})

func _process(delta: float) -> void:
	_clock += delta
	for record in _records:
		var source: Sprite2D = record.source.get_ref()
		var overlay: Sprite2D = record.overlay
		# Hide only our layer if its original leaves; never repair/change originals.
		overlay.visible = is_instance_valid(source) and source.is_visible_in_tree()
		if not is_instance_valid(source):
			continue
		overlay.transform = source.transform
		overlay.modulate = source.modulate
		overlay.z_index = source.z_index
		overlay.material.set_shader_parameter("visual_time", _clock)

func get_snapshot() -> Dictionary:
	var surfaces: Array = []
	for record in _records:
		var overlay: Sprite2D = record.overlay
		var sites: Array = []
		for site in record.bubble_sites:
			sites.append([site.x, site.y, site.z, site.w])
		surfaces.append({"id": record.id, "kind": record.kind,
			"position": [overlay.position.x, overlay.position.y], "z": overlay.z_index,
			"texture": overlay.texture.resource_path, "phase": record.phase, "bubble_sites": sites})
	return {"visual_seed": VISUAL_SEED, "clock": _clock, "surfaces": surfaces,
		"mask": "original_texture_alpha_times_liquid_mask", "blend": "unshaded_mix",
		"light_nodes": 0, "gameplay_writes": false}
