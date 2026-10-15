extends SceneTree

const ACTOR = preload("res://scripts/type3_summoned_actor.gd")
const RECIPE = preload("res://scripts/type3_spawn_recipe.gd")

var _failed = 0
var _assertions = 0
var _explicit_steps = 0
var _packets: Array = []
var _groups: Array = []

class FixturePlayer extends Node2D:
	var hp = 350
	var radius = 10.0
	var state = "idle"
	var iframes = 0.0
	var damage_requests = 0
	func _init(initial_hp: int = 350) -> void:
		hp = initial_hp
	func receive_damage(_amount: int, _kind: String = "phys") -> void:
		damage_requests += 1

class FixtureWorld extends Node2D:
	var visible_to_player = true
	var direction = Vector2.RIGHT
	var enemies: Array = []
	var collision_rule: Callable
	func can_move(point: Vector2, _radius: float) -> bool:
		return bool(collision_rule.call(point)) if collision_rule.is_valid() else true
	func has_line_of_sight(_from: Vector2, _to: Vector2) -> bool:
		return visible_to_player
	func get_path_direction(_point: Vector2) -> Vector2:
		return direction
	func get_enemies() -> Array:
		return enemies

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var selected = ""
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--group="): selected = argument.trim_prefix("--group=")
	for group in ["recipe_and_elements", "native_movement_and_contact", "charge_birth_and_independence", "damage_poise_and_guards", "modifier_order_and_atlas", "charge_warning_source_guard"]:
		if not selected.is_empty() and group != selected: continue
		var before = _failed
		var checks_before = _assertions
		var steps_before = _explicit_steps
		call("_test_" + group)
		_groups.append({"id": group, "pass": _failed == before, "assertions": _assertions - checks_before, "explicit_native_steps": _explicit_steps - steps_before})
	print("TYPE3_ACTOR_LEDGER " + JSON.stringify({"groups": _groups, "failures": _failed, "assertions": _assertions, "explicit_native_steps": _explicit_steps, "automatic_physics": 0, "render_frames": 0, "imported_assets": 0, "actual_projectiles": 0, "public_play": false, "full_type7_actor_registered": false}))
	quit(0 if _failed == 0 else 1)

func _check(value: bool, label: String) -> void:
	_assertions += 1
	if not value:
		_failed += 1
		print("CHECK_FAIL " + label)

func _recipe(element: int, elite_random: float = 0.8, modifier_random: float = 0.25, x: float = 0.0) -> Dictionary:
	var draws = [elite_random]
	if elite_random < 0.03: draws.append(modifier_random)
	for index in range(8): draws.append(0.5)
	var state = {"index": 0}
	var random = func() -> float:
		var value = draws[int(state["index"])]
		state["index"] = int(state["index"]) + 1
		return value
	var constructor = RECIPE.new()
	constructor.configure(random, func(_x, _y, _r): return true, func(a, b, _r): return {"x": a, "y": b})
	return constructor.build_child(x, 0.0, {"stage": 0, "room": 0, "player_level": 1, "difficulty": 5, "stage_difficulty_offset": 0}, element)["recipe"]

func _fixture(recipe: Dictionary, extra_interfaces: Dictionary = {}, initial_player_hp: int = 350) -> Dictionary:
	var world = FixtureWorld.new()
	var player = FixturePlayer.new(initial_player_hp)
	player.position = Vector2(100.0, 0.0)
	root.add_child(world)
	world.add_child(player)
	var actor = ACTOR.new()
	var interfaces = {"render_body": false, "automatic_physics": false, "native_random": func(): return 0.5, "emit_charged_projectile": func(owner, packet): _packets.append({"owner": owner, "packet": packet.duplicate(true)})}
	interfaces.merge(extra_interfaces, true)
	var configured = actor.configure(recipe, player, world, interfaces)
	world.add_child(actor)
	world.enemies.append(actor)
	return {"world": world, "player": player, "actor": actor, "configured": configured}

func _dispose(fixture: Dictionary) -> void:
	fixture["world"].free()

func _step(actor: Node, ticks: float = 1.0) -> void:
	_explicit_steps += 1
	actor.advance_native(ticks)

func _test_recipe_and_elements() -> void:
	for element in range(6):
		var original = _recipe(element)
		var fixture = _fixture(original)
		var actor = fixture["actor"]
		_check(fixture["configured"], "six_element_config_" + str(element))
		_check(actor.hp == 437 and actor.max_hp == 437 and actor.get_snapshot()["native"]["poise"] == 875.0, "hp_half_prehalf_poise")
		_check(actor.get_snapshot()["native"]["eShield"] == 0 and actor.get_snapshot()["native"]["el"] == element, "shield_zero_element_unchanged")
		_check(actor.get_snapshot()["native"]["modT"] == original["modT"], "fresh_modT_consumed")
		var packet = actor.get_charged_packet(Vector2.RIGHT * 100.0)
		_check(packet["life"] == 60 and packet["ml"] == 60 and packet["el"] == element and packet["_commit"], "source_lifetime_and_class_input")
		_check(packet["dmg"] == ([24, 37, 37, 31, 24, 24][element]), "source_raw_damage_" + str(element))
		_check(packet.get("fireMagic", false) == (element == 1) and packet.get("waterBean", false) == (element == 2) and packet.get("gbBean", false) == (element == 3), "exact_bean_flags")
		_check(not packet.has("blackBean") and not packet.has("redBean") and not packet.has("homing"), "spawn_normalization_deferred_not_reimplemented")
		_check(packet["col"] == ["#bbbbbb", "#ff2e22", "#317cec", "#a44cff", "#ffee00", "#ff88cc"][element], "canonical_source_color")
		_check(original["x"] == 0.0 and not original.has("col"), "incoming_recipe_unmodified")
		_dispose(fixture)
	var invalid = _recipe(0)
	invalid["poise"] = invalid["hp"]
	var refused = _fixture(invalid)
	_check(not refused["configured"] and refused["actor"].get_snapshot()["native"].is_empty(), "bad_child_poise_refused_without_state_mutation")
	_dispose(refused)
	var elite_fixture = _fixture(_recipe(0, 0.01, 0.75))
	_check(not elite_fixture["configured"] and elite_fixture["actor"].get_snapshot()["configuration_error"] == "missing_actual_M30_consumer", "mandatory_mod_not_dropped")
	_dispose(elite_fixture)

func _test_native_movement_and_contact() -> void:
	var fixture = _fixture(_recipe(0))
	var actor = fixture["actor"]
	var world = fixture["world"]
	world.visible_to_player = false
	# Source unalerted near actors still execute the direct idle branch.
	_step(actor)
	_check(not actor.get_snapshot()["native"].get("_alerted", false), "LOS_required_for_aggro")
	_check(is_equal_approx(float(actor.get_snapshot()["native"]["x"]), -2.436), "nonalerted_native_facing_idle_motion")
	world.visible_to_player = true
	_step(actor)
	_check(actor.get_snapshot()["native"]["_alerted"], "LOS_aggro_enters")
	_check(float(actor.get_snapshot()["native"]["x"]) > 1.5, "flow_then_idle_speed_1_and_1_6")
	for tick in range(50): _step(actor)
	_check(fixture["player"].damage_requests == 0 and actor.get_snapshot()["natural_contact_damage"] == null, "type3_has_no_natural_contact_damage")
	_check(actor.state == "idle", "no_forbidden_ticket_windup_created")
	_dispose(fixture)
	var axis = _fixture(_recipe(0))
	axis["world"].direction = Vector2.ONE.normalized()
	axis["world"].collision_rule = func(point): return absf(point.y) < 0.00001
	_step(axis["actor"])
	var raw = axis["actor"].get_snapshot()["native"]
	_check(raw["_lastFdy"] == 0.0 and raw["_stuckT"] == 0.0 and raw["x"] > 0.0, "source_bothXY_then_X_axis_fallback")
	_dispose(axis)

func _test_charge_birth_and_independence() -> void:
	_packets.clear()
	var fixture = _fixture(_recipe(2))
	var actor = fixture["actor"]
	var charge_start = -1
	for tick in range(300):
		_step(actor)
		if float(actor.get_snapshot()["native"].get("_projChargeT", 0.0)) > 0.0:
			charge_start = tick
			break
	_check(charge_start == 239, "source_constructor_projT240_first_charge_at240")
	_check(actor.get_snapshot()["native"]["_projChargeT"] == 60.0 and _packets.is_empty(), "charge_born60_no_same_update_decrement")
	for tick in range(59): _step(actor)
	_check(_packets.is_empty() and actor.get_snapshot()["native"]["_projChargeT"] == 1.0, "no_shot_before_sixtieth_charge_tick")
	_step(actor)
	_check(_packets.size() == 1 and _packets[0]["packet"]["waterBean"], "real_charge_completes_single_packet")
	_check(actor.get_snapshot()["native"]["projT"] == 239.0, "completion_then_idle_decrements_projT_same_update")
	var independently_emitted = Node2D.new()
	fixture["world"].add_child(independently_emitted)
	actor.receive_damage(100000, Vector2.ZERO, "fixture_public_damage")
	_check(not actor.alive and is_instance_valid(independently_emitted) and independently_emitted.get_parent() == fixture["world"], "owner_death_keeps_world_owned_emitted_child")
	_dispose(fixture)

func _test_damage_poise_and_guards() -> void:
	var fixture = _fixture(_recipe(0))
	var actor = fixture["actor"]
	actor.receive_poise_damage(100.0)
	actor.receive_damage(100, Vector2.RIGHT, "kiSlash")
	var raw = actor.get_snapshot()["native"]
	_check(actor.hp == 337 and raw["poise"] == 775.0 and raw["poiseR"] == 0.0, "HP_and_poise_packet_are_separate")
	_check(raw["_hitStun"] == 8.0 and raw["st2"] == 5.0 and raw["_alerted"], "hurtE_alert_hitstun_idle_shortening")
	_check(raw["kb"]["x"] == 7.5, "kiSlash_baseline_KB_half")
	_step(actor)
	_check(actor.get_snapshot()["native"]["projT"] == 240.0, "hitstun_freezes_AI_charge_mod_timer")
	for tick in range(7): _step(actor)
	_check(actor.get_snapshot()["native"]["poiseR"] == 1.0, "stun_decrement_boundary_dispatch")
	for tick in range(199): _step(actor)
	_check(actor.get_snapshot()["native"]["poise"] == 875.0 and actor.get_snapshot()["native"]["poiseR"] == 0.0, "regen200_adds_trunc_prehalf15pct")
	actor.receive_poise_damage(875.0)
	actor.receive_damage(100, Vector2.ZERO, "weapon", {"poiseMult": 8.75})
	_check(actor.get_snapshot()["native"]["stunned"] == 180.0, "ordinary_groggy180")
	_step(actor)
	_check(actor.get_snapshot()["native"].get("_projChargeT", 0.0) == 0.0 and actor.get_snapshot()["native"]["poiseR"] == 0.0, "hitstun_precedes_stunned_branch")
	for tick in range(7): _step(actor)
	_check(actor.get_snapshot()["native"]["_projChargeT"] == 0.0, "stunned_branch_cancels_charge")
	var hp_before = actor.hp
	actor.receive_damage(10, Vector2.ZERO, "native_dot", {"dot": true})
	_check(actor.hp == hp_before - 10, "DOT_does_not_gain_stunned1_5_bonus")
	var frame_before = actor.get_snapshot()["native_frame"]
	paused = true
	_step(actor)
	_check(actor.get_snapshot()["native_frame"] == frame_before, "tree_pause_suspends_manual_dispatch")
	paused = false
	_dispose(fixture)

func _test_modifier_order_and_atlas() -> void:
	var calls: Array = []
	var interfaces = {"player_context": func(target): return {"x": target.global_position.x, "y": target.global_position.y, "r": target.radius, "hp": target.hp, "iframes": target.iframes, "state": target.state, "parry_window": false}, "modifier_pre_ai": func(actor, ticks, _distance, _ctx):
		calls.append("pre")
		var raw = actor.get_native_modifier_state()
		if raw["s"] == "idle": raw["s"] = "eChargeWind"; raw["st2"] = 90.0
		raw["modT"]["eliteBusy"] = 90.0
		return {"ticks": ticks}, "modifier_state_step": func(actor, _ticks, _ctx):
		calls.append("state")
		_check(actor.get_native_modifier_state()["st2"] == 89.0, "modifier_state_step_after_source_st2_decrement")}
	var fixture = _fixture(_recipe(0, 0.01, 0.25), interfaces)
	_check(fixture["configured"], "actual_modifier_hooks_required_and_accepted")
	_step(fixture["actor"])
	_check(calls == ["pre", "state"] and fixture["actor"].state == "eChargeWind", "modifier_branch_order_not_idle_alias")
	_check(fixture["actor"].get_snapshot()["native"]["modT"]["eliteBusy"] == 90.0, "modifier_owns_independent_native_timer_dictionary")
	var copied = fixture["actor"].get_snapshot()
	copied["native"]["hp"] = 1
	_check(fixture["actor"].hp == 875, "readonly_snapshot_cannot_inject_live_HP")
	_dispose(fixture)
	var body = _fixture(_recipe(0, 0.8, 0.25, 1.0))
	var recipe = body["actor"].get_animation_recipe()
	_check(recipe["skin"] == "flesh_eye_mass" and recipe["base_rect"] == [1024, 256, 256, 256] and recipe["walk_rect"] == [4096, 256, 256, 256], "actual_dynamic_skin_cells_not_flesh_alias")
	_check(recipe["direction"] == "west" and recipe["spawn_alpha"] == 0.0, "original_direction_and_spawn_fade")
	_step(body["actor"])
	recipe = body["actor"].get_animation_recipe()
	_check(recipe["walk_visible"] and is_equal_approx(recipe["spawn_alpha"], 0.05) and recipe["draw_height"] == 77.0, "source_overlay_and_body_size")
	_dispose(body)

func _test_charge_warning_source_guard() -> void:
	_packets.clear()
	for element in range(6):
		# Constructor-only fixture. updateE itself has no Player HP-return gate;
		# game-over scheduling belongs to the caller's world/main-loop phase.
		var fixture = _fixture(_recipe(element), {}, 0)
		var actor = fixture["actor"]
		for tick in range(240): _step(actor)
		var raw = actor.get_snapshot()["native"]
		_check(raw.get("_projChargeT", 0.0) == 60.0, "source_updateE_has_no_added_HP_gate_" + str(element))
		_check(raw["_projChargeCol"] == ["#bbbbbb", "#ff2e22", "#317cec", "#a44cff", "#ffee00", "#ff88cc"][element], "native_warning_color_not_body_color")
		_check(raw["_projChargeParryClass"] == ("physical" if element == 0 else "magic"), "source_warning_parry_class")
		actor.receive_poise_damage(10000.0)
		actor.receive_damage(1, Vector2.ZERO, "constructor_fixture", {"poiseMult": 10000.0})
		for tick in range(8): _step(actor)
		raw = actor.get_snapshot()["native"]
		_check(raw["_projChargeT"] == 0.0 and raw["_projChargeCol"] == null and _packets.is_empty(), "stun_cancels_mandatory_warning_fields_and_unborn_shot")
		_dispose(fixture)
