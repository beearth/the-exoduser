extends SceneTree
## SND-02: 최신 원본 리터럴의 전체 key/value, 영역 격리, 깊은 복사, 실패 상태.
## Main/오디오 부팅·사용자 저장 없음. 기대값은 GDScript catalog에서 만들지 않는다.
const CATALOG = preload("res://port_modules/sound_source/catalog.gd")
const USERDIR := "EXODUSER-snd-02-Isolated-20261020"
const SOURCE_SHA256 := preload("res://source_snapshot/snapshot.gd").SHA256
const SOURCE_MAIN := "284d7faf49295b2f5061937a47ce96038032ed3c"

var assertions := 0
var failures := 0
var isolated := false
var source_tables: Dictionary = {}


func _initialize() -> void:
	ProjectSettings.set_setting("application/config/use_custom_user_dir", true)
	ProjectSettings.set_setting("application/config/custom_user_dir_name", USERDIR)
	isolated = OS.get_user_data_dir().get_file() == USERDIR
	call_deferred("_run")


func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		printerr("SND02_FAIL ", label)


func _run() -> void:
	_check(isolated, "effective USERDIR")
	_check(current_scene == null and root.get_child_count() == 0, "Main not booted")
	if not isolated:
		_finish()
		return
	var source_path := ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)
	_check(FileAccess.file_exists(source_path), "source game.html exists")
	if not FileAccess.file_exists(source_path):
		_finish()
		return
	var source := FileAccess.get_file_as_string(source_path)
	_check(source.sha256_text() == SOURCE_SHA256, "source bytes match immutable snapshot")
	if source.sha256_text() != SOURCE_SHA256:
		_finish()
		return
	source_tables = {
		"samples": _pairs(_literal(source, "_sampleFiles")),
		"voice_map": _pairs(_literal(source, "_SILVERTAIL_VOICE_MAP")),
		"routes": _routes(_literal(source, "SFX_MAP"))
	}
	_check(source_tables.samples.size() == 233, "source sample count 233")
	_check(source_tables.voice_map.size() == 42, "source voice mapping count 42")
	_check(source_tables.routes.size() == 18, "source route count 18")
	var catalog = CATALOG.new()
	_check(catalog.status() == {"status": "READY", "sample_count": 233,
		"voice_mapping_count": 42, "route_count": 18}, "ready and exact source counts")
	var all: Dictionary = catalog.snapshot()
	_check(all.size() == 4 and all.get("status") == "READY", "snapshot has only status and three namespaces")
	for section in ["samples", "voice_map", "routes"]:
		_check(all.get(section) == source_tables[section], "whole key/value set equals source: " + section)
		if not all.get(section) is Dictionary:
			_finish()
			return
		_check((all[section] as Dictionary).keys() == (source_tables[section] as Dictionary).keys(),
			"source insertion order preserved: " + section)
		for key in source_tables[section]:
			var packet: Dictionary = _lookup(catalog, section, key)
			_check(packet == {"status": "READY", "namespace": section, "key": key,
				"value": source_tables[section][key]}, "exact lookup " + section + ":" + key)
	var procedural := 0
	var files := 0
	for route in all.routes.values():
		if route.type == "procedural":
			procedural += 1
			_check(route.size() == 2 and route.has("fn") and not route.has("src"), "procedural remains a declaration")
		else:
			files += 1
			_check(route.size() == 2 and route.type == "file" and route.has("src") and not route.has("fn"),
				"file route retains exact source path")
	_check(procedural == 11 and files == 7, "11 procedural / 7 file routes")
	_test_aliases_and_missing(catalog)
	_test_copies(catalog)
	_test_unready()
	_check(current_scene == null and root.get_child_count() == 0, "no Main/playback nodes created")
	print("SND02_TABLES ", JSON.stringify(catalog.snapshot()))
	_finish()


func _literal(source: String, name: String) -> String:
	var start := source.find("const " + name + "={")
	_check(start >= 0, "source declaration exists: " + name)
	if start < 0:
		return ""
	var end := source.find("\n};", start)
	_check(end > start, "source literal end exists: " + name)
	return source.substr(start, end - start + 3) if end > start else ""


func _pairs(block: String) -> Dictionary:
	var regex := RegEx.new()
	_check(regex.compile("([A-Za-z0-9_]+):'([^']*)'") == OK, "source pair regex")
	var result := {}
	for entry in regex.search_all(block):
		_check(not result.has(entry.get_string(1)), "no duplicate literal key " + entry.get_string(1))
		result[entry.get_string(1)] = entry.get_string(2)
	return result


func _routes(block: String) -> Dictionary:
	var regex := RegEx.new()
	_check(regex.compile("([A-Za-z0-9_]+):[{]type:'([^']+)',(fn|src):'([^']+)'[}]") == OK, "source route regex")
	var result := {}
	for entry in regex.search_all(block):
		_check(not result.has(entry.get_string(1)), "no duplicate source route key")
		var route := {"type": entry.get_string(2)}
		route[entry.get_string(3)] = entry.get_string(4)
		result[entry.get_string(1)] = route
	return result


func _lookup(catalog: RefCounted, section: String, key: String) -> Dictionary:
	match section:
		"samples": return catalog.lookup_sample(key)
		"voice_map": return catalog.lookup_voice_mapping(key)
		"routes": return catalog.lookup_route(key)
	return {"status": "TEST_INVALID_NAMESPACE"}


func _test_aliases_and_missing(catalog: RefCounted) -> void:
	var sample: Dictionary = catalog.snapshot().samples
	_check(sample.sword_slash == sample.sword_swing1, "swing alias retains both keys")
	_check(sample.greatsword_swing == sample.sword_swing3, "greatsword alias is not rewritten")
	var impact := "sfx/hit/player_projectile_impact.wav?v=bisqo-855371-v1"
	for key in ["bullet_hit", "bean_hit", "player_projectile_impact"]:
		_check(sample[key] == impact, "query and alias preserved " + key)
	_check(sample.bow_release == "sfx/weapon/bow_releasE.wav", "path case preserved")
	_check(catalog.lookup_voice_mapping("male_grunt").value == "silvertail_grunt", "logical voice base unchanged")
	_check(catalog.lookup_voice_mapping("voice_demon_revive").value == "silvertail_demon_revive",
		"unregistered logical variant base is not rejected or sampled")
	_check(catalog.lookup_sample("silvertail_demon_revive").status == "MISSING", "logical base is not a sample key")
	_check(catalog.lookup_voice_mapping("voice_wakeup").status == "MISSING", "common wakeup excluded from voice map")
	_check(catalog.lookup_voice_mapping("voice_cooldown").value == "silvertail_cooldown", "voice-only logical key exists")
	_check(catalog.lookup_sample("voice_cooldown").status == "MISSING", "voice logical key not silently made a sample")
	_check(catalog.lookup_route("potion").value == {"type": "procedural", "fn": "potion"}, "potion is procedural")
	_check(catalog.lookup_sample("potion").status == "MISSING", "procedural route is not a file sample")
	_check(catalog.lookup_route("boss_intro").value == {"type": "file", "src": "sfx/boss_intro.mp3"},
		"declared route preserved without requiring active consumer or sample registration")
	for section in ["samples", "voice_map", "routes"]:
		for key in ["", "UNKNOWN", " sword_swing1", "SWORD_SWING1", "없는키"]:
			var packet := _lookup(catalog, section, key)
			_check(packet == {"status": "MISSING", "namespace": section, "key": key}, "missing is explicit; no fallback")
	_check(catalog.lookup_sample("bow_shot").status == "MISSING", "source missing bow_shot not synthesized")


func _test_copies(catalog: RefCounted) -> void:
	var first: Dictionary = catalog.snapshot()
	var second: Dictionary = catalog.snapshot()
	_check(not is_same(first, second), "snapshots have independent identity")
	for section in ["samples", "voice_map", "routes"]:
		_check(not is_same(first[section], second[section]), "namespace independent: " + section)
	_check(not is_same(first.routes.potion, second.routes.potion), "nested routes independent")
	first.samples.bullet_hit = "changed"
	first.voice_map.male_grunt = "changed"
	first.routes.potion.fn = "changed"
	second.samples.clear()
	second.routes.erase("potion")
	_check(catalog.snapshot().samples == source_tables.samples, "sample mutation cannot leak")
	_check(catalog.snapshot().voice_map == source_tables.voice_map, "voice mutation cannot leak")
	_check(catalog.snapshot().routes == source_tables.routes, "nested route mutation cannot leak")
	var route: Dictionary = catalog.lookup_route("potion")
	route.value.fn = "changed"
	_check(catalog.lookup_route("potion").value == source_tables.routes.potion, "single lookup deep copy")
	var status: Dictionary = catalog.status()
	status.status = "changed"
	_check(catalog.status().status == "READY", "status is a copy")
	var other = CATALOG.new()
	_check(other.snapshot() == catalog.snapshot(), "separate instances preserve same source")


func _test_unready() -> void:
	var bad_sources := [
		["res://data/__snd02_missing_catalog__.json", "catalog_file_unavailable"],
		["res://port_modules/sound_source/policy.gd", "catalog_json_invalid"],
		["res://data/combat.json", "catalog_shape_invalid"]
	]
	for row in bad_sources:
		var catalog = CATALOG.new(row[0])
		var expected := {"status": "NOT_READY", "reason": row[1], "path": row[0]}
		_check(catalog.status() == expected, "unready reason is explicit")
		_check(catalog.snapshot() == expected, "unready publishes no partial/default tables")
		for section in ["samples", "voice_map", "routes"]:
			_check(_lookup(catalog, section, "male_grunt") == expected, "unready is distinct from missing")


func _finish() -> void:
	print("SND02_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"isolated": isolated, "userdir": OS.get_user_data_dir(), "Main_booted": current_scene != null,
		"source_main": SOURCE_MAIN, "source_sha256": SOURCE_SHA256, "audible_verified": false}))
	quit(0 if failures == 0 and isolated and assertions > 0 else 1)
