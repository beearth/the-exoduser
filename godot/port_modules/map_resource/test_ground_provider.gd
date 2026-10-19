extends SceneTree
## First caller check for map_resource/ground_provider.gd (headless, isolated).
## Run: godot4 --headless --script res://port_modules/map_resource/test_ground_provider.gd
## Verifies the texture provider (source->target map, load/cache, canonical-missing
## gap) and the owner-command wiring into ground_surface. No original asset copy/
## import/mint; soil/litter/ground_surface success suites are NOT re-run.

const Provider := preload("res://port_modules/map_resource/ground_provider.gd")
const Surface := preload("res://port_modules/map_resource/ground_surface.gd")

var _f: Array[String] = []

func _ck(c: bool, l: String) -> void:
	if not c:
		_f.append(l)

func _initialize() -> void:
	var prov = Provider.new()

	# 1) source->target proposal map (R source -> res:// target), not minted
	var st := prov.source_to_target()
	_ck(st.has("soil") and st.has("litter"), "source_to_target has soil+litter")
	_ck(st["soil"]["r_source"] == "assets/map/ch1/ground_dark_soil.png", "soil r_source")
	_ck(st["soil"]["res_target"] == "res://assets/map/ch1/ground_dark_soil.png", "soil res_target")
	_ck(st["litter"]["r_source"] == "assets/map/ch1/production_finish/materials/forest_moss_litter.png", "litter r_source")
	_ck(st["litter"]["res_target"] == "res://assets/map/ch1/materials/forest_moss_litter.png", "litter res_target")

	# 2) real-load state: product resources are currently absent -> null, not minted
	_ck(prov.load_soil() == null, "soil not yet in product (null, no mint)")
	_ck(prov.load_litter() == null, "litter not yet in product (null, no mint)")
	_ck(prov.is_available("soil") == false and prov.is_available("litter") == false, "is_available false")

	# 3) gap reports exact source->target for the missing canonicals
	var g := prov.gap()
	_ck(g.size() == 2, "gap lists 2 missing")
	for e in g:
		_ck(String(e["status"]).find("canonical-missing") != -1, "gap status canonical-missing")
		_ck(e.has("r_source") and e.has("res_target"), "gap has source+target")

	# 4) owner-command: apply_to_surface wires provider into ground_surface
	var surf = Surface.new()
	var applied := prov.apply_to_surface(surf)
	_ck(applied["real_load"] == false, "apply real_load == false (textures missing)")
	_ck(applied["soil_bound"] == false and applied["litter_bound"] == false, "nothing bound (missing)")
	_ck((applied["gap"] as Array).size() == 2, "apply carries gap")
	var snap := surf.snapshot()
	_ck(snap["child_count"] == 2, "surface still built 2 passes (null textures)")
	_ck(snap["bound"] == true, "surface bound (structural)")

	# 5) refresh path runs without crash and reports missing
	var refreshed := prov.refresh_surface(surf)
	_ck(refreshed["real_load"] == false, "refresh real_load == false")

	surf.terminate()
	surf.free()
	if _f.is_empty():
		print("MAP_GROUND_PROVIDER_TEST: PASS (16 groups)")
		quit(0)
	else:
		print("MAP_GROUND_PROVIDER_TEST: FAIL -> ", _f)
		quit(1)
