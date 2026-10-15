class_name ExoduserType3SummonedActor
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

## Actual type3 actor boundary. The native recipe, including its random skin,
## HP-half / original-poise distinction, is consumed without rerolling it.
## The caller supplies the real shared projectile and modifier consumers.
## This script never admits a type7 record or replaces a missing element/mod.
const RECIPE_SCHEMA = "exoduser.godot.type3-spawn-recipe.v1"
const ELEMENTS = ["physical", "fire", "ice", "dark", "lightning", "holy"]
const COLORS = ["#bbbbbb", "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc"]
const DIRECTIONS = ["east", "south_east", "south", "south_west", "west", "north_west", "north", "north_east"]
const PROJECTILE_RANGE = 200.0
const CHARGE_TICKS = 60.0

var _native: Dictionary = {}
var _interfaces: Dictionary = {}
var _configured = false
var _configuration_error = "not_configured"
var _automatic = false
var _render_body = true
var _native_frame = 0.0
var _pending_poise = 0.0
var _base: Sprite2D
var _walk: Sprite2D
var _textures: Dictionary = {}

var hp: int:
	get: return int(_native.get("hp", 0))
var max_hp: int:
	get: return int(_native.get("mhp", 0))
var attack: int:
	get: return int(_native.get("atk", 0))
var radius: float:
	get: return float(_native.get("r", 0.0))
var alive: bool:
	get: return bool(_native.get("alive", false))
var state: String:
	get: return str(_native.get("s", "unconfigured"))
var mods: Array:
	get: return _native.get("mods", [])
var elite: int:
	get: return int(_native.get("elite", 0))
var etype: int:
	get: return 3
var element: String:
	get: return str(_native.get("element", ""))

func configure(recipe: Dictionary, target: Node2D, world: Node2D, interfaces: Dictionary) -> bool:
	if _configured:
		return false
	var error = _preflight(recipe, target, world, interfaces)
	if not error.is_empty():
		_configuration_error = error
		return false
	# Nothing above mutates an owner, RNG, registry, resource or shared recipe.
	_native = recipe.duplicate(true)
	_interfaces = interfaces.duplicate()
	_interfaces["target"] = target
	_interfaces["world"] = world
	_native["col"] = "#66ee66" # Native ETYPE_COL[3]; charged shots use ELC.
	_native_frame = 0.0
	_automatic = bool(interfaces.get("automatic_physics", false))
	_render_body = bool(interfaces.get("render_body", true))
	_configured = true
	_configuration_error = ""
	_sync_position()
	if is_node_ready():
		_prepare_body()
		set_physics_process(_automatic)
	return true

static func _preflight(recipe: Dictionary, target: Node2D, world: Node2D, interfaces: Dictionary) -> String:
	if str(recipe.get("schema", "")) != RECIPE_SCHEMA or int(recipe.get("etype", -1)) != 3 or bool(recipe.get("ib", true)):
		return "requires_native_nonboss_type3_recipe"
	for key in ["x", "y", "r", "hp", "mhp", "factory_hp", "atk", "speed", "el", "elite", "poise", "maxPoise", "eShield", "eShieldMax", "projCd", "projT", "st2", "facing", "stunned", "poiseR"]:
		if not _number(recipe.get(key)):
			return "missing_native_recipe_" + key
	var el = int(recipe["el"])
	if el < 0 or el >= ELEMENTS.size() or str(recipe.get("element", "")) != ELEMENTS[el]:
		return "noncanonical_six_element_recipe"
	if int(recipe["elite"]) not in [0, 1] or not recipe.get("mods") is Array:
		return "unsupported_native_elite_recipe"
	var expected_mods = recipe["mods"]
	if (int(recipe["elite"]) == 0 and not expected_mods.is_empty()) or (int(recipe["elite"]) == 1 and (expected_mods.size() != 1 or expected_mods[0] not in ["M29", "M30"])):
		return "unsupported_native_modifier_recipe"
	if int(recipe["hp"]) != _js_int32(float(recipe["factory_hp"]) * 0.5) or int(recipe["mhp"]) != int(recipe["hp"]) or float(recipe["poise"]) != float(recipe["factory_hp"]) or float(recipe["maxPoise"]) != float(recipe["factory_hp"]) or float(recipe["eShield"]) != 0.0 or float(recipe["eShieldMax"]) != 0.0:
		return "lost_summoned_hp_shield_or_prehalf_poise"
	if not recipe.get("kb") is Dictionary or not recipe.get("modT") is Dictionary or not recipe.get("eRes") is Array or recipe["eRes"].size() != 7:
		return "missing_actual_native_damage_state"
	var animation: Variant = recipe.get("animation")
	if not animation is Dictionary or int(animation.get("cell", -1)) != 256 or int(animation.get("chapter", -1)) != 1 or int(animation.get("col", -1)) < 0 or int(animation.get("col", -1)) > 7 or int(animation.get("row", -1)) < 0 or int(animation.get("row", -1)) > 4:
		return "missing_original_dynamic_skin_cell"
	if not is_instance_valid(target) or not is_instance_valid(world):
		return "missing_player_or_world"
	for method in ["can_move", "has_line_of_sight", "get_path_direction", "get_enemies"]:
		if not world.has_method(method):
			return "missing_world_" + method
	if not target.has_method("receive_damage"):
		return "missing_player_damage_API"
	if not interfaces.get("emit_charged_projectile", Callable()) is Callable or not interfaces.get("emit_charged_projectile", Callable()).is_valid():
		return "missing_actual_element_projectile_consumer"
	if not interfaces.get("native_random", Callable()) is Callable or not interfaces.get("native_random", Callable()).is_valid():
		return "missing_shared_native_rng_for_recovery"
	if expected_mods.size() > 0:
		if not interfaces.get("modifier_pre_ai", Callable()) is Callable or not interfaces.get("modifier_pre_ai", Callable()).is_valid():
			return "missing_actual_" + expected_mods[0] + "_consumer"
		if expected_mods[0] == "M29":
			for key in ["modifier_state_step", "player_context"]:
				if not interfaces.get(key, Callable()) is Callable or not interfaces.get(key, Callable()).is_valid():
					return "missing_actual_M29_" + key
	return ""

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _js_int32(value: float) -> int:
	var low = int(value) & 0xffffffff
	return low - 0x100000000 if low >= 0x80000000 else low

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	# Native canMv owns movement; enemy bodies do not physically shove Player.
	collision_layer = 4
	collision_mask = 0
	z_as_relative = false
	set_physics_process(_configured and _automatic)
	if _configured:
		add_to_group("enemies")
		_prepare_body()

func _prepare_body() -> void:
	if not _configured or is_instance_valid(_base):
		return
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = radius
	shape.shape = circle
	add_child(shape)
	if not _render_body:
		return
	for direction in DIRECTIONS:
		for suffix in ["", "walk_"]:
			var path = "res://assets/enemy/atlas_ch1_8dir_" + suffix + direction + ".png"
			if not ResourceLoader.exists(path, "Texture2D"):
				_configuration_error = "missing_original_body_resource:" + path
				return
			_textures[suffix + direction] = ResourceLoader.load(path, "Texture2D")
	_base = Sprite2D.new()
	_base.name = "OriginalType3Body"
	_walk = Sprite2D.new()
	_walk.name = "OriginalType3WalkOverlay"
	for sprite in [_base, _walk]:
		sprite.region_enabled = true
		sprite.centered = true
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		add_child(sprite)
	_update_body()

func _physics_process(delta: float) -> void:
	advance_native(delta * 60.0)

func advance_native(ticks: float) -> void:
	if not _configured or not alive or not is_finite(ticks) or ticks <= 0.0 or (is_inside_tree() and get_tree().paused):
		return
	_native_frame += ticks
	var before = _point()
	# These source main-loop timers precede updateE's guards.
	for key in ["_spawnT", "_hitFlash", "_hitStun", "stunned"]:
		if float(_native.get(key, 0.0)) > 0.0:
			_native[key] = maxf(0.0, float(_native[key]) - ticks)
	_advance_knockback(ticks)
	if float(_native.get("_hitStun", 0.0)) > 0.0:
		_finish_motion(before, ticks)
		return
	if float(_native["stunned"]) > 0.0:
		_native["stunned"] = minf(180.0, float(_native["stunned"]))
		_cancel_charge()
		_finish_motion(before, ticks)
		return
	if float(_native.get("_frozen", 0.0)) > 0.0:
		_cancel_charge()
		_native["_frozen"] = maxf(0.0, float(_native["_frozen"]) - ticks)
		if float(_native["_frozen"]) <= 0.0:
			_native["_freezeGauge"] = 0.0
			_native["_frozenImmune"] = 120.0
		_finish_motion(before, ticks)
		return
	if float(_native["poise"]) < float(_native["maxPoise"]):
		_native["poiseR"] = float(_native["poiseR"]) + ticks
		if float(_native["poiseR"]) >= 200.0:
			_native["poise"] = minf(float(_native["maxPoise"]), float(_native["poise"]) + int(float(_native["maxPoise"]) * 0.15))
			_native["poiseR"] = 0.0
	var target = _target()
	if not is_instance_valid(target):
		_finish_motion(before, ticks)
		return
	var context = get_native_player_context()
	var distance = _point().distance_to(Vector2(float(context["x"]), float(context["y"])))
	if not bool(_native.get("_alerted", false)) and state in ["idle", "recover"] and distance < 800.0 and _world().has_line_of_sight(_point(), target.global_position):
		_native["_alerted"] = true
	if distance < 800.0 and bool(_native.get("_alerted", false)):
		_native["facing"] = (target.global_position - _point()).angle()
	if bool(_native.get("_alerted", false)) and state in ["idle", "recover"] and distance > 30.0:
		_flow_move(ticks)
		distance = _point().distance_to(target.global_position)
	# Source elite timers/trigger run after hit/frozen guards and before charge.
	if mods.size() > 0:
		_interfaces["modifier_pre_ai"].call(self, ticks, distance, context)
		_sync_position()
	if float(_native.get("_projChargeT", 0.0)) > 0.0:
		_native["_projChargeT"] = float(_native["_projChargeT"]) - ticks
		if float(_native["_projChargeT"]) <= 0.0:
			_fire_charged()
	var committed = state in ["eChargeWind", "eCharge"]
	if not committed and not bool(_native.get("_alerted", false)) and distance > 400.0:
		_finish_motion(before, ticks)
		return
	_native["st2"] = float(_native["st2"]) - ticks
	if state in ["eChargeWind", "eCharge"]:
		_interfaces["modifier_state_step"].call(self, ticks, context)
		_sync_position()
	elif state == "idle":
		# No attack ticket, eCircle gate or natural contact damage is added.
		_try_move(Vector2.from_angle(float(_native["facing"])) * float(_native["speed"]) * 1.6 * ticks)
		_separate(ticks)
		if float(_native.get("_projChargeT", 0.0)) <= 0.0:
			_native["projT"] = float(_native["projT"]) - ticks
			if float(_native["projT"]) <= 0.0 and distance < PROJECTILE_RANGE:
				_native["projT"] = float(_native["projCd"])
				_native["_projChargeT"] = CHARGE_TICKS
				_native["_projChargeBean"] = ["normal", "fire", "water", "dark", "normal", "normal"][int(_native["el"])]
				_native["_projChargeParryClass"] = "physical" if int(_native["el"]) == 0 else "magic"
				_native["_projChargeCol"] = "#a44cff" if int(_native["el"]) == 3 else "#317cec" if int(_native["el"]) == 2 else "#ff2e22" if int(_native["el"]) == 1 else COLORS[int(_native["el"])]
				telemetry_event.emit("type3_charge_started", {"element": element, "ticks": CHARGE_TICKS})
	elif state == "recover" and float(_native["st2"]) <= 0.0:
		# Native shared RNG belongs to the caller, not a per-child seed.
		var random: Callable = _interfaces.get("native_random", Callable())
		if random.is_valid():
			_native["s"] = "idle"
			_native["st2"] = 15.0 + float(random.call()) * 15.0
		else:
			_configuration_error = "missing_shared_native_rng_for_recovery"
	_finish_motion(before, ticks)

func _flow_move(ticks: float) -> void:
	var direction: Vector2 = _world().get_path_direction(_point())
	if direction.is_zero_approx():
		direction = Vector2(float(_native.get("_lastFdx", cos(float(_native["facing"])))), float(_native.get("_lastFdy", sin(float(_native["facing"])))))
	else:
		_native["_lastFdx"] = direction.x
		_native["_lastFdy"] = direction.y
	var displacement = direction * float(_native["speed"]) * ticks
	if _try_move(displacement):
		_native["_stuckT"] = 0.0
	elif _try_move(Vector2(displacement.x, 0.0)):
		_native["_lastFdx"] = direction.x
		_native["_lastFdy"] = 0.0
		_native["_stuckT"] = 0.0
	elif _try_move(Vector2(0.0, displacement.y)):
		_native["_lastFdx"] = 0.0
		_native["_lastFdy"] = direction.y
		_native["_stuckT"] = 0.0
	else:
		_native["_stuckT"] = float(_native.get("_stuckT", 0.0)) + ticks
		var escaped = false
		var angle = direction.angle()
		var escape_distance = float(_native["speed"]) * ticks * 0.8
		for index in range(1, 5):
			for sign_value in [1.0, -1.0]:
				var candidate = angle + index * PI / 4.0 * sign_value
				if _try_move(Vector2.from_angle(candidate) * escape_distance):
					_native["_lastFdx"] = cos(candidate)
					_native["_lastFdy"] = sin(candidate)
					escaped = true
					break
			if escaped: break
		if not escaped and float(_native["_stuckT"]) > 30.0:
			for index in range(1, 9):
				for sign_value in [1.0, -1.0]:
					var candidate = angle + index * PI / 8.0 * sign_value
					if _try_move(Vector2.from_angle(candidate) * escape_distance, maxf(2.0, radius - 2.0)):
						_native["_lastFdx"] = cos(candidate)
						_native["_lastFdy"] = sin(candidate)
						escaped = true
						break
				if escaped: break
		if escaped:
			_native["_stuckT"] = 0.0
		elif float(_native["_stuckT"]) > 90.0:
			var target_direction = (_target().global_position - _point()).normalized()
			for multiple in range(2, 7):
				if _try_move(target_direction * float(_native["speed"]) * ticks * multiple):
					_native["_stuckT"] = 0.0
					break

func _try_move(displacement: Vector2, movement_radius: float = -1.0) -> bool:
	var next = _point() + displacement
	if not _world().can_move(next, radius if movement_radius < 0.0 else movement_radius):
		return false
	_native["x"] = float(_native["x"]) + float(displacement.x)
	_native["y"] = float(_native["y"]) + float(displacement.y)
	_sync_position()
	return true

func _separate(ticks: float) -> void:
	if float(_native.get("_sepCd", 0.0)) > 0.0:
		_native["_sepCd"] = float(_native["_sepCd"]) - ticks
		return
	var push = Vector2.ZERO
	for other in _world().get_enemies():
		if other == self or not is_instance_valid(other) or not bool(other.get("alive")):
			continue
		var difference = _point() - other.global_position
		var squared = difference.length_squared()
		if squared > pow(radius * 4.4, 2.0): continue
		var minimum = radius + float(other.get("radius")) + 4.0
		if squared < minimum * minimum and squared > 0.01:
			var distance = sqrt(squared)
			push += difference / distance * (minimum - distance) / minimum * 1.5
	if not push.is_zero_approx(): _try_move(push * ticks)
	_native["_sepCd"] = 3.0

func _advance_knockback(ticks: float) -> void:
	var kb: Dictionary = _native["kb"]
	var impulse = Vector2(float(kb["x"]), float(kb["y"]))
	if absf(impulse.x) <= 0.1 and absf(impulse.y) <= 0.1: return
	if not _try_move(impulse * ticks):
		# Tile/rift damage is a separate source caller; never confuse props with
		# tile walls. The integrating owner supplies the original collision API.
		var callback: Callable = _interfaces.get("knockback_collision", Callable())
		if callback.is_valid(): callback.call(self, impulse, _point() + impulse * ticks)
		kb["x"] = 0.0
		kb["y"] = 0.0
	else:
		kb["x"] = float(kb["x"]) * pow(0.85, ticks)
		kb["y"] = float(kb["y"]) * pow(0.85, ticks)

func _fire_charged() -> void:
	var packet = get_charged_packet(_target().global_position)
	_native["facing"] = (Vector2(float(packet["vx"]), float(packet["vy"]))).angle()
	_interfaces["emit_charged_projectile"].call(self, packet)
	telemetry_event.emit("type3_charged_packet", packet.duplicate(true))
	_cancel_charge()

func get_charged_packet(target_position: Vector2) -> Dictionary:
	# Exact _fireChargedProj spawnProj inputs, BEFORE spawnProj's size/damage/
	# speed/parry normalization. Do not pass this as an already-normalized shot.
	var el = int(_native["el"])
	var direction = (target_position - _point()).normalized()
	var speed_value = 3.3 if el == 3 else 3.2 if el in [1, 2] else 3.0
	var multiplier = 1.0 if el == 3 else 1.2 if el in [1, 2] else 0.8
	var packet = {"x": _native["x"], "y": _native["y"], "vx": direction.x * speed_value, "vy": direction.y * speed_value, "dmg": int(attack * multiplier), "el": el, "friendly": false, "life": 60, "ml": 60, "sz": 1.6 if el in [1, 2, 3] else 1.5, "col": "#a44cff" if el == 3 else "#317cec" if el == 2 else "#ff2e22" if el == 1 else COLORS[el], "_commit": true}
	if el == 1: packet["fireMagic"] = true
	elif el == 2: packet["waterBean"] = true
	elif el == 3: packet["gbBean"] = true
	return packet

func _cancel_charge() -> void:
	_native["_projChargeT"] = 0.0
	_native["_projChargeBean"] = null
	_native["_projChargeParryClass"] = null
	_native["_projChargeCol"] = null

func receive_poise_damage(amount: float) -> void:
	if alive and amount > 0.0: _pending_poise += amount

func receive_damage(amount: int, direction: Vector2, source: String, opts: Dictionary = {}) -> void:
	var pending = _pending_poise
	_pending_poise = 0.0
	if not alive or hp <= 0 or amount <= 0: return
	var dot = bool(opts.get("dot", false))
	var attack_element = int(opts.get("attack_element", 0))
	var damage = amount
	var resistances: Array = _native["eRes"]
	if attack_element >= 0 and attack_element < resistances.size() and float(resistances[attack_element]) > 0.0:
		damage = int(damage * (1.0 - float(resistances[attack_element])))
	if float(_native["stunned"]) > 0.0 and not dot: damage = int(damage * 1.5)
	if float(_native.get("_frozen", 0.0)) > 0.0 and not dot: damage = int(damage * 1.5)
	var absorbed = 0.0
	if (not dot or bool(opts.get("shieldHit", false))) and float(_native["eShieldMax"]) > 0.0 and float(_native["eShield"]) > 0.0:
		absorbed = minf(float(_native["eShield"]), damage)
		_native["eShield"] = maxf(0.0, float(_native["eShield"]) - damage)
		damage = maxi(0, int(damage - absorbed))
	if damage > 0:
		_native["_alerted"] = true
		if not dot:
			if state == "recover": _native["s"] = "idle"; _native["st2"] = 0.0
			elif state == "idle" and float(_native["st2"]) > 5.0: _native["st2"] = 5.0
		_native["hp"] = hp - damage
		_native["_hitFlash"] = 6.0
		if state == "idle": _native["_hitStun"] = 4.0 if elite > 0 else 8.0
		var ranged = bool(opts.get("beam", false)) or opts.has("maxDist") and not bool(opts.get("magic", false)) or bool(opts.get("bladeShard", false)) or bool(opts.get("bladeOrb", false)) or bool(opts.get("normalBow", false)) or attack_element == 4
		if not dot and not ranged and not bool(opts.get("noKB", false)) and not bool(opts.get("blueBean", false)) and not bool(opts.get("maliceHunt", false)) and not bool(opts.get("mhBlade", false)) and not direction.is_zero_approx():
			var multiplier = float(opts.get("kbMult", 0.5 if source == "kiSlash" else 1.0)) * (0.2 if bool(opts.get("magic", false)) else 1.0)
			var kb_amount = minf(damage * 0.25 * multiplier, 15.0 * multiplier)
			_native["kb"]["x"] = float(_native["kb"]["x"]) + direction.normalized().x * kb_amount
			_native["kb"]["y"] = float(_native["kb"]["y"]) + direction.normalized().y * kb_amount
	if not dot and (pending > 0.0 or bool(opts.get("poiseHit", false))):
		var multiplier = float(opts.get("poiseMult", pending / amount if pending > 0.0 else 1.0))
		_native["poise"] = maxf(0.0, float(_native["poise"]) - int(damage * multiplier))
		_native["poiseR"] = 0.0
		if float(_native["poise"]) <= 0.0: _native["stunned"] = maxf(float(_native["stunned"]), 180.0)
	telemetry_event.emit("type3_damage", {"raw_amount": amount, "amount": damage, "absorbed": absorbed, "hp": hp, "poise": _native["poise"], "dot": dot})
	if hp <= 0:
		_native["alive"] = false
		_native["s"] = "dead"
		_cancel_charge()
		collision_layer = 0
		# Existing world-owned projectiles and modifier FX are never removed.
		telemetry_event.emit("type3_death", {"existing_projectiles_preserved": true})
	_update_body()

func get_native_modifier_state() -> Dictionary:
	# Production modifier adapter owns its native source fields. Not a QA setter.
	return _native

func get_native_player_context() -> Dictionary:
	var target = _target()
	var provider: Callable = _interfaces.get("player_context", Callable())
	if provider.is_valid(): return provider.call(target)
	return {"x": target.global_position.x, "y": target.global_position.y, "r": target.get("radius"), "hp": target.get("hp"), "iframes": target.get("iframes"), "state": target.get("state")}

func get_snapshot() -> Dictionary:
	return {"configured": _configured, "configuration_error": _configuration_error, "automatic_physics": _automatic, "native_frame": _native_frame, "native": _native.duplicate(true), "natural_contact_damage": null, "full_type7_actor_registered": false, "full_element_projectile_consumption_verified": false}

func get_animation_recipe() -> Dictionary:
	var animation: Dictionary = _native["animation"]
	var angle = float(_native.get("_moveAng", _native["facing"])) if bool(_native.get("_isMoving", false)) else float(_native["facing"])
	var direction = DIRECTIONS[posmod(roundi(fposmod(angle, TAU) / (PI / 4.0)), 8)]
	var frame = posmod(int(float(_native.get("_walkDist", 0.0)) / 128.0), 4)
	var col = int(animation["col"])
	var row = int(animation["row"])
	# Original CH1 walk metadata includes 39 indices: skinless_hound (25)
	# has no authored walk overlay. Do not borrow another skin's frames.
	return {"skin": animation["skin"], "direction": direction, "base_rect": [col * 256, row * 256, 256, 256], "walk_rect": [(col * 4 + frame) * 256, row * 256, 256, 256], "walk_frame": frame, "walk_available": row * 8 + col != 25, "walk_visible": bool(_native.get("_isMoving", false)) and row * 8 + col != 25, "draw_height": maxf(radius * 3.5, 30.0), "spawn_alpha": maxf(0.0, 1.0 - float(_native.get("_spawnT", 0.0)) / 20.0)}

func _finish_motion(before: Vector2, ticks: float) -> void:
	var displacement = _point() - before
	_native["_walkDist"] = float(_native.get("_walkDist", 0.0)) + displacement.length()
	if displacement.length_squared() > 0.25:
		_native["_isMoving"] = true
		_native["_moveHold"] = 3.0
		_native["_moveAng"] = displacement.angle()
	elif float(_native.get("_moveHold", 0.0)) > 0.0:
		_native["_moveHold"] = float(_native["_moveHold"]) - ticks
	else: _native["_isMoving"] = false
	_sync_position()
	z_index = clampi(int(global_position.y / 4.0), -2000, 4000)
	_update_body()

func _update_body() -> void:
	if not is_instance_valid(_base): return
	var recipe = get_animation_recipe()
	_base.texture = _textures[recipe["direction"]]
	_walk.texture = _textures["walk_" + recipe["direction"]]
	var base_rect: Array = recipe["base_rect"]
	var walk_rect: Array = recipe["walk_rect"]
	_base.region_rect = Rect2(base_rect[0], base_rect[1], base_rect[2], base_rect[3])
	_walk.region_rect = Rect2(walk_rect[0], walk_rect[1], walk_rect[2], walk_rect[3])
	_base.scale = Vector2.ONE * float(recipe["draw_height"]) / 256.0
	_walk.scale = _base.scale
	_base.modulate = Color(1.0 + float(_native.get("_hitFlash", 0.0)) / 6.0, 1.0, 1.0, float(recipe["spawn_alpha"]))
	_walk.modulate = _base.modulate
	_walk.visible = alive and bool(recipe["walk_visible"])
	if not alive: _base.modulate.a = 0.5

func _point() -> Vector2:
	return Vector2(float(_native["x"]), float(_native["y"]))

func _sync_position() -> void:
	global_position = _point()

func _target() -> Node2D:
	return _interfaces.get("target")

func _world() -> Node2D:
	return _interfaces.get("world")
