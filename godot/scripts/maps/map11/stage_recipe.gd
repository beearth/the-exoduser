extends Resource
## MAP11-02 minimal arena authoring schema. No actors, render or State ownership.
@export var schema_version: int = 1
@export var stage_id: int = 0
@export var map_instance_id: String = "map11.arena"
@export var revision: int = 1
@export var radius: float = 1700.0
# Gameplay metric, NOT a geometry size: G37938–37941 / legacy 128x108,T40.
@export var effect_extent: Vector3i = Vector3i(128,108,40)
@export var anchors: Array[Dictionary] = [
	{"id":"map11.arena.entry","marker":"Entry","role":"arena_entry","position":Vector2(0,800),"facing":-PI/2,"region_id":0,"clearance":44.0},
	{"id":"map11.arena.boss","marker":"Boss","role":"boss_center","position":Vector2.ZERO,"facing":PI/2,"region_id":0,"clearance":44.0},
	{"id":"map11.arena.exit","marker":"Exit","role":"arena_exit","position":Vector2(0,-1420),"facing":-PI/2,"region_id":0,"clearance":44.0},
	{"id":"map11.arena.return","marker":"Return","role":"arena_return","position":Vector2(0,1320),"facing":PI/2,"region_id":0,"clearance":44.0}
]
# One arena region, separate namespace from field NW/NE/SW/SE region ledger.
@export var regions: Array[Dictionary] = [{"id":0,"key":"map11.arena.region","center":Vector2.ZERO,"radius":1700.0}]
# Optional authored circles; never inferred from sprite alpha. Separate LOS flag.
@export var solids: Array[Dictionary] = []
# Bidirectional authored routes, validated with swept clearance (not endpoint tests).
@export var routes: Array[Dictionary] = [
	{"from":"map11.arena.entry","to":"map11.arena.boss","clearance":44.0},
	{"from":"map11.arena.boss","to":"map11.arena.exit","clearance":44.0},
	{"from":"map11.arena.entry","to":"map11.arena.return","clearance":44.0}
]
