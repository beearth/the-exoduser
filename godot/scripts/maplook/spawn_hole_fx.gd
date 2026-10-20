extends Node2D

const HOLE_SHADER := preload("res://assets/vfx/maplook_spawn_hole.gdshader")
const VISUAL_SEED := 20261020
const FADE_SECONDS := 0.85
const IDLE_HZ := 0.38
const ACTIVE_HZ := 1.25
var _world: Node2D
var _records: Dictionary = {}
var _clock := 0.0
var _source_ready := false

static func install(world: Node2D, _map_data: Dictionary, _player: Node2D) -> Node2D:
	var overlay: Node2D = load("res://scripts/maplook/spawn_hole_fx.gd").new()
	overlay.name = "MaplookSpawnHoleFX"
	overlay._world = world
	world.add_child(overlay)
	overlay._process(0.0)
	return overlay

func _process(delta: float) -> void:
	_clock += delta
	var source: Node = _world.get_node_or_null("NativeSpawnHoleSystem") if is_instance_valid(_world) else null
	var state: Node = source.get("state") if is_instance_valid(source) else null
	var current: Variant = state.read_current_g() if is_instance_valid(state) and state.has_method("read_current_g") else null
	_source_ready = current is Dictionary and current.get("spawnHoles") is Array
	var present := {}
	if _source_ready:
		for hole in current["spawnHoles"]:
			if not hole is Dictionary or not hole.has_all(["x", "y", "size"]):
				continue
			var key := "%s:%s:%s" % [hole.get("_index", ""), hole["x"], hole["y"]]
			present[key] = true
			if not _records.has(key):
				_create_hole(key, hole)
			var record: Dictionary = _records[key]
			record["position"] = Vector2(float(hole["x"]), float(hole["y"]))
			record["diameter"] = 150.0 + float(hole["size"]) * 150.0
			record["triggered"] = hole.get("_triggered") == true
	for key in _records.keys():
		var record: Dictionary = _records[key]
		record["retiring"] = not present.has(key)
		if record["retiring"]:
			record["opacity"] = maxf(0.0, record["opacity"] - delta / FADE_SECONDS)
		else:
			record["opacity"] = minf(1.0, record["opacity"] + delta / FADE_SECONDS)
		record["activity"] = move_toward(record["activity"], 1.0 if record["triggered"] else 0.0, delta * 2.5)
		record["pulse_hz"] = lerpf(IDLE_HZ, ACTIVE_HZ, record["activity"])
		record["rim_gain"] = lerpf(0.65, 1.30, record["activity"])
		record["pulse_phase"] += delta * record["pulse_hz"] * TAU
		var mesh: MeshInstance2D = record["node"]
		if record["opacity"] <= 0.0:
			mesh.queue_free()
			_records.erase(key)
			continue
		mesh.global_position = record["position"]
		mesh.scale = Vector2.ONE * record["diameter"] * 1.65
		var shader: ShaderMaterial = mesh.material
		shader.set_shader_parameter("visual_time", _clock)
		shader.set_shader_parameter("pulse_phase", record["pulse_phase"])
		shader.set_shader_parameter("activity", record["activity"])
		shader.set_shader_parameter("rim_gain", record["rim_gain"])
		shader.set_shader_parameter("opacity", record["opacity"])

func _create_hole(key: String, hole: Dictionary) -> void:
	var random := RandomNumberGenerator.new()
	random.seed = VISUAL_SEED + key.hash()
	var phase := random.randf_range(0.0, TAU)
	var quad := QuadMesh.new()
	quad.size = Vector2.ONE
	var mesh := MeshInstance2D.new()
	mesh.name = "VoidOverlay"
	mesh.mesh = quad
	mesh.z_as_relative = false
	mesh.z_index = -2000
	mesh.light_mask = 1
	var shader := ShaderMaterial.new()
	shader.shader = HOLE_SHADER
	shader.set_shader_parameter("hole_phase", phase)
	mesh.material = shader
	add_child(mesh)
	_records[key] = {"node": mesh, "position": Vector2(float(hole["x"]), float(hole["y"])),
		"diameter": 150.0 + float(hole["size"]) * 150.0, "phase": phase, "pulse_phase": phase,
		"triggered": false, "activity": 0.0, "opacity": 1.0, "retiring": false,
		"pulse_hz": IDLE_HZ, "rim_gain": 0.65}

func get_snapshot() -> Dictionary:
	var holes: Array = []
	for key in _records:
		var record: Dictionary = _records[key]
		holes.append({"identity": key, "position": [record["position"].x, record["position"].y],
			"diameter": record["diameter"], "phase": record["phase"], "triggered": record["triggered"],
			"activity": record["activity"], "opacity": record["opacity"], "retiring": record["retiring"],
			"pulse_hz": record["pulse_hz"], "rim_gain": record["rim_gain"]})
	return {"source_ready": _source_ready, "holes": holes, "lighting": "unshaded_mix_no_light_nodes",
		"visual_seed": VISUAL_SEED, "fade_seconds": FADE_SECONDS}
