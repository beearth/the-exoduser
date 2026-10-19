extends SceneTree
## Independent native fixtures. No live session, injected input or mutable observer.

const PlayerScript = preload("res://scripts/player.gd")
const PhysicalScript = preload("res://scripts/enemy_projectile_physical.gd")
const STEP = 1.0 / 60.0

class TechnicalWorld extends Node2D:
	func get_enemies() -> Array:
		return []

	func can_move(_point: Vector2, _radius: float) -> bool:
		return true

	func is_world_blocked(_point: Vector2) -> bool:
		return false

var _combat: Dictionary
var _profile: Dictionary
var _only: Array[String] = []
var _failures = 0
var _passes = 0
var _case_name = ""
var _explicit_calls = 0
var _automatic_ticks = 0.0

func _initialize() -> void:
	paused = true
	# Native player queries these ordinary input actions. Register names only;
	# no press/release is injected and no public app receives an event.
	for action in ["weapon", "move_left", "move_right", "move_up", "move_down"]:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			for name in argument.trim_prefix("--only=").split(","):
				_only.append(name)
	call_deferred("_run")

func _run() -> void:
	_combat = JSON.parse_string(FileAccess.get_file_as_string("res://data/combat.json"))
	var config: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/etype0_physical_flesh_crawler.json"))
	_profile = config["runtime"]["projectile"]
	for name in ["post_hit_pulse_expiry", "stack_timer_independence", "dot_isolation_cancel_persistence", "automatic_pause_native_clock"]:
		if not _only.is_empty() and not _only.has(name):
			continue
		_case_name = name
		var before = _failures
		match name:
			"post_hit_pulse_expiry": await _test_post_hit()
			"stack_timer_independence": await _test_stacks()
			"dot_isolation_cancel_persistence": await _test_isolation()
			"automatic_pause_native_clock": await _test_pause()
		if before == _failures:
			_passes += 1
			print("PASS ", name)
		else:
			print("FAIL ", name)
	paused = true
	print("GODOT_BURN_RESULT ", JSON.stringify({"passed": _passes, "failed_assertions": _failures, "only": _only, "explicit_native_method_calls": _explicit_calls, "automatic_fixture_physics_ticks": _automatic_ticks, "public_play_evidence": false, "performance_evidence": false, "live_app_inputs": 0, "forced_actor_fields": 0, "source_factory_executions": 0}))
	quit(0 if _failures == 0 and _passes > 0 else 1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		_failures += 1
		printerr("ASSERT_FAIL [", _case_name, "] ", message)

func _equal(left: Variant, right: Variant) -> bool:
	if (typeof(left) == TYPE_FLOAT or typeof(left) == TYPE_INT) and (typeof(right) == TYPE_FLOAT or typeof(right) == TYPE_INT):
		return float(left) == float(right)
	if left is Array and right is Array:
		if left.size() != right.size():
			return false
		for index in range(left.size()):
			if not _equal(left[index], right[index]):
				return false
		return true
	if left is Dictionary and right is Dictionary:
		if left.size() != right.size():
			return false
		for key in left:
			if not right.has(key) or not _equal(left[key], right[key]):
				return false
		return true
	return left == right

func _fixture(native_child_order: bool = false) -> Dictionary:
	var world = TechnicalWorld.new()
	world.process_mode = Node.PROCESS_MODE_PAUSABLE
	var owner = world
	if native_child_order:
		owner = Node2D.new()
		owner.process_mode = Node.PROCESS_MODE_PAUSABLE
		root.add_child(owner)
		owner.add_child(world)
	else:
		root.add_child(world)
	var player = PlayerScript.new()
	player.set_combat(_combat)
	player.set_world(world)
	var events: Array = []
	player.telemetry_event.connect(func(kind: String, data: Dictionary) -> void: events.append({"kind": kind, "data": data.duplicate(true)}))
	if native_child_order:
		owner.add_child(player)
	else:
		world.add_child(player)
	return {"world": world, "player": player, "owner": owner, "events": events}

func _step(node: Node, count: int = 1) -> void:
	for index in range(count):
		node.call("_physics_process", STEP)
		_explicit_calls += 1

func _burns(player: Node) -> Array:
	return player.call("get_native_burn_snapshot")

func _contact(fixture: Dictionary) -> Node:
	var player = fixture["player"]
	var shot = PhysicalScript.new()
	shot.configure(player.global_position - Vector2(10, 0), Vector2.RIGHT, _profile, player, fixture["world"])
	fixture["world"].add_child(shot)
	_step(shot)
	return shot

func _natural_stun(player: Node) -> void:
	# Four ordinary accepted requests deplete the original poise4. No field,
	# state or timer is assigned to manufacture iframe60.
	for hit in range(4):
		player.call("receive_damage", 10, "magic", Vector2.RIGHT)
	_check(player.get("state") == "pStun", "ordinary four-hit poise path naturally reaches pStun")
	_step(player, 240)
	_check(player.get("state") == "idle" and player.get("iframes") == 60, "native pStun completion naturally supplies iframe60")

func _test_post_hit() -> void:
	var fixture = _fixture()
	await physics_frame
	var player = fixture["player"]
	_check(player.hp == 350 and player.poise == 4 and _burns(player).is_empty(), "original player construction has no synthetic HP/poise/status")
	var shot = _contact(fixture)
	_check(player.hp == 326 and player.state == "stagger" and player.poise == 3, "actual physical contact uses parry24 and ordinary hit state")
	_check(shot.is_queued_for_deletion() and _equal(_burns(player), [{"total": 48, "t": 600, "tick": 0}]), "post-hit burns from pre-DR24 despite stagger, retains birth tick0 after projectile ends")
	_step(player, 5)
	_check(player.state == "stagger" and _burns(player)[0]["t"] == 600, "stagger time cannot age the idle-only burn")
	_step(player)
	_check(player.state == "idle" and _burns(player)[0]["t"] == 600, "transition-to-idle update does not also dispatch idle burn")
	_step(player, 29)
	_check(player.hp == 326 and _burns(player)[0]["t"] == 571 and _burns(player)[0]["tick"] == 29, "first29 active idle ticks do not damage")
	_step(player)
	_check(player.hp == 325 and _equal(_burns(player), [{"total": 48, "t": 570, "tick": 0}]) and player.poise == 3 and player.state == "idle", "first30 pulse applies raw2 physDR2→HP1 without ordinary hit side effects")
	_step(player, 539)
	_check(player.hp == 308 and _burns(player)[0]["t"] == 31 and _burns(player)[0]["tick"] == 29, "active569 has18 accepted requests, not a render-time approximation")
	_step(player)
	_check(player.hp == 307 and _burns(player)[0]["t"] == 30 and _burns(player)[0]["tick"] == 0, "active570 is the nineteenth and final pulse")
	_step(player, 29)
	_check(player.hp == 307 and _equal(_burns(player), [{"total": 48, "t": 1, "tick": 29}]), "active599 preserves stack and no extra request")
	_step(player)
	_check(player.hp == 307 and _burns(player).is_empty(), "active600 expires before a twentieth scheduled pulse")
	var pulses = fixture["events"].filter(func(event: Dictionary) -> bool: return event["kind"] == "native_burn_pulse")
	_check(pulses.size() == 19, "actual telemetry proves19 scheduled requests rather than inferring20 from duration/interval")
	for pulse in pulses:
		var packet: Dictionary = pulse["data"]
		_check(packet["raw_amount"] == 2 and packet["amount"] == 1 and packet["accepted"] and packet["dot"] and packet["burn"] and packet["src"] == "화상", "actual DOT packet identifies raw2→HP1 and burn source")
	var expired = fixture["events"].filter(func(event: Dictionary) -> bool: return event["kind"] == "native_burn_expired")
	_check(expired.size() == 1 and expired[0]["data"]["t"] == 0 and expired[0]["data"]["tick"] == 30, "actual expiry event records the suppressed final threshold")
	fixture["world"].free()
	var guarded = _fixture()
	_natural_stun(guarded["player"])
	var hp_before = guarded["player"].hp
	_contact(guarded)
	_check(guarded["player"].hp == hp_before and _burns(guarded["player"]).is_empty(), "normal outer contact iframe gate rejects both direct hit and new burn")
	guarded["world"].free()
	var lethal = _fixture()
	for hit in range(3):
		lethal["player"].receive_damage(1000, "magic", Vector2.RIGHT)
	_check(lethal["player"].hp == 5, "ordinary capped hits create a lethal contact context without forced HP")
	_contact(lethal)
	_check(lethal["player"].hp == 0 and lethal["player"].state == "dead" and _equal(_burns(lethal["player"]), [{"total": 48, "t": 600, "tick": 0}]), "post-hit append is not coupled to positive surviving HP")
	_step(lethal["player"], 60)
	_check(_equal(_burns(lethal["player"]), [{"total": 48, "t": 600, "tick": 0}]), "death preserves and freezes the independent pool; it does not clear it")
	lethal["world"].free()

func _test_stacks() -> void:
	var fixture = _fixture()
	await physics_frame
	var player = fixture["player"]
	_check(player.apply_native_burn(48), "first source-valued burn admission succeeds")
	_step(player, 15)
	_check(player.apply_native_burn(48), "second source-valued burn admission succeeds later")
	_step(player, 15)
	_check(player.hp == 349 and _equal(_burns(player), [{"total": 48, "t": 570, "tick": 0}, {"total": 48, "t": 585, "tick": 15}]), "two stacks retain independent birth times and first pulse order")
	_step(player, 15)
	_check(player.hp == 348 and _equal(_burns(player), [{"total": 48, "t": 555, "tick": 15}, {"total": 48, "t": 570, "tick": 0}]), "later stack pulse does not refresh or merge the earlier timer")
	for index in range(8):
		_check(player.apply_native_burn(48), "admission up to actual source cap10 succeeds")
	var before = _burns(player)
	_check(before.size() == 10 and not player.apply_native_burn(48) and _equal(_burns(player), before), "eleventh admission cannot replace, refresh or extend existing timers")
	var detached = _burns(player)
	detached[0]["t"] = 0
	_check(_equal(_burns(player), before), "mutating a detached readonly snapshot cannot write an actor timer")
	fixture["world"].free()
	var simultaneous = _fixture()
	for index in range(10):
		simultaneous["player"].apply_native_burn(48)
	_step(simultaneous["player"], 30)
	_check(simultaneous["player"].hp == 340 and simultaneous["player"].poise == 4 and simultaneous["player"].state == "idle", "ten independent raw2 requests use minimum1 each; no combined raw20 damage")
	for stack in _burns(simultaneous["player"]):
		_check(stack["t"] == 570 and stack["tick"] == 0, "each simultaneous stack advances and resets once")
	simultaneous["world"].free()
	var death_mid_loop = _fixture()
	for index in range(10):
		death_mid_loop["player"].apply_native_burn(48)
	for hit in range(3):
		death_mid_loop["player"].receive_damage(1000, "phys", Vector2.RIGHT)
	_check(death_mid_loop["player"].hp == 8, "ordinary physical cap/DR provides low-HP context without assignment")
	_step(death_mid_loop["player"], 6)
	_step(death_mid_loop["player"], 30)
	_check(death_mid_loop["player"].hp == 0 and death_mid_loop["player"].state == "dead" and _burns(death_mid_loop["player"]).size() == 10, "earlier stack can kill during an already-entered source idle loop")
	for stack in _burns(death_mid_loop["player"]):
		_check(stack["t"] == 570 and stack["tick"] == 0, "later stacks still advance/reset after earlier pulse death")
	before = _burns(death_mid_loop["player"])
	_step(death_mid_loop["player"], 60)
	_check(_equal(_burns(death_mid_loop["player"]), before), "next dead updates cannot continue the entered idle loop")
	death_mid_loop["world"].free()

func _test_isolation() -> void:
	var fixture = _fixture()
	await physics_frame
	var player = fixture["player"]
	player.apply_native_burn(48)
	_natural_stun(player)
	_check(_equal(_burns(player), [{"total": 48, "t": 600, "tick": 0}]), "pStun240 freezes rather than clears existing burn")
	var hp_before = player.hp
	_step(player, 29)
	_check(player.iframes == 31 and player.hp == hp_before and _burns(player)[0]["tick"] == 29, "positive iframe does not stop eligible idle stack clock")
	_step(player)
	_check(player.iframes == 30 and player.hp == hp_before and _burns(player)[0]["tick"] == 0, "iframe-rejected pulse still consumes its scheduled tick")
	_step(player, 29)
	_step(player)
	_check(player.iframes == 0 and player.hp == hp_before - 1 and player.poise == 4 and player.state == "idle", "next pulse after natural iframe expiry acceptsHP1 and leaves poise/state unchanged")
	var pulses = fixture["events"].filter(func(event: Dictionary) -> bool: return event["kind"] == "native_burn_pulse")
	_check(pulses.size() == 2 and not pulses[0]["data"]["accepted"] and pulses[0]["data"]["amount"] == 0 and pulses[1]["data"]["accepted"], "actual rejected pulse is consumed once and the next scheduled request is independent")
	fixture["world"].free()
	var combat_fixture = _fixture()
	player = combat_fixture["player"]
	player.apply_native_burn(48)
	_step(player)
	for attack in range(2):
		_check(player.request_attack(), "native combo attack starts through actual public method")
		player.release_attack()
		_step(player, 58)
	_check(player.state == "idle" and player.combo_step == 2 and _burns(player)[0]["t"] == 599, "two natural swing/recover cycles do not age idle-only burn")
	_check(player.request_attack() and player.state == "windup", "third native public request starts charge without state injection")
	_step(player, 40)
	_check(player.charge_frames == 40 and _burns(player)[0]["t"] == 599, "charge40 preserves independent burn clock")
	_contact(combat_fixture)
	_check(player.hp == 326 and player.state == "windup" and player.poise == 3 and _equal(_burns(player), [{"total": 48, "t": 599, "tick": 1}, {"total": 48, "t": 600, "tick": 0}]), "actual kiSlash hold contact keeps its native HP/poise hit and independent post-hit append; hold is not E dash immunity")
	_check(player.cancel_attack(), "public Q-scope cancellation succeeds")
	player.release_attack()
	_check(player.state == "idle" and _equal(_burns(player), [{"total": 48, "t": 599, "tick": 1}, {"total": 48, "t": 600, "tick": 0}]), "cancelled charge cannot delete or refresh independent DOT")
	_step(player, 28)
	var poise_before = player.poise
	var kb_before: Vector2 = player.get("_knockback")
	hp_before = player.hp
	_step(player)
	_check(player.hp == hp_before - 1 and player.poise == poise_before and player.state == "idle" and player.get("_knockback") == kb_before and player.iframes == 0, "accepted burn changes only HP; no new KB, stagger, poise loss or invulnerability")
	_step(player)
	_check(player.hp == hp_before - 2 and player.poise == poise_before and player.state == "idle", "later post-hit stack keeps its own pulse after charge cancellation")
	combat_fixture["world"].free()

func _test_pause() -> void:
	var fixture = _fixture()
	var player = fixture["player"]
	player.apply_native_burn(48)
	var first_clock: float = player.get("_clock_frames")
	paused = false
	await physics_frame
	await process_frame
	await physics_frame
	await process_frame
	paused = true
	var after: Array = _burns(player)
	var clock_after: float = player.get("_clock_frames")
	var observed = clock_after - first_clock
	_automatic_ticks += observed
	_check(Engine.physics_ticks_per_second == 60 and observed > 0 and after[0]["t"] == 600 - observed and after[0]["tick"] == observed, "actual automatic fixture physics uses60Hz native ticks, not rendered/process frames")
	for frame in range(4):
		await process_frame
	_check(player.get("_clock_frames") == clock_after and _equal(_burns(player), after), "actual SceneTree pause freezes native player and independent DOT across process frames")
	paused = false
	await physics_frame
	await process_frame
	paused = true
	var resumed_clock: float = player.get("_clock_frames")
	var resumed = resumed_clock - clock_after
	_automatic_ticks += resumed
	_check(resumed > 0 and _burns(player)[0]["t"] == after[0]["t"] - resumed, "actual resume continues remaining timer without reset or catch-up fabrication")
	fixture["world"].free()
	var ordered = _fixture(true)
	player = ordered["player"]
	await physics_frame
	player.apply_native_burn(48)
	_step(player, 29)
	_check(_equal(_burns(player), [{"total": 48, "t": 571, "tick": 29}]), "public admission and real29 updates prepare an imminent pulse without timer writes")
	var shot = PhysicalScript.new()
	shot.configure(player.global_position - Vector2(10, 0), Vector2.RIGHT, _profile, player, ordered["world"])
	ordered["world"].add_child(shot)
	_check(ordered["owner"].get_child(0) == ordered["world"] and ordered["owner"].get_child(1) == player and shot.process_physics_priority == 1 and player.process_physics_priority == 0, "actual native world-before-player hierarchy needs the new physical priority1 after player0")
	first_clock = player.get("_clock_frames")
	paused = false
	await physics_frame
	await process_frame
	paused = true
	_automatic_ticks += float(player.get("_clock_frames")) - first_clock
	_check(player.hp == 325 and _equal(_burns(player), [{"total": 48, "t": 570, "tick": 0}, {"total": 48, "t": 600, "tick": 0}]), "actual automatic dispatch runs old idle pulse before contact; newly appended burn keeps birth600/tick0")
	ordered["owner"].free()
