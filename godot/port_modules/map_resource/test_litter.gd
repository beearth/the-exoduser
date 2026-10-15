extends SceneTree
## First caller check for map_resource/litter.gd (headless, isolated).
## Run: godot4 --headless --script res://port_modules/map_resource/test_litter.gd
## Verifies raw litter overlay values + material construction. No original asset
## load, no scene/geometry/nav/camera, no rendering, no public play. This test is
## independent of the soil producer test (soil groups are NOT re-run here).

const Litter := preload("res://port_modules/map_resource/litter.gd")

var _failures: Array[String] = []

func _check(cond: bool, label: String) -> void:
	if not cond:
		_failures.append(label)

func _initialize() -> void:
	var p := Litter.new()

	# 1) spec carries the raw HTML values verbatim
	var spec := p.build_litter_spec()
	_check(spec["kind"] == "overlay", "spec.kind == overlay")
	_check(spec["brightness"] == 0.76, "spec.brightness == 0.76")
	_check(spec["saturation"] == 0.55, "spec.saturation == 0.55")
	_check(spec["tile_world_size"] == 512.0, "spec.tile_world_size == 512")
	_check(spec["overlay_alpha"] == 0.7, "spec.overlay_alpha == 0.7")
	_check(spec["world_size"] == 8000.0, "spec.world_size == 8000")
	_check(spec["tile_size_px"] == 40.0, "spec.tile_size_px == 40")
	_check(spec["file"] == "materials/forest_moss_litter.png", "spec.file")
	_check(spec["canonical_png_r"] == "assets/map/ch1/production_finish/materials/forest_moss_litter.png", "spec.canonical_png_r")
	_check(spec["draw_over"] == "ch1_1_floor_soil", "spec.draw_over == soil")
	_check(spec["repeat"] == true and spec["raw_preserved"] == true, "spec.repeat & raw_preserved")

	# 2) material constructs headlessly and carries uniforms incl overlay alpha
	var mat := p.build_overlay_material(null)
	_check(mat is ShaderMaterial, "material is ShaderMaterial")
	_check(mat != null and mat.shader != null, "material.shader present")
	if mat != null and mat.shader != null:
		_check(mat.shader.code.find("repeat_enable") != -1, "shader: repeat enabled")
		_check(mat.shader.code.find("c.a *= overlay_alpha") != -1, "shader: overlay alpha multiply")
		_check(mat.shader.code.find("c.rgb *= brightness") != -1, "shader: brightness multiply")
	if mat != null:
		_check(mat.get_shader_parameter("brightness") == 0.76, "uniform brightness == 0.76")
		_check(mat.get_shader_parameter("saturation") == 0.55, "uniform saturation == 0.55")
		_check(mat.get_shader_parameter("tile_world") == 512.0, "uniform tile_world == 512")
		_check(mat.get_shader_parameter("overlay_alpha") == 0.7, "uniform overlay_alpha == 0.7")

	# 3) expected_uniforms consistency
	var exp := p.expected_uniforms()
	for k in exp.keys():
		_check(mat.get_shader_parameter(k) == exp[k], "expected_uniforms[%s] matches material" % k)

	# 4) isolation: R read-only source + alpha pointer recorded
	_check(spec["source_pointer"].begins_with("R/assets/map/ch1/"), "source_pointer R read-only")
	_check(String(spec["alpha_pointer"]).find("groundOpacityMultiplier") != -1, "alpha_pointer -> groundOpacityMultiplier")

	if _failures.is_empty():
		print("MAP_LITTER_TEST: PASS (16 groups)")
		quit(0)
	else:
		print("MAP_LITTER_TEST: FAIL -> ", _failures)
		quit(1)
