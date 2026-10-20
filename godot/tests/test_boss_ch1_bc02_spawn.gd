extends SceneTree
## BC02 independent numeric oracle: exact latest-main mkEn in a fresh Node VM.
## 56 source cases, 81 selected common/boss fields; common values + literal overrides.
## Expectations are NOT copied from the GDScript implementation or catalog API.
## No actors, Main, ordinary timers, skin binding, Q/E, save or live gameplay evidence.
const Spawn = preload("res://scripts/native_ch1_boss_spawn_contract.gd")
const Catalog = preload("res://scripts/native_ch1_boss_catalog.gd")
const USERDIR = "EXODUSER-bc02-Isolated-20261020"
const GAME_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const SOURCE_MAIN = "284d7faf49295b2f5061937a47ce96038032ed3c"
const UNITS = [0.0, 0.25, 0.5, 0.75, 0.875, 0.125]
const RNG_FIELDS = ["st2", "facing", "projT", "bossPatT", "_bossOrbitAng", "_erraticAng"]
const RNG_LINES = [31165, 31165, 31168, 31171, 31260, 31300]
const GROUPS = ["source_56_cases_81_fields", "placement_and_early_gates",
    "rng_order_and_boundary_units", "copy_isolation_and_scope", "receipt_and_hp_anchors"]
const SOURCE_COMMON_FIELDS = {"x": 12.5, "y": 20.25, "r": 44, "hp": 21017, "mhp": 21017, "atk": 46, "baseAtk": 46, "speed": 0.5, "baseSpd": 0.5, "el": 0, "col": "#bbbbbb", "alive": true, "stunned": 0, "kb": {"x": 0, "y": 0}, "poise": 21017, "maxPoise": 21017, "poiseR": 0, "ib": true, "etype": 0, "room": 0, "lv": 1, "s": "idle", "st2": 30, "facing": 1.5707963267948966, "elite": 0, "mods": [], "aura": null, "modT": {"regen": 0, "summon": 0, "tp": 0, "chaos": 0, "vortex": 0, "lightning": 0, "twarp": 0, "cloned": false, "revived": false, "split": false, "sentry": 0, "sentryAng": 0, "sentryOn": false, "illusioned": false, "stealthT": 0, "eliteBusy": 0, "eliteCharge": 0, "eliteRing": 0, "eliteBolt": 0, "eliteMortar": 0}, "projCd": 50, "projT": 95, "chargeT": 0, "chargeCd": 9999, "dropTier": 1, "bossPatCd": 35, "bossPatT": 45, "jumpX": 0, "jumpY": 0, "jumpOx": 0, "jumpOy": 0, "_bossPhase": 0, "_combatSt": "engage", "_comboSeq": null, "_comboIdx": 0, "_moveCDs": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "_lastMoves": [], "_feinting": false, "_delaying": 0, "_dbgScores": null, "shockR": 0, "shockMax": 0, "laserAng": 0, "laserLen": 0, "deaths": 0, "reviveIframes": 0, "meteors": [], "_revPts": 200, "_maxRevPts": 200, "shieldAng": 0, "eShield": 21017, "eShieldMax": 21017, "eShieldRegenT": 0, "eRes": [0, 0, 0, 0, 0, 0, 0], "_firstShot": false, "bleed": 0, "bleedT": 0, "bleedStk": 0, "_bleedPool": 0, "poison": 0, "poisonT": 0, "poisonStk": 0, "_poisonPool": 0, "burnT": 0, "burnStk": 0, "_burnPool": 0, "_homeX": 12.5, "_homeY": 20.25, "_bossOrbitAng": 5.497787143782138, "_bossStrafeCd": 0, "_erraticT": 9999, "_erraticAng": 0.7853981633974483, "_spawnT": 20}
const SOURCE_CASES = [
	{"request": {"si": 0, "player_level": 0, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {}},
	{"request": {"si": 0, "player_level": 1, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {}},
	{"request": {"si": 0, "player_level": 10, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 116532, "mhp": 116532, "atk": 62, "baseAtk": 62, "poise": 116532, "maxPoise": 116532, "lv": 10, "eShield": 116532, "eShieldMax": 116532}},
	{"request": {"si": 0, "player_level": 100, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 19656000, "mhp": 19656000, "atk": 219, "baseAtk": 219, "poise": 19656000, "maxPoise": 19656000, "lv": 100, "eShield": 19656000, "eShieldMax": 19656000}},
	{"request": {"si": 0, "player_level": 500, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2344661280, "mhp": 2344661280, "atk": 915, "baseAtk": 915, "poise": 2344661280, "maxPoise": 2344661280, "lv": 500, "eShield": 2344661280, "eShieldMax": 2344661280}},
	{"request": {"si": 0, "player_level": 501, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2343276000, "mhp": 2343276000, "atk": 916, "baseAtk": 916, "poise": 2343276000, "maxPoise": 2343276000, "lv": 501, "eShield": 2343276000, "eShieldMax": 2343276000}},
	{"request": {"si": 1, "player_level": 0, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 21437, "mhp": 21437, "poise": 21437, "maxPoise": 21437, "_revPts": 206, "_maxRevPts": 206, "eShield": 21437, "eShieldMax": 21437}},
	{"request": {"si": 1, "player_level": 1, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 21437, "mhp": 21437, "poise": 21437, "maxPoise": 21437, "_revPts": 206, "_maxRevPts": 206, "eShield": 21437, "eShieldMax": 21437}},
	{"request": {"si": 1, "player_level": 10, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 118862, "mhp": 118862, "atk": 62, "baseAtk": 62, "poise": 118862, "maxPoise": 118862, "lv": 10, "_revPts": 206, "_maxRevPts": 206, "eShield": 118862, "eShieldMax": 118862}},
	{"request": {"si": 1, "player_level": 100, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 20049120, "mhp": 20049120, "atk": 219, "baseAtk": 219, "poise": 20049120, "maxPoise": 20049120, "lv": 100, "_revPts": 206, "_maxRevPts": 206, "eShield": 20049120, "eShieldMax": 20049120}},
	{"request": {"si": 1, "player_level": 500, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2391554505, "mhp": 2391554505, "atk": 915, "baseAtk": 915, "poise": 2391554505, "maxPoise": 2391554505, "lv": 500, "_revPts": 206, "_maxRevPts": 206, "eShield": 2391554505, "eShieldMax": 2391554505}},
	{"request": {"si": 1, "player_level": 501, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2390141520, "mhp": 2390141520, "atk": 916, "baseAtk": 916, "poise": 2390141520, "maxPoise": 2390141520, "lv": 501, "_revPts": 206, "_maxRevPts": 206, "eShield": 2390141520, "eShieldMax": 2390141520}},
	{"request": {"si": 2, "player_level": 0, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 21857, "mhp": 21857, "poise": 21857, "maxPoise": 21857, "_revPts": 212, "_maxRevPts": 212, "eShield": 21857, "eShieldMax": 21857}},
	{"request": {"si": 2, "player_level": 1, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 21857, "mhp": 21857, "poise": 21857, "maxPoise": 21857, "_revPts": 212, "_maxRevPts": 212, "eShield": 21857, "eShieldMax": 21857}},
	{"request": {"si": 2, "player_level": 10, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 121193, "mhp": 121193, "atk": 62, "baseAtk": 62, "poise": 121193, "maxPoise": 121193, "lv": 10, "_revPts": 212, "_maxRevPts": 212, "eShield": 121193, "eShieldMax": 121193}},
	{"request": {"si": 2, "player_level": 100, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 20442240, "mhp": 20442240, "atk": 219, "baseAtk": 219, "poise": 20442240, "maxPoise": 20442240, "lv": 100, "_revPts": 212, "_maxRevPts": 212, "eShield": 20442240, "eShieldMax": 20442240}},
	{"request": {"si": 2, "player_level": 500, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2438447731, "mhp": 2438447731, "atk": 915, "baseAtk": 915, "poise": 2438447731, "maxPoise": 2438447731, "lv": 500, "_revPts": 212, "_maxRevPts": 212, "eShield": 2438447731, "eShieldMax": 2438447731}},
	{"request": {"si": 2, "player_level": 501, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2437007040, "mhp": 2437007040, "atk": 916, "baseAtk": 916, "poise": 2437007040, "maxPoise": 2437007040, "lv": 501, "_revPts": 212, "_maxRevPts": 212, "eShield": 2437007040, "eShieldMax": 2437007040}},
	{"request": {"si": 3, "player_level": 0, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 22278, "mhp": 22278, "poise": 22278, "maxPoise": 22278, "_revPts": 218, "_maxRevPts": 218, "eShield": 22278, "eShieldMax": 22278}},
	{"request": {"si": 3, "player_level": 1, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 22278, "mhp": 22278, "poise": 22278, "maxPoise": 22278, "_revPts": 218, "_maxRevPts": 218, "eShield": 22278, "eShieldMax": 22278}},
	{"request": {"si": 3, "player_level": 10, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 123523, "mhp": 123523, "atk": 62, "baseAtk": 62, "poise": 123523, "maxPoise": 123523, "lv": 10, "_revPts": 218, "_maxRevPts": 218, "eShield": 123523, "eShieldMax": 123523}},
	{"request": {"si": 3, "player_level": 100, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 20835360, "mhp": 20835360, "atk": 219, "baseAtk": 219, "poise": 20835360, "maxPoise": 20835360, "lv": 100, "_revPts": 218, "_maxRevPts": 218, "eShield": 20835360, "eShieldMax": 20835360}},
	{"request": {"si": 3, "player_level": 500, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2485340956, "mhp": 2485340956, "atk": 915, "baseAtk": 915, "poise": 2485340956, "maxPoise": 2485340956, "lv": 500, "_revPts": 218, "_maxRevPts": 218, "eShield": 2485340956, "eShieldMax": 2485340956}},
	{"request": {"si": 3, "player_level": 501, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2483872560, "mhp": 2483872560, "atk": 916, "baseAtk": 916, "poise": 2483872560, "maxPoise": 2483872560, "lv": 501, "_revPts": 218, "_maxRevPts": 218, "eShield": 2483872560, "eShieldMax": 2483872560}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 0, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 1055097576, "mhp": 1055097576, "atk": 411, "baseAtk": 411, "poise": 1055097576, "maxPoise": 1055097576, "lv": 500, "eShield": 1055097576, "eShieldMax": 1055097576}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 1, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 1480257442, "mhp": 1480257442, "atk": 598, "baseAtk": 598, "poise": 1480257442, "maxPoise": 1480257442, "lv": 600, "eShield": 1480257442, "eShieldMax": 1480257442}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 2, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2012086404, "mhp": 2012086404, "atk": 820, "baseAtk": 820, "poise": 2012086404, "maxPoise": 2012086404, "lv": 700, "eShield": 2012086404, "eShieldMax": 2012086404}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 3, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2705861532, "mhp": 2705861532, "atk": 1092, "baseAtk": 1092, "poise": 2705861532, "maxPoise": 2705861532, "lv": 800, "eShield": 2705861532, "eShieldMax": 2705861532}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 4, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 3603573252, "mhp": 3603573252, "atk": 1417, "baseAtk": 1417, "poise": 3603573252, "maxPoise": 3603573252, "lv": 900, "eShield": 3603573252, "eShieldMax": 3603573252}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 4709875083, "mhp": 4709875083, "atk": 1785, "baseAtk": 1785, "poise": 4709875083, "maxPoise": 4709875083, "lv": 1000, "eShield": 4709875083, "eShieldMax": 4709875083}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 6, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 6067169356, "mhp": 6067169356, "atk": 2194, "baseAtk": 2194, "poise": 6067169356, "maxPoise": 6067169356, "lv": 1100, "eShield": 6067169356, "eShieldMax": 6067169356}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 7, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 7788194957, "mhp": 7788194957, "atk": 2666, "baseAtk": 2666, "poise": 7788194957, "maxPoise": 7788194957, "lv": 1200, "eShield": 7788194957, "eShieldMax": 7788194957}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 8, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 10032601065, "mhp": 10032601065, "atk": 3229, "baseAtk": 3229, "poise": 10032601065, "maxPoise": 10032601065, "lv": 1300, "eShield": 10032601065, "eShieldMax": 10032601065}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 9, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 13022707946, "mhp": 13022707946, "atk": 3919, "baseAtk": 3919, "poise": 13022707946, "maxPoise": 13022707946, "lv": 1400, "eShield": 13022707946, "eShieldMax": 13022707946}},
	{"request": {"si": 0, "player_level": 1000, "difficulty_index": 10, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 16874189523, "mhp": 16874189523, "atk": 4725, "baseAtk": 4725, "poise": 16874189523, "maxPoise": 16874189523, "lv": 1500, "eShield": 16874189523, "eShieldMax": 16874189523}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 0, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 1118403430, "mhp": 1118403430, "atk": 411, "baseAtk": 411, "poise": 1118403430, "maxPoise": 1118403430, "lv": 500, "_revPts": 218, "_maxRevPts": 218, "eShield": 1118403430, "eShieldMax": 1118403430}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 1, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 1569072888, "mhp": 1569072888, "atk": 598, "baseAtk": 598, "poise": 1569072888, "maxPoise": 1569072888, "lv": 600, "_revPts": 218, "_maxRevPts": 218, "eShield": 1569072888, "eShieldMax": 1569072888}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 2, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2132811588, "mhp": 2132811588, "atk": 820, "baseAtk": 820, "poise": 2132811588, "maxPoise": 2132811588, "lv": 700, "_revPts": 218, "_maxRevPts": 218, "eShield": 2132811588, "eShieldMax": 2132811588}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 3, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2868213223, "mhp": 2868213223, "atk": 1092, "baseAtk": 1092, "poise": 2868213223, "maxPoise": 2868213223, "lv": 800, "_revPts": 218, "_maxRevPts": 218, "eShield": 2868213223, "eShieldMax": 2868213223}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 4, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 3819787647, "mhp": 3819787647, "atk": 1417, "baseAtk": 1417, "poise": 3819787647, "maxPoise": 3819787647, "lv": 900, "_revPts": 218, "_maxRevPts": 218, "eShield": 3819787647, "eShieldMax": 3819787647}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 4992467587, "mhp": 4992467587, "atk": 1785, "baseAtk": 1785, "poise": 4992467587, "maxPoise": 4992467587, "lv": 1000, "_revPts": 218, "_maxRevPts": 218, "eShield": 4992467587, "eShieldMax": 4992467587}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 6, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 6431199517, "mhp": 6431199517, "atk": 2194, "baseAtk": 2194, "poise": 6431199517, "maxPoise": 6431199517, "lv": 1100, "_revPts": 218, "_maxRevPts": 218, "eShield": 6431199517, "eShieldMax": 6431199517}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 7, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 8255486654, "mhp": 8255486654, "atk": 2666, "baseAtk": 2666, "poise": 8255486654, "maxPoise": 8255486654, "lv": 1200, "_revPts": 218, "_maxRevPts": 218, "eShield": 8255486654, "eShieldMax": 8255486654}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 8, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 10634557128, "mhp": 10634557128, "atk": 3229, "baseAtk": 3229, "poise": 10634557128, "maxPoise": 10634557128, "lv": 1300, "_revPts": 218, "_maxRevPts": 218, "eShield": 10634557128, "eShieldMax": 10634557128}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 9, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 13804070422, "mhp": 13804070422, "atk": 3919, "baseAtk": 3919, "poise": 13804070422, "maxPoise": 13804070422, "lv": 1400, "_revPts": 218, "_maxRevPts": 218, "eShield": 13804070422, "eShieldMax": 13804070422}},
	{"request": {"si": 3, "player_level": 1000, "difficulty_index": 10, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 17886640894, "mhp": 17886640894, "atk": 4725, "baseAtk": 4725, "poise": 17886640894, "maxPoise": 17886640894, "lv": 1500, "_revPts": 218, "_maxRevPts": 218, "eShield": 17886640894, "eShieldMax": 17886640894}},
	{"request": {"si": 0, "player_level": -10, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {}},
	{"request": {"si": 1, "player_level": 100, "difficulty_index": 5, "stage_diff_offset": -300, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 21437, "mhp": 21437, "poise": 21437, "maxPoise": 21437, "_revPts": 206, "_maxRevPts": 206, "eShield": 21437, "eShieldMax": 21437}},
	{"request": {"si": 2, "player_level": 100, "difficulty_index": 5, "stage_diff_offset": 17, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 32319579, "mhp": 32319579, "atk": 248, "baseAtk": 248, "poise": 32319579, "maxPoise": 32319579, "lv": 117, "_revPts": 212, "_maxRevPts": 212, "eShield": 32319579, "eShieldMax": 32319579}},
	{"request": {"si": 3, "player_level": 1.125, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 23975, "mhp": 23975, "poise": 23975, "maxPoise": 23975, "lv": 1.125, "_revPts": 218, "_maxRevPts": 218, "eShield": 23975, "eShieldMax": 23975}},
	{"request": {"si": 1, "player_level": 499.5, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2384396513, "mhp": 2384396513, "atk": 914, "baseAtk": 914, "poise": 2384396513, "maxPoise": 2384396513, "lv": 499.5, "_revPts": 206, "_maxRevPts": 206, "eShield": 2384396513, "eShieldMax": 2384396513}},
	{"request": {"si": 2, "player_level": 500.5, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 2435302924, "mhp": 2435302924, "atk": 915, "baseAtk": 915, "poise": 2435302924, "maxPoise": 2435302924, "lv": 500.5, "_revPts": 212, "_maxRevPts": 212, "eShield": 2435302924, "eShieldMax": 2435302924}},
	{"request": {"si": 0, "player_level": 10, "difficulty_index": 99, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 116532, "mhp": 116532, "atk": 62, "baseAtk": 62, "poise": 116532, "maxPoise": 116532, "lv": 10, "eShield": 116532, "eShieldMax": 116532}},
	{"request": {"si": 3, "player_level": 10, "difficulty_index": -1, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "clear", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"hp": 123523, "mhp": 123523, "atk": 62, "baseAtk": 62, "poise": 123523, "maxPoise": 123523, "lv": 10, "_revPts": 218, "_maxRevPts": 218, "eShield": 123523, "eShieldMax": 123523}},
	{"request": {"si": 3, "player_level": 1, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 7}, "placement": "safe", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}, {"kind": "safe_point", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [0, 0.25, 0.5, 0.75, 0.875, 0.125], "overrides": {"x": 56.25, "y": 98.5, "hp": 22278, "mhp": 22278, "poise": 22278, "maxPoise": 22278, "room": 7, "_revPts": 218, "_maxRevPts": 218, "eShield": 22278, "eShieldMax": 22278, "_homeX": 56.25, "_homeY": 98.5}},
	{"request": {"si": 0, "player_level": 1, "difficulty_index": 5, "stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}, "placement": "none", "placement_reads": [{"kind": "can_move", "x": 12.5, "y": 20.25, "r": 22}, {"kind": "safe_point", "x": 12.5, "y": 20.25, "r": 22}], "draw_values": [], "overrides": null}
]

var assertions: int = 0
var failures: int = 0
var group: String = ""
var groups: Array = []
var source_path: String = ""

func _initialize() -> void:
	for arg: String in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="):
			source_path = arg.trim_prefix("--source-game=")
	call_deferred("_run")

func _run() -> void:
	group = "isolation"
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true 		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR 		and OS.get_user_data_dir().get_file() == USERDIR
	check(isolated, "settings and actual OS user folder must match exact task isolation")
	if not isolated:
		finish(2)
		return
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path) == GAME_SHA256,
		"independent fixture applies to supplied latest-main game.html hash")
	for name: String in GROUPS:
		group = name
		var before: int = assertions
		var failed_before: int = failures
		call("_test_" + name)
		var row: Dictionary = {"group": name, "assertions": assertions - before,
			"failures": failures - failed_before}
		check(assertions > before, "group must execute assertions")
		groups.append(row)
		print("BC02_GROUP ", JSON.stringify(row))
	finish(0 if failures == 0 and assertions > 0 else 1)

func finish(code: int) -> void:
	print("BC02_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"skipped": [], "groups": groups, "source_main": SOURCE_MAIN, "userdir": OS.get_user_data_dir(),
		"public_play_evidence": false, "actor_instantiations": 0, "shared_lines_changed": 0}))
	quit(code)

func check(ok: bool, message: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("BC02_FAIL ", group, " ", message)

func same(actual: Variant, expected: Variant) -> bool:
	if (actual is int or actual is float) and (expected is int or expected is float):
		if actual == expected:
			return true
		# Integer-valued source HP, attack, counts and timers must match exactly.
		if floor(float(expected)) == float(expected):
			return false
		return absf(float(actual) - float(expected)) <= 1e-12
	if actual is Array and expected is Array:
		if actual.size() != expected.size(): return false
		for i in range(expected.size()):
			if not same(actual[i], expected[i]): return false
		return true
	if actual is Dictionary and expected is Dictionary:
		if actual.size() != expected.size(): return false
		for key in expected:
			if not actual.has(key) or not same(actual[key], expected[key]): return false
		return true
	return actual == expected

func request(si: int = 0, lv: float = 1.0) -> Dictionary:
	return {"si": si, "player_level": lv, "difficulty_index": 5,
		"stage_diff_offset": 0, "x": 12.5, "y": 20.25, "room": 0}

func invoke(req: Dictionary, placement: String = "clear", units: Array = UNITS) -> Dictionary:
	var calls: Array = []
	var reads: Array = []
	var rng: Callable = func(field: String) -> Variant:
		var i: int = calls.size()
		calls.append(field)
		return units[i] if i < units.size() else null
	var can_move: Callable = func(x: float, y: float, r: float) -> bool:
		reads.append({"kind": "can_move", "x": x, "y": y, "r": r})
		return placement == "clear"
	var safe_point: Callable = func(x: float, y: float, r: float) -> Variant:
		reads.append({"kind": "safe_point", "x": x, "y": y, "r": r})
		return {"x": 56.25, "y": 98.5} if placement == "safe" else null
	var packet: Dictionary = Spawn.build_spawn_packet(req, rng, can_move, safe_point)
	return {"packet": packet, "calls": calls, "reads": reads}

func _test_source_56_cases_81_fields() -> void:
	check(SOURCE_COMMON_FIELDS.size() == 81 and SOURCE_CASES.size() == 56, "literal oracle dimensions")
	for i in range(SOURCE_CASES.size()):
		var case: Dictionary = SOURCE_CASES[i]
		var req: Dictionary = case["request"].duplicate(true)
		var original: Dictionary = req.duplicate(true)
		var run: Dictionary = invoke(req, case["placement"])
		var packet: Dictionary = run["packet"]
		check(req == original, "case%d input unmodified" % i)
		check(same(run["reads"], case["placement_reads"]), "case%d actual collision read order" % i)
		check(same(packet["placement_reads"], case["placement_reads"]), "case%d collision ledger" % i)
		if case["overrides"] == null:
			check(packet["status"] == "REJECTED" and packet["fields"].is_empty(), "source null spawn")
			check(run["calls"].is_empty() and packet["rng_ledger"].is_empty(), "blocked source consumes zero RNG")
			continue
		var expected: Dictionary = SOURCE_COMMON_FIELDS.duplicate(true)
		expected.merge(case["overrides"], true)
		check(packet["status"] == "READY", "case%d ready: %s" % [i, packet.get("reason", "")])
		if packet["status"] != "READY": continue
		check(packet["fields"].size() == expected.size(), "case%d exact field set" % i)
		for key in expected:
			check(packet["fields"].has(key) and same(packet["fields"].get(key), expected[key]),
				"case%d field %s source=%s actual=%s" % [i, key, str(expected[key]), str(packet["fields"].get(key))])
		check(run["calls"] == RNG_FIELDS, "case%d six calls in source order, no elite/speed/radius draws" % i)
		check(packet["rng_ledger"].size() == 6, "case%d six ledger records" % i)
		for j in range(6):
			check(same(packet["rng_ledger"][j], {"ordinal": j, "field": RNG_FIELDS[j],
				"source_line": RNG_LINES[j], "unit": case["draw_values"][j]}), "case%d ledger%d" % [i, j])

func _test_placement_and_early_gates() -> void:
	for si in [-1, 4, 99]:
		var run: Dictionary = invoke(request(si))
		check(run["packet"]["status"] == "NOT_READY" and run["calls"].is_empty() and run["reads"].is_empty(), "unsupported stage before readers/RNG")
	for key in ["x", "y"]:
		for bad in [NAN, INF, -INF]:
			var req: Dictionary = request()
			req[key] = bad
			var run: Dictionary = invoke(req)
			check(run["packet"]["reason"] == "source_non_finite_position" and run["calls"].is_empty() and run["reads"].is_empty(), "nonfinite coordinate source early return")
	for key in request():
		var req: Dictionary = request()
		req.erase(key)
		var run: Dictionary = invoke(req)
		check(run["packet"]["status"] == "NOT_READY" and run["packet"]["fields"].is_empty() and run["calls"].is_empty(), "missing current input not fabricated: " + key)
	var empty: Callable = Callable()
	var clear: Callable = func(_x: float, _y: float, _r: float) -> bool: return true
	var blocked: Callable = func(_x: float, _y: float, _r: float) -> bool: return false
	var fixed: Callable = func(_field: String) -> float: return 0.5
	check(Spawn.build_spawn_packet(request(), fixed, empty)["reason"] == "can_move_reader_missing", "missing collision reader")
	check(Spawn.build_spawn_packet(request(), fixed, blocked)["reason"] == "safe_point_reader_missing", "missing safe point reader when needed")
	check(Spawn.build_spawn_packet(request(), empty, clear)["reason"] == "rng_provider_missing", "missing RNG is not random fallback")
	check(Spawn.build_spawn_packet(request(), fixed, clear)["status"] == "READY", "safe point reader unnecessary for clear source")
	for result in [{}, {"x": 1}, {"x": INF, "y": 0}, false]:
		var safe: Callable = func(_x: float, _y: float, _r: float) -> Variant: return result
		var packet: Dictionary = Spawn.build_spawn_packet(request(), fixed, blocked, safe)
		check(packet["status"] == "NOT_READY" and packet["rng_ledger"].is_empty(), "invalid relocation cannot become ready")
	var req_nan: Dictionary = request()
	req_nan["player_level"] = NAN
	req_nan["stage_diff_offset"] = NAN
	check(invoke(req_nan)["packet"]["fields"]["hp"] == 21017, "numeric JS NaN || fallbacks")

func _test_rng_order_and_boundary_units() -> void:
	for unit in [0.0, 1.0 - 1.0 / 9007199254740992.0]:
		var run: Dictionary = invoke(request(), "clear", [unit, unit, unit, unit, unit, unit])
		var fields: Dictionary = run["packet"]["fields"]
		check(run["packet"]["status"] == "READY" and run["calls"] == RNG_FIELDS, "RNG legal endpoint and source draw sequence")
		check(same(fields["st2"], 30.0 + unit * 50.0) and same(fields["projT"], 70.0 + unit * 50.0), "independent timer endpoints")
		check(same(fields["bossPatT"], 30.0 + unit * 20.0), "pattern timer endpoint")
		check(same(fields["facing"], unit * PI * 2.0) and same(fields["_bossOrbitAng"], unit * PI * 2.0) and same(fields["_erraticAng"], unit * PI * 2.0), "all three angle endpoints")
	for unit in [-0.01, 1.0, NAN, INF, null, true, "0.5"]:
		var run: Dictionary = invoke(request(), "clear", [0.0, 0.25, unit, 0.5, 0.5, 0.5])
		check(run["packet"]["status"] == "NOT_READY" and run["packet"]["fields"].is_empty(), "invalid unit never becomes a success packet")
		check(run["calls"] == ["st2", "facing", "projT"] and run["packet"]["rng_ledger"].size() == 2, "failed provider stops exactly at third call")

func _test_copy_isolation_and_scope() -> void:
	var before_children: int = root.get_child_count()
	var before_actions: Array[StringName] = InputMap.get_actions()
	var fps: int = Engine.max_fps
	var physics: int = Engine.physics_ticks_per_second
	var locale: String = TranslationServer.get_locale()
	var first: Dictionary = invoke(request())["packet"]
	first["fields"]["_moveCDs"][0] = 99
	first["fields"]["kb"]["x"] = 999
	first["fields"]["eRes"][0] = 1
	first["fields"]["mods"].append("invented")
	first["fields"]["modT"]["regen"] = 88
	first["fields"]["_lastMoves"].append("burst")
	first["rng_ledger"][0]["unit"] = 0.9
	first["placement_reads"][0]["r"] = 44
	var again: Dictionary = invoke(request())["packet"]
	check(same(again["fields"], SOURCE_COMMON_FIELDS), "nested return mutation cannot contaminate another spawn")
	check(again["rng_ledger"][0]["unit"] == 0.0 and again["placement_reads"][0]["r"] == 22, "ledger and placement copies")
	check(Catalog.boss_for_stage(0)["move_ids"].size() == 23, "dependency remains immutable")
	check(root.get_child_count() == before_children and InputMap.get_actions() == before_actions, "no nodes or input registration")
	check(Engine.max_fps == fps and Engine.physics_ticks_per_second == physics and TranslationServer.get_locale() == locale, "no engine/locale writes")

func _test_receipt_and_hp_anchors() -> void:
	var receipt: Dictionary = Spawn.source_receipt()
	check(receipt["source_main"] == SOURCE_MAIN and receipt["game_sha256"] == GAME_SHA256, "latest-main source receipt")
	check(receipt["finale_reachable"] == false and receipt["ordinary_boss_only"], "ordinary path does not enable inaccessible finale")
	receipt["rng_sites"][0][0] = "changed"
	check(Spawn.source_receipt()["rng_sites"][0][0] == "st2", "receipt independent nested copy")
	var expected_hp: Array = [21017, 21437, 21857, 22278]
	var expected_pts: Array = [200, 206, 212, 218]
	for si in range(4):
		var fields: Dictionary = invoke(request(si))["packet"]["fields"]
		check(fields["hp"] == expected_hp[si] and fields["atk"] == 46, "four Lv1 exact HP anchors")
		check(fields["_revPts"] == expected_pts[si] and fields["_maxRevPts"] == expected_pts[si], "source rounded revival points")
		check(fields["r"] == 44 and fields["speed"] == 0.5 and fields["poise"] == fields["hp"] and fields["eShield"] == fields["hp"], "body / speed / poise / shield identity")
		check(fields["_moveCDs"].size() == 59 and not fields["_moveCDs"].has(1), "source array length is 59 despite idx60")
	var p500: Dictionary = invoke(request(0, 500))["packet"]["fields"]
	var p501: Dictionary = invoke(request(0, 501))["packet"]["fields"]
	check(p500["hp"] == 2344661280 and p500["atk"] == 915, "Lv500 beyond signed int32 kept")
	check(p501["hp"] == 2343276000 and p501["atk"] == 916 and p501["hp"] < p500["hp"], "Lv501 source discontinuity preserved")
	# Independent case has distinct double-floor result: si3, Lv1.125.
	var fraction: Dictionary = invoke(request(3, 1.125))["packet"]
	check(fraction["fields"]["hp"] == 23975 and fraction["calculation"]["first_floor_hp"] == 22618, "two floors are not collapsed")
