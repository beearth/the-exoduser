extends SceneTree
## First caller check for map_resource/producer.gd (headless, isolated).
## Run (requires a Godot 4 binary, not provided in this port session):
##   godot4 --headless --script res://port_modules/map_resource/test_producer.gd
## Verifies raw-value preservation and material construction. No original asset
## load, no scene/geometry/nav/camera, no rendering, no public play.

const Producer := preload("res://port_modules/map_resource/producer.gd")

var _failures: Array[String] = []

func _check(cond: bool, label: String) -> void:
	if not cond:
		_failures.append(label)

func _initialize() -> void:
	var p := Producer.new()

	# 1) spec carries the raw HTML values verbatim
	var spec := p.build_soil_spec()
	_check(spec["brightness"] == 0.85, "spec.brightness == 0.85")
	_check(spec["saturation"] == 0.48, "spec.saturation == 0.48")
	_check(spec["tile_world_size"] == 1024.0, "spec.tile_world_size == 1024")
	_check(spec["world_size"] == 8000.0, "spec.world_size == 8000")
	_check(spec["tile_size_px"] == 40.0, "spec.tile_size_px == 40")
	_check(spec["file"] == "ground_dark_soil.png", "spec.file == ground_dark_soil.png")
	_check(spec["canonical_png_r"] == "assets/map/ch1/ground_dark_soil.png", "spec.canonical_png_r")
	_check(spec["repeat"] == true, "spec.repeat == true")
	_check(spec["raw_preserved"] == true, "spec.raw_preserved")

	# 2) material constructs headlessly (texture null allowed) and carries uniforms
	var mat := p.build_floor_material(null)
	_check(mat is ShaderMaterial, "material is ShaderMaterial")
	_check(mat != null and mat.shader != null, "material.shader present")
	if mat != null and mat.shader != null:
		_check(mat.shader.code.find("repeat_enable") != -1, "shader: texture repeat enabled")
		_check(mat.shader.code.find("mix(vec3(luma)") != -1, "shader: saturation mix present")
		_check(mat.shader.code.find("c.rgb *= brightness") != -1, "shader: brightness multiply present")
	if mat != null:
		_check(mat.get_shader_parameter("brightness") == 0.85, "uniform brightness == 0.85")
		_check(mat.get_shader_parameter("saturation") == 0.48, "uniform saturation == 0.48")
		_check(mat.get_shader_parameter("tile_world") == 1024.0, "uniform tile_world == 1024")
		_check(mat.get_shader_parameter("world_size") == 8000.0, "uniform world_size == 8000")

	# 3) expected_uniforms matches the applied material uniforms (consistency)
	var exp := p.expected_uniforms()
	for k in exp.keys():
		_check(mat.get_shader_parameter(k) == exp[k], "expected_uniforms[%s] matches material" % k)

	# 4) isolation: source pointer recorded; no original write path exercised
	_check(spec["source_pointer"].begins_with("R/assets/map/ch1/"), "source_pointer is R read-only ref")

	if _failures.is_empty():
		print("MAP_RESOURCE_TEST: PASS (13 groups)")
		quit(0)
	else:
		print("MAP_RESOURCE_TEST: FAIL -> ", _failures)
		quit(1)
