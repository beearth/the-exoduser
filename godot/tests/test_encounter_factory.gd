extends SceneTree
## Native time-zero factory contracts. No public input, simulation step or QA save.

const FactoryScript = preload("res://scripts/enemy_factory.gd")
const WorldScript = preload("res://scripts/world.gd")
# Also parses the new main summary consumer, without instantiating the main scene.
const MainScript = preload("res://scripts/main.gd")
const IceScript = preload("res://scripts/enemy_tank_ice_soul_flame.gd")
const SpineScript = preload("res://scripts/enemy_tank_physical_spine_beast.gd")
const CrawlerScript = preload("res://scripts/enemy_melee_flesh_crawler.gd")
const HiveScript = preload("res://scripts/enemy_archer_lightning_hive_bloater.gd")
const IceWarriorScript = preload("res://scripts/enemy_melee_ch1_ice_warrior.gd")
const SOURCE_FILE = "res://data/encounters.json"
# game.html:31120-31162 mkEn; 31517-31530 medium pair; 31608-31648 initial order.
# Current exact consumers retain that frozen sixteen-record source without broad type support.
const SUPPORTED_ORDERS = [0, 1, 4, 8, 10, 11, 12, 13, 14, 15]
const DEDICATED_CONSUMERS = [
	{"order": 8, "script": IceScript, "profile": "native_ch1_etype4_ice_soul_flame_v1", "config": "res://data/etype4_ice_soul_flame.json"},
	{"order": 13, "script": SpineScript, "profile": "native_ch1_etype4_physical_spine_beast_v1", "config": "res://data/etype4_physical_spine_beast.json"},
	{"order": 14, "script": CrawlerScript, "profile": "native_ch1_etype0_physical_flesh_crawler_v1", "config": "res://data/etype0_physical_flesh_crawler.json"},
	{"order": 15, "script": HiveScript, "profile": "native_ch1_etype1_lightning_hive_bloater_v1", "config": "res://data/etype1_lightning_hive_bloater.json"},
]
# Independent production-extraction receipt; this pins the accepted source, not factory output.
const SOURCE_SHA = "91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa"
const SOURCE_ORACLE = [{"id":"ch1_start_eye_mass_01","order":0,"group":"start-medium","etype":4,"element":"dark","hp":875,"attack":31,"position":[3500,6700],"skin":"native-medium-sheet"},{"id":"ch1_start_eye_mass_02","order":1,"group":"start-medium","etype":4,"element":"dark","hp":875,"attack":31,"position":[4540,6580],"skin":"native-medium-sheet"},{"id":"ch1_initial_003","order":2,"group":"gate-guardian","etype":29,"element":"physical","hp":3500,"attack":62,"position":[4020,340],"skin":"carapace_predator"},{"id":"ch1_initial_004","order":3,"group":"gate-escort","etype":7,"element":"physical","hp":4377,"attack":40,"position":[4075,340],"skin":"flesh_crawler"},{"id":"ch1_initial_005","order":4,"group":"gate-escort","etype":20,"element":"physical","hp":2187,"attack":31,"position":[4036.995934690622,392.3081083962334],"skin":"flesh_crawler"},{"id":"ch1_initial_006","order":5,"group":"gate-escort","etype":25,"element":"physical","hp":2187,"attack":31,"position":[3975.504065309378,372.328188876086],"skin":"carapace_predator"},{"id":"ch1_initial_007","order":6,"group":"gate-escort","etype":6,"element":"physical","hp":2187,"attack":31,"position":[3975.504065309378,307.671811123914],"skin":"apostle_knight"},{"id":"ch1_initial_008","order":7,"group":"gate-escort","etype":7,"element":"physical","hp":2187,"attack":31,"position":[4036.995934690622,287.6918916037665],"skin":"soul_flame"},{"id":"ch1_initial_009","order":8,"group":"gate-wave","etype":4,"element":"ice","hp":875,"attack":31,"position":[4191.995760537684,340],"skin":"soul_flame"},{"id":"ch1_initial_010","order":9,"group":"gate-wave","etype":21,"element":"dark","hp":875,"attack":31,"position":[4159.552543804879,441.39085796557566],"skin":"spine_beast"},{"id":"ch1_initial_011","order":10,"group":"gate-wave","etype":20,"element":"physical","hp":875,"attack":31,"position":[4071.338948165395,498.0050355845301],"skin":"carapace_predator"},{"id":"ch1_initial_012","order":11,"group":"gate-wave","etype":47,"element":"physical","hp":875,"attack":31,"position":[3969.716234383507,494.7575176250593],"skin":"flesh_crawler"},{"id":"ch1_initial_013","order":12,"group":"gate-wave","etype":20,"element":"lightning","hp":875,"attack":31,"position":[3919.000584636192,413.38037056548455],"skin":"spine_beast"},{"id":"ch1_initial_014","order":13,"group":"gate-wave","etype":4,"element":"physical","hp":875,"attack":31,"position":[3878.7467967160046,340],"skin":"spine_beast"},{"id":"ch1_initial_015","order":14,"group":"gate-wave","etype":0,"element":"physical","hp":875,"attack":31,"position":[3888.7242834487565,244.62260903114446],"skin":"flesh_crawler"},{"id":"ch1_initial_016","order":15,"group":"gate-wave","etype":1,"element":"lightning","hp":875,"attack":31,"position":[4125.581107525944,263.29083522849453],"skin":"hive_bloater"}]

var _failures: int = 0
var _passes: int = 0
var _case_name: String = ""
var _selected: Array[String] = []
var _source: Dictionary = {}
var _factory: RefCounted
var _world: Node2D
var _events: Array = []

func _initialize() -> void:
	paused = true
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			for item in argument.trim_prefix("--only=").split(","):
				_selected.append(item)
	call_deferred("_run")

func _run() -> void:
	_source = JSON.parse_string(FileAccess.get_file_as_string(SOURCE_FILE))
	_factory = FactoryScript.new()
	_world = WorldScript.new()
	_world.process_mode = Node.PROCESS_MODE_PAUSABLE
	_world.telemetry_event.connect(func(kind: String, data: Dictionary) -> void: _events.append({"kind": kind, "data": data.duplicate(true)}))
	# Enter the actual world consumer once; pause prevents any enemy/AI delta.
	root.add_child(_world)
	for case_name in ["source_factory", "world_registration", "invalid_atomicity"]:
		if not _selected.is_empty() and not _selected.has(case_name):
			continue
		_case_name = case_name
		var before: int = _failures
		match case_name:
			"source_factory": _test_source_factory()
			"world_registration": _test_world_registration()
			"invalid_atomicity": _test_invalid_atomicity()
		if _failures == before:
			_passes += 1
			print("PASS ", case_name)
		else:
			print("FAIL ", case_name)
	_world.free()
	print("GODOT_ENCOUNTER_FACTORY_RESULT ", JSON.stringify({"passed": _passes, "failed_assertions": _failures, "only": _selected, "simulation_ticks": 0, "public_play_evidence": false, "performance_evidence": false}))
	quit(0 if _failures == 0 and _passes > 0 else 1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		_failures += 1
		printerr("ASSERT_FAIL [", _case_name, "] ", message)

func _equal_number(actual: Variant, expected: Variant, label: String) -> void:
	_check(is_equal_approx(float(actual), float(expected)), label)

func _json_equal(actual: Variant, expected: Variant) -> bool:
	# JSON decoder uses float, while the independent receipt oracle has integer literals.
	if (typeof(actual) == TYPE_INT or typeof(actual) == TYPE_FLOAT) and (typeof(expected) == TYPE_INT or typeof(expected) == TYPE_FLOAT):
		return float(actual) == float(expected)
	if actual is Array and expected is Array:
		if actual.size() != expected.size():
			return false
		for index in range(actual.size()):
			if not _json_equal(actual[index], expected[index]):
				return false
		return true
	if actual is Dictionary and expected is Dictionary:
		if actual.size() != expected.size():
			return false
		for key in actual:
			if not expected.has(key) or not _json_equal(actual[key], expected[key]):
				return false
		return true
	return actual == expected

func _test_source_factory() -> void:
	_check(FileAccess.get_sha256(SOURCE_FILE) == SOURCE_SHA, "accepted production-extraction bytes remain exact")
	_check(_source["records"].size() == SOURCE_ORACLE.size() and _source["initial_count"] == 16 and _source["record_count"] == 16, "initial source is sixteen, including unsupported records")
	_check(_source["source"]["encounter_seed"] == 477069883 and _source["source"]["encounter_rng_end"] == 2380610169 and _source["source"]["random_draw_count"] == 214, "time-zero seeded native factory sequence preserved")
	var validation: Dictionary = _factory.call("validate_source", _source)
	_check(validation["valid"] and validation["errors"].is_empty(), "canonical source accepted, including legitimate unported types; errors=" + JSON.stringify(validation["errors"]))
	var report: Dictionary = _world.call("get_encounter_report")
	_check(report.get("installed", false) and report.get("source_count") == 16 and report.get("supported_count") == 10 and report.get("unsupported_count") == 6, "source count and actual admitted actor count stay separate")
	var records: Array = report.get("records", [])
	var actors: Array = _world.call("get_enemies")
	_check(records.size() == 16 and actors.size() == 10, "all source records reported; ten exact real actors")
	if records.size() != 16 or actors.size() != 10:
		return
	for index in range(SOURCE_ORACLE.size()):
		var original: Dictionary = _source["records"][index]
		var oracle: Dictionary = SOURCE_ORACLE[index]
		_check(original["id"] == oracle["id"] and original["order"] == oracle["order"] and original["spawn_group"] == oracle["group"], "receipt-derived original identity/order/group %d" % index)
		_check(original["etype"] == oracle["etype"] and original["element"] == oracle["element"] and original["hp"] == oracle["hp"] and original["attack"] == oracle["attack"] and _json_equal(original["spawn_position"], oracle["position"]), "receipt-derived original type/element/HP/ATK/spawn %d" % index)
		var skin: String = original["animation"].get("kind", "") if index < 2 else original["animation"].get("skin", "")
		_check(skin == oracle["skin"], "receipt-derived original skin %d" % index)
		_check(records[index]["record"] == original, "full native_factory/native_final and unused timers retained %d" % index)
		_check(records[index]["status"] == ("supported" if SUPPORTED_ORDERS.has(index) else "unsupported"), "only exact supported records get their dedicated AI %d" % index)
		_check(records[index]["order"] == index and records[index]["id"] == original["id"] and records[index]["etype"] == original["etype"], "report preserves exact source order/type %d" % index)
	for index in range(2):
		var actor: Node2D = actors[index]
		var original: Dictionary = _source["records"][index]
		var native: Dictionary = original["native_final"]
		_check(str(actor.name) == original["id"] and actor.get("source_order") == index and actor.get("etype") == 4 and actor.get("element") == "dark", "actual actor identity/type/element admitted %d" % index)
		_check(actor.position == Vector2(float(native["x"]), float(native["y"])), "actual actor native combat-center spawn %d" % index)
		_check(actor.get("hp") == native["hp"] and actor.get("mhp") == native["mhp"] and actor.get("attack") == native["atk"] and actor.get("max_hp") == native["mhp"], "actual actor raw HP/ATK/mhp %d" % index)
		_equal_number(actor.get("radius"), native["r"], "actual raw radius %d" % index)
		_equal_number(actor.get("poise"), native["poise"], "actual raw poise %d" % index)
		_equal_number(actor.get("max_poise"), native["maxPoise"], "actual raw maxPoise %d" % index)
		_equal_number(actor.get("facing"), native["facing"], "actual raw initial facing %d" % index)
		_equal_number(actor.get("_contact_ticks"), native["st2"], "no advance/reseed of contact clock %d" % index)
		_equal_number(actor.get("_projectile_ticks"), native["projT"], "no advance/reseed of projectile clock %d" % index)
		_equal_number(actor.get("_poise_regen"), native["poiseR"], "no advance of poise clock %d" % index)
		_equal_number(actor.get("charge_ticks"), native["chargeT"], "no advance of charge clock %d" % index)
		_equal_number(actor.get("_hit_stun"), native["stunned"], "raw initial stun preserved %d" % index)
		_check(actor.get("_knockback") == Vector2(float(native["kb"]["x"]), float(native["kb"]["y"])), "raw initial KB preserved %d" % index)
		_check(actor.get("elite") == native["elite"] and actor.get("mods") == native["mods"] and actor.get("aura") == native["aura"], "post-caller native flags preserved %d" % index)
		_check(actor.get("initial_timers") == original["initial_timers"] and actor.get("native_flags") == original["runtime"]["native_flags"], "full initial timer/skin flags retained %d" % index)
		_check(actor.get("data") == original["runtime"] and actor.get("_motion_ms") == 0.0 and actor.get("_stun_ticks") == 0.0 and not actor.get("alerted"), "actual actor data retained at simulation zero %d" % index)
		var body: Sprite2D = actor.get("_body")
		_check(body.texture.resource_path == original["runtime"]["animation"]["texture"] and body.hframes == 4 and body.vframes == 8, "actual supported sheet, without loading unported atlas %d" % index)
		_equal_number(body.scale.y, float(original["animation"]["draw_height"]) / 256.0, "actual initial draw height %d" % index)
	for index in range(DEDICATED_CONSUMERS.size()):
		var expected: Dictionary = DEDICATED_CONSUMERS[index]
		var actor: Node2D = actors[SUPPORTED_ORDERS.find(int(expected["order"]))]
		var original: Dictionary = _source["records"][expected["order"]]
		var config: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(expected["config"]))
		var entry: Dictionary = records[expected["order"]]
		_check(actor.get_script() == expected["script"] and str(actor.name) == original["id"] and actor.get("source_order") == expected["order"] and actor.get("etype") == original["etype"] and actor.get("element") == original["element"], "added exact class/identity/type/element %d" % expected["order"])
		_check(entry.get("consumer_profile") == expected["profile"] and entry.get("consumer_config") == expected["config"] and entry.get("source_support") == original["support"], "dedicated capability keeps frozen source support %d" % expected["order"])
		_check(_json_equal(actor.get("data"), config["runtime"]) and _json_equal(actor.get("initial_timers"), original["initial_timers"]), "dedicated runtime and raw clocks retained %d" % expected["order"])
		_check(actor.position == Vector2(float(original["spawn_position"][0]), float(original["spawn_position"][1])) and actor.get("hp") == original["hp"] and actor.get("attack") == original["attack"], "dedicated spawn/HP/ATK remain source exact %d" % expected["order"])
		_check(actor.call("get_snapshot")["native_frame"] == 0 and actor.get("charge_ticks") == 0.0 and not actor.get("alerted"), "dedicated registration consumes no simulation time %d" % expected["order"])
	for order in [4, 10, 12]:
		var actor: Node2D = actors[SUPPORTED_ORDERS.find(order)]
		var original: Dictionary = _source["records"][order]
		_check(actor.get_script() == IceWarriorScript and actor.get("etype") == 20
			and actor.get("source_order") == order, "exact ice-warrior consumer identity %d" % order)
		_check(_json_equal(actor.get("data"), IceWarriorScript.build_runtime(original))
			and records[order].get("source_support") == original["support"], "source-derived constructor and frozen support retained %d" % order)

func _test_world_registration() -> void:
	var actors: Array = _world.call("get_enemies")
	_check(_world.get("ready_for_player") and actors.size() == 10 and get_nodes_in_group("enemies").size() == 10, "actual world_ready and enemy registry contain only admitted actors")
	if actors.size() != 10:
		return
	var relevant: Array = _events.filter(func(event: Dictionary) -> bool: return event["kind"] in ["enemy_spawn", "native_encounters_installed", "world_ready"])
	_check(relevant.size() == 12, "ten spawn, one install, one world-ready telemetry only")
	if relevant.size() == 12:
		_check(relevant[10]["kind"] == "native_encounters_installed" and relevant[11]["kind"] == "world_ready", "actual telemetry follows actor registration then install/world_ready")
		for index in range(SUPPORTED_ORDERS.size()):
			var packet: Dictionary = relevant[index]["data"]
			var original: Dictionary = _source["records"][SUPPORTED_ORDERS[index]]
			_check(relevant[index]["kind"] == "enemy_spawn" and packet["id"] == original["id"] and packet["order"] == original["order"] and packet["etype"] == original["etype"] and packet["element"] == original["element"], "spawn telemetry original identity/order %d" % original["order"])
			var expected_position = Vector2(float(original["spawn_position"][0]), float(original["spawn_position"][1]))
			_check(packet["hp"] == original["hp"] and packet["position"] == [expected_position.x, expected_position.y], "spawn telemetry actual initial HP/Vector2 position %d" % index)
			_equal_number(packet["native_speed"], original["speed_pixels_per_tick"], "spawn native speed %d" % index)
		_check(relevant[10]["data"] == {"source_count": 16, "supported_count": 10, "unsupported_count": 6}, "install telemetry counts distinguish unported source")
	var player := Node2D.new()
	player.position = _world.call("get_start_position")
	root.add_child(player)
	_world.call("set_player", player)
	for index in range(actors.size()):
		var actor: Node2D = actors[index]
		_check(actor.get_parent() == _world and actor.get("world") == _world and actor.get("player") == player, "actual factory actor world/player ownership")
		_check(actor.get("source_order") == SUPPORTED_ORDERS[index], "registry preserves admitted source order %d" % index)
		if index < 2:
			_check(actor.get("_motion_ms") == 0.0 and actor.get("charge_ticks") == 0.0, "medium bind does not consume simulation time")
		else:
			_check(actor.call("get_snapshot")["native_frame"] == 0 and actor.get("charge_ticks") == 0.0, "dedicated bind does not consume simulation time")
	var before: Dictionary = _world.call("get_encounter_report")
	var external: Dictionary = _world.call("get_encounter_report")
	external["records"][2]["record"]["native_final"]["hp"] = -999
	external["source"]["known_etypes"].clear()
	_check(_world.call("get_encounter_report") == before, "returned report including nested unsupported raw record is a deep copy")
	var main: Node = MainScript.new()
	main.set("world", _world)
	var summary: Dictionary = main.call("_encounter_summary")
	_check(summary["installed"] and summary["source_count"] == 16 and summary["supported_count"] == 10 and summary["unsupported_count"] == 6 and summary["records"].size() == 16, "main readonly metadata/pause-state summary consumes actual world report")
	_check(_json_equal(summary["records"][2], {"order": 2, "id": "ch1_initial_003", "etype": 29, "status": "unsupported", "reason": "native_type_ai_not_ported"}), "main records unported guardian honestly")
	main.free()
	player.free()
	_check(paused and _world.get("_flow_clock") == 0.0, "entire native fixture remains at time zero")

func _test_invalid_atomicity() -> void:
	var bad_sources: Array = []
	var malformed: Dictionary = _source.duplicate(true)
	malformed["record_count"] = 17
	bad_sources.append({"label": "count", "source": malformed})
	malformed = _source.duplicate(true)
	malformed["records"][1]["id"] = malformed["records"][0]["id"]
	bad_sources.append({"label": "duplicate-id", "source": malformed})
	for bad_type in [-1, 4.5, 99999]:
		malformed = _source.duplicate(true)
		malformed["records"][15]["etype"] = bad_type
		bad_sources.append({"label": "invalid-type-%s" % bad_type, "source": malformed})
	malformed = _source.duplicate(true)
	malformed["records"][15]["spawn_position"][0] = NAN
	bad_sources.append({"label": "nonfinite-spawn", "source": malformed})
	malformed = _source.duplicate(true)
	malformed["records"][1]["runtime"]["projectile"]["contact_damage"] = 79
	bad_sources.append({"label": "wrong-runtime-damage", "source": malformed})
	malformed = _source.duplicate(true)
	malformed["records"][0]["initial_timers"]["projT"] += 1.0
	bad_sources.append({"label": "altered-native-clock", "source": malformed})
	var before: Dictionary = _world.call("get_encounter_report")
	var registry: Array = _world.call("get_enemies")
	var child_count: int = _world.get_child_count()
	var event_count: int = _events.size()
	for bad in bad_sources:
		var invalid: Dictionary = _factory.call("validate_source", bad["source"])
		_check(not invalid["valid"] and not invalid["errors"].is_empty(), "invalid does not become a legitimate unsupported type: " + bad["label"])
		var empty_world: Node2D = WorldScript.new()
		var cold_events: Array = []
		empty_world.telemetry_event.connect(func(kind: String, data: Dictionary) -> void: cold_events.append({"kind": kind, "data": data}))
		var result: Dictionary = empty_world.call("install_native_encounters", bad["source"])
		_check(not result["valid"] and empty_world.get_child_count() == 0 and empty_world.call("get_enemies").is_empty() and empty_world.call("get_encounter_report").is_empty() and cold_events.is_empty(), "cold invalid source creates no nodes/registry/report/events: " + bad["label"])
		empty_world.free()
		result = _world.call("install_native_encounters", bad["source"])
		_check(not result["valid"] and _world.get_child_count() == child_count and _world.call("get_enemies") == registry and _world.call("get_encounter_report") == before and _events.size() == event_count, "invalid does not replace an installed world/report: " + bad["label"])
	var again: Dictionary = _world.call("install_native_encounters", _source)
	_check(not again["valid"] and again["errors"] == ["already_installed"] and _world.get_child_count() == child_count and _world.call("get_enemies") == registry and _world.call("get_encounter_report") == before and _events.size() == event_count, "valid repeated install is explicit and cannot duplicate actors")
