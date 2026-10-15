extends RefCounted
## Source-faithful M29 "돌진" (elite charge) dependency kernel. Native 60 clock.
## Source: game.html MOD_DEFS L31723, modT init L31829, lock helpers L31700-31701,
## trigger L39404, commit guard L39479-39486, eChargeWind/eCharge L41121-41140.
##
## Standalone and caller-driven: no Node, no _process/_physics_process, no
## autonomous dispatch. The original owner must gate calls with its own guards
## (hitStun return, stun branch, lesson return, tiering/culling, far-unalerted
## return for non-committed states) and call in source order inside ONE tick:
##   1. owner ticks the SHARED lock once: tick_attack_lock(modT, ticks)
##   2. advance_mod(actor, ticks, distance)   (accumulate/trigger, source L39404)
##   3. owner AI body, then step_charge(actor, ticks, player, true)
##      (source decrements e.st2 right before the state switch, L39486)
## Actor adapter: Dictionary (preferred, mutated by reference) or Object with
## same-named Variant properties. Fields read/written: x y r atk el col mods
## modT s st2 facing echDx echDy _chgAimMax _chgDur _chgSpd _chgLen _chgVisLen.
## Player context Dictionary: x y r iframes state parry_window(bool, = isPWin()).
## Outputs are plain event Dictionaries; the owner applies them to its real
## player/enemy/VFX. M29 contains no gameplay RNG; Math.random() in source is
## only cosmetic sparks, supplied here through the optional "random" provider.

const SOURCE_ID = "M29"
const SOURCE_NAME = "돌진"
const SOURCE_COLOR = "#ff5533"
const SOURCE_HELL = 0
const ELIGIBLE_MIN_DISTANCE = 140.0 # d>140 (exclusive)
const ELIGIBLE_MAX_DISTANCE = 520.0 # d<520 (exclusive)
const ACCUMULATE_TICKS = 540.0 # 9 s @60
const BUSY_TICKS = 78.0 # _claimEliteAttack(e,78)
const WINDUP_TICKS = 60.0 # st2 / _chgAimMax
const CHARGE_TICKS = 18.0 # _chgDur
const CHARGE_SPEED = 32.0 # _chgSpd per tick
const CHARGE_LENGTH_BASE = 640.0 # _chgLen = 640 + e.r
const AIM_LOCK_FRACTION = 0.755 # re-aim only while st2 > aimMax*.755
const WALL_PROBE_STEP = 12.0
const HIT_RADIUS_PAD = 18.0 # dst < P.r+e.r+18
const DAMAGE_ATK_MULT = 30.0 # ~~(atk*30*elMul)
const KNOCKBACK = 100.0
const POISE_HIT_ON_PARRY = 20.0
const RECOVER_TICKS = 30.0
const DEFAULT_PARRY_ATK = 10
const WIND_SPARK_PROBABILITY = 0.3
const TRAIL_PROBABILITY_GT = 0.5

var configuration_error = "not_configured"
var _configured = false
var _can_move: Callable
var _is_wall: Callable
var _element_multiplier: Callable
var _random: Callable
var _sink: Callable

## providers: required "can_move"(x,y,r)->bool (canMv), "is_wall"(x,y)->bool (isW),
## "element_multiplier"(attacker_el)->float (elMul(e.el, armor el)).
## optional "random"()->float [0,1) for cosmetic sparks, "sink"(event) per event.
func configure(providers: Dictionary) -> bool:
	for key in ["can_move", "is_wall", "element_multiplier"]:
		if not providers.has(key) or not providers[key] is Callable or not (providers[key] as Callable).is_valid():
			configuration_error = "missing_provider_" + key
			return false
	for key in ["random", "sink"]:
		if providers.has(key) and (not providers[key] is Callable or not (providers[key] as Callable).is_valid()):
			configuration_error = "invalid_provider_" + key
			return false
	_can_move = providers["can_move"]
	_is_wall = providers["is_wall"]
	_element_multiplier = providers["element_multiplier"]
	_random = providers.get("random", Callable())
	_sink = providers.get("sink", Callable())
	_configured = true
	configuration_error = ""
	return true

# --- shared elite attack lock (source L31700-31701); ONE owner for all of M29-M32 ---
static func tick_attack_lock(mod_t: Dictionary, ticks: float) -> bool:
	mod_t["eliteBusy"] = maxf(0.0, float(mod_t.get("eliteBusy", 0.0)) - ticks)
	return float(mod_t["eliteBusy"]) <= 0.0

static func claim_attack(mod_t: Dictionary, frames: float) -> bool:
	if float(mod_t.get("eliteBusy", 0.0)) > 0.0:
		return false
	mod_t["eliteBusy"] = frames
	return true

static func is_committed(actor: Variant) -> bool:
	var s = str(_g(actor, "s", ""))
	return s == "eChargeWind" or s == "eCharge"

static func _g(actor: Variant, key: String, fallback: Variant = null) -> Variant:
	if actor is Dictionary:
		return actor.get(key, fallback)
	if actor is Object:
		var v: Variant = actor.get(key)
		return fallback if v == null else v
	return fallback

static func _s(actor: Variant, key: String, value: Variant) -> void:
	if actor is Dictionary:
		actor[key] = value
	elif actor is Object:
		actor.set(key, value)

static func _num(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

# JS `a||b` for numbers: 0/null/NaN fall to b.
static func _or(value: Variant, fallback: float) -> float:
	if value == null or not _num(value) or float(value) == 0.0:
		return fallback
	return float(value)

func _emit(events: Array, event: Dictionary) -> void:
	events.append(event)
	if _sink.is_valid():
		_sink.call(event)

## Source L39404. Call after tick_attack_lock, only when the owner's mod block
## admits this enemy. distance = dst(player, enemy). Returns {started, events, error}.
func advance_mod(actor: Variant, ticks: float, distance: float) -> Dictionary:
	var out = {"started": false, "events": [], "error": ""}
	if not _configured:
		out["error"] = configuration_error
		return out
	var mods: Variant = _g(actor, "mods", [])
	if not mods is Array or not mods.has(SOURCE_ID):
		return out
	var mod_t: Variant = _g(actor, "modT")
	if not mod_t is Dictionary or not _num(mod_t.get("eliteBusy")) or not _num(mod_t.get("eliteCharge")):
		out["error"] = "missing_actual_modT_eliteBusy_eliteCharge"
		return out
	if not _num(ticks) or not _num(distance):
		out["error"] = "invalid_ticks_or_distance"
		return out
	if str(_g(actor, "s", "")) != "idle" or not (distance > ELIGIBLE_MIN_DISTANCE and distance < ELIGIBLE_MAX_DISTANCE):
		return out
	mod_t["eliteCharge"] = float(mod_t["eliteCharge"]) + ticks
	if float(mod_t["eliteCharge"]) >= ACCUMULATE_TICKS and claim_attack(mod_t, BUSY_TICKS):
		mod_t["eliteCharge"] = 0.0
		out["claimed"] = true
	return out

## Second half of the trigger: aim at the player and enter eChargeWind (L39404).
## Split from advance_mod only so the aim uses the player position the owner
## supplies; start_windup(...) is called by the owner immediately when
## advance_mod reports claimed (same tick). Use trigger() for the combined call.
func start_windup(actor: Variant, player: Dictionary) -> Dictionary:
	var events: Array = []
	var angle = atan2(float(player["y"]) - float(_g(actor, "y", 0.0)), float(player["x"]) - float(_g(actor, "x", 0.0)))
	var r = float(_g(actor, "r", 0.0))
	_s(actor, "facing", angle)
	_s(actor, "echDx", cos(angle))
	_s(actor, "echDy", sin(angle))
	_s(actor, "s", "eChargeWind")
	_s(actor, "st2", WINDUP_TICKS)
	_s(actor, "_chgAimMax", WINDUP_TICKS)
	_s(actor, "_chgDur", CHARGE_TICKS)
	_s(actor, "_chgSpd", CHARGE_SPEED)
	_s(actor, "_chgLen", CHARGE_LENGTH_BASE + r)
	_s(actor, "_chgVisLen", CHARGE_LENGTH_BASE + r)
	_emit(events, {"kind": "windup_started", "angle": angle, "length": CHARGE_LENGTH_BASE + r, "warning_color": "#ff3311"})
	return {"events": events}

## Combined accumulate + claim + windup for a caller that has the player context.
func trigger(actor: Variant, ticks: float, distance: float, player: Dictionary) -> Dictionary:
	var res = advance_mod(actor, ticks, distance)
	if bool(res.get("claimed", false)):
		var w = start_windup(actor, player)
		res["started"] = true
		res["events"].append_array(w["events"])
	return res

## Source eChargeWind/eCharge (L41121-41140). decrement_st2=true reproduces the
## owner's `e.st2-=sp` (L39486) for these two states; pass false if the owner
## already decremented this tick. No-op for any other state.
func step_charge(actor: Variant, ticks: float, player: Dictionary, decrement_st2: bool = true) -> Dictionary:
	var out = {"events": [], "state": str(_g(actor, "s", "")), "error": ""}
	if not _configured:
		out["error"] = configuration_error
		return out
	var s = str(_g(actor, "s", ""))
	if s != "eChargeWind" and s != "eCharge":
		return out
	if decrement_st2:
		_s(actor, "st2", float(_g(actor, "st2", 0.0)) - ticks)
	var events: Array = out["events"]
	if s == "eChargeWind":
		_step_wind(actor, ticks, player, events)
	else:
		_step_charge(actor, ticks, player, events)
	out["state"] = str(_g(actor, "s", ""))
	return out

func _rnd() -> float:
	return float(_random.call())

func _step_wind(actor: Variant, ticks: float, player: Dictionary, events: Array) -> void:
	var ex = float(_g(actor, "x", 0.0))
	var ey = float(_g(actor, "y", 0.0))
	var r = float(_g(actor, "r", 0.0))
	var aim_max = _or(_g(actor, "_chgAimMax"), WINDUP_TICKS)
	var st2 = float(_g(actor, "st2", 0.0))
	var lock = aim_max * AIM_LOCK_FRACTION
	if st2 > lock:
		var a = atan2(float(player["y"]) - ey, float(player["x"]) - ex)
		_s(actor, "echDx", cos(a))
		_s(actor, "echDy", sin(a))
		_s(actor, "facing", a)
		_s(actor, "_chgVisLen", null)
	var dx = float(_g(actor, "echDx", 0.0))
	var dy = float(_g(actor, "echDy", 0.0))
	if _g(actor, "_chgVisLen") == null:
		var vl = _or(_g(actor, "_chgLen"), 100.0)
		var ct = r
		while ct < vl:
			if bool(_is_wall.call(ex + dx * ct, ey + dy * ct)):
				vl = ct
				break
			ct += WALL_PROBE_STEP
		_s(actor, "_chgVisLen", vl)
	if _random.is_valid() and _rnd() < WIND_SPARK_PROBABILITY * ticks:
		_emit(events, {"kind": "vfx_spark", "x": ex + dx * r, "y": ey + dy * r, "vx": (_rnd() - 0.5) * 2.0, "vy": (_rnd() - 0.5) * 2.0, "color": "#ff3311", "size": 2.0, "life": 8.0})
	if float(_g(actor, "st2", 0.0)) <= 0.0:
		_s(actor, "s", "eCharge")
		_s(actor, "st2", _or(_g(actor, "_chgDur"), 20.0))
		_s(actor, "_chgVisLen", null)
		_emit(events, {"kind": "charge_started", "speed": _or(_g(actor, "_chgSpd"), 5.0), "ticks": float(_g(actor, "st2"))})

func _enter_recover(actor: Variant, events: Array, reason: String) -> void:
	_s(actor, "s", "recover")
	_s(actor, "st2", RECOVER_TICKS)
	_emit(events, {"kind": "recover_entered", "reason": reason, "ticks": RECOVER_TICKS})

func _step_charge(actor: Variant, ticks: float, player: Dictionary, events: Array) -> void:
	var spd = _or(_g(actor, "_chgSpd"), 5.0) * ticks
	var ox = float(_g(actor, "x", 0.0))
	var oy = float(_g(actor, "y", 0.0))
	var r = float(_g(actor, "r", 0.0))
	var dx = float(_g(actor, "echDx", 0.0))
	var dy = float(_g(actor, "echDy", 0.0))
	var nx = ox + dx * spd
	var ny = oy + dy * spd
	if bool(_can_move.call(nx, ny, r)):
		_s(actor, "x", nx)
		_s(actor, "y", ny)
	else:
		_enter_recover(actor, events, "blocked")
		return
	# Swept segment-vs-player test (anti-tunnelling), source L41133.
	var sgx = nx - ox
	var sgy = ny - oy
	var sl2 = sgx * sgx + sgy * sgy
	var px = float(player["x"])
	var py = float(player["y"])
	var st = ((px - ox) * sgx + (py - oy) * sgy) / sl2 if sl2 > 0.0 else 0.0
	st = 0.0 if st < 0.0 else (1.0 if st > 1.0 else st)
	var scx = ox + sgx * st
	var scy = oy + sgy * st
	if Vector2(px, py).distance_to(Vector2(scx, scy)) < float(player["r"]) + r + HIT_RADIUS_PAD and float(player["iframes"]) <= 0.0:
		var atk = float(_g(actor, "atk", 0.0))
		var el: Variant = _g(actor, "el", 0)
		if bool(player.get("parry_window", false)):
			_emit(events, {"kind": "player_parry", "parry_bank_add": int(_or(_g(actor, "atk"), float(DEFAULT_PARRY_ATK))), "do_parry": {"atk": atk, "x": nx, "y": ny, "projectile": false, "el": el}, "poise_hit": POISE_HIT_ON_PARRY})
		elif str(player.get("state", "")) != "charge":
			var mult = float(_element_multiplier.call(el))
			var ang = atan2(py - ny, px - nx)
			_emit(events, {"kind": "player_damage", "amount": int(atk * DAMAGE_ATK_MULT * mult), "element": el, "element_multiplier": mult, "apply_elite_mod_hit": true, "angle": ang, "knockback": Vector2(cos(ang) * KNOCKBACK, sin(ang) * KNOCKBACK), "impact": {"boom": {"x": px, "y": py, "r": 80, "frames": 48, "kind": "fire_medium"}, "big_impact_element": "fire", "shake": 10, "sfx": "detonate"}})
		else:
			_emit(events, {"kind": "player_charge_state_immune"})
		_enter_recover(actor, events, "hit")
		return
	if _random.is_valid() and _rnd() > TRAIL_PROBABILITY_GT:
		_emit(events, {"kind": "vfx_trail", "x": nx + (_rnd() - 0.5) * 6.0, "y": ny + (_rnd() - 0.5) * 6.0, "vx": -dx * 2.0, "vy": -dy * 2.0, "color": str(_g(actor, "col", "")), "size": 3.0, "life": 8.0})
	if float(_g(actor, "st2", 0.0)) <= 0.0:
		_enter_recover(actor, events, "expired")
