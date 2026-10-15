extends Node

# Staging-only Web autoload. Observes public getters/signals; it does not call
# gameplay actions, advance clocks, or access files, saves, settings or APIs.
const SCHEMA = "fdg-godot-web-observation-v1"
const PUBLISH_INTERVAL_SECONDS = 0.1
const RECENT_EVENT_LIMIT = 25
var _window: Variant = null
var _publish_elapsed = 0.0
var _observed_scene: Node
var _connected_ids: Dictionary = {}
var _recent_events: Array[Dictionary] = []
var _encounter_world_id = 0
var _encounter_summary: Dictionary = {}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	if OS.has_feature("web"):
		_window = JavaScriptBridge.get_interface("window")
	else:
		set_process(false)

func _process(delta: float) -> void:
	_publish_elapsed += delta
	if _publish_elapsed < PUBLISH_INTERVAL_SECONDS:
		return
	_publish_elapsed = 0.0
	var scene = get_tree().current_scene
	_bind_observed_sources(scene)
	if _window != null and _window.fdgNativeObserve != null:
		_window.fdgNativeObserve(JSON.stringify(get_observation()))

func _bind_observed_sources(scene: Node) -> void:
	if scene != _observed_scene:
		_observed_scene = scene
		_connected_ids.clear()
		_recent_events.clear()
	if not is_instance_valid(scene):
		return
	for property in ["player", "world"]:
		if property in scene:
			var source: Variant = scene.get(property)
			if is_instance_valid(source) and source is Node and source.has_signal("telemetry_event") and not _connected_ids.has(source.get_instance_id()):
				source.connect("telemetry_event", _observe_telemetry)
				_connected_ids[source.get_instance_id()] = true

func _observe_telemetry(kind: String, data: Dictionary) -> void:
	_recent_events.append({"kind": kind, "data": _json_safe(data)})
	if _recent_events.size() > RECENT_EVENT_LIMIT:
		_recent_events.pop_front()

func get_observation() -> Dictionary:
	var scene: Node = get_tree().current_scene if is_inside_tree() else null
	var player: Variant = scene.get("player") if is_instance_valid(scene) and "player" in scene else null
	var world: Variant = scene.get("world") if is_instance_valid(scene) and "world" in scene else null
	var capture: Variant = scene.get("capture") if is_instance_valid(scene) and "capture" in scene else null
	var player_snapshot: Dictionary = {}
	if is_instance_valid(player) and player.has_method("get_snapshot"):
		var actual: Dictionary = player.call("get_snapshot")
		for key in ["hp", "max_hp", "stamina", "max_stamina", "position", "state", "combo_step", "charge_frames", "charge_tier", "accessibility_hold"]:
			if actual.has(key):
				player_snapshot[key] = actual[key]
	var enemies: Array = []
	if is_instance_valid(world) and world.has_method("get_enemies"):
		for enemy in world.call("get_enemies"):
			if not is_instance_valid(enemy) or enemy.is_queued_for_deletion():
				continue
			var snapshot: Dictionary = {"id": str(enemy.name)}
			for key in ["hp", "max_hp", "state", "alive", "eShield", "eShieldMax", "charge_ticks", "etype", "element"]:
				if key in enemy:
					snapshot[key] = enemy.get(key)
			if enemy is Node2D:
				snapshot["position"] = [enemy.global_position.x, enemy.global_position.y]
			enemies.append(snapshot)
	var projectiles: Dictionary = {}
	if is_instance_valid(world) and world.has_method("get_projectile_counts"):
		projectiles = world.call("get_projectile_counts")
	elif is_inside_tree():
		var crescents = _count_live_group("crescents")
		var hostile = _count_live_group("enemy_projectiles")
		projectiles = {"total": crescents + hostile, "enemy": hostile, "crescents": crescents}
	var factory = _read_cached_encounter_summary(world)
	var performance: Dictionary = {}
	if is_instance_valid(capture) and capture.has_method("live_metrics"):
		performance = capture.call("live_metrics")
	return _json_safe({
		"schema": SCHEMA,
		"ready": is_instance_valid(player) and is_instance_valid(world) and not player_snapshot.is_empty(),
		"paused": get_tree().paused if is_inside_tree() else false,
		"player": player_snapshot,
		"enemies": enemies,
		"projectiles": projectiles,
		"encounter_factory": factory,
		"performance": performance,
		"frames": {"drawn": Engine.get_frames_drawn(), "process": Engine.get_process_frames(), "physics": Engine.get_physics_frames(), "scope": "global engine counters, not successful gameplay tick counts"},
		"recent_events": _recent_events.duplicate(true),
		"storage_scope": {"browser_virtual_userfs": OS.has_feature("web"), "observed_web_platform": OS.has_feature("web"), "observed_user_data_dir": OS.get_user_data_dir(), "stage_scope": "WebDelivery is autoloaded only in the Web export staging project", "native_usersave_access": false, "mac_latest_session_access": false, "original_slots_api_access": false, "report": "current main writes QA only to this Web build's virtual user:// on public pause"},
	})

func _read_cached_encounter_summary(world: Variant) -> Dictionary:
	if not is_instance_valid(world):
		return {}
	var world_id: int = world.get_instance_id()
	if world_id != _encounter_world_id:
		_encounter_world_id = world_id
		_encounter_summary.clear()
		# The source getter deep-copies original records. Read it only once per
		# actual world instance, then retain the four scalar summary leaves.
		if world.has_method("get_encounter_report"):
			var report: Dictionary = world.call("get_encounter_report")
			for key in ["installed", "source_count", "supported_count", "unsupported_count"]:
				_encounter_summary[key] = report.get(key)
	return _encounter_summary.duplicate(true)

func _count_live_group(group: String) -> int:
	var count = 0
	for node in get_tree().get_nodes_in_group(group):
		if is_instance_valid(node) and not node.is_queued_for_deletion():
			count += 1
	return count

func _json_safe(value: Variant) -> Variant:
	if value is Vector2 or value is Vector2i:
		return [value.x, value.y]
	if value is Dictionary:
		var result: Dictionary = {}
		for key in value:
			result[str(key)] = _json_safe(value[key])
		return result
	if value is Array:
		var result: Array = []
		for item in value:
			result.append(_json_safe(item))
		return result
	return value
