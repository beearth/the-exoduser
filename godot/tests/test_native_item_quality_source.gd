extends SceneTree
## IT-01 pure source contract. No Main instantiation and no user:// IO.
## Run with effective isolated project settings; never change product settings.
const Quality := preload("res://port_modules/item_quality_source/producer.gd")
const USERDIR := "EXODUSER-it-01-Isolated-20261020"
var _quality := Quality.new()
var _checks := 0
var _failures := 0
var _groups: Array = []
var _group := ""

func _initialize() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true \
			or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR \
			or OS.get_user_data_dir().get_file() != USERDIR:
		printerr("IT01_INVALID isolated user directory required: ", OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")

func _run() -> void:
	for group in ["source_tables", "quality_boundaries", "fuse", "sockets", "unsupported", "purity"]:
		_group = group
		var before := _checks
		var failed_before := _failures
		call("_test_" + group)
		_groups.append({"group": group, "checks": _checks - before, "failures": _failures - failed_before})
	_emit_source_comparison()
	print("IT01_RESULT ", JSON.stringify({"checks": _checks, "failures": _failures,
		"groups": _groups, "userdir": OS.get_user_data_dir(), "main_booted": false,
		"source": "game.html:15305,15308-15316,15319,15322-15331",
		"full_js_coercion_supported": false, "gameplay_evidence": false}))
	quit(0 if _failures == 0 and _checks > 0 else 1)

func _check(condition: bool, label: String) -> void:
	_checks += 1
	if not condition:
		_failures += 1
		printerr("IT01_FAIL ", _group, " ", label)

func _close(actual: Variant, expected: float, label: String) -> void:
	_check((actual is int or actual is float) and abs(float(actual) - expected) <= 1e-12, label)

func _test_source_tables() -> void:
	var tables: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/item_generation_tables.json"))
	_check(tables is Dictionary and tables.get("Q_GRADES") is Array, "existing readonly P2-001c table loads")
	if not tables is Dictionary or not tables.get("Q_GRADES") is Array:
		return
	var grades: Array = tables.Q_GRADES
	_check(grades.size() == Quality.Q_GRADES.size(), "Q_GRADES length matches existing table")
	for i in range(mini(grades.size(), Quality.Q_GRADES.size())):
		var row: Dictionary = grades[i]
		var expected: Dictionary = Quality.Q_GRADES[i]
		_check(row.size() == expected.size(), "grade field count " + str(i))
		for key in ["id", "ko", "en", "col"]:
			_check(row.get(key) == expected[key], "grade field/order " + str(i) + ":" + key)
		# JSON numbers parse as float; Dictionary equality treats int/float as distinct.
		_check((row.get("min") is int or row.get("min") is float) and row.min == expected.min, "numeric grade threshold " + str(i))
	_check(Quality.Q_GRADES.size() == 3, "three grades; not ten quality tiers")

func _test_quality_boundaries() -> void:
	var rows := [
		[1, 10, "bronze", .755], [10, 10, "bronze", .8], [11, 9, "bronze", .805],
		[40, 7, "bronze", .95], [40.5, 7, "bronze", .9525], [41, 6, "silver", .955],
		[50, 6, "silver", 1.0], [80, 3, "silver", 1.15], [81, 2, "gold", 1.155],
		[90, 2, "gold", 1.2], [91, 1, "gold", 1.205], [100, 1, "gold", 1.25],
		[-1, 10, "bronze", .755], [101, 1, "gold", 1.25],
	]
	for row in rows:
		var result: Dictionary = _quality.quality(row[0])
		_check(result.status == "READY" and result.ready, "numeric quality ready " + str(row[0]))
		_check(result.tier == row[1] and result.grade_id == row[2], "tier/grade " + str(row[0]))
		_close(result.gem_multiplier, row[3], "gem multiplier " + str(row[0]))
	_close(_quality.quality(40.5).q, 40.5, "fractional quality is not rounded")
	for raw in [null, 0, -0.0]:
		var result: Dictionary = _quality.quality(raw)
		_check(result.q == 50 and result.tier == 6 and result.grade_id == "silver" and result.gem_multiplier == 1, "source falsy fallback " + str(raw))
	_check(_quality.quality().q == 50, "missing argument uses source fallback")
	_check(_quality.quality(1).ko == "동" and _quality.quality(41).en == "Silver" \
		and _quality.quality(81).color == "#f2d388", "grade text/color preserved")
	_close(_quality.quality(-1).q, 1, "negative clamped after falsy test")
	_close(_quality.quality(101).q, 100, "upper bound clamp")

func _test_fuse() -> void:
	var rows := [
		[null, 50], [[], 50], [[{"q": 1}, {"q": 50}, {"q": 100}], 50],
		[[{"q": 40}, {"q": 41}], 41], [[null, {"q": 0}, {"q": 100}], 67],
		[[{}, {"q": null}], 50], [[{"q": -100}, {"q": 300}], 51],
		[[{"q": 40.5}, {"q": 41.5}], 41],
	]
	for row in rows:
		var result: Dictionary = _quality.fused_quality(row[0])
		_check(result.status == "READY" and result.ready and result.q == row[1], "fuse fixed oracle " + str(row))

func _test_sockets() -> void:
	var rows := [
		[1, 1, 1.0, false], [40, 40, 1.0 + 78.0 / 99.0, true],
		[40, 41, 1.0 + 39.0 / 99.0, false], [41, 41, 1.0 + 80.0 / 99.0, true],
		[80, 81, 1.0 + 79.0 / 99.0, false], [100, 100, 3.0, true],
		[100, 50, 2.0, false], [41, 80, 1.0 + 80.0 / 99.0, true],
		[0, 0, 1.0, false], [-10, 1, 1.0, false], [101, 100, 3.0, true],
		[40.5, 40.5, 1.0 + 79.0 / 99.0, true],
	]
	for row in rows:
		var item := {"crystals": [{"q": row[1]}], "socketQ": [row[0]]}
		var result: Dictionary = _quality.socket(item, 0)
		_check(result.ready and result.status == "READY" and result.resonant == row[3], "socket resonance " + str(row))
		_close(result.multiplier, row[2], "socket multiplier " + str(row))
	# Empty crystal must short-circuit malformed socket quality before any numeric read.
	for item in [null, {}, {"crystals": {}}, {"crystals": []}, {"crystals": [null], "socketQ": ["bad"]},
			{"crystals": [false]}, {"crystals": [0]}, {"crystals": [""]}]:
		_check(_quality.socket(item, 0) == {"status": "READY", "ready": true, "multiplier": 1.0, "resonant": false}, "empty crystal " + str(item))
	for socket_values in [null, [], [null], [0], "not-an-array"]:
		var item := {"crystals": [{}], "socketQ": socket_values}
		_check(_quality.socket(item, 0).multiplier == 1 and not _quality.socket(item, 0).resonant, "missing socket q fallback1; missing crystal q fallback50")
	var occupied := {"crystals": [{"q": 100}], "socketQ": [100]}
	_check(_quality.socket(occupied, -1).multiplier == 1 and _quality.socket(occupied, 1).multiplier == 1, "outside array index is empty")
	_check(_quality.socket({"crystals": [{}], "socketQ": [100]}, 0).multiplier == 2, "unknown crystal id/star is irrelevant to socket formula")
	_check(_quality.socket({"crystals": [{"q": 0}], "socketQ": [41]}, 0).resonant, "crystal q0 uses silver50")

func _not_ready(result: Dictionary, label: String) -> void:
	_check(result.status == "NOT_READY" and not result.ready and result.get("reason", "") != "", label + " status/reason")
	_check(not result.has("q") and not result.has("multiplier") and not result.has("gem_multiplier"), label + " no normal value")

func _test_unsupported() -> void:
	var object := RefCounted.new()
	for raw in ["50", true, false, [], {}, object, NAN, INF, -INF]:
		_not_ready(_quality.quality(raw), "quality unsupported " + str(raw))
	for list in [false, 50, "", {}, [{"q": "50"}], [{"q": NAN}], [object], [true]]:
		_not_ready(_quality.fused_quality(list), "fuse unsupported " + str(list))
	for item in [true, "item", [], {"crystals": [true]}, {"crystals": [2]}, {"crystals": [[]]},
			{"crystals": [{}], "socketQ": [false]}, {"crystals": [{}], "socketQ": [INF]},
			{"crystals": [{"q": "50"}]}, {"crystals": [{"q": NAN}]}]:
		_not_ready(_quality.socket(item, 0), "socket unsupported " + str(item))

func _test_purity() -> void:
	var crystal := {"q": 80, "id": "unknown", "star": 2, "enh": 7, "extra": {"preserve": true}}
	var crystals := [crystal]
	var socket_q := [41]
	var item := {"crystals": crystals, "socketQ": socket_q, "socketCount": 99, "extra": []}
	var list := [crystal, {"q": 41}]
	var before_item: Dictionary = item.duplicate(true)
	var before_list: Array = list.duplicate(true)
	for i in range(3):
		_quality.socket(item, 0)
		_quality.fused_quality(list)
		_quality.quality(crystal.q)
	_check(item == before_item and list == before_list, "all nested values/lengths unchanged")
	_check(is_same(item.crystals, crystals) and is_same(item.socketQ, socket_q) and is_same(crystals[0], crystal), "original nested identities unchanged")
	var answer: Dictionary = _quality.quality(1)
	answer.ko = "modified caller result"
	_check(_quality.quality(1).ko == "동", "result cannot mutate grade constant")
	_check(root.get_child_count() == 0, "no Main/game node created")

func _emit_source_comparison() -> void:
	# Compared externally against the actual latest game.html functions, not native formula copies.
	var qualities: Array = []
	for i in range(-2, 203):
		var q := float(i) / 2.0
		qualities.append({"input": q, "result": _quality.quality(q)})
	var sockets: Array = []
	for sq in [0, 1, 10, 40, 40.5, 41, 50, 80, 80.5, 81, 100, 101]:
		for cq in [0, 1, 40, 40.5, 41, 50, 80, 80.5, 81, 100]:
			sockets.append({"socket_q": sq, "crystal_q": cq,
				"result": _quality.socket({"crystals": [{"q": cq}], "socketQ": [sq]}, 0)})
	var fuses: Array = []
	for list in [null, [], [{"q": 1}, {"q": 50}, {"q": 100}], [{"q": 40}, {"q": 41}],
			[null, {"q": 0}, {"q": 100}], [{}, {"q": null}], [{"q": -100}, {"q": 300}],
			[{"q": 40.5}, {"q": 41.5}]]:
		fuses.append({"input": list, "result": _quality.fused_quality(list)})
	print("IT01_ORACLE ", JSON.stringify({"qualities": qualities, "sockets": sockets, "fuses": fuses}))
