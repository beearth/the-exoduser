extends RefCounted
## BC4-01: read-only G9982–9990/10009–10010/16692 registration, no live combat.
## CH3 owns 37 shared moves/44 combos; CH2 owns the two additional moves/combos.
const Ch3 = preload("res://scripts/native_ch3_boss_catalog.gd")
const Ch2 = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const SOURCE_MAIN = "823c24baee3f6c5f058ebfd7776721e86f80bd18"
const DEPENDENCIES = {"ch2":"a3b5391c54bb62b9f784bf2acac12bfbd2747192", "ch3":"ec9f14492f587d4d3dfea5780c55bd709875e3e6"}
const GAME_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const _MANIFEST_SHA256 = "3566a0b356c41a32fad3da622a541cb89784942eb7335debb0e53ede3090e47b"
const _NAMES = ["화염 악마", "불기둥 수호자", "용암의 심장", "화염 전사", "화염 쌍두", "불벌레 군주", "화염 감옥지기"] # G16692
const _BASE = ["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "spin", "grab", "multiDash", "summon", "mine", "vortex", "chaseAoe", "elemBall", "beanStorm", "beanRain", "fanWave", "laser", "tideWave", "groundFissure", "seekerMines", "shieldBash2", "teleStrike", "delaySlash", "perilThrust", "meteor", "radialLaser", "spiralBullet", "poisonTrail", "lavaPools", "fireRain", "shockGrid", "donutSlam", "crossWipe", "safeCorner", "tidalWipe", "rapidMissile"] # G9983; cage removal G10010
const _UNLOCKS = [[], ["swordWave"], ["swordWave", "pillars"], ["swordWave", "pillars", "burstCounter"], ["swordWave", "pillars", "burstCounter", "wallPush"], ["swordWave", "pillars", "burstCounter", "wallPush", "gravityWell"], ["swordWave", "pillars", "burstCounter", "wallPush", "gravityWell", "chainLightning"]] # G9984–9990
const _COMMON_COMBO_ORDINALS = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 34, 39, 42, 43, 44, 45, 47, 48, 51, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67] # G9882–9949
const _NEW_MOVES = [
	{"id": "meteor", "idx": 7, "tele": 40, "rec": 50, "canFeint": false, "canDelay": 0, "range": [80, 500], "phase": [1, 2, 3, 4], "combo": ["vortex", "charge", "multiDash"], "tags": ["aoe", "ranged"], "cd": 220, "source_ordinal": 7, "source_line": 9828}, # G9828
	{"id": "radialLaser", "idx": 20, "tele": 35, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["aoe", "ranged", "sustained"], "cd": 240, "source_ordinal": 21, "source_line": 9842}, # G9842
	{"id": "swordWave", "idx": 23, "tele": 25, "rec": 60, "canFeint": true, "canDelay": 0.3, "range": [40, 350], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "slashCombo", "sweep", "teleStrike"], "tags": ["ranged", "frontal", "redbean"], "cd": 120, "source_ordinal": 24, "source_line": 9845}, # G9845
	{"id": "pillars", "idx": 28, "tele": 35, "rec": 45, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "fan", "elemBall"], "tags": ["aoe", "zone", "utility"], "cd": 200, "source_ordinal": 29, "source_line": 9850}, # G9850
	{"id": "burstCounter", "idx": 60, "tele": 20, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 150], "phase": [1, 2, 3, 4], "combo": ["slashCombo", "sweep", "charge"], "tags": ["aoe", "melee", "punish"], "cd": 160, "source_ordinal": 31, "source_line": 9852}, # G9852
	{"id": "chainLightning", "idx": 42, "tele": 25, "rec": 35, "canFeint": false, "canDelay": 0, "range": [60, 400], "phase": [1, 2, 3, 4], "combo": ["fan", "burst", "charge"], "tags": ["ranged", "multi-hit"], "cd": 140, "source_ordinal": 43, "source_line": 9864}, # G9864
]
const _NEW_COMBOS = [
	{"seq": ["meteor", "fan", "charge"], "phase": [1, 2, 3, 4], "source_ordinal": 13, "source_line": 9895}, # G9895
	{"seq": ["meteor", "multiDash", "burst"], "phase": [2, 3, 4], "source_ordinal": 14, "source_line": 9896}, # G9896
	{"seq": ["swordWave", "charge", "slashCombo"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 30, "source_line": 9912}, # G9912
	{"seq": ["teleStrike", "swordWave", "sweep"], "phase": [1, 2, 3, 4], "source_ordinal": 31, "source_line": 9913}, # G9913
	{"seq": ["swordWave", "swordWave", "charge"], "phase": [2, 3, 4], "source_ordinal": 32, "source_line": 9914}, # G9914
	{"seq": ["pillars", "charge", "elemBall"], "phase": [1, 2, 3, 4], "source_ordinal": 35, "source_line": 9917}, # G9917
	{"seq": ["chainLightning", "charge", "sweep"], "phase": [1, 2, 3, 4], "source_ordinal": 49, "source_line": 9931}, # G9931
	{"seq": ["wallPush", "gravityWell"], "phase": [3, 4], "source_ordinal": 56, "source_line": 9938}, # G9938
]

static func source_receipt() -> Dictionary:
	var snapshot: Dictionary = _read_shared()
	var data: Dictionary = _assemble_snapshot(snapshot)
	var receipt: Dictionary = {"ready":data["ready"], "status":data["status"], "reason":data.get("reason",""),
		"source_main":SOURCE_MAIN, "source_game_sha256":GAME_SHA256, "dependencies":DEPENDENCIES.duplicate(true),
		"global_move_count":59, "global_combo_count":68, "phase_count":5, "ch4_union_count":45,
		"common_move_count":39, "new_move_count":6, "combo_union_count":54, "common_combo_count":46,
		"new_combo_count":8, "max_source_idx":60, "active_idx60":true, "stages":[14,15,16,17,18,19,20],
		"source_ranges":{"moves":[9820,9880], "combos":[9881,9950], "phases":[9951,9957],
			"ch4_sets":[9982,9990], "cage_removal":[10009,10010], "names":[16692,16692],
			"element_color":[14338,14338], "body_color":[31163,31163]},
		"live_combat_connected":false, "save_io":false, "rng_draws":0}
	if data["ready"]: receipt["move_manifest"]=snapshot["ch3_receipt"]["move_manifest"].duplicate(true)
	return receipt

static func boss_for_stage(si: int) -> Dictionary:
	if si<14 or si>20: return {"supported":false,"reason":"unsupported_chapter_stage","si":si}
	var data: Dictionary = _assemble_snapshot(_read_shared())
	if not data["ready"]: return {"supported":false,"status":"NOT_READY","reason":data["reason"],"si":si}
	return {"supported":true,"si":si,"hell":3,"name_ko":_NAMES[si-14],"element_id":1,
		"element_color":"#ff5522","ib":true,"etype":0,"move_ids":_set_for_stage(si)} # G14333/14338/16692/31163

static func moves_for_stage(si: int) -> Array:
	if si<14 or si>20: return []
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
	if si<14 or si>20 or phase<0 or phase>4: return []
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
	result.append_array(_UNLOCKS[si-14])
	return result

static func _new_move(id: String) -> Dictionary:
	for move: Dictionary in _NEW_MOVES:
		if move["id"]==id: return move.duplicate(true)
	return {}

static func _read_combos(provider: Variant, first: int, end: int) -> Dictionary:
	if not provider is GDScript: return {"error":"catalog_provider_required"}
	var result: Dictionary = {}
	for si in range(first,end):
		for phase in range(5):
			for combo: Dictionary in provider.combos_for_stage(si,phase):
				var ordinal: int = combo.get("source_ordinal",-1)
				# Collapse repeated API retrieval only; equal seq at different ordinals survive.
				if result.has(ordinal) and result[ordinal]!=combo: return {"error":"conflicting_common_combo"}
				result[ordinal]=combo
	return result

static func _read_shared() -> Dictionary:
	var moves3: Dictionary = {}
	var moves2: Dictionary = {}
	for id: String in _set_for_stage(20):
		if not _new_move(id).is_empty(): continue
		if id not in ["poisonTrail","wallPush"]: moves3[id]=Ch3.move_by_id(id)
		var move: Dictionary = Ch2.move_by_id(id)
		if not move.is_empty(): moves2[id]=move
	var phases3: Array = []
	var phases2: Array = []
	for phase in range(5):
		phases3.append(Ch3.phase_by_index(phase))
		phases2.append(Ch2.phase_by_index(phase))
	return {"ch3_receipt":Ch3.source_receipt(),"ch2_receipt":Ch2.source_receipt(),
		"ch3_moves":moves3,"ch2_moves":moves2,"ch3_phases":phases3,"ch2_phases":phases2,
		"ch3_combos":_read_combos(Ch3,10,14),"ch2_combos":_read_combos(Ch2,4,10)}

## Pure validation hook for failure fixtures; does not replace either real provider.
static func _assemble_snapshot(snapshot: Dictionary) -> Dictionary:
	var error: String = _validate_shared(snapshot)
	if not error.is_empty(): return {"ready":false,"status":"NOT_READY","reason":"dependency_unready:"+error}
	var moves: Array = []
	var allowed: Array = _set_for_stage(20)
	for entry: Dictionary in snapshot["ch3_receipt"]["move_manifest"]:
		var id: String = entry["id"]
		if not allowed.has(id): continue
		var move: Dictionary = _new_move(id)
		if move.is_empty(): move=snapshot["ch3_moves"].get(id,snapshot["ch2_moves"].get(id,{}))
		moves.append(move.duplicate(true))
	var shared: Dictionary = snapshot["ch3_combos"].duplicate(true)
	for ordinal: int in [47,48]: shared[ordinal]=snapshot["ch2_combos"][ordinal].duplicate(true)
	var combos: Array = []
	for ordinal in range(68):
		if shared.has(ordinal): combos.append(shared[ordinal].duplicate(true))
		for combo: Dictionary in _NEW_COMBOS:
			if combo["source_ordinal"]==ordinal: combos.append(combo.duplicate(true))
	return {"ready":true,"status":"READY","moves":moves,"phases":snapshot["ch3_phases"].duplicate(true),"combos":combos}

static func _validate_shared(s: Dictionary) -> String:
	for chapter: String in ["ch3","ch2"]:
		for suffix: String in ["receipt","moves","combos"]:
			if not s.get(chapter+"_"+suffix) is Dictionary: return chapter+"_"+suffix+"_missing"
		var receipt: Dictionary = s[chapter+"_receipt"]
		if receipt.get("ready")!=true: return chapter+"_unready"
		if receipt.get("source_game_sha256")!=GAME_SHA256 or receipt.get("global_move_count")!=59 \
			or receipt.get("global_combo_count")!=68 or receipt.get("phase_count")!=5: return chapter+"_receipt_mismatch"
		var entries: Variant = receipt.get("move_manifest")
		if not entries is Array or entries.size()!=59: return chapter+"_manifest_missing"
		var identity := ""
		var seen: Dictionary = {}
		for i in range(59):
			var entry: Variant = entries[i]
			if not entry is Dictionary or entry.size()!=4 or not entry.get("id") is String \
				or not entry.get("idx") is int or not entry.get("source_ordinal") is int \
				or not entry.get("source_line") is int or entry.get("source_ordinal")!=i \
				or entry.get("source_line")!=9821+i or seen.has(entry["id"]): return chapter+"_manifest_invalid"
			seen[entry["id"]]=true
			identity+="%s:%d:%d:%d\n"%[entry["id"],entry["idx"],i,entry["source_line"]]
		if identity.sha256_text()!=_MANIFEST_SHA256: return chapter+"_manifest_mismatch"
		var phases: Variant = s.get(chapter+"_phases")
		if not phases is Array or phases.size()!=5: return chapter+"_phases_missing"
		for phase: Variant in phases:
			if not phase is Dictionary or phase.size()!=8 or not Ch3._number_array(phase.get("hp"),2) \
				or not phase.get("label") is String: return chapter+"_phase_fields_missing"
			for key: String in ["spdM","teleM","cdM","comboC","feintC","delayC"]:
				if not Ch3._finite_number(phase.get(key)): return chapter+"_phase_number_missing"
		if s[chapter+"_moves"].size()!=(37 if chapter=="ch3" else 32): return chapter+"_moves_missing"
		if s[chapter+"_combos"].has("error"): return chapter+"_"+str(s[chapter+"_combos"]["error"])
		if s[chapter+"_combos"].size()!=(44 if chapter=="ch3" else 38): return chapter+"_combos_missing"
	if s["ch3_receipt"]["move_manifest"]!=s["ch2_receipt"]["move_manifest"]: return "manifest_disagreement"
	if s["ch3_phases"]!=s["ch2_phases"]: return "phase_disagreement"
	var manifest: Dictionary = {}
	for entry: Dictionary in s["ch3_receipt"]["move_manifest"]: manifest[entry["id"]]=entry
	var overlap := 0
	for id: String in _set_for_stage(20):
		var own: Dictionary = _new_move(id)
		if not own.is_empty():
			if s["ch3_moves"].has(id) or s["ch2_moves"].has(id): return "own_move_in_dependency"
			if not _valid_move(own,manifest[id]): return "own_move_invalid:"+id
			continue
		if id in ["poisonTrail","wallPush"]:
			if s["ch3_moves"].has(id) or not _valid_move(s["ch2_moves"].get(id),manifest[id]): return "ch2_move_missing:"+id
		else:
			if not _valid_move(s["ch3_moves"].get(id),manifest[id]): return "ch3_move_missing:"+id
			if s["ch2_moves"].has(id):
				overlap+=1
				if not _valid_move(s["ch2_moves"][id],manifest[id]) or s["ch3_moves"][id]!=s["ch2_moves"][id]: return "move_disagreement:"+id
	if overlap!=30: return "overlap_moves_missing"
	var combined: Dictionary = s["ch3_combos"].duplicate(true)
	var combo_overlap := 0
	for ordinal: Variant in s["ch2_combos"]:
		if combined.has(ordinal):
			combo_overlap+=1
			if combined[ordinal]!=s["ch2_combos"][ordinal]: return "combo_disagreement"
		elif ordinal not in [47,48]: return "unowned_ch2_combo"
		combined[ordinal]=s["ch2_combos"][ordinal]
	if combo_overlap!=36 or combined.size()!=46: return "combo_overlap_missing"
	for ordinal: int in _COMMON_COMBO_ORDINALS:
		var combo: Variant = combined.get(ordinal)
		if not combo is Dictionary or combo.size()!=4 or not combo.get("source_ordinal") is int \
			or not combo.get("source_line") is int or combo.get("source_ordinal")!=ordinal \
			or combo.get("source_line")!=9882+ordinal or not Ch3._string_array(combo.get("seq")) \
			or not Ch3._phase_array(combo.get("phase")): return "combo_fields_missing"
		for id: String in combo["seq"]:
			if not s["ch3_moves"].has(id) and not s["ch2_moves"].has(id): return "common_combo_move_missing"
	return ""

static func _valid_move(move: Variant, identity: Dictionary) -> bool:
	if not move is Dictionary or move.size()!=13: return false
	if not move.get("id") is String: return false
	for key: String in ["idx","source_ordinal","source_line"]:
		if not move.get(key) is int: return false
	for key: String in ["id","idx","source_ordinal","source_line"]:
		if move.get(key)!=identity[key]: return false
	for key: String in ["tele","rec","canDelay","cd"]:
		if not Ch3._finite_number(move.get(key)): return false
	return move.get("canFeint") is bool and Ch3._number_array(move.get("range"),2) \
		and Ch3._phase_array(move.get("phase")) and Ch3._string_array(move.get("combo")) and Ch3._string_array(move.get("tags"))
