extends RefCounted
## BC3-01r: source G9976–9981/10009–10010/16693, registration only.
## CH2 bridge supplies the 30 shared moves, 5 phases and 36 shared combos.
## No actor, RNG, clock, Main/State, damage, save or spawn-color connection.
const Shared = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const SOURCE_MAIN = "249c26fad989071a94c19128e524ce0bbcb2c8c9"
const DEPENDENCY_SHA = "a3b5391c54bb62b9f784bf2acac12bfbd2747192"
const GAME_SHA256 = preload("res://source_snapshot/snapshot.gd").SHA256
const _MANIFEST_SHA256 = "3566a0b356c41a32fad3da622a541cb89784942eb7335debb0e53ede3090e47b"
const _NAMES = ["얼음 망령", "서리의 기사", "얼어붙은 감시자", "얼음 속 봉인 괴물"] # G16693
const _BASE = ["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "spin", "grab", "multiDash", "summon", "mine", "vortex", "chaseAoe", "elemBall", "beanStorm", "beanRain", "fanWave", "laser", "tideWave", "groundFissure", "seekerMines", "shieldBash2", "lavaPools", "fireRain", "shockGrid", "donutSlam", "crossWipe", "safeCorner", "tidalWipe", "rapidMissile"] # G9976–9977, cage removed G10010
const _UNLOCKS = [[], ["teleStrike", "delaySlash"], ["teleStrike", "delaySlash", "perilThrust", "spiralBullet"], ["teleStrike", "delaySlash", "perilThrust", "spiralBullet", "gravityWell"]] # G9978–9980
const _COMMON_COMBO_ORDINALS = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 39, 42, 43, 45, 51, 57, 58, 59, 60, 61, 62, 64, 66] # G9881–9950
const _NEW_MOVES = [
	{"id": "laser", "idx": 4, "tele": 40, "rec": 50, "canFeint": false, "canDelay": 0.4, "range": [60, 400], "phase": [1, 2, 3, 4], "combo": ["fan", "vortex", "charge"], "tags": ["ranged", "sustained"], "cd": 180, "source_ordinal": 4, "source_line": 9825}, # G9825
	{"id": "teleStrike", "idx": 16, "tele": 60, "rec": 35, "canFeint": true, "canDelay": 0.4, "range": [60, 400], "phase": [1, 2, 3, 4], "combo": ["slashCombo", "sweep", "grab"], "tags": ["gap-close", "melee"], "cd": 160, "source_ordinal": 16, "source_line": 9837}, # G9837
	{"id": "delaySlash", "idx": 26, "tele": 20, "rec": 60, "canFeint": false, "canDelay": 0, "range": [30, 120], "phase": [0, 1, 2, 3, 4], "combo": ["swordWave", "charge", "sweep"], "tags": ["melee", "frontal"], "cd": 100, "source_ordinal": 27, "source_line": 9848}, # G9848
	{"id": "perilThrust", "idx": 27, "tele": 25, "rec": 35, "canFeint": false, "canDelay": 0, "range": [40, 300], "phase": [0, 1, 2, 3, 4], "combo": ["delaySlash", "slashCombo", "charge"], "tags": ["melee", "gap-close"], "cd": 120, "source_ordinal": 28, "source_line": 9849}, # G9849
	{"id": "gravityWell", "idx": 38, "tele": 25, "rec": 35, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [2, 3, 4], "combo": ["spiralBullet", "elemBall", "charge"], "tags": ["cc", "zone", "utility"], "cd": 200, "source_ordinal": 39, "source_line": 9860}, # G9860
	{"id": "safeCorner", "idx": 53, "tele": 60, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [2, 3, 4], "combo": ["charge", "lavaPools", "fireRain"], "tags": ["zone", "aoe", "wipe"], "cd": 360, "source_ordinal": 54, "source_line": 9875}, # G9875
	{"id": "tidalWipe", "idx": 55, "tele": 60, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [2, 3, 4], "combo": ["charge", "wallPush", "fireRain"], "tags": ["zone", "aoe", "cc"], "cd": 320, "source_ordinal": 56, "source_line": 9877}, # G9877
]
const _NEW_COMBOS = [
	{"seq": ["summon", "laser", "vortex"], "phase": [2, 3, 4], "source_ordinal": 16, "source_line": 9898}, # G9898
	{"seq": ["teleStrike", "slashCombo", "slam"], "phase": [1, 2, 3, 4], "source_ordinal": 22, "source_line": 9904}, # G9904
	{"seq": ["teleStrike", "sweep"], "phase": [1, 2, 3, 4], "source_ordinal": 24, "source_line": 9906}, # G9906
	{"seq": ["delaySlash", "perilThrust"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 34, "source_line": 9916}, # G9916
	{"seq": ["gravityWell", "spiralBullet"], "phase": [2, 3, 4], "source_ordinal": 44, "source_line": 9926}, # G9926
	{"seq": ["safeCorner", "charge", "multiDash"], "phase": [2, 3, 4], "source_ordinal": 63, "source_line": 9945}, # G9945
	{"seq": ["tidalWipe", "charge", "slam"], "phase": [2, 3, 4], "source_ordinal": 65, "source_line": 9947}, # G9947
	{"seq": ["fireRain", "safeCorner"], "phase": [3, 4], "source_ordinal": 67, "source_line": 9949}, # G9949
]

static func source_receipt() -> Dictionary:
	var snapshot: Dictionary = _read_shared()
	var data: Dictionary = _assemble_snapshot(snapshot)
	var receipt: Dictionary = {"ready":data["ready"], "status":data["status"], "reason":data.get("reason", ""),
		"source_main":SOURCE_MAIN, "source_game_sha256":GAME_SHA256, "dependency_sha":DEPENDENCY_SHA,
		"dependency":"CH2 catalog/bridge BC2-01/02; adopted in source_main", "global_move_count":59,
		"global_combo_count":68, "phase_count":5, "ch3_union_count":37, "common_move_count":30,
		"new_move_count":7, "combo_union_count":44, "common_combo_count":36, "new_combo_count":8,
		"max_ch3_source_idx":56, "stages":[10,11,12,13],
		"source_ranges":{"moves":[9820,9880], "combos":[9881,9950], "phases":[9951,9957],
			"ch3_sets":[9976,9981], "cage_removal":[10009,10010], "names":[16693,16693],
			"element_color":[14338,14338], "body_color":[31165,31165]},
		"live_combat_connected":false, "save_io":false, "rng_draws":0}
	if data["ready"]: receipt["move_manifest"]=snapshot["receipt"]["move_manifest"].duplicate(true)
	return receipt

static func boss_for_stage(si: int) -> Dictionary:
	if si<10 or si>13: return {"supported":false, "reason":"unsupported_chapter_stage", "si":si}
	var data: Dictionary = _assemble_snapshot(_read_shared())
	if not data["ready"]:
		return {"supported":false, "status":"NOT_READY", "reason":data["reason"], "si":si}
	return {"supported":true, "si":si, "hell":2, "name_ko":_NAMES[si-10], "element_id":2,
		"element_color":"#3388ff", "ib":true, "etype":0, "move_ids":_set_for_stage(si)}

static func moves_for_stage(si: int) -> Array:
	if si<10 or si>13: return []
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
	if si<10 or si>13 or phase<0 or phase>4: return []
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
	result.append_array(_UNLOCKS[si-10])
	return result

static func _read_shared() -> Dictionary:
	var moves: Dictionary = {}
	for id: String in _set_for_stage(13):
		if _new_move(id).is_empty(): moves[id]=Shared.move_by_id(id)
	var phases: Array = []
	for phase in range(5): phases.append(Shared.phase_by_index(phase))
	var combos: Dictionary = {}
	for si in range(4,10):
		for phase in range(5):
			for combo: Dictionary in Shared.combos_for_stage(si,phase):
				var ordinal: int = combo.get("source_ordinal", -1)
				if not _COMMON_COMBO_ORDINALS.has(ordinal): continue
				# Deduplicate API retrieval of an ordinal, never equal sequences.
				if combos.has(ordinal) and combos[ordinal]!=combo: return {"error":"conflicting_common_combo"}
				combos[ordinal]=combo
	return {"receipt":Shared.source_receipt(), "moves":moves, "phases":phases, "combos":combos}

static func _new_move(id: String) -> Dictionary:
	for move: Dictionary in _NEW_MOVES:
		if move["id"]==id: return move.duplicate(true)
	return {}

## Pure snapshot validation: failure fixtures cannot replace the real Shared.
static func _assemble_snapshot(snapshot: Dictionary) -> Dictionary:
	var error: String = _validate_shared(snapshot)
	if not error.is_empty(): return {"ready":false, "status":"NOT_READY", "reason":"dependency_unready:"+error}
	var moves: Array = []
	var allowed: Array = _set_for_stage(13)
	for entry: Dictionary in snapshot["receipt"]["move_manifest"]:
		var id: String = entry["id"]
		if not allowed.has(id): continue
		var own: Dictionary = _new_move(id)
		moves.append(own if not own.is_empty() else snapshot["moves"][id].duplicate(true))
	var combos: Array = []
	for ordinal in range(68):
		if snapshot["combos"].has(ordinal): combos.append(snapshot["combos"][ordinal].duplicate(true))
		for combo: Dictionary in _NEW_COMBOS:
			if combo["source_ordinal"]==ordinal: combos.append(combo.duplicate(true))
	return {"ready":true, "status":"READY", "moves":moves, "phases":snapshot["phases"].duplicate(true), "combos":combos}

static func _validate_shared(snapshot: Dictionary) -> String:
	if snapshot.has("error"): return str(snapshot["error"])
	for key: String in ["receipt","moves","combos"]:
		if not snapshot.get(key) is Dictionary: return key+"_missing"
	var receipt: Dictionary = snapshot["receipt"]
	if receipt.get("ready")!=true: return "receipt_unready"
	if receipt.get("source_game_sha256")!=GAME_SHA256 or receipt.get("global_move_count")!=59 \
		or receipt.get("global_combo_count")!=68 or receipt.get("phase_count")!=5: return "receipt_mismatch"
	var entries: Variant = receipt.get("move_manifest")
	if not entries is Array or entries.size()!=59: return "manifest_missing"
	var manifest: Dictionary = {}
	var identity_text := ""
	for i in range(59):
		var entry: Variant = entries[i]
		if not entry is Dictionary or entry.size()!=4 or not entry.get("id") is String \
			or not entry.get("idx") is int or entry.get("source_ordinal")!=i \
			or entry.get("source_line")!=9821+i or manifest.has(entry["id"]): return "manifest_invalid"
		manifest[entry["id"]]=entry
		identity_text+="%s:%d:%d:%d\n"%[entry["id"],entry["idx"],i,entry["source_line"]]
	if identity_text.sha256_text()!=_MANIFEST_SHA256: return "manifest_mismatch"
	if snapshot["moves"].size()!=30: return "common_moves_missing"
	for id: String in _set_for_stage(13):
		if not manifest.has(id): return "move_manifest_missing:"+id
		var own: Dictionary = _new_move(id)
		var move: Variant = own if not own.is_empty() else snapshot["moves"].get(id)
		if not move is Dictionary or move.size()!=13: return "move_missing:"+id
		for key: String in ["id","idx","source_ordinal","source_line"]:
			if move.get(key)!=manifest[id][key]: return "move_identity_mismatch:"+id
		for key: String in ["tele","rec","canDelay","cd"]:
			if not _finite_number(move.get(key)): return "move_number_missing:"+id
		if not move.get("canFeint") is bool: return "move_feint_missing:"+id
		if not _number_array(move.get("range"),2) or not _phase_array(move.get("phase")) \
			or not _string_array(move.get("combo")) or not _string_array(move.get("tags")): return "move_fields_missing:"+id
	if not snapshot.get("phases") is Array or snapshot["phases"].size()!=5: return "phases_missing"
	for phase: Variant in snapshot["phases"]:
		if not phase is Dictionary or phase.size()!=8 or not _number_array(phase.get("hp"),2) \
			or not phase.get("label") is String: return "phase_fields_missing"
		for key: String in ["spdM","teleM","cdM","comboC","feintC","delayC"]:
			if not _finite_number(phase.get(key)): return "phase_number_missing"
	if snapshot["combos"].size()!=36: return "common_combos_missing"
	for ordinal: int in _COMMON_COMBO_ORDINALS:
		var combo: Variant = snapshot["combos"].get(ordinal)
		if not combo is Dictionary or combo.size()!=4 or combo.get("source_ordinal")!=ordinal \
			or combo.get("source_line")!=9882+ordinal or not _string_array(combo.get("seq")) \
			or not _phase_array(combo.get("phase")): return "combo_fields_missing"
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
