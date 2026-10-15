extends SceneTree
## Only fresh readonly observer fixtures; no native Main/World/combat bootstrap.

const DELIVERY = preload("res://scripts/web_delivery.gd")
const CASES = ["readonly_observation_detached", "readiness_owner_boundaries"]

class PlayerSample extends Node2D:
	var values: Dictionary
	var mutation_calls = 0
	func _init() -> void:
		values = {"hp": 23, "max_hp": 37, "position": Vector2(12.5, 21.25), "state": "idle", "stamina": 9, "max_stamina": 14, "combo_step": 1, "charge_frames": 0, "charge_tier": 0, "accessibility_hold": false}
	func get_snapshot() -> Dictionary:
		return values
	func receive_damage(_amount: int) -> void:
		mutation_calls += 1
	func request_attack() -> void:
		mutation_calls += 1

class EnemySample extends Node2D:
	var hp = 17
	var max_hp = 29
	var state = "idle"
	var alive = true
	var eShield = 8
	var eShieldMax = 8
	var charge_ticks = 0
	var etype = 4
	var element = "fixture"
	func _init() -> void:
		position = Vector2(30, 40)

class WorldSample extends Node2D:
	var registry: Array = []
	var report: Dictionary = {"installed": true, "source_count": 16, "supported_count": 5, "unsupported_count": 11, "records": [{"opaque_fixture": [Vector2(2, 3), {"value": 7}]}]}
	var report_reads = 0
	var mutation_calls = 0
	func _init() -> void:
		var enemy = EnemySample.new()
		enemy.name = "ReadonlyEnemySample"
		add_child(enemy)
		registry.append(enemy)
	func get_enemies() -> Array:
		return registry
	func get_encounter_report() -> Dictionary:
		report_reads += 1
		return report
	func install_native_encounters(_data: Variant) -> void:
		mutation_calls += 1
	# Intentionally no get_projectile_counts: the real source World lacks it.

class CaptureSample extends Node:
	var metrics: Dictionary = {"sample": {"intervals": [4.2, 4.6], "point": Vector2(5, 8)}, "paused": true}
	var report_writes = 0
	func live_metrics() -> Dictionary:
		return metrics
	func save_report() -> void:
		report_writes += 1

class MainSample extends Node2D:
	var player: PlayerSample
	var world: WorldSample
	var capture: CaptureSample
	var mutation_calls = 0
	func _init(include_player: bool = true, include_world: bool = true) -> void:
		if include_player:
			player = PlayerSample.new()
			player.name = "Player"
			add_child(player)
		if include_world:
			world = WorldSample.new()
			world.name = "CH1CanonicalWorld"
			add_child(world)
		capture = CaptureSample.new()
		capture.name = "PerformanceCapture"
		add_child(capture)
	func _toggle_pause() -> void:
		mutation_calls += 1
	func _restart() -> void:
		mutation_calls += 1

var _case = ""
var _failures = 0
var _passes = 0
var _incomplete: Array[String] = []
var _selected: Array[String] = []

func _initialize() -> void:
	paused = true
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			for name in argument.trim_prefix("--only=").split(","):
				_selected.append(name)
	call_deferred("_run")

func _run() -> void:
	for name in CASES:
		if not _selected.is_empty() and name not in _selected:
			continue
		_case = name
		var before = _failures
		var complete: Variant = call("_" + name)
		if complete != true:
			_incomplete.append(name)
			_check(false, "fixture did not finish its observer assertions")
		if before == _failures:
			_passes += 1
			print("PASS " + name)
		else:
			print("FAIL " + name)
	print("GODOT_WEB_DELIVERY_RESULT " + JSON.stringify({"passed": _passes, "failed_assertions": _failures, "incomplete_groups": _incomplete, "only": _selected, "physics_method_calls": 0, "automatic_native_simulation_ticks": 0, "native_main_instances": 0, "native_factory_calls": 0, "user_report_writes": 0, "GUI_or_browser_inputs": 0, "source_or_PNG_hashes": 0, "previous_suites": 0, "JavaScript_installation_evidence": false, "actual_Web_play_evidence": false, "performance_evidence": false}))
	quit(0 if _failures == 0 else 1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		_failures += 1
		print("ASSERT " + _case + ": " + message)

func _poison(value: Variant) -> void:
	if value is Dictionary:
		for key in value.keys():
			_poison(value[key])
		value.clear()
	elif value is Array:
		for item in value:
			_poison(item)
		value.clear()

func _readonly_observation_detached() -> bool:
	var scene = MainSample.new()
	root.add_child(scene)
	current_scene = scene
	var bridge = DELIVERY.new()
	root.add_child(bridge)
	var crescent = Node.new()
	scene.add_child(crescent)
	crescent.add_to_group("crescents")
	var hostile = Node.new()
	scene.add_child(hostile)
	hostile.add_to_group("enemy_projectiles")
	var queued_hostile = Node.new()
	scene.add_child(queued_hostile)
	queued_hostile.add_to_group("enemy_projectiles")
	queued_hostile.queue_free()
	var player_before = scene.player.values.duplicate(true)
	var report_before = scene.world.report.duplicate(true)
	var metrics_before = scene.capture.metrics.duplicate(true)
	var first: Dictionary = bridge.get_observation()
	_check(first["schema"] == "fdg-godot-web-observation-v1" and first["ready"] == true, "real getter sees the fresh owner graph")
	_check(first["paused"] == true and paused == true, "observer reads pause without changing it")
	_check(first["player"]["position"] == [12.5, 21.25] and first["performance"]["sample"]["point"] == [5.0, 8.0], "real JSON serializer converts owner Vector2 values")
	_check(first["projectiles"] == {"total": 2, "enemy": 1, "crescents": 1}, "missing World API uses real live groups, excluding a queued fixture node")
	_check(first["enemies"].size() == 1 and first["enemies"][0]["hp"] == 17 and first["enemies"][0]["position"] == [30.0, 40.0], "getter reads existing enemy owner properties")
	_check(not first["encounter_factory"].has("records") and first["encounter_factory"].size() == 4, "factory observation retains only scalar summary, not raw records")
	var before_fields: Dictionary = {}
	for key in ["player", "enemies", "projectiles", "encounter_factory", "performance"]:
		before_fields[key] = first[key].duplicate(true)
	_poison(first)
	var second: Dictionary = bridge.get_observation()
	for key in before_fields:
		_check(second[key] == before_fields[key], "mutating a caller snapshot preserves future observation: " + key)
	_check(scene.player.values == player_before and scene.world.report == report_before and scene.capture.metrics == metrics_before, "all constructor owner data stays unchanged")
	_check(scene.world.report_reads == 1, "raw encounter report is read once per owner, not every poll")
	_check(scene.mutation_calls == 0 and scene.player.mutation_calls == 0 and scene.world.mutation_calls == 0 and scene.capture.report_writes == 0, "observer never calls gameplay/pause/install/save methods")
	_check(second["storage_scope"]["observed_web_platform"] == false and second["storage_scope"]["browser_virtual_userfs"] == false, "native fixture does not claim actual browser storage")
	_check(second["storage_scope"]["native_usersave_access"] == false and second["storage_scope"]["mac_latest_session_access"] == false and second["storage_scope"]["original_slots_api_access"] == false, "observer API exposes no original save-access capability")
	_check(bridge.process_mode == Node.PROCESS_MODE_ALWAYS, "readonly observer can publish while real gameplay is paused")
	bridge.free()
	current_scene = null
	scene.free()
	return true

func _readiness_owner_boundaries() -> bool:
	var bridge = DELIVERY.new()
	var detached: Dictionary = bridge.get_observation()
	_check(detached["ready"] == false and detached["player"].is_empty(), "detached observer has an explicit not-ready snapshot")
	root.add_child(bridge)
	var no_scene: Dictionary = bridge.get_observation()
	_check(no_scene["ready"] == false and no_scene["enemies"].is_empty(), "current_scene absence is safe and not ready")
	for pair in [[true, false], [false, true]]:
		var scene = MainSample.new(pair[0], pair[1])
		root.add_child(scene)
		current_scene = scene
		var partial: Dictionary = bridge.get_observation()
		_check(partial["ready"] == false, "partial player/world ownership stays explicitly not ready")
		_check(scene.mutation_calls == 0 and scene.capture.report_writes == 0 and paused == true, "partial ownership never starts/restarts/unpauses/saves a game")
		current_scene = null
		scene.free()
	bridge.free()
	_check(root.get_child_count() == 0, "fresh fixtures are removed without a native scene bootstrap")
	return true
