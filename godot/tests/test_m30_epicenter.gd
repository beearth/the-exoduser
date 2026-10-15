extends SceneTree
## Standalone M30 fixtures only: no Main/factory, public app, save or GUI.
## Source authority: native M30 supplement; never repeat a frozen combat suite.
## Mutable live actor fields are never set by this test. Initial contexts and
## actual public requests are identified separately from automatic dispatch.

const KernelScript = preload("res://scripts/native_m30_modifier.gd")
const PlayerScript = preload("res://scripts/player.gd")
const PROFILE_FILE = "res://data/m30_burst.json"
const STEP = 1.0 / 60.0

class OwnerContext extends Node2D:
	var attack = 40
	var alive: bool
	var mods: Array
	var modT = {"eliteBusy": 0.0, "eliteRing": 0.0}

	func _init(initial_mods: Array = ["M30"], initial_alive: bool = true) -> void:
		# Constructor context for this unconnected kernel, not a ported enemy.
		mods = initial_mods.duplicate(true)
		alive = initial_alive

class ReadonlyTargetContext extends Node2D:
	var hp: int
	var radius = 15.0
	var iframes: float
	var state: String
	var packets: Array = []

	func _init(initial_state: String = "idle", initial_iframes: float = 0.0, initial_hp: int = 350) -> void:
		state = initial_state
		iframes = initial_iframes
		hp = initial_hp

	func receive_damage(amount: int, kind: String = "phys", direction: Vector2 = Vector2.ZERO, impulse: float = -1.0) -> void:
		# Request oracle only. This does not stand in for actual Player damage.
		packets.append({"amount": amount, "kind": kind, "direction": direction, "impulse": impulse})

class FixtureWorld extends Node2D:
	func get_enemies() -> Array:
		return []

var _profile: Dictionary
var _only: Array = []
var _failed_assertions = 0
var _passed = 0
var _completed_groups: Array = []
var _incomplete_groups: Array = []
var _events: Array = []
var _native_method_calls = 0
var _player_physics_method_calls = 0
var _warning_render_method_calls = 0
var _lava_render_method_calls = 0
var _fixture_input_edges = 0
var _automatic_process_frame_observations = 0
var _automatic_physics_frame_signals = 0
var _automatic_fx_render_advancement = false
var _expected_resource_rejections = 0
var _movement_input_deadzone = 0.0
var _movement_deadzone_by_action: Dictionary = {}
var _movement_requested_strength = 0.0
var _movement_actual_vector: Array = []
var _radius_observations: Array = []

func _initialize() -> void:
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon", "cancel_charge", "pause"]:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="):
			_only = Array(arg.trim_prefix("--only=").split(","))
	paused = true
	physics_frame.connect(func(): _automatic_physics_frame_signals += 1)
	call_deferred("_run")

func _check(value: bool, label: String) -> void:
	if not value:
		_failed_assertions += 1
		print("ASSERT_FAIL " + label)

func _near(actual: float, expected: float, label: String, epsilon: float = 0.0001) -> void:
	_check(absf(actual - expected) <= epsilon, "%s actual=%s expected=%s" % [label, actual, expected])

func _record_event(kind: String, data: Dictionary) -> void:
	_events.append({"kind": kind, "data": data.duplicate(true)})

func _event_count(kind: String) -> int:
	return _events.filter(func(event): return event["kind"] == kind).size()

func _add_owner(world: Node2D, target: Node2D, initial_mods: Array = ["M30"], initial_alive: bool = true) -> Dictionary:
	var owner = OwnerContext.new(initial_mods, initial_alive)
	world.add_child(owner)
	var kernel = KernelScript.new()
	owner.add_child(kernel)
	kernel.telemetry_event.connect(_record_event)
	var accepted = kernel.configure(owner, target, world, owner.modT, _profile)
	return {"world": world, "owner": owner, "target": target, "kernel": kernel, "accepted": accepted}

func _fixture(target: Node2D = null, origin: Vector2 = Vector2.ZERO) -> Dictionary:
	var world = FixtureWorld.new()
	# Position is constructor context BEFORE entering the tree; no active write.
	world.position = origin
	world.process_mode = Node.PROCESS_MODE_PAUSABLE
	root.add_child(world)
	if target == null:
		target = ReadonlyTargetContext.new()
	world.add_child(target)
	return _add_owner(world, target)

func _real_player_fixture(origin: Vector2 = Vector2.ZERO) -> Dictionary:
	var player = PlayerScript.new()
	var fixture = _fixture(player, origin)
	player.set_world(fixture["world"])
	player.telemetry_event.connect(_record_event)
	return fixture

func _native(fixture: Dictionary, count: int = 1, supplied_distance: float = -1.0) -> void:
	for _tick in range(count):
		_native_method_calls += 1
		var distance = supplied_distance
		if distance < 0.0:
			distance = fixture["owner"].global_position.distance_to(fixture["target"].global_position)
		fixture["kernel"].advance_native(1.0, distance)

func _player_ticks(player: Node, count: int = 1) -> void:
	for _tick in range(count):
		_player_physics_method_calls += 1
		player._physics_process(STEP)

func _pair_ticks(fixture: Dictionary, count: int = 1) -> void:
	for _tick in range(count):
		_player_ticks(fixture["target"])
		_native(fixture)

func _input_press(action: String, strength: float = 1.0) -> void:
	_fixture_input_edges += 1
	Input.action_press(action, strength)

func _input_release(action: String) -> void:
	_fixture_input_edges += 1
	Input.action_release(action)

func _lava_effects(world: Node) -> Array:
	return world.get_children().filter(func(child): return child.is_in_group("M30_lava_effects"))

func _lava_render(effect: Node, ticks: float, draw_allowed: bool = true) -> void:
	_lava_render_method_calls += 1
	effect.advance_render(ticks, draw_allowed)

func _dispose(fixture: Dictionary) -> void:
	if is_instance_valid(fixture["world"]):
		fixture["world"].free()

func _run_group(name: String, test: Callable) -> void:
	if not _only.is_empty() and name not in _only:
		return
	var before = _failed_assertions
	var completed: Variant = await test.call()
	if completed != true:
		_incomplete_groups.append(name)
		print("INCOMPLETE " + name)
		return
	_completed_groups.append(name)
	if _failed_assertions == before:
		_passed += 1
		print("PASS " + name)
	else:
		print("FAIL " + name)

func _test_owner_clock_isolation() -> bool:
	var a = _fixture()
	_check(a["accepted"], "first exact M30 owner preflight")
	var b = _add_owner(a["world"], a["target"])
	_check(b["accepted"], "second sibling owner preflight")
	_native(a, 479)
	_check(a["kernel"].get_snapshot()["zones"].is_empty(), "no birth before 480 qualified owner updates")
	_near(a["owner"].modT["eliteRing"], 479.0, "actual caller modT reference consumed")
	_native(b, 480)
	_check(b["kernel"].get_snapshot()["zones"].size() == 1, "second owner can birth while first is preparing")
	_near(a["owner"].modT["eliteRing"], 479.0, "second owner never touches first modT")
	_native(a)
	var born = a["kernel"].get_snapshot()
	_near(born["zones"][0]["t"], 53.0, "same-update birth already consumes warning tick")
	_near(born["modT"]["eliteBusy"], 54.0, "busy decremented before claim rather than after claim")
	_near(born["modT"]["eliteRing"], 0.0, "claim clears this owner's accumulator")
	_check(not born["global_attack_ticket"], "no shared attack-ticket authority")
	_check(not a["kernel"].is_physics_processing() and not a["kernel"].is_processing(), "owner-driven module has no autonomous clocks")
	_native(a)
	_near(a["owner"].modT["eliteBusy"], 53.0, "following update consumes existing busy")
	_near(a["kernel"].get_snapshot()["zones"][0]["t"], 52.0, "following update consumes existing zone")
	_near(b["kernel"].get_snapshot()["zones"][0]["t"], 53.0, "sibling zone does not share clock")
	var clone = a["kernel"].get_snapshot()
	clone["zones"][0]["t"] = -100.0
	clone["modT"]["eliteBusy"] = -100.0
	_near(a["kernel"].get_snapshot()["zones"][0]["t"], 52.0, "readonly snapshot zone is detached")
	_near(a["owner"].modT["eliteBusy"], 53.0, "readonly snapshot modT is detached")
	var far = _add_owner(a["world"], a["target"])
	_native(far, 17, 800.0)
	_near(far["owner"].modT["eliteRing"], 0.0, "distance exactly800 excludes M30 accumulation")
	_native(far, 1, 799.0)
	_near(far["owner"].modT["eliteRing"], 1.0, "distance inside800 allows accumulation")
	var dead = _add_owner(a["world"], a["target"], ["M30"], false)
	_native(dead, 480)
	_check(dead["kernel"].get_snapshot()["zones"].is_empty(), "constructor inactive owner contributes no warning")
	_near(dead["owner"].modT["eliteRing"], 0.0, "inactive owner clocks do not advance")
	var no_mod = _add_owner(a["world"], a["target"], [])
	_check(not no_mod["accepted"], "missing M30 refuses atomic preflight")
	_check(no_mod["kernel"].get_snapshot()["configuration_error"] == "owner_missing_M30", "missing M30 reason is explicit")
	_check(no_mod["kernel"].get_child_count() == 0, "failed preflight allocates no additive child")
	_dispose(a)
	return true

func _real_radius_case(strength: float, movement_ticks: int, should_hit: bool, label: String) -> void:
	# Constructor world coordinates, before player is in the tree. This avoids
	# zero-origin accumulation precision; never reposition an active player.
	var fixture = _real_player_fixture(Vector2(1024.0, 2048.0))
	var player = fixture["target"]
	_check(fixture["accepted"], label + " actual Player binding")
	_native(fixture, 480)
	var born_zone = fixture["kernel"].get_snapshot()["zones"][0]
	var born_origin = Vector2(born_zone["x"], born_zone["y"])
	_input_press("move_right", strength)
	if label == "inclusive125":
		var actual_input = Input.get_vector("move_left", "move_right", "move_up", "move_down")
		_movement_actual_vector = [actual_input.x, actual_input.y]
	_pair_ticks(fixture, movement_ticks)
	_input_release("move_right")
	_pair_ticks(fixture, 53 - movement_ticks)
	var after = player.get_snapshot()
	var actual_distance = player.global_position.distance_to(born_origin)
	_radius_observations.append({"label": label, "world_constructor_origin": [1024.0, 2048.0], "fixed_zone_origin": [born_origin.x, born_origin.y], "actual_player_endpoint": [player.global_position.x, player.global_position.y], "actual_distance": actual_distance, "requested_input_strength": strength, "movement_ticks": movement_ticks, "actual_hp": after["hp"]})
	if label == "inclusive125":
		_check(actual_distance == 125.0, "actual public analog fixture reaches strict inclusive radius125")
	elif not should_hit:
		_check(actual_distance > 125.0 and actual_distance < 140.0, "outside125 remains inside125+player radius")
	_check(after["hp"] == (324 if should_hit else 350), label + " actual magic26 damage boundary")
	_check(fixture["kernel"].get_snapshot()["zones"].is_empty(), label + " warning removed once")
	_check(_lava_effects(fixture["world"]).size() == 1, label + " expiry FX independent of hit result")
	if should_hit:
		_near(after["energy_def"], 0.0, label + " unchanged actual energy defence")
		_player_ticks(player)
		_check(player.velocity.length() > 1.0 and player.velocity.length() < 100.0, label + " default accepted Player KB retained; no override0 or120")
	_dispose(fixture)

func _test_damage_and_public_player_guards() -> bool:
	# Read the actual public action-average deadzone, rather than assume .5.
	# Request vector25/26: actual150px/sec, so50 STEP moves125px.
	# No action-map override, actor position/timer setter or clock change.
	# This is headless analog Input fixture input, not a native keyboard claim.
	_movement_input_deadzone = 0.0
	for action in ["move_left", "move_right", "move_up", "move_down"]:
		var actual_deadzone = InputMap.action_get_deadzone(action)
		_movement_deadzone_by_action[action] = actual_deadzone
		_movement_input_deadzone += actual_deadzone / 4.0
	_movement_requested_strength = _movement_input_deadzone + (1.0 - _movement_input_deadzone) * 25.0 / 26.0
	_real_radius_case(_movement_requested_strength, 50, true, "inclusive125")
	_real_radius_case(1.0, 49, false, "outside125_without_player_radius")
	var iframe_fixture = _real_player_fixture()
	var player = iframe_fixture["target"]
	_native(iframe_fixture, 479)
	for _hit in range(4):
		player.receive_damage(1, "magic", Vector2.RIGHT)
	_player_ticks(player, 240)
	_check(player.get_snapshot()["iframes"] > 0.0, "iframes acquired through actual damage and normal stun recovery")
	var before_hp = player.get_snapshot()["hp"]
	var damage_events = _event_count("player_damage")
	_native(iframe_fixture)
	_pair_ticks(iframe_fixture, 53)
	_check(player.get_snapshot()["hp"] == before_hp, "actual active iframe blocks M30 request")
	_check(_event_count("player_damage") == damage_events, "blocked M30 does not call actual Player damage")
	_check(_lava_effects(iframe_fixture["world"]).size() == 1, "iframe rejection still creates independent lava")
	_dispose(iframe_fixture)
	var held = _real_player_fixture()
	player = held["target"]
	for _step in range(2):
		_check(player.request_attack(), "real combo request enters attack")
		player.release_attack()
		_player_ticks(player, 58)
	_check(player.request_attack() and player.is_charging(), "public third request obtains windup; no state setter")
	_native(held, 480)
	_pair_ticks(held, 53)
	_check(player.get_snapshot()["hp"] == 324, "KiSlash windup is not literal source charge guard")
	_check(player.get_snapshot()["state"] == "windup", "accepted magic26 retains actual charging phase")
	_check(player.get_snapshot()["charge_frames"] > 0.0, "actual held physics progressed charge")
	player.release_attack()
	_dispose(held)
	for context in [{"state": "charge", "iframes": 0.0, "hp": 350, "requested": false}, {"state": "idle", "iframes": 1.0, "hp": 350, "requested": false}, {"state": "dead", "iframes": 0.0, "hp": 0, "requested": true}]:
		var sink = ReadonlyTargetContext.new(context["state"], context["iframes"], context["hp"])
		var fixture = _fixture(sink)
		_native(fixture, 533)
		_check(sink.packets.size() == (1 if context["requested"] else 0), "readonly constructor provider literal outer guard: " + context["state"])
		if context["requested"]:
			_check(sink.packets[0]["amount"] == 26 and sink.packets[0]["kind"] == "magic", "dead provider still receives source outer request; no extraHP gate")
			_near(sink.packets[0]["impulse"], -1.0, "M30 supplies no extra KB override")
			_check(sink.packets[0]["direction"] == Vector2.ZERO, "M30 supplies no extra KB heading")
		_check(_lava_effects(fixture["world"]).size() == 1, "provider guard independent lava")
		_dispose(fixture)
	return true

func _test_warning_and_original_cells() -> bool:
	var fixture = _fixture()
	_check(fixture["accepted"], "actual imported original resources pass configure")
	var penta = ResourceLoader.load("res://assets/vfx/vfx_pentagram_red.png", "Texture2D")
	var lava = ResourceLoader.load("res://assets/vfx/vfx_lava_erupt.png", "Texture2D")
	_check(penta is Texture2D and penta.get_size() == Vector2(1024, 1024), "actual packaged whole pentagram resource")
	_check(lava is Texture2D and lava.get_size() == Vector2(2304, 2304), "actual packaged nine-cell lava resource")
	_check(fixture["kernel"].get("_pentagram") == penta and fixture["kernel"].get("_lava") == lava, "consumer loaded actual original Resource objects, not metadata only")
	_native(fixture, 480)
	var born = fixture["kernel"].get_warning_recipe(0, 0.0)
	_near(born["q"], 1.0 / 54.0, "computed recipe consumes actual born-end53")
	_near(born["head"], 125.0 / 54.0, "born progress head derives from actual warning phase")
	_near(born["pentagram_size"], 220.0, "whole original bitmap draw extent")
	_near(born["pentagram_alpha"], 0.15 + 0.13 / 54.0, "born bitmap alpha")
	_native(fixture, 26)
	var halfway = fixture["kernel"].get_warning_recipe(0, 100.0)
	_near(halfway["q"], 0.5, "native phase advances source warning progress")
	_near(halfway["head"], 62.5, "native phase advances head independently of renderer now")
	_near(halfway["spin"], 0.08, "literal renderer now controls source spin")
	_near(halfway["pentagram_rotation"], 0.028, "literal renderer now controls original bitmap rotation")
	var before = fixture["kernel"].get_snapshot()["zones"].duplicate(true)
	_warning_render_method_calls += 1
	fixture["kernel"].render_native(200.0)
	_check(fixture["kernel"].get_snapshot()["zones"] == before, "render_native never consumes native warning timer")
	var additive = fixture["kernel"].get_node_or_null("M30AdditiveWarning")
	_check(additive != null and additive.material is CanvasItemMaterial, "actual additive warning CanvasItem exists")
	if additive != null and additive.material is CanvasItemMaterial:
		_check(additive.material.blend_mode == CanvasItemMaterial.BLEND_MODE_ADD, "actual progress layer uses additive material")
	var invalid_profile = _profile.duplicate(true)
	invalid_profile["warning"]["texture"] = "res://assets/vfx/__missing_required_M30_original__.png"
	var invalid = KernelScript.new()
	fixture["owner"].add_child(invalid)
	var initial_mod_state = {"eliteBusy": 0.0, "eliteRing": 0.0}
	print("EXPECTED_RESOURCE_REJECTION_BEGIN missing_required_M30_original")
	var accepted = invalid.configure(fixture["owner"], fixture["target"], fixture["world"], initial_mod_state, invalid_profile)
	print("EXPECTED_RESOURCE_REJECTION_END missing_required_M30_original")
	_expected_resource_rejections += 1
	_check(not accepted, "actual missing required texture refuses configure")
	_check(initial_mod_state == {"eliteBusy": 0.0, "eliteRing": 0.0} and invalid.get_child_count() == 0, "missing-resource preflight preserves caller state and allocates no child")
	_check(invalid.get_snapshot()["configuration_error"] == "missing_required_original_texture", "missing-resource error remains explicit")
	_native(fixture, 27)
	var effects = _lava_effects(fixture["world"])
	_check(effects.size() == 1, "warning expiry creates actual lava Sprite consumer")
	if effects.is_empty():
		_dispose(fixture)
		return false
	var effect = effects[0]
	var sprite = effect.get_node_or_null("M30OriginalLava")
	_check(sprite is Sprite2D and sprite.texture == lava, "actual lava Sprite consumes imported original texture")
	if not sprite is Sprite2D:
		_dispose(fixture)
		return false
	for frame in range(9):
		var expected_crop = Rect2((frame % 3) * 768, int(frame / 3) * 768, 768, 768)
		_check(sprite.region_enabled and sprite.region_rect == expected_crop, "actual lava crop for frame%d" % frame)
		_near(sprite.scale.x * sprite.region_rect.size.x, 312.5, "actual cropped lava draw width frame%d" % frame)
		_near(sprite.scale.y * sprite.region_rect.size.y, 312.5, "actual cropped lava draw height frame%d" % frame)
		_near(sprite.modulate.a, 0.85 * (1.0 - float(frame) / 9.0 * 0.3), "actual cropped lava alpha frame%d" % frame)
		if frame < 8:
			_lava_render(effect, 5.0)
	_check(effect.material is CanvasItemMaterial and effect.material.blend_mode == CanvasItemMaterial.BLEND_MODE_ADD, "actual lava additive material")
	_check(sprite.texture_filter == CanvasItem.TEXTURE_FILTER_LINEAR, "actual lava linear resource sampling")
	_dispose(fixture)
	return true

func _test_independent_render_lifetime() -> bool:
	var fixture = _fixture(null, Vector2(1500.0, 3200.0))
	_native(fixture, 533)
	var effects = _lava_effects(fixture["world"])
	_check(effects.size() == 1, "translated world gets exactly one sibling effect")
	if effects.is_empty():
		_dispose(fixture)
		return false
	var effect = effects[0]
	_near(effect.global_position.x, 1500.0, "immutable source world X is not translated twice")
	_near(effect.global_position.y, 3121.875, "immutable source world Y includes exact lava offset once")
	_check(effect.get_parent() == fixture["world"], "effect is world sibling rather than owner child")
	fixture["owner"].free()
	_check(is_instance_valid(effect), "already born effect survives owner/kernel destruction")
	_lava_render(effect, 16.0, false)
	_check(effect.get_snapshot()["frame"] == 1, "large render step increments once, no while catchup")
	_near(effect.get_snapshot()["t"], 0.0, "large render step discards overshoot, no carry")
	_check(not effect.get_snapshot()["visible"], "translated view/budget cull hides drawing after advancing")
	_lava_render(effect, 4.0, true)
	_check(effect.get_snapshot()["frame"] == 1, "subthreshold render step retains existing frame")
	_near(effect.get_snapshot()["t"], 4.0, "subthreshold ordinary render clock")
	_lava_render(effect, 1.0, true)
	_check(effect.get_snapshot()["frame"] == 2, "threshold crossing increments exactly once")
	_check(not effect.get_snapshot()["visible"], "outside view still hidden after clock has advanced")
	for _frame in range(7):
		_lava_render(effect, 5.0)
	_check(effect.get_snapshot()["ended"], "nine ordinary frames end independently of warning54")
	var texture = ResourceLoader.load("res://assets/vfx/vfx_lava_erupt.png", "Texture2D")
	var missing = KernelScript.LavaEffect.new()
	missing.configure(Vector2.ZERO, _profile["lava"], null, 312.5)
	fixture["world"].add_child(missing)
	_lava_render(missing, 100.0, false)
	_check(missing.get_snapshot()["missing_texture"] and not missing.get_snapshot()["ended"], "missing-image entry retained before clock")
	_near(missing.get_snapshot()["t"], 0.0, "missing image clock remains paused")
	_check(missing.get_snapshot()["frame"] == 0 and missing.get_child_count() == 0, "missing image never increments or allocates a substitute Sprite")
	_dispose(fixture)
	var auto_world = FixtureWorld.new()
	root.add_child(auto_world)
	var automatic = KernelScript.LavaEffect.new()
	automatic.configure(Vector2.ZERO, _profile["lava"], texture, 312.5)
	auto_world.add_child(automatic)
	paused = false
	for _frame in range(3):
		await process_frame
		_automatic_process_frame_observations += 1
	paused = true
	var normal = automatic.get_snapshot()
	_automatic_fx_render_advancement = normal["frame"] > 0 or normal["t"] > 0.0
	_check(_automatic_fx_render_advancement, "actual _process dispatch consumes ordinary render time without injected delta")
	for _frame in range(4):
		await process_frame
		_automatic_process_frame_observations += 1
	var frozen = automatic.get_snapshot()
	_check(normal["frame"] == frozen["frame"] and normal["t"] == frozen["t"], "actual tree pause freezes effect across four process frames")
	auto_world.free()
	return true

func _run() -> void:
	var decoded = JSON.parse_string(FileAccess.get_file_as_string(PROFILE_FILE))
	if not decoded is Dictionary:
		print("BOOT_INCOMPLETE M30 profile dictionary missing")
		quit(2)
		return
	_profile = decoded
	await _run_group("m30_owner_clock_isolation", _test_owner_clock_isolation)
	await _run_group("m30_damage_boundary_and_public_player_guards", _test_damage_and_public_player_guards)
	await _run_group("m30_original_warning_and_cells", _test_warning_and_original_cells)
	await _run_group("m30_independent_render_lifetime", _test_independent_render_lifetime)
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon"]:
		Input.action_release(action)
	print("M30_RESULT " + JSON.stringify({"passed": _passed, "failed_assertions": _failed_assertions, "valid_completed_groups": _completed_groups, "incomplete_groups": _incomplete_groups, "explicit_native_kernel_calls": _native_method_calls, "explicit_player_physics_method_calls": _player_physics_method_calls, "explicit_warning_render_method_calls": _warning_render_method_calls, "explicit_lava_render_method_calls": _lava_render_method_calls, "headless_fixture_input_edges": _fixture_input_edges, "actual_fixture_action_average_deadzone": _movement_input_deadzone, "fixture_action_deadzones": _movement_deadzone_by_action, "requested_fixture_analog_strength": _movement_requested_strength, "actual_fixture_movement_vector": _movement_actual_vector, "radius_observations": _radius_observations, "automatic_fixture_process_frame_observations": _automatic_process_frame_observations, "automatic_physics_frame_signals": _automatic_physics_frame_signals, "automatic_native_owner_dispatches": 0, "actual_effect_automatic_render_advancement": _automatic_fx_render_advancement, "expected_missing_resource_rejections": _expected_resource_rejections, "live_actor_fields_forced": 0, "public_game_or_GUI_inputs": 0, "literal_charge_actual_Player_observed": false, "actual_pixel_or_240fps_claim": false}))
	quit(0 if _failed_assertions == 0 and _incomplete_groups.is_empty() else 1)
