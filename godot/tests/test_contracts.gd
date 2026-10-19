extends SceneTree
## Deterministic API regression checks. These are not public-play or FPS evidence.

var _failures := 0
var _passes := 0
var _case_name := ""
var _selected: Array[String] = []
var _combat: Dictionary


func _initialize() -> void:
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			for item in argument.trim_prefix("--only=").split(","):
				_selected.append(item)
	call_deferred("_run")


func _run() -> void:
	_register_fixture_inputs()
	_combat = JSON.parse_string(FileAccess.get_file_as_string("res://data/combat.json"))
	for case_name in ["map", "charge", "projectile", "pause_capture", "damage"]:
		if not _selected.is_empty() and not _selected.has(case_name):
			continue
		_case_name = case_name
		var before := _failures
		match case_name:
			"map":
				await _test_map()
			"charge":
				await _test_charge()
			"projectile":
				await _test_projectile()
			"pause_capture":
				await _test_pause_capture()
			"damage":
				await _test_damage()
		if before == _failures:
			_passes += 1
			print("PASS ", case_name)
		else:
			print("FAIL ", case_name)
	print("GODOT_CONTRACT_RESULT ", JSON.stringify({"passed": _passes, "failed_assertions": _failures, "only": _selected, "public_play_evidence": false, "performance_evidence": false}))
	quit(0 if _failures == 0 and _passes > 0 else 1)


func _check(condition: bool, message: String) -> void:
	if not condition:
		_failures += 1
		printerr("ASSERT_FAIL [", _case_name, "] ", message)


func _register_fixture_inputs() -> void:
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon", "cancel_charge"]:
		if not InputMap.has_action(action):
			InputMap.add_action(action)


func _make_player() -> CharacterBody2D:
	var player: CharacterBody2D = load("res://scripts/player.gd").new()
	root.add_child(player)
	player.set_process(false)
	player.set_physics_process(false)
	player.set_process_unhandled_input(false)
	return player


func _ticks(player: Node, count: int) -> void:
	for _index in count:
		player.call("_physics_process", 1.0 / 60.0)


func _test_map() -> void:
	var world: Node2D = load("res://scripts/world.gd").new()
	root.add_child(world)
	world.set_process(false)
	world.set_physics_process(false)
	var data: Dictionary = world.get("map_data")
	_check(int(data["width"]) == 200 and int(data["height"]) == 200 and int(data["tile_size"]) == 40, "canonical dimensions must remain 200×200 / 40px")
	var tiles: Array = data["tiles"]
	_check(tiles.size() == 40000 and int(data["world_size"][0]) == 8000 and int(data["world_size"][1]) == 8000, "full canonical tile range/world dimensions")
	var covered := PackedInt32Array()
	covered.resize(40000)
	covered.fill(0)
	for rect in data["collision_rects"]:
		for value in rect:
			_check(is_zero_approx(fmod(float(value), 40.0)), "merged wall rectangle must align with native tiles")
		var x0 := int(float(rect[0]) / 40.0)
		var y0 := int(float(rect[1]) / 40.0)
		var width := int(float(rect[2]) / 40.0)
		var height := int(float(rect[3]) / 40.0)
		_check(x0 >= 0 and y0 >= 0 and x0 + width <= 200 and y0 + height <= 200, "wall shape within canonical range")
		for y in range(y0, y0 + height):
			for x in range(x0, x0 + width):
				covered[y * 200 + x] += 1
	var coverage_errors := 0
	for index in 40000:
		if covered[index] != (1 if int(tiles[index]) == 1 else 0):
			coverage_errors += 1
	_check(coverage_errors == 0, "actual physical wall rectangle union must cover each and only native solid tile once: %d errors" % coverage_errors)
	var body: StaticBody2D = world.get_node("NativeMapCollision")
	_check(body.collision_layer == 1 and body.collision_mask == 0, "world layer remains1; body does not chase actors")
	_check(body.get_child_count() == int(world.get("collision_count")), "runtime collision count equals real shapes, not metadata alone")
	for index in data["collision_rects"].size():
		var rect: Array = data["collision_rects"][index]
		var actual: CollisionShape2D = body.get_child(index)
		_check(actual.shape is RectangleShape2D and actual.shape.size == Vector2(float(rect[2]), float(rect[3])), "runtime wall shape consumes exported size")
		_check(actual.position == Vector2(float(rect[0]) + float(rect[2]) / 2.0, float(rect[1]) + float(rect[3]) / 2.0), "runtime wall shape consumes exported position")
	var start: Vector2 = world.call("get_start_position")
	var exit_point: Vector2 = world.call("get_exit_position")
	_check(start == Vector2(4020, 7420) and exit_point == Vector2(4020, 300) and start.y > exit_point.y, "canonical south START / north EXIT")
	_check(world.call("can_move", start, 15.0) and world.call("can_move", exit_point, 15.0), "START/EXIT admit native player four-corner collision samples")
	_check(world.call("is_world_blocked", Vector2(-1, 300)) and world.call("is_world_blocked", Vector2(8000, 300)), "outside-world wall guard")
	var reachable := PackedByteArray()
	reachable.resize(40000)
	reachable.fill(0)
	var queue: Array[int] = [int(start.y / 40.0) * 200 + int(start.x / 40.0)]
	reachable[queue[0]] = 1
	var head := 0
	while head < queue.size():
		var at := queue[head]
		head += 1
		var x := at % 200
		var y := int(at / 200)
		for offset in [Vector2i.RIGHT, Vector2i.LEFT, Vector2i.UP, Vector2i.DOWN]:
			var nx: int = x + offset.x
			var ny: int = y + offset.y
			if nx < 0 or ny < 0 or nx >= 200 or ny >= 200:
				continue
			var index: int = ny * 200 + nx
			if reachable[index] == 0 and int(tiles[index]) != 1:
				reachable[index] = 1
				queue.append(index)
	_check(reachable[int(exit_point.y / 40.0) * 200 + int(exit_point.x / 40.0)] == 1, "tile floor route START→EXIT must remain connected (not a full physical traversal proof)")
	world.queue_free()
	await process_frame


func _test_charge() -> void:
	var player := _make_player()
	var emitted: Array[Dictionary] = []
	player.connect("crescent_requested", func(step: int, frames: float, direction: Vector2) -> void: emitted.append({"step": step, "frames": frames, "direction": direction}))
	for expected_step in [1, 2]:
		_check(player.call("request_attack"), "actual request_attack accepts step%d" % expected_step)
		player.call("release_attack")
		_check(emitted.size() == expected_step and int(emitted[-1]["step"]) == expected_step, "actual consumer emits ordered step%d once" % expected_step)
		_ticks(player, 58)
		_check(player.get("state") == "idle", "native 5F swing+53F recovery returns idle")
	_check(player.call("request_attack") and player.get("state") == "windup", "third request enters native windup")
	var previous := 0
	for boundary in [{"frames": 39, "tier": 0}, {"frames": 40, "tier": 1}, {"frames": 79, "tier": 1}, {"frames": 80, "tier": 2}, {"frames": 119, "tier": 2}, {"frames": 120, "tier": 3}]:
		_ticks(player, int(boundary["frames"]) - previous)
		previous = int(boundary["frames"])
		_check(is_equal_approx(float(player.get("charge_frames")), float(previous)) and int(player.call("charge_tier")) == int(boundary["tier"]), "native charge tier boundary%d" % previous)
		_check(emitted.size() == 2, "holding charge must not auto-fire at boundary%d" % previous)
	_ticks(player, 20)
	_check(float(player.get("charge_frames")) == 120.0 and emitted.size() == 2, "full-charge cap120 does not auto-release")
	player.call("release_attack")
	_check(emitted.size() == 3 and int(emitted[-1]["step"]) == 3 and float(emitted[-1]["frames"]) == 120.0, "release emits actual third held120 packet")
	var expected_damage := [470, 940, 1881, 3763]
	var shot: Node2D
	for tier in range(4):
		shot = load("res://scripts/crescent.gd").new()
		root.add_child(shot)
		shot.set_physics_process(false)
		shot.call("configure", player, 3, float(tier * 40), Vector2.RIGHT, _combat)
		_check(int(shot.get("damage")) == expected_damage[tier], "real projectile raw-mkP damage at tier%d" % tier)
		_check(is_equal_approx(float(shot.get("radius")), 120.0 * (1.0 + tier * 0.4)) and is_equal_approx(float(shot.get("charge_scale")), 1.0 + tier * 0.4), "tier%d native radius/visual scale" % tier)
		_check(float(shot.get("initial_life_frames")) == 25.0, "charge scales damage/size but does not multiply third projectile lifetime")
		shot.queue_free()
	var accessible := _make_player()
	var accessible_emits: Array[Dictionary] = []
	accessible.connect("crescent_requested", func(step: int, frames: float, _direction: Vector2) -> void: accessible_emits.append({"step": step, "frames": frames}))
	for _step in [1, 2]:
		accessible.call("request_attack")
		accessible.call("release_attack")
		_ticks(accessible, 58)
	var space := InputEventKey.new()
	space.physical_keycode = KEY_SPACE
	space.pressed = true
	accessible.call("_unhandled_input", space)
	_check(accessible.get("state") == "windup" and bool(accessible.call("get_snapshot")["accessibility_hold"]), "public Space starts optional third hold after real1→2 combo")
	_ticks(accessible, 40)
	var unrelated_release := InputEventAction.new()
	unrelated_release.action = "weapon"
	unrelated_release.pressed = false
	accessible.call("_unhandled_input", unrelated_release)
	_check(accessible.get("state") == "windup", "LMB release does not cancel an explicitly selected accessibility hold")
	accessible.call("_unhandled_input", space)
	_check(accessible_emits.size() == 3 and int(accessible_emits[-1]["step"]) == 3 and float(accessible_emits[-1]["frames"]) == 40.0 and not bool(accessible.call("get_snapshot")["accessibility_hold"]), "second Space releases same native third40F packet")
	accessible.queue_free()
	player.queue_free()
	await process_frame


func _test_projectile() -> void:
	var player := _make_player()
	player.position = Vector2(100, 100)
	var shot: Area2D = load("res://scripts/crescent.gd").new()
	root.add_child(shot)
	shot.set_physics_process(false)
	shot.call("configure", player, 1, 0.0, Vector2.RIGHT, _combat)
	_check(shot.get_parent() == root and shot.get_parent() != player, "fired crescent owned by world sibling, not cast/player lifetime")
	var life_before := float(shot.get("life_frames"))
	var position_before := shot.global_position
	_check(player.call("request_attack") and player.call("cancel_attack"), "actual active attack Q-cancel accepts")
	_check(not shot.is_queued_for_deletion() and float(shot.get("life_frames")) == life_before and shot.global_position == position_before, "Q cancellation must not erase/restart/move an already-fired projectile")
	player.call("release_attack")
	player.queue_free()
	await process_frame
	var life := life_before
	while life > 1.0:
		shot.call("_physics_process", 1.0 / 60.0)
		life -= 1.0
		_check(not shot.is_queued_for_deletion(), "projectile persists independently after owner deletion until native expiry")
		_check(is_equal_approx(float(shot.get("life_frames")), life), "projectile consumes60Hz ticks, not render count")
	_check(shot.global_position == position_before + Vector2(224, 0), "17F life moves16×14px; owner deletion does not change travel")
	var last_position := shot.global_position
	shot.call("_physics_process", 1.0 / 60.0)
	_check(shot.is_queued_for_deletion() and shot.global_position == last_position, "native expiry occurs before movement on final tick")
	await process_frame


func _test_pause_capture() -> void:
	var player := _make_player()
	player.process_mode = Node.PROCESS_MODE_PAUSABLE
	var hud: CanvasLayer = load("res://scripts/hud.gd").new()
	root.add_child(hud)
	hud.call("bind", player, null)
	await process_frame
	_check(hud.process_mode == Node.PROCESS_MODE_ALWAYS, "HUD must remain active to expose resume")
	var hud_rect: Rect2 = hud.get_node("PublicHUD").get_global_rect()
	for source_path in ["PublicHUD/NativeHPGlobe/ui_globe_hp", "PublicHUD/NativeSPGlobe/ui_globe_mp", "PublicHUD/NativeSkillBar/ui_bar_only"]:
		var original_frame: TextureRect = hud.get_node_or_null(source_path)
		_check(original_frame != null, "original HUD art must be consumed: " + source_path)
		if original_frame != null:
			_check(hud_rect.encloses(original_frame.get_global_rect()), "whole original footer ornament must fit inside actual viewport: %s; root=%s, frame=%s" % [source_path, hud_rect, original_frame.get_global_rect()])
	var pause_count := [0]
	hud.connect("pause_requested", func() -> void: pause_count[0] += 1)
	var public_button: Button = hud.get_node("PublicHUD/PublicActions/PauseResume")
	public_button.emit_signal("pressed")
	hud.call("set_pause_state", true)
	_check(pause_count[0] == 1 and public_button.text.contains("재개") and public_button.focus_mode == Control.FOCUS_NONE, "public pause button signal and resume label cannot swallow movement focus")
	public_button.emit_signal("pressed")
	hud.call("set_pause_state", false)
	_check(pause_count[0] == 2 and public_button.text.contains("일시정지"), "same public control exposes resume roundtrip")
	var capture: Node = load("res://scripts/performance_capture.gd").new()
	root.add_child(capture)
	capture.call("bind", player, null)
	_check(int(capture.call("live_metrics")["sample_count"]) == 0, "no public start means no frame samples")
	capture.call("start_session", {"scope": "regression fixture; not public FPS evidence"})
	for _frame in range(3):
		await process_frame
	await create_timer(0.03, true).timeout
	var samples_before := int(capture.call("live_metrics")["sample_count"])
	_check(samples_before > 0, "normal interval sampled using real monotonic process clock")
	paused = true
	capture.call("set_pause_state", true)
	await create_timer(0.04, true).timeout
	_check(int(capture.call("live_metrics")["sample_count"]) == samples_before, "pause contributes zero frame samples even though capture ALWAYS")
	paused = false
	capture.call("set_pause_state", false)
	await create_timer(0.03, true).timeout
	capture.call("stop_session", "regression_end")
	var report: Dictionary = capture.call("build_report")
	_check(report["session"]["pause_segments"].size() == 1 and float(report["session"]["normal_play_seconds"]) < float(report["session"]["wall_seconds"]), "pause duration separate and excluded from normal length")
	_check(report["runtime"]["max_fps"] == 240 and report["runtime"]["physics_ticks_per_second"] == 60 and not report["runtime"]["gpu_completion_measured"], "actual cap/physics and GPU-unmeasured contract")
	_check(report["save_path"] == "user://qa/latest-session.json" and not report["target"]["guaranteed"], "isolated QA path and no FPS guarantee")
	var known: Array[float] = [4.0, 4.2, 8.0, 17.0]
	var stats: Dictionary = capture.get_script().summarize_samples(known)
	_check(is_equal_approx(stats["median_ms"], 6.1) and stats["p95_ms"] == 17.0 and stats["p99_ms"] == 17.0 and stats["max_ms"] == 17.0, "statistics discriminate median and tail")
	_check(stats["over_4_1666667ms_ratio"] == 0.75 and stats["over_16_7ms_ratio"] == 0.25, "240FPS primary4.1667ms and auxiliary16.7ms thresholds differ")
	# No save_report call: this fixture must not replace the real public session file.
	capture.queue_free()
	hud.queue_free()
	player.queue_free()
	await process_frame


func _test_damage() -> void:
	for packet in [{"raw": 10, "type": "phys", "expected": 9}, {"raw": 10, "type": "magic", "expected": 10}, {"raw": 1000, "type": "phys", "expected": 114}, {"raw": 1000, "type": "magic", "expected": 115}, {"raw": 0, "type": "phys", "expected": 1}]:
		var subject := _make_player()
		var initial: Dictionary = subject.call("get_snapshot")
		_check(initial["hp"] == 350 and initial["base_def"] == 2.0 and initial.get("energy_def", -1.0) == 0.0 and initial["poise"] == 4 and initial["max_poise"] == 4 and initial["iframes"] == 0.0, "actual raw-mkP defense/poise snapshot without invented build")
		subject.call("receive_damage", int(packet["raw"]), str(packet["type"]), Vector2.RIGHT)
		_check(int(subject.get("hp")) == 350 - int(packet["expected"]), "actual hurtP floor/cap/minimum %s%d→%d" % [packet["type"], packet["raw"], packet["expected"]])
		_check(float(subject.get("iframes")) == 0.0 and int(subject.get("poise")) == 3 and subject.get("state") == "stagger", "ordinary hurt resets iframe0, consumes1poise and starts6F stagger")
		_ticks(subject, 5)
		_check(subject.get("state") == "stagger", "ordinary stagger lasts through5ticks")
		_ticks(subject, 1)
		_check(subject.get("state") == "idle", "ordinary stagger ends on6th tick")
		_ticks(subject, 200)
		_check(int(subject.get("poise")) == 3 and int(subject.get("hp")) == 350 - int(packet["expected"]), "no implicit raw poise/HP regeneration")
		subject.queue_free()
	var charging := _make_player()
	var emitted: Array[int] = []
	charging.connect("crescent_requested", func(step: int, _frames: float, _direction: Vector2) -> void: emitted.append(step))
	for _step in [1, 2]:
		charging.call("request_attack")
		charging.call("release_attack")
		_ticks(charging, 58)
	charging.call("request_attack")
	_ticks(charging, 12)
	for hit in range(3):
		charging.call("receive_damage", 10, "phys", Vector2.RIGHT)
		_check(charging.get("state") == "windup" and float(charging.get("charge_frames")) == 12.0 and int(charging.get("poise")) == 3 - hit and emitted.size() == 2, "charging immune to ordinary stagger, hit%d preserves un-fired charge" % (hit + 1))
	charging.call("receive_damage", 10, "phys", Vector2.RIGHT)
	_check(charging.get("state") == "pStun" and float(charging.get("charge_frames")) == 0.0 and int(charging.get("combo_step")) == 0 and int(charging.get("poise")) == 0 and emitted.size() == 2, "fourth poise hit interrupts charge without auto-firing")
	charging.call("release_attack")
	_ticks(charging, 239)
	_check(charging.get("state") == "pStun" and int(charging.get("poise")) == 0 and float(charging.get("iframes")) == 0.0, "native pStun persists239ticks without early poise restore")
	_ticks(charging, 1)
	_check(charging.get("state") == "idle" and int(charging.get("poise")) == 4 and float(charging.get("iframes")) == 60.0, "240th pStun tick restores4poise and grants only stun-end60iframe")
	var restored_hp := int(charging.get("hp"))
	charging.call("receive_damage", 1000, "phys", Vector2.RIGHT)
	_check(int(charging.get("hp")) == restored_hp and int(charging.get("poise")) == 4, "stun-end iframe prevents damage and poise writes")
	_ticks(charging, 59)
	charging.call("receive_damage", 10, "phys", Vector2.RIGHT)
	_check(int(charging.get("hp")) == restored_hp and float(charging.get("iframes")) == 1.0, "iframe lasts through59ticks")
	_ticks(charging, 1)
	charging.call("receive_damage", 10, "phys", Vector2.RIGHT)
	_check(int(charging.get("hp")) == restored_hp - 9 and int(charging.get("poise")) == 3 and float(charging.get("iframes")) == 0.0, "60th tick ends iframe, normal hurt is accepted again")
	charging.queue_free()
	await process_frame
