extends RefCounted
## FB-01: source catalog/initial records only. No actor, RNG, G/P writer or boot binding.
## Source game.html at the fetched main below; identical bytes on the trace dependency.
const SOURCE_MAIN = "ad497089c7955d3e344e1488e5286e9b0ddd9092"
const SOURCE_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const _CATALOG = {
	"angler": {
		"count": 4, "tile_size": 40, "wake_distance": 1000,
		"sites": [[58, 158], [148, 150], [52, 42], [148, 42]],
		"element_ids": [2, 1, 3, 4], "region_indices": [2, 3, 0, 1],
		"hp_multiplier": 7.5, "energy_charge_ticks": 180,
	},
	"worm": {
		"count": 4, "tile_size": 40, "wake_distance": 1000,
		"sites": [[70, 160], [50, 100], [155, 70], [72, 55]],
	},
	"firedevil": {
		"count": 4, "tile_size": 40, "wake_distance": 1000,
		"sites": [[78, 125], [125, 125], [78, 70], [125, 70]],
		"hp_multiplier": 2.5, "energy_charge_ticks": 180, "speed_per_tick": 1.8,
	},
	"gate_guard": {
		"etype_by_hell": [29, 39, 49, 59, 69, 79, 89],
		"position_expression": "((G._bossCx+.5)*T,(G._gateY+3+.5)*T)",
		"mkEn_arguments": {"ib": false, "room": -1, "el_expression": "STG[si].be"},
		"requires": ["nonempty_bossGate", "defined_gateY", "front_tile_in_bounds_and_floor_0", "approved_mkEn_input"],
		"post_mkEn_writes": [
			{"field": "hp", "expression": "~~(gg.mhp*4)"},
			{"field": "mhp", "expression": "gg.hp"},
			{"field": "atk", "expression": "~~(gg.atk*2)"},
			{"field": "baseAtk", "expression": "gg.atk"},
			{"field": "r", "expression": "~~(gg.r*1.4)"},
			{"field": "poise", "value": 80},
			{"field": "maxPoise", "value": 80},
			{"field": "elite", "value": 3},
			{"field": "_isGateGuard", "value": true},
			{"field": "dropTier", "expression": "Math.min(4,SI_TO_HELL[si]+2)"},
		],
		"region_clear_bonus": 0.10,
	},
}
const _LINES = {
	"angler": "16631,60694,60973-60978,60985,61043-61046",
	"worm": "61237-61243",
	"firedevil": "61443-61448,61460,61632-61635",
	"gate_guard": "31614-31626,60725",
}


static func catalog(kind: Variant) -> Dictionary:
	if not kind is String or not _CATALOG.has(kind):
		return _not_ready("unknown_kind")
	# Never lend constant dictionaries or their nested arrays to a caller.
	return _ready(kind, _CATALOG[kind].duplicate(true))


static func build_initial(kind: Variant, input: Variant) -> Dictionary:
	if not kind is String or not _CATALOG.has(kind):
		return _not_ready("unknown_kind")
	if kind == "gate_guard":
		return _not_ready("requires_approved_mkEn_input")
	if not input is Dictionary:
		return _not_ready("input_not_dictionary")
	var fields = ["player_level", "x", "y"] if kind == "worm" else ["player_level", "tx", "ty", "tile_size"]
	for field in fields:
		if not input.has(field) or not _finite_number(input[field]):
			return _not_ready("finite_number_required:" + field)
	if kind == "worm":
		if not input.has("asleep") or not input["asleep"] is bool:
			return _not_ready("bool_required:asleep")
	else:
		# Host boundary: this unit admits the source T=40 only, with no default/clamp.
		if input["tile_size"] != 40:
			return _not_ready("source_tile_size_mismatch")
		if kind == "angler" and (not input.has("element") or not _finite_number(input["element"]) or not [2.0, 1.0, 3.0, 4.0].has(float(input["element"]))):
			return _not_ready("unsupported_angler_element")
	# JS Number arithmetic, including the exact ||1 location and operation order.
	var lv = float(input["player_level"])
	var x = float(input["x"]) if kind == "worm" else (float(input["tx"]) + 0.5) * float(input["tile_size"])
	var y = float(input["y"]) if kind == "worm" else (float(input["ty"]) + 0.5) * float(input["tile_size"])
	var hp: int
	var value: Dictionary
	if kind == "angler":
		hp = _int32((1800.0 + (1.0 if lv == 0.0 else lv) * 350.0) * 7.5)
		value = {"x": x, "y": y, "homeX": x, "homeY": y, "r": 120, "hp": hp, "mhp": hp,
			"alive": true, "t": 0, "frame": 0, "atk": _int32((20.0 + lv * 3.0) * 1.2),
			"hitCd": 0, "shotCd": 120, "tpCd": 0, "tpT": 0, "tpMax": 54, "tpX": x, "tpY": y,
			"hid": 1, "burst": 0, "burstGap": 0, "spawnIn": 1, "asleep": 1, "enChg": 0, "el": int(input["element"])}
	elif kind == "worm":
		hp = _int32(150.0 + lv * 45.0)
		value = {"x": x, "y": y, "homeX": x, "homeY": y, "r": 56, "hp": hp, "mhp": hp,
			"frame": 0, "ft": 0, "shotF": -1, "atk": _int32((16.0 + lv * 2.5) * 1.2),
			"hitCd": 0, "face": 0, "phase": "hide", "shots": 0, "hideT": 0 if input["asleep"] else 54,
			"popHit": 0, "tpX": x, "tpY": y, "asleep": 1 if input["asleep"] else 0}
	else:
		hp = _int32((1800.0 + (1.0 if lv == 0.0 else lv) * 350.0) * 2.5)
		value = {"x": x, "y": y, "homeX": x, "homeY": y, "r": 100, "hp": hp, "mhp": hp,
			"t": 0, "frame": 6, "_moving": false, "walkT": 0, "chargeWalkT": 0,
			"atk": _int32((18.0 + lv * 2.8) * 1.2), "hitCd": 0, "shotCd": 90, "tpCd": 0,
			"emT": 0, "emMax": 54, "tpX": x, "tpY": y, "hid": 1, "spawnIn": 1, "asleep": 1,
			"enChg": 0, "burst": 0, "burstGap": 0, "el": 1, "_fmKind": "fd"}
	return _ready(kind, value)


static func _int32(value: float) -> int:
	if not is_finite(value) or value == 0.0:
		return 0
	var modulo = fmod(floor(absf(value)) * (-1.0 if value < 0.0 else 1.0), 4294967296.0)
	if modulo < 0.0:
		modulo += 4294967296.0
	if modulo >= 2147483648.0:
		modulo -= 4294967296.0
	return int(modulo)


static func _finite_number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))


static func _not_ready(reason: String) -> Dictionary:
	return {"status": "NOT_READY", "reason": reason, "writes": 0}


static func _ready(kind: String, value: Dictionary) -> Dictionary:
	return {"status": "READY", "value": value, "writes": 0,
		"source_ref": {"main": SOURCE_MAIN, "file": "game.html", "sha256": SOURCE_SHA256, "lines": _LINES[kind]}}
