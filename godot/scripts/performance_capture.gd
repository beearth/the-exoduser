extends Node

## Wall-clock observations of public play. This does not measure GPU completion.
const REPORT_PATH := "user://qa/latest-session.json"
const TARGET_FPS := 240.0
const TARGET_FRAME_MS := 1000.0 / TARGET_FPS
const AUXILIARY_FRAME_MS := 16.7

var _world: Node
var _started := false
var _manual_paused := false
var _session_start_usec := 0
var _session_end_usec := 0
var _last_tick_usec := 0
var _active_start_usec := 0
var _active_total_usec := 0
var _pause_start_usec := 0
var _pause_segments: Array[Dictionary] = []
var _frame_ms: Array[float] = []
var _process_ms: Array[float] = []
var _physics_ms: Array[float] = []
var _projectile_sum := 0
var _projectile_max := 0
var _projectile_samples := 0
var _enemy_projectile_sum := 0
var _enemy_projectile_max := 0
var _enemy_initial := 0
var _enemy_sum := 0
var _enemy_max := 0
var _events: Array[Dictionary] = []
var _metadata: Dictionary = {}
var _viewport_sizes: Array[Vector2i] = []
var _last_frame_ms := 0.0
var _last_process_ms := 0.0
var _last_physics_ms := 0.0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS


func bind(_player: Node, world: Node) -> void:
	_world = world


func start_session(metadata: Dictionary = {}) -> void:
	_started = true
	_metadata = metadata.duplicate(true)
	_session_start_usec = Time.get_ticks_usec()
	_session_end_usec = 0
	_active_total_usec = 0
	_active_start_usec = 0
	_pause_start_usec = 0
	_last_tick_usec = 0
	_pause_segments.clear()
	_frame_ms.clear()
	_process_ms.clear()
	_physics_ms.clear()
	_events.clear()
	_viewport_sizes.clear()
	_projectile_sum = 0
	_projectile_max = 0
	_projectile_samples = 0
	_enemy_projectile_sum = 0
	_enemy_projectile_max = 0
	_enemy_initial = _count_alive_enemies()
	_enemy_sum = 0
	_enemy_max = _enemy_initial
	_sync_pause(_session_start_usec)
	record_event("session_started", {"input": "public_play"})


func stop_session(reason: String = "public_stop") -> void:
	if not _started:
		return
	var now := Time.get_ticks_usec()
	_close_active_segment(now)
	_close_pause_segment(now)
	_session_end_usec = now
	_started = false
	_last_tick_usec = 0
	record_event("session_stopped", {"reason": reason})


func set_pause_state(paused: bool) -> void:
	_manual_paused = paused
	if _started:
		_sync_pause(Time.get_ticks_usec())


func _is_paused() -> bool:
	return _manual_paused or (is_inside_tree() and get_tree().paused)


func _sync_pause(now: int) -> void:
	if _is_paused():
		_close_active_segment(now)
		if _pause_start_usec == 0:
			_pause_start_usec = now
		_last_tick_usec = 0
	else:
		_close_pause_segment(now)
		if _active_start_usec == 0:
			_active_start_usec = now


func _close_active_segment(now: int) -> void:
	if _active_start_usec > 0:
		_active_total_usec += maxi(0, now - _active_start_usec)
		_active_start_usec = 0


func _close_pause_segment(now: int) -> void:
	if _pause_start_usec > 0:
		_pause_segments.append({
			"start_seconds": float(_pause_start_usec - _session_start_usec) / 1000000.0,
			"duration_seconds": float(maxi(0, now - _pause_start_usec)) / 1000000.0,
			"excluded_from_frame_statistics": true,
		})
		_pause_start_usec = 0


func _process(_delta: float) -> void:
	if not _started:
		return
	var now := Time.get_ticks_usec()
	_sync_pause(now)
	if _is_paused():
		return
	var size := Vector2i(get_viewport().get_visible_rect().size)
	if not _viewport_sizes.has(size):
		_viewport_sizes.append(size)
	if _last_tick_usec > 0:
		_last_frame_ms = float(now - _last_tick_usec) / 1000.0
		_frame_ms.append(_last_frame_ms)
		_last_process_ms = Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0
		_last_physics_ms = Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS) * 1000.0
		_process_ms.append(_last_process_ms)
		_physics_ms.append(_last_physics_ms)
		var counts := _projectile_counts()
		var total := int(counts.get("total", 0))
		var enemy := int(counts.get("enemy", 0))
		_projectile_sum += total
		_projectile_max = maxi(_projectile_max, total)
		_enemy_projectile_sum += enemy
		_enemy_projectile_max = maxi(_enemy_projectile_max, enemy)
		var actors := _count_alive_enemies()
		_enemy_sum += actors
		_enemy_max = maxi(_enemy_max, actors)
		_projectile_samples += 1
	_last_tick_usec = now


func _projectile_counts() -> Dictionary:
	if is_instance_valid(_world) and _world.has_method("get_projectile_counts"):
		return _world.call("get_projectile_counts")
	var total := 0
	var enemy := 0
	if is_inside_tree():
		for projectile in get_tree().get_nodes_in_group("crescents"):
			if not projectile.is_queued_for_deletion():
				total += 1
		for projectile in get_tree().get_nodes_in_group("enemy_projectiles"):
			if not projectile.is_queued_for_deletion():
				enemy += 1
				total += 1
	return {"total": total, "enemy": enemy}


func _count_alive_enemies() -> int:
	var enemies: Array = []
	if is_instance_valid(_world) and _world.has_method("get_enemies"):
		enemies = _world.call("get_enemies")
	elif is_inside_tree():
		enemies = get_tree().get_nodes_in_group("enemies")
	var alive := 0
	for enemy in enemies:
		if not is_instance_valid(enemy) or enemy.is_queued_for_deletion():
			continue
		if "alive" in enemy and not bool(enemy.get("alive")):
			continue
		if "hp" in enemy and float(enemy.get("hp")) <= 0.0:
			continue
		alive += 1
	return alive


func record_event(kind: String, data: Dictionary = {}) -> void:
	var now := Time.get_ticks_usec()
	_events.append({
		"kind": kind,
		"session_seconds": float(maxi(0, now - _session_start_usec)) / 1000000.0 if _session_start_usec > 0 else 0.0,
		"paused": _is_paused(),
		"data": _json_safe(data),
	})


func live_metrics() -> Dictionary:
	return {
		"frame_ms": _last_frame_ms,
		"cpu_process_ms": _last_process_ms,
		"cpu_physics_ms": _last_physics_ms,
		"sample_count": _frame_ms.size(),
		"projectile_max": _projectile_max,
		"enemy_projectile_max": _enemy_projectile_max,
		"enemy_max": _enemy_max,
		"paused": _is_paused(),
		"target_fps": TARGET_FPS,
		"gpu_completion_measured": false,
	}


static func summarize_samples(samples: Array[float]) -> Dictionary:
	if samples.is_empty():
		return {"count": 0, "median_ms": null, "p95_ms": null, "p99_ms": null, "max_ms": null, "mean_ms": null, "over_4_1666667ms_ratio": null, "over_16_7ms_ratio": null}
	var ordered: Array[float] = samples.duplicate()
	ordered.sort()
	var sum := 0.0
	var above_target := 0
	var above_auxiliary := 0
	for value in samples:
		sum += value
		if value > TARGET_FRAME_MS:
			above_target += 1
		if value > AUXILIARY_FRAME_MS:
			above_auxiliary += 1
	var count := ordered.size()
	var median := ordered[count / 2] if count % 2 == 1 else (ordered[count / 2 - 1] + ordered[count / 2]) / 2.0
	return {
		"count": count,
		"median_ms": median,
		"p95_ms": ordered[maxi(0, ceili(count * 0.95) - 1)],
		"p99_ms": ordered[maxi(0, ceili(count * 0.99) - 1)],
		"max_ms": ordered[-1],
		"mean_ms": sum / count,
		"over_4_1666667ms_ratio": float(above_target) / count,
		"over_16_7ms_ratio": float(above_auxiliary) / count,
	}


func build_report() -> Dictionary:
	var now := _session_end_usec if _session_end_usec > 0 else Time.get_ticks_usec()
	var active_usec := _active_total_usec + (maxi(0, now - _active_start_usec) if _active_start_usec > 0 else 0)
	var pauses: Array[Dictionary] = _pause_segments.duplicate(true)
	if _pause_start_usec > 0:
		pauses.append({"start_seconds": float(_pause_start_usec - _session_start_usec) / 1000000.0, "duration_seconds": float(maxi(0, now - _pause_start_usec)) / 1000000.0, "excluded_from_frame_statistics": true})
	var sizes: Array = []
	for size in _viewport_sizes:
		sizes.append({"width": size.x, "height": size.y})
	return {
		"schema": "fdg-godot-public-session-v1",
		"captured_at_utc": Time.get_datetime_string_from_system(true),
		"scope": "Godot native first-play; this machine and observed public session only",
		"session": {"started": _session_start_usec > 0, "running": _started, "wall_seconds": float(maxi(0, now - _session_start_usec)) / 1000000.0 if _session_start_usec > 0 else 0.0, "normal_play_seconds": float(active_usec) / 1000000.0, "pause_segments": pauses, "metadata": _json_safe(_metadata)},
		"wall_frame_intervals": summarize_samples(_frame_ms),
		"cpu_process_monitor": summarize_samples(_process_ms),
		"cpu_physics_process_monitor": summarize_samples(_physics_ms),
		"cpu_monitor_note": "Godot Performance monitors; values may repeat between monitor refreshes. Not GPU completion times.",
		"target": {"render_fps": TARGET_FPS, "frame_budget_ms": TARGET_FRAME_MS, "auxiliary_budget_ms": AUXILIARY_FRAME_MS, "guaranteed": false},
		"viewport_sizes": sizes,
		"projectiles": {"sample_count": _projectile_samples, "max": _projectile_max, "mean": float(_projectile_sum) / _projectile_samples if _projectile_samples > 0 else null, "enemy_max": _enemy_projectile_max, "enemy_mean": float(_enemy_projectile_sum) / _projectile_samples if _projectile_samples > 0 else null},
		"enemies": {"initial": _enemy_initial, "max": _enemy_max, "mean": float(_enemy_sum) / _projectile_samples if _projectile_samples > 0 else null, "sample_count": _projectile_samples},
		"runtime": {"godot": Engine.get_version_info(), "os": OS.get_name(), "processor": OS.get_processor_name(), "display_server": DisplayServer.get_name(), "screen_refresh_hz": DisplayServer.screen_get_refresh_rate(), "max_fps": Engine.max_fps, "physics_ticks_per_second": Engine.physics_ticks_per_second, "vsync_mode": DisplayServer.window_get_vsync_mode(), "rendering_driver": RenderingServer.get_current_rendering_driver_name(), "rendering_method": RenderingServer.get_current_rendering_method(), "gpu_name": RenderingServer.get_video_adapter_name(), "gpu_vendor": RenderingServer.get_video_adapter_vendor(), "gpu_completion_measured": false},
		"events": _events.duplicate(true),
		"save_path": REPORT_PATH,
	}


func save_report() -> String:
	var error := DirAccess.make_dir_recursive_absolute("user://qa")
	if error != OK:
		push_error("Cannot create isolated Godot QA directory: %s" % error)
		return ""
	var output := FileAccess.open(REPORT_PATH, FileAccess.WRITE)
	if output == null:
		push_error("Cannot save isolated Godot QA report: %s" % FileAccess.get_open_error())
		return ""
	output.store_string(JSON.stringify(build_report(), "\t") + "\n")
	output.close()
	return REPORT_PATH


static func _json_safe(value: Variant) -> Variant:
	if value is Vector2 or value is Vector2i:
		return {"x": value.x, "y": value.y}
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
	if value is Object:
		return str(value)
	return value
