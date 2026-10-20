extends SceneTree
## BC01 source registration contract. No Main or scene/actor instantiation.
## Independent literals were extracted from game.html:9820-9967 at source_main below.
## Original source numbers/moves/HP behavior are unchanged; this module has no HP logic.

const Catalog = preload("res://scripts/native_ch1_boss_catalog.gd")
const USERDIR = "EXODUSER-bc01-Isolated-20261020"
const SOURCE_MAIN = "c3cf8ce6b0cc1a5c381240260e03dff71c68af8d"
const GAME_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const GROUPS = ["receipt_and_sparse_ids", "four_final_sets", "all_move_fields",
	"all_phase_fields", "combo_membership_phase_order", "copy_isolation", "invalid_inputs"]

const EXPECTED_MANIFEST = [
	{"id": "burst", "idx": 0, "source_ordinal": 0, "source_line": 9821},
	{"id": "fan", "idx": 1, "source_ordinal": 1, "source_line": 9822},
	{"id": "charge", "idx": 2, "source_ordinal": 2, "source_line": 9823},
	{"id": "jump", "idx": 3, "source_ordinal": 3, "source_line": 9824},
	{"id": "laser", "idx": 4, "source_ordinal": 4, "source_line": 9825},
	{"id": "shock", "idx": 5, "source_ordinal": 5, "source_line": 9826},
	{"id": "summon", "idx": 6, "source_ordinal": 6, "source_line": 9827},
	{"id": "meteor", "idx": 7, "source_ordinal": 7, "source_line": 9828},
	{"id": "grab", "idx": 8, "source_ordinal": 8, "source_line": 9829},
	{"id": "spin", "idx": 9, "source_ordinal": 9, "source_line": 9830},
	{"id": "mine", "idx": 10, "source_ordinal": 10, "source_line": 9831},
	{"id": "vortex", "idx": 11, "source_ordinal": 11, "source_line": 9832},
	{"id": "multiDash", "idx": 12, "source_ordinal": 12, "source_line": 9833},
	{"id": "slashCombo", "idx": 13, "source_ordinal": 13, "source_line": 9834},
	{"id": "slam", "idx": 14, "source_ordinal": 14, "source_line": 9835},
	{"id": "sweep", "idx": 15, "source_ordinal": 15, "source_line": 9836},
	{"id": "teleStrike", "idx": 16, "source_ordinal": 16, "source_line": 9837},
	{"id": "burrowStrike", "idx": 58, "source_ordinal": 17, "source_line": 9838},
	{"id": "beanStorm", "idx": 17, "source_ordinal": 18, "source_line": 9839},
	{"id": "beanRain", "idx": 18, "source_ordinal": 19, "source_line": 9840},
	{"id": "fanWave", "idx": 19, "source_ordinal": 20, "source_line": 9841},
	{"id": "radialLaser", "idx": 20, "source_ordinal": 21, "source_line": 9842},
	{"id": "chaseAoe", "idx": 21, "source_ordinal": 22, "source_line": 9843},
	{"id": "elemBall", "idx": 22, "source_ordinal": 23, "source_line": 9844},
	{"id": "swordWave", "idx": 23, "source_ordinal": 24, "source_line": 9845},
	{"id": "judgeCut", "idx": 24, "source_ordinal": 25, "source_line": 9846},
	{"id": "spiralBullet", "idx": 25, "source_ordinal": 26, "source_line": 9847},
	{"id": "delaySlash", "idx": 26, "source_ordinal": 27, "source_line": 9848},
	{"id": "perilThrust", "idx": 27, "source_ordinal": 28, "source_line": 9849},
	{"id": "pillars", "idx": 28, "source_ordinal": 29, "source_line": 9850},
	{"id": "phantomSwords", "idx": 29, "source_ordinal": 30, "source_line": 9851},
	{"id": "burstCounter", "idx": 60, "source_ordinal": 31, "source_line": 9852},
	{"id": "crescendoCombo", "idx": 31, "source_ordinal": 32, "source_line": 9853},
	{"id": "darkZone", "idx": 32, "source_ordinal": 33, "source_line": 9854},
	{"id": "mirrorClone", "idx": 33, "source_ordinal": 34, "source_line": 9855},
	{"id": "groundFissure", "idx": 34, "source_ordinal": 35, "source_line": 9856},
	{"id": "tideWave", "idx": 35, "source_ordinal": 36, "source_line": 9857},
	{"id": "seekerMines", "idx": 36, "source_ordinal": 37, "source_line": 9858},
	{"id": "rewindStrike", "idx": 37, "source_ordinal": 38, "source_line": 9859},
	{"id": "gravityWell", "idx": 38, "source_ordinal": 39, "source_line": 9860},
	{"id": "wallPush", "idx": 39, "source_ordinal": 40, "source_line": 9861},
	{"id": "poisonTrail", "idx": 40, "source_ordinal": 41, "source_line": 9862},
	{"id": "cageTrap", "idx": 41, "source_ordinal": 42, "source_line": 9863},
	{"id": "chainLightning", "idx": 42, "source_ordinal": 43, "source_line": 9864},
	{"id": "orbWeave", "idx": 43, "source_ordinal": 44, "source_line": 9865},
	{"id": "shieldBash2", "idx": 44, "source_ordinal": 45, "source_line": 9866},
	{"id": "mirrorGuard", "idx": 45, "source_ordinal": 46, "source_line": 9867},
	{"id": "soulAnchor", "idx": 46, "source_ordinal": 47, "source_line": 9868},
	{"id": "doppelganger", "idx": 47, "source_ordinal": 48, "source_line": 9869},
	{"id": "itemSteal", "idx": 48, "source_ordinal": 49, "source_line": 9870},
	{"id": "lavaPools", "idx": 49, "source_ordinal": 50, "source_line": 9871},
	{"id": "fireRain", "idx": 50, "source_ordinal": 51, "source_line": 9872},
	{"id": "shockGrid", "idx": 51, "source_ordinal": 52, "source_line": 9873},
	{"id": "donutSlam", "idx": 52, "source_ordinal": 53, "source_line": 9874},
	{"id": "safeCorner", "idx": 53, "source_ordinal": 54, "source_line": 9875},
	{"id": "crossWipe", "idx": 54, "source_ordinal": 55, "source_line": 9876},
	{"id": "tidalWipe", "idx": 55, "source_ordinal": 56, "source_line": 9877},
	{"id": "rapidMissile", "idx": 56, "source_ordinal": 57, "source_line": 9878},
	{"id": "tailSwipe", "idx": 57, "source_ordinal": 58, "source_line": 9879},
]

const EXPECTED_SETS = [
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "groundFissure", "poisonTrail", "spin", "grab", "multiDash", "tideWave", "chaseAoe", "elemBall", "beanStorm", "summon", "mine", "seekerMines", "lavaPools", "rapidMissile", "burrowStrike"],
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "groundFissure", "poisonTrail", "spin", "grab", "multiDash", "tideWave", "chaseAoe", "elemBall", "beanStorm", "summon", "mine", "lavaPools", "rapidMissile"],
	["jump", "charge", "slashCombo", "sweep", "tailSwipe", "spin", "slam", "beanStorm", "fan", "multiDash"],
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "groundFissure", "poisonTrail", "spin", "grab", "multiDash", "tideWave", "chaseAoe", "elemBall", "beanStorm", "summon", "mine", "seekerMines", "lavaPools", "rapidMissile", "burrowStrike"],
]

const EXPECTED_MOVES = [
	{"id": "burst", "idx": 0, "tele": 45, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["fan", "shock", "charge"], "tags": ["aoe", "ranged"], "cd": 140},
	{"id": "fan", "idx": 1, "tele": 25, "rec": 35, "canFeint": false, "canDelay": 0.3, "range": [60, 300], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "mine", "multiDash"], "tags": ["ranged", "frontal"], "cd": 100},
	{"id": "charge", "idx": 2, "tele": 40, "rec": 60, "canFeint": true, "canDelay": 0.5, "range": [40, 400], "phase": [0, 1, 2, 3, 4], "combo": ["spin", "grab", "shock", "multiDash"], "tags": ["gap-close", "melee"], "cd": 100},
	{"id": "jump", "idx": 3, "tele": 34, "rec": 30, "canFeint": false, "canDelay": 0, "range": [80, 500], "phase": [0, 1, 2, 3, 4], "combo": ["shock", "burst", "spin"], "tags": ["gap-close", "aoe"], "cd": 150},
	{"id": "shock", "idx": 5, "tele": 35, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 180], "phase": [0, 1, 2, 3, 4], "combo": ["summon", "mine", "charge"], "tags": ["aoe", "melee"], "cd": 120},
	{"id": "summon", "idx": 6, "tele": 45, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "burst"], "tags": ["utility"], "cd": 300},
	{"id": "grab", "idx": 8, "tele": 60, "rec": 50, "canFeint": true, "canDelay": 0.5, "range": [0, 150], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "spin"], "tags": ["melee", "punish"], "cd": 180},
	{"id": "spin", "idx": 9, "tele": 28, "rec": 40, "canFeint": false, "canDelay": 0.3, "range": [0, 100], "phase": [0, 1, 2, 3, 4], "combo": ["burst", "fan", "multiDash"], "tags": ["melee", "aoe"], "cd": 120},
	{"id": "mine", "idx": 10, "tele": 25, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 220], "phase": [1, 2, 3, 4], "combo": ["charge", "multiDash", "vortex"], "tags": ["utility", "zone"], "cd": 180},
	{"id": "multiDash", "idx": 12, "tele": 20, "rec": 35, "canFeint": true, "canDelay": 0.3, "range": [30, 350], "phase": [0, 1, 2, 3, 4], "combo": ["spin", "grab", "charge"], "tags": ["gap-close", "multi-hit"], "cd": 120},
	{"id": "slashCombo", "idx": 13, "tele": 20, "rec": 25, "canFeint": true, "canDelay": 0.3, "range": [0, 100], "phase": [0, 1, 2, 3, 4], "combo": ["slam", "sweep", "charge"], "tags": ["melee", "multi-hit"], "cd": 90},
	{"id": "slam", "idx": 14, "tele": 35, "rec": 40, "canFeint": false, "canDelay": 0.4, "range": [0, 140], "phase": [0, 1, 2, 3, 4], "combo": ["slashCombo", "sweep", "shock"], "tags": ["melee", "aoe"], "cd": 140},
	{"id": "sweep", "idx": 15, "tele": 25, "rec": 60, "canFeint": false, "canDelay": 0.2, "range": [0, 120], "phase": [0, 1, 2, 3, 4], "combo": ["slashCombo", "charge", "slam"], "tags": ["melee", "frontal"], "cd": 100},
	{"id": "burrowStrike", "idx": 58, "tele": 50, "rec": 40, "canFeint": false, "canDelay": 0, "range": [150, 600], "phase": [0, 1, 2, 3, 4], "combo": ["slashCombo", "fan", "burst"], "tags": ["gap-close", "melee", "ambush"], "cd": 200},
	{"id": "beanStorm", "idx": 17, "tele": 20, "rec": 25, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["burst", "fan", "charge"], "tags": ["ranged", "aoe", "redbean"], "cd": 80},
	{"id": "chaseAoe", "idx": 21, "tele": 20, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "multiDash", "slam"], "tags": ["aoe", "zone", "utility"], "cd": 180},
	{"id": "elemBall", "idx": 22, "tele": 60, "rec": 35, "canFeint": false, "canDelay": 0.3, "range": [60, 500], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["ranged", "frontal"], "cd": 100},
	{"id": "groundFissure", "idx": 34, "tele": 25, "rec": 35, "canFeint": false, "canDelay": 0, "range": [60, 400], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "slam", "pillars"], "tags": ["aoe", "zone", "ranged"], "cd": 140},
	{"id": "tideWave", "idx": 35, "tele": 60, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["aoe", "ranged"], "cd": 160},
	{"id": "seekerMines", "idx": 36, "tele": 25, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "multiDash", "elemBall"], "tags": ["ranged", "zone", "utility"], "cd": 180},
	{"id": "poisonTrail", "idx": 40, "tele": 20, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "multiDash", "fan"], "tags": ["zone", "utility", "sustained"], "cd": 160},
	{"id": "lavaPools", "idx": 49, "tele": 35, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "groundFissure"], "tags": ["zone", "aoe", "sustained"], "cd": 200},
	{"id": "rapidMissile", "idx": 56, "tele": 30, "rec": 40, "canFeint": false, "canDelay": 0, "range": [250, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["ranged", "multi-hit", "gap-punish"], "cd": 100},
	{"id": "tailSwipe", "idx": 57, "tele": 40, "rec": 50, "canFeint": false, "canDelay": 0.2, "range": [0, 160], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "slam", "jump"], "tags": ["melee", "frontal", "aoe"], "cd": 110},
]

const EXPECTED_PHASES = [
	{"hp": [0.8, 1], "spdM": 1.15, "teleM": 0.75, "cdM": 0.5, "comboC": 0.4, "feintC": 0.08, "delayC": 0.1, "label": "PHASE 1"},
	{"hp": [0.6, 0.8], "spdM": 1.25, "teleM": 0.65, "cdM": 0.4, "comboC": 0.55, "feintC": 0.15, "delayC": 0.2, "label": "⚠ PHASE 2"},
	{"hp": [0.4, 0.6], "spdM": 1.4, "teleM": 0.5, "cdM": 0.35, "comboC": 0.65, "feintC": 0.2, "delayC": 0.25, "label": "⚠ PHASE 3"},
	{"hp": [0.2, 0.4], "spdM": 1.55, "teleM": 0.4, "cdM": 0.25, "comboC": 0.8, "feintC": 0.3, "delayC": 0.35, "label": "🔥 PHASE 4"},
	{"hp": [0, 0.2], "spdM": 1.75, "teleM": 0.25, "cdM": 0.15, "comboC": 0.9, "feintC": 0.4, "delayC": 0.4, "label": "💀 광폭화!"},
]

const EXPECTED_COMBOS = [
	{"seq": ["jump", "slam", "sweep"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 0, "source_line": 9882},
	{"seq": ["charge", "tailSwipe"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 1, "source_line": 9883},
	{"seq": ["slashCombo", "tailSwipe", "beanStorm"], "phase": [1, 2, 3, 4], "source_ordinal": 2, "source_line": 9884},
	{"seq": ["charge", "spin", "burst"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 3, "source_line": 9885},
	{"seq": ["jump", "shock", "fan"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 4, "source_line": 9886},
	{"seq": ["charge", "grab"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 5, "source_line": 9887},
	{"seq": ["charge", "multiDash"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 6, "source_line": 9888},
	{"seq": ["multiDash", "spin"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 7, "source_line": 9889},
	{"seq": ["multiDash", "grab", "charge"], "phase": [1, 2, 3, 4], "source_ordinal": 8, "source_line": 9890},
	{"seq": ["multiDash", "spin", "shock"], "phase": [1, 2, 3, 4], "source_ordinal": 9, "source_line": 9891},
	{"seq": ["charge", "spin", "multiDash"], "phase": [1, 2, 3, 4], "source_ordinal": 10, "source_line": 9892},
	{"seq": ["fan", "charge", "spin"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 11, "source_line": 9893},
	{"seq": ["mine", "charge", "spin"], "phase": [2, 3, 4], "source_ordinal": 15, "source_line": 9897},
	{"seq": ["jump", "multiDash", "shock"], "phase": [1, 2, 3, 4], "source_ordinal": 17, "source_line": 9899},
	{"seq": ["burst", "charge", "multiDash"], "phase": [1, 2, 3, 4], "source_ordinal": 18, "source_line": 9900},
	{"seq": ["slashCombo", "slam"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 19, "source_line": 9901},
	{"seq": ["slashCombo", "sweep", "charge"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 20, "source_line": 9902},
	{"seq": ["slam", "sweep", "slashCombo"], "phase": [1, 2, 3, 4], "source_ordinal": 21, "source_line": 9903},
	{"seq": ["charge", "slashCombo"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 23, "source_line": 9905},
	{"seq": ["sweep", "multiDash", "slam"], "phase": [2, 3, 4], "source_ordinal": 25, "source_line": 9907},
	{"seq": ["beanStorm", "fan", "beanStorm"], "phase": [1, 2, 3, 4], "source_ordinal": 26, "source_line": 9908},
	{"seq": ["beanStorm", "charge", "beanStorm"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 27, "source_line": 9909},
	{"seq": ["groundFissure", "charge", "slam"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 42, "source_line": 9924},
	{"seq": ["tideWave", "charge", "fan"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 43, "source_line": 9925},
	{"seq": ["seekerMines", "charge", "multiDash"], "phase": [1, 2, 3, 4], "source_ordinal": 45, "source_line": 9927},
	{"seq": ["poisonTrail", "fan", "charge"], "phase": [1, 2, 3, 4], "source_ordinal": 48, "source_line": 9930},
	{"seq": ["lavaPools", "charge", "groundFissure"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 57, "source_line": 9939},
]

const EXPECTED_PHASE_COUNTS = [[14,23,25,25,25],[14,22,24,24,24],
	[9,13,14,14,14],[14,23,25,25,25]]
const EXPECTED_NAMES = ["다크드루이드", "독버섯 거인", "지옥기형", "다크드루이드"]
const MOVE_FIELDS = ["id","idx","tele","rec","canFeint","canDelay","range","phase","combo","tags","cd"]

var assertions := 0
var failures: Array = []
var groups: Array = []
var current_group := "isolation"


func _initialize() -> void:
	call_deferred("_run")


func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures.append({"group": current_group, "assertion": label})
		printerr("BC01_ASSERT_FAIL ", current_group, " ", label)


func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR \
		and OS.get_user_data_dir().get_file() == USERDIR
	_check(isolated, "exact isolated user directory is mandatory")
	if not isolated:
		_finish()
		return
	for group: String in GROUPS:
		current_group = group
		var before := assertions
		var failed_before := failures.size()
		match group:
			"receipt_and_sparse_ids": _receipt()
			"four_final_sets": _sets()
			"all_move_fields": _moves()
			"all_phase_fields": _phases()
			"combo_membership_phase_order": _combos()
			"copy_isolation": _copies()
			"invalid_inputs": _invalid()
		groups.append({"name":group,"assertions":assertions-before,"failures":failures.size()-failed_before})
	_check(root.get_child_count() == 0, "no Main, actor or scene nodes were created")
	_finish()


func _finish() -> void:
	print("BC01_RESULT ", JSON.stringify({"assertions":assertions,"failures":failures.size(),
		"failed":failures,"groups":groups,"skipped":[],"userdir":OS.get_user_data_dir(),
		"source_main":SOURCE_MAIN,"source_game_sha256":GAME_SHA256,
		"global_moves":59,"global_combos":68,"ch1_union":24,"ch1_combo_union":27,
		"stage_counts":[23,21,10,23],"main_booted":false,"gameplay_evidence":false}))
	quit(0 if failures.is_empty() and assertions > 1 and groups.size() == GROUPS.size() else 1)


func _receipt() -> void:
	var actual: Dictionary = Catalog.source_receipt()
	_check(actual.get("source_main") == SOURCE_MAIN, "latest-main source receipt")
	_check(actual.get("source_game_sha256") == GAME_SHA256, "exact HTML SHA256 receipt")
	for key: String in ["global_move_count","global_combo_count","ch1_union_count","max_source_idx"]:
		var expected: Dictionary = {"global_move_count":59,"global_combo_count":68,"ch1_union_count":24,"max_source_idx":60}
		_check(actual.get(key) == expected[key], "registration count " + key)
	_check(actual.get("source_ranges") == {"moves":[9820,9880],"combos":[9881,9950],
		"phases":[9951,9957],"final_ch1_sets":[9960,9967],
		"all_stage_cage_removal":[10009,10010],"boss_names":[16688,16695]}, "source line ranges")
	_check(actual.get("move_manifest") == EXPECTED_MANIFEST, "all 59 source IDs/idx/ordinal/line, exact order")
	var ids: Array = []
	for entry: Dictionary in actual.get("move_manifest", []):
		_check(entry["source_ordinal"] == ids.size(), "source ordinal is contiguous array order")
		ids.append(entry["idx"])
	_check(not ids.has(30) and not ids.has(59) and ids.has(60), "sparse idx remains sparse")


func _sets() -> void:
	var union: Dictionary = {}
	for si: int in range(4):
		var boss: Dictionary = Catalog.boss_for_stage(si)
		_check(boss == {"supported":true,"si":si,"hell":0,"name_ko":EXPECTED_NAMES[si],
			"element_id":0,"ib":true,"etype":0,"move_ids":EXPECTED_SETS[si]}, "exact boss record si"+str(si))
		_check(boss["move_ids"].size() == [23,21,10,23][si], "final set count si"+str(si))
		_check(not boss["move_ids"].has("cageTrap"), "no cageTrap si"+str(si))
		_check(not boss["move_ids"].has("teleStrike"), "earlier si0 declaration is replaced si"+str(si))
		for id: String in boss["move_ids"]:
			union[id] = true
		var expected_order: Array = []
		for move: Dictionary in EXPECTED_MOVES:
			if EXPECTED_SETS[si].has(move["id"]): expected_order.append(move["id"])
		var actual_order: Array = []
		for move: Dictionary in Catalog.moves_for_stage(si): actual_order.append(move["id"])
		_check(actual_order == expected_order, "BOSS_MOVES order, not Set insertion order si"+str(si))
	_check(union.size() == 24, "all four slots have 24 distinct source moves")
	_check(Catalog.boss_for_stage(0)["move_ids"] == Catalog.boss_for_stage(3)["move_ids"], "si0 final value copies si3")
	_check(Catalog.move_by_id("tailSwipe")["idx"] == 57 and Catalog.move_by_id("burrowStrike")["idx"] == 58, "late sparse CH1 IDs")
	_check(not EXPECTED_SETS[1].has("seekerMines") and EXPECTED_SETS[2].has("tailSwipe"), "slot-specific moves stay distinct")


func _moves() -> void:
	for expected: Dictionary in EXPECTED_MOVES:
		var actual: Dictionary = Catalog.move_by_id(expected["id"])
		var metadata: Dictionary = {}
		for entry: Dictionary in EXPECTED_MANIFEST:
			if entry["id"] == expected["id"]: metadata = entry
		_check(actual.size() == 13, expected["id"] + " has 11 source fields plus ordinal/line")
		for field: String in MOVE_FIELDS:
			_check(actual.get(field) == expected[field], expected["id"] + "." + field + " source literal")
		_check(actual.get("source_ordinal") == metadata["source_ordinal"], expected["id"] + " original ordinal")
		_check(actual.get("source_line") == metadata["source_line"], expected["id"] + " original line")
	for si: int in range(4):
		for actual: Dictionary in Catalog.moves_for_stage(si):
			_check(actual == Catalog.move_by_id(actual["id"]), "stage lookup preserves every field " + actual["id"])


func _phases() -> void:
	for phase: int in range(5):
		var actual: Dictionary = Catalog.phase_by_index(phase)
		_check(actual.size() == 8, "all eight phase fields " + str(phase))
		for field: String in EXPECTED_PHASES[phase]:
			_check(actual.get(field) == EXPECTED_PHASES[phase][field], "phase"+str(phase)+"."+field)


func _combos() -> void:
	var union: Dictionary = {}
	var expected_unfiltered: Array = [25,24,14,25]
	for si: int in range(4):
		var seen: Dictionary = {}
		for phase: int in range(5):
			var expected: Array = []
			for entry: Dictionary in EXPECTED_COMBOS:
				var missing: Array = entry["seq"].filter(func(id: String) -> bool: return not EXPECTED_SETS[si].has(id))
				if missing.is_empty() and entry["phase"].has(phase): expected.append(entry)
			var actual: Array = Catalog.combos_for_stage(si, phase)
			_check(actual.size() == EXPECTED_PHASE_COUNTS[si][phase], "combo count si/phase "+str(si)+"/"+str(phase))
			_check(actual == expected, "every combo sequence/phase/ordinal/line in original order "+str(si)+"/"+str(phase))
			for entry: Dictionary in actual:
				seen[entry["source_ordinal"]] = true
				union[entry["source_ordinal"]] = true
		_check(seen.size() == expected_unfiltered[si], "phase-union combo count si"+str(si))
	_check(union.size() == 27, "27 distinct first-chapter source combo registrations")
	var tail: Array = Catalog.combos_for_stage(2, 0).filter(func(entry: Dictionary) -> bool: return entry["seq"] == ["charge","tailSwipe"])
	_check(tail.size() == 1, "si2 charge-to-tail combo remains eligible")
	for si: int in [0,1,3]:
		_check(Catalog.combos_for_stage(si,0).all(func(entry: Dictionary) -> bool: return not entry["seq"].has("tailSwipe")), "tail combo excluded from other slots")


func _copies() -> void:
	var boss: Dictionary = Catalog.boss_for_stage(0)
	boss["move_ids"].clear()
	boss["name_ko"] = "mutated"
	_check(Catalog.boss_for_stage(0)["move_ids"] == EXPECTED_SETS[0], "boss nested move list is independent")
	_check(Catalog.boss_for_stage(3)["move_ids"] == EXPECTED_SETS[3], "si0 cannot mutate si3 alias")
	_check(Catalog.boss_for_stage(0)["name_ko"] == EXPECTED_NAMES[0], "boss top-level copy")
	var move: Dictionary = Catalog.move_by_id("burst")
	for key: String in ["range","phase","combo","tags"]: move[key].clear()
	move["tele"] = -999
	_check(Catalog.move_by_id("burst")["range"] == [0,999], "move range copy")
	_check(Catalog.move_by_id("burst")["phase"] == [0,1,2,3,4], "move phase copy")
	_check(Catalog.move_by_id("burst")["combo"] == ["fan","shock","charge"], "move combo copy")
	_check(Catalog.move_by_id("burst")["tags"] == ["aoe","ranged"] and Catalog.move_by_id("burst")["tele"] == 45, "move tags and scalar copy")
	var moves: Array = Catalog.moves_for_stage(0)
	moves[0]["range"].clear()
	moves.clear()
	_check(Catalog.moves_for_stage(0).size() == 23 and Catalog.moves_for_stage(0)[0]["range"] == [0,999], "stage array and nested move copies")
	var phase: Dictionary = Catalog.phase_by_index(0)
	phase["hp"].clear()
	phase["label"] = "mutated"
	_check(Catalog.phase_by_index(0) == EXPECTED_PHASES[0], "phase deep copy")
	var combos: Array = Catalog.combos_for_stage(0,0)
	combos[0]["seq"].clear()
	combos[0]["phase"].clear()
	combos.clear()
	_check(Catalog.combos_for_stage(0,0)[0] == EXPECTED_COMBOS[0], "combo array and both nested arrays copied")
	var receipt: Dictionary = Catalog.source_receipt()
	receipt["move_manifest"][0]["idx"] = -1
	receipt["move_manifest"].clear()
	receipt["source_ranges"]["moves"].clear()
	_check(Catalog.source_receipt()["move_manifest"] == EXPECTED_MANIFEST, "receipt manifest deep copy")
	_check(Catalog.source_receipt()["source_ranges"]["moves"] == [9820,9880], "receipt range deep copy")


func _invalid() -> void:
	for si: int in [-10,-1,4,34,35,99]:
		_check(Catalog.boss_for_stage(si) == {"supported":false,"reason":"unsupported_chapter_stage","si":si}, "invalid stage explicit rejection " + str(si))
		_check(Catalog.moves_for_stage(si).is_empty(), "invalid stage has no all-moves fallback")
		for phase: int in range(5): _check(Catalog.combos_for_stage(si,phase).is_empty(), "invalid stage has no combos")
	for phase: int in [-99,-1,5,99]:
		_check(Catalog.phase_by_index(phase).is_empty(), "invalid phase empty view")
		for si: int in range(4): _check(Catalog.combos_for_stage(si,phase).is_empty(), "invalid combo phase empty view")
	for id: String in ["","cageTrap","teleStrike","burstCounter","BURST","missing"]:
		_check(Catalog.move_by_id(id).is_empty(), "unknown/unported id has no fallback " + id)
