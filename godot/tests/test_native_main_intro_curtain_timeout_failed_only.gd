extends SceneTree
## Retry ONLY the failed actual Main wallclock timeout assertion.

const NativeMainScript = preload("res://scripts/main.gd")
const RESULT_MARKER := "NATIVE_MAIN_INTRO_CURTAIN_TIMEOUT_FAILED_ONLY"
const WALL_DEADLINE_MS := 1200
const TIMER_WAIT_SECONDS := 0.05

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var main: Node = NativeMainScript.new()
	root.add_child(main)
	if not main.is_node_ready():
		await main.ready
	await process_frame
	var view: Variant = main.call("get_native_intro_curtain_view")
	var callback: Dictionary = {"calls": 0, "info": {}}
	var observations: Dictionary = {"source_g_on_before": _source_on(main),
		"wall_deadline_ms": WALL_DEADLINE_MS, "timer_wait_seconds": TIMER_WAIT_SECONDS,
		"timer_returns": 0, "classification": "UNCLASSIFIED_PENDING_PRIMARY_REVIEW"}
	if typeof(view) != TYPE_OBJECT or not is_instance_valid(view) or not (view is Control):
		observations["missing_actual_view"] = true
		main.free()
		_finish(false, observations)
		return
	paused = true
	observations["before_open"] = _public_observation(view, callback)
	var closed: bool = view.call("show_closed") == true
	var done := func(info: Dictionary) -> void:
		callback["calls"] += 1
		callback["info"] = info.duplicate(true)
	var wall_start: int = Time.get_ticks_msec()
	var opened: bool = view.call("open", done) == true
	observations["closed_then_opened"] = closed and opened
	var deadline: int = wall_start + WALL_DEADLINE_MS
	# SceneTreeTimer may consume a pre-existing frame delta. The stop condition
	# is the actual monotonic wall clock used by the unmodified original view.
	while Time.get_ticks_msec() < deadline:
		await create_timer(TIMER_WAIT_SECONDS, true).timeout
		observations["timer_returns"] += 1
		if observations["timer_returns"] == 1:
			observations["first_timer_return_wall_delta_ms"] = Time.get_ticks_msec() - wall_start
			observations["after_first_timer"] = _public_observation(view, callback)
	observations["actual_wall_delta_ms"] = Time.get_ticks_msec() - wall_start
	observations["after_deadline"] = _public_observation(view, callback)
	observations["source_g_on_after"] = _source_on(main)
	var info: Dictionary = callback["info"]
	var passed: bool = callback["calls"] == 1 and int(info.get("elapsed_ms", 0)) >= 900 \
		and info.get("transition_done") == true and not view.visible
	paused = false
	main.free()
	_finish(passed, observations)

func _public_observation(view: Control, callback: Dictionary) -> Dictionary:
	return {"wall_ticks_ms": Time.get_ticks_msec(), "elapsed_ms": view.call("elapsed_ms"),
		"phase": view.get("phase"), "processing": view.is_processing(), "visible": view.visible,
		"tree_paused": paused, "engine_process_frame": Engine.get_process_frames(),
		"callback_calls": callback["calls"], "callback_info": callback["info"].duplicate(true)}

func _source_on(main: Node) -> Variant:
	var source_state: Variant = main.get("source_state")
	if typeof(source_state) != TYPE_OBJECT or not is_instance_valid(source_state):
		return null
	var current: Variant = source_state.call("read_current_g")
	return current.get("on") if current is Dictionary else null

func _finish(passed: bool, observations: Dictionary) -> void:
	print(RESULT_MARKER + " " + JSON.stringify({"status": "PASS" if passed else "FAIL", "checks": 1,
		"case": "actual_wallclock_timeout_hides_view_and_calls_once", "actual_main_constructors": 1,
		"observations": observations, "source_origin": "actual_native_Main_existing_HUD_original_intro_curtain_view",
		"successful_cases_replayed": 0, "source_controller_bound": false,
		"source_iframes_600_proven": false, "gpu_render": "NOT_PROVEN", "public_play_proven": false}))
	quit(0 if passed else 1)
