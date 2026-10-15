extends SceneTree
## First caller check for map_resource/ground_surface.gd (headless, isolated).
## Run: godot4 --headless --script res://port_modules/map_resource/test_ground_surface.gd
## Verifies the two-pass soil->litter draw binding + draw/update/terminate on real
## CanvasItems. No original asset load (textures null), no rendering, no scene/
## geometry/nav/camera, no public play. Independent of soil/litter unit tests.

const Surface := preload("res://port_modules/map_resource/ground_surface.gd")

var _f: Array[String] = []

func _ck(c: bool, l: String) -> void:
	if not c:
		_f.append(l)

func _initialize() -> void:
	var s = Surface.new()

	# 1) build() pass contract (raw specs, order, z)
	var b := s.build()
	_ck((b["passes"] as Array).size() == 2, "2 passes")
	_ck(b["pass_order"][0] == "ch1_1_floor_soil" and b["pass_order"][1] == "ch1_1_floor_litter", "pass order soil->litter")
	_ck(b["world_size"] == 8000.0, "world 8000")
	var p0 := b["passes"][0] as Dictionary
	var p1 := b["passes"][1] as Dictionary
	_ck(p0["spec"]["brightness"] == 0.85 and p0["spec"]["tile_world_size"] == 1024.0, "soil spec raw (0.85/1024)")
	_ck(p1["spec"]["brightness"] == 0.76 and p1["spec"]["tile_world_size"] == 512.0, "litter spec raw (0.76/512)")
	_ck(p1["spec"]["overlay_alpha"] == 0.7, "litter overlay_alpha 0.7")
	_ck(p0["z_index"] == 0 and p1["z_index"] == 1, "pass z order 0<1 (litter over soil)")

	# 2) bind_textures headless (null textures) -> 2 CanvasItem passes
	s.bind_textures(null, null)
	var snap := s.snapshot()
	_ck(snap["bound"] == true, "bound")
	_ck(snap["child_count"] == 2, "2 CanvasItem children")
	_ck(snap["soil_z"] == 0 and snap["litter_z"] == 1, "canvasitem z order 0<1")
	_ck(snap["soil_is_shader"] and snap["litter_is_shader"], "both ShaderMaterial bound")

	# 3) update idempotent, 4) terminate frees
	s.update_surface(null, null)
	_ck(s.snapshot()["child_count"] == 2, "update keeps 2 children")
	s.terminate()
	var snap2 := s.snapshot()
	_ck(snap2["bound"] == false and snap2["child_count"] == 0, "terminate frees children")

	s.free()
	if _f.is_empty():
		print("MAP_GROUND_SURFACE_TEST: PASS (12 groups)")
		quit(0)
	else:
		print("MAP_GROUND_SURFACE_TEST: FAIL -> ", _f)
		quit(1)
