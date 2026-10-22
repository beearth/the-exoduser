extends RefCounted
## Source-backed expectation for the existing Player/Warrior resource inspector.
## This definition never reads observed SpriteFrames, loads textures or creates nodes.

const EXPECTATION_SCHEMA := "fdg-native-sprite-resource-expectation-v1"
const DIRECTIONS: Array[String] = ["south", "south-east", "east", "north-east", "north", "north-west", "west", "south-west"]
const MODES: Array[String] = ["idle", "walk", "source_attack", "attack"]
const MODE_FRAME_COUNTS := {"idle": 2, "walk": 8, "source_attack": 8, "attack": 9}
const BODY_FRAME_OFFSETS := {"idle": 0, "walk": 2, "source_attack": 10}
const BODY_CELL_SIZE := 48
const ATTACK_CELL_SIZE := 80
const ANIMATION_TICKS_PER_SECOND := 60.0
const IDLE_FRAME_TICKS := 48.0
const OTHER_FRAME_TICKS := 8.0
const BODY_PATH_PREFIX := "res://assets/player/"
const ATTACK_PATH := "res://assets/player/attack-bat-v1.png"
const DASH_WARRIOR_PATH := "res://assets/player/dash-flight-v1.png"
const DASH_SILVERTAIL_PATH := "res://assets/player_silvertail/dash-flight-v1.png"
const DASH_FRAMES := 6
const DASH_CELL_SIZE := 64
const DASH_FRAME_TICKS := 4.0 # drawP _apSpd=4 (사슬기동 _isHarp)
const QUALITY_UNIQUE_FRAMES := 24
const QUALITY_FPS := 24.0

## Pass the actual Main.player as inspector root; Warrior is its descendant.
## Every call returns fresh descriptor containers, without observing the target.
static func build(profile: Dictionary = {}) -> Dictionary:
	var animations: Array = []
	for direction_index in range(DIRECTIONS.size()):
		var direction: String = DIRECTIONS[direction_index]
		for mode in MODES:
			var frames: Array = []
			var count: int = int(profile[mode+"_frames"]) if not profile.is_empty() else MODE_FRAME_COUNTS[mode]
			for index in range(count):
				var region: Rect2
				var atlas_path: String
				if mode == "attack":
					if not profile.is_empty() and profile.index==1:
						var cell: int = 8 if direction_index==0 and index==8 else posmod(8-direction_index+index,8)
						region=Rect2((cell%3)*80,floori(float(cell)/3.0)*80,80,80)
					else: region = Rect2(index * ATTACK_CELL_SIZE, direction_index * ATTACK_CELL_SIZE, ATTACK_CELL_SIZE, ATTACK_CELL_SIZE)
					atlas_path = profile.attack_path if not profile.is_empty() else ATTACK_PATH
				else:
					var offset: int = int(profile.source_attack_offset) if not profile.is_empty() and mode=="source_attack" else BODY_FRAME_OFFSETS[mode]
					region = Rect2((offset + index) * BODY_CELL_SIZE, 0, BODY_CELL_SIZE, BODY_CELL_SIZE)
					atlas_path = profile.body_paths[direction_index] if not profile.is_empty() else BODY_PATH_PREFIX + direction + ".png"
				frames.append({"index": index, "texture": {
					"class": "AtlasTexture",
					"atlas": {"class": "CompressedTexture2D", "resource_path": atlas_path},
					"region": region}})
			animations.append({"name": mode + "_" + direction,
				"loop": mode in ["idle", "walk"],
				"speed": ANIMATION_TICKS_PER_SECOND / (IDLE_FRAME_TICKS if mode == "idle" else OTHER_FRAME_TICKS),
				"exact_frame_count": true, "frames": frames})
		# PC-MOVE-SKILLS: WarriorDashFlight 시트(warrior-dash-flight.js) 64px×6, 행=방향. player._add_native_dash_flight_frames
		var dash_frames: Array = []
		var dash_path: String = DASH_SILVERTAIL_PATH if not profile.is_empty() and profile.index==1 else DASH_WARRIOR_PATH
		for index in range(DASH_FRAMES):
			dash_frames.append({"index": index, "texture": {"class": "AtlasTexture",
				"atlas": {"class": "CompressedTexture2D", "resource_path": dash_path},
				"region": Rect2(index * DASH_CELL_SIZE, direction_index * DASH_CELL_SIZE, DASH_CELL_SIZE, DASH_CELL_SIZE)}})
		animations.append({"name": "dash_" + direction, "loop": false, "speed": ANIMATION_TICKS_PER_SECOND / DASH_FRAME_TICKS,
			"exact_frame_count": true, "frames": dash_frames})
	return {"schema": EXPECTATION_SCHEMA,
		"source": {
			"directions": "godot/scripts/player.gd:12 DIRECTIONS",
			"builder": "godot/scripts/player.gd:701-725 _build_sprite",
			"combat_metadata": "godot/data/combat.json:26-30 player frame counts and idle ticks",
			"backed_texture_type": "docs/engine/FDG_GODOT_PORT_NATIVE_SPRITE_RESOURCE_READINESS_FIRST_20261014.md actual native CompressedTexture2D supplier"},
		"quality_target": {"unique_frames": QUALITY_UNIQUE_FRAMES, "fps": QUALITY_FPS},
		"targets": [{"id":"player_silvertail" if not profile.is_empty() and profile.index==1 else "player_warrior", "node_path": "Warrior",
			"class": "AnimatedSprite2D", "exact_animation_names": true,
			"animations": animations}]}
