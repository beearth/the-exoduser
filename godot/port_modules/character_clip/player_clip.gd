extends RefCounted
## Warrior (charIdx 0) idle / run / bat-swing attack clip picker.
## Source: game.html _build8 (idleN 2, walkN 8 on 48px strips), SpriteAnimator.play/update,
## _P_ANIM_MAP, _playerSpriteDirection, _facingDir8, drawP atlas branch; warrior-bat-swing.js frame/apply.
## Pure: the caller injects player state and the tick delta; only the passed clip state is mutated.

const STRIP_DIRECTIONS = ["south", "south-east", "east", "north-east", "north", "north-west", "west", "south-west"]
# _DIR8 angle sectors from east, screen y down.
const DIR8 = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"]
const STRIP_TEXTURE = "res://assets/player/%s.png"
const BAT_TEXTURE = "res://assets/player/attack-bat-v1.png"
const STRIP_CELL = 48
const BAT_CELL = 80
const IDLE_OFFSET = 0
const IDLE_FRAMES = 2
const WALK_OFFSET = 2
const WALK_FRAMES = 8
const BAT_FRAMES = 9
const IDLE_TICKS_PER_FRAME = 48.0
const WALK_PIXELS_PER_CYCLE = 256.0
const BAT_SPEED = 0.85
const PLAYER_SCALE = 2.0
const ANIM_BY_STATE = {"idle": "idle", "wWindup": "atk1", "wSwing": "atk2", "wRecover": "atk3"}
const SPEED_BY_ANIM = {"idle": 48.0, "run": 12.0, "atk1": 8.0, "atk2": 8.0, "atk3": 8.0}

## JS Math.round: halves round toward +inf (GDScript round() goes away from zero).
static func _js_round(value: float) -> int:
	return int(floor(value + 0.5))

static func facing_dir8(angle: float) -> String:
	return DIR8[posmod(_js_round(angle / (PI / 4.0)) % 8, 8)]

## _playerSpriteDirection for charIdx 0. Unsupported states fall through to facing like native.
static func direction_key(state: String, atk_arc: float, walk_moving: bool, walk_facing: float, ww_ang: float, facing: float) -> String:
	if state in ["wWindup", "wSwing", "wRecover"] and is_finite(atk_arc):
		return facing_dir8(atk_arc)
	if state == "idle" and walk_moving:
		return facing_dir8(walk_facing)
	if state == "whirlwind":
		return facing_dir8(ww_ang)
	return facing_dir8(facing)

## "" means the state is outside this unit (dash, chain, die, skills ...).
static func select_anim(state: String, walk_moving: bool, dead: bool) -> String:
	if dead or not ANIM_BY_STATE.has(state):
		return ""
	if state == "idle" and walk_moving:
		return "run"
	return ANIM_BY_STATE[state]

## ~~(10/(wp().spd||1))||1
static func windup_ticks(weapon_speed: float) -> int:
	var value := int(10.0 / (weapon_speed if weapon_speed != 0.0 else 1.0))
	return value if value != 0 else 1

## ~~(16/((wp().spd||.3)*statDex()*(1+meleeAtkSpd+glovesAtkSpd)))||1
static func recovery_ticks(weapon_speed: float, dex: float, melee_atk_spd: float, gloves_atk_spd: float) -> int:
	var value := int(16.0 / ((weapon_speed if weapon_speed != 0.0 else 0.3) * dex * (1.0 + melee_atk_spd + gloves_atk_spd)))
	return value if value != 0 else 1

static func _bat_base(state: String, left: float, windup: float, recovery: float) -> int:
	if state == "wWindup":
		return mini(2, int(floor(clampf(1.0 - left / maxf(1.0, windup), 0.0, 1.0) * 3.0)))
	if state == "wSwing":
		return mini(6, 2 + int(floor(maxf(0.0, 5.0 - left))))
	var progress := clampf(1.0 - left / maxf(1.0, recovery), 0.0, 1.0)
	return 6 if progress < 0.45 else (7 if progress < 0.8 else 8)

## WarriorBatSwing.frame for wWindup / wSwing / wRecover (sBash is outside this unit).
static func bat_frame(state: String, left: float, windup: float, recovery: float) -> int:
	if state == "wWindup":
		return _bat_base(state, windup - (windup - left) * BAT_SPEED, windup, recovery)
	var duration := 5.0
	if state == "wSwing":
		return _bat_base(state, duration - (duration - left) * BAT_SPEED, windup, recovery)
	if left <= 0.0:
		return 8
	var total := maxf(1.0, recovery)
	var elapsed := total - left
	var delay := duration * (1.0 / BAT_SPEED - 1.0)
	if elapsed < delay:
		return _bat_base("wSwing", duration - (duration + elapsed) * BAT_SPEED, windup, recovery)
	return _bat_base(state, left, windup, maxf(0.001, total - delay))

static func new_state() -> Dictionary:
	return {"anim": "idle", "f": 0, "t": 0.0}

## SpriteAnimator.play then the drawP branch for this anim. Mutates clip_state only.
## input: state, walk_moving, dead, walk_dist, st2, weapon_speed, recovery_ticks, atk_arc, walk_facing, ww_ang, facing.
static func step(clip_state: Dictionary, input: Dictionary, dt_ticks: float) -> Dictionary:
	var state := String(input.get("state", "idle"))
	var anim := select_anim(state, bool(input.get("walk_moving", false)), bool(input.get("dead", false)))
	if anim == "":
		return {"supported": false, "state": state}
	if clip_state["anim"] != anim:
		clip_state["anim"] = anim
		clip_state["f"] = 0
		clip_state["t"] = 0.0
	var direction := direction_key(state, float(input.get("atk_arc", NAN)), bool(input.get("walk_moving", false)), float(input.get("walk_facing", 0.0)), float(input.get("ww_ang", 0.0)), float(input.get("facing", 0.0)))
	var row: int = STRIP_DIRECTIONS.find(direction)
	var frame := 0
	if anim == "run":
		frame = int(float(input.get("walk_dist", 0.0)) * WALK_FRAMES / WALK_PIXELS_PER_CYCLE) % WALK_FRAMES
	elif anim == "idle":
		clip_state["t"] = float(clip_state["t"]) + dt_ticks
		if clip_state["t"] >= IDLE_TICKS_PER_FRAME:
			clip_state["t"] = float(clip_state["t"]) - IDLE_TICKS_PER_FRAME
			clip_state["f"] = (int(clip_state["f"]) + 1) % IDLE_FRAMES
		frame = int(clip_state["f"])
	else:
		var windup := windup_ticks(float(input.get("weapon_speed", 1.0)))
		frame = mini(BAT_FRAMES - 1, bat_frame(state, float(input.get("st2", 0.0)), windup, float(input.get("recovery_ticks", 1.0))))
	clip_state["f"] = frame
	var cell := BAT_CELL if anim.begins_with("atk") else STRIP_CELL
	var region := Rect2(frame * BAT_CELL, row * BAT_CELL, BAT_CELL, BAT_CELL) if cell == BAT_CELL else Rect2(((WALK_OFFSET if anim == "run" else IDLE_OFFSET) + frame) * STRIP_CELL, 0, STRIP_CELL, STRIP_CELL)
	return {
		"supported": true,
		"anim": anim,
		"direction": direction,
		"row": row,
		"frame": frame,
		"texture": BAT_TEXTURE if cell == BAT_CELL else STRIP_TEXTURE % direction,
		"region": region,
		# SpriteAnimator.draw: (-w/2,-h/2) at P, then X.scale(_pScale).
		"offset": Vector2(-cell, -cell) * 0.5,
		"scale": PLAYER_SCALE,
	}

## Caller helper: Sprite2D with region_enabled and centered=false. textures maps path -> Texture2D.
static func apply(sprite: Sprite2D, clip: Dictionary, textures: Dictionary) -> void:
	sprite.texture = textures[clip["texture"]]
	sprite.region_rect = clip["region"]
	sprite.offset = clip["offset"]
	sprite.scale = Vector2.ONE * float(clip["scale"])
