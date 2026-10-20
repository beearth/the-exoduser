extends SceneTree
## New actual Main UI consumer only. No old view or Main suites are executed.

const NativeMainScript = preload("res://scripts/main.gd")
const RESULT_MARKER := "NATIVE_MAIN_INTRO_CURTAIN_FIRST"

var _checks: Array[Dictionary] = []

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	# Same cold instance enters the Tree: exactly one actual Main constructor.
	var main: Node = NativeMainScript.new()
	var cold_view: Variant = main.call("get_native_intro_curtain_view")
	var cold: Dictionary = main.call("get_native_intro_curtain_snapshot")
	_check(cold_view == null and cold.get("status") == "NOT_READY", "cold_main_has_no_bound_curtain")
	root.add_child(main)
	if not main.is_node_ready():
		await main.ready
	await process_frame
	var view: Variant = main.call("get_native_intro_curtain_view")
	var hud: Variant = main.get("hud")
	var live: bool = typeof(view) == TYPE_OBJECT and is_instance_valid(view) and view is Control
	_check(live and is_instance_valid(hud) and view.get_parent() == hud and view.get_tree() == main.get_tree(), "curtain_is_actual_existing_hud_child")
	var startup: Dictionary = main.call("get_native_intro_curtain_snapshot")
	_check(live and not view.visible and startup.get("status") == "READY", "main_binds_view_hidden_without_starting_intro")
	if not live:
		main.free()
		_finish({})
		return
	_check(view.process_mode == Node.PROCESS_MODE_ALWAYS and view.mouse_filter == Control.MOUSE_FILTER_IGNORE, "native_view_uses_wallclock_processing_and_ignores_pointer")
	_check(_named_children(main, "Player") == 1 and _named_children(hud, "SourceIntroCurtain") == 1, "binding_adds_one_view_without_duplicate_player")
	_check(_narrow_scope(startup), "ui_service_does_not_claim_controller_gpu_or_full_play")
	var source_state: Variant = main.get("source_state")
	var source_before: Variant = source_state.call("read_current_g") if is_instance_valid(source_state) else null
	var initial_on: Variant = source_before.get("on") if source_before is Dictionary else null
	_check(source_before is Dictionary and initial_on == false, "actual_source_g_on_is_false_before_ui_actions")
	_check(view.call("show_closed") == true and view.visible and is_zero_approx(float(view.call("progress"))), "actual_hud_curtain_can_close")
	var callback: Dictionary = {"calls": 0, "info": {}}
	var done := func(info: Dictionary) -> void:
		callback["calls"] += 1
		callback["info"] = info.duplicate(true)
	# This is the NEW isolated SceneTree, not any human paused app or browser.
	paused = true
	var wall_start: int = Time.get_ticks_msec()
	_check(view.call("open", done) == true and view.is_processing() and paused, "native_ui_opens_while_its_isolated_game_tree_is_paused")
	# P2-001h 정정: SceneTreeTimer는 부트 직후 부풀어 있는 프레임 delta를 먼저 소화해
	# 벽시계 1.05s 전에 조기 반환한다(동봉 재시도 테스트 _timeout_failed_only의 기록과
	# 동일 원인). 원본 기준은 setTimeout 900ms = 모노토닉 벽시계이고 뷰도
	# Time.get_ticks_msec 기준이므로 대기 종료 조건을 벽시계 데드라인으로 맞춘다.
	while Time.get_ticks_msec() < wall_start + 1050:
		await create_timer(0.05, true).timeout
	var info: Dictionary = callback["info"]
	_check(callback["calls"] == 1 and int(info.get("elapsed_ms", 0)) >= 900 \
		and info.get("transition_done") == true and not view.visible, "actual_wallclock_timeout_hides_view_and_calls_once")
	var source_after: Variant = source_state.call("read_current_g")
	_check(source_after is Dictionary and source_after.get("on") == false and initial_on == false, "display_callback_does_not_activate_source_game")
	var canceled: Dictionary = {"calls": 0}
	var canceled_done := func(_info: Dictionary) -> void:
		canceled["calls"] += 1
	var cancel_opened: bool = view.call("show_closed") == true and view.call("open", canceled_done) == true
	view.call("hide_now")
	var cancel_wall_start: int = Time.get_ticks_msec()
	while Time.get_ticks_msec() < cancel_wall_start + 1050: # 동일 벽시계 데드라인 (P2-001h 정정)
		await create_timer(0.05, true).timeout
	_check(cancel_opened and canceled["calls"] == 0 and not view.visible and not view.is_processing(), "hide_cancels_new_open_callback_after_real_timeout")
	_check(main.call("get_native_intro_curtain_view") == view and main.call("get_native_intro_curtain_snapshot").get("status") == "READY", "hidden_view_keeps_actual_main_hud_custody")
	view.call("terminate")
	var terminated: Dictionary = main.call("get_native_intro_curtain_snapshot")
	_check(main.call("get_native_intro_curtain_view") == null and terminated.get("status") == "NOT_READY", "queued_terminated_view_revokes_public_readiness_immediately")
	_check(_narrow_scope(terminated), "termination_keeps_unproven_controller_and_gpu_scope")
	paused = false
	main.free()
	_finish({"done_calls": callback["calls"], "callback_elapsed_ms": info.get("elapsed_ms"),
		"transition_done": info.get("transition_done"), "canceled_callback_calls": canceled["calls"],
		"source_g_on_before": initial_on, "source_g_on_after": source_after.get("on") if source_after is Dictionary else null})

func _narrow_scope(snapshot: Dictionary) -> bool:
	return snapshot.get("source_controller_bound") == false and snapshot.get("full_main_ready") == false \
		and snapshot.get("public_play_proven") == false and snapshot.get("gpu_render") == "NOT_PROVEN" \
		and snapshot.get("parent_z45_bound") == false

func _named_children(parent: Node, node_name: String) -> int:
	var count: int = 0
	for child in parent.get_children():
		if child.name == node_name:
			count += 1
	return count

func _check(ok: bool, name: String) -> void:
	_checks.append({"name": name, "pass": ok})

func _finish(observed: Dictionary) -> void:
	var failed: Array = []
	for check in _checks:
		if not check["pass"]:
			failed.append(check)
	print(RESULT_MARKER + " " + JSON.stringify({"status": "PASS" if failed.is_empty() else "FAIL",
		"checks": _checks.size(), "failed": failed, "actual_main_constructors": 1,
		"source_origin": "actual_native_Main_existing_HUD_original_intro_curtain_view",
		"observed": observed, "readiness_scope": "native_ui_service", "source_controller_bound": false,
		"source_iframes_600_proven": false, "gpu_render": "NOT_PROVEN", "public_play_proven": false,
		"successful_suites_replayed": 0}))
	quit(0 if failed.is_empty() else 1)
