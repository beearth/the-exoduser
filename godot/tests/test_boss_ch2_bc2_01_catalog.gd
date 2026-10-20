extends SceneTree
## Independent expected data: exact game.html declarations evaluated in Node VM.
## No expectations read from the product catalog. No live actors or combat evidence.
const Catalog = preload("res://scripts/native_ch2_boss_catalog.gd")
const Shared = preload("res://scripts/native_ch1_boss_catalog.gd")
const USERDIR = "EXODUSER-bc2-01-Isolated-20261020"
const GAME_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const EXPECTED_MOVES = [
	{"id": "burst", "idx": 0, "tele": 45, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["fan", "shock", "charge"], "tags": ["aoe", "ranged"], "cd": 140, "source_ordinal": 0, "source_line": 9821},
	{"id": "fan", "idx": 1, "tele": 25, "rec": 35, "canFeint": false, "canDelay": 0.3, "range": [60, 300], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "mine", "multiDash"], "tags": ["ranged", "frontal"], "cd": 100, "source_ordinal": 1, "source_line": 9822},
	{"id": "charge", "idx": 2, "tele": 40, "rec": 60, "canFeint": true, "canDelay": 0.5, "range": [40, 400], "phase": [0, 1, 2, 3, 4], "combo": ["spin", "grab", "shock", "multiDash"], "tags": ["gap-close", "melee"], "cd": 100, "source_ordinal": 2, "source_line": 9823},
	{"id": "jump", "idx": 3, "tele": 34, "rec": 30, "canFeint": false, "canDelay": 0, "range": [80, 500], "phase": [0, 1, 2, 3, 4], "combo": ["shock", "burst", "spin"], "tags": ["gap-close", "aoe"], "cd": 150, "source_ordinal": 3, "source_line": 9824},
	{"id": "shock", "idx": 5, "tele": 35, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 180], "phase": [0, 1, 2, 3, 4], "combo": ["summon", "mine", "charge"], "tags": ["aoe", "melee"], "cd": 120, "source_ordinal": 5, "source_line": 9826},
	{"id": "summon", "idx": 6, "tele": 45, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "burst"], "tags": ["utility"], "cd": 300, "source_ordinal": 6, "source_line": 9827},
	{"id": "grab", "idx": 8, "tele": 60, "rec": 50, "canFeint": true, "canDelay": 0.5, "range": [0, 150], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "spin"], "tags": ["melee", "punish"], "cd": 180, "source_ordinal": 8, "source_line": 9829},
	{"id": "spin", "idx": 9, "tele": 28, "rec": 40, "canFeint": false, "canDelay": 0.3, "range": [0, 100], "phase": [0, 1, 2, 3, 4], "combo": ["burst", "fan", "multiDash"], "tags": ["melee", "aoe"], "cd": 120, "source_ordinal": 9, "source_line": 9830},
	{"id": "mine", "idx": 10, "tele": 25, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 220], "phase": [1, 2, 3, 4], "combo": ["charge", "multiDash", "vortex"], "tags": ["utility", "zone"], "cd": 180, "source_ordinal": 10, "source_line": 9831},
	{"id": "vortex", "idx": 11, "tele": 25, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 250], "phase": [1, 2, 3, 4], "combo": ["burst", "meteor", "charge"], "tags": ["aoe", "cc"], "cd": 220, "source_ordinal": 11, "source_line": 9832},
	{"id": "multiDash", "idx": 12, "tele": 20, "rec": 35, "canFeint": true, "canDelay": 0.3, "range": [30, 350], "phase": [0, 1, 2, 3, 4], "combo": ["spin", "grab", "charge"], "tags": ["gap-close", "multi-hit"], "cd": 120, "source_ordinal": 12, "source_line": 9833},
	{"id": "slashCombo", "idx": 13, "tele": 20, "rec": 25, "canFeint": true, "canDelay": 0.3, "range": [0, 100], "phase": [0, 1, 2, 3, 4], "combo": ["slam", "sweep", "charge"], "tags": ["melee", "multi-hit"], "cd": 90, "source_ordinal": 13, "source_line": 9834},
	{"id": "slam", "idx": 14, "tele": 35, "rec": 40, "canFeint": false, "canDelay": 0.4, "range": [0, 140], "phase": [0, 1, 2, 3, 4], "combo": ["slashCombo", "sweep", "shock"], "tags": ["melee", "aoe"], "cd": 140, "source_ordinal": 14, "source_line": 9835},
	{"id": "sweep", "idx": 15, "tele": 25, "rec": 60, "canFeint": false, "canDelay": 0.2, "range": [0, 120], "phase": [0, 1, 2, 3, 4], "combo": ["slashCombo", "charge", "slam"], "tags": ["melee", "frontal"], "cd": 100, "source_ordinal": 15, "source_line": 9836},
	{"id": "beanStorm", "idx": 17, "tele": 20, "rec": 25, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["burst", "fan", "charge"], "tags": ["ranged", "aoe", "redbean"], "cd": 80, "source_ordinal": 18, "source_line": 9839},
	{"id": "beanRain", "idx": 18, "tele": 60, "rec": 60, "canFeint": false, "canDelay": 0, "range": [60, 400], "phase": [1, 2, 3, 4], "combo": ["beanStorm", "charge", "vortex"], "tags": ["ranged", "sustained", "redbean"], "cd": 120, "source_ordinal": 19, "source_line": 9840},
	{"id": "fanWave", "idx": 19, "tele": 60, "rec": 40, "canFeint": false, "canDelay": 0, "range": [60, 500], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "slam"], "tags": ["ranged", "frontal", "aoe"], "cd": 160, "source_ordinal": 20, "source_line": 9841},
	{"id": "chaseAoe", "idx": 21, "tele": 20, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "multiDash", "slam"], "tags": ["aoe", "zone", "utility"], "cd": 180, "source_ordinal": 22, "source_line": 9843},
	{"id": "elemBall", "idx": 22, "tele": 60, "rec": 35, "canFeint": false, "canDelay": 0.3, "range": [60, 500], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["ranged", "frontal"], "cd": 100, "source_ordinal": 23, "source_line": 9844},
	{"id": "spiralBullet", "idx": 25, "tele": 35, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["aoe", "ranged", "sustained"], "cd": 200, "source_ordinal": 26, "source_line": 9847},
	{"id": "groundFissure", "idx": 34, "tele": 25, "rec": 35, "canFeint": false, "canDelay": 0, "range": [60, 400], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "slam", "pillars"], "tags": ["aoe", "zone", "ranged"], "cd": 140, "source_ordinal": 35, "source_line": 9856},
	{"id": "tideWave", "idx": 35, "tele": 60, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["aoe", "ranged"], "cd": 160, "source_ordinal": 36, "source_line": 9857},
	{"id": "seekerMines", "idx": 36, "tele": 25, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "multiDash", "elemBall"], "tags": ["ranged", "zone", "utility"], "cd": 180, "source_ordinal": 37, "source_line": 9858},
	{"id": "wallPush", "idx": 39, "tele": 60, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [2, 3, 4], "combo": ["charge", "elemBall", "spiralBullet"], "tags": ["zone", "utility", "cc"], "cd": 240, "source_ordinal": 40, "source_line": 9861},
	{"id": "poisonTrail", "idx": 40, "tele": 20, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "multiDash", "fan"], "tags": ["zone", "utility", "sustained"], "cd": 160, "source_ordinal": 41, "source_line": 9862},
	{"id": "shieldBash2", "idx": 44, "tele": 20, "rec": 60, "canFeint": false, "canDelay": 0.2, "range": [40, 200], "phase": [0, 1, 2, 3, 4], "combo": ["slashCombo", "sweep", "charge"], "tags": ["melee", "gap-close"], "cd": 120, "source_ordinal": 45, "source_line": 9866},
	{"id": "lavaPools", "idx": 49, "tele": 35, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "groundFissure"], "tags": ["zone", "aoe", "sustained"], "cd": 200, "source_ordinal": 50, "source_line": 9871},
	{"id": "fireRain", "idx": 50, "tele": 60, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "chaseAoe", "elemBall"], "tags": ["zone", "aoe", "ranged"], "cd": 220, "source_ordinal": 51, "source_line": 9872},
	{"id": "shockGrid", "idx": 51, "tele": 40, "rec": 45, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "fan", "spiralBullet"], "tags": ["zone", "aoe", "cc"], "cd": 240, "source_ordinal": 52, "source_line": 9873},
	{"id": "donutSlam", "idx": 52, "tele": 60, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "burst", "shockGrid"], "tags": ["zone", "aoe", "punish"], "cd": 300, "source_ordinal": 53, "source_line": 9874},
	{"id": "crossWipe", "idx": 54, "tele": 50, "rec": 50, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "shockGrid", "fan"], "tags": ["zone", "aoe", "sustained"], "cd": 280, "source_ordinal": 55, "source_line": 9876},
	{"id": "rapidMissile", "idx": 56, "tele": 30, "rec": 40, "canFeint": false, "canDelay": 0, "range": [250, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["ranged", "multi-hit", "gap-punish"], "cd": 100, "source_ordinal": 57, "source_line": 9878},
]
const EXPECTED_SETS = [
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "spin", "grab", "multiDash", "poisonTrail", "summon", "mine", "vortex", "chaseAoe", "elemBall", "beanStorm", "beanRain", "groundFissure", "tideWave", "lavaPools", "fireRain", "shockGrid", "donutSlam", "crossWipe", "rapidMissile"],
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "spin", "grab", "multiDash", "poisonTrail", "summon", "mine", "vortex", "chaseAoe", "elemBall", "beanStorm", "beanRain", "groundFissure", "tideWave", "lavaPools", "fireRain", "shockGrid", "donutSlam", "crossWipe", "rapidMissile", "seekerMines"],
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "spin", "grab", "multiDash", "poisonTrail", "summon", "mine", "vortex", "chaseAoe", "elemBall", "beanStorm", "beanRain", "groundFissure", "tideWave", "lavaPools", "fireRain", "shockGrid", "donutSlam", "crossWipe", "rapidMissile", "seekerMines", "fanWave"],
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "spin", "grab", "multiDash", "poisonTrail", "summon", "mine", "vortex", "chaseAoe", "elemBall", "beanStorm", "beanRain", "groundFissure", "tideWave", "lavaPools", "fireRain", "shockGrid", "donutSlam", "crossWipe", "rapidMissile", "seekerMines", "fanWave", "wallPush"],
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "spin", "grab", "multiDash", "poisonTrail", "summon", "mine", "vortex", "chaseAoe", "elemBall", "beanStorm", "beanRain", "groundFissure", "tideWave", "lavaPools", "fireRain", "shockGrid", "donutSlam", "crossWipe", "rapidMissile", "seekerMines", "fanWave", "wallPush", "shieldBash2"],
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "spin", "grab", "multiDash", "poisonTrail", "summon", "mine", "vortex", "chaseAoe", "elemBall", "beanStorm", "beanRain", "groundFissure", "tideWave", "lavaPools", "fireRain", "shockGrid", "donutSlam", "crossWipe", "rapidMissile", "seekerMines", "fanWave", "wallPush", "shieldBash2", "spiralBullet"],
]
const EXPECTED_NAMES = [
	"벌레 수호자",
	"점액 괴수",
	"기생충 모체",
	"거대 알주머니",
	"살벽의 군주",
	"여왕 구더기",
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
	{"seq": ["charge", "spin", "burst"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 3, "source_line": 9885},
	{"seq": ["jump", "shock", "fan"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 4, "source_line": 9886},
	{"seq": ["charge", "grab"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 5, "source_line": 9887},
	{"seq": ["charge", "multiDash"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 6, "source_line": 9888},
	{"seq": ["multiDash", "spin"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 7, "source_line": 9889},
	{"seq": ["multiDash", "grab", "charge"], "phase": [1, 2, 3, 4], "source_ordinal": 8, "source_line": 9890},
	{"seq": ["multiDash", "spin", "shock"], "phase": [1, 2, 3, 4], "source_ordinal": 9, "source_line": 9891},
	{"seq": ["charge", "spin", "multiDash"], "phase": [1, 2, 3, 4], "source_ordinal": 10, "source_line": 9892},
	{"seq": ["fan", "charge", "spin"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 11, "source_line": 9893},
	{"seq": ["mine", "vortex", "burst"], "phase": [2, 3, 4], "source_ordinal": 12, "source_line": 9894},
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
	{"seq": ["beanRain", "beanStorm", "burst"], "phase": [2, 3, 4], "source_ordinal": 28, "source_line": 9910},
	{"seq": ["vortex", "beanRain", "beanStorm"], "phase": [3, 4], "source_ordinal": 29, "source_line": 9911},
	{"seq": ["spiralBullet", "charge", "slam"], "phase": [2, 3, 4], "source_ordinal": 39, "source_line": 9921},
	{"seq": ["groundFissure", "charge", "slam"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 42, "source_line": 9924},
	{"seq": ["tideWave", "charge", "fan"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 43, "source_line": 9925},
	{"seq": ["seekerMines", "charge", "multiDash"], "phase": [1, 2, 3, 4], "source_ordinal": 45, "source_line": 9927},
	{"seq": ["wallPush", "charge", "slam"], "phase": [2, 3, 4], "source_ordinal": 47, "source_line": 9929},
	{"seq": ["poisonTrail", "fan", "charge"], "phase": [1, 2, 3, 4], "source_ordinal": 48, "source_line": 9930},
	{"seq": ["shieldBash2", "slashCombo", "sweep"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 51, "source_line": 9933},
	{"seq": ["lavaPools", "charge", "groundFissure"], "phase": [0, 1, 2, 3, 4], "source_ordinal": 57, "source_line": 9939},
	{"seq": ["fireRain", "charge", "fan"], "phase": [1, 2, 3, 4], "source_ordinal": 58, "source_line": 9940},
	{"seq": ["shockGrid", "charge", "multiDash"], "phase": [1, 2, 3, 4], "source_ordinal": 59, "source_line": 9941},
	{"seq": ["lavaPools", "fireRain"], "phase": [2, 3, 4], "source_ordinal": 60, "source_line": 9942},
	{"seq": ["shockGrid", "spiralBullet"], "phase": [2, 3, 4], "source_ordinal": 61, "source_line": 9943},
	{"seq": ["donutSlam", "charge", "slam"], "phase": [1, 2, 3, 4], "source_ordinal": 62, "source_line": 9944},
	{"seq": ["crossWipe", "charge", "fan"], "phase": [1, 2, 3, 4], "source_ordinal": 64, "source_line": 9946},
	{"seq": ["donutSlam", "crossWipe"], "phase": [3, 4], "source_ordinal": 66, "source_line": 9948},
]
const EXPECTED_COUNTS = [
	[14, 26, 31, 33, 33],
	[14, 27, 32, 34, 34],
	[14, 27, 32, 34, 34],
	[14, 27, 33, 35, 35],
	[15, 28, 34, 36, 36],
	[15, 28, 36, 38, 38],
]

var assertions := 0
var failures: Array[String] = []
var source_game := ""

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="): source_game=arg.trim_prefix("--source-game=")
	call_deferred("_run")

func _check(condition: bool, message: String) -> void:
	assertions+=1
	if not condition:
		failures.append(message)
		printerr("BC2_01_FAIL ",message)

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true 		and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR 		and OS.get_user_data_dir().get_file()==USERDIR
	_check(isolated,"isolated settings and actual OS userdir")
	if not isolated: _finish(); return
	_check(not source_game.is_empty() and FileAccess.get_sha256(source_game)==GAME_SHA256,"latest source bytes match independent oracle")
	var shared_before: Dictionary = Catalog._read_shared()
	var receipt: Dictionary = Catalog.source_receipt()
	_check(receipt["ready"],"dependency receipt ready")
	_check(receipt["source_game_sha256"]==GAME_SHA256,"source receipt hash")
	_check(receipt["source_main"]=="0119f3048a459a458ba142d98f68126b8e281be1","pinned main receipt")
	for entry: Array in [["global_move_count",59],["global_combo_count",68],["phase_count",5],
		["ch2_union_count",32],["common_move_count",22],["new_move_count",10],
		["combo_union_count",38],["common_combo_count",25],["new_combo_count",13],["max_ch2_source_idx",56]]:
		_check(receipt[entry[0]]==entry[1],"receipt "+str(entry[0]))
	_check(receipt["live_combat_connected"]==false and receipt["save_io"]==false and receipt["rng_draws"]==0,"scope flags")
	for si in range(4,10):
		var boss: Dictionary = Catalog.boss_for_stage(si)
		_check(boss=={"supported":true,"si":si,"hell":1,"name_ko":EXPECTED_NAMES[si-4],"element_id":0,
			"ib":true,"etype":0,"move_ids":EXPECTED_SETS[si-4]},"all boss metadata and Set insertion order "+str(si))
		var expected: Array = []
		for move: Dictionary in EXPECTED_MOVES:
			if EXPECTED_SETS[si-4].has(move["id"]): expected.append(move)
		var actual: Array = Catalog.moves_for_stage(si)
		_check(actual.size()==27+si-4,"stage move count "+str(si))
		_check(actual.size()==expected.size(),"independent Set membership count")
		for i in range(min(actual.size(),expected.size())):
			_check(actual[i].size()==13,"all 11 fields plus ordinal/line")
			for key: String in expected[i]:
				_check(actual[i].get(key)==expected[i][key],"move field si%d row%d %s"%[si,i,key])
		for phase in range(5):
			var expected_combos: Array = []
			for combo: Dictionary in EXPECTED_COMBOS:
				if not combo["phase"].has(phase): continue
				var fits := true
				for id: String in combo["seq"]:
					if not EXPECTED_SETS[si-4].has(id): fits=false; break
				if fits: expected_combos.append(combo)
			var actual_combos: Array = Catalog.combos_for_stage(si,phase)
			_check(actual_combos.size()==EXPECTED_COUNTS[si-4][phase],"6x5 candidate counts")
			_check(actual_combos.size()==expected_combos.size(),"independent combo filter count")
			for i in range(min(actual_combos.size(),expected_combos.size())):
				_check(actual_combos[i].size()==4,"combo keys")
				for key: String in expected_combos[i]:
					_check(actual_combos[i].get(key)==expected_combos[i][key],"combo field si%d phase%d row%d %s"%[si,phase,i,key])
	for expected: Dictionary in EXPECTED_MOVES:
		_check(Catalog.move_by_id(expected["id"])==expected,"all union records by id")
	for phase in range(5):
		_check(Catalog.phase_by_index(phase).size()==8,"phase full schema")
		for key: String in EXPECTED_PHASES[phase]:
			_check(Catalog.phase_by_index(phase).get(key)==EXPECTED_PHASES[phase][key],"phase field "+str(phase)+key)
	for si in [-2147483648,-1,0,3,10,34,35,2147483647]:
		_check(Catalog.boss_for_stage(si)=={"supported":false,"reason":"unsupported_chapter_stage","si":si},"unsupported stage explicit")
		_check(Catalog.moves_for_stage(si).is_empty() and Catalog.combos_for_stage(si,0).is_empty(),"unsupported stage arrays")
	for phase in [-2147483648,-1,5,2147483647]:
		_check(Catalog.phase_by_index(phase).is_empty() and Catalog.combos_for_stage(4,phase).is_empty(),"unsupported phase")
	for id: String in ["","unknown","cageTrap","tailSwipe","burrowStrike","burstCounter","laser","meteor"]:
		_check(Catalog.move_by_id(id).is_empty(),"excluded union id "+id)
	_check(Catalog.move_by_id("vortex")["combo"].has("meteor"),"unavailable combo hint preserved")
	_check(Catalog.move_by_id("rapidMissile")["idx"]==56 and Catalog.move_by_id("beanStorm")["source_ordinal"]==18,"idx distinct from source ordinal")
	_copy_isolation()
	_dependency_failures(shared_before)
	_check(Catalog._read_shared()==shared_before,"BC01 data unchanged across all queries/fixtures")
	var body: String = FileAccess.get_file_as_string("res://scripts/native_ch2_boss_catalog.gd")
	for forbidden: String in ["FileAccess", "DirAccess", "OS.", "HTTPRequest", "randf(", "randi(", "seed(", "Node.new", "SceneTree", "user://", "func _process", "func _physics_process"]:
		_check(not body.contains(forbidden),"no runtime/IO/RNG entry "+forbidden)
	_finish()

func _copy_isolation() -> void:
	var boss: Dictionary = Catalog.boss_for_stage(4)
	boss["move_ids"].clear()
	_check(Catalog.boss_for_stage(4)["move_ids"]==EXPECTED_SETS[0],"boss Set detached")
	var moves: Array = Catalog.moves_for_stage(4)
	moves[0]["combo"].clear(); moves[0]["range"][0]=-999; moves.clear()
	_check(Catalog.moves_for_stage(4)[0]==EXPECTED_MOVES[0],"move list nested arrays detached")
	var move: Dictionary = Catalog.move_by_id("slashCombo")
	move["phase"].clear(); move["tags"].clear()
	_check(Catalog.move_by_id("slashCombo")==_expected_move("slashCombo"),"by-id nested arrays detached")
	var phase: Dictionary = Catalog.phase_by_index(0)
	phase["hp"].clear()
	_check(Catalog.phase_by_index(0)==EXPECTED_PHASES[0],"delegated phase detached")
	var combos: Array = Catalog.combos_for_stage(9,4)
	combos[0]["seq"].clear(); combos[0]["phase"].clear(); combos.clear()
	_check(Catalog.combos_for_stage(9,4)==EXPECTED_COMBOS,"combos detached and global ordinal order")
	var receipt: Dictionary = Catalog.source_receipt()
	receipt["stages"].clear();receipt["source_ranges"]["moves"].clear()
	_check(Catalog.source_receipt()["stages"]==[4,5,6,7,8,9],"receipt detached")
	_check(Catalog.boss_for_stage(5)["move_ids"]==EXPECTED_SETS[1],"cross-stage isolation")

func _expected_move(id: String) -> Dictionary:
	for move: Dictionary in EXPECTED_MOVES:
		if move["id"]==id: return move
	return {}

func _reject(snapshot: Dictionary, label: String) -> void:
	var before: String = var_to_str(snapshot)
	var result: Dictionary = Catalog._assemble_snapshot(snapshot)
	_check(result.get("ready")==false and str(result.get("reason","")).begins_with("dependency_unready:"),"failed dependency explicit "+label)
	_check(not result.has("moves") and not result.has("phases") and not result.has("combos"),"no partial success "+label)
	_check(var_to_str(snapshot)==before,"failure input immutable "+label)

func _dependency_failures(original: Dictionary) -> void:
	for key: String in ["receipt","moves","phases","combos"]:
		var snap: Dictionary = original.duplicate(true);snap.erase(key);_reject(snap,"missing "+key)
	for key: String in ["source_game_sha256","global_move_count","global_combo_count","move_manifest"]:
		var snap: Dictionary = original.duplicate(true);snap["receipt"].erase(key);_reject(snap,"receipt "+key)
	for key: String in ["id","idx","source_ordinal","source_line"]:
		var snap: Dictionary = original.duplicate(true);snap["receipt"]["move_manifest"][0].erase(key);_reject(snap,"manifest "+key)
	for key: String in ["id","idx","source_ordinal","source_line","tele","rec","canFeint","canDelay","range","phase","combo","tags","cd"]:
		var snap: Dictionary = original.duplicate(true);snap["moves"]["slashCombo"].erase(key);_reject(snap,"common move "+key)
	var missing: Dictionary = original.duplicate(true);missing["moves"].erase("slashCombo");_reject(missing,"missing common move")
	var wrong: Dictionary = original.duplicate(true);wrong["moves"]["slashCombo"]["idx"]=999;_reject(wrong,"move idx mismatch")
	var bad_array: Dictionary = original.duplicate(true);bad_array["moves"]["slashCombo"]["range"]=[1];_reject(bad_array,"range shape")
	var nonfinite: Dictionary = original.duplicate(true);nonfinite["moves"]["slashCombo"]["tele"]=NAN;_reject(nonfinite,"nonfinite number")
	var bad_phase: Dictionary = original.duplicate(true);bad_phase["moves"]["slashCombo"]["phase"]=[5];_reject(bad_phase,"invalid phase member")
	for key: String in ["hp","spdM","teleM","cdM","comboC","feintC","delayC","label"]:
		var snap: Dictionary = original.duplicate(true);snap["phases"][0].erase(key);_reject(snap,"common phase "+key)
	var missing_combo: Dictionary = original.duplicate(true);missing_combo["combos"].erase(0);_reject(missing_combo,"missing common combo")
	for key: String in ["seq","phase","source_ordinal","source_line"]:
		var snap: Dictionary = original.duplicate(true);snap["combos"][0].erase(key);_reject(snap,"common combo "+key)
	var conflict: Dictionary = original.duplicate(true);conflict["combos"][0]["seq"]=["not_common"];_reject(conflict,"unowned common combo move")
	# Synthetic dependency fixture: equal seq at different original ordinals must survive.
	var repeated: Dictionary = original.duplicate(true)
	repeated["combos"][3]["seq"]=repeated["combos"][0]["seq"].duplicate()
	var result: Dictionary = Catalog._assemble_snapshot(repeated)
	_check(result["ready"] and result["combos"].size()==38,"distinct ordinal equal-seq fixture retained")
	_check(result["combos"][0]["source_ordinal"]==0 and result["combos"][1]["source_ordinal"]==3,"distinct ordinal order retained")
	_check(result["combos"][0]["seq"]==result["combos"][1]["seq"],"no sequence deduplication")

func _finish() -> void:
	print("BC2_01_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures.size(),"skip":0,
		"stages":6,"union_moves":32,"new_moves":10,"combo_union":38,"new_combos":13,
		"userdir":OS.get_user_data_dir(),"live_combat_verified":false}))
	quit(0 if failures.is_empty() else 1)
