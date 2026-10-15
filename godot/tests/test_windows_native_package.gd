extends SceneTree
## Package-only fresh headless fixtures. Main is loaded, never instantiated.

const ICE = preload("res://scripts/enemy_projectile_ice.gd")
const CONFIG = "res://data/etype4_ice_soul_flame.json"
const FLIGHT = "res://assets/vfx/water_blue_projectile_sheet.png"
const IMPACT = "res://assets/vfx/Water_ImpactWater_Sheet.png"
const MISSING = "res://assets/vfx/__fdg_missing_package_water_fixture__.png"
const CASES = ["packed_water_consumers", "missing_water_consumer", "packed_runtime_dependencies", "packaged_icu_data"]
const DATA_PATHS = ["map", "combat", "enemy", "encounters", "etype0_physical_flesh_crawler", "etype4_physical_spine_beast", "etype4_ice_soul_flame"]
const SCRIPT_PATHS = ["main", "world", "player", "enemy_factory", "enemy", "enemy_melee_flesh_crawler", "enemy_tank_physical_spine_beast", "enemy_tank_ice_soul_flame", "enemy_projectile", "enemy_projectile_physical", "enemy_projectile_ice", "crescent", "hit_effect", "hud", "performance_capture"]
const RUNTIME_ART = ["res://assets/fonts/NotoSansKR.ttf", "res://assets/ui/ui_globe_hp.png", "res://assets/ui/ui_globe_mp.png", "res://assets/ui/ui_bar_only.png", "res://assets/vfx/ki_slash_radiant_sheet.png", "res://assets/vfx/ki_slash_hit_radiant_sheet.png", "res://assets/vfx/radiant.gdshader"]

var _failures = 0
var _passes = 0
var _incomplete: Array[String] = []
var _selected: Array[String] = []
var _case = ""
var _resource_load_calls = 0
var _data_reads = 0
var _expected_missing_errors = 0
var _declared_resource_count = 0
var _icu_bytes = 0
var _icu_header_size = 0
var _icu_format = ""
var _icu_magic_ok = false
var _include_text_server_data = false

func _initialize() -> void:
	paused = true
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			for name in argument.trim_prefix("--only=").split(","):
				_selected.append(name)
	call_deferred("_run")

func _run() -> void:
	for name in CASES:
		if not _selected.is_empty() and name not in _selected:
			continue
		_case = name
		var before = _failures
		var completed: Variant = call("_" + name)
		if completed != true:
			_incomplete.append(name)
			_check(false, "fixture did not finish its consumer assertions")
		if before == _failures:
			_passes += 1
			print("PASS " + name)
		else:
			print("FAIL " + name)
	print("GODOT_WINDOWS_PACKAGE_RESULT " + JSON.stringify({"passed": _passes, "failed_assertions": _failures, "incomplete_groups": _incomplete, "only": _selected, "resource_load_calls": _resource_load_calls, "icu_bytes": _icu_bytes, "icu_header_size": _icu_header_size, "icu_format": _icu_format, "icu_magic_ok": _icu_magic_ok, "include_text_server_data": _include_text_server_data, "json_reads": _data_reads, "declared_runtime_resources": _declared_resource_count, "expected_missing_loader_errors": _expected_missing_errors, "physics_method_calls": 0, "automatic_simulation_ticks": 0, "main_instances": 0, "factory_installs": 0, "user_report_writes": 0, "live_app_inputs": 0, "PNG_hashes": 0, "previous_suites": 0, "Windows_execution_evidence": false, "public_pixel_evidence": false, "performance_evidence": false}))
	quit(0 if _failures == 0 else 1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		_failures += 1
		print("ASSERT " + _case + ": " + message)

func _json(path: String) -> Variant:
	_data_reads += 1
	_check(FileAccess.file_exists(path), "packed JSON exists: " + path)
	return JSON.parse_string(FileAccess.get_file_as_string(path))

func _resource(path: String) -> Resource:
	_resource_load_calls += 1
	_check(ResourceLoader.exists(path), "packed imported resource exists: " + path)
	return ResourceLoader.load(path)

func _profile() -> Dictionary:
	var config: Variant = _json(CONFIG)
	if not config is Dictionary or not config.get("runtime") is Dictionary or not config["runtime"].get("projectile") is Dictionary:
		_check(false, "packed ice config contains the actual projectile profile")
		return {}
	return config["runtime"]["projectile"].duplicate(true)

func _packed_water_consumers() -> bool:
	var profile = _profile()
	if profile.is_empty():
		return false
	_check(profile["animation"]["texture"] == FLIGHT and profile["impact"]["texture"] == IMPACT, "both runtime paths stay inside packed res assets")
	_check(profile["portable_export_dependency_packaged"] == true, "runtime declares packaged water dependencies")
	var flight = _resource(FLIGHT) as Texture2D
	var impact = _resource(IMPACT) as Texture2D
	_check(flight is Texture2D and impact is Texture2D, "import remaps yield real Texture2D resources")
	if not flight is Texture2D or not impact is Texture2D:
		return false
	_check(flight.get_width() > 0 and flight.get_height() > 0 and impact.get_width() > 0 and impact.get_height() > 0, "packed imported textures have nonzero dimensions")
	var loaded_flight = ICE._original_texture(FLIGHT)
	var loaded_impact = ICE._original_texture(IMPACT)
	_check(loaded_flight == flight and loaded_impact == impact, "production loader returns imported resources")
	_check(ICE._original_texture(FLIGHT) == loaded_flight and ICE._original_texture(IMPACT) == loaded_impact, "production cache reuses loaded resource identity")
	var owner = Node2D.new()
	root.add_child(owner)
	var shot = ICE.new()
	shot.configure(Vector2.ZERO, Vector2.RIGHT, profile, null, owner)
	owner.add_child(shot)
	var sprite = shot.get_node_or_null("WaterFlight") as Sprite2D
	_check(sprite is Sprite2D and sprite.texture == flight, "actual projectile ready consumes packed flight texture")
	shot._add_impact()
	var splash = owner.get_node_or_null("WaterImpact") as Sprite2D
	_check(splash is Sprite2D and splash.texture == impact, "actual impact consumer uses packed impact texture")
	_check(shot.get_snapshot()["portable_export_dependency_packaged"] == true, "actual projectile snapshot exposes packaged dependency")
	owner.free()
	return true

func _missing_water_consumer() -> bool:
	var profile = _profile()
	if profile.is_empty():
		return false
	_check(not ResourceLoader.exists(MISSING), "negative path is absent without deleting a product asset")
	profile["animation"]["texture"] = MISSING
	var owner = Node2D.new()
	root.add_child(owner)
	var shot = ICE.new()
	shot.configure(Vector2.ZERO, Vector2.RIGHT, profile, null, owner)
	var endings: Array = []
	shot.telemetry_event.connect(func(kind: String, data: Dictionary):
		if kind == "enemy_projectile_end":
			endings.append(data.duplicate(true)))
	print("WINDOWS_PACKAGE_EXPECTED_MISSING_BEGIN " + MISSING)
	owner.add_child(shot)
	_expected_missing_errors += 1
	print("WINDOWS_PACKAGE_EXPECTED_MISSING_END")
	_check(shot.get_snapshot()["ended"] == true and shot.is_queued_for_deletion(), "missing texture ends and queues the actual consumer")
	_check(endings.size() == 1 and endings[0]["reason"] == "missing_original_water_texture", "missing resource has an explicit single end reason")
	_check(shot.get_node_or_null("WaterFlight") == null, "missing imported texture never installs a blank flight sprite")
	owner.free()
	return true

func _packed_runtime_dependencies() -> bool:
	# Load the packed bootstrap dependency graph; do not create or run it.
	var main = _resource("res://scenes/main.tscn")
	_check(main is PackedScene, "main scene and its script preloads load from this PCK")
	for name in SCRIPT_PATHS:
		var script = _resource("res://scripts/" + name + ".gd")
		_check(script is Script, "script/remap loads: " + name)
	var declared: Dictionary = {}
	for name in DATA_PATHS:
		var document: Variant = _json("res://data/" + name + ".json")
		_check(document is Dictionary, "required packed JSON is readable: " + name)
		if document is Dictionary:
			if name == "map":
				_collect_internal_resources(document, declared)
			elif name == "enemy":
				_collect_internal_resources(document.get("animation", {}), declared)
			elif name.begins_with("etype"):
				_collect_internal_resources(document.get("runtime", {}), declared)
	# Only the delivery dependencies are checked, not tile/record/gameplay fields.
	_declared_resource_count = declared.size()
	for path in declared:
		if path not in [FLIGHT, IMPACT]:
			_check(_resource(path) != null, "packed runtime declared dependency loads: " + path)
	for path in RUNTIME_ART:
		_check(_resource(path) != null, "runtime HUD/font/ki art dependency loads: " + path)
	_check(root.get_child_count() == 0, "no main/world/player instance or simulation survives package fixtures")
	return true

func _collect_internal_resources(value: Variant, paths: Dictionary) -> void:
	if value is Dictionary:
		for key in value:
			_collect_internal_resources(value[key], paths)
	elif value is Array:
		for item in value:
			_collect_internal_resources(item, paths)
	elif value is String and value.begins_with("res://assets/"):
		paths[value] = true

func _packaged_icu_data() -> bool:
	# A separate delivery requirement for the Windows release TextServer stub.
	# No previously passed resource/gameplay group is repeated.
	const ICU_PATH = "res://icudt_godot.dat"
	_include_text_server_data = bool(ProjectSettings.get_setting("internationalization/locale/include_text_server_data", false))
	_check(_include_text_server_data, "exported setting includes TextServer support data")
	var exists = FileAccess.file_exists(ICU_PATH)
	_check(exists, "packed ICU support data exists for the release template")
	if exists:
		var file = FileAccess.open(ICU_PATH, FileAccess.READ)
		_check(file != null, "packed ICU support data is readable")
		if file != null:
			_icu_bytes = file.get_length()
			var header = file.get_buffer(32)
			_check(header.size() == 32, "ICU common data has a complete fixed header")
			if header.size() == 32:
				_icu_magic_ok = header[2] == 0xda and header[3] == 0x27
				_icu_header_size = (header[0] << 8) | header[1] if header[8] != 0 else header[0] | (header[1] << 8)
				_icu_format = header.slice(12, 16).get_string_from_ascii()
				_check(_icu_magic_ok and _icu_format == "CmnD", "actual ICU common-data magic/signature is valid")
				_check(_icu_header_size >= 24 and _icu_bytes > _icu_header_size, "actual ICU size contains payload after its declared header")
			file.close()
	return true
