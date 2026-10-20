extends SceneTree
## CH1-01 pure source snapshot validation. No Main/World construction or user:// IO.
const Producer = preload("res://port_modules/ch1_map_source/producer.gd")
const ISOLATED_DIRECTORY := "EXODUSER-ch1-01-Isolated-20261020"
var checks := 0
var failed: Array[String] = []

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failed.append(label)
		printerr("ASSERT_FAIL ", label)

func reject(raw: Variant, label: String) -> void:
	var result: Dictionary = Producer.read_area(raw)
	check(result.status == "NOT_READY" and not result.has("value") and is_same(result.raw,raw), label)

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name","") == ISOLATED_DIRECTORY, "actual_isolated_userdir")
	var raw: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/ch1_map_source/si0.json"))
	var existing: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/map.json"))
	var before := JSON.stringify(raw)
	var existing_before := JSON.stringify(existing)
	var result: Dictionary = Producer.read_area(raw)
	check(result.status == "READY" and is_same(result.value,raw), "same_snapshot_reference")
	check(result.scope == "source_snapshot_only" and not result.runtime_bound and not result.visual_verified, "partial_scope")
	check(Producer.validate_area(raw).status == "READY", "validate_public_api")
	check(raw.tiles.size() == 40000 and raw.grid == {"width":200.0,"height":200.0,"tile_size":40.0}, "source_grid_16631")
	var counts := [0,0,0,0,0]
	for tile in raw.tiles:
		counts[int(tile)] += 1
	check(counts == [19958,19755,3,3,281], "native_tile_counts_30218_30694")
	check(raw.runtime_tile_sha256 == "655b5c872be2c42c1f202d14728b1c9ee8741eff5bf1a6655461d113564fc0aa", "native_tile_hash")
	check(raw.start_world == [4020.0,7420.0] and raw.start_tile == [100.0,185.0], "source_start_31564_31566")
	check(raw.boss_gate.map(func(e): return [e.x,e.y]) == [[99.0,5.0],[100.0,5.0],[101.0,5.0]], "north_gate_30021")
	check(raw.exits.map(func(e): return [e.x,e.y]) == [[99.0,7.0],[100.0,7.0],[101.0,7.0]], "north_exit_30021")
	check(raw.rooms.size() == 6 and raw.hand_props_raw.size() == 36, "source_rooms_and_hands")
	check(raw.initial_obj_meta.size() == 77 and raw.ch1_deco_raw.size() == 110, "raw_catalog_counts")
	check(raw.initial_obj_meta.pit_poison == {"sz":200.0,"collision":true,"colW":80.0,"colH":58.0,"colOy":7.0}, "pit_protected_18407")
	check(raw.spawn_holes_final.size() == 14 and raw.total_spawned == 168, "source_holes_and_total_30625")
	check(raw.region_totals == [23.0,60.0,53.0,32.0], "source_region_totals_60709")
	var coordinates: Array = raw.spawn_holes_final.map(func(h): return [h.x,h.y])
	check(coordinates == [[2980.0,6740.0],[5620.0,6420.0],[2220.0,5620.0],[5620.0,5220.0],
		[3220.0,4220.0],[5220.0,3220.0],[2420.0,2420.0],[5620.0,1820.0],[4020.0,1020.0],
		[3780.0,6220.0],[3060.0,3420.0],[4820.0,1900.0],[4020.0,5540.0],[4020.0,4140.0]], "source_hole_order_and_coordinates")
	check(raw.generation.random_draws == 14 and raw.undefined_paths.is_empty(), "seeded_timer_boundary_and_no_undefined")
	check(raw.source.symbols.genFromTemplate.line == 30218 and raw.source.symbols.genFromTemplate.end == 30694 \
		and raw.source.symbols._regionInit.line == 60697, "actual_ast_line_evidence")
	check(raw.scope.prop_colliders == "NOT_OBSERVED" and raw.scope.effective_prop_positions == "NOT_OBSERVED", "raw_is_not_final_map_objects")
	for i in 2:
		check(Producer.read_area(raw).status == "READY", "repeat_read_%d" % i)
	check(JSON.stringify(raw) == before, "read_does_not_mutate_input")
	check(is_same(Producer.read_area(raw).value.tiles,raw.tiles), "nested_array_reference_preserved")

	for value in [null, [], true, 0, "snapshot"]:
		reject(value,"unsupported_raw_type_"+str(typeof(value)))
	for field in ["stage","source","grid","tiles","initial_obj_meta","scope","generation","undefined_paths","chapter_stages"]:
		var missing := raw.duplicate(true)
		missing.erase(field)
		reject(missing,"missing_"+field)
	var other_stage := raw.duplicate(true)
	other_stage.stage = 1
	reject(other_stage,"stage1_not_supported")
	var short_tiles := raw.duplicate(true)
	short_tiles.tiles.pop_back()
	reject(short_tiles,"tiles39999")
	var bad_tile := raw.duplicate(true)
	bad_tile.tiles[0] = true
	reject(bad_tile,"boolean_is_not_tile_number")
	var moved_tile := raw.duplicate(true)
	var floor_index: int = moved_tile.tiles.find(0.0)
	var wall_index: int = moved_tile.tiles.find(1.0)
	moved_tile.tiles[floor_index] = 1.0
	moved_tile.tiles[wall_index] = 0.0
	reject(moved_tile,"equal_counts_but_changed_tile_hash")
	var total := raw.duplicate(true)
	total.total_spawned = 167
	reject(total,"total167")
	var region_sum := raw.duplicate(true)
	region_sum.spawn_holes_final[0].x = 6000
	reject(region_sum,"changed_quadrant_sum")
	var missing_sha := raw.duplicate(true)
	missing_sha.source.erase("game_sha256")
	reject(missing_sha,"missing_source_sha")
	var bad_pin := raw.duplicate(true)
	bad_pin.source.game_sha256 = "a".repeat(64)
	reject(bad_pin,"unknown_source_pin")
	var missing_symbol := raw.duplicate(true)
	missing_symbol.source.symbols.erase("genFromTemplate")
	reject(missing_symbol,"missing_source_function_evidence")
	var missing_draws := raw.duplicate(true)
	missing_draws.generation.erase("random_draws")
	reject(missing_draws,"missing_rng_consumption_evidence")
	var missing_environment := raw.duplicate(true)
	missing_environment.environment_refs[0].erase("file")
	reject(missing_environment,"missing_environment_file")
	var mismatched_environment := raw.duplicate(true)
	mismatched_environment.environment_refs[0].sha256 = "a".repeat(64)
	reject(mismatched_environment,"environment_hash_disagrees_with_source_files")
	var bad_pit := raw.duplicate(true)
	bad_pit.initial_obj_meta.pit_poison.colW = 81
	reject(bad_pit,"pit_contract_cannot_be_adjusted")
	var false_scope := raw.duplicate(true)
	false_scope.scope.runtime_bound = true
	reject(false_scope,"runtime_completion_claim_rejected")
	var null_carrier := raw.duplicate(true)
	null_carrier.initial_obj_meta.pit_poison.colW = null
	null_carrier.undefined_paths.append("/initial_obj_meta/pit_poison/colW")
	reject(null_carrier,"null_or_undefined_is_not_native_number")

	var comparison: Dictionary = Producer.compare_stage0_map(raw,existing)
	check(comparison.status == "READY" and comparison.differences.size() == 4, "existing_tree_file_differences_only")
	check(comparison.differences.map(func(e):return e.id) == ["m_ctree17","m_ctree18","m_ctree19","m_ctree20"], "four_changed_tree_ids")
	check(comparison.differences.all(func(e):return e.field == "ch1_deco_raw.file"), "tiles_hands_not_changed")
	check(not comparison.full_map_equal and not comparison.matches_observed_fields, "partial_comparison_never_full_parity")
	check(comparison.unobserved_fields.has("prop_colliders") and comparison.unobserved_fields.has("effective_prop_positions"), "unobserved_comparison_fields")
	var altered := existing.duplicate(true)
	altered.tiles[0] = 0
	altered.props[0].authored_tile[0] = 85
	var changed: Dictionary = Producer.compare_stage0_map(raw,altered)
	check(changed.differences.any(func(e):return e.field == "tiles") and changed.differences.any(func(e):return e.field == "hand_props_raw.authored_tile"), "real_tile_and_authored_placement_differences")
	var not_observed := existing.duplicate(true)
	not_observed.prop_colliders = []
	not_observed.props[0].position = [1,1]
	var untouched_scope: Dictionary = Producer.compare_stage0_map(raw,not_observed)
	check(untouched_scope.differences == comparison.differences and not untouched_scope.full_map_equal, "unobserved_fields_are_not_silently_compared")
	var invalid_existing: Dictionary = Producer.compare_stage0_map(raw,{})
	check(invalid_existing.status == "NOT_READY" and not invalid_existing.has("value"), "missing_existing_map_not_zero")
	check(JSON.stringify(raw) == before and JSON.stringify(existing) == existing_before, "compare_does_not_write_inputs")
	check(root.get_child_count() == 0, "no_Main_or_World_boot")
	print("P3004A_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed,
		"comparison":comparison,"main_boots":0,"user_save_io":0,"isolation_label":ISOLATED_DIRECTORY,
		"snapshot_only":true,"visual_verified":false}))
	quit(0 if failed.is_empty() else 1)
