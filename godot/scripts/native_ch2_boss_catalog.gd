extends RefCounted
## BC2-01: CH2 registration only. No actor, RNG, clock, save or Main connection.
## Common 22 moves, 5 phases and 25 combo records are read from the adopted BC01.
## Metadata rec is not an instruction to change the runtime recovery duration.
const Shared = preload("res://scripts/native_ch1_boss_catalog.gd")
const SOURCE_MAIN = "0119f3048a459a458ba142d98f68126b8e281be1"
const GAME_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const _NAMES = ["벌레 수호자", "점액 괴수", "기생충 모체", "거대 알주머니", "살벽의 군주", "여왕 구더기"]
const _BASE = ["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "spin", "grab", "multiDash", "poisonTrail", "summon", "mine", "vortex", "chaseAoe", "elemBall", "beanStorm", "beanRain", "groundFissure", "tideWave", "lavaPools", "fireRain", "shockGrid", "donutSlam", "crossWipe", "rapidMissile"]
const _UNLOCKS = ["seekerMines", "fanWave", "wallPush", "shieldBash2", "spiralBullet"]
const _COMMON_COMBO_ORDINALS = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 17, 18, 19, 20, 21, 23, 25, 26, 27, 42, 43, 45, 48, 57]
const _NEW_MOVES = [
	{"id": "vortex", "idx": 11, "tele": 25, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 250], "phase": [1, 2, 3, 4], "combo": ["burst", "meteor", "charge"], "tags": ["aoe", "cc"], "cd": 220, "source_ordinal": 11, "source_line": 9832},
	{"id": "beanRain", "idx": 18, "tele": 60, "rec": 60, "canFeint": false, "canDelay": 0, "range": [60, 400], "phase": [1, 2, 3, 4], "combo": ["beanStorm", "charge", "vortex"], "tags": ["ranged", "sustained", "redbean"], "cd": 120, "source_ordinal": 19, "source_line": 9840},
	{"id": "fanWave", "idx": 19, "tele": 60, "rec": 40, "canFeint": false, "canDelay": 0, "range": [60, 500], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "slam"], "tags": ["ranged", "frontal", "aoe"], "cd": 160, "source_ordinal": 20, "source_line": 9841},
	{"id": "spiralBullet", "idx": 25, "tele": 35, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["aoe", "ranged", "sustained"], "cd": 200, "source_ordinal": 26, "source_line": 9847},
	{"id": "wallPush", "idx": 39, "tele": 60, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [2, 3, 4], "combo": ["charge", "elemBall", "spiralBullet"], "tags": ["zone", "utility", "cc"], "cd": 240, "source_ordinal": 40, "source_line": 9861},
	{"id": "shieldBash2", "idx": 44, "tele": 20, "rec": 60, "canFeint": false, "canDelay": 0.2, "range": [40, 200], "phase": [0, 1, 2, 3, 4], "combo": ["slashCombo", "sweep", "charge"], "tags": ["melee", "gap-close"], "cd": 120, "source_ordinal": 45, "source_line": 9866},
	{"id": "fireRain", "idx": 50, "tele": 60, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "chaseAoe", "elemBall"], "tags": ["zone", "aoe", "ranged"], "cd": 220, "source_ordinal": 51, "source_line": 9872},
	{"id": "shockGrid", "idx": 51, "tele": 40, "rec": 45, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "fan", "spiralBullet"], "tags": ["zone", "aoe", "cc"], "cd": 240, "source_ordinal": 52, "source_line": 9873},
	{"id": "donutSlam", "idx": 52, "tele": 60, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "burst", "shockGrid"], "tags": ["zone", "aoe", "punish"], "cd": 300, "source_ordinal": 53, "source_line": 9874},
	{"id": "crossWipe", "idx": 54, "tele": 50, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "shockGrid", "fan"], "tags": ["zone", "aoe", "sustained"], "cd": 280, "source_ordinal": 55, "source_line": 9876},
]
const _NEW_COMBOS = [
	{"seq": ["mine", "vortex", "burst"], "phase": [2, 3, 4], "source_ordinal": 12, "source_line": 9894},
	{"seq": ["beanRain", "beanStorm", "burst"], "phase": [2, 3, 4], "source_ordinal": 28, "source_line": 9910},
	{"seq": ["vortex", "beanRain", "beanStorm"], "phase": [3, 4], "source_ordinal": 29, "source_line": 9911},
	{"seq": ["spiralBullet", "charge", "slam"], "phase": [2, 3, 4], "source_ordinal": 39, "source_line": 9921},
	{"seq": ["wallPush", "charge", "slam"], "phase": [2, 3, 4], "source_ordinal": 47, "source_line": 9929},
	{"seq": ["shieldBash2", "slashCombo", "sweep"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 51, "source_line": 9933},
	{"seq": ["fireRain", "charge", "fan"], "phase": [1, 2, 3, 4], "source_ordinal": 58, "source_line": 9940},
	{"seq": ["shockGrid", "charge", "multiDash"], "phase": [1, 2, 3, 4], "source_ordinal": 59, "source_line": 9941},
	{"seq": ["lavaPools", "fireRain"], "phase": [2, 3, 4], "source_ordinal": 60, "source_line": 9942},
	{"seq": ["shockGrid", "spiralBullet"], "phase": [2, 3, 4], "source_ordinal": 61, "source_line": 9943},
	{"seq": ["donutSlam", "charge", "slam"], "phase": [1, 2, 3, 4], "source_ordinal": 62, "source_line": 9944},
	{"seq": ["crossWipe", "charge", "fan"], "phase": [1, 2, 3, 4], "source_ordinal": 64, "source_line": 9946},
	{"seq": ["donutSlam", "crossWipe"], "phase": [3, 4], "source_ordinal": 66, "source_line": 9948},
]

static func source_receipt() -> Dictionary:
	var data: Dictionary = _assemble_snapshot(_read_shared())
	return {"ready":data["ready"], "reason":data.get("reason", ""),
		"source_main":SOURCE_MAIN, "source_game_sha256":GAME_SHA256,
		"dependency":"BC01 e4396da5e7541562542ab65053d8ecac0bf16e52; adopted in source_main",
		"global_move_count":59, "global_combo_count":68, "phase_count":5,
		"ch2_union_count":32, "common_move_count":22, "new_move_count":10,
		"combo_union_count":38, "common_combo_count":25, "new_combo_count":13,
		"max_ch2_source_idx":56, "stages":[4,5,6,7,8,9],
		"source_ranges":{"moves":[9820,9880], "combos":[9881,9950], "phases":[9951,9957],
			"ch2_sets":[9968,9975], "cage_removal":[10009,10010], "names":[16690,16690]},
		"live_combat_connected":false, "save_io":false, "rng_draws":0}

static func boss_for_stage(si: int) -> Dictionary:
	if si<4 or si>9:
		return {"supported":false, "reason":"unsupported_chapter_stage", "si":si}
	var data: Dictionary = _assemble_snapshot(_read_shared())
	if not data["ready"]:
		return {"supported":false, "reason":data["reason"], "si":si}
	return {"supported":true, "si":si, "hell":1, "name_ko":_NAMES[si-4],
		"element_id":0, "ib":true, "etype":0, "move_ids":_set_for_stage(si)}

static func moves_for_stage(si: int) -> Array:
	if si<4 or si>9: return []
	var data: Dictionary = _assemble_snapshot(_read_shared())
	if not data["ready"]: return []
	var allowed: Array = _set_for_stage(si)
	var result: Array = []
	for move: Dictionary in data["moves"]:
		if allowed.has(move["id"]): result.append(move.duplicate(true))
	return result

static func move_by_id(id: String) -> Dictionary:
	var data: Dictionary = _assemble_snapshot(_read_shared())
	if not data["ready"]: return {}
	for move: Dictionary in data["moves"]:
		if move["id"]==id: return move.duplicate(true)
	return {}

static func phase_by_index(phase: int) -> Dictionary:
	if phase<0 or phase>4: return {}
	var data: Dictionary = _assemble_snapshot(_read_shared())
	if not data["ready"]: return {}
	return data["phases"][phase].duplicate(true)

static func combos_for_stage(si: int, phase: int) -> Array:
	if si<4 or si>9 or phase<0 or phase>4: return []
	var data: Dictionary = _assemble_snapshot(_read_shared())
	if not data["ready"]: return []
	var allowed: Array = _set_for_stage(si)
	var result: Array = []
	for combo: Dictionary in data["combos"]:
		if not combo["phase"].has(phase): continue
		var fits := true
		for id: String in combo["seq"]:
			if not allowed.has(id): fits=false; break
		if fits: result.append(combo.duplicate(true))
	return result

static func _set_for_stage(si: int) -> Array:
	var result: Array = _BASE.duplicate()
	for i in range(si-4): result.append(_UNLOCKS[i])
	return result

static func _read_shared() -> Dictionary:
	var moves: Dictionary = {}
	for id: String in _set_for_stage(9):
		if not _new_move(id): moves[id]=Shared.move_by_id(id)
	var phases: Array = []
	for phase in range(5): phases.append(Shared.phase_by_index(phase))
	var combos: Dictionary = {}
	for si in range(4):
		for phase in range(5):
			for combo: Dictionary in Shared.combos_for_stage(si,phase):
				var ordinal: int = combo.get("source_ordinal", -1)
				if not _COMMON_COMBO_ORDINALS.has(ordinal): continue
				# Collapse repeated API retrieval of one ordinal, never equal sequences.
				if combos.has(ordinal) and combos[ordinal]!=combo:
					return {"error":"conflicting_common_combo"}
				combos[ordinal]=combo
	return {"receipt":Shared.source_receipt(), "moves":moves, "phases":phases, "combos":combos}

static func _new_move(id: String) -> Dictionary:
	for move: Dictionary in _NEW_MOVES:
		if move["id"]==id: return move.duplicate(true)
	return {}

## Pure snapshot boundary also permits failure fixtures without replacing Shared.
## Malformed/missing dependencies never yield a ready partial catalog.
static func _assemble_snapshot(snapshot: Dictionary) -> Dictionary:
	var error: String = _validate_shared(snapshot)
	if not error.is_empty(): return {"ready":false, "reason":"dependency_unready:"+error}
	var moves: Array = []
	var allowed: Array = _set_for_stage(9)
	for entry: Dictionary in snapshot["receipt"]["move_manifest"]:
		var id: String = entry["id"]
		if not allowed.has(id): continue
		moves.append(_new_move(id) if _new_move(id) else snapshot["moves"][id].duplicate(true))
	var combos: Array = []
	for ordinal in range(68):
		if snapshot["combos"].has(ordinal): combos.append(snapshot["combos"][ordinal].duplicate(true))
		for combo: Dictionary in _NEW_COMBOS:
			if combo["source_ordinal"]==ordinal: combos.append(combo.duplicate(true))
	return {"ready":true, "moves":moves, "phases":snapshot["phases"].duplicate(true), "combos":combos}

static func _validate_shared(snapshot: Dictionary) -> String:
	for key: String in ["receipt","moves","combos"]:
		if not snapshot.get(key) is Dictionary: return key+"_missing"
	var receipt: Dictionary = snapshot["receipt"]
	if receipt.get("source_game_sha256")!=GAME_SHA256 or receipt.get("global_move_count")!=59 		or receipt.get("global_combo_count")!=68: return "receipt_mismatch"
	if not receipt.get("move_manifest") is Array or receipt["move_manifest"].size()!=59: return "manifest_missing"
	var manifest: Dictionary = {}
	for i in range(59):
		var entry: Variant = receipt["move_manifest"][i]
		if not entry is Dictionary or not entry.get("id") is String 			or not entry.get("idx") is int or entry.get("source_ordinal")!=i 			or entry.get("source_line")!=9821+i or manifest.has(entry["id"]): return "manifest_invalid"
		manifest[entry["id"]]=entry
	if snapshot["moves"].size()!=22: return "common_moves_missing"
	for id: String in _set_for_stage(9):
		if not manifest.has(id): return "move_manifest_missing:"+id
		var move: Variant = _new_move(id) if _new_move(id) else snapshot["moves"].get(id)
		if not move is Dictionary or move.size()!=13: return "move_missing:"+id
		for key: String in ["id","idx","source_ordinal","source_line"]:
			if move.get(key)!=manifest[id][key]: return "move_identity_mismatch:"+id
		for key: String in ["tele","rec","canDelay","cd"]:
			if not _finite_number(move.get(key)): return "move_number_missing:"+id
		if not move.get("canFeint") is bool: return "move_feint_missing:"+id
		if not _number_array(move.get("range"),2) or not _phase_array(move.get("phase")) 			or not _string_array(move.get("combo")) or not _string_array(move.get("tags")): return "move_fields_missing:"+id
	if not snapshot.get("phases") is Array or snapshot["phases"].size()!=5: return "phases_missing"
	for phase: Variant in snapshot["phases"]:
		if not phase is Dictionary or phase.size()!=8 or not _number_array(phase.get("hp"),2) 			or not phase.get("label") is String: return "phase_fields_missing"
		for key: String in ["spdM","teleM","cdM","comboC","feintC","delayC"]:
			if not _finite_number(phase.get(key)): return "phase_number_missing"
	if snapshot["combos"].size()!=25: return "common_combos_missing"
	for ordinal: int in _COMMON_COMBO_ORDINALS:
		var combo: Variant = snapshot["combos"].get(ordinal)
		if not combo is Dictionary or combo.size()!=4 or combo.get("source_ordinal")!=ordinal 			or combo.get("source_line")!=9882+ordinal or not _string_array(combo.get("seq")) 			or not _phase_array(combo.get("phase")): return "combo_fields_missing"
		for id: String in combo["seq"]:
			if not snapshot["moves"].has(id): return "common_combo_move_missing"
	return ""

static func _finite_number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))
static func _number_array(value: Variant, count: int) -> bool:
	if not value is Array or value.size()!=count: return false
	for item: Variant in value:
		if not _finite_number(item): return false
	return true
static func _string_array(value: Variant) -> bool:
	if not value is Array or value.is_empty(): return false
	for item: Variant in value:
		if not item is String: return false
	return true
static func _phase_array(value: Variant) -> bool:
	if not value is Array or value.is_empty(): return false
	for item: Variant in value:
		if not item is int or item<0 or item>4: return false
	return true
