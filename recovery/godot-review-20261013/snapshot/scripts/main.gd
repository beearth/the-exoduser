extends Node2D
## Native Godot scene. No WebView, HTTP API or browser save access.

const WorldScript = preload("res://scripts/world.gd")
const PlayerScript = preload("res://scripts/player.gd")
const CrescentScript = preload("res://scripts/crescent.gd")
const HudScript = preload("res://scripts/hud.gd")
const CaptureScript = preload("res://scripts/performance_capture.gd")

var world: Node2D
var player: CharacterBody2D
var hud: CanvasLayer
var capture: Node
var camera: Camera2D
var combat: Dictionary

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	Engine.max_fps = 240
	_register_inputs()
	combat = JSON.parse_string(FileAccess.get_file_as_string("res://data/combat.json"))
	world = WorldScript.new()
	world.name = "CH1CanonicalWorld"
	world.process_mode = Node.PROCESS_MODE_PAUSABLE
	add_child(world)
	if not world.ready_for_player:
		push_error("Canonical initial encounter source was rejected; player startup stopped.")
		return
	player = PlayerScript.new()
	player.name = "Player"
	player.process_mode = Node.PROCESS_MODE_PAUSABLE
	player.z_as_relative = false
	player.position = world.get_start_position()
	player.set_combat(combat)
	add_child(player)
	player.set_world(world)
	world.set_player(player)
	player.crescent_requested.connect(_spawn_crescent)
	player.telemetry_event.connect(_record_event)
	if world.has_signal("telemetry_event"):
		world.telemetry_event.connect(_record_event)
	camera = Camera2D.new()
	camera.name = "GameplayCamera"
	camera.process_mode = Node.PROCESS_MODE_PAUSABLE
	camera.position = player.position
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 7.0
	camera.process_callback = Camera2D.CAMERA2D_PROCESS_PHYSICS
	camera.limit_left = 0
	camera.limit_top = 0
	camera.limit_right = 8000
	camera.limit_bottom = 8000
	add_child(camera)
	camera.make_current()
	camera.reset_smoothing()
	capture = CaptureScript.new()
	capture.name = "PerformanceCapture"
	add_child(capture)
	if capture.has_method("bind"):
		capture.bind(player, world)
	capture.start_session({"source_checkout": "/Users/fordeargamers/Projects/exoduser-migration-20261001", "source_parent": "9a4534b42f74093095ebc3364a25dd104e93b379", "source_mode": "CH1-1 mkP Lv1 NORMAL, canonical initial encounter factory with explicit partial support", "initial_encounter_factory": _encounter_summary(), "target": "our Steam minimum class / 1920x1080 / 240FPS", "measurement_device": "Apple M5 Pro / 24 GiB / macOS arm64", "low_spec_windows_measured": false})
	hud = HudScript.new()
	hud.name = "HUD"
	add_child(hud)
	hud.bind(player, world)
	hud.pause_requested.connect(_toggle_pause)
	hud.restart_requested.connect(_restart)
	var metrics_timer := Timer.new()
	metrics_timer.wait_time = 0.1
	metrics_timer.process_mode = Node.PROCESS_MODE_ALWAYS
	metrics_timer.timeout.connect(func() -> void: hud.set_telemetry(capture.live_metrics()))
	add_child(metrics_timer)
	metrics_timer.start()
	_record_event("native_factory_created", {"source": "canonical migration mkP / CH1-1", "simulation_hz": 60, "render_target_fps": 240, "initial_state": _play_state()})
	print("GODOT_FIRST_PLAYABLE_READY ", JSON.stringify({"runtime": Engine.get_version_info()["string"], "scene": "res://scenes/main.tscn", "viewport": get_viewport_rect().size, "player_spawn": player.position}))

func _physics_process(_delta: float) -> void:
	if not get_tree().paused and is_instance_valid(player) and is_instance_valid(camera):
		player.z_index = clampi(int(player.position.y / 4.0), -4096, 4095)
		camera.position = player.position

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("pause"):
		_toggle_pause()
		get_viewport().set_input_as_handled()

func _spawn_crescent(step: int, charge_frames: float, direction: Vector2) -> void:
	if get_tree().get_nodes_in_group("crescents").size() >= int(combat.get("kiSlash", {}).get("pool_max", 16)):
		_record_event("crescent_pool_full", {"native_pool_limit": 16})
		return
	var crescent = CrescentScript.new()
	crescent.name = "KiSlash"
	crescent.process_mode = Node.PROCESS_MODE_PAUSABLE
	add_child(crescent)
	if crescent.has_signal("telemetry_event"):
		crescent.telemetry_event.connect(_record_event)
	crescent.configure(player, step, charge_frames, direction, combat)

func _toggle_pause() -> void:
	get_tree().paused = not get_tree().paused
	hud.set_pause_state(get_tree().paused)
	if capture.has_method("set_pause_state"):
		capture.set_pause_state(get_tree().paused)
	_record_event("pause_changed", {"paused": get_tree().paused, "state": _play_state()})
	if get_tree().paused and capture.has_method("save_report"):
		capture.save_report()

func _restart() -> void:
	if capture.has_method("save_report"):
		capture.save_report()
	get_tree().paused = false
	get_tree().reload_current_scene()

func _record_event(kind: String, data: Dictionary) -> void:
	if is_instance_valid(capture):
		capture.record_event(kind, data)

func _play_state() -> Dictionary:
	var enemies: Array = []
	if is_instance_valid(world):
		for enemy in world.get_enemies():
			if is_instance_valid(enemy):
				enemies.append({"id": enemy.name, "hp": enemy.hp, "alive": enemy.alive, "position": enemy.position, "state": enemy.state})
	return {"player": player.get_snapshot() if is_instance_valid(player) else {}, "enemies": enemies, "crescents": get_tree().get_nodes_in_group("crescents").size(), "enemy_projectiles": get_tree().get_nodes_in_group("enemy_projectiles").size(), "encounter_factory": _encounter_summary()}

func _encounter_summary() -> Dictionary:
	if not is_instance_valid(world) or not world.has_method("get_encounter_report"):
		return {}
	var report: Dictionary = world.get_encounter_report()
	var records: Array = []
	for record in report.get("records", []):
		records.append({"order": record.get("order"), "id": record.get("id"), "etype": record.get("etype"), "status": record.get("status"), "reason": record.get("reason")})
	return {"installed": report.get("installed", false), "source_count": report.get("source_count", 0), "supported_count": report.get("supported_count", 0), "unsupported_count": report.get("unsupported_count", 0), "records": records}

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		if is_instance_valid(capture) and capture.has_method("save_report"):
			capture.save_report()

func _register_inputs() -> void:
	var keys = {"move_left": KEY_A, "move_right": KEY_D, "move_up": KEY_W, "move_down": KEY_S, "cancel_charge": KEY_Q, "pause": KEY_ESCAPE}
	for action in keys:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
			var key := InputEventKey.new()
			key.physical_keycode = keys[action]
			InputMap.action_add_event(action, key)
	if not InputMap.has_action("weapon"):
		InputMap.add_action("weapon")
		var mouse := InputEventMouseButton.new()
		mouse.button_index = MOUSE_BUTTON_LEFT
		InputMap.action_add_event("weapon", mouse)
