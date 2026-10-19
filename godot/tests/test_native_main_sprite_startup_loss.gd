extends SceneTree
## New negative-only actual Main startup episode; successful suites stay frozen.

const NativeMainScript = preload("res://scripts/main.gd")
const RESULT_MARKER := "NATIVE_MAIN_SPRITE_STARTUP_LOSS_FIRST"
const EXPECTED_DIAGNOSTIC := "Native source player startup rejected: native_player_sprite_not_ready:target_queued_for_deletion"

var _checks: Array[Dictionary] = []
var _entered_player_count: int = 0
var _fault_calls: int = 0
var _fault_used_actual_warrior: bool = false
var _actual_player_ref: WeakRef
var _actual_world_ref: WeakRef

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var main: Node = NativeMainScript.new()
	# Public lifecycle signals let the original Player construct its own body.
	# The one fault queues only that actual Warrior after Player._ready finishes
	# and before Main's add_child(player) returns to its readiness consumer.
	main.child_entered_tree.connect(_on_main_child_entered_tree)
	root.add_child(main)
	if not main.is_node_ready():
		await main.ready
	var startup: Dictionary = main.call("get_native_player_sprite_startup_snapshot")
	var report: Dictionary = startup.get("report", {})
	_check(_entered_player_count == 1 and _fault_calls == 1, "one_public_lifecycle_fault_on_one_actual_player")
	_check(_fault_used_actual_warrior, "fault_queued_only_original_player_warrior")
	_check(startup.get("startup_readonly_calls") == 1, "startup_inspection_consumed_once")
	_check(report.get("status") == "NOT_READY" and report.get("reason") == "target_queued_for_deletion", "queued_body_rejects_actual_startup")
	_check(_has_error(report, "target_queued_for_deletion"), "frozen_diagnostic_retains_actual_target_loss")
	_check(_holder_missing(main.get("player")) and _holder_missing(main.get("world")) \
		and _weak_missing(_actual_player_ref) and _weak_missing(_actual_world_ref), "new_player_and_world_freed_without_replacements")
	_check(_holder_missing(main.get("camera")) and _holder_missing(main.get("hud")) \
		and _holder_missing(main.get("capture")), "camera_hud_capture_owners_never_created")
	_check(main.get_node_or_null("GameplayCamera") == null and main.get_node_or_null("HUD") == null \
		and main.get_node_or_null("PerformanceCapture") == null, "startup_does_not_continue_into_play_nodes")
	_check(not main.is_physics_processing() and not main.is_processing_unhandled_input(), "rejected_main_physics_and_input_disabled")
	var live: Dictionary = main.call("get_native_player_sprite_readiness")
	_check(live.get("status") == "NOT_READY" and live.get("reason") == "actual_player_missing" \
		and live.get("frames_inspected") == 0 and live.get("targets_inspected") == 0, "live_getter_does_not_use_frozen_report_as_ready")
	var retained: Dictionary = main.call("get_native_player_sprite_startup_snapshot")
	_check(retained.get("startup_readonly_calls") == 1 and retained.get("report") == report, "failure_diagnostic_retained_without_reinspection")
	_check(report.get("readiness_scope") == "native_loaded_resources" \
		and report.get("full_main_ready") == false and report.get("public_play_proven") == false \
		and report.get("source_wait_complete") == "NOT_PROVEN" \
		and report.get("stage_complete_published") == false, "failure_does_not_publish_full_play_or_source_completion")
	main.free()
	_finish()

func _on_main_child_entered_tree(child: Node) -> void:
	if child.name == "CH1CanonicalWorld":
		_actual_world_ref = weakref(child)
	elif child.name == "Player":
		_entered_player_count += 1
		_actual_player_ref = weakref(child)
		child.ready.connect(_queue_original_warrior.bind(child), CONNECT_ONE_SHOT)

func _queue_original_warrior(actual_player: Node) -> void:
	_fault_calls += 1
	var warrior: Node = actual_player.get_node_or_null("Warrior")
	_fault_used_actual_warrior = warrior is AnimatedSprite2D and warrior.get_parent() == actual_player
	if _fault_used_actual_warrior:
		warrior.queue_free()

func _holder_missing(holder: Variant) -> bool:
	return typeof(holder) == TYPE_NIL or (typeof(holder) == TYPE_OBJECT and not is_instance_valid(holder))

func _weak_missing(holder: WeakRef) -> bool:
	return holder != null and holder.get_ref() == null

func _has_error(report: Dictionary, code: String) -> bool:
	for error in report.get("errors", []):
		if error.get("code") == code:
			return true
	return false

func _check(ok: bool, name: String) -> void:
	_checks.append({"name": name, "pass": ok})

func _finish() -> void:
	var failed: Array = []
	for check in _checks:
		if not check["pass"]:
			failed.append(check)
	print(RESULT_MARKER + " " + JSON.stringify({"status": "PASS" if failed.is_empty() else "FAIL",
		"checks": _checks.size(), "failed": failed, "actual_main_constructors": 1,
		"public_lifecycle_faults": _fault_calls, "source_origin": "actual_native_Main_Player_Warrior_lifecycle_loss",
		"expected_push_error_count": 1, "expected_push_error": EXPECTED_DIAGNOSTIC,
		"expected_script_error_count": 0, "successful_suites_replayed": 0,
		"full_main_ready": false, "public_play_proven": false}))
	quit(0 if failed.is_empty() else 1)
