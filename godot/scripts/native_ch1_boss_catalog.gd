extends RefCounted
## BC01: source-owned CH1 registration data only. No actor, clock, RNG or save IO.
## game.html at c3cf8ce6b0cc1a5c381240260e03dff71c68af8d (SHA256 in receipt).
## source_ordinal is array order; idx is the original sparse identifier.
## Final si0 replaces its earlier declaration with a COPY of si3 after cage removal.
## rec is source metadata, not the duration of the recover state.

const _MOVE_MANIFEST = [
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

const _RECEIPT = {
	"source_main": "c3cf8ce6b0cc1a5c381240260e03dff71c68af8d",
	"source_game_sha256": "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4",
	"global_move_count": 59,
	"global_combo_count": 68,
	"ch1_union_count": 24,
	"max_source_idx": 60,
	"source_ranges": {"moves": [9820, 9880], "combos": [9881, 9950], "phases": [9951, 9957], "final_ch1_sets": [9960, 9967], "all_stage_cage_removal": [10009, 10010], "boss_names": [16688, 16695]},
	"move_manifest": _MOVE_MANIFEST,
}

const _BOSS_NAMES = [
	"다크드루이드",
	"독버섯 거인",
	"지옥기형",
	"다크드루이드",
]

const _FINAL_SETS = [
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "groundFissure", "poisonTrail", "spin", "grab", "multiDash", "tideWave", "chaseAoe", "elemBall", "beanStorm", "summon", "mine", "seekerMines", "lavaPools", "rapidMissile", "burrowStrike"],
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "groundFissure", "poisonTrail", "spin", "grab", "multiDash", "tideWave", "chaseAoe", "elemBall", "beanStorm", "summon", "mine", "lavaPools", "rapidMissile"],
	["jump", "charge", "slashCombo", "sweep", "tailSwipe", "spin", "slam", "beanStorm", "fan", "multiDash"],
	["slashCombo", "slam", "sweep", "charge", "jump", "burst", "shock", "fan", "groundFissure", "poisonTrail", "spin", "grab", "multiDash", "tideWave", "chaseAoe", "elemBall", "beanStorm", "summon", "mine", "seekerMines", "lavaPools", "rapidMissile", "burrowStrike"],
]

const _MOVES = [
	{"id": "burst", "idx": 0, "tele": 45, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["fan", "shock", "charge"], "tags": ["aoe", "ranged"], "cd": 140, "source_ordinal": 0, "source_line": 9821},
	{"id": "fan", "idx": 1, "tele": 25, "rec": 35, "canFeint": false, "canDelay": 0.3, "range": [60, 300], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "mine", "multiDash"], "tags": ["ranged", "frontal"], "cd": 100, "source_ordinal": 1, "source_line": 9822},
	{"id": "charge", "idx": 2, "tele": 40, "rec": 60, "canFeint": true, "canDelay": 0.5, "range": [40, 400], "phase": [0, 1, 2, 3, 4], "combo": ["spin", "grab", "shock", "multiDash"], "tags": ["gap-close", "melee"], "cd": 100, "source_ordinal": 2, "source_line": 9823},
	{"id": "jump", "idx": 3, "tele": 34, "rec": 30, "canFeint": false, "canDelay": 0, "range": [80, 500], "phase": [0, 1, 2, 3, 4], "combo": ["shock", "burst", "spin"], "tags": ["gap-close", "aoe"], "cd": 150, "source_ordinal": 3, "source_line": 9824},
	{"id": "shock", "idx": 5, "tele": 35, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 180], "phase": [0, 1, 2, 3, 4], "combo": ["summon", "mine", "charge"], "tags": ["aoe", "melee"], "cd": 120, "source_ordinal": 5, "source_line": 9826},
	{"id": "summon", "idx": 6, "tele": 45, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "burst"], "tags": ["utility"], "cd": 300, "source_ordinal": 6, "source_line": 9827},
	{"id": "grab", "idx": 8, "tele": 60, "rec": 50, "canFeint": true, "canDelay": 0.5, "range": [0, 150], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "spin"], "tags": ["melee", "punish"], "cd": 180, "source_ordinal": 8, "source_line": 9829},
	{"id": "spin", "idx": 9, "tele": 28, "rec": 40, "canFeint": false, "canDelay": 0.3, "range": [0, 100], "phase": [0, 1, 2, 3, 4], "combo": ["burst", "fan", "multiDash"], "tags": ["melee", "aoe"], "cd": 120, "source_ordinal": 9, "source_line": 9830},
	{"id": "mine", "idx": 10, "tele": 25, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 220], "phase": [1, 2, 3, 4], "combo": ["charge", "multiDash", "vortex"], "tags": ["utility", "zone"], "cd": 180, "source_ordinal": 10, "source_line": 9831},
	{"id": "multiDash", "idx": 12, "tele": 20, "rec": 35, "canFeint": true, "canDelay": 0.3, "range": [30, 350], "phase": [0, 1, 2, 3, 4], "combo": ["spin", "grab", "charge"], "tags": ["gap-close", "multi-hit"], "cd": 120, "source_ordinal": 12, "source_line": 9833},
	{"id": "slashCombo", "idx": 13, "tele": 20, "rec": 25, "canFeint": true, "canDelay": 0.3, "range": [0, 100], "phase": [0, 1, 2, 3, 4], "combo": ["slam", "sweep", "charge"], "tags": ["melee", "multi-hit"], "cd": 90, "source_ordinal": 13, "source_line": 9834},
	{"id": "slam", "idx": 14, "tele": 35, "rec": 40, "canFeint": false, "canDelay": 0.4, "range": [0, 140], "phase": [0, 1, 2, 3, 4], "combo": ["slashCombo", "sweep", "shock"], "tags": ["melee", "aoe"], "cd": 140, "source_ordinal": 14, "source_line": 9835},
	{"id": "sweep", "idx": 15, "tele": 25, "rec": 60, "canFeint": false, "canDelay": 0.2, "range": [0, 120], "phase": [0, 1, 2, 3, 4], "combo": ["slashCombo", "charge", "slam"], "tags": ["melee", "frontal"], "cd": 100, "source_ordinal": 15, "source_line": 9836},
	{"id": "burrowStrike", "idx": 58, "tele": 50, "rec": 40, "canFeint": false, "canDelay": 0, "range": [150, 600], "phase": [0, 1, 2, 3, 4], "combo": ["slashCombo", "fan", "burst"], "tags": ["gap-close", "melee", "ambush"], "cd": 200, "source_ordinal": 17, "source_line": 9838},
	{"id": "beanStorm", "idx": 17, "tele": 20, "rec": 25, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["burst", "fan", "charge"], "tags": ["ranged", "aoe", "redbean"], "cd": 80, "source_ordinal": 18, "source_line": 9839},
	{"id": "chaseAoe", "idx": 21, "tele": 20, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "multiDash", "slam"], "tags": ["aoe", "zone", "utility"], "cd": 180, "source_ordinal": 22, "source_line": 9843},
	{"id": "elemBall", "idx": 22, "tele": 60, "rec": 35, "canFeint": false, "canDelay": 0.3, "range": [60, 500], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["ranged", "frontal"], "cd": 100, "source_ordinal": 23, "source_line": 9844},
	{"id": "groundFissure", "idx": 34, "tele": 25, "rec": 35, "canFeint": false, "canDelay": 0, "range": [60, 400], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "slam", "pillars"], "tags": ["aoe", "zone", "ranged"], "cd": 140, "source_ordinal": 35, "source_line": 9856},
	{"id": "tideWave", "idx": 35, "tele": 60, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["aoe", "ranged"], "cd": 160, "source_ordinal": 36, "source_line": 9857},
	{"id": "seekerMines", "idx": 36, "tele": 25, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "multiDash", "elemBall"], "tags": ["ranged", "zone", "utility"], "cd": 180, "source_ordinal": 37, "source_line": 9858},
	{"id": "poisonTrail", "idx": 40, "tele": 20, "rec": 60, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [1, 2, 3, 4], "combo": ["charge", "multiDash", "fan"], "tags": ["zone", "utility", "sustained"], "cd": 160, "source_ordinal": 41, "source_line": 9862},
	{"id": "lavaPools", "idx": 49, "tele": 35, "rec": 40, "canFeint": false, "canDelay": 0, "range": [0, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "groundFissure"], "tags": ["zone", "aoe", "sustained"], "cd": 200, "source_ordinal": 50, "source_line": 9871},
	{"id": "rapidMissile", "idx": 56, "tele": 30, "rec": 40, "canFeint": false, "canDelay": 0, "range": [250, 999], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "fan", "burst"], "tags": ["ranged", "multi-hit", "gap-punish"], "cd": 100, "source_ordinal": 57, "source_line": 9878},
	{"id": "tailSwipe", "idx": 57, "tele": 40, "rec": 50, "canFeint": false, "canDelay": 0.2, "range": [0, 160], "phase": [0, 1, 2, 3, 4], "combo": ["charge", "slam", "jump"], "tags": ["melee", "frontal", "aoe"], "cd": 110, "source_ordinal": 58, "source_line": 9879},
]

const _PHASES = [
	{"hp": [0.8, 1], "spdM": 1.15, "teleM": 0.75, "cdM": 0.5, "comboC": 0.4, "feintC": 0.08, "delayC": 0.1, "label": "PHASE 1"},
	{"hp": [0.6, 0.8], "spdM": 1.25, "teleM": 0.65, "cdM": 0.4, "comboC": 0.55, "feintC": 0.15, "delayC": 0.2, "label": "⚠ PHASE 2"},
	{"hp": [0.4, 0.6], "spdM": 1.4, "teleM": 0.5, "cdM": 0.35, "comboC": 0.65, "feintC": 0.2, "delayC": 0.25, "label": "⚠ PHASE 3"},
	{"hp": [0.2, 0.4], "spdM": 1.55, "teleM": 0.4, "cdM": 0.25, "comboC": 0.8, "feintC": 0.3, "delayC": 0.35, "label": "🔥 PHASE 4"},
	{"hp": [0, 0.2], "spdM": 1.75, "teleM": 0.25, "cdM": 0.15, "comboC": 0.9, "feintC": 0.4, "delayC": 0.4, "label": "💀 광폭화!"},
]

const _COMBOS = [
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

static func source_receipt() -> Dictionary:
	return _RECEIPT.duplicate(true)


static func boss_for_stage(si: int) -> Dictionary:
	if si < 0 or si >= _FINAL_SETS.size():
		return {"supported": false, "reason": "unsupported_chapter_stage", "si": si}
	return {"supported": true, "si": si, "hell": 0, "name_ko": _BOSS_NAMES[si],
		"element_id": 0, "ib": true, "etype": 0, "move_ids": _FINAL_SETS[si].duplicate(true)}


static func moves_for_stage(si: int) -> Array:
	if si < 0 or si >= _FINAL_SETS.size():
		return []
	var result: Array = []
	# _MOVES retains BOSS_MOVES order, independently of Set insertion order.
	for move: Dictionary in _MOVES:
		if _FINAL_SETS[si].has(move["id"]):
			result.append(move.duplicate(true))
	return result


static func move_by_id(id: String) -> Dictionary:
	for move: Dictionary in _MOVES:
		if move["id"] == id:
			return move.duplicate(true)
	return {}


static func phase_by_index(phase: int) -> Dictionary:
	if phase < 0 or phase >= _PHASES.size():
		return {}
	return _PHASES[phase].duplicate(true)


static func combos_for_stage(si: int, phase: int) -> Array:
	if si < 0 or si >= _FINAL_SETS.size() or phase < 0 or phase >= _PHASES.size():
		return []
	var result: Array = []
	for combo: Dictionary in _COMBOS:
		if not combo["phase"].has(phase):
			continue
		var allowed := true
		for id: String in combo["seq"]:
			if not _FINAL_SETS[si].has(id):
				allowed = false
				break
		if allowed:
			result.append(combo.duplicate(true))
	return result
