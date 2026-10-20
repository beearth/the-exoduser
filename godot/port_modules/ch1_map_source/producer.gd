extends RefCounted
## CH1-01: source snapshot only. No Main, IO, asset loads, writes, clock or RNG.
## Source base 284d7faf / game.html SHA below. Source expressions stay in the new exporter.
## game.html 30218-30694: tiles/rooms/gates/holes; 31564-31566: START;
## 31029-31030: source count formula; 60709-60710: quadrant totals.
const SCHEMA := "exoduser.ch1-area-source.v1"
const SOURCE_SCOPE := "source_snapshot_only"
const GAME_SHA := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const TILE_SHA := "655b5c872be2c42c1f202d14728b1c9ee8741eff5bf1a6655461d113564fc0aa"
const SOURCE_FILES := ["game.html", "maps_data.js", "assets/map/ch1/production_finish/layout.js"]
const SOURCE_SYMBOLS := ["T", "CHAPTER_STAGES", "_MAP_COMPOSE.0", "_OBJ_META", "_CH_DECO.0",
	"_cloneField11", "_getFixedMapForStage", "genFromTemplate", "_cacheExitCenter",
	"initStage.start_position", "_spawnHoleCount", "_regionInit"]

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _integer(value: Variant) -> bool:
	return _number(value) and float(value) == floor(float(value))

static func _equal_numbers(values: Variant, expected: Array) -> bool:
	if not values is Array or values.size() != expected.size():
		return false
	for i in expected.size():
		if not _number(values[i]) or float(values[i]) != float(expected[i]):
			return false
	return true

static func _hex(value: Variant, size: int) -> bool:
	if not value is String or value.length() != size:
		return false
	for character in value:
		if not character in "0123456789abcdef":
			return false
	return true

static func _not_ready(raw: Variant, reason: String) -> Dictionary:
	return {"status":"NOT_READY", "reason":reason, "raw":raw, "scope":SOURCE_SCOPE}

static func validate_area(raw: Variant) -> Dictionary:
	var reason := _validation_error(raw)
	if not reason.is_empty():
		return _not_ready(raw, reason)
	return {"status":"READY", "value":raw, "scope":SOURCE_SCOPE,
		"provenance_validation":"declared source pin and record formats; no file reads",
		"runtime_bound":false, "visual_verified":false}

static func read_area(raw: Variant) -> Dictionary:
	return validate_area(raw)

static func _validation_error(raw: Variant) -> String:
	if not raw is Dictionary:
		return "snapshot_not_dictionary"
	if raw.get("schema") != SCHEMA:
		return "unsupported_schema"
	if not _integer(raw.get("stage")) or raw.stage != 0:
		return "unsupported_or_missing_stage"
	var grid: Variant = raw.get("grid")
	if not grid is Dictionary:
		return "grid_missing"
	for field in ["width", "height", "tile_size"]:
		if not _integer(grid.get(field)) or grid[field] != (40 if field == "tile_size" else 200):
			return "grid_mismatch"
	var source: Variant = raw.get("source")
	if not source is Dictionary or not _hex(source.get("main_sha"), 40) or source.get("game_sha256") != GAME_SHA:
		return "source_provenance_missing_or_unsupported"
	var files: Variant = source.get("files")
	if not files is Dictionary:
		return "source_files_missing"
	for file in SOURCE_FILES:
		if not _hex(files.get(file), 64):
			return "source_file_hash_missing"
	if files["game.html"] != GAME_SHA:
		return "source_file_pin_mismatch"
	if not source.get("selection") is String or source.selection.is_empty():
		return "source_selection_missing"
	var symbols: Variant = source.get("symbols")
	if not symbols is Dictionary:
		return "source_symbols_missing"
	for name in SOURCE_SYMBOLS:
		var symbol: Variant = symbols.get(name)
		if not symbol is Dictionary or symbol.get("file") != "game.html" or not _hex(symbol.get("sha256"), 64):
			return "source_symbol_provenance_missing"
		if not _integer(symbol.get("line")) or not _integer(symbol.get("end")) or symbol.line < 1 or symbol.end < symbol.line:
			return "source_symbol_range_invalid"
	if not _equal_numbers(raw.get("start_tile"), [100,185]) or not _equal_numbers(raw.get("start_world"), [4020,7420]):
		return "source_start_mismatch"
	var chapters: Variant = raw.get("chapter_stages")
	if not chapters is Array or chapters.size() != 7:
		return "source_chapter_stages_missing"
	var chapter_counts := [4,6,4,7,5,6,3]
	for i in chapters.size():
		if not chapters[i] is Dictionary or not _integer(chapters[i].get("stages")) or chapters[i].stages != chapter_counts[i]:
			return "source_chapter_stages_mismatch"
	if not _equal_numbers(raw.get("exit_center_tile"), [100,7]):
		return "source_exit_center_mismatch"
	for field in ["boss_gate", "exits"]:
		var entries: Variant = raw.get(field)
		if not entries is Array or entries.size() != 3:
			return "source_gate_or_exit_mismatch"
		for i in 3:
			if not entries[i] is Dictionary or not _number(entries[i].get("x")) or not _number(entries[i].get("y")):
				return "source_gate_or_exit_mismatch"
			if entries[i].x != 99+i or entries[i].y != (5 if field == "boss_gate" else 7):
				return "source_gate_or_exit_mismatch"
	var rooms: Variant = raw.get("rooms")
	if not rooms is Array or rooms.size() != 6:
		return "source_rooms_missing"
	var centers := [[100,185],[100,155],[100,120],[80,85],[120,50],[100,18]]
	for i in rooms.size():
		if not rooms[i] is Dictionary or not _equal_numbers([rooms[i].get("cx"),rooms[i].get("cy")],centers[i]):
			return "source_room_centers_mismatch"
	var meta: Variant = raw.get("initial_obj_meta")
	var deco: Variant = raw.get("ch1_deco_raw")
	var hands: Variant = raw.get("hand_props_raw")
	if not meta is Dictionary or meta.size() != 77 or not deco is Array or deco.size() != 110 or not hands is Array or hands.size() != 36:
		return "source_raw_catalog_counts_mismatch"
	for key in meta:
		if not key is String or not meta[key] is Dictionary:
			return "source_initial_meta_invalid"
	var pit: Variant = meta.get("pit_poison")
	if not pit is Dictionary or pit.size() != 5 or pit.get("collision") != true or not _equal_numbers(
			[pit.get("sz"),pit.get("colW"),pit.get("colH"),pit.get("colOy")],[200,80,58,7]):
		return "protected_pit_source_mismatch"
	var deco_ids := {}
	for entry in deco:
		if not entry is Dictionary or not entry.get("id") is String or not entry.get("file") is String or deco_ids.has(entry.id):
			return "source_deco_invalid"
		deco_ids[entry.id] = true
	for hand in hands:
		if not hand is Dictionary or not hand.get("id") is String or not _integer(hand.get("x")) or not _integer(hand.get("y")):
			return "source_hand_invalid"
		if hand.x < 0 or hand.y < 0 or hand.x >= 200 or hand.y >= 200:
			return "source_hand_outside_grid"
		if hand.has("scale") and (not _number(hand.scale) or hand.scale <= 0):
			return "source_hand_scale_invalid"
	if not _equal_numbers(raw.get("region_totals"), [23,60,53,32]) or not _integer(raw.get("total_spawned")) or raw.total_spawned != 168:
		return "source_total_mismatch"
	var holes: Variant = raw.get("spawn_holes_final")
	if not holes is Array or holes.size() != 14:
		return "source_holes_missing"
	var regions := [0,0,0,0]
	var total := 0
	for hole in holes:
		if not hole is Dictionary:
			return "source_hole_invalid"
		for field in ["x", "y", "size", "timer", "room", "count"]:
			if not _number(hole.get(field)):
				return "source_hole_field_invalid"
		if hole.x < 0 or hole.y < 0 or hole.x >= 8000 or hole.y >= 8000 or hole.size <= 0 or not _integer(hole.room):
			return "source_hole_outside_scope"
		# game.html:31029-31030, unchanged double ceil; validators do not advance P3.
		var base := 50 if hole.size <= 0.3 else 100
		var count := int(ceil(ceil(base*0.5)*0.3))
		if hole.count != count or hole.timer < 600 or hole.timer >= 660:
			return "source_hole_count_or_timer_mismatch"
		total += count
		var index := (0 if hole.y/40.0 < 100 else 2) + (0 if hole.x/40.0 < 100 else 1)
		regions[index] += count
	if total != raw.total_spawned or not _equal_numbers(raw.region_totals, regions):
		return "source_region_sum_mismatch"
	var scope: Variant = raw.get("scope")
	if not scope is Dictionary or scope.get("runtime_bound") != false or scope.get("visual_verified") != false \
			or not _number(scope.get("save_access")) or scope.save_access != 0 or scope.get("init_map_objects_executed") != false:
		return "source_scope_mismatch"
	for field in ["final_map_objects", "effective_prop_positions", "prop_colliders"]:
		if scope.get(field) != "NOT_OBSERVED":
			return "unsupported_runtime_claim"
	var undefined_paths: Variant = raw.get("undefined_paths")
	# This approved raw-literal source has no present-undefined fields. Missing != null.
	if not undefined_paths is Array or not undefined_paths.is_empty():
		return "unsupported_undefined_carrier"
	var environment: Variant = raw.get("environment_refs")
	if not environment is Array or environment.size() != 10:
		return "source_environment_refs_missing"
	for entry in environment:
		if not entry is Dictionary or not entry.get("src") is String or not entry.get("file") is String \
				or not _integer(entry.get("line")) or entry.line < 1 or not _hex(entry.get("sha256"),64):
			return "source_environment_ref_invalid"
		if not files.has(entry.file) or files[entry.file] != entry.sha256:
			return "source_environment_hash_mismatch"
	var generation: Variant = raw.get("generation")
	if not generation is Dictionary or not _integer(generation.get("seed")) or generation.seed < 0 or generation.seed > 4294967295:
		return "source_generation_missing"
	if not _integer(generation.get("random_draws")) or generation.random_draws != 14 \
			or not _integer(generation.get("random_final_state")) or generation.random_final_state < 0 or generation.random_final_state > 4294967295 \
			or generation.get("random_algorithm") != "LCG uint32: imul(1664525)+1013904223; /4294967296" \
			or generation.get("timer_basis") != "seeded source VM observation only; not browser boot RNG":
		return "source_generation_evidence_missing"
	var tiles: Variant = raw.get("tiles")
	if not tiles is Array or tiles.size() != 40000:
		return "source_tiles_incomplete"
	var bytes := PackedByteArray()
	bytes.resize(40000)
	var counts := [0,0,0,0,0]
	for i in tiles.size():
		if not _integer(tiles[i]) or tiles[i] < 0 or tiles[i] > 4:
			return "source_tile_invalid"
		var value := int(tiles[i])
		bytes[i] = value
		counts[value] += 1
	if counts != [19958,19755,3,3,281]:
		return "source_tile_counts_mismatch"
	var hash := HashingContext.new()
	hash.start(HashingContext.HASH_SHA256)
	hash.update(bytes)
	if raw.get("runtime_tile_sha256") != TILE_SHA or hash.finish().hex_encode() != TILE_SHA:
		return "source_tile_hash_mismatch"
	return ""

static func compare_stage0_map(raw: Dictionary, existing: Dictionary) -> Dictionary:
	var checked := validate_area(raw)
	if checked.status != "READY":
		return checked
	if existing.get("stage") != 0 or not existing.get("tiles") is Array or not existing.get("props") is Array:
		return _not_ready(raw,"existing_map_fields_missing")
	var differences: Array = []
	if not _equal_numbers(existing.tiles,raw.tiles):
		differences.append({"field":"tiles", "source_count":raw.tiles.size(), "existing_count":existing.tiles.size()})
	if existing.props.size() != raw.hand_props_raw.size():
		differences.append({"field":"hand_props_raw.count", "source":raw.hand_props_raw.size(), "existing":existing.props.size()})
	var files := {}
	for deco in raw.ch1_deco_raw:
		files[deco.id] = deco.file
	for i in mini(existing.props.size(),raw.hand_props_raw.size()):
		var hand: Dictionary = raw.hand_props_raw[i]
		var prop: Variant = existing.props[i]
		if not prop is Dictionary:
			return _not_ready(raw,"existing_prop_invalid")
		if prop.get("id") != hand.id:
			differences.append({"field":"hand_props_raw.id", "index":i,"source":hand.id,"existing":prop.get("id")})
		if not _equal_numbers(prop.get("authored_tile"),[hand.x,hand.y]):
			differences.append({"field":"hand_props_raw.authored_tile", "index":i,"source":[hand.x,hand.y],"existing":prop.get("authored_tile")})
		if files.has(hand.id):
			var meta: Variant = prop.get("metadata")
			if not meta is Dictionary:
				return _not_ready(raw,"existing_prop_metadata_missing")
			if meta.get("file") != files[hand.id]:
				differences.append({"field":"ch1_deco_raw.file","index":i,"id":hand.id,"source":files[hand.id],"existing":meta.get("file")})
	return {"status":"READY","scope":SOURCE_SCOPE,"differences":differences,
		"matches_observed_fields":differences.is_empty(),"full_map_equal":false,
		"compared_fields":["tiles","hand_props_raw.id","hand_props_raw.authored_tile","ch1_deco_raw.file"],
		"unobserved_fields":["prop_colliders","effective_prop_positions","final_map_objects","runtime","visual"]}
